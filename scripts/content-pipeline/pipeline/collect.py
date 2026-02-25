import requests
import trafilatura
from pipeline.models import SourcePage
from pipeline.search import get_source_name

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,sv;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
}


def _fetch_html(url: str) -> str | None:
    """Fetch HTML with proper browser headers. Falls back to trafilatura."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15, allow_redirects=True)
        if resp.status_code == 200 and len(resp.text) > 500:
            return resp.text
    except Exception:
        pass
    # Fallback to trafilatura's fetcher
    try:
        return trafilatura.fetch_url(url)
    except Exception:
        return None


def extract_page(url: str, search_source_name: str = "") -> SourcePage | None:
    """Extract content from a URL using requests + trafilatura."""
    try:
        html = _fetch_html(url)
        if not html:
            return None

        text = trafilatura.extract(
            html,
            include_comments=False,
            include_tables=True,
            favor_recall=True,
        )
        if not text or len(text) < 200:
            return None

        meta = trafilatura.extract_metadata(html)

        source_name = search_source_name
        if not source_name:
            if meta and meta.sitename:
                source_name = meta.sitename
            else:
                from urllib.parse import urlparse
                domain = urlparse(url).netloc.replace("www.", "")
                source_name = get_source_name(domain)

        og_image = None
        if meta and meta.image:
            og_image = meta.image

        return SourcePage(
            url=url,
            title=meta.title if meta and meta.title else "",
            body=text,
            source_name=source_name,
            og_image=og_image,
            url_verified=True,
        )
    except Exception as e:
        print(f"    Extract error for {url[:60]}: {e}")
        return None
