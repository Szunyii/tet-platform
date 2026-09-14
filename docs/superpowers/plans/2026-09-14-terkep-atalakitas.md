# Térkép-oldal átalakítása – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `/terkep` oldalon a CDN-es webkomponens helyett React-térkép (d3-geo npm-ből, nagyítás, régió-gombok, folytonos színskála, gazdag tooltip), a két színezési fül helyett Mutató-választó, a jobb oldali panelen rangsor / kivonat / összehasonlító tábla.

**Architecture:** A tiszta logika (mutató-definíciók, rangsor, csoportok, tartomány, színskála, régiók) a `lib/terkep-mutatok.ts`-ben; a `listTerkepAdat` két mezővel bővül (`gerd`, `prioritasok`). A térkép egy React kliens-komponens (`VilagTerkep`), az SVG-t React rendereli, a d3-geo a vetületet adja, a d3-zoom közvetlenül a DOM-on állítja a `<g>` transformját. Az oldal-állapot (`kod`, `vs`, `mutato`, `iparag`) a `useTerkepAllapot` hookban, a panel-váltás a `TerkepPanel`-ben. Minden új fájl `app/(app)/terkep/components/` alatt.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 7, shadcn/ui (Base UI), Tailwind v4, d3-geo / d3-zoom / d3-selection / d3-transition / d3-scale / d3-interpolate, topojson-client, world-atlas 110m (npm, dinamikus import).

Spec: `docs/superpowers/specs/2026-09-14-terkep-atalakitas-design.md`.

**Ellenőrzés:** Nincs tesztkeretrendszer. Minden task végén `npx tsc --noEmit`; a UI-t a gstack headless böngészővel (`B=~/.claude/skills/gstack/browse/dist/browse`, parancsok: `goto/fill/click/text/js/console --errors/network`). A felhasználó dev szervere fut a 3000-en: **nem szabad leállítani/újraindítani**, és a subagent nem indít sajátot. Seed admin `admin@niu.hu`, jelszó a `.env.local` `SEED_ADMIN_PASSWORD` értéke (olvasd ki `grep`-pel, de **ne írd ki** a kimenetbe); teszt attasé `masodik.attase@niu.hu` / `Masodik1234!` (országa JP). Commit üzenetek végén: `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. `git add` mindig konkrét fájlokkal; a `.env.example`-t, az `AGENTS.md`-t és a `components/riport/RiportForm.tsx`-t (a felhasználó saját, nem commitolt módosítása) soha ne stage-eld. Reviewer subagentnek: git csak olvasásra, tilos a `checkout`/`reset`/`stash`. A munka a `main`-ből nyitott `terkep-atalakitas` branchen folyik.

Import-stílus: a meglévő fájlok relatív importot használnak (`../../../../lib/...`), ezt kövesd. A d3-modulokból csak a használt függvényeket importáld (nincs `d3` gyűjtőcsomag).

---

## Fájlszerkezet

| Fájl | Művelet | Felelősség |
| --- | --- | --- |
| `package.json` | módosít | d3-modulok, topojson-client, world-atlas + típusok. |
| `db/queries/orszagprofil.ts` | módosít | `TerkepOrszag.gerd`, `TerkepOrszag.prioritasok`. |
| `lib/terkep-mutatok.ts` | új | Mutató-definíciók, `rangsor`, `csoportok`, `tartomany`, `szures`, `jeloltek`, `orszagSzin`, `szinSkala`, `SKALA_SZINEK`, `TERKEP_SZINEK`, `REGIOK`. |
| `app/(app)/terkep/components/useVilagAtlasz.ts` | új | A world-atlas 110m poligonjai egyszer, dinamikus importtal. |
| `app/(app)/terkep/components/RegioGombok.tsx` | új | Régió-gyorsválasztó gombsor. |
| `app/(app)/terkep/components/TerkepTooltip.tsx` | új | A lebegtetett ország tooltipje. |
| `app/(app)/terkep/components/Jelmagyarazat.tsx` | új | Lebegő jelmagyarázat-kártya (gradiens vagy kategória-lista). |
| `app/(app)/terkep/components/VilagTerkep.tsx` | új | SVG-térkép, zoom, hover, vezérlők; `TerkepRetegek` memo-komponens a poligonokhoz és pinekhez. |
| `app/(app)/terkep/components/useTerkepAllapot.ts` | új | `kod`, `vs`, `mutato`, `iparag` állapot és műveletek; `VS_MAX`. |
| `app/(app)/terkep/components/OsszehasonlitasCsik.tsx` | új | Chipek + „Összehasonlítás (n)" gomb. |
| `app/(app)/terkep/components/RangsorPanel.tsx` | új | Rangsor (számszerű) vagy csoportosított lista (kategorikus), a `TerkepUres` helyett. |
| `app/(app)/terkep/components/OsszehasonlitasPanel.tsx` | új | 2–4 ország összehasonlító táblája a térkép alatt, teljes szélességben. |
| `app/(app)/terkep/components/ProfilKivonat.tsx` | módosít | Mutató-sor, „Összehasonlításhoz" gomb. |
| `app/(app)/terkep/components/TerkepPanel.tsx` | új | Jobb panel: kivonat / rangsor váltás + csík. |
| `app/(app)/terkep/components/TerkepNezet.tsx` | átír | Fejléc (Mutató + Iparág select, Saját országprofil), térkép, jobb panel, alatta az összehasonlító tábla. |
| `app/(app)/terkep/components/TerkepUres.tsx` | töröl | Helyette `RangsorPanel`. |
| `components/WorldMap.tsx`, `public/tet-world-map.js` | töröl | Helyette `VilagTerkep`. |
| `CLAUDE.md`, `README.md` | módosít | Térkép bekezdés, route-leírás, felépítés-lista. |

---

### Task 0: Branch

- [ ] **Step 1: Branch nyitása a main-ből**

```bash
git checkout -b terkep-atalakitas main
```

Expected: `Switched to a new branch 'terkep-atalakitas'`. (A `components/riport/RiportForm.tsx` módosítása a munkafában marad; ne nyúlj hozzá.)

---

### Task 1: Csomagok és a `TerkepOrszag` bővítése

**Files:**
- Modify: `package.json` (npm install-lal)
- Modify: `db/queries/orszagprofil.ts:97-113` (interface) és `:162-175` (az `eredmeny.push`)

- [ ] **Step 1: Csomagok telepítése**

```bash
npm install d3-geo@3.1.1 d3-zoom@3.0.0 d3-selection@3.0.0 d3-transition@3.0.1 d3-scale@4.0.2 d3-interpolate@3.0.1 topojson-client@3.1.0 world-atlas@2.0.2
npm install -D @types/d3-geo@3.1.1 @types/d3-zoom@3.0.8 @types/d3-selection@3.0.11 @types/d3-transition@3.0.9 @types/d3-scale@4.0.9 @types/d3-interpolate@3.0.4 @types/topojson-client@3.1.5 @types/topojson-specification@1.0.5 @types/geojson@7946.0.16
ls node_modules/world-atlas/countries-110m.json
```

Expected: a `package.json` `dependencies`/`devDependencies` bővül, a `countries-110m.json` létezik (~108 KB).

- [ ] **Step 2: `TerkepOrszag` két új mezője**

A `db/queries/orszagprofil.ts` import-blokkjában a `type Iparag` mellé vedd fel a `type KfiPrioritas` típust:

```ts
import {
  BLOKK_KULCSOK, normalizalBlokk, profilAllapot,
  type Alapadatok, type Allapot, type BlokkKulcs, type Iparag, type KfiPrioritas, type ProfilBlokkok,
} from '../../lib/orszagprofil-szotar';
```

Az interface-ben az `iparagak: Iparag[];` sor után:

```ts
  iparagak: Iparag[];
  /** K+F ráfordítás a GDP %-ában (KFI-blokk), ha a blokk mentett. */
  gerd: number | null;
  /** KFI-prioritások (KFI-blokk) az összehasonlító táblához; nem mentett blokknál üres. */
  prioritasok: KfiPrioritas[];
```

Az `eredmeny.push({ ... })`-ban az `iparagak:` sor után:

```ts
      iparagak: prof?.blokkok.kfiRendszer?.kiemeltIparagak ?? [],
      gerd: prof?.blokkok.kfiRendszer?.gerd ?? null,
      prioritasok: prof?.blokkok.kfiRendszer?.prioritasok ?? [],
```

- [ ] **Step 3: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: 0 hiba.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json db/queries/orszagprofil.ts
git commit -m "feat(terkep): d3/topojson/world-atlas csomagok, TerkepOrszag gerd és prioritasok

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: `lib/terkep-mutatok.ts`

**Files:**
- Create: `lib/terkep-mutatok.ts`
- Create (eldobható, nem commitolt): `scripts/_proba-terkep-mutatok.ts`

- [ ] **Step 1: A modul megírása**

```ts
/**
 * A térkép-oldal mutatói (színezés, rangsor, összehasonlítás), a színskála, a térkép fix
 * színei és a régió-gyorsválasztó. Framework-mentes: a TerkepOrszag csak típusként jön a
 * server-only query-modulból; a d3-scale/d3-interpolate tiszta függvénykönyvtár, DOM nélkül.
 * A függvények a kapott `TerkepOrszag` példányokat adják vissza (a `listTerkepAdat` cache-elt,
 * megosztott objektumait): egyik sem mutálja a bemenetet, és a hívó se tegye.
 */
import { interpolateLab, piecewise } from 'd3-interpolate';
import { scaleLinear, scaleSymlog } from 'd3-scale';
import { formatSzam } from './szam';
import type { TerkepOrszag } from '../db/queries/orszagprofil';
import { ALLAPOTOK, ALLAPOT_CIMKE, ALLAPOT_SZINEK, BLOKK_KULCSOK, IPARAGAK, IPARAG_SZINEK } from './orszagprofil-szotar';

export const MUTATO_KULCSOK = [
  'iparag', 'allapot',
  'gdpEgyFore', 'gdp', 'gdpNovekedes', 'lakossag', 'gerd', 'kitoltottseg', 'rendezvenyDb',
] as const;
export type MutatoKulcs = (typeof MUTATO_KULCSOK)[number];

export interface SzamMutato {
  kulcs: MutatoKulcs;
  tipus: 'szam';
  /** Rövid felirat egység nélkül; az egységet az `utotag` viszi. */
  cimke: string;
  /** Közvetlenül a szám után (pl. ' %'); a formatSzam második paramétere. */
  utotag: string;
  /** `log`: nagyságrendeket átfogó mutató (GDP, lakosság) – a szín és a rangsor-sáv symlog skálán. */
  skala: 'linearis' | 'log';
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
  /** A null (vagy a `sorrend`-ben nem szereplő) kategória csoportjának felirata. */
  nincsCimke: string;
}
export type Mutato = SzamMutato | KategoriaMutato;

/** Az iparágnál a kategória neve maga a felirat; az egységes `cimkek` mező kedvéért azonosság-térkép. */
const IPARAG_CIMKEK: Record<string, string> = Object.fromEntries(IPARAGAK.map((i) => [i, i]));

/** Kulcsonként egy mutató; a kimerítő kulcs-térkép miatt egy kihagyott kulcs fordítási hiba. */
const MUTATO_TABLA: { [K in MutatoKulcs]: Mutato & { kulcs: K } } = {
  iparag: {
    kulcs: 'iparag', tipus: 'kategoria', cimke: 'Kiemelt iparág',
    kategoria: (o) => o.iparagak[0] ?? null,
    sorrend: IPARAGAK, szinek: IPARAG_SZINEK, cimkek: IPARAG_CIMKEK, csakHasznalt: true,
    nincsCimke: 'nincs kiemelt iparág',
  },
  allapot: {
    kulcs: 'allapot', tipus: 'kategoria', cimke: 'Profil állapota',
    kategoria: (o) => o.allapot,
    sorrend: ALLAPOTOK, szinek: ALLAPOT_SZINEK, cimkek: ALLAPOT_CIMKE, csakHasznalt: false,
    nincsCimke: 'nincs adat',
  },
  gdpEgyFore: { kulcs: 'gdpEgyFore', tipus: 'szam', cimke: 'Egy főre jutó GDP', utotag: ' USD', skala: 'log', ertek: (o) => o.alapadatok?.gdpEgyFore ?? null },
  gdp: { kulcs: 'gdp', tipus: 'szam', cimke: 'GDP', utotag: ' mrd USD', skala: 'log', ertek: (o) => o.alapadatok?.gdp ?? null },
  gdpNovekedes: { kulcs: 'gdpNovekedes', tipus: 'szam', cimke: 'GDP-növekedés', utotag: ' %', skala: 'linearis', ertek: (o) => o.alapadatok?.gdpNovekedes ?? null },
  lakossag: { kulcs: 'lakossag', tipus: 'szam', cimke: 'Lakosság', utotag: ' fő', skala: 'log', ertek: (o) => o.alapadatok?.lakossag ?? null },
  gerd: { kulcs: 'gerd', tipus: 'szam', cimke: 'K+F ráfordítás (GERD)', utotag: ' %', skala: 'linearis', ertek: (o) => o.gerd },
  kitoltottseg: {
    kulcs: 'kitoltottseg', tipus: 'szam', cimke: 'Kitöltöttség (mentett blokk)', utotag: `/${BLOKK_KULCSOK.length}`, skala: 'linearis',
    ertek: (o) => (o.allapot === 'nincs' ? null : o.mentettDb),
  },
  rendezvenyDb: {
    kulcs: 'rendezvenyDb', tipus: 'szam', cimke: 'Rendezvények száma', utotag: '', skala: 'linearis',
    ertek: (o) => (o.allapot === 'nincs' ? null : o.rendezvenyDb),
  },
};

/** A mutatók a `MUTATO_KULCSOK` sorrendjében (a Select és az összehasonlító tábla sorrendje). */
export const MUTATOK: readonly Mutato[] = MUTATO_KULCSOK.map((k) => MUTATO_TABLA[k]);
export const SZAM_MUTATOK: readonly SzamMutato[] = MUTATOK.filter((m): m is SzamMutato => m.tipus === 'szam');
export const KATEGORIA_MUTATOK: readonly KategoriaMutato[] = MUTATOK.filter((m): m is KategoriaMutato => m.tipus === 'kategoria');

export const ALAP_MUTATO: MutatoKulcs = 'iparag';

function isMutatoKulcs(v: string): v is MutatoKulcs {
  return (MUTATO_KULCSOK as readonly string[]).includes(v);
}

/** Ismeretlen kulcsra az alapértelmezett mutatót adja (a hívónak nem kell külön kezelnie). */
export function mutatoByKulcs(k: string): Mutato {
  return isMutatoKulcs(k) ? MUTATO_TABLA[k] : MUTATO_TABLA[ALAP_MUTATO];
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

/**
 * „3,3 % · 1./14": az érték az utótaggal, mellette a helyezés, ha az ország a (szűrt) rangsorban
 * szerepel; null = nincs érték. A térkép tooltipje és a kivonat ugyanezt írja.
 */
export function ertekEsHely(o: TerkepOrszag, m: SzamMutato, r: Rangsor | null): string | null {
  const v = m.ertek(o);
  if (v === null) return null;
  const sor = r?.sorok.find((s) => s.o.kod === o.kod);
  return `${formatSzam(v, m.utotag)}${sor && r ? ` · ${sor.hely}./${r.sorok.length}` : ''}`;
}

export interface Csoport { kategoria: string | null; cimke: string; szin: string; orszagok: TerkepOrszag[] }

/**
 * A szűrt országok kategóriánként a mutató `sorrend`-je szerint, végül a kategória nélküliek
 * (a null és a `sorrend`-ben nem szereplő kategória is ide kerül – ugyanúgy, ahogy az
 * `orszagSzin` is a semleges színt adja rá).
 */
export function csoportok(adatok: readonly TerkepOrszag[], m: KategoriaMutato, iparag: string): Csoport[] {
  const vodrok = new Map<string, TerkepOrszag[]>(m.sorrend.map((k) => [k, []]));
  const nincs: TerkepOrszag[] = [];
  for (const o of szures(adatok, iparag).sort(nevSzerint)) {
    const k = m.kategoria(o);
    const vodor = k === null ? undefined : vodrok.get(k);
    if (vodor) vodor.push(o);
    else nincs.push(o);
  }
  const eredmeny: Csoport[] = [];
  for (const k of m.sorrend) {
    const orszagok = vodrok.get(k) ?? [];
    if (m.csakHasznalt && orszagok.length === 0) continue;
    eredmeny.push({ kategoria: k, cimke: m.cimkek[k] ?? k, szin: m.szinek[k] ?? TERKEP_SZINEK.semleges, orszagok });
  }
  if (nincs.length > 0) eredmeny.push({ kategoria: null, cimke: m.nincsCimke, szin: TERKEP_SZINEK.semleges, orszagok: nincs });
  return eredmeny;
}

export interface Tartomany { min: number; max: number }

/** Az ÖSSZES (szűretlen) adattal rendelkező ország min–max-a – a színskála tartománya; nincs adat → null. */
export function tartomany(adatok: readonly TerkepOrszag[], m: SzamMutato): Tartomany | null {
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

/**
 * Az érték 0–1 helye a tartományon belül a mutató skálája szerint (lineáris vagy symlog),
 * a tartományra vágva; min === max esetén mindenre 0,5. A szín (`szinSkala`) és a rangsor
 * sávja ugyanezt használja, hogy a kettő együtt mozogjon.
 */
export function arany(m: SzamMutato, t: Tartomany): (v: number) => number {
  if (t.min === t.max) return () => 0.5;
  if (m.skala === 'log') {
    const s = scaleSymlog().domain([t.min, t.max]).range([0, 1]).clamp(true);
    return (v) => s(v);
  }
  const s = scaleLinear().domain([t.min, t.max]).range([0, 1]).clamp(true);
  return (v) => s(v);
}

export const SKALA_SZINEK = ['#e3f1ec', '#8fcbbd', '#2f9a82', '#0f6b57', '#053f33'] as const;
const SKALA_INTERPOLATOR = piecewise(interpolateLab, [...SKALA_SZINEK]);

/** Folytonos zöld szín a tartományon belül (az `arany` szerint); mindig `rgb(r, g, b)` alakban. */
export function szinSkala(m: SzamMutato, t: Tartomany): (v: number) => string {
  const a = arany(m, t);
  return (v) => SKALA_INTERPOLATOR(a(v));
}

export const TERKEP_SZINEK = {
  ocean: '#f4f7fb',
  gombKontur: '#dde1e7',
  racs: '#e7ebf1',
  /** Poszt nélküli ország. */
  szarazfold: '#e6eaef',
  hatar: '#ffffff',
  /** Az iparág-szűrő által kizárt posztos ország – a szárazföldnél érezhetően sötétebb, hogy elváljon tőle. */
  halvany: '#ced5dd',
  /** Kategória nélküli (pl. nincs kiemelt iparág). */
  semleges: '#5f6b7a',
  /** A sraffozás csíkja (számszerű mutató, nincs érték). */
  nincsAdat: '#c5ccd6',
  kontur: '#10151d',
} as const;

/**
 * Egy posztos ország kitöltési színe. `null` = számszerű mutató érték nélkül (a térképen
 * sraffozás, a pinen `nincsAdat`). A `skala` a `szinSkala(m, tartomany)` eredménye, vagy null,
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
```

- [ ] **Step 2: Eldobható próba-script (nem commitoljuk)**

`scripts/_proba-terkep-mutatok.ts` (a `TerkepOrszag` típus csak `import type`, ezért sima `npx tsx` futtatja, nem kell `--conditions=react-server`):

```ts
import assert from 'node:assert/strict';
import type { TerkepOrszag } from '../db/queries/orszagprofil';
import type { Iparag } from '../lib/orszagprofil-szotar';
import {
  arany, csoportok, jeloltek, KATEGORIA_MUTATOK, MUTATO_KULCSOK, MUTATOK, mutatoByKulcs, orszagSzin, rangsor,
  SZAM_MUTATOK, szinSkala, szures, tartomany, TERKEP_SZINEK, type KategoriaMutato, type SzamMutato,
} from '../lib/terkep-mutatok';

function o(kod: string, nev: string, r: Partial<TerkepOrszag> = {}): TerkepOrszag {
  return {
    kod, nev, geo: nev, lonlat: [0, 0], attase: null, poszt: null, ev: 2026, allapot: 'friss',
    iparagak: [], osszegzes: '', frissitve: null, frissitveMs: null, alapadatok: null,
    mentettDb: 0, rendezvenyDb: 0, gerd: null, prioritasok: [], ...r,
  };
}
const gerd = mutatoByKulcs('gerd') as SzamMutato;
const lakossag = mutatoByKulcs('lakossag') as SzamMutato;
const iparag = mutatoByKulcs('iparag') as KategoriaMutato;
const allapot = mutatoByKulcs('allapot') as KategoriaMutato;
const adatok = [
  o('IL', 'Izrael', { gerd: 5.6, iparagak: ['Biotechnológia és gyógyszeripar'] }),
  o('JP', 'Japán', { gerd: 3.3, iparagak: ['Mesterséges intelligencia és adatgazdaság', 'Űripar'] }),
  o('KR', 'Dél-Korea', { gerd: 3.3, iparagak: ['Mesterséges intelligencia és adatgazdaság'] }),
  o('DE', 'Németország', { gerd: 3.1 }),
  o('VN', 'Vietnám', { allapot: 'nincs', ev: null }),
];

// Tábla és listák
assert.deepEqual(MUTATOK.map((m) => m.kulcs), [...MUTATO_KULCSOK]);
assert.equal(SZAM_MUTATOK.length, 7);
assert.equal(KATEGORIA_MUTATOK.length, 2);
assert.equal(mutatoByKulcs('nincs-ilyen').kulcs, 'iparag');
assert.equal(gerd.cimke, 'K+F ráfordítás (GERD)');
assert.equal((mutatoByKulcs('gdp') as SzamMutato).utotag, ' mrd USD');
assert.equal((mutatoByKulcs('gdp') as SzamMutato).skala, 'log');
assert.equal(gerd.skala, 'linearis');

// Rangsor
const r = rangsor(adatok, gerd, '');
assert.deepEqual(r.sorok.map((s) => [s.o.kod, s.hely]), [['IL', 1], ['KR', 2], ['JP', 2], ['DE', 4]]);
assert.deepEqual(r.adatNelkul.map((x) => x.kod), ['VN']);
const rSzurt = rangsor(adatok, gerd, 'Mesterséges intelligencia és adatgazdaság');
assert.deepEqual(rSzurt.sorok.map((s) => s.o.kod), ['KR', 'JP']);
assert.equal(szures(adatok, 'Űripar').length, 1);

// Tartomány
assert.deepEqual(tartomany(adatok, gerd), { min: 3.1, max: 5.6 });
assert.equal(tartomany([o('X', 'X')], gerd), null);

// Csoportok (sorrend: IPARAGAK; ismeretlen kategória a „nincs" csoportba)
const cs = csoportok(adatok, iparag, '');
assert.deepEqual(cs.map((c) => [c.cimke, c.orszagok.map((x) => x.kod)]), [
  ['Mesterséges intelligencia és adatgazdaság', ['KR', 'JP']],
  ['Biotechnológia és gyógyszeripar', ['IL']],
  ['nincs kiemelt iparág', ['DE', 'VN']],
]);
const csIsmeretlen = csoportok([o('XX', 'Xföld', { iparagak: ['Nem létező' as Iparag] })], iparag, '');
assert.deepEqual(csIsmeretlen.map((c) => [c.kategoria, c.orszagok.length]), [[null, 1]]);
const csA = csoportok(adatok, allapot, '');
assert.deepEqual(csA.map((c) => [c.kategoria, c.orszagok.length]), [['friss', 4], ['elavult', 0], ['nincs', 1]]);

// Arány és színskála
assert.equal(arany(gerd, { min: 0, max: 10 })(5), 0.5);
assert.equal(arany(gerd, { min: 2, max: 2 })(2), 0.5);
assert.equal(arany(gerd, { min: 0, max: 10 })(50), 1);
const aLog = arany(lakossag, { min: 1e6, max: 1e9 })(1e7);
assert.ok(Math.abs(aLog - 1 / 3) < 0.01, `symlog arány: ${aLog}`);
const skala = szinSkala(gerd, { min: 3.1, max: 5.6 });
assert.equal(szinSkala(gerd, { min: 2, max: 2 })(2), 'rgb(47, 154, 130)');
assert.equal(skala(3.1), 'rgb(227, 241, 236)');
assert.notEqual(skala(3.1), skala(5.6));
assert.equal(orszagSzin(adatok[4], gerd, '', skala), null);
assert.equal(orszagSzin(adatok[0], gerd, 'Űripar', skala), TERKEP_SZINEK.halvany);
assert.equal(TERKEP_SZINEK.halvany, '#ced5dd');
assert.equal(orszagSzin(adatok[3], iparag, '', null), TERKEP_SZINEK.semleges);
assert.equal(orszagSzin(adatok[0], allapot, '', null), '#2f7d32');

// Jelöltek
assert.deepEqual(jeloltek(adatok, ['IL'], gerd).map((x) => x.kod), ['KR', 'JP', 'DE', 'VN']);
assert.deepEqual(jeloltek(adatok, [], iparag).map((x) => x.kod), ['KR', 'IL', 'JP', 'DE', 'VN']);
console.log('OK');
```

Run: `npx tsx scripts/_proba-terkep-mutatok.ts`
Expected: `OK`. (A `csoportok` az `iparag` mutatónál az `IPARAGAK` sorrendjét követi: MI előbb van, mint a Biotechnológia. A `jeloltek` kategorikusnál magyar név szerint rendez: Dél-Korea, Izrael, Japán, Németország, Vietnám. A symlog arány 1e6–1e9 között 1e7-re ≈ 1/3.)

- [ ] **Step 3: Típusellenőrzés, a próba-script törlése**

Run: `npx tsc --noEmit && rm scripts/_proba-terkep-mutatok.ts`
Expected: 0 hiba.

- [ ] **Step 4: Commit**

```bash
git add lib/terkep-mutatok.ts
git commit -m "feat(terkep): mutató-szótár, rangsor, csoportok, színskála és régiók (lib/terkep-mutatok)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Atlasz-hook, régió-gombok, tooltip, jelmagyarázat

**Files:**
- Create: `app/(app)/terkep/components/useVilagAtlasz.ts`
- Create: `app/(app)/terkep/components/RegioGombok.tsx`
- Create: `app/(app)/terkep/components/TerkepTooltip.tsx`
- Create: `app/(app)/terkep/components/Jelmagyarazat.tsx`
- Modify: `lib/orszagok.ts` (`geoNev` helper a poszt nélküli poligonok magyar nevéhez)

- [ ] **Step 1: `useVilagAtlasz.ts`**

```ts
'use client';

import { useEffect, useState } from 'react';
import type { Feature, Geometry } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';

export type OrszagFeature = Feature<Geometry, { name: string }>;

type Atlasz = Topology<{ countries: GeometryCollection<{ name: string }> }>;

// Modulszintű promise: a world-atlas chunk és a TopoJSON → GeoJSON átalakítás egyszer fut,
// minden hívó ugyanazt a tömböt kapja. Hiba után nullázzuk, hogy a következő mount újrapróbálja.
let atlaszPromise: Promise<OrszagFeature[]> | null = null;

function betolt(): Promise<OrszagFeature[]> {
  if (!atlaszPromise) {
    atlaszPromise = Promise.all([import('world-atlas/countries-110m.json'), import('topojson-client')])
      .then(([topo, tc]) => {
        const t = topo.default as unknown as Atlasz;
        return tc.feature(t, t.objects.countries).features;
      });
    atlaszPromise.catch(() => { atlaszPromise = null; });
  }
  return atlaszPromise;
}

/**
 * A world-atlas 110m országpoligonjai; `feats` null, amíg töltődik, `hiba` true, ha a chunk nem jött be.
 * A visszaadott tömb modulszinten megosztott (minden hívó ugyanazt kapja): ne mutáld.
 */
export function useVilagAtlasz(): { feats: OrszagFeature[] | null; hiba: boolean } {
  const [feats, setFeats] = useState<OrszagFeature[] | null>(null);
  const [hiba, setHiba] = useState(false);
  useEffect(() => {
    let aktiv = true;
    betolt().then(
      (f) => { if (aktiv) setFeats(f); },
      () => { if (aktiv) setHiba(true); },
    );
    return () => { aktiv = false; };
  }, []);
  return { feats, hiba };
}
```

Ha a `tsc` a JSON-import típusára panaszkodik (`Cannot find module 'world-atlas/countries-110m.json'`), hozz létre `types/world-atlas.d.ts`-t `declare module 'world-atlas/*.json' { const v: unknown; export default v; }` tartalommal (a `tsconfig.json` `**/*.ts` include-ja felveszi), és ezt is add a commithoz.

- [ ] **Step 2: `RegioGombok.tsx`**

```tsx
'use client';

import { Button } from '../../../../components/ui/button';
import { REGIOK } from '../../../../lib/terkep-mutatok';

/** Régió-gyorsválasztó a térkép bal felső sarkában; az aktív gomb `aria-pressed`. */
export function RegioGombok({ aktiv, onValaszt }: { aktiv: string | null; onValaszt: (kulcs: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="Régió">
      {REGIOK.map((r) => (
        <Button
          key={r.kulcs}
          type="button"
          size="xs"
          variant={aktiv === r.kulcs ? 'default' : 'outline'}
          aria-pressed={aktiv === r.kulcs}
          onClick={() => onValaszt(r.kulcs)}
        >
          {r.cimke}
        </Button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: `TerkepTooltip.tsx`**

```tsx
'use client';

import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { ALLAPOT_CIMKE } from '../../../../lib/orszagprofil-szotar';
import { ertekEsHely, type Mutato, type Rangsor } from '../../../../lib/terkep-mutatok';

/**
 * A lebegtetett poligon/pin: `o` null, ha poszt nélküli ország; x/y a térkép-konténerhez képest,
 * `magassag` a konténer magassága (a lefelé fordításhoz).
 */
export interface HoverAllapot { nev: string; o: TerkepOrszag | null; x: number; y: number; magassag: number }

/** A mutató sora: számszerűnél érték + helyezés (ha a rangsorban van), kategorikusnál a kategória. */
function mutatoSor(o: TerkepOrszag, mutato: Mutato, rangsor: Rangsor | null): string | null {
  if (mutato.tipus === 'szam') {
    return `${mutato.cimke}: ${ertekEsHely(o, mutato, rangsor) ?? 'nincs adat'}`;
  }
  if (mutato.kulcs === 'allapot') return null; // az állapot-sor úgyis ott van
  const k = mutato.kategoria(o);
  return k === null ? mutato.nincsCimke : (mutato.cimkek[k] ?? k);
}

export function TerkepTooltip({ hover, mutato, rangsor }: { hover: HoverAllapot; mutato: Mutato; rangsor: Rangsor | null }) {
  const { o } = hover;
  const sor = o ? mutatoSor(o, mutato, rangsor) : null;
  // A kártya `overflow-hidden`, ezért a tooltip arra az oldalra kerül, ahol több a hely: a kurzor
  // fölé, ha ott legalább annyi hely van, mint alatta, különben alá.
  const lent = hover.magassag - hover.y > hover.y;
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 max-w-60 rounded-md bg-foreground px-2.5 py-2 text-[11px] leading-snug text-background shadow-lg"
      style={lent
        ? { left: hover.x, top: hover.y + 16, transform: 'translate(-50%, 0)' }
        : { left: hover.x, top: hover.y - 12, transform: 'translate(-50%, -100%)' }}
    >
      <p className="mb-0.5 text-xs font-semibold">{hover.nev}</p>
      {o ? (
        <>
          <p className="text-background/70">{o.attase ?? 'nincs aktív attasé'}{o.poszt?.fovaros ? ` · ${o.poszt.fovaros}` : ''}</p>
          {sor && <p className="text-background/70">{sor}</p>}
          <p className="text-background/70">{ALLAPOT_CIMKE[o.allapot]}{o.ev ? ` · ${o.ev}` : ''}</p>
          {o.iparagak.length > 0 && <p className="text-background/70">Kiemelt: {o.iparagak.slice(0, 2).join(', ')}</p>}
        </>
      ) : (
        <p className="text-background/70">Nincs kihelyezett TéT attasé</p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: `Jelmagyarazat.tsx`**

```tsx
'use client';

import { formatSzam } from '../../../../lib/szam';
import { SKALA_SZINEK, TERKEP_SZINEK, type Csoport, type Mutato, type Tartomany } from '../../../../lib/terkep-mutatok';

// Inline style szándékosan: a színek a térképpel közös szótárból (TERKEP_SZINEK, SKALA_SZINEK) jönnek.
// A sraffozás iránya és sűrűsége a térkép <pattern>-jével azonos: 2 px csík 6 px-enként, „/" irányban.
function Negyzet({ szin, sraff, keret }: { szin?: string; sraff?: boolean; keret?: boolean }) {
  return (
    <i
      aria-hidden
      className="inline-block size-2.5 shrink-0 rounded-[2px]"
      style={{
        backgroundColor: sraff ? undefined : szin,
        backgroundImage: sraff
          ? `repeating-linear-gradient(135deg, ${TERKEP_SZINEK.nincsAdat} 0 2px, ${TERKEP_SZINEK.szarazfold} 2px 6px)`
          : undefined,
        border: keret || sraff ? `1px solid ${TERKEP_SZINEK.gombKontur}` : undefined,
      }}
    />
  );
}

/**
 * Jelmagyarázat a térkép alatt, normál folyásban (nem lebegő kártya, hogy ne takarja a térkép
 * bal alsó sarkát): gradiens + min/max (számszerű) vagy kategória-lista.
 */
export function Jelmagyarazat({ mutato, tartomany, csoportok, iparag }: {
  mutato: Mutato;
  /** Csak számszerű mutatónál; null, ha egyetlen ország sem ad értéket. */
  tartomany: Tartomany | null;
  /** Csak kategorikus mutatónál (a szűrt, használt kategóriák). */
  csoportok: Csoport[];
  /** Az aktív iparág-szűrő ('' = nincs); ha van, a kizárt posztos ország halvány színe is szerepel. */
  iparag: string;
}) {
  const kozos = (
    <>
      {iparag && <span className="flex items-center gap-1.5"><Negyzet szin={TERKEP_SZINEK.halvany} /> nem felel meg a szűrőnek</span>}
      <span className="flex items-center gap-1.5"><Negyzet szin={TERKEP_SZINEK.szarazfold} keret /> nincs poszt</span>
    </>
  );
  return (
    <div role="group" aria-label="Jelmagyarázat" className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t px-3 py-2 text-[11px] text-muted-foreground">
      {mutato.tipus === 'szam' ? (
        <>
          <span className="font-semibold text-foreground">
            {mutato.cimke}
            {mutato.skala === 'log' && <span className="ml-1 font-normal text-muted-foreground">(logaritmikus skála)</span>}
          </span>
          {tartomany && (
            <span className="flex min-w-0 items-center gap-2 font-mono">
              <span>{formatSzam(tartomany.min, mutato.utotag)}</span>
              <span className="h-2 w-32 shrink rounded-sm" style={{ background: `linear-gradient(90deg, ${SKALA_SZINEK.join(', ')})` }} />
              <span>{formatSzam(tartomany.max, mutato.utotag)}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5"><Negyzet sraff /> nincs adat</span>
          {kozos}
        </>
      ) : (
        <>
          <span className="font-semibold text-foreground">{mutato.cimke}</span>
          {csoportok.map((cs) => (
            <span key={cs.kategoria ?? '__nincs'} className="flex items-center gap-1.5"><Negyzet szin={cs.szin} /> {cs.cimke}</span>
          ))}
          {kozos}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4b: `geoNev()` a `lib/orszagok.ts`-ben**

Az `orszagNev()` után (az `ORSZAGOK` deklarációja alatt):

```ts
const NEV_GEO_SZERINT: ReadonlyMap<string, string> = new Map(ORSZAGOK.filter((o) => o.geo).map((o) => [o.geo, o.nev] as const));

/**
 * A world-atlas térképnév (`properties.name`) magyar neve a szótárból – a térkép poszt nélküli
 * poligonjainak tooltipjéhez. Ha a szótárban nincs ilyen ország (pl. Grönland, Antarktisz),
 * maga a térképnév.
 */
export function geoNev(geo: string): string {
  return NEV_GEO_SZERINT.get(geo) ?? geo;
}
```

A fájl fejléc-kommentjében a `<tet-world-map>` helyett a `VilagTerkep` párosít a `geo` névvel.

- [ ] **Step 5: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: 0 hiba.

- [ ] **Step 6: Commit**

```bash
git add "app/(app)/terkep/components/useVilagAtlasz.ts" "app/(app)/terkep/components/RegioGombok.tsx" "app/(app)/terkep/components/TerkepTooltip.tsx" "app/(app)/terkep/components/Jelmagyarazat.tsx" lib/orszagok.ts
git commit -m "feat(terkep): atlasz-hook, régió-gombok, tooltip és jelmagyarázat komponensek

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

(Ha a Step 1 miatt `types/world-atlas.d.ts` is készült, azt is add hozzá.)

---

### Task 4: `VilagTerkep.tsx` – SVG, zoom, hover

**Files:**
- Create: `app/(app)/terkep/components/VilagTerkep.tsx`

- [ ] **Step 1: A komponens megírása**

```tsx
'use client';

import { geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo';
import { select } from 'd3-selection';
import 'd3-transition';
import { zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { Button } from '../../../../components/ui/button';
import { geoNev } from '../../../../lib/orszagok';
import {
  orszagSzin, REGIOK, szinSkala, TERKEP_SZINEK, type Csoport, type Mutato, type Rangsor, type Tartomany,
} from '../../../../lib/terkep-mutatok';
import { Jelmagyarazat } from './Jelmagyarazat';
import { RegioGombok } from './RegioGombok';
import { TerkepTooltip, type HoverAllapot } from './TerkepTooltip';
import { useVilagAtlasz } from './useVilagAtlasz';

// A térkép: React rendereli az SVG-t, a d3-geo csak a vetületet és a path-okat adja. A zoom
// (d3-zoom) közvetlenül a DOM-on állítja a <g> transformját, a pinek sugarát és a sraffozás
// csempéjének méretét – nem React-állapoton át, hogy görgetésenként ne renderelődjön újra ~180
// path. A poligonok és a pinek egy memo-komponensben (TerkepRetegek) vannak, hogy a tooltip
// (hover-állapot) frissülése se renderelje őket újra. A kontúrok `vector-effect: non-scaling-stroke`,
// hogy nagyításkor ne hízzanak. A jelmagyarázat a térkép ALATT van, normál folyásban (nem lebegő
// kártya): lebegve elnyelte a bal alsó sarok – Dél-Amerika – egérműveleteit.

const W = 960;
const H = 505;
const PIN_R = 5.5;
const PIN_BELSO_R = 1.8;
const ZOOM_MAX = 8;
const SRAFF_ID = 'terkep-sraff';
/** A betöltő/hiba helykitöltő ugyanolyan arányú, mint a kész SVG, így betöltéskor nem ugrik a layout. */
const ARANY = 'aspect-[960/505]';

const proj = geoNaturalEarth1().fitExtent([[6, 6], [W - 6, H - 6]], { type: 'Sphere' });
const path = geoPath(proj);
const GOMB_D = path({ type: 'Sphere' }) ?? '';
const RACS_D = path(geoGraticule10()) ?? '';

interface Poligon { nev: string; d: string }

type HoverFn = (e: ReactPointerEvent<SVGElement>, nev: string, o: TerkepOrszag | null) => void;

/**
 * A régió bbox-ának vetített befoglaló téglalapjára illesztett transzformáció. A `zoom.transform`
 * NEM alkalmazza a d3 constrain-jét és a scaleExtent-et, ezért a k ≥ 1 és a translateExtent
 * ([[0, 0], [W, H]]) korlátját itt tartjuk be – különben a nézet lelógna a térképről, és az első
 * húzásnál ugrana.
 */
function regioTranszform(bbox: [[number, number], [number, number]]): ZoomTransform {
  const [[ny, d], [k, e]] = bbox;
  const pontok: [number, number][] = [
    [ny, d], [k, d], [ny, e], [k, e], [(ny + k) / 2, d], [(ny + k) / 2, e], [ny, (d + e) / 2], [k, (d + e) / 2],
  ];
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const p of pontok) {
    const q = proj(p);
    if (!q) continue;
    x0 = Math.min(x0, q[0]);
    y0 = Math.min(y0, q[1]);
    x1 = Math.max(x1, q[0]);
    y1 = Math.max(y1, q[1]);
  }
  const kk = Math.min(ZOOM_MAX, Math.max(1, 0.9 / Math.max((x1 - x0) / W, (y1 - y0) / H)));
  const tx = Math.min(0, Math.max(W - kk * W, W / 2 - (kk * (x0 + x1)) / 2));
  const ty = Math.min(0, Math.max(H - kk * H, H / 2 - (kk * (y0 + y1)) / 2));
  return zoomIdentity.translate(tx, ty).scale(kk);
}

/** A pin-réteg köreinek sugarát a nagyítás reciprokával állítja, hogy a pin képernyőn állandó méretű maradjon. */
function pinSugar(pinek: SVGGElement, k: number) {
  pinek.querySelectorAll<SVGCircleElement>('circle[data-pin]').forEach((c) => c.setAttribute('r', String(PIN_R / k)));
  pinek.querySelectorAll<SVGCircleElement>('circle[data-pin-belso]').forEach((c) => c.setAttribute('r', String(PIN_BELSO_R / k)));
}

const TerkepRetegek = memo(function TerkepRetegek({
  poligonok, adatok, rekordGeo, szinek, kivalasztott, osszehasonlitas, onHover, onSelect,
}: {
  poligonok: Poligon[];
  adatok: TerkepOrszag[];
  rekordGeo: Map<string, TerkepOrszag>;
  /** kód → kitöltési szín; null = sraffozás (számszerű mutató érték nélkül). */
  szinek: Map<string, string | null>;
  kivalasztott: string | null;
  osszehasonlitas: readonly string[];
  onHover: HoverFn;
  onSelect: (kod: string) => void;
}) {
  // A kijelölt ország a végére kerül (a szomszéd kontúrja ne takarja), előtte az összehasonlítottak.
  const rendezett = useMemo(() => {
    const rang = (p: Poligon) => {
      const o = rekordGeo.get(p.nev);
      return !o ? 0 : o.kod === kivalasztott ? 2 : osszehasonlitas.includes(o.kod) ? 1 : 0;
    };
    return [...poligonok].sort((a, b) => rang(a) - rang(b));
  }, [poligonok, rekordGeo, kivalasztott, osszehasonlitas]);

  return (
    <>
      {rendezett.map((p) => {
        const o = rekordGeo.get(p.nev) ?? null;
        const szin = o ? szinek.get(o.kod) : undefined;
        const kijelolt = !!o && o.kod === kivalasztott;
        const vsben = !!o && !kijelolt && osszehasonlitas.includes(o.kod);
        return (
          <path
            key={p.nev}
            d={p.d}
            fill={!o ? TERKEP_SZINEK.szarazfold : szin === null ? `url(#${SRAFF_ID})` : szin}
            stroke={kijelolt || vsben ? TERKEP_SZINEK.kontur : TERKEP_SZINEK.hatar}
            strokeWidth={kijelolt ? 1.8 : vsben ? 1.2 : 0.5}
            vectorEffect="non-scaling-stroke"
            className={o ? 'cursor-pointer' : undefined}
            onPointerMove={(e) => onHover(e, o?.nev ?? geoNev(p.nev), o)}
            onClick={o ? () => onSelect(o.kod) : undefined}
          />
        );
      })}
      {/* Külön réteg, hogy a zoom-kezelő csak ezt pásztázza a sugarak állításához. */}
      <g data-pinek="">
        {adatok.map((o) => {
          const p = proj(o.lonlat);
          if (!p) return null;
          const kijelolt = o.kod === kivalasztott;
          return (
            <g
              key={o.kod}
              transform={`translate(${p[0]},${p[1]})`}
              className="cursor-pointer"
              onPointerMove={(e) => onHover(e, o.nev, o)}
              onClick={() => onSelect(o.kod)}
            >
              <circle
                data-pin=""
                r={PIN_R}
                fill={szinek.get(o.kod) ?? TERKEP_SZINEK.nincsAdat}
                stroke={kijelolt ? TERKEP_SZINEK.kontur : TERKEP_SZINEK.hatar}
                strokeWidth={kijelolt ? 2 : 1.4}
                vectorEffect="non-scaling-stroke"
              />
              <circle data-pin-belso="" r={PIN_BELSO_R} fill={TERKEP_SZINEK.hatar} />
            </g>
          );
        })}
      </g>
    </>
  );
});

export function VilagTerkep({
  adatok, mutato, iparag, kivalasztott, osszehasonlitas, tartomany, csoportok, rangsor, onSelect,
}: {
  adatok: TerkepOrszag[];
  mutato: Mutato;
  iparag: string;
  kivalasztott: string | null;
  osszehasonlitas: readonly string[];
  tartomany: Tartomany | null;
  csoportok: Csoport[];
  rangsor: Rangsor | null;
  onSelect: (kod: string) => void;
}) {
  const { feats, hiba } = useVilagAtlasz();
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const patternRef = useRef<SVGPatternElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const kRef = useRef(1);
  const [regio, setRegio] = useState<string | null>('vilag');
  const [hover, setHover] = useState<HoverAllapot | null>(null);

  const poligonok = useMemo<Poligon[] | null>(
    () => feats?.map((f) => ({ nev: f.properties.name, d: path(f) ?? '' })) ?? null,
    [feats],
  );
  const rekordGeo = useMemo(() => new Map(adatok.filter((o) => o.geo).map((o) => [o.geo, o] as const)), [adatok]);
  const szinek = useMemo(() => {
    const skala = tartomany && mutato.tipus === 'szam' ? szinSkala(mutato, tartomany) : null;
    return new Map(adatok.map((o) => [o.kod, orszagSzin(o, mutato, iparag, skala)] as const));
  }, [adatok, mutato, iparag, tartomany]);

  const pinReteg = () => gRef.current?.querySelector<SVGGElement>('[data-pinek]') ?? null;

  // d3-zoom az <svg>-n; a zoom-esemény a DOM-on dolgozik. Kézi zoom/mozgatás (sourceEvent van)
  // után egyik régió-gomb sem aktív. A clickDistance(4) miatt az apró egérmozgás nem nyeli el a kattintást.
  useEffect(() => {
    const svg = svgRef.current;
    const g = gRef.current;
    if (!svg || !g || !poligonok) return;
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, ZOOM_MAX])
      .translateExtent([[0, 0], [W, H]])
      .clickDistance(4)
      .on('zoom', (e: D3ZoomEvent<SVGSVGElement, unknown>) => {
        const { k } = e.transform;
        kRef.current = k;
        g.setAttribute('transform', e.transform.toString());
        const pinek = pinReteg();
        if (pinek) pinSugar(pinek, k);
        // A sraffozás csempéje a nagyított <g> terében van: 1/k-val visszaskálázva képernyőn állandó marad.
        patternRef.current?.setAttribute('patternTransform', `rotate(45) scale(${1 / k})`);
        if (e.sourceEvent) setRegio(null);
      });
    select(svg).call(z);
    zoomRef.current = z;
    return () => {
      select(svg).on('.zoom', null);
      zoomRef.current = null;
    };
  }, [poligonok]);

  // Új adatnál (évváltás) az újonnan mountolt pinek sugara igazodjon az aktuális nagyításhoz.
  useEffect(() => {
    const pinek = pinReteg();
    if (pinek) pinSugar(pinek, kRef.current);
  }, [adatok]);

  const onHover = useCallback<HoverFn>((e, nev, o) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return;
    // 120 = a tooltip fél szélessége (max-w-60 → 240 px), hogy ne lógjon ki a konténerből.
    const x = Math.min(Math.max(e.clientX - box.left, 120), box.width - 120);
    setHover({ nev, o, x, y: e.clientY - box.top, magassag: box.height });
  }, []);

  const nagyit = (f: number) => {
    const svg = svgRef.current;
    const z = zoomRef.current;
    if (!svg || !z) return;
    setRegio(null); // kézi nagyítás: a régió-keret már nem érvényes
    select(svg).transition().duration(300).call(z.scaleBy, f);
  };
  const regioValaszt = (kulcs: string) => {
    const r = REGIOK.find((x) => x.kulcs === kulcs);
    const svg = svgRef.current;
    const z = zoomRef.current;
    if (!r || !svg || !z) return;
    setRegio(kulcs);
    select(svg).transition().duration(400).call(z.transform, r.bbox ? regioTranszform(r.bbox) : zoomIdentity);
  };

  // A jelmagyarázat a betöltő/hiba állapotban is ott van, hogy a kártya magassága ne ugorjon a térkép beérkezésekor.
  const jelmagyarazat = <Jelmagyarazat mutato={mutato} tartomany={tartomany} csoportok={csoportok} iparag={iparag} />;

  if (hiba) {
    return (
      <div>
        <div className={`flex ${ARANY} items-center justify-center p-6 text-center text-sm text-muted-foreground`}>
          A térkép nem tölthető be.
        </div>
        {jelmagyarazat}
      </div>
    );
  }
  if (!poligonok) {
    return (
      <div>
        <div className={`flex ${ARANY} animate-pulse items-center justify-center text-sm text-muted-foreground`}>
          Térkép betöltése…
        </div>
        {jelmagyarazat}
      </div>
    );
  }
  return (
    <div>
      <div ref={wrapRef} className="relative">
        {/* role="img": a poligonok és pinek a segítő technológiának nem interaktívak – a billentyűzetes egyenértékes a RangsorPanel (minden ország gomb). */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="TéT attasé posztok világtérképe"
          className="block h-auto w-full touch-none select-none"
          onPointerLeave={() => setHover(null)}
        >
          {/* Átlátszó háttér a gömbön kívüli sávnak is: itt is törli a tooltipet (a gyerekek eseményei felülírják). */}
          <rect width={W} height={H} fill="transparent" onPointerMove={() => setHover(null)} />
          <defs>
            <pattern ref={patternRef} id={SRAFF_ID} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" fill={TERKEP_SZINEK.szarazfold} />
              <rect width="2" height="6" fill={TERKEP_SZINEK.nincsAdat} />
            </pattern>
          </defs>
          <g ref={gRef}>
            {/* Az óceán-gömb pointermove-ja törli a tooltipet, ha a kurzor a szárazföldről a tengerre ér. */}
            <path d={GOMB_D} fill={TERKEP_SZINEK.ocean} stroke={TERKEP_SZINEK.gombKontur} strokeWidth={0.8} vectorEffect="non-scaling-stroke" onPointerMove={() => setHover(null)} />
            <path d={RACS_D} fill="none" stroke={TERKEP_SZINEK.racs} strokeWidth={0.5} vectorEffect="non-scaling-stroke" pointerEvents="none" />
            <TerkepRetegek
              poligonok={poligonok}
              adatok={adatok}
              rekordGeo={rekordGeo}
              szinek={szinek}
              kivalasztott={kivalasztott}
              osszehasonlitas={osszehasonlitas}
              onHover={onHover}
              onSelect={onSelect}
            />
          </g>
        </svg>
        <div className="absolute top-2.5 left-2.5">
          <RegioGombok aktiv={regio} onValaszt={regioValaszt} />
        </div>
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1">
          <Button type="button" variant="outline" size="icon-sm" aria-label="Nagyítás" onClick={() => nagyit(1.5)}><Plus /></Button>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Kicsinyítés" onClick={() => nagyit(1 / 1.5)}><Minus /></Button>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Alaphelyzet" onClick={() => regioValaszt('vilag')}><RotateCcw /></Button>
        </div>
        {hover && <TerkepTooltip hover={hover} mutato={mutato} rangsor={rangsor} />}
      </div>
      {jelmagyarazat}
    </div>
  );
}
```

- [ ] **Step 2: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: 0 hiba. Ha a `select(svg).transition()…call(z.scaleBy, f)` típusa nem egyezik (`TransitionLike` vs `Transition`), a hívást így írd: `z.scaleBy(select(svg).transition().duration(300), f)` és `z.transform(select(svg).transition().duration(400), …)` – ugyanaz a hatás, a d3-zoom mindkét formát elfogadja.

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/terkep/components/VilagTerkep.tsx"
git commit -m "feat(terkep): VilagTerkep React-komponens d3-geo vetülettel, zoommal, hoverrel

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: `useTerkepAllapot` és `OsszehasonlitasCsik`

**Files:**
- Create: `app/(app)/terkep/components/useTerkepAllapot.ts`
- Create: `app/(app)/terkep/components/OsszehasonlitasCsik.tsx`

- [ ] **Step 1: `useTerkepAllapot.ts`**

```ts
'use client';

import { useCallback, useState } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { ALAP_MUTATO, mutatoByKulcs, type Mutato, type MutatoKulcs } from '../../../../lib/terkep-mutatok';

/** Ennyi országtól látszik az összehasonlító tábla. */
export const VS_MIN = 2;
/** Legfeljebb ennyi ország lehet az összehasonlításban. */
export const VS_MAX = 4;

export interface TerkepAllapot {
  /** Egyes kijelölés (a kivonat országa). */
  kod: string | null;
  /** Összehasonlítás-halmaz a hozzáadás sorrendjében; ne mutáld. */
  vs: readonly string[];
  /** `vs.length >= VS_MAX` – a hozzáadás-gombok letiltásához. */
  vsTele: boolean;
  mutato: Mutato;
  /** Iparág-szűrő, '' = nincs. */
  iparag: string;
  kivalaszt: (kod: string) => void;
  bezar: () => void;
  setMutatoKulcs: (k: string) => void;
  setIparag: (i: string) => void;
  vsHozzaad: (kod: string) => void;
  vsKivesz: (kod: string) => void;
  /** Hozzáad, ha nincs benne (és van hely); kivesz, ha benne van – a „+"/pipa gombok művelete. */
  vsValt: (kod: string) => void;
  vsTorol: () => void;
}

/**
 * A térkép-oldal kliens-állapota. A jobb panel a hívóban: `kod` → kivonat, különben rangsor; az
 * összehasonlító tábla a térkép alatt jelenik meg, ha `vs.length >= VS_MIN`. Évváltáskor (új `adatok`) a nem
 * létező kijelölés és halmaz-elemek render közben kikerülnek, a `?o=` (kezdoKod) változására a
 * kijelölés frissül, a többi állapot marad – ez a React „prop változásra állapot igazítása" mintája,
 * ezért a page NEM ad `key`-t a nézetnek. A visszaadott objektum renderenként új (nem memoizálható).
 */
export function useTerkepAllapot(adatok: TerkepOrszag[], kezdoKod: string | null): TerkepAllapot {
  const letezik = (k: string) => adatok.some((o) => o.kod === k);
  const [kod, setKod] = useState<string | null>(() => (kezdoKod && letezik(kezdoKod) ? kezdoKod : null));
  const [vs, setVs] = useState<readonly string[]>([]);
  const [mutatoKulcs, setMutatoKulcsState] = useState<MutatoKulcs>(ALAP_MUTATO);
  const [iparag, setIparag] = useState('');

  // Új `?o=` (pl. „Vissza a térképre" a profil oldalról): a kijelölés a kezdő kódra vált; ha a
  // paraméter eltűnik, a meglévő kijelölés marad.
  // `ujKod`: ha ebben a passban épp a kezdő kódra váltunk, a lenti „nem létező kijelölés" őrző már
  // az új értéket nézze, ne a záródásban maradt régit (különben `setKod(null)` felülírná).
  const [elozoKezdo, setElozoKezdo] = useState(kezdoKod);
  let ujKod = kod;
  if (kezdoKod !== elozoKezdo) {
    setElozoKezdo(kezdoKod);
    if (kezdoKod && letezik(kezdoKod)) {
      setKod(kezdoKod);
      ujKod = kezdoKod;
    }
  }
  if (ujKod && !letezik(ujKod)) setKod(null);
  const vsElo = vs.filter(letezik);
  if (vsElo.length !== vs.length) setVs(vsElo);

  const kivalaszt = useCallback((k: string) => setKod(k), []);
  const bezar = useCallback(() => setKod(null), []);
  const setMutatoKulcs = useCallback((k: string) => setMutatoKulcsState(mutatoByKulcs(k).kulcs), []);
  const vsHozzaad = useCallback((k: string) => setVs((v) => (v.includes(k) || v.length >= VS_MAX ? v : [...v, k])), []);
  const vsKivesz = useCallback((k: string) => setVs((v) => v.filter((x) => x !== k)), []);
  const vsValt = useCallback(
    (k: string) => setVs((v) => (v.includes(k) ? v.filter((x) => x !== k) : v.length >= VS_MAX ? v : [...v, k])),
    [],
  );
  const vsTorol = useCallback(() => setVs([]), []);

  return {
    kod, vs, vsTele: vs.length >= VS_MAX, mutato: mutatoByKulcs(mutatoKulcs), iparag,
    kivalaszt, bezar, setMutatoKulcs, setIparag, vsHozzaad, vsKivesz, vsValt, vsTorol,
  };
}
```

- [ ] **Step 2: `OsszehasonlitasCsik.tsx`**

```tsx
'use client';

import { X } from 'lucide-react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { Badge } from '../../../../components/ui/badge';
import { VS_MAX, VS_MIN } from './useTerkepAllapot';

/**
 * A panel tetején: az összehasonlítás-halmaz chipjei és egy állapotszöveg. Az összehasonlító tábla
 * magától megjelenik a térkép alatt, amint VS_MIN ország van a halmazban, ezért itt nincs gomb.
 */
export function OsszehasonlitasCsik({ orszagok, onKivesz }: {
  /** A halmaz rekordjai a hozzáadás sorrendjében. */
  orszagok: TerkepOrszag[];
  onKivesz: (kod: string) => void;
}) {
  const tele = orszagok.length >= VS_MAX;
  // A „+" gombok letiltva, ha tele; a letiltott gombon a title nem jelenik meg, ezért itt a felirat.
  const allapot = tele
    ? `Legfeljebb ${VS_MAX} ország`
    : orszagok.length < VS_MIN
      ? 'Válassz még egy országot'
      : 'A tábla a térkép alatt';
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border bg-muted/40 px-2.5 py-2 text-xs">
      <span className="text-muted-foreground">Összehasonlítás:</span>
      {orszagok.map((o) => (
        // h-6 + overflow-visible: a Badge alapból h-5 és overflow-hidden, ami levágná a gomb fókuszgyűrűjét.
        <Badge key={o.kod} variant="outline" className="h-6 gap-1 overflow-visible bg-background pr-1">
          {o.nev}
          <button
            type="button"
            className="rounded-full p-0.5 outline-none hover:bg-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label={`${o.nev} kivétele`}
            onClick={() => onKivesz(o.kod)}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <span className="ml-auto text-muted-foreground">{allapot}</span>
    </div>
  );
}
```

- [ ] **Step 3: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: 0 hiba.

- [ ] **Step 4: Commit**

```bash
git add "app/(app)/terkep/components/useTerkepAllapot.ts" "app/(app)/terkep/components/OsszehasonlitasCsik.tsx"
git commit -m "feat(terkep): useTerkepAllapot hook és összehasonlítás-csík

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: `RangsorPanel.tsx`

**Files:**
- Create: `app/(app)/terkep/components/RangsorPanel.tsx`

- [ ] **Step 1: A komponens megírása**

```tsx
'use client';

import { Check, Plus } from 'lucide-react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { formatSzam } from '../../../../lib/szam';
import { arany, SKALA_SZINEK, type Csoport, type Mutato, type Rangsor, type Tartomany } from '../../../../lib/terkep-mutatok';

const SAV_SZIN = SKALA_SZINEK[3];
/** A legkisebb érték sávja se tűnjön el: a térképen a minimum is kap (a legvilágosabb) színt. */
const SAV_MIN_SZAZALEK = 2;

function OrszagSor({ o, hely, sav, ertek, benne, vsTele, onKivalaszt, onVsToggle }: {
  o: TerkepOrszag;
  hely?: number;
  /** 0–1, a sáv szélessége; nincs → nincs sáv. */
  sav?: number;
  ertek?: string;
  benne: boolean;
  vsTele: boolean;
  onKivalaszt: (kod: string) => void;
  onVsToggle: (kod: string) => void;
}) {
  return (
    // Két soros: fent hely + név + érték, alatta a teljes szélességű sáv – a keskeny panelen (~330–420 px)
    // a három elem egy sorban nem fér el, a hosszú országnevek csonkolódnának.
    <li className="rounded-md hover:bg-muted/60">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onKivalaszt(o.kod)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {hely !== undefined && <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground">{hely}.</span>}
          <span className="min-w-0 flex-1 truncate font-medium" title={o.nev}>{o.nev}</span>
          {ertek !== undefined && <span className="shrink-0 font-mono text-xs text-muted-foreground">{ertek}</span>}
        </button>
        {/* Letiltott gombon a title nem jelenne meg (natív disabled + pointer-events-none); a korlátot az OsszehasonlitasCsik írja ki. */}
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={benne ? `${o.nev} kivétele az összehasonlításból` : `${o.nev} hozzáadása az összehasonlításhoz`}
          disabled={!benne && vsTele}
          onClick={() => onVsToggle(o.kod)}
        >
          {benne ? <Check /> : <Plus />}
        </Button>
      </div>
      {sav !== undefined && (
        <span className="mx-1 mb-1 block h-1.5 overflow-hidden rounded-sm bg-muted">
          {/* Inline style szándékosan: a sáv színe a térkép skálájából jön. */}
          <span className="block h-full" style={{ width: `${Math.max(SAV_MIN_SZAZALEK, Math.round(sav * 100))}%`, background: SAV_SZIN }} />
        </span>
      )}
    </li>
  );
}

/** A térkép melletti panel kijelölés nélkül: rangsor (számszerű mutató) vagy csoportosított lista (kategorikus). */
export function RangsorPanel({ mutato, rangsor, csoportok, tartomany, szamlalo, vs, vsTele, onKivalaszt, onVsToggle }: {
  mutato: Mutato;
  rangsor: Rangsor | null;
  csoportok: Csoport[];
  tartomany: Tartomany | null;
  /** A fejléc számláló szövege (pl. „14 ország adattal · 4 adat nélkül"). */
  szamlalo: string;
  vs: readonly string[];
  /** A halmaz tele (VS_MAX): a „+" gombok letiltva. */
  vsTele: boolean;
  onKivalaszt: (kod: string) => void;
  onVsToggle: (kod: string) => void;
}) {
  // A sáv ugyanazt a (lineáris vagy symlog) arányt használja, mint a térkép színe.
  const sav = mutato.tipus === 'szam' && tartomany ? arany(mutato, tartomany) : () => 0;
  const sor = (o: TerkepOrszag, extra: { hely?: number; sav?: number; ertek?: string } = {}) => (
    <OrszagSor key={o.kod} o={o} {...extra} benne={vs.includes(o.kod)} vsTele={vsTele} onKivalaszt={onKivalaszt} onVsToggle={onVsToggle} />
  );
  const nincsTalalat = <p className="text-sm text-muted-foreground">Egy ország sem felel meg a szűrőnek.</p>;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{mutato.tipus === 'szam' ? 'Rangsor' : 'Országok'} · {mutato.cimke}</CardTitle>
        <CardDescription>{szamlalo}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {mutato.tipus === 'szam' && rangsor ? (
          <>
            {rangsor.sorok.length === 0 ? (
              rangsor.adatNelkul.length === 0
                ? nincsTalalat
                : <p className="text-sm text-muted-foreground">Ehhez a mutatóhoz még nincs adat.</p>
            ) : (
              <ul className="divide-y divide-border">
                {rangsor.sorok.map((s) => sor(s.o, { hely: s.hely, sav: sav(s.ertek), ertek: formatSzam(s.ertek, mutato.utotag) }))}
              </ul>
            )}
            {rangsor.adatNelkul.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Nincs adat</p>
                <ul className="divide-y divide-border">{rangsor.adatNelkul.map((o) => sor(o))}</ul>
              </div>
            )}
          </>
        ) : csoportok.every((cs) => cs.orszagok.length === 0) ? (
          nincsTalalat
        ) : (
          csoportok.map((cs) => (
            <div key={cs.kategoria ?? '__nincs'}>
              <p className="mb-1 flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {/* Inline style szándékosan: a szín a térképpel közös szótárból jön. */}
                <span className="size-2.5 shrink-0 rounded-sm" style={{ background: cs.szin }} />
                <span className="truncate">{cs.cimke}</span>
                <span className="ml-auto shrink-0 font-mono normal-case">{cs.orszagok.length} ország</span>
              </p>
              {cs.orszagok.length > 0 && <ul className="divide-y divide-border">{cs.orszagok.map((o) => sor(o))}</ul>}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: 0 hiba.

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/terkep/components/RangsorPanel.tsx"
git commit -m "feat(terkep): RangsorPanel – rangsor és csoportosított lista a térkép mellett

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: `OsszehasonlitasPanel.tsx`

**Files:**
- Create: `app/(app)/terkep/components/OsszehasonlitasPanel.tsx`

- [ ] **Step 1: A komponens megírása**

```tsx
'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { AllapotBadge } from '../../../../components/orszagprofil/AllapotBadge';
import { IparagBadge } from '../../../../components/orszagprofil/IparagBadge';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { formatSzam } from '../../../../lib/szam';
import { SKALA_SZINEK, SZAM_MUTATOK, type Mutato } from '../../../../lib/terkep-mutatok';
import { cn } from '../../../../lib/utils';
import { VS_MAX } from './useTerkepAllapot';

/** A kiemelt sor (a térképen választott mutató) háttere: a térkép skálájának legvilágosabb színe. */
const KIEMELT_HATTER = SKALA_SZINEK[0];
/** A sorcímke-oszlop keskeny képernyőn is látszik (sticky), ezért saját, átlátszatlan háttere van. */
const CIMKE_OSZLOP = 'sticky left-0 z-10 w-36 min-w-36 bg-card align-top whitespace-normal';

function Sor({ cimke, kiemelt, orszagok, plusz, children }: {
  cimke: string;
  kiemelt?: boolean;
  orszagok: TerkepOrszag[];
  /** Van-e „+ Ország" oszlop (üres cella kell a sor végére). */
  plusz: boolean;
  children: (o: TerkepOrszag) => ReactNode;
}) {
  // Inline style szándékosan: a kiemelés színe a térkép skálájából jön. A sorok nem interaktívak, ezért nincs
  // hover-szín (a sticky címke-cella saját, átlátszatlan háttere nem tudná követni); a kiemelés a címke-cellára
  // is kell, mert az fedi a sor hátterét.
  const hatter = kiemelt ? { background: KIEMELT_HATTER } : undefined;
  return (
    <TableRow className="hover:bg-transparent" style={hatter}>
      <TableHead scope="row" className={cn(CIMKE_OSZLOP, 'h-auto py-2 font-medium', kiemelt ? 'text-foreground' : 'text-muted-foreground')} style={hatter}>
        {cimke}
      </TableHead>
      {orszagok.map((o) => <TableCell key={o.kod} className="align-top whitespace-normal">{children(o)}</TableCell>)}
      {plusz && <TableCell />}
    </TableRow>
  );
}

/**
 * 2–4 ország adatai egymás mellett, a térkép alatt, teljes szélességben (a keskeny jobb panelen nem
 * férne el). A térképen választott számszerű mutató sora kiemelt, soronként a legnagyobb érték félkövér.
 */
export function OsszehasonlitasPanel({ orszagok, jeloltek, mutato, onKivalaszt, onKivesz, onHozzaad, onTorol }: {
  /** A halmaz rekordjai a hozzáadás sorrendjében (2–4). */
  orszagok: TerkepOrszag[];
  /** A „+ Ország" lista (a halmazban nem lévők, a hívó rendezi). */
  jeloltek: TerkepOrszag[];
  mutato: Mutato;
  onKivalaszt: (kod: string) => void;
  onKivesz: (kod: string) => void;
  onHozzaad: (kod: string) => void;
  onTorol: () => void;
}) {
  const plusz = orszagok.length < VS_MAX && jeloltek.length > 0;
  const felirat = (o: TerkepOrszag) =>
    mutato.tipus === 'szam' ? `${o.nev} · ${formatSzam(mutato.ertek(o), mutato.utotag)}` : o.nev;
  return (
    <Card>
      <CardHeader className="flex items-start gap-2">
        <div className="min-w-0">
          <CardTitle>Összehasonlítás</CardTitle>
          <CardDescription>
            {orszagok.length} ország{mutato.tipus === 'szam' ? ' · a térkép mutatójának sora kiemelve' : ''} · soronként a legnagyobb érték félkövér
          </CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={onTorol}>Összehasonlítás törlése</Button>
      </CardHeader>
      <CardContent className="px-0">
        <Table className="w-auto text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className={cn(CIMKE_OSZLOP, 'h-10')} />
              {orszagok.map((o) => (
                <TableHead key={o.kod} className="min-w-36 max-w-44">
                  <span className="flex items-center gap-1">
                    <button
                      type="button"
                      title={o.nev}
                      className="min-w-0 max-w-40 truncate rounded-sm font-semibold text-foreground outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                      onClick={() => onKivalaszt(o.kod)}
                    >
                      {o.nev}
                    </button>
                    <Button type="button" variant="ghost" size="icon-xs" aria-label={`${o.nev} kivétele`} onClick={() => onKivesz(o.kod)}>
                      <X />
                    </Button>
                  </span>
                </TableHead>
              ))}
              {plusz && (
                <TableHead className="min-w-44">
                  <NativeSelect aria-label="Ország hozzáadása" value="" onChange={(e) => { if (e.target.value) onHozzaad(e.target.value); }}>
                    <option value="">+ Ország</option>
                    {jeloltek.map((o) => <option key={o.kod} value={o.kod}>{felirat(o)}</option>)}
                  </NativeSelect>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            <Sor cimke="Attasé" orszagok={orszagok} plusz={plusz}>
              {(o) => (
                <>
                  {o.attase ?? '–'}
                  {o.poszt?.fovaros && <span className="block text-muted-foreground">{o.poszt.fovaros}</span>}
                </>
              )}
            </Sor>
            <Sor cimke="Állapot" orszagok={orszagok} plusz={plusz}>
              {(o) => <AllapotBadge allapot={o.allapot} ev={o.ev} />}
            </Sor>
            <Sor cimke="Kiemelt iparágak" orszagok={orszagok} plusz={plusz}>
              {(o) => (o.iparagak.length ? <span className="flex flex-wrap gap-1">{o.iparagak.map((i) => <IparagBadge key={i} iparag={i} />)}</span> : '–')}
            </Sor>
            {SZAM_MUTATOK.map((m) => {
              // Félkövér csak valódi összevetésnél: legalább két ország értékével (egyetlen érték nem „legnagyobb”).
              const ertekek = orszagok.map((o) => m.ertek(o)).filter((v): v is number => v !== null);
              const legjobb = ertekek.length >= 2 ? Math.max(...ertekek) : null;
              return (
                <Sor key={m.kulcs} cimke={m.cimke} kiemelt={m.kulcs === mutato.kulcs} orszagok={orszagok} plusz={plusz}>
                  {(o) => {
                    const v = m.ertek(o);
                    return <span className={cn('font-mono', v !== null && v === legjobb && 'font-semibold')}>{formatSzam(v, m.utotag)}</span>;
                  }}
                </Sor>
              );
            })}
            <Sor cimke="Tagságok" orszagok={orszagok} plusz={plusz}>
              {(o) => (o.alapadatok?.tagsagok.length ? o.alapadatok.tagsagok.join(', ') : '–')}
            </Sor>
            <Sor cimke="KFI-prioritások" orszagok={orszagok} plusz={plusz}>
              {(o) => (o.prioritasok.length ? o.prioritasok.join(', ') : '–')}
            </Sor>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: 0 hiba.

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/terkep/components/OsszehasonlitasPanel.tsx"
git commit -m "feat(terkep): OsszehasonlitasPanel – 2–4 ország összehasonlító táblája

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: `ProfilKivonat` bővítése és `TerkepPanel`

**Files:**
- Modify: `app/(app)/terkep/components/ProfilKivonat.tsx`
- Create: `app/(app)/terkep/components/TerkepPanel.tsx`

- [ ] **Step 1: `ProfilKivonat.tsx` – új propok, mutató-sáv, összehasonlítás-gomb (teljes tartalom)**

Öt új prop (`mutato`, `rangsor`, `benneVs`, `vsTele`, `onVs`), a mutató értéke és helyezése az `ertekEsHely()`-ből egy
színezett sávban a `CardContent` elején, a láblécben ikonos „Összehasonlítás" / „Összehasonlításban" toggle
(a felirat viszi az állapotot, mint a `RangsorPanel` „+"/pipa `aria-label`-je; letiltva, ha tele a halmaz és nincs benne; `title` nélkül – letiltott gombon nem látszana).

```tsx
'use client';

import { Check, Plus, X } from 'lucide-react';
import Link from 'next/link';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { AllapotBadge } from '../../../../components/orszagprofil/AllapotBadge';
import { IparagBadge } from '../../../../components/orszagprofil/IparagBadge';
import { SzerkesztesGomb } from '../../../../components/orszagprofil/SzerkesztesGomb';
import { Badge } from '../../../../components/ui/badge';
import { Button, buttonVariants } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/card';
import { BLOKK_KULCSOK, MEZO_CIMKEK } from '../../../../lib/orszagprofil-szotar';
import { formatSzam as sz } from '../../../../lib/szam';
import { ertekEsHely, SKALA_SZINEK, type Mutato, type Rangsor } from '../../../../lib/terkep-mutatok';
import { cn } from '../../../../lib/utils';

/** A kiválasztott ország profil-kivonata a térkép mellett. */
export function ProfilKivonat({
  o, szerkeszthetEv, szerkeszthetMost, most, valasztEvAction, onClose,
  mutato, rangsor, benneVs, vsTele, onVs,
}: {
  o: TerkepOrszag;
  szerkeszthetEv: boolean;
  szerkeszthetMost: boolean;
  most: number;
  valasztEvAction: (formData: FormData) => Promise<void>;
  onClose: () => void;
  /** A térképen választott mutató; számszerűnél egy sor az értékkel és a helyezéssel. */
  mutato: Mutato;
  rangsor: Rangsor | null;
  /** Benne van-e az ország az összehasonlításban. */
  benneVs: boolean;
  /** Tele a halmaz (`VS_MAX`) – ilyenkor a hozzáadás letiltva. */
  vsTele: boolean;
  /** Hozzáadás / kivétel (a hívó dönti el `benneVs` alapján). */
  onVs: () => void;
}) {
  const a = o.alapadatok;
  const C = MEZO_CIMKEK.alapadatok;
  const poszt = [
    o.poszt?.fovaros,
    o.poszt?.terulet != null ? sz(o.poszt.terulet, ' km²') : null,
    o.poszt?.penznem,
  ].filter(Boolean).join(' · ');
  // A térképen választott számszerű mutató értéke és helyezése (a szűrt rangsorban); undefined = kategorikus mutató.
  const ertek = mutato.tipus === 'szam' ? ertekEsHely(o, mutato, rangsor) : undefined;
  // Van-e helyezése (a szűrő által kizárt ország nincs a rangsorban, de értéke lehet).
  const helyezett = !!rangsor?.sorok.some((s) => s.o.kod === o.kod);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-2">
          <div className="min-w-0">
            <CardTitle>{o.nev}</CardTitle>
            <CardDescription>
              {o.attase ?? 'nincs aktív attasé'}{poszt ? ` · ${poszt}` : ''}
            </CardDescription>
          </div>
          <Button type="button" variant="ghost" size="icon" className="ml-auto" aria-label="Bezárás" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <AllapotBadge allapot={o.allapot} ev={o.ev} />
          {o.allapot !== 'nincs' && (
            <Badge variant="secondary">{o.mentettDb}/{BLOKK_KULCSOK.length} blokk · {o.rendezvenyDb} rendezvény</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {ertek !== undefined && (
          // Inline style szándékosan: a sáv színe a térkép skálájának legvilágosabb fokozata (mint az
          // összehasonlító tábla kiemelt sora) – ez köti a sort a térkép aktuális színezéséhez. Érték
          // nélkül nincs sáv: a térkép sem színezi az országot, és a halvány szöveg a színen nem olvasható.
          <p className="rounded-md px-2 py-1 text-sm text-foreground" style={ertek === null ? undefined : { background: SKALA_SZINEK[0] }}>
            <span>{mutato.cimke}: </span>
            {ertek === null ? (
              <span className="text-muted-foreground">nincs adat</span>
            ) : (
              <span
                className="font-mono font-medium"
                title={helyezett ? 'Érték és helyezés a jelenlegi szűrés szerinti rangsorban' : 'Érték – a szűrés miatt az ország nincs a rangsorban'}
              >
                {ertek}
              </span>
            )}
          </p>
        )}
        {o.allapot === 'nincs' ? (
          <p className="text-sm text-muted-foreground">Ehhez az évhez még nincs országprofil.</p>
        ) : (
          <>
            {a && (
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted-foreground">{C.lakossag.cimke}</dt><dd>{sz(a.lakossag)}</dd>
                <dt className="text-muted-foreground">{C.gdp.cimke}</dt><dd>{sz(a.gdp)}</dd>
                <dt className="text-muted-foreground">{C.gdpEgyFore.cimke}</dt><dd>{sz(a.gdpEgyFore)}</dd>
                <dt className="text-muted-foreground">{C.gdpNovekedes.cimke}</dt><dd>{sz(a.gdpNovekedes, ' %')}</dd>
                {a.adatEv != null && (
                  <><dt className="text-muted-foreground">{C.adatEv.cimke}</dt><dd>{a.adatEv}{a.forras ? ` · ${a.forras}` : ''}</dd></>
                )}
                {a.tagsagok.length > 0 && (
                  <><dt className="text-muted-foreground">{C.tagsagok.cimke}</dt><dd>{a.tagsagok.join(', ')}</dd></>
                )}
              </dl>
            )}
            {o.iparagak.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">Kiemelt iparágak</p>
                <div className="flex flex-wrap gap-1.5">{o.iparagak.map((i) => <IparagBadge key={i} iparag={i} />)}</div>
              </div>
            )}
            {o.osszegzes && (
              <div>
                <p className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">Összegzés</p>
                <p className="text-sm leading-relaxed">{o.osszegzes}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Link href={`/orszagprofil/${o.kod}`} className={cn(buttonVariants({ variant: 'outline' }))}>Teljes profil</Link>
        <Link href="/kommunikacio" className={cn(buttonVariants({ variant: 'outline' }))}>Üzenet a poszttal</Link>
        {/* Letiltott gombon a title nem jelenik meg (natív disabled + pointer-events-none); a korlátot az OsszehasonlitasCsik írja ki. */}
        <Button
          type="button"
          variant="outline"
          disabled={!benneVs && vsTele}
          onClick={onVs}
        >
          {benneVs ? <><Check /> Összehasonlításban</> : <><Plus /> Összehasonlítás</>}
        </Button>
        <SzerkesztesGomb
          kod={o.kod}
          most={most}
          szerkeszthetEv={szerkeszthetEv}
          szerkeszthetMost={szerkeszthetMost}
          action={valasztEvAction}
          felirat={o.allapot === 'nincs' ? 'Profil kitöltése' : 'Szerkesztés'}
          feliratMost="Szerkesztés"
          className="ml-auto"
        />
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 2: `TerkepPanel.tsx`**

```tsx
'use client';

import { useApp } from '../../../../components/AppShell';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { canEditProfil } from '../../../../lib/orszagprofil-jog';
import type { Csoport, Rangsor, Tartomany } from '../../../../lib/terkep-mutatok';
import { OsszehasonlitasCsik } from './OsszehasonlitasCsik';
import { ProfilKivonat } from './ProfilKivonat';
import { RangsorPanel } from './RangsorPanel';
import type { TerkepAllapot } from './useTerkepAllapot';

/**
 * A térkép melletti panel: `kod` → kivonat, különben rangsor; fölötte az összehasonlítás-csík, ha a
 * halmaz nem üres. Az összehasonlító tábla nem itt, hanem a térkép alatt, teljes szélességben van
 * (TerkepNezet): 2–4 oszlop a keskeny panelen nem fér el.
 */
export function TerkepPanel({ adatok, allapot, vsOrszagok, rangsor, csoportok, tartomany, szamlalo, ev, most, valasztEvAction }: {
  adatok: TerkepOrszag[];
  allapot: TerkepAllapot;
  /** A halmaz rekordjai a hozzáadás sorrendjében (a TerkepNezet számolja, a táblának is kell). */
  vsOrszagok: TerkepOrszag[];
  rangsor: Rangsor | null;
  csoportok: Csoport[];
  tartomany: Tartomany | null;
  szamlalo: string;
  ev: number;
  most: number;
  valasztEvAction: (formData: FormData) => Promise<void>;
}) {
  const { user } = useApp();
  const { kod, vs, vsTele, mutato } = allapot;
  const sel = kod ? adatok.find((o) => o.kod === kod) ?? null : null;

  return (
    <>
      {vsOrszagok.length > 0 && <OsszehasonlitasCsik orszagok={vsOrszagok} onKivesz={allapot.vsKivesz} />}
      {sel ? (
        <ProfilKivonat
          o={sel}
          szerkeszthetEv={canEditProfil(user, sel.kod, ev, most)}
          szerkeszthetMost={canEditProfil(user, sel.kod, most, most)}
          most={most}
          valasztEvAction={valasztEvAction}
          onClose={allapot.bezar}
          mutato={mutato}
          rangsor={rangsor}
          benneVs={vs.includes(sel.kod)}
          vsTele={vsTele}
          onVs={() => allapot.vsValt(sel.kod)}
        />
      ) : (
        <RangsorPanel
          mutato={mutato}
          rangsor={rangsor}
          csoportok={csoportok}
          tartomany={tartomany}
          szamlalo={szamlalo}
          vs={vs}
          vsTele={vsTele}
          onKivalaszt={allapot.kivalaszt}
          onVsToggle={allapot.vsValt}
        />
      )}
    </>
  );
}
```

- [ ] **Step 3: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: hibát a `TerkepNezet.tsx` ad (a `ProfilKivonat` új kötelező propjai hiányoznak) – ez várt, a Task 9 javítja. Más hiba ne legyen.

- [ ] **Step 4: Commit**

```bash
git add "app/(app)/terkep/components/ProfilKivonat.tsx" "app/(app)/terkep/components/TerkepPanel.tsx"
git commit -m "feat(terkep): ProfilKivonat mutató-sor és összehasonlítás-gomb, TerkepPanel váltó

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: `TerkepNezet` átírása, régi térkép törlése, build és böngészős ellenőrzés

**Files:**
- Rewrite: `app/(app)/terkep/components/TerkepNezet.tsx`
- Modify: `app/(app)/terkep/page.tsx` (a `key={kezdoKod}` kikerül)
- Delete: `app/(app)/terkep/components/TerkepUres.tsx`, `components/WorldMap.tsx`, `public/tet-world-map.js`

- [ ] **Step 1: `TerkepNezet.tsx` teljes tartalma**

```tsx
'use client';

import { useMemo } from 'react';
import { useApp } from '../../../../components/AppShell';
import { SzerkesztesGomb } from '../../../../components/orszagprofil/SzerkesztesGomb';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { Label } from '../../../../components/ui/label';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from '../../../../components/ui/select';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { canEditProfil } from '../../../../lib/orszagprofil-jog';
import { IPARAGAK } from '../../../../lib/orszagprofil-szotar';
import {
  csoportok as szamolCsoportok, jeloltek, KATEGORIA_MUTATOK, MUTATOK, rangsor as szamolRangsor, szures, SZAM_MUTATOK,
  tartomany as szamolTartomany,
} from '../../../../lib/terkep-mutatok';
import { OsszehasonlitasPanel } from './OsszehasonlitasPanel';
import { TerkepPanel } from './TerkepPanel';
import { useTerkepAllapot, VS_MIN } from './useTerkepAllapot';
import { VilagTerkep } from './VilagTerkep';

/** A „Mind" opció értéke: a Base UI Select üres stringet nem tud választható értékként kezelni. */
const MIND = '__mind';
const MUTATO_ITEMS: Record<string, string> = Object.fromEntries(MUTATOK.map((m) => [m.kulcs, m.cimke]));
const IPARAG_ITEMS: Record<string, string> = { [MIND]: 'Mind', ...Object.fromEntries(IPARAGAK.map((i) => [i, i])) };

export function TerkepNezet({
  adatok, ev, most, kezdoKod, valasztEvAction,
}: {
  adatok: TerkepOrszag[];
  /** A választott (nézett) év. */
  ev: number;
  /** Az aktuális év (a nem szerkeszthető évnézetből ide vált a SzerkesztesGomb). */
  most: number;
  kezdoKod: string | null;
  valasztEvAction: (formData: FormData) => Promise<void>;
}) {
  // A session a contextből: a jog-számítás (canEditProfil) és a „Saját országprofil" gomb is ebből dolgozik.
  const { user } = useApp();
  const sajatKod = user.role === 'attase' ? user.orszag : null;
  const allapot = useTerkepAllapot(adatok, kezdoKod);
  const { mutato, iparag, vs } = allapot;

  // A rangsor/csoportok a szűrt halmazon, a tartomány (színskála) szándékosan a szűretlenen.
  const rangsor = useMemo(() => (mutato.tipus === 'szam' ? szamolRangsor(adatok, mutato, iparag) : null), [adatok, mutato, iparag]);
  const csoportok = useMemo(() => (mutato.tipus === 'kategoria' ? szamolCsoportok(adatok, mutato, iparag) : []), [adatok, mutato, iparag]);
  const tartomany = useMemo(() => (mutato.tipus === 'szam' ? szamolTartomany(adatok, mutato) : null), [adatok, mutato]);
  // Az összehasonlítás-halmaz rekordjai és a „+ Ország" jelöltjei; a `vs` csak tényleges változásnál új példány.
  const vsOrszagok = useMemo(
    () => vs.map((k) => adatok.find((o) => o.kod === k)).filter((o): o is TerkepOrszag => !!o),
    [adatok, vs],
  );
  const jeloltLista = useMemo(() => jeloltek(adatok, vs, mutato), [adatok, vs, mutato]);
  const szamlalo = rangsor
    ? `${rangsor.sorok.length} ország adattal · ${rangsor.adatNelkul.length} adat nélkül`
    : iparag
      ? `${szures(adatok, iparag).length} ország emeli ki ezt az iparágat`
      : `${adatok.length} poszt · ${adatok.filter((o) => o.allapot === 'friss').length} profil (${ev})`;

  return (
    <div className="flex max-w-[1600px] flex-col gap-4">
      <div className="flex flex-wrap items-start gap-4">
        <Card className="min-w-0 flex-[1_1_560px] overflow-hidden">
          <CardHeader className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label id="mutato-label" htmlFor="mutato">Mutató</Label>
              <Select value={mutato.kulcs} onValueChange={(v) => allapot.setMutatoKulcs(v ?? '')} items={MUTATO_ITEMS}>
                <SelectTrigger id="mutato" aria-labelledby="mutato-label mutato" className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Kategória</SelectLabel>
                    {KATEGORIA_MUTATOK.map((m) => <SelectItem key={m.kulcs} value={m.kulcs}>{m.cimke}</SelectItem>)}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Számszerű</SelectLabel>
                    {SZAM_MUTATOK.map((m) => <SelectItem key={m.kulcs} value={m.kulcs}>{m.cimke}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label id="iparag-szuro-label" htmlFor="iparag-szuro">Iparág</Label>
              {/* A Select onValueChange null-t is adhat (törlés); a „Mind" és a null egyaránt „nincs szűrő". */}
              <Select value={iparag || MIND} onValueChange={(v) => allapot.setIparag(!v || v === MIND ? '' : v)} items={IPARAG_ITEMS}>
                <SelectTrigger id="iparag-szuro" aria-labelledby="iparag-szuro-label iparag-szuro" className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MIND}>Mind</SelectItem>
                  {IPARAGAK.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* A számláló szöveg a rangsor-panel alcíme (nem duplázzuk a fejlécben). */}
            {sajatKod && (
              <SzerkesztesGomb
                kod={sajatKod}
                most={most}
                szerkeszthetEv={canEditProfil(user, sajatKod, ev, most)}
                szerkeszthetMost={canEditProfil(user, sajatKod, most, most)}
                action={valasztEvAction}
                felirat="Saját országprofil"
                className="ml-auto"
              />
            )}
          </CardHeader>
          <CardContent className="p-0">
            <VilagTerkep
              adatok={adatok}
              mutato={mutato}
              iparag={iparag}
              kivalasztott={allapot.kod}
              osszehasonlitas={vs}
              tartomany={tartomany}
              csoportok={csoportok}
              rangsor={rangsor}
              onSelect={allapot.kivalaszt}
            />
          </CardContent>
        </Card>
        <div className="flex min-w-0 max-w-[420px] flex-[1_1_330px] flex-col gap-4">
          <TerkepPanel
            adatok={adatok}
            allapot={allapot}
            vsOrszagok={vsOrszagok}
            rangsor={rangsor}
            csoportok={csoportok}
            tartomany={tartomany}
            szamlalo={szamlalo}
            ev={ev}
            most={most}
            valasztEvAction={valasztEvAction}
          />
        </div>
      </div>
      {/* Az összehasonlító tábla a térkép alatt, teljes szélességben: 2–4 oszlop a keskeny panelen nem férne el. */}
      {vsOrszagok.length >= VS_MIN && (
        <OsszehasonlitasPanel
          orszagok={vsOrszagok}
          jeloltek={jeloltLista}
          mutato={mutato}
          onKivalaszt={allapot.kivalaszt}
          onKivesz={allapot.vsKivesz}
          onHozzaad={allapot.vsHozzaad}
          onTorol={allapot.vsTorol}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 1b: `page.tsx` – nincs `key`**

A `key` nélkül évváltáskor a hook igazítja az állapotot (a page mountolva marad), és a `?o=`
változását is a hook kezeli, ha ugyanezen a route-on belül változna; más route-ról érkezve a nézet
amúgy is újramountol. A `return` blokk új alakja:

```tsx
  // Nincs key: évváltáskor (a page mountolva marad) a useTerkepAllapot render közben igazítja az
  // állapotot – a kijelölés és az összehasonlítás-halmaz nem létező elemei kikerülnek, a mutató és
  // a szűrő megmarad –, és a ?o= változását is a hook kezeli, ha ugyanezen a route-on belül
  // változna. Más route-ról (profil oldal, oldalsáv) érkezve a nézet amúgy is újramountol.
  return (
    <TerkepNezet
      adatok={listTerkepAdat(ev)}
      ev={ev}
      most={most}
      kezdoKod={kezdoKod}
      valasztEvAction={valasztEvAction}
    />
  );
```

- [ ] **Step 2: A régi térkép törlése**

```bash
git rm "app/(app)/terkep/components/TerkepUres.tsx" components/WorldMap.tsx public/tet-world-map.js
grep -rn "WorldMap\|tet-world-map\|TerkepUres" app components lib --include=*.ts --include=*.tsx
```

Expected: a grep üres (nincs más hivatkozás).

- [ ] **Step 3: Típusellenőrzés és build**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 típushiba, a build zöld. Ha a build nem létező `app/...` modulra panaszkodik, `rm .next/dev/types/validator.ts` és újra.

- [ ] **Step 4: Böngészős ellenőrzés adminnal**

`B=~/.claude/skills/gstack/browse/dist/browse`, dev szerver a 3000-en (a jelszót a `.env.local` `SEED_ADMIN_PASSWORD` sorából olvasd ki, ne írd ki):

1. `$B goto http://localhost:3000/login`, `$B fill` e-mail `admin@niu.hu`, jelszó, `$B click` a bejelentkezés gombra.
2. `$B goto http://localhost:3000/terkep`, `$B wait --networkidle`, `$B text`.
   Expected: „Mutató", „Iparág", „Rangsor · Kiemelt iparág", csoport-fejlécek „N ország" feliratokkal, a jelmagyarázatban „nincs poszt".
3. `$B network` → a listában **nincs** `unpkg.com` és **nincs** `jsdelivr.net` kérés; van egy `countries-110m` chunk.
4. `$B js "document.querySelectorAll('svg[role=img] path').length"` → 170-nél több (a poligonok + gömb + rács).
5. Mutató-váltás GERD-re: `$B click "#mutato"`, majd `$B click "text=K+F ráfordítás (GERD)"` (ha a szöveg-szelektor nem talál, `$B snapshot -i` és a listaelem ref-jére kattints). `$B text`.
   Expected: „Rangsor · K+F ráfordítás (GERD)", „N ország adattal · M adat nélkül", a jelmagyarázatban a mutató címe és két érték `%`-kal (ha a DB-ben van GERD – a KR 2026 profilban van kfiRendszer blokk), sorok „1." helyezéssel.
6. Iparág-szűrő: `$B click "#iparag-szuro"`, válassz egy iparágat, `$B text` → a rangsor rövidül vagy „Ehhez a mutatóhoz még nincs adat", a számláló változik. Állítsd vissza „Mind"-re.
7. Kijelölés a rangsorból: `$B click` az első ország nevére a panelen → a kivonat kártya jelenik meg („Teljes profil", „Összehasonlítás" gomb, a mutató sáv „K+F ráfordítás (GERD): …"). kattints az „Összehasonlítás" gombra a kivonat láblécében (`$B snapshot -i` ref-jével; a `text=` a csík „Összehasonlítás:" feliratát is találhatja) → a gomb felirata „Összehasonlításban", fölötte a csík „Összehasonlítás: <ország>" és „Válassz még egy országot" (gomb nincs a csíkon: a tábla magától jelenik meg a térkép alatt).
8. `$B click "[aria-label=Bezárás]"` → rangsor a csíkkal; `$B click` egy másik ország „+" gombjára (`[aria-label$='hozzáadása az összehasonlításhoz']` első találat) → a csík szövege „A tábla a térkép alatt", és a térkép alatt megjelenik az összehasonlító tábla 2 oszloppal: `$B text` tartalmazza „Összehasonlítás", „2 ország", „Attasé", „Állapot", „Kiemelt iparágak", „Tagságok", „KFI-prioritások", és a „+ Ország" select; a jobb panelen közben a rangsor marad.
9. `$B select "select[aria-label='Ország hozzáadása']" <harmadik kód>` (a kódot `$B js "[...document.querySelectorAll('select[aria-label=\"Ország hozzáadása\"] option')].map(o=>o.value).slice(1,2)"`-vel olvasd ki) → 3 oszlop. `$B click "text=Összehasonlítás törlése"` → a tábla eltűnik, a csík is.
10. Zoom: `$B js "document.querySelector('svg[role=img] > g').getAttribute('transform')"` → `null`; `$B click "[aria-label=Nagyítás]"`, várj 0,5 s (`$B wait --load` vagy `sleep 1`), ugyanaz a `js` → `translate(…) scale(1.5)`; `$B click "text=Európa"` → a transform `scale` értéke 1-nél nagyobb és a gomb `aria-pressed="true"`; `$B click "[aria-label=Alaphelyzet]"` → `translate(0,0) scale(1)`.
11. Tooltip: `$B hover "svg[role=img] g g"` (az első pin) → `$B text` tartalmaz egy ország nevet és „Kiemelt:" vagy „nincs aktív attasé" sort a `[role=tooltip]`-ben: `$B js "document.querySelector('[role=tooltip]')?.innerText"`.
12. `$B console --errors` → üres.

- [ ] **Step 5: Böngészős ellenőrzés attaséval**

1. Kijelentkezés (`$B click` az oldalsáv „Kijelentkezés" gombjára), bejelentkezés `masodik.attase@niu.hu` / `Masodik1234!`.
2. `$B goto "http://localhost:3000/terkep?o=JP"`, `$B wait --networkidle`, `$B text`.
   Expected: a kivonat „Japán"-nal nyílik meg, a fejlécben „Saját országprofil" gomb, a panelen „Szerkesztés" (2026) gomb.
3. `$B console --errors` → üres.

- [ ] **Step 6: Commit**

```bash
git add "app/(app)/terkep/components/TerkepNezet.tsx" "app/(app)/terkep/page.tsx"
git commit -m "feat(terkep): TerkepNezet mutató-választóval, VilagTerkep és TerkepPanel bekötése; régi webkomponens törölve

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

(A `git rm` a Step 2-ben már stage-elte a törléseket; ez a commit tartalmazza őket.)

---

### Task 10: Dokumentáció

**Files:**
- Modify: `CLAUDE.md` (a „**Térkép.**" bekezdés, a `Route-ok: \`/terkep\`` leírás, az „Amire figyelni kell" térkép-pontja)
- Modify: `README.md` (a `/terkep` sor, a `public/tet-world-map.js` sor és az internet-megjegyzés)

- [ ] **Step 1: CLAUDE.md – Térkép bekezdés cseréje**

A `**Térkép.**`-kel kezdődő bekezdés teljes új szövege:

```
**Térkép.** `app/(app)/terkep/components/VilagTerkep.tsx` React kliens-komponens: az SVG-t React rendereli, a d3-geo (npm) csak a Natural Earth vetületet és a path-okat adja, a world-atlas 110m TopoJSON is npm-ből jön (`useVilagAtlasz.ts`, dinamikus import, modulszintű promise – **nem kell CDN vagy internet**). Propjai: `adatok` (a `listTerkepAdat` eredménye, csak `import type` a server-only modulból), `mutato`, `iparag` (szűrő), `kivalasztott`, `osszehasonlitas` (kódlista), a számított `tartomany`/`csoportok`/`rangsor` és `onSelect`. A mutató-definíciók (`MUTATO_TABLA` kimerítő kulcs-térkép → `MUTATOK`, `SZAM_MUTATOK`, `KATEGORIA_MUTATOK`; a számszerű mutató `cimke`-je egység nélküli, az egységet az `utotag` viszi), a `rangsor()`/`csoportok()`/`tartomany()`/`jeloltek()`/`orszagSzin()` függvények, az `arany()`/`szinSkala()` (d3-scale: a mutató `skala` mezője szerint lineáris vagy symlog – GDP, GDP/fő, lakosság logaritmikus –, 5 zöld fokozat `SKALA_SZINEK`, mindig `rgb()` string; a rangsor sávja ugyanezt az arányt használja), a térkép fix színei (`TERKEP_SZINEK`) és a régiók (`REGIOK`, lon/lat bbox) a framework-mentes `lib/terkep-mutatok.ts`-ben vannak; ismeretlen mutató-kulcsra `mutatoByKulcs` az alapértelmezettet adja. Poligon-párosítás a szótár `geo` mezőjével (world-atlas `properties.name`); a `geo: ''` országok csak pint kapnak, a pin a rekordot adja át, így tooltipet és kiválasztást is kapnak. Számszerű mutatónál érték nélkül **sraffozott** minta (`<pattern>`), az iparág-szűrő által kizárt ország halvány; a kijelölt ország vastag kontúrral a `<g>` végére kerül, az összehasonlítottak közepes kontúrt kapnak (`vector-effect: non-scaling-stroke`). A zoom (d3-zoom, 1–8×, `clickDistance(4)`) **közvetlenül a DOM-on** állítja a `<g>` transformját és a pinek sugarát (1/k), nem React-állapoton át; a poligonok és pinek a `TerkepRetegek` memo-komponensben vannak, hogy a tooltip hover-állapota ne renderelje őket újra. Régió-gombok (`RegioGombok`) a bbox vetített befoglaló téglalapjára illesztenek; kézi zoom után egyik sem aktív. Tooltip (`TerkepTooltip`): név, attasé · főváros, a mutató értéke + helyezés (a szűrő által kizárt országnál helyezés nélkül), állapot + év, első két kiemelt iparág. Jelmagyarázat (`Jelmagyarazat`): gradiens + min/max (számszerű) vagy kategória-lista; a színskála tartománya szándékosan a **szűretlen** adathalmaz min–max-a, hogy a szűrő váltogatásakor ne ugráljanak a színek.
```

- [ ] **Step 2: CLAUDE.md – a `/terkep` route leírása**

A `Route-ok: \`/terkep\` (…)` zárójeles részt cseréld erre (a `/orszagprofil/[kod]` rész változatlan marad):

```
`/terkep` (server page: `listTerkepAdat` + a fejléc évét (cookie) mutatja, `?o=` marad; `terkep/components/TerkepNezet` kliens: **Mutató** `Select` két csoporttal (Kategória: Kiemelt iparág, Profil állapota; Számszerű: GDP/fő, GDP, GDP-növekedés, lakosság, GERD, kitöltöttség, rendezvények száma – `MUTATOK`), iparág-szűrő `Select` minden mutatónál – a „Mind" értéke `__mind`, mert a Base UI Select üres stringet nem választ –, `VilagTerkep`, és a `TerkepPanel`: az állapot a `useTerkepAllapot` hookban (`kod` egyes kijelölés, `vs` összehasonlítás-halmaz `VS_MIN`=2..`VS_MAX`=4, `vsTele`, `mutato`, `iparag`; a `?o=` változását a hook kezeli, a page nem ad `key`-t), a jobb panel `kod` → `ProfilKivonat` (mutató-sor + „Összehasonlításhoz" gomb), különben `RangsorPanel` (számszerű: két soros sorok hely/név/érték + sáv az `arany()`-ból, „Nincs adat" névsor; kategorikus: „Országok · …" csoportok; üres állapotok szűrés vs. adat szerint), fölötte az `OsszehasonlitasCsik` chipjei + állapotszöveg, ha a halmaz nem üres; az `OsszehasonlitasPanel` a térkép **alatt**, teljes szélességben, ha `vs.length >= VS_MIN` (oszlop országonként, sticky `th scope="row"` címke-oszlop, a térkép mutatójának sora kiemelt, soronként a legnagyobb félkövér, „+ Ország" `NativeSelect` a `jeloltek()` listából, „Összehasonlítás törlése"); attasénak „Saját országprofil" gomb)
```

- [ ] **Step 3: CLAUDE.md – „Amire figyelni kell" pont**

A `- A \`/terkep\` page a \`TerkepNezet\`-et \`key={kezdoKod}\`-dal rendereli…` pontot cseréld:

```
- A `/terkep` page **nem** ad `key`-t a `TerkepNezet`-nek: évváltáskor (a page mountolva marad) a `useTerkepAllapot` render közben igazítja az állapotot (a kijelölés és a halmaz nem létező elemei kikerülnek, a mutató és a szűrő megmarad), és a `?o=` változását is a hook kezeli render közben (`elozoKezdo`), ha ugyanezen a route-on belül változna. Más route-ról – profil oldal „Vissza a térképre", oldalsáv – érkezve a nézet újramountol, tehát a mutató, a szűrő és az összehasonlítás-halmaz (kliens-állapot, nem URL-paraméter) egy route-váltást nem él túl.
- Letiltott shadcn/Base UI `Button`-on a `title` sosem jelenik meg (natív `disabled` + `disabled:pointer-events-none`): a magyarázatot máshol kell kiírni (a térképen az `OsszehasonlitasCsik` szövege).
```

- [ ] **Step 4: README.md**

A `/terkep` sor új szövege a táblázatban:

```
| `/terkep` | Térkép és országprofil-kivonat a fejlécben választott ciklus évének nézetében (DB-s profilok, React + d3-geo világtérkép npm-ből, nagyítás és régió-gombok; Mutató-választó: kiemelt iparág, profil-állapot vagy számszerű mutató folytonos színskálával; iparág-szűrő; rangsor-panel; 2–4 ország összehasonlító táblája; `?o=<kod>` előre kiválaszt) |
```

A „Felépítés" listában a `public/tet-world-map.js` sort cseréld erre:

```
- `lib/terkep-mutatok.ts` – a térkép mutatói (színezés, rangsor, összehasonlítás), színskála, régiók
- `app/(app)/terkep/components/` – a térkép (`VilagTerkep`, d3-geo + world-atlas npm-ből), a rangsor-, kivonat- és összehasonlító panel
```

A „Megjegyzés: a térkép internetkapcsolatot igényel…" sort töröld.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "docs(terkep): React-térkép, mutatók, rangsor és összehasonlítás a CLAUDE.md-ben és README-ben

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Megvalósítási eltérések

- **Task 2 (minőségi review nyomán):** a számszerű mutató `skala: 'linearis' | 'log'` mezőt kapott; GDP, GDP/fő és lakosság symlog skálán színeződik (lineárisan a nagyságrendi különbség miatt szinte minden ország az első fokozatba esne). Új `arany(m, t)` adja a 0–1 arányt, a `szinSkala(m, t)` erre épül (mindig `rgb()` string), a rangsor sávja is ezt használja. A számszerű `cimke`-k rövidek, egység nélkül (a `MEZO_CIMKEK` címkéi már tartalmazták az egységet, és az `utotag` duplázta volna: „GDP (milliárd USD): 4 200 mrd USD"). `MUTATO_TABLA` kimerítő kulcs-térkép, `SZAM_MUTATOK`/`KATEGORIA_MUTATOK` export, `Tartomany` típus. `csoportok` a `sorrend`-ben nem szereplő kategóriát a „nincs" csoportba teszi (az `orszagSzin`-nel egyezően). `TERKEP_SZINEK.halvany` `#ced5dd` (az eredeti `#e3e7ec` a szárazföldtől megkülönböztethetetlen volt, ΔE ≈ 1). A Task 3–10 kódja ehhez igazítva.
- **Task 3 (minőségi review nyomán):** a `TerkepTooltip` a térkép tetejéhez közel (y < 150 px) a kurzor alá kerül (a kártya `overflow-hidden` levágná); a `Jelmagyarazat` `iparag` propot kap és aktív szűrőnél „nem felel meg a szűrőnek" sort mutat (`halvany`), `max-h-[45%] overflow-y-auto`, a sraffozás sűrűsége a térkép `<pattern>`-jével azonos, explicit `keret` prop, `Tartomany` típus; a `useVilagAtlasz` `'use client'` és „ne mutáld" megjegyzés; új `geoNev(geo)` a `lib/orszagok.ts`-ben, a poszt nélküli poligon tooltipje magyar nevet mutat (a Task 4 `TerkepRetegek`-je ezt hívja, a tooltip x-vágása 120 px); régió-gombok `default`/`outline`.
- **Task 4 (minőségi review nyomán):** a `regioTranszform` maga tartja be a k ≥ 1 és a `translateExtent` korlátot (a `zoom.transform` nem alkalmaz constrain-t – az „Amerika" nézet 209 egységgel lelógott és az első húzásnál ugrott); a **jelmagyarázat a térkép alá, normál folyásba** került (lebegve elnyelte Dél-Amerika egérműveleteit), így nincs `max-h`/görgetés; a betöltő/hiba helykitöltő `aspect-[960/505]` (nincs layout-ugrás); a tooltip csak akkor fordul a kurzor alá, ha alatta is van hely (`HoverAllapot.magassag`); a `+`/`−` gomb törli az aktív régiót; a pinek külön `<g data-pinek>` rétegben, a sugár-effect csak `adatok` változásra fut; a sraffozás `<pattern>`-je a zoom-kezelőben `scale(1/k)`-val visszaskálázva; átlátszó `<rect>` az `<svg>` alján törli a tooltipet a gömbön kívüli sávban; a jelmagyarázat sraffja `135deg` (a `<pattern>` irányával azonos), `backgroundColor`; `NEV_GEO_SZERINT: ReadonlyMap`.
- **Task 5 (minőségi review nyomán):** a `useTerkepAllapot` a `?o=` (kezdoKod) változására render közben frissíti a kijelölést (előző érték tárolva), ezért a `page.tsx` **nem** ad `key`-t a nézetnek – a „Teljes profil" → „Vissza a térképre" út nem dobja el a mutatót, a szűrőt és az összehasonlítás-halmazt (Task 9 Step 1b). A hook `vsTele`-t ad (Task 6/8 ezt kapja propként), `VS_MIN = 2`, `vs` `readonly`, `useState<MutatoKulcs>`, lusta kezdőérték, `'use client'`. A csík chipje `outline` változat (a `secondary` a `bg-muted/40` sávon nem látszott), a × gomb `focus-visible` gyűrűvel, a Badge `h-6 overflow-visible`. A tooltip a tágasabb oldalra kerül (`magassag - y > y`), nincs fix küszöb; a jelmagyarázat kategorikus ágon is a mutató címével kezd, a gradiens-sor `min-w-0`/`shrink`.
- **Task 6 (minőségi review nyomán):** a rangsor sora két soros (hely + név + érték a gombban, alatta teljes szélességű sáv; `title` a néven, sor-szintű hover, fókuszgyűrű, a minimum sávja 2 %); a kategorikus ág címe „Országok · …"; üres állapotok: „Egy ország sem felel meg a szűrőnek." (a szűrt halmaz üres) vs. „Ehhez a mutatóhoz még nincs adat."; a `sav` tartaléka `() => 0`; a letiltott `+` gombon nincs `title` (Base UI natív `disabled` + `pointer-events-none`: sosem látszana), a „Legfeljebb 4 ország" feliratot az `OsszehasonlitasCsik` mutatja tele halmaznál; a hookban `ujKod` őrző-sorrend (a friss `kezdoKod`-ot nem írja felül a régi kijelölés törlése); a `szamlalo` csak a panel alcíme, a fejlécből kikerül (Task 9), a `SzerkesztesGomb` `ml-auto`.
- **Task 7 (minőségi review nyomán, spec-szintű döntés):** az **összehasonlító tábla a térkép alatt, teljes szélességben** jelenik meg (`TerkepNezet` rendereli, ha `vs.length >= VS_MIN`), nem a jobb panelen: 2–4 oszlop + címke + „+ Ország" 640–765 px széles, a 330–420 px-es panelen mindig görgetett volna, a sorcímkék elgördültek. A jobb panel sorrendje egyszerűsödik: `kod` → kivonat, különben rangsor; a csík csak chipek + állapotszöveg („Válassz még egy országot" / „A tábla a térkép alatt" / „Legfeljebb 4 ország"), az „Összehasonlítás (n)" gomb és a hook `osszehasonlit()` műveletje megszűnt. A táblában: sticky, átlátszatlan hátterű címke-oszlop (`th scope="row"`), a fejléc-cellák `min-w-36 max-w-44` + `truncate` + `title`, a kiemelt sor inline `SKALA_SZINEK[0]` háttérrel (a `bg-muted/60` a hover alatt eltűnt), „+ Ország" csak ha van jelölt, „Összehasonlítás törlése" felirat, a leírás a félkövér-szabályt is mondja, nincs dupla `overflow-x-auto`. `RangsorPanel`: a kategorikus üres állapot `csoportok.every(...)`-vel (a „Profil állapota" mindig 3 csoportot ad).
- **Task 8 (minőségi review nyomán):** a mutató-sor formázása („3,3 % · 1./14") közös `ertekEsHely()` a `lib/terkep-mutatok.ts`-ben (a tooltip és a kivonat is ezt hívja); a kivonat mutató-sora színezett sáv (`SKALA_SZINEK[0]`, mint a tábla kiemelt sora) `title`-lel a helyezés magyarázatához; a lábléc gombja ikonos toggle („+ Összehasonlítás" / „✓ Összehasonlításban", `aria-pressed`); a hozzáad/kivesz szabály a hookban `vsValt(kod)` (a `TerkepPanel` és a `RangsorPanel` ezt kapja); az összehasonlító táblában a sorok `hover:bg-transparent` (a sticky címke-cella nem követte a hover-t), a név-gomb `max-w-40` (motorfüggetlen csonkolás), a kiemelt sor címkéje `text-foreground`.
- **Task 8 utó-finomítás (re-review nyomán):** a kivonat mutató-sávja csak értékkel színezett (érték nélkül a halvány „nincs adat" a színen 4,07:1 kontrasztú lett volna), a `title` a helyezés meglétéhez igazodik (`helyezett`), a toggle-gombon nincs `aria-pressed` (a változó felirat viszi az állapotot – egy minta a `RangsorPanel` gombjával); az összehasonlító tábla sor-kommentje a hover hiányát magyarázza, `cn` variadikus formában.
- **Task 9:** a böngészős ellenőrzés adminnal és attaséval rendben (build zöld, konzolhiba nincs, CDN-kérés nincs, 179 path, zoom/régió/tooltip/rangsor/szűrő/kivonat/összehasonlítás 2 oszloppal). A 3. oszlop és a „+ Ország" választó a lokális DB-vel (2 térképes ország: KR, JP) nem próbálható – a választó ilyenkor helyesen el sem jelenik; ezt egy ideiglenes harmadik attaséval a záró ellenőrzés fedi le.
- **Task 9 (minőségi review nyomán):** az összehasonlító `Table` `w-auto` (a `w-full` + auto elrendezés két oszlopot ~800 px-re szórt), a leírás „a térkép mutatójának sora kiemelve" része csak számszerű mutatónál, félkövér csak ha legalább két országnak van értéke; a `Jelmagyarazat` a betöltő/hiba állapotban is renderelődik (nincs ~33 px ugrás); `role="img"` magyarázó komment; a `page.tsx` kommentje pontosítva: a `key` elhagyása az évváltásnál számít (a page mountolva marad), a `?o=` route-váltással érkezik, amikor a nézet amúgy is újramountol – a mutató/szűrő/halmaz egy route-váltást nem él túl (a Task 5-ös eltérés ezt túlígérte).
