/**
 * =============================================================================
 * 📖 React Query 配置与类型工具 (React Query Config & Type Utilities)
 * =============================================================================
 *
 * 【知识点 - TanStack Query (React Query) 核心概念】
 * React Query 把 HTTP 请求的状态管理从组件中解放出来：
 *   - 自动缓存：相同 queryKey 的请求只发一次
 *   - 自动重试：请求失败自动重试（默认 3 次）
 *   - 自动刷新：窗口聚焦时重新验证数据（stale-while-revalidate）
 *   - 自动垃圾回收：不再使用的缓存自动清理
 *
 * 这个文件做了三件事：
 *   1. 定义 QueryClient 的默认配置
 *   2. 导出复用的类型工具（减少重复的类型定义）
 * =============================================================================
 */
import { UseMutationOptions, DefaultOptions } from '@tanstack/react-query';

/**
 * 【QueryClient 默认配置】
 *
 * refetchOnWindowFocus: false
 *   → 默认情况下，用户切换浏览器标签页再回来时，React Query 会重新请求数据
 *   → 对于博客这种数据变化不频繁的场景，关闭可以减少不必要的请求
 *   → 在实时数据场景（如聊天、股票）应该保持开启
 *
 * retry: false
 *   → 关闭自动重试。默认 React Query 会在请求失败后重试 3 次
 *   → 开发阶段关闭方便调试；生产环境可以考虑开启
 *
 * staleTime: 1000 * 60 (1分钟)
 *   → "新鲜时间"：数据在 1 分钟内被视为"新鲜"，不会重新请求
 *   → 默认值是 0（每次组件挂载都重新请求）
 *   → staleTime vs cacheTime (gcTime)：
 *     - staleTime：数据多久后变"过时"（stale）
 *     - gcTime：缓存多久后被垃圾回收（默认 5 分钟）
 *
 * 【TS 技巧 - satisfies 运算符（TS 4.9+）】
 * `satisfies DefaultOptions` 的作用：
 *   - 检查 queryConfig 是否满足 DefaultOptions 的类型约束
 *   - 但不改变变量的推断类型（不像 : DefaultOptions 那样丢失具体类型）
 * 这意味着 queryConfig.queries.staleTime 的类型是 60000（字面量），
 * 而不是 number | undefined。
 */
export const queryConfig = {
	queries: {
		refetchOnWindowFocus: false,
		retry: false,
		staleTime: 1000 * 60,
	},
} satisfies DefaultOptions;

/**
 * 【TS 高级类型 - ApiFnReturnType】
 * 提取异步函数的返回值类型（去掉 Promise 包装）
 *
 * 分解理解：
 *   FnType extends (...args: any) => Promise<any>
 *     → 约束：FnType 必须是一个返回 Promise 的函数
 *   ReturnType<FnType>
 *     → 提取函数的返回类型（例如 Promise<Post[]>）
 *   Awaited<...>
 *     → 解包 Promise（例如 Promise<Post[]> → Post[]）
 *
 * 使用场景：
 *   const getPosts = (): Promise<Post[]> => api.get('/api/posts');
 *   type Result = ApiFnReturnType<typeof getPosts>; // Post[]
 */
export type ApiFnReturnType<FnType extends (...args: any) => Promise<any>> =
	Awaited<ReturnType<FnType>>;

/**
 * 【TS 高级类型 - QueryConfig】
 * 让使用者可以覆盖 queryOptions 的部分配置，但不能覆盖 queryKey 和 queryFn。
 *
 * 分解理解：
 *   T extends (...args: any[]) => any
 *     → T 是一个函数（通常是 getXxxQueryOptions 工厂函数）
 *   ReturnType<T>
 *     → 提取工厂函数的返回值（即 queryOptions 对象的类型）
 *   Omit<..., 'queryKey' | 'queryFn'>
 *     → 从返回值类型中去掉 queryKey 和 queryFn
 *     → 因为这两个应该由工厂函数内部控制，不允许外部覆盖
 *
 * 使用示例（在 get-posts.ts 中）：
 *   type UsePostsOptions = {
 *     queryConfig?: QueryConfig<typeof getPostsQueryOptions>;
 *   };
 *   → 用户可以传入 { enabled: false, staleTime: 5000 } 等配置
 *   → 但不能传入 { queryKey: [...] }（会报类型错误）
 */
export type QueryConfig<T extends (...args: any[]) => any> = Omit<
	ReturnType<T>,
	'queryKey' | 'queryFn'
>;

/**
 * 【TS 高级类型 - MutationConfig】
 * 用于 useMutation Hook 的配置类型。
 *
 * UseMutationOptions 的泛型参数（按顺序）：
 *   1. TData：变更成功后的返回值类型
 *   2. TError：错误类型
 *   3. TVariables：传入 mutationFn 的参数类型
 *
 * 分解理解：
 *   ApiFnReturnType<MutationFnType>
 *     → 提取变更函数的返回值类型（去掉 Promise 包装）
 *   Parameters<MutationFnType>[0]
 *     → 提取变更函数的第一个参数类型
 *     → 例如 createComment(data: CreateCommentInput) → CreateCommentInput
 *
 * 使用示例（在 create-comment.ts 中）：
 *   type UseCreateCommentOptions = {
 *     mutationConfig?: MutationConfig<typeof createComment>;
 *   };
 */
export type MutationConfig<
	MutationFnType extends (...args: any) => Promise<any>,
> = UseMutationOptions<
	ApiFnReturnType<MutationFnType>,
	Error,
	Parameters<MutationFnType>[0]
>;
