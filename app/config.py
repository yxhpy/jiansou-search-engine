"""
应用配置模块
"""
import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()


class Config:
    # 数据库配置 - 使用环境变量
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
    MYSQL_USER = os.getenv("MYSQL_USER", "search")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")  # 不提供默认密码
    MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "search")
    
    # 应用配置
    APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
    APP_PORT = int(os.getenv("APP_PORT", "8000"))
    APP_DEBUG = os.getenv("APP_DEBUG", "false").lower() == "true"
    
    @classmethod
    def get_database_url(cls):
        if not cls.MYSQL_PASSWORD:
            raise ValueError("MYSQL_PASSWORD environment variable is required")
        return f"mysql+pymysql://{cls.MYSQL_USER}:{quote_plus(cls.MYSQL_PASSWORD)}@{cls.MYSQL_HOST}:{cls.MYSQL_PORT}/{cls.MYSQL_DATABASE}?charset=utf8mb4"
    
    # 数据库引擎配置
    POOL_PRE_PING = True
    POOL_RECYCLE = 3600
    POOL_SIZE = 10
    MAX_OVERFLOW = 20
    ECHO = False


class AppConfig:
    """应用配置"""
    TITLE = "简搜 API"
    DESCRIPTION = "简洁高效的搜索引擎API"
    VERSION = "2.0.0"
    
    # 服务器配置
    HOST = Config.APP_HOST
    PORT = Config.APP_PORT
    DEBUG = Config.APP_DEBUG
    
    # 重试配置
    MAX_RETRIES = 3
    RETRY_DELAY = 1  # 秒
    
    # 搜索历史限制
    DEFAULT_SEARCH_HISTORY_LIMIT = 10


class AuthConfig:
    """认证配置"""
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30天
    
    # 密码要求
    MIN_PASSWORD_LENGTH = 6
    
    @classmethod
    def get_secret_key(cls):
        """获取密钥，如果是默认值则警告"""
        if cls.SECRET_KEY == "your-secret-key-change-this-in-production":
            import logging
            logging.warning("使用默认密钥，生产环境中请更改SECRET_KEY环境变量")
        return cls.SECRET_KEY


class DefaultData:
    """默认数据配置"""
    
    DEFAULT_QUICK_LINKS = [
        {"name": "百度", "url": "https://www.baidu.com", "icon": "fas fa-search", "color": "#007DFF", "category": "搜索"},
        {"name": "Google", "url": "https://www.google.com", "icon": "fab fa-google", "color": "#EA4335", "category": "搜索"},
        {"name": "必应", "url": "https://www.bing.com", "icon": "fab fa-microsoft", "color": "#00BCF2", "category": "搜索"},
        {"name": "微信", "url": "https://wx.qq.com", "icon": "fab fa-weixin", "color": "#07C160", "category": "社交"},
        {"name": "微博", "url": "https://weibo.com", "icon": "fab fa-weibo", "color": "#E6162D", "category": "社交"},
        {"name": "淘宝", "url": "https://www.taobao.com", "icon": "fas fa-shopping-cart", "color": "#FF4400", "category": "购物"},
        {"name": "京东", "url": "https://www.jd.com", "icon": "fas fa-shopping-bag", "color": "#E93323", "category": "购物"},
        {"name": "爱奇艺", "url": "https://www.iqiyi.com", "icon": "fas fa-play-circle", "color": "#00BE06", "category": "影视"},
        {"name": "腾讯视频", "url": "https://v.qq.com", "icon": "fas fa-video", "color": "#FF6700", "category": "影视"},
        {"name": "GitHub", "url": "https://github.com", "icon": "fab fa-github", "color": "#24292E", "category": "开发"},
        {"name": "Stack Overflow", "url": "https://stackoverflow.com", "icon": "fab fa-stack-overflow", "color": "#F48024", "category": "开发"},
        {"name": "知乎", "url": "https://www.zhihu.com", "icon": "fab fa-zhihu", "color": "#0084FF", "category": "学习"},
        {"name": "CSDN", "url": "https://www.csdn.net", "icon": "fas fa-code", "color": "#FC5531", "category": "学习"},
        {"name": "网易云音乐", "url": "https://music.163.com", "icon": "fas fa-music", "color": "#C20C0C", "category": "音乐"},
        {"name": "QQ音乐", "url": "https://y.qq.com", "icon": "fas fa-headphones", "color": "#31C27C", "category": "音乐"},
        {"name": "新浪新闻", "url": "https://news.sina.com.cn", "icon": "fas fa-newspaper", "color": "#D52B1E", "category": "新闻"},
        {"name": "腾讯新闻", "url": "https://news.qq.com", "icon": "fas fa-rss", "color": "#0052D9", "category": "新闻"},
        {"name": "百度图片", "url": "https://image.baidu.com", "icon": "fas fa-images", "color": "#4285F4", "category": "图片"},
        {"name": "翻译", "url": "https://translate.google.com", "icon": "fas fa-language", "color": "#34A853", "category": "工具"},
    ]
    
    DEFAULT_SEARCH_ENGINES = [
        {
            "name": "baidu",
            "display_name": "百度",
            "url_template": "https://www.baidu.com/s?wd={query}",
            "icon": "fas fa-search",
            "color": "#007DFF",
            "is_active": True,
            "is_default": True,
            "sort_order": 1
        },
        {
            "name": "google",
            "display_name": "Google",
            "url_template": "https://www.google.com/search?q={query}",
            "icon": "fab fa-google",
            "color": "#EA4335",
            "is_active": True,
            "is_default": False,
            "sort_order": 2
        },
        {
            "name": "bing",
            "display_name": "必应",
            "url_template": "https://www.bing.com/search?q={query}",
            "icon": "fab fa-microsoft",
            "color": "#00BCF2",
            "is_active": True,
            "is_default": False,
            "sort_order": 3
        },
        {
            "name": "sogou",
            "display_name": "搜狗",
            "url_template": "https://www.sogou.com/web?query={query}",
            "icon": "fas fa-search",
            "color": "#FF6B00",
            "is_active": True,
            "is_default": False,
            "sort_order": 4
        },
        {
            "name": "duckduckgo",
            "display_name": "DuckDuckGo",
            "url_template": "https://duckduckgo.com/?q={query}",
            "icon": "fas fa-user-secret",
            "color": "#DE5833",
            "is_active": True,
            "is_default": False,
            "sort_order": 5
        }
    ]
    
    CATEGORIES = [
        "搜索",
        "社交",
        "购物",
        "影视",
        "游戏",
        "学习",
        "工具",
        "新闻",
        "音乐",
        "图片",
        "开发",
        "其他"
    ] 