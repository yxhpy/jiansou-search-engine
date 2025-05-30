/**
 * 主应用文件
 * 负责初始化和协调各个组件
 */

import { SearchBox } from './components/SearchBox.js';
import { QuickLinks } from './components/QuickLinks.js';
import { SearchEngineManager } from './components/SearchEngineManager.js';
import { QuickLinkManager } from './components/QuickLinkManager.js';
import { WallpaperManager } from './components/WallpaperManager.js';
import { showSuccess, showError } from './services/notification.js';
import { dom, events } from './utils/helpers.js';

/**
 * 应用主类
 */
class App {
    constructor() {
        this.searchBox = null;
        this.quickLinks = null;
        this.searchEngineManager = null;
        this.quickLinkManager = null;
        this.wallpaperManager = null;
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * 初始化应用
     */
    async init() {
        try {
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // 初始化组件
            await this.initializeComponents();
            
            // 绑定全局事件
            this.bindGlobalEvents();
            
            // 设置键盘快捷键
            this.setupKeyboardShortcuts();
            
            this.isInitialized = true;
            console.log('应用初始化完成');
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            showError('应用初始化失败，请刷新页面重试');
        }
    }

    /**
     * 初始化组件
     */
    async initializeComponents() {
        // 初始化搜索框组件
        const searchContainer = dom.get('#search-container');
        if (searchContainer) {
            this.searchBox = new SearchBox(searchContainer);
        }

        // 初始化快速链接组件
        const quickLinksContainer = dom.get('#quick-links-container');
        if (quickLinksContainer) {
            this.quickLinks = new QuickLinks(quickLinksContainer);
        }

        // 初始化管理组件
        this.searchEngineManager = new SearchEngineManager();
        this.quickLinkManager = new QuickLinkManager();
        this.wallpaperManager = new WallpaperManager();

        // 将管理组件挂载到全局对象，供HTML中的onclick事件使用
        window.searchEngineManager = this.searchEngineManager;
        window.quickLinkManager = this.quickLinkManager;
        window.wallpaperManager = this.wallpaperManager;

        // 初始化移动端菜单
        this.initializeMobileMenu();
    }

    /**
     * 初始化移动端菜单
     */
    initializeMobileMenu() {
        const mobileMenuButton = dom.get('#mobile-menu-button');
        const mobileMenu = dom.get('#mobile-menu');

        if (mobileMenuButton && mobileMenu) {
            events.on(mobileMenuButton, 'click', () => {
                dom.toggle(mobileMenu);
            });

            // 点击外部关闭菜单
            events.on(document, 'click', (e) => {
                if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
                    dom.hide(mobileMenu);
                }
            });
        }
    }

    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // 监听窗口大小变化
        events.on(window, 'resize', this.handleResize.bind(this));

        // 监听在线/离线状态
        events.on(window, 'online', () => {
            showSuccess('网络连接已恢复');
        });

        events.on(window, 'offline', () => {
            showError('网络连接已断开');
        });

        // 监听页面可见性变化
        events.on(document, 'visibilitychange', () => {
            if (!document.hidden && this.isInitialized) {
                // 页面重新可见时，可以刷新数据
                this.refreshData();
            }
        });

        // 监听搜索框状态变化，调整快速链接位置
        this.setupQuickLinksPositioning();
    }

    /**
     * 设置快速链接位置调整
     */
    setupQuickLinksPositioning() {
        const quickLinksSection = dom.get('#quick-links-section');
        if (!quickLinksSection) return;

        // 监听搜索框焦点状态
        events.on(document, 'focusin', (e) => {
            if (e.target.id === 'search-input') {
                // 搜索框获得焦点时，快速链接下降
                quickLinksSection.style.transform = 'translateY(20px)';
                quickLinksSection.style.opacity = '0.8';
            }
        });

        events.on(document, 'focusout', (e) => {
            if (e.target.id === 'search-input') {
                // 延迟检查，避免快速切换焦点时的闪烁
                setTimeout(() => {
                    const searchInput = dom.get('#search-input');
                    if (searchInput && !searchInput.matches(':focus') && !searchInput.value.trim()) {
                        // 搜索框失去焦点且无内容时，快速链接回到原位
                        quickLinksSection.style.transform = 'translateY(0)';
                        quickLinksSection.style.opacity = '1';
                    }
                }, 100);
            }
        });

        // 监听搜索框输入状态
        events.on(document, 'input', (e) => {
            if (e.target.id === 'search-input') {
                const hasContent = e.target.value.trim().length > 0;
                if (hasContent) {
                    // 有输入内容时保持下降状态
                    quickLinksSection.style.transform = 'translateY(20px)';
                    quickLinksSection.style.opacity = '0.8';
                } else {
                    // 无内容时检查是否有焦点
                    if (!e.target.matches(':focus')) {
                        quickLinksSection.style.transform = 'translateY(0)';
                        quickLinksSection.style.opacity = '1';
                    }
                }
            }
        });
    }

    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
        events.on(document, 'keydown', (e) => {
            // Ctrl/Cmd + K: 聚焦搜索框
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (this.searchBox) {
                    this.searchBox.focus();
                }
            }

            // ESC: 清空搜索框
            if (e.key === 'Escape') {
                if (this.searchBox) {
                    this.searchBox.setQuery('');
                    this.searchBox.focus();
                }
            }

            // F5: 刷新数据
            if (e.key === 'F5' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                this.refreshData();
            }

            // W: 切换壁纸
            if (e.key === 'w' || e.key === 'W') {
                // 确保不是在输入框中按的W键
                if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
                    e.preventDefault();
                    if (this.wallpaperManager) {
                        this.wallpaperManager.changeWallpaper();
                    }
                }
            }
        });
    }

    /**
     * 处理窗口大小变化
     */
    handleResize() {
        // 可以在这里处理响应式布局调整
        const isMobile = window.innerWidth < 768;
        
        // 移动端自动关闭菜单
        if (!isMobile) {
            const mobileMenu = dom.get('#mobile-menu');
            if (mobileMenu) {
                dom.hide(mobileMenu);
            }
        }
    }

    /**
     * 刷新数据
     */
    async refreshData() {
        try {
            const promises = [];
            
            if (this.searchBox) {
                promises.push(this.searchBox.loadSearchEngines());
            }
            
            if (this.quickLinks) {
                promises.push(this.quickLinks.refresh());
            }

            if (this.searchEngineManager) {
                promises.push(this.searchEngineManager.loadSearchEngines());
            }

            if (this.quickLinkManager) {
                promises.push(this.quickLinkManager.loadData());
            }

            if (this.wallpaperManager) {
                promises.push(this.wallpaperManager.loadData());
            }

            await Promise.all(promises);
            showSuccess('数据刷新成功');
            
        } catch (error) {
            console.error('刷新数据失败:', error);
            showError('刷新数据失败');
        }
    }

    /**
     * 获取搜索框组件
     * @returns {SearchBox} 搜索框组件实例
     */
    getSearchBox() {
        return this.searchBox;
    }

    /**
     * 获取快速链接组件
     * @returns {QuickLinks} 快速链接组件实例
     */
    getQuickLinks() {
        return this.quickLinks;
    }

    /**
     * 获取搜索引擎管理组件
     * @returns {SearchEngineManager} 搜索引擎管理组件实例
     */
    getSearchEngineManager() {
        return this.searchEngineManager;
    }

    /**
     * 获取快速链接管理组件
     * @returns {QuickLinkManager} 快速链接管理组件实例
     */
    getQuickLinkManager() {
        return this.quickLinkManager;
    }

    /**
     * 获取壁纸管理组件
     * @returns {WallpaperManager} 壁纸管理组件实例
     */
    getWallpaperManager() {
        return this.wallpaperManager;
    }

    /**
     * 检查应用是否已初始化
     * @returns {boolean} 是否已初始化
     */
    isReady() {
        return this.isInitialized;
    }
}

// 创建全局应用实例
const app = new App();

// 导出应用实例供其他模块使用
export default app;

// 将应用实例挂载到全局对象，方便调试
if (typeof window !== 'undefined') {
    window.app = app;
} 