import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    theme: locals.theme,
    user: locals.session.user,
    session: locals.session.session,
  };
};
