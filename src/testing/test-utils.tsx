/**
 * =============================================================================
 * 📖 测试工具函数 (Test Utilities)
 * =============================================================================
 *
 * 【知识点 - 自定义 render 函数】
 * Testing Library 的 render() 只渲染裸组件，但真实组件通常需要：
 *   - React Query Provider（数据获取）
 *   - Router Provider（路由）
 *   - Helmet Provider（SEO）
 *   - 其他全局 Context
 *
 * 自定义 renderApp 函数包裹了所有必要的 Provider，
 * 让测试代码不需要每次都手动设置。
 *
 * 【为什么用 createMemoryRouter 而非 createBrowserRouter？】
 * - createBrowserRouter 依赖浏览器的 History API（测试环境是 jsdom）
 * - createMemoryRouter 在内存中管理路由状态，不依赖浏览器
 * - initialEntries 可以指定初始路由路径（模拟用户从某个页面开始）
 *
 * 【QueryClient 测试配置】
 * retry: false → 测试中不重试失败的请求（快速失败）
 * 如果不关闭重试，测试会等待多次重试超时后才报失败，浪费时间。
 *
 * 【userEvent.setup()】
 * @testing-library/user-event 模拟真实的用户交互：
 *   - user.click(element)：模拟鼠标点击
 *   - user.type(input, 'text')：模拟键盘输入
 *   - user.hover(element)：模拟鼠标悬停
 * 比 fireEvent 更真实（会触发完整的事件序列：focus → keydown → input → keyup 等）
 * =============================================================================
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { Notifications } from '@/components/ui/notifications';

type RenderAppOptions = {
	initialEntries?: string[]; // 初始路由路径（如 ['/posts/react-hooks']）
};

/**
 * 自定义 render 函数
 *
 * 返回值包含：
 *   - ...render() 的所有返回值（getByText、queryByRole 等）
 *   - queryClient：可用于在测试中操作缓存
 *   - user：userEvent 实例，用于模拟用户交互
 */
export function renderApp(options: RenderAppOptions = {}) {
	const { initialEntries = ['/'] } = options;

	// 创建测试专用的 QueryClient（关闭重试）
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

	// 创建内存路由（适合测试环境）
	const router = createMemoryRouter(
		[{ path: '*', element: <div data-testid="app-root" /> }],
		{ initialEntries },
	);

	// Provider 包装器
	const Wrapper = ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			<HelmetProvider>
				<Notifications />
				{children}
			</HelmetProvider>
		</QueryClientProvider>
	);

	return {
		// 展开 render 的返回值（包含各种查询函数）
		...render(<RouterProvider router={router} />, { wrapper: Wrapper }),
		queryClient,
		user: userEvent.setup(),
	};
}

// 重新导出常用的测试工具，让测试文件只需要一个 import
export { render, screen, waitFor, userEvent };
