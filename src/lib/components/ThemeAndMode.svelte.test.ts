import { page, userEvent } from '@vitest/browser/context';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ThemeAndMode from './ThemeAndMode.svelte';
import { themes } from './themes';

// Mock page state
vi.mock('$app/state', () => ({
  page: {
    url: {
      pathname: '/test-path',
    },
  },
}));

describe('ThemeAndMode', () => {
  let mockSetAttribute: ReturnType<typeof vi.fn>;
  let mockClassListToggle: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock document.documentElement methods
    mockSetAttribute = vi.fn();
    mockClassListToggle = vi.fn();

    Object.defineProperty(document.documentElement, 'setAttribute', {
      value: mockSetAttribute,
      writable: true,
    });

    Object.defineProperty(document.documentElement, 'classList', {
      value: { toggle: mockClassListToggle },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders with default theme and mode', async () => {
    await render(ThemeAndMode, {
      currentTheme: 'catppuccin',
      currentThemeMode: 'light',
    });

    const combobox = page.getByRole('combobox');
    const modeButton = page.getByRole('button', { name: 'Mode toggle' });

    expect(combobox).toBeInTheDocument();
    expect(modeButton).toBeInTheDocument();
  });

  test('displays sun icon when in light mode', async () => {
    await render(ThemeAndMode, {
      currentTheme: 'catppuccin',
      currentThemeMode: 'light',
    });

    const sunButton = page.getByRole('button', { name: 'Mode toggle' });
    expect(sunButton).toBeInTheDocument();
    expect(sunButton).toHaveAttribute('formaction', expect.stringContaining('themeMode=dark'));
  });

  test('displays moon icon when in dark mode', async () => {
    await render(ThemeAndMode, {
      currentTheme: 'catppuccin',
      currentThemeMode: 'dark',
    });

    const moonButton = page.getByRole('button', { name: 'Mode toggle' });
    expect(moonButton).toBeInTheDocument();
    expect(moonButton).toHaveAttribute('formaction', expect.stringContaining('themeMode=light'));
  });

  test(
    'combobox contains all available themes',
    {
      timeout: 5000,
    },
    async () => {
      await render(ThemeAndMode, {
        currentTheme: 'catppuccin',
        currentThemeMode: 'light',
      });

      const combobox = page.getByRole('button', { name: 'Toggle suggestions' });
      await userEvent.click(combobox);

      const options = page.getByRole('option', { includeHidden: true }).all();
      await expect(options).toHaveLength(themes.length);
    },
  );

  test('theme buttons have correct formaction URLs', async () => {
    await render(ThemeAndMode, {
      currentTheme: 'catppuccin',
      currentThemeMode: 'light',
    });

    const combobox = page.getByRole('button', { name: 'Toggle suggestions' });
    await userEvent.click(combobox);

    const themeButton = page.getByRole('button', { includeHidden: true, name: 'modern' });
    expect(themeButton).toHaveAttribute('formaction', expect.stringContaining('theme=modern'));
  });

  test('mode toggle button changes based on current mode', async () => {
    await render(ThemeAndMode, {
      currentTheme: 'catppuccin',
      currentThemeMode: 'light',
    });

    const darkButton = page.getByRole('button', { name: 'Dark mode toggle' });
    await expect(darkButton).toHaveAttribute('aria-label', 'Dark mode toggle');

    await userEvent.click(darkButton);

    const lightButton = page.getByRole('button', { name: 'Light mode toggle' });
    await expect(lightButton).toBeInTheDocument();
  });

  test.each(['modern', 'vintage', 'rocket'] as const)(
    'renders with theme %s props',
    async (theme) => {
      await render(ThemeAndMode, {
        currentTheme: theme,
        currentThemeMode: 'light',
      });

      const combobox = page.getByRole('combobox').first();
      await expect(combobox).toBeInTheDocument();
      await expect(combobox).toHaveValue(theme);
    },
  );

  test('combobox has correct accessibility attributes', async () => {
    await render(ThemeAndMode, {
      currentTheme: 'catppuccin',
      currentThemeMode: 'light',
    });

    const combobox = page.getByRole('combobox');
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveAttribute('placeholder', 'Select a theme');
  });

  test('mode buttons have correct type attribute', async () => {
    await render(ThemeAndMode, {
      currentTheme: 'catppuccin',
      currentThemeMode: 'light',
    });

    const modeButton = page.getByRole('button', { name: 'Mode toggle' });
    expect(modeButton).toHaveAttribute('type', 'submit');
  });

  test.each([themes[0], themes[themes.length - 1]])(
    'handles edge case themes %s correctly',
    async (theme) => {
      await render(ThemeAndMode, {
        currentTheme: theme,
        currentThemeMode: 'dark',
      });

      const combobox = page.getByRole('combobox').first();
      const lightButton = page.getByRole('button', { name: 'Light mode toggle' });
      await expect(lightButton).toHaveAttribute('aria-label', 'Light mode toggle');

      await expect(combobox).toBeInTheDocument();
      await expect(combobox).toHaveValue(theme);
      await expect(lightButton).toBeInTheDocument();
    },
  );
});
