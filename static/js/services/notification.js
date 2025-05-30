/**
 * 通知服务模块
 * 负责显示成功、错误等通知消息
 */

import { NOTIFICATION_TYPES, DEFAULT_CONFIG } from '../utils/constants.js';
import { dom, generateId } from '../utils/helpers.js';

/**
 * 通知服务类
 */
class NotificationService {
    constructor() {
        this.notifications = new Map();
        this.container = null;
        this.init();
    }

    /**
     * 初始化通知容器
     */
    init() {
        // 创建通知容器
        this.container = dom.create('div', {
            id: 'notification-container',
            className: 'fixed top-4 right-4 z-50 space-y-2'
        });
        document.body.appendChild(this.container);
    }

    /**
     * 显示通知
     * @param {string} message 消息内容
     * @param {string} type 通知类型
     * @param {number} duration 显示时长（毫秒）
     * @returns {string} 通知ID
     */
    show(message, type = NOTIFICATION_TYPES.INFO, duration = DEFAULT_CONFIG.NOTIFICATION_DURATION) {
        const id = generateId();
        const notification = this.createNotification(id, message, type);
        
        // 添加到容器
        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        // 添加进入动画
        requestAnimationFrame(() => {
            notification.classList.add('animate-slide-in');
        });

        // 自动隐藏
        if (duration > 0) {
            setTimeout(() => {
                this.hide(id);
            }, duration);
        }

        return id;
    }

    /**
     * 显示成功通知
     * @param {string} message 消息内容
     * @param {number} duration 显示时长
     * @returns {string} 通知ID
     */
    success(message, duration) {
        return this.show(message, NOTIFICATION_TYPES.SUCCESS, duration);
    }

    /**
     * 显示错误通知
     * @param {string} message 消息内容
     * @param {number} duration 显示时长
     * @returns {string} 通知ID
     */
    error(message, duration = 5000) {
        return this.show(message, NOTIFICATION_TYPES.ERROR, duration);
    }

    /**
     * 显示警告通知
     * @param {string} message 消息内容
     * @param {number} duration 显示时长
     * @returns {string} 通知ID
     */
    warning(message, duration) {
        return this.show(message, NOTIFICATION_TYPES.WARNING, duration);
    }

    /**
     * 显示信息通知
     * @param {string} message 消息内容
     * @param {number} duration 显示时长
     * @returns {string} 通知ID
     */
    info(message, duration) {
        return this.show(message, NOTIFICATION_TYPES.INFO, duration);
    }

    /**
     * 隐藏通知
     * @param {string} id 通知ID
     */
    hide(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        // 添加退出动画
        notification.classList.add('animate-slide-out');
        
        // 动画结束后移除元素
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications.delete(id);
        }, DEFAULT_CONFIG.ANIMATION_DURATION);
    }

    /**
     * 隐藏所有通知
     */
    hideAll() {
        this.notifications.forEach((notification, id) => {
            this.hide(id);
        });
    }

    /**
     * 创建通知元素
     * @param {string} id 通知ID
     * @param {string} message 消息内容
     * @param {string} type 通知类型
     * @returns {Element} 通知元素
     */
    createNotification(id, message, type) {
        const typeConfig = this.getTypeConfig(type);
        
        const notification = dom.create('div', {
            className: `notification notification-${type} ${typeConfig.className}`,
            dataset: { id }
        });

        const content = dom.create('div', {
            className: 'flex items-center justify-between gap-3'
        });

        // 图标和消息
        const messageContainer = dom.create('div', {
            className: 'flex items-center gap-2'
        });

        const icon = dom.create('i', {
            className: `${typeConfig.icon} text-sm flex-shrink-0`
        });

        const messageText = dom.create('span', {
            className: 'text-sm font-medium'
        }, message);

        messageContainer.appendChild(icon);
        messageContainer.appendChild(messageText);

        // 关闭按钮
        const closeButton = dom.create('button', {
            className: 'text-current opacity-70 hover:opacity-100 transition-opacity',
            type: 'button'
        });

        const closeIcon = dom.create('i', {
            className: 'fas fa-times text-xs'
        });

        closeButton.appendChild(closeIcon);
        closeButton.addEventListener('click', () => {
            this.hide(id);
        });

        content.appendChild(messageContainer);
        content.appendChild(closeButton);
        notification.appendChild(content);

        return notification;
    }

    /**
     * 获取通知类型配置
     * @param {string} type 通知类型
     * @returns {Object} 类型配置
     */
    getTypeConfig(type) {
        const configs = {
            [NOTIFICATION_TYPES.SUCCESS]: {
                className: 'bg-green-50 text-green-800 border border-green-200',
                icon: 'fas fa-check-circle'
            },
            [NOTIFICATION_TYPES.ERROR]: {
                className: 'bg-red-50 text-red-800 border border-red-200',
                icon: 'fas fa-exclamation-circle'
            },
            [NOTIFICATION_TYPES.WARNING]: {
                className: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
                icon: 'fas fa-exclamation-triangle'
            },
            [NOTIFICATION_TYPES.INFO]: {
                className: 'bg-blue-50 text-blue-800 border border-blue-200',
                icon: 'fas fa-info-circle'
            }
        };

        return configs[type] || configs[NOTIFICATION_TYPES.INFO];
    }
}

// 创建全局通知服务实例
export const notificationService = new NotificationService();

// 便捷方法
export const showSuccess = (message, duration) => notificationService.success(message, duration);
export const showError = (message, duration) => notificationService.error(message, duration);
export const showWarning = (message, duration) => notificationService.warning(message, duration);
export const showInfo = (message, duration) => notificationService.info(message, duration);

// 添加CSS动画样式
const style = document.createElement('style');
style.textContent = `
    .animate-slide-in {
        animation: slideIn 0.3s ease-out forwards;
    }
    
    .animate-slide-out {
        animation: slideOut 0.3s ease-in forwards;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 