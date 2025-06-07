# 简搜 - 简洁高效的搜索工具 🔍

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688.svg)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?logo=docker&logoColor=white)](https://docker.com)

一个现代化的搜索引擎首页应用，提供简洁高效的搜索体验和强大的自定义功能。

## ✨ 项目特性

- 👤 **完整用户系统** - 用户注册、登录、个人资料管理，JWT令牌认证
- 🖼️ **头像上传功能** - 支持WebDAV文件存储，多格式图片上传
- 🔒 **数据完全隔离** - 每个用户拥有独立的配置和数据
- 🔍 **多搜索引擎支持** - 百度、Google、必应、搜狗、DuckDuckGo等主流搜索引擎
- 🔗 **智能快速链接** - 支持分类管理、自动图标识别和拖拽排序
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🎨 **现代化UI** - 基于华为设计语言的简洁界面
- 🖼️ **动态壁纸** - 支持必应每日壁纸和自定义背景
- ⌨️ **快捷键支持** - 提升操作效率的键盘快捷键
- 🚀 **高性能架构** - 模块化设计，快速响应
- 🔧 **RESTful API** - 完整的后端API接口
- ✅ **完整测试覆盖** - 单元测试和集成测试
- 🐳 **容器化部署** - 支持Docker一键部署
- 📁 **文件存储服务** - WebDAV集成，支持头像和文件管理

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
- **webdavclient3 3.14.6** - WebDAV客户端，支持文件存储
- **Pillow 10.1.0** - 图像处理库
- **email-validator 2.1.0** - 邮箱格式验证

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
jiansou-search-engine/
├── app/                          # 🏗️ 应用核心目录
│   ├── __init__.py              # 应用包初始化
│   ├── main.py                  # FastAPI主应用
│   ├── config.py                # 应用配置管理
│   ├── database.py              # 数据库连接和会话管理
│   ├── models.py                # SQLAlchemy数据库模型
│   ├── schemas.py               # Pydantic数据验证模式
│   ├── auth.py                  # JWT认证中间件
│   ├── routers/                 # 🛣️ API路由模块
│   │   ├── __init__.py
│   │   ├── auth.py              # 用户认证API
│   │   ├── avatar.py            # 头像管理API
│   │   ├── quick_links.py       # 快速链接相关API
│   │   ├── search_engines.py    # 搜索引擎管理API
│   │   ├── search.py            # 搜索功能API
│   │   └── wallpaper.py         # 壁纸服务API
│   └── services/                # 🔧 业务逻辑服务层
│       ├── __init__.py
│       ├── user_service.py            # 用户管理业务逻辑
│       ├── webdav_service.py          # WebDAV文件存储服务
│       ├── quick_link_service.py      # 快速链接业务逻辑
│       ├── search_engine_service.py   # 搜索引擎管理逻辑
│       ├── search_service.py          # 搜索功能实现
│       └── data_init_service.py       # 数据初始化服务
├── static/                      # 🎨 前端静态资源
│   ├── css/                     # 样式文件
│   │   ├── base.css            # 基础样式定义
│   │   ├── components.css      # 组件样式库
│   │   └── vendor/             # 第三方CSS库
│   ├── js/                     # JavaScript模块
│   │   ├── app.js              # 主应用入口
│   │   ├── components/         # UI组件库
│   │   │   ├── AuthModal.js    # 认证模态框组件
│   │   │   ├── UserInfo.js     # 用户信息组件
│   │   │   ├── QuickLinks.js   # 快速链接组件
│   │   │   ├── SearchBox.js    # 搜索框组件
│   │   │   ├── QuickLinkManager.js      # 快速链接管理器
│   │   │   ├── SearchEngineManager.js   # 搜索引擎管理器
│   │   │   └── WallpaperManager.js      # 壁纸管理器
│   │   ├── services/           # 前端服务层
│   │   ├── utils/              # 工具函数库
│   │   └── vendor/             # 第三方JS库
│   └── images/                 # 图片和图标资源
├── tests/                      # 🧪 测试套件
│   ├── __init__.py
│   ├── conftest.py             # pytest配置和fixture
│   ├── test_auth.py            # 用户认证功能测试
│   ├── test_avatar.py          # 头像功能测试
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
│   ├── start.sh                # 快速启动脚本
│   ├── docker_start.sh         # Docker启动脚本
│   ├── docker_start.bat        # Windows Docker启动脚本
│   ├── check_db.py             # 数据库连接检查工具
│   ├── migrate_add_users.py    # 用户系统迁移脚本
│   ├── migrate_add_avatar_url.py    # 头像字段迁移脚本
│   ├── migrate_add_profile_fields.py # 用户资料字段迁移脚本
│   ├── CHANGELOG.md            # 版本更新日志
│   └── RELEASE.md              # 发布说明
└── README.md                   # 📖 项目说明文档
```

## 🚀 快速开始

### 方式一：Docker部署（推荐）

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd jiansou-search-engine
   ```

2. **配置环境变量**
   ```bash
   # 复制环境变量模板
   cp env.example .env
   
   # 编辑配置文件，设置必要的环境变量
   # 特别是数据库连接和JWT密钥
   ```

3. **一键启动**
   ```bash
   # Windows用户
   docker_start.bat
   
   # Linux/Mac用户
   ./docker_start.sh
   # 或者
   docker-compose up -d
   ```

4. **访问应用**
   ```
   🌐 主应用: http://localhost:8000
   📚 API文档: http://localhost:8000/docs
   🔐 认证测试: http://localhost:8000/auth-test
   ```

   **首次使用 (v2.0+):**
   - 如果是全新安装，直接注册新用户
   - 如果从v1.x升级，运行迁移脚本：
     ```bash
     python migrate_add_users.py
     python migrate_add_avatar_url.py
     python migrate_add_profile_fields.py
     ```
   - 默认管理员账户：admin / admin123 (请及时更改密码)

### 方式二：本地开发

1. **环境要求**
   - Python 3.8+
   - MySQL 5.7+ 或 8.0+
   - (可选) WebDAV服务器用于文件存储

2. **安装依赖**
   ```bash
   pip install -r requirements.txt
   ```

3. **环境配置**
   ```bash
   # 复制环境变量模板
   cp env.example .env
   
   # 编辑配置文件
   # 配置数据库连接信息、JWT密钥等
   ```

4. **数据库初始化**
   ```bash
   # 检查数据库连接
   python check_db.py
   
   # 如果从旧版本升级，运行迁移脚本
   python migrate_add_users.py
   python migrate_add_avatar_url.py
   python migrate_add_profile_fields.py
   ```

5. **启动应用**
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
| `Ctrl+L` / `Cmd+L` | 打开链接管理器 | 快速管理快速链接 |
| `Ctrl+E` / `Cmd+E` | 打开搜索引擎管理器 | 快速管理搜索引擎 |

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
SECRET_KEY=your_secret_key_here     # JWT密钥（生产环境必须更改）
CORS_ORIGINS=["http://localhost:8000"]  # 允许的跨域来源

# WebDAV文件存储配置（可选）
WEBDAV_URL=https://your-webdav-server.com/dav/  # WebDAV服务器地址
WEBDAV_USERNAME=your_username       # WebDAV用户名
WEBDAV_PASSWORD=your_password       # WebDAV密码
```

### 功能特性配置

- **👤 用户认证系统** - JWT令牌认证，支持用户注册、登录、个人资料管理
- **🖼️ 头像上传功能** - 支持JPG、PNG、GIF、WebP格式，最大2MB，WebDAV存储
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
- `PUT /api/auth/profile` - 更新用户资料

#### 头像管理 (v2.0新增)
- `POST /api/avatar/upload` - 上传用户头像
- `DELETE /api/avatar/` - 删除用户头像
- `GET /api/avatar/download/{filename}` - 下载头像文件
- `GET /api/avatar/list` - 列出用户头像

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
pytest tests/test_auth.py -v
pytest tests/test_avatar.py -v
pytest tests/test_quick_links.py -v

# 生成覆盖率报告
pytest --cov=app tests/ --cov-report=html

# 运行特定测试并显示详细输出
pytest tests/test_auth.py::test_user_registration -v -s
```

### 测试覆盖范围

- ✅ **用户认证测试** - 注册、登录、JWT令牌验证
- ✅ **头像功能测试** - 文件上传、下载、删除
- ✅ **API端点测试** - 所有REST API的功能测试
- ✅ **业务逻辑测试** - 核心业务功能的单元测试
- ✅ **数据库操作测试** - 数据持久化操作测试
- ✅ **错误处理测试** - 异常情况和边界条件测试
- ✅ **WebDAV集成测试** - 文件存储服务测试

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
  -e SECRET_KEY=your-production-secret-key \
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
   - 定期更新依赖包

2. **⚡ 性能优化**
   - 配置反向代理（Nginx）
   - 启用Gzip压缩
   - 设置缓存策略
   - 配置CDN加速

3. **📊 监控和日志**
   - 配置日志轮转
   - 设置性能监控
   - 配置健康检查
   - 设置告警机制

4. **💾 数据备份**
   - 定期数据库备份
   - 文件存储备份
   - 配置文件备份

## 🔍 故障排除

### 常见问题

1. **数据库连接失败**
   ```bash
   # 检查数据库服务状态
   python check_db.py
   
   # 验证连接配置
   docker-compose logs jiansou
   
   # 检查环境变量
   echo $MYSQL_PASSWORD
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

4. **头像上传失败**
   ```bash
   # 检查WebDAV配置
   echo $WEBDAV_URL
   echo $WEBDAV_USERNAME
   
   # 测试WebDAV连接
   curl -u $WEBDAV_USERNAME:$WEBDAV_PASSWORD $WEBDAV_URL
   ```

5. **JWT令牌问题**
   ```bash
   # 检查SECRET_KEY配置
   echo $SECRET_KEY
   
   # 清除浏览器localStorage
   # 在浏览器控制台执行: localStorage.clear()
   ```

## 🆕 版本更新

### 从v1.x升级到v2.0

1. **备份数据**
   ```bash
   # 备份数据库
   mysqldump -u username -p database_name > backup.sql
   ```

2. **运行迁移脚本**
   ```bash
   # 添加用户表
   python migrate_add_users.py
   
   # 添加头像字段
   python migrate_add_avatar_url.py
   
   # 添加用户资料字段
   python migrate_add_profile_fields.py
   ```

3. **更新配置文件**
   ```bash
   # 添加新的环境变量
   SECRET_KEY=your-secret-key
   WEBDAV_URL=your-webdav-url
   WEBDAV_USERNAME=your-username
   WEBDAV_PASSWORD=your-password
   ```

4. **重启应用**
   ```bash
   docker-compose down
   docker-compose up -d
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
- 使用有意义的提交信息

### 提交信息格式

```
type(scope): description

[optional body]

[optional footer]
```

例如：
- `feat(auth): add user registration endpoint`
- `feat(avatar): implement avatar upload functionality`
- `fix(ui): resolve mobile responsive issues`
- `docs(readme): update installation guide`

## 📊 项目状态

- 🟢 **活跃维护** - 定期更新和功能改进
- 🧪 **测试覆盖率** - 90%+
- 📈 **性能指标** - 响应时间 < 100ms
- 🔒 **安全等级** - 生产就绪
- 👥 **用户系统** - 完整的认证和授权
- 📁 **文件存储** - WebDAV集成支持

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
- 🏷️ [发布说明](RELEASE.md) - 版本发布详情
- 🐛 [问题反馈](../../issues) - 报告问题和建议
- 💬 [讨论区](../../discussions) - 社区讨论
- 🏷️ [发布版本](../../releases) - 稳定版本下载

## 📞 支持与联系

如果您在使用过程中遇到问题或有任何建议，欢迎通过以下方式联系我们：

- 📧 **邮箱**: [support@jiansou.com](mailto:support@jiansou.com)
- 🌐 **项目主页**: [https://github.com/your-org/jiansou-search-engine](https://github.com/your-org/jiansou-search-engine)
- 📱 **QQ群**: 123456789
- 💬 **微信群**: 扫描二维码加入

---

<div align="center">

**简搜** - 让搜索更简单，让效率更高效 🚀

[![Star History Chart](https://api.star-history.com/svg?repos=your-org/jiansou-search-engine&type=Date)](https://star-history.com/#your-org/jiansou-search-engine&Date)

*如果这个项目对您有帮助，请给我们一个 ⭐ Star！*

</div> 