# Kommunikáció – ticketek és üzenetszálak – tervezési spec

Dátum: 2026-09-09
Állapot: jóváhagyva

## Cél

A `/kommunikacio` képernyő valódi, adatbázisra épülő működése. Az NIÜ admin egy adott
TéT attasénak (posztnak) adott témában **ticketet** nyit (típus, prioritás, határidő,
tárgy, első üzenet); minden ticketnek saját beszélgetés-felülete van, ahol az admin és
a címzett attasé üzeneteket vált. Az elrendezés a mostani demót követi: bal oldalt a
ticketlista szűrőkkel, középen a kiválasztott beszélgetés, jobb oldalt az adatlap.

A demó `TICKETS` / `TICKET_TYPES` adatai kikerülnek a `lib/data.ts`-ből, és az
`AppShell` menü-számlálója is a DB-ből számol.

## Döntések

| Kérdés | Döntés | Indok |
| --- | --- | --- |
| Ki nyithat ticketet | Csak admin | A kérés szerint az admin ír kérést az attasénak; az attasé válaszol. |
| Ticket mezők | Típus + prioritás + opcionális határidő | Mint a demóban; a lista ez alapján szűrhető és jelez. |
| Státusz | Automatikus a legutolsó üzenet küldője szerint, admin zár le / nyit újra | Nincs kézi állapotgép, mégis látszik, kin a labda. |
| Olvasatlan-jelzés | Igen, felhasználónként „utoljára megnézve” időbélyeggel | Egyszerű, és a menü-számlálónak is ez az alapja. |
| Csatolmány | Nincs, csak szöveg | Első verzió; a riport-csatolmány mintája később átvehető. |
| Felépítés | Egyoldalas master-detail, `?t=<id>` URL-lel, Server Component + server action-ök | A demó élményét adja, nincs új függőség, a riport-minta újrahasználható. |
| Láthatóság | Attasé: ahol ő a címzett; admin: mind | Belső rendszer; több admin ugyanazt látja és bármelyik válaszolhat. |
| Szótárak (típus, prioritás, státusz) | Kódban, `lib/ticket-szotar.ts` | Admin-szerkesztés nem kért (YAGNI). |

## Előfeltételek (kész, a `main`-en)

- `lib/session.ts`: `requireSession()` / `requireAdmin()`, `AppSession`
  (`userId`, `name`, `email`, `role`, `orszag`). Mindig `await`, soha `try/catch`-en belül.
- Form-minta `components/form/`: `useMuveletForm`, `MezoHiba`, `hibaAttr`, `MuveletState`,
  `FormAction`. Szövegtisztítás `lib/urlap.ts` (`mezo`, `tisztitSzoveg`, `MezoHibak`).
- Dátum: `lib/datum.ts` (`ervenyesNaptariDatum`, `formatNaptariDatum`, `formatDatum`).
- Felhasználó-lista: `db/queries/felhasznalo.ts` `listFelhasznalok()` (`szerepkor`,
  `orszag`, `tiltott`).
- shadcn komponensek: `badge`, `button`, `card`, `dialog`, `input`, `label`, `select`,
  `textarea`, `separator`, `alert-dialog`, `sonner`, `tabs`.

## Hatókörön kívül

- Attasé által nyitott ticket. Csatolmány. Valós idejű frissítés / polling.
- E-mail értesítés. Ticket szerkesztése (tárgy, prioritás, határidő módosítása) nyitás után.
- Ticket törlése. Üzenet szerkesztése vagy törlése.
- Attasé posztváltásakor a ticket a címzett usernél marad, az `orszag` pillanatkép nem
  változik (mint a riportnál).

## Szótár (`lib/ticket-szotar.ts`)

Tiszta modul (nincs React, nincs DB).

```ts
export const TIPUSOK = {
  adatkeres: { nev: 'Adatkérés' },
  feladat: { nev: 'Feladatkiosztás' },
  riport_visszajelzes: { nev: 'Riport-visszajelzés' },
  egyeztetes: { nev: 'Egyeztetés' },
} as const;
export type TipusKulcs = keyof typeof TIPUSOK;

export const PRIORITASOK = {
  magas: { nev: 'Magas', sorrend: 0 },
  kozepes: { nev: 'Közepes', sorrend: 1 },
  alacsony: { nev: 'Alacsony', sorrend: 2 },
} as const;
export type PrioKulcs = keyof typeof PRIORITASOK;

export const STATUSZOK = {
  nyitott: { nev: 'Nyitott' },
  valaszra_var: { nev: 'Válaszra vár' },   // az attasé következik
  folyamatban: { nev: 'Folyamatban' },     // az attasé válaszolt, az NIÜ következik
  lezart: { nev: 'Lezárt' },
} as const;
export type StatuszKulcs = keyof typeof STATUSZOK;

export const TARGY_MAX = 200;
export const UZENET_MAX = 4000;
```

Típusőrök: `isTipusKulcs`, `isPrioKulcs`. A badge-színek a komponensben (Tailwind
osztályok), nem a szótárban, mint a riport `KategoriaBadge`-nél.

## Adatmodell (`db/schema/ticket.ts`)

Három tábla, a `db/schema/index.ts`-ből re-exportálva, migráció `npm run db:generate`.

```ts
export const ticket = sqliteTable('ticket', {
  id: text('id').primaryKey(),
  targy: text('targy').notNull(),
  tipus: text('tipus').notNull(),               // TipusKulcs
  prio: text('prio').notNull(),                 // PrioKulcs
  hatarido: text('hatarido'),                   // 'YYYY-MM-DD' vagy null
  statusz: text('statusz').notNull(),           // StatuszKulcs
  cimzettId: text('cimzett_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  orszag: text('orszag').notNull(),             // a címzett országa nyitáskor (pillanatkép)
  nyitoId: text('nyito_id').references(() => user.id, { onDelete: 'set null' }),
  createdAt, updatedAt,                         // mint a riportnál (timestamp_ms, $onUpdate)
  lezarvaAt: integer('lezarva_at', { mode: 'timestamp_ms' }),
}, (t) => [
  index('ticket_cimzett_idx').on(t.cimzettId),
  index('ticket_statusz_idx').on(t.statusz),
  index('ticket_updated_idx').on(t.updatedAt),
]);

export const ticketUzenet = sqliteTable('ticket_uzenet', {
  id: text('id').primaryKey(),
  ticketId: text('ticket_id').notNull().references(() => ticket.id, { onDelete: 'cascade' }),
  szerzoId: text('szerzo_id').references(() => user.id, { onDelete: 'set null' }),
  szerzoNev: text('szerzo_nev').notNull(),      // pillanatkép: törölt user után is olvasható
  szerzoSzerep: text('szerzo_szerep').notNull(), // 'admin' | 'attase' – a buborék oldalához
  szoveg: text('szoveg').notNull(),
  createdAt,
}, (t) => [index('ticket_uzenet_ticket_idx').on(t.ticketId, t.createdAt)]);

export const ticketOlvasas = sqliteTable('ticket_olvasas', {
  ticketId: text('ticket_id').notNull().references(() => ticket.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  latottAt: integer('latott_at', { mode: 'timestamp_ms' }).notNull(),
}, (t) => [primaryKey({ columns: [t.ticketId, t.userId] })]);
```

Megjegyzések:

- A nyitó kérés szövege az első `ticket_uzenet` sor; a ticketnek nincs külön „leírás” mezője.
- Az `updatedAt` minden új üzenetnél és státuszváltásnál frissül; a lista ez szerint
  rendez (legfrissebb elöl).
- A `szerzoSzerep` pillanatkép: az „own” oldal a néző szerepéhez képest dől el
  (admin nézőnek az admin-üzenetek a sajátok, attasénak az attasé-üzenetek), így két admin
  ugyanazt a beszélgetést azonos oldalon látja.
- A címzett user törlése viszi a ticketet (cascade), ahogy a riportjait is; a felhasználó
  törlés-dialógusa ezt is jelezze.

## Szerver réteg

### `db/queries/ticket.ts` (`server-only`, szinkron better-sqlite3)

```ts
export interface TicketFilter { cimzettId?: string; szuro: 'aktiv' | 'magas' | 'mind' }
export interface TicketListItem {
  id; targy; tipus; prio; hatarido; statusz; orszag;
  cimzettNev: string; uzenetSzam: number; updatedAt: Date;
  olvasatlan: boolean;   // a nézőhöz képest: van üzenet a másik szereptől latottAt után
}
export interface TicketDetail extends TicketListItem {
  cimzettId; nyitoNev: string | null; createdAt: Date; lezarvaAt: Date | null;
  uzenetek: { id; szerzoNev; szerzoSzerep; szoveg; createdAt: Date }[];
}

listTicketek(nezo: { userId; role }, filter): TicketListItem[]
getTicket(id, nezo): TicketDetail | null
createTicket(input: { targy; tipus; prio; hatarido; cimzettId; orszag; nyitoId; nyito: { nev; szerep }; szoveg }): string
addUzenet(ticketId, szerzo: { id; nev; szerep }, szoveg): void   // tranzakcióban: insert + statusz + updatedAt
setStatusz(ticketId, statusz, lezarvaAt: Date | null): void
jelolOlvasottnak(ticketId, userId, mikor = new Date()): void      // upsert
countOlvasatlan(nezo): number                                     // olvasatlan TICKETEK száma (nem üzeneteké)
```

- `aktiv` = `statusz != 'lezart'`; `magas` = `prio = 'magas'` és aktív; `mind` = minden.
- Az `olvasatlan` egy korrelált `EXISTS`: van-e a néző szerepétől eltérő szereptől származó
  üzenet a néző `latottAt`-ja után (`latottAt` hiányában bármely ilyen üzenet). Következmény:
  két admin közül az egyik válasza a másiknak nem olvasatlan (szerep-alapú, nem user-alapú),
  ez elfogadott.
- `addUzenet` állítja a státuszt: admin küldő → `valaszra_var`, attasé küldő → `folyamatban`.
  Lezárt ticketre nem hívható (az action ellenőrzi, a query dob).
- Újranyitás (`setStatusz`): a legutolsó üzenet küldője szerinti állapot (`valaszra_var`
  vagy `folyamatban`); ha csak a nyitó üzenet van, `nyitott`.

### `lib/ticket-validacio.ts`

Tiszta validátor a `lib/urlap.ts` alapján, hibák `MezoHibak` alakban, kulcs = mező id.

- `parseUjTicketForm(fd, cimzettek: { id; orszag }[])` → `{ ok, data }` vagy `{ ok: false, errors }`:
  `cimzettId` (létező, nem tiltott attasé országgal), `tipus`, `prio`, `hatarido`
  (üres vagy `ervenyesNaptariDatum`), `targy` (1–`TARGY_MAX`), `szoveg` (1–`UZENET_MAX`).
- `parseUzenetForm(fd)` → `szoveg` (1–`UZENET_MAX`).

### `lib/ticket-jog.ts`

```ts
canViewTicket(session, t: { cimzettId }): boolean   // admin vagy címzett
canWriteTicket(session, t: { cimzettId; statusz }): boolean // canView && statusz !== 'lezart'
canManageTicket(session): boolean                    // admin (nyitás, lezárás, újranyitás)
```

### Server actions (`app/(app)/kommunikacio/actions.ts`)

Minden action: `requireSession()` a `try`-on kívül, validálás, jog, `try { query } catch
{ unstable_rethrow; log; { errors: { form } } }`, `revalidatePath('/kommunikacio')`.

- `createTicketAction(_prev, fd)` – `requireAdmin()`; a címzett-listát a validátornak a
  `listFelhasznalok()`-ból adja (`szerepkor === 'attase' && !tiltott && orszag`). Siker:
  `redirect('/kommunikacio?t=' + id)`.
- `sendUzenetAction(ticketId, _prev, fd)` – bind-olt; `getTicket` + `canWriteTicket`,
  különben `{ errors: { form: 'Nincs jogosultságod ehhez a tickethez.' } }` (nem árul el
  létezést, a szöveg azonos a hiányzó ticketnél is). Siker: `{ ok: true }`, a kliens üríti
  a mezőt; a page újrarenderel a `revalidatePath` miatt.
- `closeTicketAction(ticketId)` / `reopenTicketAction(ticketId)` – `requireAdmin()`;
  kliensből hívott, bind-olt action, `MuveletState`-et ad vissza; hibánál toast.

### Olvasottság

A page rendereléskor, ha van kiválasztott és megtekinthető ticket, `jelolOlvasottnak`-ot
hív a session userre. Ez szándékos írás renderelés közben (better-sqlite3, szinkron,
egy upsert); a Next ezt engedi Server Componentben, és mivel idempotens upsert, a dev-módú
dupla renderelés sem okoz gondot.
Az `AppShell` menü-számlálója a layoutból kapott `olvasatlan` prop (`countOlvasatlan`);
kliens-oldali navigációnál a layout nem fut újra, ezért a számláló a következő teljes
betöltésig vagy `revalidatePath('/', 'layout')`-ig állhat: az action-ök a
`/kommunikacio` mellett a layoutot is revalidálják.

## UI

### Route

`app/(app)/kommunikacio/page.tsx` – Server Component, `searchParams`: `t` (ticket id),
`sz` (`aktiv` | `magas` | `mind`, alapértelmezés `aktiv`). Lépések: `requireSession` →
`listTicketek` → kiválasztott = `t` ha a listában van (vagy `getTicket` + `canViewTicket`,
ha a szűrő kiszűrte), különben a lista első eleme → `jelolOlvasottnak` → render. Idegen
vagy nem létező `t`: nincs 404, egyszerűen a lista első eleme jelenik meg (a lista URL-e
nem érzékeny). Admin esetén a Dialoghoz a címzett-jelöltek listája is itt készül.

`metadata`: statikus „Kommunikáció”.

### Komponensek (`app/(app)/kommunikacio/components/`, route-specifikusak)

- `TicketLista` – szűrő-gombok (`Link` a `?sz=` paraméterrel, a `?t=` megtartásával),
  lista: prioritás szerinti bal szegély-szín, típus `Badge`, határidő (lejárt és aktív →
  piros), tárgy, alsó sor (`orszag · cimzettNev · N üzenet`; attasénak csak `N üzenet`),
  olvasatlan pötty + félkövér tárgy. Aktív elem kiemelve. Üres állapot szöveg.
- `TicketBeszelgetes` (`'use client'`) – fejléc (státusz `Badge`, tárgy, poszt, nyitva
  mióta `formatDatum`-mal), üzenetek (`UzenetBuborek`: saját oldal jobbra, monogram-kör,
  név + szerep címke + idő), alul `UzenetUrlap`; lezárt ticketnél az űrlap helyett
  „A ticket lezárva, {dátum}.” sor. Új üzenet után az üzenetlista aljára görget.
- `UzenetUrlap` (`'use client'`) – vezérelt `Textarea`, Ctrl/Cmd+Enter küld,
  `useMuveletForm` a bind-olt `sendUzenetAction`-nel, siker után ürít; `MezoHiba`.
- `TicketAdatlap` – típus, prioritás, státusz, határidő, érintett poszt, nyitotta, nyitva;
  admin gombok: „Lezárás” (`AlertDialog` megerősítés) / „Újranyitás”; `TicketStatuszGomb`
  kliens komponens a bind-olt action-nel és toasttal.
- `UjTicketDialog` (`'use client'`, csak admin) – `Dialog`, mezők: címzett (`Select`,
  felirat `Név · Ország`), típus, prioritás (alapértelmezés `kozepes`), határidő
  (`type="date"`), tárgy, első üzenet; `useMuveletForm` + `createTicketAction`;
  a `redirect` `unstable_rethrow`-val megy át.
- `TicketBadge`-ek (`StatuszBadge`, `PrioJelzes`, `TipusBadge`) – egy fájlban,
  Tailwind-osztályokkal.

Elrendezés: `grid` három oszlopban (`[22rem_minmax(0,1fr)_17rem]`), `lg` alatt egymás
alá tördelve; a lista és az üzenetsáv saját `overflow-auto`. Minden shadcn + Tailwind;
a régi `.card`, `.tag`, `.btn`, `.input` osztályok és inline `style`-ok kikerülnek erről
az oldalról.

### AppShell

- `AppShell` új propja: `olvasatlan: number`; a Kommunikáció menüpont számlálója ebből,
  0-nál nem jelenik meg. A `TICKETS` import törlődik.
- `app/(app)/layout.tsx`: `countOlvasatlan(session)` és átadás.

## Hibakezelés

- Validációs hibák mezőnként (`MezoHibak`), fókusz az első hibás mezőre (`useMuveletForm`).
- Jogosultság: page-en nincs 404 (idegen `t` → első elem); action-ökben egységes
  űrlap-szintű hiba, létezést nem árul el. Admin-only action nem admintól: `requireAdmin()`
  404-e (a `notFound()` action-ben a Next 404-oldalt adja; ez elfogadott, a kliens ilyet
  normál használatban nem hív).
- Lezárt ticketbe küldés (pl. két fülön): `canWriteTicket` hamis → „A ticket le van zárva.”
- DB-hiba: `console.error` + „Mentés sikertelen, próbáld újra.”
- Nincs egyetlen ticket sem: üres állapot mindhárom panelben (admin: „Nyiss egy ticketet”,
  attasé: „Még nincs hozzád címzett ticket.”).

## Ellenőrzés

- `npx tsc --noEmit`, `npm run build`.
- `npm run db:generate` → új migráció a `drizzle/` alatt, `npm run db:migrate` a lokális DB-n.
- Headless böngésző (gstack `browse`) adminnal és a két teszt attaséval:
  1. admin nyit ticketet Dél-Koreának → `?t=<id>`, státusz Nyitott, a lista első eleme;
  2. `teszt.attase` belép: menü-számláló 1, pötty a listán; megnyitja → pötty eltűnik;
     válaszol → státusz Folyamatban; admin oldalon olvasatlan;
  3. `masodik.attase` nem látja a ticketet (üres lista), és a bind-olt `sendUzenetAction`
     idegen id-vel hibát ad;
  4. admin válaszol → Válaszra vár; lezár → Lezárt, űrlap eltűnik, attasé sem tud írni;
     újranyit → Válaszra vár;
  5. szűrők: Aktív / Magas prioritás / Mind; lejárt határidő piros;
  6. validáció: üres tárgy, 201 karakteres tárgy, rossz dátum, üres üzenet.
- README „Ismert korlátok”: nincs polling (frissítés küldéskor / újratöltéskor), a
  menü-számláló kliens-navigációnál késhet, ticket nem szerkeszthető nyitás után.
