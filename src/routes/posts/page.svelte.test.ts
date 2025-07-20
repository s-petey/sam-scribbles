import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { load } from './+page.server';

// Mocking the database and session
vi.mock('$lib/server/db', () => ({
  db: {
    query: {
      post: {
        findMany: vi.fn().mockResolvedValue([
          {
            createdAt: new Date(),
            slug: 'test-post-1',
            title: 'Test Post 1',
            readingTimeSeconds: 120,
            preview: 'This is a preview of Test Post 1.',
            previewHtml: '<p>This is a preview of Test Post 1.</p>',
            tags: [],
          },
          {
            createdAt: new Date(),
            slug: 'test-post-2',
            title: 'Test Post 2',
            readingTimeSeconds: 150,
            preview: 'This is a preview of Test Post 2.',
            previewHtml: '<p>This is a preview of Test Post 2.</p>',
            tags: [],
          },
        ]),
      },
      tag: {
        findMany: vi.fn().mockResolvedValue([{ name: 'tag1' }, { name: 'tag2' }]),
      },
    },
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ id: 'test-post-1' }, { id: 'test-post-2' }]),
      }),
    }),
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
    const props = await load({
      url: getFakeUrl('', []),
    });

    render(Page, {
      props: {
        // @ts-expect-error Partial data props
        data: props,
      },
    });

    const heading = page.getByRole('heading', { level: 1, name: 'Scribbles' });
    await expect(heading).toBeInTheDocument();
  });

  it('renders post links', async () => {
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

    const post1 = page.getByRole('link', { name: 'Test Post 1' });
    const post2 = page.getByRole('link', { name: 'Test Post 2' });
    const tag1 = page.getByRole('button').and(page.getByText('tag1'));
    const tag2 = page.getByRole('button').and(page.getByText('tag2'));

    await expect(post1).toBeInTheDocument();
    await expect(post2).toBeInTheDocument();
    await expect(tag1).toBeInTheDocument();
    await expect(tag2).toBeInTheDocument();
  });
});
