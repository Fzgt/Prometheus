export type Author = {
	name: string;
	avatar: string;
	bio: string;
};

export type Post = {
	id: string;
	slug: string;
	title: string;
	excerpt: string;
	content: string;
	coverImage?: string;
	tags: string[];
	readingTime: number;
	publishedAt: string;
	updatedAt: string;
	author: Author;
};

export type Comment = {
	id: string;
	postId: string;
	authorName: string;
	content: string;
	createdAt: string;
};

export type Tag = {
	name: string;
	count: number;
};

export type Meta = {
	page: number;
	total: number;
	totalPages: number;
};

export type PostsResponse = {
	data: Post[];
	meta: Meta;
};

export type CommentsResponse = {
	data: Comment[];
};

export type TagsResponse = {
	data: Tag[];
};
