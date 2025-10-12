import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { load } from './+page.server';
import type { Post } from '$lib/server/db/schema';

// Mock the post import
vi.mock('../../../../posts/test-post.md', () => ({
  default: () => 'Test content',
  metadata: {
    title: 'Test Post',
    date: new Date('2024-01-01'),
    tags: ['test', 'vitest'],
    preview: 'This is a test post preview',
    previewHtml: '<p>This is a test post preview</p>',
    reading_time: { text: '5 min read', time: 300000, words: 1000 },
    isPrivate: false,
  },
}));

const mockAvailablePosts = [
  {
    id: 'available-1',
    slug: 'available-post-1',
    title: 'Available Post 1',
    readingTimeSeconds: 180,
  },
  {
    id: 'available-2',
    slug: 'available-post-2',
    title: 'Available Post 2',
    readingTimeSeconds: 200,
  },
];

const { mockDb } = vi.hoisted(() => {
  // Mock db.select calls with different return patterns
  const createSelectChain = (mockResult: unknown, isCount = false) => ({
    from: vi.fn(() => ({
      innerJoin: vi.fn(() => ({
        where: vi.fn().mockResolvedValue(mockResult),
      })),
      where: isCount
        ? vi.fn().mockResolvedValue(mockResult)
        : vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn().mockResolvedValue(mockResult),
              })),
            })),
          })),
    })),
    where: vi.fn().mockResolvedValue(mockResult),
  });

  const selectMock = vi.fn((fields: unknown) => {
    // Check if this is the count query (has totalCount field)
    if (fields && typeof fields === 'object' && 'totalCount' in fields) {
      return createSelectChain([{ totalCount: 2 }], true);
    }
    // Check if this is a related posts query (has specific fields for related posts)
    if (fields && typeof fields === 'object' && 'id' in fields && 'slug' in fields) {
      return createSelectChain(mockAvailablePosts);
    }
    // Default to available posts
    return createSelectChain(mockAvailablePosts);
  });

  return {
    mockDb: {
      query: {
        post: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'post-1',
            title: 'Test Post',
            slug: 'test-post',
            createdAt: new Date(),
            updatedAt: new Date(),
            readingTimeSeconds: 300,
            tags: [{ tag: 'test' }, { tag: 'vitest' }],
          } satisfies Partial<Post> & { tags: { tag: string }[] }),
        },
      },
      select: selectMock,
    },
  };
});

// Mocking the database
vi.mock('$lib/server/db', () => ({
  db: mockDb,
}));

function getFakeUrl(q?: string, pageNum = 1) {
  const params = new URLSearchParams();
  if (typeof q === 'string' && q.length > 0) {
    params.set('q', q);
  }
  params.set('page', pageNum.toString());

  return new URL(`http://localhost/admin/posts/test-post?${params.toString()}`);
}

describe('/admin/posts/[slug]/+page.svelte', () => {
  it('renders page heading', async () => {
    // @ts-expect-error Partial event object for testing
    const props = await load({
      url: getFakeUrl(),
      params: {
        slug: 'test-post',
      },
    });

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

    const heading = page.getByRole('heading', { level: 2, name: 'Test Post' });

    await expect.element(heading).toBeInTheDocument();
  });

  it('renders the action message', async () => {
    // @ts-expect-error Partial event object for testing
    const props = await load({
      url: getFakeUrl(),
      params: {
        slug: 'test-post',
      },
    });

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

    await expect.element(messageElement).toBeInTheDocument();
  });

  it('renders related posts section', async () => {
    // @ts-expect-error Partial event object for testing
    const props = await load({
      url: getFakeUrl(),
      params: {
        slug: 'test-post',
      },
    });

    render(Page, {
      props: {
        data: {
          ...props,
          // @ts-expect-error Partial data props
          meta: { title: props.post?.title ?? '', slug: props.slug ?? '' },
          Content: 'This is a test post content.',
        },
      },
    });

    const relatedPostsHeading = page.getByRole('heading', { level: 3, name: 'Related Posts' });
    await expect.element(relatedPostsHeading).toBeInTheDocument();
  });

  it('renders available posts for selection', async () => {
    // @ts-expect-error Partial event object for testing
    const props = await load({
      url: getFakeUrl(),
      params: {
        slug: 'test-post',
      },
    });

    render(Page, {
      props: {
        data: {
          ...props,
          // @ts-expect-error Partial data props
          meta: { title: props.post?.title ?? '', slug: props.slug ?? '' },
          Content: 'This is a test post content.',
        },
      },
    });

    const availablePost1 = page.getByRole('button', { name: 'Available Post 1' });
    const availablePost2 = page.getByRole('button', { name: 'Available Post 2' });

    await expect.element(availablePost1).toBeInTheDocument();
    await expect.element(availablePost2).toBeInTheDocument();
  });
});
