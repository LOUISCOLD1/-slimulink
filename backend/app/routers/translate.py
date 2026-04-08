import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.schemas import TranslateRequest, TranslateResponse
from app.services.llm_service import translate_text, translate_text_stream
from app.db.database import get_db
from app.db.models import User, TranslationRecord
from app.core.security import get_optional_user

router = APIRouter(prefix="/api", tags=["translate"])


@router.post("/translate", response_model=TranslateResponse)
async def translate(
    request: TranslateRequest,
    user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """Non-streaming translation endpoint."""
    result = await translate_text(
        text=request.text,
        target_language=request.target_language,
        session_id=request.session_id,
    )

    # Save to DB if user is authenticated
    if user:
        record = TranslationRecord(
            user_id=user.id,
            original_text=request.text,
            cleaned_text=result["cleaned"],
            translated_text=result["translated"],
            source_lang=request.source_language,
            target_lang=request.target_language,
            engine_used=result.get("engine"),
        )
        db.add(record)

    return TranslateResponse(
        original_text=request.text,
        cleaned_text=result["cleaned"],
        translated_text=result["translated"],
    )


@router.post("/translate/stream")
async def translate_stream(
    request: TranslateRequest,
    user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """SSE streaming translation endpoint."""
    # Collect results to save to DB after streaming
    collected = {"cleaned": "", "translated": "", "engine": None}

    async def event_generator():
        async for event in translate_text_stream(
            text=request.text,
            target_language=request.target_language,
            session_id=request.session_id,
        ):
            event_type = event["event"]
            data = json.dumps(event["data"], ensure_ascii=False)
            yield f"event: {event_type}\ndata: {data}\n\n"

            # Collect for DB save
            if event_type == "cleaned":
                collected["cleaned"] = event["data"]["text"]
            elif event_type == "translation":
                collected["translated"] = event["data"]["text"]

    response = StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

    # Note: DB save after stream is handled via background task approach
    # For now, the non-streaming endpoint handles DB saves
    return response


@router.get("/languages")
async def get_languages():
    """Return supported languages."""
    return [
        {"code": "zh", "name": "Chinese", "native_name": "中文"},
        {"code": "en", "name": "English", "native_name": "English"},
        {"code": "ja", "name": "Japanese", "native_name": "日本語"},
        {"code": "ko", "name": "Korean", "native_name": "한국어"},
        {"code": "fr", "name": "French", "native_name": "Français"},
        {"code": "de", "name": "German", "native_name": "Deutsch"},
        {"code": "es", "name": "Spanish", "native_name": "Español"},
        {"code": "ru", "name": "Russian", "native_name": "Русский"},
        {"code": "pt", "name": "Portuguese", "native_name": "Português"},
        {"code": "ar", "name": "Arabic", "native_name": "العربية"},
        {"code": "th", "name": "Thai", "native_name": "ไทย"},
        {"code": "vi", "name": "Vietnamese", "native_name": "Tiếng Việt"},
    ]
