"""Step 3: Analyze — Use Gemini to validate articles and assign topic IDs for dedup."""

from pipeline.config import gemini, GEMINI_MODEL
from pipeline.models import SourceArticle, AnalyzedArticle


def analyze_article(source: SourceArticle, target_month: str) -> AnalyzedArticle | None:
    """Use Gemini to analyze if an article is relevant and extract key facts.
    
    Args:
        source: The extracted source article
        target_month: The target month, e.g. "2025-08"
    """
    prompt = f"""You are a senior news analyst for an AI education app. Analyze this article strictly.

TASK: Determine if this is a REAL, DATED news article about a specific AI event.

RULES FOR is_relevant=true:
- Must describe a SPECIFIC event (launch, announcement, earnings, deal, ruling)
- Must have a verifiable date within or near {target_month}
- Must be from a real news source (not Wikipedia, docs, tutorials, product pages, changelogs)
- Must contain NEW information (not a general overview or history)

RULES FOR is_relevant=false:
- General explainers, histories, or overviews of a company/product
- Product documentation, API changelogs, or release notes pages  
- Articles where the event date is outside {target_month} by more than 2 weeks
- Tutorials, how-to guides, or opinion pieces without news value

TOPIC ID: Create a short, unique identifier for the specific news event.
Examples: "gpt5-launch-aug2025", "nvidia-q2-earnings-aug2025", "eu-ai-act-ban-aug2025"
Articles about the SAME event should get the SAME topic_id.

CONTENT FORMAT: Choose the best journalistic format for this article:
- "news": Breaking news, product launches, earnings reports. Straight facts, inverted pyramid.
- "explainer": Complex technical topics that need context. Deep dive, educational tone.
- "analysis": Market trends, industry shifts, competitive dynamics. Data-driven, forward-looking.
- "column": Thought-provoking developments with societal impact. Reflective, raises questions.
- "review": New AI tools, models, or platforms. Hands-on assessment, pros/cons.
Pick the format that best fits the source material.

Article URL: {source.url}
Source: {source.source_name}
Title: {source.title}
Metadata date: {source.date or 'unknown'}

Body (first 3000 chars):
{source.body[:3000]}"""

    try:
        response = gemini.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_json_schema": AnalyzedArticle.model_json_schema(),
                "temperature": 0.1,
            },
        )
        result = AnalyzedArticle.model_validate_json(response.text)
        return result
    except Exception as e:
        print(f"    Analyze error: {e}")
        return None
