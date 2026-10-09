# Országprofilok feltöltése valós adatokkal – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Az attasék 25 üres országának 2026-os profilja valós, kutatott adatokkal kerül a demó DB-be (a KR és a JP marad), és egy újabb egyszeri DB-csere viszi ki a hostingra.

**Architecture:** Országonként egy adatfájl (`scripts/demo-orszagprofil/orszagok/<kod>.ts`, az űrlap-értékek formájában). A `scripts/demo-orszagprofil.ts` futtató előbb mindent ellenőriz:
- a `validalBlokk`-kal, ahogy az űrlapot;
- szigorúbban is: ismeretlen mező, szótáron kívüli opció, rendezvénytípus.

Csak hibátlan adatnál ír, egy tranzakcióban, és van ellenőrző módja (`--csak`). A 25 ország kutatása hat párhuzamos csomagban fut, csomagonként formai és tényellenőrző review-val. A `scripts/db-init.mjs` `DEMO_CSERE` azonosítója lép, így a következő build a hosting-DB-t egyszer lecseréli a repóéra.

**Tech Stack:** TypeScript 7, tsx 4.23 (a `package.json`-ben nincs `type`, ezért CommonJS: nincs top-level await), drizzle-orm 0.45 + better-sqlite3, Node 22.

**Spec:** `docs/superpowers/specs/2026-10-09-orszagprofil-feltoltes-design.md`.

**Ellenőrzés:** Nincs tesztkeretrendszer.
- **Futtató:** a „teszt” egy regressziós összevetés (a régi és az új futtató KR/JP kimenete bájtra azonos) és egy szándékosan hibás adatfájl (a szigorú ellenőrzésnek el kell utasítania). Mindkettő a demó DB **másolatán** fut.
- **Csomagok:** a `--csak` ellenőrző mód, a `tsc`, majd a két review.
- **Lezárás:** gstack böngészős ellenőrzés.

**Környezet:**
- A felhasználó TéT dev szervere a `http://localhost:3000`-en fut (`next dev`, HMR, a repó `data/tet.db`-jével). **Nem szabad leállítani vagy újraindítani**, saját dev szervert sem indítunk.
- A `data/tet.db` a repóban van; most ` M` állapotú: a dev szerver a felhasználó egy helyi session-sorát írta bele (más eltérés nincs).
  - DB-t módosító próba mindig a **másolaton** fut: `T=$(mktemp -d) && sqlite3 data/tet.db ".backup '$T/t.db'"`, majd `DATABASE_URL="$T/t.db"`.
  - A `data/tet.db`-t csak a 8. task írja és commitolja.
  - `git add` mindig konkrét fájlokkal, soha `-A` vagy `.`.
- Commit üzenetek magyarul, `feat|chore|docs(orszagprofil-feltoltes): …`, a végén üres sor után: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- A 2–7. task csomagjai **párhuzamosan** futnak. Ezért:
  - a csomag-implementer csak a saját országfájljait hozza létre;
  - **nem commitol** – a controller commitol a két review után;
  - a `tsc`-kimenetből csak a saját fájljai hibáival foglalkozik.
- Reviewer subagent: csak olvasó git (tilos a checkout, a reset és a stash), a DB csak `-readonly`.
- Seed admin: `admin@niu.hu`, jelszava a `.env.local` `SEED_ADMIN_PASSWORD`-je. Olvasd ki, de ne írd ki. A jelszó kitöltése után **tilos a gstack `snapshot`**.

**Fontos tények (ellenőrizve 2026-10-09):**
- A tsx a `readdirSync` + `await import(pathToFileURL(f).href)` dinamikus importot a repóban is kezeli: egy `export default` modulnál a `mod.default` maga az objektum (kipróbálva).
- **A régi futtató kimenete és a DB eltérése.** A régi `scripts/demo-orszagprofil.ts` KR/JP kimenete tartalmilag azonos a DB-ben tárolttal. Két formai eltérés van:
  - a DB-ben az Alapadatok JSON-jában a `fovaros/terulet/penznem` kulcs a végén áll (a 0006 migráció fűzte hozzá);
  - a `szerzo_id` `NULL`.

  A teljes futtatás ezért a KR/JP sort ugyanazzal a tartalommal, de a script kulcssorrendjével és az admin szerzővel írja újra. A regressziós próba a régi és az új futtató kimenetét veti össze (mindkettő friss másolaton), nem a DB-t.
- **A validátor néma szűrései.** A `lib/orszagprofil-validacio.ts` validátora:
  - az ismeretlen listás opciót (`szurtLista`) **némán eldobja**;
  - az ismeretlen mezőnevet nem olvassa;
  - az ismeretlen rendezvénytípust `forum`-ra cseréli;
  - a `rendezveny.10.*`-tól felfelé nem olvas.

  Ezek a futtatóban hibák.
- A `tsconfig.json` `include`-ja (`**/*.ts`) a `scripts/` alatti fájlokat is típusellenőrzi.
- A `upsertBlokk<K>(kod, ev, blokk, tartalom, szerzoId)` (`db/queries/orszagprofil.ts`) a globális `db`-n fut, ezért egy `db.transaction(() => …)` hívásba csomagolható.
- A `db/queries/*` `server-only`, ezért a futtatás `NODE_OPTIONS="--conditions=react-server"`-rel megy.
- A demó DB-ben 27 ország attaséja van: AT BD BR CA CN DE DZ FR GB GY IE IL IN JP KP KR LK MA MR MV NP PR RU SR TN US VI. Profilok: KR 2026, JP 2026 (8–8 blokk), JP 2025 (csak Alapadatok).
- A térkép alapmutatója a „Kiemelt iparág” (`ALAP_MUTATO = 'iparag'`). A mutatóválasztó Base UI Select (`#mutato`), az opciók `[role=option]` elemek.

---

## Fájlszerkezet

| Fájl | Művelet | Felelősség | Task |
| --- | --- | --- | --- |
| `scripts/demo-orszagprofil/tipusok.ts` | létrehoz | `Urlap`, `DemoOrszag`, `DemoRendezveny`, `rendezvenyek()`, `urlapFormData()` | 1 |
| `scripts/demo-orszagprofil.ts` | átír | futtató: fájl-felderítés, szigorú ellenőrzés, `--csak`, tranzakciós írás | 1 |
| `scripts/demo-orszagprofil/orszagok/kr.ts`, `jp.ts` | létrehoz (költöztetés) | a KR és JP adat változatlanul | 1 |
| `scripts/demo-orszagprofil/orszagok/{de,at,gb,ie}.ts` | létrehoz | 1. csomag | 2 |
| `scripts/demo-orszagprofil/orszagok/{fr,dz,ma,tn,mr}.ts` | létrehoz | 2. csomag | 3 |
| `scripts/demo-orszagprofil/orszagok/{us,ca,pr,vi}.ts` | létrehoz | 3. csomag | 4 |
| `scripts/demo-orszagprofil/orszagok/{br,gy,sr,il}.ts` | létrehoz | 4. csomag | 5 |
| `scripts/demo-orszagprofil/orszagok/{ru,cn,kp}.ts` | létrehoz | 5. csomag | 6 |
| `scripts/demo-orszagprofil/orszagok/{in,bd,lk,np,mv}.ts` | létrehoz | 6. csomag | 7 |
| `scripts/db-init.mjs` | módosít | `DEMO_CSERE` = `2026-10-09` | 8 |
| `CLAUDE.md`, `README.md` | módosít | a futtató parancssora; a csere és a mintaprofilok leírása | 8 |
| `data/tet.db` | módosít + commit | a 27 ország 2026-os profilja, sessionök nélkül | 8 |

---

### Task 0: Branch

- [ ] **Step 1: Branch a main-ről**

```bash
git status --short   # csak a ` M data/tet.db` lehet – más ne legyen
git checkout -b orszagprofil-feltoltes
```

---

### Task 1: Adatfájl-szerkezet és szigorú futtató

**Files:**
- Create: `scripts/demo-orszagprofil/tipusok.ts`
- Create: `scripts/demo-orszagprofil/orszagok/kr.ts`, `scripts/demo-orszagprofil/orszagok/jp.ts`
- Modify (teljes átírás): `scripts/demo-orszagprofil.ts`

- [ ] **Step 1: Alapvonal a régi futtatóval**

```bash
S=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/ff5a9b0c-7c4e-4840-a242-43c0a4876dfb/scratchpad
Q="select orszag_kod||' '||ev, alapadatok, kfi_rendszer, intezmenyek, vallalati, programok, rendezvenyek, kapcsolatok, magyar_ertekeles from orszagprofil where ev=2026 order by orszag_kod"
T=$(mktemp -d) && sqlite3 data/tet.db ".backup '$T/t.db'"
DATABASE_URL="$T/t.db" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts
sqlite3 "$T/t.db" "$Q" > "$S/kr-jp-regi.txt" && wc -c "$S/kr-jp-regi.txt" && rm -rf "$T"
```

Expected: `KR: 8 blokk mentve 2026-ra (szerző: …)`, `JP: 8 blokk mentve 2026-ra (szerző: …)`. A fájl kb. 18 KB.

- [ ] **Step 2: `scripts/demo-orszagprofil/tipusok.ts`**

```ts
/**
 * A demó országprofilok közös típusai és segédjei (a scripts/demo-orszagprofil.ts futtató és az
 * orszagok/<kod>.ts adatfájlok). A blokkok értékei úgy vannak megadva, ahogy az űrlapon beírnák
 * őket (magyar számformátum, a listás mezőknél több érték), így a futtató ugyanazzal a
 * validátorral ellenőrzi őket, mint az űrlapot.
 */
import type { BlokkKulcs, RendezvenyTipus } from '../../lib/orszagprofil-szotar';

/** Egy blokk űrlap-értékei: mezőnév → string, a listás mezőknél string-lista. */
export type Urlap = Record<string, string | string[]>;

/** Egy ország demó-profilja. A meg nem adott blokk mentetlen marad (részleges profil). */
export interface DemoOrszag {
  kod: string;
  profil: Partial<Record<BlokkKulcs, Urlap>>;
}

/** Egy rendezvény-sor; a `megjegyzes` elhagyható. */
export interface DemoRendezveny {
  nev: string;
  tipus: RendezvenyTipus;
  idopont: string;
  megjegyzes?: string;
}

/** A rendezvény-sorokból a validátor `rendezveny.<i>.<mezo>` mezői. */
export function rendezvenyek(sorok: DemoRendezveny[]): Urlap {
  const u: Urlap = {};
  sorok.forEach((s, i) => {
    u[`rendezveny.${i}.nev`] = s.nev;
    u[`rendezveny.${i}.tipus`] = s.tipus;
    u[`rendezveny.${i}.idopont`] = s.idopont;
    u[`rendezveny.${i}.megjegyzes`] = s.megjegyzes ?? '';
  });
  return u;
}

/** Űrlap-értékek → FormData: a listás mezőknél több azonos nevű érték, ahogy a böngésző küldi. */
export function urlapFormData(u: Urlap): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(u)) {
    if (Array.isArray(v)) v.forEach((x) => fd.append(k, x));
    else fd.append(k, v);
  }
  return fd;
}
```

- [ ] **Step 3: A KR és a JP átköltöztetése (tartalom változatlanul)**

`scripts/demo-orszagprofil/orszagok/kr.ts`: a fejléc és az import, utána a mostani `scripts/demo-orszagprofil.ts` **37–169. sora betű szerint** (a `kod: 'KR',` sortól a záró `};`-ig). A 36. sor (`const KR: DemoOrszag = {`) helyett `const orszag: DemoOrszag = {` áll, a végén `export default orszag;`:

```ts
/**
 * Dél-Korea (KR) 2026-os demó-profilja (a 2026-09-15-i adat, a korábbi scripts/demo-orszagprofil.ts-ből
 * változatlanul). Források: IMF World Economic Outlook (2025. október), Világbank, KOSTAT, GII 2025.
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'KR',
  // … a régi fájl 38–168. sora betű szerint (a `profil: {` sortól a `},` sorig) …
};

export default orszag;
```

`scripts/demo-orszagprofil/orszagok/jp.ts` ugyanígy, a régi fájl **172–309. sorával**:
- a 171. sor (`const JP: DemoOrszag = {`) helyett `const orszag: DemoOrszag = {`;
- a fejléc: „Japán (JP) 2026-os demó-profilja (a 2026-09-15-i adat, a korábbi scripts/demo-orszagprofil.ts-ből változatlanul). Források: IMF World Economic Outlook (2025. október), Világbank, Japán Statisztikai Hivatal, GII 2025.”

A költöztetést `sed`-del végezd, ne kézzel, hogy betű szerinti legyen:

```bash
mkdir -p scripts/demo-orszagprofil/orszagok
{ printf '%s\n' '/**' \
  ' * Dél-Korea (KR) 2026-os demó-profilja (a 2026-09-15-i adat, a korábbi scripts/demo-orszagprofil.ts-ből' \
  ' * változatlanul). Források: IMF World Economic Outlook (2025. október), Világbank, KOSTAT, GII 2025.' \
  ' */' "import { rendezvenyek, type DemoOrszag } from '../tipusok';" '' 'const orszag: DemoOrszag = {'
  sed -n '37,169p' scripts/demo-orszagprofil.ts
  printf '%s\n' '' 'export default orszag;'; } > scripts/demo-orszagprofil/orszagok/kr.ts
{ printf '%s\n' '/**' \
  ' * Japán (JP) 2026-os demó-profilja (a 2026-09-15-i adat, a korábbi scripts/demo-orszagprofil.ts-ből' \
  ' * változatlanul). Források: IMF World Economic Outlook (2025. október), Világbank, Japán Statisztikai Hivatal, GII 2025.' \
  ' */' "import { rendezvenyek, type DemoOrszag } from '../tipusok';" '' 'const orszag: DemoOrszag = {'
  sed -n '172,309p' scripts/demo-orszagprofil.ts
  printf '%s\n' '' 'export default orszag;'; } > scripts/demo-orszagprofil/orszagok/jp.ts
head -9 scripts/demo-orszagprofil/orszagok/kr.ts; tail -4 scripts/demo-orszagprofil/orszagok/kr.ts
head -9 scripts/demo-orszagprofil/orszagok/jp.ts; tail -4 scripts/demo-orszagprofil/orszagok/jp.ts
```

Expected:
- A `kr.ts` 7. sora `const orszag: DemoOrszag = {`, a 8. `  kod: 'KR',`. Az utolsó sorok: `  },`, `};`, üres sor, `export default orszag;`.
- A `jp.ts` ugyanígy, `  kod: 'JP',`-val.
- Ha a sorszámok nem így esnek (a régi fájl közben változott volna), állj meg és jelezd.

- [ ] **Step 4: `scripts/demo-orszagprofil.ts` – a futtató (teljes fájl)**

```ts
/**
 * Demó országprofilok az aktuális évre: az attasék országainak valós, kutatott adatai a
 * DATABASE_URL (alapért. ./data/tet.db) DB-be. Országonként egy adatfájl:
 * scripts/demo-orszagprofil/orszagok/<kod>.ts (export default DemoOrszag).
 *
 * Előbb minden blokkot ellenőriz – a `validalBlokk`-kal, ahogy az űrlapot, és szigorúbban is:
 * ismeretlen mezőnév, szótáron kívüli listás opció vagy rendezvénytípus, túl nagy
 * rendezvény-index hiba (a validátor ezeket némán eldobná vagy kicserélné) –, és csak hibátlan
 * adatnál ír, egy tranzakcióban. A meg nem adott blokkhoz nem nyúl (részleges profil).
 * Idempotens; a szerző az első admin.
 *
 * Futtatás: NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts [--csak DE,AT]
 * A --csak csak a megadott országokat ellenőrzi, és meg sem nyitja a DB-t.
 */
import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { aktualisEv } from '../lib/datum';
import { orszagByKod } from '../lib/orszagok';
import {
  BLOKK_KULCSOK, GAZDASAGI_AGAZATOK, IPARAGAK, KFI_PRIORITASOK, MEZO_CIMKEK, RENDEZVENY_MAX, RENDEZVENY_TIPUSOK,
  TAGSAGOK, isBlokkKulcs, type BlokkKulcs, type ProfilBlokkok,
} from '../lib/orszagprofil-szotar';
import { validalBlokk } from '../lib/orszagprofil-validacio';
import { urlapFormData, type DemoOrszag, type Urlap } from './demo-orszagprofil/tipusok';

const MAPPA = resolve(process.cwd(), 'scripts/demo-orszagprofil/orszagok');

/** A listás mezők engedett értékei blokkonként: a validátor a szótáron kívüli opciót némán eldobná. */
const LISTAK: Partial<Record<BlokkKulcs, Record<string, readonly string[]>>> = {
  alapadatok: { tagsagok: TAGSAGOK, agazatok: GAZDASAGI_AGAZATOK },
  kfiRendszer: { prioritasok: KFI_PRIORITASOK, kiemeltIparagak: IPARAGAK },
  vallalati: { kiemeltAgazatok: IPARAGAK },
};
const RENDEZVENY_MEZO = /^rendezveny\.(\d+)\.(nev|tipus|idopont|megjegyzes)$/;
const TIPUS_KULCSOK: readonly string[] = RENDEZVENY_TIPUSOK.map((t) => t.kulcs);

/** A validátoron túli ellenőrzés: amit a validátor némán eldobna vagy kicserélne, az itt hiba. */
function szigoruHibak(blokk: BlokkKulcs, u: Urlap): string[] {
  const hibak: string[] = [];
  const listak = LISTAK[blokk] ?? {};
  const mezok: readonly string[] = Object.keys(MEZO_CIMKEK[blokk]);
  for (const [mezo, ertek] of Object.entries(u)) {
    if (blokk === 'rendezvenyek') {
      const m = RENDEZVENY_MEZO.exec(mezo);
      if (!m) hibak.push(`ismeretlen mező: ${mezo}`);
      else if (Number(m[1]) >= RENDEZVENY_MAX) hibak.push(`${mezo}: legfeljebb ${RENDEZVENY_MAX} rendezvény (index 0–${RENDEZVENY_MAX - 1})`);
      else if (Array.isArray(ertek)) hibak.push(`${mezo}: egy érték kell, nem lista`);
      else if (m[2] === 'tipus' && !TIPUS_KULCSOK.includes(ertek)) {
        hibak.push(`${mezo}: ismeretlen típus „${ertek}” (${TIPUS_KULCSOK.join(', ')})`);
      }
      continue;
    }
    if (!mezok.includes(mezo)) {
      hibak.push(`ismeretlen mező: ${mezo}`);
      continue;
    }
    const engedett = listak[mezo];
    if (!engedett) {
      if (Array.isArray(ertek)) hibak.push(`${mezo}: egy érték kell, nem lista`);
    } else if (!Array.isArray(ertek)) {
      hibak.push(`${mezo}: lista kell`);
    } else {
      for (const x of ertek) if (!engedett.includes(x)) hibak.push(`${mezo}: szótáron kívüli opció „${x}”`);
    }
  }
  return hibak;
}

interface EllenorzottBlokk { blokk: BlokkKulcs; ertek: ProfilBlokkok[BlokkKulcs] }
interface EllenorzottOrszag { kod: string; blokkok: EllenorzottBlokk[] }

/** Egy ország ellenőrzése; a hibák a `hibak` listába kerülnek, „<fájl>: <blokk>.<mező>: <üzenet>” alakban. */
function ellenoriz(fajl: string, o: DemoOrszag, ev: number, hibak: string[]): EllenorzottOrszag {
  const hiba = (s: string) => hibak.push(`${fajl}: ${s}`);
  const elvart = fajl.replace(/\.ts$/, '').toUpperCase();
  if (o.kod !== elvart) hiba(`a kód (${o.kod}) nem egyezik a fájlnévvel (${elvart})`);
  if (!orszagByKod(o.kod)) hiba(`ismeretlen országkód: ${o.kod}`);
  if (Object.keys(o.profil).length === 0) hiba('nincs egyetlen blokk sem');
  for (const k of Object.keys(o.profil)) if (!isBlokkKulcs(k)) hiba(`ismeretlen blokk: ${k}`);
  const blokkok: EllenorzottBlokk[] = [];
  for (const blokk of BLOKK_KULCSOK) {
    const u = o.profil[blokk];
    if (!u) continue;
    for (const h of szigoruHibak(blokk, u)) hiba(`${blokk}: ${h}`);
    const e = validalBlokk(blokk, urlapFormData(u), ev);
    if (e.ok) blokkok.push({ blokk, ertek: e.ertek });
    else for (const [mezo, uzenet] of Object.entries(e.errors)) hiba(`${blokk}.${mezo}: ${uzenet}`);
  }
  return { kod: o.kod, blokkok };
}

/** A `--csak` kódlistája (nagybetűsen), vagy null, ha nincs megadva. */
function csakKodok(): Set<string> | null {
  const i = process.argv.indexOf('--csak');
  if (i < 0) return null;
  const kodok = (process.argv[i + 1] ?? '').split(',').map((k) => k.trim().toUpperCase()).filter(Boolean);
  if (kodok.length === 0) throw new Error('A --csak után vesszős kódlista kell, pl. --csak DE,AT.');
  return new Set(kodok);
}

async function main() {
  const csak = csakKodok();
  const ev = aktualisEv();
  const minden = readdirSync(MAPPA).filter((f) => f.endsWith('.ts')).sort();
  const fajlok = csak ? minden.filter((f) => csak.has(f.replace(/\.ts$/, '').toUpperCase())) : minden;
  const hibak: string[] = [];
  if (csak) {
    for (const k of csak) if (!fajlok.includes(`${k.toLowerCase()}.ts`)) hibak.push(`nincs adatfájl: ${k.toLowerCase()}.ts`);
  }
  const orszagok: EllenorzottOrszag[] = [];
  for (const fajl of fajlok) {
    const mod = (await import(pathToFileURL(join(MAPPA, fajl)).href)) as { default?: DemoOrszag };
    if (!mod.default) hibak.push(`${fajl}: nincs default export`);
    else orszagok.push(ellenoriz(fajl, mod.default, ev, hibak));
  }
  if (hibak.length > 0) {
    console.error(`${hibak.length} hiba, a DB-be nem írtam:`);
    for (const h of hibak) console.error(`  ${h}`);
    process.exit(1);
  }
  if (csak) {
    for (const o of orszagok) console.log(`${o.kod}: ${o.blokkok.length} blokk rendben (${ev}), nem írtam a DB-be`);
    return;
  }
  // A DB-modulok csak íráskor töltődnek be: az ellenőrző mód meg sem nyitja az adatbázist.
  const { eq } = await import('drizzle-orm');
  const { db } = await import('../db');
  const { user } = await import('../db/schema');
  const { upsertBlokk } = await import('../db/queries/orszagprofil');
  // Az első admin: létrehozás szerint, azonos időnél id szerint (determinisztikus).
  const admin = db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.role, 'admin'))
    .orderBy(user.createdAt, user.id)
    .get();
  if (!admin) throw new Error('Nincs admin felhasználó (npm run db:seed).');
  db.transaction(() => {
    for (const o of orszagok) for (const b of o.blokkok) upsertBlokk(o.kod, ev, b.blokk, b.ertek, admin.id);
  });
  for (const o of orszagok) console.log(`${o.kod}: ${o.blokkok.length} blokk mentve ${ev}-ra (szerző: ${admin.name})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 5: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: hibátlan (nincs kimenet).

- [ ] **Step 6: Regresszió – az új futtató KR/JP kimenete bájtra azonos a régiével**

```bash
T=$(mktemp -d) && sqlite3 data/tet.db ".backup '$T/t.db'"
DATABASE_URL="$T/t.db" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts
sqlite3 "$T/t.db" "$Q" > "$S/kr-jp-uj.txt" && cmp "$S/kr-jp-regi.txt" "$S/kr-jp-uj.txt" && echo AZONOS
sqlite3 "$T/t.db" "select orszag_kod, ev, alapadatok is not null, kfi_rendszer is not null from orszagprofil order by 1, 2;"
rm -rf "$T"
```

Expected:
- `KR: 8 blokk mentve 2026-ra (…)`, `JP: 8 blokk mentve 2026-ra (…)`, majd `AZONOS`.
- A három sor: `JP|2025|1|0`, `JP|2026|1|1`, `KR|2026|1|1`. A JP 2025-ös sorhoz a futtató nem nyúl.

- [ ] **Step 7: Ellenőrző mód – nem nyitja meg a DB-t**

```bash
NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts --csak KR,JP; echo "exit=$?"
NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts --csak KR,XX; echo "exit=$?"
```

Expected:
- **Első futás:** `JP: 8 blokk rendben (2026), nem írtam a DB-be`, `KR: 8 blokk rendben (2026), nem írtam a DB-be`, `exit=0`. **Nincs** `[db] …` sor, tehát a DB nem nyílt meg.
- **Második futás:** `1 hiba, a DB-be nem írtam:`, `  nincs adatfájl: xx.ts`, `exit=1`.

- [ ] **Step 8: Szigorú ellenőrzés – egy szándékosan hibás adatfájl**

```bash
cat > scripts/demo-orszagprofil/orszagok/at.ts <<'EOF'
import type { DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'AT',
  profil: {
    alapadatok: { fovaros: 'Bécs', tagsagok: ['EU', 'Európai Unió'], lakosag: '9 200 000', agazatok: 'Turizmus' },
    rendezvenyek: { 'rendezveny.0.nev': 'Teszt', 'rendezveny.0.tipus': 'kiallitas', 'rendezveny.10.nev': 'Túl sok' },
  },
};

export default orszag;
EOF
NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts --csak AT; echo "exit=$?"
T=$(mktemp -d) && sqlite3 data/tet.db ".backup '$T/t.db'"
DATABASE_URL="$T/t.db" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts; echo "exit=$?"
sqlite3 "$T/t.db" "select count(*) from orszagprofil where orszag_kod='AT';"
rm -rf "$T" scripts/demo-orszagprofil/orszagok/at.ts
git status --short scripts/
```

Expected:
- **Mindkét futás** `5 hiba, a DB-be nem írtam:`, `exit=1`, és ezek a sorok:
  - `at.ts: alapadatok: tagsagok: szótáron kívüli opció „Európai Unió”`
  - `at.ts: alapadatok: ismeretlen mező: lakosag`
  - `at.ts: alapadatok: agazatok: lista kell`
  - `at.ts: rendezvenyek: rendezveny.0.tipus: ismeretlen típus „kiallitas” (szakkiallitas, konferencia, forum)`
  - `at.ts: rendezvenyek: rendezveny.10.nev: legfeljebb 10 rendezvény (index 0–9)`
- **A teljes futás:** a KR/JP is hibátlan, mégsem írt semmit (`exit=1`), és az AT-sor száma `0`.
- **Végül:** a hibás fájl törölve, a `git status` csak az új `tipusok.ts`, `orszagok/kr.ts`, `orszagok/jp.ts` és a módosult `demo-orszagprofil.ts` fájlt mutatja.

- [ ] **Step 9: Commit**

```bash
git add scripts/demo-orszagprofil.ts scripts/demo-orszagprofil/tipusok.ts scripts/demo-orszagprofil/orszagok/kr.ts scripts/demo-orszagprofil/orszagok/jp.ts
git commit -m "$(printf 'feat(orszagprofil-feltoltes): országonkénti adatfájlok és szigorú futtató (ellenőrző mód, részleges profil, tranzakciós írás); KR, JP változatlanul átköltöztetve\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

## Közös csomag-eljárás (a 2–7. task minden csomagjára)

Egy csomag néhány ország 2026-os profilját írja meg, országonként egy fájlba: `scripts/demo-orszagprofil/orszagok/<kod>.ts` (kisbetűs kód).

**Mintának olvasd el:**
- `scripts/demo-orszagprofil/orszagok/kr.ts` – a stílus, a terjedelem és a forma (a kész 1. task után ez a fájl létezik);
- `scripts/demo-orszagprofil/tipusok.ts` – a típusok és a `rendezvenyek()`;
- `lib/orszagprofil-szotar.ts` – a listás opciók (`TAGSAGOK`, `GAZDASAGI_AGAZATOK`, `KFI_PRIORITASOK`, `IPARAGAK`), a `RENDEZVENY_TIPUSOK`, a blokkok és a mezőnevek (`MEZO_CIMKEK`).

**A fájl formája:**

```ts
/**
 * <Ország magyar neve> (<KÓD>) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-<nap>):
 * - Alapadatok: IMF World Economic Outlook, 2025. október – <URL>
 * - GII 2025: <URL>
 * - GERD: <forrás, adatév> – <URL>
 * - Stratégia: <URL>
 * - Magyar vonatkozás: <minden ilyen állítás forrása, URL-lel>
 * - <további fontos források>
 * Kimaradt blokkok és mezők: <mi maradt üresen, és miért>.
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: '<KÓD>',
  profil: {
    alapadatok: { /* … */ },
    // … a többi blokk, ahol van valós tartalom …
  },
};

export default orszag;
```

Ha egy országban nincs rendezvény, a `rendezvenyek` import elhagyható, és csak a `type DemoOrszag` marad.

**Tartalmi szabályok (a spec szerint):**

1. **Nyelv és stílus.** Magyar, a `kr.ts` stílusában és terjedelmében: szöveges mezőnként 1–4 tömör mondat, felsorolás vesszővel vagy pontosvesszővel. Intézmény- és cégnevek a nemzetközileg használt alakban, szükség esetén magyar magyarázattal. Az `iranyitoSzervek`-ben soronként egy szerv (`\n`), mint a `kr.ts`-ben.
2. **Alapadatok, egységes forrásból:**
   - GDP (folyó áron, milliárd USD), egy főre jutó GDP (USD), reál GDP-növekedés (%) és lakosság: **IMF World Economic Outlook, 2025. október**, a 2025-ös évre; `adatEv: '2025'`.
   - Terület (km²): a nemzeti statisztikai hivatal vagy a CIA World Factbook.
   - `forras`: `'IMF World Economic Outlook (2025. október), Világbank, <nemzeti statisztikai hivatal>'` (legfeljebb 200 karakter).
   - Ahol az IMF nem közöl adatot (pl. Amerikai Virgin-szigetek, Észak-Korea), a hivatalos becslés kerül be. A `forras` ezt nevezi meg, és az `adatEv` a becslés tényleges éve. Amire nincs megbízható adat, az a mező üres (`''`).
   - Tagságok és ágazatok a szótár listájából. Ami nincs a listában, az a `tagsagEgyeb`/`agazatEgyeb` mezőbe kerül.
3. **KFI-rendszer:**
   - `teljesitmeny`: a Global Innovation Index 2025 helyezés (ha az ország szerepel), a GERD adatéve és forrása, 1–2 jellemző trend.
   - `gerd`: a legfrissebb elérhető év (UNESCO UIS, OECD MSTI vagy Világbank `GB.XPD.RSDV.GD.ZS`); ha nincs megbízható adat, `''`.
   - `strategia`: a hatályos nemzeti KFI-stratégia neve és időtávja (legfeljebb 200 karakter).
   - `prioritasok` és `kiemeltIparagak` a szótárból, a többi az „egyéb” mezőbe. A `kiemeltIparagak` **első** eleme adja a térkép színét, ezért az legyen az ország legjellemzőbb KFI-területe.
4. **Rendezvények.** Visszatérő, valóban létező események a `rendezvenyek([...])` segéddel:
   - név, szokásos hónap és helyszín (pl. `'október, Párizs'`), típus (`'szakkiallitas' | 'konferencia' | 'forum'`);
   - konkrét 2026-os dátum csak ellenőrzött forrásból;
   - legfeljebb 10 esemény.
5. **Magyar vonatkozás.** Az `egyezmeny` (legfeljebb 200 karakter), a `ketoldalu` és a `mobilitas` mezőbe csak ellenőrzött tény kerül, például:
   - egy kétoldalú tudományos-technológiai egyezmény neve és éve (Nemzeti Jogszabálytár);
   - az NKFIH kétoldalú TéT-programjai;
   - a Stipendium Hungaricum partnerországi státusza;
   - ismert magyar telephelyek és befektetések.

   Ha nem ellenőrizhető, a mező `''`. A `magyarErtekeles` értékelés és javaslat: tényekre épül, de nem állít új tényt. Az `osszegzes` legfeljebb 500 karakter (a térkép-panel kivonatába kerül).
6. **Tilos a kitalálás.** Nem kerülhet be kitalált egyezmény, megállapodás, projekt, személy, intézményi kapcsolat, dátum vagy szám. A bizonytalan állítás kimarad.
7. **Részleges profil.** Egy blokk csak akkor kerül be, ha valós tartalma van. A meg nem adott blokk mentetlen marad, és a térképen kisebb kitöltöttségként látszik. Egy blokkon belül az ismeretlen mező `''`.
8. **Mezőkorlátok** (a futtató ellenőrzi):

   | Mező | Korlát |
   | --- | --- |
   | `fovaros`, `penznem`, `forras`, `tagsagEgyeb`, `agazatEgyeb`, `strategia`, `prioritasEgyeb`, `iparagEgyeb`, `egyezmeny` | legfeljebb 200 karakter |
   | `osszegzes` | legfeljebb 500 karakter |
   | a többi szöveges mező | legfeljebb 4000 karakter |
   | `topVallalatok` | legfeljebb 10 név, soronként (`[...].join('\n')`) |
   | rendezvény | név kötelező, a mezők legfeljebb 200 karakter, legfeljebb 10 sor |
   | `terulet`, `lakossag`, `gdpEgyFore` | egész |
   | `gdp`, `gdpNovekedes` | legfeljebb 1 tizedes |
   | `gerd` | legfeljebb 2 tizedes |

   A számok magyar formában: `'1 790,0'`, `'34 600'`, `'-0,5'`.
9. **Pénznem** a `kr.ts` mintájára, magyar névvel és ISO-kóddal: `'euró (EUR)'`, `'amerikai dollár (USD)'`.

**Kiinduló források:**
- **IMF WEO 2025. október:** https://www.imf.org/en/Publications/WEO/weo-database/2025/October
- **Global Innovation Index 2025:** https://www.wipo.int/global_innovation_index/en/
- **GERD:**
  - UNESCO UIS: https://data.uis.unesco.org
  - OECD MSTI: https://www.oecd.org/en/data/datasets/main-science-and-technology-indicators.html
  - Világbank: https://data.worldbank.org/indicator/GB.XPD.RSDV.GD.ZS
- **Horizont Európa társult országok:** https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/common/guidance/list-3rd-country-participation_horizon-euratom_en.pdf
- **NKFIH, nemzetközi együttműködések:** https://nkfih.gov.hu
- **Stipendium Hungaricum partnerországok:** https://stipendiumhungaricum.hu
- **Nemzeti Jogszabálytár (kihirdetett nemzetközi szerződések):** https://njt.hu

**Lépések:**

- [ ] **1. Olvasd el** a mintafájlokat (fent).
- [ ] **2. Kutass országonként** a forrásokból, minden számot és minden magyar vonatkozású állítást forrással.
- [ ] **3. Írd meg a fájlokat.** A fejléc-kommentben legyenek a források és a kimaradt blokkok.
- [ ] **4. Ellenőrző mód:**
  `NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts --csak <KÓDOK>`
  Várt kimenet: országonként `<KÓD>: <n> blokk rendben (2026), nem írtam a DB-be`. Hiba esetén javíts, és futtasd újra.
- [ ] **5. Típusellenőrzés, csak a saját fájlokra:**
  `npx tsc --noEmit --incremental false 2>&1 | grep -E 'scripts/demo-orszagprofil/orszagok/(<kód1>|<kód2>|…)\.ts'`
  Várt kimenet: üres. Más csomag félkész fájljának hibája nem a tiéd.
- [ ] **6. Önellenőrzés:**
  - minden szám mögött forrás van a fejlécben;
  - nincs kitalált konkrétum;
  - a magyar vonatkozás ellenőrzött, vagy üres;
  - a korlátok rendben;
  - az első kiemelt iparág az ország legjellemzőbb területe.
- [ ] **7. Ne commitolj.** A jelentésbe kerüljön országonként:
  - a megadott blokkok, és a kimaradtak oka;
  - a kulcsszámok (GDP, GDP/fő, növekedés, lakosság, GERD, GII-helyezés) forrással;
  - minden magyar vonatkozású állítás forrással;
  - a bizonytalan pontok.

**A csomag lezárása (a controller):**
1. Formai és szabály-review.
2. Tényellenőrző review: független webes ellenőrzés. Kiterjed minden alapadat-számra, a GERD-re, a GII-helyezésre, a stratégiára, az intézmény- és cégnevekre, a rendezvényekre és minden magyar vonatkozású állításra.
3. A javításokat ugyanaz az implementer végzi, utána újra-review.
4. A két review után a controller commitol:

```bash
git add scripts/demo-orszagprofil/orszagok/<kód1>.ts …
git commit -m "$(printf 'feat(orszagprofil-feltoltes): <KÓDOK> 2026-os profilja (kutatott adatokkal)\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 2: 1. csomag – DE, AT, GB, IE

**Files:** Create `scripts/demo-orszagprofil/orszagok/{de,at,gb,ie}.ts`

- [ ] **Steps 1–7:** a „Közös csomag-eljárás” 1–7. lépése a `DE,AT,GB,IE` kódokkal.
- [ ] **Lezárás:** a csomag lezárása; commit üzenet: `DE, AT, GB, IE 2026-os profilja (kutatott adatokkal)`.

Megjegyzések:
- **Németország:** három attasé fedi le (Berlin, Stuttgart, München részterületekkel), a profil országos.
- **Egyesült Királyság és Írország:** ugyanaz az attasé fedi le (London).
- Mind a négy ország teljes profilt kap, mind a 8 blokkal.

### Task 3: 2. csomag – FR, DZ, MA, TN, MR

**Files:** Create `scripts/demo-orszagprofil/orszagok/{fr,dz,ma,tn,mr}.ts`

- [ ] **Steps 1–7:** a „Közös csomag-eljárás” 1–7. lépése a `FR,DZ,MA,TN,MR` kódokkal.
- [ ] **Lezárás:** a csomag lezárása; commit üzenet: `FR, DZ, MA, TN, MR 2026-os profilja (kutatott adatokkal)`.

Megjegyzések:
- Szántó Szilvia (Párizs) régiója.
- Mauritánia részleges profil: csak a valós tartalmú blokkok.
- Az észak-afrikai országoknál a Horizont Európa-társulás és a Stipendium Hungaricum-státusz csak ellenőrizve kerül be.

### Task 4: 3. csomag – US, CA, PR, VI

**Files:** Create `scripts/demo-orszagprofil/orszagok/{us,ca,pr,vi}.ts`

- [ ] **Steps 1–7:** a „Közös csomag-eljárás” 1–7. lépése a `US,CA,PR,VI` kódokkal.
- [ ] **Lezárás:** a csomag lezárása; commit üzenet: `US, CA, PR, VI 2026-os profilja (kutatott adatokkal)`.

Megjegyzések:
- **Az USA-t** két attasé fedi le (New York, San Francisco), a profil országos.
- **Puerto Rico és az Amerikai Virgin-szigetek:** részleges profil, csak a valós tartalmú blokkok.
  - A Virgin-szigetekről az IMF nem közöl adatot: az USA Gazdaságelemzési Hivatalának (BEA) becslése kerül be a tényleges adatévvel.
  - Puerto Rico szerepel az IMF WEO-ban.

### Task 5: 4. csomag – BR, GY, SR, IL

**Files:** Create `scripts/demo-orszagprofil/orszagok/{br,gy,sr,il}.ts`

- [ ] **Steps 1–7:** a „Közös csomag-eljárás” 1–7. lépése a `BR,GY,SR,IL` kódokkal.
- [ ] **Lezárás:** a csomag lezárása; commit üzenet: `BR, GY, SR, IL 2026-os profilja (kutatott adatokkal)`.

Megjegyzések:
- **Guyana és Suriname:** részleges profil.
- **Brazília és Izrael:** teljes profil.

### Task 6: 5. csomag – RU, CN, KP

**Files:** Create `scripts/demo-orszagprofil/orszagok/{ru,cn,kp}.ts`

- [ ] **Steps 1–7:** a „Közös csomag-eljárás” 1–7. lépése a `RU,CN,KP` kódokkal.
- [ ] **Lezárás:** a csomag lezárása; commit üzenet: `RU, CN, KP 2026-os profilja (kutatott adatokkal)`.

Megjegyzések:
- **Oroszország:** a 2022 utáni szankciós környezet (pl. az EU felfüggesztette Oroszország részvételét a kutatási programokban) tényszerűen, forrással; politikai értékelés nélkül.
- **Kína:** a stratégia mezőbe a hatályos ötéves terv és a kapcsolódó KFI-stratégia kerül, ellenőrzött névvel és időtávval.
- **Észak-Korea:** csak az alábbi három blokk; a többi mentetlen.
  - **Alapadatok:** becslésekkel, a forrás megnevezésével; amire nincs megbízható adat, az üres.
  - **Kapcsolatok:** benne az ENSZ BT 2321 (2016) határozata, amely a tudományos és műszaki együttműködést (kivételekkel) tiltja.
  - **Magyar értékelés:** rövid, és ezt a korlátot rögzíti.

### Task 7: 6. csomag – IN, BD, LK, NP, MV

**Files:** Create `scripts/demo-orszagprofil/orszagok/{in,bd,lk,np,mv}.ts`

- [ ] **Steps 1–7:** a „Közös csomag-eljárás” 1–7. lépése az `IN,BD,LK,NP,MV` kódokkal.
- [ ] **Lezárás:** a csomag lezárása; commit üzenet: `IN, BD, LK, NP, MV 2026-os profilja (kutatott adatokkal)`.

Megjegyzések:
- Daczi Diána (Új-Delhi) régiója.
- **A Maldív-szigetek:** részleges profil.
- **India:** teljes profil.
- **Banglades, Srí Lanka és Nepál:** annyi blokk, amennyihez van valós tartalom.

---

### Task 8: Demó DB, hosting-csere, dokumentáció, ellenőrzés

**Files:**
- Modify: `data/tet.db` (commit)
- Modify: `scripts/db-init.mjs:15-19`
- Modify: `CLAUDE.md` (a Parancsok blokk, a 26. sor után), `README.md` (két mondat)

- [ ] **Step 1: Teljes futás a demó DB másolatán**

```bash
ls scripts/demo-orszagprofil/orszagok/ | wc -l   # 27
NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts --csak AT,BD,BR,CA,CN,DE,DZ,FR,GB,GY,IE,IL,IN,JP,KP,KR,LK,MA,MR,MV,NP,PR,RU,SR,TN,US,VI
T=$(mktemp -d) && sqlite3 data/tet.db ".backup '$T/t.db'"
DATABASE_URL="$T/t.db" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts
sqlite3 "$T/t.db" "select count(*) from orszagprofil where ev=2026;"
sqlite3 "$T/t.db" "select orszag_kod, (alapadatok is not null)+(kfi_rendszer is not null)+(intezmenyek is not null)+(vallalati is not null)+(programok is not null)+(rendezvenyek is not null)+(kapcsolatok is not null)+(magyar_ertekeles is not null) from orszagprofil where ev=2026 order by 1;"
sqlite3 "$T/t.db" "select orszag_kod, ev from orszagprofil where ev<>2026;"
sqlite3 "$T/t.db" "select count(*) from user; select count(*) from attase_orszag;"
rm -rf "$T"
```

Expected:
- 27 fájl; az ellenőrző mód hibátlan; a futtató 27 sort ír (`… blokk mentve 2026-ra`).
- `27` profil 2026-ra.
- A blokkszámok a csomag-jelentések szerint: a teljes profiloknál 8, a részlegeseknél kevesebb.
- A 2026-on kívül csak a `JP|2025` sor marad.
- `16` felhasználó és `30` hozzárendelés, változatlanul.

- [ ] **Step 2: Futás a `data/tet.db`-n**

```bash
NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts
```

Expected: 27 sor, `… blokk mentve 2026-ra (szerző: …)`. A futó dev szerver a változást a következő oldalbetöltéskor mutatja.

- [ ] **Step 3: `scripts/db-init.mjs` – új csere-azonosító**

A 15–19. sor:

```js
// Egyszeri csere: a felhasználókat tartalmazó céladatbázis helyére is a repó demó adatbázisa kerül
// (2026-10-07: a 15 demó attasé a hostingra; a hPanel nélkül csak a build ér el a hosting-DB-hez).
// A régi fájl a -wal/-shm párjával együtt átnevezve megmarad. Minden demó-másolás után jelölőfájl
// készül a cél mellé, ezért ugyanarra az útvonalra csak egyszer fut le. Újabb cseréhez új azonosító kell.
const DEMO_CSERE = '2026-10-07';
```

helyett:

```js
// Egyszeri csere: a felhasználókat tartalmazó céladatbázis helyére is a repó demó adatbázisa kerül
// (2026-10-07: a 15 demó attasé; 2026-10-09: a 27 ország 2026-os profilja – a hPanel nélkül csak a
// build ér el a hosting-DB-hez). A hostingon az előző csere óta történt minden változás elvész; a
// régi fájl a -wal/-shm párjával együtt átnevezve megmarad. Minden demó-másolás után jelölőfájl
// készül a cél mellé, ezért ugyanarra az útvonalra csak egyszer fut le. Újabb cseréhez új azonosító kell.
const DEMO_CSERE = '2026-10-09';
```

- [ ] **Step 4: A csere kipróbálása ideiglenes célfájlon**

```bash
T=$(mktemp -d) && sqlite3 data/tet.db ".backup '$T/cel.db'" && touch "$T/cel.db.demo-csere-2026-10-07"
DATABASE_URL="$T/cel.db" node scripts/db-init.mjs
ls "$T"
DATABASE_URL="$T/cel.db" node scripts/db-init.mjs
rm -rf "$T"
```

Expected:
- **Első futás:**
  - `[db:init] egyszeri demó-csere (2026-10-09), a régi adatbázis elmentve: …cel.db.regi-<ts>`;
  - `[db:init] demó adatbázis másolva: …`.
- **Az `ls`:** `cel.db`, `cel.db.demo-csere-2026-10-07`, `cel.db.demo-csere-2026-10-09`, `cel.db.regi-<ts>`.
- **Második futás:** `[db:init] meglévő adatbázis felhasználókkal: …cel.db, nincs másolás.`

- [ ] **Step 5: `CLAUDE.md` – a futtató parancssora**

A Parancsok blokkban, a `DEMO_ATTASE_PASSWORD=… … scripts/demo-attasek.ts …` sor (26. sor) **után** új sor:

```
NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts [--csak DE,AT]   # az attasék 27 országának 2026-os demó-profilja (kutatott vázlat; országonként scripts/demo-orszagprofil/orszagok/<kod>.ts, az űrlap-értékek formájában) a DATABASE_URL DB-be: előbb mindent ellenőriz (validalBlokk + szigorú mező-, opció- és rendezvénytípus-ellenőrzés, mert a validátor ezeket némán eldobná), csak hibátlan adatnál ír, egy tranzakcióban, a meg nem adott blokkhoz nem nyúl; --csak: csak ellenőriz, a DB-t meg sem nyitja
```

- [ ] **Step 6: `README.md` – két mondat**

Ezt a szövegrészt:

```
(felhasználókkal és mintaprofilokkal, a belépési adatok a `.env.example` kommentjeiben)
```

erre cseréld:

```
(felhasználókkal és az attasék 27 országának 2026-os profiljával – kutatott vázlat, `scripts/demo-orszagprofil.ts` –, a belépési adatok a `.env.example` kommentjeiben)
```

Ezt a mondatot:

```
Kivétel az egyszeri csere (`scripts/db-init.mjs` `DEMO_CSERE`): a 2026-10-07 utáni első build a meglévő hosting-DB-t is lecseréli a repóéra, mert hPanel és SSH nélkül csak a build fér hozzá; a régi fájl `<db>.regi-<időbélyeg>` néven (a `-wal`/`-shm` párjával együtt) megmarad, és a `<db>.demo-csere-2026-10-07` jelölőfájl miatt a későbbi buildek már nem cserélnek.
```

erre cseréld:

```
Kivétel az egyszeri csere (`scripts/db-init.mjs` `DEMO_CSERE`, jelenleg `2026-10-09`: a 27 ország profilja): az azonosító változása utáni első build a meglévő hosting-DB-t is lecseréli a repóéra, mert hPanel és SSH nélkül csak a build fér hozzá – a hostingon az előző csere óta történt minden változás (jelszócserék, új fiókok, bejegyzések, ticketek, profilmentések) elvész; a régi fájl `<db>.regi-<időbélyeg>` néven (a `-wal`/`-shm` párjával együtt) megmarad, és a `<db>.demo-csere-<azonosító>` jelölőfájl miatt a későbbi buildek már nem cserélnek.
```

- [ ] **Step 7: Típusellenőrzés és build**

```bash
npx tsc --noEmit
npm run build
```

Expected:
- A `tsc` hibátlan.
- A build `✓ Compiled successfully`, és a típusellenőrzés lefut.
- `[db:init] a DATABASE_URL a repó adatbázisára mutat (…), nincs másolás.`
- Ha a build nem létező `app/...` modulra panaszkodik, az a dev szerver elavult `.next/dev/types/validator.ts`-e: szólj a controllernek.

- [ ] **Step 8: Böngészős ellenőrzés (gstack, a futó dev szerveren)**

```bash
B=~/.claude/skills/gstack/browse/dist/browse
S=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/ff5a9b0c-7c4e-4840-a242-43c0a4876dfb/scratchpad
$B viewport 1440x900 >/dev/null
$B goto http://localhost:3000/terkep >/dev/null; $B url
```

Ha a `url` `/login…`, jelentkezz be:

```bash
$B goto 'http://localhost:3000/login?next=%2Fterkep' >/dev/null && $B wait --networkidle >/dev/null
$B fill '#email' admin@niu.hu >/dev/null
$B fill '#password' "$(sed -n 's/^SEED_ADMIN_PASSWORD=//p' .env.local)" >/dev/null 2>&1
$B click 'button[type=submit]' >/dev/null
$B wait '[data-pinek] > g'; $B url
```

A „Selector matched multiple elements” itt sikert jelent.

1. **„Kiemelt iparág” mutató (alapérték).** Futtasd: `$B eval "$S/tooltip-qa.js"`.
   - Németország, USA, Írország, Ausztria `szoveg`-ében: „Adott évi profil · 2026” és „Kiemelt: <az első két kiemelt iparág>”.
   - A `JOBB` és `BAL` tooltip `bentVan: true`.
2. **„Egy főre jutó GDP” mutató.** Váltás:
   ```bash
   $B click '#mutato' >/dev/null
   $B click '[role=option]:has-text("Egy főre jutó GDP")' >/dev/null || $B js "(() => { const o = [...document.querySelectorAll('[role=option]')].find((x) => x.textContent.trim() === 'Egy főre jutó GDP'); if (!o) return 'nincs opció'; o.click(); return 'ok'; })()"
   $B eval "$S/tooltip-qa.js"
   ```
   A négy ország `szoveg`-ében „Egy főre jutó GDP: <szám> USD (<helyezés>.)”. A szám egyezzen az adatfájlokéval.
3. **„K+F ráfordítás (GERD)” mutató.** Ugyanígy, a négy ország `szoveg`-ében „K+F ráfordítás (GERD): <szám> % (<helyezés>.)”.
4. **Profiloldalak.** Ellenőrizd őket a `$B goto http://localhost:3000/orszagprofil/<KÓD>`, majd a `$B text` paranccsal:
   - **DE:** a fejlécben az „Adott évi profil” jelvény, a 8 blokk a tartalommal, a rendezvények.
   - **KP:** az Alapadatok, a Kapcsolatok (benne az ENSZ BT 2321) és a Magyar értékelés, a többi blokk kitöltetlen.
   - **MV:** a kitöltött és a kitöltetlen blokkok a csomag-jelentés szerint.
5. **Konzol.** A `$B console --errors` eredménye üres.
6. **Kijelentkezés:**
   ```bash
   $B js "(() => { const b = [...document.querySelectorAll('aside form button[type=submit]')].find((x) => x.textContent === 'Kijelentkezés'); if (!b) return 'nincs gomb'; b.click(); return 'ok'; })()"
   $B wait --networkidle >/dev/null; $B url   # http://localhost:3000/login…
   ```

- [ ] **Step 9: A demó DB tisztítása és commitja**

```bash
sqlite3 data/tet.db "select count(*) from session;"
sqlite3 data/tet.db "delete from session;"
sqlite3 data/tet.db "VACUUM;"
sqlite3 data/tet.db "PRAGMA wal_checkpoint(TRUNCATE);"
sqlite3 data/tet.db "select count(*) from session; select count(*) from orszagprofil where ev=2026; select count(*) from riport; select count(*) from ticket;"
git add data/tet.db
git commit -m "$(printf 'chore(orszagprofil-feltoltes): demó DB – az attasék 27 országának 2026-os profilja, sessionök nélkül\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

Expected:
- **Az első `select`:** legalább 1 – a felhasználó helyi bejelentkezése; ezután a gépén újra be kell lépnie.
- **A végén:** `0`, `27`, `0`, `0`.
- **Zárolás:** ha a `VACUUM` vagy a checkpoint `database is locked`/`busy` hibát ad (a dev szerver épp olvas), pár másodperc múlva ismételd. A checkpoint kimenete `0|0|0`.

- [ ] **Step 10: A kód és a dokumentáció commitja**

```bash
git add scripts/db-init.mjs CLAUDE.md README.md
git commit -m "$(printf 'feat(orszagprofil-feltoltes): újabb egyszeri hosting-DB-csere (DEMO_CSERE 2026-10-09); CLAUDE.md, README – a futtató és a mintaprofilok\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
git status --short   # üres, vagy legfeljebb ` M data/tet.db`, ha a dev szerver közben írt (nem commitoljuk)
```

- [ ] **Step 11: Lezárás**

A branch kész: `superpowers:finishing-a-development-branch`. A felhasználó eddig a lokális fast-forward merge-et választotta; a push és vele a hosting-csere az ő döntése.
