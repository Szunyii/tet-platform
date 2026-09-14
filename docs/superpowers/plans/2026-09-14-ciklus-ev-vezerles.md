# A fejléc éve vezérli az országprofilt és a térképet – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A fejléc „Ciklus" választójában kiválasztott év (cookie) határozza meg a térképet, az országprofil adatlapját és a szerkesztőt; az oldalak saját `?ev=` alapú évválasztója megszűnik.

**Architecture:** A választott év egy `tet-ev` httpOnly cookie-ban él. A fejléc `<select>` a `valasztEvAction` server actiont hívja (`app/(app)/actions.ts`), amely validál, cookie-t ír és a layoutot revalidálja. A szerver oldal a `lib/valasztott-ev.ts` `getValasztottEv(most)` helperből olvas (layout, `/terkep`, `/orszagprofil/[kod]`, `/szerkesztes`). A térkép-lekérdezés országonként a legnagyobb év ≤ választott év profilját adja; a Szerkesztés gombok közös `SzerkesztesGomb` komponensen mennek, amely nem szerkeszthető évnél form-gombbal az aktuális évre vált és a szerkesztőre irányít.

**Tech Stack:** Next.js 16 App Router (Server Actions, `cookies()`, `revalidatePath`, `redirect`), React 19 (`useTransition`), TypeScript 7, drizzle-orm + better-sqlite3, shadcn/ui (`Button`, `buttonVariants`).

**Spec:** `docs/superpowers/specs/2026-09-14-ciklus-ev-vezerles-design.md`.

**Ellenőrzés:** Nincs tesztkeretrendszer. Minden task végén `npx tsc --noEmit`; a UI-t a gstack headless böngészővel (`~/.claude/skills/gstack/browse/dist/browse goto/fill/click/text/js/snapshot -i/console --errors`). A felhasználó dev szervere fut a 3000-en: **nem szabad leállítani/újraindítani**, a subagent nem indít sajátot. Seed admin `admin@niu.hu`, teszt attasé `masodik.attase@niu.hu` (JP); jelszavak a `.env.local`-ban (`SEED_ADMIN_PASSWORD`) ill. a `.env.example`-ben (`Attase12345!`) – az admin jelszót ne írd ki. Commit üzenetek végén: `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. `git add` mindig konkrét fájlokkal; `.env.example`-t és `AGENTS.md`-t soha ne stage-elj. Reviewer subagentnek: git csak olvasásra, tilos a `checkout`/`reset`/`stash`.

**Fontos tények (ellenőrizve a meglévő kódban):**
- A helyi DB-ben profil: JP 2025, JP 2026, KR 2026. `EV_MIN = 2020`, `aktualisEv()` = 2026.
- `profilAllapot(ev: number | null, most: number)`: `null` → `nincs`, `ev === most` → `friss`, egyébként `elavult` (`lib/orszagprofil-szotar.ts:63`). A második paraméter bármely „viszonyítási év" lehet.
- `canEditProfil(session, kod, ev, aktualisEv)` (`lib/orszagprofil-jog.ts`): admin `EV_MIN..aktualisEv`, attasé csak saját kód és `ev === aktualisEv`.
- `AppShell` (`components/AppShell.tsx`) ma `evek` + `aktualisEv` propot kap, `useState`-ben tartja az `ev`-et, a context `ev`/`setEv`; egyetlen fogyasztó `app/(app)/monitoring/page.tsx` (`const { ev } = useApp()`).
- `listTerkepAdat(aktualisEv)` (`db/queries/orszagprofil.ts`) országonként az első sort veszi az év szerint csökkenő listából.
- `ProfilKivonat` és `TerkepNezet` a `szerkesztes?ev=${aktualisEv}` linket használja; a profil oldal `EvValaszto`-t és `evParam`-ot; a szerkesztő `EvValaszto`-t (admin) és `evParam`-ot.
- A `cookies()` a Next 16-ban aszinkron (`await cookies()`); server actionben `.set()` engedélyezett, Server Componentben csak olvasás.
- Server action propként átadható kliens komponensnek (a `logoutAction` így megy az `AppShell`-nek).

---

### Task 1: Cookie-alapú év: helper, action, layout, AppShell

**Files:**
- Create: `lib/valasztott-ev.ts`
- Modify: `app/(app)/actions.ts`
- Modify: `app/(app)/layout.tsx`
- Modify: `components/AppShell.tsx`

- [ ] **Step 1: Helper**

`lib/valasztott-ev.ts`:

```ts
import 'server-only';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { EV_MIN } from './orszagprofil-szotar';

// Next-függő szerver-oldali segéd (mint a lib/session.ts): a CLAUDE.md lib/ szabályának tudatos kivétele.

/** A fejlécben választott ciklus (év) cookie-ja. httpOnly: csak a szerver olvassa és írja (valasztEvAction). */
export const EV_COOKIE = 'tet-ev';

/** Érvényes-e a választott év: négyjegyű egész EV_MIN és `most` között. */
export function ervenyesValasztottEv(ev: number, most: number): boolean {
  return Number.isInteger(ev) && ev >= EV_MIN && ev <= most;
}

/**
 * A választott év a cookie-ból; hiányzó vagy érvénytelen érték esetén az aktuális év.
 * React.cache: egy kérésen belül (layout + page) egyszer olvas.
 */
export const getValasztottEv = cache(async (most: number): Promise<number> => {
  const raw = (await cookies()).get(EV_COOKIE)?.value;
  const ev = raw && /^\d{4}$/.test(raw) ? Number(raw) : NaN;
  return ervenyesValasztottEv(ev, most) ? ev : most;
});
```

- [ ] **Step 2: Server action**

`app/(app)/actions.ts` – bővítsd az importokat és add hozzá az actiont a `logoutAction` után:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '../../lib/auth';
import { aktualisEv } from '../../lib/datum';
import { orszagByKod } from '../../lib/orszagok';
import { LOGIN_ROUTE } from '../../lib/routes';
import { requireSession } from '../../lib/session';
import { mezo } from '../../lib/urlap';
import { ervenyesValasztottEv, EV_COOKIE } from '../../lib/valasztott-ev';
```

(A meglévő `LogoutState` és `logoutAction` változatlan.) Új action:

```ts
/**
 * A fejléc ciklusválasztója: a választott évet httpOnly cookie-ba írja, és a layoutot
 * revalidálja, így a térkép, a profil és a szerkesztő oldal az új évre renderelődik.
 * Érvénytelen év (nem négyjegyű, EV_MIN alatt vagy az aktuális év felett) → nem ír semmit.
 * Opcionális `kod` mezővel az ország szerkesztőjére irányít (a „Szerkesztés (2026)" gomb:
 * attasé múltbeli évnézetből egy lépésben az aktuális évre vált és szerkeszt).
 * A redirect() kivétellel működik: a try/catch-en kívül hívjuk.
 */
export async function valasztEvAction(formData: FormData): Promise<void> {
  await requireSession();
  const most = aktualisEv();
  const evRaw = mezo(formData, 'ev');
  const ev = /^\d{4}$/.test(evRaw) ? Number(evRaw) : NaN;
  if (!ervenyesValasztottEv(ev, most)) return;
  (await cookies()).set(EV_COOKIE, String(ev), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === 'production',
  });
  revalidatePath('/', 'layout');
  const kod = mezo(formData, 'kod');
  if (kod && orszagByKod(kod)) redirect(`/orszagprofil/${kod}/szerkesztes`);
}
```

- [ ] **Step 3: Layout**

`app/(app)/layout.tsx` teljes új tartalma:

```tsx
import AppShell from '../../components/AppShell';
import { listProfilEvek } from '../../db/queries/orszagprofil';
import { countOlvasatlan } from '../../db/queries/ticket';
import { aktualisEv } from '../../lib/datum';
import { EV_MIN } from '../../lib/orszagprofil-szotar';
import { requireSession } from '../../lib/session';
import { getValasztottEv } from '../../lib/valasztott-ev';
import { logoutAction, valasztEvAction } from './actions';

// Minden védett oldal ebben a route groupban van. A requireSession() itt egy helyen
// kényszeríti ki a bejelentkezést (elavult cookie esetén is: a proxy átengedi, ez
// viszont /login-ra irányít). A /login a gyökér layout alatt marad.
//
// Ez NEM helyettesíti az oldalankénti és action-önkénti ellenőrzést: kliens-oldali
// navigációnál a layout nem fut újra, a server action-ök pedig egyáltalán nem
// renderelnek layoutot. Minden szerver-oldali adatot olvasó page és minden action
// maga hívja a requireSession()/requireAdmin()-t.
//
// Az olvasatlan ticket-számláló és a ciklusválasztó évlistája ugyanezért kliens-oldali
// navigációnál késhet: a ticket-, a profil-mentő és az évválasztó action-ök
// revalidatePath('/', 'layout')-tal frissítik.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const olvasatlan = countOlvasatlan(session);
  const most = aktualisEv();
  const ev = await getValasztottEv(most);
  // A fejléc ciklusválasztója. Admin: minden év EV_MIN-től az aktuálisig (új év profilját is
  // létre kell tudnia hozni, a szerkesztőnek nincs saját évválasztója). Attasé: a DB-ben létező
  // profil-évek + az aktuális év. A választott év mindig benne van, hogy a select konzisztens legyen.
  const evek = session.role === 'admin'
    ? Array.from({ length: most - EV_MIN + 1 }, (_, i) => most - i)
    : [...new Set([most, ev, ...listProfilEvek()])].sort((a, b) => b - a);
  return (
    <AppShell
      user={session}
      logoutAction={logoutAction}
      valasztEvAction={valasztEvAction}
      olvasatlan={olvasatlan}
      ev={ev}
      evek={evek}
    >
      {children}
    </AppShell>
  );
}
```

- [ ] **Step 4: AppShell**

`components/AppShell.tsx` módosításai:

Importok (a `useState` mellé `useTransition`):

```ts
import { createContext, useActionState, useContext, useState, useTransition, type ReactNode } from 'react';
```

Típusok és `AppState` (a `LogoutAction` sor után):

```ts
type LogoutAction = (prev: LogoutState) => Promise<LogoutState>;
type ValasztEvAction = (formData: FormData) => Promise<void>;

interface AppState {
  user: AppSession;
  /** A fejlécben kiválasztott ciklus (év) – a tet-ev cookie-ból, a layout adja. Váltani a fejléc selectje tud (valasztEvAction). */
  ev: number;
  /** Olvasatlan, nem lezárt ticketek száma – a Kommunikáció menüpont számlálója. */
  olvasatlan: number;
  /** A /kommunikacio oldal írja felül a saját, frissebb számával (OlvasatlanSzinkron). */
  setOlvasatlan: (n: number) => void;
}
```

A komponens szignatúrája és az év-blokk (a régi `evek`/`aktualisEv` propok, a `useState(aktualisEv)` és az `if (!evek.includes(ev) …)` igazítás + kommentje helyett):

```tsx
export default function AppShell({
  user,
  logoutAction,
  valasztEvAction,
  olvasatlan: szerverOlvasatlan,
  ev,
  evek,
  children,
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
  children: ReactNode;
}) {
  // Évváltás: server action írja a cookie-t és revalidálja a layoutot; a transition alatt a select tiltott.
  const [evValtas, startEvValtas] = useTransition();
  const valasztEv = (uj: string) => {
    const fd = new FormData();
    fd.set('ev', uj);
    startEvValtas(() => valasztEvAction(fd));
  };
```

(A meglévő `olvasatlan`/`elozoSzerver` blokk változatlanul marad utána.)

Provider value:

```tsx
<AppContext.Provider value={{ user, ev, olvasatlan, setOlvasatlan }}>
```

Fejléc select:

```tsx
<label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: '#6b7684' }}>
  Ciklus
  <select className="input" value={ev} disabled={evValtas} onChange={(e) => valasztEv(e.target.value)}>
    {evek.map((y) => <option key={y} value={y}>{y}</option>)}
  </select>
</label>
```

A sidebar „Aktív ciklus: {ev}" sora változatlan. A monitoring oldal (`const { ev } = useApp()`) változatlanul fordul.

- [ ] **Step 5: Típusellenőrzés és grep**

Run: `npx tsc --noEmit` → nincs hiba.
Run: `grep -rn "setEv\|aktualisEv=" components app --include='*.tsx'` → csak a `TerkepNezet`/`ProfilKivonat`/`terkep/page.tsx` `aktualisEv` propja (Task 2 cseréli), `setEv` sehol.

- [ ] **Step 6: Böngészős ellenőrzés**

`B=~/.claude/skills/gstack/browse/dist/browse`, admin bejelentkezés (`$B goto http://localhost:3000/login`, `$B fill` + `$B click`).

1. `$B goto http://localhost:3000/monitoring`; `$B js "[...document.querySelectorAll('header select option')].map(o => o.value)"` → `["2026","2025","2024","2023","2022","2021","2020"]` (admin: EV_MIN..2026).
2. `$B js "const s=document.querySelector('header select'); s.value='2024'; s.dispatchEvent(new Event('change',{bubbles:true}))"`, majd 1–2 mp után `$B text` → „Hálózati rangsor · 2024" és „Aktív ciklus: 2024".
3. `$B goto http://localhost:3000/riportok` (másik oldal, teljes betöltés) → `$B text` továbbra is „Aktív ciklus: 2024" (a cookie él).
4. Vissza 2026-ra ugyanígy → „Aktív ciklus: 2026".
5. Érvénytelen cookie: curl-lel. Jelentkezz be curl-lel és tedd a cookie jarba a rossz évet (a jelszót a `.env.local`-ból `$SEED_ADMIN_PASSWORD` változóba olvasd, ne írd ki):

```bash
C=$(mktemp)
curl -s -c "$C" -H 'Content-Type: application/json' -d "{\"email\":\"admin@niu.hu\",\"password\":\"$SEED_ADMIN_PASSWORD\"}" http://localhost:3000/api/auth/sign-in/email > /dev/null
printf 'localhost\tFALSE\t/\tFALSE\t0\ttet-ev\t1999\n' >> "$C"
curl -s -b "$C" http://localhost:3000/monitoring | grep -o 'Aktív ciklus: [0-9]*'
```

Expected: `Aktív ciklus: 2026` (érvénytelen év → aktuális év). Ugyanez `abc` értékkel is 2026.
6. Attasé (`masodik.attase@niu.hu`, új böngésző-session: `$B goto http://localhost:3000/login` után előbb kijelentkezés a fejléc gombjával): opciók `["2026","2025"]`.
7. `$B console --errors` → üres.

- [ ] **Step 7: Commit**

```bash
git add lib/valasztott-ev.ts "app/(app)/actions.ts" "app/(app)/layout.tsx" components/AppShell.tsx
git commit -m "feat(ciklus): a választott év tet-ev cookie-ban, valasztEvAction, layout és AppShell a szerverről

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Térkép évnézetben és a közös SzerkesztesGomb

**Files:**
- Modify: `db/queries/orszagprofil.ts` (`listTerkepAdat`)
- Modify: `lib/orszagprofil-szotar.ts` (`ALLAPOT_CIMKE.friss`)
- Create: `components/orszagprofil/SzerkesztesGomb.tsx`
- Modify: `app/(app)/terkep/page.tsx`
- Modify: `app/(app)/terkep/components/TerkepNezet.tsx`
- Modify: `app/(app)/terkep/components/ProfilKivonat.tsx`

- [ ] **Step 1: Lekérdezés évnézetre**

`db/queries/orszagprofil.ts` – a `listTerkepAdat` docblockja és szignatúrája, valamint a profil-válogató ciklus:

```ts
/**
 * A térkép és a panel adata a választott `ev` nézetében: minden ország, ahol aktív attasé van
 * vagy van profil, országonként a legnagyobb év ≤ ev profiljával. Az `allapot` az `ev`-hez
 * viszonyít: van profil az évre → friss, csak régebbi → elavult, semmi → nincs (ev = aktuális
 * évnél ez a korábbi viselkedés). Két lekérdezés + JS-összefésülés; az orszagprofil tábla
 * országok × évek méretű, minden sorát beolvassuk – ezen a skálán rendben van.
 */
export function listTerkepAdat(ev: number): TerkepOrszag[] {
```

és a ciklus:

```ts
  // Országonként a legnagyobb, ev-nél nem nagyobb év sora. (Az év szerint csökkenő listából
  // az első előfordulás országonként; a max(ev)-es al-lekérdezéses join helyett, mert a
  // Drizzle az aliasolt sql-oszlopot a join-feltételben minősítés nélkül írja ki.)
  const profilok: (typeof orszagprofil.$inferSelect)[] = [];
  const lattuk = new Set<string>();
  for (const p of db.select().from(orszagprofil).orderBy(desc(orszagprofil.ev)).all()) {
    if (p.ev > ev || lattuk.has(p.orszagKod)) continue;
    lattuk.add(p.orszagKod);
    profilok.push(p);
  }
```

és az állapot sora: `allapot: profilAllapot(prof?.ev ?? null, ev),`. Az `aktualisEv` paraméter-név minden előfordulása `ev`-re cserélve a függvényben.

- [ ] **Step 2: Címke**

`lib/orszagprofil-szotar.ts` `ALLAPOT_CIMKE`: `friss: 'Idei profil'` → `friss: 'Az évi profil'` (az `AllapotBadge` docblock példáját is: „Az évi profil · 2026").

- [ ] **Step 3: SzerkesztesGomb**

`components/orszagprofil/SzerkesztesGomb.tsx`:

```tsx
import Link from 'next/link';
import { Button, buttonVariants } from '../ui/button';
import { cn } from '../../lib/utils';

/**
 * Az országprofil szerkesztőjére vivő gomb a térkép panelén és a profil oldalon.
 * Ha a nézett (választott) év szerkeszthető: sima link. Ha csak az aktuális év szerkeszthető
 * (attasé múltbeli évnézetben): form-gomb, amely a valasztEvAction-nel a ciklust az aktuális
 * évre állítja és a szerkesztőre irányít – a felirat jelzi az évet: „Szerkesztés (2026)".
 * Ha egyik sem: nem renderel semmit. A jogot a hívó számolja (canEditProfil, ill. a térképen
 * admin || saját kód).
 */
export function SzerkesztesGomb({
  kod, most, szerkeszthetEv, szerkeszthetMost, action, felirat, className,
}: {
  kod: string;
  most: number;
  szerkeszthetEv: boolean;
  szerkeszthetMost: boolean;
  action: (formData: FormData) => Promise<void>;
  felirat: string;
  className?: string;
}) {
  if (szerkeszthetEv) {
    return (
      <Link href={`/orszagprofil/${kod}/szerkesztes`} className={cn(buttonVariants(), className)}>{felirat}</Link>
    );
  }
  if (!szerkeszthetMost) return null;
  return (
    <form action={action} className={className}>
      <input type="hidden" name="ev" value={most} />
      <input type="hidden" name="kod" value={kod} />
      <Button type="submit">{felirat} ({most})</Button>
    </form>
  );
}
```

(Nem `'use client'`: kliens komponensből is renderelhető, mert nincs benne hook; a `Button` és a `Link` kliens-kompatibilis.)

- [ ] **Step 4: Térkép page**

`app/(app)/terkep/page.tsx` teljes új tartalma:

```tsx
import type { Metadata } from 'next';
import { listTerkepAdat } from '../../../db/queries/orszagprofil';
import { aktualisEv } from '../../../lib/datum';
import { orszagByKod } from '../../../lib/orszagok';
import { requireSession } from '../../../lib/session';
import { getValasztottEv } from '../../../lib/valasztott-ev';
import { valasztEvAction } from '../actions';
import { TerkepNezet } from './components/TerkepNezet';

export const metadata: Metadata = { title: 'Országprofil' };

export default async function TerkepPage({
  searchParams,
}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireSession();
  const most = aktualisEv();
  const ev = await getValasztottEv(most);
  const o = (await searchParams).o;
  const kezdoKod = typeof o === 'string' && orszagByKod(o) ? o : null;
  // A key a ?o= változásakor (vissza/előre, oldalsáv) újramountolja a nézetet, hogy a kezdő kiválasztás frissüljön.
  return (
    <TerkepNezet
      key={kezdoKod ?? ''}
      adatok={listTerkepAdat(ev)}
      ev={ev}
      most={most}
      sajatKod={session.orszag}
      admin={session.role === 'admin'}
      kezdoKod={kezdoKod}
      valasztEvAction={valasztEvAction}
    />
  );
}
```

- [ ] **Step 5: TerkepNezet**

`app/(app)/terkep/components/TerkepNezet.tsx`: az importokból a `Link` és a `buttonVariants` kikerül (ha más nem használja – ellenőrizd), és bejön:

```ts
import { SzerkesztesGomb } from '../../../../components/orszagprofil/SzerkesztesGomb';
```

Szignatúra:

```tsx
export function TerkepNezet({
  adatok, ev, most, sajatKod, admin, kezdoKod, valasztEvAction,
}: {
  adatok: TerkepOrszag[];
  /** A választott (nézett) év és az aktuális év. */
  ev: number;
  most: number;
  sajatKod: string | null;
  admin: boolean;
  kezdoKod: string | null;
  valasztEvAction: (formData: FormData) => Promise<void>;
}) {
```

A számláló szövege: `` `${adatok.length} poszt · ${friss} profil (${ev})` ``.

A „Saját országprofil" gomb helyett:

```tsx
{sajatKod && !admin && (
  <SzerkesztesGomb
    kod={sajatKod}
    most={most}
    szerkeszthetEv={ev === most}
    szerkeszthetMost
    action={valasztEvAction}
    felirat="Saját országprofil"
  />
)}
```

(A gomb mérete: a `SzerkesztesGomb` alap méretű; a `size: 'sm'` elhagyható, a fejléc sorában elfér.)

A `ProfilKivonat` hívása:

```tsx
<ProfilKivonat
  o={sel}
  szerkeszthetEv={admin || (sel.kod === sajatKod && ev === most)}
  szerkeszthetMost={admin || sel.kod === sajatKod}
  most={most}
  valasztEvAction={valasztEvAction}
  onClose={() => setKod(null)}
/>
```

- [ ] **Step 6: ProfilKivonat**

`app/(app)/terkep/components/ProfilKivonat.tsx`: import `SzerkesztesGomb` (`'../../../../components/orszagprofil/SzerkesztesGomb'`); szignatúra:

```tsx
export function ProfilKivonat({
  o, szerkeszthetEv, szerkeszthetMost, most, valasztEvAction, onClose,
}: {
  o: TerkepOrszag;
  szerkeszthetEv: boolean;
  szerkeszthetMost: boolean;
  most: number;
  valasztEvAction: (formData: FormData) => Promise<void>;
  onClose: () => void;
}) {
```

A „nincs profil" szöveg: `Ehhez az évhez még nincs országprofil.` A footer szerkesztő-linkje helyett:

```tsx
<SzerkesztesGomb
  kod={o.kod}
  most={most}
  szerkeszthetEv={szerkeszthetEv}
  szerkeszthetMost={szerkeszthetMost}
  action={valasztEvAction}
  felirat={o.allapot === 'nincs' ? 'Profil kitöltése' : 'Szerkesztés'}
  className="ml-auto"
/>
```

- [ ] **Step 7: Típusellenőrzés**

Run: `npx tsc --noEmit` → nincs hiba. (A profil és a szerkesztő oldal még `?ev=`-vel dolgozik, az a Task 3; a `?ev=` nélküli szerkesztő-link ott az aktuális évre esik, tehát a Task 2 önmagában is működik.)

- [ ] **Step 8: Böngészős ellenőrzés**

Admin:
1. `$B goto http://localhost:3000/terkep` (2026): a panel szövege „N poszt · 2 profil (2026)"; JP kattintás → „Az évi profil · 2026"; KR → „Az évi profil · 2026".
2. Fejléc 2025-re → `$B goto http://localhost:3000/terkep?o=JP` → „Az évi profil · 2025", a 2025-ös alapadatok; `?o=KR` → „Nincs profil", „Ehhez az évhez még nincs országprofil.", gomb „Profil kitöltése" (link, admin). Kattintás → `/orszagprofil/KR/szerkesztes` nyílik (Task 3 előtt az aktuális évvel – ez ott változik).
3. Vissza 2026-ra.

Attasé (JP): 
4. `/terkep` 2026-ban: „Saját országprofil" link. Fejléc 2025-re → a gomb „Saját országprofil (2026)" form-gomb; kattintás → a fejléc 2026-ra vált és a `/orszagprofil/JP/szerkesztes` nyílik. `$B js "document.querySelector('header select').value"` → `2026`.
5. `$B console --errors` → üres.

- [ ] **Step 9: Commit**

```bash
git add db/queries/orszagprofil.ts lib/orszagprofil-szotar.ts components/orszagprofil/SzerkesztesGomb.tsx components/orszagprofil/AllapotBadge.tsx "app/(app)/terkep/page.tsx" "app/(app)/terkep/components/TerkepNezet.tsx" "app/(app)/terkep/components/ProfilKivonat.tsx"
git commit -m "feat(terkep): a térkép a választott év nézetében, közös SzerkesztesGomb

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Profil oldal és szerkesztő a cookie évére, takarítás, dokumentáció

**Files:**
- Modify: `db/queries/orszagprofil.ts` (új `getUtolsoEv`, `listEvek` törlése)
- Modify: `app/(app)/orszagprofil/[kod]/page.tsx`
- Modify: `app/(app)/orszagprofil/[kod]/szerkesztes/page.tsx`
- Delete: `app/(app)/orszagprofil/components/EvValaszto.tsx`
- Modify: `lib/orszagprofil-szotar.ts` (`evParam` törlése)
- Modify: `CLAUDE.md`, `README.md`

- [ ] **Step 1: Lekérdezés**

`db/queries/orszagprofil.ts`: importáld a `lte`-t (`import { and, desc, eq, lte } from 'drizzle-orm';`), a `listEvek` helyére:

```ts
/** Az ország legnagyobb profil-éve, amely nem nagyobb `ev`-nél (az évnézet állapot-jelvénye), vagy null. */
export function getUtolsoEv(kod: string, ev: number): number | null {
  const r = db
    .select({ ev: orszagprofil.ev })
    .from(orszagprofil)
    .where(and(eq(orszagprofil.orszagKod, kod), lte(orszagprofil.ev, ev)))
    .orderBy(desc(orszagprofil.ev))
    .limit(1)
    .get();
  return r?.ev ?? null;
}
```

- [ ] **Step 2: Profil oldal**

`app/(app)/orszagprofil/[kod]/page.tsx` teljes új tartalma:

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AllapotBadge } from '../../../../components/orszagprofil/AllapotBadge';
import { BlokkNezet } from '../../../../components/orszagprofil/BlokkNezet';
import { SzerkesztesGomb } from '../../../../components/orszagprofil/SzerkesztesGomb';
import { buttonVariants } from '../../../../components/ui/button';
import { getAttaseNev, getProfil, getUtolsoEv } from '../../../../db/queries/orszagprofil';
import { aktualisEv, formatDatumIdo } from '../../../../lib/datum';
import { orszagByKod } from '../../../../lib/orszagok';
import { canEditProfil } from '../../../../lib/orszagprofil-jog';
import { BLOKK_KULCSOK, profilAllapot, type BlokkKulcs } from '../../../../lib/orszagprofil-szotar';
import { requireSession } from '../../../../lib/session';
import { cn } from '../../../../lib/utils';
import { getValasztottEv } from '../../../../lib/valasztott-ev';
import { valasztEvAction } from '../../actions';

// Statikus cím az egyszerűség kedvéért; nincs szivárgási kockázat, minden bejelentkezett
// felhasználó minden profilt olvashat, és az országnév szótáradat.
export const metadata: Metadata = { title: 'Országprofil' };

/**
 * Országprofil olvasó nézet. Bárki olvashat bármely profilt; a nézett év a fejléc
 * ciklusválasztójáé (tet-ev cookie). Ha az évre nincs profil, üres adatlap – nincs visszaesés
 * a legfrissebb évre. Ismeretlen országkód 404. A Szerkesztés gomb a nézett évre visz, ha azt
 * a felhasználó szerkesztheti (admin: EV_MIN-től az aktuális évig), különben – attasé múltbeli
 * évnézetben – az aktuális évre vált és úgy nyitja a szerkesztőt („Szerkesztés (2026)").
 */
export default async function OrszagprofilPage({ params }: { params: Promise<{ kod: string }> }) {
  const session = await requireSession();
  const { kod } = await params;
  const orszag = orszagByKod(kod);
  if (!orszag) notFound();
  const most = aktualisEv();
  const ev = await getValasztottEv(most);
  const profil = getProfil(kod, ev);
  const attaseNev = getAttaseNev(kod);
  // A jelvény az évnézet szabályával (mint a térkép): a legnagyobb profil-év ≤ ev állapota az ev-hez képest.
  const utolsoEv = getUtolsoEv(kod, ev);
  const allapot = profilAllapot(utolsoEv, ev);
  // Korrelált generikus: a K köti össze a kulcsot és a blokk-típust (a map-ben unió lenne).
  const blokk = <K extends BlokkKulcs>(k: K) => <BlokkNezet key={k} kulcs={k} tartalom={profil?.blokkok[k] ?? null} />;

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg font-semibold">{orszag.nev}</h2>
          <p className="text-sm text-muted-foreground">{attaseNev ? `Attasé: ${attaseNev}` : 'Nincs aktív attasé'}</p>
        </div>
        <AllapotBadge allapot={allapot} ev={utolsoEv} />
        <div className="ml-auto flex gap-2">
          <Link href={`/terkep?o=${kod}`} className={cn(buttonVariants({ variant: 'outline' }))}>Vissza a térképre</Link>
          <SzerkesztesGomb
            kod={kod}
            most={most}
            szerkeszthetEv={canEditProfil(session, kod, ev, most)}
            szerkeszthetMost={canEditProfil(session, kod, most, most)}
            action={valasztEvAction}
            felirat="Szerkesztés"
          />
        </div>
      </div>
      {profil ? (
        <p className="text-sm text-muted-foreground">
          {profil.ev}. évi profil · utoljára módosítva {formatDatumIdo(profil.updatedAt)}
          {profil.szerzo ? ` · ${profil.szerzo.nev}` : ''} · {profil.mentett.length}/{BLOKK_KULCSOK.length} blokk kitöltve
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Ehhez az évhez ({ev}) még nincs országprofil.</p>
      )}
      {BLOKK_KULCSOK.map(blokk)}
    </div>
  );
}
```

- [ ] **Step 3: Szerkesztő**

`app/(app)/orszagprofil/[kod]/szerkesztes/page.tsx`:

Importok: az `EV_MIN`, `evParam` és az `EvValaszto` import kikerül; bejön:

```ts
import { uresBlokk, type BlokkKulcs, type ProfilBlokkok } from '../../../../../lib/orszagprofil-szotar';
import { getValasztottEv } from '../../../../../lib/valasztott-ev';
```

Docblock és a függvény eleje:

```tsx
/**
 * Blokkonkénti szerkesztő. Az év a fejléc ciklusválasztójáé (tet-ev cookie). Jogosultsági
 * hiba 404 (attasé: csak a saját országa és az aktuális év; admin: bármely ország EV_MIN és
 * az aktuális év között) – attasé múltbeli évnézetből a gombok előbb az aktuális évre váltanak,
 * így a 404 csak kézzel beírt URL-nél fordul elő.
 */
export default async function SzerkesztesPage({ params }: { params: Promise<{ kod: string }> }) {
  const session = await requireSession();
  const { kod } = await params;
  const orszag = orszagByKod(kod);
  if (!orszag) notFound();
  const most = aktualisEv();
  const ev = await getValasztottEv(most);
  if (!canEditProfil(session, kod, ev, most)) notFound();
```

Az `evek` sor törlődik; a fejléc sorában az `EvValaszto` feltételes helyett:

```tsx
<span className="text-sm text-muted-foreground">Év: {ev}</span>
<Link href={`/orszagprofil/${kod}`} className={cn('ml-auto', buttonVariants({ variant: 'outline' }))}>
  Megtekintés
</Link>
```

A `<Fragment key={ev}>` kommentje: „key={ev}: az App Router a cookie-ból jövő évet nem veszi az állapot-kulcsba, így évváltásnál a 8 blokk kliens-állapota (a beírt, nem mentett értékek) különben átcsúszna a másik évre."

- [ ] **Step 4: Takarítás**

- `rm "app/(app)/orszagprofil/components/EvValaszto.tsx"`.
- `lib/orszagprofil-szotar.ts`: az `evParam` függvény és docblockja törlődik.
- `db/queries/orszagprofil.ts`: a `listEvek` törölve (Step 1 helyére került a `getUtolsoEv`).
- Run: `grep -rn "evParam\|listEvek\|EvValaszto\|?ev=\|searchParams).ev" app components lib db --include='*.ts' --include='*.tsx'` → üres.

- [ ] **Step 5: Típusellenőrzés és build**

Run: `npx tsc --noEmit` → nincs hiba.
Run: `npm run build` → sikeres. (Ha nem létező `app/...` modulra panaszkodik, `rm .next/dev/types/validator.ts` és újra.)

- [ ] **Step 6: Böngészős ellenőrzés**

Admin:
1. Fejléc 2025: `$B goto http://localhost:3000/orszagprofil/KR` → „Nincs profil" jelvény, „Ehhez az évhez (2025) még nincs országprofil.", Szerkesztés gomb link. `$B goto http://localhost:3000/orszagprofil/JP` → „Az évi profil · 2025", „2025. évi profil · …". `$B goto http://localhost:3000/orszagprofil/JP/szerkesztes` → „Év: 2025", a 2025-ös alapadatok az űrlapban.
2. Fejléc 2023 (nincs profil sehol): `/orszagprofil/JP` → „Nincs profil" (utolsoEv null, mert 2025 > 2023); `/orszagprofil/JP/szerkesztes` → „Év: 2023", üres űrlap. Ne ments.
3. Fejléc 2026: `/orszagprofil/KR` → „Az évi profil · 2026". `/orszagprofil/JP?ev=2025` → a `?ev=` nem hat, 2026-os profil látszik.

Attasé (JP):
4. Fejléc 2025: `/orszagprofil/JP` → a gomb „Szerkesztés (2026)" (form-gomb); kattintás → fejléc 2026, a szerkesztő nyílik „Év: 2026". Fejléc vissza 2025-re, majd kézzel `$B goto http://localhost:3000/orszagprofil/JP/szerkesztes` → 404 (az AppShell-en belüli „Az oldal nem található").
5. `/orszagprofil/KR` attaséként → nincs Szerkesztés gomb.
6. `$B console --errors` → üres. Végül állítsd a fejlécet 2026-ra.

- [ ] **Step 7: CLAUDE.md és README**

`CLAUDE.md`:
- **UI shell** bekezdés: a layout-mondatban az `evek` leírását cseréld: „…és a fejléc ciklusválasztóját (`ev`: a `tet-ev` httpOnly cookie-ból `lib/valasztott-ev.ts` `getValasztottEv(most)`-tal, érvénytelen → aktuális év; `evek`: admin `EV_MIN..aktuális év`, attasé DB profil-évek + aktuális + a választott)." A context-mondat: „Az AppShell context-je (`useApp()`: `user`, `ev`, `olvasatlan`, `setOlvasatlan`) csak a provideren belül használható; az `ev` a szerverről jön (nincs kliens-állapot), a fejléc selectje a `valasztEvAction`-t hívja (`app/(app)/actions.ts`: session, validálás, cookie, `revalidatePath('/', 'layout')`, opcionális `kod`-dal a szerkesztőre irányít), ezért a térkép, a profil és a szerkesztő oldal is ezt az évet mutatja."
- **Országprofil** bekezdés: `listEvek` helyett `getUtolsoEv(kod, ev)`; `listTerkepAdat(ev)` leírása: „országonként a legnagyobb év ≤ `ev` profilja, `allapot` az `ev`-hez viszonyítva"; az `evParam` említése törölve; a Route-ok részben: `/terkep` és `/orszagprofil/[kod]` „a fejléc évét mutatja (cookie), `?ev=` nincs"; a profil oldal `AllapotBadge`-e „a legnagyobb profil-év ≤ nézett év állapota"; a Szerkesztés gomb: „`components/orszagprofil/SzerkesztesGomb`: szerkeszthető év → link, csak az aktuális év szerkeszthető → form-gomb a `valasztEvAction`-nel (cookie az aktuális évre + redirect), felirat „Szerkesztés (2026)"; a szerkesztő: „az év a cookie-ból, `EvValaszto` nincs; jog-hiba 404". Az „Amire figyelni kell" listában a `<Fragment key={ev}>` pont: „search param" helyett „cookie-ból jövő év". Az `ALLAPOT_CIMKE.friss` = „Az évi profil".
- `README.md` 63. sor: „ciklusválasztó (a választott év `tet-ev` cookie-ban, a térkép és az országprofil is ezt mutatja)".

- [ ] **Step 8: Commit**

```bash
git add db/queries/orszagprofil.ts "app/(app)/orszagprofil/[kod]/page.tsx" "app/(app)/orszagprofil/[kod]/szerkesztes/page.tsx" lib/orszagprofil-szotar.ts CLAUDE.md README.md
git rm -q "app/(app)/orszagprofil/components/EvValaszto.tsx"
git commit -m "feat(orszagprofil): a profil és a szerkesztő a választott év nézetében, EvValaszto és ?ev= megszűnik, docs

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```
