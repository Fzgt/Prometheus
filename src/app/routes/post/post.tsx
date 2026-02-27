import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { useParams, Link } from 'react-router';

import { Head } from '@/components/seo/head';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { usePost } from '@/features/blog/api/get-post';
import { PostContent } from '@/features/blog/components/post-content';
import { PostToc } from '@/features/blog/components/post-toc';
import { ReadingProgress } from '@/features/blog/components/reading-progress';
import { TagChip } from '@/features/blog/components/tag-chip';
import { CommentsList } from '@/features/comments/components/comments-list';
import { formatDate, formatReadingTime } from '@/utils/format';

export function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, isError } = usePost({ slug: slug! });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-xl font-medium text-foreground">文章不存在</p>
        <p className="text-muted-foreground">该文章可能已被删除或链接有误</p>
        <Button asChild variant="outline">
          <Link to={paths.home.getHref()}>返回首页</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Head
        title={post.title}
        description={post.excerpt}
        image={post.coverImage}
        type="article"
      />
      <ReadingProgress />

      <div className="container max-w-6xl py-8">
        {/* 返回按钮 */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to={paths.home.getHref()}>
            <ArrowLeft className="size-4" />
            所有文章
          </Link>
        </Button>

        <div className="flex gap-8">
          {/* 主内容区 */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="min-w-0 flex-1"
          >
            {/* 封面图 */}
            {post.coverImage && (
              <div className="mb-8 overflow-hidden rounded-xl">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full object-cover"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            )}

            {/* 标签 */}
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <TagChip key={tag} tag={tag} clickable />
              ))}
            </div>

            {/* 标题 */}
            <h1 className="mb-4 text-4xl font-bold leading-tight text-foreground">
              {post.title}
            </h1>

            {/* 元信息 */}
            <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-border pb-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="size-4" />
                {post.author.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {formatReadingTime(post.readingTime)}
              </span>
            </div>

            {/* 文章内容 */}
            <PostContent content={post.content} />

            {/* 分隔线 */}
            <div className="my-12 border-t border-border" />

            {/* 评论区 */}
            <CommentsList postId={post.id} />
          </motion.article>

          {/* 右侧 TOC（桌面端）*/}
          <aside className="hidden w-64 shrink-0 xl:block">
            <div className="sticky top-20">
              <PostToc content={post.content} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
