# Kommunikáció (ticketek és üzenetszálak) – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

A kódblokkok az eredeti tervet mutatják; a végleges kód eltéréseit taskonként a „Megvalósítási eltérések” szakasz sorolja fel.

**Goal:** A `/kommunikacio` képernyő valódi, adatbázisra épülő működése: az admin egy adott TéT attasénak ticketet nyit (típus, prioritás, határidő, tárgy, első üzenet), minden ticketnek saját üzenetszála van, az attasé a hozzá címzett ticketekben válaszol; státusz automatikus, admin zár le és nyit újra; olvasatlan-jelzés a listán és a sidebar menüpontján.

**Architecture:** Három új Drizzle tábla (`ticket`, `ticket_uzenet`, `ticket_olvasas`). Szótár (`lib/ticket-szotar.ts`), validátor (`lib/ticket-validacio.ts`) és jog (`lib/ticket-jog.ts`) tiszta modulok; minden Drizzle kód a `db/queries/ticket.ts`-ben. Egyetlen route: `app/(app)/kommunikacio/page.tsx` Server Component, `?t=<id>` (kiválasztott ticket) és `?sz=` (szűrő) URL-paraméterekkel; server action-ök az `app/(app)/kommunikacio/actions.ts`-ben; a route-specifikus komponensek `app/(app)/kommunikacio/components/` alatt. A felhasználók-feature `MuveletDialog`-ja `components/form/` alá költözik, mert az új ticket dialógus is használja. Az `AppShell` menü-számlálója a layoutból kapott `olvasatlan` prop.

**Tech Stack:** Next.js 16 (App Router, Server Actions, `useActionState`), React 19, TypeScript 7, drizzle-orm 0.45 + better-sqlite3 (szinkron tranzakció, `onConflictDoUpdate`, `alias`), Better Auth session (`lib/session.ts`), shadcn/ui v4 base-nova (`Badge`, `Button`, `Card`, `Dialog`, `AlertDialog`, `Select`, `Textarea`, `Input`, `Label`), Tailwind v4, sonner.

**Spec:** `docs/superpowers/specs/2026-09-09-kommunikacio-design.md`. Tudatos pontosítások a spechez képest, itt rögzítve: (1) a menü-számláló csak a **nem lezárt** olvasatlan ticketeket számolja (lezárt ticket az „Aktív" szűrőben nem látszik, a számláló beragadna); (2) a címzett-jelölteket egy saját lekérdezés adja (`listCimzettJeloltek`), nem a `listFelhasznalok()` szűrése; (3) a `getTicket(id, nezo)` a láthatóságtól függetlenül ad vissza, a jogot a hívó ellenőrzi `canViewTicket`-tel (mint a riportnál); (4) az üzenetek időbélyege dátum+idő (`formatDatumIdo`, új helper a `lib/datum.ts`-ben), a lejárt határidő számításához `maiNaptariNap()` szintén ott.

**Ellenőrzés:** Nincs tesztkeretrendszer. Minden task végén `npx tsc --noEmit`; a tiszta függvényeket eldobható tsx scripttel ellenőrizzük (`scripts/_x.ts`, utána törlendő); a UI-t a gstack headless böngészővel (`~/.claude/skills/gstack/browse/dist/browse`: `goto/fill/click/text/js/snapshot -i/console --errors`). A `db/queries/*` és `lib/session.ts` `server-only`: az őket importáló tsx scriptet `NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_x.ts` módon kell futtatni. A felhasználó dev szervere fut a 3000-en (ellenőrizve: a `/login` címe „Bejelentkezés · NIÜ · TéT Platform"): **nem szabad leállítani/újraindítani**. Seed admin: `.env.local` `SEED_ADMIN_EMAIL` (`admin@niu.hu`, a jelszót ne írd ki, a `.env.local`-ból olvasd); teszt attasék a lokális DB-ben: `teszt.attase@niu.hu` / `Teszt1234!` (Dél-Korea), `masodik.attase@niu.hu` / `Masodik1234!` (Japán). Cookie-s curl POST-hoz `-H 'Origin: http://localhost:3000'` kell. Commit üzenetek végén: `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

**Fontos API tények (ellenőrizve a meglévő kódban):**
- Drizzle sqlite: `integer('x', { mode: 'timestamp_ms' })` → `Date`; default `sql\`(cast(unixepoch('subsecond') * 1000 as integer))\``; `$onUpdate(() => new Date())` minden `update().set()`-nél fut; FK `.references(() => user.id, { onDelete: 'cascade' | 'set null' })`; index `(t) => [index('nev').on(t.a, t.b)]`; összetett PK `primaryKey({ columns: [t.a, t.b] })` a `drizzle-orm/sqlite-core`-ból; két join ugyanarra a táblára `alias(user, 'nyito')` (`drizzle-orm/sqlite-core`); upsert `.insert().values().onConflictDoUpdate({ target: [...], set: {...} }).run()`; tranzakció szinkron `db.transaction((tx) => {...})`.
- `lib/session.ts`: `AppSession { userId, name, email, role: 'admin' | 'attase', orszag }`, `AppRole`; `requireSession()` / `requireAdmin()` a `try`-on kívül.
- Form-minta: `components/form/useMuveletForm.ts` (`useMuveletForm(action, siker?, onKesz?)` → `[state, formAction, pending]`, `MuveletState { ok?, errors? }`, `FormAction`), `components/form/MezoHiba.tsx` (`MezoHiba`, `hibaAttr`). `lib/urlap.ts`: `mezo(fd, key)`, `tisztitSzoveg`, `MezoHibak`.
- Base UI `Select` (shadcn `components/ui/select.tsx`): `name` → rejtett input a FormData-ban; `items` (érték → címke map) a `SelectValue` címkéjéhez; `onValueChange(v: string | null)`; a trigger `role=combobox` gomb, ezért `aria-labelledby="<label-id> <sajat-id>"`.
- A Base UI `Dialog`/`AlertDialog` `onOpenChange(next, details)`: `details.cancel()` megakadályozza a zárást.
- Link gombként: `<Link className={buttonVariants({...})}>`, nem `Button render`.
- A demó `TICKETS`, `TICKET_TYPES`, `Ticket`, `TicketMsg` (`lib/data.ts`) csak a `app/(app)/kommunikacio/page.tsx` és a `components/AppShell.tsx` használja → törölhetők.

---

## Fájlstruktúra

| Fájl | Művelet | Felelősség |
| --- | --- | --- |
| `lib/ticket-szotar.ts` | létrehoz | típusok, prioritások, státuszok, szűrők, hosszlimitek, típusőrök |
| `lib/ticket-validacio.ts` | létrehoz | `parseUjTicketForm`, `parseUzenetForm` (FormData → típusos input), tiszta |
| `lib/ticket-jog.ts` | létrehoz | `canViewTicket`, `canWriteTicket` |
| `lib/datum.ts` | módosít | `formatDatumIdo(Date)`, `maiNaptariNap()` |
| `db/schema/ticket.ts` | létrehoz | `ticket`, `ticket_uzenet`, `ticket_olvasas`; `db/schema/index.ts` re-export; migráció `drizzle/0003_*` |
| `db/queries/ticket.ts` | létrehoz | `listTicketek`, `getTicket`, `createTicket`, `addUzenet`, `closeTicket`, `reopenTicket`, `jelolOlvasottnak`, `countOlvasatlan`, `listCimzettJeloltek` |
| `app/(app)/kommunikacio/actions.ts` | létrehoz | `createTicketAction`, `sendUzenetAction`, `closeTicketAction`, `reopenTicketAction` |
| `components/form/MuveletDialog.tsx` | áthelyez (`app/(app)/felhasznalok/components/` → ide) | közös form-dialógus keret |
| `app/(app)/kommunikacio/components/TicketJelzesek.tsx` | létrehoz | `StatuszBadge`, `TipusBadge`, `PrioJelzes`, `prioSzegely`, `Monogram` |
| `app/(app)/kommunikacio/components/TicketLista.tsx` | létrehoz | szűrő-linkek + ticketlista |
| `app/(app)/kommunikacio/components/UzenetUrlap.tsx` | létrehoz | válasz-textarea, Ctrl+Enter, `useMuveletForm` |
| `app/(app)/kommunikacio/components/TicketBeszelgetes.tsx` | létrehoz | fejléc + üzenetbuborékok + űrlap / lezárt jelzés |
| `app/(app)/kommunikacio/components/TicketStatuszGombok.tsx` | létrehoz | Lezárás (megerősítéssel) / Újranyitás, bind-olt action |
| `app/(app)/kommunikacio/components/TicketAdatlap.tsx` | létrehoz | jobb oldali adatlap |
| `app/(app)/kommunikacio/components/UjTicketDialog.tsx` | létrehoz | admin új ticket dialógus |
| `app/(app)/kommunikacio/page.tsx` | cserél | Server Component: session, lista, kiválasztott ticket, olvasott-jelölés, layout |
| `app/(app)/layout.tsx` | módosít | `countOlvasatlan(session)` → `AppShell olvasatlan` |
| `components/AppShell.tsx` | módosít | `olvasatlan` prop, `TICKETS` import törlése |
| `app/(app)/felhasznalok/components/FelhasznaloMuveletek.tsx` | módosít | törlés-dialógus szövege: a ticketek is törlődnek |
| `lib/data.ts` | módosít | `TICKET_TYPES`, `TicketMsg`, `Ticket`, `TICKETS` törlése |
| `README.md`, `CLAUDE.md` | módosít | kommunikáció szakasz, ismert korlátok |

---

### Task 1: Szótár, validátor, jog (tiszta modulok) és dátum-helperek

**Files:**
- Create: `lib/ticket-szotar.ts`
- Create: `lib/ticket-validacio.ts`
- Create: `lib/ticket-jog.ts`
- Modify: `lib/datum.ts` (a fájl végére)
- Test: `scripts/_ticket-validacio.ts` (eldobható)

- [x] **Step 1: Szótár**

`lib/ticket-szotar.ts`:

```ts
/**
 * A ticket (kommunikáció) szótárai. Framework-mentes konstansok: a form, a validáció,
 * a lekérdezések és a lista ugyanebből dolgozik. A kulcsok kerülnek a DB-be.
 */

export const TIPUSOK = {
  adatkeres: { nev: 'Adatkérés' },
  feladat: { nev: 'Feladatkiosztás' },
  riport_visszajelzes: { nev: 'Riport-visszajelzés' },
  egyeztetes: { nev: 'Egyeztetés' },
} as const;
export type TipusKulcs = keyof typeof TIPUSOK;
export const TIPUS_KULCSOK = Object.keys(TIPUSOK) as TipusKulcs[];

export const PRIORITASOK = {
  magas: { nev: 'Magas' },
  kozepes: { nev: 'Közepes' },
  alacsony: { nev: 'Alacsony' },
} as const;
export type PrioKulcs = keyof typeof PRIORITASOK;
export const PRIO_KULCSOK = Object.keys(PRIORITASOK) as PrioKulcs[];

export const STATUSZOK = {
  nyitott: { nev: 'Nyitott' },
  valaszra_var: { nev: 'Válaszra vár' }, // az attasé következik
  folyamatban: { nev: 'Folyamatban' }, // az attasé válaszolt, az NIÜ következik
  lezart: { nev: 'Lezárt' },
} as const;
export type StatuszKulcs = keyof typeof STATUSZOK;

/** A lista szűrője (?sz=). */
export const SZUROK = {
  aktiv: 'Aktív',
  magas: 'Magas prioritás',
  mind: 'Mind',
} as const;
export type TicketSzuro = keyof typeof SZUROK;
export const SZURO_KULCSOK = Object.keys(SZUROK) as TicketSzuro[];

export const TARGY_MAX = 200;
export const UZENET_MAX = 4000;

export function isTipusKulcs(v: string): v is TipusKulcs {
  return Object.prototype.hasOwnProperty.call(TIPUSOK, v);
}
export function isPrioKulcs(v: string): v is PrioKulcs {
  return Object.prototype.hasOwnProperty.call(PRIORITASOK, v);
}
export function isStatuszKulcs(v: string): v is StatuszKulcs {
  return Object.prototype.hasOwnProperty.call(STATUSZOK, v);
}

/** `?sz=` érték → szűrő; ismeretlen vagy hiányzó → `aktiv`. */
export function parseSzuro(v: unknown): TicketSzuro {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(SZUROK, v) ? (v as TicketSzuro) : 'aktiv';
}

/** Az üzenet szerzőjének szerepe (pillanatkép a DB-ben). */
export type UzenetSzerep = 'admin' | 'attase';
```

- [x] **Step 2: Validátor**

`lib/ticket-validacio.ts`:

```ts
/**
 * A ticket űrlapok tiszta validátorai (FormData → típusos input). Nincs React, nincs DB.
 * A hibák kulcsa a mező neve (= a mező DOM id-ja, hogy a fókusz az első hibás mezőre
 * ugorhasson), a `form` kulcs az űrlap-szintű hibáé.
 */
import { ervenyesNaptariDatum } from './datum';
import {
  isPrioKulcs,
  isTipusKulcs,
  TARGY_MAX,
  UZENET_MAX,
  type PrioKulcs,
  type TipusKulcs,
} from './ticket-szotar';
import { mezo, type MezoHibak } from './urlap';

/** Az admin által választható címzett: nem tiltott attasé, akinek van országa. */
export interface CimzettJelolt {
  id: string;
  nev: string;
  orszag: string;
}

export interface UjTicketInput {
  cimzettId: string;
  orszag: string;
  tipus: TipusKulcs;
  prio: PrioKulcs;
  hatarido: string | null;
  targy: string;
  szoveg: string;
}

export type ParseUjTicketResult = { ok: true; data: UjTicketInput } | { ok: false; errors: MezoHibak };
export type ParseUzenetResult = { ok: true; szoveg: string } | { ok: false; errors: MezoHibak };

function parseSzoveg(fd: FormData, errors: MezoHibak): string {
  const szoveg = mezo(fd, 'szoveg');
  if (!szoveg) errors.szoveg = 'Az üzenet nem lehet üres.';
  else if (szoveg.length > UZENET_MAX) errors.szoveg = `Az üzenet legfeljebb ${UZENET_MAX} karakter.`;
  return szoveg;
}

export function parseUjTicketForm(fd: FormData, jeloltek: readonly CimzettJelolt[]): ParseUjTicketResult {
  const errors: MezoHibak = {};

  const cimzettId = mezo(fd, 'cimzettId');
  const cimzett = jeloltek.find((j) => j.id === cimzettId);
  if (!cimzettId) errors.cimzettId = 'Válassz címzettet.';
  else if (!cimzett) errors.cimzettId = 'A címzett nem választható (nem attasé, tiltott, vagy nincs országa).';

  const tipus = mezo(fd, 'tipus');
  if (!isTipusKulcs(tipus)) errors.tipus = 'Válassz típust.';

  const prio = mezo(fd, 'prio');
  if (!isPrioKulcs(prio)) errors.prio = 'Válassz prioritást.';

  const hataridoRaw = mezo(fd, 'hatarido');
  if (hataridoRaw && !ervenyesNaptariDatum(hataridoRaw)) errors.hatarido = 'Érvénytelen dátum (ÉÉÉÉ-HH-NN).';

  const targy = mezo(fd, 'targy');
  if (!targy) errors.targy = 'A tárgy megadása kötelező.';
  else if (targy.length > TARGY_MAX) errors.targy = `A tárgy legfeljebb ${TARGY_MAX} karakter.`;

  const szoveg = parseSzoveg(fd, errors);

  if (Object.keys(errors).length > 0 || !cimzett || !isTipusKulcs(tipus) || !isPrioKulcs(prio)) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    data: {
      cimzettId: cimzett.id,
      orszag: cimzett.orszag,
      tipus,
      prio,
      hatarido: hataridoRaw || null,
      targy,
      szoveg,
    },
  };
}

export function parseUzenetForm(fd: FormData): ParseUzenetResult {
  const errors: MezoHibak = {};
  const szoveg = parseSzoveg(fd, errors);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, szoveg };
}
```

- [x] **Step 3: Jog**

`lib/ticket-jog.ts`:

```ts
import type { AppSession } from './session';
import type { StatuszKulcs } from './ticket-szotar';

/** A jogosultsághoz a címzett (és íráshoz a státusz) kell; a lista- és részlet-típusok is tartalmazzák. */
export interface TicketJogAlany {
  cimzettId: string;
}

/** Admin mindent lát; attasé csak a hozzá címzettet. */
export function canViewTicket(session: Pick<AppSession, 'userId' | 'role'>, t: TicketJogAlany): boolean {
  return session.role === 'admin' || t.cimzettId === session.userId;
}

/** Írni az láthat és nem lezárt ticketbe lehet. */
export function canWriteTicket(
  session: Pick<AppSession, 'userId' | 'role'>,
  t: TicketJogAlany & { statusz: StatuszKulcs },
): boolean {
  return canViewTicket(session, t) && t.statusz !== 'lezart';
}
```

- [x] **Step 4: Dátum-helperek**

`lib/datum.ts` végére:

```ts
const HU_DATUM_IDO = new Intl.DateTimeFormat('hu-HU', {
  timeZone: IDOZONA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

/** Dátum és idő magyar formában (pl. „2026. 09. 09. 14:32"), Europe/Budapest szerint. */
export function formatDatumIdo(d: Date): string {
  return HU_DATUM_IDO.format(d);
}

const ISO_NAP = new Intl.DateTimeFormat('en-CA', {
  timeZone: IDOZONA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** A mai naptári nap `YYYY-MM-DD` alakban, Europe/Budapest szerint (határidő-összevetéshez). */
export function maiNaptariNap(): string {
  return ISO_NAP.format(new Date());
}
```

- [x] **Step 5: Ellenőrző script**

`scripts/_ticket-validacio.ts`:

```ts
import assert from 'node:assert/strict';
import { formatDatumIdo, maiNaptariNap } from '../lib/datum';
import { parseSzuro } from '../lib/ticket-szotar';
import { parseUjTicketForm, parseUzenetForm } from '../lib/ticket-validacio';

const jeloltek = [{ id: 'u1', nev: 'Teszt Attasé', orszag: 'Dél-Korea' }];
function fd(o: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
}

// jó bemenet
const jo = parseUjTicketForm(
  fd({ cimzettId: 'u1', tipus: 'adatkeres', prio: 'magas', hatarido: '2026-09-30', targy: ' Tárgy ', szoveg: 'Kérés​' }),
  jeloltek,
);
assert.ok(jo.ok);
assert.deepEqual(jo.data, {
  cimzettId: 'u1', orszag: 'Dél-Korea', tipus: 'adatkeres', prio: 'magas',
  hatarido: '2026-09-30', targy: 'Tárgy', szoveg: 'Kérés',
});

// üres határidő → null
const nincsHatarido = parseUjTicketForm(fd({ cimzettId: 'u1', tipus: 'egyeztetes', prio: 'kozepes', hatarido: '', targy: 'T', szoveg: 'S' }), jeloltek);
assert.ok(nincsHatarido.ok && nincsHatarido.data.hatarido === null);

// hibák egy menetben
const rossz = parseUjTicketForm(
  fd({ cimzettId: 'u9', tipus: 'x', prio: 'y', hatarido: '2026-02-31', targy: 'a'.repeat(201), szoveg: '' }),
  jeloltek,
);
assert.ok(!rossz.ok);
assert.deepEqual(Object.keys(rossz.errors).sort(), ['cimzettId', 'hatarido', 'prio', 'szoveg', 'targy', 'tipus']);

// hiányzó címzett
const nincsCimzett = parseUjTicketForm(fd({ tipus: 'adatkeres', prio: 'magas', targy: 'T', szoveg: 'S' }), jeloltek);
assert.ok(!nincsCimzett.ok && nincsCimzett.errors.cimzettId === 'Válassz címzettet.');

// üzenet
assert.deepEqual(parseUzenetForm(fd({ szoveg: '  hello ' })), { ok: true, szoveg: 'hello' });
assert.ok(!parseUzenetForm(fd({ szoveg: '​' })).ok);
assert.ok(!parseUzenetForm(fd({ szoveg: 'a'.repeat(4001) })).ok);

// szűrő
assert.equal(parseSzuro('magas'), 'magas');
assert.equal(parseSzuro('mind'), 'mind');
assert.equal(parseSzuro(undefined), 'aktiv');
assert.equal(parseSzuro('__proto__'), 'aktiv');

// dátum
assert.match(maiNaptariNap(), /^\d{4}-\d{2}-\d{2}$/);
assert.match(formatDatumIdo(new Date('2026-09-09T12:32:00Z')), /^2026\. 09\. 09\. 14:32$/);

console.log('ticket-validacio OK');
```

Run: `npx tsx scripts/_ticket-validacio.ts`
Expected: `ticket-validacio OK`

- [x] **Step 6: Típusellenőrzés, script törlése, commit**

```bash
npx tsc --noEmit && rm scripts/_ticket-validacio.ts
git add lib/ticket-szotar.ts lib/ticket-validacio.ts lib/ticket-jog.ts lib/datum.ts
git commit -m "feat(kommunikacio): ticket szótár, validátor, jog és dátum-helperek

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

**Megvalósítási eltérések**

- A szótárak **laposak** (`Record<kulcs, cimke>`, pl. `TIPUSOK.adatkeres === 'Adatkérés'`), nem `{ nev }` objektumok; a hívók így `TIPUSOK[k]`-val olvassák a címkét.
- `isStatuszKulcs` kimaradt: sehol nem volt rá szükség (a státuszt csak a DB és a query réteg állítja). Maradt `isTipusKulcs` és `isPrioKulcs`.
- A `CimzettJelolt` interfész a szótárban él (nem a lekérdezésekben), így a validátor DB-mentes maradhat.
- `parseSzuro(v: string | string[] | undefined)`: közvetlenül a Next `searchParams` értékét fogadja; tömbnél az első elemet nézi, ismeretlen/hiányzó érték → `aktiv`.
- `maiNaptariNap()` a `lib/datum.ts`-ben `Intl.DateTimeFormat.formatToParts`-tal állítja össze az `YYYY-MM-DD`-t (nincs manuális eltolás-számítás).
- A `tisztitSzoveg` (`lib/urlap.ts`) a CRLF-et LF-re normalizálja, mielőtt szűrne és trimmelne – a textarea CRLF-fel küld, a `maxLength` viszont LF-ként számol.
- Hibaszövegek a projekt meglévő megfogalmazásaihoz igazítva: „A tárgy kötelező.", „Az üzenet kötelező.", „Érvénytelen dátum.".
- Ha nincs egyetlen címezhető attasé sem, a hiba űrlap-szintű (`errors.form = 'Nincs címezhető attasé.'`), nem a címzett mezőé.
- A típusőrök egyszer futnak le (`const tipus = isTipusKulcs(raw) ? raw : null`), az eredményt használja a hibaág és az adat-összeállítás is.
- Később, a UI-tasknál került ide két dolog: a `lejartE(hatarido, statusz, ma)` (a lista és az adatlap közösen használja) és a `parseSzoveg(fd, errors, kulcs)` kulcs-paramétere – a válasz-űrlap mezőneve `valasz`, hogy egy oldalon ne ütközzön az új-ticket dialógus `szoveg` id-jával.

---

### Task 2: Adatmodell (Drizzle séma, migráció)

**Files:**
- Create: `db/schema/ticket.ts`
- Modify: `db/schema/index.ts`
- Create (generált): `drizzle/0003_*.sql`, `drizzle/meta/0003_snapshot.json`, `drizzle/meta/_journal.json`

- [x] **Step 1: Séma**

`db/schema/ticket.ts`:

```ts
import { sql } from 'drizzle-orm';
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './auth';

// Ticket: az admin nyitja egy attasénak. A tipus/prio/statusz a lib/ticket-szotar.ts
// kulcsai. Az orszag a címzett nyitáskori országa (pillanatkép), nem követi a user
// későbbi módosítását. A nyitó kérés szövege az első ticket_uzenet sor.
export const ticket = sqliteTable(
  'ticket',
  {
    id: text('id').primaryKey(),
    targy: text('targy').notNull(),
    tipus: text('tipus').notNull(),
    prio: text('prio').notNull(),
    hatarido: text('hatarido'),
    statusz: text('statusz').notNull(),
    cimzettId: text('cimzett_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    orszag: text('orszag').notNull(),
    nyitoId: text('nyito_id').references(() => user.id, { onDelete: 'set null' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
    lezarvaAt: integer('lezarva_at', { mode: 'timestamp_ms' }),
  },
  (t) => [
    index('ticket_cimzett_idx').on(t.cimzettId),
    index('ticket_statusz_idx').on(t.statusz),
    index('ticket_updated_idx').on(t.updatedAt),
  ],
);

// Üzenet. A szerző neve és szerepe pillanatkép: törölt user után is olvasható marad a
// szál, és a buborék oldala (saját / másik fél) a szerep alapján dől el.
export const ticketUzenet = sqliteTable(
  'ticket_uzenet',
  {
    id: text('id').primaryKey(),
    ticketId: text('ticket_id')
      .notNull()
      .references(() => ticket.id, { onDelete: 'cascade' }),
    szerzoId: text('szerzo_id').references(() => user.id, { onDelete: 'set null' }),
    szerzoNev: text('szerzo_nev').notNull(),
    szerzoSzerep: text('szerzo_szerep').notNull(),
    szoveg: text('szoveg').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (t) => [index('ticket_uzenet_ticket_idx').on(t.ticketId, t.createdAt)],
);

// Felhasználónként mikor nézte meg utoljára a ticketet: ebből az olvasatlan-jelzés.
export const ticketOlvasas = sqliteTable(
  'ticket_olvasas',
  {
    ticketId: text('ticket_id')
      .notNull()
      .references(() => ticket.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    latottAt: integer('latott_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.ticketId, t.userId] })],
);
```

`db/schema/index.ts`:

```ts
export * from './auth';
export * from './riport';
export * from './ticket';
```

- [x] **Step 2: Migráció generálása és alkalmazása**

Run: `npm run db:generate`
Expected: új `drizzle/0003_<név>.sql` három `CREATE TABLE`-lel (`ticket`, `ticket_olvasas`, `ticket_uzenet`) és négy indexszel; `drizzle/meta/_journal.json` új bejegyzés.

Run: `npm run db:migrate`
Expected: hibátlan lefutás. Ellenőrzés: `sqlite3 data/tet.db ".tables"` tartalmazza a `ticket`, `ticket_uzenet`, `ticket_olvasas` táblákat (ha nincs `sqlite3` CLI: `node -e "const D=require('better-sqlite3');console.log(new D('data/tet.db').prepare(\"select name from sqlite_master where type='table' and name like 'ticket%'\").all())"`).

- [x] **Step 3: Típusellenőrzés és commit**

```bash
npx tsc --noEmit
git add db/schema/ticket.ts db/schema/index.ts drizzle/
git commit -m "feat(kommunikacio): ticket, ticket_uzenet, ticket_olvasas táblák és migráció

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

**Megvalósítási eltérések**

- A séma a terv szerint készült; a generált migráció neve `drizzle/0003_dapper_triton.sql`.

---

### Task 3: Lekérdezések (`db/queries/ticket.ts`)

**Files:**
- Create: `db/queries/ticket.ts`
- Test: `scripts/_ticket-queries.ts` (eldobható; a lokális DB-be ír, a végén takarít)

- [x] **Step 1: Lekérdezések**

`db/queries/ticket.ts`:

```ts
import 'server-only';
import { and, count, desc, eq, ne, sql, type SQL } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { db } from '../index';
import { ticket, ticketOlvasas, ticketUzenet, user } from '../schema';
import type { AppRole } from '../../lib/session';
import type {
  PrioKulcs,
  StatuszKulcs,
  TicketSzuro,
  TipusKulcs,
  UzenetSzerep,
} from '../../lib/ticket-szotar';
import type { CimzettJelolt, UjTicketInput } from '../../lib/ticket-validacio';

/** Aki nézi: a láthatósághoz és az olvasatlan-számításhoz kell. Az AppSession megfelel neki. */
export interface Nezo {
  userId: string;
  role: AppRole;
}

/** Az üzenet szerzője (pillanatképnek). */
export interface Szerzo {
  id: string;
  nev: string;
  szerep: UzenetSzerep;
}

export interface TicketListItem {
  id: string;
  targy: string;
  tipus: TipusKulcs;
  prio: PrioKulcs;
  hatarido: string | null;
  statusz: StatuszKulcs;
  cimzettId: string;
  cimzettNev: string;
  orszag: string;
  uzenetSzam: number;
  updatedAt: Date;
  /** A nézőhöz képest: van-e a másik szereptől üzenet a néző utolsó megtekintése után. */
  olvasatlan: boolean;
}

export interface Uzenet {
  id: string;
  szerzoNev: string;
  szerzoSzerep: UzenetSzerep;
  szoveg: string;
  createdAt: Date;
}

export interface TicketDetail extends TicketListItem {
  nyitoNev: string | null;
  createdAt: Date;
  lezarvaAt: Date | null;
  uzenetek: Uzenet[];
}

export type TicketCreate = UjTicketInput & { nyito: Szerzo };

// Van-e a néző szerepétől ELTÉRŐ szereptől üzenet a néző utolsó megtekintése után
// (megtekintés hiányában bármely ilyen üzenet). Szerep-alapú: két admin közül az egyik
// válasza a másiknak nem olvasatlan – elfogadott egyszerűsítés.
function olvasatlanSql(nezo: Nezo): SQL<number> {
  return sql<number>`exists (
    select 1 from ${ticketUzenet} u
    where u.ticket_id = ${ticket.id}
      and u.szerzo_szerep <> ${nezo.role}
      and u.created_at > coalesce(
        (select o.latott_at from ${ticketOlvasas} o where o.ticket_id = ${ticket.id} and o.user_id = ${nezo.userId}),
        0
      )
  )`;
}

const uzenetSzamSql = sql<number>`(select count(*) from ${ticketUzenet} where ${ticketUzenet.ticketId} = ${ticket.id})`;

function listOszlopok(nezo: Nezo) {
  return {
    id: ticket.id,
    targy: ticket.targy,
    tipus: ticket.tipus,
    prio: ticket.prio,
    hatarido: ticket.hatarido,
    statusz: ticket.statusz,
    cimzettId: ticket.cimzettId,
    cimzettNev: user.name,
    orszag: ticket.orszag,
    uzenetSzam: uzenetSzamSql,
    updatedAt: ticket.updatedAt,
    olvasatlan: olvasatlanSql(nezo),
  };
}

function tipusos(r: {
  tipus: string;
  prio: string;
  statusz: string;
  olvasatlan: number;
  [k: string]: unknown;
}) {
  return {
    ...r,
    tipus: r.tipus as TipusKulcs,
    prio: r.prio as PrioKulcs,
    statusz: r.statusz as StatuszKulcs,
    olvasatlan: r.olvasatlan === 1,
  };
}

/** Láthatósági feltétel: attasé csak a hozzá címzettet látja. */
function lathato(nezo: Nezo): SQL | undefined {
  return nezo.role === 'admin' ? undefined : eq(ticket.cimzettId, nezo.userId);
}

/** Lista a néző jogával és a szűrővel, legutóbb módosított elöl. */
export function listTicketek(nezo: Nezo, szuro: TicketSzuro): TicketListItem[] {
  const felt: SQL[] = [];
  const l = lathato(nezo);
  if (l) felt.push(l);
  if (szuro !== 'mind') felt.push(ne(ticket.statusz, 'lezart'));
  if (szuro === 'magas') felt.push(eq(ticket.prio, 'magas'));
  return db
    .select(listOszlopok(nezo))
    .from(ticket)
    .innerJoin(user, eq(ticket.cimzettId, user.id))
    .where(felt.length ? and(...felt) : undefined)
    .orderBy(desc(ticket.updatedAt))
    .all()
    .map((r) => tipusos(r) as TicketListItem);
}

/**
 * Egy ticket az üzeneteivel. NEM ellenőrzi a láthatóságot (a hívó `canViewTicket`-tel
 * teszi); a `nezo` az olvasatlan-jelzéshez kell.
 */
export function getTicket(id: string, nezo: Nezo): TicketDetail | null {
  const nyito = alias(user, 'nyito');
  const sor = db
    .select({
      ...listOszlopok(nezo),
      nyitoNev: nyito.name,
      createdAt: ticket.createdAt,
      lezarvaAt: ticket.lezarvaAt,
    })
    .from(ticket)
    .innerJoin(user, eq(ticket.cimzettId, user.id))
    .leftJoin(nyito, eq(ticket.nyitoId, nyito.id))
    .where(eq(ticket.id, id))
    .get();
  if (!sor) return null;
  const uzenetek = db
    .select({
      id: ticketUzenet.id,
      szerzoNev: ticketUzenet.szerzoNev,
      szerzoSzerep: ticketUzenet.szerzoSzerep,
      szoveg: ticketUzenet.szoveg,
      createdAt: ticketUzenet.createdAt,
    })
    .from(ticketUzenet)
    .where(eq(ticketUzenet.ticketId, id))
    .orderBy(ticketUzenet.createdAt, ticketUzenet.id)
    .all()
    .map((u) => ({ ...u, szerzoSzerep: u.szerzoSzerep as UzenetSzerep }));
  return { ...(tipusos(sor) as Omit<TicketDetail, 'uzenetek'>), uzenetek };
}

/** Tranzakcióban: ticket + nyitó üzenet; a nyitó rögtön olvasottnak jelöli. Visszaadja az id-t. */
export function createTicket(input: TicketCreate): string {
  const id = crypto.randomUUID();
  const most = new Date();
  db.transaction((tx) => {
    tx.insert(ticket)
      .values({
        id,
        targy: input.targy,
        tipus: input.tipus,
        prio: input.prio,
        hatarido: input.hatarido,
        statusz: 'nyitott',
        cimzettId: input.cimzettId,
        orszag: input.orszag,
        nyitoId: input.nyito.id,
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
      })
      .run();
    tx.insert(ticketOlvasas).values({ ticketId: id, userId: input.nyito.id, latottAt: most }).run();
  });
  return id;
}

/** A küldő szerepe szerinti státusz: admin után az attasé következik, és fordítva. */
function statuszKuldoSzerint(szerep: UzenetSzerep): StatuszKulcs {
  return szerep === 'admin' ? 'valaszra_var' : 'folyamatban';
}

/**
 * Új üzenet + státusz + updatedAt egy tranzakcióban. Lezárt vagy hiányzó ticketre dob
 * (az action előtte `canWriteTicket`-tel ellenőriz; ez a versenyhelyzet elleni védőháló).
 * A küldő számára rögtön olvasottnak jelöli a ticketet.
 */
export function addUzenet(ticketId: string, szerzo: Szerzo, szoveg: string): void {
  const most = new Date();
  db.transaction((tx) => {
    const t = tx.select({ statusz: ticket.statusz }).from(ticket).where(eq(ticket.id, ticketId)).get();
    if (!t) throw new Error('A ticket nem található.');
    if (t.statusz === 'lezart') throw new Error('A ticket le van zárva.');
    tx.insert(ticketUzenet)
      .values({
        id: crypto.randomUUID(),
        ticketId,
        szerzoId: szerzo.id,
        szerzoNev: szerzo.nev,
        szerzoSzerep: szerzo.szerep,
        szoveg,
        createdAt: most,
      })
      .run();
    tx.update(ticket).set({ statusz: statuszKuldoSzerint(szerzo.szerep) }).where(eq(ticket.id, ticketId)).run();
    tx.insert(ticketOlvasas)
      .values({ ticketId, userId: szerzo.id, latottAt: most })
      .onConflictDoUpdate({ target: [ticketOlvasas.ticketId, ticketOlvasas.userId], set: { latottAt: most } })
      .run();
  });
}

export function closeTicket(id: string): void {
  db.update(ticket).set({ statusz: 'lezart', lezarvaAt: new Date() }).where(eq(ticket.id, id)).run();
}

/** Újranyitás: a legutolsó üzenet küldője szerinti állapot; ha csak a nyitó üzenet van, `nyitott`. */
export function reopenTicket(id: string): void {
  db.transaction((tx) => {
    const utolsok = tx
      .select({ szerep: ticketUzenet.szerzoSzerep })
      .from(ticketUzenet)
      .where(eq(ticketUzenet.ticketId, id))
      .orderBy(desc(ticketUzenet.createdAt), desc(ticketUzenet.id))
      .limit(2)
      .all();
    const statusz: StatuszKulcs =
      utolsok.length <= 1 ? 'nyitott' : statuszKuldoSzerint(utolsok[0].szerep as UzenetSzerep);
    tx.update(ticket).set({ statusz, lezarvaAt: null }).where(eq(ticket.id, id)).run();
  });
}

/** Upsert: a felhasználó most látta a ticketet. Idempotens. */
export function jelolOlvasottnak(ticketId: string, userId: string, mikor = new Date()): void {
  db.insert(ticketOlvasas)
    .values({ ticketId, userId, latottAt: mikor })
    .onConflictDoUpdate({ target: [ticketOlvasas.ticketId, ticketOlvasas.userId], set: { latottAt: mikor } })
    .run();
}

/** Olvasatlan, NEM lezárt ticketek száma a néző számára (menü-számláló). */
export function countOlvasatlan(nezo: Nezo): number {
  const felt: SQL[] = [ne(ticket.statusz, 'lezart'), sql`${olvasatlanSql(nezo)} = 1`];
  const l = lathato(nezo);
  if (l) felt.push(l);
  const sor = db.select({ n: count() }).from(ticket).where(and(...felt)).get();
  return sor?.n ?? 0;
}

/** Az admin új-ticket dialógusához: nem tiltott attasék, akiknek van országa, magyar névsorrendben. */
export function listCimzettJeloltek(): CimzettJelolt[] {
  const most = Date.now();
  return db
    .select({ id: user.id, nev: user.name, orszag: user.orszag, role: user.role, banned: user.banned, banExpires: user.banExpires })
    .from(user)
    .all()
    .filter((u) => u.role !== 'admin' && u.orszag && !(u.banned && (!u.banExpires || u.banExpires.getTime() > most)))
    .map((u) => ({ id: u.id, nev: u.nev, orszag: u.orszag as string }))
    .sort((a, b) => a.nev.localeCompare(b.nev, 'hu'));
}
```

Megjegyzés az implementálónak: a `tipusos()` paramétere szándékosan laza, a visszatérést a hívó `as`-eli. Ha a `tsc` a `listOszlopok` spreadjére vagy az `alias` `name` oszlopára panaszkodik, a `select` objektumot írd ki explicit mezőnként. A `user.banned`/`banExpires` mezők a `db/schema/auth.ts`-ben vannak (a `listFelhasznalok` ugyanígy használja őket: tiltott = `banned && (!banExpires || banExpires > most)`).

- [x] **Step 2: Ellenőrző script (a lokális DB-n, takarít maga után)**

`scripts/_ticket-queries.ts`:

```ts
import assert from 'node:assert/strict';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { ticket, user } from '../db/schema';
import {
  addUzenet, closeTicket, countOlvasatlan, createTicket, getTicket, jelolOlvasottnak,
  listCimzettJeloltek, listTicketek, reopenTicket,
} from '../db/queries/ticket';

const admin = db.select().from(user).where(eq(user.role, 'admin')).get();
const jeloltek = listCimzettJeloltek();
assert.ok(admin, 'nincs admin a DB-ben (npm run db:seed)');
assert.ok(jeloltek.length >= 1, 'nincs attasé országgal a DB-ben');
const att = jeloltek[0];
const adminNezo = { userId: admin.id, role: 'admin' as const };
const attNezo = { userId: att.id, role: 'attase' as const };
const attSzerzo = { id: att.id, nev: att.nev, szerep: 'attase' as const };

const id = createTicket({
  cimzettId: att.id, orszag: att.orszag, tipus: 'adatkeres', prio: 'magas', hatarido: '2026-09-30',
  targy: '_teszt ticket', szoveg: 'Első kérés', nyito: { id: admin.id, nev: admin.name, szerep: 'admin' },
});
try {
  let t = getTicket(id, attNezo)!;
  assert.equal(t.statusz, 'nyitott');
  assert.equal(t.uzenetek.length, 1);
  assert.equal(t.olvasatlan, true, 'attasénak olvasatlan');
  assert.equal(getTicket(id, adminNezo)!.olvasatlan, false, 'nyitónak nem olvasatlan');
  assert.ok(countOlvasatlan(attNezo) >= 1);
  assert.ok(listTicketek(attNezo, 'magas').some((x) => x.id === id));
  assert.ok(listTicketek({ userId: 'senki', role: 'attase' }, 'mind').every((x) => x.id !== id), 'idegen attasé nem látja');

  jelolOlvasottnak(id, att.id);
  assert.equal(getTicket(id, attNezo)!.olvasatlan, false);

  addUzenet(id, attSzerzo, 'Válasz');
  t = getTicket(id, adminNezo)!;
  assert.equal(t.statusz, 'folyamatban');
  assert.equal(t.olvasatlan, true, 'adminnak olvasatlan az attasé válasza');
  assert.equal(t.uzenetSzam, 2);

  addUzenet(id, { id: admin.id, nev: admin.name, szerep: 'admin' }, 'Köszönöm');
  assert.equal(getTicket(id, adminNezo)!.statusz, 'valaszra_var');

  closeTicket(id);
  assert.equal(getTicket(id, adminNezo)!.statusz, 'lezart');
  assert.ok(getTicket(id, adminNezo)!.lezarvaAt instanceof Date);
  assert.throws(() => addUzenet(id, attSzerzo, 'x'), /le van zárva/);
  assert.ok(listTicketek(adminNezo, 'aktiv').every((x) => x.id !== id));
  assert.ok(listTicketek(adminNezo, 'mind').some((x) => x.id === id));

  reopenTicket(id);
  assert.equal(getTicket(id, adminNezo)!.statusz, 'valaszra_var');
  assert.equal(getTicket(id, adminNezo)!.lezarvaAt, null);
  console.log('ticket-queries OK');
} finally {
  db.delete(ticket).where(eq(ticket.id, id)).run();
}
```

Run: `NODE_OPTIONS="--conditions=react-server" npx tsx --env-file=.env.local scripts/_ticket-queries.ts`
Expected: `ticket-queries OK`, és a `ticket` tábla utána üres (`_teszt ticket` törölve).

- [x] **Step 3: Típusellenőrzés, script törlése, commit**

```bash
npx tsc --noEmit && rm scripts/_ticket-queries.ts
git add db/queries/ticket.ts
git commit -m "feat(kommunikacio): ticket lekérdezések (lista, részlet, létrehozás, üzenet, lezárás, olvasottság)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

**Megvalósítási eltérések**

- Az `olvasatlanSql` a nyers táblanevek helyett tipizált oszlop-referenciákkal épül (`${ticketUzenet.createdAt}` stb.), így séma-átnevezésnél a fordító jelez.
- A `tipusos()` segédfüggvényhez explicit `Tipusositott<T>` visszatérési típus kellett: enélkül a TS nem engedte a generikus spread eredményét tovább spreadelni a `getTicket`-ben.
- A `getTicket(id, nezo)` a láthatóságot **magában az SQL-ben is** kikényszeríti (attasénak `cimzett_id = nezo.userId`), tehát idegen ticketre `null`-t ad. A hívók emellett továbbra is futtatják a `canViewTicket`-et, hogy a jogosultsági modell explicit maradjon (ez pontosítja a plan fejlécének 3. pontját).
- `closeTicket` és `reopenTicket` idempotens: a `WHERE`-be státusz-predikátum került (`ne(statusz,'lezart')`, illetve `eq(statusz,'lezart')`), így a kétszeri beküldés nem bumpolja az `updatedAt`-ot és nem írja felül a `lezarvaAt`-ot.
- `countOlvasatlan` csak a **nem lezárt** ticketeket számolja (a menü-számláló nem ragadhat be lezárt tickettől).

---

### Task 4: Server action-ök

**Files:**
- Create: `app/(app)/kommunikacio/actions.ts`

- [x] **Step 1: Action-ök**

`app/(app)/kommunikacio/actions.ts`:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';
import type { MuveletState } from '../../../components/form/useMuveletForm';
import {
  addUzenet,
  closeTicket,
  createTicket,
  getTicket,
  listCimzettJeloltek,
  reopenTicket,
} from '../../../db/queries/ticket';
import { requireAdmin, requireSession } from '../../../lib/session';
import { canViewTicket, canWriteTicket } from '../../../lib/ticket-jog';
import { parseUjTicketForm, parseUzenetForm } from '../../../lib/ticket-validacio';

export type TicketFormState = MuveletState;

// Azonos szöveg hiányzó és idegen ticketre: nem áruljuk el a létezését.
const NINCS_JOG = 'Nincs jogosultságod ehhez a tickethez.';
const MENTES_HIBA = 'Mentés sikertelen, próbáld újra.';

// A teljes layout revalidálása: a lista, a beszélgetés és az AppShell menü-számlálója is frissül.
function frissit(): void {
  revalidatePath('/', 'layout');
}

export async function createTicketAction(_prev: TicketFormState, formData: FormData): Promise<TicketFormState> {
  const session = await requireAdmin();
  const parsed = parseUjTicketForm(formData, listCimzettJeloltek());
  if (!parsed.ok) return { errors: parsed.errors };
  let id: string;
  try {
    id = createTicket({ ...parsed.data, nyito: { id: session.userId, nev: session.name, szerep: 'admin' } });
  } catch (err) {
    unstable_rethrow(err);
    console.error('[ticket] createTicket sikertelen:', err);
    return { errors: { form: MENTES_HIBA } };
  }
  frissit();
  redirect(`/kommunikacio?t=${id}`);
}

export async function sendUzenetAction(
  ticketId: string,
  _prev: TicketFormState,
  formData: FormData,
): Promise<TicketFormState> {
  const session = await requireSession();
  const parsed = parseUzenetForm(formData);
  if (!parsed.ok) return { errors: parsed.errors };
  const t = getTicket(ticketId, session);
  if (!t || !canViewTicket(session, t)) return { errors: { form: NINCS_JOG } };
  if (!canWriteTicket(session, t)) return { errors: { form: 'A ticket le van zárva.' } };
  try {
    addUzenet(ticketId, { id: session.userId, nev: session.name, szerep: session.role }, parsed.szoveg);
  } catch (err) {
    unstable_rethrow(err);
    console.error('[ticket] addUzenet sikertelen:', err);
    return { errors: { form: MENTES_HIBA } };
  }
  frissit();
  return { ok: true };
}

export async function closeTicketAction(ticketId: string): Promise<TicketFormState> {
  const session = await requireAdmin();
  const t = getTicket(ticketId, session);
  if (!t) return { errors: { form: NINCS_JOG } };
  if (t.statusz === 'lezart') return { ok: true };
  try {
    closeTicket(ticketId);
  } catch (err) {
    unstable_rethrow(err);
    console.error('[ticket] closeTicket sikertelen:', err);
    return { errors: { form: 'Lezárás sikertelen, próbáld újra.' } };
  }
  frissit();
  return { ok: true };
}

export async function reopenTicketAction(ticketId: string): Promise<TicketFormState> {
  const session = await requireAdmin();
  const t = getTicket(ticketId, session);
  if (!t) return { errors: { form: NINCS_JOG } };
  if (t.statusz !== 'lezart') return { ok: true };
  try {
    reopenTicket(ticketId);
  } catch (err) {
    unstable_rethrow(err);
    console.error('[ticket] reopenTicket sikertelen:', err);
    return { errors: { form: 'Újranyitás sikertelen, próbáld újra.' } };
  }
  frissit();
  return { ok: true };
}
```

- [x] **Step 2: Típusellenőrzés és commit**

```bash
npx tsc --noEmit
git add "app/(app)/kommunikacio/actions.ts"
git commit -m "feat(kommunikacio): server action-ök (nyitás, üzenet, lezárás, újranyitás)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

**Megvalósítási eltérések**

- Az elavult kliens-állapot ágain (lezárt ticketbe írás, eltűnt ticket, már lezárt/már nyitott ticket) is fut a `frissit()` = `revalidatePath('/', 'layout')`, hogy a lista és a panel azonnal a valós állapotot mutassa.
- Külön üzenet-konstans az admin-only action-ök hiányzó ticketjére (`NINCS_TICKET = 'Ez a ticket már nem létezik, a lista frissült.'`): itt nincs mit titkolni, szemben a `NINCS_JOG`-gal, ami hiányzó és idegen ticketre szándékosan azonos.
- Minden hibaszöveg modul-szintű konstans (`NINCS_JOG`, `NINCS_TICKET`, `MENTES_HIBA`, `LEZARVA`, `LEZARAS_HIBA`, `UJRANYITAS_HIBA`).

---

### Task 5: `MuveletDialog` átköltöztetése és a jelzés-komponensek

**Files:**
- Move: `app/(app)/felhasznalok/components/MuveletDialog.tsx` → `components/form/MuveletDialog.tsx`
- Modify: `app/(app)/felhasznalok/components/UjFelhasznaloDialog.tsx`, `SzerkesztesDialog.tsx`, `JelszoDialog.tsx` (import útvonal)
- Create: `app/(app)/kommunikacio/components/TicketJelzesek.tsx`

- [x] **Step 1: Átköltöztetés**

```bash
git mv "app/(app)/felhasznalok/components/MuveletDialog.tsx" components/form/MuveletDialog.tsx
```

`components/form/MuveletDialog.tsx` importjait igazítsd:

```ts
import type { ReactNode } from 'react';
import type { MezoHibak } from '../../lib/urlap';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { MezoHiba } from './MezoHiba';
```

A három felhasználók-dialógusban: `import { MuveletDialog } from './MuveletDialog';` → `import { MuveletDialog } from '../../../../components/form/MuveletDialog';`

Run: `npx tsc --noEmit` → hibátlan.

- [x] **Step 2: Jelzés-komponensek**

`app/(app)/kommunikacio/components/TicketJelzesek.tsx`:

```tsx
import { Badge } from '../../../../components/ui/badge';
import { cn } from '../../../../lib/utils';
import { PRIORITASOK, STATUSZOK, TIPUSOK, type PrioKulcs, type StatuszKulcs, type TipusKulcs } from '../../../../lib/ticket-szotar';

const STATUSZ_SZIN: Record<StatuszKulcs, string> = {
  nyitott: 'bg-sky-100 text-sky-900',
  valaszra_var: 'bg-amber-100 text-amber-900',
  folyamatban: 'bg-emerald-100 text-emerald-900',
  lezart: 'bg-neutral-200 text-neutral-700',
};

export function StatuszBadge({ statusz }: { statusz: StatuszKulcs }) {
  return <Badge className={cn('border-transparent', STATUSZ_SZIN[statusz])}>{STATUSZOK[statusz].nev}</Badge>;
}

export function TipusBadge({ tipus }: { tipus: TipusKulcs }) {
  return <Badge variant="secondary">{TIPUSOK[tipus].nev}</Badge>;
}

const PRIO_SZOVEG: Record<PrioKulcs, string> = {
  magas: 'text-destructive font-medium',
  kozepes: 'text-amber-700',
  alacsony: 'text-muted-foreground',
};

/** Prioritás szövegként, színnel (adatlap). */
export function PrioJelzes({ prio }: { prio: PrioKulcs }) {
  return <span className={PRIO_SZOVEG[prio]}>{PRIORITASOK[prio].nev}</span>;
}

/** A listaelem bal szegélyének színe prioritás szerint. */
export function prioSzegely(prio: PrioKulcs): string {
  return prio === 'magas' ? 'border-l-destructive' : prio === 'kozepes' ? 'border-l-amber-500' : 'border-l-border';
}

/** Monogram-kör az üzenetbuborékhoz. */
export function Monogram({ nev, sajat }: { nev: string; sajat: boolean }) {
  const reszek = nev.trim().split(/\s+/);
  const betuk = ((reszek[0]?.[0] ?? '') + (reszek[1]?.[0] ?? '')).toUpperCase() || '?';
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
        sajat ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
      )}
    >
      {betuk}
    </span>
  );
}
```

- [x] **Step 3: Típusellenőrzés és commit**

```bash
npx tsc --noEmit
git add components/form/MuveletDialog.tsx "app/(app)/felhasznalok/components" "app/(app)/kommunikacio/components/TicketJelzesek.tsx"
git commit -m "refactor(form): MuveletDialog közös komponens; feat(kommunikacio): ticket jelzés-komponensek

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

**Megvalósítási eltérések**

- A jelzés-komponensek a lapos szótárakból olvasnak (`STATUSZOK[statusz]`, `TIPUSOK[tipus]`, `PRIORITASOK[prio]`), nincs `.nev`.
- A `MuveletDialog` a Task 6–8 során kapott egy `gombFolyamatban` propot (alapértelmezés `'Mentés…'`), hogy az új-ticket dialógus „Létrehozás…"-t mutathasson beküldés közben.

---

### Task 6: Ticketlista szűrőkkel

**Files:**
- Create: `app/(app)/kommunikacio/components/TicketLista.tsx`

- [x] **Step 1: Komponens**

`app/(app)/kommunikacio/components/TicketLista.tsx` (Server Component, nincs `'use client'`):

```tsx
import Link from 'next/link';
import type { TicketListItem } from '../../../../db/queries/ticket';
import { formatNaptariDatum } from '../../../../lib/datum';
import { SZURO_KULCSOK, SZUROK, type TicketSzuro } from '../../../../lib/ticket-szotar';
import { cn } from '../../../../lib/utils';
import { Card } from '../../../../components/ui/card';
import { buttonVariants } from '../../../../components/ui/button';
import { prioSzegely, TipusBadge } from './TicketJelzesek';

function listaUrl(szuro: TicketSzuro, t?: string): string {
  const p = new URLSearchParams();
  if (szuro !== 'aktiv') p.set('sz', szuro);
  if (t) p.set('t', t);
  const q = p.toString();
  return q ? `/kommunikacio?${q}` : '/kommunikacio';
}

export function TicketLista({
  sorok,
  kivalasztottId,
  szuro,
  admin,
  ma,
}: {
  sorok: TicketListItem[];
  kivalasztottId: string | null;
  szuro: TicketSzuro;
  admin: boolean;
  /** Mai nap YYYY-MM-DD (Europe/Budapest), a lejárt határidő jelzéséhez. */
  ma: string;
}) {
  return (
    <Card className="flex min-w-0 flex-col gap-0 overflow-hidden py-0">
      <nav aria-label="Szűrő" className="flex flex-wrap gap-1.5 border-b p-3">
        {SZURO_KULCSOK.map((k) => (
          <Link
            key={k}
            href={listaUrl(k, kivalasztottId ?? undefined)}
            aria-current={k === szuro ? 'true' : undefined}
            className={buttonVariants({ variant: k === szuro ? 'default' : 'outline', size: 'sm' })}
          >
            {SZUROK[k]}
          </Link>
        ))}
      </nav>
      {sorok.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          {szuro === 'mind' ? 'Még nincs ticket.' : 'Nincs a szűrőnek megfelelő ticket.'}
        </p>
      ) : (
        <ul className="flex max-h-[68vh] flex-col overflow-auto">
          {sorok.map((t) => {
            const aktiv = t.id === kivalasztottId;
            const lejart = Boolean(t.hatarido && t.hatarido < ma && t.statusz !== 'lezart');
            return (
              <li key={t.id} className={cn('border-b border-l-[3px] last:border-b-0', prioSzegely(t.prio))}>
                <Link
                  href={listaUrl(szuro, t.id)}
                  aria-current={aktiv ? 'page' : undefined}
                  className={cn('block px-3 py-2.5 hover:bg-muted/60', aktiv && 'bg-accent')}
                >
                  <div className="flex items-center gap-2">
                    {t.olvasatlan && (
                      <span className="size-2 shrink-0 rounded-full bg-primary" role="img" aria-label="Olvasatlan" />
                    )}
                    <TipusBadge tipus={t.tipus} />
                    {t.hatarido && (
                      <span className={cn('ml-auto font-mono text-[11px]', lejart ? 'text-destructive' : 'text-muted-foreground')}>
                        {formatNaptariDatum(t.hatarido)}
                      </span>
                    )}
                  </div>
                  <p className={cn('mt-1 text-[13px] leading-snug', t.olvasatlan ? 'font-semibold' : 'font-medium')}>{t.targy}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {admin && `${t.orszag} · ${t.cimzettNev} · `}
                    {t.uzenetSzam} üzenet
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
```

- [x] **Step 2: Típusellenőrzés és commit**

```bash
npx tsc --noEmit
git add "app/(app)/kommunikacio/components/TicketLista.tsx"
git commit -m "feat(kommunikacio): ticketlista szűrő-linkekkel és olvasatlan-jelzéssel

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

**Megvalósítási eltérések**

- A kiválasztott sor jelölése `bg-primary/10` + `ring-1 ring-inset ring-primary/20`, a fókuszgyűrű pedig `focus-visible:ring-inset` (a sorok egymáshoz érnek, a kilógó gyűrű levágódna).
- Felolvasó-szövegek: `sr-only` „Olvasatlan", „<prioritás> prioritás" (a prioritást vizuálisan csak a bal szegély színe mutatja) és „Lejárt határidő: " / „Határidő: ".
- Szűrőnkénti üres állapot: „Még nincs ticket." (mind), „Nincs aktív ticket." (aktív), „Nincs aktív, magas prioritású ticket." (magas).
- A tárgy `line-clamp-2` + `title` attribútum, hogy a hosszú tárgy se törje szét a sort, de teljes egészében elérhető legyen.
- A szűrő-linkek megtartják a `?t=`-t akkor is, ha az adott ticket nem felel meg az új szűrőnek (kommentben rögzítve): a beszélgetés nyitva marad, csak a sor nem lesz kiemelve.
- QA-javítás (Task 10): a teljes sor egy `Link`, ezért a globális `a` szabály kék színét és hover-aláhúzását `text-foreground no-underline hover:no-underline` utility-kkel írjuk felül – az affordancia a sor kiemelése.

---

### Task 7: Beszélgetés-panel, üzenet-űrlap, adatlap, státusz-gombok

**Files:**
- Create: `app/(app)/kommunikacio/components/UzenetUrlap.tsx`
- Create: `app/(app)/kommunikacio/components/TicketBeszelgetes.tsx`
- Create: `app/(app)/kommunikacio/components/TicketStatuszGombok.tsx`
- Create: `app/(app)/kommunikacio/components/TicketAdatlap.tsx`

- [x] **Step 1: Üzenet-űrlap**

`app/(app)/kommunikacio/components/UzenetUrlap.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { hibaAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { useMuveletForm, type FormAction } from '../../../../components/form/useMuveletForm';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { UZENET_MAX } from '../../../../lib/ticket-szotar';

/**
 * Válasz-mező. Vezérelt textarea: a React 19 a <form action> után reseteli a nem vezérelt
 * mezőket, hibánál viszont meg kell maradnia a szövegnek; sikernél mi ürítjük (onKesz).
 * Ctrl/Cmd+Enter beküld.
 */
export function UzenetUrlap({ action, kuldoNev }: { action: FormAction; kuldoNev: string }) {
  const [szoveg, setSzoveg] = useState('');
  const [state, formAction, pending] = useMuveletForm(action, undefined, () => setSzoveg(''));
  const errors = state.errors ?? {};
  return (
    <form action={formAction} className="flex flex-col gap-2 border-t bg-muted/30 p-3" noValidate>
      <Label htmlFor="szoveg" className="sr-only">
        Válasz
      </Label>
      <Textarea
        id="szoveg"
        name="szoveg"
        value={szoveg}
        onChange={(e) => setSzoveg(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !pending) e.currentTarget.form?.requestSubmit();
        }}
        maxLength={UZENET_MAX}
        rows={3}
        placeholder="Válasz írása… (Ctrl+Enter a küldéshez)"
        className="bg-background"
        {...hibaAttr(errors, 'szoveg')}
      />
      <MezoHiba mezo="szoveg" errors={errors} />
      <MezoHiba mezo="form" errors={errors} alert />
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Válaszol: {kuldoNev}</span>
        <Button type="submit" size="sm" className="ml-auto" disabled={pending}>
          {pending ? 'Küldés…' : 'Küldés'}
        </Button>
      </div>
    </form>
  );
}
```

- [x] **Step 2: Beszélgetés-panel**

`app/(app)/kommunikacio/components/TicketBeszelgetes.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import type { FormAction } from '../../../../components/form/useMuveletForm';
import { Card } from '../../../../components/ui/card';
import type { TicketDetail } from '../../../../db/queries/ticket';
import { formatDatum, formatDatumIdo } from '../../../../lib/datum';
import type { UzenetSzerep } from '../../../../lib/ticket-szotar';
import { cn } from '../../../../lib/utils';
import { Monogram, StatuszBadge } from './TicketJelzesek';
import { UzenetUrlap } from './UzenetUrlap';

export function TicketBeszelgetes({
  ticket,
  nezoSzerep,
  nezoNev,
  kuldesAction,
}: {
  ticket: TicketDetail;
  nezoSzerep: UzenetSzerep;
  nezoNev: string;
  kuldesAction: FormAction;
}) {
  const vege = useRef<HTMLDivElement>(null);
  // Új üzenetnél (és ticketváltásnál) az üzenetlista aljára görgetünk.
  useEffect(() => {
    vege.current?.scrollIntoView({ block: 'end' });
  }, [ticket.id, ticket.uzenetek.length]);

  const lezart = ticket.statusz === 'lezart';
  return (
    <Card className="flex min-w-0 flex-col gap-0 overflow-hidden py-0">
      <header className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <StatuszBadge statusz={ticket.statusz} />
          <span className="text-xs text-muted-foreground">nyitva {formatDatum(ticket.createdAt)}</span>
        </div>
        <h2 className="mt-1.5 text-[15px] leading-snug font-semibold">{ticket.targy}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {ticket.orszag} · {ticket.cimzettNev}
        </p>
      </header>
      <ol className="flex max-h-[46vh] flex-col gap-3 overflow-auto p-4" aria-label="Üzenetek">
        {ticket.uzenetek.map((u) => {
          const sajat = u.szerzoSzerep === nezoSzerep;
          return (
            <li key={u.id} className={cn('flex gap-2.5', sajat && 'flex-row-reverse')}>
              <Monogram nev={u.szerzoNev} sajat={sajat} />
              <div
                className={cn(
                  'max-w-[76%] rounded-lg border px-3 py-2',
                  sajat ? 'border-primary/20 bg-primary/5' : 'border-border bg-card',
                )}
              >
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="text-xs font-semibold">{u.szerzoNev}</span>
                  <span className="text-[11px] text-muted-foreground">{u.szerzoSzerep === 'admin' ? 'NIÜ' : 'TéT attasé'}</span>
                  <time dateTime={u.createdAt.toISOString()} className="ml-auto font-mono text-[11px] text-muted-foreground">
                    {formatDatumIdo(u.createdAt)}
                  </time>
                </div>
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{u.szoveg}</p>
              </div>
            </li>
          );
        })}
        <div ref={vege} />
      </ol>
      {lezart ? (
        <p className="border-t bg-muted/30 p-3 text-sm text-muted-foreground">
          A ticket lezárva{ticket.lezarvaAt ? ` ${formatDatum(ticket.lezarvaAt)}` : ''}. Lezárt ticketbe nem lehet írni.
        </p>
      ) : (
        <UzenetUrlap action={kuldesAction} kuldoNev={nezoNev} />
      )}
    </Card>
  );
}
```

- [x] **Step 3: Státusz-gombok (admin)**

`app/(app)/kommunikacio/components/TicketStatuszGombok.tsx`:

```tsx
'use client';

import { unstable_rethrow } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import type { MuveletState } from '../../../../components/form/useMuveletForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../components/ui/alert-dialog';
import { Button } from '../../../../components/ui/button';

type Muvelet = () => Promise<MuveletState>;

/** Lezárás megerősítéssel, újranyitás egy kattintással. A bind-olt action-öket a page adja. */
export function TicketStatuszGombok({
  lezart,
  targy,
  lezarAction,
  ujranyitAction,
}: {
  lezart: boolean;
  targy: string;
  lezarAction: Muvelet;
  ujranyitAction: Muvelet;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function futtat(action: Muvelet, siker: string, hiba: string) {
    startTransition(async () => {
      try {
        const res = await action();
        if (res.ok) {
          toast.success(siker);
          setOpen(false);
        } else {
          toast.error(res.errors?.form ?? hiba);
        }
      } catch (err) {
        unstable_rethrow(err);
        toast.error(hiba);
      }
    });
  }

  if (lezart) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => futtat(ujranyitAction, 'Ticket újranyitva.', 'Újranyitás sikertelen.')}
      >
        {pending ? 'Újranyitás…' : 'Újranyitás'}
      </Button>
    );
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Lezárás
      </Button>
      <AlertDialog
        open={open}
        onOpenChange={(next, details) => {
          if (!next && pending) {
            details.cancel();
            return;
          }
          setOpen(next);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ticket lezárása</AlertDialogTitle>
            <AlertDialogDescription>
              „{targy}” lezárul, a szálba nem lehet többé írni. Később újranyitható.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Mégse</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={() => futtat(lezarAction, 'Ticket lezárva.', 'Lezárás sikertelen.')}
            >
              {pending ? 'Lezárás…' : 'Lezárás'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

- [x] **Step 4: Adatlap**

`app/(app)/kommunikacio/components/TicketAdatlap.tsx` (Server Component):

```tsx
import type { ReactNode } from 'react';
import type { MuveletState } from '../../../../components/form/useMuveletForm';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import type { TicketDetail } from '../../../../db/queries/ticket';
import { formatDatum, formatNaptariDatum } from '../../../../lib/datum';
import { cn } from '../../../../lib/utils';
import { PrioJelzes, StatuszBadge, TipusBadge } from './TicketJelzesek';
import { TicketStatuszGombok } from './TicketStatuszGombok';

function Sor({ cimke, children }: { cimke: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">{cimke}</dt>
      <dd className="mt-0.5 text-[13px]">{children}</dd>
    </div>
  );
}

export function TicketAdatlap({
  ticket,
  admin,
  ma,
  lezarAction,
  ujranyitAction,
}: {
  ticket: TicketDetail;
  admin: boolean;
  ma: string;
  lezarAction: () => Promise<MuveletState>;
  ujranyitAction: () => Promise<MuveletState>;
}) {
  const lejart = Boolean(ticket.hatarido && ticket.hatarido < ma && ticket.statusz !== 'lezart');
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-[13px]">Ticket adatlap</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <dl className="flex flex-col gap-3">
          <Sor cimke="Típus">
            <TipusBadge tipus={ticket.tipus} />
          </Sor>
          <Sor cimke="Prioritás">
            <PrioJelzes prio={ticket.prio} />
          </Sor>
          <Sor cimke="Státusz">
            <StatuszBadge statusz={ticket.statusz} />
          </Sor>
          <Sor cimke="Határidő">
            {ticket.hatarido ? (
              <span className={cn(lejart && 'text-destructive')}>
                {formatNaptariDatum(ticket.hatarido)}
                {lejart && ' (lejárt)'}
              </span>
            ) : (
              <span className="text-muted-foreground">nincs</span>
            )}
          </Sor>
          <Sor cimke="Érintett poszt">
            {ticket.orszag} · {ticket.cimzettNev}
          </Sor>
          <Sor cimke="Nyitotta">
            {ticket.nyitoNev ?? <span className="text-muted-foreground">törölt felhasználó</span>} · {formatDatum(ticket.createdAt)}
          </Sor>
          {ticket.lezarvaAt && <Sor cimke="Lezárva">{formatDatum(ticket.lezarvaAt)}</Sor>}
        </dl>
        {admin && (
          <div className="mt-4">
            <TicketStatuszGombok
              lezart={ticket.statusz === 'lezart'}
              targy={ticket.targy}
              lezarAction={lezarAction}
              ujranyitAction={ujranyitAction}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [x] **Step 5: Típusellenőrzés és commit**

```bash
npx tsc --noEmit
git add "app/(app)/kommunikacio/components"
git commit -m "feat(kommunikacio): beszélgetés-panel, üzenet-űrlap, adatlap, lezárás/újranyitás

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

**Megvalósítási eltérések**

- Az `UzenetUrlap` `key={ticket.id}`-vel mountolódik újra: ticketváltáskor a vázlat és a hibaüzenet nem szivárog át.
- Az üzenetlista `<ol>`-je `ref` + `tabIndex={0}` + `aria-label="Üzenetek"`: az új üzenetnél csak a listán belül görgetünk (az oldal pozíciója marad), és a görgethető régió billentyűzettel is olvasható.
- A válasz-mező neve és id-ja `valasz` (nem `szoveg`), mert az új-ticket dialógus ugyanezen az oldalon él.
- A Ctrl/Cmd+Enter kezelője IME-őrt kapott (`!e.nativeEvent.isComposing`), hogy japán/kínai bevitelnél az Enter a jelöltet erősítse meg.
- A lezáró `AlertDialog` `finalFocus`-a a gombsáv `div`-jére mutat, nem a triggerre: a Lezárás gomb a művelet után már nem létezik (Újranyitásra cserélődik). QA-val ellenőrizve: záráskor a fókusz az „Újranyitás" gombra kerül.
- Az adatlap `CardTitle`-je `role="heading" aria-level={3}` (a shadcn `CardTitle` alapból `div`).
- A lejárt határidőt a lista és az adatlap is a közös `lejartE()`-vel számolja (a `ma` propként jön a page-ből).
- QA-javítás (Task 10): a lezárt-jelzésben nincs dupla pont – a `formatDatum` kimenete („2026. 09. 09.") már ponttal végződik.

---

### Task 8: Új ticket dialógus (admin)

**Files:**
- Create: `app/(app)/kommunikacio/components/UjTicketDialog.tsx`

- [x] **Step 1: Komponens**

`app/(app)/kommunikacio/components/UjTicketDialog.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { hibaAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { MuveletDialog } from '../../../../components/form/MuveletDialog';
import { useMuveletForm } from '../../../../components/form/useMuveletForm';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import {
  PRIO_KULCSOK,
  PRIORITASOK,
  TARGY_MAX,
  TIPUS_KULCSOK,
  TIPUSOK,
  UZENET_MAX,
  type PrioKulcs,
  type TipusKulcs,
} from '../../../../lib/ticket-szotar';
import type { CimzettJelolt } from '../../../../lib/ticket-validacio';
import { createTicketAction } from '../actions';

export function UjTicketDialog({ jeloltek }: { jeloltek: CimzettJelolt[] }) {
  const [open, setOpen] = useState(false);
  // Minden nyitás új key: a modal (és benne az űrlap állapota) tisztán újraindul.
  const [nyitas, setNyitas] = useState(0);
  return (
    <>
      <Button
        className="w-full"
        onClick={() => {
          setNyitas((n) => n + 1);
          setOpen(true);
        }}
      >
        Új ticket
      </Button>
      <UjTicketModal key={nyitas} open={open} onOpenChange={setOpen} jeloltek={jeloltek} />
    </>
  );
}

/**
 * Legördülő a form-mintához: a Base UI Select a `name` miatt rejtett inputot rendel, így a
 * FormData-ban megjelenik. A trigger `role=combobox` gomb, ezért aria-labelledby a címke
 * id-jával + a sajátjával.
 */
function Valaszto({
  id,
  cimke,
  value,
  onChange,
  items,
  placeholder,
  errors,
}: {
  id: string;
  cimke: string;
  value: string;
  onChange: (v: string) => void;
  items: Record<string, string>;
  placeholder: string;
  errors: Record<string, string>;
}) {
  const invalid = Boolean(errors[id]);
  return (
    <div className="flex flex-col gap-1.5">
      <Label id={`${id}-label`} htmlFor={id}>
        {cimke}
      </Label>
      <Select name={id} value={value || null} onValueChange={(v) => onChange(v ?? '')} items={items}>
        <SelectTrigger
          id={id}
          aria-labelledby={`${id}-label ${id}`}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-hiba` : undefined}
          className="w-full"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(items).map(([k, c]) => (
            <SelectItem key={k} value={k}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <MezoHiba mezo={id} errors={errors} />
    </div>
  );
}

function UjTicketModal({
  open,
  onOpenChange,
  jeloltek,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jeloltek: CimzettJelolt[];
}) {
  // Sikernél az action redirectel (?t=<új id>), ezért nincs siker-toast és nincs onKesz.
  const [state, formAction, pending] = useMuveletForm(createTicketAction);
  const errors = state.errors ?? {};
  // Vezérelt mezők: a React 19 a <form action> után (hibánál is) reseteli a nem vezérelt inputokat.
  const [cimzettId, setCimzettId] = useState('');
  const [tipus, setTipus] = useState<TipusKulcs | ''>('');
  const [prio, setPrio] = useState<PrioKulcs>('kozepes');
  const [hatarido, setHatarido] = useState('');
  const [targy, setTargy] = useState('');
  const [szoveg, setSzoveg] = useState('');

  const cimzettItems = Object.fromEntries(jeloltek.map((j) => [j.id, `${j.nev} · ${j.orszag}`]));
  const tipusItems = Object.fromEntries(TIPUS_KULCSOK.map((k) => [k, TIPUSOK[k].nev]));
  const prioItems = Object.fromEntries(PRIO_KULCSOK.map((k) => [k, PRIORITASOK[k].nev]));

  return (
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      cim="Új ticket"
      leiras="Kérés vagy feladat egy TéT attasénak. Az első üzenet a ticket nyitó szövege."
      gomb="Létrehozás"
      formAction={formAction}
      errors={errors}
    >
      {jeloltek.length === 0 && (
        <p className="text-sm text-muted-foreground" role="status">
          Nincs címezhető attasé: a Felhasználók oldalon hozz létre attasét országgal.
        </p>
      )}
      <Valaszto
        id="cimzettId"
        cimke="Címzett attasé"
        value={cimzettId}
        onChange={setCimzettId}
        items={cimzettItems}
        placeholder="Válassz attasét"
        errors={errors}
      />
      <div className="grid grid-cols-2 gap-3">
        <Valaszto
          id="tipus"
          cimke="Típus"
          value={tipus}
          onChange={(v) => setTipus(v as TipusKulcs | '')}
          items={tipusItems}
          placeholder="Válassz típust"
          errors={errors}
        />
        <Valaszto
          id="prio"
          cimke="Prioritás"
          value={prio}
          onChange={(v) => setPrio((v || 'kozepes') as PrioKulcs)}
          items={prioItems}
          placeholder="Prioritás"
          errors={errors}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="hatarido">Határidő (opcionális)</Label>
        <Input
          id="hatarido"
          name="hatarido"
          type="date"
          value={hatarido}
          onChange={(e) => setHatarido(e.target.value)}
          {...hibaAttr(errors, 'hatarido')}
        />
        <MezoHiba mezo="hatarido" errors={errors} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="targy">Tárgy</Label>
        <Input
          id="targy"
          name="targy"
          required
          maxLength={TARGY_MAX}
          autoComplete="off"
          value={targy}
          onChange={(e) => setTargy(e.target.value)}
          {...hibaAttr(errors, 'targy')}
        />
        <MezoHiba mezo="targy" errors={errors} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="szoveg">Első üzenet</Label>
        <Textarea
          id="szoveg"
          name="szoveg"
          required
          maxLength={UZENET_MAX}
          rows={4}
          value={szoveg}
          onChange={(e) => setSzoveg(e.target.value)}
          {...hibaAttr(errors, 'szoveg')}
        />
        <MezoHiba mezo="szoveg" errors={errors} />
      </div>
    </MuveletDialog>
  );
}
```

Megjegyzés: a `Select value={value || null}` azért, hogy üres kiválasztásnál a placeholder látsszon (a Base UI Select `null` értéket vár „nincs kiválasztva"-ként; ha a típus panaszkodik, `value={value === '' ? null : value}`). Ellenőrizd a `components/ui/select.tsx`-ben, hogy a `Select` átadja-e a `name`-et (a `SzerepkorSelect` már így használja, tehát igen).

- [x] **Step 2: Típusellenőrzés és commit**

```bash
npx tsc --noEmit
git add "app/(app)/kommunikacio/components/UjTicketDialog.tsx"
git commit -m "feat(kommunikacio): új ticket dialógus (admin)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

**Megvalósítási eltérések**

- A `Valaszto` `required` és `disabled` propot is átad a Base UI `Select`-nek (nincs címezhető attasé → a címzett-választó letiltva), és a `hibaAttr(errors, id)` a triggerre kerül (`aria-invalid` + `aria-describedby`).
- A címzett-lista `useMemo`-val áll elő a `jeloltek` propból (`{ id: 'Név · Ország' }`).
- A vezérelt state-eket `isTipusKulcs` / `isPrioKulcs` őrzi (`onChange`-ben szűrve), így a state típusa nem hazudik.
- A típus és a prioritás egy `grid-cols-1 sm:grid-cols-2` rácsban van (keskeny dialógusban egymás alá kerül).
- A dátum-mező `min="2000-01-01"` / `max="2100-12-31"` határokkal.
- A beküldés gomb felirata `gombFolyamatban="Létrehozás…"` (a `MuveletDialog` új propja).

---

### Task 9: A `/kommunikacio` oldal, layout számláló, AppShell, demóadat törlése

**Files:**
- Replace: `app/(app)/kommunikacio/page.tsx`
- Modify: `app/(app)/layout.tsx`
- Modify: `components/AppShell.tsx`
- Modify: `lib/data.ts` (a `TICKET_TYPES`, `TicketMsg`, `Ticket`, `TICKETS` törlése)
- Modify: `app/(app)/felhasznalok/components/FelhasznaloMuveletek.tsx` (törlés-szöveg)

- [x] **Step 1: Page**

`app/(app)/kommunikacio/page.tsx` (a régi tartalom teljesen lecserélve):

```tsx
import type { Metadata } from 'next';
import { Card } from '../../../components/ui/card';
import {
  getTicket,
  jelolOlvasottnak,
  listCimzettJeloltek,
  listTicketek,
  type TicketDetail,
} from '../../../db/queries/ticket';
import { maiNaptariNap } from '../../../lib/datum';
import { requireSession } from '../../../lib/session';
import { canViewTicket } from '../../../lib/ticket-jog';
import { parseSzuro } from '../../../lib/ticket-szotar';
import { closeTicketAction, reopenTicketAction, sendUzenetAction } from './actions';
import { TicketAdatlap } from './components/TicketAdatlap';
import { TicketBeszelgetes } from './components/TicketBeszelgetes';
import { TicketLista } from './components/TicketLista';
import { UjTicketDialog } from './components/UjTicketDialog';

export const metadata: Metadata = { title: 'Kommunikáció' };

type SearchParams = Record<string, string | string[] | undefined>;

export default async function KommunikacioPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await requireSession();
  const admin = session.role === 'admin';
  const sp = await searchParams;
  const szuro = parseSzuro(sp.sz);
  const tParam = typeof sp.t === 'string' ? sp.t : undefined;

  const lista = listTicketek(session, szuro);

  // Kiválasztott: a ?t=, ha létezik és látható; különben a lista első eleme. Idegen vagy
  // hiányzó id-nál nincs 404 (a lista URL-e nem érzékeny), egyszerűen az első elem jön.
  let kivalasztott: TicketDetail | null = tParam ? getTicket(tParam, session) : null;
  if (kivalasztott && !canViewTicket(session, kivalasztott)) kivalasztott = null;
  if (!kivalasztott && lista[0]) kivalasztott = getTicket(lista[0].id, session);

  // Megtekintés = olvasott. Idempotens upsert, ezért a dev-módú dupla render sem gond;
  // a listában is olvasottnak mutatjuk, mert a lista a jelölés előtt készült.
  if (kivalasztott) {
    jelolOlvasottnak(kivalasztott.id, session.userId);
    kivalasztott = { ...kivalasztott, olvasatlan: false };
  }
  const kivalasztottId = kivalasztott?.id ?? null;
  const sorok = lista.map((t) => (t.id === kivalasztottId ? { ...t, olvasatlan: false } : t));

  const ma = maiNaptariNap();
  const jeloltek = admin ? listCimzettJeloltek() : [];

  return (
    <div className="grid max-w-[1500px] items-start gap-4 lg:grid-cols-[22rem_minmax(0,1fr)_17rem]">
      <TicketLista sorok={sorok} kivalasztottId={kivalasztottId} szuro={szuro} admin={admin} ma={ma} />

      {kivalasztott ? (
        <TicketBeszelgetes
          ticket={kivalasztott}
          nezoSzerep={session.role}
          nezoNev={session.name}
          kuldesAction={sendUzenetAction.bind(null, kivalasztott.id)}
        />
      ) : (
        <Card className="p-6 text-sm text-muted-foreground">
          {admin ? 'Nincs kiválasztott ticket. Nyiss egyet a jobb oldali gombbal.' : 'Még nincs hozzád címzett ticket.'}
        </Card>
      )}

      <div className="flex flex-col gap-4">
        {kivalasztott && (
          <TicketAdatlap
            ticket={kivalasztott}
            admin={admin}
            ma={ma}
            lezarAction={closeTicketAction.bind(null, kivalasztott.id)}
            ujranyitAction={reopenTicketAction.bind(null, kivalasztott.id)}
          />
        )}
        {admin && <UjTicketDialog jeloltek={jeloltek} />}
      </div>
    </div>
  );
}
```

- [x] **Step 2: Layout és AppShell**

`app/(app)/layout.tsx`:

```tsx
import AppShell from '../../components/AppShell';
import { countOlvasatlan } from '../../db/queries/ticket';
import { requireSession } from '../../lib/session';
import { logoutAction } from './actions';

// Minden védett oldal ebben a route groupban van. A requireSession() itt egy helyen
// kényszeríti ki a bejelentkezést (elavult cookie esetén is: a proxy átengedi, ez
// viszont /login-ra irányít). A /login a gyökér layout alatt marad.
//
// Ez NEM helyettesíti az oldalankénti és action-önkénti ellenőrzést: kliens-oldali
// navigációnál a layout nem fut újra, a server action-ök pedig egyáltalán nem
// renderelnek layoutot. Minden szerver-oldali adatot olvasó page és minden action
// maga hívja a requireSession()/requireAdmin()-t.
//
// Az olvasatlan ticket-számláló ugyanezért kliens-oldali navigációnál késhet: a ticket
// action-ök revalidatePath('/', 'layout')-tal frissítik.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const olvasatlan = countOlvasatlan(session);
  return (
    <AppShell user={session} logoutAction={logoutAction} olvasatlan={olvasatlan}>
      {children}
    </AppShell>
  );
}
```

`components/AppShell.tsx` módosításai:

1. Import: `import { CYCLES, DEADLINE, DEFAULT_CYCLE } from '../lib/data';` (a `TICKETS` kikerül).
2. Props:

```tsx
export default function AppShell({
  user,
  logoutAction,
  olvasatlan,
  children,
}: {
  user: AppSession;
  logoutAction: LogoutAction;
  /** Olvasatlan, nem lezárt ticketek száma (a Kommunikáció menüpont számlálója). */
  olvasatlan: number;
  children: ReactNode;
}) {
```

3. Töröld az `const openTickets = TICKETS.filter(...)` sort.
4. A menüpont számlálója:

```tsx
                  {n.href === '/kommunikacio' && olvasatlan > 0 && (
                    <span aria-label={`${olvasatlan} olvasatlan ticket`} style={{
                      marginLeft: 'auto', background: '#b3261e', color: '#fff', fontSize: 10,
                      fontWeight: 600, padding: '1px 6px', borderRadius: 9,
                    }}>{olvasatlan}</span>
                  )}
```

- [x] **Step 3: Demóadat törlése és a felhasználó-törlés szövege**

`lib/data.ts`: töröld a `TICKET_TYPES` konstanst, a `TicketMsg` és `Ticket` interfészt és a teljes `TICKETS` tömböt (a `// Demóadatok ...` fejléc-kommentből a „ticketek" szót is vedd ki). A `CYCLES`, `DEFAULT_CYCLE`, `DEADLINE`, `SCORE_THRESHOLD`, `ME_ID` marad.

Run: `grep -rn "TICKETS\|TICKET_TYPES\|TicketMsg" app lib components` → nincs találat.

`app/(app)/felhasznalok/components/FelhasznaloMuveletek.tsx` törlés-dialógus leírása (a 61. sor környékén):

```
'Ez nem vonható vissza. A felhasználó sessionjei, az összes bejegyzése (riportja) a csatolmányaival együtt, és a hozzá címzett ticketek az üzeneteikkel is törlődnek. Távozó attasénál a tiltás a javasolt művelet.',
```

- [x] **Step 4: Típusellenőrzés, gyors böngészős füstpróba, commit**

```bash
npx tsc --noEmit
```

Füstpróba (a dev szerver a 3000-en fut; `B=~/.claude/skills/gstack/browse/dist/browse`):

```bash
B=~/.claude/skills/gstack/browse/dist/browse
$B goto http://localhost:3000/login
$B fill '#email' admin@niu.hu      # a jelszót a .env.local SEED_ADMIN_PASSWORD-jából
$B fill '#password' "$(grep '^SEED_ADMIN_PASSWORD=' .env.local | cut -d= -f2-)"
$B click 'button[type=submit]'
$B goto http://localhost:3000/kommunikacio
$B text | head -30
$B console --errors
```

Expected: az oldal betölt, a lista üres („Még nincs ticket." / „Nincs a szűrőnek megfelelő ticket."), a jobb oldalon „Új ticket" gomb, nincs konzolhiba. (Ha a login mezők id-ja más, `$B snapshot -i`-vel nézd meg.)

```bash
git add "app/(app)/kommunikacio/page.tsx" "app/(app)/layout.tsx" components/AppShell.tsx lib/data.ts "app/(app)/felhasznalok/components/FelhasznaloMuveletek.tsx"
git commit -m "feat(kommunikacio): DB-alapú kommunikáció oldal, olvasatlan-számláló a menüben, ticket demóadat törlése

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

**Megvalósítási eltérések**

- A `TicketBeszelgetes` a page-ből `key={kivalasztott.id}`-t kap (ticketváltáskor tiszta kliens-állapot).
- Link-gomb-olvashatóság: a globális `a { color; text-decoration }` szabályok az `app/globals.css` `@layer base` blokkjába kerültek (rétegezetlenül minden Tailwind utility-t vertek), a `components/ui/button.tsx` alap-osztályai pedig `no-underline hover:no-underline`-t, az `outline` variáns `text-foreground`-ot kapott. Ez projekt-szintű módosítás a shadcn fájlon.
- A menü-számláló szinkronja: az `AppShell` állapotban tartja az `olvasatlan`-t (prop-változásra render közben igazítva), a page pedig az olvasottnak jelölés UTÁN újraszámolt értéket írja bele az `OlvasatlanSzinkron` kliens-komponenssel (`useApp().setOlvasatlan`). Enélkül a layout a jelölés előtti (eggyel nagyobb) számot mutatta volna, kliens-oldali navigációnál pedig egyáltalán nem frissült volna.
- A rács `lg`-n 2 oszlopos (lista + beszélgetés, az adatlap alá kerül), `2xl`-en 3 oszlopos (`22rem_minmax(0,1fr)_17rem`), `max-w-[1500px]` kerettel.
- Szövegjavítás: „Nincs kiválasztott ticket. Nyiss egyet az **Új ticket gombbal**." (a korábbi „a jobb oldali gombbal" a 2 oszlopos elrendezésben nem volt igaz).

---

### Task 10: Záró forgatókönyv (headless QA), dokumentáció, build

**Files:**
- Modify: `README.md`, `CLAUDE.md`
- Modify (ha kell): bármely előző fájl a QA-ban talált hibák javítására

- [x] **Step 1: Végponti forgatókönyv a gstack böngészővel**

`B=~/.claude/skills/gstack/browse/dist/browse`. Minden lépés után `$B console --errors` legyen üres. Bejelentkezés: `/login`, `#email` / `#password` mezők (ha más, `$B snapshot -i`), majd `button[type=submit]`. Kijelentkezés a fejléc „Kijelentkezés" gombjával (`$B click 'button:has-text("Kijelentkezés")'` vagy snapshot ref).

1. **Admin nyit ticketet.** Admin belép → `/kommunikacio` → „Új ticket" gomb → a dialógusban: címzett `Teszt Attasé · Dél-Korea` (a Select: `$B click '#cimzettId'`, majd `$B click 'text=Dél-Korea'` vagy snapshot ref), típus Adatkérés, prioritás Magas, határidő `2026-09-01` (múltbeli, hogy a lejárt jelzés látszódjon), tárgy „QA ticket", első üzenet „Kérem a beszállítói listát." → Létrehozás. Expected: URL `?t=<uuid>`, státusz badge „Nyitott", a lista első eleme a „QA ticket" `Dél-Korea · … · 1 üzenet` sorral, a határidő pirossal, az adatlapon „(lejárt)". A menü-számláló az adminnak nem jelenik meg (0).
2. **Validáció.** „Új ticket" újra: üres tárgy, üres üzenet, címzett nélkül → Létrehozás. Expected: három mezőhiba (`#cimzettId-hiba`, `#targy-hiba`, `#szoveg-hiba`), fókusz a címzetten, a dialógus nyitva. Mégse.
3. **Attasé látja, olvasatlan.** Kijelentkezés, `teszt.attase@niu.hu` / `Teszt1234!` belép. Expected: a sidebar Kommunikáció menüpontján `1`; `/kommunikacio` → a lista első eleme félkövér, pötty (`[aria-label="Olvasatlan"]`); az attasé sorában nincs ország/név, csak „1 üzenet". A ticket automatikusan kiválasztva (nincs `?t=`), a nyitó üzenet a bal oldalon (nem saját). Oldal újratöltés (`$B reload`): a pötty és a menü-számláló eltűnt.
4. **Attasé válaszol.** `#szoveg` mezőbe „11 aktív beszállító van." → Küldés. Expected: a mező kiürül, az üzenet jobb oldalon jelenik meg a saját monogrammal, a státusz „Folyamatban", az adatlapon nincs Lezárás gomb (nem admin).
5. **Idegen attasé nem lát semmit.** Kijelentkezés, `masodik.attase@niu.hu` / `Masodik1234!`. Expected: `/kommunikacio` üres lista, „Még nincs hozzád címzett ticket.", menü-számláló nincs. Közvetlen `?t=<uuid>` (az 1. lépés id-ja) → ugyanaz az üres állapot, nem 404 és nem látszik a ticket. Az action-szintű védelem (idegen ticketre `sendUzenetAction` → `NINCS_JOG`, nem admin `closeTicketAction` → 404) böngészőből nem váltható ki, mert a UI nem rendereli a gombokat: ezt a Task 3 lekérdezés-scriptje (láthatóság) és a Task 4 kódjának review-ja fedi.
6. **Admin válaszol, olvasatlan az adminnak.** Kijelentkezés, admin belép. Expected: menü-számláló `1`, a lista eleme pöttyös. Megnyitás → pötty el. „Köszönöm, továbbítom." → Küldés → státusz „Válaszra vár".
7. **Lezárás és újranyitás.** Adatlap „Lezárás" → megerősítés → Expected: toast „Ticket lezárva.", státusz „Lezárt", az űrlap helyett „A ticket lezárva … Lezárt ticketbe nem lehet írni.", a lista „Aktív" szűrőben már nem mutatja (a kiválasztott így az esetleges következő elem vagy üres). `?sz=mind` → látszik. „Újranyitás" → toast, státusz „Válaszra vár" (az utolsó üzenet az adminé), az űrlap visszajön.
8. **Szűrők.** „Magas prioritás" link → a QA ticket látszik (magas); nyiss egy második, Alacsony prioritású ticketet a `masodik.attase`-nak → a „Magas prioritás" szűrőben nem, az „Aktív"-ban igen; a `?t=` megmarad szűrőváltáskor, ha az elem a szűrt listában van.
9. **Attasé lezárt ticketbe nem ír.** `teszt.attase` belép, a QA ticket lezárása után (admin zárja le újra) → `?sz=mind&t=<uuid>` → nincs űrlap, a lezárt jelzés látszik.
10. **Takarítás.** A QA ticketek törlése a lokális DB-ből: `NODE_OPTIONS="--conditions=react-server" npx tsx --env-file=.env.local -e "import('./db/index.ts').then(async ({db})=>{const {ticket}=await import('./db/schema/index.ts');const {like}=await import('drizzle-orm');db.delete(ticket).where(like(ticket.targy,'QA %')).run();console.log('ok')})"` (vagy eldobható `scripts/_x.ts`). A `session` táblát ne ürítsd (a felhasználó munkamenetei).

Ha bármelyik lépés eltér az elvárttól: javítsd a kódot, commitold külön (`fix(kommunikacio): …`), és ismételd a lépést.

- [x] **Step 2: Build**

```bash
npm run build
```

Expected: sikeres build, a `/kommunikacio` dinamikus (ƒ) route. Ha a típusellenőrzés nem létező `app/...` modulra panaszkodik: `rm .next/dev/types/validator.ts`, majd újra build (lásd CLAUDE.md).

- [x] **Step 3: README és CLAUDE.md**

`README.md`:
- A bevezető mondatban („A térkép, a kommunikáció, a tudástár és a monitoring képernyő még statikus dummy adatokból dolgozik…") vedd ki a kommunikációt, és add a DB-s felsoroláshoz: „az auth, a felhasználó-kezelés, a riportok (információs bejegyzések) és a kommunikáció (ticketek) már valódi adatbázisból".
- A route-táblázat `/kommunikacio` sora: `| /kommunikacio | Ticketek és üzenetszálak: az admin nyit ticketet egy attasénak, mindkét fél válaszol; ?t=<id> a kiválasztott ticket, ?sz= szűrő (aktiv/magas/mind) |`
- A fájl-felsorolásba (a `lib/riport-szotar.ts` sor után): `- lib/ticket-szotar.ts – ticket típusok, prioritások, státuszok, szűrők` és `- app/(app)/kommunikacio/components/ – a ticketlista, beszélgetés, adatlap és új-ticket dialógus`.
- „Ismert korlátok" végére:

```
- Kommunikáció: nincs valós idejű frissítés (küldéskor és újratöltéskor frissül); a menü
  olvasatlan-számlálója kliens-oldali navigációnál a következő teljes betöltésig vagy
  ticket-műveletig késhet; a ticket nyitás után nem szerkeszthető és nem törölhető;
  az olvasatlan-jelzés szerep-alapú (két admin egymás üzeneteit nem látja olvasatlannak).
- Felhasználó törlésekor a hozzá címzett ticketek az üzeneteikkel együtt törlődnek (FK cascade).
```

`CLAUDE.md`:
- „Mi ez" bekezdés: „a térkép, a tudástár és a monitoring még a `lib/data.ts` / `lib/knowledge.ts` demóadataiból dolgozik; a riportok (információs bejegyzések), a kommunikáció (ticketek) és a felhasználók már DB-ből."
- Új bekezdés a **Riportok** után:

```
**Kommunikáció (ticketek).** `db/schema/ticket.ts` (`ticket`, `ticket_uzenet` – a nyitó kérés is üzenet, szerző név/szerep pillanatképpel –, `ticket_olvasas` – felhasználónként „utoljára látta"), `db/queries/ticket.ts` (`listTicketek`, `getTicket` – a láthatóságot NEM ellenőrzi, a hívó `canViewTicket`-tel teszi –, `createTicket`, `addUzenet` – státuszt is állít: admin küldő → `valaszra_var`, attasé → `folyamatban` –, `closeTicket`/`reopenTicket`, `jelolOlvasottnak`, `countOlvasatlan`, `listCimzettJeloltek`), szótár `lib/ticket-szotar.ts`, validátor `lib/ticket-validacio.ts`, jog `lib/ticket-jog.ts`. Egyetlen route: `app/(app)/kommunikacio` (`?t=<id>` kiválasztott ticket, `?sz=` szűrő), action-ök `actions.ts`, komponensek `components/` alatta. Csak admin nyit, zár le és nyit újra; attasé csak a hozzá címzettet látja. Az olvasott-jelölés a page rendereléskor történik (idempotens upsert). Idegen `?t=` nem 404, csak a lista első eleme jelenik meg. Az `AppShell` `olvasatlan` propját az `app/(app)/layout.tsx` adja (`countOlvasatlan`), és a ticket action-ök `revalidatePath('/', 'layout')`-tal frissítik.
```

- A **UI shell** bekezdésben az `AppShell` propjai: `user: AppSession`, `logoutAction`, `olvasatlan: number`.
- A Projektstruktúra táblázat „Megosztott komponensek" sora említse a `components/form/MuveletDialog.tsx`-et is (`useMuveletForm`, `MezoHiba`, `MuveletDialog`).

- [x] **Step 4: Plan szinkron és záró commit**

A plan minden taskjához írj „Megvalósítási eltérések" alszakaszt, ha a végleges kód eltér a plan kódblokkjától, és a kódblokkokat igazítsd a végleges fájlokhoz (külön docs-commit). Pipáld ki a checkboxokat.

```bash
git add README.md CLAUDE.md docs/superpowers/plans/2026-09-09-kommunikacio.md
git commit -m "docs(kommunikacio): README, CLAUDE.md, plan szinkron a végleges kóddal

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

**Megvalósítási eltérések**

A záró QA (11 lépés, admin + két attasé, 1280×800 és 1600×900) a forgatókönyv szerint lefutott. Két hiba került elő és javítva lett:

- `fix(kommunikacio): dupla pont a lezárt-jelzésben` – „A ticket lezárva 2026. 09. 09.**.** Lezárt ticketbe…": a `formatDatum` kimenete már ponttal végződik.
- `fix(kommunikacio): a ticketlista sorai ne link-stílusúak legyenek` – a teljes sor egy `Link`, ezért a globális `a` szabálytól a tárgy kék lett, és hoverre az egész sor aláhúzódott.
- `fix(ui): buttonVariants mindig cn()-ben` – a záró review talált egy harmadik hibát: a `buttonVariants()` (cva) `cn()` (tailwind-merge) nélkül konkatenál, ezért `outline` variánsnál a base `border-transparent` felülírta a variáns `border-border`-jét, és a gomb keret nélkül renderelődött. Minden nyers `Link + buttonVariants(...)` hívást `cn(...)`-be csomagoltunk (a `TicketLista` szűrő-chipjei, a `RiportReszlet` „Szerkesztés" gombja és két további találat: `app/(app)/riportok/page.tsx`, `RiportTabla.tsx`); emellett a `NotFoundContent` immár feleslegessé vált `!text-primary-foreground hover:!no-underline` felülírásait (a globális `a` szabály `@layer base`-ben van, nem kell `!important`) és a `lib/ticket-szotar.ts` halott `TIPUS_KULCSOK`/`PRIO_KULCSOK` exportjait is töröltük.

Megfigyelt, szándékos viselkedések (nem hibák):

- Az automatikusan kiválasztott ticket a listában **nem** kap olvasatlan-pöttyöt: a page a jelölés után olvasottként rendereli (a lista a jelölés előtt készül). Az olvasatlanság bizonyítéka a menü-számláló a megnyitás előtti oldalon.
- Ha a `?t=` nincs az URL-ben (pl. a sidebarból érkezünk), a ticket lezárása után a kiválasztás megszűnik, és az „Aktív" szűrőben az üres állapot jelenik meg – az Újranyitás gomb ilyenkor csak a `?sz=mind` szűrőn át érhető el. `?t=`-vel a beszélgetés a helyén marad, a fókusz pedig az „Újranyitás" gombra kerül.

Nyitott, későbbi teendők:

- A `Valaszto` (Base UI `Select` + `Label` + `MezoHiba` keret) felvihető a `components/form/` alá, és lecserélhető vele a felhasználók-feature `SzerepkorSelect`-je.
- Mérlegelendő egy `(cimzett_id, updated_at)` összetett index a `ticket` táblán, ha az attasé-lista mérete megnő.
- Opcionális `loading.tsx` a navigációs visszajelzéshez – de ez megváltoztatja a prefetch-szemantikát (a prefetch renderelné az oldalt, és olvasottnak jelölne), ezért csak az olvasott-jelölés áthelyezésével együtt vezethető be.

---

## Önellenőrzés a spec ellen

| Spec-követelmény | Task |
| --- | --- |
| Szótár (típus, prioritás, státusz, limitek, típusőrök) | 1 |
| Három tábla, indexek, cascade / set null, migráció | 2 |
| `listTicketek`, `getTicket`, `createTicket`, `addUzenet` (státusz), lezárás/újranyitás, `jelolOlvasottnak`, `countOlvasatlan` | 3 |
| Validátor (`parseUjTicketForm`, `parseUzenetForm`), jog (`canViewTicket`, `canWriteTicket`) | 1 |
| Action-ök: nyitás (admin, redirect `?t=`), üzenet (bind-olt, `{ ok: true }`), lezárás/újranyitás (admin, toast) | 4, 7 |
| Olvasottság page-rendereléskor, menü-számláló a layoutból, action-ök layout-revalidálása | 4, 9 |
| Lista: szűrő-linkek `?sz=` a `?t=` megtartásával, prioritás-szegély, típus-badge, lejárt határidő piros, olvasatlan pötty + félkövér, attasénál nincs ország/név | 6 |
| Beszélgetés: fejléc, buborékok (saját jobbra, szerep-alapú), Ctrl+Enter, lezárt jelzés, aljára görgetés | 7 |
| Adatlap: típus, prioritás, státusz, határidő, poszt, nyitotta, nyitva; Lezárás megerősítéssel / Újranyitás | 7 |
| Új ticket dialógus (címzett `Név · Ország`, típus, prioritás alapértelmezés közepes, határidő, tárgy, első üzenet) | 8 |
| Üres állapotok, idegen `?t=` → első elem, statikus metadata | 9 |
| `TICKETS`/`TICKET_TYPES` törlése, AppShell számláló, felhasználó-törlés dialógus szövege | 9 |
| Ellenőrzés (tsc, build, migráció, headless forgatókönyv), README korlátok, CLAUDE.md | 10 |
