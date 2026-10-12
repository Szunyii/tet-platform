# Országprofil: a 6. blokk kettébontása (6.1 és 6.2) – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Az országprofil 6. blokkja (`kapcsolatok`) két önálló, külön menthető blokkra oszlik – „6.1. Két- és többoldalú kapcsolatok” (`nemzetkoziKapcsolatok`) és „6.2. Magyar–fogadó országbeli kapcsolatok” (`magyarKapcsolatok`) –, a DB-oszlop is kettéválik, a már mentett tartalom megmarad.

**Architecture:** A `BLOKKOK` lista adja a blokk-kulcsokat; minden blokk-tábla (`NORMALIZALOK`, `MEZO_CIMKEK`, `VALIDALOK`, `NEZETEK`) kimerítő a `BlokkKulcs` unión, ezért a kulcsok cseréje egyetlen, fordító által kikényszerített lépés. A DB két migrációval áll át (`0008`: két új oszlop + adatmásolás; `0009`: a régi oszlop törlése), olyan sorrendben, hogy a futó dev szerver egyik pillanatban se kérdezzen nem létező oszlopot: előbb az új oszlopok, aztán a kód, végül a régi oszlop törlése.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 7, Drizzle + better-sqlite3 (SQLite JSON-függvények), drizzle-kit 0.31, tsx az eldobható scripthez.

**Spec:** `docs/superpowers/specs/2026-10-12-kapcsolatok-blokk-bontas-design.md`.

---

## Közös tudnivalók (minden taskhoz)

- Ág: `kapcsolatok-bontas`, a repó fő munkafájában (`/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next`). **Ágat váltani, `git stash`-t, `git reset`-et, `git checkout -- <fájl>`-t futtatni tilos.**
- A 3000-es porton a felhasználó dev szervere fut ugyanezzel a `data/tet.db`-vel. **Leállítani, újraindítani tilos; saját dev szervert ne indíts.**
- A `data/tet.db` a munka közben módosul (migrációk), de **csak az 5. task commitolja**. Minden commit konkrét fájlokat ad hozzá; `git add -A`, `git add .`, `git commit -a` tilos. A `data/tet.db`-t visszaállítani tilos.
- Minden parancs a repó gyökeréből fut. Összetett parancsban ne használj `cd`-t.
- Nincs tesztkeretrendszer és nincs linter. Az ellenőrzés: `npx tsc --noEmit`, a demó-futtató ellenőrző módja, SQL-összevetés, a végén `npm run build` és böngészős QA.
- Commit-üzenet: magyar, `típus(kapcsolatok-bontas): …` alakban, a végén üres sor után `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- A scratchpad (nem része a repónak):

  ```bash
  SCRATCH=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/eccc1dfb-b720-4b81-8b6f-a02136044935/scratchpad
  ```

### Előkészítve a scratchpadben (a terv írásakor elkészült és ki lett próbálva)

- `$SCRATCH/tet-pre-0008.db`: a `data/tet.db` mentése a migráció előtt (28 profilsor, 25-ben mentett `kapcsolatok`). **Ne írd felül.**
- `$SCRATCH/bontas-ellenorzes.sql`: az adat-összevetés a mentéssel. Futtatás:

  ```bash
  sqlite3 -readonly data/tet.db < "$SCRATCH/bontas-ellenorzes.sql"
  ```

  Tartalma:

  ```sql
  ATTACH 'file:/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/eccc1dfb-b720-4b81-8b6f-a02136044935/scratchpad/tet-pre-0008.db?immutable=1' AS regi;
  SELECT 'sorok', count(*) FROM orszagprofil;
  SELECT 'null_egyezik', count(*) FROM orszagprofil u JOIN regi.orszagprofil r ON r.id = u.id
    WHERE (r.kapcsolatok IS NULL) = (u.nemzetkozi_kapcsolatok IS NULL)
      AND (r.kapcsolatok IS NULL) = (u.magyar_kapcsolatok IS NULL);
  SELECT 'mezok_egyeznek', count(*) FROM orszagprofil u JOIN regi.orszagprofil r ON r.id = u.id
    WHERE r.kapcsolatok IS NOT NULL
      AND json_extract(u.nemzetkozi_kapcsolatok, '$.partnerorszagok') IS coalesce(json_extract(r.kapcsolatok, '$.partnerorszagok'), '')
      AND json_extract(u.nemzetkozi_kapcsolatok, '$.euMultilateralis') IS coalesce(json_extract(r.kapcsolatok, '$.euMultilateralis'), '')
      AND json_extract(u.magyar_kapcsolatok, '$.egyezmeny') IS coalesce(json_extract(r.kapcsolatok, '$.egyezmeny'), '')
      AND json_extract(u.magyar_kapcsolatok, '$.ketoldalu') IS coalesce(json_extract(r.kapcsolatok, '$.ketoldalu'), '')
      AND json_extract(u.magyar_kapcsolatok, '$.mobilitas') IS coalesce(json_extract(r.kapcsolatok, '$.mobilitas'), '');
  SELECT 'meta_valtozatlan', count(*) FROM orszagprofil u JOIN regi.orszagprofil r ON r.id = u.id
    WHERE u.updated_at = r.updated_at AND u.created_at = r.created_at AND u.szerzo_id IS r.szerzo_id;
  SELECT 'tobbi_blokk_valtozatlan', count(*) FROM orszagprofil u JOIN regi.orszagprofil r ON r.id = u.id
    WHERE u.alapadatok IS r.alapadatok AND u.kfi_rendszer IS r.kfi_rendszer AND u.intezmenyek IS r.intezmenyek
      AND u.vallalati IS r.vallalati AND u.programok IS r.programok AND u.rendezvenyek IS r.rendezvenyek
      AND u.magyar_ertekeles IS r.magyar_ertekeles;
  SELECT 'nk_kulcsok', count(*) FROM orszagprofil u, json_each(u.nemzetkozi_kapcsolatok);
  SELECT 'mk_kulcsok', count(*) FROM orszagprofil u, json_each(u.magyar_kapcsolatok);
  SELECT 'regi_oszlop', count(*) FROM pragma_table_info('orszagprofil') WHERE name = 'kapcsolatok';
  SELECT 'migraciok', count(*) FROM __drizzle_migrations;
  ```

- `$SCRATCH/bontas.mjs`: az országfájlok átalakítója (a 2. task használja; a tartalma ott szerepel).

## Fájlszerkezet

| Fájl | Változás | Task |
| --- | --- | --- |
| `lib/orszagprofil-szotar.ts` | két új interfész; `BLOKKOK`, `ProfilBlokkok`, `NORMALIZALOK`, `MEZO_CIMKEK` átállítása; végül a `Kapcsolatok` interfész törlése | 1, 2, 3 |
| `db/schema/orszagprofil.ts` | két új oszlop; végül a `kapcsolatok` oszlop törlése | 1, 3 |
| `drizzle/0008_kapcsolatok_bontas.sql` (+ snapshot, journal) | új: két `ADD` + adatmásolás | 1 |
| `drizzle/0009_kapcsolatok_oszlop_torles.sql` (+ snapshot, journal) | új: `DROP COLUMN` | 3 |
| `lib/orszagprofil-validacio.ts` | a `kapcsolatok` validáló helyett kettő | 2 |
| `app/(app)/orszagprofil/components/mezok/NemzetkoziKapcsolatokMezok.tsx` | új | 2 |
| `app/(app)/orszagprofil/components/mezok/MagyarKapcsolatokMezok.tsx` | új | 2 |
| `app/(app)/orszagprofil/components/mezok/KapcsolatokMezok.tsx` | törlés | 2 |
| `app/(app)/orszagprofil/[kod]/szerkesztes/page.tsx` | a két új komponens, komment | 2 |
| `components/orszagprofil/BlokkNezet.tsx` | a `NEZETEK` két új bejegyzése | 2 |
| `app/(app)/orszagprofil/components/BlokkForm.tsx`, `app/(app)/orszagprofil/actions.ts` | komment: 8 → 9 blokk | 2 |
| `scripts/demo-orszagprofil/orszagok/*.ts` | 25 fájlban a blokk kettéosztása, 9 fájlban fejléc-komment | 2 |
| `CLAUDE.md`, `README.md` | dokumentáció | 4 |
| `data/tet.db` | migrálva, takarítva, commitolva | 1, 3, 5 |

---

### Task 1: Új típusok, két új oszlop, `0008` migráció adatmásolással

A régi `kapcsolatok` oszlop és a `Kapcsolatok` típus ebben a taskban még megmarad: a kód továbbra is a régi blokkot használja, az új oszlopok csak létrejönnek és megkapják az adatot.

**Files:**
- Modify: `lib/orszagprofil-szotar.ts` (a `Kapcsolatok` interfész után)
- Modify: `db/schema/orszagprofil.ts`
- Create (generált): `drizzle/0008_kapcsolatok_bontas.sql`, `drizzle/meta/0008_snapshot.json`
- Modify (generált): `drizzle/meta/_journal.json`
- Módosul, de nem commitolandó: `data/tet.db`

- [ ] **Step 1: A mentés megléte**

```bash
SCRATCH=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/eccc1dfb-b720-4b81-8b6f-a02136044935/scratchpad
[ -e "$SCRATCH/tet-pre-0008.db" ] || sqlite3 data/tet.db ".backup '$SCRATCH/tet-pre-0008.db'"
sqlite3 "file:$SCRATCH/tet-pre-0008.db?immutable=1" "select count(*), sum(kapcsolatok is not null) from orszagprofil;"
```

Elvárt kimenet: `28|25`. Ha más, állj meg és jelezd (a mentés nem a migráció előtti állapot).

- [ ] **Step 2: Az összevetés még hibát ad**

```bash
sqlite3 -readonly data/tet.db < "$SCRATCH/bontas-ellenorzes.sql"
```

Elvárt: `sorok|28`, utána `no such column: u.nemzetkozi_kapcsolatok` hibák (az új oszlopok még nincsenek; a `sqlite3` a hibás utasítások után is továbbmegy, ezért több hibasor is lehet).

- [ ] **Step 3: Két új interfész a szótárban**

A `lib/orszagprofil-szotar.ts`-ben a `Kapcsolatok` interfész **után** (a `MagyarErtekeles` elé) szúrd be:

```ts
export interface NemzetkoziKapcsolatok {
  partnerorszagok: string;
  euMultilateralis: string;
}
export interface MagyarKapcsolatok {
  egyezmeny: string;
  ketoldalu: string;
  mobilitas: string;
}
```

A `Kapcsolatok` interfész, a `BLOKKOK`, a `ProfilBlokkok` és a többi tábla most nem változik.

- [ ] **Step 4: Két új oszlop a sémában**

A `db/schema/orszagprofil.ts` importja:

```ts
import type {
  Alapadatok, Intezmenyek, Kapcsolatok, KfiRendszer, MagyarErtekeles, MagyarKapcsolatok, NemzetkoziKapcsolatok,
  Programok, Rendezvenyek, Vallalati,
} from '../../lib/orszagprofil-szotar';
```

A `kapcsolatok` oszlop sora után két új sor:

```ts
    kapcsolatok: text('kapcsolatok', { mode: 'json' }).$type<Kapcsolatok>(),
    nemzetkoziKapcsolatok: text('nemzetkozi_kapcsolatok', { mode: 'json' }).$type<NemzetkoziKapcsolatok>(),
    magyarKapcsolatok: text('magyar_kapcsolatok', { mode: 'json' }).$type<MagyarKapcsolatok>(),
    magyarErtekeles: text('magyar_ertekeles', { mode: 'json' }).$type<MagyarErtekeles>(),
```

A 4–7. lépést egymás után, megszakítás nélkül végezd: a séma mentése és a migráció között a futó dev szerver nem létező oszlopot kérdezne.

- [ ] **Step 5: A migráció generálása**

```bash
npx drizzle-kit generate --name=kapcsolatok_bontas
```

Elvárt: létrejön a `drizzle/0008_kapcsolatok_bontas.sql`, benne pontosan ez a két utasítás (a kettő sorrendje mindegy):

```sql
ALTER TABLE `orszagprofil` ADD `nemzetkozi_kapcsolatok` text;--> statement-breakpoint
ALTER TABLE `orszagprofil` ADD `magyar_kapcsolatok` text;
```

Ha a drizzle-kit kérdést tesz fel, vagy a fájlban bármi más utasítás is van (más tábla, `__new_…`, `DROP`), **állj meg és jelezd** – ne commitolj.

- [ ] **Step 6: Az adatmásolás hozzáfűzése**

Írd át a `drizzle/0008_kapcsolatok_bontas.sql`-t, hogy a teljes tartalma ez legyen (a második `ADD` sor végére is kerül `--> statement-breakpoint`; a komment az `UPDATE`-tel egy szakaszban van, mert egy csak kommentet tartalmazó szakaszon a migrátor elbukna):

```sql
ALTER TABLE `orszagprofil` ADD `nemzetkozi_kapcsolatok` text;--> statement-breakpoint
ALTER TABLE `orszagprofil` ADD `magyar_kapcsolatok` text;--> statement-breakpoint
-- Adat (kézzel hozzáadva): a régi `kapcsolatok` blokk öt mezője a két új blokkba. Ahol a régi blokk
-- mentett volt, mindkét új blokk mentett lesz (a hiányzó kulcs üres szöveg); a nem mentett (NULL)
-- sorban mindkettő NULL marad. A régi oszlopot a 0009 törli.
UPDATE `orszagprofil` SET
  `nemzetkozi_kapcsolatok` = json_object(
    'partnerorszagok', coalesce(json_extract(`kapcsolatok`, '$.partnerorszagok'), ''),
    'euMultilateralis', coalesce(json_extract(`kapcsolatok`, '$.euMultilateralis'), '')
  ),
  `magyar_kapcsolatok` = json_object(
    'egyezmeny', coalesce(json_extract(`kapcsolatok`, '$.egyezmeny'), ''),
    'ketoldalu', coalesce(json_extract(`kapcsolatok`, '$.ketoldalu'), ''),
    'mobilitas', coalesce(json_extract(`kapcsolatok`, '$.mobilitas'), '')
  )
WHERE `kapcsolatok` IS NOT NULL AND json_valid(`kapcsolatok`);
```

A `drizzle/meta/0008_snapshot.json`-hoz és a `_journal.json`-hoz ne nyúlj kézzel.

- [ ] **Step 7: A migráció alkalmazása**

```bash
npm run db:migrate
```

Elvárt: hiba nélkül lefut (`exit 0`). Ha `exit 1` üzenet nélkül: a DB változatlan (a migrátor tranzakcióban fut) – állj meg és jelezd.

- [ ] **Step 8: Adat-összevetés a mentéssel**

```bash
sqlite3 -readonly data/tet.db < "$SCRATCH/bontas-ellenorzes.sql"
```

Elvárt kimenet, pontosan:

```
sorok|28
null_egyezik|28
mezok_egyeznek|25
meta_valtozatlan|28
tobbi_blokk_valtozatlan|28
nk_kulcsok|50
mk_kulcsok|75
regi_oszlop|1
migraciok|9
```

- [ ] **Step 9: Típusellenőrzés**

```bash
npx tsc --noEmit
```

Elvárt: nincs kimenet (0 hiba).

- [ ] **Step 10: Commit** (a `data/tet.db` nélkül)

```bash
git add lib/orszagprofil-szotar.ts db/schema/orszagprofil.ts drizzle/0008_kapcsolatok_bontas.sql drizzle/meta/0008_snapshot.json drizzle/meta/_journal.json
git commit -m "feat(kapcsolatok-bontas): két új JSON-oszlop és a 0008 migráció – a kapcsolatok blokk tartalma a nemzetkozi_kapcsolatok és magyar_kapcsolatok oszlopba

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git status --short
```

Elvárt `git status --short`: üres, vagy egyetlen sor: ` M data/tet.db`. (A DB WAL módú, és a futó dev szerver nyitva tartja: a migráció a gitignore-olt `data/tet.db-wal`-ban él, a fő fájl az 5. task checkpointjáig változatlan maradhat. Checkpointot emiatt ne futtass.)

---

### Task 2: Átállás a két új blokkra (szótár, validátor, űrlap, olvasó nézet, országfájlok)

A blokk-kulcsok cseréje atomi: a `BLOKKOK` változása után a fordító minden kimerítő táblát és az országfájlokat is számon kéri, ezért a task végéig a `tsc` nem zöld. A `Kapcsolatok` interfész és a séma `kapcsolatok` oszlopa ebben a taskban még marad (a 3. task törli).

**Files:**
- Modify: `lib/orszagprofil-szotar.ts`
- Modify: `lib/orszagprofil-validacio.ts`
- Create: `app/(app)/orszagprofil/components/mezok/NemzetkoziKapcsolatokMezok.tsx`
- Create: `app/(app)/orszagprofil/components/mezok/MagyarKapcsolatokMezok.tsx`
- Delete: `app/(app)/orszagprofil/components/mezok/KapcsolatokMezok.tsx`
- Modify: `app/(app)/orszagprofil/[kod]/szerkesztes/page.tsx`
- Modify: `components/orszagprofil/BlokkNezet.tsx`
- Modify: `app/(app)/orszagprofil/components/BlokkForm.tsx` (komment), `app/(app)/orszagprofil/actions.ts` (komment)
- Modify: `scripts/demo-orszagprofil/orszagok/*.ts` (25 fájl gépi átalakítással, 9 fájl fejléc-kommentje kézzel)
- Eldobható, nem commitolandó: `scripts/_egyezes.ts`

- [ ] **Step 1: A demó-futtató kimenete az átállás előtt**

```bash
SCRATCH=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/eccc1dfb-b720-4b81-8b6f-a02136044935/scratchpad
NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts > "$SCRATCH/demo-elotte.txt"
awk '/blokk rendben/ {n++; s+=$2} END {print n, s}' "$SCRATCH/demo-elotte.txt"
```

Elvárt: `27 189` (27 ország, összesen 189 blokk).

- [ ] **Step 2: Szótár – `BLOKKOK`**

A `lib/orszagprofil-szotar.ts` `BLOKKOK` listájában a `kapcsolatok` sor helyére két sor:

```ts
  { kulcs: 'rendezvenyek', cim: '5. Jelentősebb KFI rendezvények' },
  { kulcs: 'nemzetkoziKapcsolatok', cim: '6.1. Két- és többoldalú kapcsolatok' },
  { kulcs: 'magyarKapcsolatok', cim: '6.2. Magyar–fogadó országbeli kapcsolatok' },
  { kulcs: 'magyarErtekeles', cim: '7. Magyar szempontú értékelés és lehetőségek' },
```

(A „Magyar–fogadó” nagykötőjellel, U+2013, ahogy a fájl többi szövegében.)

- [ ] **Step 3: Szótár – `ProfilBlokkok`**

```ts
export interface ProfilBlokkok {
  alapadatok: Alapadatok;
  kfiRendszer: KfiRendszer;
  intezmenyek: Intezmenyek;
  vallalati: Vallalati;
  programok: Programok;
  rendezvenyek: Rendezvenyek;
  nemzetkoziKapcsolatok: NemzetkoziKapcsolatok;
  magyarKapcsolatok: MagyarKapcsolatok;
  magyarErtekeles: MagyarErtekeles;
}
```

- [ ] **Step 4: Szótár – `NORMALIZALOK`**

A `kapcsolatok: (r) => ({ … }),` bejegyzés helyére:

```ts
  nemzetkoziKapcsolatok: (r) => ({
    partnerorszagok: szoveg(r.partnerorszagok), euMultilateralis: szoveg(r.euMultilateralis),
  }),
  magyarKapcsolatok: (r) => ({
    egyezmeny: szoveg(r.egyezmeny), ketoldalu: szoveg(r.ketoldalu), mobilitas: szoveg(r.mobilitas),
  }),
```

- [ ] **Step 5: Szótár – `MEZO_CIMKEK`**

A `kapcsolatok: { … },` bejegyzés (öt mezővel) helyére az alábbi kettő. A `magyarazat` és a `pelda` szövegek szó szerint a régiek; csak a `partnerorszagok` és a `mobilitas` `cimke`-je új, és a `partnerorszagok` került előre.

```ts
  nemzetkoziKapcsolatok: {
    partnerorszagok: {
      cimke: 'Legfőbb partnerországok',
      magyarazat: 'Azok az országok, amelyekkel a fogadó ország KFI-együttműködése a legintenzívebb, az együttműködés jellegével.',
      pelda: 'USA (Technology Prosperity Deal, 2025), EU (Horizont Európa-társulás, digitális és zöld partnerség).',
    },
    euMultilateralis: {
      cimke: 'EU és multilaterális kapcsolatok',
      magyarazat: 'Az ország kapcsolata az EU-val és többoldalú szervezetekkel, programokkal a KFI területén: társulás, partnerségek, tagság, vegyesbizottság.',
      pelda: 'Horizont Európa-társult ország (II. pillér) 2025-től; EU–Korea Digitális Partnerség (2022) és Zöld Partnerség (2023); az EUREKA teljes jogú tagja.',
    },
  },
  magyarKapcsolatok: {
    egyezmeny: {
      cimke: 'Érvényes TéT-egyezmény',
      magyarazat: 'A Magyarországgal kötött hatályos tudományos-technológiai egyezmény megnevezése és aláírásának éve, egy sorban. Ha nincs, hagyd üresen.',
      pelda: 'Magyar–koreai kormányközi egyezmény a tudományos és műszaki együttműködésről (1989)',
    },
    ketoldalu: {
      cimke: 'Kétoldalú együttműködések',
      magyarazat: 'A magyar–fogadó országbeli KFI-együttműködések: vegyesbizottsági ülések, közös felhívások, egyetértési megállapodások, közös projektek – évszámmal.',
      pelda: 'TéT-vegyesbizottság 10. ülése (2021); NKFIH–NRF közös felhívás (2022: 5 magyar nyertes); V4–Korea közös felhívás (2023).',
    },
    mobilitas: {
      cimke: 'Mobilitási lehetőségek',
      magyarazat: 'Ösztöndíjak, kutatócsere, hallgatói és kutatói mozgás a két ország között: program, létszám, év.',
      pelda: 'Stipendium Hungaricum: évi 100 hely, 2025/26-ban 63 ösztöndíjas; Global Korea Scholarship: 2026-ban 4 nagykövetségi hely.',
    },
  },
```

A szövegeket ne gépeld újra: a meglévő sorokat mozgasd, és a végén ellenőrizd:

```bash
git diff -U0 lib/orszagprofil-szotar.ts | grep -E "^[-+] +(magyarazat|pelda):" | cut -c2- | sort | uniq -c | awk '$1 != 2'
```

Elvárt: nincs kimenet. A diffben megjelenő (áthelyezett) `magyarazat`/`pelda` sorok mindegyike pontosan kétszer szerepel: egyszer törölt, egyszer hozzáadott sorként, azonos szöveggel. Ami itt megjelenik, annak a szövege megváltozott – állítsd vissza az eredetit.

- [ ] **Step 6: Validátor**

A `lib/orszagprofil-validacio.ts` `VALIDALOK` táblájában a `kapcsolatok: (fd, errors) => { … },` bejegyzés helyére:

```ts
  nemzetkoziKapcsolatok: (fd, errors) => {
    const b = 'nemzetkoziKapcsolatok';
    return {
      partnerorszagok: szoveg(fd, b, 'partnerorszagok', SZOVEG_MAX, errors),
      euMultilateralis: szoveg(fd, b, 'euMultilateralis', SZOVEG_MAX, errors),
    };
  },
  magyarKapcsolatok: (fd, errors) => {
    const b = 'magyarKapcsolatok';
    return {
      egyezmeny: szoveg(fd, b, 'egyezmeny', ROVID_MAX, errors),
      ketoldalu: szoveg(fd, b, 'ketoldalu', SZOVEG_MAX, errors),
      mobilitas: szoveg(fd, b, 'mobilitas', SZOVEG_MAX, errors),
    };
  },
```

Az importok nem változnak.

- [ ] **Step 7: Új űrlap – `NemzetkoziKapcsolatokMezok.tsx`**

Hozd létre: `app/(app)/orszagprofil/components/mezok/NemzetkoziKapcsolatokMezok.tsx` (a `ProgramokMezok.tsx` stílusában: aposztróf, egysoros mezők).

```tsx
'use client';

import { SzovegMezo } from '../../../../../components/form/Mezo';
import { MEZO_CIMKEK, SZOVEG_MAX, type NemzetkoziKapcsolatok } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.nemzetkoziKapcsolatok;
const B = 'nemzetkoziKapcsolatok';

export function NemzetkoziKapcsolatokMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<NemzetkoziKapcsolatok>) {
  const [e, set] = useBlokkAllapot(initial);
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <SzovegMezo id={mezoId(B, 'partnerorszagok')} name="partnerorszagok" {...C.partnerorszagok} value={e.partnerorszagok} onChange={set('partnerorszagok')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'euMultilateralis')} name="euMultilateralis" {...C.euMultilateralis} value={e.euMultilateralis} onChange={set('euMultilateralis')} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}
```

- [ ] **Step 8: Új űrlap – `MagyarKapcsolatokMezok.tsx`**

Hozd létre: `app/(app)/orszagprofil/components/mezok/MagyarKapcsolatokMezok.tsx`.

```tsx
'use client';

import { RovidMezo, SzovegMezo } from '../../../../../components/form/Mezo';
import { MEZO_CIMKEK, ROVID_MAX, SZOVEG_MAX, type MagyarKapcsolatok } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.magyarKapcsolatok;
const B = 'magyarKapcsolatok';

export function MagyarKapcsolatokMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<MagyarKapcsolatok>) {
  const [e, set] = useBlokkAllapot(initial);
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <RovidMezo id={mezoId(B, 'egyezmeny')} name="egyezmeny" {...C.egyezmeny} value={e.egyezmeny} onChange={set('egyezmeny')} max={ROVID_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'ketoldalu')} name="ketoldalu" {...C.ketoldalu} value={e.ketoldalu} onChange={set('ketoldalu')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'mobilitas')} name="mobilitas" {...C.mobilitas} value={e.mobilitas} onChange={set('mobilitas')} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}
```

- [ ] **Step 9: A régi űrlap törlése**

```bash
git rm -q "app/(app)/orszagprofil/components/mezok/KapcsolatokMezok.tsx"
```

- [ ] **Step 10: Szerkesztő oldal**

Az `app/(app)/orszagprofil/[kod]/szerkesztes/page.tsx`-ben a `KapcsolatokMezok` import helyére (a `RendezvenyekMezok` és a `MagyarErtekelesMezok` import közé):

```ts
import { NemzetkoziKapcsolatokMezok } from '../../components/mezok/NemzetkoziKapcsolatokMezok';
import { MagyarKapcsolatokMezok } from '../../components/mezok/MagyarKapcsolatokMezok';
```

A `<KapcsolatokMezok … />` sor helyére:

```tsx
        <NemzetkoziKapcsolatokMezok {...kozos} initial={b.nemzetkoziKapcsolatok ?? uresBlokk('nemzetkoziKapcsolatok')} mentve={m('nemzetkoziKapcsolatok')} />
        <MagyarKapcsolatokMezok {...kozos} initial={b.magyarKapcsolatok ?? uresBlokk('magyarKapcsolatok')} mentve={m('magyarKapcsolatok')} />
```

A `<Fragment key={ev}>` fölötti kommentben `a 8 blokk kliens-állapota` → `a 9 blokk kliens-állapota`.

- [ ] **Step 11: Olvasó nézet**

A `components/orszagprofil/BlokkNezet.tsx` `NEZETEK` táblájában a `kapcsolatok: (b) => { … },` bejegyzés helyére:

```tsx
  nemzetkoziKapcsolatok: (b) => {
    const C = MEZO_CIMKEK.nemzetkoziKapcsolatok;
    return (
      <dl className="flex flex-col gap-3">
        {(['partnerorszagok', 'euMultilateralis'] as const).map((k) => (
          <Sor key={k} cimke={C[k].cimke}><Szoveg v={b[k]} /></Sor>
        ))}
      </dl>
    );
  },
  magyarKapcsolatok: (b) => {
    const C = MEZO_CIMKEK.magyarKapcsolatok;
    return (
      <dl className="flex flex-col gap-3">
        {(['egyezmeny', 'ketoldalu', 'mobilitas'] as const).map((k) => (
          <Sor key={k} cimke={C[k].cimke}><Szoveg v={b[k]} /></Sor>
        ))}
      </dl>
    );
  },
```

- [ ] **Step 12: Kommentek – 8 → 9 blokk**

- `app/(app)/orszagprofil/components/BlokkForm.tsx`: `egyedi a 8 blokkos DOM-ban` → `egyedi a 9 blokkos DOM-ban`
- `app/(app)/orszagprofil/actions.ts`: `A szerkesztő oldalon 8 blokk van egy DOM-ban` → `A szerkesztő oldalon 9 blokk van egy DOM-ban`

- [ ] **Step 13: Az országfájlok gépi átalakítása**

A `$SCRATCH/bontas.mjs` már létezik; ha hiányzik, hozd létre ezzel a tartalommal:

```js
// Eldobható átalakító: az országfájlok `kapcsolatok` blokkját két blokkra osztja.
// A mezők sorai (a mező sora + a folytatósorok) változatlanul kerülnek át, csak a sorrend és a
// blokk-fejléc változik. Használat: node bontas.mjs <orszagfajl>...
import { readFileSync, writeFileSync } from 'node:fs';

const NK = ['partnerorszagok', 'euMultilateralis'];
const MK = ['egyezmeny', 'ketoldalu', 'mobilitas'];
const MEZO = /^      ([a-zA-Z]+):/;

for (const ut of process.argv.slice(2)) {
  const sorok = readFileSync(ut, 'utf8').split('\n');
  const kezd = sorok.indexOf('    kapcsolatok: {');
  if (kezd === -1) {
    console.log(`${ut}: nincs kapcsolatok blokk, kihagyva`);
    continue;
  }
  if (sorok.indexOf('    kapcsolatok: {', kezd + 1) !== -1) throw new Error(`${ut}: több kapcsolatok blokk`);
  const veg = sorok.indexOf('    },', kezd);
  if (veg === -1) throw new Error(`${ut}: nincs meg a blokk vége`);

  // Mezőnként a hozzá tartozó sorok.
  const mezok = new Map();
  let akt = null;
  for (const sor of sorok.slice(kezd + 1, veg)) {
    const m = MEZO.exec(sor);
    if (m) {
      if (mezok.has(m[1])) throw new Error(`${ut}: kétszer szerepel: ${m[1]}`);
      akt = [];
      mezok.set(m[1], akt);
    } else if (akt === null || !sor.startsWith('        ')) {
      throw new Error(`${ut}: váratlan sor a blokkban: ${sor}`);
    }
    akt.push(sor);
  }
  for (const k of mezok.keys()) {
    if (!NK.includes(k) && !MK.includes(k)) throw new Error(`${ut}: ismeretlen mező: ${k}`);
  }
  const resz = (kulcsok) => kulcsok.flatMap((k) => mezok.get(k) ?? []);
  const nk = resz(NK);
  const mk = resz(MK);
  if (nk.length === 0 || mk.length === 0) throw new Error(`${ut}: az egyik félnek nincs mezője, kézzel kell eldönteni`);

  sorok.splice(
    kezd,
    veg - kezd + 1,
    '    nemzetkoziKapcsolatok: {', ...nk, '    },',
    '    magyarKapcsolatok: {', ...mk, '    },',
  );
  writeFileSync(ut, sorok.join('\n'));
  const db = (kulcsok) => kulcsok.filter((k) => mezok.has(k)).length;
  console.log(`${ut}: nemzetkoziKapcsolatok ${db(NK)} mező, magyarKapcsolatok ${db(MK)} mező`);
}
```

Futtatás:

```bash
node "$SCRATCH/bontas.mjs" scripts/demo-orszagprofil/orszagok/*.ts
```

Elvárt: 25 sor `… nemzetkoziKapcsolatok 2 mező, magyarKapcsolatok 3 mező` (az `mr.ts`-nél `magyarKapcsolatok 2 mező`: ott nincs `egyezmeny`), és két sor `nincs kapcsolatok blokk, kihagyva` (`pr.ts`, `vi.ts`). Hibára (`Error`) állj meg és jelezd.

- [ ] **Step 14: Az átalakítás ellenőrzése – csak a fejlécsorok változtak**

A fejléc-kommentek kézi javítása (15. lépés) **előtt** futtasd:

```bash
for f in scripts/demo-orszagprofil/orszagok/*.ts; do diff <(git show "HEAD:$f" | sort) <(sort "$f") | grep '^[<>]'; done | sort | uniq -c
```

Elvárt kimenet, pontosan ez a négy sor (a sorrend eltérhet):

```
  25 <     kapcsolatok: {
  25 >     magyarKapcsolatok: {
  25 >     nemzetkoziKapcsolatok: {
  25 >     },
```

Vagyis fájlonként a régi blokk-fejléc helyett két új fejléc és egy új záró sor van, minden más sor (a szövegek) bájtra azonos.

- [ ] **Step 15: Fejléc-kommentek kézi javítása (9 fájl, 13 csere)**

A fájlok elején álló kommentek a régi blokknévvel hivatkoznak mezőkre. Pontos cserék (fájlonként a megadott szövegrész egyszer fordul elő):

| Fájl | Régi | Új |
| --- | --- | --- |
| `ca.ts` | `Kimaradt mezők: kapcsolatok.egyezmeny (` | `Kimaradt mezők: magyarKapcsolatok.egyezmeny (` |
| `ca.ts` | `, kapcsolatok.mobilitas (` | `, magyarKapcsolatok.mobilitas (` |
| `ie.ts` | `a kapcsolatok.egyezmeny üres` | `a magyarKapcsolatok.egyezmeny üres` |
| `kp.ts` | `kapcsolatok.egyezmeny és ketoldalu:` | `magyarKapcsolatok.egyezmeny és ketoldalu:` |
| `mr.ts` | `a kapcsolatok.egyezmeny és` | `a magyarKapcsolatok.egyezmeny és` |
| `gy.ts` | `kapcsolatok.euMultilateralis (az egyetlen` | `nemzetkoziKapcsolatok.euMultilateralis (az egyetlen` |
| `gy.ts` | `szerepel), .egyezmeny és .ketoldalu (` | `szerepel), magyarKapcsolatok.egyezmeny és .ketoldalu (` |
| `sr.ts` | `kapcsolatok.euMultilateralis (a tagságokon` | `nemzetkoziKapcsolatok.euMultilateralis (a tagságokon` |
| `sr.ts` | `tartalom), .egyezmeny és .ketoldalu (` | `tartalom), magyarKapcsolatok.egyezmeny és .ketoldalu (` |
| `pr.ts` | `, kapcsolatok (nincs ellenőrzött magyar` | `, nemzetkoziKapcsolatok és magyarKapcsolatok (nincs ellenőrzött magyar` |
| `vi.ts` | `vallalati, rendezvenyek, kapcsolatok (nincs` | `vallalati, rendezvenyek, nemzetkoziKapcsolatok, magyarKapcsolatok (nincs` |
| `us.ts` | `mind a 8 blokk kitöltve` | `mind a 9 blokk kitöltve` |
| `kp.ts` | `Csak az Alapadatok, a Kapcsolatok és a Magyar értékelés blokk szerepel;` | `Csak az Alapadatok, a két kapcsolati blokk (6.1., 6.2.) és a Magyar értékelés blokk szerepel;` |

(Mind a `scripts/demo-orszagprofil/orszagok/` alatt.) Ellenőrzés:

```bash
grep -nE "(^|[^a-zA-Z])kapcsolatok(\.[a-zA-Z]| \(nincs)|^    kapcsolatok:|mind a 8 blokk" scripts/demo-orszagprofil/orszagok/*.ts
```

Elvárt: nincs kimenet.

- [ ] **Step 16: Típusellenőrzés**

```bash
npx tsc --noEmit
```

Elvárt: nincs kimenet (0 hiba). Ha egy kimerítő tábla hiányos vagy maradt `kapcsolatok` hivatkozás, a fordító megnevezi.

- [ ] **Step 17: A demó-futtató az átállás után**

```bash
NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts > "$SCRATCH/demo-utana.txt"; echo "exit=$?"
awk '/blokk rendben/ {n++; s+=$2} END {print n, s}' "$SCRATCH/demo-utana.txt"
join <(awk '/blokk rendben/ {print $1, $2}' "$SCRATCH/demo-elotte.txt") <(awk '/blokk rendben/ {print $1, $2}' "$SCRATCH/demo-utana.txt") | awk '{print $3 - $2}' | sort | uniq -c
```

Elvárt: `exit=0`; `27 214`; majd `   2 0` és `  25 1` (25 országnál eggyel több blokk, `PR` és `VI` változatlan).

- [ ] **Step 18: A DB és az országfájlok egyezése (eldobható script)**

Hozd létre: `scripts/_egyezes.ts`

```ts
// Eldobható ellenőrzés: a DB 2026-os profiljai megegyeznek-e az országfájlok validált értékeivel.
// Futtatás: NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_egyezes.ts
import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { getProfil } from '../db/queries/orszagprofil';
import { BLOKK_KULCSOK } from '../lib/orszagprofil-szotar';
import { validalBlokk } from '../lib/orszagprofil-validacio';
import { urlapFormData, type DemoOrszag } from './demo-orszagprofil/tipusok';

const EV = 2026;
const MAPPA = resolve(process.cwd(), 'scripts/demo-orszagprofil/orszagok');

async function main() {
  let elteres = 0;
  let blokkDb = 0;
  for (const fajl of readdirSync(MAPPA).filter((f) => /^[a-z]{2}\.ts$/.test(f)).sort()) {
    const o = ((await import(pathToFileURL(join(MAPPA, fajl)).href)) as { default: DemoOrszag }).default;
    const profil = getProfil(o.kod, EV);
    for (const blokk of BLOKK_KULCSOK) {
      const u = o.profil[blokk];
      const db = profil?.blokkok[blokk];
      if (u == null) {
        if (db !== undefined) {
          elteres++;
          console.log(`${o.kod}.${blokk}: a DB-ben mentett, a fájlban nincs`);
        }
        continue;
      }
      const e = validalBlokk(blokk, urlapFormData(u), EV);
      if (!e.ok) {
        elteres++;
        console.log(`${o.kod}.${blokk}: a fájl nem érvényes`);
        continue;
      }
      blokkDb++;
      if (!isDeepStrictEqual(e.ertek, db)) {
        elteres++;
        console.log(`${o.kod}.${blokk}: ELTÉR`);
      }
    }
  }
  console.log(`${blokkDb} blokk összevetve, ${elteres} eltérés`);
  process.exit(elteres === 0 ? 0 : 1);
}

main();
```

Futtatás, majd törlés:

```bash
NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_egyezes.ts; echo "exit=$?"
rm scripts/_egyezes.ts
```

Elvárt: egy `[db] …` sor, majd `214 blokk összevetve, 0 eltérés`, `exit=0`. Ha a két kapcsolati blokkban van eltérés, az átalakítás hibás – állj meg és jelezd. Ha csak más blokkban, az korábbi állapot: jelezd a jelentésben, de folytasd.

- [ ] **Step 19: Commit** (a `data/tet.db` és a `scripts/_egyezes.ts` nélkül)

```bash
git add lib/orszagprofil-szotar.ts lib/orszagprofil-validacio.ts components/orszagprofil/BlokkNezet.tsx "app/(app)/orszagprofil" scripts/demo-orszagprofil/orszagok
git status --short
```

Elvárt `git status --short`, az indexben:

- `lib/`: 2 módosított fájl (`orszagprofil-szotar.ts`, `orszagprofil-validacio.ts`);
- `components/orszagprofil/BlokkNezet.tsx`: módosított;
- `app/(app)/orszagprofil/`: 2 új űrlap, a törölt `KapcsolatokMezok.tsx` (a git az egyik új fájlt átnevezésként is mutathatja), és 3 módosított fájl (`[kod]/szerkesztes/page.tsx`, `components/BlokkForm.tsx`, `actions.ts`);
- `scripts/demo-orszagprofil/orszagok/`: mind a 27 fájl módosított (25 átalakított, plusz a `pr.ts` és a `vi.ts` kommentje).

Az indexen kívül semmi, vagy egyetlen sor: ` M data/tet.db` (a migráció a WAL-ban él, a fő fájl az 5. taskig változatlan maradhat). A `scripts/_egyezes.ts` ne szerepeljen.

```bash
git commit -m "feat(kapcsolatok-bontas): a 6. blokk két önálló blokk – 6.1. Két- és többoldalú kapcsolatok, 6.2. Magyar–fogadó országbeli kapcsolatok (szótár, validátor, űrlap, olvasó nézet, a 27 országfájl)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: A régi oszlop és típus törlése (`0009`)

**Files:**
- Modify: `lib/orszagprofil-szotar.ts` (a `Kapcsolatok` interfész törlése)
- Modify: `db/schema/orszagprofil.ts`
- Create (generált): `drizzle/0009_kapcsolatok_oszlop_torles.sql`, `drizzle/meta/0009_snapshot.json`
- Modify (generált): `drizzle/meta/_journal.json`
- Módosul, de nem commitolandó: `data/tet.db`

- [ ] **Step 1: Semmi nem hivatkozik a régi blokkra**

```bash
grep -rnE "[.'\"]kapcsolatok\b|^\s*kapcsolatok:" --include='*.ts' --include='*.tsx' lib db components "app/(app)" scripts/demo-orszagprofil.ts scripts/demo-orszagprofil/tipusok.ts
grep -rnE "\bKapcsolatok\b" --include='*.ts' --include='*.tsx' lib db components "app/(app)"
```

Elvárt: az első parancs egyetlen találata a `db/schema/orszagprofil.ts` `kapcsolatok: text('kapcsolatok', …)` sora; a másodiké három sor: az `export interface Kapcsolatok {` a szótárban, valamint az import és a `$type<Kapcsolatok>` a sémában. (A minta a prózai „kapcsolatok” szót a címkékben és magyarázatokban nem találja meg, csak a kulcsként vagy típusként használtat.) Ha más is van, állj meg és jelezd.

- [ ] **Step 2: A `Kapcsolatok` interfész törlése**

A `lib/orszagprofil-szotar.ts`-ből töröld:

```ts
export interface Kapcsolatok {
  euMultilateralis: string;
  partnerorszagok: string;
  egyezmeny: string;
  ketoldalu: string;
  mobilitas: string;
}
```

- [ ] **Step 3: A régi oszlop törlése a sémából**

A `db/schema/orszagprofil.ts` importja:

```ts
import type {
  Alapadatok, Intezmenyek, KfiRendszer, MagyarErtekeles, MagyarKapcsolatok, NemzetkoziKapcsolatok,
  Programok, Rendezvenyek, Vallalati,
} from '../../lib/orszagprofil-szotar';
```

Töröld a `kapcsolatok: text('kapcsolatok', { mode: 'json' }).$type<Kapcsolatok>(),` sort. A blokk-oszlopok így:

```ts
    rendezvenyek: text('rendezvenyek', { mode: 'json' }).$type<Rendezvenyek>(),
    nemzetkoziKapcsolatok: text('nemzetkozi_kapcsolatok', { mode: 'json' }).$type<NemzetkoziKapcsolatok>(),
    magyarKapcsolatok: text('magyar_kapcsolatok', { mode: 'json' }).$type<MagyarKapcsolatok>(),
    magyarErtekeles: text('magyar_ertekeles', { mode: 'json' }).$type<MagyarErtekeles>(),
```

- [ ] **Step 4: A migráció generálása**

```bash
npx drizzle-kit generate --name=kapcsolatok_oszlop_torles
```

Elvárt: létrejön a `drizzle/0009_kapcsolatok_oszlop_torles.sql`, pontosan ezzel az egy sorral:

```sql
ALTER TABLE `orszagprofil` DROP COLUMN `kapcsolatok`;
```

Ha a drizzle-kit kérdést tesz fel, vagy a fájlban más utasítás is van (különösen `__new_orszagprofil` + `DROP TABLE`), **állj meg és jelezd**. A fájlt ne írd át.

- [ ] **Step 5: A mentés óta senki nem írt a régi blokkba**

A `0008` egyszeri másolat volt: ami azóta a régi `kapcsolatok` oszlopba került (a 2. task átállásáig a futó kód még oda mentett), az nincs az új oszlopokban, és a törléssel elveszne. A törlés **előtt** ellenőrizd:

```bash
SCRATCH=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/eccc1dfb-b720-4b81-8b6f-a02136044935/scratchpad
sqlite3 -readonly data/tet.db <<'SQL'
ATTACH 'file:/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/eccc1dfb-b720-4b81-8b6f-a02136044935/scratchpad/tet-pre-0008.db?immutable=1' AS regi;
SELECT 'regi_blokk_valtozatlan', count(*) FROM orszagprofil u JOIN regi.orszagprofil r ON r.id = u.id WHERE u.kapcsolatok IS r.kapcsolatok;
SELECT 'mentes_sorai', count(*) FROM regi.orszagprofil;
SELECT 'uj_sor_regi_blokkal', count(*) FROM orszagprofil u WHERE u.kapcsolatok IS NOT NULL AND u.id NOT IN (SELECT id FROM regi.orszagprofil);
SQL
```

Elvárt: `regi_blokk_valtozatlan|28`, `mentes_sorai|28`, `uj_sor_regi_blokkal|0`. Ha bármelyik eltér, **állj meg és jelezd** – a migrációt ne futtasd (az érintett sor tartalmát előbb kézzel át kell vinni az új oszlopokba).

- [ ] **Step 6: A migráció alkalmazása**

```bash
npm run db:migrate
```

Elvárt: hiba nélkül lefut (`exit 0`).

- [ ] **Step 7: Adat-összevetés a mentéssel**

```bash
sqlite3 -readonly data/tet.db < "$SCRATCH/bontas-ellenorzes.sql"
```

Elvárt kimenet, pontosan (az 1. taskhoz képest a két utolsó sor változik):

```
sorok|28
null_egyezik|28
mezok_egyeznek|25
meta_valtozatlan|28
tobbi_blokk_valtozatlan|28
nk_kulcsok|50
mk_kulcsok|75
regi_oszlop|0
migraciok|10
```

- [ ] **Step 8: Típusellenőrzés és build**

```bash
npx tsc --noEmit
npm run build
```

Elvárt: a `tsc` kimenet nélkül; a build végén a route-lista, hiba nélkül. A build `db:init` lépése a `[db:init] a DATABASE_URL a repó adatbázisára mutat …, nincs másolás.` sort írja, a `drizzle-kit migrate` nem alkalmaz újat.

Ha a build típusellenőrzése nem létező `app/...` modulra panaszkodik, az a futó dev szerver elavult `.next/dev/types/validator.ts`-e: `rm .next/dev/types/validator.ts`, majd újra `npm run build` (lásd CLAUDE.md).

- [ ] **Step 9: Commit** (a `data/tet.db` nélkül)

```bash
git add lib/orszagprofil-szotar.ts db/schema/orszagprofil.ts drizzle/0009_kapcsolatok_oszlop_torles.sql drizzle/meta/0009_snapshot.json drizzle/meta/_journal.json
git commit -m "feat(kapcsolatok-bontas): a régi kapcsolatok oszlop és típus törlése (0009)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git status --short
```

Elvárt `git status --short`: üres, vagy egyetlen sor: ` M data/tet.db`. (A DB WAL módú, és a futó dev szerver nyitva tartja: a migráció a gitignore-olt `data/tet.db-wal`-ban él, a fő fájl az 5. task checkpointjáig változatlan maradhat. Checkpointot emiatt ne futtass.)

---

### Task 4: Dokumentáció (CLAUDE.md, README.md)

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md`

- [ ] **Step 1: CLAUDE.md – öt csere és két új listaelem**

Mindegyik régi szövegrész pontosan egyszer fordul elő a fájlban.

1. Régi:

   ```
   8 típusos JSON oszlop: `alapadatok` + a 7 KFI-blokk, `null` = még nem mentett blokk)
   ```

   Új:

   ```
   9 típusos JSON oszlop: `alapadatok` + a 8 KFI-blokk, `null` = még nem mentett blokk; a 6. rész két önálló blokk: `nemzetkoziKapcsolatok` „6.1. Két- és többoldalú kapcsolatok" és `magyarKapcsolatok` „6.2. Magyar–fogadó országbeli kapcsolatok" – a korábbi közös `kapcsolatok` oszlop tartalmát a 0008 migráció osztotta szét, az oszlopot a 0009 törölte)
   ```

2. Régi: `(8 önálló blokk-form:` → Új: `(9 önálló blokk-form:`
3. Régi: `A szerkesztő 8 blokk-formja` → Új: `A szerkesztő 9 blokk-formja`
4. Régi: `(a 8 blokk egy DOM-ban van` → Új: `(a 9 blokk egy DOM-ban van`
5. Régi:

   ```
   Oszlop törlésére az `ALTER TABLE … DROP COLUMN` jó (pl. 0007).
   ```

   Új:

   ```
   Oszlop törlésére az `ALTER TABLE … DROP COLUMN` jó (pl. 0007, 0009). Ha egy sémaváltozás ugyanabban a táblában egyszerre ad hozzá és töröl oszlopot, a `drizzle-kit generate` interaktívan rákérdez az átnevezésre: ilyenkor két lépésben generálj – előbb a hozzáadás (az adatmásolás kézzel a migráció végére, `--> statement-breakpoint` jellel elválasztva: a migrátor ennél darabol, és egy csak kommentből álló darabon elbukik, ezért a komment az utasításával egy darabban legyen), aztán a törlés –, ahogy a 0008/0009 készült.
   ```

6. Két új listaelem az Országprofil „Amire figyelni kell” listájába, közvetlenül az „A szerkesztő 9 blokk-formja…” elem után (a review nyomán):

   ```
   - Új blokk felvételekor a `BLOKKOK` bővítése után a fordító végigvezet a kimerítő táblákon (`ProfilBlokkok`, `NORMALIZALOK`, `MEZO_CIMKEK`, `VALIDALOK`, `NEZETEK`); a blokk-kulcs egyben a `db/schema/orszagprofil.ts` property-neve is (a `sorbol` `r[k]`-val olvas, az `upsertBlokk` `[blokk]: tartalom`-mal ír). A szerkesztő oldal blokk-listája (`[kod]/szerkesztes/page.tsx` + `mezok/<Blokk>Mezok.tsx`) viszont kézi: a kimaradt blokk fordítási hiba nélkül szerkeszthetetlen marad.
   - Migráció nélkül csak új almező vezethető be (a normalizáló pótolja). Almező átnevezése, mező áthelyezése blokkok között, blokk bontása vagy átnevezése adatmigrációt igényel (minta: 0008/0009): a normalizáló a más kulcson vagy más oszlopban tárolt értéket nem látja, és a blokkon belül átnevezett almező régi értékét a következő mentés el is dobja.
   ```

Ellenőrzés:

```bash
grep -c "8 önálló blokk-form\|szerkesztő 8 blokk\|a 8 blokk egy DOM\|a 7 KFI-blokk" CLAUDE.md
grep -c "9 önálló blokk-form\|szerkesztő 9 blokk\|a 9 blokk egy DOM\|a 8 KFI-blokk\|0008/0009" CLAUDE.md
```

Elvárt: `0`, majd legalább `3` (a találatok több sorra esnek).

- [ ] **Step 2: README.md – hosting-pont**

A „### Hosting (Hostinger Node.js)” lista **végére**, közvetlenül a „### Adatbázis és auth” fejléc előtti üres sor elé (a „Visszaállításra akkor van szükség…” bekezdés után, üres sorral elválasztva) szúrd be ezt a listaelemet:

```markdown
- A `0008`/`0009` migráció az országprofil `kapcsolatok` oszlopát két oszlopra osztja (`nemzetkozi_kapcsolatok`, `magyar_kapcsolatok`; a tartalom mezőnként átkerül), majd a régit törli – visszafordíthatatlan. A build ideje alatt a még futó régi verzió hibát ad mindenhol, ahol teljes profilsort olvas (térkép – ez a belépés utáni kezdőoldal is –, országprofil; adminnak az oldalsáv állapotkártyája miatt minden oldalon), mert a törölt oszlopot is lekérdezi; a már nyitva tartott szerkesztőben bármelyik blokk mentése is elbukik (az INSERT a tábla minden oszlopát felsorolja). Ha a `next build` elbukik, így is marad. A két migráció csak együtt mehet ki (egy build egy tranzakcióban futtatja őket): a `0008` egyszeri másolat, ezért ha csak az kerülne ki, a régi kóddal közben mentett 6. blokk a `0009`-cel elveszne. Ha a hosting-DB-ben valós adat van, deploy előtt ments (`sqlite3 <db> ".backup '<db>.pre-0008'"`); a visszaállítás a fenti módon megy, a `.pre-0008` fájlból (`sqlite3 <db> ".restore '<db>.pre-0008'"`). Mindez a csere nélküli DB-re vonatkozik: az egyszeri `DEMO_CSERE` buildjénél a `db:init` a már migrált demó DB-t másolja a hosting-DB helyére, ott a két migráció le sem fut, a még futó régi verzió pedig az átnevezett `<db>.regi-<időbélyeg>` fájlon dolgozik tovább (hibát csak újraindulás után ad), és a visszaállítás forrása is ez a fájl.
```

Ellenőrzés:

```bash
grep -n "0008" README.md | cut -c1-80
awk '/^### Hosting/,/^### Adatbázis és auth/' README.md | tail -4 | cut -c1-60
```

Elvárt: egy találat; a szakasz utolsó nem üres sora az új listaelem.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "docs(kapcsolatok-bontas): CLAUDE.md és README – 9 blokk, a két új blokk-kulcs, a 0008/0009 migráció

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Böngészős QA, DB-takarítás, a demó DB commitja

Ezt a taskot a vezérlő munkamenet végzi (nem subagent): az admin jelszó a `.env.local`-ban van, kiírni tilos. Eszköz: `B=~/.claude/skills/gstack/browse/dist/browse`, a felhasználó futó dev szerverén (`http://localhost:3000`).

**Files:**
- Commit: `data/tet.db`

- [ ] **Step 1: Belépés adminként**

`$B goto http://localhost:3000/login`, `$B wait --networkidle`, az e-mail `admin@niu.hu`, a jelszó a `.env.local` `SEED_ADMIN_PASSWORD` értéke shell-változón át (ne jelenjen meg kimenetben; kitöltés után ne fusson `snapshot`), beküldés, majd ellenőrzés, hogy a `/terkep` töltődött be.

- [ ] **Step 2: Szerkesztő – két kártya, sorrend, címkék**

A fejléc ciklusválasztójával 2020-ra váltva nyisd meg: `/orszagprofil/AT/szerkesztes` (az `AT` 2020 sor nem létezik, a QA csak ezt a sort írja). Ellenőrizd:

- a kártyák címe sorrendben: „5. Jelentősebb KFI rendezvények”, „6.1. Két- és többoldalú kapcsolatok”, „6.2. Magyar–fogadó országbeli kapcsolatok”, „7. Magyar szempontú értékelés és lehetőségek”;
- a 6.1 mezői sorrendben: „Legfőbb partnerországok”, „EU és multilaterális kapcsolatok” (`#nemzetkoziKapcsolatok\.partnerorszagok`, `#nemzetkoziKapcsolatok\.euMultilateralis`);
- a 6.2 mezői sorrendben: „Érvényes TéT-egyezmény”, „Kétoldalú együttműködések”, „Mobilitási lehetőségek” (`#magyarKapcsolatok\.egyezmeny`, `…ketoldalu`, `…mobilitas`);
- a kérdőjeles magyarázat mindkét kártya egy-egy mezőjénél megnyílik, a felugró neve az új címke.

- [ ] **Step 3: Külön mentés**

- A 6.1-ben a „Legfőbb partnerországok” = `QA 6.1`, Mentés. Ellenőrzés:

  ```bash
  sqlite3 -readonly data/tet.db "select nemzetkozi_kapcsolatok, magyar_kapcsolatok is null from orszagprofil where orszag_kod='AT' and ev=2020;"
  ```

  Elvárt: `{"partnerorszagok":"QA 6.1","euMultilateralis":""}|1`.
- A 6.2-ben a „Mobilitási lehetőségek” = `QA 6.2`, Mentés. Elvárt ugyanazzal a lekérdezéssel: az első oszlop változatlan, a második `0`; és `select magyar_kapcsolatok …` → `{"egyezmeny":"","ketoldalu":"","mobilitas":"QA 6.2"}`.
- Hibaeset: a 6.2 „Érvényes TéT-egyezmény” mezőjébe 201 karakter (`js`-sel), Mentés: a hiba a `#magyarKapcsolatok\.egyezmeny` mezőnél jelenik meg, a fókusz oda kerül, a 6.1 kártyán nincs hiba, a DB-ben az `egyezmeny` üres marad.

- [ ] **Step 4: Olvasó nézet és térkép**

- `/orszagprofil/AT` (2020): „2/9 blokk kitöltve”; a 6.1 és a 6.2 szakasz külön kártya, a beírt értékekkel; a többi hét blokk kártyáján „Még nincs kitöltve”.
- A fejléc évét 2026-ra visszaváltva `/orszagprofil/KR`: „9/9 blokk kitöltve”, a 6.1 első sora a „Legfőbb partnerországok”, a 6.2 utolsó sora a „Mobilitási lehetőségek”, a szövegek megvannak.
- `/terkep`, Mutató: „Kitöltöttség (mentett blokk)”: a rangsor értékei `/9` utótaggal, Dél-Korea `9/9`.

- [ ] **Step 5: Kijelentkezés, takarítás**

Kijelentkezés a böngészőben, majd:

```bash
sqlite3 data/tet.db "delete from orszagprofil where orszag_kod='AT' and ev=2020; delete from session;"
SCRATCH=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/eccc1dfb-b720-4b81-8b6f-a02136044935/scratchpad
sqlite3 -readonly data/tet.db < "$SCRATCH/bontas-ellenorzes.sql"
sqlite3 -readonly data/tet.db "select count(*) from session; select count(*) from orszagprofil where ev=2020;"
```

Elvárt: az összevetés ugyanaz, mint a 3. task 7. lépésében (`sorok|28` … `regi_oszlop|0`, `migraciok|10`); majd `0` és `0`.

A `delete from session` a felhasználó saját böngészős munkamenetét is törli a helyi dev szerveren (a commitolt demó DB-ben nem lehet session): ezt a záró üzenetben jelezni kell.

- [ ] **Step 6: Checkpoint, tömörítés, commit**

```bash
sqlite3 data/tet.db "PRAGMA wal_checkpoint(TRUNCATE); VACUUM; PRAGMA wal_checkpoint(TRUNCATE);"
sqlite3 -readonly data/tet.db "PRAGMA integrity_check; select count(*) from user; select count(*) from orszagprofil;"
sqlite3 "file:data/tet.db?immutable=1" "select count(*) from __drizzle_migrations; select count(*) from session; select count(*) from pragma_table_info('orszagprofil') where name in ('nemzetkozi_kapcsolatok','magyar_kapcsolatok','kapcsolatok');"
git add data/tet.db
git show :data/tet.db > "$SCRATCH/staged.db"
sqlite3 "file:$SCRATCH/staged.db?immutable=1" "PRAGMA integrity_check; select count(*) from __drizzle_migrations; select count(*) from session; select count(*) from user; select count(*) from orszagprofil; select count(*) from orszagprofil where ev=2020;"
git commit -m "chore(kapcsolatok-bontas): a demó DB a 0008/0009 migrációval – a kapcsolatok blokk két oszlopban

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git status --short
```

Elvárt: a `wal_checkpoint(TRUNCATE)` sorai `0|0|0`; `ok`, a felhasználók száma változatlan (16), `28`; a fő fájl önmagában (`immutable=1`, a WAL nélkül – a hosting `db:init`-je csak a fő fájlt másolja) `10`, `0`, `2`; a `git status --short` a commit után üres. Ha a checkpoint első száma nem `0` (foglalt), vagy a fő fájl régi állapotot mutat, ismételd meg a checkpointot, és ne commitolj, amíg nem stimmel. A `git add` után a commitra kijelölt változat (`git show :data/tet.db`, szintén `immutable=1`-gyel) külön is ellenőrzendő, mert a két lépés között a dev szerver írhat: elvárt `ok`, `10`, `0`, `16`, `28`, `0`; eltérésnél `git restore --staged data/tet.db`, új checkpoint, és újra. Ha a `VACUUM` „database is locked” hibát ad (a dev szerver éppen olvas), ismételd meg.

---

### Task 6: Lezárás

- [ ] **Step 1: Záró, teljes ágra kiterjedő review** (`git diff main...kapcsolatok-bontas`), a talált hibák javítása.
- [ ] **Step 2: A spec végére „Megvalósítási eltérések” szakasz**, ha a megvalósítás eltért a spectől; a terv kódblokkjainak szinkronja a végleges fájlokkal. Külön `docs(kapcsolatok-bontas): …` commit.
- [ ] **Step 3: Az ág lezárása** a `superpowers:finishing-a-development-branch` szerint. A futó dev szerver miatt a merge a munkafa cseréje nélkül történjen (az ág a `main`-ből indul, tehát fast-forward: `git fetch . kapcsolatok-bontas:main`, majd `git checkout main`). Push előtt a felhasználót emlékeztetni kell: a push a demó DB-t is publikálja, és az első hosting-build a `DEMO_CSERE` miatt lecseréli a hosting-DB-t.
