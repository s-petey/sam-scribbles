import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
  const { slug } = params;

  if (typeof slug !== 'string' || slug.length <= 0) {
    return { status: 404, error: `Page not found by: ${slug}` };
  }

  // TODO: Get related posts / info about this post?
  const post = await db.query.post.findFirst({
    where: (table, { eq }) => eq(table.slug, slug),
    columns: {
      slug: true,
      isPrivate: true,
    },
  });

  if (!post) {
    throw new Error(`Post not found by slug: ${slug}`);
  }

  if (post.isPrivate && locals.session?.user?.role !== 'admin') {
    return { status: 403, error: 'We are still prepping this one, sorry for hiding it away.' };
  }

  return { slug };
}) satisfies PageServerLoad;
