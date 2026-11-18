/**
 * Kitalált tesztadatbázis a monitoring (szakmai értékelés) kipróbálásához: 15 kitalált attasé, négy lezárt
 * (2024/2 – 2026/1) és egy nyitott, részben minősített (2026/2) félév, hozzájuk generált jelentésekkel,
 * ticketekkel, országprofilokkal és minősítésekkel. A véletlenszám-mag rögzített (20261118), a "mai nap"
 * is (2026-11-18), ezért a script minden futása ugyanazt a tartalmat adja.
 *
 * A script CSAK a data/tet-ertekeles-teszt.db fájlt írja: a data/tet.db-t csak olvassa (readonly), és ha a
 * DATABASE_URL másra mutat, hibával kilép. Lépések:
 * 1. a célfájl (és -wal/-shm társai) törlése, a data/tet.db másolása a SQLite backup API-jával;
 * 2. a drizzle-migrációk lefuttatása a másolaton (a 0014 az értékelési táblákat hozza);
 * 3. a session-sorok és a valós demó attasék (minden kapcsolódó adatukkal, FK cascade) törlése;
 * 4. a 15 kitalált attasé: teszt01@ertekeles.test … teszt15@ertekeles.test, jelszó: Teszt-Attase-2026!;
 * 5. félévenként a forrásadatok, az időszak, a minősítések, a kihagyás és a lezárás – ugyanazokkal a
 *    lekérdezésekkel, amelyeket az éles felület használ (db/queries/ertekeles.ts);
 * 6. a nyitott 2026/2 félév a mai napig tartó adatokkal;
 * 7. önellenőrzés: hiba esetén nem nulla kilépési kód.
 *
 * Az A blokk (tevékenységek és eredmények) a 2025/1 és későbbi félévekre készül, a Kapcsolatépítés és az
 * Eredmények fokozatával összhangban (a 2024/2 félév bővített adat nélküli marad, `verzio: 1` pillanatképpel).
 * A tevékenységek közvetlen inserttel jönnek létre, az eredmények és az igazolási életciklusuk az éles
 * műveletekkel (db/queries/tevekenyseg.ts), történelmi időpontokkal, a lezárás előtt. Ehhez külön
 * véletlenszám-folyam tartozik, így a korábbi adatok (jelentések, ticketek, minősítések) változatlanok.
 *
 * Az attasék olyan országokban dolgoznak, ahol a valós hálózatnak nincs posztja, a nevek és a szövegek
 * kitaláltak, így a minősítés valós személyhez sem a név, sem a poszt alapján nem köthető.
 *
 * Futtatás: NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-ertekeles.ts
 * Böngészős használat: DATABASE_URL=<abszolút útvonal>/data/tet-ertekeles-teszt.db mellett indított dev szerver.
 */
import { hashPassword } from 'better-auth/crypto';
import Database from 'better-sqlite3';
import { and, eq, inArray, like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Db } from '../db';
import {
  account, attaseErtekeles, attaseOrszag, eredmeny, eredmenyEsemeny, ertekelesiIdoszak, orszagprofil, riport,
  session, szempontMinosites, ticket, ticketUzenet, tevekenyseg, user,
} from '../db/schema';
import type { AttaseOrszag } from '../lib/attase-orszag';
import { naptariNap } from '../lib/datum';
import { felevCimke, felevKulcs, felevNapok, felevOsszevet, type Felev, type FelevSzam } from '../lib/ertekeles-idoszak';
import type { ErtekelesMutatok } from '../lib/ertekeles-mutatok';
import { haladas, teljesE } from '../lib/ertekeles-osszesites';
import {
  isFokozat, isOsszFokozat, SZEMPONT_KULCSOK, szempontByKulcs,
  type Fokozat, type OsszFokozat, type SzempontKulcs,
} from '../lib/ertekeles-szotar';
import { orszagByKod, orszagNev } from '../lib/orszagok';
import {
  BLOKK_KULCSOK, normalizalBlokk, RENDEZVENY_TIPUSOK, type BlokkKulcs, type ProfilBlokkok,
} from '../lib/orszagprofil-szotar';
import type { KategoriaKulcs, Kulcsszo } from '../lib/riport-szotar';
import { TIPUSOK, type TipusKulcs } from '../lib/ticket-szotar';
import {
  ESEMENY_CIMKE, kovetkezoSzakasz, SZAKASZOK, type EsemenyTipus, type Hozzajarulas, type Szakasz,
  type TevekenysegTipus,
} from '../lib/tevekenyseg-szotar';

type Ertekeles = typeof import('../db/queries/ertekeles');
type Tevekenyseg = typeof import('../db/queries/tevekenyseg');

// ---------------------------------------------------------------------------------------------------------
// Rögzített adatok
// ---------------------------------------------------------------------------------------------------------

const MAG = 20261118;
/** A „mai nap”: rögzített, hogy a script minden futása ugyanazt adja. A nyitott félév adatai eddig tartanak. */
const MA = '2026-11-18';
const MOST_NYITOTT = new Date(Date.UTC(2026, 10, 18, 10, 0, 0));
const JELSZO = 'Teszt-Attase-2026!';
const ERTEKELO = 'Teszt Értékelő';
const KOZPONT = 'NIÜ központ (teszt)';
const KITALALT = 'Kitalált tesztadat.';

const CEL = resolve('data/tet-ertekeles-teszt.db');
const FORRAS = resolve('data/tet.db');

/** A valós hálózat országai (székhelyek és regionális lefedettség): a tesztadatban egyik sem szerepelhet. */
const VALOS_ORSZAGOK = [
  'AT', 'BD', 'BR', 'CA', 'CN', 'DE', 'DZ', 'FR', 'GB', 'GY', 'IE', 'IL', 'IN', 'JP', 'KP', 'KR', 'LK', 'MA', 'MR',
  'MV', 'NP', 'PR', 'RU', 'SR', 'TN', 'US', 'VI',
] as const;

type Mintazat = 'stabilEros' | 'stabil' | 'javulo' | 'visszaeso' | 'lassu' | 'lehetoseg' | 'uj' | 'kihagyott' | 'gyenge';

/**
 * A 2024/2, 2025/1, 2025/2, 2026/1 félévek fokozatai: tájékoztatás, országismeret, kapcsolatépítés, eredmények,
 * együttműködés, majd `|` után az összminősítés. `null`: nincs sor (az attasé még nem dolgozott), `kihagyva`: a
 * félévből kihagyták.
 */
const MINTAK: Record<Mintazat, readonly (string | null)[]> = {
  stabilEros: ['44334|4', '44334|4', '44334|4', '44334|4'],
  stabil: ['33333|3', '33333|3', '33333|3', '33333|3'],
  javulo: ['22222|2', '23223|2', '33223|2', '33334|3'],
  visszaeso: ['33333|3', '33333|3', '33333|3', '33322|2'],
  lassu: ['43332|3', '43332|3', '43332|3', '43331|2'],
  lehetoseg: ['33423|3', '33423|3', '33423|3', '33423|3'],
  uj: [null, null, null, '33203|3'],
  kihagyott: ['33333|3', '33333|3', 'kihagyva', '33333|3'],
  gyenge: ['22222|2', '22222|2', '22222|2', '12222|1'],
};

interface AttaseAdat {
  nev: string;
  szekhely: string;
  varos: string;
  regio: string[];
  /** A székhely-országnak ő a relációs vezetője (a regionális országoknak egyedül ő az attaséja, ott mindig vezető). */
  vezet: boolean;
  mintazat: Mintazat;
  /** Az első munkanap, ha az attasé a félév közben érkezett. */
  kezdet?: string;
}

const ATTASEK: readonly AttaseAdat[] = [
  { nev: 'Bárdos Kata', szekhely: 'ES', varos: 'Madrid', regio: ['PT'], vezet: true, mintazat: 'stabilEros' },
  { nev: 'Erdei Márk', szekhely: 'ES', varos: 'Barcelona', regio: [], vezet: false, mintazat: 'javulo' },
  { nev: 'Fodor Lilla', szekhely: 'IT', varos: 'Róma', regio: ['MT'], vezet: true, mintazat: 'stabil' },
  { nev: 'Gál Bence', szekhely: 'NL', varos: 'Hága', regio: ['BE', 'LU'], vezet: true, mintazat: 'visszaeso' },
  { nev: 'Hegedűs Nóra', szekhely: 'SE', varos: 'Stockholm', regio: ['NO', 'FI', 'DK'], vezet: true, mintazat: 'lassu' },
  { nev: 'Jakab Tamás', szekhely: 'PL', varos: 'Varsó', regio: [], vezet: true, mintazat: 'javulo' },
  { nev: 'Kertész Anna', szekhely: 'AU', varos: 'Canberra', regio: ['NZ'], vezet: true, mintazat: 'visszaeso' },
  { nev: 'Lukács Péter', szekhely: 'AU', varos: 'Sydney', regio: [], vezet: false, mintazat: 'lehetoseg' },
  { nev: 'Mátyás Dóra', szekhely: 'SG', varos: 'Szingapúr', regio: ['MY', 'ID'], vezet: true, mintazat: 'lassu' },
  { nev: 'Novák Gergely', szekhely: 'VN', varos: 'Hanoi', regio: [], vezet: true, mintazat: 'stabil' },
  { nev: 'Papp Zsófia', szekhely: 'TH', varos: 'Bangkok', regio: [], vezet: true, mintazat: 'javulo' },
  { nev: 'Rácz Levente', szekhely: 'AE', varos: 'Abu-Dzabi', regio: ['BH'], vezet: true, mintazat: 'uj', kezdet: '2026-02-02' },
  { nev: 'Szalai Emese', szekhely: 'KE', varos: 'Nairobi', regio: [], vezet: true, mintazat: 'kihagyott' },
  { nev: 'Takács Ádám', szekhely: 'MX', varos: 'Mexikóváros', regio: [], vezet: true, mintazat: 'lehetoseg' },
  { nev: 'Vass Réka', szekhely: 'AR', varos: 'Buenos Aires', regio: ['CL', 'UY'], vezet: true, mintazat: 'gyenge' },
];

/** A négy lezárt félév (a mintázat oszlopai) és a nyitott; `most`: a következő félév 8. napja 10:00 UTC. */
interface FelevTerv {
  f: Felev;
  oszlop: number;
  nyitott: boolean;
  most: Date;
}
const FELEVEK: readonly FelevTerv[] = [
  { f: { ev: 2024, felev: 2 }, oszlop: 0, nyitott: false, most: new Date(Date.UTC(2025, 0, 8, 10)) },
  { f: { ev: 2025, felev: 1 }, oszlop: 1, nyitott: false, most: new Date(Date.UTC(2025, 6, 8, 10)) },
  { f: { ev: 2025, felev: 2 }, oszlop: 2, nyitott: false, most: new Date(Date.UTC(2026, 0, 8, 10)) },
  { f: { ev: 2026, felev: 1 }, oszlop: 3, nyitott: false, most: new Date(Date.UTC(2026, 6, 8, 10)) },
  // A nyitott félév a 2026/1 fokozataiból dolgozik (a forrásadatok jellege nem változik).
  { f: { ev: 2026, felev: 2 }, oszlop: 3, nyitott: true, most: MOST_NYITOTT },
];

type Fok4 = 1 | 2 | 3 | 4;

// A generálási szabályok: a forrás fokozata szerint.
const JELENTES: Record<Fok4, number> = { 4: 14, 3: 10, 2: 6, 1: 3 };
const TEMA_DB: Record<Fok4, number> = { 4: 7, 3: 5, 2: 3, 1: 2 };
const INTEZKEDES_ARANY: Record<Fok4, number> = { 4: 0.4, 3: 0.25, 2: 0.1, 1: 0 };
const MENTETT_BLOKK: Record<Fok4, number> = { 4: 9, 3: 9, 2: 6, 1: 3 };
const REND_DB: Record<Fok4, number> = { 4: 8, 3: 6, 2: 3, 1: 1 };
const VALASZ_MUNKANAP: Record<Fok4, number> = { 4: 0.5, 3: 1.5, 2: 4, 1: 8 };
/** A határidőre teljesített ticketek száma `n` ticketből: a kerekítés irányával a sáv `n`-től függetlenül tartható. */
const HATARIDORE_DB: Record<Fok4, (n: number) => number> = {
  4: (n) => n,
  3: (n) => Math.ceil(n * 0.875),
  2: (n) => Math.round(n * 0.6),
  1: (n) => Math.floor(n * 0.25),
};
/** A határidőre teljesítés megengedett aránya fokozatonként (alsó és felső határ): az önellenőrzés ezt nézi. */
const HATARIDORE_SAV: Record<Fok4, readonly [number, number]> = { 4: [1, 1], 3: [0.85, 1], 2: [0.5, 0.7], 1: [0, 0.3] };
const TICKET_DB = 8;
const HATARIDO_NAP = 7;
const SZORAS = 0.3;
const VALASZ_NELKUL_ARANY = 0.3;

// ---------------------------------------------------------------------------------------------------------
// Véletlenszám és dátum segédek
// ---------------------------------------------------------------------------------------------------------

function mulberry32(mag: number): () => number {
  let a = mag;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(MAG);
const egesz = (a: number, b: number): number => a + Math.floor(rnd() * (b - a + 1));
const valaszt = <T>(l: readonly T[], r: () => number = rnd): T => l[Math.floor(r() * l.length)];

function kever<T>(l: readonly T[], r: () => number = rnd): T[] {
  const ki = [...l];
  for (let i = ki.length - 1; i > 0; i -= 1) {
    const j = Math.floor(r() * (i + 1));
    [ki[i], ki[j]] = [ki[j], ki[i]];
  }
  return ki;
}

/** Súlyozott választás: az első elem a legvalószínűbb (súlyok: n, n-1, … 1). */
function sulyozott<T>(l: readonly T[]): T {
  let x = rnd() * ((l.length * (l.length + 1)) / 2);
  for (let i = 0; i < l.length; i += 1) {
    x -= l.length - i;
    if (x < 0) return l[i];
  }
  return l[l.length - 1];
}

/** Determinisztikus, UUID alakú azonosító a rögzített magból. */
function azonosito(egeszFv: (a: number, b: number) => number = egesz): string {
  const h = Array.from({ length: 16 }, () => egeszFv(0, 255).toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20)}`;
}

const NAP_MS = 24 * 60 * 60 * 1000;

function napDate(nap: string): Date {
  const [ev, ho, n] = nap.split('-').map(Number);
  return new Date(Date.UTC(ev, ho - 1, n));
}

function plusNap(nap: string, n: number): string {
  return new Date(napDate(nap).getTime() + n * NAP_MS).toISOString().slice(0, 10);
}

/** A két nap közötti napok száma (`b - a`). */
function napKulonbseg(a: string, b: string): number {
  return Math.round((napDate(b).getTime() - napDate(a).getTime()) / NAP_MS);
}

/** Hétfő–péntek napok `a` és `b` között (zárt intervallum). */
function munkanapok(a: string, b: string): string[] {
  const ki: string[] = [];
  for (let nap = a; nap <= b; nap = plusNap(nap, 1)) {
    const het = napDate(nap).getUTCDay();
    if (het >= 1 && het <= 5) ki.push(nap);
  }
  if (ki.length === 0) throw new Error(`Nincs munkanap a(z) ${a} – ${b} között.`);
  return ki;
}

/** Egy munkanap időpontja: 07:00–14:59 UTC, így a budapesti naptári nap is ugyanaz. */
function idopont(nap: string, egeszFv: (a: number, b: number) => number = egesz): Date {
  return new Date(napDate(nap).getTime() + egeszFv(7, 14) * 3600_000 + egeszFv(0, 59) * 60_000 + egeszFv(0, 59) * 1000);
}

/** `tol`-hoz `wd` munkanapot ad (szombat és vasárnap nem számít); hétvégére eső végpont a következő hétfő reggelére kerül. */
function addMunkanap(tol: Date, wd: number): Date {
  let t = tol.getTime();
  let marad = wd * NAP_MS;
  while (marad > 0) {
    const kovetkezoEjfel = (Math.floor(t / NAP_MS) + 1) * NAP_MS;
    const het = new Date(t).getUTCDay();
    if (het === 0 || het === 6) {
      t = kovetkezoEjfel;
      continue;
    }
    const lep = Math.min(marad, kovetkezoEjfel - t);
    t += lep;
    marad -= lep;
  }
  for (let het = new Date(t).getUTCDay(); het === 0 || het === 6; het = new Date(t).getUTCDay()) {
    t = (Math.floor(t / NAP_MS) + 1) * NAP_MS + 7 * 3600_000;
  }
  return new Date(t);
}

function kisebb(a: Date, b: Date): Date {
  return a.getTime() <= b.getTime() ? a : b;
}

function chunk<T>(l: readonly T[], n: number): T[][] {
  const ki: T[][] = [];
  for (let i = 0; i < l.length; i += n) ki.push(l.slice(i, i + n));
  return ki;
}

// ---------------------------------------------------------------------------------------------------------
// Mintázatok
// ---------------------------------------------------------------------------------------------------------

interface Cella {
  fok: Record<SzempontKulcs, Fokozat>;
  ossz: OsszFokozat;
}

function fokozatSzam(c: string): Fokozat {
  const n = Number(c);
  if (!isFokozat(n)) throw new Error(`Hibás fokozat: ${c}`);
  return n;
}

function parseCella(s: string | null): Cella | 'kihagyva' | null {
  if (s === null) return null;
  if (s === 'kihagyva') return 'kihagyva';
  const m = /^([0-4]{5})\|([1-4])$/.exec(s);
  const ossz = m ? Number(m[2]) : 0;
  if (!m || !isOsszFokozat(ossz)) throw new Error(`Hibás mintázat-cella: ${s}`);
  const [t, o, k, e, eg] = m[1].split('').map(fokozatSzam);
  return { fok: { tajekoztatas: t, orszagismeret: o, kapcsolatepites: k, eredmenyek: e, egyuttmukodes: eg }, ossz };
}

/** A forrásadat-szabályok csak az 1–4 fokozatot ismerik (a 0 „nem értékelhető” nem forrás). */
function forrasFok(n: Fokozat): Fok4 {
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  throw new Error(`A(z) ${n} fokozat nem lehet forrásadat fokozata.`);
}

interface Attase extends AttaseAdat {
  id: string;
  cellak: (Cella | 'kihagyva' | null)[];
}

function vezetettKodok(a: AttaseAdat): string[] {
  return [...(a.vezet ? [a.szekhely] : []), ...a.regio];
}

/** Az országismeret fokozata az évre (az év első létező, nem kihagyott cellájából). */
function profilFok(a: Attase, ev: number): Fok4 | null {
  const oszlopok = FELEVEK.filter((fe) => !fe.nyitott && fe.f.ev === ev).map((fe) => fe.oszlop);
  for (const o of oszlopok) {
    const c = a.cellak[o];
    if (c !== null && c !== 'kihagyva') return forrasFok(c.fok.orszagismeret);
  }
  return null;
}

// ---------------------------------------------------------------------------------------------------------
// Szövegek (mind kitalált)
// ---------------------------------------------------------------------------------------------------------

const TEMA: Record<KategoriaKulcs, readonly string[]> = {
  szabalyozas: [
    'új innovációs adókedvezmény tervezete',
    'a kutatás-fejlesztési támogatások szabályainak módosítása',
    'szellemitulajdon-védelmi törvénycsomag a parlament előtt',
    'startup-vízum kedvezőbb feltételekkel külföldi kutatóknak',
    'adatvédelmi szabályok változása a kutatási adatok kezelésében',
    'a nemzeti mesterséges intelligencia stratégia közigazgatási vitája',
  ],
  intezmeny: [
    'átszervezik az innovációs ügynökséget',
    'új kutatás-fejlesztési tanács alakul',
    'az egyetemi technológiatranszfer-irodák egységes irányítása',
    'új vezető az országos kutatási alap élén',
    'a tudománypolitikai feladatok átkerülnek az új minisztériumhoz',
    'a nemzeti akkreditációs szerv hatásköri változásai',
  ],
  finanszirozas: [
    'új kockázatitőke-alap indul innovatív kisvállalkozásoknak',
    'a kutatási költségvetés emelése a következő évre',
    'támogatási program indul a zöld technológiákra',
    'állami társfinanszírozású akcelerátor-program',
    'a pályázati keretek átcsoportosítása',
    'kiemelt támogatás a félvezetőgyártás fejlesztésére',
  ],
  okoszisztema: [
    'startup-ökoszisztéma: a félév legfontosabb befektetései',
    'új innovációs negyed nyílik a fővárosban',
    'vezető technológiai cég kutatóközpontot telepít',
    'a mesterséges intelligencia kutatás helyzete',
    'felsőoktatási rangsorok és az innovációs teljesítmény',
    'a klaszterek összefogása az energiaátállásban',
  ],
  rendezveny: [
    'szakmai delegáció fogadása a fővárosban',
    'részvétel az éves nemzetközi innovációs konferencián',
    'magyar–helyi startup-találkozó szervezése',
    'kerekasztal a kutatóintézeti együttműködésekről',
    'technológiai szakkiállítás látogatása',
    'egyetemi vezetők találkozója a magyar delegációval',
  ],
  palyazat: [
    'nyitott felhívás közös kutatási projektekre',
    'részvételi lehetőség a nemzetközi startup-vásáron',
    'új mobilitási ösztöndíj magyar kutatóknak',
    'kétoldalú pályázati kiírás előzetes tájékoztatója',
    'felhívás innovációs inkubátorprogramba',
    'akcelerátor-program jelentkezési felhívása',
  ],
  egyuttmukodes: [
    'helyi kutatóintézet partnert keres magyar egyetemekkel',
    'ipari vállalat magyar beszállítókat keres',
    'közös laborfejlesztési ajánlat magyar partnerekkel',
    'egyetemi kooperációs lehetőség a hallgatócserében',
    'technológiai vállalat magyar fejlesztőcsapatot keres',
    'klaszter-együttműködési javaslat',
  ],
};

const LEIRAS: Record<KategoriaKulcs, readonly string[]> = {
  szabalyozas: [
    'A tervezet a kormány megfogalmazása szerint a vállalati K+F-kiadások ösztönzését szolgálja. A szakmai egyeztetés folyamatban van, a végleges szöveg a következő hónapokban várható.',
    'A javaslat érinti a külföldi kutatók munkavállalási feltételeit is, ami magyar partnerek számára is releváns lehet.',
  ],
  intezmeny: [
    'A változás az intézményrendszer irányítását érinti: a hatáskörök átrendeződnek, a magyar kapcsolattartók új partnereket kapnak.',
    'Az átszervezés a következő negyedévben lép életbe, a korábbi programok folytatása a tájékoztatás szerint biztosított.',
  ],
  finanszirozas: [
    'A program a kormányzati bejelentés szerint a következő két évben nyitott, a részletes feltételek a hónap végén várhatók.',
    'A keret egy része külföldi partnerekkel közös projektekre is fordítható, ez a magyar szereplők számára lehetőség.',
  ],
  okoszisztema: [
    'A beszámoló a félév fontosabb helyi fejleményeit foglalja össze a magyar szempontból releváns szereplők kiemelésével.',
    'A hírek alapján az ökoszisztéma erősödik, a külföldi befektetők aránya nő, ami a magyar startupok számára is nyitást jelenthet.',
  ],
  rendezveny: [
    'A találkozó célja a két ország szereplőinek összekapcsolása volt; a résztvevők a folytatásról is megállapodtak.',
    'A rendezvényen a magyar delegáció bemutatkozott, és több helyi partnerrel megkezdődött az egyeztetés.',
  ],
  palyazat: [
    'A felhívás magyar szereplők számára is nyitott, a jelentkezési határidő a hónap végén jár le.',
    'A kiírás előzetes tájékoztatója megjelent, a részletes pályázati dokumentáció a következő hetekben várható.',
  ],
  egyuttmukodes: [
    'A helyi szereplő konkrét együttműködési szándékkal fordult hozzánk, a magyar partner felkutatását megkezdtük.',
    'Az ajánlat egyetemi és ipari partnerek számára egyaránt érdekes lehet, a kapcsolatfelvételt közvetítjük.',
  ],
};

const KULCSSZAVAK_KAT: Record<KategoriaKulcs, readonly Kulcsszo[]> = {
  szabalyozas: ['Szakpolitika', 'Stratégia', 'K+F / KFI', 'Digitalizáció'],
  intezmeny: ['Innovációs ügynökségek / intézetek', 'Szakpolitika', 'Kutatóintézetek / kutatóközpontok', 'Felsőoktatás'],
  finanszirozas: ['K+F / KFI', 'Programok / kezdeményezések', 'Startup', 'Horizon Europe / EU programok'],
  okoszisztema: ['Innovációs ökoszisztéma', 'Startup', 'Scaleup', 'Mesterséges intelligencia / AI', 'Technológia'],
  rendezveny: ['Rendezvény', 'Konferencia', 'Látogatás / delegáció', 'Egyeztetés / megbeszélés', 'Summit / szakmai fórum'],
  palyazat: ['Pályázati felhívás / lehetőség', 'Programok / kezdeményezések', 'Nemzetköziesítés / külpiac'],
  egyuttmukodes: [
    'Partnerkapcsolatok / partnerkeresés', 'Tudományos együttműködés', 'Technológiatranszfer', 'Nemzetközi együttműködés',
  ],
};

/** A kapcsolatépítés fokozata szerinti kategória-sorrend: magasabb fokozatnál a kapcsolati kategóriák vannak elöl. */
const KAT_SORREND: Record<Fokozat, readonly KategoriaKulcs[]> = {
  4: ['rendezveny', 'egyuttmukodes', 'palyazat', 'szabalyozas', 'finanszirozas', 'okoszisztema', 'intezmeny'],
  3: ['rendezveny', 'szabalyozas', 'egyuttmukodes', 'finanszirozas', 'palyazat', 'okoszisztema', 'intezmeny'],
  2: ['szabalyozas', 'finanszirozas', 'rendezveny', 'okoszisztema', 'intezmeny', 'egyuttmukodes', 'palyazat'],
  1: ['szabalyozas', 'okoszisztema', 'finanszirozas', 'intezmeny', 'rendezveny', 'egyuttmukodes', 'palyazat'],
  0: ['szabalyozas', 'okoszisztema', 'finanszirozas', 'intezmeny', 'rendezveny', 'egyuttmukodes', 'palyazat'],
};

const JO_GYAKORLAT = [
  'A helyi akcelerátor-modell a magyar inkubátorokban is kipróbálható lenne.',
  'A kutatói mobilitási program egyszerűsített igénylési rendje átvehető javaslat.',
];

const INTEZKEDESEK = [
  'A jelentést továbbítottuk az illetékes szakmai főosztálynak.',
  'A felvetett javaslatot beépítettük a következő delegáció programjába.',
  'Egyeztetés indult az érintett szakmai partnerrel.',
];

const TICKET_TEMA: Record<TipusKulcs, readonly string[]> = {
  adatkeres: [
    'adatkérés a helyi KFI-ráfordításokról',
    'adatkérés a kutatói mobilitás szabályairól',
    'összefoglaló kérése a startup-támogatási rendszerről',
  ],
  feladat: [
    'szakmai találkozó előkészítése a magyar delegációnak',
    'partnerlista összeállítása a következő programhoz',
    'a helyi pályázati lehetőségek áttekintése',
  ],
  riport_visszajelzes: [
    'visszajelzés a legutóbbi jelentésről',
    'kiegészítő kérdések a beadott elemzéshez',
    'a jelentés magyar vonatkozásainak pontosítása',
  ],
  egyeztetes: [
    'egyeztetés a félévi munkatervről',
    'egyeztetés a következő delegáció programjáról',
    'egyeztetés a helyi partnerek bevonásáról',
  ],
};

const TICKET_KERES = [
  'Kérjük, a megjelölt határidőig küldj rövid, magyar szempontú összefoglalót a témáról.',
  'Kérjük, a határidőig jelezz vissza, és ha szükséges, kérj segítséget a központtól.',
  'Szükségünk lenne a téma rövid, forrásokkal alátámasztott áttekintésére a határidőig.',
];

const TICKET_VALASZ = [
  'Köszönöm a megkeresést, az összefoglalót elküldtem.',
  'Visszaigazolom a kérést, a kért anyag a mellékletben található.',
  'A megkeresésre a helyi partnerekkel egyeztetve válaszolok, az első eredményeket mellékelem.',
];

const RENDEZVENY_NEVEK = [
  'Északi Innovációs Csúcs', 'Zöld Technológiai Szakkiállítás', 'Nemzetközi KFI Konferencia', 'Startup Fórum',
  'Kutatás és Ipar Találkozó', 'Digitális Gazdaság Napok', 'Tudomány és Üzlet Fórum', 'Mesterséges Intelligencia Konferencia',
];
const HONAPOK = ['január', 'február', 'március', 'április', 'május', 'június', 'szeptember', 'október', 'november'];

/** A blokk egy szöveges mezője, amelybe a „kitalált” jelzés kerül (a profil blokkja így nem üres). */
const JELZO_MEZO: Record<Exclude<BlokkKulcs, 'rendezvenyek'>, string> = {
  alapadatok: 'forras',
  kfiRendszer: 'teljesitmeny',
  intezmenyek: 'iranyitoSzervek',
  vallalati: 'startupok',
  programok: 'palyazatok',
  nemzetkoziKapcsolatok: 'partnerorszagok',
  magyarKapcsolatok: 'egyezmeny',
  magyarErtekeles: 'osszegzes',
};

const INDOKLAS_SABLON: Record<Fokozat, readonly string[]> = {
  4: [
    'A(z) {sz} terén a félévben kiemelkedően teljesített, a központ elvárásait érdemben meghaladta.',
    'A(z) {sz} területén önállóan és kezdeményezően dolgozott, a munkája más posztoknak is példa lehet.',
  ],
  3: [
    'A(z) {sz} terén a félévben a központ elvárásainak megfelelően teljesített.',
    'A(z) {sz} területén megbízhatóan dolgozott, jelentős kifogás nem merült fel.',
  ],
  2: [
    'A(z) {sz} terén a félévben egyenetlenül teljesített, több ponton hiányzott a következetesség.',
    'A(z) {sz} területén a munka részben felelt meg az elvárásoknak, a hiányosságok pótolhatók.',
  ],
  1: [
    'A(z) {sz} terén a félévben érdemben elmaradt az elvárásoktól, a központ nem támaszkodhatott a munkájára.',
    'A(z) {sz} területén a félévben nem született használható eredmény.',
  ],
  0: ['A(z) {sz} az időszakban nem értékelhető, mert nem állt rendelkezésre elegendő adat.'],
};

const OSSZ_INDOKLAS: Record<OsszFokozat, readonly string[]> = {
  4: [
    'A félév egészében kiemelkedő munka: a tájékoztatás, a kapcsolatépítés és az együttműködés egyaránt a központ elvárásai fölött teljesített.',
  ],
  3: [
    'A félév egészében megfelelő, kiegyensúlyozott munka, egyes területeken van mozgástér a fejlődésre.',
    'A központ elvárásainak a félév egészében megfelelt, jelentős kifogás nem merült fel.',
  ],
  2: [
    'A félév egészében részben felelt meg az elvárásoknak, több területen egyenetlen volt a teljesítmény.',
  ],
  1: [
    'A félév egészében a munka több ponton elmaradt az elvárásoktól, a központ számára használható eredmény alig született.',
  ],
};

const FEJLESZTESI_CEL = [
  'A következő félévben rendszeresebb, havi ütemű tájékoztatás és a magyar vonatkozások kiemelése a cél.',
  'A profil naprakészen tartása és a hiányzó blokkok pótlása a következő félév elejéig.',
  'A központi megkeresésekre a határidőn belüli, első napi visszajelzés bevezetése.',
  'A kapcsolatépítés tudatos tervezése: legalább két új, célzott magyar közvetítés félévente.',
];

const KIHAGYAS_OKA = 'Az időszak nagy részében tartósan távol volt, ezért nem értékelhető (kitalált teszt-ok).';

// ---------------------------------------------------------------------------------------------------------
// Állapot (a dinamikus importok után töltődik)
// ---------------------------------------------------------------------------------------------------------

let db!: Db;
let ert!: Ertekeles;
let tq!: Tevekenyseg;

interface Ido {
  terv: FelevTerv;
  elsoNap: string;
  utolsoNap: string;
  /** A jelentések és ticketek utolsó napja, a nyitott félévben a tegnapig. */
  jelentesVeg: string;
  ticketVeg: string;
  /** Az időszak elteltének aránya (a zárt félévnél 1). */
  arany: number;
  /** Ennél későbbi időpont még nem létezhet (lezárt félévnél a lezárás pillanata, nyitottnál a mostani). */
  hatar: Date;
}

function idoOf(terv: FelevTerv): Ido {
  const { elsoNap, utolsoNap } = felevNapok(terv.f);
  const arany = terv.nyitott ? (napKulonbseg(elsoNap, MA) + 1) / (napKulonbseg(elsoNap, utolsoNap) + 1) : 1;
  const tegnap = plusNap(MA, -1);
  return {
    terv,
    elsoNap,
    utolsoNap,
    jelentesVeg: terv.nyitott ? tegnap : utolsoNap,
    ticketVeg: terv.nyitott ? tegnap : plusNap(utolsoNap, -9),
    arany,
    hatar: terv.most,
  };
}

function kezdNap(a: Attase, ido: Ido): string {
  return a.kezdet !== undefined && a.kezdet > ido.elsoNap ? a.kezdet : ido.elsoNap;
}

function napokKivalaszt(napok: readonly string[], n: number, egyenletes: boolean): string[] {
  const ki: string[] = [];
  for (let i = 0; i < n; i += 1) {
    if (egyenletes) {
      const lo = Math.floor((i * napok.length) / n);
      const hi = Math.max(lo, Math.floor(((i + 1) * napok.length) / n) - 1);
      ki.push(napok[egesz(lo, hi)]);
    } else {
      ki.push(valaszt(napok));
    }
  }
  return ki.sort();
}

// ---------------------------------------------------------------------------------------------------------
// Forrásadatok: jelentések, ticketek, üzenetek, országprofilok
// ---------------------------------------------------------------------------------------------------------

type RiportSor = typeof riport.$inferInsert;
type TicketSor = typeof ticket.$inferInsert;
type UzenetSor = typeof ticketUzenet.$inferInsert;

function jelentesek(a: Attase, cella: Cella, ido: Ido): RiportSor[] {
  const t = forrasFok(cella.fok.tajekoztatas);
  const k = cella.fok.kapcsolatepites;
  const n = ido.terv.nyitott ? Math.max(1, Math.round(JELENTES[t] * ido.arany)) : JELENTES[t];
  const c = Math.min(TEMA_DB[t], n);
  const kategoriak = KAT_SORREND[k].slice(0, c);
  // Minden kiválasztott kategóriából legalább egy jelentés van; a többi az elöl állókat részesíti előnyben.
  const kiosztas = kever([...kategoriak, ...Array.from({ length: n - c }, () => sulyozott(kategoriak))]);
  const napok = napokKivalaszt(munkanapok(kezdNap(a, ido), ido.jelentesVeg), n, t >= 3);
  const intezkedesek = new Set(kever([...Array(n).keys()]).slice(0, Math.round(n * INTEZKEDES_ARANY[t])));
  return napok.map((nap, i) => {
    const kategoria = kiosztas[i];
    const orszag = rnd() < 0.7 ? a.szekhely : valaszt([a.szekhely, ...a.regio]);
    const letrehozva = idopont(nap);
    const kulcsszavak = kever(KULCSSZAVAK_KAT[kategoria]).slice(0, egesz(1, 3));
    const intezkedes = intezkedesek.has(i);
    const intezkedesIdo = kisebb(
      new Date(letrehozva.getTime() + egesz(2, 12) * NAP_MS),
      new Date(ido.hatar.getTime() - NAP_MS),
    );
    const rendezveny = kategoria === 'rendezveny';
    return {
      id: azonosito(),
      szerzoId: a.id,
      orszag,
      kategoria,
      targy: `${orszagNev(orszag)}: ${valaszt(TEMA[kategoria])} (kitalált)`,
      leiras: `${valaszt(LEIRAS[kategoria])} ${KITALALT}`,
      kulcsszavak,
      esemenyDatum: rendezveny ? plusNap(nap, -egesz(1, 10)) : null,
      esemenyHelyszin: rendezveny ? a.varos : null,
      joGyakorlat: t >= 3 && rnd() < 0.2 ? `${valaszt(JO_GYAKORLAT)} ${KITALALT}` : null,
      kapcsolodoFeladat: null,
      intezkedes: intezkedes ? `${valaszt(INTEZKEDESEK)} ${KITALALT}` : null,
      intezkedesSzerzoNev: intezkedes ? ERTEKELO : null,
      intezkedesIdopont: intezkedes ? intezkedesIdo : null,
      createdAt: letrehozva,
      updatedAt: letrehozva,
    };
  });
}

function ticketek(a: Attase, cella: Cella, ido: Ido): { ticketek: TicketSor[]; uzenetek: UzenetSor[] } {
  const e = forrasFok(cella.fok.egyuttmukodes);
  const n = ido.terv.nyitott ? Math.max(1, Math.round(TICKET_DB * ido.arany)) : TICKET_DB;
  const napok = napokKivalaszt(munkanapok(kezdNap(a, ido), ido.ticketVeg), n, true);
  const valaszNelkul = new Set(
    e === 1 ? kever([...Array(n).keys()]).slice(0, Math.round(VALASZ_NELKUL_ARANY * n)) : [],
  );
  const tipusok = Object.keys(TIPUSOK) as TipusKulcs[];
  const ticketSorok: TicketSor[] = [];
  const uzenetSorok: UzenetSor[] = [];
  const tervek = napok.map((nap, i) => {
    const letrehozva = idopont(nap);
    const wd = VALASZ_MUNKANAP[e] * (1 + (rnd() * 2 - 1) * SZORAS);
    const szamolt = valaszNelkul.has(i) ? null : addMunkanap(letrehozva, wd);
    // A válasz csak akkor létezik, ha a mérés pillanata előtt érkezett.
    const valasz = szamolt !== null && szamolt.getTime() <= ido.hatar.getTime() ? szamolt : null;
    return { letrehozva, valasz };
  });
  // A válaszidő a fokozat táblázatából jön, ezért a teljesítés arányát a határidő adja. Határidőre csak a félévben
  // érkezett válasz teljesülhet, hogy a ticket határideje ne csússzon át a következő félév kohorszába.
  const jeloltek = [...tervek.keys()].filter((i) => {
    const { valasz } = tervek[i];
    return valasz !== null && naptariNap(valasz) <= ido.utolsoNap;
  });
  const hataridore = new Set(kever(jeloltek).slice(0, HATARIDORE_DB[e](n)));
  tervek.forEach(({ letrehozva, valasz }, i) => {
    const tipus = valaszt(tipusok);
    const prio = sulyozott(['kozepes', 'magas', 'alacsony']);
    const lezarasra = rnd() < (ido.terv.nyitott ? 0.4 : 0.7);
    const lezarasKesleltetes = egesz(1, 6) * NAP_MS;
    const lezarva = valasz !== null && lezarasra ? kisebb(new Date(valasz.getTime() + lezarasKesleltetes), ido.hatar) : null;
    const id = azonosito();
    const alapHatarido = plusNap(naptariNap(letrehozva), HATARIDO_NAP);
    const valaszNap = valasz === null ? null : naptariNap(valasz);
    let hatarido = alapHatarido;
    if (valaszNap !== null) {
      const utolso = plusNap(valaszNap, -1);
      if (hataridore.has(i)) hatarido = valaszNap > alapHatarido ? valaszNap : alapHatarido;
      else hatarido = utolso < alapHatarido ? utolso : alapHatarido;
    }
    ticketSorok.push({
      id,
      targy: `${TIPUSOK[tipus]}: ${valaszt(TICKET_TEMA[tipus])} (kitalált)`,
      tipus,
      prio,
      hatarido,
      statusz: lezarva !== null ? 'lezart' : valasz !== null ? 'folyamatban' : 'nyitott',
      cimzettId: a.id,
      orszag: a.szekhely,
      nyitoId: null,
      createdAt: letrehozva,
      updatedAt: lezarva ?? valasz ?? letrehozva,
      lezarvaAt: lezarva,
      korlevelId: null,
    });
    uzenetSorok.push({
      id: azonosito(),
      ticketId: id,
      szerzoId: null,
      szerzoNev: KOZPONT,
      szerzoSzerep: 'admin',
      szoveg: `${valaszt(TICKET_KERES)} ${KITALALT}`,
      createdAt: letrehozva,
    });
    if (valasz !== null) {
      uzenetSorok.push({
        id: azonosito(),
        ticketId: id,
        szerzoId: a.id,
        szerzoNev: a.nev,
        szerzoSzerep: 'attase',
        szoveg: `${valaszt(TICKET_VALASZ)} ${KITALALT}`,
        createdAt: valasz,
      });
    }
  });
  return { ticketek: ticketSorok, uzenetek: uzenetSorok };
}

/** A profil mentési ideje az évben: a magasabb fokozatú profilt frissebben mentették. */
const PROFIL_IDOSAV: Record<number, readonly [string, string]> = {
  2024: ['2024-08-01', '2024-12-20'],
  2025: ['2025-02-01', '2025-06-20'],
  2026: ['2026-02-01', '2026-06-20'],
};
const PROFIL_FRISSESSEG: Record<Fok4, number> = { 4: 0.9, 3: 0.7, 2: 0.45, 1: 0.2 };

function profilSor(a: Attase, kod: string, ev: number, o: Fok4): typeof orszagprofil.$inferInsert {
  const [tol, ig] = PROFIL_IDOSAV[ev];
  const arany = Math.min(1, Math.max(0, PROFIL_FRISSESSEG[o] + (rnd() - 0.5) * 0.2));
  const frissitve = new Date(napDate(tol).getTime() + arany * (napDate(ig).getTime() - napDate(tol).getTime()));
  // A rendezvényeket tartalmazó blokk mindig mentett, ha van rendezvény; a többi a blokkok sorrendjében.
  const mentett = new Set<BlokkKulcs>(
    ['rendezvenyek' as const, ...BLOKK_KULCSOK.filter((k) => k !== 'rendezvenyek')].slice(0, MENTETT_BLOKK[o]),
  );
  const rendezvenyek = Array.from({ length: REND_DB[o] }, () => ({
    nev: `${valaszt(RENDEZVENY_NEVEK)} ${ev}`,
    tipus: valaszt(RENDEZVENY_TIPUSOK).kulcs,
    idopont: `${ev}. ${valaszt(HONAPOK)}`,
    megjegyzes: KITALALT,
  }));
  const nyers = (k: BlokkKulcs): unknown =>
    k === 'rendezvenyek' ? { lista: rendezvenyek } : { [JELZO_MEZO[k]]: KITALALT };
  const blokkok: Partial<ProfilBlokkok> = {};
  const tegye = <K extends BlokkKulcs>(k: K) => {
    blokkok[k] = normalizalBlokk(k, nyers(k));
  };
  for (const k of BLOKK_KULCSOK) if (mentett.has(k)) tegye(k);
  return {
    id: azonosito(),
    orszagKod: kod,
    ev,
    szerzoId: a.id,
    ...blokkok,
    createdAt: new Date(frissitve.getTime() - 14 * NAP_MS),
    updatedAt: frissitve,
  };
}

const profilEvek = new Set<number>();

/** Az év országprofiljai a vezetett országokra (egyszer évente): az évet ugyanaz a profil fedi mindkét félévben. */
function profilokLetrehoz(attasek: readonly Attase[], ev: number): void {
  if (profilEvek.has(ev)) return;
  profilEvek.add(ev);
  const sorok: (typeof orszagprofil.$inferInsert)[] = [];
  for (const a of attasek) {
    const o = profilFok(a, ev);
    if (o === null) continue;
    for (const kod of vezetettKodok(a)) sorok.push(profilSor(a, kod, ev, o));
  }
  db.transaction((tx) => {
    for (const c of chunk(sorok, 10)) tx.insert(orszagprofil).values(c).run();
  });
}

function forrasadatokLetrehoz(attasek: readonly Attase[], ido: Ido): { jelentes: number; ticket: number } {
  const riportok: RiportSor[] = [];
  const ticketSorok: TicketSor[] = [];
  const uzenetek: UzenetSor[] = [];
  for (const a of attasek) {
    const cella = a.cellak[ido.terv.oszlop];
    // Nincs sor (még nem dolgozott) vagy kihagyott félév: nincs tevékenység sem.
    if (cella === null || cella === 'kihagyva') continue;
    riportok.push(...jelentesek(a, cella, ido));
    const t = ticketek(a, cella, ido);
    ticketSorok.push(...t.ticketek);
    uzenetek.push(...t.uzenetek);
  }
  db.transaction((tx) => {
    for (const c of chunk(riportok, 40)) tx.insert(riport).values(c).run();
    for (const c of chunk(ticketSorok, 40)) tx.insert(ticket).values(c).run();
    for (const c of chunk(uzenetek, 40)) tx.insert(ticketUzenet).values(c).run();
  });
  return { jelentes: riportok.length, ticket: ticketSorok.length };
}

// ---------------------------------------------------------------------------------------------------------
// Minősítések
// ---------------------------------------------------------------------------------------------------------

/** Indoklás: a „Megfelel” fokozatnál nem kötelező (a felét üresen hagyjuk), minden másnál, a „nem értékelhető”-nél is kötelező. */
function szempontIndoklas(k: SzempontKulcs, f: Fokozat): string | null {
  if (f === 3 && rnd() < 0.5) return null;
  const sz = szempontByKulcs(k).nev.toLowerCase();
  return `${valaszt(INDOKLAS_SABLON[f]).replace('{sz}', sz)} (Kitalált tesztindoklás.)`;
}

/** A minősítés időpontja: lezárt félévnél a félév vége utáni napokban, nyitottnál a mai napon, attasénként percekkel eltolva. */
function minositesIdo(ido: Ido, sorszam: number, lepes: number): Date {
  const alap = ido.terv.nyitott ? ido.terv.most.getTime() - 6 * 3600_000 : ido.terv.most.getTime() - 5 * NAP_MS;
  return new Date(alap + (sorszam * 10 + lepes) * 60_000);
}

/** Az attasé szempontjai a mintázat szerint; a nem vezető attasé Országismerete automatikus, azt nem mentjük. */
function szempontokMentese(
  a: Attase,
  ertekelesId: string,
  cella: Cella,
  ido: Ido,
  sorszam: number,
  hanyat: number,
): void {
  const minositheto = SZEMPONT_KULCSOK.filter((k) => k !== 'orszagismeret' || vezetettKodok(a).length > 0);
  minositheto.slice(0, hanyat).forEach((k, j) => {
    const fokozat = cella.fok[k];
    const r = ert.mentSzempont(
      ertekelesId,
      {
        szempont: k,
        fokozat,
        indoklas: szempontIndoklas(k, fokozat),
        verzio: null,
      },
      ERTEKELO,
      minositesIdo(ido, sorszam, j),
    );
    if (r.eredmeny !== 'ok') throw new Error(`${a.nev}, ${felevKulcs(ido.terv.f)}, ${k}: a mentés eredménye ${r.eredmeny}.`);
  });
}

function osszMentese(a: Attase, ertekelesId: string, cella: Cella, ido: Ido, sorszam: number): void {
  const r = ert.mentOssz(
    ertekelesId,
    {
      fokozat: cella.ossz,
      indoklas: `${valaszt(OSSZ_INDOKLAS[cella.ossz])} (Kitalált tesztindoklás.)`,
      // A fejlesztési cél a „Részben megfelel” és a „Fejlesztendő” összminősítésnél kötelező, másutt opcionális.
      fejlesztesiCel:
        cella.ossz <= 2 || rnd() < 0.25 ? `${valaszt(FEJLESZTESI_CEL)} (Kitalált tesztcél.)` : null,
      verzio: null,
    },
    ERTEKELO,
    minositesIdo(ido, sorszam, 7),
  );
  if (r.eredmeny !== 'ok') throw new Error(`${a.nev}, ${felevKulcs(ido.terv.f)}: az összminősítés mentése ${r.eredmeny}.`);
}

// ---------------------------------------------------------------------------------------------------------
// A blokk: tevékenységek és eredmények
// ---------------------------------------------------------------------------------------------------------

/** Az első tesztfélév, amely tevékenységi és eredményadatot kap; a korábbi (2024/2) bővített adat nélküli marad. */
const A_ELSO_FELEV: Felev = { ev: 2025, felev: 1 };

function aBlokkFelev(f: Felev): boolean {
  return felevOsszevet(f, A_ELSO_FELEV) >= 0;
}

/** Az A blokk saját véletlenszám-folyama: a jelentések, ticketek és minősítések ettől függetlenül ugyanazok maradnak. */
const rndA = mulberry32(MAG + 1);
const egeszA = (a: number, b: number): number => a + Math.floor(rndA() * (b - a + 1));
const valasztA = <T>(l: readonly T[]): T => valaszt(l, rndA);
const keverA = <T>(l: readonly T[]): T[] => kever(l, rndA);
const azonositoA = (): string => azonosito(egeszA);
const idopontA = (nap: string): Date => idopont(nap, egeszA);
const esellyelA = (p: number): boolean => rndA() < p;

/** A Kapcsolatépítés fokozata → a lezárt félévben rögzített tevékenységek száma. */
const TEVEKENYSEG_DB: Record<Fokozat, number> = { 4: 10, 3: 7, 2: 4, 1: 2, 0: 0 };
/** A tevékenységtípusok aránya, százalékban. */
const TIPUS_ARANY: readonly (readonly [TevekenysegTipus, number])[] = [
  ['b2b', 50],
  ['partnerkozvetites', 30],
  ['delegacio', 20],
];
/** A típusok országos arányától megengedett eltérés, százalékpontban (az önellenőrzés ezt nézi). */
const TIPUS_ELTERES = 2;

/** A félévben rögzített tevékenységek száma; a nyitott félévben az eltelt idő arányában (legalább egy, ha van). */
function tevekenysegSzam(k: Fokozat, ido: Ido): number {
  const alap = TEVEKENYSEG_DB[k];
  if (!ido.terv.nyitott || alap === 0) return alap;
  return Math.max(1, Math.round(alap * ido.arany));
}

/**
 * `n` tevékenység típusonkénti száma: az arányok egész része biztosan kiosztásra kerül, a maradékot az országosan
 * addig kiosztottakhoz mért legnagyobb hiányú típus kapja. Így a félévi csoportok is közel arányosak, és az országos
 * arány a kerekítés ellenére sem csúszik el (a 7 tevékenységes csoportoknál a fix kerekítés a B2B-t felülmúlná).
 */
function tipusEloszlas(n: number, futo: Readonly<Record<TevekenysegTipus, number>>): Record<TevekenysegTipus, number> {
  const osszesen = TIPUS_ARANY.reduce((osszeg, [tipus]) => osszeg + futo[tipus], 0) + n;
  const db = Object.fromEntries(
    TIPUS_ARANY.map(([tipus, szazalek]) => [tipus, Math.floor((n * szazalek) / 100)]),
  ) as Record<TevekenysegTipus, number>;
  for (let hianyzik = n - TIPUS_ARANY.reduce((osszeg, [tipus]) => osszeg + db[tipus], 0); hianyzik > 0; hianyzik -= 1) {
    let legjobb = TIPUS_ARANY[0][0];
    let legnagyobbHiany = -Infinity;
    for (const [tipus, szazalek] of TIPUS_ARANY) {
      const hiany = (osszesen * szazalek) / 100 - (futo[tipus] + db[tipus]);
      if (hiany > legnagyobbHiany + 1e-9) {
        legnagyobbHiany = hiany;
        legjobb = tipus;
      }
    }
    db[legjobb] += 1;
  }
  return db;
}

/** Az eddig kiosztott tevékenységek típusonként (a `tipusEloszlas` hiány-számításához). */
const tipusFuto: Record<TevekenysegTipus, number> = { b2b: 0, partnerkozvetites: 0, delegacio: 0 };

function tipusLista(n: number): TevekenysegTipus[] {
  const eloszlas = tipusEloszlas(n, tipusFuto);
  const lista: TevekenysegTipus[] = [];
  for (const [tipus] of TIPUS_ARANY) {
    tipusFuto[tipus] += eloszlas[tipus];
    lista.push(...Array<TevekenysegTipus>(eloszlas[tipus]).fill(tipus));
  }
  return lista;
}

/** Az első elem a listából, amely az előnyben részesítettek között van, különben a lista első eleme (a listából kivéve). */
function kivesz<T>(lista: T[], elonyben: readonly T[]): T {
  for (const t of elonyben) {
    const i = lista.indexOf(t);
    if (i >= 0) return lista.splice(i, 1)[0];
  }
  return lista.splice(0, 1)[0];
}

/** Az ügyek életútja: a kezdő szakasz és a lépések (a szakaszváltás, az igazolás és a döntések az éles műveletekkel). */
type Lepes = 'kapcsolat' | 'keres' | 'igazol' | 'visszakuld' | 'kifogasol' | 'megszakit' | 'ujraindit';
type UgyTipus =
  | 'lehetoseg'
  | 'kapcsolat'
  | 'egyuttmukodes'
  | 'megallapodas'
  | 'fuggo_e'
  | 'fuggo_m'
  | 'visszakuldott'
  | 'kifogasolt'
  | 'megszakadt'
  | 'megszakadt_k'
  | 'ujrainditott';

interface UgyMinta {
  kezdo: 'lehetoseg' | 'kapcsolat';
  lepesek: readonly Lepes[];
  /** Az ügy a lépések után is aktív (tevékenység kapcsolhatható hozzá). */
  aktiv: boolean;
}

const UGY_MINTA: Record<UgyTipus, UgyMinta> = {
  lehetoseg: { kezdo: 'lehetoseg', lepesek: [], aktiv: true },
  kapcsolat: { kezdo: 'lehetoseg', lepesek: ['kapcsolat'], aktiv: true },
  egyuttmukodes: { kezdo: 'kapcsolat', lepesek: ['keres', 'igazol'], aktiv: true },
  megallapodas: { kezdo: 'kapcsolat', lepesek: ['keres', 'igazol', 'keres', 'igazol'], aktiv: true },
  fuggo_e: { kezdo: 'kapcsolat', lepesek: ['keres'], aktiv: true },
  fuggo_m: { kezdo: 'kapcsolat', lepesek: ['keres', 'igazol', 'keres'], aktiv: true },
  visszakuldott: { kezdo: 'kapcsolat', lepesek: ['keres', 'visszakuld'], aktiv: true },
  kifogasolt: { kezdo: 'lehetoseg', lepesek: ['kapcsolat', 'kifogasol'], aktiv: true },
  megszakadt: { kezdo: 'lehetoseg', lepesek: ['megszakit'], aktiv: false },
  megszakadt_k: { kezdo: 'kapcsolat', lepesek: ['megszakit'], aktiv: false },
  ujrainditott: { kezdo: 'lehetoseg', lepesek: ['megszakit', 'ujraindit'], aktiv: true },
};

/**
 * Az Eredmények fokozata → a félévben elért eredmények (a feladat táblázata): a 4-es fokozatnál megállapodás és
 * együttműködés (a láncban a kapcsolat is elért), a 3-asnál együttműködés és kapcsolat, a 2-esnél kapcsolat és
 * két lehetőség, az 1-esnél egy lehetőség, a 0-nál nincs. Az együttműködés és a megállapodás igazolt szakasz.
 */
const EREDMENY_TIPUSOK: Record<Fokozat, readonly UgyTipus[]> = {
  4: ['megallapodas'],
  3: ['egyuttmukodes'],
  2: ['kapcsolat', 'lehetoseg'],
  1: ['lehetoseg'],
  0: [],
};

/** A nyitott 2026/2 félév speciális állapotai: ezek az ügyek a fokozat szerintiek mellett készülnek. */
const NYITOTT_SPECIALIS: Readonly<Record<string, readonly UgyTipus[]>> = {
  'Erdei Márk': ['fuggo_e'],
  'Hegedűs Nóra': ['fuggo_e'],
  'Lukács Péter': ['fuggo_m'],
  'Takács Ádám': ['fuggo_e'],
  'Jakab Tamás': ['visszakuldott'],
  'Mátyás Dóra': ['visszakuldott'],
  'Papp Zsófia': ['kifogasolt'],
  'Novák Gergely': ['megallapodas'],
  'Kertész Anna': ['megszakadt'],
  'Vass Réka': ['megszakadt_k'],
  'Szalai Emese': ['ujrainditott'],
};
/** A nyitott félévben kifogásolt tevékenységet kapó attasék (egy-egy bejegyzés). */
const KIFOGASOLT_TEVEKENYSEG: readonly string[] = ['Bárdos Kata', 'Lukács Péter', 'Takács Ádám'];
/** Az az attasé, akinek a 2026/1 félévben igazolt szakaszát a központ a 2026/2 félévben visszavonja (a lezárt pillanatkép nem változik). */
const VISSZAVONAS_ATTASE = 'Fodor Lilla';

/** A speciális állapotok legkisebb darabszáma a nyitott félévben (az önellenőrzés ezt nézi). */
const NYITOTT_MINIMUM = { fuggo: 3, visszakuldott: 2, tevekenysegKifogas: 2, ugyKifogas: 1, megszakadt: 2, visszavont: 1 } as const;

/** Egy ügy egy minta szerinti lépésekkel elért szakaszai (lehetőség, kapcsolat, együttműködés, megállapodás darabszám). */
function elertSzakaszok(tipusok: readonly UgyTipus[]): Record<Szakasz, number> {
  const ki: Record<Szakasz, number> = { lehetoseg: 0, kapcsolat: 0, egyuttmukodes: 0, megallapodas: 0 };
  for (const tipus of tipusok) {
    const minta = UGY_MINTA[tipus];
    let szakasz: Szakasz = minta.kezdo;
    let kert: Szakasz | null = null;
    ki[szakasz] += 1;
    for (const lepes of minta.lepesek) {
      if (lepes === 'kapcsolat') {
        szakasz = 'kapcsolat';
        ki.kapcsolat += 1;
      } else if (lepes === 'keres') {
        kert = kovetkezoSzakasz(szakasz);
      } else if (lepes === 'igazol' && kert !== null) {
        szakasz = kert;
        ki[kert] += 1;
        kert = null;
      } else if (lepes === 'visszakuld') {
        kert = null;
      }
    }
  }
  return ki;
}

// Kitalált szövegek az A blokkhoz.
const PARTNER_ELO = ['Aranyfolyó', 'Kékhegyi', 'Szélmalmi', 'Délvirág', 'Északfény', 'Mintavölgyi', 'Holdkerti', 'Ezüstparti'];
const PARTNER_UTO = [
  'Innovációs Központ', 'Műszaki Egyetem', 'Technológiai Klaszter', 'Startup Inkubátor', 'Kutatóintézet',
  'Ipari Szövetség', 'Fejlesztési Ügynökség',
];
const MAGYAR_ELO = ['Mintaváros', 'Fehérmezői', 'Kisberki', 'Naplementei', 'Zöldligeti', 'Vadvirági'];
const MAGYAR_UTO = ['Műszaki Egyetem', 'Innovációs Kft.', 'Technológiai Park', 'Kutatóintézet', 'Startup Közösség', 'Gazdasági Kamara'];

const UGY_TEMA = [
  'közös kutatási projekt a(z) {p} partnerrel',
  'magyar beszállítók bevonása a(z) {p} projektjébe',
  'hallgatócsere-program a(z) {p} intézménnyel',
  'közös laborfejlesztés a(z) {p} partnerrel',
  'akcelerációs együttműködés a(z) {p} inkubátorral',
  'technológiatranszfer a(z) {p} bevonásával',
];
const UGY_LEIRAS = [
  'A helyi partner és a magyar szereplő között a kapcsolatfelvétel megtörtént, a következő lépés a közös projektterv egyeztetése.',
  'Az ügy a félév során több egyeztetéssel haladt, a partner elköteleződése folyamatosan erősödik.',
  'A partnerrel a lehetséges együttműködési formákat tisztáztuk, a részletek kidolgozása folyamatban van.',
];
const TEV_LEIRAS = [
  'A találkozón a felek bemutatták az együttműködési lehetőségeiket, és megegyeztek a folytatásról.',
  'A programon a magyar és a helyi szereplők a közös projektötleteket vitatták meg.',
  'A találkozó célja a partnerkeresés és az első kapcsolatfelvétel volt.',
];
const INDOKLAS_EGYUTTMUKODES = [
  'A partner írásos együttműködési szándéknyilatkozatot küldött, a közös munka első lépéseit egyeztettük.',
  'A felek a találkozó után megkezdték a közös projekt előkészítését, a feladatok felosztása megtörtént.',
  'A partner képviselői kétszer is egyeztettek a magyar féllel, a közös munkacsoport felállt.',
];
const INDOKLAS_MEGALLAPODAS = [
  'A felek aláírták a kétoldalú együttműködési megállapodást, a másolatot a jelentésekhez csatoltuk.',
  'A megállapodás szövegét a két fél elfogadta, az aláírás megtörtént.',
];
const VISSZAKULDES = [
  'Kérjük, csatolj írásos bizonyítékot a partner szándékáról, majd kérd újra az igazolást.',
  'A leírásból nem derül ki a partner konkrét vállalása, kérjük pontosítsd.',
];
const VISSZAVONAS = [
  'A partner utólag visszalépett, az együttműködés a jelenlegi tartalommal nem igazolható, ezért az igazolást visszavontuk.',
];
const UGY_KIFOGAS = [
  'A bejegyzés alapján a kapcsolat még nem igazolható, kérjük pontosítsd a partner szerepét és a magyar fél bevonását.',
];
const TEV_KIFOGAS = [
  'A bejegyzésből nem derül ki a találkozó időpontja és a résztvevők köre, kérjük pontosítsd.',
  'A megnevezés és a partner megadása hiányos, a tevékenység így nem számítható be.',
];
const MEGSZAKITAS = [
  'A partner átszervezés miatt felfüggesztette a projektet, az ügy egyelőre nem folytatható.',
  'A magyar szereplő kilépett az együttműködésből, új partner nélkül nincs folytatás.',
];

interface RiportInfo {
  id: string;
  targy: string;
  kategoria: string;
  orszag: string;
  esemenyDatum: string | null;
  /** A beadás pillanata és budapesti naptári napja. */
  createdAt: Date;
  nap: string;
}

/** Az attasé jelentései a félévben, létrehozás szerint (azonos időnél az azonosító dönt). */
function sajatRiportok(a: Attase, ido: Ido): RiportInfo[] {
  return db
    .select({
      id: riport.id,
      targy: riport.targy,
      kategoria: riport.kategoria,
      orszag: riport.orszag,
      esemenyDatum: riport.esemenyDatum,
      createdAt: riport.createdAt,
    })
    .from(riport)
    .where(eq(riport.szerzoId, a.id))
    .all()
    .sort((x, y) => x.createdAt.getTime() - y.createdAt.getTime() || (x.id < y.id ? -1 : 1))
    .map((r) => ({ ...r, nap: naptariNap(r.createdAt) }))
    .filter((r) => r.nap >= ido.elsoNap && r.nap <= ido.jelentesVeg);
}

/** Egy elkészült ügy: a tevékenységek kapcsolásához és az önellenőrzéshez. */
interface UgyRekord {
  id: string;
  felev: string;
  tipus: UgyTipus;
  /** A létrehozás budapesti naptári napja és pillanata. */
  nap: string;
  letrehozva: Date;
  orszag: string;
  partnerAlap: string;
  magyarAlap: string | null;
  aktiv: boolean;
}

/** Az attasé eddig létrehozott ügyei (az attasé azonosítója szerint). */
const ugyNaplo = new Map<string, UgyRekord[]>();

function irasOk(eredmenyKod: string, mit: string): void {
  if (eredmenyKod !== 'ok') throw new Error(`${mit}: az írás eredménye ${eredmenyKod}.`);
}

/** Az ügy jelenlegi verziója: minden írás előtt frissen olvasva (az írások ugyanezt a verziót ellenőrzik). */
function ugyVerzio(id: string): number {
  const u = tq.getEredmeny(id);
  if (!u) throw new Error(`Az eredmény (${id}) nem található.`);
  return u.verzio;
}

const partnerAlapNev = (): string => `${valasztA(PARTNER_ELO)} ${valasztA(PARTNER_UTO)}`;
const magyarAlapNev = (): string => `${valasztA(MAGYAR_ELO)} ${valasztA(MAGYAR_UTO)}`;
const kitalalt = (alap: string): string => `${alap} (kitalált)`;

function orszagValasztas(a: Attase): string {
  return esellyelA(0.7) ? a.szekhely : valasztA([a.szekhely, ...a.regio]);
}

/** `n` különböző munkanap a listából, időrendben (az ügy létrehozása és minden lépése külön napra esik). */
function ugyNapok(napok: readonly string[], n: number): string[] {
  if (napok.length < n) throw new Error(`Nincs elég munkanap (${napok.length}) ${n} lépéshez.`);
  const sorszamok = keverA([...napok.keys()]).slice(0, n).sort((x, y) => x - y);
  return sorszamok.map((i) => napok[i]);
}

/**
 * Egy ügy létrehozása és életútja az éles műveletekkel, történelmi időpontokkal: minden lépés az előzőnél későbbi
 * napon, az írás előtt frissen olvasott verzióval. A beszámítási félévet az `igazol` rögzíti: a félév lezárása
 * előtt készülő ügyeknél a kérés (és az igazolás) féléve.
 */
function ugyLefuttat(
  a: Attase,
  tipus: UgyTipus,
  napok: readonly string[],
  riportok: readonly RiportInfo[],
  felev: Felev,
): UgyRekord {
  const minta = UGY_MINTA[tipus];
  const orszag = orszagValasztas(a);
  const partnerAlap = partnerAlapNev();
  const magyarAlap = esellyelA(0.7) ? magyarAlapNev() : null;
  const hozzajarulas: Hozzajarulas = esellyelA(0.6) ? 'kozvetlen' : 'kozremukodes';
  const leiras = esellyelA(0.6) ? `${valasztA(UGY_LEIRAS)} ${KITALALT}` : null;
  const kontextus = (lepes: string) => `${a.nev}, ${felevKulcs(felev)}, ${tipus}, ${lepes}`;

  const letrehozva = idopontA(napok[0]);
  const letrehozas = tq.createEredmeny(
    a.id,
    {
      megnevezes: kitalalt(`${orszagNev(orszag)}: ${valasztA(UGY_TEMA).replace('{p}', partnerAlap)}`),
      orszagKod: orszag,
      partner: kitalalt(partnerAlap),
      magyarSzereplo: magyarAlap === null ? null : kitalalt(magyarAlap),
      hozzajarulas,
      leiras,
      kezdoSzakasz: minta.kezdo,
    },
    a.nev,
    letrehozva,
  );
  if (letrehozas.eredmeny !== 'ok' || letrehozas.id === undefined) throw new Error(`${kontextus('létrehozás')}: ${letrehozas.eredmeny}.`);
  const id = letrehozas.id;

  let szakasz: Szakasz = minta.kezdo;
  let kert: Szakasz | null = null;
  for (let i = 0; i < minta.lepesek.length; i += 1) {
    const lepes = minta.lepesek[i];
    const most = idopontA(napok[i + 1]);
    const mit = kontextus(lepes);
    switch (lepes) {
      case 'kapcsolat':
        irasOk(tq.kapcsolatbaLep(id, a.id, a.nev, ugyVerzio(id), most), mit);
        szakasz = 'kapcsolat';
        break;
      case 'keres': {
        // Bizonyítékul csak a kérés pillanatánál korábban beadott jelentés hivatkozható.
        const bizonyitekok = riportok.filter((r) => r.createdAt.getTime() < most.getTime());
        kert = kovetkezoSzakasz(szakasz);
        if (kert === null) throw new Error(`${mit}: nincs következő szakasz.`);
        irasOk(
          tq.kerIgazolast(
            id,
            a.id,
            {
              indoklas: `${valasztA(kert === 'megallapodas' ? INDOKLAS_MEGALLAPODAS : INDOKLAS_EGYUTTMUKODES)} ${KITALALT}`,
              link: esellyelA(0.5) ? `https://pelda.example/kitalalt/${egeszA(1000, 9999)}` : null,
              riportId: bizonyitekok.length > 0 && esellyelA(0.5) ? valasztA(bizonyitekok).id : null,
              verzio: ugyVerzio(id),
            },
            a.nev,
            most,
          ),
          mit,
        );
        break;
      }
      case 'igazol':
        irasOk(tq.igazol(id, ERTEKELO, ugyVerzio(id), most), mit);
        if (kert !== null) szakasz = kert;
        kert = null;
        break;
      case 'visszakuld':
        irasOk(tq.visszakuld(id, { megjegyzes: `${valasztA(VISSZAKULDES)} ${KITALALT}`, verzio: ugyVerzio(id) }, ERTEKELO, most), mit);
        kert = null;
        break;
      case 'kifogasol':
        irasOk(tq.kifogasolEredmeny(id, { megjegyzes: `${valasztA(UGY_KIFOGAS)} ${KITALALT}`, verzio: ugyVerzio(id) }, ERTEKELO, most), mit);
        break;
      case 'megszakit':
        irasOk(tq.megszakit(id, a.id, { megjegyzes: `${valasztA(MEGSZAKITAS)} ${KITALALT}`, verzio: ugyVerzio(id) }, a.nev, most), mit);
        break;
      case 'ujraindit':
        irasOk(tq.ujraindit(id, a.id, a.nev, ugyVerzio(id), most), mit);
        break;
    }
  }
  return { id, felev: felevKulcs(felev), tipus, nap: napok[0], letrehozva, orszag, partnerAlap, magyarAlap, aktiv: minta.aktiv };
}

type TevekenysegSorBe = typeof tevekenyseg.$inferInsert & { createdAt: Date };

function tevekenysegNev(tipus: TevekenysegTipus, partnerAlap: string, magyarAlap: string | null): string {
  switch (tipus) {
    case 'delegacio':
      return kitalalt(`Magyar delegáció a(z) ${partnerAlap} meghívására`);
    case 'b2b':
      return kitalalt(`B2B-találkozó a(z) ${partnerAlap} képviselőivel`);
    case 'partnerkozvetites':
      return kitalalt(`Partnerközvetítés: ${partnerAlap} és ${magyarAlap ?? 'magyar partner'}`);
  }
}

/**
 * Az attasé tevékenységei a félévben (közvetlen inserttel). A Kapcsolatépítés fokozata adja a darabszámot, a típusok
 * aránya B2B 50%, partnerközvetítés 30%, delegáció 20%. Ha van rendezvény vagy együttműködés kategóriájú jelentése,
 * legalább egy tevékenység abból indul (megnevezés a tárgyból, ország a jelentésből, dátum az esemény napjából vagy a
 * beadás napjából, mint az éles felületen); a többi bejegyzés egy része az attasé korábbi aktív ügyéhez kapcsolódik.
 */
function tevekenysegekLetrehoz(
  a: Attase,
  cella: Cella,
  ido: Ido,
  riportok: readonly RiportInfo[],
  kezdet: string,
): TevekenysegSorBe[] {
  const n = tevekenysegSzam(cella.fok.kapcsolatepites, ido);
  if (n === 0) return [];
  const tipusok = keverA(tipusLista(n));
  const jeloltek = riportok.filter((r) => r.kategoria === 'rendezveny' || r.kategoria === 'egyuttmukodes');
  const kotes = jeloltek.length === 0 ? 0 : Math.min(n, jeloltek.length, Math.max(1, Math.round(n * 0.4)));
  const napok = munkanapok(kezdet, ido.jelentesVeg);
  const ugyek = ugyNaplo.get(a.id) ?? [];
  const sorok: TevekenysegSorBe[] = [];

  const sor = (
    tipus: TevekenysegTipus,
    datum: string,
    letrehozasNap: string,
    orszagKod: string,
    megnevezes: string | null,
    partnerAlap: string,
    magyarAlap: string | null,
    r: RiportInfo | null,
    ugy: UgyRekord | null,
  ): TevekenysegSorBe => {
    const magyar = tipus === 'partnerkozvetites' ? (magyarAlap ?? magyarAlapNev()) : magyarAlap;
    // A bejegyzés nem előzheti meg a kapcsolt jelentést és ügyet (azonos napon a későbbi időpont után készül).
    const alap = idopontA(letrehozasNap);
    const legkorabban = Math.max(r?.createdAt.getTime() ?? 0, ugy?.letrehozva.getTime() ?? 0);
    const letrehozva = alap.getTime() > legkorabban ? alap : new Date(legkorabban + egeszA(1, 60) * 60_000);
    return {
      id: azonositoA(),
      attaseId: a.id,
      tipus,
      datum,
      orszagKod,
      megnevezes: megnevezes ?? tevekenysegNev(tipus, partnerAlap, magyar),
      partner: kitalalt(partnerAlap),
      magyarSzereplo: magyar === null ? null : kitalalt(magyar),
      leiras: esellyelA(0.5) ? `${valasztA(TEV_LEIRAS)} ${KITALALT}` : null,
      riportId: r?.id ?? null,
      eredmenyId: ugy?.id ?? null,
      createdAt: letrehozva,
      updatedAt: letrehozva,
    };
  };

  for (const r of keverA(jeloltek).slice(0, kotes)) {
    const elonyben: readonly TevekenysegTipus[] =
      r.kategoria === 'rendezveny' ? ['delegacio', 'b2b'] : ['partnerkozvetites', 'b2b'];
    const tipus = kivesz(tipusok, elonyben);
    const datum = r.esemenyDatum !== null && r.esemenyDatum >= kezdet && r.esemenyDatum <= ido.jelentesVeg ? r.esemenyDatum : r.nap;
    sorok.push(sor(tipus, datum, datum > r.nap ? datum : r.nap, r.orszag, r.targy, partnerAlapNev(), esellyelA(0.5) ? magyarAlapNev() : null, r, null));
  }
  for (const tipus of tipusok) {
    const datum = valasztA(napok);
    const jeloltUgyek = ugyek.filter((u) => u.aktiv && u.nap <= datum);
    const ugy = tipus !== 'delegacio' && jeloltUgyek.length > 0 && esellyelA(0.35) ? valasztA(jeloltUgyek) : null;
    sorok.push(
      ugy
        ? sor(tipus, datum, datum, ugy.orszag, null, ugy.partnerAlap, ugy.magyarAlap, null, ugy)
        : sor(tipus, datum, datum, orszagValasztas(a), null, partnerAlapNev(), esellyelA(0.5) ? magyarAlapNev() : null, null, null),
    );
  }
  return sorok.sort((x, y) => (x.datum < y.datum ? -1 : x.datum > y.datum ? 1 : 0));
}

/** Egy attasé A blokkja a félévben: az ügyek (fokozat szerintiek és nyitott félévben a speciálisak), majd a tevékenységek. */
function aBlokkAttase(a: Attase, cella: Cella, ido: Ido): { tevekenyseg: number; ugy: number } {
  const kezdet = kezdNap(a, ido);
  const napok = munkanapok(kezdet, ido.jelentesVeg);
  const riportok = sajatRiportok(a, ido);
  const tipusok = [
    ...EREDMENY_TIPUSOK[cella.fok.eredmenyek],
    ...(ido.terv.nyitott ? (NYITOTT_SPECIALIS[a.nev] ?? []) : []),
  ];
  const naplo = ugyNaplo.get(a.id) ?? [];
  ugyNaplo.set(a.id, naplo);
  for (const tipus of tipusok) {
    naplo.push(ugyLefuttat(a, tipus, ugyNapok(napok, 1 + UGY_MINTA[tipus].lepesek.length), riportok, ido.terv.f));
  }

  const sorok = tevekenysegekLetrehoz(a, cella, ido, riportok, kezdet);
  db.transaction((tx) => {
    for (const c of chunk(sorok, 40)) tx.insert(tevekenyseg).values(c).run();
  });

  if (ido.terv.nyitott) {
    if (KIFOGASOLT_TEVEKENYSEG.includes(a.nev)) {
      // A kifogás a bejegyzés rögzítése utáni napokban érkezik (a jelentésből indított tevékenységet a jelentés
      // beadásának napján rögzítik, ami a dátumánál későbbi lehet), legkésőbb a mérés előtt egy órával.
      const jeloltek = sorok.filter((s) => naptariNap(s.createdAt) <= plusNap(MA, -4));
      if (jeloltek.length === 0) throw new Error(`${a.nev}: nincs kifogásolható tevékenység a nyitott félévben.`);
      const cel = valasztA(jeloltek);
      const most = kisebb(idopontA(plusNap(naptariNap(cel.createdAt), egeszA(1, 6))), new Date(ido.hatar.getTime() - 3600_000));
      irasOk(tq.kifogasolTevekenyseg(cel.id, `${valasztA(TEV_KIFOGAS)} ${KITALALT}`, ERTEKELO, most), `${a.nev}, kifogásolt tevékenység`);
    }
    if (a.nev === VISSZAVONAS_ATTASE) {
      const cel = naplo.find((u) => (u.tipus === 'egyuttmukodes' || u.tipus === 'megallapodas') && u.felev === '2026/1');
      if (!cel) throw new Error(`${a.nev}: nincs 2026/1 félévben igazolt szakaszt elért ügye a visszavonáshoz.`);
      const most = idopontA(valasztA(munkanapok('2026-09-01', '2026-10-30')));
      irasOk(
        tq.visszavon(cel.id, { megjegyzes: `${valasztA(VISSZAVONAS)} ${KITALALT}`, verzio: ugyVerzio(cel.id) }, ERTEKELO, most),
        `${a.nev}, igazolás visszavonása`,
      );
    }
  }
  return { tevekenyseg: sorok.length, ugy: tipusok.length };
}

/** A félév A blokkja minden attasénak (a nem dolgozó és a kihagyott attasé kimarad). */
function aBlokkLetrehoz(attasek: readonly Attase[], ido: Ido): { tevekenyseg: number; ugy: number } {
  const osszeg = { tevekenyseg: 0, ugy: 0 };
  for (const a of attasek) {
    const cella = a.cellak[ido.terv.oszlop];
    if (cella === null || cella === 'kihagyva') continue;
    const r = aBlokkAttase(a, cella, ido);
    osszeg.tevekenyseg += r.tevekenyseg;
    osszeg.ugy += r.ugy;
  }
  return osszeg;
}

// ---------------------------------------------------------------------------------------------------------
// Egy félév feldolgozása
// ---------------------------------------------------------------------------------------------------------

function felevFeldolgoz(attasek: readonly Attase[], terv: FelevTerv): string {
  const ido = idoOf(terv);
  const forras = forrasadatokLetrehoz(attasek, ido);
  const idoszakId = ert.letrehozIdoszak(terv.f);

  // A bővített adatok jelzője a létrehozáskor csak a 2027/1 félévtől igaz: a tesztfélévekre közvetlenül állítjuk be.
  // A tevékenységek és az eredmények a lezárás előtt készülnek, hogy a rögzített pillanatkép tartalmazza őket.
  let aBlokk = { tevekenyseg: 0, ugy: 0 };
  if (aBlokkFelev(terv.f)) {
    db.update(ertekelesiIdoszak).set({ bovitettAdatok: true }).where(eq(ertekelesiIdoszak.id, idoszakId)).run();
    aBlokk = aBlokkLetrehoz(attasek, ido);
  }

  // Az új posztra érkezett attasénak a korábbi félévekben nincs sora.
  const nincsSor = attasek.filter((a) => a.cellak[terv.oszlop] === null && !terv.nyitott);
  for (const a of nincsSor) {
    db.delete(attaseErtekeles)
      .where(and(eq(attaseErtekeles.idoszakId, idoszakId), eq(attaseErtekeles.attaseId, a.id)))
      .run();
  }

  const sorok = new Map(ert.listHalozat(terv.f).sorok.map((s) => [s.attaseId, s]));
  let kihagyott = 0;
  attasek.forEach((a, i) => {
    const sor = sorok.get(a.id);
    const cella = a.cellak[terv.oszlop];
    if (!sor || cella === null) return;
    if (cella === 'kihagyva') {
      const r = ert.kihagyAttase(sor.ertekelesId, KIHAGYAS_OKA);
      if (r !== 'ok') throw new Error(`${a.nev}, ${felevKulcs(terv.f)}: a kihagyás eredménye ${r}.`);
      kihagyott += 1;
      return;
    }
    if (terv.nyitott) {
      // Nyitott félév: az első 6 attasé teljes, a következő 3 két szemponttal részleges, a többi üres.
      if (i < 6) {
        szempontokMentese(a, sor.ertekelesId, cella, ido, i, SZEMPONT_KULCSOK.length);
        osszMentese(a, sor.ertekelesId, cella, ido, i);
      } else if (i < 9) {
        szempontokMentese(a, sor.ertekelesId, cella, ido, i, 2);
      }
      return;
    }
    szempontokMentese(a, sor.ertekelesId, cella, ido, i, SZEMPONT_KULCSOK.length);
    osszMentese(a, sor.ertekelesId, cella, ido, i);
  });

  const felirat = felevCimke(terv.f);
  const adat = `${forras.jelentes} jelentés, ${forras.ticket} ticket${
    aBlokkFelev(terv.f) ? `, ${aBlokk.tevekenyseg} tevékenység, ${aBlokk.ugy} eredmény` : ''
  }`;
  if (terv.nyitott) return `${felirat}: nyitott, részben minősített (${adat}).`;
  const lezaras = ert.lezarIdoszak(terv.f, ERTEKELO, terv.most);
  if (lezaras.eredmeny !== 'ok') {
    const hianyzok = lezaras.eredmeny === 'hianyos' ? `: ${lezaras.hianyzok.join(', ')}` : '';
    throw new Error(`${felirat}: a lezárás eredménye ${lezaras.eredmeny}${hianyzok}.`);
  }
  return `${felirat}: lezárva, ${sorok.size} attasé (${kihagyott} kihagyott; ${adat}).`;
}

// ---------------------------------------------------------------------------------------------------------
// Ellenőrzések
// ---------------------------------------------------------------------------------------------------------

/** A beégetett adatok ellenőrzése még az adatbázis megnyitása előtt. */
function adatokEllenorzese(): string[] {
  const hibak: string[] = [];
  const nevek = new Set<string>();
  const szekhelyek = new Map<string, AttaseAdat[]>();
  const regiok = new Set<string>();
  const valos = new Set<string>(VALOS_ORSZAGOK);
  for (const a of ATTASEK) {
    const hiba = (uzenet: string) => hibak.push(`${a.nev}: ${uzenet}`);
    if (nevek.has(a.nev)) hiba('a név ismétlődik.');
    nevek.add(a.nev);
    szekhelyek.set(a.szekhely, [...(szekhelyek.get(a.szekhely) ?? []), a]);
    for (const kod of [a.szekhely, ...a.regio]) {
      if (!orszagByKod(kod)) hiba(`ismeretlen országkód: ${kod}.`);
      if (valos.has(kod)) hiba(`${kod} a valós hálózat országa.`);
    }
    for (const kod of a.regio) {
      if (regiok.has(kod)) hiba(`a regionális ország (${kod}) másik attasénál is szerepel.`);
      regiok.add(kod);
    }
    for (const s of MINTAK[a.mintazat]) parseCella(s);
  }
  for (const [kod, lista] of szekhelyek) {
    const vezetok = lista.filter((a) => a.vezet).length;
    if (vezetok !== 1) hibak.push(`${kod}: ${vezetok} kijelölt vezető van, pontosan egy kell.`);
    if (regiok.has(kod)) hibak.push(`${kod}: székhely és regionális ország is.`);
  }
  // Az A blokk beégetett adatai: minden hivatkozott attasé létezik, és a nyitott félévben dolgozik.
  const nyitottCella = (a: AttaseAdat) => parseCella(MINTAK[a.mintazat][FELEVEK[FELEVEK.length - 1].oszlop]);
  const hivatkozottak = [
    ...Object.keys(NYITOTT_SPECIALIS), ...KIFOGASOLT_TEVEKENYSEG, VISSZAVONAS_ATTASE,
  ];
  for (const nev of hivatkozottak) {
    const a = ATTASEK.find((x) => x.nev === nev);
    if (!a) hibak.push(`${nev}: az A blokk hivatkozik rá, de nincs ilyen attasé.`);
    else if (typeof nyitottCella(a) === 'string' || nyitottCella(a) === null) hibak.push(`${nev}: a nyitott félévben nem dolgozik.`);
  }
  for (const [nev, tipusok] of Object.entries(NYITOTT_SPECIALIS)) {
    for (const t of tipusok) if (!(t in UGY_MINTA)) hibak.push(`${nev}: ismeretlen ügytípus: ${t}.`);
  }
  if (TIPUS_ARANY.reduce((osszeg, [, szazalek]) => osszeg + szazalek, 0) !== 100) hibak.push('A tevékenységtípusok aránya nem 100%.');
  // Az országprofil évenként egy: ugyanazon év két félévében az országismeret fokozata nem térhet el.
  for (const a of ATTASEK) {
    const cellak = MINTAK[a.mintazat].map(parseCella);
    for (const ev of [2024, 2025, 2026]) {
      const fokok = FELEVEK.filter((fe) => !fe.nyitott && fe.f.ev === ev)
        .map((fe) => cellak[fe.oszlop])
        .filter((c): c is Cella => c !== null && c !== 'kihagyva')
        .map((c) => c.fok.orszagismeret);
      if (new Set(fokok).size > 1) hibak.push(`${a.nev}: az országismeret fokozata eltér a(z) ${ev}. év két félévében.`);
    }
  }
  return hibak;
}

/** Az adatbázis állapotának önellenőrzése; a hibák listája (üres = rendben). */
function onellenorzes(attasek: readonly Attase[]): string[] {
  const hibak: string[] = [];
  const hiba = (uzenet: string) => hibak.push(uzenet);

  // Az attasék, a szerepek és a vezetők.
  const attasekDb = db.select({ email: user.email }).from(user).where(eq(user.role, 'attase')).all();
  if (attasekDb.length !== ATTASEK.length) hiba(`${attasekDb.length} attasé van, ${ATTASEK.length} kellene.`);
  if (db.select({ id: user.id }).from(user).where(like(user.email, '%@demo.test')).all().length > 0) {
    hiba('valós demó attasé (@demo.test) maradt az adatbázisban.');
  }
  if (db.select({ id: session.id }).from(session).all().length > 0) hiba('session-sor maradt az adatbázisban.');
  const vezetok = new Map<string, string[]>();
  for (const s of db.select().from(attaseOrszag).where(eq(attaseOrszag.vezeto, true)).all()) {
    vezetok.set(s.userId, [...(vezetok.get(s.userId) ?? []), s.orszagKod]);
  }
  for (const a of attasek) {
    const varhato = vezetettKodok(a).sort().join(',');
    const tenyleges = (vezetok.get(a.id) ?? []).sort().join(',');
    if (varhato !== tenyleges) hiba(`${a.nev}: a vezetett országok „${tenyleges}”, „${varhato}” kellene.`);
  }

  // Egyetlen valós országkód sem szerepelhet az értékelés adataiban.
  const valos = new Set<string>(VALOS_ORSZAGOK);
  const orszagok = [
    ...db.select({ k: attaseOrszag.orszagKod }).from(attaseOrszag).all().map((r) => r.k),
    ...db.select({ k: riport.orszag }).from(riport).all().map((r) => r.k),
    ...db.select({ k: ticket.orszag }).from(ticket).all().map((r) => r.k),
    ...db.select({ k: tevekenyseg.orszagKod }).from(tevekenyseg).all().map((r) => r.k),
    ...db.select({ k: eredmeny.orszagKod }).from(eredmeny).all().map((r) => r.k),
    ...db.select({ k: attaseErtekeles.szekhelyKod }).from(attaseErtekeles).all().map((r) => r.k),
    ...db.select({ o: attaseErtekeles.orszagok }).from(attaseErtekeles).all().flatMap((r) => r.o.map((x) => x.kod)),
    ...db
      .select({ k: orszagprofil.orszagKod })
      .from(orszagprofil)
      .where(inArray(orszagprofil.szerzoId, attasek.map((a) => a.id)))
      .all()
      .map((r) => r.k),
  ];
  const valosTalalat = [...new Set(orszagok.filter((k) => valos.has(k)))];
  if (valosTalalat.length > 0) hiba(`valós hálózati országkód szerepel az adatokban: ${valosTalalat.join(', ')}.`);
  const nevekDb = new Set(db.select({ n: attaseErtekeles.attaseNev }).from(attaseErtekeles).all().map((r) => r.n));
  for (const n of nevekDb) if (!ATTASEK.some((a) => a.nev === n)) hiba(`ismeretlen név az értékelésekben: ${n}.`);

  // Az időszakok.
  const idoszakok = db.select().from(ertekelesiIdoszak).all();
  if (idoszakok.length !== FELEVEK.length) hiba(`${idoszakok.length} időszak van, ${FELEVEK.length} kellene.`);
  if (idoszakok.filter((i) => i.statusz === 'lezart').length !== FELEVEK.length - 1) hiba('nem pontosan négy lezárt időszak van.');
  // A bővített adatok jelzője: a 2024/2 félévé hamis, a 2025/1 és későbbi négy félévé igaz.
  for (const i of idoszakok) {
    const kell = aBlokkFelev({ ev: i.ev, felev: i.felev as FelevSzam });
    if (i.bovitettAdatok !== kell) hiba(`${i.ev}/${i.felev}: a bővített adatok jelzője ${i.bovitettAdatok}, ${kell} kellene.`);
  }
  if (idoszakok.filter((i) => i.bovitettAdatok).length !== 4) hiba('nem pontosan négy félév kapott bővített adat jelzőt.');

  // Szükséges fokozatok.
  const szempontFokozatok = new Set(db.selectDistinct({ f: szempontMinosites.fokozat }).from(szempontMinosites).all().map((r) => r.f));
  for (const f of [0, 1, 2, 3, 4]) if (!szempontFokozatok.has(f)) hiba(`a szempontoknál nem fordul elő a(z) ${f} fokozat.`);
  const osszFokozatok = new Set(db.selectDistinct({ f: attaseErtekeles.osszFokozat }).from(attaseErtekeles).all().map((r) => r.f));
  for (const f of [1, 2, 3, 4]) if (!osszFokozatok.has(f)) hiba(`az összminősítésnél nem fordul elő a(z) ${f} fokozat.`);

  // A 2026/1 félév változásai.
  const valtozasok = new Set(
    ert.listHalozat({ ev: 2026, felev: 1 }).sorok.map((s) => s.valtozas),
  );
  for (const v of ['javult', 'romlott', 'azonos', 'uj'] as const) {
    if (!valtozasok.has(v)) hiba(`a 2026/1 félévben nincs „${v}” változás.`);
  }

  // A lezárt félévek értékelései: teljes minősítés és a forrásszabályokkal egyező, rögzített mutatók.
  const ertekelesek = db
    .select({
      id: attaseErtekeles.id,
      attaseId: attaseErtekeles.attaseId,
      kimarad: attaseErtekeles.kimarad,
      osszFokozat: attaseErtekeles.osszFokozat,
      mutatok: attaseErtekeles.mutatok,
      ev: ertekelesiIdoszak.ev,
      felev: ertekelesiIdoszak.felev,
      statusz: ertekelesiIdoszak.statusz,
    })
    .from(attaseErtekeles)
    .innerJoin(ertekelesiIdoszak, eq(attaseErtekeles.idoszakId, ertekelesiIdoszak.id))
    .where(eq(ertekelesiIdoszak.statusz, 'lezart'))
    .all();
  for (const r of ertekelesek) {
    const a = attasek.find((x) => x.id === r.attaseId);
    const terv = FELEVEK.find((fe) => !fe.nyitott && fe.f.ev === r.ev && fe.f.felev === r.felev);
    const cella = a && terv ? a.cellak[terv.oszlop] : null;
    const kulcs = `${a?.nev ?? r.attaseId}, ${r.ev}/${r.felev}`;
    if (!a || !terv || cella === null) {
      hiba(`${kulcs}: a mintázat szerint nem kellene sornak lennie.`);
      continue;
    }
    if (cella === 'kihagyva') {
      if (!r.kimarad || r.mutatok !== null) hiba(`${kulcs}: kihagyott sornak kimaradónak és mutató nélkülinek kell lennie.`);
      continue;
    }
    if (r.kimarad) hiba(`${kulcs}: a sor kihagyott, pedig nem kellene.`);
    const minositesek = db.select().from(szempontMinosites).where(eq(szempontMinosites.ertekelesId, r.id)).all();
    if (minositesek.length !== SZEMPONT_KULCSOK.length || r.osszFokozat !== cella.ossz) {
      hiba(`${kulcs}: hiányos minősítés (${minositesek.length} szempont, összminősítés ${r.osszFokozat}).`);
    }
    for (const m of minositesek) {
      const kell = m.szempont === 'orszagismeret' && vezetettKodok(a).length === 0 ? 0 : cella.fok[m.szempont as SzempontKulcs];
      if (m.fokozat !== kell) hiba(`${kulcs}: a(z) ${m.szempont} fokozata ${m.fokozat}, ${kell} kellene.`);
    }
    if (r.mutatok === null) hiba(`${kulcs}: nincs rögzített mutató.`);
    else {
      mutatokEllenorzese(a, cella, r.mutatok, kulcs, hiba);
      aMutatokEllenorzese(cella, r.mutatok, kulcs, hiba, terv.f);
    }
  }

  // A nyitott félév: 6 teljes, 3 részleges, 6 üres.
  const nyitottSorok = ert.listHalozat(FELEVEK[4].f).sorok;
  const teljesek = nyitottSorok.filter(teljesE).length;
  if (nyitottSorok.length !== attasek.length) hiba(`a nyitott félévben ${nyitottSorok.length} sor van, ${attasek.length} kellene.`);
  if (teljesek !== 6) hiba(`a nyitott félévben ${teljesek} teljes sor van, 6 kellene.`);
  attasek.forEach((a, i) => {
    const sor = nyitottSorok.find((s) => s.attaseId === a.id);
    if (!sor || i < 6) return;
    const { kesz } = haladas(sor);
    if (i < 9 && (kesz < 2 || sor.osszFokozat !== null)) hiba(`${a.nev}: a nyitott félévben nem részleges.`);
    if (i >= 9 && (kesz !== 0 || sor.osszFokozat !== null)) hiba(`${a.nev}: a nyitott félévben nem üres.`);
  });

  aBlokkEllenorzes(attasek, hiba);
  return hibak;
}

/** Egy félév napjai (`YYYY-MM-DD`) között van-e a nap (zárt intervallum). */
function napBenne(nap: string, f: Felev): boolean {
  const { elsoNap, utolsoNap } = felevNapok(f);
  return nap >= elsoNap && nap <= utolsoNap;
}

/**
 * Az A blokk (tevékenységek és eredmények) ellenőrzése az adatbázisból, a rögzített pillanatképektől függetlenül:
 * hivatkozások és tulajdonosok, félévenkénti darabszámok, jelentésből indított tevékenységek, a típusok aránya, a
 * kihagyott és a később érkezett attasé adatmentessége, és a nyitott félév speciális állapotai.
 */
function aBlokkEllenorzes(attasek: readonly Attase[], hiba: (uzenet: string) => void): void {
  const attaseById = new Map(attasek.map((a) => [a.id, a]));
  const tevek = db.select().from(tevekenyseg).all();
  const ugyek = db.select().from(eredmeny).all();
  const esemenyek = db.select().from(eredmenyEsemeny).all();
  const riportok = new Map(
    db
      .select({ id: riport.id, szerzoId: riport.szerzoId, kategoria: riport.kategoria, createdAt: riport.createdAt })
      .from(riport)
      .all()
      .map((r) => [r.id, r]),
  );
  const ugyById = new Map(ugyek.map((u) => [u.id, u]));
  const orszagok = (a: Attase) => new Set<string>([a.szekhely, ...a.regio]);
  const nyitott = FELEVEK[FELEVEK.length - 1];

  // 1. Tevékenységek: tulajdonos, ország, dátum, hivatkozások, kifogás-mezők.
  for (const t of tevek) {
    const a = attaseById.get(t.attaseId);
    const kulcs = `tevékenység „${t.megnevezes}”`;
    if (!a) {
      hiba(`${kulcs}: ismeretlen attasé (${t.attaseId}).`);
      continue;
    }
    if (!orszagok(a).has(t.orszagKod)) hiba(`${kulcs} (${a.nev}): a(z) ${t.orszagKod} ország nem az attasé országa.`);
    if (t.datum > MA) hiba(`${kulcs} (${a.nev}): a dátum (${t.datum}) jövőbeli.`);
    if (t.datum < felevNapok(A_ELSO_FELEV).elsoNap) hiba(`${kulcs} (${a.nev}): a dátum (${t.datum}) a bővített adatot gyűjtő félévek előtti.`);
    if (Math.max(t.createdAt.getTime(), t.updatedAt.getTime(), t.kifogasAt?.getTime() ?? 0) > MOST_NYITOTT.getTime()) {
      hiba(`${kulcs} (${a.nev}): az időbélyeg a „mai” pillanatnál későbbi.`);
    }
    if (t.tipus === 'partnerkozvetites' && t.magyarSzereplo === null) hiba(`${kulcs} (${a.nev}): a partnerközvetítésnél hiányzik a magyar szereplő.`);
    if (!t.megnevezes.includes('(kitalált)') || !t.partner.includes('(kitalált)')) hiba(`${kulcs} (${a.nev}): a szöveg nem jelzi, hogy kitalált.`);
    if ([t.kifogas, t.kifogasSzerzoNev, t.kifogasAt].filter((v) => v !== null).length % 3 !== 0) hiba(`${kulcs} (${a.nev}): a kifogás mezői nem együtt töltöttek.`);
    if (t.updatedAt.getTime() < t.createdAt.getTime()) hiba(`${kulcs} (${a.nev}): a módosítás ideje a rögzítésnél korábbi.`);
    if (t.kifogasAt !== null && t.kifogasAt.getTime() < t.createdAt.getTime()) hiba(`${kulcs} (${a.nev}): a kifogás a rögzítésnél korábbi.`);
    if (t.kifogasAt !== null && t.kifogasAt.getTime() > t.updatedAt.getTime()) hiba(`${kulcs} (${a.nev}): a kifogás a módosítás idejénél későbbi.`);
    if (t.riportId !== null) {
      const r = riportok.get(t.riportId);
      if (!r || r.szerzoId !== t.attaseId) hiba(`${kulcs} (${a.nev}): a kapcsolt jelentés nem az attasé jelentése.`);
      else if (r.createdAt.getTime() > t.createdAt.getTime()) hiba(`${kulcs} (${a.nev}): a kapcsolt jelentés a tevékenységnél később készült.`);
    }
    if (t.eredmenyId !== null) {
      const u = ugyById.get(t.eredmenyId);
      if (!u || u.attaseId !== t.attaseId) hiba(`${kulcs} (${a.nev}): a kapcsolt eredmény nem az attasé eredménye.`);
      else if (u.createdAt.getTime() > t.createdAt.getTime()) hiba(`${kulcs} (${a.nev}): a kapcsolt eredmény a tevékenységnél később készült.`);
    }
  }

  // 2. Eredmények és előzményeik: tulajdonos, ország, szerzők, időrend.
  const szerzok = new Set<string>([ERTEKELO, ...ATTASEK.map((a) => a.nev)]);
  for (const u of ugyek) {
    const a = attaseById.get(u.attaseId);
    const kulcs = `eredmény „${u.megnevezes}”`;
    if (!a) {
      hiba(`${kulcs}: ismeretlen attasé (${u.attaseId}).`);
      continue;
    }
    if (!orszagok(a).has(u.orszagKod)) hiba(`${kulcs} (${a.nev}): a(z) ${u.orszagKod} ország nem az attasé országa.`);
    if (Math.max(u.createdAt.getTime(), u.updatedAt.getTime(), u.kifogasAt?.getTime() ?? 0) > MOST_NYITOTT.getTime()) {
      hiba(`${kulcs} (${a.nev}): az időbélyeg a „mai” pillanatnál későbbi.`);
    }
    if (!u.megnevezes.includes('(kitalált)') || !u.partner.includes('(kitalált)')) hiba(`${kulcs} (${a.nev}): a szöveg nem jelzi, hogy kitalált.`);
    if (u.updatedAt.getTime() < u.createdAt.getTime()) hiba(`${kulcs} (${a.nev}): a módosítás ideje a létrehozásnál korábbi.`);
    if (u.kifogasAt !== null && u.kifogasAt.getTime() < u.createdAt.getTime()) hiba(`${kulcs} (${a.nev}): a kifogás a létrehozásnál korábbi.`);
    if (u.kifogasAt !== null && u.kifogasAt.getTime() > u.updatedAt.getTime()) hiba(`${kulcs} (${a.nev}): a kifogás a módosítás idejénél későbbi.`);
    if (u.kertSzakasz !== null && u.igazolas !== 'igazolasra_var') hiba(`${kulcs} (${a.nev}): függő kérés, de az igazolás állapota ${u.igazolas}.`);
    if (u.kertSzakasz === null && u.igazolas === 'igazolasra_var') hiba(`${kulcs} (${a.nev}): „igazolásra vár”, de nincs függő kérés.`);
    const sajat = esemenyek.filter((e) => e.eredmenyId === u.id).sort((x, y) => x.createdAt.getTime() - y.createdAt.getTime());
    if (sajat.length === 0 || sajat[0].tipus !== 'letrehozas') hiba(`${kulcs} (${a.nev}): az első esemény nem a létrehozás.`);
    if (sajat.length > 0 && sajat[0].createdAt.getTime() < u.createdAt.getTime()) hiba(`${kulcs} (${a.nev}): az első esemény a létrehozásnál korábbi.`);
    sajat.forEach((e, i) => {
      if (i > 0 && e.createdAt.getTime() <= sajat[i - 1].createdAt.getTime()) hiba(`${kulcs} (${a.nev}): az események nem szigorúan időrendiek.`);
      if (e.createdAt.getTime() > MOST_NYITOTT.getTime()) hiba(`${kulcs} (${a.nev}): az esemény ideje a „mai” napnál későbbi.`);
      if (!szerzok.has(e.szerzoNev)) hiba(`${kulcs} (${a.nev}): ismeretlen szerző az előzményekben: ${e.szerzoNev}.`);
      if (e.riportId !== null) {
        const r = riportok.get(e.riportId);
        if (r?.szerzoId !== u.attaseId) hiba(`${kulcs} (${a.nev}): a kérés jelentése nem az attasé jelentése.`);
        else if (r.createdAt.getTime() > e.createdAt.getTime()) hiba(`${kulcs} (${a.nev}): a kérés olyan jelentésre hivatkozik, amely a kérésnél később készült.`);
      }
    });
  }

  // 3. A kihagyott és a később érkezett attasé nem kap adatot a kimaradt időszakban.
  for (const a of attasek) {
    const tilosNapok: ((nap: string) => boolean)[] = [];
    for (const fe of FELEVEK) {
      const cella = a.cellak[fe.oszlop];
      if (!fe.nyitott && (cella === null || cella === 'kihagyva')) tilosNapok.push((nap) => napBenne(nap, fe.f));
    }
    if (a.kezdet !== undefined) {
      const kezdet = a.kezdet;
      tilosNapok.push((nap) => nap < kezdet);
    }
    const tilos = (nap: string) => tilosNapok.some((fv) => fv(nap));
    for (const t of tevek.filter((x) => x.attaseId === a.id)) {
      if (tilos(t.datum)) hiba(`${a.nev}: tevékenység a kimaradt időszakban (${t.datum}).`);
    }
    for (const u of ugyek.filter((x) => x.attaseId === a.id)) {
      if (tilos(naptariNap(u.createdAt))) hiba(`${a.nev}: eredmény a kimaradt időszakban (${naptariNap(u.createdAt)}).`);
      for (const e of esemenyek.filter((x) => x.eredmenyId === u.id)) {
        if (tilos(naptariNap(e.createdAt))) hiba(`${a.nev}: eredmény-esemény a kimaradt időszakban (${naptariNap(e.createdAt)}).`);
      }
    }
  }

  // 4. Félévenként és attasénként: a tevékenységek száma, és a jelentésből indított tevékenység.
  for (const fe of FELEVEK.filter((x) => aBlokkFelev(x.f))) {
    const ido = idoOf(fe);
    for (const a of attasek) {
      const cella = a.cellak[fe.oszlop];
      if (cella === null || cella === 'kihagyva') continue;
      const kulcs = `${a.nev}, ${felevKulcs(fe.f)}`;
      const felevben = tevek.filter((t) => t.attaseId === a.id && napBenne(t.datum, fe.f));
      const varhato = tevekenysegSzam(cella.fok.kapcsolatepites, ido);
      if (felevben.length !== varhato) hiba(`${kulcs}: ${felevben.length} tevékenység, ${varhato} kellene.`);
      if (varhato === 0) continue;
      const kapcsolatiJelentesek = [...riportok.values()].filter(
        (r) =>
          r.szerzoId === a.id &&
          (r.kategoria === 'rendezveny' || r.kategoria === 'egyuttmukodes') &&
          naptariNap(r.createdAt) >= ido.elsoNap &&
          naptariNap(r.createdAt) <= ido.jelentesVeg,
      );
      const indult = felevben.filter((t) => {
        const kategoria = t.riportId === null ? null : riportok.get(t.riportId)?.kategoria;
        return kategoria === 'rendezveny' || kategoria === 'egyuttmukodes';
      });
      if (kapcsolatiJelentesek.length > 0 && indult.length === 0) {
        hiba(`${kulcs}: van rendezvény vagy együttműködés jelentése, de egy tevékenység sem indul jelentésből.`);
      }
    }
  }

  // 5. A típusok országos aránya.
  for (const [tipus, szazalek] of TIPUS_ARANY) {
    const tenyleges = (tevek.filter((t) => t.tipus === tipus).length * 100) / Math.max(1, tevek.length);
    if (Math.abs(tenyleges - szazalek) > TIPUS_ELTERES) hiba(`a(z) ${tipus} tevékenységek aránya ${tenyleges.toFixed(1)}%, ${szazalek}% kellene (±${TIPUS_ELTERES}).`);
  }

  // 6. Előfordul minden szakasz, igazolási állapot, esemény, kifogás, megszakadt ügy és jelentésből indított tevékenység.
  for (const { kulcs } of SZAKASZOK) if (!ugyek.some((u) => u.szakasz === kulcs)) hiba(`nincs „${kulcs}” szakaszban lévő ügy.`);
  for (const allapot of ['nem_igenyel', 'igazolasra_var', 'igazolt', 'visszakuldott'] as const) {
    if (!ugyek.some((u) => u.igazolas === allapot)) hiba(`nincs „${allapot}” igazolási állapotú ügy.`);
  }
  for (const tipus of Object.keys(ESEMENY_CIMKE) as EsemenyTipus[]) {
    if (!esemenyek.some((e) => e.tipus === tipus)) hiba(`nincs „${tipus}” típusú esemény.`);
  }
  if (!tevek.some((t) => t.riportId !== null)) hiba('nincs jelentésből indított tevékenység.');
  if (!tevek.some((t) => t.eredmenyId !== null)) hiba('nincs eredményhez kapcsolt tevékenység.');

  // 7. A nyitott félév speciális állapotai.
  const legutolso = (id: string) => esemenyek.filter((e) => e.eredmenyId === id).sort((x, y) => y.createdAt.getTime() - x.createdAt.getTime())[0];
  const nyitottNapban = (d: Date) => napBenne(naptariNap(d), nyitott.f);
  const fuggo = ugyek.filter((u) => u.kertSzakasz !== null && u.allapot === 'aktiv' && nyitottNapban(legutolso(u.id)?.createdAt ?? new Date(0))).length;
  const visszakuldott = ugyek.filter((u) => u.igazolas === 'visszakuldott' && u.kertSzakasz === null && legutolso(u.id)?.tipus === 'visszakuldes').length;
  const tevekenysegKifogas = tevek.filter((t) => t.kifogas !== null && napBenne(t.datum, nyitott.f)).length;
  const ugyKifogas = ugyek.filter((u) => u.kifogas !== null && u.allapot === 'aktiv').length;
  const megszakadt = ugyek.filter((u) => u.allapot === 'megszakadt' && legutolso(u.id)?.tipus === 'megszakitas').length;
  const visszavont = esemenyek.filter((e) => e.tipus === 'igazolas' && e.visszavonva && ugyek.some((u) => u.id === e.eredmenyId && u.igazolas === 'visszakuldott')).length;
  const minimum: [string, number, number][] = [
    ['függő igazoláskérés', fuggo, NYITOTT_MINIMUM.fuggo],
    ['visszaküldött kérés', visszakuldott, NYITOTT_MINIMUM.visszakuldott],
    ['kifogásolt tevékenység', tevekenysegKifogas, NYITOTT_MINIMUM.tevekenysegKifogas],
    ['kifogásolt ügy', ugyKifogas, NYITOTT_MINIMUM.ugyKifogas],
    ['megszakadt ügy', megszakadt, NYITOTT_MINIMUM.megszakadt],
    ['visszavont igazolás', visszavont, NYITOTT_MINIMUM.visszavont],
  ];
  for (const [nev, darab, kell] of minimum) {
    if (darab < kell) hiba(`a nyitott ${felevKulcs(nyitott.f)} félévben ${darab} ${nev} van, legalább ${kell} kellene.`);
  }
  // A visszavont igazolás egy lezárt félévbe beszámított igazolás: a rögzített pillanatkép ettől nem változik.
  const lezartVisszavont = esemenyek.filter((e) => {
    if (e.tipus !== 'igazolas' || !e.visszavonva || e.beszamitasiEv === null || e.beszamitasiFelev === null) return false;
    return !(e.beszamitasiEv === nyitott.f.ev && e.beszamitasiFelev === nyitott.f.felev);
  }).length;
  if (lezartVisszavont < 1) hiba('nincs lezárt félévbe beszámított, később visszavont igazolás.');
}

/**
 * Az A blokk rögzített mutatói: a bővített adat nélküli félév pillanatképe `verzio: 1`, az új mezők nélkül; a
 * 2025/1 és későbbi lezárt félévek `verzio: 2`, a Kapcsolatépítés fokozata szerinti tevékenységszámmal és az
 * Eredmények fokozata szerinti elért szakaszokkal. A tevékenységszám táblázata és a 4/3/2/1-es fokozat feltételei
 * szándékosan külön állnak a generálástól; az elért szakaszok pontos darabszámát a generáló mintákból vezeti le.
 */
function aMutatokEllenorzese(
  cella: Cella,
  m: ErtekelesMutatok,
  kulcs: string,
  hiba: (uzenet: string) => void,
  f: Felev,
): void {
  const tev = m.kapcsolatepites.tevekenyseg;
  const er = m.eredmenyek;
  if (!aBlokkFelev(f)) {
    if (m.verzio !== 1) hiba(`${kulcs}: a bővített adat nélküli félév pillanatképe verzio ${m.verzio}, 1 kellene.`);
    if (tev !== undefined || er !== undefined) hiba(`${kulcs}: a bővített adat nélküli félév pillanatképében tevékenységi vagy eredményadat van.`);
    return;
  }
  if (m.verzio !== 2) hiba(`${kulcs}: a pillanatkép verzio ${m.verzio}, 2 kellene.`);
  if (tev === undefined || er === undefined) {
    hiba(`${kulcs}: a pillanatkép nem tartalmazza a tevékenységi és az eredménymutatókat.`);
    return;
  }

  const k = cella.fok.kapcsolatepites;
  const e = cella.fok.eredmenyek;
  const varhatoTevekenyseg = ({ 4: 10, 3: 7, 2: 4, 1: 2, 0: 0 } as const)[k];
  const osszTevekenyseg = tev.delegacioDb + tev.b2bDb + tev.partnerkozvetitesDb + tev.kifogasoltDb;
  if (osszTevekenyseg !== varhatoTevekenyseg || tev.tevekenysegek.length !== varhatoTevekenyseg) {
    hiba(`${kulcs}: ${osszTevekenyseg} tevékenység (${tev.tevekenysegek.length} bizonyíték), ${varhatoTevekenyseg} kellene a(z) ${k}. kapcsolatépítés-fokozathoz.`);
  }
  if (tev.kifogasoltDb !== 0) hiba(`${kulcs}: a lezárt félévben ${tev.kifogasoltDb} kifogásolt tevékenység van, 0 kellene.`);
  if (er.igazolasraVarDb !== 0 || er.megszakadtDb !== 0) {
    hiba(`${kulcs}: a lezárt félévben függő kérés (${er.igazolasraVarDb}) vagy megszakadt ügy (${er.megszakadtDb}) van.`);
  }

  // A feladat táblázata: a 4-es fokozatnál megállapodás, a 3-asnál igazolt együttműködés, a 2-esnél és az 1-esnél nincs igazolt szakasz.
  if (e === 4 && !(er.megallapodasDb >= 1)) hiba(`${kulcs}: a 4-es Eredmények fokozatnál nincs megállapodás (${er.megallapodasDb}).`);
  if (e === 3 && !(er.egyuttmukodesDb >= 1)) hiba(`${kulcs}: a 3-as Eredmények fokozatnál nincs igazolt együttműködés (${er.egyuttmukodesDb}).`);
  if ((e === 2 || e === 1) && (er.egyuttmukodesDb > 0 || er.megallapodasDb > 0)) {
    hiba(`${kulcs}: a(z) ${e}. Eredmények fokozatnál igazolt szakasz van (együttműködés ${er.egyuttmukodesDb}, megállapodás ${er.megallapodasDb}).`);
  }
  const varhato = elertSzakaszok(EREDMENY_TIPUSOK[e]);
  const tenyleges = {
    lehetoseg: er.lehetosegDb, kapcsolat: er.kapcsolatDb, egyuttmukodes: er.egyuttmukodesDb, megallapodas: er.megallapodasDb,
  };
  for (const { kulcs: szakasz } of SZAKASZOK) {
    if (tenyleges[szakasz] !== varhato[szakasz]) hiba(`${kulcs}: ${tenyleges[szakasz]} elért „${szakasz}” szakasz, ${varhato[szakasz]} kellene a(z) ${e}. Eredmények fokozathoz.`);
  }
  if (er.ugyek.length !== EREDMENY_TIPUSOK[e].length) {
    hiba(`${kulcs}: ${er.ugyek.length} eredmény-bizonyíték, ${EREDMENY_TIPUSOK[e].length} kellene.`);
  }
}

/** A rögzített mutatók egyeznek a generálási szabályokkal (a lezáráskor számolt pillanatképet vetjük össze). */
function mutatokEllenorzese(
  a: Attase,
  cella: Cella,
  m: ErtekelesMutatok,
  kulcs: string,
  hiba: (uzenet: string) => void,
): void {
  const t = forrasFok(cella.fok.tajekoztatas);
  const o = forrasFok(cella.fok.orszagismeret);
  const e = forrasFok(cella.fok.egyuttmukodes);
  if (m.tajekoztatas.jelentesDb !== JELENTES[t]) hiba(`${kulcs}: ${m.tajekoztatas.jelentesDb} jelentés, ${JELENTES[t]} kellene.`);
  if (m.tajekoztatas.lefedettTema !== TEMA_DB[t]) hiba(`${kulcs}: ${m.tajekoztatas.lefedettTema} lefedett téma, ${TEMA_DB[t]} kellene.`);
  const intezkedes = Math.round(JELENTES[t] * INTEZKEDES_ARANY[t]);
  if (m.tajekoztatas.intezkedesDb !== intezkedes) hiba(`${kulcs}: ${m.tajekoztatas.intezkedesDb} intézkedés, ${intezkedes} kellene.`);
  if (m.egyuttmukodes.ticketDb !== TICKET_DB) hiba(`${kulcs}: ${m.egyuttmukodes.ticketDb} ticket, ${TICKET_DB} kellene.`);
  const median = m.egyuttmukodes.elsoValaszMedianNap;
  if (median === null || Math.abs(median - VALASZ_MUNKANAP[e]) > 0.2 + SZORAS * 1.2 * VALASZ_MUNKANAP[e]) {
    hiba(`${kulcs}: az első válasz mediánja ${median}, kb. ${VALASZ_MUNKANAP[e]} kellene.`);
  }
  if (e === 1 && m.egyuttmukodes.valaszNelkulDb < 1) hiba(`${kulcs}: a 30% válasz nélküli ticket hiányzik.`);
  const [savAlja, savTeteje] = HATARIDORE_SAV[e];
  const { hataridoreDb, hataridosDb } = m.egyuttmukodes;
  if (hataridosDb === 0 || hataridoreDb / hataridosDb < savAlja || hataridoreDb / hataridosDb > savTeteje) {
    hiba(`${kulcs}: ${hataridoreDb} / ${hataridosDb} ticket teljesült határidőre, a(z) ${e}. fokozat sávja ${savAlja}–${savTeteje}.`);
  }
  const vezetett = vezetettKodok(a).length;
  if (m.orszagismeret.vezetettDb !== vezetett) hiba(`${kulcs}: ${m.orszagismeret.vezetettDb} vezetett ország, ${vezetett} kellene.`);
  if (vezetett > 0) {
    const blokk = MENTETT_BLOKK[o] * vezetett;
    const rendezveny = REND_DB[o] * vezetett;
    if (m.orszagismeret.kitoltottBlokk !== blokk) hiba(`${kulcs}: ${m.orszagismeret.kitoltottBlokk} mentett blokk, ${blokk} kellene.`);
    if (m.orszagismeret.rendezvenyDb !== rendezveny) hiba(`${kulcs}: ${m.orszagismeret.rendezvenyDb} rendezvény, ${rendezveny} kellene.`);
  }
}

// ---------------------------------------------------------------------------------------------------------
// Belépési pont
// ---------------------------------------------------------------------------------------------------------

function kilep(uzenetek: readonly string[]): never {
  for (const u of uzenetek) console.error(u);
  process.exit(1);
}

async function main() {
  // 1. Védelem: csak a saját célfájl írható.
  const kert = process.env.DATABASE_URL;
  if (kert && resolve(kert) !== CEL) {
    kilep([
      `A DATABASE_URL (${kert}) másra mutat, mint a tesztadatbázis (${CEL}); a script csak ezt az egy fájlt írja.`,
      'Töröld a DATABASE_URL-t, vagy állítsd a tesztadatbázis útvonalára.',
    ]);
  }
  if (CEL === FORRAS) kilep(['A célfájl és a forrásfájl azonos, a script megáll.']);
  if (!existsSync(FORRAS) || !existsSync(resolve('drizzle'))) {
    kilep(['A data/tet.db vagy a drizzle mappa nem található: a scriptet a repó gyökeréből kell futtatni.']);
  }
  const adatHibak = adatokEllenorzese();
  if (adatHibak.length > 0) kilep([`A beégetett adatok hibásak (${adatHibak.length}):`, ...adatHibak.map((h) => `  - ${h}`)]);
  process.env.DATABASE_URL = CEL;

  // 2. Másolás: a forrás csak olvasható, a célfájl (és társai) előbb törlődik.
  for (const vegzodes of ['', '-wal', '-shm']) rmSync(CEL + vegzodes, { force: true });
  const forras = new Database(FORRAS, { readonly: true, fileMustExist: true });
  try {
    await forras.backup(CEL);
  } finally {
    forras.close();
  }
  console.log('A data/tet.db másolata elkészült.');

  // 3. Migrációk a másolaton (külön kapcsolattal, a ../db modul betöltése előtt).
  const migraciosKapcsolat = new Database(CEL);
  try {
    migrate(drizzle(migraciosKapcsolat), { migrationsFolder: resolve('drizzle') });
  } finally {
    migraciosKapcsolat.close();
  }

  // 4. A DB-modulok csak most töltődnek be, a DATABASE_URL már a célfájlra mutat.
  ({ db } = await import('../db'));
  if (db.$client.name !== CEL) kilep([`A betöltött adatbázis (${db.$client.name}) nem a tesztadatbázis, a script megáll.`]);
  ert = await import('../db/queries/ertekeles');
  tq = await import('../db/queries/tevekenyseg');
  const { setAttaseOrszagok } = await import('../db/queries/attase-orszag');
  if (db.select({ id: ertekelesiIdoszak.id }).from(ertekelesiIdoszak).all().length > 0) {
    kilep(['A másolat már tartalmaz értékelési időszakot; a script üres értékelési táblákból indul.']);
  }

  // 5. A session-sorok és a valós demó attasék törlése (FK cascade: jelentések, ticketek, hozzárendelések, fiókok).
  const valosNevek = new Set(db.select({ nev: user.name }).from(user).where(eq(user.role, 'attase')).all().map((r) => r.nev));
  const utkozes = ATTASEK.filter((a) => valosNevek.has(a.nev)).map((a) => a.nev);
  if (utkozes.length > 0) kilep([`A kitalált nevek egyike valós attaséé is: ${utkozes.join(', ')}.`]);
  db.delete(session).run();
  db.delete(user).where(eq(user.role, 'attase')).run();

  // 6. A 15 kitalált attasé.
  const jelszoHash = await hashPassword(JELSZO);
  const attasek: Attase[] = ATTASEK.map((a) => ({ ...a, id: azonosito(), cellak: MINTAK[a.mintazat].map(parseCella) }));
  attasek.forEach((a, i) => {
    const email = `teszt${String(i + 1).padStart(2, '0')}@ertekeles.test`;
    // A fiók az első értékelt félév előtt jött létre; az új posztra érkezetté a kezdet előtt.
    const letrehozva = a.kezdet !== undefined ? new Date(Date.UTC(2026, 0, 19, 9)) : new Date(Date.UTC(2024, 5, 3, 9));
    db.transaction((tx) => {
      tx.insert(user)
        .values({ id: a.id, name: a.nev, email, emailVerified: true, role: 'attase', createdAt: letrehozva, updatedAt: letrehozva })
        .run();
      tx.insert(account)
        .values({
          id: azonosito(), userId: a.id, accountId: a.id, providerId: 'credential', password: jelszoHash,
          createdAt: letrehozva, updatedAt: letrehozva,
        })
        .run();
    });
    const sorok: AttaseOrszag[] = [
      { kod: a.szekhely, szekhely: true, vezeto: a.vezet, varos: a.varos, reszterulet: null },
      ...a.regio.map((kod) => ({ kod, szekhely: false, vezeto: false, varos: null, reszterulet: null })),
    ];
    setAttaseOrszagok(a.id, sorok);
  });
  console.log(`${attasek.length} kitalált attasé létrehozva (teszt01@ertekeles.test … teszt15@ertekeles.test).`);

  // 7–8. Félévenként: forrásadatok, időszak, minősítések, kihagyás, lezárás; végül a nyitott félév.
  for (const terv of FELEVEK) {
    profilokLetrehoz(attasek, terv.f.ev);
    console.log(felevFeldolgoz(attasek, terv));
  }

  // 9. Önellenőrzés.
  const hibak = onellenorzes(attasek);
  if (hibak.length > 0) kilep([`Az önellenőrzés ${hibak.length} hibát talált:`, ...hibak.map((h) => `  - ${h}`)]);
  console.log('Az önellenőrzés hibátlan.');

  // A kész fájl önálló (nincs -wal/-shm társa), így csak olvasható módban is megnyitható (sqlite3 -readonly).
  db.$client.pragma('wal_checkpoint(TRUNCATE)');
  db.$client.pragma('journal_mode = DELETE');
  db.$client.close();
  console.log('Kész: data/tet-ertekeles-teszt.db');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
