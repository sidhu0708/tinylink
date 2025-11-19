// src/lib/db.js
import pkg from 'pg';
const { Pool } = pkg;
import process from 'process';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required in env');

const max = parseInt(process.env.PG_MAX_CLIENTS || '6', 10);

export const pool = new Pool({
  connectionString,
  max
});

// Helper to query
export async function query(text, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}
