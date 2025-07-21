import { drizzle } from 'drizzle-orm/node-postgres';
import { DATABASE_URL } from '$env/static/private';
import * as schema from './schema';
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: DATABASE_URL,
});

export const db = drizzle({ client: pool, schema });

// TODO: CORS
