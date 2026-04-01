import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.routers import translate, tts

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="AI Voice Translator",
    description="AI-powered voice translation with oral noise filtering",
    version="1.0.0",
)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(translate.router)
app.include_router(tts.router)


@app.get("/")
async def root():
    return {"message": "AI Voice Translator API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
