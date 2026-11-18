import 'server-only';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../index';
import { riport, riportMinosites } from '../schema';
import type { OsszFokozat } from '../../lib/ertekeles-szotar';
import type { RiportMinositesInput } from '../../lib/riport-minosites';

// A jelentések központi minősítése. A fokozatot és a megjegyzést CSAK admin nézet olvassa (jelentéslista, a jelentés
// oldalának kártyája, a monitoring mutatója): az attasé-olvasó lekérdezések (db/queries/riport.ts) szándékosan nem
// kapnak minősítést, ezért ez külön modul és külön tábla. Az író tranzakció `immediate`, mint a többi író művelet.
const IRAS = { behavior: 'immediate' } as const;

/** Egy `IN (…)` feltételbe kerülő azonosítók legnagyobb száma (az SQLite változószám-korlátja miatt). */
const CSOPORT_MERET = 500;

export interface RiportMinosites {
  fokozat: OsszFokozat;
  megjegyzes: string | null;
  /** A minősítő admin nevének pillanatképe. */
  szerzoNev: string;
  updatedAt: Date;
}

const OSZLOPOK = {
  riportId: riportMinosites.riportId,
  fokozat: riportMinosites.fokozat,
  megjegyzes: riportMinosites.megjegyzes,
  szerzoNev: riportMinosites.szerzoNev,
  updatedAt: riportMinosites.updatedAt,
};

/** Csak a közös alak kerül ki: a hívó a jelentés azonosítóját a kulcsból tudja. */
function minositesbol(sor: RiportMinosites): RiportMinosites {
  return { fokozat: sor.fokozat, megjegyzes: sor.megjegyzes, szerzoNev: sor.szerzoNev, updatedAt: sor.updatedAt };
}

/** A jelentés minősítése, vagy `null`, ha nincs minősítve. */
export function getRiportMinosites(riportId: string): RiportMinosites | null {
  const sor = db.select(OSZLOPOK).from(riportMinosites).where(eq(riportMinosites.riportId, riportId)).get();
  return sor ? minositesbol(sor) : null;
}

/** A megadott jelentések minősítései jelentés-azonosító szerint; a minősítetlen jelentés nem szerepel a térképben. */
export function riportMinositesek(riportIdk: readonly string[]): Map<string, RiportMinosites> {
  const minositesek = new Map<string, RiportMinosites>();
  for (let i = 0; i < riportIdk.length; i += CSOPORT_MERET) {
    const sorok = db
      .select(OSZLOPOK)
      .from(riportMinosites)
      .where(inArray(riportMinosites.riportId, riportIdk.slice(i, i + CSOPORT_MERET)))
      .all();
    for (const sor of sorok) minositesek.set(sor.riportId, minositesbol(sor));
  }
  return minositesek;
}

/**
 * A jelentés minősítésének mentése (`most`: a mentés ideje); `fokozat: null` törli a minősítést. Csak a
 * `riport_minosites` táblába ír, a `riport` sorhoz (és így a módosítási dátumához) nem nyúl. `false`, ha a jelentés
 * nem létezik: a létezés ellenőrzése is az `immediate` tranzakcióban van, hogy egy közben törölt jelentés ne FK-hibát
 * adjon. A törlés idempotens: minősítetlen jelentésnél is `true`.
 */
export function setRiportMinosites(
  riportId: string,
  i: RiportMinositesInput,
  szerzoNev: string,
  most: Date = new Date(),
): boolean {
  return db.transaction((tx) => {
    if (!tx.select({ id: riport.id }).from(riport).where(eq(riport.id, riportId)).get()) return false;
    if (i.fokozat === null) {
      tx.delete(riportMinosites).where(eq(riportMinosites.riportId, riportId)).run();
      return true;
    }
    const ertek = { fokozat: i.fokozat, megjegyzes: i.megjegyzes, szerzoNev, updatedAt: most };
    tx.insert(riportMinosites)
      .values({ riportId, ...ertek })
      .onConflictDoUpdate({ target: riportMinosites.riportId, set: ertek })
      .run();
    return true;
  }, IRAS);
}
