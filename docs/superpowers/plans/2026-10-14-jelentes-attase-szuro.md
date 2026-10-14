# Jelentések: szűrés attaséra – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A központ (admin) a Jelentések listáját egy adott attasé bejegyzéseire szűkíthesse a meglévő szűrők mellett.

**Architecture:** Új `?attase=<felhasználó-id>` URL-paraméter, amelyet a `lib/riport-szuro.ts` a meglévő `RiportFilter.szerzoId`-ra fordít, így a `listRiportok` nem változik. Az opciókat egy új `listSzerzok()` adja (a bejegyzéssel rendelkező szerzők, magyar névsorban). A page az ismeretlen id-t eldobja, az attasé nézetében pedig a kényszerített saját-szűrőt csak a lekérdezésnek adja, a szűrőértékeknek nem.

**Tech Stack:** Next.js 16 App Router (Server Component page, `searchParams`), React 19 kliens szűrősáv (Base UI `Select` a shadcn-ből), Drizzle ORM + better-sqlite3, TypeScript.

**Spec:** `docs/superpowers/specs/2026-10-14-jelentes-attase-szuro-design.md`

---

## Közös tudnivalók minden taskhoz

- Repó: `/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next`, ág: `jelentes-attase-szuro` (már létezik, ezen kell dolgozni; ne válts ágat).
- Scratchpad (eldobható scriptek, DB-másolat): a lépésekben `$SCR`. Minden parancs előtt: `SCR=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/eb39e4a9-e96a-4b04-8b04-c64e9b0fd3f7/scratchpad`.
- Nincs tesztkeretrendszer. Ellenőrzés: `npx tsc --noEmit`, eldobható tsx script a scratchpadben (`node:assert/strict`), a végén `npm run build`.
- A scratchpad-script a repó fájljait **abszolút úttal** importálja; csupasz csomagnevet (`drizzle-orm`) nem tud feloldani, ezért ne importálj csomagot (a `node:` modulok rendben vannak). `db/queries/*`-t importáló scriptet így futtass: `NODE_OPTIONS="--conditions=react-server" npx tsx <script>` (a `server-only` guard miatt).
- DB-t érintő ellenőrzés csak **másolaton**: `DATABASE_URL=<másolat> …`. A `data/tet.db`-hez az 1–3. task nem nyúlhat (a 3. task `npm run build`-je lefuttatja a `db:init`-et és a migrátort, új migráció nincs, ez rendben van). A `data/tet.db` módosítva van a munkafában – **ne commitold**.
- A felhasználó TéT dev szervere fut a 3000-es porton: ne indíts és ne állíts le dev szervert. Ne használj `git add -A`/`git add .`-t, csak a felsorolt fájlokat add hozzá. Nincs stash/reset/checkout fájlokra.
- A felület szövegei magyarok; a kód azonosítói a környezethez igazodnak (magyar nevek). A meglévő fájlok relatív importot használnak.

## Fájlok

| Fájl | Változás | Felelősség |
| --- | --- | --- |
| `db/queries/riport.ts` | módosul | új `RiportSzerzo` típus és `listSzerzok()` a `listOrszagok()` mellett |
| `lib/riport-szuro.ts` | módosul | `attase` URL-paraméter ↔ `RiportFilter.szerzoId`, `SzuroErtekek.attase` |
| `app/(app)/jelentesek/page.tsx` | módosul | ismeretlen id eldobása (admin), a saját-szűrő leválasztása a szűrőértékekről (attasé), `szerzok` prop |
| `components/riport/RiportSzurok.tsx` | módosul | az „Attasé” legördülő az Ország után, csak adminnak |
| `CLAUDE.md`, `README.md` | módosul | dokumentáció |

---

### Task 1: Adatréteg – `listSzerzok()` és az `attase` URL-paraméter

**Files:**
- Modify: `db/queries/riport.ts` (a `listOrszagok()` után, a fájl végén, kb. 280–287. sor)
- Modify: `lib/riport-szuro.ts`
- Test (eldobható, nem commitolandó): `$SCR/attase-szuro-proba.ts`, `$SCR/attase-szuro.db`

- [ ] **Step 1: DB-másolat QA-bejegyzésekkel**

```bash
SCR=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/eb39e4a9-e96a-4b04-8b04-c64e9b0fd3f7/scratchpad
cd /Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next
rm -f "$SCR/attase-szuro.db" "$SCR/attase-szuro.db-wal" "$SCR/attase-szuro.db-shm"
sqlite3 -readonly data/tet.db ".backup '$SCR/attase-szuro.db'"
sqlite3 "$SCR/attase-szuro.db" "
insert into riport (id, szerzo_id, orszag, kategoria, targy, leiras, kulcsszavak)
  select 'qa-1', id, 'DE', 'szabalyozas', 'QA 1', 'x', '[]' from user where email = 'komma.krisztian@demo.test';
insert into riport (id, szerzo_id, orszag, kategoria, targy, leiras, kulcsszavak)
  select 'qa-2', id, 'DE', 'szabalyozas', 'QA 2', 'x', '[]' from user where email = 'komma.krisztian@demo.test';
insert into riport (id, szerzo_id, orszag, kategoria, targy, leiras, kulcsszavak)
  select 'qa-3', id, 'DE', 'szabalyozas', 'QA 3', 'x', '[]' from user where email = 'kindert.judit@demo.test';
insert into riport (id, szerzo_id, orszag, kategoria, targy, leiras, kulcsszavak)
  select 'qa-4', id, 'AT', 'szabalyozas', 'QA 4', 'x', '[]' from user where email = 'javori.balazs@demo.test';
select count(*) from riport;"
```

Expected: utolsó sor `4`.

- [ ] **Step 2: A (még bukó) próba-script megírása**

`$SCR/attase-szuro-proba.ts`:

```ts
import assert from 'node:assert/strict';
import { listRiportok, listSzerzok } from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/db/queries/riport';
import { szuroErtekek, szuroFromSearchParams } from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/lib/riport-szuro';

// URL -> szűrő
assert.deepEqual(szuroFromSearchParams({ attase: '  abc  ' }), { szerzoId: 'abc' });
assert.deepEqual(szuroFromSearchParams({ attase: '' }), {});
assert.deepEqual(szuroFromSearchParams({ attase: '   ' }), {});
assert.deepEqual(szuroFromSearchParams({ attase: ['x', 'y'] }), { szerzoId: 'x' });
assert.equal(szuroFromSearchParams({ attase: 'a'.repeat(150) }).szerzoId?.length, 100);
// A korábbi paraméterek változatlanok.
assert.deepEqual(szuroFromSearchParams({ orszag: 'DE', attase: 'abc' }), { orszag: 'DE', szerzoId: 'abc' });

// szűrő -> kliens-értékek; a kulcssorrend adja az URL paramétersorrendjét
assert.equal(szuroErtekek({ szerzoId: 'abc' }).attase, 'abc');
assert.equal(szuroErtekek({}).attase, '');
assert.deepEqual(Object.keys(szuroErtekek({})), ['q', 'kategoria', 'kulcsszo', 'orszag', 'attase', 'tol', 'ig']);

// listSzerzok: minden szerző egyszer, magyar névsorban
const szerzok = listSzerzok();
assert.deepEqual(
  szerzok.map((s) => s.nev),
  ['Jávori Balázs', 'Kindert Judit', 'Komma Krisztián'],
);
for (const s of szerzok) assert.match(s.id, /^[0-9a-f-]{36}$/);

// A kiválasztott szerzőre szűrve csak az ő bejegyzései, az országgal ÉS kapcsolatban.
const komma = szerzok.find((s) => s.nev === 'Komma Krisztián');
assert.ok(komma);
assert.deepEqual(
  listRiportok(szuroFromSearchParams({ attase: komma.id })).map((r) => r.targy).sort(),
  ['QA 1', 'QA 2'],
);
assert.equal(listRiportok(szuroFromSearchParams({ attase: komma.id, orszag: 'DE' })).length, 2);
assert.equal(listRiportok(szuroFromSearchParams({ attase: komma.id, orszag: 'AT' })).length, 0);

console.log('OK');
```

- [ ] **Step 3: A script bukik**

Run:

```bash
SCR=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/eb39e4a9-e96a-4b04-8b04-c64e9b0fd3f7/scratchpad
cd /Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next
DATABASE_URL="$SCR/attase-szuro.db" NODE_OPTIONS="--conditions=react-server" npx tsx "$SCR/attase-szuro-proba.ts"
```

Expected: FAIL – `AssertionError` az első `deepEqual`-on (a `szuroFromSearchParams` az `attase`-t még nem ismeri, `{}`-t ad), vagy a `listSzerzok` hiányzó exportja miatti hiba.

- [ ] **Step 4: `listSzerzok()` a `db/queries/riport.ts`-be**

A `RiportListItem` interfész után (a `CsatolmanyMeta` elé) új típus:

```ts
/** Az admin attasé-szűrőjének egy opciója: egy bejegyzéssel rendelkező szerző. */
export interface RiportSzerzo {
  id: string;
  nev: string;
}
```

A fájl végén, a `listOrszagok()` után:

```ts
/**
 * A bejegyzéssel rendelkező szerzők (az admin attasé-szűrőjének opciói), magyar névsorban. A
 * rendezés JS-ben, mert a SQLite BINARY collation az ékezetes neveket a lista végére tenné.
 */
export function listSzerzok(): RiportSzerzo[] {
  return db
    .selectDistinct({ id: user.id, nev: user.name })
    .from(riport)
    .innerJoin(user, eq(riport.szerzoId, user.id))
    .all()
    .sort((a, b) => a.nev.localeCompare(b.nev, 'hu'));
}
```

(A `db`, `riport`, `user`, `eq` már importálva van a fájl tetején.)

- [ ] **Step 5: Az `attase` paraméter a `lib/riport-szuro.ts`-ben**

A `szuroFromSearchParams`-ban az `orszag` blokk után:

```ts
  const orszag = egy(sp.orszag);
  if (orszag) f.orszag = orszag.slice(0, 100);
  // Az admin attasé-szűrője. A page a listán nem szereplő id-t eldobja, és az attasé nézetében
  // a sajátjával helyettesíti, ezért itt elég a formai tisztítás.
  const attase = egy(sp.attase);
  if (attase) f.szerzoId = attase.slice(0, 100);
```

A `SzuroErtekek` interfészben az `orszag` után:

```ts
export interface SzuroErtekek {
  q: string;
  kategoria: string;
  kulcsszo: string;
  orszag: string;
  attase: string;
  tol: string;
  ig: string;
}
```

A `szuroErtekek`-ben az `orszag` után:

```ts
export function szuroErtekek(f: RiportFilter): SzuroErtekek {
  return {
    q: f.q ?? '',
    kategoria: f.kategoria ?? '',
    kulcsszo: f.kulcsszo ?? '',
    orszag: f.orszag ?? '',
    attase: f.szerzoId ?? '',
    tol: f.datumTol ?? '',
    ig: f.datumIg ?? '',
  };
}
```

- [ ] **Step 6: A script átmegy**

Run: ugyanaz, mint a Step 3-ban.
Expected: `OK`

- [ ] **Step 7: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: hiba nélkül lefut. (Ha a page-re panaszkodik, hogy a `SzuroErtekek`-ből hiányzik az `attase` – nem szabadna, mert a page a `szuroErtekek()`-ből kapja –, jelezd.)

- [ ] **Step 8: Commit**

```bash
git add db/queries/riport.ts lib/riport-szuro.ts
git commit -m "feat(jelentesek): attasé-szűrő adatrétege – listSzerzok() és az attase URL-paraméter

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

(A scratchpad-fájlok nem kerülnek a repóba.)

---

### Task 2: Page és szűrősáv

**Files:**
- Modify: `app/(app)/jelentesek/page.tsx`
- Modify: `components/riport/RiportSzurok.tsx`

- [ ] **Step 1: A page – ismeretlen id eldobása, a saját-szűrő leválasztása**

`app/(app)/jelentesek/page.tsx` teljes új tartalma:

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { RiportSzurok } from '../../../components/riport/RiportSzurok';
import { RiportTabla } from '../../../components/riport/RiportTabla';
import { buttonVariants } from '../../../components/ui/button';
import { listOrszagok, listRiportok, listSzerzok } from '../../../db/queries/riport';
import { canIntezkedni } from '../../../lib/riport-jog';
import { szuroErtekek, szuroFromSearchParams, type SearchParams } from '../../../lib/riport-szuro';
import { requireSession } from '../../../lib/session';
import { cn } from '../../../lib/utils';
import { mentIntezkedesAction } from './actions';

export const metadata: Metadata = { title: 'Jelentések' };

export default async function RiportokPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await requireSession();
  const admin = session.role === 'admin';
  const szuro = szuroFromSearchParams(await searchParams);
  const szerzok = admin ? listSzerzok() : [];
  if (admin) {
    // Elavult vagy kézzel írt id: szűrő nélkül, hogy a legördülőben ne nyers id álljon.
    if (szuro.szerzoId && !szerzok.some((s) => s.id === szuro.szerzoId)) delete szuro.szerzoId;
  } else {
    // Az attasé nem szűrhet országra és szerzőre: az URL-ből jövőt eldobjuk.
    delete szuro.orszag;
    delete szuro.szerzoId;
  }
  const ertekek = szuroErtekek(szuro);
  const vanSzuro = Object.values(ertekek).some(Boolean);
  // Attasé csak a sajátjait látja. A kényszerített szerző-szűrő csak a lekérdezésbe kerül, a
  // szűrőértékekbe nem, különben aktív szűrőnek látszana („Szűrők törlése”, üres-állapot szöveg).
  const sorok = listRiportok(admin ? szuro : { ...szuro, szerzoId: session.userId });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">{sorok.length} bejegyzés</p>
        <Link href="/uj-jelentes" className={cn('ml-auto', buttonVariants())}>
          Új bejegyzés
        </Link>
      </div>
      <RiportSzurok
        ertekek={ertekek}
        orszagok={admin ? listOrszagok() : []}
        szerzok={szerzok}
        admin={admin}
      />
      <RiportTabla
        sorok={sorok}
        admin={admin}
        vanSzuro={vanSzuro}
        intezkedesAction={canIntezkedni(session) ? (id) => mentIntezkedesAction.bind(null, id) : undefined}
      />
    </div>
  );
}
```

- [ ] **Step 2: A szűrősáv – az „Attasé” legördülő**

`components/riport/RiportSzurok.tsx`:

Az importok közé (a `lib/orszagok` import elé, ábécérendben a relatív utak szerint):

```ts
import type { RiportSzerzo } from '../../db/queries/riport';
```

(Csak `import type`: a `server-only` modulból típust a kliens-komponens is importálhat, futásidőben eltűnik – ugyanígy jut ide a `SzuroErtekek` a `lib/riport-szuro.ts`-en át.)

A komponens propjai:

```tsx
export function RiportSzurok({
  ertekek,
  orszagok,
  szerzok,
  admin,
}: {
  ertekek: SzuroErtekek;
  orszagok: string[];
  /** Az attasé-szűrő opciói (csak adminnak, egyébként üres). */
  szerzok: RiportSzerzo[];
  admin: boolean;
}) {
```

A meglévő `{admin && ( <SzuroSelect id="szuro-orszag" … /> )}` blokk helyére (az Ország-szűrő és közvetlenül utána az Attasé-szűrő):

```tsx
      {admin && (
        <>
          <SzuroSelect
            id="szuro-orszag"
            cimke="Ország"
            ertek={ertekek.orszag}
            opciok={orszagok.map((o) => ({ ertek: o, cimke: orszagNev(o) }))}
            onChange={(v) => frissit({ orszag: v })}
            className="w-44"
          />
          <SzuroSelect
            id="szuro-attase"
            cimke="Attasé"
            ertek={ertekek.attase}
            opciok={szerzok.map((s) => ({ ertek: s.id, cimke: s.nev }))}
            onChange={(v) => frissit({ attase: v })}
            className="w-56"
          />
        </>
      )}
```

A „Szűrők törlése” gomb és a `vanAktiv` a `SzuroErtekek` minden mezőjét nézi (`Object.values`), a `frissit` minden mezőt az URL-be ír (`Object.entries`) – ezekhez nem kell nyúlni.

- [ ] **Step 3: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: hiba nélkül lefut.

- [ ] **Step 4: Commit**

```bash
git add "app/(app)/jelentesek/page.tsx" components/riport/RiportSzurok.tsx
git commit -m "feat(jelentesek): Attasé-szűrő az admin szűrősávjában; az attasé saját-szűrője nem látszik aktív szűrőnek

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Dokumentáció és build

**Files:**
- Modify: `CLAUDE.md` (a **Riportok** bekezdés)
- Modify: `README.md` (a `/jelentesek` sor a route-táblában, kb. 68. sor)

- [ ] **Step 1: CLAUDE.md**

A **Riportok** bekezdésben ezt a mondatot:

```
az admin ország-szűrő értéke a kód, a `listOrszagok()` a kódokat név szerint rendezve adja.
```

cseréld erre:

```
az admin ország-szűrő értéke a kód, a `listOrszagok()` a kódokat név szerint rendezve adja. Az admin attasé-szűrője (`?attase=<felhasználó-id>` → `RiportFilter.szerzoId`, a `listRiportok` meglévő szerző-feltétele) a `listSzerzok()` opcióiból választ (a bejegyzéssel rendelkező szerzők, magyar névsorban; az Ország-szűrőtől független, ÉS kapcsolat); a listán nem szereplő id-t a page eldobja. Az attasé nézetében a page az URL-ből jövő `orszag`-ot és `szerzoId`-t eldobja, a saját id-ját pedig csak a lekérdezésnek adja, a szűrőértékeknek (`szuroErtekek`) nem – különben aktív szűrőnek látszana („Szűrők törlése” gomb, üres listánál a szűrős szöveg).
```

- [ ] **Step 2: README.md**

A `/jelentesek` sorban ezt:

```
| `/jelentesek` | Információs bejegyzések listája szűrőkkel (attasé: saját, admin: mind); „Intézkedés” oszlop: a központ megtett intézkedése, amelyet az admin a listából is rögzíthet |
```

cseréld erre:

```
| `/jelentesek` | Információs bejegyzések listája szűrőkkel (attasé: saját, admin: mind, ország- és attasé-szűrővel); „Intézkedés” oszlop: a központ megtett intézkedése, amelyet az admin a listából is rögzíthet |
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: sikeres build (a `db:init` nem cserél, a migrátor nem talál új migrációt, a `next build` típusellenőrzése hibátlan). Ha nem létező `app/...` modulra panaszkodik, az a futó dev szerver elavult `.next/dev/types/validator.ts`-e: `rm .next/dev/types/validator.ts`, majd újra build (lásd CLAUDE.md).

- [ ] **Step 4: A data/tet.db nem került a változások közé**

Run: `git status --short`
Expected: csak ` M data/tet.db` (a munkafában eleve módosított) és a két dokumentációs fájl; a `data/tet.db`-t ne add hozzá.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "docs(jelentesek): az attasé-szűrő a CLAUDE.md-ben és a README-ben

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Böngészős próba (a vezérlő végzi a futó dev szerveren)

Nem subagent-task. A TéT dev szerver a 3000-es porton fut (a figyelő folyamat munkakönyvtára ez a repó – QA előtt `lsof -a -p <pid> -d cwd`-vel újra ellenőrizd). gstack: `~/.claude/skills/gstack/browse/dist/browse`. Jelszót ne írj ki, kitöltés után ne `snapshot`-olj. A `/login`-on előbb `wait --networkidle`.

- [ ] QA-bejegyzések a futó DB-be (a Task 1 Step 1 négy `insert`-je a `data/tet.db`-re, `qa-attase-1..4` id-val és „QA attasé-szűrő 1..4” tárggyal): Komma Krisztián (DE) ×2, Kindert Judit (DE) ×1, Jávori Balázs (AT) ×1.
- [ ] Adminként `/jelentesek`: az „Attasé” legördülő az Ország után; opciói „Mind”, „Jávori Balázs”, „Kindert Judit”, „Komma Krisztián”.
- [ ] „Komma Krisztián” → 2 bejegyzés, az URL-ben `attase=<id>`; az Ország „DE” mellett is 2; az Ország „AT”-re váltva 0 és „Nincs a szűrőknek megfelelő bejegyzés.”; a „Szűrők törlése” után 4 bejegyzés, mindkét legördülőn „Mind”.
- [ ] `/jelentesek?attase=nincs-ilyen` → 4 bejegyzés, a legördülőn „Mind”, nincs „Szűrők törlése” gomb.
- [ ] Attaséként (Komma Krisztián, a demó jelszó a `.env.example` `DEMO_ATTASE_PASSWORD`-je) `/jelentesek`: nincs Ország- és Attasé-legördülő, 2 bejegyzés, nincs „Szűrők törlése”; `?attase=<Kindert id>` és `?orszag=AT` mellett is a saját 2 bejegyzés, „Szűrők törlése” nélkül.
- [ ] Takarítás: kijelentkezés mindkét fiókból (a gstack session-sorai törlődnek), `delete from riport where id like 'qa-attase-%'` a `data/tet.db`-n, `select count(*) from riport` → `0`. A `data/tet.db` nem kerül commitba.
