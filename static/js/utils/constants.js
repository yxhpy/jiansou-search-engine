/**
 * 应用常量定义
 */

// API 端点
export const API_ENDPOINTS = {
    QUICK_LINKS: '/api/quick-links',
    SEARCH_ENGINES: '/api/search-engines',
    SEARCH: '/api/search',
    SEARCH_HISTORY: '/api/search-history',
    CATEGORIES: '/api/quick-links/categories'
};

// 默认配置
export const DEFAULT_CONFIG = {
    SEARCH_ENGINE: 'baidu',
    NOTIFICATION_DURATION: 3000,
    ANIMATION_DURATION: 300
};

// 事件名称
export const EVENTS = {
    SEARCH_ENGINES_LOADED: 'searchEnginesLoaded',
    QUICK_LINKS_LOADED: 'quickLinksLoaded',
    CATEGORIES_LOADED: 'categoriesLoaded',
    SEARCH_ENGINE_CHANGED: 'searchEngineChanged',
    CATEGORY_CHANGED: 'categoryChanged'
};

// 本地存储键名
export const STORAGE_KEYS = {
    CURRENT_SEARCH_ENGINE: 'currentSearchEngine',
    CURRENT_CATEGORY: 'currentCategory',
    USER_PREFERENCES: 'userPreferences'
};

// 通知类型
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning'
};

// 模态框ID
export const MODAL_IDS = {
    QUICK_LINKS: 'quick-links-modal',
    SEARCH_ENGINES: 'engines-modal',
    ENGINE_FORM: 'engine-form-modal',
    LINK_FORM: 'link-form-modal'
};

// 表单验证规则
export const VALIDATION_RULES = {
    REQUIRED_FIELDS: {
        SEARCH_ENGINE: ['name', 'display_name', 'url_template'],
        QUICK_LINK: ['name', 'url']
    },
    URL_TEMPLATE_PLACEHOLDER: '{query}',
    MAX_NAME_LENGTH: 50,
    MAX_URL_LENGTH: 500
}; 