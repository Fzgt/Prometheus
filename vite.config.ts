/**
 * =============================================================================
 * 📖 Vite 构建配置 (Vite Configuration)
 * =============================================================================
 *
 * Vite 是新一代前端构建工具，由 Vue.js 作者尤雨溪创建。
 * 核心特点：开发时极快的热更新（HMR），生产时使用 Rollup 打包。
 *
 * 【知识点 - 三斜杠指令 (Triple-Slash Directive)】
 * /// <reference types="vitest" /> → 引入 Vitest 的类型定义
 * /// <reference types="vite/client" /> → 引入 Vite 客户端类型
 *
 * 为什么需要？
 * TypeScript 的 "三斜杠指令" 是最古老的模块声明方式。
 * 这里用它来扩展 Vite 配置的类型定义，让 test 字段被识别。
 * 没有这行，TypeScript 会报错说 defineConfig 不支持 test 属性。
 *
 * 【知识点 - defineConfig 辅助函数】
 * defineConfig({...}) 本身不做任何处理，
 * 它的唯一作用是提供 TypeScript 类型推断和 IDE 自动补全。
 * 等价于直接 export default {...}，但有了类型提示写配置更方便。
 *
 * 【知识点 - Vite 插件系统】
 * Vite 插件兼容 Rollup 插件 API，生态非常丰富。
 * - react() → @vitejs/plugin-react
 *   提供 React Fast Refresh（修改组件代码后自动热更新，保留状态）
 * - viteTsconfigPaths() → vite-tsconfig-paths
 *   让 Vite 识别 tsconfig.json 中的 paths 别名（如 @/ → ./src/）
 *
 * 【知识点 - base: './' 的作用】
 * base 设置应用的基础路径（类似 HTML 的 <base> 标签）。
 * './' → 使用相对路径（资源引用如 ./assets/xxx.js）
 * '/' → 使用绝对路径（资源引用如 /assets/xxx.js）
 *
 * 什么时候用 './'？
 * → 部署到非根路径时（如 GitHub Pages: https://user.github.io/repo/）
 * → 相对路径确保不管部署到哪个子路径都能正确加载资源
 *
 * 【知识点 - Vitest 配置集成】
 * Vite 和 Vitest 共享同一个配置文件（vite.config.ts 的 test 字段）。
 * 好处：
 * 1. 只维护一份配置
 * 2. 测试环境自动继承 Vite 的插件和别名（@/ 在测试中也能用）
 * 3. 不需要单独的 vitest.config.ts
 *
 * 【知识点 - experimentalMinChunkSize】
 * Rollup 打包时的最小 chunk 大小（字节）。
 * 太多小文件 → HTTP 请求过多 → 性能下降
 * 这个选项会合并过小的 chunk，减少请求数量。
 * =============================================================================
 */

/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	/**
	 * 【基础路径】
	 * './' → 相对路径，确保在子目录部署时资源路径正确
	 */
	base: './',

	/**
	 * 【插件列表】
	 * react()插件 → 用来热更新和JSX转换
	 * viteTsconfigPaths()插件 → 用来识别tsconfig.json中的路径别名（如 @/ → ./src/）
	 */
	plugins: [react(), viteTsconfigPaths()],

	/**
	 * 其他常用选项（本项目未使用，但值得了解）：
	 * - open: true → 启动后自动打开浏览器
	 * - host: true → 监听所有地址（允许局域网访问，移动端调试必备）
	 * - proxy: {} → API 代理（避免跨域问题）
	 */
	server: {
		port: 3000,
	},

	/**
	 * 【预览服务器配置】
	 * vite preview 命令用于本地预览生产构建结果。
	 * 与 dev server 不同，它直接提供 dist/ 目录的静态文件。
	 */
	preview: {
		port: 3000,
	},

	/**
	 * 【Vitest 测试配置 这里配的 单元测试和组件测试，不包含e2e】
	 *
	 * globals: true
	 * → 自动注入 describe、it、expect 等全局函数
	 * → 不需要在每个测试文件 import { describe, it, expect } from 'vitest'
	 * → 需要在 tsconfig.json 中添加 "types": ["vitest/globals"]
	 *
	 * environment: 'jsdom'
	 * → 使用 jsdom 模拟浏览器环境（document、window 等 API）
	 * → React 组件测试必需（React 需要 DOM API）
	 * → 其他选项：'node'（默认）、'happy-dom'（更快但兼容性稍差）
	 *
	 * setupFiles
	 * → 在每个测试文件之前执行的脚本
	 * → 用于全局 setup：MSW 启动、jest-dom matchers 扩展等
	 *
	 * exclude
	 * → 排除不需要运行的文件
	 * → e2e 测试由 Playwright 单独运行，不走 Vitest
	 *
	 * coverage.include
	 * → 代码覆盖率只统计 src/ 下的文件
	 * → 排除 node_modules、配置文件等
	 */
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/testing/setup-tests.ts',
		exclude: ['**/node_modules/**', '**/e2e/**'],
		coverage: {
			include: ['src/**'],
		},
	},

	/**
	 * 【依赖预优化】
	 * Vite 开发模式下会预编译（pre-bundle）第三方依赖。
	 * exclude: ['fsevents'] → macOS 文件监听库，纯 native 模块，
	 * 不能被 esbuild 处理，排除后避免警告。
	 */
	optimizeDeps: { exclude: ['fsevents'] },

	/**
	 * 【生产构建配置】
	 *
	 * experimentalMinChunkSize: 3500
	 * → Rollup 打包时，小于 3500 字节的 chunk 会被合并到其他 chunk
	 * → 减少 HTTP 请求数量（HTTP/2 下影响较小，但仍有益）
	 *
	 * 其他常用构建选项（本项目未使用）：
	 * - manualChunks → 手动控制 vendor chunk 分割
	 * - target → 编译目标（默认 'modules' = 支持原生 ESM 的浏览器）
	 * - sourcemap → 是否生成 source map（调试用）
	 * - minify → 压缩方式（'esbuild' 默认，'terser' 更小但更慢）
	 */
	build: {
		rollupOptions: {
			output: {
				experimentalMinChunkSize: 3500,
			},
		},
	},
});
