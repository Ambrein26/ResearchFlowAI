from pydantic import BaseModel


class LiteratureReview(BaseModel):
    title: str
    introduction: str
    existing_research: str
    methodology_comparison: str
    key_findings: str
    research_gaps: str
    conclusion: str