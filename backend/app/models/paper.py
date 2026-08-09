import uuid

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.db.database import Base


class Paper(Base):

    __tablename__ = "papers"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

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

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )