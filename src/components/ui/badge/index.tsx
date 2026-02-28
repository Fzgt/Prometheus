/**
 * =============================================================================
 * 📖 Badge 标签组件 (Badge Component)
 * =============================================================================
 *
 * 【知识点 - CVA 的复用模式】
 * Badge 和 Button 使用相同的 CVA 模式（cva + VariantProps）。
 * 这是 Tailwind 组件库（如 shadcn/ui）的标准做法：
 *   1. cva 定义样式变体
 *   2. VariantProps 提取类型
 *   3. cn() 合并外部传入的 className
 *
 * Badge 常用于：
 *   - 标签展示（如文章标签 "React"、"TypeScript"）
 *   - 状态标识（如 "已发布"、"草稿"）
 *   - 计数器（如 "99+" 未读消息）
 *
 * 【TS 技巧 - 接口合并 extends 多个类型】
 * BadgeProps 同时继承了：
 *   - React.HTMLAttributes<HTMLDivElement>：所有 div 原生属性
 *   - VariantProps<typeof badgeVariants>：variant 变体属性
 * 这让 Badge 既可以接收 onClick、className 等 HTML 属性，
 * 也可以接收 variant="secondary" 这样的自定义属性。
 * =============================================================================
 */
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/utils/cn';

const badgeVariants = cva(
	// 基础样式：圆角药丸形、小字号、带过渡动画
	'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
	{
		variants: {
			variant: {
				default:
					'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
				secondary:
					'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
				destructive:
					'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
				outline: 'text-foreground',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

export interface BadgeProps
	extends
		React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

// 同时导出组件和样式函数（样式函数可以在不渲染组件时复用）
export { Badge, badgeVariants };
