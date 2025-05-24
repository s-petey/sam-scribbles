import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
  return {
    theme: locals.theme,
    user: locals.session.user,
    session: locals.session.session,
  };
};
