import { page } from '@vitest/browser/context';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PostPage from './+page.svelte';

// Mock the resolve function
vi.mock('$app/paths', () => ({
  resolve: vi.fn((path: string, params: Record<string, string>) =>
    path.replace('[slug]', params.slug),
  ),
}));

describe('Post Page Component', () => {
  const mockPostData = {
    Content: () => 'Test content component',
    meta: {
      title: 'Test Post Title',
      date: new Date('2024-01-01'),
      tags: ['test', 'vitest', 'svelte'],
      reading_time: { text: '5 min read' },
      isPrivate: false,
      updated: undefined,
    },
    relatedPosts: [
      {
        id: 'related-1',
        slug: 'related-post-1',
        title: 'Related Post 1',
        preview: 'This is the preview for related post 1',
        readingTimeSeconds: 240,
        readingTimeWords: 800,
      },
      {
        id: 'related-2',
        slug: 'related-post-2',
        title: 'Related Post 2',
        preview: 'This is the preview for related post 2',
        readingTimeSeconds: 180,
        readingTimeWords: 600,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render post title and content', async () => {
    render(PostPage, {
      // @ts-expect-error Partial data props
      data: mockPostData,
    });

    const title = page.getByText('Test Post Title');
    const readingTime = page.getByText('5 min read');

    await expect.element(title).toBeInTheDocument();
    await expect.element(readingTime).toBeInTheDocument();
  });

  it('should render post tags', async () => {
    render(PostPage, {
      // @ts-expect-error Partial data props
      data: mockPostData,
    });

    const testTag = page.getByRole('link', { name: 'test', exact: true });
    const vitestTag = page.getByRole('link', { name: 'vitest', exact: true });
    const svelteTag = page.getByRole('link', { name: 'svelte' });

    await expect.element(testTag).toBeInTheDocument();
    await expect.element(vitestTag).toBeInTheDocument();
    await expect.element(svelteTag).toBeInTheDocument();
  });

  it('should show private post warning for private posts', async () => {
    const privatePostData = {
      ...mockPostData,
      meta: {
        ...mockPostData.meta,
        isPrivate: true,
      },
    };

    render(PostPage, {
      // @ts-expect-error Partial data props
      data: privatePostData,
    });

    const privateWarning = page.getByText("POST ISN'T PUBLIC YET!");
    await expect.element(privateWarning).toBeInTheDocument();
  });

  it('should render related posts section when posts exist', async () => {
    render(PostPage, {
      // @ts-expect-error Partial data props
      data: mockPostData,
    });

    const relatedPostsHeading = page.getByRole('heading', { name: 'Related Posts' });
    const relatedPost1 = page.getByRole('link', { name: 'Related Post 1' });
    const relatedPost2 = page.getByRole('link', { name: 'Related Post 2' });

    await expect.element(relatedPostsHeading).toBeInTheDocument();
    await expect.element(relatedPost1).toBeInTheDocument();
    await expect.element(relatedPost2).toBeInTheDocument();
  });

  it('should handle posts with no related posts gracefully', async () => {
    const dataWithoutRelatedPosts = {
      ...mockPostData,
      relatedPosts: [],
    };

    render(PostPage, {
      // @ts-expect-error Partial data props
      data: dataWithoutRelatedPosts,
    });

    const title = page.getByText('Test Post Title');
    await expect.element(title).toBeInTheDocument();
  });

  it('should display correct reading time calculations', async () => {
    render(PostPage, {
      // @ts-expect-error Partial data props
      data: mockPostData,
    });

    const mainReadingTime = page.getByText('5 min read');
    const readingTime4Min = page.getByText('4 min read'); // 240s = 4min
    const readingTime3Min = page.getByText('3 min read'); // 180s = 3min

    await expect.element(mainReadingTime).toBeInTheDocument();
    await expect.element(readingTime4Min).toBeInTheDocument();
    await expect.element(readingTime3Min).toBeInTheDocument();
  });

  it('should not show private post warning for public posts', async () => {
    render(PostPage, {
      // @ts-expect-error Partial data props
      data: mockPostData,
    });

    const privateWarning = page.getByText("POST ISN'T PUBLIC YET!");
    await expect.element(privateWarning).not.toBeInTheDocument();
  });

  it('should not render related posts section when no posts exist', async () => {
    const dataWithoutRelatedPosts = {
      ...mockPostData,
      relatedPosts: [],
    };

    render(PostPage, {
      // @ts-expect-error Partial data props
      data: dataWithoutRelatedPosts,
    });

    const relatedPostsHeading = page.getByRole('heading', { name: 'Related Posts' });
    await expect.element(relatedPostsHeading).not.toBeInTheDocument();
  });

  it('should render related post cards with correct information', async () => {
    render(PostPage, {
      // @ts-expect-error Partial data props
      data: mockPostData,
    });

    // Check first related post
    const relatedPost1Title = page.getByRole('heading', { name: 'Related Post 1' });
    const relatedPost1Preview = page.getByText('This is the preview for related post 1');
    const readingTime4Min = page.getByText('4 min read'); // 240 seconds / 60
    const words800 = page.getByText('800 words');

    await expect.element(relatedPost1Title).toBeInTheDocument();
    await expect.element(relatedPost1Preview).toBeInTheDocument();
    await expect.element(readingTime4Min).toBeInTheDocument();
    await expect.element(words800).toBeInTheDocument();

    // Check second related post
    const relatedPost2Title = page.getByRole('heading', { name: 'Related Post 2' });
    const relatedPost2Preview = page.getByText('This is the preview for related post 2');
    const readingTime3Min = page.getByText('3 min read'); // 180 seconds / 60
    const words600 = page.getByText('600 words');

    await expect.element(relatedPost2Title).toBeInTheDocument();
    await expect.element(relatedPost2Preview).toBeInTheDocument();
    await expect.element(readingTime3Min).toBeInTheDocument();
    await expect.element(words600).toBeInTheDocument();
  });

  it('should create correct links for related posts', async () => {
    render(PostPage, {
      // @ts-expect-error Partial data props
      data: mockPostData,
    });

    const relatedPost1Link = page.getByRole('link', { name: /Related Post 1/ });
    const relatedPost2Link = page.getByRole('link', { name: /Related Post 2/ });

    await expect.element(relatedPost1Link).toHaveAttribute('href', '/posts/related-post-1');
    await expect.element(relatedPost2Link).toHaveAttribute('href', '/posts/related-post-2');
  });

  it('should handle posts with no related posts gracefully', async () => {
    const dataWithUndefinedRelatedPosts = {
      ...mockPostData,
      relatedPosts: undefined,
    };

    render(PostPage, {
      // @ts-expect-error Partial data props
      data: dataWithUndefinedRelatedPosts,
    });

    const relatedPostsHeading = page.getByText('Related Posts');
    await expect.element(relatedPostsHeading).not.toBeInTheDocument();
  });

  it('should handle posts with empty tags array', async () => {
    const dataWithNoTags = {
      ...mockPostData,
      meta: {
        ...mockPostData.meta,
        tags: [],
      },
    };

    render(PostPage, {
      // @ts-expect-error Partial data props
      data: dataWithNoTags,
    });

    const title = page.getByText('Test Post Title');
    await expect.element(title).toBeInTheDocument();
  });

  it('should show NEW badge for recent posts', async () => {
    render(PostPage, {
      data: {
        ...mockPostData,
        // @ts-expect-error Partial data props
        meta: {
          ...mockPostData.meta,
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        },
      },
    });

    const newBadge = page.getByTestId('new_badge');
    await expect.element(newBadge).toBeInTheDocument();
  });

  it('should not show NEW badge for old posts', async () => {
    render(PostPage, {
      // @ts-expect-error Partial data props
      data: mockPostData,
    });

    const newBadge = page.getByTestId('new_badge').all();
    await expect(newBadge).toHaveLength(0);
  });
});
