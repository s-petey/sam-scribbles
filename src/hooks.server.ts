import { type Handle } from '@sveltejs/kit';
import { isValidMode, isValidTheme, type Theme, type ThemeMode } from '$lib/components/themes';

const ONE_YEAR = 60 * 60 * 24 * 365;

export const handle = (async ({ event, resolve }) => {
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
    event.cookies.set('theme', theme, {
      path: '/',
      maxAge: ONE_YEAR,
    });
  }
  if (themeMode === null) {
    themeMode = 'light';
    event.cookies.set('themeMode', themeMode, {
      path: '/',
      maxAge: ONE_YEAR,
    });
  }

  if (theme !== null || themeMode !== null) {
    return await resolve(event, {
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
    });
  }

  return await resolve(event);
}) satisfies Handle;
