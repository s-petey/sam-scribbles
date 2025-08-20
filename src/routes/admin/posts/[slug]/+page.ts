import { postMetadataSchema } from '$lib/zodSchema';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({
  data: {
    // Any other server data comes in here...
    slug,
    form,
    post: dbPost,
    relatedPostsForm,
    searchQuery,
    pagination,
    combinedPosts,
  },
}) => {
  if (!form || !dbPost) {
    error(400, 'Missing form or post');
  }

  try {
    const post = await import(`../../../../../posts/${slug}.md`);
    const metadata = postMetadataSchema.parse(post.metadata);

    return {
      Content: post.default,
      meta: { ...metadata, slug },
      form,
      post: dbPost,
      relatedPostsForm,
      searchQuery,
      pagination,
      combinedPosts,
    };
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  } catch (err) {
    error(404, {
      message: "Hold on, 🤠 that page doesn't exist!",
    });
  }
};
