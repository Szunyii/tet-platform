# Riportok – kategorizált információs bejegyzések – tervezési spec

Dátum: 2026-09-07 (frissítve 2026-09-08 a login-feature után)
Állapot: jóváhagyva

## Cél

A `/riportok` és `/uj-riport` képernyők valódi, adatbázisra épülő működése. A TéT
attasék kategorizált **információs bejegyzéseket** adnak be (tárgy, leírás,
kulcsszavak, rendezvénynél dátum és helyszín, opcionális csatolmány, jó gyakorlat,
kapcsolódó feladat). Minden bejegyzés egy táblába kerül, ahol az attasé a
sajátjait, az admin az összeset látja és szűri.

A régi, 7 blokkos ciklus-riport koncepció **teljesen kikerül** a riport oldalakról.

## Döntések

| Kérdés | Döntés | Indok |
| --- | --- | --- |
| Viszony a 7 blokkos riporthoz | Leváltja | Egy adatmodell, egyszerűbb. |
| Szerző | Valódi session user, **külön login-spec előfeltétel** | Dummy szerzővel később újra hozzá kellene nyúlni. |
| Életciklus | Nincs: beadás = kész | Vázlat, admin visszajelzés, állapotgép nem kért. |
| Láthatóság | Attasé: saját; admin: összes | Belső rendszer, egyszerű jogosultság. |
| Csatolmány tárolás | SQLite blob, külön táblában | Egy fájl a backup; a lista sosem olvassa a blobot. |
| Szótárak (kategória, kulcsszó) | Kódban, `lib/riport-szotar.ts` | Admin-szerkesztés nem kért (YAGNI). |
| Form UX | Egyoldalas, kategória-vezérelt, `/uj-riport` | Egy görgetés, feltételes rendezvény-blokk. |
| Részlet | Saját oldal `/riportok/[id]` | Linkelhető, hely a csatolmányoknak, szerkesztés ugyanazzal az űrlappal. |
| Form-library | Nincs; natív `<form>` + Server Action + `useActionState` | Kis űrlap, egy feltételes szabály; nincs új függőség. |

## Előfeltétel: login (kész, a `main`-en)

A login-feature (`2026-09-07-login-felhasznalok-design.md`) elkészült; ez a spec az
ott megvalósult interfészre épül:

- `lib/session.ts` (`server-only`): `getSession()` (`React.cache`), `requireSession()`
  → `AppSession = { userId, name, email, role: 'admin' | 'attase', orszag: string | null }`,
  bejelentkezés hiányában `redirect(LOGIN_ROUTE)`; `requireAdmin()` → `notFound()`.
  Mindig `await`, soha `try/catch`-en belül.
- `user.orszag` (attasénál kötelező, adminnál üres) – a bejegyzés `orszag` mezője
  ebből másolódik.
- A védett oldalak az `app/(app)/` route groupban vannak; az `app/(app)/layout.tsx`
  `requireSession()`-t hív, és az `AppShell` propként kapja a usert. A `titleFor`
  már prefix-egyezéssel ad címet (`/riportok/abc` → „Riportok”).
- Kész shadcn komponensek: `alert-dialog`, `sonner` (Toaster a gyökér layoutban),
  `badge`, `button`, `card`, `dialog`, `dropdown-menu`, `input`, `label`, `select`,
  `table`, `textarea`, `tabs`, `separator`.
- Kialakult form-minta (`app/(app)/felhasznalok/components/`): `useMuveletForm`
  (`useActionState` wrapper: siker-toast, action-elutasítás → űrlap-hiba,
  `unstable_rethrow`, fókusz az első hibás mezőre), `MezoHiba` + `hibaAttr`
  (`<mezo>-hiba` id-k, `aria-invalid`/`aria-describedby`), vezérelt mezők (a React 19
  a `<form action>` után resetel), `MuveletDialog`. A riport-feature a mezőszintű
  részeket (`MezoHiba`, `hibaAttr`, a hook) `components/form/` alá költözteti, hogy
  mindkét feature ugyanazt használja.
- Server action minta: `requireSession()` a `try`-on kívül, Better Auth/DB hiba
  → `{ errors }`, `unstable_rethrow` a `catch` elején.

Kiegészítés a session-rétegen (ebben a feature-ben): a `requireSession()` őrizze meg
a cél útvonalat (`redirect(LOGIN_ROUTE + '?next=' + path)`), mert a riport mélylinkek
(`/riportok/[id]`) elavult cookie-val a proxyn átjutnak, és a login után a `/terkep`-re
kerülne a felhasználó. Megoldás: a `proxy.ts` `x-pathname` fejlécet ad a kérésnek
(`NextResponse.next({ request: { headers } })`), a `requireSession()` ezt olvassa.

## Hatókörön kívül

Vázlat mentése, admin visszajelzés/állapot, értesítés, e-mail, kulcsszó-admin UI,
teljes szöveges keresés, export. A `lib/score.ts` riport-függvényei (`reports`,
`blk`, `repStatusOf`) a monitoring képernyő miatt maradnak, a riport oldalak
nem használják őket. A `BLOCKS` a `lib/data.ts`-ből törlendő, ha már senki nem
hivatkozik rá.

## Szótár (`lib/riport-szotar.ts`)

Framework-mentes konstansok, `as const`, a form és a validáció is innen dolgozik.

Kategóriák (`KATEGORIAK`): `kulcs`, `cimke`, `leiras` (egy sor), `ikon` (lucide név),
`datumKotelezo`.

| kulcs | cimke | datumKotelezo |
| --- | --- | --- |
| `szabalyozas` | KFI szabályozási és intézményi környezet | nem |
| `finanszirozas` | KFI finanszírozás, beruházások, támogatások | nem |
| `okoszisztema` | KFI ökoszisztéma – aktualitások, hírek | nem |
| `rendezveny` | Rendezvény, találkozó, delegáció (részvétel külső eseményen / saját szervezés) | **igen** |
| `palyazat` | Pályázati felhívás, rendezvény részvételi lehetőség | nem |
| `egyuttmukodes` | Együttműködési lehetőségek (kutatási / technológiai / oktatási / pályázati / üzleti), partnerkeresés | nem |

Kulcsszavak (`KULCSSZAVAK`, 33 db, ebben a sorrendben): Innováció; Innovációs
ökoszisztéma; Tudomány; Tudományos együttműködés; Technológia;
Technológiafejlesztés; Egyetem; Felsőoktatás; Kutatás; K+F / KFI; Startup;
Scaleup; Mesterséges intelligencia / AI; Nemzetközi együttműködés; Rendezvény;
Konferencia; Látogatás / delegáció; Egyeztetés / megbeszélés; Pályázati felhívás /
lehetőség; Programok / kezdeményezések; Innovációs ügynökségek / intézetek;
Digitalizáció; Horizon Europe / EU programok; Űrkutatás / space; Stratégia;
Szakpolitika; Oktatás; Partnerkapcsolatok / partnerkeresés; Technológiatranszfer;
Kutatóintézetek / kutatóközpontok; Summit / szakmai fórum; Nemzetköziesítés /
külpiac.

Csatolmány-korlátok (`CSATOLMANY_LIMIT`): max 5 fájl / bejegyzés, max 8 MB / fájl,
engedett MIME: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, PNG, JPG/JPEG.

## Adatmodell (`db/schema/riport.ts`)

Re-export a `db/schema/index.ts`-ből, utána `npm run db:generate`, migráció commitolva.

`riport`:

| Oszlop | Típus | Szabály |
| --- | --- | --- |
| `id` | text PK | `crypto.randomUUID()` |
| `szerzo_id` | text FK → `user.id`, cascade | |
| `orszag` | text notNull | beküldéskor a session user országából másolva; később nem követi a user változását |
| `kategoria` | text notNull | `KATEGORIAK` kulcs |
| `targy` | text notNull | 1–200 karakter |
| `leiras` | text notNull | 1–5000 karakter |
| `kulcsszavak` | text notNull | JSON tömb, 1–5 elem, mind a `KULCSSZAVAK`-ból, duplikáció nélkül |
| `esemeny_datum` | text null | `YYYY-MM-DD`; `rendezveny` kategóriánál kötelező, másnál üres |
| `esemeny_helyszin` | text null | 1–200 karakter; `rendezveny`-nél kötelező, másnál üres |
| `jo_gyakorlat` | text null | max 5000 |
| `kapcsolodo_feladat` | text null | max 5000 |
| `created_at`, `updated_at` | integer timestamp_ms | mint az auth tábláknál (`$onUpdate`) |

Indexek: `szerzo_id`, `kategoria`, `created_at`.

`riport_csatolmany`:

| Oszlop | Típus |
| --- | --- |
| `id` | text PK |
| `riport_id` | text FK → `riport.id`, cascade |
| `fajlnev` | text notNull |
| `mime` | text notNull |
| `meret` | integer notNull (bájt) |
| `tartalom` | blob notNull |
| `created_at` | integer timestamp_ms |

Index: `riport_id`.

`next.config.mjs`: `experimental.serverActions.bodySizeLimit: '50mb'` (5 × 8 MB +
multipart overhead).

## Szerver réteg

### `db/queries/riport.ts`

Csak itt van Drizzle kód a riport domainhez.

- `listRiportok(filter: RiportFilter): RiportListItem[]` – filter mezők:
  `szerzoId?`, `kategoria?`, `kulcsszo?` (SQLite `json_each` EXISTS), `orszag?`,
  `q?` (LIKE a `targy` és `leiras` mezőkön), `datumTol?`, `datumIg?`
  (`created_at` alapján). Eredmény: riport mezők (blob nélkül) + `szerzoNev` (join
  `user`) + `csatolmanyDb` (count). Rendezés `created_at desc`.
- `getRiport(id): RiportDetail | null` – teljes sor + szerző + csatolmány metaadatok
  (`id`, `fajlnev`, `mime`, `meret`), blob nélkül.
- `createRiport(input: RiportInput, csatolmanyok: CsatolmanyInput[]): string` –
  tranzakció, visszaadja az id-t.
- `updateRiport(id, input, ujCsatolmanyok, torlendoCsatolmanyIdk)` – tranzakció;
  a limitet (max 5) a meglévő – törlendő + új összegre a hívó ellenőrzi.
- `deleteRiport(id)`.
- `getCsatolmany(id): { riportId, fajlnev, mime, tartalom } | null` – letöltéshez.
- `listOrszagok(): string[]` – distinct `orszag`, admin szűrőhöz.

### `lib/riport-validacio.ts`

Tiszta függvény, nincs benne React és DB.

`parseRiportForm(formData: FormData): { ok: true; data: RiportInput; fajlok: File[] }
| { ok: false; errors: RiportErrors }` – `RiportErrors = Partial<Record<mezo, string>>`
magyar üzenetekkel. Szabályok: a fenti adatmodell-táblázat + a `rendezveny` →
dátum és helyszín kötelező; nem-`rendezveny` kategóriánál a dátum/helyszín értéke
eldobandó. Fájlok: darab, méret, MIME a `CSATOLMANY_LIMIT` szerint; a `fajlok`
hiba kulcsa `csatolmany`.

### `lib/riport-jog.ts`

- `canViewRiport(session, riport): boolean` – admin mindent, attasé csak
  `szerzoId === session.userId`.
- `canEditRiport(session, riport): boolean` – ugyanaz (szerkesztés és törlés).

### Server actions

`app/(app)/uj-riport/actions.ts`:
- `createRiportAction(prev: RiportFormState, formData): Promise<RiportFormState>` –
  `requireSession()`; attasénál `orszag` kötelező (ha `null`, általános hiba:
  „A fiókodhoz nincs ország rendelve.”); `parseRiportForm`; fájlok
  `arrayBuffer()` → `Buffer`; `createRiport`; `revalidatePath('/riportok')`;
  `redirect('/riportok/' + id)`. Hibánál `{ errors }` visszaadása.

`app/(app)/riportok/actions.ts`:
- `updateRiportAction(id, prev, formData)` – `requireSession`, `getRiport`,
  `canEditRiport` különben `{ errors: { form: 'Nincs jogosultságod.' } }`;
  a form `torlendoCsatolmany[]` mezőit is olvassa; darab-limit ellenőrzés;
  `updateRiport`; revalidate; redirect a részletre.
- `deleteRiportAction(id)` – jog-ellenőrzés, `deleteRiport`, revalidate,
  `redirect('/riportok')`.

`RiportFormState = { ok?: boolean; errors?: RiportErrors & { form?: string } }` (a
`MuveletState`-tel azonos alak, hogy a közös hook kezelje). Sikeres létrehozás /
módosítás után `redirect` a részletre; törlés után `redirect('/riportok')`.

### Letöltés

`app/api/riport/csatolmany/[id]/route.ts` GET: session (nincs → 401),
`getCsatolmany` (nincs → 404), `getRiport` + `canViewRiport` (nem → 404),
válasz a blobbal, `Content-Type` a tárolt MIME, `Content-Disposition: attachment;
filename*=UTF-8''<encoded>`.

## UI

Minden új felület shadcn/ui + Tailwind; a régi `.card`/`.tbl`/inline-style
világot ezek az oldalak nem használják. Hozzáadandó shadcn komponensek:
`popover`, `command`, `calendar`, `collapsible`, `tooltip`, `skeleton` (az
`alert-dialog` és a `sonner` már megvan, a Toaster a gyökér layoutban).

### Route-ok

| Route | Fájl | Felelősség |
| --- | --- | --- |
| `/uj-riport` | `app/(app)/uj-riport/page.tsx` | Server Component. `requireSession()`. `<RiportForm mode="create" action={createRiportAction} />`. A régi 7 blokkos kliens-oldali űrlap törlődik. |
| `/riportok` | `app/(app)/riportok/page.tsx` | Server Component. `requireSession()`; `searchParams` → `RiportFilter` (attasénál `szerzoId` kényszerítve); `listRiportok`; admin esetén `listOrszagok`. Rendereli a fejlécet, `RiportSzurok`, `RiportTabla`. A régi demó kimutatás/riportlista törlődik. |
| `/riportok/[id]` | `app/(app)/riportok/[id]/page.tsx` | `getRiport`; nincs vagy `!canViewRiport` → `notFound()` (az `app/(app)/not-found.tsx` az AppShellben). Részletnézet. |
| `/riportok/[id]/szerkesztes` | `app/(app)/riportok/[id]/szerkesztes/page.tsx` | Mint fent, plusz `!canEditRiport` → `notFound()`. `<RiportForm mode="edit" initial={...} action={updateRiportAction.bind(null, id)} />`. |

Az `AppShell.tsx` `NAV` címkéi: „Riportok” (`/riportok`), „Új bejegyzés”
(`/uj-riport`); a `TITLES` alcímei a bejegyzés-modellre frissülnek. A prefix-egyezés
(`titleFor`) már megvan.

### Komponensek (`components/riport/`)

Megosztottak, mert az új és a szerkesztő route is használja.

- `RiportForm.tsx` (`'use client'`) – natív `<form action={...}>` a közös
  `useMuveletForm` hookkal (siker: toast; a redirect az actionben történik). Prop:
  `mode: 'create' | 'edit'`, `initial?: RiportDetail`, `action`. Minden szöveges mező
  vezérelt (React 19 reset), a kategória, a kulcsszavak és a fájlok is state-ben.
  Beküldés alatt gomb letiltva + „Mentés…”. Hibánál a hook az első hibás mezőre
  fókuszál (a mező id-ja = a hiba kulcsa; a kategória-rács és a kulcsszó-választó
  fókuszálható gyökérelemet kap ezzel az id-val). A fájlválasztás hiba után nem
  marad meg: ezt a hibaüzenet jelzi. Mezőhibák: `MezoHiba` + `hibaAttr`. Gombok:
  „Mégse” (vissza), „Bejegyzés beadása” / „Módosítások mentése”.
- `KategoriaValaszto.tsx` – 6 kártya rácsban (ikon, címke, egysoros leírás),
  rádió-szemantika (`role="radiogroup"`, billentyűzettel léptethető), a
  kiválasztott kártya színes kerettel és pipával. Rejtett `<input name="kategoria">`.
- `KulcsszoValaszto.tsx` – kiválasztott chipek `×` gombbal, `Popover` +
  `Command` kereshető lista, „N/5” számláló; 5-nél a további tételek letiltva.
  Rejtett `<input name="kulcsszavak" value=JSON>`.
- `EsemenyMezok.tsx` – csak `datumKotelezo` kategóriánál jelenik meg (be-/kilépés
  `tw-animate-css`-szel): dátum (`Calendar` popoverben, rejtett `<input
  name="esemenyDatum">` ISO értékkel) és helyszín `Input`.
- `CsatolmanyMezo.tsx` – drag-and-drop zóna + `<input type="file" multiple
  name="csatolmany">`; kiválasztott fájlok listája (név, méret, eltávolítás);
  kliens-oldali előellenőrzés (darab, méret, típus) azonnali hibaszöveggel.
  Szerkesztésnél a meglévő csatolmányok letöltő-linkkel és „törlésre jelöl”
  kapcsolóval (rejtett `<input name="torlendoCsatolmany" value=id>`).
- Opcionális mezők (`joGyakorlat`, `kapcsolodoFeladat`, csatolmány) egy
  `Collapsible` „További adatok” blokkban; alapból zárva, de nyitva marad, ha
  bármelyiknek van értéke vagy hibája.
- `RiportSzurok.tsx` (`'use client'`) – keresőmező (300 ms debounce), kategória
  `Select`, kulcsszó `Select`, admin esetén ország `Select`, dátumtartomány
  (két dátum). Minden szűrő az URL `searchParams`-ban (`router.replace`), így
  megosztható és a szerver szűr. „Szűrők törlése” gomb, ha bármelyik aktív.
- `RiportTabla.tsx` – shadcn `Table` (Server Component, adat propként). Oszlopok: dátum (`created_at`, `formatDatum` a `lib/datum.ts`-ből),
  kategória `Badge` (kategóriánként rögzített szín a szótárban), tárgy (link a
  részletre, 1 sor, ellipszis), ország · szerző (adminnál; attasénál csak ország),
  kulcsszavak (max 3 chip + „+N”), csatolmány ikon + darabszám. Sor kattintható.
  Üres állapot: rövid szöveg + „Első bejegyzés” gomb. Fejlécben „N bejegyzés”.
- `RiportReszlet.tsx` – fejléc (kategória badge, tárgy, meta: szerző, ország,
  beadás ideje, módosítás ideje ha eltér), leírás, kulcsszó chipek, rendezvény
  adatai (ha van), „Magyarország számára átvehető jó gyakorlat” és „Kapcsolódó
  feladat, kérés” kiemelt kártyákban (csak ha van), csatolmány-lista letöltő
  linkekkel. Jogosultnak „Szerkesztés” gomb és „Törlés” (`AlertDialog`
  megerősítéssel, `deleteRiportAction`).

### Stílus

`KATEGORIAK` tartalmaz egy `szin` mezőt (Tailwind osztálypár badge-hez), nem
kerül új hardcode-olt színtábla a `lib/score.ts`-be. IBM Plex a layout szerint.
Reszponzív: a kategória-rács 3 → 2 → 1 oszlop, a tábla vízszintesen görgethető
konténerben.

## Hibakezelés

- Validációs hiba: mezőnként, magyar üzenettel, űrlap-állapot megmarad
  (fájlok kivételével, jelezve).
- Túl nagy kérés: a kliens előellenőrzés kiszűri; ha mégis 413 jön, az
  `useActionState` hibaágán általános üzenet: „A csatolmányok együtt túl nagyok.”
- Jogosultsági hiba action-ben: általános üzenet, részletek nélkül. Oldalon:
  `notFound()` (nem árulja el, hogy létezik).
- DB hiba: az action elkapja (`unstable_rethrow` után), `{ errors: { form: 'Mentés
  sikertelen, próbáld újra.' } }`, szerver-oldali `console.error`. A `requireSession()`
  és a `redirect()` a `try`-on kívül.

## Ellenőrzés

Nincs tesztkeretrendszer a projektben. Kötelező: `npx tsc --noEmit`,
`npm run build`, `npm run db:migrate` üres DB-n. A manuális forgatókönyv a gstack
headless böngészővel (`~/.claude/skills/gstack/browse/dist/browse`) is végigjárható;
fájlfeltöltéshez az `upload <sel> <file>` parancs. Manuális forgatókönyv:

1. Attasé: beküldés mind a 6 kategóriával; `rendezveny` dátum nélkül → mezőhiba.
2. 0 kulcsszó → hiba; 6. kulcsszó nem választható.
3. 6 fájl → hiba; 9 MB fájl → hiba; `.exe` → hiba.
4. Attasé listája csak a sajátjait mutatja; más bejegyzés URL-je → 404;
   más csatolmányának URL-je → 404.
5. Admin: mindent lát, szűr országra, kategóriára, kulcsszóra, dátumra; a
   szűrők URL-ben megjelennek és újratöltésre megmaradnak.
6. Szerkesztés: mező módosítás, csatolmány törlésre jelölés + új hozzáadás;
   a limit a végösszegre érvényes.
7. Törlés megerősítéssel; a csatolmányok cascade-del tűnnek el.

A `lib/riport-validacio.ts` tiszta függvény: ha később jön tesztelő, elsőként
ezt kell lefedni.
