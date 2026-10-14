// Crea (o rota) el usuario de base de datos de la web con permisos mínimos y devuelve su URL por stdout.
// La web solo puede leer/insertar/actualizar; no puede borrar datos ni cambiar el esquema.
// Uso: node --env-file=.env.local scripts/app-role.mjs  (con el usuario propietario en DATABASE_URL_UNPOOLED)
import { randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const owner = neon(process.env.DATABASE_URL_UNPOOLED);
const password = randomBytes(24).toString("base64url");
const [{ exists }] = await owner`select exists(select 1 from pg_roles where rolname = 'agora_app') as exists`;
await owner.query(exists ? `alter role agora_app with login password '${password}'` : `create role agora_app with login password '${password}'`);
await owner.query(`grant usage on schema public to agora_app`);
await owner.query(`revoke all on all tables in schema public from agora_app`);
await owner.query(`grant select, insert, update on all tables in schema public to agora_app`);
await owner.query(`grant usage, select on all sequences in schema public to agora_app`);
// Única excepción de borrado: la tabla de límites de peticiones, que se purga sola.
await owner.query(`grant delete on rate_limits to agora_app`);
await owner.query(`alter default privileges in schema public grant select, insert, update on tables to agora_app`);
await owner.query(`alter default privileges in schema public grant usage, select on sequences to agora_app`);

const url = new URL(process.env.DATABASE_URL);
url.username = "agora_app";
url.password = password;
process.stdout.write(url.toString());
