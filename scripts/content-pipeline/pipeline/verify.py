import requests
from pipeline.models import ContentArticle, AnalyzedTopic, SourcePage
from pipeline.config import sb, slug_exists, get_existing_id, EXISTING_SLUGS
from pipeline.search import verify_url


def verify_content(article: ContentArticle) -> list[str]:
    """Verify article quality before insertion. Returns list of issues."""
    issues = []

    if len(article.title_sv) < 5:
        issues.append("Swedish title too short")
    if len(article.title_en) < 5:
        issues.append("English title too short")
    if len(article.content_sv) < 300:
        issues.append("Swedish content too short")
    if len(article.content_en) < 300:
        issues.append("English content too short")
    if not article.slug or len(article.slug) < 3:
        issues.append("Invalid slug")
    if not article.sources:
        issues.append("No sources")

    # Verify at least one source URL is accessible
    has_working_url = False
    for src in article.sources:
        if verify_url(src.url):
            has_working_url = True
            break
    if not has_working_url:
        issues.append("No working source URLs")

    return issues


def handle_image(source: SourcePage, slug: str) -> str | None:
    """Try to upload OG image to Supabase Storage."""
    if not source.og_image:
        return None

    try:
        resp = requests.get(source.og_image, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        if resp.status_code != 200:
            return None

        content_type = resp.headers.get("content-type", "image/jpeg")
        ext = "jpg"
        if "png" in content_type:
            ext = "png"
        elif "webp" in content_type:
            ext = "webp"

        filename = f"content/{slug}.{ext}"
        sb.storage.from_("images").upload(
            filename, resp.content,
            file_options={"content-type": content_type}
        )

        public_url = sb.storage.from_("images").get_public_url(filename)
        return public_url
    except Exception as e:
        print(f"    Upload error: {e}")
        return None


VALID_CATEGORIES = {"kurser", "plattformar", "event", "resurser"}


def upsert_content(
    article: ContentArticle,
    analysis: AnalyzedTopic,
    image_url: str | None,
) -> str:
    """Insert or update a content article. Returns 'inserted', 'updated', or 'failed'."""
    slug = article.slug

    sources_json = [
        {"name": s.name, "url": s.url, "title": s.title}
        for s in article.sources
    ]

    # Validate category — must be a valid DB enum value
    category = analysis.category
    if category not in VALID_CATEGORIES:
        print(f"    ⚠ Invalid category '{category}', defaulting to 'resurser'")
        category = "resurser"

    row = {
        "title": article.title_sv,
        "title_en": article.title_en,
        "excerpt": article.excerpt_sv,
        "excerpt_en": article.excerpt_en,
        "content": article.content_sv,
        "content_en": article.content_en,
        "category": category,
        "subcategory": analysis.subcategory,
        "tags": analysis.tags,
        "sources": sources_json,
        "status": "published",
    }

    if image_url:
        row["featured_image"] = image_url

    existing_id = get_existing_id(slug)

    try:
        if existing_id:
            # UPDATE existing article
            result = sb.table("content").update(row).eq("id", existing_id).execute()
            if result.data:
                return "updated"
            return "failed"
        else:
            # INSERT new article
            row["slug"] = slug
            result = sb.table("content").insert(row).execute()
            if result.data:
                EXISTING_SLUGS[slug] = result.data[0].get("id")
                return "inserted"
            return "failed"
    except Exception as e:
        print(f"    ✗ DB error: {e}")
        return "failed"
