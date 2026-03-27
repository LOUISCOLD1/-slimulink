"""
语音识别接口

小程序录音 → 上传音频文件 → 后端识别为文字 → 返回给前端
"""

from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from app.services.stt_service import recognize_speech

# 上传文件大小限制（10MB）
MAX_UPLOAD_SIZE = 10 * 1024 * 1024

router = APIRouter()


@router.post("/api/stt")
async def speech_to_text(
    audio: UploadFile = File(..., description="录音文件（mp3/wav）"),
    lang: str = Form(default="zh", description="语言: zh=中文, mn=蒙语"),
):
    """
    语音识别接口

    小程序通过 wx.uploadFile 上传录音文件到这里。

    请求：multipart/form-data
      - audio: 录音文件
      - lang: 语言（zh/mn）

    返回：
      {"text": "识别出的文字", "success": true}
    """
    # 分块读取，超出大小限制时提前终止，防止内存耗尽
    chunks = []
    total_size = 0
    while True:
        chunk = await audio.read(64 * 1024)  # 每次读64KB
        if not chunk:
            break
        total_size += len(chunk)
        if total_size > MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=413, detail="录音文件过大（最大10MB）")
        chunks.append(chunk)
    audio_data = b"".join(chunks)

    if len(audio_data) == 0:
        return {"text": "", "success": False, "error": "录音文件为空"}

    # 从文件名判断格式
    filename = audio.filename or "audio.mp3"
    if filename.endswith(".wav"):
        fmt = "wav"
    elif filename.endswith(".pcm"):
        fmt = "pcm"
    else:
        fmt = "mp3"

    result = recognize_speech(audio_data, format=fmt, lang=lang)
    return result
