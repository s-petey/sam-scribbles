import { describe, test, expect } from 'vitest';
import LinkWithIcon from './LinkWithIcon.svelte';
import { render } from 'svelte/server';

describe('LinkWithIcon SSR', () => {
  test('renders correctly for YouTube', () => {
    const { body } = render(LinkWithIcon, {
      props: {
        link: {
          link: 'https://youtube.com/watch?v=abc',
          shortId: 'yt1',
        },
      },
    });
    expect(body).toContain('https://youtube.com/watch?v=abc');
    expect(body).toContain('<svg'); // Should contain YouTube icon SVG
  });

  test('renders correctly for Vimeo', () => {
    const { body } = render(LinkWithIcon, {
      props: {
        link: {
          link: 'https://vimeo.com/123',
          shortId: 'vm1',
        },
      },
    });
    expect(body).toContain('https://vimeo.com/123');
    expect(body).toContain('<svg'); // Should contain Vimeo icon SVG
  });

  test('renders correctly for other links', () => {
    const { body } = render(LinkWithIcon, {
      props: {
        link: {
          link: 'https://example.com',
          shortId: 'ex1',
        },
      },
    });
    expect(body).toContain('https://example.com');
    expect(body).toContain('<svg'); // Should contain Example icon SVG
  });
});
