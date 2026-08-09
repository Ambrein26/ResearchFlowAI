from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from app.services.pdf_service import extract_text_from_pdf
from app.services.ai_service import analyze_research_paper
from app.db.database import get_db
from app.models.paper import Paper


router = APIRouter(
    prefix="/api/papers",
    tags=["Papers"]
)


# ============================================================
# Extract PDF
# ============================================================

@router.post("/extract")
async def extract_pdf(
    file: UploadFile = File(...)
):

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded PDF is empty."
        )

    try:

        result = extract_text_from_pdf(file_bytes)

        return {
            "success": True,
            "filename": file.filename,
            "page_count": result["page_count"],
            "text": result["full_text"],
            "pages": result["pages"]
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to process PDF: {str(error)}"
        )


# ============================================================
# Analyze PDF using Gemini + Save to Database
# ============================================================

@router.post("/analyze")
async def analyze_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )

    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded PDF is empty."
        )

    try:

        # ----------------------------------------------------
        # 1. Extract PDF text
        # ----------------------------------------------------

        result = extract_text_from_pdf(file_bytes)

        extracted_text = result["full_text"]

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract readable text from this PDF."
            )

        # ----------------------------------------------------
        # 2. Analyze using Gemini
        # ----------------------------------------------------

        analysis = analyze_research_paper(
            extracted_text
        )

        # ----------------------------------------------------
        # 3. Save analysis to database
        # ----------------------------------------------------

        paper = Paper(
            filename=file.filename,
            title=analysis.title,
            authors=analysis.authors,
            page_count=result["page_count"],
            tldr=analysis.tldr,
            summary=analysis.summary,
            keywords=analysis.keywords,
            research_problem=analysis.research_problem,
            key_contributions=analysis.key_contributions,
            methodology=analysis.methodology,
            dataset=analysis.dataset,
            models_or_algorithms=analysis.models_or_algorithms,
            key_findings=analysis.key_findings,
            limitations=analysis.limitations,
            future_work=analysis.future_work
        )

        db.add(paper)

        db.commit()

        db.refresh(paper)

        # ----------------------------------------------------
        # 4. Return saved result
        # ----------------------------------------------------

        return {
            "success": True,
            "message": "Paper analyzed and saved successfully.",
            "paper_id": str(paper.id),
            "filename": paper.filename,
            "page_count": paper.page_count,
            "analysis": analysis.model_dump()
        }

    except HTTPException:
        raise

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(error)}"
        )


# ============================================================
# Get All Saved Papers
# ============================================================

@router.get("")
def get_papers(
    db: Session = Depends(get_db)
):

    papers = (
        db.query(Paper)
        .order_by(Paper.created_at.desc())
        .all()
    )

    return {
        "success": True,
        "count": len(papers),
        "papers": [
            {
                "id": str(paper.id),
                "filename": paper.filename,
                "title": paper.title,
                "authors": paper.authors,
                "page_count": paper.page_count,
                "tldr": paper.tldr,
                "summary": paper.summary,
                "keywords": paper.keywords,
                "research_problem": paper.research_problem,
                "key_contributions": paper.key_contributions,
                "methodology": paper.methodology,
                "dataset": paper.dataset,
                "models_or_algorithms": paper.models_or_algorithms,
                "key_findings": paper.key_findings,
                "limitations": paper.limitations,
                "future_work": paper.future_work,
                "created_at": paper.created_at
            }
            for paper in papers
        ]
    }
# ============================================================
# Get Single Paper
# ============================================================

@router.get("/{paper_id}")
def get_paper(
    paper_id: str,
    db: Session = Depends(get_db)
):

    paper = (
        db.query(Paper)
        .filter(Paper.id == paper_id)
        .first()
    )

    if not paper:
        raise HTTPException(
            status_code=404,
            detail="Paper not found."
        )

    return {
        "success": True,
        "paper": {
            "id": str(paper.id),
            "filename": paper.filename,
            "title": paper.title,
            "authors": paper.authors,
            "page_count": paper.page_count,
            "tldr": paper.tldr,
            "summary": paper.summary,
            "keywords": paper.keywords,
            "research_problem": paper.research_problem,
            "key_contributions": paper.key_contributions,
            "methodology": paper.methodology,
            "dataset": paper.dataset,
            "models_or_algorithms": paper.models_or_algorithms,
            "key_findings": paper.key_findings,
            "limitations": paper.limitations,
            "future_work": paper.future_work,
            "created_at": paper.created_at
        }
    }
# ============================================================
# Delete Paper
# ============================================================

@router.delete("/{paper_id}")
def delete_paper(
    paper_id: str,
    db: Session = Depends(get_db)
):

    try:

        paper = db.query(Paper).filter(
            Paper.id == paper_id
        ).first()

        if not paper:

            raise HTTPException(
                status_code=404,
                detail="Paper not found."
            )

        db.delete(paper)
        db.commit()

        return {
            "success": True,
            "message": "Paper deleted successfully.",
            "paper_id": paper_id
        }

    except HTTPException:
        raise

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete paper: {str(error)}"
        )