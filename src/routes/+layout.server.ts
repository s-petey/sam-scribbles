import { isValidMode, isValidTheme } from '$lib/components/themes';
import { redirect } from '@sveltejs/kit';
import { route } from '$lib/ROUTES.js';
import { auth } from '$lib/auth';
import { setServerCookies } from '$lib/auth.server';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  if (session !== null && session.session.expiresAt.valueOf() < Date.now()) {
    // TODO: Warn the user they need to login again (have a message?)
    // Or have a way to extend the session when it is nearing expiry if
    // it is active?
    const response = await auth.api.signOut({
      returnHeaders: true,
      headers: event.request.headers,
    });
    setServerCookies(response.headers, event);

    // TODO: Add this route to the siteLinks once exposed more clearly...
    redirect(302, route('/login'));
  }

  const cookieTheme = event.cookies.get('theme') ?? 'cerberus';
  const cookieThemeMode = event.cookies.get('themeMode') ?? 'light';

  const theme = isValidTheme(cookieTheme) ? cookieTheme : 'cerberus';
  const mode = isValidMode(cookieThemeMode) ? cookieThemeMode : 'light';

  return {
    theme: { theme, mode },
    user: session?.user ?? null,
  };
};
