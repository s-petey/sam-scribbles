import { db } from '$lib/server/db';
import { linksToTags, postsToTags, type Link, type Post } from '$lib/server/db/schema';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { inArray } from 'drizzle-orm';
import { z } from 'zod';

const routeQueryParams = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(25),
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

export const load = async ({ url }: ServerLoadEvent) => {
  const searchParams = Object.fromEntries(url.searchParams.entries());
  const { page, limit, tags: selectedTags } = routeQueryParams.parse(searchParams);

  // Get all tags for initial render
  const rawTags = await db.query.tag.findMany({ orderBy: (tag, { asc }) => asc(tag.name) });
  const tags = rawTags.map((tag) => tag.name);

  let posts: PostSummary[] = [];
  let links: LinkSummary[] = [];
  let totalPosts = 0;
  let totalLinks = 0;

  if (Array.isArray(selectedTags) && selectedTags.length > 0) {
    const postsQuery = db.query.post.findMany({
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
      limit,
      offset: (page - 1) * limit,
    });

    const linksQuery = db.query.link.findMany({
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
      limit,
      offset: (page - 1) * limit,
      orderBy: (link, { desc }) => desc(link.createdAt),
    });

    // Count total items for pagination
    const totalPostsQuery = db.$count(
      db
        .select({ id: postsToTags.postId })
        .from(postsToTags)
        .where(inArray(postsToTags.tag, selectedTags)),
    );

    const totalLinksQuery = db.$count(
      db
        .select({ id: linksToTags.linkId })
        .from(linksToTags)
        .where(inArray(linksToTags.tag, selectedTags)),
    );

    const [rawPosts, rawLinks, postsCount, linksCount] = await Promise.all([
      postsQuery,
      linksQuery,
      totalPostsQuery,
      totalLinksQuery,
    ]);

    totalPosts = postsCount;
    totalLinks = linksCount;

    posts = rawPosts.map((post) => ({
      createdAt: post.createdAt,
      slug: post.slug,
      title: post.title,
      readingTimeSeconds: post.readingTimeSeconds,
      preview: post.preview,
      previewHtml: post.previewHtml,
      tags: post.tags.map((t) => t.tag),
    }));

    links = rawLinks.map((link) => ({
      shortId: link.shortId,
      link: link.link,
      createdAt: link.createdAt,
      tags: link.tags.map((t) => t.tag),
    }));
  }

  const totalPages = Math.ceil((totalPosts + totalLinks) / limit);

  return {
    tags,
    posts,
    links,
    pagination: {
      page,
      limit,
      totalPages,
      totalPosts,
      totalLinks,
    },
  };
};
