import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pg from "pg";
import "dotenv/config";

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDirectory = path.resolve(__dirname, "../../database/migrations");
const migrationFilenamePattern = /^\d{4}_[a-z0-9_]+\.sql$/;
const migrationLockId = 3402026;

export async function runMigrations(options = {}) {
  const databaseUrl = options.databaseUrl || process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run database migrations.");
  }

  const client =
    options.client ||
    new Client({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });
  const ownsClient = !options.client;

  if (ownsClient) {
    await client.connect();
  }

  try {
    await client.query("SELECT pg_advisory_lock($1)", [migrationLockId]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const filenames = (await readdir(migrationsDirectory))
      .filter((filename) => migrationFilenamePattern.test(filename))
      .sort();
    const appliedResult = await client.query("SELECT filename FROM schema_migrations");
    const appliedFilenames = new Set(appliedResult.rows.map((row) => row.filename));

    for (const filename of filenames) {
      if (appliedFilenames.has(filename)) {
        continue;
      }

      const sql = await readFile(path.join(migrationsDirectory, filename), "utf8");
      await client.query("BEGIN");

      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [filename]);
        await client.query("COMMIT");
        console.log(`Applied database/migrations/${filename}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [migrationLockId]).catch(() => {});

    if (ownsClient) {
      await client.end();
    }
  }
}

if (process.argv[1] === __filename) {
  await runMigrations();
}
