# Docker 502 Bad Gateway 错误修复指南

## 问题描述
在构建Docker镜像时遇到502 Bad Gateway错误，通常是由于：
- Docker Hub网络连接问题
- 镜像仓库临时不可用
- 网络防火墙或代理设置

## 修复方案

### 方案1：使用自动修复脚本（推荐）
**Windows用户：**
```cmd
docker_start.bat
```

**Linux/Mac用户：**
```bash
./docker_start.sh
```

### 方案2：手动使用不同镜像源

#### 2.1 使用阿里云镜像源
```dockerfile
FROM registry.cn-hangzhou.aliyuncs.com/library/python:3.11-slim
```

#### 2.2 使用网易云镜像源
```dockerfile
FROM hub.c.163.com/library/python:3.11-slim
```

#### 2.3 使用本地已有镜像
```dockerfile
FROM python:3.11-slim
```

### 方案3：清理Docker缓存
```bash
# 清理所有未使用的镜像、容器和网络
docker system prune -a

# 重新构建
docker-compose up --build
```

### 方案4：配置Docker镜像加速器
在Docker Desktop中配置镜像加速器：
```json
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://reg-mirror.qiniu.com"
  ]
}
```

## 验证修复
成功构建后，应该看到类似输出：
```
✅ 使用阿里云镜像源构建成功！
```

## 常见问题

### Q: 所有方案都失败了怎么办？
A: 
1. 检查网络连接
2. 重启Docker服务
3. 检查防火墙设置
4. 尝试使用VPN

### Q: 构建成功但无法访问服务？
A: 
1. 检查端口8000是否被占用
2. 查看容器日志：`docker-compose logs`
3. 检查防火墙设置

## 技术说明
- 使用阿里云镜像源提供更稳定的连接
- 备用Dockerfile确保高可用性
- 自动重试机制减少手动干预 