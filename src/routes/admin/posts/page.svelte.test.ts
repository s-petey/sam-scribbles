import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { load } from './+page.server';

const { findManyPosts } = vi.hoisted(() => ({
  findManyPosts: vi.fn().mockResolvedValue([]),
}));

// Mocking the database and session
vi.mock('$lib/server/db', () => ({
  db: {
    query: {
      post: {
        findMany: findManyPosts,
      },
    },
  },
}));

describe('/+page.svelte', () => {
  it('renders sync button', async () => {
    const props = await load();
    render(Page, {
      props: {
        // @ts-expect-error Partial data props
        data: props,
      },
    });

    const syncButton = page.getByRole('button', { name: 'Sync Posts' });

    await expect.element(syncButton).toBeInTheDocument();
  });

  it('renders error message if it exists', async () => {
    const props = await load();
    render(Page, {
      props: {
        // @ts-expect-error Partial data props
        data: {
          ...props,
          form: {
            ...props.form,
            message: {
              updated: 3,
              created: 5,
            },
          },
        },
      },
    });

    const createdMessage = page.getByText('Created amount: 5');
    const updatedMessage = page.getByText('Updated amount: 3');

    await expect.element(createdMessage).toBeInTheDocument();
    await expect.element(updatedMessage).toBeInTheDocument();
  });

  it('renders a link to the post if a post exists', async () => {
    const mockPost = {
      id: '1',
      title: 'Test Post',
      slug: 'test-post',
    };
    findManyPosts.mockResolvedValueOnce([mockPost]);

    const props = await load();
    render(Page, {
      props: {
        // @ts-expect-error Partial data props
        data: props,
      },
    });

    const postLink = page.getByRole('link', { name: mockPost.title });

    await expect.element(postLink).toBeInTheDocument();
    await expect(postLink).toHaveAttribute('href', `/admin/posts/${mockPost.slug}`);
  });

  it('renders error message if errors?.slug contains the post slug', async () => {
    const mockPost = {
      id: '1',
      title: 'Test Post',
      slug: 'test-post',
    };

    findManyPosts.mockResolvedValueOnce([mockPost]);

    const props = await load();
    render(Page, {
      props: {
        // @ts-expect-error Partial data props
        data: {
          ...props,
          deleteForm: {
            ...props.deleteForm,
            errors: {
              slug: ['test-post'],
            },
          },
        },
      },
    });

    const errorMessage = page.getByText('There is still a markdown file for this!!!');

    await expect.element(errorMessage).toBeInTheDocument();
  });
});
