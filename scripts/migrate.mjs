// Aplica db/schema.sql (idempotente) y sincroniza medios y voces desde el código.
// Uso: node --env-file=.env.local scripts/migrate.mjs
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL);
const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8")
  .replace(/--.*$/gm, "")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const stmt of schema) await sql.query(stmt);
const tables = await sql`select table_name from information_schema.tables where table_schema = 'public' order by 1`;
console.log(`Esquema aplicado: ${schema.length} sentencias · tablas: ${tables.map((t) => t.table_name).join(", ")}`);
