import type { RouteId } from '$app/types';
import SimpleIconsBluesky from '~icons/simple-icons/bluesky';
import SimpleIconsGithub from '~icons/simple-icons/github';

export type Link = {
  href: RouteId;
  label: string;
  icon?: string; // TODO: Icon string / url / Component?
};

// Exporting them all as individual things for bundler help

// TODO: Update links
export const admin = {
  'Admin Panel': { href: '/admin', label: 'Admin panel' },
  'Admin Links': { href: '/admin/links', label: 'Admin Links' },
  'Admin Posts': { href: '/admin/posts', label: 'Admin Posts' },
} as const satisfies Record<string, Link>;

export const core = {
  // Warning, order matters in these arrays!
  Home: { href: '/', label: 'Home' },
  Posts: { href: '/posts', label: 'Posts' },
  Links: { href: '/links', label: 'Links' },
  About: { href: '/about', label: 'About' },
  Socials: { href: '/social', label: 'Socials' },
  Tags: { href: '/tags', label: 'Tags' },
  Games: { href: '/games', label: 'Games' },
  // { href: 'https://bsky.app/profile/skeletonlabs.bsky.social', label: 'News', target: '_blank' }
  // { href: '/news', label: 'News', target: '_self' },
  // { href: 'https://themes.skeleton.dev/', label: 'Themes', target: '_blank' }
} as const satisfies Record<string, Link>;

export const social = {
  GitHub: {
    href: 'https://github.com/s-petey',
    label: 'GitHub',
    icon: SimpleIconsGithub,
  },
  Bluesky: {
    href: 'https://bsky.app/profile/s-pete.bsky.social',
    label: 'Bluesky',
    icon: SimpleIconsBluesky,
  },
} as const;

export const games = {
  Farkle: { href: '/games/farkle', label: 'Farkle' },
} as const satisfies Record<string, Link>;

export const adminLinks = Object.values(admin);
export const coreLinks = Object.values(core);
export const socialLinks = Object.values(social);
export const gamesLinks = Object.values(games);
