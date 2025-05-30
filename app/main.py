"""
主应用文件
"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import logging
import os

from .config import AppConfig
from .database import setup_database, create_database_tables
from .services.data_init_service import DataInitService
from .routers import quick_links, search_engines, search

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化
    try:
        logger.info("应用启动，开始初始化...")
        
        # 设置数据库连接
        if not setup_database():
            logger.error("数据库设置失败")
            raise Exception("数据库设置失败")
        
        # 创建数据库表
        if not create_database_tables():
            logger.error("数据库表创建失败")
            raise Exception("数据库表创建失败")
        
        # 初始化默认数据
        if not DataInitService.init_default_data():
            logger.warning("默认数据初始化失败，但应用将继续启动")
        else:
            logger.info("应用初始化完成")
            
    except Exception as e:
        logger.error(f"应用初始化时发生错误: {e}")
        logger.warning("尽管初始化失败，应用仍将继续启动")
    
    yield
    
    # 关闭时的清理工作
    logger.info("应用正在关闭...")


# 创建FastAPI应用
app = FastAPI(
    title=AppConfig.TITLE,
    description=AppConfig.DESCRIPTION,
    version=AppConfig.VERSION,
    lifespan=lifespan
)

# 注册路由
app.include_router(quick_links.router)
app.include_router(search_engines.router)
app.include_router(search.router)

# 导入壁纸路由
from .routers import wallpaper
app.include_router(wallpaper.router)


@app.get("/")
def read_index():
    """返回首页"""
    return FileResponse("index_new.html")


# 挂载静态文件（如果有的话）
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static") 