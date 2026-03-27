"""
语音识别服务（STT）：把语音变成文字

支持两种方案：
  1. 百度语音识别（免费额度大，推荐）
  2. 讯飞语音识别（备选）

百度语音：https://ai.baidu.com/tech/speech
  - 短语音识别：免费额度 5000次/天（个人开发者）
  - 注册拿 APP_ID + API_KEY + SECRET_KEY
"""

import base64
import logging
import threading
import time

import requests
from app.core.config import (
    BAIDU_STT_APP_ID, BAIDU_STT_API_KEY, BAIDU_STT_SECRET_KEY,
    XFYUN_APP_ID, XFYUN_API_KEY,
)

logger = logging.getLogger(__name__)

# 百度语音 access_token 缓存（线程安全）
_baidu_token = None
_baidu_token_expires = 0
_baidu_token_lock = threading.Lock()


def _get_baidu_token() -> str:
    """获取百度语音API的access_token（有效期30天，自动缓存，线程安全）"""
    global _baidu_token, _baidu_token_expires

    if _baidu_token and time.time() < _baidu_token_expires:
        return _baidu_token

    with _baidu_token_lock:
        # 双重检查：拿到锁之后再检查一次，防止多个线程重复刷新
        if _baidu_token and time.time() < _baidu_token_expires:
            return _baidu_token

        if not BAIDU_STT_API_KEY or not BAIDU_STT_SECRET_KEY:
            raise ValueError("百度语音服务暂不可用")

        resp = requests.post(
            "https://aip.baidubce.com/oauth/2.0/token",
            params={
                "grant_type": "client_credentials",
                "client_id": BAIDU_STT_API_KEY,
                "client_secret": BAIDU_STT_SECRET_KEY,
            },
            timeout=10,
        )
        resp.raise_for_status()
        result = resp.json()

        _baidu_token = result["access_token"]
        _baidu_token_expires = time.time() + result.get("expires_in", 2592000) - 60
        return _baidu_token


def recognize_baidu(audio_data: bytes, format: str = "mp3", lang: str = "zh") -> str:
    """
    百度语音识别

    参数：
        audio_data: 音频文件的二进制数据
        format: 音频格式 "mp3" / "wav" / "pcm"
        lang: 语言 "zh"=中文, "en"=英语

    返回：
        识别出的文字
    """
    token = _get_baidu_token()

    # 百度语音识别的语言代码
    dev_pid = 1537  # 普通话（有标点）
    if lang == "en":
        dev_pid = 1737  # 英语

    audio_base64 = base64.b64encode(audio_data).decode("utf-8")

    resp = requests.post(
        "https://vop.baidu.com/server/api",
        json={
            "format": format,
            "rate": 16000,
            "channel": 1,
            "cuid": BAIDU_STT_APP_ID or "policy-assistant",
            "token": token,
            "dev_pid": dev_pid,
            "speech": audio_base64,
            "len": len(audio_data),
        },
        timeout=30,
    )
    resp.raise_for_status()
    result = resp.json()

    if result.get("err_no") == 0:
        # 识别成功，返回第一个结果
        return result["result"][0] if result.get("result") else ""
    else:
        err_msg = result.get("err_msg", "未知错误")
        logger.warning("百度语音识别失败: %s - %s", result.get("err_no"), err_msg)
        return ""


def recognize_speech(audio_data: bytes, format: str = "mp3", lang: str = "zh") -> dict:
    """
    语音识别统一入口

    返回 dict 包含 text、success、error 字段，方便前端展示错误信息。
    蒙语暂不支持时返回明确提示。
    """
    # 蒙语语音识别暂不支持，返回明确提示
    if lang == "mn":
        return {
            "text": "",
            "success": False,
            "error": "蒙语语音识别暂不支持，请使用汉语语音或文字输入",
        }

    try:
        text = recognize_baidu(audio_data, format=format, lang=lang)
        return {
            "text": text,
            "success": bool(text),
            "error": "" if text else "未能识别语音内容，请重试",
        }
    except Exception as e:
        logger.error("语音识别失败: %s", e)
        return {
            "text": "",
            "success": False,
            "error": "语音识别服务异常，请稍后重试",
        }
