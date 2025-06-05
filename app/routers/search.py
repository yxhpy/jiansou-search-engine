"""
搜索路由
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas import SearchRequest, SearchResponse, SearchHistoryResponse
from ..services.search_service import SearchService
from ..auth import get_current_active_user
from ..models import User

router = APIRouter(prefix="/api", tags=["搜索"])


@router.post("/search", response_model=SearchResponse)
def search(
    search_request: SearchRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """执行搜索"""
    result = SearchService.perform_search(db, search_request, current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="搜索引擎未找到")
    return result


@router.get("/search-history", response_model=List[SearchHistoryResponse])
def get_search_history(
    limit: int = 10, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取用户的搜索历史"""
    return SearchService.get_search_history(db, current_user.id, limit) 