"""Step 2: Collect — Extract article content using trafilatura with URL verification."""

import re
import trafilatura
from pipeline.models import SourceArticle
from pipeline.search import get_source_name, verify_url


def extract_article(url: str, search_source_name: str = "") -> SourceArticle | None:
    """Download and extract article content from a URL using trafilatura.
    
    Args:
        url: The article URL to extract
        search_source_name: Source name from the search step (used as fallback)
    """
    try:
        # Verify URL is accessible first
        if not verify_url(url):
            return None

        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            return None

        result = trafilatura.extract(
            downloaded,
            include_comments=False,
            include_tables=False,
            favor_recall=True,
            output_format="txt",
        )
        if not result or len(result) < 200:
            return None

        meta = trafilatura.extract_metadata(downloaded)
        title = meta.title if meta and meta.title else ""
        date = meta.date if meta and meta.date else None

        og_image = _extract_og_image(downloaded)

        # Use search-provided source name, or derive from metadata/domain
        source_name = search_source_name
        if not source_name:
            if meta and meta.sitename:
                source_name = meta.sitename
            else:
                from urllib.parse import urlparse
                domain = urlparse(url).netloc.replace("www.", "")
                source_name = get_source_name(domain)

        body = result[:4000]

        return SourceArticle(
            url=url,
            title=title,
            body=body,
            date=date,
            source_name=source_name,
            og_image=og_image,
            url_verified=True,
        )
    except Exception as e:
        print(f"    Extract error: {e}")
        return None


def _extract_og_image(html: str) -> str | None:
    """Extract og:image from raw HTML."""
    if not html:
        return None
    match = re.search(
        r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\'>]+)["\']',
        html[:30000], re.IGNORECASE
    )
    if not match:
        match = re.search(
            r'<meta[^>]+content=["\']([^"\'>]+)["\'][^>]+property=["\']og:image["\']',
            html[:30000], re.IGNORECASE
        )
    if match:
        img = match.group(1)
        if img.startswith("//"):
            img = "https:" + img
        return img
    return None
