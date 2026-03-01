/** @type {import('tailwindcss').Config} */

module.exports = {
	// <html class="dark"> 时启用深色模式，由 theme store 控制
	darkMode: 'class',

	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: { '2xl': '1400px' }, // 默认 1536px，缩小到 1400px 提升阅读体验
		},

		extend: {
			// 注意：不能用 ...defaultTheme.fontFamily.sans 展开，
			// 内置字体名含嵌套引号（'"Apple Color Emoji"'），会导致 PostCSS 解析报错
			fontFamily: {
				sans: [
					'Inter',
					'ui-sans-serif',
					'system-ui',
					'sans-serif',
					'Apple Color Emoji',
					'Segoe UI Emoji',
					'Segoe UI Symbol',
					'Noto Color Emoji',
				],
			},

			// 颜色全部通过 CSS 变量引用，支持深色模式自动切换，且可用 /xx 控制透明度
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

			// 圆角统一由 --radius 变量控制，改一处全局生效
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},

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
							'&::before': { content: 'none' }, // 去掉 prose 默认加的反引号
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

			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
			},
		},
	},

	plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
