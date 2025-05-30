"""
数据库模型定义
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime

from .database import Base


class QuickLink(Base):
    """快速链接模型"""
    __tablename__ = "quick_links"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    url = Column(String(512))
    icon = Column(String(100))
    color = Column(String(20))
    category = Column(String(100), index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SearchEngine(Base):
    """搜索引擎模型"""
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
    """搜索历史模型"""
    __tablename__ = "search_history"
    
    id = Column(Integer, primary_key=True, index=True)
    query = Column(String(255), index=True)
    search_engine = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow) 