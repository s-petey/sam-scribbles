import { logout } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { core } from '$lib/siteLinks';

export const actions: Actions = {
	default: async (event) => {
		logout(event);

		throw redirect(302, core.Home.href);
	}
};
