import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { core } from '$lib/siteLinks';
import { auth } from '$lib/auth';
import { setServerCookies } from '$lib/auth.server';

export const actions: Actions = {
  default: async (event) => {
    const response = await auth.api.signOut({
      returnHeaders: true,
      headers: event.request.headers,
    });

    setServerCookies(response.headers, event);

    const referer = event.request.headers.get('referer');

    if (typeof referer === 'string' && referer.length > 0 && !referer.includes('admin')) {
      redirect(302, referer);
    }

    redirect(302, core.Home.href);
  },
};
