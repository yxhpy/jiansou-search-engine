#!/usr/bin/env python3
"""
数据库连接检查工具
用于验证MySQL8连接是否正常
"""

import pymysql
import logging
from sqlalchemy import create_engine, text
from urllib.parse import quote_plus

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_mysql_connection():
    """测试MySQL连接"""
    # MySQL 8 连接配置
    MYSQL_HOST = "rm-bp14l1x39idnx386k3o.mysql.rds.aliyuncs.com"
    MYSQL_USER = "search"
    MYSQL_PASSWORD = "search@123"
    MYSQL_DATABASE = "search"
    MYSQL_PORT = 3306
    
    logger.info(f"测试MySQL连接: {MYSQL_HOST}:{MYSQL_PORT}")
    
    # 方式1: 使用pymysql直接连接
    try:
        connection = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE,
            charset='utf8mb4'
        )
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            logger.info(f"PyMySQL连接成功，MySQL版本: {version[0]}")
            
            # 测试数据库和表
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            logger.info(f"数据库中的表: {[table[0] for table in tables]}")
            
        connection.close()
        logger.info("PyMySQL连接关闭")
        
    except Exception as e:
        logger.error(f"PyMySQL连接失败: {e}")
        return False
    
    # 方式2: 使用SQLAlchemy连接（URL编码密码）
    try:
        # URL编码密码中的特殊字符
        encoded_password = quote_plus(MYSQL_PASSWORD)
        MYSQL_DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{encoded_password}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4"
        
        logger.info(f"SQLAlchemy连接URL: mysql+pymysql://{MYSQL_USER}:***@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4")
        
        engine = create_engine(
            MYSQL_DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=False  # 设为False减少日志输出
        )
        
        with engine.connect() as connection:
            result = connection.execute(text("SELECT VERSION()"))
            version = result.fetchone()
            logger.info(f"SQLAlchemy连接成功，MySQL版本: {version[0]}")
            
            # 测试查询
            result = connection.execute(text("SHOW TABLES"))
            tables = result.fetchall()
            logger.info(f"SQLAlchemy查询表列表成功: {[table[0] for table in tables]}")
            
        logger.info("SQLAlchemy连接关闭")
        return True
        
    except Exception as e:
        logger.error(f"SQLAlchemy连接失败: {e}")
        return False

if __name__ == "__main__":
    logger.info("开始数据库连接测试...")
    success = test_mysql_connection()
    if success:
        logger.info("✓ 数据库连接测试通过")
    else:
        logger.error("✗ 数据库连接测试失败")
        exit(1) 