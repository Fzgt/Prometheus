import * as React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { RootLayout } from './root-layout';

const HomePage = React.lazy(() =>
  import('./routes/home').then((m) => ({ default: m.HomePage })),
);
const PostDetailPage = React.lazy(() =>
  import('./routes/post/post').then((m) => ({ default: m.PostDetailPage })),
);
const AboutPage = React.lazy(() =>
  import('./routes/about').then((m) => ({ default: m.AboutPage })),
);
const TagPage = React.lazy(() =>
  import('./routes/tags/tag').then((m) => ({ default: m.TagPage })),
);
const NotFoundPage = React.lazy(() =>
  import('./routes/not-found').then((m) => ({ default: m.NotFoundPage })),
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'posts/:slug',
        element: <PostDetailPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'tags/:tag',
        element: <TagPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
