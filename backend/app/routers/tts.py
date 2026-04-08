import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from app.models.schemas import TTSRequest
from app.services.tts_service import synthesize_speech, AVAILABLE_VOICES

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["tts"])


@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech, return MP3 audio."""
    try:
        audio_bytes = await synthesize_speech(
            text=request.text,
            language=request.language,
            voice=request.voice,
        )
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=speech.mp3"},
        )
    except Exception as e:
        logger.warning(f"TTS failed: {e}")
        raise HTTPException(status_code=503, detail=f"TTS service unavailable: {e}")


@router.get("/voices")
async def get_voices():
    """Return available TTS voices grouped by language."""
    return AVAILABLE_VOICES
