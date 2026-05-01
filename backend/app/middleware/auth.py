"""
JWT authentication middleware.
Provides token creation and current-user extraction dependencies.
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.database import get_db
from app.models.user import User

load_dotenv()

# ── JWT Configuration ────────────────────────────────────────────────────────

SECRET_KEY: str = os.getenv("SECRET_KEY", "changeme")
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ── Schemas ──────────────────────────────────────────────────────────────────

class TokenData(BaseModel):
    """Data embedded inside the JWT payload."""
    user_id: int | None = None
    role: str | None = None


class Token(BaseModel):
    """Response schema returned after successful authentication."""
    access_token: str
    token_type: str = "bearer"


# ── Token helpers ────────────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Create a signed JWT access token.

    Args:
        data: Payload claims to embed in the token.
        expires_delta: Optional custom expiration duration.

    Returns:
        Encoded JWT string.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ── Dependencies ─────────────────────────────────────────────────────────────

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """
    FastAPI dependency that extracts and validates the current user from
    the Authorization header's Bearer token.

    Raises:
        HTTPException 401: If the token is invalid, expired, or the user
                           no longer exists.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=int(user_id), role=payload.get("role"))
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None:
        raise credentials_exception

    return user


def require_admin(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """
    Dependency that ensures the current user has the ADMIN role.

    Raises:
        HTTPException 403: If the user is not an admin.
    """
    if current_user.role.value != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user
