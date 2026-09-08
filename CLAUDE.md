# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Mi ez

NIÜ TéT Platform: belső munkakörnyezet a TéT attasé hálózatnak (országprofil, riportok, ticketek, tudástár, monitoring). Next.js 16 App Router, React 19, TypeScript 7. A felület és minden szöveg magyar; a kód azonosítói vegyesen magyarok és angolok (pl. `orszag`, `attase`, `szempont`), ehhez igazodj.

A projekt átmeneti állapotban van: a térkép, a kommunikáció, a tudástár és a monitoring még a `lib/data.ts` / `lib/knowledge.ts` demóadataiból dolgozik; a riportok (információs bejegyzések) és a felhasználók már DB-ből. A cél a demóadatok fokozatos kiváltása. Terv és spec: `docs/superpowers/`.

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

Nincs tesztkeretrendszer és nincs linter. Ellenőrzés: `npx tsc --noEmit`, `npm run build`, és auth-változásnál curl a `/api/auth/*` végpontokra (a spec „Ellenőrzés" szakasza mutatja a pontos hívásokat). Eldobható tsx script, ami `db/queries/*`-t vagy `lib/session.ts`-t importál: `NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_x.ts` (a `server-only` guard miatt). Headless böngészős ellenőrzés: `~/.claude/skills/gstack/browse/dist/browse goto/fill/click/text/js` (gstack).

Ha a `npm run build` típusellenőrzése nem létező `app/...` modulra panaszkodik, az a futó dev szerver elavult `.next/dev/types/validator.ts`-e (a `tsconfig.json` ezt is bevonja): könyvtár-átnevezés után bennragadhat a régi route. Megoldás: `rm .next/dev/types/validator.ts`, majd újra build – a forrásban nincs mit javítani.

Első indítás: `cp .env.example .env.local`, állítsd be a `BETTER_AUTH_SECRET`-et, majd `db:migrate` és `db:seed`. A `data/` mappa és a `.env.local` gitignore-olt.

## Architektúra

**Adatréteg.** `db/index.ts` egy better-sqlite3 + Drizzle singletont ad (`globalThis`-en cache-elve a dev HMR miatt, WAL mód, foreign key-ek bekapcsolva). A DB fájl útvonala `DATABASE_URL`, alapértelmezés `./data/tet.db`. Minden tábla a `db/schema/index.ts`-en át exportálódik; új domain tábla ide jön új fájlként. Migrációk: drizzle-kit, `drizzle/` mappa, commitolva. A better-sqlite3 natív modul, ezért `next.config.mjs`-ben `serverExternalPackages`-ben van, és a `db/index.ts` `resolve` hívása `turbopackIgnore`-ral van jelölve (enélkül a Turbopack az egész projektet a szerverbundle-be nyomkövetné).

**Auth.** `lib/auth.ts` a Better Auth szerver példány Drizzle adapterrel. Email + jelszó, **nyilvános regisztráció tiltva** (`disableSignUp`), admin plugin: role `admin` | `attase`, alapértelmezett `attase`. A `nextCookies` plugin mindig az utolsó a plugin-listában. HTTP végpont: `app/api/auth/[...all]/route.ts`. Kliens: `lib/auth-client.ts` (`authClient`, `signIn`, `signOut`, `useSession`) adminClient pluginnal. Felhasználót a seed vagy az admin plugin API-ja hoz létre; a `scripts/seed.ts` ezért közvetlen Drizzle inserttel dolgozik (`providerId: 'credential'`, `accountId = userId`, jelszó `better-auth/crypto` `hashPassword`-del). Session szerver oldalon: `lib/session.ts` (`getSession()` React.cache-ben, `requireSession()` → `/login`, `requireAdmin()` → 404); mindig `await`-eld, soha ne hívd `try/catch`-en belül. A `requireSession()` megőrzi a cél útvonalat: a proxy minden kérésre ráteszi az `x-pathname` fejlécet, ebből lesz a `/login?next=…` (a fejlécet a proxy felülírja, így a kliens nem hamisíthatja). A `?next=` építése és validálása mindkét ágon (proxy és session) a `lib/routes.ts` `loginUtvonal()` / `NEXT_MAX_LENGTH` közös helperében van. Route-védelem: `proxy.ts` (csak a cookie meglétét nézi, `/login` és `/api/auth` kivétel, nem GET kérést átenged) + `app/(app)/layout.tsx` `requireSession()`. A nem-GET átengedés miatt a body cookie nélkül is pufferelődik, ezért a `next.config.mjs`-ben a `proxyClientMaxBodySize` is 50 MB: ennek együtt kell mozognia a `serverActions.bodySizeLimit`-tel, különben a proxy NÉMÁN csonkolja a nagy multipart POST-ot. A `user.orszag` mező (`additionalFields`, `input: false`) az attasé posztjának országa; az admin plugin `roles` mappel (`admin`, `attase`) fut. Kijelentkezés: `app/(app)/actions.ts` `logoutAction` (server action, `revalidatePath('/', 'layout')`). Felhasználó-kezelés: `/felhasznalok` (csak admin), `app/(app)/felhasznalok/`.

A `lib/auth.ts` és a `scripts/seed.ts` **relatív importokat** használ (`../db`), mert az `auth` CLI és a tsx nem feltétlenül oldja fel az `@/` aliast. A többi kódban az alias is használható, de a meglévő fájlok relatív importot használnak.

**UI shell.** A védett oldalak az `app/(app)/` route groupban vannak (`terkep`, `riportok`, `uj-riport`, `kommunikacio`, `tudastar`, `monitoring`, `felhasznalok`); az `app/(app)/layout.tsx` `requireSession()`-t hív és a `components/AppShell.tsx`-nek propként adja a usert (`user: AppSession`) és a `logoutAction`-t. A `/login` a gyökér layout alatt, AppShell nélkül renderelődik; 404-ből kettő van: `app/not-found.tsx` (gyökér, AppShell nélkül) és `app/(app)/not-found.tsx` (a shellen belül – ide fut a `requireAdmin()`). Az AppShell context-je (`useApp()`: `user`, `cycle`, `setCycle`) csak a provideren belül használható; a `cycle` váltó még kliens-oldali demó. A sidebar `NAV` (admin-only menüpont: `adminOnly`, csak megjelenítés) és a fejléc `TITLES` táblázata az AppShell-ben van; új oldalhoz mindkettőt bővíteni kell. Fix célpontok: `lib/routes.ts` (`HOME_ROUTE`, `LOGIN_ROUTE`); a `/` a `/terkep`-re irányít.

**Riportok.** Információs bejegyzések: `db/schema/riport.ts` (`riport` + `riport_csatolmany`, a fájl blobban), `db/queries/riport.ts`, szótárak `lib/riport-szotar.ts` (`KATEGORIAK` – benne `rovid` és `szin`, az ikon a komponensben –, `KULCSSZAVAK`, `CSATOLMANY_LIMIT`: 5 fájl × 8 MB), validátor `lib/riport-validacio.ts`, jogosultság `lib/riport-jog.ts` (attasé: saját, admin: mind). Route-ok: `app/(app)/uj-riport` (form + `createRiportAction`), `app/(app)/riportok` (lista, URL-szűrők `lib/riport-szuro.ts`), `[id]` (részlet), `[id]/szerkesztes`; csatolmány-letöltés `app/api/riport/csatolmany/[id]`.

Közös segédek: `lib/urlap.ts` (`MezoHibak` típus, `tisztitSzoveg`/`mezo` – láthatatlan és vezérlőkarakterek szűrése, a szerver-oldali validátorok közös alapja), `lib/datum.ts` (`IDOZONA` = Europe/Budapest, `napKezdete`/`kovetkezoNapKezdete` a dátumszűrő nap-határaihoz, `ervenyesNaptariDatum`, `formatNaptariDatum` – string-alapú, hogy a tárolt naptári nap ne csússzon időzónával). Form-minta `components/form/`: `useMuveletForm` (`useActionState` + opcionális siker-toast + `onKesz` + `unstable_rethrow`, fókusz az első hibás mezőre – a mező `id`-ja a hiba kulcsa), `MezoHiba`/`hibaAttr`, `FormAction` és `MuveletState` típusok. A route-komponensek `components/riport/` alatt (`RiportForm`, `KategoriaValaszto`, `KulcsszoValaszto`, `EsemenyMezok`, `CsatolmanyMezo`, `RiportTabla`, `RiportSzurok`, `RiportReszlet`, `RiportTorles`, `KategoriaBadge`).

Amire figyelni kell:
- Jogosultsági hiba mindenhol **404** (page-ek és a csatolmány-route is), hogy ne áruljuk el a bejegyzés létét; a letöltő route 401-et csak elavult/érvénytelen cookie-nál ad (a proxy cookie nélkül már a loginra irányít).
- A csatolmány-letöltés sorrendje **meta → jog → blob** (`getCsatolmanyMeta`, `getRiport` + `canViewRiport`, csak utána `getCsatolmany`), hogy a nagy blob ne olvasódjon be jogosulatlan kérésre. `Content-Disposition`: RFC 5987 `filename*` + ASCII `filename` fallback.
- A törlés kliensből hívott, bind-olt server action (`deleteRiportAction`), `unstable_rethrow`-val: a sikeres törlés `redirect()`-je nem hiba.
- A `Collapsible` (opcionális szekció) `keepMounted`: becsukva is a DOM-ban marad, különben a benne lévő mezők nem küldődnének be.
- A React server action üres file-inputnál `"undefined"` nevű, 0 méretű `File`-helykitöltőt küld; a validátor ezt (és az üres nevűt) kiszűri.
- Link gombként: `Link` + `buttonVariants()` a `className`-ben, **nem** `Button render={<Link/>}` – a Base UI `Button` natív `<button>`-t vár.
- A részletoldal `metadata`-ja szándékosan statikus („Bejegyzés"): a `generateMetadata` külön jog-ellenőrzés nélkül kiszivárogtatná az idegen bejegyzés tárgyát.
- A `serverActions.bodySizeLimit` és a `proxyClientMaxBodySize` is 50 MB a csatolmányok miatt (lásd az Auth bekezdést).

**Demó pontszámlogika.** `lib/score.ts` determinisztikus dummy pontszámokat számol a poszt id és a szempont id alapján (`sc`, `avg`, `catAvg`). A monitoring képernyő erre épül; ha valódi értékelés kerül a DB-be, ezt kell lekérdezésre cserélni.

**Térkép.** `components/WorldMap.tsx` egy `<tet-world-map>` webkomponenst (`public/tet-world-map.js`, d3-geo + topojson) használ; a d3, topojson és a world-atlas CDN-ről töltődik, tehát internet kell hozzá. Az adatot JSON attribútumként kapja.

## Projektstruktúra és hová kerül az új kód

A további fejlesztések rendezetten, az alábbi helyekre kerüljenek. Ne halmozz mindent a `page.tsx`-be és ne rakj domain-logikát a `components/` alá.

| Mi | Hová | Megjegyzés |
| --- | --- | --- |
| Route belépési pont | `app/(app)/<route>/page.tsx` | Védett oldal (a `/login` a gyökérben marad). Vékony: adatlekérés + layout összerakás. Nagy JSX-blokkokat komponensbe szervezz ki. |
| Server function-ök (form submit, mutáció) | `app/(app)/<route>/actions.ts` | `'use server'` a fájl tetején. Minden route-nak saját `actions.ts`-e van, a route-hoz tartozó összes server action ide kerül. Bemenetet ellenőrizz, session-t ellenőrizz, majd `db/queries` hívás. |
| Route-specifikus komponensek | `app/(app)/<route>/components/` | Csak az adott route használja. Ha másik route-nak is kell, költöztesd `components/` alá. |
| shadcn/ui alapkomponensek | `components/ui/` | Kizárólag a shadcn CLI-vel hozzáadott komponensek (`npx shadcn@latest add <név>`). Saját komponens ide nem kerül. A fájlok a projekt tulajdona, szükség esetén módosíthatók. |
| Megosztott komponensek | `components/<terület>/` | Több route-on használt, saját komponensek, alkönyvtárba rendezve (pl. `components/riport/`). A shadcn primitívekből épülnek. Az `AppShell.tsx` és a `WorldMap.tsx` már itt van. |
| DB táblák | `db/schema/<domain>.ts` | Domainenként egy fájl, `db/schema/index.ts`-ből re-exportálva. Utána `npm run db:generate`. |
| DB lekérdezések | `db/queries/<domain>.ts` | Szerver-oldali Drizzle lekérdezések és mutációk, domainenként. A page-ek és action-ök ezeket hívják, nem írnak közvetlen Drizzle kódot. |
| Tiszta segédfüggvények, típusok | `lib/` | Framework-független logika (formázás, számítás, auth helper). Nincs benne React és nincs benne DB hívás. Kivétel: `lib/auth.ts` és `lib/session.ts` a szerver-oldali auth réteg (Next és DB függő), ezek tudatosan itt vannak. |
| Egyszeri scriptek | `scripts/` | tsx-szel futtatva, relatív importokkal. |

Konvenciók:
- Egy fájl, egy felelősség. Ha egy komponens több száz sor, bontsd.
- Adatlekérés Server Componentben vagy `actions.ts`-ben történik; kliens komponens (`'use client'`) csak interaktivitáshoz, és propként kapja az adatot.
- Auth-ellenőrzés a szerver oldalon (page vagy action), soha nem csak a kliensen.
- Új route-nál az `AppShell.tsx` `NAV` és `TITLES` tábláját is bővítsd.

**UI és stílus.** A fő komponens-könyvtár a **shadcn/ui** (v4, `base-nova` stílus, Base UI primitívekre, `neutral` alapszín, CSS-változós téma, lucide ikonok; konfig: `components.json`). Új felületet shadcn komponensekből és Tailwind CSS v4 osztályokból építs; osztályokat a `cn()`-nel fűzz össze (`lib/utils.ts`, a shadcn hivatalos `cn` csomagja). Új komponens hozzáadása: `npx shadcn@latest add <név>`. Betűtípus: IBM Plex Sans / Mono (Google Fonts linkről a layoutban); a shadcn `--font-sans` / `--font-mono` változói a `globals.css`-ben erre vannak kötve, ezért ne húzd be a `next/font` Geist-et.

A **meglévő oldalak** még a régi módon készültek: inline `style` objektumok + globális osztályok az `app/globals.css`-ben (`.card`, `.card-h`, `.tbl`, `.up`, `.input`, `.mono`), hardcode-olt színekkel (`FIELD_COLORS` a `lib/data.ts`-ben, `RISK_COLORS` és `PILL_COLORS` a `lib/score.ts`-ben). Ezeket nem kell tömegesen átírni; ha egy oldalhoz hozzányúlsz, az érintett részt vidd át shadcn-re, és a régi globális osztályokat ne szaporítsd. A Tailwind preflight `@layer base`-ben van, a régi rétegezetlen CSS felülírja, ezért a két stílusvilág egymás mellett működik.
