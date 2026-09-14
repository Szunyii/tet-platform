# Oldalsáv: felhasználói blokk és országprofil-állapot kártya

Dátum: 2026-09-14

## Cél

Az oldalsáv aljáról eltávolított statikus szövegek („Aktív ciklus", „Beadási határidő", demóadat-felirat)
helyére két, valódi tartalom kerül:

1. **Felhasználói blokk** – a fejlécből átköltözik az oldalsáv aljára: avatar (monogram), név,
   szerep · ország, Kijelentkezés gomb. A fejlécben csak a cím + alcím és a ciklusválasztó marad.
2. **Országprofil-állapot kártya** – a választott ciklusra vonatkozó, DB-ből számolt állapot:
   attasénak a saját országa, adminnak az összes ország állapot szerinti darabszáma.

Nem része: bejegyzés-számlálók, ticket-számok (a menü olvasatlan-jelvénye már megvan),
shadcn `Sidebar` átállás.

## Elrendezés

Az oldalsáv (238 px, sötét) fentről: logó-blokk, menü, majd `marginTop: auto`-val az aljához tapadva:

```
├──────────────────────────────┤  1px #232c39 elválasztó
│  Országprofil · 2026         │  állapot-kártya (Server Component, slot)
│  ● Adott évi profil          │  színes pötty ALLAPOT_SZINEK-ből + ALLAPOT_CIMKE
│  Szerkesztés →               │  link (lásd Tartalom)
├──────────────────────────────┤  1px #232c39 elválasztó
│ (KS) Kovács Sára             │  felhasználói blokk (a fejlécből költözik)
│      TéT attasé · Ausztria   │
│              [Kijelentkezés] │  LogoutForm, változatlan
└──────────────────────────────┘
```

A kártya nélkül (attasé ország nélkül) csak a felhasználói blokk jelenik meg.

## Komponensek és felelősségek

### `components/AppShell.tsx` (kliens, meglévő)

- Új prop: `oldalsavAlja?: React.ReactNode`. Az AppShell csak elhelyezi a menü alatt, a
  felhasználói blokk fölött; a tartalmáról nem tud.
- A felhasználói blokk (`ini(user.name)`, `user.name`, `roleLabel`) és a `LogoutForm` a fejlécből
  az oldalsáv aljára kerül. A fejléc jobb oldalán csak a ciklusválasztó `label` marad.
- A `LogoutForm` és az `ini()` nem változik. A hiba-üzenet (`state.error`) a gomb mellett marad,
  a keskeny sávban a form `flexWrap: 'wrap'`-ot kap, hogy ne lógjon ki.
- A NAV, TITLES, useApp() nem változik.

### `app/(app)/components/OldalsavAllapot.tsx` (új, Server Component)

Props: `{ session: AppSession; ev: number; most: number }`. Visszatérés: JSX vagy `null`.

- **Attasé, `session.orszag` nélkül:** `null`.
- **Attasé, országgal:**
  - `utolsoEv = getUtolsoEv(session.orszag, ev)`, `allapot = profilAllapot(utolsoEv, ev)`.
  - Cím: `Országprofil · <ev>`.
  - Sor: pötty `ALLAPOT_SZINEK[allapot]` színnel + `ALLAPOT_CIMKE[allapot]`; ha `allapot === 'elavult'`,
    a felirat után ` · <utolsoEv>`.
  - Link: `canEditProfil(session, session.orszag, ev, most)` igaz → „Szerkesztés" →
    `/orszagprofil/<kod>/szerkesztes`; különben „Megnyitás" → `/orszagprofil/<kod>`.
- **Admin:**
  - `listTerkepAdat(ev)` eredményét `allapot` szerint számolja (`friss`, `elavult`, `nincs`),
    az `ALLAPOTOK` sorrendjében.
  - Cím: `Országprofilok · <ev>`.
  - Három sor: pötty + `ALLAPOT_CIMKE[a]` + darabszám jobbra igazítva.
  - Link: „Térkép" → `/terkep`.
- Stílus: inline style, a sidebar palettájával (`#8d97a5` másodlagos szöveg, `#c3cbd6` cím,
  `#232c39` elválasztó). Az `AllapotBadge` **nem** használható újra: világos háttérre hangolt
  `Badge`, a sötét sávon nem olvasható. A színkonstansok a szótárból jönnek, nincs új hardcode.
- A link `next/link` `Link`, a sidebar menü-linkjeivel azonos színvilágban (`#a3adbb`, hover fehér).

### `app/(app)/layout.tsx` (meglévő)

- A már lekért `session`, `ev`, `most` alapján rendereli `<OldalsavAllapot session={session} ev={ev} most={most} />`-t
  és `oldalsavAlja` propként adja az AppShell-nek.
- Nincs új query-import a layoutban; a kártya importálja a `db/queries/orszagprofil` függvényeket.

## Adatfolyam és frissülés

- A layout minden szerver-renderkor lekéri az állapotot (szinkron SQLite, két kis lekérdezés vagy
  a térkép-adat). Adminnál a `listTerkepAdat(ev)` az összes ország legutóbbi profilját betölti;
  ez ma néhány tucat sor, elfogadható. Ha nő, dedikált `countAllapotok(ev)` query váltja ki.
- Frissülés: a `mentBlokkAction`, a `valasztEvAction` és a felhasználó-műveletek
  `revalidatePath('/', 'layout')`-ot hívnak, ezért mentés, ciklusváltás és ország-átírás után a
  kártya frissül. Kliens-oldali navigációnál a layout nem fut újra – ugyanaz a késés, mint az
  olvasatlan-számlálónál, elfogadott.

## Hibakezelés

Nincs új hibaút. A lekérdezések szinkron hívások; hibánál a layout ugyanúgy hibázik, mint ma a
`countOlvasatlan`-nál. A `session.orszag` validált ISO-kód, ismeretlen kód nem fordulhat elő;
az `orszagNev()` ismeretlen kódra a kódot adja vissza, ez a meglévő viselkedés.

## Jogosultság

A kártya csak olyan adatot mutat, amit a felhasználó egyébként is lát (minden profil olvasható
mindenkinek; a szerkesztés-link csak `canEditProfil` mellett jelenik meg, a védelem továbbra is a
page/action oldalán van).

## Ellenőrzés

1. `npx tsc --noEmit`, `npm run build`.
2. gstack böngésző, attasé-userrel: az oldalsáv alján a kártya a saját országgal, az aktuális évre
   „Szerkesztés" link a szerkesztőre; régebbi ciklusra váltva a jelvény az adott évhez viszonyít és
   „Megnyitás" link van. Profil mentése után a jelvény „Adott évi profil"-ra vált.
3. Admin-userrel: a három darabszám egyezik a térkép „állapot" metrikájának színeivel/számaival
   (kézi összevetés), a „Térkép" link működik.
4. A fejlécben nincs felhasználói blokk; a Kijelentkezés az oldalsávból működik, a hiba-üzenet
   (pl. hálózati hiba) a gomb mellett/alatt látszik.
5. Ország nélküli attasé: a kártya hiányzik, a felhasználói blokk megvan.

## Dokumentáció

- CLAUDE.md „UI shell" bekezdés: az `oldalsavAlja` prop és az `OldalsavAllapot` kártya leírása,
  a felhasználói blokk új helye.
- README `components/AppShell.tsx` sora: sidebar (menü, állapot-kártya, felhasználó, kijelentkezés),
  fejléc (cím, ciklusválasztó).

## Eltérések a megvalósításban (a review-k után)

- A `LogoutForm` a keskeny sávhoz igazodott (`flexWrap`, teljes szélességű gomb, világos-piros hiba a gomb fölött) – a „nem változik" a viselkedésre igaz, a stílusra nem.
- Az `<aside>` `overflowY: auto`: alacsony ablaknál a Kijelentkezés gomb elérhető marad (a fix `100vh` sáv korábban nem görgetett).
- Akadálymentesség: a link nyila és az avatar-monogram `aria-hidden`.
- A kártya linkjének nincs hover-állapota (inline `color`, mint a menü linkjeinél); a „hover fehér" nem teljesül, a meglévő sidebar-konvencióval egyezik.
- `getUtolsoEv` és `listTerkepAdat` React `cache()`-ben (`db/queries/orszagprofil.ts`): a layout és a page kérésenként kétszer hívta azonos argumentummal.
- A layout fejléc-kommentje az állapot-kártyát is felsorolja a késhető elemek között.
