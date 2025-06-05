/**
 * 用户信息组件
 * 显示登录状态和用户菜单
 */

import { authService } from '../services/auth.js';
import { dom, events } from '../utils/helpers.js';

export class UserInfo {
    constructor() {
        this.container = null;
        this.user = null;
        this.dropdownVisible = false;
        
        this.createContainer();
        this.bindEvents();
        this.updateUI();
    }

    /**
     * 创建容器
     */
    createContainer() {
        // 在页面右上角创建用户信息容器
        const userInfoHTML = `
            <div id="user-info" class="fixed top-4 right-4 z-30">
                <!-- 未登录状态 -->
                <div id="auth-buttons" class="flex items-center gap-2">
                    <button id="login-btn" class="btn btn-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm">
                        <i class="fas fa-sign-in-alt mr-1"></i>
                        登录
                    </button>
                    <button id="register-btn" class="btn btn-sm btn-primary">
                        <i class="fas fa-user-plus mr-1"></i>
                        注册
                    </button>
                </div>

                <!-- 已登录状态 -->
                <div id="user-menu" class="hidden relative">
                    <button id="user-menu-btn" class="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm transition-all duration-200">
                        <div class="w-7 h-7 bg-gradient-to-br from-huawei-blue to-blue-600 rounded-full flex items-center justify-center">
                            <i class="fas fa-user text-white text-xs"></i>
                        </div>
                        <span id="username-display" class="text-sm font-medium text-gray-700"></span>
                        <i class="fas fa-chevron-down text-xs text-gray-400 transition-transform duration-200" id="dropdown-arrow"></i>
                    </button>

                    <!-- 用户下拉菜单 -->
                    <div id="user-dropdown" class="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible transform scale-95 transition-all duration-200 origin-top-right">
                        <!-- 用户信息区域 -->
                        <div class="p-3 border-b border-gray-100">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-gradient-to-br from-huawei-blue to-blue-600 rounded-full flex items-center justify-center">
                                    <i class="fas fa-user text-white text-sm"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-gray-900 truncate" id="dropdown-username"></p>
                                    <p class="text-xs text-gray-500 truncate" id="dropdown-email"></p>
                                </div>
                            </div>
                        </div>

                        <!-- 菜单项 -->
                        <div class="py-1">
                            <button class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2" onclick="userInfo.showUserProfile()">
                                <i class="fas fa-user-edit text-gray-400 w-4"></i>
                                个人资料
                            </button>
                            <button class="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2" onclick="userInfo.showDataStats()">
                                <i class="fas fa-chart-bar text-gray-400 w-4"></i>
                                数据统计
                            </button>
                            <div class="border-t border-gray-100 my-1"></div>
                            <button class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2" onclick="userInfo.logout()">
                                <i class="fas fa-sign-out-alt text-red-400 w-4"></i>
                                退出登录
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', userInfoHTML);
        this.container = dom.get('#user-info');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 登录按钮
        const loginBtn = dom.get('#login-btn');
        events.on(loginBtn, 'click', () => {
            if (window.authModal) {
                window.authModal.show('login');
            }
        });

        // 注册按钮
        const registerBtn = dom.get('#register-btn');
        events.on(registerBtn, 'click', () => {
            if (window.authModal) {
                window.authModal.show('register');
            }
        });

        // 用户菜单按钮
        const userMenuBtn = dom.get('#user-menu-btn');
        events.on(userMenuBtn, 'click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // 点击外部关闭下拉菜单
        events.on(document, 'click', () => {
            this.hideDropdown();
        });

        // 监听认证状态变化
        authService.on('onLogin', (user) => {
            this.user = user;
            this.updateUI();
        });

        authService.on('onLogout', () => {
            this.user = null;
            this.updateUI();
            this.hideDropdown();
        });

        // 监听 ESC 键关闭下拉菜单
        events.on(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideDropdown();
            }
        });
    }

    /**
     * 更新UI显示
     */
    updateUI() {
        const authButtons = dom.get('#auth-buttons');
        const userMenu = dom.get('#user-menu');
        const usernameDisplay = dom.get('#username-display');
        const dropdownUsername = dom.get('#dropdown-username');
        const dropdownEmail = dom.get('#dropdown-email');

        if (authService.isLoggedIn()) {
            // 显示用户菜单，隐藏登录按钮
            authButtons.classList.add('hidden');
            userMenu.classList.remove('hidden');

            // 更新用户信息
            const user = authService.getUser();
            if (user) {
                usernameDisplay.textContent = user.username;
                dropdownUsername.textContent = user.username;
                dropdownEmail.textContent = user.email || '未设置邮箱';
            } else {
                // 用户信息尚未加载，显示加载状态
                usernameDisplay.textContent = '加载中...';
                dropdownUsername.textContent = '加载中...';
                dropdownEmail.textContent = '正在获取用户信息...';
            }
        } else {
            // 显示登录按钮，隐藏用户菜单
            authButtons.classList.remove('hidden');
            userMenu.classList.add('hidden');
        }
    }

    /**
     * 切换下拉菜单显示状态
     */
    toggleDropdown() {
        if (this.dropdownVisible) {
            this.hideDropdown();
        } else {
            this.showDropdown();
        }
    }

    /**
     * 显示下拉菜单
     */
    showDropdown() {
        const dropdown = dom.get('#user-dropdown');
        const arrow = dom.get('#dropdown-arrow');
        
        dropdown.classList.remove('opacity-0', 'invisible', 'scale-95');
        dropdown.classList.add('opacity-100', 'visible', 'scale-100');
        arrow.style.transform = 'rotate(180deg)';
        
        this.dropdownVisible = true;
    }

    /**
     * 隐藏下拉菜单
     */
    hideDropdown() {
        const dropdown = dom.get('#user-dropdown');
        const arrow = dom.get('#dropdown-arrow');
        
        dropdown.classList.add('opacity-0', 'invisible', 'scale-95');
        dropdown.classList.remove('opacity-100', 'visible', 'scale-100');
        arrow.style.transform = 'rotate(0deg)';
        
        this.dropdownVisible = false;
    }

    /**
     * 退出登录
     */
    logout() {
        authService.logout();
    }

    /**
     * 显示用户资料（占位方法）
     */
    showUserProfile() {
        this.hideDropdown();
        // TODO: 实现用户资料编辑功能
        console.log('显示用户资料');
    }

    /**
     * 显示数据统计（占位方法）
     */
    showDataStats() {
        this.hideDropdown();
        // TODO: 实现数据统计功能
        console.log('显示数据统计');
    }

    /**
     * 刷新用户信息
     */
    async refresh() {
        if (authService.isLoggedIn()) {
            try {
                await authService.getCurrentUser();
                this.updateUI();
            } catch (error) {
                console.error('刷新用户信息失败:', error);
            }
        }
    }
}

// 创建全局实例
export const userInfo = new UserInfo();

// 挂载到 window 对象，供 HTML 中的 onclick 事件使用
window.userInfo = userInfo; 