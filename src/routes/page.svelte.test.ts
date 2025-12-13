import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
  it('should render content', async () => {
    render(Page);

    const firstParagraph = page.getByText(
      'A place for finding and sharing things Sam finds interesting.',
    );

    await expect.element(firstParagraph).toBeInTheDocument();
  });
});
