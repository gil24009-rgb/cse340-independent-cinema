import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pg from "pg";

import { runMigrations } from "./run-migrations.js";

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repositoryRoot = path.resolve(__dirname, "../..");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to initialize the database.");
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

try {
  await client.connect();
  const existingSchema = await client.query(
    "SELECT TO_REGCLASS('public.users') AS users_table",
  );

  if (existingSchema.rows[0].users_table) {
    console.log("Database schema already exists. Initialization skipped.");
  } else {
    for (const filename of ["schema.sql", "seed.sql"]) {
      const sql = await readFile(path.join(repositoryRoot, "database", filename), "utf8");
      await client.query(sql);
      console.log(`Applied database/${filename}`);
    }
  }

  await runMigrations({ client });
} finally {
  await client.end();
}
