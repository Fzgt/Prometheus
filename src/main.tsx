/**
 * =============================================================================
 * 📖 应用入口文件 (Application Entry Point)
 * =============================================================================
 *
 * 【知识点 1 - React 18 新 API: createRoot】
 * React 18 弃用了 ReactDOM.render()，改用 createRoot() 来启用并发特性
 * (Concurrent Features)，如 startTransition、useDeferredValue 等。
 *
 * 【知识点 2 - StrictMode（严格模式）】
 * StrictMode 会在开发模式下：
 *   - 让组件 render 两次，帮你发现副作用（side effect）问题
 *   - 让 useEffect 执行两次（mount → unmount → mount），确保清理函数正确
 *   - 生产环境不会生效，所以不必担心性能
 * 面试常问："为什么我的 useEffect 执行了两次？" 答：StrictMode
 *
 * 【知识点 3 - MSW (Mock Service Worker) 条件加载】
 * 这是 bulletproof-react 的经典模式：
 *   - 通过环境变量控制是否启用 API Mocking
 *   - 使用 dynamic import（动态导入）实现按需加载，不会进入生产构建
 *   - enableMocking 返回 Promise，确保 MSW 完全启动后才渲染应用
 * 这个模式让你无需后端就能开发完整前端功能
 *
 * 【知识点 4 - 启动顺序的重要性】
 * enableMocking().then(() => render) 这个链式调用确保了：
 *   1. MSW Service Worker 注册并拦截网络请求
 *   2. 内存数据库初始化完成
 *   3. 种子数据填充完成
 *   4. 然后才渲染 React 应用
 * 如果顺序错了，首屏请求可能不会被 MSW 拦截到
 * =============================================================================
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app';
import './index.css';

/**
 * 条件启用 API Mocking（MSW）
 *
 * 【TS 技巧 - import.meta.env】
 * Vite 通过 import.meta.env 暴露环境变量，只有 VITE_ 前缀的变量才会暴露给客户端。
 * 这是安全设计——防止服务端密钥泄露到浏览器。
 *
 * 【设计模式 - 动态导入（Dynamic Import）】
 * await import('./testing/mocks/browser') 使用 ES2020 动态导入语法。
 * Vite 会将 import() 的目标模块独立打包成单独的 chunk。
 * 生产环境中 ENABLE_API_MOCKING 为 false，这些代码永远不会被加载。
 * 这就是所谓的"死代码消除"（Dead Code Elimination）+ 代码分割（Code Splitting）。
 */
async function enableMocking() {
	// 如果环境变量不是 'true'，直接返回，不加载任何 mock 代码
	if (import.meta.env.VITE_APP_ENABLE_API_MOCKING !== 'true') return;

	// 动态导入 MSW 浏览器端 worker
	const { worker } = await import('./testing/mocks/browser');
	// 动态导入内存数据库初始化函数
	const { initializeDb } = await import('./testing/mocks/db');
	// 动态导入种子数据函数
	const { seedDatabase } = await import('./testing/mocks/seed-data');

	// 初始化内存数据库（从 localStorage 恢复数据）
	await initializeDb();
	// 填充种子数据（如果数据库为空，则写入示例文章和评论）
	seedDatabase();

	// 启动 MSW Service Worker
	return worker.start({
		// 'bypass'：对未定义 handler 的请求不报错，直接放行
		// 'warn'：打印警告
		// 'error'：抛出错误（适合测试环境，确保所有请求都被 mock）
		onUnhandledRequest: 'bypass',
		serviceWorker: {
			// Service Worker 文件的路径（位于 public/ 目录）
			url: '/mockServiceWorker.js',
		},
	});
}

/**
 * 应用启动流程：
 * enableMocking() → 确保 Mock 就绪 → 挂载 React 应用
 *
 * 【React 最佳实践 - 非空断言 + 防御性检查】
 * document.getElementById('root') 可能返回 null。
 * 这里用 if (!root) throw 做防御性检查，比非空断言 root! 更安全。
 * 这在面试中常被问到："你怎么处理 DOM 节点可能不存在的情况？"
 */
enableMocking().then(() => {
	const root = document.getElementById('root');
	if (!root) throw new Error('Root element not found');

	createRoot(root).render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
});
