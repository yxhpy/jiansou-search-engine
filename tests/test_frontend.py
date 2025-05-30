"""
前端模块化测试
测试前端文件结构和模块导入
"""

import os
import pytest
from pathlib import Path


class TestFrontendStructure:
    """测试前端文件结构"""
    
    def test_static_directory_structure(self):
        """测试静态文件目录结构"""
        static_dir = Path("static")
        assert static_dir.exists(), "static目录应该存在"
        
        # 检查CSS目录
        css_dir = static_dir / "css"
        assert css_dir.exists(), "css目录应该存在"
        
        # 检查JS目录
        js_dir = static_dir / "js"
        assert js_dir.exists(), "js目录应该存在"
        
        # 检查图片目录
        images_dir = static_dir / "images"
        assert images_dir.exists(), "images目录应该存在"
    
    def test_css_files_exist(self):
        """测试CSS文件是否存在"""
        css_dir = Path("static/css")
        
        # 检查基础样式文件
        base_css = css_dir / "base.css"
        assert base_css.exists(), "base.css文件应该存在"
        
        # 检查组件样式文件
        components_css = css_dir / "components.css"
        assert components_css.exists(), "components.css文件应该存在"
    
    def test_js_directory_structure(self):
        """测试JavaScript目录结构"""
        js_dir = Path("static/js")
        
        # 检查组件目录
        components_dir = js_dir / "components"
        assert components_dir.exists(), "components目录应该存在"
        
        # 检查服务目录
        services_dir = js_dir / "services"
        assert services_dir.exists(), "services目录应该存在"
        
        # 检查工具目录
        utils_dir = js_dir / "utils"
        assert utils_dir.exists(), "utils目录应该存在"
    
    def test_js_files_exist(self):
        """测试JavaScript文件是否存在"""
        js_dir = Path("static/js")
        
        # 检查主应用文件
        app_js = js_dir / "app.js"
        assert app_js.exists(), "app.js文件应该存在"
        
        # 检查工具文件
        constants_js = js_dir / "utils" / "constants.js"
        assert constants_js.exists(), "constants.js文件应该存在"
        
        helpers_js = js_dir / "utils" / "helpers.js"
        assert helpers_js.exists(), "helpers.js文件应该存在"
        
        # 检查服务文件
        api_js = js_dir / "services" / "api.js"
        assert api_js.exists(), "api.js文件应该存在"
        
        notification_js = js_dir / "services" / "notification.js"
        assert notification_js.exists(), "notification.js文件应该存在"
        
        # 检查组件文件
        search_box_js = js_dir / "components" / "SearchBox.js"
        assert search_box_js.exists(), "SearchBox.js文件应该存在"
        
        quick_links_js = js_dir / "components" / "QuickLinks.js"
        assert quick_links_js.exists(), "QuickLinks.js文件应该存在"
    
    def test_html_files_exist(self):
        """测试HTML文件是否存在"""
        # 检查重构后的HTML文件
        index_new_html = Path("index_new.html")
        assert index_new_html.exists(), "index_new.html文件应该存在"


class TestFrontendContent:
    """测试前端文件内容"""
    
    def test_css_variables_defined(self):
        """测试CSS变量是否定义"""
        base_css = Path("static/css/base.css")
        content = base_css.read_text(encoding='utf-8')
        
        # 检查CSS变量
        assert "--huawei-blue" in content, "应该定义华为蓝色变量"
        assert "--shadow-base" in content, "应该定义基础阴影变量"
        assert "--font-family" in content, "应该定义字体变量"
        assert "--transition-base" in content, "应该定义过渡动画变量"
    
    def test_component_styles_defined(self):
        """测试组件样式是否定义"""
        components_css = Path("static/css/components.css")
        content = components_css.read_text(encoding='utf-8')
        
        # 检查组件样式
        assert ".search-container" in content, "应该定义搜索容器样式"
        assert ".quick-link-item" in content, "应该定义快速链接项样式"
        assert ".category-tag" in content, "应该定义分类标签样式"
        assert ".notification" in content, "应该定义通知样式"
    
    def test_js_constants_defined(self):
        """测试JavaScript常量是否定义"""
        constants_js = Path("static/js/utils/constants.js")
        content = constants_js.read_text(encoding='utf-8')
        
        # 检查常量定义
        assert "API_ENDPOINTS" in content, "应该定义API端点常量"
        assert "DEFAULT_CONFIG" in content, "应该定义默认配置常量"
        assert "EVENTS" in content, "应该定义事件名称常量"
        assert "STORAGE_KEYS" in content, "应该定义存储键名常量"
    
    def test_js_helpers_defined(self):
        """测试JavaScript工具函数是否定义"""
        helpers_js = Path("static/js/utils/helpers.js")
        content = helpers_js.read_text(encoding='utf-8')
        
        # 检查工具函数
        assert "export const storage" in content, "应该导出存储工具"
        assert "export const dom" in content, "应该导出DOM工具"
        assert "export const events" in content, "应该导出事件工具"
        assert "export const validation" in content, "应该导出验证工具"
    
    def test_api_services_defined(self):
        """测试API服务是否定义"""
        api_js = Path("static/js/services/api.js")
        content = api_js.read_text(encoding='utf-8')
        
        # 检查API服务类
        assert "class ApiService" in content, "应该定义基础API服务类"
        assert "export class QuickLinksApi" in content, "应该导出快速链接API类"
        assert "export class SearchEnginesApi" in content, "应该导出搜索引擎API类"
        assert "export class SearchApi" in content, "应该导出搜索API类"
    
    def test_components_defined(self):
        """测试组件是否定义"""
        # 检查搜索框组件
        search_box_js = Path("static/js/components/SearchBox.js")
        content = search_box_js.read_text(encoding='utf-8')
        assert "export class SearchBox" in content, "应该导出搜索框组件类"
        
        # 检查快速链接组件
        quick_links_js = Path("static/js/components/QuickLinks.js")
        content = quick_links_js.read_text(encoding='utf-8')
        assert "export class QuickLinks" in content, "应该导出快速链接组件类"
    
    def test_main_app_defined(self):
        """测试主应用是否定义"""
        app_js = Path("static/js/app.js")
        content = app_js.read_text(encoding='utf-8')
        
        # 检查主应用类
        assert "class App" in content, "应该定义主应用类"
        assert "export default app" in content, "应该导出应用实例"
        assert "import { SearchBox }" in content, "应该导入搜索框组件"
        assert "import { QuickLinks }" in content, "应该导入快速链接组件"
    
    def test_html_structure(self):
        """测试HTML结构"""
        index_new_html = Path("index_new.html")
        content = index_new_html.read_text(encoding='utf-8')
        
        # 检查HTML结构
        assert 'id="search-container"' in content, "应该有搜索容器"
        assert 'id="quick-links-container"' in content, "应该有快速链接容器"
        assert 'id="mobile-menu-button"' in content, "应该有移动端菜单按钮"
        assert 'type="module"' in content, "应该使用ES6模块"
        assert '/static/css/base.css' in content, "应该引用基础样式"
        assert '/static/css/components.css' in content, "应该引用组件样式"
        assert '/static/js/app.js' in content, "应该引用主应用脚本"


class TestFrontendModularity:
    """测试前端模块化程度"""
    
    def test_css_separation(self):
        """测试CSS分离"""
        base_css = Path("static/css/base.css")
        components_css = Path("static/css/components.css")
        
        base_content = base_css.read_text(encoding='utf-8')
        components_content = components_css.read_text(encoding='utf-8')
        
        # 基础样式应该包含全局样式
        assert ":root" in base_content, "基础样式应该包含CSS变量"
        assert "body" in base_content, "基础样式应该包含全局样式"
        
        # 组件样式应该包含具体组件
        assert ".search-container" in components_content, "组件样式应该包含搜索组件"
        assert ".quick-link-item" in components_content, "组件样式应该包含快速链接组件"
    
    def test_js_module_imports(self):
        """测试JavaScript模块导入"""
        app_js = Path("static/js/app.js")
        content = app_js.read_text(encoding='utf-8')
        
        # 检查模块导入
        assert "import {" in content, "应该使用ES6导入语法"
        assert "from './components/" in content, "应该从组件目录导入"
        assert "from './services/" in content, "应该从服务目录导入"
        assert "from './utils/" in content, "应该从工具目录导入"
    
    def test_single_responsibility(self):
        """测试单一职责原则"""
        # 检查每个文件的职责是否单一
        
        # 常量文件只应该包含常量定义
        constants_js = Path("static/js/utils/constants.js")
        content = constants_js.read_text(encoding='utf-8')
        assert "export const" in content, "常量文件应该只导出常量"
        assert "class" not in content, "常量文件不应该包含类定义"
        
        # API服务文件只应该包含API相关功能
        api_js = Path("static/js/services/api.js")
        content = api_js.read_text(encoding='utf-8')
        assert "fetch" in content, "API服务应该包含网络请求"
        assert "class" in content, "API服务应该使用类组织"
        
        # 组件文件应该包含UI相关功能
        search_box_js = Path("static/js/components/SearchBox.js")
        content = search_box_js.read_text(encoding='utf-8')
        assert "render" in content, "组件应该包含渲染方法"
        assert "bindEvents" in content, "组件应该包含事件绑定"


if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 