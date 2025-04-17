import { getPostBySlug } from '$lib/server/content';
// import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
  const { slug } = params;

  if (typeof slug !== 'string' || slug.length <= 0) {
    return { status: 404, error: `Page not found by: ${slug}` };
  }

  // // TODO: Get related posts / info about this post?
  // const post = await db.query.post.findFirst({
  //   where: (table, { eq }) => eq(table.slug, slug),
  // });

  const post = getPostBySlug(slug);

  return { slug, post };
}) satisfies PageServerLoad;

// TODO: Nextjs specific things, which may be do-able in sveltekit...
// export function generateMetadata({ params }: PostProps) {
//   const post = getPostBySlug(params.slug)
//   if (post == null) return {}
//   return { title: post.title, description: post.description }
// }
// export function generateStaticParams() {
//   return posts.map(({ slug }) => ({ slug }))
// }
