import { page } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { load } from './+page.server';
import type { Link, Post } from '$lib/server/db/schema';

// Mock DB for posts, links
vi.mock('$lib/server/db', () => ({
  db: {
    query: {
      post: {
        findMany: vi.fn().mockResolvedValue([
          {
            slug: 'post-1',
            title: 'Post One',
            preview: 'Preview for post one',
            tags: [{ tag: 'tag1' }, { tag: 'tag2' }],
          } satisfies Partial<Post> & { tags: { tag: string }[] },
        ]),
      },
      link: {
        findMany: vi.fn().mockResolvedValue([
          {
            shortId: 'link-1',
            link: 'https://example.com',
            tags: [{ tag: 'tag1' }, { tag: 'tag3' }],
          } satisfies Partial<Link> & { tags: { tag: string }[] },
        ]),
      },
    },
    $count: vi.fn().mockResolvedValue(5),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ id: '1' }, { id: '2' }]),
      }),
    }),
  },
}));

describe('/tags/[slug]/+page.svelte', () => {
  test('renders the tag heading', async () => {
    // @ts-expect-error Partial event object for testing
    const props = await load({
      params: { slug: 'tag1' },
      url: new URL('http://localhost/tags/tag1'),
    });
    render(Page, {
      props: {
        // @ts-expect-error Partial event object for testing
        data: props,
      },
    });
    const heading = page.getByRole('heading', { level: 1, name: 'Tag: tag1' });
    await expect(heading).toBeInTheDocument();
  });

  test('renders posts and links for the tag', async () => {
    // @ts-expect-error Partial event object for testing
    const props = await load({
      params: { slug: 'tag1' },
      url: new URL('http://localhost/tags/tag1'),
    });
    render(Page, {
      props: {
        // @ts-expect-error Partial event object for testing
        data: props,
      },
    });
    await expect(page.getByRole('link', { name: 'Post One' })).toBeInTheDocument();
    await expect(page.getByRole('link', { name: /example/ })).toBeInTheDocument();
  });

  test('renders tag chips for posts and links', async () => {
    // @ts-expect-error Partial event object for testing
    const props = await load({
      params: { slug: 'tag1' },
      url: new URL('http://localhost/tags/tag1'),
    });
    render(Page, {
      props: {
        // @ts-expect-error Partial event object for testing
        data: props,
      },
    });

    const totalTag1 = await page
      .getByRole('link', {
        name: 'tag1',
      })
      .all();

    const totalTag2 = await page
      .getByRole('link', {
        name: 'tag2',
      })
      .all();
    const totalTag3 = await page
      .getByRole('link', {
        name: 'tag3',
      })
      .all();

    expect(totalTag1.length).toBe(2);
    expect(totalTag2.length).toBe(1);
    expect(totalTag3.length).toBe(1);
  });
});
