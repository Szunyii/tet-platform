# Országprofil: a 6. blokk kettébontása (6.1 és 6.2) – tervezési spec

Dátum: 2026-10-12
Állapot: jóváhagyva

## Cél

Az országprofil 6. blokkja („Nemzetközi és magyar–fogadó országbeli KFI/TéT kapcsolatok”,
kulcsa `kapcsolatok`) ma egy kártya egy Mentés gombbal és egy JSON-oszloppal, öt mezővel. Két
külön témát fog össze: a fogadó ország saját nemzetközi kapcsolatait és a magyar vonatkozású
kapcsolatokat.

A felhasználó kérése: a 6. rész legyen kettébontva.

1. **Két- és többoldalú kapcsolatok**: felül a „Legfőbb partnerországok” sor, alatta az „EU és
   multilaterális kapcsolatok” sor.
2. **Magyar–fogadó országbeli kapcsolatok**: a mostani három sor marad (Érvényes TéT-egyezmény,
   Kétoldalú együttműködések, Mobilitás), az utolsó címe „Mobilitási lehetőségek” lesz.

Az adatbázis is kövesse a bontást, a már mentett tartalom megmarad.

## Döntések

| Kérdés | Döntés | Indok |
| --- | --- | --- |
| A bontás módja | Két önálló blokk: külön kártya, külön Mentés, külön DB-oszlop | A felhasználó döntése. A két rész külön menthető, és külön számít a kitöltöttségbe. |
| Számozás | „6.1.” és „6.2.”, a 7. blokk 7. marad | A felhasználó döntése: a 6. rész két alrésze, a többi blokk száma nem változik. A magyar tizedes számozás záró ponttal áll. |
| Blokk-kulcsok | `nemzetkoziKapcsolatok` és `magyarKapcsolatok`; a `kapcsolatok` kulcs megszűnik | Egy megtartott `kapcsolatok` kulcs félrevezető lenne: nem derülne ki belőle, melyik felet jelenti. |
| Mezőkulcsok | Változatlanok: `partnerorszagok`, `euMultilateralis`, `egyezmeny`, `ketoldalu`, `mobilitas` | Csak a blokkhoz tartozás, a sorrend és két címke változik; a tartalom átvitele így mezőnként egy az egyben megy. |
| Címkék | „Partnerországok” → „Legfőbb partnerországok”; „Mobilitás” → „Mobilitási lehetőségek”; a többi marad | A felhasználó kérése. A magyarázat- és példaszövegek érvényesek maradnak. |
| DB-megoldás | Valódi oszlopbontás migrációval: két új oszlop, a meglévő JSON szétosztása SQL-ben, a régi oszlop törlése | Tiszta végállapot, egy igazságforrás. Lokálisan és a hosting buildben magától lefut. Az elvetett változatok: a régi oszlop megtartása olvasáskori visszaeséssel (örök legacy-ág), illetve megtartása tartaléknak (halott oszlop). |
| A mentettség átvitele | Ahol a régi blokk mentett volt, mindkét új blokk mentett lesz, akkor is, ha az egyik fele üres | A régi blokk is mentettnek számított üres mezőkkel. Így senki nem veszít blokkot: a 8/8-as profil 9/9-es lesz. |
| Két migrációs fájl | `0008` (két új oszlop + adatmásolás), `0009` (a régi oszlop törlése) | A drizzle-kit egy lépésben hozzáadott és törölt oszlopnál interaktívan rákérdez az átnevezésre, ami parancssorból nem futtatható. Külön lépésben nincs kérdés. Ugyanez a minta, mint a 0006/0007. A migrátor a függőben lévőket egy tranzakcióban futtatja, tehát a kettő együtt atomi. |
| Hosting | A `DEMO_CSERE` azonosító nem változik | A `2026-10-09`-es csere még nem ment ki (a `main` nincs pusholva), így a push utáni első build a már migrált demó DB-t viszi fel. Egy csere nélküli DB-n a build `drizzle-kit migrate` lépése végzi el a bontást. |

## Hatókörön kívül

- A mezők tartalmi átírása a 27 megírt profilban: a szövegek változatlanok, csak a szerkezet.
- A magyarázat- és példaszövegek átfogalmazása.
- A többi blokk átszámozása vagy átnevezése.
- Blokkonkénti `updatedAt` (ma a profilsor közös időbélyege van).
- A korábbi specek és tervek (`docs/superpowers/`) utólagos átírása: azok a keletkezésük
  állapotát rögzítik.

## Szótár (`lib/orszagprofil-szotar.ts`)

A `BLOKKOK` listában a `kapcsolatok` sor helyére két sor kerül, ebben a sorrendben:

| Kulcs | Cím |
| --- | --- |
| `nemzetkoziKapcsolatok` | 6.1. Két- és többoldalú kapcsolatok |
| `magyarKapcsolatok` | 6.2. Magyar–fogadó országbeli kapcsolatok |

A `Kapcsolatok` interfész megszűnik, helyette:

```ts
export interface NemzetkoziKapcsolatok {
  partnerorszagok: string;
  euMultilateralis: string;
}
export interface MagyarKapcsolatok {
  egyezmeny: string;
  ketoldalu: string;
  mobilitas: string;
}
```

A mezők sorrendje az interfészben, a normalizálóban, a validátorban, az űrlapon és az olvasó
nézetben is ez. A `ProfilBlokkok`, a `NORMALIZALOK` és a `MEZO_CIMKEK` a két új kulcsot kapja;
mindhárom kimerítő a `BlokkKulcs` unión, ezért egy kihagyott bejegyzés fordítási hiba.

Címkék (`MEZO_CIMKEK`):

| Blokk | Mező | Címke | Változás |
| --- | --- | --- | --- |
| `nemzetkoziKapcsolatok` | `partnerorszagok` | Legfőbb partnerországok | új címke |
| `nemzetkoziKapcsolatok` | `euMultilateralis` | EU és multilaterális kapcsolatok | – |
| `magyarKapcsolatok` | `egyezmeny` | Érvényes TéT-egyezmény | – |
| `magyarKapcsolatok` | `ketoldalu` | Kétoldalú együttműködések | – |
| `magyarKapcsolatok` | `mobilitas` | Mobilitási lehetőségek | új címke |

A `magyarazat` és a `pelda` szövegek szó szerint átkerülnek a mezőjükkel.

## Adatbázis

### Séma (`db/schema/orszagprofil.ts`)

A `kapcsolatok` oszlop helyett kettő, mindkettő nullázható JSON (`null` = még nem mentett blokk):

- `nemzetkoziKapcsolatok` → `nemzetkozi_kapcsolatok`, típusa `NemzetkoziKapcsolatok`
- `magyarKapcsolatok` → `magyar_kapcsolatok`, típusa `MagyarKapcsolatok`

A property-nevek megegyeznek a blokk-kulcsokkal, mert a `db/queries/orszagprofil.ts` a sort a
blokk-kulccsal indexeli (`r[k]`, `[blokk]: tartalom`). A lekérdező modul ezért nem változik.

### Migráció

Két fájl, mindkettő `drizzle-kit generate`-tel készül (a snapshotok így pontosak), az
adatmásolás kézzel kerül a `0008` végére.

`0008`: két `ALTER TABLE … ADD`, majd:

```sql
UPDATE `orszagprofil` SET
  `nemzetkozi_kapcsolatok` = json_object(
    'partnerorszagok', coalesce(json_extract(`kapcsolatok`, '$.partnerorszagok'), ''),
    'euMultilateralis', coalesce(json_extract(`kapcsolatok`, '$.euMultilateralis'), '')
  ),
  `magyar_kapcsolatok` = json_object(
    'egyezmeny', coalesce(json_extract(`kapcsolatok`, '$.egyezmeny'), ''),
    'ketoldalu', coalesce(json_extract(`kapcsolatok`, '$.ketoldalu'), ''),
    'mobilitas', coalesce(json_extract(`kapcsolatok`, '$.mobilitas'), '')
  )
WHERE `kapcsolatok` IS NOT NULL AND json_valid(`kapcsolatok`);
```

`0009`: `ALTER TABLE orszagprofil DROP COLUMN kapcsolatok`.

Tulajdonságok:

- A hiányzó kulcs üres szöveg lesz (`coalesce`); a normalizáló amúgy is erre egészítené ki.
- A nem mentett régi blokk (`NULL`) után mindkét új oszlop `NULL` marad.
- A `json_valid` feltétel miatt egy hibás JSON-t tároló sor nem buktatja el a migrációt (és vele
  a buildet). Ilyen sor a Drizzle JSON-oszlopán át nem keletkezhet; ha mégis volna, az
  olvashatatlan tartalma a `0009`-cel elvész, a két új blokk pedig mentetlen marad.
- Nyers SQL, ezért az `updated_at` és a `szerzo_id` nem változik.
- A tábla nem épül újra (nincs `__new_…` + `DROP TABLE`), így a kaszkád-törlés veszélye, amelyre
  a CLAUDE.md figyelmeztet, itt nem áll fenn.
- Visszafordíthatatlan: a `0009` után a régi kód (amely a `kapcsolatok` oszlopot kérdezi) nem
  fut a DB-n. A tartalom hiánytalanul megvan az új oszlopokban.

### Demó DB (`data/tet.db`)

A demó DB-ben 28 profilsor van; 25-ben mentett a `kapcsolatok` blokk, mind az öt kulccsal
(`JP` 2025, `PR` 2026 és `VI` 2026 nem mentett). A migráció helyben fut le rajta
(`npm run db:migrate`), a fájl a commit része. A commit előtt `delete from session`,
`PRAGMA wal_checkpoint(TRUNCATE)`.

A futó dev szerver ugyanezt a fájlt használja, ezért a lépések sorrendje úgy van megválasztva,
hogy a szerver egyik pillanatban se kérdezzen nem létező oszlopot:

1. a két új oszlop és az adatmásolás (`0008`) – a régi kód az új oszlopokat nem látja;
2. a kód átállítása az új blokkokra – az új oszlopok ekkor már ki vannak töltve;
3. a régi oszlop törlése (`0009`) – ekkor már semmi nem hivatkozik rá.

## Kód

- **Validátor** (`lib/orszagprofil-validacio.ts`): a `VALIDALOK` `kapcsolatok` bejegyzése helyett
  kettő. A korlátok változatlanok: `egyezmeny` `ROVID_MAX`, a többi `SZOVEG_MAX`. A hibaüzenetek
  a címkéből épülnek, így az új címkéket írják.
- **Szerkesztő űrlap** (`app/(app)/orszagprofil/components/mezok/`): a `KapcsolatokMezok.tsx`
  megszűnik, helyette `NemzetkoziKapcsolatokMezok.tsx` és `MagyarKapcsolatokMezok.tsx`,
  ugyanazzal a mintával (`BlokkForm`, `useBlokkAllapot`, `mezoId`). A mezők `id`-ja
  `nemzetkoziKapcsolatok.<mezo>`, illetve `magyarKapcsolatok.<mezo>`; a `name` a puszta mezőnév.
- **Szerkesztő oldal** (`app/(app)/orszagprofil/[kod]/szerkesztes/page.tsx`): a két új komponens
  a Rendezvények és a Magyar értékelés között, 6.1, majd 6.2 sorrendben. A blokk-formok száma
  8-ról 9-re nő; a `<Fragment key={ev}>` kommentje is ezt írja.
- **Olvasó nézet** (`components/orszagprofil/BlokkNezet.tsx`): a `NEZETEK` `kapcsolatok`
  bejegyzése helyett kettő, az új mezősorrenddel.
- **Automatikusan követi** (a `BLOKK_KULCSOK`-ból számol, kódváltozás nélkül): a profil oldal
  „x/9 blokk kitöltve” sora és blokk-listája, a térkép „Kitöltöttség” mutatójának `/9` utótagja,
  a `sorbol()` mentett-listája, a `mentBlokkAction` blokk-ellenőrzése.

## Demó-profilok (`scripts/demo-orszagprofil/orszagok/*.ts`)

A 25 országfájlban, ahol van `kapcsolatok` blokk, az objektum két blokkra oszlik. A szövegek
bájtra azonosak maradnak, csak a szerkezet és a mezők sorrendje változik:

```ts
nemzetkoziKapcsolatok: { partnerorszagok: …, euMultilateralis: … },
magyarKapcsolatok: { egyezmeny: …, ketoldalu: …, mobilitas: … },
```

A futtató szigorú ellenőrzése az üres blokkot hibának veszi. A mostani adatban ez nem fordul
elő: mind a 25 országban mindkét félnek van legalább egy kitöltött mezője (a DB-n ellenőrizve;
több országban üres egy-egy mező, pl. `GY`, `KP`, `MV`, `NP`, `SR`, de egy teljes fél sehol).

A futtató (`scripts/demo-orszagprofil.ts`) kódja nem változik: a blokkokat a `BLOKK_KULCSOK`-ból
veszi, a `LISTAK` táblában a kapcsolati blokkoknak nincs bejegyzése. Az `--ir` nem fut le újra:
a DB-t a migráció állítja át, és az `--ir` minden profil `updated_at`-jét mára írná.

## Dokumentáció

- **CLAUDE.md**: az Országprofil bekezdésben a darabszámok (9 JSON-oszlop: `alapadatok` + a 8
  KFI-blokk; 9 blokk-form), a két új blokk-kulcs, és egy mondat a `0008`/`0009` migrációról.
- **README.md**: a hosting-szakaszba egy pont: a `0008`/`0009` visszafordíthatatlan; a build
  ideje alatt a még futó régi verzió a profilt olvasó oldalakon (térkép, országprofil, admin
  oldalsáv) hibát ad, mert a törölt oszlopot kérdezi; valós adatnál előtte mentés.

## Ellenőrzés

1. `npx tsc --noEmit` és `npm run build` hibátlan.
2. A demó-futtató ellenőrző módja (`NODE_OPTIONS="--conditions=react-server" npx tsx
   scripts/demo-orszagprofil.ts`) mind a 27 országra rendben; a 25 érintett országnál a
   blokkszám eggyel nő.
3. Adat-összevetés a migráció előtt készített mentéssel (`sqlite3 … ".backup"`, a
   scratchpadbe): mind a 28 sorra
   - az öt mező értéke a régi oszlopból és az új oszlopokból kiolvasva azonos;
   - ahol a régi oszlop `NULL` volt, mindkét új oszlop `NULL`; ahol nem, egyik sem;
   - az `updated_at` és a `szerzo_id` változatlan;
   - a `kapcsolatok` oszlop nem létezik.
4. A DB és az országfájlok egyezése eldobható scripttel: mind a 27 országra a `getProfil(kod,
   2026)` két kapcsolati blokkja megegyezik a fájl validált értékével.
5. Böngészős QA a futó dev szerveren (admin):
   - szerkesztő: két kártya a helyes címmel és mezősorrenddel; a 6.1 mentése nem érinti a
     6.2-t és fordítva; hosszú szövegnél a hiba a megfelelő kártya mezőjénél jelenik meg, az
     új címkével; a kérdőjeles magyarázat mindkét kártyán nyílik;
   - olvasó nézet: két szakasz, „x/9 blokk kitöltve”;
   - térkép: a „Kitöltöttség” mutató `/9`-cel számol.
   A QA-mentések egy külön (ország, év) soron történnek, amely a végén törlődik, hogy a demó
   DB tartalma ne változzon.

## Megvalósítási eltérések

- **Fejléc-kommentek az országfájlokban.** A spec csak a blokkok szétosztását írta le. A fájlok
  elején álló kommentek a régi blokknévvel hivatkoztak mezőkre és blokkokra, ezért 9 fájlban 13
  szövegrész is változott (`ca` ×2, `ie`, `kp` ×2, `mr`, `gy` ×2, `sr` ×2, `pr`, `vi`, `us`). A
  profilok megjelenő szövegei bájtra változatlanok.
- **Változatlanul hagyott kereszthivatkozások a tartalomban.** Négy megjelenő szöveg
  „(lásd Kapcsolatok)” alakban utal a korábbi közös blokkra: `cn.ts` (Programok → nemzetközi
  részvétel; Magyar értékelés → együttműködési lehetőségek), `jp.ts` és `kr.ts` (Programok →
  nemzetközi részvétel). A tartalom átírása hatókörön kívül volt, ezért maradtak; a hivatkozás
  pontatlan, de nem téves (mindkét új blokk címében szerepel a „kapcsolatok”). A javításhoz a
  DB-nek is követnie kell a fájlokat.
- **Bővebb DB-ellenőrzés** (a review-k nyomán). A régi oszlop törlése előtt külön ellenőrzés
  futott arra, hogy a mentés óta senki nem írt a régi blokkba (a `0008` egyszeri másolat). A DB
  commitja előtt a fő fájl önmagában (`immutable=1`, a WAL nélkül) és a commitra kijelölt változat
  is ellenőrizve lett, mert a hosting `db:init`-je csak a fő fájlt másolja. A checkpoint mellett
  `VACUUM` is futott (a törölt oszlop helye felszabadult, a fájl mérete nem nőtt).
- **WAL.** A futó dev szerver nyitva tartotta a DB-t, ezért a két migráció a `data/tet.db-wal`-ban
  élt, és a `data/tet.db` a záró checkpointig a git szerint változatlan maradt. Az ág köztes
  commitjaiban ezért a követett DB-fájl még a `0007`-es állapot.
- **Dokumentáció.** A README hosting-pontja a spec vázlatánál bővebb: a két migráció csak együtt
  mehet ki; a build alatt a régi verzióban a mentés is elbukik; a visszaállítás fájlneve; az
  egyszeri `DEMO_CSERE` buildjének esete. A CLAUDE.md két új „Amire figyelni kell” pontot kapott
  (új blokk regisztrálása – a szerkesztő oldal blokk-listája kézi; mikor kell adatmigráció), és
  egy megjegyzést a kézi utasítás helyéről a generált migrációban.
- **QA.** A mentések az `AT` 2020 soron történtek, a sor a végén törölve. A commit előtti
  `delete from session` a helyi dev szerver élő böngészős munkameneteit is törölte.
