import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { load } from './+page.server';

// Mocking the database and session
vi.mock('$lib/server/db', () => ({
  db: {
    query: {
      link: {
        findMany: vi.fn().mockResolvedValue([
          {
            link: 'https://example.com/1',
            createdAt: new Date(),
            updatedAt: new Date(),
            shortId: '1',
            private: false,
            tags: [],
          },
          {
            link: 'https://example.com/2',
            createdAt: new Date(),
            updatedAt: new Date(),
            shortId: '2',
            private: false,
            tags: [],
          },
        ]),
      },
      tag: {
        findMany: vi.fn().mockResolvedValue([{ name: 'tag1' }, { name: 'tag2' }]),
      },
    },
    $count: vi.fn().mockResolvedValue(10),
    select: vi.fn(() => ({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ id: '1' }, { id: '2' }]),
      }),
    })),
  },
}));

function getFakeUrl(q: string, tags: string[]) {
  const params = new URLSearchParams();
  params.set('q', q);
  params.set('tags', tags.join(','));

  return new URL(`http://localhost/admin/posts?${params.toString()}`);
}

describe('/links/+page.svelte', () => {
  it('renders the page heading', async () => {
    // @ts-expect-error Partial event object for testing
    const props = await load({
      url: getFakeUrl('', []),
    });

    render(Page, {
      props: {
        // @ts-expect-error Partial data props
        data: props,
      },
    });

    const heading = page.getByRole('heading', { level: 1, name: 'Links' });
    await expect(heading).toBeInTheDocument();
  });

  it('renders links and tags', async () => {
    // @ts-expect-error Partial event object for testing
    const props = await load({
      url: getFakeUrl('', []),
    });

    render(Page, {
      target: document.body,
      props: {
        // @ts-expect-error Partial data props
        data: props,
      },
    });

    const link1 = page.getByRole('link', { name: 'https://example.com/1' });
    const link2 = page.getByRole('link', { name: 'https://example.com/2' });
    const tag1 = page.getByRole('button').and(page.getByText('tag1'));
    const tag2 = page.getByRole('button').and(page.getByText('tag2'));

    await expect(link1).toBeInTheDocument();
    await expect(link2).toBeInTheDocument();
    await expect(tag1).toBeInTheDocument();
    await expect(tag2).toBeInTheDocument();
  });
});
