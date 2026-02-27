import { motion } from 'framer-motion';
import { Code2, Github, Heart, Twitter } from 'lucide-react';

import { ContentLayout } from '@/components/layouts/content-layout';
import { Head } from '@/components/seo/head';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

const techStack = [
  {
    category: 'Frontend',
    items: ['React 18', 'TypeScript 5', 'Vite', 'React Router 7'],
  },
  { category: 'Data', items: ['TanStack Query v5', 'Zustand', 'Axios', 'MSW'] },
  {
    category: 'UI',
    items: ['Tailwind CSS', 'Radix UI', 'Framer Motion', 'Lucide React'],
  },
  { category: 'Testing', items: ['Vitest', 'Testing Library', 'Playwright'] },
  {
    category: 'Engineering',
    items: ['ESLint', 'Prettier', 'Husky', 'Storybook'],
  },
];

export function AboutPage() {
  return (
    <>
      <Head
        title="关于"
        description={`关于 ${siteConfig.author.name} 和这个博客`}
      />
      <ContentLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-12"
        >
          {/* 作者介绍 */}
          <section className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <img
              src={siteConfig.author.avatar}
              alt={siteConfig.author.name}
              className="size-24 rounded-full border-4 border-border object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {siteConfig.author.name}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                {siteConfig.author.bio}
              </p>
              <div className="mt-4 flex justify-center gap-2 sm:justify-start">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={siteConfig.author.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="size-4" />
                    GitHub
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={siteConfig.author.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="size-4" />
                    Twitter
                  </a>
                </Button>
              </div>
            </div>
          </section>

          {/* 关于博客 */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
              <Heart className="size-6 text-red-500" />
              关于这个博客
            </h2>
            <div className="prose prose-neutral max-w-none dark:prose-invert">
              <p>
                这个博客是我系统学习和实践 React + TypeScript
                生态的产物。文章内容涵盖前端工程化、React 最佳实践、TypeScript
                深度用法等主题。
              </p>
              <p>
                项目本身就是一个学习案例——它完整实现了现代前端项目的工程化配置，包括：
              </p>
              <ul>
                <li>Feature-based 目录结构（参考 bulletproof-react）</li>
                <li>MSW + @mswjs/data 作为 Mock API 层</li>
                <li>TanStack Query v5 的 queryOptions 模式</li>
                <li>Zustand 管理客户端状态（主题 + 通知）</li>
                <li>Shiki 代码高亮 + react-markdown 文章渲染</li>
                <li>Framer Motion 页面过渡动画</li>
                <li>Vitest + Testing Library 测试配置</li>
              </ul>
            </div>
          </section>

          {/* 技术栈 */}
          <section>
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
              <Code2 className="size-6 text-primary" />
              技术栈
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {techStack.map((group) => (
                <div
                  key={group.category}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.category}
                  </p>
                  <ul className="space-y-1.5">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-foreground"
                      >
                        <span className="size-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      </ContentLayout>
    </>
  );
}
