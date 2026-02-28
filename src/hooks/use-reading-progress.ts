/**
 * =============================================================================
 * 📖 阅读进度 Hook (Reading Progress Hook)
 * =============================================================================
 *
 * 【功能】
 * 追踪用户在页面中的滚动进度（0% ~ 100%），
 * 用于文章详情页顶部的进度条。
 *
 * 【计算公式】
 * scrollPercent = (scrollTop / scrollableHeight) * 100
 * 其中 scrollableHeight = documentHeight - windowHeight
 *   - window.scrollY：当前滚动距离（页面顶部到视口顶部的距离）
 *   - document.documentElement.scrollHeight：页面总高度（包括不可见部分）
 *   - window.innerHeight：视口高度（浏览器可见区域）
 *
 * 【性能优化 - { passive: true }】
 * scroll 事件的监听器默认可能会调用 preventDefault()（阻止默认滚动行为）。
 * 浏览器在触发 scroll 前必须等待 handler 执行完才能确定是否阻止。
 * { passive: true } 告诉浏览器："这个监听器不会调用 preventDefault()"，
 * 浏览器就可以在执行 handler 的同时继续滚动，避免卡顿。
 *
 * 这是一个重要的性能优化，Chrome DevTools 也会在 scroll/touch 监听器
 * 没有设置 passive 时给出警告。
 *
 * 【Math.min + Math.max - 边界保护】
 * Math.min(100, Math.max(0, scrollPercent)) 确保值在 [0, 100] 范围内。
 * 虽然理论上不会超出范围，但浏览器弹性滚动（elastic/bounce）
 * 可能让 scrollTop 为负数或超过 scrollableHeight。
 * =============================================================================
 */
import { useEffect, useState } from 'react';

export function useReadingProgress() {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const updateProgress = () => {
			const scrollTop = window.scrollY;
			const docHeight =
				document.documentElement.scrollHeight - window.innerHeight;
			const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
			// 钳位到 [0, 100] 范围
			setProgress(Math.min(100, Math.max(0, scrollPercent)));
		};

		// passive: true → 不阻止滚动，提升性能
		window.addEventListener('scroll', updateProgress, { passive: true });
		// 初始化时计算一次（用户可能从页面中间开始阅读）
		updateProgress();

		return () => window.removeEventListener('scroll', updateProgress);
	}, []);

	return progress;
}
