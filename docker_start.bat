@echo off
chcp 65001 >nul
echo 正在启动简搜应用...

:: 检查Docker是否运行
echo 检查Docker状态...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Desktop没有运行
    echo 请先启动Docker Desktop，然后重新运行此脚本
    echo.
    echo 如果已经启动Docker Desktop但仍有问题，请尝试：
    echo 1. 重启Docker Desktop
    echo 2. 以管理员身份运行此脚本
    pause
    exit /b 1
)

:: 清理可能存在的容器
echo 清理旧容器...
docker-compose down >nul 2>&1

:: 尝试使用默认Dockerfile构建
echo 尝试使用阿里云镜像源构建...
docker-compose up --build -d
if %errorlevel% equ 0 (
    echo ✅ 使用阿里云镜像源构建成功！
    docker-compose logs -f
    goto :end
)

echo ❌ 阿里云镜像源构建失败，尝试备用方案...

:: 备份原Dockerfile
copy Dockerfile Dockerfile.original >nul 2>&1
copy Dockerfile.backup Dockerfile >nul 2>&1

echo 尝试使用网易云镜像源构建...
docker-compose up --build -d
if %errorlevel% equ 0 (
    echo ✅ 使用网易云镜像源构建成功！
    docker-compose logs -f
    goto :end
)

echo ❌ 网易云镜像源也失败，尝试本地Python镜像...

:: 恢复原Dockerfile并修改为本地已有镜像
copy Dockerfile.original Dockerfile >nul 2>&1
powershell -Command "(gc Dockerfile) -replace 'registry.cn-hangzhou.aliyuncs.com/library/python:3.11-slim', 'python:3.11-slim' | Out-File -encoding UTF8 Dockerfile"

docker-compose up --build -d
if %errorlevel% equ 0 (
    echo ✅ 使用本地镜像构建成功！
    docker-compose logs -f
) else (
    echo ❌ 所有方案都失败了，请检查网络连接或Docker配置
    echo.
    echo 建议：
    echo 1. 检查网络连接
    echo 2. 重启Docker Desktop
    echo 3. 清理Docker缓存: docker system prune -a
    echo 4. 检查是否需要代理设置
    echo.
    pause
    exit /b 1
)

:end
echo.
echo 应用已启动，访问 http://localhost:8000 查看
pause 