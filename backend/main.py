"""
FastAPI application entry point.
- Registers all routers (auth, projects, tasks)
- Configures CORS middleware
- Creates database tables on startup
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import os

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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routers ─────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)


# ── Health Check ─────────────────────────────────────────────────────────────

@app.get("/api/health", tags=["Health"])
def health_check():
    """Simple health check endpoint."""
    return {
        "status": "healthy",
        "service": "Team Task Manager API",
        "version": "1.0.0-FIXED",
    }


# ── Static Files & SPA Support ──────────────────────────────────────────────

from pathlib import Path

def find_frontend_path():
    # Try different possible locations for frontend/dist
    # 1. Root level (if main.py is in backend/)
    path1 = Path(__file__).resolve().parent.parent / "frontend" / "dist"
    # 2. Same level (if main.py was moved to root)
    path2 = Path(__file__).resolve().parent / "frontend" / "dist"
    # 3. Inside backend (if copied there)
    path3 = Path(__file__).resolve().parent / "dist"

    for p in [path1, path2, path3]:
        if (p / "index.html").exists():
            return p
    return None

frontend_path = find_frontend_path()

if frontend_path:
    # Mount the static files
    app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="frontend")

    # Handle client-side routing: redirect 404s to index.html
    @app.exception_handler(404)
    async def spa_handler(request: Request, exc):
        if request.url.path.startswith("/api"):
            return JSONResponse(
                status_code=404,
                content={"detail": str(exc.detail) if hasattr(exc, "detail") else "Not Found"}
            )
        
        index_file = frontend_path / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        return JSONResponse(status_code=404, content={"detail": "Frontend build not found"})
else:
    # Fallback if frontend is missing
    @app.get("/")
    def root_fallback():
        return {"message": "API is running, but frontend build was not found. Please run 'npm run build' in the frontend folder."}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
