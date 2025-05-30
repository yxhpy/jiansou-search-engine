# 🐳 Docker 部署指南

## 项目结构

```
搜索引擎首页/
├── Dockerfile              # Docker镜像构建文件
├── docker-compose.yml      # Docker Compose配置
├── .dockerignore           # Docker构建忽略文件
├── main.py                 # FastAPI应用主文件
├── index.html              # 前端页面
├── requirements.txt        # Python依赖
├── data/                   # 数据目录（运行后生成）
│   └── search_engine.db    # SQLite数据库
└── README.md              # 项目说明
```

## 问题解决

如果遇到 `sqlalchemy.exc.OperationalError: (sqlite3.OperationalError) unable to open database file` 错误，请按照以下步骤解决：

## 🔧 解决方案

### 1. 确保数据目录存在并有正确权限

```bash
# 创建数据目录
mkdir -p ./data

# 设置权限（Linux/macOS）
chmod 777 ./data

# Windows PowerShell
# 确保docker-desktop有访问权限
```

### 2. 清理并重新部署

```bash
# 停止并删除容器
docker-compose down

# 删除镜像（可选）
docker image rm 搜索引擎首页-search-engine

# 清理数据目录（如果数据损坏）
rm -rf ./data/*

# 重新构建和启动
docker-compose up --build
```

### 3. 检查容器日志

```bash
# 查看容器日志
docker-compose logs search-engine

# 实时查看日志
docker-compose logs -f search-engine
```

### 4. 手动数据库检查

```bash
# 进入容器
docker-compose exec search-engine bash

# 运行数据库检查
python3 check_db.py

# 检查数据目录权限
ls -la /app/data
```

## 📋 部署步骤

### 快速部署

```bash
# 1. 确保在项目根目录
cd /c/Users/Administrator/Desktop/搜索引擎首页

# 2. 创建数据目录
mkdir -p data

# 3. 启动服务
docker-compose up -d

# 4. 查看状态
docker-compose ps

# 5. 访问应用
# http://localhost:8000
```

### 详细部署

```bash
# 1. 构建镜像
docker-compose build

# 2. 启动服务（前台运行，方便查看日志）
docker-compose up

# 3. 后台运行
docker-compose up -d

# 4. 检查健康状态
docker-compose ps
docker-compose logs search-engine
```

## 🐛 故障排除

### 权限问题
```bash
# Linux/macOS
sudo chown -R $USER:$USER ./data
chmod 777 ./data

# 或者以root权限运行容器（不推荐）
```

### 数据库损坏
```bash
# 删除损坏的数据库文件
rm -f ./data/search_engine.db*

# 重启容器，自动重新创建
docker-compose restart search-engine
```

### 端口冲突
```bash
# 检查端口占用
netstat -an | grep 8000

# 修改docker-compose.yml中的端口映射
ports:
  - "8001:8000"  # 改为8001
```

## 📊 监控和维护

### 查看资源使用
```bash
# 查看容器资源使用
docker stats search-engine-homepage

# 查看磁盘使用
du -sh ./data
```

### 备份数据
```bash
# 备份数据库
cp ./data/search_engine.db ./data/backup_$(date +%Y%m%d_%H%M%S).db

# 或使用tar打包
tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz ./data
```

### 更新应用
```bash
# 1. 备份数据
cp ./data/search_engine.db ./data/backup.db

# 2. 停止服务
docker-compose down

# 3. 拉取最新代码
git pull

# 4. 重新构建
docker-compose build

# 5. 启动服务
docker-compose up -d
```

## 🏗️ 开发模式

### 本地开发
```bash
# 不使用Docker，直接运行
python -m pip install -r requirements.txt
python main.py

# 或使用uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 开发时使用Docker
```bash
# 挂载代码目录（实时更新）
docker run -it --rm \
  -p 8000:8000 \
  -v $(pwd):/app \
  -v $(pwd)/data:/app/data \
  搜索引擎首页-search-engine
```

## 🔍 技术细节

### 数据库配置
- 使用SQLite数据库
- 数据文件位置：`./data/search_engine.db`
- 自动创建表结构
- 自动初始化默认数据

### 安全注意事项
- 数据目录权限设置为777（仅用于开发）
- 生产环境建议使用更严格的权限控制
- 考虑使用PostgreSQL或MySQL替代SQLite

### 性能优化
- 数据库连接池配置
- 静态文件缓存
- Gzip压缩
- 健康检查机制

---

如有其他问题，请查看应用日志或联系开发团队。 