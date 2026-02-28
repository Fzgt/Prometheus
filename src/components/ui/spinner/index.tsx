/**
 * =============================================================================
 * 📖 加载动画组件 (Spinner Component)
 * =============================================================================
 *
 * 【知识点 - 纯 CSS 加载动画】
 * 这个 Spinner 使用 Tailwind 的 animate-spin（CSS animation）实现旋转。
 * 原理：一个圆形 div，部分边框有颜色（border-t-primary），
 * 其余边框是浅色（border-border），通过旋转产生加载效果。
 *
 * 【TS 技巧 - keyof typeof 获取对象的键联合类型】
 * keyof typeof sizes → 'sm' | 'md' | 'lg' | 'xl'
 *
 * typeof sizes 得到 sizes 的类型：
 *   { sm: string; md: string; lg: string; xl: string }
 * keyof 提取所有键：
 *   'sm' | 'md' | 'lg' | 'xl'
 *
 * 这样 size prop 的类型是这个联合类型，传入 'abc' 会报错。
 *
 * 【无障碍性（a11y）】
 * role="status" → 告诉屏幕阅读器这是一个状态指示器
 * aria-label="加载中" → 提供文字描述
 * 这让视障用户也能感知到加载状态。
 * =============================================================================
 */
import { cn } from '@/utils/cn';

/**
 * 尺寸映射对象
 * 用对象而非 switch/if-else 映射样式，更简洁且 TypeScript 类型推断更好。
 */
const sizes = {
	sm: 'h-4 w-4 border-2',
	md: 'h-6 w-6 border-2',
	lg: 'h-8 w-8 border-3',
	xl: 'h-12 w-12 border-4',
};

type SpinnerProps = {
	size?: keyof typeof sizes; // 'sm' | 'md' | 'lg' | 'xl'
	className?: string;
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
	return (
		<div
			role="status"
			aria-label="加载中"
			className={cn(
				// animate-spin：CSS @keyframes rotate 360deg，无限循环
				// border-border：四条边的默认颜色（浅灰）
				// border-t-primary：顶部边框用主色调（形成旋转指示器的视觉效果）
				'animate-spin rounded-full border-border border-t-primary',
				sizes[size], // 从映射对象中获取对应尺寸的 className
				className,
			)}
		/>
	);
}
