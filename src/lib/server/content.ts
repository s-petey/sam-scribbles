import { posts, type Post, type Collections } from '$velite';

if (!Array.isArray(posts)) {
  throw new Error('The content seems to be missing. Please run `bun run posts` first.');
}

function getPostBySlug(slug: Post['slug']) {
  const possiblePost = posts.find((post) => post.slug === slug);

  if (!possiblePost) {
    throw new Error(`Could not find post by slug: ${slug}`);
  }

  return possiblePost;
}

export { posts, getPostBySlug, type Post, type Collections };
