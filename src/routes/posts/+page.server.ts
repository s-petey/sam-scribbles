import { db } from '$lib/server/db';
import { postsToTags } from '$lib/server/db/schema.js';
import { and, ilike, inArray, or } from 'drizzle-orm';
import { z } from 'zod';

const routeQueryParams = z.object({
  q: z.string().optional(),
  tags: z
    .string()
    .transform((tags) => tags.split(','))
    .optional(),
});

export const load = async ({ url }) => {
  const searchParams = Object.fromEntries(url.searchParams.entries());
  const { q, tags } = routeQueryParams.parse(searchParams);

  // TODO: Load these into some sort of cache?
  // could just be an in memory thing?

  const posts = await db.query.post.findMany({
    orderBy: (post, { desc }) => desc(post.createdAt),
    where: (post, { eq }) =>
      and(
        eq(post.isPrivate, false),
        typeof q === 'string' && q.length > 0
          ? or(
              ilike(post.title, `%${q.toLowerCase()}%`),
              ilike(post.preview, `%${q.toLowerCase()}%`),
            )
          : undefined,
        Array.isArray(tags) && tags.length > 0
          ? inArray(
              post.id,
              db
                .select({ id: postsToTags.postId })
                .from(postsToTags)
                .where(inArray(postsToTags.tag, tags)),
            )
          : undefined,
      ),
    columns: {
      createdAt: true,
      slug: true,
      title: true,
      readingTimeSeconds: true,
      preview: true,
      previewHtml: true,
    },
    with: {
      tags: {
        columns: {
          tag: true,
        },
      },
    },
    limit: 25,
  });

  const rawTags = await db.query.tag.findMany({ orderBy: (tag, { asc }) => asc(tag.name) });

  const combinedTags = rawTags.map((tag) => tag.name);

  return { posts, tags: combinedTags };
};
