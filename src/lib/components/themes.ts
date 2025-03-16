export const themes = [
  'catppuccin',
  'cerberus',
  'concord',
  'crimson',
  'fennec',
  'hamlindigo',
  'legacy',
  'mint',
  'modern',
  'mona',
  'nosh',
  'nouveau',
  'pine',
  'reign',
  'rocket',
  'rose',
  'sahara',
  'seafoam',
  'terminus',
  'vintage',
  'wintry',
] as const;

export type Theme = (typeof themes)[number];

export function isValidTheme(theme: unknown): theme is Theme {
  return typeof theme === 'string' && themes.includes(theme as Theme);
}

export type ThemeMode = 'light' | 'dark';

export function isValidMode(mode: unknown): mode is 'light' | 'dark' {
  return (typeof mode === 'string' && mode === 'light') || mode === 'dark';
}
