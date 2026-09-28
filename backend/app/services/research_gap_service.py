import json
import re
from typing import Iterable

from google.genai import types
from pydantic import ValidationError

from app.models.paper import Paper
from app.schemas.research_gap import ResearchGapPayload
from app.services.ai_service import MODEL_NAME, client


MAX_PAPER_TEXT_LENGTH = 40000


class ResearchGapResponseError(ValueError):
    """Raised when Gemini does not return the required research-gap JSON."""


def _value_to_text(value) -> str:
    if value is None:
        return "Not mentioned in the available paper analysis."

    if isinstance(value, (list, dict)):
        return json.dumps(value, ensure_ascii=False)

    text = str(value).strip()
    return text or "Not mentioned in the available paper analysis."


def _paper_context(papers: Iterable[Paper]) -> str:
    context = []

    for index, paper in enumerate(papers, start=1):
        full_text = paper.full_text or ""
        if len(full_text) > MAX_PAPER_TEXT_LENGTH:
            full_text = full_text[:MAX_PAPER_TEXT_LENGTH]

        context.append(
            f"""
========================
SELECTED PAPER {index}
========================

Exact title:
{paper.title or paper.filename}

Authors:
{_value_to_text(paper.authors)}

Summary:
{_value_to_text(paper.summary)}

TL;DR:
{_value_to_text(paper.tldr)}

Keywords:
{_value_to_text(paper.keywords)}

Research problem:
{_value_to_text(paper.research_problem)}

Key contributions:
{_value_to_text(paper.key_contributions)}

Methodology:
{_value_to_text(paper.methodology)}

Dataset:
{_value_to_text(paper.dataset)}

Models or algorithms:
{_value_to_text(paper.models_or_algorithms)}

Key findings:
{_value_to_text(paper.key_findings)}

Limitations:
{_value_to_text(paper.limitations)}

Future work:
{_value_to_text(paper.future_work)}

Extracted paper text excerpt:
{full_text or "Not available."}
"""
        )

    return "\n".join(context)


def _remove_json_fence(content: str) -> str:
    cleaned = content.strip()
    fenced_match = re.fullmatch(
        r"```(?:json)?\s*(.*?)\s*```",
        cleaned,
        flags=re.IGNORECASE | re.DOTALL
    )
    return fenced_match.group(1).strip() if fenced_match else cleaned


def _parse_response(response) -> dict:
    content = getattr(response, "text", None)

    if not content and getattr(response, "parsed", None) is not None:
        parsed = response.parsed
        if isinstance(parsed, ResearchGapPayload):
            return parsed.model_dump()
        if isinstance(parsed, dict):
            return parsed
        if hasattr(parsed, "model_dump"):
            return parsed.model_dump()

    if not isinstance(content, str) or not content.strip():
        raise ResearchGapResponseError(
            "Gemini returned empty research-gap content."
        )

    try:
        decoded = json.loads(_remove_json_fence(content))
    except json.JSONDecodeError as error:
        raise ResearchGapResponseError(
            "Gemini returned malformed research-gap JSON."
        ) from error

    if not isinstance(decoded, dict):
        raise ResearchGapResponseError(
            "Gemini research-gap response must be a JSON object."
        )

    return decoded


def generate_research_gaps(papers: Iterable[Paper]) -> ResearchGapPayload:
    prompt = f"""
You are an AI research assistant identifying research gaps across selected
research papers.

Use ONLY the supplied information from the selected papers.

Requirements:
1. Compare the selected papers directly.
2. Identify gaps supported by evidence in the supplied papers.
3. Distinguish a genuinely unsupported or insufficiently studied area from
   a topic that is merely not mentioned.
4. Do not invent facts, citations, results, datasets, methods, or claims.
5. For every gap, cite specific evidence from one or more selected papers.
6. Explain why each supported gap matters.
7. Suggest realistic future research directions grounded in the evidence.
8. Use the exact selected paper title in every evidence.paper_title field.
9. Return ONLY valid JSON matching the requested structure.
10. Do not use Markdown code fences.
11. Do not add commentary outside the JSON object.

Return exactly this JSON shape:
{{
  "overall_summary": "A concise comparison-based summary.",
  "research_gaps": [
    {{
      "title": "Short research-gap title",
      "description": "What is missing or insufficient across the selected papers.",
      "evidence": [
        {{
          "paper_title": "Exact selected paper title",
          "evidence": "Specific evidence from the supplied paper information."
        }}
      ],
      "importance": "Why this gap matters.",
      "suggested_direction": "A realistic future research direction."
    }}
  ],
  "future_research_summary": "A concise summary of the most promising future directions."
}}

SELECTED PAPER INFORMATION:
{_paper_context(papers)}
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )

    try:
        return ResearchGapPayload.model_validate(_parse_response(response))
    except ValidationError as error:
        raise ResearchGapResponseError(
            "Gemini research-gap response failed schema validation."
        ) from error
