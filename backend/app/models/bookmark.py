import uuid

from datetime import datetime

from sqlalchemy import Column, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class Bookmark(Base):

    __tablename__ = "bookmarks"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    paper_id = Column(
        UUID(as_uuid=True),
        nullable=False
    )

    title = Column(
        Text,
        nullable=False
    )

    location = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )