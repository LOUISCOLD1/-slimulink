#!/bin/bash
# ============================================
# 更新政策并重建知识库
#
# 每次添加新政策文件后运行：
#   bash update_policies.sh
# ============================================

set -e

cd /home/policy-assistant/backend
source venv/bin/activate

echo "📚 重新构建政策知识库..."
python -m app.rag.indexer

echo "🔄 重启服务..."
sudo systemctl restart policy-assistant

echo "✅ 更新完成！"
echo ""
echo "添加新政策的方法："
echo "  1. 把txt文件放到: /home/policy-assistant/backend/app/data/policies/"
echo "  2. 文件名格式: zh_政策名称.txt"
echo "  3. 再次运行: bash update_policies.sh"
