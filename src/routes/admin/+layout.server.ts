import { verifyAdmin } from '$lib/auth';
import { core } from '$lib/siteLinks';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const user = await verifyAdmin(event);

	if (user === null) {
		throw redirect(302, core.Home.href);
	}

	return {
		user
	};
};
