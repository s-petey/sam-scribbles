import { parseSetCookieHeader } from 'better-auth/cookies';
import type { RequestEvent } from '@sveltejs/kit';

// WARNING: This is mostly a copy of `next-js` in better-auth.
// import { nextCookies } from 'better-auth/next-js';
export function setServerCookies(headers: Headers, { cookies }: RequestEvent) {
  const setCookies = headers?.get('set-cookie');

  if (!setCookies) return;

  const parsed = parseSetCookieHeader(setCookies);

  for (const [key, value] of parsed) {
    if (!key) continue;

    const opts: Parameters<typeof cookies.set>[2] = {
      sameSite: value.samesite,
      secure: value.secure,
      maxAge: value['max-age'],
      httpOnly: value.httponly,
      domain: value.domain,
      path: value.path ?? '',
    };

    cookies.set(key, decodeURIComponent(value.value), opts);
  }
}
