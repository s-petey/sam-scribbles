import { verifyAdmin } from '$lib/auth';
import { db } from '$lib/server/db';
import { link } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq, like } from 'drizzle-orm';
import { fail, message, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { routeQueryParams } from './queryParams';

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
  // TODO: Add tags
});

export const load = (async ({ url }) => {
  const searchParams = Object.fromEntries(url.searchParams.entries());
  const { q, page, limit } = routeQueryParams.parse(searchParams);
  const form = await superValidate(zod(linkSchema));

  const links = await db.query.link.findMany({
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
    where:
      typeof q === 'string' && q.length > 0
        ? (link, { like }) => like(link.link, `%${q}%`)
        : undefined,
    limit,
    offset: (page - 1) * limit,
  });

  let linkCount = 0;

  if (q === undefined) {
    linkCount = await db.$count(link);
  } else {
    linkCount = await db.$count(link, like(link.link, `%${q}%`));
  }
  const pages = Math.ceil(linkCount / limit);

  return {
    links,
    form,
    pagination: {
      page,
      pages,
      linkCount,
      limit,
    },
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  create: async (event) => {
    const admin = await verifyAdmin(event);

    if (admin === null) {
      throw error(401, 'Unauthorized');
    }

    const form = await superValidate(event.request, zod(linkSchema));

    if (!form.valid) {
      return fail(400, { form });
    }
    const existingLink = await db.$count(link, eq(link.link, form.data.link));

    if (existingLink > 0) {
      return setError(form, 'link', 'Link already exists!');
    }

    await db.insert(link).values({
      link: form.data.link,
      private: form.data.private,
    });

    return message(form, 'Created link');
  },
};
