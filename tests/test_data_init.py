"""
数据初始化服务测试
"""
import pytest
import json
import os
from unittest.mock import patch, mock_open

from app.models import QuickLink, SearchEngine
from app.services.data_init_service import DataInitService


class TestDataInitService:
    """数据初始化服务测试类"""
    
    def test_init_quick_links_default(self, db_session):
        """测试初始化默认快速链接数据"""
        # 确保数据库为空
        assert db_session.query(QuickLink).count() == 0
        
        # 初始化快速链接数据
        success = DataInitService._init_quick_links(db_session)
        assert success is True
        
        # 验证数据已创建
        count = db_session.query(QuickLink).count()
        assert count > 0
        
        # 验证包含预期的链接
        baidu_link = db_session.query(QuickLink).filter(QuickLink.name == "百度").first()
        assert baidu_link is not None
        assert baidu_link.url == "https://www.baidu.com"
        assert baidu_link.category == "搜索"
    
    @patch('os.path.exists')
    @patch('builtins.open', new_callable=mock_open)
    def test_init_quick_links_from_json(self, mock_file, mock_exists, db_session):
        """测试从JSON文件初始化快速链接数据"""
        # 模拟JSON文件存在
        mock_exists.return_value = True
        
        # 模拟JSON文件内容
        json_data = {
            "quickLinks": [
                {
                    "name": "测试链接",
                    "url": "https://test.com",
                    "icon": "fas fa-test",
                    "color": "#FF0000",
                    "category": "测试"
                }
            ]
        }
        mock_file.return_value.read.return_value = json.dumps(json_data)
        
        # 确保数据库为空
        assert db_session.query(QuickLink).count() == 0
        
        # 初始化快速链接数据
        success = DataInitService._init_quick_links(db_session)
        assert success is True
        
        # 验证数据已创建
        count = db_session.query(QuickLink).count()
        assert count == 1
        
        # 验证数据内容
        link = db_session.query(QuickLink).first()
        assert link.name == "测试链接"
        assert link.url == "https://test.com"
        assert link.category == "测试"
    
    def test_init_search_engines(self, db_session):
        """测试初始化搜索引擎数据"""
        # 确保数据库为空
        assert db_session.query(SearchEngine).count() == 0
        
        # 初始化搜索引擎数据
        success = DataInitService._init_search_engines(db_session)
        assert success is True
        
        # 验证数据已创建
        count = db_session.query(SearchEngine).count()
        assert count > 0
        
        # 验证包含预期的搜索引擎
        baidu_engine = db_session.query(SearchEngine).filter(SearchEngine.name == "baidu").first()
        assert baidu_engine is not None
        assert baidu_engine.display_name == "百度"
        assert baidu_engine.is_default is True
    
    @patch('os.path.exists')
    @patch('builtins.open', new_callable=mock_open)
    def test_load_quick_links_from_json_error(self, mock_file, mock_exists, db_session):
        """测试从JSON文件加载数据时的错误处理"""
        # 模拟JSON文件存在
        mock_exists.return_value = True
        
        # 模拟JSON文件读取错误
        mock_file.side_effect = IOError("文件读取错误")
        
        # 尝试加载数据
        success = DataInitService._load_quick_links_from_json(db_session)
        assert success is False
        
        # 验证数据库没有数据
        count = db_session.query(QuickLink).count()
        assert count == 0
    
    def test_init_with_existing_data(self, db_session):
        """测试在已有数据时的初始化行为"""
        # 先创建一些数据
        existing_link = QuickLink(name="已存在", url="https://existing.com", category="测试")
        existing_engine = SearchEngine(
            name="existing",
            display_name="已存在",
            url_template="https://existing.com/search?q={query}"
        )
        db_session.add(existing_link)
        db_session.add(existing_engine)
        db_session.commit()
        
        # 尝试初始化数据
        link_success = DataInitService._init_quick_links(db_session)
        engine_success = DataInitService._init_search_engines(db_session)
        
        assert link_success is True
        assert engine_success is True
        
        # 验证只有原来的数据
        assert db_session.query(QuickLink).count() == 1
        assert db_session.query(SearchEngine).count() == 1 