import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';

import { paths } from '@/config/paths';
import { type Post } from '@/types/api';
import { formatDate, formatReadingTime } from '@/utils/format';

import { TagChip } from './tag-chip';

type PostCardProps = {
	post: Post;
	index?: number;
};

export function PostCard({ post, index = 0 }: PostCardProps) {
	const navigate = useNavigate();

	return (
		<motion.article
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: index * 0.05 }}
			onClick={() => navigate(paths.post.getHref(post.slug))}
			className="group cursor-pointer rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
			role="article"
			aria-label={post.title}
		>
			{post.coverImage && (
				<div className="mb-4 overflow-hidden rounded-lg">
					<img
						src={post.coverImage}
						alt={post.title}
						className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
					/>
				</div>
			)}

			<div className="mb-3 flex flex-wrap gap-1.5">
				{post.tags.map((tag) => (
					<TagChip key={tag} tag={tag} />
				))}
			</div>

			<h2 className="mb-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary">
				{post.title}
			</h2>

			<p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
				{post.excerpt}
			</p>

			<div className="flex items-center gap-4 text-xs text-muted-foreground">
				<span className="flex items-center gap-1">
					<Calendar className="size-3" />
					{formatDate(post.publishedAt)}
				</span>
				<span className="flex items-center gap-1">
					<Clock className="size-3" />
					{formatReadingTime(post.readingTime)}
				</span>
			</div>
		</motion.article>
	);
}
