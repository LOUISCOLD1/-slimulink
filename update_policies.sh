#!/usr/bin/env bash
# ============================================
# 更新政策并重建知识库
#
# 每次添加新政策文件后运行：
#   bash update_policies.sh
# ============================================

set -e

DEPLOY_DIR="/opt/policy-assistant"

# 前置检查
if [ ! -d "$DEPLOY_DIR/backend" ]; then
    echo "❌ 项目目录不存在: $DEPLOY_DIR/backend"
    echo "   请先运行 bash deploy.sh 完成部署"
    exit 1
fi

cd "$DEPLOY_DIR/backend"

if [ ! -f "venv/bin/activate" ]; then
    echo "❌ Python虚拟环境不存在，请先运行 bash deploy.sh"
    exit 1
fi

source venv/bin/activate

echo "📚 重新构建政策知识库..."
python3 -m app.rag.indexer

echo "🔄 重启服务..."
sudo systemctl restart policy-assistant

echo "✅ 更新完成！"
echo ""
echo "添加新政策的方法："
echo "  1. 把txt文件放到: $DEPLOY_DIR/backend/app/data/policies/"
echo "  2. 文件名格式: zh_政策名称.txt"
echo "  3. 再次运行: bash update_policies.sh"
