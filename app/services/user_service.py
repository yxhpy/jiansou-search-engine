"""
用户服务
"""
from sqlalchemy.orm import Session
from typing import Optional
from datetime import timedelta

from ..models import User
from ..schemas import UserCreate, UserLogin, Token, UserResponse, UserProfileUpdate
from ..auth import get_password_hash, authenticate_user, create_access_token, verify_password
from ..config import AuthConfig
from .data_init_service import DataInitService


class UserService:
    """用户服务类"""
    
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> Optional[User]:
        """创建用户"""
        # 检查用户名是否已存在
        if db.query(User).filter(User.username == user_data.username).first():
            return None
        
        # 检查邮箱是否已存在
        if db.query(User).filter(User.email == user_data.email).first():
            return None
        
        # 验证密码长度
        if len(user_data.password) < AuthConfig.MIN_PASSWORD_LENGTH:
            return None
        
        # 创建用户
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # 为新用户初始化默认数据
        DataInitService.init_user_default_data(db, db_user.id)
        
        return db_user
    
    @staticmethod
    def login_user(db: Session, user_data: UserLogin) -> Optional[Token]:
        """用户登录"""
        user = authenticate_user(db, user_data.username, user_data.password)
        if not user:
            return None
        
        access_token_expires = timedelta(minutes=AuthConfig.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        
        user_response = UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            display_name=user.display_name,
            bio=user.bio,
            avatar_url=user.avatar_url,
            is_active=user.is_active,
            created_at=user.created_at
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """根据用户名获取用户"""
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """根据ID获取用户"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def update_user_profile(db: Session, user_id: int, update_data: UserProfileUpdate) -> Optional[User]:
        """更新用户信息"""
        # 获取用户
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        # 如果需要修改密码，验证当前密码
        if update_data.new_password:
            if not update_data.current_password:
                raise ValueError("修改密码时必须提供当前密码")
            
            if not verify_password(update_data.current_password, user.hashed_password):
                raise ValueError("当前密码不正确")
            
            # 验证新密码长度
            if len(update_data.new_password) < AuthConfig.MIN_PASSWORD_LENGTH:
                raise ValueError(f"新密码长度至少{AuthConfig.MIN_PASSWORD_LENGTH}位")
            
            # 更新密码
            user.hashed_password = get_password_hash(update_data.new_password)
        
        # 如果要更新邮箱，检查邮箱是否已被其他用户使用
        if update_data.email and update_data.email != user.email:
            existing_user = db.query(User).filter(
                User.email == update_data.email,
                User.id != user_id
            ).first()
            if existing_user:
                raise ValueError("邮箱已被其他用户使用")
            user.email = update_data.email
        
        # 更新其他字段
        if update_data.display_name is not None:
            user.display_name = update_data.display_name.strip() if update_data.display_name.strip() else None
        
        if update_data.bio is not None:
            user.bio = update_data.bio.strip() if update_data.bio.strip() else None
        
        # 保存更改
        db.commit()
        db.refresh(user)
        
        return user 