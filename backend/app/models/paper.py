import uuid

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class Paper(Base):

    __tablename__ = "papers"

    # ============================================================
    # Primary Key
    # ============================================================

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id = Column(
        UUID(as_uuid=True),
        nullable=True,
        index=True
    )

    # ============================================================
    # Basic Information
    # ============================================================

    filename = Column(
        String(255),
        nullable=False
    )

    title = Column(
        String(500),
        nullable=False
    )

    authors = Column(
        JSONB,
        nullable=False,
        default=list
    )

    page_count = Column(
        Integer,
        nullable=True
    )

    # ============================================================
    # ORIGINAL PDF TEXT
    # ============================================================

    full_text = Column(
        Text,
        nullable=True
    )

    # ============================================================
    # AI Analysis
    # ============================================================

    tldr = Column(
        Text,
        nullable=True
    )

    summary = Column(
        Text,
        nullable=True
    )

    keywords = Column(
        JSONB,
        nullable=True
    )

    research_problem = Column(
        Text,
        nullable=True
    )

    key_contributions = Column(
        JSONB,
        nullable=True
    )

    methodology = Column(
        Text,
        nullable=True
    )

    dataset = Column(
        Text,
        nullable=True
    )

    models_or_algorithms = Column(
        JSONB,
        nullable=True
    )

    key_findings = Column(
        JSONB,
        nullable=True
    )

    limitations = Column(
        JSONB,
        nullable=True
    )

    future_work = Column(
        JSONB,
        nullable=True
    )

    # ============================================================
    # Timestamp
    # ============================================================

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    conversations = relationship(
        "Conversation",
        back_populates="paper",
        cascade="all, delete-orphan"
    )

    notes = relationship(
        "Note",
        back_populates="paper",
        cascade="all, delete-orphan"
    )

    bookmarks = relationship(
        "Bookmark",
        back_populates="paper",
        cascade="all, delete-orphan"
    )