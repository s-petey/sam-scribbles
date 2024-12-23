import { postMetadataSchema } from '$lib/zodSchema';
import { error } from '@sveltejs/kit';

export const load = async ({
  data: {
    // Any other server data comes in here...
    slug,
  },
}) => {
  try {
    const post = await import(`../../../../posts/${slug}.md`);
    const metadata = postMetadataSchema.parse(post.metadata);

    return { Content: post.default, meta: { ...metadata, slug } };
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  } catch (_err) {
    throw error(404, {
      message: "Hold on, 🤠 that page doesn't exist!",
    });
  }
};
