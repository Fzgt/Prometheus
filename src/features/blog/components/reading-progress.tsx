/**
 * =============================================================================
 * 📖 阅读进度条组件 (Reading Progress Bar)
 * =============================================================================
 *
 * 在页面最顶部显示一条细线，指示当前阅读进度。
 *
 * 【核心技术 - Framer Motion 的 useSpring】
 * useSpring 是 Framer Motion 的弹簧动画值（MotionValue）。
 * 它可以让数值变化产生物理弹簧效果，而不是生硬的线性过渡。
 *
 * 参数解释：
 * - stiffness: 200 → 弹簧硬度（越大 = 回弹越快）
 * - damping: 30 → 阻尼（越大 = 越快稳定，减少振荡）
 * - restDelta: 0.001 → 当变化小于此值时，认为动画结束
 *
 * 【工作原理】
 * 1. useReadingProgress() 返回 0-100 的滚动百分比
 * 2. useSpring(progress / 100) 创建一个 0-1 的弹簧动画值
 * 3. useEffect 在 progress 变化时调用 scaleX.set() 更新目标值
 * 4. motion.div 的 style={{ scaleX }} 应用这个动画值
 *
 * 【知识点 - scaleX 而非 width】
 * 为什么用 transform: scaleX() 而不是 width: xx%？
 * → transform 不会触发布局重排 (reflow)，只触发合成 (composite)
 * → 性能差异巨大：scaleX 可以在 GPU 上执行，width 需要 CPU 重新计算布局
 * → 这对高频触发的滚动事件来说非常重要
 *
 * 【知识点 - origin-left】
 * scaleX 默认从中心缩放（左右同时缩）。
 * origin-left (transform-origin: left) 让缩放从左边开始，
 * 效果就像一条从左到右增长的进度条。
 *
 * 【知识点 - MotionValue 的特殊性】
 * useSpring 返回的 scaleX 是 MotionValue，不是普通 React state。
 * MotionValue 的更新不会触发 React 重渲染！
 * 它直接操作 DOM 属性（通过 motion.div 的 style 绑定），
 * 所以即使每秒更新 60 次，也不会导致性能问题。
 * =============================================================================
 */
import { motion, useSpring } from 'framer-motion';
import { useEffect } from 'react';

import { useReadingProgress } from '@/hooks/use-reading-progress';

export function ReadingProgress() {
	// 获取当前阅读进度（0-100）
	const progress = useReadingProgress();

	/**
	 * 【创建弹簧动画值】
	 * 初始值 = progress / 100（转换为 0-1 的 scaleX 值）
	 *
	 * 弹簧参数的直觉理解：
	 * - 高 stiffness + 高 damping → 快速响应，几乎无振荡（进度条应该如此）
	 * - 低 stiffness + 低 damping → 慢慢弹跳（像果冻）
	 * - restDelta: 0.001 → 动画精度高，避免肉眼可见的"跳帧"
	 */
	const scaleX = useSpring(progress / 100, {
		stiffness: 200,
		damping: 30,
		restDelta: 0.001,
	});

	/**
	 * 【更新弹簧目标值】
	 * 当 progress 变化时（用户滚动），更新 scaleX 的目标值。
	 * useSpring 会自动以弹簧动画过渡到新值。
	 *
	 * 注意：scaleX.set() 不会触发重渲染，
	 * 它直接更新 MotionValue → 直接更新 DOM transform → 非常高效
	 */
	useEffect(() => {
		scaleX.set(progress / 100);
	}, [progress, scaleX]);

	return (
		<motion.div
			/**
			 * fixed inset-x-0 top-0 → 固定在页面最顶部，左右铺满
			 * z-50 → 在所有内容之上
			 * h-0.5 → 高度 2px（细线）
			 * origin-left → 从左边开始缩放
			 * bg-primary → 使用主色调
			 */
			className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-primary"
			/**
			 * 【style 绑定 MotionValue】
			 * 当 scaleX（MotionValue）变化时，
			 * Framer Motion 直接更新 DOM 的 transform: scaleX(xxx)
			 * 不经过 React 渲染循环，性能极佳
			 */
			style={{ scaleX }}
		/>
	);
}
