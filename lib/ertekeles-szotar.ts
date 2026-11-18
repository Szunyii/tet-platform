/**
 * A szakmai értékelés (monitoring) szótárai. Framework-mentes konstansok: a munkalap, a validáció,
 * a lekérdezések és a hálózati nézet ugyanebből dolgozik. A szempontok kulcsai és a fokozatok
 * értékei kerülnek a DB-be; a szövegek a terv (spec) 5.1. és 5.2. pontjából valók.
 * Fokozatot és összminősítést kód nem számol, csak admin ad.
 */

/** Az öt szempont kulcsa; a `szempont_minosites.szempont` oszlop ezeket tárolja. */
export type SzempontKulcs =
  | 'tajekoztatas'
  | 'orszagismeret'
  | 'kapcsolatepites'
  | 'eredmenyek'
  | 'egyuttmukodes';

export interface Szempont {
  kulcs: SzempontKulcs;
  nev: string;
  /** A szűk helyeken (tábla fejléce, jelvény) használt felirat. */
  rovid: string;
  /** A fokozatleírások: a munkalapon minősítés közben végig láthatók. A 0 (nem értékelhető) leírása nincs. */
  fokozatok: Record<1 | 2 | 3 | 4, string>;
}

export const SZEMPONTOK: readonly Szempont[] = [
  {
    kulcs: 'tajekoztatas',
    nev: 'Tájékoztatás és elemzés',
    rovid: 'Tájékoztatás',
    fokozatok: {
      4: 'Rendszeresen, megelőző jelleggel ad elemző anyagot, amely a fogadó ország fejleményeit a magyar érdekekre vetíti, és konkrét döntést vagy intézkedést alapoz meg.',
      3: 'Rendszeresen, időben tájékoztat a lényeges fejleményekről. Az anyagok pontosak és a központ számára felhasználhatók.',
      2: 'A tájékoztatás időszakos vagy egyenetlen. Az anyagok inkább leírók, a magyar vonatkozás és a javaslat gyakran hiányzik.',
      1: 'Lényeges fejlemények rendszeresen kimaradnak, vagy az anyagok érdemben nem használhatók.',
    },
  },
  {
    kulcs: 'orszagismeret',
    nev: 'Országismeret',
    rovid: 'Országismeret',
    fokozatok: {
      4: 'A profil teljes, naprakész és önálló értékelést ad, elemzése más munkához is mintaként szolgál.',
      3: 'A profil a ciklusban teljes és megbízható, a lényeges változásokat követi.',
      2: 'A profil hiányos vagy részben elavult, az adatok mellett kevés az értékelés.',
      1: 'A profil érdemben hiányos vagy elavult, a központ nem támaszkodhat rá.',
    },
  },
  {
    kulcs: 'kapcsolatepites',
    nev: 'Kapcsolatépítés',
    rovid: 'Kapcsolatépítés',
    fokozatok: {
      4: 'Stratégiai jelentőségű kapcsolatokat épít és tart fenn, és ezeket célzottan megnyitja a magyar szereplők előtt.',
      3: 'Aktív, releváns kapcsolatrendszert tart fenn, és a megkereséseknél hatékonyan közvetít.',
      2: 'A kapcsolatok esetiek vagy szűk körűek, a közvetítés főként kérésre történik.',
      1: 'Nincs érdemi, a feladatokhoz használható kapcsolatépítés.',
    },
  },
  {
    kulcs: 'eredmenyek',
    nev: 'Eredmények',
    rovid: 'Eredmények',
    fokozatok: {
      4: 'Az attasé hozzájárulása igazoltan vezetett új együttműködéshez, megállapodáshoz vagy magyar szereplő mérhető hasznához.',
      3: 'A lehetőségek egy része igazoltan előrehaladt, és az attasé hozzájárulása világos.',
      2: 'Vannak lehetőségek, de ritkán jutnak tovább, vagy a hozzájárulás nem igazolható.',
      1: 'Az időszakban nincs kimutatható előrehaladás, és nincs terv a lehetőségek gondozására.',
    },
  },
  {
    kulcs: 'egyuttmukodes',
    nev: 'Együttműködés a központtal',
    rovid: 'Együttműködés',
    fokozatok: {
      4: 'Határidő előtt teljesít, és kérés nélkül is többletet ad.',
      3: 'A kéréseket határidőre, használható minőségben teljesíti.',
      2: 'Több csúszás vagy pótlás kellett.',
      1: 'A válaszok rendszeresen késnek vagy elmaradnak.',
    },
  },
];

export const SZEMPONT_KULCSOK: readonly SzempontKulcs[] = SZEMPONTOK.map((s) => s.kulcs);

export function isSzempontKulcs(v: string): v is SzempontKulcs {
  return (SZEMPONT_KULCSOK as readonly string[]).includes(v);
}

/** A szempont adatai a kulcs szerint (a kulcs típusa garantálja, hogy van ilyen). */
export function szempontByKulcs(k: SzempontKulcs): Szempont {
  const szempont = SZEMPONTOK.find((s) => s.kulcs === k);
  if (!szempont) throw new Error(`Ismeretlen szempont: ${k}`);
  return szempont;
}

/** A szempontnál választható fokozat: 0 = nem értékelhető, 1–4 a négy fokozat. */
export type Fokozat = 0 | 1 | 2 | 3 | 4;
/** Az összminősítés fokozata: a „nem értékelhető” itt nem választható. */
export type OsszFokozat = 1 | 2 | 3 | 4;

export interface FokozatAdat {
  ertek: Fokozat;
  nev: string;
  rovid: string;
}

/** A fokozatok a megjelenítés sorrendjében (4, 3, 2, 1, 0). */
export const FOKOZATOK: readonly FokozatAdat[] = [
  { ertek: 4, nev: 'Kiemelkedő', rovid: 'Kiem.' },
  { ertek: 3, nev: 'Megfelel', rovid: 'Megf.' },
  { ertek: 2, nev: 'Részben megfelel', rovid: 'Részben' },
  { ertek: 1, nev: 'Fejlesztendő', rovid: 'Fejl.' },
  { ertek: 0, nev: 'Nem értékelhető', rovid: 'N/É' },
];

export function isFokozat(n: number): n is Fokozat {
  return Number.isInteger(n) && n >= 0 && n <= 4;
}

export function isOsszFokozat(n: number): n is OsszFokozat {
  return Number.isInteger(n) && n >= 1 && n <= 4;
}

function fokozatAdat(f: Fokozat): FokozatAdat {
  const adat = FOKOZATOK.find((x) => x.ertek === f);
  if (!adat) throw new Error(`Ismeretlen fokozat: ${f}`);
  return adat;
}

export function fokozatNev(f: Fokozat): string {
  return fokozatAdat(f).nev;
}

export function fokozatRovid(f: Fokozat): string {
  return fokozatAdat(f).rovid;
}

/**
 * A fokozat jelvényének színe. A szín mellett mindig szöveg áll; a „nem értékelhető” csíkozott szürke,
 * hogy ne tűnjön sem gyenge, sem jó eredménynek.
 */
export const FOKOZAT_OSZTALY: Record<Fokozat, string> = {
  4: 'bg-[#0f7a68] text-white',
  3: 'bg-[#cde9e1] text-[#0b4f44]',
  2: 'bg-[#fbe3b8] text-[#6e4700]',
  1: 'bg-[#f2b8b3] text-[#7a1710]',
  0: 'bg-[repeating-linear-gradient(135deg,#eef0f3_0_4px,#e1e5ea_4px_8px)] text-[#4a5462]',
};

/** A „nem értékelhető” szempont-fokozat értéke (nem számít gyenge eredménynek). */
export const NEM_ERTEKELHETO = 0;
/** A „megfelel” fokozat értéke: szempontnál ennél nem kötelező az indoklás. */
export const MEGFELEL = 3;

/** Az indoklás és a fejlesztési cél felső korlátja (karakter). */
export const INDOKLAS_MAX = 2000;

/** Az automatikusan rögzített minősítés (pl. a nem vezető attasé Országismerete) „értékelő” neve. */
export const AUTOMATIKUS_ERTEKELO = 'Automatikus';

/** Az attasé országai az értékelés pillanatában: a lezáráskor rögzül, az `orszagok` JSON-oszlop elemei. */
export interface RogzitettOrszag {
  kod: string;
  szekhely: boolean;
  vezeto: boolean;
}
