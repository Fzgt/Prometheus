/**
 * =============================================================================
 * 📖 环境变量验证 (Environment Variables Validation)
 * =============================================================================
 *
 * 【知识点 - 用 Zod 验证环境变量】
 * 传统做法：直接用 process.env.XXX，如果变量缺失或格式错误，运行时才会报错。
 * 最佳实践：在应用启动时统一验证所有环境变量。
 *
 * Zod 是 TypeScript 生态最流行的运行时校验库。它同时提供：
 *   1. 运行时验证：envSchema.parse() 如果验证失败，立即抛出 ZodError
 *   2. TypeScript 类型推断：z.infer<typeof envSchema> 自动推导出类型
 * "一处定义，类型和验证同步"——这就是 Zod 的核心优势。
 *
 * 【Vite 环境变量规则】
 * - 只有 VITE_ 前缀的变量会暴露给客户端代码
 * - import.meta.env.MODE 是 Vite 内置变量（'development' | 'production' | 'test'）
 * - 敏感变量（数据库密码、API Key）不要加 VITE_ 前缀！
 *
 * 【面试考点】
 * Q: "你怎么管理前端项目的环境变量？"
 * A: "用 Zod schema 在启动时验证，类型安全 + 快速失败（fail fast），
 *     而不是运行到某个 API 调用时才发现 URL 是 undefined。"
 * =============================================================================
 */
import { z } from 'zod';

/**
 * 【Zod Schema 详解】
 *
 * z.object({...}) — 定义一个对象 schema
 * z.string()       — 必须是字符串
 * .default('')     — 如果值为 undefined，使用默认值
 * .min(1)          — 字符串长度至少为 1（不能为空字符串）
 * .transform()     — 转换值的类型（这里把 'true'/'false' 字符串转成 boolean）
 * z.enum([...])    — 枚举类型，值必须是其中之一
 */
const envSchema = z.object({
	// API 基础 URL，空字符串表示使用相对路径（MSW mock 模式）
	API_URL: z.string().default(''),
	// 应用 URL，用于 SEO 和 OG 标签
	APP_URL: z.string().min(1).default('http://localhost:3000'),
	// 是否启用 API Mocking（字符串 → 布尔值 的转换）
	ENABLE_API_MOCKING: z
		.string()
		.transform((val) => val === 'true')
		.default('true'),
	// 当前运行模式（由 Vite 自动注入）
	MODE: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * 【parse() vs safeParse()】
 * - parse()：验证失败直接抛出 ZodError（适合环境变量——启动时就要挂掉）
 * - safeParse()：返回 { success, data, error }（适合表单验证——需要展示错误信息）
 *
 * 这里用 parse() 是刻意的：如果环境变量有问题，应用应该立即崩溃，
 * 而不是带着错误配置运行到某个 API 调用才报错。这就是"fail fast"原则。
 */
export const env = envSchema.parse({
	API_URL: import.meta.env.VITE_APP_API_URL,
	APP_URL: import.meta.env.VITE_APP_APP_URL,
	ENABLE_API_MOCKING: import.meta.env.VITE_APP_ENABLE_API_MOCKING,
	MODE: import.meta.env.MODE,
});
