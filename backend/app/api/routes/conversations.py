from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.core.data import normalize_uuid
from app.core.errors import ai_service_exception
from app.db.database import get_db
from app.models.conversation import Conversation, ConversationMessage
from app.models.paper import Paper
from app.services.ai_service import ask_paper_question


router = APIRouter(
    prefix="/api/conversations",
    tags=["Conversations"]
)


class ConversationCreate(BaseModel):
    paper_id: str
    title: str | None = None


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: str
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime



def get_owned_paper(
    paper_id: str,
    current_user_id: str,
    db: Session
) -> Paper:
    paper_id = normalize_uuid(paper_id, "Paper")
    paper = (
        db.query(Paper)
        .filter(
            Paper.id == paper_id,
            Paper.user_id == current_user_id
        )
        .first()
    )
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")
    return paper



def get_owned_conversation(
    conversation_id: str,
    current_user_id: str,
    db: Session
) -> Conversation:
    conversation_id = normalize_uuid(conversation_id, "Conversation")
    conversation = (
        db.query(Conversation)
        .join(Paper, Paper.id == Conversation.paper_id)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user_id,
            Paper.user_id == current_user_id
        )
        .first()
    )
    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found."
        )
    return conversation



def serialize_message(message: ConversationMessage) -> dict:
    return {
        "id": str(message.id),
        "role": message.role,
        "content": message.content,
        "created_at": message.created_at
    }



def serialize_conversation(conversation: Conversation) -> dict:
    return {
        "id": str(conversation.id),
        "paper_id": str(conversation.paper_id),
        "title": conversation.title,
        "created_at": conversation.created_at,
        "updated_at": conversation.updated_at,
        "messages": [
            serialize_message(message)
            for message in conversation.messages
        ]
    }


@router.post("")
def create_conversation(
    conversation_data: ConversationCreate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    paper = get_owned_paper(
        conversation_data.paper_id,
        current_user_id,
        db
    )

    title = (conversation_data.title or "New conversation").strip()
    if not title:
        title = "New conversation"

    conversation = Conversation(
        user_id=current_user_id,
        paper_id=paper.id,
        title=title
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return {
        "success": True,
        "conversation": serialize_conversation(conversation)
    }


@router.get("")
def list_conversations(
    paper_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    get_owned_paper(paper_id, current_user_id, db)

    conversations = (
        db.query(Conversation)
        .filter(
            Conversation.paper_id == paper_id,
            Conversation.user_id == current_user_id
        )
        .order_by(Conversation.updated_at.desc())
        .all()
    )

    return {
        "success": True,
        "count": len(conversations),
        "conversations": [
            serialize_conversation(conversation)
            for conversation in conversations
        ]
    }


@router.get("/{conversation_id}")
def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    conversation = get_owned_conversation(
        conversation_id,
        current_user_id,
        db
    )

    return {
        "success": True,
        "conversation": serialize_conversation(conversation)
    }


@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    conversation = get_owned_conversation(
        conversation_id,
        current_user_id,
        db
    )
    db.delete(conversation)
    db.commit()

    return {
        "success": True,
        "message": "Conversation deleted successfully.",
        "conversation_id": conversation_id
    }


@router.post("/{conversation_id}/messages")
def send_message(
    conversation_id: str,
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    content = message_data.content.strip()
    if not content:
        raise HTTPException(
            status_code=400,
            detail="Message content cannot be empty."
        )

    conversation = get_owned_conversation(
        conversation_id,
        current_user_id,
        db
    )
    paper = get_owned_paper(
        str(conversation.paper_id),
        current_user_id,
        db
    )
    if not paper.full_text:
        raise HTTPException(
            status_code=400,
            detail=(
                "Full paper text is not available. "
                "Please re-upload and analyze the paper."
            )
        )

    user_message = ConversationMessage(
        conversation_id=conversation.id,
        role="user",
        content=content
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    previous_messages = (
        db.query(ConversationMessage)
        .filter(
            ConversationMessage.conversation_id == conversation.id,
            ConversationMessage.id != user_message.id
        )
        .order_by(ConversationMessage.created_at.asc())
        .all()
    )
    history = [
        {
            "role": message.role,
            "content": message.content
        }
        for message in previous_messages
    ]

    try:
        answer = ask_paper_question(
            paper=paper,
            question=content,
            conversation_history=history
        )

        assistant_message = ConversationMessage(
            conversation_id=conversation.id,
            role="assistant",
            content=answer
        )
        conversation.updated_at = datetime.utcnow()
        db.add(assistant_message)
        db.commit()
        db.refresh(assistant_message)

        return {
            "success": True,
            "conversation_id": str(conversation.id),
            "user_message": serialize_message(user_message),
            "assistant_message": serialize_message(assistant_message),
            "answer": answer
        }

    except HTTPException:
        raise

    except Exception as error:
        db.rollback()
        raise ai_service_exception("AI assistant", error)
