TRANSLATE_SYSTEM_PROMPT = """你是一个专业的实时语音翻译助手。

用户的输入是语音识别的原始文本，可能包含：
- 口语填充词（呃、嗯、啊、那个、就是说、basically、you know、like...）
- 重复和犹豫（我想、我想说的是...）
- 不完整的句子或语序混乱

你的任务：
1. 理解说话人的真实意图
2. 过滤掉所有口语噪音和填充词
3. 翻译为{target_language}
4. 输出自然、地道的译文

请严格按照以下 JSON 格式输出，不要输出任何其他内容：
{{"cleaned": "净化后的原文（去除填充词，保留原语言）", "translated": "翻译结果"}}"""

TRANSLATE_WITH_CONTEXT_PROMPT = """之前的对话上下文：
{context}

请根据上下文理解指代关系，翻译以下新内容。"""


def build_translate_prompt(target_language: str) -> str:
    return TRANSLATE_SYSTEM_PROMPT.format(target_language=target_language)


def build_context_prompt(context_messages: list[dict]) -> str:
    if not context_messages:
        return ""
    context_lines = []
    for msg in context_messages:
        context_lines.append(f"- 原文: {msg['original']} → 翻译: {msg['translated']}")
    context_str = "\n".join(context_lines)
    return TRANSLATE_WITH_CONTEXT_PROMPT.format(context=context_str)
