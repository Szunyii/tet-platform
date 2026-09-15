# NIÜ · TéT Platform – Next.js dummy demó

Egyszerű Next.js (App Router, TypeScript) demóprojekt a „TéT Platform" design-doksi alapján.
A tudástár és a monitoring képernyő még statikus dummy adatokból dolgozik (`lib/data.ts`, `lib/knowledge.ts`); az auth, a felhasználó-kezelés, az országprofil (és a térkép), a riportok (információs bejegyzések) és a kommunikáció (ticketek) már valódi adatbázisból (lásd lent).

## Indítás

```bash
npm install
cp .env.example .env.local   # majd állítsd be a BETTER_AUTH_SECRET-et
npm run dev
```

A `data/tet.db` demó-adatbázis a repóban van (felhasználókkal és mintaprofilokkal, a belépési adatok a `.env.example` kommentjeiben), ezért nincs seedelés: a hosting is egy az egyben ezt kapja. Nulláról induló DB-hez: töröld a `data/tet.db`-t, majd `npm run db:migrate` és `npm run db:seed` (a seed a `.env.local` `SEED_ADMIN_*` értékeit használja). A DB commitolása előtt `sqlite3 data/tet.db "PRAGMA wal_checkpoint(TRUNCATE);"`, hogy a fő fájl teljes legyen (a `-wal`/`-shm` segédfájlok gitignore-oltak).

### Hosting (Hostinger Node.js)

- Környezeti változók: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (a publikus https cím) vagy `BETTER_AUTH_ALLOWED_HOSTS` (a domain), és **abszolút** `DATABASE_URL` a verziózott build-mappán kívül, pl. `/home/<user>/domains/<domain>/data/tet.db` – a Hostinger a buildet és a futást a `hbuilds/versions/<id>/nodejs` mappából végzi, relatív útvonallal ott egy üres adatbázis jönne létre („no such table: user").
- Build parancs: `npm run build` – ez előbb a `db:init`-et futtatja (ha a `DATABASE_URL` célfájlja még nincs, **vagy van, de nincs benne felhasználó** – pl. üresen létrehozott fájl vagy egy korábbi rossz útvonalú deploy üres adatbázisa –, a repó demó `data/tet.db`-jét másolja oda; a régit `tet.db.ures-<időbélyeg>` néven megtartja), majd `drizzle-kit migrate` és `next build`. Így az első deploy a demó-adatokat kapja, a későbbiek csak a sémát frissítik, az adatok megmaradnak.
- Indításkor a log `[db] <útvonal> – meglévő fájl` sort ír; ha „NINCSENEK TÁBLÁK" figyelmeztetés jön, a `DATABASE_URL` nem oda mutat, ahová a build tett.

Ezután nyisd meg: http://localhost:3000

### Adatbázis és auth

- Drizzle ORM + SQLite (`better-sqlite3`), DB fájl: `data/tet.db` (demó-adatokkal a repóban; csak a `-wal`/`-shm` van gitignore-olva)
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
| `/terkep` | Térkép és országprofil-kivonat a fejlécben választott ciklus évének nézetében (DB-s profilok, React + d3-geo világtérkép npm-ből, nagyítás és régió-gombok; Mutató-választó: kiemelt iparág, profil-állapot vagy számszerű mutató folytonos színskálával; iparág-szűrő; rangsor-panel; 2–4 ország összehasonlító táblája a térkép alatt; `?o=<kod>` előre kiválaszt) |
| `/orszagprofil/[kod]` | Teljes országprofil a fejlécben választott ciklus évére (`tet-ev` cookie); bárki olvashatja |
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
- `components/AppShell.tsx` – sidebar (menü, országprofil-állapot kártya, bejelentkezett felhasználó, kijelentkezés), fejléc (oldalcím, ciklusválasztó – a választott év `tet-ev` cookie-ban; a térkép, az országprofil és a szerkesztő is ezt az évet mutatja)
- `app/(app)/components/OldalsavAllapot.tsx` – az oldalsáv állapot-kártyája (attasé: saját ország, admin: darabszámok a választott ciklusra)
- `lib/terkep-mutatok.ts` – a térkép mutatói (színezés, rangsor, összehasonlítás), színskála, régiók
- `app/(app)/terkep/components/` – a térkép (`VilagTerkep`, d3-geo + world-atlas npm-ből), a rangsor-, kivonat- és összehasonlító panel

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
