"""
便民电话接口
"""

import json
import os
from fastapi import APIRouter

router = APIRouter()

CONTACTS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "contacts.json")


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
    if not os.path.exists(CONTACTS_FILE):
        return []
    with open(CONTACTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)
