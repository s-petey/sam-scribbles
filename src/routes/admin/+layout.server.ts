import { logout, ONE_HOUR, verifyAdmin } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const user = verifyAdmin(event);

	if (user === null) {
		throw redirect(302, '/');
	}

	if (user.expires > Date.now() + ONE_HOUR) {
		// TODO: Warn the user they need to login again (have a message?)
		// Or have a way to extend the session when it is nearing expiry if
		// it is active?
		logout(event);
		throw redirect(302, '/login');
	}

	return {
		user
	};
};
