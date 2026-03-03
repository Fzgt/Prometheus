import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';

import { MainErrorFallback } from '@/components/errors/main-error-fallback';
import { Notifications } from '@/components/ui/notifications';
import { Spinner } from '@/components/ui/spinner';
import { queryConfig } from '@/lib/react-query';

type AppProviderProps = {
	children: React.ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
	const [queryClient] = React.useState(
		() => new QueryClient({ defaultOptions: queryConfig }),
	);

	return (
		<React.Suspense
			fallback={
				<div className="flex h-screen w-screen items-center justify-center">
					<Spinner size="xl" />
				</div>
			}
		>
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
