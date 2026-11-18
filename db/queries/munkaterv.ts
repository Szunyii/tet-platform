import 'server-only';
import { and, asc, count, eq, isNotNull, max, or, sql } from 'drizzle-orm';
import { db } from '../index';
import { kozpontiCel, munkaterv, munkatervCel, munkatervEv, user } from '../schema';
import { listAttaseOrszagok } from './attase-orszag';
import { listCimzettJeloltek } from './ticket';
import { naptariNap } from '../../lib/datum';
import {
  CEL_MAX, CEL_MIN, kozzetetelHibak, szerkeszthetoTerv, tervEvek, vonatkozoCelok,
  type CelAllapot, type TervStatusz,
} from '../../lib/munkaterv-szotar';
import type { CelAllapotInput, CelInput, KozpontiCelInput } from '../../lib/munkaterv-validacio';
import { orszagRegio } from '../../lib/orszagok';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Terv = typeof munkaterv.$inferSelect;

// Az írás előtti olvasás miatt `immediate`, mint a db/queries/tevekenyseg.ts-ben. A kapcsolat egyetlen
// (better-sqlite3), ezért a tranzakción belül hívott olvasó segédek a `db`-n át is az aktuális állapotot látják.
const IRAS = { behavior: 'immediate' } as const;

export type TervEredmeny = 'ok' | 'nincs' | 'elavult' | 'ervenytelen' | 'nincs_kozzeteve' | 'cel_szam' | 'kozzeteve';

export interface KozpontiCelSor extends KozpontiCelInput {
  id: string;
  ev: number;
}

export interface CelSor extends CelInput {
  id: string;
  /** Töltött, ha a cél központi célból készült: ekkor csak az országa módosítható, és nem törölhető. */
  kozpontiCelId: string | null;
  allapot: CelAllapot;
  allapotMegjegyzes: string | null;
  allapotModositottaNev: string | null;
  sorrend: number;
}

export interface TervNezet {
  id: string;
  attaseId: string;
  attaseNev: string;
  ev: number;
  statusz: TervStatusz;
  megjegyzes: string | null;
  modositasiKerelem: string | null;
  jovahagytaNev: string | null;
  jovahagyvaAt: Date | null;
  celok: CelSor[];
  /** A terv megnyitáskori verziója (`updatedAt` ms-ban): elavult lapról nem lehet dönteni. */
  verzio: number;
}

export interface TervAttekintesSor {
  attaseId: string;
  nev: string;
  varos: string | null;
  statusz: TervStatusz | null;
  celDb: number;
  teljesultDb: number;
  modositasKerve: boolean;
}

/** Szigorúan növekvő verzió: az azonos ezredmásodpercben mentett két változat sem kaphatja ugyanazt. */
function kovetkezoVerzio(elozo: Date, most: Date): Date {
  return new Date(Math.max(most.getTime(), elozo.getTime() + 1));
}

function kozzeteveE(ev: number): boolean {
  return db.select({ ev: munkatervEv.ev }).from(munkatervEv).where(eq(munkatervEv.ev, ev)).get() !== undefined;
}

/** Az aktív, székhellyel rendelkező attasék neve és székhelyük régiója: rájuk vonatkozik a központi célok szabálya. */
function aktivAttasek() {
  return listCimzettJeloltek().map((j) => ({ nev: j.nev, regio: orszagRegio(j.orszag) }));
}

export function getMunkatervEv(ev: number): { kozzeteveAt: Date; kozzetetteNev: string } | null {
  return (
    db
      .select({ kozzeteveAt: munkatervEv.kozzeteveAt, kozzetetteNev: munkatervEv.kozzetetteNev })
      .from(munkatervEv)
      .where(eq(munkatervEv.ev, ev))
      .get() ?? null
  );
}

/** Az év központi céljai a felvétel sorrendjében. */
export function listKozpontiCelok(ev: number): KozpontiCelSor[] {
  return db
    .select({
      id: kozpontiCel.id,
      ev: kozpontiCel.ev,
      megnevezes: kozpontiCel.megnevezes,
      szempont: kozpontiCel.szempont,
      merce: kozpontiCel.merce,
      hatokor: kozpontiCel.hatokor,
    })
    .from(kozpontiCel)
    .where(eq(kozpontiCel.ev, ev))
    .orderBy(asc(kozpontiCel.createdAt), asc(kozpontiCel.id))
    .all();
}

/**
 * Központi cél felvétele vagy módosítása közzététel előtt. Egy aktív attaséra sem vonatkozhat kettőnél több cél:
 * ha mégis vonatkozna, a `nevek` az érintett attasékat adja.
 */
export function mentKozpontiCel(ev: number, i: KozpontiCelInput, id?: string): { eredmeny: TervEredmeny; nevek?: string[] } {
  return db.transaction((tx): { eredmeny: TervEredmeny; nevek?: string[] } => {
    if (kozzeteveE(ev)) return { eredmeny: 'kozzeteve' };
    const celok = listKozpontiCelok(ev);
    if (id !== undefined && !celok.some((c) => c.id === id)) return { eredmeny: 'nincs' };

    const uj = [...celok.filter((c) => c.id !== id), { hatokor: i.hatokor }];
    const { tulSok } = kozzetetelHibak(uj, aktivAttasek());
    if (tulSok.length > 0) return { eredmeny: 'cel_szam', nevek: tulSok };

    const mezok = { megnevezes: i.megnevezes, szempont: i.szempont, merce: i.merce, hatokor: i.hatokor };
    if (id !== undefined) tx.update(kozpontiCel).set(mezok).where(eq(kozpontiCel.id, id)).run();
    else tx.insert(kozpontiCel).values({ ...mezok, id: crypto.randomUUID(), ev }).run();
    return { eredmeny: 'ok' };
  }, IRAS);
}

export function torolKozpontiCel(id: string): TervEredmeny {
  return db.transaction((tx): TervEredmeny => {
    const c = tx.select({ ev: kozpontiCel.ev }).from(kozpontiCel).where(eq(kozpontiCel.id, id)).get();
    if (!c) return 'nincs';
    if (kozzeteveE(c.ev)) return 'kozzeteve';
    tx.delete(kozpontiCel).where(eq(kozpontiCel.id, id)).run();
    return 'ok';
  }, IRAS);
}

/** Az év céljainak közzététele: minden aktív attaséra 1–2 központi célnak kell vonatkoznia. Nem vonható vissza. */
export function kozzetesz(
  ev: number,
  nev: string,
  most: Date = new Date(),
): { eredmeny: TervEredmeny; tulSok?: string[]; nincsCel?: string[] } {
  return db.transaction((tx): { eredmeny: TervEredmeny; tulSok?: string[]; nincsCel?: string[] } => {
    if (kozzeteveE(ev)) return { eredmeny: 'kozzeteve' };
    const { tulSok, nincsCel } = kozzetetelHibak(listKozpontiCelok(ev), aktivAttasek());
    if (tulSok.length > 0 || nincsCel.length > 0) return { eredmeny: 'cel_szam', tulSok, nincsCel };
    tx.insert(munkatervEv).values({ ev, kozzeteveAt: most, kozzetetteNev: nev }).run();
    return { eredmeny: 'ok' };
  }, IRAS);
}

/** Az attasé terve a célokkal, a felvétel sorrendjében; ha még nem készült el, `null`. */
export function getTerv(attaseId: string, ev: number): TervNezet | null {
  const t = db
    .select({
      id: munkaterv.id,
      attaseId: munkaterv.attaseId,
      attaseNev: user.name,
      ev: munkaterv.ev,
      statusz: munkaterv.statusz,
      megjegyzes: munkaterv.megjegyzes,
      modositasiKerelem: munkaterv.modositasiKerelem,
      jovahagytaNev: munkaterv.jovahagytaNev,
      jovahagyvaAt: munkaterv.jovahagyvaAt,
      updatedAt: munkaterv.updatedAt,
    })
    .from(munkaterv)
    .innerJoin(user, eq(user.id, munkaterv.attaseId))
    .where(and(eq(munkaterv.attaseId, attaseId), eq(munkaterv.ev, ev)))
    .get();
  if (!t) return null;
  const celok = db
    .select({
      id: munkatervCel.id,
      kozpontiCelId: munkatervCel.kozpontiCelId,
      megnevezes: munkatervCel.megnevezes,
      orszagKod: munkatervCel.orszagKod,
      szempont: munkatervCel.szempont,
      merce: munkatervCel.merce,
      allapot: munkatervCel.allapot,
      allapotMegjegyzes: munkatervCel.allapotMegjegyzes,
      allapotModositottaNev: munkatervCel.allapotModositottaNev,
      sorrend: munkatervCel.sorrend,
    })
    .from(munkatervCel)
    .where(eq(munkatervCel.tervId, t.id))
    .orderBy(asc(munkatervCel.sorrend), asc(munkatervCel.id))
    .all();
  const { updatedAt, ...adat } = t;
  return { ...adat, celok, verzio: updatedAt.getTime() };
}

/**
 * A terv létrehozása a folyó vagy a következő évre (`most` Europe/Budapest szerinti évéhez képest), közzététel után.
 * A vonatkozó központi célok másolatként kerülnek a tervbe, országuk a székhely. Ha a terv már megvan, azt adja vissza.
 */
export function kezdTerv(attaseId: string, ev: number, most: Date = new Date()): { eredmeny: TervEredmeny; id?: string } {
  return db.transaction((tx): { eredmeny: TervEredmeny; id?: string } => {
    if (!tervEvek(Number(naptariNap(most).slice(0, 4))).includes(ev)) return { eredmeny: 'ervenytelen' };
    if (!kozzeteveE(ev)) return { eredmeny: 'nincs_kozzeteve' };
    const meglevo = tx
      .select({ id: munkaterv.id })
      .from(munkaterv)
      .where(and(eq(munkaterv.attaseId, attaseId), eq(munkaterv.ev, ev)))
      .get();
    if (meglevo) return { eredmeny: 'ok', id: meglevo.id };
    const szekhely = listAttaseOrszagok(attaseId).find((o) => o.szekhely);
    if (!szekhely) return { eredmeny: 'ervenytelen' };

    const id = crypto.randomUUID();
    tx.insert(munkaterv).values({ id, attaseId, ev, statusz: 'piszkozat', createdAt: most, updatedAt: most }).run();
    vonatkozoCelok(listKozpontiCelok(ev), orszagRegio(szekhely.kod)).forEach((c, index) => {
      tx.insert(munkatervCel)
        .values({
          id: crypto.randomUUID(),
          tervId: id,
          kozpontiCelId: c.id,
          sorrend: index + 1,
          megnevezes: c.megnevezes,
          orszagKod: szekhely.kod,
          szempont: c.szempont,
          merce: c.merce,
        })
        .run();
    });
    return { eredmeny: 'ok', id };
  }, IRAS);
}

/** A terv mentése a következő verzióval. */
function tervIr(tx: Tx, t: Terv, most: Date, adat: Partial<typeof munkaterv.$inferInsert>): void {
  tx.update(munkaterv).set({ ...adat, updatedAt: kovetkezoVerzio(t.updatedAt, most) }).where(eq(munkaterv.id, t.id)).run();
}

/** Az attasé művelete a saját tervén: tulajdonos és verzió ellenőrzése egy írási tranzakcióban. */
function attaseIras(tervId: string, attaseId: string, verzio: number, fn: (tx: Tx, t: Terv) => TervEredmeny): TervEredmeny {
  return db.transaction((tx): TervEredmeny => {
    const t = tx.select().from(munkaterv).where(eq(munkaterv.id, tervId)).get();
    if (!t || t.attaseId !== attaseId) return 'nincs';
    if (t.updatedAt.getTime() !== verzio) return 'elavult';
    return fn(tx, t);
  }, IRAS);
}

/** A központ döntése a terven: verzió ellenőrzése egy írási tranzakcióban. */
function adminIras(tervId: string, verzio: number, fn: (tx: Tx, t: Terv) => TervEredmeny): TervEredmeny {
  return db.transaction((tx): TervEredmeny => {
    const t = tx.select().from(munkaterv).where(eq(munkaterv.id, tervId)).get();
    if (!t) return 'nincs';
    if (t.updatedAt.getTime() !== verzio) return 'elavult';
    return fn(tx, t);
  }, IRAS);
}

function celDarab(tx: Tx, tervId: string): number {
  return tx.select({ darab: count() }).from(munkatervCel).where(eq(munkatervCel.tervId, tervId)).get()?.darab ?? 0;
}

/**
 * Cél felvétele vagy módosítása szerkeszthető tervben. A központi célnak csak az országa változhat, a többi mezője a
 * tárolt értékkel kell egyezzen. A célszám felső korlátját ez, az alsót a beküldés ellenőrzi.
 */
export function mentCel(tervId: string, attaseId: string, i: CelInput, verzio: number, celId?: string): TervEredmeny {
  return attaseIras(tervId, attaseId, verzio, (tx, t) => {
    if (!szerkeszthetoTerv(t.statusz)) return 'ervenytelen';
    if (!listAttaseOrszagok(attaseId).some((o) => o.kod === i.orszagKod)) return 'ervenytelen';

    const mezok = { megnevezes: i.megnevezes, orszagKod: i.orszagKod, szempont: i.szempont, merce: i.merce };
    if (celId !== undefined) {
      const c = tx
        .select()
        .from(munkatervCel)
        .where(and(eq(munkatervCel.id, celId), eq(munkatervCel.tervId, tervId)))
        .get();
      if (!c) return 'nincs';
      const zaroltValtozott =
        c.kozpontiCelId !== null && (c.megnevezes !== i.megnevezes || c.szempont !== i.szempont || c.merce !== i.merce);
      if (zaroltValtozott) return 'ervenytelen';
      tx.update(munkatervCel).set(mezok).where(eq(munkatervCel.id, celId)).run();
    } else {
      if (celDarab(tx, tervId) >= CEL_MAX) return 'cel_szam';
      const utolso = tx
        .select({ sorrend: max(munkatervCel.sorrend) })
        .from(munkatervCel)
        .where(eq(munkatervCel.tervId, tervId))
        .get()?.sorrend ?? 0;
      tx.insert(munkatervCel).values({ ...mezok, id: crypto.randomUUID(), tervId, sorrend: utolso + 1 }).run();
    }
    tervIr(tx, t, new Date(), {});
    return 'ok';
  });
}

/** Saját cél törlése szerkeszthető tervből; a központi cél nem törölhető. */
export function torolCel(tervId: string, attaseId: string, celId: string, verzio: number): TervEredmeny {
  return attaseIras(tervId, attaseId, verzio, (tx, t) => {
    if (!szerkeszthetoTerv(t.statusz)) return 'ervenytelen';
    const c = tx
      .select({ kozpontiCelId: munkatervCel.kozpontiCelId })
      .from(munkatervCel)
      .where(and(eq(munkatervCel.id, celId), eq(munkatervCel.tervId, tervId)))
      .get();
    if (!c) return 'nincs';
    if (c.kozpontiCelId !== null) return 'ervenytelen';
    tx.delete(munkatervCel).where(eq(munkatervCel.id, celId)).run();
    tervIr(tx, t, new Date(), {});
    return 'ok';
  });
}

/** Beküldés jóváhagyásra 3–5 céllal. A központ korábbi megjegyzése ezzel lezárul. */
export function bekuld(tervId: string, attaseId: string, verzio: number): TervEredmeny {
  return attaseIras(tervId, attaseId, verzio, (tx, t) => {
    if (!szerkeszthetoTerv(t.statusz)) return 'ervenytelen';
    const darab = celDarab(tx, tervId);
    if (darab < CEL_MIN || darab > CEL_MAX) return 'cel_szam';
    tervIr(tx, t, new Date(), { statusz: 'jovahagyasra_var', megjegyzes: null });
    return 'ok';
  });
}

export function jovahagy(tervId: string, nev: string, verzio: number, most: Date = new Date()): TervEredmeny {
  return adminIras(tervId, verzio, (tx, t) => {
    if (t.statusz !== 'jovahagyasra_var') return 'ervenytelen';
    tervIr(tx, t, most, { statusz: 'jovahagyott', jovahagytaNev: nev, jovahagyvaAt: most });
    return 'ok';
  });
}

/** A beküldött terv visszaküldése kötelező megjegyzéssel. */
export function visszakuldTerv(tervId: string, megjegyzes: string, verzio: number): TervEredmeny {
  return adminIras(tervId, verzio, (tx, t) => {
    if (t.statusz !== 'jovahagyasra_var' || !megjegyzes.trim()) return 'ervenytelen';
    tervIr(tx, t, new Date(), { statusz: 'visszakuldott', megjegyzes });
    return 'ok';
  });
}

/** A jóváhagyott terv módosításának kérése indoklással; egyszerre egy kérés lehet nyitott. */
export function kerModositast(tervId: string, attaseId: string, indoklas: string, verzio: number): TervEredmeny {
  return attaseIras(tervId, attaseId, verzio, (tx, t) => {
    if (t.statusz !== 'jovahagyott' || t.modositasiKerelem !== null || !indoklas.trim()) return 'ervenytelen';
    tervIr(tx, t, new Date(), { modositasiKerelem: indoklas, megjegyzes: null });
    return 'ok';
  });
}

/** A nyitott módosítási kérés elutasítása kötelező megjegyzéssel: a terv jóváhagyott marad. */
export function elutasitModositast(tervId: string, megjegyzes: string, verzio: number): TervEredmeny {
  return adminIras(tervId, verzio, (tx, t) => {
    if (t.statusz !== 'jovahagyott' || t.modositasiKerelem === null || !megjegyzes.trim()) return 'ervenytelen';
    tervIr(tx, t, new Date(), { modositasiKerelem: null, megjegyzes });
    return 'ok';
  });
}

/**
 * A nyitott módosítási kérésre a terv szerkesztésre visszanyitása kötelező megjegyzéssel. A célok állapota megmarad,
 * a jóváhagyás adatai az újbóli jóváhagyásig törlődnek.
 */
export function visszanyit(tervId: string, megjegyzes: string, verzio: number): TervEredmeny {
  return adminIras(tervId, verzio, (tx, t) => {
    if (t.statusz !== 'jovahagyott' || t.modositasiKerelem === null || !megjegyzes.trim()) return 'ervenytelen';
    tervIr(tx, t, new Date(), {
      statusz: 'visszakuldott',
      megjegyzes,
      modositasiKerelem: null,
      jovahagytaNev: null,
      jovahagyvaAt: null,
    });
    return 'ok';
  });
}

/**
 * A jóváhagyott terv egy céljának állapota. `tulajdonos` megadásával csak az ő terve írható. A terv verziója
 * szándékosan nem lép: a célállapot nem a terv tartalma, és nem avulhat el miatta a nyitott lap döntése.
 */
function celAllapotIr(celId: string, i: CelAllapotInput, nev: string, most: Date, tulajdonos?: string): TervEredmeny {
  return db.transaction((tx): TervEredmeny => {
    const sor = tx
      .select({ attaseId: munkaterv.attaseId, statusz: munkaterv.statusz })
      .from(munkatervCel)
      .innerJoin(munkaterv, eq(munkaterv.id, munkatervCel.tervId))
      .where(eq(munkatervCel.id, celId))
      .get();
    if (!sor || (tulajdonos !== undefined && sor.attaseId !== tulajdonos)) return 'nincs';
    if (sor.statusz !== 'jovahagyott') return 'ervenytelen';
    tx.update(munkatervCel)
      .set({ allapot: i.allapot, allapotMegjegyzes: i.megjegyzes, allapotModositottaNev: nev, allapotModositvaAt: most })
      .where(eq(munkatervCel.id, celId))
      .run();
    return 'ok';
  }, IRAS);
}

/** Az attasé a saját jóváhagyott tervének célállapotát állítja. */
export function allitCelAllapot(celId: string, attaseId: string, i: CelAllapotInput, nev: string, most: Date = new Date()): TervEredmeny {
  return celAllapotIr(celId, i, nev, most, attaseId);
}

/** A központ felülírja a célállapotot; a felülíró neve megmarad. */
export function feluliCelAllapot(celId: string, i: CelAllapotInput, nev: string, most: Date = new Date()): TervEredmeny {
  return celAllapotIr(celId, i, nev, most);
}

/** Az aktív attasék névsorban, az év tervének állapotával és célszámaival. Pontszám és rangsor nincs. */
export function listTervAttekintes(ev: number): TervAttekintesSor[] {
  const tervek = new Map(
    db
      .select({ attaseId: munkaterv.attaseId, id: munkaterv.id, statusz: munkaterv.statusz, kerelem: munkaterv.modositasiKerelem })
      .from(munkaterv)
      .where(eq(munkaterv.ev, ev))
      .all()
      .map((t) => [t.attaseId, t]),
  );
  const darabok = new Map(
    db
      .select({
        tervId: munkatervCel.tervId,
        celDb: count(),
        teljesultDb: sql<number>`coalesce(sum(${munkatervCel.allapot} = 'teljesult'), 0)`,
      })
      .from(munkatervCel)
      .innerJoin(munkaterv, eq(munkaterv.id, munkatervCel.tervId))
      .where(eq(munkaterv.ev, ev))
      .groupBy(munkatervCel.tervId)
      .all()
      .map((d) => [d.tervId, d]),
  );
  return listCimzettJeloltek().map((j) => {
    const t = tervek.get(j.id);
    const d = t ? darabok.get(t.id) : undefined;
    return {
      attaseId: j.id,
      nev: j.nev,
      varos: j.varos,
      statusz: t?.statusz ?? null,
      celDb: d?.celDb ?? 0,
      teljesultDb: d?.teljesultDb ?? 0,
      modositasKerve: (t?.kerelem ?? null) !== null,
    };
  });
}

/** A menüpont számlálója. Admin: a jóváhagyásra váró tervek és a nyitott módosítási kérések. Attasé: a saját visszaküldött tervei. */
export function countTervTeendo(session: { userId: string; role: 'admin' | 'attase' }): number {
  const feltetel =
    session.role === 'admin'
      ? or(eq(munkaterv.statusz, 'jovahagyasra_var'), isNotNull(munkaterv.modositasiKerelem))
      : and(eq(munkaterv.attaseId, session.userId), eq(munkaterv.statusz, 'visszakuldott'));
  return db.select({ darab: count() }).from(munkaterv).where(feltetel).get()?.darab ?? 0;
}
