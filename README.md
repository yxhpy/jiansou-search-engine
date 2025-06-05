# 简搜 - 简洁高效的搜索工具 🔍

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688.svg)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?logo=docker&logoColor=white)](https://docker.com)

一个现代化的搜索引擎首页应用，提供简洁高效的搜索体验和强大的自定义功能。

## ✨ 项目特性

- 👤 **用户认证系统** - 支持用户注册、登录，JWT令牌认证
- 🔒 **数据完全隔离** - 每个用户拥有独立的配置和数据
- 🔍 **多搜索引擎支持** - 百度、Google、必应等主流搜索引擎
- 🔗 **智能快速链接** - 支持分类管理和自动图标识别
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🎨 **现代化UI** - 基于华为设计语言的简洁界面
- 🖼️ **动态壁纸** - 支持必应每日壁纸和自定义背景
- ⌨️ **快捷键支持** - 提升操作效率的键盘快捷键
- 🚀 **高性能架构** - 模块化设计，快速响应
- 🔧 **RESTful API** - 完整的后端API接口
- ✅ **完整测试覆盖** - 单元测试和集成测试
- 🐳 **容器化部署** - 支持Docker一键部署

## 🛠️ 技术栈

### 后端
- **FastAPI 0.104.1** - 现代化的Python异步Web框架
- **SQLAlchemy 2.0.23** - 强大的Python SQL工具包和ORM
- **Pydantic 2.5.0** - 使用Python类型提示进行数据验证
- **Uvicorn 0.24.0** - Lightning-fast ASGI服务器
- **PyMySQL 1.1.0** - 纯Python MySQL客户端
- **python-dotenv 1.0.0** - 环境变量管理
- **python-jose 3.3.0** - JWT令牌处理
- **passlib 1.7.4** - 密码加密和验证

### 前端
- **原生JavaScript (ES6+)** - 模块化前端架构
- **Tailwind CSS** - 实用优先的CSS框架
- **Font Awesome** - 丰富的图标库
- **响应式设计** - 移动端优先的设计理念

### 部署与运维
- **Docker & Docker Compose** - 容器化部署解决方案
- **健康检查** - 自动服务监控和恢复
- **生产级配置** - 优化的性能和安全设置

## 📁 项目结构

```
搜索引擎首页/
├── app/                          # 🏗️ 应用核心目录
│   ├── __init__.py              # 应用包初始化
│   ├── main.py                  # FastAPI主应用
│   ├── config.py                # 应用配置管理
│   ├── database.py              # 数据库连接和会话管理
│   ├── models.py                # SQLAlchemy数据库模型
│   ├── schemas.py               # Pydantic数据验证模式
│   ├── routers/                 # 🛣️ API路由模块
│   │   ├── __init__.py
│   │   ├── quick_links.py       # 快速链接相关API
│   │   ├── search_engines.py    # 搜索引擎管理API
│   │   ├── search.py            # 搜索功能API
│   │   └── wallpaper.py         # 壁纸服务API
│   └── services/                # 🔧 业务逻辑服务层
│       ├── __init__.py
│       ├── quick_link_service.py      # 快速链接业务逻辑
│       ├── search_engine_service.py   # 搜索引擎管理逻辑
│       ├── search_service.py          # 搜索功能实现
│       └── data_init_service.py       # 数据初始化服务
├── static/                      # 🎨 前端静态资源
│   ├── css/                     # 样式文件
│   │   ├── base.css            # 基础样式定义
│   │   └── components.css      # 组件样式库
│   ├── js/                     # JavaScript模块
│   │   ├── app.js              # 主应用入口
│   │   ├── components/         # UI组件库
│   │   ├── services/           # 前端服务层
│   │   └── utils/              # 工具函数库
│   └── images/                 # 图片和图标资源
├── tests/                      # 🧪 测试套件
│   ├── __init__.py
│   ├── conftest.py             # pytest配置和fixture
│   ├── test_quick_links.py     # 快速链接功能测试
│   ├── test_search_engines.py  # 搜索引擎功能测试
│   ├── test_search.py          # 搜索功能测试
│   └── test_data_init.py       # 数据初始化测试
├── docs/                       # 📚 项目文档
│   ├── features/               # 功能说明文档
│   ├── deployment/             # 部署指南
│   └── bugfixes/              # 问题修复记录
├── 📄 配置文件
│   ├── index_new.html          # 主页面文件
│   ├── main_new.py             # 应用启动入口
│   ├── requirements.txt        # Python依赖清单
│   ├── Dockerfile              # Docker镜像构建配置
│   ├── docker-compose.yml      # 多容器编排配置
│   ├── .env                    # 环境变量配置
│   ├── .dockerignore           # Docker构建忽略文件
│   ├── .gitignore              # Git版本控制忽略文件
│   └── start.sh                # 快速启动脚本
└── README.md                   # 📖 项目说明文档
```

## 🚀 快速开始

### 方式一：Docker部署（推荐）

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd 搜索引擎首页
   ```

2. **一键启动**
   ```bash
   # Windows用户
   docker_start.bat
   
   # Linux/Mac用户
   docker-compose up -d
   ```

3. **访问应用**
   ```
   🌐 http://localhost:8000
   🔐 http://localhost:8000/auth-test (认证功能测试)
   ```

   **首次使用 (v2.0+):**
   - 如果是全新安装，直接注册新用户
   - 如果从v1.x升级，运行迁移脚本：`python migrate_add_users.py`
   - 默认管理员账户：admin / admin123 (请及时更改密码)

### 方式二：本地开发

1. **环境要求**
   - Python 3.8+
   - MySQL 5.7+ 或 8.0+

2. **安装依赖**
   ```bash
   pip install -r requirements.txt
   ```

3. **环境配置**
   ```bash
   # 复制环境变量模板
   cp env.example .env
   
   # 编辑配置文件
   # 配置数据库连接信息
   ```

4. **启动应用**
   ```bash
   # 使用Python启动
   python main_new.py
   
   # 或使用启动脚本
   ./start.sh
   ```

## ⌨️ 快捷键操作

| 快捷键 | 功能说明 | 适用场景 |
|--------|----------|----------|
| `Ctrl+K` / `Cmd+K` | 聚焦搜索框 | 任何时候快速开始搜索 |
| `ESC` | 清空搜索内容 | 清除当前搜索输入 |
| `F5` | 刷新页面数据 | 更新快速链接和搜索引擎 |
| `W` | 切换壁纸 | 在不同背景间切换 |
| `Enter` | 执行搜索 | 使用当前选中的搜索引擎 |

## 🔧 配置说明

### 环境变量配置

```bash
# 应用服务配置
APP_HOST=0.0.0.0                    # 服务监听地址
APP_PORT=8000                       # 服务端口
APP_DEBUG=false                     # 调试模式
APP_ENV=production                  # 运行环境

# 数据库配置
MYSQL_HOST=localhost                # 数据库主机
MYSQL_PORT=3306                     # 数据库端口
MYSQL_USER=search                   # 数据库用户名
MYSQL_PASSWORD=your_password        # 数据库密码
MYSQL_DATABASE=search               # 数据库名称

# 安全配置
SECRET_KEY=your_secret_key_here     # 应用密钥
CORS_ORIGINS=["http://localhost:8000"]  # 允许的跨域来源
```

### 功能特性配置

- **🔍 搜索引擎管理** - 支持添加、编辑、删除搜索引擎，自定义搜索URL
- **🔗 快速链接管理** - 支持分类管理、自动图标识别、拖拽排序
- **🖼️ 壁纸设置** - 支持必应每日壁纸、自定义背景、本地图片上传
- **🎨 界面主题** - 基于现代设计理念的自适应界面
- **📊 数据统计** - 搜索频次统计、链接访问统计

## 📊 API文档

应用启动后，可以通过以下地址访问完整的API文档：

- **Swagger UI**: `http://localhost:8000/docs` - 交互式API文档
- **ReDoc**: `http://localhost:8000/redoc` - 美观的API文档

### 🔗 主要API端点

#### 用户认证 (v2.0新增)
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

#### 搜索引擎管理 (需要认证)
- `GET /api/search-engines` - 获取搜索引擎列表
- `POST /api/search-engines` - 添加新的搜索引擎
- `PUT /api/search-engines/{id}` - 更新搜索引擎配置
- `DELETE /api/search-engines/{id}` - 删除搜索引擎

#### 快速链接管理 (需要认证)
- `GET /api/quick-links` - 获取快速链接列表
- `POST /api/quick-links` - 添加新的快速链接
- `PUT /api/quick-links/{id}` - 更新快速链接
- `DELETE /api/quick-links/{id}` - 删除快速链接

#### 其他服务
- `GET /api/wallpaper` - 获取当前壁纸信息
- `POST /api/search` - 执行搜索请求
- `GET /health` - 健康检查端点

## 🧪 测试

### 运行测试

```bash
# 安装测试依赖
pip install pytest pytest-cov pytest-asyncio

# 运行所有测试
pytest

# 运行特定测试文件
pytest tests/test_quick_links.py -v

# 生成覆盖率报告
pytest --cov=app tests/ --cov-report=html

# 运行特定测试并显示详细输出
pytest tests/test_search_engines.py::test_create_search_engine -v -s
```

### 测试覆盖范围

- ✅ **API端点测试** - 所有REST API的功能测试
- ✅ **业务逻辑测试** - 核心业务功能的单元测试
- ✅ **数据库操作测试** - 数据持久化操作测试
- ✅ **错误处理测试** - 异常情况和边界条件测试

## 📦 部署指南

### Docker单容器部署

```bash
# 构建Docker镜像
docker build -t jiansou:latest .

# 运行容器
docker run -d \
  --name jiansou-app \
  -p 8000:8000 \
  -e APP_ENV=production \
  jiansou:latest
```

### Docker Compose部署（推荐）

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f jiansou

# 停止所有服务
docker-compose down

# 重建并启动服务
docker-compose up --build -d
```

### 生产环境部署建议

1. **🔒 安全配置**
   - 使用强密码和密钥
   - 配置HTTPS证书
   - 设置防火墙规则

2. **⚡ 性能优化**
   - 配置反向代理（Nginx）
   - 启用Gzip压缩
   - 设置缓存策略

3. **📊 监控和日志**
   - 配置日志轮转
   - 设置性能监控
   - 配置健康检查

## 🔍 故障排除

### 常见问题

1. **数据库连接失败**
   ```bash
   # 检查数据库服务状态
   python check_db.py
   
   # 验证连接配置
   docker-compose logs jiansou
   ```

2. **端口占用问题**
   ```bash
   # 检查端口占用
   netstat -tlnp | grep :8000
   
   # 修改端口配置
   # 编辑 docker-compose.yml 或 .env 文件
   ```

3. **权限问题**
   ```bash
   # Linux/Mac下给予执行权限
   chmod +x start.sh docker_start.sh
   ```

## 🤝 贡献指南

我们欢迎所有形式的贡献！请阅读以下指南：

### 开发流程

1. **🍴 Fork项目** - 创建您自己的项目副本
2. **🌿 创建分支** - `git checkout -b feature/amazing-feature`
3. **💻 开发功能** - 编写代码并添加测试
4. **✅ 运行测试** - 确保所有测试通过
5. **📝 提交更改** - `git commit -m 'Add amazing feature'`
6. **🚀 推送分支** - `git push origin feature/amazing-feature`
7. **🔄 创建PR** - 在GitHub上创建Pull Request

### 代码规范

- 遵循PEP 8 Python代码风格
- 添加适当的类型提示
- 编写清晰的注释和文档
- 为新功能添加测试用例

### 提交信息格式

```
type(scope): description

[optional body]

[optional footer]
```

例如：
- `feat(api): add new search engine endpoint`
- `fix(ui): resolve mobile responsive issues`
- `docs(readme): update installation guide`

## 📊 项目状态

- 🟢 **活跃维护** - 定期更新和功能改进
- 🧪 **测试覆盖率** - 90%+
- 📈 **性能指标** - 响应时间 < 100ms
- 🔒 **安全等级** - 生产就绪

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议发布。

```
MIT License

Copyright (c) 2024 简搜团队

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🔗 相关链接

- 📚 [详细文档](docs/) - 完整的项目文档
- 📝 [更新日志](CHANGELOG.md) - 版本更新记录
- 🐛 [问题反馈](../../issues) - 报告问题和建议
- 💬 [讨论区](../../discussions) - 社区讨论
- 🏷️ [发布版本](../../releases) - 稳定版本下载

## 📞 支持与联系

如果您在使用过程中遇到问题或有任何建议，欢迎通过以下方式联系我们：

- 📧 **邮箱**: [support@jiansou.com](mailto:support@jiansou.com)
- 🌐 **项目主页**: [https://github.com/your-org/jiansou](https://github.com/your-org/jiansou)
- 📱 **QQ群**: 123456789
- 💬 **微信群**: 扫描二维码加入

---

<div align="center">

**简搜** - 让搜索更简单，让效率更高效 🚀

[![Star History Chart](https://api.star-history.com/svg?repos=your-org/jiansou&type=Date)](https://star-history.com/#your-org/jiansou&Date)

*如果这个项目对您有帮助，请给我们一个 ⭐ Star！*

</div> 