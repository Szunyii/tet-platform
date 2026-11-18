# TéT Monitoring és értékelés, 1. szakasz – megvalósítási terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `/monitoring` demóoldalát valódi félévi szakmai értékelési rendszerre cseréljük: automatikus mutatók, admin minősítés öt szempont szerint, hálózati hőtérkép és egyéni adatlap, kitalált tesztadatokkal.

**Architecture:** A szakmai logika tiszta függvényekben él a `lib/ertekeles-*.ts` fájlokban, a DB-hozzáférés a `db/queries/ertekeles.ts`-ben. A `/monitoring` és a `/monitoring/[attaseId]` Server Component oldal, a minősítő munkalap kliens-komponens. A félév lezárásakor a mutatók JSON-pillanatképbe fagynak.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Drizzle + better-sqlite3, shadcn/ui (Base UI), Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-11-18-monitoring-ertekeles-design.md`

## Global Constraints

- Minden felületi szöveg magyar. A fokozatok, a szempontok és a fokozatleírások szövege a spec 5.1. és 5.2. pontjából szó szerint kerül a kódba.
- Next.js-kód írása előtt olvasd el a vonatkozó útmutatót a `node_modules/next/dist/docs/` alatt (`AGENTS.md`).
- A meglévő fájlok mintájára relatív importokat használj.
- Új npm-függőség nem vehető fel.
- **A `data/tet.db`-t egyetlen lépés sem módosíthatja.** A repóban `npm run build` és `npm run db:migrate` nem futtatható, csak az alábbi eldobható másolatban vagy `DATABASE_URL`-lel eldobható adatbázisra.
- A felhasználó futó dev szerverét nem szabad leállítani. Ugyanabban a mappában a Next lockfile miatt második dev szerver nem indul, ezért a böngészős ellenőrzés az eldobható másolatban fut.
- Rangsor és pontszám szerinti rendezés sehol nincs. Fokozatot és összminősítést kód nem számol, csak admin ad.
- Az indoklás és a fejlesztési cél felső korlátja `INDOKLAS_MAX = 2000`.
- A dátumhatárok Europe/Budapest szerint értendők.
- Minden oldal és action elsőként `requireAdmin()`-t hív. Minden mutáció után `revalidatePath('/', 'layout')` fut.
- A választott évtől függő hibára `notFound()` tilos, helyette tájékoztató kártya jelenik meg (CLAUDE.md).
- A projektben nincs tesztkeretrendszer. A tesztek eldobható `scripts/_ert-*.ts` fájlok `node:assert/strict`-tel. Sikeres futás után töröld őket, nem kerülnek commitba.
- Minden commit üzenete ezzel a sorral zárul: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Munkaág: `monitoring-ertekeles`.

## Review Focus

1. **Tevékenység nélküli attasé:** nulla jelentésnél és ticketnél a mutatók `0` vagy `null` értéket adnak, `NaN` és nullával osztás nélkül, a felület „–” jelet mutat.
2. **Válasz a határidő napjának késő estéjén:** a besorolás a budapesti naptári nap szerint történik, nem UTC szerint.
3. **Két admin ugyanazt a szempontot menti:** a második elavult verzió miatt űrlaphibát kap, a beírt szövege megmarad.
4. **Attasé változása nyitott félévben:** a törölt vagy tiltott attasé hiányos sora nem blokkolja a lezárást, az újonnan vezetővé vált attasénál az Országismeret minősítendővé válik.
5. **Lezárás után törölt vagy módosított forrásadat:** a kiadott mutatók nem változnak, a törölt bizonyíték linkje helyett a tárgya szövegként látszik.

## Eldobható környezetek

**Adatbázis a query-tesztekhez:**

```bash
export ERT_DB="${TMPDIR:-/tmp}/tet-ert-teszt.db"
rm -f "$ERT_DB" "$ERT_DB-wal" "$ERT_DB-shm"
sqlite3 -readonly data/tet.db ".backup '$ERT_DB'"
DATABASE_URL="$ERT_DB" npx drizzle-kit migrate
```

**Böngészős ellenőrzés (QA-környezet):** a futó szerverek közül csak ezt indítsd el, háttérfolyamatként.

```bash
REPO="$PWD"; QA_DIR="${TMPDIR:-/tmp}/tet-ert-qa"; mkdir -p "$QA_DIR"
rsync -a --delete --exclude node_modules --exclude .next --exclude .git --exclude 'data/*.db*' ./ "$QA_DIR/"
[ -d "$QA_DIR/node_modules" ] || cp -cR node_modules "$QA_DIR/node_modules"
cd "$QA_DIR" && DATABASE_URL="$REPO/data/tet-ertekeles-teszt.db" BETTER_AUTH_URL=http://localhost:3110 npx next dev -p 3110
```

Kódváltozás után elég az `rsync` sort újra futtatni. Böngésző: `~/.claude/skills/gstack/browse/dist/browse`. Admin belépés: `admin@niu.hu`, jelszó a `.env.local` `SEED_ADMIN_PASSWORD` értéke (ne írd ki). Attasé belépés: `teszt01@ertekeles.test`, jelszó `Teszt-Attase-2026!`. A feladat végén állítsd le a QA-szervert.

## Fájlszerkezet

| Fájl | Felelősség |
| --- | --- |
| `lib/ertekeles-szotar.ts` | Szempontok, fokozatok, leírások, korlátok |
| `lib/ertekeles-idoszak.ts` | Félévek határai és szabályai |
| `lib/ertekeles-mutatok.ts` | Mutatók és határidő-besorolás |
| `lib/ertekeles-osszesites.ts` | Hőtérkép-sorok szűrése, összesítése, haladás, változás |
| `lib/ertekeles-szuro.ts` | URL-szűrők |
| `lib/ertekeles-validacio.ts` | Űrlapok validálása |
| `lib/ertekeles-megjelenites.ts` | Mutatók feliratai és formázása |
| `db/schema/ertekeles.ts` | Három új tábla |
| `db/queries/ertekeles.ts` | Lekérdezések, mentések, életciklus |
| `scripts/demo-ertekeles.ts` | Kitalált tesztadatbázis |
| `app/(app)/monitoring/page.tsx` | Hálózati nézet |
| `app/(app)/monitoring/[attaseId]/page.tsx` | Adatlap |
| `app/(app)/monitoring/actions.ts` | Server action-ök |
| `app/(app)/monitoring/components/` | A két oldal komponensei |

---

### Task 1: Szótár, félévek, adatbázis-séma

**Files:**
- Create: `lib/ertekeles-szotar.ts`, `lib/ertekeles-idoszak.ts`, `db/schema/ertekeles.ts`, `drizzle/0014_ertekeles.sql` (generált, a `drizzle/meta` változásaival)
- Modify: `lib/datum.ts`, `db/schema/index.ts`, `.gitignore`
- Test: `scripts/_ert-idoszak.ts`

**Interfaces:**
- Produces, `lib/datum.ts`: `naptariNap(d: Date): string` (`YYYY-MM-DD`, Europe/Budapest). A `maiNaptariNap()` ezt hívja.
- Produces, `lib/ertekeles-szotar.ts`:
  - `SZEMPONTOK` (`kulcs`, `nev`, `rovid`, `fokozatok: Record<1|2|3|4, string>`), `SZEMPONT_KULCSOK`, `type SzempontKulcs`, `isSzempontKulcs(v: string)`, `szempontByKulcs(k)`
  - `FOKOZATOK` (`ertek`, `nev`, `rovid`, a 4, 3, 2, 1, 0 sorrendben), `type Fokozat = 0|1|2|3|4`, `type OsszFokozat = 1|2|3|4`, `isFokozat(n: number)`, `isOsszFokozat(n: number)`, `fokozatNev(f)`, `fokozatRovid(f)`
  - `FOKOZAT_OSZTALY: Record<Fokozat, string>`, `NEM_ERTEKELHETO = 0`, `MEGFELEL = 3`, `INDOKLAS_MAX = 2000`, `AUTOMATIKUS_ERTEKELO = 'Automatikus'`
  - `interface RogzitettOrszag { kod: string; szekhely: boolean; vezeto: boolean }`
- Produces, `lib/ertekeles-idoszak.ts`:
  - `type FelevSzam = 1|2`, `interface Felev { ev: number; felev: FelevSzam }`
  - `felevKulcs(f): string`, `felevCimke(f): string`, `felevNapok(f): { elsoNap: string; utolsoNap: string }`, `felevHatarok(f): { kezdet: Date; vegeKizaro: Date }`
  - `futoFelev(ma: string): Felev`, `elozoFelev(f): Felev`, `felevOsszevet(a, b): number`
  - `felevMegkezdodott(f, ma): boolean`, `felevBefejezodott(f, ma): boolean`, `megnyithato(f, ma): boolean`
  - `alapFelev(ev: number, ma: string, lezartak: readonly FelevSzam[]): FelevSzam`, `parseFelevSzam(v: unknown): FelevSzam | null`
- Produces, `db/schema/ertekeles.ts`: `ertekelesiIdoszak`, `attaseErtekeles`, `szempontMinosites`

- [ ] **Step 1: Írd meg a tesztet (`scripts/_ert-idoszak.ts`)**

```ts
import assert from 'node:assert/strict';
import { alapFelev, elozoFelev, felevBefejezodott, felevCimke, felevKulcs, felevNapok, futoFelev, megnyithato } from '../lib/ertekeles-idoszak';
import { FOKOZATOK, SZEMPONTOK, SZEMPONT_KULCSOK, fokozatNev } from '../lib/ertekeles-szotar';
import { naptariNap } from '../lib/datum';

assert.equal(felevKulcs({ ev: 2026, felev: 1 }), '2026/1');
assert.equal(felevCimke({ ev: 2026, felev: 2 }), '2026 2. félév');
assert.deepEqual(felevNapok({ ev: 2026, felev: 1 }), { elsoNap: '2026-01-01', utolsoNap: '2026-06-30' });
assert.deepEqual(felevNapok({ ev: 2026, felev: 2 }), { elsoNap: '2026-07-01', utolsoNap: '2026-12-31' });
assert.deepEqual(futoFelev('2026-06-30'), { ev: 2026, felev: 1 });
assert.deepEqual(futoFelev('2026-07-01'), { ev: 2026, felev: 2 });
assert.deepEqual(elozoFelev({ ev: 2026, felev: 1 }), { ev: 2025, felev: 2 });
assert.equal(felevBefejezodott({ ev: 2026, felev: 1 }, '2026-06-30'), false);
assert.equal(felevBefejezodott({ ev: 2026, felev: 1 }, '2026-07-01'), true);
assert.equal(megnyithato({ ev: 2026, felev: 2 }, '2026-11-18'), true);
assert.equal(megnyithato({ ev: 2026, felev: 1 }, '2026-11-18'), true);
assert.equal(megnyithato({ ev: 2025, felev: 2 }, '2026-11-18'), false);
assert.equal(megnyithato({ ev: 2027, felev: 1 }, '2026-11-18'), false);
assert.equal(alapFelev(2026, '2026-11-18', [1]), 1);
assert.equal(alapFelev(2026, '2026-11-18', [1, 2]), 2);
assert.equal(alapFelev(2026, '2026-11-18', []), 2);
assert.equal(alapFelev(2026, '2026-03-01', []), 1);
assert.equal(alapFelev(2025, '2026-11-18', []), 2);
assert.equal(naptariNap(new Date('2026-03-10T23:30:00Z')), '2026-03-11');
assert.equal(SZEMPONT_KULCSOK.length, 5);
for (const s of SZEMPONTOK) for (const f of [1, 2, 3, 4] as const) assert.ok(s.fokozatok[f].length > 10);
assert.deepEqual(FOKOZATOK.map((f) => f.ertek), [4, 3, 2, 1, 0]);
assert.equal(fokozatNev(0), 'Nem értékelhető');
console.log('OK');
```

- [ ] **Step 2: Futtasd, és ellenőrizd, hogy elbukik**

Run: `npx tsx scripts/_ert-idoszak.ts`
Expected: FAIL, nem található a `lib/ertekeles-idoszak` modul.

- [ ] **Step 3: Valósítsd meg a `naptariNap`-ot és a két `lib` fájlt**

A `FOKOZAT_OSZTALY` értékei: 4 `bg-[#0f7a68] text-white`, 3 `bg-[#cde9e1] text-[#0b4f44]`, 2 `bg-[#fbe3b8] text-[#6e4700]`, 1 `bg-[#f2b8b3] text-[#7a1710]`, 0 `bg-[repeating-linear-gradient(135deg,#eef0f3_0_4px,#e1e5ea_4px_8px)] text-[#4a5462]`. A `megnyithato` a futó és a közvetlenül előtte lévő félévre igaz. Az `alapFelev` a legnagyobb lezárt félévet adja, ennek hiányában az év legutóbbi megkezdett félévét.

- [ ] **Step 4: Futtasd a tesztet**

Run: `npx tsx scripts/_ert-idoszak.ts`
Expected: `OK`

- [ ] **Step 5: Írd meg a sémát a spec 7. pontja szerint**

Az `attase_id` szándékosan FK nélküli. CHECK-ek: `felev in (1, 2)`, `statusz in ('nyitott', 'lezart')`, `ossz_fokozat is null or ossz_fokozat between 1 and 4`, `fokozat between 0 and 4`, `json_valid(orszagok)`, `mutatok is null or json_valid(mutatok)`. Egyedi indexek: `(ev, felev)` és `(idoszak_id, attase_id)`. A `kimarad` logikai oszlop alapértéke `false`. A `mutatok` típusa `$type<ErtekelesMutatok>()`, a típust a 2. feladat adja, ezért itt egyelőre `import type` nélkül `unknown`, a 2. feladat cseréli.

- [ ] **Step 6: Generáld és próbáld ki a migrációt**

Run:
```bash
npx drizzle-kit generate --name ertekeles
export ERT_DB="${TMPDIR:-/tmp}/tet-ert-teszt.db"; rm -f "$ERT_DB" "$ERT_DB-wal" "$ERT_DB-shm"
sqlite3 -readonly data/tet.db ".backup '$ERT_DB'"
DATABASE_URL="$ERT_DB" npx drizzle-kit migrate
sqlite3 "$ERT_DB" ".tables" | tr -s ' ' '\n' | grep -E '^(ertekelesi_idoszak|attase_ertekeles|szempont_minosites)$' | wc -l
sqlite3 "$ERT_DB" "insert into ertekelesi_idoszak (id, ev, felev, statusz) values ('x', 2026, 3, 'nyitott');"
```
Expected: `drizzle/0014_ertekeles.sql` létrejön, a számláló `3`, az utolsó parancs `CHECK constraint failed` hibával leáll.

- [ ] **Step 7: Vedd fel a tesztadatbázist a `.gitignore`-ba, ellenőrizz és commitolj**

Add hozzá a `data/tet-ertekeles-teszt.db` sort. Run: `npx tsc --noEmit`, `git status --short data/tet.db` (üres kimenet), majd `rm scripts/_ert-idoszak.ts`.

```bash
git add lib/datum.ts lib/ertekeles-szotar.ts lib/ertekeles-idoszak.ts db/schema drizzle .gitignore
git commit -m "feat(monitoring): értékelési szótár, félévek és adatbázis-séma"
```

---

### Task 2: Automatikus mutatók

**Files:**
- Create: `lib/ertekeles-mutatok.ts`
- Modify: `db/schema/ertekeles.ts` (a `mutatok` típusa)
- Test: `scripts/_ert-mutatok.ts`

**Interfaces:**
- Consumes: `Felev`, `felevNapok`, `naptariNap`, `KATEGORIAK`, `BLOKK_KULCSOK`
- Produces:

```ts
export interface JelentesBemenet { id: string; targy: string; kategoria: string; createdAt: Date; intezkedes: boolean }
export interface TicketBemenet { id: string; targy: string; createdAt: Date; hatarido: string | null; lezart: boolean; elsoAttaseUzenet: Date | null }
export interface ProfilBemenet { orszagKod: string; mentettBlokk: number; rendezvenyDb: number; updatedAt: Date }
export interface MutatoBemenet {
  felev: Felev; most: Date; jelentesek: JelentesBemenet[]; elozoFelevJelentesDb: number;
  tickets: TicketBemenet[]; vezetettOrszagok: string[]; profilok: ProfilBemenet[];
  halozat: { szunetMedian: number | null; valaszMedian: number | null };
}
export type HataridoBesorolas = 'hataridore' | 'kesett' | 'lejart' | 'nem_szamit';
export interface JelentesBizonyitek { id: string; targy: string; kategoria: string; datum: string; intezkedes: boolean }
export interface TicketBizonyitek { id: string; targy: string; hatarido: string | null; besorolas: HataridoBesorolas | null; elsoValasz: string | null }
export interface ErtekelesMutatok {
  verzio: 1; szamitvaAt: string;
  tajekoztatas: { jelentesDb: number; elozoFelevDb: number; lefedettTema: number; temaOsszes: number; leghosszabbSzunetNap: number; halozatiSzunetMedian: number | null; intezkedesDb: number; jelentesek: JelentesBizonyitek[] };
  orszagismeret: { vezetettDb: number; kitoltottBlokk: number; osszesBlokk: number; utolsoMentes: string | null; rendezvenyDb: number };
  kapcsolatepites: { rendezvenyBeszamoloDb: number; partnerkeresesDb: number; reszveteliLehetosegDb: number; jelentesek: JelentesBizonyitek[] };
  egyuttmukodes: { ticketDb: number; elsoValaszMedianNap: number | null; halozatiValaszMedianNap: number | null; valaszNelkulDb: number; hataridosDb: number; hataridoreDb: number; kesettDb: number; lejartValaszNelkulDb: number; atlagKesesNap: number | null; ticketek: TicketBizonyitek[] };
}
export function munkanapokKozott(tol: Date, ig: Date): number;
export function medianErtek(v: readonly number[]): number | null;
export function leghosszabbSzunet(napok: readonly string[], elsoNap: string, vegNap: string): number;
export function hataridoBesorolas(t: Pick<TicketBemenet, 'hatarido' | 'lezart' | 'elsoAttaseUzenet'>, ma: string): HataridoBesorolas;
export function halozatiMedianok(attasek: readonly Pick<MutatoBemenet, 'jelentesek' | 'tickets'>[], felev: Felev, most: Date): { szunetMedian: number | null; valaszMedian: number | null };
export function szamolMutatok(b: MutatoBemenet): ErtekelesMutatok;
```

- [ ] **Step 1: Írd meg a tesztet (`scripts/_ert-mutatok.ts`)**

```ts
import assert from 'node:assert/strict';
import { halozatiMedianok, hataridoBesorolas, leghosszabbSzunet, medianErtek, munkanapokKozott, szamolMutatok, type MutatoBemenet, type TicketBemenet } from '../lib/ertekeles-mutatok';

const d = (s: string) => new Date(s);
assert.equal(munkanapokKozott(d('2026-11-13T11:00:00Z'), d('2026-11-16T11:00:00Z')), 1);
assert.equal(munkanapokKozott(d('2026-11-16T09:00:00Z'), d('2026-11-16T21:00:00Z')), 0.5);
assert.equal(munkanapokKozott(d('2026-11-14T10:00:00Z'), d('2026-11-15T10:00:00Z')), 0);
assert.equal(medianErtek([1, 3, 2]), 2);
assert.equal(medianErtek([1, 2, 3, 4]), 2.5);
assert.equal(medianErtek([]), null);
assert.equal(leghosszabbSzunet([], '2026-01-01', '2026-06-30'), 180);
assert.equal(leghosszabbSzunet(['2026-03-01'], '2026-01-01', '2026-06-30'), 121);

const hb = (hatarido: string, elso: string | null, lezart: boolean, ma: string) =>
  hataridoBesorolas({ hatarido, lezart, elsoAttaseUzenet: elso ? d(elso) : null }, ma);
assert.equal(hb('2026-03-10', '2026-03-10T22:30:00Z', true, '2026-04-01'), 'hataridore');
assert.equal(hb('2026-03-10', '2026-03-10T23:30:00Z', true, '2026-04-01'), 'kesett');
assert.equal(hb('2026-03-10', null, false, '2026-03-11'), 'lejart');
assert.equal(hb('2026-03-10', null, false, '2026-03-10'), 'nem_szamit');
assert.equal(hb('2026-03-10', null, true, '2026-04-01'), 'nem_szamit');

const j = (id: string, kategoria: string, nap: string, intezkedes = false) => ({ id, targy: id, kategoria, createdAt: d(`${nap}T10:00:00Z`), intezkedes });
const t = (id: string, createdAt: string, hatarido: string | null, elso: string | null, lezart = false): TicketBemenet =>
  ({ id, targy: id, createdAt: d(createdAt), hatarido, lezart, elsoAttaseUzenet: elso ? d(elso) : null });
const alap: MutatoBemenet = {
  felev: { ev: 2026, felev: 1 }, most: d('2026-07-05T10:00:00Z'), elozoFelevJelentesDb: 13,
  jelentesek: [j('r1', 'finanszirozas', '2026-02-01', true), j('r2', 'rendezveny', '2026-04-01'), j('r3', 'egyuttmukodes', '2026-04-02'), j('r4', 'palyazat', '2026-04-03')],
  tickets: [
    t('t1', '2026-03-02T09:00:00Z', '2026-03-10', '2026-03-03T09:00:00Z', true),
    t('t2', '2026-03-02T09:00:00Z', '2026-03-04', '2026-03-06T09:00:00Z', true),
    t('t3', '2026-05-04T09:00:00Z', '2026-05-10', null),
    t('t4', '2026-06-29T09:00:00Z', '2026-07-20', '2026-06-30T09:00:00Z'),
    t('t5', '2025-12-15T09:00:00Z', '2026-01-10', '2026-01-05T09:00:00Z', true),
  ],
  vezetettOrszagok: ['ES', 'PT'],
  profilok: [
    { orszagKod: 'ES', mentettBlokk: 9, rendezvenyDb: 3, updatedAt: d('2026-04-17T10:00:00Z') },
    { orszagKod: 'PT', mentettBlokk: 4, rendezvenyDb: 1, updatedAt: d('2026-03-01T10:00:00Z') },
  ],
  halozat: { szunetMedian: 21, valaszMedian: 2 },
};
const m = szamolMutatok(alap);
assert.equal(m.tajekoztatas.jelentesDb, 4);
assert.equal(m.tajekoztatas.lefedettTema, 4);
assert.equal(m.tajekoztatas.temaOsszes, 7);
assert.equal(m.tajekoztatas.leghosszabbSzunetNap, 88);
assert.equal(m.tajekoztatas.intezkedesDb, 1);
assert.deepEqual([m.kapcsolatepites.rendezvenyBeszamoloDb, m.kapcsolatepites.partnerkeresesDb, m.kapcsolatepites.reszveteliLehetosegDb], [1, 1, 1]);
assert.deepEqual([m.orszagismeret.kitoltottBlokk, m.orszagismeret.osszesBlokk, m.orszagismeret.rendezvenyDb], [13, 18, 4]);
assert.equal(m.orszagismeret.utolsoMentes, '2026-04-17T10:00:00.000Z');
assert.equal(m.egyuttmukodes.ticketDb, 4);
assert.equal(m.egyuttmukodes.elsoValaszMedianNap, 1);
assert.equal(m.egyuttmukodes.valaszNelkulDb, 1);
assert.deepEqual([m.egyuttmukodes.hataridosDb, m.egyuttmukodes.hataridoreDb, m.egyuttmukodes.kesettDb, m.egyuttmukodes.lejartValaszNelkulDb], [4, 2, 1, 1]);
assert.equal(m.egyuttmukodes.atlagKesesNap, 2);

const ures = szamolMutatok({ ...alap, jelentesek: [], tickets: [], vezetettOrszagok: [], profilok: [], elozoFelevJelentesDb: 0 });
assert.equal(ures.tajekoztatas.leghosszabbSzunetNap, 180);
assert.equal(ures.orszagismeret.osszesBlokk, 0);
assert.equal(ures.orszagismeret.utolsoMentes, null);
assert.equal(ures.egyuttmukodes.elsoValaszMedianNap, null);
assert.equal(ures.egyuttmukodes.atlagKesesNap, null);
assert.ok(!JSON.stringify(ures).includes('NaN'));

const futo = szamolMutatok({ ...alap, most: d('2026-03-01T10:00:00Z'), jelentesek: [], tickets: [] });
assert.equal(futo.tajekoztatas.leghosszabbSzunetNap, 59);

const h = halozatiMedianok([{ jelentesek: alap.jelentesek, tickets: alap.tickets }, { jelentesek: [], tickets: [] }], alap.felev, alap.most);
assert.equal(h.szunetMedian, 134);
assert.equal(h.valaszMedian, 1);
console.log('OK');
```

A `t4` az időszakban nyílt, de határideje kívül esik, ezért a `ticketDb`-be számít, a `hataridosDb`-be nem. A `t5` fordítva: határideje az időszakba esik, de korábban nyílt. Az `elsoValaszMedianNap` a `t1`, `t2`, `t4` értékeiből (1, 4, 1) a medián, azaz 1.

- [ ] **Step 2: Futtasd, és ellenőrizd, hogy elbukik**

Run: `npx tsx scripts/_ert-mutatok.ts`
Expected: FAIL, nem található a modul.

- [ ] **Step 3: Valósítsd meg a `lib/ertekeles-mutatok.ts`-t**

A `munkanapokKozott` budapesti naptári naponként halad, hétfőtől péntekig a nap átfedő hányadát adja össze, az eredményt két tizedesre kerekíti. A medián és az átlagos késés egy tizedesre kerekül. Az időszak záró napja `min(utolsoNap, naptariNap(most))`. A válaszidő-kohorsz az időszakban nyitott ticket, a határidő-kohorsz a `felevNapok` közé eső `hatarido`. A `valaszNelkulDb` a kohorsz nem lezárt, attasé-üzenet nélküli ticketjeit számolja. A `hataridosDb` a `hataridoreDb + kesettDb + lejartValaszNelkulDb` összege, a `nem_szamit` besorolás nem tartozik bele. A bizonyítéklisták dátum szerint csökkenő sorrendűek. Végül a `db/schema/ertekeles.ts`-ben a `mutatok` kapja meg a `$type<ErtekelesMutatok>()` típust.

- [ ] **Step 4: Futtasd a tesztet**

Run: `npx tsx scripts/_ert-mutatok.ts`
Expected: `OK`

- [ ] **Step 5: Ellenőrizz és commitolj**

Run: `npx tsc --noEmit`, majd `rm scripts/_ert-mutatok.ts`.

```bash
git add lib/ertekeles-mutatok.ts db/schema/ertekeles.ts
git commit -m "feat(monitoring): automatikus mutatók és határidő-besorolás"
```

---

### Task 3: Összesítés, URL-szűrők, űrlap-validálás

**Files:**
- Create: `lib/ertekeles-osszesites.ts`, `lib/ertekeles-szuro.ts`, `lib/ertekeles-validacio.ts`
- Test: `scripts/_ert-logika.ts`

**Interfaces:**
- Consumes: Task 1 szótár és félév-típusok, `orszagRegio`, `ORSZAG_REGIOK`, `huOsszevet`, `ParseResult`, `mezo`, `SearchParams`
- Produces, `lib/ertekeles-szuro.ts`:

```ts
export interface ErtekelesSzuro { felev: FelevSzam | null; regio?: RegioKulcs; orszag?: string; attase?: string; szempont?: SzempontKulcs; minosites?: Fokozat }
export function szuroFromSearchParams(sp: SearchParams): ErtekelesSzuro;
export function szuroUrl(szuro: ErtekelesSzuro, alap?: string): string; // alap: '/monitoring'
```

- Produces, `lib/ertekeles-osszesites.ts`:

```ts
export type Valtozas = 'javult' | 'romlott' | 'azonos' | 'uj';
export type MunkalapFul = SzempontKulcs | 'ossz';
export interface ErtekelesSor {
  ertekelesId: string; attaseId: string; nev: string; szekhelyKod: string; varos: string | null;
  orszagok: RogzitettOrszag[]; kimarad: boolean; kimaradasOka: string | null;
  fokozatok: Partial<Record<SzempontKulcs, Fokozat>>; osszFokozat: OsszFokozat | null; valtozas: Valtozas | null;
}
export interface Osszesito { kesz: number; osszes: number; megoszlas: Record<OsszFokozat, number>; javult: number; romlott: number }
export function automatikusOrszagismeret(orszagok: readonly RogzitettOrszag[]): boolean;
export function hatekonyFokozatok(fokozatok: ErtekelesSor['fokozatok'], orszagok: readonly RogzitettOrszag[]): ErtekelesSor['fokozatok'];
export function valtozasSzamol(aktualis: OsszFokozat | null, elozo: OsszFokozat | null): Valtozas | null;
export function haladas(sor: ErtekelesSor): { kesz: number; osszes: number };
export function teljesE(sor: ErtekelesSor): boolean;
export function szurSorok(sorok: readonly ErtekelesSor[], szuro: ErtekelesSzuro): ErtekelesSor[];
export function osszesit(sorok: readonly ErtekelesSor[]): Osszesito;
export function regionkent(sorok: readonly ErtekelesSor[]): { regio: RegioKulcs; cimke: string; sorok: ErtekelesSor[] }[];
export function hianyzoAttasek(sorok: readonly ErtekelesSor[]): string[];
export function kovetkezoFul(aktiv: MunkalapFul, orszagok: readonly RogzitettOrszag[]): MunkalapFul;
```

- Produces, `lib/ertekeles-validacio.ts`:

```ts
export interface SzempontInput { szempont: SzempontKulcs; fokozat: Fokozat; indoklas: string | null; verzio: number | null }
export interface OsszInput { fokozat: OsszFokozat; indoklas: string; fejlesztesiCel: string | null; verzio: number | null }
export function parseSzempontForm(fd: FormData): ParseResult<SzempontInput>;
export function parseOsszForm(fd: FormData): ParseResult<OsszInput>;
export function parseKihagyasForm(fd: FormData): ParseResult<{ ok: string }>;
```

- [ ] **Step 1: Írd meg a tesztet (`scripts/_ert-logika.ts`)**

```ts
import assert from 'node:assert/strict';
import { automatikusOrszagismeret, haladas, hatekonyFokozatok, hianyzoAttasek, kovetkezoFul, osszesit, regionkent, szurSorok, teljesE, valtozasSzamol, type ErtekelesSor } from '../lib/ertekeles-osszesites';
import { szuroFromSearchParams, szuroUrl } from '../lib/ertekeles-szuro';
import { parseKihagyasForm, parseOsszForm, parseSzempontForm } from '../lib/ertekeles-validacio';

const vezeto = [{ kod: 'ES', szekhely: true, vezeto: true }];
const nemVezeto = [{ kod: 'ES', szekhely: true, vezeto: false }, { kod: 'PT', szekhely: false, vezeto: false }];
const sor = (r: Partial<ErtekelesSor>): ErtekelesSor => ({
  ertekelesId: 'e', attaseId: 'a', nev: 'Teszt', szekhelyKod: 'ES', varos: 'Madrid', orszagok: vezeto, kimarad: false, kimaradasOka: null,
  fokozatok: {}, osszFokozat: null, valtozas: null, ...r,
});
const teljes = { tajekoztatas: 3, orszagismeret: 3, kapcsolatepites: 3, eredmenyek: 2, egyuttmukodes: 4 } as const;

assert.equal(automatikusOrszagismeret(vezeto), false);
assert.equal(automatikusOrszagismeret(nemVezeto), true);
assert.equal(hatekonyFokozatok({ tajekoztatas: 3 }, nemVezeto).orszagismeret, 0);
assert.equal(hatekonyFokozatok({ orszagismeret: 3 }, vezeto).orszagismeret, 3);
assert.equal(valtozasSzamol(3, 2), 'javult');
assert.equal(valtozasSzamol(2, 3), 'romlott');
assert.equal(valtozasSzamol(3, 3), 'azonos');
assert.equal(valtozasSzamol(3, null), 'uj');
assert.equal(valtozasSzamol(null, 3), null);
assert.deepEqual(haladas(sor({ fokozatok: { tajekoztatas: 3, orszagismeret: 0 } })), { kesz: 2, osszes: 5 });
assert.equal(teljesE(sor({ fokozatok: teljes })), false);
assert.equal(teljesE(sor({ fokozatok: teljes, osszFokozat: 3 })), true);

const a = sor({ attaseId: 'a', nev: 'Árva Anna', fokozatok: teljes, osszFokozat: 3, valtozas: 'javult' });
const b = sor({ attaseId: 'b', nev: 'Bán Béla', szekhelyKod: 'SG', orszagok: [{ kod: 'SG', szekhely: true, vezeto: true }, { kod: 'MY', szekhely: false, vezeto: true }], fokozatok: { ...teljes, eredmenyek: 4 }, osszFokozat: 2, valtozas: 'romlott' });
const c = sor({ attaseId: 'c', nev: 'Cser Cili', kimarad: true, kimaradasOka: 'Új poszt' });
const d = sor({ attaseId: 'd', nev: 'Dér Dóra', fokozatok: { tajekoztatas: 3 } });
assert.deepEqual(osszesit([a, b, c, d]), { kesz: 2, osszes: 3, megoszlas: { 4: 0, 3: 1, 2: 1, 1: 0 }, javult: 1, romlott: 1 });
assert.deepEqual(hianyzoAttasek([a, b, c, d]), ['Dér Dóra']);
assert.deepEqual(regionkent([b, a]).map((r) => r.regio), ['europa', 'azsia']);
const ids = (s: ErtekelesSor[]) => s.map((x) => x.attaseId);
assert.deepEqual(ids(szurSorok([a, b], { felev: 1, regio: 'azsia' })), ['b']);
assert.deepEqual(ids(szurSorok([a, b], { felev: 1, orszag: 'MY' })), ['b']);
assert.deepEqual(ids(szurSorok([a, b], { felev: 1, attase: 'a' })), ['a']);
assert.deepEqual(ids(szurSorok([a, b], { felev: 1, szempont: 'eredmenyek', minosites: 4 })), ['b']);
assert.deepEqual(ids(szurSorok([a, b], { felev: 1, minosites: 3 })), ['a']);
assert.deepEqual(ids(szurSorok([a, b], { felev: 1, szempont: 'eredmenyek' })), ['a', 'b']);
assert.equal(kovetkezoFul('kapcsolatepites', vezeto), 'eredmenyek');
assert.equal(kovetkezoFul('egyuttmukodes', vezeto), 'ossz');
assert.equal(kovetkezoFul('tajekoztatas', nemVezeto), 'kapcsolatepites');

assert.deepEqual(szuroFromSearchParams({ felev: '2', regio: 'europa', orszag: 'ES', attase: 'abc', szempont: 'eredmenyek', minosites: '2' }),
  { felev: 2, regio: 'europa', orszag: 'ES', attase: 'abc', szempont: 'eredmenyek', minosites: 2 });
assert.deepEqual(szuroFromSearchParams({ felev: '3', regio: 'x', orszag: 'xx', szempont: 'y', minosites: '9' }), { felev: null });
assert.deepEqual(szuroFromSearchParams({ minosites: '0' }), { felev: null });
assert.equal(szuroFromSearchParams({ szempont: 'orszagismeret', minosites: '0' }).minosites, 0);
assert.equal(szuroUrl({ felev: 1, regio: 'europa' }), '/monitoring?felev=1&regio=europa');
assert.equal(szuroUrl({ felev: null }, '/monitoring/abc'), '/monitoring/abc');

const fd = (o: Record<string, string>) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v); return f; };
const hiba = (r: { ok: boolean; errors?: Record<string, string> }, k: string) => (r.ok ? undefined : r.errors?.[k]);
const sz = (fokozat: string, indoklas: string) => parseSzempontForm(fd({ szempont: 'eredmenyek', fokozat, indoklas, verzio: '' }));
const jo = sz('3', '');
assert.ok(jo.ok && jo.data.indoklas === null && jo.data.verzio === null);
assert.equal(hiba(sz('2', '  '), 'indoklas'), 'Az indoklás kötelező ennél a fokozatnál.');
assert.equal(hiba(sz('0', ''), 'indoklas'), 'Az indoklás kötelező ennél a fokozatnál.');
assert.equal(hiba(sz('5', 'x'), 'fokozat'), 'Válassz fokozatot.');
assert.equal(hiba(sz('2', 'x'.repeat(2001)), 'indoklas'), 'Az indoklás legfeljebb 2000 karakter lehet.');
const o = (fokozat: string, indoklas: string, fejlesztesiCel: string) => parseOsszForm(fd({ fokozat, indoklas, fejlesztesiCel, verzio: '' }));
assert.equal(hiba(o('0', 'x', ''), 'fokozat'), 'Válassz fokozatot.');
assert.equal(hiba(o('3', '', ''), 'indoklas'), 'Az indoklás kötelező.');
assert.equal(hiba(o('2', 'x', ''), 'fejlesztesiCel'), 'A fejlesztési cél kötelező ennél az összminősítésnél.');
const ossz = o('3', 'x', '');
assert.ok(ossz.ok && ossz.data.fejlesztesiCel === null);
assert.equal(hiba(parseKihagyasForm(fd({ kimaradasOka: ' ' })), 'kimaradasOka'), 'A kihagyás indoklása kötelező.');
console.log('OK');
```

- [ ] **Step 2: Futtasd, és ellenőrizd, hogy elbukik**

Run: `npx tsx scripts/_ert-logika.ts`
Expected: FAIL, nem található a modul.

- [ ] **Step 3: Valósítsd meg a három fájlt**

Az `osszesit` a kihagyott sorokat figyelmen kívül hagyja, a `kesz` a teljes sorok száma, a `megoszlas` az összminősítéssel rendelkező sorokat számolja. A `regionkent` az `ORSZAG_REGIOK` sorrendjét követi, üres régiót kihagy, a sorokat `huOsszevet` szerint rendezi. A `verzio` mező üres értéke `null`, a nem pozitív egész `{ form: 'Hibás kérés.' }` hibát ad. Az `orszag` szűrő csak `orszagByKod`-dal ismert kódot fogad el. A `minosites=0` csak `szempont` mellett érvényes. A `szuroFromSearchParams` eredményébe csak az érvényes kulcsok kerülnek, `undefined` értékű kulcs nem.

- [ ] **Step 4: Futtasd a tesztet**

Run: `npx tsx scripts/_ert-logika.ts`
Expected: `OK`

- [ ] **Step 5: Ellenőrizz és commitolj**

Run: `npx tsc --noEmit`, majd `rm scripts/_ert-logika.ts`.

```bash
git add lib/ertekeles-osszesites.ts lib/ertekeles-szuro.ts lib/ertekeles-validacio.ts
git commit -m "feat(monitoring): összesítés, URL-szűrők és űrlap-validálás"
```

---

### Task 4: Lekérdezések és félév-életciklus

**Files:**
- Create: `db/queries/ertekeles.ts`
- Modify: `db/queries/orszagprofil.ts` (`listProfilMutatok`)
- Test: `scripts/_ert-queries.ts`

**Interfaces:**
- Consumes: Task 1–3 minden típusa, `listCimzettJeloltek`, `listOrszagokFelhasznalonkent`
- Produces, `db/queries/orszagprofil.ts`: `listProfilMutatok(kodok: readonly string[], ev: number): ProfilBemenet[]`
- Produces, `db/queries/ertekeles.ts`:

```ts
export interface IdoszakSor { id: string; ev: number; felev: FelevSzam; statusz: 'nyitott' | 'lezart'; lezarvaAt: Date | null; lezartaNev: string | null }
export interface HalozatNezet { idoszak: IdoszakSor | null; sorok: ErtekelesSor[] }
export interface SzempontMinosites { fokozat: Fokozat; indoklas: string | null; ertekeloNev: string; updatedAt: Date; verzio: number }
export interface ElozmenySor { felev: Felev; fokozatok: ErtekelesSor['fokozatok']; osszFokozat: OsszFokozat | null }
export interface AdatlapNezet {
  idoszak: IdoszakSor; sor: ErtekelesSor; osszIndoklas: string | null; fejlesztesiCel: string | null;
  ertekeloNev: string | null; minositveAt: Date | null; osszVerzio: number;
  minositesek: Partial<Record<SzempontKulcs, SzempontMinosites>>;
  mutatok: ErtekelesMutatok | null; elozmeny: ElozmenySor[];
  letezoJelentesek: string[]; letezoTicketek: string[];
}
export type MentesEredmeny = 'ok' | 'nincs' | 'lezart' | 'kihagyott' | 'automatikus' | 'elavult' | 'hianyos';
export type LezarasEredmeny = { eredmeny: 'ok' | 'nincs' | 'mar_lezart' | 'nem_ert_veget' } | { eredmeny: 'hianyos'; hianyzok: string[] };

export function getIdoszak(f: Felev): IdoszakSor | null;
export function listLezartFelevek(ev: number): FelevSzam[];
export function letrehozIdoszak(f: Felev): string;
export function megnyitIdoszak(f: Felev, ma: string): 'ok' | 'nem_nyithato' | 'mar_letezik';
export function listHalozat(f: Felev, most?: Date): HalozatNezet;
export function getAdatlap(attaseId: string, f: Felev, most?: Date): AdatlapNezet | null;
export function attaseIsmert(attaseId: string): boolean;
export function mentSzempont(ertekelesId: string, input: SzempontInput, ertekeloNev: string, most?: Date): { eredmeny: MentesEredmeny; verzio?: number };
export function mentOssz(ertekelesId: string, input: OsszInput, ertekeloNev: string, most?: Date): { eredmeny: MentesEredmeny; verzio?: number };
export function kihagyAttase(ertekelesId: string, ok: string | null): 'ok' | 'nincs' | 'lezart';
export function lezarIdoszak(f: Felev, lezaroNev: string, most?: Date): LezarasEredmeny;
export function ujranyitIdoszak(f: Felev): 'ok' | 'nincs' | 'nem_lezart';
```

- [ ] **Step 1: Írd meg a tesztet (`scripts/_ert-queries.ts`)**

A script a fájl elején törli az összes `attase` szerepkörű felhasználót, majd három segédet definiál: `ujAttase(id, nev, orszagok)` közvetlen inserttel, `jelentes(szerzoId, nap, id)` és `teljesMinosites(ertekelesId, attaseId)`, amely a még nem mentett szempontokat (`fokozat: 3`, `verzio: null`) és az összminősítést (`fokozat: 3`, `indoklas: 'x'`) menti. A már mentett szempontot és a nem vezető attasé `orszagismeret` szempontját kihagyja.

```ts
const most = new Date('2026-11-18T10:00:00Z');
const f1 = { ev: 2026, felev: 1 } as const;
ujAttase('a', 'Árva Anna', [{ kod: 'ES', szekhely: true, vezeto: true }]);
ujAttase('b', 'Bán Béla', [{ kod: 'ES', szekhely: true, vezeto: false }]);
ujAttase('d', 'Dér Dóra', [{ kod: 'PL', szekhely: true, vezeto: true }]);

assert.equal(megnyitIdoszak({ ev: 2025, felev: 2 }, '2026-11-18'), 'nem_nyithato');
assert.equal(megnyitIdoszak(f1, '2026-11-18'), 'ok');
assert.equal(megnyitIdoszak(f1, '2026-11-18'), 'mar_letezik');
const sorId = (id: string, f = f1) => listHalozat(f, most).sorok.find((s) => s.attaseId === id)!.ertekelesId;
assert.equal(listHalozat(f1, most).sorok.find((s) => s.attaseId === 'b')!.fokozatok.orszagismeret, 0);

// Verzióütközés (Review Focus 3)
const e = sorId('a');
const elso = mentSzempont(e, { szempont: 'tajekoztatas', fokozat: 3, indoklas: null, verzio: null }, 'Admin', most);
assert.equal(elso.eredmeny, 'ok');
assert.equal(mentSzempont(e, { szempont: 'tajekoztatas', fokozat: 2, indoklas: 'x', verzio: null }, 'Admin', most).eredmeny, 'elavult');
assert.equal(mentSzempont(e, { szempont: 'tajekoztatas', fokozat: 2, indoklas: 'x', verzio: elso.verzio! - 1 }, 'Admin', most).eredmeny, 'elavult');
assert.equal(mentSzempont(e, { szempont: 'tajekoztatas', fokozat: 3, indoklas: null, verzio: elso.verzio! }, 'Admin', most).eredmeny, 'ok');
assert.equal(mentSzempont(sorId('b'), { szempont: 'orszagismeret', fokozat: 3, indoklas: null, verzio: null }, 'Admin', most).eredmeny, 'automatikus');
assert.equal(mentOssz(e, { fokozat: 3, indoklas: 'x', fejlesztesiCel: null, verzio: null }, 'Admin', most).eredmeny, 'hianyos');

// Lezárás hiányos adattal, kihagyás, törölt attasé (Review Focus 4)
const hianyos = lezarIdoszak(f1, 'Admin', most);
assert.equal(hianyos.eredmeny, 'hianyos');
db.delete(user).where(eq(user.id, 'd')).run();
teljesMinosites(sorId('a'), 'a');
assert.equal(kihagyAttase(sorId('b'), 'Új poszt'), 'ok');
assert.equal(mentSzempont(sorId('b'), { szempont: 'tajekoztatas', fokozat: 3, indoklas: null, verzio: null }, 'Admin', most).eredmeny, 'kihagyott');
jelentes('a', '2026-03-01', 'r1');
jelentes('a', '2026-03-02', 'r2');
assert.equal(lezarIdoszak({ ev: 2026, felev: 2 }, 'Admin', most).eredmeny, 'nincs');
assert.equal(lezarIdoszak(f1, 'Admin', most).eredmeny, 'ok');
assert.deepEqual(listHalozat(f1, most).sorok.map((s) => s.attaseId).sort(), ['a', 'b']);
assert.equal(listHalozat(f1, most).sorok.find((s) => s.attaseId === 'a')!.valtozas, 'uj');
assert.equal(lezarIdoszak(f1, 'Admin', most).eredmeny, 'mar_lezart');

// Rögzített mutatók (Review Focus 5)
const zart = getAdatlap('a', f1, most)!;
assert.equal(zart.mutatok!.tajekoztatas.jelentesDb, 2);
jelentes('a', '2026-03-03', 'r3');
db.delete(riport).where(eq(riport.id, 'r1')).run();
const utana = getAdatlap('a', f1, most)!;
assert.equal(utana.mutatok!.tajekoztatas.jelentesDb, 2);
assert.deepEqual(utana.letezoJelentesek, ['r2']);
assert.equal(mentSzempont(sorId('a'), { szempont: 'tajekoztatas', fokozat: 2, indoklas: 'x', verzio: null }, 'Admin', most).eredmeny, 'lezart');

// Újranyitás
assert.equal(ujranyitIdoszak(f1), 'ok');
assert.equal(lezarIdoszak(f1, 'Admin', new Date('2026-11-19T10:00:00Z')).eredmeny, 'ok');
assert.equal(getAdatlap('a', f1, most)!.mutatok!.szamitvaAt, zart.mutatok!.szamitvaAt);

// Vezetőváltás nyitott félévben (Review Focus 4)
const f2 = { ev: 2026, felev: 2 } as const;
assert.equal(megnyitIdoszak(f2, '2026-11-18'), 'ok');
db.update(attaseOrszag).set({ vezeto: false }).where(eq(attaseOrszag.userId, 'a')).run();
db.update(attaseOrszag).set({ vezeto: true }).where(eq(attaseOrszag.userId, 'b')).run();
assert.equal(listHalozat(f2, most).sorok.find((s) => s.attaseId === 'b')!.fokozatok.orszagismeret, undefined);
assert.equal(mentSzempont(sorId('b', f2), { szempont: 'orszagismeret', fokozat: 3, indoklas: null, verzio: null }, 'Admin', most).eredmeny, 'ok');
console.log('OK');
```

- [ ] **Step 2: Futtasd, és ellenőrizd, hogy elbukik**

Run: `export ERT_DB="${TMPDIR:-/tmp}/tet-ert-teszt.db"; DATABASE_URL="$ERT_DB" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_ert-queries.ts`
Expected: FAIL, nem található a `db/queries/ertekeles` modul. Az adatbázist előtte az „Eldobható környezetek” szerint hozd létre, és minden futás előtt hozd létre újra.

- [ ] **Step 3: Valósítsd meg a lekérdezéseket**

- Minden írás `db.transaction(fn, { behavior: 'immediate' })`-ben fut.
- Az élő attaséhalmaz a `listCimzettJeloltek()` és a `listOrszagokFelhasznalonkent()` eredményéből áll össze.
- A `listHalozat` nyitott félévben előbb pótolja a hiányzó sorokat, de csak ha `ma <= utolsoNap`. Nyitott félévben az élő hozzárendelést, lezártban a pillanatképet mutatja.
- A nyitott félévben megjelenő `fokozatok` a `hatekonyFokozatok` eredménye.
- A `getAdatlap` a rögzített `mutatok`-at adja, ha van, különben élőben számol. Az `elozmeny` az attasé legutóbbi legfeljebb négy lezárt féléve időrendben. A `letezoJelentesek` és a `letezoTicketek` a mutatókban szereplő bizonyíték-id-k közül a még létezőket adja.
- A `lezarIdoszak` első lezáráskor (`mutatok` null) frissíti az aktív attasé pillanatképét, újralezáráskor nem. A nem vezető sorához `AUTOMATIKUS_ERTEKELO` névvel beszúrja a 0-s Országismeretet. A kihagyott sorhoz nem számol mutatót. A már nem aktív attasé hiányos sorát törli.
- A `valtozas` a legutóbbi korábbi, lezárt, nem kihagyott értékeléshez hasonlít.

- [ ] **Step 4: Futtasd a tesztet friss adatbázison**

Run: hozd létre újra az `$ERT_DB`-t, majd `DATABASE_URL="$ERT_DB" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_ert-queries.ts`
Expected: `OK`

- [ ] **Step 5: Ellenőrizz és commitolj**

Run: `npx tsc --noEmit`, `git status --short data/tet.db` (üres), majd `rm scripts/_ert-queries.ts`.

```bash
git add db/queries/ertekeles.ts db/queries/orszagprofil.ts
git commit -m "feat(monitoring): értékelési lekérdezések és félév-életciklus"
```

---

### Task 5: Kitalált tesztadatbázis

**Files:**
- Create: `scripts/demo-ertekeles.ts`

**Interfaces:**
- Consumes: `letrehozIdoszak`, `mentSzempont`, `mentOssz`, `kihagyAttase`, `lezarIdoszak`, `listHalozat`
- Produces: `data/tet-ertekeles-teszt.db`

| # | Név | Székhely | Regionális | Mintázat |
| --- | --- | --- | --- | --- |
| 01 | Bárdos Kata | Madrid, ES (vezető) | PT | `stabilEros` |
| 02 | Erdei Márk | Barcelona, ES (nem vezető) | | `javulo` |
| 03 | Fodor Lilla | Róma, IT | MT | `stabil` |
| 04 | Gál Bence | Hága, NL | BE, LU | `visszaeso` |
| 05 | Hegedűs Nóra | Stockholm, SE | NO, FI, DK | `lassu` |
| 06 | Jakab Tamás | Varsó, PL | | `javulo` |
| 07 | Kertész Anna | Canberra, AU (vezető) | NZ | `visszaeso` |
| 08 | Lukács Péter | Sydney, AU (nem vezető) | | `lehetoseg` |
| 09 | Mátyás Dóra | Szingapúr, SG | MY, ID | `lassu` |
| 10 | Novák Gergely | Hanoi, VN | | `stabil` |
| 11 | Papp Zsófia | Bangkok, TH | | `javulo` |
| 12 | Rácz Levente | Abu-Dzabi, AE | BH | `uj` |
| 13 | Szalai Emese | Nairobi, KE | | `kihagyott` |
| 14 | Takács Ádám | Mexikóváros, MX | | `lehetoseg` |
| 15 | Vass Réka | Buenos Aires, AR | CL, UY | `gyenge` |

A mintázatok a 2024/2, 2025/1, 2025/2, 2026/1 félévek fokozatai. Sorrend: tájékoztatás, országismeret, kapcsolatépítés, eredmények, együttműködés, majd `|` után az összminősítés.

| Mintázat | 2024/2 | 2025/1 | 2025/2 | 2026/1 |
| --- | --- | --- | --- | --- |
| `stabilEros` | 44334\|4 | 44334\|4 | 44334\|4 | 44334\|4 |
| `stabil` | 33333\|3 | 33333\|3 | 33333\|3 | 33333\|3 |
| `javulo` | 22222\|2 | 23223\|2 | 33223\|2 | 33334\|3 |
| `visszaeso` | 33333\|3 | 33333\|3 | 33333\|3 | 33322\|2 |
| `lassu` | 43332\|3 | 43332\|3 | 43332\|3 | 43331\|2 |
| `lehetoseg` | 33423\|3 | 33423\|3 | 33423\|3 | 33423\|3 |
| `uj` | nincs sor | nincs sor | nincs sor | 33203\|3 |
| `kihagyott` | 33333\|3 | 33333\|3 | kihagyva | 33333\|3 |
| `gyenge` | 22222\|2 | 22222\|2 | 22222\|2 | 12222\|1 |

**Generálási szabályok** (rögzített véletlenszám-mag: `20261118`):

| Forrás fokozata | 4 | 3 | 2 | 1 |
| --- | --- | --- | --- | --- |
| Jelentés félévente (tájékoztatás) | 14 | 10 | 6 | 3 |
| Lefedett kategória (tájékoztatás) | 7 | 5 | 3 | 2 |
| Intézkedés aránya (tájékoztatás) | 40% | 25% | 10% | 0% |
| Mentett blokk (országismeret) | 9 | 9 | 6 | 3 |
| Rendezvény a profilban (országismeret) | 8 | 6 | 3 | 1 |
| Első válasz munkanapban (együttműködés) | 0,5 | 1,5 | 4 | 8 |

Félévente attasénként 8 ticket, 7 napos határidővel, a válaszidő ±30% szórással. Együttműködés 1-es fokozatnál a ticketek 30%-a válasz nélkül marad.

- [ ] **Step 1: Írd meg a scriptet**

Felépítése, ebben a sorrendben:

1. `CEL = resolve('data/tet-ertekeles-teszt.db')`. Ha a `DATABASE_URL` be van állítva és másra mutat, hibával kilép, a `data/tet.db`-t nem írja. Utána `process.env.DATABASE_URL = CEL`.
2. Törli a célfájlt és a `-wal`, `-shm` társait, majd a `new Database('data/tet.db', { readonly: true }).backup(CEL)` hívással másol.
3. Lefuttatja a `drizzle-orm/better-sqlite3/migrator` `migrate`-jét a `drizzle` mappára.
4. Csak ezután, dinamikus `await import()`-tal tölti be a `../db` és a `../db/queries/ertekeles` modult.
5. Törli a `session` sorokat és az összes `attase` szerepkörű felhasználót.
6. Beszúrja a 15 attasét `teszt01@ertekeles.test` … `teszt15@ertekeles.test` címmel, `hashPassword('Teszt-Attase-2026!')` jelszóval.
7. Félévenként legenerálja a forrásadatokat, létrehozza az időszakot, ment, kihagy és lezár. A `most` a következő félév 8. napja 10:00 UTC.
8. Létrehozza a nyitott 2026/2 félévet a mai napig tartó adatokkal: az első 6 attasé teljes, a következő 3 két szemponttal részleges, a többi üres.
9. Önellenőrzés, hiba esetén nem nulla kilépési kóddal: a szempontoknál a 0–4, az összminősítésnél az 1–4 fokozat mind előfordul, a 2026/1 félévben a `javult`, `romlott`, `azonos`, `uj` változás mind megvan.

- [ ] **Step 2: Futtasd a scriptet**

Run: `NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-ertekeles.ts`
Expected: az önellenőrzés hibátlan, a kimenet utolsó sora `Kész: data/tet-ertekeles-teszt.db`.

- [ ] **Step 3: Ellenőrizd az adatbázist**

```bash
T=data/tet-ertekeles-teszt.db
sqlite3 "$T" "select count(*) from user where role='attase'; select count(*) from user where email like '%@demo.test'; select count(*) from session; select count(*), sum(statusz='lezart') from ertekelesi_idoszak;"
sqlite3 "$T" "select count(*) from attase_orszag where orszag_kod in ('AT','BD','BR','CA','CN','DE','DZ','FR','GB','GY','IE','IL','IN','JP','KP','KR','LK','MA','MR','MV','NP','PR','RU','SR','TN','US','VI');"
```
Expected: `15`, `0`, `0`, `5|4`, majd `0`.

- [ ] **Step 4: Ellenőrizd a védelmet és az ismételhetőséget**

Run:
```bash
DATABASE_URL=./data/tet.db NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-ertekeles.ts; echo "kilépés: $?"
git status --short data/tet.db
sqlite3 data/tet-ertekeles-teszt.db "select count(*), sum(fokozat) from szempont_minosites" > "${TMPDIR:-/tmp}/ert-1.txt"
NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-ertekeles.ts
sqlite3 data/tet-ertekeles-teszt.db "select count(*), sum(fokozat) from szempont_minosites" | diff - "${TMPDIR:-/tmp}/ert-1.txt"
```
Expected: az első futás nem nulla kóddal kilép, a `git status` üres, a `diff` nem talál eltérést.

- [ ] **Step 5: Ellenőrizz és commitolj**

Run: `npx tsc --noEmit`, `git status --short data/` (a tesztadatbázis nem jelenik meg).

```bash
git add scripts/demo-ertekeles.ts
git commit -m "feat(monitoring): kitalált tesztadatbázis az értékeléshez"
```

---

### Task 6: Hálózati nézet

**Files:**
- Modify: `app/(app)/monitoring/page.tsx` (teljes csere), `lib/navigacio.ts`
- Delete: `lib/data.ts`, `lib/score.ts`
- Create: `app/(app)/monitoring/actions.ts`, és az `app/(app)/monitoring/components/` alatt: `FokozatJelveny.tsx`, `ValtozasJelzes.tsx`, `FokozatJelmagyarazat.tsx`, `FelevMuveletGomb.tsx`, `AllapotSav.tsx`, `ErtekelesSzurok.tsx`, `OsszesitoKartyak.tsx`, `Hoterkep.tsx`

**Interfaces:**
- Consumes: `listHalozat`, `listLezartFelevek`, `megnyitIdoszak`, `lezarIdoszak`, `ujranyitIdoszak`, `alapFelev`, `szurSorok`, `osszesit`, `regionkent`, `hianyzoAttasek`, `szuroFromSearchParams`, `szuroUrl`
- Produces, `actions.ts`:

```ts
export async function megnyitFelevAction(ev: number, felev: number): Promise<MuveletState>;
export async function lezarFelevAction(ev: number, felev: number): Promise<MuveletState>;
export async function ujranyitFelevAction(ev: number, felev: number): Promise<MuveletState>;
```

- Produces, komponensek: `FokozatJelveny({ fokozat, rovid?: boolean })`, `ValtozasJelzes({ valtozas })`, `FokozatJelmagyarazat()`

- [ ] **Step 1: Frissítsd a navigációt és töröld a demóadatot**

`lib/navigacio.ts` `/monitoring` sora: `alcim: 'A TéT attasék félévi szakmai értékelése'`, `adminOnly: true`, `menu: { ikon: '◈', felirat: 'Monitoring és értékelés' }`. Töröld a `lib/data.ts` és a `lib/score.ts` fájlt.

- [ ] **Step 2: Írd meg az action-öket**

A bind-olt `ev` és `felev` futásidőben is ellenőrzött (`Number.isInteger(ev)`, `parseFelevSzam`). Hibaüzenetek: `nem_nyithato` → „Ez a félév nem nyitható meg.”, `nem_ert_veget` → „A félév még nem ért véget.”, `hianyos` → „Hiányzó minősítés: <nevek vesszővel>.”, `nincs` → „A félév nem található.”, `mar_lezart` és `mar_letezik` → siker. A lezáró neve `session.name`.

- [ ] **Step 3: Írd meg a komponenseket és az oldalt a spec 6.1. pontja szerint**

- Az év `getValasztottEv(aktualisEv())`, a félév `szuro.felev ?? alapFelev(ev, maiNaptariNap(), listLezartFelevek(ev))`.
- A szűrők opciói a félév soraiból származnak, a listában nem szereplő `attase` és `orszag` értéket az oldal eldobja.
- Az `osszesit` a szűrt sorokon fut, ezért a kártyák a szűrt halmazt mutatják.
- A `Hoterkep` Server Component a shadcn `Table`-ből. A név `Link` az `/monitoring/[attaseId]` címre, a szűrőkkel együtt (`szuroUrl`), `after:absolute after:inset-0`-val a teljes sor kattintható, a `<tr>` `relative`.
- A cella a rövid feliratot mutatja, a teljes név `sr-only`. Minősítés nélküli cella: `–`, `sr-only` „Nincs minősítve”. Nyitott félévben a név alatt `3 / 5`. Kihagyott sor: `colSpan`-nal „Nem értékelt: <ok>”.
- A régió sora `<th scope="rowgroup" colSpan={8}>`. A `szempont` szűrő a kiválasztott oszlop fejlécét és celláit kiemeli.
- A megoszlás sávja `role="img"`, az `aria-label` szövegesen sorolja a darabszámokat.
- Az `ErtekelesSzurok` kliens-komponens a `CimkesSelect`-tel, `__mind` „Mind” opcióval és `router.replace(szuroUrl(...), { scroll: false })` hívással `useTransition`-ben. A „Szűrők törlése” a félévet megtartja. A „Nem értékelhető” minősítés opció csak kiválasztott szempontnál látszik.
- A `FelevMuveletGomb` a `RiportTorles` mintájára `AlertDialog`-gal kér megerősítést lezárásnál és újranyitásnál. Megnyitásnál nincs megerősítés.
- A lezárás letiltott gombja mellett szövegesen áll az ok: „A félév még nem ért véget.” vagy „Hiányzó minősítés: <nevek>.”.

- [ ] **Step 4: Ellenőrizd a típusokat**

Run: `npx tsc --noEmit`
Expected: hiba nélkül.

- [ ] **Step 5: Ellenőrizd böngészőben a QA-környezetben**

| Lépés | Elvárt eredmény |
| --- | --- |
| Admin megnyitja a `/monitoring`-ot 2026-tal | A 2026/1 lezárt félév látszik, `15 / 15` értékelt attasé, régiónként csoportosítva |
| Régió: Amerika | 2 sor, a kártyák is 2 főre számolnak |
| Ország: MT | Csak Fodor Lilla |
| Szempont: Eredmények, Minősítés: Részben megfelel | Csak ezek az attasék |
| Félév: 2. félév | Nyitott állapot, `3 / 5` jellegű haladás, a lezárás letiltva, mellette az indok |
| Fejléc éve 2025, Félév: 2. | A kihagyott Szalai Emese sora „Nem értékelt” felirattal |
| Attaséval belépve `/monitoring` | 404, a menüpont nem látszik |
| 390 px széles ablak | Nincs vízszintes lapgörgetés, a tábla a saját dobozában görget |

- [ ] **Step 6: Commitolj**

```bash
git add -A app/\(app\)/monitoring lib/navigacio.ts lib/data.ts lib/score.ts
git commit -m "feat(monitoring): hálózati hőtérkép szűrőkkel és félév-műveletekkel"
```

---

### Task 7: Adatlap lezárt félévre

**Files:**
- Create: `lib/ertekeles-megjelenites.ts`, `app/(app)/monitoring/[attaseId]/page.tsx`, és a `components/` alatt: `AdatlapFejlec.tsx`, `FelevValaszto.tsx`, `Osszkep.tsx`, `IdosorMatrix.tsx`, `SzempontSorok.tsx`, `MutatoRacs.tsx`, `BizonyitekLista.tsx`
- Test: `scripts/_ert-megjelenites.ts`

**Interfaces:**
- Consumes: `getAdatlap`, `attaseIsmert`, `ErtekelesMutatok`, `AdatlapNezet`
- Produces, `lib/ertekeles-megjelenites.ts`:

```ts
export interface MutatoKartya { cimke: string; ertek: string; megjegyzes: string }
export function mutatoKartyak(szempont: SzempontKulcs, m: ErtekelesMutatok): MutatoKartya[];
export function kulcsMutato(szempont: SzempontKulcs, m: ErtekelesMutatok): string;
export function tizedes(v: number | null): string;
```

- Produces, komponensek: `AdatlapFejlec`, `MutatoRacs({ kartyak })`, `BizonyitekLista({ szempont, mutatok, letezoJelentesek, letezoTicketek })`

- [ ] **Step 1: Írd meg a tesztet (`scripts/_ert-megjelenites.ts`)**

```ts
import assert from 'node:assert/strict';
import { kulcsMutato, mutatoKartyak, tizedes } from '../lib/ertekeles-megjelenites';
import type { ErtekelesMutatok } from '../lib/ertekeles-mutatok';

const m: ErtekelesMutatok = {
  verzio: 1, szamitvaAt: '2026-07-08T10:00:00.000Z',
  tajekoztatas: { jelentesDb: 11, elozoFelevDb: 13, lefedettTema: 5, temaOsszes: 7, leghosszabbSzunetNap: 34, halozatiSzunetMedian: 21, intezkedesDb: 3, jelentesek: [] },
  orszagismeret: { vezetettDb: 1, kitoltottBlokk: 9, osszesBlokk: 9, utolsoMentes: '2026-04-17T10:00:00.000Z', rendezvenyDb: 8 },
  kapcsolatepites: { rendezvenyBeszamoloDb: 2, partnerkeresesDb: 3, reszveteliLehetosegDb: 1, jelentesek: [] },
  egyuttmukodes: { ticketDb: 11, elsoValaszMedianNap: 4.5, halozatiValaszMedianNap: 2, valaszNelkulDb: 1, hataridosDb: 11, hataridoreDb: 7, kesettDb: 3, lejartValaszNelkulDb: 1, atlagKesesNap: 3, ticketek: [] },
};
assert.equal(tizedes(4.5), '4,5');
assert.equal(tizedes(null), '–');
assert.equal(kulcsMutato('tajekoztatas', m), '11 jelentés, 5 / 7 téma');
assert.equal(kulcsMutato('orszagismeret', m), '9 / 9 blokk kitöltve');
assert.equal(kulcsMutato('kapcsolatepites', m), '2 rendezvénybeszámoló, 3 partnerkeresés');
assert.equal(kulcsMutato('eredmenyek', m), 'Az 1. szakaszban nincs rendszeradat');
assert.equal(kulcsMutato('egyuttmukodes', m), '7 / 11 ticket határidőre');
assert.deepEqual(mutatoKartyak('egyuttmukodes', m)[0], { cimke: 'Első válasz mediánja', ertek: '4,5 nap', megjegyzes: 'munkanap · hálózat: 2' });
assert.deepEqual(mutatoKartyak('tajekoztatas', m)[0], { cimke: 'Beadott jelentés', ertek: '11 db', megjegyzes: 'előző félév: 13' });
assert.equal(mutatoKartyak('eredmenyek', m).length, 0);
console.log('OK');
```

- [ ] **Step 2: Futtasd, és ellenőrizd, hogy elbukik**

Run: `npx tsx scripts/_ert-megjelenites.ts`
Expected: FAIL, nem található a modul.

- [ ] **Step 3: Valósítsd meg a `lib/ertekeles-megjelenites.ts`-t**

A kártyák a spec 5.4. pontjának mutatói. A `tizedes` a magyar tizedesvesszőt használja. Hálózati medián hiányában a megjegyzés „hálózat: –”. Vezetett ország nélkül az Országismeret kulcsmutatója „Nincs vezetett ország”.

- [ ] **Step 4: Futtasd a tesztet**

Run: `npx tsx scripts/_ert-megjelenites.ts`
Expected: `OK`

- [ ] **Step 5: Írd meg az oldalt és a komponenseket a spec 6.2. pontja szerint**

- Az oldal sorrendje: `requireAdmin()`, `attaseIsmert` hamis értéknél `notFound()`, majd a félév feloldása a hálózati nézettel azonos szabállyal, végül `getAdatlap`.
- `metadata` statikus: `{ title: 'Monitoring és értékelés' }`.
- Ha nincs adatlap az adott félévre, tájékoztató kártya áll visszalinkkel: „Ehhez a félévhez nincs értékelés.”.
- Kihagyott attasénál tájékoztató kártya: „Ebben a félévben nem értékelt: <ok>.”.
- Lezárt félévnél az `Osszkep` renderel. Nyitott félévnél ebben a feladatban ideiglenesen a „Minősítés folyamatban” kártya áll, a 8. feladat cseréli.
- A `SzempontSorok` a `Collapsible`-re épül, a sor gombja `aria-expanded`-del nyit, és a fokozatot szöveggel is mutatja. Lenyitva: mutatók, bizonyítékok, indoklás, értékelő neve és időpontja.
- A `BizonyitekLista` jelentésnél a `/jelentesek/[id]`, ticketnél a `listaUrl('mind', id)` címre mutat. Ha az id nincs a `letezoJelentesek` vagy `letezoTicketek` listában, a tárgy sima szöveg.
- Az `Eredmények` üres állapota: „Az 1. szakaszban a rendszer még nem mér eredményeket. Az indoklás nevezi meg a konkrét eredményeket.”.
- A „Hálózati nézet” visszalink a kapott szűrőket megtartja.

- [ ] **Step 6: Ellenőrizd böngészőben a QA-környezetben**

| Lépés | Elvárt eredmény |
| --- | --- |
| Kertész Anna adatlapja, 2026/1 | Összminősítés „Részben megfelel”, „romlott”, négy féléves mátrix |
| Együttműködés sor lenyitása | Mutatók, ticketek és indoklás látszik, a gomb `aria-expanded="true"` |
| Rácz Levente, 2026/1 | Változás: „új”, a mátrixban egy félév |
| Lukács Péter, Országismeret | „Nem értékelhető”, értékelő: Automatikus |
| Szalai Emese, 2025/2 | „Ebben a félévben nem értékelt” kártya |
| A QA-adatbázisból törölt jelentés | A mutató száma változatlan, a tárgy link nélküli szöveg |
| Ismeretlen attasé-id | 404 |
| Visszalink szűrt listáról | A szűrők megmaradnak |

- [ ] **Step 7: Ellenőrizz és commitolj**

Run: `npx tsc --noEmit`, majd `rm scripts/_ert-megjelenites.ts`.

```bash
git add lib/ertekeles-megjelenites.ts app/\(app\)/monitoring
git commit -m "feat(monitoring): egyéni adatlap összképpel és idősorral"
```

---

### Task 8: Minősítő munkalap

**Files:**
- Modify: `app/(app)/monitoring/actions.ts`, `app/(app)/monitoring/[attaseId]/page.tsx`
- Create, a `components/` alatt: `Munkalap.tsx`, `SzempontPanel.tsx`, `OsszPanel.tsx`, `FokozatValaszto.tsx`, `KihagyasDialog.tsx`

**Interfaces:**
- Consumes: `mentSzempont`, `mentOssz`, `kihagyAttase`, `parseSzempontForm`, `parseOsszForm`, `parseKihagyasForm`, `kovetkezoFul`, `MutatoRacs`, `BizonyitekLista`, `AdatlapNezet`
- Produces, `actions.ts`:

```ts
export interface MentesState extends MuveletState { verzio?: number }
export async function mentSzempontAction(ertekelesId: string, prev: MentesState, fd: FormData): Promise<MentesState>;
export async function mentOsszAction(ertekelesId: string, prev: MentesState, fd: FormData): Promise<MentesState>;
export async function kihagyAttaseAction(ertekelesId: string, prev: MuveletState, fd: FormData): Promise<MuveletState>;
export async function visszaveszAttaseAction(ertekelesId: string): Promise<MuveletState>;
```

- [ ] **Step 1: Írd meg az action-öket**

Hibaüzenetek űrlapszinten: `elavult` → „Ezt a minősítést közben más módosította. A szövegedet másold ki, majd töltsd újra az oldalt.”, `lezart` → „A félév közben lezárult.”, `kihagyott` → „Az attasét közben kihagyták ebből a félévből.”, `automatikus` → „Ez a szempont ennél az attasénál automatikusan nem értékelhető.”, `hianyos` → „Összminősítés csak mind az öt szempont minősítése után adható.”, `nincs` → „Az értékelés nem található.”. Az értékelő neve `session.name`. Siker: `{ ok: true, verzio }`.

- [ ] **Step 2: Írd meg a munkalap komponenseit a spec 6.2. pontja szerint**

- A `[attaseId]/page.tsx` nyitott félévben ezt rendereli: `<Munkalap key={`${ev}/${felev}/${attaseId}`} ... />`. A `key` kötelező, mert az App Router állapot-kulcsa nem tartalmazza a sütiből jövő évet.
- A `Munkalap` kliens-állapota: `aktiv: MunkalapFul`, `piszkozatok: Record<MunkalapFul, { fokozat: string; indoklas: string; fejlesztesiCel: string }>` és `verziok: Record<MunkalapFul, number | null>`. Mindegyik a megnyitáskori adatból indul. Fülváltáskor nincs navigáció, ezért a nem mentett szöveg megmarad.
- A panel `key={aktiv}`, a `useMuveletForm`-nak adott burkoló action sikernél beállítja az új verziót és a `kovetkezoFul` szerinti fület. Elavult verziónál a piszkozat érintetlen marad.
- A `FokozatValaszto` natív rádiógomb-csoport `<fieldset>`-ben, `<legend>`-del. A négy fokozat a leírásával, a „Nem értékelhető” külön lehetőségként, a szöveges összminősítésnél nélküle. Az első rádió `id`-ja `fokozat`, hogy a hibafókusz odaugorjon. A `defaultChecked` render után kövesse a vezérelt értéket `useLayoutEffect`-ben, a `VezetoJelolo` mintájára.
- Az indoklás címkéje „Megfelel” fokozatnál „(opcionális)” jelölést kap.
- A fülsor a szempontokat az aktuális fokozatukkal mutatja, az automatikus Országismeret nem szerkeszthető, „Nem értékelhető” felirattal.
- Az `OsszPanel` hiányos szempontoknál űrlap helyett felsorolja a hiányzókat.
- A `KihagyasDialog` a `MuveletDialog`-ra épül. Kihagyott sornál a munkalap helyett az ok és a „Visszavétel az értékelésbe” gomb látszik.

- [ ] **Step 3: Ellenőrizd a típusokat**

Run: `npx tsc --noEmit`
Expected: hiba nélkül.

- [ ] **Step 4: Ellenőrizd böngészőben a QA-környezetben, a 2026/2 nyitott félévben**

| Lépés | Elvárt eredmény |
| --- | --- |
| Még nem minősített attasé adatlapja | Munkalap, az első szempont aktív |
| „Részben megfelel” indoklás nélkül, mentés | Hibaüzenet, a fókusz az indoklás mezőn, a választott rádió megmarad |
| Indoklással mentés | Toast, a következő szempont aktív, a fülsoron megjelenik a fokozat |
| Szöveg beírása, fülváltás, visszaváltás | A szöveg megmaradt |
| Két böngészőlapon ugyanaz a szempont, mindkettő ment | A második az elavult hibát kapja, a szövege megmarad |
| Összminősítés hiányos szempontokkal | A hiányzók listája, űrlap nélkül |
| „Részben megfelel” összminősítés cél nélkül | A fejlesztési cél hibát kap |
| Nem vezető attasé | Az Országismeret nem szerkeszthető, a léptetés átugorja |
| Kihagyás indoklással, majd visszavétel | A hőtérképen „Nem értékelt”, utána újra minősíthető |
| Fejlécben évváltás a munkalapon | A korábbi év piszkozata nem kerül az új évhez |
| Csak billentyűzettel teljes minősítés | Minden vezérlő elérhető, a fókusz látszik |
| 390 px széles ablak | A három oszlop egymás alá kerül |

- [ ] **Step 5: Commitolj**

```bash
git add app/\(app\)/monitoring
git commit -m "feat(monitoring): minősítő munkalap és attasé-kihagyás"
```

---

### Task 9: Teljes kör, dokumentáció, build

**Files:**
- Modify: `CLAUDE.md`, `README.md` (ha említi a demó monitoringot)

**Interfaces:**
- Consumes: minden korábbi feladat

- [ ] **Step 1: Frissítsd a dokumentációt**

`CLAUDE.md`:
- A bevezető átmeneti állapotról szóló mondatából kerül ki a monitoring.
- A „Demó pontszámlogika” bekezdés helyére kerül egy **Monitoring és értékelés** bekezdés: a modul fájljai, a félév-életciklus, a mutatók rögzítése, a `key` a munkalapon, a tesztadatbázis.
- A Parancsok közé kerül: `NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-ertekeles.ts`, és hogy a tesztadatbázissal a dev szerver `DATABASE_URL=./data/tet-ertekeles-teszt.db npm run dev` paranccsal indul, másik futó dev szerver nélkül.
- Tűnjön el minden `lib/data` és `lib/score` említés.

Run: `grep -rn "lib/data\|lib/score\|lib/data.ts" CLAUDE.md README.md app lib components`
Expected: nincs találat.

- [ ] **Step 2: Futtass teljes minősítési kört a QA-környezetben**

Újragenerált tesztadatbázison: a 2026/1 félév újranyitása, egy minősítés módosítása, újralezárás. Ellenőrizd, hogy a rögzített mutatók nem változtak, a hőtérkép és az adatlap az új fokozatot mutatja, és a böngésző konzolján nincs hiba. A futó 2026/2 félév lezárása legyen letiltva a „A félév még nem ért véget.” szöveggel.

- [ ] **Step 3: Futtass build-et az eldobható másolatban**

Állítsd le a QA dev szervert, majd:

```bash
REPO="$(git rev-parse --show-toplevel)"
cd "${TMPDIR:-/tmp}/tet-ert-qa"
cp "$REPO/data/tet-ertekeles-teszt.db" ./build-teszt.db
mkdir -p data && sqlite3 -readonly "$REPO/data/tet.db" ".backup 'data/tet.db'"
DATABASE_URL="$PWD/build-teszt.db" npm run build
```
Expected: a build hiba nélkül lefut, a kimenet útvonallistájában szerepel a `/monitoring` és a `/monitoring/[attaseId]`.

- [ ] **Step 4: Takaríts, és ellenőrizd, hogy a demó adatbázis érintetlen**

Run: `rm -rf "${TMPDIR:-/tmp}/tet-ert-qa" "${TMPDIR:-/tmp}/tet-ert-teszt.db"*`, majd a repóban `git status --short data/tet.db` és `npx tsc --noEmit`.
Expected: üres `git status`, hiba nélküli típusellenőrzés. Az eldobható másolat a `.env.local` másolatát is tartalmazta, ezért a törlés kötelező.

- [ ] **Step 5: Commitolj**

```bash
git add CLAUDE.md README.md
git commit -m "docs(monitoring): az értékelési modul leírása"
```
