import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';
import { Pool } from 'pg';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle({ client: pool, schema });

// TODO: CORS
