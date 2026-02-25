"""Configuration and shared clients for the pipeline."""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client
from google import genai

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
BRAVE_API_KEY = os.getenv("BRAVE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

BUCKET = "images"
FOLDER = "news"
GEMINI_MODEL = "gemini-3-flash-preview"

for name, val in [
    ("SUPABASE_URL", SUPABASE_URL),
    ("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_KEY),
    ("BRAVE_API_KEY", BRAVE_API_KEY),
    ("GEMINI_API_KEY", GEMINI_API_KEY),
]:
    if not val:
        print(f"ERROR: {name} must be set in .env")
        sys.exit(1)

# Shared clients
sb: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
gemini = genai.Client(api_key=GEMINI_API_KEY)

# Category ID cache (loaded at runtime)
CATEGORIES: dict[str, str] = {}


def load_categories():
    """Load news_categories from DB into CATEGORIES dict."""
    global CATEGORIES
    result = sb.table("news_categories").select("id, name").execute()
    CATEGORIES = {row["name"]: row["id"] for row in (result.data or [])}
    print(f"  Loaded {len(CATEGORIES)} categories")
