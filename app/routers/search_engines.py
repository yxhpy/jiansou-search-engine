"""
搜索引擎路由
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..schemas import SearchEngineCreate, SearchEngineUpdate, SearchEngineResponse
from ..services.search_engine_service import SearchEngineService
from ..auth import get_current_active_user, get_current_user_optional
from ..models import User

router = APIRouter(prefix="/api/search-engines", tags=["搜索引擎"])


@router.get("", response_model=List[SearchEngineResponse])
def get_search_engines(
    active_only: bool = True, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """获取用户的搜索引擎列表，如果未登录则返回默认数据"""
    user_id = current_user.id if current_user else None
    return SearchEngineService.get_search_engines(db, user_id, active_only)


@router.post("", response_model=SearchEngineResponse)
def create_search_engine(
    engine: SearchEngineCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """创建搜索引擎"""
    db_engine = SearchEngineService.create_search_engine(db, engine, current_user.id)
    if not db_engine:
        raise HTTPException(status_code=400, detail="搜索引擎名称已存在")
    return db_engine


@router.put("/{engine_id}", response_model=SearchEngineResponse)
def update_search_engine(
    engine_id: int, 
    engine: SearchEngineUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """更新搜索引擎"""
    db_engine = SearchEngineService.update_search_engine(db, engine_id, engine, current_user.id)
    if not db_engine:
        raise HTTPException(status_code=404, detail="搜索引擎未找到")
    return db_engine


@router.delete("/{engine_id}")
def delete_search_engine(
    engine_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """删除搜索引擎"""
    success = SearchEngineService.delete_search_engine(db, engine_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="搜索引擎未找到")
    return {"message": "删除成功"}


@router.get("/default", response_model=SearchEngineResponse)
def get_default_search_engine(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """获取用户的默认搜索引擎，如果未登录则返回默认搜索引擎"""
    user_id = current_user.id if current_user else None
    default_engine = SearchEngineService.get_default_search_engine(db, user_id)
    if not default_engine:
        raise HTTPException(status_code=404, detail="未找到可用的搜索引擎")
    return default_engine 