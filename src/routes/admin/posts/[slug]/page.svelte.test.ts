import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { load } from './+page.server';
import type { Post } from '$lib/server/db/schema';

const { findFirstPost } = vi.hoisted(() => ({
  findFirstPost: vi.fn().mockResolvedValue({
    title: 'Test Post',
    createdAt: new Date(),
    updatedAt: new Date(),
  } satisfies Partial<Post>),
}));

// Mocking the database and session
vi.mock('$lib/server/db', () => ({
  db: {
    $count: vi.fn().mockResolvedValue(0),
    query: {
      post: {
        findFirst: findFirstPost,
      },
    },
  },
}));

describe('/+page.svelte', () => {
  it('renders page heading', async () => {
    const props = await load(
      // @ts-expect-error Partial data props
      {
        params: {
          slug: 'test-post',
        },
      },
    );
    render(Page, {
      props: {
        data: {
          // Add data from `page.ts`
          ...props,
          // @ts-expect-error Partial data props
          meta: { title: props.post?.title ?? '', slug: props.slug ?? '' },
          Content: 'This is a test post content.',
        },
      },
    });

    const syncButton = page.getByRole('heading', { level: 2, name: 'Test Post' });

    await expect.element(syncButton).toBeInTheDocument();
  });

  it('renders the action message', async () => {
    const props = await load(
      // @ts-expect-error Partial data props
      {
        params: {
          slug: 'test-post',
        },
      },
    );

    render(Page, {
      props: {
        data: {
          // Add data from `page.ts`
          ...props,
          // @ts-expect-error Partial data props
          meta: { title: props.post?.title ?? '', slug: props.slug ?? '' },
          Content: 'This is a test post content.',
          // @ts-expect-error Partial data props
          form: {
            ...props.form,
            message: 'This is a test message.',
          },
        },
      },
    });

    const messageElement = page.getByText('This is a test message.');

    await expect(messageElement).toBeInTheDocument();
  });
});
