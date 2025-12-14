import { page } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
  test('should render heading', async () => {
    render(Page);

    const heading = page.getByRole('heading', {
      level: 3,
    });

    await expect.element(heading).toBeInTheDocument();
  });
});
