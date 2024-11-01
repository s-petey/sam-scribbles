import { JWT_SECRET, NODE_ENV } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { type User } from './server/db/schema';
import { core } from './siteLinks';

export const ONE_HOUR = 60 * 60 * 1000;

const adminSchema = z.object({
	email: z.string().email().min(1),
	expires: z.number(),
	username: z.string().min(1),
	role: z.literal('admin')
});

export const AUTH_COOKIE_NAME = 'AuthorizationToken';

export function logout({ cookies }: RequestEvent) {
	cookies.delete(AUTH_COOKIE_NAME, { path: core.Home.href });
}

export function verifyAdmin({ cookies }: RequestEvent) {
	const userToken = cookies.get(AUTH_COOKIE_NAME);

	if (userToken === undefined) {
		return null;
	}

	try {
		const payload = jwt.verify(userToken, JWT_SECRET);
		return adminSchema.parse(payload);
		// eslint-disable-next-line  @typescript-eslint/no-unused-vars
	} catch (_error) {
		// TODO: Log error?
		return null;
	}
}

/**
 * @throws If the user is not a valid role.
 */
export function authorizeAdmin(
	user: Pick<User, 'email' | 'username' | 'role'>,
	{ cookies }: RequestEvent
) {
	const expiresSeconds = Date.now() + ONE_HOUR;

	const parsedUser = adminSchema.parse({
		email: user.email,
		expires: expiresSeconds,
		username: user.username,
		role: user.role
	});

	const token = jwt.sign(parsedUser, JWT_SECRET);

	cookies.set(AUTH_COOKIE_NAME, token, {
		httpOnly: true,
		expires: new Date(expiresSeconds),
		path: core.Home.href,
		sameSite: 'strict',
		secure: NODE_ENV === 'production'
	});
}

export function saltAndHashPassword(password: string) {
	return bcrypt.hash(password, 13);
}

export function verifyPassword(password: string, hash: User['password']) {
	return bcrypt.compare(password, hash);
}
