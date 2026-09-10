# Attasé-adatok bővítése – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Az admin felhasználó-kezelőben (`/felhasznalok`) az attasé felvételekor és szerkesztésekor az ország mellett rögzíthető a poszt országának fővárosa, területe (km²) és pénzneme, valamint az attasé telefonszáma és kapcsolattartási e-mail címe.

**Architecture:** Öt új, nullable oszlop a Better Auth `user` tábláján (`additionalFields`, `input: false`, mint az `orszag`). A validáció a tiszta `lib/felhasznalo-validacio.ts`-ben, a mentés a meglévő `createFelhasznaloAction` / `updateFelhasznaloAction` `data` mezőjén át. A két dialógus közös `AttaseMezok` komponenst kap az elérhetőség- és poszt-blokkra; a `MuveletDialog` egy `szeles` propot. A táblázat egy Telefon oszlopot.

**Tech Stack:** Next.js 16 (Server Actions, `useActionState`), React 19, TypeScript 7, drizzle-orm + better-sqlite3, Better Auth admin plugin (`createUser`, `adminUpdateUser`), shadcn/ui v4 base-nova (`Input`, `Label`, `Dialog`, `Table`), Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-09-10-attase-adatok-design.md`.

**Ellenőrzés:** Nincs tesztkeretrendszer. Minden task végén `npx tsc --noEmit`; a validátort eldobható tsx scripttel (`scripts/_x.ts`, utána törlendő); a UI-t a gstack headless böngészővel (`~/.claude/skills/gstack/browse/dist/browse goto/fill/click/text/js/snapshot -i/console --errors`). A `db/queries/*` `server-only`: az őket importáló tsx script `NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_x.ts`. A felhasználó dev szervere futhat a 3000-en: **nem szabad leállítani/újraindítani**. Seed admin e-mail `admin@niu.hu`, a jelszót a `.env.local`-ból olvasd, ne írd ki. Commit üzenetek végén: `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. A `.env.example` módosítása a felhasználó nem commitolandó saját sora: **soha ne add hozzá a commithoz** (`git add` mindig konkrét fájlokkal).

**Fontos API tények (ellenőrizve a meglévő kódban):**
- `lib/urlap.ts`: `mezo(fd, key)` tisztított, trimmelt string; `MezoHibak = Record<string, string>`.
- `components/form/useMuveletForm.ts`: hibánál `document.getElementById(<első hibakulcs>)?.focus()` → a mező `id`-ja = a hibakulcs = a FormData mezőnév.
- `components/form/MezoHiba.tsx`: `MezoHiba({ mezo, errors })`, `hibaAttr(errors, mezo)`.
- `components/form/MuveletDialog.tsx`: `DialogContent` alapból `sm:max-w-sm`, a `className` a `cn()`-nel felülírható.
- Better Auth `additionalFields`: `{ type: 'string' | 'number', required: false, input: false }`; a Drizzle adapter a séma property-kulcsával (`kapcsolatEmail`) párosít, az oszlopnév szabadon `kapcsolat_email`.
- Better Auth `adminUpdateUser` `data`-ban `null` érték törli a mezőt (az `orszag` már így működik adminra váltáskor).

---

## Fájlstruktúra

| Fájl | Művelet | Felelősség |
| --- | --- | --- |
| `db/schema/auth.ts` | módosít | `user`: `fovaros`, `terulet`, `penznem`, `telefon`, `kapcsolatEmail` oszlop |
| `lib/auth.ts` | módosít | `additionalFields` az öt mezővel |
| `drizzle/0004_*.sql` + `meta/` | generál | migráció |
| `lib/felhasznalo-validacio.ts` | módosít | `AttaseAdatok`, `validFovaros/Penznem/Terulet/Telefon/KapcsolatEmail`, parse-ok bővítése |
| `db/queries/felhasznalo.ts` | módosít | `FelhasznaloSor` és `listFelhasznalok` az új mezőkkel |
| `app/(app)/felhasznalok/actions.ts` | módosít | `FelhasznaloAdatok`, a két action `data`-ja |
| `components/form/MuveletDialog.tsx` | módosít | `szeles?: boolean` prop |
| `app/(app)/felhasznalok/components/AttaseMezok.tsx` | létrehoz | Elérhetőség + TéT poszt blokk (közös a két dialógusnak) |
| `app/(app)/felhasznalok/components/UjFelhasznaloDialog.tsx` | módosít | Fiók blokk + `AttaseMezok` |
| `app/(app)/felhasznalok/components/SzerkesztesDialog.tsx` | módosít | ugyanaz, kezdő értékek a sorból |
| `app/(app)/felhasznalok/components/FelhasznaloTabla.tsx` | módosít | Telefon oszlop |
| `CLAUDE.md`, `README.md` | módosít | dokumentáció |

---

### Task 1: Séma, Better Auth mezők, migráció

**Files:**
- Modify: `db/schema/auth.ts` (a `user` tábla `orszag` sora után)
- Modify: `lib/auth.ts` (`additionalFields`)
- Generate: `drizzle/0004_*.sql`, `drizzle/meta/0004_snapshot.json`, `drizzle/meta/_journal.json`

- [ ] **Step 1: Oszlopok a Drizzle sémában**

`db/schema/auth.ts`, a `user` táblában az `orszag: text("orszag"),` után:

```ts
  // Attasé poszt-adatai (csak attasénál töltött) és elérhetőségei. Better Auth
  // additionalFields (lib/auth.ts); az admin UI írja őket.
  fovaros: text("fovaros"),
  terulet: integer("terulet"),
  penznem: text("penznem"),
  telefon: text("telefon"),
  kapcsolatEmail: text("kapcsolat_email"),
```

- [ ] **Step 2: Better Auth additionalFields**

`lib/auth.ts`, a `user.additionalFields` blokk:

```ts
  user: {
    additionalFields: {
      // TéT attasé posztjának országa. Adminnál üres. Csak az admin API írhatja (input: false),
      // a felhasználó saját maga nem módosíthatja az /update-user végponton.
      orszag: { type: 'string', required: false, input: false },
      // A poszt országának adatai (csak attasénál) és az attasé elérhetőségei (mindkét
      // szerepkörnél). Ugyanaz az elv: input: false, az admin UI írja.
      fovaros: { type: 'string', required: false, input: false },
      terulet: { type: 'number', required: false, input: false },
      penznem: { type: 'string', required: false, input: false },
      telefon: { type: 'string', required: false, input: false },
      kapcsolatEmail: { type: 'string', required: false, input: false },
    },
  },
```

- [ ] **Step 3: Migráció generálása és alkalmazása**

Run: `npm run db:generate`
Expected: új `drizzle/0004_<név>.sql` öt `ALTER TABLE \`user\` ADD ...` sorral (`fovaros` text, `terulet` integer, `penznem` text, `telefon` text, `kapcsolat_email` text).

Run: `npm run db:migrate`
Expected: hiba nélkül lefut. Ellenőrzés: `sqlite3 data/tet.db "PRAGMA table_info(user)" | grep -c "fovaros\|terulet\|penznem\|telefon\|kapcsolat_email"` → `5`.

- [ ] **Step 4: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: hiba nélkül.

- [ ] **Step 5: Commit**

```bash
git add db/schema/auth.ts lib/auth.ts drizzle/
git commit -m "feat(felhasznalok): fovaros, terulet, penznem, telefon, kapcsolat_email oszlopok a user táblán

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Validátor

**Files:**
- Modify: `lib/felhasznalo-validacio.ts`
- Test: `scripts/_x.ts` (eldobható)

- [ ] **Step 1: Ellenőrző script (előbb, hogy lássuk elbukni)**

`scripts/_x.ts`:

```ts
import { parseSzerkesztes, parseUjFelhasznalo } from '../lib/felhasznalo-validacio';

function fd(o: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
}
function eq(nev: string, kapott: unknown, vart: unknown) {
  const ok = JSON.stringify(kapott) === JSON.stringify(vart);
  console.log(ok ? 'OK  ' : 'FAIL', nev, ok ? '' : `\n  kapott: ${JSON.stringify(kapott)}\n  várt:   ${JSON.stringify(vart)}`);
}

const alap = { nev: 'Teszt', email: 'a@b.hu', jelszo: 'Jelszo123', szerepkor: 'attase', orszag: 'Japán' };

// Minden mező kitöltve, ezreselválasztók a területben
const r1 = parseUjFelhasznalo(fd({ ...alap, fovaros: 'Tokió', terulet: '377 975', penznem: 'japán jen (JPY)', telefon: '+81 3 1234-5678', kapcsolatEmail: 'Attase@Tokyo.MFA.hu' }));
eq('teljes attasé', r1, { ok: true, data: { ...alap, fovaros: 'Tokió', terulet: 377975, penznem: 'japán jen (JPY)', telefon: '+81 3 1234-5678', kapcsolatEmail: 'attase@tokyo.mfa.hu' } });

// Üres opcionális mezők → null
const r2 = parseUjFelhasznalo(fd({ ...alap, fovaros: '', terulet: '', penznem: '', telefon: '', kapcsolatEmail: '' }));
eq('üres opcionálisak', r2, { ok: true, data: { ...alap, fovaros: null, terulet: null, penznem: null, telefon: null, kapcsolatEmail: null } });

// Hiányzó mezők (régi űrlap) → null
const r3 = parseUjFelhasznalo(fd(alap));
eq('hiányzó mezők', r3, { ok: true, data: { ...alap, fovaros: null, terulet: null, penznem: null, telefon: null, kapcsolatEmail: null } });

// Admin: poszt-adatok eldobva, elérhetőség marad
const r4 = parseSzerkesztes(fd({ nev: 'Admin', szerepkor: 'admin', orszag: 'X', fovaros: 'Y', terulet: '5', penznem: 'Z', telefon: '+36 1 234 5678', kapcsolatEmail: 'admin@niu.hu' }));
eq('admin', r4, { ok: true, data: { nev: 'Admin', szerepkor: 'admin', orszag: null, fovaros: null, terulet: null, penznem: null, telefon: '+36 1 234 5678', kapcsolatEmail: 'admin@niu.hu' } });

// Hibák
const r5 = parseSzerkesztes(fd({ nev: 'T', szerepkor: 'attase', orszag: 'Japán', terulet: '-5', telefon: 'abc', kapcsolatEmail: 'nem-email' }));
eq('hibák', r5, { ok: false, errors: { terulet: 'A terület pozitív egész szám legyen (km²).', telefon: 'A telefonszám csak számjegyet, szóközt és + - / ( ) jelet tartalmazhat.', kapcsolatEmail: 'Érvénytelen e-mail cím.' } });
const r6 = parseSzerkesztes(fd({ nev: 'T', szerepkor: 'attase', orszag: 'Japán', terulet: '12,5' }));
eq('tört terület', r6, { ok: false, errors: { terulet: 'A terület pozitív egész szám legyen (km²).' } });
const r7 = parseSzerkesztes(fd({ nev: 'T', szerepkor: 'attase', orszag: 'Japán', terulet: '0' }));
eq('nulla terület', r7, { ok: false, errors: { terulet: 'A terület pozitív egész szám legyen (km²).' } });
const r8 = parseSzerkesztes(fd({ nev: 'T', szerepkor: 'attase', orszag: 'Japán', fovaros: 'x'.repeat(101), penznem: 'y'.repeat(101), telefon: '1'.repeat(41) }));
eq('túl hosszú', r8, { ok: false, errors: { fovaros: 'A főváros legfeljebb 100 karakter.', penznem: 'A pénznem legfeljebb 100 karakter.', telefon: 'A telefonszám legfeljebb 40 karakter.' } });
```

Run: `npx tsx scripts/_x.ts`
Expected: `FAIL` sorok (az új mezők hiányoznak az eredményből) vagy típushiba.

- [ ] **Step 2: Validátor bővítése**

`lib/felhasznalo-validacio.ts`, az interfészek és a validáló függvények:

```ts
/** A poszt országának adatai (csak attasénál) és az attasé elérhetőségei (mindkét szerepkörnél). */
export interface AttaseAdatok {
  orszag: string | null;
  fovaros: string | null;
  /** km², pozitív egész. */
  terulet: number | null;
  penznem: string | null;
  telefon: string | null;
  kapcsolatEmail: string | null;
}

export interface UjFelhasznaloInput extends AttaseAdatok {
  nev: string;
  email: string;
  jelszo: string;
  szerepkor: Szerepkor;
}

export interface SzerkesztesInput extends AttaseAdatok {
  nev: string;
  szerepkor: Szerepkor;
}
```

A `validOrszag` után:

```ts
export const TELEFON_MAX = 40;
export const TERULET_MAX = 999_999_999;
const TELEFON_RE = /^[0-9+\-/() ]+$/;
const TERULET_HIBA = 'A terület pozitív egész szám legyen (km²).';

/** Opcionális, ≤100 karakteres poszt-szöveg (főváros, pénznem); csak attasénál értelmezett. */
function validPosztSzoveg(
  raw: string,
  szerepkor: Szerepkor | null,
  kulcs: 'fovaros' | 'penznem',
  cimke: string,
  errors: MezoHibak,
): string | null {
  if (szerepkor !== 'attase' || !raw) return null;
  if (raw.length > 100) {
    errors[kulcs] = `A ${cimke} legfeljebb 100 karakter.`;
    return null;
  }
  return raw;
}

/** Terület km²-ben: pozitív egész; a szóköz és a pont ezreselválasztóként megengedett. */
function validTerulet(raw: string, szerepkor: Szerepkor | null, errors: MezoHibak): number | null {
  if (szerepkor !== 'attase' || !raw) return null;
  const tiszta = raw.replace(/[ .]/g, '');
  if (!/^\d{1,9}$/.test(tiszta)) {
    errors.terulet = TERULET_HIBA;
    return null;
  }
  const n = Number(tiszta);
  if (n < 1 || n > TERULET_MAX) {
    errors.terulet = TERULET_HIBA;
    return null;
  }
  return n;
}

function validTelefon(raw: string, errors: MezoHibak): string | null {
  if (!raw) return null;
  if (raw.length > TELEFON_MAX) {
    errors.telefon = `A telefonszám legfeljebb ${TELEFON_MAX} karakter.`;
    return null;
  }
  if (!TELEFON_RE.test(raw)) {
    errors.telefon = 'A telefonszám csak számjegyet, szóközt és + - / ( ) jelet tartalmazhat.';
    return null;
  }
  return raw;
}

/** Kapcsolattartási e-mail (a bejelentkezési e-mailtől független), kisbetűsítve. */
function validKapcsolatEmail(raw: string, errors: MezoHibak): string | null {
  if (!raw) return null;
  if (!EMAIL_RE.test(raw)) {
    errors.kapcsolatEmail = 'Érvénytelen e-mail cím.';
    return null;
  }
  return raw;
}

/** Az AttaseAdatok mezői egy menetben; a poszt-adatok adminnál hiba nélkül null-ok. */
function parseAttaseAdatok(fd: FormData, szerepkor: Szerepkor | null, errors: MezoHibak): AttaseAdatok {
  return {
    orszag: validOrszag(mezo(fd, 'orszag'), szerepkor, errors),
    fovaros: validPosztSzoveg(mezo(fd, 'fovaros'), szerepkor, 'fovaros', 'főváros', errors),
    terulet: validTerulet(mezo(fd, 'terulet'), szerepkor, errors),
    penznem: validPosztSzoveg(mezo(fd, 'penznem'), szerepkor, 'penznem', 'pénznem', errors),
    telefon: validTelefon(mezo(fd, 'telefon'), errors),
    kapcsolatEmail: validKapcsolatEmail(mezo(fd, 'kapcsolatEmail').toLowerCase(), errors),
  };
}
```

A két parse függvény:

```ts
export function parseUjFelhasznalo(fd: FormData): ParseResult<UjFelhasznaloInput> {
  const errors: MezoHibak = {};
  const nev = mezo(fd, 'nev');
  const email = mezo(fd, 'email').toLowerCase();
  const jelszo = raw(fd, 'jelszo');
  validNev(nev, errors);
  if (!email) errors.email = 'Az e-mail cím kötelező.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Érvénytelen e-mail cím.';
  validJelszo(jelszo, errors);
  const szerepkor = validSzerepkor(mezo(fd, 'szerepkor'), errors);
  const adatok = parseAttaseAdatok(fd, szerepkor, errors);
  if (Object.keys(errors).length > 0 || !szerepkor) return { ok: false, errors };
  return { ok: true, data: { nev, email, jelszo, szerepkor, ...adatok } };
}

export function parseSzerkesztes(fd: FormData): ParseResult<SzerkesztesInput> {
  const errors: MezoHibak = {};
  const nev = mezo(fd, 'nev');
  validNev(nev, errors);
  const szerepkor = validSzerepkor(mezo(fd, 'szerepkor'), errors);
  const adatok = parseAttaseAdatok(fd, szerepkor, errors);
  if (Object.keys(errors).length > 0 || !szerepkor) return { ok: false, errors };
  return { ok: true, data: { nev, szerepkor, ...adatok } };
}
```

A fájl fejléc-kommentjét egészítsd ki egy mondattal: „A poszt-adatok (főváros, terület, pénznem) csak attasénál értelmezettek, adminnál hiba nélkül null-ok; a telefon és a kapcsolattartási e-mail mindkét szerepkörnél opcionális.”

A `_x.ts` `eq('teljes attasé', …)` és társai kulcssorrend-érzékenyek (JSON.stringify): a `data` objektum kulcssorrendje `nev, email, jelszo, szerepkor, orszag, fovaros, terulet, penznem, telefon, kapcsolatEmail` – a `...alap` spread pont ezt adja, a szerkesztésnél `nev, szerepkor, orszag, …`.

- [ ] **Step 3: Futtatás**

Run: `npx tsx scripts/_x.ts`
Expected: minden sor `OK`.

- [ ] **Step 4: Típusellenőrzés és script törlése**

Run: `npx tsc --noEmit` (a `db/queries/felhasznalo.ts` és az `actions.ts` még nem használja az új mezőket, ezért hiba nélkül kell futnia), majd `rm scripts/_x.ts`.

- [ ] **Step 5: Commit**

```bash
git add lib/felhasznalo-validacio.ts
git commit -m "feat(felhasznalok): attasé-adatok validálása (főváros, terület, pénznem, telefon, kapcsolat e-mail)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Lekérdezés és server action-ök

**Files:**
- Modify: `db/queries/felhasznalo.ts`
- Modify: `app/(app)/felhasznalok/actions.ts`

- [ ] **Step 1: `FelhasznaloSor` és `listFelhasznalok`**

`db/queries/felhasznalo.ts`:

```ts
import 'server-only';
import { db } from '../index';
import { user } from '../schema';
import type { AttaseAdatok, Szerepkor } from '../../lib/felhasznalo-validacio';

export interface FelhasznaloSor extends AttaseAdatok {
  id: string;
  nev: string;
  email: string;
  szerepkor: Szerepkor;
  tiltott: boolean;
  letrehozva: Date;
}

/**
 * Minden felhasználó magyar név szerinti sorrendben. Szinkron (better-sqlite3).
 * A rendezés JS-ben (localeCompare 'hu'): a SQLite BINARY collation az ékezetes neveket
 * (Ács, Örkény, Ürmös) a lista végére tenné. Néhány tucat sorra ez elhanyagolható.
 */
export function listFelhasznalok(): FelhasznaloSor[] {
  const now = Date.now();
  return db
    .select({
      id: user.id,
      nev: user.name,
      email: user.email,
      role: user.role,
      orszag: user.orszag,
      fovaros: user.fovaros,
      terulet: user.terulet,
      penznem: user.penznem,
      telefon: user.telefon,
      kapcsolatEmail: user.kapcsolatEmail,
      banned: user.banned,
      banExpires: user.banExpires,
      createdAt: user.createdAt,
    })
    .from(user)
    .all()
    .map((r) => ({
      id: r.id,
      nev: r.nev,
      email: r.email,
      szerepkor: r.role === 'admin' ? ('admin' as const) : ('attase' as const),
      orszag: r.orszag ?? null,
      fovaros: r.fovaros ?? null,
      terulet: r.terulet ?? null,
      penznem: r.penznem ?? null,
      telefon: r.telefon ?? null,
      kapcsolatEmail: r.kapcsolatEmail ?? null,
      // A Better Auth a lejárt banExpires-t nem tekinti tiltásnak.
      tiltott: Boolean(r.banned) && (!r.banExpires || r.banExpires.getTime() > now),
      letrehozva: r.createdAt,
    }))
    .sort((a, b) => a.nev.localeCompare(b.nev, 'hu'));
}
```

- [ ] **Step 2: Action-ök**

`app/(app)/felhasznalok/actions.ts`: az import bővül `type AttaseAdatok`-kal, a `FelhasznaloAdatok`:

```ts
/** A Better Auth `user` rekord általunk írt mezői (createUser / adminUpdateUser `data`). */
interface FelhasznaloAdatok extends AttaseAdatok {
  name?: string;
  role?: Szerepkor;
}
```

`createFelhasznaloAction`:

```ts
  const { nev, email, jelszo, szerepkor, ...adatok } = parsed.data;
  try {
    await auth.api.createUser({
      headers: await headers(),
      body: {
        name: nev,
        email,
        password: jelszo,
        role: szerepkor,
        data: adatok satisfies FelhasznaloAdatok,
      },
    });
  }
```

`updateFelhasznaloAction`:

```ts
  const { nev, szerepkor, ...adatok } = parsed.data;
  if (userId === me.userId && szerepkor !== 'admin') {
    return { errors: { szerepkor: 'Saját admin szerepkörödet nem veheted el.' } };
  }
  try {
    // Egyetlen hívás (név, poszt-adatok, elérhetőségek, szerepkör együtt): az
    // adminUpdateUser a data.role-t maga ellenőrzi és menti, így nincs részlegesen
    // mentett állapot. A null értékek törlik a mezőt (adminra váltásnál a poszt-adatokat).
    await auth.api.adminUpdateUser({
      headers: await headers(),
      body: { userId, data: { name: nev, role: szerepkor, ...adatok } satisfies FelhasznaloAdatok },
    });
  }
```

- [ ] **Step 3: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: hiba nélkül. Ha a Better Auth `data` típusa a `terulet: number | null`-t nem fogadja el, a `satisfies` hibát dob: ilyenkor ellenőrizd a `node_modules/better-auth/dist/plugins/admin` típusát (a `data` `Record<string, any>`-nek kell lennie); ne `as any`-vel kerüld meg, hanem jelezd.

- [ ] **Step 4: Ellenőrzés DB-vel (eldobható script)**

`scripts/_x.ts`:

```ts
import { listFelhasznalok } from '../db/queries/felhasznalo';
const sorok = listFelhasznalok();
console.log(sorok.length, 'felhasználó');
console.log(sorok.map((s) => [s.nev, s.orszag, s.fovaros, s.terulet, s.penznem, s.telefon, s.kapcsolatEmail]));
```

Run: `NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_x.ts`
Expected: a felhasználók listája, az új mezők `null`. Utána `rm scripts/_x.ts`.

- [ ] **Step 5: Commit**

```bash
git add db/queries/felhasznalo.ts "app/(app)/felhasznalok/actions.ts"
git commit -m "feat(felhasznalok): attasé-adatok mentése és lekérdezése

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Dialógusok (közös mező-komponens, szélesebb dialógus)

**Files:**
- Modify: `components/form/MuveletDialog.tsx`
- Create: `app/(app)/felhasznalok/components/AttaseMezok.tsx`
- Modify: `app/(app)/felhasznalok/components/UjFelhasznaloDialog.tsx`
- Modify: `app/(app)/felhasznalok/components/SzerkesztesDialog.tsx`

- [ ] **Step 1: `szeles` prop a `MuveletDialog`-on**

`components/form/MuveletDialog.tsx`: import `cn` a `../../lib/utils`-ból; a props bővül:

```ts
  /** Szélesebb dialógus (sm:max-w-lg) a többoszlopos űrlapokhoz. */
  szeles?: boolean;
```

a destrukturálásban `szeles = false,`, a `DialogContent`:

```tsx
      <DialogContent showCloseButton={!pending} className={cn(szeles && 'sm:max-w-lg')}>
```

- [ ] **Step 2: `AttaseMezok` komponens**

`app/(app)/felhasznalok/components/AttaseMezok.tsx`:

```tsx
'use client';

import type { ChangeEvent, ReactNode } from 'react';
import { hibaAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import type { MezoHibak } from '../../../../lib/urlap';
import { TELEFON_MAX, type Szerepkor } from '../../../../lib/felhasznalo-validacio';

/** A dialógusok vezérelt attasé-mezői (mind string: az űrlap nyers értéke). */
export interface AttaseMezoErtekek {
  orszag: string;
  fovaros: string;
  terulet: string;
  penznem: string;
  telefon: string;
  kapcsolatEmail: string;
}

export const URES_ATTASE_MEZOK: AttaseMezoErtekek = {
  orszag: '',
  fovaros: '',
  terulet: '',
  penznem: '',
  telefon: '',
  kapcsolatEmail: '',
};

/**
 * Elérhetőség (telefon, kapcsolattartási e-mail) és TéT poszt (ország, főváros, terület,
 * pénznem) blokk az új-felhasználó és a szerkesztés dialógusban. A poszt-blokk csak
 * attasénál látszik; a vezérelt értékek megmaradnak, ha a szerepkör-váltás elrejti.
 * A mezők id-ja = name = a validátor hibakulcsa (a useMuveletForm erre fókuszál).
 */
export function AttaseMezok({
  ertekek,
  onChange,
  szerepkor,
  errors,
}: {
  ertekek: AttaseMezoErtekek;
  onChange: (ertekek: AttaseMezoErtekek) => void;
  szerepkor: Szerepkor;
  errors: MezoHibak;
}) {
  const set = (kulcs: keyof AttaseMezoErtekek) => (e: ChangeEvent<HTMLInputElement>) =>
    onChange({ ...ertekek, [kulcs]: e.target.value });

  return (
    <>
      <Blokk cim="Elérhetőség">
        <div className="grid gap-3 sm:grid-cols-2">
          <Mezo id="telefon" cimke="Telefon" errors={errors}>
            <Input
              id="telefon"
              name="telefon"
              type="tel"
              inputMode="tel"
              maxLength={TELEFON_MAX}
              autoComplete="off"
              placeholder="pl. +82 2 1234 5678"
              value={ertekek.telefon}
              onChange={set('telefon')}
              {...hibaAttr(errors, 'telefon')}
            />
          </Mezo>
          <Mezo id="kapcsolatEmail" cimke="Kapcsolattartási e-mail" errors={errors}>
            <Input
              id="kapcsolatEmail"
              name="kapcsolatEmail"
              type="email"
              autoComplete="off"
              value={ertekek.kapcsolatEmail}
              onChange={set('kapcsolatEmail')}
              {...hibaAttr(errors, 'kapcsolatEmail')}
            />
          </Mezo>
        </div>
      </Blokk>
      {szerepkor === 'attase' && (
        <Blokk cim="TéT poszt">
          <div className="grid gap-3 sm:grid-cols-2">
            <Mezo id="orszag" cimke="Ország" errors={errors}>
              <Input
                id="orszag"
                name="orszag"
                required
                maxLength={100}
                autoComplete="off"
                placeholder="pl. Dél-Korea"
                value={ertekek.orszag}
                onChange={set('orszag')}
                {...hibaAttr(errors, 'orszag')}
              />
            </Mezo>
            <Mezo id="fovaros" cimke="Főváros" errors={errors}>
              <Input
                id="fovaros"
                name="fovaros"
                maxLength={100}
                autoComplete="off"
                placeholder="pl. Szöul"
                value={ertekek.fovaros}
                onChange={set('fovaros')}
                {...hibaAttr(errors, 'fovaros')}
              />
            </Mezo>
            <Mezo id="terulet" cimke="Terület (km²)" errors={errors}>
              <Input
                id="terulet"
                name="terulet"
                inputMode="numeric"
                maxLength={12}
                autoComplete="off"
                placeholder="pl. 100 210"
                value={ertekek.terulet}
                onChange={set('terulet')}
                {...hibaAttr(errors, 'terulet')}
              />
            </Mezo>
            <Mezo id="penznem" cimke="Pénznem" errors={errors}>
              <Input
                id="penznem"
                name="penznem"
                maxLength={100}
                autoComplete="off"
                placeholder="pl. dél-koreai von (KRW)"
                value={ertekek.penznem}
                onChange={set('penznem')}
                {...hibaAttr(errors, 'penznem')}
              />
            </Mezo>
          </div>
        </Blokk>
      )}
    </>
  );
}

function Blokk({ cim, children }: { cim: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2 border-t border-border pt-3">
      <legend className="pr-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{cim}</legend>
      {children}
    </fieldset>
  );
}

function Mezo({
  id,
  cimke,
  errors,
  children,
}: {
  id: string;
  cimke: string;
  errors: MezoHibak;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{cimke}</Label>
      {children}
      <MezoHiba mezo={id} errors={errors} />
    </div>
  );
}
```

Megjegyzés: a `<legend>` a `border-t` fieldset tetején a keret vonalába ül; ha a base-nova stílusban ez nem néz ki jól (a legend a vonal fölött lóg), a `Blokk` legyen `<div role="group" aria-labelledby=…>` + `<p id=…>` a cím, ugyanazokkal az osztályokkal.

- [ ] **Step 3: `UjFelhasznaloDialog`**

`app/(app)/felhasznalok/components/UjFelhasznaloDialog.tsx` `UjFelhasznaloModal` teste (a külső `UjFelhasznaloDialog` és az importok mintája változatlan; import: `AttaseMezok`, `URES_ATTASE_MEZOK`, `type AttaseMezoErtekek` az `./AttaseMezok`-ból, az `orszag` state helyett):

```tsx
  const [nev, setNev] = useState('');
  const [email, setEmail] = useState('');
  const [jelszo, setJelszo] = useState('');
  const [szerepkor, setSzerepkor] = useState<Szerepkor>('attase');
  const [attase, setAttase] = useState<AttaseMezoErtekek>(URES_ATTASE_MEZOK);
  const errors = state.errors ?? {};

  return (
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      szeles
      cim="Új felhasználó"
      leiras="A felhasználó a megadott e-mail címmel és jelszóval tud bejelentkezni."
      gomb="Létrehozás"
      formAction={formAction}
      errors={errors}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nev">Név</Label>
          <Input id="nev" name="nev" required maxLength={100} autoComplete="off" value={nev} onChange={(e) => setNev(e.target.value)} {...hibaAttr(errors, 'nev')} />
          <MezoHiba mezo="nev" errors={errors} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail cím (bejelentkezés)</Label>
          <Input id="email" name="email" type="email" required autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} {...hibaAttr(errors, 'email')} />
          <MezoHiba mezo="email" errors={errors} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="jelszo">Kezdő jelszó</Label>
          <Input id="jelszo" name="jelszo" type="password" required minLength={8} autoComplete="new-password" value={jelszo} onChange={(e) => setJelszo(e.target.value)} {...hibaAttr(errors, 'jelszo')} />
          <MezoHiba mezo="jelszo" errors={errors} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label id="szerepkor-label" htmlFor="szerepkor">Szerepkör</Label>
          <SzerepkorSelect value={szerepkor} onChange={setSzerepkor} invalid={Boolean(errors.szerepkor)} />
          <MezoHiba mezo="szerepkor" errors={errors} />
        </div>
      </div>
      <AttaseMezok ertekek={attase} onChange={setAttase} szerepkor={szerepkor} errors={errors} />
    </MuveletDialog>
  );
```

A régi `{szerepkor === 'attase' && (… orszag …)}` blokk törlődik (az `AttaseMezok` adja). A `MezoHiba`/`hibaAttr` importok maradnak. A többsoros JSX-props formázását tartsd a meglévő stílusban (egy prop soronként), a fenti tömör forma csak a terv rövidsége miatt van.

- [ ] **Step 4: `SzerkesztesDialog`**

`app/(app)/felhasznalok/components/SzerkesztesDialog.tsx`: importok bővülnek (`AttaseMezok`, `type AttaseMezoErtekek`); a state:

```tsx
  const [nev, setNev] = useState(felhasznalo.nev);
  const [szerepkor, setSzerepkor] = useState<Szerepkor>(felhasznalo.szerepkor);
  const [attase, setAttase] = useState<AttaseMezoErtekek>(() => ({
    orszag: felhasznalo.orszag ?? '',
    fovaros: felhasznalo.fovaros ?? '',
    terulet: felhasznalo.terulet === null ? '' : String(felhasznalo.terulet),
    penznem: felhasznalo.penznem ?? '',
    telefon: felhasznalo.telefon ?? '',
    kapcsolatEmail: felhasznalo.kapcsolatEmail ?? '',
  }));
  const errors = state.errors ?? {};
```

A `MuveletDialog` `szeles` propot kap; a Fiók blokk (`nev`, `szerepkor`) kétoszlopos `grid gap-3 sm:grid-cols-2`-ben, a figyelmeztetés:

```tsx
        {szerepkor === 'admin' && felhasznalo.orszag && (
          <p className="text-xs text-muted-foreground">Adminra váltva az ország és a poszt adatai törlődnek.</p>
        )}
```

majd a rács után `<AttaseMezok ertekek={attase} onChange={setAttase} szerepkor={szerepkor} errors={errors} />`; a régi ország-blokk törlődik.

- [ ] **Step 5: Típusellenőrzés és böngészős próba**

Run: `npx tsc --noEmit` → hiba nélkül.

Böngésző (gstack `browse`, admin belépéssel, `/felhasznalok`):
1. „Új felhasználó” → a dialógus szélesebb, három blokk látszik (Fiók mezők, Elérhetőség, TéT poszt).
2. Szerepkört adminra váltva a TéT poszt blokk eltűnik, az Elérhetőség marad.
3. Attasé felvétele: név `Próba Attasé`, e-mail `proba.attase@niu.hu`, jelszó `Proba1234!`, ország `Japán`, főváros `Tokió`, terület `377 975`, pénznem `japán jen (JPY)`, telefon `+81 3 1234-5678`, kapcsolat e-mail `proba@tokyo.hu` → toast „Felhasználó létrehozva.”, a sor megjelenik.
4. Szerkesztés a soron: minden érték előtöltve (a terület `377975`-ként).
5. Szerkesztésben telefon `abc`, terület `-5` → a mező alatt hiba, a fókusz a `terulet` mezőn (az első hibakulcs a `parseAttaseAdatok` sorrendjében: terulet előbb, mint telefon).
6. Szerkesztésben adminra váltás + mentés → a sor Ország oszlopa `–`; a szerkesztés újranyitva a telefon megmaradt, a poszt-mezők üresek (visszaváltva attaséra).
7. `console --errors` → nincs hiba.
8. Takarítás: a próba felhasználó törlése a UI-ból (Műveletek → Törlés).

- [ ] **Step 6: Commit**

```bash
git add components/form/MuveletDialog.tsx "app/(app)/felhasznalok/components/AttaseMezok.tsx" "app/(app)/felhasznalok/components/UjFelhasznaloDialog.tsx" "app/(app)/felhasznalok/components/SzerkesztesDialog.tsx"
git commit -m "feat(felhasznalok): attasé-adatok az új felhasználó és a szerkesztés dialógusban

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Táblázat, dokumentáció, build

**Files:**
- Modify: `app/(app)/felhasznalok/components/FelhasznaloTabla.tsx`
- Modify: `CLAUDE.md` (Auth bekezdés, `user.orszag` mondat)
- Modify: `README.md` (ha a felhasználó-kezelést leírja)

- [ ] **Step 1: Telefon oszlop**

`FelhasznaloTabla.tsx`: a fejlécben az `Ország` után `<TableHead>Telefon</TableHead>`, a sorban az ország cella után:

```tsx
              <TableCell className="whitespace-nowrap">
                {f.telefon ?? <span className="text-muted-foreground">–</span>}
              </TableCell>
```

- [ ] **Step 2: CLAUDE.md**

Az Auth bekezdésben a `user.orszag` mondat helyett:

„A `user.orszag` mező (`additionalFields`, `input: false`) az attasé posztjának országa; mellette ugyanígy `fovaros`, `terulet` (km², egész), `penznem` (csak attasénál, adminra váltáskor törlődnek) és `telefon`, `kapcsolatEmail` (oszlop `kapcsolat_email`, mindkét szerepkörnél). A validátor `lib/felhasznalo-validacio.ts` (`AttaseAdatok`), a két dialógus közös mező-blokkja `app/(app)/felhasznalok/components/AttaseMezok.tsx`, a `MuveletDialog` `szeles` propja adja a szélesebb keretet.”

`README.md`: ha van felhasználó-kezelés szakasz, egy mondat az új mezőkről; ha nincs, ne hozz létre.

- [ ] **Step 3: Build**

Run: `npx tsc --noEmit && npm run build`
Expected: hiba nélkül. Ha a build nem létező `app/...` modulra panaszkodik, `rm .next/dev/types/validator.ts` és újra.

- [ ] **Step 4: Commit**

```bash
git add "app/(app)/felhasznalok/components/FelhasznaloTabla.tsx" CLAUDE.md README.md
git commit -m "feat(felhasznalok): Telefon oszlop a listában, dokumentáció

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```
