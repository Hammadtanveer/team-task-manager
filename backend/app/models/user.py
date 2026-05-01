"""
User ORM model with role-based access control.
"""

import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Enum, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class UserRole(str, enum.Enum):
    """Enum for user roles used in role-based access control."""
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.MEMBER, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    owned_projects = relationship(
        "Project", back_populates="owner", cascade="all, delete-orphan"
    )
    assigned_tasks = relationship(
        "Task", back_populates="assignee", foreign_keys="Task.assigned_to"
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"
