import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
  const { slug } = params;

  if (typeof slug !== 'string' || slug.length <= 0) {
    return { status: 404, error: `Page not found by: ${slug}` };
  }

  // TODO: Get related posts / info about this post?
  const post = await db.query.post.findFirst({
    where: (table, { eq }) => eq(table.slug, slug),
  });

  return { slug, post };
}) satisfies PageServerLoad;
