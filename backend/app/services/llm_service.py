"""
RAG 第3步：把检索到的政策片段 + 用户问题 一起发给AI，生成回答

这就是RAG和直接问ChatGPT的区别：
- ChatGPT：凭自己的记忆回答，经常编造
- 我们的AI：先搜到真实政策文件，再基于文件内容回答

流程：
  用户问 "低保怎么申请？"
  → retriever 搜到3段相关政策
  → 把3段政策 + 用户问题 拼成一个prompt
  → 发给智谱GLM，让它基于政策原文回答
  → AI回答 "根据《XX办法》，低保标准为..."
"""

from zhipuai import ZhipuAI
from openai import OpenAI
from app.core.config import ZHIPU_API_KEY, DEEPSEEK_API_KEY
from app.rag.retriever import search_policies


# ============================================
# Prompt模板 —— 这是AI回答质量的关键
# 可以反复调整这个模板来优化回答效果
# ============================================

POLICY_QA_PROMPT = """你是一位服务于内蒙古农牧民的政策咨询助手。

## 你的职责
根据下方提供的【政策文件】内容，用简单易懂的口语回答牧民的问题。
就像一位热心的村干部在面对面跟牧民解释政策一样。

## 重要规则
1. **只根据【政策文件】中的内容回答**，绝对不要编造任何数字、标准或流程
2. 如果政策文件中没有相关信息，直接说："这个问题我暂时查不到对应的政策，建议您拨打当地政务服务热线 12345 咨询"
3. 回答要简短、口语化，别用官方公文的语气
4. 涉及到金额、材料、流程时，用列表形式展示，看着清楚
5. 最后标注信息来源

## 回答语言
请用{language}回答。

## 政策文件
{context}

## 牧民的问题
{question}

## 你的回答"""


def _build_prompt(question: str, lang: str = "zh") -> str:
    """
    组装prompt：搜索相关政策 + 填入模板

    这就是RAG的核心：不是让AI凭空回答，而是先找到相关文件再回答
    """
    # 从向量数据库搜索相关政策
    policies = search_policies(question, lang=lang, top_k=3)

    if not policies:
        context = "（未找到相关政策文件）"
        sources = []
    else:
        # 把搜到的政策片段拼在一起
        context_parts = []
        sources = []
        for i, p in enumerate(policies):
            context_parts.append(f"【文件{i+1}：{p['policy_name']}】\n{p['content']}")
            if p["source"] not in sources:
                sources.append(p["source"])
        context = "\n\n".join(context_parts)

    language = "简单易懂的汉语" if lang == "zh" else "蒙古语"
    prompt = POLICY_QA_PROMPT.format(
        language=language,
        context=context,
        question=question,
    )

    return prompt, sources


def ask_policy_zhipu(question: str, lang: str = "zh") -> dict:
    """
    使用智谱GLM-4-Flash回答政策问题（免费）

    返回：
        {
            "answer": "根据政策，低保标准为...",
            "sources": ["zh_低保政策.txt"],
        }
    """
    if not ZHIPU_API_KEY:
        return {"answer": "错误：未配置智谱API Key，请在.env文件中设置ZHIPU_API_KEY", "sources": []}

    prompt, sources = _build_prompt(question, lang)

    client = ZhipuAI(api_key=ZHIPU_API_KEY)
    response = client.chat.completions.create(
        model="glm-4-flash",  # 免费模型
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,  # 低温度 = 回答更稳定，少胡说
        max_tokens=1000,
    )

    answer = response.choices[0].message.content
    return {"answer": answer, "sources": sources}


def ask_policy_deepseek(question: str, lang: str = "zh") -> dict:
    """
    使用DeepSeek回答政策问题（备选，极低成本）

    DeepSeek兼容OpenAI的SDK，所以用openai库就行
    """
    if not DEEPSEEK_API_KEY:
        return {"answer": "错误：未配置DeepSeek API Key，请在.env文件中设置DEEPSEEK_API_KEY", "sources": []}

    prompt, sources = _build_prompt(question, lang)

    client = OpenAI(
        api_key=DEEPSEEK_API_KEY,
        base_url="https://api.deepseek.com",
    )
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=1000,
    )

    answer = response.choices[0].message.content
    return {"answer": answer, "sources": sources}


def ask_policy(question: str, lang: str = "zh", engine: str = "zhipu") -> dict:
    """
    统一入口：提问政策问题

    engine: "zhipu"（默认免费） 或 "deepseek"（备选）

    自动降级：智谱挂了就切DeepSeek
    """
    try:
        if engine == "zhipu":
            return ask_policy_zhipu(question, lang)
        else:
            return ask_policy_deepseek(question, lang)
    except Exception as e:
        print(f"⚠️  {engine} 调用失败: {e}，尝试备选引擎...")
        try:
            if engine == "zhipu":
                return ask_policy_deepseek(question, lang)
            else:
                return ask_policy_zhipu(question, lang)
        except Exception as e2:
            return {
                "answer": f"抱歉，AI服务暂时不可用，请稍后再试。建议直接拨打12345咨询。",
                "sources": [],
            }
