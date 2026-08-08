from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.pdf_service import extract_text_from_pdf
from app.services.ai_service import analyze_research_paper


router = APIRouter(
    prefix="/api/papers",
    tags=["Papers"]
)


@router.post("/extract")
async def extract_pdf(file: UploadFile = File(...)):

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


@router.post("/analyze")
async def analyze_pdf(file: UploadFile = File(...)):

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

        # Step 1: Extract text
        result = extract_text_from_pdf(file_bytes)

        extracted_text = result["full_text"]

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract readable text from this PDF."
            )

        # Step 2: Send text to Gemini
        analysis = analyze_research_paper(
            extracted_text
        )

        return {
            "success": True,
            "filename": file.filename,
            "page_count": result["page_count"],
            "analysis": analysis.model_dump()
        }

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(error)}"
        )