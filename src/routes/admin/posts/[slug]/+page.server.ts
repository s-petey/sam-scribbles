import { getAndRefreshSession } from '$lib/auth.server';
import { logger } from '$lib/logger';
import { db } from '$lib/server/db';
import { post, postsToTags, tag } from '$lib/server/db/schema';
import { postMetadataSchema } from '$lib/zodSchema';
import { error } from '@sveltejs/kit';
import { fail, message, superValidate, type Infer } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { and, inArray, eq } from 'drizzle-orm';

const schema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

export const load = (async ({ params }) => {
  const form = await superValidate<Infer<typeof schema>, string>(zod4(schema));
  const { slug } = params;

  if (typeof slug !== 'string' || slug.length <= 0) {
    return { status: 404, error: `Page not found by: ${slug}` };
  }

  // TODO: Get related posts / info about this post?
  // TODO: allow adding related?
  const post = await db.query.post.findFirst({
    where: (table, { eq }) => eq(table.slug, slug),
    with: {
      tags: {
        columns: {
          tag: true,
        },
      },
    },
  });

  return { slug, post, form };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async (event) => {
    const session = await getAndRefreshSession(event);

    const admin = session?.user;

    if (admin === null || admin.role !== 'admin') {
      error(401, 'Unauthorized');
    }

    const form = await superValidate(event.request, zod4(schema));

    logger.debug({ msg: 'Syncing post', data: form.data });

    if (!form.valid) {
      return fail(400, { form });
    }

    const postData = await import(`../../../../../posts/${form.data.slug}.md`);
    const parsedMetadata = postMetadataSchema.parse(postData.metadata);
    const postWithId = await db.query.post.findFirst({
      where: (table, { eq }) => eq(table.slug, form.data.slug),
      columns: {
        id: true,
      },
    });

    if (postWithId === undefined) {
      return fail(400, { form });
    }

    await db.transaction(async (tx) => {
      await tx
        .insert(post)
        .values({
          preview: parsedMetadata.preview,
          previewHtml: parsedMetadata.previewHtml,
          readingTimeSeconds: parsedMetadata.reading_time.time / 1000,
          readingTimeWords: parsedMetadata.reading_time.words,
          slug: form.data.slug,
          title: parsedMetadata.title,
          createdAt: parsedMetadata.date,
          updatedAt: parsedMetadata.updated ?? parsedMetadata.date,
          isPrivate: parsedMetadata.isPrivate,
        })
        .onConflictDoUpdate({
          target: post.slug,
          set: {
            preview: parsedMetadata.preview,
            previewHtml: parsedMetadata.previewHtml,
            readingTimeSeconds: parsedMetadata.reading_time.time / 1000,
            readingTimeWords: parsedMetadata.reading_time.words,
            slug: form.data.slug,
            title: parsedMetadata.title,
            updatedAt: parsedMetadata.updated ?? parsedMetadata.date,
            isPrivate: parsedMetadata.isPrivate,
          },
        });

      const existingTagRelations = await tx.query.postsToTags.findMany({
        where: (table, { eq }) => eq(table.postId, postWithId.id),
        columns: {
          tag: true,
        },
      });

      const existingTags = new Set(existingTagRelations.map((t) => t.tag));
      const metadataTags = new Set(parsedMetadata.tags);
      const allTags = existingTags.union(metadataTags);
      const tagsToAdd: { postId: string; tag: string }[] = [];
      const tagsToRemove: string[] = [];

      for (const tag of allTags) {
        if (metadataTags.has(tag) && !existingTags.has(tag)) {
          tagsToAdd.push({ postId: postWithId.id, tag });
        } else if (!metadataTags.has(tag) && existingTags.has(tag)) {
          tagsToRemove.push(tag);
        }
      }

      if (tagsToRemove.length > 0) {
        await tx
          .delete(postsToTags)
          .where(
            and(eq(postsToTags.postId, postWithId.id), inArray(postsToTags.tag, tagsToRemove)),
          );
      }

      if (tagsToAdd.length > 0) {
        await tx
          .insert(tag)
          .values(tagsToAdd.map((tag) => ({ name: tag.tag })))
          .onConflictDoNothing();
        await tx.insert(postsToTags).values(tagsToAdd).onConflictDoNothing();
      }
    });

    return message(form, 'Updated post!');
  },
};
