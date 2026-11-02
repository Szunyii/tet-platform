/**
 * TéT Tudástár: a 9 rögzített kategória, a kártyatípusok, a kártya-tartalom alakja, a korlátok és a
 * normalizáló. Framework-mentes (nincs React, nincs DB). A kategóriák a kódban vannak (a 9-es szerkezet
 * rögzített), a kártyák a `tudastar_kartya` táblában (db/schema/tudastar.ts).
 */

export interface TudastarKategoria {
  slug: string;
  szam: number;
  cim: string;
  /** A jobb oldali menübe és a keskeny ablak kategória-választójába. */
  rovidCim: string;
  /** Egy sor a nyitólap csempéjére. */
  leiras: string;
  /** 2–4 mondatos eligazító összefoglaló a kategória-oldal tetején. */
  bevezeto: string;
}

export const TUDASTAR_KATEGORIAK = [
  {
    slug: 'szakpolitika',
    szam: 1,
    cim: 'Szakpolitikai irányítás és koordináció',
    rovidCim: 'Szakpolitikai irányítás',
    leiras: 'A KFI-politikát alakító minisztériumok, koordinációs és tanácsadó testületek.',
    bevezeto:
      'A magyar kutatás-, fejlesztés- és innovációpolitika irányítói: a Tudományos és Technológiai Minisztérium, az innovációhoz kapcsolódó ágazati minisztériumok, valamint a koordinációs, stratégiai és tanácsadó testületek. A minisztérium kártyáján a KFI-stratégia, a prioritások és a kiemelt ágazatok összefoglalója olvasható.',
  },
  {
    slug: 'finanszirozas',
    szam: 2,
    cim: 'Kutatás-fejlesztési és innovációs finanszírozás',
    rovidCim: 'K+F+I finanszírozás',
    leiras: 'Az NKFI Hivatal, a hazai és uniós források kezelői, a nemzeti kapcsolattartók.',
    bevezeto:
      'Kik döntenek a hazai KFI-forrásokról, és kihez fordulhat a külföldi partner pályázati együttműködésért. Itt található a Nemzeti Kutatási, Fejlesztési és Innovációs Hivatal, a hazai és európai uniós támogatások kezelői, a Horizont Európa nemzeti kapcsolattartói, valamint az EUREKA, a Eurostars, a COST és más programok hazai felelősei.',
  },
  {
    slug: 'innovacios-szolgaltatasok',
    szam: 3,
    cim: 'Innovációs szolgáltatások és vállalkozásfejlesztés',
    rovidCim: 'Innovációs szolgáltatások',
    leiras: 'A Nemzeti Innovációs Ügynökség, inkubátorok, akcelerátorok, klaszterek.',
    bevezeto:
      'Az innovatív vállalkozásokat és startupokat segítő szervezetek: a Nemzeti Innovációs Ügynökség és programjai, az országos vállalkozásfejlesztési szervezetek, az inkubátorok, akcelerátorok és klaszterek, valamint a vállalati innovációs központok és a nyílt innovációs programok működtetői.',
  },
  {
    slug: 'kutatohalozat',
    szam: 4,
    cim: 'Kutatóhálózat és kutatóintézetek',
    rovidCim: 'Kutatóhálózat',
    leiras: 'A HUN-REN hálózat, nemzeti laboratóriumok, kutatási infrastruktúrák.',
    bevezeto:
      'A magyar kutatóhálózat: a HUN-REN Magyar Kutatási Hálózat és kutatóközpontjai, a támogatott kutatócsoportok, a nemzeti laboratóriumok, a kutatási infrastruktúrák és az önálló állami vagy nonprofit kutatóhelyek.',
  },
  {
    slug: 'egyetemek',
    szam: 5,
    cim: 'Egyetemek és technológiatranszfer',
    rovidCim: 'Egyetemek és TT',
    leiras: 'Kutatóegyetemek, technológiatranszfer-irodák, science parkok, spin-offok.',
    bevezeto:
      'A kutatóegyetemek és a tudás hasznosításának szereplői: innovációs igazgatóságok, technológiatranszfer-irodák és -cégek, egyetemi inkubátorok, kompetenciaközpontok, science parkok, egyetemi kutatási infrastruktúrák és spin-off portfóliók.',
  },
  {
    slug: 'szellemi-tulajdon',
    szam: 6,
    cim: 'Szellemi tulajdon, szabályozás és minősítés',
    rovidCim: 'Szellemi tulajdon',
    leiras: 'Az SZTNH, szabványosítás, akkreditáció, ágazati hatóságok.',
    bevezeto:
      'A szellemi tulajdon védelmének, a szabályozásnak és a minősítésnek a szereplői: a Szellemi Tulajdon Nemzeti Hivatala, a szabványosítási, akkreditációs és megfelelőségértékelési szervezetek, az ágazati hatóságok, a szabályozói tesztkörnyezetek, valamint a kutatásbiztonsági és technológiabiztonsági kapcsolattartók.',
  },
  {
    slug: 'befektetok',
    szam: 7,
    cim: 'Finanszírozók és befektetők',
    rovidCim: 'Finanszírozók, befektetők',
    leiras: 'Állami és magán kockázati tőke, üzleti angyalok, banki finanszírozás.',
    bevezeto:
      'Az innováció tőkeoldala: az állami és állami hátterű finanszírozók, a kockázatitőke-alapok, az üzleti angyal hálózatok, a banki innovációfinanszírozás, a corporate venture capital szereplők, az inkubációs és akcelerációs befektetők, a deep tech finanszírozók, valamint az egyetemi és proof-of-concept alapok.',
  },
  {
    slug: 'vallalatok',
    szam: 8,
    cim: 'Kiemelt vállalati, piaci szereplők',
    rovidCim: 'Vállalati szereplők',
    leiras: 'Innovatív nagyvállalatok, KFI-központok, kkv-k, startupok, kamarák.',
    bevezeto:
      'A magyar gazdaság innovatív szereplői: a legnagyobb innovatív vállalatok és a jelentős KFI-központtal rendelkező cégek, a nyílt innovációs programokat működtető vállalatok, a kiemelt innovatív kkv-k, startupok és scale-upok, valamint az ágazati szövetségek, kamarák és klaszterek.',
  },
  {
    slug: 'nemzetkozi-programok',
    szam: 9,
    cim: 'Nemzetközi programok magyar kapcsolódási pontjai',
    rovidCim: 'Nemzetközi programok',
    leiras: 'Horizont Európa, EIC, EIT, EUREKA, COST, EEN, EURAXESS és társaik.',
    bevezeto:
      'A nemzetközi KFI-programok magyar kapcsolódási pontjai: Horizont Európa, EIC, EIT és a KIC-ek, EUREKA, Eurostars, COST, Enterprise Europe Network, EURAXESS, a kétoldalú TéT-programok, a nemzetközi kutatási infrastruktúrák, az EU-partnerségek és a Widening-programok.',
  },
] as const satisfies readonly TudastarKategoria[];

/** Egy kategória a szótárból (a `slug` itt a szűk `KategoriaSlug`). */
export type Kategoria = (typeof TUDASTAR_KATEGORIAK)[number];
export type KategoriaSlug = Kategoria['slug'];

const KATEGORIA_SLUGOK: readonly string[] = TUDASTAR_KATEGORIAK.map((k) => k.slug);

export function isKategoriaSlug(v: string): v is KategoriaSlug {
  return KATEGORIA_SLUGOK.includes(v);
}

export function kategoriaBySlug(slug: string): Kategoria | undefined {
  return TUDASTAR_KATEGORIAK.find((k) => k.slug === slug);
}

/** A kategória helye a 9-es sorrendben (rendezéshez); ismeretlenre a lista vége. */
export function kategoriaIndex(slug: string): number {
  const i = KATEGORIA_SLUGOK.indexOf(slug);
  return i === -1 ? KATEGORIA_SLUGOK.length : i;
}

/**
 * Statikus útvonal-szegmensek a `/tudastar/[kategoria]/` alatt: ilyen slugú kártya elérhetetlen lenne, mert
 * a statikus szegmens (`uj`) elsőbbséget élvez a dinamikus `[slug]`-gal szemben.
 */
export const FOGLALT_SLUGOK: readonly string[] = ['uj'];

export const KARTYA_TIPUSOK = ['intezmeny', 'lista'] as const;
export type KartyaTipus = (typeof KARTYA_TIPUSOK)[number];

export function isKartyaTipus(v: unknown): v is KartyaTipus {
  return typeof v === 'string' && (KARTYA_TIPUSOK as readonly string[]).includes(v);
}

export const TIPUS_CIMKE: Record<KartyaTipus, string> = { intezmeny: 'Intézmény', lista: 'Lista' };

export interface Kapcsolat {
  email: string;
  telefon: string;
  cim: string;
}
export interface Szakasz {
  cim: string;
  szoveg: string;
}
export interface Program {
  nev: string;
  leiras: string;
  url: string;
}
export interface HasznosLink {
  felirat: string;
  url: string;
}
export interface ListaSor {
  nev: string;
  megjegyzes: string;
  url: string;
}

export interface IntezmenyTartalom {
  profil: string;
  tevekenyseg: string;
  kapcsolat: Kapcsolat;
  /** Szabad, címzett szakaszok (pl. a minisztériumnál: KFI-stratégia, prioritások, kiemelt ágazatok). */
  szakaszok: Szakasz[];
  programok: Program[];
  linkek: HasznosLink[];
}
export interface ListaTartalom {
  sorok: ListaSor[];
  linkek: HasznosLink[];
}
export interface KartyaTartalmak {
  intezmeny: IntezmenyTartalom;
  lista: ListaTartalom;
}
export type KartyaTartalom = KartyaTartalmak[KartyaTipus];

/** A kártya közös mezői (a kártyán ezek látszanak). */
export interface KartyaAlap {
  kategoria: KategoriaSlug;
  nev: string;
  rovidites: string | null;
  osszefoglalo: string;
  honlap: string | null;
}
/** A típus és a tartalom együtt: a `tipus` szűkíti a `tartalom`-ot. */
export type KartyaTorzs =
  | { tipus: 'intezmeny'; tartalom: IntezmenyTartalom }
  | { tipus: 'lista'; tartalom: ListaTartalom };

/** A validált űrlap (mentéskor) – a DB-sor azonosítók és időbélyeg nélkül. */
export type KartyaAdat = KartyaAlap & KartyaTorzs;

/** Egy kártya, ahogy a lekérdezés adja. */
export type Kartya = KartyaAdat & {
  id: string;
  slug: string;
  sorrend: number;
  updatedAt: Date;
};

/** Adott típusú kártya (a komponensek propjaihoz). */
export type KartyaTipusu<T extends KartyaTipus> = Extract<Kartya, { tipus: T }>;

// Korlátok: a validátor, a szerkesztő maxLength-jei és a tartalomfuttató is ezeket használja.
export const NEV_MAX = 200;
export const ROVIDITES_MAX = 40;
export const OSSZEFOGLALO_MAX = 600;
export const URL_MAX = 500;
export const SZOVEG_MAX = 5000;
export const SZAKASZ_CIM_MAX = 120;
export const PROGRAM_LEIRAS_MAX = 300;
export const FELIRAT_MAX = 120;
export const MEGJEGYZES_MAX = 200;
export const EMAIL_MAX = 200;
export const TELEFON_MAX = 60;
export const CIM_MAX = 200;

/** A dinamikus listák sortípusai (a `<lista>.<i>.<mezo>` mezőnevek első tagja). */
export interface SorTipusok {
  szakaszok: Szakasz;
  programok: Program;
  linkek: HasznosLink;
  sorok: ListaSor;
}
export type SorLista = keyof SorTipusok;

export const SOR_MAX: Record<SorLista, number> = { szakaszok: 12, programok: 30, linkek: 20, sorok: 150 };
/** A lista egy sorának neve (a szerkesztő sorcímkéje, a „+ Új …” gomb és a darabszám-hiba szövege). */
export const SOR_EGYSEG: Record<SorLista, string> = { szakaszok: 'szakasz', programok: 'program', linkek: 'link', sorok: 'sor' };

/** Egy sor-mező szabálya: a szerkesztő és a validátor közös forrása. */
export interface SorMezoSzabaly {
  cimke: string;
  max: number;
  kotelezo?: true;
  /** Webcím: a validátor normalizálja (lib/tudastar-validacio.ts `normalizalUrl`). */
  url?: true;
  /** Többsoros szöveg; `formazott`: a szerkesztő a bekezdés/felsorolás súgóját is mutatja. */
  tobbsoros?: true;
  formazott?: true;
}

/**
 * A dinamikus listák mezői, listánként a szerkesztőbeli sorrendben. Mezőnév szerint kimerítő: új almező
 * fordítási hiba, amíg itt nincs szabálya (különben a normalizáló beolvasná, de a mentés csendben eldobná).
 */
export const SOR_MEZOK: { [L in SorLista]: { [K in keyof SorTipusok[L]]-?: SorMezoSzabaly } } = {
  szakaszok: {
    cim: { cimke: 'Cím', max: SZAKASZ_CIM_MAX, kotelezo: true },
    szoveg: { cimke: 'Szöveg', max: SZOVEG_MAX, kotelezo: true, tobbsoros: true, formazott: true },
  },
  programok: {
    nev: { cimke: 'Név', max: NEV_MAX, kotelezo: true },
    url: { cimke: 'Webcím', max: URL_MAX, url: true },
    leiras: { cimke: 'Egysoros leírás', max: PROGRAM_LEIRAS_MAX, tobbsoros: true },
  },
  linkek: {
    felirat: { cimke: 'Felirat', max: FELIRAT_MAX, kotelezo: true },
    url: { cimke: 'Webcím', max: URL_MAX, kotelezo: true, url: true },
  },
  sorok: {
    nev: { cimke: 'Név', max: NEV_MAX, kotelezo: true },
    url: { cimke: 'Webcím', max: URL_MAX, url: true },
    megjegyzes: { cimke: 'Megjegyzés', max: MEGJEGYZES_MAX },
  },
};

/** A kártya egyszerű mezőinek feliratai (szerkesztő, validátor); a név és az összefoglaló típusonként más. */
export const KARTYA_CIMKEK = {
  kategoria: 'Kategória',
  rovidites: 'Rövidítés',
  honlap: 'Honlap',
  profil: 'Profil',
  tevekenyseg: 'Tevékenység',
  email: 'E-mail',
  telefon: 'Telefon',
  cim: 'Cím',
} as const;
export const NEV_CIMKE: Record<KartyaTipus, string> = { intezmeny: 'Név', lista: 'Lista címe' };
export const OSSZEFOGLALO_CIMKE: Record<KartyaTipus, string> = { intezmeny: 'Összefoglaló', lista: 'Bevezető' };

function szoveg(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function objektum(v: unknown): Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

/**
 * Objektumok listája; a nem objektum elemet eldobja, a többit a `sor` egészíti ki. A kiegészítés után
 * teljesen üres sort is eldobja, mint a validátor (különben üres szakasz, link vagy listasor jelenne meg).
 */
function objLista<T extends object>(v: unknown, sor: (r: Record<string, unknown>) => T): T[] {
  return Array.isArray(v)
    ? v
        .filter((x) => typeof x === 'object' && x !== null && !Array.isArray(x))
        .map((x) => sor(x as Record<string, unknown>))
        .filter((s) => Object.values(s).some((m) => m !== ''))
    : [];
}

const linkSor = (r: Record<string, unknown>): HasznosLink => ({ felirat: szoveg(r.felirat), url: szoveg(r.url) });

/**
 * A DB-ből olvasott JSON kiegészítése: hiányzó vagy rossz típusú almező → üres alapérték, nem objektum
 * listaelem → kimarad. Új almezőhöz így nem kell migráció; almező átnevezése viszont adatmigrációt igényel
 * (a régi kulcson tárolt értéket a normalizáló nem látja, a következő mentés pedig eldobja). Kimerítő a
 * `KartyaTipus` unión, cast nélkül.
 */
const NORMALIZALOK: { [T in KartyaTipus]: (r: Record<string, unknown>) => KartyaTartalmak[T] } = {
  intezmeny: (r) => {
    const k = objektum(r.kapcsolat);
    return {
      profil: szoveg(r.profil),
      tevekenyseg: szoveg(r.tevekenyseg),
      kapcsolat: { email: szoveg(k.email), telefon: szoveg(k.telefon), cim: szoveg(k.cim) },
      szakaszok: objLista(r.szakaszok, (s) => ({ cim: szoveg(s.cim), szoveg: szoveg(s.szoveg) })),
      programok: objLista(r.programok, (p) => ({ nev: szoveg(p.nev), leiras: szoveg(p.leiras), url: szoveg(p.url) })),
      linkek: objLista(r.linkek, linkSor),
    };
  },
  lista: (r) => ({
    sorok: objLista(r.sorok, (s) => ({ nev: szoveg(s.nev), megjegyzes: szoveg(s.megjegyzes), url: szoveg(s.url) })),
    linkek: objLista(r.linkek, linkSor),
  }),
};

export function normalizalTartalom<T extends KartyaTipus>(tipus: T, nyers: unknown): KartyaTartalmak[T] {
  return NORMALIZALOK[tipus](objektum(nyers));
}

/** Üres tartalom típusonként (a normalizáló üres bemenetre adott értéke); az új kártya űrlapja ebből indul. */
export function uresTartalom<T extends KartyaTipus>(tipus: T): KartyaTartalmak[T] {
  return NORMALIZALOK[tipus]({});
}
