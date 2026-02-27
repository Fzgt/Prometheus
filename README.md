# Prometheus

A personal blog built with React + TypeScript, following the [bulletproof-react](https://github.com/alan2207/bulletproof-react) architecture pattern.

## Tech Stack

| Category | Libraries |
|---|---|
| Framework | React 18, TypeScript, Vite |
| Routing | React Router 7 (lib mode) |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| HTTP | Axios |
| Mock API | MSW 2 + @mswjs/data |
| Styling | Tailwind CSS, Radix UI |
| Animation | Framer Motion |
| Markdown | react-markdown, remark-gfm, rehype-slug |
| Syntax Highlight | Shiki |
| Search | Fuse.js |
| Virtualization | @tanstack/react-virtual |
| Form | React Hook Form + Zod |
| Testing | Vitest, Testing Library |

## Project Structure

```
src/
├── app/                  # Entry, router, providers, root layout
│   └── routes/           # Page components (lazy loaded)
├── features/             # Feature modules
│   ├── blog/             # Post list, post detail, search, TOC
│   ├── comments/         # Comment list and creation
│   └── theme/            # Dark/light theme store and toggle
├── components/           # Shared UI components (Button, Badge, Dialog...)
├── lib/                  # Axios client, React Query config, Shiki setup
├── hooks/                # Shared hooks
├── config/               # Env vars, route paths, site config
├── types/                # API type definitions
├── utils/                # cn, date formatting
└── testing/              # MSW handlers, in-memory DB, test utilities
```

## Key Technical Highlights

**Feature-based architecture** — code is organized by domain (`blog/`, `comments/`, `theme/`) with enforced unidirectional imports via ESLint `import/no-restricted-paths`. Shared modules (`components/`, `lib/`, `utils/`) cannot import from feature or app layers.

**API triple pattern** — each API file exports three things: a plain fetch function, a `queryOptions`/`infiniteQueryOptions` factory, and a `useXxx` hook. This keeps data fetching composable and testable.

**Infinite scroll + virtual list** — the home page uses `useInfiniteQuery` for paginated fetching and `useWindowVirtualizer` for DOM recycling, so only visible cards are mounted regardless of total post count.

**MSW mock backend** — `@mswjs/data` provides a typed in-memory database with seeded posts. API handlers live in `src/testing/mocks/handlers/` and are activated in development via a service worker.

**Theme system** — Zustand store persisted to `localStorage`, detects system `prefers-color-scheme`, applies a `dark` class to `<html>`. CSS variables handle all color tokens.

**Shiki code highlighting** — highlighter instance is created once (singleton) and reused across renders. Code blocks are rendered server-side style, supporting VSCode-level themes that follow the active light/dark theme.

**Stable reference pattern** — `useMemo` wraps `data?.data ?? []` and the `Fuse` instance in `SearchBox` to prevent infinite re-render loops caused by new array references on every render.

## Development

```bash
yarn dev        # Start dev server (MSW mock enabled)
yarn build      # Production build
yarn test       # Run unit tests
yarn lint       # ESLint check
yarn check-types  # TypeScript type check
```
