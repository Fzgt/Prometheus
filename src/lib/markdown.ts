/**
 * =============================================================================
 * 📖 Markdown 处理工具 (Markdown Utilities)
 * =============================================================================
 *
 * 【知识点 - Shiki 代码高亮】
 * Shiki 是 VS Code 使用的同一套高亮引擎（TextMate 语法）。
 * 相比 highlight.js 和 Prism.js，Shiki 的优势：
 *   - 颜色与 VS Code 完全一致（使用 VS Code 主题文件）
 *   - 支持所有 VS Code 支持的语言
 *   - 无需加载额外 CSS（颜色内联到 HTML 中）
 *
 * 缺点：初次加载需要下载 WASM 和语法文件（几百 KB），所以用懒加载。
 *
 * 【设计模式 - 单例 + 懒加载】
 * highlighter 变量在模块级别声明，首次调用 getHighlighter() 时初始化。
 * 后续调用直接返回缓存的实例（单例模式）。
 * 这避免了多次创建 highlighter 导致的内存浪费和重复网络请求。
 * =============================================================================
 */
import {
	type BundledLanguage,
	createHighlighter,
	type Highlighter,
} from 'shiki';

/**
 * 模块级变量：Shiki 高亮器的单例实例
 *
 * 【TS 技巧 - 联合类型 Highlighter | null】
 * null 表示尚未初始化。这比 undefined 更明确——
 * undefined 通常表示"忘记赋值"，null 表示"有意的空值"。
 */
let highlighter: Highlighter | null = null;

/**
 * 获取或创建 Shiki 高亮器实例
 *
 * 【异步单例模式】
 * 第一次调用：创建 highlighter 并缓存
 * 后续调用：直接返回缓存实例
 *
 * themes：代码块的配色主题
 *   - github-dark：暗色主题
 *   - github-light：亮色主题
 *   → 根据博客的亮/暗模式动态切换
 *
 * langs：预加载的语言列表
 *   → 只加载博客中可能用到的语言，减少 bundle 大小
 *   → 如果用户代码块指定了未加载的语言，Shiki 会 fallback 到纯文本
 *
 * 【TS 技巧 - as BundledLanguage[]】
 * 字符串数组字面量 ['typescript', 'tsx', ...] 的类型是 string[]，
 * 但 createHighlighter 期望 BundledLanguage[]（联合字符串字面量类型）。
 * 用 `as` 断言告诉 TS 这些字符串都是合法的语言标识符。
 */
export async function getHighlighter(): Promise<Highlighter> {
	if (!highlighter) {
		highlighter = await createHighlighter({
			themes: ['github-dark', 'github-light'],
			langs: [
				'typescript',
				'tsx',
				'javascript',
				'jsx',
				'css',
				'html',
				'json',
				'bash',
				'shell',
				'markdown',
				'yaml',
				'python',
				'rust',
				'go',
			] as BundledLanguage[],
		});
	}
	return highlighter;
}

/**
 * 从 Markdown 原文中提取标题列表（用于生成目录 TOC）
 *
 * 【正则表达式解析】
 * /^(#{1,6})\s+(.+)$/gm
 *   ^          → 行开头
 *   (#{1,6})   → 1~6 个 # 号（h1~h6），捕获到 match[1]
 *   \s+        → 至少一个空格
 *   (.+)       → 标题文本，捕获到 match[2]
 *   $          → 行结尾
 *   g          → 全局匹配（找出所有标题）
 *   m          → 多行模式（^ 和 $ 匹配每行，而非整个字符串）
 *
 * 【ID 生成算法】
 * 标题文本 → 小写 → 去掉特殊字符（保留中文） → 空格转连字符 → 合并连字符
 * 例如："React Hooks 深度解析" → "react-hooks-深度解析"
 *
 * 这个 ID 必须与 rehype-slug 插件生成的 ID 一致，
 * 否则 TOC 的锚点链接无法跳转到正确位置。
 * /[^\w\u4e00-\u9fa5\s-]/g 中 \u4e00-\u9fa5 是 CJK 统一汉字的 Unicode 范围。
 */
export function extractHeadings(
	markdown: string,
): { id: string; text: string; level: number }[] {
	const headingRegex = /^(#{1,6})\s+(.+)$/gm;
	const headings: { id: string; text: string; level: number }[] = [];

	let match;
	// exec + while 循环是正则全局匹配的标准写法
	// 每次 exec 返回下一个匹配结果，null 表示结束
	while ((match = headingRegex.exec(markdown)) !== null) {
		const level = match[1].length; // # 的数量 = 标题级别
		const text = match[2].trim();
		const id = text
			.toLowerCase()
			.replace(/[^\w\u4e00-\u9fa5\s-]/g, '') // 去掉特殊字符
			.replace(/\s+/g, '-') // 空格转连字符
			.replace(/-+/g, '-'); // 合并多个连字符
		headings.push({ id, text, level });
	}

	return headings;
}
