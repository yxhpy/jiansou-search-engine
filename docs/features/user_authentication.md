# 用户认证功能说明

## 概述

简搜系统现已支持用户认证功能，实现了完整的用户注册、登录、数据隔离机制。每个用户拥有独立的快速链接、搜索引擎配置和搜索历史。

## 主要功能

### 1. 用户注册
- 用户可以使用用户名、邮箱和密码注册账号
- 系统自动为新用户创建默认的快速链接和搜索引擎配置
- 密码使用bcrypt加密存储

### 2. 用户登录
- 支持JWT令牌认证
- 令牌有效期30天
- 自动刷新机制

### 3. 数据隔离
- 每个用户的数据完全隔离
- 快速链接、搜索引擎、搜索历史按用户分别存储
- 用户只能访问自己的数据

### 4. 默认数据
新注册用户会自动获得以下默认数据：
- **快速链接**: 19个常用网站链接（百度、Google、微信、淘宝等）
- **搜索引擎**: 5个主流搜索引擎（百度、Google、必应、搜狗、DuckDuckGo）

## API端点

### 认证相关

#### POST /api/auth/register
用户注册
```json
{
  "username": "string",
  "email": "user@example.com", 
  "password": "string"
}
```

#### POST /api/auth/login
用户登录
```json
{
  "username": "string",
  "password": "string"
}
```

#### GET /api/auth/me
获取当前用户信息
- 需要JWT令牌认证

### 业务API
所有业务API现在都需要JWT令牌认证：
- GET/POST/PUT/DELETE /api/quick-links/*
- GET/POST/PUT/DELETE /api/search-engines/*
- POST /api/search
- GET /api/search-history

## 数据库迁移

### 对于新安装
直接运行应用即可，系统会自动创建包含用户表的完整数据库结构。

### 对于现有数据库
运行迁移脚本来添加用户认证功能：

```bash
python migrate_add_users.py
```

迁移脚本会：
1. 创建users表
2. 创建默认管理员账户（如果没有用户）
3. 为现有表添加user_id字段
4. 将现有数据分配给默认管理员用户

**默认管理员账户信息:**
- 用户名: admin
- 密码: admin123
- 邮箱: admin@example.com

⚠️ **重要**: 请在生产环境中立即更改默认密码！

## 环境配置

在`.env`文件中添加认证相关配置：

```env
# 安全配置（生产环境中请更改密钥）
SECRET_KEY=your-secret-key-change-this-in-production
```

## 前端集成

### JavaScript示例

```javascript
// 用户注册
async function register(username, email, password) {
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    });
    return response.json();
}

// 用户登录
async function login(username, password) {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.access_token);
        return data;
    }
    throw new Error('登录失败');
}

// 调用需要认证的API
async function getQuickLinks() {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/quick-links', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
}
```

## 测试页面

访问 `/auth-test` 可以看到完整的认证功能测试页面，包括：
- 用户注册表单
- 用户登录表单
- 用户状态显示
- API功能测试

## 安全考虑

1. **密码安全**: 使用bcrypt进行密码哈希
2. **JWT安全**: 使用HS256算法签名
3. **数据隔离**: 严格的用户数据访问控制
4. **SQL注入防护**: 使用参数化查询
5. **CORS配置**: 根据需要配置跨域访问

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查MySQL服务是否运行
   - 验证数据库配置信息

2. **JWT令牌无效**
   - 检查SECRET_KEY配置
   - 令牌可能已过期，需要重新登录

3. **迁移脚本失败**
   - 确保数据库用户有足够权限
   - 检查数据库连接字符串

### 日志查看
应用日志会记录认证相关的操作和错误信息，便于调试。

## 升级说明

从v1.x升级到v2.x（带认证功能）：

1. 备份现有数据库
2. 更新代码
3. 运行迁移脚本：`python migrate_add_users.py`
4. 测试认证功能
5. 更新前端代码以支持JWT认证

---

有任何问题请查看[故障排除文档](../bugfixes/)或提交Issue。 