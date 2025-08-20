import { getAndRefreshSession } from '$lib/auth.server';
import { logger } from '$lib/logger';
import { db } from '$lib/server/db';
import { post, postsToTags, tag, postsToRelatedPosts } from '$lib/server/db/schema';
import { postMetadataSchema } from '$lib/zodSchema';
import { error } from '@sveltejs/kit';
import { fail, message, superValidate, type Infer } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { and, inArray, eq, ilike, or, desc, count, notInArray } from 'drizzle-orm';

const schema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

const relatedPostsSchema = z.object({
  relatedPostIds: z.array(z.string()).default([]),
});

export const load = (async ({ params, url }) => {
  const form = await superValidate(zod4(schema));
  const relatedPostsForm = await superValidate(zod4(relatedPostsSchema));
  const { slug } = params;

  if (typeof slug !== 'string' || slug.length <= 0) {
    return { status: 404, error: `Page not found by: ${slug}` };
  }

  // Get search and pagination params
  const searchQuery = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = 15;
  const offset = (page - 1) * limit;

  // Get the current post
  const currentPost = await db.query.post.findFirst({
    where: (table, { eq }) => eq(table.slug, slug),
    with: {
      tags: {
        columns: {
          tag: true,
        },
      },
    },
  });

  if (!currentPost) {
    error(404, `Post not found: ${slug}`);
  }

  // Get currently related posts
  const relatedPostsQuery = await db
    .select({
      id: post.id,
      slug: post.slug,
      title: post.title,
      readingTimeSeconds: post.readingTimeSeconds,
    })
    .from(postsToRelatedPosts)
    .innerJoin(post, eq(postsToRelatedPosts.relatedPostId, post.id))
    .where(eq(postsToRelatedPosts.postId, currentPost.id));

  // Get available posts for selection (excluding current post and already related)
  const relatedPostIds = relatedPostsQuery.map((p) => p.id);
  const excludeIds = [currentPost.id, ...relatedPostIds];

  const whereConditions = [];

  if (excludeIds.length > 0) {
    whereConditions.push(notInArray(post.id, excludeIds));
  }

  if (searchQuery) {
    whereConditions.push(
      or(ilike(post.title, `%${searchQuery}%`), ilike(post.slug, `%${searchQuery}%`)),
    );
  }

  const availablePosts = await db
    .select({
      id: post.id,
      slug: post.slug,
      title: post.title,
      readingTimeSeconds: post.readingTimeSeconds,
    })
    .from(post)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .orderBy(desc(post.createdAt))
    .limit(limit)
    .offset(offset);

  // Get total count for pagination
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(post)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

  const totalPages = Math.ceil(totalCount / limit);

  // Set current related post IDs in the form
  relatedPostsForm.data.relatedPostIds = relatedPostIds;

  const combinedPosts = new Set<(typeof availablePosts)[0]>();

  for (const post of availablePosts) {
    combinedPosts.add(post);
  }

  for (const post of relatedPostsQuery) {
    combinedPosts.add(post);
  }

  const combinedPostsArray = Array.from(combinedPosts);

  return {
    slug,
    post: currentPost,
    form,
    relatedPostsForm,
    combinedPosts: combinedPostsArray,
    pagination: {
      page,
      totalPages,
      totalCount,
      limit,
    },
    searchQuery,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  manualSync: async (event) => {
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

  updateRelatedPosts: async (event) => {
    const session = await getAndRefreshSession(event);

    if (!session?.user || session.user.role !== 'admin') {
      error(401, 'Unauthorized');
    }

    const form = await superValidate(event.request, zod4(relatedPostsSchema));
    const slug = event.params.slug;

    if (!form.valid) {
      return fail(400, { form });
    }

    // Get the current post
    const currentPost = await db.query.post.findFirst({
      where: (table, { eq }) => eq(table.slug, slug),
      columns: { id: true },
    });

    if (!currentPost) {
      error(404, 'Post not found');
    }

    await db.transaction(async (tx) => {
      // Remove all existing related post relationships for this post
      await tx
        .delete(postsToRelatedPosts)
        .where(
          or(
            eq(postsToRelatedPosts.postId, currentPost.id),
            eq(postsToRelatedPosts.relatedPostId, currentPost.id),
          ),
        );

      // Add new relationships (bidirectional)
      const relationshipsToAdd: { postId: string; relatedPostId: string }[] = [];

      for (const relatedPostId of form.data.relatedPostIds) {
        // Add both directions of the relationship
        relationshipsToAdd.push({
          postId: currentPost.id,
          relatedPostId: relatedPostId,
        });
        relationshipsToAdd.push({
          postId: relatedPostId,
          relatedPostId: currentPost.id,
        });
      }

      if (relationshipsToAdd.length > 0) {
        await tx.insert(postsToRelatedPosts).values(relationshipsToAdd);
      }
    });

    return message(form, 'Related posts updated!');
  },
};
