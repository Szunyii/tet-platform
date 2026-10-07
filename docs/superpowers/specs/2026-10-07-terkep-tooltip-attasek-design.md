# Térkép tooltip: minden attasé, relációs vezető, részterület – tervezési spec

Dátum: 2026-10-07
Állapot: jóváhagyva

## Cél

A térkép tooltipje ma csak az első attasét mutatja („Kindert Judit · Berlin +2 attasé”). A
felhasználó kérése: ha egy országban több attasé van, mindegyikük neve látszódjon, az is, hogy
ki közülük a relációs vezető, és – például az USA-nál vagy Németországnál – hogy melyik
részterület kié.

## Döntések

| Kérdés | Döntés | Indok |
| --- | --- | --- |
| Részterület a tooltipben | Rövidítve: legfeljebb 2 sor, a végén „…” (CSS `line-clamp`); a teljes szöveg kattintásra a jobb oldali panelen (`ProfilKivonat`) | A felhasználó döntése. Az USA-ban dr. Nagy Gabriella listája kb. 340 karakter: teljes szöveggel a tooltip a térkép nagy részét eltakarná, és a kártya `overflow-hidden` kerete levághatná. |
| Vezető jelölése | Kis „relációs vezető” címke a vezető sorában, csak több attasénál | Egyszemélyes országban a vezetőség automatikus; a profiloldal (`AttaseLista`) és a panel is csak több attasénál jelöl. |
| Attasék száma a tooltipben | Legfeljebb 4, a többi helyén „+N további attasé” | A tooltip nem görgethető; a mai adatokban a maximum 3 (Németország). |
| Tooltip szélessége | Legfeljebb 320 px (eddig 240), tartalomhoz igazodva; keskenyebb térképen a térkép szélessége | A „dr. Nagy Gabriella · New York” és a címke egy sorba férjen; a jobb szélen se keskenyedjen össze. |
| Tooltip elhelyezése | Mindkét tengelyen a térkép-konténeren belül: CSS `clamp()` a tooltip tényleges méretével | Minőségi review: a kártya `overflow-hidden`, és 1280x720-on a németországi tooltip teteje már 34 px-re kilógott a térkép fölé. Kitöltött profillal vagy több attaséval ez rosszabb lenne. |
| Összehasonlító tábla „Attasé” sora | Változatlan (`attasekRovid`) | Keskeny oszlop; nem volt kérés. |
| Adat | Nincs DB- és lekérdezés-változás | A `TerkepOrszag.attasek` (`OrszagAttase[]`) már tartalmazza a vezetőt, a várost, a székhely-országot és a részterületet, `rendezAttasek` sorrendben. |

## Hatókörön kívül

- A részterület térképes megjelenítése (állam- és tartományhatárok, színezés): a térkép csak
  országhatárokat ismer (110m atlasz), a részterület szabad szöveg.
- Az összehasonlító tábla „Attasé” sora és a profiloldal `AttaseLista`-ja (az már mutatja a
  részterületet).
- Billentyűzettel elérhető tooltip: a térkép poligonjai ma sem fókuszálhatók.

## Tooltip (`app/(app)/terkep/components/TerkepTooltip.tsx`)

Az egyetlen attasé-sor helyére lista kerül, az `o.attasek` sorrendjében. A lekérdezés
`rendezAttasek`-kel rendez: elöl a vezető, utána a többi székhelyes attasé, végül a régiósak,
csoporton belül név szerint.

- Soronként `attaseFelirat(a, o.kod)`: „Név · Város”, város nélkül „Név”, régiósnál
  „Név · regionálisan (Város)” (város nélkül a székhely országával).
- Ha `o.attasek.length > 1` és `a.vezeto`: a sor végén kis „relációs vezető” címke, amely nem
  törik két sorba.
- Ha van `a.reszterulet`: a név alatt halványabb bekezdés, legfeljebb 2 sor, a végén „…”. A beírt
  sortörések itt szóközként jelennek meg.
- Ha 4-nél több attasé van, az első 4 után egy „+N további attasé” sor.
- Az üres lista szövege továbbra is „nincs aktív attasé”, `o === null` esetén pedig
  „Nincs kihelyezett TéT attasé”.
- A mutató, az állapot és a kiemelt iparágak sora nem változik.
- Az attasé-sorok teljes fényerővel jelennek meg (a többi sor 70%-os marad), a részterület ennél
  halványabb. Így több attasénál a nevek elkülönülnek a részterülettől és az adatsoroktól.
- Az attasé-lista után kis térköz van, hogy az utolsó részterület ne folyjon össze a következő
  adatsorral. A szóköz nélküli szöveg is tördelődik (`break-words`).

**Elhelyezés és szélesség.** A tooltip `max-w-60` helyett a tartalmához igazodik (`w-max`),
legfeljebb 320 px-ig (`TOOLTIP_SZELESSEG`, modulon belüli konstans), keskenyebb térképen a térkép
szélességéig (`max-width: min(320px, 100%)`). Vízszintesen a kurzor fölé középre, függőlegesen
arra az oldalra kerül, ahol több a hely, és mindkét tengelyen CSS `clamp()` tartja a
térkép-konténeren belül (a kártya `overflow-hidden`). A `translate()` százaléka a tooltip saját
méretére vonatkozik, így a clamp a tényleges szélességgel és magassággal számol; ha a tooltip
magasabb a térképnél, a teteje igazodik. Ehhez a `HoverAllapot` a konténer szélességét is viszi
(`szelesseg`); a `VilagTerkep` csak a nyers kurzor-pozíciót adja, a beégetett `120`-as
vízszintes korlátja megszűnik.

**Magasság.** A 4 attasés és a 2 soros korlát miatt a tooltip legfeljebb kb. 17 soros. A mai
adatokkal Németország 12, az USA 10 sor (182, illetve 148 px).

## Jobb oldali panel (`app/(app)/terkep/components/ProfilKivonat.tsx`)

A `CardDescription` attasé-soraiban a felirat és a „· relációs vezető” jelölés nem változik.
Ha az attasénak van részterülete, alatta a teljes szöveg jelenik meg: `text-xs`,
`whitespace-pre-wrap`, `break-words`, mint az `AttaseLista`-ban, így a beírt sortörések
megmaradnak. Az attasék között kis térköz van, hogy a részterület-blokkok ne folyjanak össze.

## Dokumentáció

`CLAUDE.md`, Térkép bekezdés:

- a tooltip leírása: az `attasekRovid` helyett az új lista, a 4-es korlát, a címke, a 2 soros
  részterület és az elhelyezés (szélesség, `clamp()` mindkét tengelyen);
- a `ProfilKivonat` részterülete;
- az `attasekRovid` innentől csak az összehasonlító tábla „Attasé” sorát adja.

## Ellenőrzés

- `npx tsc --noEmit`, `npm run build`.
- gstack böngészős QA a felhasználó futó TéT dev szerverén (`localhost:3000`), adminnal:
  - **Németország:** három attasé ebben a sorrendben: Kindert Judit a címkével, dr. Gurza
    László, Komma Krisztián (a vezető után név szerint, a „dr.” előtag a D-hez sorolja). A
    részterületek legfeljebb 2 sorosak, a hosszabbak „…”-tal.
  - **USA:** két attasé, dr. Nagy Gabriella a címkével, mindkét részterület 2 sorra vágva.
  - **Írország:** „Balogh András Zoltán · regionálisan (London)”, címke és részterület nélkül.
  - **Ausztria:** egy attasé, címke nélkül.
  - **Panel:** Németországra, illetve az USA-ra kattintva a panelen a teljes részterület-listák
    látszanak.
  - **Szélek:** a jobb és a bal szélhez közeli országnál a tooltip nem lóg ki a térképből (a
    befoglaló téglalapok összevetése).
  - **Elhelyezés:** a kurzort a térkép 9 pontjára (sarkok, élközepek, közép) téve a németországi
    és az USA-tooltip 1280x720, 1440x900, 1024x768 és 640x900 viewporton a térképen belül marad.
    Ennél kisebb térképen a tooltip a térkép szélességére szűkül, és a teteje igazodik.
  - **Konzol:** a `console --errors` üres.

## Megvalósítási eltérések

A Task 1 minőségi review-ja nyomán, a terv kódjához képest:

- **Elhelyezés.** A tervben a `VilagTerkep` a kurzor x-ét a legnagyobb szélesség felével
  (160 px) korlátozta, függőlegesen pedig nem volt korlát. A review kimutatta a hiányosságokat:
  - 1280x720-on a németországi tooltip teteje 34 px-re kilóg;
  - a keskeny tooltip a széleken messze kerül a kurzortól;
  - 320 px-nél keskenyebb térképen a tooltip balra kilóg.

  Helyette a `TerkepTooltip` mindkét tengelyen CSS `clamp()`-pel, a tényleges mérettel tartja
  magát a konténeren belül, és a `TOOLTIP_SZELESSEG` nem exportált.
- **`break-words`** a tooltipen: a szóköz nélküli részterület különben kifolyt, „…” nélkül.
- **Térköz és szóköz.** Az attasé-lista után térköz került (`mb-1`), a vezető-címke elé szóköz
  (a szövegtartalom így „New York relációs vezető”).
