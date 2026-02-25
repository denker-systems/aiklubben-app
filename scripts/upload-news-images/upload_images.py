"""
Download article-specific images and upload to Supabase Storage.
Then update the news table with the new image URLs.

Strategy:
  1. Fetch source URLs from DB (the actual referenced articles)
  2. Try to extract OG image from each source (editorial, high-quality)
  3. Fall back to Brave Image Search with specific queries

Requires in .env:
  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BRAVE_API_KEY
"""

import os
import re
import sys
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
BRAVE_API_KEY = os.getenv("BRAVE_API_KEY")
BUCKET = "images"
FOLDER = "news"

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    sys.exit(1)

if not BRAVE_API_KEY:
    print("ERROR: BRAVE_API_KEY must be set in .env")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Brave Image Search fallback queries (very specific to find editorial images)
FALLBACK_QUERIES = {
    "openai-chatgpt-go-annonser-januari-2026": [
        "OpenAI ChatGPT Go announcement January 2026",
        "OpenAI ChatGPT app interface 2026",
    ],
    "anthropic-effektivitet-strategi-januari-2026": [
        "Anthropic Claude AI Daniela Amodei 2026",
        "Anthropic Claude enterprise AI 2026",
    ],
    "deepseek-v3-2-genombrott-prissankning-januari-2026": [
        "DeepSeek AI China Liang Wenfeng 2026",
        "DeepSeek V3 AI model 2026",
    ],
    "google-gemini-storsta-uppdatering-januari-2026": [
        "Google Gemini AI app January 2026 update",
        "Google Gemini Drop January 2026",
    ],
    "xai-grok-videogeneration-kritik-januari-2026": [
        "xAI Grok Imagine video generation 2026",
        "Elon Musk Grok AI controversy 2026",
    ],
}

# Domains to skip (tiny icons, tracking pixels, etc.)
SKIP_DOMAINS = [
    "favicon", "icon", "logo", "pixel", "tracker",
    "gravatar.com", "wp-content/plugins",
    "badge", "button", "banner-ad",
]


def is_good_image_url(url: str) -> bool:
    """Filter out tiny icons, tracking pixels, and non-image URLs."""
    if not url:
        return False
    lower = url.lower()
    if not any(ext in lower for ext in [".jpg", ".jpeg", ".png", ".webp", "image"]):
        return False
    if any(skip in lower for skip in SKIP_DOMAINS):
        return False
    # Skip very small dimension hints in URL (e.g. 50x50, 100x100)
    size_match = re.search(r'(\d+)x(\d+)', lower)
    if size_match:
        w, h = int(size_match.group(1)), int(size_match.group(2))
        if w < 300 or h < 200:
            return False
    return True


def extract_og_image(url: str) -> str | None:
    """Fetch a page and extract its og:image meta tag."""
    try:
        resp = requests.get(
            url,
            timeout=10,
            headers={"User-Agent": "Mozilla/5.0 (compatible; NewsImageBot/1.0)"},
            allow_redirects=True,
        )
        if resp.status_code != 200:
            return None

        html = resp.text[:50000]  # Only scan first 50KB

        # Try og:image first
        og_match = re.search(
            r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\'>]+)["\']',
            html, re.IGNORECASE
        )
        if not og_match:
            og_match = re.search(
                r'<meta[^>]+content=["\']([^"\'>]+)["\'][^>]+property=["\']og:image["\']',
                html, re.IGNORECASE
            )

        if og_match:
            img_url = og_match.group(1)
            if img_url.startswith("//"):
                img_url = "https:" + img_url
            if is_good_image_url(img_url):
                return img_url

        # Try twitter:image as fallback
        tw_match = re.search(
            r'<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\'>]+)["\']',
            html, re.IGNORECASE
        )
        if not tw_match:
            tw_match = re.search(
                r'<meta[^>]+content=["\']([^"\'>]+)["\'][^>]+name=["\']twitter:image["\']',
                html, re.IGNORECASE
            )

        if tw_match:
            img_url = tw_match.group(1)
            if img_url.startswith("//"):
                img_url = "https:" + img_url
            if is_good_image_url(img_url):
                return img_url

        return None
    except Exception as e:
        print(f"    OG extract error for {url[:60]}: {e}")
        return None


def search_brave_images(queries: list[str]) -> str | None:
    """Search Brave Images with multiple queries. Returns first good result."""
    for query in queries:
        try:
            resp = requests.get(
                "https://api.search.brave.com/res/v1/images/search",
                headers={
                    "Accept": "application/json",
                    "Accept-Encoding": "gzip",
                    "X-Subscription-Token": BRAVE_API_KEY,
                },
                params={
                    "q": query,
                    "count": 10,
                    "safesearch": "strict",
                },
                timeout=10,
            )
            if resp.status_code != 200:
                print(f"    Brave error: {resp.status_code}")
                continue

            data = resp.json()
            results = data.get("results", [])

            for img in results:
                props = img.get("properties", {})
                src = props.get("url") or img.get("url")
                width = props.get("width", 0)
                height = props.get("height", 0)

                # Prefer large images from reputable sources
                if src and is_good_image_url(src):
                    if width >= 600 or height >= 400 or (width == 0 and height == 0):
                        print(f"    Brave: {src[:80]}... ({width}x{height})")
                        return src

        except Exception as e:
            print(f"    Brave search error: {e}")
            continue

    return None


def download_image(url: str) -> bytes | None:
    """Download an image from a URL. Returns bytes or None."""
    try:
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        content_type = resp.headers.get("content-type", "")
        if "image" not in content_type:
            print(f"  WARNING: Content-Type is {content_type}, not image")
        return resp.content
    except Exception as e:
        print(f"  Download error: {e}")
        return None


def upload_to_storage(image_data: bytes, slug: str) -> str | None:
    """Upload image to Supabase Storage. Returns the public URL or None."""
    filename = f"{FOLDER}/{slug}.jpg"
    try:
        # Remove existing file if it exists (ignore errors)
        try:
            supabase.storage.from_(BUCKET).remove([filename])
        except Exception:
            pass

        supabase.storage.from_(BUCKET).upload(
            filename,
            image_data,
            file_options={"content-type": "image/jpeg", "upsert": "true"},
        )
        public_url = supabase.storage.from_(BUCKET).get_public_url(filename)
        return public_url
    except Exception as e:
        print(f"  Upload error: {e}")
        return None


def update_news_image(slug: str, image_url: str):
    """Update the news article's image_url in the database."""
    result = (
        supabase.table("news")
        .update({"image_url": image_url})
        .eq("slug", slug)
        .execute()
    )
    if result.data:
        print(f"  DB updated for {slug}")
    else:
        print(f"  WARNING: No rows updated for slug={slug}")


def main():
    print("=== News Image Uploader ===")
    print(f"Supabase: {SUPABASE_URL}")
    print(f"Bucket: {BUCKET}/{FOLDER}")
    print()

    # Fetch all target articles from DB (with their sources)
    slugs = list(FALLBACK_QUERIES.keys())
    result = supabase.table("news").select("slug, sources").in_("slug", slugs).execute()
    articles = {row["slug"]: row.get("sources", []) for row in (result.data or [])}
    print(f"Found {len(articles)} articles in DB\n")

    for slug in slugs:
        print(f"[{slug}]")
        sources = articles.get(slug, [])
        image_url = None

        # Strategy 1: Extract OG image from source article URLs
        for source in sources:
            src_url = source.get("url", "") if isinstance(source, dict) else ""
            if not src_url:
                continue
            print(f"  Trying OG image from: {source.get('name', '')} ({src_url[:60]})")
            og_img = extract_og_image(src_url)
            if og_img:
                print(f"  ✓ OG image found: {og_img[:80]}")
                image_url = og_img
                break

        # Strategy 2: Brave Image Search with specific queries
        if not image_url:
            print(f"  No OG image, trying Brave Image Search...")
            queries = FALLBACK_QUERIES.get(slug, [])
            image_url = search_brave_images(queries)

        if not image_url:
            print(f"  SKIP: no suitable image found\n")
            continue

        # Download
        print(f"  Downloading: {image_url[:80]}...")
        image_data = download_image(image_url)
        if not image_data:
            print(f"  SKIP: could not download")
            continue

        print(f"  Size: {len(image_data) / 1024:.0f} KB")

        # Upload to Supabase Storage
        public_url = upload_to_storage(image_data, slug)
        if not public_url:
            print(f"  SKIP: could not upload")
            continue

        print(f"  Uploaded: {public_url[:80]}...")

        # Update DB
        update_news_image(slug, public_url)
        print()

    print("=== Done ===")


if __name__ == "__main__":
    main()
