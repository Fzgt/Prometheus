/**
 * =============================================================================
 * 📖 Axios HTTP 客户端封装 (API Client)
 * =============================================================================
 *
 * 【知识点 - 为什么要封装 Axios？】
 * 直接在组件中写 axios.get('/api/posts') 有几个问题：
 *   1. baseURL、headers 等配置需要每次都写
 *   2. 错误处理逻辑重复（每个请求都要 catch）
 *   3. 认证 token 注入到处散落
 *
 * 封装成统一的 api 实例后：
 *   - 配置只写一次（baseURL、withCredentials、headers）
 *   - 拦截器（interceptor）统一处理请求/响应
 *   - 全局错误通知只需定义一处
 *
 * 【架构位置 - lib/ 目录】
 * lib/ 存放的是"第三方库的封装层"：
 *   - api-client.ts：Axios 封装
 *   - react-query.ts：React Query 配置
 *   - markdown.ts：Shiki 高亮器
 * 这些是"基础设施代码"，不包含业务逻辑，任何 feature 都可以使用。
 * =============================================================================
 */
import Axios, { InternalAxiosRequestConfig } from 'axios';

import { useNotifications } from '@/components/ui/notifications';
import { env } from '@/config/env';

/**
 * 【Axios 请求拦截器】
 * 每个请求发出前都会经过这个函数。
 *
 * 【TS 技巧 - InternalAxiosRequestConfig 类型】
 * Axios v1.x 中，请求拦截器的 config 类型是 InternalAxiosRequestConfig，
 * 而非 AxiosRequestConfig。这是因为 internal 版本包含了 headers 的 AxiosHeaders 类型。
 *
 * withCredentials: true 的作用：
 * → 跨域请求时携带 Cookie（如果后端用 Cookie-based 认证）
 * → 对于 MSW mock 环境无影响，但保留了真实 API 的兼容性
 */
function defaultRequestInterceptor(config: InternalAxiosRequestConfig) {
	if (config.headers) {
		config.headers.Accept = 'application/json';
	}
	config.withCredentials = true;
	return config;
}

/**
 * 创建 Axios 实例
 *
 * 【为什么用 Axios.create() 而不是直接用 axios？】
 * - axios（默认实例）是全局共享的，修改配置会影响所有使用者
 * - Axios.create() 创建独立实例，配置隔离
 * - 一个项目可能对接多个 API（如主 API + 文件上传 API），每个用独立实例
 */
export const api = Axios.create({
	baseURL: env.API_URL,
});

// 注册请求拦截器
api.interceptors.request.use(defaultRequestInterceptor);

/**
 * 【Axios 响应拦截器 - 最重要的封装点】
 *
 * 拦截器接受两个函数：
 *   1. 成功处理函数（2xx 响应）
 *   2. 错误处理函数（非 2xx 响应 + 网络错误）
 */
api.interceptors.response.use(
	/**
	 * 【成功拦截 - 解包 response.data】
	 * Axios 默认返回的是 { data, status, headers, config, ... } 的完整响应对象。
	 * 但我们通常只需要 response.data（服务器返回的 JSON 数据）。
	 *
	 * 通过拦截器直接 return response.data，后续代码可以这样写：
	 *   const posts = await api.get('/api/posts'); // 直接得到 JSON 数据
	 * 而不需要：
	 *   const { data: posts } = await api.get('/api/posts'); // 解构 data
	 *
	 * 注意：这个拦截器改变了 Axios 的返回类型，可能需要配合 TS 类型声明使用。
	 */
	(response) => {
		return response.data;
	},
	/**
	 * 【错误拦截 - 全局错误通知】
	 *
	 * 所有 HTTP 错误（4xx、5xx、网络错误）都会在这里被拦截。
	 *
	 * 【Zustand 在 React 外使用的技巧】
	 * useNotifications 是一个 Zustand store hook，通常在 React 组件中使用。
	 * 但 Zustand 也支持在 React 外部通过 .getState() 直接访问 store 状态。
	 * 这是 Zustand 比 Context 更灵活的地方——不依赖组件树！
	 *
	 * 常见面试题：
	 * Q: "你怎么在 Axios 拦截器中触发 Toast 通知？"
	 * A: "用 Zustand store 的 getState()，它不需要在 React 组件内调用。"
	 */
	(error) => {
		// 优先使用后端返回的错误信息，没有则用 Axios 自带的错误描述
		const message = error.response?.data?.message || error.message;
		useNotifications.getState().addNotification({
			type: 'error',
			title: '请求失败',
			message,
		});
		// 必须 reject，否则调用方的 .catch() / try-catch 不会执行
		return Promise.reject(error);
	},
);
