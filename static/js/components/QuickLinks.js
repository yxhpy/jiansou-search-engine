/**
 * 快速链接组件
 * 负责快速链接的显示和管理，支持虚拟滚动和分页滑动
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
        
        // 响应式配置 - 必须先初始化
        this.breakpoints = {
            mobile: 480,
            tablet: 768,
            desktop: 1024,
            large: 1440
        };
        
        // 虚拟滚动配置
        this.itemsPerPage = this.calculateItemsPerPage();
        this.currentPage = 0;
        this.totalPages = 0;
        this.visibleItems = [];
        
        // 滑动相关
        this.startX = 0;
        this.currentX = 0;
        this.isDragging = false;
        this.threshold = 50; // 滑动阈值
        
        this.init();
    }

    /**
     * 计算每页显示的项目数量
     */
    calculateItemsPerPage() {
        const width = window.innerWidth;
        let cols, rows;
        
        if (width <= this.breakpoints.mobile) {
            cols = 4;
            rows = 3;
        } else if (width <= this.breakpoints.tablet) {
            cols = 6;
            rows = 3;
        } else if (width <= this.breakpoints.desktop) {
            cols = 8;
            rows = 3;
        } else if (width <= this.breakpoints.large) {
            cols = 10;
            rows = 3;
        } else {
            cols = 8;
            rows = 3;
        }
        
        return cols * rows;
    }

    /**
     * 初始化组件
     */
    async init() {
        this.render();
        this.bindEvents();
        await this.loadData();
        
        // 监听窗口大小变化
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    /**
     * 处理窗口大小变化
     */
    handleResize() {
        const newItemsPerPage = this.calculateItemsPerPage();
        if (newItemsPerPage !== this.itemsPerPage) {
            this.itemsPerPage = newItemsPerPage;
            this.updatePagination();
            this.renderCurrentPage();
        }
    }

    /**
     * 渲染组件
     */
    render() {
        this.container.innerHTML = `
            <div class="quick-links-section">
                <!-- 分类筛选 -->
                <div class="mb-6">
                    <div class="flex gap-2 justify-center overflow-x-auto whitespace-nowrap md:flex-wrap md:justify-center" id="category-filters">
                        <span class="category-tag active" data-category="all">全部</span>
                    </div>
                </div>
                
                <!-- 快速链接容器 -->
                <div class="quick-links-viewport" id="quick-links-viewport">
                    <!-- 快速链接滑动容器 -->
                    <div class="quick-links-slider" id="quick-links-slider">
                        <div class="quick-links-page" id="quick-links-page">
                            <!-- 快速链接项将通过JavaScript动态生成 -->
                        </div>
                    </div>
                </div>
                
                <!-- 页面指示器 -->
                <div class="page-indicators" id="page-indicators"></div>
                
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



        // 触摸滑动事件
        const viewport = dom.get('#quick-links-viewport');
        if (viewport) {
            // 触摸事件
            events.on(viewport, 'touchstart', this.handleTouchStart.bind(this));
            events.on(viewport, 'touchmove', this.handleTouchMove.bind(this));
            events.on(viewport, 'touchend', this.handleTouchEnd.bind(this));
            
            // 鼠标滚轮事件
            events.on(viewport, 'wheel', this.handleWheel.bind(this));
        }

        // 键盘导航
        events.on(document, 'keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.previousPage();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextPage();
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
     * 触摸开始
     */
    handleTouchStart(e) {
        this.startX = e.touches[0].clientX;
        this.isDragging = true;
    }

    /**
     * 触摸移动
     */
    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        this.currentX = e.touches[0].clientX;
        const deltaX = this.currentX - this.startX;
        
        // 添加视觉反馈
        const slider = dom.get('#quick-links-slider');
        if (slider) {
            slider.style.transform = `translateX(${deltaX * 0.3}px)`;
        }
    }

    /**
     * 触摸结束
     */
    handleTouchEnd(e) {
        if (!this.isDragging) return;
        
        const deltaX = this.currentX - this.startX;
        const slider = dom.get('#quick-links-slider');
        
        if (slider) {
            slider.style.transform = '';
        }
        
        if (Math.abs(deltaX) > this.threshold) {
            if (deltaX > 0) {
                this.previousPage();
            } else {
                this.nextPage();
            }
        }
        
        this.isDragging = false;
    }

    /**
     * 鼠标滚轮事件
     */
    handleWheel(e) {
        e.preventDefault();
        
        // 防抖处理
        if (this.wheelTimeout) {
            clearTimeout(this.wheelTimeout);
        }
        
        this.wheelTimeout = setTimeout(() => {
            if (e.deltaY > 0) {
                // 向下滚动，下一页
                this.nextPage();
            } else {
                // 向上滚动，上一页
                this.previousPage();
            }
        }, 50);
    }

    /**
     * 上一页
     */
    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.renderCurrentPageWithAnimation('prev');
            this.updatePageIndicators();
        }
    }

    /**
     * 下一页
     */
    nextPage() {
        if (this.currentPage < this.totalPages - 1) {
            this.currentPage++;
            this.renderCurrentPageWithAnimation('next');
            this.updatePageIndicators();
        }
    }

    /**
     * 跳转到指定页面
     */
    goToPage(pageIndex) {
        if (pageIndex >= 0 && pageIndex < this.totalPages && pageIndex !== this.currentPage) {
            const direction = pageIndex > this.currentPage ? 'next' : 'prev';
            this.currentPage = pageIndex;
            this.renderCurrentPageWithAnimation(direction);
            this.updatePageIndicators();
        }
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
            this.updatePagination();
            this.renderCurrentPage();
            this.updatePageIndicators();
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
     * 更新分页信息
     */
    updatePagination() {
        this.totalPages = Math.ceil(this.quickLinks.length / this.itemsPerPage);
        this.currentPage = Math.min(this.currentPage, Math.max(0, this.totalPages - 1));
        
        // 调试信息
        console.log(`分页信息: 总链接数=${this.quickLinks.length}, 每页显示=${this.itemsPerPage}, 总页数=${this.totalPages}, 当前页=${this.currentPage}`);
    }

    /**
     * 渲染当前页面
     */
    renderCurrentPage() {
        const page = dom.get('#quick-links-page');
        const emptyState = dom.get('#empty-state');
        const viewport = dom.get('#quick-links-viewport');
        
        if (!page) return;

        if (this.quickLinks.length === 0) {
            page.innerHTML = '';
            dom.show(emptyState);
            dom.hide(viewport);
            return;
        }

        dom.hide(emptyState);
        dom.show(viewport);
        
        // 计算当前页面的项目
        const startIndex = this.currentPage * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.quickLinks.length);
        this.visibleItems = this.quickLinks.slice(startIndex, endIndex);
        
        // 计算网格列数
        const cols = this.getGridColumns();
        
        page.className = `quick-links-page grid gap-4 grid-cols-${cols}`;
        page.innerHTML = this.visibleItems.map(link => `
            <div class="quick-link-item" data-id="${link.id}">
                <a href="${link.url}" target="_blank" title="${link.name}">
                    <div class="quick-link-icon" style="color: ${link.color}">
                        ${this.renderIcon(link)}
                    </div>
                    <div class="quick-link-name">${link.name}</div>
                </a>
            </div>
        `).join('');
    }

    /**
     * 带动画的页面渲染
     */
    renderCurrentPageWithAnimation(direction = 'next') {
        const page = dom.get('#quick-links-page');
        const emptyState = dom.get('#empty-state');
        const viewport = dom.get('#quick-links-viewport');
        
        if (!page) return;

        if (this.quickLinks.length === 0) {
            page.innerHTML = '';
            dom.show(emptyState);
            dom.hide(viewport);
            return;
        }

        dom.hide(emptyState);
        dom.show(viewport);
        
        // 添加退出动画
        page.style.opacity = '0';
        page.style.transform = direction === 'next' ? 'translateY(-20px)' : 'translateY(20px)';
        
        setTimeout(() => {
            // 计算当前页面的项目
            const startIndex = this.currentPage * this.itemsPerPage;
            const endIndex = Math.min(startIndex + this.itemsPerPage, this.quickLinks.length);
            this.visibleItems = this.quickLinks.slice(startIndex, endIndex);
            
            // 计算网格列数
            const cols = this.getGridColumns();
            
            page.className = `quick-links-page grid gap-4 grid-cols-${cols}`;
            page.innerHTML = this.visibleItems.map(link => `
                <div class="quick-link-item" data-id="${link.id}">
                    <a href="${link.url}" target="_blank" title="${link.name}">
                        <div class="quick-link-icon" style="color: ${link.color}">
                            ${this.renderIcon(link)}
                        </div>
                        <div class="quick-link-name">${link.name}</div>
                    </a>
                </div>
            `).join('');
            
            // 设置进入动画的初始状态
            page.style.transform = direction === 'next' ? 'translateY(20px)' : 'translateY(-20px)';
            
            // 触发进入动画
            setTimeout(() => {
                page.style.opacity = '1';
                page.style.transform = 'translateY(0)';
            }, 50);
        }, 150);
    }

    /**
     * 获取网格列数
     */
    getGridColumns() {
        const width = window.innerWidth;
        
        if (width <= this.breakpoints.mobile) {
            return 4;
        } else if (width <= this.breakpoints.tablet) {
            return 6;
        } else if (width <= this.breakpoints.desktop) {
            return 8;
        } else if (width <= this.breakpoints.large) {
            return 10;
        } else {
            return 8;
        }
    }

    /**
     * 更新页面指示器
     */
    updatePageIndicators() {
        const indicators = dom.get('#page-indicators');
        if (!indicators || this.totalPages <= 1) {
            indicators.innerHTML = '';
            return;
        }

        indicators.innerHTML = Array.from({ length: this.totalPages }, (_, index) => `
            <button class="page-indicator ${index === this.currentPage ? 'active' : ''}" 
                    data-page="${index}" 
                    title="第 ${index + 1} 页">
            </button>
        `).join('');

        // 绑定指示器点击事件
        events.on(indicators, 'click', (e) => {
            if (e.target.classList.contains('page-indicator')) {
                const pageIndex = parseInt(e.target.dataset.page);
                this.goToPage(pageIndex);
            }
        });
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
                <span class="category-tag ${isActive ? 'active' : ''}" data-category="${category}">
                    ${displayName}
                </span>
            `;
        }).join('');
    }

    /**
     * 设置分类
     * @param {string} category 分类名称
     */
    async setCategory(category) {
        if (category === this.currentCategory) return;

        this.currentCategory = category;
        setCurrentCategory(category);
        
        // 更新分类标签状态
        const tags = this.container.querySelectorAll('.category-tag');
        tags.forEach(tag => {
            if (tag.dataset.category === category) {
                tag.classList.add('active');
            } else {
                tag.classList.remove('active');
            }
        });

        // 重置到第一页
        this.currentPage = 0;
        
        // 重新加载数据
        await this.loadQuickLinks();
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
            const newLink = await quickLinksApi.addQuickLink(linkData);
            await this.refresh();
            showSuccess('快速链接添加成功');
            return newLink;
        } catch (error) {
            console.error('添加快速链接失败:', error);
            showError('添加快速链接失败');
            throw error;
        }
    }

    /**
     * 更新快速链接
     * @param {number} id 链接ID
     * @param {Object} linkData 链接数据
     */
    async updateQuickLink(id, linkData) {
        try {
            const updatedLink = await quickLinksApi.updateQuickLink(id, linkData);
            await this.refresh();
            showSuccess('快速链接更新成功');
            return updatedLink;
        } catch (error) {
            console.error('更新快速链接失败:', error);
            showError('更新快速链接失败');
            throw error;
        }
    }

    /**
     * 删除快速链接
     * @param {number} id 链接ID
     */
    async deleteQuickLink(id) {
        try {
            await quickLinksApi.deleteQuickLink(id);
            await this.refresh();
            showSuccess('快速链接删除成功');
        } catch (error) {
            console.error('删除快速链接失败:', error);
            showError('删除快速链接失败');
            throw error;
        }
    }

    /**
     * 获取快速链接列表
     * @returns {Array} 快速链接列表
     */
    getQuickLinks() {
        return this.quickLinks;
    }

    /**
     * 获取分类列表
     * @returns {Array} 分类列表
     */
    getCategories() {
        return this.categories;
    }

    /**
     * 获取分页信息
     * @returns {Object} 分页信息
     */
    getPaginationInfo() {
        return {
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            itemsPerPage: this.itemsPerPage,
            totalItems: this.quickLinks.length
        };
    }
}