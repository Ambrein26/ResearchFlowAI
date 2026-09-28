from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.auth import get_current_user_id
from app.core.data import normalize_uuid
from app.core.errors import ai_service_exception
from app.models.paper import Paper
from app.services.ai_service import compare_research_papers


router = APIRouter(
    prefix="/api/compare",
    tags=["Compare"]
)


# ============================================================
# Request Body
# ============================================================

class CompareRequest(BaseModel):
    paper_ids: List[str]


# ============================================================
# Structured Comparison
# ============================================================

@router.post("")
def compare_papers(
    request: CompareRequest,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    request.paper_ids = [
        normalize_uuid(paper_id, "Paper")
        for paper_id in request.paper_ids
    ]

    # --------------------------------------------------------
    # Validate number of papers
    # --------------------------------------------------------

    if len(request.paper_ids) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please select at least 2 papers to compare."
        )

    if len(request.paper_ids) > 6:
        raise HTTPException(
            status_code=400,
            detail="You can compare a maximum of 6 papers at a time."
        )

    # --------------------------------------------------------
    # Fetch papers
    # --------------------------------------------------------

    papers = (
        db.query(Paper)
        .filter(
            Paper.id.in_(request.paper_ids),
            Paper.user_id == current_user_id
        )
        .all()
    )

    # --------------------------------------------------------
    # Check whether all papers exist
    # --------------------------------------------------------

    if len(papers) != len(request.paper_ids):

        found_ids = {
            str(paper.id)
            for paper in papers
        }

        missing_ids = [
            paper_id
            for paper_id in request.paper_ids
            if paper_id not in found_ids
        ]

        raise HTTPException(
            status_code=404,
            detail={
                "message": "One or more papers were not found.",
                "missing_paper_ids": missing_ids
            }
        )

    # --------------------------------------------------------
    # Preserve user's selection order
    # --------------------------------------------------------

    paper_map = {
        str(paper.id): paper
        for paper in papers
    }

    ordered_papers = [
        paper_map[paper_id]
        for paper_id in request.paper_ids
    ]

    # --------------------------------------------------------
    # Build comparison response
    # --------------------------------------------------------

    comparison = []

    for paper in ordered_papers:

        comparison.append(
            {
                "id": str(paper.id),
                "filename": paper.filename,
                "title": paper.title,
                "authors": paper.authors,
                "page_count": paper.page_count,

                "publication_year": None,

                "abstract": paper.summary,

                "keywords": paper.keywords,

                "research_problem": paper.research_problem,

                "key_contributions": paper.key_contributions,

                "methodology": paper.methodology,

                "dataset": paper.dataset,

                "models_or_algorithms": paper.models_or_algorithms,

                "key_findings": paper.key_findings,

                "limitations": paper.limitations,

                "future_work": paper.future_work
            }
        )

    return {
        "success": True,
        "count": len(comparison),
        "papers": comparison
    }


# ============================================================
# AI Comparison
# ============================================================

@router.post("/ai")
def ai_compare_papers(
    request: CompareRequest,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    request.paper_ids = [
        normalize_uuid(paper_id, "Paper")
        for paper_id in request.paper_ids
    ]

    # --------------------------------------------------------
    # Validate number of papers
    # --------------------------------------------------------

    if len(request.paper_ids) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 papers are required for AI comparison."
        )

    if len(request.paper_ids) > 6:
        raise HTTPException(
            status_code=400,
            detail="A maximum of 6 papers can be compared."
        )

    try:

        # ----------------------------------------------------
        # Fetch papers
        # ----------------------------------------------------

        papers = (
            db.query(Paper)
            .filter(
                Paper.id.in_(request.paper_ids),
                Paper.user_id == current_user_id
            )
            .all()
        )

        # ----------------------------------------------------
        # Check whether all papers exist
        # ----------------------------------------------------

        if len(papers) != len(request.paper_ids):

            found_ids = {
                str(paper.id)
                for paper in papers
            }

            missing_ids = [
                paper_id
                for paper_id in request.paper_ids
                if paper_id not in found_ids
            ]

            raise HTTPException(
                status_code=404,
                detail={
                    "message": "One or more papers were not found.",
                    "missing_paper_ids": missing_ids
                }
            )

        # ----------------------------------------------------
        # Preserve user's selection order
        # ----------------------------------------------------

        paper_map = {
            str(paper.id): paper
            for paper in papers
        }

        ordered_papers = [
            paper_map[paper_id]
            for paper_id in request.paper_ids
        ]

        # ----------------------------------------------------
        # Generate AI comparison
        # ----------------------------------------------------

        comparison = compare_research_papers(
            ordered_papers
        )

        # ----------------------------------------------------
        # Return AI comparison
        # ----------------------------------------------------

        return {
            "success": True,
            "comparison": comparison
        }

    except HTTPException:
        raise

    except Exception as error:
        raise ai_service_exception("AI comparison", error)