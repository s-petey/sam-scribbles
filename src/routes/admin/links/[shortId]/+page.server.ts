import { logger } from '$lib/logger';
import { route } from '$lib/ROUTES.js';
import { db } from '$lib/server/db/index.js';
import { link, linksToTags, tag } from '$lib/server/db/schema.js';
import { error, redirect, type Actions } from '@sveltejs/kit';
import { and, eq, inArray } from 'drizzle-orm';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { getAndRefreshSession } from '$lib/auth.server';
import type { PageServerLoad } from './$types';

const shortIdSchema = z.string().min(1);
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
  tags: z.string().array(),
});

export const load: PageServerLoad = async ({ params: { shortId } }) => {
  const foundLink = await db.query.link.findFirst({
    where: eq(link.shortId, shortId),
    with: { tags: { columns: { tag: true } } },
  });

  if (!foundLink) {
    error(404, 'Link not found');
  }

  const { tags: linkTags, ...remaining } = foundLink;
  const constructedLink = { ...remaining, tags: linkTags.map((tag) => tag.tag) };

  const rawTags = await db.query.tag.findMany({ orderBy: (tag, { asc }) => asc(tag.name) });

  const tags = rawTags.map((tag) => tag.name);
  const form = await superValidate(constructedLink, zod(linkSchema));

  return { form, link: constructedLink, tags };
};

export const actions: Actions = {
  update: async (event) => {
    const session = await getAndRefreshSession(event);
    const admin = session?.user;

    if (admin === null || admin.role !== 'admin') {
      error(401, 'Unauthorized');
    }
    logger.debug({ msg: 'Updating link', admin: admin.email });

    const form = await superValidate(event.request, zod(linkSchema));

    const validatedShortId = shortIdSchema.safeParse(event.params.shortId);

    if (!validatedShortId.success) {
      return fail(500, { message: 'Missing shortId somehow' });
    }

    if (!form.valid) {
      return fail(400, { form });
    }

    await db.transaction(async (tx) => {
      if (Array.isArray(form.data.tags) && form.data.tags.length > 0) {
        await tx
          .insert(tag)
          .values(form.data.tags.map((tag) => ({ name: tag })))
          .onConflictDoNothing();
      }

      const returningLink = await tx
        .update(link)
        .set({ link: form.data.link, private: form.data.private })
        .where(eq(link.shortId, validatedShortId.data))
        .returning({ shortId: link.shortId });

      const newLink = returningLink.at(0);

      if (!newLink) {
        logger.error({ msg: 'Failed to update link', data: form.data });
        throw new Error('Failed to update link');
      }

      if (Array.isArray(form.data.tags)) {
        if (form.data.tags.length === 0) {
          await tx.delete(linksToTags).where(eq(linksToTags.linkId, newLink.shortId));
        } else {
          const existingTagRelations = await tx.query.linksToTags.findMany({
            where: eq(linksToTags.linkId, newLink.shortId),
            columns: { tag: true },
          });

          const existingTags = new Set(existingTagRelations.map((relation) => relation.tag));
          const formTags = new Set(form.data.tags);
          const allTags = formTags.union(existingTags);
          const tagsToAdd: { linkId: string; tag: string }[] = [];
          const tagsToRemove: string[] = [];

          for (const tag of allTags) {
            if (formTags.has(tag) && !existingTags.has(tag)) {
              tagsToAdd.push({ linkId: newLink.shortId, tag });
            } else if (!formTags.has(tag) && existingTags.has(tag)) {
              tagsToRemove.push(tag);
            }
          }

          if (tagsToRemove.length > 0) {
            await tx
              .delete(linksToTags)
              .where(
                and(
                  eq(linksToTags.linkId, newLink.shortId),
                  inArray(linksToTags.tag, tagsToRemove),
                ),
              );
          }

          if (tagsToAdd.length > 0) {
            await tx.insert(linksToTags).values(tagsToAdd).onConflictDoNothing();
          }
        }
      }
    });

    logger.debug({ msg: 'Updated link' });

    return message(form, 'Updated link');
  },

  delete: async (event) => {
    const session = await getAndRefreshSession(event);

    const admin = session?.user;

    if (admin === null || admin.role !== 'admin') {
      error(401, 'Unauthorized');
    }

    logger.debug({ msg: 'Deleting link', admin: admin.email });

    const validatedShortId = shortIdSchema.safeParse(event.params.shortId);

    if (!validatedShortId.success) {
      return fail(500, { message: 'Missing shortId somehow' });
    }

    await db.delete(link).where(eq(link.shortId, validatedShortId.data));

    redirect(302, route('/admin/links'));
  },
};
