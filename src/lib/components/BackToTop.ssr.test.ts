import { render } from 'svelte/server';
import { describe, expect, test } from 'vitest';
import BackToTop from './BackToTop.svelte';

describe('BackToTop', () => {
  test('renders correctly', async () => {
    const { body } = await render(BackToTop);

    expect(body).toContain('Back to top');
    expect(body).toContain('aria-label="Back to top"');
  });

  test('renders with initial hidden state', () => {
    const { body } = render(BackToTop);

    // Should have hide-button class initially
    expect(body).toContain('hide-button');
    expect(body).not.toContain('show-button');
  });

  test('renders as a button element', () => {
    const { body } = render(BackToTop);

    expect(body).toContain('<button');
    expect(body).toContain('</button>');
  });
});
