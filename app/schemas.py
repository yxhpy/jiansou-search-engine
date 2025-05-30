"""
Pydantic数据模式定义
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# 快速链接相关模式
class QuickLinkCreate(BaseModel):
    """创建快速链接的请求模式"""
    name: str
    url: str
    icon: str = "fas fa-link"
    color: str = "#007DFF"
    category: str = "其他"


class QuickLinkUpdate(BaseModel):
    """更新快速链接的请求模式"""
    name: Optional[str] = None
    url: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    category: Optional[str] = None


class QuickLinkResponse(BaseModel):
    """快速链接的响应模式"""
    id: int
    name: str
    url: str
    icon: str
    color: str
    category: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# 搜索引擎相关模式
class SearchEngineCreate(BaseModel):
    """创建搜索引擎的请求模式"""
    name: str
    display_name: str
    url_template: str
    icon: str = "fas fa-search"
    color: str = "#007DFF"
    is_active: bool = True
    is_default: bool = False


class SearchEngineUpdate(BaseModel):
    """更新搜索引擎的请求模式"""
    display_name: Optional[str] = None
    url_template: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None
    sort_order: Optional[int] = None


class SearchEngineResponse(BaseModel):
    """搜索引擎的响应模式"""
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


# 搜索相关模式
class SearchRequest(BaseModel):
    """搜索请求模式"""
    query: str
    search_engine: str = "baidu"


class SearchResponse(BaseModel):
    """搜索响应模式"""
    search_url: str
    search_engine: str
    query: str


class SearchHistoryResponse(BaseModel):
    """搜索历史响应模式"""
    id: int
    query: str
    search_engine: str
    created_at: datetime
    
    class Config:
        from_attributes = True 