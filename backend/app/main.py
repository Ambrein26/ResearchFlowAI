from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.papers import router as papers_router
from app.db.database import Base, engine
from app.models.paper import Paper


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