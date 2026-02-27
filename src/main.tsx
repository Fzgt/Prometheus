import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app';
import './index.css';

async function enableMocking() {
	if (import.meta.env.VITE_APP_ENABLE_API_MOCKING !== 'true') return;

	const { worker } = await import('./testing/mocks/browser');
	const { initializeDb } = await import('./testing/mocks/db');
	const { seedDatabase } = await import('./testing/mocks/seed-data');

	await initializeDb();
	seedDatabase();

	return worker.start({
		onUnhandledRequest: 'bypass',
		serviceWorker: {
			url: '/mockServiceWorker.js',
		},
	});
}

enableMocking().then(() => {
	const root = document.getElementById('root');
	if (!root) throw new Error('Root element not found');

	createRoot(root).render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
});
