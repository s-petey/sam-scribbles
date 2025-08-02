import { expect, test, vi } from 'vitest';
import { handle } from './hooks.server';
import type { RequestEvent } from '@sveltejs/kit';
import { describe } from 'node:test';
import * as AUTH from '$lib/auth';

// const { getSession } = vi.hoisted(() => {
//   return {
//     getSession: vi.fn().mockResolvedValue(null),
//   };
// });

vi.mock('@sveltejs/kit', async () => {
  const actual = await vi.importActual('@sveltejs/kit');
  return {
    ...actual,
    redirect: vi.fn((status, location) => {
      throw { status, location };
    }),
  };
});

vi.mock('$lib/auth');
// , async (importOriginal) => {
//   const original = await importOriginal();
//   return {
//     // @ts-expect-error Mocking the auth module
//     ...original,
//     auth: {
//       // @ts-expect-error Mocking the auth module
//       ...original.auth,
//       api: {
//         // @ts-expect-error Mocking the auth module
//         ...original.auth.api,
//         getSession: getSession,
//         signOut: vi.fn().mockResolvedValue({
//           headers: new Headers({
//             'set-cookie': 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
//           }),
//         }),
//       },
//     },
//   };
// });

describe('handle -- suspicious routing', () => {
  test('removes trailing slash', async () => {
    const mockEvent = createMockEvent('/posts/my-blog-post/');
    const mockResolve = createMockResolve();

    try {
      await handle({ event: mockEvent, resolve: mockResolve });
      expect.fail('Expected redirect to be thrown');
    } catch (error) {
      const { status, location } = getErrorInfo(error);
      expect(status).toBe(301);
      expect(location).toBe('/posts/my-blog-post');
    }
  });

  test('rejects suspicious file extensions', async () => {
    const mockEvent = createMockEvent('/malicious.php');
    const mockResolve = createMockResolve();

    try {
      await handle({ event: mockEvent, resolve: mockResolve });
      expect.fail('Expected redirect to be thrown');
    } catch (error) {
      const { status, location } = getErrorInfo(error);
      expect(status).toBe(302);
      expect(location).toBe('https://www.google.com');
    }
  });

  test('rejects suspicious paths', async () => {
    const mockEvent = createMockEvent('/wp-admin');
    const mockResolve = createMockResolve();

    try {
      await handle({ event: mockEvent, resolve: mockResolve });
      expect.fail('Expected redirect to be thrown');
    } catch (error) {
      const { status, location } = getErrorInfo(error);
      expect(status).toBe(302);
      expect(location).toBe('https://www.google.com');
    }
  });
});

describe('handle -- theme and mode', () => {
  test('sets valid theme and light mode from cookies', async () => {
    const mockEvent = createMockEvent('/posts/my-blog-post', {
      theme: 'catppuccin',
      themeMode: 'light',
    });
    const mockResolve = createMockResolve();

    const result = await handle({
      event: mockEvent,
      resolve: mockResolve,
    });

    expect(mockEvent.cookies.get).toHaveBeenCalledWith('theme');
    expect(mockEvent.cookies.get).toHaveBeenCalledWith('themeMode');
    expect(mockResolve).toHaveBeenCalledWith(
      mockEvent,
      expect.objectContaining({
        transformPageChunk: expect.any(Function),
      }),
    );

    expect(result).toBe('<html class="" data-theme="catppuccin">');
  });

  test('sets valid theme and mode from cookies', async () => {
    const mockEvent = createMockEvent('/posts/my-blog-post', {
      theme: 'catppuccin',
      themeMode: 'dark',
    });
    const mockResolve = createMockResolve();

    const result = await handle({
      event: mockEvent,
      resolve: mockResolve,
    });

    expect(mockEvent.cookies.get).toHaveBeenCalledWith('theme');
    expect(mockEvent.cookies.get).toHaveBeenCalledWith('themeMode');
    expect(mockResolve).toHaveBeenCalledWith(
      mockEvent,
      expect.objectContaining({
        transformPageChunk: expect.any(Function),
      }),
    );

    expect(result).toBe('<html class="dark" data-theme="catppuccin">');
  });

  test('ignores invalid theme', async () => {
    const mockEvent = createMockEvent('/posts/my-blog-post', { theme: 'invalid-theme' });
    const mockResolve = createMockResolve();

    const result = await handle({
      event: mockEvent,
      resolve: mockResolve,
    });

    expect(mockEvent.cookies.get).toHaveBeenCalledWith('theme');
    expect(mockResolve).toHaveBeenCalledWith(
      mockEvent,
      expect.objectContaining({
        transformPageChunk: expect.any(Function),
      }),
    );

    expect(result).toBe('<html class="dark" data-theme="fennec">');
  });

  test('ignores invalid theme mode', async () => {
    const mockEvent = createMockEvent('/posts/my-blog-post', { themeMode: 'blight' });
    const mockResolve = createMockResolve();

    const result = await handle({
      event: mockEvent,
      resolve: mockResolve,
    });

    expect(mockEvent.cookies.get).toHaveBeenCalledWith('theme');
    expect(mockResolve).toHaveBeenCalledWith(
      mockEvent,
      expect.objectContaining({
        transformPageChunk: expect.any(Function),
      }),
    );

    expect(result).toBe('<html class="dark" data-theme="fennec">');
  });

  test('uses default when no theme or theme mode is provided', async () => {
    const mockEvent = createMockEvent('/posts/my-blog-post');
    const mockResolve = createMockResolve();

    const result = await handle({
      event: mockEvent,
      resolve: mockResolve,
    });

    expect(mockEvent.cookies.get).toHaveBeenCalledWith('theme');
    expect(mockResolve).toHaveBeenCalledWith(
      mockEvent,
      expect.objectContaining({
        transformPageChunk: expect.any(Function),
      }),
    );

    expect(result).toBe('<html class="dark" data-theme="fennec">');
  });
});

describe('handle -- routing rules', () => {
  test("redirects home if session isn't admin", async () => {
    const mockEvent = createMockEvent('/admin');
    const mockResolve = createMockResolve();

    try {
      await handle({ event: mockEvent, resolve: mockResolve });
      expect.fail('Expected redirect to be thrown');
    } catch (error) {
      const { status, location } = getErrorInfo(error);
      expect(status).toBe(303);
      expect(location).toBe('/');
    }
  });

  test('redirects to login if session expired', async () => {
    vi.mocked(AUTH.auth.api.getSession).mockResolvedValue({
      // @ts-expect-error Partially matching user
      user: { role: 'admin' },
      // @ts-expect-error Partially matching session
      session: { expiresAt: new Date(Date.now() - 1000) },
    });
    vi.mocked(AUTH.auth.api.signOut).mockResolvedValue({
      success: true,
    });

    const mockEvent = createMockEvent('/admin');
    const mockResolve = createMockResolve();

    try {
      await handle({ event: mockEvent, resolve: mockResolve });
      expect.fail('Expected redirect to be thrown');
    } catch (error) {
      const { status, location } = getErrorInfo(error);
      expect(status).toBe(302);
      expect(location).toBe('/login');
    }
  });

  test('redirects to home if session is not admin', async () => {
    vi.mocked(AUTH.auth.api.getSession).mockResolvedValue({
      // @ts-expect-error Partially matching user
      user: { role: 'user' },
      // @ts-expect-error Partially matching session
      session: { expiresAt: new Date(Date.now() + 1000) },
    });

    const mockEvent = createMockEvent('/admin');
    const mockResolve = createMockResolve();

    try {
      await handle({ event: mockEvent, resolve: mockResolve });
      expect.fail('Expected redirect to be thrown');
    } catch (error) {
      const { status, location } = getErrorInfo(error);
      expect(status).toBe(303);
      expect(location).toBe('/');
    }
  });
});

// --- Test helpers ---

function createMockEvent(
  pathname: string,
  opts?: {
    theme?: string;
    themeMode?: string;
  },
): RequestEvent {
  return {
    url: new URL(`https://some-home.com${pathname}`),
    request: new Request(`https://some-home.com${pathname}`, {
      headers: new Headers({
        'x-forwarded-for': '127.0.0.1',
      }),
    }),
    cookies: {
      get: vi.fn().mockReturnValueOnce(opts?.theme).mockReturnValueOnce(opts?.themeMode),
      set: vi.fn(),
      delete: vi.fn(),
      getAll: vi.fn(),
      serialize: vi.fn(),
    },
    getClientAddress: () => '127.0.0.1',
    fetch: vi.fn(),
    locals: {
      session: {
        // @ts-expect-error Partially matching user
        user: opts?.user ?? null,
        // @ts-expect-error Partially matching session
        session: opts?.session ?? null,
      },
      theme: {
        theme: 'catppuccin',
        mode: 'light',
      },
    },
    params: {},
    platform: '',
    route: {
      id: '',
    },
    isDataRequest: false,
    isSubRequest: false,
    setHeaders: vi.fn(),
  };
}

function getErrorInfo(error: unknown): { status: number | null; location: string | null } {
  let status: number | null = null;
  let location: string | null = null;

  if (error && typeof error === 'object') {
    if ('status' in error && typeof error.status === 'number') {
      status = error.status;
    }
    if ('location' in error && typeof error.location === 'string') {
      location = error.location;
    }
  }
  return { status, location };
}

// Helper function to create a mock resolve function
const createMockResolve = () =>
  vi.fn().mockImplementation(async (_event, opts) => {
    if (opts && opts.transformPageChunk) {
      return opts.transformPageChunk({
        html: '<html class="dark" data-theme="fennec">',
      });
    }
    return '<html class="dark" data-theme="fennec">';
  });
