# Auth és adatbázis infrastruktúra – tervezési spec

Dátum: 2026-09-07
Állapot: jóváhagyva

## Cél

A TéT Platform dummy demóból valódi alkalmazássá alakításának első lépése:
perzisztens adatbázis (SQLite, Drizzle ORM) és hitelesítési réteg (Better Auth,
Drizzle adapterrel). Ez a lépés **csak az infrastruktúrát** szállítja. Login UI,
route-védelem és a demóadatok DB-be költöztetése későbbi lépések.

## Döntések

| Kérdés | Döntés | Indok |
| --- | --- | --- |
| SQLite driver | `better-sqlite3` v12 | Natív, szinkron, gyors. A Better Auth peer dep a `^12` sort kéri. |
| Bejelentkezés módja | Email + jelszó, nyilvános regisztráció **tiltva** | Belső NIÜ rendszer; felhasználókat seed vagy admin hoz létre. |
| Szerepkör kezelés | Better Auth `admin` plugin | Kész role/ban/user-létrehozás API. Role értékek: `admin`, `attase`. |
| Hatókör | Csak infra | Telepítés, séma, migráció, auth handler, seed. UI nincs. |

## Csomagok

Futásidejű: `drizzle-orm`, `better-sqlite3@^12`, `better-auth`
Fejlesztői: `drizzle-kit`, `@types/better-sqlite3`, `tsx`

## Fájlok

| Fájl | Felelősség |
| --- | --- |
| `db/index.ts` | better-sqlite3 kapcsolat + Drizzle példány. Singleton (globalThis cache dev HMR miatt). `PRAGMA journal_mode=WAL`, `PRAGMA foreign_keys=ON`. Útvonal: `DATABASE_URL`, alapértelmezés `./data/tet.db`; a `data/` mappát létrehozza ha hiányzik. |
| `db/schema/auth.ts` | Better Auth táblák Drizzle sémában: `user`, `session`, `account`, `verification`, admin plugin mezőkkel. A `@better-auth/cli generate` kimenete, átnézve. |
| `db/schema/index.ts` | `export * from './auth'`. Ide kerülnek később a domain táblák. |
| `drizzle.config.ts` | `dialect: 'sqlite'`, `schema: './db/schema/index.ts'`, `out: './drizzle'`, `dbCredentials.url` env-ből. |
| `drizzle/` | Generált SQL migrációk, commitolva. |
| `lib/auth.ts` | `betterAuth({...})` szerver példány. Lásd Auth konfiguráció. |
| `lib/auth-client.ts` | `createAuthClient({ plugins: [adminClient()] })`. |
| `app/api/auth/[...all]/route.ts` | `toNextJsHandler(auth)` → `GET`, `POST`. |
| `scripts/seed.ts` | Első admin létrehozása. |
| `.env.example` | Dokumentált env változók, placeholder értékekkel. |
| `.env.local` | Valódi lokális értékek, gitignore-olva. |
| `next.config.mjs` | `serverExternalPackages: ['better-sqlite3']`. |
| `.gitignore` | `data/`, `*.db`, `*.db-wal`, `*.db-shm`, `.env*.local` |

## Auth konfiguráció (`lib/auth.ts`)

```ts
betterAuth({
  database: drizzleAdapter(db, { provider: 'sqlite', schema }),
  emailAndPassword: { enabled: true, disableSignUp: true },
  plugins: [
    admin({ defaultRole: 'attase', adminRoles: ['admin'] }),
    nextCookies(), // mindig utolsó
  ],
})
```

- `BETTER_AUTH_SECRET` és `BETTER_AUTH_URL` env-ből (Better Auth automatikusan olvassa).
- Session: Better Auth alapértelmezett cookie-alapú session, DB-ben tárolva.

## Környezeti változók

| Név | Példa | Leírás |
| --- | --- | --- |
| `DATABASE_URL` | `./data/tet.db` | SQLite fájl útvonala (projektgyökérhez relatív). |
| `BETTER_AUTH_SECRET` | 32+ karakter random | Session aláírás. |
| `BETTER_AUTH_URL` | `http://localhost:3000` | Alap URL. |
| `SEED_ADMIN_EMAIL` | `admin@niu.hu` | Seed admin email. |
| `SEED_ADMIN_PASSWORD` | min. 8 karakter | Seed admin jelszó. |
| `SEED_ADMIN_NAME` | `Sipos Katalin` | Seed admin megjelenített név. |

## Seed (`scripts/seed.ts`)

- Beolvassa a `SEED_ADMIN_*` env-eket; ha hiányzik, hibával kilép.
- Ha a `user` táblában már létezik a megadott email, kiírja és kilép (idempotens).
- Különben létrehoz egy `user` sort (`role: 'admin'`, `emailVerified: true`) és egy
  `account` sort (`providerId: 'credential'`, `password` a Better Auth
  `hashPassword` függvényével hash-elve) egy tranzakcióban.
- Futtatás: `npm run db:seed` (`tsx --env-file=.env.local scripts/seed.ts`).

Indok a közvetlen insertre: a `disableSignUp` a `signUpEmail` API-t is tiltja, az
admin plugin `createUser` endpointja pedig admin sessiont kér, ami az első
adminnál még nincs.

## package.json scriptek

| Script | Parancs |
| --- | --- |
| `db:generate` | `drizzle-kit generate` |
| `db:migrate` | `drizzle-kit migrate` |
| `db:studio` | `drizzle-kit studio` |
| `db:seed` | `tsx --env-file=.env.local scripts/seed.ts` |
| `auth:generate` | `npx @better-auth/cli generate --config lib/auth.ts --output db/schema/auth.ts` |

## Adatfolyam

HTTP kérés → `app/api/auth/[...all]/route.ts` → Better Auth → Drizzle adapter →
better-sqlite3 → `data/tet.db`. A kliens oldal a `lib/auth-client.ts`-en
keresztül hívja ugyanezt a végpontot.

## Hibakezelés

- Hiányzó `BETTER_AUTH_SECRET`: Better Auth dev módban figyelmeztet, prod módban
  hibát dob. Nem írunk saját ellenőrzést.
- Hiányzó DB fájl: `db/index.ts` létrehozza a `data/` mappát; a táblákat a
  migráció hozza létre. Migráció nélkül a lekérdezések SQLite hibával buknak, ez
  elfogadott.
- Seed hiányzó env-vel: egyértelmű hibaüzenet, exit code 1.

## Ellenőrzés (definition of done)

1. `npm install` sikeres, nincs peer dep hiba.
2. `npm run db:generate` létrehozza a migrációt a `drizzle/` alatt.
3. `npm run db:migrate` létrehozza a `data/tet.db`-t a 4 auth táblával.
4. `npm run db:seed` létrehozza az admint; második futás nem duplikál.
5. `npm run build` hiba nélkül lefut (típusellenőrzés is).
6. Futó dev szerver mellett:
   - `POST /api/auth/sign-in/email` a seed adatokkal `200`, session cookie-val.
   - `GET /api/auth/get-session` a cookie-val visszaadja a usert, `role: 'admin'`.
   - `POST /api/auth/sign-up/email` elutasítva (regisztráció tiltva).
7. A meglévő demóoldalak és `lib/data.ts` változatlanok.

## Nem része ennek a lépésnek

- Login / logout UI, route-védelem, middleware.
- AppShell összekötése a valódi sessionnel.
- Domain táblák (posztok, riportok, ticketek) és a demóadatok migrálása.
- Tesztkeretrendszer bevezetése (a projektben jelenleg nincs; az ellenőrzés
  build + curl smoke teszt).
