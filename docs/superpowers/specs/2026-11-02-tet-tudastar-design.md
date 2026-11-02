# TéT Tudástár – tervezési spec

Dátum: 2026-11-02
Állapot: az A fázis (funkció) megvalósítva; a B fázis (kezdő tartalom) folyamatban
Ág: `tet-tudastar`
Forrás: `TTM_TUD_STR_final.pdf` („TÉT TUDÁSTÁR” – a javasolt fő struktúra, 9 kategória a szereplőtípusokkal)

## Cél

A mai tudástár (`app/(app)/tudastar/page.tsx`, kliens oldal a `lib/knowledge.ts` 17 demókártyájából, három
szekcióval és technológiai terület-szűrővel) helyett a dokumentum szerinti **TéT Tudástár**: a magyar
innovációs ökoszisztéma szereplőit és kapcsolódó programjait mutatja be a külföldön dolgozó TéT attaséknak –
eligazító összefoglalók, majd az élő hivatalos oldalakra mutató linkek. Könnyen navigálható (9 fő cím
mindig elérhető) és jól átlátható (egységes kártyaszerkezet). A tartalmat a központ (admin) a felületen
gondozza, mert a dokumentum szerint a szereplőlisták „még változni fognak”.

## Döntések

| Kérdés | Döntés |
| --- | --- |
| Karbantartás | DB + admin szerkesztés a felületen. A kezdő tartalom egyszeri migrációval kerül be (így a hostingon is megjelenik). |
| Kezdő tartalom | Kutatott valós tartalom (az országprofilokhoz hasonló „kutatott vázlat”), amelyet a felhasználó átnéz; az admin utána pontosít. |
| Navigáció | „B” változat: áttekintő nyitólap 9 csempével + kategóriánként saját oldal (saját URL), jobb oldalt állandó kategória-menü; a részletes intézménykártya saját oldalt kap. |
| Kártyatípusok | Intézménykártya (egységes szerkezet, opcionális részletoldallal) és listakártya (a kategória szereplői felsorolva, név · megjegyzés · link). |
| Régi tartalom | Teljesen kikerül: a 17 demókártya, a három szekció és a technológiai terület-szűrő; a `lib/knowledge.ts` törlődik (más nem importálja). |
| Adatmodell | Egy tábla, egy típusos JSON `tartalom` oszloppal és normalizálóval (az országprofil mintája); a kártya egyben szerkesztődik és mentődik. |
| A 9 kategória | A kódban (szótár), nem a DB-ben – a szerkezet rögzített; a kategória-szövegeket fejlesztő módosítja. |
| Ki szerkeszt | Csak admin. Olvasni minden bejelentkezett felhasználó tud mindent. |
| Terjedelem | Egy spec, a terv két fázissal: **A** – funkció (tábla, oldalak, szerkesztő, keresés), **B** – kezdő tartalom (kutatás + migráció). |

## A 9 kategória

`lib/tudastar-szotar.ts` `TUDASTAR_KATEGORIAK` (a sorrend a tábla sorrendje). Mezők: `slug`, `szam`, `cim`,
`rovidCim` (a jobb menübe és a mobil választóba), `leiras` (egy sor a csempére), `bevezeto` (2–4 mondatos
eligazító összefoglaló a kategória-oldal tetején). A `leiras` és a `bevezeto` szövegét a B fázis kutatása
adja; az A fázisban rövid, a dokumentum szereplőtípusaiból írt vázlat áll ott.

| # | slug | Cím | Rövid cím |
| --- | --- | --- | --- |
| 1 | `szakpolitika` | Szakpolitikai irányítás és koordináció | Szakpolitikai irányítás |
| 2 | `finanszirozas` | Kutatás-fejlesztési és innovációs finanszírozás | K+F+I finanszírozás |
| 3 | `innovacios-szolgaltatasok` | Innovációs szolgáltatások és vállalkozásfejlesztés | Innovációs szolgáltatások |
| 4 | `kutatohalozat` | Kutatóhálózat és kutatóintézetek | Kutatóhálózat |
| 5 | `egyetemek` | Egyetemek és technológiatranszfer | Egyetemek és TT |
| 6 | `szellemi-tulajdon` | Szellemi tulajdon, szabályozás és minősítés | Szellemi tulajdon |
| 7 | `befektetok` | Finanszírozók és befektetők | Finanszírozók, befektetők |
| 8 | `vallalatok` | Kiemelt vállalati, piaci szereplők | Vállalati szereplők |
| 9 | `nemzetkozi-programok` | Nemzetközi programok magyar kapcsolódási pontjai | Nemzetközi programok |

## Útvonalak és navigáció

| Útvonal | Tartalom | Ki |
| --- | --- | --- |
| `/tudastar` | Keresőmező + 9 csempe (szám, cím, `leiras`, kártyaszám). `?q=` esetén a csempék helyén a keresési találatok. | mindenki |
| `/tudastar/[kategoria]` | Morzsamenü, cím, `bevezeto`, a kategória kártyái `sorrend` szerint. | mindenki |
| `/tudastar/[kategoria]/[slug]` | Intézményi részletoldal. | mindenki |
| `/tudastar/[kategoria]/uj?tipus=intezmeny\|lista` | Új kártya szerkesztője. | admin |
| `/tudastar/[kategoria]/[slug]/szerkesztes` | Meglévő kártya szerkesztője. | admin |

- **Menü és fejléc** (`lib/navigacio.ts` `UTVONALAK`): a menüpont felirata „TéT Tudástár” (a mai „Tudástár ??”
  helyett), a fejléc címe „TéT Tudástár”, alcíme „A magyar innovációs ökoszisztéma szereplői és kapcsolódó
  programok”. A sor `href`-je `/tudastar` marad, így az alútvonalakon is aktív és ugyanezt a címet adja.
- **Jobb oldali kategória-menü** (`KategoriaMenu`, a kategória- és a részletoldalon, `lg` fölött ragadós a
  fejléc alatt): a 9 rövid cím számmal, az aktív kiemelve; az aktív kategória alatt a kártyái horgonylinkként
  (`#k-<slug>`); fölötte kis keresőmező (GET űrlap a `/tudastar`-ra, `name="q"`).
- **Keskeny ablakban** (`lg` alatt) a menü helyett a lap tetején egy „Kategória” `NativeSelect`
  (`KategoriaValto`, kliens: váltáskor `router.push` a kategória-oldalra).
- A kategória-oldalon minden kártya `id="k-<slug>"`-t kap (a menü és a keresési találat horgonya).

## Adatmodell

`db/schema/tudastar.ts`, re-export a `db/schema/index.ts`-ből, migráció `npm run db:generate`-tel.

```ts
export const tudastarKartya = sqliteTable('tudastar_kartya', {
  id: text('id').primaryKey(),                         // crypto.randomUUID()
  kategoria: text('kategoria').notNull(),              // TUDASTAR_KATEGORIAK slug
  slug: text('slug').notNull(),                        // globálisan egyedi
  tipus: text('tipus').notNull(),                      // 'intezmeny' | 'lista' – létrehozás után nem változik
  nev: text('nev').notNull(),
  rovidites: text('rovidites'),
  osszefoglalo: text('osszefoglalo').notNull(),
  honlap: text('honlap'),
  sorrend: integer('sorrend').notNull(),               // a kategórián belül
  tartalom: text('tartalom', { mode: 'json' }).$type<KartyaTartalom>().notNull(),
  szerzoId: text('szerzo_id').references(() => user.id, { onDelete: 'set null' }), // az utolsó módosító
  createdAt: …, updatedAt: …,                          // a meglévő táblák mintájára, $onUpdate-tel
}, (t) => [
  uniqueIndex('tudastar_kartya_slug_idx').on(t.slug),
  index('tudastar_kartya_kategoria_idx').on(t.kategoria, t.sorrend),
]);
```

A `tartalom` két alakja (`lib/tudastar-szotar.ts`):

```ts
interface IntezmenyTartalom {
  profil: string;
  tevekenyseg: string;
  kapcsolat: { email: string; telefon: string; cim: string };
  szakaszok: { cim: string; szoveg: string }[];       // szabad, címzett szakaszok (pl. TTM: KFI-stratégia…)
  programok: { nev: string; leiras: string; url: string }[];
  linkek: { felirat: string; url: string }[];
}
interface ListaTartalom {
  sorok: { nev: string; megjegyzes: string; url: string }[];
  linkek: { felirat: string; url: string }[];
}
```

- **Normalizáló** (`normalizalTartalom(tipus, nyers)`): a hiányzó vagy rossz típusú almezőt üres alapértékre
  egészíti ki, a nem objektum listaelemet eldobja. Új almezőhöz nem kell migráció (mint az országprofilnál);
  almező átnevezése adatmigrációt igényel.
- Ismeretlen `tipus` értékű sort a lekérdezés kihagy és a szerver logolja (a DB-be csak a validátoron át
  kerül érték, ezért ez csak kézi DB-módosításnál fordulhat elő).
- **Sorrend**: új kártya a kategória végére (`max(sorrend) + 1`). Kategóriaváltáskor a kártya az új kategória
  végére kerül. A ↑/↓ mozgatás a szomszéddal cseréli a `sorrend`-et, és az `updatedAt`-et **nem** lépteti
  (`updatedAt: sql\`${t.updatedAt}\``, a `setIntezkedes` mintája): a „Frissítve” dátum a tartalomra vonatkozik,
  és a nyitott szerkesztő verziója sem avul el tőle. A tartalmi mentés a `sorrend`-hez csak kategóriaváltáskor
  nyúl.
- **Slug**: létrehozáskor a rövidítésből (ha van), különben a névből – ékezet nélkül, kisbetűvel, a nem
  alfanumerikus szakaszok helyén kötőjellel, legfeljebb 60 karakter; ütközésnél `-2`, `-3`… utótag, a szabad
  slug keresése és a beszúrás egy tranzakcióban. Átnevezéskor és kategóriaváltáskor nem változik (a megosztott
  link a kategória-részen át 404-re futna kategóriaváltás után – ez elfogadott). Segéd: `lib/slug.ts`.

## Validálás és jog

`lib/tudastar-validacio.ts` `validalKartya(fd, tipus)` → `ParseResult<KartyaAdat>` (a `lib/urlap.ts`
`tisztitSzoveg`/`mezo` alapján). Hibakulcs a mező `id`-ja (a `useMuveletForm` erre fókuszál).

| Mező | Szabály |
| --- | --- |
| `nev` | kötelező, ≤ 200 |
| `rovidites` | ≤ 40 |
| `osszefoglalo` | kötelező, ≤ 600 |
| `honlap` | opcionális URL |
| `kategoria` | a szótár egyik slugja |
| `profil`, `tevekenyseg`, szakasz-`szoveg` | ≤ 5000 |
| `kapcsolat.email` | opcionális, egyszerű e-mail-alak; `telefon` ≤ 60; `cim` ≤ 200 |
| `szakaszok` | ≤ 12 sor; sorban `cim` (≤ 120) és `szoveg` is kötelező |
| `programok` | ≤ 30 sor; `nev` kötelező (≤ 200), `leiras` ≤ 300, `url` opcionális |
| `linkek` | ≤ 20 sor; `felirat` (≤ 120) és `url` is kötelező |
| `sorok` | ≤ 150 sor; `nev` kötelező (≤ 200), `megjegyzes` ≤ 200, `url` opcionális |

- A dinamikus sorok mezőnevei `<lista>.<i>.<mezo>` (pl. `szakaszok.0.cim`); a **teljesen üres sor kimarad**, a
  félig kitöltött sor hibát kap (a rendezvénysorok mintája).
- **URL**: csak `http:`/`https:` séma, `new URL()`-lel ellenőrizve, ≤ 500 karakter; a `javascript:`, `data:` és
  társaik hibát kapnak. Séma nélküli (`nkfih.gov.hu`) érték elé a validátor `https://`-t tesz.
- **Szövegformázás**: sima szöveg; üres sor = új bekezdés, „- ” kezdetű sor = felsoroláspont. A megjelenítő
  komponens (`Szoveg`) bekezdésekre és listákra bont, HTML-t nem értelmez (a React escape-el).
- **Jog** (`lib/tudastar-jog.ts`): `canEditTudastar(session)` = admin. Olvasás: minden bejelentkezett
  felhasználó (a `app/(app)/layout.tsx` `requireSession()`-je fedi).

## Lekérdezések

`db/queries/tudastar.ts` (`server-only`):

- `listKartyak()` – minden kártya normalizált tartalommal, kategória és `sorrend` szerint; React `cache()`-ben
  (a page és a menü egy kérésen belül egyszer kérdez; a visszaadott tömböt ne mutáld).
- `getKartya(slug)` – egy kártya vagy `null`.
- `createKartya(adat, szerzoId)` – slug-képzés + `sorrend` + beszúrás egy tranzakcióban; visszaadja a slugot.
- `updateKartya(id, adat, verzio, szerzoId)` – `UPDATE … WHERE id = ? AND updated_at = ?`; 0 érintett sornál
  megkülönbözteti a „törölve” és a „közben módosítva” esetet (eredmény-unió, nem kivétel). Kategóriaváltásnál
  új `sorrend`.
- `deleteKartya(id)`.
- `mozgatKartya(id, irany)` – csere a kategórián belüli szomszéddal, tranzakcióban; a széleken nem csinál
  semmit.

## Felület

**Nyitólap** (`/tudastar`, Server Component): keresőmező (GET, `name="q"`, a jelenlegi `q`-val kitöltve),
alatta 3 oszlopos csemperács (keskenyen 1–2 oszlop): szám-jelvény, cím, `leiras`, „N kártya”; a csempe link a
kategória-oldalra.

**Kategória-oldal** (`/tudastar/[kategoria]`): morzsamenü („TéT Tudástár › 2. K+F+I finanszírozás”), cím a
számmal, `bevezeto`, majd a kártyák egy oszlopban (a jobb menü mellett), üres kategóriánál „Ebben a
kategóriában még nincs kártya.”

- **Intézménykártya**: „Intézmény” címke, név + rövidítés, összefoglaló; lábléc: „Részletek →” (a
  részletoldalra), honlap ↗, „Frissítve: <dátum>” (`updatedAt`, Europe/Budapest).
- **Listakártya**: „Lista” címke, név (a lista címe), összefoglaló (bevezető), a sorok (név · megjegyzés · ↗),
  a linkek; lábléc „Frissítve: <dátum>”. Nincs részletoldala.
- Admin: a lap tetején „+ Új intézmény” és „+ Új lista” (link a szerkesztőre), kártyánként a láblécben
  „Szerkesztés”, ↑, ↓ (bind-olt `mozgatKartyaAction`; az első kártyán a ↑, az utolsón a ↓ letiltva, a
  `KuldGomb` pendingjével).
- Minden külső link `target="_blank" rel="noopener noreferrer"`, ↗ jellel és rejtett „(új lapon nyílik)”
  felirattal.

**Részletoldal** (`/tudastar/[kategoria]/[slug]`): morzsamenü, név + rövidítés, összefoglaló, majd
kártyablokkok ebben a sorrendben: Profil és Kapcsolat (széles ablakban egymás mellett; a Kapcsolat a honlapot
is mutatja), Tevékenység, a szabad szakaszok (címük a blokk címe), Programok (név · egysoros leírás · ↗),
Hasznos linkek; alul „Frissítve”. Üres blokk nem jelenik meg. Admin: „Szerkesztés” gomb a cím mellett. A jobb
menü itt is látszik (az aktív kategória kártyái között ez kiemelve).

**Szerkesztő** (`uj`, `szerkesztes`; a page `requireAdmin()`-t hív): egy űrlap kártyablokkokkal (a
`RiportForm`/`BlokkForm` mintája):

1. Alapadatok: kategória (`NativeSelect`), név, rövidítés, összefoglaló (karakterszámlálóval), honlap; a típus
   csak felirat.
2. Csak intézménynél: Profil, Tevékenység (szövegdoboz, alatta súgósor: „Üres sor: új bekezdés · »- « kezdetű
   sor: felsorolás”), Kapcsolat (e-mail, telefon, cím), Szakaszok (cím + szöveg), Programok (név, leírás, URL).
3. Csak listánál: Sorok (név, megjegyzés, URL).
4. Mindkettőnél: Hasznos linkek (felirat, URL).

- A dinamikus sorok (`Szakaszok`, `Programok`, `Sorok`, `Linkek`) egy közös, generikus sorszerkesztőre
  épülnek: stabil sorazonosító (nem kerül a mentésbe), „+ Új sor”, ↑/↓/törlés, fókuszkezelés és a törlés utáni
  sorhiba-elrejtés a `RendezvenySorok` mintájára; a darabszám-korlátnál a „+ Új sor” letiltva, mellette
  szöveges magyarázattal (a letiltott gomb `title`-je nem látszik).
- A mezők vezéreltek (a React 19 sikeres action után alaphelyzetbe állítaná az uncontrolled mezőket).
- Rejtett mezők: `id` és `verzio` (`updatedAt` ms) szerkesztésnél, `tipus` létrehozásnál.
- A lábléc: „Mégse” (vissza), „Mentés” (`KuldGomb`); szerkesztésnél bal oldalt „Kártya törlése”
  (`AlertDialog` megerősítéssel, bind-olt `deleteKartyaAction`, `unstable_rethrow`, siker után a
  kategória-oldalra).

**Action-ök** (`app/(app)/tudastar/actions.ts`): `mentKartyaAction`, `mozgatKartyaAction`,
`deleteKartyaAction`. Sorrend: session → `canEditTudastar` (hiba: form-szintű `NINCS_JOG`, nem 404 – a nyitott
szerkesztő tartalma így nem vész el) → validálás → írás → `revalidatePath('/tudastar', 'layout')` →
átirányítás (intézmény: a részletoldalra; lista: a kategória-oldal `#k-<slug>` horgonyára). Elavult verzió:
form-hiba „A kártyát közben más módosította – töltsd újra az oldalt.”; törölt kártya: form-hiba „A kártya
közben törlődött.”

## Keresés

`lib/tudastar-kereses.ts` (tiszta függvények):

- `normalizal(s)`: NFD + az ékezetjelek (`\p{Diacritic}`) elhagyása + kisbetű.
- `keres(kartyak, q)`: a `q` (vágva, ≤ 200 karakter) szavakra bontva; egy kártya akkor talál, ha **minden** szó
  előfordul a kártya kereshető szövegében (név, rövidítés, összefoglaló, profil, tevékenység, szakaszok címe és
  szövege, programok neve és leírása, listasorok neve és megjegyzése, linkfeliratok). Eredmény:
  `{ kartya, hol, reszlet }` – a `hol` az első egyező rész neve (pl. „Programok”), a `reszlet` egy rövid,
  ~120 karakteres kivágás körülötte (pl. „XPAND – piacra lépési program…”).
- A nyitólap `?q=`-nál a csempék helyett: „N találat erre: »…« · Keresés törlése”, a találatok kategóriánként
  csoportosítva (szám + cím), soronként a kártya neve (link: intézmény → részletoldal, lista → kategória-oldal
  `#k-<slug>`), alatta a `hol: reszlet`. Találat nélkül: „Nincs találat erre: »…«.”
- Nincs benne: gépelés közbeni szűrés, kiemelés, rangsorolás (a sorrend a kategória és a `sorrend`).

## Kezdő tartalom (B fázis)

- **Forrás**: `scripts/tudastar-tartalom/<kategoria-slug>.ts` (9 fájl), a kártyák a szerkesztő űrlapértékeinek
  alakjában (slug megadva), a fájl fejkommentjében a források URL-jével és a lekérés dátumával (az országfájlok
  mintája). A felületen a forrás nem jelenik meg, csak a hivatalos linkek.
- **Kutatás**: kategóriánként egy subagent webes kereséssel, párhuzamosan. Szabályok: csak hivatalos forrás
  (az intézmény saját oldala, gov.hu, EU-oldalak); minden kártya honlapja a hivatalos oldal; a 2026-os
  kormányzati változások miatt a neveket, felügyeletet, URL-eket frissen ellenőrizni (pl. a Tudományos és
  Technológiai Minisztérium neve, hatásköre); kapcsolatnak csak intézményi elérhetőség (központi e-mail,
  telefon, cím), magánszemély adata nem; magyar nyelvű, eligazító, tömör szöveg a korlátokon belül.
- **Részletes intézménykártyát** kapnak a dokumentumban kiemeltek – a TTM (szakaszok: KFI-stratégia,
  prioritások, kiemelt ágazatok), az NKFIH (szakaszok: feladat- és hatáskör, az NKFI Alap programstratégiája,
  aktuális hazai és nemzetközi pályázatok, a pályázatok célcsoportjai, nemzetközi partnerkeresés és
  társfinanszírozás, Kormányzati Önerő Alap és más társfinanszírozási konstrukciók), a NIÜ (programok: XPAND,
  Enterprise Horizon, Hungarian Startup University Program, HSUP Doctorate, startup- és rendezvénytámogatási
  programok, technológiatranszferhez kapcsolódó projektek, Science Park és TTC projektek,
  innovációmenedzsment- és vállalkozásfejlesztési szolgáltatások; egysoros leírás + link) – és kategóriánként a
  1–2 kulcsintézmény (pl. HUN-REN, SZTNH). A dokumentum többi szereplőtípusa listakártya valós szereplőkkel és
  honlappal (a 9 kategória szereplőtípusai alább). Becslés: ~50–70 kártya, ebből ~12–15 részletes.
- A kategóriák `leiras`-a és `bevezeto`-je is ebben a fázisban készül (a `lib/tudastar-szotar.ts`-ben).
- **Futtató** `scripts/tudastar-tartalom.ts`: alapból csak ellenőriz, a DB-t nem nyitja meg – a
  `validalKartya` mellett szigorúan: ismeretlen mező, hibás URL, ütköző slug, üres kártya, korlát feletti
  szöveg (amit a validátor csonkolna vagy eldobna). `--sql`: a jóváhagyott tartalomból megírja az egyszeri,
  egyedi migrációt (`npx drizzle-kit generate --custom --name tudastar_kezdo_tartalom`, majd INSERT-ek
  helyes SQL-escape-pel; `szerzo_id` NULL).
- **Szállítás**: a migráció csak a felhasználó által átnézett tartalommal, a B fázis végén készül; a drizzle
  migrációs naplója miatt egyszer fut le. A hosting a következő buildnél alkalmazza; a repó demó DB-jébe
  `npm run db:migrate` viszi, a commit a CLAUDE.md eljárásával (`delete from session` → `PRAGMA
  wal_checkpoint(TRUNCATE)` → a fő fájl ellenőrzése WAL nélkül és a kijelölt blobé). Lefutás után a migráció
  nem változik; a tartalmat onnantól az admin gondozza.
- Az A fázis mintakártyái a böngészős QA során, a felületen kerülnek a helyi DB-be, és nem commitolódnak.

### A 9 kategória szereplőtípusai (a dokumentumból, a kutatás iránymutatása)

1. **Szakpolitikai irányítás és koordináció**: Tudományos és Technológiai Minisztérium; az innovációhoz
   kapcsolódó ágazati minisztériumok; innovációs, kutatási, tudomány- és technológiapolitikai koordinációs
   testületek; stratégiai és tanácsadó szervezetek. A TTM-nél külön: KFI-stratégia, prioritások, kiemelt
   ágazatok.
2. **Kutatás-fejlesztési és innovációs finanszírozás**: NKFIH; hazai és európai uniós támogatások kezelői;
   Horizont Európa nemzeti kapcsolattartók; EUREKA-, Eurostars-, COST- és egyéb programok hazai felelősei. Az
   NKFIH-nál külön: lásd fent.
3. **Innovációs szolgáltatások és vállalkozásfejlesztés**: Nemzeti Innovációs Ügynökség; országos
   vállalkozásfejlesztési szervezetek; inkubátorok és akcelerátorok; klaszterek; startup- és technológiai
   szervezetek; vállalati innovációs központok; nyílt innovációs programok működtetői. A NIÜ-nél külön: a
   programok (lásd fent).
4. **Kutatóhálózat és kutatóintézetek**: HUN-REN Magyar Kutatási Hálózat; HUN-REN kutatóközpontok és
   -intézetek; támogatott kutatócsoportok; nemzeti laboratóriumok; kutatási infrastruktúrák; önálló állami vagy
   nonprofit kutatóhelyek.
5. **Egyetemek és technológiatranszfer**: kutatóegyetemek; innovációs igazgatóságok;
   technológiatranszfer-irodák; technológiatranszfer-cégek; egyetemi inkubátorok; kompetenciaközpontok; science
   parkok; egyetemi kutatási infrastruktúrák; egyetemi spin-off portfóliók.
6. **Szellemi tulajdon, szabályozás és minősítés**: Szellemi Tulajdon Nemzeti Hivatala; szabványosítási
   szervezetek; akkreditációs és megfelelőségértékelési szervezetek; ágazati hatóságok; szabályozói
   tesztkörnyezetek; kutatásbiztonsági és technológiabiztonsági kapcsolattartók.
7. **Finanszírozók és befektetők**: állami és állami hátterű finanszírozók; kockázatitőke-alapok; üzleti angyal
   hálózatok; banki innovációfinanszírozás; corporate venture capital szereplők; inkubációs és akcelerációs
   befektetők; deep tech finanszírozók; egyetemi vagy proof-of-concept alapok.
8. **Kiemelt vállalati, piaci szereplők**: innovatív nagyvállalatok (top 10); jelentős KFI-központtal
   rendelkező vállalatok; nyílt innovációs programokat működtető cégek; kiemelt innovatív kkv-k, startupok és
   scale-upok; ágazati szövetségek; kamarák; klaszterek.
9. **Nemzetközi programok magyar kapcsolódási pontjai**: Horizont Európa; EIC; EIT és a KIC-ek; EUREKA;
   Eurostars; COST; Enterprise Europe Network; EURAXESS; kétoldalú TéT-programok; nemzetközi kutatási
   infrastruktúrák; EU-partnerségek; Widening-programok.

## Fájlok

| Fájl | Szerep |
| --- | --- |
| `db/schema/tudastar.ts` (+ `index.ts`, a generált migráció a következő szabad sorszámmal) | a tábla és a migrációja |
| `db/queries/tudastar.ts` | lekérdezések és mutációk |
| `lib/tudastar-szotar.ts` | kategóriák, típusok, korlátok, normalizáló |
| `lib/tudastar-validacio.ts` | `validalKartya` |
| `lib/tudastar-jog.ts` | `canEditTudastar` |
| `lib/tudastar-kereses.ts` | `normalizal`, `keres` |
| `lib/slug.ts` | slug-képzés |
| `app/(app)/tudastar/page.tsx` | nyitólap (csempék / találatok) |
| `app/(app)/tudastar/[kategoria]/page.tsx` | kategória-oldal |
| `app/(app)/tudastar/[kategoria]/[slug]/page.tsx` | részletoldal |
| `app/(app)/tudastar/[kategoria]/[slug]/szerkesztes/page.tsx`, `[kategoria]/uj/page.tsx` | szerkesztő |
| `app/(app)/tudastar/actions.ts` | a három action |
| `app/(app)/tudastar/components/` | `KategoriaCsempek`, `KeresesiTalalatok`, `KategoriaMenu`, `KategoriaValto`, `IntezmenyKartya`, `ListaKartya`, `Szoveg`, `KartyaForm`, a sorszerkesztő és a blokkjai, `KartyaTorles`, `MozgatoGombok` |
| `lib/navigacio.ts` | a Tudástár sor feliratai |
| `lib/knowledge.ts` | **törlődik** |
| `scripts/tudastar-tartalom.ts`, `scripts/tudastar-tartalom/*.ts` | B fázis: tartalom, ellenőrzés, migráció-írás |
| `CLAUDE.md` | a „Mi ez” bekezdés (a tudástár már DB-ből) és egy új „Tudástár” szakasz |

## Hibakezelés

- **404**: ismeretlen kategória vagy slug; a slug más kategóriához tartozik, mint az URL-ben; lista típusú
  kártya részletoldala; ismeretlen `?tipus=` az `uj` oldalon; nem admin a szerkesztő oldalakon
  (`requireAdmin()`). Egyik sem függ cookie-tól, ezért a 404 nem ragad be.
- **Form-szintű hiba** az action-ökben: megszűnt jog, elavult verzió, közben törölt kártya – a nyitott
  szerkesztő tartalma megmarad.
- A `metadata` minden tudástár-oldalon statikus („TéT Tudástár”); szivárgás dinamikus címmel sem lenne,
  mert mindenki mindent olvashat, de a lapcím így egységes és nem kell hozzá külön lekérdezés.

## Ellenőrzés

- `npx tsc --noEmit`, `npm run build`.
- A tartalomfuttató szigorú ellenőrzése (B fázis).
- Böngészős QA (gstack) a felhasználó futó dev szerverén (előtte a port munkakönyvtárát ellenőrizni):
  admin – létrehozás mindkét típussal, szerkesztés (szakasz/program/sor/link hozzáadása, mozgatása, törlése),
  hibás URL és félig kitöltött sor hibája és fókusza, ↑/↓, kategóriaváltás, verzióütközés két lapon, törlés;
  attasé – csak olvasás, a szerkesztő 404; keresés ékezet nélkül és több szóval; keskeny ablak (kategória-
  select); a QA végén kijelentkezés és a QA-kártyák törlése, a DB nem commitolódik.

## Nincs benne

Attasé-javaslat / visszajelzés a tartalomra, változástörténet, csatolmány és logó, technológiai
terület-címkék és -szűrő, a kategóriák DB-ből szerkesztése, angol nyelvű változat, teljes szöveges index.

## Tervezéskori pontosítások

1. **Egy kártya-komponens:** a kategória-oldal kártyáit egyetlen `TudastarKartya` rajzolja mindkét típusra, közös `KartyaLablec`-kel (a spec `IntezmenyKartya`/`ListaKartya` párja helyett); a megjelenítés a specé.
2. **A jobb menü kártya-linkjei:** a kategória-oldalon horgonyok (`#k-<slug>`); a részletoldalon a kártya helyére visznek (`kartyaUrl`: intézmény → részletoldal, lista → horgony), és az aktuális intézmény kiemelt (`aria-current="page"`).
3. **Foglalt slug:** `FOGLALT_SLUGOK = ['uj']` (`lib/tudastar-szotar.ts`) – a statikus `uj` szegmens elnyelné az ilyen slugú kártyát; a `createKartya` és a tartalom-futtató is kizárja.
4. **`KuldGomb`:** új opcionális propok (`size`, `disabled`, `aria-label`) az ↑/↓ ikon-gombokhoz; a meglévő hívók változatlanok.
5. **Útvonal-segédek** a `lib/routes.ts`-ben (`tudastarUrl`, `kartyaHorgony`, `kartyaUrl`, `kartyaSzerkesztoUrl`, `ujKartyaUrl`), a `csatolmanyUrl` mintájára.
6. **Pótolt korlátok:** e-mail ≤ 200, linkfelirat ≤ 120 karakter (a spec nem nevezte meg).
7. **Futtató:** `--csak <slug,…>` kapcsoló a párhuzamos kutatáshoz; a kategóriák `leiras`/`bevezeto` szövege a kategória-fájlokban készül, és a 11. task viszi át a szótárba (a `--sql` az egyezést ellenőrzi).
8. **A tartalom-migráció az átnézés előtt elkészül** és helyben lefut, hogy a tartalom a felületen nézhető legyen; push előtt a 12. task eljárásával újraírható és újra alkalmazható (a spec szerint „a B fázis végén” készült volna).
9. **Ismert korlát:** a kategória-oldal ↑/↓ gombja után a fókusz nem marad a gombon (a kártya DOM-ja áthelyeződik); a szerkesztő sorszerkesztője visszaadja.
10. **Keresés keskenyebb ablakban:** a kategória- és a részletoldalon a kereső a jobb menüben van; `xl` alatt (≈ 1280 px alatt) ott csak a kategória-választó látszik, a kereséshez a nyitólapra kell lépni (a spec szerint is a menü helyén csak a select áll).
11. **A találat helye (`hol`/`reszlet`):** nem az első egyező rész, hanem a legtöbb keresőszót tartalmazó (holtversenyben a korábbi), a név és a rövidítés helyett – ezek a találati sorban amúgy is látszanak; ha csak azokban talált, a `hol` üres, a `reszlet` az összefoglaló eleje. A szakasz címe és szövege külön rész: címre találva „Szakasz: <cím>”, szövegre „<cím>: <kivágás>”.
12. **Felsorolásjel:** a „- ” mellett a bemásolt szövegekben gyakori „– ” és „• ” kezdetű sor is felsoroláspont; az üres felsorolássor kimarad.
13. **Slug-hossz:** a `-2`, `-3`… utótag a 60 karakteres alapon felül járulhat hozzá; a tartalom-futtató a kézzel írt slug hosszát is ellenőrzi.
14. **Keresés és slug, Unicode:** a keresőszavak szélén álló írásjelek nem számítanak („NKFIH,”, „„XPAND””); az ékezetlenítés NFKD-vel megy, így a PDF-ből másolt ligatúrák („ﬁ”) is kereshetők és slugosíthatók; a kivágás nem vág UTF-16 párt.
15. **Normalizáló:** olvasáskor a teljesen üres sort (szakasz, program, link, listasor) is eldobja, mint a validátor.
16. **URL-szabályok szigorítása:** a hosztnévben pontnak kell lennie (a `valami` így nem lesz `https://valami/`, de az `https://localhost` is hibás); a 500 karakteres korlát a normalizált `href`-re vonatkozik; séma nélküli, portos cím (`nkfih.gov.hu:8080/x`) sémának látszik és hibát kap – mindhárom a biztonságos oldalra hibázik.
17. **Lekérdezések szignatúrái:** `getKartya(id)` (nem slug: az oldalak a `listKartyak()`-ból keresnek slug szerint, az actionök id-vel), `createKartya(adat, alap, szerzoId)` – a slug alapját a hívó képzi (az action: rövidítésből, tartalékként a névből), a függvény a szabad változatot keresi és beszúr; az `updateKartya` egy tranzakcióban olvas, hasonlít és ír (a spec `UPDATE … WHERE updated_at = ?` mintája helyett, azonos eredménnyel); a `listKartyak` az ismeretlen kategóriájú sort is kihagyja és logolja, és a kategórián belül `sorrend`, név, id szerint rendez (a mozgatás is ezt a sorrendet követi). A típus változatlanságát az action (a meglévő kártya típusát adja át) és az `updateKartya` is biztosítja (eltérésnél hibát dob).
18. **A tábla és az írások védelme:** CHECK a `tipus`-ra és a `tartalom` `json_valid`-jára (a kategóriára nem, az a kódban él); az `updateKartya`/`createKartya` csak explicit felsorolt tartalmi mezőket ír, az `updateKartya` típusváltásra hibát dob; az író tranzakciók `immediate`-ek; a `mozgatKartya` a kategóriát 1..n-re számozza újra (az azonos `sorrend`-ű kártyák is mozgathatók); a `mozgatKartyaAction` hibakezelést kap.
19. **Keresés akadálymentesen:** a nyitólapon állandó `role="status"` régió mondja be a találatszámot (a keresés nem vált címet, ezért a Next útvonal-bemondója hallgatna); a keresőmező vezérelt kliens-bemenet (`KeresoBemenet`), amely a `?q=`-hoz render közben igazodik, így Enter után a fókusz a mezőn marad. A csempék fölött rejtett „Kategóriák” címsor áll.
20. **A ↑/↓ action visszajelzés nélkül:** a `mozgatKartyaAction` sima `<form action>` (nincs `useActionState`), ezért jog hiányában vagy DB-hibánál csendben nem csinál semmit (a hibát logolja); a gombok csak adminnak látszanak, és a mozgatás nem veszít adatot.
21. **Komponensek:** az ↑/↓ gombok a `KartyaLablec`-ben vannak (nincs külön `MozgatoGombok`); a spec fájltáblájában nem szereplő, de a terv szerinti komponensek: `Morzsa`, `KulsoLink` (+ `LinkLista`, `TetelLista`), `TudastarElrendezes`, `IntezmenyReszlet`, `KeresoBemenet`, `KartyaMezo`/`UrlapBlokk`.
22. **Revalidálás:** minden tudástár-action `revalidatePath('/', 'layout')`-ot hív (a kódbázis konvenciója); a spec `revalidatePath('/tudastar', 'layout')`-ja a `(app)` route group miatt egyetlen oldalra sem illeszkedne (a tag `/(app)/tudastar/…`), csak a Next mostani durva server-action-revalidálása miatt működne.
23. **A jobb menü `xl`-től:** a 238 px-es oldalsáv mellett `lg`-n a tartalomnak ~450 px maradna, ezért a menü `xl` fölött jelenik meg (alatta a kategória-választó); a Profil/Kapcsolat két hasábja is `xl`-től. A menü kiemelése fehér háttér + keret (a szürke lapon a `bg-muted` nem látszik), a kategória-oldali kártya-linkek sima `<a>` horgonyok.
24. **A szerkesztő apróságai:** a Mentés sima `Button` a `useMuveletForm` pendingjével (a `BlokkForm`/`RiportForm` mintája, nem `KuldGomb`); a formázási súgósor a közös `Mezo` szerint a mező fölött áll; az Alapadatokban a honlap az összefoglaló előtt, a Programok és Sorok mezőiben a webcím a leírás/megjegyzés előtt áll (`SOR_MEZOK` sorrendje); a hozzáadás-gomb felirata listánként „+ Új szakasz / program / link / sor”.
25. **Sortörés egysoros mezőben:** a validátor szóközre cseréli (a szerkesztő `<input>`-ja szóköz nélkül dobná el), a tartalom-futtató hibának veszi; többsoros mező: az összefoglaló/bevezető, a profil, a tevékenység és a szakasz szövege.
