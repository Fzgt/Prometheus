/**
 * =============================================================================
 * 📖 主题切换按钮 (Theme Toggle Component)
 * =============================================================================
 *
 * 【知识点 - as const 在数组字面量中的用法】
 * { value: 'light' as const } 让 value 的类型是 'light'（字面量类型），
 * 而不是 string。这确保 setTheme(nextOption.value) 的参数类型安全。
 *
 * 【UI 设计 - 三态循环切换】
 * 而不是用下拉菜单或三个按钮，这里用一个按钮循环切换：
 *   light → dark → system → light → ...
 * 好处：节省空间，交互简单。
 * 缺点：用户需要点击多次才能到达目标状态。
 *
 * 对于移动端来说，这种简洁的交互方式更合适。
 * =============================================================================
 */
import { Monitor, Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import { useThemeStore } from '../store';

/**
 * 主题选项配置
 * as const 确保 value 的类型是字面量而非 string
 */
const options = [
	{ value: 'light' as const, icon: Sun, label: '浅色' },
	{ value: 'dark' as const, icon: Moon, label: '深色' },
	{ value: 'system' as const, icon: Monitor, label: '跟随系统' },
];

export function ThemeToggle({ className }: { className?: string }) {
	const { theme, setTheme } = useThemeStore();

	// 找到当前主题在数组中的索引
	const currentIndex = options.findIndex((o) => o.value === theme);
	// 计算下一个选项（循环：最后一个 → 第一个）
	// % options.length 实现循环（取模运算）
	const nextOption = options[(currentIndex + 1) % options.length];
	// 当前图标（使用可选链 ?. 防止 findIndex 返回 -1 的情况）
	const CurrentIcon = options[currentIndex]?.icon ?? Sun;

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(nextOption.value)}
			className={cn('h-9 w-9', className)}
			// title 属性：鼠标悬停时显示提示文字
			title={`当前: ${options[currentIndex]?.label}，点击切换为${nextOption.label}`}
		>
			<CurrentIcon className="size-4" />
			{/* sr-only：仅屏幕阅读器可见的文本 */}
			<span className="sr-only">切换主题</span>
		</Button>
	);
}
