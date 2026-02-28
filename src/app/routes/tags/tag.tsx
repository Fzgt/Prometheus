/**
 * =============================================================================
 * 📖 标签文章列表页 (Tag Page)
 * =============================================================================
 *
 * 【知识点 - decodeURIComponent】
 * URL 中的特殊字符会被编码（如中文 "最佳实践" → "%E6%..."）。
 * decodeURIComponent 将编码后的字符串还原为可读的原始文本。
 *
 * 这个页面通过 PostsList 组件展示指定标签下的所有文章，
 * 使用传统分页（而非首页的虚拟滚动），展示了同一项目中两种分页方案的对比。
 * =============================================================================
 */
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { ContentLayout } from '@/components/layouts/content-layout';
import { Head } from '@/components/seo/head';
import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { PostsList } from '@/features/blog/components/posts-list';

export function TagPage() {
	const { tag } = useParams<{ tag: string }>();
	// URL 解码：将 '%E6%...' 还原为中文
	const decodedTag = decodeURIComponent(tag ?? '');

	return (
		<>
			<Head
				title={`#${decodedTag}`}
				description={`所有关于 ${decodedTag} 的文章`}
			/>
			<ContentLayout>
				<Button variant="ghost" size="sm" asChild className="mb-6">
					<Link to={paths.home.getHref()}>
						<ArrowLeft className="size-4" />
						所有文章
					</Link>
				</Button>

				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground">
						<span className="text-muted-foreground">#</span> {decodedTag}
					</h1>
					<p className="mt-2 text-muted-foreground">
						所有关于 {decodedTag} 的文章
					</p>
				</div>

				{/* PostsList 接受 tag 参数，自动筛选该标签下的文章 */}
				<PostsList tag={decodedTag} />
			</ContentLayout>
		</>
	);
}
