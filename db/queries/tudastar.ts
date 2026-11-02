import 'server-only';
import { asc, eq, like, max, or, sql } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '../index';
import { tudastarKartya } from '../schema';
import { SLUG_RE, szabadSlug } from '../../lib/slug';
import {
  FOGLALT_SLUGOK, isKategoriaSlug, kategoriaIndex, normalizalTartalom, type Kartya, type KartyaAdat, type KategoriaSlug,
} from '../../lib/tudastar-szotar';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Sor = typeof tudastarKartya.$inferSelect;

// Az írás előtti olvasás miatt `immediate`: egy másik folyamat (pl. migráció ugyanazon a DB-n) írása így a
// busy_timeout-ig várakoztat, nem SQLITE_BUSY_SNAPSHOT-tal bukik el.
const IRAS = { behavior: 'immediate' } as const;

/** A kártya-sorrend a kategórián belül: a megjelenítéssel azonos (sorrend, név, id) – a mozgatás is ezt követi. */
const KATEGORIA_SORREND = [asc(tudastarKartya.sorrend), asc(tudastarKartya.nev), asc(tudastarKartya.id)];

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
 * Minden kártya a 9 kategória sorrendjében, azon belül a `KATEGORIA_SORREND` szerint. React.cache: a page egy kérésen
 * belül egyszer kérdez le; a visszaadott tömböt ne mutáld.
 */
export const listKartyak = cache((): Kartya[] => {
  const sorok = db.select().from(tudastarKartya).orderBy(...KATEGORIA_SORREND).all();
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
function kovetkezoSorrend(tx: Tx, kategoria: KategoriaSlug): number {
  const r = tx.select({ m: max(tudastarKartya.sorrend) }).from(tudastarKartya).where(eq(tudastarKartya.kategoria, kategoria)).get();
  return (r?.m ?? 0) + 1;
}

/** A tárolt mezők a validált adatból, explicit felsorolással (a hívó objektumának többi kulcsa nem kerül a DB-be). */
function taroltMezok(adat: KartyaAdat) {
  const { kategoria, nev, rovidites, osszefoglalo, honlap, tartalom } = adat;
  return { kategoria, nev, rovidites, osszefoglalo, honlap, tartalom };
}

/** Új kártya a kategória végére; a slug az `alap`-ból, ütközésnél `-2`, `-3`… utótaggal. Visszaadja a slugot. */
export function createKartya(adat: KartyaAdat, alap: string, szerzoId: string): string {
  if (!SLUG_RE.test(alap)) throw new Error(`[tudastar] érvénytelen slug-alap: ${alap}`);
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
      .values({
        ...taroltMezok(adat),
        id: crypto.randomUUID(),
        tipus: adat.tipus,
        slug,
        sorrend: kovetkezoSorrend(tx, adat.kategoria),
        szerzoId,
      })
      .run();
    return slug;
  }, IRAS);
}

export type ModositasEredmeny = 'ok' | 'nincs' | 'elavult';

/**
 * A kártya mentése, ha a `verzio` (a szerkesztő megnyitásakori `updatedAt`, ms) még érvényes: különben
 * `elavult` (közben más mentette), törölt kártyánál `nincs`. Csak a tartalmi mezőket írja (a slug, a típus
 * és az `updatedAt` nem jöhet a hívótól; az utóbbit a séma `$onUpdate`-je lépteti). A típus nem változhat:
 * eltérésnél hibát dob (programhiba – az action a meglévő kártya típusát adja át). Kategóriaváltáskor a
 * kártya az új kategória végére kerül; különben a `sorrend` nem változik.
 */
export function updateKartya(id: string, adat: KartyaAdat, verzio: number, szerzoId: string): ModositasEredmeny {
  return db.transaction((tx) => {
    const r = tx
      .select({ kategoria: tudastarKartya.kategoria, tipus: tudastarKartya.tipus, updatedAt: tudastarKartya.updatedAt })
      .from(tudastarKartya)
      .where(eq(tudastarKartya.id, id))
      .get();
    if (!r) return 'nincs';
    if (r.tipus !== adat.tipus) throw new Error(`[tudastar] a kártya típusa nem változhat: ${id} (${r.tipus} → ${adat.tipus})`);
    if (r.updatedAt.getTime() !== verzio) return 'elavult';
    const sorrend = r.kategoria === adat.kategoria ? {} : { sorrend: kovetkezoSorrend(tx, adat.kategoria) };
    tx.update(tudastarKartya).set({ ...taroltMezok(adat), ...sorrend, szerzoId }).where(eq(tudastarKartya.id, id)).run();
    return 'ok';
  }, IRAS);
}

export function deleteKartya(id: string): boolean {
  return db.delete(tudastarKartya).where(eq(tudastarKartya.id, id)).run().changes > 0;
}

/**
 * Csere a kategórián belüli szomszéddal (`fel`: az előzővel, `le`: a következővel), a megjelenítés
 * sorrendjében. A kategória sorrendjét közben 1..n-re számozza újra, így az azonos `sorrend`-ű (kézi
 * módosításból származó) kártyák is mozgathatók. Az `updatedAt` nem változik: a „Frissítve” dátum a
 * tartalomra vonatkozik, és a nyitott szerkesztő verziója sem avul el tőle.
 */
export function mozgatKartya(id: string, irany: 'fel' | 'le'): void {
  db.transaction((tx) => {
    const r = tx.select({ kategoria: tudastarKartya.kategoria }).from(tudastarKartya).where(eq(tudastarKartya.id, id)).get();
    if (!r) return;
    const sorok = tx
      .select({ id: tudastarKartya.id, sorrend: tudastarKartya.sorrend })
      .from(tudastarKartya)
      .where(eq(tudastarKartya.kategoria, r.kategoria))
      .orderBy(...KATEGORIA_SORREND)
      .all();
    const i = sorok.findIndex((s) => s.id === id);
    const j = irany === 'fel' ? i - 1 : i + 1;
    if (j < 0 || j >= sorok.length) return;
    [sorok[i], sorok[j]] = [sorok[j], sorok[i]];
    sorok.forEach((s, k) => {
      if (s.sorrend === k + 1) return;
      tx.update(tudastarKartya)
        .set({ sorrend: k + 1, updatedAt: sql`${tudastarKartya.updatedAt}` })
        .where(eq(tudastarKartya.id, s.id))
        .run();
    });
  }, IRAS);
}
