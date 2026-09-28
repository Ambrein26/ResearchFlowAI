from datetime import datetime
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.core.data import normalize_uuid
from app.db.database import get_db
from app.models.comparison_result import ComparisonResult
from app.models.paper import Paper


router = APIRouter(
    prefix="/api/comparisons",
    tags=["Comparison History"]
)


class ComparisonResultPayload(BaseModel):
    paper_ids: List[str] = Field(min_length=2, max_length=6)
    comparison_result: Any | None = None
    ai_analysis: Any | None = None
    literature_review: Any | None = None


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
    return sorted(normalized)


def verify_owned_papers(
    paper_ids: List[str],
    current_user_id: str,
    db: Session
) -> None:
    papers = (
        db.query(Paper)
        .filter(
            Paper.id.in_(paper_ids),
            Paper.user_id == current_user_id
        )
        .all()
    )
    found_ids = {str(paper.id) for paper in papers}
    missing_ids = [paper_id for paper_id in paper_ids if paper_id not in found_ids]
    if missing_ids:
        raise HTTPException(
            status_code=404,
            detail={
                "message": "One or more papers were not found.",
                "missing_paper_ids": missing_ids
            }
        )


def serialize_result(result: ComparisonResult) -> dict:
    return {
        "id": str(result.id),
        "user_id": str(result.user_id),
        "paper_ids": result.paper_ids,
        "comparison_result": result.comparison_result,
        "ai_analysis": result.ai_analysis,
        "literature_review": result.literature_review,
        "created_at": result.created_at,
        "updated_at": result.updated_at
    }


def get_owned_result(
    comparison_id: str,
    current_user_id: str,
    db: Session
) -> ComparisonResult:
    comparison_id = normalize_uuid(comparison_id, "Saved comparison")
    result = (
        db.query(ComparisonResult)
        .filter(
            ComparisonResult.id == comparison_id,
            ComparisonResult.user_id == current_user_id
        )
        .first()
    )
    if not result:
        raise HTTPException(
            status_code=404,
            detail="Saved comparison not found."
        )
    return result


@router.get("")
def list_comparisons(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    results = (
        db.query(ComparisonResult)
        .filter(ComparisonResult.user_id == current_user_id)
        .order_by(ComparisonResult.updated_at.desc())
        .all()
    )
    return {
        "success": True,
        "count": len(results),
        "comparisons": [serialize_result(result) for result in results]
    }


@router.get("/{comparison_id}")
def get_comparison(
    comparison_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    return {
        "success": True,
        "comparison": serialize_result(
            get_owned_result(comparison_id, current_user_id, db)
        )
    }


@router.post("")
def save_comparison(
    payload: ComparisonResultPayload,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    paper_ids = normalize_paper_ids(payload.paper_ids)
    verify_owned_papers(paper_ids, current_user_id, db)

    result = (
        db.query(ComparisonResult)
        .filter(ComparisonResult.user_id == current_user_id)
        .all()
    )
    result = next(
        (
            item for item in result
            if sorted(str(paper_id) for paper_id in item.paper_ids) == paper_ids
        ),
        None
    )

    if result is None:
        result = ComparisonResult(
            user_id=current_user_id,
            paper_ids=paper_ids
        )
        db.add(result)

    if payload.comparison_result is not None:
        result.comparison_result = payload.comparison_result
    if payload.ai_analysis is not None:
        result.ai_analysis = payload.ai_analysis
    if payload.literature_review is not None:
        result.literature_review = payload.literature_review
    result.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(result)

    return {
        "success": True,
        "comparison": serialize_result(result)
    }


@router.delete("/{comparison_id}")
def delete_comparison(
    comparison_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    result = get_owned_result(comparison_id, current_user_id, db)
    db.delete(result)
    db.commit()
    return {
        "success": True,
        "message": "Saved comparison deleted successfully.",
        "comparison_id": comparison_id
    }
