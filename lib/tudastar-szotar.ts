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
    leiras: 'A KFI-politikát irányító TTM, az érintett ágazati minisztériumok, koordinációs és tanácsadó testületek.',
    bevezeto:
      'A magyar kutatás-, fejlesztés- és innovációpolitikát 2026 óta a Tudományos és Technológiai Minisztérium (TTM) irányítja: övé a kormányzati tudománypolitika és annak koordinációja, irányítja az NKFI Hivatalt, és szakmailag felügyeli a Nemzeti Innovációs Ügynökséget. A gazdaságfejlesztés, a felsőoktatás, a tudománydiplomácia és az ágazati innováció más minisztériumoknál van, a döntések előkészítésében pedig a KFI-törvény szerinti tanácsok és a tudományos köztestületek vesznek részt. Az attasé itt látja, melyik kérdéssel kihez forduljon, és hol található a TéT-attasé hálózatot koordináló minisztériumi egység.',
  },
  {
    slug: 'finanszirozas',
    szam: 2,
    cim: 'Kutatás-fejlesztési és innovációs finanszírozás',
    rovidCim: 'K+F+I finanszírozás',
    leiras: 'Az NKFI Hivatal és az NKFI Alap, a hazai és uniós források kezelői, a nemzeti kapcsolattartók.',
    bevezeto:
      'A hazai KFI-források legnagyobb kezelője a Nemzeti Kutatási, Fejlesztési és Innovációs Hivatal: az NKFI Alapból pályázatokat ír ki, és itt működnek a Horizont Európa nemzeti kapcsolattartói, valamint az EUREKA, a Eurostars és a COST hazai pontjai. Az attasé itt találja, milyen hazai pályázatokkal kapcsolódhat be egy külföldi partner, hol kaphat egy magyar szervezet társfinanszírozást a nemzetközi projektekhez, és kihez irányíthatja a pályázati kérdéseket. Az uniós kohéziós források felhívásai a Széchenyi Terv Plusz portálján jelennek meg.',
  },
  {
    slug: 'innovacios-szolgaltatasok',
    szam: 3,
    cim: 'Innovációs szolgáltatások és vállalkozásfejlesztés',
    rovidCim: 'Innovációs szolgáltatások',
    leiras: 'A Nemzeti Innovációs Ügynökség programjai, vállalkozásfejlesztési szervezetek, inkubátorok, klaszterek.',
    bevezeto:
      'Az innovatív vállalkozásokat és startupokat segítő szervezetek: a Nemzeti Innovációs Ügynökség (NIÜ) és programjai, az országos vállalkozásfejlesztési szervezetek, valamint a startup- és technológiai szervezetek. Az inkubátorokhoz, akcelerátorokhoz és klaszterekhez eligazító kártyák vezetnek: a Startup Factory-inkubátorok listája a 7., az akkreditált klasztereké a 8. kategóriában található. Az attasé itt találja meg, hová irányíthat egy külföldi startupot, akcelerátort vagy befektetőt, és milyen programokkal jut ki a magyar startup a fogadó ország piacára. A vállalati innovációs központokról és nyílt innovációs programokról bővebben a 8. kategória szól.',
  },
  {
    slug: 'kutatohalozat',
    szam: 4,
    cim: 'Kutatóhálózat és kutatóintézetek',
    rovidCim: 'Kutatóhálózat',
    leiras: 'A HUN-REN és intézetei, támogatott kutatócsoportok, nemzeti laboratóriumok, kutatási infrastruktúrák.',
    bevezeto:
      'A közfinanszírozott magyar kutatás intézményi gerince: a HUN-REN Magyar Kutatási Hálózat 15 kutatóintézménye, a főként egyetemeken működő támogatott kutatócsoportok, a 2026-ban támogatott Misszióvezérelt Nemzeti Laboratóriumok, a nagy kutatási infrastruktúrák (ELI ALPS, Budapest Neutron Centrum, HUN-REN Cloud, Komondor), valamint a hálózaton kívüli állami és nonprofit kutatóhelyek. Az attasé itt találja meg, melyik intézet melyik területen erős, és hová irányítsa a külföldi partnert közös kutatás, infrastruktúra-hozzáférés vagy laborlátogatás ügyében. A korábbi akadémiai bölcsészet- és társadalomtudományi kutatóközpontok 2025. augusztus 1. óta az ELTE-hez tartoznak.',
  },
  {
    slug: 'egyetemek',
    szam: 5,
    cim: 'Egyetemek és technológiatranszfer',
    rovidCim: 'Egyetemek és TT',
    leiras: 'Kutatásintenzív egyetemek, innovációs igazgatóságok, technológiatranszfer-cégek, science parkok, spin-offok.',
    bevezeto:
      'A kutatóegyetemek és a tudás hasznosításának szereplői. Hatályos, hivatalos „kutatóegyetem”-lista nincs, ezért az első lista a kutatásban és a hasznosításban legaktívabb egyetemeket ellenőrizhető mutatókkal (támogatott kutatócsoportok, nemzeti laboratóriumok) mutatja be. Az egyetemi technológiatranszfer 2023 óta átalakul: a Nemzeti Innovációs Ügynökség kísérleti programjából egyetemi tulajdonú technológiatranszfer-cégek (TTC-k) nőttek ki, ezek a külföldi partner első kapcsolatai licenc, közös fejlesztés vagy spin-off ügyében. A kevés adatú típusok – inkubátorok, kompetenciaközpontok, science parkok – egy összevont listán szerepelnek.',
  },
  {
    slug: 'szellemi-tulajdon',
    szam: 6,
    cim: 'Szellemi tulajdon, szabályozás és minősítés',
    rovidCim: 'Szellemi tulajdon',
    leiras: 'Az SZTNH, szabványosítás, akkreditáció, ágazati hatóságok, tesztkörnyezetek, kutatásbiztonság.',
    bevezeto:
      'A szellemi tulajdon védelmének, a szabályozásnak és a minősítésnek a szereplői: a Szellemi Tulajdon Nemzeti Hivatala, a Magyar Szabványügyi Testület, a Nemzeti Akkreditáló Hatóság és a megfelelőségértékelő szervezetek, az innovatív termékeket engedélyező ágazati hatóságok, a szabályozói tesztkörnyezetek, valamint a kutatás- és technológiabiztonságban illetékes szervek. Az attasé itt találja, hová irányítsa a külföldi partnert oltalomszerzés, szabványosítás, tanúsítás, piacra lépési engedély vagy exportellenőrzési kérdés ügyében.',
  },
  {
    slug: 'befektetok',
    szam: 7,
    cim: 'Finanszírozók és befektetők',
    rovidCim: 'Finanszírozók, befektetők',
    leiras: 'Állami és magán kockázati tőke, üzleti angyalok, fejlesztési bankok, deep tech és egyetemi alapok.',
    bevezeto:
      'Az innováció tőkeoldalának szereplői címtárszerűen: az állami és állami hátterű finanszírozók, a kockázatitőke-alapkezelők, az üzleti angyal hálózatok, a fejlesztési bankok és garanciaintézmények, az inkubációs és vállalati befektetők, a deep tech finanszírozók, valamint az egyetemi és proof-of-concept alapok. Az attasé itt találja meg, kihez irányíthatja a társbefektetőt kereső külföldi partnert, vagy honnan ered egy magyar startup finanszírozása. A lista nem befektetési tanács és nem értékelés; önálló vállalati kockázatitőke-programot (CVC) hivatalos forrásból nem azonosítottunk, az összegek a források közlései.',
  },
  {
    slug: 'vallalatok',
    szam: 8,
    cim: 'Kiemelt vállalati, piaci szereplők',
    rovidCim: 'Vállalati szereplők',
    leiras: 'Innovatív nagyvállalatok és KFI-központok, díjazott kkv-k és startupok, szövetségek, kamarák, klaszterek.',
    bevezeto:
      'A magyar gazdaság innovatív szereplői címtárszerűen. Az első kártya a nemzetközi K+F-rangsorokban szereplő magyar vállalatokat és a jelentős hazai KFI-központtal rendelkező nagyvállalatokat gyűjti össze – a két típus a kevés rangsoradat miatt közös kártyán szerepel –, a második a Magyar Innovációs Nagydíj 2025-ös díjazottjait és a nyílt innovációs programokat. Ezt követik az ágazati szövetségek, a kamarák (köztük a kétoldalú üzleti kamarák) és az akkreditált klaszterek. A leírások a vállalatok és szervezetek saját közlései; a lista nem értékelés.',
  },
  {
    slug: 'nemzetkozi-programok',
    szam: 9,
    cim: 'Nemzetközi programok magyar kapcsolódási pontjai',
    rovidCim: 'Nemzetközi programok',
    leiras: 'Horizont Európa, EIC, EIT, EUREKA, Eurostars, COST, EEN, EURAXESS: ki a magyar felelős és kapcsolattartó.',
    bevezeto:
      'A nemzetközi KFI-programok magyar oldala: ki a hazai felelős, hol a nemzeti kapcsolattartó, és mire számíthat egy külföldi partner. A legtöbb program magyar kapcsolódási pontja az NKFI Hivatal – a Horizont Európa nemzeti kapcsolattartói, az EUREKA, a Eurostars, a COST, a nemzetközi kutatási infrastruktúrák és az európai partnerségek –; a kormányközi TéT-egyezményekért a Tudományos és Technológiai Minisztérium felel, az EIT székhelye pedig Budapest. Fontos 2026-os változás: október 14. óta a közérdekű vagyonkezelő alapítványok által fenntartott egyetemek ismét kedvezményezettként és konzorciumvezetőként is részt vehetnek a Horizont Európában és az Erasmus+-ban.',
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
// Típusszintű őr: a dinamikus listák minden mezője szöveg (a validátor és a sorszerkesztő stringként kezeli,
// a `SOR_MEZOK` kimerítőségére épülő cast így teljes és helyes típusú sort ad). Nem szöveges mezőnél a
// `MindSzoveg` `boolean` lesz, és az `Igaz<…>` fordítási hibát ad.
type MindSzoveg = { [L in SorLista]: SorTipusok[L][keyof SorTipusok[L]] extends string ? true : false }[SorLista];
type Igaz<T extends true> = T;
export type SorMezokSzovegesek = Igaz<MindSzoveg>;

export const SOR_MAX: Record<SorLista, number> = { szakaszok: 12, programok: 30, linkek: 20, sorok: 150 };
/** A lista egy sorának neve (a szerkesztő sorcímkéje, a „+ Új …” gomb és a darabszám-hiba szövege). */
export const SOR_EGYSEG: Record<SorLista, string> = { szakaszok: 'szakasz', programok: 'program', linkek: 'link', sorok: 'sor' };

/** A formázható szöveges mezők súgója a szerkesztőben: a megjelenítés két szabálya (lib/tudastar-szoveg.ts). */
export const SZOVEG_SUGO = 'Üres sor: új bekezdés · „- ” kezdetű sor: felsorolás.';

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
    leiras: { cimke: 'Egysoros leírás', max: PROGRAM_LEIRAS_MAX },
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
