import os
from google import genai
from pipeline.models import SourcePage, AnalyzedTopic

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
gemini = genai.Client(api_key=GEMINI_API_KEY)

# Today's date for context
CURRENT_DATE = "February 2026"


def analyze_sources(topic_name: str, sources: list[SourcePage]) -> AnalyzedTopic | None:
    """Use Gemini to analyze collected sources and determine suitability."""
    sources_text = ""
    for i, src in enumerate(sources[:5], 1):
        sources_text += f"""
SOURCE {i}: {src.source_name}
Title: {src.title}
URL: {src.url}
Content ({len(src.body)} chars, showing first 5000):
{src.body[:5000]}
---
"""

    prompt = f"""You are a senior content analyst for "AI Klubben", a Swedish educational platform about AI.
Today's date: {CURRENT_DATE}.

TASK: Analyze the sources below about "{topic_name}" to extract maximum factual detail for
writing a comprehensive, up-to-date educational article.

QUALITY CRITERIA for is_suitable=true (ALL must be met):
- At least 2 sources contain specific, verifiable facts (dates, numbers, versions, comparisons)
- Sources provide enough info for a 1500+ word article with multiple sections
- Topic is relevant for someone learning about AI in {CURRENT_DATE}

Set is_suitable=false if sources are mostly marketing fluff or too thin.

CATEGORY — CRITICAL: must be EXACTLY one of these two string values:
  "plattformar" — for tools, apps, services, platforms that end-users interact with
  "resurser" — for everything else: models, concepts, companies, techniques, hardware, research

Do NOT use any other value for category. Only "plattformar" or "resurser" are valid.

SUBCATEGORY (free text, pick the best fit):
  If category="plattformar": chatbots, kodredigerare, bildgenerering, videogenerering,
    textanalys, dataanalys, automatisering, generativa-verktyg, utbildningsverktyg
  If category="resurser": ai-modeller, ai-foretag, ai-verktyg, ai-haardvara,
    ai-forskning, ai-tekniker, ai-koncept, ai-etik, ai-utbildning

KEY FACTS EXTRACTION — this is critical. Extract 10-20 specific, concrete facts:
- Version numbers, release dates, parameter counts
- Benchmark scores, pricing tiers, user counts
- Technical specs (context window, training data, architecture details)
- Competitors and how they compare
- Key people, funding amounts, partnerships
- Limitations, controversies, recent developments
- Use cases with real examples

TAGS: 4-8 relevant Swedish tags, lowercase. Include the topic name and related terms.

Topic: {topic_name}
{sources_text}"""

    try:
        response = gemini.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_json_schema": AnalyzedTopic.model_json_schema(),
                "temperature": 0.1,
            },
        )
        return AnalyzedTopic.model_validate_json(response.text)
    except Exception as e:
        print(f"    Analysis error: {e}")
        return None
