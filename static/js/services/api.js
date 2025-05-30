/**
 * API 服务模块
 * 负责与后端API的通信
 */

import { API_ENDPOINTS } from '../utils/constants.js';

/**
 * 基础API请求类
 */
class ApiService {
    /**
     * 发送HTTP请求
     * @param {string} url 请求URL
     * @param {Object} options 请求选项
     * @returns {Promise} 请求结果
     */
    async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: '请求失败' }));
                throw new Error(error.detail || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }

    /**
     * GET请求
     * @param {string} url 请求URL
     * @param {Object} params 查询参数
     * @returns {Promise} 请求结果
     */
    async get(url, params = {}) {
        const searchParams = new URLSearchParams(params);
        const fullUrl = searchParams.toString() ? `${url}?${searchParams}` : url;
        return this.request(fullUrl, { method: 'GET' });
    }

    /**
     * POST请求
     * @param {string} url 请求URL
     * @param {Object} data 请求数据
     * @returns {Promise} 请求结果
     */
    async post(url, data = {}) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * PUT请求
     * @param {string} url 请求URL
     * @param {Object} data 请求数据
     * @returns {Promise} 请求结果
     */
    async put(url, data = {}) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * DELETE请求
     * @param {string} url 请求URL
     * @returns {Promise} 请求结果
     */
    async delete(url) {
        return this.request(url, { method: 'DELETE' });
    }
}

/**
 * 快速链接API服务
 */
export class QuickLinksApi extends ApiService {
    /**
     * 获取快速链接列表
     * @param {string} category 分类筛选
     * @returns {Promise<Array>} 快速链接列表
     */
    async getQuickLinks(category = null) {
        const params = category && category !== 'all' ? { category } : {};
        return this.get(API_ENDPOINTS.QUICK_LINKS, params);
    }

    /**
     * 创建快速链接
     * @param {Object} linkData 链接数据
     * @returns {Promise<Object>} 创建的链接
     */
    async createQuickLink(linkData) {
        return this.post(API_ENDPOINTS.QUICK_LINKS, linkData);
    }

    /**
     * 更新快速链接
     * @param {number} id 链接ID
     * @param {Object} linkData 更新数据
     * @returns {Promise<Object>} 更新后的链接
     */
    async updateQuickLink(id, linkData) {
        return this.put(`${API_ENDPOINTS.QUICK_LINKS}/${id}`, linkData);
    }

    /**
     * 删除快速链接
     * @param {number} id 链接ID
     * @returns {Promise<Object>} 删除结果
     */
    async deleteQuickLink(id) {
        return this.delete(`${API_ENDPOINTS.QUICK_LINKS}/${id}`);
    }

    /**
     * 获取分类列表
     * @returns {Promise<Array>} 分类列表
     */
    async getCategories() {
        return this.get(API_ENDPOINTS.CATEGORIES);
    }
}

/**
 * 搜索引擎API服务
 */
export class SearchEnginesApi extends ApiService {
    /**
     * 获取搜索引擎列表
     * @param {boolean} activeOnly 是否只获取活跃的搜索引擎
     * @returns {Promise<Array>} 搜索引擎列表
     */
    async getSearchEngines(activeOnly = true) {
        const params = { active_only: activeOnly };
        return this.get(API_ENDPOINTS.SEARCH_ENGINES, params);
    }

    /**
     * 创建搜索引擎
     * @param {Object} engineData 搜索引擎数据
     * @returns {Promise<Object>} 创建的搜索引擎
     */
    async createSearchEngine(engineData) {
        return this.post(API_ENDPOINTS.SEARCH_ENGINES, engineData);
    }

    /**
     * 更新搜索引擎
     * @param {number} id 搜索引擎ID
     * @param {Object} engineData 更新数据
     * @returns {Promise<Object>} 更新后的搜索引擎
     */
    async updateSearchEngine(id, engineData) {
        return this.put(`${API_ENDPOINTS.SEARCH_ENGINES}/${id}`, engineData);
    }

    /**
     * 删除搜索引擎
     * @param {number} id 搜索引擎ID
     * @returns {Promise<Object>} 删除结果
     */
    async deleteSearchEngine(id) {
        return this.delete(`${API_ENDPOINTS.SEARCH_ENGINES}/${id}`);
    }

    /**
     * 获取默认搜索引擎
     * @returns {Promise<Object>} 默认搜索引擎
     */
    async getDefaultSearchEngine() {
        return this.get(`${API_ENDPOINTS.SEARCH_ENGINES}/default`);
    }
}

/**
 * 搜索API服务
 */
export class SearchApi extends ApiService {
    /**
     * 执行搜索
     * @param {Object} searchData 搜索数据
     * @returns {Promise<Object>} 搜索结果
     */
    async search(searchData) {
        return this.post(API_ENDPOINTS.SEARCH, searchData);
    }

    /**
     * 获取搜索历史
     * @param {number} limit 限制数量
     * @returns {Promise<Array>} 搜索历史列表
     */
    async getSearchHistory(limit = 10) {
        const params = { limit };
        return this.get(API_ENDPOINTS.SEARCH_HISTORY, params);
    }
}

// 创建API服务实例
export const quickLinksApi = new QuickLinksApi();
export const searchEnginesApi = new SearchEnginesApi();
export const searchApi = new SearchApi(); 