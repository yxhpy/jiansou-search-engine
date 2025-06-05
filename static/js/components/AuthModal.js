/**
 * 认证模态框组件
 * 包含登录和注册表单
 */

import { authService } from '../services/auth.js';
import { dom, events } from '../utils/helpers.js';

export class AuthModal {
    constructor() {
        this.modal = null;
        this.currentMode = 'login'; // 'login' 或 'register'
        this.isLoading = false;
        
        this.createModal();
        this.bindEvents();
    }

    /**
     * 创建模态框
     */
    createModal() {
        const modalHTML = `
            <div id="auth-modal" class="modal hidden">
                <div class="modal-backdrop"></div>
                <div class="modal-content" style="max-width: 420px; width: 100%;">
                    <!-- 模态框头部 -->
                    <div class="modal-header">
                        <h2 class="modal-title flex items-center gap-3">
                            <div class="w-8 h-8 bg-gradient-to-br from-huawei-blue to-blue-600 rounded-xl flex items-center justify-center">
                                <i class="fas fa-user text-white text-sm"></i>
                            </div>
                            <span id="auth-title">用户登录</span>
                        </h2>
                        <button class="modal-close" onclick="authModal.hide()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <!-- 模态框内容 -->
                    <div class="modal-body">
                        <!-- 登录表单 -->
                        <form id="login-form" class="space-y-4">
                            <div class="form-group">
                                <label class="form-label">用户名</label>
                                <input type="text" id="login-username" class="form-input" placeholder="请输入用户名" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">密码</label>
                                <div class="relative">
                                    <input type="password" id="login-password" class="form-input pr-10" placeholder="请输入密码" required>
                                    <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" onclick="authModal.togglePassword('login-password')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                        </form>

                        <!-- 注册表单 -->
                        <form id="register-form" class="space-y-4 hidden">
                            <div class="form-group">
                                <label class="form-label">用户名</label>
                                <input type="text" id="register-username" class="form-input" placeholder="请输入用户名（3-20个字符）" required>
                                <p class="text-xs text-gray-500 mt-1">用户名只能包含字母、数字和下划线</p>
                            </div>
                            <div class="form-group">
                                <label class="form-label">邮箱</label>
                                <input type="email" id="register-email" class="form-input" placeholder="请输入邮箱地址" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">密码</label>
                                <div class="relative">
                                    <input type="password" id="register-password" class="form-input pr-10" placeholder="请输入密码（至少6位）" required>
                                    <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" onclick="authModal.togglePassword('register-password')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">确认密码</label>
                                <div class="relative">
                                    <input type="password" id="register-confirm-password" class="form-input pr-10" placeholder="请再次输入密码" required>
                                    <button type="button" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" onclick="authModal.togglePassword('register-confirm-password')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                        </form>

                        <!-- 模式切换提示 -->
                        <div class="mt-6 text-center">
                            <span id="mode-switch-text" class="text-sm text-gray-600">还没有账号？</span>
                            <button id="mode-switch-btn" class="text-sm text-huawei-blue hover:text-blue-600 font-medium ml-1 transition-colors">
                                立即注册
                            </button>
                        </div>
                    </div>

                    <!-- 模态框底部 -->
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="authModal.hide()">
                            取消
                        </button>
                        <button type="submit" id="auth-submit-btn" class="btn btn-primary">
                            <span id="submit-text">登录</span>
                            <i id="submit-loading" class="fas fa-spinner fa-spin ml-2 hidden"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = dom.get('#auth-modal');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 模式切换
        const modeSwitchBtn = dom.get('#mode-switch-btn');
        events.on(modeSwitchBtn, 'click', () => {
            this.toggleMode();
        });

        // 表单提交
        const submitBtn = dom.get('#auth-submit-btn');
        events.on(submitBtn, 'click', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // 回车键提交
        events.on(this.modal, 'keydown', (e) => {
            if (e.key === 'Enter' && !this.isLoading) {
                e.preventDefault();
                this.handleSubmit();
            }
        });

        // 点击背景关闭
        const backdrop = this.modal.querySelector('.modal-backdrop');
        events.on(backdrop, 'click', () => {
            this.hide();
        });

        // ESC 键关闭
        events.on(document, 'keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.hide();
            }
        });
    }

    /**
     * 显示模态框
     */
    show(mode = 'login') {
        this.currentMode = mode;
        this.updateMode();
        this.modal.classList.remove('hidden');
        
        // 聚焦到第一个输入框
        setTimeout(() => {
            const firstInput = this.modal.querySelector(`#${mode}-username`);
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }

    /**
     * 隐藏模态框
     */
    hide() {
        this.modal.classList.add('hidden');
        this.resetForm();
    }

    /**
     * 切换模式
     */
    toggleMode() {
        this.currentMode = this.currentMode === 'login' ? 'register' : 'login';
        this.updateMode();
        this.resetForm();
    }

    /**
     * 更新模式显示
     */
    updateMode() {
        const title = dom.get('#auth-title');
        const loginForm = dom.get('#login-form');
        const registerForm = dom.get('#register-form');
        const modeSwitchText = dom.get('#mode-switch-text');
        const modeSwitchBtn = dom.get('#mode-switch-btn');
        const submitText = dom.get('#submit-text');

        if (this.currentMode === 'login') {
            title.textContent = '用户登录';
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            modeSwitchText.textContent = '还没有账号？';
            modeSwitchBtn.textContent = '立即注册';
            submitText.textContent = '登录';
        } else {
            title.textContent = '用户注册';
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            modeSwitchText.textContent = '已有账号？';
            modeSwitchBtn.textContent = '立即登录';
            submitText.textContent = '注册';
        }
    }

    /**
     * 处理表单提交
     */
    async handleSubmit() {
        if (this.isLoading) return;

        this.setLoading(true);

        try {
            if (this.currentMode === 'login') {
                await this.handleLogin();
            } else {
                await this.handleRegister();
            }
            this.hide();
        } catch (error) {
            console.error('认证失败:', error);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * 处理登录
     */
    async handleLogin() {
        const username = dom.get('#login-username').value.trim();
        const password = dom.get('#login-password').value;

        if (!username || !password) {
            throw new Error('请填写完整信息');
        }

        await authService.login({ username, password });
    }

    /**
     * 处理注册
     */
    async handleRegister() {
        const username = dom.get('#register-username').value.trim();
        const email = dom.get('#register-email').value.trim();
        const password = dom.get('#register-password').value;
        const confirmPassword = dom.get('#register-confirm-password').value;

        // 验证输入
        if (!username || !email || !password || !confirmPassword) {
            throw new Error('请填写完整信息');
        }

        if (username.length < 3 || username.length > 20) {
            throw new Error('用户名长度必须在3-20个字符之间');
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            throw new Error('用户名只能包含字母、数字和下划线');
        }

        if (password.length < 6) {
            throw new Error('密码至少需要6位字符');
        }

        if (password !== confirmPassword) {
            throw new Error('两次输入的密码不一致');
        }

        await authService.register({ username, email, password });
        
        // 注册成功后切换到登录模式
        this.currentMode = 'login';
        this.updateMode();
        dom.get('#login-username').value = username;
    }

    /**
     * 设置加载状态
     */
    setLoading(loading) {
        this.isLoading = loading;
        const submitBtn = dom.get('#auth-submit-btn');
        const submitText = dom.get('#submit-text');
        const submitLoading = dom.get('#submit-loading');

        if (loading) {
            submitBtn.disabled = true;
            submitText.classList.add('opacity-50');
            submitLoading.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            submitText.classList.remove('opacity-50');
            submitLoading.classList.add('hidden');
        }
    }

    /**
     * 重置表单
     */
    resetForm() {
        const forms = this.modal.querySelectorAll('form');
        forms.forEach(form => form.reset());
        this.setLoading(false);
    }

    /**
     * 切换密码显示/隐藏
     */
    togglePassword(inputId) {
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
}

// 创建全局实例
export const authModal = new AuthModal();

// 挂载到 window 对象，供 HTML 中的 onclick 事件使用
window.authModal = authModal; 