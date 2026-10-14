# Kommunikáció: ticket több címzettnek – „Mindenki” és régiók – tervezési spec

Dátum: 2026-10-14
Állapot: megvalósítva és átnézve (taskonként spec- és minőségi review); a böngészős próba és a demó DB commitja a dev szerverre vár. Az eltéréseket lásd a „Megvalósítási eltérések” szakaszban.
Ág: `kommunikacio-korlevel` (a `jelentes-fo-uzenet` ág tetején)

## Cél

A központ (admin) az új ticketet egyszerre több attasénak is címezhesse: mindenkinek, egy vagy több
régiónak, vagy tetszőleges összeállításnak. A válaszokat attasénként külön kell tudni követni.

## Kiinduló állapot

- A ticket (`db/schema/ticket.ts`) pontosan egy címzetthez tartozik (`cimzett_id`, `orszag` = a címzett
  székhely-országának pillanatképe). Csak admin nyit, zár le és nyit újra; az attasé csak a hozzá
  címzettet látja.
- Az új-ticket dialógus (`app/(app)/kommunikacio/components/UjTicketDialog.tsx`) egyetlen címzettet
  választ legördülőből; a jelöltek a `listCimzettJeloltek()` eredménye (nem tiltott, székhellyel
  rendelkező attasék; `CimzettJelolt`: `id`, `nev`, `orszag` = székhely-kód).
- Az országszótárban (`lib/orszagok.ts`, 174 ország) nincs régió. A térkép régiógombjai
  (`lib/terkep-mutatok.ts` `REGIOK`) csak nagyítási befoglaló téglalapok, országbesorolásra nem
  alkalmasak (átfednek).
- A demó DB-ben 15 attasé van, ticket nincs.

## Döntések

| Kérdés | Döntés |
| --- | --- |
| Válaszok | Külön szál attasénként: egy küldés címzettenként egy önálló ticketet hoz létre, azonos tárggyal, típussal, prioritással, határidővel és első üzenettel. A válaszát csak a központ látja; státusz, lezárás, újranyitás ticketenként. |
| Összetartozás | Közös körlevél-azonosító (`ticket.korlevel_id`), csak több címzettnél; egy címzettnél `null`, mint eddig. |
| Címzettválasztás | Bejelölős lista; fölötte „Mindenki”, régiónkénti gombok és „Kijelölés törlése”; utána egyenként módosítható. Egy címzett is választható. |
| Régiótagság | Egy attasé minden olyan régióba tartozik, ahol a székhelye **vagy** bármelyik regionálisan lefedett országa van. |
| Régiók | Öt: Európa, Ázsia és Óceánia, Közel-Kelet, Afrika, Amerika. Minden szótárbeli ország pontosan egy régióban. |
| Határesetek | Oroszország, a Kaukázus (Grúzia, Örményország, Azerbajdzsán) és Törökország → Európa; Egyiptom és a Maghreb → Afrika; Közép-Ázsia, Afganisztán, Pakisztán → Ázsia és Óceánia. |

## Hatókörön kívül

- Közös (csoportos) beszélgetés, ahol a címzettek látják egymás válaszait; egyirányú közlemény.
- A körlevél egyben lezárása vagy újranyitása; a körlevél összevont sora a listában.
- A régiók használata máshol (térkép, jelentések, felhasználók).
- Attasé által indított ticket (továbbra is csak admin nyit).

## 1. Régiók az országszótárban (`lib/orszagok.ts`)

- Új konstans: `ORSZAG_REGIOK` (`as const` tömb `{ kulcs, cimke }` elemekkel) ebben a sorrendben:
  Európa, Ázsia és Óceánia, Közel-Kelet, Afrika, Amerika (ez a gombok sorrendje); belőle származik a
  `RegioKulcs = 'europa' | 'azsia' | 'kozelKelet' | 'afrika' | 'amerika'` típus, így a kettő nem
  csúszhat szét.
- Az `Orszag` interfész kötelező `regio: RegioKulcs` mezőt kap; mind a 174 sor kitöltve (a besorolás
  a függelékben). A kötelező mező miatt új ország régió nélkül nem kerülhet a szótárba.
- Új segéd: `orszagRegio(kod): RegioKulcs | undefined` (ismeretlen kódra `undefined`).
- A térkép `REGIOK`-ja változatlan; a két lista független (más a célja), ezt a kód kommentje rögzíti.

## 2. Címzett-jelöltek és régiótagság

- `CimzettJelolt` (`lib/ticket-szotar.ts`) bővül: `varos: string | null` (a székhely városa) és
  `orszagok: string[]` (az attasé összes országkódja, a székhely elöl). Az `orszag` marad a székhely
  kódja (a ticket pillanatképe).
- `listCimzettJeloltek()` (`db/queries/ticket.ts`) ezeket is visszaadja: a székhely-sorhoz joinolt
  lekérdezés mellett a regionális (`szekhely = false`) `attase_orszag` sorok egy második
  lekérdezéssel, JS-ben csoportosítva. A szűrés (nem admin, nem tiltott, van székhely) és a magyar névsorrend változatlan.
- Új tiszta modul `lib/ticket-cimzettek.ts`:
  - `jeloltRegioi(j: CimzettJelolt): RegioKulcs[]` – az attasé országainak régiói, ismétlés nélkül,
    az `ORSZAG_REGIOK` sorrendjében (ismeretlen kód kimarad);
  - `regioJeloltjei(jeloltek, regio): string[]` – a régió attaséinak id-jai a lista sorrendjében;
  - `regioCsoportok(jeloltek): { kulcs, cimke, idk: string[] }[]` – csak a nem üres régiók, az
    `ORSZAG_REGIOK` sorrendjében (ebből lesznek a gombok).

A demó adatokkal: Európa 7 (Ausztria, Németország 3, Franciaország, Egyesült Királyság, Oroszország), Ázsia és Óceánia 4, Amerika 3, Közel-Kelet 1, Afrika 1 attasé (a párizsi
attasé Európában és Afrikában is).

## 3. Adatmodell

- `ticket.korlevel_id` (`text`, nullable) + index `ticket_korlevel_idx`. Migráció `0011_…` a
  drizzle-kit generálásával: csak `ALTER TABLE ticket ADD` és `CREATE INDEX` lehet benne (ha a
  generátor táblát építene újra, kézzel kell átírni – a `ticket` szülőtábla, lásd CLAUDE.md).
- `korlevel_id`: egy küldés közös, véletlen UUID-ja, ha a címzettek száma legalább 2; különben `null`.
  Nincs FK és nincs külön tábla: a körlevél a ticketek összessége.
- `TicketListItem` és így `TicketDetail` is megkapja a `korlevelId: string | null` mezőt.

## 4. Validálás (`lib/ticket-validacio.ts`)

- `UjTicketInput`: a `cimzettId`/`orszag` helyett `cimzettek: { id: string; orszag: string }[]`
  (a jelöltlista sorrendjében, ismétlés nélkül).
- `parseUjTicketForm(fd, jeloltek)`: a címzettek `fd.getAll('cimzettId')`-ből (csak string, üres
  kihagyva, ismétlés kiszűrve).
  - Nincs jelölt → `form`: „Nincs címezhető attasé.” (mint eddig).
  - Nincs kiválasztott → `cimzettId`: „Válassz legalább egy címzettet.”
  - Van a jelöltek között nem szereplő id → `cimzettId`: „A kijelöltek közül N címzett már nem
    választható (nem attasé, tiltott, vagy nincs székhelye). A lista frissült, ellenőrizd a
    kijelölést.” – az action ilyenkor a layoutot is revalidálja, hogy a lista frissüljön.
  - A többi mező szabálya változatlan.
- A hibakulcs `cimzettId` marad; a fókuszhoz az első jelölőnégyzet id-ja `cimzettId`.

## 5. Létrehozás (`db/queries/ticket.ts`, `actions.ts`)

- `createTicket` helyett `createTicketek(input): string[]`: egy tranzakcióban címzettenként egy
  ticket (`statusz: 'nyitott'`, a címzett `orszag`-a, közös `korlevelId`) + a nyitó üzenet + a nyitó
  olvasás-jelölése, azonos időbélyeggel (a ticketek `created_at`/`updated_at`-je is ugyanaz). Bármely
  hiba → semmi nem jön létre. Visszaadja az id-ket a címzettek sorrendjében.
- `listTicketek`: a körlevél ticketjeinek azonos `updated_at`-je miatti holtversenyt JS-ben, a címzett
  neve szerinti magyar névsorral oldja fel (az SQL bájtsorrendje az ékezetes nagybetűket és a „dr.”-t
  a végére tenné), így az átirányítás célja a csoport elején áll.
- `createTicketAction`: validálás → (elavult címzettnél `frissit()` és hiba) → `createTicketek` →
  `frissit()` → átirányítás az első létrehozott ticketre (`/kommunikacio?t=<id>`).

## 6. Felület

**Címzettválasztó** – új komponens `app/(app)/kommunikacio/components/CimzettValaszto.tsx`, a dialógus
legördülője helyett, „Címzettek” felirattal (`fieldset` + `legend`).

- Gyorsgombok (`type="button"`): „Mindenki (15)”, régiónként „Európa (7)” stb. (csak a nem üres
  régiók), és „Kijelölés törlése”. A csoport-gombok **csak hozzáadnak** (unió), így két régió
  egymás után összeadható; ha a csoport minden tagja ki van jelölve, a gomb pipát kap
  (`secondary` változat, felolvasónak „, mind kijelölve”), és a kattintás nem változtat semmit.
  Kivenni jelölőnként vagy a „Kijelölés törlése” gombbal lehet; ez üres kijelölésnél letiltott, de
  fókuszálható marad (`focusableWhenDisabled`).
- Alatta a jelöltek listája natív jelölőnégyzetekkel (`name="cimzettId"`, `value` = user id),
  soronként „Név · Város” (város nélkül a székhely országa), görgethető (kb. 16rem magas). A
  jelölőnégyzetek vezéreltek, és a `VezetoJelolo` mintájára render után a `defaultChecked`-et a
  vezérelt értékhez igazítják (React 19 `form.reset()`).
- Számláló a lista fölött: „N kijelölve”. A kijelölés állapota a dialógusé (`string[]`); a
  megjelenített és beküldött jelölőnégyzetek mindig az aktuális jelöltlistából épülnek, így a
  revalidálás után eltűnt jelölt nem küldődik be.

**Új ticket dialógus**

- Leírás: „Kérés vagy feladat egy vagy több TéT attasénak. Több címzettnél mindenki külön ticketet
  kap, a válaszokat csak a központ látja. Az első üzenet a ticket nyitó szövege.”
- A gomb: 0 vagy 1 kijelöltnél „Létrehozás”, többnél „Létrehozás (N címzett)”; folyamatban
  „Létrehozás…”.
- A többi mező (típus, prioritás, határidő, tárgy, első üzenet) változatlan.

**Lista (`TicketLista`)** – adminnál a meta-sor elejére „Körlevél · ” kerül, ha a ticketnek van
`korlevelId`-ja. Attasénál nincs változás.

**Adatlap (`TicketAdatlap`)**

- Admin, körlevél-ticketnél: új „Körlevél · N címzett” rész a dl alatt, soronként a név és alatta
  az ország (a keskeny oldalsávban két sorban, `title`-lel a teljes szöveg) + státusz-jelvény,
  mindegyik link a saját ticketére (a lista aktuális szűrőjével), az aktuális sor
  `aria-current="true"`-val és a lista kiemelésével. Adatforrás: új
  `listKorlevelTagok(korlevelId, nezo)` lekérdezés (`id`, `cimzettNev`, `orszag`, `statusz`, magyar
  névsorban; nem adminnak üres lista); a page csak adminnál és csak körlevél-ticketnél hívja.
- Attasé, körlevél-ticketnél: egy „Körlevél” sor: „A központ több attasénak is elküldte; a válaszodat
  csak a központ látja.” Más címzett neve nem látszik.
- A lista szűrős URL-építője (`listaUrl`) a `lib/ticket-szotar.ts`-be kerül (a `parseSzuro` mellé,
  annak párja), hogy a lista és az adatlap is használja.

## 7. Hibakezelés

- Validációs hibák mezőszinten (`cimzettId` és a többi), fókusz az első hibás mezőre.
- Elavult jelöltlista: hiba + layout-revalidálás (a dialógus nyitva marad, a lista frissül).
- Tranzakciós hiba: „Mentés sikertelen, próbáld újra.”, semmi nem jön létre.
- A címzett törlése (FK cascade) csak a saját ticketjét viszi el; a körlevél többi része marad, a
  „N címzett” a megmaradtakat számolja.

## 8. Ellenőrzés

- `npx tsc --noEmit`, `npm run build`.
- Eldobható tsx scriptek (scratchpad, DB-másolaton):
  - minden szótárbeli országnak van régiója, a régiónkénti darabszámok;
  - a demó attasék régiói (a fenti 7/4/3/1/1, a párizsi attasé két régióban);
  - `parseUjTicketForm`: 0, 1, több, ismétlődő és ismeretlen címzett;
  - `createTicketek`: N ticket közös `korlevelId`-val, N nyitó üzenet és olvasás-jelölés; egy
    címzettnél `korlevelId = null`; `listKorlevelTagok`; az attasé `listTicketek`-je csak a sajátját
    adja.
- Böngészős próba (a futó TéT dev szerveren): „Mindenki” és régió-gombok, egyenkénti módosítás,
  létrehozás 15 címzettnek, a lista és az adatlap körlevél-része, attaséként a saját ticket és a
  megjegyzés, hibás beküldés utáni állapot. A próba ticketjeit utána törölni kell a demó DB-ből.
- CLAUDE.md Kommunikáció szakasza frissül.

## Megvalósítási eltérések

A taskonkénti review-k nyomán a terv első változatához képest:

- **A gyorsgombok csak hozzáadnak, nem kapcsolók.** Az első változat `aria-pressed` kapcsoló volt
  (benyomva kivette a csoportot). A demó adatokban Afrika egyetlen attaséja a párizsi, aki Európában
  is benne van: „Európa” után az Afrika-gomb már benyomottnak látszott, és rákattintva kivette a
  párizsi attasét. A felhasználó által jóváhagyott megfogalmazás („bejelölik a csoportot, utána
  egyenként módosítható”) a hozzáadó viselkedést írja le.
- **Sorrend.** A körlevél ticketjei azonos időbélyeget kapnak, a `listTicketek` holtverseny-feloldása
  JS-ben, magyar névsor szerint történik (az SQL `asc(name)` bájtsorrend szerint rendez).
- **`listKorlevelTagok(korlevelId, nezo)`**: a lekérdezés maga is admin-only (nem adminnak üres
  lista), a `getTicket` láthatósági elvéhez igazodva.
- **`listaUrl`** a `lib/ticket-szotar.ts`-be került (tiszta segéd a `lib/`-ben, a `parseSzuro` párja),
  nem a route alá.
- **Felület.** A dialógus széles (`szeles`), hogy a pipás gombok ne törjenek több sorba; hibánál
  a jelöltlista piros keretet kap; a körlevél-sorok két sorban (név, ország) `title`-lel, mert a
  17–18rem-es oldalsávban az ország különben sosem látszott.
- **`RegioKulcs`** az `ORSZAG_REGIOK`-ból származik (nem külön unió).
- **A címzett-id-k** a közös `tisztitSzoveg`-gel tisztulnak (mint a többi validátor-mező).

## Függelék: az országok régiói

**Európa (45):** AL Albánia, AM Örményország, AT Ausztria, AZ Azerbajdzsán, BA Bosznia-Hercegovina,
BE Belgium, BG Bulgária, BY Belarusz, CH Svájc, CY Ciprus, CZ Csehország, DE Németország, DK Dánia,
EE Észtország, ES Spanyolország, FI Finnország, FR Franciaország, GB Egyesült Királyság, GE Grúzia,
GR Görögország, HR Horvátország, HU Magyarország, IE Írország, IS Izland, IT Olaszország, LT Litvánia,
LU Luxemburg, LV Lettország, MD Moldova, ME Montenegró, MK Észak-Macedónia, MT Málta, NL Hollandia,
NO Norvégia, PL Lengyelország, PT Portugália, RO Románia, RS Szerbia, RU Oroszország, SE Svédország,
SI Szlovénia, SK Szlovákia, TR Törökország, UA Ukrajna, XK Koszovó.

**Ázsia és Óceánia (36):** AF Afganisztán, AU Ausztrália, BD Banglades, BN Brunei, BT Bhután,
CN Kína, FJ Fidzsi, ID Indonézia, IN India, JP Japán, KG Kirgizisztán, KH Kambodzsa, KP Koreai NDK,
KR Koreai Köztársaság, KZ Kazahsztán, LA Laosz, LK Srí Lanka, MM Mianmar, MN Mongólia,
MV Maldív-szigetek, MY Malajzia, NP Nepál, NZ Új-Zéland, PG Pápua Új-Guinea, PH Fülöp-szigetek,
PK Pakisztán, SB Salamon-szigetek, SG Szingapúr, TH Thaiföld, TJ Tádzsikisztán, TL Kelet-Timor,
TM Türkmenisztán, TW Tajvan, UZ Üzbegisztán, VN Vietnám, VU Vanuatu.

**Közel-Kelet (14):** AE Egyesült Arab Emírségek, BH Bahrein, IL Izrael, IQ Irak, IR Irán,
JO Jordánia, KW Kuvait, LB Libanon, OM Omán, PS Palesztina, QA Katar, SA Szaúd-Arábia, SY Szíria,
YE Jemen.

**Afrika (49):** AO Angola, BF Burkina Faso, BI Burundi, BJ Benin, BW Botswana, CD Kongói Demokratikus
Köztársaság, CF Közép-afrikai Köztársaság, CG Kongói Köztársaság, CI Elefántcsontpart, CM Kamerun,
DJ Dzsibuti, DZ Algéria, EG Egyiptom, ER Eritrea, ET Etiópia, GA Gabon, GH Ghána, GM Gambia,
GN Guinea, GQ Egyenlítői-Guinea, GW Bissau-Guinea, KE Kenya, LR Libéria, LS Lesotho, LY Líbia,
MA Marokkó, MG Madagaszkár, ML Mali, MR Mauritánia, MW Malawi, MZ Mozambik, NA Namíbia, NE Niger,
NG Nigéria, RW Ruanda, SD Szudán, SL Sierra Leone, SN Szenegál, SO Szomália, SS Dél-Szudán,
SZ Eswatini, TD Csád, TG Togo, TN Tunézia, TZ Tanzánia, UG Uganda, ZA Dél-afrikai Köztársaság,
ZM Zambia, ZW Zimbabwe.

**Amerika (30):** AR Argentína, BO Bolívia, BR Brazília, BS Bahama-szigetek, BZ Belize, CA Kanada,
CL Chile, CO Kolumbia, CR Costa Rica, CU Kuba, DO Dominikai Köztársaság, EC Ecuador, GT Guatemala,
GY Guyana, HN Honduras, HT Haiti, JM Jamaica, MX Mexikó, NI Nicaragua, PA Panama, PE Peru,
PR Puerto Rico, PY Paraguay, SR Suriname, SV Salvador, TT Trinidad és Tobago, US Amerikai Egyesült
Államok, UY Uruguay, VE Venezuela, VI Amerikai Virgin-szigetek.
