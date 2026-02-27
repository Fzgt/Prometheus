import { HttpResponse, http } from 'msw';
import { nanoid } from 'nanoid';

import { db, persistDb } from '../db';

export const commentsHandlers = [
  http.get('/api/comments', ({ request }) => {
    const url = new URL(request.url);
    const postId = url.searchParams.get('postId');

    const comments = postId
      ? db.comment
          .getAll()
          .filter((c) => c.postId === postId)
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          )
      : [];

    return HttpResponse.json({ data: comments });
  }),

  http.post('/api/comments', async ({ request }) => {
    const body = (await request.json()) as {
      postId: string;
      authorName: string;
      content: string;
    };

    if (!body.postId || !body.authorName || !body.content) {
      return HttpResponse.json({ message: '缺少必要字段' }, { status: 400 });
    }

    const comment = db.comment.create({
      id: nanoid(),
      postId: body.postId,
      authorName: body.authorName.trim(),
      content: body.content.trim(),
      createdAt: new Date().toISOString(),
    });

    await persistDb('comment');

    return HttpResponse.json(comment, { status: 201 });
  }),

  http.delete('/api/comments/:id', ({ params }) => {
    const comment = db.comment.findFirst({
      where: { id: { equals: params.id as string } },
    });

    if (!comment) {
      return HttpResponse.json({ message: '评论不存在' }, { status: 404 });
    }

    db.comment.delete({ where: { id: { equals: params.id as string } } });

    return HttpResponse.json({ success: true });
  }),
];
