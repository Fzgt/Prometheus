import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { Notifications } from '@/components/ui/notifications';

type RenderAppOptions = {
	initialEntries?: string[];
};

export function renderApp(options: RenderAppOptions = {}) {
	const { initialEntries = ['/'] } = options;

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

	const router = createMemoryRouter(
		[{ path: '*', element: <div data-testid="app-root" /> }],
		{ initialEntries },
	);

	const Wrapper = ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			<HelmetProvider>
				<Notifications />
				{children}
			</HelmetProvider>
		</QueryClientProvider>
	);

	return {
		...render(<RouterProvider router={router} />, { wrapper: Wrapper }),
		queryClient,
		user: userEvent.setup(),
	};
}

export { render, screen, waitFor, userEvent };
