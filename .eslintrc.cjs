/**
 * =============================================================================
 * 📖 ESLint 配置 (Linting Rules)
 * =============================================================================
 *
 * ESLint 是 JavaScript/TypeScript 的静态代码分析工具。
 * 它在你写代码时就能发现潜在问题，而不是等到运行时才报错。
 *
 * 【知识点 - .cjs 扩展名】
 * .cjs = CommonJS 模块格式（module.exports）。
 * 因为 ESLint 目前还不完全支持 ESM 配置文件，
 * 所以即使项目是 ESM（package.json 有 "type": "module"），
 * ESLint 配置也需要用 .cjs 格式。
 *
 * 【知识点 - ESLint 插件系统】
 * ESLint 通过插件扩展规则：
 * - eslint:recommended → ESLint 内置推荐规则
 * - @typescript-eslint → TypeScript 专用规则
 * - eslint-plugin-react → React 最佳实践规则
 * - eslint-plugin-react-hooks → Hook 规则（不能在条件中用 Hook）
 * - eslint-plugin-jsx-a11y → 无障碍检查（img 必须有 alt 等）
 * - eslint-plugin-import → import 顺序和路径限制 ⭐
 * - eslint-plugin-prettier → Prettier 格式检查
 * - eslint-plugin-tailwindcss → Tailwind class 顺序检查
 * - eslint-plugin-vitest → Vitest 测试最佳实践
 * - eslint-plugin-testing-library → Testing Library 最佳实践
 * - eslint-plugin-jest-dom → jest-dom 断言最佳实践
 * - eslint-plugin-check-file → 文件/文件夹命名规范 ⭐
 *
 * 【本配置的核心亮点 — 架构强制执行 ⭐】
 * 最重要的规则是 'import/no-restricted-paths'，
 * 它通过 ESLint 强制执行 bulletproof-react 的单向依赖原则：
 * 1. Feature 之间不能相互引用
 * 2. Features 不能引用 App 层
 * 3. 共享模块（components/hooks/lib/utils）不能引用 Features 或 App
 *
 * 没有这个规则，架构约定就只是"口头协议"——
 * 新人可能在 blog feature 中 import comments feature，
 * 导致循环依赖和模块耦合。
 *
 * 有了这个规则，ESLint 在 IDE 中实时报错，CI 中阻止 merge，
 * 架构约定变成了"代码执行的法律"。
 * =============================================================================
 */
module.exports = {
	/**
	 * 【root: true】
	 * 告诉 ESLint 这是根配置文件，不要继续向上查找。
	 * 如果不设置，ESLint 会一直往父目录找配置文件直到根目录。
	 */
	root: true,

	env: {
		node: true, // 支持 Node.js 全局变量（module、require 等）
		es6: true,  // 支持 ES6 全局变量（Promise、Map 等）
	},

	parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },

	/**
	 * 【忽略模式】
	 * MSW 的 Service Worker 文件是自动生成的，不需要 lint。
	 */
	ignorePatterns: ['node_modules/*', 'public/mockServiceWorker.js'],

	extends: ['eslint:recommended'],
	plugins: ['check-file'],

	/**
	 * 【overrides — 针对 TypeScript 文件的专用配置】
	 * .ts/.tsx 文件使用不同的 parser（@typescript-eslint/parser），
	 * 并启用 TypeScript 专用的规则集。
	 */
	overrides: [
		{
			files: ['**/*.ts', '**/*.tsx'],
			parser: '@typescript-eslint/parser',
			settings: {
				react: { version: 'detect' }, // 自动检测 React 版本
				'import/resolver': {
					typescript: {}, // 让 import 插件理解 TypeScript 路径别名
				},
			},
			env: {
				browser: true, // 浏览器环境（document、window）
				node: true,
				es6: true,
			},
			extends: [
				'eslint:recommended',
				'plugin:import/errors',           // import 路径检查
				'plugin:import/warnings',
				'plugin:import/typescript',        // TS 路径解析
				'plugin:@typescript-eslint/recommended', // TS 推荐规则
				'plugin:react/recommended',        // React 推荐规则
				'plugin:react-hooks/recommended',  // Hook 规则（核心：不能条件调用）
				'plugin:jsx-a11y/recommended',     // 无障碍规则
				'plugin:prettier/recommended',     // Prettier 格式化
				'plugin:testing-library/react',    // Testing Library 最佳实践
				'plugin:jest-dom/recommended',     // jest-dom 断言规则
				'plugin:tailwindcss/recommended',  // Tailwind class 排序
				'plugin:vitest/legacy-recommended', // Vitest 规则
			],
			rules: {
				/**
				 * ⭐⭐⭐ 最重要的规则：架构边界强制执行 ⭐⭐⭐
				 *
				 * 【import/no-restricted-paths】
				 * 定义"禁止的导入路径"，强制单向依赖。
				 *
				 * 每个 zone 定义一个限制：
				 * - target：被限制的代码位置
				 * - from：不允许从这里导入
				 * - except：例外（允许从自身导入）
				 *
				 * 【依赖方向图】
				 *
				 *   app/ ──→ features/ ──→ components/
				 *                │              hooks/
				 *                │              lib/
				 *                │              types/
				 *                └──→           utils/
				 *
				 * 箭头方向是允许的依赖方向，反向一律禁止。
				 */
				'import/no-restricted-paths': [
					'error',
					{
						zones: [
							// ── Zone 1-3：Feature 隔离 ────────────────
							// blog 不能引用其他 feature（如 comments、theme）
							{
								target: './src/features/blog',
								from: './src/features',
								except: ['./blog'],
							},
							// comments 不能引用其他 feature
							{
								target: './src/features/comments',
								from: './src/features',
								except: ['./comments'],
							},
							// theme 不能引用其他 feature
							{
								target: './src/features/theme',
								from: './src/features',
								except: ['./theme'],
							},

							// ── Zone 4：Features 不能引用 App 层 ─────
							// features 是"被使用"的，不应该知道 app 层的存在
							{
								target: './src/features',
								from: './src/app',
							},

							// ── Zone 5：共享模块不能反向引用 ────────
							// components/hooks/lib/types/utils 是最底层，
							// 不能引用上层的 features 或 app
							{
								target: [
									'./src/components',
									'./src/hooks',
									'./src/lib',
									'./src/types',
									'./src/utils',
								],
								from: ['./src/features', './src/app'],
							},
						],
					},
				],

				/**
				 * 【import/no-cycle】
				 * 禁止循环导入（A → B → A）。
				 * 循环依赖会导致：
				 * 1. 模块初始化顺序不确定
				 * 2. 可能得到 undefined（模块还没初始化完）
				 * 3. 难以理解和维护
				 */
				'import/no-cycle': 'error',

				/** Unix 换行符（LF），确保跨平台一致性 */
				'linebreak-style': ['error', 'unix'],

				/**
				 * 【import/order — 导入排序规则】 ⭐
				 *
				 * 强制 import 语句按以下顺序排列：
				 * 1. builtin → Node.js 内置模块（fs、path）
				 * 2. external → node_modules 中的第三方包
				 * 3. internal → 项目内部路径别名（@/xxx）
				 * 4. parent → 父目录（../xxx）
				 * 5. sibling → 同级目录（./xxx）
				 * 6. index → 当前目录的 index 文件
				 * 7. object → import { x } from 'y' 的解构
				 *
				 * 'newlines-between': 'always' → 每组之间必须有空行
				 * alphabetize → 组内按字母排序
				 *
				 * 好处：统一的 import 排序让文件更易读，
				 * 而且可以一目了然看出哪些是外部依赖、哪些是内部模块。
				 */
				'import/order': [
					'error',
					{
						groups: [
							'builtin',
							'external',
							'internal',
							'parent',
							'sibling',
							'index',
							'object',
						],
						'newlines-between': 'always',
						alphabetize: { order: 'asc', caseInsensitive: true },
					},
				],

				// 关闭一些过于严格的规则
				'import/default': 'off',
				'import/no-named-as-default-member': 'off',
				'import/no-named-as-default': 'off',

				/**
				 * React 17+ 使用新的 JSX 转换，不再需要 import React。
				 * 关闭这个规则避免误报。
				 */
				'react/react-in-jsx-scope': 'off',

				/** 项目使用 React Router 的 Link，不使用原生 <a> */
				'jsx-a11y/anchor-is-valid': 'off',

				/** TypeScript 规则微调 */
				'@typescript-eslint/no-unused-vars': ['error'],
				'@typescript-eslint/explicit-function-return-type': ['off'],
				'@typescript-eslint/explicit-module-boundary-types': ['off'],
				'@typescript-eslint/no-empty-function': ['off'],
				'@typescript-eslint/no-explicit-any': ['off'],

				/** Prettier 使用 .prettierrc 配置 */
				'prettier/prettier': ['error', {}, { usePrettierrc: true }],

				/**
				 * 【check-file/filename-naming-convention — 文件命名规范 ⭐】
				 *
				 * 强制 .ts/.tsx 文件使用 kebab-case 命名：
				 * ✅ post-card.tsx
				 * ✅ use-reading-progress.ts
				 * ❌ PostCard.tsx
				 * ❌ useReadingProgress.ts
				 *
				 * ignoreMiddleExtensions → 忽略中间扩展名
				 * 如 setup-tests.ts 中的 .ts 不影响判断
				 *
				 * 统一命名规范让团队更容易找到文件：
				 * 看到组件名 PostCard → 文件名一定是 post-card.tsx
				 */
				'check-file/filename-naming-convention': [
					'error',
					{
						'**/*.{ts,tsx}': 'KEBAB_CASE',
					},
					{
						ignoreMiddleExtensions: true,
					},
				],
			},
		},
		{
			/**
			 * 【文件夹命名规范】
			 * 所有文件夹（排除 __tests__）必须使用 kebab-case。
			 * ✅ src/features/blog/components/
			 * ❌ src/Features/Blog/Components/
			 */
			plugins: ['check-file'],
			files: ['src/**/!(__tests__)/*'],
			rules: {
				'check-file/folder-naming-convention': [
					'error',
					{
						'**/*': 'KEBAB_CASE',
					},
				],
			},
		},
	],
};
