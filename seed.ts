/* eslint-disable @typescript-eslint/no-non-null-assertion */
// @ts-check
import { drizzle } from 'drizzle-orm/node-postgres';
import { seed } from 'drizzle-seed';
import * as schema from './src/lib/server/db/schema';

const URL = process.env.DATABASE_URL;

if (typeof URL !== 'string' || URL.length === 0) {
  throw new Error('DATABASE_URL is not set');
}

if (!URL.includes('localhost')) {
  throw new Error('Seeding is only allowed on local databases');
}

const RANDOM_PROGRAMMING_TAGS = [
  'javascript',
  'typescript',
  'svelte',
  'sveltekit',
  'nodejs',
  'postgresql',
  'drizzle-orm',
  'webdev',
  'frontend',
  'backend',
];

const {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- picking value off...
  user: _user,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- picking value off...
  account: _account,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- picking value off...
  userLink: _userLink,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- picking value off...
  session: _session,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- picking value off...
  verification: _verification,
  ...partialSchema
} = schema;

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  await seed(db, partialSchema).refine((f) => ({
    tag: {
      columns: {
        name: f.valuesFromArray({ values: RANDOM_PROGRAMMING_TAGS, isUnique: true }),
      },
    },
  }));
}

main()
  .then(() => {
    console.log('🌱 Seeding complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
