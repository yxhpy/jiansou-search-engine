#!/usr/bin/env python3
"""
用户信息字段迁移脚本
为用户表添加 display_name 和 bio 字段
"""

import os
import sys
from pathlib import Path

# 添加项目根目录到路径，以便导入应用模块
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app.config import Config
from sqlalchemy import create_engine, text
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def migrate_add_profile_fields():
    """为用户表添加个人信息字段"""
    
    try:
        # 获取数据库连接
        database_url = Config.get_database_url()
        logger.info(f"连接数据库: {Config.MYSQL_HOST}:{Config.MYSQL_PORT}/{Config.MYSQL_DATABASE}")
        
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            # 检查表是否存在
            result = conn.execute(text("""
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_schema = :schema AND table_name = 'users'
            """), {"schema": Config.MYSQL_DATABASE})
            
            if result.fetchone().count == 0:
                logger.error("错误: users 表不存在")
                return False
            
            # 检查字段是否已存在
            result = conn.execute(text("""
                SELECT COLUMN_NAME 
                FROM information_schema.columns 
                WHERE table_schema = :schema AND table_name = 'users'
            """), {"schema": Config.MYSQL_DATABASE})
            
            existing_columns = [row.COLUMN_NAME for row in result]
            logger.info(f"现有字段: {existing_columns}")
            
            migrations_needed = []
            
            if 'display_name' not in existing_columns:
                migrations_needed.append('display_name')
            
            if 'bio' not in existing_columns:
                migrations_needed.append('bio')
            
            if not migrations_needed:
                logger.info("所有字段已存在，无需迁移")
                return True
            
            logger.info(f"需要添加字段: {', '.join(migrations_needed)}")
            
            # 开始迁移
            logger.info("开始数据库迁移...")
            
            try:
                # 添加 display_name 字段
                if 'display_name' in migrations_needed:
                    logger.info("添加 display_name 字段...")
                    conn.execute(text("""
                        ALTER TABLE users 
                        ADD COLUMN display_name VARCHAR(255) NULL
                    """))
                    conn.commit()
                    logger.info("✓ display_name 字段添加成功")
                
                # 添加 bio 字段
                if 'bio' in migrations_needed:
                    logger.info("添加 bio 字段...")
                    conn.execute(text("""
                        ALTER TABLE users 
                        ADD COLUMN bio VARCHAR(500) NULL
                    """))
                    conn.commit()
                    logger.info("✓ bio 字段添加成功")
                
                logger.info("迁移执行成功")
                
            except Exception as e:
                logger.error(f"迁移失败: {e}")
                return False
            
            # 验证迁移结果
            result = conn.execute(text("""
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
                FROM information_schema.columns 
                WHERE table_schema = :schema AND table_name = 'users'
                ORDER BY ORDINAL_POSITION
            """), {"schema": Config.MYSQL_DATABASE})
            
            logger.info("\n迁移后的用户表结构:")
            for row in result:
                nullable = "NULL" if row.IS_NULLABLE == "YES" else "NOT NULL"
                logger.info(f"  {row.COLUMN_NAME}: {row.DATA_TYPE} {nullable}")
            
            # 检查迁移是否成功
            result = conn.execute(text("""
                SELECT COLUMN_NAME 
                FROM information_schema.columns 
                WHERE table_schema = :schema AND table_name = 'users'
            """), {"schema": Config.MYSQL_DATABASE})
            
            new_columns = [row.COLUMN_NAME for row in result]
            success = 'display_name' in new_columns and 'bio' in new_columns
            
            if success:
                logger.info("\n✅ 数据库迁移成功完成!")
            else:
                logger.error("\n❌ 数据库迁移可能未完全成功")
            
            return success
        
    except Exception as e:
        logger.error(f"迁移过程中发生错误: {e}")
        return False


def show_current_schema():
    """显示当前数据库架构"""
    try:
        # 获取数据库连接
        database_url = Config.get_database_url()
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            # 显示用户表结构
            logger.info("当前用户表结构:")
            result = conn.execute(text("""
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY
                FROM information_schema.columns 
                WHERE table_schema = :schema AND table_name = 'users'
                ORDER BY ORDINAL_POSITION
            """), {"schema": Config.MYSQL_DATABASE})
            
            columns = list(result)
            if not columns:
                logger.info("用户表不存在")
                return
            
            for row in columns:
                nullable = "NULL" if row.IS_NULLABLE == "YES" else "NOT NULL"
                key_info = f" ({row.COLUMN_KEY})" if row.COLUMN_KEY else ""
                logger.info(f"  {row.COLUMN_NAME}: {row.DATA_TYPE} {nullable}{key_info}")
            
            # 显示用户数量
            result = conn.execute(text("SELECT COUNT(*) as count FROM users"))
            user_count = result.fetchone().count
            logger.info(f"\n当前用户数量: {user_count}")
        
    except Exception as e:
        logger.error(f"查询数据库时发生错误: {e}")


if __name__ == "__main__":
    print("用户信息字段迁移工具")
    print("=" * 50)
    
    if len(sys.argv) > 1 and sys.argv[1] == "--show":
        show_current_schema()
    else:
        print("开始迁移...")
        success = migrate_add_profile_fields()
        
        if success:
            print("\n迁移完成! 你现在可以:")
            print("1. 重启应用服务器")
            print("2. 使用新的个人信息编辑功能")
        else:
            print("\n迁移失败，请检查错误信息并重试")
            sys.exit(1) 