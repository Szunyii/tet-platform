# Attasé–ország hozzárendelés (több attasé országonként, relációs vezető, régiós lefedettség) – tervezési spec

Dátum: 2026-10-06
Állapot: jóváhagyva

## Cél

A felhasználó-kezelőben (`/felhasznalok`) az attasé és az ország kapcsolata több-több lesz:

- egy országban több attasé is dolgozhat; közülük egy a **relációs vezető**, aki az
  országprofil felelőse és egyedüli (attasé) szerkesztője;
- az attasénak egy **székhelye** van (ország + a poszt városa, pl. Stuttgart), és az
  országon belül **részterülete** lehet (pl. a lefedett tartományok vagy államok listája);
- egy attasé **regionálisan** további országokat is lefedhet (pl. Párizsból Algéria,
  Marokkó, Mauritánia, Tunézia).

Ma egyetlen `user.orszag` kód van, és erre épül a profil-szerkesztési jog, a riport és a
ticket országa, a térkép attasé-neve, az oldalsáv-kártya és a fejléc. Ezek mind az új
modellre állnak át.

## Döntések

| Kérdés | Döntés | Indok |
| --- | --- | --- |
| Mit jelent a „terület” | Országon belüli földrajzi részterület, szabad szöveg (pl. a lefedett tartományok listája) | A felhasználó döntése. |
| Mire jogosít a relációs vezető | Ő az országprofil felelőse: attasék közül csak ő szerkeszti (az admin továbbra is bármit) | A felhasználó döntése. A többi attasé olvassa a profilt és riportot ad be. |
| Regionális lefedettség | Székhely + régiós országok; a felület jelzi a régiós lefedettséget | A felhasználó döntése; a jogok országonként azonosak, a vezető-szabály országonként él. |
| Poszt-adatok (főváros, terület km², pénznem) | Az országprofil `Alapadatok` blokkjába kerülnek, a felhasználóról törlődnek | Ezek országadatok, nem a felhasználóé; több attasé / több ország mellett a felhasználón nem értelmezhetők. |
| Adatmodell | Új kapcsolótábla: `attase_orszag` | Részleges egyedi indexek garantálják az egyediséget; a térkép és a profil joinnal kérdez. |
| Poszt városa | A székhely-sor `varos` mezője (opcionális) | A valós példákban minden attasénak van városa, és egy országon belül ez különbözteti meg őket. |
| Részterület | Csak a székhelynél, szövegdoboz, ≤ 1000 karakter | A valós példák tartomány- és államlisták (az USA-lista kb. 450 karakter); a régiós országokat mindig egészben fedik le. |
| Vezető kijelölése | Jelölő a felhasználó dialógusában, átvétellel; egyszemélyes országban automatikus | A felhasználó-kezelőben kérte a felhasználó; egyszemélyes országban nincs mit eldönteni. |
| Ticket országa | A címzett székhely-országa (pillanatkép) | A ticket a személynek szól; a felület eddig is a címzett országát mutatta. |
| Riport országa | Több ország esetén az attasé választ a saját országai közül (alapérték: székhely) | A riport egy országról szól; a régiós ország is lehet téma. |
| Demó adat | A 15 valós attasé bekerül a repó `data/tet.db`-jébe; a két tesztfiók (KR, JP) törlődik a demó riportokkal és ticketekkel együtt | A felhasználó döntése. |

## Hatókörön kívül

- A részterület térképes megjelenítése (tartomány-/államhatárok); a pin marad a főváros
  koordinátáján.
- A vezető bővebb riport-láthatósága (a többi attasé riportjai).
- Külön, országközpontú „Relációk” admin oldal.
- A profil átmásolása az előző évből; blokkonkénti szerző.
- A seed (`scripts/seed.ts`) módosítása – az csak az első admint hozza létre.

## Adatmodell

### `attase_orszag` tábla (`db/schema/attase-orszag.ts`, re-export a `db/schema/index.ts`-ből)

| Mező (Drizzle) | Oszlop | Típus | Szabály |
| --- | --- | --- | --- |
| `userId` | `user_id` | text, not null, FK `user.id` `on delete cascade` | |
| `orszagKod` | `orszag_kod` | text, not null | ISO 3166-1 alpha-2 a `lib/orszagok.ts` szótárból |
| `szekhely` | `szekhely` | integer boolean, not null, default false | felhasználónként pontosan egy (a validátor kényszeríti, az index legfeljebb egyet enged) |
| `vezeto` | `vezeto` | integer boolean, not null, default false | országonként legfeljebb egy – relációs vezető |
| `varos` | `varos` | text, null | csak a székhely-sornál; ≤ 100 karakter (`VAROS_MAX`) |
| `reszterulet` | `reszterulet` | text, null | csak a székhely-sornál; ≤ 1000 karakter (`RESZTERULET_MAX`) |

- Elsődleges kulcs: `(user_id, orszag_kod)`.
- `uniqueIndex('attase_orszag_vezeto_idx').on(orszagKod).where(sql\`vezeto = 1\`)`.
- `uniqueIndex('attase_orszag_szekhely_idx').on(userId).where(sql\`szekhely = 1\`)`.
- `index('attase_orszag_orszag_idx').on(orszagKod)`.
- Admin felhasználónak nincs sora; adminra váltáskor a sorai törlődnek.

### Megszűnő oszlopok

`user.orszag`, `user.fovaros`, `user.terulet`, `user.penznem` – a `db/schema/auth.ts`-ből és a
`lib/auth.ts` `additionalFields`-ből is (kézzel; az `auth:generate` felülírná a fájl
formázását). Marad: `telefon`, `kapcsolatEmail`.

### `Alapadatok` bővítése (`lib/orszagprofil-szotar.ts`)

Új mezők: `fovaros: string`, `terulet: number | null` (km², pozitív egész), `penznem: string`.
A `NORMALIZALOK.alapadatok` hiányzó/rossz típusú értéknél `''`, ill. `null`-t ad, ezért JSON-
migráció nem kell. `MEZO_CIMKEK.alapadatok`: „Főváros”, „Terület (km²)”, „Pénznem” (súgó:
„pl. dél-koreai von (KRW)”). Validátor (`lib/orszagprofil-validacio.ts`): `fovaros` és `penznem`
a meglévő `szoveg(..., ROVID_MAX)`, `terulet` a meglévő `szam(..., { min: 1, max: 999_999_999,
tizedes: 0 })` (a magyar szám-formákat már kezeli). Űrlap: `AlapadatokMezok` (két `RovidMezo` +
egy `SzamMezo` „km²” utótaggal), olvasó nézet: `BlokkNezet` `alapadatok` ága.

### Országszótár bővítése (`lib/orszagok.ts`)

| Kód | Magyar név | `geo` | `lonlat` |
| --- | --- | --- | --- |
| `PR` | Puerto Rico | `Puerto Rico` (van 110m poligon) | [-66.11, 18.47] |
| `VI` | Amerikai Virgin-szigetek | `''` (csak pin) | [-64.93, 18.34] |
| `MV` | Maldív-szigetek | `''` (csak pin) | [73.51, 4.18] |

Az `ORSZAGOK` magyar név szerint rendezett marad (a beszúrás helyét `localeCompare('hu')`-val
ellenőrizni). A „Virgin-szigetek” az USA-hoz tartozó szigeteket jelenti.

## Migráció

Két drizzle-kit migráció (`npm run db:generate`): `0006_attase_orszag` (az 1. lépés generálva,
a 2–4. adatlépés kézzel a végére fűzve – a snapshot a sémából jön, az adatlépések nem
befolyásolják) és `0007_user_poszt_oszlopok` (az 5. lépés). A kettéosztás miatt a fejlesztés
köztes állapotaiban is fordul és fut a kód: a régi oszlopok az utolsó lépésig olvashatók maradnak.
A hostingon a `npm run build` mindkettőt futtatja (`drizzle-kit migrate`).

1. `CREATE TABLE attase_orszag` + az indexek.
2. Minden attasé (`coalesce(role, 'attase') <> 'admin'`), akinek van nem üres `orszag`-a →
   egy sor: `szekhely = 1`, `vezeto = 0`, `varos`/`reszterulet` null.
3. Országonként egy vezető: a nem tiltott attasék közül név szerint az első (SQL `ORDER BY`,
   mint a mai `listTerkepAdat` „első attaséja”); ha mind tiltott, a név szerint első.
   Tiltott: `banned = 1` és (`ban_expires` null vagy a jövőben).
4. A vezető poszt-adatai (`fovaros`, `terulet`, `penznem`) bekerülnek az ország minden
   **meglévő** `alapadatok` blokkjába `json_set`-tel, ahol az adott kulcs még hiányzik vagy üres.
   Ahol az országnak nincs mentett Alapadatok blokkja, az érték elvész – profil-sort nem
   hozunk létre, mert az hamis „Adott évi profil” állapotot mutatna. Az `updated_at` nem változik.
5. `ALTER TABLE user DROP COLUMN` a négy oszlopra (a better-sqlite3 SQLite-ja 3.53, a
   `DROP COLUMN` támogatott).

A migrációt a demó DB scratchpad-másolatán kell kipróbálni, mielőtt a repó DB-jére fut.

## Vezető-szabályok és mentés (`db/queries/attase-orszag.ts`)

- `listAttaseOrszagok(userId): SessionOrszag[]` – a session számára (székhely elöl, utána
  magyar név szerint).
- `setAttaseOrszagok(userId, sorok: AttaseOrszagInput[])` – egyetlen tranzakció:
  1. a felhasználó összes régi sorának törlése;
  2. a `vezeto: true` sorok országainál a többi felhasználó vezető-jelölésének levétele
     (átvétel);
  3. az új sorok beszúrása;
  4. `normalizalVezetok()`.
- `normalizalVezetok()` – egyetlen UPDATE: ahol egy országnak pontosan egy sora van és nincs
  vezetője, az lesz a vezető. (Így egyszemélyes országban nem kell jelölni, és a vezető
  távozásakor az egyedül maradó örököl.) Ha többen maradnak vezető nélkül, nem jelöl ki
  senkit. Exportált: a törlés-action is hívja (a cascade után).
- `listOrszagAttasek(kod): OrszagAttase[]` – az ország aktív (nem tiltott) attaséi a
  profiloldalnak: vezető elöl, utána a székhelyként ott dolgozók, végül a régiósak, mindegyik
  csoport magyar név szerint.
- A tiltott felhasználó sorai megmaradnak (feloldáskor minden visszaáll); a megjelenítés
  (térkép, profil, ticket-címzettek) kihagyja őket, mint eddig.

Közös típusok és tiszta segédek: `lib/attase-orszag.ts` (nincs React, nincs DB):
`SessionOrszag` (`kod`, `szekhely`, `vezeto`), `AttaseOrszagInput` (+ `varos`, `reszterulet`),
`OrszagAttase` (`userId`, `nev`, `vezeto`, `szekhelyKod`, `varos`, `reszterulet` – régiós, ha
`szekhelyKod !== kod`), `VAROS_MAX`, `RESZTERULET_MAX`, `REGIO_MAX = 20`, `szekhelyKod()`,
`vezetoNelkuliOrszagok()` (a felhasználó-oldal figyelmeztetéséhez), a dialógus vezető-súgóját
számoló függvény és az attasé-felirat (név · város, régiós jelzés).

## Session és jogosultság

- `lib/session.ts`: az `AppSession.orszag` helyett `orszagok: SessionOrszag[]`. A
  `getSession()` a Better Auth session után attasénál a `listAttaseOrszagok`-ot hívja (React
  `cache` – kérésenként egyszer); a hozzárendelés változása azonnal érvényes, újra-bejelentkezés
  nélkül. Adminnál üres lista.
- `canEditProfil(session, kod, ev, aktualisEv)`: admin változatlan; attasé csak az aktuális
  évre és csak akkor, ha `session.orszagok` tartalmazza a `kod`-ot `vezeto: true`-val. A nem
  vezető attasénak a szerkesztő oldal 404, az action `NINCS_JOG` űrlap-hiba (pl. ha szerkesztés
  közben átadják a vezetőséget) – a meglévő minta.
- Riport-jog (megtekintés, szerkesztés) és ticket-jog változatlan (szerző-, ill.
  címzett-alapú).

## Validáció (`lib/felhasznalo-validacio.ts`)

Az `AttaseAdatok` helyett: elérhetőség (`telefon`, `kapcsolatEmail` – változatlan szabályok,
mindkét szerepkörnél) + `orszagok: AttaseOrszagInput[]` (adminnál `[]`, hiba nélkül).

Mezőnevek (a mező `id`-ja = `name` = hibakulcs, mint eddig a dialógusban):

| Mező | Név |
| --- | --- |
| Székhely országa | `szekhely.orszag` |
| Poszt városa | `szekhely.varos` |
| Részterület | `szekhely.reszterulet` |
| Székhely vezető-jelölő | `szekhely.vezeto` (checkbox, `on`) |
| Régiós ország | `regio.<i>.orszag` (i = 0…) |
| Régiós vezető-jelölő | `regio.<i>.vezeto` |

Szabályok (attasénál):

- A székhely országa kötelező, a szótár kódja („TéT attasénál a székhely országa kötelező.”,
  ill. „Válassz országot a listából.”).
- `varos` ≤ `VAROS_MAX`, `reszterulet` ≤ `RESZTERULET_MAX`; üres → `null`; a közös `mezo()`
  tisztítással (a részterület többsoros: a sortörés megmarad, mint a profil szövegmezőinél).
- Régiós sorok: az ország nélküli sor kimarad; ismeretlen kód → „Válassz országot a listából.”;
  ha az ország már szerepel (székhelyként vagy korábbi sorban) → „Ez az ország már szerepel.”
  az adott sor `regio.<i>.orszag` kulcsán; legfeljebb `REGIO_MAX` sor (felette form-hiba).
- A régiós sor `varos`-a és `reszterulet`-e mindig `null`.

## Server action-ök (`app/(app)/felhasznalok/actions.ts`)

- `createFelhasznaloAction`: `auth.api.createUser` (név, e-mail, jelszó, szerepkör, `telefon`,
  `kapcsolatEmail`), majd attasénál `setAttaseOrszagok(ujId, orszagok)`. Ha a második lépés
  dob: `revalidatePath` + form-hiba „A felhasználó létrejött, de az országok mentése nem
  sikerült – szerkeszd újra.”
- `updateFelhasznaloAction`: `auth.api.adminUpdateUser` (név, szerepkör, elérhetőségek), majd
  `setAttaseOrszagok(userId, orszagok)` (adminnál `[]` → minden sor törlődik). Hiba esetén
  form-hiba „Az országok mentése nem sikerült.”
- `removeFelhasznaloAction`: a `removeUser` után `normalizalVezetok()`.
- A tiltás/feloldás nem nyúl a sorokhoz.
- Minden ág a meglévő `kesz()`/`hiba()` mintát követi (`revalidatePath('/', 'layout')`).

## Felhasználó-kezelő felület

### Táblázat (`FelhasznaloTabla`)

Az „Ország” oszlop „Országok” lesz:

```
Németország · Berlin ★
régió: Írország
```

- Első sor: székhely országa · város. Második (halvány, kisebb) sor: a régiós országok.
- A ★ (akadálymentes szöveggel: „relációs vezető”) csak olyan országnál jelenik meg, ahol egynél
  több attasé van; egyszemélyes országban a vezetőség automatikus, ott zaj lenne.
- A részterület a táblában nem látszik.
- Admin sorában „–”.

### Figyelmeztetés

A táblázat fölött, ha van olyan ország, amelynek van attaséja, de nincs aktív (nem tiltott)
vezetője: „Relációs vezető nélkül: Amerikai Egyesült Államok (2 attasé). Jelöld ki valamelyik
attasé szerkesztésében.” A tiltott vezetőjű ország is ide kerül („… – a vezető tiltott”).
Forrás: a már betöltött felhasználólista (`vezetoNelkuliOrszagok`), nincs új lekérdezés.

### Dialógus (új felhasználó és szerkesztés)

A „TéT poszt” blokk helyére két blokk kerül (csak attasénál látszik; a vezérelt értékek
szerepkör-váltáskor megmaradnak, mint eddig):

Példa: Komma Krisztián szerkesztése (Németországban Kindert Judit a vezető), egy
illusztrációs régiós sorral:

```
SZÉKHELY
 Ország [Németország ▾]                  Poszt városa [Stuttgart             ]
 Részterület (opcionális)
 [Baden-Württemberg, Észak-Rajna-Vesztfália, Rheinland-Pfalz, Saarland, …    ]
 ☐ Relációs vezető (országprofil-felelős)    Jelenlegi vezető: Kindert Judit.

RÉGIÓS LEFEDETTSÉG
 [Luxemburg ▾]                ☑ Vezető   ✕
                              Egyedüli attasé – automatikusan vezető.
 + Ország hozzáadása
```

A vezető-jelölő állapota az ország többi attaséja alapján (a page felhasználólistájából). A
súgó szövegei a nevet toldalék nélkül írják, hogy ne kelljen magánhangzó-illeszkedést számolni:

| Helyzet | Jelölő | Súgó |
| --- | --- | --- |
| Az országnak nincs más attaséja | bejelölve, letiltva | „Egyedüli attasé – automatikusan vezető.” |
| Más a vezető | alapból üres | „Jelenlegi vezető: X.” – bejelölve: „Mentéskor átveszi a vezetőséget (jelenleg: X).” Tiltott X: „(tiltott)” utótag. |
| Van más attasé, de nincs vezető | alapból bejelölve | „Nincs kijelölt vezető.” |
| Ő a jelenlegi vezető (szerkesztés) | bejelölve | nincs súgó; kikapcsolva: „Kikapcsolva nem marad vezető – jelölj ki mást.” |

- Az alapérték országválasztáskor számolódik; szerkesztésnél a kezdőérték a DB-beli jelölés.
  A letiltott jelölő nem küldődik be – a szerver normalizálása ugyanazt az eredményt adja.
- Sorok: stabil kliens-kulccsal (mint a `RendezvenySorok`); „+ Ország hozzáadása” legfeljebb
  `REGIO_MAX`-ig; a régiós sor egy sorban: ország-select, vezető-jelölő, törlés-gomb, alatta
  a súgó.
- Az ország-selectek a meglévő `NativeSelect`-et használják (`ORSZAGOK`).
- A `MuveletDialog` `szeles` változata `sm:max-w-2xl` lesz (csak a két felhasználó-dialógus
  használja).
- A szerkesztés dialógus súgója: „Adminra váltva az országok törlődnek.”
- Komponensek: az `AttaseMezok` helyett `ElerhetosegMezok` (telefon, kapcsolattartási e-mail)
  és `OrszagMezok` (székhely + régiós sorok), a vezető-jelölő külön komponens
  (`VezetoJelolo`) – mind `app/(app)/felhasznalok/components/` alatt.

## Érintett felületek

### Oldalsáv és fejléc

- Felhasználói blokk (AppShell): „TéT attasé · Németország”, régiós országok esetén
  „TéT attasé · Franciaország +4”.
- Állapot-kártya (`OldalsavAllapot`, attasé): országonként egy sor (székhely elöl, utána név
  szerint): állapot-pötty, országnév, állapot; a sor a szerkesztőre visz, ha ő a vezető és az
  év szerkeszthető (`canEditProfil`), különben az olvasó nézetre. Cím: egy országnál
  „Országprofil · 2026”, többnél „Országprofilok · 2026”. Ország nélküli attasénak `null`
  (mint eddig). Admin ága változatlan.

### Térkép

- `listTerkepAdat(ev)`: egy ország akkor szerepel, ha van aktív attaséja (székhelyként vagy
  régiósan) vagy van profilja. A `TerkepOrszag` `attase` és `poszt` mezője helyett
  `attasek: OrszagAttase[]` (a `listOrszagAttasek` sorrendjével). A főváros, terület és pénznem
  a már meglévő `alapadatok` mezőből jön.
- Tooltip: az első attasé (vezető, ha van) „név · város”, több attasénál „+N attasé”; régiósnál
  „név · regionálisan (város)”; nincs attasé: „nincs aktív attasé”. A fővárost a tooltip nem
  írja ki (az első attasé városa informatívabb; a kivonat mutatja a fővárost).
- `ProfilKivonat`: az attasék listája (név · város, „relációs vezető” jelzés több attasénál,
  „regionálisan” jelzés), alatta „főváros · terület km² · pénznem” az `alapadatok`-ból.
  A részterület itt nem látszik.
- `OsszehasonlitasPanel` „Attasé” sora: az első attasé neve, alatta halványan a város, több
  attasénál „+N”.
- „Saját országprofil” gomb (`TerkepNezet`): az első olyan ország, amelynek az attasé a
  vezetője (a székhely előnyben); ha egyiknek sem, nincs gomb.

### Profil oldal és szerkesztő

- Fejléc (`orszagprofil/[kod]/page.tsx`): a `getAttaseNev` helyett `listOrszagAttasek` és egy
  új `components/orszagprofil/AttaseLista` komponens: soronként „név · város”, több attasénál a
  vezető mellett „relációs vezető” jelzés, régiósnál „regionálisan, székhely: Franciaország”,
  alatta halványan a részterület. Ha több attasé van, de nincs vezető: „Nincs kijelölt
  relációs vezető.” Ha nincs aktív attasé: „Nincs aktív attasé.”
- A szerkesztő oldal és a `mentBlokkAction` a módosított `canEditProfil`-lal dolgozik, más
  változás nincs.
- Alapadatok blokk: lásd fent (Főváros, Terület km², Pénznem).

### Riport

- `uj-riport/page.tsx`: nincs ország → a meglévő üzenetek; egy ország → „A bejegyzés a(z) X
  poszthoz kerül”; több ország → a `RiportForm` create-módban `orszagok` propot kap, és egy
  „Ország” `NativeSelect`-et mutat (`id`/`name` `orszag`, alapérték a székhely).
- `createRiportAction`: egy országnál azt használja; többnél a beküldött `orszag`-nak a
  `session.orszagok` között kell lennie, különben mezőhiba „Válassz a saját országaid közül.”
- Szerkesztéskor az ország nem változtatható (mint eddig).

### Ticket

`listCimzettJeloltek`: a nem tiltott attasék, akiknek van székhelye; `orszag` = a székhely
kódja (a ticket pillanatképe). A felirat „Név · Ország” marad. A ticket-validátor nem változik.

### Változatlan

Monitoring (demóadat), a riportlista ország-szűrője (`riport.orszag` marad), ticket-lista.

## Demó adat (`scripts/demo-attasek.ts`, a repó `data/tet.db`-jébe)

Idempotens tsx-script (`NODE_OPTIONS="--conditions=react-server"`, a jelszó a
`DEMO_ATTASE_PASSWORD` környezeti változóból – a `.env.example` dokumentálja):

1. törli a `teszt.attase@niu.hu` és `masodik.attase@niu.hu` fiókot, ha létezik (cascade: a
   3 demó riport, a 2 ticket és az olvasás-jelölések; a profilok szerzője `null` lesz);
2. létrehozza (ha még nincs) az alábbi attasékat a `scripts/seed.ts` mintájára (közvetlen
   insert, `providerId: 'credential'`, `hashPassword`, `role: 'attase'`), e-mail:
   `vezeteknev.keresztnev@niu.hu` ékezet nélkül, a „dr.” nélkül (helykitöltő cím);
3. `setAttaseOrszagok`-kal beállítja a hozzárendeléseket (a két kijelölt vezető `vezeto:
   true`, a többi a normalizálásból).

| # | Név | E-mail | Székhely, város | Részterület | Régió | Vezető |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Kindert Judit | kindert.judit@niu.hu | DE, Berlin | Berlin, Brandenburg, Bremen, Hamburg, Niedersachsen, Mecklenburg-Vorpommern, Thüringen, Sachsen-Anhalt, Sachsen, Schleswig-Holstein | – | DE (kijelölt) |
| 2 | Komma Krisztián | komma.krisztian@niu.hu | DE, Stuttgart | Baden-Württemberg, Észak-Rajna-Vesztfália, Rheinland-Pfalz, Saarland, Hessen | – | – |
| 3 | dr. Gurza László | gurza.laszlo@niu.hu | DE, München | Bajorország | – | – |
| 4 | Jávori Balázs | javori.balazs@niu.hu | AT, Bécs | – | – | auto |
| 5 | Balogh András Zoltán | balogh.andras@niu.hu | GB, London | – | IE | auto |
| 6 | Szántó Szilvia | szanto.szilvia@niu.hu | FR, Párizs | – | DZ, MA, MR, TN | auto |
| 7 | Hoffmann Mária | hoffmann.maria@niu.hu | IL, Tel-Aviv | – | – | auto |
| 8 | Márfi András | marfi.andras@niu.hu | RU, Moszkva | – | – | auto |
| 9 | Ferencz Csanád | ferencz.csanad@niu.hu | JP, Tokió | – | – | auto |
| 10 | Hosszú Hortenzia | hosszu.hortenzia@niu.hu | KR, Szöul | – | KP | auto |
| 11 | Siklós Lili | siklos.lili@niu.hu | CN, Peking | – | – | auto |
| 12 | dr. Nagy Gabriella | nagy.gabriella@niu.hu | US, New York | Alabama, Arkansas, District of Columbia, Florida, Georgia, Kentucky, Louisiana, Maryland, Mississippi, West Virginia, Észak-Karolina, Dél-Karolina, Ohio, Pennsylvania, Virginia, Connecticut, Delaware, Maine, New Hampshire, New Jersey, New York, Rhode Island, Vermont, Illinois, Indiana, Iowa, Michigan, Minnesota, Missouri, Tennessee, Wisconsin | CA, PR, VI | US (kijelölt) |
| 13 | Mészáros Eleonóra | meszaros.eleonora@niu.hu | US, San Francisco | Alaszka, Arizona, Colorado, Dél-Dakota, Észak-Dakota, Guam, Hawaii, Idaho, Kalifornia, Kansas, Montana, Nebraska, Nevada, Oklahoma, Oregon, Texas, Új-Mexikó, Utah, Washington, Wyoming | – | – |
| 14 | Morován Júlia | morovan.julia@niu.hu | BR, Sao Paulo | – | GY, SR | auto |
| 15 | Daczi Diána | daczi.diana@niu.hu | IN, Új-Delhi | – | BD, MV, NP, LK | auto |

- A 12. sor részterületéből a megadott listában ismétlődő államok (Florida, Arkansas,
  Kentucky, Ohio) egyszer szerepelnek. Megjegyzés: Massachusetts egyik USA-részterületben sem
  szerepel (a forráslista szerint).
- Telefon és kapcsolattartási e-mail nincs megadva (nincs rá valós adat).
- A `.env.example` komment-listája (e-mail / szerep / székhely / régió) a 15 fiókra cserélődik,
  a két tesztfiók kikerül; a `DEMO_ATTASE_PASSWORD` sor bekerül.
- Hosting: a `db:init` csak hiányzó vagy felhasználó nélküli DB-t cserél, ezért a meglévő
  hosting-DB-be a demó attasék nem kerülnek be maguktól. A README „Hosting” szakasza leírja:
  a hosting DB-fájl törlése után a következő build a repó DB-jét másolja, vagy a script
  futtatható a hostingon is.
- A repó DB commitolása előtt `PRAGMA wal_checkpoint(TRUNCATE)` (CLAUDE.md).

## Scriptek és dokumentáció

- `scripts/orszag-kod-migracio.ts`: a `user` rész kikerül (az oszlop megszűnik), a `riport`
  és `ticket` rész marad.
- `scripts/demo-orszagprofil.ts`: a poszt-adatok (főváros, terület, pénznem) az Alapadatok
  űrlap-értékei közé kerülnek; felhasználói mezőt nem ír; a célország a script saját kódjából
  jön (nem a felhasználóból); a szerző az első admin (nem valós attasé).
- `CLAUDE.md`: Auth (a `user.orszag` és a poszt-adat mezők helyett az `attase_orszag`, a
  session `orszagok`), UI shell (felhasználói blokk, állapot-kártya), Riportok (ország-választó),
  Országprofil (vezető-szabály, `listOrszagAttasek`, `AttaseLista`, Alapadatok-mezők),
  Kommunikáció (székhely), Térkép (`attasek`, tooltip), a `geo: ''` országok listája (+VI, MV),
  a parancslista (`orszag-kod-migracio`, `demo-attasek`).
- `README.md`: a felhasználó-kezelés leírása (székhely, régió, részterület, relációs vezető),
  a „Hosting” szakasz demó-adat megjegyzése.

## Ellenőrzés

- `npx tsc --noEmit`, `npm run build` (benne `db:init` + `drizzle-kit migrate`).
- Migráció a demó DB scratchpad-másolatán (`DATABASE_URL` abszolút útvonallal): KR és JP
  attasé `szekhely = 1`, `vezeto = 1` sort kap; a KR 2026, JP 2026, JP 2025 Alapadatok
  blokkjában megjelenik a főváros, terület, pénznem; az `updated_at` nem változik; a négy
  `user`-oszlop eltűnik.
- Eldobható tsx-scriptek a tiszta logikára: validátor (kötelező székhely, ismétlődő ország,
  korlátok, admin → `[]`), `canEditProfil` (vezető / nem vezető / régiós vezető / múltbeli év),
  `normalizalVezetok` és az átvétel (a `setAttaseOrszagok` egy scratch DB-n).
- gstack böngészős QA (a futó dev szerveren):
  - admin: új régiós attasé (székhely AT, régió SI, HR); második attasé KR-be részterülettel;
    vezető-átadás és visszavétel; vezető nélküli ország figyelmeztetése; adminra váltás;
    törlés utáni öröklés;
  - nem vezető attasé: a profil szerkesztő 404, nincs Szerkesztés gomb, az oldalsáv sora az
    olvasó nézetre visz; riport beadható;
  - vezető attasé: szerkeszt, a régiós országát is;
  - több országos attasé: riport az „Ország” listával; oldalsáv-kártya sorai; fejléc „+N”;
  - térkép: tooltip, kivonat, összehasonlító tábla „Attasé” sora; Németország három
    attaséval, Puerto Rico poligon, Maldív-szigetek pin;
  - ticket: címzett-felirat a székhellyel.

## Megvalósítási eltérések

- A vezető nélküli országok figyelmeztetése csak az aktív attaséval rendelkező országokat sorolja fel
  (a csupa tiltott attasés országban nincs kire átadni a vezetést; a tiltott fiók szerkesztésével rendezhető).
  Formája a spec egymondatos szövege helyett:
  - cím: „Relációs vezető nélküli országok”;
  - felsorolás: „X (N aktív attasé)”, tiltott vezetőnél „ – a vezető tiltott”;
  - zárómondat: „Jelöld ki a vezetőt valamelyik attasé szerkesztésében; addig a profilt csak admin szerkesztheti.”
- Szerkesztésnél az országmentés hibaüzenete: „A felhasználó adatai mentve, de az országok mentése nem sikerült – próbáld
  újra.” A spec „Az országok mentése nem sikerült.” szövege helyett: jelzi, hogy a többi adat már mentve van.
- A vezető-jelölő súgója: „Mentéskor ő lesz a relációs vezető (jelenleg: X).” (a „vezetőség” testületet
  jelentene); tiltott vezetőnél „(jelenleg: X, tiltott)”, illetve „Jelenlegi vezető: X (tiltott).”
- A validátor kimenete és a felhasználó-lista sora egyaránt `AttaseOrszag` (a spec `AttaseOrszagInput` neve
  helyett); a dialógusok országonkénti listájának típusa `OrszagTagok` (prop: `orszagTagok`).
- Az összehasonlító tábla „Attasé” sora egysoros (`attasekRovid`: „név · város +N attasé”, régiósnál
  „regionálisan”), nem név + halvány város két sorban.
- A térkép-kivonat a főváros/terület/pénznem értéket címkézett sorként, az Alapadatok-kivonat elején mutatja
  (nem a leírás alatti „·”-os sorban, mert az egy újabb attasé-sornak látszott); a térkép alcíme „N ország · M
  profil”, a jelmagyarázat szárazföld-felirata „nincs attasé és profil” (a lista a csak régiósan lefedett
  országokat is tartalmazza, ezért a „poszt” szó félrevezető lett).
- A profil fejléce: a cím, az állapot-jelvény és a gombok egy sorban, alattuk teljes szélességben az „Attasé(k)”
  címkéjű lista (név · hely, „Relációs vezető” outline jelvény, részterület); ha egyik aktív attasé sem vezető
  (nincs kijelölve, vagy a vezető tiltott), a lista után: „Nincs aktív relációs vezető – a profilt csak admin
  szerkesztheti.” (a spec „Nincs kijelölt relációs vezető.” szövege helyett).
- A vezető-jelölő alapértéke akkor is „bejelölve”, ha a másik vezető tiltott (gyakorlatilag nincs aktív vezető).
- Egyedüli attasénál a letiltott, bejelölt jelölő helyett rejtett `on` mező küldődik. A spec szerint ilyenkor semmi nem
  ment volna be, és a szerver normalizálása állította volna be a vezetőt. Konzisztens adatnál az eredmény azonos;
  elavult dialógusnál (ha közben más attasé is került az országba) így az megy be, amit a jelölő mutat.
- A régiós sorok kulcsa stabil kliens-`id`. A spec „mint a `RendezvenySorok`” megjegyzése pontatlan: az indexkulcsot
  használ. A székhely vezető-súgója a jelölő alatt áll, ahogy a régiós soroknál is.
- A dialógus a specen túl:
  - sor törlése után a sorhibák a következő beküldésig rejtve vannak;
  - billentyűzetes fókusz-kezelés a sorok hozzáadásakor és törlésekor;
  - 20 sornál a gomb letiltott, mellette magyarázó szöveg;
  - a régiós jelölők és a ✕ gombok felolvasó-nevében benne az ország;
  - a részterület útmutatója súgó, nem placeholder;
  - a szélesebb keret keskeny ablakban 1rem margót tart.
- A 0006 migráció: a régi `user.orszag` trimmelve kerül át (üres/csak szóköz nem ad sort); a vezetőválasztás
  döntetlennél az id-vel determinisztikus; a főváros/terület/pénznem mezőnként az ország bármely attaséjától
  átvehető (a vezető előnyben), és hibás JSON-ú Alapadatok blokkot nem érint.
- Az admin felhasználó esetleg ott maradt `attase_orszag` sorai a profil- és térkép-listákban nem jelennek meg;
  a `setAttaseOrszagok` a város/részterület értéket csak a székhely-sorra írja.
- A `scripts/orszag-kod-migracio.ts` a `user` helyett az `attase_orszag` sorait írja át.
- A `0007` migráció a build elején fut: a régi verzió a build ideje alatt hibát adhat (README, hosting).
- Az Alapadatok-űrlap: a főváros és a pénznem példája súgóként a szótárban („Pl. Szöul.”, „Pl. dél-koreai von (KRW).”),
  a rács sorrendje a súgós mezők párosításával (Főváros | Pénznem, Terület | Lakosság, GDP | GDP/fő,
  GDP-növekedés | Adatév, Forrás teljes szélességben).
- Az oldalsáv-kártya attasé-sorában az állapot és a „Szerkesztés →”/„Megnyitás →” művelet két külön elem
  (flex-wrap, a művelet jobbra igazítva, nem törik), a spec „állapot · művelet” egysoros alakja helyett; a
  felhasználói blokk „+N”-je előtt nem törő szóköz.
- Form-reset védelem: a React 19 a `<form action>` után `form.reset()`-et hív, ami a vezérelt natív selectet és
  checkboxot a DOM-ban a kezdőértékére ugrasztotta (a state közben a választást tartotta, egy változtatás nélküli
  újraküldés így más értéket vitt). A `NativeSelect` render után a `value`-hoz igazítja az opciók
  `defaultSelected`-jét, a `VezetoJelolo` a `defaultChecked`-et; ezzel a meglévő `RendezvenySorok` típus-választója
  is javult.
- A riport országa: választó nélküli űrlapnál (egy ország) az action a székhelyet veszi, választós űrlapnál a beküldött
  értéket a saját országokhoz köti. Az „egy országnál azt használja” szabály csak versenyhelyzetben tér el. Ha a lap
  betöltése óta az admin bővítette az országokat, a bejegyzés a székhelyre kerül, a beküldés nem akad el némán; ha a
  választottat vette el, látható mezőhiba jön, a választás nem íródik felül.
- A felhasználó-kezelő a specen túl:
  - az ország nélküli attasénál „Nincs ország” látszik;
  - a ★ jelentése a fejlécben szerepel;
  - a normalizálás az admin felhasználók esetleg ott maradt sorait is törli;
  - a saját admin szerepkör védelme a validálás előtt fut.
- Tudatos korlát: a mentés a felhasználó összes hozzárendelését a dialógus állapotára cseréli, a vezető-jelölésekkel
  együtt. Ha két admin egyszerre dolgozik, egy közben elavult, nyitva hagyott dialógus mentése felülírhatja a másik admin
  vezetőség-módosítását. Egy-két admin mellett ez ritka, optimista zárolás nincs.
- A demó fiókok e-mail címe `vezeteknev.keresztnev@demo.test`, kitalált domain, a spec `@niu.hu` helykitöltője helyett.
  A felhasználó döntése: a repó publikus, és a `@niu.hu` alak valószínűleg létező postafiókokat jelöl. A közös demó
  jelszó a `.env.example`-ben dokumentálva marad: ez elfogadott kockázat.
- Tudatos kompromisszum: a főváros/terület/pénznem évfüggetlen adat, de az évenkénti Alapadatok blokkban van, így új
  évben a lakossághoz és a GDP-hez hasonlóan újra ki kell tölteni (az előző év átmásolása hatókörön kívül maradt).
- A demó script (`scripts/demo-attasek.ts`) a specen túl:
  - minden írás előtt ellenőriz, és hiba esetén egyetlen hibalistával, írás nélkül lép ki (ismeretlen országkód,
    város-, részterület- és régiószám-korlát, ismétlődő ország, a székhely a régiók közt, több kijelölt vezető egy
    országban, ismétlődő e-mail, jelszó);
  - a jelszó 8–128 karakter (mint a felületen), az e-mail trim + kisbetű (mint a `scripts/seed.ts`-ben);
  - meglévő (e-mail szerinti) fióknál a név és a jelszó nem változik, a hozzárendelés a lista szerintire áll vissza;
  - ha a meglévő fiók nem attasé szerepkörű (pl. admin) vagy tiltott, a script figyelmeztet és kihagyja (a hozzárendelését
    nem állítja be).
