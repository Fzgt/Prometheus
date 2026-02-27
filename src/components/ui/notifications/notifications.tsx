import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';

import { cn } from '@/utils/cn';

import { type Notification, useNotifications } from './notifications-store';

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
			<span className="mt-0.5 shrink-0">{icons[notification.type]}</span>
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

export function Notifications() {
	const { notifications } = useNotifications();

	return (
		<div
			aria-live="polite"
			className="pointer-events-none fixed right-4 top-4 z-50 flex w-80 flex-col gap-2"
		>
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
