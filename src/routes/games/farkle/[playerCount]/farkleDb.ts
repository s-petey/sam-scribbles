import Dexie, { type EntityTable } from 'dexie';

interface FarkleGame {
  id: number;
  playerNames: string[];
  scores: Record<number, Record<number, number>>;
}

const db = new Dexie('farkle') as Dexie & {
  farkle: EntityTable<FarkleGame, 'id'>;
};

db.version(1).stores({
  farkle: '++id',
});

export { db, type FarkleGame };
