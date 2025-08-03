import { page } from '@vitest/browser/context';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { load } from './+page.server';
import type { Link, Post } from '$lib/server/db/schema';

// Mock DB for tags, posts, links
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
      tag: {
        findMany: vi.fn().mockResolvedValue([{ name: 'tag1' }, { name: 'tag2' }, { name: 'tag3' }]),
      },
    },
  },
}));

describe('/tags/+page.svelte', () => {
  test('renders the page heading', async () => {
    // @ts-expect-error Partial data props
    const props = await load({
      url: new URL('http://localhost/tags?tags=tag1,tag2,tag3'),
    });
    render(Page, {
      props: {
        // @ts-expect-error Partial data props
        data: {
          links: props.links,
          posts: props.posts,
          tags: props.tags,
        },
      },
    });
    const heading = page.getByRole('heading', { level: 1, name: 'Tags' });
    await expect(heading).toBeInTheDocument();
  });

  test('renders tag chips, posts, and links', async () => {
    // @ts-expect-error Partial data props
    const props = await load({
      url: new URL('http://localhost/tags?tags=tag1,tag2,tag3'),
    });
    render(Page, {
      props: {
        // @ts-expect-error Partial data props
        data: {
          links: props.links,
          posts: props.posts,
          tags: props.tags,
        },
      },
    });
    // Tag chips
    await expect(page.getByRole('button').and(page.getByText('tag1'))).toBeInTheDocument();
    await expect(page.getByRole('button').and(page.getByText('tag2'))).toBeInTheDocument();
    await expect(page.getByRole('button').and(page.getByText('tag3'))).toBeInTheDocument();
    // Posts
    await expect(page.getByRole('link', { name: 'Post One' })).toBeInTheDocument();
    // Links
    await expect(page.getByRole('link', { name: /example/ })).toBeInTheDocument();
  });
});
