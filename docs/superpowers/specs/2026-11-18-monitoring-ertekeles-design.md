# TéT Monitoring és értékelés – terv

Dátum: 2026-11-18. Állapot: jóváhagyásra vár.

## 1. Cél és háttér

A `/monitoring` ma demóadatokból (`lib/data.ts`, `lib/score.ts`) rajzolt rangsort mutat. Helyette valódi szakmai
értékelési rendszer kell a TéT attaséknak: a rendszer a platformon keletkező adatokból mér, az admin szakmailag
minősít, az eredmény pedig attasénként és a hálózat egészére is szűrhető.

Az értékelés félévenként zajlik, öt szempont szerint. A munkát a tevékenységtől az eredményen át a hasznosulásig
követi, és az attasé **hozzájárulását** vizsgálja, nem azt, hogy egy eredmény kizárólag neki köszönhető-e. Ez a
nemzetközi tudományos programok értékelésében bevett logikai modell és hozzájárulás-elemzés egyszerűsített változata.
Kifejezetten attaséhálózatra kidolgozott nyilvános értékelési keretet a tervezéskor nem találtunk.

**Feltételezés:** az értékelés fejlesztő és vezetői célú. A felhasználás módja (például bérre vagy megbízásra gyakorolt
hatás) nincs eldöntve, ezért a rendszer semmilyen döntést nem hoz automatikusan.

Ez a dokumentum a teljes koncepciót és az **1. szakasz** részletes tervét tartalmazza. A 2. és a 3. szakasz külön
tervezési kört kap.

## 2. Célok, nem célok, elkerülendők

**Az 1. szakasz céljai**

- Félévi értékelési ciklus: megnyitás, minősítés, lezárás, szükség esetén újranyitás.
- Az öt szempont és az összminősítés rögzítése indoklással, leírt fokozatok alapján.
- Automatikus mutatók a jelentésekből, ticketekből és országprofilokból.
- Hálózati nézet (hőtérkép) és egyéni adatlap, szűrőkkel.
- Reprodukálható, kitalált tesztadatok külön adatbázisban.

**Nem célok az 1. szakaszban**

- Az attasé nem látja az értékelést, nincs önértékelés és megjegyzés (3. szakasz).
- Nincs tevékenységnapló, eredmény-nyilvántartás, éves munkaterv és jelentésenkénti minősítés (2. szakasz).
- Nincs export, nyomtatási nézet, értesítés és több értékelős kalibrációs felület.

**Elkerülendők**

- Attasék közötti rangsor vagy sorrend pontszám szerint.
- A mutatókból automatikusan számolt fokozat vagy összminősítés.
- Kitalált minősítés valós attasé nevéhez vagy valós posztjához kötve.
- Lezárt félév adatainak néma átírása.
- A „Nem értékelhető” nullaként vagy hibaként kezelése.

**Az éles használat feltételei (nem fejlesztési feladatok).** Valódi attasékat csak akkor szabad értékelni, ha a
3. szakasz elkészült, az attasék tájékoztatást kaptak, megtörtént az adatvédelmi és munkajogi egyeztetés, és tisztázott,
hogy a NIÜ milyen hatáskörben értékel. A tudástár kutatott anyaga szerint a hálózat szakmai irányításában a TTM és a
Külügyminisztérium vesz részt. Ezeket a feltételeket a szervezet tartatja be: a felhasználó döntése szerint technikai zár
nincs, ezért a modul a hostingon is teljes értékűen működik, és ott az admin valós attasékra is megnyithat félévet.

## 3. Megfontolt megközelítések

**Építés módja**

| Változat | Előny | Hátrány | Döntés |
| --- | --- | --- | --- |
| Szakaszos építés | Korán kipróbálható, a visszajelzés alakítja a többit | Az 1. szakaszban a kapcsolatépítéshez és az eredményekhez kevés a rendszeradat | **Választott** |
| Minden egy körben | Az első bemutatón teljes a koncepció | Sokkal később látható bármi, a késői módosítás drága | Elvetve |

**Az eredmény összegzése attasénként**

| Változat | Előny | Hátrány | Döntés |
| --- | --- | --- | --- |
| Szempontonkénti minősítés + admin összminősítés, rangsor nélkül | A legméltányosabb az eltérő posztok között | Nincs egyszerű sorrend | **Választott** |
| Súlyozott összpontszám, rangsor nélkül | Gyorsan áttekinthető | Külön súlyozási döntés kell, egy szám elfedi a részleteket | Elvetve |
| Súlyozott összpontszám és rangsor | Könnyen összevethető | Eltérő posztokat kényszerít egy skálára, pontgyűjtésre ösztönöz | Elvetve |

**Felületek.** A makettek közül a felhasználó a hőtérképes hálózati nézetet választotta. Adatlapból kettőt együtt:
nyitott félévben munkalap, lezárt félévben összkép és idősor.

**Működés a hostingon**

| Változat | Előny | Hátrány | Döntés |
| --- | --- | --- | --- |
| Zár nélkül | A legkevesebb munka, nincs külön állapot a kódban | A feltételek teljesülése előtt is születhet minősítés valós attasékról | **Választott** |
| Zárolva, tájékoztató oldallal | Valós attasé nem értékelhető véletlenül | A feloldáshoz kódmódosítás kell | Elvetve |
| Zárolva, olvasható bemutatóval | Linkkel megmutatható a kollégáknak | Több munka, a kitalált értékelések a repóba kerülnek | Elvetve |

## 4. Szakaszok

| Szakasz | Tartalom |
| --- | --- |
| **1.** | Ez a dokumentum |
| **2.** | Tevékenységnapló (delegáció, B2B, partnerközvetítés), eredmény-nyilvántartás (lehetőség → kapcsolat → együttműködés → megállapodás, hozzájárulás igazolásával), éves munkaterv 3–5 országra szabott céllal, jelentésenkénti minősítés |
| **3.** | Az attasé saját adatlapja, önértékelése és megjegyzése a minősítéshez |

## 5. Szakmai tartalom

### 5.1. Fokozatok

Négy fokozat van, középső érték nélkül. A színt mindig szöveg kíséri.

| Érték | Fokozat | Rövid felirat |
| --- | --- | --- |
| 4 | Kiemelkedő | Kiem. |
| 3 | Megfelel | Megf. |
| 2 | Részben megfelel | Részben |
| 1 | Fejlesztendő | Fejl. |
| 0 | Nem értékelhető (csak szempontnál) | N/É |

### 5.2. Szempontok és fokozatleírások

A leírások a `lib/ertekeles-szotar.ts`-be kerülnek, és a munkalapon minősítés közben végig láthatók.

**1. Tájékoztatás és elemzés** (`tajekoztatas`, rövid: Tájékoztatás)

- Kiemelkedő: Rendszeresen, megelőző jelleggel ad elemző anyagot, amely a fogadó ország fejleményeit a magyar érdekekre vetíti, és konkrét döntést vagy intézkedést alapoz meg.
- Megfelel: Rendszeresen, időben tájékoztat a lényeges fejleményekről. Az anyagok pontosak és a központ számára felhasználhatók.
- Részben megfelel: A tájékoztatás időszakos vagy egyenetlen. Az anyagok inkább leírók, a magyar vonatkozás és a javaslat gyakran hiányzik.
- Fejlesztendő: Lényeges fejlemények rendszeresen kimaradnak, vagy az anyagok érdemben nem használhatók.

**2. Országismeret** (`orszagismeret`)

- Kiemelkedő: A profil teljes, naprakész és önálló értékelést ad, elemzése más munkához is mintaként szolgál.
- Megfelel: A profil a ciklusban teljes és megbízható, a lényeges változásokat követi.
- Részben megfelel: A profil hiányos vagy részben elavult, az adatok mellett kevés az értékelés.
- Fejlesztendő: A profil érdemben hiányos vagy elavult, a központ nem támaszkodhat rá.

**3. Kapcsolatépítés** (`kapcsolatepites`)

- Kiemelkedő: Stratégiai jelentőségű kapcsolatokat épít és tart fenn, és ezeket célzottan megnyitja a magyar szereplők előtt.
- Megfelel: Aktív, releváns kapcsolatrendszert tart fenn, és a megkereséseknél hatékonyan közvetít.
- Részben megfelel: A kapcsolatok esetiek vagy szűk körűek, a közvetítés főként kérésre történik.
- Fejlesztendő: Nincs érdemi, a feladatokhoz használható kapcsolatépítés.

**4. Eredmények** (`eredmenyek`)

- Kiemelkedő: Az attasé hozzájárulása igazoltan vezetett új együttműködéshez, megállapodáshoz vagy magyar szereplő mérhető hasznához.
- Megfelel: A lehetőségek egy része igazoltan előrehaladt, és az attasé hozzájárulása világos.
- Részben megfelel: Vannak lehetőségek, de ritkán jutnak tovább, vagy a hozzájárulás nem igazolható.
- Fejlesztendő: Az időszakban nincs kimutatható előrehaladás, és nincs terv a lehetőségek gondozására.

**5. Együttműködés a központtal** (`egyuttmukodes`, rövid: Együttműködés)

- Kiemelkedő: Határidő előtt teljesít, és kérés nélkül is többletet ad.
- Megfelel: A kéréseket határidőre, használható minőségben teljesíti.
- Részben megfelel: Több csúszás vagy pótlás kellett.
- Fejlesztendő: A válaszok rendszeresen késnek vagy elmaradnak.

### 5.3. Minősítési szabályok

- A fokozatot mindig az admin adja. A mutatók tájékoztató jellegűek, küszöbérték nincs, mert még nincs valós viszonyítási alap.
- Szempontnál az indoklás kötelező, kivéve a „Megfelel” fokozatot.
- A „Nem értékelhető” indoklást kér, és nem számít gyenge eredménynek.
- Aki egyetlen országnak sem relációs vezetője, annál az Országismeret automatikusan „Nem értékelhető”, nem szerkeszthető, és indoklás nem kell hozzá. Ez nyitott félévben az aktuális hozzárendelésből adódik, és lezáráskor rögzül. Ha az attasé közben vezető lesz, a szempont minősítendővé válik. A korábban vezető attasé mentett minősítése megmarad és szerkeszthető.
- Az admin indoklással kihagyhat egy attasét a félévből, például ha a posztot az időszak végén vette át. A kihagyott attasé nem kap fokozatot, és nem számít bele az összesítésekbe.
- Összminősítés csak akkor adható, ha mind az öt szempont minősítve van. Értéke 1–4 lehet, az indoklás mindig kötelező. Fejlesztési cél a „Részben megfelel” és a „Fejlesztendő” összminősítésnél kötelező, egyébként opcionális.
- Az indoklás és a fejlesztési cél legfeljebb 2000 karakter.

### 5.4. Automatikus mutatók

Az időszak a félév Europe/Budapest szerinti határai között értendő: 1. félév január 1. és június 30., 2. félév
július 1. és december 31. között. Futó félévnél az időszak vége a mai nap. A számítás tiszta függvény a
`lib/ertekeles-mutatok.ts`-ben, a bemenetét a `db/queries/ertekeles.ts` adja.

| Szempont | Mutató | Számítás |
| --- | --- | --- |
| Tájékoztatás | Beadott jelentés | Az attasé időszakban létrehozott jelentései, mellette az előző félév száma |
| Tájékoztatás | Lefedett téma | Eltérő kategóriák száma a `KATEGORIAK` hét eleméből |
| Tájékoztatás | Leghosszabb szünet | A legnagyobb naptári napos rés az időszak eleje, a jelentések dátumai és az időszak vége között, mellette a hálózati medián |
| Tájékoztatás | Intézkedés nyomán | Azon jelentések száma, amelyeknél a központ rögzített megtett intézkedést |
| Országismeret | Kitöltött blokk | A vezetett országok adott évi profiljában mentett blokkok összege, a 9 × vezetett országok számához viszonyítva |
| Országismeret | Utolsó mentés | A vezetett országok adott évi profiljainak legkésőbbi `updatedAt` értéke |
| Országismeret | Rögzített rendezvény | A vezetett országok adott évi profiljaiban szereplő rendezvények száma |
| Kapcsolatépítés | Rendezvénybeszámoló | `rendezveny` kategóriájú jelentések száma |
| Kapcsolatépítés | Partnerkeresési jelentés | `egyuttmukodes` kategóriájú jelentések száma |
| Kapcsolatépítés | Részvételi lehetőség | `palyazat` kategóriájú jelentések száma |
| Eredmények | Nincs | Az 1. szakaszban nincs rendszeradat, a felület ezt kiírja, és az indoklásban kéri a konkrét eredményeket |
| Együttműködés | Első válasz mediánja | Az attasénak címzett, időszakban nyitott ticketeknél a nyitás és az első attasé-üzenet közt eltelt idő szombat és vasárnap nélkül, napban, egy tizedesre, mellette a hálózati medián |
| Együttműködés | Válasz nélkül | Az időszakban nyitott, még nem lezárt ticketek, amelyekre nem érkezett attasé-üzenet |
| Együttműködés | Határidőre teljesítve | Lásd lent |
| Együttműködés | Lejárt, válasz nélkül | Lásd lent |
| Együttműködés | Átlagos késés | A késett ticketek naptári napos késésének átlaga |

**Határidős ticketek besorolása.** Azok a ticketek számítanak, amelyek határideje az időszakba esik. A dátumokat
Europe/Budapest naptári napként hasonlítjuk a `hatarido` mezőhöz.

| Az első attasé-üzenet | Ticket állapota | Besorolás |
| --- | --- | --- |
| Legkésőbb a határidő napján érkezett | Bármilyen | Határidőre teljesítve |
| A határidő után érkezett | Bármilyen | Késett |
| Nincs, a határidő elmúlt | Nyitott | Lejárt, válasz nélkül |
| Nincs | Lezárt | Nem számít bele |
| Nincs, a határidő még nem múlt el | Nyitott | Nem számít bele |

A „Határidőre teljesítve” aránya: határidőre teljesített / (határidőre teljesített + késett + lejárt, válasz nélkül).
A megválaszolt ticket besorolása az üzenetek időbélyegén alapul, ezért nem függ a ticket vagy a félév lezárásának
idejétől. A válasz nélküli, lejárt ticket addig számít lejártnak, amíg a központ le nem zárja, lezárás után nem számít
bele.

**A mérés időpontja.** A mutatókat a félév lezárásakor számoljuk ki, majd rögzítjük. A jelentések és a ticketek a
létrehozásuk, illetve határidejük alapján tartoznak az időszakhoz. A központ intézkedései és az országprofil a
lezáráskori állapotot mutatják, ezért egy év két féléve ugyanannak az évnek a profilját látja.

**Ismert korlátok, a felületen rövid magyarázattal.** A munkanap-számítás nem veszi figyelembe az ünnepnapokat és az
időzónákat. Egy puszta visszaigazolás is első válasznak számít, a válasz minőségét az admin ítéli meg. Az országprofilnak
nincs blokkonkénti mentési ideje, és az `updatedAt` az admin mentését is tartalmazza.

### 5.5. Változás az előző félévhez képest

Az összminősítést az attasé legutóbbi korábbi lezárt félévével vetjük össze: **javult**, **romlott**, **azonos**. Ha
nincs korábbi lezárt félév, a felirat **új**.

## 6. Felületek

Minden felület csak adminnak érhető el. Attasénak a menüpont rejtett, az oldalak `requireAdmin()` miatt 404-et adnak.
A felület shadcn komponensekből és Tailwind osztályokból épül, a régi globális `.card`, `.tbl` stílusok nélkül.

### 6.1. Hálózati nézet – `/monitoring`

**Felépítés felülről lefelé**

1. **Állapotsáv:** a félév állapota, az elkészült attasék száma, és a művelet: „Félév megnyitása”, „Félév lezárása” vagy „Újranyitás”.
2. **Szűrők:** Félév, Régió, Ország, Attasé, Szempont, Minősítés.
3. **Összesítő kártyák:** értékelt attasék (x / y), az összminősítés megoszlása színezett sávon, javult és romlott attasék száma. A kártyák a szűrt halmazra számolnak.
4. **Hőtérkép:** soronként egy attasé (név, poszt), oszloponként az öt szempont, majd Összminősítés és Változás. A sorok a székhely régiója szerint csoportosulnak, azon belül magyar névsorban állnak. Pontszám szerinti rendezés nincs. A sor az adatlapra visz.
5. **Jelmagyarázat.**

**Szűrők működése** (URL-paraméterek: `felev`, `regio`, `orszag`, `attase`, `szempont`, `minosites`)

- Az év a fejléc ciklusválasztójából jön, az oldalon nincs külön évszűrő.
- A félév alapértéke a választott év legutóbbi lezárt féléve, ennek hiányában a legutóbbi megkezdett féléve.
- A régió a székhely szerint szűr, az ország az attasé bármely lefedett országára.
- Szempont és minősítés együtt: akik az adott szemponton az adott fokozatot kapták.
- Csak minősítés: akik ezt az összminősítést kapták.
- Csak szempont: minden attasé látszik, a kiválasztott oszlop kiemelve.
- Ismeretlen paraméterértéket az oldal eldob. Évfüggő hibára `notFound()` nem használható (lásd CLAUDE.md), helyette tájékoztató üres állapot jelenik meg.

**Üres és részleges állapotok**

- Meg nem nyitott félév: tájékoztató szöveg és „Félév megnyitása” gomb. Jövőbeli félév nem nyitható meg.
- Nyitott félév: a még nem minősített cella „–” jelet kap, a sorban látszik a haladás (például 3 / 5).
- Kihagyott attasé: a sor a „Nem értékelt” feliratot és az okot mutatja, az x / y számlálóba és a megoszlásba nem számít bele.
- A lezárás gombja mellett szövegesen áll, miért nem használható még: a félév nem ért véget, vagy hiányzó minősítések vannak (ezek listájával).

### 6.2. Adatlap – `/monitoring/[attaseId]?felev=`

Ugyanaz az útvonal két állapotban. Az attasé neve, posztja, a félévválasztó, a félév állapota, az összminősítés és a
változás mindkét állapotban a fejlécben áll, a „Hálózati nézet” visszalink megőrzi a szűrőket.

**Nyitott félév: munkalap**

Három oszlop, keskeny ablakban egymás alatt:

- **Bal:** az öt szempont az aktuális fokozatával, alatta az Összminősítés.
- **Közép:** a kiválasztott szempont mutatói, bizonyítékai (a kapcsolódó jelentések és ticketek linkkel) és az előző félévek fokozatai.
- **Jobb:** a négy fokozat a leírásával választógombként, a „Nem értékelhető” külön lehetőségként, az indoklás mezője és a „Mentés és következő szempont” gomb.

Az Összminősítés kiválasztásakor a jobb oldalon a fokozat, az indoklás és a fejlesztési cél szerepel. Szempontok közötti
váltáskor a nem mentett szöveg nem veszhet el.

**Lezárt félév: összkép és idősor**

- **Felül balra:** az összminősítés indoklása és a fejlesztési cél.
- **Felül jobbra:** mátrix az attasé legutóbbi legfeljebb négy lezárt félévéről, szempontonként és összminősítésben.
- **Alatta:** lenyitható sor szempontonként, a fokozattal és egy kulcsmutatóval. Lenyitva: mutatók, bizonyítékok, az admin indoklása, az értékelő neve és időpontja.

## 7. Adatmodell

Új migráció: `0014`, új fájl: `db/schema/ertekeles.ts`, a `db/schema/index.ts`-ből exportálva. Meglévő táblához nem nyúlunk.

**`ertekelesi_idoszak`** – félévenként egy sor

| Oszlop | Megjegyzés |
| --- | --- |
| `id` | Elsődleges kulcs |
| `ev`, `felev` | Egyedi pár, CHECK: `felev` 1 vagy 2 |
| `statusz` | `nyitott` vagy `lezart`, CHECK-kel |
| `lezarva_at`, `lezarta_nev` | Az utolsó lezárás ideje és a lezáró nevének pillanatképe |
| `created_at`, `updated_at` | |

**`attase_ertekeles`** – időszakonként és attasénként egy sor

| Oszlop | Megjegyzés |
| --- | --- |
| `id` | Elsődleges kulcs |
| `idoszak_id` | FK, cascade |
| `attase_id` | Szándékosan FK nélkül, hogy az értékelés a felhasználó törlése után is megmaradjon és megnyitható legyen. Egyedi az `idoszak_id`-val |
| `attase_nev`, `szekhely_kod`, `varos`, `orszagok` | Pillanatkép, az `orszagok` JSON (kód, székhely, vezető). Nyitott félévben a felület az élő hozzárendelést használja, lezáráskor ezek az oszlopok frissülnek |
| `kimarad`, `kimaradas_oka` | Az attasé kihagyása a félévből és annak indoklása |
| `ossz_fokozat` | 1–4 vagy null, CHECK-kel |
| `ossz_indoklas`, `fejlesztesi_cel` | |
| `ertekelo_nev`, `minositve_at` | Az összminősítés rögzítője és ideje |
| `mutatok` | JSON pillanatkép lezáráskor, nyitott félévben null |
| `created_at`, `updated_at` | |

**`szempont_minosites`** – értékelésenként és szempontonként egy sor

| Oszlop | Megjegyzés |
| --- | --- |
| `ertekeles_id`, `szempont` | Összetett elsődleges kulcs, FK cascade |
| `fokozat` | 0–4, CHECK-kel |
| `indoklas` | |
| `ertekelo_nev`, `updated_at` | Pillanatkép és időpont, a verzióellenőrzés alapja |

## 8. Életciklus és műveletek

Server action-ök az `app/(app)/monitoring/actions.ts`-ben. Mind `requireAdmin()`-nal és szerveroldali validálással indul,
siker után `revalidatePath('/', 'layout')`-ot hív.

| Művelet | Szabály |
| --- | --- |
| Félév megnyitása | A futó és a közvetlenül előtte lévő félévre. Létrehozza az időszakot és az aktív, székhellyel rendelkező attasék sorait |
| Szempont mentése | Csak nyitott félévben, verzióellenőrzéssel. Elavult verziónál űrlapszintű hibát ad, a beírt szöveg megmarad |
| Összminősítés mentése | Ugyanígy, és mind az öt szempont minősítése után |
| Attasé kihagyása | Nyitott félévben, kötelező indoklással, visszavonható. A már rögzített minősítések megmaradnak, de nem számítanak |
| Félév lezárása | Csak a félév vége után, amikor minden nem kihagyott attasé teljesen minősítve van. Egy `immediate` tranzakcióban frissíti a pillanatképeket, rögzíti az automatikus Országismeret-sorokat, kiszámolja a még hiányzó `mutatok` pillanatképet, majd lezár |
| Újranyitás | Megerősítés után. A minősítések újra szerkeszthetők, a `mutatok` pillanatkép változatlan marad, új attasé-sor nem jön létre |

**Attasék változása nyitott félévben.** A félév vége előtt aktívvá vált, székhellyel rendelkező attasé sora a nézet
megnyitásakor létrejön, a félév vége után érkezőé már nem. Ha egy attasé közben megszűnik aktívnak lenni (törölték,
tiltott, admin lett, vagy nincs székhelye), a hiányos sora lezáráskor törlődik, a teljes sora megmarad.

**Lezárt félév megjelenítése.** Minden mutató, poszt és ország a pillanatképből jön. A bizonyítékok linkje csak akkor
aktív, ha a jelentés vagy a ticket még létezik, egyébként a tárgy szövegként látszik.

## 9. Tesztadatok

Script: `scripts/demo-ertekeles.ts`. Célfájl: `data/tet-ertekeles-teszt.db`, amely a `.gitignore`-ba kerül.

- A script csak ezt az egy fájlt írhatja, más célra hibával leáll. A `data/tet.db`-t csak olvassa.
- A célfájl a `data/tet.db` másolata, session-sorok nélkül, az összes migrációval.
- A 15 valós demó attasé minden kapcsolódó adatával kikerül a másolatból.
- 15 kitalált attasé kerül be kitalált nevekkel és e-mail-címekkel, olyan országokban, ahol a valós hálózatnak nincs posztja, így a minősítés valós személyhez sem a név, sem a poszt alapján nem köthető.

| Régió | Tesztposztok |
| --- | --- |
| Európa | Madrid (+Portugália), Barcelona (nem vezető), Róma (+Málta), Hága (+Belgium, Luxemburg), Stockholm (+Norvégia, Finnország, Dánia), Varsó |
| Ázsia és Óceánia | Canberra (+Új-Zéland), Sydney (nem vezető), Szingapúr (+Malajzia, Indonézia), Hanoi, Bangkok |
| Közel-Kelet | Abu-Dzabi (+Bahrein) |
| Afrika | Nairobi |
| Amerika | Mexikóváros, Buenos Aires (+Chile, Uruguay) |

**Tartalom.** Négy lezárt félév (2024/2, 2025/1, 2025/2, 2026/1) és a nyitott, részben minősített 2026/2. Generált
jelentések, ticketek, üzenetek, országprofil-sorok és minősítések, rögzített véletlenszám-maggal. A minősítés és a
mutatók összhangban vannak, a pillanatképet ugyanaz a kód számolja, mint az éles lezárást.

**Mintázatok:** stabilan erős, folyamatosan javuló, visszaeső, erős tartalom lassú válaszokkal, sok lehetőség kevés
eredménnyel, új poszt, nem vezető és egy félévből kihagyott attasé. Minden fokozat és változástípus előfordul.

## 10. Érintett kód

| Fájl | Változás |
| --- | --- |
| `db/schema/ertekeles.ts`, `db/schema/index.ts`, `drizzle/0014_*` | Új táblák |
| `db/queries/ertekeles.ts` | Lekérdezések és mutációk |
| `lib/ertekeles-szotar.ts` | Szempontok, fokozatok, leírások, korlátok |
| `lib/ertekeles-mutatok.ts` | Mutatók és besorolások, tiszta függvények |
| `lib/ertekeles-szuro.ts`, `lib/ertekeles-validacio.ts` | URL-szűrők, űrlap-validálás |
| `app/(app)/monitoring/` | `page.tsx`, `[attaseId]/page.tsx`, `actions.ts`, `components/` |
| `lib/navigacio.ts` | `adminOnly`, új alcím, a menüfelirat `??` jele kikerül, az adatlap alútvonala |
| `lib/data.ts`, `lib/score.ts` | Törlés |
| `scripts/demo-ertekeles.ts`, `.gitignore` | Tesztadatok |
| `CLAUDE.md` | Az új modul leírása, a demó monitoring említéseinek cseréje |

## 11. Ellenőrzés

A projektben nincs tesztkeretrendszer. Az ellenőrzés: `npx tsc --noEmit`, `npm run build`, eldobható tsx script a
`lib/ertekeles-mutatok.ts` határeseteire (üres időszak, határnapok, hétvége, lejárt és lezárt ticket), és böngészős
végigjárás a tesztadatbázison:

1. Attasé 404-et kap, a menüpont nem látszik neki.
2. Minden szűrő és kombinációjuk helyes sorokat és összesítést ad.
3. Teljes minősítési kör: megnyitás, mentés, hibás űrlap, verzióütközés, attasé kihagyása, lezárás, újranyitás.
4. Lezárás után egy jelentés módosítása nem változtatja meg a kiadott értékelés mutatóit.
5. Billentyűzettel kezelhető, a fokozatok szín nélkül is megkülönböztethetők, keskeny ablakban is használható.

## 12. A megvalósítóra hagyott döntések

- A mutatók pillanatképének pontos JSON-alakja és a bizonyítéklista hossza.
- A munkalap állapotkezelése, amíg a nem mentett szöveg nem vész el szempontváltáskor.
- A tesztadatbázissal futó dev szerver indításának pontos módja, a CLAUDE.md-be írva.
- A kitalált nevek, jelentéscímek és üzenetszövegek.
