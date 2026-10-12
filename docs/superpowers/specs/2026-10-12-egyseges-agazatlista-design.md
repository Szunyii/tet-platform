# Országprofil: egységes ágazatlista a három ágazat-mezőben – tervezési spec

Dátum: 2026-10-12
Állapot: jóváhagyva

## Cél

Az országprofil három mezője ágazatokat sorol fel, de két különböző listából:

- Alapadatok → „Legfontosabb gazdasági ágazatok” (`agazatok`): 15 hagyományos ágazat
  (`GAZDASAGI_AGAZATOK`);
- KFI-rendszer és szakpolitika → „Kiemelt iparágak” (`kiemeltIparagak`) és Innovációs és
  vállalati ökoszisztéma → „Kiemelt ágazatok” (`kiemeltAgazatok`): 14 technológiai iparág
  (`IPARAGAK`).

A két lista nyolc párja ugyanazt jelenti más névvel (pl. „Autóipar” és „Mobilitás és autóipar”).
A felhasználó kérése: a három mező egységes legördülő menüből legyen választható. A három mező
ezentúl ugyanabból a 21 elemű listából dolgozik, a már mentett értékek megmaradnak.

## Döntések

| Kérdés | Döntés | Indok |
| --- | --- | --- |
| A közös lista | A két lista egyesítése, a nyolc átfedő pár összevonva: 21 elem | A felhasználó döntése. A hagyományos ágazatok (Turizmus, Bányászat) és a technológiai iparágak is választhatók mindhárom helyen. |
| A 3. elem neve | „Elektronika és félvezetők” (nem „Félvezetők és mikroelektronika”) | Tunézia Alapadatokjában az ágazat kábelköteg- és alkatrészgyártást jelent, félvezetőipar nélkül; a szűkebb név félrevezető lenne. |
| Sorrend | Tematikus (technológia, ipar, szolgáltatás), mint a többi opciólista | A `TAGSAGOK` és a `KFI_PRIORITASOK` is tematikus; a legördülő gépeléssel szűrhető. |
| Az „Egyéb” szabadszövegek | Maradnak, a 27 megírt profilban változatlanok | A felhasználó döntése: csak átnevezés. Az „Egyéb” szövegek jellemzően pontosabbak a listaelemnél (pl. „foszfátalapú vegyipar”), és a tartalom két review-n ment át. |
| A tárolt régi nevek | Megfeleltetés olvasáskor és az űrlap-validátorban (`REGI_AGAZAT_NEVEK`) | A felhasználó döntése. A normalizáló az ismeretlen opciót némán eldobja, a hosting-DB-t pedig script nem éri el. A megfeleltetéssel bármely DB helyesen olvasódik, migráció és újabb DB-csere nélkül. |
| Megjelenítés az olvasó nézetben | Mindhárom mező színes ágazat-jelvénnyel | Ma az Alapadatok ágazatai szürke jelvények; ugyanaz az ágazat két blokkban másképp nézne ki. |
| Kódbeli nevek | `AGAZATOK`, `Agazat`, `AGAZAT_SZINEK`, `AgazatBadge` | A lista már nem csak iparágakat tartalmaz (Turizmus, Pénzügyi szolgáltatások). A térképes nevek (`iparag` mutató, `TerkepOrszag.iparagak`) maradnak: azok a KFI-blokk „Kiemelt iparágak” mezőjére utalnak. |
| Séma | Nincs változás | A mezőnevek és a JSON-kulcsok (`agazatok`, `kiemeltIparagak`, `kiemeltAgazatok`) maradnak. |
| Hosting | A `DEMO_CSERE` azonosító nem változik | A megfeleltetés miatt a hosting-DB csere nélkül is jól olvasódik. A `2026-10-09`-es csere még nem ment ki (a `main` nincs pusholva), így az a már átnevezett demó DB-t viszi. |

## Hatókörön kívül

- Az „Egyéb” szövegek tartalmi átnézése (pl. a DE vállalati „vegyipar” bejelölése a listában): az
  attasék később maguk jelölhetik be az új elemeket.
- A `TAGSAGOK` és a `KFI_PRIORITASOK` lista.
- A térkép mutatói: a „Kiemelt iparág” továbbra is a KFI-blokk első kiemelt iparágából színez, az
  Alapadatok ágazataira nem készül új mutató vagy szűrő.
- A `CimkeValaszto` komponens (csoportosítás, keresés): változatlan.
- DB-migráció és adatátíró script.

## A közös lista

A legördülő sorrendjében. A meglévő 14 szín megmarad; az átnevezett elem a régi nevének színét
viszi tovább.

| # | Név | Szín | Kiváltja |
| --- | --- | --- | --- |
| 1 | Mesterséges intelligencia és adatgazdaság | `#1f4e9c` | |
| 2 | IKT és digitalizáció | `#2563eb` | IKT és szoftver |
| 3 | Elektronika és félvezetők | `#b45309` | Félvezetők és mikroelektronika |
| 4 | Kvantumtechnológia | `#6b46c1` | |
| 5 | Biotechnológia és gyógyszeripar | `#0f7a68` | Gyógyszeripar |
| 6 | Digitális egészségügy | `#a8326f` | |
| 7 | Energetika és fenntarthatóság | `#2f7d32` | Energetika |
| 8 | Hidrogén és akkumulátor | `#0e7490` | |
| 9 | Űripar | `#334155` | |
| 10 | Mobilitás és autóipar | `#9a3412` | Autóipar |
| 11 | Gépipar | `#4338ca` (új) | |
| 12 | Vegyipar | `#a21caf` (új) | |
| 13 | Anyagtudomány | `#525c6b` | |
| 14 | Agrár- és élelmiszeripar | `#8a6d1f` | Mezőgazdaság és élelmiszeripar; Agrár- és élelmiszertechnológia |
| 15 | Bányászat és nyersanyagok | `#6b3f1d` (új) | |
| 16 | Védelmi ipar | `#7f1d1d` | Védelmi technológia |
| 17 | Kreatív ipar és média | `#be185d` | Kreatív ipar |
| 18 | Pénzügyi szolgáltatások | `#4d7c0f` (új) | |
| 19 | Turizmus | `#d11541` (új) | |
| 20 | Logisztika | `#0369a1` (új) | |
| 21 | Építőipar | `#736a5f` (új) | |

A hét új szín a jelvény tényleges hátterén (a saját szín 8%-os árnyalata fehéren, a jelvény a
színt betűszínként használja) legalább 4,5:1 kontrasztú. Egyik sincs közelebb egy másik
ágazat-színhez vagy a térkép „nincs kiemelt iparág” szürkéjéhez (`TERKEP_SZINEK.semleges`), mint
a meglévő legközelebbi párok (CIE76 Lab-távolság: az újak legkisebb távolsága 16,6, a meglévőké
12,3 és 16,4).

## Megfeleltetés (`lib/orszagprofil-szotar.ts`)

`REGI_AGAZAT_NEVEK`: kilenc régi név → a közös lista neve.

| Régi név | Új név | Melyik régi listából |
| --- | --- | --- |
| Autóipar | Mobilitás és autóipar | gazdasági ágazatok |
| Gyógyszeripar | Biotechnológia és gyógyszeripar | gazdasági ágazatok |
| Energetika | Energetika és fenntarthatóság | gazdasági ágazatok |
| Mezőgazdaság és élelmiszeripar | Agrár- és élelmiszeripar | gazdasági ágazatok |
| IKT és szoftver | IKT és digitalizáció | gazdasági ágazatok |
| Kreatív ipar | Kreatív ipar és média | gazdasági ágazatok |
| Félvezetők és mikroelektronika | Elektronika és félvezetők | iparágak |
| Agrár- és élelmiszertechnológia | Agrár- és élelmiszeripar | iparágak |
| Védelmi technológia | Védelmi ipar | iparágak |

A két régi listának nem volt közös neve, ezért a megfeleltetés mezőtől független: egyetlen tábla
szolgálja mindhárom mezőt.

A kilenc régi név foglalt: a közös listába nem kerülhet vissza, mert a megfeleltetés a szűrés előtt
fut, és a visszavett nevet mentéskor némán átírná. Ezt fordítási idejű őr védi (a tábla
`satisfies Record<string, Agazat> & Partial<Record<Agazat, never>>`): ha egy régi név egyben
`Agazat` is, a `tsc` hibát ad.

`agazatLista(v: unknown): Agazat[]`: a bemenet (JSON-ból vagy `fd.getAll()`-ból jövő tömb, vagy
bármi más) elemeit egyenként megfelelteti, majd a meglévő `szurtLista`-val szűri.

- A sorrend megmarad. Ez számít: az első kiemelt iparág adja a térkép színét.
- Ha két elem ugyanarra az új névre képződik, az egyszer szerepel, az első előfordulás helyén.
- Az ismeretlen elem és a nem szöveges elem kiesik, mint eddig.
- A keresés csak a tábla saját kulcsaira talál (`Object.hasOwn` vagy `Map`): a `constructor` vagy
  a `__proto__` bemenet nem képződhet le semmire.

**Hol fut:**

- a `NORMALIZALOK` három mezőjénél (`alapadatok.agazatok`, `kfiRendszer.kiemeltIparagak`,
  `vallalati.kiemeltAgazatok`): a DB-ből olvasott profil mindig az új neveket adja, tehát a
  szerkesztő, az olvasó nézet és a térkép is;
- a `VALIDALOK` ugyanezen három mezőjénél (`lib/orszagprofil-validacio.ts`): a két belépési pont
  így ugyanúgy olvas. A telepítés előtt megnyitott szerkesztő a kliens-állapotában még a régi
  neveket küldi; ha a mentése eljut a validátorig, ezek nem vesznek el. (Új deploy után a server
  action azonosítója jellemzően megváltozik, ilyenkor a régi kliens mentése űrlap-hibát kap, és
  újratöltés után már az új neveket látja.)

**Hol nem fut:** a demó-profil futtató szigorú ellenőrzésében (`scripts/demo-orszagprofil.ts`,
`LISTAK`). Az országfájlokban a régi név ezentúl „szótáron kívüli opció” hiba; ott csak a közös
lista nevei állhatnak.

A megfeleltetett érték a következő mentéskor már az új néven tárolódik. A tábla tartósan a
kódban marad: egy visszaállított mentés vagy a csere előtti hosting-DB is helyesen olvasódik.

## Kód

**`lib/orszagprofil-szotar.ts`**

- A `GAZDASAGI_AGAZATOK` + `GazdasagiAgazat` és az `IPARAGAK` + `Iparag` helyére az `AGAZATOK` +
  `Agazat`, az `IPARAG_SZINEK` helyére az `AGAZAT_SZINEK` (`Record<Agazat, string>`, 21 szín).
- Új: `REGI_AGAZAT_NEVEK`, `agazatLista`.
- Az `Alapadatok.agazatok`, a `KfiRendszer.kiemeltIparagak` és a `Vallalati.kiemeltAgazatok`
  típusa `Agazat[]`.
- A `MEZO_CIMKEK` nem változik: a három mező címkéje, az „Egyéb” címkék és a „Kiemelt iparágak”
  súgója („Az első adja a térkép színét.”) marad.

**`lib/orszagprofil-validacio.ts`:** a három mező `agazatLista(fd.getAll(...))`-t hív.

**Szerkesztő** (`app/(app)/orszagprofil/components/mezok/`): az `AlapadatokMezok`, a
`KfiRendszerMezok` és a `VallalatiMezok` `CimkeValaszto`-ja `items={AGAZATOK}`-ot kap.

**Olvasó nézet**

- `components/orszagprofil/IparagBadge.tsx` → `AgazatBadge.tsx` (`agazat` prop, `AGAZAT_SZINEK`).
- `components/orszagprofil/BlokkNezet.tsx`: az `Iparagak` segéd neve `Agazatok`, és az
  Alapadatok „Legfontosabb gazdasági ágazatok” sora is ezt használja (eddig a szürke `Cimkek`).
  A `Cimkek` a tagságoknál és a prioritásoknál marad.

**Térkép**

- `lib/terkep-mutatok.ts`: az `iparag` mutató `sorrend`-je az `AGAZATOK`, színei az
  `AGAZAT_SZINEK`. A kategória-csoportok és a jelmagyarázat sorrendje így a közös lista
  sorrendjét követi; a `csakHasznalt` miatt továbbra is csak a használt kategóriák látszanak.
- `app/(app)/terkep/components/TerkepNezet.tsx`: az iparág-szűrő 21 elemű. A hét új elemre
  egyelőre egy ország sem felel meg; ezt a `RangsorPanel` meglévő „szűrés szerinti üres állapota”
  kezeli.
- `db/queries/orszagprofil.ts`: `TerkepOrszag.iparagak: Agazat[]`.
- `ProfilKivonat`, `OsszehasonlitasPanel`: `AgazatBadge`.

**`scripts/demo-orszagprofil.ts`:** a `LISTAK` három mezője az `AGAZATOK`-ra mutat.

## Adat

**A 27 országfájl** (`scripts/demo-orszagprofil/orszagok/<kod>.ts`): a kilenc régi név gépi
átírása, kizárólag az `agazatok`, a `kiemeltIparagak` és a `kiemeltAgazatok` listában. Összesen
122 listaelem:

| Mező | Régi név | Országok száma |
| --- | --- | --- |
| `agazatok` | Mezőgazdaság és élelmiszeripar | 17 |
| `agazatok` | Energetika | 14 |
| `agazatok` | IKT és szoftver | 13 |
| `agazatok` | Autóipar | 12 |
| `agazatok` | Gyógyszeripar | 12 |
| `agazatok` | Kreatív ipar | 2 |
| `kiemeltIparagak` | Agrár- és élelmiszertechnológia | 15 |
| `kiemeltIparagak` | Félvezetők és mikroelektronika | 11 |
| `kiemeltIparagak` | Védelmi technológia | 4 |
| `kiemeltAgazatok` | Félvezetők és mikroelektronika | 9 |
| `kiemeltAgazatok` | Agrár- és élelmiszertechnológia | 7 |
| `kiemeltAgazatok` | Védelmi technológia | 6 |

A listák sorrendje nem változik, a szabadszövegekhez és a fejléc-kommentekhez az átírás nem nyúl.
A hosszabb nevek miatt túl hosszúra nyúló sorokat a fájlok meglévő stílusában kell tördelni.

**A demó DB** (`data/tet.db`): újragenerálás a futtatóval, előbb a DB másolatán, utána élesben
(`--ir`). A 27 országon kívül a DB-ben nincs régi név: a régi JP 2025 sor ágazatlistája üres, KFI-
és vállalati blokkja nincs. Commit előtt:

```bash
sqlite3 data/tet.db "delete from session; VACUUM; PRAGMA wal_checkpoint(TRUNCATE);"
```

A `delete from session` a felhasználó helyi bejelentkezését is törli; a publikus repóba nem
kerülhet érvényes session-token.

A böngészős QA mentés-próbája ugyanezt a DB-t írja (a dev szerver a `data/tet.db`-ből dolgozik),
ezért a végső újragenerálás és a DB commitja a QA után történik: a futtató a fájlok szerinti
állapotot állítja vissza.

## Dokumentáció

`CLAUDE.md`, Országprofil bekezdés: az opciólisták felsorolásában a `GAZDASAGI_AGAZATOK` és az
`IPARAGAK` + `IPARAG_SZINEK` helyett az `AGAZATOK` + `AGAZAT_SZINEK` (a három mező közös listája),
a `REGI_AGAZAT_NEVEK` + `agazatLista` (hol fut, hol nem), és az `IparagBadge` helyett az
`AgazatBadge`.

## Ellenőrzés

Tesztkeretrendszer nincs; az ellenőrzés fordítás, eldobható scriptek és böngészős QA.

- `npx tsc --noEmit`, `npm run build`.
- **Megfeleltetés** (eldobható tsx script, a `lib/` tiszta függvényein):
  - régi név → új név, mind a kilenc sorra;
  - `['Autóipar', 'Mobilitás és autóipar']` → egy elem;
  - `['Űripar', 'Autóipar', 'Gépipar']` → a sorrend marad;
  - ismeretlen név, nem szöveges elem, `'constructor'`, `'__proto__'` → kiesik; nem tömb → `[]`;
  - a `normalizalBlokk` és a `validalBlokk` mindhárom mezőnél ugyanezt adja.
- **A szigorú ellenőrzés régi névre hibát ad:** a szótár átírása után, az országfájlok átírása
  előtt a futtató pontosan 122 „szótáron kívüli opció” hibát jelez; az átírás után egyet sem (27
  `… rendben` sor).
- **Az átírás csak a három listát érinti:** a 27 ország normalizált profilja a `main`-beli
  (átírás előtti, régi neveket tároló) demó DB másolatából olvasva, a megfeleltetésen át, mind a
  8 blokkban megegyezik az újragenerált DB-ből olvasottal, a listák sorrendjével együtt. Ez
  egyszerre igazolja az olvasáskori megfeleltetést és azt, hogy az átírás mást nem változtatott.
- **A DB-ben nem marad régi név:** a három JSON-lista elemei között (`json_each`) egy sincs a
  kilenc régi névből; `select count(*) from session` 0.
- **Böngészős QA** a felhasználó futó dev szerverén (`localhost:3000`, leállítás nélkül), adminnal:
  - a szerkesztőben mindhárom legördülő ugyanazt a 21 elemet kínálja, ebben a sorrendben;
  - egy új elem (pl. Turizmus) bejelölése és mentése után az érték megmarad, és az olvasó nézetben
    színes jelvényként látszik; az eredeti állapotot a DB végső újragenerálása állítja vissza;
  - Németország olvasó nézetében az Alapadatok ágazatai színes jelvények, „Mobilitás és autóipar”
    néven; a KFI- és a vállalati blokkban „Elektronika és félvezetők”;
  - a térkép „Kiemelt iparág” mutatójánál a jelmagyarázat az új neveket mutatja, az országok
    színe nem változott; az iparág-szűrő 21 elemű, egy új elemre (pl. Turizmus) a szűrés szerinti
    üres állapot jelenik meg;
  - a konzol hibamentes.

## Megvalósítási eltérések

Az 1. task minőségi review-ja nyomán, az eredeti spechez (`bb64a9a`) képest:

- **Két új szín.** A Turizmus `#e11d48` helyett `#d11541`, az Építőipar `#78716c` helyett
  `#736a5f`. Az eredeti kritérium fehér háttérre mért; a jelvény saját, 8%-os hátterén a két
  eredeti szín 4,15:1, illetve 4,36:1 volt. Az Építőipar eredeti szürkéje a térkép „nincs kiemelt
  iparág” színétől is csak 14,3-ra állt.
- **A régi nevek foglaltságának őre.** Az eredeti spec őr nélküli táblát írt elő (`Object.hasOwn`
  vagy `Map`); az invariánst csak az eldobható assert-script ellenőrizte volna.
- **A validátorbeli megfeleltetés indoka** pontosabb lett: a régi kliens mentése új deploy után
  jellemzően el sem jut a validátorig.

Nem készült el, későbbi csiszolásnak maradt (a review „apró” pontjai, a hatókörön kívül):

- A szerkesztő legördülője 21 elemből nyolcat mutat egyszerre, görgetősáv nélkül
  (`components/ui/combobox.tsx`, `no-scrollbar`); a lista gépeléssel szűrhető és görgethető.
- A térkép iparág-szűrője szűk felugróban nyílik újra, ha a lista végéről van elem kiválasztva
  (`alignItemWithTrigger`).
- A szűrő mind a 21 elemet kínálja, pedig csak az adatokban előforduló iparágakra ad találatot.

**Visszaút.** Az új néven mentett vagy újragenerált DB-t a régi kód olvasáskor megcsonkítaná (a
régi `szurtLista` eldobná pl. az Alapadatokból a „Mobilitás és autóipar”-t). A kód visszaállítása
ezért a DB visszaállításával együtt jár.
