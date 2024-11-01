import { ALLOWED_EMAILS } from '$env/static/private';
import { authorizeAdmin, saltAndHashPassword, verifyPassword } from '$lib/auth';
import { db } from '$lib/server/db';
import { user as dbUser } from '$lib/server/db/schema';
import { admin } from '$lib/siteLinks';
import { redirect } from '@sveltejs/kit';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { object, string } from 'zod';
import type { Actions } from './$types';

const signInSchema = object({
	email: string({ required_error: 'Email is required' })
		.min(1, 'Email is required')
		.email('Invalid email')
		.refine(
			(email) => {
				return ALLOWED_EMAILS.split(',').includes(email);
			},
			{
				message: 'We only accept certain emails and this is not one of them'
			}
		),
	password: string({ required_error: 'Password is required' })
		.min(1, 'Password is required')
		.min(8, 'Password must be more than 8 characters')
		.max(32, 'Password must be less than 32 characters')
});

export const load = async () => {
	const form = await superValidate(zod(signInSchema));

	return {
		form
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(signInSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		let user = await db.query.user.findFirst({
			where: (user, { eq }) => eq(user.email, form.data.email),
			columns: {
				email: true,
				username: true,
				role: true,
				password: true
			}
		});

		if (user === undefined) {
			const [insertedUser] = await db
				.insert(dbUser)
				.values({
					email: form.data.email,
					username: form.data.email,
					role: 'admin',
					password: await saltAndHashPassword(form.data.password),
					createdAt: new Date()
				})
				.returning();

			if (!insertedUser) {
				return setError(form, 'User creation error!!');
			}

			user = {
				email: insertedUser.email,
				username: insertedUser.username,
				role: insertedUser.role,
				password: insertedUser.password
			};
		}

		const isMatch = await verifyPassword(form.data.password, user.password);

		if (!isMatch) {
			// TODO: Should I return password as is?
			return setError(form, 'password', 'Invalid password');
		}

		try {
			await authorizeAdmin(user, event);
		} catch {
			return setError(form, '', 'User unauthorized');
		}

		throw redirect(302, admin['Admin Panel'].href);
	}
};
