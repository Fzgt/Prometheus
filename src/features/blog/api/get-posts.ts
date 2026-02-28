/**
 * =============================================================================
 * 📖 获取文章列表 API (Get Posts API)
 * =============================================================================
 *
 * 【核心架构模式 - API 层三件套】
 * 这是 bulletproof-react 最核心的模式。每个 API 文件导出三样东西：
 *
 *   1. API 函数（getPosts）：纯函数，发送 HTTP 请求
 *   2. queryOptions 工厂（getPostsQueryOptions）：React Query 的查询配置
 *   3. 自定义 Hook（usePosts）：组件层使用的封装
 *
 * 为什么这样设计？
 *   - queryKey 只在一处定义（queryOptions 中），避免不一致导致缓存不命中
 *   - API 函数可以独立测试（不依赖 React）
 *   - queryOptions 可以被 Router loader 复用（数据预取）
 *   - Hook 为组件提供最简洁的使用方式
 *
 * 【数据流向】
 * 组件调用 usePosts() → 内部调用 useQuery(queryOptions)
 *   → queryOptions 中的 queryFn 调用 getPosts()
 *     → getPosts 通过 api.get() 发送 HTTP 请求
 *       → MSW 拦截请求 → 返回 mock 数据
 *       → 或真实后端返回数据
 * =============================================================================
 */
import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { type QueryConfig } from '@/lib/react-query';
import { type PostsResponse } from '@/types/api';

/** API 函数的参数类型 */
export type GetPostsOptions = {
	page?: number; // 分页页码
	tag?: string; // 按标签筛选
};

/**
 * 第 1 层：纯 API 函数
 *
 * 【为什么返回类型要显式标注 Promise<PostsResponse>？】
 * 因为 api.get() 经过响应拦截器后返回 response.data（类型是 any）。
 * 显式标注确保类型安全，调用方能得到正确的类型推断。
 *
 * 【Axios params 参数】
 * { params: options } 会自动将对象转为 URL 查询参数：
 *   { page: 2, tag: 'React' } → /api/posts?page=2&tag=React
 */
export const getPosts = (
	options: GetPostsOptions = {},
): Promise<PostsResponse> => {
	return api.get('/api/posts', { params: options });
};

/**
 * 第 2 层：queryOptions 工厂函数
 *
 * 【TanStack Query v5 - queryOptions 函数】
 * queryOptions() 返回一个配置对象，包含 queryKey + queryFn。
 * 这是 v5 的推荐写法，优势：
 *   1. 完美的类型推断（queryKey 和返回数据类型自动关联）
 *   2. 可被 useQuery、prefetchQuery、ensureQueryData 等复用
 *   3. queryKey 集中管理，不会出现同一份数据两个不同的 key
 *
 * 【queryKey 的设计原则】
 * ['posts', options] 中：
 *   - 'posts' 是命名空间（所有文章查询共享）
 *   - options 是变量部分（不同页码/标签生成不同的缓存条目）
 * React Query 用 JSON 深比较来判断 queryKey 是否变化。
 */
export const getPostsQueryOptions = (options: GetPostsOptions = {}) => {
	return queryOptions({
		queryKey: ['posts', options],
		queryFn: () => getPosts(options),
	});
};

/**
 * 第 3 层：自定义 Hook（组件层使用）
 *
 * 【QueryConfig 的作用】
 * 允许调用方覆盖查询配置，但不能覆盖 queryKey 和 queryFn。
 * 例如：usePosts({ queryConfig: { enabled: false } }) → 禁用自动请求
 *
 * 【展开运算符的覆盖顺序】
 * { ...getPostsQueryOptions(options), ...queryConfig }
 * → 如果 queryConfig 中有与 queryOptions 相同的属性，后者覆盖前者
 * → 但 queryKey 和 queryFn 已被 QueryConfig 类型排除，所以不会被覆盖
 */
type UsePostsOptions = {
	options?: GetPostsOptions;
	queryConfig?: QueryConfig<typeof getPostsQueryOptions>;
};

export const usePosts = ({
	options = {},
	queryConfig,
}: UsePostsOptions = {}) => {
	return useQuery({
		...getPostsQueryOptions(options),
		...queryConfig,
	});
};
