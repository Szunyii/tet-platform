import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import * as schema from './schema';

// A turbopackIgnore megakadályozza, hogy a Next a dinamikus útvonal miatt az egész
// projektet a szerverbundle-be nyomkövesse.
const DB_PATH = resolve(
  /* turbopackIgnore: true */ process.cwd(),
  process.env.DATABASE_URL ?? './data/tet.db',
);

function createDb() {
  const letezett = existsSync(DB_PATH);
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const sqlite = new Database(DB_PATH, { timeout: 5000 });
  try {
    sqlite.pragma('journal_mode = WAL');
  } catch (err) {
    // A journal_mode váltás SQLITE_BUSY-t adhat, ha egy másik folyamat (pl. a next build
    // párhuzamos workerei) épp ugyanezt csinálja; a WAL mód perzisztens, ezért ilyenkor
    // elég továbbmenni. Minden más hibát továbbdobunk.
    if (!(err instanceof Error && 'code' in err && err.code === 'SQLITE_BUSY')) throw err;
  }
  sqlite.pragma('foreign_keys = ON');
  // Diagnosztika hostinghoz: a relatív DATABASE_URL a process.cwd()-hez képest oldódik fel, ami
  // lehet egy verziózott build-mappa is (Hostinger: hbuilds/versions/<id>/nodejs). Ott a repó
  // data/tet.db-je nincs meg, és a fenti `new Database` egy üres fájlt hoz létre → „no such table".
  // A log megmutatja, melyik fájlt nyitottuk meg, és hogy vannak-e benne táblák.
  const vanTabla = sqlite.prepare("select 1 from sqlite_master where type = 'table' and name = 'user'").get();
  const uzenet = `[db] ${DB_PATH} – ${letezett ? 'meglévő fájl' : 'ÚJ, üres fájl jött létre'}`;
  if (vanTabla) console.log(uzenet);
  else console.warn(`${uzenet}; NINCSENEK TÁBLÁK – állítsd a DATABASE_URL-t a feltöltött tet.db abszolút útvonalára, vagy futtasd a migrációt.`);
  return drizzle(sqlite, { schema });
}

// Dev módban a Next HMR újratölti a modult; a globalThis cache megakadályozza,
// hogy minden reloadnál új kapcsolat nyíljon.
const globalForDb = globalThis as unknown as { __tetDb?: ReturnType<typeof createDb> };

export const db = globalForDb.__tetDb ?? createDb();
if (process.env.NODE_ENV !== 'production') globalForDb.__tetDb = db;

export type Db = typeof db;
