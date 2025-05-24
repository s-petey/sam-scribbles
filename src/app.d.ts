// TODO: can I import types here?
import type { Session } from './lib/auth';
import type { Theme, ThemeMode } from './lib/components/themes';

interface ValidSession {
  user: Session['user']; // import('$lib/auth').Session['user'];
  session: Session['session']; // import('$lib/auth').Session['session'];
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
        theme: Theme; // import('$lib/components/themes').Theme;
        mode: ThemeMode; // import('$lib/components/theme').ThemeMode;
      };
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
