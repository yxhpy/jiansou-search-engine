"""
快速链接服务
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..models import QuickLink
from ..schemas import QuickLinkCreate, QuickLinkUpdate
from ..config import DefaultData


class QuickLinkService:
    """快速链接服务类"""
    
    @staticmethod
    def get_quick_links(db: Session, user_id: Optional[int] = None, category: Optional[str] = None) -> List[QuickLink]:
        """获取用户的快速链接列表，如果没有用户ID则返回默认数据"""
        if user_id is None:
            # 返回默认快速链接数据（用于未登录用户）
            return QuickLinkService._get_default_quick_links()
        
        query = db.query(QuickLink).filter(QuickLink.user_id == user_id)
        if category and category != "all":
            query = query.filter(QuickLink.category == category)
        return query.all()
    
    @staticmethod
    def _get_default_quick_links() -> List[QuickLink]:
        """获取默认快速链接（不从数据库，直接从配置）"""
        default_links = []
        current_time = datetime.utcnow()
        for i, link_data in enumerate(DefaultData.DEFAULT_QUICK_LINKS):
            # 创建临时的QuickLink对象，不保存到数据库
            link = QuickLink(
                id=i + 1,  # 临时ID
                name=link_data["name"],
                url=link_data["url"],
                icon=link_data["icon"],
                color=link_data["color"],
                category=link_data["category"],
                user_id=0,  # 表示是默认数据
                created_at=current_time  # 添加创建时间
            )
            default_links.append(link)
        return default_links
    
    @staticmethod
    def create_quick_link(db: Session, link_data: QuickLinkCreate, user_id: int) -> QuickLink:
        """创建快速链接"""
        db_link = QuickLink(
            name=link_data.name,
            url=link_data.url,
            icon=link_data.icon,
            color=link_data.color,
            category=link_data.category,
            user_id=user_id
        )
        db.add(db_link)
        db.commit()
        db.refresh(db_link)
        return db_link
    
    @staticmethod
    def get_quick_link_by_id(db: Session, link_id: int, user_id: int) -> Optional[QuickLink]:
        """根据ID获取用户的快速链接"""
        return db.query(QuickLink).filter(
            QuickLink.id == link_id,
            QuickLink.user_id == user_id
        ).first()
    
    @staticmethod
    def update_quick_link(db: Session, link_id: int, link_data: QuickLinkUpdate, user_id: int) -> Optional[QuickLink]:
        """更新快速链接"""
        db_link = QuickLinkService.get_quick_link_by_id(db, link_id, user_id)
        if not db_link:
            return None
        
        if link_data.name is not None:
            db_link.name = link_data.name
        if link_data.url is not None:
            db_link.url = link_data.url
        if link_data.icon is not None:
            db_link.icon = link_data.icon
        if link_data.color is not None:
            db_link.color = link_data.color
        if link_data.category is not None:
            db_link.category = link_data.category
        
        db.commit()
        db.refresh(db_link)
        return db_link
    
    @staticmethod
    def delete_quick_link(db: Session, link_id: int, user_id: int) -> bool:
        """删除快速链接"""
        db_link = QuickLinkService.get_quick_link_by_id(db, link_id, user_id)
        if not db_link:
            return False
        
        db.delete(db_link)
        db.commit()
        return True
    
    @staticmethod
    def get_categories() -> List[str]:
        """获取预定义的分类列表"""
        return DefaultData.CATEGORIES
    
    @staticmethod
    def init_default_quick_links(db: Session) -> bool:
        """初始化默认快速链接"""
        try:
            # 检查是否已有数据
            if db.query(QuickLink).count() > 0:
                return True
            
            # 创建默认快速链接
            for link_data in DefaultData.DEFAULT_QUICK_LINKS:
                db_link = QuickLink(**link_data)
                db.add(db_link)
            
            db.commit()
            return True
        except Exception:
            db.rollback()
            return False 