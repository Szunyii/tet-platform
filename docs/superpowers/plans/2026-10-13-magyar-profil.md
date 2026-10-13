# Magyarország országprofilja az összehasonlításhoz – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Magyarország kutatott, 2026-os országprofilt kap, így megjelenik a térképen, a rangsorokban és az összehasonlító táblában; ahol attasé nélküli országnál „nincs aktív attasé” állna, ott Magyarországnál „hazai profil – a központ tartja karban” jelenik meg.

**Architecture:** A `listTerkepAdat(ev)` minden profillal rendelkező országot visszaad, ezért a megjelenéshez elég egy `HU` profilsor – ezt a meglévő feltöltő út adja (`scripts/demo-orszagprofil/orszagok/hu.ts` + a futtató `--ir` módja). Kód csak a feliratnál változik: egy `HAZAI_KOD` / `hazaiE` segéd az országszótárban és egy `attaseNelkulFelirat` segéd, amelyet a térkép két komponense használ.

**Tech Stack:** Next.js 16, React 19, TypeScript 7, Drizzle + better-sqlite3, tsx a futtatóhoz és az ellenőrző scriptekhez; webes kutatás a profil tartalmához.

**Spec:** `docs/superpowers/specs/2026-10-13-magyar-profil-design.md`.

---

## Közös tudnivalók (minden taskhoz)

- Ág: `magyar-profil` (a `jelentes-intezkedes` ág tetején), a repó fő munkafájában (`/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next`). **Ágat váltani, `git stash`-t, `git reset`-et, `git checkout -- <fájl>`-t futtatni tilos.**
- A 3000-es porton a felhasználó dev szervere futhat ugyanezzel a `data/tet.db`-vel (a terv írásakor nem futott). **Leállítani, újraindítani tilos; saját dev szervert ne indíts.**
- A munkafában a terv indulásakor egy commitolatlan módosítás van: ` M data/tet.db` (a `0010` migráció a másik fejlesztésből). **Ne commitold, ne állítsd vissza.** A `data/tet.db`-be csak a 3. task ír, és csak az 5. task commitolja. Minden commit konkrét fájlokat ad hozzá; `git add -A`, `git add .`, `git commit -a` tilos.
- Minden parancs a repó gyökeréből fut. Összetett parancsban ne használj `cd`-t. A `TMPDIR`-t ne állítsd át (a tsx IPC-socketjének útvonala különben túl hosszú lesz).
- Nincs tesztkeretrendszer és nincs linter. Az ellenőrzés: `npx tsc --noEmit`, a demó-futtató ellenőrző módja, az előre megírt ellenőrző scriptek, a végén `npm run build` és böngészős QA.
- A felület szövegei magyarok; a feliratokat **betűre pontosan** a tervből vedd (magyar idézőjelek: „ ”, nagykötőjel: –).
- Commit-üzenet: magyar, `típus(magyar-profil): …` alakban, a végén üres sor után `Co-Authored-By: <a futó modell neve> <noreply@anthropic.com>`.
- A scratchpad (nem része a repónak):

  ```bash
  SCRATCH=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/85dd8b25-8254-4183-9cd5-5a43bd1bb329/scratchpad
  ```

  A scratchpad scriptjei csak a repó fájljait (abszolút útvonallal) és Node beépített modulokat importálhatnak. WAL módú DB-másolat csak olvasó megnyitása: `sqlite3 "file:<útvonal>?immutable=1" "…"`.

### Előkészítve a scratchpadben (a terv írásakor elkészült és ki lett próbálva)

- `$SCRATCH/ell-hu-1-hazai.ts`: az 1. task ellenőrzője (a terv írásakor elbukott, mert a segédek még nincsenek meg).
- `$SCRATCH/ell-hu-2-terkep.ts`: a 3. task ellenőrzője a megadott `DATABASE_URL`-en (a terv írásakor elbukott: „Magyarország szerepel a térkép adatai között”). A térkép adatai között a terv írásakor 27 ország volt.

---

## Fájlszerkezet

| Fájl | Változás | Felelősség |
| --- | --- | --- |
| `lib/orszagok.ts` | módosul | `HAZAI_KOD`, `hazaiE` |
| `lib/attase-orszag.ts` | módosul | `attaseNelkulFelirat(kod)` – az attasé nélküli ország felirata a térképen |
| `app/(app)/terkep/components/TerkepTooltip.tsx` | módosul | a buborék felirata |
| `app/(app)/terkep/components/ProfilKivonat.tsx` | módosul | az oldalsó kivonat felirata |
| `components/orszagprofil/AttaseLista.tsx` | módosul | a profil oldal fejlécének felirata |
| `scripts/demo-orszagprofil/orszagok/hu.ts` | **új** | Magyarország 2026-os profilja (kutatott adat) |
| `CLAUDE.md`, `README.md` | módosul | dokumentáció |
| `data/tet.db` | módosul | a `HU` 2026 profilsor (az 5. task commitolja) |

---

### Task 1: „hazai profil” felirat

**Files:**
- Modify: `lib/orszagok.ts`
- Modify: `lib/attase-orszag.ts`
- Modify: `app/(app)/terkep/components/TerkepTooltip.tsx`
- Modify: `app/(app)/terkep/components/ProfilKivonat.tsx`
- Modify: `components/orszagprofil/AttaseLista.tsx`
- Test: `$SCRATCH/ell-hu-1-hazai.ts`

- [ ] **Step 1: Az ellenőrző script fusson, és bukjon el**

A script tartalma (már a scratchpadben van):

```ts
// Magyar profil, 1. task: a hazai ország segédjei és az attasé nélküli felirat.
import assert from 'node:assert/strict';
import { attaseNelkulFelirat } from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/lib/attase-orszag';
import { HAZAI_KOD, hazaiE, orszagByKod } from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/lib/orszagok';

assert.equal(HAZAI_KOD, 'HU');
assert.equal(orszagByKod(HAZAI_KOD)?.nev, 'Magyarország');
assert.equal(hazaiE('HU'), true);
assert.equal(hazaiE('AT'), false);
assert.equal(hazaiE(null), false);
assert.equal(attaseNelkulFelirat('HU'), 'hazai profil – a központ tartja karban');
assert.equal(attaseNelkulFelirat('AT'), 'nincs aktív attasé');
console.log('OK – ell-hu-1-hazai');
```

Run:

```bash
SCRATCH=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/85dd8b25-8254-4183-9cd5-5a43bd1bb329/scratchpad
NODE_OPTIONS="--conditions=react-server" npx tsx "$SCRATCH/ell-hu-1-hazai.ts"
```

Expected: FAIL, `AssertionError` az első `assert.equal(HAZAI_KOD, 'HU')` soron (`undefined` ≠ `'HU'`).

- [ ] **Step 2: `HAZAI_KOD` és `hazaiE` az országszótárban**

`lib/orszagok.ts`, az `orszagNev` függvény után (a `const NEV_GEO_SZERINT` elé) szúrd be:

```ts
/**
 * A hazai ország: a profilja viszonyítási alap a térképen és az összehasonlításban. Nem attasé-
 * állomáshely, a profilját a központ (admin) tartja karban – a felület ezért attasé hiányában
 * nem „nincs aktív attasé”-t, hanem „hazai profil”-t ír.
 */
export const HAZAI_KOD = 'HU';

export function hazaiE(kod: string | null | undefined): boolean {
  return kod === HAZAI_KOD;
}

```

- [ ] **Step 3: `attaseNelkulFelirat`**

`lib/attase-orszag.ts`. Az import régi sora:

```ts
import { orszagNev } from './orszagok';
```

Új:

```ts
import { hazaiE, orszagNev } from './orszagok';
```

Az `attasekRovid` függvény után szúrd be:

```ts

/**
 * Az attasé nélküli ország felirata a térképen (buborék, oldalsó kivonat): a hazai országnál ez
 * nem hiány, hanem a központ által karbantartott profil.
 */
export function attaseNelkulFelirat(kod: string): string {
  return hazaiE(kod) ? 'hazai profil – a központ tartja karban' : 'nincs aktív attasé';
}
```

- [ ] **Step 4: Az ellenőrző script most menjen át**

Run: `NODE_OPTIONS="--conditions=react-server" npx tsx "$SCRATCH/ell-hu-1-hazai.ts"`
Expected: `OK – ell-hu-1-hazai`

- [ ] **Step 5: A térkép buborékja**

`app/(app)/terkep/components/TerkepTooltip.tsx`. Régi:

```tsx
import { attaseFelirat } from '../../../../lib/attase-orszag';
```

Új:

```tsx
import { attaseFelirat, attaseNelkulFelirat } from '../../../../lib/attase-orszag';
```

Régi:

```tsx
  if (o.attasek.length === 0) return <p className="text-background/70">nincs aktív attasé</p>;
```

Új:

```tsx
  if (o.attasek.length === 0) return <p className="text-background/70">{attaseNelkulFelirat(o.kod)}</p>;
```

- [ ] **Step 6: Az oldalsó kivonat**

`app/(app)/terkep/components/ProfilKivonat.tsx`. Régi:

```tsx
import { attaseFelirat } from '../../../../lib/attase-orszag';
```

Új:

```tsx
import { attaseFelirat, attaseNelkulFelirat } from '../../../../lib/attase-orszag';
```

Régi:

```tsx
                <span>nincs aktív attasé</span>
```

Új:

```tsx
                <span>{attaseNelkulFelirat(o.kod)}</span>
```

- [ ] **Step 7: A profil oldal fejléce**

`components/orszagprofil/AttaseLista.tsx`. Régi:

```tsx
import { attaseHely, type OrszagAttase } from '../../lib/attase-orszag';
import { Badge } from '../ui/badge';
```

Új:

```tsx
import { attaseHely, type OrszagAttase } from '../../lib/attase-orszag';
import { hazaiE } from '../../lib/orszagok';
import { Badge } from '../ui/badge';
```

Régi:

```tsx
  if (attasek.length === 0) return <p className="text-sm text-muted-foreground">Nincs aktív attasé.</p>;
```

Új:

```tsx
  if (attasek.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {hazaiE(kod) ? 'Hazai profil – a központ tartja karban.' : 'Nincs aktív attasé.'}
      </p>
    );
  }
```

- [ ] **Step 8: Típusellenőrzés és maradék-keresés**

```bash
npx tsc --noEmit
grep -rn -i "nincs aktív attasé" app components lib
```

Expected: a `tsc` hiba nélkül (nincs kimenet). A `grep` találatai: a `lib/orszagok.ts` új doc-kommentje, a `lib/attase-orszag.ts` új függvényének visszatérési értéke, a `components/orszagprofil/AttaseLista.tsx` „Nincs aktív attasé.” ága, és a `TerkepTooltip.tsx` egy régi kommentje („nincs aktív attaséja”). JSX-literálként a `TerkepTooltip.tsx`-ben és a `ProfilKivonat.tsx`-ben már **nem** szerepelhet.

- [ ] **Step 9: Commit**

```bash
git add lib/orszagok.ts lib/attase-orszag.ts "app/(app)/terkep/components/TerkepTooltip.tsx" "app/(app)/terkep/components/ProfilKivonat.tsx" components/orszagprofil/AttaseLista.tsx
git commit -m "feat(magyar-profil): „hazai profil” felirat a hazai országnál a „nincs aktív attasé” helyett (HAZAI_KOD, hazaiE, attaseNelkulFelirat)

Co-Authored-By: <a futó modell neve> <noreply@anthropic.com>"
```

---

### Task 2: Magyarország 2026-os profilja – `scripts/demo-orszagprofil/orszagok/hu.ts`

Kutatási task: az eredmény egy adatfájl. **Ez a task nem commitol és nem ír a DB-be** (a `--ir` tilos); a commitot a két review után a vezérlő végzi.

**Files:**
- Create: `scripts/demo-orszagprofil/orszagok/hu.ts`

**Mintának olvasd el:**
- `scripts/demo-orszagprofil/orszagok/at.ts` – a forma, a stílus, a terjedelem és a fejléc forráslistája (ez a legközelebbi minta: EU- és OECD-tag, Scoreboard-vállalatok);
- `scripts/demo-orszagprofil/tipusok.ts` – a típusok és a `rendezvenyek()` segéd;
- `lib/orszagprofil-szotar.ts` – a listás opciók (`TAGSAGOK`, `KFI_PRIORITASOK`, `AGAZATOK`, `RENDEZVENY_TIPUSOK`), a korlátok és a mezők magyarázata (`MEZO_CIMKEK`);
- `scripts/demo-orszagprofil.ts` fejléc-kommentje – a futtató szigorú szabályai.

**A fájl formája**

```ts
/**
 * Magyarország (HU) 2026-os profilja – kutatott vázlat, a központ pontosítja. Hazai profil: viszonyítási alap a
 * térképen és az összehasonlításban.
 * Források (hozzáférés: 2026-10-13):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (…a négy szám…) – <URL>
 * - Terület: KSH (…) – <URL>
 * - GII 2025 (…) – <URL>
 * - GERD: OECD MSTI (…kiadás, adatév, érték…) – <URL>; nemzeti adat: KSH (…) – <URL>
 * - Stratégia: … – <URL>
 * - Intézmények: … – <URL-ek>
 * - Top vállalatok: … – <URL>
 * - Rendezvények (hivatalos oldalak): <URL-ek>
 * - Nemzetközi tagságok: … – <URL-ek>
 * Kimaradt blokkok és mezők: a „6.2. Magyar–fogadó országbeli kapcsolatok” (magyarKapcsolatok) blokk – a hazai országra nem
 * értelmezhető; a 7. blokkból (magyarErtekeles) csak az összegzés készült el, a többi mező üres.
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'HU',
  profil: {
    alapadatok: { /* fovaros, terulet, penznem, lakossag, gdp, gdpEgyFore, gdpNovekedes, adatEv, forras, tagsagok, tagsagEgyeb, agazatok, agazatEgyeb */ },
    kfiRendszer: { /* teljesitmeny, gerd, strategia, prioritasok, prioritasEgyeb, kiemeltIparagak, iparagEgyeb, erossegek, kihivasok */ },
    intezmenyek: { /* iranyitoSzervek, egyetemek, kutatokozpontok, infrastrukturak */ },
    vallalati: { /* kiemeltAgazatok, agazatEgyeb, topVallalatok, startupok, klaszterek, technologiatranszfer */ },
    programok: { /* palyazatok, tamogatasiProgramok, finanszirozasiEszkozok, nemzetkoziReszvetel */ },
    rendezvenyek: rendezvenyek([ /* 3–5 sor */ ]),
    nemzetkoziKapcsolatok: { /* partnerorszagok, euMultilateralis */ },
    magyarErtekeles: {
      osszegzes: '…',
      egyuttmukodesiLehetosegek: '',
      joGyakorlatok: '',
      diplomaciaiPrioritasok: '',
    },
  },
};

export default orszag;
```

A `magyarKapcsolatok` kulcs **nem** szerepel a fájlban. A `magyarErtekeles` blokk mezőneveit az `at.ts`-ből vedd; ha a futtató az üres mezőket vagy a blokkot kifogásolja, a blokkban csak az `osszegzes` maradjon.

**Tartalmi szabályok**

1. **Nyelv és stílus.** Magyar, az `at.ts` stílusában és terjedelmében: szöveges mezőnként 1–4 tömör mondat. Az `iranyitoSzervek`-ben soronként egy szerv (`\n`). Tárgyszerű leírás a hazai rendszerről, nem önértékelő hangnemben – a szöveg egy fogadó ország profilja mellett, azzal azonos részletességgel legyen olvasható.
2. **Alapadatok:**
   - GDP (folyó áron, milliárd USD, legfeljebb 1 tizedes), egy főre jutó GDP (USD, egész), reál GDP-növekedés (%, legfeljebb 1 tizedes) és lakosság (egész): **IMF World Economic Outlook, 2025. októberi kiadás, a 2025-ös évre**; `adatEv: '2025'`. Az IMF SDMX-végpontja az `at.ts` fejlécének mintájára: `https://api.imf.org/external/sdmx/3.0/data/dataflow/IMF.RES/WEO_2025_OCT_VINTAGE/1.0.0/HUN.NGDPD+NGDPDPC+NGDP_RPCH+LP.A`.
   - Terület (km², egész): KSH.
   - `fovaros: 'Budapest'`; `penznem: 'forint (HUF)'`.
   - `forras`: csak a ténylegesen használt források, legfeljebb 200 karakter (pl. `'IMF World Economic Outlook (2025. október), KSH'`).
   - `tagsagok` a `TAGSAGOK` listából (Magyarország: EU, OECD, NATO); a többi (schengeni övezet, V4, ESA, CERN, EMBL stb. – csak ellenőrzött) a `tagsagEgyeb` mezőbe.
   - `agazatok` az `AGAZATOK` listából; ami nincs benne, az `agazatEgyeb`-be.
3. **KFI-rendszer:**
   - `teljesitmeny`: a Global Innovation Index 2025 helyezése és jellemző pillérei, a GERD adatéve és forrása, 1–2 trend.
   - `gerd` (legfeljebb 2 tizedes): **OECD MSTI**, a legfrissebb elérhető év; a KSH nemzeti adata a szövegben említhető.
   - `strategia` (legfeljebb 200 karakter): a hatályos nemzeti KFI-stratégia neve és időtávja, hivatalos forrásból.
   - `prioritasok` a `KFI_PRIORITASOK`, `kiemeltIparagak` az `AGAZATOK` listájából; a többi az „egyéb” mezőkbe. A `kiemeltIparagak` **első** eleme adja a térkép színét: az ország legjellemzőbb KFI-területe legyen, és a fejléc indokolja forrással.
4. **Intézmények, vállalatok, programok:** a hatályos intézményrendszer (a tudománypolitikáért felelős minisztérium, NKFIH, HUN-REN, MTA, NIÜ stb.) a **2026. októberi állapot szerint**, hivatalos oldalakról – az intézményrendszer az elmúlt években többször változott, ezért minden szerv nevét és feladatkörét a saját oldalán ellenőrizd. Top vállalatok: a 2025-ös EU Industrial R&D Investment Scoreboard magyar székhelyű vállalatai K+F-ráfordítás szerint; ha kevés a találat, ismert, meghatározó K+F-szereplőkkel kiegészítve, a fejlécben jelölve. Legfeljebb 10 név, soronként (`[...].join('\n')`).
5. **Rendezvények:** 3–5 visszatérő, valóban létező hazai KFI-esemény a `rendezvenyek([...])` segéddel; típus: `'szakkiallitas' | 'konferencia' | 'forum'`; konkrét dátum csak a rendezvény hivatalos oldaláról.
6. **Nemzetközi kapcsolatok:** `partnerorszagok` és `euMultilateralis` – ellenőrzött tagságok és programrészvétel. A Horizont Európa és az Erasmus+ magyar részvételét érintő uniós korlátozásokról csak hivatalos forrásból, a 2026. októberi állapot szerint írj; ha az állapot nem állapítható meg egyértelműen, hagyd ki.
7. **Összegzés** (`magyarErtekeles.osszegzes`, legfeljebb 500 karakter): 2–3 mondat Magyarország KFI-helyzetéről viszonyítási alapként – a fájl többi részében forrásolt tényekre épül, új tényt nem állít.
8. **Tilos a kitalálás.** Nem kerülhet be kitalált intézmény, program, rendezvény, dátum vagy szám. A bizonytalan állítás kimarad; a nem ellenőrizhető mező `''`.
9. **Források.** Minden szám és minden nem közismert állítás mögött forrás áll a fejlécben, URL-lel. A Wikipedia önmagában nem forrás. A fejlécben nincs első személy és folyamat-megjegyzés. Személynév a tartalomban csak kivételesen szerepel.
10. **Mezőkorlátok** (a futtató ellenőrzi):

    | Mező | Korlát |
    | --- | --- |
    | `fovaros`, `penznem`, `forras`, `tagsagEgyeb`, `agazatEgyeb`, `strategia`, `prioritasEgyeb`, `iparagEgyeb` | legfeljebb 200 karakter |
    | `osszegzes` | legfeljebb 500 karakter |
    | a többi szöveges mező | legfeljebb 4000 karakter |
    | `topVallalatok` | legfeljebb 10 név |
    | rendezvény | név és típus kötelező, a mezők legfeljebb 200 karakter, legfeljebb 10 sor |
    | `terulet`, `lakossag`, `gdpEgyFore` | egész |
    | `gdp`, `gdpNovekedes` | legfeljebb 1 tizedes |
    | `gerd` | legfeljebb 2 tizedes |

    A számok magyar formában, **pont nélkül**: `'93 030'`, `'9 540 000'`, `'0,5'`.

**Lépések**

- [ ] **Step 1: Olvasd el** a mintafájlokat (fent).
- [ ] **Step 2: Kutass** a forrásokból; minden számot és állítást forrással jegyezz fel.
- [ ] **Step 3: Írd meg a fájlt** a fenti forma szerint; a fejlécben a források és a kimaradt blokkok.
- [ ] **Step 4: Ellenőrző mód**

  ```bash
  NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts --csak HU
  ```

  Expected: `HU: 8 blokk rendben (2026), nem írtam a DB-be` (vagy ezzel egyenértékű sor 8 blokkal). Hiba esetén javíts, és futtasd újra.

- [ ] **Step 5: Az összes ország együtt, és típusellenőrzés**

  ```bash
  NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts
  npx tsc --noEmit
  ```

  Expected: mind a 28 országfájl rendben, a futtató az „Íráshoz: --ir” tippet írja ki; a `tsc` hiba nélkül.

- [ ] **Step 6: Önellenőrzés:** minden szám mögött forrás van a fejlécben; nincs kitalált konkrétum; a korlátok rendben; az első kiemelt iparág indokolt; a `magyarKapcsolatok` nem szerepel.
- [ ] **Step 7: Ne commitolj.** A jelentésbe kerüljön: a megadott blokkok; a kulcsszámok (GDP, GDP/fő, növekedés, lakosság, terület, GERD, GII-helyezés) forrással; a top vállalatok listájának forrása; a bizonytalan pontok.

**A task lezárása (a vezérlő):**

1. Formai és szabály-review (a fenti szabályok, a futtató kimenete, az `at.ts`-sel azonos forma).
2. Tényellenőrző review: független webes ellenőrzés minden alapadat-számra, a GERD-re, a GII-helyezésre, a stratégiára, az intézmény- és cégnevekre, a rendezvényekre és a tagságokra.
3. A javításokat az implementer végzi, utána újra-review.
4. A két review után a vezérlő commitol:

```bash
git add scripts/demo-orszagprofil/orszagok/hu.ts
git commit -m "feat(magyar-profil): Magyarország 2026-os profilja (kutatott adatokkal, hazai viszonyítási alap)

Co-Authored-By: <a futó modell neve> <noreply@anthropic.com>"
```

---

### Task 3: Beírás a demó DB-be

Ezt a taskot a vezérlő végzi.

**Files:**
- Modify (nem commitolva): `data/tet.db`
- Test: `$SCRATCH/ell-hu-2-terkep.ts`

- [ ] **Step 1: Mentés és próbamásolat**

```bash
SCRATCH=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/85dd8b25-8254-4183-9cd5-5a43bd1bb329/scratchpad
rm -f "$SCRATCH/hu-elotte.db" "$SCRATCH/hu-proba.db" "$SCRATCH/hu-proba.db-wal" "$SCRATCH/hu-proba.db-shm"
sqlite3 data/tet.db ".backup '$SCRATCH/hu-elotte.db'"
cp "$SCRATCH/hu-elotte.db" "$SCRATCH/hu-proba.db"
sqlite3 "file:$SCRATCH/hu-elotte.db?immutable=1" "select count(*) from orszagprofil; select count(*) from orszagprofil where orszag_kod='HU'; select count(*) from __drizzle_migrations;"
```

Expected: `28`, `0`, `11`.

- [ ] **Step 2: Az ellenőrző script a próbamásolaton még bukjon el**

```bash
DATABASE_URL="$SCRATCH/hu-proba.db" NODE_OPTIONS="--conditions=react-server" npx tsx "$SCRATCH/ell-hu-2-terkep.ts"
```

Expected: FAIL – „Magyarország szerepel a térkép adatai között”.

A script tartalma (már a scratchpadben van):

```ts
// Magyar profil, 3. task: a térkép adatai között ott van Magyarország (a megadott DATABASE_URL-en).
import assert from 'node:assert/strict';
import { getProfil, listTerkepAdat } from '/Users/szunyoghdavid/Downloads/tet-platform/tet-platform-next/db/queries/orszagprofil';

const lista = listTerkepAdat(2026);
const hu = lista.find((o) => o.kod === 'HU');
assert.ok(hu, 'Magyarország szerepel a térkép adatai között');
assert.equal(hu.nev, 'Magyarország');
assert.equal(hu.allapot, 'friss');
assert.equal(hu.ev, 2026);
assert.deepEqual(hu.attasek, [], 'nincs attaséja');
assert.equal(hu.mentettDb, 8, '8 mentett blokk (a 6.2 kimarad)');
assert.ok(hu.alapadatok, 'van Alapadatok blokk');
assert.equal(hu.alapadatok.fovaros, 'Budapest');
assert.ok(typeof hu.alapadatok.gdp === 'number' && hu.alapadatok.gdp > 0, 'van GDP');
assert.ok(typeof hu.alapadatok.gdpEgyFore === 'number' && hu.alapadatok.gdpEgyFore > 0, 'van GDP/fő');
assert.ok(typeof hu.alapadatok.lakossag === 'number' && hu.alapadatok.lakossag > 9_000_000 && hu.alapadatok.lakossag < 10_000_000, 'a lakosság 9–10 millió');
assert.ok(typeof hu.gerd === 'number' && hu.gerd > 0.5 && hu.gerd < 3, 'a GERD hihető tartományban');
assert.ok(hu.iparagak.length > 0, 'van kiemelt iparág');
assert.ok(hu.osszegzes.length > 50 && hu.osszegzes.length <= 500, 'van összegzés (≤ 500 karakter)');
assert.ok(hu.rendezvenyDb >= 3, 'legalább 3 rendezvény');

const profil = getProfil('HU', 2026)!;
assert.ok(!profil.mentett.includes('magyarKapcsolatok'), 'a 6.2 blokk mentetlen');
assert.equal(lista.length, 28, 'a 27 ország + Magyarország');
console.log('OK – ell-hu-2-terkep |', 'GDP', hu.alapadatok.gdp, '| GDP/fő', hu.alapadatok.gdpEgyFore, '| lakosság', hu.alapadatok.lakossag, '| GERD', hu.gerd);
```

- [ ] **Step 3: Írás a próbamásolatra, és összevetés a mentéssel**

```bash
DATABASE_URL="$SCRATCH/hu-proba.db" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts --ir
sqlite3 "$SCRATCH/hu-proba.db" "
ATTACH 'file:$SCRATCH/hu-elotte.db?immutable=1' AS regi;
select 'sorok', (select count(*) from orszagprofil), (select count(*) from regi.orszagprofil);
select 'valtozatlan', count(*) from orszagprofil u join regi.orszagprofil r on r.id = u.id
  where u.orszag_kod is r.orszag_kod and u.ev is r.ev
    and u.alapadatok is r.alapadatok and u.kfi_rendszer is r.kfi_rendszer and u.intezmenyek is r.intezmenyek
    and u.vallalati is r.vallalati and u.programok is r.programok and u.rendezvenyek is r.rendezvenyek
    and u.nemzetkozi_kapcsolatok is r.nemzetkozi_kapcsolatok and u.magyar_kapcsolatok is r.magyar_kapcsolatok
    and u.magyar_ertekeles is r.magyar_ertekeles;
select 'hu', orszag_kod, ev,
  (alapadatok is not null) + (kfi_rendszer is not null) + (intezmenyek is not null) + (vallalati is not null)
  + (programok is not null) + (rendezvenyek is not null) + (nemzetkozi_kapcsolatok is not null)
  + (magyar_kapcsolatok is not null) + (magyar_ertekeles is not null) as mentett,
  magyar_kapcsolatok is null as m62_ures
  from orszagprofil where orszag_kod = 'HU';
select 'egyeb_tablak', (select count(*) from user), (select count(*) from riport), (select count(*) from attase_orszag);"
DATABASE_URL="$SCRATCH/hu-proba.db" NODE_OPTIONS="--conditions=react-server" npx tsx "$SCRATCH/ell-hu-2-terkep.ts"
```

Expected: a futtató hibátlanul ír (28 ország); `sorok|29|28`; `valtozatlan|28`; `hu|HU|2026|8|1`; az `egyeb_tablak` sor megegyezik a mentés azonos számaival (felhasználók: 16, jelentések: 0); a script: `OK – ell-hu-2-terkep | …`.

**Ha a `valtozatlan` nem 28:** ÁLLJ MEG, ne írj a `data/tet.db`-be. A futtató egy meglévő profil tartalmát megváltoztatná; előbb ki kell deríteni, melyik országét és miért (`select u.orszag_kod … where … is not …`).

- [ ] **Step 4: Írás a repó DB-jébe, ugyanazzal az ellenőrzéssel**

```bash
DATABASE_URL=./data/tet.db NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts --ir
sqlite3 data/tet.db "
ATTACH 'file:$SCRATCH/hu-elotte.db?immutable=1' AS regi;
select 'sorok', (select count(*) from orszagprofil), (select count(*) from regi.orszagprofil);
select 'valtozatlan', count(*) from orszagprofil u join regi.orszagprofil r on r.id = u.id
  where u.alapadatok is r.alapadatok and u.kfi_rendszer is r.kfi_rendszer and u.intezmenyek is r.intezmenyek
    and u.vallalati is r.vallalati and u.programok is r.programok and u.rendezvenyek is r.rendezvenyek
    and u.nemzetkozi_kapcsolatok is r.nemzetkozi_kapcsolatok and u.magyar_kapcsolatok is r.magyar_kapcsolatok
    and u.magyar_ertekeles is r.magyar_ertekeles;"
NODE_OPTIONS="--conditions=react-server" npx tsx "$SCRATCH/ell-hu-2-terkep.ts"
git status --short
```

Expected: `sorok|29|28`, `valtozatlan|28`, `OK – ell-hu-2-terkep | …`; a `git status --short` csak a ` M data/tet.db` sort mutatja (és a még nem commitolt taskok fájljait, ha vannak).

---

### Task 4: Dokumentáció (CLAUDE.md, README.md)

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md`

A `CLAUDE.md` bekezdései egy-egy nagyon hosszú sorból állnak: a horgonyokat `Grep`-pel keresd meg, és rövid, egyedi `old_string`-gel szerkessz.

- [ ] **Step 1: CLAUDE.md – a parancslista demó-profil sora**

Régi (a `scripts/demo-orszagprofil.ts` parancs kommentjében):

```
az attasék 27 országának 2026-os demó-profilja (kutatott vázlat
```

Új:

```
az attasék 27 országának és Magyarországnak (hazai profil, `hu.ts`) a 2026-os demó-profilja (kutatott vázlat
```

- [ ] **Step 2: CLAUDE.md – az országszótár exportjai (Auth bekezdés)**

Régi:

```
`ORSZAGOK` magyar név szerint rendezve, `orszagByKod`, `orszagNev`, `ORSZAG_KOD_RE`
```

Új:

```
`ORSZAGOK` magyar név szerint rendezve, `orszagByKod`, `orszagNev`, `ORSZAG_KOD_RE`, `HAZAI_KOD` = `HU` + `hazaiE` – a hazai ország profilja viszonyítási alap a térképen és az összehasonlításban, attaséja nincs, csak admin szerkeszti
```

- [ ] **Step 3: CLAUDE.md – a `lib/attase-orszag.ts` segédlistája (Auth bekezdés)**

Régi:

```
`attaseFelirat`, `attasekRovid`, `elsoVezetettKod`
```

Új:

```
`attaseFelirat`, `attasekRovid`, `attaseNelkulFelirat`, `elsoVezetettKod`
```

- [ ] **Step 4: CLAUDE.md – a térkép tooltipje (Térkép bekezdés)**

Keresd meg a `attasé nélkül „nincs aktív attasé` kezdetű részt (a záró idézőjel ott egyenes `"`, utána pontosvessző áll). Közvetlenül a pontosvessző **elé** szúrd be:

```
 (a hazai országnál – `hazaiE` – „hazai profil – a központ tartja karban”; ugyanezt írja a `ProfilKivonat`, a profil oldalán az `AttaseLista` „Hazai profil – a központ tartja karban.”-t; a szöveg az `attaseNelkulFelirat`-ból jön)
```

- [ ] **Step 5: README.md – a demó-adatbázis leírása**

Régi:

```
az attasék 27 országának 2026-os profiljával – kutatott vázlat,
```

Új:

```
az attasék 27 országának és Magyarországnak (hazai profil, viszonyítási alap az összehasonlításhoz) a 2026-os profiljával – kutatott vázlat,
```

- [ ] **Step 6: Ellenőrzés és commit**

```bash
grep -c "hazai profil" CLAUDE.md README.md
git add CLAUDE.md README.md
git commit -m "docs(magyar-profil): CLAUDE.md és README – hazai profil, HAZAI_KOD, attaseNelkulFelirat

Co-Authored-By: <a futó modell neve> <noreply@anthropic.com>"
```

Expected: a `grep` mindkét fájlra legalább `1`-et ad.

---

### Task 5: Build, böngészős QA, a demó DB commitja

Ezt a taskot a vezérlő végzi, a `jelentes-intezkedes` terv 6. taskjával **egy böngészős munkamenetben** (`docs/superpowers/plans/2026-10-13-jelentes-osszefoglalo-intezkedes.md`, Task 6): a két fejlesztés ugyanazt a `data/tet.db`-t írja, a DB-t egyszer commitoljuk. Eszköz: `B=~/.claude/skills/gstack/browse/dist/browse`, a felhasználó dev szerverén (`http://localhost:3000`); ha nem fut, a felhasználót kell megkérni, hogy indítsa el.

**Files:**
- Commit: `data/tet.db`

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: hibátlan.

- [ ] **Step 2: A megtett intézkedés QA-ja** a másik terv Task 6 Step 3–6 lépései szerint (a takarítás és a commit **nem** ott, hanem itt, a Step 5–6-ban történik).

- [ ] **Step 3: Magyarország a térképen (admin)**

Adminként a `/terkep` oldalon:

- Magyarország poligonja színezett; a buborékban „Magyarország”, alatta „hazai profil – a központ tartja karban”, majd a mutató értéke és helyezése, „Adott évi profil (2026)”, az első két kiemelt iparág;
- rákattintva az oldalsó kivonat fejlécében „hazai profil – a központ tartja karban”, alatta az alapadatok és az összegzés;
- Mutató: „GDP/fő” – Magyarország szerepel a rangsorban, az értéke egyezik a `hu.ts`-sel; ugyanígy „GERD”;
- Mutató: „Kitöltöttség (mentett blokk)” – Magyarország `8/9`.

- [ ] **Step 4: Összehasonlítás és profil oldal**

- Jelölj ki egy országot (pl. Ausztria), „Összehasonlítás”, majd a „+ Ország” listából Magyarország: a tábla megjelenik, Magyarország oszlopában az „Attasé” sor „–”, a számok egyeznek a fájllal.
- `/orszagprofil/HU`: a fejléc alatt „Hazai profil – a központ tartja karban.”; „8/9 blokk kitöltve”; a 6.2 kártyán „Még nincs kitöltve”; a 7. blokkban csak az összegzés.
- A „Szerkesztés” gomb adminnak megjelenik, a szerkesztő megnyílik (mentés nélkül zárd be).
- Attaséként (`javori.balazs@demo.test`): Magyarország látszik a térképen és a profil oldalán, „Szerkesztés” gomb nincs.

- [ ] **Step 5: Kijelentkezés, takarítás**

```bash
sqlite3 data/tet.db "delete from riport where targy like 'QA intézkedés teszt%'; delete from session;"
sqlite3 -readonly data/tet.db "select count(*) from riport; select count(*) from session; select count(*) from orszagprofil; select count(*) from orszagprofil where orszag_kod='HU';"
```

Expected: `0`, `0`, `29`, `1`.

A `delete from session` a felhasználó saját böngészős munkamenetét is törli a helyi dev szerveren: a záró üzenetben jelezni kell.

- [ ] **Step 6: Checkpoint, tömörítés, commit**

```bash
SCRATCH=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/85dd8b25-8254-4183-9cd5-5a43bd1bb329/scratchpad
sqlite3 data/tet.db "PRAGMA wal_checkpoint(TRUNCATE); VACUUM; PRAGMA wal_checkpoint(TRUNCATE);"
git add data/tet.db
git show :data/tet.db > "$SCRATCH/staged.db"
sqlite3 "file:$SCRATCH/staged.db?immutable=1" "PRAGMA integrity_check; select count(*) from __drizzle_migrations; select count(*) from session; select count(*) from user; select count(*) from riport; select count(*) from orszagprofil; select count(*) from pragma_table_info('riport') where name like 'intezkedes%';"
git commit -m "chore(magyar-profil): a demó DB a 0010 migrációval (intézkedés-oszlopok) és Magyarország 2026-os profiljával

Co-Authored-By: <a futó modell neve> <noreply@anthropic.com>"
git status --short
```

Expected: a `wal_checkpoint(TRUNCATE)` sorai `0|0|0`; a színpadra tett fő fájl önmagában: `ok`, `11`, `0`, `16`, `0`, `29`, `3`; a `git status --short` a commit után üres. Ha a checkpoint első száma nem `0`, ismételd meg, és ne commitolj, amíg a fő fájl nem a végleges állapotot mutatja.

---

### Task 6: Lezárás

- [ ] **Step 1: Záró review** a `jelentes-intezkedes..magyar-profil` tartományra, a talált hibák javítása.
- [ ] **Step 2: A két spec „Állapot” sora** „megvalósítva”-ra; eltérésnél „Megvalósítási eltérések” szakasz. Külön `docs(…)` commit.
- [ ] **Step 3: Az ágak lezárása** a `superpowers:finishing-a-development-branch` szerint. A `magyar-profil` tartalmazza a `jelentes-intezkedes` minden commitját; a futó dev szerver miatt a merge a munkafa cseréje nélkül történjen (fast-forward: `git fetch . magyar-profil:main`, majd `git checkout main`). Push előtt a felhasználót emlékeztetni kell a memóriában rögzített hosting-figyelmeztetésre (a push a demó DB-t is publikálja, és az első build a hosting-DB-t lecseréli).
