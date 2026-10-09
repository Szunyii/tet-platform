# Országprofilok feltöltése valós adatokkal – tervezési spec

Dátum: 2026-10-09
Állapot: jóváhagyva

## Cél

Az attasék 27 országot fednek le (székhelyként vagy régiósan). A 2026-os országprofilok közül
ma csak a KR és a JP teljes (mind a 8 blokk), a többi 25 üres, ezért a térképen „Nincs profil”
látszik, és a mutatók (GDP, GERD, kiemelt iparágak, kitöltöttség) nem működnek. A felhasználó
kérése: töltsük ki az országprofilokat valós adatokkal, és ez a hostingra is jusson el.

## Döntések

| Kérdés | Döntés | Indok |
| --- | --- | --- |
| Tartalom | Valós, teljes profil, mint a KR/JP: mind a 8 blokk, nyilvános forrásokból kutatva | A felhasználó döntése. Kutatott kiinduló vázlat, amelyet a relációs vezetők pontosítanak. |
| Országok | Mind a 25 üres ország: a 10 székhely-ország és a 15 régiós | A felhasználó döntése; így a térképen mindenhol van profil. |
| Év | Csak 2026, a futtatóban rögzítve (`EV = 2026`) | A térkép és a profil a fejléc évét mutatja; a 2026-os profil „Adott évi profil”. A kutatás a 2026-os állapotot rögzíti, ezért egy későbbi (pl. 2027-es) futás sem dátumozhatja át. A JP 2025-ös Alapadatok blokkja érintetlen. |
| KR, JP | Tartalmuk változatlan, csak külön fájlba költöznek | Már teljesek; átnézésük nem része ennek a munkának. |
| Hosting | Újabb egyszeri DB-csere (`DEMO_CSERE` új azonosítóval) | A felhasználó döntése, tudván, hogy a hostingon 2026-10-07 óta történt minden változás elvész. |
| Szerző | Az első admin | Mint eddig: a demó-tartalom nem kötődik valós attaséhoz. |
| Végrehajtás | Hat régiós csomag párhuzamosan, csomagonként formai és tényellenőrző review | A 25 ország kutatása így gyorsabb; minden subagent csak a saját országfájljait írja, ezért nincs ütközés. |

## Hatókörön kívül

- Más évek (2025 és korábbi) profiljai.
- A KR és JP tartalmának felülvizsgálata.
- Az országprofil-űrlap, a térkép vagy a validátor módosítása.
- Nem székhely- és nem régiós országok (attasé nélküli országok) profiljai.

## Tartalmi szabályok

**Nyelv és stílus.** Magyar, a KR/JP profil stílusában és terjedelmében: szöveges mezőnként
1–4 tömör mondat, felsorolásnál vesszővel vagy pontosvesszővel elválasztva. Intézmény- és
cégnevek a nemzetközileg használt alakban, szükség esetén magyar magyarázattal.

**Alapadatok – egységes forrás.** A térkép rangsorai csak akkor összevethetők, ha az országok
számai azonos forrásból és évből jönnek:

- GDP (folyó áron, milliárd USD), egy főre jutó GDP (USD) és reál GDP-növekedés (%): IMF World
  Economic Outlook, 2025. október, a 2025-ös évre; `adatEv` = 2025.
- Lakosság: ugyanabból a forrásból (IMF), ha ott nincs, az ENSZ vagy a nemzeti statisztikai
  hivatal 2025-ös becslése.
- Terület (km²): a nemzeti statisztikai hivatal vagy a CIA World Factbook.
- `forras`: „IMF World Economic Outlook (2025. október), Világbank, <nemzeti statisztikai hivatal>”.
- Ahol az IMF nem közöl adatot (Amerikai Virgin-szigetek, Észak-Korea), a hivatalos becslés
  kerül be (pl. az USA Gazdaságelemzési Hivatala, a Bank of Korea), a `forras` ezt nevezi meg,
  és az `adatEv` a becslés tényleges éve. Amire nincs megbízható adat, az üres marad.
- Tagságok és ágazatok a szótár listáiból; ami nincs a listában, az „egyéb” mezőbe kerül.

**KFI-rendszer.**

- `teljesitmeny`: a Global Innovation Index 2025 helyezés (ha az ország szerepel), a GERD
  adatéve és forrása (UNESCO UIS, OECD MSTI vagy Világbank), és 1–2 jellemző trend.
- `gerd`: a legfrissebb elérhető év GDP-arányos K+F ráfordítása (%); ha nincs megbízható adat,
  üres.
- `strategia`: a hatályos nemzeti KFI-stratégia neve és időtávja (legfeljebb 200 karakter).
- Prioritások és kiemelt iparágak a szótárból, ami nincs benne, az „egyéb” mezőbe kerül. A
  kiemelt iparágak közül az első adja a térkép színét, ezért az legyen az ország
  legjellemzőbb KFI-területe.

**Rendezvények.** Visszatérő, valóban létező események (név, a szokásos hónap és helyszín,
típus). Konkrét 2026-os dátum csak ellenőrzött forrásból kerül be. Legfeljebb 10 esemény.

**Magyar vonatkozás.** Az `egyezmeny`, a `ketoldalu` és a `mobilitas` mezőbe csak ellenőrzött
tény kerül: például egy kétoldalú TéT- vagy tudományos-technológiai egyezmény neve és éve, az
NKFIH kétoldalú programjai, a Stipendium Hungaricum partnerországi státusza, ismert magyar
telephelyek. Ha nem ellenőrizhető, a mező üres marad. A `magyarErtekeles` blokk értékelés és
javaslat: tényekre épül (pl. meglévő befektetések, programok), de nem állít új tényt.

**Tilos a kitalálás.** Nem kerülhet be kitalált egyezmény, megállapodás, projekt, személy,
intézményi kapcsolat, dátum vagy szám. A bizonytalan állítás kimarad.

**Részleges profilok.** A kis területeknél (Puerto Rico, Amerikai Virgin-szigetek,
Maldív-szigetek, Guyana, Suriname, Mauritánia) csak azok a blokkok töltődnek ki, amelyekhez
van valós tartalom; a többi mentetlen marad, ami a térképen kisebb kitöltöttségként látszik.
Egy blokkon belül az ismeretlen mező üres.

**Észak-Korea.** Kitöltődik az Alapadatok blokk (becslésekkel, forrással) és a Kapcsolatok
blokk, benne az ENSZ BT 2321 (2016) határozata, amely a tudományos és műszaki együttműködést
tiltja (kivételekkel). A Magyar értékelés blokk rövid, és ezt a korlátot rögzíti. A többi
blokk mentetlen.

**Mezőkorlátok** (a validátor szerint, `lib/orszagprofil-validacio.ts`):

| Mező | Korlát |
| --- | --- |
| `fovaros`, `penznem`, `forras`, `tagsagEgyeb`, `agazatEgyeb`, `strategia`, `prioritasEgyeb`, `iparagEgyeb`, `vallalati.agazatEgyeb`, `egyezmeny` | legfeljebb 200 karakter |
| `osszegzes` | legfeljebb 500 karakter |
| a többi szöveges mező | legfeljebb 4000 karakter |
| `topVallalatok` | legfeljebb 10 név, soronként egy, nevenként legfeljebb 200 karakter |
| rendezvény | legfeljebb 10 sor; név kötelező; név, időpont, megjegyzés legfeljebb 200 karakter; típus: `szakkiallitas`, `konferencia` vagy `forum` |
| `terulet`, `lakossag`, `gdpEgyFore` | pozitív egész |
| `gdp` | 0 és 1 000 000 között, legfeljebb 1 tizedes |
| `gdpNovekedes` | −100 és 100 között, legfeljebb 1 tizedes |
| `adatEv` | 2010 és 2026 között |
| `gerd` | 0 és 100 között, legfeljebb 2 tizedes |

A számok magyar formában (szóköz ezreselválasztó, tizedesvessző), ahogy az űrlapon.

## Országok és csomagok

| Csomag | Országok | Megjegyzés |
| --- | --- | --- |
| 1 | DE, AT, GB, IE | GB és IE: Balogh András Zoltán (London) |
| 2 | FR, DZ, MA, TN, MR | Szántó Szilvia (Párizs) régiója |
| 3 | US, CA, PR, VI | dr. Nagy Gabriella és Mészáros Eleonóra; PR és VI részleges |
| 4 | BR, GY, SR, IL | GY és SR részleges |
| 5 | RU, CN, KP | KP részleges (szankciók) |
| 6 | IN, BD, LK, NP, MV | Daczi Diána (Új-Delhi) régiója; MV részleges |

## Kód

**Fájlszerkezet.**

- `scripts/demo-orszagprofil.ts` – a futtató.
- `scripts/demo-orszagprofil/tipusok.ts` – közös típusok és segéd:
  - `Urlap` – egy blokk űrlap-értékei: mezőnév → string vagy string-lista;
  - `DemoOrszag` – `{ kod: string; profil: Partial<Record<BlokkKulcs, Urlap>> }`;
  - `rendezvenyek()` – a rendezvény-sorokból `rendezveny.<i>.<mezo>` kulcsokat épít.
- `scripts/demo-orszagprofil/orszagok/<kod>.ts` – országonként egy fájl (kisbetűs kóddal,
  pl. `de.ts`), `export default` egy `DemoOrszag`. A KR és a JP a mostani tartalmával költözik ide.

**Futtató.**

1. Beolvassa az `orszagok/` mappa `<két kisbetű>.ts` fájljait (dinamikus import, fájlonként
   elkapott betöltési hibával). Teljes ellenőrzésnél minden más fájlnév hiba. Ellenőrzi, hogy a
   fájlnév és a `kod` egyezik, és hogy a kód a `lib/orszagok.ts` szótárában van.
2. Minden ország minden megadott blokkját ellenőrzi:
   - `validalBlokk(blokk, fd, 2026)`;
   - szigorúbban is. Hiba minden, amit a validátor némán eldobna vagy kicserélne:
     - ismeretlen mezőnév;
     - szótáron kívüli listás opció vagy rendezvénytípus;
     - vezető nullás vagy 10 feletti rendezvény-index;
     - név vagy típus nélküli, illetve üres rendezvénysor;
     - nem szöveges érték;
     - ponttal írt szám (a validátor a `.ddd`-t ezreselválasztónak veszi);
     - az üres blokk, mert mentve kitöltöttnek számítana.
3. Ha bárhol hiba van, mindet kiírja `<fájl>: <blokk>.<mező>: <üzenet>` alakban, és nem ír a
   DB-be.

**Módok.** Mindegyik a repó gyökeréből fut, `NODE_OPTIONS="--conditions=react-server" npx tsx
scripts/demo-orszagprofil.ts` előtaggal:

| Argumentum | Mit csinál | Megnyitja-e a DB-t |
| --- | --- | --- |
| nincs | minden ország ellenőrzése | nem |
| `--csak DE,AT` vagy `--csak=DE,AT` | csak a megadott országok ellenőrzése (a párhuzamos csomagoké) | nem |
| `--ir` | minden ország ellenőrzése, hibátlan adatnál írás egy tranzakcióban | igen |

- **Hibás argumentum.** Más argumentum, illetve a `--ir` és a `--csak` együtt használati hiba.
  Így egy elírt kapcsoló sem írhat az éles DB-be.
- **Mit ír a `--ir`.** A meg nem adott blokkhoz nem nyúl (részleges profil). Idempotens, a
  szerző az első admin, és országonként egy sort ír ki.
- **Figyelmeztetés.** Ha a DB-ben olyan blokk is mentett, ami a fájlban nincs, `FIGYELEM` sort
  ír, mert a futtató blokkot nem töröl.

## Hosting

A `scripts/db-init.mjs` `DEMO_CSERE` azonosítója `2026-10-07` helyett `2026-10-09` lesz.
A push utáni első build a hosting-DB-t lecseréli a repó demó DB-jére (a régi fájl a `-wal` és
`-shm` párjával `<db>.regi-<időbélyeg>` néven megmarad), és új jelölőfájlt ír; a későbbi
buildek nem cserélnek. A hostingon 2026-10-07 óta történt minden változás elvész, például:

- az attasék jelszócseréi (a fiókok jelszava visszaáll a közös demó jelszóra);
- az új felhasználók;
- a bejegyzések és a ticketek;
- a profilmentések.

A logika nem változik, csak az azonosító és a kommentje.

## Demó DB

A futtató `--ir`-rel a repó `data/tet.db`-jét tölti fel (előtte a DB egy másolatán
próbaüzem). Commit előtt:

```bash
sqlite3 data/tet.db "delete from session; VACUUM; PRAGMA wal_checkpoint(TRUNCATE);"
```

A `delete from session` a felhasználó helyi bejelentkezését is törli (2026-10-09-én egy ilyen
sor van); a publikus repóba nem kerülhet érvényes session-token.

## Dokumentáció

- `CLAUDE.md`, Parancsok: a futtató sora (ellenőrző móddal), és hogy az országadatok a
  `scripts/demo-orszagprofil/orszagok/` alatt vannak.
- `README.md`: a `DEMO_CSERE` bekezdés az új azonosítóval és az adatvesztés leírásával; a demó
  DB leírásában a mintaprofilok köre (27 ország, 2026).

## Ellenőrzés

- Csomagonként: `--csak <kódok>` hibátlan; a formai és szabály-review, majd a tényellenőrző
  review (független webes ellenőrzés: minden alapadat-szám, GERD, GII-helyezés, stratégia,
  intézmény- és cégnevek, rendezvények, és minden magyar vonatkozású állítás).
- A futtató `--ir`-rel a demó DB egy másolatán, majd a `data/tet.db`-n. A 2026-os profilok száma
  27; a blokkok száma országonként a terv szerinti; a JP 2025-ös sor változatlan.
- A `db-init` cseréje egy ideiglenes célfájlon:
  - felhasználós DB a régi (`2026-10-07`) jelölővel → csere, mentés és új jelölő;
  - második futás → nincs másolás.
- `npx tsc --noEmit`, `npm run build`.
- gstack (a felhasználó futó dev szerverén, adminnal):
  - a térkép GDP/fő és GERD mutatóval: színezett országok, rangsor;
  - „Kiemelt iparág” mutatóval: az országok színe;
  - néhány profiloldal (pl. DE, US, KP, MV): a kitöltött és a mentetlen blokkok;
  - `console --errors` üres; a végén kijelentkezés.

## Végrehajtás

1. **Átalakítás:** a fájlszerkezet, a KR/JP átköltöztetése, a futtató (szigorú
   listaellenőrzés, részleges profil, ellenőrző mód). Kimenete: a teljes futtató a mostani két
   országgal ugyanazt írja a DB-be, mint eddig.
2. **Hat csomag párhuzamosan:** minden subagent webes kutatással megírja a saját
   országfájljait, és lefuttatja rájuk az ellenőrző módot. Csomagonként két review:
   - formai és szabály-megfelelés;
   - tényellenőrzés.

   A javításokat ugyanaz az implementer végzi.
3. **Lezárás:**
   - a demó DB feltöltése és tisztítása;
   - a `DEMO_CSERE` léptetése;
   - dokumentáció;
   - build;
   - böngészős ellenőrzés.

Az eredmény kutatott vázlat: a relációs vezetőknek érdemes átnézniük és pontosítaniuk.

## Megvalósítási eltérések

A Task 1 minőségi review-ja nyomán, a terv eredeti futtatójához képest:

- **Módok.** A futtató alapból csak ellenőriz, írni a `--ir` kapcsolóval lehet. Az ismeretlen
  argumentum használati hiba. A tervben az argumentum nélküli futás írt, így egy elírt kapcsoló
  (pl. `--csak=KR`) csendben az éles `data/tet.db`-be írt volna, és mivel a futtató blokkot nem
  töröl, ezt egy későbbi futás sem javítja ki.
- **Az év.** Rögzítve 2026 (`EV`), nem az `aktualisEv()`.
- **Újabb szigorú ellenőrzések:**
  - az üres blokk, mert kitöltöttnek számítana;
  - a ponttal írt szám;
  - a vezető nullás rendezvény-index;
  - a hiányos vagy üres rendezvénysor;
  - a nem szöveges érték;
  - a rossz fájlnév;
  - a fájlonkénti betöltési hiba;
  - a `--ir` utáni figyelmeztetés a fájlban már nem szereplő, de mentett blokkra.
- **Hibaformátum.** Egységes: `<fájl>: <blokk>.<mező>: <üzenet>`.
