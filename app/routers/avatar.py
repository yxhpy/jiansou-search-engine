"""
头像管理路由
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..auth import get_current_active_user
from ..services.webdav_service import webdav_service
from ..config import WebDAVConfig

router = APIRouter(prefix="/api/avatar", tags=["头像管理"])


@router.post("/upload")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """上传用户头像"""
    
    # 检查WebDAV是否配置
    if not WebDAVConfig.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="文件存储服务未配置"
        )
    
    try:
        # 读取文件内容
        file_content = await file.read()
        
        # 上传到WebDAV
        success, message, avatar_url = webdav_service.upload_avatar(
            file_content, file.filename, current_user.id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        # 删除用户的旧头像
        if current_user.avatar_url:
            webdav_service.delete_avatar(current_user.avatar_url)
        
        # 更新用户头像URL
        current_user.avatar_url = avatar_url
        db.commit()
        db.refresh(current_user)
        
        return {
            "success": True,
            "message": message,
            "avatar_url": avatar_url
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"上传失败: {str(e)}"
        )


@router.delete("/")
async def delete_avatar(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除用户头像"""
    
    if not current_user.avatar_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户没有设置头像"
        )
    
    try:
        # 删除WebDAV上的文件
        success = webdav_service.delete_avatar(current_user.avatar_url)
        
        # 清除数据库中的头像URL
        current_user.avatar_url = None
        db.commit()
        
        return {
            "success": True,
            "message": "头像删除成功" if success else "头像删除成功（文件可能已不存在）"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除失败: {str(e)}"
        )


@router.get("/download/{filename}")
async def download_avatar(filename: str):
    """代理下载头像文件"""
    
    if not WebDAVConfig.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="文件存储服务未配置"
        )
    
    try:
        # 构造完整的头像URL
        avatar_url = WebDAVConfig.get_avatar_url(filename)
        
        # 获取文件内容
        file_content = webdav_service.get_avatar_content(avatar_url)
        
        if file_content is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="头像文件不存在"
            )
        
        # 根据文件扩展名确定MIME类型
        if filename.lower().endswith(('.jpg', '.jpeg')):
            media_type = "image/jpeg"
        elif filename.lower().endswith('.png'):
            media_type = "image/png"
        elif filename.lower().endswith('.gif'):
            media_type = "image/gif"
        elif filename.lower().endswith('.webp'):
            media_type = "image/webp"
        else:
            media_type = "image/jpeg"  # 默认
        
        return Response(
            content=file_content,
            media_type=media_type,
            headers={
                "Cache-Control": "public, max-age=3600",  # 缓存1小时
                "Content-Disposition": f"inline; filename={filename}"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"下载失败: {str(e)}"
        )


@router.get("/list")
async def list_user_avatars(
    current_user: User = Depends(get_current_active_user)
):
    """列出用户的所有头像（用于管理）"""
    
    if not WebDAVConfig.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="文件存储服务未配置"
        )
    
    try:
        avatars = webdav_service.list_user_avatars(current_user.id)
        return {
            "avatars": avatars,
            "current_avatar": current_user.avatar_url
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取头像列表失败: {str(e)}"
        ) 