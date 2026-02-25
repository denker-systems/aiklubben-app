# News Image Uploader

Downloads topic-specific images and uploads them to Supabase Storage, then updates the `news` table with the new URLs.

## Setup

1. Copy `.env.example` to `.env`
2. Add your **Supabase service role key** (Dashboard → Settings → API → `service_role`)
3. (Optional) Add a **Pexels API key** for topic-specific image search — get a free key at [pexels.com/api](https://www.pexels.com/api/)

## Run with Docker

```bash
cd scripts/upload-news-images
cp .env.example .env
# Edit .env with your keys
docker compose up --build
```

## Run without Docker

```bash
cd scripts/upload-news-images
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your keys
python upload_images.py
```

## What it does

1. For each article slug, searches Pexels for a relevant image (or uses a curated fallback)
2. Downloads the image
3. Uploads to Supabase Storage bucket `images/news/{slug}.jpg`
4. Updates the `news.image_url` column with the public storage URL
