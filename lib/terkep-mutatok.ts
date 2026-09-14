/**
 * A térkép-oldal mutatói (színezés, rangsor, összehasonlítás), a színskála, a térkép fix
 * színei és a régió-gyorsválasztó. Framework-mentes: a TerkepOrszag csak típusként jön a
 * server-only query-modulból; a d3-scale/d3-interpolate tiszta függvénykönyvtár, DOM nélkül.
 */
import { interpolateLab, piecewise } from 'd3-interpolate';
import { scaleSequential } from 'd3-scale';
import type { TerkepOrszag } from '../db/queries/orszagprofil';
import {
  ALLAPOTOK, ALLAPOT_CIMKE, ALLAPOT_SZINEK, BLOKK_KULCSOK, IPARAGAK, IPARAG_SZINEK, MEZO_CIMKEK,
} from './orszagprofil-szotar';

export const MUTATO_KULCSOK = [
  'iparag', 'allapot',
  'gdpEgyFore', 'gdp', 'gdpNovekedes', 'lakossag', 'gerd', 'kitoltottseg', 'rendezvenyDb',
] as const;
export type MutatoKulcs = (typeof MUTATO_KULCSOK)[number];

export interface SzamMutato {
  kulcs: MutatoKulcs;
  tipus: 'szam';
  cimke: string;
  /** Közvetlenül a szám után (pl. ' %'); a formatSzam második paramétere. */
  utotag: string;
  ertek: (o: TerkepOrszag) => number | null;
}
export interface KategoriaMutato {
  kulcs: MutatoKulcs;
  tipus: 'kategoria';
  cimke: string;
  /** null = nincs kategória (pl. nincs kiemelt iparág). */
  kategoria: (o: TerkepOrszag) => string | null;
  /** A csoportok és a jelmagyarázat sorrendje. */
  sorrend: readonly string[];
  szinek: Readonly<Record<string, string>>;
  cimkek: Readonly<Record<string, string>>;
  /** true: csak a használt kategóriák jelennek meg (iparág); false: mind, üresen is (állapot). */
  csakHasznalt: boolean;
  /** A null kategória csoportjának felirata. */
  nincsCimke: string;
}
export type Mutato = SzamMutato | KategoriaMutato;

const IPARAG_CIMKEK: Record<string, string> = Object.fromEntries(IPARAGAK.map((i) => [i, i]));

export const MUTATOK: readonly Mutato[] = [
  {
    kulcs: 'iparag', tipus: 'kategoria', cimke: 'Kiemelt iparág',
    kategoria: (o) => o.iparagak[0] ?? null,
    sorrend: IPARAGAK, szinek: IPARAG_SZINEK, cimkek: IPARAG_CIMKEK, csakHasznalt: true,
    nincsCimke: 'nincs kiemelt iparág',
  },
  {
    kulcs: 'allapot', tipus: 'kategoria', cimke: 'Profil állapota',
    kategoria: (o) => o.allapot,
    sorrend: ALLAPOTOK, szinek: ALLAPOT_SZINEK, cimkek: ALLAPOT_CIMKE, csakHasznalt: false,
    nincsCimke: 'nincs adat',
  },
  { kulcs: 'gdpEgyFore', tipus: 'szam', cimke: MEZO_CIMKEK.alapadatok.gdpEgyFore.cimke, utotag: ' USD', ertek: (o) => o.alapadatok?.gdpEgyFore ?? null },
  { kulcs: 'gdp', tipus: 'szam', cimke: MEZO_CIMKEK.alapadatok.gdp.cimke, utotag: ' mrd USD', ertek: (o) => o.alapadatok?.gdp ?? null },
  { kulcs: 'gdpNovekedes', tipus: 'szam', cimke: MEZO_CIMKEK.alapadatok.gdpNovekedes.cimke, utotag: ' %', ertek: (o) => o.alapadatok?.gdpNovekedes ?? null },
  { kulcs: 'lakossag', tipus: 'szam', cimke: MEZO_CIMKEK.alapadatok.lakossag.cimke, utotag: ' fő', ertek: (o) => o.alapadatok?.lakossag ?? null },
  { kulcs: 'gerd', tipus: 'szam', cimke: MEZO_CIMKEK.kfiRendszer.gerd.cimke, utotag: ' %', ertek: (o) => o.gerd },
  {
    kulcs: 'kitoltottseg', tipus: 'szam', cimke: 'Kitöltöttség (mentett blokk)', utotag: `/${BLOKK_KULCSOK.length}`,
    ertek: (o) => (o.allapot === 'nincs' ? null : o.mentettDb),
  },
  {
    kulcs: 'rendezvenyDb', tipus: 'szam', cimke: 'Rendezvények száma', utotag: '',
    ertek: (o) => (o.allapot === 'nincs' ? null : o.rendezvenyDb),
  },
];

export const ALAP_MUTATO: MutatoKulcs = 'iparag';

/** Ismeretlen kulcsra az alapértelmezett mutatót adja (a hívónak nem kell külön kezelnie). */
export function mutatoByKulcs(k: string): Mutato {
  return MUTATOK.find((m) => m.kulcs === k) ?? MUTATOK.find((m) => m.kulcs === ALAP_MUTATO)!;
}

const nevSzerint = (a: TerkepOrszag, b: TerkepOrszag) => a.nev.localeCompare(b.nev, 'hu');

/** Az iparág-szűrő: '' = nincs szűrő; a kiemelt iparágak listájában keres. Új tömböt ad. */
export function szures(adatok: readonly TerkepOrszag[], iparag: string): TerkepOrszag[] {
  return iparag ? adatok.filter((o) => (o.iparagak as readonly string[]).includes(iparag)) : [...adatok];
}

export interface RangsorSor { o: TerkepOrszag; ertek: number; hely: number }
export interface Rangsor { sorok: RangsorSor[]; adatNelkul: TerkepOrszag[] }

/**
 * A szűrt országok csökkenő érték szerint (azonos értéknél név szerint); a helyezés „1224"-típusú:
 * azonos érték azonos hely. Az `adatNelkul` a szűrt, de érték nélküli országok név szerint.
 */
export function rangsor(adatok: readonly TerkepOrszag[], m: SzamMutato, iparag: string): Rangsor {
  const ertekes: { o: TerkepOrszag; ertek: number }[] = [];
  const adatNelkul: TerkepOrszag[] = [];
  for (const o of szures(adatok, iparag)) {
    const v = m.ertek(o);
    if (v === null) adatNelkul.push(o);
    else ertekes.push({ o, ertek: v });
  }
  ertekes.sort((a, b) => b.ertek - a.ertek || nevSzerint(a.o, b.o));
  const sorok: RangsorSor[] = [];
  for (let i = 0; i < ertekes.length; i++) {
    const hely = i > 0 && ertekes[i].ertek === ertekes[i - 1].ertek ? sorok[i - 1].hely : i + 1;
    sorok.push({ ...ertekes[i], hely });
  }
  return { sorok, adatNelkul: adatNelkul.sort(nevSzerint) };
}

export interface Csoport { kategoria: string | null; cimke: string; szin: string; orszagok: TerkepOrszag[] }

/** A szűrt országok kategóriánként a mutató `sorrend`-je szerint, végül a kategória nélküliek. */
export function csoportok(adatok: readonly TerkepOrszag[], m: KategoriaMutato, iparag: string): Csoport[] {
  const szurt = szures(adatok, iparag).sort(nevSzerint);
  const eredmeny: Csoport[] = [];
  for (const k of m.sorrend) {
    const orszagok = szurt.filter((o) => m.kategoria(o) === k);
    if (m.csakHasznalt && orszagok.length === 0) continue;
    eredmeny.push({ kategoria: k, cimke: m.cimkek[k] ?? k, szin: m.szinek[k] ?? TERKEP_SZINEK.semleges, orszagok });
  }
  const nincs = szurt.filter((o) => m.kategoria(o) === null);
  if (nincs.length > 0) eredmeny.push({ kategoria: null, cimke: m.nincsCimke, szin: TERKEP_SZINEK.semleges, orszagok: nincs });
  return eredmeny;
}

/** Az ÖSSZES (szűretlen) adattal rendelkező ország min–max-a – a színskála tartománya; nincs adat → null. */
export function tartomany(adatok: readonly TerkepOrszag[], m: SzamMutato): { min: number; max: number } | null {
  let min = Infinity;
  let max = -Infinity;
  for (const o of adatok) {
    const v = m.ertek(o);
    if (v === null) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return min === Infinity ? null : { min, max };
}

/**
 * Az összehasonlításhoz felkínált országok (a `kizart` kódok nélkül): számszerű mutatónál érték
 * szerint csökkenő, az érték nélküliek a végén név szerint; kategorikusnál név szerint.
 */
export function jeloltek(adatok: readonly TerkepOrszag[], kizart: readonly string[], m: Mutato): TerkepOrszag[] {
  const lista = adatok.filter((o) => !kizart.includes(o.kod));
  if (m.tipus === 'kategoria') return lista.sort(nevSzerint);
  return lista.sort((a, b) => {
    const va = m.ertek(a);
    const vb = m.ertek(b);
    if (va === null && vb === null) return nevSzerint(a, b);
    if (va === null) return 1;
    if (vb === null) return -1;
    return vb - va || nevSzerint(a, b);
  });
}

export const SKALA_SZINEK = ['#e3f1ec', '#8fcbbd', '#2f9a82', '#0f6b57', '#053f33'] as const;

/** Folytonos zöld skála a [min, max] tartományra; min === max esetén a középső szín. */
export function szinSkala(min: number, max: number): (v: number) => string {
  if (min === max) {
    const kozep: string = SKALA_SZINEK[2];
    return () => kozep;
  }
  const s = scaleSequential(piecewise(interpolateLab, [...SKALA_SZINEK])).domain([min, max]).clamp(true);
  return (v) => s(v);
}

export const TERKEP_SZINEK = {
  ocean: '#f4f7fb',
  gombKontur: '#dde1e7',
  racs: '#e7ebf1',
  /** Poszt nélküli ország. */
  szarazfold: '#e6eaef',
  hatar: '#ffffff',
  /** Az iparág-szűrő által kizárt ország. */
  halvany: '#e3e7ec',
  /** Kategória nélküli (pl. nincs kiemelt iparág). */
  semleges: '#5f6b7a',
  /** A sraffozás csíkja (számszerű mutató, nincs érték). */
  nincsAdat: '#c5ccd6',
  kontur: '#10151d',
} as const;

/**
 * Egy posztos ország kitöltési színe. `null` = számszerű mutató érték nélkül (a térképen
 * sraffozás, a pinen `nincsAdat`). A `skala` a `szinSkala(min, max)` eredménye, vagy null,
 * ha nincs tartomány.
 */
export function orszagSzin(o: TerkepOrszag, m: Mutato, iparag: string, skala: ((v: number) => string) | null): string | null {
  if (iparag && !(o.iparagak as readonly string[]).includes(iparag)) return TERKEP_SZINEK.halvany;
  if (m.tipus === 'kategoria') {
    const k = m.kategoria(o);
    return k === null ? TERKEP_SZINEK.semleges : (m.szinek[k] ?? TERKEP_SZINEK.semleges);
  }
  const v = m.ertek(o);
  return v === null || !skala ? null : skala(v);
}

export interface Regio {
  kulcs: string;
  cimke: string;
  /** `[[nyugat, dél], [kelet, észak]]` fokban; null = a teljes térkép (visszaállítás). */
  bbox: [[number, number], [number, number]] | null;
}
export const REGIOK: readonly Regio[] = [
  { kulcs: 'vilag', cimke: 'Világ', bbox: null },
  { kulcs: 'europa', cimke: 'Európa', bbox: [[-25, 34], [45, 72]] },
  { kulcs: 'azsia', cimke: 'Ázsia', bbox: [[40, -10], [150, 60]] },
  { kulcs: 'amerika', cimke: 'Amerika', bbox: [[-170, -56], [-30, 72]] },
  { kulcs: 'afrika', cimke: 'Afrika', bbox: [[-20, -36], [55, 38]] },
  { kulcs: 'kozelKelet', cimke: 'Közel-Kelet', bbox: [[25, 12], [65, 42]] },
];
