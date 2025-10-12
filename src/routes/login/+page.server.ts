import { ALLOWED_EMAILS } from '$env/static/private';
import { auth } from '$lib/auth';
import { logger } from '$lib/logger';
import { db } from '$lib/server/db';
import { user as dbUser, type User } from '$lib/server/db/schema';
import { admin } from '$lib/siteLinks';
import { redirect } from '@sveltejs/kit';
import { fail, superValidate, setError } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import type { Actions, RequestEvent } from './$types';
import { APIError } from 'better-auth/api';
import type { betterAuth } from 'better-auth';
import { eq } from 'drizzle-orm';
import { setServerCookies } from '$lib/auth.server';

const INVALID_EMAIL_OR_PASSWORD = 'Invalid email or password' satisfies ReturnType<
  typeof betterAuth
>['$ERROR_CODES']['INVALID_EMAIL_OR_PASSWORD'];

const signInSchema = z.object({
  email: z.email('Invalid email').trim().min(1, 'Email is required'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be more than 8 characters')
    .max(32, 'Password must be less than 32 characters'),
  signup: z.boolean().optional().default(false),
});

export const load = async () => {
  const form = await superValidate(zod4(signInSchema));

  logger.info('Attempt to access login page');

  return {
    form,
  };
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event, zod4(signInSchema));

    if (!form.valid) {
      logger.error(`Attempted with email: ${form.data.email}`);
      return fail(400, { form });
    }

    logger.info({ msg: 'Logging in', email: form.data.email });

    try {
      await loginOrSignup(form.data, event);
    } catch (e) {
      if (e instanceof SignupError) {
        logger.info({
          msg: 'Prompting user signup',
          email: form.data.email,
        });
        return setError(form, 'signup', 'Please sign up');
      } else if (e instanceof APIError) {
        logger.error({
          msg: 'Unable to login',
          email: form.data.email,
          code: e.body?.code,
        });
        // TODO:
        if (e.body?.code === INVALID_EMAIL_OR_PASSWORD) {
          return setError(form, 'email', 'Invalid email or password');
        }
      } else {
        logger.error({
          msg: 'Unexpected error during login',
          email: form.data.email,
          error: e,
        });

        return fail(500, { form, error: 'An unexpected error occurred' });
      }

      return fail(400, { form });
    }

    redirect(302, admin['Admin Panel'].href);
  },
};

async function updateRole(user: Pick<User, 'email' | 'role'>, role: User['role']) {
  if (user.role === role) {
    return null;
  }

  return await db
    .update(dbUser)
    .set({
      role,
    })
    .where(eq(dbUser.email, user.email));
}

async function loginOrSignup(
  formUser: {
    email: User['email'];
    password: string;
    signup: boolean;
  },
  event: RequestEvent,
) {
  let authResponse;
  let user = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.email, formUser.email),
    columns: {
      email: true,
      name: true,
      role: true,
    },
  });

  logger.debug({
    msg: 'User found',
    email: user?.email,
    role: user?.role,
  });

  const role: User['role'] = isAllowedAdmin(formUser.email) ? 'admin' : 'user';

  if (user === undefined) {
    if (!formUser.signup) {
      throw new SignupError();
    }

    authResponse = await auth.api.signUpEmail({
      returnHeaders: true,
      body: {
        name: '',
        email: formUser.email,
        password: formUser.password,
        role,
      },
    });

    await updateRole(
      {
        email: authResponse.response.user.email,
        role,
      },
      role,
    );

    logger.debug({
      msg: 'User created',
      email: authResponse.response.user.email,
      role,
    });

    user = {
      email: authResponse.response.user.email,
      name: authResponse.response.user.name,
      role,
    };
  } else {
    authResponse = await auth.api.signInEmail({
      returnHeaders: true,
      body: {
        email: formUser.email,
        password: formUser.password,
      },
    });

    await updateRole(
      {
        email: authResponse.response.user.email,
        role: 'admin',
      },
      'admin',
    );

    logger.debug({
      msg: 'User signed in',
      email: authResponse.response.user.email,
      role,
    });

    user = {
      email: authResponse.response.user.email,
      name: authResponse.response.user.name,
      role: 'admin',
    };
  }

  setServerCookies(authResponse.headers, event);
}

function isAllowedAdmin(email: User['email']) {
  return ALLOWED_EMAILS.split(',').includes(email);
}

class SignupError extends Error {
  public _type = 'SignupError';
}
