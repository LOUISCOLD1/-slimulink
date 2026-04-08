import json
import logging
from openai import AsyncOpenAI
from app.core.config import get_settings
from app.core.prompts import build_translate_prompt, build_context_prompt

logger = logging.getLogger(__name__)

# In-memory session context storage
_session_contexts: dict[str, list[dict]] = {}


def _is_real_key(key: str) -> bool:
    """Check if an API key looks real (not a placeholder)."""
    if not key:
        return False
    placeholders = {"your_deepseek_api_key_here", "your_zhipuai_api_key_here", ""}
    return key.strip() not in placeholders and not key.startswith("your_")


def _get_clients() -> list[tuple[str, AsyncOpenAI, str]]:
    """Return list of (name, client, model) tuples in priority order."""
    settings = get_settings()
    clients = []
    if _is_real_key(settings.deepseek_api_key):
        clients.append((
            "DeepSeek",
            AsyncOpenAI(api_key=settings.deepseek_api_key, base_url=settings.deepseek_base_url),
            settings.deepseek_model,
        ))
    if _is_real_key(settings.zhipuai_api_key):
        clients.append((
            "ZhipuAI",
            AsyncOpenAI(api_key=settings.zhipuai_api_key, base_url=settings.zhipuai_base_url),
            settings.zhipuai_model,
        ))
    return clients


def get_session_context(session_id: str | None) -> list[dict]:
    if not session_id:
        return []
    return _session_contexts.get(session_id, [])


def save_session_context(session_id: str | None, original: str, translated: str):
    if not session_id:
        return
    settings = get_settings()
    if session_id not in _session_contexts:
        _session_contexts[session_id] = []
    _session_contexts[session_id].append({"original": original, "translated": translated})
    # Keep only the last N messages
    _session_contexts[session_id] = _session_contexts[session_id][-settings.max_context_messages:]


async def translate_text(
    text: str,
    target_language: str,
    session_id: str | None = None,
) -> dict:
    """Translate text using AI with oral noise filtering.

    Returns: {"cleaned": str, "translated": str}
    """
    clients = _get_clients()
    if not clients:
        # Demo mode: return mock response when no API keys configured
        return {
            "cleaned": text,
            "translated": f"[Demo] Translation of: {text}",
        }

    system_prompt = build_translate_prompt(target_language)
    context = get_session_context(session_id)
    context_prompt = build_context_prompt(context)

    user_content = text
    if context_prompt:
        user_content = f"{context_prompt}\n\n新内容：{text}"

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content},
    ]

    last_error = None
    for name, client, model in clients:
        try:
            logger.info(f"Trying {name} ({model})...")
            response = await client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.3,
                max_tokens=1024,
            )
            content = response.choices[0].message.content.strip()
            result = _parse_response(content, text)
            save_session_context(session_id, text, result["translated"])
            logger.info(f"Translation via {name} succeeded")
            return result
        except Exception as e:
            logger.warning(f"{name} failed: {e}")
            last_error = e
            continue

    raise RuntimeError(f"All translation engines failed. Last error: {last_error}")


async def translate_text_stream(
    text: str,
    target_language: str,
    session_id: str | None = None,
):
    """Stream translation using AI. Yields SSE events."""
    clients = _get_clients()
    if not clients:
        yield {"event": "original", "data": {"text": text}}
        yield {"event": "cleaned", "data": {"text": text}}
        yield {"event": "translation", "data": {"text": f"[Demo] Translation of: {text}", "done": True}}
        return

    system_prompt = build_translate_prompt(target_language)
    context = get_session_context(session_id)
    context_prompt = build_context_prompt(context)

    user_content = text
    if context_prompt:
        user_content = f"{context_prompt}\n\n新内容：{text}"

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content},
    ]

    # Send original text immediately
    yield {"event": "original", "data": {"text": text}}

    last_error = None
    for name, client, model in clients:
        try:
            logger.info(f"Trying streaming via {name} ({model})...")
            response = await client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.3,
                max_tokens=1024,
                stream=True,
            )
            full_content = ""
            async for chunk in response:
                delta = chunk.choices[0].delta.content
                if delta:
                    full_content += delta

            result = _parse_response(full_content.strip(), text)
            yield {"event": "cleaned", "data": {"text": result["cleaned"]}}
            yield {"event": "translation", "data": {"text": result["translated"], "done": True}}
            save_session_context(session_id, text, result["translated"])
            return
        except Exception as e:
            logger.warning(f"{name} streaming failed: {e}")
            last_error = e
            continue

    yield {"event": "error", "data": {"message": f"All engines failed: {last_error}"}}


def _parse_response(content: str, original_text: str) -> dict:
    """Parse LLM response JSON. Falls back gracefully."""
    # Try to extract JSON from the response
    try:
        # Handle cases where LLM wraps JSON in markdown code blocks
        if "```" in content:
            start = content.find("{")
            end = content.rfind("}") + 1
            if start != -1 and end > start:
                content = content[start:end]
        result = json.loads(content)
        return {
            "cleaned": result.get("cleaned", original_text),
            "translated": result.get("translated", content),
        }
    except (json.JSONDecodeError, KeyError):
        # If JSON parsing fails, treat the entire response as the translation
        return {
            "cleaned": original_text,
            "translated": content,
        }
