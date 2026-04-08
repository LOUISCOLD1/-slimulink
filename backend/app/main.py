import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.db.database import create_tables
from app.routers import translate, tts, auth, history, conversations, settings

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure data directory exists for SQLite
    os.makedirs("data", exist_ok=True)
    await create_tables()
    logging.info("Database tables created")
    yield


app = FastAPI(
    title="AI Voice Translator",
    description="AI-powered voice translation with oral noise filtering",
    version="1.0.0",
    lifespan=lifespan,
)

cfg = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=cfg.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(translate.router)
app.include_router(tts.router)
app.include_router(history.router)
app.include_router(conversations.router)
app.include_router(settings.router)


@app.get("/")
async def root():
    return {"message": "AI Voice Translator API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
