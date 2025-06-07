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
                    <button id="user-menu-btn" class="group flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm">
                        <!-- 用户头像 -->
                        <div class="relative">
                            <div class="w-8 h-8 bg-gradient-to-br from-huawei-blue via-blue-500 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-white shadow-lg">
                                <i class="fas fa-user text-white text-xs"></i>
                            </div>
                            <!-- 在线状态指示器 -->
                            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
                        </div>
                        
                        <!-- 用户信息 -->
                        <div class="flex flex-col items-start min-w-0">
                            <span id="username-display" class="text-sm font-semibold text-gray-800 group-hover:text-gray-900 transition-colors"></span>
                            <span class="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">点击查看菜单</span>
                        </div>
                        
                        <!-- 下拉箭头 -->
                        <i class="fas fa-chevron-down text-xs text-gray-400 group-hover:text-gray-600 transition-all duration-300 ml-1" id="dropdown-arrow"></i>
                    </button>

                    <!-- 用户下拉菜单 -->
                    <div id="user-dropdown" class="absolute right-0 top-full mt-3 w-64 rounded-2xl opacity-0 invisible transform scale-95 transition-all duration-300 origin-top-right overflow-hidden">
                        <!-- 渐变装饰条 -->
                        <div class="h-1 bg-gradient-to-r from-huawei-blue via-blue-500 to-indigo-600"></div>
                        
                        <!-- 用户信息区域 -->
                        <div class="p-4 bg-gradient-to-br from-gray-50/80 to-white/90">
                            <div class="flex items-center gap-3">
                                <div class="relative">
                                    <div class="w-12 h-12 bg-gradient-to-br from-huawei-blue via-blue-500 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-white shadow-lg">
                                        <i class="fas fa-user text-white text-base"></i>
                                    </div>
                                    <!-- 在线状态指示器 -->
                                    <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full">
                                        <div class="w-full h-full bg-green-400 rounded-full animate-ping"></div>
                                    </div>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-base font-semibold text-gray-900 truncate" id="dropdown-username"></p>
                                    <p class="text-xs text-gray-600 truncate" id="dropdown-email"></p>
                                    <div class="flex items-center gap-1 mt-1">
                                        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span class="text-xs text-green-600 font-medium">在线</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 菜单项 -->
                        <div class="py-2">
                            <button class="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-gray-900 flex items-center gap-3 transition-all duration-200 group" onclick="userInfo.showUserProfile()">
                                <div class="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 rounded-lg flex items-center justify-center transition-all duration-200">
                                    <i class="fas fa-user-edit text-blue-600 text-xs"></i>
                                </div>
                                <div class="flex-1">
                                    <div class="font-medium">个人资料</div>
                                    <div class="text-xs text-gray-500">编辑个人信息</div>
                                </div>
                                <i class="fas fa-chevron-right text-xs text-gray-400 group-hover:text-gray-600 transition-colors"></i>
                            </button>
                            
                            <button class="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-gray-900 flex items-center gap-3 transition-all duration-200 group" onclick="userInfo.showDataStats()">
                                <div class="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 group-hover:from-green-200 group-hover:to-green-300 rounded-lg flex items-center justify-center transition-all duration-200">
                                    <i class="fas fa-chart-bar text-green-600 text-xs"></i>
                                </div>
                                <div class="flex-1">
                                    <div class="font-medium">数据统计</div>
                                    <div class="text-xs text-gray-500">查看使用数据</div>
                                </div>
                                <i class="fas fa-chevron-right text-xs text-gray-400 group-hover:text-gray-600 transition-colors"></i>
                            </button>
                            
                            <!-- 分隔线 -->
                            <div class="border-t border-gray-100 mx-4 my-2"></div>
                            
                            <button class="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 flex items-center gap-3 transition-all duration-200 group" onclick="userInfo.logout()">
                                <div class="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 group-hover:from-red-200 group-hover:to-red-300 rounded-lg flex items-center justify-center transition-all duration-200">
                                    <i class="fas fa-sign-out-alt text-red-600 text-xs"></i>
                                </div>
                                <div class="flex-1">
                                    <div class="font-medium">退出登录</div>
                                    <div class="text-xs text-red-400">安全退出账户</div>
                                </div>
                                <i class="fas fa-chevron-right text-xs text-red-400 group-hover:text-red-600 transition-colors"></i>
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
                const displayName = user.display_name || user.username;
                usernameDisplay.textContent = displayName;
                dropdownUsername.textContent = displayName;
                dropdownEmail.textContent = user.email || '未设置邮箱';
                
                // 更新头像显示
                this.updateAvatarDisplay(user);
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
     * 更新头像显示
     */
    updateAvatarDisplay(user) {
        // 更新菜单按钮中的小头像
        const userMenu = dom.get('#user-menu');
        const menuAvatar = userMenu?.querySelector('.w-8.h-8');
        const menuIcon = menuAvatar?.querySelector('i');
        
        // 更新下拉菜单中的大头像
        const dropdownAvatar = dom.get('#user-dropdown').querySelector('.w-12.h-12');
        const dropdownIcon = dropdownAvatar?.querySelector('i');
        
        if (user.avatar_url) {
            const avatarImageUrl = `/api/avatar/download/${user.avatar_url.split('/').pop()}`;
            
            // 设置菜单按钮头像
            if (menuAvatar) {
                menuAvatar.style.backgroundImage = `url(${avatarImageUrl})`;
                menuAvatar.style.backgroundSize = 'cover';
                menuAvatar.style.backgroundPosition = 'center';
                if (menuIcon) menuIcon.style.display = 'none';
            }
            
            // 设置下拉菜单头像
            if (dropdownAvatar) {
                dropdownAvatar.style.backgroundImage = `url(${avatarImageUrl})`;
                dropdownAvatar.style.backgroundSize = 'cover';
                dropdownAvatar.style.backgroundPosition = 'center';
                if (dropdownIcon) dropdownIcon.style.display = 'none';
            }
        } else {
            // 恢复默认图标显示
            if (menuAvatar) {
                menuAvatar.style.backgroundImage = '';
                if (menuIcon) menuIcon.style.display = '';
            }
            
            if (dropdownAvatar) {
                dropdownAvatar.style.backgroundImage = '';
                if (dropdownIcon) dropdownIcon.style.display = '';
            }
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
        const menuBtn = dom.get('#user-menu-btn');
        
        // 添加显示动画
        dropdown.classList.remove('opacity-0', 'invisible', 'scale-95');
        dropdown.classList.add('opacity-100', 'visible', 'scale-100');
        
        // 旋转箭头
        arrow.style.transform = 'rotate(180deg)';
        
        // 高亮菜单按钮
        menuBtn.classList.add('ring-2', 'ring-huawei-blue/20', 'shadow-lg');
        
        this.dropdownVisible = true;
    }

    /**
     * 隐藏下拉菜单
     */
    hideDropdown() {
        const dropdown = dom.get('#user-dropdown');
        const arrow = dom.get('#dropdown-arrow');
        const menuBtn = dom.get('#user-menu-btn');
        
        // 添加隐藏动画
        dropdown.classList.add('opacity-0', 'invisible', 'scale-95');
        dropdown.classList.remove('opacity-100', 'visible', 'scale-100');
        
        // 还原箭头
        arrow.style.transform = 'rotate(0deg)';
        
        // 移除高亮效果
        menuBtn.classList.remove('ring-2', 'ring-huawei-blue/20', 'shadow-lg');
        
        this.dropdownVisible = false;
    }

    /**
     * 退出登录
     */
    logout() {
        authService.logout();
    }

    /**
     * 显示用户资料编辑模态框
     */
    showUserProfile() {
        this.hideDropdown();
        this.createUserProfileModal();
        this.showUserProfileModal();
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
     * 创建用户信息编辑模态框
     */
    createUserProfileModal() {
        // 如果模态框已存在，直接返回
        if (dom.get('#user-profile-modal')) {
            return;
        }

        const user = authService.getUser();
        const modalHTML = `
            <div id="user-profile-modal" class="modal hidden">
                <div class="modal-backdrop"></div>
                <div class="modal-content" style="max-width: 500px; width: 100%;">
                    <!-- 模态框头部 -->
                    <div class="modal-header">
                        <h2 class="modal-title flex items-center gap-3">
                            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <i class="fas fa-user-edit text-white text-sm"></i>
                            </div>
                            <span>个人资料</span>
                        </h2>
                        <button class="modal-close" onclick="userInfo.hideUserProfileModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <!-- 模态框内容 -->
                    <div class="modal-body">
                        <!-- 错误消息区域 -->
                        <div id="profile-error" class="hidden mb-4 p-3 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                            <div class="flex items-start gap-2">
                                <i class="fas fa-exclamation-circle text-red-500 text-sm mt-0.5 flex-shrink-0"></i>
                                <span id="profile-error-text" class="text-sm text-red-700 leading-relaxed"></span>
                            </div>
                        </div>

                        <!-- 成功消息区域 -->
                        <div id="profile-success" class="hidden mb-4 p-3 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                            <div class="flex items-start gap-2">
                                <i class="fas fa-check-circle text-green-500 text-sm mt-0.5 flex-shrink-0"></i>
                                <span id="profile-success-text" class="text-sm text-green-700 leading-relaxed"></span>
                            </div>
                        </div>

                                                 <!-- 头像区域 -->
                         <div class="text-center mb-6">
                             <div class="inline-block relative avatar-section">
                                <div class="w-20 h-20 bg-gradient-to-br from-huawei-blue via-blue-500 to-indigo-600 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg mx-auto avatar-display" ${user?.avatar_url ? `style="background-image: url(/api/avatar/download/${user.avatar_url.split('/').pop()}); background-size: cover; background-position: center;"` : ''}>
                                    <i class="fas fa-user text-white text-2xl" ${user?.avatar_url ? 'style="display: none;"' : ''}></i>
                                </div>
                                <button class="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors duration-200">
                                    <i class="fas fa-camera text-xs"></i>
                                </button>
                            </div>
                            <p class="text-sm text-gray-600 mt-2">点击相机图标更换头像</p>
                        </div>

                        <!-- 表单 -->
                        <form id="user-profile-form" class="space-y-4">
                            <div class="form-group">
                                <label class="form-label">用户名</label>
                                <input type="text" id="profile-username" class="form-input" value="${user?.username || ''}" readonly>
                                <p class="text-xs text-gray-500 mt-1">用户名无法修改</p>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">邮箱地址</label>
                                <input type="email" id="profile-email" class="form-input" value="${user?.email || ''}" placeholder="请输入邮箱地址">
                                <p class="text-xs text-gray-500 mt-1">用于接收重要通知和找回密码</p>
                            </div>

                            <div class="form-group">
                                <label class="form-label">显示名称</label>
                                <input type="text" id="profile-display-name" class="form-input" value="${user?.display_name || user?.username || ''}" placeholder="请输入显示名称">
                                <p class="text-xs text-gray-500 mt-1">在界面上显示的名称</p>
                            </div>

                            <div class="form-group">
                                <label class="form-label">个人简介</label>
                                <textarea id="profile-bio" class="form-input resize-none" rows="3" placeholder="介绍一下自己...">${user?.bio || ''}</textarea>
                                <p class="text-xs text-gray-500 mt-1">简单介绍一下自己（可选）</p>
                            </div>

                            <!-- 密码修改区域 -->
                            <div class="border-t border-gray-200 pt-4 mt-6">
                                <h3 class="text-sm font-semibold text-gray-900 mb-3">修改密码</h3>
                                
                                <div class="form-group">
                                    <label class="form-label">当前密码</label>
                                    <div class="relative">
                                        <input type="password" id="profile-current-password" class="form-input pr-10" placeholder="请输入当前密码">
                                        <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" onclick="userInfo.togglePasswordVisibility('profile-current-password')">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">新密码</label>
                                    <div class="relative">
                                        <input type="password" id="profile-new-password" class="form-input pr-10" placeholder="请输入新密码（至少6位）">
                                        <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" onclick="userInfo.togglePasswordVisibility('profile-new-password')">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">确认新密码</label>
                                    <div class="relative">
                                        <input type="password" id="profile-confirm-password" class="form-input pr-10" placeholder="请再次输入新密码">
                                        <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" onclick="userInfo.togglePasswordVisibility('profile-confirm-password')">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <p class="text-xs text-gray-500">如果不需要修改密码，请保持密码字段为空</p>
                            </div>
                        </form>
                    </div>

                    <!-- 模态框底部 -->
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="userInfo.hideUserProfileModal()">
                            取消
                        </button>
                        <button type="button" id="save-profile-btn" class="btn btn-primary" onclick="userInfo.saveUserProfile()">
                            <span id="save-profile-text">保存修改</span>
                            <i id="save-profile-loading" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 绑定模态框事件
        this.bindProfileModalEvents();
    }

    /**
     * 绑定用户信息模态框事件
     */
    bindProfileModalEvents() {
        const modal = dom.get('#user-profile-modal');
        if (!modal) return;
        
        // 点击背景关闭
        const backdrop = modal.querySelector('.modal-backdrop');
        if (backdrop) {
            events.on(backdrop, 'click', () => {
                this.hideUserProfileModal();
            });
        }
        
        // ESC 键关闭
        events.on(document, 'keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                this.hideUserProfileModal();
            }
        });
        
        // 回车键提交表单
        events.on(modal, 'keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.saveUserProfile();
            }
        });
        
        // 头像更换按钮点击事件
        const avatarButton = modal.querySelector('.avatar-section button');
        if (avatarButton) {
            events.on(avatarButton, 'click', () => {
                this.handleAvatarChange();
            });
        }
    }

    /**
     * 显示用户信息编辑模态框
     */
    showUserProfileModal() {
        const modal = dom.get('#user-profile-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // 聚焦到第一个可编辑的输入框
            setTimeout(() => {
                const emailInput = dom.get('#profile-email');
                if (emailInput) {
                    emailInput.focus();
                }
            }, 100);
        }
    }

    /**
     * 隐藏用户信息编辑模态框
     */
    hideUserProfileModal() {
        const modal = dom.get('#user-profile-modal');
        if (modal) {
            modal.classList.add('hidden');
            this.clearProfileMessages();
        }
    }

    /**
     * 处理头像更换
     */
    handleAvatarChange() {
        // 创建隐藏的文件输入元素
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        
        // 监听文件选择
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleAvatarFile(file);
            }
            // 清理临时元素
            document.body.removeChild(fileInput);
        });
        
        // 添加到页面并触发点击
        document.body.appendChild(fileInput);
        fileInput.click();
    }
    
    /**
     * 处理选择的头像文件
     */
    async handleAvatarFile(file) {
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            this.showProfileError('请选择图片文件');
            return;
        }
        
        // 验证文件大小 (限制为2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            this.showProfileError('图片大小不能超过2MB');
            return;
        }
        
        try {
            // 显示加载状态
            const avatarButton = document.querySelector('.avatar-section button');
            const originalIcon = avatarButton.innerHTML;
            avatarButton.innerHTML = '<i class="fas fa-spinner fa-spin text-xs"></i>';
            avatarButton.disabled = true;
            
            // 预览图片
            const reader = new FileReader();
            reader.onload = (e) => {
                const avatarDiv = document.querySelector('.avatar-section .w-20');
                // 临时显示预览
                avatarDiv.style.backgroundImage = `url(${e.target.result})`;
                avatarDiv.style.backgroundSize = 'cover';
                avatarDiv.style.backgroundPosition = 'center';
                avatarDiv.querySelector('i').style.display = 'none';
            };
            reader.readAsDataURL(file);
            
            // 创建FormData上传文件
            const formData = new FormData();
            formData.append('file', file);
            
            // 上传到服务器
            const response = await authService.authenticatedFetch('/api/avatar/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '上传失败');
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.showProfileSuccess('头像上传成功！');
                
                // 更新用户信息
                await authService.getCurrentUser();
                
                // 更新界面显示
                this.updateUI();
                
                // 更新头像显示（使用服务器返回的URL）
                if (data.avatar_url) {
                    const avatarDiv = document.querySelector('.avatar-section .w-20');
                    avatarDiv.style.backgroundImage = `url(/api/avatar/download/${data.avatar_url.split('/').pop()})`;
                    avatarDiv.style.backgroundSize = 'cover';
                    avatarDiv.style.backgroundPosition = 'center';
                    avatarDiv.querySelector('i').style.display = 'none';
                }
            } else {
                throw new Error(data.message || '上传失败');
            }
            
        } catch (error) {
            console.error('头像上传失败:', error);
            this.showProfileError(error.message || '头像上传失败，请重试');
            
            // 恢复原始头像显示
            const avatarDiv = document.querySelector('.avatar-section .w-20');
            avatarDiv.style.backgroundImage = '';
            avatarDiv.querySelector('i').style.display = '';
            
        } finally {
            // 恢复按钮状态
            const avatarButton = document.querySelector('.avatar-section button');
            avatarButton.innerHTML = originalIcon;
            avatarButton.disabled = false;
        }
    }

    /**
     * 切换密码显示/隐藏
     */
    togglePasswordVisibility(inputId) {
        const input = dom.get(`#${inputId}`);
        const icon = input.nextElementSibling.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    /**
     * 显示错误消息
     */
    showProfileError(message) {
        const errorDiv = dom.get('#profile-error');
        const errorText = dom.get('#profile-error-text');
        const successDiv = dom.get('#profile-success');
        
        // 隐藏成功消息
        if (successDiv) {
            successDiv.classList.add('hidden');
        }
        
        errorText.textContent = message;
        errorDiv.classList.remove('hidden');
        
        // 滚动到错误消息位置
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * 显示成功消息
     */
    showProfileSuccess(message) {
        const successDiv = dom.get('#profile-success');
        const successText = dom.get('#profile-success-text');
        const errorDiv = dom.get('#profile-error');
        
        // 隐藏错误消息
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
        
        successText.textContent = message;
        successDiv.classList.remove('hidden');
        
        // 滚动到成功消息位置
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * 清除所有消息
     */
    clearProfileMessages() {
        const errorDiv = dom.get('#profile-error');
        const successDiv = dom.get('#profile-success');
        
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
        if (successDiv) {
            successDiv.classList.add('hidden');
        }
    }

    /**
     * 保存用户信息
     */
    async saveUserProfile() {
        const saveBtn = dom.get('#save-profile-btn');
        const saveText = dom.get('#save-profile-text');
        const saveLoading = dom.get('#save-profile-loading');
        
        // 清除之前的消息
        this.clearProfileMessages();
        
        // 设置加载状态
        saveBtn.disabled = true;
        saveText.classList.add('opacity-50');
        saveLoading.classList.remove('hidden');
        
        try {
            // 获取表单数据
            const email = dom.get('#profile-email').value.trim();
            const displayName = dom.get('#profile-display-name').value.trim();
            const bio = dom.get('#profile-bio').value.trim();
            const currentPassword = dom.get('#profile-current-password').value;
            const newPassword = dom.get('#profile-new-password').value;
            const confirmPassword = dom.get('#profile-confirm-password').value;
            
            // 验证输入
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                throw new Error('请输入有效的邮箱地址');
            }
            
            // 如果要修改密码，验证密码
            if (newPassword || confirmPassword || currentPassword) {
                if (!currentPassword) {
                    throw new Error('修改密码时必须输入当前密码');
                }
                if (!newPassword) {
                    throw new Error('请输入新密码');
                }
                if (newPassword.length < 6) {
                    throw new Error('新密码至少需要6位字符');
                }
                if (newPassword !== confirmPassword) {
                    throw new Error('两次输入的新密码不一致');
                }
            }
            
            // 准备更新数据
            const updateData = {
                email: email || null,
                display_name: displayName || null,
                bio: bio || null
            };
            
            // 如果需要修改密码，添加密码字段
            if (newPassword) {
                updateData.current_password = currentPassword;
                updateData.new_password = newPassword;
            }
            
            // 发送更新请求
            const response = await authService.authenticatedFetch('/api/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || '更新失败');
            }
            
            const updatedUser = await response.json();
            
            // 更新本地用户信息
            authService.user = updatedUser;
            
            // 显示成功消息
            this.showProfileSuccess('个人信息更新成功！');
            
            // 更新UI显示
            this.updateUI();
            
            // 清空密码字段
            dom.get('#profile-current-password').value = '';
            dom.get('#profile-new-password').value = '';
            dom.get('#profile-confirm-password').value = '';
            
            // 3秒后自动关闭模态框
            setTimeout(() => {
                this.hideUserProfileModal();
            }, 2000);
            
        } catch (error) {
            console.error('保存用户信息失败:', error);
            this.showProfileError(error.message || '保存失败，请重试');
        } finally {
            // 重置加载状态
            saveBtn.disabled = false;
            saveText.classList.remove('opacity-50');
            saveLoading.classList.add('hidden');
        }
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