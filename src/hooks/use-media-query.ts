/**
 * =============================================================================
 * 📖 媒体查询 Hook (Media Query Hook)
 * =============================================================================
 *
 * 【知识点 - 在 React 中响应窗口变化】
 * CSS 媒体查询（@media）只能在样式层面生效。
 * 有时你需要在 JS 逻辑中根据屏幕大小做判断，比如：
 *   - 桌面端展示 TOC 侧边栏，移动端隐藏
 *   - 桌面端用 Dialog，移动端用 Sheet（底部弹出）
 *   - 根据屏幕大小加载不同质量的图片
 *
 * 【window.matchMedia API】
 * 浏览器原生 API，接受一个 CSS 媒体查询字符串，返回 MediaQueryList 对象：
 *   - .matches：当前是否匹配（布尔值）
 *   - .addEventListener('change', handler)：监听匹配状态变化
 *
 * 【useState 惰性初始化】
 * useState(() => window.matchMedia(query).matches)
 * 使用函数形式初始化，有两个好处：
 *   1. typeof window === 'undefined' 的检查在 SSR 环境中必要
 *   2. 函数只在首次渲染执行，避免每次渲染都调用 matchMedia
 *
 * 【useEffect 清理函数】
 * return () => mediaQuery.removeEventListener('change', handler);
 * 组件卸载或 query 变化时移除监听器，防止内存泄漏。
 * 这是 useEffect 的核心模式："建立 → 清理"。
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 * =============================================================================
 */
import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState<boolean>(() => {
		// SSR 安全检查：服务端渲染时没有 window 对象
		if (typeof window === 'undefined') return false;
		return window.matchMedia(query).matches;
	});

	useEffect(() => {
		const mediaQuery = window.matchMedia(query);
		// MediaQueryListEvent 包含 matches 属性
		const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

		// 监听媒体查询变化（如用户调整浏览器窗口大小）
		mediaQuery.addEventListener('change', handler);
		// 清理函数：组件卸载时移除监听，防止内存泄漏
		return () => mediaQuery.removeEventListener('change', handler);
	}, [query]); // query 变化时重新建立监听

	return matches;
}
