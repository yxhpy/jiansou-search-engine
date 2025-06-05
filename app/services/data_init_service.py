"""
数据初始化服务
"""
from sqlalchemy.orm import Session
from sqlalchemy import text
import logging
import time
import json
import os

from ..config import AppConfig, DefaultData
from .quick_link_service import QuickLinkService
from .search_engine_service import SearchEngineService

logger = logging.getLogger(__name__)


class DataInitService:
    """数据初始化服务类"""
    
    @staticmethod
    def init_default_data() -> bool:
        """初始化默认数据"""
        from ..database import SessionLocal
        
        max_retries = AppConfig.MAX_RETRIES
        for attempt in range(max_retries):
            db = None
            try:
                logger.info(f"开始初始化默认数据 (第 {attempt + 1} 次)")
                db = SessionLocal()
                
                # 测试数据库连接
                db.execute(text("SELECT 1"))
                logger.info("数据库连接测试通过")
                
                # 初始化快速链接数据
                success = DataInitService._init_quick_links(db)
                if not success:
                    logger.error("快速链接数据初始化失败")
                    continue
                
                # 初始化搜索引擎数据
                success = DataInitService._init_search_engines(db)
                if not success:
                    logger.error("搜索引擎数据初始化失败")
                    continue
                
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
                    time.sleep(AppConfig.RETRY_DELAY * 2)  # 等待2秒后重试
            finally:
                if db:
                    try:
                        db.close()
                    except:
                        pass
        
        return False
    
    @staticmethod
    def _init_quick_links(db: Session) -> bool:
        """初始化快速链接数据"""
        try:
            # 检查是否需要从JSON文件加载数据
            if os.path.exists("index.json"):
                logger.info("从index.json文件初始化快速链接数据")
                return DataInitService._load_quick_links_from_json(db)
            else:
                logger.info("初始化默认快速链接数据")
                return QuickLinkService.init_default_quick_links(db)
        except Exception as e:
            logger.error(f"快速链接数据初始化失败: {e}")
            return False
    
    @staticmethod
    def _init_search_engines(db: Session) -> bool:
        """初始化搜索引擎数据"""
        try:
            logger.info("初始化默认搜索引擎数据")
            return SearchEngineService.init_default_search_engines(db)
        except Exception as e:
            logger.error(f"搜索引擎数据初始化失败: {e}")
            return False
    
    @staticmethod
    def _load_quick_links_from_json(db: Session) -> bool:
        """从JSON文件加载快速链接数据"""
        try:
            with open("index.json", "r", encoding="utf-8") as f:
                data = json.load(f)
                for link_data in data["quickLinks"]:
                    from ..models import QuickLink
                    db_link = QuickLink(
                        name=link_data["name"],
                        url=link_data["url"],
                        icon=link_data["icon"],
                        color=link_data["color"],
                        category=link_data["category"]
                    )
                    db.add(db_link)
            db.commit()
            return True
        except Exception as e:
            logger.error(f"从JSON文件加载快速链接数据失败: {e}")
            db.rollback()
            return False
    
    @staticmethod
    def init_user_default_data(db: Session, user_id: int) -> bool:
        """为新用户初始化默认数据"""
        try:
            logger.info(f"为用户 {user_id} 初始化默认数据")
            
            # 初始化用户的默认快速链接
            success = DataInitService._init_user_quick_links(db, user_id)
            if not success:
                logger.error(f"用户 {user_id} 快速链接初始化失败")
                return False
            
            # 初始化用户的默认搜索引擎
            success = DataInitService._init_user_search_engines(db, user_id)
            if not success:
                logger.error(f"用户 {user_id} 搜索引擎初始化失败")
                return False
            
            logger.info(f"用户 {user_id} 默认数据初始化完成")
            return True
            
        except Exception as e:
            logger.error(f"用户 {user_id} 默认数据初始化失败: {e}")
            db.rollback()
            return False
    
    @staticmethod
    def _init_user_quick_links(db: Session, user_id: int) -> bool:
        """为用户初始化默认快速链接"""
        try:
            from ..models import QuickLink
            for link_data in DefaultData.DEFAULT_QUICK_LINKS:
                db_link = QuickLink(
                    name=link_data["name"],
                    url=link_data["url"],
                    icon=link_data["icon"],
                    color=link_data["color"],
                    category=link_data["category"],
                    user_id=user_id
                )
                db.add(db_link)
            db.commit()
            return True
        except Exception as e:
            logger.error(f"用户 {user_id} 快速链接初始化失败: {e}")
            db.rollback()
            return False
    
    @staticmethod
    def _init_user_search_engines(db: Session, user_id: int) -> bool:
        """为用户初始化默认搜索引擎"""
        try:
            from ..models import SearchEngine
            for engine_data in DefaultData.DEFAULT_SEARCH_ENGINES:
                db_engine = SearchEngine(
                    name=engine_data["name"],
                    display_name=engine_data["display_name"],
                    url_template=engine_data["url_template"],
                    icon=engine_data["icon"],
                    color=engine_data["color"],
                    is_active=engine_data["is_active"],
                    is_default=engine_data["is_default"],
                    sort_order=engine_data["sort_order"],
                    user_id=user_id
                )
                db.add(db_engine)
            db.commit()
            return True
        except Exception as e:
            logger.error(f"用户 {user_id} 搜索引擎初始化失败: {e}")
            db.rollback()
            return False 