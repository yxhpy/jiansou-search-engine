# 简搜 - 简洁高效的搜索工具

一个现代化的搜索引擎首页应用，提供简洁高效的搜索体验和强大的自定义功能。

## ✨ 项目特性

- 🔍 **多搜索引擎支持** - 百度、Google、必应等主流搜索引擎
- 🔗 **智能快速链接** - 支持分类管理和自动图标识别
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🎨 **现代化UI** - 基于华为设计语言的简洁界面
- 🖼️ **动态壁纸** - 支持必应每日壁纸和自定义背景
- ⌨️ **快捷键支持** - 提升操作效率的键盘快捷键
- 🚀 **高性能架构** - 模块化设计，快速响应
- 🔧 **RESTful API** - 完整的后端API接口
- ✅ **完整测试覆盖** - 单元测试和集成测试

## 🛠️ 技术栈

### 后端
- **FastAPI** - 现代化的Python Web框架
- **SQLAlchemy** - 强大的ORM框架
- **MySQL** - 生产级数据库
- **Pydantic** - 数据验证和序列化

### 前端
- **原生JavaScript** - 模块化ES6+代码
- **Tailwind CSS** - 实用优先的CSS框架
- **Font Awesome** - 丰富的图标库
- **响应式设计** - 移动端优先

### 部署
- **Docker** - 容器化部署
- **Docker Compose** - 多服务编排
- **Uvicorn** - ASGI服务器

## 📁 项目结构

```
简搜/
├── app/                          # 应用核心目录
│   ├── __init__.py              # 应用包初始化
│   ├── main.py                  # 主应用文件
│   ├── config.py                # 应用配置
│   ├── database.py              # 数据库连接管理
│   ├── models.py                # 数据库模型
│   ├── schemas.py               # Pydantic数据模式
│   ├── routers/                 # API路由模块
│   │   ├── __init__.py
│   │   ├── quick_links.py       # 快速链接API
│   │   ├── search_engines.py    # 搜索引擎API
│   │   ├── search.py            # 搜索功能API
│   │   └── wallpaper.py         # 壁纸API
│   └── services/                # 业务逻辑服务
│       ├── __init__.py
│       ├── quick_link_service.py      # 快速链接服务
│       ├── search_engine_service.py   # 搜索引擎服务
│       ├── search_service.py          # 搜索服务
│       └── data_init_service.py       # 数据初始化服务
├── static/                      # 静态资源
│   ├── css/                     # 样式文件
│   │   ├── base.css            # 基础样式
│   │   └── components.css      # 组件样式
│   ├── js/                     # JavaScript模块
│   │   ├── app.js              # 主应用文件
│   │   ├── components/         # UI组件
│   │   ├── services/           # 服务层
│   │   └── utils/              # 工具函数
│   └── images/                 # 图片资源
├── tests/                      # 测试目录
│   ├── __init__.py
│   ├── conftest.py             # pytest配置
│   ├── test_quick_links.py     # 快速链接测试
│   ├── test_search_engines.py  # 搜索引擎测试
│   ├── test_search.py          # 搜索功能测试
│   └── test_data_init.py       # 数据初始化测试
├── index_new.html              # 主页面文件
├── main_new.py                 # 应用启动文件
├── requirements.txt            # Python依赖
├── Dockerfile                  # Docker配置
├── docker-compose.yml          # Docker Compose配置
└── start.sh                    # 启动脚本
```

## 🚀 快速开始

### 使用Docker（推荐）

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd 简搜
   ```

2. **启动应用**
   ```bash
   docker-compose up -d
   ```

3. **访问应用**
   ```
   http://localhost:8000
   ```

### 本地开发

1. **安装依赖**
   ```bash
   pip install -r requirements.txt
   ```

2. **配置数据库**
   ```bash
   # 编辑 app/config.py 中的数据库配置
   ```

3. **启动应用**
   ```bash
   python main_new.py
   ```

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+K` | 聚焦搜索框 |
| `ESC` | 清空搜索内容 |
| `F5` | 刷新数据 |
| `W` | 切换壁纸 |

## 🔧 配置说明

### 环境变量

```bash
# 数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=search
MYSQL_PASSWORD=your_secure_password_here
MYSQL_DATABASE=search

# 应用配置
APP_HOST=0.0.0.0
APP_PORT=8000
APP_DEBUG=false
```

### 功能配置

- **搜索引擎管理** - 支持添加、编辑、删除搜索引擎
- **快速链接管理** - 支持分类管理和自动图标识别
- **壁纸设置** - 支持必应每日壁纸和自定义背景
- **界面主题** - 基于华为设计语言的现代化界面

## 📊 API文档

启动应用后访问：
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 主要API端点

- `GET /api/search-engines` - 获取搜索引擎列表
- `POST /api/search-engines` - 添加搜索引擎
- `GET /api/quick-links` - 获取快速链接
- `POST /api/quick-links` - 添加快速链接
- `GET /api/wallpaper` - 获取壁纸信息

## 🧪 测试

```bash
# 运行所有测试
pytest

# 运行特定测试
pytest tests/test_quick_links.py

# 生成覆盖率报告
pytest --cov=app tests/
```

## 📦 部署

### Docker部署

```bash
# 构建镜像
docker build -t jiansou .

# 运行容器
docker run -d -p 8000:8000 jiansou
```

### Docker Compose部署

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [项目文档](docs/)
- [更新日志](CHANGELOG.md)
- [问题反馈](issues/)

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 邮箱: [your-email@example.com]
- 项目主页: [project-homepage]

---

**简搜** - 让搜索更简单，让效率更高效 🚀 