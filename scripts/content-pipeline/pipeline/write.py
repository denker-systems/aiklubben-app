import os
import re
from google import genai
from pipeline.models import SourcePage, AnalyzedTopic, ContentArticle, SourceReference

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
gemini = genai.Client(api_key=GEMINI_API_KEY)

CURRENT_DATE = "February 2026"


def sanitize_slug(slug: str) -> str:
    slug = slug.lower().strip()
    slug = re.sub(r"[^a-z0-9-]", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")[:80]


def write_content(
    topic_name: str,
    analysis: AnalyzedTopic,
    sources: list[SourcePage],
) -> ContentArticle | None:
    """Use Gemini to write article with inline citations and reference list."""

    # Build numbered source list for the prompt
    source_list = ""
    sources_context = ""
    for i, src in enumerate(sources[:6], 1):
        source_list += f"  [{i}] {src.source_name} — {src.title} ({src.url})\n"
        sources_context += f"""
SOURCE [{i}]: {src.source_name}
Title: {src.title}
URL: {src.url}
Content ({len(src.body)} chars, first 5000):
{src.body[:5000]}
---
"""

    key_facts = "\n".join(f"- {f}" for f in analysis.key_facts)

    prompt = f"""You are a senior tech journalist writing for "AI Klubben", a Swedish educational
platform about AI. Today is {CURRENT_DATE}.

Write a thorough, well-referenced educational article about: **{topic_name}**

TARGET AUDIENCE: Curious, intelligent people (16-60) who want to truly understand AI.

═══════════════════════════════════════════
AVAILABLE SOURCES (use these numbered references):
═══════════════════════════════════════════
{source_list}

═══════════════════════════════════════════
INLINE CITATIONS — THIS IS CRITICAL:
═══════════════════════════════════════════
Every factual claim MUST have an inline citation. Use numbered references like [1], [2].
Place the citation directly after the sentence containing the claim.

GOOD examples:
- "GPT-4o released in May 2024 with native multimodal capabilities [1]."
- "The model achieved 88.7% on MMLU benchmarks [2], surpassing its predecessor."
- "According to Anthropic, Claude uses constitutional AI for alignment [3]."

BAD examples (DO NOT do this):
- "GPT-4o is a powerful model." (no citation — where does this info come from?)
- Putting all citations at the end of a paragraph instead of per-claim
- Using citations only in one section

EVERY section must have multiple citations. Aim for at least 1-2 citations per paragraph.
Use ALL available sources — don't rely on just one.

═══════════════════════════════════════════
ARTICLE STRUCTURE (## headings):
═══════════════════════════════════════════

## Vad är [topic]?
Clear definition with creation date, creator, core purpose. Cite the source. [X]

## Hur fungerar det?
Technical explanation — architecture, training, parameters. Cite specifics. [X]

## Funktioner och kapaciteter
Concrete features: versions, context windows, benchmarks, pricing. Cite each. [X]

## Praktisk användning
Real use cases with specific examples. Cite sources for claims. [X]

## Begränsningar och kritik
Honest weaknesses and controversies. Cite sources. [X]

## Framtidsutsikter
Outlook as of {CURRENT_DATE}. Cite any roadmap claims. [X]

## Referenser

At the END of the article, include a numbered reference list matching your inline citations:

1. [Source Name — "Article Title"](URL)
2. [Source Name — "Article Title"](URL)
...

This section is MANDATORY. Every source you cited must appear here with a clickable link.

═══════════════════════════════════════════
WRITING RULES:
═══════════════════════════════════════════

SWEDISH TEXT (content_sv):
- Natural, fluent Swedish — NOT translated English.
- Use Swedish tech terms where established (maskininlärning, djupinlärning, kontextfönster).
- Write like a knowledgeable friend, use "du" form.
- 800-1200 words including the reference list.
- The reference section heading must be "## Referenser"

ENGLISH TEXT (content_en):
- Write independently in natural English, NOT a translation.
- Same facts and structure, phrased naturally for English readers.
- 800-1200 words including the reference list.
- The reference section heading must be "## References"

TITLES: Specific and engaging. Never generic like "En Djupgående Förklaring".
EXCERPTS: 2-3 punchy sentences with specific facts.
SLUG: Lowercase English, hyphens, 2-4 words.

FORMAT:
- Markdown with ## headings (never #).
- **bold** for key terms on first mention.
- Bullet points for feature lists.
- Real newlines, not escaped \\n.

═══════════════════════════════════════════
KEY FACTS FROM ANALYSIS:
═══════════════════════════════════════════
{key_facts}

TOPIC CONTEXT: {analysis.category}/{analysis.subcategory}

═══════════════════════════════════════════
SOURCE MATERIAL:
═══════════════════════════════════════════
{sources_context}"""

    try:
        response = gemini.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_json_schema": ContentArticle.model_json_schema(),
                "temperature": 0.4,
                "max_output_tokens": 16384,
            },
        )
        article = ContentArticle.model_validate_json(response.text)

        # Sanitize slug
        article.slug = sanitize_slug(article.slug)

        # Fix escaped newlines
        article.content_sv = article.content_sv.replace("\\n", "\n")
        article.content_en = article.content_en.replace("\\n", "\n")
        article.excerpt_sv = article.excerpt_sv.replace("\\n", " ")
        article.excerpt_en = article.excerpt_en.replace("\\n", " ")

        # Ensure all collected sources are in the sources list
        source_urls = {s.url for s in article.sources}
        for src in sources[:6]:
            if src.url not in source_urls:
                article.sources.append(SourceReference(
                    name=src.source_name,
                    url=src.url,
                    title=src.title,
                ))

        return article
    except Exception as e:
        print(f"    Write error: {e}")
        return None
