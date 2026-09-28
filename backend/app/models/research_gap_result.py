import uuid

from datetime import datetime

from sqlalchemy import Column, DateTime, Index
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.db.database import Base


class ResearchGapResult(Base):

    __tablename__ = "research_gap_results"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id = Column(
        UUID(as_uuid=True),
        nullable=False,
        index=True
    )

    paper_ids = Column(
        JSONB,
        nullable=False
    )

    result = Column(
        JSONB,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    __table_args__ = (
        Index(
            "ix_research_gap_results_user_id",
            "user_id"
        ),
    )
