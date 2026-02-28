/**
 * =============================================================================
 * 📖 全局 Provider 聚合器 (Global Provider Aggregator)
 * =============================================================================
 *
 * 【架构模式 - Provider 组合模式】
 * React 应用通常需要多个 Context Provider 包裹（俗称"Provider 地狱"）。
 * bulletproof-react 的做法是把所有 Provider 聚合到一个文件中，
 * 让 App 组件只需要一层 <AppProvider> 就够了。
 *
 * Provider 的嵌套顺序很重要，从外到内：
 *   1. Suspense     → 处理异步组件的 loading 状态
 *   2. ErrorBoundary → 捕获子组件的 JS 运行时错误
 *   3. HelmetProvider → SEO <head> 标签管理
 *   4. QueryClientProvider → React Query 数据缓存
 *
 * 【为什么这个顺序？】
 * - Suspense 在最外层，因为 ErrorBoundary 的 fallback 也可能触发 Suspense
 * - ErrorBoundary 在 Helmet 外层，因为 SEO 失败不应该白屏
 * - QueryClient 在最内层，因为它服务于具体的业务组件
 * =============================================================================
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';

import { MainErrorFallback } from '@/components/errors/main-error-fallback';
import { Notifications } from '@/components/ui/notifications';
import { Spinner } from '@/components/ui/spinner';
import { queryConfig } from '@/lib/react-query';

/**
 * 【TS 技巧 - type vs interface】
 * 这里用 type 定义 Props，因为 Props 通常是简单的对象类型。
 * 经验法则：
 *   - type：适合联合类型、交叉类型、工具类型（Omit、Pick 等）
 *   - interface：适合需要 extends/implements 的场景（类、OOP 风格）
 * 在 React 项目中，type 更常用，因为 Props 很少需要被"继承"。
 */
type AppProviderProps = {
	children: React.ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
	/**
	 * 【React 高级技巧 - useState 惰性初始化】
	 * useState(() => new QueryClient(...)) 用函数形式初始化。
	 *
	 * 为什么不直接写 const queryClient = new QueryClient()?
	 * → 因为组件每次渲染都会执行函数体，直接写会每次都创建新的 QueryClient
	 * → useState 的函数初始化只在首次渲染时执行一次
	 *
	 * 为什么不用 useRef？
	 * → useRef 也可以，但 useState 的函数初始化是社区推荐的模式
	 * → TanStack Query 官方文档也推荐这种写法
	 *
	 * 【解构中的 [queryClient] 为什么没有 setQueryClient？】
	 * → 因为 QueryClient 创建后不需要更新，所以忽略了 setter
	 */
	const [queryClient] = React.useState(
		() => new QueryClient({ defaultOptions: queryConfig }),
	);

	return (
		/**
		 * 【React 核心概念 - Suspense（悬念边界）】
		 * Suspense 捕获子组件中的"挂起"（suspend），显示 fallback。
		 * 什么会触发 Suspense？
		 *   1. React.lazy() 动态导入的组件（代码分割）
		 *   2. 使用了 useSuspenseQuery 的组件（React Query 的 Suspense 模式）
		 *   3. use() Hook 读取 Promise（React 19+）
		 *
		 * 这里的 Suspense 是"全局级"的，用于捕获最初的 lazy 路由加载。
		 * 在 RootLayout 中还有一个"页面级" Suspense，用于路由切换时的 loading。
		 */
		<React.Suspense
			fallback={
				<div className="flex h-screen w-screen items-center justify-center">
					<Spinner size="xl" />
				</div>
			}
		>
			{/**
			 * 【React 错误处理 - ErrorBoundary（错误边界）】
			 * ErrorBoundary 是 React 中唯一能捕获渲染阶段错误的机制。
			 * 它基于类组件的 componentDidCatch 和 getDerivedStateFromError。
			 *
			 * react-error-boundary 是社区最流行的封装库，提供：
			 *   - FallbackComponent：错误时显示的组件
			 *   - onError：错误回调（可上报到 Sentry 等监控平台）
			 *   - onReset：重试时的回调
			 *
			 * 注意：ErrorBoundary 不能捕获：
			 *   - 事件处理函数中的错误（用 try-catch）
			 *   - 异步代码中的错误（用 .catch() 或 try-catch）
			 *   - 服务端渲染（SSR）的错误
			 */}
			<ErrorBoundary FallbackComponent={MainErrorFallback}>
				{/**
				 * 【SEO - HelmetProvider】
				 * react-helmet-async 用于动态修改 <head> 标签（title、meta 等）。
				 * 为什么用 async 版本？
				 * → 原版 react-helmet 不支持 React 18 的并发特性
				 * → async 版本使用 React Context 而非全局状态，线程安全
				 */}
				<HelmetProvider>
					{/**
					 * 【TanStack Query - QueryClientProvider】
					 * 将 QueryClient 实例注入到 React 树中。
					 * 所有子组件都可以通过 useQuery、useMutation 等 Hook 访问缓存。
					 *
					 * QueryClient 是 React Query 的核心——它维护了：
					 *   - 查询缓存（query cache）
					 *   - 变更缓存（mutation cache）
					 *   - 默认配置（retry、staleTime 等）
					 */}
					<QueryClientProvider client={queryClient}>
						{/**
						 * 【开发工具 - ReactQueryDevtools】
						 * 只在开发环境渲染，用于查看：
						 * - 所有缓存的 query 及其状态（fresh/stale/fetching/inactive）
						 * - 每个 query 的数据和元信息
						 * - 手动触发 refetch 或 invalidate
						 *
						 * import.meta.env.DEV 是 Vite 内置的布尔变量：
						 *   - 开发模式为 true
						 *   - 生产模式为 false（构建时会被 tree-shake 掉）
						 */}
						{import.meta.env.DEV && <ReactQueryDevtools />}
						{/**
						 * 【全局通知组件】
						 * Notifications 渲染在最顶层，这样任何地方都可以触发通知。
						 * 它使用 Zustand store 而非 Context，所以不需要 Provider 包裹。
						 * 这也是 Zustand 相比 Context 的优势之一——无 Provider 地狱。
						 */}
						<Notifications />
						{children}
					</QueryClientProvider>
				</HelmetProvider>
			</ErrorBoundary>
		</React.Suspense>
	);
}
