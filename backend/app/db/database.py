import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker


load_dotenv()


DATABASE_URL = os.getenv("DATABASE_URL")


if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured in the environment."
    )


engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def ensure_schema():
    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE papers "
                "ADD COLUMN IF NOT EXISTS user_id UUID"
            )
        )
        connection.execute(
            text(
                "CREATE INDEX IF NOT EXISTS ix_papers_user_id "
                "ON papers (user_id)"
            )
        )
        connection.execute(
            text(
                "DO $$ BEGIN "
                "IF NOT EXISTS (SELECT 1 FROM pg_constraint "
                "WHERE conname = 'notes_paper_id_fkey') THEN "
                "ALTER TABLE notes ADD CONSTRAINT notes_paper_id_fkey "
                "FOREIGN KEY (paper_id) REFERENCES papers(id) "
                "ON DELETE CASCADE NOT VALID; END IF; END $$;"
            )
        )
        connection.execute(
            text(
                "DO $$ BEGIN "
                "IF NOT EXISTS (SELECT 1 FROM pg_constraint "
                "WHERE conname = 'bookmarks_paper_id_fkey') THEN "
                "ALTER TABLE bookmarks ADD CONSTRAINT bookmarks_paper_id_fkey "
                "FOREIGN KEY (paper_id) REFERENCES papers(id) "
                "ON DELETE CASCADE NOT VALID; END IF; END $$;"
            )
        )