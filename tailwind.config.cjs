/**
 * =============================================================================
 * 📖 Tailwind CSS 配置 (Tailwind Configuration)
 * =============================================================================
 *
 * 这个文件定义了整个项目的设计系统（Design System）：
 * 颜色、字体、间距、动画——所有视觉相关的"真理源"都在这里。
 *
 * 【知识点 - Tailwind 的工作原理】
 * Tailwind 在构建时扫描 content 中配置的文件，
 * 找到所有使用的 class（如 bg-primary、text-lg），
 * 只生成这些 class 的 CSS。未使用的 class 不会出现在最终 CSS 中。
 * 这就是 "JIT (Just-In-Time)" 模式。
 *
 * 【知识点 - CSS 变量 + HSL 颜色系统（shadcn/ui 方案）】
 * 这个项目的颜色不直接写死值，而是通过 CSS 变量引用：
 *
 * 1. index.css 定义变量值：  --primary: 221.2 83.2% 53.3%
 * 2. tailwind.config 引用：  primary: 'hsl(var(--primary))'
 * 3. 组件中使用：             className="bg-primary text-primary-foreground"
 *
 * 为什么这样做？
 * - 深色模式只需切换 CSS 变量值（.dark 类覆盖 :root 的变量）
 * - 组件代码完全不需要处理深色模式
 * - 颜色的透明度可以通过 /xx 语法控制（bg-primary/80）
 *
 * 【知识点 - darkMode: 'class'】
 * Tailwind 支持两种深色模式策略：
 * 1. 'media' → 跟随系统 prefers-color-scheme（无法手动切换）
 * 2. 'class' → 通过 <html class="dark"> 切换（可编程控制）
 *
 * 本项目用 'class'，配合 Zustand theme store 实现三态切换：
 * light / dark / system
 *
 * 【知识点 - extend vs 直接覆盖】
 * theme.extend.colors → 在默认颜色基础上追加自定义颜色
 * theme.colors → 完全替换默认颜色（red-500 等会消失）
 *
 * 本项目用 extend，保留 Tailwind 内置颜色的同时添加设计系统颜色。
 * =============================================================================
 */

/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
	/**
	 * 【深色模式策略】
	 * 'class' → 当 <html> 有 class="dark" 时启用深色模式
	 * 由 features/theme/store.ts 中的 applyTheme() 控制
	 */
	darkMode: 'class',

	/**
	 * 【内容扫描路径】
	 * Tailwind 扫描这些文件中的 class 名称。
	 * 只有被使用的 class 才会生成 CSS（Tree Shaking）。
	 *
	 * 必须包含所有可能使用 Tailwind class 的文件：
	 * - index.html → body 的 class
	 * - src/**/*.{tsx,ts} → React 组件和工具函数
	 */
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

	theme: {
		/**
		 * 【Container 配置】
		 * container 不在 extend 中，是直接覆盖默认值。
		 *
		 * center: true → 自动 margin: auto 居中
		 * padding: '2rem' → 左右内边距 32px
		 * screens: { '2xl': '1400px' } → 最大宽度 1400px
		 *   默认的 2xl 容器是 1536px，这里缩小到 1400px 提升阅读体验
		 */
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},

		extend: {
			/**
			 * 【自定义字体族】
			 *
			 * 'Inter var' → 正文字体（Google Fonts 可变字体）
			 * 可变字体 (Variable Font) 一个文件包含所有字重（100-900），
			 * 比加载多个字重文件更高效。
			 *
			 * 'JetBrains Mono' → 代码字体（等宽）
			 * 用于代码块和 <code> 元素。
			 *
			 * ...defaultTheme.fontFamily.sans → 追加 Tailwind 默认的 sans 字体
			 * 作为后备（fallback），如果 Inter 加载失败，使用系统默认字体。
			 */
			fontFamily: {
				sans: ['Inter var', ...defaultTheme.fontFamily.sans],
				mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
			},

			/**
			 * 【颜色系统 — shadcn/ui 方案 ⭐】
			 *
			 * 所有颜色都通过 CSS 变量定义，格式：hsl(var(--xxx))
			 *
			 * 颜色命名约定：
			 * - background / foreground → 页面背景和默认文字
			 * - primary / primary-foreground → 主操作按钮的底色和文字
			 * - secondary → 次要操作
			 * - muted → 辅助/柔和元素
			 * - accent → 强调/hover 效果
			 * - destructive → 危险操作（删除、报错）
			 * - border / input / ring → 边框、输入框、焦点环
			 * - card / popover → 卡片和弹出层
			 *
			 * DEFAULT vs foreground：
			 * primary: { DEFAULT: '...', foreground: '...' }
			 * → bg-primary 使用 DEFAULT
			 * → text-primary-foreground 使用 foreground
			 *
			 * 这确保了按钮等元素的背景色和文字色始终搭配正确。
			 */
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
			},

			/**
			 * 【圆角系统】
			 * 通过 CSS 变量 --radius 统一控制。
			 * lg = --radius (0.5rem)
			 * md = --radius - 2px
			 * sm = --radius - 4px
			 *
			 * 修改 --radius 一个值就能全局调整圆角风格。
			 */
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},

			/**
			 * 【@tailwindcss/typography 插件自定义】
			 *
			 * typography 函数接收 theme() 辅助函数，
			 * 可以引用 Tailwind 主题中的颜色值。
			 *
			 * DEFAULT → prose 类的默认样式
			 * invert → prose-invert（深色模式）的样式
			 *
			 * 覆盖的内容：
			 * - --tw-prose-body/headings/links → 使用设计系统颜色
			 * - code → 行内代码样式（背景色、圆角、去掉默认反引号）
			 * - pre → 清除默认样式（Shiki 提供自己的样式）
			 *
			 * code::before/::after: content: 'none'
			 * → prose 默认在 <code> 前后加反引号（`）
			 * → 我们不需要，因为已经通过背景色区分了代码
			 */
			typography: (theme) => ({
				DEFAULT: {
					css: {
						'--tw-prose-body': theme('colors.foreground'),
						'--tw-prose-headings': theme('colors.foreground'),
						'--tw-prose-links': theme('colors.primary.DEFAULT'),
						'--tw-prose-code': theme('colors.foreground'),
						'--tw-prose-pre-bg': 'transparent',
						maxWidth: 'none',
						code: {
							backgroundColor: 'hsl(var(--muted))',
							borderRadius: '0.25rem',
							padding: '0.125rem 0.375rem',
							fontWeight: '400',
							'&::before': { content: 'none' },
							'&::after': { content: 'none' },
						},
						pre: {
							backgroundColor: 'transparent',
							padding: '0',
							margin: '0',
						},
					},
				},
				invert: {
					css: {
						'--tw-prose-body': theme('colors.foreground'),
						'--tw-prose-headings': theme('colors.foreground'),
						'--tw-prose-links': theme('colors.primary.DEFAULT'),
						'--tw-prose-code': theme('colors.foreground'),
					},
				},
			}),

			/**
			 * 【自定义关键帧动画】
			 *
			 * accordion-down/up → Radix Accordion 展开/折叠动画
			 *   使用 --radix-accordion-content-height CSS 变量
			 *   （Radix 自动测量内容高度并设置此变量）
			 *
			 * fade-in → 通用淡入动画
			 */
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
			},

			/**
			 * 【动画配置】
			 * 将关键帧绑定到 Tailwind class：
			 * animate-accordion-down → 0.2s ease-out 展开动画
			 * animate-fade-in → 0.3s ease-out 淡入动画
			 *
			 * 使用方式：className="animate-fade-in"
			 */
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
			},
		},
	},

	/**
	 * 【Tailwind 插件】
	 *
	 * tailwindcss-animate
	 * → 提供进入/退出动画的 Tailwind class
	 * → animate-in、animate-out、fade-in-0、zoom-in-95 等
	 * → 被 shadcn/ui 的 Dialog、Dropdown 等组件使用
	 *
	 * @tailwindcss/typography
	 * → 提供 prose 系列 class，为 Markdown 渲染的 HTML 添加排版样式
	 * → prose-headings:xxx、prose-pre:xxx 等修饰符
	 * → 被 PostContent 和 AboutPage 使用
	 */
	plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
