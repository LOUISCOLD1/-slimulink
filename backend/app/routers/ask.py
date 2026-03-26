"""
政策问答接口

小程序调这个接口就能实现：用户提问 → AI回答
"""

from fastapi import APIRouter
from pydantic import BaseModel
from app.services.llm_service import ask_policy

router = APIRouter()


class AskRequest(BaseModel):
    question: str           # 用户的问题
    lang: str = "zh"        # 语言: "zh"=汉语, "mn"=蒙语
    engine: str = "zhipu"   # AI引擎: "zhipu"(免费) 或 "deepseek"


class AskResponse(BaseModel):
    answer: str             # AI的回答
    sources: list[str]      # 引用的政策文件


@router.post("/api/ask", response_model=AskResponse)
def policy_ask(req: AskRequest):
    """
    政策问答接口

    请求示例：
    POST /api/ask
    {
        "question": "低保怎么申请？需要什么材料？",
        "lang": "zh",
        "engine": "zhipu"
    }

    返回示例：
    {
        "answer": "根据《XX旗最低生活保障办法》，申请低保需要...",
        "sources": ["zh_低保政策.txt"]
    }
    """
    result = ask_policy(
        question=req.question,
        lang=req.lang,
        engine=req.engine,
    )
    return AskResponse(answer=result["answer"], sources=result["sources"])
