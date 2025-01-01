import { error } from '@sveltejs/kit';

export const csr = true;
export const ssr = false;

export const load = async ({ params: { playerCount } }) => {
  const countAsInt = Number(playerCount);

  if (Number.isNaN(countAsInt)) {
    throw error(400, 'Invalid player count');
  }

  return {
    playerCount: countAsInt,
    startingRows: 10,
  };
};
