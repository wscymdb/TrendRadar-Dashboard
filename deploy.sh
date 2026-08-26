#!/bin/bash

# ==============================================================================
# TrendRadar 服务发布脚本
# 仅上传 config 和 docker 目录至远程服务器并自动执行 Docker Compose 部署
# ==============================================================================

# 配置远程服务器信息（可根据环境变量覆盖）
SERVER_HOST="${SERVER_HOST:-puta99.fun}"
SERVER_USER="${SERVER_USER:-root}" # 默认用户为 root，可通过 SERVER_USER=ubuntu ./deploy.sh 覆盖
REMOTE_DIR="${REMOTE_DIR:-~/trendradar}"

# 脚本所在根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

# 检查本地必要目录
if [ ! -d "config" ] || [ ! -d "docker" ]; then
    echo "❌ 错误: 未在当前目录下找到 config 或 docker 目录，请在项目根目录执行此脚本！"
    exit 1
fi

echo "=================================================="
echo "🎯 请选择部署启动方式："
echo "   [A] 启动所有服务 (新闻推送 + MCP AI 分析)"
echo "   [B] 仅启动新闻推送服务 (trendradar)"
echo "   [C] 仅启动 MCP AI 分析服务 (trendradar-mcp)"
echo "=================================================="

# 支持命令行参数快速指定（例如 ./deploy.sh a 或 ./deploy.sh b）
CHOICE="${1}"
if [ -z "${CHOICE}" ]; then
    read -p "请输入选项 [A/B/C] (默认: B): " INPUT_CHOICE
    CHOICE="${INPUT_CHOICE:-B}"
fi

# 标准化选项为大写
CHOICE=$(echo "${CHOICE}" | tr '[:lower:]' '[:upper:]')

case "${CHOICE}" in
    A)
        TARGET_DESC="全部服务 (trendradar + trendradar-mcp)"
        TARGET_CMD="docker compose up -d"
        ;;
    B)
        TARGET_DESC="仅新闻推送服务 (trendradar)"
        TARGET_CMD="docker compose up -d trendradar"
        ;;
    C)
        TARGET_DESC="仅 MCP AI 分析服务 (trendradar-mcp)"
        TARGET_CMD="docker compose up -d trendradar-mcp"
        ;;
    *)
        echo "⚠️ 无效选项 [${CHOICE}]，默认采用选项 [B] 仅启动新闻推送服务"
        TARGET_DESC="仅新闻推送服务 (trendradar)"
        TARGET_CMD="docker compose up -d trendradar"
        ;;
esac

echo ""
echo "🚀 开始发布 TrendRadar 到服务器 ${SERVER_USER}@${SERVER_HOST}:${REMOTE_DIR}..."
echo "📌 目标服务: ${TARGET_DESC}"
echo ""

# 1. 上传 config 和 docker 目录（通过 rsync 自动创建目录并同步）
echo "📦 正在上传 config 与 docker 目录到远程服务器..."
if command -v rsync &> /dev/null; then
    rsync -avz --delete \
      --rsync-path="mkdir -p ${REMOTE_DIR}/output ${REMOTE_DIR}/config ${REMOTE_DIR}/docker && rsync" \
      --exclude '.DS_Store' \
      --exclude '__pycache__' \
      --exclude '*.pyc' \
      config docker ${SERVER_USER}@${SERVER_HOST}:${REMOTE_DIR}/
else
    scp -r config docker ${SERVER_USER}@${SERVER_HOST}:${REMOTE_DIR}/
fi

if [ $? -ne 0 ]; then
    echo "❌ 目录上传失败，请检查 SSH 连接设置！"
    exit 1
fi

echo "✅ 目录上传成功！"

echo ""
echo "=================================================="
echo "📋 手动登录服务器操作指南："
echo "   1. ssh ${SERVER_USER}@${SERVER_HOST}"
echo "   2. cd ${REMOTE_DIR}/docker"
echo "   3. ${TARGET_CMD}"
echo "   4. docker compose logs -f"
echo "=================================================="
echo ""

# 2. 远程直接启动/重载指定容器服务
echo "🐳 正在远程启动目标服务 [${TARGET_DESC}]..."
ssh -t ${SERVER_USER}@${SERVER_HOST} "cd ${REMOTE_DIR}/docker && (${TARGET_CMD} 2>/dev/null || docker-compose up -d) && echo '' && echo '📊 查看容器运行状态:' && (docker compose ps 2>/dev/null || docker-compose ps)"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 TrendRadar 发布成功！"
    echo "🌐 Web 报告访问地址: http://${SERVER_HOST}:7773/"
else
    echo "⚠️ 远程自动部署遇到问题，请登录服务器排查：cd ${REMOTE_DIR}/docker && ${TARGET_CMD}"
fi
