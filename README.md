# NIÜ · TéT Platform – Next.js dummy demó

Egyszerű Next.js (App Router, TypeScript) demóprojekt a „TéT Platform" design-doksi alapján.
A térkép, a kommunikáció, a tudástár és a monitoring képernyő még statikus dummy adatokból dolgozik (`lib/data.ts`, `lib/knowledge.ts`); az auth, a felhasználó-kezelés és a riportok (információs bejegyzések) már valódi adatbázisból (lásd lent).

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
- Séma: `db/schema/`, migrációk: `drizzle/`, auth végpont: `/api/auth/*`
- Scriptek: `db:generate` (migráció generálás séma-változás után), `db:migrate`, `db:studio`, `db:seed`, `auth:generate` (auth séma újragenerálás a Better Auth config változásakor)

### Bejelentkezés és felhasználók

- Minden oldal bejelentkezést kér (`proxy.ts` + `lib/session.ts`). Belépés: `/login`, a seed admin adataival.
- Admin a `/felhasznalok` oldalon hoz létre TéT attasé fiókokat (név, e-mail, kezdő jelszó, ország), szerkeszt, jelszót állít vissza, tilt és töröl. Nyilvános regisztráció nincs.
- Szerepkörök: `admin` (NIÜ) és `attase`; az attasé fiókon kötelező az ország (`user.orszag`).

## Képernyők

| Útvonal | Képernyő |
| --- | --- |
| `/` | Átirányítás az Országprofil (`/terkep`) képernyőre |
| `/terkep` | Térkép és országprofil (d3-geo világtérkép, kattintható posztok) |
| `/riportok` | Információs bejegyzések listája szűrőkkel (attasé: saját, admin: mind) |
| `/riportok/[id]` | Bejegyzés részletei, csatolmány-letöltés |
| `/riportok/[id]/szerkesztes` | Bejegyzés szerkesztése |
| `/uj-riport` | Új bejegyzés (kategória, tárgy, leírás, kulcsszavak, rendezvény adatai, csatolmány) |
| `/kommunikacio` | Ticketek és üzenetszálak |
| `/tudastar` | Tudástár – Magyarországról ajánlható programok, partnerek, együttműködési formák |
| `/monitoring` | Hálózati rangsor + 14 szempontos részletes értékelés |
| `/login` | Bejelentkezés (email + jelszó) |
| `/felhasznalok` | Felhasználó-kezelés (csak admin) |

## Felépítés

- `lib/data.ts` – demóadatok: 14 poszt, 3 kategória, 14 értékelési szempont, ticketek
- `lib/knowledge.ts` – tudástár demóadatok: 6 program, 6 ökoszisztéma-elem, 5 együttműködési forma
- `lib/score.ts` – determinisztikus dummy pontszámok és státusz-színek (a doksi logikája szerint)
- `lib/riport-szotar.ts` – kategóriák, kulcsszavak, csatolmány-limit
- `components/riport/` – a bejegyzés űrlap, lista és részlet komponensei
- `components/form/` – megosztott form-minta (`useMuveletForm`, `MezoHiba`)
- `components/AppShell.tsx` – sidebar, fejléc (bejelentkezett felhasználó, kijelentkezés), ciklusváltó (React context)
- `public/tet-world-map.js` – `<tet-world-map>` webkomponens (d3 + world-atlas, CDN-ről töltődik)

Megjegyzés: a térkép internetkapcsolatot igényel (d3, topojson és a world-atlas TopoJSON CDN-ről jön).

## Ismert korlátok / következő lépések

- A bejegyzés-lista lapozás nélküli: minden találat egy oldalon jelenik meg.
- A szabadszavas keresés SQLite `LIKE`, ami ékezetes nagybetűre nem kis-nagybetű-független
  (az „Ő" nem találja meg az „ő"-t); ékezet nélküli betűkre igen.
- A kategória-színek (`KATEGORIAK.szin`) világos módra készültek, nincs `dark:` párjuk.
- Felhasználó törlésekor a bejegyzései és a csatolmányaik is törlődnek (FK cascade);
  távozó attasénál ezért a tiltás a javasolt művelet, nem a törlés.
# tet-platform
