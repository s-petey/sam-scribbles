import { getAndRefreshSession } from '$lib/auth.server';
import { db } from '$lib/server/db';
import { post, postsToTags, tag } from '$lib/server/db/schema';
import { postMetadataSchema, type PostMetadata } from '$lib/zodSchema';
import { error, type Actions } from '@sveltejs/kit';
import { and, eq, notInArray } from 'drizzle-orm';
import { Duration } from 'effect';
import { fail, message, setError, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

const schema = z.object({});

const deleteSchema = z.object({ slug: z.string().min(1, 'Slug is required') });

type Message = { updated: number; created: number };

export const load = (async () => {
  const form = await superValidate(zod4(schema));
  const deleteForm = await superValidate(zod4(deleteSchema));

  const posts = await db.query.post.findMany({
    columns: { title: true, slug: true, createdAt: true },
  });

  return { form, posts, deleteForm };
}) satisfies PageServerLoad;

export const actions: Actions = {
  syncPosts: async (event) => {
    const session = await getAndRefreshSession(event);

    const admin = session?.user;

    if (admin === null || admin.role !== 'admin') {
      error(401, 'Unauthorized');
    }
    const form = await superValidate(event.request, zod4(schema));

    // TODO: This needs to import `*.md` and `svx`?
    const postsImport = Object.entries(import.meta.glob('../../../../posts/*.md'));
    const posts: (PostMetadata & { slug: string })[] = [];
    const postsToUpdate: (PostMetadata & { slug: string })[] = [];
    const postsToCreate: (PostMetadata & { slug: string })[] = [];

    for (const [path, resolver] of postsImport) {
      // TODO: See if I can get better TS here...
      // @ts-expect-error We don't know that metadata exists in TS world!
      const { metadata } = await resolver();
      const maybeMeta = postMetadataSchema.safeParse(metadata);
      if (maybeMeta.success === false) {
        return setError(form, '', [
          `${path.split('/').pop()?.slice(0, -3) ?? ''}.md has errors`,
          JSON.stringify(maybeMeta.error.format()),
        ]);
      }
      const { data: parsedMetadata } = maybeMeta;
      const slug = path.split('/').pop()?.slice(0, -3) ?? '';

      const postData = { ...parsedMetadata, slug };

      posts.push(postData);

      // Only update / create posts from the last week
      const sevenDays = Duration.days(7);

      // TODO: This doesn't catch if the post has never been created ...
      if (parsedMetadata.updated !== undefined) {
        const dateMillis = Duration.millis(parsedMetadata.updated.getTime());
        const nowMillis = Duration.millis(Date.now());
        const difference = Duration.subtract(nowMillis, dateMillis);

        if (Duration.lessThanOrEqualTo(difference, sevenDays)) {
          postsToUpdate.push(postData);
        }
      }

      const createdDateMillis = Duration.millis(parsedMetadata.date.getTime());
      const nowMillis = Duration.millis(Date.now());
      const createdDifference = Duration.subtract(nowMillis, createdDateMillis);

      if (Duration.lessThanOrEqualTo(createdDifference, sevenDays)) {
        postsToCreate.push(postData);
      }
    }

    const slugToTagMap = new Map<string, string[]>();
    for (const postData of posts) {
      slugToTagMap.set(postData.slug, postData.tags || []);
    }

    // TODO: Delete any records in the DB where the post no longer exists!
    // However how do I handle if the record has updated or deleted and
    // there are related records, user, tags, ect.?

    await db.transaction(async (tx) => {
      const updatePromises = postsToUpdate.map((postData) => {
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

      const insertCreatePromises = postsToCreate.map((postData) => {
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
          .onConflictDoNothing()
          .returning();
      });

      const allPromises = insertCreatePromises.concat(updatePromises);
      const allResults = (await Promise.all(allPromises)).flat();

      const uniqueTags = new Set(slugToTagMap.values().flatMap((tags) => tags));

      if (uniqueTags.size > 0) {
        await tx
          .insert(tag)
          .values(Array.from(uniqueTags).map((name) => ({ name })))
          .onConflictDoNothing();
      }

      for (const postData of allResults) {
        const tags = slugToTagMap.get(postData.slug) || [];

        if (tags.length > 0) {
          // Remove tags not in the new list
          await tx
            .delete(postsToTags)
            .where(and(eq(postsToTags.postId, postData.id), notInArray(postsToTags.tag, tags)));
          // Add new tags
          await tx
            .insert(postsToTags)
            .values(tags.map((tagName) => ({ postId: postData.id, tag: tagName })))
            .onConflictDoNothing();
        } else {
          // If no tags, remove all for this post
          await tx.delete(postsToTags).where(eq(postsToTags.postId, postData.id));
        }
      }

      return allResults.flat();
    });

    const returnMessage: Message = { updated: postsToUpdate.length, created: postsToCreate.length };

    return message(form, returnMessage);
  },

  delete: async (event) => {
    const session = await getAndRefreshSession(event);

    const admin = session?.user;

    if (admin === null || admin.role !== 'admin') {
      error(401, 'Unauthorized');
    }

    const form = await superValidate(event.request, zod4(deleteSchema));

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
