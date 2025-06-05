"""
快速链接路由
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..schemas import QuickLinkCreate, QuickLinkUpdate, QuickLinkResponse
from ..services.quick_link_service import QuickLinkService
from ..auth import get_current_active_user, get_current_user_optional
from ..models import User

router = APIRouter(prefix="/api/quick-links", tags=["快速链接"])


@router.get("", response_model=List[QuickLinkResponse])
def get_quick_links(
    category: Optional[str] = None, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """获取用户的快速链接列表，如果未登录则返回默认数据"""
    user_id = current_user.id if current_user else None
    return QuickLinkService.get_quick_links(db, user_id, category)


@router.post("", response_model=QuickLinkResponse)
def create_quick_link(
    link: QuickLinkCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """创建快速链接"""
    return QuickLinkService.create_quick_link(db, link, current_user.id)


@router.put("/{link_id}", response_model=QuickLinkResponse)
def update_quick_link(
    link_id: int, 
    link: QuickLinkUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """更新快速链接"""
    db_link = QuickLinkService.update_quick_link(db, link_id, link, current_user.id)
    if not db_link:
        raise HTTPException(status_code=404, detail="快速链接未找到")
    return db_link


@router.delete("/{link_id}")
def delete_quick_link(
    link_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """删除快速链接"""
    success = QuickLinkService.delete_quick_link(db, link_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="快速链接未找到")
    return {"message": "删除成功"}


@router.get("/categories")
def get_categories():
    """获取预定义的分类列表"""
    return QuickLinkService.get_categories() 