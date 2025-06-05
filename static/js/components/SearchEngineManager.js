/**
 * 搜索引擎管理组件
 * 负责搜索引擎的增删改查功能
 */

import { searchEnginesApi } from '../services/api.js';
import { showSuccess, showError } from '../services/notification.js';
import { dom, events, validation } from '../utils/helpers.js';
import { EVENTS, VALIDATION_RULES } from '../utils/constants.js';
import { authService } from '../services/auth.js';

/**
 * 搜索引擎管理组件类
 */
export class SearchEngineManager {
    constructor() {
        this.searchEngines = [];
        this.currentEditId = null;
        this.isModalOpen = false;
        this.editMode = false;
        
        this.init();
    }

    /**
     * 初始化组件
     */
    async init() {
        this.createModals();
        this.bindEvents();
        await this.loadData();
        this.updateUIBasedOnAuth();
        
        // 监听登录状态变化
        authService.on('onLogin', () => {
            this.updateUIBasedOnAuth();
        });
        
        authService.on('onLogout', () => {
            this.updateUIBasedOnAuth();
        });
    }

    /**
     * 根据认证状态更新UI
     */
    updateUIBasedOnAuth() {
        const isLoggedIn = authService.isLoggedIn();
        
        // 显示/隐藏搜索引擎管理按钮
        const manageEnginesBtn = dom.get('#manage-engines-btn');
        
        if (manageEnginesBtn) {
            if (isLoggedIn) {
                dom.show(manageEnginesBtn);
            } else {
                dom.hide(manageEnginesBtn);
            }
        }
    }

    /**
     * 创建模态框HTML
     */
    createModals() {
        // 搜索引擎管理模态框
        const enginesModal = dom.create('div', {
            id: 'engines-modal',
            className: 'modal hidden'
        }, `
            <div class="modal-backdrop"></div>
            <div class="modal-content bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden">
                <!-- 模态框头部 -->
                <div class="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 class="text-lg font-medium text-huawei-text">搜索引擎管理</h3>
                    <button id="close-engines-modal" class="text-gray-400 hover:text-gray-600 p-1">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- 内容区域 -->
                <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <!-- 添加新搜索引擎按钮 -->
                    <div class="mb-6">
                        <button id="add-engine-btn" class="btn btn-primary">
                            <i class="fas fa-plus mr-2"></i>添加搜索引擎
                        </button>
                    </div>
                    
                    <!-- 搜索引擎列表 -->
                    <div class="space-y-4" id="search-engines-list">
                        <!-- 搜索引擎项目将通过JavaScript动态生成 -->
                    </div>
                </div>
            </div>
        `);

        // 添加/编辑搜索引擎模态框
        const engineFormModal = dom.create('div', {
            id: 'engine-form-modal',
            className: 'modal hidden'
        }, `
            <div class="modal-backdrop"></div>
            <div class="modal-content bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                <!-- 模态框头部 -->
                <div class="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 id="engine-modal-title" class="text-lg font-medium text-huawei-text">添加搜索引擎</h3>
                    <button id="close-engine-form-modal" class="text-gray-400 hover:text-gray-600 p-1">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- 表单内容 -->
                <form id="engine-form" class="p-6 space-y-5">
                    <div class="form-group">
                        <label class="form-label">名称标识</label>
                        <input type="text" id="engine-name" class="input" placeholder="baidu" required>
                        <p class="form-help">用于内部标识，建议使用英文</p>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">显示名称</label>
                        <input type="text" id="engine-display-name" class="input" placeholder="百度" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">搜索网址模板</label>
                        <input type="url" id="engine-url-template" class="input" placeholder="https://www.baidu.com/s?wd={query}" required>
                        <p class="form-help">使用 {query} 作为搜索关键词的占位符</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label">图标</label>
                            <input type="text" id="engine-icon" class="input" placeholder="fas fa-search">
                        </div>
                        <div class="form-group">
                            <label class="form-label">颜色</label>
                            <input type="color" id="engine-color" class="input h-12" value="#007DFF">
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-6">
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" id="engine-is-active" checked class="w-4 h-4 text-huawei-blue border-gray-300 rounded focus:ring-huawei-blue">
                            <span class="text-sm text-gray-700">启用</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" id="engine-is-default" class="w-4 h-4 text-huawei-blue border-gray-300 rounded focus:ring-huawei-blue">
                            <span class="text-sm text-gray-700">设为默认</span>
                        </label>
                    </div>
                    
                    <!-- 操作按钮 -->
                    <div class="flex gap-3 pt-4">
                        <button type="submit" class="btn btn-primary flex-1">保存</button>
                        <button type="button" id="cancel-engine-modal" class="btn btn-secondary flex-1">取消</button>
                    </div>
                </form>
            </div>
        `);

        document.body.appendChild(enginesModal);
        document.body.appendChild(engineFormModal);
    }

    /**
     * 加载数据
     */
    async loadData() {
        await this.loadSearchEngines();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 管理按钮点击事件
        events.on(document, 'click', (e) => {
            if (e.target.closest('#manage-engines-btn')) {
                this.showEnginesModal();
            }
        });

        // 添加搜索引擎按钮
        events.on('#add-engine-btn', 'click', () => {
            this.showAddEngineModal();
        });

        // 模态框关闭事件
        events.on('#close-engines-modal', 'click', () => {
            this.hideEnginesModal();
        });

        events.on('#close-engine-form-modal', 'click', () => {
            this.hideEngineFormModal();
        });

        events.on('#cancel-engine-modal', 'click', () => {
            this.hideEngineFormModal();
        });

        // 表单提交事件
        events.on('#engine-form', 'submit', (e) => {
            e.preventDefault();
            this.handleEngineFormSubmit();
        });

        // 模态框背景点击关闭
        events.on('#engines-modal', 'click', (e) => {
            if (e.target.id === 'engines-modal' || e.target.classList.contains('modal-backdrop')) {
                this.hideEnginesModal();
            }
        });

        events.on('#engine-form-modal', 'click', (e) => {
            if (e.target.id === 'engine-form-modal' || e.target.classList.contains('modal-backdrop')) {
                this.hideEngineFormModal();
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
            this.searchEngines = await searchEnginesApi.getSearchEngines(false); // 获取所有搜索引擎
            if (this.isModalOpen) {
                this.renderSearchEnginesList();
            }
        } catch (error) {
            console.error('加载搜索引擎失败:', error);
            showError('加载搜索引擎失败');
        }
    }

    /**
     * 渲染搜索引擎列表
     */
    renderSearchEnginesList() {
        const container = dom.get('#search-engines-list');
        if (!container) return;

        if (this.searchEngines.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-search text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">暂无搜索引擎</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.searchEngines.map(engine => `
            <div class="search-engine-item ${engine.is_default ? 'default' : ''}">
                <div class="search-engine-info">
                    <div class="search-engine-icon" style="background: ${engine.color}20; color: ${engine.color}">
                        <i class="${engine.icon}"></i>
                    </div>
                    <div class="search-engine-details">
                        <div class="search-engine-name">${engine.display_name}</div>
                        <div class="search-engine-url">${engine.url_template}</div>
                        <div class="search-engine-badges">
                            ${engine.is_default ? '<span class="badge badge-default">默认</span>' : ''}
                            ${engine.is_active ? '<span class="badge badge-active">启用</span>' : '<span class="badge badge-inactive">禁用</span>'}
                        </div>
                    </div>
                </div>
                <div class="search-engine-actions">
                    <button onclick="window.searchEngineManager.editSearchEngine(${engine.id})" class="btn btn-primary btn-sm">
                        <i class="fas fa-edit mr-1"></i><span class="hidden sm:inline">编辑</span>
                    </button>
                    ${!engine.is_default ? `
                        <button onclick="window.searchEngineManager.setDefaultEngine(${engine.id})" class="btn btn-success btn-sm">
                            <i class="fas fa-star mr-1"></i><span class="hidden sm:inline">默认</span>
                        </button>
                    ` : ''}
                    <button onclick="window.searchEngineManager.deleteSearchEngine(${engine.id})" class="btn btn-danger btn-sm">
                        <i class="fas fa-trash mr-1"></i><span class="hidden sm:inline">删除</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * 显示搜索引擎管理模态框
     */
    showEnginesModal() {
        // 检查是否已登录
        if (!authService.isLoggedIn()) {
            showError('请先登录后再进行管理操作');
            return;
        }
        
        this.isModalOpen = true;
        dom.show(dom.get('#engines-modal'));
        this.renderSearchEnginesList();
    }

    /**
     * 隐藏搜索引擎管理模态框
     */
    hideEnginesModal() {
        this.isModalOpen = false;
        dom.hide(dom.get('#engines-modal'));
    }

    /**
     * 显示添加搜索引擎模态框
     */
    showAddEngineModal() {
        // 检查是否已登录
        if (!authService.isLoggedIn()) {
            showError('请先登录后再进行管理操作');
            return;
        }
        
        this.currentEditId = null;
        dom.get('#engine-modal-title').textContent = '添加搜索引擎';
        this.clearEngineForm();
        this.showEngineFormModal();
    }

    /**
     * 显示搜索引擎表单模态框
     */
    showEngineFormModal() {
        dom.show(dom.get('#engine-form-modal'));
    }

    /**
     * 隐藏搜索引擎表单模态框
     */
    hideEngineFormModal() {
        dom.hide(dom.get('#engine-form-modal'));
        this.clearEngineForm();
    }

    /**
     * 清空搜索引擎表单
     */
    clearEngineForm() {
        const form = dom.get('#engine-form');
        form.reset();
        dom.get('#engine-color').value = '#007DFF';
        dom.get('#engine-is-active').checked = true;
        dom.get('#engine-is-default').checked = false;
        dom.get('#engine-name').disabled = false;
        this.currentEditId = null;
    }

    /**
     * 编辑搜索引擎
     * @param {number} id 搜索引擎ID
     */
    editSearchEngine(id) {
        const engine = this.searchEngines.find(e => e.id === id);
        if (!engine) return;

        this.currentEditId = id;
        dom.get('#engine-modal-title').textContent = '编辑搜索引擎';
        
        dom.get('#engine-name').value = engine.name;
        dom.get('#engine-display-name').value = engine.display_name;
        dom.get('#engine-url-template').value = engine.url_template;
        dom.get('#engine-icon').value = engine.icon;
        dom.get('#engine-color').value = engine.color;
        dom.get('#engine-is-active').checked = engine.is_active;
        dom.get('#engine-is-default').checked = engine.is_default;
        
        // 编辑时禁用名称字段
        dom.get('#engine-name').disabled = true;
        
        this.showEngineFormModal();
    }

    /**
     * 设置默认搜索引擎
     * @param {number} id 搜索引擎ID
     */
    async setDefaultEngine(id) {
        try {
            await searchEnginesApi.updateSearchEngine(id, { is_default: true });
            await this.loadSearchEngines();
            showSuccess('已设置为默认搜索引擎');
            
            // 触发搜索引擎数据更新事件
            events.emit(document, EVENTS.SEARCH_ENGINES_LOADED);
        } catch (error) {
            console.error('设置默认搜索引擎失败:', error);
            showError(error.message || '设置失败');
        }
    }

    /**
     * 删除搜索引擎
     * @param {number} id 搜索引擎ID
     */
    async deleteSearchEngine(id) {
        if (!confirm('确定删除此搜索引擎？')) return;

        try {
            await searchEnginesApi.deleteSearchEngine(id);
            await this.loadSearchEngines();
            showSuccess('删除成功');
            
            // 触发搜索引擎数据更新事件
            events.emit(document, EVENTS.SEARCH_ENGINES_LOADED);
        } catch (error) {
            console.error('删除搜索引擎失败:', error);
            showError(error.message || '删除失败');
        }
    }

    /**
     * 搜索引擎表单提交
     */
    async handleEngineFormSubmit() {
        const formData = {
            name: dom.get('#engine-name').value.trim(),
            display_name: dom.get('#engine-display-name').value.trim(),
            url_template: dom.get('#engine-url-template').value.trim(),
            icon: dom.get('#engine-icon').value.trim() || 'fas fa-search',
            color: dom.get('#engine-color').value,
            is_active: dom.get('#engine-is-active').checked,
            is_default: dom.get('#engine-is-default').checked
        };

        // 验证表单
        const requiredFields = VALIDATION_RULES.REQUIRED_FIELDS.SEARCH_ENGINE;
        const validationResult = validation.validateRequired(formData, requiredFields);
        
        if (!validationResult.isValid) {
            showError('请填写所有必填字段');
            return;
        }

        if (!validation.isValidUrlTemplate(formData.url_template)) {
            showError('网址模板必须包含 {query} 占位符');
            return;
        }

        try {
            if (this.currentEditId) {
                // 更新搜索引擎
                const updateData = { ...formData };
                delete updateData.name; // 不允许修改名称
                
                await searchEnginesApi.updateSearchEngine(this.currentEditId, updateData);
                showSuccess('更新成功');
            } else {
                // 创建新搜索引擎
                await searchEnginesApi.createSearchEngine(formData);
                showSuccess('添加成功');
            }

            await this.loadSearchEngines();
            this.hideEngineFormModal();
            
            // 触发搜索引擎数据更新事件
            events.emit(document, EVENTS.SEARCH_ENGINES_LOADED);
            
        } catch (error) {
            console.error('操作失败:', error);
            showError(error.message || '操作失败');
        }
    }
} 