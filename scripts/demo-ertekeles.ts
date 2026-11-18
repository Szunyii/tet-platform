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
  account, attaseErtekeles, attaseOrszag, ertekelesiIdoszak, orszagprofil, riport, session, szempontMinosites,
  ticket, ticketUzenet, user,
} from '../db/schema';
import type { AttaseOrszag } from '../lib/attase-orszag';
import { naptariNap } from '../lib/datum';
import { felevCimke, felevKulcs, felevNapok, type Felev } from '../lib/ertekeles-idoszak';
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

type Ertekeles = typeof import('../db/queries/ertekeles');

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
const valaszt = <T>(l: readonly T[]): T => l[Math.floor(rnd() * l.length)];

function kever<T>(l: readonly T[]): T[] {
  const ki = [...l];
  for (let i = ki.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
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
function azonosito(): string {
  const h = Array.from({ length: 16 }, () => egesz(0, 255).toString(16).padStart(2, '0')).join('');
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
function idopont(nap: string): Date {
  return new Date(napDate(nap).getTime() + egesz(7, 14) * 3600_000 + egesz(0, 59) * 60_000 + egesz(0, 59) * 1000);
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
// Egy félév feldolgozása
// ---------------------------------------------------------------------------------------------------------

function felevFeldolgoz(attasek: readonly Attase[], terv: FelevTerv): string {
  const ido = idoOf(terv);
  const forras = forrasadatokLetrehoz(attasek, ido);
  const idoszakId = ert.letrehozIdoszak(terv.f);

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
  const adat = `${forras.jelentes} jelentés, ${forras.ticket} ticket`;
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
    else mutatokEllenorzese(a, cella, r.mutatok, kulcs, hiba);
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
  return hibak;
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

  db.$client.pragma('wal_checkpoint(TRUNCATE)');
  db.$client.close();
  console.log('Kész: data/tet-ertekeles-teszt.db');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
