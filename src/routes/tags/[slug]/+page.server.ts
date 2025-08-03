import { db } from '$lib/server/db';
import { type Link, linksToTags, type Post, postsToTags } from '$lib/server/db/schema';
import { inArray } from 'drizzle-orm';

type PostSummary = Pick<
  Post,
  'slug' | 'title' | 'preview' | 'previewHtml' | 'readingTimeSeconds' | 'createdAt'
> & {
  tags: string[];
};

type LinkSummary = Pick<Link, 'shortId' | 'link' | 'createdAt'> & {
  tags: string[];
};

// TODO: Handle pagination
export const load = async ({ params }) => {
  const { slug } = params;

  let posts: PostSummary[] = [];
  let links: LinkSummary[] = [];

  if (typeof slug === 'string' && slug.length > 0) {
    posts = (
      await db.query.post.findMany({
        where: (post, { eq }) =>
          inArray(
            post.id,
            db
              .select({ id: postsToTags.postId })
              .from(postsToTags)
              .where(eq(postsToTags.tag, slug)),
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
            columns: { tag: true },
          },
        },
        limit: 25,
      })
    ).map((post) => ({
      createdAt: post.createdAt,
      slug: post.slug,
      title: post.title,
      readingTimeSeconds: post.readingTimeSeconds,
      preview: post.preview,
      previewHtml: post.previewHtml,
      tags: post.tags.map((t) => t.tag),
    }));

    links = (
      await db.query.link.findMany({
        where: (link, { eq }) =>
          inArray(
            link.shortId,
            db
              .select({ id: linksToTags.linkId })
              .from(linksToTags)
              .where(eq(linksToTags.tag, slug)),
          ),
        with: {
          tags: {
            columns: { tag: true },
          },
        },
        limit: 25,
        orderBy: (link, { desc }) => desc(link.createdAt),
      })
    ).map((link) => ({
      shortId: link.shortId,
      link: link.link,
      createdAt: link.createdAt,
      tags: link.tags.map((t) => t.tag),
    }));
  }

  return { slug, posts, links };
};
