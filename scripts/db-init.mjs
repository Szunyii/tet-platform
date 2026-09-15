// Build előtti DB-előkészítés (hosting): a DATABASE_URL célfájlja, ha még nem létezik, a repó demó
// data/tet.db-jének másolatát kapja; utána a `drizzle-kit migrate` hozza naprakészre a sémát.
// A Hostinger a buildet és a futást más mappából végzi, ezért a DATABASE_URL legyen ABSZOLÚT,
// a verziózott build-mappán kívüli útvonal (pl. /home/<user>/domains/<domain>/data/tet.db).
// Sima JS (nem tsx), hogy a build-környezetben biztosan fusson.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const forras = resolve(process.cwd(), 'data/tet.db');
const cel = resolve(process.cwd(), process.env.DATABASE_URL ?? './data/tet.db');

if (cel === forras) {
  console.log(`[db:init] a DATABASE_URL a repó adatbázisára mutat (${cel}), nincs másolás.`);
} else if (existsSync(cel)) {
  console.log(`[db:init] meglévő adatbázis: ${cel}, nincs másolás.`);
} else if (!existsSync(forras)) {
  console.warn(`[db:init] nincs demó adatbázis (${forras}); a migráció üres adatbázist hoz létre: ${cel}`);
} else {
  mkdirSync(dirname(cel), { recursive: true });
  copyFileSync(forras, cel);
  console.log(`[db:init] demó adatbázis másolva: ${forras} → ${cel}`);
}
