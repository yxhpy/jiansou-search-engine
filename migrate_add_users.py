#!/usr/bin/env python3
"""
数据库迁移脚本：添加用户认证功能

该脚本将为现有的数据库表添加用户ID字段，并创建用户表。
如果数据库中已有数据，会创建一个默认管理员用户，并将所有现有数据分配给该用户。

使用方法：
1. 确保数据库配置正确
2. 运行: python migrate_add_users.py
"""

import sys
import os

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text, Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import logging
from datetime import datetime

from app.config import Config
from app.auth import get_password_hash

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_connection():
    """创建数据库连接"""
    try:
        database_url = Config.get_database_url()
        engine = create_engine(database_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        return engine, SessionLocal
    except Exception as e:
        logger.error(f"数据库连接失败: {e}")
        return None, None


def check_table_exists(engine, table_name):
    """检查表是否存在"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text(f"""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE() 
                AND table_name = '{table_name}'
            """))
            return result.scalar() > 0
    except Exception as e:
        logger.error(f"检查表 {table_name} 是否存在时出错: {e}")
        return False


def check_column_exists(engine, table_name, column_name):
    """检查列是否存在"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text(f"""
                SELECT COUNT(*) 
                FROM information_schema.columns 
                WHERE table_schema = DATABASE() 
                AND table_name = '{table_name}' 
                AND column_name = '{column_name}'
            """))
            return result.scalar() > 0
    except Exception as e:
        logger.error(f"检查列 {table_name}.{column_name} 是否存在时出错: {e}")
        return False


def create_users_table(engine):
    """创建用户表"""
    try:
        with engine.connect() as conn:
            conn.execute(text("""
                CREATE TABLE users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(100) UNIQUE NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    hashed_password VARCHAR(255) NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
            logger.info("用户表创建成功")
            return True
    except Exception as e:
        logger.error(f"创建用户表失败: {e}")
        return False


def create_default_admin_user(session_local):
    """创建默认管理员用户"""
    try:
        session = session_local()
        
        # 检查是否已有用户
        result = session.execute(text("SELECT COUNT(*) FROM users"))
        user_count = result.scalar()
        
        if user_count == 0:
            # 创建默认管理员用户
            hashed_password = get_password_hash("admin123")
            session.execute(text("""
                INSERT INTO users (username, email, hashed_password, is_active, created_at, updated_at)
                VALUES (:username, :email, :hashed_password, :is_active, :created_at, :updated_at)
            """), {
                'username': 'admin',
                'email': 'admin@example.com',
                'hashed_password': hashed_password,
                'is_active': True,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            })
            session.commit()
            logger.info("创建默认管理员用户成功 (用户名: admin, 密码: admin123)")
            
            # 获取用户ID
            result = session.execute(text("SELECT id FROM users WHERE username = 'admin'"))
            admin_user_id = result.scalar()
            session.close()
            return admin_user_id
        else:
            # 获取第一个用户的ID
            result = session.execute(text("SELECT id FROM users LIMIT 1"))
            user_id = result.scalar()
            session.close()
            logger.info(f"使用现有用户 ID: {user_id}")
            return user_id
            
    except Exception as e:
        logger.error(f"创建默认管理员用户失败: {e}")
        return None


def add_user_id_to_table(engine, table_name, default_user_id):
    """为表添加用户ID列"""
    try:
        with engine.connect() as conn:
            # 检查列是否已存在
            if check_column_exists(engine, table_name, 'user_id'):
                logger.info(f"表 {table_name} 已有 user_id 列")
                return True
            
            # 添加user_id列
            conn.execute(text(f"""
                ALTER TABLE {table_name} 
                ADD COLUMN user_id INT
            """))
            
            # 更新现有数据，设置默认用户ID
            conn.execute(text(f"""
                UPDATE {table_name} 
                SET user_id = :user_id 
                WHERE user_id IS NULL
            """), {'user_id': default_user_id})
            
            # 设置列为NOT NULL
            conn.execute(text(f"""
                ALTER TABLE {table_name} 
                MODIFY COLUMN user_id INT NOT NULL
            """))
            
            # 添加外键约束
            conn.execute(text(f"""
                ALTER TABLE {table_name} 
                ADD CONSTRAINT fk_{table_name}_user_id 
                FOREIGN KEY (user_id) REFERENCES users(id) 
                ON DELETE CASCADE
            """))
            
            conn.commit()
            logger.info(f"为表 {table_name} 添加 user_id 列成功")
            return True
            
    except Exception as e:
        logger.error(f"为表 {table_name} 添加 user_id 列失败: {e}")
        return False


def remove_unique_constraint(engine, table_name, column_name):
    """移除唯一约束（如果存在）"""
    try:
        with engine.connect() as conn:
            # 查找约束名称
            result = conn.execute(text(f"""
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE table_schema = DATABASE() 
                AND table_name = '{table_name}' 
                AND column_name = '{column_name}'
                AND CONSTRAINT_NAME != 'PRIMARY'
            """))
            
            constraints = result.fetchall()
            for constraint in constraints:
                constraint_name = constraint[0]
                try:
                    conn.execute(text(f"ALTER TABLE {table_name} DROP INDEX {constraint_name}"))
                    logger.info(f"移除表 {table_name} 列 {column_name} 的唯一约束: {constraint_name}")
                except Exception as e:
                    logger.warning(f"移除约束 {constraint_name} 失败: {e}")
            
            conn.commit()
            
    except Exception as e:
        logger.warning(f"移除唯一约束时出错: {e}")


def main():
    """主迁移函数"""
    logger.info("开始数据库迁移...")
    
    # 创建数据库连接
    engine, session_local = create_connection()
    if not engine:
        logger.error("无法连接到数据库，迁移终止")
        return False
    
    try:
        # 1. 检查并创建用户表
        if not check_table_exists(engine, 'users'):
            logger.info("创建用户表...")
            if not create_users_table(engine):
                return False
        else:
            logger.info("用户表已存在")
        
        # 2. 创建默认管理员用户
        logger.info("创建默认管理员用户...")
        admin_user_id = create_default_admin_user(session_local)
        if not admin_user_id:
            return False
        
        # 3. 为现有表添加用户ID字段
        tables_to_migrate = ['quick_links', 'search_engines', 'search_history']
        
        for table_name in tables_to_migrate:
            if check_table_exists(engine, table_name):
                logger.info(f"迁移表: {table_name}")
                
                # 对于search_engines表，需要移除name字段的唯一约束
                if table_name == 'search_engines':
                    remove_unique_constraint(engine, table_name, 'name')
                
                if not add_user_id_to_table(engine, table_name, admin_user_id):
                    logger.error(f"表 {table_name} 迁移失败")
                    return False
            else:
                logger.info(f"表 {table_name} 不存在，跳过")
        
        logger.info("数据库迁移完成!")
        logger.info("注意: 如果创建了默认管理员用户，请记住以下信息:")
        logger.info("  用户名: admin")
        logger.info("  密码: admin123")
        logger.info("  邮箱: admin@example.com")
        logger.info("请在生产环境中及时更改默认密码!")
        
        return True
        
    except Exception as e:
        logger.error(f"迁移过程中发生错误: {e}")
        return False
    
    finally:
        engine.dispose()


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 