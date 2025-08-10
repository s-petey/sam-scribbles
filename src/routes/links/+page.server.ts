import { db } from '$lib/server/db';
import { link, linksToTags } from '$lib/server/db/schema';
import { and, ilike, inArray, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

const routeQueryParams = z.object({
  q: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(25),
  tags: z
    .string()
    .transform((tags) => tags.split(','))
    .optional(),
});

export const load = (async ({ url }) => {
  const searchParams = Object.fromEntries(url.searchParams.entries());
  const { q, page, limit, tags } = routeQueryParams.parse(searchParams);

  const whereCondition = and(
    eq(link.private, false),
    typeof q === 'string' && q.length > 0 ? ilike(link.link, `%${q.toLowerCase()}%`) : undefined,
    Array.isArray(tags) && tags.length > 0
      ? inArray(
          link.shortId,
          db
            .select({ id: linksToTags.linkId })
            .from(linksToTags)
            .where(inArray(linksToTags.tag, tags)),
        )
      : undefined,
  );

  const linksQuery = db.query.link.findMany({
    where: whereCondition,
    with: {
      tags: {
        columns: {
          tag: true,
        },
      },
    },
    limit,
    offset: (page - 1) * limit,
    orderBy: (link, { desc }) => desc(link.createdAt),
  });

  // Count total links for pagination
  const totalLinksQuery = db.$count(link, whereCondition);

  const [links, totalLinks] = await Promise.all([linksQuery, totalLinksQuery]);

  const rawTags = await db.query.tag.findMany({ orderBy: (tag, { asc }) => asc(tag.name) });
  const combinedTags = rawTags.map((tag) => tag.name);

  const totalPages = Math.ceil(totalLinks / limit);

  return {
    links,
    tags: combinedTags,
    pagination: {
      page,
      limit,
      totalPages,
      totalLinks,
    },
  };
}) satisfies PageServerLoad;
