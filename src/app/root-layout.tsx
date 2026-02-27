import { Github, Twitter } from 'lucide-react';
import * as React from 'react';
import { Link, Outlet, useNavigation } from 'react-router';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { siteConfig } from '@/config/site';
import { ThemeToggle } from '@/features/theme/components/theme-toggle';
import { useScrollToTop } from '@/hooks/use-scroll-to-top';
import { cn } from '@/utils/cn';

function Header() {
  const navLinks = [
    { label: '文章', href: paths.home.getHref() },
    { label: '关于', href: paths.about.getHref() },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 max-w-4xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            to={paths.home.getHref()}
            className="flex items-center gap-2 font-bold text-foreground no-underline hover:no-underline"
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              B
            </span>
            <span className="hidden sm:inline">{siteConfig.name}</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Button key={link.href} variant="ghost" size="sm" asChild>
                <Link
                  to={link.href}
                  className="no-underline hover:no-underline"
                >
                  {link.label}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <a
              href={siteConfig.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github className="size-4" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a
              href={siteConfig.socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <Twitter className="size-4" />
            </a>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="container max-w-4xl text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {siteConfig.author.name} · Built with
          React + TypeScript + Vite
        </p>
      </div>
    </footer>
  );
}

function GlobalLoadingIndicator() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <div
      className={cn(
        'fixed left-0 right-0 top-0 z-50 h-0.5 bg-primary transition-all duration-300',
        isLoading ? 'opacity-100' : 'opacity-0',
      )}
      style={{ width: isLoading ? '70%' : '100%' }}
    />
  );
}

export function RootLayout() {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <GlobalLoadingIndicator />
      <Header />
      <main className="flex-1">
        <React.Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <Spinner size="xl" />
            </div>
          }
        >
          <Outlet />
        </React.Suspense>
      </main>
      <Footer />
    </div>
  );
}
