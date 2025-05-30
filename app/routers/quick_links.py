"""
快速链接路由
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..schemas import QuickLinkCreate, QuickLinkUpdate, QuickLinkResponse
from ..services.quick_link_service import QuickLinkService

router = APIRouter(prefix="/api/quick-links", tags=["快速链接"])


@router.get("", response_model=List[QuickLinkResponse])
def get_quick_links(category: Optional[str] = None, db: Session = Depends(get_db)):
    """获取快速链接列表"""
    return QuickLinkService.get_quick_links(db, category)


@router.post("", response_model=QuickLinkResponse)
def create_quick_link(link: QuickLinkCreate, db: Session = Depends(get_db)):
    """创建快速链接"""
    return QuickLinkService.create_quick_link(db, link)


@router.put("/{link_id}", response_model=QuickLinkResponse)
def update_quick_link(link_id: int, link: QuickLinkUpdate, db: Session = Depends(get_db)):
    """更新快速链接"""
    db_link = QuickLinkService.update_quick_link(db, link_id, link)
    if not db_link:
        raise HTTPException(status_code=404, detail="快速链接未找到")
    return db_link


@router.delete("/{link_id}")
def delete_quick_link(link_id: int, db: Session = Depends(get_db)):
    """删除快速链接"""
    success = QuickLinkService.delete_quick_link(db, link_id)
    if not success:
        raise HTTPException(status_code=404, detail="快速链接未找到")
    return {"message": "删除成功"}


@router.get("/categories")
def get_categories():
    """获取预定义的分类列表"""
    return QuickLinkService.get_categories() 