import { logout } from '$lib/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	logout: async (event) => {
		logout(event);
		return { success: true };
	}
};
