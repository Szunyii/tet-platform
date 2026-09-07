# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Mi ez

NIÜ TéT Platform: belső munkakörnyezet a TéT attasé hálózatnak (országprofil, riportok, ticketek, tudástár, monitoring). Next.js 16 App Router, React 19, TypeScript 7. A felület és minden szöveg magyar; a kód azonosítói vegyesen magyarok és angolok (pl. `orszag`, `attase`, `szempont`), ehhez igazodj.

A projekt átmeneti állapotban van: a képernyők még a `lib/data.ts` / `lib/knowledge.ts` statikus demóadataiból dolgoznak, de az adatbázis- és auth-réteg már valódi. A cél a demóadatok fokozatos kiváltása. Terv és spec: `docs/superpowers/`.

## Parancsok

```bash
npm run dev            # Next dev (Turbopack). Ha a 3000 foglalt, másik portot választ – nézd meg a kimenetet.
npm run build          # Production build, típusellenőrzéssel
npx tsc --noEmit       # Csak típusellenőrzés
npm run db:generate    # Drizzle migráció generálása séma-változás után (drizzle/ alá, commitolandó)
npm run db:migrate     # Migrációk alkalmazása a data/tet.db-re
npm run db:studio      # Drizzle Studio
npm run db:seed        # Első admin létrehozása a .env.local SEED_ADMIN_* értékeiből (idempotens)
npm run auth:generate  # db/schema/auth.ts újragenerálása, ha a lib/auth.ts Better Auth config változik
npx shadcn@latest add <név>   # shadcn/ui komponens hozzáadása a components/ui/ alá
```

Nincs tesztkeretrendszer és nincs linter. Ellenőrzés: `npx tsc --noEmit`, `npm run build`, és auth-változásnál curl a `/api/auth/*` végpontokra (a spec „Ellenőrzés" szakasza mutatja a pontos hívásokat).

Első indítás: `cp .env.example .env.local`, állítsd be a `BETTER_AUTH_SECRET`-et, majd `db:migrate` és `db:seed`. A `data/` mappa és a `.env.local` gitignore-olt.

## Architektúra

**Adatréteg.** `db/index.ts` egy better-sqlite3 + Drizzle singletont ad (`globalThis`-en cache-elve a dev HMR miatt, WAL mód, foreign key-ek bekapcsolva). A DB fájl útvonala `DATABASE_URL`, alapértelmezés `./data/tet.db`. Minden tábla a `db/schema/index.ts`-en át exportálódik; új domain tábla ide jön új fájlként. Migrációk: drizzle-kit, `drizzle/` mappa, commitolva. A better-sqlite3 natív modul, ezért `next.config.mjs`-ben `serverExternalPackages`-ben van, és a `db/index.ts` `resolve` hívása `turbopackIgnore`-ral van jelölve (enélkül a Turbopack az egész projektet a szerverbundle-be nyomkövetné).

**Auth.** `lib/auth.ts` a Better Auth szerver példány Drizzle adapterrel. Email + jelszó, **nyilvános regisztráció tiltva** (`disableSignUp`), admin plugin: role `admin` | `attase`, alapértelmezett `attase`. A `nextCookies` plugin mindig az utolsó a plugin-listában. HTTP végpont: `app/api/auth/[...all]/route.ts`. Kliens: `lib/auth-client.ts` (`authClient`, `signIn`, `signOut`, `useSession`) adminClient pluginnal. Felhasználót a seed vagy az admin plugin API-ja hoz létre; a `scripts/seed.ts` ezért közvetlen Drizzle inserttel dolgozik (`providerId: 'credential'`, `accountId = userId`, jelszó `better-auth/crypto` `hashPassword`-del).

A `lib/auth.ts` és a `scripts/seed.ts` **relatív importokat** használ (`../db`), mert az `auth` CLI és a tsx nem feltétlenül oldja fel az `@/` aliast. A többi kódban az alias is használható, de a meglévő fájlok relatív importot használnak.

**UI shell.** `app/layout.tsx` az egész appot `components/AppShell.tsx`-be csomagolja. Az AppShell egy React context-et ad (`useApp()`: `role`, `cycle` és setterei) – jelenleg ez a szerepkör- és ciklusváltó egy **kliens-oldali dummy kapcsoló**, nincs összekötve a Better Auth sessionnel. A sidebar `NAV` és a fejléc `TITLES` táblázata az AppShell-ben van; új oldalhoz mindkettőt bővíteni kell. A `/` a `/terkep`-re irányít.

**Demó pontszámlogika.** `lib/score.ts` determinisztikus dummy pontszámokat számol a poszt id és a szempont id alapján (`sc`, `avg`, `catAvg`, `blk`, `repStatusOf`, `reports`). A monitoring és riport képernyők erre épülnek; ha a riportok DB-be kerülnek, ezeket kell valódi lekérdezésre cserélni.

**Térkép.** `components/WorldMap.tsx` egy `<tet-world-map>` webkomponenst (`public/tet-world-map.js`, d3-geo + topojson) használ; a d3, topojson és a world-atlas CDN-ről töltődik, tehát internet kell hozzá. Az adatot JSON attribútumként kapja.

## Projektstruktúra és hová kerül az új kód

A további fejlesztések rendezetten, az alábbi helyekre kerüljenek. Ne halmozz mindent a `page.tsx`-be és ne rakj domain-logikát a `components/` alá.

| Mi | Hová | Megjegyzés |
| --- | --- | --- |
| Route belépési pont | `app/<route>/page.tsx` | Vékony: adatlekérés + layout összerakás. Nagy JSX-blokkokat komponensbe szervezz ki. |
| Server function-ök (form submit, mutáció) | `app/<route>/actions.ts` | `'use server'` a fájl tetején. Minden route-nak saját `actions.ts`-e van, a route-hoz tartozó összes server action ide kerül. Bemenetet ellenőrizz, session-t ellenőrizz, majd `db/queries` hívás. |
| Route-specifikus komponensek | `app/<route>/components/` | Csak az adott route használja. Ha másik route-nak is kell, költöztesd `components/` alá. |
| shadcn/ui alapkomponensek | `components/ui/` | Kizárólag a shadcn CLI-vel hozzáadott komponensek (`npx shadcn@latest add <név>`). Saját komponens ide nem kerül. A fájlok a projekt tulajdona, szükség esetén módosíthatók. |
| Megosztott komponensek | `components/<terület>/` | Több route-on használt, saját komponensek, alkönyvtárba rendezve (pl. `components/riport/`). A shadcn primitívekből épülnek. Az `AppShell.tsx` és a `WorldMap.tsx` már itt van. |
| DB táblák | `db/schema/<domain>.ts` | Domainenként egy fájl, `db/schema/index.ts`-ből re-exportálva. Utána `npm run db:generate`. |
| DB lekérdezések | `db/queries/<domain>.ts` | Szerver-oldali Drizzle lekérdezések és mutációk, domainenként. A page-ek és action-ök ezeket hívják, nem írnak közvetlen Drizzle kódot. |
| Tiszta segédfüggvények, típusok | `lib/` | Framework-független logika (formázás, számítás, auth helper). Nincs benne React és nincs benne DB hívás. |
| Egyszeri scriptek | `scripts/` | tsx-szel futtatva, relatív importokkal. |

Konvenciók:
- Egy fájl, egy felelősség. Ha egy komponens több száz sor, bontsd.
- Adatlekérés Server Componentben vagy `actions.ts`-ben történik; kliens komponens (`'use client'`) csak interaktivitáshoz, és propként kapja az adatot.
- Auth-ellenőrzés a szerver oldalon (page vagy action), soha nem csak a kliensen.
- Új route-nál az `AppShell.tsx` `NAV` és `TITLES` tábláját is bővítsd.

**UI és stílus.** A fő komponens-könyvtár a **shadcn/ui** (v4, `base-nova` stílus, Base UI primitívekre, `neutral` alapszín, CSS-változós téma, lucide ikonok; konfig: `components.json`). Új felületet shadcn komponensekből és Tailwind CSS v4 osztályokból építs; osztályokat a `cn()`-nel fűzz össze (`lib/utils.ts`, a shadcn hivatalos `cn` csomagja). Új komponens hozzáadása: `npx shadcn@latest add <név>`. Betűtípus: IBM Plex Sans / Mono (Google Fonts linkről a layoutban); a shadcn `--font-sans` / `--font-mono` változói a `globals.css`-ben erre vannak kötve, ezért ne húzd be a `next/font` Geist-et.

A **meglévő oldalak** még a régi módon készültek: inline `style` objektumok + globális osztályok az `app/globals.css`-ben (`.card`, `.card-h`, `.tbl`, `.up`, `.input`, `.mono`), hardcode-olt színekkel (`FIELD_COLORS`, `RISK_COLORS`, `PILL_COLORS` a `lib/score.ts`-ben). Ezeket nem kell tömegesen átírni; ha egy oldalhoz hozzányúlsz, az érintett részt vidd át shadcn-re, és a régi globális osztályokat ne szaporítsd. A Tailwind preflight `@layer base`-ben van, a régi rétegezetlen CSS felülírja, ezért a két stílusvilág egymás mellett működik.
