/**
 * =============================================================================
 * 📖 自定义链接组件 (Custom Link)
 * =============================================================================
 *
 * 对 React Router 的 Link 组件进行样式封装，提供统一的链接外观。
 *
 * 【知识点 - 为什么要封装 React Router 的 Link？】
 * 1. 统一样式：所有链接自动带有主色调 + hover 下划线
 * 2. 单点修改：修改链接样式只需改这一个文件
 * 3. 可扩展：未来可以加外部链接检测、预加载等功能
 *
 * 【知识点 - LinkProps 类型】
 * import { type LinkProps } from 'react-router';
 * LinkProps 包含 React Router Link 的所有属性：
 * - to（必需）：目标路径
 * - replace：是否替换历史记录
 * - state：传递给目标页面的状态
 * - 以及所有 <a> 元素的属性
 *
 * 【知识点 - 交叉类型 &】
 * type CustomLinkProps = LinkProps & { className?: string };
 * & 是 TypeScript 的交叉类型（Intersection Type）：
 * 结果类型同时拥有 LinkProps 的所有属性 + 额外的 className。
 *
 * 为什么要额外加 className？
 * → LinkProps 继承自 <a> 的属性，理论上已包含 className。
 * → 但显式声明让 API 更清晰，IDE 自动补全更好用。
 *
 * 【知识点 - forwardRef + Link】
 * React Router 的 Link 本身支持 ref，但我们的封装层需要"透传"ref。
 * 没有 forwardRef，ref 会停在 CustomLink 层，无法到达底层的 <a> 元素。
 * =============================================================================
 */
import * as React from 'react';
import { Link as RouterLink, type LinkProps } from 'react-router';

import { cn } from '@/utils/cn';

type CustomLinkProps = LinkProps & {
	className?: string;
};

export const Link = React.forwardRef<HTMLAnchorElement, CustomLinkProps>(
	({ className, ...props }, ref) => {
		return (
			<RouterLink
				ref={ref}
				className={cn(
					/**
					 * text-primary → 链接使用主色调
					 * underline-offset-4 → 下划线与文字间距 4px（更美观）
					 * transition-colors → 颜色变化有过渡动画
					 * hover:underline → 鼠标悬停时显示下划线
					 */
					'text-primary underline-offset-4 transition-colors hover:underline',
					className,
				)}
				{...props}
			/>
		);
	},
);
Link.displayName = 'Link';
