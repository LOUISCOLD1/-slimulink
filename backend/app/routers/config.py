"""
应用配置接口

返回动态配置信息（提醒、热线电话等），方便运营人员修改而无需更新前端代码。
"""

import json
import os
from fastapi import APIRouter

router = APIRouter()

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "app_config.json")


def _load_config() -> dict:
    if not os.path.exists(CONFIG_FILE):
        return {}
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/api/config")
def get_app_config():
    """
    获取应用动态配置

    返回示例：
    {
        "reminder": {"zh": "...", "mn": "...", "question_zh": "...", "question_mn": "..."},
        "hotline": {"phone": "12345", "name_zh": "政务服务热线", "name_mn": "..."}
    }
    """
    return _load_config()
