import { Pool } from 'pg';
import { config } from './config';

export const createPool = (): Pool => {
  return new Pool({
    connectionString: config.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
};
