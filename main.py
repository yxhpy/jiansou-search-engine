from fastapi import FastAPI, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from contextlib import asynccontextmanager
from urllib.parse import quote_plus
import json
import os
import logging
import time

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 全局变量声明
engine = None
SessionLocal = None
MYSQL_DATABASE_URL = None

def setup_database():
    """设置数据库连接"""
    global engine, SessionLocal, MYSQL_DATABASE_URL
    
    # MySQL 8 连接配置
    MYSQL_HOST = "rm-bp14l1x39idnx386k3o.mysql.rds.aliyuncs.com"
    MYSQL_USER = "search"
    MYSQL_PASSWORD = "search@123"
    MYSQL_DATABASE = "search"
    MYSQL_PORT = 3306
    
    # MySQL连接URL
    MYSQL_DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{quote_plus(MYSQL_PASSWORD)}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4"
    
    logger.info(f"连接MySQL数据库: {MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}")

    # 创建数据库引擎
    try:
        engine = create_engine(
            MYSQL_DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=3600,
            pool_size=10,
            max_overflow=20,
            echo=False
        )
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        logger.info(f"MySQL数据库引擎创建成功")
        return True
    except Exception as e:
        logger.error(f"MySQL数据库引擎创建失败: {e}")
        return False

# 初始化数据库
if not setup_database():
    logger.error("数据库设置失败")
    exit(1)

Base = declarative_base()

# 数据库模型
class QuickLink(Base):
    __tablename__ = "quick_links"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    url = Column(String(512))
    icon = Column(String(100))
    color = Column(String(20))
    category = Column(String(100), index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SearchEngine(Base):
    __tablename__ = "search_engines"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    display_name = Column(String(255))
    url_template = Column(String(512))  # 使用 {query} 作为占位符
    icon = Column(String(100))
    color = Column(String(20))
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class SearchHistory(Base):
    __tablename__ = "search_history"
    
    id = Column(Integer, primary_key=True, index=True)
    query = Column(String(255), index=True)
    search_engine = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic模型
class QuickLinkCreate(BaseModel):
    name: str
    url: str
    icon: str = "fas fa-link"
    color: str = "#007DFF"
    category: str = "其他"

class QuickLinkUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    category: Optional[str] = None

class QuickLinkResponse(BaseModel):
    id: int
    name: str
    url: str
    icon: str
    color: str
    category: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class SearchEngineCreate(BaseModel):
    name: str
    display_name: str
    url_template: str
    icon: str = "fas fa-search"
    color: str = "#007DFF"
    is_active: bool = True
    is_default: bool = False

class SearchEngineUpdate(BaseModel):
    display_name: Optional[str] = None
    url_template: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None
    sort_order: Optional[int] = None

class SearchEngineResponse(BaseModel):
    id: int
    name: str
    display_name: str
    url_template: str
    icon: str
    color: str
    is_active: bool
    is_default: bool
    sort_order: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class SearchRequest(BaseModel):
    query: str
    search_engine: str = "baidu"

def create_database_tables():
    """创建数据库表"""
    global engine, SessionLocal, MYSQL_DATABASE_URL
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            logger.info(f"尝试创建数据库表 (第 {attempt + 1} 次)")
            Base.metadata.create_all(bind=engine)
            logger.info("数据库表创建成功")
            return True
        except Exception as e:
            logger.error(f"数据库表创建失败 (第 {attempt + 1} 次): {e}")
            if attempt == max_retries - 1:
                logger.error(f"所有重试失败，无法创建数据库表: {e}")
                raise e
            else:
                time.sleep(1)  # 等待1秒后重试
    return False

# 创建数据库表
if not create_database_tables():
    logger.error("无法创建数据库表，应用无法启动")
    exit(1)

def init_default_data():
    """初始化默认数据"""
    max_retries = 3
    for attempt in range(max_retries):
        db = None
        try:
            logger.info(f"开始初始化默认数据 (第 {attempt + 1} 次)")
            db = SessionLocal()
            
            # 测试数据库连接
            db.execute(text("SELECT 1"))
            logger.info("数据库连接测试通过")
            
            # 检查快速链接数据
            if db.query(QuickLink).count() == 0:
                logger.info("初始化快速链接数据")
                if os.path.exists("index.json"):
                    with open("index.json", "r", encoding="utf-8") as f:
                        data = json.load(f)
                        for link_data in data["quickLinks"]:
                            db_link = QuickLink(
                                name=link_data["name"],
                                url=link_data["url"],
                                icon=link_data["icon"],
                                color=link_data["color"],
                                category=link_data["category"]
                            )
                            db.add(db_link)
                else:
                    # 创建默认快速链接
                    default_links = [
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
                    for link_data in default_links:
                        db_link = QuickLink(**link_data)
                        db.add(db_link)
            
            # 检查搜索引擎数据
            if db.query(SearchEngine).count() == 0:
                logger.info("初始化搜索引擎数据")
                default_search_engines = [
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
                for engine_data in default_search_engines:
                    db_engine = SearchEngine(**engine_data)
                    db.add(db_engine)
            
            db.commit()
            logger.info("默认数据初始化完成")
            return True
            
        except Exception as e:
            logger.error(f"初始化默认数据失败 (第 {attempt + 1} 次): {e}")
            if db:
                try:
                    db.rollback()
                except:
                    pass
            if attempt == max_retries - 1:
                logger.error("默认数据初始化最终失败，应用可能无法正常工作")
                return False
            else:
                time.sleep(2)  # 等待2秒后重试
        finally:
            if db:
                try:
                    db.close()
                except:
                    pass
    
    return False

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时初始化数据
    try:
        logger.info("应用启动，开始初始化...")
        if not init_default_data():
            logger.warning("默认数据初始化失败，但应用将继续启动")
        else:
            logger.info("应用初始化完成")
    except Exception as e:
        logger.error(f"应用初始化时发生错误: {e}")
        logger.warning("尽管初始化失败，应用仍将继续启动")
    
    yield
    
    # 关闭时的清理工作
    logger.info("应用正在关闭...")

# FastAPI应用
app = FastAPI(
    title="简搜 API", 
    description="简洁高效的搜索引擎API", 
    version="1.0.0",
    lifespan=lifespan
)

# 数据库依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API路由

# 快速链接相关API
@app.get("/api/quick-links", response_model=List[QuickLinkResponse])
def get_quick_links(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(QuickLink)
    if category and category != "all":
        query = query.filter(QuickLink.category == category)
    return query.all()

@app.post("/api/quick-links", response_model=QuickLinkResponse)
def create_quick_link(link: QuickLinkCreate, db: Session = Depends(get_db)):
    db_link = QuickLink(
        name=link.name,
        url=link.url,
        icon=link.icon,
        color=link.color,
        category=link.category
    )
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return db_link

@app.put("/api/quick-links/{link_id}", response_model=QuickLinkResponse)
def update_quick_link(link_id: int, link: QuickLinkUpdate, db: Session = Depends(get_db)):
    db_link = db.query(QuickLink).filter(QuickLink.id == link_id).first()
    if not db_link:
        raise HTTPException(status_code=404, detail="快速链接未找到")
    
    if link.name is not None:
        db_link.name = link.name
    if link.url is not None:
        db_link.url = link.url
    if link.icon is not None:
        db_link.icon = link.icon
    if link.color is not None:
        db_link.color = link.color
    if link.category is not None:
        db_link.category = link.category
    
    db.commit()
    db.refresh(db_link)
    return db_link

@app.delete("/api/quick-links/{link_id}")
def delete_quick_link(link_id: int, db: Session = Depends(get_db)):
    db_link = db.query(QuickLink).filter(QuickLink.id == link_id).first()
    if not db_link:
        raise HTTPException(status_code=404, detail="快速链接未找到")
    
    db.delete(db_link)
    db.commit()
    return {"message": "删除成功"}

@app.get("/api/categories")
def get_categories():
    """获取预定义的分类列表"""
    categories = [
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
    return categories

# 搜索引擎相关API
@app.get("/api/search-engines", response_model=List[SearchEngineResponse])
def get_search_engines(active_only: bool = True, db: Session = Depends(get_db)):
    query = db.query(SearchEngine)
    if active_only:
        query = query.filter(SearchEngine.is_active == True)
    return query.order_by(SearchEngine.sort_order).all()

@app.post("/api/search-engines", response_model=SearchEngineResponse)
def create_search_engine(engine: SearchEngineCreate, db: Session = Depends(get_db)):
    # 检查名称是否已存在
    existing = db.query(SearchEngine).filter(SearchEngine.name == engine.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="搜索引擎名称已存在")
    
    # 如果设置为默认搜索引擎，取消其他的默认设置
    if engine.is_default:
        db.query(SearchEngine).update({"is_default": False})
    
    db_engine = SearchEngine(
        name=engine.name,
        display_name=engine.display_name,
        url_template=engine.url_template,
        icon=engine.icon,
        color=engine.color,
        is_active=engine.is_active,
        is_default=engine.is_default
    )
    db.add(db_engine)
    db.commit()
    db.refresh(db_engine)
    return db_engine

@app.put("/api/search-engines/{engine_id}", response_model=SearchEngineResponse)
def update_search_engine(engine_id: int, engine: SearchEngineUpdate, db: Session = Depends(get_db)):
    db_engine = db.query(SearchEngine).filter(SearchEngine.id == engine_id).first()
    if not db_engine:
        raise HTTPException(status_code=404, detail="搜索引擎未找到")
    
    # 如果设置为默认搜索引擎，取消其他的默认设置
    if engine.is_default:
        db.query(SearchEngine).update({"is_default": False})
    
    if engine.display_name is not None:
        db_engine.display_name = engine.display_name
    if engine.url_template is not None:
        db_engine.url_template = engine.url_template
    if engine.icon is not None:
        db_engine.icon = engine.icon
    if engine.color is not None:
        db_engine.color = engine.color
    if engine.is_active is not None:
        db_engine.is_active = engine.is_active
    if engine.is_default is not None:
        db_engine.is_default = engine.is_default
    if engine.sort_order is not None:
        db_engine.sort_order = engine.sort_order
    
    db.commit()
    db.refresh(db_engine)
    return db_engine

@app.delete("/api/search-engines/{engine_id}")
def delete_search_engine(engine_id: int, db: Session = Depends(get_db)):
    db_engine = db.query(SearchEngine).filter(SearchEngine.id == engine_id).first()
    if not db_engine:
        raise HTTPException(status_code=404, detail="搜索引擎未找到")
    
    db.delete(db_engine)
    db.commit()
    return {"message": "删除成功"}

@app.get("/api/search-engines/default", response_model=SearchEngineResponse)
def get_default_search_engine(db: Session = Depends(get_db)):
    default_engine = db.query(SearchEngine).filter(SearchEngine.is_default == True).first()
    if not default_engine:
        # 如果没有默认搜索引擎，返回第一个活跃的搜索引擎
        default_engine = db.query(SearchEngine).filter(SearchEngine.is_active == True).first()
    
    if not default_engine:
        raise HTTPException(status_code=404, detail="未找到可用的搜索引擎")
    
    return default_engine

@app.post("/api/search")
def search(search_request: SearchRequest, db: Session = Depends(get_db)):
    # 记录搜索历史
    try:
        search_history = SearchHistory(
            query=search_request.query,
            search_engine=search_request.search_engine
        )
        db.add(search_history)
        db.commit()
    except Exception as e:
        logger.warning(f"搜索历史记录失败: {e}")
    
    # 获取搜索引擎URL模板
    engine = db.query(SearchEngine).filter(SearchEngine.name == search_request.search_engine).first()
    if not engine:
        raise HTTPException(status_code=404, detail="搜索引擎未找到")
    
    # 构建搜索URL
    search_url = engine.url_template.format(query=search_request.query)
    
    return {
        "search_url": search_url,
        "search_engine": engine.display_name,
        "query": search_request.query
    }

@app.get("/api/search-history")
def get_search_history(limit: int = 10, db: Session = Depends(get_db)):
    history = db.query(SearchHistory).order_by(SearchHistory.created_at.desc()).limit(limit).all()
    return history

@app.get("/")
def read_index():
    return FileResponse("index.html")

# 挂载静态文件（如果有的话）
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 