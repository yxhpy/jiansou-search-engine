/**
 * 搜索框组件
 * 负责搜索功能的UI和交互
 */

import { searchEnginesApi, searchApi } from '../services/api.js';
import { showSuccess, showError } from '../services/notification.js';
import { dom, events, getCurrentSearchEngine, setCurrentSearchEngine } from '../utils/helpers.js';
import { EVENTS } from '../utils/constants.js';

/**
 * 搜索框组件类
 */
export class SearchBox {
    constructor(container) {
        this.container = typeof container === 'string' ? dom.get(container) : container;
        this.searchEngines = [];
        this.currentEngine = getCurrentSearchEngine();
        
        this.init();
    }

    /**
     * 初始化组件
     */
    async init() {
        this.render();
        this.bindEvents();
        await this.loadSearchEngines();
    }

    /**
     * 渲染搜索框
     */
    render() {
        this.container.innerHTML = `
            <div class="search-wrapper">
                <!-- 主搜索框 -->
                <form id="search-form" class="search-form-modern">
                    <div class="search-box-container">
                        <!-- 搜索引擎指示器 -->
                        <div class="search-engine-indicator" id="search-engine-indicator">
                            <div class="engine-icon">
                                <i class="fas fa-search"></i>
                            </div>
                            <span class="engine-name">搜索</span>
                            <i class="fas fa-chevron-down dropdown-icon"></i>
                        </div>
                        
                        <!-- 搜索输入框 -->
                        <input 
                            type="text" 
                            id="search-input" 
                            class="search-input-modern" 
                            placeholder="搜索任何内容..." 
                            autocomplete="off"
                            spellcheck="false"
                        >
                        
                        <!-- 搜索按钮 -->
                        <button type="submit" class="search-submit-modern" aria-label="搜索">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                    
                    <!-- 搜索引擎下拉菜单 -->
                    <div class="search-engines-dropdown" id="search-engines-dropdown">
                        <div class="dropdown-content">
                            <div class="dropdown-header">选择搜索引擎</div>
                            <div class="engines-list" id="engines-list">
                                <!-- 搜索引擎列表将在这里渲染 -->
                            </div>
                        </div>
                    </div>
                </form>
                
                <!-- 搜索建议 -->
                <div class="search-suggestions" id="search-suggestions">
                    <!-- 搜索建议将在这里显示 -->
                </div>
            </div>
        `;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        const form = dom.get('#search-form');
        const searchInput = dom.get('#search-input');
        const engineIndicator = dom.get('#search-engine-indicator');
        const enginesDropdown = dom.get('#search-engines-dropdown');

        // 表单提交事件
        events.on(form, 'submit', (e) => {
            e.preventDefault();
            this.handleSearch();
        });

        // 搜索引擎指示器点击事件
        events.on(engineIndicator, 'click', (e) => {
            e.stopPropagation();
            this.toggleEnginesDropdown();
        });

        // 点击外部关闭下拉菜单
        events.on(document, 'click', (e) => {
            if (!enginesDropdown.contains(e.target) && !engineIndicator.contains(e.target)) {
                this.hideEnginesDropdown();
            }
        });

        // 输入框事件
        events.on(searchInput, 'input', (e) => {
            this.handleInputChange(e.target.value);
        });

        events.on(searchInput, 'focus', () => {
            this.showSearchSuggestions();
        });

        events.on(searchInput, 'keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSearch();
            } else if (e.key === 'Escape') {
                this.hideSearchSuggestions();
                searchInput.blur();
            }
        });

        // 监听搜索引擎数据更新
        events.on(document, EVENTS.SEARCH_ENGINES_LOADED, () => {
            this.loadSearchEngines();
        });
    }

    /**
     * 加载搜索引擎列表
     */
    async loadSearchEngines() {
        try {
            this.searchEngines = await searchEnginesApi.getSearchEngines();
            
            // 优先使用服务器端的默认搜索引擎
            const defaultEngine = this.searchEngines.find(engine => engine.is_default);
            if (defaultEngine) {
                this.currentEngine = defaultEngine.name;
                setCurrentSearchEngine(this.currentEngine);
            } else if (!this.currentEngine) {
                // 如果没有默认搜索引擎且本地也没有设置，使用第一个
                this.currentEngine = this.searchEngines[0]?.name || '';
                setCurrentSearchEngine(this.currentEngine);
            }
            
            this.renderSearchEngineSelect();
        } catch (error) {
            console.error('加载搜索引擎失败:', error);
            showError('加载搜索引擎失败');
        }
    }

    /**
     * 渲染搜索引擎选择器
     */
    renderSearchEngineSelect() {
        const enginesList = dom.get('#engines-list');
        const engineIndicator = dom.get('#search-engine-indicator');
        
        if (!enginesList || !this.searchEngines.length) return;

        // 确保当前引擎在列表中存在
        if (!this.searchEngines.find(engine => engine.name === this.currentEngine)) {
            this.currentEngine = this.searchEngines[0]?.name || '';
            setCurrentSearchEngine(this.currentEngine);
        }

        // 更新指示器显示
        const currentEngine = this.searchEngines.find(engine => engine.name === this.currentEngine);
        if (currentEngine && engineIndicator) {
            const iconElement = engineIndicator.querySelector('.engine-icon i');
            const nameElement = engineIndicator.querySelector('.engine-name');
            
            iconElement.className = currentEngine.icon || 'fas fa-search';
            iconElement.style.color = currentEngine.color || '#007DFF';
            nameElement.textContent = currentEngine.display_name;
        }

        // 渲染引擎列表
        enginesList.innerHTML = this.searchEngines.map(engine => `
            <div class="engine-option ${engine.name === this.currentEngine ? 'active' : ''}" 
                 data-engine="${engine.name}">
                <div class="engine-option-icon">
                    <i class="${engine.icon || 'fas fa-search'}" style="color: ${engine.color || '#007DFF'}"></i>
                </div>
                <div class="engine-option-info">
                    <div class="engine-option-name">${engine.display_name}</div>
                    <div class="engine-option-url">${this.getEngineDisplayUrl(engine.url_template)}</div>
                </div>
                ${engine.name === this.currentEngine ? '<i class="fas fa-check engine-option-check"></i>' : ''}
            </div>
        `).join('');

        // 绑定引擎选择事件
        enginesList.querySelectorAll('.engine-option').forEach(option => {
            events.on(option, 'click', () => {
                const engineName = option.dataset.engine;
                this.selectSearchEngine(engineName);
            });
        });
    }

    /**
     * 获取搜索引擎显示URL
     */
    getEngineDisplayUrl(urlTemplate) {
        return urlTemplate.replace('{query}', '').replace(/\?.*$/, '').replace(/\/$/, '');
    }

    /**
     * 选择搜索引擎
     */
    selectSearchEngine(engineName) {
        this.currentEngine = engineName;
        setCurrentSearchEngine(engineName);
        this.renderSearchEngineSelect();
        this.hideEnginesDropdown();
        events.emit(document, EVENTS.SEARCH_ENGINE_CHANGED, engineName);
    }

    /**
     * 处理搜索
     */
    async handleSearch() {
        const searchInput = dom.get('#search-input');
        const query = searchInput.value.trim();

        if (!query) {
            showError('请输入搜索内容');
            searchInput.focus();
            return;
        }

        if (!this.currentEngine) {
            showError('请选择搜索引擎');
            return;
        }

        try {
            // 显示加载状态
            const submitButton = dom.get('#search-form button[type="submit"]');
            const originalContent = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span class="ml-2 hidden sm:inline">搜索中...</span>';
            submitButton.disabled = true;

            // 执行搜索
            const result = await searchApi.search({
                query: query,
                search_engine: this.currentEngine
            });

            // 打开搜索结果页面
            window.open(result.search_url, '_blank');
            
            // 清空搜索框
            searchInput.value = '';
            
            showSuccess(`已使用 ${result.search_engine} 搜索`);

        } catch (error) {
            console.error('搜索失败:', error);
            showError(error.message || '搜索失败，请重试');
        } finally {
            // 恢复按钮状态
            const submitButton = dom.get('#search-form button[type="submit"]');
            submitButton.innerHTML = '<i class="fas fa-arrow-right"></i>';
            submitButton.disabled = false;
            searchInput.focus();
        }
    }

    /**
     * 获取当前搜索引擎
     * @returns {string} 当前搜索引擎名称
     */
    getCurrentEngine() {
        return this.currentEngine;
    }

    /**
     * 聚焦搜索输入框
     */
    focus() {
        const searchInput = dom.get('#search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }

    /**
     * 设置搜索内容
     * @param {string} query 搜索内容
     */
    setQuery(query) {
        const searchInput = dom.get('#search-input');
        if (searchInput) {
            searchInput.value = query;
        }
    }

    /**
     * 获取搜索内容
     * @returns {string} 搜索内容
     */
    getQuery() {
        const searchInput = dom.get('#search-input');
        return searchInput ? searchInput.value.trim() : '';
    }

    /**
     * 切换搜索引擎下拉菜单
     */
    toggleEnginesDropdown() {
        const dropdown = dom.get('#search-engines-dropdown');
        const indicator = dom.get('#search-engine-indicator');
        
        if (dropdown.classList.contains('show')) {
            this.hideEnginesDropdown();
        } else {
            this.showEnginesDropdown();
        }
    }

    /**
     * 显示搜索引擎下拉菜单
     */
    showEnginesDropdown() {
        const dropdown = dom.get('#search-engines-dropdown');
        const indicator = dom.get('#search-engine-indicator');
        
        dropdown.classList.add('show');
        indicator.classList.add('active');
        
        // 添加动画效果
        setTimeout(() => {
            dropdown.classList.add('animate');
        }, 10);
    }

    /**
     * 隐藏搜索引擎下拉菜单
     */
    hideEnginesDropdown() {
        const dropdown = dom.get('#search-engines-dropdown');
        const indicator = dom.get('#search-engine-indicator');
        
        dropdown.classList.remove('animate');
        indicator.classList.remove('active');
        
        setTimeout(() => {
            dropdown.classList.remove('show');
        }, 200);
    }

    /**
     * 处理输入变化
     */
    handleInputChange(value) {
        if (value.trim()) {
            this.showSearchSuggestions(value);
        } else {
            this.hideSearchSuggestions();
        }
    }

    /**
     * 显示搜索建议
     */
    showSearchSuggestions(query = '') {
        const suggestions = dom.get('#search-suggestions');
        
        if (query) {
            // 这里可以添加搜索建议的逻辑
            // 暂时显示一些示例建议
            const sampleSuggestions = [
                `${query} 是什么`,
                `${query} 怎么用`,
                `${query} 教程`,
                `${query} 下载`
            ].filter(s => s !== query);

            if (sampleSuggestions.length > 0) {
                suggestions.innerHTML = `
                    <div class="suggestions-content">
                        ${sampleSuggestions.map(suggestion => `
                            <div class="suggestion-item" data-suggestion="${suggestion}">
                                <i class="fas fa-search suggestion-icon"></i>
                                <span class="suggestion-text">${suggestion}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
                
                suggestions.classList.add('show');
                
                // 绑定建议点击事件
                suggestions.querySelectorAll('.suggestion-item').forEach(item => {
                    events.on(item, 'click', () => {
                        const suggestion = item.dataset.suggestion;
                        this.setQuery(suggestion);
                        this.hideSearchSuggestions();
                        this.handleSearch();
                    });
                });
            }
        } else {
            this.hideSearchSuggestions();
        }
    }

    /**
     * 隐藏搜索建议
     */
    hideSearchSuggestions() {
        const suggestions = dom.get('#search-suggestions');
        suggestions.classList.remove('show');
    }

    /**
     * 设置搜索引擎
     * @param {string} engineName 搜索引擎名称
     */
    setSearchEngine(engineName) {
        this.selectSearchEngine(engineName);
    }
} 