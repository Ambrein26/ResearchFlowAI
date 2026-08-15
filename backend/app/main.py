from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.papers import router as papers_router
from app.api.routes.note import router as note_router
from app.api.routes.bookmarks import router as bookmarks_router
from app.api.routes.compare import router as compare_router
from app.api.routes.literature_review import router as literature_review_router
from app.api.routes.assistant import router as assistant_router


from app.db.database import Base, engine

from app.models.paper import Paper
from app.models.note import Note
from app.models.bookmark import Bookmark

app = FastAPI(
    title="ResearchFlow AI API",
    description="AI-powered research paper analysis backend",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)


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