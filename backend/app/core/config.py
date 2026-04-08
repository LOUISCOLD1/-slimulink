from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # DeepSeek (primary)
    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-chat"

    # ZhipuAI (fallback)
    zhipuai_api_key: str = ""
    zhipuai_base_url: str = "https://open.bigmodel.cn/api/paas/v4"
    zhipuai_model: str = "glm-4-flash"

    # Database
    database_url: str = "sqlite+aiosqlite:///./data/app.db"

    # JWT
    jwt_secret: str = "change-me-in-production-use-a-random-string"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    # App settings
    default_target_language: str = "English"
    max_context_messages: int = 10
    cors_origins: list[str] = ["*"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
