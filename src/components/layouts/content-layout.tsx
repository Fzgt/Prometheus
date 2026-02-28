/**
 * =============================================================================
 * 📖 内容布局组件 (Content Layout)
 * =============================================================================
 *
 * 【设计模式 - Layout 组件】
 * Layout 组件负责页面内容区域的居中和间距。
 * 多个页面（Home、About、Tag）共享同一套布局参数，
 * 修改一处即可全局生效。
 *
 * 【Tailwind 类名解析】
 * - container：Tailwind 的响应式容器（自动计算 max-width + 水平居中）
 * - max-w-4xl：最大宽度 896px（限制内容宽度，提高可读性）
 * - py-8 md:py-12：响应式内边距
 *   - 移动端：32px 上下内边距
 *   - 桌面端（>= 768px）：48px 上下内边距
 *
 * 【React.ReactNode 类型】
 * React.ReactNode 是 React 中最宽泛的"可渲染内容"类型，包括：
 *   string | number | boolean | null | undefined | ReactElement | ReactFragment
 * 几乎所有东西都能作为 children 传入。
 * =============================================================================
 */
import * as React from 'react';

import { cn } from '@/utils/cn';

type ContentLayoutProps = {
	children: React.ReactNode;
	className?: string; // 允许外部覆盖/扩展样式
};

export function ContentLayout({ children, className }: ContentLayoutProps) {
	return (
		<div className={cn('container max-w-4xl py-8 md:py-12', className)}>
			{children}
		</div>
	);
}
