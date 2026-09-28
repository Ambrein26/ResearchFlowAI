from typing import List

from pydantic import BaseModel, Field, field_validator


class ResearchGapEvidence(BaseModel):
    paper_title: str
    evidence: str

    @field_validator("paper_title", "evidence")
    @classmethod
    def require_text(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Research-gap evidence fields cannot be empty.")
        return value.strip()


class ResearchGapItem(BaseModel):
    title: str
    description: str
    evidence: List[ResearchGapEvidence] = Field(min_length=1)
    importance: str
    suggested_direction: str

    @field_validator(
        "title",
        "description",
        "importance",
        "suggested_direction"
    )
    @classmethod
    def require_text(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Research-gap fields cannot be empty.")
        return value.strip()


class ResearchGapPayload(BaseModel):
    overall_summary: str
    research_gaps: List[ResearchGapItem]
    future_research_summary: str

    @field_validator(
        "overall_summary",
        "future_research_summary"
    )
    @classmethod
    def require_text(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Research-gap summaries cannot be empty.")
        return value.strip()
