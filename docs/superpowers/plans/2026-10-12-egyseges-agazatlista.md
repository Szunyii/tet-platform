# Országprofil: egységes ágazatlista – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Az országprofil három ágazat-mezője (Alapadatok „Legfontosabb gazdasági ágazatok”, KFI „Kiemelt iparágak”, vállalati „Kiemelt ágazatok”) ugyanabból a 21 elemű listából legyen választható, a már mentett értékek elvesztése nélkül.

**Architecture:** A `lib/orszagprofil-szotar.ts` két listája (`GAZDASAGI_AGAZATOK`, `IPARAGAK`) helyére egyetlen `AGAZATOK` kerül, 21 színnel (`AGAZAT_SZINEK`). A kilenc régi nevet a `REGI_AGAZAT_NEVEK` tábla képezi az új névre; ezt az `agazatLista()` segéd alkalmazza a profil-olvasó normalizálóban és az űrlap-validátorban, ezért sem DB-migráció, sem hosting-DB-csere nem kell. A 27 demó országfájl gépi átírást kap, a demó DB a futtatóval újragenerálódik.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 7, Drizzle + better-sqlite3, shadcn/ui v4 (Base UI Combobox/Select), tsx az eldobható scriptekhez.

**Spec:** `docs/superpowers/specs/2026-10-12-egyseges-agazatlista-design.md`.

**Végrehajtási megjegyzések** (a terv a végleges, működő parancsokat és kódblokkokat mutatja):

- **Task 1.** A minőségi review nyomán külön commitban (`5ec7d62`) bekerült a régi nevek foglaltságának fordítási idejű őre, a Turizmus és az Építőipar új színe (kontraszt a jelvény saját hátterén) és két komment; a kódblokkok és a várt értékek már ezt mutatják. Részletek a spec „Megvalósítási eltérések” szakaszában.
- **Task 3, `mentes-qa.js`.** Az eredeti script egyik kommentjében páratlan ASCII idézőjel állt; a gstack `eval` burkolója ettől nem ismerte fel egyetlen kifejezésnek az aszinkron IIFE-t, és üres kimenettel tért vissza, miközben a script a lapon lefutott (a mentés megtörtént). A toastot a végrehajtáskor külön script igazolta. Az alábbi változatban a komment javítva van: **aszinkron QA-script kommentjébe ne kerüljön ASCII idézőjel.**
- **Task 3, a DB-másolat olvasása.** A `git show`-val kimentett, WAL módú másolat mellett nincs `-shm` fájl, ezért a `sqlite3 -readonly "$T/regi.db"` „unable to open database file” hibát ad; a parancsok `file:…?immutable=1` alakot használnak.

**Ellenőrzés:** Nincs tesztkeretrendszer. A „teszt” három dolog: (1) eldobható assert-script a tiszta logikára (`scripts/_agazat-proba.ts`), (2) a demó-profil futtató szigorú ellenőrzése és a DB-dumpok összevetése, (3) gstack böngészős QA-scriptek. Mindegyik előbb a régi állapoton bukik, utána zöld. Minden task végén `npx tsc --noEmit`.

**Környezet:**

- Ág: `egyseges-agazatlista` (a spec már rajta van). A `main`-re ne válts.
- A felhasználó TéT dev szervere fut a `http://localhost:3000`-en (`next dev`, HMR), ezen ellenőrzünk. **Nem szabad leállítani vagy újraindítani**, és saját dev szervert sem indítunk. Ha nem fut, szólj a controllernek.
- A `data/tet.db` a repóban van, és a dev szerver ezt használja. A gstack-belépés session-sort ír bele, a mentés-próba profilt módosít. **A 3. task 8. lépéséig soha ne commitold**: `git add` mindig konkrét fájlokkal, soha `-A` vagy `.`.
- Seed admin: `admin@niu.hu`, jelszava a `.env.local` `SEED_ADMIN_PASSWORD`-je. Olvasd ki, de ne írd ki. A jelszó kitöltése után **tilos a `snapshot`** (kiírná a mező értékét).
- Az eldobható scriptek (`scripts/_agazat-proba.ts`, `scripts/_agazat-dump.ts`) nem kerülnek commitba; a 3. task törli őket. Típushelyesnek kell lenniük, mert a `tsconfig.json` a `scripts/`-et is bevonja.
- DB-t olvasó tsx script: `NODE_OPTIONS="--conditions=react-server" npx tsx …` (a `server-only` guard miatt). A `TMPDIR`-t ne állítsd át.
- A shell-változók a Bash-hívások között nem maradnak meg: minden kódblokk maga állítja be az `S`, `B`, `T` változót.
- Commit üzenetek magyarul, `feat|chore|docs(egyseges-agazatlista): …`, a végén üres sor után: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Reviewer subagent: csak olvasó git (tilos a checkout, a reset és a stash).

**Közös változók** (minden kódblokk elején ismételve, ahol kell):

```bash
S=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/cbfef716-4aa5-40a4-8034-5184ced8af85/scratchpad
B=~/.claude/skills/gstack/browse/dist/browse
T="$S/db"
```

**gstack bejelentkezés** (ha a `$B url` a `/login`-ra mutat, vagy egy QA-script „be vagy jelentkezve” üzenetet ad):

```bash
B=~/.claude/skills/gstack/browse/dist/browse
$B goto 'http://localhost:3000/login?next=%2Fterkep' >/dev/null && $B wait --networkidle >/dev/null
$B fill '#email' admin@niu.hu >/dev/null
$B fill '#password' "$(sed -n 's/^SEED_ADMIN_PASSWORD=//p' .env.local)" >/dev/null 2>&1
$B click 'button[type=submit]' >/dev/null
$B wait '[data-pinek] circle[data-pin]'; $B url
```

A `wait` „Selector matched multiple elements” üzenete itt sikert jelent: megvannak a pinek. A `url` értéke `http://localhost:3000/terkep`. A `wait --networkidle` a kitöltés előtt kell: hidratálás előtti kattintásnál a form natívan küldődik be, és a belépés elmarad.

---

## Fájlok

| Fájl | Művelet | Mi változik | Task |
| --- | --- | --- | --- |
| `lib/orszagprofil-szotar.ts` | módosít | `AGAZATOK`, `Agazat`, `AGAZAT_SZINEK`, `REGI_AGAZAT_NEVEK`, `agazatLista`; a két régi lista és a `IPARAG_SZINEK` törlése; a három mező típusa és normalizálója | 1 |
| `lib/orszagprofil-validacio.ts` | módosít | a három mező `agazatLista`-val | 1 |
| `lib/terkep-mutatok.ts` | módosít | az `iparag` mutató `AGAZATOK`/`AGAZAT_SZINEK`-ből | 1 |
| `db/queries/orszagprofil.ts` | módosít | `TerkepOrszag.iparagak: Agazat[]` | 1 |
| `app/(app)/orszagprofil/components/mezok/AlapadatokMezok.tsx` | módosít | `items={AGAZATOK}` | 1 |
| `app/(app)/orszagprofil/components/mezok/KfiRendszerMezok.tsx` | módosít | `items={AGAZATOK}` | 1 |
| `app/(app)/orszagprofil/components/mezok/VallalatiMezok.tsx` | módosít | `items={AGAZATOK}` | 1 |
| `app/(app)/terkep/components/TerkepNezet.tsx` | módosít | az iparág-szűrő `AGAZATOK`-ból | 1 |
| `components/orszagprofil/IparagBadge.tsx` → `AgazatBadge.tsx` | átnevez + módosít | `AgazatBadge`, `agazat` prop, `AGAZAT_SZINEK` | 1 |
| `components/orszagprofil/BlokkNezet.tsx` | módosít | `Agazatok` segéd mindhárom mezőnél | 1 |
| `app/(app)/terkep/components/ProfilKivonat.tsx` | módosít | `AgazatBadge` | 1 |
| `app/(app)/terkep/components/OsszehasonlitasPanel.tsx` | módosít | `AgazatBadge` | 1 |
| `scripts/demo-orszagprofil.ts` | módosít | a `LISTAK` három mezője `AGAZATOK` | 1 |
| `scripts/demo-orszagprofil/orszagok/*.ts` (26 fájl; az `mv.ts` nem változik) | módosít | 122 listaelem átnevezése | 2 |
| `data/tet.db` | módosít + commit | újragenerálva a futtatóval, sessionök nélkül | 3 |
| `CLAUDE.md` | módosít | Országprofil bekezdés: lista, megfeleltetés, jelvény | 3 |
| `scripts/_agazat-proba.ts`, `scripts/_agazat-dump.ts` | létrehoz, a végén töröl | eldobható ellenőrző scriptek, nem commitoljuk | 1, 3 |

---

## Segédscriptek a controller scratchpadjében

A QA-scriptek és az átnevező script a `$S` mappában vannak (a terv írásakor a mostani kódon kipróbálva). Futtatás: `$B eval "$S/<név>.js"`. **Ha valamelyik hiányzik, hozd létre az alábbi tartalommal.** Az `eval` előtt mindig friss oldalbetöltés kell (`$B goto …`): egy nyitva maradt legördülő a következő futást üres kimenettel zavarja meg.

`$S/szerkeszto-qa.js` – a szerkesztő három legördülőjének elemei és a kiválasztott chipek:

```js
(async () => {
  try {
    const varj = (ms) => new Promise((r) => setTimeout(r, ms));
    const MEZOK = ['alapadatok.agazatok', 'kfiRendszer.kiemeltIparagak', 'vallalati.kiemeltAgazatok'];
    const bill = (key) => new KeyboardEvent('keydown', { key, code: key, bubbles: true, cancelable: true });
    const listak = [];
    const chipek = {};
    for (const id of MEZOK) {
      const input = document.getElementById(id);
      if (!input) return `NINCS MEZŐ: ${id} – be vagy jelentkezve, és a /orszagprofil/DE/szerkesztes oldalon állsz?`;
      input.scrollIntoView({ block: 'center' });
      input.focus();
      input.dispatchEvent(bill('ArrowDown'));
      await varj(400);
      listak.push([...document.querySelectorAll('[data-slot="combobox-item"]')].map((e) => e.textContent.trim()));
      chipek[id] = [...document.getElementById(`${id}-doboz`).querySelectorAll('[data-slot="combobox-chip"]')].map((e) => e.textContent.trim()).join(' | ');
      input.dispatchEvent(bill('Escape'));
      await varj(300);
    }
    return JSON.stringify({
      db: listak.map((l) => l.length),
      azonos: listak.every((l) => l.join('|') === listak[0].join('|')),
      elemek: listak[0],
      chipek,
    }, null, 1);
  } catch (e) {
    return `HIBA: ${e && e.message}`;
  }
})()
```

`$S/nezet-qa.js` – az olvasó nézet három ágazat-sorának jelvényei (név és inline betűszín):

```js
(() => {
  // Az olvasó nézet három ágazat-sora: a címke (dt) alapján a mellette álló dd jelvényei és az „egyéb" szöveg.
  const CIMKEK = ['Legfontosabb gazdasági ágazatok', 'Kiemelt iparágak', 'Kiemelt ágazatok'];
  const ki = {};
  for (const dt of document.querySelectorAll('dt')) {
    const cimke = dt.textContent.trim();
    if (!CIMKEK.includes(cimke)) continue;
    const dd = dt.nextElementSibling;
    const jelvenyek = [...dd.querySelectorAll('[data-slot="badge"]')].map((b) => ({
      nev: b.textContent.trim(),
      // Színes jelvény: inline betűszín a szótárból; a szürke (secondary) jelvénynek nincs inline színe.
      szin: b.style.color || null,
    }));
    ki[cimke] = { db: jelvenyek.length, szines: jelvenyek.filter((j) => j.szin).length, jelvenyek };
  }
  return JSON.stringify(ki, null, 1);
})()
```

`$S/terkep-qa.js` – a térkép jelmagyarázata, a pinek színe és az iparág-szűrő elemei:

```js
(async () => {
  try {
    const varj = (ms) => new Promise((r) => setTimeout(r, ms));
    const jel = document.querySelector('[role="group"][aria-label="Jelmagyarázat"]');
    const jelmagyarazat = jel ? [...jel.children].map((s) => s.textContent.trim()) : 'NINCS JELMAGYARÁZAT';
    // A pinek kitöltési színe DOM-sorrendben (a lekérdezés sorrendje, azonos DB-tartalomra állandó).
    const pinek = [...document.querySelectorAll('[data-pinek] circle[data-pin]')].map((c) => c.getAttribute('fill'));
    // Az iparág-szűrő opciói: a trigger megnyitása után a felugró lista elemei.
    const trigger = document.getElementById('iparag-szuro');
    if (!trigger) return 'NINCS SZŰRŐ – be vagy jelentkezve, és a /terkep oldalon állsz?';
    trigger.focus();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true, cancelable: true }));
    await varj(400);
    const szuro = [...document.querySelectorAll('[data-slot="select-item"]')].map((e) => e.textContent.trim());
    document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }));
    await varj(300);
    return JSON.stringify({ jelmagyarazat, pinDb: pinek.length, pinSzinek: pinek.join(' '), szuroDb: szuro.length, szuro }, null, 1);
  } catch (e) {
    return `HIBA: ${e && e.message}`;
  }
})()
```

`$S/szuro-qa.js` – a „Turizmus” kiválasztása az iparág-szűrőben (egy ország sem felel meg rá):

```js
(async () => {
  try {
    const varj = (ms) => new Promise((r) => setTimeout(r, ms));
    const NEV = 'Turizmus';
    const trigger = document.getElementById('iparag-szuro');
    if (!trigger) return 'NINCS SZŰRŐ – be vagy jelentkezve, és a /terkep oldalon állsz?';
    trigger.focus();
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true, cancelable: true }));
    await varj(400);
    const elem = [...document.querySelectorAll('[data-slot="select-item"]')].find((e) => e.textContent.trim() === NEV);
    if (!elem) return `NINCS ILYEN ELEM A SZŰRŐBEN: ${NEV}`;
    elem.click();
    await varj(500);
    const jel = document.querySelector('[role="group"][aria-label="Jelmagyarázat"]');
    return JSON.stringify({
      szuro: trigger.textContent.trim(),
      uresAllapot: document.body.textContent.includes('Egy ország sem felel meg a szűrőnek.'),
      jelmagyarazat: jel ? [...jel.children].map((s) => s.textContent.trim()) : null,
    });
  } catch (e) {
    return `HIBA: ${e && e.message}`;
  }
})()
```

`$S/mentes-qa.js` – a „Turizmus” bejelölése Németország vállalati blokkjában, és a blokk mentése:

```js
(async () => {
  try {
    const varj = (ms) => new Promise((r) => setTimeout(r, ms));
    const ID = 'vallalati.kiemeltAgazatok';
    const NEV = 'Turizmus';
    const bill = (key) => new KeyboardEvent('keydown', { key, code: key, bubbles: true, cancelable: true });
    const input = document.getElementById(ID);
    if (!input) return 'NINCS MEZŐ – be vagy jelentkezve, és a /orszagprofil/DE/szerkesztes oldalon állsz?';
    const chipek = () => [...document.getElementById(`${ID}-doboz`).querySelectorAll('[data-slot="combobox-chip"]')].map((e) => e.textContent.trim());
    if (chipek().includes(NEV)) return `MÁR BE VAN JELÖLVE: ${NEV}`;
    input.scrollIntoView({ block: 'center' });
    input.focus();
    input.dispatchEvent(bill('ArrowDown'));
    await varj(400);
    const elem = [...document.querySelectorAll('[data-slot="combobox-item"]')].find((e) => e.textContent.trim() === NEV);
    if (!elem) return `NINCS ILYEN ELEM A LISTÁBAN: ${NEV}`;
    elem.click();
    await varj(300);
    input.dispatchEvent(bill('Escape'));
    await varj(300);
    const form = input.closest('form');
    form.querySelector('button[type="submit"]').click();
    // A mentés visszajelzése a Blokk mentve toast; legfeljebb 5 másodpercig várunk rá.
    let toast = '';
    for (let i = 0; i < 25 && !toast; i++) {
      await varj(200);
      toast = [...document.querySelectorAll('[data-sonner-toast]')].map((t) => t.textContent.trim()).join(' | ');
    }
    const hibak = [...form.querySelectorAll('[role="alert"]')].map((e) => e.textContent.trim()).filter(Boolean);
    return JSON.stringify({ chipek: chipek(), toast, hibak });
  } catch (e) {
    return `HIBA: ${e && e.message}`;
  }
})()
```

`$S/_agazat-atnevezes.mjs` – a 27 országfájl három listájának átírása (a 2. task futtatja):

```js
// Eldobható: a 27 országfájl három ágazat-listájában a kilenc régi nevet a közös lista nevére írja át.
// Csak az `agazatok`, `kiemeltIparagak`, `kiemeltAgazatok` tömbökhöz nyúl; előbb mindent kiszámol és
// a spec táblázatához méri, és csak egyezésnél ír. Futtatás: node scripts/_agazat-atnevezes.mjs [mappa]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const MAPPA = resolve(process.argv[2] ?? 'scripts/demo-orszagprofil/orszagok');
const REGI = {
  'Autóipar': 'Mobilitás és autóipar',
  'Gyógyszeripar': 'Biotechnológia és gyógyszeripar',
  'Energetika': 'Energetika és fenntarthatóság',
  'Mezőgazdaság és élelmiszeripar': 'Agrár- és élelmiszeripar',
  'IKT és szoftver': 'IKT és digitalizáció',
  'Kreatív ipar': 'Kreatív ipar és média',
  'Félvezetők és mikroelektronika': 'Elektronika és félvezetők',
  'Agrár- és élelmiszertechnológia': 'Agrár- és élelmiszeripar',
  'Védelmi technológia': 'Védelmi ipar',
};
// A spec „Adat" táblázata: mező → régi név → ennyi országban szerepel.
const VART = {
  agazatok: {
    'Mezőgazdaság és élelmiszeripar': 17, 'Energetika': 14, 'IKT és szoftver': 13, 'Autóipar': 12, 'Gyógyszeripar': 12, 'Kreatív ipar': 2,
  },
  kiemeltIparagak: { 'Agrár- és élelmiszertechnológia': 15, 'Félvezetők és mikroelektronika': 11, 'Védelmi technológia': 4 },
  kiemeltAgazatok: { 'Félvezetők és mikroelektronika': 9, 'Agrár- és élelmiszertechnológia': 7, 'Védelmi technológia': 6 },
};
/** Egysoros lista legnagyobb hossza; efölött többsoros. A többsoros lista sorai legfeljebb ilyen hosszúak. */
const EGYSOROS_MAX = 150;
const SOR_MAX = 140;
// A teljes lista a behúzással és a záró vesszővel; a tömbben csak idézőjeles nevek vannak, `]` nincs bennük.
const LISTA = /^( +)(agazatok|kiemeltIparagak|kiemeltAgazatok): \[([^\]]*)\],$/gm;

const szamlalo = { agazatok: {}, kiemeltIparagak: {}, kiemeltAgazatok: {} };
const irando = [];
for (const fajl of readdirSync(MAPPA).filter((f) => /^[a-z]{2}\.ts$/.test(f)).sort()) {
  const ut = join(MAPPA, fajl);
  const regi = readFileSync(ut, 'utf8');
  const uj = regi.replace(LISTA, (teljes, behuzas, mezo, torzs) => {
    const elemek = torzs.match(/'[^']*'/g) ?? [];
    // A tömbben az idézőjeles neveken, vesszőkön és térközön kívül semmi nem lehet.
    if (torzs.replace(/'[^']*'/g, '').replace(/[\s,]/g, '') !== '') throw new Error(`${fajl}: ${mezo}: váratlan tartalom a listában`);
    let valtozott = false;
    const ujElemek = elemek.map((e) => {
      const nev = e.slice(1, -1);
      if (!Object.hasOwn(REGI, nev)) return e;
      valtozott = true;
      szamlalo[mezo][nev] = (szamlalo[mezo][nev] ?? 0) + 1;
      return `'${REGI[nev]}'`;
    });
    if (!valtozott) return teljes;
    if (new Set(ujElemek).size !== ujElemek.length) throw new Error(`${fajl}: ${mezo}: az átírás után kétszer szerepel egy elem`);
    const egysoros = `${behuzas}${mezo}: [${ujElemek.join(', ')}],`;
    if (egysoros.length <= EGYSOROS_MAX) return egysoros;
    // Többsoros: az elemek sorba töltve, soronként záró vesszővel (a fájlok meglévő stílusa).
    const sorok = [];
    let sor = '';
    for (const e of ujElemek) {
      const jelolt = sor ? `${sor} ${e},` : `${behuzas}  ${e},`;
      if (sor && jelolt.length > SOR_MAX) {
        sorok.push(sor);
        sor = `${behuzas}  ${e},`;
      } else {
        sor = jelolt;
      }
    }
    sorok.push(sor);
    return `${behuzas}${mezo}: [\n${sorok.join('\n')}\n${behuzas}],`;
  });
  if (uj !== regi) irando.push([ut, uj]);
}

const kapott = JSON.stringify(szamlalo, Object.keys(szamlalo).flatMap((m) => [m, ...Object.keys(VART[m]).sort()]));
const elvart = JSON.stringify(VART, Object.keys(VART).flatMap((m) => [m, ...Object.keys(VART[m]).sort()]));
const ossz = Object.values(szamlalo).flatMap((m) => Object.values(m)).reduce((a, b) => a + b, 0);
for (const [mezo, nevek] of Object.entries(szamlalo)) for (const [nev, db] of Object.entries(nevek)) console.log(`${mezo}: ${nev} → ${REGI[nev]}: ${db}`);
if (kapott !== elvart) {
  console.error(`ELTÉRÉS a spec táblázatától, nem írtam.\n  várt:   ${elvart}\n  kapott: ${kapott}`);
  process.exit(1);
}
for (const [ut, tartalom] of irando) writeFileSync(ut, tartalom);
console.log(`${ossz} listaelem átírva ${irando.length} fájlban.`);
```

**A mostani (átírás előtti) kódon mért kiinduló értékek**, amelyekhez a QA viszonyít:

- `szerkeszto-qa.js` (Németország szerkesztője): `db: [15, 14, 14]`, `azonos: false`.
- `nezet-qa.js` (Németország): „Legfontosabb gazdasági ágazatok” `db: 6, szines: 0`.
- `terkep-qa.js`: `szuroDb: 15`, `pinDb: 27`, és a pinek színe (ennek **nem szabad változnia**):

```
#2f7d32 #1f4e9c #2f7d32 #b45309 #8a6d1f #8a6d1f #0f7a68 #334155 #2f7d32 #2563eb #0f7a68 #2563eb #b45309 #1f4e9c #0e7490 #b45309 #5f6b7a #5f6b7a #2f7d32 #2f7d32 #9a3412 #2f7d32 #2f7d32 #0f7a68 #8a6d1f #2f7d32 #2563eb
```

---

### Task 1: Közös lista, megfeleltetés és a fogyasztók átállítása

**Files:**
- Create (nem commitoljuk): `scripts/_agazat-proba.ts`
- Modify: `lib/orszagprofil-szotar.ts`
- Modify: `lib/orszagprofil-validacio.ts`
- Modify: `lib/terkep-mutatok.ts`
- Modify: `db/queries/orszagprofil.ts`
- Modify: `app/(app)/orszagprofil/components/mezok/AlapadatokMezok.tsx`, `KfiRendszerMezok.tsx`, `VallalatiMezok.tsx`
- Modify: `app/(app)/terkep/components/TerkepNezet.tsx`, `ProfilKivonat.tsx`, `OsszehasonlitasPanel.tsx`
- Rename + modify: `components/orszagprofil/IparagBadge.tsx` → `components/orszagprofil/AgazatBadge.tsx`
- Modify: `components/orszagprofil/BlokkNezet.tsx`
- Modify: `scripts/demo-orszagprofil.ts`

A két régi lista törlése minden fogyasztót egyszerre érint, ezért a task egyben állítja át őket: a végén a `tsc` zöld.

- [ ] **Step 1: Írd meg a bukó assert-scriptet**

Hozd létre a `scripts/_agazat-proba.ts` fájlt:

```ts
/** Eldobható: a közös ágazatlista és a régi nevek megfeleltetésének ellenőrzése (nem commitoljuk). */
import assert from 'node:assert/strict';
import {
  AGAZATOK, AGAZAT_SZINEK, REGI_AGAZAT_NEVEK, agazatLista, normalizalBlokk, uresBlokk,
} from '../lib/orszagprofil-szotar';
import { validalBlokk } from '../lib/orszagprofil-validacio';

const LISTA: readonly string[] = AGAZATOK;

// 1. A lista: 21 egyedi elem, mindegyiknek egyedi, hat jegyű hex színe van.
assert.equal(AGAZATOK.length, 21);
assert.equal(new Set(LISTA).size, 21);
assert.deepEqual(Object.keys(AGAZAT_SZINEK).sort(), [...LISTA].sort());
assert.equal(new Set(Object.values(AGAZAT_SZINEK)).size, 21);
for (const szin of Object.values(AGAZAT_SZINEK)) assert.match(szin, /^#[0-9a-f]{6}$/);

// 1b. A sorrend és a színek pontosan a spec táblázata szerint.
const SPEC: [string, string][] = [
  ['Mesterséges intelligencia és adatgazdaság', '#1f4e9c'], ['IKT és digitalizáció', '#2563eb'],
  ['Elektronika és félvezetők', '#b45309'], ['Kvantumtechnológia', '#6b46c1'],
  ['Biotechnológia és gyógyszeripar', '#0f7a68'], ['Digitális egészségügy', '#a8326f'],
  ['Energetika és fenntarthatóság', '#2f7d32'], ['Hidrogén és akkumulátor', '#0e7490'], ['Űripar', '#334155'],
  ['Mobilitás és autóipar', '#9a3412'], ['Gépipar', '#4338ca'], ['Vegyipar', '#a21caf'], ['Anyagtudomány', '#525c6b'],
  ['Agrár- és élelmiszeripar', '#8a6d1f'], ['Bányászat és nyersanyagok', '#6b3f1d'], ['Védelmi ipar', '#7f1d1d'],
  ['Kreatív ipar és média', '#be185d'], ['Pénzügyi szolgáltatások', '#4d7c0f'], ['Turizmus', '#d11541'],
  ['Logisztika', '#0369a1'], ['Építőipar', '#736a5f'],
];
assert.deepEqual([...LISTA], SPEC.map(([nev]) => nev));
assert.deepEqual(Object.entries(AGAZAT_SZINEK), SPEC);

// 2. A megfeleltetés: kilenc régi név, mind létező közös névre; régi név nincs a közös listában.
const REGI: [string, string][] = [
  ['Autóipar', 'Mobilitás és autóipar'],
  ['Gyógyszeripar', 'Biotechnológia és gyógyszeripar'],
  ['Energetika', 'Energetika és fenntarthatóság'],
  ['Mezőgazdaság és élelmiszeripar', 'Agrár- és élelmiszeripar'],
  ['IKT és szoftver', 'IKT és digitalizáció'],
  ['Kreatív ipar', 'Kreatív ipar és média'],
  ['Félvezetők és mikroelektronika', 'Elektronika és félvezetők'],
  ['Agrár- és élelmiszertechnológia', 'Agrár- és élelmiszeripar'],
  ['Védelmi technológia', 'Védelmi ipar'],
];
assert.equal(REGI_AGAZAT_NEVEK.size, 9);
for (const [regi, uj] of REGI) {
  assert.equal(REGI_AGAZAT_NEVEK.get(regi), uj, regi);
  assert.ok(LISTA.includes(uj), uj);
  assert.ok(!LISTA.includes(regi), regi);
  assert.deepEqual(agazatLista([regi]), [uj]);
}

// 3. A régi 14 iparág színe megmarad (az átnevezett a régi nevének színét viszi): a térkép színei nem változnak.
const REGI_SZINEK: [string, string][] = [
  ['Mesterséges intelligencia és adatgazdaság', '#1f4e9c'], ['Félvezetők és mikroelektronika', '#b45309'],
  ['Kvantumtechnológia', '#6b46c1'], ['Biotechnológia és gyógyszeripar', '#0f7a68'], ['Digitális egészségügy', '#a8326f'],
  ['Energetika és fenntarthatóság', '#2f7d32'], ['Hidrogén és akkumulátor', '#0e7490'], ['Űripar', '#334155'],
  ['Mobilitás és autóipar', '#9a3412'], ['Agrár- és élelmiszertechnológia', '#8a6d1f'], ['Anyagtudomány', '#525c6b'],
  ['IKT és digitalizáció', '#2563eb'], ['Védelmi technológia', '#7f1d1d'], ['Kreatív ipar és média', '#be185d'],
];
for (const [regi, szin] of REGI_SZINEK) {
  const lista = agazatLista([regi]);
  assert.equal(lista.length, 1, regi);
  assert.equal(AGAZAT_SZINEK[lista[0]], szin, regi);
}
// A régi 15 gazdasági ágazat mind leképződik (egyik sem vész el).
const REGI_GAZDASAGI = [
  'Autóipar', 'Gépipar', 'Elektronika és félvezetők', 'Gyógyszeripar', 'Vegyipar', 'Energetika',
  'Bányászat és nyersanyagok', 'Mezőgazdaság és élelmiszeripar', 'IKT és szoftver',
  'Pénzügyi szolgáltatások', 'Turizmus', 'Logisztika', 'Építőipar', 'Védelmi ipar', 'Kreatív ipar',
];
for (const regi of REGI_GAZDASAGI) assert.equal(agazatLista([regi]).length, 1, regi);

// 4. agazatLista: sorrend, dupla, ismeretlen, nem szöveg, prototípus-kulcs, nem tömb.
assert.deepEqual(agazatLista(['Űripar', 'Autóipar', 'Gépipar']), ['Űripar', 'Mobilitás és autóipar', 'Gépipar']);
assert.deepEqual(agazatLista(['Autóipar', 'Mobilitás és autóipar']), ['Mobilitás és autóipar']);
assert.deepEqual(
  agazatLista(['Mezőgazdaság és élelmiszeripar', 'Űripar', 'Agrár- és élelmiszertechnológia']),
  ['Agrár- és élelmiszeripar', 'Űripar'],
);
assert.deepEqual(agazatLista(['Nincs ilyen', 'constructor', '__proto__', 'toString', 42, null, {}, 'Turizmus']), ['Turizmus']);
assert.deepEqual(agazatLista('Turizmus'), []);
assert.deepEqual(agazatLista(undefined), []);
assert.deepEqual(agazatLista(null), []);

// 5. A normalizáló mindhárom mezőnél megfeleltet (a DB-ből olvasott régi JSON), és a közös lista
//    bármely elemét elfogadja bármelyik mezőben.
assert.deepEqual(
  normalizalBlokk('alapadatok', { agazatok: ['Autóipar', 'Turizmus', 'Energetika'] }).agazatok,
  ['Mobilitás és autóipar', 'Turizmus', 'Energetika és fenntarthatóság'],
);
assert.deepEqual(
  normalizalBlokk('kfiRendszer', { kiemeltIparagak: ['Félvezetők és mikroelektronika', 'Űripar'] }).kiemeltIparagak,
  ['Elektronika és félvezetők', 'Űripar'],
);
assert.deepEqual(
  normalizalBlokk('vallalati', { kiemeltAgazatok: ['Védelmi technológia', 'Agrár- és élelmiszertechnológia'] }).kiemeltAgazatok,
  ['Védelmi ipar', 'Agrár- és élelmiszeripar'],
);
assert.deepEqual(normalizalBlokk('alapadatok', { agazatok: ['Kvantumtechnológia'] }).agazatok, ['Kvantumtechnológia']);
assert.deepEqual(normalizalBlokk('kfiRendszer', { kiemeltIparagak: ['Turizmus'] }).kiemeltIparagak, ['Turizmus']);
assert.deepEqual(
  normalizalBlokk('vallalati', { kiemeltAgazatok: ['Bányászat és nyersanyagok'] }).kiemeltAgazatok,
  ['Bányászat és nyersanyagok'],
);
assert.deepEqual(uresBlokk('alapadatok').agazatok, []);

// 6. A validátor is megfeleltet (a telepítés előtt megnyitott szerkesztő régi neveket küld).
function urlap(mezo: string, ertekek: string[]): FormData {
  const fd = new FormData();
  for (const e of ertekek) fd.append(mezo, e);
  return fd;
}
const a = validalBlokk('alapadatok', urlap('agazatok', ['Autóipar', 'Kvantumtechnológia', 'Nincs ilyen']), 2026);
if (!a.ok) throw new Error(`alapadatok: ${JSON.stringify(a.errors)}`);
assert.deepEqual(a.ertek.agazatok, ['Mobilitás és autóipar', 'Kvantumtechnológia']);
const k = validalBlokk('kfiRendszer', urlap('kiemeltIparagak', ['Félvezetők és mikroelektronika', 'Turizmus']), 2026);
if (!k.ok) throw new Error(`kfiRendszer: ${JSON.stringify(k.errors)}`);
assert.deepEqual(k.ertek.kiemeltIparagak, ['Elektronika és félvezetők', 'Turizmus']);
const v = validalBlokk('vallalati', urlap('kiemeltAgazatok', ['Védelmi technológia', 'Védelmi ipar', 'Gépipar']), 2026);
if (!v.ok) throw new Error(`vallalati: ${JSON.stringify(v.errors)}`);
assert.deepEqual(v.ertek.kiemeltAgazatok, ['Védelmi ipar', 'Gépipar']);

console.log('Rendben: közös ágazatlista és megfeleltetés.');
```

- [ ] **Step 2: Futtasd, és nézd meg, hogy bukik**

```bash
npx tsx scripts/_agazat-proba.ts; echo "exit=$?"
```

Várt: hibával leáll (`exit=1`), mert a `lib/orszagprofil-szotar.ts` még nem exportálja az `AGAZATOK`-ot (TypeError vagy „does not provide an export named”). A „Rendben” sor nem jelenik meg.

- [ ] **Step 3: A szótár – a két lista helyére a közös lista, a színek és a megfeleltetés**

A `lib/orszagprofil-szotar.ts`-ben cseréld le a `GAZDASAGI_AGAZATOK` definíciójától az `IPARAG_SZINEK` záró `};` soráig tartó részt (ma a 13–52. sor; benne a `KFI_PRIORITASOK` is, az változatlan marad) erre:

```ts
export const KFI_PRIORITASOK = [
  'Digitalizáció és MI', 'Zöld átállás és klímasemlegesség', 'Egészség és élettudomány',
  'Ipar 4.0 és gyártás', 'Energiabiztonság', 'Űr', 'Védelem és biztonság', 'Alapkutatási kiválóság',
  'Tehetség és mobilitás', 'Startup és vállalkozói ökoszisztéma', 'Technológiai szuverenitás',
  'Regionális felzárkózás',
] as const;
export type KfiPrioritas = (typeof KFI_PRIORITASOK)[number];

/**
 * Ágazatok: az Alapadatok „Legfontosabb gazdasági ágazatok", a KFI-blokk „Kiemelt iparágak" és a
 * vállalati blokk „Kiemelt ágazatok" mezőjének közös listája. Az első kiemelt iparág adja a térkép színét.
 * Elemet átnevezni csak a `REGI_NEVEK` bővítésével szabad (régi név → új név): a listából kikerült
 * név tárolt értéke olvasáskor kiesik, és a blokk következő mentésekor végleg elvész. Ezt a típus
 * nem tudja jelezni.
 */
export const AGAZATOK = [
  'Mesterséges intelligencia és adatgazdaság', 'IKT és digitalizáció', 'Elektronika és félvezetők',
  'Kvantumtechnológia', 'Biotechnológia és gyógyszeripar', 'Digitális egészségügy',
  'Energetika és fenntarthatóság', 'Hidrogén és akkumulátor', 'Űripar', 'Mobilitás és autóipar',
  'Gépipar', 'Vegyipar', 'Anyagtudomány', 'Agrár- és élelmiszeripar', 'Bányászat és nyersanyagok',
  'Védelmi ipar', 'Kreatív ipar és média', 'Pénzügyi szolgáltatások', 'Turizmus', 'Logisztika', 'Építőipar',
] as const;
export type Agazat = (typeof AGAZATOK)[number];

export const AGAZAT_SZINEK: Record<Agazat, string> = {
  'Mesterséges intelligencia és adatgazdaság': '#1f4e9c',
  'IKT és digitalizáció': '#2563eb',
  'Elektronika és félvezetők': '#b45309',
  'Kvantumtechnológia': '#6b46c1',
  'Biotechnológia és gyógyszeripar': '#0f7a68',
  'Digitális egészségügy': '#a8326f',
  'Energetika és fenntarthatóság': '#2f7d32',
  'Hidrogén és akkumulátor': '#0e7490',
  'Űripar': '#334155',
  'Mobilitás és autóipar': '#9a3412',
  'Gépipar': '#4338ca',
  'Vegyipar': '#a21caf',
  'Anyagtudomány': '#525c6b',
  'Agrár- és élelmiszeripar': '#8a6d1f',
  'Bányászat és nyersanyagok': '#6b3f1d',
  'Védelmi ipar': '#7f1d1d',
  'Kreatív ipar és média': '#be185d',
  'Pénzügyi szolgáltatások': '#4d7c0f',
  'Turizmus': '#d11541',
  'Logisztika': '#0369a1',
  'Építőipar': '#736a5f',
};

/**
 * A 2026-10-12 előtti két lista (gazdasági ágazatok, iparágak) nevei → a közös lista neve. A két
 * régi listának nem volt közös neve, ezért a tábla mezőtől független. Tartósan marad: a régi
 * nevet tároló DB (hosting, visszaállított mentés) így migráció nélkül is helyesen olvasódik.
 * Ezek a nevek foglaltak: az `AGAZATOK`-ba nem kerülhetnek vissza, mert a megfeleltetés a szűrés
 * előtt fut, és a visszavett nevet mentéskor némán átírná. Ezt a `satisfies` őrzi: ha egy kulcs
 * egyben `Agazat` is, az fordítási hiba.
 */
const REGI_NEVEK = {
  'Autóipar': 'Mobilitás és autóipar',
  'Gyógyszeripar': 'Biotechnológia és gyógyszeripar',
  'Energetika': 'Energetika és fenntarthatóság',
  'Mezőgazdaság és élelmiszeripar': 'Agrár- és élelmiszeripar',
  'IKT és szoftver': 'IKT és digitalizáció',
  'Kreatív ipar': 'Kreatív ipar és média',
  'Félvezetők és mikroelektronika': 'Elektronika és félvezetők',
  'Agrár- és élelmiszertechnológia': 'Agrár- és élelmiszeripar',
  'Védelmi technológia': 'Védelmi ipar',
} as const satisfies Record<string, Agazat> & Partial<Record<Agazat, never>>;
export const REGI_AGAZAT_NEVEK: ReadonlyMap<string, Agazat> = new Map(Object.entries(REGI_NEVEK));
```

Ugyanebben a fájlban a három interfész-mező típusa:

```ts
// interface Alapadatok
  agazatok: Agazat[];
// interface KfiRendszer
  kiemeltIparagak: Agazat[];
// interface Vallalati
  kiemeltAgazatok: Agazat[];
```

(ma `GazdasagiAgazat[]`, `Iparag[]`, `Iparag[]`.)

A `szurtLista` függvény után (a `szovegLista` elé) szúrd be:

```ts
/**
 * A három ágazat-mező listája: a régi neveket a közös lista nevére képezi (`REGI_AGAZAT_NEVEK`),
 * utána `szurtLista`. A sorrend megmarad (az első kiemelt iparág adja a térkép színét); ha két elem
 * ugyanarra a névre képződik, az egyszer szerepel, az első előfordulás helyén.
 * Két helyen fut: a normalizálóban (a DB-ből olvasott JSON régi nevet is tárolhat) és az
 * űrlap-validátorban (hogy a két belépési pont ugyanúgy olvasson). A demó-profil futtató szigorú
 * ellenőrzése szándékosan nem alkalmazza: az országfájlokban a régi név hiba.
 */
export function agazatLista(v: unknown): Agazat[] {
  if (!Array.isArray(v)) return [];
  return szurtLista(v.map((x: unknown) => (typeof x === 'string' ? (REGI_AGAZAT_NEVEK.get(x) ?? x) : x)), AGAZATOK);
}
```

A `NORMALIZALOK` három sora:

```ts
// alapadatok
    agazatok: agazatLista(r.agazatok), agazatEgyeb: szoveg(r.agazatEgyeb),
// kfiRendszer
    kiemeltIparagak: agazatLista(r.kiemeltIparagak), iparagEgyeb: szoveg(r.iparagEgyeb),
// vallalati
    kiemeltAgazatok: agazatLista(r.kiemeltAgazatok), agazatEgyeb: szoveg(r.agazatEgyeb),
```

(ma `szurtLista(r.agazatok, GAZDASAGI_AGAZATOK)`, `szurtLista(r.kiemeltIparagak, IPARAGAK)`, `szurtLista(r.kiemeltAgazatok, IPARAGAK)`.)

A `MEZO_CIMKEK` nem változik.

- [ ] **Step 4: A validátor**

`lib/orszagprofil-validacio.ts`, az import:

```ts
import {
  EV_MIN, KFI_PRIORITASOK, MEZO_CIMKEK, OSSZEGZES_MAX, RENDEZVENY_MAX,
  ROVID_MAX, SZOVEG_MAX, TAGSAGOK, TOP_VALLALAT_MAX, agazatLista, rendezvenyTipus, szurtLista,
  type BlokkKulcs, type ProfilBlokkok, type Rendezveny,
} from './orszagprofil-szotar';
```

A `VALIDALOK` három sora:

```ts
// alapadatok
      agazatok: agazatLista(fd.getAll('agazatok')),
// kfiRendszer
      kiemeltIparagak: agazatLista(fd.getAll('kiemeltIparagak')),
// vallalati
      kiemeltAgazatok: agazatLista(fd.getAll('kiemeltAgazatok')),
```

(ma `szurtLista(fd.getAll('agazatok'), GAZDASAGI_AGAZATOK)`, illetve kétszer `szurtLista(…, IPARAGAK)`.) A `tagsagok` és a `prioritasok` sora marad `szurtLista`.

- [ ] **Step 5: Futtasd az assert-scriptet, most át kell mennie**

```bash
npx tsx scripts/_agazat-proba.ts; echo "exit=$?"
```

Várt: `Rendben: közös ágazatlista és megfeleltetés.` és `exit=0`. (A `tsc` még nem zöld: a fogyasztók a törölt neveket importálják.)

- [ ] **Step 6: A fogyasztók importjai**

`lib/terkep-mutatok.ts`:

```ts
import { AGAZATOK, AGAZAT_SZINEK, ALLAPOTOK, ALLAPOT_CIMKE, ALLAPOT_SZINEK, BLOKK_KULCSOK } from './orszagprofil-szotar';
```

```ts
const IPARAG_CIMKEK: Record<string, string> = Object.fromEntries(AGAZATOK.map((i) => [i, i]));
```

és az `iparag` mutatóban:

```ts
    sorrend: AGAZATOK, szinek: AGAZAT_SZINEK, cimkek: IPARAG_CIMKEK, csakHasznalt: true,
```

`db/queries/orszagprofil.ts`: az importban a `type Iparag` helyett `type Agazat` (a lista ábécérendjében az elejére), és a `TerkepOrszag`-ban:

```ts
import {
  BLOKK_KULCSOK, normalizalBlokk, profilAllapot,
  type Agazat, type Alapadatok, type Allapot, type BlokkKulcs, type KfiPrioritas, type ProfilBlokkok,
} from '../../lib/orszagprofil-szotar';
```

```ts
  /** A KFI-blokk kiemelt iparágai a közös ágazatlistából; az első adja a térkép színét. */
  iparagak: Agazat[];
```

`app/(app)/orszagprofil/components/mezok/AlapadatokMezok.tsx`: az importban a `GAZDASAGI_AGAZATOK` helyett `AGAZATOK`, és a `CimkeValaszto`-n `items={AGAZATOK}`:

```tsx
import { AGAZATOK, MEZO_CIMKEK, ROVID_MAX, SZAM_MAX_HOSSZ, TAGSAGOK, type Alapadatok } from '../../../../../lib/orszagprofil-szotar';
```

```tsx
          <CimkeValaszto id={mezoId(B, 'agazatok')} name="agazatok" cimke={C.agazatok.cimke} items={AGAZATOK} value={e.agazatok} onChange={set('agazatok')} errors={errors}
```

`KfiRendszerMezok.tsx`:

```tsx
import {
  AGAZATOK, KFI_PRIORITASOK, MEZO_CIMKEK, ROVID_MAX, SZAM_MAX_HOSSZ, SZOVEG_MAX, type KfiRendszer,
} from '../../../../../lib/orszagprofil-szotar';
```

```tsx
          <CimkeValaszto id={mezoId(B, 'kiemeltIparagak')} name="kiemeltIparagak" cimke={C.kiemeltIparagak.cimke} sugo={C.kiemeltIparagak.sugo} items={AGAZATOK} value={e.kiemeltIparagak} onChange={set('kiemeltIparagak')} errors={errors}
```

`VallalatiMezok.tsx`:

```tsx
import {
  AGAZATOK, MEZO_CIMKEK, ROVID_MAX, SZOVEG_MAX, TOP_VALLALAT_MAX, type Vallalati,
} from '../../../../../lib/orszagprofil-szotar';
```

```tsx
          <CimkeValaszto id={mezoId(B, 'kiemeltAgazatok')} name="kiemeltAgazatok" cimke={C.kiemeltAgazatok.cimke} items={AGAZATOK} value={e.kiemeltAgazatok} onChange={set('kiemeltAgazatok')} errors={errors}
```

(A három `CimkeValaszto` következő sora, az `egyeb={{ … }} />`, nem változik.)

`app/(app)/terkep/components/TerkepNezet.tsx`:

```tsx
import { AGAZATOK } from '../../../../lib/orszagprofil-szotar';
```

```tsx
const IPARAG_ITEMS: Record<string, string> = { [MIND]: 'Mind', ...Object.fromEntries(AGAZATOK.map((i) => [i, i])) };
```

```tsx
                  {AGAZATOK.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
```

`scripts/demo-orszagprofil.ts`, az import és a `LISTAK`:

```ts
import {
  AGAZATOK, BLOKK_KULCSOK, KFI_PRIORITASOK, MEZO_CIMKEK, RENDEZVENY_MAX, RENDEZVENY_TIPUSOK,
  TAGSAGOK, isBlokkKulcs, type BlokkKulcs, type ProfilBlokkok,
} from '../lib/orszagprofil-szotar';
```

```ts
/**
 * Listás mezők engedett opciói blokkonként: a validátor a szótáron kívülit némán eldobná. A kulcsok típusosak.
 * A három ágazat-mezőnél a régi név (`REGI_AGAZAT_NEVEK`) is hiba: a validátor megfeleltetné, de az
 * országfájlokban csak a közös lista nevei állhatnak.
 */
const LISTAK: { [K in BlokkKulcs]?: Partial<Record<keyof ProfilBlokkok[K], readonly string[]>> } = {
  alapadatok: { tagsagok: TAGSAGOK, agazatok: AGAZATOK },
  kfiRendszer: { prioritasok: KFI_PRIORITASOK, kiemeltIparagak: AGAZATOK },
  vallalati: { kiemeltAgazatok: AGAZATOK },
};
```

- [ ] **Step 7: A jelvény átnevezése és az olvasó nézet**

```bash
git mv components/orszagprofil/IparagBadge.tsx components/orszagprofil/AgazatBadge.tsx
```

A `components/orszagprofil/AgazatBadge.tsx` teljes tartalma:

```tsx
import { Badge } from '../ui/badge';
import { AGAZAT_SZINEK, type Agazat } from '../../lib/orszagprofil-szotar';

/** Ágazat-címke a szótár színével (a térképpel azonos); az országprofil mindhárom ágazat-mezője ezt használja. */
export function AgazatBadge({ agazat }: { agazat: Agazat }) {
  const szin = AGAZAT_SZINEK[agazat];
  // Inline style szándékosan: a szín a térképpel közös szótárból jön, nem Tailwind-tokenből.
  // Az app ma csak világos témájú; ha lesz sötét mód, ezekhez a színekhez `dark:` felülírás kell.
  return (
    <Badge variant="outline" style={{ color: szin, borderColor: `${szin}55`, background: `${szin}14` }}>
      {agazat}
    </Badge>
  );
}
```

`components/orszagprofil/BlokkNezet.tsx` – az importok:

```tsx
import {
  blokkCim, MEZO_CIMKEK, rendezvenyTipusCimke, type Agazat, type BlokkKulcs, type ProfilBlokkok,
} from '../../lib/orszagprofil-szotar';
import { formatSzam } from '../../lib/szam';
import { AgazatBadge } from './AgazatBadge';
```

Az `Iparagak` segéd helyére:

```tsx
/** Ágazat-jelvények színnel (Alapadatok ágazatai, KFI kiemelt iparágak, vállalati kiemelt ágazatok) + „egyéb" szabadszöveg. */
function Agazatok({ lista, egyeb }: { lista: readonly Agazat[]; egyeb: string }) {
  if (lista.length === 0 && !egyeb) return <Ures />;
  return (
    <span className="flex flex-wrap gap-1.5">
      {lista.map((a) => <AgazatBadge key={a} agazat={a} />)}
      {egyeb && <span>{egyeb}</span>}
    </span>
  );
}
```

A három sor a `NEZETEK`-ben (az Alapadatoké eddig a szürke `Cimkek` volt):

```tsx
        <Sor cimke={C.agazatok.cimke}><Agazatok lista={b.agazatok} egyeb={b.agazatEgyeb} /></Sor>
```

```tsx
        <Sor cimke={C.kiemeltIparagak.cimke}><Agazatok lista={b.kiemeltIparagak} egyeb={b.iparagEgyeb} /></Sor>
```

```tsx
        <Sor cimke={C.kiemeltAgazatok.cimke}><Agazatok lista={b.kiemeltAgazatok} egyeb={b.agazatEgyeb} /></Sor>
```

A `Cimkek` segéd marad (a tagságok és a prioritások használják).

`app/(app)/terkep/components/ProfilKivonat.tsx`:

```tsx
import { AgazatBadge } from '../../../../components/orszagprofil/AgazatBadge';
```

```tsx
                <div className="flex flex-wrap gap-1.5">{o.iparagak.map((i) => <AgazatBadge key={i} agazat={i} />)}</div>
```

`app/(app)/terkep/components/OsszehasonlitasPanel.tsx`:

```tsx
import { AgazatBadge } from '../../../../components/orszagprofil/AgazatBadge';
```

```tsx
              {(o) => (o.iparagak.length ? <span className="flex flex-wrap gap-1">{o.iparagak.map((i) => <AgazatBadge key={i} agazat={i} />)}</span> : '–')}
```

- [ ] **Step 8: Típusellenőrzés és a maradék hivatkozások**

```bash
npx tsc --noEmit; echo "exit=$?"
grep -rnE "IPARAGAK|IPARAG_SZINEK|GAZDASAGI_AGAZATOK|GazdasagiAgazat|IparagBadge|\bIparag\b" --include='*.ts' --include='*.tsx' app components lib db scripts; echo "grep exit=$?"
npx tsx scripts/_agazat-proba.ts
```

Várt: a `tsc` kimenet nélkül, `exit=0`; a `grep` nem talál semmit (`grep exit=1`); az assert-script `Rendben: …`. (A `IPARAG_CIMKEK`, az `IPARAG_ITEMS`, a `setIparag` és a `TerkepOrszag.iparagak` marad: a térkép „Kiemelt iparág” mutatójára utalnak.)

- [ ] **Step 9: Böngészős QA – szerkesztő**

```bash
S=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/cbfef716-4aa5-40a4-8034-5184ced8af85/scratchpad
B=~/.claude/skills/gstack/browse/dist/browse
$B goto 'http://localhost:3000/orszagprofil/DE/szerkesztes' >/dev/null; $B wait '#alapadatok\.agazatok' >/dev/null 2>&1; $B wait --networkidle >/dev/null
$B eval "$S/szerkeszto-qa.js"
```

Várt (a DB még a régi neveket tárolja, a chipek a megfeleltetésen át jönnek):

- `db: [21, 21, 21]`, `azonos: true`;
- `elemek`: a 21 név a spec sorrendjében, az első „Mesterséges intelligencia és adatgazdaság”, az utolsó „Építőipar”;
- `chipek`:
  - `alapadatok.agazatok`: `Mobilitás és autóipar | Gépipar | Vegyipar | Elektronika és félvezetők | Biotechnológia és gyógyszeripar | IKT és digitalizáció`
  - `kfiRendszer.kiemeltIparagak`: `Mobilitás és autóipar | Mesterséges intelligencia és adatgazdaság | Elektronika és félvezetők | Kvantumtechnológia | Biotechnológia és gyógyszeripar | Energetika és fenntarthatóság | Űripar`
  - `vallalati.kiemeltAgazatok`: `Mobilitás és autóipar | IKT és digitalizáció | Biotechnológia és gyógyszeripar | Elektronika és félvezetők | Mesterséges intelligencia és adatgazdaság | Anyagtudomány`

- [ ] **Step 10: Böngészős QA – olvasó nézet és térkép**

```bash
S=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/cbfef716-4aa5-40a4-8034-5184ced8af85/scratchpad
B=~/.claude/skills/gstack/browse/dist/browse
$B goto 'http://localhost:3000/orszagprofil/DE' >/dev/null; $B wait --networkidle >/dev/null
$B eval "$S/nezet-qa.js"
$B goto 'http://localhost:3000/terkep' >/dev/null; $B wait --networkidle >/dev/null
$B eval "$S/terkep-qa.js"
$B console --errors
```

Várt, `nezet-qa.js`:

- „Legfontosabb gazdasági ágazatok”: `db: 6, szines: 6`; a jelvények sorban: Mobilitás és autóipar `rgb(154, 52, 18)`, Gépipar `rgb(67, 56, 202)`, Vegyipar `rgb(162, 28, 175)`, Elektronika és félvezetők `rgb(180, 83, 9)`, Biotechnológia és gyógyszeripar `rgb(15, 122, 104)`, IKT és digitalizáció `rgb(37, 99, 235)`;
- „Kiemelt iparágak”: `db: 7, szines: 7`, a harmadik „Elektronika és félvezetők” `rgb(180, 83, 9)`;
- „Kiemelt ágazatok”: `db: 6, szines: 6`.

Várt, `terkep-qa.js`:

- `jelmagyarazat`: `Kiemelt iparág`, `Mesterséges intelligencia és adatgazdaság`, `IKT és digitalizáció`, `Elektronika és félvezetők`, `Biotechnológia és gyógyszeripar`, `Energetika és fenntarthatóság`, `Hidrogén és akkumulátor`, `Űripar`, `Mobilitás és autóipar`, `Agrár- és élelmiszeripar`, `nincs kiemelt iparág`, `nincs attasé és profil`;
- `pinDb: 27`, a `pinSzinek` betűre egyezik a terv elején rögzített kiinduló sorral;
- `szuroDb: 22`, a `szuro` első eleme „Mind”, utána a 21 név a spec sorrendjében.

A `console --errors`: `(no console errors)`.

- [ ] **Step 11: Commit**

```bash
git add lib/orszagprofil-szotar.ts lib/orszagprofil-validacio.ts lib/terkep-mutatok.ts db/queries/orszagprofil.ts \
  "app/(app)/orszagprofil/components/mezok/AlapadatokMezok.tsx" \
  "app/(app)/orszagprofil/components/mezok/KfiRendszerMezok.tsx" \
  "app/(app)/orszagprofil/components/mezok/VallalatiMezok.tsx" \
  "app/(app)/terkep/components/TerkepNezet.tsx" "app/(app)/terkep/components/ProfilKivonat.tsx" \
  "app/(app)/terkep/components/OsszehasonlitasPanel.tsx" \
  components/orszagprofil/AgazatBadge.tsx components/orszagprofil/BlokkNezet.tsx scripts/demo-orszagprofil.ts
git status --short
git commit -m "$(printf 'feat(egyseges-agazatlista): a három ágazat-mező közös, 21 elemű listája (AGAZATOK), a régi nevek megfeleltetése a normalizálóban és a validátorban, színes AgazatBadge mindhárom mezőnél\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

A `git status --short` a commit előtt: a fenti fájlok `M`, a jelvény `R` (átnevezés), ezen kívül legfeljebb `?? scripts/_agazat-proba.ts` és ` M data/tet.db` (egyiket se add hozzá).

---

### Task 2: A 27 országfájl átnevezése

**Files:**
- Modify: `scripts/demo-orszagprofil/orszagok/*.ts` (26 fájl; az `mv.ts` nem változik)
- Futtat: `$S/_agazat-atnevezes.mjs` (tartalma a terv elején)

- [ ] **Step 1: A szigorú ellenőrzés most bukik (ez a „bukó teszt”)**

```bash
NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts 2>&1 | head -3
NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts 2>&1 | grep -c "szótáron kívüli opció"
```

Várt: az első sor `122 hiba, a DB-be nem írtam:`, a számláló `122`. A hibák alakja pl. `de.ts: alapadatok.agazatok: szótáron kívüli opció „Autóipar”`.

- [ ] **Step 2: Az átnevező script futtatása**

Ha a `$S/_agazat-atnevezes.mjs` hiányzik, hozd létre a terv elején megadott tartalommal.

```bash
S=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/cbfef716-4aa5-40a4-8034-5184ced8af85/scratchpad
node "$S/_agazat-atnevezes.mjs"; echo "exit=$?"
```

Várt kimenet:

```
agazatok: Autóipar → Mobilitás és autóipar: 12
agazatok: Gyógyszeripar → Biotechnológia és gyógyszeripar: 12
agazatok: Energetika → Energetika és fenntarthatóság: 14
agazatok: Mezőgazdaság és élelmiszeripar → Agrár- és élelmiszeripar: 17
agazatok: IKT és szoftver → IKT és digitalizáció: 13
agazatok: Kreatív ipar → Kreatív ipar és média: 2
kiemeltIparagak: Félvezetők és mikroelektronika → Elektronika és félvezetők: 11
kiemeltIparagak: Agrár- és élelmiszertechnológia → Agrár- és élelmiszeripar: 15
kiemeltIparagak: Védelmi technológia → Védelmi ipar: 4
kiemeltAgazatok: Félvezetők és mikroelektronika → Elektronika és félvezetők: 9
kiemeltAgazatok: Agrár- és élelmiszertechnológia → Agrár- és élelmiszeripar: 7
kiemeltAgazatok: Védelmi technológia → Védelmi ipar: 6
122 listaelem átírva 26 fájlban.
exit=0
```

(A sorok sorrendje eltérhet.) A script csak akkor ír, ha a számok a spec táblázatával egyeznek. **Másodszor ne futtasd:** az átírt fájlokon már nincs mit számolnia, ezért `ELTÉRÉS …, nem írtam.` üzenettel, írás nélkül áll le.

- [ ] **Step 3: A szigorú ellenőrzés most zöld**

```bash
NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts; echo "exit=$?"
```

Várt: 27 sor `XX: N blokk rendben (2026), nem írtam a DB-be`, a végén `Íráshoz: --ir`, `exit=0`.

- [ ] **Step 4: A diff csak a három lista sorait érinti**

```bash
git diff --stat -- scripts/demo-orszagprofil/orszagok | tail -1
git diff -U0 -- scripts/demo-orszagprofil/orszagok | grep -E "^[-+]" | grep -vE "^(\+\+\+|---) " \
  | grep -vE "^[-+] +((agazatok|kiemeltIparagak|kiemeltAgazatok): \[.*|('[^']*', )*'[^']*',|\],)$"; echo "szűrő exit=$?"
git diff -- scripts/demo-orszagprofil/orszagok/de.ts
```

Várt: `26 files changed, …`; a szűrő nem ír ki sort (`szűrő exit=1`): minden módosult sor listafej, listaelem-sor vagy lista-záró. A `de.ts` diffje három lista: az `agazatok` többsorossá vált („Mobilitás és autóipar”, …, „IKT és digitalizáció”), a `kiemeltIparagak` és a `kiemeltAgazatok` egy-egy sorában „Elektronika és félvezetők” áll a „Félvezetők és mikroelektronika” helyén. A listák sorrendje nem változott.

- [ ] **Step 5: Típusellenőrzés és commit**

```bash
npx tsc --noEmit; echo "exit=$?"
git add scripts/demo-orszagprofil/orszagok
git status --short
git commit -m "$(printf 'chore(egyseges-agazatlista): a 27 demó országfájl három ágazat-listája a közös lista neveivel (122 listaelem, 26 fájl; a szabadszövegek változatlanok)\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

Várt: `exit=0`; a `git status --short` a commit előtt 26 `M` sor az `orszagok/` alatt, ezen kívül legfeljebb `?? scripts/_agazat-proba.ts` és ` M data/tet.db`.

---

### Task 3: Mentés-próba, a demó DB újragenerálása, dokumentáció, lezárás

**Files:**
- Create (nem commitoljuk): `scripts/_agazat-dump.ts`
- Modify + commit: `data/tet.db`
- Modify: `CLAUDE.md`
- Delete: `scripts/_agazat-proba.ts`, `scripts/_agazat-dump.ts`

A sorrend kötött: a mentés-próba a demó DB-t írja, az újragenerálás állítja vissza; a sessionök törlése a böngészős QA után jön, mert kijelentkeztet.

- [ ] **Step 1: Mentés-próba – új listaelem bejelölése és mentése**

```bash
S=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/cbfef716-4aa5-40a4-8034-5184ced8af85/scratchpad
B=~/.claude/skills/gstack/browse/dist/browse
$B goto 'http://localhost:3000/orszagprofil/DE/szerkesztes' >/dev/null; $B wait '#vallalati\.kiemeltAgazatok' >/dev/null 2>&1; $B wait --networkidle >/dev/null
$B eval "$S/mentes-qa.js"
$B goto 'http://localhost:3000/orszagprofil/DE' >/dev/null; $B wait --networkidle >/dev/null
$B eval "$S/nezet-qa.js" | grep -A3 '"Turizmus"'
$B goto 'http://localhost:3000/orszagprofil/DE/szerkesztes' >/dev/null; $B wait '#vallalati\.kiemeltAgazatok' >/dev/null 2>&1; $B wait --networkidle >/dev/null
$B js "[...document.getElementById('vallalati.kiemeltAgazatok-doboz').querySelectorAll('[data-slot=\"combobox-chip\"]')].map(e => e.textContent.trim()).join(' | ')"
```

Várt:

- `mentes-qa.js`: `{"chipek":[…, "Anyagtudomány","Turizmus"],"toast":"Blokk mentve","hibak":[]}`;
- az olvasó nézetben a „Kiemelt ágazatok” sor végén `"nev": "Turizmus"`, `"szin": "rgb(209, 21, 65)"`;
- újratöltés után a szerkesztő chipjei: `Mobilitás és autóipar | IKT és digitalizáció | Biotechnológia és gyógyszeripar | Elektronika és félvezetők | Mesterséges intelligencia és adatgazdaság | Anyagtudomány | Turizmus`.

Ez a mentés a `data/tet.db`-be írt (és a blokk régi neveit az újakra cserélte); az 5. lépés állítja vissza.

- [ ] **Step 2: A dump-script**

Hozd létre a `scripts/_agazat-dump.ts` fájlt:

```ts
/** Eldobható: minden profil-sor normalizált tartalma JSON-ban (a megfeleltetés és az átírás ellenőrzéséhez). */
import { writeFileSync } from 'node:fs';
import { db } from '../db';
import { orszagprofil } from '../db/schema';
import { getProfil } from '../db/queries/orszagprofil';

const ki = process.argv[2];
if (!ki) throw new Error('Használat: tsx scripts/_agazat-dump.ts <kimenet.json>');
const sorok = db
  .select({ kod: orszagprofil.orszagKod, ev: orszagprofil.ev })
  .from(orszagprofil)
  .orderBy(orszagprofil.orszagKod, orszagprofil.ev)
  .all();
const dump = sorok.map(({ kod, ev }) => {
  const p = getProfil(kod, ev);
  return { kod, ev, mentett: p?.mentett ?? [], blokkok: p?.blokkok ?? {} };
});
writeFileSync(ki, JSON.stringify(dump, null, 1));
console.log(`${dump.length} profil-sor kiírva: ${ki}`);
```

- [ ] **Step 3: A régi DB a megfeleltetésen át – a viszonyítási dump**

A `main`-beli demó DB a régi neveket tárolja; az új kód a megfeleltetésen át olvassa.

```bash
S=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/cbfef716-4aa5-40a4-8034-5184ced8af85/scratchpad
T="$S/db"; rm -rf "$T" && mkdir -p "$T"
git show main:data/tet.db > "$T/regi.db"
DATABASE_URL="$T/regi.db" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_agazat-dump.ts "$T/regi.json"
grep -cE '"(Autóipar|Gyógyszeripar|Energetika|Mezőgazdaság és élelmiszeripar|IKT és szoftver|Kreatív ipar|Félvezetők és mikroelektronika|Agrár- és élelmiszertechnológia|Védelmi technológia)"' "$T/regi.json"
```

Várt: `28 profil-sor kiírva: …/regi.json` (előtte a `[db] … – meglévő fájl` sor), és a `grep -c` eredménye `0`: a régi DB-ből olvasott profilokban már egyetlen régi név sincs.

A nyers DB-ben viszont ott vannak (ez igazolja, hogy a lekérdezés jó helyen keres):

```bash
S=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/cbfef716-4aa5-40a4-8034-5184ced8af85/scratchpad
T="$S/db"
REGI_NEVEK_SQL="with regi(nev) as (values ('Autóipar'),('Gyógyszeripar'),('Energetika'),('Mezőgazdaság és élelmiszeripar'),('IKT és szoftver'),('Kreatív ipar'),('Félvezetők és mikroelektronika'),('Agrár- és élelmiszertechnológia'),('Védelmi technológia'))
select (select count(*) from orszagprofil p, json_each(p.alapadatok, '\$.agazatok') j where j.value in (select nev from regi))
     + (select count(*) from orszagprofil p, json_each(p.kfi_rendszer, '\$.kiemeltIparagak') j where j.value in (select nev from regi))
     + (select count(*) from orszagprofil p, json_each(p.vallalati, '\$.kiemeltAgazatok') j where j.value in (select nev from regi));"
sqlite3 -readonly "file:$T/regi.db?immutable=1" "$REGI_NEVEK_SQL"
```

Várt: `122`.

- [ ] **Step 4: Próbafutás a DB másolatán**

```bash
S=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/cbfef716-4aa5-40a4-8034-5184ced8af85/scratchpad
T="$S/db"
git show main:data/tet.db > "$T/proba.db"
DATABASE_URL="$T/proba.db" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts --ir
DATABASE_URL="$T/proba.db" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_agazat-dump.ts "$T/proba.json"
cmp "$T/regi.json" "$T/proba.json" && echo AZONOS
```

Várt: 27 sor `XX: N blokk mentve 2026-ra (szerző: …)`, `FIGYELEM` sor nélkül; `28 profil-sor kiírva`; `AZONOS`. Az egyezés azt jelenti: az átírt fájlokból generált DB mind a 8 blokkban ugyanazt adja, mint a régi DB a megfeleltetésen át, a listák sorrendjével együtt.

Ha a `cmp` eltérést jelez: `diff "$T/regi.json" "$T/proba.json" | head -40`, és állj meg – az átírás mást is megváltoztatott, vagy a megfeleltetés hibás. Ne írj az éles DB-be.

- [ ] **Step 5: Éles újragenerálás és összevetés**

```bash
S=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/cbfef716-4aa5-40a4-8034-5184ced8af85/scratchpad
T="$S/db"
NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts --ir
NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_agazat-dump.ts "$T/uj.json"
cmp "$T/regi.json" "$T/uj.json" && echo AZONOS
REGI_NEVEK_SQL="with regi(nev) as (values ('Autóipar'),('Gyógyszeripar'),('Energetika'),('Mezőgazdaság és élelmiszeripar'),('IKT és szoftver'),('Kreatív ipar'),('Félvezetők és mikroelektronika'),('Agrár- és élelmiszertechnológia'),('Védelmi technológia'))
select (select count(*) from orszagprofil p, json_each(p.alapadatok, '\$.agazatok') j where j.value in (select nev from regi))
     + (select count(*) from orszagprofil p, json_each(p.kfi_rendszer, '\$.kiemeltIparagak') j where j.value in (select nev from regi))
     + (select count(*) from orszagprofil p, json_each(p.vallalati, '\$.kiemeltAgazatok') j where j.value in (select nev from regi));"
sqlite3 -readonly data/tet.db "$REGI_NEVEK_SQL"
for d in "file:$T/regi.db?immutable=1" data/tet.db; do sqlite3 -readonly "$d" "select (select count(*) from user), (select count(*) from attase_orszag), (select count(*) from orszagprofil), (select count(*) from riport), (select count(*) from ticket);"; done
```

Várt: 27 `… blokk mentve 2026-ra` sor `FIGYELEM` nélkül; `AZONOS` (ez azt is igazolja, hogy az 1. lépés „Turizmus” mentése eltűnt); a régi nevek száma `0`; a két számsor azonos (a felhasználók, hozzárendelések, profilok, riportok és ticketek száma nem változott; a profiloké 28).

- [ ] **Step 6: Böngészős QA az újragenerált DB-n**

```bash
S=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/cbfef716-4aa5-40a4-8034-5184ced8af85/scratchpad
B=~/.claude/skills/gstack/browse/dist/browse
$B goto 'http://localhost:3000/orszagprofil/DE/szerkesztes' >/dev/null; $B wait '#alapadatok\.agazatok' >/dev/null 2>&1; $B wait --networkidle >/dev/null
$B eval "$S/szerkeszto-qa.js"
$B goto 'http://localhost:3000/orszagprofil/DE' >/dev/null; $B wait --networkidle >/dev/null
$B eval "$S/nezet-qa.js"
$B goto 'http://localhost:3000/terkep' >/dev/null; $B wait --networkidle >/dev/null
$B eval "$S/terkep-qa.js"
$B goto 'http://localhost:3000/terkep' >/dev/null; $B wait --networkidle >/dev/null
$B eval "$S/szuro-qa.js"
$B console --errors
```

Várt: a `szerkeszto-qa.js`, a `nezet-qa.js` és a `terkep-qa.js` kimenete **betűre ugyanaz**, mint az 1. task 9–10. lépésében (a „Kiemelt ágazatok” megint `db: 6`, „Turizmus” nélkül; a `pinSzinek` a kiinduló sor). A `szuro-qa.js`: `{"szuro":"Turizmus▼","uresAllapot":true,"jelmagyarazat":["Kiemelt iparág","nem felel meg a szűrőnek","nincs attasé és profil"]}`. A konzol: `(no console errors)`.

- [ ] **Step 7: CLAUDE.md, az eldobható scriptek törlése, build**

A `CLAUDE.md` Országprofil bekezdésében két csere.

Erről:

```
opciólisták `TAGSAGOK`, `GAZDASAGI_AGAZATOK`, `KFI_PRIORITASOK`, `IPARAGAK` + `IPARAG_SZINEK`, `ALLAPOTOK`
```

erre:

```
opciólisták `TAGSAGOK`, `KFI_PRIORITASOK`, `AGAZATOK` + `AGAZAT_SZINEK` (21 elem: az Alapadatok `agazatok`, a KFI-blokk `kiemeltIparagak` és a vállalati blokk `kiemeltAgazatok` mezőjének közös listája; az első kiemelt iparág színe a térképé), `REGI_AGAZAT_NEVEK` + `agazatLista()` (a 2026-10-12 előtti két lista kilenc régi neve → közös név; a normalizáló és a validátor a három mezőt ezen át olvassa, ezért a régi nevet tároló DB migráció nélkül is helyesen olvasódik – a nyers JSON-oszlopban tehát régi név is állhat; a kilenc régi név foglalt, az `AGAZATOK`-ba nem kerülhet vissza, ezt a tábla `satisfies`-őre fordításkor ellenőrzi; listaelemet átnevezni csak a tábla bővítésével szabad, különben a tárolt érték olvasáskor kiesik, a következő mentéskor pedig elvész, és új ágazat-mező `agazatLista()`-t hívjon, ne `szurtLista`-t; a demó-profil futtató szigorú ellenőrzése a régi nevet hibának veszi), `ALLAPOTOK`
```

Erről:

```
`AllapotBadge` a legnagyobb profil-év ≤ nézett év állapotával, `IparagBadge`;
```

erre:

```
`AllapotBadge` a legnagyobb profil-év ≤ nézett év állapotával, `AgazatBadge` (mindhárom ágazat-mező színes jelvénye, a térképpel közös `AGAZAT_SZINEK`-ből);
```

A `lib/orszagprofil-szotar.ts`-ben az exportált `REGI_AGAZAT_NEVEK` sora fölé egy sor doc-komment (az 1. task újra-review-jának apró pontja: a magyarázat eddig csak a privát `REGI_NEVEK`-en ült):

```ts
/** A `REGI_NEVEK` tábla `Map`-ként: a keresés csak a saját kulcsokra talál (a `constructor` vagy a `__proto__` nem képződik le). */
export const REGI_AGAZAT_NEVEK: ReadonlyMap<string, Agazat> = new Map(Object.entries(REGI_NEVEK));
```

Utána:

```bash
npx tsx scripts/_agazat-proba.ts
rm -f scripts/_agazat-proba.ts scripts/_agazat-dump.ts
grep -nE "IPARAGAK|IPARAG_SZINEK|GAZDASAGI_AGAZATOK|IparagBadge" CLAUDE.md README.md; echo "grep exit=$?"
npx tsc --noEmit; echo "tsc exit=$?"
npm run build 2>&1 | tail -15
git add CLAUDE.md lib/orszagprofil-szotar.ts
git commit -m "$(printf 'docs(egyseges-agazatlista): CLAUDE.md – a közös AGAZATOK lista, a régi nevek megfeleltetése (REGI_AGAZAT_NEVEK, agazatLista) és az AgazatBadge; komment az exportált megfeleltető táblán\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

Várt: az assert-script `Rendben: …` (még a törlése előtt); a `grep` nem talál semmit (`grep exit=1`); `tsc exit=0`; a build hibátlanul lefut (a végén a route-lista). Ha a build nem létező `app/...` modulra panaszkodik: `rm .next/dev/types/validator.ts`, majd újra build (lásd `CLAUDE.md`).

- [ ] **Step 8: A demó DB véglegesítése és commitja**

A sessionök törlése a felhasználó helyi bejelentkezését is megszünteti (a spec szerint elfogadott); a publikus repóba nem kerülhet érvényes session-token.

```bash
sqlite3 data/tet.db "select count(*) from session;"
sqlite3 data/tet.db "delete from session; VACUUM; PRAGMA wal_checkpoint(TRUNCATE);"
sqlite3 data/tet.db "select count(*) from session; select count(*) from orszagprofil where ev=2026; select count(*) from orszagprofil;"
git status --short
git add data/tet.db
git commit -m "$(printf 'chore(egyseges-agazatlista): demó DB újragenerálva – a 27 ország profilja a közös ágazatlista neveivel, sessionök nélkül\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
git status --short
```

Várt: a checkpoint kimenete `0|0|0`; a számok `0`, `27`, `28`; a commit előtti `git status --short` egyetlen sora ` M data/tet.db`; a commit utáni üres (legfeljebb ` M data/tet.db`, ha a dev szerver közben írt – azt már nem commitoljuk).

**Zárolás:** ha a `VACUUM` vagy a checkpoint `database is locked` vagy `busy` hibát ad (a dev szerver épp olvas), pár másodperc múlva ismételd meg a teljes parancsot.

- [ ] **Step 9: Záró ellenőrzés**

```bash
git log --oneline main..HEAD
git status --short
NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts | tail -2
ls scripts/_agazat-* 2>/dev/null; echo "ls exit=$?"
```

Várt: legalább hat commit a `main` fölött (spec, terv, kód, országfájlok, CLAUDE.md, demó DB; a review-javítások commitjai ezen felül); tiszta munkafa; a futtató utolsó sora `Íráshoz: --ir`; eldobható script nem maradt (`ls exit=1` vagy „No such file”).
