import { building } from '$app/environment';
import { auth } from '$lib/auth';
import { setServerCookies } from '$lib/auth.server';
import { isValidMode, isValidTheme, type Theme, type ThemeMode } from '$lib/components/themes';
import { logger } from '$lib/logger';
import { route } from '$lib/ROUTES';
import { rejectedFileExtensions, rejectedFilePaths } from '$lib/server/rejectedRequests';
import { adminLinks, core } from '$lib/siteLinks';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const ONE_YEAR = 60 * 60 * 24 * 365;

const DEFAULT_THEME: Theme = 'fennec';
const DEFAULT_MODE: ThemeMode = 'dark';

const handleAnnoyances: Handle = async ({ event, resolve }) => {
  // Suppress well-known Chrome DevTools requests
  if (event.url.pathname.startsWith('/.well-known/appspecific/com.chrome.devtools')) {
    return new Response(null, { status: 204 }); // Return empty response with 204 No Content
  }

  // Skip during prerendering/building
  if (building) {
    return await resolve(event);
  }

  const pathname = event.url.pathname.toLowerCase();

  // Get the real client IP address from headers
  const clientIp =
    event.request.headers.get('x-forwarded-for')?.split(',').at(0) ||
    event.request.headers.get('x-real-ip') ||
    event.getClientAddress();

  if (rejectedFileExtensions.some((ext) => pathname.endsWith(ext))) {
    logger.debug({
      msg: 'Redirecting away suspicious file extension',
      clientIp,
      pathname,
    });
    throw redirect(302, 'https://www.google.com');
  }

  if (rejectedFilePaths.some((path) => pathname === path || pathname.startsWith(path + '/'))) {
    logger.debug({ msg: 'Redirecting away suspicious path', clientIp, pathname });
    throw redirect(302, 'https://www.google.com');
  }

  return await resolve(event);
};

const handleAuth: Handle = async ({ event, resolve }) => {
  return await svelteKitHandler({ auth, event, resolve });
};

export const handleLocals: Handle = async ({ event, resolve }) => {
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

  if (newTheme !== null && cookieTheme !== newTheme && isValidTheme(newTheme)) {
    event.cookies.set('theme', newTheme, {
      path: '/',
      maxAge: ONE_YEAR,
    });
  }

  if (newThemeMode !== null && cookieThemeMode !== newThemeMode && isValidMode(newThemeMode)) {
    event.cookies.set('themeMode', newThemeMode, {
      path: '/',
      maxAge: ONE_YEAR,
    });
  }

  const session = await auth.api.getSession({
    headers: event.request.headers,
    query: {
      disableRefresh: true,
    },
  });

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

  event.locals.theme = { theme: theme ?? DEFAULT_THEME, mode: themeMode ?? DEFAULT_MODE };

  if (theme !== null || themeMode !== null) {
    return await resolve(event, {
      transformPageChunk: ({ html }) => {
        if (isValidMode(cookieThemeMode) && isValidTheme(cookieTheme)) {
          return html
            .replace('data-theme="fennec"', `data-theme="${cookieTheme}"`)
            .replace('class="dark"', `class="${cookieThemeMode === 'dark' ? 'dark' : ''}"`);
        }

        if (isValidTheme(cookieTheme)) {
          return html.replace('data-theme="fennec"', `data-theme="${cookieTheme}"`);
        }

        if (isValidMode(cookieThemeMode)) {
          return html.replace(
            'class="dark"',
            `class="${cookieThemeMode === 'dark' ? 'dark' : ''}"`,
          );
        }

        return html;
      },
    });
  }

  return await resolve(event);
};

const handleRouting: Handle = async ({ event, resolve }) => {
  const { session } = event.locals;

  logger.debug({ msg: `Handling routing for: ${event.url.pathname}`, session });

  const pathname = event.url.pathname.toLowerCase();

  // Here we need to check if the user has access
  // to the given route(s).
  if (adminLinks.some((link) => pathname.endsWith(link.href)) && session?.user?.role !== 'admin') {
    if (session?.session !== null && session.session.expiresAt.valueOf() < Date.now()) {
      logger.info('Session expired, logging out...');
      // TODO: Warn the user they need to login again (have a message?)
      // Or have a way to extend the session when it is nearing expiry if
      // it is active?
      const response = await auth.api.signOut({
        returnHeaders: true,
        headers: event.request.headers,
      });
      setServerCookies(response.headers, event);

      // TODO: Add this route to the `siteLinks.ts`
      // once exposed more clearly...
      redirect(302, route('/login'));
    }

    logger.info('User is not an admin, redirecting to home...');
    redirect(303, core.Home.href);
  }

  return await resolve(event);
};

export const handle: Handle = sequence(
  handleAnnoyances,
  // Ensure auth comes before locals so endpoints are set up.
  handleAuth,
  // Ensure locals are before routing so they are available in the routing handler.
  handleLocals,
  handleRouting,
);
