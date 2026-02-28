/**
 * =============================================================================
 * 📖 路由切换时滚动到顶部 (Scroll to Top on Route Change)
 * =============================================================================
 *
 * 【为什么需要这个 Hook？】
 * SPA（单页应用）的路由切换不会刷新页面，所以滚动位置会被保留。
 * 例如：用户在首页滚动到底部 → 点击一篇文章 → 文章页也从底部开始
 * 这是一个常见的 UX 问题，需要手动处理。
 *
 * 【React Router 的 useLocation】
 * useLocation() 返回当前的 location 对象，包含：
 *   - pathname：当前路径（如 '/posts/react-hooks'）
 *   - search：查询参数（如 '?page=2'）
 *   - hash：锚点（如 '#section1'）
 *   - state：通过 navigate() 传递的状态
 *   - key：唯一标识符
 *
 * 【useEffect 依赖 pathname】
 * 当 pathname 变化时（即路由切换），执行 scrollTo。
 * behavior: 'smooth' 提供平滑滚动动画（而非瞬间跳转）。
 *
 * 注意：这个 Hook 放在 RootLayout 中，所以所有路由切换都会触发。
 * =============================================================================
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router';

export function useScrollToTop() {
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [pathname]); // pathname 变化 → 滚动到顶部
}
