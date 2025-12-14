import { page, userEvent } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { load } from './+page';

vi.mock('./farkleDb.js', () => ({
  db: {
    farkle: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      }),
      put: vi.fn(),
    },
  },
}));

type CastLoadParams = Parameters<typeof load>[0];

describe('/+page.svelte', () => {
  test('renders the heading', async () => {
    const props = await load({ params: { playerCount: '2' } } as CastLoadParams);

    render(Page, {
      props: {
        // @ts-expect-error Partial data props
        data: props,
      },
    });

    const heading = page.getByRole('heading', {
      level: 1,
    });

    await expect.element(heading).toBeInTheDocument();
  });

  test('calculates player sum', async () => {
    const props = await load({ params: { playerCount: '2' } } as CastLoadParams);

    render(Page, {
      props: {
        // @ts-expect-error Partial data props
        data: props,
      },
    });

    const input = page.getByRole('spinbutton', { name: 'row-0-player-1' });

    await expect.element(input).toBeInTheDocument();

    await userEvent.fill(input, '50');
    await userEvent.tab();
    await expect.element(input).toHaveValue(50);

    const sum = page.getByText('Total: 50');
    await expect.element(sum).toBeInTheDocument();

    const input2 = page.getByRole('spinbutton', { name: 'row-1-player-1' });

    await expect.element(input2).toBeInTheDocument();

    await userEvent.fill(input2, '50');
    await userEvent.tab();
    await expect.element(input2).toHaveValue(50);

    const sum2 = page.getByText('Total: 100');

    await expect.element(sum2).toBeInTheDocument();
  });

  test('resets the game', async () => {
    const props = await load({ params: { playerCount: '2' } } as CastLoadParams);

    render(Page, {
      props: {
        // @ts-expect-error Partial data props
        data: props,
      },
    });

    const resetButton = page.getByRole('button', { name: 'Reset Game' });

    await expect.element(resetButton).toBeInTheDocument();

    const input = page.getByRole('spinbutton', { name: 'row-0-player-1' });

    await expect.element(input).toBeInTheDocument();

    await userEvent.fill(input, '50');
    await userEvent.tab();
    await expect.element(input).toHaveValue(50);

    await userEvent.click(resetButton);

    await expect.element(input).not.toHaveValue();
  });

  test('shows scoring rules', async () => {
    const props = await load({ params: { playerCount: '2' } } as CastLoadParams);

    render(Page, {
      props: {
        // @ts-expect-error Partial data props
        data: props,
      },
    });

    const rulesButton = page.getByRole('button', { name: 'Scoring Rules' });

    await expect.element(rulesButton).toBeInTheDocument();

    await userEvent.click(rulesButton);

    const rulesModal = page.getByRole('heading', { level: 4, name: 'Scoring' });

    await expect.element(rulesModal).toBeInTheDocument();

    const closeButton = page.getByRole('button', { name: 'Close' });

    await expect.element(closeButton).toBeInTheDocument();

    await userEvent.click(closeButton);

    await expect.element(rulesModal).not.toBeInTheDocument();
  });
});
