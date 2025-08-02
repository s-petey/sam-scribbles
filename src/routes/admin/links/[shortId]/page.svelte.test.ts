import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { load } from './+page.server';
import type { Link } from '$lib/server/db/schema';

const { findFirstLink } = vi.hoisted(() => ({
  findFirstLink: vi.fn().mockResolvedValue({
    link: 'https://example.com',
    shortId: 'test-link',
    createdAt: new Date(),
    updatedAt: new Date(),
    private: false,
    tags: [{ name: 'test-tag' }],
  } satisfies Link & { tags: { name: string }[] }),
}));

// Mocking the database and session
vi.mock('$lib/server/db', () => ({
  db: {
    $count: vi.fn().mockResolvedValue(0),
    query: {
      link: {
        findFirst: findFirstLink,
      },
      tag: {
        findMany: vi.fn().mockResolvedValue([{ name: 'test-tag' }]),
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
          shortId: 'test-link',
        },
      },
    );
    render(Page, {
      props: {
        // @ts-expect-error Partial data props
        data: props,
      },
    });

    const syncButton = page.getByRole('textbox', { name: 'link' });

    await expect.element(syncButton).toBeInTheDocument();
    await expect(syncButton).toHaveValue('https://example.com');
  });
});
