import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { Link } from 'react-router';

import { Head } from '@/components/seo/head';
import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';

export function NotFoundPage() {
  return (
    <>
      <Head title="404 - 页面不存在" />
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-8xl font-black text-muted/50">404</p>
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">页面不存在</h1>
          <p className="mt-2 text-muted-foreground">
            你访问的页面不存在或已被删除
          </p>
        </div>
        <Button asChild>
          <Link to={paths.home.getHref()}>
            <Home className="size-4" />
            返回首页
          </Link>
        </Button>
      </div>
    </>
  );
}
