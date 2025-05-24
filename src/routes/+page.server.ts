import { isValidMode, isValidTheme } from '$lib/components/themes';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

const ONE_YEAR = 60 * 60 * 24 * 365;

export const actions: Actions = {
  setTheme: async ({ url, cookies }) => {
    const theme = url.searchParams.get('theme');
    const themeMode = url.searchParams.get('themeMode');
    const redirectTo = url.searchParams.get('redirectTo');

    if (isValidTheme(theme)) {
      cookies.set('theme', theme, {
        path: '/',
        maxAge: ONE_YEAR,
      });
    }

    if (isValidMode(themeMode)) {
      cookies.set('themeMode', themeMode, {
        path: '/',
        maxAge: ONE_YEAR,
      });
    }

    throw redirect(303, redirectTo ?? '/');
  },
};
