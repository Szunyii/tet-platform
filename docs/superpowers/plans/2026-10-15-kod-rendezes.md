# Kódrendezés – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A komponensek a CLAUDE.md elhelyezési szabálya szerint álljanak, a nagy, több feladatot ellátó fájlok (AppShell, VilagTerkep) bomoljanak szét, a mért teljesítményproblémák (térkép-lekérdezés és -payload, demóadat a közös bundle-ben, újrarenderelések) szűnjenek meg, a duplikált kód és a halott kód tűnjön el – viselkedésváltozás nélkül (a spec négy szándékos kivételével).

**Architecture:** Területenként szeletelt taskok egy ágon. Az 1. task tisztán áthelyez (`git mv` + importok), a 2. az adatréteget és a tiszta segédeket rendezi, a 3. a shellt bontja `components/app-shell/` alá egyetlen útvonaltáblával (`lib/navigacio.ts`), a 4. a térképet, az 5. az űrlapokat, a 6. a demóadat-maradékot és a dokumentációt. A 0. és a 7. task a vezérlő mérése és böngészős QA-ja (előtte/utána).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Drizzle + better-sqlite3, shadcn/ui (Base UI), Tailwind v4, d3-geo/d3-zoom.

Spec: `docs/superpowers/specs/2026-10-15-kod-rendezes-design.md`. Ág: `kod-rendezes`.

**Tesztkeretrendszer nincs** (CLAUDE.md). Ellenőrzés: `npx tsc --noEmit` taskonként, a végén `npm run build`; a 2. taskban a `listTerkepAdat` előtte/utána egyezése eldobható tsx-scripttel; a 3. taskban a shell számított stílusainak egyezése és képernyőkép; a 7. taskban böngészős QA.

## Általános szabályok (minden implementer taskra)

- A fő munkafában, a `kod-rendezes` ágon dolgozol. **Tilos:** `git checkout`, `git switch`, `git reset`, `git stash`, ágváltás; a futó dev szerver (3000-es port) leállítása vagy újraindítása; a `data/tet.db` módosítása vagy commitolása.
- Az importok relatívak, mint a meglévő fájlokban. Új npm-függőség nincs.
- **Viselkedés-megőrzés:** felirat, sorrend, osztálynév, aria-attribútum, DOM-szerkezet változatlan, kivéve, ahol a task kifejezetten mást ír.
- A meglévő magyar kommenteket vidd át az áthelyezett kóddal (igazítva, ha a kontextus változott); új kommentet a környező kód sűrűségével írj.
- Ellenőrzés: `npx tsc --noEmit` – elvárt: kimenet nélkül, exit 0. Ha a hiba nem létező `app/...` modulra mutat a `.next/dev/types/validator.ts`-ben (áthelyezés után a futó dev szerver elavult fájlja): `rm .next/dev/types/validator.ts`, és újra.
- Commit a task végén a megadott üzenettel, záró sorként `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Csak a task fájljait add hozzá (`git add <útvonalak>` vagy `git add -u` + az új fájlok), **nem** `git add -A`.
- A CLAUDE.md-nek a taskban felsorolt mondatait a task maga frissíti.

## Fájlok (összesítő)

- Create: `lib/rendezes.ts`, `lib/nev.ts`, `lib/navigacio.ts`; `components/app-shell/{AppShell,AppContext,Oldalsav,Fejlec,CiklusValaszto,LogoutForm}.tsx`; `components/form/{CimkesSelect.tsx,useNyitas.ts}`; `components/orszagprofil/SzinesBadge.tsx`; `app/(app)/terkep/components/{vetulet.ts,TerkepRetegek.tsx,useTerkepZoom.ts,MutatoValaszto.tsx,IparagSzuro.tsx}`; `app/(app)/kommunikacio/components/UzenetLista.tsx`.
- Move (`git mv`): `components/riport/{RiportTabla,RiportSzurok,RiportReszlet,RiportTorles,IntezkedesSzerkeszto,IntezkedesDialog,KategoriaBadge}.tsx` → `app/(app)/jelentesek/components/`; `components/orszagprofil/{BlokkNezet,AttaseLista}.tsx` → `app/(app)/orszagprofil/components/`; `components/orszagprofil/KuldGomb.tsx` → `components/form/`; `components/AppShell.tsx` → `components/app-shell/AppShell.tsx`.
- Delete: `app/(app)/felhasznalok/components/SzerepkorSelect.tsx`.
- Modify: lásd taskonként.

---

### Task 0: Kiinduló mérések (a vezérlő végzi, nem subagent)

A 2. és a 3. task előtt, a változatlan kódon. Jelölés: `SP=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/df2f7942-2384-4a74-be63-07bf38f1ef14/scratchpad`, `REPO=/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next`.

- [ ] **Step 1: A `listTerkepAdat` pillanatképe minden évre**

`$SP/terkep-adat.ts` (eldobható; a repón kívül, abszolút importokkal):

```ts
import { writeFileSync } from 'node:fs';
import { listTerkepAdat } from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/db/queries/orszagprofil';
import { EV_MIN } from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/lib/orszagprofil-szotar';

// Az alapadatokból csak a térkép által használt 10 mező: a 2. task után a többi nem kerül a rekordba.
const MEZOK = ['fovaros', 'terulet', 'penznem', 'lakossag', 'gdp', 'gdpEgyFore', 'gdpNovekedes', 'adatEv', 'forras', 'tagsagok'];
const ki: Record<number, unknown> = {};
for (let ev = EV_MIN; ev <= 2026; ev++) {
  ki[ev] = listTerkepAdat(ev).map((o) => ({
    ...o,
    alapadatok: o.alapadatok && Object.fromEntries(MEZOK.map((m) => [m, (o.alapadatok as unknown as Record<string, unknown>)[m]])),
  }));
}
writeFileSync(process.argv[2], JSON.stringify(ki, null, 1));
```

Run (a repó gyökeréből): `NODE_OPTIONS="--conditions=react-server" npx tsx "$SP/terkep-adat.ts" "$SP/terkep-elotte.json"` – elvárt: a fájl létrejön, nem üres.

- [ ] **Step 2: A `/terkep` RSC-payload mérete (admin)** – gstack-kel bejelentkezve: `js "fetch('/terkep',{headers:{RSC:'1'}}).then(r=>r.text()).then(t=>t.length)"`, a számot feljegyezni.

- [ ] **Step 3: A shell számított stílusai és képernyőképei** – adminként és egy attasé-fiókkal (a demó jelszó a `.env.example` `DEMO_ATTASE_PASSWORD`-je; az admin jelszava a `.env.local`-ban – soha ne írd ki, a kitöltés után ne fusson `snapshot`), a `/terkep`-en és a `/kommunikacio`-n: egy `$SP/shell-stilus.js` (komment és idézőjel nélkül, lásd a memória gstack-buktatóját) a `aside`, `aside > div`, `aside nav`, `aside nav a` (mind), `aside nav a span`, `aside .mt-auto`, a felhasználói blokk elemei (`aside > div:last-child *`), `header`, `header h1`, `header label`, `header select`, `main` elemekre gyűjti a `getComputedStyle` `fontSize, fontWeight, lineHeight, letterSpacing, color, backgroundColor, paddingTop/Right/Bottom/Left, marginTop, borderTopWidth/Color, borderBottomWidth/Color, width, height, gap, borderRadius, textDecorationLine, whiteSpace, overflowY, position, top, zIndex` értékeit, JSON-ként (`$SP/shell-elotte-<szerep>.json`), és `screenshot --viewport` 1440×900 és 1024×700 méretben. A 7. task ugyanígy készít „utána” változatot és összeveti.

---

### Task 1: Áthelyezések

**Files:**
- Move: a „Fájlok” szakasz `git mv` sorai (a shell nélkül – az a 3. task).
- Modify: `app/(app)/jelentesek/page.tsx`, `app/(app)/jelentesek/[id]/page.tsx`, `app/(app)/orszagprofil/[kod]/page.tsx`, `components/orszagprofil/SzerkesztesGomb.tsx`, `CLAUDE.md`.

- [ ] **Step 1: Mozgatás**

```bash
mkdir -p "app/(app)/jelentesek/components"
for f in RiportTabla RiportSzurok RiportReszlet RiportTorles IntezkedesSzerkeszto IntezkedesDialog KategoriaBadge; do
  git mv "components/riport/$f.tsx" "app/(app)/jelentesek/components/$f.tsx"
done
git mv components/orszagprofil/BlokkNezet.tsx "app/(app)/orszagprofil/components/BlokkNezet.tsx"
git mv components/orszagprofil/AttaseLista.tsx "app/(app)/orszagprofil/components/AttaseLista.tsx"
git mv components/orszagprofil/KuldGomb.tsx components/form/KuldGomb.tsx
```

- [ ] **Step 2: Az áthelyezett fájlok importjai**

A 7 riport-fájlban és a 2 országprofil-fájlban (2 → 4 mélység): `'../../lib/` → `'../../../../lib/`, `'../../db/` → `'../../../../db/`, `'../ui/` → `'../../../../components/ui/`, `'../form/` → `'../../../../components/form/`. A testvér-importok (`./IntezkedesSzerkeszto`, `./KategoriaBadge`, `./RiportTorles`, `./IntezkedesDialog`) maradnak – mind együtt költözik. A `BlokkNezet` `./AgazatBadge` importja → `'../../../../components/orszagprofil/AgazatBadge'`.

```bash
cd "app/(app)/jelentesek/components" && sed -i '' -e "s#'\.\./\.\./lib/#'../../../../lib/#" -e "s#'\.\./\.\./db/#'../../../../db/#" -e "s#'\.\./ui/#'../../../../components/ui/#" -e "s#'\.\./form/#'../../../../components/form/#" RiportTabla.tsx RiportSzurok.tsx RiportReszlet.tsx RiportTorles.tsx IntezkedesSzerkeszto.tsx IntezkedesDialog.tsx KategoriaBadge.tsx && cd -
cd "app/(app)/orszagprofil/components" && sed -i '' -e "s#'\.\./\.\./lib/#'../../../../lib/#" -e "s#'\.\./ui/#'../../../../components/ui/#" -e "s#'\./AgazatBadge'#'../../../../components/orszagprofil/AgazatBadge'#" BlokkNezet.tsx AttaseLista.tsx && cd -
```

A `components/form/KuldGomb.tsx` `'../ui/button'` importja változatlanul jó.

- [ ] **Step 3: A hívók**

- `app/(app)/jelentesek/page.tsx`: `'../../../components/riport/RiportSzurok'` → `'./components/RiportSzurok'`, `'../../../components/riport/RiportTabla'` → `'./components/RiportTabla'`.
- `app/(app)/jelentesek/[id]/page.tsx`: `'../../../../components/riport/RiportReszlet'` → `'../components/RiportReszlet'`.
- `app/(app)/orszagprofil/[kod]/page.tsx`: `'../../../../components/orszagprofil/AttaseLista'` → `'../components/AttaseLista'`, `'../../../../components/orszagprofil/BlokkNezet'` → `'../components/BlokkNezet'`, `'../../../../components/orszagprofil/KuldGomb'` → `'../../../../components/form/KuldGomb'`.
- `components/orszagprofil/SzerkesztesGomb.tsx`: `'./KuldGomb'` → `'../form/KuldGomb'`.

- [ ] **Step 4: Ellenőrzés**

Run: `npx tsc --noEmit` – Expected: exit 0. Run: `grep -rn "components/riport/\(RiportTabla\|RiportSzurok\|RiportReszlet\|RiportTorles\|IntezkedesSzerkeszto\|IntezkedesDialog\|KategoriaBadge\)\|orszagprofil/\(BlokkNezet\|AttaseLista\|KuldGomb\)\|'\./KuldGomb'" app components lib` – Expected: nincs találat.

- [ ] **Step 5: CLAUDE.md**

- „Riportok” bekezdés, a komponens-felsorolás mondata („A route-komponensek `components/riport/` alatt (…)”) helyett: „A közös űrlap-komponensek (az `uj-jelentes` és a `jelentesek/[id]/szerkesztes` is használja) `components/riport/` alatt: `RiportForm`, `KategoriaValaszto`, `KulcsszoValaszto`, `EsemenyMezok`, `CsatolmanyMezo`; a csak a `/jelentesek/**`-é `app/(app)/jelentesek/components/` alatt: `RiportTabla`, `RiportSzurok`, `RiportReszlet`, `RiportTorles`, `KategoriaBadge`, `IntezkedesSzerkeszto`, `IntezkedesDialog`.”
- „Országprofil” route-leírásában: `components/orszagprofil/BlokkNezet` → `app/(app)/orszagprofil/components/BlokkNezet`, a fejléc attasé-listájánál `components/orszagprofil/AttaseLista` → `app/(app)/orszagprofil/components/AttaseLista`; ahol a `KuldGomb` szerepel, az útvonala `components/form/KuldGomb`.
- A projektstruktúra-táblázat „Megosztott komponensek” sorában a `components/form/` példái közé: `KuldGomb`.

- [ ] **Step 6: Commit**

```bash
git add -u && git add "app/(app)/jelentesek/components" "app/(app)/orszagprofil/components" components/form/KuldGomb.tsx
git commit -m "refactor(szerkezet): az egy route által használt komponensek a route mappájába, a KuldGomb a components/form alá

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Adatréteg és tiszta segédek

**Files:**
- Create: `lib/rendezes.ts`
- Modify: `db/queries/{orszagprofil,riport,ticket,attase-orszag,felhasznalo}.ts`, `lib/{felhasznalo-tiltas,felhasznalo-validacio,session,urlap,riport-validacio,ticket-validacio,orszagprofil-validacio,riport-szuro,riport-fajl,auth-client,ticket-cimzettek,riport-szotar,attase-orszag,terkep-mutatok}.ts`, `app/api/jelentes/csatolmany/[id]/route.ts`, `app/(app)/{jelentesek,orszagprofil,kommunikacio,felhasznalok}/actions.ts`, `app/(app)/jelentesek/page.tsx`, `app/(app)/felhasznalok/components/{UjFelhasznaloDialog,SzerkesztesDialog,JelszoDialog}.tsx`, `scripts/{demo-attasek,seed,demo-orszagprofil}.ts`, `CLAUDE.md`.

- [ ] **Step 1: Magyar névsor egy helyen – `lib/rendezes.ts`**

```ts
/**
 * Magyar ábécérend (ékezetek, kettős betűk) a felhasználói listákhoz. A SQLite BINARY collation az ékezetes
 * neveket a lista végére tenné, ezért a rendezés JS-ben fut. Egy modulszintű Collator: ugyanazt a sorrendet
 * adja, mint a `localeCompare(…, 'hu')`, de nem épít hívásonként újat.
 */
const HU = new Intl.Collator('hu');

export function huOsszevet(a: string, b: string): number {
  return HU.compare(a, b);
}
```

A 12 `localeCompare(…, 'hu')` hívás cseréje (`x.localeCompare(y, 'hu')` → `huOsszevet(x, y)`, plusz import): `lib/attase-orszag.ts:43,65,159`, `lib/terkep-mutatok.ts:102`, `db/queries/orszagprofil.ts:153`, `db/queries/ticket.ts:151,370,394`, `db/queries/riport.ts:292,305`, `db/queries/felhasznalo.ts:53`. A `felhasznalo.ts` doc-kommentjében a „(localeCompare 'hu')” → „(`huOsszevet`)”. Ellenőrzés: `grep -rn "localeCompare" app components lib db --include='*.ts' --include='*.tsx'` – nincs találat.

- [ ] **Step 2: Aktív attasé és szerepkör egy helyen**

`lib/felhasznalo-tiltas.ts` végére:

```ts
/** Aktív attasé: nem admin és nem tiltott (az admin attasé-sora a kétlépéses mentés maradéka lehet). */
export function aktivAttaseE(
  u: { role: string | null; banned: boolean | null; banExpires: Date | null },
  now = Date.now(),
): boolean {
  return u.role !== 'admin' && !tiltottE(u, now);
}
```

- `db/queries/attase-orszag.ts:63`: `if (r.role === 'admin' || tiltottE(r, now)) continue;` → `if (!aktivAttaseE(r, now)) continue;` (a fölötte lévő komment marad), import `aktivAttaseE` a `tiltottE` helyett.
- `db/queries/ticket.ts:348`: `.filter((u) => u.role !== 'admin' && !tiltottE(u, most))` → `.filter((u) => aktivAttaseE(u, most))`; ha a `tiltottE` máshol már nem kell a fájlban, az importja kikerül.

`lib/felhasznalo-validacio.ts`, a `SZEREPKOR_CIMKE` után:

```ts
/** Az adatbázis `role` mezője → szerepkör; a hiányzó vagy ismeretlen érték (régi rekord) attasénak számít. */
export function szerepkorbol(role: string | null | undefined): Szerepkor {
  return role === 'admin' ? 'admin' : 'attase';
}
```

- `lib/session.ts`: `export type AppRole = 'admin' | 'attase';` → `export type AppRole = Szerepkor;` (`import { szerepkorbol, type Szerepkor } from './felhasznalo-validacio';`), a 34–35. sor → `const role = szerepkorbol(u.role);` (a „A role hiánya (régi rekord) attasénak számít.” komment kikerül, a függvény doc-ja mondja).
- `db/queries/felhasznalo.ts:46`: `szerepkor: szerepkorbol(r.role),`.

- [ ] **Step 3: Korlát-konstansok**

`lib/felhasznalo-validacio.ts`, a `TELEFON_MAX` mellé (a `validNev`/`validJelszo` elé kerüljön, hogy a függvények előtt deklarált legyen):

```ts
export const NEV_MAX = 100;
/** A Better Auth alapértelmezett jelszó-korlátai. */
export const JELSZO_MIN = 8;
export const JELSZO_MAX = 128;
```

- `validNev`: `nev.length > NEV_MAX`, üzenet `` `A név legfeljebb ${NEV_MAX} karakter.` ``; `validJelszo`: `` `A jelszó legalább ${JELSZO_MIN} karakter.` `` / `` `A jelszó legfeljebb ${JELSZO_MAX} karakter.` `` (a szöveg változatlan).
- `app/(app)/felhasznalok/actions.ts:62`: `` `A jelszó hossza nem megfelelő (${JELSZO_MIN}–${JELSZO_MAX} karakter).` `` (import a validátorból); a 60. sori komment „8–128” helyett „a `JELSZO_MIN`–`JELSZO_MAX` tartományt”.
- `scripts/demo-attasek.ts:76-79`: a helyi `JELSZO_MIN`/`JELSZO_MAX` és a kommentjük törlése, helyette `import { JELSZO_MAX, JELSZO_MIN } from '../lib/felhasznalo-validacio';` (a meglévő `../lib/...` importok mellé).
- `scripts/seed.ts`: `if (password.length < JELSZO_MIN)` és `` `SEED_ADMIN_PASSWORD legalább ${JELSZO_MIN} karakter legyen.` ``, import `../lib/felhasznalo-validacio`.
- `UjFelhasznaloDialog.tsx`: `maxLength={100}` → `maxLength={NEV_MAX}`, `minLength={8}` → `minLength={JELSZO_MIN}`; `SzerkesztesDialog.tsx`: `maxLength={NEV_MAX}`; `JelszoDialog.tsx`: `minLength={JELSZO_MIN}` (importok a validátorból).

- [ ] **Step 4: Egységes parse-eredmény**

`lib/urlap.ts` végére:

```ts
/** Egy FormData-validátor eredménye: siker a típusos adattal, vagy a mezőhibák (`form` = űrlap-szintű). */
export type ParseResult<T> = { ok: true; data: T } | { ok: false; errors: MezoHibak };
```

- `lib/felhasznalo-validacio.ts`: a saját `ParseResult` deklaráció és a `/** Mezőnév → hibaüzenet… */ export type { MezoHibak };` sor törlése, `import { mezo, type MezoHibak, type ParseResult } from './urlap';`.
- `lib/ticket-validacio.ts`: a `ParseUzenetResult` típus törlése; `parseUzenetForm(fd): ParseResult<string>`, `return { ok: true, data: szoveg };`. `app/(app)/kommunikacio/actions.ts`: `parsed.szoveg` → `parsed.data`.
- `lib/riport-validacio.ts`: a `RiportErrors` alias és a kommentje törlése, a fájlban minden `RiportErrors` → `MezoHibak`; a `ParseRiportResult` hibaága `errors: MezoHibak`; a `ParseIntezkedesResult` törlése, `parseIntezkedes(fd): ParseResult<string | null>`, `return { ok: true, data: szoveg || null };`. `app/(app)/jelentesek/actions.ts`: `parsed.szoveg` → `parsed.data`.
- `lib/orszagprofil-validacio.ts`: a `ValidalasEredmeny` törlése, `validalBlokk(...): ParseResult<ProfilBlokkok[K]>`, a sikeres ág `{ ok: true, data: … }`. `app/(app)/orszagprofil/actions.ts`: `eredmeny.ertek` → `eredmeny.data`, és a fölösleges `export type { MuveletState };` sor törlése. `scripts/demo-orszagprofil.ts:247-248`: `uresE(e.ertek)` → `uresE(e.data)`, `{ blokk, ertek: e.ertek }` → `{ blokk, ertek: e.data }`.

- [ ] **Step 5: Közös fájl-ellenőrzés – `lib/riport-validacio.ts`**

A `parseFajlok` és a `csatolmanyElocheck` helyére (a `nevHibahoz` után):

```ts
/** A szerver-oldali típushiba vége: felsorolja az engedett típusokat (a kliens-előellenőrzésé nem). */
const ENGEDETT_TIPUSOK = ' Engedett: PDF, Word, Excel, PowerPoint, PNG, JPG.';

function darabHiba(meglevoDb: number, ujDb: number): string | null {
  const { maxDarab } = CSATOLMANY_LIMIT;
  return meglevoDb + ujDb > maxDarab ? `Legfeljebb ${maxDarab} csatolmány lehet egy bejegyzésen.` : null;
}

/**
 * Egy kiválasztott fájl a csatolmány-korlátokkal (üres, típus, méret): a `parseFajlok` és a
 * `csatolmanyElocheck` közös szabálya. A tisztított névvel dolgozik, hogy az előellenőrzés és a
 * szerver-oldali ellenőrzés (kiterjesztés, hibaüzenet) egybevágjon. `tipusUtotag` a típushiba vége.
 */
function ellenorizFajl(file: File, tipusUtotag: string): { ok: true; nev: string; mime: string } | { ok: false; hiba: string } {
  const nev = tisztitFajlnev(file.name);
  if (file.size === 0) return { ok: false, hiba: `Üres fájl: ${nevHibahoz(nev)}.` };
  const mime = mimeFromFajlnev(nev);
  if (!mime) return { ok: false, hiba: `Nem engedélyezett fájltípus: ${nevHibahoz(nev)}.${tipusUtotag}` };
  if (file.size > CSATOLMANY_LIMIT.maxMeret) {
    return { ok: false, hiba: `Túl nagy fájl: ${nevHibahoz(nev)} (max. ${formatMeret(CSATOLMANY_LIMIT.maxMeret)}).` };
  }
  return { ok: true, nev, mime };
}

function parseFajlok(fajlok: File[], meglevoDb: number, errors: MezoHibak): ElfogadottFajl[] {
  const tul = darabHiba(meglevoDb, fajlok.length);
  if (tul) {
    errors.csatolmany = tul;
    return [];
  }
  const elfogadott: ElfogadottFajl[] = [];
  for (const file of fajlok) {
    const e = ellenorizFajl(file, ENGEDETT_TIPUSOK);
    if (!e.ok) {
      errors.csatolmany = e.hiba;
      return [];
    }
    elfogadott.push({ file, mime: e.mime, nev: e.nev });
  }
  return elfogadott;
}

/**
 * Kliens-oldali előellenőrzés a csatolmányokra: ugyanazokat a korlátokat nézi, mint a
 * `parseFajlok`, de a beküldés előtt, azonnali visszajelzéshez. A szerver-oldali
 * ellenőrzés ettől függetlenül lefut.
 *
 * @param fajlok a most kiválasztott (még be nem küldött) fájlok
 * @param meglevoDb a bejegyzésen megmaradó, korábban feltöltött csatolmányok száma
 */
export function csatolmanyElocheck(fajlok: File[], meglevoDb: number): string | null {
  const tul = darabHiba(meglevoDb, fajlok.length);
  if (tul) return tul;
  for (const f of fajlok) {
    const e = ellenorizFajl(f, '');
    if (!e.ok) return e.hiba;
  }
  return null;
}
```

Az üzenetek betűre azonosak a mostaniakkal (a szerver típushibája „…: X. Engedett: PDF, …”, a kliensé „…: X.”).

- [ ] **Step 6: A `lib` ne a `db`-ből importáljon típust**

- `RiportFilter` interfész (a doc-kommentjével) `db/queries/riport.ts`-ből → `lib/riport-szuro.ts` (exportálva, a `SearchParams` után); a `riport-szuro.ts` `import type { RiportFilter } from '../db/queries/riport';` sora helyett `import type { KategoriaKulcs } from './riport-szotar';` (a meglévő `isKategoriaKulcs, isKulcsszo` import mellé). `db/queries/riport.ts`: `import type { RiportFilter } from '../../lib/riport-szuro';`. Ha más fájl a `db/queries/riport`-ból importálja a `RiportFilter`-t (`grep -rn "RiportFilter" app components lib db`), az is a `lib/riport-szuro`-ból.
- `CsatolmanyInput` interfész `db/queries/riport.ts`-ből → `lib/riport-fajl.ts` (exportálva); a `riport-fajl.ts` saját `import type { CsatolmanyInput } from '../db/queries/riport';` sora törlődik; `db/queries/riport.ts`: `import type { CsatolmanyInput } from '../../lib/riport-fajl';`.

- [ ] **Step 7: Átnevezés**

`db/queries/riport.ts`: `listOrszagok` → `listRiportOrszagok`, `listSzerzok` → `listRiportSzerzok`; `app/(app)/jelentesek/page.tsx` import és hívás; a `lib/riport-szuro.ts:23-24` kommentje.

- [ ] **Step 8: Csatolmány-letöltés és törlés teljes bejegyzés nélkül – `db/queries/riport.ts`**

A `getCsatolmanyMeta` helyére, és mellé az új `getRiportSzerzo`:

```ts
/** Letöltés előtti jogosultság-ellenőrzéshez, blob nélkül; a bejegyzés szerzőjével (`canViewRiport`). */
export function getCsatolmanyMeta(id: string): (CsatolmanyMeta & { riportId: string; szerzoId: string }) | null {
  return (
    db
      .select({
        id: riportCsatolmany.id,
        riportId: riportCsatolmany.riportId,
        szerzoId: riport.szerzoId,
        fajlnev: riportCsatolmany.fajlnev,
        mime: riportCsatolmany.mime,
        meret: riportCsatolmany.meret,
      })
      .from(riportCsatolmany)
      .innerJoin(riport, eq(riport.id, riportCsatolmany.riportId))
      .where(eq(riportCsatolmany.id, id))
      .get() ?? null
  );
}

/** A bejegyzés szerzője a jogosultság-ellenőrzéshez (törlés), a szöveg és a csatolmány-lista beolvasása nélkül. */
export function getRiportSzerzo(id: string): { szerzoId: string } | null {
  return db.select({ szerzoId: riport.szerzoId }).from(riport).where(eq(riport.id, id)).get() ?? null;
}
```

- `app/api/jelentes/csatolmany/[id]/route.ts`: a `getRiport` import és a 33–34. sor helyett `if (!canViewRiport(session, meta)) return new Response(null, { status: 404 });` (közvetlenül a `meta` ellenőrzése után); a 18–22. sori komment „előbb a blob nélküli metaadatot (getCsatolmanyMeta) és a bejegyzést nézzük meg” → „előbb a blob nélküli metaadatot nézzük meg a bejegyzés szerzőjével (getCsatolmanyMeta)”.
- `app/(app)/jelentesek/actions.ts` `deleteRiportAction`: `const meglevo = getRiportSzerzo(id);` (import), a többi változatlan. Az `updateRiportAction` marad a `getRiport`-on (a csatolmány-id-k kellenek).

- [ ] **Step 9: `listTerkepAdat` – csak a szükséges sorok és oszlopok (`db/queries/orszagprofil.ts`)**

Import: `import { and, desc, eq, lte, sql } from 'drizzle-orm';`. A `TerkepOrszag` fölé:

```ts
/** Az Alapadatokból ennyit használ a térkép kliens-oldala (kivonat, mutatók, tagság-mátrix); a többi mező nem kerül a payloadba. */
export type TerkepAlapadatok = Pick<
  Alapadatok,
  'fovaros' | 'terulet' | 'penznem' | 'lakossag' | 'gdp' | 'gdpEgyFore' | 'gdpNovekedes' | 'adatEv' | 'forras' | 'tagsagok'
>;

function terkepAlapadatok(a: Alapadatok): TerkepAlapadatok {
  const { fovaros, terulet, penznem, lakossag, gdp, gdpEgyFore, gdpNovekedes, adatEv, forras, tagsagok } = a;
  return { fovaros, terulet, penznem, lakossag, gdp, gdpEgyFore, gdpNovekedes, adatEv, forras, tagsagok };
}

// A mentett blokkok száma SQL-ben, a `BLOKK_KULCSOK`-ból (kimerítő): így a kilenc JSON-oszlopot nem kell beolvasni.
const MENTETT_DB = sql<number>`${sql.join(BLOKK_KULCSOK.map((k) => sql`(${orszagprofil[k]} is not null)`), sql` + `)}`;
```

A `TerkepOrszag.alapadatok` típusa: `alapadatok: TerkepAlapadatok | null;`. A `listTerkepAdat` törzse (a doc-komment „minden sorát beolvassuk – ezen a skálán rendben van” fél-mondata helyett: „csak a ≤ ev sorok és a térkép által használt oszlopok jönnek”):

```ts
export const listTerkepAdat = cache((ev: number): TerkepOrszag[] => {
  const attasek = listAttasekOrszagonkent();

  // Országonként a legnagyobb, ev-nél nem nagyobb év sora. (Az év szerint csökkenő listából
  // az első előfordulás országonként; a max(ev)-es al-lekérdezéses join helyett, mert a
  // Drizzle az aliasolt sql-oszlopot a join-feltételben minősítés nélkül írja ki.)
  const sorok = db
    .select({
      orszagKod: orszagprofil.orszagKod,
      ev: orszagprofil.ev,
      alapadatok: orszagprofil.alapadatok,
      kfiRendszer: orszagprofil.kfiRendszer,
      rendezvenyek: orszagprofil.rendezvenyek,
      magyarErtekeles: orszagprofil.magyarErtekeles,
      mentettDb: MENTETT_DB,
    })
    .from(orszagprofil)
    .where(lte(orszagprofil.ev, ev))
    .orderBy(desc(orszagprofil.ev))
    .all();
  const profilKodhoz = new Map<string, (typeof sorok)[number]>();
  for (const p of sorok) if (!profilKodhoz.has(p.orszagKod)) profilKodhoz.set(p.orszagKod, p);

  const kodok = new Set<string>([...attasek.keys(), ...profilKodhoz.keys()]);

  const eredmeny: TerkepOrszag[] = [];
  for (const kod of kodok) {
    const o = orszagByKod(kod);
    if (!o) continue;
    const p = profilKodhoz.get(kod);
    // Csak a térkép által olvasott négy blokk normalizálódik.
    const alap = p?.alapadatok != null ? normalizalBlokk('alapadatok', p.alapadatok) : null;
    const kfi = p?.kfiRendszer != null ? normalizalBlokk('kfiRendszer', p.kfiRendszer) : null;
    const rend = p?.rendezvenyek != null ? normalizalBlokk('rendezvenyek', p.rendezvenyek) : null;
    const magyar = p?.magyarErtekeles != null ? normalizalBlokk('magyarErtekeles', p.magyarErtekeles) : null;
    eredmeny.push({
      kod, nev: o.nev, geo: o.geo, lonlat: o.lonlat,
      attasek: attasek.get(kod) ?? [],
      ev: p?.ev ?? null,
      allapot: profilAllapot(p?.ev ?? null, ev),
      iparagak: kfi?.kiemeltIparagak ?? [],
      gerd: kfi?.gerd ?? null,
      prioritasok: kfi?.prioritasok ?? [],
      osszegzes: magyar?.osszegzes ?? '',
      alapadatok: alap ? terkepAlapadatok(alap) : null,
      mentettDb: p?.mentettDb ?? 0,
      rendezvenyDb: rend?.lista.length ?? 0,
    });
  }
  return eredmeny.sort((x, y) => huOsszevet(x.nev, y.nev));
});
```

Ha a `normalizalBlokk` paramétertípusa szűkebb a select JSON-oszlopáénál, a fordító megmondja – a `sorbol` ugyanígy hívja (`normalizalBlokk(k, r[k])`). Ha a `type Alapadatok` import csak a `TerkepAlapadatok`-hoz kell, maradjon.

- [ ] **Step 10: Halott exportok**

Minden törlés előtt `grep -rn "<név>" app components lib db scripts proxy.ts` – ha a saját fájlján kívül van használója, az a tétel kimarad (jelezd a jelentésben).

- `lib/auth-client.ts:12`: `export const { signIn, useSession } = authClient;` → `export const { signIn } = authClient;`.
- Csak a saját fájlban használt exportok elől az `export` kulcsszó törlése: `lib/urlap.ts` `LATHATATLAN_RE`, `VEZERLO_RE`; `lib/riport-szotar.ts` `kiterjesztes`, `FAJLNEV_MAX`; `lib/ticket-cimzettek.ts` `jeloltRegioi`, `regioJeloltjei`.

- [ ] **Step 11: Ellenőrzés**

Run: `npx tsc --noEmit` – exit 0. Run (a vezérlő Task 0 scriptje, új kimenettel): `NODE_OPTIONS="--conditions=react-server" npx tsx "$SP/terkep-adat.ts" "$SP/terkep-utana.json" && cmp "$SP/terkep-elotte.json" "$SP/terkep-utana.json" && echo AZONOS` – Expected: `AZONOS`. (Ha az `SP` nincs beállítva, a vezérlő a dispatch-ben megadja a két útvonalat.)

- [ ] **Step 12: CLAUDE.md**

- Auth bekezdés: `lib/session.ts` – „A `role` a `szerepkorbol()`-lal (lib/felhasznalo-validacio.ts) normalizálódik”; a felsorolásban a `lib/felhasznalo-tiltas.ts` mellé „`aktivAttaseE` (nem admin és nem tiltott – az attasé-lekérdezések közös feltétele)”; a `lib/felhasznalo-validacio.ts` említésénél: „`NEV_MAX`, `JELSZO_MIN`, `JELSZO_MAX` (a scriptek és a dialógusok is ezt használják)”.
- Riportok: `listOrszagok()` → `listRiportOrszagok()`, `listSzerzok()` → `listRiportSzerzok()` (minden előfordulás); „Amire figyelni kell”: a csatolmány-sorrend mondata → „**meta → jog → blob** (`getCsatolmanyMeta` a bejegyzés szerzőjével, `canViewRiport`, csak utána `getCsatolmany`)”.
- Közös segédek: „`lib/urlap.ts` (`MezoHibak`, `ParseResult<T>` – a validátorok közös eredménytípusa; a jelentés és az új ticket saját, extra mezős típust ad –, `tisztitSzoveg`/`mezo` …)”, és új tétel: „`lib/rendezes.ts` (`huOsszevet`: magyar névsor, modulszintű `Intl.Collator('hu')`; minden JS-oldali névsor-rendezés ezt használja)”.
- Országprofil, `listTerkepAdat` leírása: „csak a ≤ ev sorok és a térkép által használt oszlopok (alapadatok, kfiRendszer, rendezvenyek, magyarErtekeles; a `mentettDb` SQL-ben) – az `alapadatok` a `TerkepAlapadatok` (10 mező)”.

- [ ] **Step 13: Commit**

```bash
git add -u && git add lib/rendezes.ts
git commit -m "refactor(adatreteg): karcsúbb listTerkepAdat, csatolmány-jog teljes bejegyzés nélkül, közös rendezés, parse-eredmény, korlátok és szerepkör-segédek

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Shell

**Files:**
- Create: `lib/navigacio.ts`, `lib/nev.ts`, `components/app-shell/{AppContext,Oldalsav,Fejlec,CiklusValaszto,LogoutForm}.tsx`
- Move + rewrite: `components/AppShell.tsx` → `components/app-shell/AppShell.tsx`
- Modify: `app/(app)/layout.tsx`, `app/(app)/components/OldalsavAllapot.tsx`, `app/globals.css`, `lib/{score,data,knowledge,routes,valasztott-ev}.ts`, `app/(app)/tudastar/page.tsx`, `app/(app)/monitoring/page.tsx`, `app/(app)/terkep/components/{TerkepNezet,TerkepPanel}.tsx`, `app/(app)/kommunikacio/components/{OlvasatlanSzinkron,TicketJelzesek}.tsx`, `app/login/page.tsx`, `CLAUDE.md`.

Stílus-szabály (a felhasználó döntése, spec): az inline style-ok Tailwind osztályokra kerülnek **a mai értékekkel**. A Tailwind v4 arbitrary `text-[Npx]` csak `font-size`-ot állít (a build CSS-ében ellenőrizve: `.text-\[11px\]{font-size:11px}`), a névvel ellátott `text-xs`/`text-sm` viszont line-height-ot is – ezért a shellben csak arbitrary betűméret szerepeljen. A globális `.btn` és `.input` osztály marad.

- [ ] **Step 1: Színtokenek – `app/globals.css`**

A `:root` sorában a sidebar-tokenek új értékei (a többi token változatlan): `--sidebar: #131a24; --sidebar-foreground: #e7ebf1; --sidebar-primary: #1b3a6b; --sidebar-primary-foreground: #ffffff; --sidebar-accent: #22304a; --sidebar-accent-foreground: #ffffff; --sidebar-border: #232c39;` (a `--sidebar-ring` marad), és új, projekt-szintű változók ugyanott: `--sidebar-halvany: #8d97a5; --sidebar-menu: #a3adbb; --sidebar-cim: #c3cbd6; --sidebar-szamlalo: #b3261e; --sidebar-hiba: #f2a6a0;`. Az `@theme inline` sorba: `--color-sidebar-halvany: var(--sidebar-halvany); --color-sidebar-menu: var(--sidebar-menu); --color-sidebar-cim: var(--sidebar-cim); --color-sidebar-szamlalo: var(--sidebar-szamlalo); --color-sidebar-hiba: var(--sidebar-hiba);`. A `.dark` blokk változatlan (sötét mód nincs használatban).

Halott és felülírt szabályok törlése – előbb mindegyikre `grep -rn` az `app components` alatt (`btn primary`, `btn blue`, `"bar"`/`'bar'`/`bar ` className, `textarea` + `input` osztály); csak a használó nélkülit töröld:
- `* { box-sizing: border-box; }`, `html, body { margin: 0; padding: 0; }`, `button, input, select, textarea { font-family: inherit; }` (a Tailwind preflight ugyanezt adja),
- `.btn.primary`, `.btn.blue`, `textarea.input`, `.bar`, `.bar > div`,
- az `@layer base` `body { @apply bg-background text-foreground; }` szabálya (a rétegezetlen `body` mindig felülírja; a végleges szín a rétegezetlen `#f4f5f7`/`#10151d` marad).

- [ ] **Step 2: `lib/nev.ts`**

```ts
/**
 * Monogram egy névből: az első két szó kezdőbetűje nagybetűvel. A ponttal végződő szavak (titulus,
 * pl. „dr.”) kimaradnak: „dr. Gurza László” → „GL”. Üres (vagy csak titulusból álló) névre ''.
 */
export function monogram(nev: string): string {
  return nev
    .trim()
    .split(/\s+/)
    .filter((szo) => szo !== '' && !szo.endsWith('.'))
    .slice(0, 2)
    .map((szo) => szo.charAt(0))
    .join('')
    .toUpperCase();
}
```

- `lib/score.ts`: az `ini` függvény törlése.
- `app/(app)/kommunikacio/components/TicketJelzesek.tsx` `Monogram`: a két `reszek`/`betuk` sor → `const betuk = monogram(nev) || '?';` (import `../../../../lib/nev`).

- [ ] **Step 3: `lib/navigacio.ts`**

```ts
/**
 * Az alkalmazás útvonalai egy táblában: az oldalsáv menüje, a fejléc címe és alcíme, és az admin-only
 * jelzés innen jön – új oldalhoz egy sort kell felvenni. Csak megjelenítés: az `adminOnly` a menüpontot
 * rejti el és a fejléc címét semlegesíti, a valódi védelem a page/action `requireAdmin()`-ja
 * (lib/session.ts).
 */
import type { Szerepkor } from './felhasznalo-validacio';

export interface Menupont {
  ikon: string;
  felirat: string;
  /** További útvonal-prefixek, amelyeken a menüpont aktív (pl. /orszagprofil/* → Országprofil). */
  alHrefek?: readonly string[];
}

export interface Utvonal {
  href: string;
  /** A fejléc címe és alcíme ezen az útvonalon és az alútvonalain. */
  cim: string;
  alcim: string;
  adminOnly?: boolean;
  /** Ha van, menüpont az oldalsávban; a menü sorrendje a tábla sorrendje. */
  menu?: Menupont;
}

export const UTVONALAK: readonly Utvonal[] = [
  {
    href: '/terkep',
    cim: 'Országprofil',
    alcim: 'A TéT attasé-posztok térképen, a beküldött országprofilok kivonatával',
    menu: { ikon: '◍', felirat: 'Országprofil', alHrefek: ['/orszagprofil'] },
  },
  {
    href: '/orszagprofil',
    cim: 'Országprofil',
    alcim: 'Az ország KFI körképe és alapadatai, évenkénti attasé-beadással',
  },
  {
    href: '/jelentesek',
    cim: 'Jelentések',
    alcim: 'A TéT hálózat információs bejegyzései kategóriák és kulcsszavak szerint',
    menu: { ikon: '▦', felirat: 'Jelentések' },
  },
  {
    href: '/uj-jelentes',
    cim: 'Új bejegyzés',
    alcim: 'Kategória, tárgy, vezetői összefoglaló, kulcsszavak – rendezvénynél dátum és helyszín',
    menu: { ikon: '✎', felirat: 'Új bejegyzés' },
  },
  {
    href: '/kommunikacio',
    cim: 'Kommunikáció',
    alcim: 'Ticket + üzenetszál az adminok és a TéT attasék között',
    menu: { ikon: '✉', felirat: 'Kommunikáció' },
  },
  {
    href: '/tudastar',
    cim: 'Tudástár',
    alcim: 'Magyarországról ajánlható programok, partnerek és együttműködési formák',
    menu: { ikon: '◫', felirat: 'Tudástár ??' },
  },
  {
    href: '/monitoring',
    cim: 'Monitoring és értékelés',
    alcim: '3 kategória, 14 szempont, rögzített adatforrás-metaadatokkal',
    menu: { ikon: '◈', felirat: 'Monitoring és értékelés ??' },
  },
  {
    href: '/felhasznalok',
    cim: 'Felhasználók',
    alcim: 'Admin és TéT attasé fiókok kezelése',
    adminOnly: true,
    menu: { ikon: '☺', felirat: 'Felhasználók' },
  },
];

const SEMLEGES_CIM: [string, string] = ['TéT Platform', ''];

/** Pontos egyezés vagy alútvonal (pl. /jelentesek/abc → /jelentesek). */
export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/');
}

/** A menüpont aktív: a saját útvonalán vagy valamelyik `alHrefek` prefixe alatt. */
export function menuAktiv(pathname: string, u: Utvonal): boolean {
  return isActive(pathname, u.href) || (u.menu?.alHrefek ?? []).some((h) => isActive(pathname, h));
}

/** A szerepkörnek látható menüpontok a tábla sorrendjében. */
export function menupontok(szerep: Szerepkor): (Utvonal & { menu: Menupont })[] {
  return UTVONALAK.filter((u): u is Utvonal & { menu: Menupont } => !!u.menu && (!u.adminOnly || szerep === 'admin'));
}

/**
 * A fejléc címe és alcíme: a leghosszabb illeszkedő útvonalé (pontos egyezés vagy prefix). Admin-only
 * útvonalon nem adminnak a semleges címet adja: a requireAdmin() 404-e az AppShellben renderelődik, és
 * a fejléc nem árulhatja el az oldal létét.
 */
export function titleFor(pathname: string, szerep: Szerepkor): [string, string] {
  if (szerep !== 'admin' && UTVONALAK.some((u) => u.adminOnly && isActive(pathname, u.href))) return SEMLEGES_CIM;
  const talalat = UTVONALAK.filter((u) => isActive(pathname, u.href)).sort((a, b) => b.href.length - a.href.length)[0];
  return talalat ? [talalat.cim, talalat.alcim] : SEMLEGES_CIM;
}
```

- [ ] **Step 4: A shell komponensei**

`components/app-shell/AppContext.tsx`:

```tsx
'use client';

import { createContext, useContext } from 'react';
import type { AppSession } from '../../lib/session';

export interface AppState {
  user: AppSession;
  /** A fejlécben kiválasztott ciklus (év) – a tet-ev cookie-ból, a layout adja. Váltani a fejléc selectje tud (valasztEvAction). */
  ev: number;
  /** Olvasatlan, nem lezárt ticketek száma – a Kommunikáció menüpont számlálója. */
  olvasatlan: number;
  /** A /kommunikacio oldal írja felül a saját, frissebb számával (OlvasatlanSzinkron). */
  setOlvasatlan: (n: number) => void;
}

export const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp() csak az AppShell-en belül használható.');
  return ctx;
}
```

`components/app-shell/LogoutForm.tsx`:

```tsx
'use client';

import { useActionState } from 'react';

/**
 * A kijelentkezés szerződése. A megosztott komponens nem importál route-fájlból: az
 * `app/(app)/actions.ts` `logoutAction`-je (LogoutState) strukturálisan felel meg neki.
 */
export type LogoutAction = (prev: { error?: string }) => Promise<{ error?: string }>;

export function LogoutForm({ action }: { action: LogoutAction }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      {state.error && (
        <span role="alert" className="basis-full text-[11px] text-sidebar-hiba">
          {state.error}
        </span>
      )}
      {/* A .btn betűmérete (11,5 px) a régi inline értékkel azonos. */}
      <button type="submit" className="btn w-full" disabled={pending}>
        {pending ? 'Kijelentkezés…' : 'Kijelentkezés'}
      </button>
    </form>
  );
}
```

`components/app-shell/CiklusValaszto.tsx`:

```tsx
'use client';

import { unstable_rethrow } from 'next/navigation';
import { useOptimistic, useTransition } from 'react';

export type ValasztEvAction = (formData: FormData) => Promise<void>;

/**
 * A fejléc ciklusválasztója. Évváltás: server action írja a cookie-t és revalidálja a layoutot. A
 * kiválasztás a teljes kör-út alatt (action + revalidálás) késne, ezért useOptimistic-kal a select
 * azonnal az új évet mutatja; a szerver válasza (a layout újrarenderelése) felülírja az `ev` propot,
 * az optimista érték pedig ezzel automatikusan visszaáll rendes állapotba. Az állapot itt él, nem az
 * AppShellben: az évváltás közbeni renderek nem érintik a shell többi részét.
 */
export function CiklusValaszto({ ev, evek, action }: { ev: number; evek: readonly number[]; action: ValasztEvAction }) {
  const [optimistaEv, setOptimistaEv] = useOptimistic(ev);
  const [fut, startValtas] = useTransition();
  const valaszt = (uj: string) => {
    const fd = new FormData();
    fd.set('ev', uj);
    startValtas(async () => {
      setOptimistaEv(Number(uj));
      // Hálózati/origin hiba esetén az évváltás egyszerűen nem történik meg; nem dobjuk az error boundary-ig.
      try {
        await action(fd);
      } catch (err) {
        unstable_rethrow(err);
        console.error('[ciklus] évváltás sikertelen:', err);
      }
    });
  };
  return (
    <label className="flex items-center gap-[7px] text-[11.5px] text-[#6b7684]">
      Ciklus
      <select className="input" value={optimistaEv} aria-busy={fut} onChange={(e) => valaszt(e.target.value)}>
        {evek.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </label>
  );
}
```

`components/app-shell/Fejlec.tsx`:

```tsx
'use client';

import { usePathname } from 'next/navigation';
import type { Szerepkor } from '../../lib/felhasznalo-validacio';
import { titleFor } from '../../lib/navigacio';
import { CiklusValaszto, type ValasztEvAction } from './CiklusValaszto';

/** A tartalom fölötti, ragadós fejléc: az útvonal címe és alcíme (lib/navigacio.ts), jobbra a ciklusválasztó. */
export function Fejlec({ szerep, ev, evek, valasztEvAction }: {
  szerep: Szerepkor;
  ev: number;
  evek: readonly number[];
  valasztEvAction: ValasztEvAction;
}) {
  const [cim, alcim] = titleFor(usePathname(), szerep);
  return (
    <header className="sticky top-0 z-20 flex items-center gap-5 border-b border-[#dde1e7] bg-white px-[26px] py-[13px]">
      <div className="min-w-0">
        <h1 className="text-[16px] font-semibold tracking-[-.01em]">{cim}</h1>
        <div className="mt-0.5 text-[11.5px] text-[#6b7684]">{alcim}</div>
      </div>
      <div className="ml-auto flex items-center gap-3.5">
        <CiklusValaszto ev={ev} evek={evek} action={valasztEvAction} />
      </div>
    </header>
  );
}
```

`components/app-shell/Oldalsav.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { szekhelyKod } from '../../lib/attase-orszag';
import { menuAktiv, menupontok } from '../../lib/navigacio';
import { monogram } from '../../lib/nev';
import { orszagNev } from '../../lib/orszagok';
import type { AppSession } from '../../lib/session';
import { cn } from '../../lib/utils';
import { LogoutForm, type LogoutAction } from './LogoutForm';

/** Attasé: a székhely országa, további (régiós) országoknál „+N" (nem törő szóközzel: a „+N" ne törjön egyedül új sorba). */
function szerepFelirat(user: AppSession): string {
  if (user.role === 'admin') return 'NIÜ admin';
  const szekhely = szekhelyKod(user.orszagok);
  const tovabbi = user.orszagok.length - (szekhely ? 1 : 0);
  return `TéT attasé${szekhely ? ' · ' + orszagNev(szekhely) : ''}${tovabbi > 0 ? ` +${tovabbi}` : ''}`;
}

/**
 * A sötét oldalsáv: márka, menü (az olvasatlan-számlálóval), az `oldalsavAlja` slot (OldalsavAllapot),
 * a felhasználói blokk és a kijelentkezés. `overflow-y-auto`: alacsony ablaknál is elérhető marad a
 * Kijelentkezés. A színek a `--sidebar*` tokenekből jönnek (app/globals.css).
 */
export function Oldalsav({ user, olvasatlan, oldalsavAlja, logoutAction }: {
  user: AppSession;
  olvasatlan: number;
  oldalsavAlja?: ReactNode;
  logoutAction: LogoutAction;
}) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 flex h-screen w-[238px] flex-[0_0_238px] flex-col overflow-y-auto bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-[18px] pt-[18px] pb-4">
        <div className="text-[13.5px] font-bold tracking-[.02em]">NIÜ · TéT Platform</div>
        <div className="mt-[3px] text-[11px] text-sidebar-halvany">Belső munkakörnyezet</div>
      </div>
      <nav className="flex flex-col gap-0.5 px-2.5 py-3">
        {menupontok(user.role).map((u) => {
          const on = menuAktiv(pathname, u);
          return (
            <Link
              key={u.href}
              href={u.href}
              aria-current={on ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-[5px] px-[11px] py-[9px] text-[12.5px] font-medium no-underline',
                on ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-menu',
              )}
            >
              <span className="w-4 text-center text-[13px]">{u.menu.ikon}</span>
              {u.menu.felirat}
              {u.href === '/kommunikacio' && olvasatlan > 0 && (
                <>
                  <span aria-hidden className="ml-auto rounded-[9px] bg-sidebar-szamlalo px-1.5 py-px text-[10px] font-semibold text-white">
                    {olvasatlan}
                  </span>
                  <span className="sr-only">{olvasatlan} olvasatlan ticket</span>
                </>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        {oldalsavAlja}
        <div className="border-t border-sidebar-border px-[18px] py-3.5">
          <div className="flex items-center gap-[9px]">
            <div
              aria-hidden
              className="flex size-[29px] flex-[0_0_29px] items-center justify-center rounded-full bg-sidebar-primary text-[11px] font-semibold text-sidebar-primary-foreground"
            >
              {monogram(user.name)}
            </div>
            <div className="min-w-0 leading-[1.25]">
              <div className="truncate text-[12px] font-semibold text-sidebar-foreground">{user.name}</div>
              <div className="text-[10.5px] text-sidebar-halvany">{szerepFelirat(user)}</div>
            </div>
          </div>
          <div className="mt-2.5">
            <LogoutForm action={logoutAction} />
          </div>
        </div>
      </div>
    </aside>
  );
}
```

`git mv components/AppShell.tsx components/app-shell/AppShell.tsx`, majd a tartalma:

```tsx
'use client';

import { useMemo, useState, type ReactNode } from 'react';
import type { AppSession } from '../../lib/session';
import { AppContext } from './AppContext';
import type { ValasztEvAction } from './CiklusValaszto';
import { Fejlec } from './Fejlec';
import type { LogoutAction } from './LogoutForm';
import { Oldalsav } from './Oldalsav';

/** A védett oldalak kerete: oldalsáv, fejléc, tartalom, és a `useApp()` context. */
export default function AppShell({
  user, logoutAction, valasztEvAction, olvasatlan: szerverOlvasatlan, ev, evek, oldalsavAlja, children,
}: {
  user: AppSession;
  logoutAction: LogoutAction;
  valasztEvAction: ValasztEvAction;
  /** Olvasatlan, nem lezárt ticketek száma a layoutból – a menü-számláló kiindulópontja. */
  olvasatlan: number;
  /** A választott ciklus (év) a layoutból (cookie); nincs kliens-állapot, a szerver a forrás. */
  ev: number;
  /** A ciklusválasztó évei a layoutból, csökkenő; a layout garantálja, hogy `ev` benne van. */
  evek: number[];
  /** Az oldalsáv aljára szánt szerver-renderelt tartalom (OldalsavAllapot), a felhasználói blokk fölé. */
  oldalsavAlja?: ReactNode;
  children: ReactNode;
}) {
  // A számláló állapotban él, mert a /kommunikacio oldal a saját, frissebb értékével
  // felülírja (a layout a megtekintés-jelölés ELŐTT számol). A szerverről érkező új érték
  // viszont nyer: a layout revalidálásakor (revalidatePath) ez a render-közbeni igazítás
  // frissíti az állapotot – ez a React ajánlott „prop változásra állapot igazítása" mintája.
  const [olvasatlan, setOlvasatlan] = useState(szerverOlvasatlan);
  const [elozoSzerver, setElozoSzerver] = useState(szerverOlvasatlan);
  if (elozoSzerver !== szerverOlvasatlan) {
    setElozoSzerver(szerverOlvasatlan);
    setOlvasatlan(szerverOlvasatlan);
  }
  // A context-érték csak tényleges változásnál új objektum: különben minden AppShell-render a
  // useApp() minden fogyasztóját (pl. a teljes térképnézetet) újrarenderelné. A setter stabil.
  const app = useMemo(() => ({ user, ev, olvasatlan, setOlvasatlan }), [user, ev, olvasatlan]);

  return (
    <AppContext.Provider value={app}>
      <div className="flex min-h-screen">
        <Oldalsav user={user} olvasatlan={olvasatlan} oldalsavAlja={oldalsavAlja} logoutAction={logoutAction} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Fejlec szerep={user.role} ev={ev} evek={evek} valasztEvAction={valasztEvAction} />
          <main className="min-w-0 flex-1 px-[26px] pt-5 pb-11">{children}</main>
        </div>
      </div>
    </AppContext.Provider>
  );
}
```

- [ ] **Step 5: A `useApp` importálói és a layout**

- `useApp` import → `components/app-shell/AppContext`: `app/(app)/terkep/components/TerkepNezet.tsx`, `TerkepPanel.tsx` (`'../../../../components/app-shell/AppContext'`), `app/(app)/monitoring/page.tsx` (`'../../../components/app-shell/AppContext'`), `app/(app)/kommunikacio/components/OlvasatlanSzinkron.tsx` (`'../../../../components/app-shell/AppContext'`).
- `lib/valasztott-ev.ts` végére (import `type Szerepkor` a `./felhasznalo-validacio`-ból):

```ts
/**
 * A fejléc ciklusválasztójának évei, csökkenő sorrendben. Admin: minden év EV_MIN-től az aktuálisig (új év
 * profilját is létre kell tudnia hozni, a szerkesztőnek nincs saját évválasztója). Attasé: a DB-ben létező
 * profil-évek + az aktuális év, az EV_MIN..most tartományra szűrve, hogy csak olyan évet ajánljunk fel, amit a
 * valasztEvAction is elfogadna. A választott év mindig benne van (ev már validált, most mindig szerepel), hogy
 * a select konzisztens legyen. A profil-éveket (`profilEvek`) csak attasénál kéri le.
 */
export function ciklusEvek(szerep: Szerepkor, most: number, ev: number, profilEvek: () => readonly number[]): number[] {
  if (szerep === 'admin') return Array.from({ length: Math.max(0, most - EV_MIN + 1) }, (_, i) => most - i);
  return [...new Set([most, ev, ...profilEvek().filter((e) => e >= EV_MIN && e <= most)])].sort((a, b) => b - a);
}
```

- `app/(app)/layout.tsx`: `import AppShell from '../../components/app-shell/AppShell';`, `import { ciklusEvek, getValasztottEv } from '../../lib/valasztott-ev';`, a 28–35. sor (komment + `const evek = …`) → `const evek = ciklusEvek(session.role, most, ev, listProfilEvek);` (a `EV_MIN` import kikerül, ha máshol nem kell).

- [ ] **Step 6: `OldalsavAllapot` a tokenekkel**

`app/(app)/components/OldalsavAllapot.tsx`: a `SZOVEG`/`CIM`/`LINK` konstansok törlése, az inline style-ok Tailwindre (a pötty háttérszíne – `ALLAPOT_SZINEK[allapot]` – inline marad):
- `Potty`: `className="inline-block size-2 flex-[0_0_8px] rounded-full"` + `style={{ background: ALLAPOT_SZINEK[allapot] }}`.
- `Keret` gyökér: `className="border-t border-sidebar-border px-[18px] py-3.5 text-[11.5px] leading-[1.6] text-sidebar-halvany"`; cím: `className="font-semibold text-sidebar-cim"`; tartalom: `className="mt-1 flex flex-col gap-0.5"`; link: `className="mt-1.5 inline-block font-medium text-sidebar-menu no-underline"`.
- Admin-sor: `className="flex items-center gap-2"`, szám: `className="ml-auto text-sidebar-cim tabular-nums"`.
- Attasé-`Link`: `className="flex flex-col py-0.5 text-sidebar-halvany no-underline"`; első span: `className="flex items-baseline gap-2 text-sidebar-cim"`; második: `className="flex flex-wrap gap-x-1.5 pl-4"`; művelet: `className="ml-auto font-medium whitespace-nowrap text-sidebar-menu"`.
- A fájl fejkommentjének színes mondata: „A pötty színe a térképpel közös szótárból jön (ALLAPOT_SZINEK, inline style); a többi szín az oldalsáv `--sidebar*` tokenjeiből (app/globals.css). Az AllapotBadge szándékosan nincs újrahasználva, az világos háttérre van hangolva.”

- [ ] **Step 7: Login `?next=` – `lib/routes.ts`**

A fájl elejének kommentje: „Központi útvonal-konstansok. Az útvonaltábla (lib/navigacio.ts) a menüé és a fejlécé, ez a kód által használt fix célpontoké.” A `loginUtvonal` után:

```ts
/**
 * A login utáni cél (?next=) ellenőrzése, a nyílt átirányítás ellen. A böngészővel azonos URL-parserrel
 * értelmezzük, mert a regex kijátszható (pl. "/<TAB>/evil.com" → "//evil.com"): csak akkor fogadjuk el, ha a
 * bázis-originre mutat, nem a /login maga (önhurok), nem API-útvonal (oda nem navigálunk), és nem hosszabb
 * `NEXT_MAX_LENGTH`-nél (a Location fejléc ne nőjön proxy-limit fölé). A visszaadott útvonal normalizált
 * (vezérlőkarakterek nélkül), így a Location fejlécbe is biztonságos; minden más esetben `HOME_ROUTE`.
 */
export function biztonsagosNext(raw: string | string[] | undefined): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v) return HOME_ROUTE;
  let u: URL;
  try {
    u = new URL(v, 'http://n.invalid');
  } catch {
    return HOME_ROUTE;
  }
  if (u.origin !== 'http://n.invalid') return HOME_ROUTE;
  const path = u.pathname + u.search;
  if (path.length > NEXT_MAX_LENGTH) return HOME_ROUTE;
  if (path === LOGIN_ROUTE || path.startsWith(`${LOGIN_ROUTE}/`) || path.startsWith(`${LOGIN_ROUTE}?`)) return HOME_ROUTE;
  if (path === '/api' || path.startsWith('/api/')) return HOME_ROUTE;
  return path;
}
```

`app/login/page.tsx`: a `safeNext` függvény és a kommentje törlése, `const next = biztonsagosNext((await searchParams).next);`, import `{ biztonsagosNext } from '../../lib/routes'` (a `HOME_ROUTE` import kikerül, ha már nem kell).

- [ ] **Step 8: Demóadat a közös bundle-ből ki**

- `FIELDS` és `FIELD_COLORS` (a deklarációjukkal) `lib/data.ts`-ből → `lib/knowledge.ts` (a fejkomment után); `app/(app)/tudastar/page.tsx`: az importjuk `'../../../lib/knowledge'`-ből (a meglévő `KB_ITEMS…` importtal egy sorba).
- Az `ini` már törölve (Step 2); ezzel a shell nem importálja a `lib/score`-t, a `lib/data` és a `lib/score` csak a `/monitoring`-é.

- [ ] **Step 9: Ellenőrzés**

Run: `npx tsc --noEmit` – exit 0. Run: `grep -rn "components/AppShell\|lib/score'\|from '.*lib/data'" app components lib` – Expected: csak `app/(app)/monitoring/page.tsx` (lib/data, lib/score). Run: `grep -rn "localeCompare\|style={{" components/app-shell` – Expected: nincs találat.

- [ ] **Step 10: CLAUDE.md**

- UI shell bekezdés: „a `components/AppShell.tsx`-nek” → „a `components/app-shell/AppShell.tsx`-nek”, és: „A shell `components/app-shell/` alatt: `AppShell` (összerakás, az olvasatlan-számláló állapota, memoizált context-érték), `AppContext` (`useApp`), `Oldalsav`, `Fejlec`, `CiklusValaszto` (`useOptimistic`), `LogoutForm`. A színek a `globals.css` `--sidebar*` tokenjeiben (a mai sötét paletta), a betűméretek arbitrary `text-[Npx]` osztályok (a névvel ellátott `text-xs` line-height-ot is állítana).” A „A sidebar `NAV` … és a fejléc `TITLES` táblázata az AppShell-ben van; új oldalhoz mindkettőt bővíteni kell.” mondat helyett: „Az útvonaltábla `lib/navigacio.ts` `UTVONALAK` (href, fejléc-cím és -alcím, `adminOnly`, opcionális `menu`: ikon, felirat, `alHrefek`); belőle a menü (`menupontok`, `menuAktiv`) és a fejléc (`titleFor`). Új oldalhoz egy sort kell felvenni.”
- „Projektstruktúra” konvenciói: „Új route-nál az `AppShell.tsx` `NAV` és `TITLES` tábláját is bővítsd.” → „Új route-nál a `lib/navigacio.ts` `UTVONALAK` tábláját is bővítsd.”; a táblázat „Megosztott komponensek” sorában „Az `AppShell.tsx` már itt van.” → „A shell a `components/app-shell/` alatt van.”
- Auth bekezdés: „A `?next=` építése és validálása mindkét ágon (proxy és session) a `lib/routes.ts` `loginUtvonal()` / `NEXT_MAX_LENGTH` közös helperében van.” → „… a `lib/routes.ts`-ben van: építés `loginUtvonal()`, a login oldal olvasó oldala `biztonsagosNext()` (nyílt átirányítás és `NEXT_MAX_LENGTH` ellen).”
- A „Demó pontszámlogika” bekezdés végére: „A `lib/data`/`lib/score` csak a `/monitoring`-é (a tudástár szókészlete, `FIELDS`, a `lib/knowledge.ts`-ben van): a közös bundle-be ne kerüljön.”; a monogram: „`lib/nev.ts` `monogram()` (a „dr.”-szerű titulust kihagyja) – az oldalsáv és a ticket-buborékok is ezt használják.”

- [ ] **Step 11: Commit**

```bash
git add -u && git add components/app-shell lib/navigacio.ts lib/nev.ts
git commit -m "refactor(shell): az AppShell szétbontása components/app-shell alá, egy útvonaltábla, sidebar-tokenek, memoizált context, monogram és ?next= a lib-ben, demóadat ki a közös bundle-ből

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Térkép

**Files:**
- Create: `app/(app)/terkep/components/{vetulet.ts,TerkepRetegek.tsx,useTerkepZoom.ts,MutatoValaszto.tsx,IparagSzuro.tsx}`
- Modify: `app/(app)/terkep/components/{VilagTerkep,useVilagAtlasz,TerkepNezet,TerkepPanel,ProfilKivonat,RangsorPanel,OsszehasonlitasPanel,OsszehasonlitasFejlec,OsszehasonlitasCsik,Jelmagyarazat,RegioGombok,TerkepTooltip,useTerkepAllapot}.tsx|ts`, `app/(app)/orszagprofil/components/AttaseLista.tsx`, `lib/{terkep-mutatok,osszehasonlitas,attase-orszag}.ts`, `CLAUDE.md`.

- [ ] **Step 1: `vetulet.ts`**

```ts
import { geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo';
import { zoomIdentity, type ZoomTransform } from 'd3-zoom';

// A térkép vetülete és koordinátarendszere (viewBox) – modulszinten, mert rögzített: a poligonok
// path-jai (useVilagAtlasz) és a régió-keretek (regioTranszform) is ebből számolnak.

export const W = 960;
export const H = 505;
export const ZOOM_MAX = 8;
export const PIN_R = 5.5;
export const PIN_BELSO_R = 1.8;

export const proj = geoNaturalEarth1().fitExtent([[6, 6], [W - 6, H - 6]], { type: 'Sphere' });
export const path = geoPath(proj);
export const GOMB_D = path({ type: 'Sphere' }) ?? '';
export const RACS_D = path(geoGraticule10()) ?? '';
```

és utána a `regioTranszform` (a doc-kommentjével) **változatlanul** a mai `VilagTerkep.tsx:46-73`-ból, `export function`-ként.

- [ ] **Step 2: `useVilagAtlasz.ts` – a path-ok egyszer készülnek**

```ts
'use client';

import { useEffect, useState } from 'react';
import type { Feature, Geometry } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import { path } from './vetulet';

/** Egy ország poligonja: a world-atlas neve (`properties.name`) és a kész SVG path. */
export interface Poligon { nev: string; d: string }

type Atlasz = Topology<{ countries: GeometryCollection<{ name: string }> }>;

// Modulszintű promise: a world-atlas chunk, a TopoJSON → GeoJSON átalakítás és a path-ok előállítása
// (a vetület rögzített) egyszer fut, minden hívó ugyanazt a tömböt kapja – a /terkep-re visszatérve sem
// számolódik újra. Hiba után nullázzuk, hogy a következő mount újrapróbálja.
let atlaszPromise: Promise<Poligon[]> | null = null;

function betolt(): Promise<Poligon[]> {
  if (!atlaszPromise) {
    atlaszPromise = Promise.all([import('world-atlas/countries-110m.json'), import('topojson-client')])
      .then(([topo, tc]) => {
        const t = topo.default as unknown as Atlasz;
        const feats = tc.feature(t, t.objects.countries).features as Feature<Geometry, { name: string }>[];
        return feats.map((f) => ({ nev: f.properties.name, d: path(f) ?? '' }));
      });
    atlaszPromise.catch(() => { atlaszPromise = null; });
  }
  return atlaszPromise;
}

/**
 * A world-atlas 110m országpoligonjai path-tal; `poligonok` null, amíg töltődik, `hiba` true, ha a chunk
 * nem jött be. A visszaadott tömb modulszinten megosztott (minden hívó ugyanazt kapja): ne mutáld.
 */
export function useVilagAtlasz(): { poligonok: Poligon[] | null; hiba: boolean } {
  const [poligonok, setPoligonok] = useState<Poligon[] | null>(null);
  const [hiba, setHiba] = useState(false);
  useEffect(() => {
    let aktiv = true;
    betolt().then(
      (p) => { if (aktiv) setPoligonok(p); },
      () => { if (aktiv) setHiba(true); },
    );
    return () => { aktiv = false; };
  }, []);
  return { poligonok, hiba };
}
```

(Ha a `tc.feature(...).features` típusa már `Feature<Geometry, { name: string }>[]`, a `as` elhagyható – a fordító dönt.)

- [ ] **Step 3: `TerkepRetegek.tsx`**

```tsx
'use client';

import { memo, useMemo, type PointerEvent as ReactPointerEvent } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { geoNev } from '../../../../lib/orszagok';
import { TERKEP_SZINEK } from '../../../../lib/terkep-mutatok';
import type { Poligon } from './useVilagAtlasz';
import { PIN_BELSO_R, PIN_R, proj } from './vetulet';

/** A számszerű mutató érték nélküli országainak sraffozása: a VilagTerkep `<pattern>`-jének id-ja. */
export const SRAFF_ID = 'terkep-sraff';

export type HoverFn = (e: ReactPointerEvent<SVGElement>, nev: string, o: TerkepOrszag | null) => void;
```

és utána a `TerkepRetegek` memo-komponens **változatlanul** a mai `VilagTerkep.tsx:81-153`-ból, `export const`-ként.

- [ ] **Step 4: `useTerkepZoom.ts`**

```ts
'use client';

import { select } from 'd3-selection';
import 'd3-transition';
import { zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior } from 'd3-zoom';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { REGIOK } from '../../../../lib/terkep-mutatok';
import { H, PIN_BELSO_R, PIN_R, regioTranszform, W, ZOOM_MAX } from './vetulet';

/** A pin-réteg (külön `<g data-pinek>`, hogy csak ezt kelljen pásztázni). */
function pinReteg(g: SVGGElement | null): SVGGElement | null {
  return g?.querySelector<SVGGElement>('[data-pinek]') ?? null;
}

/** A pin-réteg köreinek sugarát a nagyítás reciprokával állítja, hogy a pin képernyőn állandó méretű maradjon. */
function pinSugar(pinek: SVGGElement, k: number) {
  pinek.querySelectorAll<SVGCircleElement>('circle[data-pin]').forEach((c) => c.setAttribute('r', String(PIN_R / k)));
  pinek.querySelectorAll<SVGCircleElement>('circle[data-pin-belso]').forEach((c) => c.setAttribute('r', String(PIN_BELSO_R / k)));
}

/**
 * A térkép nagyítása (d3-zoom az `<svg>`-n). A zoom-esemény közvetlenül a DOM-on dolgozik – a `<g>`
 * transformja, a pinek sugara és a sraffozás csempéje –, nem React-állapoton át, hogy görgetésenként ne
 * renderelődjön újra ~180 path. Kézi zoom/mozgatás (sourceEvent van) után egyik régió-gomb sem aktív. A
 * clickDistance(4) miatt az apró egérmozgás nem nyeli el a kattintást. `kesz`: az SVG mountolva van (a
 * poligonok betöltődtek); új `adatok`-nál (évváltás) az újonnan mountolt pinek sugara igazodik az aktuális
 * nagyításhoz. A `nagyit` és a `regioValaszt` stabil (useCallback), a memo-zott gombok nem renderelődnek újra.
 */
export function useTerkepZoom(kesz: boolean, adatok: readonly TerkepOrszag[]) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const patternRef = useRef<SVGPatternElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const kRef = useRef(1);
  const [regio, setRegio] = useState<string | null>('vilag');

  useEffect(() => {
    const svg = svgRef.current;
    const g = gRef.current;
    if (!kesz || !svg || !g) return;
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, ZOOM_MAX])
      .translateExtent([[0, 0], [W, H]])
      .clickDistance(4)
      .on('zoom', (e: D3ZoomEvent<SVGSVGElement, unknown>) => {
        const { k } = e.transform;
        kRef.current = k;
        g.setAttribute('transform', e.transform.toString());
        const pinek = pinReteg(g);
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
  }, [kesz]);

  useEffect(() => {
    const pinek = pinReteg(gRef.current);
    if (pinek) pinSugar(pinek, kRef.current);
  }, [adatok]);

  const nagyit = useCallback((f: number) => {
    const svg = svgRef.current;
    const z = zoomRef.current;
    if (!svg || !z) return;
    setRegio(null); // kézi nagyítás: a régió-keret már nem érvényes
    select(svg).transition().duration(300).call(z.scaleBy, f);
  }, []);

  const regioValaszt = useCallback((kulcs: string) => {
    const r = REGIOK.find((x) => x.kulcs === kulcs);
    const svg = svgRef.current;
    const z = zoomRef.current;
    if (!r || !svg || !z) return;
    setRegio(kulcs);
    select(svg).transition().duration(400).call(z.transform, r.bbox ? regioTranszform(r.bbox) : zoomIdentity);
  }, []);

  return { svgRef, gRef, patternRef, regio, nagyit, regioValaszt };
}
```

- [ ] **Step 5: `VilagTerkep.tsx` – csak az összerakás**

A fájl új tartalma: a fejkomment marad (a „A zoom (d3-zoom) közvetlenül a DOM-on…” rész helyett: „A zoom a `useTerkepZoom`-ban, a vetület a `vetulet.ts`-ben, a poligon- és pin-réteg a `TerkepRetegek` memo-komponensben van – a tooltip (hover-állapot) frissülése így nem rendereli újra őket.”), az `ARANY` konstans marad, és:

```tsx
'use client';

import { Minus, Plus, RotateCcw } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { Button } from '../../../../components/ui/button';
import {
  orszagSzin, szinSkala, TERKEP_SZINEK, type Csoport, type Mutato, type Rangsor, type Tartomany,
} from '../../../../lib/terkep-mutatok';
import { Jelmagyarazat } from './Jelmagyarazat';
import { RegioGombok } from './RegioGombok';
import { SRAFF_ID, TerkepRetegek, type HoverFn } from './TerkepRetegek';
import { TerkepTooltip, type HoverAllapot } from './TerkepTooltip';
import { useTerkepZoom } from './useTerkepZoom';
import { useVilagAtlasz } from './useVilagAtlasz';
import { GOMB_D, H, RACS_D, W } from './vetulet';
```

A komponensben: `const { poligonok, hiba } = useVilagAtlasz();`, `const { svgRef, gRef, patternRef, regio, nagyit, regioValaszt } = useTerkepZoom(poligonok !== null, adatok);`, a `wrapRef`, a `hover` állapot, a `rekordGeo`/`szinek` memo és az `onHover` változatlan; a `poligonok` memo, a zoom-effektek, a `pinReteg`, a `nagyit` és a `regioValaszt` törlődik (a hookban vannak). A JSX betűre a mostani.

- [ ] **Step 6: Memo – `Jelmagyarazat`, `RegioGombok`, `OsszehasonlitasPanel`**

Mindháromban: `import { memo } from 'react';` (az `OsszehasonlitasPanel`-ben a meglévő `type ReactNode` importtal egy sorba), és `export function X(...) { … }` → `export const X = memo(function X(...) { … });`. A doc-kommentekbe egy-egy fél mondat: Jelmagyarazat/RegioGombok – „memo: a térkép minden hover-eseménynél renderel, ez a rész nem változik vele”; OsszehasonlitasPanel – „memo: minden propja stabil (useMemo/useCallback a TerkepNezetben és a useTerkepAllapotban), így a kijelölés vagy az iparág-szűrő változása nem rendereli újra a kártyákat és a mátrixokat”.

- [ ] **Step 7: A térkép vezérlői külön komponensben**

`lib/terkep-mutatok.ts`: az `IPARAG_CIMKEK` elé `export`; a `nevSzerint` után új függvény:

```ts
/** Kiemeli-e az ország az iparágat (az iparág-szűrő feltétele). */
function kiemeli(o: TerkepOrszag, iparag: string): boolean {
  return (o.iparagak as readonly string[]).includes(iparag);
}
```

és a `szures` (106. sor) meg az `orszagSzin` (248. sor) ezt hívja. A `MUTATO_KULCSOK` elől az `export` törlése (`grep -rn "MUTATO_KULCSOK" app components lib` – csak a saját fájlja). A `jeloltek` után:

```ts
/** A rangsor-panel alcíme: számszerű mutatónál az adattal / adat nélküli országok, iparág-szűrőnél a találatok, különben az országok és az adott évi profilok száma. */
export function szamlaloSzoveg(adatok: readonly TerkepOrszag[], r: Rangsor | null, iparag: string, ev: number): string {
  if (r) return `${r.sorok.length} ország adattal · ${r.adatNelkul.length} adat nélkül`;
  if (iparag) return `${szures(adatok, iparag).length} ország emeli ki ezt az iparágat`;
  return `${adatok.length} ország · ${adatok.filter((o) => o.allapot === 'friss').length} profil (${ev})`;
}

/** A csoport React-kulcsa (a kategória nélküli csoporté fix). */
export function csoportKulcs(cs: Csoport): string {
  return cs.kategoria ?? '__nincs';
}
```

A `RangsorPanel.tsx:117` és a `Jelmagyarazat.tsx:70` `key={cs.kategoria ?? '__nincs'}` → `key={csoportKulcs(cs)}`.

`MutatoValaszto.tsx`:

```tsx
'use client';

import { Label } from '../../../../components/ui/label';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from '../../../../components/ui/select';
import { KATEGORIA_MUTATOK, MUTATOK, SZAM_MUTATOK, type Mutato } from '../../../../lib/terkep-mutatok';

const MUTATO_ITEMS: Record<string, string> = Object.fromEntries(MUTATOK.map((m) => [m.kulcs, m.cimke]));

/** A térkép színezésének mutatója, két csoportban (Kategória, Számszerű); ismeretlen kulcsot a hívó (mutatoByKulcs) kezel. */
export function MutatoValaszto({ mutato, onChange }: { mutato: Mutato; onChange: (kulcs: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Label id="mutato-label" htmlFor="mutato">Mutató</Label>
      <Select value={mutato.kulcs} onValueChange={(v) => onChange(v ?? '')} items={MUTATO_ITEMS}>
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
  );
}
```

`IparagSzuro.tsx`:

```tsx
'use client';

import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { AGAZATOK } from '../../../../lib/orszagprofil-szotar';
import { IPARAG_CIMKEK } from '../../../../lib/terkep-mutatok';

/** A „Mind" opció értéke: a Base UI Select üres stringet nem tud választható értékként kezelni. */
const MIND = '__mind';
const IPARAG_ITEMS: Record<string, string> = { [MIND]: 'Mind', ...IPARAG_CIMKEK };

/** Iparág-szűrő a térképhez; '' = nincs szűrő. */
export function IparagSzuro({ iparag, onChange }: { iparag: string; onChange: (iparag: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Label id="iparag-szuro-label" htmlFor="iparag-szuro">Iparág</Label>
      {/* A Select onValueChange null-t is adhat (törlés); a „Mind" és a null egyaránt „nincs szűrő". */}
      <Select value={iparag || MIND} onValueChange={(v) => onChange(!v || v === MIND ? '' : v)} items={IPARAG_ITEMS}>
        <SelectTrigger id="iparag-szuro" aria-labelledby="iparag-szuro-label iparag-szuro" className="w-64">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={MIND}>Mind</SelectItem>
          {AGAZATOK.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
```

- [ ] **Step 8: A Szerkesztés-gomb egy megkötött függvényként**

`ProfilKivonat.tsx`: új exportált típus a komponens fölött,

```tsx
/** A Szerkesztés-gomb előállítója: a TerkepNezet köti meg a joggal (canEditProfil) és az évekkel; a hívó az országot és a feliratokat adja. */
export type SzerkesztesGombFn = (kod: string, opciok: { felirat: string; feliratMost?: string; className?: string }) => ReactNode;
```

(import `type ReactNode` a `react`-ből); a propokból a `szerkeszthetEv`, `szerkeszthetMost`, `most`, `valasztEvAction` törlése, helyette `szerkesztesGomb: SzerkesztesGombFn;`; a `<SzerkesztesGomb … />` blokk helyett `{szerkesztesGomb(o.kod, { felirat: o.allapot === 'nincs' ? 'Profil kitöltése' : 'Szerkesztés', feliratMost: 'Szerkesztés', className: 'ml-auto' })}`; a `SzerkesztesGomb` import törlése.

`TerkepPanel.tsx`: a `useApp` és a `canEditProfil` import, a `const { user } = useApp();` sor és az `ev`, `most`, `valasztEvAction` prop törlése; új prop `szerkesztesGomb: SzerkesztesGombFn` (import type a `./ProfilKivonat`-ból), a `ProfilKivonat`-nak `szerkesztesGomb={szerkesztesGomb}` megy a négy törölt prop helyett.

`TerkepNezet.tsx` – a teljes új tartalom:

```tsx
'use client';

import { useCallback, useMemo } from 'react';
import { useApp } from '../../../../components/app-shell/AppContext';
import { SzerkesztesGomb } from '../../../../components/orszagprofil/SzerkesztesGomb';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { elsoVezetettKod } from '../../../../lib/attase-orszag';
import { HAZAI_KOD } from '../../../../lib/orszagok';
import { canEditProfil } from '../../../../lib/orszagprofil-jog';
import {
  csoportok as szamolCsoportok, jeloltek, rangsor as szamolRangsor, szamlaloSzoveg, tartomany as szamolTartomany,
} from '../../../../lib/terkep-mutatok';
import { IparagSzuro } from './IparagSzuro';
import { MutatoValaszto } from './MutatoValaszto';
import { OsszehasonlitasPanel } from './OsszehasonlitasPanel';
import type { SzerkesztesGombFn } from './ProfilKivonat';
import { TerkepPanel } from './TerkepPanel';
import { useTerkepAllapot } from './useTerkepAllapot';
import { VilagTerkep } from './VilagTerkep';

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
  // A gomb az első vezetett országra visz (a székhely előnyben); nem vezető attasénál nincs gomb.
  const { user } = useApp();
  const sajatKod = user.role === 'attase' ? elsoVezetettKod(user.orszagok) : null;
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
  // Magyarország mindig viszonyítási alap, ezért a „+ Ország" jelöltjei között sincs.
  const jeloltLista = useMemo(() => jeloltek(adatok, [...vs, HAZAI_KOD], mutato), [adatok, vs, mutato]);
  const szamlalo = szamlaloSzoveg(adatok, rangsor, iparag, ev);
  // A Szerkesztés-gomb jogát a nézett (ev) és az aktuális (most) évre számoljuk; egyszer kötjük meg, a
  // fejléc, a panel és a kivonat csak az országot és a feliratokat adja hozzá.
  const szerkesztesGomb = useCallback<SzerkesztesGombFn>(
    (kod, opciok) => (
      <SzerkesztesGomb
        kod={kod}
        most={most}
        szerkeszthetEv={canEditProfil(user, kod, ev, most)}
        szerkeszthetMost={canEditProfil(user, kod, most, most)}
        action={valasztEvAction}
        {...opciok}
      />
    ),
    [user, ev, most, valasztEvAction],
  );

  return (
    <div className="flex max-w-[1600px] flex-col gap-4">
      <div className="flex flex-wrap items-start gap-4">
        <Card className="min-w-0 flex-[1_1_560px] overflow-hidden">
          <CardHeader className="flex flex-wrap items-center gap-3">
            <MutatoValaszto mutato={mutato} onChange={allapot.setMutatoKulcs} />
            <IparagSzuro iparag={iparag} onChange={allapot.setIparag} />
            {/* A számláló szöveg a rangsor-panel alcíme (nem duplázzuk a fejlécben). */}
            {sajatKod && szerkesztesGomb(sajatKod, { felirat: 'Saját országprofil', className: 'ml-auto' })}
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
            szerkesztesGomb={szerkesztesGomb}
          />
        </div>
      </div>
      {/* Az összehasonlítás a térkép alatt, teljes szélességben: a keskeny panelen nem férne el. Magyar
          profil mellett (viszonyítási alap) már 1 országtól látszik (`vsMin`). */}
      {vsOrszagok.length >= allapot.vsMin && (
        <OsszehasonlitasPanel
          orszagok={vsOrszagok}
          szinek={allapot.vsSzinek}
          hazai={allapot.hazai}
          jeloltek={jeloltLista}
          mutato={mutato}
          tele={allapot.vsTele}
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

- [ ] **Step 9: Az összehasonlítás-halmaz egy helyen**

`lib/osszehasonlitas.ts`: a `VS_SZINEK` után `/** Legfeljebb ennyi ország lehet az összehasonlításban: ahány színe van. */ export const VS_MAX = VS_SZINEK.length;`, a `vsHozzaadElem` feltételében `v.length >= VS_MAX`; a `vsHozzaadElem` után:

```ts
/** Kivétel a halmazból; a többi elem színe marad. Ha az ország nincs benne, ugyanazt a példányt adja. */
export function vsKiveszElem(v: readonly VsElem[], kod: string): readonly VsElem[] {
  return v.some((e) => e.kod === kod) ? v.filter((e) => e.kod !== kod) : v;
}
```

`useTerkepAllapot.ts`: a saját `VS_MAX` export törlése, `import { hazaiRekord, VS_MAX, VS_SZINEK, vsHozzaadElem, vsKiveszElem, type VsElem } …`; `vsKivesz` → `setVsElemek((v) => vsKiveszElem(v, k))`, `vsValt` → `setVsElemek((v) => (v.some((e) => e.kod === k) ? vsKiveszElem(v, k) : vsHozzaadElem(v, k)))`.

`OsszehasonlitasCsik.tsx`: új prop `tele: boolean` (doc: „A halmaz tele (`TerkepAllapot.vsTele`).”), a `const tele = …` sor törlése, `import { VS_MAX } from '../../../../lib/osszehasonlitas';`. `TerkepPanel.tsx`: `<OsszehasonlitasCsik … tele={vsTele} />`.

`OsszehasonlitasPanel.tsx`: új prop `tele: boolean` (doc ugyanúgy), továbbadva az `OsszehasonlitasFejlec`-nek. `OsszehasonlitasFejlec.tsx`: új prop `tele: boolean`, `const plusz = !tele && jeloltek.length > 0;`, a `VS_MAX` import törlése.

- [ ] **Step 10: Apróságok**

- `lib/terkep-mutatok.ts` `ertekEsHely`: visszatérési típus `{ szoveg: string; helyezett: boolean } | null`, a sikeres ág `return { szoveg: `…ugyanaz a sablon…`, helyezett: !!sor };`, a doc-komment kiegészül: „`helyezett`: az ország a (szűrt) rangsorban van”. `TerkepTooltip.tsx:23`: `${ertekEsHely(o, mutato, rangsor)?.szoveg ?? 'nincs adat'}`. `ProfilKivonat.tsx`: a `helyezett` számítás (47. sor) törlése; `ertek.helyezett` a `title`-ben, `{ertek.szoveg}` a szövegben.
- `lib/attase-orszag.ts`, az `attaseFelirat` mellé:

```ts
/** A „relációs vezető” jelzés csak több attasénál látszik: egyszemélyes országban a vezetőség automatikus. */
export function vezetoJelzes(attasek: readonly OrszagAttase[], a: OrszagAttase): boolean {
  return attasek.length > 1 && a.vezeto;
}
```

  és a `TerkepTooltip.tsx` (`tobb && a.vezeto` → `vezetoJelzes(o.attasek, a)`, a `tobb` változó törlése), a `ProfilKivonat.tsx:61` és az `app/(app)/orszagprofil/components/AttaseLista.tsx:33` (`tobb && a.vezeto` → `vezetoJelzes(attasek, a)`; a `tobb` a címhez marad) ezt hívja.
- `ProfilKivonat.tsx` `<dl>`: fájlszintű `function Sor({ cimke, children }: { cimke: string; children: ReactNode }) { return <><dt className="text-muted-foreground">{cimke}</dt><dd>{children}</dd></>; }`, és a 10 `<dt …>…</dt><dd>…</dd>` pár ezzel (a feltételek változatlanok). A két `cn(buttonVariants({ variant: 'outline' }))` → `buttonVariants({ variant: 'outline' })`, a `cn` import törlése, ha más nem használja.
- `OsszehasonlitasFejlec.tsx`: fájlszintű `function AttaseEsAllapot({ o }: { o: TerkepOrszag })` a két ismétlődő sorral (attasé-sor + `AllapotBadge`), az országkártyák és a magyar kártya ezt rendereli.
- A `TerkepTooltip` kategorikus ága (`mutatoSor` 27–28. sor) **marad**: a jövőbeli kategorikus mutatókat általánosan kezeli (a spec-ben elvetett pont).

- [ ] **Step 11: Ellenőrzés**

Run: `npx tsc --noEmit` – exit 0. Run: `grep -n "d3-zoom\|d3-geo\|useEffect" "app/(app)/terkep/components/VilagTerkep.tsx"` – Expected: nincs találat. Run: `grep -rn "VS_MAX" "app/(app)/terkep"` – Expected: csak import a `lib/osszehasonlitas`-ból és kommentek.

- [ ] **Step 12: CLAUDE.md**

- Térkép bekezdés: „`app/(app)/terkep/components/VilagTerkep.tsx` React kliens-komponens: az SVG-t React rendereli, a d3-geo (npm) csak a Natural Earth vetületet és a path-okat adja” → „… `VilagTerkep.tsx` az összerakás; a vetület és a régió-keret `vetulet.ts`, a zoom `useTerkepZoom.ts`, a poligon- és pin-réteg `TerkepRetegek.tsx` (memo), a world-atlas 110m TopoJSON a `useVilagAtlasz.ts`-ben (dinamikus import, modulszintű promise, ami a path-okat is egyszer állítja elő – **nem kell CDN vagy internet**)”. A „poligonok és pinek a `TerkepRetegek` memo-komponensben vannak” mondat maradhat.
- Országprofil route-leírásában (TerkepNezet): „**Mutató** `Select`…” → „**Mutató** (`MutatoValaszto`) két csoporttal …, iparág-szűrő (`IparagSzuro`) …”; a `VS_MAX` említése: „(legfeljebb `VS_MAX`=4 – `lib/osszehasonlitas.ts`, a `VS_SZINEK` színeinek száma)”; a `useTerkepAllapot` felsorolásában a `vsKivesz`/`vsValt` mellé: „(a halmaz-műveletek a `lib/osszehasonlitas.ts` `vsHozzaadElem`/`vsKiveszElem`-jei)”; az `OsszehasonlitasPanel` és a `Jelmagyarazat`/`RegioGombok` `memo`-zott.
- „Amire figyelni kell” – a Szerkesztés-gomb: „a térképen a `SzerkesztesGomb`-ot a `TerkepNezet` köti meg egyszer (`SzerkesztesGombFn`, a jog és az évek benne), a panel és a kivonat csak az országot és a feliratot adja”.

- [ ] **Step 13: Commit**

```bash
git add -u && git add "app/(app)/terkep/components"
git commit -m "refactor(terkep): a VilagTerkep szétbontása (vetület, zoom-hook, rétegek), path-ok egyszer, memo a panelekre, vezérlők külön, a Szerkesztés-gomb fúrás nélkül, a halmaz-logika a lib-ben

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Űrlapok, jelentések, kommunikáció, felhasználók

**Files:**
- Create: `components/form/CimkesSelect.tsx`, `components/form/useNyitas.ts`, `components/orszagprofil/SzinesBadge.tsx`, `app/(app)/kommunikacio/components/UzenetLista.tsx`
- Delete: `app/(app)/felhasznalok/components/SzerepkorSelect.tsx`
- Modify: `components/form/{Mezo,CimkeSor,SzamMezo,CimkeValaszto,useMuveletForm}.ts(x)`, `components/riport/{RiportForm,EsemenyMezok,CsatolmanyMezo}.tsx`, `app/(app)/jelentesek/components/{RiportSzurok,RiportReszlet,RiportTorles,RiportTabla,IntezkedesDialog,IntezkedesSzerkeszto}.tsx`, `app/(app)/kommunikacio/{page.tsx,actions.ts,components/UjTicketDialog.tsx,components/TicketBeszelgetes.tsx,components/TicketAdatlap.tsx,components/TicketStatuszGombok.tsx,components/TicketLista.tsx}`, `app/(app)/felhasznalok/{page.tsx,actions.ts,components/UjFelhasznaloDialog.tsx,components/SzerkesztesDialog.tsx,components/JelszoDialog.tsx,components/FelhasznaloMuveletek.tsx,components/OrszagMezok.tsx}`, `app/(app)/{jelentesek,uj-jelentes}/actions.ts`, `app/(app)/orszagprofil/{[kod]/szerkesztes/page.tsx,[kod]/page.tsx,components/BlokkForm.tsx,components/RendezvenySorok.tsx,components/BlokkNezet.tsx,components/mezok/*.tsx}`, `components/orszagprofil/{AgazatBadge,AllapotBadge}.tsx`, `lib/{riport-szotar,orszagprofil-szotar,routes,riport-szuro}.ts`, `CLAUDE.md`.

- [ ] **Step 1: A `Mezo` család – `opcionalis`, halott `sugo` ki**

- `components/form/CimkeSor.tsx`: új prop `opcionalis?: boolean`; a label tartalma `{cimke}{opcionalis && <>{' '}<span className="font-normal text-muted-foreground">(opcionális)</span></>}` (a `SugoGomb` `cimke`-je a puszta szöveg marad).
- `components/form/Mezo.tsx` `Mezo`: új prop `opcionalis?: boolean`, továbbadva a `CimkeSor`-nak; a doc-kommentbe: „`opcionalis`: a címke után halvány „(opcionális)”.” A `SzovegMezo`, `RovidMezo`: a `sugo` prop törlése a típusból és a destrukturálásból, a `Mezo`-nak nem megy `sugo`, `{...leiroAttr(errors, id)}`. A `Mezo` saját `sugo` propja **marad** (az `OrszagMezok` használja).
- `components/form/SzamMezo.tsx`: ugyanígy a `sugo` törlése, `leiroAttr(errors, id)`.
- `components/form/CimkeValaszto.tsx`: a `sugo` prop és a `{sugo && <p …>}` sor törlése, `leiroAttr(errors, id)`.
- Ellenőrzés: `grep -rn "sugo=" app components` – csak `OrszagMezok.tsx` (`Mezo`).

- [ ] **Step 2: Jelentés-feliratok egy helyen – `lib/riport-szotar.ts`**

```ts
/** A jelentés mezőinek feliratai: az űrlap (RiportForm, EsemenyMezok) és a részletoldal (RiportReszlet) közös forrása. */
export const RIPORT_MEZO_CIMKEK = {
  orszag: 'Ország',
  kategoria: 'Kategória',
  targy: 'Tárgy',
  leiras: 'Vezetői Összefoglaló',
  joGyakorlat: 'Fő üzenet, Mo. számára átvehető jó gyakorlat, javaslat',
  kulcsszavak: 'Kulcsszavak (1–5)',
  esemeny: 'Rendezvény adatai',
  esemenyDatum: 'Dátum',
  esemenyHelyszin: 'Helyszín',
  kapcsolodoFeladat: 'Kapcsolódó feladat, kérés',
} as const;
```

A `RiportReszlet.tsx` 57., 65., 86., 104. sorának szövege a megfelelő kulcsból (`RIPORT_MEZO_CIMKEK.leiras` stb.); a `RiportForm`/`EsemenyMezok` a 3. lépésben.

- [ ] **Step 3: `Mezo` a kézzel írt mezőblokkok helyett**

Minta: `<div className="flex flex-col gap-1.5"><Label htmlFor="X">Címke</Label>{vezérlő}{esetleg számláló}<MezoHiba mezo="X" errors={errors} /></div>` → `<Mezo id="X" cimke="Címke" errors={errors}>{vezérlő}{esetleg számláló}</Mezo>`. A vezérlő saját `{...hibaAttr(errors, 'X')}`-e marad. A `Mezo` a címkének `X-label` id-t ad (új, ártalmatlan attribútum).

- `components/riport/RiportForm.tsx`: `orszag` (a `NativeSelect` a `className="max-w-sm"`-mel), `targy`, `leiras` (a számláló `<p>` a `Mezo` gyereke a textarea után), `joGyakorlat` (`opcionalis`, a `<span>(opcionális)</span>` kézi sor törlése), `kulcsszavak` (`<Mezo id="kulcsszavak" …>` – a `CimkeSor` ugyanazt a `kulcsszavak-label` id-t és `htmlFor`-t adja, mint ma), `kapcsolodoFeladat`. A címkék a `RIPORT_MEZO_CIMKEK`-ből. A kategória-szekció (`<section className="flex flex-col gap-2">`, `htmlFor` nélküli `Label id="kategoria-label"`) marad, csak a szövege `RIPORT_MEZO_CIMKEK.kategoria`. A `Label`/`MezoHiba` importok közül ami nem kell, kikerül (a `form` szintű `MezoHiba` marad).
- `components/riport/EsemenyMezok.tsx`: a `legend` szövege `RIPORT_MEZO_CIMKEK.esemeny`; a két mező `Mezo` (`esemenyDatum`, `esemenyHelyszin`).
- `app/(app)/jelentesek/components/IntezkedesDialog.tsx`: `intezkedes` („Intézkedés szövege”, a számlálóval).
- `app/(app)/kommunikacio/components/UjTicketDialog.tsx`: `hatarido` (a „Határidő (opcionális)” felirat szövegként marad, nem `opcionalis` – a mai kinézet ez), `targy`, `szoveg`.
- `app/(app)/felhasznalok/components/UjFelhasznaloDialog.tsx`: `nev`, `email` („E-mail cím (bejelentkezés)”), `jelszo` („Kezdő jelszó”); `SzerkesztesDialog.tsx`: `nev`; `JelszoDialog.tsx`: `jelszo` („Új jelszó”).

- [ ] **Step 4: Címkés Select – `components/form/CimkesSelect.tsx`**

```tsx
'use client';

import type { ReactNode } from 'react';
import type { MezoHibak } from '../../lib/urlap';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { hibaAttr, MezoHiba } from './MezoHiba';

export interface SelectOpcio {
  ertek: string;
  cimke: string;
}

/**
 * Címkés legördülő (Base UI Select) a megadott sorrendű opciókkal. A trigger `role=combobox` gomb, amire a
 * `<label for>` nem minden AT-nél számít névnek, ezért `aria-labelledby`: a címke id-ja + a sajátja (a név
 * így „címke + aktuális érték”). `name` megadásával a Base UI rejtett inputot renderel, így az érték a
 * FormData-ban is megjelenik. Üres `value` = nincs kiválasztva (a `placeholder` látszik). A hiba kulcsa az
 * `id`; `errors` nélkül nincs hibasor. A `children` a hibasor alá kerül (pl. megjegyzés).
 */
export function CimkesSelect({
  id, cimke, value, onChange, opciok, name, placeholder, required, errors, className, children,
}: {
  id: string;
  cimke: string;
  value: string;
  onChange: (v: string) => void;
  opciok: readonly SelectOpcio[];
  name?: string;
  placeholder?: string;
  required?: boolean;
  errors?: MezoHibak;
  /** A trigger osztályai (pl. szélesség). */
  className?: string;
  children?: ReactNode;
}) {
  const items = Object.fromEntries(opciok.map((o) => [o.ertek, o.cimke]));
  return (
    <div className="flex flex-col gap-1.5">
      <Label id={`${id}-label`} htmlFor={id}>
        {cimke}
      </Label>
      <Select name={name} value={value === '' ? null : value} onValueChange={(v) => onChange(v ?? '')} items={items} required={required}>
        <SelectTrigger id={id} aria-labelledby={`${id}-label ${id}`} {...(errors ? hibaAttr(errors, id) : {})} className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {opciok.map((o) => (
            <SelectItem key={o.ertek} value={o.ertek}>
              {o.cimke}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors && <MezoHiba mezo={id} errors={errors} />}
      {children}
    </div>
  );
}
```

- `app/(app)/jelentesek/components/RiportSzurok.tsx`: a `SzuroSelect` és a `SzuroOpcio` törlése; a hívóhelyeken `<CimkesSelect id=… cimke=… value={ertek || MIND} onChange={(v) => onChange(szuroErtek(v))} opciok={[{ ertek: MIND, cimke: 'Mind' }, ...opciok]} className=… />` (a `KATEGORIA_OPCIOK`/`KULCSSZO_OPCIOK` típusa `SelectOpcio[]`; a `MIND` és a `szuroErtek` marad). A „Mind” a mai sorrendben az első opció.
- `app/(app)/kommunikacio/components/UjTicketDialog.tsx`: a `Valaszto` törlése; modulszintű `const TIPUS_OPCIOK = Object.entries(TIPUSOK).map(([ertek, cimke]) => ({ ertek, cimke }));` és `PRIO_OPCIOK` ugyanígy; `<CimkesSelect id="tipus" name="tipus" cimke="Típus" value={tipus} onChange={(v) => setTipus(isTipusKulcs(v) ? v : '')} opciok={TIPUS_OPCIOK} placeholder="Válassz típust" errors={errors} required className="w-full" />`, a prioritásnál ugyanígy (a kommentje marad).
- `app/(app)/felhasznalok/components/UjFelhasznaloDialog.tsx`, `SzerkesztesDialog.tsx`: a `Label id="szerepkor-label"` + `SzerepkorSelect` + `MezoHiba` blokk helyett `<CimkesSelect id="szerepkor" name="szerepkor" cimke="Szerepkör" value={szerepkor} onChange={(v) => setSzerepkor(szerepkorbol(v))} opciok={SZEREPKOR_OPCIOK} placeholder="Válassz szerepkört" errors={errors} className="w-full" />` – a `SzerkesztesDialog`-ban a „Adminra váltva…” megjegyzés a `children`. A `SZEREPKOR_OPCIOK` a `lib/felhasznalo-validacio.ts`-ben (a `SZEREPKOR_CIMKE` után): `export const SZEREPKOR_OPCIOK = SZEREPKOROK.map((k) => ({ ertek: k, cimke: SZEREPKOR_CIMKE[k] }));`. A `SzerepkorSelect.tsx` törlése (`git rm`).

- [ ] **Step 5: Nyitásonkénti kulcs – `components/form/useNyitas.ts`**

```ts
'use client';

import { useCallback, useState } from 'react';

/**
 * Dialógus nyitás-állapota nyitásonként új kulccsal: a hívó `key={kulcs}`-csal mountolja a dialógust, így a
 * benne lévő űrlap (mezők, hibák) minden nyitáskor tiszta állapotból indul. `kulcs === 0`: még nem nyílt
 * meg – a hívó addig ne is mountolja (soronként egy dialógus-állapot és useActionState spórolható meg).
 */
export function useNyitas() {
  const [open, setOpen] = useState(false);
  const [kulcs, setKulcs] = useState(0);
  const nyit = useCallback(() => {
    setKulcs((n) => n + 1);
    setOpen(true);
  }, []);
  return { open, setOpen, kulcs, nyit };
}
```

- `UjFelhasznaloDialog`, `UjTicketDialog`: `const { open, setOpen, kulcs, nyit } = useNyitas();`, a gomb `onClick={nyit}`, a modal `{kulcs > 0 && <…Modal key={kulcs} open={open} onOpenChange={setOpen} … />}` (a „Minden nyitás új key” komment helyett a hook doc-ja mondja).
- `IntezkedesSzerkeszto`: ugyanígy (a `nyitas > 0 &&` feltétel már ma is megvan).
- `FelhasznaloMuveletek`: két példány (`const szerk = useNyitas(); const jelszo = useNyitas();`), a menüpontok `onClick={szerk.nyit}`/`onClick={jelszo.nyit}`, a dialógusok `{szerk.kulcs > 0 && <SzerkesztesDialog key={szerk.kulcs} … open={szerk.open} onOpenChange={szerk.setOpen} />}` és ugyanígy a `JelszoDialog`; a közös `nyitas` és a `nyit(setter)` törlése. A `MuveletState` importja a `components/form/useMuveletForm`-ból (nem az actions re-exportjából).

- [ ] **Step 6: Típus-takarítás**

- `components/form/useMuveletForm.ts`: a `FormAction` után `/** Paraméter nélküli (bind-olt) server action, pl. törlés vagy státuszváltás. */ export type MuveletAction = () => Promise<MuveletState>;`. A `() => Promise<MuveletState>` alak helyett ez: `RiportReszlet.tsx:24`, `RiportTorles.tsx:19`, `TicketAdatlap.tsx:39-40`, `TicketStatuszGombok.tsx:19`.
- A `RiportFormState` (`app/(app)/jelentesek/actions.ts`, `app/(app)/uj-jelentes/actions.ts`) és a `TicketFormState` (`app/(app)/kommunikacio/actions.ts`) alias törlése, helyettük `MuveletState`. Előbb: `grep -rn "RiportFormState\|TicketFormState" app components` – a hívók is.
- `app/(app)/felhasznalok/actions.ts`: az `export type { MuveletState };` sor törlése (az egyetlen importáló, a `FelhasznaloMuveletek`, az 5. lépésben átállt).
- `SearchParams` egy helyen: a típus `lib/riport-szuro.ts`-ből → `lib/routes.ts` (`export type SearchParams = Record<string, string | string[] | undefined>;`), a `riport-szuro.ts` onnan importálja és továbbra is a saját aláírásában használja; `app/(app)/kommunikacio/page.tsx` saját deklarációja helyett import; a `grep -rn "string | string\[\] | undefined" app` többi page-típusa (pl. `app/login/page.tsx`, `app/(app)/jelentesek/page.tsx`) is ezt importálja.

- [ ] **Step 7: Országprofil-blokkok – `mezo(k)`, közös mezősor, kimerítő szerkesztő-tábla**

`app/(app)/orszagprofil/components/BlokkForm.tsx` `useBlokkAllapot`:

```ts
/**
 * A blokk vezérelt állapota egy objektumban, mezőnkénti setter-gyár (`set('mezo')`) és prop-építő
 * (`mezo('mezo')`: `id` = `<blokk>.<mezo>`, `name` = a mezőnév, a vezérelt érték és a setter – a címkéket a
 * hívó szórja hozzá a `MEZO_CIMKEK`-ből). A hívó a már űrlap-alakra hozott objektumot adja (számok
 * `szamStr`-rel, listák '\n'-nel összefűzve).
 */
export function useBlokkAllapot<T extends object>(blokk: BlokkKulcs, initial: T) {
  const [e, setE] = useState(initial);
  const set = <K extends keyof T>(k: K) => (v: T[K]) => setE((p) => ({ ...p, [k]: v }));
  const mezo = <K extends keyof T & string>(k: K) => ({ id: mezoId(blokk, k), name: k, value: e[k], onChange: set(k) });
  return { e, set, mezo };
}
```

A 9 `mezok/*Mezok.tsx`: `const [e, set] = useBlokkAllapot(initial…)` → `const { mezo } = useBlokkAllapot(B, initial…)` (ahol `e`/`set` is kell – `RendezvenyekMezok` –, azt is destrukturáld); minden mező `id={mezoId(B, 'x')} name="x" {...C.x} value={e.x} onChange={set('x')}` → `{...mezo('x')} {...C.x}`; az `egyeb={{ id: mezoId(B, 'y'), name: 'y', ...C.y, value: e.y, onChange: set('y'), max: ROVID_MAX }}` → `egyeb={{ ...mezo('y'), ...C.y, max: ROVID_MAX }}`. A fölöslegessé vált `mezoId` importok kikerülnek.

`lib/orszagprofil-szotar.ts`, a `MEZO_CIMKEK` után:

```ts
/**
 * A csak többsoros szövegmezőkből álló blokkok mezői a megjelenítés sorrendjében: az űrlap (`*Mezok.tsx`)
 * és az olvasó nézet (`BlokkNezet`) is ebből rajzol. A 4. blokk sorrendje eltér a tárolt JSON
 * kulcssorrendjétől (a típus, a normalizáló és a validátor kulcssorrendje szándékosan a régi).
 */
export const SZOVEGES_MEZOK = {
  intezmenyek: ['iranyitoSzervek', 'egyetemek', 'kutatokozpontok', 'infrastrukturak'],
  programok: ['finanszirozasiEszkozok', 'palyazatok', 'tamogatasiProgramok', 'nemzetkoziReszvetel'],
  nemzetkoziKapcsolatok: ['partnerorszagok', 'euMultilateralis'],
  magyarErtekeles: ['osszegzes', 'egyuttmukodesiLehetosegek', 'joGyakorlatok', 'diplomaciaiPrioritasok'],
} as const satisfies { [K in BlokkKulcs]?: readonly (keyof ProfilBlokkok[K])[] };

type SzovegesBlokk = keyof typeof SZOVEGES_MEZOK;
// Fordítási őr: minden lista a blokk összes mezőjét tartalmazza (egy kimaradt mező az űrlapról és a nézetből is eltűnne).
const SZOVEGES_TELJES: { [K in SzovegesBlokk]: [Exclude<keyof ProfilBlokkok[K], (typeof SZOVEGES_MEZOK)[K][number]>] extends [never] ? true : never } = {
  intezmenyek: true, programok: true, nemzetkoziKapcsolatok: true, magyarErtekeles: true,
};
void SZOVEGES_TELJES;
```

A négy blokk űrlapja (`IntezmenyekMezok`, `ProgramokMezok`, `NemzetkoziKapcsolatokMezok`, `MagyarErtekelesMezok`): `{(errors) => SZOVEGES_MEZOK[B].map((k) => <SzovegMezo key={k} {...mezo(k)} {...C[k]} max={SZOVEG_MAX} errors={errors} />)}`. A `BlokkNezet` négy `(['…'] as const).map(...)` listája → `SZOVEGES_MEZOK.<blokk>.map(...)` (a `magyarKapcsolatok` listája marad – ott a `egyezmeny` `RovidMezo`).

`app/(app)/orszagprofil/[kod]/szerkesztes/page.tsx`: a 9 kézi sor helyett modulszintű, kimerítő tábla és iteráció (a `BLOKK_KULCSOK` sorrendje azonos a mai kézi sorrenddel – ellenőrizd):

```tsx
/** Blokkonként a szerkesztő mező-komponense; a kimerítő kulcs-térkép miatt egy kihagyott blokk fordítási hiba. */
const MEZOK: { [K in BlokkKulcs]: ComponentType<BlokkMezokProps<ProfilBlokkok[K]>> } = {
  alapadatok: AlapadatokMezok,
  kfiRendszer: KfiRendszerMezok,
  intezmenyek: IntezmenyekMezok,
  vallalati: VallalatiMezok,
  programok: ProgramokMezok,
  rendezvenyek: RendezvenyekMezok,
  nemzetkoziKapcsolatok: NemzetkoziKapcsolatokMezok,
  magyarKapcsolatok: MagyarKapcsolatokMezok,
  magyarErtekeles: MagyarErtekelesMezok,
};
```

a komponensben:

```tsx
  // Korrelált generikus: a K köti össze a kulcsot, a komponenst és a kezdőértéket (a map-ben unió lenne).
  const blokk = <K extends BlokkKulcs>(k: K) => {
    const Mezok: ComponentType<BlokkMezokProps<ProfilBlokkok[K]>> = MEZOK[k];
    return <Mezok key={k} {...kozos} initial={b[k] ?? uresBlokk(k)} mentve={m(k)} />;
  };
```

és a `<Fragment key={ev}>` (a kommentjével) tartalma `{BLOKK_KULCSOK.map(blokk)}`. Importok: `type ComponentType` a `react`-ből, `BLOKK_KULCSOK`, `type BlokkMezokProps` a `../../components/BlokkForm`-ból.

- [ ] **Step 8: Rendezvénysorok stabil kulccsal – `RendezvenySorok.tsx`**

A fájl új tartalma:

```tsx
'use client';

import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Mezo, RovidMezo } from '../../../../components/form/Mezo';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { Button } from '../../../../components/ui/button';
import type { MezoHibak } from '../../../../lib/urlap';
import {
  REND_MEZO_CIMKEK, RENDEZVENY_MAX, RENDEZVENY_TIPUSOK, ROVID_MAX, rendezvenyTipus, type Rendezveny,
} from '../../../../lib/orszagprofil-szotar';

/** Egy rendezvénysor az űrlapon; az `id` stabil kliens-kulcs (a sorok törölhetők, a pozíció változik), a mentésbe nem kerül. */
export interface RendezvenySor extends Rendezveny {
  id: number;
}

const R = REND_MEZO_CIMKEK;

/** Az űrlap kezdősorai a mentett listából. */
export function rendezvenySorok(lista: readonly Rendezveny[]): RendezvenySor[] {
  return lista.map((r, i) => ({ ...r, id: i + 1 }));
}

/**
 * Hozzáadható/törölhető rendezvény-sorok; mezőnevek `rendezveny.<i>.<mezo>`, id-k
 * `rendezvenyek.rendezveny.<i>.<mezo>` (az `i` a sor aktuális pozíciója – a validátor indexenként olvas).
 * A régiós országsorok mintájára (OrszagMezok): hozzáadás után a fókusz az új sor nevére, törlés után a
 * hozzáadás-gombra kerül, és a törlés a következő beküldésig elrejti a pozícióhoz kötött sorhibákat (más
 * sorra mutatnának). A mezők kérdőjeles magyarázata a `REND_MEZO_CIMKEK`-ből jön.
 */
export function RendezvenySorok({
  value, onChange, errors,
}: { value: RendezvenySor[]; onChange: (v: RendezvenySor[]) => void; errors: MezoHibak }) {
  const hozzaadGomb = useRef<HTMLButtonElement>(null);
  // Két beküldés között az `errors` ugyanaz az objektum: amíg az, a törlés előtti hibák rejtve maradnak.
  const [elavultHibak, setElavultHibak] = useState<MezoHibak | null>(null);
  const hibak = elavultHibak === errors ? {} : errors;
  const set = (id: number, patch: Partial<Rendezveny>) => onChange(value.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const mezoId = (i: number, m: keyof Rendezveny) => `rendezvenyek.rendezveny.${i}.${m}`;
  const ujSor = () => {
    flushSync(() => {
      onChange([
        ...value,
        { id: Math.max(0, ...value.map((r) => r.id)) + 1, nev: '', tipus: RENDEZVENY_TIPUSOK[0].kulcs, idopont: '', megjegyzes: '' },
      ]);
    });
    document.getElementById(mezoId(value.length, 'nev'))?.focus();
  };
  const torolSor = (id: number) => {
    flushSync(() => {
      setElavultHibak(errors);
      onChange(value.filter((r) => r.id !== id));
    });
    hozzaadGomb.current?.focus();
  };
  return (
    <div className="flex flex-col gap-4">
      {value.map((r, i) => (
        <fieldset key={r.id} className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-2">
          <legend className="px-1 text-xs text-muted-foreground">{i + 1}. rendezvény</legend>
          <RovidMezo id={mezoId(i, 'nev')} name={`rendezveny.${i}.nev`} {...R.nev} value={r.nev}
            onChange={(v) => set(r.id, { nev: v })} max={ROVID_MAX} errors={hibak} />
          <Mezo id={mezoId(i, 'tipus')} {...R.tipus} errors={hibak}>
            <NativeSelect id={mezoId(i, 'tipus')} name={`rendezveny.${i}.tipus`} value={r.tipus}
              onChange={(e) => set(r.id, { tipus: rendezvenyTipus(e.target.value) })}>
              {RENDEZVENY_TIPUSOK.map((t) => <option key={t.kulcs} value={t.kulcs}>{t.cimke}</option>)}
            </NativeSelect>
          </Mezo>
          <RovidMezo id={mezoId(i, 'idopont')} name={`rendezveny.${i}.idopont`} {...R.idopont} value={r.idopont}
            onChange={(v) => set(r.id, { idopont: v })} max={ROVID_MAX} errors={hibak} />
          <RovidMezo id={mezoId(i, 'megjegyzes')} name={`rendezveny.${i}.megjegyzes`} {...R.megjegyzes} value={r.megjegyzes}
            onChange={(v) => set(r.id, { megjegyzes: v })} max={ROVID_MAX} errors={hibak} />
          <div className="sm:col-span-2">
            <Button type="button" variant="outline" size="sm" aria-label={`${i + 1}. rendezvény törlése`} onClick={() => torolSor(r.id)}>
              Sor törlése
            </Button>
          </div>
        </fieldset>
      ))}
      <div>
        <Button ref={hozzaadGomb} type="button" variant="outline" size="sm" disabled={value.length >= RENDEZVENY_MAX} onClick={ujSor}>
          Rendezvény hozzáadása
        </Button>
        {value.length >= RENDEZVENY_MAX && <span className="ml-2 text-xs text-muted-foreground">Legfeljebb {RENDEZVENY_MAX} rendezvény.</span>}
      </div>
    </div>
  );
}
```

Ha a shadcn `Button` nem adja tovább a `ref`-et (React 19-ben a `ref` sima prop, a Base UI Button továbbítja – az `OrszagMezok` hozzáadás-gombja ugyanígy használja), a fordító szól. `RendezvenyekMezok.tsx`: `useBlokkAllapot(B, { ...initial, lista: rendezvenySorok(initial.lista) })`. A `RovidMezo` az `autoComplete="off"`-ot maga adja; a `Mezo` a tipus-sorhoz `MezoHiba`-t is renderel (a tipusra nincs hiba, üresen marad).

- [ ] **Step 9: Teljesítmény-apróságok**

- `OrszagMezok.tsx`: az `OrszagOpciok` komponens helyett modulszintű elem (a 174 opció egyszer épül, a React a változatlan elemet nem rendereli újra):

```tsx
// Modulszintű elem: a 174 opció egyszer épül fel; a változatlan elemet a React nem rendereli újra.
const ORSZAG_OPCIOK = (
  <>
    <option value="">Válassz országot…</option>
    {ORSZAGOK.map((o) => (
      <option key={o.kod} value={o.kod}>
        {o.nev}
      </option>
    ))}
  </>
);
```

  és a `<OrszagOpciok />` hívások → `{ORSZAG_OPCIOK}`.
- `app/(app)/kommunikacio/components/UzenetLista.tsx`:

```tsx
'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * A beszélgetés görgethető üzenetlistája. Új üzenetnél (és ticketváltásnál) a lista aljára görget – csak a
 * listán belül, az oldal görgetési pozícióját nem bántja. Billentyűzettel is fókuszálható, hogy a nyilakkal
 * olvasható legyen. Csak ez a rész kliens-komponens; az üzeneteket a szerver rendereli.
 */
export function UzenetLista({ ticketId, darab, children }: { ticketId: string; darab: number; children: ReactNode }) {
  const lista = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = lista.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [ticketId, darab]);
  return (
    <ol
      ref={lista}
      tabIndex={0}
      aria-label="Üzenetek"
      className="flex max-h-[46vh] flex-col gap-3 overflow-auto p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      {children}
    </ol>
  );
}
```

  `TicketBeszelgetes.tsx`: a `'use client'` és a `useEffect`/`useRef` import, a `lista` ref és az effekt törlése; az `<ol …>` helyett `<UzenetLista ticketId={ticket.id} darab={ticket.uzenetek.length}>…</UzenetLista>` (a görgethető régió kommentje átkerül a `UzenetLista` doc-jába). Előbb: `grep -rn "TicketBeszelgetes" app` – csak a `kommunikacio/page.tsx` (Server Component) importálja.

- [ ] **Step 10: Apróságok**

- `app/(app)/felhasznalok/page.tsx`: `import type { Metadata } from 'next';` és `export const metadata: Metadata = { title: 'Felhasználók' };` (mint a többi page).
- `lib/routes.ts`: `/** A csatolmány letöltési útvonala (app/api/jelentes/csatolmany/[id]). */ export function csatolmanyUrl(id: string): string { return `/api/jelentes/csatolmany/${id}`; }` – a `CsatolmanyMezo` és a `RiportReszlet` ezt használja (`grep -rn "/api/jelentes/csatolmany" components app`).
- `components/orszagprofil/SzinesBadge.tsx`:

```tsx
import type { ReactNode } from 'react';
import { Badge } from '../ui/badge';

/**
 * Szótár-színű jelvény: a szöveg a szín, a keret és a háttér annak áttetsző változata. Inline style
 * szándékosan: a szín a térképpel közös szótárból jön, nem Tailwind-tokenből. Az app ma csak világos
 * témájú; ha lesz sötét mód, ezekhez a színekhez `dark:` felülírás kell.
 */
export function SzinesBadge({ szin, children }: { szin: string; children: ReactNode }) {
  return (
    <Badge variant="outline" style={{ color: szin, borderColor: `${szin}55`, background: `${szin}14` }}>
      {children}
    </Badge>
  );
}
```

  `AgazatBadge`: `return <SzinesBadge szin={AGAZAT_SZINEK[agazat]}>{agazat}</SzinesBadge>;`; `AllapotBadge`: `return <SzinesBadge szin={ALLAPOT_SZINEK[allapot]}>{ALLAPOT_CIMKE[allapot]}{ev ? ` · ${ev}` : ''}</SzinesBadge>;` (a kommentjeik a `SzinesBadge`-be kerültek).
- `app/(app)/kommunikacio/components/TicketJelzesek.tsx:5` kommentje fordítva állítja a riport-jelvényről, hogy nem a szótárból színez (a `KategoriaBadge` a `kategoriaByKulcs(kulcs).szin`-t használja): „// A színek itt, nem a szótárban: a ticket-szótár framework-mentes, Tailwind-osztályt nem tárol (a riport-kategóriák színe ezzel szemben a szótárban van, hex-ként).” (az 1. task review-ja).
- **Elvetve (a 4. task tanulsága):** az egyargumentumú `cn(buttonVariants(…))` **nem** fölösleges – a tailwind-merge oldja fel az alap `border-transparent` és a variáns (pl. outline `border-border`) ütközését; a build CSS-ében a `.border-transparent` a későbbi, `cn` nélkül az outline keret eltűnik. Ezért a `cn` marad mindenhol. Helyette: `app/(app)/orszagprofil/components/NemSzerkeszthetoEv.tsx:37` „profil megtekintése” linkje `cn` nélkül kapja a `buttonVariants({ variant: 'outline' })`-t (valószínűleg ma is keret nélküli) → `className={cn(buttonVariants({ variant: 'outline' }))}` (import `cn` a `lib/utils`-ból); `grep -rn "buttonVariants(" app components | grep -v "cn("` – a maradék találat csak `cn(...)`-be ágyazott feltételes ág lehet (pl. `IntezkedesSzerkeszto`). A CLAUDE.md „Link gombként” pontjába: „a `buttonVariants()` kimenete mindig `cn()`-nel kerüljön a `className`-be (a tailwind-merge oldja fel az alap `border-transparent` és a variáns keretszín ütközését; nélküle az outline keret eltűnik)”.

- [ ] **Step 11: Ellenőrzés**

Run: `npx tsc --noEmit` – exit 0. Run: `grep -rn "SzerepkorSelect\|function Valaszto\|function SzuroSelect\|RiportFormState\|TicketFormState" app components` – Expected: nincs találat.

- [ ] **Step 12: CLAUDE.md**

- Riportok – Form-minta mondata (`components/form/`): kiegészül a `Mezo` (`opcionalis`), `CimkesSelect` (címkés Base UI Select, `aria-labelledby` címke + trigger, `name` → rejtett input), `useNyitas` (nyitásonkénti `key`, első nyitásig nincs mountolva) elemekkel; „a jelentés mezőfeliratai a `RIPORT_MEZO_CIMKEK`-ben (`lib/riport-szotar.ts`), az űrlap és a részletoldal közös forrása”.
- Auth – a felhasználó-dialógusok blokkjai közül a `SzerepkorSelect` törlése (a „`app/(app)/felhasznalok/components/` alatt (`ElerhetosegMezok`, `OrszagMezok`, `VezetoJelolo`, `Blokk`)” felsorolás marad).
- Országprofil: „`useBlokkAllapot` vezérelt állapot + `set('mezo')` setter-gyár” → „`useBlokkAllapot(blokk, initial)` vezérelt állapot + `set('mezo')` setter-gyár + `mezo('mezo')` prop-építő (`id`, `name`, érték, setter)”; „A szerkesztő oldal blokk-listája (`[kod]/szerkesztes/page.tsx` + `mezok/<Blokk>Mezok.tsx`) viszont kézi: a kimaradt blokk fordítási hiba nélkül szerkeszthetetlen marad.” → „A szerkesztő oldal blokk-táblája (`[kod]/szerkesztes/page.tsx` `MEZOK`) is kimerítő: a kimaradt blokk fordítási hiba.”; a 4. blokk sorrendjéről szóló mondat: „a megjelenítést az űrlap és az olvasó nézet közös `SZOVEGES_MEZOK` listája adja (`lib/orszagprofil-szotar.ts`, fordítási őrrel a teljességre)”; a `RendezvenySorok`-ra: „stabil sor-azonosító (`RendezvenySor.id`, a mentésbe nem kerül), fókuszkezelés és a törlés utáni sorhiba-elrejtés az `OrszagMezok` mintájára”.
- Kommunikáció: „a görgetést a `UzenetLista` kliens-burok végzi, a `TicketBeszelgetes` Server Component”.

- [ ] **Step 13: Commit**

```bash
git add -u && git add components/form/CimkesSelect.tsx components/form/useNyitas.ts components/orszagprofil/SzinesBadge.tsx "app/(app)/kommunikacio/components/UzenetLista.tsx"
git commit -m "refactor(urlapok): Mezo a kézi mezőblokkok helyett, közös CimkesSelect és useNyitas, jelentés-feliratok egy helyen, mezo() prop-építő és kimerítő szerkesztő-tábla, stabil rendezvénysorok

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Demóadat-maradék és dokumentáció

**Files:**
- Modify: `lib/data.ts`, `lib/score.ts`, `app/(app)/monitoring/page.tsx`, `CLAUDE.md`, `docs/superpowers/specs/2026-10-15-kod-rendezes-design.md`.

- [ ] **Step 1: `lib/data.ts`**

- `ME_ID` törlése (`grep -rn "ME_ID" app components lib` – nincs használója).
- A `Post` interfész → `export interface Post { id: number; attase: string; orszag: string; base: number }`; az `Intezmeny`, `Palyazat`, `Esemeny`, `Politika` interfész törlése; a 14 `POSTS` elemből a `geo, varos, regio, lonlat, utolso, ciklus, fokusz, megallapitas, kf, intezmenyek, palyazatok, esemenyek, politika, tanulsag` mezők törlése (egy elem egy sor: `{ id: 1, attase: 'Kovács Dániel', orszag: 'Amerikai Egyesült Államok', base: 4.5 },`). Előtte: `grep -rn "\.\(geo\|varos\|regio\|lonlat\|utolso\|ciklus\|fokusz\|megallapitas\|kf\|intezmenyek\|palyazatok\|esemenyek\|politika\|tanulsag\)\b" "app/(app)/monitoring" lib/score.ts` – nincs találat.
- A fejkomment: „// Demóadatok a TéT Platform doksiból (14 poszt, 3 kategória, 14 szempont) – csak a /monitoring használja.”

- [ ] **Step 2: `lib/score.ts`**

- `avg`: `for (let i = 1; i <= CRITERIA.length; i++)` és `return s / CRITERIA.length;`.
- `PILL_COLORS`: csak a `Magas`, `Közepes`, `Alacsony` kulcs marad (`grep -rn "pill(" app` – csak a monitoring gyakoriság-pillje).

- [ ] **Step 3: `app/(app)/monitoring/page.tsx`**

- A `card-sub` „14 szempont, 3 kategória” → `{CRITERIA.length} szempont, {CATS.length} kategória`; a második kártya „14 szempont részletes értékelése” → `{CRITERIA.length} szempont részletes értékelése`.
- A három fix fejléc (`1. Együttműködés`, `2. XPAND`, `3. Információ`) → `{CATS.map((c) => <th key={c.n} className="r">{c.n}. {c.rovid}</th>)}` (a `Cat.rovid` ezzel használatba kerül; a szöveg azonos).

- [ ] **Step 4: CLAUDE.md – záró átnézés**

`grep -n "AppShell\|NAV\|TITLES\|components/riport/\|SzerepkorSelect\|listOrszagok\|listSzerzok\|ini(\|VS_MAX\|safeNext\|localeCompare" CLAUDE.md` – minden találat a végleges állapotot írja (útvonalak, nevek). A „Projektállapot” bekezdésben (a fájl eleje) nem kell változás.

Az „Országprofil” bekezdés útvonal-stílusa egységes legyen: a route-mappán belüli komponensek mindenhol `orszagprofil/components/<Név>` formában (mint a meglévő `BlokkForm`, `NemSzerkeszthetoEv`), nem egyszer teljes `app/(app)/…` útvonallal, egyszer röviden (az 1. task review-ja).

A `README.md` projektstruktúra-szakasza (kb. a 80–95. sor; az 1. task spec-review-ja jelezte) ugyanígy: a `components/orszagprofil/` már csak a jelvényeket és a `SzerkesztesGomb`-ot tartalmazza (a `BlokkNezet` és az `AttaseLista` az `app/(app)/orszagprofil/components/`-ben), a `components/riport/` a közös űrlap-komponenseket (a lista és a részlet az `app/(app)/jelentesek/components/`-ben), a `components/form/` a `KuldGomb`-ot, `CimkesSelect`-et, `useNyitas`-t is, a shell a `components/app-shell/`-ben van, az útvonaltábla a `lib/navigacio.ts`-ben – minden más, a refaktor óta hamis útvonalat is javíts (`grep -n "AppShell\|components/\|lib/" README.md`).

- [ ] **Step 5: A spec „Megvalósítási eltérések” szakasza**

A spec végére új `## Megvalósítási eltérések` szakasz: amit az implementáció közben a review-k (vagy a fordító) a tervhez képest módosítottak – a tervezéskor pontosított döntések már a spec törzsében vannak. Az „Állapot” sor: „megvalósítva” + dátum.

- [ ] **Step 6: Ellenőrzés és commit**

Run: `npx tsc --noEmit` – exit 0.

```bash
git add -u
git commit -m "refactor(demo): a monitoring demóadatának halott mezői ki, a mágikus számok a szótárból; CLAUDE.md és spec a végleges állapothoz

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Build, mérés, böngészős QA (a vezérlő végzi)

- [ ] **Step 1: Build** – `rm -f .next/dev/types/validator.ts` (ha a futó dev szerver elavult típusfájlja zavar), `npm run build` – Expected: hibátlan. (A `db:init` a meglévő `data/tet.db`-hez nem nyúl; a `drizzle-kit migrate` nincs új migráció.)

- [ ] **Step 2: Bundle** – `grep -l "lib/data\|lib/score" .next/server/app/**/page_client-reference-manifest.js` (vagy a build kimenetének chunk-listája): a `lib/data`/`lib/score` modul csak a `/monitoring` manifestjében szerepel.

- [ ] **Step 3: Payload** – a Task 0 Step 2 mérése újra; a különbség feljegyzése (elvárt: kb. 7,5 KB-tal kevesebb).

- [ ] **Step 4: Shell-egyezés** – a Task 0 Step 3 scriptje „utána” változattal, `diff` a két JSON-on (elvárt: a monogram szövegén kívül azonos; a „dr.” nevű attasénál a monogram „GL”-szerű), és a képernyőképek szemrevételezése egymás mellett.

- [ ] **Step 5: Funkcionális QA (gstack, a futó dev szerveren)** – térkép: hover-tooltip pinen és poligonon, zoom (+/−/görgetés), régió-gombok, mutatóváltás, iparág-szűrő, összehasonlítás felvétele/kivétele (4-es korlát szövege), „Saját országprofil” (vezető attasé), kivonat „Szerkesztés” gombja múltbeli évnél „Szerkesztés (2026)”; profil-szerkesztő: egy blokk mentése, hibás szám hibaüzenete és fókusza, rendezvénysor hozzáadása (fókusz az új sor nevén) és törlése (fókusz a hozzáadás-gombon); új jelentés hibás (üres) és helyes beküldése, „(opcionális)” felirat; jelentés-részlet csatolmány-letöltése; Jelentések szűrők (kategória, kulcsszó, admin ország/attasé); új ticket dialógus (típus/prioritás select, hibás beküldés), ticket-válasz és a lista görgetése; felhasználók: dialógusok megnyitása, hibás mentés, szerepkör-váltás megjegyzése, lapcím; kijelentkezés és `/login?next=/jelentesek` visszairányítás, valamint egy 600 karakteres `?next=` → `/terkep`. A QA végén kijelentkezés; a `data/tet.db`-t nem commitoljuk (a gstack-belépés session-sort ír).

- [ ] **Step 6: Záró review** – egy teljes ág-review (spec-megfelelés + minőség) a `main..kod-rendezes` tartományra; a talált hibák javítása; utána a terv kódblokkjainak szinkronizálása a végleges fájlokhoz külön docs-commitban; végül `superpowers:finishing-a-development-branch` (a felhasználó eddig a lokális fast-forward merge-et választotta).
