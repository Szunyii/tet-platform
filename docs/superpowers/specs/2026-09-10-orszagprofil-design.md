# Országprofil (évenkénti attasé-beadás, DB-alapú térkép) – tervezési spec

Dátum: 2026-09-10
Állapot: jóváhagyva

## Cél

Az Országprofil képernyő (`/terkep`) ma a `lib/data.ts` demó `POSTS` adataiból mutat
egy hétblokkos „országjelentést". A NIÜ új struktúrát adott: az országprofil az ország
tudományos, technológiai és innovációs ökoszisztémáját, KFI szakpolitikáját,
intézményrendszerét, nemzetközi kapcsolatait és a Magyarország számára releváns
együttműködési lehetőségeket mutatja be, két részben: **Alapadatok és gazdasági
háttér** + **KFI körkép** hét blokkban. A profilt az attasé **évente egyszer** adja be a
saját országára; a csillagos mezőknél nem csak szabadszöveg, hanem a kategóriához
tartozó választási lehetőségek is vannak.

A feature: DB tábla + évenkénti, blokkonként menthető szerkesztő oldal + a térkép és a
melléklevő panel átállítása a DB-s profilokra + teljes profil oldal. A demó `POSTS` a
térképről és a panelről kikerül (a monitoring még használja, ott marad).

## Döntések

| Kérdés | Döntés | Indok |
| --- | --- | --- |
| Terjedelem | Teljes feature: DB, űrlap, térkép-panel, teljes oldal | A felhasználó döntése. |
| Térkép színezése | Két metrika: kiemelt iparág, profil állapota (friss / elavult / nincs); szűrő a kiemelt iparágakra | A demó kockázat/nyitottság mezők az új struktúrában nem léteznek. |
| Beadás rendje | Országonként és évenként egy profil; az attasé a sajátját az aktuális évben bármikor szerkeszti, admin bármelyiket; korábbi évek megmaradnak, évválasztóval nézhetők | Előzmény kell, piszkozat-állapot nem. |
| Opciólisták | Fix szótár a kódban (`lib/orszagprofil-szotar.ts`) + „egyéb" szabadszöveg minden listás mező mellett | Mint a `KULCSSZAVAK`; admin-szerkeszthető szótár nem kell. |
| Űrlap | Egy szerkesztő oldal, minden blokk saját kártya saját Mentés gombbal | Részletekben tölthető, megszakadás nem veszít mindent. |
| Országkulcs | `lib/orszagok.ts` szótár (ISO 3166-1 alpha-2 kód, magyar név, world-atlas név, főváros-koordináta); a `user.orszag` és a `riport.orszag` ISO-kódot tárol | A térképnek world-atlas név és koordináta kell; a szabadszöveg elírásra törékeny. |
| Megjelenítés | A térkép melletti panel kivonat; a teljes profil külön oldalon (`/orszagprofil/[kod]`) | A panel 420 px széles, az új struktúra nem fér el. |
| Adatmodell | Egy `orszagprofil` tábla, blokkonként egy típusos JSON oszlop | Blokkonkénti mentés = egy oszlop frissítése; a sorok száma a posztok száma, JS-szűrés elég. |

## Hatókörön kívül

Piszkozat/jóváhagyás munkafolyamat, admin által szerkeszthető opciószótár, a tudástár és
a monitoring DB-re vitele, csatolmány a profilhoz, egyidejű szerkesztés kezelése (az
utolsó mentés nyer), a `user.fovaros`/`terulet`/`penznem` mezők áthelyezése (maradnak a
useren, a panel fejlécében jelennek meg).

## Országszótár (`lib/orszagok.ts`)

```ts
export interface Orszag {
  kod: string;          // ISO 3166-1 alpha-2, nagybetű, pl. 'KR'
  nev: string;          // magyar név, pl. 'Koreai Köztársaság'
  geo: string;          // world-atlas 110m név, pl. 'South Korea' – ezzel párosít a térkép
  lonlat: [number, number]; // főváros (hosszúság, szélesség), a pin helye
}
export const ORSZAGOK: readonly Orszag[];        // magyar név szerint rendezve
export function orszagByKod(kod: string): Orszag | undefined;
export function orszagNev(kod: string | null | undefined): string; // ismeretlen kódra magát a kódot adja, null-ra ''
export const ORSZAG_KOD_RE = /^[A-Z]{2}$/;
```

Tartalom: a world-atlas 110m országhalmaz (kb. 177 ország), a `geo` nevek pontosan a
`countries-110m.json` `properties.name` értékei. A meglévő 14 demó poszt országa mind
benne van (`United States of America`, `Germany`, `China`, `Japan`, `South Korea`, …).

## `user.orszag` és `riport.orszag` ISO-kódra

- `lib/felhasznalo-validacio.ts` `validOrszag`: attasénál kötelező, `ORSZAG_KOD_RE` és
  `orszagByKod()` találat kell; hiba: `orszag: 'Válassz országot a listából.'`. A 100
  karakteres korlát okafogyott.
- `app/(app)/felhasznalok/components/AttaseMezok.tsx`: az ország mező natív `<select>`
  (a meglévő `SzerepkorSelect` mintája) az `ORSZAGOK` listából, üres első opcióval.
- Megjelenítés `orszagNev()`-vel: `components/AppShell.tsx` fejléc (`roleLabel`),
  `FelhasznaloTabla` Ország oszlop, `RiportTabla` és `RiportReszlet` ország mezője,
  `RiportSzurok` ország-szűrő (`opciok`: `ertek` = kód, `cimke` = `orszagNev(kod)`).
- A riport beküldés változatlanul a session `orszag`-ját másolja; a `riport.orszag`
  ezentúl kód. A `listRiportOrszagok()` továbbra is a distinct értékeket adja (kódok).
- `AppSession.orszag` marad `string | null`, tartalma kód.
- **Adat-átírás**: `scripts/orszag-kod-migracio.ts` (tsx, relatív importok,
  `NODE_OPTIONS="--conditions=react-server"` nem kell, mert csak a `db`-t importálja).
  Végigmegy a `user.orszag` és `riport.orszag` értékein; ami már érvényes kód, azt
  kihagyja; a többit az `ORSZAGOK` `nev` mezőjével párosítja (kis/nagybetű- és
  szóköz-érzéketlenül, plusz egy kézi aliastábla: `'Dél-Korea' → 'KR'`); a párosítottat
  átírja, a nem párosíthatót kilistázza és érintetlenül hagyja. Idempotens. A mai helyi
  DB-ben két attasé (Dél-Korea, Japán) és három riport-sor érintett.

## Szótárak és típusok (`lib/orszagprofil-szotar.ts`)

Framework-mentes. Minden lista `as const` tömb, a típusok ebből származnak.

- `TAGSAGOK`: `EU`, `EFTA`, `OECD`, `NATO`, `G7`, `G20`, `BRICS`, `ASEAN`, `Mercosur`,
  `Afrikai Unió`, `Arab Liga`, `Öböl-menti Együttműködési Tanács`, `Nemzetközösség`.
- `GAZDASAGI_AGAZATOK`: `Autóipar`, `Gépipar`, `Elektronika és félvezetők`,
  `Gyógyszeripar`, `Vegyipar`, `Energetika`, `Bányászat és nyersanyagok`,
  `Mezőgazdaság és élelmiszeripar`, `IKT és szoftver`, `Pénzügyi szolgáltatások`,
  `Turizmus`, `Logisztika`, `Építőipar`, `Védelmi ipar`, `Kreatív ipar`.
- `KFI_PRIORITASOK`: `Digitalizáció és MI`, `Zöld átállás és klímasemlegesség`,
  `Egészség és élettudomány`, `Ipar 4.0 és gyártás`, `Energiabiztonság`, `Űr`,
  `Védelem és biztonság`, `Alapkutatási kiválóság`, `Tehetség és mobilitás`,
  `Startup és vállalkozói ökoszisztéma`, `Technológiai szuverenitás`,
  `Regionális felzárkózás`.
- `IPARAGAK` (kiemelt iparágak és kiemelt ágazatok közös listája, a térkép színezésének
  alapja), mindegyikhez szín az `IPARAG_SZINEK` táblában: `Mesterséges intelligencia és
  adatgazdaság`, `Félvezetők és mikroelektronika`, `Kvantumtechnológia`,
  `Biotechnológia és gyógyszeripar`, `Digitális egészségügy`, `Energetika és
  fenntarthatóság`, `Hidrogén és akkumulátor`, `Űripar`, `Mobilitás és autóipar`,
  `Agrár- és élelmiszertechnológia`, `Anyagtudomány`, `IKT és digitalizáció`,
  `Védelmi technológia`, `Kreatív ipar és média`.
- `RENDEZVENY_TIPUSOK`: `szakkiallitas` („Szakkiállítás"), `konferencia`
  („Konferencia"), `forum` („Egyéb fórum").
- Korlátok: `SZOVEG_MAX = 4000` (hosszú szövegmezők), `ROVID_MAX = 200` (stratégia,
  forrás, egyezmény, rendezvény név/időpont/megjegyzés, egyéb-mezők),
  `OSSZEGZES_MAX = 500`, `TOP_VALLALAT_MAX = 10`, `RENDEZVENY_MAX = 10`,
  `EV_MIN = 2020`.

Blokk-kulcsok és típusok (a DB oszlopnevek ugyanezek):

```ts
export const BLOKKOK = [
  { kulcs: 'alapadatok',      cim: 'Alapadatok és gazdasági háttér' },
  { kulcs: 'kfiRendszer',     cim: '1. KFI-rendszer és szakpolitika' },
  { kulcs: 'intezmenyek',     cim: '2. KFI intézmény- és kutatási ökoszisztéma' },
  { kulcs: 'vallalati',       cim: '3. Innovációs és vállalati ökoszisztéma' },
  { kulcs: 'programok',       cim: '4. KFI programok és finanszírozási lehetőségek' },
  { kulcs: 'rendezvenyek',    cim: '5. Jelentősebb KFI rendezvények' },
  { kulcs: 'kapcsolatok',     cim: '6. Nemzetközi és magyar–fogadó országbeli KFI/TéT kapcsolatok' },
  { kulcs: 'magyarErtekeles', cim: '7. Magyar szempontú értékelés és lehetőségek' },
] as const;
export type BlokkKulcs = (typeof BLOKKOK)[number]['kulcs'];

export interface Alapadatok {
  lakossag: number | null;        // fő, pozitív egész
  gdp: number | null;             // milliárd USD, ≥ 0, legfeljebb 1 tizedes
  gdpEgyFore: number | null;      // USD, ≥ 0, egész
  gdpNovekedes: number | null;    // %, -100..100, legfeljebb 1 tizedes
  adatEv: number | null;          // EV_MIN-10 .. aktuális év
  forras: string;                 // ROVID_MAX
  tagsagok: Tagsag[];             // TAGSAGOK-ból
  tagsagEgyeb: string;            // ROVID_MAX
  agazatok: GazdasagiAgazat[];    // GAZDASAGI_AGAZATOK-ból
  agazatEgyeb: string;            // ROVID_MAX
}
export interface KfiRendszer {
  teljesitmeny: string;           // SZOVEG_MAX – indexek, pozíció
  gerd: number | null;            // K+F ráfordítás a GDP %-ában, 0..100, legfeljebb 2 tizedes
  strategia: string;              // ROVID_MAX – név, időtáv
  prioritasok: KfiPrioritas[];    // KFI_PRIORITASOK-ból
  prioritasEgyeb: string;
  kiemeltIparagak: Iparag[];      // IPARAGAK-ból – a térkép színe az elsőből
  iparagEgyeb: string;
  erossegek: string;              // SZOVEG_MAX
  kihivasok: string;              // SZOVEG_MAX
}
export interface Intezmenyek {
  iranyitoSzervek: string; egyetemek: string; kutatokozpontok: string; infrastrukturak: string; // SZOVEG_MAX
}
export interface Vallalati {
  kiemeltAgazatok: Iparag[]; agazatEgyeb: string;
  topVallalatok: string[];        // legfeljebb TOP_VALLALAT_MAX, elemenként ROVID_MAX
  startupok: string; klaszterek: string; technologiatranszfer: string; // SZOVEG_MAX
}
export interface Programok {
  palyazatok: string; tamogatasiProgramok: string; finanszirozasiEszkozok: string; nemzetkoziReszvetel: string;
}
export interface Rendezveny { nev: string; tipus: RendezvenyTipus; idopont: string; megjegyzes: string }
export interface Rendezvenyek { lista: Rendezveny[] }   // legfeljebb RENDEZVENY_MAX
export interface Kapcsolatok {
  euMultilateralis: string; partnerorszagok: string; egyezmeny: string /* ROVID_MAX */; ketoldalu: string; mobilitas: string;
}
export interface MagyarErtekeles {
  osszegzes: string;              // OSSZEGZES_MAX – a panel kivonata
  egyuttmukodesiLehetosegek: string; joGyakorlatok: string; diplomaciaiPrioritasok: string;
}
export interface ProfilBlokkok {
  alapadatok: Alapadatok; kfiRendszer: KfiRendszer; intezmenyek: Intezmenyek; vallalati: Vallalati;
  programok: Programok; rendezvenyek: Rendezvenyek; kapcsolatok: Kapcsolatok; magyarErtekeles: MagyarErtekeles;
}
```

Minden mező opcionális: a szövegek üres stringgel, a számok `null`-lal, a listák üres
tömbbel is menthetők. `uresBlokk(kulcs)` ad üres alapértéket; `normalizalBlokk(kulcs,
nyers)` a DB-ből olvasott JSON hiányzó vagy rossz típusú almezőit az üres alapértékre
cseréli (később bevezetett mező nem tör el régi sort; a listákból az ismeretlen
opciókat kiszűri).

Mező-címkék és mező-leírások (súgószöveg az űrlaphoz) szintén a szótárban,
`MEZO_CIMKEK[blokk][mezo]` formában, hogy az olvasó nézet és az űrlap ugyanazt írja.

## Adatmodell (`db/schema/orszagprofil.ts`)

Tábla `orszagprofil`:

| Oszlop | Típus | Megjegyzés |
| --- | --- | --- |
| `id` | text PK | `crypto.randomUUID()` |
| `orszag_kod` | text not null | ISO-kód |
| `ev` | integer not null | beadási év |
| `szerzo_id` | text, FK `user.id` `onDelete: 'set null'` | utolsó szerkesztő |
| `alapadatok` … `magyar_ertekeles` | text `{ mode: 'json' }`, nullable | 8 oszlop, `$type<Alapadatok>()` stb.; `null` = a blokk még nem lett mentve |
| `created_at`, `updated_at` | integer timestamp_ms | mint a `riport` |

Indexek: egyedi `(orszag_kod, ev)`, sima `ev`. Export a `db/schema/index.ts`-ből,
migráció `npm run db:generate`.

## Lekérdezések (`db/queries/orszagprofil.ts`)

- `getProfil(kod, ev)` → `{ id, orszagKod, ev, szerzo: { id, name } | null, updatedAt,
  blokkok: Partial<ProfilBlokkok> (csak a mentettek, normalizálva), mentett: BlokkKulcs[] }
  | null`.
- `listEvek(kod)` → `number[]` csökkenő (évválasztó).
- `listTerkepAdat(aktualisEv)` → `TerkepOrszag[]`: az összes attasé (`user.role =
  'attase'`, `orszag` nem null, nem tiltott) országa **és** minden ország, amelyhez van
  profil. Országonként a legfrissebb profil (`max(ev)`), belőle `ev`, `kiemeltIparagak`,
  `osszegzes`, `updatedAt`; az attasé neve; `allapot`: `friss` ha `ev === aktualisEv`,
  `elavult` ha van régebbi, `nincs` ha nincs profil. Két lekérdezés (userek, profilok)
  és JS-összefésülés; a `geo`/`lonlat`/`nev` a szótárból, ismeretlen kód kimarad.
- `upsertBlokk(kod, ev, blokk, tartalom, szerzoId)`: `insert … on conflict (orszag_kod,
  ev) do update set <blokk> = …, szerzo_id = …, updated_at = now`. Egy tranzakció.

```ts
export interface TerkepOrszag {
  kod: string; nev: string; geo: string; lonlat: [number, number];
  attase: string | null;                       // aktív attasé neve, tiltottnál null
  poszt: { fovaros: string | null; terulet: number | null; penznem: string | null } | null; // a user rekordból
  ev: number | null; allapot: 'friss' | 'elavult' | 'nincs';
  iparagak: Iparag[]; osszegzes: string; frissitve: string | null; // formatDatum
  alapadatok: Alapadatok | null;               // normalizálva, a kivonat rácsához
  mentettDb: number; rendezvenyDb: number;     // „N rendezvény · M mentett blokk a 8-ból"
}
```

## Jogosultság (`lib/orszagprofil-jog.ts`)

- Olvasás: bármely bejelentkezett felhasználó, bármely ország és év.
- `canEditProfil(session, kod, ev, aktualisEv)`: admin → `EV_MIN <= ev <= aktualisEv`;
  attasé → `session.orszag === kod && ev === aktualisEv`.
- `aktualisEv()` a `lib/datum.ts`-be: az `IDOZONA` szerinti mai év (a `maiNaptariNap()`
  első négy karaktere).
- Jogosultsági hiba page-en és action-ben egyaránt **404** (a riport mintája).

## Validáció (`lib/orszagprofil-validacio.ts`)

`validalBlokk(kulcs, fd): { ertek: ProfilBlokkok[kulcs]; errors: MezoHibak }`
blokkonként külön függvénnyel. Közös szabályok:

- Szövegek `mezo()`-val tisztítva; hossz `SZOVEG_MAX` / `ROVID_MAX` / `OSSZEGZES_MAX`
  szerint, hiba: `<Címke> legfeljebb N karakter.`
- Számok: üres → `null`; a beírt értékből szóköz és ezreselválasztó pont eltávolítva,
  tizedesvessző pontra cserélve; tartomány és tizedesjegy-korlát a típusdefiníció
  szerint; hiba: `<Címke> szám legyen (…)`.
- Listák: `fd.getAll(<mezo>)`, csak a szótár elemei maradnak, duplikátum kiszűrve; a
  hozzá tartozó `…Egyeb` szöveg `ROVID_MAX`.
- `topVallalatok`: a textarea sorokra bontva, üres sorok kihagyva, legfeljebb
  `TOP_VALLALAT_MAX`, különben hiba a `topVallalatok` kulcson.
- `rendezvenyek`: `rendezveny.<i>.nev|tipus|idopont|megjegyzes` mezők `i = 0..9`;
  teljesen üres sor kimarad; ahol bármi ki van töltve, a `nev` kötelező (hiba a
  `rendezveny.<i>.nev` kulcson, az input `id`-ja ugyanez); `tipus` a
  `RENDEZVENY_TIPUSOK`-ból, különben `forum`.
- A hibakulcs mindig az input `id`-ja, hogy a `useMuveletForm` fókusza működjön.

## Server action (`app/(app)/orszagprofil/actions.ts`)

`mentBlokkAction(prev: MuveletState, fd: FormData)`; a form rejtett mezői: `kod`, `ev`,
`blokk`. Sorrend: `requireSession()` → kód a szótárban és `blokk` a `BLOKKOK`-ban,
különben `notFound()` → `canEditProfil`, különben `notFound()` → `validalBlokk` → hiba
esetén `{ ok: false, errors }` → `upsertBlokk` → `revalidatePath('/terkep')`,
`revalidatePath('/orszagprofil/[kod]', 'page')` (mindkét oldal) → `{ ok: true }`. A
kliens toastja: „Blokk mentve".

## Route-ok és felület

### `/terkep` (`app/(app)/terkep/`)

`page.tsx` server component: `requireSession()`, `listTerkepAdat(aktualisEv())`, a
kiválasztott ország opcionálisan `?o=<kod>` URL-paraméterből (a teljes oldalról visszalépéshez).
Komponensek `components/` alatta:

- `TerkepNezet` (`'use client'`): metrika (`iparag` | `allapot`), iparág-szűrő,
  kiválasztás állapota; a `WorldMap`-nek adja az adatot; jobb oldalon `ProfilKivonat`
  vagy `TerkepUres`. A fejlécsorban: metrika-váltó, iparág-select („Mind"), számláló
  („N poszt · M idei profil"); attasénak „Saját országprofil" link a saját szerkesztő
  oldalára (`Link` + `buttonVariants()`).
- `ProfilKivonat`: fejléc (ország neve, attasé neve, a user rekord `fovaros`, `terulet`
  km², `penznem` ha van); állapot-jelvény (`friss`/`elavult`/`nincs`, az év); ha van
  profil: alapadatok rács (lakosság, GDP, egy főre jutó GDP, növekedés, adatév, forrás),
  tagságok és kiemelt iparágak címkékként, összegzés, „N rendezvény · M mentett blokk a
  8-ból"; gombok: „Teljes profil" (`/orszagprofil/[kod]`), „Üzenet a poszttal"
  (`/kommunikacio`), jogosultnak „Szerkesztés". Ha nincs profil: rövid üres állapot +
  jogosultnak „Profil kitöltése".
- `TerkepUres`: „Válassz országot a térképen" + állapot-összesítő (friss / elavult /
  nincs, darabszámmal) + a legutóbb frissített 6 profil listája (kattintva kiválaszt).

A meglévő inline-stílusos panel helyett shadcn-komponensek (`Card`, `Badge`, `Button`)
és Tailwind; a régi `.card`/`.up` osztályokat itt nem szaporítjuk. A térkép-kártya
fejlécének vezérlői is shadcn `Select`/`ToggleGroup`-ra kerülnek.

### `/orszagprofil/[kod]` (`app/(app)/orszagprofil/[kod]/page.tsx`)

`requireSession()`; ismeretlen kód → `notFound()`. `?ev=`: egész, ha nem szerepel a
`listEvek(kod)`-ban, az első (legfrissebb) év; ha nincs egy év sem, az aktuális év és
üres állapot. Fejléc: ország neve, attasé (a `user` táblából, ha van), évválasztó
(`Select`, `?ev=` navigáció), utolsó módosítás és szerző, „Vissza a térképre"
(`/terkep?o=<kod>`), jogosultnak „Szerkesztés" (`/orszagprofil/[kod]/szerkesztes?ev=`).
Törzs: a 8 blokk sorrendben, mindegyik `BlokkNezet` kártya; a nem mentett blokk
„Még nincs kitöltve" jelzéssel. `metadata` statikus („Országprofil"), nem szivárogtat.

### `/orszagprofil/[kod]/szerkesztes` (`…/szerkesztes/page.tsx`)

`requireSession()`; ismeretlen kód → 404; `?ev=` alapértelmezés `aktualisEv()`;
`canEditProfil` sikertelen → 404. Fejléc: ország, év (admin évválasztót kap
`EV_MIN..aktualisEv`, attasé csak az aktuális évet látja), „Megtekintés" link. Törzs: 8
`BlokkForm` kártya, mindegyik saját `<form action={mentBlokkAction}>` a
`useMuveletForm`-mal (siker: „Blokk mentve"), rejtett `kod`/`ev`/`blokk` mezőkkel,
a mentett blokknál „Mentve: <dátum>" a kártya fejlécében. A blokk-formok kliens
komponensek (`'use client'`), a kezdőértékeket propként kapják.

Komponensek `app/(app)/orszagprofil/components/` alatt: `BlokkForm` (általános
kártya-váz + a blokk-specifikus mezők, blokkonként egy fájl: `AlapadatokMezok`,
`KfiRendszerMezok`, … `MagyarErtekelesMezok`), `EvValaszto`, `RendezvenySorok`
(hozzáadás/törlés, legfeljebb 10, mezőnevek `rendezveny.<i>.<mezo>`).

Megosztott `components/orszagprofil/`: `BlokkNezet` (egy blokk olvasó nézete; a
mezőcímkéket a szótárból veszi, a listákat címkékként, a rendezvényeket táblaként, a
top vállalatokat sorszámozott listaként), `IparagBadge` (`IPARAG_SZINEK`), `AllapotBadge`.

Megosztott `components/form/`: `CimkeValaszto` (a `KulcsszoValaszto` általánosítása:
`items`, `max`, `name` prop; Combobox-chips, minden választott értékhez rejtett
`<input type="hidden" name={name}>`), `EgyebMezo` (rövid szövegmező „Egyéb" címkével a
lista alatt), `SzamMezo` (`inputMode="decimal"`, utótag: „fő", „mrd USD", „%").
A `KulcsszoValaszto` marad, nem írjuk át.

### AppShell

`TITLES`: `/orszagprofil` → `['Országprofil', 'Az ország KFI körképe és alapadatai']`;
a `titleFor` prefix-egyezéssel a `[kod]` és a `szerkesztes` alútvonalakra is ezt adja.
`NAV` nem változik.

## Térkép (`components/WorldMap.tsx`, `public/tet-world-map.js`)

- `WorldMap` propjai: `adatok: TerkepOrszag[]`, `metric: 'iparag' | 'allapot'`,
  `iparag: string` (szűrő), `selected: string` (kód), `onSelect(kod)`. Nem importál a
  `lib/data.ts`-ből. A JSON attribútumba az adat mellett a színtáblák is mennek
  (`{ orszagok, szinek: { iparag: IPARAG_SZINEK, allapot: ALLAPOT_SZINEK } }`), a JS
  fájlból a hardcode-olt `FIELD_COLORS`/`RISK_COLORS` kikerül.
- `tet-world-map.js`: `metric` attribútum `iparag` | `allapot`; `field` → `iparag`
  attribútum (a `_dim` az `iparagak` tömbön szűr); színezés `iparag` esetén
  `szinek.iparag[iparagak[0]]` (üres lista → semleges szürke), `allapot` esetén
  `szinek.allapot[allapot]`; a `selected` és a `tet-country-select` esemény a
  `kod`-dal dolgozik (a `geo` a párosításhoz marad); tooltip: ország, attasé, állapot
  és év, első kiemelt iparág. Jelmagyarázat metrikánként. Az `ALLAPOT_SZINEK`:
  `friss` zöld (`#2f7d32`), `elavult` borostyán (`#b45309`), `nincs` szürke
  (`#9aa3ad`).
- A d3/topojson/world-atlas CDN-betöltés változatlan.

## Hibakezelés

- Ismeretlen ország-kód (`/orszagprofil/[kod]`, szerkesztés, action) → 404.
- Érvénytelen `?ev=` → alapértelmezett év, nem hiba.
- Jogosulatlan szerkesztés (page és action) → 404.
- A JSON-blokk olvasása `normalizalBlokk()`-on át; a `mentett` lista a nem `null`
  oszlopokból jön, nem a tartalomból.
- Az action `unstable_rethrow`-t nem igényel (nincs `redirect()`), a `useMuveletForm`
  kezeli a hibákat és a fókuszt.
- Lezárt/tiltott attasé országa a térképen marad (a profil megvan), a név helyett
  „nincs aktív attasé".

## Dokumentáció

- `CLAUDE.md`: új **Országprofil** bekezdés (tábla, szótárak, jog, route-ok, action,
  az évenkénti logika, a `normalizalBlokk` szabály), a **Térkép** bekezdés frissítése
  (DB-alapú, `TerkepOrszag`, színtábla a JSON-ban), az **Auth** bekezdésben `user.orszag`
  = ISO-kód (`lib/orszagok.ts`), a bevezetőben a „térkép még demóadatból" mondat
  módosítása (már csak tudástár és monitoring), a **Riportok** bekezdésben `orszag` =
  kód + `orszagNev()`.
- `README.md` route-tábla: `/orszagprofil/[kod]`, `/orszagprofil/[kod]/szerkesztes`.
- A `scripts/orszag-kod-migracio.ts` futtatása a CLAUDE.md parancsai közé egy sorral.

## Ellenőrzés

- `npm run db:generate` → új migráció a `drizzle/` alá; `npm run db:migrate`;
  `npx tsx scripts/orszag-kod-migracio.ts` (kimenet: 2 user és 3 riport átírva,
  0 párosítatlan); ismételt futtatás: 0 átírás.
- `npx tsc --noEmit`, `npm run build` (szükség esetén `rm .next/dev/types/validator.ts`).
- Böngészős végigjárás (gstack `browse`, a felhasználó futó dev szerverén, 3000-es port):
  1. Attasé (`teszt.attase@niu.hu`) → `/terkep`: a fejlécben „TéT attasé · Koreai
     Köztársaság"; a KR pin `nincs` állapotú; „Saját országprofil" link a
     `/orszagprofil/KR/szerkesztes?ev=2026`-ra visz.
  2. Alapadatok blokk mentése számokkal (ezreselválasztós lakosság, tizedesvesszős GDP),
     tagság és ágazat választással; toast; újratöltés után az értékek visszatöltve.
  3. KFI-rendszer blokk: két kiemelt iparág + egyéb; a térképen a KR pin az első iparág
     színét kapja, állapota `friss`; az iparág-szűrő a másik országot halványítja.
  4. Rendezvények: 2 sor felvétele, egy sor név nélkül → hiba a `rendezveny.1.nev`
     mezőn, fókusz ott; javítva mentés.
  5. `/orszagprofil/KR`: a mentett blokkok tartalma, a többi „Még nincs kitöltve";
     `/orszagprofil/JP/szerkesztes` → 404; `/orszagprofil/XX` → 404.
  6. Admin: `/orszagprofil/JP/szerkesztes?ev=2025` mentés; `/orszagprofil/JP` évválasztó
     2025-öt mutat, a térképen JP `elavult`; `?ev=2019` → 404.
  7. `/felhasznalok`: új attasé dialógus ország-selecttel; a tábla országnevet ír.
  8. `/riportok`: az országoszlop és a szűrő neveket ír, a szűrés kódra működik.
  9. `/monitoring` továbbra is a demóadatból renderel, nem tört el.
