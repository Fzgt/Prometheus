import { commentsHandlers } from './handlers/comments';
import { postsHandlers } from './handlers/posts';
import { tagsHandlers } from './handlers/tags';

export const handlers = [
  ...postsHandlers,
  ...commentsHandlers,
  ...tagsHandlers,
];
