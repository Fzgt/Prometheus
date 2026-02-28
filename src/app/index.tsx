/**
 * =============================================================================
 * 📖 App 根组件 (Root Component)
 * =============================================================================
 *
 * 【架构模式 - 关注点分离】
 * App 组件极其简洁：只做一件事——将 Provider 和 Router 组合在一起。
 * 这遵循了 bulletproof-react 的架构原则：
 *   - AppProvider：负责"全局基础设施"（错误边界、React Query、SEO 等）
 *   - AppRouter：负责"页面路由"
 *
 * 为什么不把所有 Provider 写在这里？
 * → 因为 Provider 可能有十几个，放在一个文件会很臃肿
 * → 单独抽成 provider.tsx 方便维护，也让测试更容易 mock
 *
 * 【面试考点】
 * Q: "你的 React 项目入口是怎么组织的？"
 * A: "分三层：main.tsx 做应用初始化（MSW、DOM 挂载），
 *     App 组件做 Provider + Router 组合，
 *     provider.tsx 负责聚合所有全局 Context Provider。"
 * =============================================================================
 */
import { AppProvider } from './provider';
import { AppRouter } from './router';

export function App() {
	return (
		<AppProvider>
			<AppRouter />
		</AppProvider>
	);
}
