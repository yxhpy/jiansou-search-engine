"""
搜索功能测试
"""
import pytest
from fastapi.testclient import TestClient

from app.models import SearchEngine, SearchHistory
from app.services.search_service import SearchService


class TestSearch:
    """搜索功能测试类"""
    
    def test_search_with_valid_engine(self, client: TestClient):
        """测试使用有效搜索引擎进行搜索"""
        # 先创建一个搜索引擎
        engine_data = {
            "name": "test_search",
            "display_name": "测试搜索",
            "url_template": "https://test.com/search?q={query}",
            "is_active": True
        }
        client.post("/api/search-engines", json=engine_data)
        
        # 执行搜索
        search_data = {
            "query": "Python编程",
            "search_engine": "test_search"
        }
        response = client.post("/api/search", json=search_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["query"] == "Python编程"
        assert data["search_engine"] == "测试搜索"
        assert data["search_url"] == "https://test.com/search?q=Python编程"
    
    def test_search_with_invalid_engine(self, client: TestClient):
        """测试使用无效搜索引擎进行搜索"""
        search_data = {
            "query": "测试查询",
            "search_engine": "nonexistent_engine"
        }
        response = client.post("/api/search", json=search_data)
        assert response.status_code == 404
        assert "搜索引擎未找到" in response.json()["detail"]
    
    def test_search_with_special_characters(self, client: TestClient):
        """测试包含特殊字符的搜索查询"""
        # 创建搜索引擎
        engine_data = {
            "name": "special_search",
            "display_name": "特殊搜索",
            "url_template": "https://special.com/search?q={query}",
            "is_active": True
        }
        client.post("/api/search-engines", json=engine_data)
        
        # 执行包含特殊字符的搜索
        search_data = {
            "query": "Python & JavaScript 编程",
            "search_engine": "special_search"
        }
        response = client.post("/api/search", json=search_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["query"] == "Python & JavaScript 编程"
        assert "Python & JavaScript 编程" in data["search_url"]
    
    def test_search_history_recording(self, client: TestClient):
        """测试搜索历史记录功能"""
        # 创建搜索引擎
        engine_data = {
            "name": "history_search",
            "display_name": "历史搜索",
            "url_template": "https://history.com/search?q={query}",
            "is_active": True
        }
        client.post("/api/search-engines", json=engine_data)
        
        # 执行搜索
        search_data = {
            "query": "搜索历史测试",
            "search_engine": "history_search"
        }
        client.post("/api/search", json=search_data)
        
        # 检查搜索历史
        response = client.get("/api/search-history")
        assert response.status_code == 200
        
        history = response.json()
        assert len(history) >= 1
        assert any(item["query"] == "搜索历史测试" for item in history)
        assert any(item["search_engine"] == "history_search" for item in history)
    
    def test_get_search_history_empty(self, client: TestClient):
        """测试获取空的搜索历史"""
        response = client.get("/api/search-history")
        assert response.status_code == 200
        assert response.json() == []
    
    def test_get_search_history_with_limit(self, client: TestClient):
        """测试限制搜索历史数量"""
        # 创建搜索引擎
        engine_data = {
            "name": "limit_search",
            "display_name": "限制搜索",
            "url_template": "https://limit.com/search?q={query}",
            "is_active": True
        }
        client.post("/api/search-engines", json=engine_data)
        
        # 执行多次搜索
        for i in range(5):
            search_data = {
                "query": f"查询{i}",
                "search_engine": "limit_search"
            }
            client.post("/api/search", json=search_data)
        
        # 获取限制数量的搜索历史
        response = client.get("/api/search-history?limit=3")
        assert response.status_code == 200
        
        history = response.json()
        assert len(history) <= 3
    
    def test_search_with_default_engine(self, client: TestClient):
        """测试使用默认搜索引擎参数"""
        # 创建默认搜索引擎
        engine_data = {
            "name": "baidu",
            "display_name": "百度",
            "url_template": "https://www.baidu.com/s?wd={query}",
            "is_active": True,
            "is_default": True
        }
        client.post("/api/search-engines", json=engine_data)
        
        # 不指定搜索引擎（使用默认值）
        search_data = {
            "query": "默认搜索测试"
        }
        response = client.post("/api/search", json=search_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["query"] == "默认搜索测试"
        assert data["search_engine"] == "百度"


class TestSearchService:
    """搜索服务测试类"""
    
    def test_perform_search_success(self, db_session):
        """测试成功执行搜索"""
        # 创建搜索引擎
        engine = SearchEngine(
            name="test_engine",
            display_name="测试引擎",
            url_template="https://test.com/search?q={query}",
            is_active=True
        )
        db_session.add(engine)
        db_session.commit()
        
        # 执行搜索
        from app.schemas import SearchRequest
        search_request = SearchRequest(query="测试查询", search_engine="test_engine")
        result = SearchService.perform_search(db_session, search_request)
        
        assert result is not None
        assert result.query == "测试查询"
        assert result.search_engine == "测试引擎"
        assert result.search_url == "https://test.com/search?q=测试查询"
        
        # 验证搜索历史已记录
        history_count = db_session.query(SearchHistory).count()
        assert history_count == 1
        
        history = db_session.query(SearchHistory).first()
        assert history.query == "测试查询"
        assert history.search_engine == "test_engine"
    
    def test_perform_search_engine_not_found(self, db_session):
        """测试搜索引擎不存在的情况"""
        from app.schemas import SearchRequest
        search_request = SearchRequest(query="测试查询", search_engine="nonexistent")
        result = SearchService.perform_search(db_session, search_request)
        
        assert result is None
    
    def test_get_search_history(self, db_session):
        """测试获取搜索历史"""
        # 创建搜索历史记录
        history1 = SearchHistory(query="查询1", search_engine="engine1")
        history2 = SearchHistory(query="查询2", search_engine="engine2")
        history3 = SearchHistory(query="查询3", search_engine="engine1")
        
        db_session.add_all([history1, history2, history3])
        db_session.commit()
        
        # 获取搜索历史
        history = SearchService.get_search_history(db_session, limit=2)
        assert len(history) == 2
        
        # 验证按时间倒序排列
        assert history[0].query == "查询3"  # 最新的
        assert history[1].query == "查询2"
    
    def test_get_search_history_default_limit(self, db_session):
        """测试使用默认限制获取搜索历史"""
        # 创建多条搜索历史记录
        for i in range(15):
            history = SearchHistory(query=f"查询{i}", search_engine="test")
            db_session.add(history)
        db_session.commit()
        
        # 使用默认限制获取搜索历史
        history = SearchService.get_search_history(db_session)
        assert len(history) == 10  # 默认限制为10 