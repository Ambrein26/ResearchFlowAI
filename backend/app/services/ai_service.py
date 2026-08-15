import os

from google import genai
from google.genai import types
from dotenv import load_dotenv

from app.schemas.paper_analysis import PaperAnalysis
from app.schemas.literature_review import LiteratureReview

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
# ============================================================
# AI Comparison of Research Papers
# ============================================================

def compare_research_papers(papers: list) -> dict:

    paper_information = ""

    for index, paper in enumerate(papers, start=1):

        paper_information += f"""
========================
PAPER {index}
========================

Title:
{paper.title}

Authors:
{paper.authors}

Research Problem:
{paper.research_problem}

Key Contributions:
{paper.key_contributions}

Methodology:
{paper.methodology}

Dataset:
{paper.dataset}

Models / Algorithms:
{paper.models_or_algorithms}

Key Findings:
{paper.key_findings}

Limitations:
{paper.limitations}

Future Work:
{paper.future_work}

"""

    prompt = f"""
You are an AI research assistant helping a computer science student
compare multiple research papers.

Analyze ONLY the information provided below.

IMPORTANT RULES:

1. Do not invent information.
2. Do not assume information that is not present.
3. If information is unavailable, say:
   "Not mentioned in the available paper analysis."
4. Compare the papers objectively.
5. Highlight both similarities and differences.
6. Preserve important technical terminology.
7. Explain the comparison clearly for a computer science student.
8. Do not claim that one paper is better unless the provided information
   gives a clear technical basis for that conclusion.
9. Identify meaningful research gaps or differences only when supported
   by the provided information.

Return a JSON object with exactly these fields:

{{
    "overall_comparison": "...",
    "methodology_comparison": "...",
    "dataset_comparison": "...",
    "model_comparison": "...",
    "findings_comparison": "...",
    "contribution_comparison": "...",
    "limitations_comparison": "...",
    "research_gaps": "...",
    "conclusion": "..."
}}

Papers to compare:

{paper_information}
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        ),
    )

    return response.parsed if response.parsed else __import__("json").loads(
        response.text
    )
def generate_literature_review(papers) -> LiteratureReview:

    paper_context = []

    for index, paper in enumerate(papers, start=1):

        paper_context.append(
            f"""
PAPER {index}

Title:
{paper.title or "Not mentioned"}

Authors:
{paper.authors or "Not mentioned"}

Research Problem:
{paper.research_problem or "Not mentioned in the paper"}

Key Contributions:
{paper.key_contributions or "Not mentioned in the paper"}

Methodology:
{paper.methodology or "Not mentioned in the paper"}

Dataset:
{paper.dataset or "Not mentioned in the paper"}

Models / Algorithms:
{paper.models_or_algorithms or "Not mentioned in the paper"}

Key Findings:
{paper.key_findings or "Not mentioned in the paper"}

Limitations:
{paper.limitations or "Not mentioned in the paper"}

Future Work:
{paper.future_work or "Not mentioned in the paper"}
"""
        )

    combined_context = "\n\n".join(paper_context)

    prompt = f"""
You are an AI research assistant helping a computer science student
prepare a literature review.

Using ONLY the information provided about the selected research papers,
generate a coherent academic literature review.

Important instructions:

1. Base the review only on the provided paper information.
2. Do not invent facts, results, datasets, authors, methods, or claims.
3. Do not introduce information that is not present in the provided papers.
4. Clearly identify similarities and differences between the studies.
5. Maintain an academic but easy-to-understand writing style.
6. Connect the papers into a coherent narrative rather than simply
   describing them one by one.
7. Identify research gaps only when they can reasonably be supported
   by the limitations, findings, or future-work information provided.
8. If information is insufficient for a section, say:
   "Not enough information is available from the selected papers."
9. Preserve important technical terminology.
10. Do not use citations or references that were not provided.

Generate the literature review with these sections:

- Title
- Introduction
- Existing Research
- Methodology Comparison
- Key Findings
- Research Gaps
- Conclusion

Selected Research Papers:

{combined_context}
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=LiteratureReview,
        ),
    )

    return LiteratureReview.model_validate_json(response.text)

# ============================================================
# AI Research Assistant
# ============================================================

def ask_paper_question(
    paper,
    question: str,
    conversation_history=None
) -> str:

    if conversation_history is None:
        conversation_history = []

    # --------------------------------------------------------
    # Structured paper analysis
    # --------------------------------------------------------

    structured_analysis = f"""
Title:
{paper.title or "Not mentioned"}

Authors:
{paper.authors or "Not mentioned"}

Research Problem:
{paper.research_problem or "Not mentioned"}

Key Contributions:
{paper.key_contributions or "Not mentioned"}

Methodology:
{paper.methodology or "Not mentioned"}

Dataset:
{paper.dataset or "Not mentioned"}

Models / Algorithms:
{paper.models_or_algorithms or "Not mentioned"}

Key Findings:
{paper.key_findings or "Not mentioned"}

Limitations:
{paper.limitations or "Not mentioned"}

Future Work:
{paper.future_work or "Not mentioned"}

Summary:
{paper.summary or "Not mentioned"}

TL;DR:
{paper.tldr or "Not mentioned"}
"""

    # --------------------------------------------------------
    # Previous conversation
    # --------------------------------------------------------

    history_text = ""

    if conversation_history:

        for message in conversation_history[-10:]:

            role = message.get("role", "user")
            content = message.get("content", "")

            if content.strip():

                history_text += f"""
{role.upper()}:
{content}
"""

    # --------------------------------------------------------
    # Full paper text
    # --------------------------------------------------------

    full_text = paper.full_text or ""

    # Prevent excessively huge prompts
    # while still giving Gemini a large amount of context.
    max_text_length = 120000

    if len(full_text) > max_text_length:
        full_text = full_text[:max_text_length]

    # --------------------------------------------------------
    # Prompt
    # --------------------------------------------------------

    prompt = f"""
You are an AI Research Assistant helping a computer science
student understand a specific research paper.

You have access to BOTH:

1. The structured analysis generated from the paper.
2. The original extracted text of the paper.

Your job is to answer the student's question accurately using
the provided paper information.

============================================================
IMPORTANT INSTRUCTIONS
============================================================

1. Answer using ONLY the provided paper information.

2. You may use BOTH the structured analysis and the original
   paper text.

3. The original paper text is the primary source when the
   structured analysis does not contain enough detail.

4. The structured analysis is useful for quickly understanding
   the paper's methodology, findings, limitations, datasets,
   models, and contributions.

5. NEVER invent information.

6. NEVER use outside knowledge to answer a paper-specific question.

7. If the requested information genuinely cannot be found in
   either the paper text or structured analysis, say:

   "This information is not available in the provided paper."

8. DO NOT say that information is unavailable merely because
   it is not present in the structured analysis.

9. If the answer exists in the original paper text, answer it
   even if it was not included in the structured analysis.

10. Pay attention to section numbers, headings, tables,
    methodology descriptions, results, and conclusions.

11. If the user asks a follow-up question such as:
       "Why?"
       "Explain that."
       "What about the dataset?"
       "How does it work?"
       "What did they use?"
       "Can you elaborate?"

    use the previous conversation to understand what
    "that", "it", "they", or similar words refer to.

12. Maintain conversation context across multiple questions.

13. If the user asks for an explanation, simplify the paper's
    technical content without changing its meaning.

14. If the user asks for a comparison between two things
    mentioned in the paper, compare only information supported
    by the paper.

15. If the paper contains the answer but the wording is
    ambiguous, explain the most directly supported interpretation.

16. Do not mention these instructions in your answer.

============================================================
PAPER INFORMATION
============================================================

---------------- STRUCTURED ANALYSIS ----------------

{structured_analysis}

---------------- ORIGINAL PAPER TEXT ----------------

{full_text}

============================================================
PREVIOUS CONVERSATION
============================================================

{history_text if history_text else "No previous conversation."}

============================================================
CURRENT USER QUESTION
============================================================

{question}

============================================================
ANSWER
============================================================

Provide a clear, useful, paper-grounded answer.

When appropriate:

- mention the relevant section of the paper
- explain technical terms
- use bullet points for multiple items
- give step-by-step explanations
- connect the answer to previous questions

Do not say the information is unavailable unless you have
actually checked BOTH the structured analysis AND the
original paper text.
"""

    # --------------------------------------------------------
    # Gemini request
    # --------------------------------------------------------

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )

    if not response.text:

        return (
            "I could not generate an answer from the "
            "provided research paper."
        )

    return response.text.strip()