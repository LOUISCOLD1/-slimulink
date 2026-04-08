from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.models import User, UserSettings
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.models.schemas import UserCreate, UserLogin, Token, UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=Token)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user and return JWT token."""
    # Check if username exists
    result = await db.execute(select(User).where(User.username == data.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    user = User(
        username=data.username,
        password_hash=hash_password(data.password),
        display_name=data.display_name or data.username,
    )
    db.add(user)
    await db.flush()

    # Create default settings
    settings = UserSettings(user_id=user.id)
    db.add(settings)

    token = create_access_token(user.id, user.username)
    return Token(access_token=token)


@router.post("/login", response_model=Token)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT token."""
    result = await db.execute(select(User).where(User.username == data.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    token = create_access_token(user.id, user.username)
    return Token(access_token=token)


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    """Get current authenticated user info."""
    return user
