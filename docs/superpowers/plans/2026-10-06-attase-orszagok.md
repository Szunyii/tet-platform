# Attasé–ország hozzárendelés – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Egy országban több attasé (közülük egy relációs vezető = országprofil-felelős, attasénként város és részterület), és egy attasé regionálisan több országot is lefedhet; a felhasználó-kezelő, a jogosultság és minden ország-függő felület erre áll át.

**Architecture:** Új `attase_orszag` kapcsolótábla (felhasználó × ország, `szekhely`, `vezeto`, `varos`, `reszterulet`, részleges egyedi indexekkel), a szabályok a `db/queries/attase-orszag.ts`-ben, a tiszta típusok/segédek a `lib/attase-orszag.ts`-ben. „Expand → migrate → contract”: előbb az új tábla + adatmásolás (0006), a fogyasztók egyenként átállnak, végül a régi `user` oszlopok törlése (0007). A poszt-adatok (főváros, terület, pénznem) az országprofil Alapadatok blokkjába költöznek.

**Tech Stack:** Next.js 16 (App Router, Server Actions), React 19, TypeScript 7, drizzle-orm 0.45 + drizzle-kit 0.31 + better-sqlite3 (SQLite 3.53), Better Auth 1.7 admin plugin, shadcn/ui v4 (base-nova), Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-10-06-attase-orszagok-design.md`.

**Ellenőrzés:** Nincs tesztkeretrendszer. A tiszta logikát eldobható assert-scriptek ellenőrzik (`scripts/_*.ts`, `node:assert/strict`, a task végén törlendők, **nem commitolandók**) – előbb a script (bukik), utána az implementáció (zöld). Minden task végén `npx tsc --noEmit`. A `db/queries/*` `server-only`: az őket importáló script `NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_x.ts`. DB-t módosító ellenőrzés mindig a demó DB **másolatán** fut: `T=$(mktemp -d) && sqlite3 data/tet.db ".backup '$T/t.db'"` (a `.backup` a WAL-t is konzisztensen menti), majd `DATABASE_URL="$T/t.db"`. A UI-t a gstack headless böngésző ellenőrzi (`~/.claude/skills/gstack/browse/dist/browse goto/fill/click/text/js/snapshot -i/console --errors`).

**Környezet:** A felhasználó dev szervere a 3000-en futhat: **nem szabad leállítani/újraindítani**; subagent nem indít saját dev szervert (ha nem fut, szólj a controllernek). A `data/tet.db` a repóban van: a migrációk és a demó-script ezt módosítják, de **csak a 15. task commitolja** (addig `git add` mindig konkrét fájlokkal, soha `-A`/`.`). Seed admin `admin@niu.hu`, jelszava a `.env.local` `SEED_ADMIN_PASSWORD`-je – olvasd ki, ne írd ki. Commit üzenetek magyarul, `feat|fix|docs|chore(attase-orszagok): …`, a végén üres sor után: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Reviewer subagent: csak olvasó git (tilos checkout/reset/stash).

**Fontos tények (ellenőrizve 2026-10-06):**
- drizzle-kit 0.31 SQLite-on az oszloptörlést `ALTER TABLE \`user\` DROP COLUMN …`-nal generálja (nem táblaújraépítéssel); a better-sqlite3 SQLite-ja 3.53, támogatja.
- A részleges index `uniqueIndex(...).on(t.orszagKod).where(sql\`${t.vezeto} = 1\`)` SQL-je `WHERE "attase_orszag"."vezeto" = 1`; a demó DB másolatán kipróbálva működik, és a második vezetőt/székhelyet `UNIQUE constraint failed`-del elutasítja.
- A Better Auth `auth.api.createUser` visszatérése `{ user: UserWithRole }` → `const { user: uj } = await auth.api.createUser(...)`.
- `lib/urlap.ts` `mezo()` a sortörést megtartja (CRLF → LF), a többi vezérlőkaraktert szűri.
- `components/ui/`-ban nincs checkbox: natív `<input type="checkbox">` (bejelölve `on` értéket küld; a `disabled` nem küldődik be).
- `useMuveletForm` a hibakulcsokat `#${CSS.escape(k)}`-val keresi → a pontos id-k (`szekhely.orszag`, `regio.0.orszag`) működnek.
- `Button` méretek: `sm`, `icon-sm` léteznek; a `CardDescription` egy `div`; `formatSzam(n, utotag)` a `lib/szam.ts`-ben.
- FK-k: `riport.szerzo_id`, `ticket.cimzett_id`, `ticket_olvasas.user_id` → `cascade`; `ticket.nyito_id`, `ticket_uzenet.szerzo_id`, `orszagprofil.szerzo_id` → `set null`. A `db/index.ts` `foreign_keys = ON`.
- `db.transaction((tx) => …)` szinkron; a `tx` típusa `Parameters<Parameters<typeof db.transaction>[0]>[0]`.

---

## Fájlszerkezet

| Fájl | Művelet | Felelősség | Task |
| --- | --- | --- | --- |
| `lib/attase-orszag.ts` | létrehoz | típusok, korlátok, tiszta segédek (rendezés, feliratok, vezető-helyzet/súgó, figyelmeztetés) | 1 |
| `lib/orszagok.ts` | módosít | PR, VI, MV + fejléc-komment | 1 |
| `db/schema/attase-orszag.ts`, `db/schema/index.ts` | létrehoz / módosít | `attase_orszag` tábla | 2 |
| `drizzle/0006_attase_orszag.sql` + `meta/` | generál + kézi adatlépések | tábla, indexek, adatmásolás | 2 |
| `db/queries/attase-orszag.ts` | létrehoz | lekérdezések, `setAttaseOrszagok`, `normalizalVezetok` | 2 |
| `lib/session.ts`, `lib/orszagprofil-jog.ts` | módosít | `AppSession.orszagok`, vezető-szabály | 3 |
| `lib/orszagprofil-szotar.ts`, `lib/orszagprofil-validacio.ts`, `app/(app)/orszagprofil/components/mezok/AlapadatokMezok.tsx`, `components/orszagprofil/BlokkNezet.tsx` | módosít | Alapadatok: főváros, terület, pénznem | 4 |
| `components/orszagprofil/AttaseLista.tsx` | létrehoz | profil fejléc attasé-listája | 5 |
| `app/(app)/orszagprofil/[kod]/page.tsx`, `db/queries/orszagprofil.ts` | módosít | fejléc; `getAttaseNev` ki | 5 |
| `db/queries/orszagprofil.ts`, `app/(app)/terkep/components/{TerkepTooltip,ProfilKivonat,OsszehasonlitasPanel,TerkepNezet}.tsx` | módosít | `TerkepOrszag.attasek`, tooltip, kivonat, tábla, saját gomb | 6 |
| `app/(app)/components/OldalsavAllapot.tsx`, `components/AppShell.tsx` | módosít | országonkénti kártya-sorok, „+N” felirat | 7 |
| `components/riport/RiportForm.tsx`, `app/(app)/uj-riport/{page,actions}.ts(x)` | módosít | ország-választó | 8 |
| `db/queries/ticket.ts`, `app/(app)/kommunikacio/components/UjTicketDialog.tsx` | módosít | címzett = székhely | 9 |
| `app/(app)/felhasznalok/components/{Blokk,ElerhetosegMezok,VezetoJelolo,OrszagMezok}.tsx` | létrehoz | új dialógus-blokkok | 10 |
| `lib/felhasznalo-validacio.ts`, `db/queries/felhasznalo.ts`, `app/(app)/felhasznalok/{actions.ts,page.tsx}`, `components/{UjFelhasznaloDialog,SzerkesztesDialog,FelhasznaloTabla,FelhasznaloMuveletek,VezetoFigyelmeztetes}.tsx`, `components/form/MuveletDialog.tsx` | módosít / létrehoz | bekötés; `AttaseMezok.tsx` törlés | 11 |
| `db/schema/auth.ts`, `lib/auth.ts`, `lib/session.ts`, `drizzle/0007_*.sql`, `scripts/{orszag-kod-migracio,demo-orszagprofil}.ts` | módosít / generál | régi oszlopok és mezők törlése | 12 |
| `scripts/demo-attasek.ts`, `.env.example` | létrehoz / módosít | 15 demó attasé | 13 |
| `CLAUDE.md`, `README.md`, a spec | módosít | dokumentáció | 14 |
| `data/tet.db` | commit | a migrált, demó-adatos DB | 15 |

---

### Task 0: Branch

- [ ] **Step 1: Branch a main-ről**

```bash
git status --short   # csak a data/tet.db lehet módosult – más ne legyen
git checkout -b attase-orszagok
```

---

### Task 1: `lib/attase-orszag.ts` és az országszótár bővítése

**Files:**
- Create: `lib/attase-orszag.ts`
- Modify: `lib/orszagok.ts`
- Test (eldobható): `scripts/_attase-orszag-check.ts`

- [ ] **Step 1: A bukó ellenőrző script**

`scripts/_attase-orszag-check.ts`:

```ts
import assert from 'node:assert/strict';
import { ORSZAGOK, orszagByKod } from '../lib/orszagok';
import {
  alapVezeto, attaseFelirat, attasekRovid, elsoVezetettKod, orszagonkent, rendezAttasek, rendezOrszagok,
  szekhelyKod, vezetoHelyzet, vezetoNelkuliOrszagok, vezetoSugo, type OrszagAttase,
} from '../lib/attase-orszag';

// Szótár: az új kódok megvannak, a lista magyar név szerint rendezett, a kódok egyediek.
for (const k of ['PR', 'VI', 'MV']) assert.ok(orszagByKod(k), k);
assert.equal(orszagByKod('PR')?.geo, 'Puerto Rico');
assert.equal(orszagByKod('VI')?.geo, '');
assert.equal(orszagByKod('MV')?.geo, '');
const nevek = ORSZAGOK.map((o) => o.nev);
assert.deepEqual(nevek, [...nevek].sort((a, b) => a.localeCompare(b, 'hu')));
assert.equal(new Set(ORSZAGOK.map((o) => o.kod)).size, ORSZAGOK.length);

// Rendezés: székhely elöl, utána magyar név szerint; saját gomb célja.
const o = rendezOrszagok([
  { kod: 'TN', szekhely: false, vezeto: true },
  { kod: 'FR', szekhely: true, vezeto: false },
  { kod: 'DZ', szekhely: false, vezeto: true },
]);
assert.deepEqual(o.map((x) => x.kod), ['FR', 'DZ', 'TN']);
assert.equal(szekhelyKod(o), 'FR');
assert.equal(elsoVezetettKod(o), 'DZ');
assert.equal(elsoVezetettKod([{ kod: 'DZ', szekhely: false, vezeto: true }, { kod: 'FR', szekhely: true, vezeto: true }]), 'FR');
assert.equal(elsoVezetettKod([{ kod: 'FR', szekhely: true, vezeto: false }]), null);

// Attasék sorrendje (vezető, székhelyesek, régiósak; név szerint) és feliratok.
const a = (nev: string, vezeto: boolean, szekhely: string | null, varos: string | null): OrszagAttase =>
  ({ userId: nev, nev, vezeto, szekhelyKod: szekhely, varos, reszterulet: null });
const de = rendezAttasek('DE', [
  a('Komma Krisztián', false, 'DE', 'Stuttgart'),
  a('Zéta Zoltán', false, 'AT', 'Bécs'),
  a('Kindert Judit', true, 'DE', 'Berlin'),
  a('dr. Gurza László', false, 'DE', 'München'),
]);
assert.deepEqual(de.map((x) => x.nev), ['Kindert Judit', 'dr. Gurza László', 'Komma Krisztián', 'Zéta Zoltán']);
assert.equal(attaseFelirat(de[0], 'DE'), 'Kindert Judit · Berlin');
assert.equal(attaseFelirat(de[3], 'DE'), 'Zéta Zoltán · regionálisan (Bécs)');
assert.equal(attaseFelirat(a('X', false, 'FR', null), 'DZ'), 'X · regionálisan (Franciaország)');
assert.equal(attaseFelirat(a('Y', false, 'DE', null), 'DE'), 'Y');
assert.equal(attasekRovid(de, 'DE'), 'Kindert Judit · Berlin +3 attasé');
assert.equal(attasekRovid([de[0]], 'DE'), 'Kindert Judit · Berlin');
assert.equal(attasekRovid([], 'DE'), null);

// Felhasználó-kezelő: országonkénti tagok, figyelmeztetés, vezető-helyzet és súgó.
const m = orszagonkent([
  { id: 'u1', nev: 'Kindert Judit', tiltott: false, orszagok: [{ kod: 'DE', vezeto: true }] },
  { id: 'u2', nev: 'Komma Krisztián', tiltott: false, orszagok: [{ kod: 'DE', vezeto: false }] },
  { id: 'u3', nev: 'Nagy Gabriella', tiltott: true, orszagok: [{ kod: 'US', vezeto: true }, { kod: 'CA', vezeto: true }] },
  { id: 'u4', nev: 'Mészáros Eleonóra', tiltott: false, orszagok: [{ kod: 'US', vezeto: false }] },
  { id: 'u5', nev: 'Alfa', tiltott: false, orszagok: [{ kod: 'GB', vezeto: false }] },
  { id: 'u6', nev: 'Béta', tiltott: false, orszagok: [{ kod: 'GB', vezeto: false }] },
]);
// A csupa tiltott attasés CA kimarad (nincs kire átadni a vezetést).
assert.deepEqual(vezetoNelkuliOrszagok(m), [
  { kod: 'US', aktivDb: 1, vezetoTiltott: true },
  { kod: 'GB', aktivDb: 2, vezetoTiltott: false },
]);
const hUj = vezetoHelyzet('DE', null, m);
assert.deepEqual(hUj, { masok: 2, masikVezeto: { nev: 'Kindert Judit', tiltott: false }, sajatVezeto: false });
assert.equal(alapVezeto(hUj), false);
assert.equal(vezetoSugo(hUj, false), 'Jelenlegi vezető: Kindert Judit.');
assert.equal(vezetoSugo(hUj, true), 'Mentéskor ő lesz a relációs vezető (jelenleg: Kindert Judit).');
const hKindert = vezetoHelyzet('DE', 'u1', m);
assert.deepEqual(hKindert, { masok: 1, masikVezeto: null, sajatVezeto: true });
assert.equal(alapVezeto(hKindert), true);
assert.equal(vezetoSugo(hKindert, true), null);
assert.equal(vezetoSugo(hKindert, false), 'Kikapcsolva nem marad vezető – jelölj ki mást.');
const hEgyedul = vezetoHelyzet('AT', null, m);
assert.equal(hEgyedul.masok, 0);
assert.equal(alapVezeto(hEgyedul), true);
assert.equal(vezetoSugo(hEgyedul, true), 'Egyedüli attasé – automatikusan vezető.');
assert.equal(vezetoSugo(vezetoHelyzet('GB', null, m), true), 'Nincs kijelölt vezető.');
assert.equal(vezetoSugo(vezetoHelyzet('US', 'u4', m), false), 'Jelenlegi vezető: Nagy Gabriella (tiltott).');
console.log('attase-orszag: minden ellenőrzés rendben');
```

- [ ] **Step 2: Futtasd – bukjon**

Run: `npx tsx scripts/_attase-orszag-check.ts`
Expected: FAIL (`Cannot find module '../lib/attase-orszag'`).

- [ ] **Step 3: `lib/attase-orszag.ts`**

```ts
/**
 * Attasé–ország hozzárendelés: típusok, korlátok és tiszta segédek (nincs React, nincs DB).
 * Egy attasénak pontosan egy székhelye van (a poszt országa és városa, opcionális
 * részterülettel – pl. a lefedett tartományok listája), és regionálisan további országokat
 * fedhet le. Országonként legfeljebb egy relációs vezető van: ő az országprofil felelőse és –
 * az adminon kívül – egyedüli szerkesztője. A DB-szabályokat a db/queries/attase-orszag.ts
 * tartja (setAttaseOrszagok, normalizalVezetok).
 */
import { orszagNev } from './orszagok';

export const VAROS_MAX = 100;
export const RESZTERULET_MAX = 1000;
export const REGIO_MAX = 20;

/** Egy hozzárendelés (a validátor kimenete, a felhasználó-lista sora). A város és a részterület csak a székhelynél töltött. */
export interface AttaseOrszag {
  kod: string;
  szekhely: boolean;
  vezeto: boolean;
  varos: string | null;
  reszterulet: string | null;
}

/** A session hozzárendelései (jogosultság és megjelenítés). */
export type SessionOrszag = Pick<AttaseOrszag, 'kod' | 'szekhely' | 'vezeto'>;

/** Egy ország egy aktív attaséja (profil fejléc, térkép). Régiós, ha a székhelye másik ország. */
export interface OrszagAttase {
  userId: string;
  nev: string;
  vezeto: boolean;
  /** Az attasé székhely-országa; null csak hibás (székhely nélküli) adatnál. */
  szekhelyKod: string | null;
  /** A székhely (a poszt) városa. */
  varos: string | null;
  /** Az országon belüli részterület – csak ha ez az ország a székhelye. */
  reszterulet: string | null;
}

/** Székhely elöl, utána magyar országnév szerint. */
export function rendezOrszagok<T extends { kod: string; szekhely: boolean }>(lista: readonly T[]): T[] {
  return [...lista].sort(
    (a, b) => Number(b.szekhely) - Number(a.szekhely) || orszagNev(a.kod).localeCompare(orszagNev(b.kod), 'hu'),
  );
}

/** A székhely-ország kódja, vagy null. */
export function szekhelyKod(orszagok: readonly { kod: string; szekhely: boolean }[]): string | null {
  return orszagok.find((o) => o.szekhely)?.kod ?? null;
}

/** A „Saját országprofil” célja: a székhely, ha ott vezető, különben az első vezetett ország; null, ha egyiknek sem vezetője. */
export function elsoVezetettKod(orszagok: readonly SessionOrszag[]): string | null {
  return rendezOrszagok(orszagok).find((o) => o.vezeto)?.kod ?? null;
}

/** Régiósan fedi-e le az attasé az adott országot (a székhelye máshol van). */
export function regionalisE(a: Pick<OrszagAttase, 'szekhelyKod'>, kod: string): boolean {
  return a.szekhelyKod !== null && a.szekhelyKod !== kod;
}

/** Vezető elöl, utána akiknek ez a székhelye, végül a régiósak; csoporton belül név szerint. */
export function rendezAttasek(kod: string, lista: readonly OrszagAttase[]): OrszagAttase[] {
  const rang = (a: OrszagAttase) => (a.vezeto ? 0 : regionalisE(a, kod) ? 2 : 1);
  return [...lista].sort((a, b) => rang(a) - rang(b) || a.nev.localeCompare(b.nev, 'hu'));
}

/** „Név · Város”; régiósnál „Név · regionálisan (Város)” – város nélkül a székhely országa. */
export function attaseFelirat(a: OrszagAttase, kod: string): string {
  if (regionalisE(a, kod)) return `${a.nev} · regionálisan (${a.varos || orszagNev(a.szekhelyKod)})`;
  return a.varos ? `${a.nev} · ${a.varos}` : a.nev;
}

/**
 * Egy sor az ország attaséiról: az első felirata, több attasénál „+N attasé”; üres listára null.
 * A lista `rendezAttasek` sorrendű (a hívók így adják), ezért az első a vezető, ha van.
 */
export function attasekRovid(attasek: readonly OrszagAttase[], kod: string): string | null {
  const [elso, ...tobbi] = attasek;
  if (!elso) return null;
  return attaseFelirat(elso, kod) + (tobbi.length > 0 ? ` +${tobbi.length} attasé` : '');
}

/** A felhasználó-kezelő országonkénti attasé-listájának egy eleme (vezető-súgó, figyelmeztetés, ★). */
export interface OrszagTag {
  userId: string;
  nev: string;
  vezeto: boolean;
  tiltott: boolean;
}
/**
 * Országkód → az országot lefedő felhasználók (tiltottakkal együtt). Sima objektum
 * (a felhasználó-oldal kliens-dialógusainak propja); a kulcs validált ISO-kód,
 * olvasás `Object.hasOwn`-nal.
 */
export type OrszagTagok = Record<string, OrszagTag[]>;

/** A felhasználó-listából országonként a lefedő felhasználók. */
export function orszagonkent(
  felhasznalok: readonly {
    id: string;
    nev: string;
    tiltott: boolean;
    orszagok: readonly Pick<AttaseOrszag, 'kod' | 'vezeto'>[];
  }[],
): OrszagTagok {
  const m: OrszagTagok = {};
  for (const f of felhasznalok) {
    for (const o of f.orszagok) {
      if (!Object.hasOwn(m, o.kod)) m[o.kod] = [];
      m[o.kod].push({ userId: f.id, nev: f.nev, vezeto: o.vezeto, tiltott: f.tiltott });
    }
  }
  return m;
}

/** Ország, amelynek van aktív attaséja, de nincs aktív vezetője (nincs kijelölve, vagy a vezető tiltott). */
export interface HianyosOrszag {
  kod: string;
  /** A nem tiltott attasék száma. */
  aktivDb: number;
  vezetoTiltott: boolean;
}

/**
 * Az aktív attaséval rendelkező, de aktív vezető nélküli országok (nincs kijelölve,
 * vagy a vezető tiltott), magyar név szerint – a felhasználó-oldal figyelmeztetése.
 */
export function vezetoNelkuliOrszagok(m: OrszagTagok): HianyosOrszag[] {
  const ki: HianyosOrszag[] = [];
  for (const [kod, tagok] of Object.entries(m)) {
    const aktivDb = tagok.filter((t) => !t.tiltott).length;
    const vezeto = tagok.find((t) => t.vezeto);
    // Csak ahol van aktív attasé: a csupa tiltott attasés országban nincs kire átadni a vezetést.
    if (aktivDb === 0 || (vezeto && !vezeto.tiltott)) continue;
    ki.push({ kod, aktivDb, vezetoTiltott: Boolean(vezeto) });
  }
  return ki.sort((a, b) => orszagNev(a.kod).localeCompare(orszagNev(b.kod), 'hu'));
}

/** A dialógus vezető-jelölőjének helyzete egy országra, a szerkesztett felhasználón kívüli attasék alapján. */
export interface VezetoHelyzet {
  /** A többi attasé száma (tiltottakkal együtt); 0 = egyedüli, automatikusan vezető. */
  masok: number;
  /** A másik felhasználó, aki most vezető. */
  masikVezeto: { nev: string; tiltott: boolean } | null;
  /** A szerkesztett felhasználó most (a DB szerint) ennek az országnak a vezetője. */
  sajatVezeto: boolean;
}

/** `sajatId`: a szerkesztett felhasználó (új felhasználónál null). */
export function vezetoHelyzet(kod: string, sajatId: string | null, m: OrszagTagok): VezetoHelyzet {
  const tagok = Object.hasOwn(m, kod) ? m[kod] : [];
  const masok = tagok.filter((t) => t.userId !== sajatId);
  const v = masok.find((t) => t.vezeto);
  return {
    masok: masok.length,
    masikVezeto: v ? { nev: v.nev, tiltott: v.tiltott } : null,
    sajatVezeto: tagok.some((t) => t.userId === sajatId && t.vezeto),
  };
}

/** Országválasztáskor a jelölő alapértéke: bejelölve, ha nincs másik vezető. */
export function alapVezeto(h: VezetoHelyzet): boolean {
  return h.masikVezeto === null;
}

/** A jelölő súgója; a nevet toldalék nélkül írja (nem kell magánhangzó-illeszkedést számolni). */
export function vezetoSugo(h: VezetoHelyzet, bejelolve: boolean): string | null {
  if (h.masok === 0) return 'Egyedüli attasé – automatikusan vezető.';
  if (h.masikVezeto) {
    const { nev, tiltott } = h.masikVezeto;
    return bejelolve
      ? `Mentéskor ő lesz a relációs vezető (jelenleg: ${nev}${tiltott ? ', tiltott' : ''}).`
      : `Jelenlegi vezető: ${nev}${tiltott ? ' (tiltott)' : ''}.`;
  }
  if (h.sajatVezeto) return bejelolve ? null : 'Kikapcsolva nem marad vezető – jelölj ki mást.';
  return 'Nincs kijelölt vezető.';
}
```

- [ ] **Step 4: Az országszótár (`lib/orszagok.ts`)**

A fájl fejléc-kommentjében a „A `user.orszag` és a `riport.orszag` a `kod`-ot tárolja” mondat helyett:

```ts
 * főváros koordinátája (a pin helye). Az `attase_orszag.orszag_kod`, a `riport.orszag` és a
 * `ticket.orszag` a `kod`-ot tárolja; a felület `orszagNev()`-vel ír. Framework-mentes.
```

Az `ORSZAGOK` feletti komment: `A \`geo: ''\` sorok (SG, MT, BH)` → `A \`geo: ''\` sorok (SG, MT, BH, VI, MV)`.

Három új sor, a magyar ábécé szerinti helyén:

```ts
  { kod: 'US', nev: 'Amerikai Egyesült Államok', geo: 'United States of America', lonlat: [-77.04, 38.9] },
  { kod: 'VI', nev: 'Amerikai Virgin-szigetek', geo: '', lonlat: [-64.93, 18.34] },
```

```ts
  { kod: 'MW', nev: 'Malawi', geo: 'Malawi', lonlat: [33.79, -13.96] },
  { kod: 'MV', nev: 'Maldív-szigetek', geo: '', lonlat: [73.51, 4.18] },
```

```ts
  { kod: 'PT', nev: 'Portugália', geo: 'Portugal', lonlat: [-9.14, 38.72] },
  { kod: 'PR', nev: 'Puerto Rico', geo: 'Puerto Rico', lonlat: [-66.11, 18.47] },
```

- [ ] **Step 5: Futtasd – legyen zöld**

Run: `npx tsx scripts/_attase-orszag-check.ts`
Expected: `attase-orszag: minden ellenőrzés rendben`. (Ha a rendezettség bukik, a beszúrás helyét a `localeCompare('hu')` szerint igazítsd.)

- [ ] **Step 6: Típusellenőrzés, takarítás, commit**

```bash
npx tsc --noEmit
rm scripts/_attase-orszag-check.ts
git add lib/attase-orszag.ts lib/orszagok.ts
git commit -m "$(printf 'feat(attase-orszagok): lib/attase-orszag tiszta típusok és segédek; Puerto Rico, Amerikai Virgin-szigetek, Maldív-szigetek a szótárban\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 2: `attase_orszag` tábla, 0006-os migráció, lekérdezések

**Files:**
- Create: `db/schema/attase-orszag.ts`, `db/queries/attase-orszag.ts`
- Modify: `db/schema/index.ts`
- Generate + kézi kiegészítés: `drizzle/0006_attase_orszag.sql`, `drizzle/meta/0006_snapshot.json`, `drizzle/meta/_journal.json`
- Test (eldobható): `scripts/_attase-orszag-db-check.ts`

- [ ] **Step 1: A bukó DB-ellenőrző script**

`scripts/_attase-orszag-db-check.ts` (a demó DB másolatán fut; a migrált állapotból indul – két attasé: `teszt.attase@niu.hu` KR, `masodik.attase@niu.hu` JP):

```ts
import assert from 'node:assert/strict';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { attaseOrszag, user } from '../db/schema';
import {
  listAttaseOrszagok, listAttasekOrszagonkent, listOrszagAttasek, listOrszagokFelhasznalonkent,
  normalizalVezetok, setAttaseOrszagok,
} from '../db/queries/attase-orszag';

const kr = db.select({ id: user.id }).from(user).where(eq(user.email, 'teszt.attase@niu.hu')).get();
const jp = db.select({ id: user.id }).from(user).where(eq(user.email, 'masodik.attase@niu.hu')).get();
assert.ok(kr && jp, 'a két teszt-attasé hiányzik a DB-ből');

// A migráció a régi user.orszag-ot székhely + vezető sorként vette át.
assert.deepEqual(listAttaseOrszagok(kr.id), [{ kod: 'KR', szekhely: true, vezeto: true }]);
assert.deepEqual(listAttaseOrszagok(jp.id), [{ kod: 'JP', szekhely: true, vezeto: true }]);

// Átvétel: a JP-s attasé régiósan KR-t is lefedi, vezetőként → KR vezetője ő lesz.
setAttaseOrszagok(jp.id, [
  { kod: 'JP', szekhely: true, vezeto: true, varos: 'Tokió', reszterulet: null },
  { kod: 'KR', szekhely: false, vezeto: true, varos: null, reszterulet: null },
]);
assert.deepEqual(listAttaseOrszagok(kr.id), [{ kod: 'KR', szekhely: true, vezeto: false }]);
assert.deepEqual(
  listOrszagAttasek('KR').map((a) => [a.nev, a.vezeto, a.szekhelyKod, a.varos]),
  [['Második Attasé', true, 'JP', 'Tokió'], ['Teszt Attasé', false, 'KR', null]],
);

// A vezető kivonul KR-ből → egyedül maradó KR-es örököl; a kikapcsolt jelölőjű egyedüli JP-s is vezető.
setAttaseOrszagok(jp.id, [{ kod: 'JP', szekhely: true, vezeto: false, varos: 'Tokió', reszterulet: null }]);
assert.deepEqual(listAttaseOrszagok(kr.id), [{ kod: 'KR', szekhely: true, vezeto: true }]);
assert.deepEqual(listAttaseOrszagok(jp.id), [{ kod: 'JP', szekhely: true, vezeto: true }]);

// Két attasé, vezető nélkül → vezető nélkül marad (a normalizálás sem jelöl ki senkit).
setAttaseOrszagok(jp.id, [
  { kod: 'JP', szekhely: true, vezeto: true, varos: 'Tokió', reszterulet: null },
  { kod: 'KR', szekhely: false, vezeto: false, varos: null, reszterulet: null },
]);
setAttaseOrszagok(kr.id, [{ kod: 'KR', szekhely: true, vezeto: false, varos: 'Szöul', reszterulet: 'Szöul és környéke' }]);
assert.equal(listOrszagAttasek('KR').some((a) => a.vezeto), false);
normalizalVezetok();
assert.equal(listOrszagAttasek('KR').some((a) => a.vezeto), false);

// Részterület csak a székhely-országnál; a térkép-adat minden lefedett országot ad.
const krLista = listOrszagAttasek('KR');
assert.equal(krLista.find((a) => a.userId === kr.id)?.reszterulet, 'Szöul és környéke');
assert.equal(krLista.find((a) => a.userId === jp.id)?.reszterulet, null);
assert.deepEqual([...listAttasekOrszagonkent().keys()].sort(), ['JP', 'KR']);
assert.deepEqual(listOrszagokFelhasznalonkent().get(jp.id)?.map((o) => o.kod), ['JP', 'KR']);

// DB-szintű egyediség: két vezető ugyanabban az országban → hiba.
assert.throws(() => db.update(attaseOrszag).set({ vezeto: true }).run());

// Adminra váltás: üres lista → a felhasználó minden sora törlődik.
setAttaseOrszagok(jp.id, []);
assert.deepEqual(listAttaseOrszagok(jp.id), []);
console.log('attase-orszag DB: minden ellenőrzés rendben');
```

- [ ] **Step 2: A séma**

`db/schema/attase-orszag.ts`:

```ts
import { sql } from 'drizzle-orm';
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { user } from './auth';

// Attasé–ország hozzárendelés (lib/attase-orszag.ts): soronként egy (felhasználó, ország) pár.
// A székhely a poszt országa – felhasználónként pontosan egy (a validátor követeli meg, az
// index legfeljebb egyet enged) –, a többi sor regionális lefedettség. A vezető a relációs
// vezető, az országprofil felelőse: országonként legfeljebb egy. A város és a részterület csak
// a székhely-sornál töltött. A szabályokat a db/queries/attase-orszag.ts tartja.
export const attaseOrszag = sqliteTable(
  'attase_orszag',
  {
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    orszagKod: text('orszag_kod').notNull(),
    szekhely: integer('szekhely', { mode: 'boolean' }).notNull().default(false),
    vezeto: integer('vezeto', { mode: 'boolean' }).notNull().default(false),
    varos: text('varos'),
    reszterulet: text('reszterulet'),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.orszagKod] }),
    uniqueIndex('attase_orszag_vezeto_idx').on(table.orszagKod).where(sql`${table.vezeto} = 1`),
    uniqueIndex('attase_orszag_szekhely_idx').on(table.userId).where(sql`${table.szekhely} = 1`),
    index('attase_orszag_orszag_idx').on(table.orszagKod),
  ],
);
```

`db/schema/index.ts` végére:

```ts
export * from './attase-orszag';
```

- [ ] **Step 3: Migráció generálása**

Run: `npm run db:generate -- --name attase_orszag`
Expected: `drizzle/0006_attase_orszag.sql` pontosan ezzel a tartalommal (más tábla nem változhat – ha a `user` vagy más tábla is szerepel, állj meg és jelezd):

```sql
CREATE TABLE `attase_orszag` (
	`user_id` text NOT NULL,
	`orszag_kod` text NOT NULL,
	`szekhely` integer DEFAULT false NOT NULL,
	`vezeto` integer DEFAULT false NOT NULL,
	`varos` text,
	`reszterulet` text,
	PRIMARY KEY(`user_id`, `orszag_kod`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attase_orszag_vezeto_idx` ON `attase_orszag` (`orszag_kod`) WHERE "attase_orszag"."vezeto" = 1;--> statement-breakpoint
CREATE UNIQUE INDEX `attase_orszag_szekhely_idx` ON `attase_orszag` (`user_id`) WHERE "attase_orszag"."szekhely" = 1;--> statement-breakpoint
CREATE INDEX `attase_orszag_orszag_idx` ON `attase_orszag` (`orszag_kod`);
```

- [ ] **Step 4: Adatlépések kézzel a migráció végére**

Az utolsó sor (`CREATE INDEX … (\`orszag_kod\`);`) végére írd: `--> statement-breakpoint`, majd fűzd a fájl végére (a megjegyzések a drizzle migrátornak nem gondot jelentenek, a breakpoint-jelölőt nem tartalmazzák):

```sql
-- Adat (kézzel hozzáadva): a régi user.orszag → székhely-sor; adminnak nincs sora.
INSERT INTO `attase_orszag` (`user_id`, `orszag_kod`, `szekhely`, `vezeto`)
SELECT `id`, `orszag`, 1, 0 FROM `user`
WHERE `orszag` IS NOT NULL AND `orszag` <> '' AND coalesce(`role`, 'attase') <> 'admin';--> statement-breakpoint
-- Országonként egy relációs vezető: a nem tiltott attasék közül név szerint az első (a térkép
-- eddigi „első attaséja”); ha mind tiltott, a név szerint első. Tiltott = banned és a ban_expires
-- hiányzik vagy a jövőben van (lib/felhasznalo-tiltas.ts).
UPDATE `attase_orszag` SET `vezeto` = 1
WHERE `user_id` = (
  SELECT `ao`.`user_id` FROM `attase_orszag` AS `ao`
  JOIN `user` AS `u` ON `u`.`id` = `ao`.`user_id`
  WHERE `ao`.`orszag_kod` = `attase_orszag`.`orszag_kod`
  ORDER BY (coalesce(`u`.`banned`, 0) = 1
    AND (`u`.`ban_expires` IS NULL OR `u`.`ban_expires` > cast(unixepoch('subsecond') * 1000 as integer))),
    `u`.`name`
  LIMIT 1
);--> statement-breakpoint
-- A vezető poszt-adatai (főváros, terület, pénznem) az ország minden meglévő Alapadatok blokkjába,
-- ahol a kulcs még hiányzik vagy üres. Ahol nincs mentett Alapadatok blokk, az érték elvész (profil-sort
-- nem hozunk létre: hamis „Adott évi profil” állapotot mutatna). Az updated_at szándékosan nem változik.
UPDATE `orszagprofil` SET `alapadatok` = json_set(`orszagprofil`.`alapadatok`,
  '$.fovaros', coalesce(nullif(json_extract(`orszagprofil`.`alapadatok`, '$.fovaros'), ''), `v`.`fovaros`),
  '$.terulet', coalesce(json_extract(`orszagprofil`.`alapadatok`, '$.terulet'), `v`.`terulet`),
  '$.penznem', coalesce(nullif(json_extract(`orszagprofil`.`alapadatok`, '$.penznem'), ''), `v`.`penznem`))
FROM (
  SELECT `ao`.`orszag_kod` AS `kod`, `u`.`fovaros`, `u`.`terulet`, `u`.`penznem`
  FROM `attase_orszag` AS `ao` JOIN `user` AS `u` ON `u`.`id` = `ao`.`user_id`
  WHERE `ao`.`vezeto` = 1
    AND (`u`.`fovaros` IS NOT NULL OR `u`.`terulet` IS NOT NULL OR `u`.`penznem` IS NOT NULL)
) AS `v`
WHERE `orszagprofil`.`orszag_kod` = `v`.`kod` AND `orszagprofil`.`alapadatok` IS NOT NULL;
```

- [ ] **Step 5: `db/queries/attase-orszag.ts`**

```ts
import 'server-only';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { db } from '../index';
import { attaseOrszag, user } from '../schema';
import { tiltottE } from '../../lib/felhasznalo-tiltas';
import {
  rendezAttasek, rendezOrszagok, type AttaseOrszag, type OrszagAttase, type SessionOrszag,
} from '../../lib/attase-orszag';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** A felhasználó hozzárendelései a sessionhöz: székhely elöl, utána magyar országnév szerint. */
export function listAttaseOrszagok(userId: string): SessionOrszag[] {
  return rendezOrszagok(
    db
      .select({ kod: attaseOrszag.orszagKod, szekhely: attaseOrszag.szekhely, vezeto: attaseOrszag.vezeto })
      .from(attaseOrszag)
      .where(eq(attaseOrszag.userId, userId))
      .all(),
  );
}

/** Minden hozzárendelés felhasználónként (a felhasználó-lista oszlopa és a dialógusok kezdőértéke). */
export function listOrszagokFelhasznalonkent(): Map<string, AttaseOrszag[]> {
  const m = new Map<string, AttaseOrszag[]>();
  for (const r of db.select().from(attaseOrszag).all()) {
    const lista = m.get(r.userId) ?? [];
    lista.push({ kod: r.orszagKod, szekhely: r.szekhely, vezeto: r.vezeto, varos: r.varos, reszterulet: r.reszterulet });
    m.set(r.userId, lista);
  }
  for (const [userId, lista] of m) m.set(userId, rendezOrszagok(lista));
  return m;
}

// Az attasé székhely-sora (város, részterület) a régiós országok felirataihoz.
const szekhelySor = alias(attaseOrszag, 'szekhely_sor');

/** Az aktív (nem tiltott) attasék országonként, `rendezAttasek` sorrendben; `kod` megadásával csak az az ország. */
function attasekOrszagonkent(kod?: string): Map<string, OrszagAttase[]> {
  const now = Date.now();
  const sorok = db
    .select({
      kod: attaseOrszag.orszagKod,
      userId: user.id,
      nev: user.name,
      vezeto: attaseOrszag.vezeto,
      banned: user.banned,
      banExpires: user.banExpires,
      szekhelyKod: szekhelySor.orszagKod,
      varos: szekhelySor.varos,
      reszterulet: szekhelySor.reszterulet,
    })
    .from(attaseOrszag)
    .innerJoin(user, eq(user.id, attaseOrszag.userId))
    .leftJoin(szekhelySor, and(eq(szekhelySor.userId, attaseOrszag.userId), eq(szekhelySor.szekhely, true)))
    .where(kod ? eq(attaseOrszag.orszagKod, kod) : undefined)
    .all();
  const m = new Map<string, OrszagAttase[]>();
  for (const r of sorok) {
    if (tiltottE(r, now)) continue;
    const lista = m.get(r.kod) ?? [];
    lista.push({
      userId: r.userId,
      nev: r.nev,
      vezeto: r.vezeto,
      szekhelyKod: r.szekhelyKod,
      varos: r.varos,
      // A részterület a székhely-országon belüli terület: régiós országnál nem értelmezett.
      reszterulet: r.szekhelyKod === r.kod ? r.reszterulet : null,
    });
    m.set(r.kod, lista);
  }
  for (const [k, lista] of m) m.set(k, rendezAttasek(k, lista));
  return m;
}

/** Az ország aktív attaséi a profil fejlécének (vezető elöl, utána a székhelyesek, végül a régiósak). */
export function listOrszagAttasek(kod: string): OrszagAttase[] {
  return attasekOrszagonkent(kod).get(kod) ?? [];
}

/** Minden ország aktív attaséi (a térkép adata). */
export function listAttasekOrszagonkent(): Map<string, OrszagAttase[]> {
  return attasekOrszagonkent();
}

/**
 * Egy felhasználó összes hozzárendelésének cseréje egy tranzakcióban: a régi sorok törlése, a
 * bejelölt vezetőségek átvétele (az adott országok többi vezető-jelölése lekerül), az új sorok
 * beszúrása, végül a normalizálás. Adminnak (és adminra váltáskor) üres listával hívandó.
 */
export function setAttaseOrszagok(userId: string, sorok: readonly AttaseOrszag[]): void {
  db.transaction((tx) => {
    tx.delete(attaseOrszag).where(eq(attaseOrszag.userId, userId)).run();
    const atvett = sorok.filter((s) => s.vezeto).map((s) => s.kod);
    if (atvett.length > 0) {
      tx.update(attaseOrszag).set({ vezeto: false }).where(inArray(attaseOrszag.orszagKod, atvett)).run();
    }
    if (sorok.length > 0) {
      tx.insert(attaseOrszag)
        .values(
          sorok.map((s) => ({
            userId,
            orszagKod: s.kod,
            szekhely: s.szekhely,
            vezeto: s.vezeto,
            varos: s.varos,
            reszterulet: s.reszterulet,
          })),
        )
        .run();
    }
    normalizal(tx);
  });
}

/**
 * Ahol egy országnak pontosan egy hozzárendelése van és nincs vezetője, az lesz a vezető
 * (egyszemélyes országban nem kell jelölni; a vezető távozásakor az egyedül maradó örököl).
 * Ha többen maradnak vezető nélkül, nem jelöl ki senkit – a felhasználó-kezelő figyelmeztet.
 * A felhasználó törlése után (FK cascade) a removeFelhasznaloAction hívja.
 */
export function normalizalVezetok(): void {
  db.transaction((tx) => normalizal(tx));
}

function normalizal(tx: Tx): void {
  const egyedul = tx
    .select({ kod: attaseOrszag.orszagKod })
    .from(attaseOrszag)
    .groupBy(attaseOrszag.orszagKod)
    .having(sql`count(*) = 1 and max(${attaseOrszag.vezeto}) = 0`);
  tx.update(attaseOrszag)
    .set({ vezeto: true })
    .where(and(eq(attaseOrszag.vezeto, false), inArray(attaseOrszag.orszagKod, egyedul)))
    .run();
}
```

- [ ] **Step 6: Migráció és ellenőrzés a demó DB másolatán**

```bash
T=$(mktemp -d) && sqlite3 data/tet.db ".backup '$T/t.db'"
DATABASE_URL="$T/t.db" npx drizzle-kit migrate
sqlite3 "$T/t.db" "select u.email, a.orszag_kod, a.szekhely, a.vezeto from attase_orszag a join user u on u.id = a.user_id order by 1;"
sqlite3 "$T/t.db" "select orszag_kod, ev, json_extract(alapadatok,'\$.fovaros'), json_extract(alapadatok,'\$.terulet'), json_extract(alapadatok,'\$.penznem') from orszagprofil order by 1, 2;"
DATABASE_URL="$T/t.db" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_attase-orszag-db-check.ts
```

Expected:
- `masodik.attase@niu.hu|JP|1|1` és `teszt.attase@niu.hu|KR|1|1`;
- `JP|2025|Tokió|377975|japán jen (JPY)`, `JP|2026|Tokió|…`, `KR|2026|Szöul|100210|dél-koreai won (KRW)`;
- `attase-orszag DB: minden ellenőrzés rendben`.

- [ ] **Step 7: Migráció a valódi demó DB-n, típusellenőrzés, commit**

```bash
npm run db:migrate
npx tsc --noEmit
rm scripts/_attase-orszag-db-check.ts
git add db/schema/attase-orszag.ts db/schema/index.ts db/queries/attase-orszag.ts drizzle/0006_attase_orszag.sql drizzle/meta/0006_snapshot.json drizzle/meta/_journal.json
git commit -m "$(printf 'feat(attase-orszagok): attase_orszag tábla (székhely, relációs vezető, város, részterület), 0006 migráció adatmásolással, lekérdezések és vezető-szabályok\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

(A `data/tet.db` módosul, de nem commitoljuk – a 15. task teszi.)

---

### Task 3: Session (`orszagok`) és a vezető-szabály a profil-jogban

**Files:**
- Modify: `lib/session.ts`, `lib/orszagprofil-jog.ts`
- Test (eldobható): `scripts/_profil-jog-check.ts`

- [ ] **Step 1: A bukó ellenőrző script**

`scripts/_profil-jog-check.ts`:

```ts
import assert from 'node:assert/strict';
import { canEditProfil } from '../lib/orszagprofil-jog';

const attase = {
  role: 'attase' as const,
  orszagok: [
    { kod: 'FR', szekhely: true, vezeto: true },
    { kod: 'DZ', szekhely: false, vezeto: true },
    { kod: 'DE', szekhely: false, vezeto: false },
  ],
};
assert.equal(canEditProfil(attase, 'FR', 2026, 2026), true); // székhely, vezető
assert.equal(canEditProfil(attase, 'DZ', 2026, 2026), true); // régiós, vezető
assert.equal(canEditProfil(attase, 'DE', 2026, 2026), false); // lefedi, de nem vezető
assert.equal(canEditProfil(attase, 'FR', 2025, 2026), false); // múltbeli év
assert.equal(canEditProfil(attase, 'IT', 2026, 2026), false); // nem az övé
const admin = { role: 'admin' as const, orszagok: [] };
assert.equal(canEditProfil(admin, 'IT', 2021, 2026), true);
assert.equal(canEditProfil(admin, 'IT', 2019, 2026), false);
console.log('profil-jog: minden ellenőrzés rendben');
```

Run: `npx tsx scripts/_profil-jog-check.ts`
Expected: FAIL (típushiba nincs, mert a tsx nem típusellenőriz – de a régi `session.orszag === kod` miatt az első assert bukik).

- [ ] **Step 2: `lib/session.ts`**

Az importok közé:

```ts
import { listAttaseOrszagok } from '../db/queries/attase-orszag';
import { szekhelyKod, type SessionOrszag } from './attase-orszag';
```

Az `AppSession` és a `getSession`:

```ts
export interface AppSession {
  userId: string;
  name: string;
  email: string;
  role: AppRole;
  /** Az attasé országai (székhely elöl, utána magyar név szerint); adminnál üres. */
  orszagok: SessionOrszag[];
  /** Átmeneti: a székhely kódja a még át nem állt fogyasztóknak; a 12. task törli. */
  orszag: string | null;
}

/**
 * Aktuális session a kérés cookie-jából, vagy null. Csak szerver oldalon hívható.
 * React.cache: egy kérésen belül (layout + page) egyszer fut le. Server action-ben
 * a cache átlátszó, minden hívás friss. A Better Auth session.cookieCache szándékosan
 * NINCS bekapcsolva: tiltás/törlés után azonnal érvénytelen legyen a session. Az attasé
 * országai minden kérésnél a DB-ből jönnek, így egy admin-módosítás azonnal érvényes.
 */
export const getSession = cache(async (): Promise<AppSession | null> => {
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result) return null;
  const u = result.user;
  // A role hiánya (régi rekord) attasénak számít.
  const role: AppRole = u.role === 'admin' ? 'admin' : 'attase';
  const orszagok = role === 'attase' ? listAttaseOrszagok(u.id) : [];
  return { userId: u.id, name: u.name, email: u.email, role, orszagok, orszag: szekhelyKod(orszagok) };
});
```

- [ ] **Step 3: `lib/orszagprofil-jog.ts`**

```ts
import type { AppSession } from './session';
import { EV_MIN } from './orszagprofil-szotar';

/**
 * Olvasni bárki olvashat bármely profilt. Szerkeszteni: admin bármely országot EV_MIN és az
 * aktuális év között; attasé csak annak az országnak a profilját, amelynek relációs vezetője
 * (az országprofil felelőse – a session `orszagok` `vezeto` jelzője), és csak az aktuális évet.
 */
export function canEditProfil(
  session: Pick<AppSession, 'role' | 'orszagok'>,
  kod: string,
  ev: number,
  aktualisEv: number,
): boolean {
  if (!Number.isInteger(ev) || ev < EV_MIN || ev > aktualisEv) return false;
  if (session.role === 'admin') return true;
  return ev === aktualisEv && session.orszagok.some((o) => o.kod === kod && o.vezeto);
}
```

- [ ] **Step 4: Zöld, típusellenőrzés, takarítás, commit**

```bash
npx tsx scripts/_profil-jog-check.ts      # → profil-jog: minden ellenőrzés rendben
npx tsc --noEmit
rm scripts/_profil-jog-check.ts
git add lib/session.ts lib/orszagprofil-jog.ts
git commit -m "$(printf 'feat(attase-orszagok): AppSession.orszagok a DB-ből; profilt attasé csak relációs vezetőként szerkeszthet\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 4: Alapadatok – főváros, terület, pénznem

**Files:**
- Modify: `lib/orszagprofil-szotar.ts`, `lib/orszagprofil-validacio.ts`, `app/(app)/orszagprofil/components/mezok/AlapadatokMezok.tsx`, `components/orszagprofil/BlokkNezet.tsx`
- Test (eldobható): `scripts/_alapadatok-check.ts`

- [ ] **Step 1: A bukó ellenőrző script**

`scripts/_alapadatok-check.ts`:

```ts
import assert from 'node:assert/strict';
import { normalizalBlokk } from '../lib/orszagprofil-szotar';
import { validalBlokk } from '../lib/orszagprofil-validacio';

const fd = new FormData();
fd.set('fovaros', 'Szöul');
fd.set('terulet', '100 210');
fd.set('penznem', 'dél-koreai won (KRW)');
const r = validalBlokk('alapadatok', fd, 2026);
assert.ok(r.ok);
if (r.ok) {
  assert.equal(r.ertek.fovaros, 'Szöul');
  assert.equal(r.ertek.terulet, 100210);
  assert.equal(r.ertek.penznem, 'dél-koreai won (KRW)');
}
const rossz = new FormData();
rossz.set('terulet', '2,5');
const r2 = validalBlokk('alapadatok', rossz, 2026);
assert.ok(!r2.ok && r2.errors.terulet);
// Régi sor a három kulcs nélkül: üres / null; a migrációval bekerült érték olvasható.
const regi = normalizalBlokk('alapadatok', { lakossag: 5 });
assert.equal(regi.fovaros, '');
assert.equal(regi.terulet, null);
assert.equal(regi.penznem, '');
assert.equal(normalizalBlokk('alapadatok', { fovaros: 'Tokió', terulet: 377975 }).terulet, 377975);
console.log('alapadatok: minden ellenőrzés rendben');
```

Run: `npx tsx scripts/_alapadatok-check.ts` → FAIL (`r.ertek.fovaros` undefined).

- [ ] **Step 2: Szótár (`lib/orszagprofil-szotar.ts`)**

Az `Alapadatok` interfész elejére:

```ts
export interface Alapadatok {
  /** A poszt-adatok 2026-10-től itt vannak (korábban a felhasználón; a 0006 migráció másolta át). */
  fovaros: string;
  /** km², pozitív egész. */
  terulet: number | null;
  penznem: string;
  lakossag: number | null;
```

A `NORMALIZALOK.alapadatok` elejére:

```ts
  alapadatok: (r) => ({
    fovaros: szoveg(r.fovaros), terulet: szam(r.terulet), penznem: szoveg(r.penznem),
    lakossag: szam(r.lakossag), gdp: szam(r.gdp), gdpEgyFore: szam(r.gdpEgyFore),
```

A `MEZO_CIMKEK.alapadatok` elejére:

```ts
  alapadatok: {
    fovaros: { cimke: 'Főváros' },
    terulet: { cimke: 'Terület (km²)' },
    penznem: { cimke: 'Pénznem', sugo: 'Pl. dél-koreai won (KRW).' },
    lakossag: { cimke: 'Lakosság (fő)' },
```

- [ ] **Step 3: Validátor (`lib/orszagprofil-validacio.ts`)**

A `VALIDALOK.alapadatok` visszatérési objektumának elejére:

```ts
    return {
      fovaros: szoveg(fd, b, 'fovaros', ROVID_MAX, errors),
      terulet: szam(fd, b, 'terulet', { min: 1, max: 999_999_999, tizedes: 0 }, errors),
      penznem: szoveg(fd, b, 'penznem', ROVID_MAX, errors),
      lakossag: szam(fd, b, 'lakossag', { min: 1, max: 10_000_000_000, tizedes: 0 }, errors),
```

- [ ] **Step 4: Űrlap (`AlapadatokMezok.tsx`) – teljes fájl**

```tsx
'use client';

import { CimkeValaszto } from '../../../../../components/form/CimkeValaszto';
import { RovidMezo } from '../../../../../components/form/Mezo';
import { SzamMezo } from '../../../../../components/form/SzamMezo';
import { GAZDASAGI_AGAZATOK, MEZO_CIMKEK, ROVID_MAX, SZAM_MAX_HOSSZ, TAGSAGOK, type Alapadatok } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId, szamStr, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.alapadatok;
const B = 'alapadatok';

export function AlapadatokMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<Alapadatok>) {
  const [e, set] = useBlokkAllapot({
    ...initial,
    terulet: szamStr(initial.terulet),
    lakossag: szamStr(initial.lakossag), gdp: szamStr(initial.gdp), gdpEgyFore: szamStr(initial.gdpEgyFore),
    gdpNovekedes: szamStr(initial.gdpNovekedes), adatEv: szamStr(initial.adatEv),
  });
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <RovidMezo id={mezoId(B, 'fovaros')} name="fovaros" cimke={C.fovaros.cimke} value={e.fovaros} onChange={set('fovaros')} max={ROVID_MAX} errors={errors} placeholder="pl. Szöul" />
            <SzamMezo id={mezoId(B, 'terulet')} name="terulet" cimke={C.terulet.cimke} value={e.terulet} onChange={set('terulet')} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="km²" />
            <RovidMezo id={mezoId(B, 'penznem')} name="penznem" cimke={C.penznem.cimke} sugo={C.penznem.sugo} value={e.penznem} onChange={set('penznem')} max={ROVID_MAX} errors={errors} />
            <SzamMezo id={mezoId(B, 'lakossag')} name="lakossag" cimke={C.lakossag.cimke} value={e.lakossag} onChange={set('lakossag')} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="fő" />
            <SzamMezo id={mezoId(B, 'gdp')} name="gdp" cimke={C.gdp.cimke} value={e.gdp} onChange={set('gdp')} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="mrd USD" />
            <SzamMezo id={mezoId(B, 'gdpEgyFore')} name="gdpEgyFore" cimke={C.gdpEgyFore.cimke} value={e.gdpEgyFore} onChange={set('gdpEgyFore')} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="USD" />
            <SzamMezo id={mezoId(B, 'gdpNovekedes')} name="gdpNovekedes" cimke={C.gdpNovekedes.cimke} value={e.gdpNovekedes} onChange={set('gdpNovekedes')} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="%" />
            <SzamMezo id={mezoId(B, 'adatEv')} name="adatEv" cimke={C.adatEv.cimke} sugo={C.adatEv.sugo} value={e.adatEv} onChange={set('adatEv')} errors={errors} maxHossz={SZAM_MAX_HOSSZ} />
            <RovidMezo id={mezoId(B, 'forras')} name="forras" cimke={C.forras.cimke} sugo={C.forras.sugo} value={e.forras} onChange={set('forras')} max={ROVID_MAX} errors={errors} />
          </div>
          <CimkeValaszto id={mezoId(B, 'tagsagok')} name="tagsagok" cimke={C.tagsagok.cimke} items={TAGSAGOK} value={e.tagsagok} onChange={set('tagsagok')} errors={errors}
            egyeb={{ id: mezoId(B, 'tagsagEgyeb'), name: 'tagsagEgyeb', cimke: C.tagsagEgyeb.cimke, value: e.tagsagEgyeb, onChange: set('tagsagEgyeb'), max: ROVID_MAX }} />
          <CimkeValaszto id={mezoId(B, 'agazatok')} name="agazatok" cimke={C.agazatok.cimke} items={GAZDASAGI_AGAZATOK} value={e.agazatok} onChange={set('agazatok')} errors={errors}
            egyeb={{ id: mezoId(B, 'agazatEgyeb'), name: 'agazatEgyeb', cimke: C.agazatEgyeb.cimke, value: e.agazatEgyeb, onChange: set('agazatEgyeb'), max: ROVID_MAX }} />
        </>
      )}
    </BlokkForm>
  );
}
```

- [ ] **Step 5: Olvasó nézet (`components/orszagprofil/BlokkNezet.tsx`)**

A `NEZETEK.alapadatok` `<dl>`-jének elejére, a `lakossag` sor elé:

```tsx
        <Sor cimke={C.fovaros.cimke}><Szoveg v={b.fovaros} /></Sor>
        <Sor cimke={C.terulet.cimke}>{formatSzam(b.terulet, ' km²')}</Sor>
        <Sor cimke={C.penznem.cimke}><Szoveg v={b.penznem} /></Sor>
```

- [ ] **Step 6: Zöld, típusellenőrzés, takarítás, commit**

```bash
npx tsx scripts/_alapadatok-check.ts      # → alapadatok: minden ellenőrzés rendben
npx tsc --noEmit
rm scripts/_alapadatok-check.ts
git add lib/orszagprofil-szotar.ts lib/orszagprofil-validacio.ts "app/(app)/orszagprofil/components/mezok/AlapadatokMezok.tsx" components/orszagprofil/BlokkNezet.tsx
git commit -m "$(printf 'feat(attase-orszagok): főváros, terület, pénznem az országprofil Alapadatok blokkjában (szótár, validátor, űrlap, olvasó nézet)\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 5: Profil oldal – attasé-lista a fejlécben

**Files:**
- Create: `components/orszagprofil/AttaseLista.tsx`
- Modify: `app/(app)/orszagprofil/[kod]/page.tsx`, `db/queries/orszagprofil.ts` (`getAttaseNev` törlése)

- [ ] **Step 1: `components/orszagprofil/AttaseLista.tsx`**

```tsx
import { regionalisE, type OrszagAttase } from '../../lib/attase-orszag';
import { orszagNev } from '../../lib/orszagok';
import { Badge } from '../ui/badge';

/** A hely-felirat: „Város”, régiósnál „regionálisan, székhely: Város, Ország”. */
function hely(a: OrszagAttase, kod: string): string {
  if (regionalisE(a, kod)) {
    return `regionálisan, székhely: ${[a.varos, orszagNev(a.szekhelyKod)].filter(Boolean).join(', ')}`;
  }
  return a.varos ?? '';
}

/**
 * Az ország aktív attaséi a profil fejlécében, a `listOrszagAttasek` sorrendjében (vezető elöl):
 * név · hely, alatta halványan a részterület. A „Relációs vezető” jelzés csak több attasénál
 * látszik – egyszemélyes országban a vezetőség automatikus.
 */
export function AttaseLista({ kod, attasek }: { kod: string; attasek: readonly OrszagAttase[] }) {
  if (attasek.length === 0) return <p className="text-sm text-muted-foreground">Nincs aktív attasé</p>;
  const tobb = attasek.length > 1;
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      {/* A lista csak aktív attasékat tartalmaz: ha egyikük sem vezető (nincs kijelölve, vagy a vezető tiltott), a profilt csak admin szerkesztheti. */}
      {!attasek.some((a) => a.vezeto) && (
        <p className="text-muted-foreground">Nincs kijelölt relációs vezető.</p>
      )}
      <ul className="flex flex-col gap-1.5">
        {attasek.map((a) => {
          const h = hely(a, kod);
          return (
            <li key={a.userId} className="flex flex-col">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="font-medium">{a.nev}</span>
                {h && <span className="text-muted-foreground">· {h}</span>}
                {tobb && a.vezeto && <Badge variant="secondary">Relációs vezető</Badge>}
              </span>
              {a.reszterulet && (
                <span className="text-xs whitespace-pre-wrap text-muted-foreground">{a.reszterulet}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: A profil oldal (`app/(app)/orszagprofil/[kod]/page.tsx`)**

Import: a `getAttaseNev` kikerül, új:

```tsx
import { AttaseLista } from '../../../../components/orszagprofil/AttaseLista';
import { listOrszagAttasek } from '../../../../db/queries/attase-orszag';
import { getProfil, getUtolsoEv } from '../../../../db/queries/orszagprofil';
```

A `const attaseNev = getAttaseNev(kod);` helyett:

```tsx
  const attasek = listOrszagAttasek(kod);
```

A fejléc első blokkja (a `<div className="flex flex-wrap items-center gap-3">` és benne a címes `div` + `AllapotBadge`) helyett – a gombos `div` (`ml-auto flex gap-2`) változatlan marad utána:

```tsx
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">{orszag.nev}</h2>
            <AllapotBadge allapot={allapot} ev={utolsoEv} />
          </div>
          <AttaseLista kod={kod} attasek={attasek} />
        </div>
        <div className="ml-auto flex gap-2">
```

- [ ] **Step 3: `getAttaseNev` törlése (`db/queries/orszagprofil.ts`)**

Töröld a `getAttaseNev` függvényt a doc-kommentjével együtt (más nem használja: `grep -rn getAttaseNev app components db lib` üres legyen).

- [ ] **Step 4: Típusellenőrzés, gyors böngészős nézés, commit**

```bash
npx tsc --noEmit
```

gstack: admin bejelentkezés, `/orszagprofil/KR` → a fejlécben „Teszt Attasé” (város nélkül, mert a migrált sornak nincs városa), nincs „Relációs vezető” jelvény (egy attasé); `console --errors` üres.

```bash
git add components/orszagprofil/AttaseLista.tsx "app/(app)/orszagprofil/[kod]/page.tsx" db/queries/orszagprofil.ts
git commit -m "$(printf 'feat(attase-orszagok): profil fejléc attasé-listával (város, régiós jelzés, részterület, relációs vezető)\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 6: Térkép – `attasek` a `TerkepOrszag`-ban

**Files:**
- Modify: `db/queries/orszagprofil.ts`, `app/(app)/terkep/components/TerkepTooltip.tsx`, `ProfilKivonat.tsx`, `OsszehasonlitasPanel.tsx`, `TerkepNezet.tsx`

- [ ] **Step 1: `db/queries/orszagprofil.ts`**

Importok: a `tiltottE` import kikerül; új:

```ts
import { listAttasekOrszagonkent } from './attase-orszag';
import type { OrszagAttase } from '../../lib/attase-orszag';
```

A `TerkepOrszag`-ban az `attase` és a `poszt` mező helyett:

```ts
  /** Az ország aktív attaséi (vezető elöl, utána a székhelyesek, végül a régiósak); üres, ha nincs. */
  attasek: OrszagAttase[];
```

A `listTerkepAdat` doc-kommentjének első mondata: „…minden ország, ahol aktív attasé van (székhelyként vagy régiósan) vagy van profil, …”. A függvény törzse: az `attasek` user-lekérdezés, az `attaseKodhoz` térkép és az `a` változó helyett:

```ts
export const listTerkepAdat = cache((ev: number): TerkepOrszag[] => {
  const attasek = listAttasekOrszagonkent();

  // Országonként a legnagyobb, ev-nél nem nagyobb év sora. (Az év szerint csökkenő listából
  // az első előfordulás országonként; a max(ev)-es al-lekérdezéses join helyett, mert a
  // Drizzle az aliasolt sql-oszlopot a join-feltételben minősítés nélkül írja ki.)
  const profilok: (typeof orszagprofil.$inferSelect)[] = [];
  const lattuk = new Set<string>();
  for (const p of db.select().from(orszagprofil).orderBy(desc(orszagprofil.ev)).all()) {
    if (p.ev > ev || lattuk.has(p.orszagKod)) continue;
    lattuk.add(p.orszagKod);
    profilok.push(p);
  }
  const profilKodhoz = new Map(profilok.map((p) => [p.orszagKod, p] as const));

  const kodok = new Set<string>([...attasek.keys(), ...profilKodhoz.keys()]);

  const eredmeny: TerkepOrszag[] = [];
  for (const kod of kodok) {
    const o = orszagByKod(kod);
    if (!o) continue;
    const p = profilKodhoz.get(kod) ?? null;
    const prof = p ? sorbol(p, null) : null;
    eredmeny.push({
      kod, nev: o.nev, geo: o.geo, lonlat: o.lonlat,
      attasek: attasek.get(kod) ?? [],
      ev: prof?.ev ?? null,
      allapot: profilAllapot(prof?.ev ?? null, ev),
      iparagak: prof?.blokkok.kfiRendszer?.kiemeltIparagak ?? [],
      gerd: prof?.blokkok.kfiRendszer?.gerd ?? null,
      prioritasok: prof?.blokkok.kfiRendszer?.prioritasok ?? [],
      osszegzes: prof?.blokkok.magyarErtekeles?.osszegzes ?? '',
      alapadatok: prof?.blokkok.alapadatok ?? null,
      mentettDb: prof?.mentett.length ?? 0,
      rendezvenyDb: prof?.blokkok.rendezvenyek?.lista.length ?? 0,
    });
  }
  return eredmeny.sort((x, y) => x.nev.localeCompare(y.nev, 'hu'));
});
```

- [ ] **Step 2: Tooltip (`TerkepTooltip.tsx`)**

Import: `import { attasekRovid } from '../../../../lib/attase-orszag';`. Az attasé-sor:

```tsx
          <p className="text-background/70">{attasekRovid(o.attasek, o.kod) ?? 'nincs aktív attasé'}</p>
```

(A főváros a tooltipből kikerül: az első attasé városa informatívabb, a fővárost a kivonat mutatja.)

- [ ] **Step 3: Kivonat (`ProfilKivonat.tsx`)**

Import: `import { attaseFelirat } from '../../../../lib/attase-orszag';`. A `poszt` számítása:

```tsx
  const a = o.alapadatok;
  const C = MEZO_CIMKEK.alapadatok;
  // A poszt országának adatai az Alapadatok blokkból (főváros, terület, pénznem).
  const poszt = a
    ? [a.fovaros, a.terulet != null ? sz(a.terulet, ' km²') : null, a.penznem].filter(Boolean).join(' · ')
    : '';
```

A `CardDescription`:

```tsx
            <CardDescription className="flex flex-col">
              {o.attasek.length === 0 ? (
                <span>nincs aktív attasé</span>
              ) : (
                o.attasek.map((at) => (
                  <span key={at.userId}>
                    {attaseFelirat(at, o.kod)}
                    {o.attasek.length > 1 && at.vezeto ? ' · relációs vezető' : ''}
                  </span>
                ))
              )}
              {poszt && <span>{poszt}</span>}
            </CardDescription>
```

- [ ] **Step 4: Összehasonlító tábla (`OsszehasonlitasPanel.tsx`)**

Import: `import { attasekRovid } from '../../../../lib/attase-orszag';`. Az „Attasé” sor:

```tsx
            <Sor cimke="Attasé" orszagok={orszagok} plusz={plusz}>
              {(o) => attasekRovid(o.attasek, o.kod) ?? '–'}
            </Sor>
```

- [ ] **Step 5: Saját gomb (`TerkepNezet.tsx`)**

Import: `import { elsoVezetettKod } from '../../../../lib/attase-orszag';`. A `sajatKod`:

```tsx
  // A session a contextből: a jog-számítás (canEditProfil) és a „Saját országprofil" gomb is ebből dolgozik.
  // A gomb az első vezetett országra visz (a székhely előnyben); nem vezető attasénál nincs gomb.
  const { user } = useApp();
  const sajatKod = user.role === 'attase' ? elsoVezetettKod(user.orszagok) : null;
```

- [ ] **Step 6: Típusellenőrzés, böngészős nézés, commit**

```bash
npx tsc --noEmit
grep -rn "\.poszt\b\|\.attase\b" "app/(app)/terkep" lib db   # üres legyen
```

gstack (admin): `/terkep` → Koreai Köztársaság tooltipje „Teszt Attasé”, kivonatban „Teszt Attasé” és alatta „Szöul · 100 210 km² · dél-koreai won (KRW)” (a 0006 migráció másolta), összehasonlító táblában az Attasé sor; `console --errors` üres.

```bash
git add db/queries/orszagprofil.ts "app/(app)/terkep/components/TerkepTooltip.tsx" "app/(app)/terkep/components/ProfilKivonat.tsx" "app/(app)/terkep/components/OsszehasonlitasPanel.tsx" "app/(app)/terkep/components/TerkepNezet.tsx"
git commit -m "$(printf 'feat(attase-orszagok): térkép az attasé-listából (tooltip, kivonat, összehasonlítás, saját gomb az első vezetett országra); poszt-adatok az Alapadatokból\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 7: Oldalsáv-kártya és a felhasználói blokk felirata

**Files:**
- Modify: `app/(app)/components/OldalsavAllapot.tsx`, `components/AppShell.tsx`

- [ ] **Step 1: `OldalsavAllapot.tsx` – teljes fájl**

```tsx
import Link from 'next/link';
import { getUtolsoEv, listTerkepAdat } from '../../../db/queries/orszagprofil';
import { orszagNev } from '../../../lib/orszagok';
import { canEditProfil } from '../../../lib/orszagprofil-jog';
import { ALLAPOTOK, ALLAPOT_CIMKE, ALLAPOT_SZINEK, profilAllapot, type Allapot } from '../../../lib/orszagprofil-szotar';
import type { AppSession } from '../../../lib/session';

// Az oldalsáv alján megjelenő állapot-kártya. Server Component: a layout rendereli és
// ReactNode-ként adja az AppShell `oldalsavAlja` propjának, így a DB-lekérdezés nem kerül
// a kliens-komponensbe. A színek a térképpel közös szótárból jönnek (ALLAPOT_SZINEK), inline
// style-lal; az AllapotBadge szándékosan nincs újrahasználva, az világos háttérre van hangolva.
// Attasé: országonként egy sor (székhely elöl); a sor a szerkesztőre visz, ha az attasé az ország
// relációs vezetője és az év szerkeszthető (canEditProfil), különben az olvasó nézetre.
//
// Frissülés: a mentBlokkAction, a valasztEvAction és a felhasználó-műveletek
// revalidatePath('/', 'layout')-ot hívnak; kliens-oldali navigációnál a layout nem fut újra
// (ugyanaz az elfogadott késés, mint az olvasatlan-számlálónál).

const SZOVEG = '#8d97a5';
const CIM = '#c3cbd6';
const LINK = '#a3adbb';

function Potty({ allapot }: { allapot: Allapot }) {
  return (
    <span aria-hidden style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: ALLAPOT_SZINEK[allapot], flex: '0 0 8px',
    }} />
  );
}

function Keret({ cim, link, children }: { cim: string; link?: { href: string; felirat: string }; children: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 18px', borderTop: '1px solid #232c39', fontSize: 11.5, color: SZOVEG, lineHeight: 1.6 }}>
      <div style={{ color: CIM, fontWeight: 600 }}>{cim}</div>
      <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>{children}</div>
      {link && (
        <Link href={link.href} style={{ display: 'inline-block', marginTop: 6, color: LINK, textDecoration: 'none', fontWeight: 500 }}>
          {link.felirat} <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}

export default function OldalsavAllapot({ session, ev, most }: { session: AppSession; ev: number; most: number }) {
  if (session.role === 'admin') {
    const szamok: Record<Allapot, number> = { friss: 0, elavult: 0, nincs: 0 };
    for (const o of listTerkepAdat(ev)) szamok[o.allapot] += 1;
    return (
      <Keret cim={`Országprofilok · ${ev}`} link={{ href: '/terkep', felirat: 'Térkép' }}>
        {ALLAPOTOK.map((a) => (
          <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Potty allapot={a} />
            <span>{ALLAPOT_CIMKE[a]}</span>
            <span style={{ marginLeft: 'auto', color: CIM, fontVariantNumeric: 'tabular-nums' }}>{szamok[a]}</span>
          </div>
        ))}
      </Keret>
    );
  }

  if (session.orszagok.length === 0) return null;
  return (
    <Keret cim={`${session.orszagok.length > 1 ? 'Országprofilok' : 'Országprofil'} · ${ev}`}>
      {session.orszagok.map((o) => {
        const utolsoEv = getUtolsoEv(o.kod, ev);
        const allapot = profilAllapot(utolsoEv, ev);
        const szerkesztheto = canEditProfil(session, o.kod, ev, most);
        return (
          <Link
            key={o.kod}
            href={szerkesztheto ? `/orszagprofil/${o.kod}/szerkesztes` : `/orszagprofil/${o.kod}`}
            style={{ display: 'flex', flexDirection: 'column', padding: '2px 0', color: SZOVEG, textDecoration: 'none' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: CIM }}>
              <Potty allapot={allapot} />
              {orszagNev(o.kod)}
            </span>
            <span style={{ paddingLeft: 16 }}>
              {ALLAPOT_CIMKE[allapot]}{allapot === 'elavult' && utolsoEv ? ` · ${utolsoEv}` : ''}
              <span style={{ color: LINK, fontWeight: 500 }}> · {szerkesztheto ? 'Szerkesztés' : 'Megnyitás'} <span aria-hidden>→</span></span>
            </span>
          </Link>
        );
      })}
    </Keret>
  );
}
```

- [ ] **Step 2: `components/AppShell.tsx` – a szerep-felirat**

Import (a fájl idézőjel-stílusával): `import { szekhelyKod } from "../lib/attase-orszag";`. A `roleLabel`:

```tsx
  // Attasé: a székhely országa, további (régiós) országoknál „+N".
  const szekhely = szekhelyKod(user.orszagok);
  const tovabbi = user.orszagok.length - (szekhely ? 1 : 0);
  const roleLabel =
    user.role === "admin"
      ? "NIÜ admin"
      : `TéT attasé${szekhely ? " · " + orszagNev(szekhely) : ""}${tovabbi > 0 ? ` +${tovabbi}` : ""}`;
```

- [ ] **Step 3: Típusellenőrzés, commit**

```bash
npx tsc --noEmit
git add "app/(app)/components/OldalsavAllapot.tsx" components/AppShell.tsx
git commit -m "$(printf 'feat(attase-orszagok): oldalsáv-kártya országonkénti sorokkal, felhasználói blokk „székhely +N” felirattal\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 8: Riport – ország-választó több országnál

**Files:**
- Modify: `components/riport/RiportForm.tsx`, `app/(app)/uj-riport/page.tsx`, `app/(app)/uj-riport/actions.ts`

- [ ] **Step 1: `RiportForm.tsx`**

Import: `import { NativeSelect } from '../form/NativeSelect';`. A props-típus és a szignatúra:

```tsx
/** Létrehozásnál nincs `initial`, szerkesztésnél kötelező – a típus is ezt kényszeríti ki. */
export type RiportFormProps = { action: FormAction } & (
  /** `orszagok`: a beadó saját országai (székhely elöl); több országnál választó jelenik meg. */
  | { mode: 'create'; initial?: undefined; orszagok?: readonly { kod: string; nev: string }[] }
  | { mode: 'edit'; initial: RiportDetail; orszagok?: undefined }
);

export function RiportForm({ mode, initial, action, orszagok }: RiportFormProps) {
```

A vezérelt mezők közé (a `kategoria` state elé):

```tsx
  const [orszag, setOrszag] = useState(orszagok?.[0]?.kod ?? '');
```

A `<form …>` első gyermeke (a Kategória `<section>` elé):

```tsx
      {orszagok && orszagok.length > 1 && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="orszag">Ország</Label>
          <NativeSelect
            id="orszag"
            name="orszag"
            className="max-w-sm"
            value={orszag}
            onChange={(e) => setOrszag(e.target.value)}
            {...hibaAttr(errors, 'orszag')}
          >
            {orszagok.map((o) => (
              <option key={o.kod} value={o.kod}>
                {o.nev}
              </option>
            ))}
          </NativeSelect>
          <MezoHiba mezo="orszag" errors={errors} />
        </div>
      )}
```

- [ ] **Step 2: `app/(app)/uj-riport/page.tsx` – teljes fájl**

```tsx
import type { Metadata } from 'next';
import { RiportForm } from '../../../components/riport/RiportForm';
import { orszagNev } from '../../../lib/orszagok';
import { requireSession } from '../../../lib/session';
import { createRiportAction } from './actions';

export const metadata: Metadata = { title: 'Új bejegyzés' };

export default async function UjRiportPage() {
  const session = await requireSession();
  if (session.orszagok.length === 0) {
    if (session.role === 'admin') {
      return (
        <div className="max-w-3xl rounded-xl border border-border bg-card p-6 text-sm">
          <p className="font-medium">Adminként nem adhatsz be bejegyzést.</p>
          <p className="mt-1 text-muted-foreground">Bejegyzést TéT poszthoz rendelt attasé fiók adhat be.</p>
        </div>
      );
    }
    return (
      <div className="max-w-3xl rounded-xl border border-border bg-card p-6 text-sm">
        <p className="font-medium">A fiókodhoz nincs ország rendelve.</p>
        <p className="mt-1 text-muted-foreground">
          Bejegyzést csak TéT poszthoz rendelt fiókkal lehet beadni. Kérd az admint, hogy állítsa be az országot.
        </p>
      </div>
    );
  }
  // A választható országok a session sorrendjében (székhely elöl), magyar névvel.
  const orszagok = session.orszagok.map((o) => ({ kod: o.kod, nev: orszagNev(o.kod) }));
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {orszagok.length === 1 ? (
          <>
            A bejegyzés a(z) <span className="font-medium text-foreground">{orszagok[0].nev}</span> poszthoz kerül, a te
            neveddel.
          </>
        ) : (
          'A bejegyzés a lent választott országhoz kerül, a te neveddel.'
        )}
      </p>
      <RiportForm mode="create" action={createRiportAction} orszagok={orszagok.length > 1 ? orszagok : undefined} />
    </div>
  );
}
```

- [ ] **Step 3: `app/(app)/uj-riport/actions.ts` – teljes fájl**

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';
import { createRiport } from '../../../db/queries/riport';
import { fajlokCsatolmannya } from '../../../lib/riport-fajl';
import { parseRiportForm } from '../../../lib/riport-validacio';
import { requireSession } from '../../../lib/session';
import { mezo } from '../../../lib/urlap';
import type { MuveletState } from '../../../components/form/useMuveletForm';

export type RiportFormState = MuveletState;

const NINCS_ORSZAG = 'A fiókodhoz nincs ország rendelve, ezért nem adhatsz be bejegyzést.';

export async function createRiportAction(_prev: RiportFormState, formData: FormData): Promise<RiportFormState> {
  const session = await requireSession();
  if (session.orszagok.length === 0) return { errors: { form: NINCS_ORSZAG } };
  // Egy országnál nincs választó: az az ország. Többnél a beküldött értéknek a saját országok közt kell lennie.
  const orszag = session.orszagok.length === 1 ? session.orszagok[0].kod : mezo(formData, 'orszag');
  const orszagHiba = session.orszagok.some((o) => o.kod === orszag) ? null : 'Válassz a saját országaid közül.';
  const parsed = parseRiportForm(formData);
  if (!parsed.ok || orszagHiba) {
    return { errors: { ...(parsed.ok ? {} : parsed.errors), ...(orszagHiba ? { orszag: orszagHiba } : {}) } };
  }

  let id: string;
  try {
    const csatolmanyok = await fajlokCsatolmannya(parsed.fajlok);
    id = createRiport({ ...parsed.data, szerzoId: session.userId, orszag }, csatolmanyok);
  } catch (err) {
    unstable_rethrow(err);
    console.error('[riport] createRiport sikertelen:', err);
    return { errors: { form: 'Mentés sikertelen, próbáld újra.' } };
  }
  revalidatePath('/riportok');
  redirect(`/riportok/${id}`);
}
```

- [ ] **Step 4: Típusellenőrzés, commit**

```bash
npx tsc --noEmit
git add components/riport/RiportForm.tsx "app/(app)/uj-riport/page.tsx" "app/(app)/uj-riport/actions.ts"
git commit -m "$(printf 'feat(attase-orszagok): riport beadásakor több országnál ország-választó, az action a saját országokra szűr\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 9: Ticket – címzett a székhellyel

**Files:**
- Modify: `db/queries/ticket.ts`, `app/(app)/kommunikacio/components/UjTicketDialog.tsx`

- [ ] **Step 1: `listCimzettJeloltek`**

Import: a schema-importba `attaseOrszag` (`import { attaseOrszag, ticket, ticketOlvasas, ticketUzenet, user } from '../schema';`). A függvény:

```ts
/**
 * Az admin új-ticket dialógusához: nem tiltott attasék, akiknek van székhelye, magyar
 * névsorrendben; az `orszag` a székhely kódja (a ticket pillanatképe).
 */
export function listCimzettJeloltek(): CimzettJelolt[] {
  const most = Date.now();
  return db
    .select({
      id: user.id,
      nev: user.name,
      orszag: attaseOrszag.orszagKod,
      role: user.role,
      banned: user.banned,
      banExpires: user.banExpires,
    })
    .from(user)
    .innerJoin(attaseOrszag, and(eq(attaseOrszag.userId, user.id), eq(attaseOrszag.szekhely, true)))
    .all()
    .filter((u) => u.role !== 'admin' && !tiltottE(u, most))
    .map((u) => ({ id: u.id, nev: u.nev, orszag: u.orszag }))
    .sort((a, b) => a.nev.localeCompare(b.nev, 'hu'));
}
```

- [ ] **Step 2: Üres állapot szövege (`UjTicketDialog.tsx`)**

`Nincs címezhető attasé: a Felhasználók oldalon hozz létre attasét országgal.` → `Nincs címezhető attasé: a Felhasználók oldalon hozz létre attasét székhellyel.`

- [ ] **Step 3: Típusellenőrzés, commit**

```bash
npx tsc --noEmit
git add db/queries/ticket.ts "app/(app)/kommunikacio/components/UjTicketDialog.tsx"
git commit -m "$(printf 'feat(attase-orszagok): ticket-címzettek a székhely-országgal\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 10: Felhasználó-dialógus – új blokk-komponensek

A komponensek ebben a taskban még nincsenek bekötve (a 11. task köti be); csak a `lib/attase-orszag.ts`-től és a közös form-elemektől függenek.

**Files:**
- Create: `app/(app)/felhasznalok/components/Blokk.tsx`, `ElerhetosegMezok.tsx`, `VezetoJelolo.tsx`, `OrszagMezok.tsx`

- [ ] **Step 1: `Blokk.tsx`**

```tsx
import type { ReactNode } from 'react';

/** Egy űrlap-blokk a felhasználó-dialógusokban: felső elválasztó vonal, a cím a vonalon ül (fieldset + legend). */
export function Blokk({ cim, children }: { cim: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2 border-t border-border pt-3">
      <legend className="pr-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{cim}</legend>
      {children}
    </fieldset>
  );
}
```

- [ ] **Step 2: `ElerhetosegMezok.tsx`**

```tsx
'use client';

import { hibaAttr } from '../../../../components/form/MezoHiba';
import { Mezo } from '../../../../components/form/Mezo';
import { Input } from '../../../../components/ui/input';
import { EMAIL_MAX, TELEFON_MAX } from '../../../../lib/felhasznalo-validacio';
import type { MezoHibak } from '../../../../lib/urlap';
import { Blokk } from './Blokk';

/** A dialógusok vezérelt elérhetőség-mezői (mindkét szerepkörnél; az űrlap nyers értéke). */
export interface ElerhetosegErtekek {
  telefon: string;
  kapcsolatEmail: string;
}

export const URES_ELERHETOSEG: ElerhetosegErtekek = { telefon: '', kapcsolatEmail: '' };

/** Telefon és kapcsolattartási e-mail; a mező id-ja = name = a validátor hibakulcsa. */
export function ElerhetosegMezok({
  ertekek,
  onChange,
  errors,
}: {
  ertekek: ElerhetosegErtekek;
  onChange: (ertekek: ElerhetosegErtekek) => void;
  errors: MezoHibak;
}) {
  return (
    <Blokk cim="Elérhetőség">
      <div className="grid gap-3 sm:grid-cols-2">
        <Mezo id="telefon" cimke="Telefon" errors={errors}>
          <Input
            id="telefon"
            name="telefon"
            type="tel"
            inputMode="tel"
            maxLength={TELEFON_MAX}
            autoComplete="off"
            placeholder="pl. +49 30 1234 5678"
            value={ertekek.telefon}
            onChange={(e) => onChange({ ...ertekek, telefon: e.target.value })}
            {...hibaAttr(errors, 'telefon')}
          />
        </Mezo>
        <Mezo id="kapcsolatEmail" cimke="Kapcsolattartási e-mail" errors={errors}>
          <Input
            id="kapcsolatEmail"
            name="kapcsolatEmail"
            type="email"
            maxLength={EMAIL_MAX}
            autoComplete="off"
            value={ertekek.kapcsolatEmail}
            onChange={(e) => onChange({ ...ertekek, kapcsolatEmail: e.target.value })}
            {...hibaAttr(errors, 'kapcsolatEmail')}
          />
        </Mezo>
      </div>
    </Blokk>
  );
}
```

- [ ] **Step 3: `VezetoJelolo.tsx`**

```tsx
'use client';

import { vezetoSugo, type VezetoHelyzet } from '../../../../lib/attase-orszag';

/**
 * Relációs vezető jelölő egy országhoz (natív checkbox: a components/ui-ban nincs checkbox).
 * Ha az országnak nincs más attaséja, bejelölt és letiltott – egyedüli attasé, automatikusan
 * vezető; a letiltott checkbox nem küldődik be, ezért ilyenkor rejtett mező viszi az `on`
 * értéket. A súgót a hívó helyezi el (`VezetoSugo`), hogy a régiós sorban a sor alá kerüljön.
 */
export function VezetoJelolo({
  id,
  name,
  cimke,
  bejelolve,
  onChange,
  helyzet,
}: {
  id: string;
  name: string;
  cimke: string;
  bejelolve: boolean;
  onChange: (bejelolve: boolean) => void;
  helyzet: VezetoHelyzet;
}) {
  const egyedul = helyzet.masok === 0;
  const vanSugo = vezetoSugo(helyzet, bejelolve) !== null;
  return (
    <label className="flex shrink-0 items-center gap-2 text-sm">
      <input
        type="checkbox"
        id={id}
        name={egyedul ? undefined : name}
        checked={egyedul || bejelolve}
        disabled={egyedul}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={vanSugo ? `${id}-sugo` : undefined}
        className="size-4 accent-primary"
      />
      {cimke}
      {egyedul && <input type="hidden" name={name} value="on" />}
    </label>
  );
}

/** A jelölő súgója (`<id>-sugo`); semmit nem renderel, ha nincs mit mondani. */
export function VezetoSugo({ id, helyzet, bejelolve }: { id: string; helyzet: VezetoHelyzet; bejelolve: boolean }) {
  const sugo = vezetoSugo(helyzet, bejelolve);
  return sugo ? <p id={`${id}-sugo`} className="text-xs text-muted-foreground">{sugo}</p> : null;
}
```

- [ ] **Step 4: `OrszagMezok.tsx`**

```tsx
'use client';

import { XIcon } from 'lucide-react';
import { hibaAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { Mezo } from '../../../../components/form/Mezo';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import {
  alapVezeto, REGIO_MAX, RESZTERULET_MAX, VAROS_MAX, vezetoHelyzet, type AttaseOrszag, type OrszagTagok,
} from '../../../../lib/attase-orszag';
import { ORSZAGOK, orszagNev } from '../../../../lib/orszagok';
import type { MezoHibak } from '../../../../lib/urlap';
import { Blokk } from './Blokk';
import { VezetoJelolo, VezetoSugo } from './VezetoJelolo';

/** Egy régiós sor; az `id` stabil kliens-kulcs (a sorok törölhetők, a pozíció változik). */
export interface RegioSor {
  id: number;
  kod: string;
  vezeto: boolean;
}

/** A dialógusok vezérelt ország-mezői (az űrlap nyers értékei). */
export interface OrszagErtekek {
  szekhely: { kod: string; varos: string; reszterulet: string; vezeto: boolean };
  regio: RegioSor[];
}

export const URES_ORSZAGOK: OrszagErtekek = {
  szekhely: { kod: '', varos: '', reszterulet: '', vezeto: false },
  regio: [],
};

/** Kezdőértékek a meglévő hozzárendelésekből (szerkesztés dialógus). */
export function orszagErtekek(orszagok: readonly AttaseOrszag[]): OrszagErtekek {
  const sz = orszagok.find((o) => o.szekhely);
  return {
    szekhely: { kod: sz?.kod ?? '', varos: sz?.varos ?? '', reszterulet: sz?.reszterulet ?? '', vezeto: sz?.vezeto ?? false },
    regio: orszagok.filter((o) => !o.szekhely).map((o, i) => ({ id: i + 1, kod: o.kod, vezeto: o.vezeto })),
  };
}

function OrszagOpciok() {
  return (
    <>
      <option value="">Válassz országot…</option>
      {ORSZAGOK.map((o) => (
        <option key={o.kod} value={o.kod}>
          {o.nev}
        </option>
      ))}
    </>
  );
}

/**
 * Székhely (ország, poszt városa, részterület, vezető-jelölő) és régiós lefedettség (soronként
 * ország + vezető-jelölő). A mezőnevek a validátoréi (`szekhely.<mezo>`, `regio.<i>.<mezo>`,
 * az `i` a sor aktuális pozíciója); az id = name = hibakulcs. Országválasztáskor a vezető-jelölő
 * alapértéke az `alapVezeto` szerint újraszámolódik. `sajatId`: a szerkesztett felhasználó (új
 * felhasználónál null) – a vezető-helyzet a többi attasé alapján számol.
 */
export function OrszagMezok({
  ertekek,
  onChange,
  errors,
  orszagTagok,
  sajatId,
}: {
  ertekek: OrszagErtekek;
  onChange: (ertekek: OrszagErtekek) => void;
  errors: MezoHibak;
  orszagTagok: OrszagTagok;
  sajatId: string | null;
}) {
  const { szekhely, regio } = ertekek;
  const helyzet = (kod: string) => vezetoHelyzet(kod, sajatId, orszagTagok);
  const setSzekhely = (resz: Partial<OrszagErtekek['szekhely']>) =>
    onChange({ ...ertekek, szekhely: { ...szekhely, ...resz } });
  const setSor = (id: number, resz: Partial<RegioSor>) =>
    onChange({ ...ertekek, regio: regio.map((r) => (r.id === id ? { ...r, ...resz } : r)) });
  const ujSor = () =>
    onChange({ ...ertekek, regio: [...regio, { id: Math.max(0, ...regio.map((r) => r.id)) + 1, kod: '', vezeto: false }] });
  const torolSor = (id: number) => onChange({ ...ertekek, regio: regio.filter((r) => r.id !== id) });

  return (
    <>
      <Blokk cim="Székhely">
        <div className="grid gap-3 sm:grid-cols-2">
          <Mezo id="szekhely.orszag" cimke="Ország" errors={errors}>
            <NativeSelect
              id="szekhely.orszag"
              name="szekhely.orszag"
              required
              value={szekhely.kod}
              onChange={(e) => setSzekhely({ kod: e.target.value, vezeto: alapVezeto(helyzet(e.target.value)) })}
              {...hibaAttr(errors, 'szekhely.orszag')}
            >
              <OrszagOpciok />
            </NativeSelect>
          </Mezo>
          <Mezo id="szekhely.varos" cimke="Poszt városa" errors={errors}>
            <Input
              id="szekhely.varos"
              name="szekhely.varos"
              maxLength={VAROS_MAX}
              autoComplete="off"
              placeholder="pl. Stuttgart"
              value={szekhely.varos}
              onChange={(e) => setSzekhely({ varos: e.target.value })}
              {...hibaAttr(errors, 'szekhely.varos')}
            />
          </Mezo>
        </div>
        <Mezo id="szekhely.reszterulet" cimke="Részterület (opcionális)" errors={errors}>
          <Textarea
            id="szekhely.reszterulet"
            name="szekhely.reszterulet"
            rows={2}
            maxLength={RESZTERULET_MAX}
            placeholder="Ha több attasé dolgozik az országban: a lefedett tartományok, államok"
            value={szekhely.reszterulet}
            onChange={(e) => setSzekhely({ reszterulet: e.target.value })}
            {...hibaAttr(errors, 'szekhely.reszterulet')}
          />
        </Mezo>
        {szekhely.kod && (
          <div className="flex flex-col gap-1">
            <VezetoJelolo
              id="szekhely.vezeto"
              name="szekhely.vezeto"
              cimke="Relációs vezető (országprofil-felelős)"
              bejelolve={szekhely.vezeto}
              onChange={(v) => setSzekhely({ vezeto: v })}
              helyzet={helyzet(szekhely.kod)}
            />
            <VezetoSugo id="szekhely.vezeto" helyzet={helyzet(szekhely.kod)} bejelolve={szekhely.vezeto} />
          </div>
        )}
      </Blokk>
      <Blokk cim="Régiós lefedettség">
        {regio.length === 0 && <p className="text-sm text-muted-foreground">Nincs regionálisan lefedett ország.</p>}
        {regio.map((r, i) => {
          const p = `regio.${i}.`;
          return (
            <div key={r.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <NativeSelect
                  id={`${p}orszag`}
                  name={`${p}orszag`}
                  aria-label={`Régiós ország (${i + 1}.)`}
                  className="flex-1"
                  value={r.kod}
                  onChange={(e) => setSor(r.id, { kod: e.target.value, vezeto: alapVezeto(helyzet(e.target.value)) })}
                  {...hibaAttr(errors, `${p}orszag`)}
                >
                  <OrszagOpciok />
                </NativeSelect>
                {r.kod && (
                  <VezetoJelolo
                    id={`${p}vezeto`}
                    name={`${p}vezeto`}
                    cimke="Vezető"
                    bejelolve={r.vezeto}
                    onChange={(v) => setSor(r.id, { vezeto: v })}
                    helyzet={helyzet(r.kod)}
                  />
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${r.kod ? orszagNev(r.kod) : 'Üres sor'} eltávolítása`}
                  onClick={() => torolSor(r.id)}
                >
                  <XIcon />
                </Button>
              </div>
              <MezoHiba mezo={`${p}orszag`} errors={errors} />
              {r.kod && <VezetoSugo id={`${p}vezeto`} helyzet={helyzet(r.kod)} bejelolve={r.vezeto} />}
            </div>
          );
        })}
        {regio.length < REGIO_MAX && (
          <Button type="button" variant="outline" size="sm" className="self-start" onClick={ujSor}>
            + Ország hozzáadása
          </Button>
        )}
      </Blokk>
    </>
  );
}
```

- [ ] **Step 5: Típusellenőrzés, commit**

```bash
npx tsc --noEmit
git add "app/(app)/felhasznalok/components/Blokk.tsx" "app/(app)/felhasznalok/components/ElerhetosegMezok.tsx" "app/(app)/felhasznalok/components/VezetoJelolo.tsx" "app/(app)/felhasznalok/components/OrszagMezok.tsx"
git commit -m "$(printf 'feat(attase-orszagok): felhasználó-dialógus blokkjai – elérhetőség, székhely, régiós lefedettség, vezető-jelölő súgóval\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 11: Felhasználó-kezelés bekötése (validátor, lekérdezés, action-ök, oldal, dialógusok, tábla)

**Files:**
- Modify: `lib/felhasznalo-validacio.ts`, `db/queries/felhasznalo.ts`, `app/(app)/felhasznalok/actions.ts`, `app/(app)/felhasznalok/page.tsx`, `app/(app)/felhasznalok/components/{UjFelhasznaloDialog,SzerkesztesDialog,FelhasznaloTabla,FelhasznaloMuveletek}.tsx`, `components/form/MuveletDialog.tsx`
- Create: `app/(app)/felhasznalok/components/VezetoFigyelmeztetes.tsx`
- Delete: `app/(app)/felhasznalok/components/AttaseMezok.tsx`
- Test (eldobható): `scripts/_felhasznalo-validacio-check.ts`

- [ ] **Step 1: A bukó validátor-ellenőrzés**

`scripts/_felhasznalo-validacio-check.ts`:

```ts
import assert from 'node:assert/strict';
import { parseSzerkesztes, parseUjFelhasznalo } from '../lib/felhasznalo-validacio';

function fd(o: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
}

// Attasé székhely nélkül → hiba a szekhely.orszag kulcson.
const r1 = parseSzerkesztes(fd({ nev: 'Kiss Anna', szerepkor: 'attase' }));
assert.ok(!r1.ok && r1.errors['szekhely.orszag'] === 'TéT attasénál a székhely országa kötelező.');

// Teljes attasé: székhely várossal és vezetővel, régiós sorok (az üres kimarad).
const r2 = parseSzerkesztes(fd({
  nev: 'Szántó Szilvia', szerepkor: 'attase',
  'szekhely.orszag': 'FR', 'szekhely.varos': 'Párizs', 'szekhely.reszterulet': '', 'szekhely.vezeto': 'on',
  'regio.0.orszag': 'DZ', 'regio.0.vezeto': 'on', 'regio.1.orszag': '', 'regio.2.orszag': 'MA',
}));
assert.ok(r2.ok);
if (r2.ok) {
  assert.deepEqual(r2.data.orszagok, [
    { kod: 'FR', szekhely: true, vezeto: true, varos: 'Párizs', reszterulet: null },
    { kod: 'DZ', szekhely: false, vezeto: true, varos: null, reszterulet: null },
    { kod: 'MA', szekhely: false, vezeto: false, varos: null, reszterulet: null },
  ]);
}

// Ismétlődő ország (a székhely régióként is) és ismeretlen kód → soronkénti hiba.
const r3 = parseSzerkesztes(fd({
  nev: 'X', szerepkor: 'attase', 'szekhely.orszag': 'FR', 'regio.0.orszag': 'FR', 'regio.1.orszag': 'XX',
}));
assert.ok(!r3.ok);
if (!r3.ok) {
  assert.equal(r3.errors['regio.0.orszag'], 'Ez az ország már szerepel.');
  assert.equal(r3.errors['regio.1.orszag'], 'Válassz országot a listából.');
}

// Korlátok: város, részterület, régiós sorok száma.
const r4 = parseSzerkesztes(fd({
  nev: 'X', szerepkor: 'attase', 'szekhely.orszag': 'DE', 'szekhely.varos': 'a'.repeat(101), 'szekhely.reszterulet': 'b'.repeat(1001),
}));
assert.ok(!r4.ok && r4.errors['szekhely.varos'] && r4.errors['szekhely.reszterulet']);
const sok = fd({ nev: 'X', szerepkor: 'attase', 'szekhely.orszag': 'DE' });
for (let i = 0; i < 21; i++) sok.set(`regio.${i}.orszag`, '');
const r5 = parseSzerkesztes(sok);
assert.ok(!r5.ok && r5.errors.form === 'Legfeljebb 20 régiós ország adható meg.');

// A részterület sortörése megmarad (CRLF → LF).
const r6 = parseSzerkesztes(fd({ nev: 'X', szerepkor: 'attase', 'szekhely.orszag': 'US', 'szekhely.reszterulet': 'Alabama,\r\nAlaszka' }));
assert.ok(r6.ok && r6.data.orszagok[0].reszterulet === 'Alabama,\nAlaszka');

// Admin: az ország-mezőket hiba nélkül eldobja; az elérhetőség marad.
const r7 = parseUjFelhasznalo(fd({
  nev: 'Admin', email: 'a@niu.hu', jelszo: '12345678', szerepkor: 'admin', telefon: '+36 1 234 5678',
  'szekhely.orszag': 'XX', 'regio.0.orszag': 'YY',
}));
assert.ok(r7.ok && r7.data.orszagok.length === 0 && r7.data.telefon === '+36 1 234 5678');
console.log('felhasznalo-validacio: minden ellenőrzés rendben');
```

Run: `npx tsx scripts/_felhasznalo-validacio-check.ts` → FAIL (az első assert: a régi validátor `orszag` kulcsot ad).

- [ ] **Step 2: `lib/felhasznalo-validacio.ts`**

A fejléc-komment új szövege:

```ts
/**
 * Tiszta validátorok az admin felhasználó-kezelő űrlapjaihoz (FormData → típusos input).
 * Nincs React, nincs DB. Minden hibát egy menetben gyűjtünk (egy üres űrlap az összes
 * mezőhibát visszaadja). A MezoHibak kulcsai a mezőnevek; a `form` kulcs a nem mezőhöz
 * kötött hibáké (a server action-ök használják). A szöveg-tisztítás (láthatatlan és
 * vezérlőkarakterek) a közös `lib/urlap.ts` `mezo()`-jából jön. Az e-mail trim + kisbetű
 * (a Better Auth is kisbetűsít); a jelszót szándékosan nem trimmeljük.
 * Az attasé országai (`lib/attase-orszag.ts`): kötelező székhely (`szekhely.orszag`,
 * `szekhely.varos`, `szekhely.reszterulet`, `szekhely.vezeto`) és opcionális régiós sorok
 * (`regio.<i>.orszag`, `regio.<i>.vezeto`); az ország a lib/orszagok.ts szótár ISO-kódja.
 * Adminnál az országok hiba nélkül üres listát adnak. A telefon és a kapcsolattartási e-mail
 * mindkét szerepkörnél opcionális.
 */
import { REGIO_MAX, RESZTERULET_MAX, VAROS_MAX, type AttaseOrszag } from './attase-orszag';
import { orszagByKod } from './orszagok';
import { mezo, type MezoHibak } from './urlap';
```

Az `AttaseAdatok`, `UjFelhasznaloInput`, `SzerkesztesInput` helyett:

```ts
/** Az elérhetőségek (mindkét szerepkörnél opcionálisak). */
export interface ElerhetosegAdatok {
  telefon: string | null;
  kapcsolatEmail: string | null;
}

export interface UjFelhasznaloInput extends ElerhetosegAdatok {
  nev: string;
  email: string;
  jelszo: string;
  szerepkor: Szerepkor;
  /** Attasénál a székhely és a régiós országok; adminnál üres. */
  orszagok: AttaseOrszag[];
}

export interface SzerkesztesInput extends ElerhetosegAdatok {
  nev: string;
  szerepkor: Szerepkor;
  orszagok: AttaseOrszag[];
}
```

Töröld: `validOrszag`, `TERULET_HIBA`, `TERULET_RE` (a kommentjével), `POSZT_CIMKE`, `validPosztSzoveg`, `validTerulet`, `parseAttaseAdatok`. Maradnak: `EMAIL_RE`, `raw`, `validNev`, `validJelszo`, `validSzerepkor`, `TELEFON_MAX`, `EMAIL_MAX`, `TELEFON_RE`, `validTelefon`, `validKapcsolatEmail`, `parseJelszo`.

A `validKapcsolatEmail` után:

```ts
function parseElerhetoseg(fd: FormData, errors: MezoHibak): ElerhetosegAdatok {
  return {
    telefon: validTelefon(mezo(fd, 'telefon'), errors),
    kapcsolatEmail: validKapcsolatEmail(mezo(fd, 'kapcsolatEmail').toLowerCase(), errors),
  };
}

const ORSZAG_LISTABOL = 'Válassz országot a listából.';

/**
 * Az attasé országai: a székhely kötelező (ország + opcionális város és részterület), a régiós
 * sorok közül az ország nélküli kimarad, a már szereplő ország hibás. Adminnál (és érvénytelen
 * szerepkörnél) üres lista, hiba nélkül. A bejelölt checkbox `on` értéket küld.
 */
function parseOrszagok(fd: FormData, szerepkor: Szerepkor | null, errors: MezoHibak): AttaseOrszag[] {
  if (szerepkor !== 'attase') return [];
  const sorok: AttaseOrszag[] = [];
  const kod = mezo(fd, 'szekhely.orszag');
  const varos = mezo(fd, 'szekhely.varos');
  const reszterulet = mezo(fd, 'szekhely.reszterulet');
  if (!kod) errors['szekhely.orszag'] = 'TéT attasénál a székhely országa kötelező.';
  else if (!orszagByKod(kod)) errors['szekhely.orszag'] = ORSZAG_LISTABOL;
  if (varos.length > VAROS_MAX) errors['szekhely.varos'] = `A város legfeljebb ${VAROS_MAX} karakter.`;
  if (reszterulet.length > RESZTERULET_MAX) {
    errors['szekhely.reszterulet'] = `A részterület legfeljebb ${RESZTERULET_MAX} karakter.`;
  }
  if (kod && orszagByKod(kod)) {
    sorok.push({
      kod,
      szekhely: true,
      vezeto: fd.get('szekhely.vezeto') === 'on',
      varos: varos || null,
      reszterulet: reszterulet || null,
    });
  }
  // A régiós sorok indexe folytonos (a dialógus a pozíció szerint nevez); a REGIO_MAX feletti rész hiba.
  for (let i = 0; fd.has(`regio.${i}.orszag`); i++) {
    if (i >= REGIO_MAX) {
      errors.form = `Legfeljebb ${REGIO_MAX} régiós ország adható meg.`;
      break;
    }
    const kulcs = `regio.${i}.orszag`;
    const k = mezo(fd, kulcs);
    if (!k) continue;
    if (!orszagByKod(k)) errors[kulcs] = ORSZAG_LISTABOL;
    else if (sorok.some((s) => s.kod === k)) errors[kulcs] = 'Ez az ország már szerepel.';
    else sorok.push({ kod: k, szekhely: false, vezeto: fd.get(`regio.${i}.vezeto`) === 'on', varos: null, reszterulet: null });
  }
  return sorok;
}
```

A két parse:

```ts
export function parseUjFelhasznalo(fd: FormData): ParseResult<UjFelhasznaloInput> {
  const errors: MezoHibak = {};
  const nev = mezo(fd, 'nev');
  const email = mezo(fd, 'email').toLowerCase();
  const jelszo = raw(fd, 'jelszo');
  validNev(nev, errors);
  if (!email) errors.email = 'Az e-mail cím kötelező.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Érvénytelen e-mail cím.';
  validJelszo(jelszo, errors);
  const szerepkor = validSzerepkor(mezo(fd, 'szerepkor'), errors);
  const elerhetoseg = parseElerhetoseg(fd, errors);
  const orszagok = parseOrszagok(fd, szerepkor, errors);
  if (Object.keys(errors).length > 0 || !szerepkor) return { ok: false, errors };
  return { ok: true, data: { nev, email, jelszo, szerepkor, ...elerhetoseg, orszagok } };
}

export function parseSzerkesztes(fd: FormData): ParseResult<SzerkesztesInput> {
  const errors: MezoHibak = {};
  const nev = mezo(fd, 'nev');
  validNev(nev, errors);
  const szerepkor = validSzerepkor(mezo(fd, 'szerepkor'), errors);
  const elerhetoseg = parseElerhetoseg(fd, errors);
  const orszagok = parseOrszagok(fd, szerepkor, errors);
  if (Object.keys(errors).length > 0 || !szerepkor) return { ok: false, errors };
  return { ok: true, data: { nev, szerepkor, ...elerhetoseg, orszagok } };
}
```

Run: `npx tsx scripts/_felhasznalo-validacio-check.ts` → `felhasznalo-validacio: minden ellenőrzés rendben`.

- [ ] **Step 3: `db/queries/felhasznalo.ts` – teljes fájl**

```ts
import 'server-only';
import { db } from '../index';
import { user } from '../schema';
import { listOrszagokFelhasznalonkent } from './attase-orszag';
import type { AttaseOrszag } from '../../lib/attase-orszag';
import type { ElerhetosegAdatok, Szerepkor } from '../../lib/felhasznalo-validacio';
import { tiltottE } from '../../lib/felhasznalo-tiltas';

export interface FelhasznaloSor extends ElerhetosegAdatok {
  id: string;
  nev: string;
  email: string;
  szerepkor: Szerepkor;
  /** Székhely elöl, utána a régiós országok magyar név szerint; adminnál üres. */
  orszagok: AttaseOrszag[];
  tiltott: boolean;
  letrehozva: Date;
}

/**
 * Minden felhasználó magyar név szerinti sorrendben, az országaival. Szinkron (better-sqlite3).
 * A rendezés JS-ben (localeCompare 'hu'): a SQLite BINARY collation az ékezetes neveket
 * (Ács, Örkény, Ürmös) a lista végére tenné. Néhány tucat sorra ez elhanyagolható.
 */
export function listFelhasznalok(): FelhasznaloSor[] {
  const now = Date.now();
  const orszagok = listOrszagokFelhasznalonkent();
  return db
    .select({
      id: user.id,
      nev: user.name,
      email: user.email,
      role: user.role,
      telefon: user.telefon,
      kapcsolatEmail: user.kapcsolatEmail,
      banned: user.banned,
      banExpires: user.banExpires,
      createdAt: user.createdAt,
    })
    .from(user)
    .all()
    .map((r) => ({
      id: r.id,
      nev: r.nev,
      email: r.email,
      szerepkor: r.role === 'admin' ? ('admin' as const) : ('attase' as const),
      telefon: r.telefon ?? null,
      kapcsolatEmail: r.kapcsolatEmail ?? null,
      orszagok: orszagok.get(r.id) ?? [],
      tiltott: tiltottE(r, now),
      letrehozva: r.createdAt,
    }))
    .sort((a, b) => a.nev.localeCompare(b.nev, 'hu'));
}
```

- [ ] **Step 4: `app/(app)/felhasznalok/actions.ts`**

Importok:

```ts
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { unstable_rethrow } from 'next/navigation';
import type { MuveletState } from '../../../components/form/useMuveletForm';
import { normalizalVezetok, setAttaseOrszagok } from '../../../db/queries/attase-orszag';
import { auth } from '../../../lib/auth';
import type { AttaseOrszag } from '../../../lib/attase-orszag';
import {
  parseJelszo,
  parseSzerkesztes,
  parseUjFelhasznalo,
  type ElerhetosegAdatok,
  type Szerepkor,
} from '../../../lib/felhasznalo-validacio';
import { requireAdmin } from '../../../lib/session';
```

A `FelhasznaloAdatok`:

```ts
/** A Better Auth `user` rekord általunk írt mezői (createUser / adminUpdateUser `data`). Az országok külön táblában. */
interface FelhasznaloAdatok extends ElerhetosegAdatok {
  name?: string;
  role?: Szerepkor;
}
```

A `hiba()` után új segéd, és a `createFelhasznaloAction` / `updateFelhasznaloAction` / `removeFelhasznaloAction` új változata (a `setJelszoAction`, `banAction`, `unbanAction` változatlan):

```ts
/**
 * Az országok mentése a Better Auth hívás után (két lépés, nem egy tranzakció). Ha elbukik, a
 * felhasználó többi adata már mentve van: form-hiba, és a lista frissül, hogy a valós állapot látsszon.
 */
function mentOrszagok(userId: string, orszagok: readonly AttaseOrszag[], hibaUzenet: string): MuveletState | null {
  try {
    setAttaseOrszagok(userId, orszagok);
    return null;
  } catch (err) {
    console.error('[felhasznalok] setAttaseOrszagok sikertelen:', err);
    revalidatePath('/', 'layout');
    return { errors: { form: hibaUzenet } };
  }
}

export async function createFelhasznaloAction(
  _prev: MuveletState,
  formData: FormData,
): Promise<MuveletState> {
  await requireAdmin();
  const parsed = parseUjFelhasznalo(formData);
  if (!parsed.ok) return { errors: parsed.errors };
  const { nev, email, jelszo, szerepkor, orszagok, ...elerhetoseg } = parsed.data;
  let userId: string;
  try {
    const { user: uj } = await auth.api.createUser({
      headers: await headers(),
      body: {
        name: nev,
        email,
        password: jelszo,
        role: szerepkor,
        data: elerhetoseg satisfies FelhasznaloAdatok,
      },
    });
    userId = uj.id;
  } catch (err) {
    return hiba(err, 'createUser');
  }
  return (
    mentOrszagok(userId, orszagok, 'A felhasználó létrejött, de az országok mentése nem sikerült – szerkeszd újra.') ??
    kesz()
  );
}

export async function updateFelhasznaloAction(
  userId: string,
  _prev: MuveletState,
  formData: FormData,
): Promise<MuveletState> {
  const me = await requireAdmin();
  const parsed = parseSzerkesztes(formData);
  if (!parsed.ok) return { errors: parsed.errors };
  const { nev, szerepkor, orszagok, ...elerhetoseg } = parsed.data;
  if (userId === me.userId && szerepkor !== 'admin') {
    return { errors: { szerepkor: 'Saját admin szerepkörödet nem veheted el.' } };
  }
  try {
    // Név, elérhetőségek és szerepkör egy hívásban: az adminUpdateUser a data.role-t maga
    // ellenőrzi és menti. A null érték törli a mezőt. Az országok utána, külön lépésben
    // (adminnál üres lista → a felhasználó minden hozzárendelése törlődik).
    await auth.api.adminUpdateUser({
      headers: await headers(),
      body: { userId, data: { name: nev, role: szerepkor, ...elerhetoseg } satisfies FelhasznaloAdatok },
    });
  } catch (err) {
    return hiba(err, 'adminUpdateUser');
  }
  return (
    mentOrszagok(userId, orszagok, 'A felhasználó adatai mentve, de az országok mentése nem sikerült – próbáld újra.') ??
    kesz()
  );
}
```

```ts
export async function removeFelhasznaloAction(userId: string): Promise<MuveletState> {
  const me = await requireAdmin();
  if (userId === me.userId) return { errors: { form: SAJAT_FIOK_HIBA } };
  try {
    await auth.api.removeUser({ headers: await headers(), body: { userId } });
  } catch (err) {
    return hiba(err, 'removeUser');
  }
  // A cascade törölte a hozzárendeléseit; ahol egyetlen attasé maradt vezető nélkül, ő örököl.
  try {
    normalizalVezetok();
  } catch (err) {
    console.error('[felhasznalok] normalizalVezetok sikertelen:', err);
  }
  return kesz();
}
```

- [ ] **Step 5: `VezetoFigyelmeztetes.tsx` (új)**

```tsx
import type { HianyosOrszag } from '../../../../lib/attase-orszag';
import { orszagNev } from '../../../../lib/orszagok';

/** A vezető nélküli (vagy tiltott vezetőjű) országok a felhasználó-tábla fölött. */
export function VezetoFigyelmeztetes({ orszagok }: { orszagok: readonly HianyosOrszag[] }) {
  return (
    <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-medium">Relációs vezető nélküli országok</p>
      <ul className="mt-1 list-disc pl-5">
        {orszagok.map((o) => (
          <li key={o.kod}>
            {orszagNev(o.kod)} ({o.aktivDb} aktív attasé){o.vezetoTiltott ? ' – a vezető tiltott' : ''}
          </li>
        ))}
      </ul>
      <p className="mt-1 text-amber-900">
        Jelöld ki a vezetőt valamelyik attasé szerkesztésében; addig a profilt csak admin szerkesztheti.
      </p>
    </div>
  );
}
```

- [ ] **Step 6: `app/(app)/felhasznalok/page.tsx` – teljes fájl**

```tsx
import { listFelhasznalok } from '../../../db/queries/felhasznalo';
import { orszagonkent, vezetoNelkuliOrszagok } from '../../../lib/attase-orszag';
import { requireAdmin } from '../../../lib/session';
import { FelhasznaloTabla } from './components/FelhasznaloTabla';
import { UjFelhasznaloDialog } from './components/UjFelhasznaloDialog';
import { VezetoFigyelmeztetes } from './components/VezetoFigyelmeztetes';

export default async function FelhasznalokPage() {
  const me = await requireAdmin();
  const felhasznalok = listFelhasznalok();
  // Országonként a lefedő attasék (vezető-jelölő súgója, ★, figyelmeztetés): a listából, új lekérdezés nélkül.
  const orszagTagok = orszagonkent(felhasznalok);
  const hianyos = vezetoNelkuliOrszagok(orszagTagok);
  return (
    <div className="flex max-w-6xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">{felhasznalok.length} felhasználó</p>
        <div className="ml-auto">
          <UjFelhasznaloDialog orszagTagok={orszagTagok} />
        </div>
      </div>
      {hianyos.length > 0 && <VezetoFigyelmeztetes orszagok={hianyos} />}
      <FelhasznaloTabla felhasznalok={felhasznalok} sajatId={me.userId} orszagTagok={orszagTagok} />
    </div>
  );
}
```

- [ ] **Step 7: `FelhasznaloTabla.tsx` – teljes fájl**

```tsx
import { Fragment } from 'react';
import { Badge } from '../../../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import type { FelhasznaloSor } from '../../../../db/queries/felhasznalo';
import type { AttaseOrszag, OrszagTagok } from '../../../../lib/attase-orszag';
import { formatDatum } from '../../../../lib/datum';
import { SZEREPKOR_CIMKE } from '../../../../lib/felhasznalo-validacio';
import { orszagNev } from '../../../../lib/orszagok';
import { FelhasznaloMuveletek } from './FelhasznaloMuveletek';

export function FelhasznaloTabla({
  felhasznalok,
  sajatId,
  orszagTagok,
}: {
  felhasznalok: FelhasznaloSor[];
  sajatId: string;
  orszagTagok: OrszagTagok;
}) {
  // A ★ csak ott jelzi a vezetőt, ahol egynél több attasé van (egyszemélyes országban automatikus).
  const tobbAttase = new Set(Object.entries(orszagTagok).filter(([, t]) => t.length > 1).map(([kod]) => kod));
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Név</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Szerepkör</TableHead>
            <TableHead>Országok</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Állapot</TableHead>
            <TableHead>Létrehozva</TableHead>
            <TableHead className="w-12"><span className="sr-only">Műveletek</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {felhasznalok.map((f) => (
            <TableRow key={f.id}>
              <TableCell className="font-medium">
                {f.nev}
                {f.id === sajatId && <span className="ml-2 text-xs text-muted-foreground">(te)</span>}
              </TableCell>
              <TableCell className="text-muted-foreground">{f.email}</TableCell>
              <TableCell>
                <Badge variant={f.szerepkor === 'admin' ? 'default' : 'secondary'}>
                  {SZEREPKOR_CIMKE[f.szerepkor]}
                </Badge>
              </TableCell>
              <TableCell className="min-w-48 whitespace-normal">
                <OrszagCella orszagok={f.orszagok} tobbAttase={tobbAttase} />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {f.telefon ?? <span className="text-muted-foreground">–</span>}
              </TableCell>
              <TableCell>
                {f.tiltott ? <Badge variant="destructive">Tiltott</Badge> : <Badge variant="outline">Aktív</Badge>}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDatum(f.letrehozva)}</TableCell>
              <TableCell className="text-right">
                <FelhasznaloMuveletek felhasznalo={f} sajat={f.id === sajatId} orszagTagok={orszagTagok} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** Első sor: székhely · város (★ vezető); második, halvány sor: a régiós országok. */
function OrszagCella({ orszagok, tobbAttase }: { orszagok: readonly AttaseOrszag[]; tobbAttase: ReadonlySet<string> }) {
  const szekhely = orszagok.find((o) => o.szekhely);
  const regio = orszagok.filter((o) => !o.szekhely);
  if (!szekhely && regio.length === 0) return <span className="text-muted-foreground">–</span>;
  const csillag = (o: AttaseOrszag) =>
    o.vezeto && tobbAttase.has(o.kod) ? (
      <>
        <span aria-hidden className="text-amber-600"> ★</span>
        <span className="sr-only"> (relációs vezető)</span>
      </>
    ) : null;
  return (
    <div className="flex flex-col">
      {szekhely && (
        <span>
          {orszagNev(szekhely.kod)}
          {szekhely.varos ? ` · ${szekhely.varos}` : ''}
          {csillag(szekhely)}
        </span>
      )}
      {regio.length > 0 && (
        <span className="text-xs text-muted-foreground">
          régió:{' '}
          {regio.map((o, i) => (
            <Fragment key={o.kod}>
              {i > 0 && ', '}
              {orszagNev(o.kod)}
              {csillag(o)}
            </Fragment>
          ))}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 8: `FelhasznaloMuveletek.tsx`**

Import: `import type { OrszagTagok } from '../../../../lib/attase-orszag';`. A szignatúra és a dialógus-propok:

```tsx
export function FelhasznaloMuveletek({
  felhasznalo,
  sajat,
  orszagTagok,
}: {
  felhasznalo: FelhasznaloSor;
  sajat: boolean;
  orszagTagok: OrszagTagok;
}) {
```

```tsx
      <SzerkesztesDialog
        key={`sz-${nyitas}`}
        felhasznalo={felhasznalo}
        orszagTagok={orszagTagok}
        open={szerkesztes}
        onOpenChange={setSzerkesztes}
      />
```

- [ ] **Step 9: `SzerkesztesDialog.tsx` – teljes fájl**

```tsx
'use client';

import { useState } from 'react';
import { hibaAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { MuveletDialog } from '../../../../components/form/MuveletDialog';
import { useMuveletForm } from '../../../../components/form/useMuveletForm';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import type { FelhasznaloSor } from '../../../../db/queries/felhasznalo';
import type { OrszagTagok } from '../../../../lib/attase-orszag';
import type { Szerepkor } from '../../../../lib/felhasznalo-validacio';
import { updateFelhasznaloAction } from '../actions';
import { ElerhetosegMezok, type ElerhetosegErtekek } from './ElerhetosegMezok';
import { OrszagMezok, orszagErtekek, type OrszagErtekek } from './OrszagMezok';
import { SzerepkorSelect } from './SzerepkorSelect';

export function SzerkesztesDialog({
  felhasznalo,
  orszagTagok,
  open,
  onOpenChange,
}: {
  felhasznalo: FelhasznaloSor;
  orszagTagok: OrszagTagok;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useMuveletForm(
    updateFelhasznaloAction.bind(null, felhasznalo.id),
    'Felhasználó módosítva.',
    () => onOpenChange(false),
  );
  // Vezérelt mezők: a React 19 a <form action> beküldése után (hibánál is) alaphelyzetbe
  // állítja a nem vezérelt inputokat; a state megőrzi a beírt értékeket, és az ország-adatok
  // is megmaradnak, ha a szerepkör-váltás ideiglenesen elrejti a mezőket.
  const [nev, setNev] = useState(felhasznalo.nev);
  const [szerepkor, setSzerepkor] = useState<Szerepkor>(felhasznalo.szerepkor);
  const [elerhetoseg, setElerhetoseg] = useState<ElerhetosegErtekek>({
    telefon: felhasznalo.telefon ?? '',
    kapcsolatEmail: felhasznalo.kapcsolatEmail ?? '',
  });
  const [orszagok, setOrszagok] = useState<OrszagErtekek>(() => orszagErtekek(felhasznalo.orszagok));
  const errors = state.errors ?? {};

  return (
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      cim="Felhasználó szerkesztése"
      leiras={felhasznalo.email}
      gomb="Mentés"
      formAction={formAction}
      errors={errors}
      szeles
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nev">Név</Label>
          <Input
            id="nev"
            name="nev"
            required
            maxLength={100}
            autoComplete="off"
            value={nev}
            onChange={(e) => setNev(e.target.value)}
            {...hibaAttr(errors, 'nev')}
          />
          <MezoHiba mezo="nev" errors={errors} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label id="szerepkor-label" htmlFor="szerepkor">Szerepkör</Label>
          <SzerepkorSelect value={szerepkor} onChange={setSzerepkor} invalid={Boolean(errors.szerepkor)} />
          <MezoHiba mezo="szerepkor" errors={errors} />
          {szerepkor === 'admin' && felhasznalo.orszagok.length > 0 && (
            <p className="text-xs text-muted-foreground">Adminra váltva az országok törlődnek.</p>
          )}
        </div>
      </div>
      <ElerhetosegMezok ertekek={elerhetoseg} onChange={setElerhetoseg} errors={errors} />
      {szerepkor === 'attase' && (
        <OrszagMezok
          ertekek={orszagok}
          onChange={setOrszagok}
          errors={errors}
          orszagTagok={orszagTagok}
          sajatId={felhasznalo.id}
        />
      )}
    </MuveletDialog>
  );
}
```

- [ ] **Step 10: `UjFelhasznaloDialog.tsx`**

Az importokban az `AttaseMezok` helyett:

```tsx
import type { OrszagTagok } from '../../../../lib/attase-orszag';
import { ElerhetosegMezok, URES_ELERHETOSEG, type ElerhetosegErtekek } from './ElerhetosegMezok';
import { OrszagMezok, URES_ORSZAGOK, type OrszagErtekek } from './OrszagMezok';
```

A két komponens szignatúrája és a prop továbbadása:

```tsx
export function UjFelhasznaloDialog({ orszagTagok }: { orszagTagok: OrszagTagok }) {
```

```tsx
      <UjFelhasznaloModal key={nyitas} open={open} onOpenChange={setOpen} orszagTagok={orszagTagok} />
```

```tsx
function UjFelhasznaloModal({
  open,
  onOpenChange,
  orszagTagok,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orszagTagok: OrszagTagok;
}) {
```

A `const [attase, setAttase] = useState<AttaseMezoErtekek>(URES_ATTASE_MEZOK);` helyett (a komment „poszt-adatok” → „ország-adatok”):

```tsx
  const [elerhetoseg, setElerhetoseg] = useState<ElerhetosegErtekek>(URES_ELERHETOSEG);
  const [orszagok, setOrszagok] = useState<OrszagErtekek>(URES_ORSZAGOK);
```

A `<AttaseMezok … />` helyett:

```tsx
      <ElerhetosegMezok ertekek={elerhetoseg} onChange={setElerhetoseg} errors={errors} />
      {szerepkor === 'attase' && (
        <OrszagMezok ertekek={orszagok} onChange={setOrszagok} errors={errors} orszagTagok={orszagTagok} sajatId={null} />
      )}
```

- [ ] **Step 11: Szélesebb dialógus, a régi komponens törlése**

`components/form/MuveletDialog.tsx`: a `szeles` doc-komment `/** Szélesebb dialógus (sm:max-w-2xl) a többoszlopos űrlapokhoz (felhasználó-dialógusok). */`, a className `szeles && 'sm:max-w-2xl'`.

```bash
git rm "app/(app)/felhasznalok/components/AttaseMezok.tsx"
npx tsc --noEmit
grep -rn "AttaseMezok\|AttaseAdatok" app components lib db   # üres legyen
```

- [ ] **Step 12: Böngészős ellenőrzés (admin) – a végén minden QA-felhasználót törölj**

gstack, a futó dev szerveren (`http://localhost:3000`), admin bejelentkezéssel:

1. `/felhasznalok`: az „Országok” oszlopban „Koreai Köztársaság” (Teszt Attasé) és „Japán” (Második Attasé); nincs figyelmeztetés.
2. „Új felhasználó”: QA Régiós, `qa.regios@niu.hu`, jelszó ≥ 8 karakter, TéT attasé; Székhely: Ausztria, város Bécs → a jelölő bejelölt és letiltott, súgó „Egyedüli attasé – automatikusan vezető.”; „+ Ország hozzáadása” ×3: Szlovénia, Horvátország, Ausztria → Létrehozás → a 3. sor alatt „Ez az ország már szerepel.”, a fókusz azon a selecten; töröld a sort (✕) → Létrehozás → toast, a táblában „Ausztria · Bécs” és „régió: Horvátország, Szlovénia”.
3. `/terkep`: Szlovénia tooltipje „QA Régiós · regionálisan (Bécs)”.
4. „Új felhasználó”: QA Második, `qa.masodik@niu.hu`, Székhely: Koreai Köztársaság, részterület „Puszan és környéke” → a jelölő üres, súgó „Jelenlegi vezető: Teszt Attasé.” → Létrehozás → a táblában a Teszt Attasé KR-je mellett ★ (két attasé).
5. QA Második szerkesztése: jelölő be → súgó „Mentéskor ő lesz a relációs vezető (jelenleg: Teszt Attasé).” → Mentés → a ★ QA Másodiknál.
6. QA Második szerkesztése: jelölő ki → súgó „Kikapcsolva nem marad vezető – jelölj ki mást.” → Mentés → figyelmeztetés: „Koreai Köztársaság (2 aktív attasé)”.
7. QA Második törlése → a figyelmeztetés eltűnik (Teszt Attasé örököl; a ★ eltűnik, mert egy attasé maradt).
8. QA Régiós szerkesztése: szerepkör Admin → súgó „Adminra váltva az országok törlődnek.” → Mentés → „Országok”: „–”. Utána QA Régiós törlése.
9. `console --errors` üres.

- [ ] **Step 13: Takarítás, commit**

```bash
rm scripts/_felhasznalo-validacio-check.ts
git add lib/felhasznalo-validacio.ts db/queries/felhasznalo.ts "app/(app)/felhasznalok/actions.ts" "app/(app)/felhasznalok/page.tsx" "app/(app)/felhasznalok/components/UjFelhasznaloDialog.tsx" "app/(app)/felhasznalok/components/SzerkesztesDialog.tsx" "app/(app)/felhasznalok/components/FelhasznaloTabla.tsx" "app/(app)/felhasznalok/components/FelhasznaloMuveletek.tsx" "app/(app)/felhasznalok/components/VezetoFigyelmeztetes.tsx" components/form/MuveletDialog.tsx
git commit -m "$(printf 'feat(attase-orszagok): felhasználó-kezelés székhellyel, régiós országokkal és relációs vezetővel (validátor, action-ök, dialógusok, tábla, figyelmeztetés)\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

(Az `AttaseMezok.tsx` törlését a `git rm` már stage-elte.)

---

### Task 12: A régi `user` oszlopok és mezők törlése (0007)

**Files:**
- Modify: `db/schema/auth.ts`, `lib/auth.ts`, `lib/session.ts`, `scripts/orszag-kod-migracio.ts`, `scripts/demo-orszagprofil.ts`
- Generate: `drizzle/0007_user_poszt_oszlopok.sql`, `drizzle/meta/0007_snapshot.json`, `drizzle/meta/_journal.json`

- [ ] **Step 1: Séma és Better Auth mezők**

`db/schema/auth.ts`, a `user` táblában az `orszag`, `fovaros`, `terulet`, `penznem` sor és a régi komment helyett:

```ts
  banExpires: integer("ban_expires", { mode: "timestamp_ms" }),
  // Az elérhetőségek (mindkét szerepkörnél). Better Auth additionalFields (lib/auth.ts); az admin
  // UI írja őket. Az attasé országai az attase_orszag táblában (db/schema/attase-orszag.ts).
  telefon: text("telefon"),
  kapcsolatEmail: text("kapcsolat_email"),
});
```

`lib/auth.ts`, a `user.additionalFields`:

```ts
  user: {
    additionalFields: {
      // Az elérhetőségek (mindkét szerepkörnél). Csak az admin API írhatja (input: false), a
      // felhasználó saját maga nem módosíthatja az /update-user végponton. Az attasé országai
      // az attase_orszag táblában vannak (db/schema/attase-orszag.ts), nem a user rekordon.
      telefon: { type: 'string', required: false, input: false },
      kapcsolatEmail: { type: 'string', required: false, input: false },
    },
  },
```

- [ ] **Step 2: Az átmeneti `orszag` kivezetése (`lib/session.ts`)**

Az `AppSession`-ből töröld az `orszag` mezőt a kommentjével, a `getSession` visszatérése `{ userId: u.id, name: u.name, email: u.email, role, orszagok }`, az import `import type { SessionOrszag } from './attase-orszag';` (a `szekhelyKod` kikerül).

- [ ] **Step 3: Scriptek**

`scripts/orszag-kod-migracio.ts`: a `user` ciklus helyett az `attase_orszag` sorait írja át (a 0006 migráció a régi `user.orszag`-ot csak trimmelve másolta, így egy kódra nem alakított régi név ott maradhat). A fejléc-komment első mondata: „Egyszeri, idempotens adat-átírás: az attase_orszag.orszag_kod, a riport.orszag és a ticket.orszag szabadszöveges országneveit ISO-kódra cseréli …”. Importok: `import { and, eq } from 'drizzle-orm';`, `import { attaseOrszag, riport, ticket } from '../db/schema';`. A `for (const u of db.select({ id: user.id, orszag: user.orszag }) …)` ciklus helyett:

```ts
for (const a of db.select({ userId: attaseOrszag.userId, kod: attaseOrszag.orszagKod }).from(attaseOrszag).all()) {
  const kod = kodra(a.kod);
  if (kod === null) continue;
  if (!kod) {
    parositatlan.push(`attase_orszag ${a.userId}: "${a.kod}"`);
    continue;
  }
  try {
    db.update(attaseOrszag)
      .set({ orszagKod: kod })
      .where(and(eq(attaseOrszag.userId, a.userId), eq(attaseOrszag.orszagKod, a.kod)))
      .run();
    atirt++;
  } catch {
    // A felhasználónak már van sora ezzel a kóddal (PK): kézi rendezés kell.
    parositatlan.push(`attase_orszag ${a.userId}: "${a.kod}" → ${kod} (már van ilyen sora)`);
  }
}
```

`scripts/demo-orszagprofil.ts`:
- A fejléc-komment: „Demó-adatok a KR és JP országprofilhoz az aktuális évre. Idempotens: a profil blokkjait blokkonként upsert-eli; a szerző az első admin (a demó-tartalom nem kötődik valós attaséhoz). Az adatok a `validalBlokk` validátoron mennek át …” (a futtatási sor marad).
- Töröld a `Poszt` interfészt; a `DemoOrszag`: `{ kod: string; profil: Record<BlokkKulcs, Urlap>; }`.
- `KR`: az `email` és a `poszt` helyett `kod: 'KR',`; az `alapadatok` elejére `fovaros: 'Szöul', terulet: '100 210', penznem: 'dél-koreai won (KRW)',`.
- `JP`: ugyanígy `kod: 'JP',`; `fovaros: 'Tokió', terulet: '377 975', penznem: 'japán jen (JPY)',`.
- A `main`:

```ts
function main() {
  const ev = aktualisEv();
  // A szerző az első admin: a demó-tartalom nem kötődik valós attaséhoz.
  const admin = db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.role, 'admin'))
    .orderBy(user.createdAt)
    .get();
  if (!admin) throw new Error('Nincs admin felhasználó (npm run db:seed).');
  for (const o of [KR, JP]) {
    for (const blokk of BLOKK_KULCSOK) {
      const eredmeny = validalBlokk(blokk, urlapFormData(o.profil[blokk]), ev);
      if (!eredmeny.ok) {
        throw new Error(`${o.kod} ${ev} ${blokk}: ${JSON.stringify(eredmeny.errors)}`);
      }
      upsertBlokk(o.kod, ev, blokk, eredmeny.ertek, admin.id);
    }
    console.log(`${o.kod}: ${BLOKK_KULCSOK.length} blokk mentve ${ev}-ra (szerző: ${admin.name})`);
  }
}
```

- [ ] **Step 4: Típusellenőrzés a migráció előtt**

Run: `npx tsc --noEmit` → hibátlan. (Ha valahol még `session.orszag` / `user.orszag` / `.fovaros` a `user`-ről szerepel, itt derül ki – javítsd az adott fogyasztót az `orszagok`-ra.)

- [ ] **Step 5: Migráció generálása és kipróbálása a másolaton**

Run: `npm run db:generate -- --name user_poszt_oszlopok`
Expected: `drizzle/0007_user_poszt_oszlopok.sql`:

```sql
ALTER TABLE `user` DROP COLUMN `orszag`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `fovaros`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `terulet`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `penznem`;
```

```bash
T=$(mktemp -d) && sqlite3 data/tet.db ".backup '$T/t.db'"
DATABASE_URL="$T/t.db" npx drizzle-kit migrate
sqlite3 "$T/t.db" "select name from pragma_table_info('user');"   # nincs orszag/fovaros/terulet/penznem
DATABASE_URL="$T/t.db" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts
```

Expected: a `demo-orszagprofil` két sort ír (`KR: 8 blokk mentve 2026-ra (szerző: Sipos Katalin)`, `JP: …`).

- [ ] **Step 6: Migráció a valódi demó DB-n, commit**

```bash
npm run db:migrate
npx tsc --noEmit
git add db/schema/auth.ts lib/auth.ts lib/session.ts scripts/orszag-kod-migracio.ts scripts/demo-orszagprofil.ts drizzle/0007_user_poszt_oszlopok.sql drizzle/meta/0007_snapshot.json drizzle/meta/_journal.json
git commit -m "$(printf 'feat(attase-orszagok): a user.orszag és a poszt-adat oszlopok törlése (0007), Better Auth mezők és scriptek igazítása\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

gstack gyors nézés: `/felhasznalok`, `/terkep`, `/orszagprofil/KR` betölt, `console --errors` üres.

---

### Task 13: Demó attasék (valós példák)

**Files:**
- Create: `scripts/demo-attasek.ts`
- Modify: `.env.example` (a felhasználó jóváhagyta a lista cseréjét)

- [ ] **Step 1: `scripts/demo-attasek.ts`**

```ts
/**
 * Demó attasék (a NIÜ TéT-hálózat valós példái) a data/tet.db-be. Idempotens:
 * 1. a két régi tesztfiókot (teszt.attase@niu.hu, masodik.attase@niu.hu) törli, ha létezik –
 *    FK cascade: a riportjaik, a nekik címzett ticketek és az olvasás-jelöléseik is; az általuk
 *    írt országprofil-blokkok szerzője null lesz;
 * 2. a hiányzó attasékat létrehozza (közvetlen insert, mint a scripts/seed.ts: a Better Auth
 *    admin API admin sessiont kérne); a meglévőkhöz (e-mail szerint) nem nyúl, jelszavuk sem változik;
 * 3. mindegyik hozzárendelését beállítja a setAttaseOrszagok-kal (a kijelölt vezetők átveszik a
 *    vezetőséget, a többit a normalizálás adja).
 * Az e-mail címek helykitöltők (vezeteknev.keresztnev@niu.hu, ékezet és „dr.” nélkül). A jelszó a
 * DEMO_ATTASE_PASSWORD környezeti változóból jön (a .env.example dokumentálja).
 *
 * Futtatás: DEMO_ATTASE_PASSWORD=… NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-attasek.ts
 */
import { hashPassword } from 'better-auth/crypto';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../db';
import { account, user } from '../db/schema';
import { setAttaseOrszagok } from '../db/queries/attase-orszag';
import type { AttaseOrszag } from '../lib/attase-orszag';

interface DemoAttase {
  nev: string;
  email: string;
  szekhely: string;
  varos: string;
  reszterulet?: string;
  /** Kijelölt relációs vezető a székhely-országban (több attasés országnál). */
  vezeto?: boolean;
  regio?: string[];
}

const ATTASEK: DemoAttase[] = [
  {
    nev: 'Kindert Judit', email: 'kindert.judit@niu.hu', szekhely: 'DE', varos: 'Berlin', vezeto: true,
    reszterulet: 'Berlin, Brandenburg, Bremen, Hamburg, Niedersachsen, Mecklenburg-Vorpommern, Thüringen, Sachsen-Anhalt, Sachsen, Schleswig-Holstein',
  },
  {
    nev: 'Komma Krisztián', email: 'komma.krisztian@niu.hu', szekhely: 'DE', varos: 'Stuttgart',
    reszterulet: 'Baden-Württemberg, Észak-Rajna-Vesztfália, Rheinland-Pfalz, Saarland, Hessen',
  },
  { nev: 'dr. Gurza László', email: 'gurza.laszlo@niu.hu', szekhely: 'DE', varos: 'München', reszterulet: 'Bajorország' },
  { nev: 'Jávori Balázs', email: 'javori.balazs@niu.hu', szekhely: 'AT', varos: 'Bécs' },
  { nev: 'Balogh András Zoltán', email: 'balogh.andras@niu.hu', szekhely: 'GB', varos: 'London', regio: ['IE'] },
  { nev: 'Szántó Szilvia', email: 'szanto.szilvia@niu.hu', szekhely: 'FR', varos: 'Párizs', regio: ['DZ', 'MA', 'MR', 'TN'] },
  { nev: 'Hoffmann Mária', email: 'hoffmann.maria@niu.hu', szekhely: 'IL', varos: 'Tel-Aviv' },
  { nev: 'Márfi András', email: 'marfi.andras@niu.hu', szekhely: 'RU', varos: 'Moszkva' },
  { nev: 'Ferencz Csanád', email: 'ferencz.csanad@niu.hu', szekhely: 'JP', varos: 'Tokió' },
  { nev: 'Hosszú Hortenzia', email: 'hosszu.hortenzia@niu.hu', szekhely: 'KR', varos: 'Szöul', regio: ['KP'] },
  { nev: 'Siklós Lili', email: 'siklos.lili@niu.hu', szekhely: 'CN', varos: 'Peking' },
  {
    nev: 'dr. Nagy Gabriella', email: 'nagy.gabriella@niu.hu', szekhely: 'US', varos: 'New York', vezeto: true,
    regio: ['CA', 'PR', 'VI'],
    reszterulet: 'Alabama, Arkansas, District of Columbia, Florida, Georgia, Kentucky, Louisiana, Maryland, Mississippi, '
      + 'West Virginia, Észak-Karolina, Dél-Karolina, Ohio, Pennsylvania, Virginia, Connecticut, Delaware, Maine, '
      + 'New Hampshire, New Jersey, New York, Rhode Island, Vermont, Illinois, Indiana, Iowa, Michigan, Minnesota, '
      + 'Missouri, Tennessee, Wisconsin',
  },
  {
    nev: 'Mészáros Eleonóra', email: 'meszaros.eleonora@niu.hu', szekhely: 'US', varos: 'San Francisco',
    reszterulet: 'Alaszka, Arizona, Colorado, Dél-Dakota, Észak-Dakota, Guam, Hawaii, Idaho, Kalifornia, Kansas, '
      + 'Montana, Nebraska, Nevada, Oklahoma, Oregon, Texas, Új-Mexikó, Utah, Washington, Wyoming',
  },
  { nev: 'Morován Júlia', email: 'morovan.julia@niu.hu', szekhely: 'BR', varos: 'Sao Paulo', regio: ['GY', 'SR'] },
  { nev: 'Daczi Diána', email: 'daczi.diana@niu.hu', szekhely: 'IN', varos: 'Új-Delhi', regio: ['BD', 'MV', 'NP', 'LK'] },
];

const REGI_TESZTFIOKOK = ['teszt.attase@niu.hu', 'masodik.attase@niu.hu'];

async function main() {
  const jelszo = process.env.DEMO_ATTASE_PASSWORD;
  if (!jelszo || jelszo.length < 8) {
    console.error('Hiányzó vagy 8 karakternél rövidebb DEMO_ATTASE_PASSWORD (lásd .env.example).');
    process.exit(1);
  }

  const toroltek = db.delete(user).where(inArray(user.email, REGI_TESZTFIOKOK)).returning({ email: user.email }).all();
  for (const t of toroltek) console.log(`Tesztfiók törölve: ${t.email}`);

  for (const a of ATTASEK) {
    let userId = db.select({ id: user.id }).from(user).where(eq(user.email, a.email)).get()?.id;
    if (!userId) {
      const id = crypto.randomUUID();
      const passwordHash = await hashPassword(jelszo);
      const now = new Date();
      // A providerId 'credential' és accountId = userId a Better Auth email+jelszó konvenciója (mint a seed).
      db.transaction((tx) => {
        tx.insert(user)
          .values({ id, name: a.nev, email: a.email, emailVerified: true, role: 'attase', createdAt: now, updatedAt: now })
          .run();
        tx.insert(account)
          .values({
            id: crypto.randomUUID(), userId: id, accountId: id, providerId: 'credential', password: passwordHash,
            createdAt: now, updatedAt: now,
          })
          .run();
      });
      userId = id;
      console.log(`Létrehozva: ${a.nev} <${a.email}>`);
    }
    const sorok: AttaseOrszag[] = [
      { kod: a.szekhely, szekhely: true, vezeto: a.vezeto ?? false, varos: a.varos, reszterulet: a.reszterulet ?? null },
      ...(a.regio ?? []).map((kod) => ({ kod, szekhely: false, vezeto: false, varos: null, reszterulet: null })),
    ];
    setAttaseOrszagok(userId, sorok);
  }
  console.log(`Kész: ${ATTASEK.length} demó attasé hozzárendelése beállítva.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: `.env.example`**

A fájl végén a négy soros blokk (`# Email	Szerep	Ország`, a `teszt.attase` és `masodik.attase` sor, `# Attase12345!`) helyett (a mezőelválasztó tabulátor, mint eddig):

```
# Demó attasék (scripts/demo-attasek.ts), közös jelszó: DEMO_ATTASE_PASSWORD
# Email	Székhely (város)	Régió	Megjegyzés
# kindert.judit@niu.hu	Németország (Berlin)		relációs vezető
# komma.krisztian@niu.hu	Németország (Stuttgart)
# gurza.laszlo@niu.hu	Németország (München)
# javori.balazs@niu.hu	Ausztria (Bécs)
# balogh.andras@niu.hu	Egyesült Királyság (London)	Írország
# szanto.szilvia@niu.hu	Franciaország (Párizs)	Algéria, Marokkó, Mauritánia, Tunézia
# hoffmann.maria@niu.hu	Izrael (Tel-Aviv)
# marfi.andras@niu.hu	Oroszország (Moszkva)
# ferencz.csanad@niu.hu	Japán (Tokió)
# hosszu.hortenzia@niu.hu	Koreai Köztársaság (Szöul)	Koreai NDK
# siklos.lili@niu.hu	Kína (Peking)
# nagy.gabriella@niu.hu	Amerikai Egyesült Államok (New York)	Kanada, Puerto Rico, Amerikai Virgin-szigetek	relációs vezető
# meszaros.eleonora@niu.hu	Amerikai Egyesült Államok (San Francisco)
# morovan.julia@niu.hu	Brazília (Sao Paulo)	Guyana, Suriname
# daczi.diana@niu.hu	India (Új-Delhi)	Banglades, Maldív-szigetek, Nepál, Srí Lanka
DEMO_ATTASE_PASSWORD=Attase12345!
```

- [ ] **Step 3: Futtatás a valódi demó DB-n és ellenőrzés**

```bash
DEMO_ATTASE_PASSWORD="$(sed -n 's/^DEMO_ATTASE_PASSWORD=//p' .env.example)" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-attasek.ts
sqlite3 data/tet.db "select count(*) from user; select count(*) from riport; select count(*) from ticket; select count(*) from attase_orszag;"
sqlite3 data/tet.db "select orszag_kod from attase_orszag group by orszag_kod having sum(vezeto) <> 1;"
sqlite3 data/tet.db "select u.name, a.orszag_kod from attase_orszag a join user u on u.id = a.user_id where a.vezeto = 1 and a.orszag_kod in ('DE','US');"
```

Expected: `Tesztfiók törölve: …` ×2, `Létrehozva: …` ×15, `Kész: 15 …`; számok: `16` (15 + admin), `0`, `0`, `30`; a második lekérdezés üres (minden lefedett országnak pontosan egy vezetője van); a harmadik `Kindert Judit|DE` és `dr. Nagy Gabriella|US`. Második futtatásra csak a `Kész` sor jön (idempotens).

- [ ] **Step 4: Típusellenőrzés, commit (a DB nélkül)**

```bash
npx tsc --noEmit
git add scripts/demo-attasek.ts .env.example
git commit -m "$(printf 'feat(attase-orszagok): demó attasék a valós TéT-példákkal (scripts/demo-attasek.ts), a két régi tesztfiók törlése, .env.example lista\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 14: Dokumentáció és build

**Files:**
- Modify: `CLAUDE.md`, `README.md`, `docs/superpowers/specs/2026-10-06-attase-orszagok-design.md`

- [ ] **Step 1: `CLAUDE.md`**

Keresd meg és írd át a következő helyeket (a többi szöveg változatlan):

1. Parancslista: az `orszag-kod-migracio.ts` sor kommentje `# egyszeri: riport.orszag / ticket.orszag országnév → ISO-kód (idempotens, a párosítatlant kilistázza)`; utána új sor:
   `DEMO_ATTASE_PASSWORD=… NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-attasek.ts   # a 15 demó attasé (valós példák) a data/tet.db-be, idempotens; a két régi tesztfiókot törli`
2. Auth bekezdés: a „Session szerver oldalon: `lib/session.ts` (…)” zárójel után: „; az `AppSession.orszagok` (`kod`, `szekhely`, `vezeto`, székhely elöl) kérésenként a DB-ből jön, így a hozzárendelés változása azonnal érvényes”.
3. Auth bekezdés: a „A `user.orszag` mező (`additionalFields`, `input: false`) …” mondattól az „… az admin plugin `roles` mappel (`admin`, `attase`) fut.” mondatig tartó rész helyett:

   > Az attasé országai az `attase_orszag` táblában vannak (`db/schema/attase-orszag.ts`; egy sor = egy (felhasználó, ország) pár, `orszag_kod` **ISO 3166-1 alpha-2 kód** a `lib/orszagok.ts` szótárból – `ORSZAGOK` magyar név szerint rendezve, `orszagByKod`, `orszagNev`, `ORSZAG_KOD_RE`): felhasználónként pontosan egy `szekhely` (a poszt országa; `varos` = a poszt városa, `reszterulet` = az országon belüli terület, pl. a lefedett tartományok – mindkettő csak a székhely-sornál), a többi sor regionális lefedettség; `vezeto` = relációs vezető, az országprofil felelőse, országonként legfeljebb egy (részleges egyedi indexek: `orszag_kod WHERE vezeto = 1`, `user_id WHERE szekhely = 1`). Szabályok `db/queries/attase-orszag.ts`: `setAttaseOrszagok` (egy tranzakció: a felhasználó sorainak cseréje, a bejelölt vezetőség átvétele a többiektől, normalizálás), `normalizalVezetok` (az egyetlen attaséjú, vezető nélküli ország attaséja lesz a vezető; több attasénál nem jelöl ki senkit – a `/felhasznalok` figyelmeztet), `listOrszagAttasek`, `listAttasekOrszagonkent`; típusok és tiszta segédek `lib/attase-orszag.ts` (`AttaseOrszag`, `SessionOrszag`, `OrszagAttase`, `rendezOrszagok`, `rendezAttasek`, `attaseFelirat`, `attasekRovid`, `elsoVezetettKod`, `orszagonkent`, `vezetoNelkuliOrszagok`, `vezetoHelyzet`/`alapVezeto`/`vezetoSugo` a dialógus jelölőjéhez). A felület mindenhol `orszagNev()`-vel ír, a dialógus `NativeSelect`-ből (`components/form/NativeSelect.tsx`, natív `<select>` a shadcn `Input` osztályaival) választ. Szingapúr, Málta, Bahrein, az Amerikai Virgin-szigetek és a Maldív-szigetek `geo: ''`-vel szerepel (a 110m atlaszban nincs poligonjuk, a térképen csak pin). A `user` táblán az elérhetőségek maradtak: `telefon`, `kapcsolatEmail` (`additionalFields`, `input: false`, oszlop `kapcsolat_email`, mindkét szerepkörnél; a Drizzle adapter a séma property-kulcsával párosít, ezért nem kell `fieldName`); a főváros, terület, pénznem az országprofil Alapadatok blokkjába költözött (0006 migráció). Az `adminUpdateUser` `data`-jában a `null` törli a mezőt, az `undefined` érintetlenül hagyja. A validátor `lib/felhasznalo-validacio.ts` (`ElerhetosegAdatok`; az országok `szekhely.*` és `regio.<i>.*` mezőkből), a dialógusok blokkjai `app/(app)/felhasznalok/components/` alatt (`ElerhetosegMezok`, `OrszagMezok`, `VezetoJelolo`, `Blokk`), a `MuveletDialog` `szeles` propja adja a szélesebb keretet (`sm:max-w-2xl`). A mentés a `createUser`/`adminUpdateUser` után `setAttaseOrszagok` – két lépés, nem egy tranzakció: ha a második elbukik, form-hiba. Az admin plugin `roles` mappel (`admin`, `attase`) fut.

4. UI shell: „(monogram, név, szerep · ország)” → „(monogram, név, szerep · székhely-ország, további országoknál „+N”)”; az `OldalsavAllapot` leírásában „(attasé: a saját ország állapota a választott évre `getUtolsoEv` + `profilAllapot`-ból, „Szerkesztés” link `canEditProfil` mellett, különben „Megnyitás”; …” → „(attasé: országonként egy sor – székhely elöl – az állapottal a választott évre `getUtolsoEv` + `profilAllapot`-ból; a sor a szerkesztőre visz, ha `canEditProfil`, különben az olvasó nézetre; …”.
5. Riportok: „A `riport.orszag` a beadó session-országának **kódja** (a `ticket.orszag` pillanatkép is), megjelenítés `orszagNev()`-vel” → „A `riport.orszag` a beadó egyik saját országának **kódja** (egy országnál automatikus, többnél a `RiportForm` „Ország” választója, alapértéke a székhely; az action ellenőrzi, hogy a session országai közt van), megjelenítés `orszagNev()`-vel”.
6. Országprofil: a lekérdezés-felsorolásban a „`getAttaseNev` (az ország első aktív attaséja, a profil-oldal fejléce)” helyett „a profil-oldal fejlécének attasé-listája `listOrszagAttasek` (`db/queries/attase-orszag.ts`) + `components/orszagprofil/AttaseLista`”; a `listTerkepAdat` leírásában „minden ország, ahol aktív attasé van vagy van profil” → „minden ország, ahol aktív attasé van (székhelyként vagy régiósan) vagy van profil”, és a mezőlistában a `poszt` helyett `attasek` (`OrszagAttase[]`, vezető elöl); a szótár-leírásban a blokk-interfészeknél: „(az `Alapadatok` a `fovaros`, `terulet` km², `penznem` mezőt is tartalmazza – a 0006 migráció másolta át a felhasználóról)”; a jog-mondat: „Jog `lib/orszagprofil-jog.ts` `canEditProfil(session, kod, ev, aktualisEv)`: admin bármely ország `EV_MIN`..aktuális év, attasé csak az az ország, amelynek relációs vezetője (`session.orszagok` `vezeto`), és csak az aktuális év”; a térkép-route leírásában „attasénak „Saját országprofil” gomb” → „attasénak „Saját országprofil” gomb (`elsoVezetettKod`: a székhely, ha ott vezető, különben az első vezetett ország; nem vezetőnek nincs gomb)”.
7. Kommunikáció: „`listCimzettJeloltek`)” → „`listCimzettJeloltek` – a nem tiltott, székhellyel rendelkező attasék; a `ticket.orszag` a címzett székhely-országának pillanatképe)”.
8. Térkép: „Tooltip (`TerkepTooltip`): név, attasé · főváros, …” → „Tooltip (`TerkepTooltip`): név, az attasék rövid sora (`attasekRovid`: az első – a vezető – attasé „név · város”, régiósnál „regionálisan (város)”, több attasénál „+N attasé”), …”.

- [ ] **Step 2: `README.md`**

1. Scriptek pont: „(szabadszöveges országnév → ISO-kód a `user`, `riport`, `ticket` táblákban, idempotens)” → „(… a `riport`, `ticket` táblákban, idempotens); demó attasék: `scripts/demo-attasek.ts` (a 15 valós példa, idempotens – lásd a CLAUDE.md parancslistáját)”.
2. „Bejelentkezés és felhasználók” második és harmadik pontja helyett:
   - „Admin a `/felhasznalok` oldalon hoz létre TéT attasé fiókokat (név, e-mail, kezdő jelszó; székhely: ország, a poszt városa, részterület – pl. a lefedett tartományok –, relációs vezető jelölés; régiós lefedettség: további országok; opcionálisan telefon, kapcsolattartási e-mail), szerkeszt, jelszót állít vissza, tilt és töröl. Nyilvános regisztráció nincs.”
   - „Szerepkörök: `admin` (NIÜ) és `attase`. Egy országban több attasé is lehet; közülük egy a relációs vezető, ő az országprofil felelőse és – az adminon kívül – egyedüli szerkesztője (egyszemélyes országban automatikus; ha több attasé marad vezető nélkül, a felhasználó-oldal figyelmeztet). Egy attasé regionálisan több országot is lefedhet; minden lefedett országára riportot adhat be. A főváros, terület, pénznem az országprofil Alapadatok blokkjában van.”
3. Képernyők tábla, `/orszagprofil/[kod]/szerkesztes`: „(attasé: saját ország, idei év; …)” → „(attasé: az az ország, amelynek relációs vezetője, idei év; …)”.
4. Hosting szakasz két új pontja:
   - „A demó attasék (`scripts/demo-attasek.ts`) a repó `data/tet.db`-jében vannak; egy már meglévő hosting-DB-be nem kerülnek be maguktól (a `db:init` csak hiányzó vagy felhasználó nélküli DB-t cserél). Ehhez töröld a hosting DB-fájlt (a következő build a repó DB-jét másolja), vagy futtasd ott a scriptet.”
   - „A build előbb migrál, csak utána fordít: a `0007` migráció törli a `user` régi oszlopait (`orszag`, `fovaros`, `terulet`, `penznem`), ezért a build ideje alatt a még futó régi verzió a bejelentkezett kérésekre hibát ad, és ha a `next build` elbukik, így is marad. Csendes időszakban deployolj, és előbb helyben fusson le hibátlanul a `npm run build`.”
5. Felépítés: új sor `lib/attase-orszag.ts` – „attasé–ország hozzárendelés: típusok, vezető-szabályok tiszta segédei (a DB-oldal `db/queries/attase-orszag.ts`)”; az `OldalsavAllapot` sorában „(attasé: saját ország, …)” → „(attasé: a saját országai, …)”.

- [ ] **Step 3: A spec**

`docs/superpowers/specs/2026-10-06-attase-orszagok-design.md` végére új szakasz, a végrehajtás közben
a spectől ténylegesen eltérő pontokkal (a review-javítások nyomán adódó változásokat is ide; a két
migráció és a tooltip főváros nélkül már a spec része). Ha nem volt eltérés, a szakasz egy sor:

```markdown
## Megvalósítási eltérések

- A vezető nélküli országok figyelmeztetése csak az aktív attaséval rendelkező országokat sorolja fel
  (a csupa tiltott attasés országban nincs kire átadni a vezetést; a tiltott fiók szerkesztésével rendezhető).
- A vezető-jelölő súgója: „Mentéskor ő lesz a relációs vezető (jelenleg: X).” (a „vezetőség” testületet
  jelentene); tiltott vezetőnél „(jelenleg: X, tiltott)”, illetve „Jelenlegi vezető: X (tiltott).”
- A validátor kimenete és a felhasználó-lista sora egyaránt `AttaseOrszag` (a spec `AttaseOrszagInput` neve
  helyett); a dialógusok országonkénti listájának típusa `OrszagTagok` (prop: `orszagTagok`).
- Az összehasonlító tábla „Attasé” sora egysoros (`attasekRovid`: „név · város +N attasé”, régiósnál
  „regionálisan”), nem név + halvány város két sorban.
- A profil fejléce akkor is kiírja a „Nincs kijelölt relációs vezető.” sort, ha egyetlen aktív, nem vezető
  attasé van (pl. a vezető tiltott).
- A vezető-jelölő alapértéke akkor is „bejelölve”, ha a másik vezető tiltott (gyakorlatilag nincs aktív vezető).
- A 0006 migráció: a régi `user.orszag` trimmelve kerül át (üres/csak szóköz nem ad sort); a vezetőválasztás
  döntetlennél az id-vel determinisztikus; a főváros/terület/pénznem mezőnként az ország bármely attaséjától
  átvehető (a vezető előnyben), és hibás JSON-ú Alapadatok blokkot nem érint.
- Az admin felhasználó esetleg ott maradt `attase_orszag` sorai a profil- és térkép-listákban nem jelennek meg;
  a `setAttaseOrszagok` a város/részterület értéket csak a székhely-sorra írja.
- A `scripts/orszag-kod-migracio.ts` a `user` helyett az `attase_orszag` sorait írja át.
- A `0007` migráció a build elején fut: a régi verzió a build ideje alatt hibát adhat (README, hosting).
```

(A végrehajtás közben adódó további eltéréseket fűzd hozzá.)

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: sikeres (`db:init` nincs teendő, `drizzle-kit migrate` nincs teendő, `next build` típusellenőrzéssel zöld). Ha nem létező `app/...` modulra panaszkodik: `rm .next/dev/types/validator.ts`, majd újra (CLAUDE.md).

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md README.md docs/superpowers/specs/2026-10-06-attase-orszagok-design.md
git commit -m "$(printf 'docs(attase-orszagok): CLAUDE.md, README és a spec – attasé–ország hozzárendelés, relációs vezető, régiós lefedettség, demó attasék\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 15: Böngészős végellenőrzés és a demó DB commitja

**Files:**
- Commit: `data/tet.db`

- [ ] **Step 1: Admin**

gstack, `http://localhost:3000`, admin:
1. `/felhasznalok`: 16 felhasználó; ★ Kindert Juditnál (Németország · Berlin) és dr. Nagy Gabriellánál (Amerikai Egyesült Államok · New York); nincs figyelmeztetés; Szántó Szilviánál „régió: Algéria, Marokkó, Mauritánia, Tunézia”.
2. Kindert Judit szerkesztése: a részterület szövegdobozban a tartományok; a jelölő bejelölt, súgó nincs; Mégse.
3. `/terkep`: Németország tooltipje „Kindert Judit · Berlin +2 attasé”; a kivonatban három attasé, Kindertnél „· relációs vezető”; Puerto Rico színezett poligon (van attaséja), a Maldív-szigetek pinje kijelölhető; az Amerikai Virgin-szigetek pinje 1× nagyításnál a Puerto Ricóé alá esik – nagyítva (vagy a rangsor-panelből) ellenőrizd; Algéria tooltipje „Szántó Szilvia · regionálisan (Párizs)”.
4. `/orszagprofil/DE`: az attasé-lista három sorral, a részterületekkel, „Relációs vezető” jelvény Kindertnél; `/orszagprofil/DZ`: „Szántó Szilvia · regionálisan, székhely: Párizs, Franciaország”; `/orszagprofil/KR`: az Alapadatokban Főváros: Szöul, Terület: 100 210 km², Pénznem.
5. `/kommunikacio` → „Új ticket”: a címzettek közt „Kindert Judit · Németország”, „Szántó Szilvia · Franciaország” (ne hozz létre ticketet).

- [ ] **Step 2: Nem vezető attasé (Komma Krisztián)**

Jelszó: `sed -n 's/^DEMO_ATTASE_PASSWORD=//p' .env.example` (ne írd ki a logba). Kijelentkezés után `komma.krisztian@niu.hu`:
1. Oldalsáv: „TéT attasé · Németország”, kártya „Országprofil · <év>”, a sor „… · Megnyitás →”.
2. `/orszagprofil/DE`: nincs Szerkesztés gomb; `/orszagprofil/DE/szerkesztes` → 404; `/terkep`: nincs „Saját országprofil” gomb.
3. `/uj-riport`: „A bejegyzés a(z) Németország poszthoz kerül” (nincs ország-választó) → hozz létre egy QA-bejegyzést → a részletoldalon Németország → **töröld a bejegyzést**.

- [ ] **Step 3: Több országos vezető attasé (Szántó Szilvia)**

`szanto.szilvia@niu.hu`:
1. Oldalsáv: „TéT attasé · Franciaország +4”; kártya „Országprofilok · <év>” öt sorral, mindegyik „Szerkesztés →” (az aktuális évben).
2. `/uj-riport`: „Ország” választó 5 opcióval, alapérték Franciaország; válaszd Marokkót → beadás → a részletoldalon Marokkó → **töröld a bejegyzést**.
3. `/orszagprofil/MA/szerkesztes` megnyílik (régiós vezető); ne ments.
4. `/terkep`: „Saját országprofil” gomb Franciaországra visz.

- [ ] **Step 4: Konzol**

Minden lépés után `console --errors` üres.

- [ ] **Step 5: A demó DB véglegesítése**

```bash
sqlite3 data/tet.db "select count(*) from riport; select count(*) from ticket;"   # 0 és 0 (a QA-bejegyzések törölve)
sqlite3 data/tet.db "delete from session where user_id in (select id from user where role = 'attase');"   # a QA-belépések
sqlite3 data/tet.db "PRAGMA wal_checkpoint(TRUNCATE);"
git add data/tet.db
git commit -m "$(printf 'chore(attase-orszagok): demó DB – 0006/0007 migráció, 15 demó attasé, régi tesztfiókok nélkül\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
git status --short   # üres
```

- [ ] **Step 6: Lezárás**

A branch kész: `superpowers:finishing-a-development-branch` (a felhasználó korábban lokális fast-forward merge-et választott, nem PR-t).
