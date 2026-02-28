/**
 * =============================================================================
 * 📖 路由配置 (Router Configuration)
 * =============================================================================
 *
 * 【知识点 1 - React Router 7 的 Library 模式】
 * React Router 7 有两种模式：
 *   - Framework 模式：类似 Next.js，支持 SSR、文件系统路由
 *   - Library 模式：纯客户端 SPA 路由（本项目采用此模式）
 *
 * createBrowserRouter 是 React Router 7 推荐的路由创建方式，替代了旧的
 * <BrowserRouter> + <Routes> 声明式写法。它支持：
 *   - Data API（loader、action）
 *   - 嵌套路由（nested routes）
 *   - 错误边界（errorElement）
 *
 * 【知识点 2 - React.lazy 与代码分割（Code Splitting）】
 * React.lazy() 让你可以定义动态加载的组件。配合 Suspense 使用时：
 *   1. 首次访问路由 → 触发 import() → Suspense 显示 loading
 *   2. chunk 加载完毕 → 组件渲染
 *   3. 再次访问 → 直接从缓存读取，不再重新加载
 *
 * Vite 会自动将每个 import() 目标打包为独立的 chunk（代码块），
 * 这意味着用户只下载当前页面需要的 JS，而不是整个应用。
 *
 * 【知识点 3 - .then((m) => ({ default: m.HomePage })) 的作用】
 * React.lazy 要求动态导入返回一个 { default: Component } 格式的模块。
 * 但我们的路由文件使用命名导出（export function HomePage），而非默认导出。
 * .then() 中的转换就是把命名导出适配成 React.lazy 需要的 default 导出格式。
 * 这是一个常见的模式，因为命名导出比默认导出更利于重构和 IDE 重命名。
 *
 * 【知识点 4 - 嵌套路由与 Outlet】
 * 所有子路由都嵌套在 RootLayout 下：
 *   - RootLayout 提供 Header、Footer、Suspense 等通用布局
 *   - 子路由内容通过 <Outlet /> 渲染在 RootLayout 的指定位置
 *   - 这避免了每个页面重复定义布局代码
 * =============================================================================
 */
import * as React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { RootLayout } from './root-layout';

/**
 * 懒加载各页面组件
 *
 * 【为什么使用模块级变量而非组件内定义？】
 * React.lazy 的结果会被缓存，只在首次访问时加载。
 * 如果写在组件内，每次组件重渲染都会创建新的 lazy 包装器，
 * 导致每次都重新加载，丧失了代码分割的缓存优势。
 */
const HomePage = React.lazy(() =>
	import('./routes/home').then((m) => ({ default: m.HomePage })),
);
const PostDetailPage = React.lazy(() =>
	import('./routes/post/post').then((m) => ({ default: m.PostDetailPage })),
);
const AboutPage = React.lazy(() =>
	import('./routes/about').then((m) => ({ default: m.AboutPage })),
);
const TagPage = React.lazy(() =>
	import('./routes/tags/tag').then((m) => ({ default: m.TagPage })),
);
const NotFoundPage = React.lazy(() =>
	import('./routes/not-found').then((m) => ({ default: m.NotFoundPage })),
);

/**
 * 路由配置对象
 *
 * 【路由结构解析】
 * - 最外层没有 path，只有 element: <RootLayout />
 *   → 这是"布局路由"（Layout Route），所有子路由共享这个布局
 *
 * - index: true
 *   → "索引路由"，当父路由路径完全匹配时渲染（即访问 "/" 时显示 HomePage）
 *
 * - path: 'posts/:slug'
 *   → :slug 是动态路由参数，组件中通过 useParams() 读取
 *   → 例如 /posts/react-hooks-deep-dive → slug = "react-hooks-deep-dive"
 *
 * - path: '*'
 *   → 通配符路由，匹配所有未定义的路径（404 页面）
 *   → 必须放在最后，否则会拦截其他路由
 */
const router = createBrowserRouter([
	{
		element: <RootLayout />,
		children: [
			{
				index: true,
				element: <HomePage />,
			},
			{
				path: 'posts/:slug',
				element: <PostDetailPage />,
			},
			{
				path: 'about',
				element: <AboutPage />,
			},
			{
				path: 'tags/:tag',
				element: <TagPage />,
			},
			{
				path: '*',
				element: <NotFoundPage />,
			},
		],
	},
]);

/**
 * 【RouterProvider 与旧版写法的对比】
 * 旧版 React Router（v5/v6 早期）：
 *   <BrowserRouter>
 *     <Routes>
 *       <Route path="/" element={<Home />} />
 *     </Routes>
 *   </BrowserRouter>
 *
 * 新版 React Router 7：
 *   const router = createBrowserRouter([...]);
 *   <RouterProvider router={router} />
 *
 * 新版的优势：
 *   1. 支持 Data API（loader、action）实现路由级数据预取
 *   2. 路由配置是纯数据，可以在组件外定义
 *   3. 更好的 TypeScript 支持
 */
export function AppRouter() {
	return <RouterProvider router={router} />;
}
