/**
 * 工具函数库
 */

import { STORAGE_KEYS, NOTIFICATION_TYPES, DEFAULT_CONFIG } from './constants.js';

/**
 * 本地存储工具
 */
export const storage = {
    /**
     * 获取存储的值
     * @param {string} key 键名
     * @param {*} defaultValue 默认值
     * @returns {*} 存储的值或默认值
     */
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.warn('获取本地存储失败:', error);
            return defaultValue;
        }
    },

    /**
     * 设置存储的值
     * @param {string} key 键名
     * @param {*} value 值
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('设置本地存储失败:', error);
        }
    },

    /**
     * 删除存储的值
     * @param {string} key 键名
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('删除本地存储失败:', error);
        }
    }
};

/**
 * DOM 操作工具
 */
export const dom = {
    /**
     * 获取元素
     * @param {string} selector 选择器
     * @returns {Element|null} 元素
     */
    get(selector) {
        return document.querySelector(selector);
    },

    /**
     * 获取所有匹配的元素
     * @param {string} selector 选择器
     * @returns {NodeList} 元素列表
     */
    getAll(selector) {
        return document.querySelectorAll(selector);
    },

    /**
     * 创建元素
     * @param {string} tag 标签名
     * @param {Object} attributes 属性
     * @param {string} content 内容
     * @returns {Element} 创建的元素
     */
    create(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });

        if (content) {
            element.innerHTML = content;
        }

        return element;
    },

    /**
     * 显示元素
     * @param {Element} element 元素
     */
    show(element) {
        if (element) {
            element.classList.remove('hidden');
        }
    },

    /**
     * 隐藏元素
     * @param {Element} element 元素
     */
    hide(element) {
        if (element) {
            element.classList.add('hidden');
        }
    },

    /**
     * 切换元素显示状态
     * @param {Element} element 元素
     */
    toggle(element) {
        if (element) {
            element.classList.toggle('hidden');
        }
    }
};

/**
 * 事件工具
 */
export const events = {
    /**
     * 添加事件监听器
     * @param {Element|string} target 目标元素或选择器
     * @param {string} event 事件名
     * @param {Function} handler 处理函数
     * @param {Object} options 选项
     */
    on(target, event, handler, options = {}) {
        const element = typeof target === 'string' ? dom.get(target) : target;
        if (element) {
            element.addEventListener(event, handler, options);
        }
    },

    /**
     * 移除事件监听器
     * @param {Element|string} target 目标元素或选择器
     * @param {string} event 事件名
     * @param {Function} handler 处理函数
     */
    off(target, event, handler) {
        const element = typeof target === 'string' ? dom.get(target) : target;
        if (element) {
            element.removeEventListener(event, handler);
        }
    },

    /**
     * 触发自定义事件
     * @param {Element|string} target 目标元素或选择器
     * @param {string} event 事件名
     * @param {*} detail 事件数据
     */
    emit(target, event, detail = null) {
        const element = typeof target === 'string' ? dom.get(target) : target;
        if (element) {
            const customEvent = new CustomEvent(event, { detail });
            element.dispatchEvent(customEvent);
        }
    }
};

/**
 * 表单验证工具
 */
export const validation = {
    /**
     * 验证必填字段
     * @param {Object} data 数据对象
     * @param {Array} requiredFields 必填字段数组
     * @returns {Object} 验证结果
     */
    validateRequired(data, requiredFields) {
        const errors = [];
        
        requiredFields.forEach(field => {
            if (!data[field] || String(data[field]).trim() === '') {
                errors.push(`${field} 是必填字段`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * 验证URL格式
     * @param {string} url URL字符串
     * @returns {boolean} 是否有效
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * 验证搜索引擎URL模板
     * @param {string} template URL模板
     * @returns {boolean} 是否有效
     */
    isValidUrlTemplate(template) {
        return template && template.includes('{query}');
    }
};

/**
 * 格式化工具
 */
export const format = {
    /**
     * 格式化日期
     * @param {Date|string} date 日期
     * @returns {string} 格式化后的日期字符串
     */
    date(date) {
        const d = new Date(date);
        return d.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * 截断文本
     * @param {string} text 文本
     * @param {number} maxLength 最大长度
     * @returns {string} 截断后的文本
     */
    truncate(text, maxLength = 50) {
        if (!text || text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    }
};

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} delay 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {number} delay 延迟时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            return func.apply(this, args);
        }
    };
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 深拷贝对象
 * @param {*} obj 要拷贝的对象
 * @returns {*} 拷贝后的对象
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    
    if (typeof obj === 'object') {
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = deepClone(obj[key]);
        });
        return cloned;
    }
}

/**
 * 获取当前搜索引擎
 * @returns {string} 当前搜索引擎名称
 */
export function getCurrentSearchEngine() {
    return storage.get(STORAGE_KEYS.CURRENT_SEARCH_ENGINE, DEFAULT_CONFIG.SEARCH_ENGINE);
}

/**
 * 设置当前搜索引擎
 * @param {string} engineName 搜索引擎名称
 */
export function setCurrentSearchEngine(engineName) {
    storage.set(STORAGE_KEYS.CURRENT_SEARCH_ENGINE, engineName);
}

/**
 * 获取当前分类
 * @returns {string} 当前分类名称
 */
export function getCurrentCategory() {
    return storage.get(STORAGE_KEYS.CURRENT_CATEGORY, 'all');
}

/**
 * 设置当前分类
 * @param {string} category 分类名称
 */
export function setCurrentCategory(category) {
    storage.set(STORAGE_KEYS.CURRENT_CATEGORY, category);
} 