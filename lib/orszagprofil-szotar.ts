/**
 * Az országprofil szótárai és blokk-típusai. Framework-mentes: a validátor, a form, az
 * olvasó nézet és a térkép ugyanebből dolgozik. A címkék a NIÜ megrendelői szövegei.
 * A listás (csillagos) mezők mellett mindig van „egyéb" szabadszöveg.
 */

export const TAGSAGOK = [
  'EU', 'EFTA', 'OECD', 'NATO', 'G7', 'G20', 'BRICS', 'ASEAN', 'Mercosur',
  'Afrikai Unió', 'Arab Liga', 'Öböl-menti Együttműködési Tanács', 'Nemzetközösség',
] as const;
export type Tagsag = (typeof TAGSAGOK)[number];

export const KFI_PRIORITASOK = [
  'Digitalizáció és MI', 'Zöld átállás és klímasemlegesség', 'Egészség és élettudomány',
  'Ipar 4.0 és gyártás', 'Energiabiztonság', 'Űr', 'Védelem és biztonság', 'Alapkutatási kiválóság',
  'Tehetség és mobilitás', 'Startup és vállalkozói ökoszisztéma', 'Technológiai szuverenitás',
  'Regionális felzárkózás',
] as const;
export type KfiPrioritas = (typeof KFI_PRIORITASOK)[number];

/**
 * Ágazatok: az Alapadatok „Legfontosabb gazdasági ágazatok", a KFI-blokk „Kiemelt iparágak" és a
 * vállalati blokk „Kiemelt ágazatok" mezőjének közös listája. Az első kiemelt iparág adja a térkép színét.
 * Elemet átnevezni csak a `REGI_NEVEK` bővítésével szabad (régi név → új név): a listából kikerült
 * név tárolt értéke olvasáskor kiesik, és a blokk következő mentésekor végleg elvész. Ezt a típus
 * nem tudja jelezni.
 */
export const AGAZATOK = [
  'Mesterséges intelligencia és adatgazdaság', 'IKT és digitalizáció', 'Elektronika és félvezetők',
  'Kvantumtechnológia', 'Biotechnológia és gyógyszeripar', 'Digitális egészségügy',
  'Energetika és fenntarthatóság', 'Hidrogén és akkumulátor', 'Űripar', 'Mobilitás és autóipar',
  'Gépipar', 'Vegyipar', 'Anyagtudomány', 'Agrár- és élelmiszeripar', 'Bányászat és nyersanyagok',
  'Védelmi ipar', 'Kreatív ipar és média', 'Pénzügyi szolgáltatások', 'Turizmus', 'Logisztika', 'Építőipar',
] as const;
export type Agazat = (typeof AGAZATOK)[number];

export const AGAZAT_SZINEK: Record<Agazat, string> = {
  'Mesterséges intelligencia és adatgazdaság': '#1f4e9c',
  'IKT és digitalizáció': '#2563eb',
  'Elektronika és félvezetők': '#b45309',
  'Kvantumtechnológia': '#6b46c1',
  'Biotechnológia és gyógyszeripar': '#0f7a68',
  'Digitális egészségügy': '#a8326f',
  'Energetika és fenntarthatóság': '#2f7d32',
  'Hidrogén és akkumulátor': '#0e7490',
  'Űripar': '#334155',
  'Mobilitás és autóipar': '#9a3412',
  'Gépipar': '#4338ca',
  'Vegyipar': '#a21caf',
  'Anyagtudomány': '#525c6b',
  'Agrár- és élelmiszeripar': '#8a6d1f',
  'Bányászat és nyersanyagok': '#6b3f1d',
  'Védelmi ipar': '#7f1d1d',
  'Kreatív ipar és média': '#be185d',
  'Pénzügyi szolgáltatások': '#4d7c0f',
  'Turizmus': '#d11541',
  'Logisztika': '#0369a1',
  'Építőipar': '#736a5f',
};

/**
 * A 2026-10-12 előtti két lista (gazdasági ágazatok, iparágak) nevei → a közös lista neve. A két
 * régi listának nem volt közös neve, ezért a tábla mezőtől független. Tartósan marad: a régi
 * nevet tároló DB (hosting, visszaállított mentés) így migráció nélkül is helyesen olvasódik.
 * Ezek a nevek foglaltak: az `AGAZATOK`-ba nem kerülhetnek vissza, mert a megfeleltetés a szűrés
 * előtt fut, és a visszavett nevet mentéskor némán átírná. Ezt a `satisfies` őrzi: ha egy kulcs
 * egyben `Agazat` is, az fordítási hiba.
 */
const REGI_NEVEK = {
  'Autóipar': 'Mobilitás és autóipar',
  'Gyógyszeripar': 'Biotechnológia és gyógyszeripar',
  'Energetika': 'Energetika és fenntarthatóság',
  'Mezőgazdaság és élelmiszeripar': 'Agrár- és élelmiszeripar',
  'IKT és szoftver': 'IKT és digitalizáció',
  'Kreatív ipar': 'Kreatív ipar és média',
  'Félvezetők és mikroelektronika': 'Elektronika és félvezetők',
  'Agrár- és élelmiszertechnológia': 'Agrár- és élelmiszeripar',
  'Védelmi technológia': 'Védelmi ipar',
} as const satisfies Record<string, Agazat> & Partial<Record<Agazat, never>>;
/** A `REGI_NEVEK` tábla `Map`-ként: a keresés csak a saját kulcsokra talál (a `constructor` vagy a `__proto__` nem képződik le). */
export const REGI_AGAZAT_NEVEK: ReadonlyMap<string, Agazat> = new Map(Object.entries(REGI_NEVEK));

export const ALLAPOTOK = ['friss', 'elavult', 'nincs'] as const;
export type Allapot = (typeof ALLAPOTOK)[number];
export const ALLAPOT_CIMKE: Record<Allapot, string> = {
  friss: 'Adott évi profil',
  elavult: 'Elavult profil',
  nincs: 'Nincs profil',
};
export const ALLAPOT_SZINEK: Record<Allapot, string> = { friss: '#2f7d32', elavult: '#b45309', nincs: '#6b7280' };
/**
 * Egy profil-év állapota a viszonyítási évhez képest: nincs profil-év → nincs, egyenlő a
 * viszonyítási évvel → friss, annál régebbi → elavult. A térkép és a profil oldal a nézett
 * (választott) évet adja át viszonyítási évként; ha az a soron aktuális év, ez a korábbi
 * (a legfrissebb profil-évet az aktuális évhez viszonyító) viselkedéssel egyezik meg.
 */
export function profilAllapot(ev: number | null, viszonyitasiEv: number): Allapot {
  return ev === null ? 'nincs' : ev === viszonyitasiEv ? 'friss' : 'elavult';
}

export const RENDEZVENY_TIPUSOK = [
  { kulcs: 'szakkiallitas', cimke: 'Szakkiállítás' },
  { kulcs: 'konferencia', cimke: 'Konferencia' },
  { kulcs: 'forum', cimke: 'Egyéb fórum' },
] as const;
export type RendezvenyTipus = (typeof RENDEZVENY_TIPUSOK)[number]['kulcs'];
export function rendezvenyTipusCimke(k: RendezvenyTipus): string {
  return RENDEZVENY_TIPUSOK.find((t) => t.kulcs === k)?.cimke ?? k;
}
/** Ismeretlen vagy hiányzó érték esetén `'forum'`; a normalizáló és a validátor is ezt használja. */
export function rendezvenyTipus(v: unknown): RendezvenyTipus {
  return (RENDEZVENY_TIPUSOK as readonly { kulcs: string; cimke: string }[]).some((t) => t.kulcs === v)
    ? (v as RendezvenyTipus)
    : 'forum';
}

export const SZOVEG_MAX = 4000;
export const ROVID_MAX = 200;
/** A számmezők nyers szövegének hossza; a legszigorúbb szabály (lakosság ezreselválasztókkal) is belefér. */
export const SZAM_MAX_HOSSZ = 20;
export const OSSZEGZES_MAX = 500;
export const TOP_VALLALAT_MAX = 10;
export const RENDEZVENY_MAX = 10;
export const EV_MIN = 2020;

export const BLOKKOK = [
  { kulcs: 'alapadatok', cim: 'Alapadatok és gazdasági háttér' },
  { kulcs: 'kfiRendszer', cim: '1. KFI-rendszer és szakpolitika' },
  { kulcs: 'intezmenyek', cim: '2. KFI intézmény- és kutatási ökoszisztéma' },
  { kulcs: 'vallalati', cim: '3. Innovációs és vállalati ökoszisztéma' },
  { kulcs: 'programok', cim: '4. KFI programok és finanszírozási lehetőségek' },
  { kulcs: 'rendezvenyek', cim: '5. Jelentősebb KFI rendezvények' },
  { kulcs: 'nemzetkoziKapcsolatok', cim: '6.1. Két- és többoldalú kapcsolatok' },
  { kulcs: 'magyarKapcsolatok', cim: '6.2. Magyar–fogadó országbeli kapcsolatok' },
  { kulcs: 'magyarErtekeles', cim: '7. Magyar szempontú értékelés, lehetőségek és javaslatok' },
] as const;
export type BlokkKulcs = (typeof BLOKKOK)[number]['kulcs'];
export const BLOKK_KULCSOK = BLOKKOK.map((b) => b.kulcs) as readonly BlokkKulcs[];
export function blokkCim(k: BlokkKulcs): string {
  return BLOKKOK.find((b) => b.kulcs === k)?.cim ?? k;
}
export function isBlokkKulcs(v: string): v is BlokkKulcs {
  return (BLOKK_KULCSOK as readonly string[]).includes(v);
}

export interface Alapadatok {
  // Az ország poszt-adatai (főváros, terület, pénznem).
  fovaros: string;
  /** km², pozitív egész. */
  terulet: number | null;
  penznem: string;
  lakossag: number | null;
  gdp: number | null;
  gdpEgyFore: number | null;
  gdpNovekedes: number | null;
  adatEv: number | null;
  forras: string;
  tagsagok: Tagsag[];
  tagsagEgyeb: string;
  agazatok: Agazat[];
  agazatEgyeb: string;
}
export interface KfiRendszer {
  teljesitmeny: string;
  gerd: number | null;
  strategia: string;
  prioritasok: KfiPrioritas[];
  prioritasEgyeb: string;
  kiemeltIparagak: Agazat[];
  iparagEgyeb: string;
  erossegek: string;
  kihivasok: string;
}
export interface Intezmenyek {
  iranyitoSzervek: string;
  egyetemek: string;
  kutatokozpontok: string;
  infrastrukturak: string;
}
export interface Vallalati {
  kiemeltAgazatok: Agazat[];
  agazatEgyeb: string;
  topVallalatok: string[];
  startupok: string;
  klaszterek: string;
  /** 2026-10-13 óta önálló mező; a korábban mentett profilokban az inkubátorok a `klaszterek` szövegében állnak. */
  inkubatorok: string;
  technologiatranszfer: string;
}
/** A megjelenítés sorrendje eltér ettől (lásd a `MEZO_CIMKEK.programok` kommentjét); a kulcssorrend a tárolt JSON-é. */
export interface Programok {
  palyazatok: string;
  tamogatasiProgramok: string;
  finanszirozasiEszkozok: string;
  nemzetkoziReszvetel: string;
}
export interface Rendezveny {
  nev: string;
  tipus: RendezvenyTipus;
  idopont: string;
  megjegyzes: string;
}
export interface Rendezvenyek {
  lista: Rendezveny[];
}
export interface NemzetkoziKapcsolatok {
  partnerorszagok: string;
  euMultilateralis: string;
}
export interface MagyarKapcsolatok {
  egyezmeny: string;
  ketoldalu: string;
  mobilitas: string;
}
export interface MagyarErtekeles {
  osszegzes: string;
  egyuttmukodesiLehetosegek: string;
  joGyakorlatok: string;
  diplomaciaiPrioritasok: string;
}
export interface ProfilBlokkok {
  alapadatok: Alapadatok;
  kfiRendszer: KfiRendszer;
  intezmenyek: Intezmenyek;
  vallalati: Vallalati;
  programok: Programok;
  rendezvenyek: Rendezvenyek;
  nemzetkoziKapcsolatok: NemzetkoziKapcsolatok;
  magyarKapcsolatok: MagyarKapcsolatok;
  magyarErtekeles: MagyarErtekeles;
}

function szoveg(v: unknown): string {
  return typeof v === 'string' ? v : '';
}
function szam(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}
/** Ismeretlen elemek kiszűrve, duplikátumok nélkül; `v` bármi lehet (JSON-ból vagy `fd.getAll()`-ból jövő tömb is). */
export function szurtLista<T extends string>(v: unknown, engedett: readonly T[]): T[] {
  if (!Array.isArray(v)) return [];
  const eng = engedett as readonly string[];
  return Array.from(new Set(v.filter((x): x is T => typeof x === 'string' && eng.includes(x))));
}
/**
 * A három ágazat-mező listája: a régi neveket a közös lista nevére képezi (`REGI_AGAZAT_NEVEK`),
 * utána `szurtLista`. A sorrend megmarad (az első kiemelt iparág adja a térkép színét); ha két elem
 * ugyanarra a névre képződik, az egyszer szerepel, az első előfordulás helyén.
 * Két helyen fut: a normalizálóban (a DB-ből olvasott JSON régi nevet is tárolhat) és az
 * űrlap-validátorban (hogy a két belépési pont ugyanúgy olvasson). A demó-profil futtató szigorú
 * ellenőrzése szándékosan nem alkalmazza: az országfájlokban a régi név hiba.
 */
export function agazatLista(v: unknown): Agazat[] {
  if (!Array.isArray(v)) return [];
  return szurtLista(v.map((x: unknown) => (typeof x === 'string' ? (REGI_AGAZAT_NEVEK.get(x) ?? x) : x)), AGAZATOK);
}
function szovegLista(v: unknown, max: number): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x !== '').slice(0, max) : [];
}

/**
 * Blokkonkénti normalizáló: a hiányzó vagy rossz típusú almező az üres alapértéket kapja,
 * a listákból az ismeretlen opció kiesik. Így egy később bevezetett mező nem töri el a régi
 * sort. Üres bemenetre (`{}`) ugyanez adja a blokk üres alapértékét.
 */
const NORMALIZALOK: { [K in BlokkKulcs]: (r: Record<string, unknown>) => ProfilBlokkok[K] } = {
  alapadatok: (r) => ({
    fovaros: szoveg(r.fovaros), terulet: szam(r.terulet), penznem: szoveg(r.penznem),
    lakossag: szam(r.lakossag), gdp: szam(r.gdp), gdpEgyFore: szam(r.gdpEgyFore),
    gdpNovekedes: szam(r.gdpNovekedes), adatEv: szam(r.adatEv), forras: szoveg(r.forras),
    tagsagok: szurtLista(r.tagsagok, TAGSAGOK), tagsagEgyeb: szoveg(r.tagsagEgyeb),
    agazatok: agazatLista(r.agazatok), agazatEgyeb: szoveg(r.agazatEgyeb),
  }),
  kfiRendszer: (r) => ({
    teljesitmeny: szoveg(r.teljesitmeny), gerd: szam(r.gerd), strategia: szoveg(r.strategia),
    prioritasok: szurtLista(r.prioritasok, KFI_PRIORITASOK), prioritasEgyeb: szoveg(r.prioritasEgyeb),
    kiemeltIparagak: agazatLista(r.kiemeltIparagak), iparagEgyeb: szoveg(r.iparagEgyeb),
    erossegek: szoveg(r.erossegek), kihivasok: szoveg(r.kihivasok),
  }),
  intezmenyek: (r) => ({
    iranyitoSzervek: szoveg(r.iranyitoSzervek), egyetemek: szoveg(r.egyetemek),
    kutatokozpontok: szoveg(r.kutatokozpontok), infrastrukturak: szoveg(r.infrastrukturak),
  }),
  vallalati: (r) => ({
    kiemeltAgazatok: agazatLista(r.kiemeltAgazatok), agazatEgyeb: szoveg(r.agazatEgyeb),
    topVallalatok: szovegLista(r.topVallalatok, TOP_VALLALAT_MAX), startupok: szoveg(r.startupok),
    klaszterek: szoveg(r.klaszterek), inkubatorok: szoveg(r.inkubatorok),
    technologiatranszfer: szoveg(r.technologiatranszfer),
  }),
  programok: (r) => ({
    palyazatok: szoveg(r.palyazatok), tamogatasiProgramok: szoveg(r.tamogatasiProgramok),
    finanszirozasiEszkozok: szoveg(r.finanszirozasiEszkozok), nemzetkoziReszvetel: szoveg(r.nemzetkoziReszvetel),
  }),
  rendezvenyek: (r) => {
    const nyersLista = Array.isArray(r.lista) ? r.lista : [];
    return {
      lista: nyersLista
        .filter((x): x is Record<string, unknown> => typeof x === 'object' && x !== null)
        .map((x) => ({
          nev: szoveg(x.nev),
          tipus: rendezvenyTipus(x.tipus),
          idopont: szoveg(x.idopont),
          megjegyzes: szoveg(x.megjegyzes),
        }))
        .filter((x) => x.nev !== '')
        .slice(0, RENDEZVENY_MAX),
    };
  },
  nemzetkoziKapcsolatok: (r) => ({
    partnerorszagok: szoveg(r.partnerorszagok), euMultilateralis: szoveg(r.euMultilateralis),
  }),
  magyarKapcsolatok: (r) => ({
    egyezmeny: szoveg(r.egyezmeny), ketoldalu: szoveg(r.ketoldalu), mobilitas: szoveg(r.mobilitas),
  }),
  magyarErtekeles: (r) => ({
    osszegzes: szoveg(r.osszegzes), egyuttmukodesiLehetosegek: szoveg(r.egyuttmukodesiLehetosegek),
    joGyakorlatok: szoveg(r.joGyakorlatok), diplomaciaiPrioritasok: szoveg(r.diplomaciaiPrioritasok),
  }),
};

/**
 * A DB-ből olvasott JSON blokk normalizálása a `NORMALIZALOK` táblával; ismeretlen `kulcs`
 * nem fordulhat elő, mert a `BlokkKulcs` uniót a `NORMALIZALOK` kimerítően fedi.
 */
export function normalizalBlokk<K extends BlokkKulcs>(kulcs: K, nyers: unknown): ProfilBlokkok[K] {
  const r = (typeof nyers === 'object' && nyers !== null ? nyers : {}) as Record<string, unknown>;
  return NORMALIZALOK[kulcs](r);
}

/** Üres alapértékek blokkonként (a normalizáló üres bemenetre adott értéke); az üres űrlap ebből indul. */
export function uresBlokk<K extends BlokkKulcs>(kulcs: K): ProfilBlokkok[K] {
  return NORMALIZALOK[kulcs]({});
}

/**
 * Mezőcímkék és kérdőjeles magyarázat: az űrlap, az olvasó nézet és a validátor hibaüzenetei
 * ugyanebből a szótárból írnak (az olvasó nézet és a validátor csak a `cimke`-t). Kulcs = a mező
 * neve. A `magyarazat` kötelező: a `MEZO_CIMKEK` típusa mezőnév szerint kimerítő, ezért fordítási
 * hiba, ha egy mezőhöz nincs. A példák Dél-Koreáról szólnak
 * (`scripts/demo-orszagprofil/orszagok/kr.ts`), a szabályok a `lib/orszagprofil-validacio.ts`-éi.
 */
export interface MezoCimke {
  cimke: string;
  /** Mit kell a mezőbe írni (a validátor szabályaival egyezően). */
  magyarazat: string;
  /** Példa-érték; többsoros mezőnél `\n`-nel elválasztva. */
  pelda?: string;
}
export const MEZO_CIMKEK: { [K in BlokkKulcs]: Record<keyof ProfilBlokkok[K], MezoCimke> } = {
  alapadatok: {
    fovaros: { cimke: 'Főváros', magyarazat: 'Az ország fővárosának neve magyarul.', pelda: 'Szöul' },
    terulet: {
      cimke: 'Terület (km²)',
      magyarazat: 'Az ország teljes területe négyzetkilométerben, egész számként. Az ezreseket szóközzel tagolhatod.',
      pelda: '100 460',
    },
    penznem: {
      cimke: 'Pénznem',
      magyarazat: 'A hivatalos pénznem magyar neve, utána zárójelben az ISO-kódja.',
      pelda: 'dél-koreai von (KRW)',
    },
    lakossag: {
      cimke: 'Lakosság (fő)',
      magyarazat: 'Az ország lakossága főben, az Adatév szerinti állapotban; egész szám, az ezreseket szóközzel tagolhatod.',
      pelda: '51 681 000',
    },
    gdp: {
      cimke: 'GDP (milliárd USD)',
      magyarazat: 'Az ország nominális (folyó áras) GDP-je milliárd amerikai dollárban az Adatévre; legfeljebb egy tizedesjeggyel, tizedesvesszővel. Az ezreseket szóközzel tagolhatod.',
      pelda: '1 858,6',
    },
    gdpEgyFore: {
      cimke: 'Egy főre jutó GDP (USD)',
      magyarazat: 'Az egy főre jutó nominális GDP amerikai dollárban az Adatévre; egész szám, az ezreseket szóközzel tagolhatod.',
      pelda: '35 962',
    },
    gdpNovekedes: {
      cimke: 'GDP-növekedés (%)',
      magyarazat: 'A reál-GDP éves növekedése az Adatévre, százalékban; legfeljebb egy tizedesjeggyel, tizedesvesszővel, csökkenésnél mínusz előjellel.',
      pelda: '0,9 vagy -1,2',
    },
    adatEv: {
      cimke: 'Adatév',
      magyarazat: `Az az év, amelyre a lakosság és a GDP-adatok vonatkoznak; ${EV_MIN - 10} és az aktuális év között.`,
      pelda: '2025',
    },
    forras: {
      cimke: 'Forrás',
      magyarazat: 'Az adatok forrása (pl. IMF, Világbank, nemzeti statisztikai hivatal), a kiadással vagy az időponttal. Több forrást vesszővel válassz el.',
      pelda: 'IMF World Economic Outlook (2025. október), Világbank',
    },
    tagsagok: {
      cimke: 'Nemzetközi szervezeti tagság',
      magyarazat: 'Válaszd ki a listából azokat a szervezeteket, amelyeknek az ország tagja. Ami nincs a listán, azt az „Egyéb tagság” mezőbe írd.',
    },
    tagsagEgyeb: {
      cimke: 'Egyéb tagság',
      magyarazat: 'A listán nem szereplő szervezeti tagságok, vesszővel elválasztva.',
      pelda: 'APEC, RCEP, IPEF',
    },
    agazatok: {
      cimke: 'Legfontosabb gazdasági ágazatok',
      magyarazat: 'Válaszd ki a listából az ország gazdaságában legnagyobb súlyú ágazatokat (a KFI-politika kiemelt iparágai külön, az 1. blokk „Kiemelt iparágak” mezőjébe kerülnek). Ami nincs a listán, azt az „Egyéb ágazat” mezőbe írd.',
    },
    agazatEgyeb: {
      cimke: 'Egyéb ágazat',
      magyarazat: 'A listán nem szereplő gazdasági ágazatok, vesszővel elválasztva.',
      pelda: 'Hajógyártás, acélipar',
    },
  },
  kfiRendszer: {
    teljesitmeny: {
      cimke: 'KFI-teljesítmény',
      magyarazat: 'Az ország KFI-pozíciója nemzetközi mutatók alapján: index, helyezés, az elmúlt évek iránya. Add meg a forrást és az évet.',
      pelda: 'Global Innovation Index 2025: 4. hely a 139 gazdaság közül (2024: 6.), régiójában az első. A K+F-ráfordítás 2024-ben a GDP 5,13%-a (OECD MSTI).',
    },
    gerd: {
      cimke: 'K+F ráfordítás a GDP %-ában',
      magyarazat: 'A bruttó hazai K+F-ráfordítás (GERD) a GDP százalékában, legfeljebb két tizedesjeggyel, tizedesvesszővel. Az érték évét a KFI-teljesítmény szövegében add meg.',
      pelda: '5,13',
    },
    strategia: {
      cimke: 'KFI stratégia',
      magyarazat: 'A hatályos nemzeti KFI- vagy tudomány- és technológiastratégia neve és időtávja, egy sorban; ha van, a fő célkitűzéssel.',
      pelda: '6. Tudomány- és Technológiai Alapterv (2026–2030): több mint 200 billió von állami K+F',
    },
    prioritasok: {
      cimke: 'Prioritások',
      magyarazat: 'Válaszd ki a listából az ország KFI-politikájának kiemelt témáit. Ami nincs a listán, azt az „Egyéb prioritás” mezőbe írd.',
    },
    prioritasEgyeb: {
      cimke: 'Egyéb prioritás',
      magyarazat: 'A listán nem szereplő KFI-prioritások, vesszővel elválasztva.',
      pelda: '6G-fejlesztés, bioökonómia',
    },
    kiemeltIparagak: {
      cimke: 'Kiemelt iparágak',
      magyarazat: 'Válaszd ki a listából azokat az iparágakat, amelyekre az ország a KFI-politikájában a leginkább épít. A sorrend számít: a térképen az első színe jelenik meg, ezért a legfontosabbal kezdd (a sorrend módosításához távolítsd el, majd válaszd ki újra az elemeket). Ami nincs a listán, azt az „Egyéb iparág” mezőbe írd.',
    },
    iparagEgyeb: {
      cimke: 'Egyéb iparág',
      magyarazat: 'A listán nem szereplő kiemelt iparágak, vesszővel elválasztva.',
      pelda: 'Fejlett robotika, atomenergia',
    },
    erossegek: {
      cimke: 'Erősségek',
      magyarazat: 'A KFI-rendszer legfontosabb erősségei, néhány mondatban vagy felsorolásban; lehetőleg számmal vagy helyezéssel alátámasztva.',
      pelda: 'Erős nagyvállalati K+F: a legnagyobb befektetők a Samsung Electronics, az SK hynix és a Hyundai Motor. A GII 2025 szerint Korea első a GDP-arányos vállalati K+F-ráfordításban.',
    },
    kihivasok: {
      cimke: 'Kihívások',
      magyarazat: 'A KFI-rendszer fő gyengeségei, szűk keresztmetszetei, kockázatai; lehetőleg számmal alátámasztva.',
      pelda: 'A K+F néhány nagy konglomerátumon belül összpontosul, a tudományos cikkeknek csak mintegy negyede készül nemzetközi társszerzőséggel.',
    },
  },
  intezmenyek: {
    iranyitoSzervek: {
      cimke: 'Irányító szervek',
      magyarazat: 'A KFI-politikát irányító és finanszírozó szervek: minisztériumok, ügynökségek, tanácsok. Szervenként egy sor: név (rövidítés) – feladata egy mondatban.',
      pelda: 'Tudományos és IKT Minisztérium (MSIT) – az állami K+F és a KFI-stratégia gazdája.\nNemzeti Kutatási Alapítvány (NRF) – a kutatási pályázatok fő finanszírozója.',
    },
    egyetemek: {
      cimke: 'Meghatározó egyetemek',
      magyarazat: 'A KFI szempontjából legfontosabb egyetemek, zárójelben a városukkal; ha releváns, a fő szakterülettel is.',
      pelda: 'KAIST (Tedzson), Szöuli Nemzeti Egyetem (Szöul), POSTECH (Pohang)',
    },
    kutatokozpontok: {
      cimke: 'Kutatóközpontok, intézetek',
      magyarazat: 'A meghatározó, nem egyetemi kutatóintézetek és kutatóhálózatok (állami vagy magán), a szakterületükkel.',
      pelda: 'Koreai Tudományos és Technológiai Intézet (KIST) – multidiszciplináris; ETRI – elektronika és távközlés; KRISS – metrológia',
    },
    infrastrukturak: {
      cimke: 'Kutatási infrastruktúrák',
      magyarazat: 'A nagy kutatási infrastruktúrák: kutatóreaktor, részecskegyorsító, röntgenlézer, fúziós berendezés, szuperszámítógép – név és hely. A tudományos és technológiai parkok a 3. blokk „Klaszterek” mezőjébe kerülnek.',
      pelda: 'PAL-XFEL röntgenlézer (Pohang); KSTAR szupravezető tokamak (Tedzson); a KISTI nemzeti szuperszámítógépe (Tedzson)',
    },
  },
  vallalati: {
    kiemeltAgazatok: {
      cimke: 'Kiemelt ágazatok',
      magyarazat: 'Válaszd ki a listából azokat az ágazatokat, amelyekben az ország innovatív vállalatai a legerősebbek. Ami nincs a listán, azt az „Egyéb ágazat” mezőbe írd.',
    },
    agazatEgyeb: {
      cimke: 'Egyéb ágazat',
      magyarazat: 'A listán nem szereplő ágazatok, vesszővel elválasztva.',
      pelda: 'Hajógyártás, kijelzőgyártás',
    },
    topVallalatok: {
      cimke: 'Top 10 vállalat',
      magyarazat: `Az ország KFI szempontjából legfontosabb vállalatai, fontossági sorrendben (az országprofil oldalán számozott listaként jelenik meg). Soronként egy név, legfeljebb ${TOP_VALLALAT_MAX}.`,
      pelda: 'Samsung Electronics\nSK hynix\nHyundai Motor',
    },
    startupok: {
      cimke: 'Kiemelt innovatív startupok, kkv-k',
      magyarazat: 'Az ország kiemelt innovatív startupjai és kkv-i, valamint az ökoszisztéma jellemzői: unikornisok, támogató programok, számok.',
      pelda: 'Ismert unikornisok: Toss, Kurly. A TIPS program 2026-ban 800 startupot támogat.',
    },
    klaszterek: {
      cimke: 'Klaszterek',
      magyarazat: 'A meghatározó innovációs klaszterek, tudományos és technológiai parkok – név, hely, szakterület. Az inkubátorok és akcelerátorok a következő mezőbe kerülnek.',
      pelda: 'Pangyo Techno Valley (IKT, játékipar, fintech); Songdo (biotechnológia).',
    },
    inkubatorok: {
      cimke: 'Inkubátorok, akcelerátorok',
      magyarazat: 'A meghatározó inkubátorok és gyorsítóprogramok (akcelerátorok) – név, fenntartó, hely, szakterület.',
      pelda: 'Kreatív Gazdasági Innovációs Központok (CCEI) – 19 régiós inkubátor.',
    },
    technologiatranszfer: {
      cimke: 'Technológiatranszfer',
      magyarazat: 'Hogyan jut el a kutatási eredmény a vállalatokhoz: transzferirodák, hasznosítási programok, spin-off-támogatás, vállalati kockázati tőke.',
      pelda: 'Egyetemi és intézeti technológiatranszfer-irodák (KAIST, ETRI, KIST); a KIAT technológiatranszfer-programjai.',
    },
  },
  programok: {
    // A megjelenítés sorrendje (űrlap, olvasó nézet): finanszírozási eszközök, nemzeti pályázatok, támogatási programok,
    // nemzetközi részvétel. A tárolt JSON kulcssorrendje (típus, normalizáló, validátor) szándékosan a régi maradt.
    finanszirozasiEszkozok: {
      cimke: 'Finanszírozási eszközök',
      magyarazat: 'A pályázaton kívüli finanszírozási eszközök: kockázati tőke, alapok alapja, hitelgarancia, kedvezményes hitel, adókedvezmény.',
      pelda: 'KVIC alapok alapja; KOTEC technológiaalapú hitelgaranciák; K+F-adójóváírás.',
    },
    palyazatok: {
      cimke: 'Nemzeti KFI pályázatok',
      magyarazat: 'Az ország fő nemzeti KFI-pályázati programjai: kiíró, a program neve és témája, valamint – ha ismert – a jellemző beadási időszak.',
      pelda: 'NRF alapkutatási pályázatok (egyéni, fiatal kutatói, csoportos sémák); IITP IKT K+F felhívások; KEIT ipari technológiai programok.',
    },
    tamogatasiProgramok: {
      cimke: 'Támogatási programok',
      magyarazat: 'Állami támogatási és ösztönző programok (startup-, inkubációs, mobilitási, tehetséggondozási): név, kezelő szerv, célcsoport.',
      pelda: 'TIPS (MSS) – technológiai startupok, magánbefektetői előszűréssel; Brain Pool (MSIT, NRF) – külföldi kutatók meghívása koreai egyetemekre és kutatóintézetekbe.',
    },
    nemzetkoziReszvetel: {
      cimke: 'Nemzetközi részvételi lehetőségek',
      magyarazat: 'Azok a nemzetközi programok, amelyekben az ország szervezetei – akár magyar partnerrel közösen – részt vehetnek: EU-s keretprogram, EUREKA, kétoldalú vagy regionális felhívások.',
      pelda: 'Közös konzorcium a Horizont Európa II. pillérében (Korea társult ország); EUREKA-projektek; kétoldalú NKFIH–NRF felhívások.',
    },
  },
  rendezvenyek: {
    lista: {
      cimke: 'Szakkiállítások, konferenciák, egyéb fórumok',
      magyarazat: `Az országban rendszeresen megrendezett jelentősebb KFI-rendezvények. Legfeljebb ${RENDEZVENY_MAX} rendezvény, a rendezvény neve kötelező; a teljesen üres sor kimarad.`,
    },
  },
  nemzetkoziKapcsolatok: {
    partnerorszagok: {
      cimke: 'Legfőbb partnerországok',
      magyarazat: 'Azok az országok, amelyekkel a fogadó ország KFI-együttműködése a legintenzívebb, az együttműködés jellegével.',
      pelda: 'USA (Technology Prosperity Deal, 2025), EU (Horizont Európa-társulás, digitális és zöld partnerség).',
    },
    euMultilateralis: {
      cimke: 'EU és multilaterális kapcsolatok',
      magyarazat: 'Az ország kapcsolata az EU-val és többoldalú szervezetekkel, programokkal a KFI területén: társulás, partnerségek, tagság, vegyesbizottság.',
      pelda: 'Horizont Európa-társult ország (II. pillér) 2025-től; EU–Korea Digitális Partnerség (2022) és Zöld Partnerség (2023); az EUREKA teljes jogú tagja.',
    },
  },
  magyarKapcsolatok: {
    egyezmeny: {
      cimke: 'Érvényes TéT-egyezmény',
      magyarazat: 'A Magyarországgal kötött hatályos tudományos-technológiai egyezmény megnevezése és aláírásának éve, egy sorban. Ha nincs, hagyd üresen.',
      pelda: 'Magyar–koreai kormányközi egyezmény a tudományos és műszaki együttműködésről (1989)',
    },
    ketoldalu: {
      cimke: 'Kétoldalú együttműködések',
      magyarazat: 'A magyar–fogadó országbeli KFI-együttműködések: vegyesbizottsági ülések, közös felhívások, egyetértési megállapodások, közös projektek – évszámmal.',
      pelda: 'TéT-vegyesbizottság 10. ülése (2021); NKFIH–NRF közös felhívás (2022: 5 magyar nyertes); V4–Korea közös felhívás (2023).',
    },
    mobilitas: {
      cimke: 'Mobilitási lehetőségek',
      magyarazat: 'Ösztöndíjak, kutatócsere, hallgatói és kutatói mozgás a két ország között: program, létszám, év.',
      pelda: 'Stipendium Hungaricum: évi 100 hely, 2025/26-ban 63 ösztöndíjas; Global Korea Scholarship: 2026-ban 4 nagykövetségi hely.',
    },
  },
  magyarErtekeles: {
    osszegzes: {
      cimke: 'Összegzés',
      magyarazat: `Az ország KFI-profiljának és a magyar együttműködési lehetőségeknek a rövid összefoglalója, 2–4 mondatban, legfeljebb ${OSSZEGZES_MAX} karakterben. Ez jelenik meg a térképen, az ország kiválasztásakor megnyíló panelen.`,
      pelda: 'Dél-Korea a világ egyik legintenzívebb K+F-befektetője (2024: a GDP 5,13%-a), a GII 2025-ös rangsorában 4. A magyar–koreai TéT-kapcsolat az 1989-es egyezményre és a közös NKFIH–NRF felhívásokra épül; a legnagyobb potenciál az akkumulátor- és gyógyszerkutatásban van.',
    },
    egyuttmukodesiLehetosegek: {
      cimke: 'Együttműködési lehetőségek',
      magyarazat: 'Konkrét területek, ahol magyar kutatóhelyeknek és vállalatoknak együttműködési lehetőségük van, rövid indoklással.',
      pelda: 'Akkumulátor-technológia és -újrahasznosítás a magyarországi koreai gyártóbázisra építve; gyógyszer- és orvosbiológiai kutatás (a 2025-ös NKFIH–NRF projektek témái).',
    },
    joGyakorlatok: {
      cimke: 'Jó gyakorlatok, hazai adaptációs lehetőségek',
      magyarazat: 'Az országban bevált KFI-megoldások, amelyeket Magyarországon is érdemes lehet alkalmazni, a hazai adaptálás lehetőségével.',
      pelda: 'A TIPS modellje: a magánbefektetői szűrés megelőzi a közpénzt; a kiemelt technológiák elkülönített, ötéves K+F-kerete.',
    },
    diplomaciaiPrioritasok: {
      cimke: 'TéT diplomáciai prioritások',
      magyarazat: 'A magyar–fogadó országbeli KFI-kapcsolatok erősítéséhez javasolt következő lépések: tárgyalandó témák, kezdeményezések, intézményi teendők.',
      pelda: 'A TéT-vegyesbizottság kétévenkénti ülésezésének biztosítása; az NKFIH–NRF közös felhívások folytatása; közös Horizont Európa-konzorciumok szervezése.',
    },
  },
};

/** A rendezvénysorok mezői: nem a `MEZO_CIMKEK` kulcsai, mert a sor a `Rendezvenyek.lista` eleme. */
export const REND_MEZO_CIMKEK: Record<keyof Rendezveny, MezoCimke> = {
  nev: { cimke: 'Név', magyarazat: 'A rendezvény hivatalos neve. Kötelező: név nélkül a sor nem menthető (a teljesen üres sor kimarad).', pelda: 'BIO KOREA' },
  tipus: {
    cimke: 'Típus',
    magyarazat: 'Szakkiállítás, konferencia vagy egyéb fórum (pl. startup-fesztivál, kormányzati tudománydiplomáciai fórum).',
  },
  idopont: {
    cimke: 'Időpont',
    magyarazat: 'Mikor és hol tartják, szabadon megfogalmazva; visszatérő rendezvénynél a szokásos hónap.',
    pelda: 'április–május, Szöul (COEX)',
  },
  megjegyzes: {
    cimke: 'Megjegyzés',
    magyarazat: 'Rövid leírás: a rendezvény témája, szervezője, és ha ismert, a következő (vagy a legutóbbi) alkalom pontos dátuma.',
    pelda: 'Biotechnológia és gyógyszeripar, partnering; 2026: április 28–30.',
  },
};
