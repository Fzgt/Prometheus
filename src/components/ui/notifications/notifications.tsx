/**
 * =============================================================================
 * 📖 通知组件 (Notifications Component with Framer Motion)
 * =============================================================================
 *
 * 【知识点 - Framer Motion 动画】
 * Framer Motion 是 React 生态最流行的动画库。核心概念：
 *   - initial：组件挂载前的初始状态
 *   - animate：组件挂载后的目标状态
 *   - exit：组件卸载时的动画（需要 AnimatePresence 包裹）
 *   - transition：动画时长、缓动函数等
 *
 * 【AnimatePresence 的作用】
 * React 中组件被移除时直接从 DOM 消失，无法播放退出动画。
 * AnimatePresence 拦截了组件的卸载过程，在动画播放完毕后才真正移除 DOM。
 *
 * mode="sync" → 新元素和旧元素同时动画（默认是 "sync"）
 * mode="wait" → 等旧元素退出完毕后，新元素才进入
 * mode="popLayout" → 退出时使用绝对定位，避免布局跳动
 *
 * 【无障碍性 - aria-live="polite"】
 * 告诉屏幕阅读器：这个区域的内容会动态更新。
 *   - "polite"：等用户空闲时再播报更新
 *   - "assertive"：立即中断当前播报，播报更新（用于紧急信息）
 *
 * 【pointer-events-none + pointer-events-auto】
 * 外层容器不接收鼠标事件（避免挡住页面内容），
 * 但每条通知单独启用鼠标事件（可以点击关闭）。
 * =============================================================================
 */
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';

import { cn } from '@/utils/cn';

import { type Notification, useNotifications } from './notifications-store';

/**
 * 【设计模式 - 映射对象代替 switch/if-else】
 * 用对象的 key 做映射，比 switch 语句更简洁、更容易扩展。
 * TypeScript 也能自动确保所有 type 值都被覆盖（exhaustive check）。
 */
const icons = {
	info: <Info className="size-5 text-blue-500" />,
	success: <CheckCircle className="size-5 text-green-500" />,
	warning: <AlertCircle className="size-5 text-yellow-500" />,
	error: <XCircle className="size-5 text-red-500" />,
};

const colors = {
	info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
	success:
		'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
	warning:
		'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950',
	error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
};

/**
 * 单条通知项
 *
 * 【Framer Motion 动画配置详解】
 * initial={{ opacity: 0, y: -20, scale: 0.95 }}
 *   → 初始状态：透明、上移 20px、缩小 5%
 * animate={{ opacity: 1, y: 0, scale: 1 }}
 *   → 目标状态：完全显示、原位、原始大小
 * exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
 *   → 退出时：淡出 + 缩小，持续 0.15 秒
 *
 * 这创造了一个"从上方滑入 → 原地消失"的弹出效果。
 */
function NotificationItem({ notification }: { notification: Notification }) {
	const { dismissNotification } = useNotifications();

	return (
		<motion.div
			initial={{ opacity: 0, y: -20, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
			className={cn(
				'flex w-full items-start gap-3 rounded-lg border p-4 shadow-md',
				colors[notification.type],
			)}
		>
			{/* shrink-0 防止图标被文字挤压变形 */}
			<span className="mt-0.5 shrink-0">{icons[notification.type]}</span>
			{/* min-w-0 + flex-1 让文字区域自适应宽度且支持文本截断 */}
			<div className="min-w-0 flex-1">
				<p className="text-sm font-medium text-foreground">
					{notification.title}
				</p>
				{notification.message && (
					<p className="mt-1 text-sm text-muted-foreground">
						{notification.message}
					</p>
				)}
			</div>
			{/* 关闭按钮 */}
			<button
				onClick={() => dismissNotification(notification.id)}
				className="shrink-0 rounded text-muted-foreground transition-colors hover:text-foreground"
				aria-label="关闭通知"
			>
				<X className="size-4" />
			</button>
		</motion.div>
	);
}

/**
 * 通知容器（渲染在页面右上角）
 *
 * 【Zustand Hook 的使用方式】
 * useNotifications() 不传参数 → 返回整个 store 对象（包含 state + actions）
 * 注意：这会导致 store 任何变化都触发组件重渲染。
 * 优化写法：useNotifications((s) => s.notifications) → 只订阅 notifications
 *
 * 在这里因为组件很轻量，不需要优化。但在大型组件中应该用选择器。
 */
export function Notifications() {
	const { notifications } = useNotifications();

	return (
		<div
			aria-live="polite"
			className="pointer-events-none fixed right-4 top-4 z-50 flex w-80 flex-col gap-2"
		>
			{/* AnimatePresence 使 exit 动画生效 */}
			<AnimatePresence mode="sync">
				{notifications.map((notification) => (
					<div key={notification.id} className="pointer-events-auto">
						<NotificationItem notification={notification} />
					</div>
				))}
			</AnimatePresence>
		</div>
	);
}
