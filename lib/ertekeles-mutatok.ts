/**
 * A szakmai értékelés automatikus mutatói (spec 5.4.), tiszta függvényekben (framework-mentes, nincs
 * DB-hívás): a bemenetet a `db/queries/ertekeles.ts` adja, a lezáráskor számolt eredmény JSON
 * pillanatképként kerül az `attase_ertekeles.mutatok` oszlopba. A dátumhatárok és az „első válasz
 * napja” Europe/Budapest szerinti naptári napok (`YYYY-MM-DD`), az összevetés string-alapú.
 * A számok nem lehetnek `NaN`-ok: adat nélkül `0` vagy `null` az eredmény, a felület „–” jelet mutat.
 * Fokozatot és összminősítést kód nem számol, csak admin ad.
 */
import { kovetkezoNapKezdete, napKezdete, naptariNap } from './datum';
import { felevNapok, felevOsszevet, type Felev } from './ertekeles-idoszak';
import { BLOKK_KULCSOK } from './orszagprofil-szotar';
import { KATEGORIAK, isKategoriaKulcs, type KategoriaKulcs } from './riport-szotar';
import { befejezettE, type UgyAdat } from './tevekenyseg-allapot';
import type {
  EsemenyTipus, Hozzajarulas, IgazolasAllapot, Szakasz, TevekenysegTipus,
} from './tevekenyseg-szotar';

export interface JelentesBemenet {
  id: string;
  targy: string;
  kategoria: string;
  createdAt: Date;
  /** A központ rögzített megtett intézkedést a jelentéshez. */
  intezkedes: boolean;
}

export interface TicketBemenet {
  id: string;
  targy: string;
  createdAt: Date;
  /** A határidő naptári napja (`YYYY-MM-DD`), vagy `null`. */
  hatarido: string | null;
  lezart: boolean;
  /** Az attasé első üzenetének ideje a ticketen, vagy `null`, ha még nem válaszolt. */
  elsoAttaseUzenet: Date | null;
}

export interface ProfilBemenet {
  orszagKod: string;
  mentettBlokk: number;
  rendezvenyDb: number;
  updatedAt: Date;
}

/** `datum`: a tevékenység naptári napja (`YYYY-MM-DD`). */
export interface TevekenysegBemenet {
  id: string;
  tipus: TevekenysegTipus;
  datum: string;
  megnevezes: string;
  partner: string;
  magyarSzereplo: string | null;
  kifogasolt: boolean;
}

/**
 * `nap`: az esemény budapesti naptári napja. `beszamitasi`: az igazoláskor rögzült beszámítási félév; a korai
 * szakaszok (létrehozás, szakaszváltás) a saját napjuk szerint számítanak.
 */
export interface EredmenyEsemenyBemenet {
  tipus: EsemenyTipus;
  szakasz: Szakasz | null;
  nap: string;
  beszamitasi: Felev | null;
  visszavonva: boolean;
}

export interface EredmenyBemenet extends UgyAdat {
  id: string;
  megnevezes: string;
  hozzajarulas: Hozzajarulas;
  kifogasolt: boolean;
  esemenyek: EredmenyEsemenyBemenet[];
}

/** A tevékenységnapló és az eredmény-nyilvántartás adatai: csak a bővített adatokat gyűjtő félév kapja meg. */
export interface BovitettBemenet {
  tevekenysegek: TevekenysegBemenet[];
  eredmenyek: EredmenyBemenet[];
}

export interface MutatoBemenet {
  felev: Felev;
  /** A mérés pillanata: lezáráskor a lezárás ideje, nyitott félévnél a mostani. */
  most: Date;
  jelentesek: JelentesBemenet[];
  elozoFelevJelentesDb: number;
  tickets: TicketBemenet[];
  vezetettOrszagok: string[];
  profilok: ProfilBemenet[];
  halozat: { szunetMedian: number | null; valaszMedian: number | null };
  /** Hiányában a félévben nem volt adatgyűjtés: a pillanatkép `verzio: 1`, az új mezők nélkül. */
  bovitett?: BovitettBemenet;
}

export type HataridoBesorolas = 'hataridore' | 'kesett' | 'lejart' | 'nem_szamit';

/** `datum`: a jelentés létrehozásának budapesti naptári napja (`YYYY-MM-DD`). */
export interface JelentesBizonyitek {
  id: string;
  targy: string;
  kategoria: string;
  datum: string;
  intezkedes: boolean;
}

/**
 * `hatarido` és `elsoValasz`: budapesti naptári napok (`YYYY-MM-DD`). `besorolas` csak akkor van, ha a
 * határidő az időszakba esik (a határidős kohorsz tagja), különben `null`.
 */
export interface TicketBizonyitek {
  id: string;
  targy: string;
  hatarido: string | null;
  besorolas: HataridoBesorolas | null;
  elsoValasz: string | null;
}

export interface TevekenysegBizonyitek {
  id: string;
  tipus: TevekenysegTipus;
  megnevezes: string;
  datum: string;
  partner: string;
  kifogasolt: boolean;
}

export interface EredmenyBizonyitek {
  id: string;
  megnevezes: string;
  szakasz: Szakasz;
  igazolas: IgazolasAllapot;
  hozzajarulas: Hozzajarulas;
}

/** A Kapcsolatépítés tevékenységi mutatói (spec 5.5.). */
export interface TevekenysegMutatok {
  delegacioDb: number;
  b2bDb: number;
  partnerkozvetitesDb: number;
  magyarSzereploDb: number;
  kifogasoltDb: number;
  tevekenysegek: TevekenysegBizonyitek[];
}

/** Az Eredmények szempont mutatói (spec 5.5.). */
export interface EredmenyMutatok {
  lehetosegDb: number;
  kapcsolatDb: number;
  egyuttmukodesDb: number;
  megallapodasDb: number;
  igazolasraVarDb: number;
  aktivUgyDb: number;
  megszakadtDb: number;
  ugyek: EredmenyBizonyitek[];
}

/**
 * A rögzített pillanatkép. A `verzio: 2` alak a bővített adatokat gyűjtő félévé; a `verzio: 1` pillanatképeket semmi
 * nem írja át, ezért a `kapcsolatepites.tevekenyseg` és az `eredmenyek` hiánya azt jelenti, hogy nincs tevékenységi adat.
 */
export interface ErtekelesMutatok {
  verzio: 1 | 2;
  szamitvaAt: string;
  /**
   * A lezáráskor az attasé fiókja már nem létezett: a jelentései és a ticketjei az FK-kaszkáddal eltűntek, ezért a
   * számok nem valós tevékenységet mutatnak, a felület nem jeleníti meg őket.
   */
  forrasHianyzik?: true;
  tajekoztatas: {
    jelentesDb: number;
    elozoFelevDb: number;
    lefedettTema: number;
    temaOsszes: number;
    leghosszabbSzunetNap: number;
    halozatiSzunetMedian: number | null;
    intezkedesDb: number;
    jelentesek: JelentesBizonyitek[];
  };
  orszagismeret: {
    vezetettDb: number;
    kitoltottBlokk: number;
    osszesBlokk: number;
    utolsoMentes: string | null;
    rendezvenyDb: number;
  };
  kapcsolatepites: {
    rendezvenyBeszamoloDb: number;
    partnerkeresesDb: number;
    reszveteliLehetosegDb: number;
    jelentesek: JelentesBizonyitek[];
    tevekenyseg?: TevekenysegMutatok;
  };
  eredmenyek?: EredmenyMutatok;
  egyuttmukodes: {
    ticketDb: number;
    elsoValaszMedianNap: number | null;
    halozatiValaszMedianNap: number | null;
    valaszNelkulDb: number;
    hataridosDb: number;
    hataridoreDb: number;
    kesettDb: number;
    lejartValaszNelkulDb: number;
    atlagKesesNap: number | null;
    ticketek: TicketBizonyitek[];
  };
}

const NAP_MS = 24 * 60 * 60 * 1000;

function kerekit(v: number, tizedes: number): number {
  const szorzo = 10 ** tizedes;
  return Math.round(v * szorzo) / szorzo;
}

function kerekitVagyNull(v: number | null, tizedes: number): number | null {
  return v === null ? null : kerekit(v, tizedes);
}

/** A `YYYY-MM-DD` nap sorszáma (napokban, UTC éjféltől), a napkülönbséghez. */
function napSorszam(nap: string): number {
  const [ev, ho, n] = nap.split('-').map(Number);
  return Date.UTC(ev, ho - 1, n) / NAP_MS;
}

/** A naptári napok különbsége (`b - a`), napban. */
function napKulonbseg(a: string, b: string): number {
  return napSorszam(b) - napSorszam(a);
}

function kovetkezoNap(nap: string): string {
  const [ev, ho, n] = nap.split('-').map(Number);
  return new Date(Date.UTC(ev, ho - 1, n + 1)).toISOString().slice(0, 10);
}

/** Hétfő–péntek. */
function munkanapE(nap: string): boolean {
  const [ev, ho, n] = nap.split('-').map(Number);
  const het = new Date(Date.UTC(ev, ho - 1, n)).getUTCDay();
  return het >= 1 && het <= 5;
}

/**
 * Két pillanat között eltelt idő munkanapban: budapesti naptári naponként halad, hétfőtől péntekig a
 * nap átfedő hányadát adja össze (a szombat és a vasárnap nem számít; ünnepnapot nem ismer), két
 * tizedesre kerekítve. Ha `ig` nem későbbi `tol`-nál, az eredmény 0.
 */
export function munkanapokKozott(tol: Date, ig: Date): number {
  if (!(ig.getTime() > tol.getTime())) return 0;
  const utolsoNap = naptariNap(ig);
  let osszeg = 0;
  for (let nap = naptariNap(tol); nap <= utolsoNap; nap = kovetkezoNap(nap)) {
    if (!munkanapE(nap)) continue;
    const kezdet = napKezdete(nap).getTime();
    const veg = kovetkezoNapKezdete(nap).getTime();
    const atfedes = Math.min(ig.getTime(), veg) - Math.max(tol.getTime(), kezdet);
    if (atfedes > 0) osszeg += atfedes / (veg - kezdet);
  }
  return kerekit(osszeg, 2);
}

/** A számok mediánja (páros darabnál a két középső átlaga), üres bemenetnél `null`. */
export function medianErtek(v: readonly number[]): number | null {
  if (v.length === 0) return null;
  const rendezett = [...v].sort((a, b) => a - b);
  const kozep = Math.floor(rendezett.length / 2);
  return rendezett.length % 2 === 1 ? rendezett[kozep] : (rendezett[kozep - 1] + rendezett[kozep]) / 2;
}

/**
 * A legnagyobb naptári napos rés az időszak eleje, a megadott napok (`YYYY-MM-DD`) és az időszak vége
 * között (két szomszédos pont napkülönbsége). A zárt intervallumon kívüli napok nem számítanak;
 * jelentés nélkül a rés az egész időszak, nem kezdődött időszaknál 0.
 */
export function leghosszabbSzunet(napok: readonly string[], elsoNap: string, vegNap: string): number {
  if (vegNap < elsoNap) return 0;
  const pontok = [elsoNap, ...napok.filter((n) => n >= elsoNap && n <= vegNap).sort(), vegNap];
  let legnagyobb = 0;
  for (let i = 1; i < pontok.length; i += 1) {
    legnagyobb = Math.max(legnagyobb, napKulonbseg(pontok[i - 1], pontok[i]));
  }
  return legnagyobb;
}

/**
 * Egy határidős ticket besorolása (spec 5.4.): az első attasé-üzenet budapesti naptári napját hasonlítja
 * a határidő napjához. `ma` a mérés budapesti naptári napja. Határidő nélküli ticket nem számít bele.
 */
export function hataridoBesorolas(
  t: Pick<TicketBemenet, 'hatarido' | 'lezart' | 'elsoAttaseUzenet'>,
  ma: string,
): HataridoBesorolas {
  if (t.hatarido === null) return 'nem_szamit';
  if (t.elsoAttaseUzenet !== null) {
    return naptariNap(t.elsoAttaseUzenet) <= t.hatarido ? 'hataridore' : 'kesett';
  }
  if (t.lezart) return 'nem_szamit';
  return t.hatarido < ma ? 'lejart' : 'nem_szamit';
}

interface Idoszak {
  elsoNap: string;
  utolsoNap: string;
  /** Az időszak vége: a félév utolsó napja, futó félévnél a mai nap. */
  vegNap: string;
  /** A mérés naptári napja. */
  ma: string;
}

function idoszak(felev: Felev, most: Date): Idoszak {
  const { elsoNap, utolsoNap } = felevNapok(felev);
  const ma = naptariNap(most);
  return { elsoNap, utolsoNap, vegNap: ma < utolsoNap ? ma : utolsoNap, ma };
}

function idoszakbanE(nap: string, i: Idoszak): boolean {
  return nap >= i.elsoNap && nap <= i.vegNap;
}

function jelentesekIdoszakban(jelentesek: readonly JelentesBemenet[], i: Idoszak): JelentesBemenet[] {
  return jelentesek.filter((j) => idoszakbanE(naptariNap(j.createdAt), i));
}

function ticketekIdoszakban(tickets: readonly TicketBemenet[], i: Idoszak): TicketBemenet[] {
  return tickets.filter((t) => idoszakbanE(naptariNap(t.createdAt), i));
}

/** Az időszakban nyitott ticketek első válaszának ideje munkanapban (a válasz nélkülieket kihagyja). */
function elsoValaszIdok(nyitott: readonly TicketBemenet[]): number[] {
  const ido: number[] = [];
  for (const t of nyitott) {
    if (t.elsoAttaseUzenet !== null) ido.push(munkanapokKozott(t.createdAt, t.elsoAttaseUzenet));
  }
  return ido;
}

/**
 * A hálózati mediánok: attasénként a leghosszabb szünet és az első válasz mediánja, ezek mediánja.
 * Szünetnél minden megadott attasé számít (jelentés nélkül az egész időszak), válaszidőnél csak az,
 * akinek az időszakban nyitott ticketjére érkezett válasz. A hívó adja meg, kik tartoznak a hálózatba.
 */
export function halozatiMedianok(
  attasek: readonly Pick<MutatoBemenet, 'jelentesek' | 'tickets'>[],
  felev: Felev,
  most: Date,
): { szunetMedian: number | null; valaszMedian: number | null } {
  const i = idoszak(felev, most);
  const szunetek: number[] = [];
  const valaszok: number[] = [];
  for (const a of attasek) {
    const napok = jelentesekIdoszakban(a.jelentesek, i).map((j) => naptariNap(j.createdAt));
    szunetek.push(leghosszabbSzunet(napok, i.elsoNap, i.vegNap));
    const valasz = medianErtek(elsoValaszIdok(ticketekIdoszakban(a.tickets, i)));
    if (valasz !== null) valaszok.push(valasz);
  }
  return {
    szunetMedian: kerekitVagyNull(medianErtek(szunetek), 1),
    valaszMedian: kerekitVagyNull(medianErtek(valaszok), 1),
  };
}

const REND: KategoriaKulcs = 'rendezveny';
const PARTNER: KategoriaKulcs = 'egyuttmukodes';
const RESZVETEL: KategoriaKulcs = 'palyazat';

function jelentesBizonyitek(j: JelentesBemenet): JelentesBizonyitek {
  return { id: j.id, targy: j.targy, kategoria: j.kategoria, datum: naptariNap(j.createdAt), intezkedes: j.intezkedes };
}

/** Létrehozás szerint csökkenő sorrend (azonos időnél az id adja a determinisztikus sorrendet). */
function legujabbElol<T extends { createdAt: Date; id: string }>(a: T, b: T): number {
  return b.createdAt.getTime() - a.createdAt.getTime() || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

/**
 * A félév tevékenységei (spec 5.5.): a kifogásolt tevékenység a típusonkénti darabszámokba és a magyar szereplők
 * közé nem számít, a bizonyítéklistában viszont jelölve szerepel. Dátum szerint csökkenő sorrend.
 */
function tevekenysegMutatok(tevekenysegek: readonly TevekenysegBemenet[], f: Felev): TevekenysegMutatok {
  const { elsoNap, utolsoNap } = felevNapok(f);
  const felevben = tevekenysegek.filter((t) => t.datum >= elsoNap && t.datum <= utolsoNap);
  const szamito = felevben.filter((t) => !t.kifogasolt);
  const tipusDb = (tipus: TevekenysegTipus) => szamito.filter((t) => t.tipus === tipus).length;
  const szereplok = new Set(
    szamito.map((t) => (t.magyarSzereplo ?? '').trim().toLocaleLowerCase('hu')).filter((n) => n !== ''),
  );
  return {
    delegacioDb: tipusDb('delegacio'),
    b2bDb: tipusDb('b2b'),
    partnerkozvetitesDb: tipusDb('partnerkozvetites'),
    magyarSzereploDb: szereplok.size,
    kifogasoltDb: felevben.length - szamito.length,
    tevekenysegek: [...felevben]
      .sort((a, b) => (a.datum < b.datum ? 1 : a.datum > b.datum ? -1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
      .map(({ id, tipus, megnevezes, datum, partner, kifogasolt }) => ({ id, tipus, megnevezes, datum, partner, kifogasolt })),
  };
}

/**
 * Az esemény által a félévben elért szakasz, ha az esemény számít (spec 5.4.). A korai szakaszok a saját napjuk
 * szerint, kifogás nélkül; az igazolás a rögzített beszámítási féléve szerint, ha nem vonták vissza.
 */
function elertSzakasz(e: EredmenyEsemenyBemenet, kifogasolt: boolean, f: Felev): Szakasz | null {
  if (e.tipus === 'igazolas') {
    return !e.visszavonva && e.beszamitasi !== null && felevOsszevet(e.beszamitasi, f) === 0 ? e.szakasz : null;
  }
  if (e.tipus !== 'letrehozas' && e.tipus !== 'szakaszvaltas') return null;
  const { elsoNap, utolsoNap } = felevNapok(f);
  return !kifogasolt && e.nap >= elsoNap && e.nap <= utolsoNap ? e.szakasz : null;
}

/** A függő kérés a félévhez tartozik: az utolsó kérés legkésőbb a félév utolsó napján érkezett. */
function fuggoKeresFelevig(u: EredmenyBemenet, utolsoNap: string): boolean {
  if (u.kertSzakasz === null) return false;
  const keresNapok = u.esemenyek.filter((e) => e.tipus === 'igazolas_keres').map((e) => e.nap);
  return keresNapok.length > 0 && keresNapok.reduce((max, n) => (n > max ? n : max)) <= utolsoNap;
}

/**
 * Az attasé ügyeinek mutatói a félévre (spec 5.5.). Az igazolásra váró és az aktív ügyek a számítás pillanatának
 * állapotát mutatják. A bizonyítéklistába az az ügy kerül, amelynek van a félévben számító eseménye, a félévhez
 * tartozó függő kérése vagy a félévben történt megszakítása.
 */
function eredmenyMutatok(ugyek: readonly EredmenyBemenet[], f: Felev): EredmenyMutatok {
  const { elsoNap, utolsoNap } = felevNapok(f);
  const elert: Record<Szakasz, number> = { lehetoseg: 0, kapcsolat: 0, egyuttmukodes: 0, megallapodas: 0 };
  let igazolasraVarDb = 0;
  let megszakadtDb = 0;
  const bizonyitekok: EredmenyBizonyitek[] = [];
  for (const u of ugyek) {
    const szakaszok = u.esemenyek.flatMap((e) => elertSzakasz(e, u.kifogasolt, f) ?? []);
    for (const szakasz of szakaszok) elert[szakasz] += 1;
    const fuggo = fuggoKeresFelevig(u, utolsoNap);
    if (fuggo) igazolasraVarDb += 1;
    const megszakadt = u.esemenyek.some((e) => e.tipus === 'megszakitas' && e.nap >= elsoNap && e.nap <= utolsoNap);
    if (megszakadt) megszakadtDb += 1;
    if (szakaszok.length > 0 || fuggo || megszakadt) {
      bizonyitekok.push({
        id: u.id,
        megnevezes: u.megnevezes,
        szakasz: u.szakasz,
        igazolas: u.igazolas,
        hozzajarulas: u.hozzajarulas,
      });
    }
  }
  return {
    lehetosegDb: elert.lehetoseg,
    kapcsolatDb: elert.kapcsolat,
    egyuttmukodesDb: elert.egyuttmukodes,
    megallapodasDb: elert.megallapodas,
    igazolasraVarDb,
    aktivUgyDb: ugyek.filter((u) => u.allapot === 'aktiv' && !befejezettE(u)).length,
    megszakadtDb,
    ugyek: bizonyitekok,
  };
}

/**
 * Az attasé automatikus mutatói az időszakra (spec 5.4.). A jelentések és a ticketek az időszakhoz a
 * létrehozásuk napja szerint tartoznak (a bemenetben szereplő, időszakon kívüli jelentést kihagyja),
 * a határidős ticketek a határidejük szerint. A bizonyítéklisták teljesek, a legújabb elöl.
 */
export function szamolMutatok(b: MutatoBemenet): ErtekelesMutatok {
  const i = idoszak(b.felev, b.most);

  // Tájékoztatás és kapcsolatépítés: az időszakban létrehozott jelentések.
  const jelentesek = jelentesekIdoszakban(b.jelentesek, i).sort(legujabbElol);
  const kategoriak = new Set(jelentesek.map((j) => j.kategoria).filter(isKategoriaKulcs));
  const kapcsolat = jelentesek.filter((j) => j.kategoria === REND || j.kategoria === PARTNER || j.kategoria === RESZVETEL);
  const kategoriaDb = (k: KategoriaKulcs) => jelentesek.filter((j) => j.kategoria === k).length;

  // Országismeret: a vezetett országok adott évi profiljai.
  const vezetett = new Set(b.vezetettOrszagok);
  const profilok = b.profilok.filter((p) => vezetett.has(p.orszagKod));
  const utolsoMentes = profilok.reduce<Date | null>(
    (max, p) => (max === null || p.updatedAt.getTime() > max.getTime() ? p.updatedAt : max),
    null,
  );

  // Együttműködés: a válaszidő-kohorsz az időszakban nyitott, a határidő-kohorsz a félévbe eső határidejű ticket.
  const nyitott = ticketekIdoszakban(b.tickets, i);
  const nyitottIdk = new Set(nyitott.map((t) => t.id));
  const hataridosE = (t: TicketBemenet) => t.hatarido !== null && t.hatarido >= i.elsoNap && t.hatarido <= i.utolsoNap;
  const besorolasok = new Map<string, HataridoBesorolas>();
  for (const t of b.tickets) if (hataridosE(t)) besorolasok.set(t.id, hataridoBesorolas(t, i.ma));
  const darab = (be: HataridoBesorolas) => [...besorolasok.values()].filter((x) => x === be).length;
  const keses: number[] = [];
  for (const t of b.tickets) {
    if (besorolasok.get(t.id) === 'kesett' && t.hatarido !== null && t.elsoAttaseUzenet !== null) {
      keses.push(napKulonbseg(t.hatarido, naptariNap(t.elsoAttaseUzenet)));
    }
  }
  const hataridoreDb = darab('hataridore');
  const kesettDb = darab('kesett');
  const lejartValaszNelkulDb = darab('lejart');
  const ticketek = b.tickets
    .filter((t) => nyitottIdk.has(t.id) || besorolasok.has(t.id))
    .sort(legujabbElol)
    .map<TicketBizonyitek>((t) => ({
      id: t.id,
      targy: t.targy,
      hatarido: t.hatarido,
      besorolas: besorolasok.get(t.id) ?? null,
      elsoValasz: t.elsoAttaseUzenet === null ? null : naptariNap(t.elsoAttaseUzenet),
    }));

  return {
    verzio: b.bovitett ? 2 : 1,
    szamitvaAt: b.most.toISOString(),
    tajekoztatas: {
      jelentesDb: jelentesek.length,
      elozoFelevDb: b.elozoFelevJelentesDb,
      lefedettTema: kategoriak.size,
      temaOsszes: KATEGORIAK.length,
      leghosszabbSzunetNap: leghosszabbSzunet(jelentesek.map((j) => naptariNap(j.createdAt)), i.elsoNap, i.vegNap),
      halozatiSzunetMedian: b.halozat.szunetMedian,
      intezkedesDb: jelentesek.filter((j) => j.intezkedes).length,
      jelentesek: jelentesek.map(jelentesBizonyitek),
    },
    orszagismeret: {
      vezetettDb: vezetett.size,
      kitoltottBlokk: profilok.reduce((s, p) => s + p.mentettBlokk, 0),
      osszesBlokk: BLOKK_KULCSOK.length * vezetett.size,
      utolsoMentes: utolsoMentes === null ? null : utolsoMentes.toISOString(),
      rendezvenyDb: profilok.reduce((s, p) => s + p.rendezvenyDb, 0),
    },
    kapcsolatepites: {
      rendezvenyBeszamoloDb: kategoriaDb(REND),
      partnerkeresesDb: kategoriaDb(PARTNER),
      reszveteliLehetosegDb: kategoriaDb(RESZVETEL),
      jelentesek: kapcsolat.map(jelentesBizonyitek),
      ...(b.bovitett ? { tevekenyseg: tevekenysegMutatok(b.bovitett.tevekenysegek, b.felev) } : {}),
    },
    ...(b.bovitett ? { eredmenyek: eredmenyMutatok(b.bovitett.eredmenyek, b.felev) } : {}),
    egyuttmukodes: {
      ticketDb: nyitott.length,
      elsoValaszMedianNap: kerekitVagyNull(medianErtek(elsoValaszIdok(nyitott)), 1),
      halozatiValaszMedianNap: b.halozat.valaszMedian,
      valaszNelkulDb: nyitott.filter((t) => !t.lezart && t.elsoAttaseUzenet === null).length,
      hataridosDb: hataridoreDb + kesettDb + lejartValaszNelkulDb,
      hataridoreDb,
      kesettDb,
      lejartValaszNelkulDb,
      atlagKesesNap: keses.length === 0 ? null : kerekit(keses.reduce((s, n) => s + n, 0) / keses.length, 1),
      ticketek,
    },
  };
}
