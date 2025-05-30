import { db } from '$lib/server/db';
import { post } from '$lib/server/db/schema';
import { postMetadataSchema } from '$lib/zodSchema';
import { error, type Actions } from '@sveltejs/kit';
import { DateTime } from 'luxon';
import { fail, message, setError, superValidate, type Infer } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { PageServerLoad } from './$types';
import { getAndRefreshSession } from '$lib/auth.server';
import { eq } from 'drizzle-orm';

const schema = z.object({});

const deleteSchema = z.object({ slug: z.string().min(1, 'Slug is required') });

type Message = { updated: number; created: number };

export const load = (async () => {
  const form = await superValidate<Infer<typeof schema>, Message>(zod(schema));
  const deleteForm = await superValidate(zod(deleteSchema));

  const posts = await db.query.post.findMany({ columns: { title: true, slug: true } }).execute();

  return { form, posts, deleteForm };
}) satisfies PageServerLoad;

export const actions: Actions = {
  syncPosts: async (event) => {
    const session = await getAndRefreshSession(event);

    const admin = session?.user;

    if (admin === null || admin.role !== 'admin') {
      error(401, 'Unauthorized');
    }
    const form = await superValidate(event.request, zod(schema));

    // TODO: This needs to import `*.md` and `svx`?
    const postsImport = Object.entries(import.meta.glob('../../../../posts/*.md'));
    const posts = await Promise.all(
      postsImport.map(async ([path, resolver]) => {
        // TODO: See if I can get better TS here...
        // @ts-expect-error We don't know that metadata exists in TS world!
        const { metadata } = await resolver();
        const parsedMetadata = postMetadataSchema.parse(metadata);
        const slug = path.split('/').pop()?.slice(0, -3) ?? '';

        return { ...parsedMetadata, slug };
      }),
    );

    // TODO: This doesn't catch if the post has never been created ...
    // Only update posts from the last week
    const postsToUpdate = posts.filter(
      (post) =>
        post.updated !== undefined &&
        DateTime.fromJSDate(post.updated).diffNow('weeks').weeks >= -1,
    );

    // TODO: Delete any records in the DB where the post no longer exists!
    // However how do I handle if the record has updated or deleted and
    // there are related records, user, tags, ect.?

    const updatedPosts = await db.transaction(async (tx) => {
      const insertPromises = postsToUpdate.map((postData) => {
        return tx
          .insert(post)
          .values({
            preview: postData.preview,
            previewHtml: postData.previewHtml,
            readingTimeSeconds: postData.reading_time.time / 1000,
            readingTimeWords: postData.reading_time.words,
            slug: postData.slug,
            title: postData.title,
            createdAt: postData.date,
            updatedAt: postData.updated ?? postData.date,
            isPrivate: postData.isPrivate,
          })
          .onConflictDoUpdate({
            target: post.slug,
            set: {
              preview: postData.preview,
              previewHtml: postData.previewHtml,
              readingTimeSeconds: postData.reading_time.time / 1000,
              readingTimeWords: postData.reading_time.words,
              slug: postData.slug,
              title: postData.title,
              updatedAt: postData.updated ?? postData.date,
              isPrivate: postData.isPrivate,
            },
          })
          .returning();
      });

      return (await Promise.all(insertPromises)).flat();
    });

    const returnMessage: Message = { updated: 0, created: postsToUpdate.length };

    const startOfToday = DateTime.now().startOf('day');
    for (const { updatedAt } of updatedPosts) {
      const updatedToday = DateTime.fromJSDate(updatedAt).startOf('day') >= startOfToday;
      if (updatedToday) {
        returnMessage.updated++;
        returnMessage.created--;
        continue;
      }
    }

    return message(form, returnMessage);
  },

  delete: async (event) => {
    const session = await getAndRefreshSession(event);

    const admin = session?.user;

    if (admin === null || admin.role !== 'admin') {
      error(401, 'Unauthorized');
    }

    const form = await superValidate(event.request, zod(deleteSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // Verify there is no file
    try {
      await import(`../../../../posts/${form.data.slug}.md`);
      return setError(form, 'slug', form.data.slug);
      // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    } catch (_err) {
      // Do nothing...
    }

    await db.delete(post).where(eq(post.slug, form.data.slug));

    return message(form, 'Removed record');
  },
};
