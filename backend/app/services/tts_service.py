import io
import edge_tts

# Language code to Edge TTS voice mapping
VOICE_MAP: dict[str, str] = {
    "zh": "zh-CN-XiaoxiaoNeural",
    "zh-CN": "zh-CN-XiaoxiaoNeural",
    "zh-TW": "zh-TW-HsiaoChenNeural",
    "en": "en-US-JennyNeural",
    "en-US": "en-US-JennyNeural",
    "en-GB": "en-GB-SoniaNeural",
    "ja": "ja-JP-NanamiNeural",
    "ko": "ko-KR-SunHiNeural",
    "fr": "fr-FR-DeniseNeural",
    "de": "de-DE-KatjaNeural",
    "es": "es-ES-ElviraNeural",
    "ru": "ru-RU-SvetlanaNeural",
    "pt": "pt-BR-FranciscaNeural",
    "ar": "ar-SA-ZariyahNeural",
    "th": "th-TH-PremwadeeNeural",
    "vi": "vi-VN-HoaiMyNeural",
}

# All available voices for settings page
AVAILABLE_VOICES: dict[str, list[dict]] = {
    "zh": [
        {"id": "zh-CN-XiaoxiaoNeural", "name": "Xiaoxiao (Female)"},
        {"id": "zh-CN-YunxiNeural", "name": "Yunxi (Male)"},
        {"id": "zh-CN-YunjianNeural", "name": "Yunjian (Male)"},
    ],
    "en": [
        {"id": "en-US-JennyNeural", "name": "Jenny (Female)"},
        {"id": "en-US-GuyNeural", "name": "Guy (Male)"},
        {"id": "en-GB-SoniaNeural", "name": "Sonia (British Female)"},
    ],
    "ja": [
        {"id": "ja-JP-NanamiNeural", "name": "Nanami (Female)"},
        {"id": "ja-JP-KeitaNeural", "name": "Keita (Male)"},
    ],
    "ko": [
        {"id": "ko-KR-SunHiNeural", "name": "SunHi (Female)"},
        {"id": "ko-KR-InJoonNeural", "name": "InJoon (Male)"},
    ],
}


def get_voice(language: str, voice: str | None = None) -> str:
    """Get the TTS voice for a given language."""
    if voice:
        return voice
    return VOICE_MAP.get(language, VOICE_MAP.get(language.split("-")[0], "en-US-JennyNeural"))


async def synthesize_speech(text: str, language: str = "en", voice: str | None = None) -> bytes:
    """Convert text to speech using Edge TTS. Returns MP3 audio bytes."""
    selected_voice = get_voice(language, voice)
    communicate = edge_tts.Communicate(text, selected_voice)

    audio_buffer = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_buffer.write(chunk["data"])

    return audio_buffer.getvalue()
