from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.models import User, TranslationRecord
from app.core.security import get_current_user
from app.models.schemas import HistoryItem, HistoryListResponse

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("", response_model=HistoryListResponse)
async def get_history(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get paginated translation history for the current user."""
    # Count total
    count_result = await db.execute(
        select(func.count()).select_from(TranslationRecord).where(TranslationRecord.user_id == user.id)
    )
    total = count_result.scalar() or 0

    # Fetch page
    offset = (page - 1) * size
    result = await db.execute(
        select(TranslationRecord)
        .where(TranslationRecord.user_id == user.id)
        .order_by(TranslationRecord.created_at.desc())
        .offset(offset)
        .limit(size)
    )
    records = result.scalars().all()

    return HistoryListResponse(
        items=[HistoryItem.model_validate(r) for r in records],
        total=total,
        page=page,
        size=size,
    )


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_record(
    record_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single translation record."""
    result = await db.execute(
        select(TranslationRecord).where(
            TranslationRecord.id == record_id,
            TranslationRecord.user_id == user.id,
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")

    await db.delete(record)
