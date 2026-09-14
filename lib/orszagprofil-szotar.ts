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

export const GAZDASAGI_AGAZATOK = [
  'Autóipar', 'Gépipar', 'Elektronika és félvezetők', 'Gyógyszeripar', 'Vegyipar', 'Energetika',
  'Bányászat és nyersanyagok', 'Mezőgazdaság és élelmiszeripar', 'IKT és szoftver',
  'Pénzügyi szolgáltatások', 'Turizmus', 'Logisztika', 'Építőipar', 'Védelmi ipar', 'Kreatív ipar',
] as const;
export type GazdasagiAgazat = (typeof GAZDASAGI_AGAZATOK)[number];

export const KFI_PRIORITASOK = [
  'Digitalizáció és MI', 'Zöld átállás és klímasemlegesség', 'Egészség és élettudomány',
  'Ipar 4.0 és gyártás', 'Energiabiztonság', 'Űr', 'Védelem és biztonság', 'Alapkutatási kiválóság',
  'Tehetség és mobilitás', 'Startup és vállalkozói ökoszisztéma', 'Technológiai szuverenitás',
  'Regionális felzárkózás',
] as const;
export type KfiPrioritas = (typeof KFI_PRIORITASOK)[number];

/** Kiemelt iparágak és kiemelt ágazatok közös listája; az első kiemelt iparág adja a térkép színét. */
export const IPARAGAK = [
  'Mesterséges intelligencia és adatgazdaság', 'Félvezetők és mikroelektronika', 'Kvantumtechnológia',
  'Biotechnológia és gyógyszeripar', 'Digitális egészségügy', 'Energetika és fenntarthatóság',
  'Hidrogén és akkumulátor', 'Űripar', 'Mobilitás és autóipar', 'Agrár- és élelmiszertechnológia',
  'Anyagtudomány', 'IKT és digitalizáció', 'Védelmi technológia', 'Kreatív ipar és média',
] as const;
export type Iparag = (typeof IPARAGAK)[number];

export const IPARAG_SZINEK: Record<Iparag, string> = {
  'Mesterséges intelligencia és adatgazdaság': '#1f4e9c',
  'Félvezetők és mikroelektronika': '#b45309',
  'Kvantumtechnológia': '#6b46c1',
  'Biotechnológia és gyógyszeripar': '#0f7a68',
  'Digitális egészségügy': '#a8326f',
  'Energetika és fenntarthatóság': '#2f7d32',
  'Hidrogén és akkumulátor': '#0e7490',
  'Űripar': '#334155',
  'Mobilitás és autóipar': '#9a3412',
  'Agrár- és élelmiszertechnológia': '#8a6d1f',
  'Anyagtudomány': '#525c6b',
  'IKT és digitalizáció': '#2563eb',
  'Védelmi technológia': '#7f1d1d',
  'Kreatív ipar és média': '#be185d',
};

export const ALLAPOTOK = ['friss', 'elavult', 'nincs'] as const;
export type Allapot = (typeof ALLAPOTOK)[number];
export const ALLAPOT_CIMKE: Record<Allapot, string> = {
  friss: 'Az évi profil',
  elavult: 'Elavult profil',
  nincs: 'Nincs profil',
};
export const ALLAPOT_SZINEK: Record<Allapot, string> = { friss: '#2f7d32', elavult: '#b45309', nincs: '#6b7280' };
/** A legfrissebb profil-év → állapot; a profil oldal és a térkép-adat ugyanezt számolja. */
export function profilAllapot(ev: number | null, most: number): Allapot {
  return ev === null ? 'nincs' : ev === most ? 'friss' : 'elavult';
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
  lakossag: number | null;
  gdp: number | null;
  gdpEgyFore: number | null;
  gdpNovekedes: number | null;
  adatEv: number | null;
  forras: string;
  tagsagok: Tagsag[];
  tagsagEgyeb: string;
  agazatok: GazdasagiAgazat[];
  agazatEgyeb: string;
}
export interface KfiRendszer {
  teljesitmeny: string;
  gerd: number | null;
  strategia: string;
  prioritasok: KfiPrioritas[];
  prioritasEgyeb: string;
  kiemeltIparagak: Iparag[];
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
  kiemeltAgazatok: Iparag[];
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
    lakossag: szam(r.lakossag), gdp: szam(r.gdp), gdpEgyFore: szam(r.gdpEgyFore),
    gdpNovekedes: szam(r.gdpNovekedes), adatEv: szam(r.adatEv), forras: szoveg(r.forras),
    tagsagok: szurtLista(r.tagsagok, TAGSAGOK), tagsagEgyeb: szoveg(r.tagsagEgyeb),
    agazatok: szurtLista(r.agazatok, GAZDASAGI_AGAZATOK), agazatEgyeb: szoveg(r.agazatEgyeb),
  }),
  kfiRendszer: (r) => ({
    teljesitmeny: szoveg(r.teljesitmeny), gerd: szam(r.gerd), strategia: szoveg(r.strategia),
    prioritasok: szurtLista(r.prioritasok, KFI_PRIORITASOK), prioritasEgyeb: szoveg(r.prioritasEgyeb),
    kiemeltIparagak: szurtLista(r.kiemeltIparagak, IPARAGAK), iparagEgyeb: szoveg(r.iparagEgyeb),
    erossegek: szoveg(r.erossegek), kihivasok: szoveg(r.kihivasok),
  }),
  intezmenyek: (r) => ({
    iranyitoSzervek: szoveg(r.iranyitoSzervek), egyetemek: szoveg(r.egyetemek),
    kutatokozpontok: szoveg(r.kutatokozpontok), infrastrukturak: szoveg(r.infrastrukturak),
  }),
  vallalati: (r) => ({
    kiemeltAgazatok: szurtLista(r.kiemeltAgazatok, IPARAGAK), agazatEgyeb: szoveg(r.agazatEgyeb),
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

/** `?ev=` search param → négyjegyű egész, különben az alapértelmezett. */
export function evParam(raw: string | string[] | undefined, alap: number): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v && /^\d{4}$/.test(v) ? Number(v) : alap;
}
