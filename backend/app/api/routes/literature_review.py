from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.paper import Paper
from app.services.ai_service import generate_literature_review


router = APIRouter(
    prefix="/api/literature-review",
    tags=["Literature Review"]
)


# ============================================================
# Request Body
# ============================================================

class LiteratureReviewRequest(BaseModel):
    paper_ids: List[str]


# ============================================================
# Generate Literature Review
# ============================================================

@router.post("")
def generate_review(
    request: LiteratureReviewRequest,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Validate number of papers
    # --------------------------------------------------------

    if len(request.paper_ids) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please select at least 2 papers for the literature review."
        )

    if len(request.paper_ids) > 4:
        raise HTTPException(
            status_code=400,
            detail="A maximum of 4 papers can be used for the literature review."
        )

    # --------------------------------------------------------
    # Fetch selected papers
    # --------------------------------------------------------

    papers = (
        db.query(Paper)
        .filter(Paper.id.in_(request.paper_ids))
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
                "message": "One or more selected papers were not found.",
                "missing_paper_ids": missing_ids
            }
        )

    # --------------------------------------------------------
    # Preserve selection order
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
    # Generate Literature Review using Gemini
    # --------------------------------------------------------

    try:

        literature_review = generate_literature_review(
            ordered_papers
        )

        return {
            "success": True,
            "count": len(ordered_papers),
            "literature_review": literature_review.model_dump()
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Literature review generation failed: {str(error)}"
        )