import { verifyAdmin } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const user = verifyAdmin(event);

	if (user === null) {
		throw redirect(302, '/');
	}

	return {
		user
	};
};
