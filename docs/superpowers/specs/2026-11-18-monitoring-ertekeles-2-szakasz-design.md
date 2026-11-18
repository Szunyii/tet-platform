# TéT Monitoring és értékelés, 2. szakasz – terv

Dátum: 2026-11-18. Állapot: jóváhagyásra vár.

Előzmény: `docs/superpowers/specs/2026-11-18-monitoring-ertekeles-design.md` (a továbbiakban: 1. szakasz terve).

## 1. Cél és háttér

Az 1. szakasz után a Kapcsolatépítés szempontnak csak jelentésekből származó közvetett mutatói vannak, az Eredmények szempontnak pedig egyáltalán nincs rendszeradata. Az admin ezért e két szempontot bizonyíték nélkül ítéli meg, és az attasék teljesítménye nem mérhető a saját, országra szabott céljaikhoz.

A 2. szakasz négy részből áll:

1. **Tevékenységnapló:** delegációk, B2B-találkozók és partnerközvetítések.
2. **Eredmény-nyilvántartás:** több félévig tartó ügyek, szakaszról szakaszra követve, az attasé hozzájárulásával és központi igazolással.
3. **Éves munkaterv:** attasénként 3–5 cél, köztük 1–2 központi cél.
4. **Jelentésenkénti minősítés:** egy fokozat jelentésenként, opcionális megjegyzéssel.

Az 1. szakasz alapelvei változatlanok: fokozatot és összminősítést csak admin ad, a mutatók tájékoztató jellegűek, és rangsor nincs.

## 2. Célok, nem célok, elkerülendők

**Célok**

- Az attasé első kézből rögzíti a tevékenységeit és az eredményeit, a saját bejegyzéseit látja.
- A központ igazolja az eredmények „együttműködés” és „megállapodás” szakaszát.
- A Kapcsolatépítés és az Eredmények szempont valódi mutatókat és bizonyítékokat kap az adatlapon és a munkalapon.
- Az éves munkaterv állapota megjelenik az értékelésben.
- A Tájékoztatás szempontnál látszik a jelentések fokozatok szerinti megoszlása.

**Nem célok**

- Az attasé továbbra sem látja a saját minősítését, a jelentéseinek fokozatát és a Monitoring oldalakat (3. szakasz).
- Önértékelés és az attasé megjegyzése a minősítéshez (3. szakasz).
- Fájlfeltöltés az igazoláshoz, e-mail- vagy más értesítés, export.
- Külső partnerek visszajelzése.

**Elkerülendők**

- Ugyanazt az eseményt kétszer kelljen beírni jelentésként és tevékenységként.
- A mutatókból automatikusan számolt fokozat.
- Attasék közötti rangsor vagy pontszám szerinti rendezés.
- Lezárt félév rögzített mutatóinak utólagos átírása.
- Régi lezárt félévnél az új adatok helyén nulla jelenjen meg „nincs adat” helyett.
- A jelentés fokozatának kiszivárgása az attasénak küldött adatokba.

**Az éles használat feltételei.** Az 1. szakasz tervében rögzített feltételek érvényben maradnak. Push után a hostingon az attasék is látják a két új menüpontot, ezért az érintettek tájékoztatása a push előtt szükséges.

## 3. Megfontolt megközelítések

| Kérdés | Változatok | Döntés |
| --- | --- | --- |
| Ki rögzít? | Az attasé rögzít, az admin igazol. Csak az admin rögzít. Csak a jelentésűrlap bővül. | **Az attasé rögzít, az admin igazol.** Az adat első kézből jön, a bejegyzés jelentésből is indítható. |
| Mit igazol az admin? | Csak az eredmények későbbi szakaszait. Minden bejegyzést. | **Csak az „együttműködés” és a „megállapodás” szakaszt.** A többi azonnal látszik, de kifogásolható. |
| Ki határozza meg a célokat? | Az attasé javasol, a központ jóváhagy. A központ 1–2 kötelező célt ad, a többit az attasé javasolja. A központ határoz meg mindent. | **A központ 1–2 kötelező célt ad, a többit az attasé javasolja.** |
| Milyen részletes a jelentés minősítése? | Egy fokozat. Három külön fokozat. Csak kiemelt jelentések jelölése. | **Egy fokozat, opcionális megjegyzéssel.** |
| Hogyan készül el? | Három egymásra épülő blokk. Minden egyszerre. A legkisebbtől a legnagyobb felé. | **Három blokk:** tevékenységek és eredmények, éves munkaterv, jelentésminősítés. |
| Az attasé felülete | Két lista fülekkel. Eredménytábla oszlopokkal. Egy oldal két hasábbal. | **Eredménytábla oszlopokkal**, a tevékenységek külön fülön. |

## 4. A blokkok

| Blokk | Tartalom | Migráció |
| --- | --- | --- |
| **A** | Tevékenységek és eredmények, igazolás, mutatók, adatlap-bővítés | `0015` |
| **B** | Éves munkaterv, központi célok, adatlap-bővítés | `0016` |
| **C** | Jelentésminősítés, adatlap-bővítés | `0017` |

Minden blokk önállóan kipróbálható, és a következő előtt lezárul. A meglévő táblák közül csak az `ertekelesi_idoszak` kap egy új oszlopot (5.7. pont).

## 5. A blokk: tevékenységek és eredmények

### 5.1. Szótárak (`lib/tevekenyseg-szotar.ts`)

| Szótár | Kulcsok és feliratok |
| --- | --- |
| Tevékenységtípus | `delegacio` Delegáció, `b2b` B2B-találkozó, `partnerkozvetites` Partnerközvetítés |
| Szakasz | `lehetoseg` Lehetőség, `kapcsolat` Kapcsolat, `egyuttmukodes` Együttműködés, `megallapodas` Megállapodás |
| Hozzájárulás | `kozvetlen` Közvetlen hozzájárulás, `kozremukodes` Közreműködés |
| Igazolás állapota | `nem_igenyel` Nem igényel igazolást, `igazolasra_var` Igazolásra vár, `igazolt` Igazolva, `visszakuldott` Visszaküldve |
| Ügy állapota | `aktiv` Aktív, `megszakadt` Megszakadt |

Szövegkorlátok: megnevezés, partner és magyar szereplő 200 karakter, leírás, indoklás, megjegyzés és kifogás 2000 karakter, link 500 karakter. A link csak `http` vagy `https` cím lehet.

### 5.2. Tevékenység

| Mező | Szabály |
| --- | --- |
| Típus | Kötelező |
| Dátum | Kötelező, legkésőbb a mai nap, legkorábban az előző naptári év január 1-je (Europe/Budapest). Módosításnál a változatlan régi dátum akkor is érvényes marad, ha már korábbi ennél. |
| Ország | Kötelező, az attasé egyik országa, alapértéke a székhely |
| Megnevezés | Kötelező |
| Partner | Kötelező |
| Magyar szereplő | Partnerközvetítésnél kötelező, egyébként opcionális |
| Leírás | Opcionális |
| Kapcsolódó jelentés | Opcionális, az attasé saját jelentése |
| Kapcsolódó eredmény | Opcionális, az attasé saját aktív ügye |

- **Jelentésből indítás:** a saját „Rendezvény, találkozó, delegáció” vagy „Együttműködési lehetőségek” kategóriájú jelentés oldalán a szerző „Tevékenység rögzítése” gombot lát. Az űrlap előre kitöltve nyílik: megnevezés a tárgyból, dátum az esemény dátumából vagy a beadás napjából, ország a jelentésből. A jelentés oldala kiírja, ha már készült belőle tevékenység.
- **Módosítás és törlés:** az attasé a saját tevékenységét módosíthatja és törölheti, kivéve, ha a dátuma olyan félévbe esik, amelyet már legalább egyszer lezártak. Ilyen félévre új tevékenység sem rögzíthető.
- **Elérhetőség:** az attasé fejlécében az aktuális és az előző év, az országprofilok évei, valamint minden olyan év választható, amelyben saját tevékenysége vagy ügye van, és a szerveroldali évellenőrzés ugyanezt a halmazt fogadja el. Így nem keletkezhet olyan bejegyzés, amelyet a tulajdonosa nem ér el. Ha a mentett tevékenység éve eltér a fejlécben látott évtől, a visszajelzés: „Tevékenység mentve. A(z) <év>. évnél találod, az évet a fejlécben választhatod ki.”
- **Kifogás:** az admin megjegyzéssel kifogásolhat egy tevékenységet. A kifogásolt tevékenység nem számít a mutatókba, az attasé látja a megjegyzést. A kifogás megszűnik, ha az attasé módosítja a bejegyzést, vagy az admin visszavonja.

### 5.3. Eredmény

| Mező | Szabály |
| --- | --- |
| Megnevezés | Kötelező |
| Ország | Kötelező, az attasé egyik országa |
| Partner | Kötelező |
| Magyar szereplő | Opcionális |
| Hozzájárulás | Kötelező |
| Leírás | Opcionális |
| Kezdő szakasz | Lehetőség vagy Kapcsolat, alapértéke Lehetőség |

**Szakaszváltás.** Csak a következő szakaszba lehet lépni, gombbal, a kártya megnyitása után. Húzás nincs.

| Lépés | Működés |
| --- | --- |
| Lehetőség → Kapcsolat | Azonnal érvényes |
| Kapcsolat → Együttműködés | Igazolást kér |
| Együttműködés → Megállapodás | Igazolást kér |

**Igazolás folyamata**

1. Az attasé kötelező indoklással kéri a következő szakaszt, és megadhat linket vagy saját jelentést.
2. Az ügy a kért szakasz oszlopában látszik „Igazolásra vár” jelzéssel. A mutatókban még az előző szakaszban számít. A kérés alatt újabb szakaszváltás nem indítható.
3. Az admin igazolja a kérést, vagy kötelező megjegyzéssel visszaküldi.
4. Igazolás után a szakasz érvényes, a jelzés „Igazolva”.
5. Visszaküldés után az ügy az előző szakaszba kerül vissza „Visszaküldve” jelzéssel. Az attasé látja a megjegyzést, és új kérést indíthat.
6. Az admin kötelező megjegyzéssel visszavonhatja a korábbi igazolást. Az ügy ekkor az előző szakaszba kerül, „Visszaküldve” jelzéssel. A már lezárt félévek rögzített mutatói nem változnak.

**További szabályok**

- **Kifogás:** az admin a lehetőség vagy kapcsolat szakaszban lévő ügyet megjegyzéssel kifogásolhatja. Kifogás alatt az ügy korai szakaszai nem számítanak a mutatókba. A kifogás megszűnik, ha az attasé módosítja az ügyet, vagy az admin visszavonja.
- **Megszakítás:** az attasé kötelező indoklással „Megszakadt” állapotba teheti az aktív ügyét. Függő igazoláskérés ilyenkor törlődik. A megszakadt ügy lekerül a tábláról, szűrővel visszakereshető, és újraindítható.
- **Mezők zárolása:** függő kérés alatt és igazolt szakasz után a megnevezés, az ország, a partner, a magyar szereplő és a hozzájárulás nem módosítható, a leírás igen. A zárolás megszűnik, ha már nincs függő kérés és igazolt szakasz.
- **Befejezett ügy:** az igazolt „Megállapodás” szakaszban lévő ügy befejezett. Nem szakítható meg, nem számít aktív ügynek, és csak az admin igazolás-visszavonása változtathat rajta.
- **Törlés:** az ügy csak addig törölhető, amíg nincs igazolt szakasza, függő kérése, és egyetlen eseménye sem számít már lezárt félévbe. Ezután csak megszakítható.
- **Előzmények:** minden szakaszváltás, kérés, igazolás, visszaküldés, visszavonás, megszakítás és újraindítás időrendi eseményként megmarad, a szerző nevének pillanatképével.

### 5.4. Melyik félévbe számít

| Esemény | Beszámítási félév |
| --- | --- |
| Tevékenység | A tevékenység dátumának féléve |
| Lehetőség és Kapcsolat elérése | Az esemény dátumának féléve |
| Igazolt szakasz | A kérés dátumának féléve, ha az a félév bővített adatot gyűjt, még soha nem zárták le, és van időszak-sora, vagy az igazolás napján még megnyitható. Különben az igazolás dátumának féléve. |

Ha a kérés félévének van időszak-sora, a tárolt `bovitett_adatok` jelző dönt, sor nélkül a `bovitettAdatokFelev`. A feltételek azért kellenek, hogy az igazolás ne kerüljön olyan félévbe, amelynek pillanatképe nem tartalmazná.

A beszámítási félév az igazoláskor rögzül az eseményen. Visszavont igazolás nem számít a még nem rögzített mutatókba.

### 5.5. Új mutatók

A mutatók pillanatképe (`ErtekelesMutatok`) `verzio: 2` értéket és két új, opcionális mezőt kap. A régi, `verzio: 1` pillanatképeket semmi nem írja át.

Az új mezőket csak az a félév kapja, amelynek `ertekelesi_idoszak.bovitett_adatok` jelzője igaz. A jelző a félév létrehozásakor áll be: a `BOVITETT_ADATOK_ELSO_FELEV` (`2027/1`) félévtől kezdve igaz, korábban hamis. Így egy olyan félév, amelyben még nem volt adatgyűjtés, soha nem kap nullákat. A hiányzó mező jelentése: „Ehhez a félévhez nincs tevékenységi adat.” A munkaterv és a jelentésminősítés opcionális mezői ugyanezt a jelzőt követik.

```ts
kapcsolatepites.tevekenyseg?: {
  delegacioDb: number; b2bDb: number; partnerkozvetitesDb: number;
  magyarSzereploDb: number; kifogasoltDb: number;
  tevekenysegek: TevekenysegBizonyitek[];
};
eredmenyek?: {
  lehetosegDb: number; kapcsolatDb: number; egyuttmukodesDb: number; megallapodasDb: number;
  igazolasraVarDb: number; aktivUgyDb: number; megszakadtDb: number;
  ugyek: EredmenyBizonyitek[];
};
```

| Mutató | Számítás |
| --- | --- |
| Delegáció, B2B-találkozó, Partnerközvetítés | A félév nem kifogásolt tevékenységei típusonként |
| Érintett magyar szereplő | A kitöltött magyar szereplők kis- és nagybetűtől független, eltérő értékei |
| Kifogásolt | A félév kifogásolt tevékenységei |
| Lehetőség, Kapcsolat | A félévben elért, nem kifogásolt szakaszok |
| Együttműködés, Megállapodás | A félévbe beszámított, nem visszavont igazolások |
| Igazolásra vár | A számítás időpontjában függő kérések közül a félév végéig beadottak |
| Aktív ügy | Az attasé aktív, nem befejezett ügyei a számítás időpontjában |
| Megszakadt | A félévben megszakított ügyek |

A meglévő három jelentésalapú Kapcsolatépítés-mutató megmarad.

### 5.6. Felületek

**Új menüpont:** „Tevékenységek és eredmények”, útvonal `/tevekenysegek`, attasénak és adminnak. A menüpont mellett számláló áll: adminnál az igazolásra váró kérések, attasénál a visszaküldött kérések és a kifogásolt bejegyzések száma.

**Attasé nézet, `/tevekenysegek`**

- Fejléc: cím, állomáshely, „+ Új eredmény” és „+ Új tevékenység” gomb.
- **Eredmények fül (alapértelmezett):** négy oszlop a szakaszok szerint, oszloponként darabszámmal. A kártyán megnevezés, partner és magyar szereplő, valamint az igazolás jelzése áll. Keskeny ablakban az oszlopok egymás alá kerülnek. A tábla az összes aktív ügyet mutatja. A Megállapodás oszlop csak a fejlécben választott évbe számított megállapodásokat tartalmazza. Szűrő mutatja a megszakadt ügyeket.
- **Tevékenységek fül:** táblázat dátum szerint csökkenően, típus, megnevezés, ország, partner, magyar szereplő és kapcsolódó eredmény oszlopokkal. A fejlécben választott év és a Félév szűrő (Mind, 1. félév, 2. félév) szűkíti. A kifogásolt sor a megjegyzést is mutatja.
- A létrehozás és a módosítás párbeszédablakban történik.

**Eredmény adatlapja, `/tevekenysegek/eredmeny/[id]`:** az ügy adatai, a szakaszlánc, az elérhető műveletek, a kapcsolódó tevékenységek és jelentések, valamint az időrendi előzmények. Attasé csak a sajátját nyithatja meg, másnak 404.

**Admin nézet, `/tevekenysegek`**

- **Igazolásra vár fül (alapértelmezett):** kérések a legrégebbitől kezdve. Soronként ügy, attasé, állomáshely, hozzájárulás, kért szakaszváltás, indoklás, link és kapcsolódó bizonyítékok, „Igazolás” és „Visszaküldés” gomb.
- **Eredmények fül:** az összes ügy listája szakasz, attasé, régió és ország szerint szűrve.
- **Tevékenységek fül:** az összes tevékenység ugyanígy szűrve, soronként „Kifogásolás” művelettel.
- Az admin nem rögzít és nem módosít bejegyzést az attasé helyett.

**Monitoring bővítése**

- Az adatlapon és a munkalapon a Kapcsolatépítés és az Eredmények új mutatókat és bizonyítékokat kap. A bizonyíték az eredmény adatlapjára mutat.
- Az 1. szakasz „nincs rendszeradat” szövegei a bővített adat nélküli félévekre korlátozódnak.
- A félév állapotsávja figyelmeztet, ha a félévhez függő igazoláskérés tartozik. A lezárást ez nem akadályozza.

### 5.7. Adatmodell

Új fájl: `db/schema/tevekenyseg.ts`.

**`tevekenyseg`:** `id`, `attase_id` (FK `user`, cascade), `tipus`, `datum`, `orszag_kod`, `megnevezes`, `partner`, `magyar_szereplo`, `leiras`, `riport_id` (FK, set null), `eredmeny_id` (FK, set null), `kifogas`, `kifogas_szerzo_nev`, `kifogas_at`, `created_at`, `updated_at`.

**`eredmeny`:** `id`, `attase_id` (FK `user`, cascade), `megnevezes`, `orszag_kod`, `partner`, `magyar_szereplo`, `hozzajarulas`, `leiras`, `szakasz` (az érvényes szakasz), `kert_szakasz`, `igazolas`, `allapot`, `kifogas`, `kifogas_szerzo_nev`, `kifogas_at`, `created_at`, `updated_at`.

**`eredmeny_esemeny`:** `id`, `eredmeny_id` (FK, cascade), `tipus`, `szakasz`, `szoveg`, `link`, `riport_id` (FK, set null), `szerzo_nev`, `szerzo_szerep`, `beszamitasi_ev`, `beszamitasi_felev`, `visszavonva`, `created_at`.

**`ertekelesi_idoszak` (meglévő tábla):** új `bovitett_adatok` logikai oszlop, alapértéke hamis. `ALTER TABLE ADD COLUMN` utasítással kerül be, a tábla nem épül újra.

A szótári értékekre CHECK-ek vigyáznak. Az író műveletek `immediate` tranzakcióban futnak, verzióellenőrzéssel az ügyön, hogy két admin vagy egy elavult lap ne hozhasson ellentétes döntést.

## 6. B blokk: éves munkaterv

### 6.1. Szabályok

- Attasénként és évenként egy terv, 3–5 céllal, a központi célokat is beleszámítva.
- **Cél mezői:** megnevezés (200 karakter), ország (az attasé egyik országa), kapcsolódó értékelési szempont, mérce (300 karakter), állapot.
- **Célállapot:** `folyamatban` Folyamatban, `teljesult` Teljesült, `reszben` Részben teljesült, `elmaradt` Elmaradt.
- **Terv állapota:** `piszkozat` Nincs beküldve, `jovahagyasra_var` Jóváhagyásra vár, `visszakuldott` Visszaküldve, `jovahagyott` Jóváhagyva.
- A terv egészben kerül jóváhagyásra vagy visszaküldésre. Visszaküldéshez megjegyzés kötelező.
- Tervet a folyó és a következő évre lehet készíteni.

**Központi célok**

- Az admin évente adja meg őket: megnevezés, szempont, mérce és hatókör (teljes hálózat vagy egy régió).
- Minden aktív attaséra 1–2 központi célnak kell vonatkoznia: a hálózati célok és a székhelye régiójának céljai együtt. A mentés a 2-es felső határt, a közzététel az 1-es alsó határt is ellenőrzi.
- **Közzététel:** az admin az év céljait egy lépésben teszi közzé. Addig szabadon szerkesztheti és törölheti őket, közzététel után nem változnak.
- Az attasé csak a közzététel után kezdheti el az adott év tervét. A terv létrehozásakor a rá vonatkozó központi célok másolatként bekerülnek a tervbe.
- A központi cél zárolva jelenik meg a tervben. Az attasé csak az országát választhatja ki.

**Évközi működés**

- A jóváhagyott terv céljainak állapotát az attasé állítja, megjegyzéssel. Az admin felülírhatja, a felülíró neve megmarad.
- A jóváhagyott terv tartalmának módosítását az attasé indoklással kéri. Az admin elutasítja, vagy szerkesztésre visszanyitja a tervet. Újbóli jóváhagyás után a célok állapota megmarad.
- A munkaterv fokozatot nem számol.

### 6.2. Felületek

**Új menüpont:** „Éves munkaterv”, útvonal `/munkaterv`. A menüpont mellett számláló áll: adminnál a jóváhagyásra váró tervek és módosítási kérések, attasénál a visszaküldött terv.

- **Attasé, `/munkaterv`:** évválasztó (`?ev=`, a fejléc ciklusától függetlenül), a terv állapota, a célok táblázata, célfelvétel, módosítás, „Beküldés jóváhagyásra”, jóváhagyott tervnél állapotváltás és „Módosítás kérése”. Közzététel előtt tájékoztató szöveg áll: „A központi célok még nem jelentek meg.”
- **Admin, `/munkaterv`:** bal oldalon a központi célok kezelése és közzététele, jobb oldalon az aktív attasék táblázata terv-állapottal, célszámmal és teljesülési aránnyal.
- **Admin, `/munkaterv/[attaseId]`:** a terv részletei, jóváhagyás, visszaküldés, visszanyitás és célállapot-felülírás.
- **Monitoring:** az adatlapon és a munkalapon összefoglaló kártya mutatja a félév évének tervét, céllistával és a terv linkjével. Jóváhagyott terv hiányában: „Nincs jóváhagyott munkaterv.”

### 6.3. Adatmodell

Új fájl: `db/schema/munkaterv.ts`.

**`munkaterv_ev`:** `ev` (elsődleges kulcs), `kozzeteve_at`, `kozzetette_nev`.

**`kozponti_cel`:** `id`, `ev`, `megnevezes`, `szempont`, `merce`, `hatokor` (`halozat` vagy régiókulcs), `created_at`, `updated_at`.

**`munkaterv`:** `id`, `attase_id` (FK `user`, cascade), `ev`, `statusz`, `megjegyzes`, `modositasi_kerelem`, `jovahagyta_nev`, `jovahagyva_at`, `created_at`, `updated_at`. Egyedi: `(attase_id, ev)`.

**`munkaterv_cel`:** `id`, `terv_id` (FK, cascade), `kozponti_cel_id` (FK, restrict), `sorrend`, `megnevezes`, `orszag_kod`, `szempont`, `merce`, `allapot`, `allapot_megjegyzes`, `allapot_modositotta_nev`, `allapot_modositva_at`.

### 6.4. Mutató

A pillanatkép opcionális `munkaterv?` mezőt kap: év, terv állapota, célonként megnevezés, szempont és állapot, valamint állapotonkénti darabszámok. Hiányakor a kártya „nincs adat” jelzést mutat.

## 7. C blokk: jelentésminősítés

### 7.1. Szabályok

- Az admin jelentésenként egy fokozatot adhat a négy minősítési fokozatból (Kiemelkedő, Megfelel, Részben megfelel, Fejlesztendő), opcionális, legfeljebb 2000 karakteres megjegyzéssel.
- A fokozat törölhető, ekkor a jelentés újra „Nincs minősítve”.
- A minősítés a jelentés módosítási dátumát nem érinti.
- Az attasé sem a fokozatot, sem a megjegyzést nem kapja meg. A minősítést csak admin nézethez futó külön lekérdezés olvassa.

### 7.2. Felületek

- **Jelentések listája:** adminnak „Minősítés” oszlop, soronkénti gyors minősítéssel, és „Minősítés” szűrő, amelynek része a „Nincs minősítve” érték.
- **Jelentés oldala:** adminnak „Központi minősítés” kártya.
- **Monitoring:** a Tájékoztatás szempontnál a jelentések fokozatok szerinti megoszlása és a minősítésre váró jelentések száma.

### 7.3. Adatmodell és mutató

Új fájl: `db/schema/riport-minosites.ts`. **`riport_minosites`:** `riport_id` (elsődleges kulcs, FK, cascade), `fokozat` (1–4, CHECK), `megjegyzes`, `szerzo_nev`, `updated_at`.

Külön tábla készül, mert a `riport` szülőtábla újraépítése a CLAUDE.md szerint adatvesztést okozhat, és így a minősítés szerkezetileg is elkülönül az attasénak adott adatoktól.

A pillanatkép opcionális `tajekoztatas.jelentesMinosites?: { 4: number; 3: number; 2: number; 1: number; nincs: number }` mezőt kap.

## 8. Jogosultság

| Művelet | Attasé | Admin |
| --- | --- | --- |
| Saját tevékenység és eredmény rögzítése, módosítása | Igen | Nem |
| Más attasé bejegyzésének megtekintése | Nem, 404 | Igen |
| Igazolás, visszaküldés, kifogás | Nem | Igen |
| Saját munkaterv szerkesztése és beküldése | Igen | Nem |
| Központi cél, jóváhagyás, felülírás | Nem | Igen |
| Jelentés minősítése és fokozatának olvasása | Nem | Igen |
| Monitoring oldalak | Nem, 404 | Igen |

A jogosultsági szabályok a `lib/tevekenyseg-jog.ts` és a `lib/munkaterv-jog.ts` tiszta függvényei. Minden oldal és action szerveroldalon ellenőriz. A beküldött országnak az attasé aktuális országai között kell lennie.

## 9. Tesztadatok

A `scripts/demo-ertekeles.ts` bővül, a kitalált tesztadatbázis szabályai változatlanok.

- A 2025/1 és későbbi félévek tevékenységeket és eredményeket kapnak, a Kapcsolatépítés és az Eredmények fokozatával összhangban.
- A 2024/2 félév bővített adat nélküli marad, `verzio: 1` pillanatképpel, a „nincs adat” állapot kipróbálásához. A script a későbbi félévek `bovitett_adatok` jelzőjét közvetlenül igazra állítja.
- Előfordul minden szakasz, igazolási állapot, kifogás, megszakadt ügy és jelentésből indított tevékenység.
- Készülnek 2026-os jóváhagyott és 2027-es, különböző állapotú munkatervek, valamint központi célok.
- A jelentések többsége minősítést kap a Tájékoztatás fokozatával összhangban, egy részük minősítetlen marad.
- Az önellenőrzés blokkonként bővül.

## 10. Érintett kód

| Terület | Fájlok |
| --- | --- |
| Séma | `db/schema/tevekenyseg.ts`, `db/schema/munkaterv.ts`, `db/schema/riport-minosites.ts`, `db/schema/index.ts`, `drizzle/0015–0017` |
| Lekérdezések | `db/queries/tevekenyseg.ts`, `db/queries/munkaterv.ts`, `db/queries/riport-minosites.ts`, `db/queries/ertekeles.ts` |
| Tiszta logika | `lib/tevekenyseg-szotar.ts`, `lib/tevekenyseg-validacio.ts`, `lib/tevekenyseg-jog.ts`, `lib/munkaterv-szotar.ts`, `lib/munkaterv-validacio.ts`, `lib/munkaterv-jog.ts`, `lib/ertekeles-mutatok.ts`, `lib/ertekeles-megjelenites.ts` |
| Új oldalak | `app/(app)/tevekenysegek/`, `app/(app)/munkaterv/` |
| Bővülő oldalak | `app/(app)/monitoring/`, `app/(app)/jelentesek/` |
| Keret | `lib/navigacio.ts`, `app/(app)/layout.tsx`, `components/app-shell/` a menüszámlálókhoz |
| Tesztadat és leírás | `scripts/demo-ertekeles.ts`, `CLAUDE.md` |

## 11. Ellenőrzés

A projektben nincs tesztkeretrendszer. Blokkonként: `npx tsc --noEmit`, eldobható tsx tesztek a tiszta logikára és az életciklusokra, böngészős végigjárás a tesztadatbázison, és a végén build eldobható másolatban. A `data/tet.db` a blokkok közben nem változik, a migrált változat commitolásáról a befejezéskor a felhasználó dönt.

Kötelező forgatókönyvek:

1. Attasé csak a saját bejegyzéseit éri el, idegen azonosítóra 404-et kap.
2. Teljes igazolási kör: kérés, visszaküldés, újabb kérés, igazolás, visszavonás.
3. Két admin ugyanazt a kérést dönti el: a második elavult hibát kap.
4. Lezárt félévre tevékenység nem rögzíthető, és a rögzített mutatók semmilyen későbbi művelettől nem változnak.
5. Igazolás a kérés félévének lezárása után: az igazolás félévébe számít.
6. Bővített adat nélküli félévnél „nincs adat” látszik, nulla nem.
7. Munkaterv teljes köre: központi célok, közzététel, beküldés, visszaküldés, jóváhagyás, állapotváltás, módosítási kérés.
8. Egy attaséra harmadik központi cél nem menthető, és közzététel nem lehetséges, ha egy aktív attaséra nem vonatkozik központi cél.
9. Az attasénak küldött jelentésadatokban nem szerepel a fokozat.
10. Billentyűzettel minden művelet elvégezhető, a jelzések szín nélkül is megkülönböztethetők.

## 12. A megvalósítóra hagyott döntések

- A pillanatkép bizonyíték-típusainak pontos alakja.
- A párbeszédablakok és a részletoldalak komponensfelbontása.
- A menüszámlálók átadásának módja az alkalmazás keretében.
- A kitalált tesztadatok szövegei.
