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
  user: _user,
  account: _account,
  userLink: _userLink,
  session: _session,
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
