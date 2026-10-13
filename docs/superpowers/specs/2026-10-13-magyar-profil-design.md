# Magyarország országprofilja az összehasonlításhoz – tervezési spec

Dátum: 2026-10-13
Állapot: jóváhagyott terv, megvalósítás előtt
Ág: `magyar-profil` (a `jelentes-intezkedes` ág tetején)

## Cél

Magyarország is szerepeljen az országprofilok között, hogy a magyar adatok a térképen, a rangsorokban
és az összehasonlító táblában a többi ország adatai mellé tehetők legyenek.

## Kiinduló állapot

- Magyarország benne van az országszótárban (`lib/orszagok.ts`: `HU`, `geo: 'Hungary'`), de nincs
  profilja és nincs attaséja.
- A `listTerkepAdat(ev)` minden olyan országot visszaad, amelynek van aktív attaséja **vagy**
  profilja. Egy `HU` profilsor tehát elég ahhoz, hogy Magyarország megjelenjen a térképen, a
  rangsor-panelen és az összehasonlítás „+ Ország” listájában – ehhez kódot nem kell írni.
- Az admin bármely szótárbeli ország profilját szerkesztheti (`canEditProfil`), attasé csak azt,
  amelynek relációs vezetője. Magyarország profilját így eleve csak a központ szerkesztheti.

## Döntések

| Kérdés | Döntés |
| --- | --- |
| Megjelenés | Mint a többi ország: térkép, rangsor, összehasonlítás. Nincs állandó viszonyítási oszlop. |
| Adatok | Teljes kutatott 2026-os profil, a 27 ország módszerével és forrásrendjével. |
| A két „magyar szempontú” blokk | A 6.2 (`magyarKapcsolatok`) kimarad. A 7. blokkból (`magyarErtekeles`) csak az `osszegzes` mező készül el, mert ez adja a térkép oldalsó kivonatának összegző szövegét. |
| Attasé nélküli feliratok | Magyarországnál „nincs aktív attasé” helyett „hazai profil – a központ tartja karban”. |
| Tárolás | A meglévő feltöltő úton: `scripts/demo-orszagprofil/orszagok/hu.ts` + `--ir`. |

## Hatókörön kívül

- Állandó viszonyítási oszlop vagy kiemelés az összehasonlításban és a rangsorban.
- A 6.2 és a 7. blokk elrejtése Magyarországnál, külön kitöltöttség-számítás (Magyarország 8/9).
- Korábbi évek profiljai.
- A `DEMO_CSERE` azonosító módosítása: a `2026-10-09`-es csere még nem ment ki a hostingra, a
  push utáni első build így is a repó aktuális demó DB-jét viszi ki.

## 1. Adatok: `scripts/demo-orszagprofil/orszagok/hu.ts`

A fájl formája és a fejléc forráslistája a meglévő országfájlokét követi (minta: `at.ts`). Az év
rögzített (2026), a szerző az első admin; a futtató a mappa minden fájlját beolvassa, új regisztráció
nem kell.

**Kitöltött blokkok és mezők**

| Blokk | Mezők |
| --- | --- |
| `alapadatok` | `fovaros`, `terulet`, `penznem`, `lakossag`, `gdp`, `gdpEgyFore`, `gdpNovekedes`, `adatEv`, `forras`, `tagsagok`, `tagsagEgyeb`, `agazatok`, `agazatEgyeb` |
| `kfiRendszer` | `teljesitmeny`, `gerd`, `strategia`, `prioritasok`, `prioritasEgyeb`, `kiemeltIparagak`, `iparagEgyeb`, `erossegek`, `kihivasok` |
| `intezmenyek` | `iranyitoSzervek`, `egyetemek`, `kutatokozpontok`, `infrastrukturak` |
| `vallalati` | `kiemeltAgazatok`, `agazatEgyeb`, `topVallalatok`, `startupok`, `klaszterek`, `technologiatranszfer` |
| `programok` | `palyazatok`, `tamogatasiProgramok`, `finanszirozasiEszkozok`, `nemzetkoziReszvetel` |
| `rendezvenyek` | 3–5 jelentősebb hazai KFI-rendezvény |
| `nemzetkoziKapcsolatok` | `partnerorszagok`, `euMultilateralis` |
| `magyarErtekeles` | csak `osszegzes`: 2–3 mondat Magyarország KFI-helyzetéről, viszonyítási alapként |

A `magyarKapcsolatok` blokk nem szerepel a fájlban (mentetlen marad).

**Forrásrend** (a 27 ország döntései szerint)

- GDP, GDP/fő, reálnövekedés, lakosság: IMF World Economic Outlook, 2025. októberi kiadás, 2025-ös év.
- Terület: KSH.
- GERD: OECD MSTI (Magyarország OECD-tag); a KSH nemzeti adata a szövegben említhető.
- Innovációs teljesítmény: Global Innovation Index 2025.
- Top vállalatok: a 2025-ös EU Industrial R&D Investment Scoreboard magyar székhelyű vállalatai
  K+F-ráfordítás szerint; ha kevés a találat, ismert, meghatározó K+F-szereplőkkel kiegészítve, a
  fejlécben jelölve.
- Intézmények, stratégia, programok, rendezvények: hivatalos oldalak (kormányzat, NKFIH, HUN-REN,
  MTA, egyetemek, a rendezvények saját oldala).
- A Wikipedia önmagában nem forrás. A `forras` mező csak a ténylegesen használt forrásokat sorolja.
- A fejlécben nincs első személy és folyamat-megjegyzés; minden forrásnál URL és a hozzáférés dátuma.
- Személynév a tartalomban csak kivételesen szerepel.
- Számok magyar formában (tizedesvessző, ezres tagolás szóközzel), a listás mezők csak a szótár
  elemeiből (`AGAZATOK`, `KFI_PRIORITASOK`, `TAGSAGOK`, `RENDEZVENY_TIPUSOK`).

**Szempont a szöveghez:** a többi profil egy fogadó országot ír le magyar szemmel; ez a profil a
hazai rendszert írja le tárgyszerűen, ugyanazzal a részletességgel, hogy a két oszlop egymás mellett
olvasható legyen.

## 2. Felirat: „hazai profil”

Három helyen áll ma „nincs aktív attasé” attasé nélküli országnál; Magyarországnál ez félrevezető.

- `lib/orszagok.ts`: `export const HAZAI_KOD = 'HU';` és `hazaiE(kod: string): boolean`.
- `app/(app)/terkep/components/TerkepTooltip.tsx`: attasé nélkül, ha `hazaiE(o.kod)` →
  „hazai profil – a központ tartja karban”, különben marad „nincs aktív attasé”.
- `app/(app)/terkep/components/ProfilKivonat.tsx`: ugyanez.
- `components/orszagprofil/AttaseLista.tsx`: „Hazai profil – a központ tartja karban.”, különben
  marad „Nincs aktív attasé.”.
- Az összehasonlító tábla „Attasé” sora változatlan („–”).

Ha Magyarországhoz valaha attasét rendelnének, a felirat helyett az attasé jelenik meg (a feltétel
mindhárom helyen az üres attasé-lista).

## 3. Beírás a demó DB-be

1. `NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts --csak HU` – csak
   ellenőriz (a validátor + a futtató szigorú szabályai).
2. Az `--ir` előbb a `data/tet.db` **másolatán** (`DATABASE_URL`), ellenőrzéssel: a `HU` 2026 sor
   létrejött, a többi 27 profil kilenc blokk-oszlopa változatlan.
3. Utána a `data/tet.db`-n. A DB commitja a megtett intézkedés ágának függőben lévő DB-commitjával
   együtt, a közös böngészős próba után történik.

## Élhelyzetek

- **Kitöltöttség:** Magyarország 8/9 (a 6.2 blokk mentetlen). A profil oldalán a 6.2 kártyája „Még
  nincs kitöltve”, a 7. blokkban csak az összegzés látszik.
- **Rangsorok:** Magyarország a számszerű mutatók rangsorában és a színskála min–max tartományában is
  részt vesz. A tartomány a szűretlen adathalmazé, így egy új ország módosíthatja a színezést.
- **Oldalsáv-kártya (admin):** a darabszámok eggyel nőnek.
- **Attasé:** Magyarországhoz nem tartozik attasé, ezért a „Saját országprofil” gomb, az
  `OldalsavAllapot` attasé-nézete és a jelentések nem érintettek.
- **Címzett-lista, felhasználó-kezelés:** nem érintett (a `HU` már ma is választható ország).

## Ellenőrzés

1. A futtató ellenőrző módja hibátlan a `HU`-ra és az összes országra.
2. Független webes tényellenőrzés a `hu.ts` minden számára és állítására a megadott forrásokon.
3. Eldobható tsx script a migrált DB-másolaton: a `listTerkepAdat(2026)` tartalmazza a `HU`-t
   (`allapot: 'friss'`, `attasek: []`, `mentettDb: 8`, van `gerd`, `alapadatok`, `osszegzes`).
4. `npx tsc --noEmit`, `npm run build`.
5. Böngészős próba (a megtett intézkedés próbájával együtt): Magyarország színeződik a térképen; a
   buborék, az oldalsó kivonat és a profil fejléce „hazai profil”-t ír; a rangsorban szerepel; az
   összehasonlításhoz hozzáadható, a számok egyeznek a fájllal; adminként szerkeszthető.

## Dokumentáció

- `CLAUDE.md`: a parancslista demó-profil sora (27 ország + Magyarország), a `HAZAI_KOD` / `hazaiE`
  a „Térkép” bekezdésben és az országszótár leírásánál.
- `README.md`: a térkép leírása, ha említi az országkört.
