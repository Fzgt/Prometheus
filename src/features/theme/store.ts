/**
 * =============================================================================
 * 📖 主题 Store (Theme Store with Zustand Persist)
 * =============================================================================
 *
 * 【知识点 - Zustand 持久化中间件】
 * persist() 中间件将 store 状态自动保存到 localStorage。
 * 用户刷新页面后，主题选择不会丢失。
 *
 * 中间件的写法：create<T>()(persist(stateCreator, config))
 * 注意 create 后面有两个括号 ()()：
 *   - 第一个 () 传入泛型 <ThemeStore>
 *   - 第二个 () 传入 persist 包裹后的 state creator
 * 这是 TypeScript 的限制：泛型参数必须在第一个调用位置传入。
 *
 * 【三态主题系统：light / dark / system】
 * - light：始终浅色
 * - dark：始终深色
 * - system：跟随操作系统设置
 *
 * resolvedTheme 是"最终生效的主题"：
 *   - theme = 'system' → resolvedTheme = getSystemTheme()
 *   - theme = 'dark' → resolvedTheme = 'dark'
 * 组件中应该使用 resolvedTheme 来判断当前实际主题。
 *
 * 【Tailwind CSS Dark Mode 实现原理】
 * tailwind.config.cjs 中 darkMode: 'class'
 * → 当 <html> 标签有 class="dark" 时，dark: 前缀的样式生效
 * → applyTheme 函数就是在操作这个 class
 * =============================================================================
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

type ThemeStore = {
	theme: Theme; // 用户选择的主题偏好
	resolvedTheme: 'light' | 'dark'; // 实际生效的主题
	setTheme: (theme: Theme) => void;
};

/** 检测操作系统的颜色偏好 */
function getSystemTheme(): 'light' | 'dark' {
	// window.matchMedia 检查 CSS 媒体查询
	// prefers-color-scheme: dark → 用户系统设置了深色模式
	return window.matchMedia('(prefers-color-scheme: dark)').matches
		? 'dark'
		: 'light';
}

/**
 * 将主题应用到 DOM
 *
 * 【为什么操作 document.documentElement？】
 * document.documentElement 就是 <html> 元素。
 * Tailwind 的 class dark mode 检查的就是 <html class="dark">。
 * 所以我们在这里添加/移除 'dark' class。
 */
function applyTheme(theme: Theme): 'light' | 'dark' {
	const resolved = theme === 'system' ? getSystemTheme() : theme;
	const root = document.documentElement;
	if (resolved === 'dark') {
		root.classList.add('dark');
	} else {
		root.classList.remove('dark');
	}
	return resolved;
}

/**
 * 创建持久化的主题 Store
 *
 * 【persist 配置详解】
 * name: 'blog-theme'
 *   → localStorage 的 key 名称
 *   → 打开浏览器 DevTools → Application → Local Storage 可以看到
 *
 * onRehydrateStorage
 *   → "注水"回调：当 persist 从 localStorage 恢复数据后调用
 *   → 返回一个函数，参数 state 是恢复后的状态
 *   → 在这里调用 applyTheme 确保页面一加载就应用正确的主题
 *   → 如果不做这一步，刷新页面后会先显示浅色再闪切到深色（FOUC 闪烁）
 */
export const useThemeStore = create<ThemeStore>()(
	persist(
		(set) => ({
			theme: 'system',
			resolvedTheme: 'light',
			setTheme: (theme: Theme) => {
				const resolvedTheme = applyTheme(theme);
				set({ theme, resolvedTheme });
			},
		}),
		{
			name: 'blog-theme', // localStorage key
			// 从 localStorage 恢复数据后，应用主题到 DOM
			onRehydrateStorage: () => (state) => {
				if (state) {
					const resolvedTheme = applyTheme(state.theme);
					state.resolvedTheme = resolvedTheme;
				}
			},
		},
	),
);

/**
 * 【监听系统主题变化】
 * 当用户在操作系统中切换亮/暗模式时，
 * 如果当前选择的是 'system'，需要跟随切换。
 *
 * 【在模块顶层注册事件监听器】
 * 这段代码在模块首次导入时执行一次（ES Module 的特性）。
 * typeof window !== 'undefined' 防止 SSR 环境报错。
 *
 * 【Zustand 的 getState() 在 React 外的使用】
 * 事件监听器不是 React 组件，不能用 Hook。
 * getState() 直接读取 store 状态，这是 Zustand 的独特优势。
 */
if (typeof window !== 'undefined') {
	window
		.matchMedia('(prefers-color-scheme: dark)')
		.addEventListener('change', () => {
			const { theme, setTheme } = useThemeStore.getState();
			if (theme === 'system') {
				setTheme('system'); // 重新解析系统主题
			}
		});
}
