import 'server-only';
import { and, asc, desc, eq, gt, like, lt, max, or, sql } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '../index';
import { tudastarKartya } from '../schema';
import { szabadSlug } from '../../lib/slug';
import {
  FOGLALT_SLUGOK, isKategoriaSlug, kategoriaIndex, normalizalTartalom, type Kartya, type KartyaAdat,
} from '../../lib/tudastar-szotar';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Sor = typeof tudastarKartya.$inferSelect;

/** DB-sor → kártya; ismeretlen kategória vagy típus (csak kézi DB-módosításból lehet) → null, logolva. */
function kartyabol(r: Sor): Kartya | null {
  if (!isKategoriaSlug(r.kategoria)) {
    console.warn(`[tudastar] ismeretlen kategória, a kártya kimarad: ${r.id} (${r.kategoria})`);
    return null;
  }
  const alap = {
    id: r.id, slug: r.slug, kategoria: r.kategoria, nev: r.nev, rovidites: r.rovidites,
    osszefoglalo: r.osszefoglalo, honlap: r.honlap, sorrend: r.sorrend, updatedAt: r.updatedAt,
  };
  if (r.tipus === 'intezmeny') return { ...alap, tipus: 'intezmeny', tartalom: normalizalTartalom('intezmeny', r.tartalom) };
  if (r.tipus === 'lista') return { ...alap, tipus: 'lista', tartalom: normalizalTartalom('lista', r.tartalom) };
  console.warn(`[tudastar] ismeretlen típus, a kártya kimarad: ${r.id} (${r.tipus})`);
  return null;
}

/**
 * Minden kártya a 9 kategória sorrendjében, azon belül `sorrend` szerint. React.cache: a page egy kérésen
 * belül egyszer kérdez le; a visszaadott tömböt ne mutáld.
 */
export const listKartyak = cache((): Kartya[] => {
  const sorok = db.select().from(tudastarKartya).orderBy(asc(tudastarKartya.sorrend), asc(tudastarKartya.nev)).all();
  return sorok
    .map(kartyabol)
    .filter((k): k is Kartya => k !== null)
    .sort((a, b) => kategoriaIndex(a.kategoria) - kategoriaIndex(b.kategoria));
});

export function getKartya(id: string): Kartya | null {
  const r = db.select().from(tudastarKartya).where(eq(tudastarKartya.id, id)).get();
  return r ? kartyabol(r) : null;
}

/** A kategória következő szabad sorrend-értéke (a végére). */
function kovetkezoSorrend(tx: Tx, kategoria: string): number {
  const r = tx.select({ m: max(tudastarKartya.sorrend) }).from(tudastarKartya).where(eq(tudastarKartya.kategoria, kategoria)).get();
  return (r?.m ?? 0) + 1;
}

/** Új kártya a kategória végére; a slug az `alap`-ból, ütközésnél `-2`, `-3`… utótaggal. Visszaadja a slugot. */
export function createKartya(adat: KartyaAdat, alap: string, szerzoId: string): string {
  return db.transaction((tx) => {
    const foglalt = new Set(
      tx
        .select({ slug: tudastarKartya.slug })
        .from(tudastarKartya)
        .where(or(eq(tudastarKartya.slug, alap), like(tudastarKartya.slug, `${alap}-%`)))
        .all()
        .map((r) => r.slug),
    );
    const slug = szabadSlug(alap, (s) => foglalt.has(s) || FOGLALT_SLUGOK.includes(s));
    tx.insert(tudastarKartya)
      .values({ id: crypto.randomUUID(), slug, sorrend: kovetkezoSorrend(tx, adat.kategoria), szerzoId, ...adat })
      .run();
    return slug;
  });
}

export type ModositasEredmeny = 'ok' | 'nincs' | 'elavult';

/**
 * A kártya mentése, ha a `verzio` (a szerkesztő megnyitásakori `updatedAt`, ms) még érvényes: különben
 * `elavult` (közben más mentette), törölt kártyánál `nincs`. Kategóriaváltáskor a kártya az új kategória
 * végére kerül; különben a `sorrend` nem változik.
 */
export function updateKartya(id: string, adat: KartyaAdat, verzio: number, szerzoId: string): ModositasEredmeny {
  return db.transaction((tx) => {
    const r = tx
      .select({ kategoria: tudastarKartya.kategoria, updatedAt: tudastarKartya.updatedAt })
      .from(tudastarKartya)
      .where(eq(tudastarKartya.id, id))
      .get();
    if (!r) return 'nincs';
    if (r.updatedAt.getTime() !== verzio) return 'elavult';
    const sorrend = r.kategoria === adat.kategoria ? {} : { sorrend: kovetkezoSorrend(tx, adat.kategoria) };
    tx.update(tudastarKartya).set({ ...adat, ...sorrend, szerzoId }).where(eq(tudastarKartya.id, id)).run();
    return 'ok';
  });
}

export function deleteKartya(id: string): boolean {
  return db.delete(tudastarKartya).where(eq(tudastarKartya.id, id)).run().changes > 0;
}

/**
 * Csere a kategórián belüli szomszéddal (`fel`: az előzővel, `le`: a következővel). Az `updatedAt` nem
 * változik: a „Frissítve” dátum a tartalomra vonatkozik, és a nyitott szerkesztő verziója sem avul el tőle.
 */
export function mozgatKartya(id: string, irany: 'fel' | 'le'): void {
  db.transaction((tx) => {
    const r = tx
      .select({ kategoria: tudastarKartya.kategoria, sorrend: tudastarKartya.sorrend })
      .from(tudastarKartya)
      .where(eq(tudastarKartya.id, id))
      .get();
    if (!r) return;
    const szomszed = tx
      .select({ id: tudastarKartya.id, sorrend: tudastarKartya.sorrend })
      .from(tudastarKartya)
      .where(
        and(
          eq(tudastarKartya.kategoria, r.kategoria),
          irany === 'fel' ? lt(tudastarKartya.sorrend, r.sorrend) : gt(tudastarKartya.sorrend, r.sorrend),
        ),
      )
      .orderBy(irany === 'fel' ? desc(tudastarKartya.sorrend) : asc(tudastarKartya.sorrend))
      .limit(1)
      .get();
    if (!szomszed) return;
    const valtozatlan = { updatedAt: sql`${tudastarKartya.updatedAt}` };
    tx.update(tudastarKartya).set({ sorrend: szomszed.sorrend, ...valtozatlan }).where(eq(tudastarKartya.id, id)).run();
    tx.update(tudastarKartya).set({ sorrend: r.sorrend, ...valtozatlan }).where(eq(tudastarKartya.id, szomszed.id)).run();
  });
}
