"""
搜索引擎服务
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..models import SearchEngine
from ..schemas import SearchEngineCreate, SearchEngineUpdate
from ..config import DefaultData


class SearchEngineService:
    """搜索引擎服务类"""
    
    @staticmethod
    def get_search_engines(db: Session, user_id: Optional[int] = None, active_only: bool = True) -> List[SearchEngine]:
        """获取用户的搜索引擎列表，如果没有用户ID则返回默认数据"""
        if user_id is None:
            # 返回默认搜索引擎数据（用于未登录用户）
            return SearchEngineService._get_default_search_engines(active_only)
        
        query = db.query(SearchEngine).filter(SearchEngine.user_id == user_id)
        if active_only:
            query = query.filter(SearchEngine.is_active == True)
        return query.order_by(SearchEngine.sort_order).all()
    
    @staticmethod
    def _get_default_search_engines(active_only: bool = True) -> List[SearchEngine]:
        """获取默认搜索引擎（不从数据库，直接从配置）"""
        default_engines = []
        current_time = datetime.utcnow()
        for i, engine_data in enumerate(DefaultData.DEFAULT_SEARCH_ENGINES):
            if active_only and not engine_data.get("is_active", True):
                continue
            
            # 创建临时的SearchEngine对象，不保存到数据库
            engine = SearchEngine(
                id=i + 1,  # 临时ID
                name=engine_data["name"],
                display_name=engine_data["display_name"],
                url_template=engine_data["url_template"],
                icon=engine_data["icon"],
                color=engine_data["color"],
                is_active=engine_data.get("is_active", True),
                is_default=engine_data.get("is_default", False),
                sort_order=engine_data.get("sort_order", i),
                user_id=0,  # 表示是默认数据
                created_at=current_time  # 添加创建时间
            )
            default_engines.append(engine)
        return default_engines
    
    @staticmethod
    def get_search_engine_by_id(db: Session, engine_id: int, user_id: int) -> Optional[SearchEngine]:
        """根据ID获取用户的搜索引擎"""
        return db.query(SearchEngine).filter(
            SearchEngine.id == engine_id,
            SearchEngine.user_id == user_id
        ).first()
    
    @staticmethod
    def get_search_engine_by_name(db: Session, name: str, user_id: int) -> Optional[SearchEngine]:
        """根据名称获取用户的搜索引擎"""
        return db.query(SearchEngine).filter(
            SearchEngine.name == name,
            SearchEngine.user_id == user_id
        ).first()
    
    @staticmethod
    def create_search_engine(db: Session, engine_data: SearchEngineCreate, user_id: int) -> Optional[SearchEngine]:
        """创建搜索引擎"""
        # 检查名称是否已存在（仅限当前用户）
        existing = SearchEngineService.get_search_engine_by_name(db, engine_data.name, user_id)
        if existing:
            return None
        
        # 如果设置为默认搜索引擎，取消其他的默认设置
        if engine_data.is_default:
            SearchEngineService._clear_default_engines(db, user_id)
        
        db_engine = SearchEngine(
            name=engine_data.name,
            display_name=engine_data.display_name,
            url_template=engine_data.url_template,
            icon=engine_data.icon,
            color=engine_data.color,
            is_active=engine_data.is_active,
            is_default=engine_data.is_default,
            user_id=user_id
        )
        db.add(db_engine)
        db.commit()
        db.refresh(db_engine)
        return db_engine
    
    @staticmethod
    def update_search_engine(db: Session, engine_id: int, engine_data: SearchEngineUpdate, user_id: int) -> Optional[SearchEngine]:
        """更新搜索引擎"""
        db_engine = SearchEngineService.get_search_engine_by_id(db, engine_id, user_id)
        if not db_engine:
            return None
        
        # 如果设置为默认搜索引擎，取消其他的默认设置
        if engine_data.is_default:
            SearchEngineService._clear_default_engines(db, user_id)
        
        if engine_data.display_name is not None:
            db_engine.display_name = engine_data.display_name
        if engine_data.url_template is not None:
            db_engine.url_template = engine_data.url_template
        if engine_data.icon is not None:
            db_engine.icon = engine_data.icon
        if engine_data.color is not None:
            db_engine.color = engine_data.color
        if engine_data.is_active is not None:
            db_engine.is_active = engine_data.is_active
        if engine_data.is_default is not None:
            db_engine.is_default = engine_data.is_default
        if engine_data.sort_order is not None:
            db_engine.sort_order = engine_data.sort_order
        
        db.commit()
        db.refresh(db_engine)
        return db_engine
    
    @staticmethod
    def delete_search_engine(db: Session, engine_id: int, user_id: int) -> bool:
        """删除搜索引擎"""
        db_engine = SearchEngineService.get_search_engine_by_id(db, engine_id, user_id)
        if not db_engine:
            return False
        
        db.delete(db_engine)
        db.commit()
        return True
    
    @staticmethod
    def get_default_search_engine(db: Session, user_id: Optional[int] = None) -> Optional[SearchEngine]:
        """获取用户的默认搜索引擎，如果没有用户ID则返回默认的搜索引擎"""
        if user_id is None:
            # 返回默认的搜索引擎（用于未登录用户）
            default_engines = SearchEngineService._get_default_search_engines(active_only=True)
            for engine in default_engines:
                if engine.is_default:
                    return engine
            # 如果没有明确的默认引擎，返回第一个
            return default_engines[0] if default_engines else None
        
        default_engine = db.query(SearchEngine).filter(
            SearchEngine.user_id == user_id,
            SearchEngine.is_default == True
        ).first()
        if not default_engine:
            # 如果没有默认搜索引擎，返回第一个活跃的搜索引擎
            default_engine = db.query(SearchEngine).filter(
                SearchEngine.user_id == user_id,
                SearchEngine.is_active == True
            ).first()
        return default_engine
    
    @staticmethod
    def _clear_default_engines(db: Session, user_id: int):
        """清除用户的所有默认搜索引擎设置"""
        db.query(SearchEngine).filter(SearchEngine.user_id == user_id).update({"is_default": False})
    
    @staticmethod
    def init_default_search_engines(db: Session) -> bool:
        """初始化默认搜索引擎"""
        try:
            # 检查是否已有数据
            if db.query(SearchEngine).count() > 0:
                return True
            
            # 创建默认搜索引擎
            for engine_data in DefaultData.DEFAULT_SEARCH_ENGINES:
                db_engine = SearchEngine(**engine_data)
                db.add(db_engine)
            
            db.commit()
            return True
        except Exception:
            db.rollback()
            return False 