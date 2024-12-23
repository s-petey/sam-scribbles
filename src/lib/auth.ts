import { JWT_SECRET, NODE_ENV } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';
import { SignJWT } from 'jose/jwt/sign';
import { jwtVerify } from 'jose/jwt/verify';
import { randomBytes, scryptSync } from 'node:crypto';
import { z } from 'zod';
import { type User } from './server/db/schema';
import { core } from './siteLinks';

export const ONE_HOUR = 60 * 60 * 1000;

const adminSchema = z.object({
  email: z.string().email().min(1),
  expires: z.number(),
  username: z.string().min(1),
  role: z.literal('admin'),
});

export const AUTH_COOKIE_NAME = 'AuthorizationToken';

export function logout({ cookies }: RequestEvent) {
  cookies.delete(AUTH_COOKIE_NAME, { path: core.Home.href });
}

export async function verifyAdmin({ cookies }: RequestEvent) {
  const userToken = cookies.get(AUTH_COOKIE_NAME);

  if (userToken === undefined) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(userToken, getJwtSecret());
    return adminSchema.parse(payload);
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  } catch (_error) {
    // TODO: Log error?
    return null;
  }
}

function getJwtSecret() {
  return new TextEncoder().encode(JWT_SECRET);
}

/**
 * @throws If the user is not a valid role.
 */
export async function authorizeAdmin(
  user: Pick<User, 'email' | 'username' | 'role'>,
  { cookies }: RequestEvent,
) {
  const expiresSeconds = Date.now() + ONE_HOUR;

  const parsedUser = adminSchema.parse({
    email: user.email,
    expires: expiresSeconds,
    username: user.username,
    role: user.role,
  });

  const token = await new SignJWT(parsedUser)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresSeconds)
    .sign(getJwtSecret());

  cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    expires: new Date(expiresSeconds),
    path: core.Home.href,
    sameSite: 'strict',
    secure: NODE_ENV === 'production',
  });
}

export function saltAndHashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return encryptPassword(password, salt) + salt;
}

export function verifyPassword(password: string, hash: User['password']) {
  const salt = hash.slice(64);
  const originalPassHash = hash.slice(0, 64);
  const currentPassHash = encryptPassword(password, salt);
  return originalPassHash === currentPassHash;
}

// Pass the password string and get hashed password back
// ( and store only the hashed string in your database)
function encryptPassword(password: string, salt: string) {
  return scryptSync(password, salt, 32).toString('hex');
}
