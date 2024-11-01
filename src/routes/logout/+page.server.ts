import { logout } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { core } from '$lib/siteLinks';

export const actions: Actions = {
	default: async (event) => {
		logout(event);

		const referer = event.request.headers.get('referer');

		if (typeof referer === 'string' && referer.length > 0 && !referer.includes('admin')) {
			throw redirect(302, referer);
		}

		throw redirect(302, core.Home.href);
	}
};
