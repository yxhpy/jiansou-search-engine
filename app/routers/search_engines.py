"""
搜索引擎路由
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import SearchEngineCreate, SearchEngineUpdate, SearchEngineResponse
from ..services.search_engine_service import SearchEngineService

router = APIRouter(prefix="/api/search-engines", tags=["搜索引擎"])


@router.get("", response_model=List[SearchEngineResponse])
def get_search_engines(active_only: bool = True, db: Session = Depends(get_db)):
    """获取搜索引擎列表"""
    return SearchEngineService.get_search_engines(db, active_only)


@router.post("", response_model=SearchEngineResponse)
def create_search_engine(engine: SearchEngineCreate, db: Session = Depends(get_db)):
    """创建搜索引擎"""
    db_engine = SearchEngineService.create_search_engine(db, engine)
    if not db_engine:
        raise HTTPException(status_code=400, detail="搜索引擎名称已存在")
    return db_engine


@router.put("/{engine_id}", response_model=SearchEngineResponse)
def update_search_engine(engine_id: int, engine: SearchEngineUpdate, db: Session = Depends(get_db)):
    """更新搜索引擎"""
    db_engine = SearchEngineService.update_search_engine(db, engine_id, engine)
    if not db_engine:
        raise HTTPException(status_code=404, detail="搜索引擎未找到")
    return db_engine


@router.delete("/{engine_id}")
def delete_search_engine(engine_id: int, db: Session = Depends(get_db)):
    """删除搜索引擎"""
    success = SearchEngineService.delete_search_engine(db, engine_id)
    if not success:
        raise HTTPException(status_code=404, detail="搜索引擎未找到")
    return {"message": "删除成功"}


@router.get("/default", response_model=SearchEngineResponse)
def get_default_search_engine(db: Session = Depends(get_db)):
    """获取默认搜索引擎"""
    default_engine = SearchEngineService.get_default_search_engine(db)
    if not default_engine:
        raise HTTPException(status_code=404, detail="未找到可用的搜索引擎")
    return default_engine 