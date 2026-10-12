# Országprofil: kérdőjeles magyarázat minden kitöltendő mezőnél – tervezési spec

Dátum: 2026-10-12
Állapot: megvalósítva és átnézve; a szövegek és a komponens leírása a végleges kóddal egyezik

## Cél

Az országprofil szerkesztőjében (`/orszagprofil/[kod]/szerkesztes`, 8 blokk) minden kitöltendő mező
címkéje mellett legyen egy kérdőjeles gomb, amely felugró magyarázatot nyit: **mit kell pontosan a
mezőbe írni**, és egy **példa**. A példa a mező valódi formátumát mutatja, a validátor szabályaival
egyezően (pl. tizedesvessző, egész szám, soronként egy név).

## Döntések

| Kérdés | Döntés | Indok |
| --- | --- | --- |
| Komponens | Base UI **Popover** (`npx shadcn@latest add popover`), a triggeren `openOnHover` | Hoverre nyílik, mint egy tooltip; billentyűzettel (Tab, Enter/Space) és érintéssel (koppintás) is elérhető. A Base UI `Tooltip` rövid, nem interaktív szövegre való, érintőképernyőn nem nyílik. |
| A meglévő látható súgósorok | Átkerülnek a tooltipbe, a mező alatt nem marad súgósor | A felhasználó döntése: egységes, tisztább űrlap, minden mezőnél ugyanott a segítség. |
| Hatókör | Csak az országprofil szerkesztő űrlapja (a rendezvénysorok mezőivel együtt) | A kérés az országprofil „kitöltendő celláira” szól. Az olvasó nézet, a riport- és a felhasználó-űrlapok nem változnak. |
| A szövegek helye | `MEZO_CIMKEK` (`lib/orszagprofil-szotar.ts`) | A típusa már kimerítő mezőnév szerint: kötelező `magyarazat` mezővel a fordító garantálja, hogy egyetlen mezőből sem hiányzik. A címke és a magyarázat egy helyen marad. |
| A `Mezo` komponensek régi `sugo` string propja | Marad | A felhasználó-űrlap (`OrszagMezok`) használja a `Mezo`-n; ott a látható sor változatlan. A burkolók (`SzovegMezo`, `RovidMezo`, `SzamMezo`, `CimkeValaszto`) `sugo`-ja a bekötés után hívó nélküli, de megmaradt (nem kért tisztítás). |
| Futó példaország | Dél-Korea | A mostani súgók is azt használják (Szöul, KRW), és a 27 demó-profil közül a leginkább kidolgozott. |
| A rendezvény „Időpont” placeholderje (`pl. évente október`) | Megszűnik, a példa a tooltipbe kerül | Egy mezőnél ne legyen két különböző példa. |

## Hatókörön kívül

- Blokk-szintű magyarázat (a kártya címe melletti kérdőjel).
- Az olvasó nézet és a térkép.
- A validátor szabályai: a szövegek a mostani szabályokat írják le, nem módosítják.
- Országonként eltérő példa: egy rögzített példasor van.

## Komponensek

**`components/form/SugoGomb.tsx`** (`'use client'`). Props: `cimke`, `magyarazat`, `pelda?`.

- A trigger egy `<button type="button">` (nem küldi be az űrlapot), kis kérdőjel-ikonnal
  (lucide `CircleQuestionMark`), `aria-label="Magyarázat: <cimke>"`, látható fókuszgyűrűvel
  (`focus-visible:outline-hidden`: nagy kontrasztú módban csak fókuszban kap körvonalat). A
  `-my-[3px]` miatt a 20 px-es gomb nem növeli a címkesor magasságát; a komponens `memo`-zott
  (a propok sztringek), így a vezérelt blokkok billentyűleütései nem renderelik újra.
- A `PopoverTrigger` `openOnHover` + `delay={150}` / `closeDelay={100}`, hogy a kurzor át tudjon
  menni a felugróra. Esc, kívülre kattintás, kurzor-elhagyás zár. Hoverrel nyitott felugrón a
  kb. 500 ms-on belüli kattintás rögzíti (nyitva marad), egy későbbi kattintás bezárja: ez a Base UI
  „patient click”-je, nincs rá publikus kapcsoló (a determinisztikus alternatíva a hover
  elhagyása lenne).
- A felugró `role="dialog"`: a neve a (képernyőn rejtett, `sr-only`) `PopoverTitle` = a címke, a
  leírása a `PopoverDescription` = a magyarázat; enélkül a képernyőolvasó névtelen párbeszédablakot
  jelezne.
- A tartalom: `magyarazat`; ha van `pelda`, alatta „Példa” felirat és a példa halvány hátterű
  blokkban (`whitespace-pre-line`, hogy a több soros példa – pl. a vállalatlista – soronként
  jelenjen meg). `w-80` (20 rem) széles, `break-words`.

**`components/form/CimkeSor.tsx`**. A `Label` és a `SugoGomb` egy sorban, **testvér elemként**: ha a
gomb a `<label>`-ben lenne, a rákattintás a mezőre fókuszálna. Props: `id`, `htmlFor`, `cimke`,
`magyarazat?`, `pelda?`, `labelClassName?` (a `CimkeValaszto` „Egyéb” almezőjének kisebb címkéjéhez).
A `SugoGomb` csak akkor renderelődik, ha van `magyarazat`.

**Bekötés.**

- `Mezo`, `SzovegMezo`, `RovidMezo`, `SzamMezo`: új opcionális `magyarazat?: string`, `pelda?: string`
  prop; a címke-sort a `CimkeSor` adja. A `sugo` marad (lásd Döntések).
- `CimkeValaszto`: ugyanez a főmezőre és az `egyeb` objektumra (`magyarazat`, `pelda`).
- `RendezvenySorok`: a négy mező címkéje `CimkeSor`; a szövegek a `REND_MEZO_CIMKEK` táblából.
- A mező-komponensek (`mezok/*Mezok.tsx`) hívóhelyén a `cimke={C.x.cimke} sugo={C.x.sugo}` helyett
  `{...C.x}` szórás: a `MezoCimke` mezői (`cimke`, `magyarazat`, `pelda`) névre egyeznek a propokkal.
- `RendezvenyekMezok`: a látható `lista.sugo` bekezdés helyett a „Rendezvények” címkesor a
  gombbal a sorok fölött.
- Az `aria-describedby` nem hivatkozhat a nem létező `-sugo` elemre: a magyarázatot használó
  mezőknél a `leiroAttr(..., vanSugo)` `false`. A gomb a DOM-ban közvetlenül a címke mellett van,
  így a Tab-sorrendben a mező előtt érhető el.

**Szótár.** A `MezoCimke` (`lib/orszagprofil-szotar.ts`):

```ts
export interface MezoCimke {
  cimke: string;
  /** Mit kell a mezőbe írni (a validátor szabályaival egyezően). */
  magyarazat: string;
  /** Példa-érték; többsoros mezőnél `\n`-nel elválasztva. */
  pelda?: string;
}
```

A `sugo?` mező megszűnt (a fordító jelzi a régi hivatkozásokat). Új `REND_MEZO_CIMKEK:
Record<keyof Rendezveny, MezoCimke>` a rendezvénysorok mezőinek. A korlátok számát a szövegek a
szótár konstansaiból veszik (`EV_MIN`, `TOP_VALLALAT_MAX`, `RENDEZVENY_MAX`, `OSSZEGZES_MAX`), a
tizedes- és min/max szabályok szövegesek: a validátor változásakor a szöveget is frissíteni kell
(ez a `CLAUDE.md`-ben is szerepel).

## Szövegek

A futó példa Dél-Korea (a `scripts/demo-orszagprofil/orszagok/kr.ts` tartalmából), a szabályok a
`lib/orszagprofil-validacio.ts`-ből. A táblák a végleges szótárból (`MEZO_CIMKEK`,
`REND_MEZO_CIMKEK`) készültek, a kódban a korlátok számai konstansból jönnek (itt kiértékelve
látszanak: 2010, 10, 500). A „Példa” oszlop az űrlapon úgy jelenik meg, ahogy itt áll.

### Alapadatok és gazdasági háttér

| Mező | Magyarázat | Példa |
| --- | --- | --- |
| Főváros | Az ország fővárosának neve magyarul. | Szöul |
| Terület (km²) | Az ország teljes területe négyzetkilométerben, egész számként. Az ezreseket szóközzel tagolhatod. | 100 460 |
| Pénznem | A hivatalos pénznem magyar neve, utána zárójelben az ISO-kódja. | dél-koreai von (KRW) |
| Lakosság (fő) | Az ország lakossága főben, az Adatév szerinti állapotban; egész szám, az ezreseket szóközzel tagolhatod. | 51 681 000 |
| GDP (milliárd USD) | Az ország nominális (folyó áras) GDP-je milliárd amerikai dollárban az Adatévre; legfeljebb egy tizedesjeggyel, tizedesvesszővel. Az ezreseket szóközzel tagolhatod. | 1 858,6 |
| Egy főre jutó GDP (USD) | Az egy főre jutó nominális GDP amerikai dollárban az Adatévre; egész szám, az ezreseket szóközzel tagolhatod. | 35 962 |
| GDP-növekedés (%) | A reál-GDP éves növekedése az Adatévre, százalékban; legfeljebb egy tizedesjeggyel, tizedesvesszővel, csökkenésnél mínusz előjellel. | 0,9 vagy -1,2 |
| Adatév | Az az év, amelyre a lakosság és a GDP-adatok vonatkoznak; 2010 és az aktuális év között. | 2025 |
| Forrás | Az adatok forrása (pl. IMF, Világbank, nemzeti statisztikai hivatal), a kiadással vagy az időponttal. Több forrást vesszővel válassz el. | IMF World Economic Outlook (2025. október), Világbank |
| Nemzetközi szervezeti tagság | Válaszd ki a listából azokat a szervezeteket, amelyeknek az ország tagja. Ami nincs a listán, azt az „Egyéb tagság” mezőbe írd. |  |
| Egyéb tagság | A listán nem szereplő szervezeti tagságok, vesszővel elválasztva. | APEC, RCEP, IPEF |
| Legfontosabb gazdasági ágazatok | Válaszd ki a listából az ország gazdaságában legnagyobb súlyú ágazatokat (a KFI-politika kiemelt iparágai külön, az 1. blokk „Kiemelt iparágak” mezőjébe kerülnek). Ami nincs a listán, azt az „Egyéb ágazat” mezőbe írd. |  |
| Egyéb ágazat | A listán nem szereplő gazdasági ágazatok, vesszővel elválasztva. | Hajógyártás, acélipar |

### 1. KFI-rendszer és szakpolitika

| Mező | Magyarázat | Példa |
| --- | --- | --- |
| KFI-teljesítmény | Az ország KFI-pozíciója nemzetközi mutatók alapján: index, helyezés, az elmúlt évek iránya. Add meg a forrást és az évet. | Global Innovation Index 2025: 4. hely a 139 gazdaság közül (2024: 6.), régiójában az első. A K+F-ráfordítás 2024-ben a GDP 5,13%-a (OECD MSTI). |
| K+F ráfordítás a GDP %-ában | A bruttó hazai K+F-ráfordítás (GERD) a GDP százalékában, legfeljebb két tizedesjeggyel, tizedesvesszővel. Az érték évét a KFI-teljesítmény szövegében add meg. | 5,13 |
| KFI stratégia | A hatályos nemzeti KFI- vagy tudomány- és technológiastratégia neve és időtávja, egy sorban; ha van, a fő célkitűzéssel. | 6. Tudomány- és Technológiai Alapterv (2026–2030): több mint 200 billió von állami K+F |
| Prioritások | Válaszd ki a listából az ország KFI-politikájának kiemelt témáit. Ami nincs a listán, azt az „Egyéb prioritás” mezőbe írd. |  |
| Egyéb prioritás | A listán nem szereplő KFI-prioritások, vesszővel elválasztva. | 6G-fejlesztés, bioökonómia |
| Kiemelt iparágak | Válaszd ki a listából azokat az iparágakat, amelyekre az ország a KFI-politikájában a leginkább épít. A sorrend számít: a térképen az első színe jelenik meg, ezért a legfontosabbal kezdd (a sorrend módosításához távolítsd el, majd válaszd ki újra az elemeket). Ami nincs a listán, azt az „Egyéb iparág” mezőbe írd. |  |
| Egyéb iparág | A listán nem szereplő kiemelt iparágak, vesszővel elválasztva. | Fejlett robotika, atomenergia |
| Erősségek | A KFI-rendszer legfontosabb erősségei, néhány mondatban vagy felsorolásban; lehetőleg számmal vagy helyezéssel alátámasztva. | Erős nagyvállalati K+F: a legnagyobb befektetők a Samsung Electronics, az SK hynix és a Hyundai Motor. A GII 2025 szerint Korea első a GDP-arányos vállalati K+F-ráfordításban. |
| Kihívások | A KFI-rendszer fő gyengeségei, szűk keresztmetszetei, kockázatai; lehetőleg számmal alátámasztva. | A K+F néhány nagy konglomerátumon belül összpontosul, a tudományos cikkeknek csak mintegy negyede készül nemzetközi társszerzőséggel. |

### 2. KFI intézmény- és kutatási ökoszisztéma

| Mező | Magyarázat | Példa |
| --- | --- | --- |
| Irányító szervek | A KFI-politikát irányító és finanszírozó szervek: minisztériumok, ügynökségek, tanácsok. Szervenként egy sor: név (rövidítés) – feladata egy mondatban. | Tudományos és IKT Minisztérium (MSIT) – az állami K+F és a KFI-stratégia gazdája.<br>Nemzeti Kutatási Alapítvány (NRF) – a kutatási pályázatok fő finanszírozója. |
| Meghatározó egyetemek | A KFI szempontjából legfontosabb egyetemek, zárójelben a városukkal; ha releváns, a fő szakterülettel is. | KAIST (Tedzson), Szöuli Nemzeti Egyetem (Szöul), POSTECH (Pohang) |
| Kutatóközpontok, intézetek | A meghatározó, nem egyetemi kutatóintézetek és kutatóhálózatok (állami vagy magán), a szakterületükkel. | Koreai Tudományos és Technológiai Intézet (KIST) – multidiszciplináris; ETRI – elektronika és távközlés; KRISS – metrológia |
| Kutatási infrastruktúrák | A nagy kutatási infrastruktúrák: kutatóreaktor, részecskegyorsító, röntgenlézer, fúziós berendezés, szuperszámítógép – név és hely. A tudományos és technológiai parkok a 3. blokk „Klaszterek, inkubátorok” mezőjébe kerülnek. | PAL-XFEL röntgenlézer (Pohang); KSTAR szupravezető tokamak (Tedzson); a KISTI nemzeti szuperszámítógépe (Tedzson) |

### 3. Innovációs és vállalati ökoszisztéma

| Mező | Magyarázat | Példa |
| --- | --- | --- |
| Kiemelt ágazatok | Válaszd ki a listából azokat az ágazatokat, amelyekben az ország innovatív vállalatai a legerősebbek. Ami nincs a listán, azt az „Egyéb ágazat” mezőbe írd. |  |
| Egyéb ágazat | A listán nem szereplő ágazatok, vesszővel elválasztva. | Hajógyártás, kijelzőgyártás |
| Top 10 vállalat | Az ország KFI szempontjából legfontosabb vállalatai, fontossági sorrendben (az országprofil oldalán számozott listaként jelenik meg). Soronként egy név, legfeljebb 10. | Samsung Electronics<br>SK hynix<br>Hyundai Motor |
| Startupok, KKV-k | A startup- és KKV-ökoszisztéma jellemzői: ismert startupok, unikornisok, támogató programok, számok. | Ismert unikornisok: Toss, Kurly. A TIPS program 2026-ban 800 startupot támogat. |
| Klaszterek, inkubátorok | A meghatározó innovációs klaszterek, tudományos és technológiai parkok, inkubátorok és gyorsítóprogramok (akcelerátorok) – név, hely, szakterület. | Pangyo Techno Valley (IKT, játékipar, fintech); Songdo (biotechnológia); 19 Kreatív Gazdasági Innovációs Központ (CCEI) régiós inkubátorként. |
| Technológiatranszfer | Hogyan jut el a kutatási eredmény a vállalatokhoz: transzferirodák, hasznosítási programok, spin-off-támogatás, vállalati kockázati tőke. | Egyetemi és intézeti technológiatranszfer-irodák (KAIST, ETRI, KIST); a KIAT technológiatranszfer-programjai. |

### 4. KFI programok és finanszírozási lehetőségek

| Mező | Magyarázat | Példa |
| --- | --- | --- |
| Pályázatok | Az országban elérhető fő KFI-pályázati programok: kiíró, a program neve és témája, valamint – ha ismert – a jellemző beadási időszak. | NRF alapkutatási pályázatok (egyéni, fiatal kutatói, csoportos sémák); IITP IKT K+F felhívások; KEIT ipari technológiai programok. |
| Támogatási programok | Állami támogatási és ösztönző programok (startup-, inkubációs, mobilitási, tehetséggondozási): név, kezelő szerv, célcsoport. | TIPS (MSS) – technológiai startupok, magánbefektetői előszűréssel; Brain Pool (MSIT, NRF) – külföldi kutatók meghívása koreai egyetemekre és kutatóintézetekbe. |
| Finanszírozási eszközök | A pályázaton kívüli finanszírozási eszközök: kockázati tőke, alapok alapja, hitelgarancia, kedvezményes hitel, adókedvezmény. | KVIC alapok alapja; KOTEC technológiaalapú hitelgaranciák; K+F-adójóváírás. |
| Nemzetközi részvételi lehetőségek | Azok a nemzetközi programok, amelyekben az ország szervezetei – akár magyar partnerrel közösen – részt vehetnek: EU-s keretprogram, EUREKA, kétoldalú vagy regionális felhívások. | Közös konzorcium a Horizont Európa II. pillérében (Korea társult ország); EUREKA-projektek; kétoldalú NKFIH–NRF felhívások. |

### 5. Jelentősebb KFI rendezvények

| Mező | Magyarázat | Példa |
| --- | --- | --- |
| Rendezvények (lista) | Az országban rendszeresen megrendezett jelentősebb KFI-rendezvények. Legfeljebb 10 rendezvény, a rendezvény neve kötelező; a teljesen üres sor kimarad. |  |
| Név | A rendezvény hivatalos neve. Kötelező: név nélkül a sor nem menthető (a teljesen üres sor kimarad). | BIO KOREA |
| Típus | Szakkiállítás, konferencia vagy egyéb fórum (pl. startup-fesztivál, kormányzati tudománydiplomáciai fórum). |  |
| Időpont | Mikor és hol tartják, szabadon megfogalmazva; visszatérő rendezvénynél a szokásos hónap. | április–május, Szöul (COEX) |
| Megjegyzés | Rövid leírás: a rendezvény témája, szervezője, és ha ismert, a következő (vagy a legutóbbi) alkalom pontos dátuma. | Biotechnológia és gyógyszeripar, partnering; 2026: április 28–30. |

### 6. Nemzetközi és magyar–fogadó országbeli KFI/TéT kapcsolatok

| Mező | Magyarázat | Példa |
| --- | --- | --- |
| EU és multilaterális kapcsolatok | Az ország kapcsolata az EU-val és többoldalú szervezetekkel, programokkal a KFI területén: társulás, partnerségek, tagság, vegyesbizottság. | Horizont Európa-társult ország (II. pillér) 2025-től; EU–Korea Digitális Partnerség (2022) és Zöld Partnerség (2023); az EUREKA teljes jogú tagja. |
| Partnerországok | Azok az országok, amelyekkel a fogadó ország KFI-együttműködése a legintenzívebb, az együttműködés jellegével. | USA (Technology Prosperity Deal, 2025), EU (Horizont Európa-társulás, digitális és zöld partnerség). |
| Érvényes TéT-egyezmény | A Magyarországgal kötött hatályos tudományos-technológiai egyezmény megnevezése és aláírásának éve, egy sorban. Ha nincs, hagyd üresen. | Magyar–koreai kormányközi egyezmény a tudományos és műszaki együttműködésről (1989) |
| Kétoldalú együttműködések | A magyar–fogadó országbeli KFI-együttműködések: vegyesbizottsági ülések, közös felhívások, egyetértési megállapodások, közös projektek – évszámmal. | TéT-vegyesbizottság 10. ülése (2021); NKFIH–NRF közös felhívás (2022: 5 magyar nyertes); V4–Korea közös felhívás (2023). |
| Mobilitás | Ösztöndíjak, kutatócsere, hallgatói és kutatói mozgás a két ország között: program, létszám, év. | Stipendium Hungaricum: évi 100 hely, 2025/26-ban 63 ösztöndíjas; Global Korea Scholarship: 2026-ban 4 nagykövetségi hely. |

### 7. Magyar szempontú értékelés és lehetőségek

| Mező | Magyarázat | Példa |
| --- | --- | --- |
| Összegzés | Az ország KFI-profiljának és a magyar együttműködési lehetőségeknek a rövid összefoglalója, 2–4 mondatban, legfeljebb 500 karakterben. Ez jelenik meg a térképen, az ország kiválasztásakor megnyíló panelen. | Dél-Korea a világ egyik legintenzívebb K+F-befektetője (2024: a GDP 5,13%-a), a GII 2025-ös rangsorában 4. A magyar–koreai TéT-kapcsolat az 1989-es egyezményre és a közös NKFIH–NRF felhívásokra épül; a legnagyobb potenciál az akkumulátor- és gyógyszerkutatásban van. |
| Együttműködési lehetőségek | Konkrét területek, ahol magyar kutatóhelyeknek és vállalatoknak együttműködési lehetőségük van, rövid indoklással. | Akkumulátor-technológia és -újrahasznosítás a magyarországi koreai gyártóbázisra építve; gyógyszer- és orvosbiológiai kutatás (a 2025-ös NKFIH–NRF projektek témái). |
| Jó gyakorlatok, hazai adaptáció | Az országban bevált KFI-megoldások, amelyeket Magyarországon is érdemes lehet alkalmazni, a hazai adaptálás lehetőségével. | A TIPS modellje: a magánbefektetői szűrés megelőzi a közpénzt; a kiemelt technológiák elkülönített, ötéves K+F-kerete. |
| Diplomáciai prioritások | A magyar–fogadó országbeli KFI-kapcsolatok erősítéséhez javasolt következő lépések: tárgyalandó témák, kezdeményezések, intézményi teendők. | A TéT-vegyesbizottság kétévenkénti ülésezésének biztosítása; az NKFIH–NRF közös felhívások folytatása; közös Horizont Európa-konzorciumok szervezése. |

## Ellenőrzés

Nincs tesztkeretrendszer, ezért:

- `npx tsc --noEmit` és `npm run build`: a `MEZO_CIMKEK` kimerítő típusa miatt hiányzó vagy régi
  (`sugo`) hivatkozás fordítási hiba.
- Egy eldobható tsx script (nem commitolt) ellenőrizte, hogy minden `magyarazat` nem üres, és
  hogy mind a 43 példa átmegy a valódi validátoron (`validalBlokk`: hossz, számformátum, sorok
  száma).
- Headless böngészővel (gstack), admin belépéssel a DE és KR profilon: a gomb hoverre és
  billentyűzettel (fókusz + Enter) nyit, Esc zár; a kattintás nem küldi be az űrlapot és nem ugrik a
  mezőre; a `CimkeValaszto`-nál nem nyitja a legördülőt; a rendezvénysorokban is működik;
  keskeny ablakban (375 px) a felugró az ablakon belül marad; 86 gomb = 46 + 4 × 10 sor; a
  felugró `aria-labelledby`/`aria-describedby` értéke be van állítva; nincs konzolhiba.
- Megfigyelés (nem hiba): ha a felugró hoverrel nyílt, a kb. 500 ms utáni kattintás bezárja.

## Feladatok

1. **Popover és komponensek:** `npx shadcn@latest add popover`; `SugoGomb`, `CimkeSor`; `Mezo`,
   `SzovegMezo`, `RovidMezo`, `SzamMezo`, `CimkeValaszto` új propjai.
2. **Szövegek:** `MezoCimke` és `MEZO_CIMKEK` átalakítása, `REND_MEZO_CIMKEK`, az összes szöveg
   felvétele a fenti táblák szerint.
3. **Bekötés és dokumentáció:** a 8 `*Mezok.tsx` és a `RendezvenySorok` átállítása, a látható
   `sugo` sorok és az Időpont placeholder eltávolítása az országprofilból, `CLAUDE.md` frissítése
   (`MEZO_CIMKEK` leírása, új komponensek).
