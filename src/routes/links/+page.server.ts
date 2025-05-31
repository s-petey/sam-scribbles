import { db } from '$lib/server/db';
import { linksToTags } from '$lib/server/db/schema';
import { and, ilike, inArray } from 'drizzle-orm';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

const routeQueryParams = z.object({
  q: z.string().optional(),
  tags: z
    .string()
    .transform((tags) => tags.split(','))
    .optional(),
});

export const load = (async ({ url }) => {
  const searchParams = Object.fromEntries(url.searchParams.entries());
  const { q, tags } = routeQueryParams.parse(searchParams);

  const links = await db.query.link.findMany({
    where: (link, { eq }) =>
      and(
        eq(link.private, false),
        typeof q === 'string' && q.length > 0
          ? ilike(link.link, `%${q.toLowerCase()}%`)
          : undefined,
        Array.isArray(tags) && tags.length > 0
          ? inArray(
              link.shortId,
              db
                .select({ id: linksToTags.linkId })
                .from(linksToTags)
                .where(inArray(linksToTags.tag, tags)),
            )
          : undefined,
      ),
    with: {
      tags: {
        columns: {
          tag: true,
        },
      },
    },
    limit: 25,
    orderBy: (link, { desc }) => desc(link.createdAt),
  });

  const rawTags = await db.query.tag.findMany({ orderBy: (tag, { asc }) => asc(tag.name) });

  const combinedTags = rawTags.map((tag) => tag.name);

  return { links, tags: combinedTags };
}) satisfies PageServerLoad;
