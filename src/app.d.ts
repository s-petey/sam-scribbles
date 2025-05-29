/// <reference types="unplugin-icons/types/svelte" />
// Search Icons here... https://icon-sets.iconify.design/simple-icons/?keyword=simple-

import type { Session } from './lib/auth';
import type { Theme, ThemeMode } from './lib/components/themes';

interface ValidSession {
  user: Session['user'];
  session: Session['session'];
}

interface InvalidSession {
  user: null;
  session: null;
}

// See https://svelte.dev/docs/kit/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session: ValidSession | InvalidSession;
      theme: {
        theme: Theme;
        mode: ThemeMode;
      };
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
