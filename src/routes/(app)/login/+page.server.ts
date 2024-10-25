import { authorizeAdmin } from '$lib/auth';
import { db } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const { request } = event;
		// TODO: Change this to superform
		const data = await request.formData();
		const email = data.get('email')?.toString() ?? '';
		const password = data.get('password')?.toString() ?? '';

		const user = await db.query.user.findFirst({
			where: (user, { eq, and }) => and(eq(user.email, email), eq(user.password, password)),
			columns: {
				email: true,
				username: true,
				role: true
			}
		});

		if (user === undefined) {
			return fail(400, { email, invalid: true });
		}

		try {
			authorizeAdmin(user, event);
		} catch {
			throw fail(401, {
				error: 'User unauthorized'
			});
		}

		throw redirect(302, '/admin');
	}
};
