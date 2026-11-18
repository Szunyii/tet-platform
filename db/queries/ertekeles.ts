import 'server-only';
import { and, asc, eq, gte, inArray, isNotNull, lt, lte, min, or } from 'drizzle-orm';
import { db } from '../index';
import { attaseErtekeles, ertekelesiIdoszak, riport, szempontMinosites, ticket, ticketUzenet, user } from '../schema';
import { listOrszagokFelhasznalonkent } from './attase-orszag';
import { listProfilMutatok } from './orszagprofil';
import { listCimzettJeloltek } from './ticket';
import { naptariNap } from '../../lib/datum';
import {
  elozoFelev, felevBefejezodott, felevHatarok, felevNapok, felevOsszevet, megnyithato, type Felev, type FelevSzam,
} from '../../lib/ertekeles-idoszak';
import {
  halozatiMedianok, szamolMutatok, type ErtekelesMutatok, type MutatoBemenet,
} from '../../lib/ertekeles-mutatok';
import {
  automatikusOrszagismeret, hatekonyFokozatok, hianyzoAttasek, teljesE, valtozasSzamol, type ErtekelesSor,
} from '../../lib/ertekeles-osszesites';
import {
  AUTOMATIKUS_ERTEKELO, isFokozat, isOsszFokozat, isSzempontKulcs, SZEMPONT_KULCSOK,
  type Fokozat, type OsszFokozat, type RogzitettOrszag, type SzempontKulcs,
} from '../../lib/ertekeles-szotar';
import type { OsszInput, SzempontInput } from '../../lib/ertekeles-validacio';
import { huOsszevet } from '../../lib/rendezes';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Az írás előtti olvasás miatt `immediate`: egy másik folyamat írása így a busy_timeout-ig várakoztat, nem
// SQLITE_BUSY_SNAPSHOT-tal bukik el. A kapcsolat egyetlen (better-sqlite3), ezért a tranzakción belül hívott
// olvasó segédek a `db`-n át is a tranzakció aktuális állapotát látják.
const IRAS = { behavior: 'immediate' } as const;

/** Az adatlap idősorában legfeljebb ennyi lezárt félév látszik. */
const ELOZMENY_MAX = 4;

export interface IdoszakSor {
  id: string;
  ev: number;
  felev: FelevSzam;
  statusz: 'nyitott' | 'lezart';
  lezarvaAt: Date | null;
  lezartaNev: string | null;
}

export interface HalozatNezet {
  idoszak: IdoszakSor | null;
  sorok: ErtekelesSor[];
}

export interface SzempontMinosites {
  fokozat: Fokozat;
  indoklas: string | null;
  ertekeloNev: string;
  updatedAt: Date;
  verzio: number;
}

export interface ElozmenySor {
  felev: Felev;
  fokozatok: ErtekelesSor['fokozatok'];
  osszFokozat: OsszFokozat | null;
}

export interface AdatlapNezet {
  idoszak: IdoszakSor;
  sor: ErtekelesSor;
  osszIndoklas: string | null;
  fejlesztesiCel: string | null;
  ertekeloNev: string | null;
  minositveAt: Date | null;
  /** Az értékelési sor verziója (`updatedAt`, ms): az összminősítés mentése ehhez hasonlít. */
  osszVerzio: number;
  minositesek: Partial<Record<SzempontKulcs, SzempontMinosites>>;
  /** A rögzített pillanatkép, nyitott félévben az élő számítás; a kihagyott sornál `null`. */
  mutatok: ErtekelesMutatok | null;
  elozmeny: ElozmenySor[];
  letezoJelentesek: string[];
  letezoTicketek: string[];
}

export type MentesEredmeny = 'ok' | 'nincs' | 'lezart' | 'kihagyott' | 'automatikus' | 'elavult' | 'hianyos';

export type LezarasEredmeny =
  | { eredmeny: 'ok' | 'nincs' | 'mar_lezart' | 'nem_ert_veget' }
  | { eredmeny: 'hianyos'; hianyzok: string[] };

/** Egy aktív attasé élő hozzárendelése: ebből készül az értékelési sor pillanatképe. */
interface EloAttase {
  nev: string;
  szekhelyKod: string;
  varos: string | null;
  orszagok: RogzitettOrszag[];
}

/** Az aktív, székhellyel rendelkező attasék azonosító szerint. */
function eloAttasek(): Map<string, EloAttase> {
  const hozzarendelesek = listOrszagokFelhasznalonkent();
  return new Map(
    listCimzettJeloltek().map((j) => [
      j.id,
      {
        nev: j.nev,
        szekhelyKod: j.orszag,
        varos: j.varos,
        orszagok: (hozzarendelesek.get(j.id) ?? []).map(({ kod, szekhely, vezeto }) => ({ kod, szekhely, vezeto })),
      },
    ]),
  );
}

function idoszakbol(r: typeof ertekelesiIdoszak.$inferSelect): IdoszakSor {
  return {
    id: r.id,
    ev: r.ev,
    // A CHECK-ek csak ezeket az értékeket engedik.
    felev: r.felev as FelevSzam,
    statusz: r.statusz as IdoszakSor['statusz'],
    lezarvaAt: r.lezarvaAt,
    lezartaNev: r.lezartaNev,
  };
}

export function getIdoszak(f: Felev): IdoszakSor | null {
  const r = db
    .select()
    .from(ertekelesiIdoszak)
    .where(and(eq(ertekelesiIdoszak.ev, f.ev), eq(ertekelesiIdoszak.felev, f.felev)))
    .get();
  return r ? idoszakbol(r) : null;
}

/** Az év lezárt félévei növekvő sorrendben. */
export function listLezartFelevek(ev: number): FelevSzam[] {
  return db
    .select({ felev: ertekelesiIdoszak.felev })
    .from(ertekelesiIdoszak)
    .where(and(eq(ertekelesiIdoszak.ev, ev), eq(ertekelesiIdoszak.statusz, 'lezart')))
    .orderBy(asc(ertekelesiIdoszak.felev))
    .all()
    .map((r) => r.felev as FelevSzam);
}

/** Az attasék sorai az időszakban; a már meglévő sort érintetlenül hagyja. */
function beszurSorok(tx: Tx, idoszakId: string, attasek: readonly (readonly [string, EloAttase])[]): void {
  if (attasek.length === 0) return;
  tx.insert(attaseErtekeles)
    .values(
      attasek.map(([attaseId, a]) => ({
        id: crypto.randomUUID(),
        idoszakId,
        attaseId,
        attaseNev: a.nev,
        szekhelyKod: a.szekhelyKod,
        varos: a.varos,
        orszagok: a.orszagok,
      })),
    )
    .onConflictDoNothing()
    .run();
}

/** Új időszak az aktív attasék soraival. */
function ujIdoszak(tx: Tx, f: Felev): string {
  const id = crypto.randomUUID();
  tx.insert(ertekelesiIdoszak).values({ id, ev: f.ev, felev: f.felev, statusz: 'nyitott' }).run();
  beszurSorok(tx, id, [...eloAttasek()]);
  return id;
}

/** Az időszak létrehozása dátumkorlát nélkül; ha már létezik, a meglévő azonosítóját adja. */
export function letrehozIdoszak(f: Felev): string {
  return db.transaction((tx) => getIdoszak(f)?.id ?? ujIdoszak(tx, f), IRAS);
}

/** A félév megnyitása: csak a futó és a közvetlenül előtte lévő félév nyitható meg (`ma`: budapesti naptári nap). */
export function megnyitIdoszak(f: Felev, ma: string): 'ok' | 'nem_nyithato' | 'mar_letezik' {
  return db.transaction((tx) => {
    if (getIdoszak(f)) return 'mar_letezik';
    if (!megnyithato(f, ma)) return 'nem_nyithato';
    ujIdoszak(tx, f);
    return 'ok';
  }, IRAS);
}

/** A mentett fokozatok értékelésenként. */
function mentettFokozatok(ertekelesIdk: readonly string[]): Map<string, ErtekelesSor['fokozatok']> {
  const m = new Map<string, ErtekelesSor['fokozatok']>();
  if (ertekelesIdk.length === 0) return m;
  const sorok = db
    .select({ ertekelesId: szempontMinosites.ertekelesId, szempont: szempontMinosites.szempont, fokozat: szempontMinosites.fokozat })
    .from(szempontMinosites)
    .where(inArray(szempontMinosites.ertekelesId, [...ertekelesIdk]))
    .all();
  for (const r of sorok) {
    if (!isSzempontKulcs(r.szempont) || !isFokozat(r.fokozat)) continue;
    const fokozatok = m.get(r.ertekelesId) ?? {};
    fokozatok[r.szempont] = r.fokozat;
    m.set(r.ertekelesId, fokozatok);
  }
  return m;
}

function osszFokozatbol(n: number | null): OsszFokozat | null {
  return n !== null && isOsszFokozat(n) ? n : null;
}

/** Attasénként a legutóbbi, `f`-nél korábbi, lezárt és nem kihagyott értékelés összminősítése. */
function elozoOsszFokozatok(f: Felev): Map<string, OsszFokozat> {
  const sorok = db
    .select({
      attaseId: attaseErtekeles.attaseId,
      osszFokozat: attaseErtekeles.osszFokozat,
      ev: ertekelesiIdoszak.ev,
      felev: ertekelesiIdoszak.felev,
    })
    .from(attaseErtekeles)
    .innerJoin(ertekelesiIdoszak, eq(attaseErtekeles.idoszakId, ertekelesiIdoszak.id))
    .where(and(eq(ertekelesiIdoszak.statusz, 'lezart'), eq(attaseErtekeles.kimarad, false)))
    .orderBy(asc(ertekelesiIdoszak.ev), asc(ertekelesiIdoszak.felev))
    .all();
  const m = new Map<string, OsszFokozat>();
  for (const r of sorok) {
    const fokozat = osszFokozatbol(r.osszFokozat);
    if (fokozat !== null && felevOsszevet({ ev: r.ev, felev: r.felev as FelevSzam }, f) < 0) m.set(r.attaseId, fokozat);
  }
  return m;
}

interface NezetSor {
  sor: ErtekelesSor;
  /** Van rögzített mutató-pillanatkép: ettől kezdve a sor a pillanatképét használja, nem az élő hozzárendelést. */
  rogzitett: boolean;
}

/**
 * Az időszak sorai a nézethez. Nyitott félévben a még nem rögzített sor az aktív attasé élő hozzárendelését
 * mutatja, minden más a pillanatképet. A már nem aktív attasé hiányos, nem kihagyott sora nem látszik
 * (`rejtettIdk`), így a felület hiánylistája és a lezárás ugyanazt látja; lezáráskor ezek törlődnek.
 */
function idoszakNezete(idoszak: IdoszakSor, elok: ReadonlyMap<string, EloAttase>): { lathato: NezetSor[]; rejtettIdk: string[] } {
  const nyitott = idoszak.statusz === 'nyitott';
  const nyers = db
    .select({
      id: attaseErtekeles.id,
      attaseId: attaseErtekeles.attaseId,
      attaseNev: attaseErtekeles.attaseNev,
      szekhelyKod: attaseErtekeles.szekhelyKod,
      varos: attaseErtekeles.varos,
      orszagok: attaseErtekeles.orszagok,
      kimarad: attaseErtekeles.kimarad,
      kimaradasOka: attaseErtekeles.kimaradasOka,
      osszFokozat: attaseErtekeles.osszFokozat,
      rogzitett: isNotNull(attaseErtekeles.mutatok).mapWith(Boolean),
    })
    .from(attaseErtekeles)
    .where(eq(attaseErtekeles.idoszakId, idoszak.id))
    .all();
  const fokozatok = mentettFokozatok(nyers.map((r) => r.id));
  const elozok = elozoOsszFokozatok({ ev: idoszak.ev, felev: idoszak.felev });

  const lathato: NezetSor[] = [];
  const rejtettIdk: string[] = [];
  for (const r of nyers) {
    const elo = nyitott && !r.rogzitett ? elok.get(r.attaseId) : undefined;
    const orszagok = elo?.orszagok ?? r.orszagok;
    const mentett = fokozatok.get(r.id) ?? {};
    const osszFokozat = osszFokozatbol(r.osszFokozat);
    const sor: ErtekelesSor = {
      ertekelesId: r.id,
      attaseId: r.attaseId,
      nev: elo?.nev ?? r.attaseNev,
      szekhelyKod: elo?.szekhelyKod ?? r.szekhelyKod,
      varos: elo ? elo.varos : r.varos,
      orszagok,
      kimarad: r.kimarad,
      kimaradasOka: r.kimaradasOka,
      fokozatok: nyitott ? hatekonyFokozatok(mentett, orszagok) : mentett,
      osszFokozat,
      valtozas: r.kimarad ? null : valtozasSzamol(osszFokozat, elozok.get(r.attaseId) ?? null),
    };
    if (nyitott && !r.kimarad && !elok.has(r.attaseId) && !teljesE(sor)) rejtettIdk.push(r.id);
    else lathato.push({ sor, rogzitett: r.rogzitett });
  }
  lathato.sort((a, b) => huOsszevet(a.sor.nev, b.sor.nev));
  return { lathato, rejtettIdk };
}

/** A félév vége előtt aktívvá vált attasék hiányzó sorai; írási zárat csak akkor kér, ha van mit pótolni. */
function potolSorok(idoszakId: string, elok: ReadonlyMap<string, EloAttase>): void {
  const meglevok = new Set(
    db
      .select({ attaseId: attaseErtekeles.attaseId })
      .from(attaseErtekeles)
      .where(eq(attaseErtekeles.idoszakId, idoszakId))
      .all()
      .map((r) => r.attaseId),
  );
  const hianyzok = [...elok].filter(([id]) => !meglevok.has(id));
  if (hianyzok.length > 0) db.transaction((tx) => beszurSorok(tx, idoszakId, hianyzok), IRAS);
}

/**
 * A félév hálózati nézete. Nyitott félévben, a félév végéig előbb pótolja az újonnan aktívvá vált attasék
 * sorait; lezárni csak a félév vége után lehet, ezért újranyitott félévbe új sor nem kerül.
 */
export function listHalozat(f: Felev, most: Date = new Date()): HalozatNezet {
  const idoszak = getIdoszak(f);
  if (!idoszak) return { idoszak: null, sorok: [] };
  const elok = eloAttasek();
  if (idoszak.statusz === 'nyitott' && naptariNap(most) <= felevNapok(f).utolsoNap) potolSorok(idoszak.id, elok);
  return { idoszak, sorok: idoszakNezete(idoszak, elok).lathato.map((n) => n.sor) };
}

type MutatoForras = Pick<MutatoBemenet, 'jelentesek' | 'tickets' | 'elozoFelevJelentesDb'>;

/**
 * A mutatók forrásadatai attasénként, két lekérdezéssel: a félév és az előző félév jelentései, valamint a
 * félévben nyitott vagy a félévbe eső határidejű ticketek az első attasé-üzenet idejével.
 */
function mutatoForrasok(attaseIdk: readonly string[], f: Felev): Map<string, MutatoForras> {
  const forrasok = new Map<string, MutatoForras>(
    attaseIdk.map((id) => [id, { jelentesek: [], tickets: [], elozoFelevJelentesDb: 0 }]),
  );
  if (attaseIdk.length === 0) return forrasok;
  const { kezdet, vegeKizaro } = felevHatarok(f);
  const { elsoNap, utolsoNap } = felevNapok(f);

  const jelentesek = db
    .select({
      id: riport.id,
      szerzoId: riport.szerzoId,
      targy: riport.targy,
      kategoria: riport.kategoria,
      createdAt: riport.createdAt,
      intezkedes: isNotNull(riport.intezkedes).mapWith(Boolean),
    })
    .from(riport)
    .where(
      and(
        inArray(riport.szerzoId, [...attaseIdk]),
        gte(riport.createdAt, felevHatarok(elozoFelev(f)).kezdet),
        lt(riport.createdAt, vegeKizaro),
      ),
    )
    .all();
  for (const { szerzoId, ...j } of jelentesek) {
    const forras = forrasok.get(szerzoId);
    if (!forras) continue;
    if (j.createdAt < kezdet) forras.elozoFelevJelentesDb += 1;
    else forras.jelentesek.push(j);
  }

  const ticketek = db
    .select({
      id: ticket.id,
      cimzettId: ticket.cimzettId,
      targy: ticket.targy,
      createdAt: ticket.createdAt,
      hatarido: ticket.hatarido,
      statusz: ticket.statusz,
      elsoAttaseUzenet: min(ticketUzenet.createdAt),
    })
    .from(ticket)
    .leftJoin(ticketUzenet, and(eq(ticketUzenet.ticketId, ticket.id), eq(ticketUzenet.szerzoSzerep, 'attase')))
    .where(
      and(
        inArray(ticket.cimzettId, [...attaseIdk]),
        or(
          and(gte(ticket.createdAt, kezdet), lt(ticket.createdAt, vegeKizaro)),
          and(gte(ticket.hatarido, elsoNap), lte(ticket.hatarido, utolsoNap)),
        ),
      ),
    )
    .groupBy(ticket.id)
    .all();
  for (const t of ticketek) {
    forrasok.get(t.cimzettId)?.tickets.push({
      id: t.id,
      targy: t.targy,
      createdAt: t.createdAt,
      hatarido: t.hatarido,
      lezart: t.statusz === 'lezart',
      elsoAttaseUzenet: t.elsoAttaseUzenet,
    });
  }
  return forrasok;
}

function vezetettOrszagok(sor: ErtekelesSor): string[] {
  return sor.orszagok.filter((o) => o.vezeto).map((o) => o.kod);
}

/** A megadott azonosítók közül azok, amelyekhez még létezik felhasználó. */
function letezoFelhasznalok(idk: readonly string[]): Set<string> {
  if (idk.length === 0) return new Set();
  return new Set(db.select({ id: user.id }).from(user).where(inArray(user.id, [...idk])).all().map((r) => r.id));
}

/**
 * A félév mutatóinak számolója. A forrásadatokat és a hálózati mediánokat egyszer tölti be. A mediánokba a nem
 * kihagyott attasék számítanak, a törölt felhasználók kivételével: az ő jelentéseik és ticketjeik az FK-kaszkáddal
 * eltűntek, ezért hamis, tevékenység nélküli értéket adnának. A tiltott attasé adatai megvannak, ő beleszámít.
 */
function mutatoSzamolo(sorok: readonly ErtekelesSor[], f: Felev, most: Date): (sor: ErtekelesSor) => ErtekelesMutatok {
  const ertekeltek = sorok.filter((s) => !s.kimarad);
  const forrasok = mutatoForrasok(ertekeltek.map((s) => s.attaseId), f);
  const letezok = letezoFelhasznalok([...forrasok.keys()]);
  const halozat = halozatiMedianok(
    [...forrasok].filter(([id]) => letezok.has(id)).map(([, forras]) => forras),
    f,
    most,
  );
  const profilok = listProfilMutatok([...new Set(ertekeltek.flatMap(vezetettOrszagok))], f.ev);
  return (sor) =>
    szamolMutatok({
      felev: f,
      most,
      jelentesek: forrasok.get(sor.attaseId)?.jelentesek ?? [],
      elozoFelevJelentesDb: forrasok.get(sor.attaseId)?.elozoFelevJelentesDb ?? 0,
      tickets: forrasok.get(sor.attaseId)?.tickets ?? [],
      vezetettOrszagok: vezetettOrszagok(sor),
      profilok,
      halozat,
    });
}

/** Az attasé legutóbbi lezárt félévei `f`-ig bezárólag, időrendben. A kihagyott félév fokozat nélkül szerepel. */
function elozmenyek(attaseId: string, f: Felev): ElozmenySor[] {
  const sorok = db
    .select({
      id: attaseErtekeles.id,
      kimarad: attaseErtekeles.kimarad,
      osszFokozat: attaseErtekeles.osszFokozat,
      ev: ertekelesiIdoszak.ev,
      felev: ertekelesiIdoszak.felev,
    })
    .from(attaseErtekeles)
    .innerJoin(ertekelesiIdoszak, eq(attaseErtekeles.idoszakId, ertekelesiIdoszak.id))
    .where(and(eq(attaseErtekeles.attaseId, attaseId), eq(ertekelesiIdoszak.statusz, 'lezart')))
    .orderBy(asc(ertekelesiIdoszak.ev), asc(ertekelesiIdoszak.felev))
    .all()
    .map((r) => ({ ...r, felev: { ev: r.ev, felev: r.felev as FelevSzam } }))
    .filter((r) => felevOsszevet(r.felev, f) <= 0)
    .slice(-ELOZMENY_MAX);
  const fokozatok = mentettFokozatok(sorok.filter((r) => !r.kimarad).map((r) => r.id));
  return sorok.map((r) => ({
    felev: r.felev,
    fokozatok: r.kimarad ? {} : (fokozatok.get(r.id) ?? {}),
    osszFokozat: r.kimarad ? null : osszFokozatbol(r.osszFokozat),
  }));
}

/** A mutatókban szereplő bizonyítékok közül a még létezők azonosítói. */
function letezoBizonyitekok(mutatok: ErtekelesMutatok | null): { letezoJelentesek: string[]; letezoTicketek: string[] } {
  if (mutatok === null) return { letezoJelentesek: [], letezoTicketek: [] };
  const jelentesIdk = [...new Set([...mutatok.tajekoztatas.jelentesek, ...mutatok.kapcsolatepites.jelentesek].map((j) => j.id))];
  const ticketIdk = mutatok.egyuttmukodes.ticketek.map((t) => t.id);
  const jelentesek = new Set(
    jelentesIdk.length === 0
      ? []
      : db.select({ id: riport.id }).from(riport).where(inArray(riport.id, jelentesIdk)).all().map((r) => r.id),
  );
  const ticketek = new Set(
    ticketIdk.length === 0
      ? []
      : db.select({ id: ticket.id }).from(ticket).where(inArray(ticket.id, ticketIdk)).all().map((r) => r.id),
  );
  return {
    letezoJelentesek: jelentesIdk.filter((id) => jelentesek.has(id)),
    letezoTicketek: ticketIdk.filter((id) => ticketek.has(id)),
  };
}

function minositesekBol(ertekelesId: string): AdatlapNezet['minositesek'] {
  const minositesek: AdatlapNezet['minositesek'] = {};
  const sorok = db.select().from(szempontMinosites).where(eq(szempontMinosites.ertekelesId, ertekelesId)).all();
  for (const r of sorok) {
    if (!isSzempontKulcs(r.szempont) || !isFokozat(r.fokozat)) continue;
    minositesek[r.szempont] = {
      fokozat: r.fokozat,
      indoklas: r.indoklas,
      ertekeloNev: r.ertekeloNev,
      updatedAt: r.updatedAt,
      verzio: r.updatedAt.getTime(),
    };
  }
  return minositesek;
}

/**
 * Az attasé adatlapja a félévben. A mutatók a rögzített pillanatképből jönnek; ha nincs, nyitott félévben
 * élőben számolódnak, a kihagyott sorhoz pedig nincs mutató. Ami a hálózati nézetben nem látszik, az itt sincs.
 */
export function getAdatlap(attaseId: string, f: Felev, most: Date = new Date()): AdatlapNezet | null {
  const idoszak = getIdoszak(f);
  if (!idoszak) return null;
  const sorok = idoszakNezete(idoszak, eloAttasek()).lathato.map((n) => n.sor);
  const sor = sorok.find((s) => s.attaseId === attaseId);
  if (!sor) return null;
  const r = db
    .select({
      osszIndoklas: attaseErtekeles.osszIndoklas,
      fejlesztesiCel: attaseErtekeles.fejlesztesiCel,
      ertekeloNev: attaseErtekeles.ertekeloNev,
      minositveAt: attaseErtekeles.minositveAt,
      updatedAt: attaseErtekeles.updatedAt,
      mutatok: attaseErtekeles.mutatok,
    })
    .from(attaseErtekeles)
    .where(eq(attaseErtekeles.id, sor.ertekelesId))
    .get();
  if (!r) return null;
  const elo = idoszak.statusz === 'nyitott' && !sor.kimarad;
  const mutatok = r.mutatok ?? (elo ? mutatoSzamolo(sorok, f, most)(sor) : null);
  return {
    idoszak,
    sor,
    osszIndoklas: r.osszIndoklas,
    fejlesztesiCel: r.fejlesztesiCel,
    ertekeloNev: r.ertekeloNev,
    minositveAt: r.minositveAt,
    osszVerzio: r.updatedAt.getTime(),
    minositesek: minositesekBol(sor.ertekelesId),
    mutatok,
    elozmeny: elozmenyek(attaseId, f),
    ...letezoBizonyitekok(mutatok),
  };
}

/** Van-e ilyen attasé: aktív, vagy van róla értékelés (a törölt felhasználó értékelése is megnyitható). */
export function attaseIsmert(attaseId: string): boolean {
  if (listCimzettJeloltek().some((j) => j.id === attaseId)) return true;
  const r = db
    .select({ id: attaseErtekeles.id })
    .from(attaseErtekeles)
    .where(eq(attaseErtekeles.attaseId, attaseId))
    .limit(1)
    .get();
  return r !== undefined;
}

/** A mentéshez szükséges állapot: az értékelési sor és a félév státusza. */
function mentesiAllapot(ertekelesId: string) {
  return db
    .select({
      attaseId: attaseErtekeles.attaseId,
      orszagok: attaseErtekeles.orszagok,
      kimarad: attaseErtekeles.kimarad,
      osszFokozat: attaseErtekeles.osszFokozat,
      updatedAt: attaseErtekeles.updatedAt,
      rogzitett: isNotNull(attaseErtekeles.mutatok).mapWith(Boolean),
      statusz: ertekelesiIdoszak.statusz,
    })
    .from(attaseErtekeles)
    .innerJoin(ertekelesiIdoszak, eq(attaseErtekeles.idoszakId, ertekelesiIdoszak.id))
    .where(eq(attaseErtekeles.id, ertekelesId))
    .get();
}

/** A sorra érvényes országok: az élő hozzárendelés, amíg nincs rögzített mutató és az attasé aktív. */
function ervenyesOrszagok(a: { attaseId: string; orszagok: RogzitettOrszag[]; rogzitett: boolean }): RogzitettOrszag[] {
  return a.rogzitett ? a.orszagok : (eloAttasek().get(a.attaseId)?.orszagok ?? a.orszagok);
}

/** Szigorúan növekvő verzió: az azonos ezredmásodpercben mentett két változat sem kaphatja ugyanazt. */
function kovetkezoVerzio(elozo: Date | undefined, most: Date): Date {
  return new Date(Math.max(most.getTime(), (elozo?.getTime() ?? 0) + 1));
}

/**
 * Egy szempont mentése verzióellenőrzéssel: `verzio` a megnyitáskori érték, új minősítésnél `null`. A nem
 * vezető attasé Országismerete automatikus; a korábban vezetőként kapott, mentett minősítése szerkeszthető marad.
 */
export function mentSzempont(
  ertekelesId: string,
  input: SzempontInput,
  ertekeloNev: string,
  most: Date = new Date(),
): { eredmeny: MentesEredmeny; verzio?: number } {
  return db.transaction((tx) => {
    const a = mentesiAllapot(ertekelesId);
    if (!a) return { eredmeny: 'nincs' };
    if (a.statusz === 'lezart') return { eredmeny: 'lezart' };
    if (a.kimarad) return { eredmeny: 'kihagyott' };

    const meglevo = tx
      .select({ updatedAt: szempontMinosites.updatedAt, ertekeloNev: szempontMinosites.ertekeloNev })
      .from(szempontMinosites)
      .where(and(eq(szempontMinosites.ertekelesId, ertekelesId), eq(szempontMinosites.szempont, input.szempont)))
      .get();
    const sajatMinosites = meglevo !== undefined && meglevo.ertekeloNev !== AUTOMATIKUS_ERTEKELO;
    if (input.szempont === 'orszagismeret' && !sajatMinosites && automatikusOrszagismeret(ervenyesOrszagok(a))) {
      return { eredmeny: 'automatikus' };
    }
    if ((meglevo?.updatedAt.getTime() ?? null) !== input.verzio) return { eredmeny: 'elavult' };

    const updatedAt = kovetkezoVerzio(meglevo?.updatedAt, most);
    const adat = { fokozat: input.fokozat, indoklas: input.indoklas, ertekeloNev, updatedAt };
    tx.insert(szempontMinosites)
      .values({ ertekelesId, szempont: input.szempont, ...adat })
      .onConflictDoUpdate({ target: [szempontMinosites.ertekelesId, szempontMinosites.szempont], set: adat })
      .run();
    return { eredmeny: 'ok', verzio: updatedAt.getTime() };
  }, IRAS);
}

/**
 * Az összminősítés mentése, ha mind az öt szempont minősítve van. A `verzio` a sor megnyitáskori verziója
 * (`AdatlapNezet.osszVerzio`); `null` csak addig érvényes, amíg nincs mentett összminősítés.
 */
export function mentOssz(
  ertekelesId: string,
  input: OsszInput,
  ertekeloNev: string,
  most: Date = new Date(),
): { eredmeny: MentesEredmeny; verzio?: number } {
  return db.transaction((tx) => {
    const a = mentesiAllapot(ertekelesId);
    if (!a) return { eredmeny: 'nincs' };
    if (a.statusz === 'lezart') return { eredmeny: 'lezart' };
    if (a.kimarad) return { eredmeny: 'kihagyott' };

    const elavult = input.verzio === null ? a.osszFokozat !== null : input.verzio !== a.updatedAt.getTime();
    if (elavult) return { eredmeny: 'elavult' };

    const fokozatok = hatekonyFokozatok(mentettFokozatok([ertekelesId]).get(ertekelesId) ?? {}, ervenyesOrszagok(a));
    if (SZEMPONT_KULCSOK.some((k) => fokozatok[k] === undefined)) return { eredmeny: 'hianyos' };

    const updatedAt = kovetkezoVerzio(a.updatedAt, most);
    tx.update(attaseErtekeles)
      .set({
        osszFokozat: input.fokozat,
        osszIndoklas: input.indoklas,
        fejlesztesiCel: input.fejlesztesiCel,
        ertekeloNev,
        minositveAt: most,
        updatedAt,
      })
      .where(eq(attaseErtekeles.id, ertekelesId))
      .run();
    return { eredmeny: 'ok', verzio: updatedAt.getTime() };
  }, IRAS);
}

/** Az attasé kihagyása a félévből (`ok`: az indoklás), `null`-lal a visszavétele. A minősítései megmaradnak. */
export function kihagyAttase(ertekelesId: string, ok: string | null): 'ok' | 'nincs' | 'lezart' {
  return db.transaction((tx) => {
    const a = mentesiAllapot(ertekelesId);
    if (!a) return 'nincs';
    if (a.statusz === 'lezart') return 'lezart';
    tx.update(attaseErtekeles)
      .set({ kimarad: ok !== null, kimaradasOka: ok })
      .where(eq(attaseErtekeles.id, ertekelesId))
      .run();
    return 'ok';
  }, IRAS);
}

/**
 * A félév lezárása egy tranzakcióban: törli a már nem aktív attasék hiányos sorait, frissíti a pillanatképeket,
 * rögzíti az automatikus Országismeretet és a még hiányzó mutatókat. A már rögzített sorhoz nem nyúl, és a
 * kihagyott sor pillanatképe csak a félév első lezárásakor frissül, így az újralezárás nem ír át lezárt adatot.
 */
export function lezarIdoszak(f: Felev, lezaroNev: string, most: Date = new Date()): LezarasEredmeny {
  return db.transaction((tx): LezarasEredmeny => {
    const idoszak = getIdoszak(f);
    if (!idoszak) return { eredmeny: 'nincs' };
    if (idoszak.statusz === 'lezart') return { eredmeny: 'mar_lezart' };
    if (!felevBefejezodott(f, naptariNap(most))) return { eredmeny: 'nem_ert_veget' };

    const elok = eloAttasek();
    const { lathato, rejtettIdk } = idoszakNezete(idoszak, elok);
    const sorok = lathato.map((n) => n.sor);
    const hianyzok = hianyzoAttasek(sorok);
    if (hianyzok.length > 0) return { eredmeny: 'hianyos', hianyzok };

    if (rejtettIdk.length > 0) tx.delete(attaseErtekeles).where(inArray(attaseErtekeles.id, rejtettIdk)).run();

    const kellMutato = lathato.some((n) => !n.rogzitett && !n.sor.kimarad);
    const szamol = kellMutato ? mutatoSzamolo(sorok, f, most) : null;
    for (const { sor, rogzitett } of lathato) {
      if (!sor.kimarad && automatikusOrszagismeret(sor.orszagok)) {
        tx.insert(szempontMinosites)
          .values({ ertekelesId: sor.ertekelesId, szempont: 'orszagismeret', fokozat: 0, ertekeloNev: AUTOMATIKUS_ERTEKELO, updatedAt: most })
          .onConflictDoNothing()
          .run();
      }
      if (rogzitett) continue;
      const frissit = elok.has(sor.attaseId) && (!sor.kimarad || idoszak.lezarvaAt === null);
      if (sor.kimarad && !frissit) continue;
      tx.update(attaseErtekeles)
        .set({
          ...(frissit ? { attaseNev: sor.nev, szekhelyKod: sor.szekhelyKod, varos: sor.varos, orszagok: sor.orszagok } : {}),
          ...(sor.kimarad ? {} : { mutatok: szamol?.(sor) }),
        })
        .where(eq(attaseErtekeles.id, sor.ertekelesId))
        .run();
    }

    tx.update(ertekelesiIdoszak)
      .set({ statusz: 'lezart', lezarvaAt: most, lezartaNev: lezaroNev })
      .where(eq(ertekelesiIdoszak.id, idoszak.id))
      .run();
    return { eredmeny: 'ok' };
  }, IRAS);
}

/** Újranyitás: a minősítések újra szerkeszthetők, a rögzített mutatók és az utolsó lezárás adatai megmaradnak. */
export function ujranyitIdoszak(f: Felev): 'ok' | 'nincs' | 'nem_lezart' {
  return db.transaction((tx) => {
    const idoszak = getIdoszak(f);
    if (!idoszak) return 'nincs';
    if (idoszak.statusz !== 'lezart') return 'nem_lezart';
    tx.update(ertekelesiIdoszak).set({ statusz: 'nyitott' }).where(eq(ertekelesiIdoszak.id, idoszak.id)).run();
    return 'ok';
  }, IRAS);
}
