/**
 * =============================================================================
 * 📖 首页 (Home Page)
 * =============================================================================
 *
 * 【知识点 - useSearchParams 管理 URL 查询参数】
 * React Router 的 useSearchParams 类似 useState，但状态存在 URL 中：
 *   - searchParams.get('tag') → 读取 ?tag=React
 *   - setSearchParams({ tag: 'React' }) → 设置 ?tag=React
 *   - setSearchParams({}) → 清空所有查询参数
 *
 * 将筛选状态放在 URL 中（而非 useState）的好处：
 *   1. 可以分享链接（别人打开就是筛选后的状态）
 *   2. 浏览器前进/后退可以恢复筛选状态
 *   3. 刷新页面不会丢失筛选状态
 *
 * 这是 "URL as State" 的设计理念。
 *
 * 【VirtualPostsList 的 key prop】
 * <VirtualPostsList key={activeTag ?? 'all'} tag={activeTag} />
 * key 变化会导致组件完全卸载并重新挂载。
 * 为什么要这样？
 *   - 切换标签时，虚拟列表需要重置滚动位置和加载状态
 *   - 如果不换 key，虚拟列表会保留旧的 scroll 状态，
 *     导致切换标签后还在之前的滚动位置
 * =============================================================================
 */
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router';

import { ContentLayout } from '@/components/layouts/content-layout';
import { Head } from '@/components/seo/head';
import { siteConfig } from '@/config/site';
import { useTags } from '@/features/blog/api/get-tags';
import { SearchTrigger } from '@/features/blog/components/search-box';
import { VirtualPostsList } from '@/features/blog/components/virtual-posts-list';

/**
 * 标签筛选组件
 *
 * 【设计模式 - 筛选器的 toggle 行为】
 * 点击已选中的标签 → 取消筛选（setSearchParams({})）
 * 点击未选中的标签 → 应用筛选（setSearchParams({ tag })）
 * 这比单独的"清除筛选"按钮更直觉。
 */
function TagFilter() {
	const [searchParams, setSearchParams] = useSearchParams();
	const activeTag = searchParams.get('tag') || undefined;
	const { data } = useTags();
	const tags = data?.data ?? [];

	const handleTagClick = (tag: string) => {
		if (activeTag === tag) {
			setSearchParams({}); // 取消筛选
		} else {
			setSearchParams({ tag }); // 应用筛选
		}
	};

	if (tags.length === 0) return null;

	return (
		<div className="flex flex-wrap items-center gap-2">
			{/* "全部" 按钮 */}
			<button
				onClick={() => setSearchParams({})}
				className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
					!activeTag
						? 'border-transparent bg-primary text-primary-foreground'
						: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
				}`}
			>
				全部
			</button>
			{/* 各标签按钮 */}
			{tags.map((tag) => (
				<button
					key={tag.name}
					onClick={() => handleTagClick(tag.name)}
					className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
						activeTag === tag.name
							? 'border-transparent bg-primary text-primary-foreground'
							: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
					}`}
				>
					{tag.name}
					<span className="ml-1 opacity-60">({tag.count})</span>
				</button>
			))}
		</div>
	);
}

export function HomePage() {
	const [searchParams] = useSearchParams();
	const activeTag = searchParams.get('tag') || undefined;

	return (
		<>
			<Head />
			<ContentLayout>
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="mb-8"
				>
					<div className="flex items-start justify-between gap-4">
						<div>
							<h1 className="text-3xl font-bold text-foreground">
								{activeTag ? (
									<>
										<span className="text-muted-foreground">#</span> {activeTag}
									</>
								) : (
									'所有文章'
								)}
							</h1>
							<p className="mt-2 text-muted-foreground">
								{activeTag
									? `关于 ${activeTag} 的技术文章`
									: siteConfig.description}
							</p>
						</div>
						{/* 搜索按钮 */}
						<SearchTrigger className="shrink-0" />
					</div>

					<div className="mt-6">
						<TagFilter />
					</div>
				</motion.div>

				{/**
				 * 【key={activeTag ?? 'all'} 的作用】
				 * key 变化 → 组件卸载并重新挂载
				 * → useInfiniteQuery 重新初始化（从第一页开始）
				 * → 虚拟列表重新初始化（滚动位置归零）
				 * 这确保了标签切换时的干净状态。
				 */}
				<VirtualPostsList key={activeTag ?? 'all'} tag={activeTag} />
			</ContentLayout>
		</>
	);
}
