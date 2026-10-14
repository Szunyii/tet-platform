# Kommunikáció: ticket több címzettnek („Mindenki”, régiók) – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A központ (admin) az új ticketet egyszerre több attasénak is címezhesse – mindenkinek, régiónként vagy egyenként választva –, címzettenként külön szállal, és az adatlapon lássa, ki hol tart.

**Architecture:** Az országszótár minden országa kötelező `regio` mezőt kap (öt régió). A címzett-jelöltek az attasé összes országát is hozzák, ebből egy tiszta modul (`lib/ticket-cimzettek.ts`) számolja a régió-csoportokat. A létrehozás egy tranzakcióban címzettenként egy önálló ticketet ír; a több címzettes küldés ticketjeit egy új, nullable `ticket.korlevel_id` köti össze. A dialógus legördülője helyett bejelölős lista + gyorsgombok; az admin adatlapja a körlevél ticketjeit listázza.

**Tech Stack:** Next.js 16 App Router (server actions, `revalidatePath`, `redirect`), React 19, TypeScript, Drizzle ORM + better-sqlite3, drizzle-kit migrációk, shadcn/ui (Base UI) + Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-10-14-kommunikacio-korlevel-design.md`

---

## Közös tudnivalók minden taskhoz

- Repó: `/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next`, ág: `kommunikacio-korlevel` (már létezik, ezen kell dolgozni; ne válts ágat).
- Scratchpad (eldobható scriptek, DB-másolatok): `/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/85dd8b25-8254-4183-9cd5-5a43bd1bb329/scratchpad` – a lépésekben `$SCR`. Minden parancs előtt: `SCR=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/85dd8b25-8254-4183-9cd5-5a43bd1bb329/scratchpad`.
- Nincs tesztkeretrendszer. Ellenőrzés: `npx tsc --noEmit`, eldobható tsx scriptek a scratchpadben (`node:assert/strict`), a végén `npm run build`.
- A scratchpad-scriptek a repó fájljait **abszolút úttal** importálják (`/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/...`); csupasz csomagnevet (`drizzle-orm`) nem tudnak feloldani, ezért ne importálj csomagot. `db/queries/*`-t importáló scriptet így futtass: `NODE_OPTIONS="--conditions=react-server" npx tsx <script>` (a `server-only` guard miatt).
- DB-t érintő ellenőrzés csak **másolaton**: `DATABASE_URL=<másolat> …`. A `data/tet.db`-hez a tasks 1–5 nem nyúlhat (a 6. task `npm run build`-je migrálja, az rendben van). A `data/tet.db` módosítva van a munkafában – **ne commitold**.
- Ne indíts és ne állíts le dev szervert. Ne használj `git add -A`/`git add .`-t, csak a felsorolt fájlokat add hozzá. Nincs stash/reset/checkout fájlokra.
- A felület szövegei magyarok; a kód azonosítói a környezethez igazodnak (magyar nevek). A meglévő fájlok relatív importot használnak.
- Commit-üzenet végére: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Fájlok

| Fájl | Változás | Felelősség |
| --- | --- | --- |
| `lib/orszagok.ts` | módosul | `RegioKulcs`, `ORSZAG_REGIOK`, `Orszag.regio` (174 sor), `orszagRegio()` |
| `lib/ticket-szotar.ts` | módosul | `CimzettJelolt` + `varos`, `orszagok` |
| `lib/ticket-cimzettek.ts` | új | `jeloltRegioi`, `regioJeloltjei`, `regioCsoportok` (tiszta) |
| `db/queries/ticket.ts` | módosul | `listCimzettJeloltek` bővítés, `korlevelId` a listában, `createTicketek`, `listKorlevelTagok` |
| `db/schema/ticket.ts` | módosul | `korlevelId` oszlop + index |
| `drizzle/0011_korlevel.sql` (+ meta) | új (generált) | `ALTER TABLE ticket ADD korlevel_id`, index |
| `lib/ticket-validacio.ts` | módosul | `cimzettek[]`, `elavultCimzett` |
| `app/(app)/kommunikacio/actions.ts` | módosul | `createTicketAction` több címzettel |
| `app/(app)/kommunikacio/components/CimzettValaszto.tsx` | új | gyorsgombok + bejelölős lista |
| `app/(app)/kommunikacio/components/UjTicketDialog.tsx` | módosul | a választó beépítése, gombfelirat, leírás |
| `app/(app)/kommunikacio/lista-url.ts` | új | a lista szűrős URL-építője (a `TicketLista`-ból kiemelve) |
| `app/(app)/kommunikacio/components/TicketLista.tsx` | módosul | „Körlevél ·” jelzés, `listaUrl` import |
| `app/(app)/kommunikacio/components/KorlevelTagok.tsx` | új | az admin adatlap körlevél-része |
| `app/(app)/kommunikacio/components/TicketAdatlap.tsx` | módosul | körlevél-rész (admin) / megjegyzés (attasé) |
| `app/(app)/kommunikacio/page.tsx` | módosul | `listKorlevelTagok` hívás, új propok |
| `CLAUDE.md`, `README.md`, a spec | módosul | dokumentáció |

---

### Task 1: Régiók az országszótárban

**Files:**
- Modify: `lib/orszagok.ts`
- Create (scratch): `$SCR/ell-kl-1-regiok.ts`, `$SCR/regio-beir.mjs`

- [ ] **Step 1: Az ellenőrző script megírása**

`$SCR/ell-kl-1-regiok.ts`:

```ts
// Task 1: minden szótárbeli ország pontosan egy régióban, a spec függeléke szerinti darabszámokkal.
import assert from 'node:assert/strict';
import { ORSZAG_REGIOK, ORSZAGOK, orszagRegio } from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/lib/orszagok';

assert.deepEqual(
  ORSZAG_REGIOK.map((r) => [r.kulcs, r.cimke]),
  [['europa', 'Európa'], ['azsia', 'Ázsia és Óceánia'], ['kozelKelet', 'Közel-Kelet'], ['afrika', 'Afrika'], ['amerika', 'Amerika']],
);
assert.equal(ORSZAGOK.length, 174);
const db: Record<string, number> = {};
for (const o of ORSZAGOK) {
  assert.ok(ORSZAG_REGIOK.some((r) => r.kulcs === o.regio), `ismeretlen régió: ${o.kod}`);
  db[o.regio] = (db[o.regio] ?? 0) + 1;
}
assert.deepEqual(db, { europa: 45, azsia: 36, kozelKelet: 14, afrika: 49, amerika: 30 });

// Határesetek (spec: Döntések táblázat)
const vart: [string, string][] = [
  ['RU', 'europa'], ['TR', 'europa'], ['GE', 'europa'], ['AM', 'europa'], ['AZ', 'europa'], ['HU', 'europa'],
  ['EG', 'afrika'], ['MA', 'afrika'], ['DZ', 'afrika'], ['TN', 'afrika'], ['MR', 'afrika'],
  ['KZ', 'azsia'], ['AF', 'azsia'], ['PK', 'azsia'], ['AU', 'azsia'],
  ['IL', 'kozelKelet'], ['IR', 'kozelKelet'], ['PR', 'amerika'], ['VI', 'amerika'], ['CA', 'amerika'],
];
for (const [kod, r] of vart) assert.equal(orszagRegio(kod), r, kod);
assert.equal(orszagRegio('XX'), undefined);
assert.equal(orszagRegio(null), undefined);
assert.equal(orszagRegio(undefined), undefined);
console.log('OK – regiok');
```

- [ ] **Step 2: Futtatás – el kell buknia**

Run: `npx tsx $SCR/ell-kl-1-regiok.ts`
Expected: hiba (az `ORSZAG_REGIOK` / `orszagRegio` még nem létezik – `TypeError` vagy assert-hiba).

- [ ] **Step 3: Típus, konstans és segéd a `lib/orszagok.ts`-ben**

A fájl elején, az `Orszag` interfész **elé**:

```ts
/**
 * Régiók a kommunikáció címzett-csoportjaihoz (Új ticket: „Európa” stb. gyorsgombok). Minden
 * szótárbeli ország pontosan egy régióban van (az `Orszag.regio` kötelező, így új ország régió
 * nélkül nem vehető fel). Határesetek: Oroszország, a Kaukázus és Törökország Európa; Egyiptom és
 * a Maghreb Afrika; Közép-Ázsia, Afganisztán, Pakisztán Ázsia és Óceánia. A térkép `REGIOK`-ja
 * (`lib/terkep-mutatok.ts`) ettől független: az nagyítási befoglaló téglalap, átfedő régiókkal.
 */
export type RegioKulcs = 'europa' | 'azsia' | 'kozelKelet' | 'afrika' | 'amerika';

/** A régiók a gyorsgombok sorrendjében. */
export const ORSZAG_REGIOK: readonly { kulcs: RegioKulcs; cimke: string }[] = [
  { kulcs: 'europa', cimke: 'Európa' },
  { kulcs: 'azsia', cimke: 'Ázsia és Óceánia' },
  { kulcs: 'kozelKelet', cimke: 'Közel-Kelet' },
  { kulcs: 'afrika', cimke: 'Afrika' },
  { kulcs: 'amerika', cimke: 'Amerika' },
];
```

Az `Orszag` interfész végére (a `lonlat` után):

```ts
  /** A kommunikáció régió-csoportja (`ORSZAG_REGIOK`). */
  regio: RegioKulcs;
```

Az `orszagNev` függvény **után**:

```ts
/** Az ország régiója; ismeretlen vagy hiányzó kódra `undefined`. */
export function orszagRegio(kod: string | null | undefined): RegioKulcs | undefined {
  return orszagByKod(kod)?.regio;
}
```

- [ ] **Step 4: A 174 sor kiegészítése scripttel**

`$SCR/regio-beir.mjs` (a régiók a spec függelékéből):

```js
// Egyszeri: a lib/orszagok.ts minden országsorának végére `regio` mező a spec függeléke szerint.
import { readFileSync, writeFileSync } from 'node:fs';

const F = '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/lib/orszagok.ts';
const R = {
  europa: 'AL AM AT AZ BA BE BG BY CH CY CZ DE DK EE ES FI FR GB GE GR HR HU IE IS IT LT LU LV MD ME MK MT NL NO PL PT RO RS RU SE SI SK TR UA XK',
  azsia: 'AF AU BD BN BT CN FJ ID IN JP KG KH KP KR KZ LA LK MM MN MV MY NP NZ PG PH PK SB SG TH TJ TL TM TW UZ VN VU',
  kozelKelet: 'AE BH IL IQ IR JO KW LB OM PS QA SA SY YE',
  afrika: 'AO BF BI BJ BW CD CF CG CI CM DJ DZ EG ER ET GA GH GM GN GQ GW KE LR LS LY MA MG ML MR MW MZ NA NE NG RW SD SL SN SO SS SZ TD TG TN TZ UG ZA ZM ZW',
  amerika: 'AR BO BR BS BZ CA CL CO CR CU DO EC GT GY HN HT JM MX NI PA PE PR PY SR SV TT US UY VE VI',
};
const regio = new Map();
for (const [r, kodok] of Object.entries(R)) {
  for (const k of kodok.split(' ')) {
    if (regio.has(k)) throw new Error(`kétszer szerepel: ${k}`);
    regio.set(k, r);
  }
}
let db = 0;
const ki = readFileSync(F, 'utf8')
  .split('\n')
  .map((sor) => {
    const m = sor.match(/^  \{ kod: '([A-Z]{2})', (.*) \},$/);
    if (!m) return sor;
    if (m[2].includes('regio:')) throw new Error(`már van régiója: ${m[1]}`);
    const r = regio.get(m[1]);
    if (!r) throw new Error(`nincs régió: ${m[1]}`);
    regio.delete(m[1]);
    db++;
    return `  { kod: '${m[1]}', ${m[2]}, regio: '${r}' },`;
  });
if (db !== 174 || regio.size !== 0) throw new Error(`sorok: ${db}, kimaradt: ${[...regio.keys()].join(',')}`);
writeFileSync(F, ki.join('\n'));
console.log('OK – 174 sor');
```

Run: `node $SCR/regio-beir.mjs`
Expected: `OK – 174 sor`

- [ ] **Step 5: Az ellenőrzés és a típusellenőrzés lefut**

Run: `npx tsx $SCR/ell-kl-1-regiok.ts && npx tsc --noEmit && echo TSC-OK`
Expected: `OK – regiok` és `TSC-OK`. (Ha a tsc máshol `Orszag` literált talál `regio` nélkül, ott is pótold a régiót.)

Nézz bele a diffbe (`git diff --stat lib/orszagok.ts` → 1 fájl; `git diff lib/orszagok.ts | grep '^+  { kod' | wc -l` → 174).

- [ ] **Step 6: Commit**

```bash
git add lib/orszagok.ts
git commit -m "feat(orszagok): öt régió (Európa, Ázsia és Óceánia, Közel-Kelet, Afrika, Amerika) – minden ország kötelező regio mezővel

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Címzett-jelöltek az attasé összes országával + régió-csoportok

**Files:**
- Modify: `lib/ticket-szotar.ts` (a `CimzettJelolt` interfész)
- Modify: `db/queries/ticket.ts` (`listCimzettJeloltek`)
- Create: `lib/ticket-cimzettek.ts`
- Create (scratch): `$SCR/ell-kl-2-jeloltek.ts`, DB-másolat `$SCR/korlevel-olvas.db`

- [ ] **Step 1: Az ellenőrző script megírása**

`$SCR/ell-kl-2-jeloltek.ts`:

```ts
// Task 2: a jelöltek az attasé összes országát hozzák; régiótagság székhely + regionális országok alapján.
// Futtatás a demó DB másolatán: DATABASE_URL=$SCR/korlevel-olvas.db
import assert from 'node:assert/strict';
import { listCimzettJeloltek } from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/db/queries/ticket';
import { jeloltRegioi, regioCsoportok, regioJeloltjei } from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/lib/ticket-cimzettek';

const j = listCimzettJeloltek();
assert.equal(j.length, 15);
// magyar névsor
assert.deepEqual(j.map((x) => x.nev), [...j.map((x) => x.nev)].sort((a, b) => a.localeCompare(b, 'hu')));

const szilvia = j.find((x) => x.nev === 'Szántó Szilvia')!;
assert.equal(szilvia.orszag, 'FR');
assert.equal(szilvia.varos, 'Párizs');
assert.deepEqual(szilvia.orszagok, ['FR', 'DZ', 'MA', 'MR', 'TN']);
assert.deepEqual(jeloltRegioi(szilvia), ['europa', 'afrika']);

const daczi = j.find((x) => x.nev === 'Daczi Diána')!;
assert.equal(daczi.orszagok[0], 'IN', 'a székhely elöl');
assert.deepEqual(jeloltRegioi(daczi), ['azsia']);

// minden jelöltnek van székhely-országa az orszagok elején
for (const x of j) assert.equal(x.orszagok[0], x.orszag, x.nev);

const cs = regioCsoportok(j);
assert.deepEqual(
  cs.map((c) => [c.kulcs, c.cimke, c.idk.length]),
  [['europa', 'Európa', 7], ['azsia', 'Ázsia és Óceánia', 4], ['kozelKelet', 'Közel-Kelet', 1], ['afrika', 'Afrika', 1], ['amerika', 'Amerika', 3]],
);
// a csoport sorrendje a jelöltlista sorrendje
const eu = regioJeloltjei(j, 'europa');
assert.deepEqual(eu, j.filter((x) => eu.includes(x.id)).map((x) => x.id));
assert.ok(regioJeloltjei(j, 'afrika').includes(szilvia.id));

// tiszta esetek
assert.deepEqual(jeloltRegioi({ orszagok: ['XX', 'JP', 'KR'] }), ['azsia']);
assert.deepEqual(jeloltRegioi({ orszagok: [] }), []);
assert.deepEqual(regioCsoportok([]), []);
console.log('OK – jeloltek');
```

- [ ] **Step 2: DB-másolat és futtatás – el kell buknia**

```bash
sqlite3 data/tet.db ".backup '$SCR/korlevel-olvas.db'"
DATABASE_URL=$SCR/korlevel-olvas.db NODE_OPTIONS="--conditions=react-server" npx tsx $SCR/ell-kl-2-jeloltek.ts
```

Expected: hiba (a `lib/ticket-cimzettek` modul nem létezik).

- [ ] **Step 3: `CimzettJelolt` bővítése (`lib/ticket-szotar.ts`)**

A meglévő interfészt cseréld erre:

```ts
/** Az admin által választható címzett: nem tiltott attasé, akinek van székhelye. */
export interface CimzettJelolt {
  id: string;
  nev: string;
  /** A székhely országkódja (a ticket `orszag` pillanatképe). */
  orszag: string;
  /** A székhely városa; `null`, ha nincs megadva. */
  varos: string | null;
  /** Az attasé összes országkódja (székhely és regionális lefedettség), a székhely elöl – a régió-gombokhoz. */
  orszagok: string[];
}
```

- [ ] **Step 4: `listCimzettJeloltek` (`db/queries/ticket.ts`)**

A meglévő függvényt cseréld erre (a doc-komment is):

```ts
/**
 * Az admin új-ticket dialógusához: nem tiltott attasék, akiknek van székhelye, magyar
 * névsorrendben; az `orszag` a székhely kódja (a ticket pillanatképe), a `varos` a székhely
 * városa, az `orszagok` az összes országa (a székhely elöl, utána a regionálisak kód szerint) –
 * ebből számolódnak a régió-gombok (`lib/ticket-cimzettek.ts`).
 */
export function listCimzettJeloltek(): CimzettJelolt[] {
  const most = Date.now();
  const szekhelyesek = db
    .select({
      id: user.id,
      nev: user.name,
      orszag: attaseOrszag.orszagKod,
      varos: attaseOrszag.varos,
      role: user.role,
      banned: user.banned,
      banExpires: user.banExpires,
    })
    .from(user)
    .innerJoin(attaseOrszag, and(eq(attaseOrszag.userId, user.id), eq(attaseOrszag.szekhely, true)))
    .all()
    .filter((u) => u.role !== 'admin' && !tiltottE(u, most));
  // A regionális országok egy lekérdezéssel, felhasználónként csoportosítva.
  const regionalis = new Map<string, string[]>();
  const regionalisSorok = db
    .select({ userId: attaseOrszag.userId, kod: attaseOrszag.orszagKod })
    .from(attaseOrszag)
    .where(eq(attaseOrszag.szekhely, false))
    .orderBy(attaseOrszag.orszagKod)
    .all();
  for (const s of regionalisSorok) {
    const lista = regionalis.get(s.userId);
    if (lista) lista.push(s.kod);
    else regionalis.set(s.userId, [s.kod]);
  }
  return szekhelyesek
    .map((u) => ({
      id: u.id,
      nev: u.nev,
      orszag: u.orszag,
      varos: u.varos || null,
      orszagok: [u.orszag, ...(regionalis.get(u.id) ?? [])],
    }))
    .sort((a, b) => a.nev.localeCompare(b.nev, 'hu'));
}
```

- [ ] **Step 5: `lib/ticket-cimzettek.ts` (új)**

```ts
/**
 * Az új-ticket címzettválasztójának tiszta segédei: az attasék régiói és a régió-csoportok (a
 * „Mindenki” mellett ezekből lesznek a gyorsgombok). Egy attasé minden olyan régióba tartozik,
 * ahol a székhelye vagy bármelyik regionálisan lefedett országa van. Framework- és DB-mentes.
 */
import { ORSZAG_REGIOK, orszagRegio, type RegioKulcs } from './orszagok';
import type { CimzettJelolt } from './ticket-szotar';

/** Az attasé régiói ismétlés nélkül, az `ORSZAG_REGIOK` sorrendjében; ismeretlen országkód kimarad. */
export function jeloltRegioi(j: Pick<CimzettJelolt, 'orszagok'>): RegioKulcs[] {
  const benne = new Set(j.orszagok.map((kod) => orszagRegio(kod)));
  return ORSZAG_REGIOK.map((r) => r.kulcs).filter((k) => benne.has(k));
}

/** A régió attaséinak id-jai a jelöltlista sorrendjében. */
export function regioJeloltjei(jeloltek: readonly CimzettJelolt[], regio: RegioKulcs): string[] {
  return jeloltek.filter((j) => jeloltRegioi(j).includes(regio)).map((j) => j.id);
}

export interface RegioCsoport {
  kulcs: RegioKulcs;
  cimke: string;
  idk: string[];
}

/** A nem üres régiók csoportjai az `ORSZAG_REGIOK` sorrendjében (a gyorsgombokhoz). */
export function regioCsoportok(jeloltek: readonly CimzettJelolt[]): RegioCsoport[] {
  return ORSZAG_REGIOK.map((r) => ({ kulcs: r.kulcs, cimke: r.cimke, idk: regioJeloltjei(jeloltek, r.kulcs) })).filter(
    (cs) => cs.idk.length > 0,
  );
}
```

- [ ] **Step 6: Futtatás – át kell mennie**

```bash
DATABASE_URL=$SCR/korlevel-olvas.db NODE_OPTIONS="--conditions=react-server" npx tsx $SCR/ell-kl-2-jeloltek.ts
npx tsc --noEmit && echo TSC-OK
```

Expected: `OK – jeloltek`, `TSC-OK`. (A `UjTicketDialog` a `CimzettJelolt` új mezőit még nem használja, de lefordul.)

- [ ] **Step 7: Commit**

```bash
git add lib/ticket-szotar.ts db/queries/ticket.ts lib/ticket-cimzettek.ts
git commit -m "feat(kommunikacio): a címzett-jelöltek az attasé összes országával és városával; régió-csoportok (lib/ticket-cimzettek.ts)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Adatréteg – `korlevel_id`, validálás, létrehozás több címzettnek

**Files:**
- Modify: `db/schema/ticket.ts`
- Create (generált): `drizzle/0011_korlevel.sql`, `drizzle/meta/0011_snapshot.json`, módosul `drizzle/meta/_journal.json`
- Modify: `lib/ticket-validacio.ts`
- Modify: `db/queries/ticket.ts`
- Modify: `app/(app)/kommunikacio/actions.ts`
- Create (scratch): `$SCR/ell-kl-3-validacio.ts`, `$SCR/ell-kl-4-db.ts`, DB-másolat `$SCR/korlevel-teszt.db`

- [ ] **Step 1: A validátor ellenőrző scriptje**

`$SCR/ell-kl-3-validacio.ts`:

```ts
// Task 3: parseUjTicketForm több címzettel.
import assert from 'node:assert/strict';
import type { CimzettJelolt } from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/lib/ticket-szotar';
import { parseUjTicketForm } from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/lib/ticket-validacio';

const J: CimzettJelolt[] = [
  { id: 'a', nev: 'Aladár', orszag: 'AT', varos: 'Bécs', orszagok: ['AT'] },
  { id: 'b', nev: 'Béla', orszag: 'FR', varos: null, orszagok: ['FR', 'DZ'] },
  { id: 'c', nev: 'Cecil', orszag: 'JP', varos: 'Tokió', orszagok: ['JP'] },
];

function fd(cimzettek: string[], extra: Record<string, string> = {}): FormData {
  const f = new FormData();
  for (const c of cimzettek) f.append('cimzettId', c);
  const alap = { tipus: 'adatkeres', prio: 'kozepes', hatarido: '', targy: 'Tárgy', szoveg: 'Szöveg' };
  for (const [k, v] of Object.entries({ ...alap, ...extra })) f.set(k, v);
  return f;
}

// egy címzett
let r = parseUjTicketForm(fd(['b']), J);
assert.ok(r.ok);
assert.deepEqual(r.data.cimzettek, [{ id: 'b', orszag: 'FR' }]);
assert.equal(r.data.targy, 'Tárgy');
assert.equal(r.data.hatarido, null);

// több: a jelöltlista sorrendjében, ismétlés és szóköz nélkül
r = parseUjTicketForm(fd(['c', 'a', 'c', ' a ']), J);
assert.ok(r.ok);
assert.deepEqual(r.data.cimzettek, [{ id: 'a', orszag: 'AT' }, { id: 'c', orszag: 'JP' }]);

// nincs kijelölt; az üres string nem számít
for (const ures of [[], ['']]) {
  r = parseUjTicketForm(fd(ures), J);
  assert.ok(!r.ok);
  assert.equal(r.errors.cimzettId, 'Válassz legalább egy címzettet.');
  assert.equal(r.elavultCimzett, false);
}

// ismeretlen (közben kiesett) címzett
r = parseUjTicketForm(fd(['a', 'x', 'y']), J);
assert.ok(!r.ok);
assert.equal(
  r.errors.cimzettId,
  'A kijelöltek közül 2 címzett már nem választható (nem attasé, tiltott, vagy nincs székhelye). A lista frissült, ellenőrizd a kijelölést.',
);
assert.equal(r.elavultCimzett, true);

// nincs jelölt: űrlap-szintű hiba, mezőhiba nincs
r = parseUjTicketForm(fd(['a']), []);
assert.ok(!r.ok);
assert.equal(r.errors.form, 'Nincs címezhető attasé.');
assert.equal(r.errors.cimzettId, undefined);

// fájl típusú érték kiesik
const f = fd(['a']);
f.append('cimzettId', new File(['x'], 'x.txt'));
r = parseUjTicketForm(f, J);
assert.ok(r.ok);
assert.deepEqual(r.data.cimzettek.map((c) => c.id), ['a']);

// a többi mező szabálya változatlan
r = parseUjTicketForm(fd(['a'], { targy: '', tipus: 'nincs', hatarido: '2026-02-30' }), J);
assert.ok(!r.ok);
assert.equal(r.errors.targy, 'A tárgy kötelező.');
assert.equal(r.errors.tipus, 'Válassz típust.');
assert.equal(r.errors.hatarido, 'Érvénytelen dátum.');
assert.equal(r.elavultCimzett, false);
console.log('OK – validacio');
```

- [ ] **Step 2: A DB ellenőrző scriptje**

`$SCR/ell-kl-4-db.ts`:

```ts
// Task 3: createTicketek, korlevelId, listKorlevelTagok, láthatóság.
// Futtatás a MIGRÁLT másolaton: DATABASE_URL=$SCR/korlevel-teszt.db
import assert from 'node:assert/strict';
import { db } from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/db/index';
import { user } from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/db/schema';
import {
  countOlvasatlan,
  createTicketek,
  getTicket,
  listCimzettJeloltek,
  listKorlevelTagok,
  listTicketek,
} from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/db/queries/ticket';

const admin = db.select().from(user).all().find((u) => u.role === 'admin');
assert.ok(admin, 'van admin a demó DB-ben');
const adminNezo = { userId: admin.id, role: 'admin' as const };
const nyito = { id: admin.id, nev: admin.name, szerep: 'admin' as const };
const alap = { tipus: 'adatkeres' as const, prio: 'magas' as const, hatarido: '2026-11-30', targy: 'Körlevél-teszt', szoveg: 'Kérjük a válaszotokat.' };

const j = listCimzettJeloltek();
assert.ok(j.length >= 5);
assert.equal(listTicketek(adminNezo, 'mind').length, 0, 'a demó DB-ben nincs ticket');

// Több címzett: közös korlevelId, címzettenként egy ticket, egy nyitó üzenet, a nyitónak olvasott.
const tobb = j.slice(0, 3);
const idk = createTicketek({ ...alap, cimzettek: tobb.map((c) => ({ id: c.id, orszag: c.orszag })), nyito });
assert.equal(idk.length, 3);
assert.equal(new Set(idk).size, 3);
const reszletek = idk.map((id) => getTicket(id, adminNezo)!);
const kl = reszletek[0].korlevelId;
assert.ok(kl, 'van korlevelId');
reszletek.forEach((t, i) => {
  assert.equal(t.korlevelId, kl);
  assert.equal(t.cimzettId, tobb[i].id);
  assert.equal(t.orszag, tobb[i].orszag);
  assert.equal(t.statusz, 'nyitott');
  assert.equal(t.targy, 'Körlevél-teszt');
  assert.equal(t.hatarido, '2026-11-30');
  assert.equal(t.uzenetek.length, 1);
  assert.equal(t.uzenetek[0].szoveg, 'Kérjük a válaszotokat.');
  assert.equal(t.uzenetek[0].szerzoSzerep, 'admin');
  assert.equal(t.olvasatlan, false, 'a nyitónak olvasott');
});
assert.ok(listTicketek(adminNezo, 'mind').every((t) => t.korlevelId === kl));

// A körlevél tagjai: mindhárom, a címzett neve szerinti magyar névsorban.
const tagok = listKorlevelTagok(kl!);
assert.deepEqual(tagok.map((t) => t.id).sort(), [...idk].sort());
assert.deepEqual(tagok.map((t) => t.cimzettNev), [...tagok.map((t) => t.cimzettNev)].sort((a, b) => a.localeCompare(b, 'hu')));
assert.ok(tagok.every((t) => t.statusz === 'nyitott'));
assert.deepEqual(listKorlevelTagok('nincs-ilyen'), []);

// Attasé: csak a sajátját látja, neki olvasatlan.
const nezo0 = { userId: tobb[0].id, role: 'attase' as const };
const sajat = listTicketek(nezo0, 'mind');
assert.deepEqual(sajat.map((t) => t.id), [idk[0]]);
assert.equal(sajat[0].olvasatlan, true);
assert.equal(countOlvasatlan(nezo0), 1);
assert.equal(getTicket(idk[1], nezo0), null);

// Egy címzett: nincs körlevél.
const [egyId] = createTicketek({ ...alap, targy: 'Egyedi', cimzettek: [{ id: j[3].id, orszag: j[3].orszag }], nyito });
assert.equal(getTicket(egyId, adminNezo)!.korlevelId, null);

// Tranzakció: ha egy címzett hibás (nem létező user → FK hiba), egyik ticket sem jön létre.
const elotte = listTicketek(adminNezo, 'mind').length;
assert.throws(() =>
  createTicketek({ ...alap, cimzettek: [{ id: j[4].id, orszag: j[4].orszag }, { id: 'nincs-ilyen-user', orszag: 'AT' }], nyito }),
);
assert.equal(listTicketek(adminNezo, 'mind').length, elotte);

// Üres címzettlista: dob.
assert.throws(() => createTicketek({ ...alap, cimzettek: [], nyito }));
console.log('OK – db');
```

- [ ] **Step 3: Futtatás – mindkettő el kell bukjon**

```bash
npx tsx $SCR/ell-kl-3-validacio.ts
sqlite3 data/tet.db ".backup '$SCR/korlevel-teszt.db'"
DATABASE_URL=$SCR/korlevel-teszt.db NODE_OPTIONS="--conditions=react-server" npx tsx $SCR/ell-kl-4-db.ts
```

Expected: az első assert-hibával bukik (a `data.cimzettek` nem létezik), a második `createTicketek is not a function`-szerű hibával.

- [ ] **Step 4: Séma (`db/schema/ticket.ts`)**

A `lezarvaAt` oszlop után:

```ts
    // Több címzettes küldés („körlevél”) közös azonosítója: a küldés minden ticketje ugyanazt kapja,
    // egy címzettnél null. Nincs külön tábla és FK – a körlevél a ticketek összessége.
    korlevelId: text('korlevel_id'),
```

Az index-listába (a `ticket_updated_idx` után):

```ts
    index('ticket_korlevel_idx').on(t.korlevelId),
```

A fájl tetején a ticket-komment végére egy mondat: `// Több címzettnél címzettenként külön ticket készül, közös korlevel_id-val.`

- [ ] **Step 5: Migráció generálása és ellenőrzése**

Run: `npm run db:generate -- --name=korlevel`
Expected: új `drizzle/0011_korlevel.sql`. Tartalma **pontosan** ez a két utasítás legyen (sorrend mindegy):

```sql
ALTER TABLE `ticket` ADD `korlevel_id` text;--> statement-breakpoint
CREATE INDEX `ticket_korlevel_idx` ON `ticket` (`korlevel_id`);
```

Ha `__new_ticket` / `DROP TABLE` szerepel benne, **állj meg** és jelezd (a `ticket` szülőtábla, az újraépítés kaszkádolva törölné az üzeneteket).

Majd a másolat migrálása:

```bash
DATABASE_URL=$SCR/korlevel-teszt.db npx drizzle-kit migrate
sqlite3 "$SCR/korlevel-teszt.db" "pragma table_info(ticket);" | grep korlevel_id
```

Expected: a `korlevel_id|TEXT|0||0` sor.

- [ ] **Step 6: Validátor (`lib/ticket-validacio.ts`)**

Az `UjTicketInput` és a `ParseUjTicketResult` helyett:

```ts
export interface UjTicketCimzett {
  id: string;
  /** A címzett székhely-országa (a ticket `orszag` pillanatképe). */
  orszag: string;
}

export interface UjTicketInput {
  /** Legalább egy címzett, ismétlés nélkül, a jelöltlista sorrendjében. */
  cimzettek: UjTicketCimzett[];
  tipus: TipusKulcs;
  prio: PrioKulcs;
  hatarido: string | null;
  targy: string;
  szoveg: string;
}

/**
 * Hibánál az `elavultCimzett` jelzi, hogy a beküldött címzettek között a jelöltlistán már nem
 * szereplő is volt (közben letiltották, vagy megszűnt a székhelye): az action ilyenkor a
 * layoutot is revalidálja, hogy a dialógus listája frissüljön.
 */
export type ParseUjTicketResult =
  | { ok: true; data: UjTicketInput }
  | { ok: false; errors: MezoHibak; elavultCimzett: boolean };
```

A `parseUjTicketForm` eleje (a `cimzettId`/`cimzett` rész) helyett:

```ts
export function parseUjTicketForm(fd: FormData, jeloltek: readonly CimzettJelolt[]): ParseUjTicketResult {
  const errors: MezoHibak = {};

  // Bejelölős lista: minden kijelölt attasé egy `cimzettId` mező. Csak nem üres string, ismétlés nélkül.
  const kert = new Set(
    fd
      .getAll('cimzettId')
      .filter((v): v is string => typeof v === 'string')
      .map((v) => v.trim())
      .filter(Boolean),
  );
  const cimzettek = jeloltek.filter((j) => kert.has(j.id)).map((j) => ({ id: j.id, orszag: j.orszag }));
  const elavult = kert.size - cimzettek.length;
  if (jeloltek.length === 0) {
    errors.form = 'Nincs címezhető attasé.';
  } else if (kert.size === 0) {
    errors.cimzettId = 'Válassz legalább egy címzettet.';
  } else if (elavult > 0) {
    errors.cimzettId = `A kijelöltek közül ${elavult} címzett már nem választható (nem attasé, tiltott, vagy nincs székhelye). A lista frissült, ellenőrizd a kijelölést.`;
  }
```

A függvény vége helyett (a `tipus`/`prio`/`hatarido`/`targy`/`szoveg` rész változatlan marad):

```ts
  if (Object.keys(errors).length > 0 || !tipus || !prio) {
    return { ok: false, errors, elavultCimzett: elavult > 0 };
  }
  return {
    ok: true,
    data: { cimzettek, tipus, prio, hatarido: hataridoRaw || null, targy, szoveg },
  };
}
```

- [ ] **Step 7: Lekérdezések (`db/queries/ticket.ts`)**

a) A `TicketListItem`-be az `olvasatlan` után:

```ts
  /** Több címzettes küldés közös azonosítója; egy címzettnél `null`. */
  korlevelId: string | null;
```

b) A `listOszlopok` objektumába az `olvasatlan` után: `korlevelId: ticket.korlevelId,`

c) A `createTicket` függvényt (doc-kommenttel együtt) cseréld erre:

```ts
/**
 * Tranzakcióban címzettenként egy ticket + a nyitó üzenet + a nyitó olvasás-jelölése (azonos
 * időbélyeggel); bármely hibánál egyik sem jön létre. Több címzettnél a ticketek közös
 * `korlevelId`-t kapnak, egynél `null`. Visszaadja az id-ket a címzettek sorrendjében.
 */
export function createTicketek(input: TicketCreate): string[] {
  if (input.cimzettek.length === 0) throw new Error('Nincs címzett.');
  const korlevelId = input.cimzettek.length > 1 ? crypto.randomUUID() : null;
  const idk = input.cimzettek.map(() => crypto.randomUUID());
  const most = new Date();
  db.transaction((tx) => {
    input.cimzettek.forEach((c, i) => {
      const id = idk[i];
      tx.insert(ticket)
        .values({
          id,
          targy: input.targy,
          tipus: input.tipus,
          prio: input.prio,
          hatarido: input.hatarido,
          statusz: 'nyitott',
          cimzettId: c.id,
          orszag: c.orszag,
          nyitoId: input.nyito.id,
          korlevelId,
        })
        .run();
      tx.insert(ticketUzenet)
        .values({
          id: crypto.randomUUID(),
          ticketId: id,
          szerzoId: input.nyito.id,
          szerzoNev: input.nyito.nev,
          szerzoSzerep: input.nyito.szerep,
          szoveg: input.szoveg,
          createdAt: most,
        })
        .run();
      tx.insert(ticketOlvasas).values({ ticketId: id, userId: input.nyito.id, latottAt: most }).run();
    });
  });
  return idk;
}
```

d) A fájl végére:

```ts
export interface KorlevelTag {
  id: string;
  cimzettNev: string;
  orszag: string;
  statusz: StatuszKulcs;
}

/**
 * Egy körlevél ticketjei az admin adatlapjához, a címzett neve szerinti magyar névsorban.
 * Láthatósági szűrés nincs benne: csak admin nézetből hívható (a page így hívja).
 */
export function listKorlevelTagok(korlevelId: string): KorlevelTag[] {
  return db
    .select({ id: ticket.id, cimzettNev: user.name, orszag: ticket.orszag, statusz: ticket.statusz })
    .from(ticket)
    .innerJoin(user, eq(ticket.cimzettId, user.id))
    .where(eq(ticket.korlevelId, korlevelId))
    .all()
    .map((r) => ({ ...r, statusz: r.statusz as StatuszKulcs }))
    .sort((a, b) => a.cimzettNev.localeCompare(b.cimzettNev, 'hu'));
}
```

- [ ] **Step 8: Action (`app/(app)/kommunikacio/actions.ts`)**

Az importban `createTicket` → `createTicketek`. A `createTicketAction` törzse:

```ts
export async function createTicketAction(_prev: TicketFormState, formData: FormData): Promise<TicketFormState> {
  const session = await requireAdmin();
  const parsed = parseUjTicketForm(formData, listCimzettJeloltek());
  if (!parsed.ok) {
    // Közben kiesett címzett: a dialógus jelöltlistája is frissüljön.
    if (parsed.elavultCimzett) frissit();
    return { errors: parsed.errors };
  }
  let idk: string[];
  try {
    idk = createTicketek({ ...parsed.data, nyito: { id: session.userId, nev: session.name, szerep: 'admin' } });
  } catch (err) {
    unstable_rethrow(err);
    console.error('[ticket] createTicketek sikertelen:', err);
    return { errors: { form: MENTES_HIBA } };
  }
  frissit();
  // Több címzettnél az első (a jelöltlista sorrendjében) ticketre visz; a többi a listában van.
  redirect(`/kommunikacio?t=${idk[0]}`);
}
```

- [ ] **Step 9: Futtatás – mindkettő át kell menjen, és a típusellenőrzés is**

```bash
npx tsx $SCR/ell-kl-3-validacio.ts
DATABASE_URL=$SCR/korlevel-teszt.db NODE_OPTIONS="--conditions=react-server" npx tsx $SCR/ell-kl-4-db.ts
npx tsc --noEmit && echo TSC-OK
```

Expected: `OK – validacio`, `OK – db`, `TSC-OK`. Ha a tsc a `UjTicketDialog`-ra panaszkodik, az a 4. task dolga – ebben a taskban nem szabad, hogy panaszkodjon (a dialógus csak a `CimzettJelolt` mezőit és a `createTicketAction`-t használja, ezek kompatibilisek). Az `ell-kl-4-db.ts` a másolatot módosítja: újrafuttatás előtt készíts új másolatot és migráld (Step 3 + Step 5 második fele).

- [ ] **Step 10: Commit**

```bash
git add db/schema/ticket.ts drizzle/0011_korlevel.sql drizzle/meta/0011_snapshot.json drizzle/meta/_journal.json lib/ticket-validacio.ts db/queries/ticket.ts "app/(app)/kommunikacio/actions.ts"
git commit -m "feat(kommunikacio): ticket több címzettnek – címzettenként külön ticket egy tranzakcióban, közös korlevel_id (0011), listKorlevelTagok

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Címzettválasztó a dialógusban

**Files:**
- Create: `app/(app)/kommunikacio/components/CimzettValaszto.tsx`
- Modify: `app/(app)/kommunikacio/components/UjTicketDialog.tsx`

- [ ] **Step 1: `CimzettValaszto.tsx` (új)**

```tsx
'use client';

import { useLayoutEffect, useRef } from 'react';
import { MezoHiba } from '../../../../components/form/MezoHiba';
import { Button } from '../../../../components/ui/button';
import { orszagNev } from '../../../../lib/orszagok';
import { regioCsoportok } from '../../../../lib/ticket-cimzettek';
import type { CimzettJelolt } from '../../../../lib/ticket-szotar';
import type { MezoHibak } from '../../../../lib/urlap';

/**
 * Az új ticket címzettjei: gyorsgombok („Mindenki”, régiónként, „Kijelölés törlése”) és bejelölős
 * lista. A gyorsgomb kapcsoló (`aria-pressed`): benyomott, ha a csoport minden tagja ki van jelölve;
 * benyomatlanul hozzáadja a tagokat a kijelöléshez, benyomva kiveszi őket – így két régió egymás
 * után összeadható. A jelölőnégyzetek (`name="cimzettId"`) mindig az aktuális jelöltlistából
 * épülnek: a revalidálás után eltűnt jelölt nem küldődik be, akkor sem, ha a kijelölésben maradt.
 * Az első jelölőnégyzet id-ja `cimzettId`: erre ugrik a fókusz a mezőhibánál (`useMuveletForm`).
 */
export function CimzettValaszto({
  jeloltek,
  kijelolt,
  onChange,
  errors,
}: {
  jeloltek: CimzettJelolt[];
  kijelolt: string[];
  onChange: (kijelolt: string[]) => void;
  errors: MezoHibak;
}) {
  const kijeloltSet = new Set(kijelolt);
  const csoportok = [{ kulcs: 'mind', cimke: 'Mindenki', idk: jeloltek.map((j) => j.id) }, ...regioCsoportok(jeloltek)];
  const darab = jeloltek.filter((j) => kijeloltSet.has(j.id)).length;
  const hiba = Boolean(errors.cimzettId);

  function kapcsol(idk: string[], mindBenne: boolean) {
    if (mindBenne) onChange(kijelolt.filter((id) => !idk.includes(id)));
    else onChange([...kijelolt, ...idk.filter((id) => !kijeloltSet.has(id))]);
  }

  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-1.5 text-sm font-medium">Címzettek</legend>
      <div className="flex flex-wrap gap-1.5">
        {csoportok.map((cs) => {
          const mindBenne = cs.idk.length > 0 && cs.idk.every((id) => kijeloltSet.has(id));
          return (
            <Button
              key={cs.kulcs}
              type="button"
              size="sm"
              variant={mindBenne ? 'default' : 'outline'}
              aria-pressed={mindBenne}
              onClick={() => kapcsol(cs.idk, mindBenne)}
            >
              {cs.cimke} ({cs.idk.length})
            </Button>
          );
        })}
        <Button type="button" size="sm" variant="ghost" disabled={darab === 0} onClick={() => onChange([])}>
          Kijelölés törlése
        </Button>
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {darab} kijelölve
      </p>
      <ul className="flex max-h-64 flex-col overflow-y-auto rounded-md border">
        {jeloltek.map((j, i) => (
          <li key={j.id} className="border-b last:border-b-0">
            <CimzettJelolo
              id={i === 0 ? 'cimzettId' : `cimzettId-${j.id}`}
              jelolt={j}
              bejelolve={kijeloltSet.has(j.id)}
              hiba={hiba}
              onChange={(be) => onChange(be ? [...kijelolt, j.id] : kijelolt.filter((id) => id !== j.id))}
            />
          </li>
        ))}
      </ul>
      <MezoHiba mezo="cimzettId" errors={errors} />
    </fieldset>
  );
}

/**
 * Egy jelölt sora natív checkbox-szal (a components/ui-ban nincs checkbox). A `defaultChecked`
 * render után a vezérelt értéket követi: a React 19 a `<form action>` után `form.reset()`-et hív, és
 * a jelölő különben a kezdőértékre ugrana vissza (ugyanez a minta, mint a `VezetoJelolo`-ban).
 */
function CimzettJelolo({
  id,
  jelolt,
  bejelolve,
  hiba,
  onChange,
}: {
  id: string;
  jelolt: CimzettJelolt;
  bejelolve: boolean;
  hiba: boolean;
  onChange: (bejelolve: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    if (ref.current && ref.current.defaultChecked !== bejelolve) ref.current.defaultChecked = bejelolve;
  });
  return (
    <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/40">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        name="cimzettId"
        value={jelolt.id}
        checked={bejelolve}
        onChange={(e) => onChange(e.target.checked)}
        aria-invalid={hiba || undefined}
        aria-describedby={hiba ? 'cimzettId-hiba' : undefined}
        className="size-4 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
      <span className="min-w-0 truncate">
        {jelolt.nev} <span className="text-muted-foreground">· {jelolt.varos || orszagNev(jelolt.orszag)}</span>
      </span>
    </label>
  );
}
```

- [ ] **Step 2: `UjTicketDialog.tsx` módosítása**

a) Importok: a `useMemo` és az `orszagNev` import kikerül (már nem kell); új import: `import { CimzettValaszto } from './CimzettValaszto';`. A `react` import: `import { useState } from 'react';`.

b) A `UjTicketModal`-ban a `const [cimzettId, setCimzettId] = useState('');` helyett:

```tsx
  const [kijelolt, setKijelolt] = useState<string[]>([]);
```

A `cimzettItems` `useMemo` blokk helyett:

```tsx
  // A gomb felirata csak a még választható kijelölteket számolja (revalidálás után a lista szűkülhet).
  const darab = jeloltek.filter((j) => kijelolt.includes(j.id)).length;
```

c) A `MuveletDialog` propjai:

```tsx
      cim="Új ticket"
      leiras="Kérés vagy feladat egy vagy több TéT attasénak. Több címzettnél mindenki külön ticketet kap, a válaszokat csak a központ látja. Az első üzenet a ticket nyitó szövege."
      gomb={darab > 1 ? `Létrehozás (${darab} címzett)` : 'Létrehozás'}
      gombFolyamatban="Létrehozás…"
```

d) A „Címzett attasé” `<Valaszto id="cimzettId" … />` blokk helyett:

```tsx
      {jeloltek.length > 0 && (
        <CimzettValaszto jeloltek={jeloltek} kijelolt={kijelolt} onChange={setKijelolt} errors={errors} />
      )}
```

A `Valaszto` komponens marad (a típus és a prioritás használja); a doc-kommentje változatlan.

- [ ] **Step 3: Típusellenőrzés**

Run: `npx tsc --noEmit && echo TSC-OK`
Expected: `TSC-OK`. Ellenőrizd `grep -n "cimzettItems\|useMemo\|setCimzettId" "app/(app)/kommunikacio/components/UjTicketDialog.tsx"` → nincs találat.

- [ ] **Step 4: Commit**

```bash
git add "app/(app)/kommunikacio/components/CimzettValaszto.tsx" "app/(app)/kommunikacio/components/UjTicketDialog.tsx"
git commit -m "feat(kommunikacio): címzettválasztó – „Mindenki”, régió-gombok és bejelölős lista az Új ticket dialógusban

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Körlevél a listában és az adatlapon

**Files:**
- Create: `app/(app)/kommunikacio/lista-url.ts`
- Create: `app/(app)/kommunikacio/components/KorlevelTagok.tsx`
- Modify: `app/(app)/kommunikacio/components/TicketLista.tsx`
- Modify: `app/(app)/kommunikacio/components/TicketAdatlap.tsx`
- Modify: `app/(app)/kommunikacio/page.tsx`

- [ ] **Step 1: `lista-url.ts` (új; a `TicketLista`-ból kiemelve)**

```ts
import type { TicketSzuro } from '../../../lib/ticket-szotar';

/**
 * `/kommunikacio` URL a szűrővel (aktiv = alapértelmezett, nem kerül az URL-be) és a
 * kiválasztott tickettel. A `t`-t szándékosan megtartjuk akkor is, ha az adott ticket nem
 * felel meg az új szűrőnek: az oldal így nyitva tartja a beszélgetést, csak a sor nem
 * lesz kiemelve a listában. A lista és az adatlap körlevél-része is ezt használja.
 */
export function listaUrl(szuro: TicketSzuro, t?: string): string {
  const p = new URLSearchParams();
  if (szuro !== 'aktiv') p.set('sz', szuro);
  if (t) p.set('t', t);
  const q = p.toString();
  return q ? `/kommunikacio?${q}` : '/kommunikacio';
}
```

- [ ] **Step 2: `TicketLista.tsx`**

a) Töröld a fájlbeli `listaUrl` függvényt a doc-kommentjével együtt, és importáld: `import { listaUrl } from '../lista-url';`. Ha a `TicketSzuro` típus importja így csak a propokhoz kell, maradjon.

b) A meta-sor (`<p className="mt-0.5 text-xs text-muted-foreground">`) tartalma:

```tsx
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {admin && t.korlevelId && 'Körlevél · '}
                    {admin && `${orszagNev(t.orszag)} · ${t.cimzettNev} · `}
                    {t.uzenetSzam} üzenet
                  </p>
```

- [ ] **Step 3: `KorlevelTagok.tsx` (új)**

```tsx
import Link from 'next/link';
import type { KorlevelTag } from '../../../../db/queries/ticket';
import { orszagNev } from '../../../../lib/orszagok';
import type { TicketSzuro } from '../../../../lib/ticket-szotar';
import { cn } from '../../../../lib/utils';
import { listaUrl } from '../lista-url';
import { StatuszBadge } from './TicketJelzesek';

/**
 * Az admin adatlapján: a körlevél ticketjei (címzettenként egy) a státuszukkal, mindegyik link a
 * saját ticketére a lista aktuális szűrőjével. Az aktuális ticket `aria-current="true"`-val
 * (a listában ugyanez a ticket már `aria-current="page"`).
 */
export function KorlevelTagok({ tagok, aktivId, szuro }: { tagok: KorlevelTag[]; aktivId: string; szuro: TicketSzuro }) {
  return (
    <section aria-labelledby="korlevel-cim" className="mt-4 flex flex-col gap-1.5">
      <h4 id="korlevel-cim" className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        Körlevél · {tagok.length} címzett
      </h4>
      <ul className="flex flex-col">
        {tagok.map((t) => {
          const aktiv = t.id === aktivId;
          return (
            <li key={t.id}>
              <Link
                href={listaUrl(szuro, t.id)}
                aria-current={aktiv ? 'true' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded px-1.5 py-1 text-[13px] text-foreground no-underline hover:bg-muted/40 hover:no-underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  aktiv && 'bg-primary/10',
                )}
              >
                <span className="min-w-0 flex-1 truncate">
                  {t.cimzettNev} · {orszagNev(t.orszag)}
                </span>
                <StatuszBadge statusz={t.statusz} />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
```

- [ ] **Step 4: `TicketAdatlap.tsx`**

a) Importok: `import type { KorlevelTag, TicketDetail } from '../../../../db/queries/ticket';` (a meglévő `TicketDetail` import helyett), `import { lejartE, type TicketSzuro } from '../../../../lib/ticket-szotar';` (a meglévő `lejartE` import helyett), `import { KorlevelTagok } from './KorlevelTagok';`.

b) Új propok a `ma` után:

```tsx
  /** A lista aktuális szűrője (a körlevél-linkekhez). */
  szuro: TicketSzuro;
  /** A körlevél ticketjei – csak adminnál és csak körlevél-ticketnél, különben `null`. */
  korlevel: KorlevelTag[] | null;
```

(és a destrukturálásba: `szuro, korlevel,`).

c) A `<dl>` végére, a `lezarvaAt` sor után:

```tsx
          {!admin && ticket.korlevelId && (
            <Sor cimke="Körlevél">A központ több attasénak is elküldte; a válaszodat csak a központ látja.</Sor>
          )}
```

d) A `</dl>` után, az `{admin && ( <div className="mt-4"> <TicketStatuszGombok …` blokk **elé**:

```tsx
        {admin && korlevel && korlevel.length > 0 && (
          <KorlevelTagok tagok={korlevel} aktivId={ticket.id} szuro={szuro} />
        )}
```

- [ ] **Step 5: `page.tsx`**

a) Az importba: `listKorlevelTagok`.

b) A `const jeloltek = …` sor után:

```tsx
  // A körlevél ticketjei: csak az admin adatlapja mutatja (az attasé a többi címzettet nem látja).
  const korlevel = admin && kivalasztott?.korlevelId ? listKorlevelTagok(kivalasztott.korlevelId) : null;
```

c) A `<TicketAdatlap …>` propjai közé: `szuro={szuro}` és `korlevel={korlevel}`.

- [ ] **Step 6: Típusellenőrzés**

Run: `npx tsc --noEmit && echo TSC-OK`
Expected: `TSC-OK`. `grep -n "function listaUrl" -r "app/(app)/kommunikacio"` → csak a `lista-url.ts`.

- [ ] **Step 7: Commit**

```bash
git add "app/(app)/kommunikacio/lista-url.ts" "app/(app)/kommunikacio/components/KorlevelTagok.tsx" "app/(app)/kommunikacio/components/TicketLista.tsx" "app/(app)/kommunikacio/components/TicketAdatlap.tsx" "app/(app)/kommunikacio/page.tsx"
git commit -m "feat(kommunikacio): körlevél a listában („Körlevél ·”) és az adatlapon – adminnak a címzettek státusszal, attasénak megjegyzés

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Dokumentáció és build

**Files:**
- Modify: `CLAUDE.md`, `README.md`, `docs/superpowers/specs/2026-10-14-kommunikacio-korlevel-design.md`

- [ ] **Step 1: CLAUDE.md – az országszótár exportjai (Auth bekezdés)**

Keresd: ``– `ORSZAGOK` magyar név szerint rendezve, `orszagByKod`, `orszagNev`, `ORSZAG_KOD_RE`, `HAZAI_KOD` = `HU` + `hazaiE` –``
Cseréld: ``– `ORSZAGOK` magyar név szerint rendezve, `orszagByKod`, `orszagNev`, `ORSZAG_KOD_RE`, `HAZAI_KOD` = `HU` + `hazaiE`, `RegioKulcs`/`ORSZAG_REGIOK`/`orszagRegio` (öt régió a kommunikáció címzett-csoportjaihoz; az `Orszag.regio` kötelező, új ország csak régióval vehető fel; a térkép `REGIOK`-jától független) –``

- [ ] **Step 2: CLAUDE.md – Kommunikáció bekezdés**

a) Keresd: `` `createTicket`, `addUzenet` – státuszt is állít``
Cseréld: `` `createTicketek` – címzettenként egy ticket egy tranzakcióban, több címzettnél közös `korlevel_id`-val, egynél `null` –, `listKorlevelTagok` – csak admin nézetből –, `addUzenet` – státuszt is állít``

b) Keresd: `` `listCimzettJeloltek` – a nem tiltott, székhellyel rendelkező attasék; a `ticket.orszag` a címzett székhely-országának pillanatképe)``
Cseréld: `` `listCimzettJeloltek` – a nem tiltott, székhellyel rendelkező attasék a székhely városával és az összes országukkal (`CimzettJelolt.orszagok`, a székhely elöl); a `ticket.orszag` a címzett székhely-országának pillanatképe)``

c) Keresd: `Csak admin nyit, zár le és nyit újra; attasé csak a hozzá címzettet látja.`
Cseréld: `Csak admin nyit, zár le és nyit újra; attasé csak a hozzá címzettet látja. **Több címzett (körlevél)**: az Új ticket dialógus `CimzettValaszto`-ja gyorsgombokkal („Mindenki”, régiónként – `lib/ticket-cimzettek.ts` `regioCsoportok`; egy attasé minden régióban benne van, ahol a székhelye vagy regionális országa van; a gomb kapcsoló, `aria-pressed`) és bejelölős listával (natív checkbox `name="cimzettId"`, `defaultChecked`-szinkronnal, az első jelölő id-ja `cimzettId` a hibafókuszhoz) választ; címzettenként külön ticket jön létre (saját szál, státusz, lezárás), a `ticket.korlevel_id` (0011) köti össze őket. A validátor (`parseUjTicketForm`) a jelöltlistán már nem szereplő címzettnél hibát ad `elavultCimzett`-tel, az action ilyenkor revalidál; siker után az első ticketre irányít. Admin: a listában „Körlevél ·” jelzés, az adatlapon `KorlevelTagok` (a körlevél ticketjei státusszal, linkkel – `lista-url.ts` `listaUrl`); attasé: csak egy megjegyzés, a többi címzett neve nem látszik. A körlevél egyben nem zárható le.`

- [ ] **Step 3: README.md**

Keresd: `Ticketek és üzenetszálak: az admin nyit ticketet egy attasénak, mindkét fél válaszol`
Cseréld: `Ticketek és üzenetszálak: az admin nyit ticketet egy vagy több attasénak (mindenkinek, régiónként vagy egyenként választva – címzettenként külön szál), mindkét fél válaszol`

- [ ] **Step 4: A spec állapota**

A spec `Állapot:` sora: `Állapot: megvalósítva; a böngészős próba és a demó DB commitja a dev szerverre vár`

- [ ] **Step 5: Build**

Run: `npm run build 2>&1 | tail -25`
Expected: a `drizzle-kit migrate` lefut (a `data/tet.db` megkapja a 0011-et), `✓ Compiled successfully`, és a route-lista végig. Ha a build nem létező `app/...` modulra panaszkodik a `.next/dev/types/validator.ts`-ből: `rm .next/dev/types/validator.ts` és újra (lásd CLAUDE.md).

Utána: `sqlite3 "file:data/tet.db?immutable=1" "pragma table_info(ticket);" | grep korlevel_id` → van sor.

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md README.md docs/superpowers/specs/2026-10-14-kommunikacio-korlevel-design.md
git commit -m "docs(kommunikacio): körlevél (több címzett, régiók) a CLAUDE.md-ben és a README-ben; a spec állapota

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

(A `data/tet.db` **nem** kerül a commitba.)

---

### Task 7: Böngészős próba (a vezérlő végzi, amikor a felhasználó TéT dev szervere fut)

Nem subagent-task: a dev szervert a felhasználó indítja (a 3000-es porton más projekt fut; a TéT a kimenetben jelzett porton). gstack: `~/.claude/skills/gstack/browse/dist/browse`. Jelszót ne írj ki, kitöltés után ne `snapshot`-olj.

- [ ] Adminként `/kommunikacio` → „Új ticket”: a gombok „Mindenki (15)”, „Európa (7)”, „Ázsia és Óceánia (4)”, „Közel-Kelet (1)”, „Afrika (1)”, „Amerika (3)”; „Kijelölés törlése” letiltva.
- [ ] „Európa” → 7 kijelölve, a gomb benyomott; „Afrika” → 7 marad (a párizsi attasé már benne), a gomb benyomott; „Európa” újra → csak az európaiak kikerülnek, az Afrika-gomb benyomatlan lesz (a párizsi attasé kiesett). „Mindenki” → 15, a gombfelirat „Létrehozás (15 címzett)”.
- [ ] Hibás beküldés (üres tárgy) után a kijelölés és a jelölőnégyzetek állapota megmarad, a fókusz a tárgyra ugrik; kijelölés nélkül „Válassz legalább egy címzettet.”, a fókusz az első jelölőre.
- [ ] Létrehozás 15 címzettnek → az első ticketre visz; a listában 15 „Körlevél ·” sor; az adatlapon „Körlevél · 15 címzett” a státuszokkal, a sorokra kattintva átvált.
- [ ] Attaséként (demó attasé) a saját ticket látszik, olvasatlan; az adatlapon a „Körlevél” megjegyzés, más címzett neve nincs; válasz után az admin adatlapján az ő sora „Folyamatban”.
- [ ] Egy címzettel létrehozott ticketnél nincs „Körlevél” jelzés és rész.
- [ ] Takarítás: a próba ticketjeinek törlése a demó DB-ből (`delete from ticket;` – a `ticket_uzenet` és `ticket_olvasas` kaszkádol), `delete from session`, majd `PRAGMA wal_checkpoint(TRUNCATE)` és `VACUUM` – a DB commitja a többi ággal együtt, egyszer.
