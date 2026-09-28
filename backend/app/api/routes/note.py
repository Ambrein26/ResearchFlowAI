from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.auth import get_current_user_id
from app.core.data import normalize_uuid
from app.models.paper import Paper
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate


router = APIRouter(
    prefix="/api/papers",
    tags=["Notes"]
)


# ============================================================
# Create Note
# ============================================================

@router.post("/{paper_id}/notes")
def create_note(
    paper_id: str,
    note_data: NoteCreate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    paper_id = normalize_uuid(paper_id, "Paper")

    try:

        content = note_data.content.strip()

        if not content:
            raise HTTPException(
                status_code=400,
                detail="Note content cannot be empty."
            )

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

        note = Note(
            paper_id=paper_id,
            content=content
        )

        db.add(note)
        db.commit()
        db.refresh(note)

        return {
            "success": True,
            "message": "Note created successfully.",
            "note": {
                "id": str(note.id),
                "paper_id": str(note.paper_id),
                "content": note.content,
                "created_at": note.created_at,
                "updated_at": note.updated_at
            }
        }

    except HTTPException:
        raise

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to create note."
        )


# ============================================================
# Get Notes for a Paper
# ============================================================

@router.get("/{paper_id}/notes")
def get_notes(
    paper_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    paper_id = normalize_uuid(paper_id, "Paper")

    try:

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

        notes = (
            db.query(Note)
            .filter(Note.paper_id == paper_id)
            .order_by(Note.created_at.desc())
            .all()
        )

        return {
            "success": True,
            "count": len(notes),
            "notes": [
                {
                    "id": str(note.id),
                    "paper_id": str(note.paper_id),
                    "content": note.content,
                    "created_at": note.created_at,
                    "updated_at": note.updated_at
                }
                for note in notes
            ]
        }

    except HTTPException:
        raise

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Failed to fetch notes."
        )


# ============================================================
# Update Note
# ============================================================

@router.put("/notes/{note_id}")
def update_note(
    note_id: str,
    note_data: NoteUpdate,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    note_id = normalize_uuid(note_id, "Note")

    try:

        note = (
            db.query(Note)
            .join(Paper, Paper.id == Note.paper_id)
            .filter(
                Note.id == note_id,
                Paper.user_id == current_user_id
            )
            .first()
        )

        if not note:
            raise HTTPException(
                status_code=404,
                detail="Note not found."
            )

        content = note_data.content.strip()

        if not content:
            raise HTTPException(
                status_code=400,
                detail="Note content cannot be empty."
            )

        note.content = content

        db.commit()
        db.refresh(note)

        return {
            "success": True,
            "message": "Note updated successfully.",
            "note": {
                "id": str(note.id),
                "paper_id": str(note.paper_id),
                "content": note.content,
                "created_at": note.created_at,
                "updated_at": note.updated_at
            }
        }

    except HTTPException:
        raise

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to update note."
        )


# ============================================================
# Delete Note
# ============================================================

@router.delete("/notes/{note_id}")
def delete_note(
    note_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user_id)
):
    note_id = normalize_uuid(note_id, "Note")

    try:

        note = (
            db.query(Note)
            .join(Paper, Paper.id == Note.paper_id)
            .filter(
                Note.id == note_id,
                Paper.user_id == current_user_id
            )
            .first()
        )

        if not note:
            raise HTTPException(
                status_code=404,
                detail="Note not found."
            )

        db.delete(note)
        db.commit()

        return {
            "success": True,
            "message": "Note deleted successfully.",
            "note_id": note_id
        }

    except HTTPException:
        raise

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to delete note."
        )