import uuid

from datetime import datetime

from sqlalchemy import Column, DateTime, Index, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.db.database import Base


class ComparisonResult(Base):

    __tablename__ = "comparison_results"

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

    comparison_result = Column(
        JSONB,
        nullable=True
    )

    ai_analysis = Column(
        JSONB,
        nullable=True
    )

    literature_review = Column(
        JSONB,
        nullable=True
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
        UniqueConstraint(
            "user_id",
            "paper_ids",
            name="uq_comparison_results_user_papers"
        ),
        Index(
            "ix_comparison_results_user_papers",
            "user_id",
            "paper_ids"
        ),
    )
