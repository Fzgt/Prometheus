import { db } from './db';

// 为了保持数据幂等，检查是否已经有数据
export function seedDatabase() {
  if (db.post.count() > 0) return;

  const author = {
    authorName: 'Your Name',
    authorAvatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    authorBio: '前端工程师，专注于 React 生态与工程化实践。',
  };

  db.post.create({
    slug: 'react-hooks-deep-dive',
    title: 'React Hooks 深度解析：从原理到最佳实践',
    excerpt:
      '深入探讨 React Hooks 的实现原理，分析常见误区，总结生产环境中的最佳实践模式。',
    content: `## 前言

React Hooks 自 2019 年正式发布以来，彻底改变了我们编写 React 组件的方式。本文将从源码层面解析几个核心 Hook 的工作原理，帮助你真正理解而非只是"会用"。

## useState 的工作原理

当你调用 \`useState\` 时，React 内部做了什么？

\`\`\`typescript
// 简化版的 useState 实现
let state: any;
let setState: (newState: any) => void;

function useState<T>(initialValue: T): [T, (newState: T) => void] {
  if (state === undefined) {
    state = initialValue;
  }

  setState = (newState: T) => {
    state = newState;
    // 触发重新渲染
    render();
  };

  return [state, setState];
}
\`\`\`

React 实际上维护了一个 **Fiber 节点上的 Hook 链表**，每次渲染时按顺序读取。这也是为什么 Hook 不能在条件语句中调用——顺序必须保持一致。

## useEffect 的依赖数组陷阱

这是最容易踩坑的地方：

\`\`\`typescript
// ❌ 错误：遗漏依赖项
function BadComponent({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, []); // userId 没有加入依赖数组！

  return <div>{user?.name}</div>;
}

// ✅ 正确：声明所有依赖
function GoodComponent({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]); // 每当 userId 变化时重新获取

  return <div>{user?.name}</div>;
}
\`\`\`

## useCallback 和 useMemo 的正确使用时机

**不是所有东西都需要缓存！** 过度使用反而会增加代码复杂度：

\`\`\`typescript
// ✅ 需要缓存：作为其他 Hook 依赖的函数
function SearchComponent() {
  const [query, setQuery] = useState('');

  const search = useCallback(async (q: string) => {
    return await api.search(q);
  }, []); // 函数本身不依赖外部变量，可以稳定引用

  useEffect(() => {
    search(query);
  }, [search, query]);
}

// ❌ 不需要缓存：简单的内联函数
function SimpleComponent() {
  // 没必要：onClick 不是其他 Hook 的依赖
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <button onClick={handleClick}>Click</button>;
}
\`\`\`

## 自定义 Hook：业务逻辑的最佳封装方式

\`\`\`typescript
// 一个处理异步操作的通用 Hook
function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList,
) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;

    setState((prev) => ({ ...prev, loading: true }));

    asyncFn()
      .then((data) => {
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ data: null, loading: false, error });
        }
      });

    // 清理函数：组件卸载时取消
    return () => {
      cancelled = true;
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
\`\`\`

## 总结

1. **理解链表结构**：Hook 按调用顺序存在 Fiber 上，顺序不可改变
2. **诚实声明依赖**：用 eslint-plugin-react-hooks 辅助检查
3. **按需使用 memo**：不是越多越好，先测量再优化
4. **自定义 Hook 是最强武器**：把业务逻辑从 UI 中分离
`,
    coverImage:
      'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800',
    tags: ['React', 'Hooks', '最佳实践'],
    readingTime: 8,
    publishedAt: new Date('2024-03-15').toISOString(),
    updatedAt: new Date('2024-03-15').toISOString(),
    ...author,
  });

  db.post.create({
    slug: 'typescript-generics-mastery',
    title: 'TypeScript 泛型完全指南：从入门到惊艳面试官',
    excerpt:
      '系统梳理 TypeScript 泛型的各种用法，包括条件类型、映射类型、infer 关键字，以及在实际项目中的应用场景。',
    content: `## 为什么需要泛型？

泛型解决的核心问题是：**在保证类型安全的前提下，编写可复用的代码**。

\`\`\`typescript
// 没有泛型，你需要为每种类型写重复代码
function getFirstString(arr: string[]): string {
  return arr[0];
}
function getFirstNumber(arr: number[]): number {
  return arr[0];
}

// 有了泛型，一个函数搞定
function getFirst<T>(arr: T[]): T {
  return arr[0];
}

const firstStr = getFirst(['a', 'b', 'c']); // string
const firstNum = getFirst([1, 2, 3]);       // number
\`\`\`

## 泛型约束（Constraints）

用 \`extends\` 限制泛型的范围：

\`\`\`typescript
interface Lengthwise {
  length: number;
}

// T 必须有 length 属性
function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength('hello');  // ✅ string 有 length
logLength([1, 2, 3]); // ✅ array 有 length
logLength(42);        // ❌ number 没有 length
\`\`\`

## 条件类型（Conditional Types）

这是 TypeScript 中最强大、也最难理解的特性之一：

\`\`\`typescript
type IsArray<T> = T extends any[] ? true : false;

type A = IsArray<string[]>;  // true
type B = IsArray<string>;    // false

// 实用工具类型：NonNullable
type NonNullable<T> = T extends null | undefined ? never : T;

// 从数组类型提取元素类型
type Flatten<T> = T extends Array<infer Item> ? Item : T;

type Num = Flatten<number[]>;  // number
type Str = Flatten<string>;    // string（不是数组，原样返回）
\`\`\`

## infer 关键字：类型推断的魔法

\`\`\`typescript
// 提取函数返回值类型（标准库中 ReturnType 的实现）
type MyReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : never;

// 提取 Promise 的泛型参数
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

// 实战：提取 React 组件的 Props 类型
type ComponentProps<T extends React.ComponentType<any>> =
  T extends React.ComponentType<infer P> ? P : never;

import { Button } from './button';
type ButtonProps = ComponentProps<typeof Button>;
\`\`\`

## 映射类型（Mapped Types）

\`\`\`typescript
// 将所有属性变为可选
type Partial<T> = {
  [K in keyof T]?: T[K];
};

// 将所有属性变为只读
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

// 实战：创建表单验证错误类型
type FormErrors<T> = {
  [K in keyof T]?: string;
};

interface LoginForm {
  email: string;
  password: string;
}

const errors: FormErrors<LoginForm> = {
  email: '邮箱格式不正确',
  // password 可以省略
};
\`\`\`

## 实战：构建类型安全的 API 客户端

\`\`\`typescript
type ApiEndpoints = {
  '/users': { GET: { response: User[] }; POST: { body: CreateUserDto; response: User } };
  '/posts': { GET: { response: Post[] } };
  '/posts/:id': { GET: { response: Post } };
};

async function apiRequest<
  Path extends keyof ApiEndpoints,
  Method extends keyof ApiEndpoints[Path],
>(
  path: Path,
  method: Method,
  options?: ApiEndpoints[Path][Method] extends { body: infer B } ? { body: B } : never,
): Promise<ApiEndpoints[Path][Method] extends { response: infer R } ? R : never> {
  // 实现...
}

// 完全类型安全！
const users = await apiRequest('/users', 'GET');  // User[]
const newUser = await apiRequest('/users', 'POST', {
  body: { name: 'Alice', email: 'alice@example.com' },
}); // User
\`\`\`

## 总结

掌握泛型的关键是理解它的本质：**类型层面的函数**。条件类型是 if-else，映射类型是 map，infer 是解构赋值。
`,
    coverImage:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    tags: ['TypeScript', '泛型', '类型系统'],
    readingTime: 12,
    publishedAt: new Date('2024-02-20').toISOString(),
    updatedAt: new Date('2024-02-20').toISOString(),
    ...author,
  });

  db.post.create({
    slug: 'zustand-patterns-in-production',
    title: 'Zustand 生产实践：告别 Redux 样板代码',
    excerpt:
      '从基础用法到高级模式，全面介绍 Zustand 在大型项目中的最佳实践，包括切片模式、中间件、持久化和 DevTools 集成。',
    content: `## 为什么选择 Zustand？

在 2024 年，前端状态管理的格局已经发生了巨大变化。**服务器状态**（异步数据）交给 TanStack Query，**客户端状态**则是 Zustand 的主场。

Zustand 的核心优势：
- **极简 API**：创建 store 只需几行代码
- **无需 Provider 包裹**：直接在组件中 import 使用
- **天然支持 TypeScript**：完善的类型推断
- **可组合**：通过切片模式支持大型项目

## 基础用法

\`\`\`typescript
import { create } from 'zustand';

interface BearStore {
  bears: number;
  addBear: () => void;
  reset: () => void;
}

const useBearStore = create<BearStore>((set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
  reset: () => set({ bears: 0 }),
}));

// 在组件中使用
function BearCounter() {
  const { bears, addBear } = useBearStore();
  return <button onClick={addBear}>Bears: {bears}</button>;
}
\`\`\`

## 切片模式（Slice Pattern）

当 store 变大时，用切片分离关注点：

\`\`\`typescript
import { create, StateCreator } from 'zustand';

// 用户切片
interface UserSlice {
  user: User | null;
  setUser: (user: User | null) => void;
}

const createUserSlice: StateCreator<
  UserSlice & ThemeSlice,
  [],
  [],
  UserSlice
> = (set) => ({
  user: null,
  setUser: (user) => set({ user }),
});

// 主题切片
interface ThemeSlice {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const createThemeSlice: StateCreator<
  UserSlice & ThemeSlice,
  [],
  [],
  ThemeSlice
> = (set) => ({
  theme: 'light',
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),
});

// 组合所有切片
export const useAppStore = create<UserSlice & ThemeSlice>()((...args) => ({
  ...createUserSlice(...args),
  ...createThemeSlice(...args),
}));
\`\`\`

## 持久化中间件

\`\`\`typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ThemeStore {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: ThemeStore['theme']) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'blog-theme', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // 只持久化 theme 字段
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
\`\`\`

## 选择器优化：避免不必要的重渲染

\`\`\`typescript
// ❌ 每次 store 任意变化都会重渲染
function BadComponent() {
  const store = useAppStore();
  return <div>{store.theme}</div>;
}

// ✅ 只有 theme 变化才重渲染
function GoodComponent() {
  const theme = useAppStore((state) => state.theme);
  return <div>{theme}</div>;
}

// ✅ 使用 useShallow 选择多个字段
import { useShallow } from 'zustand/react/shallow';

function MultiFieldComponent() {
  const { theme, user } = useAppStore(
    useShallow((state) => ({ theme: state.theme, user: state.user })),
  );
  return <div>{theme} - {user?.name}</div>;
}
\`\`\`

## 在本项目中的应用

这个博客项目使用 Zustand 管理两类客户端状态：

\`\`\`typescript
// 1. 主题 store（持久化到 localStorage）
export const useThemeStore = create<ThemeStore>()(
  persist(/* ... */)
);

// 2. 通知 store（全局 toast 系统）
export const useNotifications = create<NotificationsStore>((set) => ({
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { id: nanoid(), ...notification }],
  })),
  dismissNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),
}));
\`\`\`

服务器数据（文章、评论）则全部交给 TanStack Query 管理——这才是 2024 年的最佳实践。
`,
    coverImage:
      'https://images.unsplash.com/photo-1518932945647-7a1c969f8be2?w=800',
    tags: ['Zustand', '状态管理', 'React'],
    readingTime: 10,
    publishedAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
    ...author,
  });

  db.post.create({
    slug: 'react-query-v5-guide',
    title: 'TanStack Query v5 实战：掌控服务器状态的艺术',
    excerpt:
      '深入了解 TanStack Query v5 的新特性，包括简化的 API、queryOptions 工厂函数、乐观更新最佳实践，以及与 React Router 7 的整合。',
    content: `## 什么是服务器状态？

在现代前端应用中，状态分为两类：
- **客户端状态**：UI 状态、用户偏好——用 Zustand
- **服务器状态**：来自后端的数据——用 TanStack Query

服务器状态有独特的挑战：缓存、后台刷新、去重请求、分页……TanStack Query 为这些问题提供了开箱即用的解决方案。

## v5 的重大变化

### 1. queryOptions 工厂函数

v5 推荐用 \`queryOptions\` 来集中定义查询配置，实现完美的类型推断：

\`\`\`typescript
import { queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query';

// ✅ v5 推荐：在 API 层定义 queryOptions
export const postQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ['posts', slug],
    queryFn: () => getPost(slug),
    staleTime: 1000 * 60 * 5, // 5分钟不重新请求
  });

// 在组件中使用（类型完全推断）
function PostDetail({ slug }: { slug: string }) {
  const { data: post } = useQuery(postQueryOptions(slug));
  return <div>{post?.title}</div>;
}

// 在路由 loader 中预取（React Router 7）
export const postLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const post = await queryClient.ensureQueryData(
      postQueryOptions(params.slug!),
    );
    return { post };
  };
\`\`\`

### 2. 乐观更新

\`\`\`typescript
const { mutate: deleteComment } = useMutation({
  mutationFn: (commentId: string) => api.delete(\`/comments/\${commentId}\`),

  // 乐观更新：立即从 UI 移除
  onMutate: async (commentId) => {
    await queryClient.cancelQueries({ queryKey: ['comments', postId] });

    const previousComments = queryClient.getQueryData(['comments', postId]);

    queryClient.setQueryData(
      ['comments', postId],
      (old: Comment[]) => old.filter((c) => c.id !== commentId),
    );

    return { previousComments }; // 用于回滚
  },

  // 出错时回滚
  onError: (err, variables, context) => {
    queryClient.setQueryData(
      ['comments', postId],
      context?.previousComments,
    );
  },

  // 无论成功失败，都重新验证
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['comments', postId] });
  },
});
\`\`\`

## 本项目的 Query 层架构

\`\`\`typescript
// features/blog/api/get-posts.ts
export type GetPostsOptions = {
  page?: number;
  tag?: string;
};

export const getPosts = (options: GetPostsOptions = {}): Promise<PostsResponse> =>
  api.get('/api/posts', { params: options });

export const getPostsQueryOptions = (options: GetPostsOptions = {}) =>
  queryOptions({
    queryKey: ['posts', options],
    queryFn: () => getPosts(options),
  });

export const usePosts = (options: GetPostsOptions = {}) => {
  return useQuery(getPostsQueryOptions(options));
};
\`\`\`

每个 API 文件导出三个东西：
1. **API 函数**：发送请求
2. **queryOptions**：供 loader 预取
3. **useXxx Hook**：供组件订阅

这种模式保证了 queryKey 的一致性，避免缓存不命中。
`,
    coverImage:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    tags: ['TanStack Query', 'React', '数据获取'],
    readingTime: 11,
    publishedAt: new Date('2024-01-25').toISOString(),
    updatedAt: new Date('2024-01-25').toISOString(),
    ...author,
  });

  db.post.create({
    slug: 'react-router-7-complete-guide',
    title: 'React Router 7 完全指南：从路由到全栈框架',
    excerpt:
      'React Router 7 带来了革命性的变化——它现在既是路由库，也是完整的全栈框架。本文梳理核心变化，聚焦 lib 模式下的最佳实践。',
    content: `## React Router 7 的双模式

React Router 7 有两种使用方式：

1. **Framework 模式**：类似 Next.js 的全栈框架，支持 SSR、文件系统路由
2. **Library 模式**：传统的纯客户端路由（本项目采用此模式）

\`\`\`typescript
// Library 模式的入口：使用 createBrowserRouter
import { createBrowserRouter, RouterProvider } from 'react-router';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: postsLoader, // 数据预取
      },
      {
        path: 'posts/:slug',
        element: <PostDetailPage />,
        loader: postLoader,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}
\`\`\`

## Loader：路由级数据预取

Loader 是 React Router 最强大的特性——它让数据获取与路由并行，消除了瀑布式加载：

\`\`\`typescript
// 不使用 Loader（瀑布式）
// 1. 路由匹配
// 2. 组件渲染
// 3. 发起请求
// 4. 显示数据（总共等待 3 步）

// 使用 Loader（并行）
// 1. 路由匹配 → 同时开始请求
// 2. 数据就绪，组件渲染
// （只等待 1 步）

export const postLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    // 预取数据：如果 React Query 缓存有则直接返回
    const post = await queryClient.ensureQueryData(
      postQueryOptions(params.slug!),
    );

    if (!post) {
      throw new Response('Not Found', { status: 404 });
    }

    return null; // 数据在 React Query 缓存中，组件直接订阅
  };
\`\`\`

## 懒加载路由：优化包体积

\`\`\`typescript
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        // 懒加载：首屏不加载这个组件
        lazy: () => import('./routes/home').then((m) => ({ Component: m.HomePage })),
      },
      {
        path: 'posts/:slug',
        lazy: async () => {
          const [{ PostDetailPage }, { postLoader }] = await Promise.all([
            import('./routes/post/post'),
            import('./features/blog/api/get-post'),
          ]);
          return {
            Component: PostDetailPage,
            loader: postLoader(queryClient),
          };
        },
      },
    ],
  },
]);
\`\`\`

## 嵌套路由与 Outlet

\`\`\`tsx
// RootLayout：所有页面的外层容器
function RootLayout() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Outlet /> {/* 子路由在这里渲染 */}
      </main>
      <Footer />
    </div>
  );
}
\`\`\`

## 错误边界

\`\`\`typescript
{
  path: 'posts/:slug',
  element: <PostDetailPage />,
  loader: postLoader(queryClient),
  errorElement: <ErrorPage />, // 路由级错误处理
}
\`\`\`

这种数据预取 + 错误处理的模式，让 React Router 7 成为构建高性能 SPA 的最佳选择。
`,
    coverImage:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    tags: ['React Router', '路由', 'React'],
    readingTime: 9,
    publishedAt: new Date('2024-02-05').toISOString(),
    updatedAt: new Date('2024-02-05').toISOString(),
    ...author,
  });

  db.post.create({
    slug: 'bulletproof-react-architecture',
    title: '仿写 bulletproof-react：一个真实项目的架构决策',
    excerpt:
      '解析 bulletproof-react 中的每一个架构决策——为什么 feature-based 结构能扛住团队增长？为什么选择 MSW 而不是 JSON Server？',
    content: `## 为什么需要"防弹"架构？

随着项目规模增长，最常见的问题是：
- 文件到处都是，找不到东西
- 修改 A 模块，B 模块神秘报错
- 新人无法快速上手，"约定"全在老员工脑子里

bulletproof-react 的架构设计，本质上是在代码层面强制执行这些约定。

## Feature-Based 目录结构

\`\`\`
src/
├── features/          # 按业务功能划分
│   ├── blog/          # 博客功能（自包含）
│   │   ├── api/       # 数据层
│   │   └── components/ # UI 层
│   ├── comments/
│   └── theme/
├── components/        # 全局共享 UI
├── lib/               # 工具库封装
└── app/               # 路由和入口
\`\`\`

**关键原则：Feature 之间不能相互引用。**

这通过 ESLint 强制执行：

\`\`\`javascript
// .eslintrc.cjs
'import/no-restricted-paths': ['error', {
  zones: [
    {
      target: './src/features/blog',
      from: './src/features',
      except: ['./blog'],  // blog 只能从自己导入
    },
  ],
}],
\`\`\`

## 为什么选 MSW？

很多教程用 JSON Server 或者 mock 函数。MSW 的优势在于：

1. **真实的网络层**：MSW 拦截 \`fetch\`/\`axios\` 请求，测试更接近生产
2. **可在浏览器运行**：开发时无需后端，测试时无需修改代码
3. **与 @mswjs/data 配合**：内存数据库支持真实的 CRUD 操作

\`\`\`typescript
// handlers/posts.ts
export const postsHandlers = [
  http.get('/api/posts', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const tag = url.searchParams.get('tag');

    // 从内存数据库查询
    const allPosts = db.post.findMany({
      where: tag ? { tags: { arrayContains: tag } } : undefined,
      orderBy: { publishedAt: { sort: 'desc' } },
    });

    const pageSize = 6;
    const start = (page - 1) * pageSize;

    return HttpResponse.json({
      data: allPosts.slice(start, start + pageSize).map(sanitizePost),
      meta: { page, total: allPosts.length, totalPages: Math.ceil(allPosts.length / pageSize) },
    });
  }),
];
\`\`\`

## 单向依赖图

\`\`\`
app → features → lib/hooks/utils
         ↓
      components
\`\`\`

从来没有逆向依赖。这保证了：
- 可以独立测试每一层
- 变化的影响范围可预测
- 任何层都可以被替换

## API 层三件套

每个 \`features/xxx/api/\` 文件都导出三个东西：

\`\`\`typescript
// 1. API 函数（纯函数，可单独测试）
export const getPosts = (options: GetPostsOptions) =>
  api.get<PostsResponse>('/api/posts', { params: options });

// 2. queryOptions（React Query 配置，供 loader 复用）
export const getPostsQueryOptions = (options: GetPostsOptions) =>
  queryOptions({ queryKey: ['posts', options], queryFn: () => getPosts(options) });

// 3. Hook（组件层使用）
export const usePosts = (options: GetPostsOptions) =>
  useQuery(getPostsQueryOptions(options));
\`\`\`

这种模式的好处：\`queryKey\` 只在一个地方定义，不会出现缓存不命中的问题。

## 这个博客项目正是这种思想的实践

当你在看这个项目的代码时，你会发现：每一个文件都有其确定的位置，每一个 import 都有其合理的方向，每一个功能都有其边界。这不是过度设计，而是为了**让代码本身说话**。
`,
    coverImage:
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800',
    tags: ['Architecture', 'React', 'Engineering'],
    readingTime: 14,
    publishedAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date('2024-03-01').toISOString(),
    ...author,
  });

  db.post.create({
    slug: 'vite-optimization-guide',
    title: 'Vite 构建优化实战：让你的应用快人一步',
    excerpt:
      '从开发体验到生产构建，全面解析 Vite 的优化技巧，包括代码分割、Tree Shaking、动态导入、Bundle 分析。',
    content: `## Vite 为什么这么快？

Vite 的开发服务器快有两个核心原因：

1. **原生 ESM**：浏览器直接处理 \`import\`，无需打包
2. **按需编译**：只编译当前访问的文件，而不是整个项目

\`\`\`typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(), // React Fast Refresh
    viteTsconfigPaths(), // tsconfig paths 别名
  ],

  build: {
    rollupOptions: {
      output: {
        // 手动控制 chunk 分割
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
        },
        // 最小 chunk 大小（避免过多小文件）
        experimentalMinChunkSize: 3500,
      },
    },
  },
});
\`\`\`

## 动态导入：路由级代码分割

\`\`\`typescript
// router.tsx：懒加载路由组件
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        // React.lazy + Suspense 实现懒加载
        lazy: () =>
          import('./routes/home').then((m) => ({
            Component: m.HomePage,
          })),
      },
    ],
  },
]);
\`\`\`

## Bundle 分析

\`\`\`bash
# 安装 rollup-plugin-visualizer
npm install -D rollup-plugin-visualizer

# vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true, // 构建后自动打开
      filename: 'dist/stats.html',
      gzipSize: true,
    }),
  ],
});
\`\`\`

## Tree Shaking 注意事项

\`\`\`typescript
// ❌ 阻止 Tree Shaking：导入整个库
import * as Icons from 'lucide-react';
const MyIcon = Icons.Home;

// ✅ 支持 Tree Shaking：按需导入
import { Home } from 'lucide-react';

// ❌ 带副作用的文件，Vite 无法自动 Tree Shake
// utils/index.ts 如果有副作用，整个文件都会被包含

// ✅ 在 package.json 声明副作用
// "sideEffects": ["*.css", "src/polyfills.ts"]
\`\`\`

## 环境变量最佳实践

\`\`\`typescript
// src/config/env.ts：用 Zod 验证环境变量
import { z } from 'zod';

const envSchema = z.object({
  API_URL: z.string().url(),
  ENABLE_API_MOCKING: z.string().transform((v) => v === 'true'),
});

// 如果环境变量不合法，在启动时就报错，而不是运行时
export const env = envSchema.parse({
  API_URL: import.meta.env.VITE_APP_API_URL,
  ENABLE_API_MOCKING: import.meta.env.VITE_APP_ENABLE_API_MOCKING,
});
\`\`\`

## 开发体验优化

\`\`\`typescript
export default defineConfig({
  server: {
    port: 3000,
    // 代理 API 请求（避免 CORS）
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  // 预优化依赖（加速首次启动）
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query'],
    exclude: ['fsevents'],
  },
});
\`\`\`

Vite 的生态还在快速发展，但核心理念已经稳定：**开发时追求极致速度，生产时追求极致优化**。
`,
    coverImage:
      'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
    tags: ['Vite', '性能优化', 'Engineering'],
    readingTime: 8,
    publishedAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date('2024-02-10').toISOString(),
    ...author,
  });

  db.post.create({
    slug: 'react-testing-best-practices',
    title: 'React 测试最佳实践：什么值得测，什么不值得测',
    excerpt:
      '用 Vitest + Testing Library + MSW 构建可靠的测试体系，聚焦"测试用户行为而非实现细节"的核心理念，避免常见误区。',
    content: `## 测试金字塔 vs 测试奖杯

传统的"测试金字塔"提倡大量单元测试。但对于 React 应用，**测试奖杯**（Test Trophy）更合适：

\`\`\`
         /\\
        /E2E\\        少量 E2E（核心流程）
       /------\\
      /Integration\\  大量集成测试（组件 + API）
     /------------\\
    /    Unit      \\ 少量单元测试（纯函数）
   /--------------\\
  /   Static (TS)  \\  TypeScript 类型检查（免费！）
 /------------------\\
\`\`\`

## 测试什么？

**应该测试：**
- 用户可见的行为（点击、输入、导航）
- 业务逻辑的正确性
- 错误处理路径

**不应该测试：**
- 实现细节（内部状态、私有方法）
- 第三方库的功能
- 样式（用视觉回归测试代替）

## 工具链选择

\`\`\`typescript
// vitest.config.ts（或 vite.config.ts 中的 test 配置）
export default defineConfig({
  test: {
    globals: true,           // 无需 import describe/it/expect
    environment: 'jsdom',    // 模拟浏览器环境
    setupFiles: './src/testing/setup-tests.ts',
  },
});
\`\`\`

\`\`\`typescript
// src/testing/setup-tests.ts
import '@testing-library/jest-dom'; // 扩展 expect：toBeInTheDocument 等

import { server } from './mocks/server';

// 每个测试前启动 MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
\`\`\`

## 写一个真实的测试

\`\`\`typescript
// features/blog/components/__tests__/posts-list.test.tsx
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { renderApp } from '@/testing/test-utils';
import { db } from '@/testing/mocks/db';
import { createPost } from '@/testing/data-generators';

describe('PostsList', () => {
  it('显示文章列表', async () => {
    // 准备数据
    db.post.create(createPost({ title: '测试文章' }));

    // 渲染（包含所有 Provider）
    renderApp({ initialEntries: ['/'] });

    // 等待异步数据加载
    await waitFor(() => {
      expect(screen.getByText('测试文章')).toBeInTheDocument();
    });
  });

  it('支持按标签筛选', async () => {
    const user = userEvent.setup();

    db.post.create(createPost({ title: 'React 文章', tags: ['React'] }));
    db.post.create(createPost({ title: 'TS 文章', tags: ['TypeScript'] }));

    renderApp({ initialEntries: ['/'] });

    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(2);
    });

    // 点击 React 标签
    await user.click(screen.getByRole('button', { name: 'React' }));

    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(1);
      expect(screen.getByText('React 文章')).toBeInTheDocument();
    });
  });
});
\`\`\`

## MSW 的测试优势

MSW 让你的测试使用真实的 HTTP 请求，而不是 mock 函数。这意味着：

\`\`\`typescript
// 可以测试 Axios interceptor 的行为
it('API 错误时显示通知', async () => {
  // 覆盖 MSW handler，返回错误
  server.use(
    http.get('/api/posts', () => {
      return HttpResponse.json(
        { message: '服务器错误' },
        { status: 500 },
      );
    }),
  );

  renderApp({ initialEntries: ['/'] });

  await waitFor(() => {
    expect(screen.getByText('请求失败')).toBeInTheDocument();
  });
});
\`\`\`

## 写好测试的几个原则

1. **测试名称描述行为**：\`it('用户点击删除按钮后，评论从列表消失')\`
2. **优先用 \`getByRole\`**：更贴近无障碍语义
3. **避免测试 className**：样式不是行为
4. **每个测试独立**：在 \`beforeEach\` 中重置数据
5. **测试快乐路径和错误路径**：别只测成功场景
`,
    coverImage:
      'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
    tags: ['Testing', 'Vitest', 'React'],
    readingTime: 13,
    publishedAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    ...author,
  });

  // 种一些示例评论
  const allPosts = db.post.getAll();
  if (allPosts.length > 0) {
    db.comment.create({
      postId: allPosts[0].id,
      authorName: 'Alice',
      content: '写得很好！useCallback 和 useMemo 的误用确实是很常见的问题。',
      createdAt: new Date('2024-03-16').toISOString(),
    });
    db.comment.create({
      postId: allPosts[0].id,
      authorName: 'Bob',
      content: '感谢分享，自定义 Hook 那部分让我豁然开朗。',
      createdAt: new Date('2024-03-17').toISOString(),
    });
  }
}
