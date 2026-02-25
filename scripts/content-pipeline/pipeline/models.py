from pydantic import BaseModel, Field
from typing import Optional


class SourcePage(BaseModel):
    """A collected web page about a topic."""
    url: str = Field(description="Original page URL")
    title: str = Field(description="Page title")
    body: str = Field(description="Extracted body text")
    source_name: str = Field(description="Publication/site name")
    og_image: Optional[str] = Field(default=None, description="OG image URL")
    url_verified: bool = Field(default=False, description="Whether the URL was verified")


class AnalyzedTopic(BaseModel):
    """Result of AI analysis of collected sources for a topic."""
    is_suitable: bool = Field(description="Whether there is enough quality material to write about this topic")
    topic_id: str = Field(description="Unique topic identifier matching the search topic")
    category: str = Field(description="Best category: plattformar or resurser")
    subcategory: str = Field(description="Subcategory: ai-modeller, ai-foretag, ai-verktyg, bildgenerering, textanalys, kodredigerare, chatbots, videogenerering, automatisering, generativa-verktyg, dataanalys, ai-haardvara, ai-forskning, ai-tekniker, ai-koncept")
    quality_score: int = Field(description="Quality 1-10: 10=comprehensive with specific facts, 1=thin/generic")
    key_facts: list[str] = Field(description="10-20 specific, concrete facts with numbers/dates/versions extracted from sources")
    tags: list[str] = Field(description="4-8 relevant tags in Swedish, lowercase, e.g. ['ai', 'llm', 'chatbot', 'openai']")


class SourceReference(BaseModel):
    """A verified source reference."""
    name: str = Field(description="Publication name")
    url: str = Field(description="Full URL")
    title: str = Field(description="Source page title")


class ContentArticle(BaseModel):
    """A finished bilingual content/resource article."""
    title_sv: str = Field(description="Unique Swedish title — specific, engaging, never generic. Use em-dash, colon or subtitle for variety.")
    title_en: str = Field(description="Unique English title — specific, engaging, not a literal translation of the Swedish.")
    slug: str = Field(description="URL slug: 2-4 lowercase English words with hyphens, e.g. 'chatgpt-platform', 'prompt-engineering'")
    excerpt_sv: str = Field(description="Swedish excerpt: 2-3 punchy sentences with specific facts that make the reader want to read more")
    excerpt_en: str = Field(description="English excerpt: 2-3 punchy sentences with specific facts")
    content_sv: str = Field(description="Full Swedish article in Markdown, 800-1200 words, structured with ## headings, natural Swedish, dense with facts")
    content_en: str = Field(description="Full English article in Markdown, 800-1200 words, written independently in English (not translated)")
    sources: list[SourceReference] = Field(description="All source references used")
