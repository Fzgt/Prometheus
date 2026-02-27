import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { ContentLayout } from '@/components/layouts/content-layout';
import { Head } from '@/components/seo/head';
import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { PostsList } from '@/features/blog/components/posts-list';

export function TagPage() {
	const { tag } = useParams<{ tag: string }>();
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

				<PostsList tag={decodedTag} />
			</ContentLayout>
		</>
	);
}
