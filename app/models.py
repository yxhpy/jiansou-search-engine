"""
数据库模型定义
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


class User(Base):
    """用户模型"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    display_name = Column(String(255), nullable=True)  # 显示名称
    bio = Column(String(500), nullable=True)  # 个人简介
    avatar_url = Column(String(512), nullable=True)  # 头像URL
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    quick_links = relationship("QuickLink", back_populates="user", cascade="all, delete-orphan")
    search_engines = relationship("SearchEngine", back_populates="user", cascade="all, delete-orphan")
    search_history = relationship("SearchHistory", back_populates="user", cascade="all, delete-orphan")


class QuickLink(Base):
    """快速链接模型"""
    __tablename__ = "quick_links"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    url = Column(String(512))
    icon = Column(String(100))
    color = Column(String(20))
    category = Column(String(100), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关联关系
    user = relationship("User", back_populates="quick_links")


class SearchEngine(Base):
    """搜索引擎模型"""
    __tablename__ = "search_engines"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)  # 移除unique约束，因为不同用户可以有相同名称的搜索引擎
    display_name = Column(String(255))
    url_template = Column(String(512))  # 使用 {query} 作为占位符
    icon = Column(String(100))
    color = Column(String(20))
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关联关系
    user = relationship("User", back_populates="search_engines")


class SearchHistory(Base):
    """搜索历史模型"""
    __tablename__ = "search_history"
    
    id = Column(Integer, primary_key=True, index=True)
    query = Column(String(255), index=True)
    search_engine = Column(String(100))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关联关系
    user = relationship("User", back_populates="search_history") 