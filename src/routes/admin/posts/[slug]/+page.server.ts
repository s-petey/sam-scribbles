import { db } from '$lib/server/db';
import { post } from '$lib/server/db/schema';
import { postMetadataSchema } from '$lib/zodSchema';
import { error } from '@sveltejs/kit';
import { fail, message, superValidate, type Infer } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/auth';

const schema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

export const load = (async ({ params }) => {
  const form = await superValidate<Infer<typeof schema>, string>(zod(schema));
  const { slug } = params;

  if (typeof slug !== 'string' || slug.length <= 0) {
    return { status: 404, error: `Page not found by: ${slug}` };
  }

  // TODO: Get related posts / info about this post?
  // TODO: allow adding related?
  const post = await db.query.post.findFirst({
    where: (table, { eq }) => eq(table.slug, slug),
  });

  return { slug, post, form };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async (event) => {
    const session = await auth.api.getSession({
      headers: event.request.headers,
    });

    const admin = session?.user;

    if (admin === undefined || admin.role !== 'admin') {
      error(401, 'Unauthorized');
    }

    if (admin === null) {
      error(401, 'Unauthorized');
    }
    const form = await superValidate(event.request, zod(schema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const postData = await import(`../../../../../posts/${form.data.slug}.md`);
    const parsedMetadata = postMetadataSchema.parse(postData.metadata);

    await db
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

    return message(form, 'Updated post!');
  },
};
