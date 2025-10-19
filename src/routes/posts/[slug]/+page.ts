import { postMetadataSchema } from '$lib/zodSchema';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({
  data: {
    // Any other server data comes in here...
    slug,
    relatedPosts,
  },
}) => {
  try {
    const postMarkdown = await import(`../../../../posts/${slug}.md`);
    const metadata = postMetadataSchema.parse(postMarkdown.metadata);

    return { Content: postMarkdown.default, meta: { ...metadata, slug }, relatedPosts };
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  } catch (_err) {
    error(404, {
      message: "Hold on, 🤠 that page doesn't exist!",
    });
  }
};
