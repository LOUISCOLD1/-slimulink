"""
语音合成接口

把AI的文字回答转成语音文件，小程序可以直接播放。
"""

import os
from enum import Enum

from fastapi import APIRouter
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from starlette.background import BackgroundTask

from app.services.tts_service import text_to_speech

router = APIRouter()


class VoiceEnum(str, Enum):
    zh_female = "zh_female"
    zh_male = "zh_male"
    zh_news = "zh_news"


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="要转语音的文字")
    voice: VoiceEnum = VoiceEnum.zh_female
    rate: str = Field(default="+0%", pattern=r'^[+-]\d{1,3}%$', description="语速，如+0%、+20%、-20%")


def _remove_file(path: str):
    """响应发送完成后删除临时音频文件"""
    try:
        os.remove(path)
    except OSError:
        pass


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
        voice=req.voice.value,
        rate=req.rate,
    )
    # 响应发送后自动删除临时文件，防止磁盘泄漏
    return FileResponse(
        filepath,
        media_type="audio/mpeg",
        filename="speech.mp3",
        background=BackgroundTask(_remove_file, filepath),
    )
