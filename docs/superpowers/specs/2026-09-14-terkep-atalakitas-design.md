# Térkép-oldal átalakítása: mutatók, rangsor, összehasonlítás, React-térkép

Dátum: 2026-09-14

## Cél

A `/terkep` oldal három irányban változik:

1. **Jobb oldali panel kiválasztás nélkül**: a mostani „Válassz országot" + állapot-darabszám +
   legutóbb frissített lista helyett **rangsor** a térképen választott mutató szerint, kattintható
   sorokkal.
2. **Modernebb térkép**: a CDN-ről töltődő `<tet-world-map>` webkomponenst egy React-komponens
   váltja (d3-geo modulok npm-ből, a world-atlas 110m TopoJSON is npm-ből), nagyítással,
   mozgatással, régió-gyorsválasztóval, folytonos színskálával a számszerű mutatókhoz és
   gazdagabb tooltippel. Stílus: világos, letisztult (halvány óceán és rácsháló, fehér határok,
   zöld szekvenciális skála, lebegő jelmagyarázat-kártya).
3. **Összehasonlítás**: a két színezési fül helyett **Mutató**-választó (kategorikus és
   számszerű mutatók), az iparág-szűrő minden mutatónál működik, és 2–4 kijelölt ország adatai
   egy összehasonlító táblában egymás mellé kerülnek.

Nem része: URL-állapot a mutatóhoz és az összehasonlításhoz (a `?o=` marad), országcímkék a
térképen, pin-méret második mutatóként, sötét téma, DB-séma változás, a monitoring vagy a
tudástár érintése.

## Döntések és indoklás

- **React-komponens d3-geo modulokkal** (nem a webkomponens bővítése, nem MapLibre/Leaflet): egy
  stílusvilág (Tailwind, shadcn), típusos kód, nincs CDN- és internetfüggés, a mutató- és
  színskála-logika tiszta `lib/` függvényekbe kerül, amit a térkép, a rangsor és az
  összehasonlítás közösen használ.
- **A színskála tartománya az összes adattal rendelkező ország min–max-a**, nem a szűrté: az
  iparág-szűrő váltogatásakor ne ugráljanak a színek.
- **Két állapotváltozó, nincs „nyitva" flag**: `kod` (egyes kijelölés) és `vs`
  (összehasonlítás-halmaz). A panel sorrendje egyértelmű, a térkép-kattintás mindig a kivonatot
  mutatja.
- **A zoom közvetlenül a DOM-on dolgozik**: a d3-zoom esemény a `<g>` transformját és a pinek
  sugarát állítja, nem React-állapoton át; görgetésenként nem renderel újra ~180 path-ot.

## Adatréteg

### `db/queries/orszagprofil.ts` – `TerkepOrszag` bővítése

Két új mező a `listTerkepAdat` eredményében (nincs sémaváltozás, nincs migráció):

```ts
gerd: number | null;              // kfiRendszer.gerd, ha a blokk mentett, különben null
prioritasok: KfiPrioritas[];      // kfiRendszer.prioritasok, ha mentett, különben []
```

A többi mező változatlan. A `React.cache()` és a „ne mutáld" szabály marad.

### `lib/terkep-mutatok.ts` (új, framework-mentes)

A `TerkepOrszag` **csak típusként** jön a server-only modulból (`import type`), ahogy a
`WorldMap.tsx` is tette. A d3-scale és d3-interpolate tiszta függvénykönyvtárak, DOM nélkül,
ezért használhatók itt.

```ts
export const MUTATO_KULCSOK = [
  'iparag', 'allapot',                                            // kategorikus
  'gdpEgyFore', 'gdp', 'gdpNovekedes', 'lakossag', 'gerd',        // számszerű
  'kitoltottseg', 'rendezvenyDb',
] as const;
export type MutatoKulcs = (typeof MUTATO_KULCSOK)[number];

export interface SzamMutato {
  kulcs: MutatoKulcs; tipus: 'szam'; cimke: string; utotag: string;
  ertek: (o: TerkepOrszag) => number | null;
}
export interface KategoriaMutato {
  kulcs: MutatoKulcs; tipus: 'kategoria'; cimke: string;
  kategoria: (o: TerkepOrszag) => string | null;   // null = nincs kategória
  sorrend: readonly string[];                        // a csoportok és a jelmagyarázat sorrendje
  szinek: Record<string, string>;
  cimkek: Record<string, string>;                    // kategória → felirat
  csakHasznalt: boolean;                             // true: csak a használt kategóriák (iparág); false: mind (állapot)
  nincsCimke: string;                                // a null kategória felirata
}
export type Mutato = SzamMutato | KategoriaMutato;
export const MUTATOK: readonly Mutato[];
export const ALAP_MUTATO: MutatoKulcs = 'iparag';
/** Ismeretlen kulcsra az alapértelmezett mutatót adja. */
export function mutatoByKulcs(k: string): Mutato;
```

| kulcs | tipus | cimke (forrás) | utótag | ertek / kategoria |
| --- | --- | --- | --- | --- |
| `iparag` | kategoria | „Kiemelt iparág" | – | `o.iparagak[0] ?? null`; sorrend `IPARAGAK`, színek `IPARAG_SZINEK`, `nincsCimke` „nincs kiemelt iparág" |
| `allapot` | kategoria | „Profil állapota" | – | `o.allapot`; sorrend `ALLAPOTOK`, színek `ALLAPOT_SZINEK`, címkék `ALLAPOT_CIMKE` |
| `gdpEgyFore` | szam | `MEZO_CIMKEK.alapadatok.gdpEgyFore` | ` USD` | `o.alapadatok?.gdpEgyFore ?? null` |
| `gdp` | szam | `MEZO_CIMKEK.alapadatok.gdp` | ` mrd USD` | `o.alapadatok?.gdp ?? null` |
| `gdpNovekedes` | szam | `MEZO_CIMKEK.alapadatok.gdpNovekedes` | ` %` | `o.alapadatok?.gdpNovekedes ?? null` |
| `lakossag` | szam | `MEZO_CIMKEK.alapadatok.lakossag` | ` fő` | `o.alapadatok?.lakossag ?? null` |
| `gerd` | szam | `MEZO_CIMKEK.kfiRendszer.gerd` | ` %` | `o.gerd` |
| `kitoltottseg` | szam | „Kitöltöttség (mentett blokk)" | `/8` (`BLOKK_KULCSOK.length`) | `o.allapot === 'nincs' ? null : o.mentettDb` |
| `rendezvenyDb` | szam | „Rendezvények száma" | `` | `o.allapot === 'nincs' ? null : o.rendezvenyDb` |

A számok megjelenítése mindenhol `formatSzam(ertek, utotag)` (`lib/szam.ts`), `null` → „–".

Rangsor, csoportok, tartomány:

```ts
export interface RangsorSor { o: TerkepOrszag; ertek: number; hely: number }
export interface Rangsor { sorok: RangsorSor[]; adatNelkul: TerkepOrszag[] }
/** iparag: '' = nincs szűrő; a szűrő a kiemelt iparágak listáján (`o.iparagak`) keres. */
export function rangsor(adatok: readonly TerkepOrszag[], m: SzamMutato, iparag: string): Rangsor;
export interface Csoport { kategoria: string | null; cimke: string; szin: string; orszagok: TerkepOrszag[] }
export function csoportok(adatok: readonly TerkepOrszag[], m: KategoriaMutato, iparag: string): Csoport[];
/** Az ÖSSZES (szűretlen) adattal rendelkező ország min–max-a; nincs adat → null. */
export function tartomany(adatok: readonly TerkepOrszag[], m: SzamMutato): { min: number; max: number } | null;
export function szures(adatok: readonly TerkepOrszag[], iparag: string): TerkepOrszag[];
/** Az összehasonlításhoz felkínált országok a `kizart` kódok nélkül: számszerűnél érték szerint csökkenő
 *  (a szűrőtől függetlenül), az érték nélküliek a végén név szerint; kategorikusnál név szerint. */
export function jeloltek(adatok: readonly TerkepOrszag[], kizart: readonly string[], m: Mutato): TerkepOrszag[];
/** Egy posztos ország kitöltési színe; null = számszerű mutató érték nélkül (sraffozás). */
export function orszagSzin(o: TerkepOrszag, m: Mutato, iparag: string, skala: ((v: number) => string) | null): string | null;
```

- `rangsor`: a szűrt országok közül az `ertek !== null`-ok csökkenő érték szerint, azonos értéknél
  név szerint (`localeCompare(…, 'hu')`); `hely = 1 + (nála szigorúan nagyobb értékűek száma)`
  („1224" helyezés). Az `adatNelkul` a szűrt, de érték nélküli országok név szerint.
- `csoportok`: a `sorrend` szerinti kategóriák (az `iparag` mutatónál csak a **használt**
  kategóriák, az `allapot`-nál mind a három, üresen is), végül a `null` kategória csoportja
  (`nincsCimke`, szín `TERKEP_SZINEK.semleges`), ha van benne ország. Az országok név szerint.
- Színskála és fix színek:

```ts
export const SKALA_SZINEK = ['#e3f1ec', '#8fcbbd', '#2f9a82', '#0f6b57', '#053f33'] as const;
/** d3 scaleSequential + piecewise(interpolateLab); min === max esetén a középső szín. */
export function szinSkala(min: number, max: number): (v: number) => string;
export const TERKEP_SZINEK = {
  ocean: '#f4f7fb', gombKontur: '#dde1e7', racs: '#e7ebf1', szarazfold: '#e6eaef', hatar: '#ffffff',
  halvany: '#e3e7ec', semleges: '#5f6b7a', nincsAdat: '#c5ccd6', kontur: '#10151d',
} as const;
```

- Régiók:

```ts
export interface Regio { kulcs: string; cimke: string; bbox: [[number, number], [number, number]] | null }
export const REGIOK: readonly Regio[] = [
  { kulcs: 'vilag', cimke: 'Világ', bbox: null },
  { kulcs: 'europa', cimke: 'Európa', bbox: [[-25, 34], [45, 72]] },
  { kulcs: 'azsia', cimke: 'Ázsia', bbox: [[40, -10], [150, 60]] },
  { kulcs: 'amerika', cimke: 'Amerika', bbox: [[-170, -56], [-30, 72]] },
  { kulcs: 'afrika', cimke: 'Afrika', bbox: [[-20, -36], [55, 38]] },
  { kulcs: 'kozelKelet', cimke: 'Közel-Kelet', bbox: [[25, 12], [65, 42]] },
];
```

A bbox `[[nyugat, dél], [kelet, észak]]` fokban; a térkép a vetített sarkok és oldalfelezők
befoglaló téglalapjára illeszt.

### Csomagok

`d3-geo`, `d3-zoom`, `d3-selection`, `d3-transition` (a gombok animált zoomjához), `d3-scale`,
`d3-interpolate`, `topojson-client`, `world-atlas` (a `countries-110m.json` innen jön, dinamikus
importtal, külön chunkban). Típusok: `@types/d3-geo`, `@types/d3-zoom`, `@types/d3-selection`,
`@types/d3-transition`, `@types/d3-scale`, `@types/d3-interpolate`, `@types/topojson-client`,
`@types/topojson-specification`, `@types/geojson`.

Törlődik: `components/WorldMap.tsx`, `public/tet-world-map.js`, a `TerkepUres.tsx`, a CDN
`<Script>` tagek.

## Térkép-komponens (`app/(app)/terkep/components/`)

Csak a `/terkep` használja, ezért a route alatt marad. Fájlok:

- `useVilagAtlasz.ts` – modulszintű, egyszer futó promise: `import('world-atlas/countries-110m.json')`
  → `topojson.feature(topo, topo.objects.countries).features`. Visszatérés
  `{ feats: Feature[] | null; hiba: boolean }`.
- `VilagTerkep.tsx` – az SVG, a zoom és a hover.
- `Jelmagyarazat.tsx`, `TerkepTooltip.tsx`, `RegioGombok.tsx`.

### `VilagTerkep` propjai

```ts
{
  adatok: TerkepOrszag[];
  mutato: Mutato;
  iparag: string;                  // szűrő, '' = nincs
  kivalasztott: string | null;     // kód
  osszehasonlitas: readonly string[];
  tartomany: { min: number; max: number } | null;   // a hívó (TerkepNezet) számolja useMemo-ban,
  csoportok: Csoport[];                             // a panel is ugyanezt kapja – nincs dupla számítás
  rangsor: Rangsor | null;
  onSelect: (kod: string) => void;
}
```

### Rajzolás

- `<svg viewBox="0 0 960 505" role="img" aria-label="TéT attasé posztok világtérképe">`,
  szélesség 100 %, a konténer `position: relative`, `min-height` a betöltő helykitöltővel azonos.
- Vetület `geoNaturalEarth1().fitExtent([[6, 6], [954, 499]], { type: 'Sphere' })`, `geoPath`.
  Gömb-háttér `ocean` + `gombKontur`, rácsháló `geoGraticule10()` `racs` színnel.
- Egy `<g>` (ref) tartalmazza a poligonokat és a pineket; ezen dolgozik a zoom.
- Poligon → rekord párosítás a szótár `geo` mezőjével (`properties.name`), mint ma. Kitöltés:
  - nincs rekord → `szarazfold`;
  - iparág-szűrő kizárja → `halvany`;
  - kategorikus mutató → `szinek[kategoria]`, `null` kategória → `semleges`;
  - számszerű mutató, érték van → `szinSkala(min, max)(ertek)`; érték nincs → sraffozott
    `<pattern>` (`nincsAdat` csíkok `szarazfold` alapon).
- Kontúr: alap `hatar` 0,5 px; összehasonlításban lévő ország `kontur` 1,2 px; kijelölt `kontur`
  1,8 px és a `<g>` végére emelve (`raise`), hogy a szomszéd ne takarja. Minden path
  `vector-effect="non-scaling-stroke"`.
- Pin minden rekordhoz `proj(o.lonlat)` helyen (a poligon nélküli országoknak csak ez látszik):
  külső kör `r = 5.5 / k`, kitöltése a rekord kitöltési színe, fehér kontúr; belső fehér pont.
  A kijelölt pin kontúrja `kontur`.
- Posztos poligon és pin: `cursor: pointer`, kattintásra `onSelect(kod)`.

### Zoom és régiók

- `zoom<SVGSVGElement, unknown>().scaleExtent([1, 8]).translateExtent([[0, 0], [960, 505]]).clickDistance(4)`,
  `useEffect`-ben az `<svg>`-re kötve; a `zoom` esemény a `<g>` `transform` attribútumát és a pinek
  `r`-jét (`5.5 / k`, belső pont `1.8 / k`) közvetlenül állítja. A `clickDistance(4)` miatt az
  apró egérmozgás nem nyeli el a kattintást.
- Gombok jobb felül (shadcn `Button` `outline`, ikon-méret, `aria-label`): `+` (`scaleBy 1.5`),
  `−` (`scaleBy 1/1.5`), `⌂` (`zoomIdentity`); 300 ms tranzícióval.
- Régió-gombok bal felül (`RegioGombok`, `Button` `outline`/`secondary` toggle, `aria-pressed`):
  a `REGIOK` bbox-ából `k = min(8, 0.9 / max(szélesség / 960, magasság / 505))`, a téglalap
  közepét a nézet közepére tolva, tranzícióval; a `vilag` a visszaállítás. Az aktív régió az
  utoljára megnyomott gomb; kézi zoom/mozgatás után egyik sem aktív.

### Tooltip

- React-állapot `{ nev: string; o: TerkepOrszag | null; x: number; y: number } | null`, a
  `pointermove` a konténerhez képest számolt koordinátákkal frissíti, `pointerleave` törli.
- A `TerkepTooltip` `pointer-events: none`, a kurzor fölé pozicionálva, vízszintesen a
  konténeren belül tartva.
- Tartalom posztos országnál: **név**; attasé (vagy „nincs aktív attasé") · főváros (ha van);
  számszerű mutatónál `cimke: érték · hely./n` (`n` = rangsorolt országok száma; az
  iparág-szűrő által kizárt ország nincs a rangsorban, nála csak `cimke: érték`) vagy
  `cimke: nincs adat`; kategorikus mutatónál a kategória felirata; `ALLAPOT_CIMKE` + év; az első
  két kiemelt iparág. Poszt nélküli poligonnál: **név** + „Nincs kihelyezett TéT attasé".

### Jelmagyarázat

Lebegő kártya bal alul (`Card`-szerű, fehér, vékony keret, árnyék). Számszerű: a mutató címkéje,
gradiens csík a `SKALA_SZINEK`-ből, alatta `formatSzam(min)` és `formatSzam(max)` az utótaggal,
majd „nincs adat" (sraffozott négyzet) és „nincs poszt" (`szarazfold`). Ha nincs tartomány
(egyetlen ország sem ad értéket), csak a két utóbbi. Kategorikus: a `csoportok` színnégyzetei és
feliratai (csak a használt kategóriák az iparágnál) + „nincs poszt".

### Betöltés és hiba

Amíg a `feats` `null`: a térkép helyén azonos magasságú, halvány helykitöltő „Térkép betöltése…"
szöveggel. `hiba` esetén ugyanott: „A térkép nem tölthető be." Internet nem szükséges.

## Panel és fejléc (`app/(app)/terkep/components/`)

### Fejléc (a térkép-kártya `CardHeader`-e)

- **Mutató** `Select` (a Base UI `Select` `items` térképpel, mint az iparág-szűrő): két csoport,
  „Kategória" (Kiemelt iparág, Profil állapota) és „Számszerű" (a 7 mutató), címkével.
  Alapértelmezés `ALAP_MUTATO`.
- **Iparág**-szűrő: változatlan (`__mind` = nincs), minden mutatónál él.
- Számláló szöveg: számszerű mutatónál `„<sorok.length> ország adattal · <adatNelkul.length> adat nélkül"`;
  kategorikusnál a mai szövegek (szűrővel „N ország emeli ki ezt az iparágat", különben
  „N poszt · M profil (év)").
- „Saját országprofil" gomb (`SzerkesztesGomb`) változatlan.

### Állapot: `useTerkepAllapot.ts`

```ts
export function useTerkepAllapot(adatok: TerkepOrszag[], kezdoKod: string | null): {
  kod: string | null; vs: string[]; mutato: Mutato; iparag: string;
  kivalaszt(kod: string): void;   // kod := kod
  bezar(): void;                  // kod := null
  setMutatoKulcs(k: string): void; setIparag(i: string): void;
  vsHozzaad(kod: string): void;   // ha nincs benne és vs.length < 4
  vsKivesz(kod: string): void; vsTorol(): void;
  osszehasonlit(): void;          // kod := null (az összehasonlítás látszik, ha vs.length >= 2)
}
```

- `VS_MAX = 4`.
- Render közbeni igazítás (a mai mintával): ha `kod` nincs az `adatok`-ban → `null`; a `vs`-ből az
  `adatok`-ban nem szereplő kódok kikerülnek (csak akkor `set`, ha tényleg változik).

### `TerkepPanel.tsx` – melyik nézet látszik

1. `kod` → `ProfilKivonat` (előtte `OsszehasonlitasCsik`, ha `vs.length > 0`).
2. különben `vs.length >= 2` → `OsszehasonlitasPanel`.
3. különben `RangsorPanel` (előtte `OsszehasonlitasCsik`, ha `vs.length === 1`).

### `OsszehasonlitasCsik.tsx`

Chipek (`Badge` + × gomb, `aria-label="<név> kivétele"`) a `vs` országaival; mellette
`Összehasonlítás (n)` gomb (`osszehasonlit`), 1 elemnél helyette „Válassz még egy országot"
szöveg.

### `RangsorPanel.tsx` (a `TerkepUres` helyett)

- Cím: „Rangsor · <mutató címke>", alcím a számláló szöveggel.
- Számszerű: sorok `hely.`, ország neve, sáv (szélesség `(ertek − min) / (max − min)` a
  `tartomany` alapján; `min === max` → teljes), `formatSzam(ertek, utotag)` jobbra, monospace.
  A sor gombja `kivalaszt(kod)`; a sor végén `+` ikon-gomb (`vsHozzaad`, `aria-label`),
  benne lévő országnál pipa (`vsKivesz`), 4 elemnél a `+` letiltva („Legfeljebb 4 ország").
  Alatta „Nincs adat" szakasz a nevekkel (kattinthatók, ugyanígy `+` gombbal).
- Kategorikus: `csoportok` – csoport-fejléc színnégyzettel, felirattal, „N ország"; alatta a
  sorok ugyanazzal a gombozással; 0 elemű csoport csak fejlécet mutat.
- A lista nem lapozott (≈20 ország).

### `ProfilKivonat.tsx` (meglévő, bővül)

- Új sor a `CardContent` elején, számszerű mutatónál: `<cimke>` · `<érték> · <hely>./<n>` vagy
  „nincs adat"; a szűrő által kizárt (rangsorban nem szereplő) országnál helyezés nélkül.
  Kategorikusnál nincs plusz sor.
- A lábléc új gombja: „Összehasonlításhoz" (`vsHozzaad`) / „Kivétel az összehasonlításból"
  (`vsKivesz`); 4 elemnél és nincs benne → letiltva, `title="Legfeljebb 4 ország"`.
- Propok ehhez: `mutato`, `rangsor` (a számított `Rangsor`, számszerűnél), `benneVs`, `vsTele`,
  `onVs()`.

### `OsszehasonlitasPanel.tsx` (új)

- shadcn `Table`: első oszlop a sorcímke, utána oszloponként egy ország (2–4). Fejléc-cella: az
  ország neve gombként (`kivalaszt`), mellette × (`vsKivesz`).
- Sorok sorrendben: Attasé (név, alatta főváros halványan), Állapot (`AllapotBadge` + év),
  Kiemelt iparágak (`IparagBadge` lista), majd a 7 számszerű mutató a `MUTATOK` sorrendjében
  (`formatSzam`), Tagságok (`alapadatok.tagsagok` vesszővel), KFI-prioritások (`prioritasok`
  vesszővel). Üres érték „–".
- A térképen választott számszerű mutató sora kiemelt háttérrel; számszerű sorban a legnagyobb
  érték félkövér (több egyenlő → mind).
- Utolsó oszlop, ha `vs.length < 4`: `NativeSelect` „+ Ország" – a `vs`-ben nem lévő országok a
  `jeloltek()` sorrendjében: számszerű mutatónál érték szerint csökkenő (a szűrőtől függetlenül)
  „Név · érték" felirattal, az adat nélküliek a végén név szerint; kategorikusnál név szerint;
  választásra `vsHozzaad`, a select üresre áll.
- Fejlécben „Törlés" gomb (`vsTorol`) – ez egyben a bezárás; a panel ekkor a rangsorra vált.
- Vízszintesen görgethető konténer (`overflow-x: auto`), a panel ne szélesedjen.

### `TerkepNezet.tsx` (meglévő, vékonyodik)

Csak a `useApp()`-ot, a `useTerkepAllapot`-ot, a `rangsor`/`csoportok`/`tartomany` számítását
(`useMemo`) és az elrendezést tartja: térkép-kártya (fejléc + `VilagTerkep`) és `TerkepPanel`.
A `page.tsx` változatlanul `key={kezdoKod}`-dal rendereli; az év szándékosan nincs a key-ben.

## Adatfolyam

```
page.tsx ── listTerkepAdat(ev) ──► TerkepNezet
                                     ├─ useTerkepAllapot(adatok, kezdoKod)  → kod, vs, mutato, iparag
                                     ├─ useMemo: rangsor | csoportok, tartomany   (lib/terkep-mutatok)
                                     ├─ VilagTerkep(adatok, mutato, iparag, kod, vs, onSelect)
                                     │    ├─ useVilagAtlasz()  (npm TopoJSON, egyszer)
                                     │    ├─ Jelmagyarazat, TerkepTooltip, RegioGombok
                                     └─ TerkepPanel(kod, vs, …) → ProfilKivonat | OsszehasonlitasPanel | RangsorPanel
```

Minden számítás kliens-oldali, az adat a szerverről egyszer jön; a mutató-váltás nem jár
kéréssel. Az évváltás (fejléc-cookie, `revalidatePath`) új `adatok`-ot ad, az állapot render
közben igazodik.

## Hibakezelés

- Atlasz-chunk hiba → szöveges üzenet a térkép helyén, a panel és a fejléc működik tovább.
- A szótár `geo` neve nincs az atlaszban → csak pin (mint ma).
- Ismeretlen mutató-kulcs → a `mutatoByKulcs` az `ALAP_MUTATO` mutatót adja.
- Számszerű mutató érték nélkül → sraffozás, „nincs adat" a rangsorban, „–" a táblában.
- `vs` kód, ami az új évben nincs az adatokban → render közben kikerül.

## Ellenőrzés

Nincs tesztkeretrendszer. Elvárt lépések:

1. `npx tsc --noEmit`, `npm run build` hibátlan.
2. gstack headless böngészővel a `/terkep`-en: a térkép betölt, a hálózati kérések között
   **nincs** `unpkg`/`jsdelivr` hívás; mutató-váltásra a jelmagyarázat és a rangsor cím/sorok
   változnak; iparág-szűrőre a rangsor rövidül; egy ország kattintására a kivonat, két ország
   `+`-ára az összehasonlító tábla jelenik meg 2 oszloppal, a „+ Ország" harmadikat ad; `+`/`−`/`⌂`
   és a régió-gombok a `<g>` transformját változtatják; nincs konzolhiba.
3. Attaséként a „Saját országprofil" gomb és a `?o=` kezdő kijelölés változatlanul működik.

## Dokumentáció

- `CLAUDE.md`: a „Térkép" bekezdés (webkomponens → React-komponens, npm atlasz, nincs CDN,
  `lib/terkep-mutatok.ts`, `TERKEP_SZINEK`), a `/terkep` route leírása (Mutató-választó, rangsor,
  összehasonlítás, `useTerkepAllapot`, panel-sorrend), az „Amire figyelni kell" pontok (a zoom
  DOM-on dolgozik; a tartomány szűretlen; `clickDistance`).
- `README.md`: a `/terkep` sor, a `public/tet-world-map.js` sor törlése, az internet-megjegyzés
  törlése.
