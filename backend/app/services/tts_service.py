"""
语音合成服务：把文字变成语音

使用 edge-tts（微软Edge浏览器的TTS引擎），完全免费，效果很好。
支持中文男声、女声，语速可调。
"""

import logging
import os
import uuid

import edge_tts

logger = logging.getLogger(__name__)

# 音频输出目录
AUDIO_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "audio_cache")
os.makedirs(AUDIO_DIR, exist_ok=True)

# 缓存文件最长保留时间（秒），默认1小时
CACHE_TTL = 3600

# 可用的中文语音（Edge TTS 自带的）
VOICES = {
    "zh_female": "zh-CN-XiaoxiaoNeural",   # 女声，温柔
    "zh_male": "zh-CN-YunxiNeural",         # 男声，自然
    "zh_news": "zh-CN-YunyangNeural",       # 男声，新闻播报风格
}


def _cleanup_old_audio():
    """清理过期的音频缓存文件"""
    now = time.time()
    try:
        for filename in os.listdir(AUDIO_DIR):
            filepath = os.path.join(AUDIO_DIR, filename)
            if os.path.isfile(filepath) and filepath.endswith(".mp3"):
                if now - os.path.getmtime(filepath) > CACHE_TTL:
                    os.remove(filepath)
    except OSError:
        pass


async def text_to_speech(
    text: str,
    voice: str = "zh_female",
    rate: str = "+0%",
) -> str:
    """
    文字转语音

    参数：
        text: 要转换的文字
        voice: 语音类型，"zh_female"/"zh_male"/"zh_news"
        rate: 语速，"+0%"=正常，"+20%"=加快，"-20%"=减慢

    返回：
        音频文件路径（mp3格式）
    """
    # 每次生成前清理过期缓存
    _cleanup_old_audio()

    voice_name = VOICES.get(voice, VOICES["zh_female"])
    filename = f"{uuid.uuid4().hex}.mp3"
    filepath = os.path.join(AUDIO_DIR, filename)

    communicate = edge_tts.Communicate(text, voice_name, rate=rate)
    await communicate.save(filepath)

    return filepath
