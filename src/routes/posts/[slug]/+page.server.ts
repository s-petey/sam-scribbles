import { db } from '$lib/server/db';
import { post, postsToRelatedPosts } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
  const { slug } = params;

  if (typeof slug !== 'string' || slug.length <= 0) {
    return { status: 404, error: `Page not found by: ${slug}` };
  }

  const currentPost = await db.query.post.findFirst({
    where: (table, { eq }) => eq(table.slug, slug),
    columns: {
      id: true,
      slug: true,
      isPrivate: true,
    },
  });

  if (!currentPost) {
    throw new Error(`Post not found by slug: ${slug}`);
  }

  if (currentPost.isPrivate && locals.session?.user?.role !== 'admin') {
    return { status: 403, error: 'We are still prepping this one, sorry for hiding it away.' };
  }

  // Get related posts
  const relatedPosts = await db
    .select({
      id: post.id,
      slug: post.slug,
      title: post.title,
      preview: post.preview,
      readingTimeSeconds: post.readingTimeSeconds,
      readingTimeWords: post.readingTimeWords,
    })
    .from(postsToRelatedPosts)
    .innerJoin(post, eq(postsToRelatedPosts.relatedPostId, post.id))
    .where(eq(postsToRelatedPosts.postId, currentPost.id))
    .orderBy(desc(post.createdAt))
    .limit(5);

  return { slug, relatedPosts };
}) satisfies PageServerLoad;
