/**
 * 快速链接组件
 * 负责快速链接的显示和管理
 */

import { quickLinksApi } from '../services/api.js';
import { showSuccess, showError } from '../services/notification.js';
import { dom, events, getCurrentCategory, setCurrentCategory } from '../utils/helpers.js';
import { EVENTS } from '../utils/constants.js';

/**
 * 快速链接组件类
 */
export class QuickLinks {
    constructor(container) {
        this.container = typeof container === 'string' ? dom.get(container) : container;
        this.quickLinks = [];
        this.categories = [];
        this.currentCategory = getCurrentCategory();
        
        this.init();
    }

    /**
     * 初始化组件
     */
    async init() {
        this.render();
        this.bindEvents();
        await this.loadData();
    }

    /**
     * 渲染组件
     */
    render() {
        this.container.innerHTML = `
            <div class="quick-links-section">
                <!-- 分类筛选 -->
                <div class="mb-6">
                    <div class="flex flex-wrap gap-2 justify-center" id="category-filters">
                        <span class="category-tag active" data-category="all">全部</span>
                    </div>
                </div>
                
                <!-- 快速链接网格 -->
                <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3" id="quick-links-grid">
                    <!-- 快速链接项将通过JavaScript动态生成 -->
                </div>
                
                <!-- 空状态 -->
                <div id="empty-state" class="hidden text-center py-12">
                    <i class="fas fa-link text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">暂无快速链接</p>
                </div>
            </div>
        `;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 分类筛选点击事件
        events.on(this.container, 'click', (e) => {
            if (e.target.classList.contains('category-tag')) {
                const category = e.target.dataset.category;
                this.setCategory(category);
            }
        });

        // 监听数据更新事件
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
            this.quickLinks = await quickLinksApi.getQuickLinks(this.currentCategory);
            this.renderQuickLinks();
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
            this.renderCategories();
        } catch (error) {
            console.error('加载分类失败:', error);
            showError('加载分类失败');
        }
    }

    /**
     * 渲染快速链接
     */
    renderQuickLinks() {
        const grid = dom.get('#quick-links-grid');
        const emptyState = dom.get('#empty-state');
        
        if (!grid) return;

        if (this.quickLinks.length === 0) {
            grid.innerHTML = '';
            dom.show(emptyState);
            return;
        }

        dom.hide(emptyState);
        
        grid.innerHTML = this.quickLinks.map(link => `
            <div class="quick-link-item" data-id="${link.id}">
                <a href="${link.url}" target="_blank" title="${link.name}">
                    <div class="quick-link-icon" style="background: ${link.color}20; color: ${link.color}">
                        ${this.renderIcon(link)}
                    </div>
                    <div class="quick-link-name">${link.name}</div>
                    ${link.category ? `<div class="quick-link-category">${link.category}</div>` : ''}
                </a>
            </div>
        `).join('');
    }

    /**
     * 渲染图标
     * @param {Object} link 链接对象
     * @returns {string} 图标HTML
     */
    renderIcon(link) {
        // 如果有自定义图标，使用自定义图标
        if (link.icon && link.icon !== 'fas fa-globe') {
            return `<i class="${link.icon}"></i>`;
        }

        // 尝试使用网站favicon
        const domain = this.extractDomain(link.url);
        if (domain) {
            return `
                <img src="https://www.google.com/s2/favicons?domain=${domain}&sz=24" 
                     alt="${link.name}" 
                     class="w-5 h-5"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                <i class="fas fa-globe" style="display: none;"></i>
            `;
        }

        // 默认图标
        return `<i class="fas fa-globe"></i>`;
    }

    /**
     * 从URL中提取域名
     * @param {string} url URL地址
     * @returns {string|null} 域名
     */
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch (error) {
            console.warn('无法解析URL:', url);
            return null;
        }
    }

    /**
     * 渲染分类筛选
     */
    renderCategories() {
        const container = dom.get('#category-filters');
        if (!container) return;

        const allCategories = ['all', ...this.categories];
        
        container.innerHTML = allCategories.map(category => {
            const isActive = category === this.currentCategory;
            const displayName = category === 'all' ? '全部' : category;
            
            return `
                <span class="category-tag ${isActive ? 'active' : ''}" 
                      data-category="${category}">
                    ${displayName}
                </span>
            `;
        }).join('');
    }

    /**
     * 设置当前分类
     * @param {string} category 分类名称
     */
    async setCategory(category) {
        if (category === this.currentCategory) return;

        this.currentCategory = category;
        setCurrentCategory(category);

        // 更新分类标签状态
        const categoryTags = dom.getAll('.category-tag');
        categoryTags.forEach(tag => {
            if (tag.dataset.category === category) {
                tag.classList.add('active');
            } else {
                tag.classList.remove('active');
            }
        });

        // 重新加载快速链接
        await this.loadQuickLinks();
        
        // 触发分类变化事件
        events.emit(document, EVENTS.CATEGORY_CHANGED, category);
    }

    /**
     * 获取当前分类
     * @returns {string} 当前分类
     */
    getCurrentCategory() {
        return this.currentCategory;
    }

    /**
     * 刷新数据
     */
    async refresh() {
        await this.loadData();
    }

    /**
     * 添加快速链接
     * @param {Object} linkData 链接数据
     */
    async addQuickLink(linkData) {
        try {
            await quickLinksApi.createQuickLink(linkData);
            await this.loadQuickLinks();
            showSuccess('快速链接添加成功');
        } catch (error) {
            console.error('添加快速链接失败:', error);
            showError(error.message || '添加快速链接失败');
        }
    }

    /**
     * 更新快速链接
     * @param {number} id 链接ID
     * @param {Object} linkData 更新数据
     */
    async updateQuickLink(id, linkData) {
        try {
            await quickLinksApi.updateQuickLink(id, linkData);
            await this.loadQuickLinks();
            showSuccess('快速链接更新成功');
        } catch (error) {
            console.error('更新快速链接失败:', error);
            showError(error.message || '更新快速链接失败');
        }
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
            showSuccess('快速链接删除成功');
        } catch (error) {
            console.error('删除快速链接失败:', error);
            showError(error.message || '删除快速链接失败');
        }
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