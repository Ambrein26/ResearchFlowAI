from app.services.ai_service import client, MODEL_NAME


def ask_research_assistant(question: str, paper) -> str:

    paper_context = f"""
Title:
{paper.title or "Not mentioned"}

Authors:
{paper.authors or "Not mentioned"}

Research Problem:
{paper.research_problem or "Not mentioned in the available paper analysis."}

Key Contributions:
{paper.key_contributions or "Not mentioned in the available paper analysis."}

Methodology:
{paper.methodology or "Not mentioned in the available paper analysis."}

Dataset:
{paper.dataset or "Not mentioned in the available paper analysis."}

Models / Algorithms:
{paper.models_or_algorithms or "Not mentioned in the available paper analysis."}

Key Findings:
{paper.key_findings or "Not mentioned in the available paper analysis."}

Limitations:
{paper.limitations or "Not mentioned in the available paper analysis."}

Future Work:
{paper.future_work or "Not mentioned in the available paper analysis."}

Summary:
{paper.summary or "Not mentioned in the available paper analysis."}

TL;DR:
{paper.tldr or "Not mentioned in the available paper analysis."}
"""

    prompt = f"""
You are an AI Research Assistant helping a computer science student
understand and analyze a research paper.

Answer the user's question using ONLY the paper information provided below.

IMPORTANT RULES:

1. Do not invent information.
2. Do not assume information that is not present.
3. Do not use outside knowledge to answer paper-specific questions.
4. If the answer cannot be determined from the available paper analysis,
   clearly say:

   "This information is not available in the stored analysis of this paper."

5. Preserve important technical terminology.
6. Explain technical concepts clearly and concisely.
7. When appropriate, give step-by-step explanations.
8. If the user asks about methodology, explain the methodology described
   in the paper.
9. If the user asks about findings, only discuss reported findings.
10. Do not claim that the paper achieved something unless it is supported
    by the stored analysis.

PAPER INFORMATION:

{paper_context}

USER QUESTION:

{question}

Provide a clear and useful answer.
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
    )

    return response.text