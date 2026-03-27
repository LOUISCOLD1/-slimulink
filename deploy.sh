#!/usr/bin/env bash
# ============================================
# 一键部署脚本
# 在云服务器上运行这个脚本即可完成部署
#
# 支持系统：Debian / Ubuntu（apt 包管理器）
#
# 使用方法：
#   1. 买一台云服务器（推荐阿里云/腾讯云学生机 2核2G）
#   2. SSH登录服务器
#   3. 运行: bash deploy.sh
# ============================================

set -e

# 错误处理：脚本异常退出时给出友好提示
cleanup() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        echo ""
        echo "❌ 部署过程中出错（退出码: $exit_code）"
        echo "   请检查上方错误信息，修复后重新运行 bash deploy.sh"
    fi
}
trap cleanup EXIT

# 检查是否为 Debian/Ubuntu 系统
if ! command -v apt &>/dev/null; then
    echo "❌ 此脚本仅支持 Debian/Ubuntu 系统（需要 apt 包管理器）"
    echo "   如果是 CentOS/RHEL，请手动安装依赖"
    exit 1
fi

# 部署目录（使用标准位置 /opt）
DEPLOY_DIR="/opt/policy-assistant"

echo "======================================"
echo "  牧民智能政策助手 - 一键部署"
echo "======================================"

# 1. 安装系统依赖
echo ""
echo "📦 [1/6] 安装系统依赖..."
sudo apt update -qq || { echo "❌ apt update 失败，请检查网络或软件源"; exit 1; }
sudo apt install -y python3 python3-pip python3-venv git nginx

# 2. 克隆项目
echo ""
echo "📥 [2/6] 克隆项目..."
if [ -d "$DEPLOY_DIR" ]; then
    echo "  项目已存在，拉取最新代码..."
    cd "$DEPLOY_DIR"
    git pull
else
    sudo git clone --depth 1 https://github.com/LOUISCOLD1/-slimulink.git "$DEPLOY_DIR"
    sudo chown -R "$(whoami):$(whoami)" "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
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
    if [ ! -f .env.example ]; then
        echo "❌ 找不到 .env.example 文件，请检查项目是否完整"
        exit 1
    fi
    cp .env.example .env
    echo ""
    echo "  ⚠️  请编辑 .env 文件填入你的API Key："
    echo "  nano $DEPLOY_DIR/backend/.env"
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
python3 -m app.rag.indexer

# 6. 配置systemd服务（开机自启 + 自动重启）
echo ""
echo "🚀 [6/6] 配置后台服务..."

# 确保运行用户存在
DEPLOY_USER="$(whoami)"

sudo tee /etc/systemd/system/policy-assistant.service > /dev/null <<SERVICEEOF
[Unit]
Description=Policy Assistant API
After=network.target

[Service]
Type=simple
User=$DEPLOY_USER
WorkingDirectory=$DEPLOY_DIR/backend
Environment=PATH=$DEPLOY_DIR/backend/venv/bin:/usr/bin
ExecStart=$DEPLOY_DIR/backend/venv/bin/gunicorn app.main:app -w 2 -k uvicorn.workers.UvicornWorker -b 127.0.0.1:8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICEEOF

sudo systemctl daemon-reload
sudo systemctl enable policy-assistant
sudo systemctl start policy-assistant

# 检查服务是否启动成功
sleep 2
if ! sudo systemctl is-active --quiet policy-assistant; then
    echo "⚠️  服务启动可能失败，请检查日志："
    echo "  sudo journalctl -u policy-assistant -n 20"
fi

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
# 备份并移除默认配置
if [ -f /etc/nginx/sites-enabled/default ]; then
    sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.bak 2>/dev/null || true
    sudo rm -f /etc/nginx/sites-enabled/default
fi
sudo nginx -t && sudo systemctl restart nginx

# 开放防火墙端口
sudo ufw allow 80/tcp 2>/dev/null || true
sudo ufw allow 443/tcp 2>/dev/null || true

echo ""
echo "======================================"
echo "  ✅ 部署完成！"
echo "======================================"
echo ""
echo "  服务地址: http://你的服务器IP:80"
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
echo "      cd $DEPLOY_DIR/backend"
echo "      source venv/bin/activate"
echo "      python3 -m app.rag.indexer"
echo "      sudo systemctl restart policy-assistant"
echo ""
