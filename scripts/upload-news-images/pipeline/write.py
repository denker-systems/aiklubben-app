"""Step 4: Write — Use Gemini to create bilingual news articles with proper sourcing."""

import re
from pipeline.config import gemini, GEMINI_MODEL
from pipeline.models import SourceArticle, AnalyzedArticle, NewsArticle, SourceReference


def sanitize_slug(slug: str) -> str:
    """Ensure slug contains only lowercase a-z, digits, and hyphens."""
    slug = slug.lower().strip()
    slug = re.sub(r'[^a-z0-9-]', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    return slug[:80]


def write_article(
    primary_source: SourceArticle,
    analysis: AnalyzedArticle,
    additional_sources: list[SourceArticle] | None = None,
) -> NewsArticle | None:
    """Use Gemini to write a bilingual news article from one or more sources.
    
    Args:
        primary_source: The main source article
        analysis: Analysis results from step 3
        additional_sources: Optional extra sources about the same topic
    """
    # Build sources context
    sources_context = f"""PRIMARY SOURCE:
Title: {primary_source.title}
URL: {primary_source.url}
Publication: {primary_source.source_name}
Date: {primary_source.date or 'unknown'}

Body:
{primary_source.body[:3000]}"""

    if additional_sources:
        for i, src in enumerate(additional_sources[:2], 1):
            sources_context += f"""

ADDITIONAL SOURCE {i}:
Title: {src.title}
URL: {src.url}
Publication: {src.source_name}
Body excerpt:
{src.body[:1500]}"""

    # Format-specific style instructions
    format_styles = {
        "news": "Write in INVERTED PYRAMID style: most important facts first, then supporting details. Neutral, factual tone. Short paragraphs. Lead with who/what/when/where.",
        "explainer": "Write as a DEEP DIVE EXPLAINER: Start with why this matters, then break down the technical details in accessible language. Use analogies. Educational tone. Help the reader understand the 'so what'.",
        "analysis": "Write as TREND ANALYSIS: Present data and patterns. Compare with competitors/previous events. Include market context. Forward-looking, what comes next? Data-driven language.",
        "column": "Write as a REFLECTIVE COLUMN: Open with a compelling hook. Explore the broader implications for society and technology. Raise questions. More narrative and personal, but still factual. Thought-provoking conclusion.",
        "review": "Write as a PRODUCT/MODEL REVIEW: Structure around capabilities, performance, limitations, and use cases. Compare with alternatives. Practical, hands-on tone. Who is this for?",
    }
    content_format = analysis.content_format if analysis.content_format in format_styles else "news"
    style_instruction = format_styles[content_format]

    prompt = f"""You are a professional AI journalist writing for "AI Klubben", 
a Swedish educational app about artificial intelligence.

Write a {content_format.upper()} article based on the sources below.

WRITING STYLE ({content_format}):
{style_instruction}

JOURNALISM STANDARDS:
- Report ONLY facts found in the source material. Never invent information.
- Include specific dates, numbers, and quotes from the sources.
- Explain technical terms when first used.
- Professional but accessible tone for a Swedish audience learning about AI.
- Cross-reference facts between sources when multiple are provided.

FORMAT REQUIREMENTS:
- slug: lowercase English, only a-z, digits, and hyphens. Include month suffix like "-aug-2025". NO Swedish characters (ö, ä, å etc).
- Content: 400-600 words, use Markdown ## headings, real newlines (not escaped \\n).
- Do NOT include a sources section in the content text — sources are stored separately.
- sources array: Include ALL source URLs as SourceReference objects.

ANALYSIS SECTION (analysis_sv / analysis_en):
Write a short neutral analysis (2-4 sentences) in the style of AP/Reuters/BBC "What This Means" boxes.
Rules for the analysis:
- Present multiple perspectives fairly, without taking sides.
- Raise thought-provoking questions about broader implications.
- Provide context: how does this fit into larger trends?
- Never use "I think" or express personal opinions. Use phrases like "This raises questions about...", "Experts are divided on whether...", "The broader implications could include...".
- Keep it concise and accessible.

EVENT DETAILS:
Topic: {analysis.topic_id}
Event date: {analysis.actual_event_date or primary_source.date or 'unknown'}
Summary: {analysis.event_summary}
Key entities: {', '.join(analysis.key_entities)}
Category: {analysis.category}

{sources_context}"""

    try:
        response = gemini.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_json_schema": NewsArticle.model_json_schema(),
                "temperature": 0.3,
            },
        )
        article = NewsArticle.model_validate_json(response.text)

        # Sanitize slug
        article.slug = sanitize_slug(article.slug)

        # Fix escaped newlines
        article.content_sv = article.content_sv.replace("\\n", "\n")
        article.content_en = article.content_en.replace("\\n", "\n")
        article.summary_sv = article.summary_sv.replace("\\n", " ")
        article.summary_en = article.summary_en.replace("\\n", " ")
        article.analysis_sv = article.analysis_sv.replace("\\n", " ")
        article.analysis_en = article.analysis_en.replace("\\n", " ")

        # Ensure primary source is in references
        source_urls = [s.url for s in article.sources]
        if primary_source.url not in source_urls:
            article.sources.insert(0, SourceReference(
                name=primary_source.source_name,
                url=primary_source.url,
                title=primary_source.title,
            ))
        if additional_sources:
            for src in additional_sources:
                if src.url not in source_urls:
                    article.sources.append(SourceReference(
                        name=src.source_name,
                        url=src.url,
                        title=src.title,
                    ))

        article.category = analysis.category
        return article
    except Exception as e:
        print(f"    Write error: {e}")
        return None
