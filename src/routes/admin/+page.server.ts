import { AUTH_COOKIE_NAME } from '$lib/auth';
import type { Actions } from './$types';

export const load = async () => {
	return {};
};

export const actions: Actions = {
	logout: async ({ cookies }) => {
		cookies.delete(AUTH_COOKIE_NAME, { path: '/' });
		return { success: true };
	}
};
