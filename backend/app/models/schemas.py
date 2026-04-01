from pydantic import BaseModel


class TranslateRequest(BaseModel):
    text: str
    source_language: str = "auto"
    target_language: str = "English"
    session_id: str | None = None


class TranslateResponse(BaseModel):
    original_text: str
    cleaned_text: str
    translated_text: str


class TTSRequest(BaseModel):
    text: str
    language: str = "en"
    voice: str | None = None


class LanguageOption(BaseModel):
    code: str
    name: str
    native_name: str
    tts_voice: str
