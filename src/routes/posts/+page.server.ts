import { db } from '$lib/server/db';

export const load = async () => {
  // TODO: Load these into some sort of cache?
  const posts = await db.query.post.findMany({
    orderBy: (post, { desc }) => desc(post.createdAt),
    where: (post, { eq }) => eq(post.isPrivate, false),
    columns: {
      createdAt: true,
      slug: true,
      title: true,
      readingTimeSeconds: true,
      // TODO: Tags (and filtering)
      preview: true,
      previewHtml: true,
    },
    limit: 25,
  });

  return { posts };
};
