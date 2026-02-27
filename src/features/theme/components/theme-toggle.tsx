import { Monitor, Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

import { useThemeStore } from '../store';

const options = [
	{ value: 'light' as const, icon: Sun, label: '浅色' },
	{ value: 'dark' as const, icon: Moon, label: '深色' },
	{ value: 'system' as const, icon: Monitor, label: '跟随系统' },
];

export function ThemeToggle({ className }: { className?: string }) {
	const { theme, setTheme } = useThemeStore();

	// 简洁的三态切换：light → dark → system → light
	const currentIndex = options.findIndex((o) => o.value === theme);
	const nextOption = options[(currentIndex + 1) % options.length];
	const CurrentIcon = options[currentIndex]?.icon ?? Sun;

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(nextOption.value)}
			className={cn('h-9 w-9', className)}
			title={`当前: ${options[currentIndex]?.label}，点击切换为${nextOption.label}`}
		>
			<CurrentIcon className="size-4" />
			<span className="sr-only">切换主题</span>
		</Button>
	);
}
