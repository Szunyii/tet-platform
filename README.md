# NIÜ · TéT Platform – Next.js dummy demó

Egyszerű Next.js (App Router, TypeScript) demóprojekt a „TéT Platform" design-doksi alapján.
Az auth, a felhasználó-kezelés, az országprofil (és a térkép), a jelentések (információs bejegyzések), a kommunikáció (ticketek), a TéT Tudástár, a monitoring (az attasék félévi szakmai értékelése), a tevékenységek és eredmények és az éves munkaterv valódi adatbázisból dolgozik (lásd lent).

## Indítás

```bash
npm install
cp .env.example .env.local   # majd állítsd be a BETTER_AUTH_SECRET-et
npm run dev
```

Ezután nyisd meg: http://localhost:3000

A `data/tet.db` demó-adatbázis a repóban van (felhasználókkal és az attasék 27 országának és – hazai viszonyítási alapként – Magyarországnak a 2026-os profiljával – kutatott vázlat, `scripts/demo-orszagprofil.ts` –, valamint Japán 2025-ös Alapadatok blokkjával; a belépési adatok a `.env.example` kommentjeiben), ezért nincs seedelés: a hosting is egy az egyben ezt kapja. Nulláról induló DB-hez: töröld a `data/tet.db`-t, majd `npm run db:migrate` és `npm run db:seed` (a seed a `.env.local` `SEED_ADMIN_*` értékeit használja). A DB commitolása előtt `sqlite3 data/tet.db "PRAGMA wal_checkpoint(TRUNCATE);"`, hogy a fő fájl teljes legyen (a `-wal`/`-shm` segédfájlok gitignore-oltak).

### Hosting (Hostinger Node.js)

- Környezeti változók: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (a publikus https cím) vagy `BETTER_AUTH_ALLOWED_HOSTS` (a domain), és **abszolút** `DATABASE_URL` a verziózott build-mappán kívül, pl. `/home/<user>/domains/<domain>/data/tet.db` – a Hostinger a buildet és a futást a `hbuilds/versions/<id>/nodejs` mappából végzi, relatív útvonallal ott egy üres adatbázis jönne létre („no such table: user").
- Build parancs: `npm run build` – ez előbb a `db:init`-et futtatja (ha a `DATABASE_URL` célfájlja még nincs, **vagy van, de nincs benne felhasználó** – pl. üresen létrehozott fájl vagy egy korábbi rossz útvonalú deploy üres adatbázisa –, a repó demó `data/tet.db`-jét másolja oda; a régit `tet.db.ures-<időbélyeg>` néven megtartja), majd `drizzle-kit migrate` és `next build`. Így az első deploy a demó-adatokat kapja, a későbbiek csak a sémát frissítik, az adatok megmaradnak.
- A `next.config.mjs` `experimental.turbopackPluginRuntimeStrategy: 'workerThreads'` beállítása a Hostinger miatt kell: nélküle a Turbopack a PostCSS-t (Tailwind) külön node-folyamatban futtatja, amely a 127.0.0.1-en TCP-n kapcsolódna vissza, és a build a `globals.css`-nél „node process exited before we could connect to it with exit status: 0" hibával bukik.
- Indításkor a log `[db] <útvonal> – meglévő fájl` sort ír; ha „NINCSENEK TÁBLÁK" figyelmeztetés jön, a `DATABASE_URL` nem oda mutat, ahová a build tett.
- A demó attasék (`scripts/demo-attasek.ts`) a repó `data/tet.db`-jében vannak; egy már meglévő hosting-DB-be nem kerülnek be maguktól (a `db:init` csak hiányzó vagy felhasználó nélküli DB-t cserél). Kivétel az egyszeri csere (`scripts/db-init.mjs` `DEMO_CSERE`, jelenleg `2026-10-09`: a 27 ország és Magyarország profilja): az azonosító változása utáni első build a meglévő hosting-DB-t is lecseréli a repóéra, mert hPanel és SSH nélkül csak a build fér hozzá – a hostingon az előző csere óta történt minden változás (jelszócserék, új fiókok, bejegyzések, ticketek, profilmentések) elvész; a régi fájl `<db>.regi-<időbélyeg>` néven (a `-wal`/`-shm` párjával együtt) megmarad, és a `<db>.demo-csere-<azonosító>` jelölőfájl miatt a későbbi buildek már nem cserélnek. Ezen kívül két út van: (a) a hosting DB-fájl törlése, majd új build – a `db:init` a repó DB-jét másolja oda, **de a hosting minden adata (fiókok, bejegyzések, ticketek, profilok) elvész**; (b) a deploy (0006/0007) után a script futtatása a build-mappából, abszolút útvonallal: `DATABASE_URL=/home/<user>/domains/<domain>/data/tet.db DEMO_ATTASE_PASSWORD=… NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-attasek.ts` (a `[db]` sor mutatja a megnyitott fájlt; `DATABASE_URL` nélkül a futtatási mappa `./data/tet.db`-jébe írna, nem a hosting-DB-be). A script a két régi tesztfiókot (`teszt.attase@niu.hu`, `masodik.attase@niu.hu`) a bejegyzéseikkel és a nekik címzett ticketekkel együtt törli (FK cascade), a demó fiókok országait pedig minden futáskor a lista szerintire állítja vissza, a DE és US relációs vezetőséget is átveszi (Kindert Judit, dr. Nagy Gabriella), és valós attasés országokba is demó attasét tesz – előtte ments: `sqlite3 <db> ".backup '<db>.pre-demo'"`.
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

- A `0008`/`0009` migráció az országprofil `kapcsolatok` oszlopát két oszlopra osztja (`nemzetkozi_kapcsolatok`, `magyar_kapcsolatok`; a tartalom mezőnként átkerül), majd a régit törli – visszafordíthatatlan. A build ideje alatt a még futó régi verzió hibát ad mindenhol, ahol teljes profilsort olvas (térkép – ez a belépés utáni kezdőoldal is –, országprofil; adminnak az oldalsáv állapotkártyája miatt minden oldalon), mert a törölt oszlopot is lekérdezi; a már nyitva tartott szerkesztőben bármelyik blokk mentése is elbukik (az INSERT a tábla minden oszlopát felsorolja). Ha a `next build` elbukik, így is marad. A két migráció csak együtt mehet ki (egy build egy tranzakcióban futtatja őket): a `0008` egyszeri másolat, ezért ha csak az kerülne ki, a régi kóddal közben mentett 6. blokk a `0009`-cel elveszne. Ha a hosting-DB-ben valós adat van, deploy előtt ments (`sqlite3 <db> ".backup '<db>.pre-0008'"`); a visszaállítás a fenti módon megy, a `.pre-0008` fájlból (`sqlite3 <db> ".restore '<db>.pre-0008'"`). Mindez a csere nélküli DB-re vonatkozik: az egyszeri `DEMO_CSERE` buildjénél a `db:init` a már migrált demó DB-t másolja a hosting-DB helyére, ott a két migráció le sem fut, a még futó régi verzió pedig az átnevezett `<db>.regi-<időbélyeg>` fájlon dolgozik tovább (hibát csak újraindulás után ad), és a visszaállítás forrása is ez a fájl.

### Adatbázis és auth

- Drizzle ORM + SQLite (`better-sqlite3`), DB fájl: `data/tet.db` (demó-adatokkal a repóban; csak a `-wal`/`-shm` van gitignore-olva)
- Better Auth, Drizzle adapterrel; email + jelszó, nyilvános regisztráció tiltva; admin plugin (`role`: `admin` | `attase`)
- Séma: `db/schema/`, migrációk: `drizzle/`, auth végpont: `/api/auth/*`
- Scriptek: `db:generate` (migráció generálás séma-változás után), `db:migrate`, `db:studio`, `db:seed`, `auth:generate` (auth séma újragenerálás a Better Auth config változásakor); egyszeri adat-átírás: `npx tsx scripts/orszag-kod-migracio.ts` (szabadszöveges országnév → ISO-kód az `attase_orszag`, `riport`, `ticket` táblákban, idempotens); demó attasék: `scripts/demo-attasek.ts` (a 15 valós példa, idempotens – lásd a CLAUDE.md parancslistáját)

### Bejelentkezés és felhasználók

- Minden oldal bejelentkezést kér (`proxy.ts` + `lib/session.ts`). Belépés: `/login`, a seed admin adataival.
- Admin a `/felhasznalok` oldalon hoz létre TéT attasé fiókokat (név, e-mail, kezdő jelszó; székhely: ország, a poszt városa, részterület – pl. a lefedett tartományok –, relációs vezető jelölés; régiós lefedettség: további országok; opcionálisan telefon, kapcsolattartási e-mail), szerkeszt, jelszót állít vissza, tilt és töröl. Nyilvános regisztráció nincs.
- Szerepkörök: `admin` (NIÜ) és `attase`. Egy országban több attasé is lehet; közülük egy a relációs vezető, ő az országprofil felelőse és – az adminon kívül – egyedüli szerkesztője (egyszemélyes országban automatikus; ha több attasé marad vezető nélkül, a felhasználó-oldal figyelmeztet). Egy attasé regionálisan több országot is lefedhet; minden lefedett országára jelentést adhat be. A főváros, terület, pénznem az országprofil Alapadatok blokkjában van.

## Képernyők

| Útvonal | Képernyő |
| --- | --- |
| `/` | Átirányítás az Országprofil (`/terkep`) képernyőre |
| `/terkep` | Térkép és országprofil-kivonat a fejlécben választott ciklus évének nézetében (DB-s profilok, React + d3-geo világtérkép npm-ből, nagyítás és régió-gombok; Mutató-választó: kiemelt iparág, profil-állapot vagy számszerű mutató folytonos színskálával; iparág-szűrő; rangsor-panel; 2–4 ország összehasonlító táblája a térkép alatt; `?o=<kod>` előre kiválaszt) |
| `/orszagprofil/[kod]` | Teljes országprofil a fejlécben választott ciklus évére (`tet-ev` cookie); bárki olvashatja |
| `/orszagprofil/[kod]/szerkesztes` | Profil szerkesztése blokkonként (attasé: az az ország, amelynek relációs vezetője, idei év; admin: bármely ország, 2020-tól az idei évig) |
| `/jelentesek` | Információs bejegyzések listája szűrőkkel (attasé: saját, admin: mind, ország- és attasé-szűrővel); „Intézkedés” oszlop: a központ megtett intézkedése, amelyet az admin a listából is rögzíthet; adminnak „Minősítés” oszlop (a jelentés központi minősítése, soronkénti gyors minősítéssel) és „Minősítés” szűrő – az attasé a minősítést nem látja |
| `/jelentesek/[id]` | Bejegyzés részletei, csatolmány-letöltés, a központ „Megtett intézkedés” és „Központi minősítés” kártyája (az utóbbi csak adminnak); a szerző a saját rendezvény- vagy együttműködés-jelentéséből tevékenységet indíthat („Tevékenység rögzítése”) |
| `/jelentesek/[id]/szerkesztes` | Bejegyzés szerkesztése |
| `/uj-jelentes` | Új bejegyzés (több országos attasénál ország-választó; kategória, tárgy, vezetői összefoglaló, fő üzenet, kulcsszavak, rendezvény adatai, csatolmány) |
| `/kommunikacio` | Ticketek és üzenetszálak: az admin nyit ticketet egy vagy több attasénak (mindenkinek, régiónként vagy egyenként választva – címzettenként külön szál), mindkét fél válaszol; `?t=<id>` a kiválasztott ticket, `?sz=` szűrő (`aktiv`/`magas`/`mind`) |
| `/tevekenysegek` | Tevékenységek és eredmények (attasénak és adminnak). Attasé: a saját eredménytábla (négy szakasz-oszlop: Lehetőség, Kapcsolat, Együttműködés, Megállapodás; az utolsó kettőbe lépést a központ igazolja) és tevékenységnapló (delegáció, B2B-találkozó, partnerközvetítés); `?ful=`, `?felev=`, `?megszakadt=1`, és `?uj=tevekenyseg&riport=<id>` a jelentésből előtöltött új tevékenységhez. Admin: az igazolásra váró kérések (alapértelmezett fül), az összes eredmény és tevékenység `attase`/`regio`/`orszag`/`szakasz` szűrőkkel, kifogásolás |
| `/tevekenysegek/eredmeny/[id]` | Az ügy adatlapja: szakaszlánc, műveletek, kapcsolódó tevékenységek és jelentések, időrendi előzmények (attasé csak a sajátját nyithatja, másnak 404) |
| `/munkaterv` | Éves munkaterv (attasénak és adminnak; `?ev=`, a fejléc ciklusától független). Attasé: a saját terv (3–5 cél, köztük 1–2 központi; beküldés jóváhagyásra, célállapot, módosítás kérése). Admin: a központi célok kezelése és közzététele, az attasék terveinek áttekintése |
| `/munkaterv/[attaseId]` | Egy attasé terve (csak admin): jóváhagyás, visszaküldés, visszanyitás, a módosítási kérés elutasítása, célállapot-felülírás |
| `/tudastar` | TéT Tudástár nyitólap: a 9 kategória csempéje és keresés (`?q=`, ékezet- és kisbetű-független) |
| `/tudastar/[kategoria]` | Kategória-oldal: bevezető és a kártyák (intézmény, lista); admin: új kártya, ↑/↓ sorrend |
| `/tudastar/[kategoria]/[slug]` | Intézményi részletoldal (profil, kapcsolat, tevékenység, szakaszok, programok, linkek) |
| `/tudastar/[kategoria]/[slug]/szerkesztes`, `/tudastar/[kategoria]/uj?tipus=` | Kártya szerkesztése / új kártya (csak admin) |
| `/monitoring` | Az attasék félévi szakmai értékelésének hálózati nézete (csak admin): hőtérkép szűrőkkel (félév, régió, ország, attasé, szempont, minősítés), összesítő kártyák, a félév megnyitása, lezárása és újranyitása; az év a fejlécben választott ciklus, rangsor nincs |
| `/monitoring/[attaseId]` | Az attasé adatlapja a félévben (`?felev=`; csak admin): nyitott félévben minősítő munkalap (öt szempont és összminősítés, indoklással; attasé kihagyása a félévből), lezárt félévben összkép, idősor és szempontonkénti mutatók, bizonyítékok; a 2027/1-től a tevékenységek, az ügyek, az éves munkaterv és a jelentések minősítésének megoszlása is, a korábbi félévekben „Ehhez a félévhez nincs tevékenységi adat.” |
| `/login` | Bejelentkezés (email + jelszó) |
| `/felhasznalok` | Felhasználó-kezelés (csak admin) |

## Felépítés

- `lib/orszagok.ts` – országszótár (ISO-kód, magyar név, world-atlas térképnév, főváros koordinátája, régió)
- `lib/attase-orszag.ts` – attasé–ország hozzárendelés: típusok, vezető-szabályok tiszta segédei (a DB-oldal `db/queries/attase-orszag.ts`)
- `lib/orszagprofil-szotar.ts` – az országprofil blokkjai, opciólistái, címkéi és korlátai
- `components/orszagprofil/` – az országprofil jelvényei (`AllapotBadge`, `AgazatBadge`, közös színstílusuk a `SzinesBadge`) és a `SzerkesztesGomb` – a profil oldal és a térkép is használja
- `app/(app)/orszagprofil/components/` – a profil olvasó nézete (`BlokkNezet`, `AttaseLista`) és a szerkesztő blokkonkénti űrlapjai (`BlokkForm`, `mezok/`, `RendezvenySorok`; nem szerkeszthető évre a `NemSzerkeszthetoEv` kártya)
- `lib/tudastar-szotar.ts` – a TéT Tudástár 9 kategóriája, kártyatípusai, korlátai, közös felirat- és sorszabály-táblái és a normalizáló; a kártyák a `tudastar_kartya` táblában (`db/queries/tudastar.ts`), az oldalak és a szerkesztő az `app/(app)/tudastar/` alatt
- `lib/ertekeles-szotar.ts`, `lib/ertekeles-idoszak.ts`, `lib/ertekeles-mutatok.ts`, `lib/ertekeles-osszesites.ts`, `lib/ertekeles-szuro.ts`, `lib/ertekeles-validacio.ts`, `lib/ertekeles-megjelenites.ts` – a monitoring szótárai (szempontok, fokozatok és leírásuk), félév-logikája (a `bovitett_adatok` jelző és a `BOVITETT_ADATOK_ELSO_FELEV` is), automatikus mutatói (a bővített adatot gyűjtő félévnél a tevékenységi, eredmény- és munkaterv-mutatókkal, `verzio: 2`), összesítői, URL-szűrői, validátorai és megjelenítő segédei; a táblák (`ertekelesi_idoszak`, `attase_ertekeles`, `szempont_minosites`) lekérdezései a `db/queries/ertekeles.ts`-ben vannak
- `lib/tevekenyseg-szotar.ts`, `lib/tevekenyseg-allapot.ts`, `lib/tevekenyseg-validacio.ts`, `lib/tevekenyseg-jog.ts`, `lib/tevekenyseg-szuro.ts` – a tevékenységnapló és az eredmény-nyilvántartás szótárai, állapotgépe (szakaszváltás, igazolás, megszakítás), validátorai, jogosultsága és URL-szűrői; a táblák (`tevekenyseg`, `eredmeny`, `eredmeny_esemeny`) lekérdezései a `db/queries/tevekenyseg.ts`-ben vannak
- `app/(app)/tevekenysegek/components/` – az attasé nézet (eredménytábla, tevékenységtábla, párbeszédablakok) és az admin nézet (igazolási sor, listák, szűrők), az ügy adatlapja
- `lib/munkaterv-szotar.ts`, `lib/munkaterv-validacio.ts`, `lib/munkaterv-jog.ts`, `lib/munkaterv-szuro.ts` – az éves munkaterv szabályai (3–5 cél, 1–2 központi cél, állapotok), validátorai, jogosultsága és évválasztása; a táblák (`munkaterv_ev`, `kozponti_cel`, `munkaterv`, `munkaterv_cel`) lekérdezései a `db/queries/munkaterv.ts`-ben vannak
- `app/(app)/munkaterv/components/` – az attasé terve, a központi célok, az attasék tervének áttekintése és részlete
- `lib/riport-minosites.ts`, `db/schema/riport-minosites.ts`, `db/queries/riport-minosites.ts` – a jelentések központi minősítése (külön tábla, `riport_minosites`: csak admin nézet olvassa, az attasé nem kapja meg); a felülete (`MinositesSzerkeszto`, `MinositesDialog`, `MinositesFokusz`) az `app/(app)/jelentesek/components/` alatt van
- `app/(app)/monitoring/components/` – a hálózati nézet (hőtérkép, szűrők, összesítő kártyák, félév-műveletek) és az adatlap (munkalap, összkép, idősor) komponensei
- `scripts/demo-ertekeles.ts` – a monitoring kitalált tesztadatbázisa (`data/tet-ertekeles-teszt.db`, gitignore-olt; 15 kitalált attasé a valós hálózatnak nem posztot adó országokban, négy lezárt és egy nyitott félév; a 2025/1-től tevékenységekkel, eredményekkel és jelentésminősítésekkel, 2026-os és 2027-es munkatervekkel és központi célokkal): `NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-ertekeles.ts`, majd `DATABASE_URL=./data/tet-ertekeles-teszt.db npm run dev` (másik futó dev szerver nélkül, a Next lockfile miatt); lásd a CLAUDE.md „Monitoring és értékelés” bekezdését
- `lib/riport-szotar.ts` – kategóriák, kulcsszavak, csatolmány-limit
- `lib/ticket-szotar.ts` – ticket típusok, prioritások, státuszok, szűrők, a lista szűrős URL-je (`listaUrl`)
- `lib/ticket-cimzettek.ts` – a címzett-jelöltek régió-csoportjai az új ticket dialógushoz (`regioCsoportok`)
- `components/riport/` – a bejegyzés-űrlap közös komponensei (`RiportForm` és mezői; az új jelentés és a szerkesztés is használja)
- `app/(app)/jelentesek/components/` – a bejegyzés-lista, a szűrők, a részletoldal, a törlés és a „Megtett intézkedés” szerkesztője
- `app/(app)/kommunikacio/components/` – a ticketlista, beszélgetés, adatlap és új-ticket dialógus
- `components/form/` – megosztott form-minta (`useMuveletForm`, `useNyitas`, `MezoHiba`, `MuveletDialog`, `Mezo`, `SzamMezo`, `CimkeValaszto`, `CimkesSelect`, `NativeSelect`, `KuldGomb`)
- `components/app-shell/` – a shell: sidebar (`Oldalsav`: menü, országprofil-állapot kártya, bejelentkezett felhasználó, kijelentkezés), fejléc (`Fejlec`: oldalcím, ciklusválasztó – a választott év `tet-ev` cookie-ban; a térkép, az országprofil és a szerkesztő is ezt az évet mutatja), az összerakás és a context (`AppShell`, `AppContext`)
- `lib/navigacio.ts` – az útvonaltábla (`UTVONALAK`): a menüpontok és a fejléc címei egy helyen; a menüpont melletti teendő-számlálók (`MenuSzamlalo`, `szamlalo`) kulcsai, az értékeiket az `app/(app)/layout.tsx` adja (Tevékenységek és eredmények, Éves munkaterv)
- `app/(app)/components/OldalsavAllapot.tsx` – az oldalsáv állapot-kártyája (attasé: a saját országai, admin: darabszámok a választott ciklusra)
- `lib/terkep-mutatok.ts` – a térkép mutatói (színezés, rangsor, összehasonlítás), színskála, régiók
- `app/(app)/terkep/components/` – a térkép (`VilagTerkep`, d3-geo + world-atlas npm-ből), a rangsor-, kivonat- és összehasonlító panel

## Ismert korlátok / következő lépések

- A bejegyzés-lista lapozás nélküli: minden találat egy oldalon jelenik meg.
- A „Megtett intézkedés” jelentésenként egyetlen szöveg: a korábbi változatai nem őrződnek meg,
  és az attasé nem kap értesítést a rögzítéséről.
- A jelentések szabadszavas keresése SQLite `LIKE`, ami ékezetes nagybetűre nem kis-nagybetű-független
  (az „Ő" nem találja meg az „ő"-t); ékezet nélküli betűkre igen.
- A kategória-színek (`KATEGORIAK.szin`) világos módra készültek, nincs `dark:` párjuk.
- Felhasználó törlésekor a bejegyzései és a csatolmányaik is törlődnek (FK cascade);
  távozó attasénál ezért a tiltás a javasolt művelet, nem a törlés.
- Kommunikáció: nincs valós idejű frissítés (küldéskor és újratöltéskor frissül); a ticket nyitás
  után nem szerkeszthető és nem törölhető; az olvasatlan-jelzés szerep-alapú (két admin egymás
  üzeneteit nem látja olvasatlannak; szerepkör-váltásnál a régi üzenetek a régi szerepnél
  maradnak); a lista lapozás nélküli. A több címzettnek küldött ticket (körlevél) N külön sor a
  listában, és nem zárható le egy lépésben (ticketenként kell).
- Felhasználó törlésekor a hozzá címzett ticketek az üzeneteikkel együtt törlődnek (FK cascade);
  a törölt nyitó/szerző neve pillanatképként megmarad az üzeneteken.
- A Kommunikáció menü olvasatlan-számlálója kliens-oldali navigációnál a következő ticket-műveletig
  vagy teljes betöltésig késhet (a /kommunikacio oldal maga szinkronizálja).
- TéT Tudástár: a kártyák változástörténete nem őrződik meg; a kategória-oldal ↑/↓ gombja hibánál nem ad
  visszajelzést (a sorrend nem változik); `xl` (≈ 1280 px) alatt a kategória- és a részletoldalon nincs keresőmező
  (a nyitólapon van); kliens-oldali navigáció után a képernyőolvasó néha csak „TéT Tudástár”-t mond az új lapcím
  helyett (a Next a címet külön streameli, és a bemondás nem várja meg; a lap címe helyes).
- Monitoring és értékelés (az 1. és a 2. szakasz): az attasé az értékelését, a fokozatait és a jelentései minősítését nem látja, önértékelés, megjegyzés, export, nyomtatási nézet és értesítés nincs (3. szakasz). Az Eredmények szempontnak és a Kapcsolatépítés új mutatóinak csak a bővített adatot gyűjtő félévben (2027/1-től) van rendszeradata; a korábbi félévekben „Ehhez a félévhez nincs tevékenységi adat.” áll, nulla nem. A munkanap-számítás nem veszi figyelembe az ünnepnapokat. Fokozatot és összminősítést csak admin ad, rangsor nincs. Technikai zár nincs: valós attasékat csak akkor szabad értékelni, ha a 3. szakasz elkészült, az attasék tájékoztatást kaptak, megtörtént az adatvédelmi és munkajogi egyeztetés, és tisztázott a NIÜ hatásköre (terv: `docs/superpowers/specs/2026-11-18-monitoring-ertekeles-design.md`, 2. pont).
- Tevékenységek, eredmények, éves munkaterv: fájlfeltöltés az igazoláshoz, e-mail- vagy más értesítés és export nincs; az attasé a központ döntéséről (igazolás, visszaküldés, kifogás, a terv jóváhagyása) az oldalon értesül, a menüpont melletti számláló csak a teendőt jelzi (visszaküldött vagy kifogásolt tétel, visszaküldött terv). A két menü-számláló a layoutból jön: a saját műveletek után frissül, más felhasználó műveletét a kliens-oldali navigáció nem veszi észre (teljes újratöltésig). A munkaterven a központ megjegyzése és az attasé módosítási kérése egyetlen, felülíródó szöveg, az ügyeknél az időrendi előzmények megmaradnak. A jelentés minősítése jelentésenként egyetlen sor, a korábbi fokozatok nem őrződnek meg; a jelentéslista „Minősítés” szűrője a memóriában szűr (a lista nem lapoz), lapozás bevezetésekor a lekérdezésbe kell vinni.
- A repóban követett `data/tet.db` a 0014 migrációig migrált: a 0015–0017 (tevékenységek és eredmények, éves munkaterv, jelentésminősítés) a `npm run build` migrálásakor vagy a `npm run db:migrate` hatására kerül rá. Nem migrált adatbázison minden védett oldal hibát ad, mert a layout menü-számlálói az új táblákat olvassák. A három migráció csak új táblát és egy alapértékes oszlopot (`ertekelesi_idoszak.bovitett_adatok`) hoz, nem töröl és nem épít újra semmit, ezért a build ideje alatt a régi verzió tovább fut.
- Az attasé országainak vagy relációs vezetőségének admin-módosítása a jogosultság-ellenőrzésben
  azonnal érvényes, de az attasé oldalsávja és a térkép „Saját országprofil"/Szerkesztés gombja
  kliens-oldali navigációnál csak teljes újratöltés (vagy egy saját, layoutot frissítő művelet) után
  követi.
# tet-platform
