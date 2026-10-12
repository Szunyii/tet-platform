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
  { kulcs: 'kapcsolatok', cim: '6. Nemzetközi és magyar–fogadó országbeli KFI/TéT kapcsolatok' },
  { kulcs: 'magyarErtekeles', cim: '7. Magyar szempontú értékelés és lehetőségek' },
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
  technologiatranszfer: string;
}
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
export interface Kapcsolatok {
  euMultilateralis: string;
  partnerorszagok: string;
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
  kapcsolatok: Kapcsolatok;
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
    klaszterek: szoveg(r.klaszterek), technologiatranszfer: szoveg(r.technologiatranszfer),
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
  kapcsolatok: (r) => ({
    euMultilateralis: szoveg(r.euMultilateralis), partnerorszagok: szoveg(r.partnerorszagok),
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

/** Mezőcímkék és súgó: az űrlap és az olvasó nézet ugyanezt írja. Kulcs = a mező neve. */
export interface MezoCimke {
  cimke: string;
  sugo?: string;
}
export const MEZO_CIMKEK: { [K in BlokkKulcs]: Record<keyof ProfilBlokkok[K], MezoCimke> } = {
  alapadatok: {
    fovaros: { cimke: 'Főváros', sugo: 'Pl. Szöul.' },
    terulet: { cimke: 'Terület (km²)' },
    penznem: { cimke: 'Pénznem', sugo: 'Pl. dél-koreai von (KRW).' },
    lakossag: { cimke: 'Lakosság (fő)' },
    gdp: { cimke: 'GDP (milliárd USD)' },
    gdpEgyFore: { cimke: 'Egy főre jutó GDP (USD)' },
    gdpNovekedes: { cimke: 'GDP-növekedés (%)' },
    adatEv: { cimke: 'Adatév', sugo: 'Melyik évre vonatkoznak a számok.' },
    forras: { cimke: 'Forrás', sugo: 'Pl. Világbank, IMF, nemzeti statisztikai hivatal.' },
    tagsagok: { cimke: 'Nemzetközi szervezeti tagság' },
    tagsagEgyeb: { cimke: 'Egyéb tagság' },
    agazatok: { cimke: 'Legfontosabb gazdasági ágazatok' },
    agazatEgyeb: { cimke: 'Egyéb ágazat' },
  },
  kfiRendszer: {
    teljesitmeny: { cimke: 'KFI-teljesítmény', sugo: 'Nemzetközi indexek, pozíció, trendek.' },
    gerd: { cimke: 'K+F ráfordítás a GDP %-ában' },
    strategia: { cimke: 'KFI stratégia', sugo: 'Érvényes stratégia neve és időtávja.' },
    prioritasok: { cimke: 'Prioritások' },
    prioritasEgyeb: { cimke: 'Egyéb prioritás' },
    kiemeltIparagak: { cimke: 'Kiemelt iparágak', sugo: 'Az első adja a térkép színét.' },
    iparagEgyeb: { cimke: 'Egyéb iparág' },
    erossegek: { cimke: 'Erősségek' },
    kihivasok: { cimke: 'Kihívások' },
  },
  intezmenyek: {
    iranyitoSzervek: { cimke: 'Irányító szervek', sugo: 'Minisztérium, ügynökség, tanács.' },
    egyetemek: { cimke: 'Meghatározó egyetemek' },
    kutatokozpontok: { cimke: 'Kutatóközpontok, intézetek' },
    infrastrukturak: { cimke: 'Kutatási infrastruktúrák' },
  },
  vallalati: {
    kiemeltAgazatok: { cimke: 'Kiemelt ágazatok' },
    agazatEgyeb: { cimke: 'Egyéb ágazat' },
    topVallalatok: { cimke: 'Top 10 vállalat', sugo: 'Soronként egy név.' },
    startupok: { cimke: 'Startupok, KKV-k' },
    klaszterek: { cimke: 'Klaszterek, inkubátorok' },
    technologiatranszfer: { cimke: 'Technológiatranszfer' },
  },
  programok: {
    palyazatok: { cimke: 'Pályázatok' },
    tamogatasiProgramok: { cimke: 'Támogatási programok' },
    finanszirozasiEszkozok: { cimke: 'Finanszírozási eszközök' },
    nemzetkoziReszvetel: { cimke: 'Nemzetközi részvételi lehetőségek' },
  },
  rendezvenyek: {
    lista: { cimke: 'Rendezvények', sugo: 'Szakkiállítások, konferenciák, egyéb fórumok.' },
  },
  kapcsolatok: {
    euMultilateralis: { cimke: 'EU és multilaterális kapcsolatok' },
    partnerorszagok: { cimke: 'Partnerországok' },
    egyezmeny: { cimke: 'Érvényes TéT-egyezmény', sugo: 'Megnevezés, aláírás éve.' },
    ketoldalu: { cimke: 'Kétoldalú együttműködések' },
    mobilitas: { cimke: 'Mobilitás', sugo: 'Ösztöndíjak, kutatócsere.' },
  },
  magyarErtekeles: {
    osszegzes: { cimke: 'Összegzés', sugo: 'Rövid, a térkép-panel kivonatába kerül.' },
    egyuttmukodesiLehetosegek: { cimke: 'Együttműködési lehetőségek' },
    joGyakorlatok: { cimke: 'Jó gyakorlatok, hazai adaptáció' },
    diplomaciaiPrioritasok: { cimke: 'Diplomáciai prioritások' },
  },
};
