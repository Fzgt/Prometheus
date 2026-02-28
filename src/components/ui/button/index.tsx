/**
 * =============================================================================
 * 📖 Button 组件 (Button Component)
 * =============================================================================
 *
 * 【知识点 1 - CVA (Class Variance Authority)】
 * CVA 是 Tailwind 生态中管理组件变体（variants）的最佳方案。
 * 传统做法：用一堆 if-else 拼接 className（难维护）
 * CVA 做法：声明式地定义每种变体的样式（类似 CSS-in-JS 的变体系统）
 *
 * cva(base, config) 接受：
 *   - base：所有变体共享的基础样式
 *   - config.variants：各维度的变体定义
 *   - config.defaultVariants：默认变体
 *
 * 调用方式：buttonVariants({ variant: 'ghost', size: 'sm' })
 * → 返回合并后的 className 字符串
 *
 * 【知识点 2 - Radix UI Slot（组件多态性）】
 * <Slot> 组件不渲染自身的 DOM 节点，而是将 props 注入到子元素上。
 * 当 asChild={true} 时，Button 不渲染 <button>，而是将样式注入到子元素。
 *
 * 例如：
 *   <Button asChild>
 *     <Link to="/about">关于</Link>
 *   </Button>
 * → 渲染为 <a class="...button-styles..." href="/about">关于</a>
 *
 * 这种模式叫"组件多态性"（Polymorphic Components），
 * 让按钮既可以是 <button>，也可以是 <a>、<Link> 等任意元素。
 *
 * 【知识点 3 - React.forwardRef（转发 Ref）】
 * 函数组件默认不能接收 ref。forwardRef 让父组件可以拿到内部 DOM 节点的引用。
 * 使用场景：
 *   - 聚焦管理：parentRef.current.focus()
 *   - 测量尺寸：parentRef.current.getBoundingClientRect()
 *   - 与第三方库集成（如动画库需要 DOM 节点）
 *
 * 泛型参数：React.forwardRef<HTMLButtonElement, ButtonProps>
 *   - 第一个泛型：ref 指向的 DOM 元素类型
 *   - 第二个泛型：组件的 Props 类型
 *
 * 【知识点 4 - displayName】
 * React DevTools 中显示组件名称。
 * 使用 forwardRef 后，DevTools 默认显示 "ForwardRef"，
 * 设置 displayName 后显示 "Button"，方便调试。
 * =============================================================================
 */
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/utils/cn';

/**
 * 按钮样式变体定义
 *
 * 基础样式包含：
 *   - inline-flex：行内弹性布局
 *   - focus-visible：只在键盘操作时显示聚焦环（鼠标点击不显示）
 *   - disabled：禁用状态样式
 *   - transition-colors：颜色过渡动画
 *
 * 【Tailwind 技巧 - focus-visible vs focus】
 * focus：任何获得焦点都触发（包括鼠标点击）
 * focus-visible：只在"需要"焦点指示时触发（键盘 Tab 导航）
 * 这是无障碍性（a11y）的最佳实践。
 */
const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			/**
			 * variant 维度：按钮的视觉风格
			 * - default：实心主色调（用于主操作）
			 * - destructive：危险操作（删除、取消订阅）
			 * - outline：带边框的透明按钮
			 * - secondary：次要操作
			 * - ghost：无背景，hover 时显示背景（用于导航、工具栏）
			 * - link：看起来像链接
			 */
			variant: {
				default:
					'bg-primary text-primary-foreground shadow hover:bg-primary/90',
				destructive:
					'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
				outline:
					'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
				secondary:
					'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			/**
			 * size 维度：按钮的尺寸
			 * - icon：正方形按钮，适合只有图标的场景（如主题切换按钮）
			 * - size-9：Tailwind 的 width + height 简写（= w-9 h-9）
			 */
			size: {
				default: 'h-9 px-4 py-2',
				sm: 'h-8 rounded-md px-3 text-xs',
				lg: 'h-10 rounded-md px-8',
				icon: 'size-9',
			},
		},
		// 不传 variant/size 时的默认值
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

/**
 * 【TS 技巧 - 交叉类型组合 Props】
 * ButtonProps = HTMLButtonAttributes & VariantProps & { asChild }
 *
 * VariantProps<typeof buttonVariants> 自动从 cva 配置推断出：
 *   { variant?: 'default' | 'destructive' | ... ; size?: 'default' | 'sm' | ... }
 *
 * React.ButtonHTMLAttributes<HTMLButtonElement> 包含所有原生 button 属性：
 *   onClick、disabled、type、aria-label 等
 *
 * 这就是 TS 在 React 中的威力：组件的 Props 完全类型安全，
 * IDE 会自动提示所有可用的 variant 和 size。
 */
export interface ButtonProps
	extends
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		// asChild 为 true 时用 Slot（注入样式到子元素），否则用 button
		const Comp = asChild ? Slot : 'button';
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = 'Button';

export { Button, buttonVariants };
