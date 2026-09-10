# Országprofil (évenkénti beadás, DB-alapú térkép) – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Az Országprofil képernyő a demó `POSTS` helyett DB-ből dolgozik: az attasé évente egyszer, blokkonként kitölti a saját országa profilját (alapadatok + 7 KFI-blokk, listás mezőkkel), a térkép a kiemelt iparág vagy a profil állapota szerint színez, a panel kivonatot mutat, a teljes profil külön oldalon olvasható.

**Architecture:** `lib/orszagok.ts` országszótár (ISO-kód, magyar név, world-atlas név, koordináta); a `user.orszag` és a `riport.orszag` ISO-kódot tárol. Egy `orszagprofil` tábla `(orszag_kod, ev)` egyedi kulccsal és 8 típusos JSON oszloppal (blokkonként egy), blokkonkénti upsert. Szótárak és típusok `lib/orszagprofil-szotar.ts`, validáció `lib/orszagprofil-validacio.ts`, jog `lib/orszagprofil-jog.ts`, lekérdezés `db/queries/orszagprofil.ts`, egy server action `app/(app)/orszagprofil/actions.ts`. Route-ok: `/terkep` (server page + kliens `TerkepNezet`), `/orszagprofil/[kod]` (teljes nézet), `/orszagprofil/[kod]/szerkesztes` (8 önálló blokk-form). A `WorldMap` propként kapja az adatot és a színtáblákat.

**Tech Stack:** Next.js 16 (App Router, Server Actions, `useActionState`), React 19, TypeScript 7, drizzle-orm + better-sqlite3, shadcn/ui v4 base-nova (`Card`, `Badge`, `Button`, `Input`, `Textarea`, `Label`, `Select`, `Combobox`), Tailwind v4, d3-geo webkomponens (`public/tet-world-map.js`).

**Spec:** `docs/superpowers/specs/2026-09-10-orszagprofil-design.md`.

**Ellenőrzés:** Nincs tesztkeretrendszer. Minden task végén `npx tsc --noEmit`; tiszta `lib/` modulokat eldobható tsx scripttel (`scripts/_x.ts`, utána törlendő) ellenőrzünk; `db/queries/*` és `lib/session.ts` `server-only`, az őket importáló script: `NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_x.ts`. UI: gstack headless böngésző (`~/.claude/skills/gstack/browse/dist/browse goto/fill/click/text/js/snapshot -i/console --errors`) a felhasználó **futó dev szerverén** (3000-es port, **nem szabad leállítani/újraindítani**, második dev szerver nem indítható ugyanabban a mappában). Teszt attasék: `teszt.attase@niu.hu` / `Teszt1234!` (Dél-Korea → `KR`), `masodik.attase@niu.hu` / `Masodik1234!` (Japán → `JP`); admin `admin@niu.hu`, a jelszó a `.env.local`-ban (ne írd ki). Commit üzenetek végén: `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. A `.env.example` a felhasználó saját, nem commitolandó sorát tartalmazza: **soha ne add hozzá** (`git add` mindig konkrét fájlokkal). Ha a `npm run build` nem létező `app/...` modulra panaszkodik: `rm .next/dev/types/validator.ts`, újra build.

**Fontos API tények (ellenőrizve a meglévő kódban):**
- `lib/urlap.ts`: `mezo(fd, key)` tisztított, trimmelt string; `tisztitSzoveg(v)`; `MezoHibak = Record<string, string>`.
- `components/form/useMuveletForm.ts`: `useMuveletForm(action, siker?, onKesz?)` → `[state, formAction, pending]`; `MuveletState = { ok?: boolean; errors?: MezoHibak }`; `FormAction = (prev, fd) => Promise<MuveletState>`; hibánál a DOM-sorrendben első hibás mezőre fókuszál: a mező `id`-ja = a hibakulcs.
- `components/form/MezoHiba.tsx`: `MezoHiba({ mezo, errors, alert? })`, `hibaAttr(errors, mezo)`.
- `lib/session.ts`: `requireSession()` → `AppSession { userId, name, email, role: 'admin'|'attase', orszag: string|null }`; `requireAdmin()`. Mindig `await`, soha `try/catch`-ben.
- `lib/datum.ts`: `IDOZONA`, `maiNaptariNap()` (`YYYY-MM-DD`), `formatDatum(Date)`, `formatDatumIdo(Date)`.
- `db/index.ts`: `db` (better-sqlite3 + Drizzle, szinkron `.all()/.get()/.run()`); séma `db/schema/index.ts` re-export.
- shadcn `Select` (Base UI): `<Select value items={{...}} onValueChange>`; `<SelectTrigger id aria-labelledby>`; a `name` prop rejtett inputot rendel; üres string érték nem választható (a riport szűrő `MIND = '__mind'` trükkje).
- shadcn `Combobox` chips-minta: `components/riport/KulcsszoValaszto.tsx` (multiple, `ComboboxChips`, `ComboboxChipsInput` – az `id` a beviteli mezőn).
- Link gombként: `<Link className={cn(buttonVariants({ variant }), …)}>`, **nem** `Button render={<Link/>}`.
- A `WorldMap` webkomponens (`public/tet-world-map.js`) attribútumként kapja a JSON-t; d3/topojson CDN-ről, internet kell.

---

## Fájlstruktúra

| Fájl | Művelet | Felelősség |
| --- | --- | --- |
| `lib/orszagok.ts` | létrehoz | Országszótár (168 ország), `orszagByKod`, `orszagNev`, `ORSZAG_KOD_RE` |
| `lib/felhasznalo-validacio.ts` | módosít | `validOrszag`: ISO-kód a szótárból |
| `app/(app)/felhasznalok/components/AttaseMezok.tsx` | módosít | ország `<select>` a szótárból |
| `app/(app)/felhasznalok/components/FelhasznaloTabla.tsx`, `components/AppShell.tsx`, `components/riport/RiportTabla.tsx`, `components/riport/RiportReszlet.tsx`, `components/riport/RiportSzurok.tsx` | módosít | `orszagNev()` megjelenítés |
| `scripts/orszag-kod-migracio.ts` | létrehoz | `user.orszag`, `riport.orszag` név → kód, idempotens |
| `lib/orszagprofil-szotar.ts` | létrehoz | listák, `BLOKKOK`, blokk-típusok, `uresBlokk`, `normalizalBlokk`, `MEZO_CIMKEK`, színek |
| `lib/datum.ts` | módosít | `aktualisEv()` |
| `lib/orszagprofil-jog.ts` | létrehoz | `canEditProfil` |
| `db/schema/orszagprofil.ts`, `db/schema/index.ts`, `drizzle/0005_*` | létrehoz/generál | tábla + migráció |
| `db/queries/orszagprofil.ts` | létrehoz | `getProfil`, `listEvek`, `listTerkepAdat`, `upsertBlokk`, `TerkepOrszag` |
| `lib/orszagprofil-validacio.ts` | létrehoz | `validalBlokk` blokkonként |
| `app/(app)/orszagprofil/actions.ts` | létrehoz | `mentBlokkAction` |
| `components/form/CimkeValaszto.tsx`, `EgyebMezo.tsx`, `SzamMezo.tsx`, `Mezo.tsx` | létrehoz | általános form-építőelemek |
| `app/(app)/orszagprofil/components/BlokkForm.tsx`, `RendezvenySorok.tsx`, `mezok/*.tsx` (8 fájl), `EvValaszto.tsx` | létrehoz | szerkesztő kártyák |
| `components/orszagprofil/BlokkNezet.tsx`, `IparagBadge.tsx`, `AllapotBadge.tsx` | létrehoz | olvasó nézet elemei |
| `app/(app)/orszagprofil/[kod]/page.tsx`, `[kod]/szerkesztes/page.tsx` | létrehoz | teljes nézet, szerkesztés |
| `components/WorldMap.tsx`, `public/tet-world-map.js` | módosít | DB-adat, iparág/állapot metrika, színtábla JSON-ban |
| `app/(app)/terkep/page.tsx`, `terkep/components/TerkepNezet.tsx`, `ProfilKivonat.tsx`, `TerkepUres.tsx` | módosít/létrehoz | térkép oldal |
| `components/AppShell.tsx` | módosít | `TITLES` `/orszagprofil` |
| `CLAUDE.md`, `README.md` | módosít | dokumentáció |

A `lib/data.ts` `POSTS`/`FIELDS`/`FIELD_COLORS` marad (monitoring, tudástár használja); a `lib/score.ts` `nyitottsag` importja a `WorldMap`-ből kikerül.

---

### Task 1: Országszótár és ISO-kód a useren és a riporton

**Files:**
- Create: `lib/orszagok.ts`
- Modify: `lib/felhasznalo-validacio.ts` (`validOrszag`)
- Modify: `app/(app)/felhasznalok/components/AttaseMezok.tsx` (ország mező)
- Modify: `app/(app)/felhasznalok/components/FelhasznaloTabla.tsx:50`, `components/AppShell.tsx:113-115`, `components/riport/RiportTabla.tsx:71`, `components/riport/RiportReszlet.tsx:35`, `components/riport/RiportSzurok.tsx:173`
- Create: `scripts/orszag-kod-migracio.ts`

- [ ] **Step 1: `lib/orszagok.ts`**

```ts
/**
 * Országszótár: ISO 3166-1 alpha-2 kód, magyar név, world-atlas 110m térképnév (a
 * `countries-110m.json` `properties.name` értéke – ezzel párosít a <tet-world-map>) és a
 * főváros koordinátája (a pin helye). A `user.orszag` és a `riport.orszag` a `kod`-ot
 * tárolja; a felület `orszagNev()`-vel ír. Framework-mentes.
 */
export interface Orszag {
  kod: string;
  nev: string;
  geo: string;
  /** [hosszúság, szélesség] */
  lonlat: [number, number];
}

export const ORSZAG_KOD_RE = /^[A-Z]{2}$/;

/** Magyar név szerint rendezve (a select ebben a sorrendben listáz). */
export const ORSZAGOK: readonly Orszag[] = [
  { kod: 'AF', nev: 'Afganisztán', geo: 'Afghanistan', lonlat: [69.17, 34.53] },
  { kod: 'AL', nev: 'Albánia', geo: 'Albania', lonlat: [19.82, 41.33] },
  { kod: 'DZ', nev: 'Algéria', geo: 'Algeria', lonlat: [3.06, 36.75] },
  { kod: 'US', nev: 'Amerikai Egyesült Államok', geo: 'United States of America', lonlat: [-77.04, 38.9] },
  { kod: 'AO', nev: 'Angola', geo: 'Angola', lonlat: [13.23, -8.84] },
  { kod: 'AR', nev: 'Argentína', geo: 'Argentina', lonlat: [-58.38, -34.6] },
  { kod: 'AT', nev: 'Ausztria', geo: 'Austria', lonlat: [16.37, 48.21] },
  { kod: 'AU', nev: 'Ausztrália', geo: 'Australia', lonlat: [149.13, -35.28] },
  { kod: 'AZ', nev: 'Azerbajdzsán', geo: 'Azerbaijan', lonlat: [49.87, 40.41] },
  { kod: 'BS', nev: 'Bahama-szigetek', geo: 'Bahamas', lonlat: [-77.34, 25.06] },
  { kod: 'BD', nev: 'Banglades', geo: 'Bangladesh', lonlat: [90.41, 23.81] },
  { kod: 'BY', nev: 'Belarusz', geo: 'Belarus', lonlat: [27.57, 53.9] },
  { kod: 'BE', nev: 'Belgium', geo: 'Belgium', lonlat: [4.35, 50.85] },
  { kod: 'BZ', nev: 'Belize', geo: 'Belize', lonlat: [-88.77, 17.25] },
  { kod: 'BJ', nev: 'Benin', geo: 'Benin', lonlat: [2.63, 6.5] },
  { kod: 'BT', nev: 'Bhután', geo: 'Bhutan', lonlat: [89.64, 27.47] },
  { kod: 'GW', nev: 'Bissau-Guinea', geo: 'Guinea-Bissau', lonlat: [-15.6, 11.86] },
  { kod: 'BO', nev: 'Bolívia', geo: 'Bolivia', lonlat: [-68.15, -16.5] },
  { kod: 'BA', nev: 'Bosznia-Hercegovina', geo: 'Bosnia and Herz.', lonlat: [18.41, 43.86] },
  { kod: 'BW', nev: 'Botswana', geo: 'Botswana', lonlat: [25.91, -24.65] },
  { kod: 'BR', nev: 'Brazília', geo: 'Brazil', lonlat: [-47.93, -15.78] },
  { kod: 'BN', nev: 'Brunei', geo: 'Brunei', lonlat: [114.94, 4.94] },
  { kod: 'BG', nev: 'Bulgária', geo: 'Bulgaria', lonlat: [23.32, 42.7] },
  { kod: 'BF', nev: 'Burkina Faso', geo: 'Burkina Faso', lonlat: [-1.52, 12.37] },
  { kod: 'BI', nev: 'Burundi', geo: 'Burundi', lonlat: [29.36, -3.38] },
  { kod: 'CL', nev: 'Chile', geo: 'Chile', lonlat: [-70.65, -33.45] },
  { kod: 'CY', nev: 'Ciprus', geo: 'Cyprus', lonlat: [33.38, 35.17] },
  { kod: 'CR', nev: 'Costa Rica', geo: 'Costa Rica', lonlat: [-84.09, 9.93] },
  { kod: 'CZ', nev: 'Csehország', geo: 'Czechia', lonlat: [14.42, 50.09] },
  { kod: 'TD', nev: 'Csád', geo: 'Chad', lonlat: [15.04, 12.13] },
  { kod: 'DO', nev: 'Dominikai Köztársaság', geo: 'Dominican Rep.', lonlat: [-69.93, 18.49] },
  { kod: 'DJ', nev: 'Dzsibuti', geo: 'Djibouti', lonlat: [43.15, 11.59] },
  { kod: 'DK', nev: 'Dánia', geo: 'Denmark', lonlat: [12.57, 55.68] },
  { kod: 'ZA', nev: 'Dél-afrikai Köztársaság', geo: 'South Africa', lonlat: [28.19, -25.75] },
  { kod: 'SS', nev: 'Dél-Szudán', geo: 'S. Sudan', lonlat: [31.58, 4.85] },
  { kod: 'EC', nev: 'Ecuador', geo: 'Ecuador', lonlat: [-78.47, -0.18] },
  { kod: 'GQ', nev: 'Egyenlítői-Guinea', geo: 'Eq. Guinea', lonlat: [8.78, 3.75] },
  { kod: 'AE', nev: 'Egyesült Arab Emírségek', geo: 'United Arab Emirates', lonlat: [54.37, 24.45] },
  { kod: 'GB', nev: 'Egyesült Királyság', geo: 'United Kingdom', lonlat: [-0.13, 51.51] },
  { kod: 'EG', nev: 'Egyiptom', geo: 'Egypt', lonlat: [31.24, 30.04] },
  { kod: 'CI', nev: 'Elefántcsontpart', geo: "Côte d'Ivoire", lonlat: [-5.28, 6.82] },
  { kod: 'ER', nev: 'Eritrea', geo: 'Eritrea', lonlat: [38.93, 15.32] },
  { kod: 'SZ', nev: 'Eswatini', geo: 'eSwatini', lonlat: [31.13, -26.32] },
  { kod: 'ET', nev: 'Etiópia', geo: 'Ethiopia', lonlat: [38.75, 9.03] },
  { kod: 'FJ', nev: 'Fidzsi', geo: 'Fiji', lonlat: [178.44, -18.14] },
  { kod: 'FI', nev: 'Finnország', geo: 'Finland', lonlat: [24.94, 60.17] },
  { kod: 'FR', nev: 'Franciaország', geo: 'France', lonlat: [2.35, 48.86] },
  { kod: 'PH', nev: 'Fülöp-szigetek', geo: 'Philippines', lonlat: [120.98, 14.6] },
  { kod: 'GA', nev: 'Gabon', geo: 'Gabon', lonlat: [9.45, 0.39] },
  { kod: 'GM', nev: 'Gambia', geo: 'Gambia', lonlat: [-16.58, 13.45] },
  { kod: 'GH', nev: 'Ghána', geo: 'Ghana', lonlat: [-0.19, 5.6] },
  { kod: 'GE', nev: 'Grúzia', geo: 'Georgia', lonlat: [44.79, 41.72] },
  { kod: 'GT', nev: 'Guatemala', geo: 'Guatemala', lonlat: [-90.51, 14.63] },
  { kod: 'GN', nev: 'Guinea', geo: 'Guinea', lonlat: [-13.68, 9.54] },
  { kod: 'GY', nev: 'Guyana', geo: 'Guyana', lonlat: [-58.16, 6.8] },
  { kod: 'GR', nev: 'Görögország', geo: 'Greece', lonlat: [23.73, 37.98] },
  { kod: 'HT', nev: 'Haiti', geo: 'Haiti', lonlat: [-72.34, 18.54] },
  { kod: 'NL', nev: 'Hollandia', geo: 'Netherlands', lonlat: [4.9, 52.37] },
  { kod: 'HN', nev: 'Honduras', geo: 'Honduras', lonlat: [-87.21, 14.07] },
  { kod: 'HR', nev: 'Horvátország', geo: 'Croatia', lonlat: [15.98, 45.81] },
  { kod: 'IN', nev: 'India', geo: 'India', lonlat: [77.21, 28.61] },
  { kod: 'ID', nev: 'Indonézia', geo: 'Indonesia', lonlat: [106.85, -6.21] },
  { kod: 'IQ', nev: 'Irak', geo: 'Iraq', lonlat: [44.37, 33.31] },
  { kod: 'IR', nev: 'Irán', geo: 'Iran', lonlat: [51.39, 35.69] },
  { kod: 'IS', nev: 'Izland', geo: 'Iceland', lonlat: [-21.94, 64.15] },
  { kod: 'IL', nev: 'Izrael', geo: 'Israel', lonlat: [35.22, 31.77] },
  { kod: 'JM', nev: 'Jamaica', geo: 'Jamaica', lonlat: [-76.79, 18.0] },
  { kod: 'JP', nev: 'Japán', geo: 'Japan', lonlat: [139.69, 35.69] },
  { kod: 'YE', nev: 'Jemen', geo: 'Yemen', lonlat: [44.21, 15.35] },
  { kod: 'JO', nev: 'Jordánia', geo: 'Jordan', lonlat: [35.93, 31.95] },
  { kod: 'KH', nev: 'Kambodzsa', geo: 'Cambodia', lonlat: [104.92, 11.56] },
  { kod: 'CM', nev: 'Kamerun', geo: 'Cameroon', lonlat: [11.52, 3.87] },
  { kod: 'CA', nev: 'Kanada', geo: 'Canada', lonlat: [-75.7, 45.42] },
  { kod: 'QA', nev: 'Katar', geo: 'Qatar', lonlat: [51.53, 25.29] },
  { kod: 'KZ', nev: 'Kazahsztán', geo: 'Kazakhstan', lonlat: [71.45, 51.17] },
  { kod: 'TL', nev: 'Kelet-Timor', geo: 'Timor-Leste', lonlat: [125.57, -8.56] },
  { kod: 'KE', nev: 'Kenya', geo: 'Kenya', lonlat: [36.82, -1.29] },
  { kod: 'KG', nev: 'Kirgizisztán', geo: 'Kyrgyzstan', lonlat: [74.59, 42.87] },
  { kod: 'CO', nev: 'Kolumbia', geo: 'Colombia', lonlat: [-74.07, 4.71] },
  { kod: 'CD', nev: 'Kongói Demokratikus Köztársaság', geo: 'Dem. Rep. Congo', lonlat: [15.31, -4.33] },
  { kod: 'CG', nev: 'Kongói Köztársaság', geo: 'Congo', lonlat: [15.28, -4.27] },
  { kod: 'KR', nev: 'Koreai Köztársaság', geo: 'South Korea', lonlat: [126.98, 37.57] },
  { kod: 'KP', nev: 'Koreai NDK', geo: 'North Korea', lonlat: [125.75, 39.02] },
  { kod: 'XK', nev: 'Koszovó', geo: 'Kosovo', lonlat: [21.17, 42.66] },
  { kod: 'CU', nev: 'Kuba', geo: 'Cuba', lonlat: [-82.37, 23.11] },
  { kod: 'KW', nev: 'Kuvait', geo: 'Kuwait', lonlat: [47.98, 29.38] },
  { kod: 'CN', nev: 'Kína', geo: 'China', lonlat: [116.4, 39.9] },
  { kod: 'CF', nev: 'Közép-afrikai Köztársaság', geo: 'Central African Rep.', lonlat: [18.56, 4.36] },
  { kod: 'LA', nev: 'Laosz', geo: 'Laos', lonlat: [102.63, 17.97] },
  { kod: 'PL', nev: 'Lengyelország', geo: 'Poland', lonlat: [21.01, 52.23] },
  { kod: 'LS', nev: 'Lesotho', geo: 'Lesotho', lonlat: [27.48, -29.31] },
  { kod: 'LV', nev: 'Lettország', geo: 'Latvia', lonlat: [24.11, 56.95] },
  { kod: 'LB', nev: 'Libanon', geo: 'Lebanon', lonlat: [35.5, 33.89] },
  { kod: 'LR', nev: 'Libéria', geo: 'Liberia', lonlat: [-10.8, 6.3] },
  { kod: 'LT', nev: 'Litvánia', geo: 'Lithuania', lonlat: [25.28, 54.69] },
  { kod: 'LU', nev: 'Luxemburg', geo: 'Luxembourg', lonlat: [6.13, 49.61] },
  { kod: 'LY', nev: 'Líbia', geo: 'Libya', lonlat: [13.19, 32.89] },
  { kod: 'MG', nev: 'Madagaszkár', geo: 'Madagascar', lonlat: [47.51, -18.88] },
  { kod: 'HU', nev: 'Magyarország', geo: 'Hungary', lonlat: [19.04, 47.5] },
  { kod: 'MY', nev: 'Malajzia', geo: 'Malaysia', lonlat: [101.69, 3.14] },
  { kod: 'MW', nev: 'Malawi', geo: 'Malawi', lonlat: [33.79, -13.96] },
  { kod: 'ML', nev: 'Mali', geo: 'Mali', lonlat: [-8.0, 12.65] },
  { kod: 'MA', nev: 'Marokkó', geo: 'Morocco', lonlat: [-6.85, 34.02] },
  { kod: 'MR', nev: 'Mauritánia', geo: 'Mauritania', lonlat: [-15.98, 18.09] },
  { kod: 'MX', nev: 'Mexikó', geo: 'Mexico', lonlat: [-99.13, 19.43] },
  { kod: 'MM', nev: 'Mianmar', geo: 'Myanmar', lonlat: [96.13, 19.75] },
  { kod: 'MD', nev: 'Moldova', geo: 'Moldova', lonlat: [28.86, 47.01] },
  { kod: 'MN', nev: 'Mongólia', geo: 'Mongolia', lonlat: [106.92, 47.92] },
  { kod: 'ME', nev: 'Montenegró', geo: 'Montenegro', lonlat: [19.26, 42.44] },
  { kod: 'MZ', nev: 'Mozambik', geo: 'Mozambique', lonlat: [32.59, -25.97] },
  { kod: 'NA', nev: 'Namíbia', geo: 'Namibia', lonlat: [17.08, -22.56] },
  { kod: 'NP', nev: 'Nepál', geo: 'Nepal', lonlat: [85.32, 27.72] },
  { kod: 'NI', nev: 'Nicaragua', geo: 'Nicaragua', lonlat: [-86.25, 12.13] },
  { kod: 'NE', nev: 'Niger', geo: 'Niger', lonlat: [2.11, 13.51] },
  { kod: 'NG', nev: 'Nigéria', geo: 'Nigeria', lonlat: [7.49, 9.06] },
  { kod: 'NO', nev: 'Norvégia', geo: 'Norway', lonlat: [10.75, 59.91] },
  { kod: 'DE', nev: 'Németország', geo: 'Germany', lonlat: [13.4, 52.52] },
  { kod: 'IT', nev: 'Olaszország', geo: 'Italy', lonlat: [12.5, 41.9] },
  { kod: 'OM', nev: 'Omán', geo: 'Oman', lonlat: [58.59, 23.59] },
  { kod: 'RU', nev: 'Oroszország', geo: 'Russia', lonlat: [37.62, 55.75] },
  { kod: 'PK', nev: 'Pakisztán', geo: 'Pakistan', lonlat: [73.09, 33.69] },
  { kod: 'PS', nev: 'Palesztina', geo: 'Palestine', lonlat: [35.23, 31.9] },
  { kod: 'PA', nev: 'Panama', geo: 'Panama', lonlat: [-79.52, 8.98] },
  { kod: 'PY', nev: 'Paraguay', geo: 'Paraguay', lonlat: [-57.58, -25.28] },
  { kod: 'PE', nev: 'Peru', geo: 'Peru', lonlat: [-77.03, -12.05] },
  { kod: 'PT', nev: 'Portugália', geo: 'Portugal', lonlat: [-9.14, 38.72] },
  { kod: 'PG', nev: 'Pápua Új-Guinea', geo: 'Papua New Guinea', lonlat: [147.18, -9.44] },
  { kod: 'RO', nev: 'Románia', geo: 'Romania', lonlat: [26.1, 44.43] },
  { kod: 'RW', nev: 'Ruanda', geo: 'Rwanda', lonlat: [30.06, -1.94] },
  { kod: 'SB', nev: 'Salamon-szigetek', geo: 'Solomon Is.', lonlat: [159.97, -9.43] },
  { kod: 'SV', nev: 'Salvador', geo: 'El Salvador', lonlat: [-89.19, 13.69] },
  { kod: 'SL', nev: 'Sierra Leone', geo: 'Sierra Leone', lonlat: [-13.23, 8.48] },
  { kod: 'ES', nev: 'Spanyolország', geo: 'Spain', lonlat: [-3.7, 40.42] },
  { kod: 'LK', nev: 'Srí Lanka', geo: 'Sri Lanka', lonlat: [79.86, 6.93] },
  { kod: 'SR', nev: 'Suriname', geo: 'Suriname', lonlat: [-55.2, 5.85] },
  { kod: 'CH', nev: 'Svájc', geo: 'Switzerland', lonlat: [7.45, 46.95] },
  { kod: 'SE', nev: 'Svédország', geo: 'Sweden', lonlat: [18.07, 59.33] },
  { kod: 'SA', nev: 'Szaúd-Arábia', geo: 'Saudi Arabia', lonlat: [46.72, 24.69] },
  { kod: 'SN', nev: 'Szenegál', geo: 'Senegal', lonlat: [-17.44, 14.69] },
  { kod: 'RS', nev: 'Szerbia', geo: 'Serbia', lonlat: [20.46, 44.79] },
  { kod: 'SK', nev: 'Szlovákia', geo: 'Slovakia', lonlat: [17.11, 48.15] },
  { kod: 'SI', nev: 'Szlovénia', geo: 'Slovenia', lonlat: [14.51, 46.06] },
  { kod: 'SO', nev: 'Szomália', geo: 'Somalia', lonlat: [45.32, 2.05] },
  { kod: 'SD', nev: 'Szudán', geo: 'Sudan', lonlat: [32.53, 15.55] },
  { kod: 'SY', nev: 'Szíria', geo: 'Syria', lonlat: [36.29, 33.51] },
  { kod: 'TW', nev: 'Tajvan', geo: 'Taiwan', lonlat: [121.57, 25.03] },
  { kod: 'TZ', nev: 'Tanzánia', geo: 'Tanzania', lonlat: [35.74, -6.16] },
  { kod: 'TH', nev: 'Thaiföld', geo: 'Thailand', lonlat: [100.5, 13.76] },
  { kod: 'TG', nev: 'Togo', geo: 'Togo', lonlat: [1.22, 6.14] },
  { kod: 'TT', nev: 'Trinidad és Tobago', geo: 'Trinidad and Tobago', lonlat: [-61.52, 10.65] },
  { kod: 'TN', nev: 'Tunézia', geo: 'Tunisia', lonlat: [10.18, 36.81] },
  { kod: 'TJ', nev: 'Tádzsikisztán', geo: 'Tajikistan', lonlat: [68.79, 38.56] },
  { kod: 'TR', nev: 'Törökország', geo: 'Turkey', lonlat: [32.85, 39.93] },
  { kod: 'TM', nev: 'Türkmenisztán', geo: 'Turkmenistan', lonlat: [58.38, 37.95] },
  { kod: 'UG', nev: 'Uganda', geo: 'Uganda', lonlat: [32.58, 0.35] },
  { kod: 'UA', nev: 'Ukrajna', geo: 'Ukraine', lonlat: [30.52, 50.45] },
  { kod: 'UY', nev: 'Uruguay', geo: 'Uruguay', lonlat: [-56.16, -34.9] },
  { kod: 'VU', nev: 'Vanuatu', geo: 'Vanuatu', lonlat: [168.32, -17.73] },
  { kod: 'VE', nev: 'Venezuela', geo: 'Venezuela', lonlat: [-66.88, 10.49] },
  { kod: 'VN', nev: 'Vietnám', geo: 'Vietnam', lonlat: [105.83, 21.03] },
  { kod: 'ZM', nev: 'Zambia', geo: 'Zambia', lonlat: [28.28, -15.42] },
  { kod: 'ZW', nev: 'Zimbabwe', geo: 'Zimbabwe', lonlat: [31.05, -17.83] },
  { kod: 'MK', nev: 'Észak-Macedónia', geo: 'Macedonia', lonlat: [21.43, 41.99] },
  { kod: 'EE', nev: 'Észtország', geo: 'Estonia', lonlat: [24.75, 59.44] },
  { kod: 'IE', nev: 'Írország', geo: 'Ireland', lonlat: [-6.26, 53.35] },
  { kod: 'AM', nev: 'Örményország', geo: 'Armenia', lonlat: [44.51, 40.18] },
  { kod: 'NZ', nev: 'Új-Zéland', geo: 'New Zealand', lonlat: [174.78, -41.29] },
  { kod: 'UZ', nev: 'Üzbegisztán', geo: 'Uzbekistan', lonlat: [69.24, 41.3] },
];

const KOD_INDEX: ReadonlyMap<string, Orszag> = new Map(ORSZAGOK.map((o) => [o.kod, o]));

export function orszagByKod(kod: string | null | undefined): Orszag | undefined {
  return kod ? KOD_INDEX.get(kod) : undefined;
}

/** Megjelenítéshez: ismeretlen kódra magát a kódot adja (sosem üres egy létező érték), null-ra ''. */
export function orszagNev(kod: string | null | undefined): string {
  if (!kod) return '';
  return KOD_INDEX.get(kod)?.nev ?? kod;
}
```

- [ ] **Step 2: Ellenőrzés eldobható scripttel**

`scripts/_x.ts`:

```ts
import { ORSZAGOK, orszagByKod, orszagNev } from '../lib/orszagok';
console.log(ORSZAGOK.length, orszagByKod('KR')?.geo, orszagNev('JP'), orszagNev('XX'), orszagNev(null));
const kodok = new Set(ORSZAGOK.map((o) => o.kod));
console.log('egyedi kód', kodok.size === ORSZAGOK.length);
console.log('rendezett', ORSZAGOK.every((o, i) => i === 0 || ORSZAGOK[i - 1].nev.localeCompare(o.nev, 'hu') <= 0));
```

Run: `npx tsx scripts/_x.ts` → `168 South Korea Japán XX ` majd `egyedi kód true`, `rendezett true`. (Ha a rendezés `false`, rendezd a tömböt `localeCompare(…, 'hu')` szerint.) Utána `rm scripts/_x.ts`.

- [ ] **Step 3: `validOrszag` ISO-kódra**

`lib/felhasznalo-validacio.ts`: az import sorba `import { orszagByKod } from './orszagok';`, majd a `validOrszag` cseréje:

```ts
/** Attasénál kötelező, a szótár ISO-kódja; adminnál (és érvénytelen szerepkörnél) eldobjuk, hiba nélkül. */
function validOrszag(raw: string, szerepkor: Szerepkor | null, errors: MezoHibak): string | null {
  if (szerepkor !== 'attase') return null;
  if (!raw) {
    errors.orszag = 'TéT attasénál az ország kötelező.';
    return null;
  }
  if (!orszagByKod(raw)) {
    errors.orszag = 'Válassz országot a listából.';
    return null;
  }
  return raw;
}
```

- [ ] **Step 4: Ország select az `AttaseMezok`-ban**

`app/(app)/felhasznalok/components/AttaseMezok.tsx`: import `import { ORSZAGOK } from '../../../../lib/orszagok';`. A `set` segéd típusa bővül: `(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>)`. Az `orszag` `<Input …/>` helyett (natív select, a shadcn `Input` osztályaival egyező keret):

```tsx
              <select
                id="orszag"
                name="orszag"
                required
                value={ertekek.orszag}
                onChange={set('orszag')}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
                {...hibaAttr(errors, 'orszag')}
              >
                <option value="">Válassz országot…</option>
                {ORSZAGOK.map((o) => (
                  <option key={o.kod} value={o.kod}>
                    {o.nev}
                  </option>
                ))}
              </select>
```

- [ ] **Step 5: Megjelenítés `orszagNev()`-vel**

Mindegyik fájlba `import { orszagNev } from '<relatív>/lib/orszagok';`, majd:

- `FelhasznaloTabla.tsx:50`: `{f.orszag ? orszagNev(f.orszag) : <span className="text-muted-foreground">–</span>}`
- `AppShell.tsx:115`: `` `TéT attasé${user.orszag ? ' · ' + orszagNev(user.orszag) : ''}` ``
- `RiportTabla.tsx:71`: `<div>{orszagNev(r.orszag)}</div>`
- `RiportReszlet.tsx:35`: `{riport.szerzoNev} · {orszagNev(riport.orszag)} · beadva …`
- `RiportSzurok.tsx:173`: `opciok={orszagok.map((o) => ({ ertek: o, cimke: orszagNev(o) }))}`
- `SzerkesztesDialog.tsx:75` környékén, ha az admin-váltás figyelmeztetése kiírja az országot, ott is `orszagNev(felhasznalo.orszag)`.

Run: `npx tsc --noEmit` → hibátlan.

- [ ] **Step 6: Átíró script**

`scripts/orszag-kod-migracio.ts`:

```ts
/**
 * Egyszeri, idempotens adat-átírás: a user.orszag és a riport.orszag szabadszöveges
 * országneveit ISO-kódra cseréli a lib/orszagok.ts szótár alapján. Ami már kód, azt
 * kihagyja; a nem párosíthatót kilistázza és érintetlenül hagyja.
 * Futtatás: npx tsx scripts/orszag-kod-migracio.ts
 */
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { riport, user } from '../db/schema';
import { ORSZAGOK, ORSZAG_KOD_RE, orszagByKod } from '../lib/orszagok';

const ALIAS: Record<string, string> = {
  'dél-korea': 'KR',
  'dél korea': 'KR',
  'egyesült államok': 'US',
  'usa': 'US',
  'nagy-britannia': 'GB',
  'anglia': 'GB',
  'csehország': 'CZ',
  'észak-macedónia': 'MK',
};

function norm(s: string): string {
  return s.trim().replace(/\s+/g, ' ').toLocaleLowerCase('hu');
}
const NEV_INDEX = new Map(ORSZAGOK.map((o) => [norm(o.nev), o.kod]));

/** `null` = már érvényes kód (kihagyjuk), `undefined` = párosítatlan, string = az új kód. */
function kodra(ertek: string): string | null | undefined {
  if (ORSZAG_KOD_RE.test(ertek) && orszagByKod(ertek)) return null;
  const n = norm(ertek);
  return NEV_INDEX.get(n) ?? ALIAS[n];
}

let atirt = 0;
const parositatlan: string[] = [];

for (const u of db.select({ id: user.id, orszag: user.orszag }).from(user).all()) {
  if (!u.orszag) continue;
  const kod = kodra(u.orszag);
  if (kod === null) continue;
  if (!kod) { parositatlan.push(`user ${u.id}: "${u.orszag}"`); continue; }
  db.update(user).set({ orszag: kod }).where(eq(user.id, u.id)).run();
  atirt++;
}
for (const r of db.select({ id: riport.id, orszag: riport.orszag }).from(riport).all()) {
  const kod = kodra(r.orszag);
  if (kod === null) continue;
  if (!kod) { parositatlan.push(`riport ${r.id}: "${r.orszag}"`); continue; }
  db.update(riport).set({ orszag: kod }).where(eq(riport.id, r.id)).run();
  atirt++;
}
console.log(`Átírva: ${atirt} sor. Párosítatlan: ${parositatlan.length}`);
for (const p of parositatlan) console.log('  ' + p);
```

A `riport.updatedAt` `$onUpdate`-je miatt a riport `updated_at` frissül – elfogadható.

Run: `npx tsx scripts/orszag-kod-migracio.ts` → `Átírva: 5 sor. Párosítatlan: 0` (2 user + 3 riport). Újra: `Átírva: 0 sor.` Ellenőrzés: `sqlite3 data/tet.db "select orszag from user; select distinct orszag from riport;"` → `KR`, `JP`.

- [ ] **Step 7: Böngészős ellenőrzés és commit**

Attaséval bejelentkezve `/riportok`: az ország oszlop „Koreai Köztársaság"-ot ír, a fejléc „TéT attasé · Koreai Köztársaság". Adminként `/felhasznalok` → Szerkesztés a teszt attasén: az ország select a „Koreai Köztársaság"-on áll; mentés hibátlan.

```bash
git add lib/orszagok.ts lib/felhasznalo-validacio.ts "app/(app)/felhasznalok/components/AttaseMezok.tsx" "app/(app)/felhasznalok/components/FelhasznaloTabla.tsx" "app/(app)/felhasznalok/components/SzerkesztesDialog.tsx" components/AppShell.tsx components/riport/RiportTabla.tsx components/riport/RiportReszlet.tsx components/riport/RiportSzurok.tsx scripts/orszag-kod-migracio.ts
git commit -m "feat(orszag): országszótár ISO-kóddal, user.orszag és riport.orszag kódra, átíró script

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 2: Szótár, típusok, aktuális év, jogosultság

**Files:**
- Create: `lib/orszagprofil-szotar.ts`
- Modify: `lib/datum.ts` (a `maiNaptariNap` után)
- Create: `lib/orszagprofil-jog.ts`

- [ ] **Step 1: `lib/orszagprofil-szotar.ts`**

```ts
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
  friss: 'Idei profil',
  elavult: 'Elavult profil',
  nincs: 'Nincs profil',
};
export const ALLAPOT_SZINEK: Record<Allapot, string> = { friss: '#2f7d32', elavult: '#b45309', nincs: '#9aa3ad' };

export const RENDEZVENY_TIPUSOK = [
  { kulcs: 'szakkiallitas', cimke: 'Szakkiállítás' },
  { kulcs: 'konferencia', cimke: 'Konferencia' },
  { kulcs: 'forum', cimke: 'Egyéb fórum' },
] as const;
export type RendezvenyTipus = (typeof RENDEZVENY_TIPUSOK)[number]['kulcs'];
export function rendezvenyTipusCimke(k: RendezvenyTipus): string {
  return RENDEZVENY_TIPUSOK.find((t) => t.kulcs === k)?.cimke ?? k;
}

export const SZOVEG_MAX = 4000;
export const ROVID_MAX = 200;
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

/** Üres alapértékek blokkonként; a normalizálás és az üres űrlap ebből indul. */
export function uresBlokk<K extends BlokkKulcs>(kulcs: K): ProfilBlokkok[K] {
  const b: ProfilBlokkok = {
    alapadatok: {
      lakossag: null, gdp: null, gdpEgyFore: null, gdpNovekedes: null, adatEv: null, forras: '',
      tagsagok: [], tagsagEgyeb: '', agazatok: [], agazatEgyeb: '',
    },
    kfiRendszer: {
      teljesitmeny: '', gerd: null, strategia: '', prioritasok: [], prioritasEgyeb: '',
      kiemeltIparagak: [], iparagEgyeb: '', erossegek: '', kihivasok: '',
    },
    intezmenyek: { iranyitoSzervek: '', egyetemek: '', kutatokozpontok: '', infrastrukturak: '' },
    vallalati: { kiemeltAgazatok: [], agazatEgyeb: '', topVallalatok: [], startupok: '', klaszterek: '', technologiatranszfer: '' },
    programok: { palyazatok: '', tamogatasiProgramok: '', finanszirozasiEszkozok: '', nemzetkoziReszvetel: '' },
    rendezvenyek: { lista: [] },
    kapcsolatok: { euMultilateralis: '', partnerorszagok: '', egyezmeny: '', ketoldalu: '', mobilitas: '' },
    magyarErtekeles: { osszegzes: '', egyuttmukodesiLehetosegek: '', joGyakorlatok: '', diplomaciaiPrioritasok: '' },
  };
  return b[kulcs];
}

function szoveg(v: unknown): string {
  return typeof v === 'string' ? v : '';
}
function szam(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}
function lista<T extends string>(v: unknown, engedett: readonly T[]): T[] {
  if (!Array.isArray(v)) return [];
  const eng = engedett as readonly string[];
  return Array.from(new Set(v.filter((x): x is T => typeof x === 'string' && eng.includes(x))));
}
function szovegLista(v: unknown, max: number): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x !== '').slice(0, max) : [];
}

/**
 * A DB-ből olvasott JSON blokk normalizálása: a hiányzó vagy rossz típusú almező az üres
 * alapértéket kapja, a listákból az ismeretlen opció kiesik. Így egy később bevezetett
 * mező nem töri el a régi sort.
 */
export function normalizalBlokk<K extends BlokkKulcs>(kulcs: K, nyers: unknown): ProfilBlokkok[K] {
  const r = (typeof nyers === 'object' && nyers !== null ? nyers : {}) as Record<string, unknown>;
  switch (kulcs) {
    case 'alapadatok': {
      const b: Alapadatok = {
        lakossag: szam(r.lakossag), gdp: szam(r.gdp), gdpEgyFore: szam(r.gdpEgyFore),
        gdpNovekedes: szam(r.gdpNovekedes), adatEv: szam(r.adatEv), forras: szoveg(r.forras),
        tagsagok: lista(r.tagsagok, TAGSAGOK), tagsagEgyeb: szoveg(r.tagsagEgyeb),
        agazatok: lista(r.agazatok, GAZDASAGI_AGAZATOK), agazatEgyeb: szoveg(r.agazatEgyeb),
      };
      return b as ProfilBlokkok[K];
    }
    case 'kfiRendszer': {
      const b: KfiRendszer = {
        teljesitmeny: szoveg(r.teljesitmeny), gerd: szam(r.gerd), strategia: szoveg(r.strategia),
        prioritasok: lista(r.prioritasok, KFI_PRIORITASOK), prioritasEgyeb: szoveg(r.prioritasEgyeb),
        kiemeltIparagak: lista(r.kiemeltIparagak, IPARAGAK), iparagEgyeb: szoveg(r.iparagEgyeb),
        erossegek: szoveg(r.erossegek), kihivasok: szoveg(r.kihivasok),
      };
      return b as ProfilBlokkok[K];
    }
    case 'intezmenyek': {
      const b: Intezmenyek = {
        iranyitoSzervek: szoveg(r.iranyitoSzervek), egyetemek: szoveg(r.egyetemek),
        kutatokozpontok: szoveg(r.kutatokozpontok), infrastrukturak: szoveg(r.infrastrukturak),
      };
      return b as ProfilBlokkok[K];
    }
    case 'vallalati': {
      const b: Vallalati = {
        kiemeltAgazatok: lista(r.kiemeltAgazatok, IPARAGAK), agazatEgyeb: szoveg(r.agazatEgyeb),
        topVallalatok: szovegLista(r.topVallalatok, TOP_VALLALAT_MAX), startupok: szoveg(r.startupok),
        klaszterek: szoveg(r.klaszterek), technologiatranszfer: szoveg(r.technologiatranszfer),
      };
      return b as ProfilBlokkok[K];
    }
    case 'programok': {
      const b: Programok = {
        palyazatok: szoveg(r.palyazatok), tamogatasiProgramok: szoveg(r.tamogatasiProgramok),
        finanszirozasiEszkozok: szoveg(r.finanszirozasiEszkozok), nemzetkoziReszvetel: szoveg(r.nemzetkoziReszvetel),
      };
      return b as ProfilBlokkok[K];
    }
    case 'rendezvenyek': {
      const tipusok = RENDEZVENY_TIPUSOK.map((t) => t.kulcs) as readonly RendezvenyTipus[];
      const nyersLista = Array.isArray(r.lista) ? r.lista : [];
      const b: Rendezvenyek = {
        lista: nyersLista
          .filter((x): x is Record<string, unknown> => typeof x === 'object' && x !== null)
          .map((x) => ({
            nev: szoveg(x.nev),
            tipus: lista([x.tipus], tipusok)[0] ?? 'forum',
            idopont: szoveg(x.idopont),
            megjegyzes: szoveg(x.megjegyzes),
          }))
          .filter((x) => x.nev !== '')
          .slice(0, RENDEZVENY_MAX),
      };
      return b as ProfilBlokkok[K];
    }
    case 'kapcsolatok': {
      const b: Kapcsolatok = {
        euMultilateralis: szoveg(r.euMultilateralis), partnerorszagok: szoveg(r.partnerorszagok),
        egyezmeny: szoveg(r.egyezmeny), ketoldalu: szoveg(r.ketoldalu), mobilitas: szoveg(r.mobilitas),
      };
      return b as ProfilBlokkok[K];
    }
    case 'magyarErtekeles': {
      const b: MagyarErtekeles = {
        osszegzes: szoveg(r.osszegzes), egyuttmukodesiLehetosegek: szoveg(r.egyuttmukodesiLehetosegek),
        joGyakorlatok: szoveg(r.joGyakorlatok), diplomaciaiPrioritasok: szoveg(r.diplomaciaiPrioritasok),
      };
      return b as ProfilBlokkok[K];
    }
  }
  return uresBlokk(kulcs);
}

/** Mezőcímkék és súgó: az űrlap és az olvasó nézet ugyanezt írja. Kulcs = a mező neve. */
export interface MezoCimke {
  cimke: string;
  sugo?: string;
}
export const MEZO_CIMKEK: Record<BlokkKulcs, Record<string, MezoCimke>> = {
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
```

- [ ] **Step 2: `aktualisEv()` a `lib/datum.ts` végére**

```ts
/** Az aktuális naptári év Europe/Budapest szerint (a profil beadási éve). */
export function aktualisEv(): number {
  return Number(maiNaptariNap().slice(0, 4));
}
```

- [ ] **Step 3: `lib/orszagprofil-jog.ts`**

```ts
import type { AppSession } from './session';
import { EV_MIN } from './orszagprofil-szotar';

/**
 * Olvasni bárki olvashat bármely profilt. Szerkeszteni: admin bármely országot
 * EV_MIN és az aktuális év között; attasé csak a saját országát és csak az aktuális évet.
 */
export function canEditProfil(session: AppSession, kod: string, ev: number, aktualisEv: number): boolean {
  if (!Number.isInteger(ev) || ev < EV_MIN || ev > aktualisEv) return false;
  if (session.role === 'admin') return true;
  return session.orszag === kod && ev === aktualisEv;
}
```

(A `lib/session.ts` `server-only`, de itt csak típust importálunk – `import type` – ez tiszta marad, ugyanígy tesz a `lib/riport-jog.ts`.)

- [ ] **Step 4: Ellenőrzés**

`scripts/_x.ts`:

```ts
import { normalizalBlokk, uresBlokk, BLOKK_KULCSOK } from '../lib/orszagprofil-szotar';
import { canEditProfil } from '../lib/orszagprofil-jog';
console.log(normalizalBlokk('alapadatok', { lakossag: 5, tagsagok: ['EU', 'X'], forras: 3 }));
console.log(normalizalBlokk('rendezvenyek', { lista: [{ nev: 'A', tipus: 'zzz' }, { nev: '' }, 'x'] }));
console.log(BLOKK_KULCSOK.every((k) => JSON.stringify(normalizalBlokk(k, null)) === JSON.stringify(uresBlokk(k))));
const admin = { userId: 'a', name: '', email: '', role: 'admin' as const, orszag: null };
const att = { userId: 'b', name: '', email: '', role: 'attase' as const, orszag: 'KR' };
console.log(canEditProfil(admin, 'JP', 2025, 2026), canEditProfil(admin, 'JP', 2019, 2026), canEditProfil(att, 'KR', 2026, 2026), canEditProfil(att, 'KR', 2025, 2026), canEditProfil(att, 'JP', 2026, 2026));
```

Run: `npx tsx scripts/_x.ts` → 1. sor: `lakossag: 5, tagsagok: ['EU'], forras: ''`, a többi üres; 2. sor: `lista: [{ nev: 'A', tipus: 'forum', idopont: '', megjegyzes: '' }]`; `true`; `true false true false false`. `rm scripts/_x.ts`; `npx tsc --noEmit`.

- [ ] **Step 5: Commit**

```bash
git add lib/orszagprofil-szotar.ts lib/orszagprofil-jog.ts lib/datum.ts
git commit -m "feat(orszagprofil): szótárak, blokk-típusok, normalizálás, jogosultság, aktualisEv

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 3: Séma, migráció, lekérdezések

**Files:**
- Create: `db/schema/orszagprofil.ts`
- Modify: `db/schema/index.ts`
- Generate: `drizzle/0005_*.sql`, `drizzle/meta/*`
- Create: `db/queries/orszagprofil.ts`

- [ ] **Step 1: Séma**

`db/schema/orszagprofil.ts`:

```ts
import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { user } from './auth';
import type {
  Alapadatok, Intezmenyek, Kapcsolatok, KfiRendszer, MagyarErtekeles, Programok, Rendezvenyek, Vallalati,
} from '../../lib/orszagprofil-szotar';

// Országprofil: országonként (ISO-kód, lib/orszagok.ts) és évenként egy sor. Blokkonként
// egy JSON oszlop; null = a blokk még nem lett mentve. A tartalmat olvasáskor a
// lib/orszagprofil-szotar.ts normalizalBlokk() egészíti ki (régi sor, új almező).
export const orszagprofil = sqliteTable(
  'orszagprofil',
  {
    id: text('id').primaryKey(),
    orszagKod: text('orszag_kod').notNull(),
    ev: integer('ev').notNull(),
    szerzoId: text('szerzo_id').references(() => user.id, { onDelete: 'set null' }),
    alapadatok: text('alapadatok', { mode: 'json' }).$type<Alapadatok>(),
    kfiRendszer: text('kfi_rendszer', { mode: 'json' }).$type<KfiRendszer>(),
    intezmenyek: text('intezmenyek', { mode: 'json' }).$type<Intezmenyek>(),
    vallalati: text('vallalati', { mode: 'json' }).$type<Vallalati>(),
    programok: text('programok', { mode: 'json' }).$type<Programok>(),
    rendezvenyek: text('rendezvenyek', { mode: 'json' }).$type<Rendezvenyek>(),
    kapcsolatok: text('kapcsolatok', { mode: 'json' }).$type<Kapcsolatok>(),
    magyarErtekeles: text('magyar_ertekeles', { mode: 'json' }).$type<MagyarErtekeles>(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('orszagprofil_kod_ev_idx').on(table.orszagKod, table.ev),
    index('orszagprofil_ev_idx').on(table.ev),
  ],
);
```

`db/schema/index.ts`: `export * from './orszagprofil';` sor hozzáadása.

- [ ] **Step 2: Migráció**

Run: `npm run db:generate` → `drizzle/0005_<név>.sql` (CREATE TABLE `orszagprofil` + két index), `drizzle/meta/0005_snapshot.json`, `_journal.json` frissül. `npm run db:migrate` → siker. Ellenőrzés: `sqlite3 data/tet.db ".schema orszagprofil"`.

- [ ] **Step 3: Lekérdezések**

`db/queries/orszagprofil.ts`:

```ts
import 'server-only';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../index';
import { orszagprofil, user } from '../schema';
import { formatDatum } from '../../lib/datum';
import { orszagByKod } from '../../lib/orszagok';
import {
  BLOKK_KULCSOK, normalizalBlokk, type Alapadatok, type Allapot, type BlokkKulcs, type Iparag, type ProfilBlokkok,
} from '../../lib/orszagprofil-szotar';

export interface Profil {
  id: string;
  orszagKod: string;
  ev: number;
  szerzo: { id: string; nev: string } | null;
  updatedAt: Date;
  /** Csak a mentett blokkok, normalizálva. */
  blokkok: Partial<ProfilBlokkok>;
  mentett: BlokkKulcs[];
}

function sorbol(r: typeof orszagprofil.$inferSelect, szerzoNev: string | null): Profil {
  const blokkok: Partial<ProfilBlokkok> = {};
  const mentett: BlokkKulcs[] = [];
  for (const k of BLOKK_KULCSOK) {
    if (r[k] != null) {
      (blokkok as Record<BlokkKulcs, unknown>)[k] = normalizalBlokk(k, r[k]);
      mentett.push(k);
    }
  }
  return {
    id: r.id,
    orszagKod: r.orszagKod,
    ev: r.ev,
    szerzo: r.szerzoId && szerzoNev !== null ? { id: r.szerzoId, nev: szerzoNev } : null,
    updatedAt: r.updatedAt,
    blokkok,
    mentett,
  };
}

export function getProfil(kod: string, ev: number): Profil | null {
  const r = db
    .select({ p: orszagprofil, szerzoNev: user.name })
    .from(orszagprofil)
    .leftJoin(user, eq(user.id, orszagprofil.szerzoId))
    .where(and(eq(orszagprofil.orszagKod, kod), eq(orszagprofil.ev, ev)))
    .get();
  return r ? sorbol(r.p, r.szerzoNev ?? null) : null;
}

/** Az adott ország profil-évei, csökkenő sorrendben (évválasztó). */
export function listEvek(kod: string): number[] {
  return db
    .select({ ev: orszagprofil.ev })
    .from(orszagprofil)
    .where(eq(orszagprofil.orszagKod, kod))
    .orderBy(desc(orszagprofil.ev))
    .all()
    .map((r) => r.ev);
}

export interface TerkepOrszag {
  kod: string;
  nev: string;
  geo: string;
  lonlat: [number, number];
  attase: string | null;
  poszt: { fovaros: string | null; terulet: number | null; penznem: string | null } | null;
  ev: number | null;
  allapot: Allapot;
  iparagak: Iparag[];
  osszegzes: string;
  frissitve: string | null;
  alapadatok: Alapadatok | null;
  mentettDb: number;
  rendezvenyDb: number;
}

/**
 * A térkép és a panel adata: minden ország, ahol aktív attasé van vagy van profil, a
 * legfrissebb profiljával. Két lekérdezés + JS-összefésülés (néhány tucat sor).
 */
export function listTerkepAdat(aktualisEv: number): TerkepOrszag[] {
  const now = Date.now();
  const attasek = db
    .select({
      orszag: user.orszag, nev: user.name, fovaros: user.fovaros, terulet: user.terulet, penznem: user.penznem,
      banned: user.banned, banExpires: user.banExpires,
    })
    .from(user)
    .where(eq(user.role, 'attase'))
    .all()
    .filter((u) => u.orszag && !(Boolean(u.banned) && (!u.banExpires || u.banExpires.getTime() > now)));

  // Országonként a legnagyobb év sora.
  const legfrissebbEv = db
    .select({ orszagKod: orszagprofil.orszagKod, ev: sql<number>`max(${orszagprofil.ev})`.as('ev') })
    .from(orszagprofil)
    .groupBy(orszagprofil.orszagKod)
    .as('lf');
  const profilok = db
    .select({ p: orszagprofil })
    .from(orszagprofil)
    .innerJoin(legfrissebbEv, and(eq(legfrissebbEv.orszagKod, orszagprofil.orszagKod), eq(legfrissebbEv.ev, orszagprofil.ev)))
    .all()
    .map((r) => r.p);

  const kodok = new Set<string>();
  for (const a of attasek) if (a.orszag) kodok.add(a.orszag);
  for (const p of profilok) kodok.add(p.orszagKod);

  const eredmeny: TerkepOrszag[] = [];
  for (const kod of kodok) {
    const o = orszagByKod(kod);
    if (!o) continue;
    const a = attasek.find((x) => x.orszag === kod) ?? null;
    const p = profilok.find((x) => x.orszagKod === kod) ?? null;
    const prof = p ? sorbol(p, null) : null;
    eredmeny.push({
      kod, nev: o.nev, geo: o.geo, lonlat: o.lonlat,
      attase: a?.nev ?? null,
      poszt: a ? { fovaros: a.fovaros ?? null, terulet: a.terulet ?? null, penznem: a.penznem ?? null } : null,
      ev: prof?.ev ?? null,
      allapot: !prof ? 'nincs' : prof.ev === aktualisEv ? 'friss' : 'elavult',
      iparagak: prof?.blokkok.kfiRendszer?.kiemeltIparagak ?? [],
      osszegzes: prof?.blokkok.magyarErtekeles?.osszegzes ?? '',
      frissitve: prof ? formatDatum(prof.updatedAt) : null,
      alapadatok: prof?.blokkok.alapadatok ?? null,
      mentettDb: prof?.mentett.length ?? 0,
      rendezvenyDb: prof?.blokkok.rendezvenyek?.lista.length ?? 0,
    });
  }
  return eredmeny.sort((x, y) => x.nev.localeCompare(y.nev, 'hu'));
}

/** Egy blokk mentése: a sor létrejön, ha nincs, majd csak az adott oszlop frissül. */
export function upsertBlokk<K extends BlokkKulcs>(
  kod: string,
  ev: number,
  blokk: K,
  tartalom: ProfilBlokkok[K],
  szerzoId: string,
): void {
  db.insert(orszagprofil)
    .values({ id: crypto.randomUUID(), orszagKod: kod, ev, szerzoId, [blokk]: tartalom })
    .onConflictDoUpdate({
      target: [orszagprofil.orszagKod, orszagprofil.ev],
      set: { [blokk]: tartalom, szerzoId, updatedAt: new Date() },
    })
    .run();
}
```

Ha a TypeScript a `[blokk]: tartalom` computed kulcsra panaszkodik az `insert().values()`-ban, írd `{ ...alap, ...({ [blokk]: tartalom } as Partial<typeof orszagprofil.$inferInsert>) }` alakban mindkét helyen.

- [ ] **Step 4: Ellenőrzés**

`scripts/_x.ts`:

```ts
import { getProfil, listEvek, listTerkepAdat, upsertBlokk } from '../db/queries/orszagprofil';
import { uresBlokk } from '../lib/orszagprofil-szotar';
import { db } from '../db';
import { user } from '../db/schema';
const u = db.select({ id: user.id }).from(user).get()!;
upsertBlokk('KR', 2026, 'kfiRendszer', { ...uresBlokk('kfiRendszer'), kiemeltIparagak: ['Űripar'] }, u.id);
upsertBlokk('KR', 2026, 'magyarErtekeles', { ...uresBlokk('magyarErtekeles'), osszegzes: 'teszt' }, u.id);
upsertBlokk('JP', 2025, 'alapadatok', { ...uresBlokk('alapadatok'), lakossag: 124000000 }, u.id);
console.log(getProfil('KR', 2026)?.mentett, listEvek('KR'), getProfil('KR', 2020));
console.log(listTerkepAdat(2026).map((t) => [t.kod, t.allapot, t.iparagak[0], t.attase, t.mentettDb]));
```

Run: `NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_x.ts` → `[ 'kfiRendszer', 'magyarErtekeles' ] [ 2026 ] null`, majd `[['JP','elavult',undefined,'<név>',1],['KR','friss','Űripar','<név>',2]]`. Utána takarítás: `sqlite3 data/tet.db "delete from orszagprofil;"`, `rm scripts/_x.ts`, `npx tsc --noEmit`.

- [ ] **Step 5: Commit**

```bash
git add db/schema/orszagprofil.ts db/schema/index.ts drizzle/ db/queries/orszagprofil.ts
git commit -m "feat(orszagprofil): orszagprofil tábla, migráció, lekérdezések (getProfil, listEvek, listTerkepAdat, upsertBlokk)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 4: Validátor

**Files:**
- Create: `lib/orszagprofil-validacio.ts`

- [ ] **Step 1: `lib/orszagprofil-validacio.ts`**

```ts
/**
 * FormData → típusos blokk, blokkonként. Nincs React, nincs DB. Minden hibát egy menetben
 * gyűjtünk; a hibakulcs a mező id-ja (a useMuveletForm erre fókuszál). A listás mezők
 * több azonos nevű értékként érkeznek (fd.getAll); a rendezvény-sorok `rendezveny.<i>.<mezo>`.
 */
import { mezo, type MezoHibak } from './urlap';
import {
  EV_MIN, GAZDASAGI_AGAZATOK, IPARAGAK, KFI_PRIORITASOK, MEZO_CIMKEK, OSSZEGZES_MAX, RENDEZVENY_MAX,
  ROVID_MAX, SZOVEG_MAX, TAGSAGOK, TOP_VALLALAT_MAX, rendezvenyTipus,
  type Alapadatok, type BlokkKulcs, type MezoCimke, type Intezmenyek, type Kapcsolatok, type KfiRendszer,
  type MagyarErtekeles, type ProfilBlokkok, type Programok, type Rendezveny,
  type Rendezvenyek, type Vallalati,
} from './orszagprofil-szotar';

export type ValidalasEredmeny<K extends BlokkKulcs> =
  | { ok: true; ertek: ProfilBlokkok[K] }
  | { ok: false; errors: MezoHibak };

function cimke(blokk: BlokkKulcs, kulcs: string): string {
  // A MEZO_CIMKEK típusa mezőnév szerint szigorú; itt stringgel indexelünk, ezért laza nézet.
  return (MEZO_CIMKEK[blokk] as Partial<Record<string, MezoCimke>>)[kulcs]?.cimke ?? kulcs;
}

function szoveg(fd: FormData, blokk: BlokkKulcs, kulcs: string, max: number, errors: MezoHibak): string {
  const v = mezo(fd, kulcs);
  if (v.length > max) errors[kulcs] = `${cimke(blokk, kulcs)} legfeljebb ${max} karakter.`;
  return v;
}

interface SzamSzabaly {
  min: number;
  max: number;
  tizedes: number;
}

/** Üres → null. Szóköz/NBSP és ezreselválasztó pont kiszedve, tizedesvessző → pont. */
function szam(fd: FormData, blokk: BlokkKulcs, kulcs: string, sz: SzamSzabaly, errors: MezoHibak): number | null {
  const raw = mezo(fd, kulcs);
  if (!raw) return null;
  const norm = raw.replace(/[\u0020\u00A0\u202F]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  const leiras = sz.tizedes === 0 ? 'egész szám' : `szám, legfeljebb ${sz.tizedes} tizedesjeggyel`;
  if (!/^-?\d+(\.\d+)?$/.test(norm)) {
    errors[kulcs] = `${cimke(blokk, kulcs)}: ${leiras} legyen.`;
    return null;
  }
  const [, tizedesek = ''] = norm.split('.');
  const n = Number(norm);
  if (tizedesek.length > sz.tizedes || n < sz.min || n > sz.max) {
    errors[kulcs] = `${cimke(blokk, kulcs)}: ${leiras}, ${sz.min} és ${sz.max} között.`;
    return null;
  }
  return n;
}

function lista<T extends string>(fd: FormData, kulcs: string, engedett: readonly T[]): T[] {
  const eng = engedett as readonly string[];
  const ertekek = fd.getAll(kulcs).filter((v): v is string => typeof v === 'string' && eng.includes(v));
  return Array.from(new Set(ertekek)) as T[];
}

function alapadatok(fd: FormData, aktualisEv: number): ValidalasEredmeny<'alapadatok'> {
  const errors: MezoHibak = {};
  const b = 'alapadatok';
  const ertek: Alapadatok = {
    lakossag: szam(fd, b, 'lakossag', { min: 1, max: 10_000_000_000, tizedes: 0 }, errors),
    gdp: szam(fd, b, 'gdp', { min: 0, max: 1_000_000, tizedes: 1 }, errors),
    gdpEgyFore: szam(fd, b, 'gdpEgyFore', { min: 0, max: 10_000_000, tizedes: 0 }, errors),
    gdpNovekedes: szam(fd, b, 'gdpNovekedes', { min: -100, max: 100, tizedes: 1 }, errors),
    adatEv: szam(fd, b, 'adatEv', { min: EV_MIN - 10, max: aktualisEv, tizedes: 0 }, errors),
    forras: szoveg(fd, b, 'forras', ROVID_MAX, errors),
    tagsagok: lista(fd, 'tagsagok', TAGSAGOK),
    tagsagEgyeb: szoveg(fd, b, 'tagsagEgyeb', ROVID_MAX, errors),
    agazatok: lista(fd, 'agazatok', GAZDASAGI_AGAZATOK),
    agazatEgyeb: szoveg(fd, b, 'agazatEgyeb', ROVID_MAX, errors),
  };
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, ertek };
}

function kfiRendszer(fd: FormData): ValidalasEredmeny<'kfiRendszer'> {
  const errors: MezoHibak = {};
  const b = 'kfiRendszer';
  const ertek: KfiRendszer = {
    teljesitmeny: szoveg(fd, b, 'teljesitmeny', SZOVEG_MAX, errors),
    gerd: szam(fd, b, 'gerd', { min: 0, max: 100, tizedes: 2 }, errors),
    strategia: szoveg(fd, b, 'strategia', ROVID_MAX, errors),
    prioritasok: lista(fd, 'prioritasok', KFI_PRIORITASOK),
    prioritasEgyeb: szoveg(fd, b, 'prioritasEgyeb', ROVID_MAX, errors),
    kiemeltIparagak: lista(fd, 'kiemeltIparagak', IPARAGAK),
    iparagEgyeb: szoveg(fd, b, 'iparagEgyeb', ROVID_MAX, errors),
    erossegek: szoveg(fd, b, 'erossegek', SZOVEG_MAX, errors),
    kihivasok: szoveg(fd, b, 'kihivasok', SZOVEG_MAX, errors),
  };
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, ertek };
}

function intezmenyek(fd: FormData): ValidalasEredmeny<'intezmenyek'> {
  const errors: MezoHibak = {};
  const b = 'intezmenyek';
  const ertek: Intezmenyek = {
    iranyitoSzervek: szoveg(fd, b, 'iranyitoSzervek', SZOVEG_MAX, errors),
    egyetemek: szoveg(fd, b, 'egyetemek', SZOVEG_MAX, errors),
    kutatokozpontok: szoveg(fd, b, 'kutatokozpontok', SZOVEG_MAX, errors),
    infrastrukturak: szoveg(fd, b, 'infrastrukturak', SZOVEG_MAX, errors),
  };
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, ertek };
}

function vallalati(fd: FormData): ValidalasEredmeny<'vallalati'> {
  const errors: MezoHibak = {};
  const b = 'vallalati';
  const sorok = mezo(fd, 'topVallalatok').split('\n').map((s) => s.trim()).filter(Boolean);
  if (sorok.length > TOP_VALLALAT_MAX) errors.topVallalatok = `Legfeljebb ${TOP_VALLALAT_MAX} vállalat adható meg.`;
  else if (sorok.some((s) => s.length > ROVID_MAX)) errors.topVallalatok = `Egy vállalatnév legfeljebb ${ROVID_MAX} karakter.`;
  const ertek: Vallalati = {
    kiemeltAgazatok: lista(fd, 'kiemeltAgazatok', IPARAGAK),
    agazatEgyeb: szoveg(fd, b, 'agazatEgyeb', ROVID_MAX, errors),
    topVallalatok: sorok,
    startupok: szoveg(fd, b, 'startupok', SZOVEG_MAX, errors),
    klaszterek: szoveg(fd, b, 'klaszterek', SZOVEG_MAX, errors),
    technologiatranszfer: szoveg(fd, b, 'technologiatranszfer', SZOVEG_MAX, errors),
  };
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, ertek };
}

function programok(fd: FormData): ValidalasEredmeny<'programok'> {
  const errors: MezoHibak = {};
  const b = 'programok';
  const ertek: Programok = {
    palyazatok: szoveg(fd, b, 'palyazatok', SZOVEG_MAX, errors),
    tamogatasiProgramok: szoveg(fd, b, 'tamogatasiProgramok', SZOVEG_MAX, errors),
    finanszirozasiEszkozok: szoveg(fd, b, 'finanszirozasiEszkozok', SZOVEG_MAX, errors),
    nemzetkoziReszvetel: szoveg(fd, b, 'nemzetkoziReszvetel', SZOVEG_MAX, errors),
  };
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, ertek };
}

function rendezvenyek(fd: FormData): ValidalasEredmeny<'rendezvenyek'> {
  const errors: MezoHibak = {};
  const sorok: Rendezveny[] = [];
  for (let i = 0; i < RENDEZVENY_MAX; i++) {
    const p = `rendezveny.${i}.`;
    const nev = mezo(fd, p + 'nev');
    const tipusRaw = mezo(fd, p + 'tipus');
    const idopont = mezo(fd, p + 'idopont');
    const megjegyzes = mezo(fd, p + 'megjegyzes');
    if (!nev && !idopont && !megjegyzes) continue;
    if (!nev) errors[p + 'nev'] = 'A rendezvény neve kötelező.';
    if (nev.length > ROVID_MAX) errors[p + 'nev'] = `A név legfeljebb ${ROVID_MAX} karakter.`;
    if (idopont.length > ROVID_MAX) errors[p + 'idopont'] = `Az időpont legfeljebb ${ROVID_MAX} karakter.`;
    if (megjegyzes.length > ROVID_MAX) errors[p + 'megjegyzes'] = `A megjegyzés legfeljebb ${ROVID_MAX} karakter.`;
    sorok.push({ nev, tipus: rendezvenyTipus(tipusRaw), idopont, megjegyzes });
  }
  const ertek: Rendezvenyek = { lista: sorok };
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, ertek };
}

function kapcsolatok(fd: FormData): ValidalasEredmeny<'kapcsolatok'> {
  const errors: MezoHibak = {};
  const b = 'kapcsolatok';
  const ertek: Kapcsolatok = {
    euMultilateralis: szoveg(fd, b, 'euMultilateralis', SZOVEG_MAX, errors),
    partnerorszagok: szoveg(fd, b, 'partnerorszagok', SZOVEG_MAX, errors),
    egyezmeny: szoveg(fd, b, 'egyezmeny', ROVID_MAX, errors),
    ketoldalu: szoveg(fd, b, 'ketoldalu', SZOVEG_MAX, errors),
    mobilitas: szoveg(fd, b, 'mobilitas', SZOVEG_MAX, errors),
  };
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, ertek };
}

function magyarErtekeles(fd: FormData): ValidalasEredmeny<'magyarErtekeles'> {
  const errors: MezoHibak = {};
  const b = 'magyarErtekeles';
  const ertek: MagyarErtekeles = {
    osszegzes: szoveg(fd, b, 'osszegzes', OSSZEGZES_MAX, errors),
    egyuttmukodesiLehetosegek: szoveg(fd, b, 'egyuttmukodesiLehetosegek', SZOVEG_MAX, errors),
    joGyakorlatok: szoveg(fd, b, 'joGyakorlatok', SZOVEG_MAX, errors),
    diplomaciaiPrioritasok: szoveg(fd, b, 'diplomaciaiPrioritasok', SZOVEG_MAX, errors),
  };
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, ertek };
}

/** Egy blokk validálása. Az `aktualisEv` az adatév felső határa. */
export function validalBlokk<K extends BlokkKulcs>(blokk: K, fd: FormData, aktualisEv: number): ValidalasEredmeny<K> {
  switch (blokk) {
    case 'alapadatok': return alapadatok(fd, aktualisEv) as ValidalasEredmeny<K>;
    case 'kfiRendszer': return kfiRendszer(fd) as ValidalasEredmeny<K>;
    case 'intezmenyek': return intezmenyek(fd) as ValidalasEredmeny<K>;
    case 'vallalati': return vallalati(fd) as ValidalasEredmeny<K>;
    case 'programok': return programok(fd) as ValidalasEredmeny<K>;
    case 'rendezvenyek': return rendezvenyek(fd) as ValidalasEredmeny<K>;
    case 'kapcsolatok': return kapcsolatok(fd) as ValidalasEredmeny<K>;
    default: return magyarErtekeles(fd) as ValidalasEredmeny<K>;
  }
}
```

- [ ] **Step 2: Ellenőrzés**

`scripts/_x.ts`:

```ts
import { validalBlokk } from '../lib/orszagprofil-validacio';
const fd = new FormData();
fd.set('lakossag', '51 700 000'); fd.set('gdp', '1.712,5'); fd.set('gdpNovekedes', '2,1'); fd.set('adatEv', '2030');
fd.append('tagsagok', 'OECD'); fd.append('tagsagok', 'XX'); fd.append('tagsagok', 'OECD');
console.log(JSON.stringify(validalBlokk('alapadatok', fd, 2026)));
const fd2 = new FormData();
fd2.set('lakossag', '51 700 000'); fd2.set('gdp', '1.712,5'); fd2.set('gdpNovekedes', '2,1');
console.log(JSON.stringify(validalBlokk('alapadatok', fd2, 2026)));
const fd3 = new FormData();
fd3.set('rendezveny.0.nev', 'CES'); fd3.set('rendezveny.0.tipus', 'szakkiallitas');
fd3.set('rendezveny.1.idopont', 'május'); fd3.set('rendezveny.3.nev', 'X'); fd3.set('rendezveny.3.tipus', 'zzz');
console.log(JSON.stringify(validalBlokk('rendezvenyek', fd3, 2026)));
const fd4 = new FormData(); fd4.set('topVallalatok', Array.from({ length: 11 }, (_, i) => `C${i}`).join('\n'));
console.log(JSON.stringify(validalBlokk('vallalati', fd4, 2026)));
```

Run: `npx tsx scripts/_x.ts` →
1. `{"ok":false,"errors":{"adatEv":"Adatév: egész szám, 2010 és 2026 között."}}`
2. `{"ok":true,"ertek":{"lakossag":51700000,"gdp":1712.5,"gdpEgyFore":null,"gdpNovekedes":2.1,…,"tagsagok":[],…}}`
3. `{"ok":false,"errors":{"rendezveny.1.nev":"A rendezvény neve kötelező."}}`
4. `{"ok":false,"errors":{"topVallalatok":"Legfeljebb 10 vállalat adható meg."}}`

Módosítsd a 3. esetet úgy, hogy az 1-es sor kapjon nevet, és ellenőrizd: a lista két elemű, a 3-as sor típusa `forum`. `rm scripts/_x.ts`; `npx tsc --noEmit`.

- [ ] **Step 3: Commit**

```bash
git add lib/orszagprofil-validacio.ts
git commit -m "feat(orszagprofil): blokkonkénti FormData-validátor

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 5: Server action

**Files:**
- Create: `app/(app)/orszagprofil/actions.ts`

- [ ] **Step 1: `mentBlokkAction`**

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { notFound, unstable_rethrow } from 'next/navigation';
import type { MuveletState } from '../../../components/form/useMuveletForm';
import { upsertBlokk } from '../../../db/queries/orszagprofil';
import { aktualisEv } from '../../../lib/datum';
import { orszagByKod } from '../../../lib/orszagok';
import { canEditProfil } from '../../../lib/orszagprofil-jog';
import { isBlokkKulcs } from '../../../lib/orszagprofil-szotar';
import { validalBlokk } from '../../../lib/orszagprofil-validacio';
import { requireSession } from '../../../lib/session';
import { mezo } from '../../../lib/urlap';

export type { MuveletState };

/**
 * Egy blokk mentése. Rejtett mezők: kod, ev, blokk. Sorrend: session → kód/blokk létezik
 * → jog → validálás → upsert. Jogosultsági és „nem létezik" hiba egyaránt 404, mint a
 * riportnál: nem áruljuk el, mi van a másik oldalon.
 */
export async function mentBlokkAction(_prev: MuveletState, formData: FormData): Promise<MuveletState> {
  const session = await requireSession();
  const kod = mezo(formData, 'kod');
  const blokk = mezo(formData, 'blokk');
  const ev = Number(mezo(formData, 'ev'));
  if (!orszagByKod(kod) || !isBlokkKulcs(blokk)) notFound();
  const most = aktualisEv();
  if (!canEditProfil(session, kod, ev, most)) notFound();

  const eredmeny = validalBlokk(blokk, formData, most);
  // A szerkesztő oldalon 8 blokk van egy DOM-ban, a mező id-ja ezért `<blokk>.<mezo>`
  // (a name a puszta mezőnév). A hibakulcs = id, hogy a useMuveletForm a jó blokkra fókuszáljon.
  if (!eredmeny.ok) {
    return { errors: Object.fromEntries(Object.entries(eredmeny.errors).map(([k, v]) => [`${blokk}.${k}`, v])) };
  }

  try {
    upsertBlokk(kod, ev, blokk, eredmeny.ertek, session.userId);
  } catch (err) {
    unstable_rethrow(err);
    console.error('[orszagprofil] upsertBlokk sikertelen:', err);
    return { errors: { form: 'Mentés sikertelen, próbáld újra.' } };
  }
  revalidatePath('/terkep');
  revalidatePath(`/orszagprofil/${kod}`);
  revalidatePath(`/orszagprofil/${kod}/szerkesztes`);
  return { ok: true };
}
```

Run: `npx tsc --noEmit`. (Böngészős próba a Task 7 végén.)

- [ ] **Step 2: Commit**

```bash
git add "app/(app)/orszagprofil/actions.ts"
git commit -m "feat(orszagprofil): mentBlokkAction (session → jog → validálás → upsert)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 6: Általános form-építőelemek

**Files:**
- Create: `components/form/Mezo.tsx`
- Create: `components/form/CimkeValaszto.tsx`
- Create: `components/form/SzamMezo.tsx`

- [ ] **Step 1: `components/form/Mezo.tsx`** – címke + mező + hiba, szöveg- és rövid-mező változat

```tsx
'use client';

import type { ReactNode } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import type { MezoHibak } from '../../lib/urlap';
import { hibaAttr, MezoHiba } from './MezoHiba';

/**
 * Címke + opcionális súgó + mező + hibaüzenet; a hiba kulcsa a mező id-ja. Konvenció az
 * országprofil-űrlapokon: az `id` = `<blokk>.<mezo>` (egyedi a több blokkos oldalon, erre
 * fókuszál a useMuveletForm), a `name` = a puszta mezőnév (ezt olvassa a validátor).
 */
export function Mezo({
  id, cimke, sugo, errors, children, className,
}: {
  id: string; cimke: string; sugo?: string; errors: MezoHibak; children: ReactNode; className?: string;
}) {
  return (
    <div className={className ?? 'flex flex-col gap-1.5'}>
      <Label id={`${id}-label`} htmlFor={id}>{cimke}</Label>
      {sugo && <p id={`${id}-sugo`} className="text-xs text-muted-foreground">{sugo}</p>}
      {children}
      <MezoHiba mezo={id} errors={errors} />
    </div>
  );
}

/** Többsoros szövegmező (vezérelt). */
export function SzovegMezo({
  id, name, cimke, sugo, value, onChange, max, errors, sorok = 4,
}: {
  id: string; name: string; cimke: string; sugo?: string; value: string; onChange: (v: string) => void;
  max: number; errors: MezoHibak; sorok?: number;
}) {
  return (
    <Mezo id={id} cimke={cimke} sugo={sugo} errors={errors}>
      <Textarea id={id} name={name} rows={sorok} maxLength={max} value={value}
        onChange={(e) => onChange(e.target.value)} {...hibaAttr(errors, id)} />
    </Mezo>
  );
}

/** Egysoros szövegmező (vezérelt). */
export function RovidMezo({
  id, name, cimke, sugo, value, onChange, max, errors, placeholder,
}: {
  id: string; name: string; cimke: string; sugo?: string; value: string; onChange: (v: string) => void;
  max: number; errors: MezoHibak; placeholder?: string;
}) {
  return (
    <Mezo id={id} cimke={cimke} sugo={sugo} errors={errors}>
      <Input id={id} name={name} maxLength={max} autoComplete="off" placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)} {...hibaAttr(errors, id)} />
    </Mezo>
  );
}
```

- [ ] **Step 2: `components/form/SzamMezo.tsx`** – vezérelt számmező utótaggal (az érték string, a validátor parse-ol)

```tsx
'use client';

import { Input } from '../ui/input';
import type { MezoHibak } from '../../lib/urlap';
import { hibaAttr } from './MezoHiba';
import { Mezo } from './Mezo';

export function SzamMezo({
  id, name, cimke, sugo, value, onChange, errors, utotag, placeholder,
}: {
  id: string; name: string; cimke: string; sugo?: string; value: string; onChange: (v: string) => void;
  errors: MezoHibak; utotag?: string; placeholder?: string;
}) {
  return (
    <Mezo id={id} cimke={cimke} sugo={sugo} errors={errors}>
      <div className="flex items-center gap-2">
        <Input id={id} name={name} inputMode="decimal" maxLength={20} autoComplete="off" placeholder={placeholder}
          value={value} onChange={(e) => onChange(e.target.value)} className="max-w-48" {...hibaAttr(errors, id)} />
        {utotag && <span className="text-sm text-muted-foreground">{utotag}</span>}
      </div>
    </Mezo>
  );
}
```

- [ ] **Step 3: `components/form/CimkeValaszto.tsx`** – a `KulcsszoValaszto` általánosítása: `items`, `name`, egy rejtett input értékenként (`fd.getAll(name)`), plusz „egyéb" mező

Másold a `components/riport/KulcsszoValaszto.tsx` teljes tartalmát, és alakítsd így (a Combobox-szerkezet és az `onKeyDown` Escape-kezelés változatlan marad):

```tsx
'use client';

import {
  Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty,
  ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor,
} from '../ui/combobox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState } from 'react';
import type { MezoHibak } from '../../lib/urlap';
import { hibaAttr, MezoHiba } from './MezoHiba';

/**
 * Többes választás fix listából (Combobox chips) + opcionális „egyéb" szabadszöveg. A
 * kiválasztott értékek egyenként rejtett inputban mennek (`name` többször) → a validátor
 * `fd.getAll(name)`-mel olvassa. A beviteli mező id-ja = `id` (ide fókuszál a hook).
 */
export function CimkeValaszto<T extends string>({
  id, name, cimke, sugo, items, value, onChange, errors, egyeb,
}: {
  id: string; name: string; cimke: string; sugo?: string; items: readonly T[];
  value: T[]; onChange: (v: T[]) => void; errors: MezoHibak;
  /** „Egyéb" mező: id/name + vezérelt érték. */
  egyeb?: { id: string; name: string; cimke: string; value: string; onChange: (v: string) => void; max: number };
}) {
  const anchor = useComboboxAnchor();
  const [nyitva, setNyitva] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <Label id={`${id}-label`} htmlFor={id}>{cimke}</Label>
      {sugo && <p className="text-xs text-muted-foreground">{sugo}</p>}
      {value.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      <Combobox multiple items={items} value={value} onValueChange={(v) => onChange(v as T[])} onOpenChange={setNyitva}>
        <ComboboxChips ref={anchor} id={`${id}-doboz`} tabIndex={-1} className="cursor-text">
          <ComboboxValue>
            {(kivalasztott: T[]) => (
              <>
                {kivalasztott.map((k) => (
                  <ComboboxChip key={k} aria-label={k} aria-description="Backspace vagy Delete az eltávolításhoz" removeLabel={`${k} eltávolítása`}>
                    {k}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id={id}
                  placeholder={kivalasztott.length === 0 ? 'Válassz a listából…' : ''}
                  aria-labelledby={`${id}-label`}
                  {...hibaAttr(errors, id)}
                  onKeyDown={(e) => { if (e.key === 'Escape' && !nyitva) e.preventBaseUIHandler(); }}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>Nincs ilyen elem.</ComboboxEmpty>
          <ComboboxList>{(k: T) => <ComboboxItem key={k} value={k}>{k}</ComboboxItem>}</ComboboxList>
        </ComboboxContent>
      </Combobox>
      <MezoHiba mezo={id} errors={errors} />
      {egyeb && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={egyeb.id} className="text-xs text-muted-foreground">{egyeb.cimke}</Label>
          <Input id={egyeb.id} name={egyeb.name} maxLength={egyeb.max} autoComplete="off" value={egyeb.value}
            onChange={(e) => egyeb.onChange(e.target.value)} {...hibaAttr(errors, egyeb.id)} />
          <MezoHiba mezo={egyeb.id} errors={errors} />
        </div>
      )}
    </div>
  );
}
```

Run: `npx tsc --noEmit` → hibátlan (a `KulcsszoValaszto` a helyén marad).

- [ ] **Step 4: Commit**

```bash
git add components/form/Mezo.tsx components/form/SzamMezo.tsx components/form/CimkeValaszto.tsx
git commit -m "feat(form): Mezo/SzovegMezo/RovidMezo, SzamMezo, CimkeValaszto általános építőelemek

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 7: Szerkesztő oldal – blokk-formok

**Files:**
- Create: `app/(app)/orszagprofil/components/BlokkForm.tsx`
- Create: `app/(app)/orszagprofil/components/RendezvenySorok.tsx`
- Create: `app/(app)/orszagprofil/components/mezok/AlapadatokMezok.tsx`, `KfiRendszerMezok.tsx`, `IntezmenyekMezok.tsx`, `VallalatiMezok.tsx`, `ProgramokMezok.tsx`, `RendezvenyekMezok.tsx`, `KapcsolatokMezok.tsx`, `MagyarErtekelesMezok.tsx`
- Create: `app/(app)/orszagprofil/components/EvValaszto.tsx`
- Create: `app/(app)/orszagprofil/[kod]/szerkesztes/page.tsx`

Minta: minden blokk kliens komponens, a teljes blokk-értéket egy `useState`-ben tartja (vezérelt mezők – a React 19 sikeres action után az uncontrolled mezőket alaphelyzetbe állítaná), a számokat stringként (`szamStr`). A `BlokkForm` a közös kártya-váz: fejléc (cím, „Mentve: …"), `<form action>` a `useMuveletForm`-mal, rejtett `kod`/`ev`/`blokk`, űrlap-szintű hiba, Mentés gomb.

- [ ] **Step 1: `BlokkForm.tsx`**

```tsx
'use client';

import type { ReactNode } from 'react';
import { MezoHiba } from '../../../../components/form/MezoHiba';
import { useMuveletForm, type FormAction } from '../../../../components/form/useMuveletForm';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/card';
import type { MezoHibak } from '../../../../lib/urlap';
import { blokkCim, type BlokkKulcs } from '../../../../lib/orszagprofil-szotar';

export interface BlokkFormProps {
  kod: string;
  ev: number;
  blokk: BlokkKulcs;
  /** „Mentve: 2026. 09. 10. 14:02" vagy null, ha még nincs mentve. */
  mentve: string | null;
  action: FormAction;
  /** A mezők; a render-prop az aktuális hibatérképet kapja. */
  children: (errors: MezoHibak) => ReactNode;
}

export function BlokkForm({ kod, ev, blokk, mentve, action, children }: BlokkFormProps) {
  const [state, formAction, pending] = useMuveletForm(action, 'Blokk mentve');
  const errors = state.errors ?? {};
  return (
    <Card>
      <form action={formAction} className="contents">
        <input type="hidden" name="kod" value={kod} />
        <input type="hidden" name="ev" value={ev} />
        <input type="hidden" name="blokk" value={blokk} />
        <CardHeader>
          <CardTitle>{blokkCim(blokk)}</CardTitle>
          <CardDescription>{mentve ? `Mentve: ${mentve}` : 'Még nincs kitöltve'}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">{children(errors)}</CardContent>
        <CardFooter className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>{pending ? 'Mentés…' : 'Mentés'}</Button>
          <MezoHiba mezo="form" errors={errors} alert />
        </CardFooter>
      </form>
    </Card>
  );
}

/** Szám → űrlap-string (tizedesvesszővel); null → ''. */
export function szamStr(n: number | null): string {
  return n === null ? '' : String(n).replace('.', ',');
}
```

Konvenció (Task 5 és 6 már így készült): a mező `id`-ja `<blokk>.<mezo>` (egyedi a 8 blokkos DOM-ban, erre fókuszál a `useMuveletForm`, és az action ilyen kulccsal adja a hibát), a `name` a puszta mezőnév (a validátor azt olvassa). A rendezvény-sorok hibakulcsa így `rendezvenyek.rendezveny.0.nev`.

Segéd az id-hoz, a `BlokkForm.tsx`-be:

```ts
export function mezoId(blokk: BlokkKulcs, name: string): string {
  return `${blokk}.${name}`;
}
```

- [ ] **Step 2: `RendezvenySorok.tsx`**

```tsx
'use client';

import { hibaAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import type { MezoHibak } from '../../../../lib/urlap';
import { RENDEZVENY_MAX, RENDEZVENY_TIPUSOK, ROVID_MAX, type Rendezveny, type RendezvenyTipus } from '../../../../lib/orszagprofil-szotar';

const URES: Rendezveny = { nev: '', tipus: 'konferencia', idopont: '', megjegyzes: '' };

/** Hozzáadható/törölhető rendezvény-sorok; mezőnevek `rendezveny.<i>.<mezo>`, id-k `rendezvenyek.rendezveny.<i>.<mezo>`. */
export function RendezvenySorok({ value, onChange, errors }: { value: Rendezveny[]; onChange: (v: Rendezveny[]) => void; errors: MezoHibak }) {
  const set = (i: number, patch: Partial<Rendezveny>) => onChange(value.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const id = (i: number, m: keyof Rendezveny) => `rendezvenyek.rendezveny.${i}.${m}`;
  return (
    <div className="flex flex-col gap-4">
      {value.map((r, i) => (
        <fieldset key={i} className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-2">
          <legend className="px-1 text-xs text-muted-foreground">{i + 1}. rendezvény</legend>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={id(i, 'nev')}>Név</Label>
            <Input id={id(i, 'nev')} name={`rendezveny.${i}.nev`} maxLength={ROVID_MAX} value={r.nev}
              onChange={(e) => set(i, { nev: e.target.value })} {...hibaAttr(errors, id(i, 'nev'))} />
            <MezoHiba mezo={id(i, 'nev')} errors={errors} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={id(i, 'tipus')}>Típus</Label>
            <select id={id(i, 'tipus')} name={`rendezveny.${i}.tipus`} value={r.tipus}
              onChange={(e) => set(i, { tipus: e.target.value as RendezvenyTipus })}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50">
              {RENDEZVENY_TIPUSOK.map((t) => <option key={t.kulcs} value={t.kulcs}>{t.cimke}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={id(i, 'idopont')}>Időpont</Label>
            <Input id={id(i, 'idopont')} name={`rendezveny.${i}.idopont`} maxLength={ROVID_MAX} placeholder="pl. évente október" value={r.idopont}
              onChange={(e) => set(i, { idopont: e.target.value })} {...hibaAttr(errors, id(i, 'idopont'))} />
            <MezoHiba mezo={id(i, 'idopont')} errors={errors} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={id(i, 'megjegyzes')}>Megjegyzés</Label>
            <Input id={id(i, 'megjegyzes')} name={`rendezveny.${i}.megjegyzes`} maxLength={ROVID_MAX} value={r.megjegyzes}
              onChange={(e) => set(i, { megjegyzes: e.target.value })} {...hibaAttr(errors, id(i, 'megjegyzes'))} />
            <MezoHiba mezo={id(i, 'megjegyzes')} errors={errors} />
          </div>
          <div className="sm:col-span-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onChange(value.filter((_, j) => j !== i))}>Sor törlése</Button>
          </div>
        </fieldset>
      ))}
      <div>
        <Button type="button" variant="outline" size="sm" disabled={value.length >= RENDEZVENY_MAX} onClick={() => onChange([...value, URES])}>
          Rendezvény hozzáadása
        </Button>
        {value.length >= RENDEZVENY_MAX && <span className="ml-2 text-xs text-muted-foreground">Legfeljebb {RENDEZVENY_MAX} rendezvény.</span>}
      </div>
    </div>
  );
}
```

Törléskor a sorok indexe eltolódik, a rejtett mezőnevek újraszámozódnak – a validátor indexenként olvas, ez rendben van.

- [ ] **Step 3: A nyolc mező-komponens**

Közös alak: `export function XMezok({ kod, ev, initial, mentve, action })` – a `BlokkForm`-ot rendereli, benne a mezőket, a saját `useState`-tel. Az `initial` a normalizált blokk (`uresBlokk`, ha nincs mentve).

`mezok/AlapadatokMezok.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { CimkeValaszto } from '../../../../../components/form/CimkeValaszto';
import { RovidMezo } from '../../../../../components/form/Mezo';
import { SzamMezo } from '../../../../../components/form/SzamMezo';
import type { FormAction } from '../../../../../components/form/useMuveletForm';
import { GAZDASAGI_AGAZATOK, MEZO_CIMKEK, ROVID_MAX, TAGSAGOK, type Alapadatok } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId, szamStr } from '../BlokkForm';

const C = MEZO_CIMKEK.alapadatok;
const B = 'alapadatok';

export function AlapadatokMezok({ kod, ev, initial, mentve, action }: { kod: string; ev: number; initial: Alapadatok; mentve: string | null; action: FormAction }) {
  const [e, setE] = useState({
    ...initial,
    lakossag: szamStr(initial.lakossag), gdp: szamStr(initial.gdp), gdpEgyFore: szamStr(initial.gdpEgyFore),
    gdpNovekedes: szamStr(initial.gdpNovekedes), adatEv: szamStr(initial.adatEv),
  });
  const set = <K extends keyof typeof e>(k: K) => (v: (typeof e)[K]) => setE((p) => ({ ...p, [k]: v }));
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <SzamMezo id={mezoId(B, 'lakossag')} name="lakossag" cimke={C.lakossag.cimke} value={e.lakossag} onChange={set('lakossag')} errors={errors} utotag="fő" />
            <SzamMezo id={mezoId(B, 'gdp')} name="gdp" cimke={C.gdp.cimke} value={e.gdp} onChange={set('gdp')} errors={errors} utotag="mrd USD" />
            <SzamMezo id={mezoId(B, 'gdpEgyFore')} name="gdpEgyFore" cimke={C.gdpEgyFore.cimke} value={e.gdpEgyFore} onChange={set('gdpEgyFore')} errors={errors} utotag="USD" />
            <SzamMezo id={mezoId(B, 'gdpNovekedes')} name="gdpNovekedes" cimke={C.gdpNovekedes.cimke} value={e.gdpNovekedes} onChange={set('gdpNovekedes')} errors={errors} utotag="%" />
            <SzamMezo id={mezoId(B, 'adatEv')} name="adatEv" cimke={C.adatEv.cimke} sugo={C.adatEv.sugo} value={e.adatEv} onChange={set('adatEv')} errors={errors} />
            <RovidMezo id={mezoId(B, 'forras')} name="forras" cimke={C.forras.cimke} sugo={C.forras.sugo} value={e.forras} onChange={set('forras')} max={ROVID_MAX} errors={errors} />
          </div>
          <CimkeValaszto id={mezoId(B, 'tagsagok')} name="tagsagok" cimke={C.tagsagok.cimke} items={TAGSAGOK} value={e.tagsagok} onChange={set('tagsagok')} errors={errors}
            egyeb={{ id: mezoId(B, 'tagsagEgyeb'), name: 'tagsagEgyeb', cimke: C.tagsagEgyeb.cimke, value: e.tagsagEgyeb, onChange: set('tagsagEgyeb'), max: ROVID_MAX }} />
          <CimkeValaszto id={mezoId(B, 'agazatok')} name="agazatok" cimke={C.agazatok.cimke} items={GAZDASAGI_AGAZATOK} value={e.agazatok} onChange={set('agazatok')} errors={errors}
            egyeb={{ id: mezoId(B, 'agazatEgyeb'), name: 'agazatEgyeb', cimke: C.agazatEgyeb.cimke, value: e.agazatEgyeb, onChange: set('agazatEgyeb'), max: ROVID_MAX }} />
        </>
      )}
    </BlokkForm>
  );
}
```

`mezok/KfiRendszerMezok.tsx` – ugyanez a váz, a mezők:

```tsx
          <SzovegMezo id={mezoId(B, 'teljesitmeny')} name="teljesitmeny" cimke={C.teljesitmeny.cimke} sugo={C.teljesitmeny.sugo} value={e.teljesitmeny} onChange={set('teljesitmeny')} max={SZOVEG_MAX} errors={errors} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SzamMezo id={mezoId(B, 'gerd')} name="gerd" cimke={C.gerd.cimke} value={e.gerd} onChange={set('gerd')} errors={errors} utotag="%" />
            <RovidMezo id={mezoId(B, 'strategia')} name="strategia" cimke={C.strategia.cimke} sugo={C.strategia.sugo} value={e.strategia} onChange={set('strategia')} max={ROVID_MAX} errors={errors} />
          </div>
          <CimkeValaszto id={mezoId(B, 'prioritasok')} name="prioritasok" cimke={C.prioritasok.cimke} items={KFI_PRIORITASOK} value={e.prioritasok} onChange={set('prioritasok')} errors={errors}
            egyeb={{ id: mezoId(B, 'prioritasEgyeb'), name: 'prioritasEgyeb', cimke: C.prioritasEgyeb.cimke, value: e.prioritasEgyeb, onChange: set('prioritasEgyeb'), max: ROVID_MAX }} />
          <CimkeValaszto id={mezoId(B, 'kiemeltIparagak')} name="kiemeltIparagak" cimke={C.kiemeltIparagak.cimke} sugo={C.kiemeltIparagak.sugo} items={IPARAGAK} value={e.kiemeltIparagak} onChange={set('kiemeltIparagak')} errors={errors}
            egyeb={{ id: mezoId(B, 'iparagEgyeb'), name: 'iparagEgyeb', cimke: C.iparagEgyeb.cimke, value: e.iparagEgyeb, onChange: set('iparagEgyeb'), max: ROVID_MAX }} />
          <SzovegMezo id={mezoId(B, 'erossegek')} name="erossegek" cimke={C.erossegek.cimke} value={e.erossegek} onChange={set('erossegek')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'kihivasok')} name="kihivasok" cimke={C.kihivasok.cimke} value={e.kihivasok} onChange={set('kihivasok')} max={SZOVEG_MAX} errors={errors} />
```

(state: `{ ...initial, gerd: szamStr(initial.gerd) }`, `B = 'kfiRendszer'`, `C = MEZO_CIMKEK.kfiRendszer`.)

`mezok/IntezmenyekMezok.tsx` (`B = 'intezmenyek'`): négy `SzovegMezo` – `iranyitoSzervek` (sugóval), `egyetemek`, `kutatokozpontok`, `infrastrukturak`, mind `max={SZOVEG_MAX}`. State: `useState(initial)`.

`mezok/VallalatiMezok.tsx` (`B = 'vallalati'`): state `{ ...initial, topVallalatok: initial.topVallalatok.join('\n') }`; mezők: `CimkeValaszto` `kiemeltAgazatok` (items `IPARAGAK`, egyéb `agazatEgyeb`), `SzovegMezo` `topVallalatok` (sugo, `max={ROVID_MAX * TOP_VALLALAT_MAX + TOP_VALLALAT_MAX}`, `sorok={10}`), `SzovegMezo` `startupok`, `klaszterek`, `technologiatranszfer`.

`mezok/ProgramokMezok.tsx` (`B = 'programok'`): négy `SzovegMezo` – `palyazatok`, `tamogatasiProgramok`, `finanszirozasiEszkozok`, `nemzetkoziReszvetel`.

`mezok/RendezvenyekMezok.tsx` (`B = 'rendezvenyek'`): state `useState(initial.lista)`; a `BlokkForm` gyermeke:

```tsx
      {(errors) => (
        <>
          <p className="text-xs text-muted-foreground">{MEZO_CIMKEK.rendezvenyek.lista.sugo}</p>
          <RendezvenySorok value={lista} onChange={setLista} errors={errors} />
        </>
      )}
```

`mezok/KapcsolatokMezok.tsx` (`B = 'kapcsolatok'`): `SzovegMezo` `euMultilateralis`, `partnerorszagok`; `RovidMezo` `egyezmeny` (sugóval, `max={ROVID_MAX}`); `SzovegMezo` `ketoldalu`, `mobilitas` (sugóval).

`mezok/MagyarErtekelesMezok.tsx` (`B = 'magyarErtekeles'`): `SzovegMezo` `osszegzes` (sugo, `max={OSSZEGZES_MAX}`, `sorok={3}`), `egyuttmukodesiLehetosegek`, `joGyakorlatok`, `diplomaciaiPrioritasok`.

Minden fájl: `'use client'`, `useState`, a `BlokkForm`/`mezoId`/`szamStr` import a `../BlokkForm`-ból, a mezők a `components/form/` alól, a szótár a `lib/orszagprofil-szotar`-ból; a `set` segéd ugyanaz, mint az `AlapadatokMezok`-ban.

- [ ] **Step 4: `EvValaszto.tsx`** – `?ev=` navigáció

```tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

export function EvValaszto({ evek, ertek }: { evek: number[]; ertek: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const items = Object.fromEntries(evek.map((e) => [String(e), String(e)]));
  return (
    <div className="flex items-center gap-2">
      <Label id="ev-label" htmlFor="ev">Év</Label>
      <Select value={String(ertek)} items={items} onValueChange={(v) => { if (v) router.push(`${pathname}?ev=${v}`); }}>
        <SelectTrigger id="ev" aria-labelledby="ev-label ev" className="w-28"><SelectValue /></SelectTrigger>
        <SelectContent>
          {evek.map((e) => <SelectItem key={e} value={String(e)}>{e}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
```

- [ ] **Step 5: `evParam` a szótárba** (a Task 2-ben már elkészült – ellenőrizd, hogy megvan, és lépj tovább)

`lib/orszagprofil-szotar.ts` végén (tiszta függvény, a nézet és a szerkesztő page is használja):

```ts
/** `?ev=` search param → négyjegyű egész, különben az alapértelmezett. */
export function evParam(raw: string | string[] | undefined, alap: number): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v && /^\d{4}$/.test(v) ? Number(v) : alap;
}
```

- [ ] **Step 6: `[kod]/szerkesztes/page.tsx`**

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buttonVariants } from '../../../../../components/ui/button';
import { getProfil } from '../../../../../db/queries/orszagprofil';
import { aktualisEv, formatDatumIdo } from '../../../../../lib/datum';
import { orszagByKod } from '../../../../../lib/orszagok';
import { canEditProfil } from '../../../../../lib/orszagprofil-jog';
import { EV_MIN, evParam, uresBlokk } from '../../../../../lib/orszagprofil-szotar';
import { requireSession } from '../../../../../lib/session';
import { cn } from '../../../../../lib/utils';
import { mentBlokkAction } from '../../actions';
import { EvValaszto } from '../../components/EvValaszto';
import { AlapadatokMezok } from '../../components/mezok/AlapadatokMezok';
import { KfiRendszerMezok } from '../../components/mezok/KfiRendszerMezok';
import { IntezmenyekMezok } from '../../components/mezok/IntezmenyekMezok';
import { VallalatiMezok } from '../../components/mezok/VallalatiMezok';
import { ProgramokMezok } from '../../components/mezok/ProgramokMezok';
import { RendezvenyekMezok } from '../../components/mezok/RendezvenyekMezok';
import { KapcsolatokMezok } from '../../components/mezok/KapcsolatokMezok';
import { MagyarErtekelesMezok } from '../../components/mezok/MagyarErtekelesMezok';

export const metadata: Metadata = { title: 'Országprofil szerkesztése' };

export default async function SzerkesztesPage({
  params, searchParams,
}: { params: Promise<{ kod: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireSession();
  const { kod } = await params;
  const orszag = orszagByKod(kod);
  if (!orszag) notFound();
  const most = aktualisEv();
  const ev = evParam((await searchParams).ev, most);
  if (!canEditProfil(session, kod, ev, most)) notFound();

  const profil = getProfil(kod, ev);
  const mentve = profil ? formatDatumIdo(profil.updatedAt) : null;
  const m = (k: keyof NonNullable<typeof profil>['blokkok']) => (profil?.mentett.includes(k) ? mentve : null);
  const b = profil?.blokkok ?? {};
  const evek = session.role === 'admin' ? Array.from({ length: most - EV_MIN + 1 }, (_, i) => most - i) : [most];
  const kozos = { kod, ev, action: mentBlokkAction };

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">{orszag.nev} – profil szerkesztése</h2>
        <EvValaszto evek={evek} ertek={ev} />
        <Link href={`/orszagprofil/${kod}?ev=${ev}`} className={cn('ml-auto', buttonVariants({ variant: 'outline' }))}>Megtekintés</Link>
      </div>
      <p className="text-sm text-muted-foreground">Minden blokk külön menthető; a mentett blokkok azonnal megjelennek a térképen és a profil oldalon.</p>
      <AlapadatokMezok {...kozos} initial={b.alapadatok ?? uresBlokk('alapadatok')} mentve={m('alapadatok')} />
      <KfiRendszerMezok {...kozos} initial={b.kfiRendszer ?? uresBlokk('kfiRendszer')} mentve={m('kfiRendszer')} />
      <IntezmenyekMezok {...kozos} initial={b.intezmenyek ?? uresBlokk('intezmenyek')} mentve={m('intezmenyek')} />
      <VallalatiMezok {...kozos} initial={b.vallalati ?? uresBlokk('vallalati')} mentve={m('vallalati')} />
      <ProgramokMezok {...kozos} initial={b.programok ?? uresBlokk('programok')} mentve={m('programok')} />
      <RendezvenyekMezok {...kozos} initial={b.rendezvenyek ?? uresBlokk('rendezvenyek')} mentve={m('rendezvenyek')} />
      <KapcsolatokMezok {...kozos} initial={b.kapcsolatok ?? uresBlokk('kapcsolatok')} mentve={m('kapcsolatok')} />
      <MagyarErtekelesMezok {...kozos} initial={b.magyarErtekeles ?? uresBlokk('magyarErtekeles')} mentve={m('magyarErtekeles')} />
    </div>
  );
}
```

Run: `npx tsc --noEmit`.

- [ ] **Step 7: Böngészős ellenőrzés**

Attaséval (`teszt.attase@niu.hu`) `goto /orszagprofil/KR/szerkesztes`: 8 kártya, mind „Még nincs kitöltve". Alapadatok: lakosság `51 700 000`, GDP `1.712,5`, növekedés `2,1`, adatév `2030` → Mentés → hiba az adatév mezőn (fókusz ott), toast nincs. Javítás `2025` → toast „Blokk mentve", a kártya fejléce „Mentve: …". Újratöltés után az értékek visszatöltve (`51700000`, `1712,5`). KFI-rendszer: két kiemelt iparág + egyéb szöveg, mentés. Rendezvények: sor hozzáadása névvel, második sor csak időponttal → hiba a 2. sor nevén; javítva mentés. `goto /orszagprofil/JP/szerkesztes` → 404. `goto /orszagprofil/KR/szerkesztes?ev=2025` → 404 (attasé csak az idei évet). Adminnal `?ev=2025` → 200, évválasztóban 2020–2026. `console --errors` üres.

- [ ] **Step 8: Commit**

```bash
git add "app/(app)/orszagprofil/" lib/orszagprofil-szotar.ts
git commit -m "feat(orszagprofil): szerkesztő oldal – blokkonkénti formok, rendezvény-sorok, évválasztó

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 8: Teljes profil oldal és olvasó nézet

**Files:**
- Create: `components/orszagprofil/IparagBadge.tsx`, `components/orszagprofil/AllapotBadge.tsx`
- Create: `components/orszagprofil/BlokkNezet.tsx`
- Create: `app/(app)/orszagprofil/[kod]/page.tsx`

- [ ] **Step 1: Jelvények**

`components/orszagprofil/IparagBadge.tsx`:

```tsx
import { Badge } from '../ui/badge';
import { IPARAG_SZINEK, type Iparag } from '../../lib/orszagprofil-szotar';

/** Iparág-címke a szótár színével (a térképpel azonos). */
export function IparagBadge({ iparag }: { iparag: Iparag }) {
  const szin = IPARAG_SZINEK[iparag];
  return (
    <Badge variant="outline" style={{ color: szin, borderColor: `${szin}55`, background: `${szin}14` }}>
      {iparag}
    </Badge>
  );
}
```

`components/orszagprofil/AllapotBadge.tsx`:

```tsx
import { Badge } from '../ui/badge';
import { ALLAPOT_CIMKE, ALLAPOT_SZINEK, type Allapot } from '../../lib/orszagprofil-szotar';

export function AllapotBadge({ allapot, ev }: { allapot: Allapot; ev: number | null }) {
  const szin = ALLAPOT_SZINEK[allapot];
  return (
    <Badge variant="outline" style={{ color: szin, borderColor: `${szin}55`, background: `${szin}14` }}>
      {ALLAPOT_CIMKE[allapot]}{ev ? ` · ${ev}` : ''}
    </Badge>
  );
}
```

- [ ] **Step 2: `BlokkNezet.tsx`** – egy blokk olvasó nézete kártyában

```tsx
import type { ReactNode } from 'react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  blokkCim, MEZO_CIMKEK, rendezvenyTipusCimke, type BlokkKulcs, type ProfilBlokkok,
} from '../../lib/orszagprofil-szotar';
import { IparagBadge } from './IparagBadge';

const HU = new Intl.NumberFormat('hu-HU');
function szam(n: number | null, utotag = ''): string {
  return n === null ? '–' : `${HU.format(n)}${utotag}`;
}

function Sor({ cimke, children }: { cimke: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[220px_1fr]">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{cimke}</dt>
      <dd className="text-sm whitespace-pre-wrap">{children}</dd>
    </div>
  );
}
function Szoveg({ v }: { v: string }) {
  return v ? <>{v}</> : <span className="text-muted-foreground">–</span>;
}
function Cimkek({ lista, egyeb }: { lista: readonly string[]; egyeb?: string }) {
  if (lista.length === 0 && !egyeb) return <span className="text-muted-foreground">–</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {lista.map((x) => <Badge key={x} variant="secondary">{x}</Badge>)}
      {egyeb && <span className="text-sm">{egyeb}</span>}
    </span>
  );
}

/** A blokk tartalma mezőnként; `null` tartalom = „Még nincs kitöltve". */
export function BlokkNezet<K extends BlokkKulcs>({ kulcs, tartalom }: { kulcs: K; tartalom: ProfilBlokkok[K] | null }) {
  return (
    <Card id={kulcs}>
      <CardHeader>
        <CardTitle>{blokkCim(kulcs)}</CardTitle>
        {!tartalom && <CardDescription>Még nincs kitöltve</CardDescription>}
      </CardHeader>
      {tartalom && <CardContent><dl className="flex flex-col gap-3">{mezok(kulcs, tartalom)}</dl></CardContent>}
    </Card>
  );
}

// A MEZO_CIMKEK mezőnév szerint szigorúan típusos, ezért a `C` minden ágban a szűkített
// blokk-kulccsal jön (a switch előtt unió lenne, és nem lehetne mezőre indexelni).
function mezok(kulcs: BlokkKulcs, t: ProfilBlokkok[BlokkKulcs]): ReactNode {
  switch (kulcs) {
    case 'alapadatok': {
      const C = MEZO_CIMKEK.alapadatok;
      const b = t as ProfilBlokkok['alapadatok'];
      return (
        <>
          <Sor cimke={C.lakossag.cimke}>{szam(b.lakossag)}</Sor>
          <Sor cimke={C.gdp.cimke}>{szam(b.gdp)}</Sor>
          <Sor cimke={C.gdpEgyFore.cimke}>{szam(b.gdpEgyFore)}</Sor>
          <Sor cimke={C.gdpNovekedes.cimke}>{szam(b.gdpNovekedes, ' %')}</Sor>
          <Sor cimke={C.adatEv.cimke}>{b.adatEv ?? '–'}</Sor>
          <Sor cimke={C.forras.cimke}><Szoveg v={b.forras} /></Sor>
          <Sor cimke={C.tagsagok.cimke}><Cimkek lista={b.tagsagok} egyeb={b.tagsagEgyeb} /></Sor>
          <Sor cimke={C.agazatok.cimke}><Cimkek lista={b.agazatok} egyeb={b.agazatEgyeb} /></Sor>
        </>
      );
    }
    case 'kfiRendszer': {
      const C = MEZO_CIMKEK.kfiRendszer;
      const b = t as ProfilBlokkok['kfiRendszer'];
      return (
        <>
          <Sor cimke={C.teljesitmeny.cimke}><Szoveg v={b.teljesitmeny} /></Sor>
          <Sor cimke={C.gerd.cimke}>{szam(b.gerd, ' %')}</Sor>
          <Sor cimke={C.strategia.cimke}><Szoveg v={b.strategia} /></Sor>
          <Sor cimke={C.prioritasok.cimke}><Cimkek lista={b.prioritasok} egyeb={b.prioritasEgyeb} /></Sor>
          <Sor cimke={C.kiemeltIparagak.cimke}>
            {b.kiemeltIparagak.length || b.iparagEgyeb ? (
              <span className="flex flex-wrap gap-1.5">
                {b.kiemeltIparagak.map((i) => <IparagBadge key={i} iparag={i} />)}
                {b.iparagEgyeb && <span className="text-sm">{b.iparagEgyeb}</span>}
              </span>
            ) : <span className="text-muted-foreground">–</span>}
          </Sor>
          <Sor cimke={C.erossegek.cimke}><Szoveg v={b.erossegek} /></Sor>
          <Sor cimke={C.kihivasok.cimke}><Szoveg v={b.kihivasok} /></Sor>
        </>
      );
    }
    case 'intezmenyek': {
      const C = MEZO_CIMKEK.intezmenyek;
      const b = t as ProfilBlokkok['intezmenyek'];
      return (['iranyitoSzervek', 'egyetemek', 'kutatokozpontok', 'infrastrukturak'] as const).map((k) => (
        <Sor key={k} cimke={C[k].cimke}><Szoveg v={b[k]} /></Sor>
      ));
    }
    case 'vallalati': {
      const C = MEZO_CIMKEK.vallalati;
      const b = t as ProfilBlokkok['vallalati'];
      return (
        <>
          <Sor cimke={C.kiemeltAgazatok.cimke}>
            {b.kiemeltAgazatok.length || b.agazatEgyeb ? (
              <span className="flex flex-wrap gap-1.5">
                {b.kiemeltAgazatok.map((i) => <IparagBadge key={i} iparag={i} />)}
                {b.agazatEgyeb && <span className="text-sm">{b.agazatEgyeb}</span>}
              </span>
            ) : <span className="text-muted-foreground">–</span>}
          </Sor>
          <Sor cimke={C.topVallalatok.cimke}>
            {b.topVallalatok.length ? <ol className="list-decimal pl-5">{b.topVallalatok.map((v, i) => <li key={i}>{v}</li>)}</ol> : <span className="text-muted-foreground">–</span>}
          </Sor>
          <Sor cimke={C.startupok.cimke}><Szoveg v={b.startupok} /></Sor>
          <Sor cimke={C.klaszterek.cimke}><Szoveg v={b.klaszterek} /></Sor>
          <Sor cimke={C.technologiatranszfer.cimke}><Szoveg v={b.technologiatranszfer} /></Sor>
        </>
      );
    }
    case 'programok': {
      const C = MEZO_CIMKEK.programok;
      const b = t as ProfilBlokkok['programok'];
      return (['palyazatok', 'tamogatasiProgramok', 'finanszirozasiEszkozok', 'nemzetkoziReszvetel'] as const).map((k) => (
        <Sor key={k} cimke={C[k].cimke}><Szoveg v={b[k]} /></Sor>
      ));
    }
    case 'rendezvenyek': {
      const b = t as ProfilBlokkok['rendezvenyek'];
      if (b.lista.length === 0) return <span className="text-sm text-muted-foreground">Nincs rendezvény.</span>;
      return (
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground uppercase">
            <tr><th className="py-1 pr-3">Név</th><th className="py-1 pr-3">Típus</th><th className="py-1 pr-3">Időpont</th><th className="py-1">Megjegyzés</th></tr>
          </thead>
          <tbody>
            {b.lista.map((r, i) => (
              <tr key={i} className="border-t border-border">
                <td className="py-1.5 pr-3 font-medium">{r.nev}</td>
                <td className="py-1.5 pr-3">{rendezvenyTipusCimke(r.tipus)}</td>
                <td className="py-1.5 pr-3">{r.idopont || '–'}</td>
                <td className="py-1.5">{r.megjegyzes || '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    case 'kapcsolatok': {
      const C = MEZO_CIMKEK.kapcsolatok;
      const b = t as ProfilBlokkok['kapcsolatok'];
      return (['euMultilateralis', 'partnerorszagok', 'egyezmeny', 'ketoldalu', 'mobilitas'] as const).map((k) => (
        <Sor key={k} cimke={C[k].cimke}><Szoveg v={b[k]} /></Sor>
      ));
    }
    case 'magyarErtekeles': {
      const C = MEZO_CIMKEK.magyarErtekeles;
      const b = t as ProfilBlokkok['magyarErtekeles'];
      return (['osszegzes', 'egyuttmukodesiLehetosegek', 'joGyakorlatok', 'diplomaciaiPrioritasok'] as const).map((k) => (
        <Sor key={k} cimke={C[k].cimke}><Szoveg v={b[k]} /></Sor>
      ));
    }
  }
}
```

A rendezvény-táblázat `overflow-x-auto` wrapperbe kerüljön (`<div className="overflow-x-auto">`), hogy keskeny képernyőn ne törje szét az oldalt.

- [ ] **Step 3: `app/(app)/orszagprofil/[kod]/page.tsx`**

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AllapotBadge } from '../../../../components/orszagprofil/AllapotBadge';
import { BlokkNezet } from '../../../../components/orszagprofil/BlokkNezet';
import { buttonVariants } from '../../../../components/ui/button';
import { getProfil, listEvek } from '../../../../db/queries/orszagprofil';
import { aktualisEv, formatDatumIdo } from '../../../../lib/datum';
import { orszagByKod } from '../../../../lib/orszagok';
import { canEditProfil } from '../../../../lib/orszagprofil-jog';
import { BLOKK_KULCSOK, evParam } from '../../../../lib/orszagprofil-szotar';
import { requireSession } from '../../../../lib/session';
import { cn } from '../../../../lib/utils';
import { EvValaszto } from '../components/EvValaszto';

// Statikus cím: a generateMetadata jog-ellenőrzés nélkül nem szivárogtathat.
export const metadata: Metadata = { title: 'Országprofil' };

export default async function OrszagprofilPage({
  params, searchParams,
}: { params: Promise<{ kod: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireSession();
  const { kod } = await params;
  const orszag = orszagByKod(kod);
  if (!orszag) notFound();
  const most = aktualisEv();
  const evek = listEvek(kod);
  const kert = evParam((await searchParams).ev, evek[0] ?? most);
  const ev = evek.includes(kert) ? kert : (evek[0] ?? most);
  const profil = evek.length ? getProfil(kod, ev) : null;
  const szerkeszthet = canEditProfil(session, kod, most, most);
  const allapot = !profil ? 'nincs' : profil.ev === most ? 'friss' : 'elavult';

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">{orszag.nev}</h2>
        <AllapotBadge allapot={allapot} ev={profil?.ev ?? null} />
        {evek.length > 1 && <EvValaszto evek={evek} ertek={ev} />}
        <div className="ml-auto flex gap-2">
          <Link href={`/terkep?o=${kod}`} className={cn(buttonVariants({ variant: 'outline' }))}>Vissza a térképre</Link>
          {szerkeszthet && (
            <Link href={`/orszagprofil/${kod}/szerkesztes?ev=${most}`} className={cn(buttonVariants())}>Szerkesztés</Link>
          )}
        </div>
      </div>
      {profil ? (
        <p className="text-sm text-muted-foreground">
          {profil.ev}. évi profil · utoljára módosítva {formatDatumIdo(profil.updatedAt)}
          {profil.szerzo ? ` · ${profil.szerzo.nev}` : ''} · {profil.mentett.length}/{BLOKK_KULCSOK.length} blokk kitöltve
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Ehhez az országhoz még nincs országprofil.</p>
      )}
      {BLOKK_KULCSOK.map((k) => (
        <BlokkNezet key={k} kulcs={k} tartalom={profil?.blokkok[k] ?? null} />
      ))}
    </div>
  );
}
```

Run: `npx tsc --noEmit`. Ha a `BlokkNezet` generikus hívása a `profil?.blokkok[k]` uniót nem fogadja el, a `BlokkNezet` propja legyen nem generikus: `{ kulcs: BlokkKulcs; tartalom: ProfilBlokkok[BlokkKulcs] | null }`.

- [ ] **Step 4: Böngészős ellenőrzés**

`goto /orszagprofil/KR` (attasé): fejléc „Koreai Köztársaság", „Idei profil · 2026", a Task 7-ben mentett blokkok tartalma (számok magyar ezreselválasztóval, iparág-jelvények színnel, rendezvény-táblázat), a többi „Még nincs kitöltve", Szerkesztés gomb. `/orszagprofil/JP` → „Ehhez az országhoz még nincs országprofil", nincs Szerkesztés gomb. `/orszagprofil/XX` → 404. Adminként: `/orszagprofil/JP/szerkesztes?ev=2025` alapadatok mentése, majd `/orszagprofil/JP` → „Elavult profil · 2025", `?ev=2019` → a 2025-ös jelenik meg (nincs ilyen év).

- [ ] **Step 5: Commit**

```bash
git add components/orszagprofil/ "app/(app)/orszagprofil/[kod]/page.tsx"
git commit -m "feat(orszagprofil): teljes profil oldal, BlokkNezet, jelvények

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 9: Térkép DB-adatból

**Files:**
- Modify: `public/tet-world-map.js`
- Modify: `components/WorldMap.tsx`
- Create: `app/(app)/terkep/components/TerkepNezet.tsx`, `ProfilKivonat.tsx`, `TerkepUres.tsx`
- Modify: `app/(app)/terkep/page.tsx` (teljes csere)

- [ ] **Step 1: `public/tet-world-map.js`**

Fejléc-komment: `Attribútumok: data (JSON: { orszagok: [...], szinek: { iparag: {...}, allapot: {...} } }), metric ("iparag"|"allapot"), iparag (szűrő), selected (ország kódja)`. Változtatások:

1. Töröld a `FIELD_COLORS`, `SEQ`, `RISK_COLORS`, `RISK_ORDER` konstansokat. Új konstansok: `var NINCS_SZIN = '#eceff3', HALVANY = '#e3e7ec', SEMLEGES = '#5f6b7a'; var ALLAPOT_SORREND = ['friss', 'elavult', 'nincs']; var ALLAPOT_CIMKE = { friss: 'idei profil', elavult: 'elavult profil', nincs: 'nincs profil' };`
2. Konstruktor: `this._data = []; this._szinek = { iparag: {}, allapot: {} }; this._metric = 'iparag'; this._iparag = ''; this._sel = ''; this._ready = false;`
3. `observedAttributes`: `['data', 'metric', 'iparag', 'selected']`; a `field` setter/ág helyett `set iparag(v) { this._iparag = v || ''; this._paint(); }` és `attributeChangedCallback`-ben `n === 'iparag'`.
4. `set data(v)`: a JSON objektum: `var o = typeof v === 'string' ? JSON.parse(v || '{}') : (v || {}); this._data = o.orszagok || []; this._szinek = o.szinek || { iparag: {}, allapot: {} };` (try/catch marad).
5. `_dim(r) { return !!(this._iparag && r && r.iparagak.indexOf(this._iparag) === -1); }`
6. `_fill(r)`:
   ```js
   if (!r) return NINCS_SZIN;
   if (this._dim(r)) return HALVANY;
   if (this._metric === 'allapot') return this._szinek.allapot[r.allapot] || NINCS_SZIN;
   return r.iparagak.length ? (this._szinek.iparag[r.iparagak[0]] || SEMLEGES) : SEMLEGES;
   ```
7. `_hover`: nincs rekord → `'<b>' + name + '</b><span>Nincs kihelyezett TéT attasé</span>'` (marad); van:
   ```js
   this._tip.innerHTML = '<b>' + r.nev + '</b>' +
     '<span>' + (r.attase || 'nincs aktív attasé') + '</span>' +
     '<span>' + ALLAPOT_CIMKE[r.allapot] + (r.ev ? ' · ' + r.ev : '') + '</span>' +
     (r.iparagak.length ? '<span>Kiemelt iparág: ' + r.iparagak[0] + '</span>' : '');
   ```
8. `_pick`: `detail: { kod: r.kod }`.
9. `_paint`: a `sel` osztály feltétele `r.kod === self._sel`; a pin-ek: minden rekord (nincs `pin` mező): `var pins = this._data;`, a `data(pins, function (d) { return d.kod; })`.
10. `_drawLegend`:
   ```js
   if (this._metric === 'iparag') {
     var used = [];
     this._data.forEach(function (r) { if (r.iparagak.length && used.indexOf(r.iparagak[0]) === -1) used.push(r.iparagak[0]); });
     used.sort();
     for (i = 0; i < used.length; i++) html += '<div><i style="background:' + (self._szinek.iparag[used[i]] || SEMLEGES) + '"></i>' + used[i] + '</div>';
     html += '<div><i style="background:' + SEMLEGES + '"></i>nincs kiemelt iparág</div>';
   } else {
     for (i = 0; i < ALLAPOT_SORREND.length; i++) html += '<div><i style="background:' + self._szinek.allapot[ALLAPOT_SORREND[i]] + '"></i>' + ALLAPOT_CIMKE[ALLAPOT_SORREND[i]] + '</div>';
   }
   html += '<div style="margin-left:auto"><i style="background:' + NINCS_SZIN + ';border:1px solid #dde1e7"></i>nincs poszt</div>';
   ```
   (a függvény elején `var self = this;`).

- [ ] **Step 2: `components/WorldMap.tsx`**

```tsx
'use client';

import Script from 'next/script';
import { useEffect, useMemo, useRef } from 'react';
import type { TerkepOrszag } from '../db/queries/orszagprofil';
import { ALLAPOT_SZINEK, IPARAG_SZINEK } from '../lib/orszagprofil-szotar';

// A <tet-world-map> webkomponens (public/tet-world-map.js) d3-geo alapú; a d3 és a
// topojson CDN-ről töltődik, a komponens megvárja őket. Az adatot és a színtáblákat egy
// JSON attribútumban kapja, így a JS fájlban nincs hardcode-olt lista.

export type MapMetric = 'iparag' | 'allapot';

interface Props {
  adatok: TerkepOrszag[];
  metric: MapMetric;
  iparag: string;
  selected: string;
  onSelect: (kod: string) => void;
}

export default function WorldMap({ adatok, metric, iparag, selected, onSelect }: Props) {
  const ref = useRef<HTMLElement>(null);

  const dataJson = useMemo(
    () => JSON.stringify({
      orszagok: adatok.map((o) => ({ kod: o.kod, nev: o.nev, geo: o.geo, lonlat: o.lonlat, attase: o.attase, ev: o.ev, allapot: o.allapot, iparagak: o.iparagak })),
      szinek: { iparag: IPARAG_SZINEK, allapot: ALLAPOT_SZINEK },
    }),
    [adatok],
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent<{ kod?: string }>).detail;
      if (d?.kod) onSelect(d.kod);
    };
    document.addEventListener('tet-country-select', handler);
    return () => document.removeEventListener('tet-country-select', handler);
  }, [onSelect]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute('data', dataJson);
    el.setAttribute('metric', metric);
    el.setAttribute('iparag', iparag);
    el.setAttribute('selected', selected);
  }, [dataJson, metric, iparag, selected]);

  return (
    <>
      <Script src="https://unpkg.com/d3@7.9.0/dist/d3.min.js" strategy="afterInteractive" />
      <Script src="https://unpkg.com/topojson-client@3.1.0/dist/topojson-client.min.js" strategy="afterInteractive" />
      <Script src="/tet-world-map.js" strategy="afterInteractive" />
      {/* @ts-expect-error egyedi webkomponens elem */}
      <tet-world-map ref={ref} style={{ display: 'block', minHeight: 420 }} />
    </>
  );
}
```

A `TerkepOrszag` típus-importja a `server-only` modulból `import type` – ez fordítási időben eltűnik, a kliens bundle-ba nem kerül DB-kód. Ha a Next mégis panaszkodik a `server-only` miatt, tedd át a `TerkepOrszag` interfészt a `lib/orszagprofil-szotar.ts`-be, és onnan importálja a query-modul és a `WorldMap` is.

- [ ] **Step 3: `app/(app)/terkep/components/TerkepUres.tsx`**

```tsx
'use client';

import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { ALLAPOT_CIMKE, ALLAPOT_SZINEK, ALLAPOTOK } from '../../../../lib/orszagprofil-szotar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';

export function TerkepUres({ adatok, onSelect }: { adatok: TerkepOrszag[]; onSelect: (kod: string) => void }) {
  const legutobbi = adatok.filter((o) => o.frissitve).sort((a, b) => (b.frissitve ?? '').localeCompare(a.frissitve ?? '')).slice(0, 6);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Válassz országot a térképen</CardTitle>
        <CardDescription>A pontok a TéT attasé-posztokat jelölik. Kattintásra megnyílik az ország profiljának kivonata.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Profilok állapota</p>
          <ul className="flex flex-col gap-1.5">
            {ALLAPOTOK.map((a) => (
              <li key={a} className="flex items-center gap-2 text-sm">
                <span className="size-2.5 rounded-sm" style={{ background: ALLAPOT_SZINEK[a] }} />
                {ALLAPOT_CIMKE[a]}
                <span className="ml-auto font-mono text-xs text-muted-foreground">{adatok.filter((o) => o.allapot === a).length} ország</span>
              </li>
            ))}
          </ul>
        </div>
        {legutobbi.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Legutóbb frissített profilok</p>
            <ul className="divide-y divide-border">
              {legutobbi.map((o) => (
                <li key={o.kod}>
                  <button type="button" onClick={() => onSelect(o.kod)} className="flex w-full items-center gap-2 py-2 text-left text-sm hover:bg-muted/50">
                    <span className="font-medium">{o.nev}</span>
                    <span className="text-muted-foreground">{o.attase ?? ''}</span>
                    <span className="ml-auto font-mono text-xs text-muted-foreground">{o.frissitve}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

A `frissitve` formázott dátum (`formatDatum`, „2026. 09. 10.") rendezéshez a `localeCompare` elég, mert az alak fix hosszú, év-hó-nap sorrendű.

- [ ] **Step 4: `app/(app)/terkep/components/ProfilKivonat.tsx`**

```tsx
'use client';

import Link from 'next/link';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { AllapotBadge } from '../../../../components/orszagprofil/AllapotBadge';
import { IparagBadge } from '../../../../components/orszagprofil/IparagBadge';
import { Badge } from '../../../../components/ui/badge';
import { Button, buttonVariants } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/card';
import { BLOKK_KULCSOK, MEZO_CIMKEK } from '../../../../lib/orszagprofil-szotar';
import { cn } from '../../../../lib/utils';

const HU = new Intl.NumberFormat('hu-HU');
const sz = (n: number | null, utotag = '') => (n === null ? '–' : `${HU.format(n)}${utotag}`);

export function ProfilKivonat({ o, szerkeszthet, aktualisEv, onClose }: { o: TerkepOrszag; szerkeszthet: boolean; aktualisEv: number; onClose: () => void }) {
  const a = o.alapadatok;
  const C = MEZO_CIMKEK.alapadatok;
  const poszt = [o.poszt?.fovaros, o.poszt?.terulet !== null && o.poszt?.terulet !== undefined ? `${HU.format(o.poszt.terulet)} km²` : null, o.poszt?.penznem].filter(Boolean).join(' · ');
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-2">
          <div className="min-w-0">
            <CardTitle>{o.nev}</CardTitle>
            <CardDescription>{o.attase ?? 'nincs aktív attasé'}{poszt ? ` · ${poszt}` : ''}</CardDescription>
          </div>
          <Button type="button" variant="ghost" size="icon" className="ml-auto" aria-label="Bezárás" onClick={onClose}>×</Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <AllapotBadge allapot={o.allapot} ev={o.ev} />
          {o.allapot !== 'nincs' && <Badge variant="secondary">{o.mentettDb}/{BLOKK_KULCSOK.length} blokk · {o.rendezvenyDb} rendezvény</Badge>}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {o.allapot === 'nincs' ? (
          <p className="text-sm text-muted-foreground">Ehhez az országhoz még nincs országprofil.</p>
        ) : (
          <>
            {a && (
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted-foreground">{C.lakossag.cimke}</dt><dd>{sz(a.lakossag)}</dd>
                <dt className="text-muted-foreground">{C.gdp.cimke}</dt><dd>{sz(a.gdp)}</dd>
                <dt className="text-muted-foreground">{C.gdpEgyFore.cimke}</dt><dd>{sz(a.gdpEgyFore)}</dd>
                <dt className="text-muted-foreground">{C.gdpNovekedes.cimke}</dt><dd>{sz(a.gdpNovekedes, ' %')}</dd>
                {a.adatEv && <><dt className="text-muted-foreground">{C.adatEv.cimke}</dt><dd>{a.adatEv}{a.forras ? ` · ${a.forras}` : ''}</dd></>}
                {a.tagsagok.length > 0 && <><dt className="text-muted-foreground">{C.tagsagok.cimke}</dt><dd>{a.tagsagok.join(', ')}</dd></>}
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
        {szerkeszthet && (
          <Link href={`/orszagprofil/${o.kod}/szerkesztes?ev=${aktualisEv}`} className={cn('ml-auto', buttonVariants())}>
            {o.allapot === 'nincs' ? 'Profil kitöltése' : 'Szerkesztés'}
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 5: `app/(app)/terkep/components/TerkepNezet.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import WorldMap, { type MapMetric } from '../../../../components/WorldMap';
import { buttonVariants } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { IPARAGAK } from '../../../../lib/orszagprofil-szotar';
import { cn } from '../../../../lib/utils';
import { ProfilKivonat } from './ProfilKivonat';
import { TerkepUres } from './TerkepUres';

const MIND = '__mind';

export function TerkepNezet({
  adatok, aktualisEv, sajatKod, admin, kezdoKod,
}: { adatok: TerkepOrszag[]; aktualisEv: number; sajatKod: string | null; admin: boolean; kezdoKod: string | null }) {
  const [metric, setMetric] = useState<MapMetric>('iparag');
  const [iparag, setIparag] = useState('');
  const [kod, setKod] = useState<string | null>(kezdoKod && adatok.some((o) => o.kod === kezdoKod) ? kezdoKod : null);
  const onSelect = useCallback((k: string) => setKod(k), []);
  const sel = kod ? adatok.find((o) => o.kod === kod) ?? null : null;
  const friss = adatok.filter((o) => o.allapot === 'friss').length;
  const erintett = iparag ? adatok.filter((o) => o.iparagak.includes(iparag as (typeof IPARAGAK)[number])).length : null;

  return (
    <div className="flex max-w-[1600px] flex-wrap items-start gap-4">
      <Card className="min-w-0 flex-[1_1_560px] overflow-hidden">
        <CardHeader className="flex flex-wrap items-center gap-3">
          <Tabs value={metric} onValueChange={(v) => setMetric(v as MapMetric)}>
            <TabsList>
              <TabsTrigger value="iparag">Kiemelt iparág</TabsTrigger>
              <TabsTrigger value="allapot">Profil állapota</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Label id="iparag-szuro-label" htmlFor="iparag-szuro">Iparág</Label>
            <Select value={iparag || MIND} onValueChange={(v) => setIparag(!v || v === MIND ? '' : v)}
              items={{ [MIND]: 'Mind', ...Object.fromEntries(IPARAGAK.map((i) => [i, i])) }}>
              <SelectTrigger id="iparag-szuro" aria-labelledby="iparag-szuro-label iparag-szuro" className="w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={MIND}>Mind</SelectItem>
                {IPARAGAK.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <span className="ml-auto text-xs text-muted-foreground">
            {erintett !== null ? `${erintett} ország emeli ki ezt az iparágat` : `${adatok.length} poszt · ${friss} idei profil`}
          </span>
          {sajatKod && !admin && (
            <Link href={`/orszagprofil/${sajatKod}/szerkesztes?ev=${aktualisEv}`} className={cn(buttonVariants({ size: 'sm' }))}>Saját országprofil</Link>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <WorldMap adatok={adatok} metric={metric} iparag={iparag} selected={kod ?? ''} onSelect={onSelect} />
        </CardContent>
      </Card>
      <div className="flex min-w-0 max-w-[420px] flex-[1_1_330px] flex-col gap-4">
        {sel ? (
          <ProfilKivonat o={sel} szerkeszthet={admin || sel.kod === sajatKod} aktualisEv={aktualisEv} onClose={() => setKod(null)} />
        ) : (
          <TerkepUres adatok={adatok} onSelect={onSelect} />
        )}
      </div>
    </div>
  );
}
```

Ha a `Tabs` `onValueChange` szignatúrája a shadcn/Base UI verzióban `(value, event)` alakú, a callback `(v) => …` így is jó. A `Select` `onValueChange` `null`-t is adhat – a `!v` ág ezt kezeli.

- [ ] **Step 6: `app/(app)/terkep/page.tsx`** – teljes csere

```tsx
import type { Metadata } from 'next';
import { listTerkepAdat } from '../../../db/queries/orszagprofil';
import { aktualisEv } from '../../../lib/datum';
import { orszagByKod } from '../../../lib/orszagok';
import { requireSession } from '../../../lib/session';
import { TerkepNezet } from './components/TerkepNezet';

export const metadata: Metadata = { title: 'Országprofil' };

export default async function TerkepPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireSession();
  const most = aktualisEv();
  const o = (await searchParams).o;
  const kezdoKod = typeof o === 'string' && orszagByKod(o) ? o : null;
  return (
    <TerkepNezet
      adatok={listTerkepAdat(most)}
      aktualisEv={most}
      sajatKod={session.orszag}
      admin={session.role === 'admin'}
      kezdoKod={kezdoKod}
    />
  );
}
```

A régi `CountryProfilePage` tartalma (inline stílusok, `POSTS`, `nyitottsag`, `pill`) teljesen kikerül. Run: `npx tsc --noEmit` → hibátlan; ellenőrizd `grep -rn "lib/data" components/WorldMap.tsx "app/(app)/terkep"` → nincs találat.

- [ ] **Step 7: Böngészős ellenőrzés**

`goto /terkep` attaséval: a fejlécben Tabs (Kiemelt iparág / Profil állapota), Iparág select, „2 poszt · 1 idei profil", „Saját országprofil" gomb. A térképen a KR pin a KFI-blokkban választott első iparág színével, JP semleges (nincs kiemelt iparág, csak alapadatok) – állapot metrikán KR zöld, JP borostyán. Iparág-szűrő a KR iparágára: JP halvány, a számláló „1 ország emeli ki ezt az iparágat". Kattintás a KR pinre → kivonat: cím, attasé, állapot-jelvény, alapadatok, iparág-jelvények, összegzés (ha a 7. blokk mentve), gombok; „Teljes profil" → `/orszagprofil/KR`; onnan „Vissza a térképre" → `/terkep?o=KR` a kivonattal nyitva. Bezárás → üres állapot: állapot-összesítő (1/1/0) és „Legutóbb frissített profilok". Tooltip hover: ország, attasé, állapot, iparág. `console --errors` üres. `/monitoring` és `/tudastar` változatlanul renderel.

- [ ] **Step 8: Commit**

```bash
git add public/tet-world-map.js components/WorldMap.tsx "app/(app)/terkep/"
git commit -m "feat(terkep): térkép és panel DB-s országprofilból, iparág/állapot színezés, kivonat

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

### Task 10: AppShell címek, dokumentáció, build, záró QA

**Files:**
- Modify: `components/AppShell.tsx` (`TITLES`)
- Modify: `CLAUDE.md`, `README.md`

- [ ] **Step 1: `TITLES`**

`components/AppShell.tsx` `TITLES` objektumába a `/terkep` sor után:

```ts
  '/orszagprofil': ['Országprofil', 'Az ország KFI körképe és alapadatai, évenkénti attasé-beadással'],
```

és a `/terkep` alcíme: `'A TéT attasé-posztok térképen, a beküldött országprofilok kivonatával'`. A `titleFor` prefix-egyezése a `/orszagprofil/KR` és `/orszagprofil/KR/szerkesztes` útvonalra is ezt adja.

- [ ] **Step 2: `CLAUDE.md`**

- A „Mi ez" bekezdésben: „a térkép, a tudástár és a monitoring még a demóadatokból" → „a tudástár és a monitoring még a `lib/data.ts` / `lib/knowledge.ts` demóadataiból dolgozik; az országprofil (térkép), a riportok, a kommunikáció és a felhasználók már DB-ből".
- „Parancsok" alá: `npx tsx scripts/orszag-kod-migracio.ts   # egyszeri: user.orszag / riport.orszag név → ISO-kód (idempotens)`.
- Az **Auth** bekezdésben a `user.orszag` leírásához: „ISO 3166-1 alpha-2 kód a `lib/orszagok.ts` szótárból (`orszagByKod`, `orszagNev`); a felület mindenhol `orszagNev()`-vel ír, a dialógus select-ből választ".
- A **Riportok** bekezdéshez: „a `riport.orszag` a session-ország kódja, megjelenítés `orszagNev()`-vel, a szűrő értéke a kód".
- Új **Országprofil** bekezdés a Riportok után:

```
**Országprofil.** Országonként és évenként egy sor: `db/schema/orszagprofil.ts` (`orszagprofil`, egyedi `(orszag_kod, ev)`, 8 típusos JSON oszlop: `alapadatok` + a 7 KFI-blokk, `null` = még nem mentett blokk), `db/queries/orszagprofil.ts` (`getProfil`, `listEvek`, `listTerkepAdat` – minden ország, ahol aktív attasé van vagy van profil, a legfrissebb profillal és `allapot`: `friss` / `elavult` / `nincs` –, `upsertBlokk`), szótár és típusok `lib/orszagprofil-szotar.ts` (`BLOKKOK`, opciólisták `TAGSAGOK`/`GAZDASAGI_AGAZATOK`/`KFI_PRIORITASOK`/`IPARAGAK` + `IPARAG_SZINEK`, korlátok, `uresBlokk`, `normalizalBlokk` – a DB-ből olvasott JSON hiányzó almezőit üres alapértékre egészíti, ezért új almező bevezetése nem igényel migrációt –, `MEZO_CIMKEK`, `evParam`), validátor `lib/orszagprofil-validacio.ts` (`validalBlokk`, blokkonként; listás mezők `fd.getAll`, rendezvények `rendezveny.<i>.<mezo>`), jog `lib/orszagprofil-jog.ts` (`canEditProfil`: admin bármely ország `EV_MIN`..aktuális év, attasé csak a saját kódja és az aktuális év; olvasni bárki bármit), `aktualisEv()` a `lib/datum.ts`-ben. Route-ok: `/terkep` (server page + `terkep/components/TerkepNezet` kliens: metrika, iparág-szűrő, `ProfilKivonat` / `TerkepUres`; `?o=<kod>` előre kiválaszt), `/orszagprofil/[kod]` (teljes nézet, `?ev=`, `components/orszagprofil/BlokkNezet`), `/orszagprofil/[kod]/szerkesztes` (8 önálló blokk-form, `orszagprofil/components/BlokkForm` + `mezok/*`, `RendezvenySorok`), egyetlen action `orszagprofil/actions.ts` `mentBlokkAction` (rejtett `kod`/`ev`/`blokk`; sorrend session → kód/blokk → jog → validálás → upsert; jog- és létezési hiba 404). Űrlap-konvenció: a mező `id`-ja `<blokk>.<mezo>` (a 8 blokk egy DOM-ban van, a `useMuveletForm` erre fókuszál, az action ilyen kulccsal adja a hibát), a `name` a puszta mezőnév. A mezők vezérelt állapotban vannak (React 19 sikeres action után az uncontrolled mezőket alaphelyzetbe állítaná). Általános építőelemek `components/form/`: `Mezo`/`SzovegMezo`/`RovidMezo`, `SzamMezo`, `CimkeValaszto` (Combobox-chips + rejtett input értékenként + „egyéb").
```

- A **Térkép** bekezdés cseréje: „`components/WorldMap.tsx` a `<tet-world-map>` webkomponenst (`public/tet-world-map.js`, d3-geo + topojson, CDN-ről, internet kell) használja; propként kapja a `listTerkepAdat` eredményét, a JSON attribútumban az adat mellett a színtáblák (`IPARAG_SZINEK`, `ALLAPOT_SZINEK`) is mennek, a JS-ben nincs hardcode-olt lista. Metrika `iparag` (az első kiemelt iparág színe) vagy `allapot`; a `tet-country-select` esemény `detail.kod`-ot ad."
- A **Demó pontszámlogika** bekezdés marad (monitoring).

- [ ] **Step 3: `README.md`** route-tábla

A `/terkep` sor: „Térkép és országprofil-kivonat (DB-s profilok, d3-geo világtérkép)"; új sorok: `/orszagprofil/[kod]` – „Teljes országprofil, évválasztóval"; `/orszagprofil/[kod]/szerkesztes` – „Profil szerkesztése blokkonként (attasé: saját ország, idei év; admin: bármely)".

- [ ] **Step 4: Build és záró QA**

Run: `npx tsc --noEmit` és `npm run build` → hibátlan (szükség esetén `rm .next/dev/types/validator.ts`). Böngészős végigjárás a spec „Ellenőrzés" 9 pontja szerint (Task 7–9 már lefedte a többséget; itt a teljes lánc egyben): attasé login → `/terkep` → saját profil → 3 blokk mentése → térkép színe → teljes oldal → 404-ek → admin másik ország 2025 → elavult jelvény → `/felhasznalok` select → `/riportok` országnevek → `/monitoring` él. `console --errors` mindenhol üres.

- [ ] **Step 5: Commit**

```bash
git add components/AppShell.tsx CLAUDE.md README.md
git commit -m "docs(orszagprofil): AppShell címek, CLAUDE.md Országprofil és Térkép bekezdés, README route-ok

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

## Megvalósítási eltérések

(Az implementáció során ide kerülnek a tervtől való eltérések és indokaik.)
