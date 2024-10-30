import { logout, ONE_HOUR, verifyAdmin } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

export const load = async (event) => {
	const user = verifyAdmin(event);

	if (user !== null && user.expires > Date.now() + ONE_HOUR) {
		// TODO: Warn the user they need to login again (have a message?)
		// Or have a way to extend the session when it is nearing expiry if
		// it is active?
		logout(event);
		// TODO: Add this route to the siteLinks once exposed more clearly...
		throw redirect(302, '/login');
	}

	return {
		user
	};
};
