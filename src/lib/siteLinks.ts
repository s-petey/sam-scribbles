export type Link = {
  href: string;
  label: string;
  icon?: string; // TODO: Icon string / url / Component?
};

// Exporting them all as individual things for bundler help

// TODO: Update links
export const admin = {
  'Admin Panel': { href: '/admin', label: 'Admin panel' },
  'Admin Links': { href: '/admin/links', label: 'Admin Links' },
  'Admin Posts': { href: '/admin/posts', label: 'Admin Posts' },
} as const;

export const core = {
  // Warning, order matters in these arrays!
  Home: { href: '/', label: 'Home' },
  Posts: { href: '/posts', label: 'Posts' },
  About: { href: '/about', label: 'About' },
  Socials: { href: '/social', label: 'Socials' },
  Tags: { href: '/tags', label: 'Tags' },
  // { href: 'https://bsky.app/profile/skeletonlabs.bsky.social', label: 'News', target: '_blank' }
  // { href: '/news', label: 'News', target: '_self' },
  // { href: 'https://themes.skeleton.dev/', label: 'Themes', target: '_blank' }
} as const;

export const social = {
  GitHub: {
    href: 'https://github.com/s-petey',
    label: 'GitHub',
    // TODO: URL / local icon for this?
    // icon: ''
  },
  Bluesky: {
    href: 'https://bsky.app/profile/s-pete.bsky.social',
    label: 'Bluesky',
    // TODO: URL / local icon for this?
    // icon: ''
  },
} as const;

export const adminLinks = Object.values(admin);
export const coreLinks = Object.values(core);
export const socialLinks = Object.values(social);
