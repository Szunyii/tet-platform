# TéT Monitoring és értékelés, 2. szakasz – megvalósítási terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Az attasék tevékenységeket és eredményeket rögzítenek, a központ igazol, éves munkatervek készülnek, a jelentések egyenként minősíthetők, és mindez megjelenik a félévi értékelésben.

**Architecture:** Három egymásra épülő blokk: A) tevékenységek és eredmények, B) éves munkaterv, C) jelentésminősítés. Az üzleti szabályok tiszta `lib/` függvényekben, a DB-hozzáférés `db/queries/` modulokban, az új oldalak az `app/(app)/tevekenysegek/` és `app/(app)/munkaterv/` alatt készülnek. A félévi pillanatkép opcionális mezőkkel bővül, a régi pillanatképek érintetlenek maradnak.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Drizzle + better-sqlite3, shadcn/ui (Base UI), Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-11-18-monitoring-ertekeles-2-szakasz-design.md`

## Global Constraints

- Minden felületi szöveg magyar. A szótári feliratok a spec 5.1. és 6.1. pontjából szó szerint kerülnek a kódba.
- Next.js-kód írása előtt olvasd el a vonatkozó útmutatót a `node_modules/next/dist/docs/` alatt (`AGENTS.md`).
- A meglévő fájlok mintájára relatív importokat használj. Új npm-függőség nem vehető fel.
- **A `data/tet.db`-t egyetlen lépés sem módosíthatja.** A repóban `npm run build` és `npm run db:migrate` nem futtatható, csak az alábbi eldobható környezetekben.
- A felhasználó futó dev szerverét nem szabad leállítani. A böngészős ellenőrzés az eldobható másolatban fut.
- Rangsor és pontszám szerinti rendezés sehol nincs. Fokozatot, összminősítést és munkaterv-eredményt kód nem számol át minősítéssé.
- Az attasé a Monitoring oldalakat, a saját fokozatait és a jelentései minősítését nem kapja meg.
- Minden oldal és action szerveroldalon ellenőrzi a jogosultságot. Idegen bejegyzésre az oldal 404-et ad. Minden mutáció után `revalidatePath('/', 'layout')` fut.
- A választott évtől függő hibára `notFound()` tilos, helyette tájékoztató kártya jelenik meg (CLAUDE.md).
- Az író műveletek `db.transaction(fn, { behavior: 'immediate' })`-ben futnak.
- A rögzített `attase_ertekeles.mutatok` pillanatképet semmi nem írhatja át.
- A dátumhatárok Europe/Budapest szerint értendők.
- A projektben nincs tesztkeretrendszer. A tesztek eldobható `scripts/_ert2-*.ts` fájlok `node:assert/strict`-tel, és nem kerülnek commitba.
- Minden commit üzenete ezzel a sorral zárul: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Munkaág: `monitoring-2-szakasz`.
- A `CLAUDE.md`-ben lehet más munkamenet nem commitolt módosítása. Azt nem szabad commitolni, visszavonni vagy felülírni.

## Review Focus

1. **Két admin ugyanazt az igazolási kérést dönti el:** a második elavult verzió miatt hibát kap, és nem keletkezik második esemény.
2. **Hamisított azonosító vagy ország az űrlapban:** idegen eredmény, jelentés vagy nem saját ország elutasításra kerül, adat nem változik.
3. **A kérés féléve közben lezárult:** az igazolás az igazolás félévébe számít, a lezárt pillanatkép nem változik.
4. **Bővített adat nélküli régi félév:** az adatlap és a munkalap hiba nélkül „nincs adat” jelzést mutat, nullát nem.
5. **A jelentés minősítése az attasénál:** sem a fokozat, sem a megjegyzés nem szerepel az attasénak küldött HTML-ben vagy adatban.

## Eldobható környezetek

**Adatbázis a query-tesztekhez** (minden futás előtt hozd létre újra):

```bash
export ERT_DB="${TMPDIR:-/tmp}/tet-ert2-teszt.db"
rm -f "$ERT_DB" "$ERT_DB-wal" "$ERT_DB-shm"
sqlite3 -readonly data/tet.db ".backup '$ERT_DB'"
DATABASE_URL="$ERT_DB" npx drizzle-kit migrate
```

**Böngészős ellenőrzés (QA-környezet):** háttérfolyamatként indítsd, és a feladat végén állítsd le.

```bash
REPO="$PWD"; QA_DIR="${TMPDIR:-/tmp}/tet-ert2-qa"; mkdir -p "$QA_DIR"
rsync -a --delete --exclude node_modules --exclude .next --exclude .git --exclude 'data/*.db*' ./ "$QA_DIR/"
[ -d "$QA_DIR/node_modules" ] || cp -cR node_modules "$QA_DIR/node_modules"
cd "$QA_DIR" && DATABASE_URL="$REPO/data/tet-ertekeles-teszt.db" BETTER_AUTH_URL=http://localhost:3120 npx next dev -p 3120
```

Kódváltozás után elég az `rsync` sort újra futtatni. Böngésző: `~/.claude/skills/gstack/browse/dist/browse`. Admin: `admin@niu.hu`, jelszó a `.env.local` `SEED_ADMIN_PASSWORD` értéke (ne írd ki). Attasé: `teszt01@ertekeles.test`, jelszó `Teszt-Attase-2026!`. A QA után generáld újra a tesztadatbázist: `NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-ertekeles.ts`. A másolat tartalmazza a `.env.local`-t, ezért a 12. feladat törli.

## Fájlszerkezet

| Fájl | Felelősség |
| --- | --- |
| `lib/tevekenyseg-szotar.ts` | Típusok, szakaszok, állapotok, korlátok |
| `lib/tevekenyseg-allapot.ts` | Az ügy állapotgépe, zárolás, beszámítási félév |
| `lib/tevekenyseg-validacio.ts` | Űrlapok validálása |
| `lib/tevekenyseg-jog.ts` | Jogosultság |
| `lib/tevekenyseg-szuro.ts` | URL-szűrők |
| `db/schema/tevekenyseg.ts`, `db/queries/tevekenyseg.ts` | Tábla és lekérdezések |
| `app/(app)/tevekenysegek/` | Attaséi és admin felület |
| `lib/munkaterv-szotar.ts`, `lib/munkaterv-validacio.ts`, `lib/munkaterv-jog.ts` | Munkaterv-szabályok |
| `db/schema/munkaterv.ts`, `db/queries/munkaterv.ts` | Munkaterv-adatok |
| `app/(app)/munkaterv/` | Munkaterv-felületek |
| `db/schema/riport-minosites.ts`, `db/queries/riport-minosites.ts`, `lib/riport-minosites.ts` | Jelentésminősítés |
| `lib/ertekeles-mutatok.ts`, `lib/ertekeles-megjelenites.ts`, `db/queries/ertekeles.ts` | A pillanatkép bővítése |

---

## A blokk: tevékenységek és eredmények

### Task 1: Szótár, állapotgép, validáció, jogosultság

**Files:**
- Create: `lib/tevekenyseg-szotar.ts`, `lib/tevekenyseg-allapot.ts`, `lib/tevekenyseg-validacio.ts`, `lib/tevekenyseg-jog.ts`
- Test: `scripts/_ert2-logika.ts`

**Interfaces:**
- Consumes: `Felev`, `futoFelev` (`lib/ertekeles-idoszak.ts`), `mezo`, `ParseResult` (`lib/urlap.ts`), `AppSession` típus
- Produces, `lib/tevekenyseg-szotar.ts`:

```ts
export type TevekenysegTipus = 'delegacio' | 'b2b' | 'partnerkozvetites';
export type Szakasz = 'lehetoseg' | 'kapcsolat' | 'egyuttmukodes' | 'megallapodas';
export type Hozzajarulas = 'kozvetlen' | 'kozremukodes';
export type IgazolasAllapot = 'nem_igenyel' | 'igazolasra_var' | 'igazolt' | 'visszakuldott';
export type UgyAllapot = 'aktiv' | 'megszakadt';
export type EsemenyTipus = 'letrehozas' | 'szakaszvaltas' | 'igazolas_keres' | 'igazolas' | 'visszakuldes' | 'igazolas_visszavonas' | 'megszakitas' | 'ujrainditas';
export const TEVEKENYSEG_TIPUSOK: readonly { kulcs: TevekenysegTipus; cimke: string }[];
export const SZAKASZOK: readonly { kulcs: Szakasz; cimke: string }[];
export const HOZZAJARULASOK: readonly { kulcs: Hozzajarulas; cimke: string }[];
export const IGAZOLAS_CIMKE: Record<IgazolasAllapot, string>;
export const UGY_ALLAPOT_CIMKE: Record<UgyAllapot, string>;
export const ESEMENY_CIMKE: Record<EsemenyTipus, string>;
export const MEGNEVEZES_MAX = 200; export const PARTNER_MAX = 200; export const MAGYAR_SZEREPLO_MAX = 200;
export const SZOVEG_MAX = 2000; export const LINK_MAX = 500;
export function isTevekenysegTipus(v: string): v is TevekenysegTipus;
export function isSzakasz(v: string): v is Szakasz;
export function isHozzajarulas(v: string): v is Hozzajarulas;
export function tipusCimke(k: TevekenysegTipus): string;
export function szakaszCimke(k: Szakasz): string;
export function hozzajarulasCimke(k: Hozzajarulas): string;
export function kovetkezoSzakasz(k: Szakasz): Szakasz | null;
export function igazolastKer(cel: Szakasz): boolean;
```

- Produces, `lib/tevekenyseg-allapot.ts`:

```ts
export interface UgyAdat { szakasz: Szakasz; kertSzakasz: Szakasz | null; igazolas: IgazolasAllapot; allapot: UgyAllapot }
export type AttaseMuvelet = 'kapcsolatba_lep' | 'igazolast_ker' | 'megszakit' | 'ujraindit' | 'modosit' | 'torol';
export type AdminMuvelet = 'igazol' | 'visszakuld' | 'visszavon' | 'kifogasol' | 'kifogast_visszavon';
export function oszlopSzakasz(u: UgyAdat): Szakasz;
export function befejezettE(u: UgyAdat): boolean;
export function mezokZarolvaE(u: UgyAdat): boolean;
export function attaseMuveletek(u: UgyAdat, torolheto: boolean): AttaseMuvelet[];
export function adminMuveletek(u: UgyAdat, kifogasolt: boolean): AdminMuvelet[];
export function beszamitasiFelev(kertNap: string, igazolasNap: string, kertFelevLezartVolt: boolean): Felev;
```

- Produces, `lib/tevekenyseg-validacio.ts`:

```ts
export interface TevekenysegInput { tipus: TevekenysegTipus; datum: string; orszagKod: string; megnevezes: string; partner: string; magyarSzereplo: string | null; leiras: string | null; riportId: string | null; eredmenyId: string | null }
export interface EredmenyInput { megnevezes: string; orszagKod: string; partner: string; magyarSzereplo: string | null; hozzajarulas: Hozzajarulas; leiras: string | null; kezdoSzakasz: 'lehetoseg' | 'kapcsolat' }
export interface IgazolasKeresInput { indoklas: string; link: string | null; riportId: string | null; verzio: number }
export interface MegjegyzesInput { megjegyzes: string; verzio: number }
export function parseTevekenysegForm(fd: FormData, ma: string, orszagok: readonly string[]): ParseResult<TevekenysegInput>;
export function parseEredmenyForm(fd: FormData, orszagok: readonly string[]): ParseResult<EredmenyInput>;
export function parseIgazolasKeresForm(fd: FormData): ParseResult<IgazolasKeresInput>;
export function parseMegjegyzesForm(fd: FormData): ParseResult<MegjegyzesInput>;
export function parseVerzio(fd: FormData): number | null;
```

- Produces, `lib/tevekenyseg-jog.ts`: `canRogzit(session: AppSession): boolean`, `canViewBejegyzes(session: AppSession, b: { attaseId: string }): boolean`, `canModosit(session: AppSession, b: { attaseId: string }): boolean`, `canIgazol(session: AppSession): boolean`

- [ ] **Step 1: Írd meg a tesztet (`scripts/_ert2-logika.ts`)**

```ts
import assert from 'node:assert/strict';
import { adminMuveletek, attaseMuveletek, befejezettE, beszamitasiFelev, mezokZarolvaE, oszlopSzakasz, type UgyAdat } from '../lib/tevekenyseg-allapot';
import { canIgazol, canModosit, canRogzit, canViewBejegyzes } from '../lib/tevekenyseg-jog';
import { igazolastKer, kovetkezoSzakasz } from '../lib/tevekenyseg-szotar';
import { parseEredmenyForm, parseIgazolasKeresForm, parseMegjegyzesForm, parseTevekenysegForm } from '../lib/tevekenyseg-validacio';
import type { AppSession } from '../lib/session';

const u = (r: Partial<UgyAdat> = {}): UgyAdat => ({ szakasz: 'lehetoseg', kertSzakasz: null, igazolas: 'nem_igenyel', allapot: 'aktiv', ...r });
assert.equal(kovetkezoSzakasz('lehetoseg'), 'kapcsolat');
assert.equal(kovetkezoSzakasz('megallapodas'), null);
assert.equal(igazolastKer('kapcsolat'), false);
assert.equal(igazolastKer('egyuttmukodes'), true);
assert.equal(igazolastKer('megallapodas'), true);

const fuggo = u({ szakasz: 'kapcsolat', kertSzakasz: 'egyuttmukodes', igazolas: 'igazolasra_var' });
const igazoltE = u({ szakasz: 'egyuttmukodes', igazolas: 'igazolt' });
const kesz = u({ szakasz: 'megallapodas', igazolas: 'igazolt' });
assert.equal(oszlopSzakasz(fuggo), 'egyuttmukodes');
assert.equal(oszlopSzakasz(igazoltE), 'egyuttmukodes');
assert.equal(mezokZarolvaE(u()), false);
assert.equal(mezokZarolvaE(fuggo), true);
assert.equal(mezokZarolvaE(igazoltE), true);
assert.equal(mezokZarolvaE(u({ szakasz: 'egyuttmukodes', igazolas: 'visszakuldott' })), true);
assert.equal(mezokZarolvaE(u({ szakasz: 'kapcsolat', igazolas: 'visszakuldott' })), false);
assert.equal(befejezettE(kesz), true);
assert.equal(befejezettE(u({ szakasz: 'egyuttmukodes', kertSzakasz: 'megallapodas', igazolas: 'igazolasra_var' })), false);

assert.deepEqual(attaseMuveletek(u(), true), ['kapcsolatba_lep', 'megszakit', 'modosit', 'torol']);
assert.deepEqual(attaseMuveletek(u({ szakasz: 'kapcsolat' }), false), ['igazolast_ker', 'megszakit', 'modosit']);
assert.deepEqual(attaseMuveletek(fuggo, false), ['megszakit', 'modosit']);
assert.deepEqual(attaseMuveletek(igazoltE, false), ['igazolast_ker', 'megszakit', 'modosit']);
assert.deepEqual(attaseMuveletek(kesz, false), ['modosit']);
assert.deepEqual(attaseMuveletek(u({ allapot: 'megszakadt' }), true), ['ujraindit']);

assert.deepEqual(adminMuveletek(fuggo, false), ['igazol', 'visszakuld']);
assert.deepEqual(adminMuveletek(igazoltE, false), ['visszavon']);
assert.deepEqual(adminMuveletek(kesz, false), ['visszavon']);
assert.deepEqual(adminMuveletek(u({ szakasz: 'egyuttmukodes', igazolas: 'visszakuldott' }), false), ['visszavon']);
assert.deepEqual(adminMuveletek(u(), false), ['kifogasol']);
assert.deepEqual(adminMuveletek(u({ szakasz: 'kapcsolat', igazolas: 'visszakuldott' }), true), ['kifogast_visszavon']);
assert.deepEqual(adminMuveletek(u({ allapot: 'megszakadt' }), false), []);

assert.deepEqual(beszamitasiFelev('2026-06-20', '2026-06-25', false), { ev: 2026, felev: 1 });
assert.deepEqual(beszamitasiFelev('2026-06-20', '2026-07-10', false), { ev: 2026, felev: 1 });
assert.deepEqual(beszamitasiFelev('2026-06-20', '2026-07-10', true), { ev: 2026, felev: 2 });

const fd = (o: Record<string, string>) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v); return f; };
const hiba = (r: { ok: boolean; errors?: Record<string, string> }, k: string) => (r.ok ? undefined : r.errors?.[k]);
const tev = { tipus: 'b2b', datum: '2026-11-10', orszag: 'ES', megnevezes: 'Egyeztetés', partner: 'Helyi egyetem', magyarSzereplo: '', leiras: '', riportId: '', eredmenyId: '' };
const t = (r: Record<string, string> = {}) => parseTevekenysegForm(fd({ ...tev, ...r }), '2026-11-18', ['ES', 'PT']);
const jo = t();
assert.ok(jo.ok && jo.data.magyarSzereplo === null && jo.data.riportId === null);
assert.equal(hiba(t({ tipus: 'x' }), 'tipus'), 'Válassz tevékenységtípust.');
assert.equal(hiba(t({ datum: '2026-11-19' }), 'datum'), 'A dátum nem lehet jövőbeli.');
assert.equal(hiba(t({ datum: '2026-02-31' }), 'datum'), 'Adj meg érvényes dátumot.');
assert.equal(hiba(t({ orszag: 'FR' }), 'orszag'), 'Válassz a saját országaid közül.');
assert.equal(hiba(t({ megnevezes: ' ' }), 'megnevezes'), 'A megnevezés kötelező.');
assert.equal(hiba(t({ partner: '' }), 'partner'), 'A partner megadása kötelező.');
assert.equal(hiba(t({ tipus: 'partnerkozvetites' }), 'magyarSzereplo'), 'Partnerközvetítésnél a magyar szereplő megadása kötelező.');
assert.equal(hiba(t({ leiras: 'x'.repeat(2001) }), 'leiras'), 'A leírás legfeljebb 2000 karakter lehet.');

const er = { megnevezes: 'Közös kutatás', orszag: 'ES', partner: 'Helyi intézet', magyarSzereplo: '', hozzajarulas: 'kozvetlen', leiras: '', kezdoSzakasz: 'lehetoseg' };
assert.ok(parseEredmenyForm(fd(er), ['ES']).ok);
assert.equal(hiba(parseEredmenyForm(fd({ ...er, kezdoSzakasz: 'egyuttmukodes' }), ['ES']), 'kezdoSzakasz'), 'A kezdő szakasz csak Lehetőség vagy Kapcsolat lehet.');
assert.equal(hiba(parseEredmenyForm(fd({ ...er, hozzajarulas: 'x' }), ['ES']), 'hozzajarulas'), 'Válaszd ki a hozzájárulás módját.');

const k = (r: Record<string, string> = {}) => parseIgazolasKeresForm(fd({ indoklas: 'Aláírták.', link: '', riportId: '', verzio: '123', ...r }));
assert.ok(k().ok);
assert.equal(hiba(k({ indoklas: '' }), 'indoklas'), 'Az indoklás kötelező.');
assert.equal(hiba(k({ link: 'javascript:alert(1)' }), 'link'), 'Csak http vagy https cím adható meg.');
const link = k({ link: 'https://pelda.hu/a' });
assert.ok(link.ok && link.data.link === 'https://pelda.hu/a');
assert.equal(hiba(k({ verzio: '' }), 'form'), 'Hibás kérés.');
assert.equal(hiba(parseMegjegyzesForm(fd({ megjegyzes: '', verzio: '1' })), 'megjegyzes'), 'A megjegyzés kötelező.');

const ses = (role: 'admin' | 'attase', userId = 'a') => ({ userId, name: 'N', email: 'e', role, orszagok: [] }) as AppSession;
assert.equal(canRogzit(ses('attase')), true);
assert.equal(canRogzit(ses('admin')), false);
assert.equal(canViewBejegyzes(ses('attase'), { attaseId: 'a' }), true);
assert.equal(canViewBejegyzes(ses('attase'), { attaseId: 'b' }), false);
assert.equal(canViewBejegyzes(ses('admin'), { attaseId: 'b' }), true);
assert.equal(canModosit(ses('admin'), { attaseId: 'b' }), false);
assert.equal(canModosit(ses('attase'), { attaseId: 'a' }), true);
assert.equal(canIgazol(ses('admin')), true);
assert.equal(canIgazol(ses('attase')), false);
console.log('OK');
```

- [ ] **Step 2: Futtasd, és ellenőrizd, hogy elbukik**

Run: `npx tsx scripts/_ert2-logika.ts`
Expected: FAIL, nem található a `lib/tevekenyseg-allapot` modul.

- [ ] **Step 3: Valósítsd meg a négy fájlt**

A feliratok a spec 5.1. pontjából jönnek. Az `ESEMENY_CIMKE` értékei: Létrehozás, Szakaszváltás, Igazolás kérése, Igazolás, Visszaküldés, Igazolás visszavonása, Megszakítás, Újraindítás. A `mezokZarolvaE` igaz, ha van függő kérés, vagy az érvényes szakasz `egyuttmukodes` vagy `megallapodas`. A `beszamitasiFelev` a `futoFelev` függvénnyel fordít napot félévre. Az `attaseMuveletek` sorrendje: szakaszlépés, `megszakit`, `modosit`, `torol`. A `torol` csak `torolheto` esetén szerepel. A link értéke a `new URL()` `href`-je.

- [ ] **Step 4: Futtasd a tesztet**

Run: `npx tsx scripts/_ert2-logika.ts`
Expected: `OK`

- [ ] **Step 5: Ellenőrizz és commitolj**

Run: `npx tsc --noEmit`, majd `rm scripts/_ert2-logika.ts`.

```bash
git add lib/tevekenyseg-szotar.ts lib/tevekenyseg-allapot.ts lib/tevekenyseg-validacio.ts lib/tevekenyseg-jog.ts
git commit -m "feat(tevekenyseg): szótár, állapotgép, validáció és jogosultság"
```

---

### Task 2: Séma, migráció és lekérdezések

**Files:**
- Create: `db/schema/tevekenyseg.ts`, `drizzle/0015_tevekenyseg.sql` (generált), `db/queries/tevekenyseg.ts`
- Modify: `db/schema/index.ts`, `db/schema/ertekeles.ts`, `lib/ertekeles-idoszak.ts`, `db/queries/ertekeles.ts`
- Test: `scripts/_ert2-tevekenyseg.ts`

**Interfaces:**
- Consumes: Task 1 minden exportja
- Produces, `lib/ertekeles-idoszak.ts`: `BOVITETT_ADATOK_ELSO_FELEV: Felev` (`{ ev: 2027, felev: 1 }`), `bovitettAdatokFelev(f: Felev): boolean`
- Produces, `db/queries/ertekeles.ts`: `IdoszakSor.bovitettAdatok: boolean`
- Produces, `db/queries/tevekenyseg.ts`:

```ts
export type IrasEredmeny = 'ok' | 'nincs' | 'elavult' | 'ervenytelen' | 'lezart_felev';
export interface TevekenysegSor extends TevekenysegInput { id: string; attaseId: string; attaseNev: string; kifogas: string | null; kifogasSzerzoNev: string | null; eredmenyNev: string | null; riportTargy: string | null; zarolt: boolean; verzio: number; updatedAt: Date }
export interface EredmenySor extends UgyAdat { id: string; attaseId: string; attaseNev: string; varos: string | null; megnevezes: string; orszagKod: string; partner: string; magyarSzereplo: string | null; hozzajarulas: Hozzajarulas; leiras: string | null; kifogas: string | null; kifogasSzerzoNev: string | null; tevekenysegDb: number; megallapodasEv: number | null; torolheto: boolean; verzio: number; updatedAt: Date }
export interface EsemenySor { id: string; tipus: EsemenyTipus; szakasz: Szakasz | null; szoveg: string | null; link: string | null; riportId: string | null; riportTargy: string | null; szerzoNev: string; szerzoSzerep: 'admin' | 'attase'; visszavonva: boolean; createdAt: Date }
export interface EredmenyReszlet extends EredmenySor { esemenyek: EsemenySor[]; tevekenysegek: TevekenysegSor[] }
export interface IgazolasKeresSor extends EredmenySor { keres: EsemenySor; jelentesDb: number }
export interface TevekenysegSzuro { attaseId?: string; orszag?: string; regio?: RegioKulcs; ev?: number; felev?: FelevSzam }
export interface EredmenySzuro { attaseId?: string; orszag?: string; regio?: RegioKulcs; szakasz?: Szakasz; allapot?: UgyAllapot }
export function listTevekenysegek(s: TevekenysegSzuro): TevekenysegSor[];
export function listEredmenyek(s: EredmenySzuro): EredmenySor[];
export function listIgazolasraVar(): IgazolasKeresSor[];
export function getEredmeny(id: string): EredmenyReszlet | null;
export function listSajatAktivEredmenyek(attaseId: string): { id: string; megnevezes: string }[];
export function getRiportElotoltes(riportId: string, attaseId: string): { riportId: string; megnevezes: string; datum: string; orszagKod: string } | null;
export function countRiportTevekenyseg(riportId: string): number;
export function createTevekenyseg(attaseId: string, i: TevekenysegInput, most?: Date): { eredmeny: IrasEredmeny; id?: string };
export function updateTevekenyseg(id: string, attaseId: string, i: TevekenysegInput, verzio: number, most?: Date): IrasEredmeny;
export function deleteTevekenyseg(id: string, attaseId: string): IrasEredmeny;
export function createEredmeny(attaseId: string, i: EredmenyInput, szerzoNev: string, most?: Date): { eredmeny: IrasEredmeny; id?: string };
export function updateEredmeny(id: string, attaseId: string, i: EredmenyInput, verzio: number, most?: Date): IrasEredmeny;
export function deleteEredmeny(id: string, attaseId: string): IrasEredmeny;
export function kapcsolatbaLep(id: string, attaseId: string, szerzoNev: string, verzio: number, most?: Date): IrasEredmeny;
export function kerIgazolast(id: string, attaseId: string, i: IgazolasKeresInput, szerzoNev: string, most?: Date): IrasEredmeny;
export function igazol(id: string, szerzoNev: string, verzio: number, most?: Date): IrasEredmeny;
export function visszakuld(id: string, i: MegjegyzesInput, szerzoNev: string, most?: Date): IrasEredmeny;
export function visszavon(id: string, i: MegjegyzesInput, szerzoNev: string, most?: Date): IrasEredmeny;
export function megszakit(id: string, attaseId: string, i: MegjegyzesInput, szerzoNev: string, most?: Date): IrasEredmeny;
export function ujraindit(id: string, attaseId: string, szerzoNev: string, verzio: number, most?: Date): IrasEredmeny;
export function kifogasolTevekenyseg(id: string, megjegyzes: string, szerzoNev: string, most?: Date): IrasEredmeny;
export function visszavonTevekenysegKifogas(id: string): IrasEredmeny;
export function kifogasolEredmeny(id: string, i: MegjegyzesInput, szerzoNev: string, most?: Date): IrasEredmeny;
export function visszavonEredmenyKifogas(id: string, verzio: number): IrasEredmeny;
export function countTevekenysegTeendo(session: { userId: string; role: 'admin' | 'attase' }): number;
```

- [ ] **Step 1: Írd meg a sémát a spec 5.7. pontja szerint**

Az `ertekelesi_idoszak` új oszlopa: `bovitettAdatok: integer('bovitett_adatok', { mode: 'boolean' }).notNull().default(false)`. CHECK-ek: minden szótári oszlopra `in (...)`, a `kert_szakasz` `null` vagy `egyuttmukodes`, `megallapodas`, a `beszamitasi_felev` `null` vagy 1, 2. Indexek: `attase_id`, `datum`, `eredmeny_id`, és az eseményeken `(eredmeny_id, created_at)`.

- [ ] **Step 2: Generáld és ellenőrizd a migrációt**

Run:
```bash
npx drizzle-kit generate --name tevekenyseg
grep -c "__new_" drizzle/0015_tevekenyseg.sql
grep -c 'ALTER TABLE `ertekelesi_idoszak` ADD `bovitett_adatok`' drizzle/0015_tevekenyseg.sql
```
Expected: az első szám `0`, a második `1`. Ha a generálás táblát épít újra, állj meg, és jelezd.

- [ ] **Step 3: Írd meg a tesztet (`scripts/_ert2-tevekenyseg.ts`)**

A script elején törli az `attase` szerepkörű felhasználókat, közvetlen inserttel létrehozza az `a` és `b` attasét, országaik `ES`, illetve `PT`, valamint egy `a` szerzőjű `r1` és egy `b` szerzőjű `r2` jelentést.

```ts
const most = new Date('2026-11-18T10:00:00Z');
const tev = (r: Partial<TevekenysegInput> = {}): TevekenysegInput => ({ tipus: 'b2b', datum: '2026-10-01', orszagKod: 'ES', megnevezes: 'Találkozó', partner: 'Egyetem', magyarSzereplo: null, leiras: null, riportId: null, eredmenyId: null, ...r });
const er = (r: Partial<EredmenyInput> = {}): EredmenyInput => ({ megnevezes: 'Ügy', orszagKod: 'ES', partner: 'Intézet', magyarSzereplo: null, hozzajarulas: 'kozvetlen', leiras: null, kezdoSzakasz: 'lehetoseg', ...r });
const friss = (id: string) => getEredmeny(id)!;
assert.equal(bovitettAdatokFelev({ ev: 2026, felev: 2 }), false);
assert.equal(bovitettAdatokFelev({ ev: 2027, felev: 1 }), true);

// Tevékenység, hamisított hivatkozások, lezárt félév (Review Focus 2)
const t1 = createTevekenyseg('a', tev(), most);
assert.equal(t1.eredmeny, 'ok');
assert.equal(createTevekenyseg('a', tev({ riportId: 'r2' }), most).eredmeny, 'ervenytelen');
db.insert(ertekelesiIdoszak).values({ id: 'i1', ev: 2026, felev: 1, statusz: 'lezart', lezarvaAt: new Date('2026-07-08T10:00:00Z') }).run();
assert.equal(createTevekenyseg('a', tev({ datum: '2026-03-01' }), most).eredmeny, 'lezart_felev');
assert.equal(updateTevekenyseg(t1.id!, 'b', tev(), 1, most), 'nincs');
assert.equal(deleteTevekenyseg(t1.id!, 'b'), 'nincs');

// Kifogás: módosítás után megszűnik
assert.equal(kifogasolTevekenyseg(t1.id!, 'Pontosítandó', 'Admin', most), 'ok');
const kif = listTevekenysegek({ attaseId: 'a' })[0];
assert.equal(kif.kifogas, 'Pontosítandó');
assert.equal(updateTevekenyseg(t1.id!, 'a', tev({ megnevezes: 'Javítva' }), kif.verzio, most), 'ok');
assert.equal(listTevekenysegek({ attaseId: 'a' })[0].kifogas, null);

// Eredmény életciklusa
const e = createEredmeny('a', er(), 'A', most).id!;
assert.equal(createEredmeny('a', er({ orszagKod: 'FR' }), 'A', most).eredmeny, 'ervenytelen');
assert.equal(kapcsolatbaLep(e, 'b', 'B', friss(e).verzio, most), 'nincs');
assert.equal(kapcsolatbaLep(e, 'a', 'A', friss(e).verzio - 1, most), 'elavult');
assert.equal(kapcsolatbaLep(e, 'a', 'A', friss(e).verzio, most), 'ok');
assert.equal(friss(e).szakasz, 'kapcsolat');
assert.equal(friss(e).torolheto, true);
assert.equal(kerIgazolast(e, 'a', { indoklas: 'Kérem', link: null, riportId: 'r2', verzio: friss(e).verzio }, 'A', most), 'ervenytelen');
assert.equal(kerIgazolast(e, 'a', { indoklas: 'Kérem', link: null, riportId: 'r1', verzio: friss(e).verzio }, 'A', most), 'ok');
assert.equal(friss(e).kertSzakasz, 'egyuttmukodes');
assert.equal(friss(e).szakasz, 'kapcsolat');
assert.equal(friss(e).igazolas, 'igazolasra_var');
assert.equal(friss(e).torolheto, false);
assert.equal(updateEredmeny(e, 'a', er({ partner: 'Másik' }), friss(e).verzio, most), 'ervenytelen');
assert.equal(updateEredmeny(e, 'a', er({ leiras: 'Új leírás' }), friss(e).verzio, most), 'ok');
assert.equal(listIgazolasraVar().length, 1);
assert.equal(countTevekenysegTeendo({ userId: 'x', role: 'admin' }), 1);

// Két admin (Review Focus 1), visszaküldés, újabb kérés, igazolás
const regi = friss(e).verzio;
assert.equal(visszakuld(e, { megjegyzes: 'Hiányos', verzio: regi }, 'Admin', most), 'ok');
assert.equal(igazol(e, 'Admin2', regi, most), 'elavult');
assert.equal(friss(e).esemenyek.filter((x) => x.tipus === 'igazolas').length, 0);
assert.equal(friss(e).szakasz, 'kapcsolat');
assert.equal(friss(e).igazolas, 'visszakuldott');
assert.equal(countTevekenysegTeendo({ userId: 'a', role: 'attase' }), 1);
assert.equal(kerIgazolast(e, 'a', { indoklas: 'Újra', link: null, riportId: null, verzio: friss(e).verzio }, 'A', most), 'ok');
assert.equal(igazol(e, 'Admin', friss(e).verzio, most), 'ok');
assert.equal(friss(e).szakasz, 'egyuttmukodes');
assert.equal(friss(e).igazolas, 'igazolt');
const igE = friss(e).esemenyek.find((x) => x.tipus === 'igazolas')!;
assert.equal(igE.visszavonva, false);

// Visszavonás
assert.equal(visszavon(e, { megjegyzes: 'Téves', verzio: friss(e).verzio }, 'Admin', most), 'ok');
assert.equal(friss(e).szakasz, 'kapcsolat');
assert.equal(friss(e).esemenyek.find((x) => x.tipus === 'igazolas')!.visszavonva, true);

// Beszámítás lezárult kérésfélév után (Review Focus 3)
const e2 = createEredmeny('a', er({ kezdoSzakasz: 'kapcsolat' }), 'A', new Date('2026-05-01T10:00:00Z')).id!;
assert.equal(kerIgazolast(e2, 'a', { indoklas: 'Kérem', link: null, riportId: null, verzio: friss(e2).verzio }, 'A', new Date('2026-06-20T10:00:00Z')), 'ok');
assert.equal(igazol(e2, 'Admin', friss(e2).verzio, most), 'ok');
const be = db.select().from(eredmenyEsemeny).where(and(eq(eredmenyEsemeny.eredmenyId, e2), eq(eredmenyEsemeny.tipus, 'igazolas'))).get()!;
assert.deepEqual([be.beszamitasiEv, be.beszamitasiFelev], [2026, 2]);

// Befejezett ügy, megszakítás, törlés
assert.equal(kerIgazolast(e2, 'a', { indoklas: 'Megállapodás', link: null, riportId: null, verzio: friss(e2).verzio }, 'A', most), 'ok');
assert.equal(igazol(e2, 'Admin', friss(e2).verzio, most), 'ok');
assert.equal(megszakit(e2, 'a', { megjegyzes: 'Vége', verzio: friss(e2).verzio }, 'A', most), 'ervenytelen');
const e3 = createEredmeny('a', er(), 'A', most).id!;
assert.equal(megszakit(e3, 'a', { megjegyzes: 'Elakadt', verzio: friss(e3).verzio }, 'A', most), 'ok');
assert.equal(friss(e3).allapot, 'megszakadt');
assert.equal(ujraindit(e3, 'a', 'A', friss(e3).verzio, most), 'ok');
assert.equal(deleteEredmeny(e3, 'a'), 'ok');
assert.equal(deleteEredmeny(e2, 'a'), 'ervenytelen');
console.log('OK');
```

- [ ] **Step 4: Futtasd, és ellenőrizd, hogy elbukik**

Run: hozd létre az `$ERT_DB`-t, majd `DATABASE_URL="$ERT_DB" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_ert2-tevekenyseg.ts`
Expected: FAIL, nem található a `db/queries/tevekenyseg` modul.

- [ ] **Step 5: Valósítsd meg a lekérdezéseket és a félévjelzőt**

- Az `ujIdoszak` a `bovitettAdatok` értékét a `bovitettAdatokFelev(f)` alapján állítja. A meglévő sorok alapértéke hamis marad.
- Az írások ellenőrzik a tulajdonost, a verziót, az állapotgép engedélyét (`attaseMuveletek`, `adminMuveletek`), és a hivatkozott jelentés és eredmény tulajdonosát. Az attasé országait az `attase_orszag` tábla adja.
- A verzió az `updated_at` ezredmásodpercben, mentésenként szigorúan nő.
- Az `updateEredmeny` zárolt ügynél `ervenytelen`-t ad, ha a leíráson kívül bármely mező változna. A kezdő szakasz létrehozás után nem módosítható.
- Az `igazol` a `beszamitasiFelev`-et a kérés napjából, az igazolás napjából és abból számolja, hogy a kérés félévének `lezarvaAt` értéke ki van-e töltve. Az eredményt az `igazolas` eseményen tárolja.
- A `lehetoseg` és `kapcsolat` esemény beszámítási féléve a saját dátuma.
- A `visszavon` a legutóbbi nem visszavont `igazolas` eseményt `visszavonva` értékre állítja, és a szakaszt eggyel visszalépteti.
- A `megszakit` a függő kérést törli (`kertSzakasz: null`), az igazolás állapotát a maradó szakasz alapján állítja.
- A `torolheto` hamis, ha van függő kérés, a szakasz `egyuttmukodes` vagy `megallapodas`, vagy bármely eseménye már lezárt félévbe esik.
- A `countTevekenysegTeendo` adminnál a függő kérések, attasénál a saját `visszakuldott` ügyek, kifogásolt ügyek és kifogásolt tevékenységek száma.
- A `TevekenysegSor.zarolt` igaz, ha a tevékenység dátumának félévét már lezárták.
- Az attasé neve és városa élő `user` és `attase_orszag` adat.

- [ ] **Step 6: Futtasd a tesztet friss adatbázison**

Run: hozd létre újra az `$ERT_DB`-t, majd `DATABASE_URL="$ERT_DB" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_ert2-tevekenyseg.ts`
Expected: `OK`

- [ ] **Step 7: Ellenőrizz és commitolj**

Run: `npx tsc --noEmit`, `git status --short data/tet.db` (üres), majd `rm scripts/_ert2-tevekenyseg.ts`.

```bash
git add db/schema db/queries/tevekenyseg.ts db/queries/ertekeles.ts lib/ertekeles-idoszak.ts drizzle
git commit -m "feat(tevekenyseg): séma, migráció és ügy-életciklus"
```

---

### Task 3: Mutatók és a pillanatkép bővítése

**Files:**
- Modify: `lib/ertekeles-mutatok.ts`, `lib/ertekeles-megjelenites.ts`, `db/queries/tevekenyseg.ts`, `db/queries/ertekeles.ts`, `app/(app)/monitoring/page.tsx`, `app/(app)/monitoring/[attaseId]/page.tsx`, `app/(app)/monitoring/components/BizonyitekLista.tsx`, `app/(app)/monitoring/components/SzempontSorok.tsx`, `app/(app)/monitoring/components/SzempontPanel.tsx`, `app/(app)/monitoring/components/Munkalap.tsx`, `app/(app)/monitoring/components/AllapotSav.tsx`
- Test: `scripts/_ert2-mutatok.ts`

**Interfaces:**
- Consumes: Task 2 exportjai
- Produces, `lib/ertekeles-mutatok.ts`:

```ts
export interface TevekenysegBemenet { id: string; tipus: TevekenysegTipus; datum: string; megnevezes: string; partner: string; magyarSzereplo: string | null; kifogasolt: boolean }
export interface EredmenyEsemenyBemenet { tipus: EsemenyTipus; szakasz: Szakasz | null; nap: string; beszamitasi: Felev | null; visszavonva: boolean }
export interface EredmenyBemenet extends UgyAdat { id: string; megnevezes: string; hozzajarulas: Hozzajarulas; kifogasolt: boolean; esemenyek: EredmenyEsemenyBemenet[] }
export interface BovitettBemenet { tevekenysegek: TevekenysegBemenet[]; eredmenyek: EredmenyBemenet[] }
export interface TevekenysegBizonyitek { id: string; tipus: TevekenysegTipus; megnevezes: string; datum: string; partner: string; kifogasolt: boolean }
export interface EredmenyBizonyitek { id: string; megnevezes: string; szakasz: Szakasz; igazolas: IgazolasAllapot; hozzajarulas: Hozzajarulas }
// MutatoBemenet új mezője: bovitett?: BovitettBemenet
// ErtekelesMutatok: verzio: 1 | 2; kapcsolatepites.tevekenyseg?: {...}; eredmenyek?: {...} a spec 5.5. pontja szerint
```

- Produces, `db/queries/tevekenyseg.ts`: `bovitettForrasok(attaseIdk: readonly string[], f: Felev): Map<string, BovitettBemenet>`, `countFuggoKeresek(f: Felev): number`
- Produces, `db/queries/ertekeles.ts`: `HalozatNezet.fuggoKeresDb: number`, `AdatlapNezet.letezoEredmenyek: string[]`
- Produces, `lib/ertekeles-megjelenites.ts`: `NINCS_TEVEKENYSEGI_ADAT = 'Ehhez a félévhez nincs tevékenységi adat.'`, `tevekenysegReszlet(t: TevekenysegBizonyitek): string`, `eredmenyReszlet(e: EredmenyBizonyitek): string`

- [ ] **Step 1: Írd meg a tesztet (`scripts/_ert2-mutatok.ts`)**

```ts
import assert from 'node:assert/strict';
import { kulcsMutato, mutatoKartyak, NINCS_TEVEKENYSEGI_ADAT, tevekenysegReszlet } from '../lib/ertekeles-megjelenites';
import { szamolMutatok, type BovitettBemenet, type EredmenyBemenet, type MutatoBemenet } from '../lib/ertekeles-mutatok';

const f = { ev: 2027, felev: 1 } as const;
const alap: MutatoBemenet = { felev: f, most: new Date('2027-07-05T10:00:00Z'), jelentesek: [], elozoFelevJelentesDb: 0, tickets: [], vezetettOrszagok: [], profilok: [], halozat: { szunetMedian: null, valaszMedian: null } };
const t = (id: string, tipus: 'delegacio' | 'b2b' | 'partnerkozvetites', datum: string, magyarSzereplo: string | null, kifogasolt = false) => ({ id, tipus, datum, megnevezes: id, partner: 'P', magyarSzereplo, kifogasolt });
const e = (id: string, r: Partial<EredmenyBemenet>): EredmenyBemenet => ({ id, megnevezes: id, hozzajarulas: 'kozvetlen', kifogasolt: false, szakasz: 'lehetoseg', kertSzakasz: null, igazolas: 'nem_igenyel', allapot: 'aktiv', esemenyek: [], ...r });
const ev = (tipus: EredmenyBemenet['esemenyek'][number]['tipus'], szakasz: EredmenyBemenet['szakasz'] | null, nap: string, beszamitasi: typeof f | null = null, visszavonva = false) => ({ tipus, szakasz, nap, beszamitasi, visszavonva });
const bovitett: BovitettBemenet = {
  tevekenysegek: [
    t('t1', 'delegacio', '2027-02-01', 'BME'), t('t2', 'b2b', '2027-03-01', 'bme '), t('t3', 'partnerkozvetites', '2027-04-01', 'ELTE'),
    t('t4', 'b2b', '2027-05-01', null, true), t('t5', 'delegacio', '2026-12-20', 'SZTE'),
  ],
  eredmenyek: [
    e('e1', { szakasz: 'egyuttmukodes', igazolas: 'igazolt', esemenyek: [ev('letrehozas', 'lehetoseg', '2027-01-10'), ev('szakaszvaltas', 'kapcsolat', '2027-02-01'), ev('igazolas', 'egyuttmukodes', '2027-03-01', f)] }),
    e('e2', { szakasz: 'kapcsolat', kifogasolt: true, esemenyek: [ev('letrehozas', 'kapcsolat', '2027-01-15')] }),
    e('e3', { szakasz: 'egyuttmukodes', igazolas: 'visszakuldott', esemenyek: [ev('igazolas', 'megallapodas', '2027-02-02', f, true)] }),
    e('e4', { szakasz: 'megallapodas', igazolas: 'igazolt', esemenyek: [ev('igazolas', 'megallapodas', '2027-03-03', f)] }),
    e('e5', { szakasz: 'kapcsolat', kertSzakasz: 'egyuttmukodes', igazolas: 'igazolasra_var', esemenyek: [ev('igazolas_keres', 'egyuttmukodes', '2027-06-20')] }),
    e('e6', { szakasz: 'egyuttmukodes', kertSzakasz: 'megallapodas', igazolas: 'igazolasra_var', esemenyek: [ev('igazolas_keres', 'megallapodas', '2027-07-02')] }),
    e('e7', { allapot: 'megszakadt', esemenyek: [ev('megszakitas', null, '2027-04-04')] }),
  ],
};
const m = szamolMutatok({ ...alap, bovitett });
assert.equal(m.verzio, 2);
const k = m.kapcsolatepites.tevekenyseg!;
assert.deepEqual([k.delegacioDb, k.b2bDb, k.partnerkozvetitesDb, k.magyarSzereploDb, k.kifogasoltDb], [1, 1, 1, 2, 1]);
assert.deepEqual(k.tevekenysegek.map((x) => x.id), ['t4', 't3', 't2', 't1']);
const r = m.eredmenyek!;
assert.deepEqual([r.lehetosegDb, r.kapcsolatDb, r.egyuttmukodesDb, r.megallapodasDb], [1, 1, 1, 1]);
assert.equal(r.igazolasraVarDb, 1);
assert.equal(r.aktivUgyDb, 5);
assert.equal(r.megszakadtDb, 1);
assert.deepEqual(r.ugyek.map((x) => x.id).sort(), ['e1', 'e4', 'e5', 'e7']);

// Bővített adat nélküli félév (Review Focus 4)
const regi = szamolMutatok(alap);
assert.equal(regi.verzio, 1);
assert.equal(regi.kapcsolatepites.tevekenyseg, undefined);
assert.equal(regi.eredmenyek, undefined);
assert.deepEqual(mutatoKartyak('eredmenyek', regi), []);
assert.equal(kulcsMutato('eredmenyek', regi), 'Nincs tevékenységi adat');
assert.equal(NINCS_TEVEKENYSEGI_ADAT, 'Ehhez a félévhez nincs tevékenységi adat.');
assert.equal(mutatoKartyak('kapcsolatepites', regi).length, 3);

assert.deepEqual(mutatoKartyak('eredmenyek', m)[0], { cimke: 'Lehetőség', ertek: '1 db', megjegyzes: 'a félévben elért' });
assert.deepEqual(mutatoKartyak('kapcsolatepites', m)[0], { cimke: 'Delegáció', ertek: '1 db', megjegyzes: 'a félévben' });
assert.equal(mutatoKartyak('kapcsolatepites', m).length, 8);
assert.equal(mutatoKartyak('eredmenyek', m).length, 7);
assert.equal(kulcsMutato('eredmenyek', m), '1 együttműködés, 1 megállapodás');
assert.equal(kulcsMutato('kapcsolatepites', m), '1 delegáció, 1 B2B-találkozó, 1 partnerközvetítés');
assert.equal(tevekenysegReszlet(k.tevekenysegek[0]), 'B2B-találkozó · 2027. 05. 01. · P · kifogásolt');
console.log('OK');
```

- [ ] **Step 2: Futtasd, és ellenőrizd, hogy elbukik**

Run: `npx tsx scripts/_ert2-mutatok.ts`
Expected: FAIL, a `verzio` vagy a hiányzó export miatt.

- [ ] **Step 3: Valósítsd meg a mutatókat és a megjelenítést**

- A `verzio` `2`, ha van `bovitett` bemenet, különben `1`.
- A tevékenységek a félév napjai közé eső dátumúak, a bizonyítéklista dátum szerint csökkenő, a kifogásoltakat is tartalmazza.
- A `magyarSzereploDb` a nem kifogásolt tevékenységek kitöltött értékeit trimmelve és kisbetűsítve számolja.
- Kifogásolt ügy `letrehozas` és `szakaszvaltas` eseménye nem számít.
- `egyuttmukodesDb` és `megallapodasDb`: nem visszavont `igazolas` események, amelyek `beszamitasi` féléve a mért félév.
- `igazolasraVarDb`: függő kérés, amelynek utolsó `igazolas_keres` napja legkésőbb a félév utolsó napja.
- `aktivUgyDb`: `allapot === 'aktiv'` és nem `befejezettE`.
- Az `ugyek` azokat az ügyeket sorolja, amelyeknek van a félévben számító eseménye, függő kérése vagy megszakítása.
- A kártyák sorrendje: Kapcsolatépítésnél Delegáció, B2B-találkozó, Partnerközvetítés, Érintett magyar szereplő, Kifogásolt, majd a három meglévő jelentésalapú kártya. Eredményeknél Lehetőség, Kapcsolat, Együttműködés, Megállapodás, Igazolásra vár, Aktív ügy, Megszakadt.

- [ ] **Step 4: Futtasd a tesztet**

Run: `npx tsx scripts/_ert2-mutatok.ts`
Expected: `OK`

- [ ] **Step 5: Kösd be a lekérdezést és a felületet**

- A `mutatoSzamolo` új paramétere `bovitett: boolean`. Igaz esetén a `bovitettForrasok` adja a bemenetet, a törölt felhasználókra üres bemenettel.
- A hívók az `idoszak.bovitettAdatok` értékét adják át.
- A `letezoBizonyitekok` a pillanatkép `eredmenyek.ugyek` azonosítói közül a még létezőket is visszaadja `letezoEredmenyek` néven.
- A `BizonyitekLista` új propja `letezoEredmenyek`. Kapcsolatépítésnél a tevékenységek a jelentések előtt állnak, link nélkül. Eredményeknél az ügy a `/tevekenysegek/eredmeny/[id]` oldalra mutat, törölt ügynél szöveg marad. Mindkét szemponthoz a bővített adat hiányakor a `NINCS_TEVEKENYSEGI_ADAT` szöveg áll.
- A `Meres` üres állapota Eredményeknél a `NINCS_TEVEKENYSEGI_ADAT`. Az `EREDMENYEK_URES` konstans kikerül.
- A `countFuggoKeresek(f)` az `igazolasraVarDb` szabályát követi: a jelenleg függő kérések közül azokat számolja, amelyeket legkésőbb a félév utolsó napján adtak be.
- Az `AllapotSav` `fuggoKeresDb > 0` esetén kiírja: „Ehhez a félévhez <N> igazolásra váró kérés tartozik.” A lezárást ez nem tiltja.

- [ ] **Step 6: Ellenőrizd az integrációt eldobható adatbázison**

Run: `npx tsc --noEmit`, majd eldobható `scripts/_ert2-pillanatkep.ts`, friss `$ERT_DB`-n. A script egy `bovitett_adatok = 1` és egy `0` félévet zár le ugyanazzal az attaséval, és ellenőrzi:

```ts
assert.equal(getAdatlap('a', uj, most)!.mutatok!.verzio, 2);
assert.ok(getAdatlap('a', uj, most)!.mutatok!.eredmenyek);
assert.equal(getAdatlap('a', regi, most)!.mutatok!.verzio, 1);
assert.equal(getAdatlap('a', regi, most)!.mutatok!.eredmenyek, undefined);
// Lezárás után új igazolás: a rögzített pillanatkép változatlan (Review Focus 3)
const elotte = JSON.stringify(getAdatlap('a', uj, most)!.mutatok);
igazol(fuggoUgyId, 'Admin', getEredmeny(fuggoUgyId)!.verzio, kesobb);
assert.equal(JSON.stringify(getAdatlap('a', uj, kesobb)!.mutatok), elotte);
assert.equal(listHalozat(nyitott).fuggoKeresDb, 1);
```

Expected: `OK`.

- [ ] **Step 7: Commitolj**

Run: `rm scripts/_ert2-mutatok.ts scripts/_ert2-pillanatkep.ts`, `git status --short data/tet.db` (üres).

```bash
git add lib/ertekeles-mutatok.ts lib/ertekeles-megjelenites.ts db/queries app/\(app\)/monitoring
git commit -m "feat(monitoring): tevékenységi és eredménymutatók a félévi pillanatképben"
```

---

### Task 4: Tesztadatok az A blokkhoz

**Files:**
- Modify: `scripts/demo-ertekeles.ts`

**Interfaces:**
- Consumes: Task 2 író függvényei, `ertekelesiIdoszak.bovitettAdatok`

| Kapcsolatépítés fokozata | Tevékenység félévente |
| --- | --- |
| 4 | 10 |
| 3 | 7 |
| 2 | 4 |
| 1 | 2 |
| 0 | 0 |

| Eredmények fokozata | Félévben elért eredmények |
| --- | --- |
| 4 | 1 megállapodás és 1 együttműködés igazolva |
| 3 | 1 együttműködés igazolva és 1 kapcsolat |
| 2 | 1 kapcsolat és 2 lehetőség |
| 1 | 1 lehetőség |
| 0 | Nincs |

A tevékenységtípusok aránya: B2B 50%, partnerközvetítés 30%, delegáció 20%.

- [ ] **Step 1: Bővítsd a scriptet**

- A 2025/1, 2025/2, 2026/1 és 2026/2 félév `bovitett_adatok` jelzője igaz, a 2024/2 félévé hamis marad.
- A tevékenységek közvetlen inserttel készülnek, félévenként attasénként legalább egy jelentésből indul, ha van `rendezveny` vagy `egyuttmukodes` kategóriájú jelentése.
- Az eredmények a `createEredmeny`, `kapcsolatbaLep`, `kerIgazolast`, `igazol` függvényekkel készülnek, történelmi `most` értékekkel, a lezárás előtt.
- A nyitott 2026/2 félévben a tesztadat tartalmazzon legalább 3 függő kérést, 2 visszaküldött kérést, 2 kifogásolt tevékenységet, 1 kifogásolt ügyet, 2 megszakadt ügyet és 1 visszavont igazolást.
- Az `uj` mintázatú attasé csak 2026/1-től kap adatot, a kihagyott félévben a kihagyott attasé nem kap adatot.

- [ ] **Step 2: Bővítsd az önellenőrzést**

Az önellenőrzés hibával áll le, ha: a 2024/2 pillanatképei nem `verzio: 1`; a 2025/1 és későbbi lezárt félévek nem `verzio: 2`; a lezárt félévekben a fokozatonkénti tevékenységszám eltér a táblázattól; a 4-es Eredmények fokozatnál nincs `megallapodasDb >= 1`, a 3-asnál nincs `egyuttmukodesDb >= 1`, a 2-esnél és 1-esnél van igazolt szakasz; a felsorolt speciális állapotok bármelyike hiányzik.

- [ ] **Step 3: Futtasd és ellenőrizd**

Run:
```bash
NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-ertekeles.ts
sqlite3 -readonly data/tet-ertekeles-teszt.db "select count(*) from tevekenyseg; select igazolas, count(*) from eredmeny group by 1 order by 1; select count(*) from ertekelesi_idoszak where bovitett_adatok = 1;"
git status --short data/tet.db
```
Expected: a script utolsó sora `Kész: data/tet-ertekeles-teszt.db`, a tevékenységek száma nagyobb nullánál, mind a négy igazolási állapot szerepel, a jelzős félévek száma `4`, a `git status` üres.

- [ ] **Step 4: Commitolj**

Run: `npx tsc --noEmit`

```bash
git add scripts/demo-ertekeles.ts
git commit -m "feat(tevekenyseg): tesztadatok tevékenységekkel és eredményekkel"
```

---

### Task 5: Az attasé felülete

**Files:**
- Create: `lib/tevekenyseg-szuro.ts`, `app/(app)/tevekenysegek/page.tsx`, `app/(app)/tevekenysegek/actions.ts`, `app/(app)/tevekenysegek/eredmeny/[id]/page.tsx`, és az `app/(app)/tevekenysegek/components/` alatt: `AttaseNezet.tsx`, `EredmenyTabla.tsx`, `EredmenyKartya.tsx`, `TevekenysegTabla.tsx`, `TevekenysegDialog.tsx`, `EredmenyDialog.tsx`, `IgazolasKeresDialog.tsx`, `MegjegyzesDialog.tsx`, `UgyMuveletek.tsx`, `SzakaszLanc.tsx`, `IgazolasJelveny.tsx`, `EsemenyIdovonal.tsx`, `EredmenyAdatlap.tsx`
- Modify: `lib/navigacio.ts`, `app/(app)/layout.tsx`, `components/app-shell/AppShell.tsx`, `components/app-shell/Oldalsav.tsx`, `app/(app)/jelentesek/[id]/page.tsx`, `app/(app)/jelentesek/components/RiportReszlet.tsx`
- Test: `scripts/_ert2-szuro.ts`

**Interfaces:**
- Consumes: Task 1–2 exportjai, `MuveletDialog`, `useMuveletForm`, `useNyitas`, `NativeSelect`, `Mezo`
- Produces, `lib/tevekenyseg-szuro.ts`:

```ts
export type TevekenysegFul = 'eredmenyek' | 'tevekenysegek' | 'igazolas';
export interface TevekenysegOldalSzuro { ful: TevekenysegFul | null; felev: FelevSzam | null; megszakadt: boolean; attase?: string; regio?: RegioKulcs; orszag?: string; szakasz?: Szakasz; uj?: 'tevekenyseg'; riport?: string }
export function tevekenysegSzuroFromSearchParams(sp: SearchParams): TevekenysegOldalSzuro;
export function tevekenysegUrl(s: Partial<TevekenysegOldalSzuro>): string;
```

- Produces, `lib/navigacio.ts`: `Menupont.szamlalo?: MenuSzamlalo`, `type MenuSzamlalo = 'tevekenyseg' | 'munkaterv'`
- Produces, `AppShell`, `Oldalsav`: új prop `menuSzamlalok: Partial<Record<MenuSzamlalo, number>>`
- Produces, `actions.ts`:

```ts
export async function mentTevekenysegAction(id: string | null, prev: MuveletState, fd: FormData): Promise<MuveletState>;
export async function torolTevekenysegAction(id: string): Promise<MuveletState>;
export async function mentEredmenyAction(id: string | null, prev: MuveletState, fd: FormData): Promise<MuveletState>;
export async function torolEredmenyAction(id: string): Promise<MuveletState>;
export async function kapcsolatbaLepAction(id: string, verzio: number): Promise<MuveletState>;
export async function kerIgazolastAction(id: string, prev: MuveletState, fd: FormData): Promise<MuveletState>;
export async function megszakitAction(id: string, prev: MuveletState, fd: FormData): Promise<MuveletState>;
export async function ujrainditAction(id: string, verzio: number): Promise<MuveletState>;
```

- [ ] **Step 1: Írd meg a szűrő tesztjét (`scripts/_ert2-szuro.ts`)**

```ts
import assert from 'node:assert/strict';
import { tevekenysegSzuroFromSearchParams as p, tevekenysegUrl as u } from '../lib/tevekenyseg-szuro';
assert.deepEqual(p({}), { ful: null, felev: null, megszakadt: false });
assert.deepEqual(p({ ful: 'x', felev: '3', megszakadt: '0', regio: 'x', orszag: 'xx', szakasz: 'x', uj: 'x' }), { ful: null, felev: null, megszakadt: false });
assert.deepEqual(p({ ful: 'tevekenysegek', felev: '2', megszakadt: '1', regio: 'europa', orszag: 'ES', szakasz: 'kapcsolat', attase: 'a', uj: 'tevekenyseg', riport: 'r1' }),
  { ful: 'tevekenysegek', felev: 2, megszakadt: true, regio: 'europa', orszag: 'ES', szakasz: 'kapcsolat', attase: 'a', uj: 'tevekenyseg', riport: 'r1' });
assert.equal(u({ ful: 'tevekenysegek', felev: 1 }), '/tevekenysegek?ful=tevekenysegek&felev=1');
assert.equal(u({}), '/tevekenysegek');
console.log('OK');
```

- [ ] **Step 2: Futtasd, és ellenőrizd, hogy elbukik**

Run: `npx tsx scripts/_ert2-szuro.ts`
Expected: FAIL, nem található a modul.

- [ ] **Step 3: Valósítsd meg a szűrőt, és futtasd a tesztet**

Run: `npx tsx scripts/_ert2-szuro.ts`
Expected: `OK`

- [ ] **Step 4: Bővítsd a navigációt és a menüszámlálót**

- `UTVONALAK` új sora a `/kommunikacio` után: `href: '/tevekenysegek'`, `cim` és `felirat`: „Tevékenységek és eredmények”, `alcim`: „Delegációk, találkozók, partnerközvetítések és az elért eredmények”, `ikon: '◇'`, `szamlalo: 'tevekenyseg'`.
- A layout a `countTevekenysegTeendo(session)` értékét adja át. Az oldalsáv a meglévő buborékot használja, a felolvasónak: `<N> teendő`.

- [ ] **Step 5: Írd meg az oldalakat és a komponenseket a spec 5.6. pontja szerint**

- Az attasé alapértelmezett füle `eredmenyek`, az `igazolas` fül nála erre esik vissza. A `page.tsx` adminnál ebben a feladatban ideiglenes „Hamarosan” kártyát mutat, a 6. feladat cseréli.
- Az `EredmenyTabla` négy oszlopot rajzol. A kártya az `oszlopSzakasz` szerinti oszlopba kerül. A Megállapodás oszlopban a még nem igazolt kérések és a fejlécben választott évbe számított megállapodások látszanak (`megallapodasEv`).
- A megszakadt ügyek a `?megszakadt=1` szűrővel, külön listában látszanak.
- A kártya linkje az adatlapra visz. Húzás nincs.
- Az `EredmenyAdatlap` mutatja a `SzakaszLanc`-ot, az adatokat, az `UgyMuveletek`-et, a kapcsolódó tevékenységeket és az `EsemenyIdovonal`-at. Zárolt ügynél a szerkesztő párbeszédablak a zárolt mezőket letiltva mutatja, és indokot ír ki.
- A `TevekenysegTabla` a fejléc évére és a `felev` szűrőre szűr. Zárolt sornál a módosítás és törlés helyett „A félév lezárult” felirat áll.
- A `?uj=tevekenyseg&riport=<id>` az új tevékenység párbeszédablakát nyitja a `getRiportElotoltes` adataival. Idegen vagy nem létező jelentésnél üres űrlap nyílik.
- A linket csak a `KulsoLink` mintája szerint, `http(s)` címmel jelenítsd meg, `noopener noreferrer`-rel.
- A `RiportReszlet` szerzőnek, `rendezveny` vagy `egyuttmukodes` kategóriánál „Tevékenység rögzítése” linket mutat, és ha már készült belőle tevékenység: „Már rögzítve: <N> tevékenység”.
- Az action-ök űrlaphibái: `elavult` → „Ezt a bejegyzést közben módosították. Töltsd újra az oldalt.”, `lezart_felev` → „A félév már lezárult, ide nem rögzíthető tevékenység.”, `ervenytelen` → „Ez a művelet most nem végezhető el.”, `nincs` → „A bejegyzés nem található.”
- Admin a rögzítő action-öket nem hívhatja (`canRogzit`), az adatlap más attasé ügyére 404-et ad.

- [ ] **Step 6: Ellenőrizd böngészőben a QA-környezetben, attaséként**

| Lépés | Elvárt eredmény |
| --- | --- |
| Menü | A „Tevékenységek és eredmények” látszik, a számláló a teendőket mutatja |
| Eredmények fül | Négy oszlop, a függő kérés a kért oszlopban, „Igazolásra vár” jelzéssel |
| Új tevékenység jövőbeli dátummal | Hibaüzenet a dátumnál, a beírt adatok megmaradnak |
| Lezárt félévre tevékenység | Űrlaphiba, nem jön létre bejegyzés |
| Új eredmény, majd Kapcsolat, majd igazolás kérése | A kártya a kért oszlopba kerül, az előzmények bővülnek |
| Visszaküldött ügy | Az előző oszlopban áll, a megjegyzés látszik |
| Igazolt ügy szerkesztése | A zárolt mezők nem módosíthatók, a leírás igen |
| Megszakítás és újraindítás | A kártya eltűnik a tábláról, a szűrőben megjelenik, majd visszakerül |
| Jelentésből indítás | Az űrlap előre kitöltve nyílik, mentés után a jelentés kiírja a darabszámot |
| Más attasé ügyének URL-je | 404 |
| `/monitoring` | 404 |
| Billentyűzettel teljes szakaszváltás | Minden művelet elérhető, a fókusz látszik |
| 1024 px és keskeny ablak | Az oszlopok egymás alá rendeződnek, a saját tartalom nem lóg ki |

- [ ] **Step 7: Commitolj**

Run: `npx tsc --noEmit`, `rm scripts/_ert2-szuro.ts`, a QA után generáld újra a tesztadatbázist.

```bash
git add lib/tevekenyseg-szuro.ts lib/navigacio.ts app/\(app\)/tevekenysegek app/\(app\)/layout.tsx app/\(app\)/jelentesek components/app-shell
git commit -m "feat(tevekenyseg): az attasék tevékenység- és eredményfelülete"
```

---

### Task 6: Az admin felülete

**Files:**
- Create, az `app/(app)/tevekenysegek/components/` alatt: `AdminNezet.tsx`, `IgazolasiSor.tsx`, `AdminEredmenyLista.tsx`, `AdminTevekenysegLista.tsx`, `AdminSzurok.tsx`
- Modify: `app/(app)/tevekenysegek/page.tsx`, `app/(app)/tevekenysegek/actions.ts`, `app/(app)/tevekenysegek/components/UgyMuveletek.tsx`, `app/(app)/tevekenysegek/components/EredmenyAdatlap.tsx`

**Interfaces:**
- Consumes: Task 2 és Task 5 exportjai
- Produces, `actions.ts`:

```ts
export async function igazolAction(id: string, verzio: number): Promise<MuveletState>;
export async function visszakuldAction(id: string, prev: MuveletState, fd: FormData): Promise<MuveletState>;
export async function visszavonAction(id: string, prev: MuveletState, fd: FormData): Promise<MuveletState>;
export async function kifogasolTevekenysegAction(id: string, prev: MuveletState, fd: FormData): Promise<MuveletState>;
export async function visszavonTevekenysegKifogasAction(id: string): Promise<MuveletState>;
export async function kifogasolEredmenyAction(id: string, prev: MuveletState, fd: FormData): Promise<MuveletState>;
export async function visszavonEredmenyKifogasAction(id: string, verzio: number): Promise<MuveletState>;
```

- [ ] **Step 1: Írd meg az action-öket**

Minden action `requireAdmin()`-nal indul. Az elavult verzió üzenete: „Ezt a kérést közben más már elbírálta. Töltsd újra az oldalt.”

- [ ] **Step 2: Írd meg az admin nézetet a spec 5.6. pontja szerint**

- Admin alapértelmezett füle `igazolas`. A kérések a legrégebbitől kezdve állnak.
- A kérés soron látszik az ügy, az attasé, az állomáshely, a hozzájárulás, a kért szakaszváltás, az indoklás, a link, a kapcsolódó jelentés, a tevékenységszám, és az adatlap linkje.
- Az „Igazolás” megerősítés nélkül fut, a „Visszaküldés” kötelező megjegyzést kér a `MegjegyzesDialog`-ban.
- Az Eredmények és Tevékenységek fülön az `AdminSzurok` attasé, régió, ország és (eredményeknél) szakasz szerint szűr. Az év és a félév a tevékenységeknél az attaséi nézettel azonos.
- A kifogásolás a sorban és az adatlapon is elérhető, csak a `adminMuveletek` szerint engedélyezett műveletek látszanak.
- Admin az eredmény adatlapján minden ügyet megnyithat, attaséi művelet nem jelenik meg neki.

- [ ] **Step 3: Ellenőrizd böngészőben a QA-környezetben, adminként**

| Lépés | Elvárt eredmény |
| --- | --- |
| Menü | A számláló a függő kérések számát mutatja |
| Igazolásra vár fül | A kérések a legrégebbitől kezdve, indoklással és bizonyítékkal |
| Igazolás | A sor eltűnik, a számláló csökken, az ügy kért szakasza érvényes lesz |
| Visszaküldés megjegyzés nélkül | Hibaüzenet, a kérés megmarad |
| Két lapon ugyanaz a kérés, mindkettő dönt | A második az elavult hibát kapja, egy esemény keletkezik |
| Igazolás visszavonása | Az ügy visszalép, az esemény visszavontként látszik |
| Tevékenység kifogásolása | Az attasénál megjelenik a megjegyzés és a számláló |
| Szűrés régióra, országra, attaséra | A sorok a szűrőnek megfelelnek |
| Monitoring adatlap, 2026/1 | Új mutatók és bizonyítékok, az ügy linkje működik |
| Monitoring adatlap, 2024/2 | „Ehhez a félévhez nincs tevékenységi adat.” |
| Monitoring, 2026/2 állapotsáv | Figyelmeztetés a függő kérésekről, a lezárás ettől nem tiltott |
| Monitoring munkalap, 2026/2 | Élő tevékenységi mutatók hiba nélkül |

- [ ] **Step 4: Commitolj**

Run: `npx tsc --noEmit`, a QA után generáld újra a tesztadatbázist.

```bash
git add app/\(app\)/tevekenysegek
git commit -m "feat(tevekenyseg): igazolási sor és admin áttekintés"
```

---

## B blokk: éves munkaterv

### Task 7: Munkaterv-szabályok, séma és lekérdezések

**Files:**
- Create: `lib/munkaterv-szotar.ts`, `lib/munkaterv-validacio.ts`, `lib/munkaterv-jog.ts`, `db/schema/munkaterv.ts`, `drizzle/0016_munkaterv.sql` (generált), `db/queries/munkaterv.ts`
- Modify: `db/schema/index.ts`
- Test: `scripts/_ert2-munkaterv.ts`

**Interfaces:**
- Consumes: `SzempontKulcs`, `isSzempontKulcs`, `RegioKulcs`, `orszagRegio`, `ORSZAG_REGIOK`, `listCimzettJeloltek`
- Produces, `lib/munkaterv-szotar.ts`:

```ts
export type CelAllapot = 'folyamatban' | 'teljesult' | 'reszben' | 'elmaradt';
export type TervStatusz = 'piszkozat' | 'jovahagyasra_var' | 'visszakuldott' | 'jovahagyott';
export type Hatokor = 'halozat' | RegioKulcs;
export const CEL_ALLAPOTOK: readonly { kulcs: CelAllapot; cimke: string }[];
export const TERV_STATUSZ_CIMKE: Record<TervStatusz, string>;
export const CEL_MIN = 3; export const CEL_MAX = 5; export const KOZPONTI_MIN = 1; export const KOZPONTI_MAX = 2;
export const MEGNEVEZES_MAX = 200; export const MERCE_MAX = 300; export const MEGJEGYZES_MAX = 2000;
export function isCelAllapot(v: string): v is CelAllapot;
export function isHatokor(v: string): v is Hatokor;
export function tervEvek(aktualisEv: number): [number, number];
export function vonatkozoCelok<T extends { hatokor: Hatokor }>(celok: readonly T[], regio: RegioKulcs | undefined): T[];
export function kozzetetelHibak<T extends { hatokor: Hatokor }>(celok: readonly T[], attasek: readonly { nev: string; regio: RegioKulcs | undefined }[]): { tulSok: string[]; nincsCel: string[] };
export function szerkeszthetoTerv(s: TervStatusz): boolean;
```

- Produces, `lib/munkaterv-validacio.ts`: `CelInput { megnevezes: string; orszagKod: string; szempont: SzempontKulcs; merce: string }`, `KozpontiCelInput { megnevezes: string; szempont: SzempontKulcs; merce: string; hatokor: Hatokor }`, `CelAllapotInput { allapot: CelAllapot; megjegyzes: string | null }`, `parseCelForm(fd: FormData, orszagok: readonly string[]): ParseResult<CelInput>`, `parseKozpontiCelForm(fd: FormData): ParseResult<KozpontiCelInput>`, `parseCelAllapotForm(fd: FormData): ParseResult<CelAllapotInput>`, `parseTervMegjegyzesForm(fd: FormData): ParseResult<{ megjegyzes: string }>`
- Produces, `lib/munkaterv-jog.ts`: `canSzerkesztTerv(session: AppSession, attaseId: string): boolean`, `canJovahagy(session: AppSession): boolean`, `canNezTerv(session: AppSession, attaseId: string): boolean`
- Produces, `db/queries/munkaterv.ts`:

```ts
export type TervEredmeny = 'ok' | 'nincs' | 'elavult' | 'ervenytelen' | 'nincs_kozzeteve' | 'cel_szam' | 'kozzeteve';
export interface KozpontiCelSor extends KozpontiCelInput { id: string; ev: number }
export interface CelSor extends CelInput { id: string; kozpontiCelId: string | null; allapot: CelAllapot; allapotMegjegyzes: string | null; allapotModositottaNev: string | null; sorrend: number }
export interface TervNezet { id: string; attaseId: string; attaseNev: string; ev: number; statusz: TervStatusz; megjegyzes: string | null; modositasiKerelem: string | null; jovahagytaNev: string | null; jovahagyvaAt: Date | null; celok: CelSor[]; verzio: number }
export interface TervAttekintesSor { attaseId: string; nev: string; varos: string | null; statusz: TervStatusz | null; celDb: number; teljesultDb: number; modositasKerve: boolean }
export function getMunkatervEv(ev: number): { kozzeteveAt: Date; kozzetetteNev: string } | null;
export function listKozpontiCelok(ev: number): KozpontiCelSor[];
export function mentKozpontiCel(ev: number, i: KozpontiCelInput, id?: string): { eredmeny: TervEredmeny; nevek?: string[] };
export function torolKozpontiCel(id: string): TervEredmeny;
export function kozzetesz(ev: number, nev: string, most?: Date): { eredmeny: TervEredmeny; tulSok?: string[]; nincsCel?: string[] };
export function getTerv(attaseId: string, ev: number): TervNezet | null;
export function kezdTerv(attaseId: string, ev: number, most?: Date): { eredmeny: TervEredmeny; id?: string };
export function mentCel(tervId: string, attaseId: string, i: CelInput, verzio: number, celId?: string): TervEredmeny;
export function torolCel(tervId: string, attaseId: string, celId: string, verzio: number): TervEredmeny;
export function bekuld(tervId: string, attaseId: string, verzio: number): TervEredmeny;
export function jovahagy(tervId: string, nev: string, verzio: number, most?: Date): TervEredmeny;
export function visszakuldTerv(tervId: string, megjegyzes: string, verzio: number): TervEredmeny;
export function kerModositast(tervId: string, attaseId: string, indoklas: string, verzio: number): TervEredmeny;
export function elutasitModositast(tervId: string, megjegyzes: string, verzio: number): TervEredmeny;
export function visszanyit(tervId: string, megjegyzes: string, verzio: number): TervEredmeny;
export function allitCelAllapot(celId: string, attaseId: string, i: CelAllapotInput, nev: string, most?: Date): TervEredmeny;
export function feluliCelAllapot(celId: string, i: CelAllapotInput, nev: string, most?: Date): TervEredmeny;
export function listTervAttekintes(ev: number): TervAttekintesSor[];
export function countTervTeendo(session: { userId: string; role: 'admin' | 'attase' }): number;
```

- [ ] **Step 1: Írd meg a tesztet (`scripts/_ert2-munkaterv.ts`)**

A script törli az attasékat, létrehozza az `a` (ES, `europa`) és `s` (SG, `azsia`) attasét. A nevük megegyezik az azonosítójukkal.

```ts
const ev = 2027;
const kc = (r: Partial<KozpontiCelInput> = {}): KozpontiCelInput => ({ megnevezes: 'Központi', szempont: 'kapcsolatepites', merce: '1 delegáció', hatokor: 'halozat', ...r });
const cel = (m: string): CelInput => ({ megnevezes: m, orszagKod: 'ES', szempont: 'eredmenyek', merce: 'Mérce' });

assert.deepEqual(tervEvek(2026), [2026, 2027]);
assert.equal(vonatkozoCelok([{ hatokor: 'halozat' }, { hatokor: 'azsia' }], 'europa').length, 1);
assert.deepEqual(kozzetetelHibak([{ hatokor: 'azsia' }], [{ nev: 'A', regio: 'europa' }, { nev: 'S', regio: 'azsia' }]), { tulSok: [], nincsCel: ['A'] });

assert.equal(kezdTerv('a', ev).eredmeny, 'nincs_kozzeteve');
assert.equal(kozzetesz(ev, 'Admin').eredmeny, 'cel_szam');
assert.equal(mentKozpontiCel(ev, kc()).eredmeny, 'ok');
assert.equal(mentKozpontiCel(ev, kc({ megnevezes: 'Második' })).eredmeny, 'ok');
const harmadik = mentKozpontiCel(ev, kc({ megnevezes: 'Harmadik', hatokor: 'azsia' }));
assert.equal(harmadik.eredmeny, 'cel_szam');
assert.deepEqual(harmadik.nevek, ['s']);
const torlendo = listKozpontiCelok(ev)[1].id;
assert.equal(torolKozpontiCel(torlendo), 'ok');
assert.equal(kozzetesz(ev, 'Admin').eredmeny, 'ok');
assert.equal(mentKozpontiCel(ev, kc({ megnevezes: 'Késői' })).eredmeny, 'kozzeteve');
assert.equal(torolKozpontiCel(listKozpontiCelok(ev)[0].id), 'kozzeteve');

const t = kezdTerv('a', ev).id!;
const n = () => getTerv('a', ev)!;
assert.equal(n().celok.length, 1);
assert.notEqual(n().celok[0].kozpontiCelId, null);
assert.equal(bekuld(t, 'a', n().verzio), 'cel_szam');
assert.equal(mentCel(t, 'a', { ...cel('Saját'), orszagKod: 'FR' }, n().verzio), 'ervenytelen');
assert.equal(mentCel(t, 's', cel('Idegen'), n().verzio), 'nincs');
assert.equal(mentCel(t, 'a', cel('Saját 1'), n().verzio), 'ok');
assert.equal(mentCel(t, 'a', cel('Saját 2'), n().verzio), 'ok');
assert.equal(mentCel(t, 'a', { ...cel('Átírt'), orszagKod: 'ES' }, n().verzio, n().celok[0].id), 'ervenytelen');
assert.equal(torolCel(t, 'a', n().celok[0].id, n().verzio), 'ervenytelen');
assert.equal(mentCel(t, 'a', cel('Saját 3'), n().verzio), 'ok');
assert.equal(mentCel(t, 'a', cel('Saját 4'), n().verzio), 'ok');
assert.equal(mentCel(t, 'a', cel('Saját 5'), n().verzio), 'cel_szam');
assert.equal(bekuld(t, 'a', n().verzio), 'ok');
assert.equal(n().statusz, 'jovahagyasra_var');
assert.equal(mentCel(t, 'a', cel('Késő'), n().verzio), 'ervenytelen');
assert.equal(countTervTeendo({ userId: 'x', role: 'admin' }), 1);

const regi = n().verzio;
assert.equal(visszakuldTerv(t, 'Pontosítsd', regi), 'ok');
assert.equal(jovahagy(t, 'Admin2', regi), 'elavult');
assert.equal(n().statusz, 'visszakuldott');
assert.equal(countTervTeendo({ userId: 'a', role: 'attase' }), 1);
assert.equal(bekuld(t, 'a', n().verzio), 'ok');
assert.equal(jovahagy(t, 'Admin', n().verzio), 'ok');
assert.equal(n().statusz, 'jovahagyott');

const c = n().celok[1].id;
assert.equal(allitCelAllapot(c, 's', { allapot: 'teljesult', megjegyzes: null }, 'S'), 'nincs');
assert.equal(allitCelAllapot(c, 'a', { allapot: 'teljesult', megjegyzes: 'Kész' }, 'A'), 'ok');
assert.equal(feluliCelAllapot(c, { allapot: 'reszben', megjegyzes: 'Részben' }, 'Admin'), 'ok');
assert.equal(n().celok[1].allapotModositottaNev, 'Admin');
assert.equal(kerModositast(t, 'a', 'Új cél kell', n().verzio), 'ok');
assert.equal(n().modositasiKerelem, 'Új cél kell');
assert.equal(n().statusz, 'jovahagyott');
assert.equal(visszanyit(t, 'Módosítható', n().verzio), 'ok');
assert.equal(n().statusz, 'visszakuldott');
assert.equal(n().modositasiKerelem, null);
assert.equal(bekuld(t, 'a', n().verzio), 'ok');
assert.equal(jovahagy(t, 'Admin', n().verzio), 'ok');
assert.equal(n().celok[1].allapot, 'reszben');
console.log('OK');
```

- [ ] **Step 2: Futtasd, és ellenőrizd, hogy elbukik**

Run: `DATABASE_URL="$ERT_DB" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_ert2-munkaterv.ts`
Expected: FAIL, nem található a modul.

- [ ] **Step 3: Valósítsd meg a szabályokat, a sémát és a lekérdezéseket**

- A séma a spec 6.3. pontját követi, `(attase_id, ev)` egyedi indexszel, CHECK-ekkel a szótári értékekre, és `(terv_id, sorrend)` indexszel.
- A migrációt így generáld: `npx drizzle-kit generate --name munkaterv`. A `grep -c "__new_" drizzle/0016_munkaterv.sql` eredménye `0`.
- A `mentKozpontiCel` és a `kozzetesz` az aktív, székhellyel rendelkező attasékra ellenőriz. A `nevek`, `tulSok` és `nincsCel` az attasék nevét adja.
- A `kezdTerv` a `tervEvek` tartományon kívüli évre `ervenytelen`-t ad, közzététel előtt `nincs_kozzeteve`-t. A vonatkozó központi célokat másolatként teszi a tervbe, országuk az attasé székhelye.
- Központi célnál a `mentCel` csak az országot módosíthatja. Törölni nem lehet.
- A célszám felső korlátját a mentés, az alsót a beküldés ellenőrzi (`cel_szam`).
- A `visszanyit` a `modositasiKerelem`-et törli, a státuszt `visszakuldott`-ra állítja, a célállapotok megmaradnak.
- A `countTervTeendo` adminnál a `jovahagyasra_var` tervek és a nyitott módosítási kérések, attasénál a saját `visszakuldott` tervek száma.

- [ ] **Step 4: Futtasd a tesztet friss adatbázison**

Run: hozd létre újra az `$ERT_DB`-t, majd `DATABASE_URL="$ERT_DB" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_ert2-munkaterv.ts`
Expected: `OK`

- [ ] **Step 5: Ellenőrizz és commitolj**

Run: `npx tsc --noEmit`, `git status --short data/tet.db` (üres), `rm scripts/_ert2-munkaterv.ts`.

```bash
git add lib/munkaterv-szotar.ts lib/munkaterv-validacio.ts lib/munkaterv-jog.ts db/schema db/queries/munkaterv.ts drizzle
git commit -m "feat(munkaterv): szabályok, séma és életciklus"
```

---

### Task 8: Munkaterv a félévi értékelésben és a tesztadatokban

**Files:**
- Create: `app/(app)/monitoring/components/MunkatervKartya.tsx`
- Modify: `lib/ertekeles-mutatok.ts`, `db/queries/munkaterv.ts`, `db/queries/ertekeles.ts`, `app/(app)/monitoring/[attaseId]/page.tsx`, `app/(app)/monitoring/components/Munkalap.tsx`, `scripts/demo-ertekeles.ts`
- Test: `scripts/_ert2-terv-mutato.ts`

**Interfaces:**
- Consumes: Task 3 és Task 7 exportjai
- Produces, `lib/ertekeles-mutatok.ts`:

```ts
export interface MunkatervCelBemenet { megnevezes: string; szempont: SzempontKulcs; allapot: CelAllapot }
export interface MunkatervMutato { ev: number; celDb: number; folyamatbanDb: number; teljesultDb: number; reszbenDb: number; elmaradtDb: number; celok: MunkatervCelBemenet[] }
// BovitettBemenet új mezője: munkaterv?: MunkatervMutato | null
// ErtekelesMutatok új mezője: munkaterv?: MunkatervMutato | null (hiányzik: nincs bővített adat; null: nincs jóváhagyott terv)
export function munkatervOsszegzes(ev: number, celok: readonly MunkatervCelBemenet[]): MunkatervMutato;
```

- Produces, `db/queries/munkaterv.ts`: `jovahagyottTervek(attaseIdk: readonly string[], ev: number): Map<string, MunkatervMutato>`

- [ ] **Step 1: Írd meg a tesztet (`scripts/_ert2-terv-mutato.ts`)**

```ts
import assert from 'node:assert/strict';
import { munkatervOsszegzes, szamolMutatok, type MutatoBemenet } from '../lib/ertekeles-mutatok';
const cel = (allapot: 'folyamatban' | 'teljesult' | 'reszben' | 'elmaradt') => ({ megnevezes: allapot, szempont: 'eredmenyek' as const, allapot });
const o = munkatervOsszegzes(2027, [cel('teljesult'), cel('teljesult'), cel('reszben'), cel('elmaradt'), cel('folyamatban')]);
assert.deepEqual([o.celDb, o.teljesultDb, o.reszbenDb, o.elmaradtDb, o.folyamatbanDb], [5, 2, 1, 1, 1]);
const alap: MutatoBemenet = { felev: { ev: 2027, felev: 1 }, most: new Date('2027-07-05T10:00:00Z'), jelentesek: [], elozoFelevJelentesDb: 0, tickets: [], vezetettOrszagok: [], profilok: [], halozat: { szunetMedian: null, valaszMedian: null } };
assert.equal(szamolMutatok({ ...alap, bovitett: { tevekenysegek: [], eredmenyek: [], munkaterv: o } }).munkaterv?.teljesultDb, 2);
assert.equal(szamolMutatok({ ...alap, bovitett: { tevekenysegek: [], eredmenyek: [], munkaterv: null } }).munkaterv, null);
assert.equal(szamolMutatok(alap).munkaterv, undefined);
console.log('OK');
```

- [ ] **Step 2: Futtasd, és ellenőrizd, hogy elbukik**

Run: `npx tsx scripts/_ert2-terv-mutato.ts`
Expected: FAIL, hiányzó export miatt.

- [ ] **Step 3: Valósítsd meg a mutatót és a bekötést**

A `mutatoSzamolo` a félév évének jóváhagyott tervét adja a `bovitett` bemenetbe. Csak `jovahagyott` státuszú terv számít, különben `null`. Ha van `bovitett` bemenet, a `szamolMutatok` a hiányzó `munkaterv` mezőt `null`-ként írja a pillanatképbe.

- [ ] **Step 4: Futtasd a tesztet**

Run: `npx tsx scripts/_ert2-terv-mutato.ts`
Expected: `OK`

- [ ] **Step 5: Írd meg a `MunkatervKartya` komponenst**

Propok: `munkaterv: MunkatervMutato | null | undefined`, `attaseId: string`. A `undefined` szövege: „Ehhez a félévhez nincs tevékenységi adat.”, a `null` szövege: „Nincs jóváhagyott munkaterv.” Értéknél: „<teljesült> / <összes> cél teljesült”, állapotonkénti darabszámok, céllista szöveges állapottal, és link a `/munkaterv/[attaseId]?ev=<ev>` oldalra. A kártya a lezárt félév összképe alatt és a munkalap fülsora alatt áll.

- [ ] **Step 6: Bővítsd a tesztadatokat**

- 2026: minden attasénak jóváhagyott terv, a központi célok közzétéve. Célállapotok az összminősítés szerint: 4-esnél minden cél teljesült, 3-asnál 3 teljesült, 1 folyamatban, 2-esnél 1 teljesült, 1 részben, 1 elmaradt, 1-esnél 1 részben, 2 elmaradt.
- 2027: a központi célok közzétéve, a tervek állapota vegyes: 6 jóváhagyott, 3 jóváhagyásra vár, 2 visszaküldött, 2 piszkozat, 2 attasénál még nincs terv. Egy jóváhagyott tervnél nyitott módosítási kérés van.
- A 2026-os tervek a 2026/1 lezárása előtt készülnek el.
- Az önellenőrzés ellenőrzi a státuszok darabszámát és a 2026/1 pillanatképek `munkaterv` mezőjét.

Run: `NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-ertekeles.ts`
Expected: az utolsó sor `Kész: data/tet-ertekeles-teszt.db`.

- [ ] **Step 7: Commitolj**

Run: `npx tsc --noEmit`, `rm scripts/_ert2-terv-mutato.ts`.

```bash
git add lib/ertekeles-mutatok.ts db/queries app/\(app\)/monitoring scripts/demo-ertekeles.ts
git commit -m "feat(munkaterv): a terv állapota a félévi értékelésben és a tesztadatokban"
```

---

### Task 9: Munkaterv-felületek

**Files:**
- Create: `lib/munkaterv-szuro.ts`, `app/(app)/munkaterv/page.tsx`, `app/(app)/munkaterv/[attaseId]/page.tsx`, `app/(app)/munkaterv/actions.ts`, és az `app/(app)/munkaterv/components/` alatt: `EvValaszto.tsx`, `AttaseTerv.tsx`, `CelTabla.tsx`, `CelDialog.tsx`, `CelAllapotDialog.tsx`, `TervMuveletek.tsx`, `TervMegjegyzesDialog.tsx`, `KozpontiCelok.tsx`, `KozpontiCelDialog.tsx`, `TervAttekintes.tsx`, `TervReszlet.tsx`
- Modify: `lib/navigacio.ts`, `app/(app)/layout.tsx`
- Test: `scripts/_ert2-terv-szuro.ts`

**Interfaces:**
- Consumes: Task 7 exportjai, `MenuSzamlalo`
- Produces, `lib/munkaterv-szuro.ts`: `tervEvParam(v: string | string[] | undefined, aktualisEv: number): number`
- Produces, `actions.ts`:

```ts
export async function mentKozpontiCelAction(ev: number, id: string | null, prev: MuveletState, fd: FormData): Promise<MuveletState>;
export async function torolKozpontiCelAction(id: string): Promise<MuveletState>;
export async function kozzeteszAction(ev: number): Promise<MuveletState>;
export async function kezdTervAction(ev: number): Promise<MuveletState>;
export async function mentCelAction(tervId: string, verzio: number, celId: string | null, prev: MuveletState, fd: FormData): Promise<MuveletState>;
export async function torolCelAction(tervId: string, verzio: number, celId: string): Promise<MuveletState>;
export async function bekuldAction(tervId: string, verzio: number): Promise<MuveletState>;
export async function jovahagyAction(tervId: string, verzio: number): Promise<MuveletState>;
export async function visszakuldTervAction(tervId: string, verzio: number, prev: MuveletState, fd: FormData): Promise<MuveletState>;
export async function kerModositastAction(tervId: string, verzio: number, prev: MuveletState, fd: FormData): Promise<MuveletState>;
export async function elutasitModositastAction(tervId: string, verzio: number, prev: MuveletState, fd: FormData): Promise<MuveletState>;
export async function visszanyitAction(tervId: string, verzio: number, prev: MuveletState, fd: FormData): Promise<MuveletState>;
export async function allitCelAllapotAction(celId: string, prev: MuveletState, fd: FormData): Promise<MuveletState>;
```

- [ ] **Step 1: Írd meg a tesztet (`scripts/_ert2-terv-szuro.ts`)**

```ts
import assert from 'node:assert/strict';
import { tervEvParam } from '../lib/munkaterv-szuro';
assert.equal(tervEvParam(undefined, 2026), 2026);
assert.equal(tervEvParam('2027', 2026), 2027);
assert.equal(tervEvParam('2025', 2026), 2025);
assert.equal(tervEvParam('2028', 2026), 2026);
assert.equal(tervEvParam('abc', 2026), 2026);
assert.equal(tervEvParam('2019', 2026), 2026);
console.log('OK');
```

A múltbeli év megtekinthető `EV_MIN`-ig, a jövő csak a következő évig.

- [ ] **Step 2: Valósítsd meg a szűrőt, és futtasd a tesztet**

Run: `npx tsx scripts/_ert2-terv-szuro.ts`
Expected: `OK`

- [ ] **Step 3: Bővítsd a navigációt**

Új `UTVONALAK` sor a `/tevekenysegek` után: `href: '/munkaterv'`, `cim` és `felirat`: „Éves munkaterv”, `alcim`: „Az attasék éves céljai és azok teljesülése”, `ikon: '▤'`, `szamlalo: 'munkaterv'`. A layout a `countTervTeendo(session)` értékét is átadja.

- [ ] **Step 4: Írd meg a felületeket a spec 6.2. pontja szerint**

- Az év az `EvValaszto`-ból, `?ev=` paraméterrel jön, a fejléc ciklusától független. Az opciók a múltbeli évek közül azok, amelyekhez terv tartozik, valamint a `tervEvek`.
- Attasé: közzététel előtt tájékoztató kártya. Közzététel után, terv nélkül „Munkaterv elkezdése” gomb. Szerkeszthető tervnél célfelvétel, módosítás, törlés és „Beküldés jóváhagyásra”. A beküldés gombja mellett szövegesen áll, hány cél hiányzik. A központi cél „Központi” jelzést kap, csak az országa módosítható.
- Visszaküldött tervnél a megjegyzés kiemelten látszik.
- Jóváhagyott tervnél az attasé célonként állapotot válthat, és „Módosítás kérése” gombot lát.
- Admin `/munkaterv`: `KozpontiCelok` és `TervAttekintes`. A közzététel megerősítést kér, hibánál felsorolja a kifogásolt attasékat. Közzététel után a célok csak olvashatók.
- Admin `/munkaterv/[attaseId]`: a `TervReszlet` jóváhagyást, visszaküldést, módosítási kérés elutasítását, visszanyitást és célállapot-felülírást kínál. Ismeretlen attasé: 404. Az attasé csak a saját `/munkaterv` oldalát látja, a `/munkaterv/[attaseId]` neki 404.
- Hibák: `elavult` → „A tervet közben módosították. Töltsd újra az oldalt.”, `nincs_kozzeteve` → „A központi célok még nem jelentek meg.”, `cel_szam` → „A tervnek 3–5 célt kell tartalmaznia.”, `kozzeteve` → „A közzétett központi célok nem módosíthatók.”, `ervenytelen` → „Ez a művelet most nem végezhető el.”, `nincs` → „A terv nem található.”

- [ ] **Step 5: Ellenőrizd böngészőben a QA-környezetben**

| Szerep és lépés | Elvárt eredmény |
| --- | --- |
| Attasé, 2027 | A terv állapota és a központi célok zárolva látszanak |
| Attasé, 2 cél beküldése | A beküldés nem lehetséges, a szöveg jelzi a hiányt |
| Attasé, 6. cél felvétele | Hibaüzenet |
| Attasé, beküldés | „Jóváhagyásra vár”, a szerkesztés megszűnik |
| Admin, központi cél szerkesztése közzététel után | Nem lehetséges |
| Admin, visszaküldés megjegyzés nélkül | Hibaüzenet |
| Admin, jóváhagyás | Az áttekintésben „Jóváhagyva”, a számláló csökken |
| Attasé, célállapot váltása | Az állapot és a megjegyzés mentődik |
| Admin, felülírás | A felülíró neve látszik |
| Attasé, módosítás kérése, majd admin visszanyitás | A terv szerkeszthető, az állapotok megmaradnak |
| Monitoring adatlap, 2026/1 | A munkaterv kártyája a céllistával és a linkkel |
| Attasé, más attasé terve | 404 |
| Billentyűzet és keskeny ablak | Minden művelet elérhető, a táblázat a saját dobozában görget |

- [ ] **Step 6: Commitolj**

Run: `npx tsc --noEmit`, `rm scripts/_ert2-terv-szuro.ts`, a QA után generáld újra a tesztadatbázist.

```bash
git add lib/munkaterv-szuro.ts lib/navigacio.ts app/\(app\)/layout.tsx app/\(app\)/munkaterv
git commit -m "feat(munkaterv): attaséi és központi felületek"
```

---

## C blokk: jelentésminősítés

### Task 10: Minősítés adatrétege és mutatója

**Files:**
- Create: `lib/riport-minosites.ts`, `db/schema/riport-minosites.ts`, `drizzle/0017_riport_minosites.sql` (generált), `db/queries/riport-minosites.ts`
- Modify: `db/schema/index.ts`, `lib/ertekeles-mutatok.ts`, `lib/ertekeles-megjelenites.ts`, `db/queries/ertekeles.ts`, `scripts/demo-ertekeles.ts`
- Test: `scripts/_ert2-minosites.ts`

**Interfaces:**
- Consumes: `OsszFokozat`, `isOsszFokozat`, `INDOKLAS_MAX`, `ParseResult`, `mezo`
- Produces, `lib/riport-minosites.ts`:

```ts
export type MinositesSzuro = OsszFokozat | 'nincs';
export interface RiportMinositesInput { fokozat: OsszFokozat | null; megjegyzes: string | null }
export function parseRiportMinositesForm(fd: FormData): ParseResult<RiportMinositesInput>;
export function parseMinositesSzuro(v: string): MinositesSzuro | null;
export function minositesMegoszlas(fokozatok: readonly (OsszFokozat | null)[]): Record<OsszFokozat | 'nincs', number>;
```

- Produces, `db/queries/riport-minosites.ts`:

```ts
export interface RiportMinosites { fokozat: OsszFokozat; megjegyzes: string | null; szerzoNev: string; updatedAt: Date }
export function getRiportMinosites(riportId: string): RiportMinosites | null;
export function riportMinositesek(riportIdk: readonly string[]): Map<string, RiportMinosites>;
export function setRiportMinosites(riportId: string, i: RiportMinositesInput, szerzoNev: string, most?: Date): boolean;
```

- Produces, `lib/ertekeles-mutatok.ts`: `JelentesBemenet.minosites?: OsszFokozat | null`, `ErtekelesMutatok.tajekoztatas.jelentesMinosites?: Record<OsszFokozat | 'nincs', number>`

- [ ] **Step 1: Írd meg a tesztet (`scripts/_ert2-minosites.ts`)**

```ts
const fd = (o: Record<string, string>) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v); return f; };
const jo = parseRiportMinositesForm(fd({ fokozat: '3', megjegyzes: '' }));
assert.ok(jo.ok && jo.data.fokozat === 3 && jo.data.megjegyzes === null);
const torles = parseRiportMinositesForm(fd({ fokozat: '', megjegyzes: 'x' }));
assert.ok(torles.ok && torles.data.fokozat === null && torles.data.megjegyzes === null);
const rossz = parseRiportMinositesForm(fd({ fokozat: '0', megjegyzes: '' }));
assert.ok(!rossz.ok && rossz.errors.fokozat === 'Válassz érvényes fokozatot.');
const hosszu = parseRiportMinositesForm(fd({ fokozat: '2', megjegyzes: 'x'.repeat(2001) }));
assert.ok(!hosszu.ok && hosszu.errors.megjegyzes === 'A megjegyzés legfeljebb 2000 karakter lehet.');
assert.equal(parseMinositesSzuro('nincs'), 'nincs');
assert.equal(parseMinositesSzuro('4'), 4);
assert.equal(parseMinositesSzuro('0'), null);
assert.deepEqual(minositesMegoszlas([4, 3, 3, null]), { 4: 1, 3: 2, 2: 0, 1: 0, nincs: 1 });

// DB: friss $ERT_DB, egy `r1` jelentéssel
const elotte = db.select({ u: riport.updatedAt }).from(riport).where(eq(riport.id, 'r1')).get()!.u;
assert.equal(setRiportMinosites('r1', { fokozat: 4, megjegyzes: 'Kiváló' }, 'Admin'), true);
assert.equal(getRiportMinosites('r1')!.fokozat, 4);
assert.equal(db.select({ u: riport.updatedAt }).from(riport).where(eq(riport.id, 'r1')).get()!.u.getTime(), elotte.getTime());
assert.equal(setRiportMinosites('nincs-ilyen', { fokozat: 4, megjegyzes: null }, 'Admin'), false);
assert.equal(setRiportMinosites('r1', { fokozat: null, megjegyzes: null }, 'Admin'), true);
assert.equal(getRiportMinosites('r1'), null);

// Mutató
const alap: Omit<MutatoBemenet, 'jelentesek'> = { felev: { ev: 2027, felev: 1 }, most: new Date('2027-07-05T10:00:00Z'), elozoFelevJelentesDb: 0, tickets: [], vezetettOrszagok: [], profilok: [], halozat: { szunetMedian: null, valaszMedian: null } };
const j = (id: string, minosites: 4 | 3 | null) => ({ id, targy: id, kategoria: 'okoszisztema', createdAt: new Date('2027-02-01T10:00:00Z'), intezkedes: false, minosites });
const m = szamolMutatok({ ...alap, jelentesek: [j('a', 4), j('b', 3), j('c', null)], bovitett: { tevekenysegek: [], eredmenyek: [], munkaterv: null } });
assert.deepEqual(m.tajekoztatas.jelentesMinosites, { 4: 1, 3: 1, 2: 0, 1: 0, nincs: 1 });
assert.equal(szamolMutatok({ ...alap, jelentesek: [j('a', 4)] }).tajekoztatas.jelentesMinosites, undefined);
assert.deepEqual(mutatoKartyak('tajekoztatas', m).at(-1), { cimke: 'Minősítésre vár', ertek: '1 jelentés', megjegyzes: '3 jelentésből' });
assert.equal(mutatoKartyak('tajekoztatas', m).at(-2)!.cimke, 'Jelentések minősítése');
assert.equal(mutatoKartyak('tajekoztatas', m).at(-2)!.ertek, '1 Kiem. · 1 Megf. · 0 Részben · 0 Fejl.');
console.log('OK');
```

- [ ] **Step 2: Futtasd, és ellenőrizd, hogy elbukik**

Run: `DATABASE_URL="$ERT_DB" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_ert2-minosites.ts`
Expected: FAIL, nem található a modul.

- [ ] **Step 3: Valósítsd meg az adatréteget**

- A séma a spec 7.3. pontját követi. A migrációt így generáld: `npx drizzle-kit generate --name riport_minosites`. A `grep -c "__new_" drizzle/0017_riport_minosites.sql` eredménye `0`.
- A `setRiportMinosites` `fokozat: null` esetén törli a sort, a `riport` táblához nem nyúl.
- A `mutatoForrasok` csak `bovitett` félévnél olvassa a minősítéseket, egy külön lekérdezéssel. A `listRiportok` és a `getRiport` nem kap minősítést.
- A két új Tájékoztatás-kártya csak akkor jelenik meg, ha a `jelentesMinosites` létezik.

- [ ] **Step 4: Futtasd a tesztet friss adatbázison**

Run: hozd létre újra az `$ERT_DB`-t, majd `DATABASE_URL="$ERT_DB" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_ert2-minosites.ts`
Expected: `OK`

- [ ] **Step 5: Bővítsd a tesztadatokat**

A 2025/1 és későbbi lezárt félévek jelentéseinek 90%-a, a nyitott 2026/2 jelentéseinek 50%-a kap minősítést. A fokozat a Tájékoztatás fokozata körül szór: az azonos fokozat 60%, az eggyel gyengébb 25%, az eggyel erősebb 15%, az 1–4 tartományon belül. A megjegyzés a jelentések 20%-ánál töltött. Az önellenőrzés ellenőrzi, hogy a 2024/2 pillanatképekben nincs `jelentesMinosites`, a 2025/1 pillanatképekben van.

Run: `NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-ertekeles.ts`
Expected: az utolsó sor `Kész: data/tet-ertekeles-teszt.db`.

- [ ] **Step 6: Commitolj**

Run: `npx tsc --noEmit`, `git status --short data/tet.db` (üres), `rm scripts/_ert2-minosites.ts`.

```bash
git add lib/riport-minosites.ts lib/ertekeles-mutatok.ts lib/ertekeles-megjelenites.ts db/schema db/queries drizzle scripts/demo-ertekeles.ts
git commit -m "feat(jelentes): jelentésenkénti minősítés adatrétege és mutatója"
```

---

### Task 11: Minősítés a jelentések felületén

**Files:**
- Create: `app/(app)/jelentesek/components/MinositesSzerkeszto.tsx`, `app/(app)/jelentesek/components/MinositesDialog.tsx`
- Modify: `app/(app)/jelentesek/page.tsx`, `app/(app)/jelentesek/actions.ts`, `app/(app)/jelentesek/[id]/page.tsx`, `app/(app)/jelentesek/components/RiportTabla.tsx`, `app/(app)/jelentesek/components/RiportReszlet.tsx`, `app/(app)/jelentesek/components/RiportSzurok.tsx`, `lib/riport-szuro.ts`

**Interfaces:**
- Consumes: Task 10 exportjai, `FokozatJelveny`-mintájú feliratok a `lib/ertekeles-szotar.ts`-ből
- Produces, `actions.ts`: `mentMinositesAction(id: string, prev: MuveletState, fd: FormData): Promise<MuveletState>`
- Produces, `lib/riport-szuro.ts`: `SzuroErtekek.minosites: string`, `minositesFromSearchParams(sp: SearchParams): MinositesSzuro | null`

- [ ] **Step 1: Írd meg az action-t**

`requireSession()`, `canIntezkedni` hiányakor a meglévő `NINCS_JOG` hiba, `parseRiportMinositesForm`, `setRiportMinosites`, majd `revalidatePath('/', 'layout')`. Nem létező jelentésnél: „A bejegyzés már nem létezik.”

- [ ] **Step 2: Írd meg a felületet a spec 7.2. pontja szerint**

- A `jelentesek/page.tsx` csak adminnál hívja a `riportMinositesek`-et, és a `minosites` szűrést csak adminnál, memóriában alkalmazza a `listRiportok` eredményére. Attasénál az URL-ből érkező `minosites` értéket eldobja.
- A `RiportTabla` új, opcionális propja a `minositesek?: ReadonlyMap<string, RiportMinosites>` és a `minositesAction?: (id: string) => FormAction`. A „Minősítés” oszlop csak ezek megléte esetén jelenik meg.
- A `MinositesSzerkeszto` az `IntezkedesSzerkeszto` mintáját követi: egyetlen natív `<button>`, fókuszvisszaadással, a felirata a fokozat neve vagy „Minősítés”. A `MinositesDialog` `NativeSelect`-ből választ fokozatot, a „Nincs minősítve” opció törli a minősítést. Siker-toast: „Minősítés mentve.”, törlésnél „Minősítés törölve.”
- A `RiportReszlet` adminnak „Központi minősítés” kártyát mutat a fokozattal, a megjegyzéssel, a szerzővel és az időponttal. Attasénak a prop hiányzik.
- A `RiportSzurok` admin szűrője: Mind, Kiemelkedő, Megfelel, Részben megfelel, Fejlesztendő, Nincs minősítve.

- [ ] **Step 3: Ellenőrizd az adatszivárgást böngésző nélkül (Review Focus 5)**

A QA-környezetben állíts be egy jellegzetes megjegyzést (`ZZ-TITKOS-MINOSITES-ZZ`) egy `teszt01` szerzőjű jelentésen adminként, majd attaséként kérd le a lista és a részletoldal teljes HTML-jét:

```bash
~/.claude/skills/gstack/browse/dist/browse js "fetch('/jelentesek').then(r=>r.text()).then(t=>t.includes('ZZ-TITKOS-MINOSITES-ZZ'))"
~/.claude/skills/gstack/browse/dist/browse js "fetch('/jelentesek/<id>').then(r=>r.text()).then(t=>t.includes('ZZ-TITKOS-MINOSITES-ZZ'))"
```
Expected: mindkettő `false`. Adminként ugyanez a részletoldalon `true`.

- [ ] **Step 4: Ellenőrizd böngészőben**

| Szerep és lépés | Elvárt eredmény |
| --- | --- |
| Admin, jelentések listája | „Minősítés” oszlop és szűrő látszik |
| Admin, gyors minősítés | Toast, a cella az új fokozatot mutatja, a fókusz visszatér |
| Admin, „Nincs minősítve” szűrő | Csak a minősítetlen jelentések látszanak |
| Admin, minősítés törlése | A jelentés újra minősítetlen |
| Admin, jelentés oldala | „Központi minősítés” kártya |
| Attasé, lista `?minosites=4` paraméterrel | Se oszlop, se szűrő, a lista a saját jelentéseit mutatja szűrés nélkül |
| Attasé, saját jelentés oldala | Nincs „Központi minősítés” kártya |
| Monitoring adatlap, 2026/1 | A jelentések megoszlása és a minősítésre várók száma |
| Monitoring adatlap, 2024/2 | Nincs minősítési kártya, hiba sincs |

- [ ] **Step 5: Commitolj**

Run: `npx tsc --noEmit`, a QA után generáld újra a tesztadatbázist.

```bash
git add app/\(app\)/jelentesek lib/riport-szuro.ts
git commit -m "feat(jelentes): minősítés a jelentések listáján és oldalán"
```

---

### Task 12: Dokumentáció, teljes kör, build

**Files:**
- Modify: `CLAUDE.md`, `README.md` (ha érintett)

**Interfaces:**
- Consumes: minden korábbi feladat

- [ ] **Step 1: Frissítsd a dokumentációt**

`CLAUDE.md`:
- A Monitoring bekezdés bevezetője jelölje a 2. szakaszt késznek, a spec hivatkozásával.
- Új bekezdések: **Tevékenységek és eredmények**, **Éves munkaterv**, **Jelentésminősítés**. Térj ki a fájlokra, a táblákra, az állapotgépre, a beszámítási szabályra, a `bovitett_adatok` jelzőre és a `BOVITETT_ADATOK_ELSO_FELEV` értékére, a központi célok közzétételére, a menüszámlálókra, és arra, hogy a jelentés minősítését csak admin nézet kérdezheti le.
- A „Hová kerül az új kód” és a UI shell leírás kövesse az új útvonalakat.

A másik munkamenet nem commitolt `CLAUDE.md`-módosítását ne vedd be a commitba. Csak a saját módosításaidat add az indexhez (`git diff CLAUDE.md` alapján készített javítással, `git apply --cached`).

- [ ] **Step 2: Futtass teljes kört a QA-környezetben**

Újragenerált tesztadatbázison, egymás után:

1. Attaséként új tevékenység és eredmény rögzítése, igazolás kérése.
2. Adminként igazolás, majd a 2026/2 munkalapján az új mutatók ellenőrzése.
3. Attaséként 2027-es terv beküldése, adminként jóváhagyás.
4. Adminként egy jelentés minősítése, a mutatók frissülésének ellenőrzése a munkalapon.
5. A 2026/1 újranyitása, majd újralezárása: a rögzített mutatók SHA-256 hash-e változatlan.
6. A böngésző konzolján nincs hiba.

- [ ] **Step 3: Futtass build-et az eldobható másolatban**

Állítsd le a QA dev szervert, majd:

```bash
REPO="$(git rev-parse --show-toplevel)"
rsync -a --delete --exclude node_modules --exclude .next --exclude .git --exclude 'data/*.db*' ./ "${TMPDIR:-/tmp}/tet-ert2-qa/"
cd "${TMPDIR:-/tmp}/tet-ert2-qa"
mkdir -p data && sqlite3 -readonly "$REPO/data/tet.db" ".backup 'data/tet.db'"
DATABASE_URL="$PWD/data/tet.db" npm run build
```
Expected: a build hiba nélkül lefut, az útvonallistában szerepel a `/tevekenysegek`, a `/tevekenysegek/eredmeny/[id]`, a `/munkaterv` és a `/munkaterv/[attaseId]`.

- [ ] **Step 4: Takaríts, és ellenőrizd a demó adatbázist**

Run: `rm -rf "${TMPDIR:-/tmp}/tet-ert2-qa" "${TMPDIR:-/tmp}/tet-ert2-teszt.db"*`, majd a repóban `git status --short data/tet.db` és `npx tsc --noEmit`.
Expected: üres `git status`, hiba nélküli típusellenőrzés. Az eldobható másolat a `.env.local` másolatát is tartalmazta, ezért a törlés kötelező.

- [ ] **Step 5: Commitolj**

A saját `CLAUDE.md`-módosításaid az 1. lépés után már az indexben vannak. Ha a `README.md` változott, azt is add hozzá.

```bash
git commit -m "docs(monitoring): a 2. szakasz leírása"
```
