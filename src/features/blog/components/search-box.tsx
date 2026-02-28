/**
 * =============================================================================
 * 📖 搜索组件 (Search Box + Trigger)
 * =============================================================================
 *
 * 实现了一个 CMD+K / "/" 快捷键触发的搜索弹窗。
 *
 * 【核心技术】
 * 1. Fuse.js → 客户端模糊搜索（Fuzzy Search）
 * 2. Dialog → Radix UI 对话框（无障碍 + 动画）
 * 3. useMemo → 稳定引用，避免无限循环
 * 4. useRef → 命令式聚焦输入框
 * 5. useEffect + addEventListener → 全局键盘快捷键
 *
 * 【知识点 - Fuse.js 模糊搜索】
 * Fuse.js 是一个轻量级的客户端搜索库，支持：
 * - 模糊匹配（typo 容忍，如 "recat" 能匹配 "react"）
 * - 加权搜索（title 权重 > excerpt 权重 → title 匹配优先排序）
 * - threshold 控制模糊程度（0 = 精确匹配，1 = 匹配一切）
 *
 * 适用场景：数据量小（< 1000 条），无需后端搜索 API。
 * 如果数据量大，应改用 Algolia / Elasticsearch 等后端搜索方案。
 *
 * 【知识点 - useMemo 防止引用变化导致的无限循环】
 * 问题场景：
 *   const posts = data?.data ?? [];  // 每次渲染都生成新数组 []
 *   useEffect(() => { ... }, [posts]);  // posts 总是"新的" → effect 无限触发
 *
 * 解决方案：
 *   const posts = useMemo(() => data?.data ?? [], [data]);
 *   // data 不变 → posts 引用不变 → effect 不会重新触发
 *
 * 【组件结构】
 * SearchTrigger → 搜索按钮 + 键盘快捷键监听
 *   └── SearchBox → 搜索弹窗（Dialog + Input + 结果列表）
 * =============================================================================
 */
import Fuse from 'fuse.js';
import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { paths } from '@/config/paths';
import { type Post } from '@/types/api';
import { formatDate } from '@/utils/format';

import { usePosts } from '../api/get-posts';

import { TagChip } from './tag-chip';

/**
 * 【获取所有文章供搜索】
 * 在真实项目中应有专门的搜索 API（如 /api/search?q=xxx），
 * 这里简化为获取所有文章后在客户端搜索。
 *
 * staleTime: Infinity → 文章数据在整个会话期间不会过期，
 * 避免每次打开搜索框都重新请求。
 */
function useAllPosts() {
	// 获取足够多的文章供搜索（实际项目中应有专门的搜索 API）
	return usePosts({
		options: { page: 1 },
		queryConfig: { staleTime: Infinity },
	});
}

type SearchBoxProps = {
	open: boolean;
	onClose: () => void;
};

export function SearchBox({ open, onClose }: SearchBoxProps) {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<Post[]>([]);
	/**
	 * 【useRef 存储 DOM 引用】
	 * useRef<HTMLInputElement>(null) 创建一个可变引用。
	 * 通过 <Input ref={inputRef} /> 将引用绑定到 DOM 元素。
	 * 之后可以用 inputRef.current?.focus() 命令式操作 DOM。
	 *
	 * 为什么不用 autoFocus 属性？
	 * → Dialog 的出现有动画，autoFocus 在 DOM 插入时立即触发，
	 *   可能在动画开始前就聚焦，导致视觉闪烁。
	 *   setTimeout 100ms 等动画稳定后再聚焦，体验更好。
	 */
	const inputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	const { data } = useAllPosts();

	/**
	 * 【useMemo 稳定引用 — 核心技巧】
	 *
	 * 问题：data?.data 在 React Query 内部是稳定引用的，
	 *        但 ?? [] 在 data?.data 为 undefined 时每次渲染生成新数组。
	 *
	 * 如果不用 useMemo：
	 *   const posts = data?.data ?? [];  // 每次新数组
	 *   const fuse = useMemo(() => new Fuse(posts, ...), [posts]);
	 *   // posts 引用变化 → fuse 重建 → 下游 effect 触发 → 可能无限循环
	 *
	 * 用了 useMemo：
	 *   const posts = useMemo(() => data?.data ?? [], [data]);
	 *   // data 不变 → posts 不变 → fuse 不变 → 稳定！
	 */
	const posts = useMemo(() => data?.data ?? [], [data]);

	/**
	 * 【Fuse.js 实例创建】
	 *
	 * 配置项：
	 * - keys：搜索哪些字段
	 *   - weight：字段权重（title=2 → 标题匹配分数是 excerpt 的 2 倍）
	 * - threshold：模糊度（0.4 = 较宽松，0 = 精确匹配）
	 * - includeScore：结果中包含匹配分数（分数越低越匹配）
	 *
	 * 为什么放在 useMemo 中？
	 * → new Fuse() 会建立搜索索引（有计算成本）
	 * → posts 不变时不需要重建索引
	 */
	const fuse = useMemo(
		() =>
			new Fuse(posts, {
				keys: [
					{ name: 'title', weight: 2 },
					{ name: 'excerpt', weight: 1 },
					{ name: 'tags', weight: 1.5 },
				],
				threshold: 0.4,
				includeScore: true,
			}),
		[posts],
	);

	/**
	 * 【弹窗打开时重置状态 + 聚焦输入框】
	 *
	 * setTimeout 100ms 的原因：
	 * Dialog 的出现有 CSS 动画（opacity + zoom），
	 * 如果在动画开始前就 focus，浏览器可能在错误位置渲染光标。
	 * 等 100ms 让动画完成后再聚焦，体验更流畅。
	 *
	 * inputRef.current?.focus() 中的 ?. 是可选链：
	 * 如果 Input 组件尚未挂载（current 为 null），不会报错。
	 */
	useEffect(() => {
		if (open) {
			setTimeout(() => inputRef.current?.focus(), 100);
			setQuery('');
			setResults([]);
		}
	}, [open]);

	/**
	 * 【搜索逻辑】
	 *
	 * fuse.search(query) 返回格式：
	 * [{ item: Post, score: number, refIndex: number }, ...]
	 * - item：原始数据
	 * - score：匹配分数（0 = 完美匹配，1 = 完全不匹配）
	 * - 结果已按 score 升序排列（最匹配的在前）
	 *
	 * .slice(0, 5) → 只取前 5 个结果（搜索弹窗空间有限）
	 * .map(r => r.item) → 提取原始 Post 对象
	 */
	useEffect(() => {
		if (!query.trim()) {
			setResults([]);
			return;
		}
		const fuseResults = fuse.search(query);
		setResults(fuseResults.slice(0, 5).map((r) => r.item));
	}, [query, fuse]);

	/** 选中搜索结果 → 跳转到文章页 + 关闭弹窗 */
	const handleSelect = (slug: string) => {
		navigate(paths.post.getHref(slug));
		onClose();
	};

	return (
		/**
		 * 【Radix Dialog 的 open + onOpenChange】
		 * open → 受控模式，由父组件控制是否打开
		 * onOpenChange → 当用户按 Esc 或点遮罩层时触发
		 *   这里传 onClose，等于在这些情况下关闭弹窗
		 */
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					{/**
					 * sr-only → Screen Reader Only
					 * 视觉上隐藏标题，但屏幕阅读器可以读到。
					 * Dialog 必须有标题（无障碍要求），
					 * 但这个搜索框的标题在视觉上不需要显示。
					 */}
					<DialogTitle className="sr-only">搜索文章</DialogTitle>
				</DialogHeader>

				{/* 搜索输入框 + 图标 */}
				<div className="relative">
					{/**
					 * 【绝对定位图标的居中技巧】
					 * absolute left-3 → 水平位置
					 * top-1/2 -translate-y-1/2 → 垂直居中
					 *
					 * 原理：top-1/2 把元素顶边放到容器 50% 处，
					 * -translate-y-1/2 把元素自身向上移动 50%，
					 * 最终元素中心对齐容器中心。
					 */}
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						ref={inputRef}
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="搜索文章标题、摘要或标签..."
						className="px-9"
					/>
					{/* 有输入内容时显示清除按钮 */}
					{query && (
						<button
							onClick={() => setQuery('')}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						>
							<X className="size-4" />
						</button>
					)}
				</div>

				{/* 搜索结果列表 */}
				{results.length > 0 && (
					<ul className="space-y-1">
						{results.map((post) => (
							<li key={post.id}>
								<button
									onClick={() => handleSelect(post.slug)}
									className="w-full rounded-lg p-3 text-left transition-colors hover:bg-accent"
								>
									<div className="mb-1 flex flex-wrap gap-1">
										{post.tags.map((tag) => (
											<TagChip key={tag} tag={tag} />
										))}
									</div>
									<p className="font-medium text-foreground">{post.title}</p>
									<p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
										{post.excerpt}
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										{formatDate(post.publishedAt)}
									</p>
								</button>
							</li>
						))}
					</ul>
				)}

				{/* 有搜索词但无结果 */}
				{query && results.length === 0 && (
					<p className="py-4 text-center text-sm text-muted-foreground">
						{`没有找到"${query}"相关的文章`}
					</p>
				)}

				{/* 无搜索词时的提示 */}
				{!query && (
					<p className="py-2 text-center text-xs text-muted-foreground">
						按 <kbd className="rounded bg-muted px-1 py-0.5 font-mono">Esc</kbd>{' '}
						关闭
					</p>
				)}
			</DialogContent>
		</Dialog>
	);
}

/**
 * =============================================================================
 * 搜索触发按钮 (Search Trigger)
 * =============================================================================
 *
 * 职责：
 * 1. 渲染搜索按钮
 * 2. 监听全局 "/" 快捷键
 * 3. 管理 SearchBox 的 open 状态
 *
 * 【知识点 - 全局键盘快捷键】
 * 通过 document.addEventListener('keydown', handler) 实现。
 * 关键点：
 * 1. 过滤掉在 INPUT/TEXTAREA 中的按键（避免冲突）
 * 2. e.preventDefault() 阻止 "/" 输入到页面
 * 3. 清理函数 removeEventListener 防止内存泄漏
 *
 * 【知识点 - 条件渲染 + 响应式】
 * hidden sm:inline → 在小屏幕上隐藏文字和快捷键提示，
 * 只显示搜索图标，节省空间。
 */
export function SearchTrigger({ className }: { className?: string }) {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			/**
			 * 【快捷键过滤逻辑】
			 * 1. 只响应 "/" 键
			 * 2. 排除在输入框/文本域中的按键
			 *    → (e.target as HTMLElement).tagName 获取触发元素的标签名
			 *    → INPUT/TEXTAREA 中按 "/" 是正常输入，不应打开搜索
			 */
			if (
				e.key === '/' &&
				!['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
			) {
				e.preventDefault();
				setOpen(true);
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, []);

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				onClick={() => setOpen(true)}
				className={className}
			>
				<Search className="size-3.5" />
				{/* hidden sm:inline → 小屏幕隐藏文字 */}
				<span className="hidden sm:inline">搜索</span>
				{/* kbd → 键盘按键提示样式 */}
				<kbd className="hidden rounded bg-muted px-1 py-0.5 font-mono text-xs sm:inline">
					/
				</kbd>
			</Button>
			{/* SearchBox 始终渲染，通过 open prop 控制显示 */}
			<SearchBox open={open} onClose={() => setOpen(false)} />
		</>
	);
}
