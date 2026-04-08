# AI Voice Translator

AI-powered voice translation app — not just translating what you said, but understanding what you truly mean.

## Features

- **AI Oral Noise Filtering** — Automatically removes filler words (uh, um, like, you know) and extracts core meaning
- **Three-Panel Display** — Original speech → AI refined text → Translation result
- **Multi-Language** — Chinese, English, Japanese, Korean, French, German, Spanish, Russian, and more
- **Voice Playback** — Edge TTS with multiple voices per language
- **Conversation Mode** — Face-to-face bilingual dialogue with split screen
- **User Accounts** — JWT authentication, server-synced history and settings
- **Cross-Platform** — Web, Android (Capacitor), Desktop (Electron)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Tailwind CSS + Vite |
| Backend | Python FastAPI |
| Database | SQLite (async, via SQLAlchemy 2.0) |
| AI Translation | DeepSeek-V3 (primary) + ZhipuAI GLM-4-Flash (fallback) |
| Voice Recognition | Web Speech API (browser-native, free) |
| Voice Synthesis | Edge TTS (free, 12+ languages) |
| Auth | JWT (python-jose + bcrypt) |
| Mobile Packaging | Capacitor (iOS/Android) |
| Desktop Packaging | Electron |

## Quick Start

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your API keys
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in Chrome or Edge (required for Web Speech API).

### 3. Docker (Full Stack)

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys
docker compose up --build
```

Frontend at `http://localhost`, API at `http://localhost:8000`.

## API Key Configuration

| Provider | Cost | How to Get |
|----------|------|-----------|
| **DeepSeek** (recommended) | Sign-up bonus: 5M tokens free | Register at deepseek.com |
| **ZhipuAI** (fallback) | Completely free (GLM-4-Flash) | Register at open.bigmodel.cn |

Edit `backend/.env`:
```
DEEPSEEK_API_KEY=sk-xxxxx
ZHIPUAI_API_KEY=xxxxx.xxxxx
```

## Cross-Platform Packaging

### Android/iOS (Capacitor)

```bash
cd frontend
npm run build
npx cap add android    # First time only
npx cap sync
npx cap open android   # Opens Android Studio
```

### Desktop (Electron)

```bash
cd frontend
npm run electron:dev   # Development
npm run electron:build # Package for distribution
```

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry + lifespan
│   │   ├── core/
│   │   │   ├── config.py        # Environment config
│   │   │   ├── prompts.py       # AI translation prompts
│   │   │   └── security.py      # JWT + password hashing
│   │   ├── db/
│   │   │   ├── database.py      # Async SQLAlchemy engine
│   │   │   └── models.py        # 5 ORM models
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic request/response models
│   │   ├── routers/
│   │   │   ├── auth.py          # Register, login, me
│   │   │   ├── translate.py     # Translation (streaming SSE)
│   │   │   ├── tts.py           # Text-to-speech
│   │   │   ├── history.py       # Translation history CRUD
│   │   │   ├── conversations.py # Conversation sessions
│   │   │   └── settings.py      # User preferences
│   │   └── services/
│   │       ├── llm_service.py   # AI translation (DeepSeek/ZhipuAI)
│   │       └── tts_service.py   # Edge TTS
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Router + auth guard + navigation
│   │   ├── pages/               # 5 pages (Login, Translate, Conversation, History, Settings)
│   │   ├── components/          # RecordButton, TranslationPanel, LanguageSelector
│   │   ├── hooks/               # useVoiceRecorder, useTranslation, useTTS
│   │   ├── services/api.ts      # Backend API client with auth
│   │   └── stores/              # Zustand state management
│   ├── electron/                # Electron desktop entry
│   ├── capacitor.config.ts      # Mobile packaging config
│   ├── Dockerfile
│   └── nginx.conf
│
└── docker-compose.yml
```
