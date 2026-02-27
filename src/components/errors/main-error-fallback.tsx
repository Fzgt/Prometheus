import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function MainErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="size-10 text-destructive" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">出错了</h1>
        <p className="mt-2 text-muted-foreground">
          应用遇到了意外错误，请刷新页面重试。
        </p>
      </div>
      <Button onClick={() => window.location.assign(window.location.origin)}>
        刷新页面
      </Button>
    </div>
  );
}
