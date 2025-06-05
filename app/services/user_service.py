"""
用户服务
"""
from sqlalchemy.orm import Session
from typing import Optional
from datetime import timedelta

from ..models import User
from ..schemas import UserCreate, UserLogin, Token, UserResponse
from ..auth import get_password_hash, authenticate_user, create_access_token
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