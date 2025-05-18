import { core } from '$lib/siteLinks';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { auth } from '$lib/auth';

export const load: LayoutServerLoad = async (event) => {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  if (session === null || (session !== null && session.user.role !== 'admin')) {
    redirect(302, core.Home.href);
  }

  return {
    user: session.user,
  };
};
