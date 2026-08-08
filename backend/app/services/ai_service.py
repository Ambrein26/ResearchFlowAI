import os

from google import genai
from google.genai import types
from dotenv import load_dotenv

from app.schemas.paper_analysis import PaperAnalysis


load_dotenv()


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not configured in the environment."
    )


client = genai.Client(
    api_key=GEMINI_API_KEY
)


MODEL_NAME = "gemini-3.5-flash-lite"


def analyze_research_paper(text: str) -> PaperAnalysis:

    prompt = f"""
You are an AI research assistant.

Analyze the following research paper text carefully.

Important instructions:

1. Base your analysis only on the provided paper text.
2. Do not invent datasets, results, authors, algorithms, or claims.
3. If a piece of information is not available, clearly say "Not mentioned in the paper".
4. Preserve important technical terminology.
5. Explain complex ideas in a way that a computer science student can understand.
6. Identify the actual contributions, methodology, findings, limitations, and future work.

Research Paper:

{text}
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=PaperAnalysis,
        ),
    )

    return PaperAnalysis.model_validate_json(response.text)