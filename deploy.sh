#!/bin/bash
# ============================================
# 一键部署脚本
# 在云服务器上运行这个脚本即可完成部署
#
# 使用方法：
#   1. 买一台云服务器（推荐阿里云/腾讯云学生机 2核2G）
#   2. SSH登录服务器
#   3. 运行: bash deploy.sh
# ============================================

set -e

echo "======================================"
echo "  牧民智能政策助手 - 一键部署"
echo "======================================"

# 1. 安装系统依赖
echo ""
echo "📦 [1/6] 安装系统依赖..."
sudo apt update
sudo apt install -y python3 python3-pip python3-venv git nginx

# 2. 克隆项目
echo ""
echo "📥 [2/6] 克隆项目..."
cd /home
if [ -d "policy-assistant" ]; then
    echo "  项目已存在，拉取最新代码..."
    cd policy-assistant
    git pull
else
    git clone https://github.com/LOUISCOLD1/-slimulink.git policy-assistant
    cd policy-assistant
fi
cd backend

# 3. 创建Python虚拟环境并安装依赖
echo ""
echo "🐍 [3/6] 安装Python依赖（首次会下载向量模型约400MB，请耐心等待）..."
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

# 4. 配置环境变量
echo ""
echo "🔑 [4/6] 配置API Key..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo ""
    echo "  ⚠️  请编辑 .env 文件填入你的API Key："
    echo "  nano /home/policy-assistant/backend/.env"
    echo ""
    echo "  需要填写："
    echo "  - ZHIPU_API_KEY（必填，去 https://open.bigmodel.cn 注册）"
    echo "  - DEEPSEEK_API_KEY（可选备用）"
    echo ""
    read -p "  填好了按回车继续..." _
fi

# 5. 构建知识库
echo ""
echo "📚 [5/6] 构建政策知识库..."
python -m app.rag.indexer

# 6. 配置systemd服务（开机自启 + 自动重启）
echo ""
echo "🚀 [6/6] 配置后台服务..."

sudo tee /etc/systemd/system/policy-assistant.service > /dev/null <<SERVICEEOF
[Unit]
Description=Policy Assistant API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/policy-assistant/backend
Environment=PATH=/home/policy-assistant/backend/venv/bin:/usr/bin
ExecStart=/home/policy-assistant/backend/venv/bin/gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICEEOF

sudo systemctl daemon-reload
sudo systemctl enable policy-assistant
sudo systemctl start policy-assistant

# 配置Nginx反向代理（让80端口转发到8000）
sudo tee /etc/nginx/sites-available/policy-assistant > /dev/null <<NGINXEOF
server {
    listen 80;
    server_name _;

    # API接口
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_read_timeout 60s;
    }

    # 根路径
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
    }
}
NGINXEOF

sudo ln -sf /etc/nginx/sites-available/policy-assistant /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 开放防火墙端口
sudo ufw allow 80/tcp 2>/dev/null || true
sudo ufw allow 443/tcp 2>/dev/null || true

echo ""
echo "======================================"
echo "  ✅ 部署完成！"
echo "======================================"
echo ""
echo "  服务地址: http://$(curl -s ifconfig.me 2>/dev/null || echo '你的服务器IP'):80"
echo ""
echo "  测试命令:"
echo "    curl http://localhost/api/ask -X POST -H 'Content-Type: application/json' \\"
echo "      -d '{\"question\": \"低保怎么申请\"}'"
echo ""
echo "  常用管理命令:"
echo "    查看状态: sudo systemctl status policy-assistant"
echo "    查看日志: sudo journalctl -u policy-assistant -f"
echo "    重启服务: sudo systemctl restart policy-assistant"
echo "    更新政策后重建知识库:"
echo "      cd /home/policy-assistant/backend"
echo "      source venv/bin/activate"
echo "      python -m app.rag.indexer"
echo "      sudo systemctl restart policy-assistant"
echo ""
