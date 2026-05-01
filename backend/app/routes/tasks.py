"""
Task CRUD routes with role-based access control.
- ADMIN: full CRUD, assign tasks to users
- MEMBER: view tasks, update status of tasks assigned to them
"""

from datetime import date, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.task import Task, TaskStatus
from app.models.project import Project
from app.models.user import User, UserRole
from app.middleware.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    status: TaskStatus = Field(default=TaskStatus.TODO)
    due_date: date | None = None
    project_id: int
    assigned_to: int | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    status: TaskStatus | None = None
    due_date: date | None = None
    assigned_to: int | None = None


class TaskStatusUpdate(BaseModel):
    """Schema specifically for members updating only the status of their own task."""
    status: TaskStatus


class TaskAssign(BaseModel):
    """Schema for assigning a task to a user."""
    assigned_to: int


class TaskAssignee(BaseModel):
    id: int
    name: str
    email: str

    model_config = {"from_attributes": True}


class TaskProjectInfo(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None
    status: TaskStatus
    due_date: date | None
    project_id: int
    project: TaskProjectInfo
    assigned_to: int | None
    assignee: TaskAssignee | None
    created_at: datetime

    model_config = {"from_attributes": True}


class TaskListResponse(BaseModel):
    count: int
    tasks: list[TaskResponse]


# ── Helper ───────────────────────────────────────────────────────────────────

def _get_task_or_404(task_id: int, db: Session) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found",
        )
    return task


def _validate_project(project_id: int, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )
    return project


def _validate_assignee(user_id: int, db: Session) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )
    return user


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task (ADMIN only)",
)
def create_task(
    payload: TaskCreate,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    """Create a task within a project. Optionally assign it to a user."""
    _validate_project(payload.project_id, db)

    if payload.assigned_to is not None:
        _validate_assignee(payload.assigned_to, db)

    task = Task(
        title=payload.title,
        description=payload.description,
        status=payload.status,
        due_date=payload.due_date,
        project_id=payload.project_id,
        assigned_to=payload.assigned_to,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return TaskResponse.model_validate(task)


@router.get(
    "/",
    response_model=TaskListResponse,
    summary="List all tasks",
)
def list_tasks(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    project_id: int | None = None,
    assigned_to: int | None = None,
    task_status: TaskStatus | None = None,
    skip: int = 0,
    limit: int = 50,
):
    """
    List tasks with optional filters:
    - `project_id`: filter by project
    - `assigned_to`: filter by assignee
    - `task_status`: filter by status (TODO, IN_PROGRESS, DONE)
    """
    query = db.query(Task)

    if project_id is not None:
        query = query.filter(Task.project_id == project_id)
    if assigned_to is not None:
        query = query.filter(Task.assigned_to == assigned_to)
    if task_status is not None:
        query = query.filter(Task.status == task_status)

    tasks = query.offset(skip).limit(limit).all()
    return TaskListResponse(
        count=len(tasks),
        tasks=[TaskResponse.model_validate(t) for t in tasks],
    )


@router.get(
    "/my",
    response_model=TaskListResponse,
    summary="List tasks assigned to the current user",
)
def list_my_tasks(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    task_status: TaskStatus | None = None,
    skip: int = 0,
    limit: int = 50,
):
    """Return tasks assigned to the currently authenticated user."""
    query = db.query(Task).filter(Task.assigned_to == current_user.id)
    if task_status is not None:
        query = query.filter(Task.status == task_status)
    tasks = query.offset(skip).limit(limit).all()
    return TaskListResponse(
        count=len(tasks),
        tasks=[TaskResponse.model_validate(t) for t in tasks],
    )


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Get task details",
)
def get_task(
    task_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """Retrieve a single task by its ID."""
    task = _get_task_or_404(task_id, db)
    return TaskResponse.model_validate(task)


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update a task (ADMIN only)",
)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    """Full update of a task. Requires admin role."""
    task = _get_task_or_404(task_id, db)

    if payload.assigned_to is not None:
        _validate_assignee(payload.assigned_to, db)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return TaskResponse.model_validate(task)


@router.patch(
    "/{task_id}/status",
    response_model=TaskResponse,
    summary="Update task status (owner or ADMIN)",
)
def update_task_status(
    task_id: int,
    payload: TaskStatusUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    """
    Update only the status of a task.
    - ADMIN can update any task's status.
    - MEMBER can only update the status of tasks assigned to them.
    """
    task = _get_task_or_404(task_id, db)

    if current_user.role != UserRole.ADMIN and task.assigned_to != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update the status of tasks assigned to you",
        )

    task.status = payload.status
    db.commit()
    db.refresh(task)
    return TaskResponse.model_validate(task)


@router.patch(
    "/{task_id}/assign",
    response_model=TaskResponse,
    summary="Assign a task to a user (ADMIN only)",
)
def assign_task(
    task_id: int,
    payload: TaskAssign,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    """Assign or reassign a task to a user. Requires admin role."""
    task = _get_task_or_404(task_id, db)
    _validate_assignee(payload.assigned_to, db)

    task.assigned_to = payload.assigned_to
    db.commit()
    db.refresh(task)
    return TaskResponse.model_validate(task)


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a task (ADMIN only)",
)
def delete_task(
    task_id: int,
    admin: Annotated[User, Depends(require_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    """Delete a task by its ID. Requires admin role."""
    task = _get_task_or_404(task_id, db)
    db.delete(task)
    db.commit()
    return {"message": f"Task '{task.title}' deleted successfully"}
