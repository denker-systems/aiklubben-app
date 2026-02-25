"""Pydantic data models for the news pipeline."""

from pydantic import BaseModel, Field
from typing import Optional


class SourceArticle(BaseModel):
    """A crawled source article from the web."""
    url: str = Field(description="Original article URL")
    title: str = Field(description="Article title")
    body: str = Field(description="Extracted article body text")
    date: Optional[str] = Field(default=None, description="Publication date (ISO format)")
    source_name: str = Field(description="Proper publication name, e.g. 'TechCrunch'")
    og_image: Optional[str] = Field(default=None, description="OG image URL")
    url_verified: bool = Field(default=False, description="Whether the URL was verified accessible")


class AnalyzedArticle(BaseModel):
    """Result of AI analysis of a source article."""
    is_relevant: bool = Field(description="Whether this is a real, dated AI news article")
    actual_event_date: Optional[str] = Field(default=None, description="The actual date the event happened (YYYY-MM-DD)")
    topic_id: str = Field(description="A short unique topic identifier for deduplication, e.g. 'gpt5-launch' or 'nvidia-q2-2025'")
    content_format: str = Field(description="Best article format: 'news' (breaking news), 'explainer' (deep dive into complex topic), 'analysis' (trend/market analysis), 'column' (thought-provoking reflection), 'review' (AI tool/model review)")
    event_summary: str = Field(description="1-2 sentence factual summary of the specific news event")
    key_entities: list[str] = Field(description="Key companies/people/products mentioned")
    category: str = Field(description="Best category: AI-företag, AI-forskning, AI-etik, LLM, AI-nyheter, AI-tillämpningar, Generativ AI")
    quality_score: int = Field(description="Quality 1-10: 10=breaking news with specific facts and date, 1=generic/undated")


class SourceReference(BaseModel):
    """A verified source reference for an article."""
    name: str = Field(description="Publication name, e.g. 'TechCrunch'")
    url: str = Field(description="Full article URL")
    title: str = Field(description="Source article title")


class NewsArticle(BaseModel):
    """A finished bilingual news article ready for the database."""
    title_sv: str = Field(description="Swedish title, max 80 chars, specific and factual")
    title_en: str = Field(description="English title, max 80 chars, specific and factual")
    slug: str = Field(description="URL-friendly slug, lowercase a-z and hyphens only, no special chars")
    summary_sv: str = Field(description="Swedish summary, 2-3 factual sentences")
    summary_en: str = Field(description="English summary, 2-3 factual sentences")
    content_sv: str = Field(description="Full Swedish article in Markdown, 400-600 words, use real newlines")
    content_en: str = Field(description="Full English article in Markdown, 400-600 words, use real newlines")
    analysis_sv: str = Field(description="Swedish AI analysis: 2-4 neutral, thought-provoking sentences about implications")
    analysis_en: str = Field(description="English AI analysis: 2-4 neutral, thought-provoking sentences about implications")
    category: str = Field(description="Category name")
    sources: list[SourceReference] = Field(description="All verified source references")
