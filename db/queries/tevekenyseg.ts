import 'server-only';
import { and, asc, count, desc, eq, gte, inArray, isNotNull, lte, max, or, sql, type SQL } from 'drizzle-orm';
import { db } from '../index';
import { attaseOrszag, eredmeny, eredmenyEsemeny, ertekelesiIdoszak, riport, tevekenyseg, user } from '../schema';
import { listAttaseOrszagok } from './attase-orszag';
import { naptariNap } from '../../lib/datum';
import { felevKulcs, felevNapok, futoFelev, type Felev, type FelevSzam } from '../../lib/ertekeles-idoszak';
import type { BovitettBemenet, EredmenyEsemenyBemenet } from '../../lib/ertekeles-mutatok';
import { ORSZAGOK, orszagNev, type RegioKulcs } from '../../lib/orszagok';
import {
  adminMuveletek, attaseMuveletek, befejezettE, beszamitasiFelev, mezokZarolvaE,
  type AdminMuvelet, type AttaseMuvelet, type UgyAdat,
} from '../../lib/tevekenyseg-allapot';
import {
  igazolastKer, kovetkezoSzakasz, SZAKASZOK,
  type EsemenyTipus, type Hozzajarulas, type Szakasz, type UgyAllapot,
} from '../../lib/tevekenyseg-szotar';
import type {
  EredmenyInput, IgazolasKeresInput, MegjegyzesInput, TevekenysegInput,
} from '../../lib/tevekenyseg-validacio';
import { huOsszevet } from '../../lib/rendezes';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Ugy = typeof eredmeny.$inferSelect;

// Az írás előtti olvasás miatt `immediate`, mint a db/queries/ertekeles.ts-ben. A kapcsolat egyetlen
// (better-sqlite3), ezért a tranzakción belül hívott olvasó segédek a `db`-n át is az aktuális állapotot látják.
const IRAS = { behavior: 'immediate' } as const;

export type IrasEredmeny = 'ok' | 'nincs' | 'elavult' | 'ervenytelen' | 'lezart_felev';

export interface TevekenysegSor extends TevekenysegInput {
  id: string;
  attaseId: string;
  attaseNev: string;
  kifogas: string | null;
  kifogasSzerzoNev: string | null;
  eredmenyNev: string | null;
  riportTargy: string | null;
  /** A dátum félévét már legalább egyszer lezárták: a bejegyzés nem módosítható és nem törölhető. */
  zarolt: boolean;
  verzio: number;
  updatedAt: Date;
}

export interface EredmenySor extends UgyAdat {
  id: string;
  attaseId: string;
  attaseNev: string;
  varos: string | null;
  megnevezes: string;
  orszagKod: string;
  partner: string;
  magyarSzereplo: string | null;
  hozzajarulas: Hozzajarulas;
  leiras: string | null;
  kifogas: string | null;
  kifogasSzerzoNev: string | null;
  tevekenysegDb: number;
  /** Az érvényes (nem visszavont) megállapodás-igazolás beszámítási éve. */
  megallapodasEv: number | null;
  torolheto: boolean;
  verzio: number;
  updatedAt: Date;
}

export interface EsemenySor {
  id: string;
  tipus: EsemenyTipus;
  szakasz: Szakasz | null;
  szoveg: string | null;
  link: string | null;
  riportId: string | null;
  riportTargy: string | null;
  szerzoNev: string;
  szerzoSzerep: 'admin' | 'attase';
  visszavonva: boolean;
  createdAt: Date;
}

export interface EredmenyReszlet extends EredmenySor {
  esemenyek: EsemenySor[];
  tevekenysegek: TevekenysegSor[];
}

export interface IgazolasKeresSor extends EredmenySor {
  /** A függő kérés eseménye. */
  keres: EsemenySor;
  /** Az ügyhöz kapcsolódó jelentések száma: a kérésekben és a kapcsolódó tevékenységekben hivatkozottak, egyszer számolva. */
  jelentesDb: number;
}

export interface TevekenysegSzuro {
  attaseId?: string;
  orszag?: string;
  regio?: RegioKulcs;
  ev?: number;
  felev?: FelevSzam;
}

export interface EredmenySzuro {
  attaseId?: string;
  orszag?: string;
  regio?: RegioKulcs;
  szakasz?: Szakasz;
  allapot?: UgyAllapot;
}

/** Szigorúan növekvő verzió: az azonos ezredmásodpercben mentett két változat sem kaphatja ugyanazt. */
function kovetkezoVerzio(elozo: Date, most: Date): Date {
  return new Date(Math.max(most.getTime(), elozo.getTime() + 1));
}

/** A legalább egyszer lezárt félévek kulcsai; az újranyitott félév is ide tartozik (`lezarva_at` megmarad). */
function lezartFelevek(): Set<string> {
  return new Set(
    db
      .select({ ev: ertekelesiIdoszak.ev, felev: ertekelesiIdoszak.felev })
      .from(ertekelesiIdoszak)
      .where(isNotNull(ertekelesiIdoszak.lezarvaAt))
      .all()
      .map((r) => felevKulcs({ ev: r.ev, felev: r.felev as FelevSzam })),
  );
}

function napLezart(nap: string, lezartak: ReadonlySet<string>): boolean {
  return lezartak.has(felevKulcs(futoFelev(nap)));
}

function regioOrszagai(regio: RegioKulcs): string[] {
  return ORSZAGOK.filter((o) => o.regio === regio).map((o) => o.kod);
}

function sajatOrszagE(attaseId: string, kod: string): boolean {
  return listAttaseOrszagok(attaseId).some((o) => o.kod === kod);
}

function sajatRiportE(riportId: string, attaseId: string): boolean {
  const r = db
    .select({ id: riport.id })
    .from(riport)
    .where(and(eq(riport.id, riportId), eq(riport.szerzoId, attaseId)))
    .get();
  return r !== undefined;
}

/** Aktív ügy: nem megszakadt és nem befejezett. */
function aktivUgyE(u: UgyAdat): boolean {
  return u.allapot === 'aktiv' && !befejezettE(u);
}

/**
 * A tevékenység hivatkozásai: saját ország, saját jelentés és saját aktív ügy. A már hozzákapcsolt ügy
 * (`meglevoEredmenyId`) akkor is megmaradhat, ha közben befejeződött vagy megszakadt.
 */
function hivatkozasokRendben(attaseId: string, i: TevekenysegInput, meglevoEredmenyId: string | null): boolean {
  if (!sajatOrszagE(attaseId, i.orszagKod)) return false;
  if (i.riportId !== null && !sajatRiportE(i.riportId, attaseId)) return false;
  if (i.eredmenyId === null) return true;
  const u = db.select().from(eredmeny).where(eq(eredmeny.id, i.eredmenyId)).get();
  if (!u || u.attaseId !== attaseId) return false;
  return i.eredmenyId === meglevoEredmenyId || aktivUgyE(u);
}

/** Az űrlapból írható oszlopok, felsorolva: a bemenet többi kulcsa (pl. `attaseId`, `kifogas`) nem kerülhet a DB-be. */
function tevekenysegMezok(i: TevekenysegInput): TevekenysegInput {
  return {
    tipus: i.tipus,
    datum: i.datum,
    orszagKod: i.orszagKod,
    megnevezes: i.megnevezes,
    partner: i.partner,
    magyarSzereplo: i.magyarSzereplo,
    leiras: i.leiras,
    riportId: i.riportId,
    eredmenyId: i.eredmenyId,
  };
}

function tevekenysegSorok(feltetel: SQL | undefined): TevekenysegSor[] {
  const lezartak = lezartFelevek();
  return db
    .select({
      id: tevekenyseg.id,
      attaseId: tevekenyseg.attaseId,
      attaseNev: user.name,
      tipus: tevekenyseg.tipus,
      datum: tevekenyseg.datum,
      orszagKod: tevekenyseg.orszagKod,
      megnevezes: tevekenyseg.megnevezes,
      partner: tevekenyseg.partner,
      magyarSzereplo: tevekenyseg.magyarSzereplo,
      leiras: tevekenyseg.leiras,
      riportId: tevekenyseg.riportId,
      riportTargy: riport.targy,
      eredmenyId: tevekenyseg.eredmenyId,
      eredmenyNev: eredmeny.megnevezes,
      kifogas: tevekenyseg.kifogas,
      kifogasSzerzoNev: tevekenyseg.kifogasSzerzoNev,
      updatedAt: tevekenyseg.updatedAt,
    })
    .from(tevekenyseg)
    .innerJoin(user, eq(user.id, tevekenyseg.attaseId))
    .leftJoin(riport, eq(riport.id, tevekenyseg.riportId))
    .leftJoin(eredmeny, eq(eredmeny.id, tevekenyseg.eredmenyId))
    .where(feltetel)
    .orderBy(desc(tevekenyseg.datum), desc(tevekenyseg.createdAt), desc(tevekenyseg.id))
    .all()
    .map((r) => ({ ...r, zarolt: napLezart(r.datum, lezartak), verzio: r.updatedAt.getTime() }));
}

function datumFeltetelek(s: TevekenysegSzuro): SQL[] {
  if (s.ev !== undefined && s.felev !== undefined) {
    const { elsoNap, utolsoNap } = felevNapok({ ev: s.ev, felev: s.felev });
    return [gte(tevekenyseg.datum, elsoNap), lte(tevekenyseg.datum, utolsoNap)];
  }
  if (s.ev !== undefined) return [gte(tevekenyseg.datum, `${s.ev}-01-01`), lte(tevekenyseg.datum, `${s.ev}-12-31`)];
  if (s.felev === 1) return [sql`substr(${tevekenyseg.datum}, 6, 2) <= '06'`];
  if (s.felev === 2) return [sql`substr(${tevekenyseg.datum}, 6, 2) > '06'`];
  return [];
}

/** A tevékenységek dátum szerint csökkenően. */
export function listTevekenysegek(s: TevekenysegSzuro): TevekenysegSor[] {
  return tevekenysegSorok(
    and(
      s.attaseId !== undefined ? eq(tevekenyseg.attaseId, s.attaseId) : undefined,
      s.orszag !== undefined ? eq(tevekenyseg.orszagKod, s.orszag) : undefined,
      s.regio !== undefined ? inArray(tevekenyseg.orszagKod, regioOrszagai(s.regio)) : undefined,
      ...datumFeltetelek(s),
    ),
  );
}

/** Az ügy eseményeinek a félévszámításhoz szükséges része. */
interface EsemenyFelev {
  tipus: EsemenyTipus;
  szakasz: Szakasz | null;
  visszavonva: boolean;
  beszamitasiEv: number | null;
  beszamitasiFelev: number | null;
  createdAt: Date;
}

/** Az ügyek eseményei időrendben, ügyenként. */
function esemenyFelevek(idk: readonly string[]): Map<string, EsemenyFelev[]> {
  const m = new Map<string, EsemenyFelev[]>();
  if (idk.length === 0) return m;
  const sorok = db
    .select({
      eredmenyId: eredmenyEsemeny.eredmenyId,
      tipus: eredmenyEsemeny.tipus,
      szakasz: eredmenyEsemeny.szakasz,
      visszavonva: eredmenyEsemeny.visszavonva,
      beszamitasiEv: eredmenyEsemeny.beszamitasiEv,
      beszamitasiFelev: eredmenyEsemeny.beszamitasiFelev,
      createdAt: eredmenyEsemeny.createdAt,
    })
    .from(eredmenyEsemeny)
    .where(inArray(eredmenyEsemeny.eredmenyId, [...idk]))
    .orderBy(asc(eredmenyEsemeny.createdAt))
    .all();
  for (const { eredmenyId, ...e } of sorok) {
    const lista = m.get(eredmenyId) ?? [];
    lista.push(e);
    m.set(eredmenyId, lista);
  }
  return m;
}

/** Az esemény féléve: a rögzített beszámítási félév, ennek hiányában az esemény napjáé. */
function esemenyFeleve(e: EsemenyFelev): Felev {
  return e.beszamitasiEv !== null && e.beszamitasiFelev !== null
    ? { ev: e.beszamitasiEv, felev: e.beszamitasiFelev as FelevSzam }
    : futoFelev(naptariNap(e.createdAt));
}

/** Törölhető, amíg nincs függő kérése, igazolt szakasza és lezárt félévbe eső eseménye. */
function torolhetoE(u: UgyAdat, esemenyek: readonly EsemenyFelev[], lezartak: ReadonlySet<string>): boolean {
  if (u.kertSzakasz !== null || igazolastKer(u.szakasz)) return false;
  return !esemenyek.some((e) => lezartak.has(felevKulcs(esemenyFeleve(e))));
}

function megallapodasEve(esemenyek: readonly EsemenyFelev[]): number | null {
  let ev: number | null = null;
  for (const e of esemenyek) {
    if (e.tipus === 'igazolas' && e.szakasz === 'megallapodas' && !e.visszavonva) ev = e.beszamitasiEv;
  }
  return ev;
}

/** Az ügyek sorai az élő attasé-névvel és székhely-várossal; a számított mezők ügyenkénti lekérdezés nélkül. */
function eredmenySorok(feltetel: SQL | undefined): EredmenySor[] {
  const sorok = db
    .select({
      id: eredmeny.id,
      attaseId: eredmeny.attaseId,
      attaseNev: user.name,
      varos: attaseOrszag.varos,
      megnevezes: eredmeny.megnevezes,
      orszagKod: eredmeny.orszagKod,
      partner: eredmeny.partner,
      magyarSzereplo: eredmeny.magyarSzereplo,
      hozzajarulas: eredmeny.hozzajarulas,
      leiras: eredmeny.leiras,
      szakasz: eredmeny.szakasz,
      kertSzakasz: eredmeny.kertSzakasz,
      igazolas: eredmeny.igazolas,
      allapot: eredmeny.allapot,
      kifogas: eredmeny.kifogas,
      kifogasSzerzoNev: eredmeny.kifogasSzerzoNev,
      updatedAt: eredmeny.updatedAt,
    })
    .from(eredmeny)
    .innerJoin(user, eq(user.id, eredmeny.attaseId))
    .leftJoin(attaseOrszag, and(eq(attaseOrszag.userId, eredmeny.attaseId), eq(attaseOrszag.szekhely, true)))
    .where(feltetel)
    .orderBy(desc(eredmeny.updatedAt), desc(eredmeny.id))
    .all();
  if (sorok.length === 0) return [];

  const idk = sorok.map((r) => r.id);
  const tevekenysegDb = new Map(
    db
      .select({ eredmenyId: tevekenyseg.eredmenyId, darab: count() })
      .from(tevekenyseg)
      .where(inArray(tevekenyseg.eredmenyId, idk))
      .groupBy(tevekenyseg.eredmenyId)
      .all()
      .map((r) => [r.eredmenyId, r.darab]),
  );
  const esemenyek = esemenyFelevek(idk);
  const lezartak = lezartFelevek();
  return sorok.map((r) => {
    const sajat = esemenyek.get(r.id) ?? [];
    return {
      ...r,
      tevekenysegDb: tevekenysegDb.get(r.id) ?? 0,
      megallapodasEv: megallapodasEve(sajat),
      torolheto: torolhetoE(r, sajat, lezartak),
      verzio: r.updatedAt.getTime(),
    };
  });
}

export function listEredmenyek(s: EredmenySzuro): EredmenySor[] {
  return eredmenySorok(
    and(
      s.attaseId !== undefined ? eq(eredmeny.attaseId, s.attaseId) : undefined,
      s.orszag !== undefined ? eq(eredmeny.orszagKod, s.orszag) : undefined,
      s.regio !== undefined ? inArray(eredmeny.orszagKod, regioOrszagai(s.regio)) : undefined,
      s.szakasz !== undefined ? eq(eredmeny.szakasz, s.szakasz) : undefined,
      s.allapot !== undefined ? eq(eredmeny.allapot, s.allapot) : undefined,
    ),
  );
}

/** Az admin szűrőinek opciói: a bejegyzéssel rendelkező attasék és a bejegyzésekben előforduló országok, névsorban. */
export function listAdminSzuroOpciok(): { attasek: { id: string; nev: string }[]; orszagok: string[] } {
  const sorok = [
    ...db
      .selectDistinct({ id: user.id, nev: user.name, kod: eredmeny.orszagKod })
      .from(eredmeny)
      .innerJoin(user, eq(user.id, eredmeny.attaseId))
      .all(),
    ...db
      .selectDistinct({ id: user.id, nev: user.name, kod: tevekenyseg.orszagKod })
      .from(tevekenyseg)
      .innerJoin(user, eq(user.id, tevekenyseg.attaseId))
      .all(),
  ];
  return {
    attasek: [...new Map(sorok.map((s) => [s.id, s.nev]))]
      .map(([id, nev]) => ({ id, nev }))
      .sort((a, b) => huOsszevet(a.nev, b.nev)),
    orszagok: [...new Set(sorok.map((s) => s.kod))].sort((a, b) => huOsszevet(orszagNev(a), orszagNev(b))),
  };
}

/** Az események időrendben, a hivatkozott jelentés tárgyával. */
function esemenySorok(feltetel: SQL | undefined): (EsemenySor & { eredmenyId: string })[] {
  return db
    .select({
      id: eredmenyEsemeny.id,
      eredmenyId: eredmenyEsemeny.eredmenyId,
      tipus: eredmenyEsemeny.tipus,
      szakasz: eredmenyEsemeny.szakasz,
      szoveg: eredmenyEsemeny.szoveg,
      link: eredmenyEsemeny.link,
      riportId: eredmenyEsemeny.riportId,
      riportTargy: riport.targy,
      szerzoNev: eredmenyEsemeny.szerzoNev,
      szerzoSzerep: eredmenyEsemeny.szerzoSzerep,
      visszavonva: eredmenyEsemeny.visszavonva,
      createdAt: eredmenyEsemeny.createdAt,
    })
    .from(eredmenyEsemeny)
    .leftJoin(riport, eq(riport.id, eredmenyEsemeny.riportId))
    .where(feltetel)
    .orderBy(asc(eredmenyEsemeny.createdAt))
    .all();
}

/** A függő igazoláskérések a legrégebbitől kezdve. */
export function listIgazolasraVar(): IgazolasKeresSor[] {
  const sorok = eredmenySorok(isNotNull(eredmeny.kertSzakasz));
  if (sorok.length === 0) return [];
  const idk = sorok.map((s) => s.id);

  const keresek = new Map<string, EsemenySor>();
  const jelentesek = new Map<string, Set<string>>();
  const jelentesHozzaad = (eredmenyId: string, riportId: string) => {
    jelentesek.set(eredmenyId, (jelentesek.get(eredmenyId) ?? new Set<string>()).add(riportId));
  };
  const keresEsemenyek = esemenySorok(
    and(inArray(eredmenyEsemeny.eredmenyId, idk), eq(eredmenyEsemeny.tipus, 'igazolas_keres')),
  );
  // Időrendben jönnek, így ügyenként a legutóbbi kérés marad meg.
  for (const { eredmenyId, ...e } of keresEsemenyek) {
    keresek.set(eredmenyId, e);
    if (e.riportId !== null) jelentesHozzaad(eredmenyId, e.riportId);
  }
  const kapcsolodok = db
    .select({ eredmenyId: tevekenyseg.eredmenyId, riportId: tevekenyseg.riportId })
    .from(tevekenyseg)
    .where(and(inArray(tevekenyseg.eredmenyId, idk), isNotNull(tevekenyseg.riportId)))
    .all();
  for (const t of kapcsolodok) {
    if (t.eredmenyId !== null && t.riportId !== null) jelentesHozzaad(t.eredmenyId, t.riportId);
  }

  return sorok
    .flatMap((s) => {
      const keres = keresek.get(s.id);
      return keres ? [{ ...s, keres, jelentesDb: jelentesek.get(s.id)?.size ?? 0 }] : [];
    })
    .sort((a, b) => a.keres.createdAt.getTime() - b.keres.createdAt.getTime());
}

export function getEredmeny(id: string): EredmenyReszlet | null {
  const sor = eredmenySorok(eq(eredmeny.id, id))[0];
  if (!sor) return null;
  return {
    ...sor,
    esemenyek: esemenySorok(eq(eredmenyEsemeny.eredmenyId, id)).map(({ eredmenyId: _, ...e }) => e),
    tevekenysegek: tevekenysegSorok(eq(tevekenyseg.eredmenyId, id)),
  };
}

/** Az attasé aktív, nem befejezett ügyei névsorban: ezekhez kapcsolható új tevékenység. */
export function listSajatAktivEredmenyek(attaseId: string): { id: string; megnevezes: string }[] {
  return db
    .select()
    .from(eredmeny)
    .where(and(eq(eredmeny.attaseId, attaseId), eq(eredmeny.allapot, 'aktiv')))
    .all()
    .filter(aktivUgyE)
    .map((u) => ({ id: u.id, megnevezes: u.megnevezes }))
    .sort((a, b) => huOsszevet(a.megnevezes, b.megnevezes));
}

/** A jelentésből indított tevékenység kezdőértékei; idegen vagy nem létező jelentésre `null`. */
export function getRiportElotoltes(
  riportId: string,
  attaseId: string,
): { riportId: string; megnevezes: string; datum: string; orszagKod: string } | null {
  const r = db
    .select({
      targy: riport.targy,
      esemenyDatum: riport.esemenyDatum,
      orszag: riport.orszag,
      createdAt: riport.createdAt,
    })
    .from(riport)
    .where(and(eq(riport.id, riportId), eq(riport.szerzoId, attaseId)))
    .get();
  if (!r) return null;
  return { riportId, megnevezes: r.targy, datum: r.esemenyDatum ?? naptariNap(r.createdAt), orszagKod: r.orszag };
}

/** Hány tevékenység készült a jelentésből. */
export function countRiportTevekenyseg(riportId: string): number {
  return db.select({ darab: count() }).from(tevekenyseg).where(eq(tevekenyseg.riportId, riportId)).get()?.darab ?? 0;
}

export function createTevekenyseg(
  attaseId: string,
  i: TevekenysegInput,
  most: Date = new Date(),
): { eredmeny: IrasEredmeny; id?: string } {
  return db.transaction((tx): { eredmeny: IrasEredmeny; id?: string } => {
    if (!hivatkozasokRendben(attaseId, i, null)) return { eredmeny: 'ervenytelen' };
    if (napLezart(i.datum, lezartFelevek())) return { eredmeny: 'lezart_felev' };
    const id = crypto.randomUUID();
    tx.insert(tevekenyseg).values({ ...tevekenysegMezok(i), id, attaseId, createdAt: most, updatedAt: most }).run();
    return { eredmeny: 'ok', id };
  }, IRAS);
}

/** Módosítás: a kifogás megszűnik. Lezárt félévből ki és lezárt félévbe be sem mozgatható a bejegyzés. */
export function updateTevekenyseg(
  id: string,
  attaseId: string,
  i: TevekenysegInput,
  verzio: number,
  most: Date = new Date(),
): IrasEredmeny {
  return db.transaction((tx): IrasEredmeny => {
    const t = tx.select().from(tevekenyseg).where(eq(tevekenyseg.id, id)).get();
    if (!t || t.attaseId !== attaseId) return 'nincs';
    if (t.updatedAt.getTime() !== verzio) return 'elavult';
    const lezartak = lezartFelevek();
    if (napLezart(t.datum, lezartak) || napLezart(i.datum, lezartak)) return 'lezart_felev';
    if (!hivatkozasokRendben(attaseId, i, t.eredmenyId)) return 'ervenytelen';
    tx.update(tevekenyseg)
      .set({
        ...tevekenysegMezok(i),
        kifogas: null,
        kifogasSzerzoNev: null,
        kifogasAt: null,
        updatedAt: kovetkezoVerzio(t.updatedAt, most),
      })
      .where(eq(tevekenyseg.id, id))
      .run();
    return 'ok';
  }, IRAS);
}

export function deleteTevekenyseg(id: string, attaseId: string): IrasEredmeny {
  return db.transaction((tx): IrasEredmeny => {
    const t = tx.select().from(tevekenyseg).where(eq(tevekenyseg.id, id)).get();
    if (!t || t.attaseId !== attaseId) return 'nincs';
    if (napLezart(t.datum, lezartFelevek())) return 'lezart_felev';
    tx.delete(tevekenyseg).where(eq(tevekenyseg.id, id)).run();
    return 'ok';
  }, IRAS);
}

interface UjEsemeny {
  tipus: EsemenyTipus;
  szakasz: Szakasz;
  szoveg?: string;
  link?: string | null;
  riportId?: string | null;
  szerzoNev: string;
  szerzoSzerep: 'admin' | 'attase';
  /** Csak a félévbe számító eseményeknél (létrehozás, szakaszváltás, igazolás). */
  beszamitasi?: Felev;
}

function esemenyIr(tx: Tx, eredmenyId: string, createdAt: Date, e: UjEsemeny): void {
  const { beszamitasi, ...adat } = e;
  tx.insert(eredmenyEsemeny)
    .values({
      id: crypto.randomUUID(),
      eredmenyId,
      ...adat,
      beszamitasiEv: beszamitasi?.ev ?? null,
      beszamitasiFelev: beszamitasi?.felev ?? null,
      createdAt,
    })
    .run();
}

/** Az ügy mentése a következő verzióval; a verziót adja vissza. */
function ugyIr(tx: Tx, u: Ugy, most: Date, adat: Partial<typeof eredmeny.$inferInsert>): Date {
  const updatedAt = kovetkezoVerzio(u.updatedAt, most);
  tx.update(eredmeny).set({ ...adat, updatedAt }).where(eq(eredmeny.id, u.id)).run();
  return updatedAt;
}

/**
 * Állapotváltás és a hozzá tartozó esemény. Az esemény időpontja az ügy új verziója: ügyenként szigorúan nő,
 * így az azonos ezredmásodpercben történt lépések sorrendje is egyértelmű.
 */
function lepes(tx: Tx, u: Ugy, most: Date, adat: Partial<typeof eredmeny.$inferInsert>, e: UjEsemeny): void {
  esemenyIr(tx, u.id, ugyIr(tx, u, most, adat), e);
}

/** Az attasé művelete az ügyén: tulajdonos, verzió és állapotgép ellenőrzése egy írási tranzakcióban. */
function attaseIras(
  id: string,
  attaseId: string,
  verzio: number,
  muvelet: AttaseMuvelet,
  fn: (tx: Tx, u: Ugy) => IrasEredmeny,
): IrasEredmeny {
  return db.transaction((tx): IrasEredmeny => {
    const u = tx.select().from(eredmeny).where(eq(eredmeny.id, id)).get();
    if (!u || u.attaseId !== attaseId) return 'nincs';
    if (u.updatedAt.getTime() !== verzio) return 'elavult';
    if (!attaseMuveletek(u, false).includes(muvelet)) return 'ervenytelen';
    return fn(tx, u);
  }, IRAS);
}

/** A központ művelete az ügyön: verzió és állapotgép ellenőrzése egy írási tranzakcióban. */
function adminIras(id: string, verzio: number, muvelet: AdminMuvelet, fn: (tx: Tx, u: Ugy) => IrasEredmeny): IrasEredmeny {
  return db.transaction((tx): IrasEredmeny => {
    const u = tx.select().from(eredmeny).where(eq(eredmeny.id, id)).get();
    if (!u) return 'nincs';
    if (u.updatedAt.getTime() !== verzio) return 'elavult';
    if (!adminMuveletek(u, u.kifogas !== null).includes(muvelet)) return 'ervenytelen';
    return fn(tx, u);
  }, IRAS);
}

export function createEredmeny(
  attaseId: string,
  i: EredmenyInput,
  szerzoNev: string,
  most: Date = new Date(),
): { eredmeny: IrasEredmeny; id?: string } {
  return db.transaction((tx): { eredmeny: IrasEredmeny; id?: string } => {
    if (!sajatOrszagE(attaseId, i.orszagKod)) return { eredmeny: 'ervenytelen' };
    const id = crypto.randomUUID();
    tx.insert(eredmeny)
      .values({
        id,
        attaseId,
        megnevezes: i.megnevezes,
        orszagKod: i.orszagKod,
        partner: i.partner,
        magyarSzereplo: i.magyarSzereplo,
        hozzajarulas: i.hozzajarulas,
        leiras: i.leiras,
        szakasz: i.kezdoSzakasz,
        igazolas: 'nem_igenyel',
        allapot: 'aktiv',
        createdAt: most,
        updatedAt: most,
      })
      .run();
    esemenyIr(tx, id, most, {
      tipus: 'letrehozas',
      szakasz: i.kezdoSzakasz,
      szerzoNev,
      szerzoSzerep: 'attase',
      beszamitasi: futoFelev(naptariNap(most)),
    });
    return { eredmeny: 'ok', id };
  }, IRAS);
}

/**
 * Az ügy módosítása: a kifogás megszűnik. Zárolt ügynél csak a leírás változhat; a kezdő szakasz létrehozás után
 * nem módosítható, ezért a `kezdoSzakasz` bemenetet figyelmen kívül hagyja.
 */
export function updateEredmeny(
  id: string,
  attaseId: string,
  i: EredmenyInput,
  verzio: number,
  most: Date = new Date(),
): IrasEredmeny {
  return attaseIras(id, attaseId, verzio, 'modosit', (tx, u) => {
    if (mezokZarolvaE(u)) {
      const valtozott =
        u.megnevezes !== i.megnevezes ||
        u.orszagKod !== i.orszagKod ||
        u.partner !== i.partner ||
        u.magyarSzereplo !== i.magyarSzereplo ||
        u.hozzajarulas !== i.hozzajarulas;
      if (valtozott) return 'ervenytelen';
    } else if (!sajatOrszagE(attaseId, i.orszagKod)) {
      return 'ervenytelen';
    }
    ugyIr(tx, u, most, {
      megnevezes: i.megnevezes,
      orszagKod: i.orszagKod,
      partner: i.partner,
      magyarSzereplo: i.magyarSzereplo,
      hozzajarulas: i.hozzajarulas,
      leiras: i.leiras,
      kifogas: null,
      kifogasSzerzoNev: null,
      kifogasAt: null,
    });
    return 'ok';
  });
}

/** Csak az állapotgép szerint törölhető ügy törölhető; a hozzá kapcsolt tevékenységek megmaradnak, kapcsolat nélkül. */
export function deleteEredmeny(id: string, attaseId: string): IrasEredmeny {
  return db.transaction((tx): IrasEredmeny => {
    const u = tx.select().from(eredmeny).where(eq(eredmeny.id, id)).get();
    if (!u || u.attaseId !== attaseId) return 'nincs';
    const torolheto = torolhetoE(u, esemenyFelevek([id]).get(id) ?? [], lezartFelevek());
    if (!attaseMuveletek(u, torolheto).includes('torol')) return 'ervenytelen';
    tx.delete(eredmeny).where(eq(eredmeny.id, id)).run();
    return 'ok';
  }, IRAS);
}

/** Lehetőség → Kapcsolat: azonnal érvényes, a beszámítási félév a lépés napjáé. */
export function kapcsolatbaLep(
  id: string,
  attaseId: string,
  szerzoNev: string,
  verzio: number,
  most: Date = new Date(),
): IrasEredmeny {
  return attaseIras(id, attaseId, verzio, 'kapcsolatba_lep', (tx, u) => {
    lepes(tx, u, most, { szakasz: 'kapcsolat' }, {
      tipus: 'szakaszvaltas',
      szakasz: 'kapcsolat',
      szerzoNev,
      szerzoSzerep: 'attase',
      beszamitasi: futoFelev(naptariNap(most)),
    });
    return 'ok';
  });
}

/** A következő szakasz igazolásának kérése: az érvényes szakasz a döntésig nem változik. */
export function kerIgazolast(
  id: string,
  attaseId: string,
  i: IgazolasKeresInput,
  szerzoNev: string,
  most: Date = new Date(),
): IrasEredmeny {
  return attaseIras(id, attaseId, i.verzio, 'igazolast_ker', (tx, u) => {
    const kert = kovetkezoSzakasz(u.szakasz);
    if (kert === null) return 'ervenytelen';
    if (i.riportId !== null && !sajatRiportE(i.riportId, attaseId)) return 'ervenytelen';
    lepes(tx, u, most, { kertSzakasz: kert, igazolas: 'igazolasra_var' }, {
      tipus: 'igazolas_keres',
      szakasz: kert,
      szoveg: i.indoklas,
      link: i.link,
      riportId: i.riportId,
      szerzoNev,
      szerzoSzerep: 'attase',
    });
    return 'ok';
  });
}

/**
 * A függő kérés igazolása. A beszámítási félév itt rögzül (spec 5.4.): a kérés féléve, ha azt még soha nem zárták
 * le, különben az igazolásé. Az ügy kifogása megszűnik, mert igazolt szakaszban már nem volna visszavonható.
 */
export function igazol(id: string, szerzoNev: string, verzio: number, most: Date = new Date()): IrasEredmeny {
  return adminIras(id, verzio, 'igazol', (tx, u) => {
    const kert = u.kertSzakasz;
    const keres = tx
      .select({ createdAt: eredmenyEsemeny.createdAt })
      .from(eredmenyEsemeny)
      .where(and(eq(eredmenyEsemeny.eredmenyId, id), eq(eredmenyEsemeny.tipus, 'igazolas_keres')))
      .orderBy(desc(eredmenyEsemeny.createdAt))
      .limit(1)
      .get();
    if (kert === null || !keres) return 'ervenytelen';
    const kertNap = naptariNap(keres.createdAt);
    lepes(
      tx,
      u,
      most,
      { szakasz: kert, kertSzakasz: null, igazolas: 'igazolt', kifogas: null, kifogasSzerzoNev: null, kifogasAt: null },
      {
        tipus: 'igazolas',
        szakasz: kert,
        szerzoNev,
        szerzoSzerep: 'admin',
        beszamitasi: beszamitasiFelev(kertNap, naptariNap(most), napLezart(kertNap, lezartFelevek())),
      },
    );
    return 'ok';
  });
}

/** A függő kérés visszaküldése: az ügy az érvényes szakaszában marad, az attasé új kérést indíthat. */
export function visszakuld(id: string, i: MegjegyzesInput, szerzoNev: string, most: Date = new Date()): IrasEredmeny {
  return adminIras(id, i.verzio, 'visszakuld', (tx, u) => {
    if (u.kertSzakasz === null) return 'ervenytelen';
    lepes(tx, u, most, { kertSzakasz: null, igazolas: 'visszakuldott' }, {
      tipus: 'visszakuldes',
      szakasz: u.kertSzakasz,
      szoveg: i.megjegyzes,
      szerzoNev,
      szerzoSzerep: 'admin',
    });
    return 'ok';
  });
}

function elozoSzakasz(k: Szakasz): Szakasz | null {
  const i = SZAKASZOK.findIndex((s) => s.kulcs === k);
  return SZAKASZOK[i - 1]?.kulcs ?? null;
}

/**
 * A korábbi igazolás visszavonása: a legutóbbi érvényes igazolás visszavontnak számít, az ügy egy szakaszt visszalép.
 * A megszakadt ügy megszakadt marad. A már lezárt félévek rögzített mutatóihoz nem nyúl.
 */
export function visszavon(id: string, i: MegjegyzesInput, szerzoNev: string, most: Date = new Date()): IrasEredmeny {
  return adminIras(id, i.verzio, 'visszavon', (tx, u) => {
    const elozo = elozoSzakasz(u.szakasz);
    const igazolas = tx
      .select({ id: eredmenyEsemeny.id })
      .from(eredmenyEsemeny)
      .where(
        and(
          eq(eredmenyEsemeny.eredmenyId, id),
          eq(eredmenyEsemeny.tipus, 'igazolas'),
          eq(eredmenyEsemeny.visszavonva, false),
        ),
      )
      .orderBy(desc(eredmenyEsemeny.createdAt))
      .limit(1)
      .get();
    if (elozo === null || !igazolas) return 'ervenytelen';
    tx.update(eredmenyEsemeny).set({ visszavonva: true }).where(eq(eredmenyEsemeny.id, igazolas.id)).run();
    lepes(tx, u, most, { szakasz: elozo, igazolas: 'visszakuldott' }, {
      tipus: 'igazolas_visszavonas',
      szakasz: u.szakasz,
      szoveg: i.megjegyzes,
      szerzoNev,
      szerzoSzerep: 'admin',
    });
    return 'ok';
  });
}

/** Megszakítás: a függő kérés törlődik, az igazolás állapota a maradó szakaszból adódik. */
export function megszakit(
  id: string,
  attaseId: string,
  i: MegjegyzesInput,
  szerzoNev: string,
  most: Date = new Date(),
): IrasEredmeny {
  return attaseIras(id, attaseId, i.verzio, 'megszakit', (tx, u) => {
    lepes(
      tx,
      u,
      most,
      { allapot: 'megszakadt', kertSzakasz: null, igazolas: igazolastKer(u.szakasz) ? 'igazolt' : 'nem_igenyel' },
      { tipus: 'megszakitas', szakasz: u.szakasz, szoveg: i.megjegyzes, szerzoNev, szerzoSzerep: 'attase' },
    );
    return 'ok';
  });
}

export function ujraindit(
  id: string,
  attaseId: string,
  szerzoNev: string,
  verzio: number,
  most: Date = new Date(),
): IrasEredmeny {
  return attaseIras(id, attaseId, verzio, 'ujraindit', (tx, u) => {
    lepes(tx, u, most, { allapot: 'aktiv' }, {
      tipus: 'ujrainditas',
      szakasz: u.szakasz,
      szerzoNev,
      szerzoSzerep: 'attase',
    });
    return 'ok';
  });
}

/**
 * A tevékenység kifogásolása a megnyitáskori verzióval: a közben módosított bejegyzésre nem kerülhet olyan kifogás,
 * amelyet az admin a korábbi tartalom alapján írt. A meglévő kifogást nem írja felül.
 */
export function kifogasolTevekenyseg(id: string, i: MegjegyzesInput, szerzoNev: string, most: Date = new Date()): IrasEredmeny {
  return db.transaction((tx): IrasEredmeny => {
    const t = tx.select().from(tevekenyseg).where(eq(tevekenyseg.id, id)).get();
    if (!t) return 'nincs';
    if (t.updatedAt.getTime() !== i.verzio) return 'elavult';
    if (t.kifogas !== null) return 'ervenytelen';
    tx.update(tevekenyseg)
      .set({
        kifogas: i.megjegyzes,
        kifogasSzerzoNev: szerzoNev,
        kifogasAt: most,
        updatedAt: kovetkezoVerzio(t.updatedAt, most),
      })
      .where(eq(tevekenyseg.id, id))
      .run();
    return 'ok';
  }, IRAS);
}

export function visszavonTevekenysegKifogas(id: string): IrasEredmeny {
  return db.transaction((tx): IrasEredmeny => {
    const t = tx.select().from(tevekenyseg).where(eq(tevekenyseg.id, id)).get();
    if (!t) return 'nincs';
    if (t.kifogas === null) return 'ervenytelen';
    tx.update(tevekenyseg)
      .set({
        kifogas: null,
        kifogasSzerzoNev: null,
        kifogasAt: null,
        updatedAt: kovetkezoVerzio(t.updatedAt, new Date()),
      })
      .where(eq(tevekenyseg.id, id))
      .run();
    return 'ok';
  }, IRAS);
}

export function kifogasolEredmeny(id: string, i: MegjegyzesInput, szerzoNev: string, most: Date = new Date()): IrasEredmeny {
  return adminIras(id, i.verzio, 'kifogasol', (tx, u) => {
    ugyIr(tx, u, most, { kifogas: i.megjegyzes, kifogasSzerzoNev: szerzoNev, kifogasAt: most });
    return 'ok';
  });
}

export function visszavonEredmenyKifogas(id: string, verzio: number): IrasEredmeny {
  return adminIras(id, verzio, 'kifogast_visszavon', (tx, u) => {
    ugyIr(tx, u, new Date(), { kifogas: null, kifogasSzerzoNev: null, kifogasAt: null });
    return 'ok';
  });
}

function esemenyBemenet(e: EsemenyFelev): EredmenyEsemenyBemenet {
  return {
    tipus: e.tipus,
    szakasz: e.szakasz,
    nap: naptariNap(e.createdAt),
    beszamitasi:
      e.beszamitasiEv !== null && e.beszamitasiFelev !== null
        ? { ev: e.beszamitasiEv, felev: e.beszamitasiFelev as FelevSzam }
        : null,
    visszavonva: e.visszavonva,
  };
}

/**
 * A félévi mutatók bemenete attasénként, állandó számú lekérdezéssel. A tevékenységekből a félév napjaira esők
 * kellenek, az ügyekből mind, mert az aktív ügyek és a függő kérések a számítás pillanatának állapotát mutatják.
 * Bejegyzés nélküli attasénál üres a bemenet.
 */
export function bovitettForrasok(attaseIdk: readonly string[], f: Felev): Map<string, BovitettBemenet> {
  const forrasok = new Map<string, BovitettBemenet>(attaseIdk.map((id) => [id, { tevekenysegek: [], eredmenyek: [] }]));
  if (attaseIdk.length === 0) return forrasok;
  const { elsoNap, utolsoNap } = felevNapok(f);

  const tevekenysegek = db
    .select({
      attaseId: tevekenyseg.attaseId,
      id: tevekenyseg.id,
      tipus: tevekenyseg.tipus,
      datum: tevekenyseg.datum,
      megnevezes: tevekenyseg.megnevezes,
      partner: tevekenyseg.partner,
      magyarSzereplo: tevekenyseg.magyarSzereplo,
      kifogasolt: isNotNull(tevekenyseg.kifogas).mapWith(Boolean),
    })
    .from(tevekenyseg)
    .where(
      and(inArray(tevekenyseg.attaseId, [...attaseIdk]), gte(tevekenyseg.datum, elsoNap), lte(tevekenyseg.datum, utolsoNap)),
    )
    .all();
  for (const { attaseId, ...t } of tevekenysegek) forrasok.get(attaseId)?.tevekenysegek.push(t);

  const ugyek = db
    .select({
      attaseId: eredmeny.attaseId,
      id: eredmeny.id,
      megnevezes: eredmeny.megnevezes,
      hozzajarulas: eredmeny.hozzajarulas,
      szakasz: eredmeny.szakasz,
      kertSzakasz: eredmeny.kertSzakasz,
      igazolas: eredmeny.igazolas,
      allapot: eredmeny.allapot,
      kifogasolt: isNotNull(eredmeny.kifogas).mapWith(Boolean),
    })
    .from(eredmeny)
    .where(inArray(eredmeny.attaseId, [...attaseIdk]))
    .orderBy(desc(eredmeny.createdAt), desc(eredmeny.id))
    .all();
  const esemenyek = esemenyFelevek(ugyek.map((u) => u.id));
  for (const { attaseId, ...u } of ugyek) {
    forrasok.get(attaseId)?.eredmenyek.push({ ...u, esemenyek: (esemenyek.get(u.id) ?? []).map(esemenyBemenet) });
  }
  return forrasok;
}

/** A jelenleg függő igazoláskérések közül azok, amelyeket legkésőbb a félév utolsó napján adtak be. */
export function countFuggoKeresek(f: Felev): number {
  const { utolsoNap } = felevNapok(f);
  return db
    .select({ utolsoKeres: max(eredmenyEsemeny.createdAt) })
    .from(eredmeny)
    .innerJoin(
      eredmenyEsemeny,
      and(eq(eredmenyEsemeny.eredmenyId, eredmeny.id), eq(eredmenyEsemeny.tipus, 'igazolas_keres')),
    )
    .where(isNotNull(eredmeny.kertSzakasz))
    .groupBy(eredmeny.id)
    .all()
    .filter((r) => r.utolsoKeres !== null && naptariNap(r.utolsoKeres) <= utolsoNap).length;
}

/**
 * A menüpont számlálója. Admin: a függő igazoláskérések. Attasé: a visszaküldött vagy kifogásolt saját ügyek
 * (a kettő egyszerre is igaz lehet, az ügy egyszer számít) és a kifogásolt saját tevékenységek.
 */
export function countTevekenysegTeendo(session: { userId: string; role: 'admin' | 'attase' }): number {
  if (session.role === 'admin') {
    return db.select({ darab: count() }).from(eredmeny).where(isNotNull(eredmeny.kertSzakasz)).get()?.darab ?? 0;
  }
  const ugyek = db
    .select({ darab: count() })
    .from(eredmeny)
    .where(
      and(
        eq(eredmeny.attaseId, session.userId),
        or(eq(eredmeny.igazolas, 'visszakuldott'), isNotNull(eredmeny.kifogas)),
      ),
    )
    .get()?.darab ?? 0;
  const tevekenysegek = db
    .select({ darab: count() })
    .from(tevekenyseg)
    .where(and(eq(tevekenyseg.attaseId, session.userId), isNotNull(tevekenyseg.kifogas)))
    .get()?.darab ?? 0;
  return ugyek + tevekenysegek;
}
