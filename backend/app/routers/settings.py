from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.models import User, UserSettings
from app.core.security import get_current_user
from app.models.schemas import UserSettingsSchema

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=UserSettingsSchema)
async def get_settings(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user settings."""
    result = await db.execute(select(UserSettings).where(UserSettings.user_id == user.id))
    settings = result.scalar_one_or_none()
    if not settings:
        settings = UserSettings(user_id=user.id)
        db.add(settings)
        await db.flush()
    return UserSettingsSchema.model_validate(settings)


@router.put("", response_model=UserSettingsSchema)
async def update_settings(
    data: UserSettingsSchema,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user settings."""
    result = await db.execute(select(UserSettings).where(UserSettings.user_id == user.id))
    settings = result.scalar_one_or_none()
    if not settings:
        settings = UserSettings(user_id=user.id)
        db.add(settings)

    settings.source_lang = data.source_lang
    settings.target_lang = data.target_lang
    settings.tts_voice_source = data.tts_voice_source
    settings.tts_voice_target = data.tts_voice_target
    settings.auto_play_tts = data.auto_play_tts

    return UserSettingsSchema.model_validate(settings)
