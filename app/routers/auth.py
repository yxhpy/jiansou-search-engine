"""
认证路由
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import UserCreate, UserLogin, Token, UserResponse, UserProfileUpdate
from ..services.user_service import UserService
from ..auth import get_current_active_user
from ..models import User

router = APIRouter(prefix="/api/auth", tags=["用户认证"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """用户注册"""
    db_user = UserService.create_user(db, user)
    if not db_user:
        # 检查具体失败原因
        if UserService.get_user_by_username(db, user.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名已存在"
            )
        # 检查邮箱
        if db.query(User).filter(User.email == user.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已被使用"
            )
        # 密码长度检查
        from ..config import AuthConfig
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"密码长度至少{AuthConfig.MIN_PASSWORD_LENGTH}位"
        )
    
    return UserResponse(
        id=db_user.id,
        username=db_user.username,
        email=db_user.email,
        display_name=db_user.display_name,
        bio=db_user.bio,
        avatar_url=db_user.avatar_url,
        is_active=db_user.is_active,
        created_at=db_user.created_at
    )


@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    """用户登录"""
    token = UserService.login_user(db, user)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """获取当前用户信息"""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        display_name=current_user.display_name,
        bio=current_user.bio,
        avatar_url=current_user.avatar_url,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )


@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    update_data: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新用户信息"""
    try:
        updated_user = UserService.update_user_profile(db, current_user.id, update_data)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )
        
        return UserResponse(
            id=updated_user.id,
            username=updated_user.username,
            email=updated_user.email,
            display_name=updated_user.display_name,
            bio=updated_user.bio,
            avatar_url=updated_user.avatar_url,
            is_active=updated_user.is_active,
            created_at=updated_user.created_at
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        ) 