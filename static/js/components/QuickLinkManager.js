/**
 * 快速链接管理组件
 * 负责快速链接的增删改查功能
 */

import { quickLinksApi } from '../services/api.js';
import { showSuccess, showError } from '../services/notification.js';
import { dom, events, validation } from '../utils/helpers.js';
import { EVENTS, VALIDATION_RULES } from '../utils/constants.js';
import { authService } from '../services/auth.js';

/**
 * 快速链接管理组件类
 */
export class QuickLinkManager {
    constructor() {
        this.quickLinks = [];
        this.categories = [];
        this.currentEditId = null;
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
            this.exitEditMode(); // 退出编辑模式
        });
    }

    /**
     * 根据认证状态更新UI
     */
    updateUIBasedOnAuth() {
        const isLoggedIn = authService.isLoggedIn();
        
        // 显示/隐藏管理按钮
        const addLinkBtn = dom.get('#add-link-btn');
        const editModeBtn = dom.get('#edit-mode-btn');
        
        if (addLinkBtn) {
            if (isLoggedIn) {
                dom.show(addLinkBtn);
            } else {
                dom.hide(addLinkBtn);
            }
        }
        
        if (editModeBtn) {
            if (isLoggedIn) {
                dom.show(editModeBtn);
            } else {
                dom.hide(editModeBtn);
            }
        }
        
        // 如果未登录，退出编辑模式
        if (!isLoggedIn && this.editMode) {
            this.exitEditMode();
        }
    }

    /**
     * 退出编辑模式
     */
    exitEditMode() {
        if (this.editMode) {
            this.editMode = false;
            const editBtn = dom.get('#edit-mode-btn');
            const quickLinkItems = dom.getAll('.quick-link-item');
            
            if (editBtn) {
                editBtn.innerHTML = '<i class="fas fa-edit text-xs sm:text-sm"></i>';
                editBtn.classList.remove('bg-green-500', 'text-white', 'hover:bg-green-600');
                editBtn.classList.add('text-gray-500', 'hover:text-huawei-blue', 'hover:bg-gray-50');
            }
            
            // 移除编辑按钮并恢复链接功能
            quickLinkItems.forEach(item => {
                const editControls = item.querySelector('.edit-controls');
                if (editControls) {
                    editControls.remove();
                }
                
                // 恢复链接点击事件
                const linkElement = item.querySelector('a');
                if (linkElement) {
                    linkElement.style.pointerEvents = 'auto';
                }
            });
        }
    }

    /**
     * 创建模态框HTML
     */
    createModals() {
        // 快速链接表单模态框
        const linkFormModal = dom.create('div', {
            id: 'link-form-modal',
            className: 'modal hidden'
        }, `
            <div class="modal-backdrop"></div>
            <div class="modal-content bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                <!-- 模态框头部 -->
                <div class="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 id="link-modal-title" class="text-lg font-medium text-huawei-text">添加快速链接</h3>
                    <button id="close-link-form-modal" class="text-gray-400 hover:text-gray-600 p-1">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- 表单内容 -->
                <form id="link-form" class="p-6 space-y-5">
                    <div class="form-group">
                        <label class="form-label">名称</label>
                        <input type="text" id="link-name" class="input" placeholder="网站名称" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">网址</label>
                        <input type="url" id="link-url" class="input" placeholder="https://example.com" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">分类</label>
                        <select id="link-category" class="input select">
                            <option value="">选择分类</option>
                        </select>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="form-label">图标</label>
                            <div class="relative">
                                <input type="text" id="link-icon" class="input pr-12" placeholder="fas fa-globe">
                                <div id="icon-preview" class="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400">
                                    <i class="fas fa-globe"></i>
                                </div>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">留空将自动根据网站获取图标</p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">颜色</label>
                            <input type="color" id="link-color" class="input h-12" value="#007DFF">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">描述</label>
                        <textarea id="link-description" class="input" rows="3" placeholder="网站描述（可选）"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" id="link-is-active" checked class="w-4 h-4 text-huawei-blue border-gray-300 rounded focus:ring-huawei-blue">
                            <span class="text-sm text-gray-700">启用</span>
                        </label>
                    </div>
                    
                    <!-- 操作按钮 -->
                    <div class="flex gap-3 pt-4">
                        <button type="submit" class="btn btn-primary flex-1">保存</button>
                        <button type="button" id="cancel-link-modal" class="btn btn-secondary flex-1">取消</button>
                    </div>
                </form>
            </div>
        `);

        document.body.appendChild(linkFormModal);
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 添加链接按钮点击事件
        events.on(document, 'click', (e) => {
            if (e.target.closest('#add-link-btn')) {
                this.showAddLinkModal();
            }
            
            // 管理模式切换
            if (e.target.closest('#edit-mode-btn')) {
                this.toggleEditMode();
            }

            // 处理编辑控制按钮点击
            const editButton = e.target.closest('[data-action="edit"]');
            const deleteButton = e.target.closest('[data-action="delete"]');
            
            if (editButton) {
                e.preventDefault();
                e.stopPropagation();
                const linkId = parseInt(editButton.dataset.id);
                this.editQuickLink(linkId);
            }
            
            if (deleteButton) {
                e.preventDefault();
                e.stopPropagation();
                const linkId = parseInt(deleteButton.dataset.id);
                this.deleteQuickLink(linkId);
            }
        });

        // 模态框关闭事件
        events.on('#close-link-form-modal', 'click', () => {
            this.hideLinkFormModal();
        });

        events.on('#cancel-link-modal', 'click', () => {
            this.hideLinkFormModal();
        });

        // 表单提交事件
        events.on('#link-form', 'submit', (e) => {
            e.preventDefault();
            this.handleLinkFormSubmit();
        });

        // URL输入框变化时自动填充图标
        events.on('#link-url', 'blur', async (e) => {
            const url = e.target.value.trim();
            const iconInput = dom.get('#link-icon');
            
            // 如果图标输入框为空且URL有效，自动填充图标
            if (url && !iconInput.value.trim()) {
                try {
                    const autoIcon = await this.getAutoIcon(url);
                    iconInput.value = autoIcon;
                    
                    // 显示预览
                    this.updateIconPreview(autoIcon);
                } catch (error) {
                    console.warn('自动获取图标失败:', error);
                }
            }
        });

        // 图标输入框变化时更新预览
        events.on('#link-icon', 'input', (e) => {
            this.updateIconPreview(e.target.value);
        });

        // 模态框背景点击关闭
        events.on('#link-form-modal', 'click', (e) => {
            if (e.target.id === 'link-form-modal' || e.target.classList.contains('modal-backdrop')) {
                this.hideLinkFormModal();
            }
        });

        // 监听快速链接数据更新
        events.on(document, EVENTS.QUICK_LINKS_LOADED, () => {
            this.loadQuickLinks();
        });

        events.on(document, EVENTS.CATEGORIES_LOADED, () => {
            this.loadCategories();
        });
    }

    /**
     * 加载数据
     */
    async loadData() {
        await Promise.all([
            this.loadQuickLinks(),
            this.loadCategories()
        ]);
    }

    /**
     * 加载快速链接
     */
    async loadQuickLinks() {
        try {
            this.quickLinks = await quickLinksApi.getQuickLinks();
        } catch (error) {
            console.error('加载快速链接失败:', error);
            showError('加载快速链接失败');
        }
    }

    /**
     * 加载分类列表
     */
    async loadCategories() {
        try {
            this.categories = await quickLinksApi.getCategories();
            this.renderCategorySelect();
        } catch (error) {
            console.error('加载分类失败:', error);
            showError('加载分类失败');
        }
    }

    /**
     * 渲染分类选择器
     */
    renderCategorySelect() {
        const select = dom.get('#link-category');
        if (!select) return;

        select.innerHTML = `
            <option value="">选择分类</option>
            ${this.categories.map(category => `
                <option value="${category}">${category}</option>
            `).join('')}
        `;
    }

    /**
     * 切换编辑模式
     */
    toggleEditMode() {
        // 检查是否已登录
        if (!authService.isLoggedIn()) {
            showError('请先登录后再进行管理操作');
            return;
        }
        
        this.editMode = !this.editMode;
        const editBtn = dom.get('#edit-mode-btn');
        const quickLinkItems = dom.getAll('.quick-link-item');

        if (this.editMode) {
            editBtn.innerHTML = '<i class="fas fa-check mr-1 md:mr-2 text-xs"></i><span class="hidden sm:inline">完成</span>';
            editBtn.classList.remove('bg-gray-100', 'text-gray-600', 'hover:bg-gray-200');
            editBtn.classList.add('bg-green-500', 'text-white', 'hover:bg-green-600');
            
            // 为每个快速链接添加编辑按钮
            quickLinkItems.forEach(item => {
                if (!item.querySelector('.edit-controls')) {
                    const linkId = item.dataset.id;
                    const editControls = dom.create('div', {
                        className: 'edit-controls absolute top-1 right-1 flex gap-1 z-10'
                    }, `
                        <button type="button" data-action="edit" data-id="${linkId}" class="w-6 h-6 bg-blue-500 text-white rounded-full text-xs hover:bg-blue-600 flex items-center justify-center transition-colors">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" data-action="delete" data-id="${linkId}" class="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center transition-colors">
                            <i class="fas fa-trash"></i>
                        </button>
                    `);
                    item.appendChild(editControls);
                    
                    // 阻止链接点击事件在编辑模式下触发
                    const linkElement = item.querySelector('a');
                    if (linkElement) {
                        linkElement.style.pointerEvents = 'none';
                    }
                }
            });
        } else {
            editBtn.innerHTML = '<i class="fas fa-edit mr-1 md:mr-2 text-xs"></i><span class="hidden sm:inline">管理</span>';
            editBtn.classList.remove('bg-green-500', 'text-white', 'hover:bg-green-600');
            editBtn.classList.add('bg-gray-100', 'text-gray-600', 'hover:bg-gray-200');
            
            // 移除编辑按钮并恢复链接功能
            quickLinkItems.forEach(item => {
                const editControls = item.querySelector('.edit-controls');
                if (editControls) {
                    editControls.remove();
                }
                
                // 恢复链接点击事件
                const linkElement = item.querySelector('a');
                if (linkElement) {
                    linkElement.style.pointerEvents = 'auto';
                }
            });
        }
    }

    /**
     * 显示添加链接模态框
     */
    showAddLinkModal() {
        // 检查是否已登录
        if (!authService.isLoggedIn()) {
            showError('请先登录后再进行管理操作');
            return;
        }
        
        this.currentEditId = null;
        dom.get('#link-modal-title').textContent = '添加快速链接';
        this.clearLinkForm();
        this.showLinkFormModal();
    }

    /**
     * 显示链接表单模态框
     */
    showLinkFormModal() {
        dom.show(dom.get('#link-form-modal'));
    }

    /**
     * 隐藏链接表单模态框
     */
    hideLinkFormModal() {
        dom.hide(dom.get('#link-form-modal'));
        this.clearLinkForm();
    }

    /**
     * 清空链接表单
     */
    clearLinkForm() {
        const form = dom.get('#link-form');
        form.reset();
        dom.get('#link-color').value = '#007DFF';
        dom.get('#link-is-active').checked = true;
        this.currentEditId = null;
        
        // 重置图标预览
        this.updateIconPreview('');
    }

    /**
     * 编辑快速链接
     * @param {number} id 链接ID
     */
    editQuickLink(id) {
        const link = this.quickLinks.find(l => l.id === id);
        if (!link) return;

        this.currentEditId = id;
        dom.get('#link-modal-title').textContent = '编辑快速链接';
        
        dom.get('#link-name').value = link.name;
        dom.get('#link-url').value = link.url;
        dom.get('#link-category').value = link.category || '';
        dom.get('#link-icon').value = link.icon;
        dom.get('#link-color').value = link.color;
        dom.get('#link-description').value = link.description || '';
        dom.get('#link-is-active').checked = link.is_active;
        
        // 更新图标预览
        this.updateIconPreview(link.icon);
        
        this.showLinkFormModal();
    }

    /**
     * 删除快速链接
     * @param {number} id 链接ID
     */
    async deleteQuickLink(id) {
        if (!confirm('确定删除此快速链接？')) return;

        try {
            await quickLinksApi.deleteQuickLink(id);
            await this.loadQuickLinks();
            showSuccess('删除成功');
            
            // 触发快速链接数据更新事件
            events.emit(document, EVENTS.QUICK_LINKS_LOADED);
        } catch (error) {
            console.error('删除快速链接失败:', error);
            showError(error.message || '删除失败');
        }
    }

    /**
     * 链接表单提交
     */
    async handleLinkFormSubmit() {
        const formData = {
            name: dom.get('#link-name').value.trim(),
            url: dom.get('#link-url').value.trim(),
            category: dom.get('#link-category').value.trim() || null,
            icon: dom.get('#link-icon').value.trim() || await this.getAutoIcon(dom.get('#link-url').value.trim()),
            color: dom.get('#link-color').value,
            description: dom.get('#link-description').value.trim() || null,
            is_active: dom.get('#link-is-active').checked
        };

        // 验证表单
        const requiredFields = VALIDATION_RULES.REQUIRED_FIELDS.QUICK_LINK;
        const validationResult = validation.validateRequired(formData, requiredFields);
        
        if (!validationResult.isValid) {
            showError('请填写所有必填字段');
            return;
        }

        if (!validation.isValidUrl(formData.url)) {
            showError('请输入有效的网址');
            return;
        }

        try {
            if (this.currentEditId) {
                // 更新快速链接
                await quickLinksApi.updateQuickLink(this.currentEditId, formData);
                showSuccess('更新成功');
            } else {
                // 创建新快速链接
                await quickLinksApi.createQuickLink(formData);
                showSuccess('添加成功');
            }

            await this.loadQuickLinks();
            this.hideLinkFormModal();
            
            // 触发快速链接数据更新事件
            events.emit(document, EVENTS.QUICK_LINKS_LOADED);
            
        } catch (error) {
            console.error('操作失败:', error);
            showError(error.message || '操作失败');
        }
    }

    /**
     * 更新图标预览
     * @param {string} iconClass 图标类名
     */
    updateIconPreview(iconClass) {
        const preview = dom.get('#icon-preview');
        if (preview) {
            const icon = iconClass.trim() || 'fas fa-globe';
            preview.innerHTML = `<i class="${icon}"></i>`;
        }
    }

    /**
     * 自动获取网站图标
     * @param {string} url 网站URL
     * @returns {string} 图标类名或默认图标
     */
    async getAutoIcon(url) {
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.toLowerCase();
            
            // 常见网站的图标映射
            const iconMap = {
                'baidu.com': 'fab fa-baidu',
                'google.com': 'fab fa-google',
                'github.com': 'fab fa-github',
                'youtube.com': 'fab fa-youtube',
                'twitter.com': 'fab fa-twitter',
                'facebook.com': 'fab fa-facebook',
                'instagram.com': 'fab fa-instagram',
                'linkedin.com': 'fab fa-linkedin',
                'weibo.com': 'fab fa-weibo',
                'qq.com': 'fab fa-qq',
                'wechat.com': 'fab fa-weixin',
                'taobao.com': 'fas fa-shopping-cart',
                'tmall.com': 'fas fa-shopping-cart',
                'jd.com': 'fas fa-shopping-cart',
                'amazon.com': 'fab fa-amazon',
                'netflix.com': 'fas fa-film',
                'spotify.com': 'fab fa-spotify',
                'apple.com': 'fab fa-apple',
                'microsoft.com': 'fab fa-microsoft',
                'stackoverflow.com': 'fab fa-stack-overflow',
                'reddit.com': 'fab fa-reddit',
                'discord.com': 'fab fa-discord',
                'slack.com': 'fab fa-slack',
                'zhihu.com': 'fas fa-question-circle',
                'bilibili.com': 'fas fa-play-circle',
                'douyin.com': 'fas fa-music',
                'tiktok.com': 'fab fa-tiktok'
            };
            
            // 检查是否有匹配的图标
            for (const [siteDomain, icon] of Object.entries(iconMap)) {
                if (domain.includes(siteDomain)) {
                    return icon;
                }
            }
            
            // 根据网站类型推断图标
            if (domain.includes('shop') || domain.includes('mall') || domain.includes('store')) {
                return 'fas fa-shopping-cart';
            }
            if (domain.includes('news') || domain.includes('media')) {
                return 'fas fa-newspaper';
            }
            if (domain.includes('video') || domain.includes('tv')) {
                return 'fas fa-video';
            }
            if (domain.includes('music') || domain.includes('audio')) {
                return 'fas fa-music';
            }
            if (domain.includes('game')) {
                return 'fas fa-gamepad';
            }
            if (domain.includes('edu') || domain.includes('school') || domain.includes('university')) {
                return 'fas fa-graduation-cap';
            }
            if (domain.includes('bank') || domain.includes('finance')) {
                return 'fas fa-university';
            }
            if (domain.includes('mail') || domain.includes('email')) {
                return 'fas fa-envelope';
            }
            if (domain.includes('cloud') || domain.includes('drive')) {
                return 'fas fa-cloud';
            }
            if (domain.includes('doc') || domain.includes('office')) {
                return 'fas fa-file-alt';
            }
            
        } catch (error) {
            console.warn('无法解析URL获取自动图标:', error);
        }
        
        // 默认图标
        return 'fas fa-globe';
    }

    /**
     * 获取快速链接数据
     * @returns {Array} 快速链接列表
     */
    getQuickLinks() {
        return this.quickLinks;
    }

    /**
     * 获取分类数据
     * @returns {Array} 分类列表
     */
    getCategories() {
        return this.categories;
    }
} 