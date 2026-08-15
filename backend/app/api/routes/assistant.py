from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.db.database import get_db
from app.models.paper import Paper
from app.services.ai_service import ask_paper_question


router = APIRouter(
    prefix="/api/assistant",
    tags=["AI Assistant"]
)


# ============================================================
# Request Schema
# ============================================================

class ConversationMessage(BaseModel):

    role: str

    content: str


class AssistantRequest(BaseModel):

    paper_id: str

    question: str

    conversation_history: list[ConversationMessage] = Field(
        default_factory=list
    )


# ============================================================
# Ask AI Assistant
# ============================================================

@router.post("/ask")
def ask_assistant(
    request: AssistantRequest,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Validate question
    # --------------------------------------------------------

    if not request.question.strip():

        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    # --------------------------------------------------------
    # Find paper
    # --------------------------------------------------------

    paper = (
        db.query(Paper)
        .filter(Paper.id == request.paper_id)
        .first()
    )

    if not paper:

        raise HTTPException(
            status_code=404,
            detail="Paper not found."
        )

    # --------------------------------------------------------
    # Check full paper text
    # --------------------------------------------------------

    if not paper.full_text:

        raise HTTPException(
            status_code=400,
            detail=(
                "Full paper text is not available. "
                "Please re-upload and analyze the paper."
            )
        )

    try:

        # ----------------------------------------------------
        # Convert Pydantic messages to dictionaries
        # ----------------------------------------------------

        conversation_history = [

            {
                "role": message.role,
                "content": message.content
            }

            for message in request.conversation_history
        ]

        # ----------------------------------------------------
        # Ask AI
        # ----------------------------------------------------

        answer = ask_paper_question(
            paper=paper,
            question=request.question,
            conversation_history=conversation_history
        )

        # ----------------------------------------------------
        # Return response
        # ----------------------------------------------------

        return {
            "success": True,
            "paper_id": str(paper.id),
            "question": request.question,
            "answer": answer
        }

    except Exception as error:

        print(
            "AI Assistant Error:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=f"AI assistant failed: {str(error)}"
        )