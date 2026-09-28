from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.core.data import normalize_uuid
from app.core.errors import ai_service_exception
from app.db.database import get_db
from app.models.paper import Paper
from app.models.research_gap_result import ResearchGapResult
from app.schemas.research_gap import ResearchGapPayload
from app.services.research_gap_service import generate_research_gaps


router = APIRouter(
    prefix="/api/research-gaps",
    tags=["Research Gaps"]
)


class ResearchGapCreate(BaseModel):
    paper_ids: List[str] = Field(min_length=2, max_length=6)
    result: ResearchGapPayload | None = None


class ResearchGapResultResponse(BaseModel):
    id: str
    user_id: str
    paper_ids: List[str]
    result: ResearchGapPayload
    created_at: datetime
    updated_at: datetime


class ResearchGapResponse(BaseModel):
    success: bool
    result: ResearchGapResultResponse


class ResearchGapListResponse(BaseModel):
    success: bool
    count: int
    results: List[ResearchGapResultResponse]


class ResearchGapDeleteResponse(BaseModel):
    success: bool
    message: str
    result_id: str


def normalize_paper_ids(paper_ids: List[str]) -> List[str]:
    normalized = [
        normalize_uuid(paper_id, "Paper")
        for paper_id in paper_ids
    ]

    if len(set(normalized)) != len(normalized):
        raise HTTPException(
            status_code=400,
            detail="Duplicate paper IDs are not allowed."
        )

    return normalized


def get_owned_papers(
    paper_ids: List[str],
    current_user_id: str,
    db: Session
) -> List[Paper]:
    papers = (
        db.query(Paper)
        .filter(
            Paper.id.in_(paper_ids),
            Paper.user_id == current_user_id
        )
        .all()
    )

    found_ids = {str(paper.id) for paper in papers}
    missing_ids = [
        paper_id
        for paper_id in paper_ids
        if paper_id not in found_ids
    ]

    if missing_ids:
        raise HTTPException(
            status_code=404,
            detail={
                "message": "One or more papers were not found.",
                "missing_paper_ids": missing_ids
            }
        )

    paper_map = {str(paper.id): paper for paper in papers}
    return [paper_map[paper_id] for paper_id in paper_ids]


def serialize_result(result: ResearchGapResult) -> dict:
    return {
        "id": str(result.id),
        "user_id": str(result.user_id),
        "paper_ids": result.paper_ids,
        "result": result.result,
        "created_at": result.created_at,
        "updated_at": result.updated_at
    }


def get_owned_result(
    result_id: str,
    current_user_id: str,
    db: Session
) -> ResearchGapResult:
    normalized_result_id = normalize_uuid(result_id, "Research gap result")
    result = (
        db.query(ResearchGapResult)
        .filter(
            ResearchGapResult.id == normalized_result_id,
            ResearchGapResult.user_id == current_user_id
        )
        .first()
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Research gap result not found."
        )

    return result


@router.get("", response_model=ResearchGapListResponse)
def list_research_gaps(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    results = (
        db.query(ResearchGapResult)
        .filter(ResearchGapResult.user_id == current_user_id)
        .order_by(ResearchGapResult.created_at.desc())
        .all()
    )

    return {
        "success": True,
        "count": len(results),
        "results": [serialize_result(result) for result in results]
    }


@router.get("/{result_id}", response_model=ResearchGapResponse)
def get_research_gap(
    result_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    return {
        "success": True,
        "result": serialize_result(
            get_owned_result(result_id, current_user_id, db)
        )
    }


@router.post("", response_model=ResearchGapResponse)
def create_research_gap(
    payload: ResearchGapCreate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    paper_ids = normalize_paper_ids(payload.paper_ids)
    selected_papers = get_owned_papers(paper_ids, current_user_id, db)

    try:
        generated_result = generate_research_gaps(selected_papers)
    except HTTPException:
        raise
    except Exception as error:
        raise ai_service_exception("Research gap generation", error)

    research_gap = ResearchGapResult(
        user_id=current_user_id,
        paper_ids=paper_ids,
        result=generated_result.model_dump()
    )

    try:
        db.add(research_gap)
        db.commit()
        db.refresh(research_gap)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to save research gap result."
        )

    return {
        "success": True,
        "result": serialize_result(research_gap)
    }


@router.delete("/{result_id}", response_model=ResearchGapDeleteResponse)
def delete_research_gap(
    result_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    research_gap = get_owned_result(result_id, current_user_id, db)

    try:
        db.delete(research_gap)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to delete research gap result."
        )

    return {
        "success": True,
        "message": "Research gap result deleted successfully.",
        "result_id": result_id
    }
