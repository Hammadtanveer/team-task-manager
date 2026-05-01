"""
FastAPI application entry point.
- Registers all routers (auth, projects, tasks)
- Configures CORS middleware
- Creates database tables on startup
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.models import User, Project, Task  # noqa: F401 – ensure models are imported
from app.routes import auth, projects, tasks


# ── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup (if they don't exist)."""
    Base.metadata.create_all(bind=engine)
    yield


# ── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Team Task Manager API",
    description=(
        "A production-ready REST API for managing team projects and tasks "
        "with role-based access control (ADMIN / MEMBER)."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────

import os

frontend_url = os.getenv("FRONTEND_URL")
origins = [
    "http://localhost:5173", 
    "http://localhost:5174", 
    "http://localhost:5175", 
    "http://127.0.0.1:5173"
]
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)


# ── Health Check ─────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def health_check():
    """Simple health check endpoint."""
    return {
        "status": "healthy",
        "service": "Team Task Manager API",
        "version": "1.0.0-FIXED",
    }
