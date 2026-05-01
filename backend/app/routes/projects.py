"""
Project CRUD routes with role-based access control.
- ADMIN: create, read, update, delete projects
- MEMBER: read-only access to projects
"""

from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.models.user import User
from app.middleware.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/projects", tags=["Projects"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)


class ProjectOwner(BaseModel):
    id: int
    name: str
    email: str

    model_config = {"from_attributes": True}


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str | None
    owner_id: int
    owner: ProjectOwner
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    count: int
    projects: list[ProjectResponse]


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post(
    "/",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new project (ADMIN only)",
)
def create_project(
    payload: ProjectCreate,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    """Create a new project. The authenticated admin is set as the owner."""
    project = Project(
        name=payload.name,
        description=payload.description,
        owner_id=admin.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectResponse.model_validate(project)


@router.get(
    "/",
    response_model=ProjectListResponse,
    summary="List all projects",
)
def list_projects(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    skip: int = 0,
    limit: int = 50,
):
    """Return a paginated list of all projects. Accessible by any authenticated user."""
    projects = db.query(Project).offset(skip).limit(limit).all()
    return ProjectListResponse(
        count=len(projects),
        projects=[ProjectResponse.model_validate(p) for p in projects],
    )


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Get project details",
)
def get_project(
    project_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Retrieve a single project by its ID."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )
    return ProjectResponse.model_validate(project)


@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Update a project (ADMIN only)",
)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    """Update project name and/or description. Requires admin role."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return ProjectResponse.model_validate(project)


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a project (ADMIN only)",
)
def delete_project(
    project_id: int,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    """
    Delete a project and all its tasks (cascade).
    Requires admin role.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )

    db.delete(project)
    db.commit()
    return {"message": f"Project '{project.name}' deleted successfully"}
