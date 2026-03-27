"""
便民电话接口
"""

import json
import os
from fastapi import APIRouter

router = APIRouter()

CONTACTS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "contacts.json")

# 启动时加载一次
_contacts_cache: list[dict] | None = None


@router.get("/api/contacts")
def list_contacts():
    """
    获取便民电话列表

    返回示例：
    [
        {"name": "嘎查村委会", "phone": "0470-XXXXXXX", "category": "村级"},
        {"name": "苏木便民大厅", "phone": "0470-XXXXXXX", "category": "乡镇"},
        {"name": "政务服务热线", "phone": "12345", "category": "热线"}
    ]
    """
    global _contacts_cache
    if _contacts_cache is not None:
        return _contacts_cache
    if not os.path.exists(CONTACTS_FILE):
        _contacts_cache = []
        return _contacts_cache
    with open(CONTACTS_FILE, "r", encoding="utf-8") as f:
        _contacts_cache = json.load(f)
    return _contacts_cache
