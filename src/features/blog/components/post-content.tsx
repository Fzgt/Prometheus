/**
 * =============================================================================
 * 📖 文章内容渲染组件 (Post Content Renderer)
 * =============================================================================
 *
 * 这是整个博客中最复杂的渲染组件，将 Markdown 字符串转化为带语法高亮的 React 组件树。
 *
 * 【核心技术栈】
 * 1. react-markdown → 将 Markdown 解析为 React 组件
 * 2. Shiki → 代码语法高亮（VS Code 同款引擎）
 * 3. MutationObserver → 监听 DOM 变化（深色模式切换）
 * 4. rehype/remark 插件 → 扩展 Markdown 解析能力
 *
 * 【渲染管线 (Rendering Pipeline)】
 * Markdown 字符串
 *   → remark-gfm（解析 GFM 扩展语法：表格、任务列表等）
 *   → rehype-slug（给标题添加 id，如 <h2 id="xxx">）
 *   → rehype-autolink-headings（给标题包裹锚点链接）
 *   → ReactMarkdown（转换为 React 组件）
 *   → 自定义 components（覆盖默认的 code/img/a 渲染）
 *
 * 【知识点 - MutationObserver】
 * MutationObserver 是浏览器原生 API，用于监听 DOM 变化。
 * 这里用它监听 <html> 元素的 class 属性变化（dark ↔ light），
 * 从而在深色模式切换时重新选择代码高亮主题。
 *
 * 为什么不用 Zustand 的 theme store？
 * → 因为 PostContent 需要监听的是最终应用到 DOM 上的 class，
 *   而不是 store 中的 theme 值（可能是 'system'）。
 *   MutationObserver 直接监听"结果"，更可靠。
 *
 * 【知识点 - dangerouslySetInnerHTML】
 * React 默认会对所有内容进行 HTML 转义（防 XSS）。
 * Shiki 生成的是 HTML 字符串（带 <span> 标签的着色代码），
 * 必须用 dangerouslySetInnerHTML 才能正确渲染。
 * ⚠️ 这里是安全的，因为 HTML 由 Shiki 生成，不是用户输入。
 *
 * 【知识点 - Tailwind 的任意选择器语法 [&>xxx]】
 * [&>pre]:overflow-x-auto 等价于 CSS 的：
 *   .className > pre { overflow-x: auto; }
 * & 代表当前元素，> 是直接子元素选择器。
 * 这是 Tailwind 处理子元素样式的方式（因为 Shiki HTML 不受控）。
 * =============================================================================
 */
import { useEffect, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeAutolink from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { type Highlighter } from 'shiki';

import { Spinner } from '@/components/ui/spinner';
import { getHighlighter } from '@/lib/markdown';
import { cn } from '@/utils/cn';

type PostContentProps = {
	content: string;
	className?: string;
};

export function PostContent({ content, className }: PostContentProps) {
	/**
	 * 【Shiki 高亮器的异步加载】
	 * Shiki 需要加载语言语法文件和主题文件（较大），所以是异步初始化。
	 * 在高亮器加载完成之前，代码块会显示为无高亮的纯文本 + Spinner。
	 *
	 * getHighlighter() 内部使用了单例模式（见 lib/markdown.ts），
	 * 所以多次调用不会重复加载。
	 */
	const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

	/**
	 * 【深色模式状态】
	 * 直接从 DOM 读取当前是否为深色模式。
	 * 初始值用 document.documentElement.classList.contains('dark') 同步获取，
	 * 后续通过 MutationObserver 监听变化。
	 */
	const [isDark, setIsDark] = useState(
		document.documentElement.classList.contains('dark'),
	);

	// ── 加载 Shiki 高亮器 ─────────────────────────────────
	useEffect(() => {
		getHighlighter().then(setHighlighter);
		// 等价于 .then((h) => setHighlighter(h))
		// 这是 Point-free 风格：直接传递函数引用
	}, []);

	/**
	 * 【MutationObserver 监听深色模式切换】
	 *
	 * MutationObserver 的用法：
	 * 1. new MutationObserver(callback) → 创建观察者
	 * 2. observer.observe(targetNode, config) → 开始观察
	 * 3. observer.disconnect() → 停止观察（清理）
	 *
	 * config 选项：
	 * - attributes: true → 监听属性变化
	 * - attributeFilter: ['class'] → 只监听 class 属性
	 *
	 * 【为什么要 return () => observer.disconnect()？】
	 * useEffect 返回的函数是"清理函数"，在组件卸载或 effect 重新执行前调用。
	 * 不清理 observer 会导致内存泄漏——observer 会一直引用回调函数和 DOM 节点。
	 */
	useEffect(() => {
		const observer = new MutationObserver(() => {
			setIsDark(document.documentElement.classList.contains('dark'));
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class'],
		});
		return () => observer.disconnect();
	}, []);

	/**
	 * 【自定义 ReactMarkdown 组件映射】
	 *
	 * ReactMarkdown 的 components prop 允许你覆盖任何 HTML 元素的渲染方式。
	 * 类型 Components（来自 react-markdown）定义了所有可覆盖的元素。
	 *
	 * 常见用例：
	 * - code → 自定义代码块渲染（加语法高亮）
	 * - img → 自定义图片（加懒加载、圆角）
	 * - a → 自定义链接（外部链接新标签页打开）
	 * - h1/h2/h3 → 自定义标题（加锚点、样式）
	 */
	const components: Components = {
		/**
		 * 【自定义 code 元素渲染 — 核心逻辑】
		 *
		 * Markdown 中的代码有两种形式：
		 * 1. 行内代码：`code` → 没有语言标记
		 * 2. 代码块：```typescript ... ``` → 有语言标记
		 *
		 * ReactMarkdown 处理代码块时：
		 * - 外层 <pre> 由 ReactMarkdown 渲染
		 * - 内层 <code> 走 components.code
		 * - className 格式为 "language-typescript"
		 *
		 * 正则 /language-(\w+)/ 提取语言名称：
		 * "language-typescript" → match[1] = "typescript"
		 */
		code({ className: codeClassName, children, ...props }) {
			const match = /language-(\w+)/.exec(codeClassName || '');
			const language = match ? match[1] : '';
			// 去掉末尾换行（Markdown 解析器常添加）
			const codeString = String(children).replace(/\n$/, '');
			// 没有 language 标记 → 行内代码
			const isInline = !match;

			// ── 情况 1：行内代码 ──────────────────────────────
			if (isInline) {
				return (
					<code
						className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
						{...props}
					>
						{children}
					</code>
				);
			}

			// ── 情况 2：代码块，但高亮器尚未加载 ──────────────
			if (!highlighter) {
				return (
					<div className="relative my-4 rounded-lg bg-muted p-4">
						<div className="absolute right-3 top-3">
							<Spinner size="sm" />
						</div>
						<pre className="overflow-x-auto font-mono text-sm">
							<code>{codeString}</code>
						</pre>
					</div>
				);
			}

			// ── 情况 3：代码块 + 高亮器就绪 → Shiki 渲染 ─────
			/**
			 * 【Shiki 的 codeToHtml】
			 * 输入：代码字符串 + 语言 + 主题
			 * 输出：带 <span style="color:xxx"> 的 HTML 字符串
			 *
			 * isDark 决定使用哪个主题：
			 * - github-dark → 深色背景下的代码配色
			 * - github-light → 浅色背景下的代码配色
			 */
			const html = highlighter.codeToHtml(codeString, {
				lang: language || 'text',
				theme: isDark ? 'github-dark' : 'github-light',
			});

			return (
				<div
					className="my-4 overflow-hidden rounded-lg border border-border [&>pre]:overflow-x-auto [&>pre]:!bg-transparent [&>pre]:p-4"
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			);
		},

		/**
		 * 【自定义图片渲染】
		 * loading="lazy" → 原生懒加载，图片进入视口时才加载
		 * 这对文章中大量图片的页面性能很重要。
		 */
		img({ src, alt }) {
			return (
				<img
					src={src}
					alt={alt}
					loading="lazy"
					className="my-4 rounded-lg border border-border"
				/>
			);
		},

		/**
		 * 【自定义链接渲染】
		 * 外部链接（http 开头）→ 新标签页打开 + rel 安全属性
		 * 内部链接 → 正常跳转
		 *
		 * rel="noopener noreferrer" 的作用：
		 * - noopener → 新页面无法通过 window.opener 访问原页面（安全）
		 * - noreferrer → 不发送 Referer 头（隐私）
		 */
		a({ href, children, ...props }) {
			const isExternal = href?.startsWith('http');
			return (
				<a
					href={href}
					{...props}
					{...(isExternal
						? { target: '_blank', rel: 'noopener noreferrer' }
						: {})}
					className="text-primary underline-offset-4 hover:underline"
				>
					{children}
				</a>
			);
		},
	};

	return (
		<div
			className={cn(
				/**
				 * 【@tailwindcss/typography 插件的 prose 类】
				 *
				 * prose → 为 Markdown 渲染的 HTML 添加漂亮的排版样式
				 * prose-neutral → 中性灰色调
				 * max-w-none → 移除默认最大宽度限制（因为外层已有宽度控制）
				 * dark:prose-invert → 深色模式下反转文字颜色
				 *
				 * prose-headings:xxx → 只对标题元素生效的修饰符
				 * scroll-mt-20 → 点击锚点时，标题距顶部留 5rem 间距
				 *                 （避免被 sticky header 遮挡）
				 *
				 * prose-pre:p-0 prose-pre:bg-transparent
				 * → 清除 prose 对 <pre> 的默认样式，因为 Shiki 有自己的样式
				 *
				 * prose-blockquote:border-l-primary
				 * → 引用块左边框使用主色调
				 */
				'prose prose-neutral max-w-none dark:prose-invert',
				'prose-headings:scroll-mt-20 prose-headings:font-bold',
				'prose-h2:text-2xl prose-h3:text-xl',
				'prose-pre:p-0 prose-pre:bg-transparent',
				'prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground',
				'prose-table:text-sm',
				className,
			)}
		>
			{/**
			 * 【ReactMarkdown 组件】
			 *
			 * children → Markdown 字符串（不是 JSX 子元素）
			 *
			 * remarkPlugins（remark 阶段 = Markdown AST 操作）：
			 * - remarkGfm → GitHub Flavored Markdown（表格、删除线、任务列表）
			 *
			 * rehypePlugins（rehype 阶段 = HTML AST 操作）：
			 * - rehypeSlug → 给标题添加 id（如 <h2 id="前言">）
			 * - rehypeAutolink → 给标题包裹 <a> 标签实现锚点跳转
			 *   - behavior: 'wrap' → 用 <a> 包裹标题文本
			 *   - ariaHidden: true → 屏幕阅读器忽略锚点
			 *   - tabIndex: -1 → 不参与 Tab 键导航
			 *
			 * components → 自定义渲染映射（见上方定义）
			 */}
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[
					rehypeSlug,
					[
						rehypeAutolink,
						{
							behavior: 'wrap',
							properties: {
								className: ['anchor'],
								ariaHidden: true,
								tabIndex: -1,
							},
						},
					],
				]}
				components={components}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
