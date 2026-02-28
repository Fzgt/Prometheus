/**
 * =============================================================================
 * 📖 输入框组件 (Input)
 * =============================================================================
 *
 * 基础表单输入框，封装了统一的样式和无障碍支持。
 * 这是 shadcn/ui 的标准 Input 组件。
 *
 * 【知识点 - React.InputHTMLAttributes<HTMLInputElement>】
 * 这是 React 内置的类型，包含 <input> 元素的所有合法属性：
 * value, onChange, placeholder, disabled, type, name, id, autoComplete...
 * 通过 extends 继承，Input 组件自动支持所有原生 input 属性。
 *
 * 【知识点 - 空 interface 的作用】
 * export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
 * 看起来是空的，但它有两个用途：
 * 1. 语义化：给类型起一个有意义的名字（InputProps 比 React.InputHTMLAttributes 更清晰）
 * 2. 扩展性：未来如果要添加自定义 props（如 error、label），只需在这里加
 *
 * 【知识点 - forwardRef 在表单中的重要性】
 * 表单库（如 React Hook Form）需要通过 ref 直接访问 DOM 元素：
 * - 获取/设置值（ref.current.value）
 * - 触发聚焦（ref.current.focus()）
 * - 监听事件（ref.current.addEventListener）
 *
 * 如果 Input 不用 forwardRef，React Hook Form 的 register() 就无法工作。
 * 这就是为什么所有表单组件都必须支持 ref 转发。
 *
 * 【Tailwind 样式解析】
 * file:xxx → 文件上传按钮的样式（<input type="file"> 的选择按钮）
 * placeholder:xxx → 占位符文字样式
 * focus-visible:xxx → 键盘聚焦时的样式（鼠标点击不触发，提升无障碍体验）
 * disabled:xxx → 禁用状态样式
 * =============================================================================
 */
import * as React from 'react';

import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					/**
					 * 基础样式：
					 * flex h-9 w-full → 弹性布局，高度 36px，宽度 100%
					 * rounded-md → 圆角
					 * border border-input → 边框使用 --input 颜色
					 * bg-transparent → 透明背景（继承父元素背景）
					 * px-3 py-1 → 内边距
					 * text-sm → 14px 字体
					 * shadow-sm → 轻微阴影
					 * transition-colors → 颜色变化有过渡动画
					 *
					 * 文件上传样式：
					 * file:border-0 file:bg-transparent → 去掉文件按钮的默认边框和背景
					 * file:text-sm file:font-medium → 文件按钮文字样式
					 *
					 * 占位符：
					 * placeholder:text-muted-foreground → 灰色占位符
					 *
					 * 焦点样式：
					 * focus-visible:outline-none → 去掉默认 outline
					 * focus-visible:ring-1 focus-visible:ring-ring → 添加自定义焦点环
					 *
					 * 禁用样式：
					 * disabled:cursor-not-allowed → 禁止光标
					 * disabled:opacity-50 → 半透明
					 */
					'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Input.displayName = 'Input';

export { Input };
