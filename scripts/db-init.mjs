// Build előtti DB-előkészítés (hosting): a DATABASE_URL célfájlja a repó demó data/tet.db-jének
// másolatát kapja, ha még nem létezik, VAGY létezik, de nincs benne felhasználó (pl. üresen létrehozott
// fájl, vagy egy korábbi, rossz útvonalú deploy üres adatbázisa – abba a migráció táblákat rakott, de
// belépni nem lehetett). Utána a `drizzle-kit migrate` hozza naprakészre a sémát.
// A Hostinger a buildet és a futást más mappából végzi, ezért a DATABASE_URL legyen ABSZOLÚT,
// a verziózott build-mappán kívüli útvonal (pl. /home/<user>/domains/<domain>/data/tet.db).
// Sima JS (nem tsx), hogy a build-környezetben biztosan fusson.
import Database from 'better-sqlite3';
import { copyFileSync, existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const forras = resolve(process.cwd(), 'data/tet.db');
const cel = resolve(process.cwd(), process.env.DATABASE_URL ?? './data/tet.db');

/** A célfájl felhasználóinak száma; nincs tábla / nem SQLite / üres fájl → 0. */
function felhasznaloSzam(utvonal) {
  try {
    const db = new Database(utvonal, { fileMustExist: true });
    try {
      return db.prepare('select count(*) as n from user').get().n;
    } finally {
      db.close();
    }
  } catch {
    return 0;
  }
}

if (cel === forras) {
  console.log(`[db:init] a DATABASE_URL a repó adatbázisára mutat (${cel}), nincs másolás.`);
} else if (!existsSync(forras)) {
  console.warn(`[db:init] nincs demó adatbázis (${forras}); a migráció üres adatbázist hoz létre: ${cel}`);
} else if (existsSync(cel) && felhasznaloSzam(cel) > 0) {
  console.log(`[db:init] meglévő adatbázis felhasználókkal: ${cel}, nincs másolás.`);
} else {
  if (existsSync(cel)) {
    const mentes = `${cel}.ures-${Date.now()}`;
    renameSync(cel, mentes);
    console.log(`[db:init] a célfájlban nem volt felhasználó, elmentve: ${mentes}`);
  }
  // Egy ottmaradt WAL/SHM a régi adatbázis lapjait hozná vissza a friss másolatra.
  for (const utotag of ['-wal', '-shm']) rmSync(`${cel}${utotag}`, { force: true });
  mkdirSync(dirname(cel), { recursive: true });
  copyFileSync(forras, cel);
  console.log(`[db:init] demó adatbázis másolva: ${forras} → ${cel}`);
}
