from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.bookmark import Bookmark


router = APIRouter(
    prefix="/api/papers",
    tags=["Bookmarks"]
)


# ============================================================
# Request Body
# ============================================================

class BookmarkCreate(BaseModel):
    title: str
    location: Optional[str] = None


# ============================================================
# Create Bookmark
# ============================================================

@router.post("/{paper_id}/bookmarks")
def create_bookmark(
    paper_id: str,
    bookmark_data: BookmarkCreate,
    db: Session = Depends(get_db)
):

    try:

        bookmark = Bookmark(
            paper_id=paper_id,
            title=bookmark_data.title,
            location=bookmark_data.location
        )

        db.add(bookmark)
        db.commit()
        db.refresh(bookmark)

        return {
            "success": True,
            "message": "Bookmark created successfully.",
            "bookmark": {
                "id": str(bookmark.id),
                "paper_id": str(bookmark.paper_id),
                "title": bookmark.title,
                "location": bookmark.location,
                "created_at": bookmark.created_at
            }
        }

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to create bookmark: {str(error)}"
        )


# ============================================================
# Get Bookmarks
# ============================================================

@router.get("/{paper_id}/bookmarks")
def get_bookmarks(
    paper_id: str,
    db: Session = Depends(get_db)
):

    bookmarks = (
        db.query(Bookmark)
        .filter(Bookmark.paper_id == paper_id)
        .order_by(Bookmark.created_at.desc())
        .all()
    )

    return {
        "success": True,
        "count": len(bookmarks),
        "bookmarks": [
            {
                "id": str(bookmark.id),
                "paper_id": str(bookmark.paper_id),
                "title": bookmark.title,
                "location": bookmark.location,
                "created_at": bookmark.created_at
            }
            for bookmark in bookmarks
        ]
    }


# ============================================================
# Delete Bookmark
# ============================================================

@router.delete("/{paper_id}/bookmarks/{bookmark_id}")
def delete_bookmark(
    paper_id: str,
    bookmark_id: str,
    db: Session = Depends(get_db)
):

    bookmark = (
        db.query(Bookmark)
        .filter(
            Bookmark.id == bookmark_id,
            Bookmark.paper_id == paper_id
        )
        .first()
    )

    if not bookmark:
        raise HTTPException(
            status_code=404,
            detail="Bookmark not found."
        )

    try:

        db.delete(bookmark)
        db.commit()

        return {
            "success": True,
            "message": "Bookmark deleted successfully.",
            "bookmark_id": bookmark_id
        }

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete bookmark: {str(error)}"
        )