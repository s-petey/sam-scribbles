import { error } from '@sveltejs/kit';
import { db, type FarkleGame } from './farkleDb.js';

export const csr = true;
export const ssr = false;

export const load = async ({ params: { playerCount } }) => {
  const countAsInt = Number(playerCount);

  if (Number.isNaN(countAsInt)) {
    error(400, 'Invalid player count');
  }

  // Check if existing game
  const game = await db.farkle.where('id').equals(countAsInt).first();

  if (game) {
    const startingRows = Object.entries(game.scores[0]).length;

    return {
      names: game.playerNames,
      playerCount: countAsInt,
      scores: game.scores,
      startingRows,
    };
  }

  const startingRows = 4;

  const scores: FarkleGame['scores'] = Object.fromEntries(
    Array.from({ length: countAsInt }).map((_, i) => [
      i,
      Object.fromEntries(Array.from({ length: startingRows }).map((_, j) => [j, 0])),
    ]),
  );

  return {
    names: Array.from({ length: countAsInt }).map((_, i) => `Player ${i + 1}`),
    playerCount: countAsInt,
    scores,
    startingRows,
  };
};
