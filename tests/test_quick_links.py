"""
快速链接功能测试
"""
import pytest
from fastapi.testclient import TestClient

from app.models import QuickLink
from app.services.quick_link_service import QuickLinkService


class TestQuickLinks:
    """快速链接测试类"""
    
    def test_get_quick_links_empty(self, client: TestClient):
        """测试获取空的快速链接列表"""
        response = client.get("/api/quick-links")
        assert response.status_code == 200
        assert response.json() == []
    
    def test_create_quick_link(self, client: TestClient):
        """测试创建快速链接"""
        link_data = {
            "name": "测试链接",
            "url": "https://test.com",
            "icon": "fas fa-test",
            "color": "#FF0000",
            "category": "测试"
        }
        response = client.post("/api/quick-links", json=link_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == link_data["name"]
        assert data["url"] == link_data["url"]
        assert data["icon"] == link_data["icon"]
        assert data["color"] == link_data["color"]
        assert data["category"] == link_data["category"]
        assert "id" in data
        assert "created_at" in data
    
    def test_get_quick_links_with_data(self, client: TestClient):
        """测试获取包含数据的快速链接列表"""
        # 先创建一个链接
        link_data = {
            "name": "测试链接2",
            "url": "https://test2.com",
            "category": "测试"
        }
        client.post("/api/quick-links", json=link_data)
        
        # 获取列表
        response = client.get("/api/quick-links")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) >= 1
        assert any(link["name"] == "测试链接2" for link in data)
    
    def test_get_quick_links_by_category(self, client: TestClient):
        """测试按分类获取快速链接"""
        # 创建不同分类的链接
        link1 = {"name": "搜索链接", "url": "https://search.com", "category": "搜索"}
        link2 = {"name": "社交链接", "url": "https://social.com", "category": "社交"}
        
        client.post("/api/quick-links", json=link1)
        client.post("/api/quick-links", json=link2)
        
        # 按分类获取
        response = client.get("/api/quick-links?category=搜索")
        assert response.status_code == 200
        
        data = response.json()
        assert all(link["category"] == "搜索" for link in data)
    
    def test_update_quick_link(self, client: TestClient):
        """测试更新快速链接"""
        # 先创建一个链接
        link_data = {"name": "原始名称", "url": "https://original.com"}
        response = client.post("/api/quick-links", json=link_data)
        link_id = response.json()["id"]
        
        # 更新链接
        update_data = {"name": "更新后名称", "url": "https://updated.com"}
        response = client.put(f"/api/quick-links/{link_id}", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == "更新后名称"
        assert data["url"] == "https://updated.com"
    
    def test_update_nonexistent_quick_link(self, client: TestClient):
        """测试更新不存在的快速链接"""
        update_data = {"name": "不存在的链接"}
        response = client.put("/api/quick-links/99999", json=update_data)
        assert response.status_code == 404
    
    def test_delete_quick_link(self, client: TestClient):
        """测试删除快速链接"""
        # 先创建一个链接
        link_data = {"name": "待删除链接", "url": "https://delete.com"}
        response = client.post("/api/quick-links", json=link_data)
        link_id = response.json()["id"]
        
        # 删除链接
        response = client.delete(f"/api/quick-links/{link_id}")
        assert response.status_code == 200
        assert response.json()["message"] == "删除成功"
        
        # 验证已删除
        response = client.put(f"/api/quick-links/{link_id}", json={"name": "test"})
        assert response.status_code == 404
    
    def test_delete_nonexistent_quick_link(self, client: TestClient):
        """测试删除不存在的快速链接"""
        response = client.delete("/api/quick-links/99999")
        assert response.status_code == 404
    
    def test_get_categories(self, client: TestClient):
        """测试获取分类列表"""
        response = client.get("/api/quick-links/categories")
        assert response.status_code == 200
        
        categories = response.json()
        assert isinstance(categories, list)
        assert "搜索" in categories
        assert "社交" in categories
        assert "购物" in categories


class TestQuickLinkService:
    """快速链接服务测试类"""
    
    def test_init_default_quick_links(self, db_session):
        """测试初始化默认快速链接"""
        # 确保数据库为空
        assert db_session.query(QuickLink).count() == 0
        
        # 初始化默认数据
        success = QuickLinkService.init_default_quick_links(db_session)
        assert success is True
        
        # 验证数据已创建
        count = db_session.query(QuickLink).count()
        assert count > 0
        
        # 验证包含预期的链接
        baidu_link = db_session.query(QuickLink).filter(QuickLink.name == "百度").first()
        assert baidu_link is not None
        assert baidu_link.url == "https://www.baidu.com"
        assert baidu_link.category == "搜索"
    
    def test_init_default_quick_links_with_existing_data(self, db_session):
        """测试在已有数据时初始化默认快速链接"""
        # 先创建一个链接
        existing_link = QuickLink(name="已存在", url="https://existing.com", category="测试")
        db_session.add(existing_link)
        db_session.commit()
        
        # 尝试初始化默认数据
        success = QuickLinkService.init_default_quick_links(db_session)
        assert success is True
        
        # 验证只有原来的一个链接
        count = db_session.query(QuickLink).count()
        assert count == 1 