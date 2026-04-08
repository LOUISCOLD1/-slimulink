from datetime import datetime
from pydantic import BaseModel


# --- Auth ---

class UserCreate(BaseModel):
    username: str
    password: str
    display_name: str | None = None


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    username: str
    display_name: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Translation ---

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


# --- History ---

class HistoryItem(BaseModel):
    id: int
    original_text: str
    cleaned_text: str
    translated_text: str
    source_lang: str
    target_lang: str
    engine_used: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class HistoryListResponse(BaseModel):
    items: list[HistoryItem]
    total: int
    page: int
    size: int


# --- Conversations ---

class ConversationItem(BaseModel):
    id: int
    title: str | None
    source_lang: str
    target_lang: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MessageItem(BaseModel):
    id: int
    speaker: str
    original_text: str
    cleaned_text: str | None
    translated_text: str
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Settings ---

class UserSettingsSchema(BaseModel):
    source_lang: str = "zh"
    target_lang: str = "en"
    tts_voice_source: str | None = None
    tts_voice_target: str | None = None
    auto_play_tts: bool = True

    model_config = {"from_attributes": True}
