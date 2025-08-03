import { db } from '$lib/server/db';
import { postsToTags, linksToTags, type Link, type Post } from '$lib/server/db/schema';
import { inArray } from 'drizzle-orm';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { z } from 'zod';

const routeQueryParams = z.object({
  tags: z
    .string()
    .transform((tags) => tags.split(','))
    .optional(),
});

type PostSummary = Pick<
  Post,
  'slug' | 'title' | 'preview' | 'previewHtml' | 'readingTimeSeconds' | 'createdAt'
> & {
  tags: string[];
};

type LinkSummary = Pick<Link, 'shortId' | 'link' | 'createdAt'> & {
  tags: string[];
};

// TODO: Handle pagination for posts and links
export const load = async ({ url }: ServerLoadEvent) => {
  const searchParams = Object.fromEntries(url.searchParams.entries());
  const { tags: selectedTags } = routeQueryParams.parse(searchParams);

  // Get all tags for initial render
  const rawTags = await db.query.tag.findMany({ orderBy: (tag, { asc }) => asc(tag.name) });
  const tags = rawTags.map((tag) => tag.name);

  let posts: PostSummary[] = [];
  let links: LinkSummary[] = [];

  if (Array.isArray(selectedTags) && selectedTags.length > 0) {
    posts = (
      await db.query.post.findMany({
        where: (post) =>
          inArray(
            post.id,
            db
              .select({ id: postsToTags.postId })
              .from(postsToTags)
              .where(inArray(postsToTags.tag, selectedTags)),
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
        where: (link) =>
          inArray(
            link.shortId,
            db
              .select({ id: linksToTags.linkId })
              .from(linksToTags)
              .where(inArray(linksToTags.tag, selectedTags)),
          ),

        columns: {
          shortId: true,
          link: true,
          createdAt: true,
        },
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

  return {
    tags,
    posts,
    links,
  };
};
