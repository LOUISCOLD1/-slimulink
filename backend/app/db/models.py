from datetime import datetime
from sqlalchemy import String, Text, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    display_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    last_active_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    translation_records: Mapped[list["TranslationRecord"]] = relationship(back_populates="user")
    conversations: Mapped[list["Conversation"]] = relationship(back_populates="user")
    settings: Mapped["UserSettings | None"] = relationship(back_populates="user", uselist=False)


class TranslationRecord(Base):
    __tablename__ = "translation_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    original_text: Mapped[str] = mapped_column(Text)
    cleaned_text: Mapped[str] = mapped_column(Text)
    translated_text: Mapped[str] = mapped_column(Text)
    source_lang: Mapped[str] = mapped_column(String(10))
    target_lang: Mapped[str] = mapped_column(String(10))
    engine_used: Mapped[str | None] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), index=True)

    user: Mapped["User"] = relationship(back_populates="translation_records")


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    source_lang: Mapped[str] = mapped_column(String(10))
    target_lang: Mapped[str] = mapped_column(String(10))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="conversations")
    messages: Mapped[list["ConversationMessage"]] = relationship(
        back_populates="conversation", cascade="all, delete-orphan"
    )


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    conversation_id: Mapped[int] = mapped_column(ForeignKey("conversations.id", ondelete="CASCADE"), index=True)
    speaker: Mapped[str] = mapped_column(String(1))  # "A" or "B"
    original_text: Mapped[str] = mapped_column(Text)
    cleaned_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    translated_text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    conversation: Mapped["Conversation"] = relationship(back_populates="messages")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    source_lang: Mapped[str] = mapped_column(String(10), default="zh")
    target_lang: Mapped[str] = mapped_column(String(10), default="en")
    tts_voice_source: Mapped[str | None] = mapped_column(String(50), nullable=True)
    tts_voice_target: Mapped[str | None] = mapped_column(String(50), nullable=True)
    auto_play_tts: Mapped[bool] = mapped_column(Boolean, default=True)

    user: Mapped["User"] = relationship(back_populates="settings")
