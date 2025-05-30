import { route } from './ROUTES';
import SimpleIconsGithub from '~icons/simple-icons/github';
import SimpleIconsBluesky from '~icons/simple-icons/bluesky';

export type Link = {
  href: string;
  label: string;
  icon?: string; // TODO: Icon string / url / Component?
};

// Exporting them all as individual things for bundler help

// TODO: Update links
export const admin = {
  'Admin Panel': { href: route('/admin'), label: 'Admin panel' },
  'Admin Links': { href: route('/admin/links'), label: 'Admin Links' },
  'Admin Posts': { href: route('/admin/posts'), label: 'Admin Posts' },
} as const;

export const core = {
  // Warning, order matters in these arrays!
  Home: { href: route('/'), label: 'Home' },
  Posts: { href: route('/posts'), label: 'Posts' },
  About: { href: route('/about'), label: 'About' },
  Socials: { href: route('/social'), label: 'Socials' },
  Tags: { href: route('/tags'), label: 'Tags' },
  Games: { href: route('/games'), label: 'Games' },
  // { href: 'https://bsky.app/profile/skeletonlabs.bsky.social', label: 'News', target: '_blank' }
  // { href: '/news', label: 'News', target: '_self' },
  // { href: 'https://themes.skeleton.dev/', label: 'Themes', target: '_blank' }
} as const;

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

export const adminLinks = Object.values(admin);
export const coreLinks = Object.values(core);
export const socialLinks = Object.values(social);
