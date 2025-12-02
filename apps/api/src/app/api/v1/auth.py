from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.db.session import get_db
from app.schemas import LoginRequest, Token, TokenRefresh, UserCreate, UserResponse
from app.services.user import authenticate_user, create_user, get_user_by_email, get_user_by_id

router = APIRouter(prefix="/auth", tags=["auth"])


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Set HttpOnly cookies for access and refresh tokens."""
    # Access token cookie (shorter expiry)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,  # type: ignore[arg-type]
        domain=settings.cookie_domain,
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )
    # Refresh token cookie (longer expiry)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,  # type: ignore[arg-type]
        domain=settings.cookie_domain,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        path="/",
    )


def clear_auth_cookies(response: Response) -> None:
    """Clear auth cookies on logout."""
    response.delete_cookie(
        key="access_token",
        domain=settings.cookie_domain,
        path="/",
    )
    response.delete_cookie(
        key="refresh_token",
        domain=settings.cookie_domain,
        path="/",
    )


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    user_in: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    existing = await get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = await create_user(db, user_in)
    return UserResponse.model_validate(user)


@router.post("/login", response_model=Token)
async def login(
    credentials: LoginRequest,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Token:
    user = await authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )
    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    # Set HttpOnly cookies
    set_auth_cookies(response, access_token, refresh_token)

    # Also return tokens in response body for backward compatibility
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=Token)
async def refresh_token(
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    token_data: TokenRefresh | None = None,
    refresh_token_cookie: str | None = Cookie(None, alias="refresh_token"),
) -> Token:
    # Prefer cookie, fall back to body for backward compatibility
    token = refresh_token_cookie or (token_data.refresh_token if token_data else None)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required",
        )

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    user = await get_user_by_id(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    access_token = create_access_token(str(user.id))
    new_refresh_token = create_refresh_token(str(user.id))

    # Set HttpOnly cookies
    set_auth_cookies(response, access_token, new_refresh_token)

    return Token(access_token=access_token, refresh_token=new_refresh_token)


@router.post("/logout")
async def logout(response: Response) -> dict[str, str]:
    """Clear auth cookies."""
    clear_auth_cookies(response)
    return {"message": "Logged out successfully"}
