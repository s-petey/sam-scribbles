import { page } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { load } from './+page.server';
import type { Post } from '$lib/server/db/schema';

const RELATED_POSTS = [
  {
    slug: 'related-1',
    title: 'Related Post 1',
    preview: 'Preview 1',
    readingTimeSeconds: 300,
    readingTimeWords: 750,
  },
  {
    slug: 'related-2',
    title: 'Related Post 2',
    preview: 'Preview 2',
    readingTimeSeconds: 400,
    readingTimeWords: 800,
  },
];

const { relatedPostsLimit } = vi.hoisted(() => ({
  relatedPostsLimit: vi.fn().mockResolvedValue([]),
}));

vi.mock('$app/paths', () => ({
  resolve: vi.fn((route, params) => {
    if (route === '/tags/[slug]') {
      return `/tags/${params.slug}`;
    }
    if (route === '/posts/[slug]') {
      return `/posts/${params.slug}`;
    }
    return route;
  }),
}));

vi.mock('$lib/server/db', () => ({
  db: {
    query: {
      post: {
        findFirst: vi.fn().mockResolvedValue({
          id: '1',
          slug: 'test-post',
          isPrivate: false,
        } satisfies Partial<Post>),
      },
    },
    select: vi.fn().mockReturnValue({
      // relatedPosts: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: relatedPostsLimit,
            }),
          }),
        }),
      }),
    }),
  },
}));

// Mock Content component
const MockContent = () => ({
  $$render: () => ({
    html: '<p>This is mock content.</p>',
    css: { code: '', map: null },
    head: '',
  }),
});

describe('/posts/[slug]/+page.svelte', () => {
  const mockMeta = {
    title: 'Test Post',
    date: new Date('2023-10-01'),
    updated: new Date('2023-10-15'),
    tags: ['tag1', 'tag2'],
    isPrivate: false,
    reading_time: { text: '5 min read', minutes: 5, time: 300000, words: 750 },
    slug: 'test-post',
  };

  test('renders the post title', async () => {
    // @ts-expect-error Partial event object for testing
    const serverData = await load({
      params: { slug: 'test-post' },
      url: new URL('http://localhost/posts/test-post'),
    });
    const data = { Content: MockContent, meta: mockMeta, relatedPosts: serverData.relatedPosts };
    render(Page, {
      props: {
        // @ts-expect-error Partial event object for testing
        data,
      },
    });
    const heading = page.getByRole('heading', { level: 1, name: 'Test Post' });
    await expect(heading).toBeInTheDocument();
  });

  test('renders the formatted date and reading time', async () => {
    // @ts-expect-error Partial event object for testing
    const serverData = await load({
      params: { slug: 'test-post' },
      url: new URL('http://localhost/posts/test-post'),
    });
    const data = { Content: MockContent, meta: mockMeta, relatedPosts: serverData.relatedPosts };
    render(Page, {
      props: {
        // @ts-expect-error Partial event object for testing
        data,
      },
    });
    await expect(page.getByText('5 min read')).toBeInTheDocument();
  });

  test('shows NEW badge for recent posts', async () => {
    // @ts-expect-error Partial event object for testing
    const serverData = await load({
      params: { slug: 'test-post' },
      url: new URL('http://localhost/posts/test-post'),
    });
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 10); // 10 days ago
    const recentMeta = { ...mockMeta, date: recentDate };
    const recentData = {
      Content: MockContent,
      meta: recentMeta,
      relatedPosts: serverData.relatedPosts,
    };
    render(Page, {
      props: {
        // @ts-expect-error Partial event object for testing
        data: recentData,
      },
    });
    await expect(page.getByText('NEW')).toBeInTheDocument();
  });

  test('does not show NEW badge for old posts', async () => {
    // @ts-expect-error Partial event object for testing
    const serverData = await load({
      params: { slug: 'test-post' },
      url: new URL('http://localhost/posts/test-post'),
    });
    const oldDate = new Date('2020-01-01');
    const oldMeta = { ...mockMeta, date: oldDate, updated: oldDate };
    const oldData = { Content: MockContent, meta: oldMeta, relatedPosts: serverData.relatedPosts };
    render(Page, {
      props: {
        // @ts-expect-error Partial event object for testing
        data: oldData,
      },
    });
    await expect(await page.getByText('NEW').all()).toHaveLength(0);
  });

  test('renders tags as links', async () => {
    // @ts-expect-error Partial event object for testing
    const serverData = await load({
      params: { slug: 'test-post' },
      url: new URL('http://localhost/posts/test-post'),
    });
    const data = { Content: MockContent, meta: mockMeta, relatedPosts: serverData.relatedPosts };
    render(Page, {
      props: {
        // @ts-expect-error Partial event object for testing
        data,
      },
    });
    const tag1Link = page.getByRole('link', { name: 'tag1' });
    const tag2Link = page.getByRole('link', { name: 'tag2' });
    await expect(tag1Link).toBeInTheDocument();
    await expect(tag2Link).toBeInTheDocument();
    await expect(tag1Link).toHaveAttribute('href', '/tags/tag1');
    await expect(tag2Link).toHaveAttribute('href', '/tags/tag2');
  });

  test('shows private post warning', async () => {
    // @ts-expect-error Partial event object for testing
    const serverData = await load({
      params: { slug: 'test-post' },
      url: new URL('http://localhost/posts/test-post'),
    });
    const privateMeta = { ...mockMeta, isPrivate: true };
    const privateData = {
      Content: MockContent,
      meta: privateMeta,
      relatedPosts: serverData.relatedPosts,
    };
    render(Page, {
      props: {
        // @ts-expect-error Partial event object for testing
        data: privateData,
      },
    });
    await expect(page.getByText("POST ISN'T PUBLIC YET!")).toBeInTheDocument();
  });

  test('shows recently updated message', async () => {
    // @ts-expect-error Partial event object for testing
    const serverData = await load({
      params: { slug: 'test-post' },
      url: new URL('http://localhost/posts/test-post'),
    });
    const updatedMeta = { ...mockMeta, updated: new Date() };
    const updatedData = {
      Content: MockContent,
      meta: updatedMeta,
      relatedPosts: serverData.relatedPosts,
    };
    render(Page, {
      props: {
        // @ts-expect-error Partial event object for testing
        data: updatedData,
      },
    });
    await expect(page.getByText('Recently updated!')).toBeInTheDocument();
  });

  test('does not show recently updated for old updates', async () => {
    // @ts-expect-error Partial event object for testing
    const serverData = await load({
      params: { slug: 'test-post' },
      url: new URL('http://localhost/posts/test-post'),
    });
    const oldUpdated = new Date('2010-01-01');
    const oldUpdatedMeta = { ...mockMeta, updated: oldUpdated };
    const oldUpdatedData = {
      Content: MockContent,
      meta: oldUpdatedMeta,
      relatedPosts: serverData.relatedPosts,
    };
    render(Page, {
      props: {
        // @ts-expect-error Partial event object for testing
        data: oldUpdatedData,
      },
    });
    await expect(await page.getByText('Recently updated!').all()).toHaveLength(0);
  });

  test('renders related posts', async () => {
    relatedPostsLimit.mockResolvedValueOnce(RELATED_POSTS);
    // @ts-expect-error Partial event object for testing
    const serverData = await load({
      params: { slug: 'test-post' },
      url: new URL('http://localhost/posts/test-post'),
    });
    const data = { Content: MockContent, meta: mockMeta, relatedPosts: serverData.relatedPosts };
    render(Page, {
      props: {
        // @ts-expect-error Partial event object for testing
        data,
      },
    });
    await expect(page.getByRole('heading', { name: 'Related posts...' })).toBeInTheDocument();
    await expect(page.getByRole('heading', { name: 'Related Post 1' })).toBeInTheDocument();
    await expect(page.getByRole('heading', { name: 'Related Post 2' })).toBeInTheDocument();
  });

  test('does not render related posts section if none', async () => {
    relatedPostsLimit.mockResolvedValueOnce([]);

    // @ts-expect-error Partial event object for testing
    const serverData = await load({
      params: { slug: 'test-post' },
      url: new URL('http://localhost/posts/test-post'),
    });
    const data = { Content: MockContent, meta: mockMeta, relatedPosts: serverData.relatedPosts };
    render(Page, {
      props: {
        // @ts-expect-error Partial event object for testing
        data,
      },
    });

    await expect(await page.getByText('Related posts...').all()).toHaveLength(0);
  });
});
