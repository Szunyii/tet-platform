# NIÜ · TéT Platform – Next.js dummy demó

Egyszerű Next.js (App Router, TypeScript) demóprojekt a „TéT Platform" design-doksi alapján.
A tudástár és a monitoring képernyő még statikus dummy adatokból dolgozik (`lib/data.ts`, `lib/knowledge.ts`); az auth, a felhasználó-kezelés, az országprofil (és a térkép), a riportok (információs bejegyzések) és a kommunikáció (ticketek) már valódi adatbázisból (lásd lent).

## Indítás

```bash
npm install
cp .env.example .env.local   # majd állítsd be a BETTER_AUTH_SECRET-et
npm run dev
```

Ezután nyisd meg: http://localhost:3000

A `data/tet.db` demó-adatbázis a repóban van (felhasználókkal és mintaprofilokkal, a belépési adatok a `.env.example` kommentjeiben), ezért nincs seedelés: a hosting is egy az egyben ezt kapja. Nulláról induló DB-hez: töröld a `data/tet.db`-t, majd `npm run db:migrate` és `npm run db:seed` (a seed a `.env.local` `SEED_ADMIN_*` értékeit használja). A DB commitolása előtt `sqlite3 data/tet.db "PRAGMA wal_checkpoint(TRUNCATE);"`, hogy a fő fájl teljes legyen (a `-wal`/`-shm` segédfájlok gitignore-oltak).

### Hosting (Hostinger Node.js)

- Környezeti változók: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (a publikus https cím) vagy `BETTER_AUTH_ALLOWED_HOSTS` (a domain), és **abszolút** `DATABASE_URL` a verziózott build-mappán kívül, pl. `/home/<user>/domains/<domain>/data/tet.db` – a Hostinger a buildet és a futást a `hbuilds/versions/<id>/nodejs` mappából végzi, relatív útvonallal ott egy üres adatbázis jönne létre („no such table: user").
- Build parancs: `npm run build` – ez előbb a `db:init`-et futtatja (ha a `DATABASE_URL` célfájlja még nincs, **vagy van, de nincs benne felhasználó** – pl. üresen létrehozott fájl vagy egy korábbi rossz útvonalú deploy üres adatbázisa –, a repó demó `data/tet.db`-jét másolja oda; a régit `tet.db.ures-<időbélyeg>` néven megtartja), majd `drizzle-kit migrate` és `next build`. Így az első deploy a demó-adatokat kapja, a későbbiek csak a sémát frissítik, az adatok megmaradnak.
- Indításkor a log `[db] <útvonal> – meglévő fájl` sort ír; ha „NINCSENEK TÁBLÁK" figyelmeztetés jön, a `DATABASE_URL` nem oda mutat, ahová a build tett.
- A demó attasék (`scripts/demo-attasek.ts`) a repó `data/tet.db`-jében vannak; egy már meglévő hosting-DB-be nem kerülnek be maguktól (a `db:init` csak hiányzó vagy felhasználó nélküli DB-t cserél). Két út van: (a) a hosting DB-fájl törlése, majd új build – a `db:init` a repó DB-jét másolja oda, **de a hosting minden adata (fiókok, bejegyzések, ticketek, profilok) elvész**; (b) a deploy (0006/0007) után a script futtatása a build-mappából, abszolút útvonallal: `DATABASE_URL=/home/<user>/domains/<domain>/data/tet.db DEMO_ATTASE_PASSWORD=… NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-attasek.ts` (a `[db]` sor mutatja a megnyitott fájlt; `DATABASE_URL` nélkül a futtatási mappa `./data/tet.db`-jébe írna, nem a hosting-DB-be). A script a két régi tesztfiókot (`teszt.attase@niu.hu`, `masodik.attase@niu.hu`) a bejegyzéseikkel és a nekik címzett ticketekkel együtt törli (FK cascade), a demó fiókok országait pedig minden futáskor a lista szerintire állítja vissza, a DE és US relációs vezetőséget is átveszi (Kindert Judit, dr. Nagy Gabriella), és valós attasés országokba is demó attasét tesz – előtte ments: `sqlite3 <db> ".backup '<db>.pre-demo'"`.
- A build előbb migrál, csak utána fordít: a `0007` migráció törli a `user` régi oszlopait (`orszag`, `fovaros`, `terulet`, `penznem`), ezért a build ideje alatt a még futó régi verzió a belépésre és minden bejelentkezett kérésre hibát ad (a régi Better Auth séma a törölt oszlopokat is lekérdezi), és ha a `next build` elbukik, így is marad. Csendes időszakban deployolj, és előbb helyben fusson le hibátlanul a `npm run build`.
- A 0006+0007 visszafordíthatatlan. A 0006 a régi `user.fovaros/terulet/penznem` értéket csak akkor viszi át, ha a `user.orszag` (szóközök nélkül) ISO-kód, és az országnak van mentett Alapadatok blokkja – ekkor az ország minden évének blokkjába, ahol a mező még üres; több attasés országban mezőnként az első nem üres érték (vezető, majd név szerint) kerül át. A 0007 utána törli a forrást, és a régi verzióra visszaállás DB-visszaállítás nélkül nem működik. Ha a hosting-DB-ben valós adat van, deploy előtt:
  1. mentés: `sqlite3 <db> ".backup '<db>.pre-0007'"`;
  2. a lenti lekérdezés felsorolja, kinek a poszt-adata nem kerülne át. Ha nem üres:
     - ahol a `user.orszag` nem ISO-kód, javítsd deploy előtt (a régi felhasználó-dialógusban az ország újraválasztásával, vagy SQL-lel), majd futtasd újra a lekérdezést (a javított ország is csak akkor kap adatot, ha van Alapadatok blokkja);
     - a többi sor kimenetét (az országnak nincs Alapadatok blokkja) mentsd el, és a deploy után vidd fel kézzel az új Alapadatok mezőkbe. Az adat a `.pre-0007` mentésben is megvan.
  ```sql
  SELECT u.email, u.orszag, u.fovaros, u.terulet, u.penznem FROM user u
  WHERE coalesce(u.role,'attase') <> 'admin'
    AND (coalesce(u.fovaros,'') <> '' OR u.terulet IS NOT NULL OR coalesce(u.penznem,'') <> '')
    AND NOT EXISTS (SELECT 1 FROM orszagprofil p WHERE p.orszag_kod = trim(u.orszag)
                    AND p.alapadatok IS NOT NULL AND json_valid(p.alapadatok));
  ```
  Ha a build a migrációnál bukik, a DB változatlan marad: a migrátor egy tranzakcióban fut, és mindent visszagörget, így a régi verzió fut tovább. A drizzle-kit ilyenkor üzenet nélkül áll le (`exit 1`). Az okot a hosting-DB egy másolatán – `sqlite3 <db> ".backup '<másolat>'"`-tal készítve, mert a sima `cp` a `-wal` tartalmát kihagyhatja – ez a parancs írja ki, a bukott új build mappájából futtatva (ott van a `node_modules` és a 0006/0007-et tartalmazó `drizzle/`). Hiba esetén a másolat nem változik; sikeres futásnál nincs kimenet, és a másolat migrálódik:
  `DATABASE_URL=<másolat> node -e "const D=require('better-sqlite3');const {drizzle}=require('drizzle-orm/better-sqlite3');const {migrate}=require('drizzle-orm/better-sqlite3/migrator');migrate(drizzle(new D(process.env.DATABASE_URL)),{migrationsFolder:'drizzle'})"`.

  Ha a hoston nincs `sqlite3` CLI, a build-mappából `node`-dal is megy – mentés vagy másolat: `node -e "require('better-sqlite3')(process.argv[1]).backup(process.argv[2]).then(()=>console.log('kész'))" <forrás> <cél>` (pl. `<db> <db>.pre-0007`); visszaállítás (futó app mellett is): ugyanez a parancs fordított argumentumokkal (`<db>.pre-0007 <db>`); a 2. pont lekérdezését ekkor a letöltött mentésen, helyben futtasd.

  Visszaállításra akkor van szükség, ha a migráció lefutott, de a `next build` elbukott (a régi verzió a megváltozott DB-n hibázik), vagy ha a régi verzióra kell visszaállni: `sqlite3 <db> ".restore '<db>.pre-0007'"` (futó app mellett is működik). Sima `cp`-vel ne: a futó app a `-wal`-ból továbbra is a migrált állapotot látja, és a checkpoint vissza is írja. A mentés óta beírt adatok elvesznek.

### Adatbázis és auth

- Drizzle ORM + SQLite (`better-sqlite3`), DB fájl: `data/tet.db` (demó-adatokkal a repóban; csak a `-wal`/`-shm` van gitignore-olva)
- Better Auth, Drizzle adapterrel; email + jelszó, nyilvános regisztráció tiltva; admin plugin (`role`: `admin` | `attase`)
- Séma: `db/schema/`, migrációk: `drizzle/`, auth végpont: `/api/auth/*`
- Scriptek: `db:generate` (migráció generálás séma-változás után), `db:migrate`, `db:studio`, `db:seed`, `auth:generate` (auth séma újragenerálás a Better Auth config változásakor); egyszeri adat-átírás: `npx tsx scripts/orszag-kod-migracio.ts` (szabadszöveges országnév → ISO-kód az `attase_orszag`, `riport`, `ticket` táblákban, idempotens); demó attasék: `scripts/demo-attasek.ts` (a 15 valós példa, idempotens – lásd a CLAUDE.md parancslistáját)

### Bejelentkezés és felhasználók

- Minden oldal bejelentkezést kér (`proxy.ts` + `lib/session.ts`). Belépés: `/login`, a seed admin adataival.
- Admin a `/felhasznalok` oldalon hoz létre TéT attasé fiókokat (név, e-mail, kezdő jelszó; székhely: ország, a poszt városa, részterület – pl. a lefedett tartományok –, relációs vezető jelölés; régiós lefedettség: további országok; opcionálisan telefon, kapcsolattartási e-mail), szerkeszt, jelszót állít vissza, tilt és töröl. Nyilvános regisztráció nincs.
- Szerepkörök: `admin` (NIÜ) és `attase`. Egy országban több attasé is lehet; közülük egy a relációs vezető, ő az országprofil felelőse és – az adminon kívül – egyedüli szerkesztője (egyszemélyes országban automatikus; ha több attasé marad vezető nélkül, a felhasználó-oldal figyelmeztet). Egy attasé regionálisan több országot is lefedhet; minden lefedett országára riportot adhat be. A főváros, terület, pénznem az országprofil Alapadatok blokkjában van.

## Képernyők

| Útvonal | Képernyő |
| --- | --- |
| `/` | Átirányítás az Országprofil (`/terkep`) képernyőre |
| `/terkep` | Térkép és országprofil-kivonat a fejlécben választott ciklus évének nézetében (DB-s profilok, React + d3-geo világtérkép npm-ből, nagyítás és régió-gombok; Mutató-választó: kiemelt iparág, profil-állapot vagy számszerű mutató folytonos színskálával; iparág-szűrő; rangsor-panel; 2–4 ország összehasonlító táblája a térkép alatt; `?o=<kod>` előre kiválaszt) |
| `/orszagprofil/[kod]` | Teljes országprofil a fejlécben választott ciklus évére (`tet-ev` cookie); bárki olvashatja |
| `/orszagprofil/[kod]/szerkesztes` | Profil szerkesztése blokkonként (attasé: az az ország, amelynek relációs vezetője, idei év; admin: bármely ország, 2020-tól az idei évig) |
| `/riportok` | Információs bejegyzések listája szűrőkkel (attasé: saját, admin: mind) |
| `/riportok/[id]` | Bejegyzés részletei, csatolmány-letöltés |
| `/riportok/[id]/szerkesztes` | Bejegyzés szerkesztése |
| `/uj-riport` | Új bejegyzés (több országos attasénál ország-választó; kategória, tárgy, leírás, kulcsszavak, rendezvény adatai, csatolmány) |
| `/kommunikacio` | Ticketek és üzenetszálak: az admin nyit ticketet egy attasénak, mindkét fél válaszol; `?t=<id>` a kiválasztott ticket, `?sz=` szűrő (`aktiv`/`magas`/`mind`) |
| `/tudastar` | Tudástár – Magyarországról ajánlható programok, partnerek, együttműködési formák |
| `/monitoring` | Hálózati rangsor + 14 szempontos részletes értékelés |
| `/login` | Bejelentkezés (email + jelszó) |
| `/felhasznalok` | Felhasználó-kezelés (csak admin) |

## Felépítés

- `lib/data.ts` – demóadatok a monitoringhoz: 14 poszt, 3 kategória, 14 értékelési szempont
- `lib/orszagok.ts` – országszótár (ISO-kód, magyar név, world-atlas térképnév, főváros koordinátája)
- `lib/attase-orszag.ts` – attasé–ország hozzárendelés: típusok, vezető-szabályok tiszta segédei (a DB-oldal `db/queries/attase-orszag.ts`)
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
- `app/(app)/components/OldalsavAllapot.tsx` – az oldalsáv állapot-kártyája (attasé: a saját országai, admin: darabszámok a választott ciklusra)
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
- Az attasé országainak vagy relációs vezetőségének admin-módosítása a jogosultság-ellenőrzésben
  azonnal érvényes, de az attasé oldalsávja és a térkép „Saját országprofil"/Szerkesztés gombja
  kliens-oldali navigációnál csak teljes újratöltés (vagy egy saját, layoutot frissítő művelet) után
  követi.
# tet-platform
