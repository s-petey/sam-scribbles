import { JWT_SECRET, NODE_ENV } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { type User as DbUser } from './server/db/schema';

const oneHour = 60 * 60 * 1000;

const adminSchema = z.object({
	email: z.string().email().min(1),
	expires: z.number(),
	username: z.string().min(1),
	role: z.literal('admin')
});

type Admin = z.infer<typeof adminSchema>;

export const AUTH_COOKIE_NAME = 'AuthorizationToken';

export function verifyAdmin({ cookies }: RequestEvent) {
	const userToken = cookies.get(AUTH_COOKIE_NAME);

	if (userToken === undefined) {
		return null;
	}

	try {
		const payload = jwt.verify(userToken, JWT_SECRET);
		return adminSchema.parse(payload);
	} catch (error) {
		return null;
	}
}

/**
 * @throws If the user is not a valid role.
 */
export function authorizeAdmin(
	user: Pick<DbUser, 'email' | 'username' | 'role'>,
	{ cookies }: RequestEvent
) {
	const parsedUser = adminSchema.parse({
		email: user.email,
		expires: Date.now() + oneHour,
		username: user.username,
		role: user.role
	});

	const token = jwt.sign(parsedUser satisfies Admin, JWT_SECRET);

	cookies.set(AUTH_COOKIE_NAME, token, {
		httpOnly: true,
		maxAge: oneHour,
		path: '/',
		sameSite: 'strict',
		secure: NODE_ENV === 'production'
	});
}
