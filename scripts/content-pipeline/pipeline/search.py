import os
import time
import requests
from urllib.parse import urlparse

BRAVE_API_KEY = os.getenv("BRAVE_API_KEY", "")
HEADERS = {"X-Subscription-Token": BRAVE_API_KEY, "Accept": "application/json"}

_last_call = 0.0
_consecutive_429 = 0

SKIP_DOMAINS = [
    "youtube.com", "twitter.com", "x.com", "reddit.com",
    "facebook.com", "instagram.com", "tiktok.com", "linkedin.com",
    "pinterest.com", "medium.com", "quora.com", "stackoverflow.com",
]

TRUSTED_SOURCES = {
    "openai.com": "OpenAI",
    "anthropic.com": "Anthropic",
    "blog.google": "Google Blog",
    "deepmind.google": "Google DeepMind",
    "ai.google.dev": "Google AI",
    "ai.meta.com": "Meta AI",
    "x.ai": "xAI",
    "nvidia.com": "NVIDIA",
    "microsoft.com": "Microsoft",
    "apple.com": "Apple",
    "huggingface.co": "Hugging Face",
    "arxiv.org": "arXiv",
    "techcrunch.com": "TechCrunch",
    "theverge.com": "The Verge",
    "arstechnica.com": "Ars Technica",
    "wired.com": "Wired",
    "technologyreview.com": "MIT Technology Review",
    "venturebeat.com": "VentureBeat",
    "towardsdatascience.com": "Towards Data Science",
    "en.wikipedia.org": "Wikipedia",
    "docs.anthropic.com": "Anthropic Docs",
    "platform.openai.com": "OpenAI Platform",
    "docs.mistral.ai": "Mistral AI Docs",
    "stability.ai": "Stability AI",
    "midjourney.com": "Midjourney",
    "runwayml.com": "Runway",
    "cursor.com": "Cursor",
    "github.com": "GitHub",
    "aws.amazon.com": "AWS",
    "cloud.google.com": "Google Cloud",
    "azure.microsoft.com": "Microsoft Azure",
}


def _rate_limit():
    global _last_call
    now = time.time()
    elapsed = now - _last_call
    if elapsed < 10.0:
        time.sleep(10.0 - elapsed)
    _last_call = time.time()


def get_source_name(domain: str) -> str:
    for key, name in TRUSTED_SOURCES.items():
        if key in domain:
            return name
    parts = domain.split(".")
    if len(parts) >= 2:
        return parts[-2].capitalize()
    return domain


def verify_url(url: str) -> bool:
    try:
        resp = requests.head(
            url, timeout=8, allow_redirects=True,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        return resp.status_code < 400
    except Exception:
        return False


def brave_web_search(query: str, count: int = 5, retries: int = 3) -> list[dict]:
    """Search Brave Web. Returns list of {title, url, description, domain, source_name}."""
    global _consecutive_429
    _rate_limit()
    try:
        params = {"q": query, "count": count, "safesearch": "strict"}
        resp = requests.get(
            "https://api.search.brave.com/res/v1/web/search",
            headers=HEADERS,
            params=params,
            timeout=10,
        )
        if resp.status_code == 429:
            _consecutive_429 += 1
            if retries > 0:
                wait = min(300, 60 * _consecutive_429)
                print(f"    ⏳ Rate limited (#{_consecutive_429}), cooling down {wait}s...")
                time.sleep(wait)
                return brave_web_search(query, count, retries - 1)
            return []
        _consecutive_429 = 0
        if resp.status_code != 200:
            print(f"    Brave error: {resp.status_code}")
            return []

        data = resp.json()
        results = []
        for item in data.get("web", {}).get("results", []):
            url = item.get("url", "")
            domain = urlparse(url).netloc.replace("www.", "")
            if any(skip in domain for skip in SKIP_DOMAINS):
                continue
            results.append({
                "title": item.get("title", ""),
                "url": url,
                "description": item.get("description", ""),
                "domain": domain,
                "source_name": get_source_name(domain),
            })
        return results
    except Exception as e:
        print(f"    Search error: {e}")
        return []


def search_topic(topic_name: str, search_queries: list[str], max_per_query: int = 4) -> list[dict]:
    """Search all queries for a topic, deduplicate and rank results."""
    seen_urls = set()
    all_results = []

    for query in search_queries:
        print(f"    🔍 {query[:70]}...")
        results = brave_web_search(query, count=max_per_query)
        for r in results:
            url = r["url"]
            if url not in seen_urls:
                seen_urls.add(url)
                all_results.append(r)

    # Rank by source trust
    trusted_list = list(TRUSTED_SOURCES.keys())
    def score(r):
        domain = r.get("domain", "")
        for i, trusted in enumerate(trusted_list):
            if trusted in domain:
                return i
        return 100
    ranked = sorted(all_results, key=score)
    print(f"    Found {len(ranked)} unique URLs")
    return ranked
