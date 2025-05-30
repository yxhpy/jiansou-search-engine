/**
 * 壁纸管理器
 * 负责管理和切换随机壁纸
 */

export class WallpaperManager {
    constructor() {
        this.currentWallpaper = null;
        this.wallpaperSources = [
            'unsplash',
            'picsum',
            'bing'
        ];
        // 默认使用必应壁纸
        this.currentSource = localStorage.getItem('wallpaper-source') || 'bing';
        // 默认启用壁纸功能
        this.isEnabled = localStorage.getItem('wallpaper-enabled') !== 'false';
        this.changeInterval = parseInt(localStorage.getItem('wallpaper-interval')) || 30; // 分钟
        this.intervalId = null;
        
        this.init();
    }

    /**
     * 初始化壁纸管理器
     */
    async init() {
        if (this.isEnabled) {
            await this.loadWallpaper();
            this.startAutoChange();
        }
        
        this.createControls();
    }

    /**
     * 加载数据 - 保持与其他管理器的一致性
     */
    async loadData() {
        // 壁纸管理器不需要从服务器加载数据，直接返回
        return Promise.resolve();
    }

    /**
     * 获取可用的壁纸源
     */
    async getWallpaperSources() {
        try {
            const response = await fetch('/api/wallpaper/sources');
            if (response.ok) {
                const data = await response.json();
                return data.sources;
            } else {
                console.warn('获取壁纸源失败，使用默认配置');
                return this.getDefaultSources();
            }
        } catch (error) {
            console.error('获取壁纸源时出错:', error);
            return this.getDefaultSources();
        }
    }

    /**
     * 获取默认壁纸源配置
     */
    getDefaultSources() {
        return [
            {
                id: 'unsplash',
                name: 'Unsplash',
                description: '高质量摄影作品',
                supports_category: true,
                supports_blur: false
            },
            {
                id: 'picsum',
                name: 'Lorem Picsum',
                description: '随机精美图片',
                supports_category: false,
                supports_blur: true
            },
            {
                id: 'bing',
                name: '必应每日壁纸',
                description: '微软必应每日精选',
                supports_category: false,
                supports_blur: false
            }
        ];
    }

    /**
     * 获取随机壁纸URL
     */
    getRandomWallpaperUrl() {
        // 获取屏幕实际尺寸，考虑设备像素比
        const devicePixelRatio = window.devicePixelRatio || 1;
        const screenWidth = window.screen.width * devicePixelRatio;
        const screenHeight = window.screen.height * devicePixelRatio;
        
        // 确保最小分辨率，提高图片质量
        const minWidth = 1920;
        const minHeight = 1080;
        
        // 使用Math.round确保得到整数，避免API参数验证错误
        const width = Math.round(Math.max(screenWidth, minWidth));
        const height = Math.round(Math.max(screenHeight, minHeight));
        
        // 再次确保是整数，防止任何浮点数问题
        const finalWidth = parseInt(width, 10);
        const finalHeight = parseInt(height, 10);
        
        console.log(`请求壁纸尺寸: ${finalWidth}x${finalHeight} (设备像素比: ${devicePixelRatio})`);
        
        const baseUrl = '/api/wallpaper/random';
        const params = new URLSearchParams({
            source: this.currentSource,
            width: finalWidth.toString(),
            height: finalHeight.toString(),
            t: Date.now().toString() // 防止缓存
        });
        
        // 根据不同源添加特定参数
        switch (this.currentSource) {
            case 'unsplash':
                params.append('category', 'nature');
                // 添加质量参数
                params.append('quality', '95');
                break;
            case 'picsum':
                // 可以添加模糊效果参数
                // params.append('blur', '1');
                break;
            case 'bing':
                // 必应壁纸不需要额外参数
                break;
        }
        
        return `${baseUrl}?${params.toString()}`;
    }

    /**
     * 加载壁纸
     */
    async loadWallpaper() {
        try {
            const wallpaperUrl = this.getRandomWallpaperUrl();
            
            // 预加载图片
            const img = new Image();
            
            return new Promise((resolve, reject) => {
                // 设置超时
                const timeout = setTimeout(() => {
                    console.warn('壁纸加载超时，使用默认背景');
                    this.applyDefaultBackground();
                    reject(new Error('壁纸加载超时'));
                }, 15000); // 增加到15秒超时，因为后端代理可能需要更多时间
                
                img.onload = () => {
                    clearTimeout(timeout);
                    this.applyWallpaper(wallpaperUrl, img);
                    this.currentWallpaper = wallpaperUrl;
                    this.showNotification('壁纸加载成功', 'info');
                    resolve();
                };
                
                img.onerror = () => {
                    clearTimeout(timeout);
                    console.warn('壁纸加载失败，使用默认背景');
                    this.applyDefaultBackground();
                    reject(new Error('壁纸加载失败'));
                };
                
                img.src = wallpaperUrl;
            });
        } catch (error) {
            console.error('加载壁纸时出错:', error);
            this.applyDefaultBackground();
            // 显示用户友好的错误提示
            this.showNotification('壁纸加载失败，已恢复默认背景', 'warning');
        }
    }

    /**
     * 应用壁纸
     */
    applyWallpaper(url, imgElement = null) {
        const body = document.body;
        
        // 创建壁纸容器
        let wallpaperContainer = document.getElementById('wallpaper-container');
        if (!wallpaperContainer) {
            wallpaperContainer = document.createElement('div');
            wallpaperContainer.id = 'wallpaper-container';
            wallpaperContainer.className = 'wallpaper-container';
            body.insertBefore(wallpaperContainer, body.firstChild);
        }
        
        // 添加加载状态
        wallpaperContainer.classList.add('loading');
        wallpaperContainer.classList.remove('loaded');
        
        // 设置壁纸，确保全屏覆盖
        wallpaperContainer.style.backgroundImage = `url(${url})`;
        wallpaperContainer.style.backgroundSize = 'cover';
        wallpaperContainer.style.backgroundPosition = 'center';
        wallpaperContainer.style.backgroundRepeat = 'no-repeat';
        wallpaperContainer.style.width = '100vw';
        wallpaperContainer.style.height = '100vh';
        wallpaperContainer.style.position = 'fixed';
        wallpaperContainer.style.top = '0';
        wallpaperContainer.style.left = '0';
        wallpaperContainer.style.zIndex = '-2';
        
        // 添加遮罩层以确保文字可读性
        let overlay = document.getElementById('wallpaper-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'wallpaper-overlay';
            overlay.className = 'wallpaper-overlay';
            wallpaperContainer.appendChild(overlay);
        }
        
        // 智能调整遮罩透明度
        if (imgElement) {
            this.adjustOverlayOpacity(overlay, imgElement);
        }
        
        // 更新body样式
        body.classList.add('has-wallpaper');
        
        // 确保页面元素层级正确
        this.adjustElementLayers();
        
        // 延迟显示壁纸，创建淡入效果
        setTimeout(() => {
            wallpaperContainer.classList.remove('loading');
            wallpaperContainer.classList.add('loaded');
        }, 100);
    }

    /**
     * 根据图片亮度智能调整遮罩透明度
     */
    adjustOverlayOpacity(overlay, imgElement) {
        try {
            // 创建canvas来分析图片亮度
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 设置较小的canvas尺寸以提高性能
            canvas.width = 100;
            canvas.height = 100;
            
            // 绘制图片到canvas
            ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
            
            // 获取图片数据
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // 计算平均亮度
            let totalBrightness = 0;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                // 使用加权平均计算亮度
                const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
                totalBrightness += brightness;
            }
            
            const avgBrightness = totalBrightness / (data.length / 4);
            
            // 根据亮度调整遮罩透明度
            let overlayOpacity;
            if (avgBrightness > 180) {
                // 亮色图片，使用较低透明度
                overlayOpacity = 0.2;
            } else if (avgBrightness > 120) {
                // 中等亮度，使用中等透明度
                overlayOpacity = 0.3;
            } else {
                // 暗色图片，使用较高透明度
                overlayOpacity = 0.4;
            }
            
            // 应用遮罩透明度
            overlay.style.background = `rgba(255, 255, 255, ${overlayOpacity})`;
            
            console.log(`图片平均亮度: ${avgBrightness.toFixed(1)}, 遮罩透明度: ${overlayOpacity}`);
            
        } catch (error) {
            console.warn('无法分析图片亮度，使用默认遮罩:', error);
            // 使用默认遮罩透明度
            overlay.style.background = 'rgba(255, 255, 255, 0.3)';
        }
    }

    /**
     * 调整页面元素层级，确保在壁纸之上正确显示
     */
    adjustElementLayers() {
        // 确保主要内容区域在壁纸之上
        const mainElements = [
            'nav', 'main', 'footer', 
            '.search-container', '.quick-links-container',
            '#search-container', '#quick-links-container'
        ];
        
        mainElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element && !element.style.position) {
                    element.style.position = 'relative';
                    element.style.zIndex = '1';
                }
            });
        });
    }

    /**
     * 应用默认背景
     */
    applyDefaultBackground() {
        const wallpaperContainer = document.getElementById('wallpaper-container');
        if (wallpaperContainer) {
            wallpaperContainer.remove();
        }
        document.body.classList.remove('has-wallpaper');
    }

    /**
     * 切换壁纸
     */
    async changeWallpaper() {
        if (!this.isEnabled) return;
        
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.remove('hidden');
        }
        
        try {
            await this.loadWallpaper();
        } finally {
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }
        }
    }

    /**
     * 开始自动切换
     */
    startAutoChange() {
        this.stopAutoChange();
        if (this.changeInterval > 0) {
            this.intervalId = setInterval(() => {
                this.changeWallpaper();
            }, this.changeInterval * 60 * 1000);
        }
    }

    /**
     * 停止自动切换
     */
    stopAutoChange() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * 切换壁纸源
     */
    setSource(source) {
        if (this.wallpaperSources.includes(source)) {
            this.currentSource = source;
            localStorage.setItem('wallpaper-source', source);
            if (this.isEnabled) {
                this.changeWallpaper();
            }
        }
    }

    /**
     * 启用/禁用壁纸
     */
    toggle(enabled) {
        this.isEnabled = enabled;
        localStorage.setItem('wallpaper-enabled', enabled.toString());
        
        if (enabled) {
            this.loadWallpaper();
            this.startAutoChange();
        } else {
            this.applyDefaultBackground();
            this.stopAutoChange();
        }
    }

    /**
     * 设置切换间隔
     */
    setInterval(minutes) {
        this.changeInterval = minutes;
        localStorage.setItem('wallpaper-interval', minutes.toString());
        
        if (this.isEnabled) {
            this.startAutoChange();
        }
    }

    /**
     * 创建壁纸控制面板
     */
    createControls() {
        // 在导航栏添加壁纸控制按钮
        const nav = document.querySelector('nav .max-w-6xl');
        if (nav) {
            // 查找导航栏右侧区域
            let rightSection = nav.querySelector('.hidden.sm\\:flex');
            
            if (rightSection) {
                const wallpaperBtn = document.createElement('a');
                wallpaperBtn.href = '#';
                wallpaperBtn.id = 'wallpaper-toggle-btn';
                wallpaperBtn.className = 'nav-link text-sm flex items-center gap-1';
                wallpaperBtn.innerHTML = `
                    <i class="fas fa-image text-xs"></i>
                    <span class="hidden md:inline">壁纸</span>
                `;
                wallpaperBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showControlPanel();
                });
                
                rightSection.appendChild(wallpaperBtn);
            }
        }
    }

    /**
     * 显示控制面板
     */
    async showControlPanel() {
        // 获取壁纸源信息
        const sources = await this.getWallpaperSources();
        
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'wallpaper-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        // 生成壁纸源选项
        const sourceOptions = sources.map(source => 
            `<option value="${source.id}" ${this.currentSource === source.id ? 'selected' : ''}>
                ${source.name} - ${source.description}
            </option>`
        ).join('');
        
        modal.innerHTML = `
            <div class="modal-content bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium text-huawei-dark">壁纸设置</h3>
                    <button id="close-wallpaper-modal" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <!-- 启用开关 -->
                    <div class="wallpaper-setting-item flex items-center justify-between">
                        <label class="text-sm text-gray-700">启用壁纸</label>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="wallpaper-enabled" class="sr-only peer" ${this.isEnabled ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-huawei-blue"></div>
                        </label>
                    </div>
                    
                    <!-- 壁纸源选择 -->
                    <div class="wallpaper-setting-item">
                        <label class="block text-sm text-gray-700 mb-2">壁纸源</label>
                        <select id="wallpaper-source" class="w-full p-2 border border-gray-300 rounded-md text-sm">
                            ${sourceOptions}
                        </select>
                        <p class="text-xs text-gray-500 mt-1">通过后端代理服务获取，解决跨域问题</p>
                    </div>
                    
                    <!-- 切换间隔 -->
                    <div class="wallpaper-setting-item">
                        <label class="block text-sm text-gray-700 mb-2">自动切换间隔 (分钟)</label>
                        <select id="wallpaper-interval" class="w-full p-2 border border-gray-300 rounded-md text-sm">
                            <option value="0" ${this.changeInterval === 0 ? 'selected' : ''}>不自动切换</option>
                            <option value="5" ${this.changeInterval === 5 ? 'selected' : ''}>5分钟</option>
                            <option value="15" ${this.changeInterval === 15 ? 'selected' : ''}>15分钟</option>
                            <option value="30" ${this.changeInterval === 30 ? 'selected' : ''}>30分钟</option>
                            <option value="60" ${this.changeInterval === 60 ? 'selected' : ''}>1小时</option>
                        </select>
                    </div>
                    
                    <!-- 状态信息 -->
                    <div class="wallpaper-setting-item">
                        <div class="text-xs text-gray-500 space-y-1">
                            <div>当前状态: ${this.isEnabled ? '已启用' : '已禁用'}</div>
                            <div>当前源: ${sources.find(s => s.id === this.currentSource)?.name || this.currentSource}</div>
                            <div>屏幕尺寸: ${window.innerWidth}x${window.innerHeight}</div>
                        </div>
                    </div>
                    
                    <!-- 操作按钮 -->
                    <div class="flex gap-2 pt-4">
                        <button id="change-wallpaper-now" class="btn btn-primary flex-1">
                            <i class="fas fa-sync-alt mr-2"></i>立即切换
                        </button>
                        <button id="reset-wallpaper" class="btn btn-secondary">
                            <i class="fas fa-undo mr-2"></i>重置
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定事件
        modal.querySelector('#close-wallpaper-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        modal.querySelector('#wallpaper-enabled').addEventListener('change', (e) => {
            this.toggle(e.target.checked);
        });
        
        modal.querySelector('#wallpaper-source').addEventListener('change', (e) => {
            this.setSource(e.target.value);
        });
        
        modal.querySelector('#wallpaper-interval').addEventListener('change', (e) => {
            this.setInterval(parseInt(e.target.value));
        });
        
        modal.querySelector('#change-wallpaper-now').addEventListener('click', () => {
            this.changeWallpaper();
        });
        
        modal.querySelector('#reset-wallpaper').addEventListener('click', () => {
            this.toggle(false);
            this.setSource('bing');
            this.setInterval(30);
            modal.remove();
        });
    }

    /**
     * 显示通知消息
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg max-w-sm ${
            type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
            type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' :
            'bg-blue-100 text-blue-800 border border-blue-300'
        }`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'} mr-2"></i>
                <span class="text-sm">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 自动移除通知
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
} 