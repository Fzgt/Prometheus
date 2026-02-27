export const paths = {
	home: {
		path: '/',
		getHref: () => '/',
	},
	post: {
		path: '/posts/:slug',
		getHref: (slug: string) => `/posts/${slug}`,
	},
	tag: {
		path: '/tags/:tag',
		getHref: (tag: string) => `/tags/${encodeURIComponent(tag)}`,
	},
	about: {
		path: '/about',
		getHref: () => '/about',
	},
} as const;
