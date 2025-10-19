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
      createdAt: new Date(),
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
      createdAt: new Date(),
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

  it('renders sync form errors if allSyncErrors exist', async () => {
    const props = await load();
    render(Page, {
      props: {
        // @ts-expect-error Partial data props
        data: {
          ...props,
          form: {
            ...props.form,
            errors: {
              '': ['Sync error 1', 'Sync error 2'],
            },
          },
        },
      },
    });

    const errorList = page.getByRole('list');
    const errorPre1 = page.getByText('Sync error 1');
    const errorPre2 = page.getByText('Sync error 2');

    await expect.element(errorList).toBeInTheDocument();
    await expect((await page.getByRole('listitem').all()).length).toBe(1); // One li for the '' path
    await expect.element(errorPre1).toBeInTheDocument();
    await expect.element(errorPre2).toBeInTheDocument();
  });

  it('renders NEW badge for posts created within 31 days', async () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 10); // 10 days ago
    const mockPost = {
      id: '1',
      title: 'Recent Post',
      slug: 'recent-post',
      createdAt: recentDate,
    };
    findManyPosts.mockResolvedValueOnce([mockPost]);

    const props = await load();
    render(Page, {
      props: {
        // @ts-expect-error Partial data props
        data: props,
      },
    });

    await expect((await page.getByText('NEW').all()).length).toBe(1);
    const postLink = page.getByRole('link', { name: mockPost.title });
    await expect(postLink).toHaveClass('col-span-3');
  });

  it('does not render NEW badge for posts older than 31 days', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 40); // 40 days ago
    const mockPost = {
      id: '1',
      title: 'Old Post',
      slug: 'old-post',
      createdAt: oldDate,
    };
    findManyPosts.mockResolvedValueOnce([mockPost]);

    const props = await load();
    render(Page, {
      props: {
        // @ts-expect-error Partial data props
        data: props,
      },
    });

    await expect((await page.getByText('NEW').all()).length).toBe(0);
    const postLink = page.getByRole('link', { name: mockPost.title });
    await expect(postLink).toHaveClass('col-span-4');
  });

  it('renders delete button with correct attributes', async () => {
    const mockPost = {
      id: '1',
      title: 'Test Post',
      slug: 'test-post',
      createdAt: new Date(),
    };
    findManyPosts.mockResolvedValueOnce([mockPost]);

    const props = await load();
    render(Page, {
      props: {
        // @ts-expect-error Partial data props
        data: props,
      },
    });

    const deleteButton = page.getByRole('button').nth(1); // Assuming sync button is first

    await expect.element(deleteButton).toBeInTheDocument();
    await expect(deleteButton).toHaveAttribute('type', 'submit');
    await expect(deleteButton).toHaveAttribute('name', 'slug');
    await expect(deleteButton).toHaveAttribute('value', mockPost.slug);
  });
});
