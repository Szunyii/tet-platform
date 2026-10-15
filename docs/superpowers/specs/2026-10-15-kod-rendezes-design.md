# Kódrendezés: szerkezet, teljesítmény, duplikáció, halott kód – tervezési spec

Dátum: 2026-10-15
Állapot: jóváhagyott terv, megvalósítás előtt
Ág: `kod-rendezes` (a `main` `3b665f6`-ból)

## Cél

A felhasználó jelzése: „a kód kicsit messy, a komponensek sincsenek megfelelően rendezve, és
egy-két helyen nem optimalizált”. Négy párhuzamos, csak olvasó audit (shell és demó-oldalak;
térkép; jelentések, kommunikáció, felhasználók és országprofil-űrlapok; adatréteg) konkrét,
fájl:sor szintű találatokat adott; ez a spec a felhasználó által választott **„majdnem teljes”**
terjedelmet rögzíti.

Viselkedés-megőrző refaktor: a felület és az adatok változatlanok, a „Szándékos
viselkedésváltozások” szakasz négy pontja kivételével.

## Döntések

- **Terjedelem** (a felhasználó választása): teljesítmény + szerkezet + duplikáció + halott kód,
  **kivéve** két közepes kockázatú összevonást: a három kézi megerősítő dialógus egy
  `MegerositoDialog`-ba (`RiportTorles`, `TicketStatuszGombok`, `FelhasznaloMuveletek`) és a
  `KulcsszoValaszto` + `CimkeValaszto` egyesítése. Ezek fókusz- és akadálymentességi szempontból
  hangolt kódot érintenek, eltérő zárási és fókusz-visszaadási viselkedéssel.
- **Shell-stílus** (a felhasználó választása): az `AppShell` inline style-jai Tailwind osztályokra
  kerülnek, a sötét oldalsáv színei a `globals.css` eddig használatlan `--sidebar*` tokenjeibe, a
  mai értékekkel. Cél a pixelre azonos megjelenés, előtte/utána képernyőképpel igazolva. A globális
  `.btn` és `.input` osztály marad (a tudástár és a monitoring is használja), az `AppShell`
  ezeket változatlanul használja tovább (Kijelentkezés gomb, Ciklus select).
- **Elhelyezés:** a CLAUDE.md táblázata a mérvadó – az egy route által használt komponens a
  route `components/` mappájába kerül, a több route által használt a `components/<terület>/`
  alá. A szabályt nem lazítjuk, a fájlokat költöztetjük; `git mv`, hogy a history megmaradjon.
- **Sorrend:** területenként szeletelt taskok egy ágon. Az áthelyezés megy elsőként (tisztán
  mechanikus), így a későbbi taskok már a végleges útvonalakon dolgoznak, és a review-diffjük
  tiszta.
- **Az admin oldalsáv-kártya** továbbra is a `listTerkepAdat(ev)`-ből számol: a darabszámnak a
  térkép országhalmazával kell egyeznie (aktív attasé vagy profil), egy külön számláló lekérdezés
  ezt a szabályt duplikálná. A lekérdezés karcsúsítása után a hívás olcsó, és a `/terkep`-en a
  `cache()` miatt egyszer fut.
- **Nincs visszafelé-kompatibilis re-export:** az áthelyezett modulok minden importálóját
  átírjuk (pl. a `useApp` négy importálóját), régi útvonalon nem marad shim.

## Taskok

### 1. Áthelyezések (csak mozgatás és import-frissítés)

- `components/riport/` → `app/(app)/jelentesek/components/`: `RiportTabla`, `RiportSzurok`,
  `RiportReszlet`, `RiportTorles`, `IntezkedesSzerkeszto`, `IntezkedesDialog`, `KategoriaBadge`
  (mind csak a `/jelentesek/**` alatt él). A `RiportForm` és a négy gyereke (`KategoriaValaszto`,
  `KulcsszoValaszto`, `EsemenyMezok`, `CsatolmanyMezo`) marad: az `uj-jelentes` és a
  `jelentesek/[id]/szerkesztes` is használja.
- `components/orszagprofil/BlokkNezet.tsx`, `AttaseLista.tsx` → `app/(app)/orszagprofil/components/`
  (csak a `[kod]/page.tsx` használja).
- `components/orszagprofil/KuldGomb.tsx` → `components/form/KuldGomb.tsx` (általános
  `useFormStatus`-os küldőgomb).
- A `components/orszagprofil/` alatt marad: `SzerkesztesGomb`, `AllapotBadge`, `AgazatBadge`
  (a `/terkep` és a profil-oldal közös).
- A CLAUDE.md útvonalai frissülnek.

### 2. Adatréteg és tiszta segédek

- **`listTerkepAdat`** (`db/queries/orszagprofil.ts`):
  - `where(lte(orszagprofil.ev, ev))`, a JS-oldali `p.ev > ev` szűrés megszűnik; a legnagyobb év
    országonkénti kiválasztása (JS, dokumentált ok) marad.
  - Csak a szükséges oszlopok: `orszagKod`, `ev`, `alapadatok`, `kfiRendszer`, `rendezvenyek`,
    `magyarErtekeles`, és a `mentettDb` SQL-ben (`<oszlop> is not null` összege, a `BLOKK_KULCSOK`-ból
    generálva, így a lista kimerítő marad).
  - Csak ez a 4 blokk normalizálódik (`normalizalBlokk`), nem mind a 9.
  - A `profilok` tömb, a `lattuk` halmaz és a `profilKodhoz` map egyetlen `Map`.
  - `TerkepOrszag.alapadatok` típusa `TerkepAlapadatok` = `Pick<Alapadatok, 'fovaros' | 'terulet' |
    'penznem' | 'lakossag' | 'gdp' | 'gdpEgyFore' | 'gdpNovekedes' | 'adatEv' | 'forras' | 'tagsagok'>`,
    és csak ezek a mezők kerülnek az objektumba (a kliens nem olvassa az `agazatok`, `agazatEgyeb`,
    `tagsagEgyeb` mezőt; a demó DB-n ez kb. 7,5 KB a térkép RSC-payloadjából).
- **Csatolmány-letöltés** (`app/api/jelentes/csatolmany/[id]/route.ts`): a `getCsatolmanyMeta`
  inner joinnal a `riport.szerzoId`-t is visszaadja, a route a `getRiport` helyett ebből ellenőriz
  (`canViewRiport` csak `{ szerzoId }`-t kér). A sorrend marad: meta → jog → blob. 4 lekérdezés
  helyett 2.
- **Törlés** (`app/(app)/jelentesek/actions.ts`): a jogellenőrzés új `getRiportSzerzo(id)`-vel (csak
  a `szerzoId`), nem a teljes `getRiport`-tal.
- **Közös szabályok egy helyen:**
  - `lib/felhasznalo-tiltas.ts`: `aktivAttaseE(u, most)` (nem admin és nem tiltott) – a
    `db/queries/attase-orszag.ts` és a `db/queries/ticket.ts` ezt hívja. `szerepkorbol(role)`
    (`'admin' | 'attase'`) a `lib/felhasznalo-validacio.ts`-ben, a `Szerepkor` típus mellett (az
    `AppRole` ennek aliasa) – a `lib/session.ts`, a `db/queries/felhasznalo.ts` és a szerepkör-select
    ezt hívja.
  - Magyar névsor: `lib/rendezes.ts` `huOsszevet(a, b)` – egy modulszintű `Intl.Collator('hu')`
    `compare`-je (ugyanazt a sorrendet adja, mint a `localeCompare(…, 'hu')`); a `db/queries` 10
    `localeCompare(…, 'hu')` hívása ezt használja. A
    `listTicketek`, `listCimzettJeloltek`, `listKorlevelTagok` azonos rendezése így szerkezetileg
    biztosított. (A tervezéskor: a `lib/attase-orszag.ts` három és a `lib/terkep-mutatok.ts` egy
    hívása is ezt használja – összesen 12.)
  - Korlátok: `JELSZO_MIN`, `JELSZO_MAX`, `NEV_MAX` a `lib/felhasznalo-validacio.ts`-ben (a meglévő
    `EMAIL_MAX`, `TELEFON_MAX` mellett); a `scripts/demo-attasek.ts`, `scripts/seed.ts`, a
    `felhasznalok/actions.ts` üzenete és a dialógusok `minLength`/`maxLength`-je ezt használja.
  - Fájlvalidálás: a `lib/riport-validacio.ts` `parseFajlok` és `csatolmanyElocheck` közös
    `fajlHiba(file)` segédet hív; az „Engedett: …” utótag különbsége szándékosan megmarad
    (az előellenőrzés kliens-oldali üzenete).
  - Parse-eredmények: a `lib/felhasznalo-validacio.ts` generikus `ParseResult<T>`-je
    (`{ ok: true; data: T } | { ok: false; errors: MezoHibak }`) a `lib/urlap.ts`-be kerül, és az
    extra mező nélküli validátorok ezt használják: felhasználó, `ParseUzenetResult` (ma `szoveg`),
    `ParseIntezkedesResult` (ma `szoveg`), `ValidalasEredmeny` (ma `ertek`) – a sikeres ág mezője
    egységesen `data`, a hívóhelyek ehhez igazodnak. A `ParseRiportResult` (sikernél `fajlok`,
    `torlendoCsatolmanyIdk` is) és a `ParseUjTicketResult` (hibánál `elavultCimzett` is) saját
    típus marad, mert extra mezőt hordoz; a `ParseRiportResult` hibaága a `RiportErrors` helyett
    `MezoHibak`.
- **Rétegzés:** a `lib/riport-szuro.ts` (`RiportFilter`) és a `lib/riport-fajl.ts`
  (`CsatolmanyInput`) ne `db/queries`-ből importáljon típust: a típusok a `lib/`-be kerülnek, a
  `db/queries/riport.ts` onnan importál.
- **Átnevezés:** `listOrszagok` → `listRiportOrszagok`, `listSzerzok` → `listRiportSzerzok`
  (`db/queries/riport.ts`; a mellettük lévő `listAttaseOrszagok`, `listOrszagAttasek` miatt
  félreérthetők).
- **Halott exportok törlése** (mindegyik grep-pel ellenőrizve, hogy nincs külső használója):
  `lib/felhasznalo-validacio.ts` `export type { MezoHibak }`; `lib/riport-validacio.ts`
  `RiportErrors` (a fájlon belül a `MezoHibak` veszi át); `lib/auth-client.ts` `useSession`. A csak
  saját fájlban használt exportok (`LATHATATLAN_RE`, `VEZERLO_RE`, `kiterjesztes`, `FAJLNEV_MAX`,
  `jeloltRegioi`, `regioJeloltjei`) export nélküli belső konstansok lesznek. A `NEXT_MAX_LENGTH`
  marad exportálva (a CLAUDE.md közös helperként hivatkozik rá).

### 3. Shell

- **Szétbontás** `components/app-shell/` alá:
  - `AppContext.tsx`: a context, a `useApp()` és a `AppState` típus. A provider értéke
    `useMemo([user, ev, olvasatlan])` – ma minden AppShell-render új objektumot ad, és ezzel
    újrarendereli a teljes térképnézetet.
  - `Oldalsav.tsx`: márka, navigáció (olvasatlan-számlálóval), az `oldalsavAlja` slot, felhasználói
    blokk, `LogoutForm`.
  - `Fejlec.tsx`: cím és alcím, `CiklusValaszto`.
  - `CiklusValaszto.tsx`: a `useOptimistic` + `useTransition` évváltás.
  - `LogoutForm.tsx`.
  - `AppShell.tsx`: összerakás, az olvasatlan-számláló állapota (render-közbeni igazítás) marad itt.
  - A `useApp` négy importálója (`TerkepNezet`, `TerkepPanel`, `monitoring/page.tsx`,
    `OlvasatlanSzinkron`) az új útvonalra vált.
- **Egyetlen útvonaltábla** `lib/navigacio.ts`-ben: `UTVONALAK` (href, cím, alcím, `adminOnly`,
  opcionális `menu`: ikon, felirat, `alHrefek`), belőle a menü (`menupontok`, `menuAktiv`), a
  `titleFor` és az `isActive`. A `NAV` és a `TITLES` megszűnik; új oldalnál egy sort kell felvenni.
  Az `/orszagprofil` sor csak címet ad (nincs `menu`-je). A menü-feliratok szó szerint maradnak (a „Tudástár ??” és a „Monitoring és
  értékelés ??” is).
- **`LogoutState`:** a megosztott komponens ne importáljon route-fájlból. A
  `components/app-shell/LogoutForm.tsx` maga deklarálja a szerződést, amit vár
  (`type LogoutAction = (prev: { error?: string }) => Promise<{ error?: string }>`); az
  `app/(app)/actions.ts` `logoutAction`-je strukturálisan megfelel neki, a `LogoutState` ott marad.
- **Monogram:** `lib/nev.ts` `monogram(nev)`: a „.”-ra végződő szavakat (pl. „dr.”) kihagyja, üres
  névre üres stringet ad. Az oldalsáv ezt hívja, nem a `lib/score` `ini`-jét; az `ini` törlődik
  (más használója nincs). A ticket-buborékok saját `Monogram`-ja (`TicketJelzesek.tsx`, ugyanaz a
  „dr.”-hiba) is a `monogram()`-ot hívja, üres eredményre „?”-lel. A `FIELDS`/`FIELD_COLORS` (csak a tudástár) a `lib/knowledge.ts`-be
  költözik. Eredmény: a `lib/data` és a `lib/score` csak a `/monitoring` bundle-jében van, nem
  minden oldal közös chunkjában.
- **Stílus:** Tailwind osztályok a mai értékekkel (pl. `text-[12.5px]`, `w-[238px]`), a színek
  `--sidebar`, `--sidebar-foreground`, `--sidebar-border`, `--sidebar-accent`,
  `--sidebar-accent-foreground`, `--sidebar-primary` stb. tokenekben (`bg-sidebar`,
  `border-sidebar-border` …). A nem tokenizálható egyedi színek (`#8d97a5` halvány szöveg, `#a3adbb`
  menü-szöveg, `#b3261e` számláló, `#1b3a6b` monogram, `#f2a6a0` hibaszöveg) saját, projekt-szintű
  változót kapnak a `globals.css`-ben, hogy az `OldalsavAllapot` is ugyanazt használja (ma ott
  külön konstansokban duplikálva vannak). A fejléc világos színei (`#fff`, `#dde1e7`, `#6b7684`)
  a meglévő `--background`/`--border`/`--muted-foreground` tokenekre csak akkor kerülnek, ha az
  értékük pontosan egyezik; különben arbitrary érték.
- **`safeNext`** (`app/login/page.tsx`) → `lib/routes.ts` (a `loginUtvonal` mellé), a `'/login'`
  helyett `LOGIN_ROUTE`-tal, és a `NEXT_MAX_LENGTH`-nél hosszabb értékre a `HOME_ROUTE`-ot adja.
- **Évlista:** a layout inline logikája (`app/(app)/layout.tsx`) → `lib/valasztott-ev.ts`
  `ciklusEvek(...)`, tiszta függvényként (a DB-évek paraméterként jönnek).
- **Halott CSS** (`app/globals.css`): `.btn.primary`, `.btn.blue`, `.bar`, `.bar > div`,
  `textarea.input` (nincs használójuk); a rétegezetlen `body` szabály mindig felülírja a
  `@layer base` `body`-t, ezért a rétegzett sor halott és félrevezető – a végleges szín marad
  (`#f4f5f7`/`#10151d`), a halott sor törlődik. A preflightot duplikáló `* { box-sizing }`,
  `html, body { margin: 0 }` és a `font-family: inherit` szabály törlődik.

### 4. Térkép

- **`VilagTerkep.tsx` szétbontása:**
  - `vetulet.ts`: `W`, `H`, `proj`, `path`, `GOMB_D`, `RACS_D`, `regioTranszform`, `ZOOM_MAX`, a pin-
    sugár konstansai.
  - `TerkepRetegek.tsx`: a memo-komponens változatlanul.
  - `useTerkepZoom.ts`: `zoomRef`, `kRef`, `patternRef`, a régió-állapot, a zoom- és pin-sugár
    effektek, `nagyit`/`regioValaszt` (`useCallback`-kel).
  - A poligonok `path(f)`-je egyszer, a modulszintű atlasz-promise-ban készül (`useVilagAtlasz`
    poligonokat ad vissza, nem feature-öket): ma minden `/terkep`-re visszatéréskor újraszámolódik
    (177 path, kb. 160 KB `d`-string, 5–8 ms).
- **Memo:** `OsszehasonlitasPanel` (`memo`; minden propja már stabil, de memo nélkül minden
  kijelölés-változás 7 `MutatoKartya`-t, 3 `ListaMatrix`-ot és a „+ Ország” selectet újrarendereli),
  `Jelmagyarazat`, `RegioGombok` (hover-enként renderelődnek újra).
- **`TerkepNezet` vezérlői:** `MutatoValaszto.tsx` és `IparagSzuro.tsx` saját komponens; az
  `IPARAG_ITEMS` helyett a `lib/terkep-mutatok.ts` meglévő `IPARAG_CIMKEK`-je; a számláló-szöveg
  (`szamlalo`) a `lib/terkep-mutatok.ts` tiszta függvénye.
- **Szerkesztés-gomb:** a `TerkepNezet` egyszer köti meg (`useCallback`) a gombot előállító
  függvényt (`szerkesztesGomb(kod, { felirat?, className? })`: benne `canEditProfil` kétszer, `most`,
  `valasztEvAction`); a `TerkepPanel` és a `ProfilKivonat` ezt kapja az `ev`, `most`,
  `valasztEvAction`, `szerkeszthetEv`, `szerkeszthetMost` propok helyett. A `TerkepPanel`
  `useApp()`-hívása megszűnik.
- **Összehasonlítás-halmaz:** a `VS_MAX` a `lib/osszehasonlitas.ts`-be kerül (a `VS_SZINEK.length`-
  ből), új `vsKiveszElem` a hozzáadás párjaként; a `vsTele`-t a hook adja a `OsszehasonlitasCsik`-
  nak és a `OsszehasonlitasFejlec`-nek is, nem számolják újra.
- **Apróságok:** az `ertekEsHely` azt is visszaadja, hogy az ország a rangsorban van-e
  (`{ szoveg, helyezett }`), a `ProfilKivonat` nem keresi újra a rangsorban; a „vezetőt jelöljük-e” szabály (`attasek.length > 1 && a.vezeto`)
  egy `lib/attase-orszag.ts`-beli segéd, a tooltip, a kivonat és az `AttaseLista` ezt hívja; a
  `ProfilKivonat` `<dl>`-je `Sor` segédkomponenssel; a `'__nincs'` kulcs egy konstans; a
  `MUTATO_KULCSOK` export nélküli; a duplikált iparág-tagság-ellenőrzés egy függvény; az
  `OsszehasonlitasFejlec` magyar kártyája a közös kártyatestet használja. A `TerkepTooltip`
  kategorikus ága (ma egyik mutató sem éri el) **marad**: a jövőbeli kategorikus mutatókat
  általánosan kezeli, a törlése egy új mutatónál néma hiányt okozna.

### 5. Űrlapok, jelentések, kommunikáció, felhasználók

- **`Mezo` a kézzel írt mezőblokkok helyett** (kb. 24 blokk: `RiportForm`, `EsemenyMezok`,
  `IntezkedesDialog`, `UjTicketDialog`, `UjFelhasznaloDialog`, `SzerkesztesDialog`, `JelszoDialog`,
  `RendezvenySorok`). A `Mezo`/`CimkeSor` új `opcionalis` propja adja a halvány „(opcionális)”
  utótagot (a `cimke` string marad, mert a `SugoGomb` felugrójának neve). A `RendezvenySorok` három
  szövegmezője `RovidMezo`. Az aria-attribútumok nem változnak
  (`leiroAttr` súgó nélkül = `hibaAttr`).
- **Jelentés-feliratok egy helyen:** `RIPORT_MEZO_CIMKEK` a `lib/riport-szotar.ts`-ben („Vezetői
  Összefoglaló”, „Fő üzenet, Mo. számára átvehető jó gyakorlat, javaslat”, „Kapcsolódó feladat,
  kérés”, „Rendezvény adatai” stb.); a `RiportForm`, az `EsemenyMezok` és a `RiportReszlet` ebből
  olvas.
- **Címkés Select:** egy közös `components/form/CimkesSelect.tsx` (Label + Base UI Select +
  `aria-labelledby="<id>-label <id>"`) a `SzuroSelect` (`RiportSzurok`), a `Valaszto`
  (`UjTicketDialog`) és a `SzerepkorSelect` helyett.
- **Országprofil-blokkok:** a `useBlokkAllapot` egy `mezo(k)` prop-építőt is ad (`id`, `name`,
  `value`, `onChange` egy kulcsból; a címkéket a hívó szórja hozzá), a `*Mezok.tsx`-ek ezt
  használják; a csak szöveges blokkok (Intézmények, Programok, Nemzetközi kapcsolatok, Magyar
  értékelés) mezősorrend-listája egy közös `SZOVEGES_MEZOK` konstans a
  `lib/orszagprofil-szotar.ts`-ben (fordítási őrrel a teljességre), amelyet az űrlap és a
  `BlokkNezet` is használ (a tárolt JSON kulcssorrendje nem változik; a 6.2 blokk – benne egy
  egysoros mező – kimarad).
- **Szerkesztő blokklista:** a `[kod]/szerkesztes/page.tsx` kézi 9 sora helyett kimerítő tábla
  (`{ [K in BlokkKulcs]: ComponentType<BlokkMezokProps<ProfilBlokkok[K]>> }`), a `BLOKK_KULCSOK`-on
  iterálva, korrelált generikussal; a kimaradt blokk fordítási hiba lesz. A `<Fragment key={ev}>`
  marad.
- **Dialógusok:** a `FelhasznaloMuveletek` a `SzerkesztesDialog`-ot és a `JelszoDialog`-ot csak az
  első nyitástól mountolja (mint az `IntezkedesSzerkeszto`); a „nyitásonként új `key`” minta
  (`UjFelhasznaloDialog`, `UjTicketDialog`, `IntezkedesSzerkeszto`, `FelhasznaloMuveletek`) közös
  hook (`components/form/useNyitas.ts`); mind az első nyitásig nincs mountolva.
- **Teljesítmény-apróságok:** az `OrszagMezok` ország-opciói modulszintű elem (ma minden
  billentyűleütésre 174 `<option>` épül újra selectenként); a `TicketBeszelgetes` Server Component
  lesz, csak a görgetést végző `<ol>` marad kliens-burok.
- **Típusok:** a kétszer deklarált `RiportFormState` egy helyen; a `() => Promise<MuveletState>`
  alak `MuveletAction` néven a `FormAction` mellé; a fölösleges `export type { MuveletState }`
  re-exportok (`orszagprofil/actions.ts`, `felhasznalok/actions.ts`) törlődnek; a `SearchParams`
  típus a `lib/routes.ts`-be kerül, a `lib/riport-szuro.ts` és a page-ek onnan importálják.
- **Apróságok:** halott `sugo` prop a `SzovegMezo`/`RovidMezo`/`SzamMezo`/`CimkeValaszto`-n (a
  `Mezo` megtartja, az `OrszagMezok` használja); a `RendezvenySorok` stabil sor-azonosítót kap az
  index-kulcs helyett; a `/felhasznalok` lapcímet kap; a csatolmány-URL egy `csatolmanyUrl(id)`
  segéd a `lib/routes.ts`-ben (`CsatolmanyMezo`, `RiportReszlet`); az `AgazatBadge` és
  `AllapotBadge` közös inline színstílusa egy `SzinesBadge` komponens; az egyargumentumú `cn(...)` hívások egyszerűsödnek.

### 6. Demóadat-maradék és dokumentáció

- `lib/data.ts`: `ME_ID`, a `Post` 14 nem használt mezője és a mögöttük álló 4 interfész
  (`Intezmeny`, `Palyazat`, `Esemeny`, `Politika`) törlődik; a `POSTS` csak a `id`, `attase`,
  `orszag`, `base` mezőt tartja meg. A `PILL_COLORS` csak a három használt kulcsot.
- Monitoring: a `14` helyett `CRITERIA.length`, a pontszám-színküszöbök a `col()`-ból, a három
  fejléc a `CATS`-ből. A page kliens-komponens marad (demó, kiváltásra vár).
- CLAUDE.md: minden érintett útvonal, a `ROUTES` tábla (a „`NAV` és `TITLES` bővítése” helyett), az
  új segédek; a terv kódblokkjai a végleges fájlokhoz igazítva.

## Szándékos viselkedésváltozások

1. A monogram a „.”-ra végződő szavakat kihagyja: „dr. Gurza László” → „GL” (ma „DG”) – az
   oldalsávban és a ticket-buborékokban is.
2. A `?next=` paraméter `NEXT_MAX_LENGTH`-nél hosszabb értékkel a kezdőlapra visz (ma tetszőleges
   hosszú Location fejlécet adna).
3. A `/felhasznalok` lapcímet kap (ma az alapértelmezett cím látszik).
4. Rendezvénysorok (a régiós országsorok mintájára): stabil sor-kulcs az index helyett;
   hozzáadás után a fókusz az új sor nevére, törlés után a „Rendezvény hozzáadása” gombra kerül; a
   törlés a következő beküldésig elrejti a pozícióhoz kötött (más sorra csúszó) sorhibákat.

Minden más – szöveg, elrendezés, színek, sorrend, jogosultság, lekérdezés-eredmény – változatlan.

## Hatókörön kívül

- `MegerositoDialog` és a hozzá javasolt `useMuvelet` hook; `KulcsszoValaszto` + `CimkeValaszto`
  egyesítése (a felhasználó döntése).
- A monitoring Server Componentté alakítása; a tudástár és a monitoring DB-re vitele.
- A „??” menüfeliratok (a felhasználó saját commitja, `ab4af80`).
- A `lib/riport-fajl.ts` (server-only I/O a `lib/`-ben) áthelyezése.
- Új adatbázis-index (az audit `EXPLAIN`-nel ellenőrizte: a használt lekérdezések indexeltek).

## Ellenőrzés

- Taskonként `npx tsc --noEmit`, spec-review és minőségi review (subagentek, opus).
- A végén `npm run build` hibátlanul.
- **Bundle:** a build `page_client-reference-manifest.js`-eiben a `lib/data` / `lib/score` csak a
  `/monitoring`-nál szerepel.
- **Payload:** a `/terkep` RSC-payloadja (a page `__next_f` adata) a 2. task előtt és után mérve,
  a csökkenés kb. 7,5 KB a demó DB-n.
- **Lekérdezés-egyezés:** a `listTerkepAdat(ev)` eredménye a módosítás előtt és után minden évre
  (`EV_MIN`..2026) mezőnként azonos (eldobható tsx-script, a kivágott alapadat-mezők nélkül
  összevetve).
- **Böngésző (gstack, a futó dev szerveren):** előtte/utána képernyőkép az oldalsávról és a
  fejlécről (admin és attasé, keskeny és széles ablak); térkép: hover-tooltip, zoom, régió-gombok,
  összehasonlítás felvétele/kivétele, mutatóváltás; profil-szerkesztő: egy blokk mentése, hibás
  szám hibaüzenete és fókusza, rendezvénysor törlése; új jelentés hibás és helyes beküldése;
  felhasználó-dialógusok megnyitása és hibás mentése; ticket-válasz; kijelentkezés és
  `/login?next=` visszairányítás. A QA végén kijelentkezés, a `data/tet.db` nem kerül commitba.

## Kockázatok

- **Pixel-eltérés a shellben:** az inline → Tailwind átírásnál egy elírt érték. Ellenszer: az
  előtte/utána képernyőkép-összevetés, a mai értékek 1:1 átvétele.
- **Áthelyezés utáni elavult típusfájl:** a futó dev szerver `.next/dev/types/validator.ts`-e
  bennragadhat a régi útvonalakkal; a CLAUDE.md szerint törölni kell, a forrás jó.
- **Közös munkafa:** a felhasználó más TéT-munkamenetei ugyanebben a munkafában futhatnak; ágváltás
  vagy merge előtt `git branch --show-current`, `git reflog`, `ListAgents`.
