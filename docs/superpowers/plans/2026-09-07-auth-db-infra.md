# Auth és adatbázis infrastruktúra – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drizzle ORM + SQLite (better-sqlite3) + Better Auth (Drizzle adapter, admin plugin) infrastruktúra a Next.js projektben, seed adminnal, UI nélkül.

**Architecture:** A `db/` mappa adja a Drizzle példányt és a sémát, a `lib/auth.ts` a Better Auth szerver példányt, ami a Drizzle adapteren át ugyanazt a DB-t használja. Az `app/api/auth/[...all]/route.ts` a Better Auth HTTP handlere. A seed script közvetlen Drizzle inserttel hozza létre az első admint, mert a nyilvános regisztráció tiltva van.

**Tech Stack:** Next.js 16 (App Router), TypeScript 7, drizzle-orm 0.45, drizzle-kit 0.31, better-sqlite3 12, better-auth 1.7, `auth` CLI (Better Auth séma-generátor), tsx.

**Spec:** `docs/superpowers/specs/2026-09-07-auth-db-infra-design.md`

**Ellenőrzés:** A projektben nincs tesztkeretrendszer, és a spec kizárja a bevezetését. Minden task végén parancsokkal ellenőrzünk (tsc, drizzle-kit, curl). Ne találj ki tesztkeretrendszert.

**Fontos API tények (better-auth 1.7.3, ellenőrizve):**
- Drizzle adapter: `import { drizzleAdapter } from 'better-auth/adapters/drizzle'`
- Admin plugin: `import { admin } from 'better-auth/plugins'`
- Next.js: `import { nextCookies, toNextJsHandler } from 'better-auth/next-js'`
- Jelszó hash: `import { hashPassword } from 'better-auth/crypto'` (async, string-et ad vissza)
- Kliens admin plugin: `import { adminClient } from 'better-auth/client/plugins'`
- CLI: `npx auth generate` (az `auth` npm csomag; a régi `@better-auth/cli` deprecated)
- Peer dep: better-auth a `better-sqlite3@^12` sort kéri, ezért NEM a 13-as verziót telepítjük.

---

## Fájlstruktúra

| Fájl | Művelet | Felelősség |
| --- | --- | --- |
| `package.json` | módosít | függőségek + `db:*`, `auth:generate` scriptek |
| `.gitignore` | módosít | `data/`, `*.db*`, `.env*.local` |
| `.env.example` | létrehoz | dokumentált env változók |
| `.env.local` | létrehoz | lokális értékek (nem commitolt) |
| `next.config.mjs` | módosít | `serverExternalPackages: ['better-sqlite3']` |
| `db/index.ts` | létrehoz | better-sqlite3 + Drizzle singleton |
| `db/schema/auth.ts` | létrehoz | Better Auth táblák (user, session, account, verification) |
| `db/schema/index.ts` | létrehoz | séma re-export |
| `drizzle.config.ts` | létrehoz | drizzle-kit konfig |
| `drizzle/` | generált | SQL migrációk, commitolva |
| `lib/auth.ts` | létrehoz | Better Auth szerver példány |
| `lib/auth-client.ts` | létrehoz | Better Auth kliens példány |
| `app/api/auth/[...all]/route.ts` | létrehoz | HTTP handler |
| `scripts/seed.ts` | létrehoz | első admin létrehozása |
| `README.md` | módosít | indítási lépések frissítése |

---

### Task 1: Függőségek telepítése és env fájlok

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Create: `.env.example`
- Create: `.env.local`

- [ ] **Step 1: Csomagok telepítése**

Run:
```bash
npm install drizzle-orm@^0.45.2 better-sqlite3@^12.11.1 better-auth@^1.7.3
npm install -D drizzle-kit@^0.31.10 @types/better-sqlite3@^9.6.0 tsx@^4.23.13
```
Expected: mindkettő `added N packages` sorral zárul, nincs `ERESOLVE` peer dep hiba. A better-sqlite3 natív bináris prebuild-ből töltődik (Node 22, darwin arm64), ha fordítani kezdene, az is rendben, csak lassabb.

- [ ] **Step 2: Telepítés ellenőrzése**

Run:
```bash
node -e "const D=require('better-sqlite3'); const d=new D(':memory:'); console.log(d.prepare('select sqlite_version() v').get())"
```
Expected: `{ v: '3.x.y' }` kiírás, hiba nélkül.

- [ ] **Step 3: .gitignore bővítése**

`.gitignore` végére fűzd hozzá:
```
# lokális adatbázis és titkok
data/
*.db
*.db-wal
*.db-shm
.env*.local
```

- [ ] **Step 4: .env.example létrehozása**

Fájl: `.env.example`
```
# SQLite fájl útvonala (projektgyökérhez relatív)
DATABASE_URL=./data/tet.db

# Better Auth – generáld: openssl rand -base64 32
BETTER_AUTH_SECRET=change-me-to-a-random-32-char-secret
BETTER_AUTH_URL=http://localhost:3000

# Seed admin (npm run db:seed)
SEED_ADMIN_EMAIL=admin@niu.hu
SEED_ADMIN_PASSWORD=change-me-min-8-chars
SEED_ADMIN_NAME=Sipos Katalin
```

- [ ] **Step 5: .env.local létrehozása valódi secret-tel**

Run:
```bash
SECRET=$(openssl rand -base64 32)
cat > .env.local <<ENV
DATABASE_URL=./data/tet.db
BETTER_AUTH_SECRET=$SECRET
BETTER_AUTH_URL=http://localhost:3000
SEED_ADMIN_EMAIL=admin@niu.hu
SEED_ADMIN_PASSWORD=Admin12345!
SEED_ADMIN_NAME=Sipos Katalin
ENV
git check-ignore .env.local
```
Expected: az utolsó parancs kiírja `.env.local` (tehát ignorálva van).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .gitignore .env.example
git commit -m "chore: drizzle, better-sqlite3, better-auth telepítése + env sablon"
```

---

### Task 2: Drizzle kapcsolat és konfig

**Files:**
- Create: `db/index.ts`
- Create: `db/schema/index.ts`
- Create: `drizzle.config.ts`
- Modify: `next.config.mjs`

- [ ] **Step 1: Séma index létrehozása (egyelőre üres re-export)**

Fájl: `db/schema/index.ts`
```ts
// Minden Drizzle tábla innen exportálódik. Az auth táblákat a Task 3 adja hozzá.
export {};
```

- [ ] **Step 2: DB singleton létrehozása**

Fájl: `db/index.ts`
```ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import * as schema from './schema';

const DB_PATH = resolve(process.cwd(), process.env.DATABASE_URL ?? './data/tet.db');

function createDb() {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  return drizzle(sqlite, { schema });
}

// Dev módban a Next HMR újratölti a modult; a globalThis cache megakadályozza,
// hogy minden reloadnál új kapcsolat nyíljon.
const globalForDb = globalThis as unknown as { __tetDb?: ReturnType<typeof createDb> };

export const db = globalForDb.__tetDb ?? createDb();
if (process.env.NODE_ENV !== 'production') globalForDb.__tetDb = db;

export type Db = typeof db;
```

- [ ] **Step 3: drizzle-kit konfig**

Fájl: `drizzle.config.ts`
```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './db/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? './data/tet.db',
  },
});
```

- [ ] **Step 4: Next konfig – natív modul kizárása a bundle-ből**

Fájl: `next.config.mjs` (teljes tartalom)
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
```

- [ ] **Step 5: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: nincs kimenet (0 hiba).

- [ ] **Step 6: Kapcsolat füstteszt**

Run:
```bash
npx tsx --env-file=.env.local -e "import { db } from './db'; console.log('ok', typeof db.select)"
ls data/
```
Expected: `ok function`, és a `data/` mappában megjelent a `tet.db` (üres DB, táblák még nincsenek).

- [ ] **Step 7: Commit**

```bash
git add db/index.ts db/schema/index.ts drizzle.config.ts next.config.mjs
git commit -m "feat(db): Drizzle + better-sqlite3 kapcsolat és drizzle-kit konfig"
```

---

### Task 3: Better Auth szerver példány és auth séma

**Files:**
- Create: `lib/auth.ts`
- Create: `db/schema/auth.ts`
- Modify: `db/schema/index.ts`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Better Auth konfig**

Fájl: `lib/auth.ts`
```ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins';
import { db } from '../db';
import * as schema from '../db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'sqlite', schema }),
  emailAndPassword: {
    enabled: true,
    // Belső rendszer: nincs nyilvános regisztráció. Felhasználót seed vagy admin hoz létre.
    disableSignUp: true,
  },
  plugins: [
    admin({
      defaultRole: 'attase',
      adminRoles: ['admin'],
    }),
    // A nextCookies-nak mindig az utolsó pluginnak kell lennie.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
```
Megjegyzés: relatív importok, mert a `auth` CLI és a tsx nem feltétlenül oldja fel az `@/` aliast.

- [ ] **Step 2: Scriptek hozzáadása a package.json-hoz**

`package.json` `scripts` blokk (teljes):
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio",
  "db:seed": "tsx --env-file=.env.local scripts/seed.ts",
  "auth:generate": "auth generate --config lib/auth.ts --output db/schema/auth.ts --yes"
}
```
Az `auth` CLI-t devDependency-ként telepítsd, hogy a script megtalálja:
```bash
npm install -D auth@^1.7.3
```

- [ ] **Step 3: Auth séma generálása a CLI-vel**

Run: `npm run auth:generate`
Expected: `db/schema/auth.ts` létrejön, benne `user`, `session`, `account`, `verification` táblák `sqliteTable`-lel. A `user` táblán van `role`, `banned`, `banReason`, `banExpires`; a `session` táblán `impersonatedBy`.

Ha a CLI hibával leáll (pl. nem tudja betölteni a configot), írd meg kézzel az alábbi tartalommal. Ez a referencia; ha a CLI ettől csak formázásban vagy oszlopnév-stílusban tér el, a CLI kimenetét tartsd meg.

Fájl: `db/schema/auth.ts` (kézi referencia)
```ts
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date())
    .notNull(),
  role: text('role'),
  banned: integer('banned', { mode: 'boolean' }).default(false),
  banReason: text('ban_reason'),
  banExpires: integer('ban_expires', { mode: 'timestamp_ms' }),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date())
    .notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  impersonatedBy: text('impersonated_by'),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date())
    .notNull(),
});
```

- [ ] **Step 4: Séma index frissítése**

Fájl: `db/schema/index.ts` (teljes tartalom, a korábbi `export {}` helyett)
```ts
export * from './auth';
```

- [ ] **Step 5: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: 0 hiba. Ha a `drizzleAdapter` `schema` paramétere típushibát ad, ellenőrizd, hogy a `db/schema/index.ts` tényleg exportálja a 4 táblát.

- [ ] **Step 6: Commit**

```bash
git add lib/auth.ts db/schema/auth.ts db/schema/index.ts package.json package-lock.json
git commit -m "feat(auth): Better Auth szerver példány Drizzle adapterrel és admin pluginnal"
```

---

### Task 4: Migráció generálása és alkalmazása

**Files:**
- Create: `drizzle/0000_*.sql` (generált)
- Create: `drizzle/meta/*` (generált)

- [ ] **Step 1: Migráció generálása**

Run: `npm run db:generate`
Expected: `drizzle/0000_<random-name>.sql` létrejön, benne 4 `CREATE TABLE` (`user`, `session`, `account`, `verification`) és 2 `CREATE UNIQUE INDEX` (`user_email_unique`, `session_token_unique`).

- [ ] **Step 2: Migráció tartalmának átnézése**

Run: `cat drizzle/0000_*.sql`
Expected: `user` táblában `role`, `banned`, `ban_reason`, `ban_expires` oszlopok; `session` táblában `impersonated_by`; `account` táblában `password`. Foreign key `user_id → user.id ON DELETE cascade` a `session` és `account` táblán.

- [ ] **Step 3: Migráció alkalmazása**

Run: `npm run db:migrate`
Expected: `[✓] migrations applied successfully!` vagy hasonló siker üzenet.

- [ ] **Step 4: Táblák ellenőrzése**

Run:
```bash
node -e "const D=require('better-sqlite3'); const d=new D('data/tet.db',{readonly:true}); console.log(d.prepare(\"select name from sqlite_master where type='table' order by name\").all().map(r=>r.name))"
```
Expected: `[ '__drizzle_migrations', 'account', 'session', 'user', 'verification' ]`

- [ ] **Step 5: Commit**

```bash
git add drizzle/
git commit -m "feat(db): kezdeti migráció – Better Auth táblák"
```

---

### Task 5: Auth HTTP handler és kliens

**Files:**
- Create: `app/api/auth/[...all]/route.ts`
- Create: `lib/auth-client.ts`

- [ ] **Step 1: Route handler**

Fájl: `app/api/auth/[...all]/route.ts`
```ts
import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '../../../../lib/auth';

export const { GET, POST } = toNextJsHandler(auth);
```

- [ ] **Step 2: Kliens példány**

Fájl: `lib/auth-client.ts`
```ts
import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

// Böngészőben használandó kliens. A baseURL alapból az aktuális origin,
// ezért lokálisan nem kell megadni.
export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export const { signIn, signOut, useSession } = authClient;
```

- [ ] **Step 3: Típusellenőrzés és build**

Run:
```bash
npx tsc --noEmit
npm run build
```
Expected: tsc 0 hiba; a build `✓ Compiled successfully` és a route listában megjelenik `ƒ /api/auth/[...all]`. Ha a build `better-sqlite3` bundling hibát ad, ellenőrizd a `next.config.mjs` `serverExternalPackages` beállítását (Task 2, Step 4).

- [ ] **Step 4: Commit**

```bash
git add app/api/auth lib/auth-client.ts
git commit -m "feat(auth): Better Auth Next.js route handler és React kliens"
```

---

### Task 6: Seed script

**Files:**
- Create: `scripts/seed.ts`

- [ ] **Step 1: Seed script megírása**

Fájl: `scripts/seed.ts`
```ts
import { hashPassword } from 'better-auth/crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { account, user } from '../db/schema';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Hiányzó környezeti változó: ${name} (lásd .env.example)`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const email = requireEnv('SEED_ADMIN_EMAIL').trim().toLowerCase();
  const password = requireEnv('SEED_ADMIN_PASSWORD');
  const name = requireEnv('SEED_ADMIN_NAME');

  if (password.length < 8) {
    console.error('SEED_ADMIN_PASSWORD legalább 8 karakter legyen.');
    process.exit(1);
  }

  const existing = db.select({ id: user.id }).from(user).where(eq(user.email, email)).get();
  if (existing) {
    console.log(`Admin már létezik, nincs teendő: ${email} (${existing.id})`);
    return;
  }

  const now = new Date();
  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  db.transaction((tx) => {
    tx.insert(user)
      .values({
        id: userId,
        name,
        email,
        emailVerified: true,
        role: 'admin',
        createdAt: now,
        updatedAt: now,
      })
      .run();
    tx.insert(account)
      .values({
        id: crypto.randomUUID(),
        userId,
        accountId: userId,
        providerId: 'credential',
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  });

  console.log(`Admin létrehozva: ${email} (${userId})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```
Miért közvetlen insert: a `disableSignUp` a `signUpEmail` API-t is tiltja, az admin plugin `createUser` végpontja pedig admin sessiont kér, ami az első adminnál még nincs. A `providerId: 'credential'` és `accountId = userId` a Better Auth email+jelszó konvenciója.

- [ ] **Step 2: Seed futtatása**

Run: `npm run db:seed`
Expected: `Admin létrehozva: admin@niu.hu (<uuid>)`

- [ ] **Step 3: Idempotencia ellenőrzése**

Run: `npm run db:seed`
Expected: `Admin már létezik, nincs teendő: admin@niu.hu (<ugyanaz az uuid>)`

- [ ] **Step 4: Hiányzó env ellenőrzése**

Run: `npx tsx scripts/seed.ts` (env fájl nélkül)
Expected: `Hiányzó környezeti változó: SEED_ADMIN_EMAIL (lásd .env.example)`, exit code 1. (Ellenőrzés: `echo $?` → `1`.)

- [ ] **Step 5: Commit**

```bash
git add scripts/seed.ts
git commit -m "feat(db): seed script az első admin felhasználóhoz"
```

---

### Task 7: Végpont-füstteszt és README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Dev szerver indítása háttérben**

Run: `npm run dev > /tmp/tet-dev.log 2>&1 &` majd várj, amíg a logban megjelenik `Ready` (kb. 3–5 mp): `sleep 5; grep -m1 Ready /tmp/tet-dev.log`
Expected: `✓ Ready in ...ms`

- [ ] **Step 2: Sign-in a seed adminnal**

Run:
```bash
curl -s -i -c /tmp/tet-cookies.txt -X POST http://localhost:3000/api/auth/sign-in/email \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://localhost:3000' \
  -d '{"email":"admin@niu.hu","password":"Admin12345!"}' | head -20
```
Expected: `HTTP/1.1 200`, a fejlécekben `set-cookie: better-auth.session_token=...`, a body-ban a user objektum `"email":"admin@niu.hu"`.

- [ ] **Step 3: Session lekérése**

Run:
```bash
curl -s -b /tmp/tet-cookies.txt http://localhost:3000/api/auth/get-session
```
Expected: JSON `session` és `user` kulcsokkal, a `user.role` értéke `"admin"`.

- [ ] **Step 4: Regisztráció tiltva**

Run:
```bash
curl -s -i -X POST http://localhost:3000/api/auth/sign-up/email \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://localhost:3000' \
  -d '{"email":"valaki@niu.hu","password":"Valaki12345!","name":"Valaki"}' | head -1
```
Expected: `HTTP/1.1 400` (Better Auth `SIGNUP_DISABLED` hiba). Ellenőrzés, hogy nem jött létre user:
```bash
node -e "const D=require('better-sqlite3'); const d=new D('data/tet.db',{readonly:true}); console.log(d.prepare('select count(*) c from user').get())"
```
Expected: `{ c: 1 }`

- [ ] **Step 5: Dev szerver leállítása**

Run: `kill %1` (vagy `pkill -f "next dev"`)

- [ ] **Step 6: README frissítése**

`README.md`-ben az „Indítás" blokkot cseréld erre:
```markdown
## Indítás

```bash
npm install
cp .env.example .env.local   # majd állítsd be a BETTER_AUTH_SECRET és SEED_ADMIN_* értékeket
npm run db:migrate           # létrehozza a data/tet.db-t a táblákkal
npm run db:seed              # első admin felhasználó a .env.local alapján
npm run dev
```

Ezután nyisd meg: http://localhost:3000

### Adatbázis és auth

- Drizzle ORM + SQLite (`better-sqlite3`), DB fájl: `data/tet.db` (gitignore-olva)
- Better Auth, Drizzle adapterrel; email + jelszó, nyilvános regisztráció tiltva; admin plugin (`role`: `admin` | `attase`)
- Séma: `db/schema/`, migrációk: `drizzle/`
- Scriptek: `db:generate` (migráció generálás séma-változás után), `db:migrate`, `db:studio`, `db:seed`, `auth:generate` (auth séma újragenerálás a Better Auth config változásakor)
```
Az első bekezdés „Minden adat statikus dummy adat (`lib/data.ts`), backend nincs." mondatát cseréld erre: „A képernyők adatai egyelőre statikus dummy adatok (`lib/data.ts`); az auth és az adatbázis-réteg már valódi (lásd lent)."

- [ ] **Step 7: Végső ellenőrzés és commit**

Run:
```bash
git status --short
npx tsc --noEmit
```
Expected: csak `README.md` módosult (és semmi `data/` vagy `.env.local` nem szerepel a listában); tsc 0 hiba.

```bash
git add README.md
git commit -m "docs: adatbázis és auth indítási lépések"
```
