"""
AI Klubben News Pipeline v3 — Multi-source verified journalism

Flow: Search → Collect → Analyze (with topic dedup) → 
      Collect additional sources → Write (multi-source) → Verify → Insert

Tech stack:
  - Brave Search API for finding real news
  - trafilatura for article extraction
  - Gemini 3 Flash Preview for analysis and writing
  - Supabase for storage and database

Journalism standards:
  - Multiple sources per article when possible
  - All source URLs verified accessible
  - Proper publication names (not domain fragments)
  - Topic deduplication (one article per news event)
  - Inverted pyramid structure
  - Bilingual Swedish/English with proper sourcing section
"""

import time
from pipeline.config import load_categories
from pipeline.search import search_month, brave_web_search
from pipeline.collect import extract_article
from pipeline.analyze import analyze_article
from pipeline.write import write_article
from pipeline.verify import verify_article, handle_image, insert_article

ARTICLES_PER_MONTH = 10

# Generic AI topic keywords — searched each month with date range filtering.
# The pipeline DISCOVERS what actually happened instead of guessing events.
SEARCH_TOPICS = [
    # Major companies
    "OpenAI announcement launch release",
    "Anthropic Claude new model update",
    "Google DeepMind Gemini AI launch",
    "Meta AI Llama model release",
    "NVIDIA AI earnings chip GPU",
    "Microsoft AI Copilot update",
    "Apple AI intelligence update",
    "xAI Grok model release",
    "DeepSeek AI model open source",
    # Domains
    "AI regulation law policy government",
    "AI startup funding investment round",
    "AI safety alignment research breakthrough",
    "AI coding programming developer tool",
    "AI healthcare drug discovery medical",
    "AI image video generation creative",
    "AI agents autonomous enterprise",
    "AI open source model release",
    "AI robotics humanoid",
    "artificial intelligence major news breakthrough",
]

# Months to process
MONTHS = [
    "2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-02",
]


def find_additional_sources(topic_id: str, primary_url: str) -> list:
    """Search for additional sources covering the same topic."""
    # Use topic_id to find more articles about the same event
    query = topic_id.replace("-", " ").replace("2025", "").replace("2026", "").strip()
    results = brave_web_search(f"{query} AI news", count=3)
    additional = []
    for r in results:
        if r["url"] == primary_url:
            continue
        src = extract_article(r["url"], r.get("source_name", ""))
        if src and len(src.body) > 200:
            additional.append(src)
            if len(additional) >= 2:
                break
    return additional


def get_freshness(year_month: str) -> str:
    """Convert year-month to Brave freshness date range."""
    import calendar
    year, month = int(year_month[:4]), int(year_month[5:7])
    last_day = calendar.monthrange(year, month)[1]
    return f"{year_month}-01to{year_month}-{last_day:02d}"


def process_month(year_month: str):
    """Full pipeline for one month with topic deduplication."""
    print(f"\n{'='*60}")
    print(f"  📅 {year_month}")
    print(f"{'='*60}")

    freshness = get_freshness(year_month)
    print(f"  Date filter: {freshness}")

    # Step 1: SEARCH — generic topics with date range
    print(f"\n  [STEP 1: SEARCH]")
    candidates = search_month(SEARCH_TOPICS, freshness=freshness)

    # Topic dedup tracking
    seen_topics: set[str] = set()
    created = 0

    for candidate in candidates:
        if created >= ARTICLES_PER_MONTH:
            break

        url = candidate["url"]
        source_name = candidate.get("source_name", "")
        print(f"\n  [{created+1}/{ARTICLES_PER_MONTH}] {url[:70]}...")

        # Step 2: COLLECT
        source = extract_article(url, source_name)
        if not source or len(source.body) < 200:
            print(f"    ⏭ Skip: insufficient content")
            continue

        print(f"    ✓ Collected: {source.title[:55]}... ({source.source_name})")

        # Step 3: ANALYZE
        analysis = analyze_article(source, year_month)
        if not analysis:
            print(f"    ⏭ Skip: analysis failed")
            continue

        if not analysis.is_relevant:
            print(f"    ⏭ Skip: not relevant (score: {analysis.quality_score})")
            continue

        if analysis.quality_score < 5:
            print(f"    ⏭ Skip: low quality ({analysis.quality_score}/10)")
            continue

        # Topic deduplication
        if analysis.topic_id in seen_topics:
            print(f"    ⏭ Skip: duplicate topic '{analysis.topic_id}'")
            continue

        print(f"    ✓ Analyzed: score={analysis.quality_score}/10, "
              f"topic={analysis.topic_id}, format={analysis.content_format}, "
              f"date={analysis.actual_event_date}")

        # Step 3b: COLLECT additional sources for multi-source verification
        print(f"    🔗 Finding additional sources...")
        additional = find_additional_sources(analysis.topic_id, url)
        if additional:
            print(f"    ✓ Found {len(additional)} additional source(s): "
                  f"{', '.join(s.source_name for s in additional)}")

        # Step 4: WRITE with multi-source
        article = write_article(source, analysis, additional if additional else None)
        if not article:
            print(f"    ⏭ Skip: write failed")
            continue

        print(f"    ✓ Written: {article.title_sv[:55]}...")
        print(f"    📎 {len(article.sources)} source(s): "
              f"{', '.join(s.name for s in article.sources)}")

        # Step 5: VERIFY & INSERT
        issues = verify_article(article, analysis)
        if issues:
            print(f"    ⚠ Issues: {', '.join(issues)}")
            # Skip on blocking issues
            if any(k in i for i in issues for k in ["Slug collision", "Low quality", "No working"]):
                continue

        # Determine publish date
        pub_date = analysis.actual_event_date or source.date
        if not pub_date or not pub_date.startswith(year_month[:4]):
            day = min(28, 2 + created * 3)
            pub_date = f"{year_month}-{day:02d}"
        pub_date_full = f"{pub_date}T12:00:00Z" if "T" not in pub_date else pub_date

        # Handle image
        image_url = handle_image(source, article.slug)
        if image_url:
            print(f"    ✓ Image uploaded")

        # Insert
        success = insert_article(article, analysis, source, pub_date_full, image_url, analysis.content_format)
        if success:
            created += 1
            seen_topics.add(analysis.topic_id)
            print(f"    ✅ Published! ({created}/{ARTICLES_PER_MONTH})")
            time.sleep(0.3)

    print(f"\n  📊 {year_month}: created {created}/{ARTICLES_PER_MONTH} articles")
    return created


def main():
    print("=" * 60)
    print("  AI KLUBBEN — News Pipeline v3")
    print("  Multi-source verified journalism")
    print("  Gemini 3 Flash + trafilatura + Brave Search")
    print("=" * 60)

    load_categories()

    total = 0
    for year_month in MONTHS:
        created = process_month(year_month)
        total += created

    print(f"\n{'='*60}")
    print(f"  ✅ DONE — Created {total} articles total")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
