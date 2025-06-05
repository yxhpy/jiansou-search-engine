"""
搜索服务
"""
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from ..models import SearchHistory
from ..schemas import SearchRequest, SearchResponse
from ..config import AppConfig
from .search_engine_service import SearchEngineService

logger = logging.getLogger(__name__)


class SearchService:
    """搜索服务类"""
    
    @staticmethod
    def perform_search(db: Session, search_request: SearchRequest, user_id: int) -> Optional[SearchResponse]:
        """执行搜索"""
        # 获取用户的搜索引擎
        engine = SearchEngineService.get_search_engine_by_name(db, search_request.search_engine, user_id)
        if not engine:
            return None
        
        # 记录搜索历史
        SearchService._record_search_history(db, search_request, user_id)
        
        # 构建搜索URL
        search_url = engine.url_template.format(query=search_request.query)
        
        return SearchResponse(
            search_url=search_url,
            search_engine=engine.display_name,
            query=search_request.query
        )
    
    @staticmethod
    def get_search_history(db: Session, user_id: int, limit: int = None) -> List[SearchHistory]:
        """获取用户的搜索历史"""
        if limit is None:
            limit = AppConfig.DEFAULT_SEARCH_HISTORY_LIMIT
        
        return db.query(SearchHistory).filter(
            SearchHistory.user_id == user_id
        ).order_by(SearchHistory.created_at.desc()).limit(limit).all()
    
    @staticmethod
    def _record_search_history(db: Session, search_request: SearchRequest, user_id: int):
        """记录用户的搜索历史"""
        try:
            search_history = SearchHistory(
                query=search_request.query,
                search_engine=search_request.search_engine,
                user_id=user_id
            )
            db.add(search_history)
            db.commit()
        except Exception as e:
            logger.warning(f"搜索历史记录失败: {e}")
            db.rollback() 