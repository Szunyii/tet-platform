# Login, session és admin felhasználó-kezelés – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Valódi bejelentkezés (email + jelszó), session-alapú route-védelem, a `user` táblán `orszag` mező, és egy admin felhasználó-kezelő oldal (`/felhasznalok`) a Better Auth admin plugin API-jára építve.

**Architecture:** A `lib/session.ts` három szerver-oldali helpert ad (`getSession`, `requireSession`, `requireAdmin`), ezekre épül minden page és action. A `proxy.ts` csak a session cookie meglétét nézi és `/login`-ra irányít; a bíró mindig a `requireSession()`. Az `app/(app)/layout.tsx` route-group layout `requireSession()`-nel kényszeríti ki a bejelentkezést minden védett oldalra, és az `AppShell`-nek propként adja a usert; a `/login` a gyökér layout alatt marad. Az admin felhasználó-kezelő server action-ökön át hívja a Better Auth admin API-t (`auth.api.createUser` stb.) a kérés fejléceivel, így a plugin jogosultság-ellenőrzése is lefut.

**Tech Stack:** Next.js 16 (App Router, `proxy.ts`, Server Actions, `useActionState`), React 19, TypeScript 7, better-auth 1.7 (admin plugin, `better-auth/cookies`, `better-auth/api`), drizzle-orm 0.45 + better-sqlite3, shadcn/ui v4 (Base UI), Tailwind v4, lucide-react, sonner.

**Spec:** `docs/superpowers/specs/2026-09-07-login-felhasznalok-design.md`

**Ellenőrzés:** Nincs tesztkeretrendszer a projektben, és nem vezetünk be. Minden task végén `npx tsc --noEmit`, és ahol értelme van, `npm run build`, curl vagy manuális böngészős ellenőrzés. A `lib/felhasznalo-validacio.ts` tiszta függvény, ezt egy eldobható `tsx` scripttel ellenőrizzük (Task 7).

**Fontos API tények (ellenőrizve a node_modules-ban):**
- `auth.api.getSession({ headers })` → `{ session, user } | null`. A `user`-en `role: string | null`, `banned`, és az `additionalFields`-ből `orszag`.
- Admin plugin végpontok és body-k: `createUser({ body: { email, password, name, role?, data? } })`, `adminUpdateUser({ body: { userId, data } })`, `setRole({ body: { userId, role } })`, `setUserPassword({ body: { userId, newPassword } })`, `banUser({ body: { userId, banReason?, banExpiresIn? } })`, `unbanUser({ body: { userId } })`, `removeUser({ body: { userId } })`. Mindnek `headers` kell a szerver-oldali híváshoz.
- Hibák: `APIError` (`better-auth/api`), mezők: `status`, `body?.code`, `body?.message`. Admin hibakódok: `USER_ALREADY_EXISTS`, `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL`, `YOU_CANNOT_BAN_YOURSELF`, `YOU_CANNOT_REMOVE_YOURSELF`, `BANNED_USER`. Sign-in hiba: `INVALID_EMAIL_OR_PASSWORD` (401).
- `getSessionCookie(request)` a `better-auth/cookies`-ból: `Request | Headers` → `string | null`.
- Kliens: `signIn.email({ email, password })` → `{ data, error }`; `error` mezői: `code`, `message`, `status`. `signOut()`.
- `user.additionalFields` konfig: `{ orszag: { type: 'string', required: false, input: true } }`. Utána `npm run auth:generate` újraírja a `db/schema/auth.ts`-t.
- Next 16: a `middleware.ts` helyett `proxy.ts` (`export function proxy(request: NextRequest)`, `export const config = { matcher }`). `headers()`, `params`, `searchParams` mind `Promise`.
- shadcn v4 Base UI-ra épül: `Dialog` `open`/`onOpenChange`; `Select` `value`/`onValueChange`/`name`/`items`; `SelectValue` `placeholder`. A `DialogContent` zárva unmountol, ezért az `useActionState`-et használó form belül lehet.

---

## Fájlstruktúra

| Fájl | Művelet | Felelősség |
| --- | --- | --- |
| `lib/auth.ts` | módosít | `user.additionalFields.orszag` |
| `db/schema/auth.ts` | regenerált | `user.orszag` oszlop |
| `drizzle/0001_*.sql` | generált | migráció |
| `lib/session.ts` | létrehoz | `AppSession`, `getSession`, `requireSession`, `requireAdmin` |
| `proxy.ts` | létrehoz | cookie-alapú átirányítás |
| `app/login/page.tsx` | létrehoz | login oldal (AppShell nélkül), `next` paraméter |
| `app/login/components/LoginForm.tsx` | létrehoz | kliens űrlap, `signIn.email` |
| `app/layout.tsx` | módosít | gyökér layout: html/head/body, `Toaster`; AppShell nélkül |
| `app/(app)/layout.tsx` | létrehoz | védett terület: `requireSession()` + `AppShell user={session}` |
| `app/(app)/{terkep,riportok,uj-riport,kommunikacio,tudastar,monitoring}/` | `git mv` | a meglévő oldalak a route groupba (URL nem változik) |
| `components/AppShell.tsx` | módosít | `user` prop, dummy szerep-kapcsoló ki, kijelentkezés, admin menü |
| `components/ui/alert-dialog.tsx`, `components/ui/sonner.tsx` | shadcn CLI | megerősítő dialógus, toast |
| `components/NotFoundContent.tsx`, `app/not-found.tsx`, `app/(app)/not-found.tsx` | létrehoz | magyar 404: a `(app)` alatti az AppShellben (a `requireAdmin()` ide fut ki), a gyökér az ismeretlen URL-eknek |
| `lib/felhasznalo-validacio.ts` | létrehoz | tiszta validátor az admin űrlapokhoz |
| `db/queries/felhasznalo.ts` | létrehoz | `listFelhasznalok()` |
| `app/(app)/felhasznalok/actions.ts` | létrehoz | server action-ök a Better Auth admin API-ra |
| `app/(app)/felhasznalok/page.tsx` | létrehoz | `requireAdmin`, lista |
| `lib/datum.ts` | létrehoz | `formatDatum()` fix időzónával |
| `app/(app)/felhasznalok/components/useMuveletForm.ts` | létrehoz | `useActionState` + siker-toast + zárás egy helyen |
| `app/(app)/felhasznalok/components/MezoHiba.tsx` | létrehoz | mezőhiba szöveg |
| `app/(app)/felhasznalok/components/SzerepkorSelect.tsx` | létrehoz | szerepkör választó (shadcn Select, `name`) |
| `app/(app)/felhasznalok/components/UjFelhasznaloDialog.tsx` | létrehoz | létrehozás |
| `app/(app)/felhasznalok/components/SzerkesztesDialog.tsx` | létrehoz | név, ország, szerepkör |
| `app/(app)/felhasznalok/components/JelszoDialog.tsx` | létrehoz | jelszó-visszaállítás |
| `app/(app)/felhasznalok/components/FelhasznaloMuveletek.tsx` | létrehoz | sor-menü + tiltás/feloldás/törlés `AlertDialog` |
| `app/(app)/felhasznalok/components/FelhasznaloTabla.tsx` | létrehoz | táblázat |
| `README.md` | módosít | login és felhasználó-kezelés leírása |

---

### Task 0: A függő shadcn-alapozás commitolása

A working tree-ben commitolatlan a shadcn/Tailwind alapozás (`app/globals.css`, `package.json`, `components/ui/`, `components.json`, `lib/utils.ts`, `postcss.config.mjs`, `CLAUDE.md`, `AGENTS.md`). Erre épül minden UI ebben a planben, ezért először ez kerül commitba.

**Files:**
- Modify (commit only): a fenti fájlok

- [ ] **Step 1: Ellenőrzés, hogy a working tree fordul**

Run: `npx tsc --noEmit`
Expected: nincs hiba.

- [ ] **Step 2: Commit**

```bash
git add app/globals.css package.json package-lock.json AGENTS.md CLAUDE.md components.json components/ui lib/utils.ts postcss.config.mjs
git commit -m "chore: shadcn/ui v4 + Tailwind v4 alapozás, CLAUDE.md"
git status --short
```
Expected: `git status --short` üres.

---

### Task 1: `user.orszag` mező a Better Auth konfigban és a sémában

**Files:**
- Modify: `lib/auth.ts`
- Regenerate: `db/schema/auth.ts`
- Generate: `drizzle/0001_*.sql`

- [ ] **Step 1: `additionalFields` a `lib/auth.ts`-ben**

A fájl végleges tartalma (az `additionalFields.orszag` `input: false`-szal és az admin plugin `roles` mapje a review-k után került be; a `roles` nélkül a plugin `'admin' | 'user'` role-típust következtetne, és az `'attase'` nem fordulna le a Task 8 `createUser`/`setRole` hívásaiban):

```ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins';
import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements, userAc } from 'better-auth/plugins/admin/access';
import { db } from '../db';
import * as schema from '../db/schema';

// Szerepkörök a Better Auth admin pluginhoz. A roles map nélkül a plugin 'admin' | 'user'
// típust következtet, és az 'attase' nem fordulna le a createUser/setRole hívásokban.
// admin: teljes felhasználó-kezelés; attase: nincs felhasználó-kezelési jog.
const ac = createAccessControl(defaultStatements);
const roles = { admin: adminAc, attase: userAc };

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'sqlite', schema }),
  emailAndPassword: {
    enabled: true,
    // Belső rendszer: nincs nyilvános regisztráció. Felhasználót seed vagy admin hoz létre.
    disableSignUp: true,
  },
  user: {
    additionalFields: {
      // TéT attasé posztjának országa. Adminnál üres. Csak az admin API írhatja (input: false),
      // a felhasználó saját maga nem módosíthatja az /update-user végponton.
      orszag: { type: 'string', required: false, input: false },
    },
  },
  plugins: [
    admin({
      ac,
      roles,
      defaultRole: 'attase',
      adminRoles: ['admin'],
    }),
    // A nextCookies-nak mindig az utolsó pluginnak kell lennie.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
```

- [ ] **Step 2: Séma regenerálása**

Run: `npm run auth:generate`
Expected: a `db/schema/auth.ts` felülíródik. Ellenőrzés:

Run: `grep -n "orszag" db/schema/auth.ts`
Expected: egy sor a `user` táblában, pl. `orszag: text("orszag"),`.

Ha a generátor a `user` tábla más részét is átírta (pl. sorrend), az rendben van; ha a `banned`/`role` mezők eltűntek, a generálás rossz configgal futott – nézd meg, hogy az `admin()` plugin benne maradt-e.

- [ ] **Step 3: Migráció generálása és alkalmazása**

Run: `npm run db:generate`
Expected: új fájl `drizzle/0001_<név>.sql`, tartalma `ALTER TABLE \`user\` ADD \`orszag\` text;`.

Run: `npm run db:migrate`
Expected: „migrations applied” jellegű kimenet, hiba nélkül.

Run: `npx tsc --noEmit`
Expected: nincs hiba.

- [ ] **Step 4: Commit**

```bash
git add lib/auth.ts db/schema/auth.ts drizzle
git commit -m "feat(auth): user.orszag mező (Better Auth additionalFields + migráció)"
```

---

### Task 2: `lib/session.ts` helperek

**Files:**
- Create: `lib/session.ts`

- [ ] **Step 1: Fájl létrehozása**

```ts
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from './auth';

export type AppRole = 'admin' | 'attase';

export interface AppSession {
  userId: string;
  name: string;
  email: string;
  role: AppRole;
  orszag: string | null;
}

/** Aktuális session a kérés cookie-jából, vagy null. Csak szerver oldalon hívható. */
export async function getSession(): Promise<AppSession | null> {
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result) return null;
  const u = result.user;
  return {
    userId: u.id,
    name: u.name,
    email: u.email,
    // A role hiánya (régi rekord) attasénak számít.
    role: u.role === 'admin' ? 'admin' : 'attase',
    orszag: u.orszag ?? null,
  };
}

/** Page-ek és action-ök bejelentkezés-ellenőrzése. Hiány esetén /login. */
export async function requireSession(): Promise<AppSession> {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

/** Admin-only oldalak. Nem admin → 404, hogy ne áruljuk el az oldal létét. */
export async function requireAdmin(): Promise<AppSession> {
  const session = await requireSession();
  if (session.role !== 'admin') notFound();
  return session;
}
```

- [ ] **Step 2: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: nincs hiba. Ha `u.orszag` ismeretlen mezőként hibázik, a Task 1 `additionalFields` nem került be a `lib/auth.ts`-be.

- [ ] **Step 3: Commit**

```bash
git add lib/session.ts
git commit -m "feat(auth): getSession/requireSession/requireAdmin helperek"
```

---

### Task 3: `proxy.ts` route-védelem

**Files:**
- Create: `proxy.ts` (projektgyökér, a `app/` mellett)

- [ ] **Step 1: Fájl létrehozása**

```ts
import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';

// Gyors szűrő: csak a session cookie meglétét nézi, nem az érvényességét.
// A valódi ellenőrzés a page-ek/action-ök requireSession() hívása.
//
// A /login-t a matcher kizárja, és a proxy szándékosan NEM irányít el onnan cookie
// esetén: egy elavult cookie (tiltott/törölt user, lejárt session) RSC renderben nem
// törölhető, így a "cookie van → /terkep" szabály és a requireSession() /login
// redirectje végtelen hurkot adna. A bejelentkezett user /login-ról való
// elirányítását az app/login/page.tsx végzi a valódi session alapján.
//
// Nem GET kérést (server action POST) átengedünk: a 307 a POST-ot is a login oldalra
// irányítaná, ami hibát ad; az action saját requireSession()-je szabályosan redirectel.
//
// A getSessionCookie() a Better Auth alapértelmezett cookie-nevét keresi
// (better-auth.session_token, HTTPS-en __Secure- prefixszel). Ha a lib/auth.ts
// advanced.cookiePrefix / advanced.cookies beállítást kapna, azt ide is át kell adni,
// különben minden kérés a loginra megy.

// A ?next= hossza korlátozott, hogy a Location fejléc ne nőjön proxy-limit fölé.
const NEXT_MAX_LENGTH = 512;

export function proxy(request: NextRequest) {
  if (request.method !== 'GET') return NextResponse.next();
  if (getSessionCookie(request)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const login = new URL('/login', request.url);
  const next = pathname + search;
  if (next.length <= NEXT_MAX_LENGTH) login.searchParams.set('next', next);
  return NextResponse.redirect(login);
}

export const config = {
  // Minden útvonal, kivéve: /login (és alútjai), /api/auth/*, /_next/*, és a
  // kiterjesztés alapján felismert statikus fájlok (public/, metadata route-ok).
  matcher: [
    '/((?!login(?:/|$)|api/auth(?:/|$)|_next/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|txt|xml|webmanifest)$).*)',
  ],
};
```

- [ ] **Step 2: Ellenőrzés curl-lel**

A dev szerver fusson (`npm run dev`; nézd meg, melyik porton fut; lent 3000-et feltételezünk). Ha már fut, ne indíts másikat. Új `proxy.ts` létrehozását a Turbopack dev szerver futás közben felveszi; ha a curl mégsem mutat átirányítást, a dev szerver újraindítása kell (ezt jelezd, ne csináld a felhasználó folyamatával).

Run: `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/riportok`
Expected: `307 http://localhost:3000/login?next=%2Friportok`

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/login`
Expected: `404` (a login oldal még nincs, de NEM redirect – a matcher kizárja a /login-t).

Run: `curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/auth/sign-in/email -H 'content-type: application/json' -d '{"email":"x@x.hu","password":"rossz"}'`
Expected: `401` (az auth API nem lett átirányítva).

További határesetek (mind `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n"`): `/login/x` → `404`, nincs redirect; `/loginfoo` → `307` a loginra (útvonalhatár); `/api/authx` → `307`; `/tet-world-map.js` → `200`; `/robots.txt` → `404`, nincs redirect (kiterjesztés alapján kizárt); `POST /riportok` `-H 'Next-Action: deadbeef'` → NEM 307 (a POST átmegy, az action `requireSession()`-je dönt); `/riportok?x=<600 karakter>` → `307` a `/login`-ra `next` nélkül.

Run: `npx tsc --noEmit`
Expected: nincs hiba.

- [ ] **Step 3: Commit**

```bash
git add proxy.ts
git commit -m "feat(auth): proxy.ts – session cookie nélkül /login-ra irányít"
```

---

### Task 4: Login oldal, `(app)` route group `requireSession()`-nel, AppShell csak bejelentkezve

**Miért route group:** a meglévő oldalak (`terkep`, `riportok`, `uj-riport`, `kommunikacio`, `tudastar`, `monitoring`) kliens-komponensek, nem hívnak `requireSession()`-t. Ha a gyökér layout csak „session ? AppShell : children" logikával dolgozna, egy elavult cookie-val (a proxy átengedi, a session viszont nincs) ezek az oldalak oldalsáv nélkül, de renderelődnének. Az `app/(app)/layout.tsx` `requireSession()`-je minden védett oldalra egyetlen helyen kényszeríti ki a bejelentkezést, a `/login` pedig a gyökér layout alatt marad. Az URL-ek nem változnak (a route group neve nem része az útvonalnak).

**Files:**
- Create: `app/login/page.tsx`
- Create: `app/login/components/LoginForm.tsx`
- Create: `app/(app)/layout.tsx`
- Move (`git mv`): `app/terkep`, `app/riportok`, `app/uj-riport`, `app/kommunikacio`, `app/tudastar`, `app/monitoring` → `app/(app)/…`; bennük a relatív importok egy szinttel mélyebbek
- Modify: `app/layout.tsx` (gyökér: csak html/head/body, AppShell nélkül)
- Marad a helyén: `app/page.tsx` (`/` → `/terkep` redirect), `app/api/`

- [ ] **Step 1: `app/login/components/LoginForm.tsx`**

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { signIn } from '../../../lib/auth-client';

function hibaSzoveg(error: { code?: string; status?: number }): string {
  if (error.code === 'BANNED_USER') return 'A fiók le van tiltva.';
  if (error.status === 429) return 'Túl sok próbálkozás. Várj néhány másodpercet, majd próbáld újra.';
  // 400 (érvénytelen e-mail formátum) és 401 (rossz e-mail vagy jelszó) egyformán:
  // nem különböztetünk, hogy ne lehessen fiókokat felderíteni.
  if (error.status === 400 || error.status === 401) return 'Hibás e-mail cím vagy jelszó.';
  return 'Bejelentkezés sikertelen, próbáld újra.';
}

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Add meg az e-mail címet és a jelszót.');
      return;
    }
    setError('');
    setPending(true);
    try {
      const res = await signIn.email({ email: trimmedEmail, password });
      if (res.error) {
        setError(hibaSzoveg(res.error));
        setPending(false);
        return;
      }
      // replace: a /login ne maradjon a history-ban (a vissza gomb ne vigyen a loginra).
      // A céloldal RSC-lekérése már az új cookie-val megy, refresh() nem kell.
      router.replace(next);
    } catch {
      // A signIn.email hálózati hibánál dob (nincs válasz), nem { error }-t ad vissza.
      setError('Nem sikerült elérni a szervert. Ellenőrizd a kapcsolatot, és próbáld újra.');
      setPending(false);
    }
  }

  const hasError = Boolean(error);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail cím</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? 'login-hiba' : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Jelszó</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? 'login-hiba' : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && (
        <p id="login-hiba" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="mt-1">
        {pending ? 'Bejelentkezés…' : 'Bejelentkezés'}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: `app/login/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { getSession } from '../../lib/session';
import LoginForm from './components/LoginForm';

export const metadata: Metadata = { title: 'Bejelentkezés' };

const HOME = '/terkep';

// Nyílt átirányítás elleni védelem. A next paramétert a böngészővel azonos URL-parserrel
// értelmezzük, mert a regex kijátszható (pl. "/<TAB>/evil.com" → "//evil.com"): csak akkor
// fogadjuk el, ha a bázis-originre mutat, és nem a /login maga (önhurok). A visszaadott
// útvonal normalizált (vezérlőkarakterek nélkül), így a Location fejlécbe is biztonságos.
function safeNext(raw: string | string[] | undefined): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v) return HOME;
  let u: URL;
  try {
    u = new URL(v, 'http://n.invalid');
  } catch {
    return HOME;
  }
  if (u.origin !== 'http://n.invalid') return HOME;
  const path = u.pathname + u.search;
  if (path === '/login' || path.startsWith('/login/') || path.startsWith('/login?')) return HOME;
  return path;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const next = safeNext((await searchParams).next);
  // Érvényes sessionnel nincs mit keresni itt. Ezt a valódi session dönti el, nem a
  // cookie megléte (lásd proxy.ts kommentjét az elavult cookie-hurokról).
  if (await getSession()) redirect(next);
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            <h1 className="text-base font-medium">NIÜ · TéT Platform</h1>
          </CardTitle>
          <CardDescription>Bejelentkezés a belső munkakörnyezetbe</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm next={next} />
        </CardContent>
      </Card>
    </main>
  );
}
```

- [ ] **Step 3: Gyökér `app/layout.tsx` – AppShell nélkül**

Cseréld a fájl teljes tartalmát erre (a `description` már nem „dummy demó"):

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'NIÜ · TéT Platform', template: '%s · NIÜ · TéT Platform' },
  description: 'TéT attasé hálózat belső munkakörnyezet',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: `app/(app)/layout.tsx` – védett terület**

Az `AppShell` most még nem fogad `user` propot; Task 5 adja hozzá. Ebben a lépésben `user` nélkül hívjuk, Task 5-ben `user={session}` lesz.

```tsx
import AppShell from '../../components/AppShell';
import { requireSession } from '../../lib/session';

// Minden védett oldal ebben a route groupban van. A requireSession() itt egy helyen
// kényszeríti ki a bejelentkezést (elavult cookie esetén is: a proxy átengedi, ez
// viszont /login-ra irányít). A /login a gyökér layout alatt marad.
//
// Ez NEM helyettesíti az oldalankénti és action-önkénti ellenőrzést: kliens-oldali
// navigációnál a layout nem fut újra, a server action-ök pedig egyáltalán nem
// renderelnek layoutot. Minden szerver-oldali adatot olvasó page és minden action
// maga hívja a requireSession()/requireAdmin()-t.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return <AppShell>{children}</AppShell>;
}
```

- [ ] **Step 5: A meglévő oldalak átköltöztetése a route groupba**

```bash
mkdir -p "app/(app)"
for d in terkep riportok uj-riport kommunikacio tudastar monitoring; do git mv "app/$d" "app/(app)/$d"; done
ls "app/(app)"
```
Expected: a hat mappa a `app/(app)/` alatt, mindegyikben a `page.tsx`.

A hat `page.tsx`-ben minden `'../../` kezdetű relatív import egy szinttel mélyebb lesz (`'../../../`). Pontosan ezek az importok érintettek (más `'../../` nincs bennük):

```bash
grep -rln "from '\.\./\.\./" "app/(app)" | xargs sed -i '' "s#from '\.\./\.\./#from '../../../#g"
grep -rn "from '\.\./" "app/(app)"
```
Expected: minden találat `'../../../components/…'`, `'../../../lib/…'` alakú (2–3 import fájlonként, összesen 15). Az `app/page.tsx` (`/` → `/terkep` redirect) és az `app/api/` a helyén marad.

Run: `npx tsc --noEmit`
Expected: nincs hiba. Ha egy import nem oldódik fel, az adott fájlban a sed-et kézzel ellenőrizd.

- [ ] **Step 6: Ellenőrzés**

A dev szerver fut a 3000-en (ne indíts másikat). A böngészős lépések curl-lel is elvégezhetők; mindkettő leírva. Az admin adatai a `.env.local`-ban (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`); a jelszót ne írd ki a reportba.

curl (`C=/private/tmp/claude-501/tet-cookie.txt`):
1. `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/riportok` → `307 http://localhost:3000/login?next=%2Friportok`
2. `curl -s http://localhost:3000/login | grep -c "Bejelentkezés"` → legalább `1`; és `curl -s http://localhost:3000/login | grep -c "Aktív ciklus"` → `0` (nincs oldalsáv).
3. Belépés: `curl -s -c $C -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/auth/sign-in/email -H 'content-type: application/json' -d '{"email":"<SEED_ADMIN_EMAIL>","password":"<SEED_ADMIN_PASSWORD>"}'` → `200`. Rossz jelszóval → `401`.
4. `curl -s -b $C http://localhost:3000/riportok | grep -c "Aktív ciklus"` → legalább `1` (oldalsáv van, az oldal renderelődött).
5. `curl -s -b $C -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/login` → `307 http://localhost:3000/terkep`; `…/login?next=%2Friportok` → `307 …/riportok`; `…/login?next=//evil.example` → `307 …/terkep`; `…/login?next=/login` → `307 …/terkep`.
6. `curl -s -b $C -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/` → `307 …/terkep` (a gyökér redirect működik).
7. Elavult cookie: `node -e "const D=require('better-sqlite3');new D('data/tet.db').prepare('DELETE FROM session').run()"`, majd `curl -s -b $C -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/terkep` → `307 http://localhost:3000/login` (a proxy átengedte, a `(app)` layout `requireSession()`-je irányított); `curl -s -b $C -o /dev/null -w "%{http_code}\n" http://localhost:3000/login` → `200` (nincs hurok). Ezután a 3. lépés belépése újra `200`.

Böngésző (ha van rá mód, pl. `browse` skill; egyébként a curl elég): rossz jelszóval a form alatt „Hibás e-mail cím vagy jelszó."; jó jelszóval a `/riportok`-ra kerül oldalsávval.

Run: `npx tsc --noEmit` → nincs hiba.

- [ ] **Step 7: Commit**

```bash
git add app/login "app/(app)" app/layout.tsx
git status --short   # a hat mappa "R" (rename) státusszal, plusz az új fájlok
git commit -m "feat(auth): login oldal, (app) route group requireSession()-nel, AppShell csak bejelentkezve"
```

---

### Task 5: AppShell a valódi sessionre

**Files:**
- Modify: `components/AppShell.tsx`
- Create: `app/(app)/actions.ts` (`logoutAction`)
- Modify: `app/(app)/layout.tsx` (a `user` és `logoutAction` prop átadása)

- [ ] **Step 1: `AppShell.tsx` átírása**

Cseréld a fájl teljes tartalmát. Változások: `user` és `logoutAction` prop, `setRole`/`role` és a dummy kapcsoló megszűnik, `POSTS`/`ME_ID` import kikerül, a context `null` alapértékű és a `useApp()` a provideren kívül hibát dob, kijelentkezés `<form action={logoutAction}>`-nel (`useActionState`, pending állapot, hibaüzenet), admin-only menüpont (csak megjelenítés, komment jelzi), `isActive`/`titleFor` prefix-egyezéssel, `aria-current`.

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useActionState, useContext, useState, type ReactNode } from 'react';
import type { LogoutState } from '../app/(app)/actions';
import { CYCLES, DEADLINE, DEFAULT_CYCLE, TICKETS } from '../lib/data';
import { ini } from '../lib/score';
import type { AppSession } from '../lib/session';

type LogoutAction = (prev: LogoutState) => Promise<LogoutState>;

interface AppState {
  user: AppSession;
  cycle: string;
  setCycle: (c: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp() csak az AppShell-en belül használható.');
  return ctx;
}

// Csak megjelenítés: az adminOnly a menüpontot rejti el, a valódi védelem a page/action
// requireAdmin() hívása (lib/session.ts).
const NAV: { href: string; icon: string; label: string; adminOnly?: boolean }[] = [
  { href: '/terkep', icon: '◍', label: 'Országprofil' },
  { href: '/riportok', icon: '▦', label: 'Riportok' },
  { href: '/uj-riport', icon: '✎', label: 'Új riport kitöltése' },
  { href: '/kommunikacio', icon: '✉', label: 'Kommunikáció' },
  { href: '/tudastar', icon: '◫', label: 'Tudástár' },
  { href: '/monitoring', icon: '◈', label: 'Monitoring és értékelés' },
  { href: '/felhasznalok', icon: '☺', label: 'Felhasználók', adminOnly: true },
];

const TITLES: Record<string, [string, string]> = {
  '/terkep': ['Országprofil', 'A TéT attaséktól beérkező országjelentések térképen és teljes tartalommal'],
  '/riportok': ['Riportok', 'Kimutatás a beérkező országjelentésekből, és a 7 blokkos riportok teljes listája'],
  '/uj-riport': ['Új riport kitöltése', 'Kötött mezők az aggregáláshoz, szöveges kifejtés a részletekhez'],
  '/kommunikacio': ['Kommunikáció', 'Ticket + üzenetszál az adminok és a TéT attasék között'],
  '/tudastar': ['Tudástár', 'Magyarországról ajánlható programok, partnerek és együttműködési formák'],
  '/monitoring': ['Monitoring és értékelés', '3 kategória, 14 szempont, rögzített adatforrás-metaadatokkal'],
  '/felhasznalok': ['Felhasználók', 'Admin és TéT attasé fiókok kezelése'],
};

// Pontos egyezés vagy alútvonal (pl. /riportok/abc → /riportok).
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/');
}

// Pontos egyezés, különben a leghosszabb illeszkedő prefix.
function titleFor(pathname: string): [string, string] {
  if (TITLES[pathname]) return TITLES[pathname];
  const key = Object.keys(TITLES)
    .filter((k) => isActive(pathname, k))
    .sort((a, b) => b.length - a.length)[0];
  return key ? TITLES[key] : ['TéT Platform', ''];
}

function LogoutForm({ action }: { action: LogoutAction }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {state.error && (
        <span role="alert" style={{ fontSize: 11, color: '#b3261e' }}>{state.error}</span>
      )}
      <button type="submit" className="btn" style={{ fontSize: 11.5 }} disabled={pending}>
        {pending ? 'Kijelentkezés…' : 'Kijelentkezés'}
      </button>
    </form>
  );
}

export default function AppShell({
  user,
  logoutAction,
  children,
}: {
  user: AppSession;
  logoutAction: LogoutAction;
  children: ReactNode;
}) {
  const [cycle, setCycle] = useState(DEFAULT_CYCLE);
  const pathname = usePathname();
  const [title, sub] = titleFor(pathname);
  const openTickets = TICKETS.filter((t) => t.statusz !== 'Lezárt').length;
  const roleLabel = user.role === 'admin'
    ? 'NIÜ admin'
    : `TéT attasé${user.orszag ? ' · ' + user.orszag : ''}`;

  return (
    <AppContext.Provider value={{ user, cycle, setCycle }}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{
          width: 238, flex: '0 0 238px', background: '#131a24', color: '#e7ebf1',
          display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh',
        }}>
          <div style={{ padding: '18px 18px 16px', borderBottom: '1px solid #232c39' }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: '.02em' }}>NIÜ · TéT Platform</div>
            <div style={{ fontSize: 11, color: '#8d97a5', marginTop: 3 }}>Belső munkakörnyezet</div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 10px' }}>
            {NAV.filter((n) => !n.adminOnly || user.role === 'admin').map((n) => {
              const on = isActive(pathname, n.href);
              return (
                <Link key={n.href} href={n.href} aria-current={on ? 'page' : undefined} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px',
                  borderRadius: 5, fontSize: 12.5, fontWeight: 500, textDecoration: 'none',
                  background: on ? '#22304a' : 'transparent', color: on ? '#ffffff' : '#a3adbb',
                }}>
                  <span style={{ width: 16, textAlign: 'center', fontSize: 13 }}>{n.icon}</span>
                  {n.label}
                  {n.href === '/kommunikacio' && (
                    <span style={{
                      marginLeft: 'auto', background: '#b3261e', color: '#fff', fontSize: 10,
                      fontWeight: 600, padding: '1px 6px', borderRadius: 9,
                    }}>{openTickets}</span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div style={{
            marginTop: 'auto', padding: '14px 18px', borderTop: '1px solid #232c39',
            fontSize: 11, color: '#8d97a5', lineHeight: 1.6,
          }}>
            <div style={{ color: '#c3cbd6', fontWeight: 600, fontSize: 11.5 }}>Aktív ciklus: {cycle}</div>
            <div>Beadási határidő: {DEADLINE}</div>
            <div style={{ marginTop: 8, padding: '6px 8px', background: '#1b2330', borderRadius: 4, color: '#7f8a99' }}>
              Demóadatok – 14 poszt, 14 értékelési szempont
            </div>
          </div>
        </aside>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <header style={{
            background: '#fff', borderBottom: '1px solid #dde1e7', padding: '13px 26px',
            display: 'flex', alignItems: 'center', gap: 20, position: 'sticky', top: 0, zIndex: 20,
          }}>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: '-.01em' }}>{title}</h1>
              <div style={{ fontSize: 11.5, color: '#6b7684', marginTop: 2 }}>{sub}</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: '#6b7684' }}>
                Ciklus
                <select className="input" value={cycle} onChange={(e) => setCycle(e.target.value)}>
                  {CYCLES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 14, borderLeft: '1px solid #dde1e7' }}>
                <div style={{
                  width: 29, height: 29, borderRadius: '50%', background: '#1b3a6b', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600,
                }}>{ini(user.name)}</div>
                <div style={{ lineHeight: 1.25 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: 10.5, color: '#6b7684' }}>{roleLabel}</div>
                </div>
              </div>
              <LogoutForm action={logoutAction} />
            </div>
          </header>
          <main style={{ flex: 1, minWidth: 0, padding: '20px 26px 44px' }}>{children}</main>
        </div>
      </div>
    </AppContext.Provider>
  );
}
```

Megjegyzés: a `.btn` a meglévő globális osztály (`app/globals.css`). A régi fejléc inline-style világát nem írjuk át ebben a lépésben (CLAUDE.md: csak az érintett részt), a kijelentkezés gomb ehhez illeszkedik.

- [ ] **Step 2: `app/(app)/actions.ts` – kijelentkezés server action**

Miért server action: a kliens `signOut()` hálózati hibánál dob és nem-2xx-nél `{ error }`-t ad, amit könnyű elnyelni; a `router.refresh()` pedig csak az aktuális route cache-ét üríti, így a vissza gomb az előző session oldalait mutatná. Server actionben a `nextCookies` plugin törli a cookie-t, a `revalidatePath('/', 'layout')` a teljes kliens-cache-t üríti.

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '../../lib/auth';

export interface LogoutState {
  error?: string;
}

// Kijelentkezés server actionként (CLAUDE.md: mutáció → actions.ts). A nextCookies plugin
// itt tudja törölni a session cookie-t; a revalidatePath('/', 'layout') a teljes
// kliens-oldali router cache-t üríti, így a vissza gomb sem mutatja a korábbi session
// oldalait. A signOut session nélkül is sikeres, csak valódi hibánál (pl. DB) dob.
export async function logoutAction(_prev: LogoutState): Promise<LogoutState> {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (err) {
    console.error('[auth] kijelentkezés sikertelen:', err);
    return { error: 'Nem sikerült kijelentkezni. Próbáld újra.' };
  }
  revalidatePath('/', 'layout');
  redirect('/login');
}
```

- [ ] **Step 2b: `app/(app)/layout.tsx` – `user` és `logoutAction` prop átadása**

Import hozzáadása: `import { logoutAction } from './actions';` A törzs:

```tsx
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return <AppShell user={session} logoutAction={logoutAction}>{children}</AppShell>;
}
```

- [ ] **Step 3: Típusellenőrzés és a `setRole` hivatkozások**

Run: `npx tsc --noEmit`
Expected: nincs hiba. (A `useApp()` hívók – `app/(app)/riportok/page.tsx`, `app/(app)/uj-riport/page.tsx`, `app/(app)/monitoring/page.tsx` – csak a `cycle`-t használják, ezek változatlanul fordulnak.)

Run: `grep -rn "setRole\|EMPTY_USER\|signOut" app components`
Expected: csak az `app/(app)/actions.ts` `auth.api.signOut` sora.

- [ ] **Step 4: Ellenőrzés**

curl (belépés a Task 4 Step 6/3 szerint, `C=/private/tmp/claude-501/tet-cookie.txt`): `curl -s -b $C http://localhost:3000/terkep` kimenetében szerepel a seed admin neve, az „NIÜ admin" felirat, a „Felhasználók" menüpont és a „Kijelentkezés" gomb; nem szerepel az „Admin (NIÜ)" / „TéT attasé" dummy kapcsoló. `curl -s -b $C -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/auth/sign-out -H 'Origin: http://localhost:3000' -H 'content-type: application/json' -d '{}'` → `200` (a Better Auth cookie-s POST-hoz Origin fejléc és JSON body kell), utána `curl -s -b $C -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/terkep` → `307 …/login` (a cookie még ott van, de a session törölve: a `(app)` layout irányít).

Böngésző (a gstack `browse` binárissal: `~/.claude/skills/gstack/browse/dist/browse goto/fill/click/url/back`): bejelentkezve az adminnal a fejlécben a seed admin neve és „NIÜ admin” látszik, a „Felhasználók” menüpont megjelenik (még 404-et ad, az oldal Task 9-ben jön). „Kijelentkezés” kattintás → `/login`; vissza gomb → nem jelenik meg védett tartalom (`/login?next=…`); `/terkep` kérése újra `/login`-ra visz.

- [ ] **Step 5: Commit**

```bash
git add components/AppShell.tsx "app/(app)/layout.tsx" "app/(app)/actions.ts"
git commit -m "feat(auth): AppShell valódi sessionből, kijelentkezés server actionnel, admin menüpont"
```

---

### Task 6: shadcn `alert-dialog` és `sonner`, Toaster a layoutban, magyar 404 oldal

**Files:**
- Create (CLI): `components/ui/alert-dialog.tsx`, `components/ui/sonner.tsx`
- Create: `components/NotFoundContent.tsx`, `app/not-found.tsx`, `app/(app)/not-found.tsx`
- Modify: `app/layout.tsx`, `package.json`

- [ ] **Step 1: Komponensek hozzáadása**

Run: `npx shadcn@latest add alert-dialog sonner`
Expected: a két fájl létrejön a `components/ui/` alatt, a `sonner` (és esetleg `next-themes`) csomag a `package.json`-ba kerül.

Run: `grep -n "^export" components/ui/alert-dialog.tsx components/ui/sonner.tsx`
Expected: `alert-dialog.tsx` exportálja legalább: `AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel`; a `sonner.tsx` a `Toaster`-t.

Ha a `sonner.tsx` `next-themes`-t importál és az nem települt: `npm install next-themes`.

- [ ] **Step 2: `Toaster` a gyökér `app/layout.tsx`-ben**

Import hozzáadása:

```tsx
import { Toaster } from '../components/ui/sonner';
```

A `<body>`:

```tsx
      <body>
        {children}
        <Toaster position="bottom-right" />
      </body>
```

- [ ] **Step 3: Magyar 404 – közös tartalom, két helyen**

A `notFound()` a legközelebbi `not-found.tsx`-et rendereli, a saját szegmensének layoutjában. Ezért két fájl kell: `app/(app)/not-found.tsx` a `requireAdmin()` 404-éhez (az AppShellben, oldalsávval), és a gyökér `app/not-found.tsx` az ismeretlen URL-ekhez (AppShell nélkül, önálló oldal). A tartalom közös.

`components/NotFoundContent.tsx`:

```tsx
import Link from 'next/link';
import { HOME_ROUTE } from '../lib/routes';
import { cn } from '../lib/utils';
import { buttonVariants } from './ui/button';

// A gyökér 404-en ez az egyetlen címsor (h1), az AppShellen belül az h1 a fejléc, ezért h2.
export function NotFoundContent({ heading = 'h2' }: { heading?: 'h1' | 'h2' }) {
  const Heading = heading;
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <Heading className="text-lg font-semibold">Az oldal nem található</Heading>
      <p className="max-w-sm text-sm text-muted-foreground">
        A keresett oldal nem létezik, vagy nincs hozzá jogosultságod.
      </p>
      {/* Link + buttonVariants, nem <Button render={<Link/>}>: a Base UI Button natív
          <button>-t vár, <a>-val hibát logol és type="button"-t tesz a linkre. */}
      <Link
        href={HOME_ROUTE}
        // !text… és !no-underline: a régi globális `a { color }` / `a:hover` szabály
        // (globals.css) rétegen kívüli, ezért csak az important utility nyer felette.
        className={cn(buttonVariants(), '!text-primary-foreground hover:!no-underline')}
      >
        Vissza az Országprofilra
      </Link>
    </div>
  );
}
```

`app/(app)/not-found.tsx`:

```tsx
import { NotFoundContent } from '../../components/NotFoundContent';

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <NotFoundContent />
    </div>
  );
}
```

`app/not-found.tsx`:

```tsx
import { NotFoundContent } from '../components/NotFoundContent';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <NotFoundContent heading="h1" />
    </main>
  );
}
```

- [ ] **Step 3b: Review utáni kiegészítések (a fájlok végleges tartalma a repóban)**

- `components/ui/sonner.tsx`: `theme="light"` fixen (nincs ThemeProvider, az app light-only; a `system` téma sötét OS-en olvashatatlan toastot adna), `fontFamily: 'var(--font-sans)'` az inline `style`-ban (a sonner rétegen kívüli CSS-e felülírja a Tailwind utility-t), a `next-themes` függőség eltávolítva (`npm uninstall next-themes`).
- `lib/routes.ts`: `HOME_ROUTE = '/terkep'`, `LOGIN_ROUTE = '/login'`; ezt használja az `app/page.tsx`, `app/login/page.tsx`, `app/(app)/actions.ts`, `lib/session.ts`. A `proxy.ts` és az AppShell `NAV` szándékosan nem.
- `components/AppShell.tsx`: `titleFor(pathname, role)` admin-only útvonalnál nem admin usernek a generikus címet adja, hogy a `requireAdmin()` 404-e az AppShellben ne árulja el az oldal létét a fejlécben.
- A 404 gomb-link: `<Link className={cn(buttonVariants(), '!text-primary-foreground hover:!no-underline')}>`, mert a régi globális `a { color }` szabály rétegen kívüli.

- [ ] **Step 4: Ellenőrzés és commit**

Run: `npx tsc --noEmit` → nincs hiba.

`curl -s -b $C -o /dev/null -w "%{http_code}\n" http://localhost:3000/nincs-ilyen` → `404`, és a body tartalmazza az „Az oldal nem található” szöveget, de NEM tartalmazza az „Aktív ciklus”-t (gyökér 404, AppShell nélkül). A `(app)` alatti 404-et a Task 9 ellenőrzi (attasé a `/felhasznalok`-on → 404 oldalsávval).

```bash
git add components/ui/alert-dialog.tsx components/ui/sonner.tsx components/NotFoundContent.tsx app/not-found.tsx "app/(app)/not-found.tsx" app/layout.tsx package.json package-lock.json
git commit -m "chore(ui): shadcn alert-dialog és sonner, Toaster a layoutban, magyar 404 oldalak"
```

---

### Task 7: Validátor és lekérdezés a felhasználó-kezeléshez

**Files:**
- Create: `lib/felhasznalo-validacio.ts`
- Create: `db/queries/felhasznalo.ts`

- [ ] **Step 1: `lib/felhasznalo-validacio.ts`**

```ts
/**
 * Tiszta validátorok az admin felhasználó-kezelő űrlapjaihoz (FormData → típusos input).
 * Nincs React, nincs DB. Minden hibát egy menetben gyűjtünk (egy üres űrlap az összes
 * mezőhibát visszaadja). A MezoHibak kulcsai a mezőnevek; a `form` kulcs a nem mezőhöz
 * kötött hibáké (a server action-ök használják). Az e-mail trim + kisbetű (a Better Auth
 * is kisbetűsít); a jelszót szándékosan nem trimmeljük.
 */

export const SZEREPKOROK = ['admin', 'attase'] as const;
export type Szerepkor = (typeof SZEREPKOROK)[number];

export const SZEREPKOR_CIMKE: Record<Szerepkor, string> = {
  admin: 'Admin (NIÜ)',
  attase: 'TéT attasé',
};

/** Mezőnév → hibaüzenet. A `form` kulcs az űrlap-szintű hibáé. */
export type MezoHibak = Record<string, string>;

export interface UjFelhasznaloInput {
  nev: string;
  email: string;
  jelszo: string;
  szerepkor: Szerepkor;
  orszag: string | null;
}

export interface SzerkesztesInput {
  nev: string;
  szerepkor: Szerepkor;
  orszag: string | null;
}

export type ParseResult<T> = { ok: true; data: T } | { ok: false; errors: MezoHibak };

// Közel a Better Auth (zod) e-mail szabályához: nincs vezető/záró/dupla pont a helyi
// részben, a domain végén legalább 2 betűs TLD. Ami itt átmegy, de a Better Auth elutasít
// (pl. ékezetes cím), azt a server action INVALID_EMAIL hibaként az email mezőre teszi.
const EMAIL_RE = /^(?!.*\.\.)[^\s@.](?:[^\s@]*[^\s@.])?@[^\s@]+\.[A-Za-z]{2,}$/;

// Zéró szélességű karakterek (ZWSP, ZWNJ, ZWJ, BOM): a trim() nem szedi le, de láthatatlanok.
const LATHATATLAN_RE = /[\u200B-\u200D\uFEFF]/g;

/** Trimmelt szöveges mező; hiányzó vagy fájl érték → üres string. */
function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v.replace(LATHATATLAN_RE, '').trim() : '';
}

/** Nyers érték trim nélkül: a jelszóban a szóköz is értékes karakter. */
function raw(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v : '';
}

function validNev(nev: string, errors: MezoHibak) {
  if (!nev) errors.nev = 'A név kötelező.';
  else if (nev.length > 100) errors.nev = 'A név legfeljebb 100 karakter.';
}

function validJelszo(jelszo: string, errors: MezoHibak) {
  if (jelszo.length < 8) errors.jelszo = 'A jelszó legalább 8 karakter.';
  else if (jelszo.length > 128) errors.jelszo = 'A jelszó legfeljebb 128 karakter.';
}

function validSzerepkor(raw: string, errors: MezoHibak): Szerepkor | null {
  if ((SZEREPKOROK as readonly string[]).includes(raw)) return raw as Szerepkor;
  errors.szerepkor = 'Válassz szerepkört.';
  return null;
}

/** Attasénál kötelező; adminnál (és érvénytelen szerepkörnél) eldobjuk, hiba nélkül. */
function validOrszag(raw: string, szerepkor: Szerepkor | null, errors: MezoHibak): string | null {
  if (szerepkor !== 'attase') return null;
  if (!raw) {
    errors.orszag = 'TéT attasénál az ország kötelező.';
    return null;
  }
  if (raw.length > 100) {
    errors.orszag = 'Az ország legfeljebb 100 karakter.';
    return null;
  }
  return raw;
}

export function parseUjFelhasznalo(fd: FormData): ParseResult<UjFelhasznaloInput> {
  const errors: MezoHibak = {};
  const nev = str(fd, 'nev');
  const email = str(fd, 'email').toLowerCase();
  const jelszo = raw(fd, 'jelszo');
  validNev(nev, errors);
  if (!email) errors.email = 'Az e-mail cím kötelező.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Érvénytelen e-mail cím.';
  validJelszo(jelszo, errors);
  const szerepkor = validSzerepkor(str(fd, 'szerepkor'), errors);
  const orszag = validOrszag(str(fd, 'orszag'), szerepkor, errors);
  if (Object.keys(errors).length > 0 || !szerepkor) return { ok: false, errors };
  return { ok: true, data: { nev, email, jelszo, szerepkor, orszag } };
}

export function parseSzerkesztes(fd: FormData): ParseResult<SzerkesztesInput> {
  const errors: MezoHibak = {};
  const nev = str(fd, 'nev');
  validNev(nev, errors);
  const szerepkor = validSzerepkor(str(fd, 'szerepkor'), errors);
  const orszag = validOrszag(str(fd, 'orszag'), szerepkor, errors);
  if (Object.keys(errors).length > 0 || !szerepkor) return { ok: false, errors };
  return { ok: true, data: { nev, szerepkor, orszag } };
}

export function parseJelszo(fd: FormData): ParseResult<{ jelszo: string }> {
  const errors: MezoHibak = {};
  const jelszo = raw(fd, 'jelszo');
  validJelszo(jelszo, errors);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { jelszo } };
}
```

- [ ] **Step 2: Gyors ellenőrzés eldobható scripttel**

Hozd létre a `scripts/_check-validacio.ts` fájlt (nem commitoljuk):

```ts
import { parseUjFelhasznalo, parseSzerkesztes, parseJelszo } from '../lib/felhasznalo-validacio';

function fd(o: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
}
function assert(cond: boolean, msg: string) {
  if (!cond) { console.error('FAIL:', msg); process.exit(1); }
  console.log('ok:', msg);
}

let r = parseUjFelhasznalo(fd({ nev: 'Teszt Elek', email: 'Teszt@NIU.hu', jelszo: 'titok123', szerepkor: 'attase', orszag: 'Dél-Korea' }));
assert(r.ok && r.data.email === 'teszt@niu.hu' && r.data.orszag === 'Dél-Korea', 'attasé országgal, email kisbetűs');

r = parseUjFelhasznalo(fd({ nev: 'Teszt Elek', email: 'teszt@niu.hu', jelszo: 'titok123', szerepkor: 'attase', orszag: '' }));
assert(!r.ok && r.errors.orszag !== undefined, 'attasé ország nélkül → orszag hiba');

r = parseUjFelhasznalo(fd({ nev: 'Admin', email: 'a@niu.hu', jelszo: 'titok123', szerepkor: 'admin', orszag: 'Bármi' }));
assert(r.ok && r.data.orszag === null, 'adminnál az ország eldobva');

r = parseUjFelhasznalo(fd({ nev: '', email: 'nem-email', jelszo: 'rövid', szerepkor: 'x', orszag: '' }));
assert(!r.ok && r.errors.nev !== undefined && r.errors.email !== undefined && r.errors.jelszo !== undefined && r.errors.szerepkor !== undefined, 'minden mező hibás');

const s = parseSzerkesztes(fd({ nev: 'Új Név', szerepkor: 'attase', orszag: 'Japán' }));
assert(s.ok && s.data.nev === 'Új Név', 'szerkesztés ok');

const j = parseJelszo(fd({ jelszo: '1234567' }));
assert(!j.ok && j.errors.jelszo !== undefined, 'rövid jelszó hiba');
console.log('Minden ellenőrzés rendben.');
```

Run: `npx tsx scripts/_check-validacio.ts`
Expected: hat `ok:` sor és „Minden ellenőrzés rendben.”

Megjegyzés: a `db/queries/*` modulok `import 'server-only'`-val kezdődnek, ezért egy őket importáló eldobható tsx scriptet így kell futtatni: `NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_x.ts`.

Run: `rm scripts/_check-validacio.ts`

- [ ] **Step 3: `db/queries/felhasznalo.ts`**

```ts
import 'server-only';
import { db } from '../index';
import { user } from '../schema';
import type { Szerepkor } from '../../lib/felhasznalo-validacio';

export interface FelhasznaloSor {
  id: string;
  nev: string;
  email: string;
  szerepkor: Szerepkor;
  orszag: string | null;
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
      // A Better Auth a lejárt banExpires-t nem tekinti tiltásnak.
      tiltott: Boolean(r.banned) && (!r.banExpires || r.banExpires.getTime() > now),
      letrehozva: r.createdAt,
    }))
    .sort((a, b) => a.nev.localeCompare(b.nev, 'hu'));
}
```

- [ ] **Step 4: Típusellenőrzés és commit**

Run: `npx tsc --noEmit` → nincs hiba. (Ha `user.orszag` nem létezik: Task 1 Step 2 nem futott le.)

```bash
git add lib/felhasznalo-validacio.ts db/queries/felhasznalo.ts
git commit -m "feat(felhasznalok): validátor és listázó lekérdezés"
```

---

### Task 8: Server action-ök (`app/(app)/felhasznalok/actions.ts`)

**Files:**
- Create: `app/(app)/felhasznalok/actions.ts`

- [ ] **Step 1: Fájl létrehozása**

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { unstable_rethrow } from 'next/navigation';
import { auth } from '../../../lib/auth';
import {
  parseJelszo,
  parseSzerkesztes,
  parseUjFelhasznalo,
  type MezoHibak,
  type Szerepkor,
} from '../../../lib/felhasznalo-validacio';
import { requireAdmin } from '../../../lib/session';

export interface MuveletState {
  ok?: boolean;
  errors?: MezoHibak;
}

/** A Better Auth `user` rekord általunk írt mezői (createUser / adminUpdateUser `data`). */
interface FelhasznaloAdatok {
  name?: string;
  orszag: string | null;
  role?: Szerepkor;
}

const SAJAT_FIOK_HIBA = 'Saját fiókodon ez a művelet nem végezhető.';

// A Better Auth APIError-nak body.code mezője van; duck-typing, hogy ne függjünk a
// better-call osztálypéldányától (a validációs hiba pl. sima Error, de body.code-dal).
function apiKod(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null && 'body' in err) {
    const body = (err as { body?: { code?: string } }).body;
    return body?.code;
  }
  return undefined;
}

// A teljes layout revalidálása: a lista és az AppShell fejléce is frissül (pl. az admin
// a saját nevét módosítja), és a kliens-oldali router cache is ürül.
function kesz(): MuveletState {
  revalidatePath('/', 'layout');
  return { ok: true };
}

// Hiba → MuveletState. Ami mezőhöz köthető, a mező kulcsára megy, a többi a `form`-ra.
// A Next control-flow kivételeit (redirect/notFound) tovább kell dobni, nem elnyelni.
function hiba(err: unknown, muvelet: string): MuveletState {
  unstable_rethrow(err);
  switch (apiKod(err)) {
    case 'USER_ALREADY_EXISTS':
    case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
      return { errors: { email: 'Ezzel az e-mail címmel már van felhasználó.' } };
    case 'INVALID_EMAIL':
      // A saját validátorunk megengedőbb a Better Auth zod-szabályánál (pl. ékezetes cím).
      return { errors: { email: 'Érvénytelen e-mail cím.' } };
    case 'PASSWORD_TOO_SHORT':
    case 'PASSWORD_TOO_LONG':
      // A validátorunk 8–128 karaktert enged (a Better Auth alapértelmezése); ha a
      // lib/auth.ts min/maxPasswordLength változna, ez a fallback marad.
      return { errors: { jelszo: 'A jelszó hossza nem megfelelő (8–128 karakter).' } };
    case 'USER_NOT_FOUND':
      // Elavult lista (másik admin közben törölte): frissítjük, hogy a sor eltűnjön.
      revalidatePath('/', 'layout');
      return { errors: { form: 'Ez a felhasználó már nem létezik, a lista frissült.' } };
    case 'YOU_CANNOT_BAN_YOURSELF':
    case 'YOU_CANNOT_REMOVE_YOURSELF':
      return { errors: { form: SAJAT_FIOK_HIBA } };
    default:
      console.error(`[felhasznalok] ${muvelet} sikertelen:`, err);
      return { errors: { form: 'Művelet sikertelen.' } };
  }
}

export async function createFelhasznaloAction(
  _prev: MuveletState,
  formData: FormData,
): Promise<MuveletState> {
  await requireAdmin();
  const parsed = parseUjFelhasznalo(formData);
  if (!parsed.ok) return { errors: parsed.errors };
  const { nev, email, jelszo, szerepkor, orszag } = parsed.data;
  try {
    await auth.api.createUser({
      headers: await headers(),
      body: {
        name: nev,
        email,
        password: jelszo,
        role: szerepkor,
        data: { orszag } satisfies FelhasznaloAdatok,
      },
    });
  } catch (err) {
    return hiba(err, 'createUser');
  }
  return kesz();
}

export async function updateFelhasznaloAction(
  userId: string,
  _prev: MuveletState,
  formData: FormData,
): Promise<MuveletState> {
  const me = await requireAdmin();
  const parsed = parseSzerkesztes(formData);
  if (!parsed.ok) return { errors: parsed.errors };
  const { nev, szerepkor, orszag } = parsed.data;
  if (userId === me.userId && szerepkor !== 'admin') {
    return { errors: { szerepkor: 'Saját admin szerepkörödet nem veheted el.' } };
  }
  try {
    // Egyetlen hívás (név, ország, szerepkör együtt): az adminUpdateUser a data.role-t
    // maga ellenőrzi és menti, így nincs részlegesen mentett állapot.
    await auth.api.adminUpdateUser({
      headers: await headers(),
      body: { userId, data: { name: nev, orszag, role: szerepkor } satisfies FelhasznaloAdatok },
    });
  } catch (err) {
    return hiba(err, 'adminUpdateUser');
  }
  return kesz();
}

export async function setJelszoAction(
  userId: string,
  _prev: MuveletState,
  formData: FormData,
): Promise<MuveletState> {
  const me = await requireAdmin();
  const parsed = parseJelszo(formData);
  if (!parsed.ok) return { errors: parsed.errors };
  try {
    const h = await headers();
    await auth.api.setUserPassword({ headers: h, body: { userId, newPassword: parsed.data.jelszo } });
    // Jelszó-visszaállítás = fiók-helyreállítás: a célfelhasználó régi sessionjei is
    // érvénytelenek legyenek. Saját jelszónál a saját sessiont megtartjuk.
    if (userId !== me.userId) {
      await auth.api.revokeUserSessions({ headers: h, body: { userId } });
    }
  } catch (err) {
    return hiba(err, 'setUserPassword');
  }
  return kesz();
}

export async function banAction(userId: string): Promise<MuveletState> {
  const me = await requireAdmin();
  if (userId === me.userId) return { errors: { form: SAJAT_FIOK_HIBA } };
  try {
    await auth.api.banUser({ headers: await headers(), body: { userId } });
  } catch (err) {
    return hiba(err, 'banUser');
  }
  return kesz();
}

export async function unbanAction(userId: string): Promise<MuveletState> {
  await requireAdmin();
  try {
    await auth.api.unbanUser({ headers: await headers(), body: { userId } });
  } catch (err) {
    return hiba(err, 'unbanUser');
  }
  return kesz();
}

export async function removeFelhasznaloAction(userId: string): Promise<MuveletState> {
  const me = await requireAdmin();
  if (userId === me.userId) return { errors: { form: SAJAT_FIOK_HIBA } };
  try {
    await auth.api.removeUser({ headers: await headers(), body: { userId } });
  } catch (err) {
    return hiba(err, 'removeUser');
  }
  return kesz();
}
```

- [ ] **Step 2: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: nincs hiba. A `role: szerepkor` azért fordul, mert a `lib/auth.ts` admin pluginja `roles` mappel (`admin`, `attase`) van konfigurálva (Task 7 javítás); ha mégis típushibát ad, az a config hiánya, nem cast-tal kell megoldani. Ha a `data: { name, orszag }` hibázik `null` miatt, `orszag: orszag ?? undefined`.

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/felhasznalok/actions.ts"
git commit -m "feat(felhasznalok): server action-ök a Better Auth admin API-ra"
```

---

### Task 9: `/felhasznalok` oldal, táblázat, új felhasználó dialógus

**Files:**
- Create: `lib/datum.ts`
- Create: `app/(app)/felhasznalok/components/useMuveletForm.ts`
- Create: `app/(app)/felhasznalok/components/MezoHiba.tsx`
- Create: `app/(app)/felhasznalok/components/SzerepkorSelect.tsx`
- Create: `app/(app)/felhasznalok/components/UjFelhasznaloDialog.tsx`
- Create: `app/(app)/felhasznalok/components/FelhasznaloTabla.tsx`
- Create: `app/(app)/felhasznalok/page.tsx`

- [ ] **Step 0: `lib/datum.ts` – determinisztikus dátumformázás**

Kliens komponensben a `toISOString()` UTC-t adna, a `toLocaleDateString()` pedig a futtató időzónáját (SSR vs. böngésző eltérhet → hidratációs eltérés). Fix időzóna + locale, így a szerver és a kliens ugyanazt írja.

```ts
const HU_DATUM = new Intl.DateTimeFormat('hu-HU', {
  timeZone: 'Europe/Budapest',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Dátum magyar formában (pl. „2026. 09. 07."), fix Europe/Budapest időzónával. */
export function formatDatum(d: Date): string {
  return HU_DATUM.format(d);
}
```

- [ ] **Step 0b: `useMuveletForm.ts` – közös form-hook**

A siker-kezelés (toast + zárás) az `useActionState` action wrapperében történik, nem `useEffect`-ben: pontosan egyszer fut, és nem függ az `onKesz` referencia-stabilitásától.

```ts
import { useActionState } from 'react';
import { toast } from 'sonner';
import type { MuveletState } from '../actions';

type FormAction = (prev: MuveletState, formData: FormData) => Promise<MuveletState>;

/**
 * useActionState + siker-toast + záró callback egy helyen. A siker-kezelés az action
 * wrapperben történik, nem useEffect-ben: így pontosan egyszer fut, és nem függ az
 * onKesz referencia-stabilitásától. Visszaad: [state, formAction, pending].
 */
export function useMuveletForm(action: FormAction, siker: string, onKesz: () => void) {
  return useActionState<MuveletState, FormData>(
    async (prev, formData) => {
      const eredmeny = await action(prev, formData);
      if (eredmeny.ok) {
        toast.success(siker);
        onKesz();
      }
      return eredmeny;
    },
    {},
  );
}
```

- [ ] **Step 1: `MezoHiba.tsx`**

```tsx
import type { MezoHibak } from '../../../../lib/felhasznalo-validacio';

/** Mezőhiba szövege. Az `id`-t a mező `aria-describedby`-ja hivatkozza (hibaAttr). */
export function MezoHiba({ id, uzenet, alert = false }: { id?: string; uzenet?: string; alert?: boolean }) {
  if (!uzenet) return null;
  return (
    <p id={id} role={alert ? 'alert' : undefined} className="text-xs text-destructive">
      {uzenet}
    </p>
  );
}

/** A hibás mező aria attribútumai: aria-invalid + aria-describedby a `<mezo>-hiba` id-ra. */
export function hibaAttr(errors: MezoHibak, mezo: string) {
  return errors[mezo] ? { 'aria-invalid': true as const, 'aria-describedby': `${mezo}-hiba` } : {};
}
```

- [ ] **Step 2: `SzerepkorSelect.tsx`**

A Base UI `Select` a `name` prop miatt rejtett inputot rendel, így a `FormData`-ban `szerepkor` néven megjelenik. Az `items` a `SelectValue` címkéjéhez kell.

```tsx
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { SZEREPKOR_CIMKE, SZEREPKOROK, type Szerepkor } from '../../../../lib/felhasznalo-validacio';

// A Base UI Select a `name` miatt rejtett inputot rendel, így a FormData-ban `szerepkor`
// néven megjelenik. Az `items` a SelectValue címkéjéhez kell. A trigger <button
// role=combobox>, amire a <label for> nem minden AT-nél számít névnek, ezért
// aria-labelledby: a label id + a saját id (név + aktuális érték).
export function SzerepkorSelect({
  value,
  onChange,
  invalid = false,
}: {
  value: Szerepkor;
  onChange: (v: Szerepkor) => void;
  invalid?: boolean;
}) {
  return (
    <Select name="szerepkor" value={value} onValueChange={(v) => onChange(v ?? 'attase')} items={SZEREPKOR_CIMKE}>
      <SelectTrigger
        id="szerepkor"
        aria-labelledby="szerepkor-label szerepkor"
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? 'szerepkor-hiba' : undefined}
        className="w-full"
      >
        <SelectValue placeholder="Válassz szerepkört" />
      </SelectTrigger>
      <SelectContent>
        {SZEREPKOROK.map((k) => (
          <SelectItem key={k} value={k}>
            {SZEREPKOR_CIMKE[k]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

- [ ] **Step 3: `UjFelhasznaloDialog.tsx`**

A modal (hook + Dialog + form) külön komponens, amit a nyitó gomb `key`-vel indít újra minden nyitáskor, így az `useActionState` és a vezérelt mezők állapota tiszta. Beküldés közben a dialógus nem zárható (`details.cancel()`, `showCloseButton={!pending}`). A `-hiba` és `szerepkor(-label)` id-k dokumentum-szintűek: egyszerre csak egy dialógus lehet nyitva (a Base UI a zárt dialógus tartalmát nem rendereli), ezért nem ütköznek.

```tsx
'use client';

import { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import type { Szerepkor } from '../../../../lib/felhasznalo-validacio';
import { createFelhasznaloAction } from '../actions';
import { hibaAttr, MezoHiba } from './MezoHiba';
import { SzerepkorSelect } from './SzerepkorSelect';
import { useMuveletForm } from './useMuveletForm';

export function UjFelhasznaloDialog() {
  const [open, setOpen] = useState(false);
  // Minden nyitás új key: a modal (és benne az űrlap állapota) tisztán újraindul.
  const [nyitas, setNyitas] = useState(0);
  return (
    <>
      <Button
        onClick={() => {
          setNyitas((n) => n + 1);
          setOpen(true);
        }}
      >
        Új felhasználó
      </Button>
      <UjFelhasznaloModal key={nyitas} open={open} onOpenChange={setOpen} />
    </>
  );
}

function UjFelhasznaloModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useMuveletForm(
    createFelhasznaloAction,
    'Felhasználó létrehozva.',
    () => onOpenChange(false),
  );
  // Vezérelt mezők: a React 19 a <form action> beküldése után (hibánál is) alaphelyzetbe
  // állítja a nem vezérelt inputokat; a state megőrzi a beírt értékeket, és az ország is
  // megmarad, ha a szerepkör-váltás ideiglenesen elrejti a mezőt.
  const [nev, setNev] = useState('');
  const [email, setEmail] = useState('');
  const [jelszo, setJelszo] = useState('');
  const [szerepkor, setSzerepkor] = useState<Szerepkor>('attase');
  const [orszag, setOrszag] = useState('');
  const errors = state.errors ?? {};

  return (
    <Dialog
      open={open}
      onOpenChange={(next, details) => {
        // Beküldés közben nem zárható (Esc, háttér, X), különben az eredmény elveszne.
        if (!next && pending) {
          details.cancel();
          return;
        }
        onOpenChange(next);
      }}
    >
      <DialogContent showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>Új felhasználó</DialogTitle>
          <DialogDescription>
            A felhasználó a megadott e-mail címmel és jelszóval tud bejelentkezni.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nev">Név</Label>
            <Input
              id="nev"
              name="nev"
              required
              maxLength={100}
              autoComplete="off"
              value={nev}
              onChange={(e) => setNev(e.target.value)}
              {...hibaAttr(errors, 'nev')}
            />
            <MezoHiba id="nev-hiba" uzenet={errors.nev} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail cím</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              {...hibaAttr(errors, 'email')}
            />
            <MezoHiba id="email-hiba" uzenet={errors.email} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="jelszo">Kezdő jelszó</Label>
            <Input
              id="jelszo"
              name="jelszo"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={jelszo}
              onChange={(e) => setJelszo(e.target.value)}
              {...hibaAttr(errors, 'jelszo')}
            />
            <MezoHiba id="jelszo-hiba" uzenet={errors.jelszo} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label id="szerepkor-label" htmlFor="szerepkor">Szerepkör</Label>
            <SzerepkorSelect value={szerepkor} onChange={setSzerepkor} invalid={Boolean(errors.szerepkor)} />
            <MezoHiba id="szerepkor-hiba" uzenet={errors.szerepkor} />
          </div>
          {szerepkor === 'attase' && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="orszag">Ország (TéT poszt)</Label>
              <Input
                id="orszag"
                name="orszag"
                required
                maxLength={100}
                placeholder="pl. Dél-Korea"
                value={orszag}
                onChange={(e) => setOrszag(e.target.value)}
                {...hibaAttr(errors, 'orszag')}
              />
              <MezoHiba id="orszag-hiba" uzenet={errors.orszag} />
            </div>
          )}
          <MezoHiba id="form-hiba" uzenet={errors.form} alert />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Mégse
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Mentés…' : 'Létrehozás'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: `FelhasznaloTabla.tsx`**

Server Component (nincs `'use client'`): az adat propként jön, a kliens határ a Task 10-ben bekerülő soronkénti `FelhasznaloMuveletek`. A műveletek oszlop egyelőre üres cella.

```tsx
import { Badge } from '../../../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import type { FelhasznaloSor } from '../../../../db/queries/felhasznalo';
import { formatDatum } from '../../../../lib/datum';
import { SZEREPKOR_CIMKE } from '../../../../lib/felhasznalo-validacio';

export function FelhasznaloTabla({
  felhasznalok,
  sajatId,
}: {
  felhasznalok: FelhasznaloSor[];
  sajatId: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Név</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Szerepkör</TableHead>
            <TableHead>Ország</TableHead>
            <TableHead>Állapot</TableHead>
            <TableHead>Létrehozva</TableHead>
            <TableHead className="w-12"><span className="sr-only">Műveletek</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {felhasznalok.map((f) => (
            <TableRow key={f.id}>
              <TableCell className="font-medium">
                {f.nev}
                {f.id === sajatId && <span className="ml-2 text-xs text-muted-foreground">(te)</span>}
              </TableCell>
              <TableCell className="text-muted-foreground">{f.email}</TableCell>
              <TableCell>
                <Badge variant={f.szerepkor === 'admin' ? 'default' : 'secondary'}>
                  {SZEREPKOR_CIMKE[f.szerepkor]}
                </Badge>
              </TableCell>
              <TableCell>{f.orszag ?? <span className="text-muted-foreground">–</span>}</TableCell>
              <TableCell>
                {f.tiltott ? <Badge variant="destructive">Tiltott</Badge> : <Badge variant="outline">Aktív</Badge>}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDatum(f.letrehozva)}</TableCell>
              <TableCell />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

- [ ] **Step 5: `app/(app)/felhasznalok/page.tsx`**

```tsx
import { listFelhasznalok } from '../../../db/queries/felhasznalo';
import { requireAdmin } from '../../../lib/session';
import { FelhasznaloTabla } from './components/FelhasznaloTabla';
import { UjFelhasznaloDialog } from './components/UjFelhasznaloDialog';

export default async function FelhasznalokPage() {
  const me = await requireAdmin();
  const felhasznalok = listFelhasznalok();
  return (
    <div className="flex max-w-6xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">{felhasznalok.length} felhasználó</p>
        <div className="ml-auto">
          <UjFelhasznaloDialog />
        </div>
      </div>
      <FelhasznaloTabla felhasznalok={felhasznalok} sajatId={me.userId} />
    </div>
  );
}
```

- [ ] **Step 6: Ellenőrzés**

Run: `npx tsc --noEmit` → nincs hiba.

Böngésző adminnal: `/felhasznalok` mutatja a seed admint „(te)” jelöléssel. „Új felhasználó” → dialógus; attasé ország nélkül beküldve → „TéT attasénál az ország kötelező.”; kitöltve → toast, dialógus zárul, az új sor megjelenik. Ugyanazzal az e-mail címmel újra → „Ezzel az e-mail címmel már van felhasználó.” Szerepkört adminra váltva az ország mező eltűnik.

Új privát ablakban (vagy a headless böngésző külön tabján) az új attaséval bejelentkezve a fejléc „TéT attasé · <ország>”, a „Felhasználók” menü nem látszik, `/felhasznalok` → `404`, az oldalon „Az oldal nem található” ÉS az oldalsáv („Aktív ciklus”) is látszik, a fejléc címe a generikus „TéT Platform”. Megjegyzés: curl-lel dev módban a `notFound()` SSR-kimenete csak egy `<template data-next-error-message=…>`, a shell kliensen renderelődik, ezért az „Aktív ciklus” ellenőrzés csak böngészőben működik.

- [ ] **Step 7: Commit**

```bash
git add lib/datum.ts "app/(app)/felhasznalok"
git commit -m "feat(felhasznalok): admin lista és új felhasználó dialógus"
```

---

### Task 10: Szerkesztés, jelszó, tiltás/feloldás, törlés

A Task 9 review után rögzített minta (ezt kövesd): a form dialógusok a `useMuveletForm` hookot használják (siker-toast + zárás az action wrapperben), vezérelt mezőkkel, `hibaAttr`/`MezoHiba` a11y-vel; beküldés közben a dialógus nem zárható (`details.cancel()`, `showCloseButton={!pending}`); a dialógus-komponens `key`-vel indul újra minden nyitáskor. A `FelhasznaloTabla` Server Component marad, a kliens határ a soronkénti `FelhasznaloMuveletek`.

**Files:**
- Create: `app/(app)/felhasznalok/components/SzerkesztesDialog.tsx`
- Create: `app/(app)/felhasznalok/components/JelszoDialog.tsx`
- Create: `app/(app)/felhasznalok/components/FelhasznaloMuveletek.tsx`
- Modify: `app/(app)/felhasznalok/components/FelhasznaloTabla.tsx`

- [ ] **Step 1: `SzerkesztesDialog.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import type { FelhasznaloSor } from '../../../../db/queries/felhasznalo';
import type { Szerepkor } from '../../../../lib/felhasznalo-validacio';
import { updateFelhasznaloAction } from '../actions';
import { hibaAttr, MezoHiba } from './MezoHiba';
import { SzerepkorSelect } from './SzerepkorSelect';
import { useMuveletForm } from './useMuveletForm';

export function SzerkesztesDialog({
  felhasznalo,
  open,
  onOpenChange,
}: {
  felhasznalo: FelhasznaloSor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useMuveletForm(
    updateFelhasznaloAction.bind(null, felhasznalo.id),
    'Felhasználó módosítva.',
    () => onOpenChange(false),
  );
  // Vezérelt mezők: a React 19 a <form action> beküldése után (hibánál is) alaphelyzetbe
  // állítja a nem vezérelt inputokat; a state megőrzi a beírt értékeket.
  const [nev, setNev] = useState(felhasznalo.nev);
  const [szerepkor, setSzerepkor] = useState<Szerepkor>(felhasznalo.szerepkor);
  const [orszag, setOrszag] = useState(felhasznalo.orszag ?? '');
  const errors = state.errors ?? {};

  return (
    <Dialog
      open={open}
      onOpenChange={(next, details) => {
        // Beküldés közben nem zárható (Esc, háttér, X), különben az eredmény elveszne.
        if (!next && pending) {
          details.cancel();
          return;
        }
        onOpenChange(next);
      }}
    >
      <DialogContent showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>Felhasználó szerkesztése</DialogTitle>
          <DialogDescription>{felhasznalo.email}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nev">Név</Label>
            <Input
              id="nev"
              name="nev"
              required
              maxLength={100}
              value={nev}
              onChange={(e) => setNev(e.target.value)}
              {...hibaAttr(errors, 'nev')}
            />
            <MezoHiba id="nev-hiba" uzenet={errors.nev} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label id="szerepkor-label" htmlFor="szerepkor">Szerepkör</Label>
            <SzerepkorSelect value={szerepkor} onChange={setSzerepkor} invalid={Boolean(errors.szerepkor)} />
            <MezoHiba id="szerepkor-hiba" uzenet={errors.szerepkor} />
            {szerepkor === 'admin' && felhasznalo.orszag && (
              <p className="text-xs text-muted-foreground">Adminra váltva az ország törlődik.</p>
            )}
          </div>
          {szerepkor === 'attase' && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="orszag">Ország (TéT poszt)</Label>
              <Input
                id="orszag"
                name="orszag"
                required
                maxLength={100}
                value={orszag}
                onChange={(e) => setOrszag(e.target.value)}
                {...hibaAttr(errors, 'orszag')}
              />
              <MezoHiba id="orszag-hiba" uzenet={errors.orszag} />
            </div>
          )}
          <MezoHiba id="form-hiba" uzenet={errors.form} alert />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Mégse
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Mentés…' : 'Mentés'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: `JelszoDialog.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import type { FelhasznaloSor } from '../../../../db/queries/felhasznalo';
import { setJelszoAction } from '../actions';
import { hibaAttr, MezoHiba } from './MezoHiba';
import { useMuveletForm } from './useMuveletForm';

export function JelszoDialog({
  felhasznalo,
  sajat,
  open,
  onOpenChange,
}: {
  felhasznalo: FelhasznaloSor;
  sajat: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useMuveletForm(
    setJelszoAction.bind(null, felhasznalo.id),
    'Jelszó beállítva.',
    () => onOpenChange(false),
  );
  // Vezérelt mező, hogy hibánál ne ürüljön (React 19 a <form action> után resetel).
  const [jelszo, setJelszo] = useState('');
  const errors = state.errors ?? {};

  return (
    <Dialog
      open={open}
      onOpenChange={(next, details) => {
        if (!next && pending) {
          details.cancel();
          return;
        }
        onOpenChange(next);
      }}
    >
      <DialogContent showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>Jelszó-visszaállítás</DialogTitle>
          <DialogDescription>
            {sajat
              ? 'Új jelszót állítasz be a saját fiókodhoz. A jelenlegi bejelentkezésed megmarad.'
              : `${felhasznalo.nev} új jelszót kap. E-mail nem megy ki, add át neki személyesen. A régi bejelentkezései megszűnnek.`}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="jelszo">Új jelszó</Label>
            <Input
              id="jelszo"
              name="jelszo"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={jelszo}
              onChange={(e) => setJelszo(e.target.value)}
              {...hibaAttr(errors, 'jelszo')}
            />
            <MezoHiba id="jelszo-hiba" uzenet={errors.jelszo} />
          </div>
          <MezoHiba id="form-hiba" uzenet={errors.form} alert />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Mégse
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Mentés…' : 'Jelszó beállítása'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: `FelhasznaloMuveletek.tsx`**

Sor-menü (`DropdownMenu`) + a két form-dialógus (`key`-vel újraindítva minden nyitáskor) + megerősítő `AlertDialog` a tiltás/feloldás/törlés műveletekhez. A base-nova `AlertDialogAction` sima `Button` (nem zár), a dialógus vezérelt; az `AlertDialogCancel` `Close`. A `DropdownMenuTrigger` a Base UI `render` propjával kapja a gombot; a `DropdownMenuItem` `variant="destructive"`-et támogat.

```tsx
'use client';

import { MoreHorizontalIcon } from 'lucide-react';
import { unstable_rethrow } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import type { FelhasznaloSor } from '../../../../db/queries/felhasznalo';
import { banAction, removeFelhasznaloAction, unbanAction, type MuveletState } from '../actions';
import { JelszoDialog } from './JelszoDialog';
import { SzerkesztesDialog } from './SzerkesztesDialog';

type Megerosites = 'tilt' | 'felold' | 'torol' | null;

const MEGEROSITES_SZOVEG: Record<Exclude<Megerosites, null>, { cim: string; leiras: string; gomb: string; siker: string }> = {
  tilt: {
    cim: 'Fiók letiltása',
    leiras: 'A felhasználó nem tud bejelentkezni, amíg fel nem oldod.',
    gomb: 'Letiltás',
    siker: 'Fiók letiltva.',
  },
  felold: {
    cim: 'Tiltás feloldása',
    leiras: 'A felhasználó újra be tud jelentkezni.',
    gomb: 'Feloldás',
    siker: 'Tiltás feloldva.',
  },
  torol: {
    cim: 'Fiók végleges törlése',
    leiras: 'Ez nem vonható vissza. A felhasználó sessionjei is törlődnek.',
    gomb: 'Törlés',
    siker: 'Fiók törölve.',
  },
};

export function FelhasznaloMuveletek({ felhasznalo, sajat }: { felhasznalo: FelhasznaloSor; sajat: boolean }) {
  const [szerkesztes, setSzerkesztes] = useState(false);
  const [jelszo, setJelszo] = useState(false);
  // Minden dialógus-nyitás új key: a dialógus (és az űrlap állapota) tisztán újraindul.
  const [nyitas, setNyitas] = useState(0);
  const [megerosites, setMegerosites] = useState<Megerosites>(null);
  const [pending, startTransition] = useTransition();

  function nyit(setter: (v: boolean) => void) {
    setNyitas((n) => n + 1);
    setter(true);
  }

  function futtat(kind: Exclude<Megerosites, null>) {
    const fn: (id: string) => Promise<MuveletState> =
      kind === 'tilt' ? banAction : kind === 'felold' ? unbanAction : removeFelhasznaloAction;
    startTransition(async () => {
      try {
        const res = await fn(felhasznalo.id);
        if (res.ok) toast.success(MEGEROSITES_SZOVEG[kind].siker);
        else toast.error(res.errors?.form ?? 'Művelet sikertelen.');
      } catch (err) {
        // A server action dobhat (pl. notFound(), ha közben elveszett az admin jog): a Next
        // control-flow hibáját tovább kell dobni, hogy a not-found boundary kezelje.
        unstable_rethrow(err);
        toast.error('Művelet sikertelen.');
      } finally {
        setMegerosites(null);
      }
    });
  }

  const szoveg = megerosites ? MEGEROSITES_SZOVEG[megerosites] : null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Műveletek: ${felhasznalo.nev}`} />}>
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => nyit(setSzerkesztes)}>Szerkesztés</DropdownMenuItem>
          <DropdownMenuItem onClick={() => nyit(setJelszo)}>Jelszó-visszaállítás</DropdownMenuItem>
          {!sajat && (
            <>
              <DropdownMenuSeparator />
              {felhasznalo.tiltott ? (
                <DropdownMenuItem onClick={() => setMegerosites('felold')}>Tiltás feloldása</DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => setMegerosites('tilt')}>Letiltás</DropdownMenuItem>
              )}
              <DropdownMenuItem variant="destructive" onClick={() => setMegerosites('torol')}>
                Törlés
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <SzerkesztesDialog key={`sz-${nyitas}`} felhasznalo={felhasznalo} open={szerkesztes} onOpenChange={setSzerkesztes} />
      <JelszoDialog key={`j-${nyitas}`} felhasznalo={felhasznalo} sajat={sajat} open={jelszo} onOpenChange={setJelszo} />

      <AlertDialog
        open={megerosites !== null}
        onOpenChange={(next, details) => {
          // Folyamatban lévő művelet alatt nem zárható.
          if (!next && pending) {
            details.cancel();
            return;
          }
          if (!next) setMegerosites(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{szoveg?.cim}</AlertDialogTitle>
            <AlertDialogDescription>
              {felhasznalo.nev} ({felhasznalo.email}). {szoveg?.leiras}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Mégse</AlertDialogCancel>
            <AlertDialogAction
              variant={megerosites === 'torol' ? 'destructive' : 'default'}
              disabled={pending}
              onClick={() => {
                if (megerosites) futtat(megerosites);
              }}
            >
              {pending ? 'Folyamatban…' : szoveg?.gomb}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

- [ ] **Step 4: `FelhasznaloTabla.tsx` – műveletek oszlop**

Import hozzáadása (a tábla Server Component marad, a `FelhasznaloMuveletek` a kliens határ):

```tsx
import { FelhasznaloMuveletek } from './FelhasznaloMuveletek';
```

Az üres `<TableCell />` cseréje a sorban:

```tsx
              <TableCell className="text-right">
                <FelhasznaloMuveletek felhasznalo={f} sajat={f.id === sajatId} />
              </TableCell>
```

- [ ] **Step 5: Ellenőrzés**

Run: `npx tsc --noEmit` → nincs hiba (a `.next/` alatti ismert elavult hibán kívül).

Böngésző adminnal a `/felhasznalok`-on (a Task 9-ben létrehozott teszt attasékkal):
1. Attasé sor menü → Szerkesztés → ország módosítás → toast, a tábla frissül; hibás beküldés (üres név) után a többi mező értéke megmarad.
2. Jelszó-visszaállítás → új jelszó; külön cookie-jarral/tabbal az attasé az új jelszóval belép, a régivel nem; a régi sessionje (ha volt) `/terkep`-en `/login`-ra kerül.
3. Letiltás → megerősítés → „Tiltott” badge; az attasé belépése → 403 `BANNED_USER` (böngészőben „A fiók le van tiltva.”). Feloldás → újra be tud lépni.
4. Törlés → megerősítés → a sor eltűnik.
5. Saját sor menüjében nincs Letiltás/Törlés; saját szerkesztésnél szerepkör attaséra váltás → „Saját admin szerepkörödet nem veheted el.”; saját név módosítása után a fejléc (AppShell) is az új nevet mutatja.
6. `console --errors`: nincs React/Base UI hiba.

- [ ] **Step 6: Commit**

```bash
git add "app/(app)/felhasznalok"
git commit -m "feat(felhasznalok): szerkesztés, jelszó-visszaállítás, tiltás, törlés"
```

---

### Task 11: Build, curl-ellenőrzés, README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: sikeres build. Ha a `/login` oldalnál „useSearchParams … Suspense” hibát látsz, valaki `useSearchParams`-t használt a `LoginForm`-ban – a terv szerint a `next` a page `searchParams` propjából jön, ne a kliens hookból.

- [ ] **Step 2: curl a sign-in végpontra**

Dev szerver fut. Cseréld az emailt/jelszót a `.env.local` seed értékeire:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/auth/sign-in/email \
  -H 'content-type: application/json' -d '{"email":"admin@niu.hu","password":"ROSSZ"}'
```
Expected: `401`

```bash
curl -s -c /tmp/tet-cookie.txt -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/auth/sign-in/email \
  -H 'content-type: application/json' -d '{"email":"admin@niu.hu","password":"<SEED_ADMIN_PASSWORD>"}'
curl -s -b /tmp/tet-cookie.txt -o /dev/null -w "%{http_code}\n" http://localhost:3000/felhasznalok
```
Expected: `200`, majd `200` (cookie-val a védett oldal elérhető).

- [ ] **Step 3: README frissítése**

Az „Indítás” blokk után add hozzá:

```markdown
### Bejelentkezés és felhasználók

- Minden oldal bejelentkezést kér (`proxy.ts` + `lib/session.ts`). Belépés: `/login`, a seed admin adataival.
- Admin a `/felhasznalok` oldalon hoz létre TéT attasé fiókokat (név, e-mail, kezdő jelszó, ország), szerkeszt, jelszót állít vissza, tilt és töröl. Nyilvános regisztráció nincs.
- Szerepkörök: `admin` (NIÜ) és `attase`; az attasé fiókon kötelező az ország (`user.orszag`).
```

A „Képernyők” táblázatba két sor:

```markdown
| `/login` | Bejelentkezés (email + jelszó) |
| `/felhasznalok` | Felhasználó-kezelés (csak admin) |
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: login és felhasználó-kezelés a README-ben"
```

- [ ] **Step 5: Végső teljes manuális forgatókönyv (a spec „Ellenőrzés” szakasza)**

1. Kijelentkezve bármely oldal → `/login?next=...`; belépés után oda kerül vissza.
2. Rossz jelszó → hibaüzenet; jó → `/terkep`, fejlécben név és szerepkör.
3. Attasé: `/felhasznalok` → 404, a menüben nem látszik.
4. Admin: létrehoz attasét országgal; ország nélkül → mezőhiba. Az új attasé belép, a fejléc az országot mutatja.
5. Szerkesztés (ország módosítás), jelszó-visszaállítás → új jelszóval belép.
6. Tiltás → a tiltott nem tud belépni, listában „Tiltott”; feloldás után igen.
7. Törlés megerősítéssel; saját fiók tiltása/törlése nem elérhető a menüből, saját szerepkör elvétele → hiba.
8. Kijelentkezés → `/login`, a védett oldal újra átirányít.

Ha mind rendben: a plan kész. A következő plan (riportok) a `requireSession()` és `AppSession.orszag` interfészre épül.
