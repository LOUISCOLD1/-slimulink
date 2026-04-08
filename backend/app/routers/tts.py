from fastapi import APIRouter
from fastapi.responses import Response
from app.models.schemas import TTSRequest
from app.services.tts_service import synthesize_speech, AVAILABLE_VOICES

router = APIRouter(prefix="/api", tags=["tts"])


@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech, return MP3 audio."""
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


@router.get("/voices")
async def get_voices():
    """Return available TTS voices grouped by language."""
    return AVAILABLE_VOICES
