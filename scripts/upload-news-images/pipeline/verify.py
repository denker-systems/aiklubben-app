"""Step 5: Verify — Quality checks, URL validation, image upload, and DB insertion."""

import hashlib
import requests
from pipeline.config import sb, CATEGORIES, BUCKET, FOLDER
from pipeline.models import NewsArticle, AnalyzedArticle, SourceArticle
from pipeline.search import verify_url

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def slug_exists(slug: str) -> bool:
    """Check if a slug already exists in the news table."""
    result = sb.table("news").select("id").eq("slug", slug).execute()
    return bool(result.data)


def verify_article(article: NewsArticle, analysis: AnalyzedArticle) -> list[str]:
    """Run quality checks on a generated article. Returns list of issues."""
    issues = []

    if len(article.title_sv) < 15:
        issues.append("Title too short")
    if len(article.title_sv) > 100:
        issues.append("Title too long")
    if len(article.content_sv) < 300:
        issues.append("Content too short")
    if len(article.summary_sv) < 30:
        issues.append("Summary too short")
    if not article.sources:
        issues.append("No sources")
    if not any(s.url.startswith("http") for s in article.sources):
        issues.append("No valid source URLs")
    if analysis.quality_score < 5:
        issues.append(f"Low quality score: {analysis.quality_score}")
    if slug_exists(article.slug):
        issues.append(f"Slug collision: {article.slug}")

    # Verify at least one source URL is accessible
    has_working_url = False
    for src in article.sources:
        if verify_url(src.url):
            has_working_url = True
            break
    if not has_working_url:
        issues.append("No working source URLs")

    return issues


def download_image(url: str) -> bytes | None:
    """Download an image from URL."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        ct = resp.headers.get("content-type", "")
        if "image" not in ct and "octet" not in ct:
            return None
        if len(resp.content) < 5000:
            return None
        return resp.content
    except Exception:
        return None


def upload_image(image_data: bytes, slug: str) -> str | None:
    """Upload image to Supabase Storage. Returns public URL."""
    filename = f"{FOLDER}/{slug}.jpg"
    try:
        sb.storage.from_(BUCKET).upload(
            filename,
            image_data,
            file_options={"content-type": "image/jpeg", "upsert": "true"},
        )
        return sb.storage.from_(BUCKET).get_public_url(filename)
    except Exception as e:
        print(f"    Upload error: {e}")
        return None


def handle_image(source: SourceArticle, slug: str) -> str | None:
    """Try to download OG image and upload to storage."""
    if not source.og_image:
        return None
    img_data = download_image(source.og_image)
    if not img_data:
        return None
    return upload_image(img_data, slug)


def insert_article(
    article: NewsArticle,
    analysis: AnalyzedArticle,
    source: SourceArticle,
    published_at: str,
    image_url: str | None,
    content_format: str = "news",
) -> bool:
    """Insert the article into the database."""
    cat_id = CATEGORIES.get(article.category, CATEGORIES.get("AI-nyheter"))

    slug = article.slug
    if slug_exists(slug):
        suffix = hashlib.md5(source.url.encode()).hexdigest()[:5]
        slug = f"{slug}-{suffix}"
        if slug_exists(slug):
            print(f"    ✗ Slug collision even with hash: {slug}")
            return False

    # Serialize sources to JSON-compatible dicts
    sources_json = [
        {"name": s.name, "url": s.url, "title": s.title}
        for s in article.sources
    ]

    row = {
        "title": article.title_sv,
        "title_en": article.title_en,
        "slug": slug,
        "summary": article.summary_sv,
        "summary_en": article.summary_en,
        "content": article.content_sv,
        "content_en": article.content_en,
        "analysis": article.analysis_sv,
        "analysis_en": article.analysis_en,
        "image_url": image_url or "/images/ai-news-placeholder.jpg",
        "category_id": cat_id,
        "is_published": True,
        "is_featured": False,
        "published_at": published_at,
        "content_type": "news",
        "content_format": content_format,
        "sources": sources_json,
    }
    try:
        result = sb.table("news").insert(row).execute()
        return bool(result.data)
    except Exception as e:
        print(f"    ✗ DB error: {e}")
        return False
