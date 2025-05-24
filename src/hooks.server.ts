import { redirect, type Handle } from '@sveltejs/kit';
import { isValidMode, isValidTheme, type Theme, type ThemeMode } from '$lib/components/themes';
import { auth } from '$lib/auth'; // path to your auth file
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { core } from '$lib/siteLinks';
import { setServerCookies } from '$lib/auth.server';
import { route } from '$lib/ROUTES';

const ONE_YEAR = 60 * 60 * 24 * 365;

export const handle = (async ({ event, resolve }) => {
  // Suppress well-known Chrome DevTools requests
  if (event.url.pathname.startsWith('/.well-known/appspecific/com.chrome.devtools')) {
    return new Response(null, { status: 204 }); // Return empty response with 204 No Content
  }

  let theme: Theme | null = null;
  let themeMode: ThemeMode | null = null;

  const newTheme = event.url.searchParams.get('theme');
  const cookieTheme = event.cookies.get('theme');

  const newThemeMode = event.url.searchParams.get('themeMode');
  const cookieThemeMode = event.cookies.get('themeMode');

  if (newTheme && isValidTheme(newTheme)) {
    theme = newTheme;
  } else if (isValidTheme(cookieTheme)) {
    theme = cookieTheme;
  }

  if (newThemeMode && isValidMode(newThemeMode)) {
    themeMode = newThemeMode;
  } else if (isValidMode(cookieThemeMode)) {
    themeMode = cookieThemeMode;
  }

  if (theme === null) {
    theme = 'catppuccin';
    event.cookies.set('theme', theme, { path: '/', maxAge: ONE_YEAR });
  }
  if (themeMode === null) {
    themeMode = 'light';
    event.cookies.set('themeMode', themeMode, { path: '/', maxAge: ONE_YEAR });
  }

  // TODO: Handle auth route re-routing / session stuff...
  // https://svelte.dev/docs/kit/hooks#Server-hooks-handle
  // Add this user to the `locals` value.
  // Ex: https://github.com/aakash14goplani/SvelteKitAuth/blob/main/src/hooks.server.ts

  const session = await auth.api.getSession({
    headers: event.request.headers,
    query: {
      disableRefresh: true,
    },
  });

  if (event.url.pathname.startsWith('/admin') && session?.user?.role !== 'admin') {
    if (session !== null && session.session.expiresAt.valueOf() < Date.now()) {
      console.log('Session expired, logging out...');
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

    console.log('User is not an admin, redirecting to home...');
    redirect(303, core.Home.href);
  }

  if (session) {
    event.locals.session = {
      user: session.user,
      session: session.session,
    };
  } else {
    event.locals.session = {
      user: null,
      session: null,
    };
  }

  event.locals.theme = { theme, mode: themeMode };

  if (theme !== null || themeMode !== null) {
    return svelteKitHandler({
      event,
      resolve: async () =>
        await resolve(event, {
          transformPageChunk: ({ html }) => {
            if (isValidMode(cookieThemeMode) && isValidTheme(cookieTheme)) {
              return html
                .replace('data-theme=""', `data-theme="${cookieTheme}"`)
                .replace('class="dark"', `class="${cookieThemeMode === 'dark' ? 'dark' : ''}"`);
            }

            if (isValidTheme(cookieTheme)) {
              return html.replace('data-theme=""', `data-theme="${cookieTheme}"`);
            }

            if (isValidMode(cookieThemeMode)) {
              return html.replace(
                'class="dark"',
                `class="${cookieThemeMode === 'dark' ? 'dark' : ''}"`,
              );
            }

            return html;
          },
        }),

      auth,
    });
  }

  return await svelteKitHandler({ auth, event, resolve });
}) satisfies Handle;
