import { verifyAdmin } from '$lib/auth';
import { db } from '$lib/server/db';
import { link, linksToTags, tag } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { eq, like } from 'drizzle-orm';
import { fail, message, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { routeQueryParams } from './queryParams';
import { logger } from '$lib/logger';

const linkSchema = z.object({
  link: z
    .string()
    .min(1, 'A link is required')
    .url()
    .trim()
    .transform((link) => {
      let newLink = link;
      if (newLink.endsWith('/')) {
        newLink = newLink.slice(0, -1);
      }

      return newLink;
    }),
  private: z.boolean().default(false),
  tags: z
    .string()
    .transform((tags) => tags.split(','))
    .optional(),
});

export const load = (async ({ url }) => {
  const searchParams = Object.fromEntries(url.searchParams.entries());
  const { q, page, limit } = routeQueryParams.parse(searchParams);
  const form = await superValidate(zod(linkSchema));

  const rawTags = await db.query.tag.findMany({ orderBy: (tag, { asc }) => asc(tag.name) });

  const tags = rawTags.map((tag) => tag.name);

  const rawLinks = await db.query.link.findMany({
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
    where:
      typeof q === 'string' && q.length > 0
        ? (link, { like }) => like(link.link, `%${q}%`)
        : undefined,
    limit,
    offset: (page - 1) * limit,
    with: { tags: { columns: { tag: true } } },
  });

  const links = rawLinks.map(({ tags, ...link }) => {
    return { ...link, tags: tags.map((tag) => tag.tag) };
  });

  let linkCount = 0;

  if (q === undefined) {
    linkCount = await db.$count(link);
  } else {
    linkCount = await db.$count(link, like(link.link, `%${q}%`));
  }
  const pages = Math.ceil(linkCount / limit);

  return { form, links, tags, pagination: { page, pages, linkCount, limit } };
}) satisfies PageServerLoad;

const shortIdSchema = z.object({ shortId: z.string().min(1) });

export const actions: Actions = {
  create: async (event) => {
    const admin = await verifyAdmin(event);

    if (admin === null) {
      error(401, 'Unauthorized');
    }

    logger.debug({ msg: 'Creating link', admin: admin.email });

    const form = await superValidate(event.request, zod(linkSchema));

    if (!form.valid) {
      return fail(400, { form });
    }
    const existingLink = await db.$count(link, eq(link.link, form.data.link));

    if (existingLink > 0) {
      return setError(form, 'link', 'Link already exists!');
    }

    await db.transaction(async (tx) => {
      if (Array.isArray(form.data.tags) && form.data.tags.length > 0) {
        await tx
          .insert(tag)
          .values(form.data.tags.map((tag) => ({ name: tag })))
          .onConflictDoNothing();
      }

      const returningLink = await tx
        .insert(link)
        .values({ link: form.data.link, private: form.data.private })
        .returning({ shortId: link.shortId });

      const newLink = returningLink.at(0);

      if (!newLink) {
        logger.error({ msg: 'Failed to create link', data: form.data });
        throw new Error('Failed to create link');
      }

      if (Array.isArray(form.data.tags) && form.data.tags.length > 0) {
        await tx
          .insert(linksToTags)
          .values(form.data.tags.map((id) => ({ linkId: newLink.shortId, tag: id })));
      }
    });

    logger.debug({ msg: 'Created link' });

    return message(form, 'Created link');
  },

  delete: async (event) => {
    const admin = await verifyAdmin(event);

    if (admin === null) {
      error(401, 'Unauthorized');
    }

    logger.debug({ msg: 'Deleting link', admin: admin.email });
    const form = await superValidate(event.request, zod(shortIdSchema));

    if (!form.valid) {
      return fail(500, { message: 'Missing shortId somehow' });
    }

    await db.delete(link).where(eq(link.shortId, form.data.shortId));

    redirect(302, '/admin/links');
  },
};
