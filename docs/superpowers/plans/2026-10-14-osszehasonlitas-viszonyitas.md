# Összehasonlítás: viszonyító megjelenítés – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A térkép alatti összehasonlító tábla helyére mutatókártyák (országonként saját színű sáv közös, nulláról induló skálán) és listamátrixok kerüljenek, Magyarország állandó viszonyítási alapként. A panel magyar profil mellett 1 országtól látszik, Magyarország pedig a halmazba nem vehető fel.

**Architecture:** A tiszta logika (országszínek és a halmaz bővítése, sáv-skála, listamátrix) egy új, framework-mentes `lib/osszehasonlitas.ts`-be kerül, eldobható tsx-scripttel ellenőrizve. A `useTerkepAllapot` a halmazt ország + szín párokként tárolja, és kifelé `vsSzinek`-et és `vsMin`-t is ad. A panel három új kliens-komponensből áll össze: `OsszehasonlitasFejlec`, `MutatoKartya`, `ListaMatrix`. Nincs DB-, séma-, lekérdezés- vagy szerverváltozás.

**Tech Stack:** Next.js 16 App Router (kliens-komponensek), React 19, TypeScript, Tailwind CSS v4, shadcn/ui (`Card`, `Button`, `Badge`), tsx + `node:assert` (eldobható ellenőrző script).

Spec: `docs/superpowers/specs/2026-10-14-osszehasonlitas-viszonyitas-design.md`. Ág: `osszehasonlitas-viszonyitas`. A jóváhagyott makett helyben, gitignore-olt fájlban van: `.superpowers/brainstorm/62102-1791981163/content/teljes-panel-v2.html`. A 8. kártyája („Példa: negatív érték”) csak illusztráció.

**Tesztkeretrendszer nincs** (CLAUDE.md). Az ellenőrzés eszközei:
- az 1. task tiszta függvényeihez eldobható tsx-script (`scripts/_osszehasonlitas-proba.ts`), amelyet nem commitolunk;
- minden task végén `npx tsc --noEmit`, a UI-taskok végén `npm run build`;
- a végén böngészős QA (6. task, a fő munkamenet végzi).

A terv kódját a megírása előtt egy eldobható forrásmásolaton kipróbáltuk. A teljes projekt és a 2. és 3. task utáni köztes állapot is hibátlanul fordult, az ellenőrző script „ok”-ot adott, és minden régi→új csere pontosan egyszer illeszkedett.

**Eltérések a spectől** (a terv írásakor eldöntve; a 7. task a spec „Megvalósítási eltérések” szakaszába vezeti):
1. A halmaz bővítése (`VsElem`, `vsHozzaadElem`: a legkisebb szabad szín, Magyarország kizárása) a `lib/osszehasonlitas.ts`-ben van, nem a hookban, így a tsx-script ellenőrizni tudja. A hook csak hívja.
2. A rácsok `minmax(min(Xrem,100%),1fr)`-et kapnak, hogy nagyon keskeny ablakban se lógjanak ki.
3. A szakaszcímek (Mutatók, Listák) `h2`-k, a kártyacímek `h3`-ak; az AppShell lapcíme a `h1`.
4. A magyar viszonyítási alap feltétele a profil, nem a rekord puszta jelenléte. A `hazaiRekord` csak az `ev !== null` magyar rekordot fogadja el, mert attasé-hozzárendelés miatt profil nélkül is lehet magyar rekord. A hook kiadja `hazai`-ként, és a `vsMin` ebből számol (a 2. task reviewja nyomán).
5. A `vsKivesz` és a `vsTorol` változás nélkül ugyanazt a példányt adja vissza, hogy a `vs` „csak tényleges változásnál új” szerződése igaz legyen (a 2. task reviewja nyomán).

**Közös szabályok (minden subagentnek):**
- A felhasználó TéT dev szervere a 3000-es porton fut. Nem szabad leállítani vagy újraindítani, és saját dev szervert sem szabad indítani.
- A `data/tet.db`-t nem commitoljuk, és migráció sem kell.
- Commitnál csak a felsorolt fájlokat add hozzá (`git add <fájl>`), `git add -A` tilos: a munkafában más munkamenetek fájljai is lehetnek. Minden commit-üzenet végén üres sor után: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Ha a `npx tsc --noEmit` vagy a `npm run build` egy nem létező `app/...` modulra panaszkodik, az a futó dev szerver elavult `.next/dev/types/validator.ts`-e (CLAUDE.md). Ilyenkor `rm .next/dev/types/validator.ts`, majd újra.
- Reviewer subagent: a git-et csak olvassa (tilos a checkout, a reset és a stash), a DB-t csak `-readonly`-val nyithatja meg.
- A kód stílusa a környezetét követi: magyar azonosítók és kommentek, relatív importok, és „Inline style szándékosan: …” komment minden inline színnél.

## Fájlok

- Create: `lib/osszehasonlitas.ts` – az összehasonlítás tiszta logikája:
  - színek: `VS_SZINEK`, `HAZAI_SZIN`, `HAZAI_SAV_SZIN`;
  - a halmaz bővítése: `VsElem`, `vsHozzaadElem`;
  - sáv-skála: `savSkala`, `skalaHely`, `savHelye`, `nullaVonal`;
  - listamátrix: `listaMatrix` és a típusai;
  - a magyar viszonyítási alap: `hazaiRekord` (3. task).
- Modify: `lib/terkep-mutatok.ts` – `SzamMutato.felsoHatar?`, a kitöltöttségnél `BLOKK_KULCSOK.length`; a 4. taskban két komment.
- Modify: `db/queries/orszagprofil.ts` – egy elavult komment (4. task).
- Modify: `app/(app)/terkep/components/useTerkepAllapot.ts` – a halmaz ország + szín párokból áll; új mezők `vsSzinek`, `vsMin` és (a 3. taskban) `hazai`; a `VS_MAX` a `VS_SZINEK.length`-ből adódik, a `VS_MIN` konstans megszűnik.
- Modify: `app/(app)/terkep/components/OsszehasonlitasCsik.tsx` – színpötty a chipeken, az állapotszöveg a `minimum`-hoz igazodik.
- Modify: `app/(app)/terkep/components/TerkepNezet.tsx`:
  - a panel a `vsMin`-től látszik;
  - a „+ Ország” jelöltjeiből kimarad Magyarország;
  - a magyar rekord (`hazai`) és az új panel-propok.
- Modify: `app/(app)/terkep/components/TerkepPanel.tsx` – a csíknak `szinek` és `minimum` megy, a doc-kommentek frissülnek.
- Modify: `app/(app)/terkep/components/RangsorPanel.tsx` – Magyarország sorában a „+” helyén helykitöltő.
- Modify: `app/(app)/terkep/components/ProfilKivonat.tsx` – Magyarországnál a gomb helyén tájékoztató szöveg; a 4. taskban egy komment.
- Create: `app/(app)/terkep/components/MutatoKartya.tsx` – egy számszerű mutató kártyája.
- Create: `app/(app)/terkep/components/OsszehasonlitasFejlec.tsx` – az országkártyák, a „+ Ország” és a Magyarország-kártya.
- Create: `app/(app)/terkep/components/ListaMatrix.tsx` – egy lista mátrixa.
- Modify (újraírás): `app/(app)/terkep/components/OsszehasonlitasPanel.tsx` – vékony keret: fejléc, „Mutatók”, „Listák”.
- Modify: `CLAUDE.md` – a `/terkep` route és a Térkép bekezdés.
- Ideiglenes, nem commitoljuk: `scripts/_osszehasonlitas-proba.ts`.

---

### Task 1: Tiszta logika – `lib/osszehasonlitas.ts` és a `felsoHatar`

**Files:**
- Create: `lib/osszehasonlitas.ts`
- Modify: `lib/terkep-mutatok.ts` (a `SzamMutato` interfész és a `kitoltottseg` bejegyzés)
- Ideiglenes: `scripts/_osszehasonlitas-proba.ts` (a task végén törlendő)

- [ ] **Step 1: Az ellenőrző script (előbb a teszt)**

`scripts/_osszehasonlitas-proba.ts`. Az elvárt értékek a 2026-os demó-adatokból jönnek (Japán, Németország, Dél-Korea, USA és Magyarország), és megegyeznek a jóváhagyott makett számaival:

```ts
// Eldobható ellenőrzés a lib/osszehasonlitas.ts-hez (nem commitoljuk). Futtatás: npx tsx scripts/_osszehasonlitas-proba.ts
import assert from 'node:assert/strict';
import {
  listaMatrix, nullaVonal, savHelye, savSkala, skalaHely, vsHozzaadElem, type ListaMatrixAdat, type VsElem,
} from '../lib/osszehasonlitas';
import {
  AGAZATOK, KFI_PRIORITASOK, TAGSAGOK, type Agazat, type KfiPrioritas, type Tagsag,
} from '../lib/orszagprofil-szotar';
import { mutatoByKulcs } from '../lib/terkep-mutatok';

const kozel = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
const tomor = <T extends string>(m: ListaMatrixAdat<T>) => m.csoportok.map((cs) => [cs.cimke, cs.sorok.map((s) => s.elem)]);

// --- Színhelyek: a legkisebb szabad szín, kivétel után nem színeződik át; Magyarország nem kerül bele.
let v: readonly VsElem[] = [];
for (const k of ['JP', 'DE', 'KR', 'US']) v = vsHozzaadElem(v, k);
assert.deepEqual(v.map((e) => [e.kod, e.szin]), [['JP', 0], ['DE', 1], ['KR', 2], ['US', 3]]);
assert.equal(vsHozzaadElem(v, 'CA'), v, 'tele halmaz: ugyanaz a példány');
v = vsHozzaadElem(v.filter((e) => e.kod !== 'DE'), 'CA');
assert.deepEqual(v.map((e) => [e.kod, e.szin]), [['JP', 0], ['KR', 2], ['US', 3], ['CA', 1]]);
const ures: readonly VsElem[] = [];
assert.equal(vsHozzaadElem(ures, 'HU'), ures, 'Magyarország nem vehető fel');
assert.equal(vsHozzaadElem(v, 'JP'), v, 'már benne: ugyanaz a példány');

// --- Sáv-skála
assert.deepEqual(savSkala([34713, 59925, 35962, 89599, 25916]), { also: 0, felso: 89599 });
assert.deepEqual(savSkala([-0.8, -1.3, 0.2, 0.3, 0.6]), { also: -1.3, felso: 0.6 });
assert.equal(savSkala([null, null]), null);
assert.equal(savSkala([]), null);
assert.deepEqual(savSkala([0, null, 0]), { also: 0, felso: 0 });
assert.deepEqual(savSkala([9, 9, 8], 9), { also: 0, felso: 9 });
assert.deepEqual(savSkala([3, 4], 9), { also: 0, felso: 9 });
const kit = mutatoByKulcs('kitoltottseg');
assert.ok(kit.tipus === 'szam' && kit.felsoHatar === 9, 'a kitöltöttség felső határa 9');
const gdp = mutatoByKulcs('gdp');
assert.ok(gdp.tipus === 'szam' && gdp.felsoHatar === undefined, 'a GDP-nek nincs felső határa');

// --- Helyek: negatív alsó határ (GDP-növekedés: Puerto Rico −0,8, Amerikai Virgin-szigetek −1,3, ... Magyarország 0,6)
const neg = { also: -1.3, felso: 0.6 };
kozel(skalaHely(0, neg), 1.3 / 1.9);
const pr = savHelye(-0.8, neg);
kozel(pr.bal, 0.5 / 1.9);
kozel(pr.szel, 0.8 / 1.9);
const de = savHelye(0.2, neg);
kozel(de.bal, 1.3 / 1.9);
kozel(de.szel, 0.2 / 1.9);
kozel(nullaVonal(neg)!, 1.3 / 1.9);
assert.equal(nullaVonal({ also: 0, felso: 10 }), null);
assert.deepEqual(savHelye(0, { also: 0, felso: 0 }), { bal: 0, szel: 0 });
const poz = { also: 0, felso: 89599 };
assert.equal(savHelye(34713, poz).bal, 0);
kozel(savHelye(34713, poz).szel, 34713 / 89599);

// --- Listamátrix a 2026-os demó-adatokkal (Japán, Németország, Dél-Korea, USA + Magyarország)
const JP_IP: Agazat[] = ['Elektronika és félvezetők', 'Mobilitás és autóipar', 'Mesterséges intelligencia és adatgazdaság', 'Kvantumtechnológia', 'Biotechnológia és gyógyszeripar', 'Űripar', 'Energetika és fenntarthatóság', 'Anyagtudomány'];
const DE_IP: Agazat[] = ['Mobilitás és autóipar', 'Mesterséges intelligencia és adatgazdaság', 'Elektronika és félvezetők', 'Kvantumtechnológia', 'Biotechnológia és gyógyszeripar', 'Energetika és fenntarthatóság', 'Űripar'];
const KR_IP: Agazat[] = ['Elektronika és félvezetők', 'Mesterséges intelligencia és adatgazdaság', 'Hidrogén és akkumulátor', 'Biotechnológia és gyógyszeripar', 'Kvantumtechnológia', 'Űripar', 'Energetika és fenntarthatóság'];
const US_IP: Agazat[] = ['Mesterséges intelligencia és adatgazdaság', 'Elektronika és félvezetők', 'Biotechnológia és gyógyszeripar', 'Kvantumtechnológia', 'Űripar', 'Védelmi ipar'];
const HU_IP: Agazat[] = ['Mobilitás és autóipar', 'Biotechnológia és gyógyszeripar', 'Mesterséges intelligencia és adatgazdaság', 'IKT és digitalizáció', 'Energetika és fenntarthatóság', 'Agrár- és élelmiszeripar', 'Kvantumtechnológia', 'Űripar'];
const ip = listaMatrix(AGAZATOK, [
  { kod: 'JP', nev: 'Japán', elemek: JP_IP },
  { kod: 'DE', nev: 'Németország', elemek: DE_IP },
  { kod: 'KR', nev: 'Koreai Köztársaság', elemek: KR_IP },
  { kod: 'US', nev: 'Amerikai Egyesült Államok', elemek: US_IP },
], HU_IP);
assert.deepEqual(tomor(ip), [
  ['Mind a 4 országban', ['Mesterséges intelligencia és adatgazdaság', 'Elektronika és félvezetők', 'Kvantumtechnológia', 'Biotechnológia és gyógyszeripar', 'Űripar']],
  ['Részben közös', ['Energetika és fenntarthatóság', 'Mobilitás és autóipar']],
  ['Csak egy országban', ['Hidrogén és akkumulátor', 'Anyagtudomány', 'Védelmi ipar']],
  ['Csak Magyarország', ['IKT és digitalizáció', 'Agrár- és élelmiszeripar']],
]);
assert.equal(ip.osszegzes, '5 közös · 2 részben közös · 3 egyedi · Magyarországgal közös: 6');
assert.deepEqual(ip.csoportok[1].sorok[0], { elem: 'Energetika és fenntarthatóság', benne: [true, true, true, false], hazai: true });
assert.equal(ip.csoportok[0].sorok[1].hazai, false, 'Elektronika: Magyarországnál nincs');

const JP_PR: KfiPrioritas[] = ['Alapkutatási kiválóság', 'Digitalizáció és MI', 'Technológiai szuverenitás', 'Védelem és biztonság', 'Tehetség és mobilitás', 'Startup és vállalkozói ökoszisztéma', 'Energiabiztonság'];
const DE_PR: KfiPrioritas[] = ['Digitalizáció és MI', 'Technológiai szuverenitás', 'Zöld átállás és klímasemlegesség', 'Energiabiztonság', 'Egészség és élettudomány', 'Űr', 'Védelem és biztonság'];
const KR_PR: KfiPrioritas[] = ['Digitalizáció és MI', 'Technológiai szuverenitás', 'Zöld átállás és klímasemlegesség', 'Egészség és élettudomány', 'Regionális felzárkózás', 'Tehetség és mobilitás'];
const US_PR: KfiPrioritas[] = ['Digitalizáció és MI', 'Technológiai szuverenitás', 'Védelem és biztonság', 'Energiabiztonság', 'Űr', 'Egészség és élettudomány', 'Alapkutatási kiválóság', 'Ipar 4.0 és gyártás'];
const HU_PR: KfiPrioritas[] = ['Digitalizáció és MI', 'Zöld átállás és klímasemlegesség', 'Egészség és élettudomány', 'Védelem és biztonság', 'Űr'];
const prio = listaMatrix(KFI_PRIORITASOK, [
  { kod: 'JP', nev: 'Japán', elemek: JP_PR },
  { kod: 'DE', nev: 'Németország', elemek: DE_PR },
  { kod: 'KR', nev: 'Koreai Köztársaság', elemek: KR_PR },
  { kod: 'US', nev: 'Amerikai Egyesült Államok', elemek: US_PR },
], HU_PR);
assert.deepEqual(tomor(prio), [
  ['Mind a 4 országban', ['Digitalizáció és MI', 'Technológiai szuverenitás']],
  ['Részben közös', ['Egészség és élettudomány', 'Energiabiztonság', 'Védelem és biztonság', 'Zöld átállás és klímasemlegesség', 'Űr', 'Alapkutatási kiválóság', 'Tehetség és mobilitás']],
  ['Csak egy országban', ['Ipar 4.0 és gyártás', 'Startup és vállalkozói ökoszisztéma', 'Regionális felzárkózás']],
]);
assert.equal(prio.osszegzes, '2 közös · 7 részben közös · 3 egyedi · Magyarországgal közös: 5');

const JP_TAG: Tagsag[] = ['OECD', 'G7', 'G20'];
const DE_TAG: Tagsag[] = ['EU', 'OECD', 'NATO', 'G7', 'G20'];
const HU_TAG: Tagsag[] = ['EU', 'OECD', 'NATO'];
const tag = listaMatrix(TAGSAGOK, [
  { kod: 'JP', nev: 'Japán', elemek: JP_TAG },
  { kod: 'DE', nev: 'Németország', elemek: DE_TAG },
  { kod: 'KR', nev: 'Koreai Köztársaság', elemek: ['OECD', 'G20'] },
  { kod: 'US', nev: 'Amerikai Egyesült Államok', elemek: ['OECD', 'NATO', 'G7', 'G20'] },
], HU_TAG);
assert.deepEqual(tomor(tag), [
  ['Mind a 4 országban', ['OECD', 'G20']],
  ['Részben közös', ['G7', 'NATO']],
  ['Csak egy országban', ['EU']],
]);
assert.equal(tag.osszegzes, '2 közös · 2 részben közös · 1 egyedi · Magyarországgal közös: 3');

// --- 1 ország Magyarországgal szemben
const egy = listaMatrix(AGAZATOK, [{ kod: 'JP', nev: 'Japán', elemek: JP_IP }], HU_IP);
assert.deepEqual(tomor(egy), [
  ['Közös Magyarországgal', ['Mesterséges intelligencia és adatgazdaság', 'Kvantumtechnológia', 'Biotechnológia és gyógyszeripar', 'Energetika és fenntarthatóság', 'Űripar', 'Mobilitás és autóipar']],
  ['Csak Japán', ['Elektronika és félvezetők', 'Anyagtudomány']],
  ['Csak Magyarország', ['IKT és digitalizáció', 'Agrár- és élelmiszeripar']],
]);
assert.equal(egy.osszegzes, 'Magyarországgal közös: 6');

// --- Üres lista (Puerto Rico tagságai), magyar rekord nélkül, üres magyar lista, teljesen üres, ismeretlen elem, 0 oszlop
const uresOszlop = listaMatrix(TAGSAGOK, [
  { kod: 'JP', nev: 'Japán', elemek: JP_TAG },
  { kod: 'PR', nev: 'Puerto Rico', elemek: [] },
], HU_TAG);
assert.deepEqual(tomor(uresOszlop), [
  ['Csak egy országban', ['OECD', 'G7', 'G20']],
  ['Csak Magyarország', ['EU', 'NATO']],
]);
assert.equal(uresOszlop.osszegzes, '3 egyedi · Magyarországgal közös: 1 · nincs megadva: Puerto Rico');

const hazaiNelkul = listaMatrix(TAGSAGOK, [
  { kod: 'JP', nev: 'Japán', elemek: JP_TAG },
  { kod: 'DE', nev: 'Németország', elemek: DE_TAG },
], null);
assert.deepEqual(tomor(hazaiNelkul), [
  ['Mind a 2 országban', ['OECD', 'G7', 'G20']],
  ['Csak egy országban', ['EU', 'NATO']],
]);
assert.equal(hazaiNelkul.osszegzes, '3 közös · 2 egyedi');
assert.ok(hazaiNelkul.csoportok.every((cs) => cs.sorok.every((s) => !s.hazai)));

const hazaiUres = listaMatrix(TAGSAGOK, [{ kod: 'JP', nev: 'Japán', elemek: ['OECD'] }], []);
assert.deepEqual(tomor(hazaiUres), [['Csak Japán', ['OECD']]]);
assert.equal(hazaiUres.osszegzes, 'nincs megadva: Magyarország');

assert.deepEqual(listaMatrix(TAGSAGOK, [{ kod: 'PR', nev: 'Puerto Rico', elemek: [] }], []), { csoportok: [], osszegzes: '' });
assert.deepEqual(tomor(listaMatrix<string>(['a', 'b'], [{ kod: 'X', nev: 'X', elemek: ['c', 'b', 'a'] }], null)), [['Csak X', ['a', 'b', 'c']]]);
assert.deepEqual(tomor(listaMatrix(TAGSAGOK, [], HU_TAG)), [['Csak Magyarország', ['EU', 'OECD', 'NATO']]]);

console.log('ok');
```

- [ ] **Step 2: Futtasd – el kell buknia**

Run: `npx tsx scripts/_osszehasonlitas-proba.ts`
Expected: hiba, mert a `../lib/osszehasonlitas` modul még nincs meg (`Cannot find module` / `ERR_MODULE_NOT_FOUND`).

- [ ] **Step 3: `lib/osszehasonlitas.ts`**

```ts
/**
 * Az összehasonlítás (a térkép alatti panel) tiszta logikája: az országok színei és a halmaz
 * bővítése, a mutatókártyák sávjainak skálája és helye, és a listák (kiemelt iparágak,
 * KFI-prioritások, tagságok) mátrixa. Framework-mentes: React és DB nélkül.
 */
import { hazaiE } from './orszagok';
import { TERKEP_SZINEK } from './terkep-mutatok';

/**
 * Az összehasonlított országok színei (kék, narancs, lila, rózsa). A halmaz legnagyobb mérete
 * (`VS_MAX`) ebből adódik. Fehér alapon mind legalább 4,5:1, a kis kódfeliratokhoz is.
 */
export const VS_SZINEK = ['#2563eb', '#c2410c', '#9333ea', '#be185d'] as const;
/** Magyarország (a viszonyítási alap) jelölője, rombusza és kártyacsíkja: a térkép kontúrszíne. */
export const HAZAI_SZIN = TERKEP_SZINEK.kontur;
/** A magyar sáv: semleges szürke, a `bg-muted` sávháttérrel kb. 3,4:1 (grafikus elemnél legalább 3:1 kell). */
export const HAZAI_SAV_SZIN = '#7b8494';

/** Az összehasonlítás-halmaz egy eleme: az ország és a színe (`VS_SZINEK`-index). */
export interface VsElem {
  kod: string;
  szin: number;
}

/**
 * Hozzáadás a halmazhoz a legkisebb szabad színnel; a többi elem színe nem változik. Ugyanazt a
 * példányt adja vissza Magyarországnál (mindig viszonyítási alap, a halmazba nem kerül), a már
 * benne lévőnél és a tele (`VS_SZINEK.length` elemű) halmaznál.
 */
export function vsHozzaadElem(v: readonly VsElem[], kod: string): readonly VsElem[] {
  if (hazaiE(kod) || v.some((e) => e.kod === kod) || v.length >= VS_SZINEK.length) return v;
  let szin = 0;
  while (v.some((e) => e.szin === szin)) szin++;
  return [...v, { kod, szin }];
}

/** Egy mutató sávjainak közös skálája; mindig tartalmazza a nullát. */
export interface SavSkala {
  also: number;
  felso: number;
}

/**
 * A mutató közös sáv-skálája: `[min(0, értékek), max(0, felsoHatar, értékek)]`. Nulláról indul,
 * hogy a sáv hossza arányos legyen (negatív értéknél a nulla a skála belsejébe kerül); a
 * `felsoHatar` rögzített maximumot ad (a kitöltöttség 9 blokkja). `null`, ha egyik értéknek sincs
 * értéke.
 */
export function savSkala(ertekek: readonly (number | null)[], felsoHatar?: number): SavSkala | null {
  const szamok = ertekek.filter((v): v is number => v !== null);
  if (szamok.length === 0) return null;
  return { also: Math.min(0, ...szamok), felso: Math.max(0, felsoHatar ?? 0, ...szamok) };
}

/** Az érték helye a skálán 0 és 1 között; üres terjedelemnél (`also === felso`, pl. csupa 0) 0. */
export function skalaHely(v: number, s: SavSkala): number {
  return s.felso === s.also ? 0 : (v - s.also) / (s.felso - s.also);
}

/** A sáv a nulla helyétől az érték helyéig tart (negatív értéknél balra); `bal` és `szel` 0 és 1 között. */
export function savHelye(v: number, s: SavSkala): { bal: number; szel: number } {
  const nulla = skalaHely(0, s);
  const ertek = skalaHely(v, s);
  return { bal: Math.min(nulla, ertek), szel: Math.abs(ertek - nulla) };
}

/** A nullavonal helye, ha a skála negatívba nyúlik; különben `null` (a sávok a bal szélről indulnak). */
export function nullaVonal(s: SavSkala): number | null {
  return s.also < 0 ? skalaHely(0, s) : null;
}

/** A mátrix egy oszlopa: egy kiválasztott ország listája. */
export interface ListaOszlop<T extends string> {
  kod: string;
  /** A teljes név: az 1 országos „Csak <név>” csoport és a „nincs megadva” felsorolás használja. */
  nev: string;
  elemek: readonly T[];
}

export interface ListaSor<T extends string> {
  elem: T;
  /** Oszloponként (az `oszlopok` sorrendjében): szerepel-e az elem az ország listájában. */
  benne: boolean[];
  /** Szerepel-e a magyar listában (magyar rekord nélkül mindig `false`). */
  hazai: boolean;
}

export interface ListaCsoport<T extends string> {
  cimke: string;
  sorok: ListaSor<T>[];
}

export interface ListaMatrixAdat<T extends string> {
  /** Az üres csoportok nélkül; ha egyik listának sincs eleme, üres. */
  csoportok: ListaCsoport<T>[];
  /** Az összegző sor a nulla darabszámú részek nélkül; üres mátrixnál üres string. */
  osszegzes: string;
}

/**
 * Egy lista mátrixa: a kiválasztott országok (`oszlopok`) és Magyarország (`hazai`; `null` = nincs
 * magyar rekord) elemeinek uniója, elemenként egy sor, csoportosítva. Csoporton belül a szótár
 * (`sorrend`) sorrendje; a szótárban nem szereplő elem a csoport végére kerül (a normalizálás után nem
 * fordulhat elő).
 * - 2+ oszlopnál: „Mind a N országban” (N legfeljebb 4, ezért a névelő mindig „a”), „Részben közös”
 *   (előbb a több országban szereplők), „Csak egy országban”, „Csak Magyarország”;
 * - 1 oszlopnál: „Közös Magyarországgal”, „Csak <név>” (alanyesetben, mint a „Csak Magyarország”: a
 *   helyhatározó rag országonként rendhagyó), „Csak Magyarország”.
 * Az üres listájú ország is oszlop (a „Mind a N” így rá is vonatkozik); az összegző sor „nincs
 * megadva” része nevezi meg, mert az adatból nem dönthető el, hogy nincs eleme, vagy nincs kitöltve.
 */
export function listaMatrix<T extends string>(
  sorrend: readonly T[],
  oszlopok: readonly ListaOszlop<T>[],
  hazai: readonly T[] | null,
): ListaMatrixAdat<T> {
  const hazaiHalmaz = new Set<T>(hazai ?? []);
  const hely = (e: T) => {
    const i = sorrend.indexOf(e);
    return i === -1 ? sorrend.length : i;
  };
  const sorok: ListaSor<T>[] = [...new Set<T>([...oszlopok.flatMap((o) => o.elemek), ...hazaiHalmaz])]
    .sort((a, b) => hely(a) - hely(b))
    .map((elem) => ({ elem, benne: oszlopok.map((o) => o.elemek.includes(elem)), hazai: hazaiHalmaz.has(elem) }));
  if (sorok.length === 0) return { csoportok: [], osszegzes: '' };
  const n = oszlopok.length;
  // Oszlop nélkül a panel nem látszik; ha mégis így hívnák, csak a magyar lista marad.
  if (n === 0) return { csoportok: [{ cimke: 'Csak Magyarország', sorok }], osszegzes: '' };

  const db = (s: ListaSor<T>) => s.benne.filter(Boolean).length;
  const reszek: string[] = [];
  let csoportok: ListaCsoport<T>[];
  if (n >= 2) {
    const mind = sorok.filter((s) => db(s) === n);
    // A rendezés stabil: azonos darabszámon belül a szótár sorrendje marad.
    const reszben = sorok.filter((s) => db(s) > 1 && db(s) < n).sort((a, b) => db(b) - db(a));
    const egy = sorok.filter((s) => db(s) === 1);
    csoportok = [
      { cimke: `Mind a ${n} országban`, sorok: mind },
      { cimke: 'Részben közös', sorok: reszben },
      { cimke: 'Csak egy országban', sorok: egy },
      { cimke: 'Csak Magyarország', sorok: sorok.filter((s) => db(s) === 0) },
    ];
    if (mind.length > 0) reszek.push(`${mind.length} közös`);
    if (reszben.length > 0) reszek.push(`${reszben.length} részben közös`);
    if (egy.length > 0) reszek.push(`${egy.length} egyedi`);
  } else {
    csoportok = [
      { cimke: 'Közös Magyarországgal', sorok: sorok.filter((s) => s.benne[0] && s.hazai) },
      { cimke: `Csak ${oszlopok[0].nev}`, sorok: sorok.filter((s) => s.benne[0] && !s.hazai) },
      { cimke: 'Csak Magyarország', sorok: sorok.filter((s) => !s.benne[0]) },
    ];
  }
  if (hazai !== null && hazai.length > 0) {
    reszek.push(`Magyarországgal közös: ${sorok.filter((s) => s.hazai && db(s) > 0).length}`);
  }
  const uresek = oszlopok.filter((o) => o.elemek.length === 0).map((o) => o.nev);
  if (hazai !== null && hazai.length === 0) uresek.push('Magyarország');
  if (uresek.length > 0) reszek.push(`nincs megadva: ${uresek.join(', ')}`);
  return { csoportok: csoportok.filter((cs) => cs.sorok.length > 0), osszegzes: reszek.join(' · ') };
}
```

- [ ] **Step 4: `felsoHatar` a `lib/terkep-mutatok.ts`-ben**

A `SzamMutato` interfészben ezt:

```ts
  skala: 'linearis' | 'log';
  ertek: (o: TerkepOrszag) => number | null;
}
```

cseréld erre:

```ts
  skala: 'linearis' | 'log';
  /**
   * Az összehasonlítás sávjainak rögzített felső határa (a kitöltöttségnél a blokkok száma, hogy a
   * 9/9 teli sáv legyen); nélküle a megjelenített értékek legnagyobbika.
   */
  felsoHatar?: number;
  ertek: (o: TerkepOrszag) => number | null;
}
```

A `MUTATO_TABLA` `kitoltottseg` bejegyzésében ezt:

```ts
    kulcs: 'kitoltottseg', tipus: 'szam', cimke: 'Kitöltöttség (mentett blokk)', utotag: `/${BLOKK_KULCSOK.length}`, skala: 'linearis',
    ertek: (o) => (o.allapot === 'nincs' ? null : o.mentettDb),
```

cseréld erre:

```ts
    kulcs: 'kitoltottseg', tipus: 'szam', cimke: 'Kitöltöttség (mentett blokk)', utotag: `/${BLOKK_KULCSOK.length}`, skala: 'linearis',
    felsoHatar: BLOKK_KULCSOK.length,
    ertek: (o) => (o.allapot === 'nincs' ? null : o.mentettDb),
```

- [ ] **Step 5: Futtasd újra – most át kell mennie**

Run: `npx tsx scripts/_osszehasonlitas-proba.ts`
Expected: `ok`

- [ ] **Step 6: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: kimenet nélkül, 0-s kilépési kód. A script is benne van a projektben, neki is fordulnia kell.

- [ ] **Step 7: A script törlése és a commit**

```bash
rm scripts/_osszehasonlitas-proba.ts
git add lib/osszehasonlitas.ts lib/terkep-mutatok.ts
git commit -m "feat(terkep): az összehasonlítás tiszta logikája – országszínek, sáv-skála, listamátrix"
```

(A commit-üzenet végére a `Co-Authored-By` sor, lásd a közös szabályokat.) Ha egy reviewer vagy egy későbbi javítás a `lib/osszehasonlitas.ts`-hez nyúl, a scriptet az 1. lépés kódjából újra létre kell hozni, futtatni, majd törölni.

---

### Task 2: Állapot – stabil országszínek, `vsMin`, Magyarország kizárása

**Files:**
- Modify: `app/(app)/terkep/components/useTerkepAllapot.ts` (teljes új tartalom)
- Modify: `app/(app)/terkep/components/OsszehasonlitasCsik.tsx` (teljes új tartalom)
- Modify: `app/(app)/terkep/components/TerkepNezet.tsx` (4 csere)
- Modify: `app/(app)/terkep/components/TerkepPanel.tsx` (2 csere)
- Modify: `app/(app)/terkep/components/RangsorPanel.tsx` (2 csere)
- Modify: `app/(app)/terkep/components/ProfilKivonat.tsx` (2 csere)

A régi `OsszehasonlitasPanel` (táblázat) ebben a taskban még marad. Magyar profil mellett 1 országtól is megjelenik; ezt a köztes állapotot a 3. task cseréli le.

- [ ] **Step 1: `useTerkepAllapot.ts` teljes új tartalma**

```ts
'use client';

import { useCallback, useMemo, useState } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { hazaiE } from '../../../../lib/orszagok';
import { VS_SZINEK, vsHozzaadElem, type VsElem } from '../../../../lib/osszehasonlitas';
import { ALAP_MUTATO, mutatoByKulcs, type Mutato, type MutatoKulcs } from '../../../../lib/terkep-mutatok';

/** Legfeljebb ennyi ország lehet az összehasonlításban: ahány színe van (`VS_SZINEK`). */
export const VS_MAX = VS_SZINEK.length;

export interface TerkepAllapot {
  /** Egyes kijelölés (a kivonat országa). */
  kod: string | null;
  /**
   * Összehasonlítás-halmaz a hozzáadás sorrendjében, Magyarország nélkül (az mindig viszonyítási
   * alap). Csak tényleges változásnál új példány (a hívó memói erre épülnek); ne mutáld.
   */
  vs: readonly string[];
  /** Kód → az ország színe az összehasonlításban (`VS_SZINEK`); amíg az ország a halmazban van, nem változik. */
  vsSzinek: Readonly<Record<string, string>>;
  /** Ennyi országtól látszik az összehasonlítás: 1, ha van magyar rekord (viszonyítási alap), különben 2. */
  vsMin: number;
  /** `vs.length >= VS_MAX` – a hozzáadás-gombok letiltásához. */
  vsTele: boolean;
  mutato: Mutato;
  /** Iparág-szűrő, '' = nincs. */
  iparag: string;
  kivalaszt: (kod: string) => void;
  bezar: () => void;
  setMutatoKulcs: (k: string) => void;
  setIparag: (i: string) => void;
  vsHozzaad: (kod: string) => void;
  vsKivesz: (kod: string) => void;
  /** Hozzáad, ha nincs benne (és van hely); kivesz, ha benne van – a „+"/pipa gombok művelete. */
  vsValt: (kod: string) => void;
  vsTorol: () => void;
}

/**
 * A térkép-oldal kliens-állapota. A jobb panel a hívóban: `kod` → kivonat, különben rangsor; az
 * összehasonlítás a térkép alatt jelenik meg, ha `vs.length >= vsMin`. Évváltáskor (új `adatok`) a nem
 * létező kijelölés és halmaz-elemek render közben kikerülnek (a kieső ország színe felszabadul), a
 * `?o=` (kezdoKod) változására a kijelölés frissül, a többi állapot marad – ez a React „prop
 * változásra állapot igazítása" mintája, ezért a page NEM ad `key`-t a nézetnek. A visszaadott
 * objektum renderenként új (nem memoizálható).
 */
export function useTerkepAllapot(adatok: TerkepOrszag[], kezdoKod: string | null): TerkepAllapot {
  const letezik = (k: string) => adatok.some((o) => o.kod === k);
  const [kod, setKod] = useState<string | null>(() => (kezdoKod && letezik(kezdoKod) ? kezdoKod : null));
  // Az összehasonlítás-halmaz: az ország és a színe; kifelé a `vs` kódlista és a `vsSzinek` térkép.
  const [vsElemek, setVsElemek] = useState<readonly VsElem[]>([]);
  const [mutatoKulcs, setMutatoKulcsState] = useState<MutatoKulcs>(ALAP_MUTATO);
  const [iparag, setIparag] = useState('');

  // Új `?o=` ugyanezen a route-on belül: a kijelölés a kezdő kódra vált; ha a paraméter eltűnik
  // vagy olyan országra mutat, ami nincs az adatokban, a meglévő kijelölés szándékosan marad.
  // `ujKod`: ha ebben a passban épp a kezdő kódra váltunk, a lenti „nem létező kijelölés" őrző már
  // az új értéket nézze, ne a záródásban maradt régit (különben `setKod(null)` felülírná).
  const [elozoKezdo, setElozoKezdo] = useState(kezdoKod);
  let ujKod = kod;
  if (kezdoKod !== elozoKezdo) {
    setElozoKezdo(kezdoKod);
    if (kezdoKod && letezik(kezdoKod)) {
      setKod(kezdoKod);
      ujKod = kezdoKod;
    }
  }
  if (ujKod && !letezik(ujKod)) setKod(null);
  const vsElo = vsElemek.filter((e) => letezik(e.kod));
  if (vsElo.length !== vsElemek.length) setVsElemek(vsElo);

  const vs = useMemo(() => vsElemek.map((e) => e.kod), [vsElemek]);
  const vsSzinek = useMemo(
    () => Object.fromEntries(vsElemek.map((e) => [e.kod, VS_SZINEK[e.szin]])),
    [vsElemek],
  );

  const kivalaszt = useCallback((k: string) => setKod(k), []);
  const bezar = useCallback(() => setKod(null), []);
  const setMutatoKulcs = useCallback((k: string) => setMutatoKulcsState(mutatoByKulcs(k).kulcs), []);
  const vsHozzaad = useCallback((k: string) => setVsElemek((v) => vsHozzaadElem(v, k)), []);
  const vsKivesz = useCallback((k: string) => setVsElemek((v) => v.filter((e) => e.kod !== k)), []);
  const vsValt = useCallback(
    (k: string) => setVsElemek((v) => (v.some((e) => e.kod === k) ? v.filter((e) => e.kod !== k) : vsHozzaadElem(v, k))),
    [],
  );
  const vsTorol = useCallback(() => setVsElemek([]), []);

  return {
    kod, vs, vsSzinek, vsMin: adatok.some((o) => hazaiE(o.kod)) ? 1 : 2, vsTele: vs.length >= VS_MAX,
    mutato: mutatoByKulcs(mutatoKulcs), iparag,
    kivalaszt, bezar, setMutatoKulcs, setIparag, vsHozzaad, vsKivesz, vsValt, vsTorol,
  };
}
```

A `vs` és a `vsSzinek` `useMemo`-val stabil példány, a `TerkepNezet` memói (`vsOrszagok`, `jeloltLista`) erre épülnek. A render közbeni takarítás (`vsElo`) most a párokon fut, így a kieső ország színe felszabadul.

- [ ] **Step 2: `OsszehasonlitasCsik.tsx` teljes új tartalma**

```tsx
'use client';

import { X } from 'lucide-react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { Badge } from '../../../../components/ui/badge';
import { VS_MAX } from './useTerkepAllapot';

/**
 * A panel tetején: az összehasonlítás-halmaz chipjei az országok színével (a térkép mellett ez a
 * jelmagyarázat) és egy állapotszöveg. Az összehasonlítás magától megjelenik a térkép alatt, amint
 * `minimum` ország van a halmazban, ezért itt nincs gomb.
 */
export function OsszehasonlitasCsik({ orszagok, szinek, minimum, onKivesz }: {
  /** A halmaz rekordjai a hozzáadás sorrendjében. */
  orszagok: TerkepOrszag[];
  /** Kód → az ország színe az összehasonlításban. */
  szinek: Readonly<Record<string, string>>;
  /** Ennyi országtól látszik az összehasonlítás (`TerkepAllapot.vsMin`: magyar profil mellett 1, különben 2). */
  minimum: number;
  onKivesz: (kod: string) => void;
}) {
  const tele = orszagok.length >= VS_MAX;
  // A „+" gombok letiltva, ha tele; a letiltott gombon a title nem jelenik meg, ezért itt a felirat.
  const allapot = tele
    ? `Legfeljebb ${VS_MAX} ország`
    : orszagok.length < minimum
      ? 'Válassz még egy országot'
      : 'Az összehasonlítás a térkép alatt';
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border bg-muted/40 px-2.5 py-2 text-xs">
      <span className="text-muted-foreground">Összehasonlítás:</span>
      {orszagok.map((o) => (
        // h-6 + overflow-visible: a Badge alapból h-5 és overflow-hidden, ami levágná a gomb fókuszgyűrűjét.
        <Badge key={o.kod} variant="outline" className="h-6 gap-1 overflow-visible bg-background pr-1">
          {/* Inline style szándékosan: a szín az összehasonlítás palettájából jön (VS_SZINEK). */}
          <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: szinek[o.kod] }} />
          {o.nev}
          <button
            type="button"
            className="rounded-full p-0.5 outline-none hover:bg-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label={`${o.nev} kivétele`}
            onClick={() => onKivesz(o.kod)}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <span className="ml-auto text-muted-foreground">{allapot}</span>
    </div>
  );
}
```

- [ ] **Step 3: `TerkepNezet.tsx`**

(1) Import – ezt:

```tsx
import { elsoVezetettKod } from '../../../../lib/attase-orszag';

```

cseréld erre:

```tsx
import { elsoVezetettKod } from '../../../../lib/attase-orszag';
import { HAZAI_KOD } from '../../../../lib/orszagok';

```

(2) Ezt:

```tsx
import { useTerkepAllapot, VS_MIN } from './useTerkepAllapot';
```

cseréld erre:

```tsx
import { useTerkepAllapot } from './useTerkepAllapot';
```

(3) A jelöltlista – ezt:

```tsx
  const jeloltLista = useMemo(() => jeloltek(adatok, vs, mutato), [adatok, vs, mutato]);
```

cseréld erre:

```tsx
  // Magyarország mindig viszonyítási alap, ezért a „+ Ország" jelöltjei között sincs.
  const jeloltLista = useMemo(() => jeloltek(adatok, [...vs, HAZAI_KOD], mutato), [adatok, vs, mutato]);
```

(4) A panel feltétele – ezt:

```tsx
      {/* Az összehasonlító tábla a térkép alatt, teljes szélességben: 2–4 oszlop a keskeny panelen nem férne el. */}
      {vsOrszagok.length >= VS_MIN && (
```

cseréld erre:

```tsx
      {/* Az összehasonlítás a térkép alatt, teljes szélességben: a keskeny panelen nem férne el. Magyar
          profil mellett (viszonyítási alap) már 1 országtól látszik (`vsMin`). */}
      {vsOrszagok.length >= allapot.vsMin && (
```

- [ ] **Step 4: `TerkepPanel.tsx`**

(1) A doc-komment vége – ezt:

```tsx
 * halmaz nem üres. Az összehasonlító tábla nem itt, hanem a térkép alatt, teljes szélességben van
 * (TerkepNezet): 2–4 oszlop a keskeny panelen nem fér el.
```

cseréld erre:

```tsx
 * halmaz nem üres. Az összehasonlítás nem itt, hanem a térkép alatt, teljes szélességben van
 * (TerkepNezet): a kártyák és a mátrixok a keskeny panelen nem férnének el.
```

(2) A csík – ezt:

```tsx
      {vsOrszagok.length > 0 && <OsszehasonlitasCsik orszagok={vsOrszagok} onKivesz={allapot.vsKivesz} />}
```

cseréld erre:

```tsx
      {vsOrszagok.length > 0 && (
        <OsszehasonlitasCsik orszagok={vsOrszagok} szinek={allapot.vsSzinek} minimum={allapot.vsMin} onKivesz={allapot.vsKivesz} />
      )}
```

- [ ] **Step 5: `RangsorPanel.tsx`**

(1) Import – ezt:

```tsx
import { formatSzam } from '../../../../lib/szam';
```

cseréld erre:

```tsx
import { hazaiE } from '../../../../lib/orszagok';
import { formatSzam } from '../../../../lib/szam';
```

(2) Az `OrszagSor` gombja – ezt:

```tsx
        {/* Letiltott gombon a title nem jelenne meg (natív disabled + pointer-events-none); a korlátot az OsszehasonlitasCsik írja ki. */}
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={benne ? `${o.nev} kivétele az összehasonlításból` : `${o.nev} hozzáadása az összehasonlításhoz`}
          disabled={!benne && vsTele}
          onClick={() => onVsToggle(o.kod)}
        >
          {benne ? <Check /> : <Plus />}
        </Button>
```

cseréld erre:

```tsx
        {/* Magyarország mindig viszonyítási alap, a halmazba nem vehető fel: a gomb helyén azonos méretű
            helykitöltő tartja az igazítást. Letiltott gombon a title nem jelenne meg (natív disabled +
            pointer-events-none); a korlátot az OsszehasonlitasCsik írja ki. */}
        {hazaiE(o.kod) ? (
          <span aria-hidden className="size-6 shrink-0" />
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={benne ? `${o.nev} kivétele az összehasonlításból` : `${o.nev} hozzáadása az összehasonlításhoz`}
            disabled={!benne && vsTele}
            onClick={() => onVsToggle(o.kod)}
          >
            {benne ? <Check /> : <Plus />}
          </Button>
        )}
```

A `size-6` megegyezik a `Button` `icon-xs` méretével (`components/ui/button.tsx`), így a sor igazítása nem változik.

- [ ] **Step 6: `ProfilKivonat.tsx`**

(1) Import – ezt:

```tsx
import { BLOKK_KULCSOK, MEZO_CIMKEK } from '../../../../lib/orszagprofil-szotar';
```

cseréld erre:

```tsx
import { hazaiE } from '../../../../lib/orszagok';
import { BLOKK_KULCSOK, MEZO_CIMKEK } from '../../../../lib/orszagprofil-szotar';
```

(2) A lábléc gombja – ezt:

```tsx
        {/* Letiltott gombon a title nem jelenik meg (natív disabled + pointer-events-none); a korlátot az OsszehasonlitasCsik írja ki. */}
        <Button
          type="button"
          variant="outline"
          disabled={!benneVs && vsTele}
          onClick={onVs}
        >
          {benneVs ? <><Check /> Összehasonlításban</> : <><Plus /> Összehasonlítás</>}
        </Button>
```

cseréld erre:

```tsx
        {/* Magyarország mindig viszonyítási alap, a halmazba nem vehető fel. Letiltott gombon a title nem
            jelenik meg (natív disabled + pointer-events-none); a korlátot az OsszehasonlitasCsik írja ki. */}
        {hazaiE(o.kod) ? (
          <span className="text-xs text-muted-foreground">Az összehasonlításban mindig szerepel viszonyítási alapként.</span>
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled={!benneVs && vsTele}
            onClick={onVs}
          >
            {benneVs ? <><Check /> Összehasonlításban</> : <><Plus /> Összehasonlítás</>}
          </Button>
        )}
```

- [ ] **Step 7: Ellenőrzés**

Run: `grep -rn "VS_MIN" app lib components`
Expected: nincs találat.

Run: `npx tsc --noEmit`
Expected: kimenet nélkül, 0-s kilépési kód.

Run: `npm run build`
Expected: `✓ Compiled successfully`, a route-listában `ƒ /terkep`, hiba nélkül.

- [ ] **Step 8: Commit**

```bash
git add "app/(app)/terkep/components/useTerkepAllapot.ts" "app/(app)/terkep/components/OsszehasonlitasCsik.tsx" "app/(app)/terkep/components/TerkepNezet.tsx" "app/(app)/terkep/components/TerkepPanel.tsx" "app/(app)/terkep/components/RangsorPanel.tsx" "app/(app)/terkep/components/ProfilKivonat.tsx"
git commit -m "feat(terkep): stabil országszínek az összehasonlításban, Magyarország nem vehető fel, magyar profil mellett 1 országtól"
```

---

### Task 3: Magyar viszonyítási alap, országfejléc, mutatókártyák, új panel-keret

A 2. task minőségi reviewja nyomán ez a task kiegészült:
- a „van-e magyar viszonyítási alap” egy helyen dől el (`hazaiRekord`: csak a profillal rendelkező magyar rekord számít);
- a hook kiadja a `hazai` mezőt, és a `vsMin` ebből számol;
- a `vsKivesz` és a `vsTorol` változás nélkül ugyanazt a példányt adja vissza;
- a `TerkepPanel` egy elavult kommentje is javul.

**Files:**
- Modify: `lib/osszehasonlitas.ts` (2 csere: `hazaiRekord`)
- Modify: `app/(app)/terkep/components/useTerkepAllapot.ts` (5 csere)
- Create: `app/(app)/terkep/components/MutatoKartya.tsx`
- Create: `app/(app)/terkep/components/OsszehasonlitasFejlec.tsx`
- Modify: `app/(app)/terkep/components/OsszehasonlitasPanel.tsx` (teljes új tartalom; a „Listák” szakasz a 4. taskban jön)
- Modify: `app/(app)/terkep/components/TerkepNezet.tsx` (1 csere)
- Modify: `app/(app)/terkep/components/TerkepPanel.tsx` (1 csere, komment)
- Ideiglenes: `scripts/_osszehasonlitas-proba.ts` (az ellenőrzés után törlendő)

- [ ] **Step 1: `hazaiRekord` a `lib/osszehasonlitas.ts`-ben**

(1) A fejléc-komment vége és az importok – ezt:

```ts
 * KFI-prioritások, tagságok) mátrixa. Framework-mentes: React és DB nélkül.
 */
import { hazaiE } from './orszagok';
import { TERKEP_SZINEK } from './terkep-mutatok';
```

cseréld erre:

```ts
 * KFI-prioritások, tagságok) mátrixa. Framework-mentes: React és DB nélkül (a `TerkepOrszag` csak
 * típusként jön a server-only query-modulból).
 */
import type { TerkepOrszag } from '../db/queries/orszagprofil';
import { hazaiE } from './orszagok';
import { TERKEP_SZINEK } from './terkep-mutatok';
```

(2) A `VsElem` elé – ezt:

```ts
/** Az összehasonlítás-halmaz egy eleme: az ország és a színe (`VS_SZINEK`-index). */
```

cseréld erre:

```ts
/**
 * Magyarország rekordja, ha van profilja legfeljebb a nézett évig: az összehasonlítás állandó
 * viszonyítási alapja. Attasé-hozzárendelés miatt profil nélkül is szerepelhet az adatokban
 * (`ev === null`) – akkor nincs viszonyítási alap.
 */
export function hazaiRekord(adatok: readonly TerkepOrszag[]): TerkepOrszag | null {
  return adatok.find((o) => hazaiE(o.kod) && o.ev !== null) ?? null;
}

/** Az összehasonlítás-halmaz egy eleme: az ország és a színe (`VS_SZINEK`-index). */
```

- [ ] **Step 2: `useTerkepAllapot.ts`**

(1) Import – ezt:

```ts
import { hazaiE } from '../../../../lib/orszagok';
import { VS_SZINEK, vsHozzaadElem, type VsElem } from '../../../../lib/osszehasonlitas';
```

cseréld erre:

```ts
import { hazaiRekord, VS_SZINEK, vsHozzaadElem, type VsElem } from '../../../../lib/osszehasonlitas';
```

(2) A `hazai` mező – ezt:

```ts
  /** Ennyi országtól látszik az összehasonlítás: 1, ha van magyar rekord (viszonyítási alap), különben 2. */
  vsMin: number;
```

cseréld erre:

```ts
  /** Magyarország rekordja, ha van profilja a nézett évre (`hazaiRekord`): az összehasonlítás viszonyítási alapja. */
  hazai: TerkepOrszag | null;
  /** Ennyi országtól látszik az összehasonlítás: 1, ha van magyar viszonyítási alap (`hazai`), különben 2. */
  vsMin: number;
```

(3) A műveletek doc-kommentjei – ezt:

```ts
  vsHozzaad: (kod: string) => void;
  vsKivesz: (kod: string) => void;
  /** Hozzáad, ha nincs benne (és van hely); kivesz, ha benne van – a „+"/pipa gombok művelete. */
  vsValt: (kod: string) => void;
```

cseréld erre:

```ts
  /** Hozzáadás a legkisebb szabad színnel; Magyarországra, a már benne lévőre és tele halmazra nem csinál semmit (`vsHozzaadElem`). */
  vsHozzaad: (kod: string) => void;
  /** Kivétel; a többi ország színe marad. Ha az ország nincs benne, nem csinál semmit. */
  vsKivesz: (kod: string) => void;
  /** Hozzáad, ha nincs benne (és van hely); kivesz, ha benne van – a „+"/pipa gombok művelete. Magyarországra nem csinál semmit. */
  vsValt: (kod: string) => void;
```

(4) A `vsKivesz` – ezt:

```ts
  const vsKivesz = useCallback((k: string) => setVsElemek((v) => v.filter((e) => e.kod !== k)), []);
```

cseréld erre:

```ts
  const vsKivesz = useCallback(
    (k: string) => setVsElemek((v) => (v.some((e) => e.kod === k) ? v.filter((e) => e.kod !== k) : v)),
    [],
  );
```

(5) A `vsTorol` és a visszatérési érték – ezt:

```ts
  const vsTorol = useCallback(() => setVsElemek([]), []);

  return {
    kod, vs, vsSzinek, vsMin: adatok.some((o) => hazaiE(o.kod)) ? 1 : 2, vsTele: vs.length >= VS_MAX,
```

cseréld erre:

```ts
  // Üres halmaznál ugyanaz a példány marad: a `vs` csak tényleges változásnál új.
  const vsTorol = useCallback(() => setVsElemek((v) => (v.length === 0 ? v : [])), []);

  const hazai = hazaiRekord(adatok);
  return {
    kod, vs, vsSzinek, hazai, vsMin: hazai ? 1 : 2, vsTele: vs.length >= VS_MAX,
```

- [ ] **Step 3: `MutatoKartya.tsx`**

```tsx
'use client';

import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import {
  HAZAI_SAV_SZIN, HAZAI_SZIN, nullaVonal, savHelye, savSkala, skalaHely, type SavSkala,
} from '../../../../lib/osszehasonlitas';
import { formatSzam } from '../../../../lib/szam';
import { SKALA_SZINEK, type SzamMutato } from '../../../../lib/terkep-mutatok';

/** A térkép mutatójának kártyája: a skála legvilágosabb színe (mint a kivonat mutató-sora). */
const KIEMELT_HATTER = SKALA_SZINEK[0];

/** Egy sáv a sávháttéren; a helyek 0 és 1 közöttiek, a nem nulla érték sávja legalább 2 px. */
function Sav({ v, skala, szin, nulla, jelolo }: {
  v: number | null;
  skala: SavSkala;
  szin: string;
  /** A nullavonal helye, ha a skála negatívba nyúlik. */
  nulla: number | null;
  /** Magyarország szintje a jelölőhöz; `null` = nincs jelölő. */
  jelolo: number | null;
}) {
  const s = v === null || v === 0 ? null : savHelye(v, skala);
  // Inline style szándékosan: a hely a skálából számolt, a szín az ország színe.
  return (
    <span aria-hidden className="relative mt-1 block h-2 rounded-sm bg-muted">
      {s && (
        <span
          className="absolute inset-y-0 rounded-sm"
          style={{ left: `${s.bal * 100}%`, width: `${s.szel * 100}%`, minWidth: 2, background: szin }}
        />
      )}
      {nulla !== null && (
        <span className="absolute -inset-y-0.5 w-px bg-muted-foreground/60" style={{ left: `${nulla * 100}%` }} />
      )}
      {jelolo !== null && (
        <span
          className="absolute -inset-y-1 w-0.5 -translate-x-1/2 rounded-full"
          style={{ left: `${jelolo * 100}%`, background: HAZAI_SZIN }}
        />
      )}
    </span>
  );
}

/**
 * Egy számszerű mutató az összehasonlításban: országonként egy sáv közös, nulláról induló skálán (a
 * kiválasztottak és Magyarország értékeiből, a mutató `felsoHatar`-ával), a halmaz sorrendjében – így
 * minden kártyán ugyanott áll az ország. Kétsoros sorok, mint a RangsorPanel-en: fent a név és az
 * érték, alatta a sáv. Alul Magyarország szürke sávja; a fekete jelölő minden ország sávján a magyar
 * szintet mutatja.
 */
export function MutatoKartya({ mutato, orszagok, szinek, hazai, kiemelt }: {
  mutato: SzamMutato;
  /** A halmaz rekordjai a hozzáadás sorrendjében (Magyarország nélkül). */
  orszagok: readonly TerkepOrszag[];
  /** Kód → az ország színe az összehasonlításban. */
  szinek: Readonly<Record<string, string>>;
  /** A magyar rekord (viszonyítási alap); `null`, ha nincs a nézett évre. */
  hazai: TerkepOrszag | null;
  /** Ez a térkép mutatója: a kártya kiemelt hátteret kap. */
  kiemelt: boolean;
}) {
  const hazaiErtek = hazai ? mutato.ertek(hazai) : null;
  const skala = savSkala([...orszagok.map((o) => mutato.ertek(o)), hazaiErtek], mutato.felsoHatar);
  const nulla = skala && nullaVonal(skala);
  const jelolo = skala && hazaiErtek !== null ? skalaHely(hazaiErtek, skala) : null;
  return (
    // Inline style szándékosan: a kiemelés színe a térkép skálájából jön.
    <section
      className="flex flex-col gap-2 rounded-lg border p-3"
      style={kiemelt ? { background: KIEMELT_HATTER } : undefined}
    >
      <h3 className="flex flex-wrap items-baseline gap-x-2 text-sm font-medium">
        {mutato.cimke}
        {kiemelt && <span className="text-xs font-normal text-muted-foreground">a térkép mutatója</span>}
      </h3>
      {skala === null ? (
        <p className="text-sm text-muted-foreground">Nincs adat.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {orszagok.map((o) => {
            const v = mutato.ertek(o);
            return (
              <li key={o.kod}>
                <span className="flex items-baseline gap-2 text-xs">
                  <span className="min-w-0 flex-1 truncate" title={o.nev}>{o.nev}</span>
                  <span className="shrink-0 font-mono">{formatSzam(v, mutato.utotag)}</span>
                </span>
                <Sav v={v} skala={skala} szin={szinek[o.kod]} nulla={nulla} jelolo={jelolo} />
              </li>
            );
          })}
          {hazai && (
            <li className="mt-1 border-t border-dashed pt-2 text-muted-foreground">
              <span className="flex items-baseline gap-2 text-xs">
                <span className="min-w-0 flex-1 truncate">
                  Magyarország<span className="sr-only"> (viszonyítási alap)</span>
                </span>
                <span className="shrink-0 font-mono">{formatSzam(hazaiErtek, mutato.utotag)}</span>
              </span>
              <Sav v={hazaiErtek} skala={skala} szin={HAZAI_SAV_SZIN} nulla={nulla} jelolo={null} />
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
```

- [ ] **Step 4: `OsszehasonlitasFejlec.tsx`**

```tsx
'use client';

import { X } from 'lucide-react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { AllapotBadge } from '../../../../components/orszagprofil/AllapotBadge';
import { Button } from '../../../../components/ui/button';
import { attaseNelkulFelirat, attasekRovid } from '../../../../lib/attase-orszag';
import { HAZAI_SZIN } from '../../../../lib/osszehasonlitas';
import { formatSzam } from '../../../../lib/szam';
import type { Mutato } from '../../../../lib/terkep-mutatok';
import { cn } from '../../../../lib/utils';
import { VS_MAX } from './useTerkepAllapot';

/** A fejléc-kártyák közös kerete; balra a színcsík (`Csik`) helye. */
const KARTYA = 'relative flex flex-col items-start gap-1.5 overflow-hidden rounded-lg border py-2.5 pr-2.5 pl-4';

/** A kártya bal szélén az ország színe – ugyanez a sávoké és a mátrix-pöttyöké. */
function Csik({ szin }: { szin: string }) {
  // Inline style szándékosan: a szín az összehasonlítás palettájából jön.
  return <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: szin }} />;
}

/** Az országnév gombként: a jobb panelen megnyitja az ország kivonatát. */
function NevGomb({ o, onKivalaszt }: { o: TerkepOrszag; onKivalaszt: (kod: string) => void }) {
  return (
    <button
      type="button"
      className="min-w-0 rounded-sm text-left font-semibold text-foreground outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      onClick={() => onKivalaszt(o.kod)}
    >
      {o.nev}
    </button>
  );
}

/**
 * Az összehasonlítás fejléce: országonként egy kártya (név → kivonat; a kód a saját színben – ez köti a
 * mátrix oszlopfejlécéhez –; kivétel; attasé; állapot), utána a „+ Ország" választó, ha van még hely és
 * jelölt, végül Magyarország viszonyítási kártyája (kivétel-gomb nélkül).
 */
export function OsszehasonlitasFejlec({ orszagok, szinek, hazai, jeloltek, mutato, onKivalaszt, onKivesz, onHozzaad }: {
  /** A halmaz rekordjai a hozzáadás sorrendjében (Magyarország nélkül). */
  orszagok: readonly TerkepOrszag[];
  /** Kód → az ország színe az összehasonlításban. */
  szinek: Readonly<Record<string, string>>;
  /** A magyar rekord (viszonyítási alap); `null`, ha nincs a nézett évre. */
  hazai: TerkepOrszag | null;
  /** A „+ Ország" lista (a halmazban nem lévők, Magyarország nélkül; a hívó rendezi). */
  jeloltek: readonly TerkepOrszag[];
  /** A térkép mutatója: számszerűnél a „+ Ország" opciói az értéket is mutatják. */
  mutato: Mutato;
  onKivalaszt: (kod: string) => void;
  onKivesz: (kod: string) => void;
  onHozzaad: (kod: string) => void;
}) {
  const plusz = orszagok.length < VS_MAX && jeloltek.length > 0;
  const felirat = (o: TerkepOrszag) =>
    mutato.tipus === 'szam' ? `${o.nev} · ${formatSzam(mutato.ertek(o), mutato.utotag)}` : o.nev;
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(11rem,100%),1fr))] gap-2.5">
      {orszagok.map((o) => (
        <div key={o.kod} className={KARTYA}>
          <Csik szin={szinek[o.kod]} />
          <span className="flex w-full items-start gap-1.5">
            <NevGomb o={o} onKivalaszt={onKivalaszt} />
            {/* Inline style szándékosan: a kód a saját színben, mint a mátrix oszlopfejlécében. */}
            <span className="mt-0.5 font-mono text-[11px] font-semibold" style={{ color: szinek[o.kod] }}>{o.kod}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="ml-auto shrink-0"
              aria-label={`${o.nev} kivétele`}
              onClick={() => onKivesz(o.kod)}
            >
              <X />
            </Button>
          </span>
          <span className="text-xs text-muted-foreground">{attasekRovid(o.attasek, o.kod) ?? attaseNelkulFelirat(o.kod)}</span>
          <AllapotBadge allapot={o.allapot} ev={o.ev} />
        </div>
      ))}
      {plusz && (
        <div className={cn(KARTYA, 'justify-center border-dashed pl-2.5')}>
          <NativeSelect
            aria-label="Ország hozzáadása"
            value=""
            onChange={(e) => {
              if (e.target.value) onHozzaad(e.target.value);
            }}
          >
            <option value="">+ Ország</option>
            {jeloltek.map((o) => <option key={o.kod} value={o.kod}>{felirat(o)}</option>)}
          </NativeSelect>
        </div>
      )}
      {hazai && (
        <div className={cn(KARTYA, 'border-dashed bg-muted/40')}>
          <Csik szin={HAZAI_SZIN} />
          <span className="flex w-full flex-wrap items-start gap-1.5">
            <NevGomb o={hazai} onKivalaszt={onKivalaszt} />
            <span className="ml-auto rounded-full bg-muted px-2 text-[11px] text-muted-foreground">viszonyítási alap</span>
          </span>
          <span className="text-xs text-muted-foreground">{attaseNelkulFelirat(hazai.kod)}</span>
          <AllapotBadge allapot={hazai.allapot} ev={hazai.ev} />
        </div>
      )}
    </div>
  );
}
```

A sorrend: a kiválasztott országok, utána a „+ Ország” (ide kerül az újonnan felvett ország), végül Magyarország. A Magyarország-kártya mindig az utolsó, mint a mutatókártyák magyar sora.

- [ ] **Step 5: `OsszehasonlitasPanel.tsx` teljes új tartalma (még a „Listák” nélkül)**

```tsx
'use client';

import type { ReactNode } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { HAZAI_SZIN } from '../../../../lib/osszehasonlitas';
import { SZAM_MUTATOK, type Mutato } from '../../../../lib/terkep-mutatok';
import { MutatoKartya } from './MutatoKartya';
import { OsszehasonlitasFejlec } from './OsszehasonlitasFejlec';

/** Egy szakasz (Mutatók, Listák): kicsi, nagybetűs cím, mellette opcionális egysoros jelmagyarázat. */
function Szakasz({ cim, jelmagyarazat, children }: { cim: string; jelmagyarazat?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {cim}
        {jelmagyarazat && (
          <span className="flex items-center gap-1.5 font-normal tracking-normal normal-case">{jelmagyarazat}</span>
        )}
      </h2>
      {children}
    </section>
  );
}

/**
 * Az összehasonlítás a térkép alatt, teljes szélességben (a keskeny jobb panelen nem férne el): fejléc
 * (országkártyák, „+ Ország", Magyarország), számszerű mutatónként egy kártya, és a listák mátrixa.
 * Minden ország saját színt kap (`szinek`); Magyarország – ha van rekordja a nézett évre – mindig
 * viszonyítási alap.
 */
export function OsszehasonlitasPanel({ orszagok, szinek, hazai, jeloltek, mutato, onKivalaszt, onKivesz, onHozzaad, onTorol }: {
  /** A halmaz rekordjai a hozzáadás sorrendjében (Magyarország nélkül). */
  orszagok: TerkepOrszag[];
  /** Kód → az ország színe az összehasonlításban. */
  szinek: Readonly<Record<string, string>>;
  /** A magyar rekord (viszonyítási alap); `null`, ha nincs a nézett évre. */
  hazai: TerkepOrszag | null;
  /** A „+ Ország" lista (a halmazban nem lévők, Magyarország nélkül; a hívó rendezi). */
  jeloltek: TerkepOrszag[];
  mutato: Mutato;
  onKivalaszt: (kod: string) => void;
  onKivesz: (kod: string) => void;
  onHozzaad: (kod: string) => void;
  onTorol: () => void;
}) {
  const kozos = { orszagok, szinek, hazai };
  return (
    <Card>
      <CardHeader className="flex items-start gap-2">
        <div className="min-w-0">
          <CardTitle>Összehasonlítás</CardTitle>
          <CardDescription>
            {orszagok.length} ország ·{' '}
            {hazai ? 'viszonyítási alap: Magyarország' : 'viszonyítási alap nélkül (Magyarországnak nincs profilja erre az évre)'}
          </CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={onTorol}>Összehasonlítás törlése</Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <OsszehasonlitasFejlec
          {...kozos}
          jeloltek={jeloltek}
          mutato={mutato}
          onKivalaszt={onKivalaszt}
          onKivesz={onKivesz}
          onHozzaad={onHozzaad}
        />
        <Szakasz
          cim="Mutatók"
          jelmagyarazat={hazai && (
            <>
              {/* Inline style szándékosan: a jelölő színe a mutatókártyákéval azonos. */}
              <span aria-hidden className="inline-block h-3 w-0.5 rounded-full" style={{ background: HAZAI_SZIN }} />
              Magyarország szintje
            </>
          )}
        >
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(15rem,100%),1fr))] gap-2.5">
            {SZAM_MUTATOK.map((m) => (
              <MutatoKartya key={m.kulcs} mutato={m} {...kozos} kiemelt={m.kulcs === mutato.kulcs} />
            ))}
          </div>
        </Szakasz>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 6: `TerkepNezet.tsx` – a panel propjai**

Ezt:

```tsx
        <OsszehasonlitasPanel
          orszagok={vsOrszagok}
          jeloltek={jeloltLista}
```

cseréld erre:

```tsx
        <OsszehasonlitasPanel
          orszagok={vsOrszagok}
          szinek={allapot.vsSzinek}
          hazai={allapot.hazai}
          jeloltek={jeloltLista}
```

- [ ] **Step 7: `TerkepPanel.tsx` – elavult komment**

Ezt:

```tsx
  /** A halmaz rekordjai a hozzáadás sorrendjében (a TerkepNezet számolja, a táblának is kell). */
```

cseréld erre:

```tsx
  /** A halmaz rekordjai a hozzáadás sorrendjében (a TerkepNezet számolja, az összehasonlításnak is kell). */
```

- [ ] **Step 8: Az ellenőrző script a `hazaiRekord`-dal**

Hozd létre újra az 1. task scriptjét, a záró `console.log('ok');` sora nélkül (mintára, nem sorszámra, mert a terv sorai eltolódhatnak):

```bash
sed -n '/^\/\/ Eldobható ellenőrzés a lib\/osszehasonlitas.ts-hez/,/^console.log(.ok.);$/p' docs/superpowers/plans/2026-10-14-osszehasonlitas-viszonyitas.md | sed '$d' > scripts/_osszehasonlitas-proba.ts
```

A script elején az `../lib/osszehasonlitas` importot cseréld erre:

```ts
import type { TerkepOrszag } from '../db/queries/orszagprofil';
import {
  hazaiRekord, listaMatrix, nullaVonal, savHelye, savSkala, skalaHely, vsHozzaadElem, type ListaMatrixAdat, type VsElem,
} from '../lib/osszehasonlitas';
```

A script végére fűzd hozzá ezt, utána a `console.log('ok');` sort:

```ts
// --- A magyar viszonyítási alap: csak profillal (ev !== null) számít; attasé-hozzárendelés miatti, profil nélküli rekord nem.
const rek = (kod: string, ev: number | null) => ({ kod, ev }) as unknown as TerkepOrszag;
const huProfillal = rek('HU', 2026);
assert.equal(hazaiRekord([rek('JP', 2026), huProfillal]), huProfillal);
assert.equal(hazaiRekord([rek('JP', 2026), rek('HU', null)]), null);
assert.equal(hazaiRekord([rek('JP', 2026)]), null);
```

Run: `npx tsx scripts/_osszehasonlitas-proba.ts`
Expected: `ok`

- [ ] **Step 9: Ellenőrzés**

Run: `npx tsc --noEmit` (a script még a fában van, neki is fordulnia kell)
Expected: kimenet nélkül, 0-s kilépési kód.

Run: `rm scripts/_osszehasonlitas-proba.ts && npm run build`
Expected: `✓ Compiled successfully`, hiba nélkül.

- [ ] **Step 10: Commit**

```bash
git add lib/osszehasonlitas.ts "app/(app)/terkep/components/useTerkepAllapot.ts" "app/(app)/terkep/components/MutatoKartya.tsx" "app/(app)/terkep/components/OsszehasonlitasFejlec.tsx" "app/(app)/terkep/components/OsszehasonlitasPanel.tsx" "app/(app)/terkep/components/TerkepNezet.tsx" "app/(app)/terkep/components/TerkepPanel.tsx"
git commit -m "feat(terkep): összehasonlítás mutatókártyákkal és országfejléccel, Magyarország viszonyítási alapként"
```

---

### Task 4: Listamátrixok és a kommentek takarítása

Az 1. task reviewja nyomán a táblára hivatkozó, a tábla megszűnésével elavult kommentek és két pontatlan komment is itt javul.

**Files:**
- Create: `app/(app)/terkep/components/ListaMatrix.tsx`
- Modify: `app/(app)/terkep/components/OsszehasonlitasPanel.tsx` (teljes új tartalom: a „Listák” szakasz és a hozzá tartozó importok)
- Modify: `lib/terkep-mutatok.ts` (2 komment), `db/queries/orszagprofil.ts` (1 komment), `app/(app)/terkep/components/ProfilKivonat.tsx` (1 komment), `lib/osszehasonlitas.ts` (1 komment)

- [ ] **Step 1: `ListaMatrix.tsx`**

```tsx
'use client';

import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { HAZAI_SZIN, listaMatrix } from '../../../../lib/osszehasonlitas';
import { cn } from '../../../../lib/utils';

/** A magyar oszlop: halvány háttér és szaggatott bal szegély (fejléc és cellák). */
const HU_OSZLOP = 'w-8 border-l border-dashed bg-muted/40 text-center';

/** Az elem szerepel a listában: pötty az ország színében (Magyarországnál rombusz), felolvasónak „van”. */
function Van({ szin, rombusz }: { szin: string; rombusz?: boolean }) {
  // Inline style szándékosan: a szín az összehasonlítás palettájából jön.
  return (
    <>
      <span
        aria-hidden
        className={cn('inline-block align-middle', rombusz ? 'size-2 rotate-45' : 'size-2.5 rounded-full')}
        style={{ background: szin }}
      />
      <span className="sr-only">van</span>
    </>
  );
}

/** Az elem nem szerepel: apró halvány pötty (a rács olvasható marad), felolvasónak „nincs”. */
function Nincs() {
  return (
    <>
      <span aria-hidden className="inline-block size-1 rounded-full bg-muted-foreground/30 align-middle" />
      <span className="sr-only">nincs</span>
    </>
  );
}

/**
 * Egy lista (kiemelt iparágak, KFI-prioritások, tagságok) mátrixa: elemenként egy sor, országonként
 * egy oszlop (pötty az ország színében), magyar rekord mellett egy magyar oszlop (rombusz). A sorok a
 * `listaMatrix()` csoportjaiban állnak, fölöttük az összegző sor.
 */
export function ListaMatrix<T extends string>({ cim, sorrend, elemek, orszagok, szinek, hazai }: {
  cim: string;
  /** A szótár (pl. `AGAZATOK`): a csoporton belüli sorrend. */
  sorrend: readonly T[];
  /** Az ország listája (pl. `(o) => o.iparagak`). */
  elemek: (o: TerkepOrszag) => readonly T[];
  /** A halmaz rekordjai a hozzáadás sorrendjében (Magyarország nélkül). */
  orszagok: readonly TerkepOrszag[];
  /** Kód → az ország színe az összehasonlításban. */
  szinek: Readonly<Record<string, string>>;
  /** A magyar rekord (viszonyítási alap); `null`, ha legfeljebb a nézett évig nincs profilja. */
  hazai: TerkepOrszag | null;
}) {
  const matrix = listaMatrix(
    sorrend,
    orszagok.map((o) => ({ kod: o.kod, nev: o.nev, elemek: elemek(o) })),
    hazai ? elemek(hazai) : null,
  );
  const oszlopSzam = 1 + orszagok.length + (hazai ? 1 : 0);
  return (
    <section className="flex min-w-0 flex-col gap-1 rounded-lg border p-3">
      <h3 className="text-sm font-medium">{cim}</h3>
      {matrix.csoportok.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nincs adat.</p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{matrix.osszegzes}</p>
          {/* Keskeny kártyán a táblázat a kártyán belül görgethető. */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <caption className="sr-only">{cim}</caption>
              <thead>
                <tr>
                  <td />
                  {orszagok.map((o) => (
                    <th key={o.kod} scope="col" className="w-7 px-0.5 pb-1 text-center font-mono text-[11px] font-semibold">
                      {/* Inline style szándékosan: a kód az ország színében, mint a fejléc-kártyán. */}
                      <span aria-hidden style={{ color: szinek[o.kod] }}>{o.kod}</span>
                      <span className="sr-only">{o.nev}</span>
                    </th>
                  ))}
                  {hazai && (
                    <th scope="col" className={cn(HU_OSZLOP, 'px-0.5 pb-1 font-mono text-[11px] font-semibold')}>
                      <span aria-hidden>HU</span>
                      <span className="sr-only">Magyarország</span>
                    </th>
                  )}
                </tr>
              </thead>
              {matrix.csoportok.map((cs) => (
                <tbody key={cs.cimke}>
                  <tr>
                    <th
                      scope="rowgroup"
                      colSpan={oszlopSzam}
                      className="pt-2.5 pb-0.5 text-left text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
                    >
                      {cs.cimke}
                    </th>
                  </tr>
                  {cs.sorok.map((s) => (
                    <tr key={s.elem}>
                      <th scope="row" className="py-0.5 pr-2 text-left font-normal">{s.elem}</th>
                      {orszagok.map((o, i) => (
                        <td key={o.kod} className="text-center">
                          {s.benne[i] ? <Van szin={szinek[o.kod]} /> : <Nincs />}
                        </td>
                      ))}
                      {hazai && <td className={HU_OSZLOP}>{s.hazai ? <Van szin={HAZAI_SZIN} rombusz /> : <Nincs />}</td>}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </>
      )}
    </section>
  );
}
```

- [ ] **Step 2: `OsszehasonlitasPanel.tsx` végleges tartalma**

A 3. taskhoz képest két dolog változik: az importok közé bekerül az `AGAZATOK`, a `KFI_PRIORITASOK`, a `TAGSAGOK` és a `ListaMatrix`, és a „Mutatók” után jön a „Listák” szakasz. A kód már tartalmazza a 3. task minőségi reviewjának javításait, amelyek a 3. task utáni külön javító commitban kerültek a panelbe. A jelmagyarázat a címsoron kívül, `aria-hidden` `<p>`-ben van, a mutatórács legfeljebb 4 oszlopos, és a kommentek szerint Magyarország akkor viszonyítási alap, ha legfeljebb a nézett évig van profilja.

```tsx
'use client';

import type { ReactNode } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { AGAZATOK, KFI_PRIORITASOK, TAGSAGOK } from '../../../../lib/orszagprofil-szotar';
import { HAZAI_SZIN } from '../../../../lib/osszehasonlitas';
import { SZAM_MUTATOK, type Mutato } from '../../../../lib/terkep-mutatok';
import { ListaMatrix } from './ListaMatrix';
import { MutatoKartya } from './MutatoKartya';
import { OsszehasonlitasFejlec } from './OsszehasonlitasFejlec';

/**
 * Egy szakasz (Mutatók, Listák): kicsi, nagybetűs cím, mellette opcionális egysoros jelmagyarázat. A
 * jelmagyarázat a címsoron kívül van (különben a felolvasó a címsor nevébe olvasná), és `aria-hidden`:
 * csak a szintén rejtett grafikát (jelölő, rombusz) magyarázza.
 */
function Szakasz({ cim, jelmagyarazat, children }: { cim: string; jelmagyarazat?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <h2 className="font-medium tracking-wide uppercase">{cim}</h2>
        {jelmagyarazat && <p aria-hidden className="flex items-center gap-1.5">{jelmagyarazat}</p>}
      </div>
      {children}
    </section>
  );
}

/**
 * Az összehasonlítás a térkép alatt, teljes szélességben (a keskeny jobb panelen nem férne el): fejléc
 * (országkártyák, „+ Ország", Magyarország), számszerű mutatónként egy kártya, és a listák mátrixa.
 * Minden ország saját színt kap (`szinek`); Magyarország – ha legfeljebb a nézett évig van profilja –
 * mindig viszonyítási alap.
 */
export function OsszehasonlitasPanel({ orszagok, szinek, hazai, jeloltek, mutato, onKivalaszt, onKivesz, onHozzaad, onTorol }: {
  /** A halmaz rekordjai a hozzáadás sorrendjében (Magyarország nélkül). */
  orszagok: TerkepOrszag[];
  /** Kód → az ország színe az összehasonlításban. */
  szinek: Readonly<Record<string, string>>;
  /** A magyar rekord (viszonyítási alap); `null`, ha legfeljebb a nézett évig nincs profilja. */
  hazai: TerkepOrszag | null;
  /** A „+ Ország" lista (a halmazban nem lévők, Magyarország nélkül; a hívó rendezi). */
  jeloltek: TerkepOrszag[];
  mutato: Mutato;
  onKivalaszt: (kod: string) => void;
  onKivesz: (kod: string) => void;
  onHozzaad: (kod: string) => void;
  onTorol: () => void;
}) {
  const kozos = { orszagok, szinek, hazai };
  return (
    <Card>
      <CardHeader className="flex items-start gap-2">
        <div className="min-w-0">
          <CardTitle>Összehasonlítás</CardTitle>
          <CardDescription>
            {orszagok.length} ország ·{' '}
            {hazai ? 'viszonyítási alap: Magyarország' : 'viszonyítási alap nélkül (Magyarországnak nincs profilja erre az évre)'}
          </CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={onTorol}>Összehasonlítás törlése</Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <OsszehasonlitasFejlec
          {...kozos}
          jeloltek={jeloltek}
          mutato={mutato}
          onKivalaszt={onKivalaszt}
          onKivesz={onKivesz}
          onHozzaad={onHozzaad}
        />
        <Szakasz
          cim="Mutatók"
          jelmagyarazat={hazai && (
            <>
              {/* Inline style szándékosan: a jelölő színe a mutatókártyákéval azonos. */}
              <span aria-hidden className="inline-block h-3 w-0.5 rounded-full" style={{ background: HAZAI_SZIN }} />
              Magyarország szintje
            </>
          )}
        >
          {/* Legalább 15rem széles oszlopok, de legfeljebb 4 (a 23% miatt): széles képernyőn 4+3 kártya. */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,max(15rem,23%)),1fr))] gap-2.5">
            {SZAM_MUTATOK.map((m) => (
              <MutatoKartya key={m.kulcs} mutato={m} {...kozos} kiemelt={m.kulcs === mutato.kulcs} />
            ))}
          </div>
        </Szakasz>
        <Szakasz
          cim="Listák"
          jelmagyarazat={hazai && (
            <>
              {/* Inline style szándékosan: a rombusz színe a mátrixéval azonos. */}
              <span aria-hidden className="inline-block size-2 rotate-45" style={{ background: HAZAI_SZIN }} />
              Magyarország
            </>
          )}
        >
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(20rem,100%),1fr))] items-start gap-2.5">
            <ListaMatrix cim="Kiemelt iparágak" sorrend={AGAZATOK} elemek={(o) => o.iparagak} {...kozos} />
            <ListaMatrix cim="KFI-prioritások" sorrend={KFI_PRIORITASOK} elemek={(o) => o.prioritasok} {...kozos} />
            <ListaMatrix cim="Tagságok" sorrend={TAGSAGOK} elemek={(o) => o.alapadatok?.tagsagok ?? []} {...kozos} />
          </div>
        </Szakasz>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Kommentek (csak komment, kódváltozás nincs)**

(1) `lib/terkep-mutatok.ts` – ezt:

```ts
/** A mutatók a `MUTATO_KULCSOK` sorrendjében (a Select és az összehasonlító tábla sorrendje). */
```

cseréld erre:

```ts
/** A mutatók a `MUTATO_KULCSOK` sorrendjében (a Select és az összehasonlítás mutatókártyáinak sorrendje). */
```

(2) `lib/terkep-mutatok.ts` – ezt:

```ts
   * 9/9 teli sáv legyen); nélküle a tető a megjelenített értékek legnagyobbika.
```

cseréld erre:

```ts
   * 9/9 teli sáv legyen); nélküle a tető a megjelenített értékek legnagyobbika (de legalább 0).
```

(3) `db/queries/orszagprofil.ts` – ezt:

```ts
  /** KFI-prioritások (KFI-blokk) az összehasonlító táblához; nem mentett blokknál üres. */
```

cseréld erre:

```ts
  /** KFI-prioritások (KFI-blokk) az összehasonlítás listamátrixához; nem mentett blokknál üres. */
```

(4) `app/(app)/terkep/components/ProfilKivonat.tsx` – ezt:

```tsx
          // összehasonlító tábla kiemelt sora) – ez köti a sort a térkép aktuális színezéséhez. Érték
```

cseréld erre:

```tsx
          // összehasonlítás kiemelt mutatókártyája) – ez köti a sort a térkép aktuális színezéséhez. Érték
```

(5) `lib/osszehasonlitas.ts` – ezt:

```ts
  /** Az összegző sor; a nulla darabszámú részek kimaradnak, kivéve a „Magyarországgal közös”-t (az 0-nál is kiíródik). Üres mátrixnál üres string. */
```

cseréld erre:

```ts
  /** Az összegző sor; a nulla darabszámú részek kimaradnak, kivéve a „Magyarországgal közös”-t (ha a magyar lista nem üres, 0-nál is kiíródik). Üres mátrixnál üres string. */
```

- [ ] **Step 4: Ellenőrzés**

Run: `grep -rn "összehasonlító tábl" app components lib db`
Expected: nincs találat.

Run: `npx tsc --noEmit`
Expected: kimenet nélkül, 0-s kilépési kód.

Run: `npm run build`
Expected: `✓ Compiled successfully`, hiba nélkül.

- [ ] **Step 5: Commit**

```bash
git add "app/(app)/terkep/components/ListaMatrix.tsx" "app/(app)/terkep/components/OsszehasonlitasPanel.tsx" lib/terkep-mutatok.ts db/queries/orszagprofil.ts "app/(app)/terkep/components/ProfilKivonat.tsx" lib/osszehasonlitas.ts
git commit -m "feat(terkep): az iparágak, prioritások és tagságok mátrixa az összehasonlításban; elavult kommentek"
```

---

### Task 5: CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`. A cserék 1–5. része az Országprofil szakasz „Route-ok:” bekezdésének `/terkep` részében, a 6–7. a „**Térkép.**” bekezdésben van. Mindegyik régi szöveg pontosan egyszer fordul elő.

Az új szövegek már a review-k nyomán változott végleges állapotot írják le (`hazai`/`hazaiRekord`, a kivonat szövegének feltétele, a jelmagyarázat a `h2`-n kívül, a legfeljebb 4 oszlop, a kiemelt kártya kontrasztja, a `NoInfer`).

A régi szövegekben a nyitó idézőjel `„` (U+201E), a záró ASCII `"`: az Edit-hez betűre így kell megadni. Az új szövegek a meglévő részeken megtartják ezt, az új részekben `„…”` áll.

- [ ] **Step 1: A hook leírása**

Ezt:

```text
`vs` összehasonlítás-halmaz (legfeljebb `VS_MAX`=4; a tábla `VS_MIN`=2-től látszik), `vsTele`, `vsValt`, `mutato`, `iparag`;
```

cseréld erre:

```text
`vs` összehasonlítás-halmaz (legfeljebb `VS_MAX`=4, a `VS_SZINEK` színeinek száma; Magyarország nem kerülhet bele), `vsSzinek` (kód → szín: felvételkor a legkisebb szabad, és az országnál marad, amíg benne van), `hazai` (`hazaiRekord`: Magyarország rekordja, ha legfeljebb a nézett évig van profilja – attasé-hozzárendelés miatt profil nélkül is lehet magyar rekord, az nem viszonyítási alap), `vsMin` (1, ha van `hazai`, különben 2), `vsTele`, `vsValt`, `mutato`, `iparag`;
```

- [ ] **Step 2: A kivonat gombja**

Ezt:

```text
mutató-sáv + ikonos „Összehasonlítás"/„Összehasonlításban" gomb)
```

cseréld erre:

```text
mutató-sáv + ikonos „Összehasonlítás"/„Összehasonlításban" gomb, Magyarországnál helyette – ha van profilja – „Az összehasonlításban mindig szerepel viszonyítási alapként.”)
```

- [ ] **Step 3: A rangsor-panel**

Ezt:

```text
üres állapotok szűrés vs. adat szerint)
```

cseréld erre:

```text
üres állapotok szűrés vs. adat szerint; Magyarország sorában a „+” gomb helyén azonos méretű helykitöltő)
```

- [ ] **Step 4: Az összehasonlítás-csík**

Ezt:

```text
fölötte az `OsszehasonlitasCsik` chipjei + állapotszöveg, ha a halmaz nem üres;
```

cseréld erre:

```text
fölötte az `OsszehasonlitasCsik` chipjei (színpötty az ország színében) + állapotszöveg (a `vsMin`-hez igazodik), ha a halmaz nem üres;
```

- [ ] **Step 5: Az összehasonlító panel**

Ezt:

```text
az `OsszehasonlitasPanel` a térkép **alatt**, teljes szélességben, ha `vs.length >= VS_MIN` (`w-auto` tábla, oszlop országonként, sticky `th scope="row"` címke-oszlop, számszerű mutatónál a térkép mutatójának sora kiemelt, soronként a legnagyobb félkövér – csak legalább két különböző értéknél –, „+ Ország" `NativeSelect` a `jeloltek()` listából, „Összehasonlítás törlése");
```

cseréld erre:

```text
az `OsszehasonlitasPanel` a térkép **alatt**, teljes szélességben, ha `vs.length >= vsMin` (Magyarország – a `hazai`, ha legfeljebb a nézett évig van profilja – állandó viszonyítási alap, nélküle a leírás jelzi, hogy nincs viszonyítás; országonként saját szín a `VS_SZINEK`-ből): `OsszehasonlitasFejlec` (országkártya: színcsík, név → kivonat, a kód a saját színben, ×, `attasekRovid`/`attaseNelkulFelirat`, `AllapotBadge`; utána „+ Ország" `NativeSelect` a `jeloltek()` listából, Magyarország nélkül; végül Magyarország szaggatott „viszonyítási alap” kártyája), „Mutatók” (a szakaszcím melletti jelmagyarázat a `h2`-n kívül, `aria-hidden`): `SZAM_MUTATOK`-onként egy `MutatoKartya`, legfeljebb 4 oszlopban (kétsoros sorok a halmaz sorrendjében – nem érték szerint –, közös, nulláról induló lineáris skála: `savSkala` a kiválasztottak és Magyarország értékeiből, a mutató `felsoHatar`-ával, negatívnál nullavonal; alul Magyarország szürke sávja, minden ország sávján fekete jelölő a magyar szinten; a térkép számszerű mutatójának kártyája kiemelt – rajta a `--muted-foreground` sötétebb, mert a halvány szöveg a zöldön kevés kontrasztú –; félkövér nincs), „Listák”: három `ListaMatrix` (kiemelt iparágak, KFI-prioritások, tagságok; generikus, a `T`-t a `NoInfer` miatt csak a szótár (`sorrend`) adja, így más szótár listája fordítási hiba; a `listaMatrix()` csoportjai 2+ országnál „Mind a N országban / Részben közös / Csak egy országban / Csak Magyarország”, 1 országnál „Közös Magyarországgal / Csak <név> / Csak Magyarország”, fölöttük összegző sor a „Magyarországgal közös: N” és a „nincs megadva: …” résszel), „Összehasonlítás törlése");
```

- [ ] **Step 6: Az `attasekRovid` (Térkép bekezdés)**

Ezt:

```text
Az `attasekRovid` (az első attasé + „+N attasé") már csak az összehasonlító tábla „Attasé" sorát adja.
```

cseréld erre:

```text
Az `attasekRovid` (az első attasé + „+N attasé") már csak az összehasonlítás fejléc-kártyáinak attasé-sorát adja (attasé nélkül ott az `attaseNelkulFelirat` áll).
```

- [ ] **Step 7: A mutató-modul és az új lib (Térkép bekezdés)**

Ezt:

```text
a framework-mentes `lib/terkep-mutatok.ts`-ben vannak; ismeretlen mutató-kulcsra `mutatoByKulcs` az alapértelmezettet adja.
```

cseréld erre:

```text
a framework-mentes `lib/terkep-mutatok.ts`-ben vannak (a számszerű mutató opcionális `felsoHatar`-a: az összehasonlítás sáv-skálájának teteje legalább ennyi, a kitöltöttségnél 9); ismeretlen mutató-kulcsra `mutatoByKulcs` az alapértelmezettet adja. Az összehasonlítás tiszta logikája – `VS_SZINEK`, `HAZAI_SZIN`/`HAZAI_SAV_SZIN`, `hazaiRekord`, `vsHozzaadElem` (a legkisebb szabad szín; Magyarországra, a már benne lévőre és a tele halmazra változatlan), `savSkala`/`skalaHely`/`savHelye`/`nullaVonal`, `listaMatrix` – a szintén framework-mentes `lib/osszehasonlitas.ts`-ben van.
```

- [ ] **Step 8: Ellenőrzés**

Run: `grep -c "VS_MIN" CLAUDE.md`
Expected: `0`

Run: `grep -c "soronként a legnagyobb félkövér" CLAUDE.md`
Expected: `0`

Run: `grep -c "lib/osszehasonlitas.ts" CLAUDE.md`
Expected: `1`

Run: `grep -c "MutatoKartya" CLAUDE.md`
Expected: `1`

Run: `grep -c "hazaiRekord" CLAUDE.md`
Expected: `2`

- [ ] **Step 9: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(terkep): az összehasonlítás új működése a CLAUDE.md-ben"
```

---

### Task 6: Böngészős QA (a fő munkamenet végzi, nem subagent)

A felhasználó futó TéT dev szerverén (`localhost:3000`), gstack-kel (`B=~/.claude/skills/gstack/browse/dist/browse`). Előbb meg kell nézni, hogy a 3000-es port a TéT-é: `lsof -a -p <pid> -d cwd`.

Szabályok:
- A jelszó soha nem kerül a kimenetbe. A `.env.local`-ból shell-változóba olvasd (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`), és a kitöltés után ne fusson `snapshot`.
- A `/login`-on a kitöltés előtt `wait --networkidle` kell.
- A kattintás JS-ből megy (`$B js "…click()"`), mert a gstack `click` több találatnál hibázik.
- A QA előtt jegyezd fel a session-sorok számát: `sqlite3 -readonly data/tet.db "select count(*) from session"`.

Segédkifejezések a `$B js`-hez:
- Az összehasonlító kártya:
  `const p = Array.from(document.querySelectorAll('[data-slot=card-title]')).find(e => e.textContent === 'Összehasonlítás')?.closest('[data-slot=card]')`
- Ország felvétele a rangsor-panelről (kijelölés nélkül, alapból „Kiemelt iparág” mutatóval):
  `document.querySelector('button[aria-label="Japán hozzáadása az összehasonlításhoz"]').click()`
- A fejléc kódjai és színei:
  `Array.from(p.querySelectorAll('span.font-mono[style]')).map(s => s.textContent + ':' + s.style.color).join(' ')`

- [ ] **Step 1: 4 ország, vizuális összevetés a makettel**
  - Viewport `1440x1000`, admin belépés, `/terkep`.
  - Felvétel sorban: Japán, Németország, Koreai Köztársaság, Amerikai Egyesült Államok.
  - Elvárt a panelen:
    - a leírás „4 ország · viszonyítási alap: Magyarország”;
    - a fejlécben 4 országkártya és a Magyarország-kártya, „+ Ország” nincs;
    - 7 mutatókártya, az utolsó soruk „Magyarország”;
    - 3 mátrix. Az iparágak összegzése „5 közös · 2 részben közös · 3 egyedi · Magyarországgal közös: 6”, a KFI-prioritásoké „2 közös · 7 részben közös · 3 egyedi · Magyarországgal közös: 5”, a tagságoké „2 közös · 2 részben közös · 1 egyedi · Magyarországgal közös: 3”.
  - Képernyőkép a panelről, összevetve a `teljes-panel-v2.html` maketttel. Nincs egymásba csúszó jelvény és nincs félkövér érték.
  - A színek: JP `rgb(37, 99, 235)`, DE `rgb(194, 65, 12)`, KR `rgb(147, 51, 234)`, US `rgb(190, 24, 93)`.
- [ ] **Step 2: Stabil színek**
  - A fejlécben a „Németország kivétele” gomb (a panelen belül: `p.querySelector('button[aria-label="Németország kivétele"]').click()`) → JP, KR és US színe változatlan.
  - Az „+ Ország” választóban Kanada (`select[aria-label="Ország hozzáadása"]`, value `CA`, `change` esemény) → Kanada narancsot kap (`rgb(194, 65, 12)`), és a sor végére kerül.
- [ ] **Step 3: Magyarország nem vehető fel**
  - `document.querySelector('button[aria-label="Magyarország hozzáadása az összehasonlításhoz"]')` → `null`.
  - A „+ Ország” opciói között nincs `HU`.
  - `goto /terkep?o=HU` → a kivonat láblécében „Az összehasonlításban mindig szerepel viszonyítási alapként.”, és nincs „Összehasonlítás” gomb.
- [ ] **Step 4: 1 ország Magyarországgal szemben**
  - „Összehasonlítás törlése”, majd csak Japán felvétele → a panel látszik, a leírás „1 ország · viszonyítási alap: Magyarország”, a csík szövege „Az összehasonlítás a térkép alatt”.
  - Az iparág-mátrix csoportjai: „Közös Magyarországgal” (6), „Csak Japán” (2), „Csak Magyarország” (2).
- [ ] **Step 5: Év magyar profil nélkül (2025)**
  - `$B select 'header select' 2025`, várakozás → 1 országnál nincs panel, a csík szövege „Válassz még egy országot”.
  - Németország felvétele → a panel leírása „2 ország · viszonyítási alap nélkül (Magyarországnak nincs profilja erre az évre)”. Nincs Magyarország-kártya, magyar sor, jelölő és HU-oszlop.
  - Vissza: `$B select 'header select' 2026`.
- [ ] **Step 6: Negatív érték, profil nélküli ország**
  - Törlés, majd Puerto Rico és Amerikai Virgin-szigetek → a „GDP-növekedés” kártyán van nullavonal (`span.w-px`), a két sáv balra fut, a magyar jelölő a jobb szélen.
  - Koreai NDK felvétele. A 2026-os profilja részleges (4/9 blokk; KFI-blokk és rendezvénylista nélkül), ezért a GDP, az egy főre jutó GDP és a GERD sora „–”, a GDP-növekedés 3,5 %, a lakosság 26 571 036, a kitöltöttség „4/9”, a rendezvények száma „0”. A tagság-, iparág- és prioritáslistája üres, ezért mindhárom mátrix összegző sorában „nincs megadva: … Koreai NDK” áll.
- [ ] **Step 7: A térkép mutatója**
  - A „Mutató” választón a „K+F ráfordítás (GERD)” kiválasztása. A Base UI Select: előbb `document.querySelector('#mutato').click()`, utána a `[role=option]` elemre szintetikus `pointerdown`/`mousedown`/`pointerup`/`mouseup`/`click`.
  - Elvárt: a GERD-kártya háttere `rgb(227, 241, 236)`, mellette „a térkép mutatója”. Kategorikus mutatóra visszaváltva egyik kártya sem kiemelt.
- [ ] **Step 8: Keskeny ablak és billentyűzet**
  - Viewport `800x900` → a rácsok tördelődnek, a lapon nincs vízszintes görgetés (`document.documentElement.scrollWidth <= innerWidth`). Képernyőkép.
  - Tab a fejlécben: név → × → … → „+ Ország” → Magyarország neve. A fókuszgyűrű látszik.
- [ ] **Step 9: Tisztaság**
  - Kijelentkezés.
  - A `session` darabszáma egyezik a QA előttivel.
  - A `git status --short` csak a várt (commitolt) állapotot mutatja; a DB-t nem commitoljuk.

---

### Task 7: Spec és terv a végleges állapothoz (fő munkamenet)

- [ ] **Step 1:** A spec „Állapot” sora: „megvalósítva, böngészőben kipróbálva”. A végére „Megvalósítási eltérések” szakasz kerül: a terv fejlécében felsorolt három eltérés, és ami a review-k és a QA nyomán még változott.
- [ ] **Step 2:** A terv kódblokkjait igazítsd a végleges fájlokhoz (ha a review-k nyomán változtak).
- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-10-14-osszehasonlitas-viszonyitas-design.md docs/superpowers/plans/2026-10-14-osszehasonlitas-viszonyitas.md
git commit -m "docs(terkep): a terv kódblokkjai a végleges fájlokhoz igazítva; a spec állapota és a megvalósítási eltérések"
```
