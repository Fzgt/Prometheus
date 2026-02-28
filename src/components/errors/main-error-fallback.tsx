/**
 * =============================================================================
 * 📖 全局错误 Fallback 组件 (Main Error Fallback)
 * =============================================================================
 *
 * 【知识点 - ErrorBoundary 的 FallbackComponent】
 * 当 React 组件树中发生未捕获的 JS 错误时，ErrorBoundary 会：
 *   1. 捕获错误
 *   2. 用 FallbackComponent 替换出错的组件树
 *   3. 防止整个应用白屏
 *
 * 这个组件就是那个 "替代品"——展示友好的错误页面。
 *
 * 【最佳实践 - 错误恢复】
 * window.location.assign(window.location.origin) 强制刷新页面。
 * 为什么不用 window.location.reload()？
 * → assign(origin) 会清除 URL 中的路由路径，回到首页
 * → reload() 会重新加载当前路径，可能再次触发同一个错误
 *
 * 在生产环境中，通常还会在这里：
 *   - 上报错误到 Sentry/LogRocket 等监控平台
 *   - 记录错误堆栈和用户操作路径
 *   - 提供"联系客服"的链接
 * =============================================================================
 */
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function MainErrorFallback() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
			{/* 图标容器：destructive/10 = 10% 不透明度的红色背景 */}
			<div className="rounded-full bg-destructive/10 p-4">
				<AlertTriangle className="size-10 text-destructive" />
			</div>
			<div>
				<h1 className="text-2xl font-bold text-foreground">出错了</h1>
				<p className="mt-2 text-muted-foreground">
					应用遇到了意外错误，请刷新页面重试。
				</p>
			</div>
			{/* 跳转到首页并强制刷新 */}
			<Button onClick={() => window.location.assign(window.location.origin)}>
				刷新页面
			</Button>
		</div>
	);
}
