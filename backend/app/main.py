import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.papers import router as papers_router
from app.api.routes.note import router as note_router
from app.api.routes.bookmarks import router as bookmarks_router
from app.api.routes.compare import router as compare_router
from app.api.routes.literature_review import router as literature_review_router
from app.api.routes.assistant import router as assistant_router
from app.api.routes.conversations import router as conversations_router
from app.api.routes.comparisons import router as comparisons_router
from app.api.routes.research_gaps import router as research_gaps_router


from app.db.database import Base, engine, ensure_schema

from app.models.paper import Paper
from app.models.note import Note
from app.models.bookmark import Bookmark
from app.models.conversation import Conversation, ConversationMessage
from app.models.comparison_result import ComparisonResult
from app.models.research_gap_result import ResearchGapResult

load_dotenv()

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]

app = FastAPI(
    title="ResearchFlow AI API",
    description="AI-powered research paper analysis backend",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)
ensure_schema()


@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "ResearchFlow AI backend is running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ResearchFlow AI"
    }


app.include_router(papers_router)
app.include_router(note_router)
app.include_router(bookmarks_router)
app.include_router(compare_router)
app.include_router(literature_review_router)
app.include_router(assistant_router)
app.include_router(conversations_router)
app.include_router(comparisons_router)
app.include_router(research_gaps_router)