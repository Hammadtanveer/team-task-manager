"""
Authentication routes – Signup and Login.
Uses bcrypt (via passlib) for password hashing and python-jose for JWT tokens.
"""

from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.database import get_db
from app.models.user import User, UserRole
from app.middleware.auth import create_access_token, Token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# ── Password hashing ────────────────────────────────────────────────────────

import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


# ── Request / Response Schemas ───────────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, examples=["John Doe"])
    email: EmailStr = Field(..., examples=["john@example.com"])
    password: str = Field(..., min_length=6, max_length=128)
    role: UserRole = Field(default=UserRole.MEMBER)

    model_config = {"json_schema_extra": {"examples": [
        {"name": "John Doe", "email": "john@example.com", "password": "secret123", "role": "MEMBER"}
    ]}}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime

    model_config = {"from_attributes": True}


class SignupResponse(BaseModel):
    message: str
    user: UserResponse


class LoginResponse(BaseModel):
    message: str
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post(
    "/signup",
    response_model=SignupResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def signup(payload: SignupRequest, db: Annotated[Session, Depends(get_db)]):
    """
    Create a new user account.

    - Checks that the email is not already registered.
    - Hashes the password with bcrypt before storing.
    - Returns the created user (without the password hash).
    """
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )

    new_user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return SignupResponse(
        message="User registered successfully",
        user=UserResponse.model_validate(new_user),
    )


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Authenticate and receive a JWT token",
)
def login(payload: LoginRequest, db: Annotated[Session, Depends(get_db)]):
    """
    Authenticate a user with email + password and return a JWT access token.

    Raises:
        HTTPException 401: If the email is not found or the password is wrong.
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value}
    )

    return LoginResponse(
        message="Login successful",
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user",
)
def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    """Return the profile of the currently authenticated user."""
    return UserResponse.model_validate(current_user)


@router.get(
    "/users",
    response_model=list[UserResponse],
    summary="Get all users",
)
def get_all_users(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Return a list of all users."""
    users = db.query(User).all()
    return users
