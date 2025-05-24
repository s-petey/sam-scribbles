import { parseSetCookieHeader } from 'better-auth/cookies';
import type { RequestEvent } from '@sveltejs/kit';
import { auth } from './auth';
import { z } from 'zod';

// WARNING -- this is likely not a great thing, but trying to get
// the correct data type(s) without doing an additional request.
type DuplicatedSession = Awaited<ReturnType<typeof auth.api.getSession>>;

const userDuplicatedSession: z.ZodType<NonNullable<DuplicatedSession>['user']> = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().optional().nullable(),
  emailVerified: z.coerce.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  role: z.enum(['user', 'admin', 'creator']),
});

const sessionDuplicatedSession: z.ZodType<NonNullable<DuplicatedSession>['session']> = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  userId: z.string(),
  expiresAt: z.coerce.date(),
  token: z.string(),
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
});

/**
 * A wrapper around `auth.api.getSession` that also sets the cookies
 * in the SvelteKit `RequestEvent` cookies.
 */
export async function getAndRefreshSession(event: RequestEvent) {
  const { request } = event;
  const authSession = await auth.api.getSession({
    headers: request.headers,
    asResponse: true,
  });

  setServerCookies(authSession.headers, event);

  const data = (await authSession.json()) as DuplicatedSession;

  const user = data !== null ? userDuplicatedSession.safeParse(data.user) : null;
  const session = data !== null ? sessionDuplicatedSession.safeParse(data.session) : null;

  return {
    user: user?.success ? user.data : null,
    session: session?.success ? session.data : null,
    original: data,
  };
}

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
