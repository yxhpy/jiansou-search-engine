#!/bin/bash

echo "正在启动简搜应用..."

# 清理可能存在的容器
echo "清理旧容器..."
docker-compose down 2>/dev/null || true

# 尝试使用默认Dockerfile构建
echo "尝试使用阿里云镜像源构建..."
if docker-compose up --build -d; then
    echo "✅ 使用阿里云镜像源构建成功！"
    docker-compose logs -f
else
    echo "❌ 阿里云镜像源构建失败，尝试备用方案..."
    
    # 备份原Dockerfile
    cp Dockerfile Dockerfile.original
    cp Dockerfile.backup Dockerfile
    
    echo "尝试使用网易云镜像源构建..."
    if docker-compose up --build -d; then
        echo "✅ 使用网易云镜像源构建成功！"
        docker-compose logs -f
    else
        echo "❌ 网易云镜像源也失败，尝试本地Python镜像..."
        
        # 恢复原Dockerfile并修改为本地已有镜像
        cp Dockerfile.original Dockerfile
        sed -i 's/registry.cn-hangzhou.aliyuncs.com\/library\/python:3.11-slim/python:3.11-slim/' Dockerfile
        
        if docker-compose up --build -d; then
            echo "✅ 使用本地镜像构建成功！"
            docker-compose logs -f
        else
            echo "❌ 所有方案都失败了，请检查网络连接或Docker配置"
            echo "建议："
            echo "1. 检查网络连接"
            echo "2. 重启Docker服务"
            echo "3. 清理Docker缓存: docker system prune -a"
            exit 1
        fi
    fi
fi 