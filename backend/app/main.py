from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.papers import router as papers_router


app = FastAPI(
    title="ResearchFlow AI API",
    description="AI-powered research paper analysis backend",
    version="1.0.0"
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "ResearchFlow AI backend is running"
    }


# Health check
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ResearchFlow AI"
    }


# Paper routes
app.include_router(papers_router)