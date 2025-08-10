import { describe, test, expect } from 'vitest';
import LinkWithIcon from './LinkWithIcon.svelte';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';

describe('LinkWithIcon.svelte', () => {
  test('renders YouTube icon for youtube.com links', async () => {
    render(LinkWithIcon, { link: { link: 'https://youtube.com/watch?v=abc', shortId: 'yt1' } });

    await expect(page.getByRole('img')).toHaveAttribute('aria-label', 'YouTube');
    await expect(page.getByTitle(/External link to/)).toHaveAttribute(
      'href',
      'https://youtube.com/watch?v=abc',
    );
    await expect(page.getByText('https://youtube.com/watch?v=abc')).toBeInTheDocument();
    await expect(page.getByRole('img')).toBeInTheDocument(); // Should be YouTube icon
  });

  test('renders Vimeo icon for vimeo.com links', async () => {
    render(LinkWithIcon, { link: { link: 'https://vimeo.com/123', shortId: 'vm1' } });

    await expect(page.getByRole('img')).toHaveAttribute('aria-label', 'Vimeo');
    await expect(page.getByTitle(/External link to/)).toHaveAttribute(
      'href',
      'https://vimeo.com/123',
    );
    await expect(page.getByText('https://vimeo.com/123')).toBeInTheDocument();
    await expect(page.getByRole('img')).toBeInTheDocument(); // Should be Vimeo icon
  });

  test('renders LucideLink icon for other links', async () => {
    render(LinkWithIcon, { link: { link: 'https://example.com', shortId: 'ex1' } });

    // Check if the correct icon is rendered
    await expect(page.getByRole('img')).toHaveAttribute('aria-label', 'External link');
    await expect(page.getByTitle(/External link to/)).toHaveAttribute(
      'href',
      'https://example.com',
    );
    await expect(page.getByText('https://example.com')).toBeInTheDocument();
    await expect(page.getByRole('img')).toBeInTheDocument(); // Should be LucideLink icon
  });
});
