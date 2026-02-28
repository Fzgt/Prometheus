/**
 * =============================================================================
 * 📖 对话框组件 (Dialog / Modal)
 * =============================================================================
 *
 * 基于 Radix UI Dialog 原语构建的模态对话框。
 * 这是 shadcn/ui 的标准 Dialog 组件，展示了 Radix UI 的核心使用模式。
 *
 * 【知识点 - Radix UI 原语 (Primitives)】
 * Radix UI 提供"无样式"的 UI 原语组件，只负责：
 * 1. 无障碍 (Accessibility) → 键盘导航、ARIA 属性、焦点管理
 * 2. 行为逻辑 → 打开/关闭、点击外部关闭、Esc 关闭
 * 3. 状态管理 → open/closed 状态、受控/非受控模式
 *
 * 开发者负责添加样式（这里用 Tailwind CSS）。
 * 这种"逻辑归框架，样式归开发者"的分工是 Radix 的核心理念。
 *
 * 【知识点 - Dialog 组成部分】
 * Dialog.Root → 状态容器（管理 open 状态）
 * Dialog.Trigger → 触发按钮（点击打开）
 * Dialog.Portal → 传送门（将内容渲染到 <body> 下）
 * Dialog.Overlay → 遮罩层（半透明背景）
 * Dialog.Content → 对话框主体（居中的白色卡片）
 * Dialog.Close → 关闭按钮
 * Dialog.Title → 标题（无障碍必需）
 * Dialog.Description → 描述（无障碍推荐）
 *
 * 【知识点 - React.forwardRef 的高级用法】
 * React.forwardRef<RefType, PropsType>(Component)
 *
 * 在这个文件中，RefType 使用了两个高级类型：
 *
 * 1. React.ElementRef<typeof DialogPrimitive.Content>
 *    → 提取 Radix 组件底层 DOM 元素的类型
 *    → DialogPrimitive.Content 最终渲染为 <div>，所以结果是 HTMLDivElement
 *
 * 2. React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
 *    → 提取 Radix 组件的所有 Props 类型，但排除 ref
 *    → 因为 ref 已经由 forwardRef 处理，不需要在 Props 中重复
 *
 * 为什么不直接写 HTMLDivElement？
 * → 因为 Radix 组件可能改变底层 DOM 元素（如升级后变成 <section>）
 * → 用 ElementRef<typeof XXX> 始终跟随 Radix 的实际类型，更安全
 *
 * 【知识点 - data-[state=xxx] 选择器】
 * Radix 组件会在 DOM 上设置 data-state 属性：
 * - data-state="open" → 对话框打开时
 * - data-state="closed" → 对话框关闭时
 *
 * Tailwind 可以用这些属性做条件样式：
 * data-[state=open]:animate-in → 打开时播放进入动画
 * data-[state=closed]:animate-out → 关闭时播放退出动画
 *
 * 这些动画类来自 tailwindcss-animate 插件。
 *
 * 【知识点 - Portal（传送门）】
 * Portal 将子元素渲染到 DOM 树的另一个位置（默认 <body>）。
 * 为什么需要 Portal？
 * 1. 避免 CSS 层叠上下文 (stacking context) 问题
 *    → 如果父元素有 overflow: hidden，不用 Portal 对话框会被裁切
 * 2. z-index 管理更简单
 *    → 在 <body> 下，z-50 就能盖住一切
 * =============================================================================
 */
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/utils/cn';

/**
 * 【组件别名导出】
 * 这些组件直接使用 Radix 原语，无需添加样式。
 * 通过赋值给新常量，保持导出命名的一致性。
 */
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

/**
 * 【遮罩层组件】
 *
 * fixed inset-0 → 覆盖整个视口
 * z-50 → 高层级（确保在其他内容之上）
 * bg-black/80 → 黑色 80% 不透明度
 *
 * 动画：
 * data-[state=open]:fade-in-0 → 打开时从完全透明淡入
 * data-[state=closed]:fade-out-0 → 关闭时淡出到完全透明
 * animate-in/animate-out → tailwindcss-animate 的动画触发类
 */
const DialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
			className,
		)}
		{...props}
	/>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/**
 * 【对话框内容主体】
 *
 * 这是最复杂的部分，包含：
 * 1. Portal → 渲染到 <body>
 * 2. Overlay → 遮罩层（自动注入）
 * 3. Content → 居中的对话框卡片
 * 4. Close → 右上角关闭按钮
 *
 * 【居中技巧 - fixed + translate】
 * fixed left-[50%] top-[50%] → 把元素的左上角放到视口中心
 * translate-x-[-50%] translate-y-[-50%] → 把元素自身向左上偏移 50%
 * 结果：元素中心对齐视口中心（经典居中方案）
 *
 * 【动画组合】
 * 打开时：fade-in + zoom-in-95 + slide-in-from-left/top
 * → 从略小尺寸 + 略偏位置 → 淡入到正常位置
 * 关闭时：fade-out + zoom-out-95 + slide-out-to-left/top
 * → 从正常位置 → 缩小 + 偏移 + 淡出
 */
const DialogContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
	<DialogPortal>
		{/* Overlay 在 Content 内部渲染，确保两者在同一个 Portal 中 */}
		<DialogOverlay />
		<DialogPrimitive.Content
			ref={ref}
			className={cn(
				'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
				className,
			)}
			{...props}
		>
			{children}
			{/**
			 * 【关闭按钮】
			 * DialogPrimitive.Close 自带关闭行为（点击触发 onOpenChange(false)）
			 *
			 * ring-offset-background → 焦点环偏移颜色与背景色一致
			 * focus:ring-2 focus:ring-ring → 键盘焦点时显示焦点环
			 * disabled:pointer-events-none → 禁用时不响应鼠标事件
			 *
			 * <span className="sr-only">关闭</span>
			 * → 屏幕阅读器可以读到"关闭"，视觉用户看到 X 图标
			 */}
			<DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
				<X className="size-4" />
				<span className="sr-only">关闭</span>
			</DialogClose>
		</DialogPrimitive.Content>
	</DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

/**
 * 【对话框头部】
 * 纯布局组件，不使用 Radix 原语。
 * 注意：这不是 forwardRef 组件，因为它只是一个普通 div，
 * 不需要暴露 ref 给父组件。
 *
 * React.HTMLAttributes<HTMLDivElement> → 继承所有 div 的原生属性
 */
const DialogHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			'flex flex-col space-y-1.5 text-center sm:text-left',
			className,
		)}
		{...props}
	/>
);
DialogHeader.displayName = 'DialogHeader';

/**
 * 【对话框标题】
 * 使用 Radix 的 Title 原语，自动设置 aria-labelledby。
 * Dialog 必须有 Title（无障碍规范要求）。
 * 如果不想显示标题，可以加 className="sr-only" 隐藏。
 */
const DialogTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn(
			'text-lg font-semibold leading-none tracking-tight',
			className,
		)}
		{...props}
	/>
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

/**
 * 【对话框描述】
 * 使用 Radix 的 Description 原语，自动设置 aria-describedby。
 * 给屏幕阅读器提供对话框的补充说明。
 */
const DialogDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn('text-sm text-muted-foreground', className)}
		{...props}
	/>
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

/**
 * 【统一导出】
 * 所有子组件从一个文件导出，使用时：
 * import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
 */
export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
