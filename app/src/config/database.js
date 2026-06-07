import pg from "pg";

import { env } from "./env.js";

const { Pool } = pg;
let pool;

export class DatabaseConfigurationError extends Error {
  constructor() {
    super("DATABASE_URL is not configured.");
    this.name = "DatabaseConfigurationError";
  }
}

export function isDatabaseConfigured() {
  return Boolean(env.databaseUrl);
}

export function getPool() {
  if (!isDatabaseConfigured()) {
    throw new DatabaseConfigurationError();
  }

  if (!pool) {
    pool = new Pool({
      connectionString: env.databaseUrl,
      max: 10,
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
    });
  }

  return pool;
}

export function query(text, params = []) {
  return getPool().query(text, params);
}

export async function checkDatabaseConnection() {
  const result = await query("SELECT CURRENT_TIMESTAMP AS checked_at");
  return result.rows[0];
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
