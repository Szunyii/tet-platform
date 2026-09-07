import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import * as schema from './schema';

// A turbopackIgnore megakadályozza, hogy a Next a dinamikus útvonal miatt az egész
// projektet a szerverbundle-be nyomkövesse.
const DB_PATH = resolve(
  /* turbopackIgnore: true */ process.cwd(),
  process.env.DATABASE_URL ?? './data/tet.db',
);

function createDb() {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  return drizzle(sqlite, { schema });
}

// Dev módban a Next HMR újratölti a modult; a globalThis cache megakadályozza,
// hogy minden reloadnál új kapcsolat nyíljon.
const globalForDb = globalThis as unknown as { __tetDb?: ReturnType<typeof createDb> };

export const db = globalForDb.__tetDb ?? createDb();
if (process.env.NODE_ENV !== 'production') globalForDb.__tetDb = db;

export type Db = typeof db;
