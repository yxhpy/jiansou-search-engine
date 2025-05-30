#!/bin/bash

# 启动脚本 - 新版本应用启动

echo "=== 简搜 - 新版本启动 ==="

# 设置错误处理
set -e

# 检查环境变量
echo "检查环境配置..."
export PYTHONPATH=/app

# 检查应用文件
echo "检查应用文件..."
if [ ! -f "/app/main_new.py" ]; then
    echo "错误: 找不到主应用文件 main_new.py"
    exit 1
fi

if [ ! -f "/app/index_new.html" ]; then
    echo "错误: 找不到前端文件 index_new.html"
    exit 1
fi

# 检查app目录结构
echo "检查应用目录结构..."
if [ ! -d "/app/app" ]; then
    echo "错误: 找不到app目录"
    exit 1
fi

# 检查静态文件
echo "检查静态文件..."
if [ ! -d "/app/static" ]; then
    echo "警告: 静态文件目录不存在"
else
    echo "静态文件目录存在"
fi

# 运行数据库健康检查（如果存在）
if [ -f "/app/check_db.py" ]; then
    echo "运行数据库健康检查..."
    python3 check_db.py || echo "数据库检查失败，但继续启动应用"
fi

# 启动新版本应用
echo "启动简搜新版本应用..."
echo "使用配置:"
echo "  - 主文件: main_new.py"
echo "  - 前端文件: index_new.html"
echo "  - 应用架构: 模块化FastAPI"

# 启动应用
exec python3 main_new.py 