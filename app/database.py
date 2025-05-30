"""
数据库连接和会话管理模块
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
import logging
import time
from typing import Generator

from .config import Config as DatabaseConfig, AppConfig

logger = logging.getLogger(__name__)

# 全局变量
engine = None
SessionLocal = None
Base = declarative_base()


def setup_database() -> bool:
    """设置数据库连接"""
    global engine, SessionLocal
    
    database_url = DatabaseConfig.get_database_url()
    logger.info(f"连接MySQL数据库: {DatabaseConfig.MYSQL_HOST}:{DatabaseConfig.MYSQL_PORT}/{DatabaseConfig.MYSQL_DATABASE}")

    try:
        engine = create_engine(
            database_url,
            pool_pre_ping=DatabaseConfig.POOL_PRE_PING,
            pool_recycle=DatabaseConfig.POOL_RECYCLE,
            pool_size=DatabaseConfig.POOL_SIZE,
            max_overflow=DatabaseConfig.MAX_OVERFLOW,
            echo=DatabaseConfig.ECHO
        )
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        logger.info("MySQL数据库引擎创建成功")
        return True
    except Exception as e:
        logger.error(f"MySQL数据库引擎创建失败: {e}")
        return False


def create_database_tables() -> bool:
    """创建数据库表"""
    global engine
    
    if engine is None:
        logger.error("数据库引擎未初始化")
        return False
    
    max_retries = AppConfig.MAX_RETRIES
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
                time.sleep(AppConfig.RETRY_DELAY)
    return False


def get_db() -> Generator[Session, None, None]:
    """获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_database_connection() -> bool:
    """测试数据库连接"""
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        logger.info("数据库连接测试通过")
        return True
    except Exception as e:
        logger.error(f"数据库连接测试失败: {e}")
        return False 