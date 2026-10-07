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
| Tooltip szélessége | Legfeljebb 320 px (eddig 240), tartalomhoz igazodva | A „dr. Nagy Gabriella · New York” és a címke egy sorba férjen; a jobb szélen se keskenyedjen össze. |
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

**Szélesség.** A tooltip `max-w-60` helyett a tartalmához igazodik (`w-max`), legfeljebb
320 px-ig. A szélességet egyetlen exportált konstans adja (`TOOLTIP_SZELESSEG`, inline
`maxWidth`). A `VilagTerkep` `onHover` vízszintes korlátja ma beégetett `120`; helyette a
konstans fele lesz, így a két érték nem csúszhat szét. A `w-max` nélkül a jobb szél közelében a
tooltip a maradék helyre keskenyedne össze.

**Magasság.** A 4 attasés és a 2 soros korlát miatt a tooltip legfeljebb kb. 17 soros. A mai
adatokkal Németország 12, az USA 10 sor. A függőleges elhelyezés (a több hely felé) nem változik.

## Jobb oldali panel (`app/(app)/terkep/components/ProfilKivonat.tsx`)

A `CardDescription` attasé-soraiban a felirat és a „· relációs vezető” jelölés nem változik.
Ha az attasénak van részterülete, alatta a teljes szöveg jelenik meg: `text-xs`,
`whitespace-pre-wrap`, `break-words`, mint az `AttaseLista`-ban, így a beírt sortörések
megmaradnak. Az attasék között kis térköz van, hogy a részterület-blokkok ne folyjanak össze.

## Dokumentáció

`CLAUDE.md`, Térkép bekezdés:

- a tooltip leírása: az `attasekRovid` helyett az új lista, a 4-es korlát, a címke, a 2 soros
  részterület és a `TOOLTIP_SZELESSEG`;
- a `ProfilKivonat` részterülete;
- az `attasekRovid` innentől csak az összehasonlító tábla „Attasé” sorát adja.

## Ellenőrzés

- `npx tsc --noEmit`, `npm run build`.
- gstack böngészős QA a TéT dev szerveren, a 3001-es porton (a 3000-et a mechalearn
  használja), adminnal:
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
  - **Konzol:** a `console --errors` üres.
