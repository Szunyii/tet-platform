# Jelentések: „Vezetői Összefoglaló”, „Fő üzenet/jó gyakorlat/javaslat” és „Megtett intézkedés” – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A jelentés űrlapján a „Leírás” neve „Vezetői Összefoglaló” lesz, alá kerül a „Fő üzenet/jó gyakorlat/javaslat” (a meglévő `joGyakorlat` mező), a központ (admin) pedig jelentésenként egy „Megtett intézkedés” szöveget rögzíthet a listából és a részletoldalról.

**Architecture:** Az átnevezés csak felirat: a `leiras` / `joGyakorlat` mező- és oszlopnevek maradnak, adatmigráció nincs. A megtett intézkedés három új, nullable oszlop a `riport` táblán (`intezkedes`, `intezkedes_szerzo_nev`, `intezkedes_idopont`), amelyeket egyetlen lekérdezés (`setIntezkedes`) ír, a bejegyzés `updatedAt`-jának léptetése nélkül. A felület egy közös kliens-páros (`IntezkedesSzerkeszto` + `IntezkedesDialog`) a meglévő `MuveletDialog` / `useMuveletForm` mintára; a server actiont a page adja propként.

**Tech Stack:** Next.js 16 (App Router, server actionök), React 19, TypeScript 7, Drizzle + better-sqlite3, drizzle-kit 0.31, shadcn/ui (Base UI), tsx az ellenőrző scriptekhez.

**Spec:** `docs/superpowers/specs/2026-10-13-jelentes-osszefoglalo-intezkedes-design.md`.

---

## Közös tudnivalók (minden taskhoz)

- Ág: `jelentes-intezkedes`, a repó fő munkafájában (`/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next`). **Ágat váltani, `git stash`-t, `git reset`-et, `git checkout -- <fájl>`-t futtatni tilos.**
- A 3000-es porton a felhasználó dev szervere futhat ugyanezzel a `data/tet.db`-vel (a terv írásakor nem futott). **Leállítani, újraindítani tilos; saját dev szervert ne indíts.**
- A `data/tet.db` a 2. taskban megkapja a `0010` migrációt, de **csak a 6. task commitolja**. Minden commit konkrét fájlokat ad hozzá; `git add -A`, `git add .`, `git commit -a` tilos. A `data/tet.db`-t visszaállítani tilos.
- Minden parancs a repó gyökeréből fut. Összetett parancsban ne használj `cd`-t.
- Nincs tesztkeretrendszer és nincs linter. Az ellenőrzés: `npx tsc --noEmit`, az előre megírt ellenőrző scriptek (lent), a végén `npm run build` és böngészős QA.
- `AGENTS.md`: ez a Next.js verzió eltérhet a megszokottól. A terv kizárólag a kódbázisban már használt mintákat használja (bind-olt server action propként, `revalidatePath`, `useActionState` a `useMuveletForm`-on át). Ha ettől eltérnél, előbb olvasd el a megfelelő útmutatót a `node_modules/next/dist/docs/` alatt.
- A felület szövegei magyarok, a kód azonosítói a meglévőkhöz igazodnak. A feliratokat **betűre pontosan** a tervből vedd (magyar idézőjelek: „ ”).
- Commit-üzenet: magyar, `típus(jelentes-intezkedes): …` alakban, a végén üres sor után `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- A scratchpad (nem része a repónak):

  ```bash
  SCRATCH=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/85dd8b25-8254-4183-9cd5-5a43bd1bb329/scratchpad
  ```

### Előkészítve a scratchpadben (a terv írásakor elkészült és ki lett próbálva)

- `$SCRATCH/intezkedes-alap.db`: a `data/tet.db` másolata a `0010` migráció **előtt** (10 migráció, 16 felhasználó), három teszt-jelentéssel: `r-szekhely` (Jávori Balázs, AT), `r-regio` (Balogh András Zoltán, IE), `r-admin` (az admin, DE). **Ne írd felül**; a taskok mindig másolaton dolgoznak.
- `$SCRATCH/ell-1-szovegek.ts`, `$SCRATCH/ell-2-db.ts`, `$SCRATCH/ell-3-logika.ts`: a három ellenőrző script. A terv írásakor mindhárom **elbukott** (a funkció még nincs meg), a megfelelő task végére `OK – …` sort kell kiírniuk. A tartalmuk a taskoknál olvasható; ha egy fájl hiányozna, abból hozd létre.
- A scratchpad scriptjei csak a repó fájljait (abszolút útvonallal) és Node beépített modulokat importálhatnak: csupasz csomagnév (`drizzle-orm`) onnan nem oldódik fel.
- WAL módú DB-másolat csak olvasó megnyitása: `sqlite3 "file:<útvonal>?immutable=1" "…"` (a `-readonly` a hiányzó `-shm` fájl miatt hibát ad).

---

## Fájlszerkezet

| Fájl | Változás | Felelősség |
| --- | --- | --- |
| `lib/riport-validacio.ts` | módosul | a két mező új hibaüzenetei; új `parseIntezkedes` |
| `lib/riport-szotar.ts` | módosul | új `INTEZKEDES_MAX` |
| `lib/riport-jog.ts` | módosul | új `canIntezkedni` |
| `db/schema/riport.ts` | módosul | három új oszlop |
| `drizzle/0010_intezkedes.sql`, `drizzle/meta/0010_snapshot.json`, `drizzle/meta/_journal.json` | új / módosul | generált migráció |
| `db/queries/riport.ts` | módosul | `RiportListItem` / `RiportDetail` új mezői, `setIntezkedes` |
| `app/(app)/jelentesek/actions.ts` | módosul | új `mentIntezkedesAction` |
| `components/riport/IntezkedesDialog.tsx` | **új** | a felugró űrlap (egy vezérelt `Textarea`) |
| `components/riport/IntezkedesSzerkeszto.tsx` | **új** | a kiváltó elem és a nyitás állapota |
| `components/riport/RiportForm.tsx` | módosul | feliratok, a `joGyakorlat` blokk új helye |
| `components/riport/RiportReszlet.tsx` | módosul | új sorrend és címek, „Megtett intézkedés” kártya |
| `components/riport/RiportTabla.tsx` | módosul | „Intézkedés” oszlop |
| `components/riport/RiportSzurok.tsx`, `components/AppShell.tsx` | módosul | egy-egy szöveg |
| `app/(app)/jelentesek/page.tsx`, `app/(app)/jelentesek/[id]/page.tsx` | módosul | az action átadása adminnak |
| `CLAUDE.md`, `README.md` | módosul | dokumentáció |
| `data/tet.db` | módosul | a `0010` migráció (a 6. task commitolja) |

---

### Task 1: Új feliratok és sorrend (űrlap, részletoldal, hibaüzenetek)

**Files:**
- Modify: `lib/riport-validacio.ts` (a `parseRiportForm` három üzenete)
- Modify: `components/riport/RiportForm.tsx`
- Modify: `components/riport/RiportReszlet.tsx`
- Modify: `components/AppShell.tsx` (`TITLES['/uj-jelentes']`)
- Modify: `components/riport/RiportSzurok.tsx` (a kereső placeholdere)
- Test: `$SCRATCH/ell-1-szovegek.ts`

- [ ] **Step 1: Az ellenőrző script fusson, és bukjon el**

A script tartalma (már a scratchpadben van):

```ts
// 1. task: a validátor hibaüzenetei az új mezőneveket használják.
import assert from 'node:assert/strict';
import { parseRiportForm } from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/lib/riport-validacio';

function urlap(mezok: Record<string, string>): FormData {
  const fd = new FormData();
  fd.set('kategoria', 'szabalyozas');
  fd.set('targy', 'Teszt tárgy');
  fd.set('leiras', 'Teszt összefoglaló');
  fd.set('kulcsszavak', '["Kutatás"]');
  for (const [k, v] of Object.entries(mezok)) fd.set(k, v);
  return fd;
}
function hibak(mezok: Record<string, string>): Record<string, string> {
  const r = parseRiportForm(urlap(mezok));
  return r.ok ? {} : r.errors;
}

assert.deepEqual(hibak({}), {}, 'az alap űrlap érvényes');
assert.equal(hibak({ leiras: '' }).leiras, 'A vezetői összefoglaló kötelező.');
assert.equal(hibak({ leiras: 'x'.repeat(5001) }).leiras, 'A vezetői összefoglaló legfeljebb 5000 karakter.');
assert.equal(
  hibak({ joGyakorlat: 'x'.repeat(5001) }).joGyakorlat,
  'A fő üzenet/jó gyakorlat/javaslat legfeljebb 5000 karakter.',
);
assert.deepEqual(hibak({ joGyakorlat: '' }), {}, 'a fő üzenet opcionális');
console.log('OK – ell-1-szovegek');
```

Run:

```bash
SCRATCH=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/85dd8b25-8254-4183-9cd5-5a43bd1bb329/scratchpad
NODE_OPTIONS="--conditions=react-server" npx tsx "$SCRATCH/ell-1-szovegek.ts"
```

Expected: FAIL, `AssertionError` – `+ 'A leírás kötelező.'` / `- 'A vezetői összefoglaló kötelező.'`.

- [ ] **Step 2: A validátor három üzenete**

`lib/riport-validacio.ts`, a `parseRiportForm`-ban. Régi:

```ts
  if (!leiras) errors.leiras = 'A leírás kötelező.';
  else if (leiras.length > LEIRAS_MAX) errors.leiras = `A leírás legfeljebb ${LEIRAS_MAX} karakter.`;
```

Új:

```ts
  if (!leiras) errors.leiras = 'A vezetői összefoglaló kötelező.';
  else if (leiras.length > LEIRAS_MAX) errors.leiras = `A vezetői összefoglaló legfeljebb ${LEIRAS_MAX} karakter.`;
```

Régi:

```ts
  const joGyakorlat = opcionalis(fd, 'joGyakorlat', SZOVEG_MAX, 'A jó gyakorlat', errors);
```

Új:

```ts
  const joGyakorlat = opcionalis(fd, 'joGyakorlat', SZOVEG_MAX, 'A fő üzenet/jó gyakorlat/javaslat', errors);
```

- [ ] **Step 3: Az ellenőrző script most menjen át**

Run: `NODE_OPTIONS="--conditions=react-server" npx tsx "$SCRATCH/ell-1-szovegek.ts"`
Expected: `OK – ell-1-szovegek`

- [ ] **Step 4: `RiportForm.tsx` – a „Vezetői Összefoglaló” felirat**

Régi:

```tsx
        <Label htmlFor="leiras">Leírás</Label>
```

Új:

```tsx
        <Label htmlFor="leiras">Vezetői Összefoglaló</Label>
```

- [ ] **Step 5: `RiportForm.tsx` – a `joGyakorlat` blokk az összefoglaló alá kerül**

A `Collapsible`-ből **töröld** ezt a blokkot:

```tsx
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="joGyakorlat">Magyarország számára átvehető jó gyakorlat</Label>
            <Textarea
              id="joGyakorlat"
              name="joGyakorlat"
              maxLength={SZOVEG_MAX}
              rows={3}
              value={joGyakorlat}
              onChange={(e) => setJoGyakorlat(e.target.value)}
              {...hibaAttr(errors, 'joGyakorlat')}
            />
            <MezoHiba mezo="joGyakorlat" errors={errors} />
          </div>
```

A `leiras` blokk záró `</div>`-je (a `<MezoHiba mezo="leiras" errors={errors} />` utáni) és a kulcsszavak blokkja (`<Label id="kulcsszavak-label" …>`) **közé** szúrd be:

```tsx
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="joGyakorlat">
          Fő üzenet/jó gyakorlat/javaslat
          <span className="font-normal text-muted-foreground">(opcionális)</span>
        </Label>
        <Textarea
          id="joGyakorlat"
          name="joGyakorlat"
          maxLength={SZOVEG_MAX}
          rows={3}
          value={joGyakorlat}
          onChange={(e) => setJoGyakorlat(e.target.value)}
          {...hibaAttr(errors, 'joGyakorlat')}
        />
        <MezoHiba mezo="joGyakorlat" errors={errors} />
      </div>
```

(A `Label` flex-sor `gap-2`-vel, ezért a `<span>` szóköz nélkül is elválik a felirattól.)

- [ ] **Step 6: `RiportForm.tsx` – a „További adatok” rész szövegei és a hiba-figyelés**

Régi:

```tsx
  const vanOpcionalisHiba = Boolean(errors.joGyakorlat || errors.kapcsolodoFeladat || errors.csatolmany);
```

Új:

```tsx
  const vanOpcionalisHiba = Boolean(errors.kapcsolodoFeladat || errors.csatolmany);
```

Régi:

```tsx
          További adatok (opcionális): jó gyakorlat, kapcsolódó feladat, csatolmány
```

Új:

```tsx
          További adatok (opcionális): kapcsolódó feladat, csatolmány
```

A `keepMounted` kommentjében régi:

```tsx
            lévő mezők (jó gyakorlat, kapcsolódó feladat, a csatolmányok rejtett file-inputja)
```

Új:

```tsx
            lévő mezők (kapcsolódó feladat, a csatolmányok rejtett file-inputja)
```

- [ ] **Step 7: `RiportReszlet.tsx` – cím az összefoglaló fölé, a fő üzenet kártyája közvetlenül alá**

Régi:

```tsx
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{riport.leiras}</p>
```

Új:

```tsx
      <section className="flex flex-col gap-1.5">
        <h3 className="text-sm font-medium">Vezetői Összefoglaló</h3>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{riport.leiras}</p>
      </section>

      {riport.joGyakorlat && (
        <Card size="sm" className="border-l-4 border-l-emerald-500">
          <CardHeader>
            <CardTitle role="heading" aria-level={3}>
              Fő üzenet/jó gyakorlat/javaslat
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">{riport.joGyakorlat}</CardContent>
        </Card>
      )}
```

Lejjebb (a rendezvény-kártya után) **töröld** a régi kártyát:

```tsx
      {riport.joGyakorlat && (
        <Card size="sm" className="border-l-4 border-l-emerald-500">
          <CardHeader>
            <CardTitle role="heading" aria-level={3}>
              Magyarország számára átvehető jó gyakorlat
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">{riport.joGyakorlat}</CardContent>
        </Card>
      )}
```

A sorrend ezután: fejléc → összefoglaló → fő üzenet → kulcsszavak → rendezvény → kapcsolódó feladat → csatolmányok.

- [ ] **Step 8: A két további szöveg**

`components/AppShell.tsx`, régi:

```tsx
    "Kategória, tárgy, leírás, kulcsszavak – rendezvénynél dátum és helyszín",
```

Új:

```tsx
    "Kategória, tárgy, vezetői összefoglaló, kulcsszavak – rendezvénynél dátum és helyszín",
```

`components/riport/RiportSzurok.tsx`, régi:

```tsx
          placeholder="Tárgy vagy leírás…"
```

Új:

```tsx
          placeholder="Tárgy vagy összefoglaló…"
```

- [ ] **Step 9: Típusellenőrzés és maradék-keresés**

```bash
npx tsc --noEmit
grep -rn -E "Leírás<|A leírás|átvehető jó gyakorlat|A jó gyakorlat'|vagy leírás" components lib app
```

Expected: a `tsc` hiba nélkül fut (nincs kimenet); a `grep` nem talál semmit.

- [ ] **Step 10: Commit**

```bash
git add lib/riport-validacio.ts components/riport/RiportForm.tsx components/riport/RiportReszlet.tsx components/AppShell.tsx components/riport/RiportSzurok.tsx
git commit -m "feat(jelentes-intezkedes): „Vezetői Összefoglaló” és „Fő üzenet/jó gyakorlat/javaslat” – új feliratok és sorrend az űrlapon és a részletoldalon

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Adatmodell – három oszlop, `0010` migráció, lekérdezések

**Files:**
- Modify: `db/schema/riport.ts`
- Create (generált): `drizzle/0010_intezkedes.sql`, `drizzle/meta/0010_snapshot.json`; Modify (generált): `drizzle/meta/_journal.json`
- Modify: `db/queries/riport.ts`
- Modify (nem commitolva): `data/tet.db`
- Test: `$SCRATCH/ell-2-db.ts`

- [ ] **Step 1: Az ellenőrző script fusson a még nem migrált másolaton, és bukjon el**

A script tartalma (már a scratchpadben van):

```ts
// 2. task: a három intézkedés-oszlop, a lekérdezések új mezői és a setIntezkedes szabályai.
// Futtatás a MIGRÁLT másolaton: DATABASE_URL=<scratch>/intezkedes-teszt.db
import assert from 'node:assert/strict';
import { getRiport, listRiportok, setIntezkedes, updateRiport } from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/db/queries/riport';

const ID = 'r-szekhely';
const SZOVEG = 'Továbbítva a szakfőosztálynak.\nVálasz október végéig.';

const elotte = getRiport(ID)!;
assert.equal(elotte.intezkedes, null);
assert.equal(elotte.intezkedesSzerzoNev, null);
assert.equal(elotte.intezkedesIdopont, null);
assert.ok(Date.now() - elotte.updatedAt.getTime() > 5000, 'a tesztsor updated_at-ja régi');

// Beírás: a három oszlop együtt töltődik, az updated_at nem változik.
assert.equal(setIntezkedes(ID, SZOVEG, 'Teszt Admin'), true);
const utana = getRiport(ID)!;
assert.equal(utana.intezkedes, SZOVEG);
assert.equal(utana.intezkedesSzerzoNev, 'Teszt Admin');
assert.ok(utana.intezkedesIdopont instanceof Date);
assert.ok(Math.abs(utana.intezkedesIdopont.getTime() - Date.now()) < 60_000, 'az időpont a mostani');
assert.equal(utana.updatedAt.getTime(), elotte.updatedAt.getTime(), 'az updated_at nem változhat');

// A lista a teljes szöveget adja; a többi sor null.
const lista = listRiportok();
assert.equal(lista.length, 3);
assert.equal(lista.find((r) => r.id === ID)!.intezkedes, SZOVEG);
assert.equal(lista.find((r) => r.id === 'r-regio')!.intezkedes, null);

// A jelentés szerkesztése nem nyúl az intézkedéshez (és lépteti az updated_at-ot).
updateRiport(
  ID,
  {
    kategoria: utana.kategoria,
    targy: 'Módosított tárgy',
    leiras: utana.leiras,
    kulcsszavak: utana.kulcsszavak,
    esemenyDatum: utana.esemenyDatum,
    esemenyHelyszin: utana.esemenyHelyszin,
    joGyakorlat: utana.joGyakorlat,
    kapcsolodoFeladat: utana.kapcsolodoFeladat,
  },
  [],
  [],
);
const szerk = getRiport(ID)!;
assert.equal(szerk.targy, 'Módosított tárgy');
assert.equal(szerk.intezkedes, SZOVEG);
assert.equal(szerk.intezkedesSzerzoNev, 'Teszt Admin');
assert.equal(szerk.intezkedesIdopont!.getTime(), utana.intezkedesIdopont.getTime());
assert.ok(szerk.updatedAt.getTime() > elotte.updatedAt.getTime(), 'a szerkesztés lépteti az updated_at-ot');

// Módosítás másik névvel: a név és az időpont frissül.
assert.equal(setIntezkedes(ID, 'Lezárva.', 'Másik Admin'), true);
const mod = getRiport(ID)!;
assert.equal(mod.intezkedes, 'Lezárva.');
assert.equal(mod.intezkedesSzerzoNev, 'Másik Admin');
assert.equal(mod.updatedAt.getTime(), szerk.updatedAt.getTime(), 'az updated_at most sem változhat');

// Törlés: mindhárom oszlop null.
assert.equal(setIntezkedes(ID, null, 'Teszt Admin'), true);
const torolt = getRiport(ID)!;
assert.equal(torolt.intezkedes, null);
assert.equal(torolt.intezkedesSzerzoNev, null);
assert.equal(torolt.intezkedesIdopont, null);

// Nem létező bejegyzés.
assert.equal(setIntezkedes('nincs-ilyen', 'x', 'Teszt Admin'), false);
console.log('OK – ell-2-db');
```

Run:

```bash
SCRATCH=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/85dd8b25-8254-4183-9cd5-5a43bd1bb329/scratchpad
rm -f "$SCRATCH/intezkedes-teszt.db" "$SCRATCH/intezkedes-teszt.db-wal" "$SCRATCH/intezkedes-teszt.db-shm"
cp "$SCRATCH/intezkedes-alap.db" "$SCRATCH/intezkedes-teszt.db"
DATABASE_URL="$SCRATCH/intezkedes-teszt.db" NODE_OPTIONS="--conditions=react-server" npx tsx "$SCRATCH/ell-2-db.ts"
```

Expected: FAIL, `AssertionError` az első `assert.equal(elotte.intezkedes, null)` soron (`undefined` ≠ `null`).

- [ ] **Step 2: A három oszlop a sémában**

`db/schema/riport.ts`, a `riport` tábla oszlopai között. Régi:

```ts
    kapcsolodoFeladat: text('kapcsolodo_feladat'),
```

Új:

```ts
    kapcsolodoFeladat: text('kapcsolodo_feladat'),
    // A központ (admin) „Megtett intézkedése”: a három oszlop együtt null vagy együtt töltött,
    // csak a setIntezkedes írja. A név pillanatkép (nincs FK), mint a ticket_uzenet.szerzo_nev.
    intezkedes: text('intezkedes'),
    intezkedesSzerzoNev: text('intezkedes_szerzo_nev'),
    intezkedesIdopont: integer('intezkedes_idopont', { mode: 'timestamp_ms' }),
```

- [ ] **Step 3: A migráció generálása és átolvasása**

```bash
npx drizzle-kit generate --name=intezkedes
cat drizzle/0010_intezkedes.sql
grep -c 'ALTER TABLE `riport` ADD' drizzle/0010_intezkedes.sql
grep -c -E '__new_|DROP TABLE|CREATE TABLE' drizzle/0010_intezkedes.sql
```

Expected: létrejön a `drizzle/0010_intezkedes.sql` és a `drizzle/meta/0010_snapshot.json`; a fájl három `ALTER TABLE \`riport\` ADD …` utasítás (`intezkedes` text, `intezkedes_szerzo_nev` text, `intezkedes_idopont` integer), `--> statement-breakpoint` jellel elválasztva; az első `grep` `3`, a második `0`.

**Ha a második `grep` nem `0`** (a generátor a táblát újraépítené): ÁLLJ MEG, ne futtasd a migrációt. A `riport` szülőtábla, az újraépítése kaszkádolva törölné a csatolmányokat (CLAUDE.md, Adatréteg). Jelezd a vezérlőnek.

- [ ] **Step 4: A migráció alkalmazása a tesztmásolatra és a repó DB-jére**

```bash
DATABASE_URL="$SCRATCH/intezkedes-teszt.db" npx drizzle-kit migrate
DATABASE_URL=./data/tet.db npx drizzle-kit migrate
sqlite3 data/tet.db "select name from pragma_table_info('riport') where name like 'intezkedes%' order by cid; select count(*) from __drizzle_migrations; select count(*) from riport; select count(*) from user;"
```

Expected: mindkét `migrate` hiba nélkül fut; a lekérdezés: `intezkedes`, `intezkedes_szerzo_nev`, `intezkedes_idopont`, majd `11`, `0`, `16`.

- [ ] **Step 5: A lekérdezések típusai és oszlopai**

`db/queries/riport.ts`. A `RiportListItem`-ben régi:

```ts
  varos: string | null;
  kategoria: KategoriaKulcs;
```

Új:

```ts
  varos: string | null;
  /** A központ „Megtett intézkedése” (a teljes szöveg), vagy `null`. */
  intezkedes: string | null;
  kategoria: KategoriaKulcs;
```

A `RiportDetail`-ben régi:

```ts
  createdAt: Date;
  updatedAt: Date;
  csatolmanyok: CsatolmanyMeta[];
}
```

Új:

```ts
  createdAt: Date;
  updatedAt: Date;
  /** A központ „Megtett intézkedése”: a három mező együtt `null` vagy együtt töltött. */
  intezkedes: string | null;
  intezkedesSzerzoNev: string | null;
  intezkedesIdopont: Date | null;
  csatolmanyok: CsatolmanyMeta[];
}
```

A `listOszlopok`-ban régi:

```ts
  varos: attaseOrszag.varos,
  kategoria: riport.kategoria,
```

Új:

```ts
  varos: attaseOrszag.varos,
  intezkedes: riport.intezkedes,
  kategoria: riport.kategoria,
```

A `getRiport` `select`-jében régi:

```ts
      kapcsolodoFeladat: riport.kapcsolodoFeladat,
      createdAt: riport.createdAt,
      updatedAt: riport.updatedAt,
    })
```

Új:

```ts
      kapcsolodoFeladat: riport.kapcsolodoFeladat,
      createdAt: riport.createdAt,
      updatedAt: riport.updatedAt,
      intezkedes: riport.intezkedes,
      intezkedesSzerzoNev: riport.intezkedesSzerzoNev,
      intezkedesIdopont: riport.intezkedesIdopont,
    })
```

- [ ] **Step 6: `setIntezkedes`**

`db/queries/riport.ts`, az `updateRiport` függvény után (a `deleteRiport` elé) szúrd be:

```ts
/**
 * A központ „Megtett intézkedésének” beállítása, vagy (`szoveg === null`) törlése; a három
 * oszlop együtt változik. A bejegyzés `updatedAt`-ját NEM lépteti (a `$onUpdate` miatt
 * kifejezetten önmagára állítjuk): a „módosítva” dátum az attasé szövegére vonatkozik, az
 * intézkedésnek saját időpontja van. `false`, ha nincs ilyen bejegyzés.
 */
export function setIntezkedes(id: string, szoveg: string | null, szerzoNev: string): boolean {
  const eredmeny = db
    .update(riport)
    .set({
      intezkedes: szoveg,
      intezkedesSzerzoNev: szoveg === null ? null : szerzoNev,
      intezkedesIdopont: szoveg === null ? null : new Date(),
      updatedAt: sql`${riport.updatedAt}`,
    })
    .where(eq(riport.id, id))
    .run();
  return eredmeny.changes > 0;
}
```

(Az `sql` és az `eq` már importálva van a fájl tetején. A technika a terv írásakor ki lett próbálva: a generált SQL `"updated_at" = "riport"."updated_at"`, az érték változatlan marad; nélküle a `$onUpdate` léptet.)

- [ ] **Step 7: Típusellenőrzés és az ellenőrző script**

```bash
npx tsc --noEmit
rm -f "$SCRATCH/intezkedes-teszt.db" "$SCRATCH/intezkedes-teszt.db-wal" "$SCRATCH/intezkedes-teszt.db-shm"
cp "$SCRATCH/intezkedes-alap.db" "$SCRATCH/intezkedes-teszt.db"
DATABASE_URL="$SCRATCH/intezkedes-teszt.db" npx drizzle-kit migrate
DATABASE_URL="$SCRATCH/intezkedes-teszt.db" NODE_OPTIONS="--conditions=react-server" npx tsx "$SCRATCH/ell-2-db.ts"
```

Expected: a `tsc` hiba nélkül; a script utolsó sora `OK – ell-2-db` (előtte a `[db] …intezkedes-teszt.db – meglévő fájl` sor).

- [ ] **Step 8: Commit (a `data/tet.db` nélkül)**

```bash
git add db/schema/riport.ts db/queries/riport.ts drizzle/0010_intezkedes.sql drizzle/meta/0010_snapshot.json drizzle/meta/_journal.json
git status --short
git commit -m "feat(jelentes-intezkedes): három intézkedés-oszlop a riport táblán (0010), setIntezkedes és a lekérdezések új mezői

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Expected: a `git status --short` a commit előtt öt `A`/`M` sort mutat a színpadon, és legfeljebb a ` M data/tet.db` marad színpadon kívül.

---

### Task 3: Jogosultság, validátor, server action

**Files:**
- Modify: `lib/riport-szotar.ts`
- Modify: `lib/riport-jog.ts`
- Modify: `lib/riport-validacio.ts`
- Modify: `app/(app)/jelentesek/actions.ts`
- Test: `$SCRATCH/ell-3-logika.ts`

- [ ] **Step 1: Az ellenőrző script fusson, és bukjon el**

A script tartalma (már a scratchpadben van):

```ts
// 3. task: a „Megtett intézkedés” validátora és jogosultsága (tiszta függvények, DB nélkül).
import assert from 'node:assert/strict';
import { canIntezkedni } from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/lib/riport-jog';
import { INTEZKEDES_MAX } from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/lib/riport-szotar';
import { parseIntezkedes } from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/lib/riport-validacio';

function fd(ertek?: string): FormData {
  const f = new FormData();
  if (ertek !== undefined) f.set('intezkedes', ertek);
  return f;
}

assert.equal(INTEZKEDES_MAX, 5000);
assert.deepEqual(parseIntezkedes(fd()), { ok: true, szoveg: null }, 'hiányzó mező = törlés');
assert.deepEqual(parseIntezkedes(fd('')), { ok: true, szoveg: null });
assert.deepEqual(parseIntezkedes(fd('  \r\n ​ ')), { ok: true, szoveg: null }, 'csak térköz = törlés');
assert.deepEqual(parseIntezkedes(fd('  Első sor\r\nmásodik sor  ')), { ok: true, szoveg: 'Első sor\nmásodik sor' });
assert.deepEqual(parseIntezkedes(fd('x'.repeat(5000))), { ok: true, szoveg: 'x'.repeat(5000) });
assert.deepEqual(parseIntezkedes(fd('x'.repeat(5001))), {
  ok: false,
  errors: { intezkedes: 'A megtett intézkedés legfeljebb 5000 karakter.' },
});

const alap = { userId: 'u1', name: 'Teszt', email: 't@example.test', orszagok: [] };
assert.equal(canIntezkedni({ ...alap, role: 'admin' }), true);
assert.equal(canIntezkedni({ ...alap, role: 'attase' }), false);
console.log('OK – ell-3-logika');
```

Run:

```bash
SCRATCH=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/85dd8b25-8254-4183-9cd5-5a43bd1bb329/scratchpad
NODE_OPTIONS="--conditions=react-server" npx tsx "$SCRATCH/ell-3-logika.ts"
```

Expected: FAIL, `AssertionError` az `assert.equal(INTEZKEDES_MAX, 5000)` soron (`undefined` ≠ `5000`).

- [ ] **Step 2: `INTEZKEDES_MAX`**

`lib/riport-szotar.ts`. Régi:

```ts
export const SZOVEG_MAX = 5000;
```

Új:

```ts
export const SZOVEG_MAX = 5000;
/** A központ „Megtett intézkedés” szövegének korlátja. */
export const INTEZKEDES_MAX = 5000;
```

- [ ] **Step 3: `canIntezkedni`**

`lib/riport-jog.ts` végére:

```ts

/**
 * A „Megtett intézkedés” írása: csak a központ (admin). Olvasni az láthatja, aki magát a
 * bejegyzést (canViewRiport) – az attasé a sajátjánál, csak olvasásra.
 */
export function canIntezkedni(session: AppSession): boolean {
  return session.role === 'admin';
}
```

- [ ] **Step 4: `parseIntezkedes`**

`lib/riport-validacio.ts`. Az import-listában régi:

```ts
  HELYSZIN_MAX,
  isKategoriaKulcs,
```

Új:

```ts
  HELYSZIN_MAX,
  INTEZKEDES_MAX,
  isKategoriaKulcs,
```

A fájl végére:

```ts

export type ParseIntezkedesResult = { ok: true; szoveg: string | null } | { ok: false; errors: RiportErrors };

/**
 * A „Megtett intézkedés” dialógus validátora. Az üres (vagy csak térközből álló) szöveg a
 * törlést jelenti: `szoveg: null`. A hibakulcs a mező DOM-id-ja (`intezkedes`).
 */
export function parseIntezkedes(fd: FormData): ParseIntezkedesResult {
  const szoveg = mezo(fd, 'intezkedes');
  if (szoveg.length > INTEZKEDES_MAX) {
    return { ok: false, errors: { intezkedes: `A megtett intézkedés legfeljebb ${INTEZKEDES_MAX} karakter.` } };
  }
  return { ok: true, szoveg: szoveg || null };
}
```

- [ ] **Step 5: Az ellenőrző script most menjen át**

Run: `NODE_OPTIONS="--conditions=react-server" npx tsx "$SCRATCH/ell-3-logika.ts"`
Expected: `OK – ell-3-logika`

- [ ] **Step 6: `mentIntezkedesAction`**

`app/(app)/jelentesek/actions.ts`. Az importok régi sorai:

```ts
import { deleteRiport, getRiport, updateRiport } from '../../../db/queries/riport';
import { fajlokCsatolmannya } from '../../../lib/riport-fajl';
import { canEditRiport } from '../../../lib/riport-jog';
import { parseRiportForm } from '../../../lib/riport-validacio';
```

Új:

```ts
import { deleteRiport, getRiport, setIntezkedes, updateRiport } from '../../../db/queries/riport';
import { fajlokCsatolmannya } from '../../../lib/riport-fajl';
import { canEditRiport, canIntezkedni } from '../../../lib/riport-jog';
import { parseIntezkedes, parseRiportForm } from '../../../lib/riport-validacio';
```

A fájl végére:

```ts

/**
 * A központ „Megtett intézkedése” egy bejegyzéshez. Nem irányít át: a hívó dialógus a
 * `{ ok: true }`-ra zár. A jog hiánya form-szintű hiba (nem 404), mint a többi actionnél.
 */
export async function mentIntezkedesAction(
  id: string,
  _prev: RiportFormState,
  formData: FormData,
): Promise<RiportFormState> {
  const session = await requireSession();
  if (!canIntezkedni(session)) return { errors: { form: NINCS_JOG } };
  const parsed = parseIntezkedes(formData);
  if (!parsed.ok) return { errors: parsed.errors };
  try {
    if (!setIntezkedes(id, parsed.szoveg, session.name)) {
      return { errors: { form: 'A bejegyzés már nem létezik.' } };
    }
  } catch (err) {
    unstable_rethrow(err);
    console.error('[riport] setIntezkedes sikertelen:', err);
    return { errors: { form: 'Mentés sikertelen, próbáld újra.' } };
  }
  revalidatePath('/jelentesek');
  revalidatePath(`/jelentesek/${id}`);
  return { ok: true };
}
```

(A `requireSession()` a `try` blokkon **kívül** marad – CLAUDE.md, Auth.)

- [ ] **Step 7: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: nincs kimenet.

- [ ] **Step 8: Commit**

```bash
git add lib/riport-szotar.ts lib/riport-jog.ts lib/riport-validacio.ts "app/(app)/jelentesek/actions.ts"
git commit -m "feat(jelentes-intezkedes): canIntezkedni, parseIntezkedes és a mentIntezkedesAction server action

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Felület – felugró ablak, „Intézkedés” oszlop, „Megtett intézkedés” kártya

**Files:**
- Create: `components/riport/IntezkedesDialog.tsx`
- Create: `components/riport/IntezkedesSzerkeszto.tsx`
- Modify: `components/riport/RiportTabla.tsx`
- Modify: `components/riport/RiportReszlet.tsx`
- Modify: `app/(app)/jelentesek/page.tsx`
- Modify: `app/(app)/jelentesek/[id]/page.tsx`

Ennek a tasknak nincs script-ellenőrzése (kliens-komponensek): a `tsc` és a 6. task böngészős QA-ja ellenőrzi.

- [ ] **Step 1: `IntezkedesDialog.tsx`**

Create `components/riport/IntezkedesDialog.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { INTEZKEDES_MAX } from '../../lib/riport-szotar';
import { hibaAttr, MezoHiba } from '../form/MezoHiba';
import { MuveletDialog } from '../form/MuveletDialog';
import { useMuveletForm, type FormAction } from '../form/useMuveletForm';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

/**
 * A központ „Megtett intézkedés” szövegének felugró űrlapja. A hívó (IntezkedesSzerkeszto)
 * nyitásonként új `key`-jel mountolja, így a mező mindig a mentett értékből, hiba nélkül indul.
 */
export function IntezkedesDialog({
  targy,
  ertek,
  action,
  open,
  onOpenChange,
}: {
  /** A bejegyzés tárgya, a dialógus leírásába. */
  targy: string;
  /** A most mentett szöveg, vagy `null`. */
  ertek: string | null;
  action: FormAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useMuveletForm(action, 'Intézkedés mentve.', () => onOpenChange(false));
  // Vezérelt mező, hogy hibánál ne ürüljön (React 19 a <form action> után resetel).
  const [szoveg, setSzoveg] = useState(ertek ?? '');
  const errors = state.errors ?? {};

  return (
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      cim="Megtett intézkedés"
      leiras={`A(z) „${targy}” jelentéshez. Üresen mentve az intézkedés törlődik.`}
      gomb="Mentés"
      formAction={formAction}
      errors={errors}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="intezkedes">Intézkedés szövege</Label>
        <Textarea
          id="intezkedes"
          name="intezkedes"
          maxLength={INTEZKEDES_MAX}
          rows={6}
          className="min-h-28"
          value={szoveg}
          onChange={(e) => setSzoveg(e.target.value)}
          {...hibaAttr(errors, 'intezkedes')}
        />
        <p className="text-xs text-muted-foreground">
          {szoveg.length}/{INTEZKEDES_MAX}
        </p>
        <MezoHiba mezo="intezkedes" errors={errors} />
      </div>
    </MuveletDialog>
  );
}
```

- [ ] **Step 2: `IntezkedesSzerkeszto.tsx`**

Create `components/riport/IntezkedesSzerkeszto.tsx`:

```tsx
'use client';

import { useState } from 'react';
import type { FormAction } from '../form/useMuveletForm';
import { Button } from '../ui/button';
import { IntezkedesDialog } from './IntezkedesDialog';

/**
 * A „Megtett intézkedés” kiváltó eleme és a dialógus nyitás-állapota; csak a központnak
 * renderelődik. `cella`: a lista cellája – a meglévő szöveg két sorra vágva maga a gomb,
 * szöveg nélkül „Intézkedés rögzítése”. `gomb`: a részletoldal gombja.
 */
export function IntezkedesSzerkeszto({
  targy,
  ertek,
  action,
  valtozat,
}: {
  targy: string;
  ertek: string | null;
  action: FormAction;
  valtozat: 'cella' | 'gomb';
}) {
  const [open, setOpen] = useState(false);
  // Nyitásonként új key: a dialógus mezője és hibái mindig friss állapotból indulnak.
  const [nyitas, setNyitas] = useState(0);
  const nyit = () => {
    setNyitas((n) => n + 1);
    setOpen(true);
  };

  return (
    <>
      {valtozat === 'cella' && ertek ? (
        <button
          type="button"
          onClick={nyit}
          title="Megtett intézkedés módosítása"
          className="block w-full rounded-sm text-left underline-offset-2 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="line-clamp-2 break-words whitespace-pre-wrap">{ertek}</span>
        </button>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={nyit}>
          {ertek ? 'Módosítás' : 'Intézkedés rögzítése'}
        </Button>
      )}
      <IntezkedesDialog
        key={nyitas}
        targy={targy}
        ertek={ertek}
        action={action}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
```

- [ ] **Step 3: `RiportTabla.tsx` – importok és prop**

Régi:

```tsx
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { buttonVariants } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { KategoriaBadge } from './KategoriaBadge';

export function RiportTabla({
  sorok,
  admin,
  vanSzuro,
}: {
  sorok: RiportListItem[];
  admin: boolean;
  vanSzuro: boolean;
}) {
```

Új:

```tsx
import { cn } from '../../lib/utils';
import type { FormAction } from '../form/useMuveletForm';
import { Badge } from '../ui/badge';
import { buttonVariants } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { IntezkedesSzerkeszto } from './IntezkedesSzerkeszto';
import { KategoriaBadge } from './KategoriaBadge';

export function RiportTabla({
  sorok,
  admin,
  vanSzuro,
  intezkedesAction,
}: {
  sorok: RiportListItem[];
  admin: boolean;
  vanSzuro: boolean;
  /**
   * A „Megtett intézkedés” mentése soronként. A page csak a központnak (admin) adja; nélküle
   * a cella csak olvasható. Server Componentek közti függvény-prop, a kliensnek már a
   * bind-olt action megy.
   */
  intezkedesAction?: (id: string) => FormAction;
}) {
```

- [ ] **Step 4: `RiportTabla.tsx` – oszlopfej és cella**

Régi:

```tsx
            <TableHead>Kulcsszavak</TableHead>
```

Új:

```tsx
            <TableHead>Kulcsszavak</TableHead>
            <TableHead>Intézkedés</TableHead>
```

A kulcsszavak cellája után (a `{r.kulcsszavak.length > 3 && …}`-t tartalmazó `<TableCell>` záró `</TableCell>`-je után), a csatolmány cellája (`<TableCell className="text-right text-muted-foreground">`) **elé** szúrd be:

```tsx
              <TableCell className="whitespace-normal">
                {/* Fix szélességű blokk: a hosszú szöveg ne nyújtsa szét az oszlopot. */}
                <div className="w-48">
                  {intezkedesAction ? (
                    <IntezkedesSzerkeszto
                      targy={r.targy}
                      ertek={r.intezkedes}
                      action={intezkedesAction(r.id)}
                      valtozat="cella"
                    />
                  ) : r.intezkedes ? (
                    <p className="line-clamp-2 break-words whitespace-pre-wrap" title={r.intezkedes}>
                      {r.intezkedes}
                    </p>
                  ) : (
                    <span className="text-muted-foreground">–</span>
                  )}
                </div>
              </TableCell>
```

- [ ] **Step 5: `RiportReszlet.tsx` – importok és prop**

Régi:

```tsx
import type { MuveletState } from '../form/useMuveletForm';
import { Badge } from '../ui/badge';
import { buttonVariants } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { KategoriaBadge } from './KategoriaBadge';
import { RiportTorles } from './RiportTorles';

export function RiportReszlet({
  riport,
  szerkeszthet,
  torlesAction,
}: {
  riport: RiportDetail;
  szerkeszthet: boolean;
  torlesAction: () => Promise<MuveletState>;
}) {
```

Új:

```tsx
import type { FormAction, MuveletState } from '../form/useMuveletForm';
import { Badge } from '../ui/badge';
import { buttonVariants } from '../ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '../ui/card';
import { IntezkedesSzerkeszto } from './IntezkedesSzerkeszto';
import { KategoriaBadge } from './KategoriaBadge';
import { RiportTorles } from './RiportTorles';

export function RiportReszlet({
  riport,
  szerkeszthet,
  torlesAction,
  intezkedesAction,
}: {
  riport: RiportDetail;
  szerkeszthet: boolean;
  torlesAction: () => Promise<MuveletState>;
  /** A „Megtett intézkedés” mentése; a page csak a központnak (admin) adja. */
  intezkedesAction?: FormAction;
}) {
```

- [ ] **Step 6: `RiportReszlet.tsx` – a „Megtett intézkedés” kártya**

A „Kapcsolódó feladat, kérés” kártya blokkja (`{riport.kapcsolodoFeladat && ( … )}`) után, a csatolmányok blokkja (`{riport.csatolmanyok.length > 0 && (`) **elé** szúrd be:

```tsx
      {/* A központ mindig látja (üresen is, a gombbal); az attasé csak akkor, ha van szöveg. */}
      {(riport.intezkedes || intezkedesAction) && (
        <Card size="sm" className="border-l-4 border-l-sky-500">
          <CardHeader>
            <CardTitle role="heading" aria-level={3}>
              Megtett intézkedés
            </CardTitle>
            {intezkedesAction && (
              <CardAction>
                <IntezkedesSzerkeszto
                  targy={riport.targy}
                  ertek={riport.intezkedes}
                  action={intezkedesAction}
                  valtozat="gomb"
                />
              </CardAction>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 text-sm">
            {riport.intezkedes ? (
              <>
                <p className="whitespace-pre-wrap">{riport.intezkedes}</p>
                {riport.intezkedesSzerzoNev && riport.intezkedesIdopont && (
                  <p className="text-xs text-muted-foreground">
                    {riport.intezkedesSzerzoNev} · {formatDatum(riport.intezkedesIdopont)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Még nincs rögzített intézkedés.</p>
            )}
          </CardContent>
        </Card>
      )}
```

(A `formatDatum` már importálva van a fájlban.)

- [ ] **Step 7: A lista oldala adja át az actiont**

`app/(app)/jelentesek/page.tsx`. Régi:

```tsx
import { listOrszagok, listRiportok } from '../../../db/queries/riport';
import { szuroErtekek, szuroFromSearchParams, type SearchParams } from '../../../lib/riport-szuro';
import { requireSession } from '../../../lib/session';
import { cn } from '../../../lib/utils';
```

Új:

```tsx
import { listOrszagok, listRiportok } from '../../../db/queries/riport';
import { canIntezkedni } from '../../../lib/riport-jog';
import { szuroErtekek, szuroFromSearchParams, type SearchParams } from '../../../lib/riport-szuro';
import { requireSession } from '../../../lib/session';
import { cn } from '../../../lib/utils';
import { mentIntezkedesAction } from './actions';
```

Régi:

```tsx
      <RiportTabla sorok={sorok} admin={admin} vanSzuro={vanSzuro} />
```

Új:

```tsx
      <RiportTabla
        sorok={sorok}
        admin={admin}
        vanSzuro={vanSzuro}
        intezkedesAction={canIntezkedni(session) ? (id) => mentIntezkedesAction.bind(null, id) : undefined}
      />
```

- [ ] **Step 8: A részletoldal adja át az actiont**

`app/(app)/jelentesek/[id]/page.tsx`. Régi:

```tsx
import { canEditRiport, canViewRiport } from '../../../../lib/riport-jog';
import { requireSession } from '../../../../lib/session';
import { deleteRiportAction } from '../actions';
```

Új:

```tsx
import { canEditRiport, canIntezkedni, canViewRiport } from '../../../../lib/riport-jog';
import { requireSession } from '../../../../lib/session';
import { deleteRiportAction, mentIntezkedesAction } from '../actions';
```

Régi:

```tsx
      torlesAction={deleteRiportAction.bind(null, id)}
    />
```

Új:

```tsx
      torlesAction={deleteRiportAction.bind(null, id)}
      intezkedesAction={canIntezkedni(session) ? mentIntezkedesAction.bind(null, id) : undefined}
    />
```

- [ ] **Step 9: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: nincs kimenet. (Ha nem létező `app/...` modulra panaszkodik a `.next/types/validator.ts` vagy a `.next/dev/types/validator.ts`, az elavult generált fájl: `npx next typegen`, illetve `rm .next/dev/types/validator.ts`, majd újra – a forrásban nincs mit javítani.)

- [ ] **Step 10: Commit**

```bash
git add components/riport/IntezkedesDialog.tsx components/riport/IntezkedesSzerkeszto.tsx components/riport/RiportTabla.tsx components/riport/RiportReszlet.tsx "app/(app)/jelentesek/page.tsx" "app/(app)/jelentesek/[id]/page.tsx"
git commit -m "feat(jelentes-intezkedes): „Megtett intézkedés” a listában és a részletoldalon – a központ felugró ablakban írja, az attasé olvassa

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Dokumentáció (CLAUDE.md, README.md)

**Files:**
- Modify: `CLAUDE.md` (a „Riportok.” bekezdés, a „Közös segédek” bekezdés komponenslistája, a „Riportok” figyelmeztető listája)
- Modify: `README.md` (útvonal-táblázat, „Ismert korlátok”)

- [ ] **Step 1: CLAUDE.md – a „Riportok.” bekezdés vége**

A bekezdés jelenleg így végződik:

```
az ország-szűrő, a részletoldal és az űrlap továbbra is az országot mutatja.
```

Ugyanebben a bekezdésben, közvetlenül e mondat után (új sor nélkül, szóközzel) fűzd hozzá:

```
Feliratok: a `leiras` mező neve a felületen „Vezetői Összefoglaló”, a `joGyakorlat`-é „Fő üzenet/jó gyakorlat/javaslat” (opcionális; az űrlapon és a részletoldalon közvetlenül az összefoglaló után áll, nem a „További adatok” részben) – az oszlop- és mezőnevek, a hibakulcsok változatlanok. **Megtett intézkedés**: a központ (admin) jelentésenként egy szöveget rögzíthet a `riport` tábla `intezkedes` / `intezkedes_szerzo_nev` (pillanatkép, nincs FK) / `intezkedes_idopont` oszlopaiban – a három együtt `null` vagy együtt töltött, csak a `setIntezkedes` írja, üres szöveg = törlés; jog `canIntezkedni` (admin; olvasni az láthatja, aki a jelentést), validátor `parseIntezkedes`, action `mentIntezkedesAction` (form-hibát ad és `{ ok: true }`-t, nem irányít át). Felület: `IntezkedesSzerkeszto` (kiváltó elem, `valtozat: 'cella' | 'gomb'`) + `IntezkedesDialog` (nyitásonként új `key`); a lista „Intézkedés” oszlopa és a részletoldal „Megtett intézkedés” kártyája (adminnak üresen is, attasénak csak szöveggel). A `RiportTabla` (Server Component) az actiont `intezkedesAction?: (id) => FormAction` függvény-propként kapja a page-től, csak adminnál.
```

- [ ] **Step 2: CLAUDE.md – a komponenslista**

A „Közös segédek” bekezdés végén régi:

```
`RiportTorles`, `KategoriaBadge`).
```

Új:

```
`RiportTorles`, `KategoriaBadge`, `IntezkedesSzerkeszto`, `IntezkedesDialog`).
```

- [ ] **Step 3: CLAUDE.md – új pont a „Riportok” figyelmeztető listájában**

A lista utolsó pontja:

```
- A `serverActions.bodySizeLimit` és a `proxyClientMaxBodySize` is 50 MB a csatolmányok miatt (lásd az Auth bekezdést).
```

Közvetlenül utána új sorban:

```
- A `setIntezkedes` a `riport.updatedAt`-ot szándékosan **nem** lépteti (a `$onUpdate` miatt a `set`-ben ``updatedAt: sql`${riport.updatedAt}` ``): a részletoldal „módosítva” dátuma az attasé szövegére vonatkozik, az intézkedésnek saját időpontja van. Az `updateRiport` a három intézkedés-oszlophoz nem nyúl. Ha a központ újabb, saját oszlopot kap a `riport` táblán, ugyanígy kell írni.
```

- [ ] **Step 4: README.md – útvonal-táblázat**

Régi:

```
| `/jelentesek` | Információs bejegyzések listája szűrőkkel (attasé: saját, admin: mind) |
| `/jelentesek/[id]` | Bejegyzés részletei, csatolmány-letöltés |
```

Új:

```
| `/jelentesek` | Információs bejegyzések listája szűrőkkel (attasé: saját, admin: mind); „Intézkedés” oszlop: a központ megtett intézkedése, amelyet az admin a listából is rögzíthet |
| `/jelentesek/[id]` | Bejegyzés részletei, csatolmány-letöltés, a központ „Megtett intézkedés” kártyája |
```

Régi (a `/uj-jelentes` sorában):

```
kategória, tárgy, leírás, kulcsszavak, rendezvény adatai, csatolmány)
```

Új:

```
kategória, tárgy, vezetői összefoglaló, fő üzenet, kulcsszavak, rendezvény adatai, csatolmány)
```

- [ ] **Step 5: README.md – „Ismert korlátok”**

A lista első pontja (`- A bejegyzés-lista lapozás nélküli: minden találat egy oldalon jelenik meg.`) után új sorban:

```
- A „Megtett intézkedés” jelentésenként egyetlen szöveg: a korábbi változatai nem őrződnek meg,
  és az attasé nem kap értesítést a rögzítéséről.
```

- [ ] **Step 6: Ellenőrzés és commit**

```bash
grep -c "Megtett intézkedés" CLAUDE.md README.md
git add CLAUDE.md README.md
git commit -m "docs(jelentes-intezkedes): CLAUDE.md és README – új feliratok, megtett intézkedés

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Expected: a `grep` mindkét fájlra legalább `1`-et ad.

---

### Task 6: Build, böngészős QA, DB-takarítás, a demó DB commitja

Ezt a taskot a vezérlő munkamenet végzi (nem subagent). Eszköz: `B=~/.claude/skills/gstack/browse/dist/browse`, a felhasználó dev szerverén (`http://localhost:3000`). A jelszavak a `.env.local` / `.env.example` értékei, shell-változón át; kimenetbe kiírni tilos, kitöltés után ne fusson `snapshot`.

**Files:**
- Commit: `data/tet.db`

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: a `db:init` nem cserél DB-t, a `drizzle-kit migrate` nem alkalmaz újat, a `next build` hibátlan; az útvonal-listában szerepel a `/jelentesek`, `/jelentesek/[id]`, `/uj-jelentes`. (Elavult `.next/dev/types/validator.ts` hibánál: `rm .next/dev/types/validator.ts`, majd újra.)

- [ ] **Step 2: Fut-e a dev szerver**

Run: `curl -s -o /dev/null -m 10 -w '%{http_code}\n' http://localhost:3000/login`
Expected: `200`. Ha nem fut: **kérd meg a felhasználót, hogy indítsa el** (`npm run dev`); sajátot ne indíts. Ha a belépés 500-at ad „no such column: intezkedes” hibával, a szerver a migráció előtti sémát látja – a 2. task 4. lépésének ellenőrző lekérdezésével nézd meg a `data/tet.db`-t.

- [ ] **Step 3: Attasé – űrlap, új jelentés**

Belépés: `javori.balazs@demo.test`, jelszó a `.env.example` `DEMO_ATTASE_PASSWORD` értéke. Az `/uj-jelentes` oldalon ellenőrizd:

- a `label[for=leiras]` szövege „Vezetői Összefoglaló”; a `label[for=joGyakorlat]` „Fő üzenet/jó gyakorlat/javaslat” + „(opcionális)”;
- DOM-sorrend: `#targy` → `#leiras` → `#joGyakorlat` → a kulcsszavak mezője; a `#joGyakorlat` a „További adatok” részen **kívül** van;
- a „További adatok” kapcsolója: „További adatok (opcionális): kapcsolódó feladat, csatolmány”;
- üresen beküldve a `#leiras` alatt „A vezetői összefoglaló kötelező.” jelenik meg.

Adj be egy jelentést: kategória „KFI szabályozás”, tárgy `QA intézkedés teszt`, összefoglaló `QA összefoglaló`, fő üzenet `QA fő üzenet`, egy kulcsszó, kapcsolódó feladat `QA kérés`. A részletoldalon:

- „Vezetői Összefoglaló” cím az összefoglaló fölött; a „Fő üzenet/jó gyakorlat/javaslat” kártya közvetlenül alatta, a kulcsszavak előtt;
- **nincs** „Megtett intézkedés” kártya.

A `/jelentesek` listában az „Intézkedés” oszlopban „–”, gomb nincs. Jegyezd fel az `updated_at`-ot:

```bash
sqlite3 -readonly data/tet.db "select updated_at from riport where targy='QA intézkedés teszt';"
```

- [ ] **Step 4: Admin – rögzítés a listából**

Kijelentkezés, belépés: `admin@niu.hu`, jelszó a `.env.local` `SEED_ADMIN_PASSWORD` értéke. A `/jelentesek` listában a QA sorban „Intézkedés rögzítése” gomb; kattintásra a dialógus címe „Megtett intézkedés”, a leírásban a tárgy, a mező címkéje „Intézkedés szövege”, a számláló `0/5000`. Írd be: `QA intézkedés a listából`, Mentés. Ellenőrizd: „Intézkedés mentve.” toast, a dialógus bezárul, a cella a szöveget mutatja. Majd:

```bash
sqlite3 -readonly data/tet.db "select intezkedes, intezkedes_szerzo_nev, intezkedes_idopont is not null, updated_at from riport where targy='QA intézkedés teszt';"
```

Expected: `QA intézkedés a listából|Sipos Katalin|1|<ugyanaz az updated_at, mint a 3. lépésben>`.

- [ ] **Step 5: Admin – módosítás és törlés a részletoldalról**

Nyisd meg a QA jelentést. A „Megtett intézkedés” kártyán a szöveg, alatta „Sipos Katalin · <mai dátum>”, a fejlécben „Módosítás” gomb; a „módosítva …” felirat a fejlécben **nem** jelent meg. „Módosítás” → a mező a mentett szöveggel nyílik; írd át `QA intézkedés módosítva`-ra, Mentés → a kártya az új szöveget mutatja. Újra „Módosítás” → töröld ki a mezőt, Mentés → a kártyán „Még nincs rögzített intézkedés.” és „Intézkedés rögzítése” gomb. Ellenőrzés:

```bash
sqlite3 -readonly data/tet.db "select intezkedes is null, intezkedes_szerzo_nev is null, intezkedes_idopont is null from riport where targy='QA intézkedés teszt';"
```

Expected: `1|1|1`. Ezután rögzíts újra egy szöveget (`QA végső intézkedés`), hogy az attasé nézete ellenőrizhető legyen.

- [ ] **Step 6: Attasé – csak olvasás**

Kijelentkezés, belépés újra `javori.balazs@demo.test`-ként. A listában a QA sor „Intézkedés” cellája a `QA végső intézkedés` szöveg, **nem** gomb (nincs `button` a cellában). A részletoldalon a „Megtett intézkedés” kártya a szöveggel és a „Sipos Katalin · dátum” sorral, gomb nélkül. A `/jelentesek/<id>/szerkesztes` űrlapon nincs intézkedés-mező; egy mentés (pl. a tárgy végére pont) után az intézkedés megmarad:

```bash
sqlite3 -readonly data/tet.db "select targy, intezkedes from riport where targy like 'QA intézkedés teszt%';"
```

Expected: a módosított tárgy és `QA végső intézkedés`.

- [ ] **Step 7: Kijelentkezés, takarítás**

Kijelentkezés a böngészőben, majd:

```bash
sqlite3 data/tet.db "delete from riport where targy like 'QA intézkedés teszt%'; delete from session;"
sqlite3 -readonly data/tet.db "select count(*) from riport; select count(*) from riport_csatolmany; select count(*) from session;"
```

Expected: `0`, `0`, `0`.

A `delete from session` a felhasználó saját böngészős munkamenetét is törli a helyi dev szerveren (a commitolt demó DB-ben nem lehet session): ezt a záró üzenetben jelezni kell.

- [ ] **Step 8: Checkpoint, tömörítés, commit**

```bash
SCRATCH=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/85dd8b25-8254-4183-9cd5-5a43bd1bb329/scratchpad
sqlite3 data/tet.db "PRAGMA wal_checkpoint(TRUNCATE); VACUUM; PRAGMA wal_checkpoint(TRUNCATE);"
sqlite3 -readonly data/tet.db "PRAGMA integrity_check; select count(*) from user; select count(*) from orszagprofil;"
git add data/tet.db
git show :data/tet.db > "$SCRATCH/staged.db"
sqlite3 "file:$SCRATCH/staged.db?immutable=1" "PRAGMA integrity_check; select count(*) from __drizzle_migrations; select count(*) from session; select count(*) from user; select count(*) from riport; select count(*) from pragma_table_info('riport') where name like 'intezkedes%';"
git commit -m "chore(jelentes-intezkedes): a demó DB a 0010 migrációval – három intézkedés-oszlop a riport táblán

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git status --short
```

Expected: a `wal_checkpoint(TRUNCATE)` sorai `0|0|0`; `ok`, `16`, `28`; a színpadra tett fő fájl önmagában (`immutable=1`, a WAL nélkül – a hosting `db:init`-je csak a fő fájlt másolja): `ok`, `11`, `0`, `16`, `0`, `3`; a `git status --short` a commit után üres. Ha a checkpoint első száma nem `0` (foglalt), vagy a fő fájl régi állapotot mutat, ismételd meg a checkpointot, és ne commitolj, amíg nem stimmel.

---

### Task 7: Lezárás

- [ ] **Step 1: Záró, teljes ágra kiterjedő review** (`git diff main...jelentes-intezkedes`, a legelső, nem ehhez a fejlesztéshez tartozó `4a1f7df` commit kivételével), a talált hibák javítása.
- [ ] **Step 2: A spec „Állapot” sora** „megvalósítva”-ra; ha a megvalósítás eltért a spectől, a végére „Megvalósítási eltérések” szakasz, és a terv kódblokkjainak szinkronja a végleges fájlokkal. Külön `docs(jelentes-intezkedes): …` commit.
- [ ] **Step 3: Az ág lezárása** a `superpowers:finishing-a-development-branch` szerint. A futó dev szerver miatt a merge a munkafa cseréje nélkül történjen (az ág a `main`-ből indul, tehát fast-forward: `git fetch . jelentes-intezkedes:main`, majd `git checkout main`). Push előtt a felhasználót emlékeztetni kell: a push a demó DB-t is publikálja (a memóriában rögzített hosting-figyelmeztetés szerint), és a hostingon a `npm run build` `drizzle-kit migrate` lépése alkalmazza a `0010` migrációt.
