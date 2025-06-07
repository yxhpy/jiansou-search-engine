"""
WebDAV文件存储服务
"""
import os
import uuid
import logging
from typing import Optional, Tuple
from io import BytesIO
from pathlib import Path

import httpx
import requests
from requests.auth import HTTPBasicAuth
from PIL import Image
from webdav3.client import Client

from ..config import WebDAVConfig

logger = logging.getLogger(__name__)


class WebDAVService:
    """WebDAV文件存储服务"""
    
    def __init__(self):
        self.config = WebDAVConfig
        self._client = None
        
    @property
    def client(self):
        """获取WebDAV客户端"""
        if self._client is None:
            if not self.config.is_configured():
                raise ValueError("WebDAV未配置")
            
            options = {
                'webdav_hostname': self.config.URL,
                'webdav_login': self.config.USERNAME,
                'webdav_password': self.config.PASSWORD,
                'webdav_timeout': 30,
            }
            self._client = Client(options)
            
            # 确保头像目录存在
            self._ensure_avatar_directory()
            
        return self._client
    
    def _ensure_avatar_directory(self):
        """确保头像目录存在"""
        try:
            # 直接尝试创建目录，如果已存在会返回405状态码
            self._create_directory_with_http(self.config.AVATAR_PATH.rstrip('/'))
        except Exception as e:
            logger.warning(f"确保头像目录存在失败: {e}")
            # 不抛出异常，让上传时再处理
    
    def _create_directory_with_http(self, directory_path):
        """使用HTTP请求直接创建目录"""
        try:
            # 构造完整的URL
            url = f"{self.config.URL.rstrip('/')}/{directory_path}"
            
            # 发送MKCOL请求创建目录
            response = requests.request(
                'MKCOL',
                url,
                auth=HTTPBasicAuth(self.config.USERNAME, self.config.PASSWORD),
                timeout=30
            )
            
            if response.status_code in [201, 405]:  # 201=创建成功, 405=已存在
                logger.info(f"目录创建成功或已存在: {directory_path} (状态码: {response.status_code})")
            else:
                logger.warning(f"创建目录失败，状态码: {response.status_code}, 响应: {response.text}")
                
        except Exception as e:
            logger.error(f"使用HTTP创建目录失败: {e}")
    
    def _upload_file_with_http(self, file_content: bytes, remote_path: str) -> bool:
        """使用HTTP请求直接上传文件"""
        try:
            # 构造完整的URL
            url = f"{self.config.URL.rstrip('/')}/{remote_path}"
            
            # 发送PUT请求上传文件
            response = requests.put(
                url,
                data=file_content,
                auth=HTTPBasicAuth(self.config.USERNAME, self.config.PASSWORD),
                timeout=60,
                headers={'Content-Type': 'application/octet-stream'}
            )
            
            if response.status_code in [200, 201, 204]:  # 成功状态码
                logger.info(f"文件上传成功: {remote_path} (状态码: {response.status_code})")
                return True
            else:
                logger.error(f"文件上传失败，状态码: {response.status_code}, 响应: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"使用HTTP上传文件失败: {e}")
            return False
    
    def _delete_file_with_http(self, remote_path: str) -> bool:
        """使用HTTP请求删除文件"""
        try:
            # 构造完整的URL
            url = f"{self.config.URL.rstrip('/')}/{remote_path}"
            
            # 发送DELETE请求删除文件
            response = requests.delete(
                url,
                auth=HTTPBasicAuth(self.config.USERNAME, self.config.PASSWORD),
                timeout=30
            )
            
            if response.status_code in [200, 204, 404]:  # 成功或文件不存在
                logger.info(f"文件删除成功: {remote_path} (状态码: {response.status_code})")
                return True
            else:
                logger.error(f"文件删除失败，状态码: {response.status_code}, 响应: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"使用HTTP删除文件失败: {e}")
            return False
    
    def _download_file_with_http(self, remote_path: str) -> Optional[bytes]:
        """使用HTTP请求下载文件"""
        try:
            # 构造完整的URL
            url = f"{self.config.URL.rstrip('/')}/{remote_path}"
            
            # 发送GET请求下载文件
            response = requests.get(
                url,
                auth=HTTPBasicAuth(self.config.USERNAME, self.config.PASSWORD),
                timeout=60
            )
            
            if response.status_code == 200:
                logger.info(f"文件下载成功: {remote_path}")
                return response.content
            elif response.status_code == 404:
                logger.warning(f"文件不存在: {remote_path}")
                return None
            else:
                logger.error(f"文件下载失败，状态码: {response.status_code}, 响应: {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"使用HTTP下载文件失败: {e}")
            return None
    
    def _validate_image(self, file_content: bytes, filename: str) -> Tuple[bool, str]:
        """验证图片文件"""
        # 检查文件大小
        if len(file_content) > self.config.MAX_FILE_SIZE:
            return False, f"文件大小超过限制 ({self.config.MAX_FILE_SIZE // 1024 // 1024}MB)"
        
        # 检查文件扩展名
        file_ext = Path(filename).suffix.lower()
        if file_ext not in self.config.ALLOWED_EXTENSIONS:
            return False, f"不支持的文件格式，支持: {', '.join(self.config.ALLOWED_EXTENSIONS)}"
        
        # 验证是否为有效图片
        try:
            with Image.open(BytesIO(file_content)) as img:
                img.verify()
            return True, ""
        except Exception as e:
            return False, f"无效的图片文件: {str(e)}"
    
    def _process_avatar_image(self, file_content: bytes) -> bytes:
        """处理头像图片（调整大小、优化）"""
        try:
            with Image.open(BytesIO(file_content)) as img:
                # 转换为RGB模式（如果需要）
                if img.mode in ('RGBA', 'LA', 'P'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # 调整大小到合适的头像尺寸
                max_size = (300, 300)
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
                
                # 保存为JPEG格式以减小文件大小
                output = BytesIO()
                img.save(output, format='JPEG', quality=85, optimize=True)
                return output.getvalue()
                
        except Exception as e:
            logger.error(f"处理头像图片失败: {e}")
            return file_content  # 如果处理失败，返回原始内容
    
    def upload_avatar(self, file_content: bytes, filename: str, user_id: int) -> Tuple[bool, str, Optional[str]]:
        """
        上传用户头像
        
        Args:
            file_content: 文件内容
            filename: 原始文件名
            user_id: 用户ID
            
        Returns:
            Tuple[success, message, avatar_url]
        """
        try:
            # 验证图片
            is_valid, error_msg = self._validate_image(file_content, filename)
            if not is_valid:
                return False, error_msg, None
            
            # 处理图片
            processed_content = self._process_avatar_image(file_content)
            
            # 生成唯一文件名
            file_ext = Path(filename).suffix.lower()
            if not file_ext:
                file_ext = '.jpg'  # 默认使用jpg
            unique_filename = f"user_{user_id}_{uuid.uuid4().hex[:8]}{file_ext}"
            remote_path = f"{self.config.AVATAR_PATH}{unique_filename}"
            
            # 上传到WebDAV
            try:
                # 在上传前确保目录存在
                self._create_directory_with_http(self.config.AVATAR_PATH.rstrip('/'))
                
                # 使用HTTP请求上传文件
                success = self._upload_file_with_http(processed_content, remote_path)
                if not success:
                    return False, "上传文件到WebDAV失败", None
                    
                logger.info(f"文件上传成功: {remote_path}")
            except Exception as upload_error:
                logger.error(f"上传文件到WebDAV失败: {upload_error}")
                return False, f"上传文件到WebDAV失败: {str(upload_error)}", None
            
            # 生成访问URL
            avatar_url = self.config.get_avatar_url(unique_filename)
            
            logger.info(f"用户 {user_id} 头像上传成功: {remote_path}")
            return True, "头像上传成功", avatar_url
            
        except Exception as e:
            logger.error(f"上传头像失败: {e}")
            return False, f"上传失败: {str(e)}", None
    
    def delete_avatar(self, avatar_url: str) -> bool:
        """
        删除头像文件
        
        Args:
            avatar_url: 头像URL
            
        Returns:
            是否删除成功
        """
        try:
            if not avatar_url or not avatar_url.startswith(self.config.URL):
                return False
            
            # 从URL提取文件路径
            filename = avatar_url.split('/')[-1]
            remote_path = f"{self.config.AVATAR_PATH}{filename}"
            
            return self._delete_file_with_http(remote_path)
                
        except Exception as e:
            logger.error(f"删除头像失败: {e}")
            return False
    
    def get_avatar_content(self, avatar_url: str) -> Optional[bytes]:
        """
        获取头像文件内容（用于代理下载）
        
        Args:
            avatar_url: 头像URL
            
        Returns:
            文件内容或None
        """
        try:
            if not avatar_url or not avatar_url.startswith(self.config.URL):
                return None
            
            # 从URL提取文件路径
            filename = avatar_url.split('/')[-1]
            remote_path = f"{self.config.AVATAR_PATH}{filename}"
            
            return self._download_file_with_http(remote_path)
                
        except Exception as e:
            logger.error(f"获取头像内容失败: {e}")
            return None
    
    def list_user_avatars(self, user_id: int) -> list:
        """
        列出用户的所有头像文件
        
        Args:
            user_id: 用户ID
            
        Returns:
            头像文件列表
        """
        try:
            files = self.client.list(self.config.AVATAR_PATH)
            user_avatars = []
            
            for file_info in files:
                if file_info['name'].startswith(f"user_{user_id}_"):
                    avatar_url = self.config.get_avatar_url(file_info['name'])
                    user_avatars.append({
                        'filename': file_info['name'],
                        'url': avatar_url,
                        'size': file_info.get('size', 0),
                        'modified': file_info.get('modified', '')
                    })
            
            return user_avatars
            
        except Exception as e:
            logger.error(f"获取用户头像列表失败: {e}")
            return []


# 全局WebDAV服务实例
webdav_service = WebDAVService() 