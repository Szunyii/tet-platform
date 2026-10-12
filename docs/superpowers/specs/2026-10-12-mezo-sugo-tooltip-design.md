# Országprofil: kérdőjeles magyarázat minden kitöltendő mezőnél – tervezési spec

Dátum: 2026-10-12
Állapot: a megoldás jóváhagyva, a szövegek átnézésre várnak

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
| A `Mezo` komponensek régi `sugo` string propja | Marad | Az `OrszagMezok` (felhasználók) és más űrlapok használják; ott a látható sor változatlan. |
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
  (lucide `CircleQuestionMark`), `aria-label="Magyarázat: <cimke>"`, látható fókuszgyűrűvel.
- A `PopoverTrigger` `openOnHover` + kis `delay`/`closeDelay`, hogy a kurzor át tudjon menni a
  felugróra. Esc, kívülre kattintás, kurzor-elhagyás zár.
- A tartalom: `magyarazat` bekezdés; ha van `pelda`, alatta „Példa” felirat és a példa halvány
  hátterű blokkban (`whitespace-pre-line`, hogy a több soros példa – pl. a vállalatlista – soronként
  jelenjen meg). Legfeljebb ~20 rem széles.

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
  /** Mit kell a mezőbe írni; kötelező, hogy minden mezőhöz legyen. */
  magyarazat: string;
  /** Példa-érték; több soros mezőnél `\n`-nel. */
  pelda?: string;
}
```

A `sugo?` mező megszűnik (a fordító jelzi a régi hivatkozásokat). Új `REND_MEZO_CIMKEK:
Record<keyof Rendezveny, MezoCimke>` a rendezvénysorok mezőinek.

## Szövegek

Az alábbi szövegek **vázlatok**: a futó példa Dél-Korea (a `scripts/demo-orszagprofil/orszagok/kr.ts`
tartalmából), a szabályok a `lib/orszagprofil-validacio.ts`-ből. A „Példa” oszlop az űrlapon úgy jelenik
meg, ahogy itt áll.

### Alapadatok és gazdasági háttér

| Mező | Magyarázat | Példa |
| --- | --- | --- |
| Főváros | Az ország fővárosának neve magyarul. | Szöul |
| Terület (km²) | Az ország teljes területe négyzetkilométerben, egész számként. Az ezreseket szóközzel tagolhatod. | 100 460 |
| Pénznem | A hivatalos pénznem magyar neve, utána zárójelben az ISO-kódja. | dél-koreai von (KRW) |
| Lakosság (fő) | Az ország lakossága főben, az Adatév szerinti állapotban; egész szám, az ezreseket szóközzel tagolhatod. | 51 681 000 |
| GDP (milliárd USD) | Az ország nominális (folyó áras) GDP-je milliárd amerikai dollárban az Adatévre; egy tizedesjegyig, tizedesvesszővel. | 1 858,6 |
| Egy főre jutó GDP (USD) | Az egy főre jutó nominális GDP amerikai dollárban az Adatévre; egész szám. | 35 962 |
| GDP-növekedés (%) | A reál-GDP éves növekedése az Adatévre, százalékban, egy tizedesjegyig, tizedesvesszővel; csökkenésnél negatív előjellel. | 0,9 vagy -1,2 |
| Adatév | Az az év, amelyre a fenti számok (lakosság, GDP, növekedés) vonatkoznak. Nem lehet későbbi az aktuális évnél. | 2025 |
| Forrás | Az adatok forrása: a szervezet és a kiadás vagy az időpont. Több forrást vesszővel válassz el. | IMF World Economic Outlook (2025. október), Világbank |
| Nemzetközi szervezeti tagság | Jelöld ki a listából azokat a szervezeteket, amelyeknek az ország tagja. Ami nincs a listán, azt az „Egyéb tagság” mezőbe írd. | |
| Egyéb tagság | A listában nem szereplő szervezeti tagságok, vesszővel elválasztva. | APEC, RCEP, IPEF |
| Legfontosabb gazdasági ágazatok | Azok az ágazatok, amelyek az ország gazdaságában a legnagyobb súlyúak (a K+F-prioritások a KFI-blokkban szerepelnek). Ami nincs a listán, azt az „Egyéb ágazat” mezőbe írd. | |
| Egyéb ágazat | A listában nem szereplő gazdasági ágazatok, vesszővel elválasztva. | Hajógyártás, acélipar, akkumulátorgyártás |

### 1. KFI-rendszer és szakpolitika

| Mező | Magyarázat | Példa |
| --- | --- | --- |
| KFI-teljesítmény | Az ország innovációs és K+F pozíciója nemzetközi mutatók alapján: index, helyezés, az elmúlt évek iránya. Add meg a forrást és az évet. | Global Innovation Index 2025: 4. hely a 139 gazdaság közül (2024: 6.), régiójában az első. A K+F-ráfordítás 2024-ben a GDP 5,13%-a (OECD MSTI). |
| K+F ráfordítás a GDP %-ában | Az összes K+F-ráfordítás (GERD) a GDP százalékában, legfeljebb két tizedesjegyig, tizedesvesszővel. Az érték évét a KFI-teljesítmény szövegében add meg. | 5,13 |
| KFI stratégia | A hatályos nemzeti KFI- vagy tudomány- és technológiastratégia neve és időtávja, egy sorban; ha van, a fő célkitűzéssel. | 6. Tudomány- és Technológiai Alapterv (2026–2030): több mint 200 billió von állami K+F |
| Prioritások | Az ország KFI-politikájának kiemelt témái a listából. Ami nincs a listán, azt az „Egyéb prioritás” mezőbe írd. | |
| Egyéb prioritás | A listában nem szereplő KFI-prioritások, vesszővel elválasztva. | 6G-fejlesztés, bioökonómia |
| Kiemelt iparágak | Azok az iparágak, amelyekre az ország a KFI-politikájában a leginkább épít. A sorrend számít: az első kiemelt iparág színe jelenik meg a térképen, ezért a legfontosabbat jelöld ki elsőnek. Ami nincs a listán, azt az „Egyéb iparág” mezőbe írd. | |
| Egyéb iparág | A listában nem szereplő kiemelt iparágak, vesszővel elválasztva. | Fejlett robotika, atomenergia |
| Erősségek | A KFI-rendszer legfontosabb erősségei, néhány mondatban vagy felsorolásban; lehetőleg számmal vagy helyezéssel alátámasztva. | Erős nagyvállalati K+F: a legnagyobb befektetők a Samsung Electronics, az SK hynix és a Hyundai Motor. A GII 2025 szerint Korea első a vállalati K+F-ráfordításban. |
| Kihívások | A KFI-rendszer fő gyengeségei, szűk keresztmetszetei, kockázatai; lehetőleg számmal alátámasztva. | A K+F néhány nagy konglomerátumon belül összpontosul, a tudományos cikkeknek csak mintegy negyede készül nemzetközi társszerzőséggel. |

### 2. KFI intézmény- és kutatási ökoszisztéma

| Mező | Magyarázat | Példa |
| --- | --- | --- |
| Irányító szervek | A KFI-politikát irányító és finanszírozó szervek: minisztériumok, ügynökségek, tanácsok. Szervenként egy sor: név (rövidítés) – feladata egy mondatban. | Tudományos és IKT Minisztérium (MSIT) – az állami K+F és a KFI-stratégia gazdája.<br>Nemzeti Kutatási Alapítvány (NRF) – a kutatási pályázatok fő finanszírozója. |
| Meghatározó egyetemek | A KFI szempontjából legfontosabb egyetemek a székhely városával; ha releváns, a fő szakterülettel. | KAIST (Tedzson), Szöuli Nemzeti Egyetem (Szöul), POSTECH (Pohang) |
| Kutatóközpontok, intézetek | A meghatározó állami és nem egyetemi kutatóintézetek, kutatóhálózatok, szakterületükkel. | Koreai Tudományos és Technológiai Intézet (KIST), ETRI (elektronika és távközlés), KRISS (metrológia) |
| Kutatási infrastruktúrák | A nagy kutatási infrastruktúrák: kutatóreaktor, gyorsító, szuperszámítógép, tudományos park – név és hely. | PAL-XFEL röntgenlézer (Pohang); KSTAR szupravezető tokamak (Tedzson); a KISTI Nurion szuperszámítógépe |

### 3. Innovációs és vállalati ökoszisztéma

| Mező | Magyarázat | Példa |
| --- | --- | --- |
| Kiemelt ágazatok | Azok az ágazatok, amelyekben az ország innovatív vállalatai a legerősebbek, a listából. Ami nincs a listán, azt az „Egyéb ágazat” mezőbe írd. | |
| Egyéb ágazat | A listában nem szereplő ágazatok, vesszővel elválasztva. | Hajógyártás, kijelzőgyártás |
| Top 10 vállalat | Az ország KFI szempontjából meghatározó legnagyobb vállalatai. Soronként egy név, legfeljebb 10 sor (sortöréssel válaszd el őket). | Samsung Electronics<br>SK hynix<br>Hyundai Motor |
| Startupok, KKV-k | A startup- és KKV-ökoszisztéma jellemzői: ismert startupok, unikornisok, támogató programok, számok. | A legnagyobb értékű unikornisok a Toss, a Yello Mobile és a Kurly. A TIPS program 2026-ban 800 startupot támogat. |
| Klaszterek, inkubátorok | A meghatározó innovációs klaszterek, tudományos és technológiai parkok, inkubátorok, gyorsítók – név, hely, szakterület. | Pangyo Techno Valley (IKT, játékipar, fintech); Songdo (biotechnológia); 19 Kreatív Gazdasági Innovációs Központ (CCEI) régiós inkubátorként. |
| Technológiatranszfer | Hogyan jut el a kutatási eredmény a vállalatokhoz: transzferirodák, hasznosítási programok, spin-off-támogatás, vállalati kockázati tőke. | Egyetemi és intézeti technológiatranszfer-irodák (KAIST, ETRI, KIST); a KIAT technológiatranszfer-programjai. |

### 4. KFI programok és finanszírozási lehetőségek

| Mező | Magyarázat | Példa |
| --- | --- | --- |
| Pályázatok | Az országban elérhető fő KFI-pályázati programok: kiíró, a program neve és témája, ha ismert, a jellemző beadási időszak. | NRF alapkutatási pályázatok (egyéni, fiatal kutatói, csoportos sémák); IITP IKT K+F felhívások; KEIT ipari technológiai programok. |
| Támogatási programok | Állami támogatási és ösztönző programok (startup-, inkubációs, mobilitási, tehetséggondozási): név, kezelő szerv, célcsoport. | TIPS startup-program (MSS); Brain Pool – külföldi kutatók meghívása koreai egyetemekre. |
| Finanszírozási eszközök | A pályázaton kívüli finanszírozási eszközök: kockázati tőke, alapok alapja, hitelgarancia, kedvezményes hitel, adókedvezmény. | KVIC alapok alapja; KOTEC technológiaalapú hitelgaranciák; K+F adójóváírás. |
| Nemzetközi részvételi lehetőségek | Milyen nemzetközi programokban vehet részt az ország, és így magyar partnerrel együtt: EU-s keretprogram, EUREKA, kétoldalú vagy regionális felhívások. | A Horizont Európa II. pillérének társult országa és az EUREKA teljes jogú tagja; kétoldalú NKFIH–NRF felhívások. |

### 5. Jelentősebb KFI rendezvények

| Mező | Magyarázat | Példa |
| --- | --- | --- |
| Rendezvények (lista) | Az országban rendszeresen megrendezett jelentősebb KFI-rendezvények. Legfeljebb 10 sor, a rendezvény neve kötelező; a teljesen üres sor kimarad. | |
| Név | A rendezvény hivatalos neve. | BIO KOREA |
| Típus | Szakkiállítás, konferencia vagy egyéb fórum (pl. startup-fesztivál, hivatalos tudománydiplomáciai fórum). | |
| Időpont | Mikor és hol tartják, szabadszövegben; visszatérő rendezvénynél a szokásos hónap. | április–május, Szöul (COEX) |
| Megjegyzés | Rövid leírás: témája, szervezője, a legközelebbi alkalom pontos dátuma. | Biotechnológia és gyógyszeripar, partnering; 2026: április 28–30. |

### 6. Nemzetközi és magyar–fogadó országbeli KFI/TéT kapcsolatok

| Mező | Magyarázat | Példa |
| --- | --- | --- |
| EU és multilaterális kapcsolatok | Az ország kapcsolata az EU-val és többoldalú szervezetekkel, programokkal a KFI területén: társulás, partnerségek, tagság, vegyesbizottság. | Horizont Európa-társult ország (II. pillér) 2025-től; EU–Korea Digitális Partnerség (2022) és Zöld Partnerség (2023); az EUREKA teljes jogú tagja. |
| Partnerországok | Azok az országok, amelyekkel a fogadó ország KFI-együttműködése a legintenzívebb, az együttműködés jellegével. | USA (Technology Prosperity Deal, 2025), visegrádi országok (együttműködési szándéknyilatkozat, 2021). |
| Érvényes TéT-egyezmény | A Magyarországgal kötött hatályos tudományos-technológiai egyezmény megnevezése és aláírásának éve, egy sorban. Ha nincs, hagyd üresen. | Magyar–koreai kormányközi egyezmény a tudományos és műszaki együttműködésről (1989) |
| Kétoldalú együttműködések | A magyar–fogadó országbeli KFI-együttműködések: vegyesbizottsági ülések, közös felhívások, egyetértési megállapodások, közös projektek – évszámmal. | TéT-vegyesbizottság 10. ülése (2021); NKFIH–NRF közös felhívás (2022: 5 magyar nyertes); V4–Korea közös felhívás (2023). |
| Mobilitás | Ösztöndíjak, kutatócsere, hallgatói és kutatói mozgás a két ország között: program, létszám, év. | Stipendium Hungaricum: évi 100 hely, 2025/26-ban 63 ösztöndíjas; Global Korea Scholarship: 4 nagykövetségi hely. |

### 7. Magyar szempontú értékelés és lehetőségek

| Mező | Magyarázat | Példa |
| --- | --- | --- |
| Összegzés | Az ország KFI-profiljának és a magyar együttműködési lehetőségeknek a rövid összefoglalója, 2–4 mondatban, legfeljebb 500 karakter. Ez kerül a térkép-panel kivonatába. | Dél-Korea a világ egyik legintenzívebb K+F-befektetője (2024: a GDP 5,13%-a), a GII 2025 4. helyezettje. A magyar–koreai TéT-kapcsolat az 1989-es egyezményre és a közös NKFIH–NRF felhívásokra épül; a legnagyobb potenciál az akkumulátor- és gyógyszerkutatásban van. |
| Együttműködési lehetőségek | Konkrét területek, ahol magyar kutatóhelyeknek és vállalatoknak együttműködési lehetőségük van, rövid indoklással. | Akkumulátor-technológia és -újrahasznosítás a magyarországi koreai gyártóbázisra építve; gyógyszer- és orvosbiológiai kutatás (a 2025-ös NKFIH–NRF projektek témái). |
| Jó gyakorlatok, hazai adaptáció | Az országban bevált KFI-megoldások, amelyeket Magyarországon is érdemes lehet alkalmazni, a hazai adaptálás lehetőségével. | A TIPS modellje: a magánbefektetői szűrés megelőzi a közpénzt; a kiemelt technológiák elkülönített, ötéves K+F-kerete. |
| Diplomáciai prioritások | A magyar–fogadó országbeli KFI-kapcsolatok erősítéséhez javasolt következő lépések: tárgyalandó témák, kezdeményezések, intézményi teendők. | A TéT-vegyesbizottság kétévenkénti ülésezésének biztosítása; az NKFIH–NRF közös felhívások folytatása; közös Horizont Európa-konzorciumok szervezése. |

## Ellenőrzés

Nincs tesztkeretrendszer, ezért:

- `npx tsc --noEmit` és `npm run build`: a `MEZO_CIMKEK` kimerítő típusa miatt hiányzó vagy régi
  (`sugo`) hivatkozás fordítási hiba.
- Egy eldobható tsx script ellenőrzi, hogy minden `magyarazat` nem üres, és hogy a példák nem
  hosszabbak a mező korlátjánál (`ROVID_MAX`, `SZOVEG_MAX`, `OSSZEGZES_MAX`; a vállalatlista 10 sor).
- Headless böngészővel (gstack): a gomb hoverre és billentyűzettel (Tab → Enter) nyit, Esc zár; a
  kattintás nem küldi be az űrlapot és nem ugrik a mezőre; a rendezvénysorokban és a
  `CimkeValaszto`-nál is működik; keskeny ablakban a felugró nem lóg ki.

## Feladatok

1. **Popover és komponensek:** `npx shadcn@latest add popover`; `SugoGomb`, `CimkeSor`; `Mezo`,
   `SzovegMezo`, `RovidMezo`, `SzamMezo`, `CimkeValaszto` új propjai.
2. **Szövegek:** `MezoCimke` és `MEZO_CIMKEK` átalakítása, `REND_MEZO_CIMKEK`, az összes szöveg
   felvétele a fenti táblák szerint.
3. **Bekötés és dokumentáció:** a 8 `*Mezok.tsx` és a `RendezvenySorok` átállítása, a látható
   `sugo` sorok és az Időpont placeholder eltávolítása az országprofilból, `CLAUDE.md` frissítése
   (`MEZO_CIMKEK` leírása, új komponensek).
