import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Without this handler a transient DB disconnect (e.g. Replit control-plane
// maintenance) emits an unhandled 'error' event which crashes the Node process.
pool.on("error", (err) => {
  console.error("[db] idle client error — will reconnect on next query:", err.message);
});

export const db = drizzle(pool, { schema });

export * from "./schema";
