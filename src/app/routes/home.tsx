import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router';

import { ContentLayout } from '@/components/layouts/content-layout';
import { Head } from '@/components/seo/head';
import { siteConfig } from '@/config/site';
import { useTags } from '@/features/blog/api/get-tags';
import { SearchTrigger } from '@/features/blog/components/search-box';
import { VirtualPostsList } from '@/features/blog/components/virtual-posts-list';

function TagFilter() {
	const [searchParams, setSearchParams] = useSearchParams();
	const activeTag = searchParams.get('tag') || undefined;
	const { data } = useTags();
	const tags = data?.data ?? [];

	const handleTagClick = (tag: string) => {
		if (activeTag === tag) {
			setSearchParams({});
		} else {
			setSearchParams({ tag });
		}
	};

	if (tags.length === 0) return null;

	return (
		<div className="flex flex-wrap items-center gap-2">
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
						<SearchTrigger className="shrink-0" />
					</div>

					<div className="mt-6">
						<TagFilter />
					</div>
				</motion.div>

				{/*
          VirtualPostsList：
          - useInfiniteQuery 按页加载，用户无感知
          - useWindowVirtualizer 只渲染视口内节点，DOM 数量恒定
          - 切换 tag 时 queryKey 变化，自动重置回第一页
        */}
				<VirtualPostsList key={activeTag ?? 'all'} tag={activeTag} />
			</ContentLayout>
		</>
	);
}
