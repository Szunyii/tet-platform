# Jelentések: „Vezetői Összefoglaló”, „Fő üzenet/jó gyakorlat/javaslat” és a központ „Megtett intézkedés” mezője – tervezési spec

Dátum: 2026-10-13
Állapot: megvalósítva és átnézve (taskonként két review + záró review); a böngészős próba és a demó DB commitja a dev szerverre vár
Ág: `jelentes-intezkedes`

## Cél

1. A jelentés (információs bejegyzés) űrlapján a „Tárgy” alatti mező neve „Vezetői Összefoglaló”
   legyen, közvetlenül alatta pedig a „Fő üzenet/jó gyakorlat/javaslat” mező álljon.
2. A központ (admin) a jelentéshez **megtett intézkedést** rögzíthessen, a jelentés szövegétől
   külön, a Jelentések listájából és a jelentés részletoldaláról is. Az attasé a saját jelentésénél
   látja, de nem írhatja.

## Döntések

| Kérdés | Döntés |
| --- | --- |
| „Fő üzenet/jó gyakorlat/javaslat” | A meglévő `joGyakorlat` mező új névvel és új helyen; **opcionális** marad. Új mező nincs. |
| Megtett intézkedés alakja | Jelentésenként **egy** szöveg, mellette az utolsó rögzítő neve és az időpont. Nincs napló. |
| Hol írható | A lista új „Intézkedés” oszlopából **és** a részletoldalról, ugyanazzal a felugró ablakkal. |
| A központ szerkesztési joga | **Marad**: az admin továbbra is szerkesztheti és törölheti bármelyik jelentést. |
| Tárolás | Három új, nullable oszlop a `riport` táblán (nem külön tábla, nem ticket). |
| Felirat írásmódja | A megrendelő szövege szerint: „Vezetői Összefoglaló” (nagy Ö-vel). |

## Hatókörön kívül

- Az intézkedés korábbi változatainak előzménye, naplója.
- Értesítés az attasénak (e-mail, számláló, ticket) az intézkedés rögzítéséről.
- Szűrő a listában az intézkedés nélküli jelentésekre.
- A `leiras` / `jo_gyakorlat` oszlopok és a `leiras` / `joGyakorlat` mezőnevek átnevezése: csak a
  feliratok változnak, ezért **adatmigráció nem kell**, a hibakulcsok és a DOM-id-k is maradnak.

## 1. Űrlap és részletoldal: átnevezés, áthelyezés

**`components/riport/RiportForm.tsx`**

- A `leiras` mező címkéje: „Vezetői Összefoglaló”. Kötelező, `LEIRAS_MAX` (5000), a placeholder és
  a karakterszámláló marad.
- A `joGyakorlat` mező kikerül a „További adatok” `Collapsible`-ből, és közvetlenül a `leiras` blokk
  után, a kulcsszavak **előtt** áll. Címkéje „Fő üzenet/jó gyakorlat/javaslat”, mellette halvány
  „(opcionális)” jelzés (a `Collapsible`-en kívül már nem derül ki másból, hogy nem kötelező).
  `id`/`name`: `joGyakorlat`, `SZOVEG_MAX`, 3 sor – változatlan.
- A `Collapsible` kapcsolója: „További adatok (opcionális): kapcsolódó feladat, csatolmány”.
  A `vanOpcionalisHiba` már csak a `kapcsolodoFeladat` és a `csatolmany` hibáját nézi (a
  `joGyakorlat` hibája mindig látható helyen van); a `keepMounted` kommentje is ehhez igazodik.

**`components/riport/RiportReszlet.tsx`** – az űrlap sorrendjét követi:

1. fejléc (változatlan),
2. „Vezetői Összefoglaló” cím (`h3`) + a `leiras` szövege,
3. „Fő üzenet/jó gyakorlat/javaslat” kártya (ha van; a mostani smaragd bal szegéllyel),
4. kulcsszavak,
5. rendezvény adatai (ha van),
6. „Kapcsolódó feladat, kérés” kártya (ha van),
7. „Megtett intézkedés” kártya (lásd a 2. részt),
8. csatolmányok.

**További szövegek**

| Hely | Régi | Új |
| --- | --- | --- |
| `lib/riport-validacio.ts` | „A leírás kötelező.” | „A vezetői összefoglaló kötelező.” |
| `lib/riport-validacio.ts` | „A leírás legfeljebb … karakter.” | „A vezetői összefoglaló legfeljebb … karakter.” |
| `lib/riport-validacio.ts` (`opcionalis` címkéje) | „A jó gyakorlat” | „A fő üzenet/jó gyakorlat/javaslat” |
| `components/AppShell.tsx` `TITLES['/uj-jelentes']` | „Kategória, tárgy, leírás, kulcsszavak – …” | „Kategória, tárgy, vezetői összefoglaló, kulcsszavak – …” |
| `components/riport/RiportSzurok.tsx` kereső placeholder | „Tárgy vagy leírás…” | „Tárgy vagy összefoglaló…” |
| `README.md` útvonal-táblázat (`/uj-jelentes`) | „…tárgy, leírás, kulcsszavak…” | „…tárgy, vezetői összefoglaló, fő üzenet, kulcsszavak…” |

## 2. Megtett intézkedés

### Adatmodell

`db/schema/riport.ts`, a `riport` táblán:

```ts
intezkedes: text('intezkedes'),
intezkedesSzerzoNev: text('intezkedes_szerzo_nev'),
intezkedesIdopont: integer('intezkedes_idopont', { mode: 'timestamp_ms' }),
```

- Invariáns: a három oszlop **együtt** `null` vagy együtt töltött; csak a `setIntezkedes` írja őket.
- A rögzítő neve **pillanatkép** (mint a `ticket_uzenet.szerzo_nev`): nincs FK, az admin fiók
  törlése után is olvasható.
- Migráció: `npx drizzle-kit generate --name intezkedes` → `drizzle/0010_intezkedes.sql`, három
  `ALTER TABLE riport ADD …`. Ha a generált fájlban `__new_riport` vagy `DROP TABLE` szerepel, az
  hiba: a `riport` szülőtábla, az újraépítése kaszkádolva törölné a csatolmányokat (CLAUDE.md,
  Adatréteg).
- A hosting a `npm run build` `drizzle-kit migrate` lépésével kapja meg. A repóban lévő
  `data/tet.db`-t a migráció után a szokott módon frissítjük (`wal_checkpoint(TRUNCATE)`), külön
  `chore` commitban.
- Korlát: `INTEZKEDES_MAX = 5000` a `lib/riport-szotar.ts`-ben.

### Lekérdezések – `db/queries/riport.ts`

- `RiportListItem` új mezője: `intezkedes: string | null` (a teljes szöveg: a lista ebből vág két
  sort, és ez a felugró ablak kezdőértéke).
- `RiportDetail` új mezői: `intezkedes`, `intezkedesSzerzoNev` (`string | null`),
  `intezkedesIdopont` (`Date | null`).
- Új: `setIntezkedes(id: string, szoveg: string | null, szerzoNev: string): boolean`
  - `szoveg === null` → mindhárom oszlop `null`; különben szöveg, név, `new Date()`.
  - A `riport.updatedAt`-ot **nem** lépteti (a `$onUpdate` miatt a `set`-ben kifejezetten önmagára
    állítva): a részletoldal „módosítva” dátuma az attasé szövegére vonatkozik, az intézkedésnek
    saját időpontja van.
  - Visszatérés: módosult-e sor (`false`, ha a jelentés már nem létezik).
- Az `updateRiport` és a `createRiport` nem nyúl a három oszlophoz: a jelentés szerkesztése az
  intézkedést érintetlenül hagyja.

### Jogosultság – `lib/riport-jog.ts`

- Új: `canIntezkedni(session): boolean` → `session.role === 'admin'`.
- Olvasás: aki a jelentést láthatja (`canViewRiport`), az intézkedést is látja – az attasé a
  sajátjánál, csak olvasásra.
- A `canEditRiport` változatlan.

### Validátor – `lib/riport-validacio.ts`

`parseIntezkedes(fd: FormData)`: a `intezkedes` mezőt a közös `mezo()`-val tisztítja; üres →
`{ ok: true, szoveg: null }` (törlés); `INTEZKEDES_MAX` fölött
`{ ok: false, errors: { intezkedes: 'A megtett intézkedés legfeljebb 5000 karakter.' } }`.

### Action – `app/(app)/jelentesek/actions.ts`

`mentIntezkedesAction(id, _prev, formData): Promise<MuveletState>`, sorrend:

1. `requireSession()`;
2. `canIntezkedni` hiánya → `{ errors: { form: NINCS_JOG } }` (form-szintű, nem 404);
3. `parseIntezkedes` → mezőhiba;
4. `setIntezkedes(id, szoveg, session.name)`; `false` →
   `{ errors: { form: 'A bejegyzés már nem létezik.' } }`; kivétel → a meglévő
   „Mentés sikertelen, próbáld újra.” minta `unstable_rethrow`-val;
5. `revalidatePath('/jelentesek')`, `revalidatePath('/jelentesek/<id>')`, majd `{ ok: true }`
   (nincs átirányítás: a felugró ablak a hívó oldalon zárul).

### Felület

Két új kliens-komponens a `components/riport/` alatt:

- **`IntezkedesDialog.tsx`** – a közös `MuveletDialog`-ra épül (`useMuveletForm(action,
  'Intézkedés mentve.', bezár)`). Egy vezérelt `Textarea` (`id`/`name`: `intezkedes`, 6 sor,
  `INTEZKEDES_MAX`), karakterszámláló, `MezoHiba`. Propok: `targy`, `ertek`, `action`, `open`,
  `onOpenChange`.
- **`IntezkedesSzerkeszto.tsx`** – a kiváltó elem és a nyitás állapota; a dialógust a meglévő
  mintára nyitásonként új `key`-jel mountolja, hogy a mező és a hibák mindig friss állapotból
  induljanak. Propok: `targy`, `ertek`, `action`, `valtozat: 'cella' | 'gomb'`.
  - `cella` (lista): ha van szöveg, maga a két sorra vágott szöveg a gomb; ha nincs,
    „Intézkedés rögzítése” gomb.
  - `gomb` (részletoldal): „Módosítás”, illetve „Intézkedés rögzítése”.

**Lista – `components/riport/RiportTabla.tsx`** (Server Component marad)

- Új „Intézkedés” oszlop a „Kulcsszavak” után, mindkét szerepkörnek.
- Új prop: `intezkedesAction?: (id: string) => FormAction`. A page csak adminnak adja
  (`(id) => mentIntezkedesAction.bind(null, id)`); megléte esetén a cella `IntezkedesSzerkeszto`
  (`valtozat="cella"`), különben csak olvasható: a szöveg két sorra vágva (`line-clamp-2`, a
  teljes szöveg `title`-ben), szöveg nélkül „–”.

**Részletoldal – `RiportReszlet.tsx`**

- Új prop: `intezkedesAction?: FormAction` (a page `canIntezkedni` esetén adja a bind-olt actiont).
- „Megtett intézkedés” kártya (ég-kék bal szegély, hogy elváljon a smaragd és a borostyán
  kártyától): a szöveg `whitespace-pre-wrap`, alatta halványan „`<név>` · `<dátum>`”
  (`formatDatum`).
- Admin: a kártya mindig látszik; szöveg nélkül „Még nincs rögzített intézkedés.” + a gomb.
- Attasé: a kártya csak akkor látszik, ha van szöveg; gomb nincs.

**Szövegek**

| Elem | Szöveg |
| --- | --- |
| Lista oszlopfej | „Intézkedés” |
| Gomb, ha még nincs | „Intézkedés rögzítése” |
| Gomb a részletoldalon, ha van | „Módosítás” |
| Kártya címe | „Megtett intézkedés” |
| Üres kártya (admin) | „Még nincs rögzített intézkedés.” |
| Dialógus címe | „Megtett intézkedés” |
| Dialógus leírása | „A(z) „`<tárgy>`” jelentéshez. Üresen mentve az intézkedés törlődik.” |
| Mező címkéje | „Intézkedés szövege” |
| Siker-toast | „Intézkedés mentve.” |

## Élhelyzetek

- **Attasé hívja az actiont** (kézzel összerakott kérés): `NINCS_JOG` form-hiba, írás nincs.
- **A jelentés közben törlődött**: „A bejegyzés már nem létezik.” form-hiba a nyitott ablakban.
- **Az admin szerkeszti a jelentést**: az intézkedés és annak időpontja változatlan.
- **A szerző attasé törlése**: a jelentés kaszkáddal törlődik, vele az intézkedés is.
- **A rögzítő admin törlése**: a név pillanatképként megmarad.
- **Régi jelentések**: a három oszlop `null` – „nincs intézkedés”, külön kezelés nem kell.
- **Lista mérete**: a lista a teljes intézkedés-szöveget megkapja (soronként legfeljebb 5000
  karakter). A lista ma sem lapoz; ha lapozás kerül bele, ezt érdemes újranézni.
- **Űrlap-azonosítók**: a dialógus mezője `intezkedes` id-t kap. Zárt dialógus tartalma nincs a
  DOM-ban, a jelentés szerkesztő űrlapja pedig másik oldalon van, ezért nincs ütközés.

## Ellenőrzés

Tesztkeretrendszer nincs; az ellenőrzés a projekt szokott módján megy.

1. `npx tsc --noEmit`, majd `npm run build`.
2. A generált `drizzle/0010_intezkedes.sql` átolvasása: csak három `ADD` utasítás.
3. Eldobható tsx script a `data/tet.db` **másolatán** (`DATABASE_URL`, `--conditions=react-server`):
   - `setIntezkedes` beír → a három oszlop töltött, az `updated_at` változatlan;
   - `null` szöveggel → mindhárom `null`; nem létező id → `false`;
   - `listRiportok` és `getRiport` visszaadja az új mezőket; `updateRiport` után az intézkedés megmarad;
   - `parseIntezkedes`: üres → `null`, szóköz-körítés levágva, 5001 karakter → hiba.
4. Böngészős próba a felhasználó dev szerverén (ha fut): admin a listából és a részletoldalról ír,
   módosít, töröl; attasé a sajátjánál olvassa, gombot nem lát; az új jelentés űrlapján a mezők az
   új néven és sorrendben, a hibaüzenetek az új szöveggel.

## Dokumentáció

- `CLAUDE.md` „Riportok” bekezdés: a két felirat, a `joGyakorlat` új helye, a három oszlop és az
  invariáns, a `setIntezkedes` `updatedAt`-szabálya, `canIntezkedni`, a két új komponens, és hogy a
  `RiportTabla` az actiont függvény-propként kapja.
- `README.md`: az útvonal-táblázat szövege és a jelentések rövid leírása.

## Megvalósítási eltérések

A review-k nyomán a megvalósítás az alábbiakban tér el a fenti szövegtől; a kód és a `CLAUDE.md` a
végleges állapotot írja le.

- **Hiányzó mező nem töröl.** A `parseIntezkedes` hiányzó vagy fájl típusú `intezkedes` mezőnél
  `{ form: 'Érvénytelen kérés.' }` hibát ad; csak a ténylegesen beküldött üres szöveg jelent törlést
  (a törlés visszavonhatatlan, előzmény nincs).
- **Törléskor más visszajelzés.** Meglévő szöveg üresre mentésekor a toast „Intézkedés törölve.”,
  egyébként „Intézkedés mentve.”.
- **Egyetlen kiváltó gomb.** Az `IntezkedesSzerkeszto` minden állapotban ugyanazt az egy natív
  `<button>`-t rendereli (szöveg-gombként vagy `buttonVariants`-szal): elemtípus-váltásnál a mentés
  után a fókusz nem tért volna vissza a kiváltó elemre. A lista üres celláinak gombja a tárggyal
  együtt kap nevet (`aria-label`), a gomb `aria-haspopup="dialog"`-ot visel, a dialógus csak az első
  nyitástól van mountolva.
- **Szélesebb ablak.** A dialógus a `MuveletDialog` `szeles` módjában nyílik, a szövegmező legfeljebb
  a képernyő 45%-áig nő, utána görget.
- **Előnézet sortörések nélkül.** A lista kétsoros előnézetében (cella és csak olvasható szöveg) a
  sortörések összeesnek, hogy több tartalom férjen ki; a részletoldal kártyája megtartja őket, és a
  hosszú, törhetetlen szöveget is tördeli.
- **Címke.** A „Fő üzenet/jó gyakorlat/javaslat” felirat és az „(opcionális)” jelzés között valódi
  szóköz van, hogy a felolvasott név ne folyjon egybe.

### Ismert, elfogadott korlátok (a review-kból)

- **Utolsó írás nyer.** Ha két admin egyszerre szerkeszti ugyanazt az intézkedést, az később mentő
  felülírja a másikét; ütközésjelzés nincs.
- **Az attasé az intézkedés után is szerkesztheti és törölheti a saját jelentését**; a törlés az
  intézkedést is viszi.
- **A jelentés törlése közbeni mentés** hibát ír a nyitott ablakba („A bejegyzés már nem létezik.”),
  de a listát nem frissíti: a sor a következő betöltésig látszik.
