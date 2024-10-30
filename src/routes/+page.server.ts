import { AUTH_COOKIE_NAME } from '$lib/auth';
import { core } from '$lib/siteLinks';
import type { Actions } from './$types';

export const actions: Actions = {
	logout: async ({ cookies }) => {
		cookies.delete(AUTH_COOKIE_NAME, { path: core.Home.href });
		return { success: true };
	}
};
