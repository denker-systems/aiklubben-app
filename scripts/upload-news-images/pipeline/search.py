"""Step 1: Search — Find real news articles via Brave Search API."""

import time
import requests
from urllib.parse import urlparse
from pipeline.config import BRAVE_API_KEY

HEADERS = {
    "Accept": "application/json",
    "Accept-Encoding": "gzip",
    "X-Subscription-Token": BRAVE_API_KEY,
}

SKIP_DOMAINS = [
    "youtube.com", "twitter.com", "x.com", "reddit.com",
    "facebook.com", "instagram.com", "tiktok.com", "linkedin.com",
    "pinterest.com", "wikipedia.org", "medium.com",
    "quora.com", "stackoverflow.com", "github.com",
]

# Trusted AI news sources with proper display names
TRUSTED_SOURCES = {
    "techcrunch.com": "TechCrunch",
    "theverge.com": "The Verge",
    "arstechnica.com": "Ars Technica",
    "wired.com": "Wired",
    "technologyreview.com": "MIT Technology Review",
    "cnbc.com": "CNBC",
    "reuters.com": "Reuters",
    "bloomberg.com": "Bloomberg",
    "venturebeat.com": "VentureBeat",
    "fortune.com": "Fortune",
    "time.com": "TIME",
    "axios.com": "Axios",
    "bbc.com": "BBC",
    "bbc.co.uk": "BBC",
    "nytimes.com": "The New York Times",
    "washingtonpost.com": "The Washington Post",
    "openai.com": "OpenAI",
    "anthropic.com": "Anthropic",
    "blog.google": "Google Blog",
    "deepmind.google": "Google DeepMind",
    "ai.meta.com": "Meta AI",
    "x.ai": "xAI",
    "nvidia.com": "NVIDIA",
    "nvidianews.nvidia.com": "NVIDIA Newsroom",
    "apple.com": "Apple",
    "microsoft.com": "Microsoft",
    "ai.google.dev": "Google AI",
    "sciencedaily.com": "ScienceDaily",
    "nature.com": "Nature",
}

_last_call_time = 0.0
MIN_INTERVAL = 1.2


def _rate_limit():
    """Enforce rate limiting between API calls."""
    global _last_call_time
    now = time.time()
    elapsed = now - _last_call_time
    if elapsed < MIN_INTERVAL:
        time.sleep(MIN_INTERVAL - elapsed)
    _last_call_time = time.time()


def get_source_name(domain: str) -> str:
    """Get proper publication name from domain."""
    for d, name in TRUSTED_SOURCES.items():
        if d in domain:
            return name
    # Fallback: capitalize first part of domain
    parts = domain.replace("www.", "").split(".")
    return parts[0].title() if parts else domain


def verify_url(url: str) -> bool:
    """Verify a URL is accessible via HEAD request."""
    try:
        resp = requests.head(
            url, timeout=8, allow_redirects=True,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        return resp.status_code < 400
    except Exception:
        return False


def brave_web_search(query: str, count: int = 5, retries: int = 2, freshness: str = "") -> list[dict]:
    """Search Brave Web. Returns list of {title, url, description, domain, source_name}.
    
    Args:
        freshness: Date filter, e.g. "2025-08-01to2025-08-31" or "pm" (past month)
    """
    _rate_limit()
    try:
        params = {"q": query, "count": count, "safesearch": "strict"}
        if freshness:
            params["freshness"] = freshness
        resp = requests.get(
            "https://api.search.brave.com/res/v1/web/search",
            headers=HEADERS,
            params=params,
            timeout=10,
        )
        if resp.status_code == 429:
            if retries > 0:
                print("    ⏳ Rate limited, waiting 5s...")
                time.sleep(5)
                return brave_web_search(query, count, retries - 1)
            return []
        if resp.status_code != 200:
            print(f"    Brave error: {resp.status_code}")
            return []

        results = []
        for r in resp.json().get("web", {}).get("results", []):
            url = r.get("url", "")
            domain = urlparse(url).netloc.replace("www.", "")
            if any(d in domain for d in SKIP_DOMAINS):
                continue
            results.append({
                "title": r.get("title", ""),
                "url": url,
                "description": r.get("description", ""),
                "domain": domain,
                "source_name": get_source_name(domain),
            })
        return results
    except Exception as e:
        print(f"    Search error: {e}")
        return []


def rank_results(results: list[dict]) -> list[dict]:
    """Rank results: trusted sources first, then by domain variety."""
    trusted_list = list(TRUSTED_SOURCES.keys())

    def score(r):
        domain = r.get("domain", "")
        for i, trusted in enumerate(trusted_list):
            if trusted in domain:
                return i
        return 100
    return sorted(results, key=score)


def search_month(queries: list[str], freshness: str = "", max_per_query: int = 4) -> list[dict]:
    """Search all queries for a month, deduplicate and rank results.
    
    Args:
        queries: List of search queries
        freshness: Brave freshness filter, e.g. "2025-08-01to2025-08-31"
    """
    seen_urls = set()
    all_results = []

    for query in queries:
        print(f"  🔍 {query[:70]}...")
        results = brave_web_search(query, count=max_per_query, freshness=freshness)
        for r in results:
            url = r["url"]
            if url not in seen_urls:
                seen_urls.add(url)
                all_results.append(r)

    ranked = rank_results(all_results)
    print(f"  Found {len(ranked)} unique URLs (ranked by source trust)")
    return ranked
