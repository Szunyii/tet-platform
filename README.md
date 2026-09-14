# NIÜ · TéT Platform – Next.js dummy demó

Egyszerű Next.js (App Router, TypeScript) demóprojekt a „TéT Platform" design-doksi alapján.
A tudástár és a monitoring képernyő még statikus dummy adatokból dolgozik (`lib/data.ts`, `lib/knowledge.ts`); az auth, a felhasználó-kezelés, az országprofil (és a térkép), a riportok (információs bejegyzések) és a kommunikáció (ticketek) már valódi adatbázisból (lásd lent).

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
- Scriptek: `db:generate` (migráció generálás séma-változás után), `db:migrate`, `db:studio`, `db:seed`, `auth:generate` (auth séma újragenerálás a Better Auth config változásakor); egyszeri adat-átírás: `npx tsx scripts/orszag-kod-migracio.ts` (szabadszöveges országnév → ISO-kód a `user`, `riport`, `ticket` táblákban, idempotens)

### Bejelentkezés és felhasználók

- Minden oldal bejelentkezést kér (`proxy.ts` + `lib/session.ts`). Belépés: `/login`, a seed admin adataival.
- Admin a `/felhasznalok` oldalon hoz létre TéT attasé fiókokat (név, e-mail, kezdő jelszó, ország; opcionálisan főváros, terület km², pénznem, telefon, kapcsolattartási e-mail), szerkeszt, jelszót állít vissza, tilt és töröl. Nyilvános regisztráció nincs.
- Szerepkörök: `admin` (NIÜ) és `attase`; az attasé fiókon kötelező az ország (`user.orszag`, ISO 3166-1 alpha-2 kód a `lib/orszagok.ts` szótárból, a dialógusban listából választható), a poszt-adatok (főváros, terület, pénznem) csak attasénál tölthetők és adminra váltáskor törlődnek; telefon és kapcsolattartási e-mail mindkét szerepkörnél megadható.

## Képernyők

| Útvonal | Képernyő |
| --- | --- |
| `/` | Átirányítás az Országprofil (`/terkep`) képernyőre |
| `/terkep` | Térkép és országprofil-kivonat (DB-s profilok, d3-geo világtérkép; színezés kiemelt iparág vagy profil-állapot szerint, iparág-szűrő, `?o=<kod>` előre kiválaszt) |
| `/orszagprofil/[kod]` | Teljes országprofil, évválasztóval (`?ev=`); bárki olvashatja |
| `/orszagprofil/[kod]/szerkesztes` | Profil szerkesztése blokkonként (attasé: saját ország, idei év; admin: bármely ország, 2020-tól az idei évig) |
| `/riportok` | Információs bejegyzések listája szűrőkkel (attasé: saját, admin: mind) |
| `/riportok/[id]` | Bejegyzés részletei, csatolmány-letöltés |
| `/riportok/[id]/szerkesztes` | Bejegyzés szerkesztése |
| `/uj-riport` | Új bejegyzés (kategória, tárgy, leírás, kulcsszavak, rendezvény adatai, csatolmány) |
| `/kommunikacio` | Ticketek és üzenetszálak: az admin nyit ticketet egy attasénak, mindkét fél válaszol; `?t=<id>` a kiválasztott ticket, `?sz=` szűrő (`aktiv`/`magas`/`mind`) |
| `/tudastar` | Tudástár – Magyarországról ajánlható programok, partnerek, együttműködési formák |
| `/monitoring` | Hálózati rangsor + 14 szempontos részletes értékelés |
| `/login` | Bejelentkezés (email + jelszó) |
| `/felhasznalok` | Felhasználó-kezelés (csak admin) |

## Felépítés

- `lib/data.ts` – demóadatok a monitoringhoz: 14 poszt, 3 kategória, 14 értékelési szempont
- `lib/orszagok.ts` – országszótár (ISO-kód, magyar név, world-atlas térképnév, főváros koordinátája)
- `lib/orszagprofil-szotar.ts` – az országprofil blokkjai, opciólistái, címkéi és korlátai
- `components/orszagprofil/` – a profil olvasó nézet komponensei (`BlokkNezet`, jelvények)
- `app/(app)/orszagprofil/components/` – a blokkonkénti szerkesztő űrlapok
- `lib/knowledge.ts` – tudástár demóadatok: 6 program, 6 ökoszisztéma-elem, 5 együttműködési forma
- `lib/score.ts` – determinisztikus dummy pontszámok a monitoringhoz (a doksi logikája szerint)
- `lib/riport-szotar.ts` – kategóriák, kulcsszavak, csatolmány-limit
- `lib/ticket-szotar.ts` – ticket típusok, prioritások, státuszok, szűrők
- `components/riport/` – a bejegyzés űrlap, lista és részlet komponensei
- `app/(app)/kommunikacio/components/` – a ticketlista, beszélgetés, adatlap és új-ticket dialógus
- `components/form/` – megosztott form-minta (`useMuveletForm`, `MezoHiba`, `MuveletDialog`, `Mezo`, `SzamMezo`, `CimkeValaszto`, `NativeSelect`)
- `components/AppShell.tsx` – sidebar, fejléc (bejelentkezett felhasználó, kijelentkezés), ciklusválasztó (React context, az évek a DB országprofil-éveiből + aktuális év)
- `public/tet-world-map.js` – `<tet-world-map>` webkomponens (d3 + world-atlas, CDN-ről töltődik; az adatot és a színtáblákat JSON attribútumban kapja)

Megjegyzés: a térkép internetkapcsolatot igényel (d3, topojson és a world-atlas TopoJSON CDN-ről jön).

## Ismert korlátok / következő lépések

- A bejegyzés-lista lapozás nélküli: minden találat egy oldalon jelenik meg.
- A szabadszavas keresés SQLite `LIKE`, ami ékezetes nagybetűre nem kis-nagybetű-független
  (az „Ő" nem találja meg az „ő"-t); ékezet nélküli betűkre igen.
- A kategória-színek (`KATEGORIAK.szin`) világos módra készültek, nincs `dark:` párjuk.
- Felhasználó törlésekor a bejegyzései és a csatolmányaik is törlődnek (FK cascade);
  távozó attasénál ezért a tiltás a javasolt művelet, nem a törlés.
- Kommunikáció: nincs valós idejű frissítés (küldéskor és újratöltéskor frissül); a ticket nyitás
  után nem szerkeszthető és nem törölhető; az olvasatlan-jelzés szerep-alapú (két admin egymás
  üzeneteit nem látja olvasatlannak; szerepkör-váltásnál a régi üzenetek a régi szerepnél
  maradnak); a lista lapozás nélküli.
- Felhasználó törlésekor a hozzá címzett ticketek az üzeneteikkel együtt törlődnek (FK cascade);
  a törölt nyitó/szerző neve pillanatképként megmarad az üzeneteken.
- A Kommunikáció menü olvasatlan-számlálója kliens-oldali navigációnál a következő ticket-műveletig
  vagy teljes betöltésig késhet (a /kommunikacio oldal maga szinkronizálja).
# tet-platform
