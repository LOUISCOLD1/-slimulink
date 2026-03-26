"""
语音合成接口

把AI的文字回答转成语音文件，小程序可以直接播放。
"""

import os
from fastapi import APIRouter
from fastapi.responses import FileResponse
from pydantic import BaseModel
from app.services.tts_service import text_to_speech

router = APIRouter()


class TTSRequest(BaseModel):
    text: str               # 要转语音的文字
    voice: str = "zh_female" # 语音类型
    rate: str = "+0%"        # 语速


@router.post("/api/tts")
async def generate_speech(req: TTSRequest):
    """
    文字转语音接口

    请求示例：
    POST /api/tts
    {
        "text": "低保标准为每人每年6500元",
        "voice": "zh_female",
        "rate": "+0%"
    }

    返回：MP3 音频文件
    """
    filepath = await text_to_speech(
        text=req.text,
        voice=req.voice,
        rate=req.rate,
    )
    return FileResponse(
        filepath,
        media_type="audio/mpeg",
        filename="speech.mp3",
    )
