import { page } from '@vitest/browser/context';
import { flushSync } from 'svelte';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import BackToTop from './BackToTop.svelte';

describe('BackToTop', () => {
  let originalScrollTo: typeof window.scrollTo;
  let mockScrollTo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock window.scrollTo
    originalScrollTo = window.scrollTo;
    mockScrollTo = vi.fn();
    window.scrollTo = mockScrollTo;

    // Reset scroll position
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });
  });

  afterEach(() => {
    window.scrollTo = originalScrollTo;
    vi.restoreAllMocks();
  });

  it('renders correctly with initial state', async () => {
    await render(BackToTop);
    const button = page.getByLabelText('Back to top');

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Back to top');
    expect(button).toHaveClass('hide-button');
    expect(button).not.toHaveClass('show-button');
  });

  it('shows button when user scrolls down', async () => {
    await render(BackToTop);
    const button = page.getByLabelText('Back to top');

    // Initially hidden
    expect(button).toHaveClass('hide-button');
    expect(button).not.toHaveClass('show-button');

    // Simulate scrolling down
    Object.defineProperty(window, 'scrollY', {
      value: 100,
      writable: true,
    });

    // Trigger scroll event
    window.dispatchEvent(new Event('scroll'));
    flushSync();

    expect(button).toHaveClass('show-button');
    expect(button).not.toHaveClass('hide-button');
  });

  it('hides button when user scrolls back to top', async () => {
    await render(BackToTop);
    const button = page.getByLabelText('Back to top');

    // Start with scrolled position
    Object.defineProperty(window, 'scrollY', {
      value: 100,
      writable: true,
    });
    window.dispatchEvent(new Event('scroll'));
    flushSync();

    expect(button).toHaveClass('show-button');

    // Scroll back to top
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });
    window.dispatchEvent(new Event('scroll'));
    flushSync();

    expect(button).toHaveClass('hide-button');
    expect(button).not.toHaveClass('show-button');
  });

  it('button click scrolls to top smoothly', { retry: 3, timeout: 5000 }, async () => {
    await render(BackToTop);
    const button = page.getByLabelText('Back to top');

    // Simulate being scrolled down
    Object.defineProperty(window, 'scrollY', {
      value: 500,
      writable: true,
    });
    window.dispatchEvent(new Event('scroll'));
    flushSync();

    // Click the button
    await button.click();

    expect(mockScrollTo).toHaveBeenCalledOnce();
    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('button visibility toggles correctly at scroll threshold', async () => {
    await render(BackToTop);
    const button = page.getByLabelText('Back to top');

    // Test exactly at scroll position 1 (just above threshold)
    Object.defineProperty(window, 'scrollY', {
      value: 1,
      writable: true,
    });
    window.dispatchEvent(new Event('scroll'));
    flushSync();

    expect(button).toHaveClass('show-button');
    expect(button).not.toHaveClass('hide-button');

    // Test at scroll position 0 (at threshold)
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });
    window.dispatchEvent(new Event('scroll'));
    flushSync();

    expect(button).toHaveClass('hide-button');
    expect(button).not.toHaveClass('show-button');
  });

  it('multiple scroll events work correctly', async () => {
    await render(BackToTop);
    const button = page.getByLabelText('Back to top');

    // Scroll down multiple times
    const scrollPositions = [50, 100, 200, 0, 150, 0];

    for (const position of scrollPositions) {
      Object.defineProperty(window, 'scrollY', {
        value: position,
        writable: true,
      });
      window.dispatchEvent(new Event('scroll'));
      flushSync();

      if (position > 0) {
        expect(button).toHaveClass('show-button');
        expect(button).not.toHaveClass('hide-button');
      } else {
        expect(button).toHaveClass('hide-button');
        expect(button).not.toHaveClass('show-button');
      }
    }
  });

  it('button has correct CSS classes and attributes', async () => {
    await render(BackToTop);
    const button = page.getByLabelText('Back to top');

    expect(button).toHaveClass('back-to-top-button');
    expect(button).toHaveClass('btn');
    expect(button).toHaveClass('preset-filled-surface-800-200');
    expect(button).toHaveClass('z-10');
    expect(button).toHaveAttribute('aria-label', 'Back to top');
  });

  it(
    'does not allow interaction when hidden',
    {
      retry: 3,
      timeout: 5000,
    },
    async () => {
      await render(BackToTop);
      const button = page.getByLabelText('Back to top');

      // Button should be hidden initially
      expect(button).toHaveClass('hide-button');

      await button.click({ force: true });

      expect(mockScrollTo).not.toHaveBeenCalled();
    },
  );
});
