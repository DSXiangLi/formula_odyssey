#!/bin/bash

echo "🎮 药灵山谷 - 启动脚本"
echo "===================="

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到Node.js，请先安装Node.js 18+"
    exit 1
fi

# 检查目录
cd "$(dirname "$0")/src"

# 检查node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，安装依赖..."
    npm install
fi

echo ""
echo "🚀 启动开发服务器..."
echo ""
echo "游戏将在浏览器中打开"
echo "地址: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev
