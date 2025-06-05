/**
 * 认证服务
 * 处理用户登录、注册、令牌管理等功能
 */

import { showSuccess, showError } from './notification.js';

export class AuthService {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = null;
        this.callbacks = {
            onLogin: [],
            onLogout: [],
            onError: []
        };
        
        // 如果有token，立即触发登录状态（用户信息稍后异步加载）
        if (this.token) {
            // 使用setTimeout确保在模块加载后执行
            setTimeout(() => {
                this.triggerCallbacks('onLogin', null);
            }, 0);
        }
        
        // 初始化时检查登录状态
        this.init();
    }

    async init() {
        if (this.token) {
            try {
                await this.getCurrentUser();
                // 用户信息获取成功，触发登录回调
                this.triggerCallbacks('onLogin', this.user);
            } catch (error) {
                console.warn('初始化时获取用户信息失败:', error);
                this.logout();
            }
        }
    }

    /**
     * 用户注册
     */
    async register(userData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || '注册失败');
            }

            showSuccess('注册成功！请登录');
            return data;
        } catch (error) {
            showError(error.message);
            throw error;
        }
    }

    /**
     * 用户登录
     */
    async login(credentials) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || '登录失败');
            }

            // 保存令牌和用户信息
            this.token = data.access_token;
            this.user = data.user;
            localStorage.setItem('authToken', this.token);

            // 触发登录回调
            this.triggerCallbacks('onLogin', this.user);

            showSuccess(`欢迎回来，${this.user.username}！`);
            return data;
        } catch (error) {
            showError(error.message);
            this.triggerCallbacks('onError', error);
            throw error;
        }
    }

    /**
     * 用户登出
     */
    logout() {
        const oldUser = this.user;
        
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');

        // 触发登出回调
        this.triggerCallbacks('onLogout', oldUser);

        showSuccess('已安全退出');
    }

    /**
     * 获取当前用户信息
     */
    async getCurrentUser() {
        if (!this.token) {
            throw new Error('未登录');
        }

        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('登录已过期');
                }
                throw new Error('获取用户信息失败');
            }

            this.user = await response.json();
            return this.user;
        } catch (error) {
            if (error.message === '登录已过期') {
                this.logout();
            }
            throw error;
        }
    }

    /**
     * 检查是否已登录
     */
    isLoggedIn() {
        return !!this.token;
    }

    /**
     * 获取认证头
     */
    getAuthHeaders() {
        if (!this.token) {
            throw new Error('未登录');
        }
        
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * 发送认证请求
     */
    async authenticatedFetch(url, options = {}) {
        const headers = {
            ...this.getAuthHeaders(),
            ...(options.headers || {})
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            this.logout();
            throw new Error('登录已过期，请重新登录');
        }

        return response;
    }

    /**
     * 添加事件回调
     */
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }

    /**
     * 移除事件回调
     */
    off(event, callback) {
        if (this.callbacks[event]) {
            const index = this.callbacks[event].indexOf(callback);
            if (index > -1) {
                this.callbacks[event].splice(index, 1);
            }
        }
    }

    /**
     * 触发回调
     */
    triggerCallbacks(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('回调执行失败:', error);
                }
            });
        }
    }

    /**
     * 获取用户信息
     */
    getUser() {
        return this.user;
    }

    /**
     * 检查用户信息是否已加载
     */
    isUserLoaded() {
        return !!(this.token && this.user);
    }

    /**
     * 获取令牌
     */
    getToken() {
        return this.token;
    }
}

// 创建全局认证服务实例
export const authService = new AuthService(); 