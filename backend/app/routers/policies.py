"""
政策卡片接口

返回结构化的政策信息，给小程序展示用。
"""

import json
import os
from typing import Optional

from fastapi import APIRouter, HTTPException

router = APIRouter()

# 政策卡片数据文件路径
CARDS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "policy_cards.json")

# 启动时加载一次，避免每次请求都读磁盘
_cards_cache: list[dict] | None = None


def _load_cards() -> list[dict]:
    """加载政策卡片数据（带缓存）"""
    global _cards_cache
    if _cards_cache is not None:
        return _cards_cache
    if not os.path.exists(CARDS_FILE):
        _cards_cache = []
        return _cards_cache
    with open(CARDS_FILE, "r", encoding="utf-8") as f:
        _cards_cache = json.load(f)
    return _cards_cache


def reload_cards():
    """手动刷新缓存（更新政策数据后调用）"""
    global _cards_cache
    _cards_cache = None


@router.get("/api/policies")
def list_policies(category: Optional[str] = None):
    """
    获取政策卡片列表

    可按分类筛选：/api/policies?category=补贴

    返回示例：
    [
        {
            "id": "dibao",
            "title_zh": "农村最低生活保障",
            "title_mn": "...",
            "category": "低保",
            "summary": "家庭人均收入低于当地标准的农牧民可申请",
            "money": "每人每年6500元",
            "where": "嘎查村委会",
            "phone": "0470-XXXXXXX",
            "materials": ["身份证", "户口本", "收入证明"],
            "deadline": null
        }
    ]
    """
    cards = _load_cards()
    if category:
        cards = [c for c in cards if c.get("category") == category]
    return cards


@router.get("/api/policies/{policy_id}")
def get_policy(policy_id: str):
    """获取单条政策详情"""
    cards = _load_cards()
    for card in cards:
        if card.get("id") == policy_id:
            return card
    raise HTTPException(status_code=404, detail="未找到该政策")
