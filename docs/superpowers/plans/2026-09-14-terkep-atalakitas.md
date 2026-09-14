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
| `app/(app)/terkep/components/OsszehasonlitasPanel.tsx` | új | 2–4 ország összehasonlító táblája. |
| `app/(app)/terkep/components/ProfilKivonat.tsx` | módosít | Mutató-sor, „Összehasonlításhoz" gomb. |
| `app/(app)/terkep/components/TerkepPanel.tsx` | új | Kivonat / összehasonlítás / rangsor váltás + csík. |
| `app/(app)/terkep/components/TerkepNezet.tsx` | átír | Fejléc (Mutató + Iparág select, számláló, Saját országprofil), térkép, panel. |
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
import { formatSzam } from '../../../../lib/szam';
import type { Mutato, Rangsor } from '../../../../lib/terkep-mutatok';

/** A lebegtetett poligon/pin: `o` null, ha poszt nélküli ország; x/y a térkép-konténerhez képest. */
export interface HoverAllapot { nev: string; o: TerkepOrszag | null; x: number; y: number }

/** Ennél kisebb y-nál nincs hely a kurzor fölött (a tooltip legfeljebb ~140 px magas): a kurzor alá kerül. */
const FLIP_Y = 150;

/** A mutató sora: számszerűnél érték + helyezés (ha a rangsorban van), kategorikusnál a kategória. */
function mutatoSor(o: TerkepOrszag, mutato: Mutato, rangsor: Rangsor | null): string | null {
  if (mutato.tipus === 'szam') {
    const v = mutato.ertek(o);
    if (v === null) return `${mutato.cimke}: nincs adat`;
    const sor = rangsor?.sorok.find((s) => s.o.kod === o.kod);
    return `${mutato.cimke}: ${formatSzam(v, mutato.utotag)}${sor && rangsor ? ` · ${sor.hely}./${rangsor.sorok.length}` : ''}`;
  }
  if (mutato.kulcs === 'allapot') return null; // az állapot-sor úgyis ott van
  const k = mutato.kategoria(o);
  return k === null ? mutato.nincsCimke : (mutato.cimkek[k] ?? k);
}

export function TerkepTooltip({ hover, mutato, rangsor }: { hover: HoverAllapot; mutato: Mutato; rangsor: Rangsor | null }) {
  const { o } = hover;
  const sor = o ? mutatoSor(o, mutato, rangsor) : null;
  // A kártya `overflow-hidden`, ezért a térkép tetejénél a kurzor fölé rajzolt tooltip levágódna: ott alá kerül.
  const lent = hover.y < FLIP_Y;
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
// A sraffozás sűrűsége a térkép <pattern>-jével azonos: 2 px csík 6 px-enként.
function Negyzet({ szin, sraff, keret }: { szin?: string; sraff?: boolean; keret?: boolean }) {
  return (
    <i
      aria-hidden
      className="inline-block size-2.5 shrink-0 rounded-[2px]"
      style={{
        background: sraff ? undefined : szin,
        backgroundImage: sraff
          ? `repeating-linear-gradient(45deg, ${TERKEP_SZINEK.nincsAdat} 0 2px, ${TERKEP_SZINEK.szarazfold} 2px 6px)`
          : undefined,
        border: keret || sraff ? `1px solid ${TERKEP_SZINEK.gombKontur}` : undefined,
      }}
    />
  );
}

/**
 * Lebegő jelmagyarázat a térkép bal alsó sarkában: gradiens (számszerű) vagy kategória-lista.
 * Legfeljebb a térkép magasságának 45 %-a, azon túl görgethető (sok kiemelt iparágnál).
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
    <div className="absolute bottom-2.5 left-2.5 max-h-[45%] max-w-80 overflow-y-auto rounded-md border bg-background/95 px-2.5 py-2 text-[11px] text-muted-foreground shadow-sm">
      {mutato.tipus === 'szam' ? (
        <>
          <p className="font-semibold text-foreground">
            {mutato.cimke}
            {mutato.skala === 'log' && <span className="ml-1 font-normal text-muted-foreground">(logaritmikus skála)</span>}
          </p>
          {tartomany && (
            <>
              <div className="my-1 h-2 rounded-sm" style={{ background: `linear-gradient(90deg, ${SKALA_SZINEK.join(', ')})` }} />
              <div className="flex justify-between gap-3 font-mono">
                <span>{formatSzam(tartomany.min, mutato.utotag)}</span>
                <span>{formatSzam(tartomany.max, mutato.utotag)}</span>
              </div>
            </>
          )}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            <span className="flex items-center gap-1.5"><Negyzet sraff /> nincs adat</span>
            {kozos}
          </div>
        </>
      ) : (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {csoportok.map((cs) => (
            <span key={cs.kategoria ?? '__nincs'} className="flex items-center gap-1.5"><Negyzet szin={cs.szin} /> {cs.cimke}</span>
          ))}
          {kozos}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4b: `geoNev()` a `lib/orszagok.ts`-ben**

Az `orszagNev()` után (az `ORSZAGOK` deklarációja alatt):

```ts
const NEV_GEO_SZERINT = new Map(ORSZAGOK.filter((o) => o.geo).map((o) => [o.geo, o.nev] as const));

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
// (d3-zoom) közvetlenül a DOM-on állítja a <g> transformját és a pinek sugarát – nem React-
// állapoton át, hogy görgetésenként ne renderelődjön újra ~180 path. A poligonok és a pinek egy
// memo-komponensben (TerkepRetegek) vannak, hogy a tooltip (hover-állapot) frissülése se
// renderelje őket újra. A kontúrok `vector-effect: non-scaling-stroke`, hogy nagyításkor ne hízzanak.

const W = 960;
const H = 505;
const PIN_R = 5.5;
const PIN_BELSO_R = 1.8;
const ZOOM_MAX = 8;
const SRAFF_ID = 'terkep-sraff';
const MIN_MAGASSAG = 'min-h-[420px]';

const proj = geoNaturalEarth1().fitExtent([[6, 6], [W - 6, H - 6]], { type: 'Sphere' });
const path = geoPath(proj);
const GOMB_D = path({ type: 'Sphere' }) ?? '';
const RACS_D = path(geoGraticule10()) ?? '';

interface Poligon { nev: string; d: string }

type HoverFn = (e: ReactPointerEvent<SVGElement>, nev: string, o: TerkepOrszag | null) => void;

/** A régió bbox-ának vetített befoglaló téglalapjára illesztett transzformáció. */
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
  const kk = Math.min(ZOOM_MAX, 0.9 / Math.max((x1 - x0) / W, (y1 - y0) / H));
  return zoomIdentity.translate(W / 2 - (kk * (x0 + x1)) / 2, H / 2 - (kk * (y0 + y1)) / 2).scale(kk);
}

/** A pinek sugarát a nagyítás reciprokával állítja, hogy a pin képernyőn állandó méretű maradjon. */
function pinSugar(g: SVGGElement, k: number) {
  g.querySelectorAll<SVGCircleElement>('circle[data-pin]').forEach((c) => c.setAttribute('r', String(PIN_R / k)));
  g.querySelectorAll<SVGCircleElement>('circle[data-pin-belso]').forEach((c) => c.setAttribute('r', String(PIN_BELSO_R / k)));
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
        kRef.current = e.transform.k;
        g.setAttribute('transform', e.transform.toString());
        pinSugar(g, e.transform.k);
        if (e.sourceEvent) setRegio(null);
      });
    select(svg).call(z);
    zoomRef.current = z;
    return () => {
      select(svg).on('.zoom', null);
      zoomRef.current = null;
    };
  }, [poligonok]);

  // Újrarender után (pl. évváltás új pinekkel) a pinek sugara igazodjon az aktuális nagyításhoz.
  useEffect(() => {
    if (gRef.current) pinSugar(gRef.current, kRef.current);
  });

  const onHover = useCallback<HoverFn>((e, nev, o) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return;
    // 120 = a tooltip fél szélessége (max-w-60 → 240 px), hogy ne lógjon ki a konténerből.
    const x = Math.min(Math.max(e.clientX - box.left, 120), box.width - 120);
    setHover({ nev, o, x, y: e.clientY - box.top });
  }, []);

  const nagyit = (f: number) => {
    const svg = svgRef.current;
    const z = zoomRef.current;
    if (svg && z) select(svg).transition().duration(300).call(z.scaleBy, f);
  };
  const regioValaszt = (kulcs: string) => {
    const r = REGIOK.find((x) => x.kulcs === kulcs);
    const svg = svgRef.current;
    const z = zoomRef.current;
    if (!r || !svg || !z) return;
    setRegio(kulcs);
    select(svg).transition().duration(400).call(z.transform, r.bbox ? regioTranszform(r.bbox) : zoomIdentity);
  };

  if (hiba) {
    return (
      <div className={`flex ${MIN_MAGASSAG} items-center justify-center p-6 text-center text-sm text-muted-foreground`}>
        A térkép nem tölthető be.
      </div>
    );
  }
  if (!poligonok) {
    return (
      <div className={`flex ${MIN_MAGASSAG} animate-pulse items-center justify-center text-sm text-muted-foreground`}>
        Térkép betöltése…
      </div>
    );
  }
  return (
    <div ref={wrapRef} className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="TéT attasé posztok világtérképe"
        className="block h-auto w-full touch-none select-none"
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <pattern id={SRAFF_ID} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
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
      <Jelmagyarazat mutato={mutato} tartomany={tartomany} csoportok={csoportok} iparag={iparag} />
      {hover && <TerkepTooltip hover={hover} mutato={mutato} rangsor={rangsor} />}
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
import { useCallback, useState } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { ALAP_MUTATO, mutatoByKulcs, type Mutato } from '../../../../lib/terkep-mutatok';

/** Legfeljebb ennyi ország lehet az összehasonlításban. */
export const VS_MAX = 4;

export interface TerkepAllapot {
  /** Egyes kijelölés (a kivonat országa). */
  kod: string | null;
  /** Összehasonlítás-halmaz a hozzáadás sorrendjében. */
  vs: string[];
  mutato: Mutato;
  /** Iparág-szűrő, '' = nincs. */
  iparag: string;
  kivalaszt: (kod: string) => void;
  bezar: () => void;
  setMutatoKulcs: (k: string) => void;
  setIparag: (i: string) => void;
  vsHozzaad: (kod: string) => void;
  vsKivesz: (kod: string) => void;
  vsTorol: () => void;
  /** A kijelölést törli, így (vs.length >= 2 esetén) az összehasonlító panel látszik. */
  osszehasonlit: () => void;
}

/**
 * A térkép-oldal kliens-állapota. A panel sorrendje a hívóban: `kod` → kivonat, különben
 * `vs.length >= 2` → összehasonlítás, különben rangsor. Évváltáskor (új `adatok`) a nem létező
 * kijelölés és halmaz-elemek render közben kikerülnek (a „prop változásra állapot igazítása" minta).
 */
export function useTerkepAllapot(adatok: TerkepOrszag[], kezdoKod: string | null): TerkepAllapot {
  const letezik = (k: string) => adatok.some((o) => o.kod === k);
  const [kod, setKod] = useState<string | null>(kezdoKod && letezik(kezdoKod) ? kezdoKod : null);
  const [vs, setVs] = useState<string[]>([]);
  const [mutatoKulcs, setMutatoKulcsState] = useState<string>(ALAP_MUTATO);
  const [iparag, setIparag] = useState('');

  if (kod && !letezik(kod)) setKod(null);
  const vsElo = vs.filter(letezik);
  if (vsElo.length !== vs.length) setVs(vsElo);

  const kivalaszt = useCallback((k: string) => setKod(k), []);
  const bezar = useCallback(() => setKod(null), []);
  const setMutatoKulcs = useCallback((k: string) => setMutatoKulcsState(mutatoByKulcs(k).kulcs), []);
  const vsHozzaad = useCallback((k: string) => setVs((v) => (v.includes(k) || v.length >= VS_MAX ? v : [...v, k])), []);
  const vsKivesz = useCallback((k: string) => setVs((v) => v.filter((x) => x !== k)), []);
  const vsTorol = useCallback(() => setVs([]), []);
  const osszehasonlit = useCallback(() => setKod(null), []);

  return {
    kod, vs, mutato: mutatoByKulcs(mutatoKulcs), iparag,
    kivalaszt, bezar, setMutatoKulcs, setIparag, vsHozzaad, vsKivesz, vsTorol, osszehasonlit,
  };
}
```

- [ ] **Step 2: `OsszehasonlitasCsik.tsx`**

```tsx
'use client';

import { X } from 'lucide-react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

/** A panel tetején: az összehasonlítás-halmaz chipjei és az „Összehasonlítás (n)" gomb. */
export function OsszehasonlitasCsik({ orszagok, onKivesz, onOsszehasonlit }: {
  /** A halmaz rekordjai a hozzáadás sorrendjében. */
  orszagok: TerkepOrszag[];
  onKivesz: (kod: string) => void;
  onOsszehasonlit: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border bg-muted/40 px-2.5 py-2 text-xs">
      <span className="text-muted-foreground">Összehasonlítás:</span>
      {orszagok.map((o) => (
        <Badge key={o.kod} variant="secondary" className="gap-1 pr-1">
          {o.nev}
          <button
            type="button"
            className="rounded-full p-0.5 hover:bg-foreground/10"
            aria-label={`${o.nev} kivétele`}
            onClick={() => onKivesz(o.kod)}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      {orszagok.length >= 2 ? (
        <Button type="button" size="xs" className="ml-auto" onClick={onOsszehasonlit}>
          Összehasonlítás ({orszagok.length})
        </Button>
      ) : (
        <span className="ml-auto text-muted-foreground">Válassz még egy országot</span>
      )}
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
import { VS_MAX } from './useTerkepAllapot';

const SAV_SZIN = SKALA_SZINEK[3];

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
    <li className="flex items-center gap-1.5 py-0.5">
      {hely !== undefined && <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground">{hely}.</span>}
      <button
        type="button"
        onClick={() => onKivalaszt(o.kod)}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left text-sm hover:bg-muted/60"
      >
        <span className={sav !== undefined ? 'w-28 shrink-0 truncate font-medium' : 'min-w-0 flex-1 truncate font-medium'}>{o.nev}</span>
        {sav !== undefined && (
          <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-sm bg-muted">
            {/* Inline style szándékosan: a sáv színe a térkép skálájából jön. */}
            <span className="block h-full" style={{ width: `${Math.round(sav * 100)}%`, background: SAV_SZIN }} />
          </span>
        )}
        {ertek !== undefined && <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">{ertek}</span>}
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={benne ? `${o.nev} kivétele az összehasonlításból` : `${o.nev} hozzáadása az összehasonlításhoz`}
        title={!benne && vsTele ? `Legfeljebb ${VS_MAX} ország` : undefined}
        disabled={!benne && vsTele}
        onClick={() => onVsToggle(o.kod)}
      >
        {benne ? <Check /> : <Plus />}
      </Button>
    </li>
  );
}

/** A térkép melletti panel kijelölés nélkül: rangsor (számszerű mutató) vagy csoportosított lista (kategorikus). */
export function RangsorPanel({ mutato, rangsor, csoportok, tartomany, szamlalo, vs, onKivalaszt, onVsToggle }: {
  mutato: Mutato;
  rangsor: Rangsor | null;
  csoportok: Csoport[];
  tartomany: Tartomany | null;
  /** A fejléc számláló szövege (pl. „14 ország adattal · 4 adat nélkül"). */
  szamlalo: string;
  vs: readonly string[];
  onKivalaszt: (kod: string) => void;
  onVsToggle: (kod: string) => void;
}) {
  const vsTele = vs.length >= VS_MAX;
  // A sáv ugyanazt a (lineáris vagy symlog) arányt használja, mint a térkép színe.
  const sav = mutato.tipus === 'szam' && tartomany ? arany(mutato, tartomany) : () => 1;
  const sor = (o: TerkepOrszag, extra: { hely?: number; sav?: number; ertek?: string } = {}) => (
    <OrszagSor key={o.kod} o={o} {...extra} benne={vs.includes(o.kod)} vsTele={vsTele} onKivalaszt={onKivalaszt} onVsToggle={onVsToggle} />
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rangsor · {mutato.cimke}</CardTitle>
        <CardDescription>{szamlalo}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {mutato.tipus === 'szam' && rangsor ? (
          <>
            {rangsor.sorok.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ehhez a mutatóhoz még nincs adat.</p>
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
import { SZAM_MUTATOK, type Mutato } from '../../../../lib/terkep-mutatok';
import { cn } from '../../../../lib/utils';
import { VS_MAX } from './useTerkepAllapot';

function Sor({ cimke, kiemelt, orszagok, plusz, children }: {
  cimke: string;
  kiemelt?: boolean;
  orszagok: TerkepOrszag[];
  /** Van-e „+ Ország" oszlop (üres cella kell a sor végére). */
  plusz: boolean;
  children: (o: TerkepOrszag) => ReactNode;
}) {
  return (
    <TableRow className={cn(kiemelt && 'bg-muted/60')}>
      <TableCell className="font-medium whitespace-normal text-muted-foreground">{cimke}</TableCell>
      {orszagok.map((o) => <TableCell key={o.kod} className="align-top whitespace-normal">{children(o)}</TableCell>)}
      {plusz && <TableCell />}
    </TableRow>
  );
}

/** 2–4 ország adatai egymás mellett; a térképen választott számszerű mutató sora kiemelt, soronként a legnagyobb érték félkövér. */
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
  const plusz = orszagok.length < VS_MAX;
  const felirat = (o: TerkepOrszag) =>
    mutato.tipus === 'szam' ? `${o.nev} · ${formatSzam(mutato.ertek(o), mutato.utotag)}` : o.nev;
  return (
    <Card>
      <CardHeader className="flex items-start gap-2">
        <div className="min-w-0">
          <CardTitle>Összehasonlítás</CardTitle>
          <CardDescription>{orszagok.length} ország · a térkép mutatójának sora kiemelve</CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={onTorol}>Törlés</Button>
      </CardHeader>
      <CardContent className="overflow-x-auto px-0">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className="w-28" />
              {orszagok.map((o) => (
                <TableHead key={o.kod} className="min-w-32">
                  <span className="flex items-center gap-1">
                    <button type="button" className="truncate font-semibold text-foreground hover:underline" onClick={() => onKivalaszt(o.kod)}>
                      {o.nev}
                    </button>
                    <Button type="button" variant="ghost" size="icon-xs" aria-label={`${o.nev} kivétele`} onClick={() => onKivesz(o.kod)}>
                      <X />
                    </Button>
                  </span>
                </TableHead>
              ))}
              {plusz && (
                <TableHead className="min-w-40">
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
              const legjobb = Math.max(...orszagok.map((o) => m.ertek(o) ?? -Infinity));
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

- [ ] **Step 1: `ProfilKivonat.tsx` – új propok, mutató-sor, összehasonlítás-gomb**

Az importokhoz vedd fel:

```tsx
import { formatSzam as sz } from '../../../../lib/szam';   // már van, marad
import type { Mutato, Rangsor } from '../../../../lib/terkep-mutatok';
```

A props-interface és a destrukturálás bővül (a meglévő propok maradnak):

```tsx
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
  /** Tele a halmaz (4) – ilyenkor a hozzáadás letiltva. */
  vsTele: boolean;
  /** Hozzáadás / kivétel (a hívó dönti el `benneVs` alapján). */
  onVs: () => void;
}) {
```

A függvénytörzs elején (a `const poszt = …` után) a mutató-sor számítása:

```tsx
  let mutatoSor: string | null = null;
  if (mutato.tipus === 'szam') {
    const v = mutato.ertek(o);
    const sor = rangsor?.sorok.find((s) => s.o.kod === o.kod);
    mutatoSor = v === null ? 'nincs adat' : `${sz(v, mutato.utotag)}${sor && rangsor ? ` · ${sor.hely}./${rangsor.sorok.length}` : ''}`;
  }
```

A `<CardContent className="flex flex-col gap-4">` első gyermekeként (az `o.allapot === 'nincs'` feltétel elé):

```tsx
        {mutatoSor !== null && (
          <p className="text-sm">
            <span className="text-muted-foreground">{mutato.cimke}: </span>
            <span className={mutatoSor === 'nincs adat' ? 'text-muted-foreground' : 'font-mono'}>{mutatoSor}</span>
          </p>
        )}
```

A `<CardFooter>`-ben az „Üzenet a poszttal" link után, a `SzerkesztesGomb` elé:

```tsx
        <Button
          type="button"
          variant="outline"
          disabled={!benneVs && vsTele}
          title={!benneVs && vsTele ? 'Legfeljebb 4 ország' : undefined}
          onClick={onVs}
        >
          {benneVs ? 'Kivétel az összehasonlításból' : 'Összehasonlításhoz'}
        </Button>
```

- [ ] **Step 2: `TerkepPanel.tsx`**

```tsx
'use client';

import { useMemo } from 'react';
import { useApp } from '../../../../components/AppShell';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { canEditProfil } from '../../../../lib/orszagprofil-jog';
import { jeloltek, type Csoport, type Rangsor } from '../../../../lib/terkep-mutatok';
import { OsszehasonlitasCsik } from './OsszehasonlitasCsik';
import { OsszehasonlitasPanel } from './OsszehasonlitasPanel';
import { ProfilKivonat } from './ProfilKivonat';
import { RangsorPanel } from './RangsorPanel';
import { VS_MAX, type TerkepAllapot } from './useTerkepAllapot';

/**
 * A térkép melletti panel: `kod` → kivonat (fölötte a csík, ha van halmaz); különben `vs` ≥ 2 →
 * összehasonlítás; különben rangsor (fölötte a csík, ha 1 elem van a halmazban).
 */
export function TerkepPanel({ adatok, allapot, rangsor, csoportok, tartomany, szamlalo, ev, most, valasztEvAction }: {
  adatok: TerkepOrszag[];
  allapot: TerkepAllapot;
  rangsor: Rangsor | null;
  csoportok: Csoport[];
  tartomany: { min: number; max: number } | null;
  szamlalo: string;
  ev: number;
  most: number;
  valasztEvAction: (formData: FormData) => Promise<void>;
}) {
  const { user } = useApp();
  const { kod, vs, mutato } = allapot;
  const sel = kod ? adatok.find((o) => o.kod === kod) ?? null : null;
  const vsOrszagok = vs.map((k) => adatok.find((o) => o.kod === k)).filter((o): o is TerkepOrszag => !!o);
  const vsTele = vs.length >= VS_MAX;
  const jeloltLista = useMemo(() => jeloltek(adatok, vs, mutato), [adatok, vs, mutato]);
  const onVsToggle = (k: string) => (vs.includes(k) ? allapot.vsKivesz(k) : allapot.vsHozzaad(k));
  const csik = vs.length > 0 && (
    <OsszehasonlitasCsik orszagok={vsOrszagok} onKivesz={allapot.vsKivesz} onOsszehasonlit={allapot.osszehasonlit} />
  );

  if (sel) {
    return (
      <>
        {csik}
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
          onVs={() => onVsToggle(sel.kod)}
        />
      </>
    );
  }
  if (vsOrszagok.length >= 2) {
    return (
      <OsszehasonlitasPanel
        orszagok={vsOrszagok}
        jeloltek={jeloltLista}
        mutato={mutato}
        onKivalaszt={allapot.kivalaszt}
        onKivesz={allapot.vsKivesz}
        onHozzaad={allapot.vsHozzaad}
        onTorol={allapot.vsTorol}
      />
    );
  }
  return (
    <>
      {csik}
      <RangsorPanel
        mutato={mutato}
        rangsor={rangsor}
        csoportok={csoportok}
        tartomany={tartomany}
        szamlalo={szamlalo}
        vs={vs}
        onKivalaszt={allapot.kivalaszt}
        onVsToggle={onVsToggle}
      />
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
  csoportok as szamolCsoportok, KATEGORIA_MUTATOK, MUTATOK, rangsor as szamolRangsor, szures, SZAM_MUTATOK,
  tartomany as szamolTartomany,
} from '../../../../lib/terkep-mutatok';
import { TerkepPanel } from './TerkepPanel';
import { useTerkepAllapot } from './useTerkepAllapot';
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
  const { mutato, iparag } = allapot;

  // A rangsor/csoportok a szűrt halmazon, a tartomány (színskála) szándékosan a szűretlenen.
  const rangsor = useMemo(() => (mutato.tipus === 'szam' ? szamolRangsor(adatok, mutato, iparag) : null), [adatok, mutato, iparag]);
  const csoportok = useMemo(() => (mutato.tipus === 'kategoria' ? szamolCsoportok(adatok, mutato, iparag) : []), [adatok, mutato, iparag]);
  const tartomany = useMemo(() => (mutato.tipus === 'szam' ? szamolTartomany(adatok, mutato) : null), [adatok, mutato]);
  const szamlalo = rangsor
    ? `${rangsor.sorok.length} ország adattal · ${rangsor.adatNelkul.length} adat nélkül`
    : iparag
      ? `${szures(adatok, iparag).length} ország emeli ki ezt az iparágat`
      : `${adatok.length} poszt · ${adatok.filter((o) => o.allapot === 'friss').length} profil (${ev})`;

  return (
    <div className="flex max-w-[1600px] flex-wrap items-start gap-4">
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
          <span className="ml-auto text-xs text-muted-foreground">{szamlalo}</span>
          {sajatKod && (
            <SzerkesztesGomb
              kod={sajatKod}
              most={most}
              szerkeszthetEv={canEditProfil(user, sajatKod, ev, most)}
              szerkeszthetMost={canEditProfil(user, sajatKod, most, most)}
              action={valasztEvAction}
              felirat="Saját országprofil"
            />
          )}
        </CardHeader>
        <CardContent className="p-0">
          <VilagTerkep
            adatok={adatok}
            mutato={mutato}
            iparag={iparag}
            kivalasztott={allapot.kod}
            osszehasonlitas={allapot.vs}
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
  );
}
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
7. Kijelölés a rangsorból: `$B click` az első ország nevére a panelen → a kivonat kártya jelenik meg („Teljes profil", „Összehasonlításhoz", a mutató sora „K+F ráfordítás (GERD): …"). `$B click "text=Összehasonlításhoz"` → a gomb felirata „Kivétel az összehasonlításból", fölötte a csík „Összehasonlítás: <ország>" és „Válassz még egy országot".
8. `$B click "[aria-label=Bezárás]"` → rangsor a csíkkal; `$B click` egy másik ország „+" gombjára (`[aria-label$='hozzáadása az összehasonlításhoz']` első találat) → az összehasonlító tábla jelenik meg 2 oszloppal: `$B text` tartalmazza „Összehasonlítás", „2 ország", „Attasé", „Állapot", „Kiemelt iparágak", „Tagságok", „KFI-prioritások", és a „+ Ország" select.
9. `$B select "select[aria-label='Ország hozzáadása']" <harmadik kód>` (a kódot `$B js "[...document.querySelectorAll('select[aria-label=\"Ország hozzáadása\"] option')].map(o=>o.value).slice(1,2)"`-vel olvasd ki) → 3 oszlop. `$B click "text=Törlés"` → vissza a rangsor.
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
git add "app/(app)/terkep/components/TerkepNezet.tsx"
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
`/terkep` (server page: `listTerkepAdat` + a fejléc évét (cookie) mutatja, `?o=` marad; `terkep/components/TerkepNezet` kliens: **Mutató** `Select` két csoporttal (Kategória: Kiemelt iparág, Profil állapota; Számszerű: GDP/fő, GDP, GDP-növekedés, lakosság, GERD, kitöltöttség, rendezvények száma – `MUTATOK`), iparág-szűrő `Select` minden mutatónál – a „Mind" értéke `__mind`, mert a Base UI Select üres stringet nem választ –, `VilagTerkep`, és a `TerkepPanel`: az állapot a `useTerkepAllapot` hookban (`kod` egyes kijelölés, `vs` összehasonlítás-halmaz legfeljebb `VS_MAX`=4, `mutato`, `iparag`), panel-sorrend `kod` → `ProfilKivonat` (mutató-sor + „Összehasonlításhoz" gomb), különben `vs` ≥ 2 → `OsszehasonlitasPanel` (oszlop országonként, a térkép mutatójának sora kiemelt, soronként a legnagyobb félkövér, „+ Ország" `NativeSelect` a `jeloltek()` listából, „Törlés" = bezárás), különben `RangsorPanel` (számszerű: hely/sáv/érték, „Nincs adat" névsor; kategorikus: csoportok); az `OsszehasonlitasCsik` chipjei a kivonat és a rangsor fölött, ha a halmaz nem üres; attasénak „Saját országprofil" gomb)
```

- [ ] **Step 3: CLAUDE.md – „Amire figyelni kell" pont**

A `- A \`/terkep\` page a \`TerkepNezet\`-et \`key={kezdoKod}\`-dal rendereli…` pontot cseréld:

```
- A `/terkep` page a `TerkepNezet`-et `key={kezdoKod}`-dal rendereli, hogy a `?o=` változásakor (vissza/előre, oldalsáv) a kezdő kiválasztás frissüljön; az év szándékosan nincs a key-ben, a `useTerkepAllapot` render közben törli a kijelölést és a halmaz nem létező elemeit, ha az ország eltűnik az új év adataiból. A mutató, a szűrő és az összehasonlítás-halmaz kliens-állapot, nem URL-paraméter.
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
