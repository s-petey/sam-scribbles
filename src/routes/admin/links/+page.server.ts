import { verifyAdmin } from '$lib/auth';
import { db } from '$lib/server/db';
import { link } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { fail, message, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

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
	private: z.boolean().default(false)
	// TODO: Add tags
});

export const load = (async () => {
	const form = await superValidate(zod(linkSchema));

	// TODO: Pagination...
	const links = await db.query.link.findMany({
		limit: 25
	});

	return { links, form };
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
			private: form.data.private
		});

		return message(form, 'Created link');
	}
};
