import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

/**
 * Lazily initialize the database connection.
 *
 * The pool is created once on first access, not at import time.
 * This allows modules to import `db` during build (static generation)
 * without requiring DATABASE_URL to be set.
 *
 * If DATABASE_URL is missing at runtime, getDb() will throw a clear error.
 */
let _db: ReturnType<typeof initDb> | null = null;

function initDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not defined. " +
        "Set it in your .env file or environment variables.",
    );
  }

  const connection = mysql.createPool(process.env.DATABASE_URL);
  return drizzle(connection, { schema, mode: "default" });
}

/**
 * Get the database instance, creating it on first call.
 * Use this in pages that might be statically generated at build time.
 */
export function getDb() {
  if (!_db) {
    _db = initDb();
  }
  return _db;
}

/**
 * Convenience proxy — behaves like the drizzle db object
 * but only initializes the connection on first property access.
 * Safe to import at the top level even without DATABASE_URL.
 */
const db = new Proxy(
  {} as ReturnType<typeof getDb>,
  {
    get(_, prop: keyof ReturnType<typeof getDb>) {
      return getDb()[prop];
    },
  },
);

export { db };
