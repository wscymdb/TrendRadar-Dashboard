#!/bin/bash

# ==============================================================================
# TrendRadar-Dashboard 一键发布部署脚本
# 自动本地编译前端 ➡️ 同步源码与产物至远程服务器 ➡️ 远程 Docker 容器化构建启动
# ==============================================================================

set -e

# 配置远程服务器信息（优先读取环境变量，避免代码库暴露真实服务器域名）
if [ -f "docker/.env" ]; then
    eval "$(grep -E '^(DEPLOY_SERVER_HOST|DEPLOY_SERVER_USER|DEPLOY_REMOTE_DIR)=' docker/.env 2>/dev/null || true)"
fi

SERVER_HOST="${SERVER_HOST:-${DEPLOY_SERVER_HOST:-}}"
SERVER_USER="${SERVER_USER:-${DEPLOY_SERVER_USER:-root}}"
REMOTE_DIR="${REMOTE_DIR:-${DEPLOY_REMOTE_DIR:-/root/trendradar-dashboard}}"

# 脚本所在根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

# 若未设置目标主机，支持交互式输入
if [ -z "${SERVER_HOST}" ]; then
    echo "💡 请输入目标服务器 IP 或域名 (例如: 1.2.3.4 或 example.com):"
    read -r -p "SERVER_HOST: " INPUT_HOST
    SERVER_HOST="${INPUT_HOST}"
fi

if [ -z "${SERVER_HOST}" ]; then
    echo "❌ 错误: 未指定目标服务器地址，退出发布流程！"
    exit 1
fi

echo "=================================================="
echo "🚀 开始执行 TrendRadar-Dashboard 一键发布流程"
echo "🌐 目标服务器: ${SERVER_USER}@${SERVER_HOST}:${REMOTE_DIR}"
echo "=================================================="
echo ""
echo ""

# 1. 本地前端自动化编译打包
echo "📦 [1/3] 正在本地编译最新 React 前端静态产物..."
if [ -d "frontend" ]; then
    (cd frontend && npm run build)
    if [ $? -ne 0 ]; then
        echo "❌ 前端编译失败，发布终止！"
        exit 1
    fi
    echo "✅ 前端已成功打包输出至 web/dist 目录！"
else
    echo "⚠️ 未检测到 frontend 目录，跳过编译步骤，直接使用现有 web/dist"
fi

echo ""

# 2. 上传源码与静态产物至远程服务器
echo "🚚 [2/3] 正在同步源码与产物至远程服务器 (排除 node_modules 等大文件)..."

# 确保远程父级目录存在
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${REMOTE_DIR}/output ${REMOTE_DIR}/config ${REMOTE_DIR}/docker ${REMOTE_DIR}/trendradar ${REMOTE_DIR}/web"

if command -v rsync &> /dev/null; then
    rsync -avz --delete \
      --exclude '.git' \
      --exclude 'frontend/node_modules' \
      --exclude 'node_modules' \
      --exclude '.DS_Store' \
      --exclude '__pycache__' \
      --exclude '*.pyc' \
      trendradar docker config web pyproject.toml ${SERVER_USER}@${SERVER_HOST}:${REMOTE_DIR}/
else
    echo "⚠️ 本地未安装 rsync，使用 tar 打包并通过 scp 传输..."
    tar -czf /tmp/trendradar-deploy.tar.gz \
      --exclude='.git' \
      --exclude='frontend/node_modules' \
      --exclude='node_modules' \
      --exclude='__pycache__' \
      trendradar docker config web pyproject.toml
    scp /tmp/trendradar-deploy.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/
    ssh ${SERVER_USER}@${SERVER_HOST} "tar -zxf /tmp/trendradar-deploy.tar.gz -C ${REMOTE_DIR} && rm -f /tmp/trendradar-deploy.tar.gz"
    rm -f /tmp/trendradar-deploy.tar.gz
fi

echo "✅ 源码与前端产物已成功同步至服务器！"
echo ""

# 3. 远程执行 Docker Compose 构建并启动
echo "🐳 [3/3] 正在远程执行 Docker Compose 容器化构建与启动..."
ssh -t ${SERVER_USER}@${SERVER_HOST} "cd ${REMOTE_DIR}/docker && (docker compose -f docker-compose.dashboard.yml up -d --build 2>/dev/null || docker-compose -f docker-compose.dashboard.yml up -d --build) && echo '' && echo '📊 容器运行状态:' && (docker compose -f docker-compose.dashboard.yml ps 2>/dev/null || docker-compose -f docker-compose.dashboard.yml ps)"

if [ $? -eq 0 ]; then
    echo ""
    echo "=================================================="
    echo "🎉 TrendRadar-Dashboard 发布成功！"
    echo "🌐 大屏与控制台访问地址: http://${SERVER_HOST}:7773/"
    echo "=================================================="
else
    echo "⚠️ 远程自动部署遇到问题，请登录服务器排查：cd ${REMOTE_DIR}/docker && docker compose -f docker-compose.dashboard.yml logs -f"
fi
