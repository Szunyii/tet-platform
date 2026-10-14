# Összehasonlítás: viszonyító megjelenítés, Magyarország mint viszonyítási alap – tervezési spec

Dátum: 2026-10-14
Állapot: jóváhagyva
Ág: `osszehasonlitas-viszonyitas`

## Cél

A térkép alatti összehasonlító tábla (`OsszehasonlitasPanel`) két ponton hibás:

1. **A kiemelt iparágak egymásba folynak.** A `Badge` nem törhet sort (`whitespace-nowrap`,
   `shrink-0`), az oszlop viszont legfeljebb 176 px (`max-w-44`). A hosszú nevek („Mesterséges
   intelligencia és adatgazdaság”) így átlógnak a szomszéd oszlop jelvényeire. 6–8 különböző színű
   jelvényből ráadásul nem látszik, mi közös és mi nem. Ugyanez a gond a vesszővel összefűzött
   KFI-prioritásokkal (4–9 elem) és a tagságokkal.
2. **A félkövér csak azt mutatja, ki a legnagyobb, azt nem, hogy mennyivel.** Négy országnál az
   USA négy sorban is félkövér, a különbség nagysága (30 616 vagy 1 859 mrd USD GDP) nem látszik.

A felhasználó kérése: több országnál se vesszen el a szem, és legyen „nagyon jó viszonyítási
megjelenítés”.

A tábla helyére **mutatókártyák** (kis diagramok, országonként egy sáv) és **listamátrixok**
kerülnek. Minden országnak saját színe van, és Magyarország **állandó viszonyítási alapként**
mindig ott van. Ez felülírja a `2026-10-13-magyar-profil-design.md` „Hatókörön kívül” pontját
(„állandó viszonyítási oszlop vagy kiemelés az összehasonlításban”).

A jóváhagyott makett helyben, a gitignore-olt
`.superpowers/brainstorm/62102-1791981163/content/teljes-panel-v2.html` fájlban van. A
böngészős társ szolgálja ki, de közvetlenül is megnyitható. A makett 8. kártyája („Példa:
negatív érték”) csak illusztráció, nem része a megvalósításnak.

## Döntések

| Kérdés | Döntés | Indok |
| --- | --- | --- |
| Viszonyítás | A kiválasztott országok közös skálán, mellettük mindig Magyarország | A felhasználó döntése. TéT-szempontból a magyar szint a legbeszédesebb viszonyítás; a hálózati helyezés kimarad. |
| Legfeljebb hány ország | Marad 4 (`VS_MAX`), és mellettük Magyarország | A felhasználó döntése. |
| Számszerű mutatók | Mutatónként egy kártya (B irány): az országok egymás alatt, közös, nulláról induló skálán | A felhasználó választotta a három irány (sávos táblázat, mutatókártyák, közös tengely) közül. Közös alapvonalról a hosszak a legpontosabban vethetők össze. |
| Listás sorok | Mindhárom (Kiemelt iparágak, KFI-prioritások, Tagságok) mátrixként | A felhasználó döntése. Egy komponens, egységes kinézet. |
| Országok azonosítása | Saját szín országonként (kék, narancs, lila, rózsa): a fejléc-kártya csíkja, a sávok, a mátrix-pöttyök. A szín az országnál marad, amíg az összehasonlításban van. | Hét kártyán és három mátrixon át a szín köti össze az országot; a név vagy a kód mindig mellette áll, a szín sehol nem az egyetlen jelzés. |
| Sorrend | A kártyákban az országok a fejléc sorrendjében (a hozzáadás sorrendjében) állnak, nem érték szerint | Így a szem minden kártyán ugyanott keresi az országot. A nagyságot a sáv mutatja, félkövér nincs. |
| Magyarország a kártyákon | Szürke sáv a kártya alján, szaggatott vonallal elválasztva; minden ország sávján fekete jelölő Magyarország szintjén | A makett 2. változata (az első, kártyán átfutó szaggatott vonal a kétsoros sorokban a szöveget is keresztezte volna). |
| Magyarország a mátrixban | Külön, halványan hátterezett, szaggatott bal szegélyű oszlop, fekete rombusszal | Látszik, mely fókuszok közösek a hazaival (együttműködési lehetőség). |
| Panel 1 országtól | Ha Magyarországnak van profilja a nézett évre, 1 ország is elég, különben 2, mint eddig | A felhasználó döntése. Egy ország Magyarországgal szemben a leggyakoribb kérdés. |
| Magyarország felvétele a halmazba | Nem lehetséges: a rangsorban nincs „+” gombja, a kivonatban a gomb helyett tájékoztató szöveg áll, a „+ Ország” listában nem szerepel | A felhasználó döntése. Mindig jelen van, így nem foglal helyet a 4-ből, és nincs olyan gomb, ami látszólag nem csinál semmit. |
| Mértékegység | Az érték mellett (`formatSzam(v, m.utotag)`, pl. „34 713 USD”), a makett külön alcíme helyett | Mint a rangsorban; nem kell új mező. |
| Skála | Lineáris, `[min(0, értékek), max(0, értékek, felsoHatar)]` a kiválasztottak és Magyarország értékeiből; a kitöltöttségnél fix 0–9 | A sáv hossza csak nulláról indulva arányos. A térkép log skálája (GDP, lakosság) itt nem kell. |
| Kiemelés | Számszerű térkép-mutatónál annak kártyája zöld hátterű („a térkép mutatója” címkével); kategorikusnál nincs kiemelés | Mint eddig a kiemelt sor. |
| Adat | Nincs DB-, séma-, lekérdezés- vagy szerverváltozás | A `TerkepOrszag` minden szükséges mezőt tartalmaz, a magyar rekord a `listTerkepAdat` része. |

## Hatókörön kívül

- A térképen az összehasonlított országok kontúrja a saját színükkel (lehetséges folytatás).
- Összekapcsolt kiemelés hoverre (egy ország kiemelése minden kártyán).
- Hálózati helyezés („3./28”) az összehasonlításban (a rangsor-panel és a tooltip mutatja).
- A `VS_MAX` emelése.
- A listák „Egyéb” szabadszöveges mezői (`iparagEgyeb`, `prioritasEgyeb`, `tagsagEgyeb`). Most
  sem látszanak, és nem vethetők össze.
- Rendezés érték szerint, exportálás, nyomtatási nézet.
- Sötét mód: az app csak világos témájú, a színek inline jönnek, mint az `AgazatBadge`-nél.

## Működés

### Mikor látszik a panel

- `vsMin` = 1, ha az adatokban van magyar rekord (`hazaiE(o.kod)`), különben 2. A magyar rekord
  akkor van benne, ha Magyarországnak van legfeljebb a nézett évig terjedő profilja. Ma ez
  2026-tól igaz.
- A panel akkor jelenik meg, ha `vsOrszagok.length >= vsMin`.
- Ha a panel magyar rekord nélkül látszik (2+ ország, pl. 2025-ben), a leírás ezt jelzi.
  Ilyenkor nincs magyar kártya, sáv, jelölő és oszlop.
- Évváltáskor az eddigiek szerint (`useTerkepAllapot` render közben): a nem létező kijelölés és
  halmazelem kikerül, és a kieső ország színe felszabadul. Ha évváltáskor a magyar rekord
  eltűnik, és 1 ország marad, a `vsMin` 2 lesz, a panel eltűnik, a csík pedig „Válassz még egy
  országot” szöveget mutat.

### Színek

- 4 rögzített szín: `#2563eb` (kék), `#c2410c` (narancs), `#9333ea` (lila), `#be185d` (rózsa).
  Fehér alapon mind ≥ 4,5:1, a kis kódfeliratokhoz is.
- Felvételkor az ország a legkisebb szabad színt kapja, és megtartja, amíg a halmazban van. Egy
  másik ország kivétele nem színezi át.
- Magyarország jelölője, rombusza és kártyacsíkja `#10151d` (a `TERKEP_SZINEK.kontur`). A magyar
  sáv semleges szürke, `#7b8494`: a `bg-muted` sávháttérrel kb. 3,4:1 (grafikus elemnél
  legalább 3:1 kell). A makett `#a9b2bf`-je ehhez kevés (kb. 1,9:1).
- A `VS_MAX` a színek számából adódik (`VS_SZINEK.length`), hogy a kettő ne térhessen el.

### Fejléc (országkártyák)

A régi tábla „Attasé” és „Állapot” sora ide költözik, külön táblázat nem marad.

- **Országkártya** (a halmaz sorrendjében): balra 4 px-es csík a saját színben. Az országnév
  gomb, a kivonatot nyitja (`onKivalaszt`, mint eddig a fejléc-név). Mellette a kód monóban, a
  saját színben (ez köti a kártyát a mátrix oszlopfejlécéhez), és egy × gomb (`<név> kivétele`).
  Alatta az attasé-sor: `attasekRovid(o.attasek, o.kod)`, attasé nélkül
  `attaseNelkulFelirat(o.kod)`. Végül `AllapotBadge`. A hosszú név sort törhet.
- **Magyarország-kártya** (ha van magyar rekord, mindig az utolsó): szaggatott keret, halvány
  háttér, sötét csík. Az országnév gomb (a kivonatot nyitja), mellette „viszonyítási alap”
  címke. Alatta `attaseNelkulFelirat('HU')` („hazai profil – a központ tartja karban”) és
  `AllapotBadge`. × gomb nincs.
- **„+ Ország” kártya**, ha `orszagok.length < VS_MAX` és van jelölt: szaggatott keret, benne a
  mostani `NativeSelect` („Ország hozzáadása”). Az opciók a `jeloltek()` listából jönnek,
  Magyarország nélkül, a mostani felirattal (számszerű mutatónál „név · érték”).
- A rács tördelődik: `repeat(auto-fill, minmax(11rem, 1fr))`.

### Mutatókártyák

A `SZAM_MUTATOK` sorrendjében egy-egy kártya (ma 7): Egy főre jutó GDP, GDP, GDP-növekedés,
Lakosság, K+F ráfordítás (GERD), Kitöltöttség, Rendezvények száma. A rács
`repeat(auto-fill, minmax(15rem, 1fr))`, széles képernyőn 4 oszlop.

- **Fejléc:** a mutató `cimke`-je. Ha ez a térkép mutatója, a kártya háttere `SKALA_SZINEK[0]`
  (mint eddig a kiemelt sor), mellette kis „a térkép mutatója” címke.
- **Sorok** (a halmaz sorrendjében), kétsorosan, mint a `RangsorPanel` sorai. Fent a teljes
  országnév balra (csonkolva, `title`-lel) és az érték jobbra (`formatSzam(v, m.utotag)`, monó).
  Alatta teljes szélességű sávháttér (`bg-muted`), rajta a sáv a saját színben.
- **Magyar sor** (ha van magyar rekord): az utolsó, szaggatott felső szegéllyel elválasztva,
  „Magyarország” felirattal, szürke sávval. Ha a magyar érték nem `null`, minden ország sávján
  egy fekete függőleges jelölő mutatja a helyét.
- **Skála:** `savSkala(értékek, m.felsoHatar)`, ahol az értékek a kiválasztottaké és a magyar
  érték, `null` nélkül. A sáv a nulla helyétől az érték helyéig tart, negatívnál balra.
  Negatív alsó határnál minden sávon vékony nullavonal jelenik meg. Nem nulla értéknél a sáv
  legalább 2 px.
- **Hiányzó érték:** a sorban „–” áll, sáv nélkül; a magyar sorban is, és ilyenkor jelölő sincs. Ha egyik értéknek sincs értéke
  (`savSkala` → `null`), a sorok helyett „Nincs adat.” szöveg jelenik meg.
- **Kitöltöttség:** az új `SzamMutato.felsoHatar` mező (`BLOKK_KULCSOK.length`) adja a fix
  felső határt, így a 9/9 teli, a 8/9 majdnem teli sáv. A többi mutatónál a mező hiányzik.

### Listamátrixok

Három kártya: **Kiemelt iparágak** (`o.iparagak`, sorrend `AGAZATOK`), **KFI-prioritások**
(`o.prioritasok`, `KFI_PRIORITASOK`), **Tagságok** (`o.alapadatok?.tagsagok ?? []`,
`TAGSAGOK`). A rács `repeat(auto-fit, minmax(20rem, 1fr))`, széles képernyőn 3 oszlop, a
hosszú elemnevek két sorba törhetnek.

- **Sorok:** a kiválasztott országok és Magyarország elemeinek uniója. Elemenként egy sor:
  országonként egy cella (van: 10 px-es pötty a saját színben; nincs: apró halvány pötty), és ha
  van magyar rekord, egy magyar cella (van: fekete rombusz; nincs: apró halvány pötty).
- **Csoportok** (az üres csoport kimarad; csoporton belül a szótár sorrendjében):
  - 2 vagy több ország (n = a kiválasztott országok száma, az üres listájúakat is beleértve):
    „Mind a {n} országban” (n ≤ 4, ezért a névelő mindig „a”); „Részben közös” (2…n−1
    országban, előbb a több országban szereplők); „Csak egy országban”; „Csak Magyarország”
    (csak a magyar listában).
  - 1 ország (ekkor mindig van magyar rekord): „Közös Magyarországgal”, „Csak {országnév}”
    (alanyesetben, mint a „Csak Magyarország”, mert a helyhatározó rag országonként
    rendhagyó), „Csak Magyarország”.
- **Összegző sor** a cím alatt, „ · ”-tal fűzve, a nulla darabszámú részek nélkül:
  - 2 vagy több országnál: „{x} közös”, „{y} részben közös”, „{z} egyedi”;
  - ha van magyar rekord, és a magyar lista nem üres: „Magyarországgal közös: {h}”, ahol h
    azoknak a soroknak a száma, amelyek a magyar listában és legalább egy kiválasztott
    országéban is szerepelnek (0 is kiíródik);
  - ha valamelyik lista üres (a magyart is beleértve): „nincs megadva: {nevek}”. Az adatból
    nem dönthető el, hogy tényleg nincs elem, vagy csak nincs kitöltve; a mai adatokban több
    ország tagságlistája üres.
- Ha egyik oszlopnak sincs eleme: „Nincs adat.”

### Magyarország kizárása a halmazból

- `useTerkepAllapot`: a `vsHozzaad` és a `vsValt` Magyarországra nem csinál semmit.
- `RangsorPanel` (`OrszagSor`): Magyarország sorában a „+” gomb helyén azonos méretű, üres
  helykitöltő van (`size-6`, `aria-hidden`), hogy az igazítás megmaradjon. A sor kattintható
  marad (kijelölés).
- `ProfilKivonat`: Magyarországnál az „Összehasonlítás” gomb helyén halvány szöveg áll: „Az
  összehasonlításban mindig szerepel viszonyítási alapként.”
- `TerkepNezet`: a „+ Ország” jelöltjeiből kimarad
  (`jeloltek(adatok, [...vs, HAZAI_KOD], mutato)`).

### Összehasonlítás-csík (`OsszehasonlitasCsik`)

- A chipek a név előtt egy kis pöttyöt kapnak az ország színében, így a térkép mellett is ott a
  jelmagyarázat.
- Az állapotszöveg: tele → „Legfeljebb 4 ország”; ha az országszám kisebb a `vsMin`-nél →
  „Válassz még egy országot”; különben „Az összehasonlítás a térkép alatt” (eddig „A tábla a
  térkép alatt”).

### Panel-keret (`OsszehasonlitasPanel`)

- Cím „Összehasonlítás”, jobbra „Összehasonlítás törlése” (mint eddig).
- Leírás: „{n} ország · viszonyítási alap: Magyarország”, magyar rekord nélkül „{n} ország ·
  viszonyítási alap nélkül (Magyarországnak nincs profilja erre az évre)”.
- Szakaszok: fejléc → „Mutatók” → „Listák”. A szakaszcímek kicsi, nagybetűs, halvány címkék.
  Ha van magyar rekord, mellettük egysoros jelmagyarázat: a „Mutatók”-nál „fekete jelölő:
  Magyarország szintje”, a „Listák”-nál „◆ Magyarország”.
- Keskeny ablakban minden rács egy oszlopra törik. A mátrix táblázata a kártyáján belül
  vízszintesen görgethető (`overflow-x-auto`), ha nem fér el.

## Felépítés

### Új: `lib/osszehasonlitas.ts`

Tiszta logika, React és DB nélkül (a `TerkepOrszag` és a `SzamMutato` csak típusként jön).

- `VS_SZINEK` (a 4 szín, `as const`), `HAZAI_SZIN` (`#10151d`), `HAZAI_SAV_SZIN`.
- `SavSkala { also; felso }`; `savSkala(ertekek, felsoHatar?) → SavSkala | null`;
  `skalaHely(v, s) → 0–1` (`also === felso` esetén 0); `savHelye(v, s) → { bal, szel }` (0–1);
  `nullaVonal(s) → number | null` (csak ha `also < 0`).
- `listaMatrix(sorrend, oszlopok, hazai) → { csoportok, osszegzes }`. Az `oszlopok` elemei
  `{ kod, nev, elemek }`, a `hazai` `null`, ha nincs magyar rekord. Egy csoport
  `{ cimke, sorok }`, egy sor `{ elem, benne: boolean[], hazai: boolean }`. A szótárban nem
  szereplő elem a csoport végére kerül; a normalizálás után ez nem fordulhat elő.

### Új komponensek (`app/(app)/terkep/components/`)

- `OsszehasonlitasFejlec.tsx`: az országkártyák, a Magyarország-kártya és a „+ Ország”.
- `MutatoKartya.tsx`: egy számszerű mutató kártyája. Propok: `mutato`, `orszagok`, `szinek`,
  `hazai`, `kiemelt`.
- `ListaMatrix.tsx`: egy lista mátrixa. Propok: `cim`, `sorrend`, `elemek` (accessor),
  `orszagok`, `szinek`, `hazai`. A `listaMatrix()`-ot hívja.

### Módosuló fájlok

- `OsszehasonlitasPanel.tsx`: újraírva vékony kerethez. Új propok: `hazai: TerkepOrszag | null`
  és `szinek`. A táblázat, a `Sor` segédkomponens, a sticky címke-oszlop és a félkövérítés
  kikerül. A `KIEMELT_HATTER` a `MutatoKartya`-hoz kerül.
- `useTerkepAllapot.ts`:
  - A halmaz belső állapota `{ kod, szin }` párok listája.
  - Kifelé a `vs` kódlista marad, `useMemo`-val stabil példánnyal, mert a `TerkepNezet` memói
    erre épülnek.
  - Új mezők: `vsSzinek: Readonly<Record<string, string>>` (kód → szín, szintén memózva) és
    `vsMin: number`.
  - A `VS_MAX` a `VS_SZINEK.length`-ből adódik. A `VS_MIN` konstans helyére a `vsMin` lép
    (1 magyar rekorddal, 2 nélküle).
  - A Magyarország-kizárás szerint módosul.
- `lib/terkep-mutatok.ts`: `SzamMutato.felsoHatar?: number`, a `kitoltottseg`-nél
  `BLOKK_KULCSOK.length`.
- `TerkepNezet.tsx`:
  - `hazai` (`useMemo`, `adatok.find(hazaiE)`);
  - a panel a `vsMin`-től látszik;
  - a jelöltekből kimarad Magyarország;
  - új propok a panelnek (`hazai`, `szinek`).
- `TerkepPanel.tsx`: a csíknak átadja a `vsSzinek`-et és a `vsMin`-t (az `allapot`-ból).
- `OsszehasonlitasCsik.tsx`: színpötty, az állapotszöveg a `vsMin`-hez igazodik, a doc-komment
  frissül.
- `RangsorPanel.tsx`, `ProfilKivonat.tsx`: Magyarországnál nincs hozzáadó gomb (lásd fent).
- `CLAUDE.md`: a Térkép bekezdés és a `/terkep` route leírása. Az összehasonlítás új működése
  (kártyák, mátrixok, színek, Magyarország viszonyításként, `vsMin`, a kizárás); a
  „soronként a legnagyobb félkövér” és a `VS_MIN`=2 leírása helyett.

### Akadálymentesség

- A mutatókártya sorai listaelemek. A név és az érték szövegként olvasható, a magyar sor
  „Magyarország (viszonyítási alap)”. A sávok, a jelölők és a nullavonal `aria-hidden`ek.
- A mátrix valódi `<table>`. Az oszlopfejlécben a kód látható (`aria-hidden`), mellette rejtve a
  teljes országnév (`sr-only`). A csoportcímek `scope="rowgroup"`-os fejlécek a saját
  `<tbody>`-jukban, a sorcímke `<th scope="row">`. A cellákban a pötty `aria-hidden`, mellette
  rejtett „van” / „nincs” szöveg.
- A gombok (országnév, ×, „+ Ország”) fókuszgyűrűje és felirata a mostani mintát követi.

## Ellenőrzés

Tesztkeretrendszer nincs.

- `npx tsc --noEmit` és `npm run build`.
- Eldobható tsx-script a `lib/osszehasonlitas.ts` függvényeire:
  - `savSkala`: csupa pozitív, negatív is, csupa `null`, csupa 0, fix felső határ;
  - `savHelye` és `nullaVonal` negatív alsó határral;
  - `listaMatrix` 1, 2 és 4 oszloppal, magyar listával és anélkül, üres oszloppal, „Csak
    Magyarország” sorral.

  Az elvárt értékek a mai demó-adatokból: a makett számai, pl. az iparágaknál „5 közös · 2
  részben közös · 3 egyedi · Magyarországgal közös: 6”.
- Böngészős próba a futó dev szerveren (előbb a figyelő folyamat munkakönyvtárát kell
  ellenőrizni):
  - 1 ország Magyarországgal szemben, illetve 4 ország;
  - egy középső ország kivétele után a színek nem cserélődnek;
  - Magyarország sehol nem vehető fel (rangsor, kivonat, „+ Ország”);
  - a 2025-ös évben nincs viszonyítás, és 2 ország kell;
  - negatív növekedés (Puerto Rico, Amerikai Virgin-szigetek);
  - profil nélküli ország (Koreai NDK);
  - a kiemelt kártya követi a térkép mutatóját;
  - keskeny ablak (pl. 800 px);
  - a végén kijelentkezés (a session-sor ne maradjon a DB-ben).
