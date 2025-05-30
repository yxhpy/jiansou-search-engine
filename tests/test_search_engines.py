"""
搜索引擎功能测试
"""
import pytest
from fastapi.testclient import TestClient

from app.models import SearchEngine
from app.services.search_engine_service import SearchEngineService


class TestSearchEngines:
    """搜索引擎测试类"""
    
    def test_get_search_engines_empty(self, client: TestClient):
        """测试获取空的搜索引擎列表"""
        response = client.get("/api/search-engines")
        assert response.status_code == 200
        assert response.json() == []
    
    def test_create_search_engine(self, client: TestClient):
        """测试创建搜索引擎"""
        engine_data = {
            "name": "test_engine",
            "display_name": "测试搜索引擎",
            "url_template": "https://test.com/search?q={query}",
            "icon": "fas fa-test",
            "color": "#FF0000",
            "is_active": True,
            "is_default": False
        }
        response = client.post("/api/search-engines", json=engine_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == engine_data["name"]
        assert data["display_name"] == engine_data["display_name"]
        assert data["url_template"] == engine_data["url_template"]
        assert data["icon"] == engine_data["icon"]
        assert data["color"] == engine_data["color"]
        assert data["is_active"] == engine_data["is_active"]
        assert data["is_default"] == engine_data["is_default"]
        assert "id" in data
        assert "created_at" in data
    
    def test_create_duplicate_search_engine(self, client: TestClient):
        """测试创建重复名称的搜索引擎"""
        engine_data = {
            "name": "duplicate_engine",
            "display_name": "重复引擎",
            "url_template": "https://test.com/search?q={query}"
        }
        
        # 第一次创建成功
        response = client.post("/api/search-engines", json=engine_data)
        assert response.status_code == 200
        
        # 第二次创建失败
        response = client.post("/api/search-engines", json=engine_data)
        assert response.status_code == 400
        assert "搜索引擎名称已存在" in response.json()["detail"]
    
    def test_get_search_engines_with_data(self, client: TestClient):
        """测试获取包含数据的搜索引擎列表"""
        # 先创建一个搜索引擎
        engine_data = {
            "name": "test_engine2",
            "display_name": "测试搜索引擎2",
            "url_template": "https://test2.com/search?q={query}"
        }
        client.post("/api/search-engines", json=engine_data)
        
        # 获取列表
        response = client.get("/api/search-engines")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) >= 1
        assert any(engine["name"] == "test_engine2" for engine in data)
    
    def test_get_search_engines_active_only(self, client: TestClient):
        """测试只获取活跃的搜索引擎"""
        # 创建活跃和非活跃的搜索引擎
        active_engine = {
            "name": "active_engine",
            "display_name": "活跃引擎",
            "url_template": "https://active.com/search?q={query}",
            "is_active": True
        }
        inactive_engine = {
            "name": "inactive_engine",
            "display_name": "非活跃引擎",
            "url_template": "https://inactive.com/search?q={query}",
            "is_active": False
        }
        
        client.post("/api/search-engines", json=active_engine)
        client.post("/api/search-engines", json=inactive_engine)
        
        # 获取活跃的搜索引擎
        response = client.get("/api/search-engines?active_only=true")
        assert response.status_code == 200
        
        data = response.json()
        assert all(engine["is_active"] for engine in data)
        assert any(engine["name"] == "active_engine" for engine in data)
        assert not any(engine["name"] == "inactive_engine" for engine in data)
    
    def test_update_search_engine(self, client: TestClient):
        """测试更新搜索引擎"""
        # 先创建一个搜索引擎
        engine_data = {
            "name": "update_engine",
            "display_name": "原始名称",
            "url_template": "https://original.com/search?q={query}"
        }
        response = client.post("/api/search-engines", json=engine_data)
        engine_id = response.json()["id"]
        
        # 更新搜索引擎
        update_data = {
            "display_name": "更新后名称",
            "url_template": "https://updated.com/search?q={query}",
            "is_default": True
        }
        response = client.put(f"/api/search-engines/{engine_id}", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["display_name"] == "更新后名称"
        assert data["url_template"] == "https://updated.com/search?q={query}"
        assert data["is_default"] is True
    
    def test_update_nonexistent_search_engine(self, client: TestClient):
        """测试更新不存在的搜索引擎"""
        update_data = {"display_name": "不存在的引擎"}
        response = client.put("/api/search-engines/99999", json=update_data)
        assert response.status_code == 404
    
    def test_delete_search_engine(self, client: TestClient):
        """测试删除搜索引擎"""
        # 先创建一个搜索引擎
        engine_data = {
            "name": "delete_engine",
            "display_name": "待删除引擎",
            "url_template": "https://delete.com/search?q={query}"
        }
        response = client.post("/api/search-engines", json=engine_data)
        engine_id = response.json()["id"]
        
        # 删除搜索引擎
        response = client.delete(f"/api/search-engines/{engine_id}")
        assert response.status_code == 200
        assert response.json()["message"] == "删除成功"
        
        # 验证已删除
        response = client.put(f"/api/search-engines/{engine_id}", json={"display_name": "test"})
        assert response.status_code == 404
    
    def test_delete_nonexistent_search_engine(self, client: TestClient):
        """测试删除不存在的搜索引擎"""
        response = client.delete("/api/search-engines/99999")
        assert response.status_code == 404
    
    def test_get_default_search_engine(self, client: TestClient):
        """测试获取默认搜索引擎"""
        # 创建一个默认搜索引擎
        engine_data = {
            "name": "default_engine",
            "display_name": "默认引擎",
            "url_template": "https://default.com/search?q={query}",
            "is_default": True
        }
        client.post("/api/search-engines", json=engine_data)
        
        # 获取默认搜索引擎
        response = client.get("/api/search-engines/default")
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == "default_engine"
        assert data["is_default"] is True
    
    def test_get_default_search_engine_none_set(self, client: TestClient):
        """测试在没有设置默认搜索引擎时获取默认引擎"""
        # 创建一个活跃的搜索引擎（但不是默认的）
        engine_data = {
            "name": "active_engine",
            "display_name": "活跃引擎",
            "url_template": "https://active.com/search?q={query}",
            "is_active": True,
            "is_default": False
        }
        client.post("/api/search-engines", json=engine_data)
        
        # 获取默认搜索引擎（应该返回第一个活跃的）
        response = client.get("/api/search-engines/default")
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == "active_engine"
        assert data["is_active"] is True


class TestSearchEngineService:
    """搜索引擎服务测试类"""
    
    def test_init_default_search_engines(self, db_session):
        """测试初始化默认搜索引擎"""
        # 确保数据库为空
        assert db_session.query(SearchEngine).count() == 0
        
        # 初始化默认数据
        success = SearchEngineService.init_default_search_engines(db_session)
        assert success is True
        
        # 验证数据已创建
        count = db_session.query(SearchEngine).count()
        assert count > 0
        
        # 验证包含预期的搜索引擎
        baidu_engine = db_session.query(SearchEngine).filter(SearchEngine.name == "baidu").first()
        assert baidu_engine is not None
        assert baidu_engine.display_name == "百度"
        assert baidu_engine.is_default is True
        
        google_engine = db_session.query(SearchEngine).filter(SearchEngine.name == "google").first()
        assert google_engine is not None
        assert google_engine.display_name == "Google"
        assert google_engine.is_default is False
    
    def test_init_default_search_engines_with_existing_data(self, db_session):
        """测试在已有数据时初始化默认搜索引擎"""
        # 先创建一个搜索引擎
        existing_engine = SearchEngine(
            name="existing",
            display_name="已存在",
            url_template="https://existing.com/search?q={query}"
        )
        db_session.add(existing_engine)
        db_session.commit()
        
        # 尝试初始化默认数据
        success = SearchEngineService.init_default_search_engines(db_session)
        assert success is True
        
        # 验证只有原来的一个搜索引擎
        count = db_session.query(SearchEngine).count()
        assert count == 1
    
    def test_clear_default_engines(self, db_session):
        """测试清除默认搜索引擎设置"""
        # 创建多个默认搜索引擎
        engine1 = SearchEngine(
            name="engine1",
            display_name="引擎1",
            url_template="https://engine1.com/search?q={query}",
            is_default=True
        )
        engine2 = SearchEngine(
            name="engine2",
            display_name="引擎2",
            url_template="https://engine2.com/search?q={query}",
            is_default=True
        )
        db_session.add(engine1)
        db_session.add(engine2)
        db_session.commit()
        
        # 清除默认设置
        SearchEngineService._clear_default_engines(db_session)
        db_session.commit()
        
        # 验证所有引擎都不是默认的
        engines = db_session.query(SearchEngine).all()
        assert all(not engine.is_default for engine in engines) 