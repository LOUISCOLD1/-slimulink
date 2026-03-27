"""
牧民智能政策助手 - 后端主入口

启动命令：
  cd backend
  pip install -r requirements.txt
  python -m app.main

第一次启动前需要：
  1. 复制 .env.example 为 .env，填入API Key
  2. 把政策文档放到 app/data/policies/ 目录下
  3. 运行 python -m app.rag.indexer 构建知识库
"""

import logging
import traceback

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.routers import ask, tts, policies, contacts, stt, config
from app.core.config import HOST, PORT, CORS_ORIGINS

logger = logging.getLogger(__name__)

app = FastAPI(
    title="牧民智能政策助手 API",
    description="蒙汉双语AI政策问答服务",
    version="0.1.0",
)

# 允许小程序跨域请求（从环境变量读取白名单，默认允许本地开发）
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局异常处理：未捕获的异常返回友好的错误信息，详细日志记录到后台
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        "未处理的异常: %s %s -> %s\n%s",
        request.method, request.url, exc, traceback.format_exc(),
    )
    return JSONResponse(
        status_code=500,
        content={"error": "服务器内部错误，请稍后再试", "success": False},
    )

# 注册路由
app.include_router(ask.router, tags=["政策问答"])
app.include_router(tts.router, tags=["语音合成"])
app.include_router(stt.router, tags=["语音识别"])
app.include_router(policies.router, tags=["政策卡片"])
app.include_router(contacts.router, tags=["便民电话"])
app.include_router(config.router, tags=["应用配置"])


@app.get("/")
def root():
    return {
        "name": "牧民智能政策助手",
        "version": "0.1.0",
        "endpoints": [
            "POST /api/ask     - 政策问答",
            "POST /api/tts     - 文字转语音",
            "POST /api/stt     - 语音识别",
            "GET  /api/policies - 政策卡片列表",
            "GET  /api/contacts - 便民电话",
            "GET  /api/config   - 应用配置",
        ],
    }


if __name__ == "__main__":
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
