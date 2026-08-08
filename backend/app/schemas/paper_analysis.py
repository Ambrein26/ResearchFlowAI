from pydantic import BaseModel, Field
from typing import List


class PaperAnalysis(BaseModel):
    title: str = Field(
        description="Title of the research paper."
    )

    authors: List[str] = Field(
        description="Authors mentioned in the paper."
    )

    tldr: str = Field(
        description="A very short 2-3 sentence explanation of the paper."
    )

    summary: str = Field(
        description="A clear and detailed summary of the research paper."
    )

    keywords: List[str] = Field(
        description="Important keywords and technical terms from the paper."
    )

    research_problem: str = Field(
        description="The main research problem or question addressed."
    )

    key_contributions: List[str] = Field(
        description="Major contributions made by the paper."
    )

    methodology: str = Field(
        description="Explanation of the methodology or approach used."
    )

    dataset: str = Field(
        description="Dataset used in the research, if mentioned."
    )

    models_or_algorithms: List[str] = Field(
        description="Models, algorithms, or techniques used."
    )

    key_findings: List[str] = Field(
        description="Important findings or results reported."
    )

    limitations: List[str] = Field(
        description="Limitations explicitly mentioned or reasonably identifiable from the paper."
    )

    future_work: List[str] = Field(
        description="Future work suggested by the authors."
    )