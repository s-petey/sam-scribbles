import { db } from '$lib/server/db';
import { type Link, linksToTags, type Post, postsToTags } from '$lib/server/db/schema';
import { inArray, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { ServerLoadEvent } from '@sveltejs/kit';

const routeQueryParams = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(25),
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

export const load = async ({ params, url }: ServerLoadEvent) => {
  const { slug } = params;

  if (typeof slug !== 'string' || slug.length === 0) {
    throw new Error('Invalid slug parameter');
  }

  const searchParams = Object.fromEntries(url.searchParams.entries());
  const { page, limit } = routeQueryParams.parse(searchParams);

  let posts: PostSummary[] = [];
  let links: LinkSummary[] = [];
  let totalPosts = 0;
  let totalLinks = 0;

  if (typeof slug === 'string' && slug.length > 0) {
    const postsQuery = db.query.post.findMany({
      where: (post, { eq }) =>
        inArray(
          post.id,
          db.select({ id: postsToTags.postId }).from(postsToTags).where(eq(postsToTags.tag, slug)),
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
      where: (link, { eq }) =>
        inArray(
          link.shortId,
          db.select({ id: linksToTags.linkId }).from(linksToTags).where(eq(linksToTags.tag, slug)),
        ),
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
      db.select({ id: postsToTags.postId }).from(postsToTags).where(eq(postsToTags.tag, slug)),
    );

    const totalLinksQuery = db.$count(
      db.select({ id: linksToTags.linkId }).from(linksToTags).where(eq(linksToTags.tag, slug)),
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
    slug,
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
