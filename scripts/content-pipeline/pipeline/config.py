import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
BRAVE_API_KEY = os.getenv("BRAVE_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

sb = create_client(SUPABASE_URL, SUPABASE_KEY)

# Existing slugs cache — maps slug -> row id (or None for new)
EXISTING_SLUGS: dict[str, str | None] = {}


def load_existing_slugs():
    """Load all existing content slugs + ids from DB."""
    try:
        result = sb.table("content").select("id, slug, sources").execute()
        for row in result.data:
            EXISTING_SLUGS[row["slug"]] = row["id"]
        print(f"  Loaded {len(EXISTING_SLUGS)} existing slugs")
    except Exception as e:
        print(f"  Warning: could not load slugs: {e}")


def slug_exists(slug: str) -> bool:
    return slug in EXISTING_SLUGS


def get_existing_id(slug: str) -> str | None:
    """Return the DB id for an existing slug, or None."""
    return EXISTING_SLUGS.get(slug)
