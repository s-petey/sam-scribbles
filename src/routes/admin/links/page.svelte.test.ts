import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { load } from './+page.server';

const { findManyTags, findManyLinks } = vi.hoisted(() => ({
  findManyTags: vi.fn().mockResolvedValue([]),
  findManyLinks: vi.fn().mockResolvedValue([]),
}));

// Mocking the database and session
vi.mock('$lib/server/db', () => ({
  db: {
    $count: vi.fn().mockResolvedValue(0),
    query: {
      tag: {
        findMany: findManyTags,
      },
      link: {
        findMany: findManyLinks,
      },
    },
  },
}));

function getFakeUrl(q: string, page: number, limit: number) {
  const params = new URLSearchParams();
  params.set('q', q);
  params.set('page', String(page));
  params.set('limit', String(limit));

  return new URL(`http://localhost/admin/links?${params.toString()}`);
}

describe('/+page.svelte', () => {
  it('renders page heading', async () => {
    const props = await load(
      // @ts-expect-error Partial data props
      { url: getFakeUrl('', 1, 10) },
    );
    render(Page, {
      props: {
        // @ts-expect-error Partial data props
        data: props,
      },
    });

    const syncButton = page.getByRole('heading', { level: 2, name: 'Add a link' });

    await expect.element(syncButton).toBeInTheDocument();
  });
});
