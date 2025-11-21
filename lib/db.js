// lib/db.js - tolerant version (temporary)
import pg from "pg";
const { Pool } = pg;

let pool = null;

function ensureDbUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // don't throw here to allow Next dev server to start
    // but later when query() is used we will throw a helpful error
    return null;
  }
  return url;
}

function createPoolIfNeeded() {
  if (pool) return pool;
  const DATABASE_URL = ensureDbUrl();
  if (!DATABASE_URL) return null;

  if (process.env.NODE_ENV === "production") {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  } else {
    // reuse global pool in dev to avoid too many clients
    if (!global.__pgPool) {
      global.__pgPool = new Pool({ connectionString: DATABASE_URL });
    }
    pool = global.__pgPool;
  }
  return pool;
}

export async function query(text, params) {
  const p = createPoolIfNeeded();
  if (!p) {
    throw new Error(
      "DATABASE_URL is not set. Please set DATABASE_URL in your .env.local and restart the dev server."
    );
  }
  return p.query(text, params);
}
