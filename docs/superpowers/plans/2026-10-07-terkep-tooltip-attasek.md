# Térkép tooltip: minden attasé, relációs vezető, részterület – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A térkép tooltipje minden attasét mutassa (legfeljebb 4-et), több attasénál jelölje a relációs vezetőt, és alattuk 2 sorra vágva a részterületet; a teljes részterület kattintásra a jobb oldali panelen (`ProfilKivonat`) látszik.

**Architecture:** Tisztán megjelenítési változás két kliens-komponensben (`TerkepTooltip`, `ProfilKivonat`) és a `VilagTerkep` vízszintes korlátjában. Az adat már megvan: a `TerkepOrszag.attasek` (`OrszagAttase[]`) a lekérdezésből `rendezAttasek` sorrendben jön (vezető, a többi székhelyes, a régiósak; csoporton belül név szerint), benne `vezeto`, `varos`, `szekhelyKod`, `reszterulet`. Nincs DB-, lekérdezés- és `lib/`-változás.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 7, Tailwind v4 (`line-clamp-2`, `w-max`), shadcn/ui v4 (base-nova; a `Card*` elemek `data-slot` attribútummal).

**Spec:** `docs/superpowers/specs/2026-10-07-terkep-tooltip-attasek-design.md`.

**Ellenőrzés:** Nincs tesztkeretrendszer, és nincs új tiszta logika (csak `slice` és feltételes megjelenítés), ezért assert-script nem kell. A „teszt” a gstack böngészős ellenőrzés két scripttel (lent): előbb a mostani kódon fut (bukik: „+2 attasé”, üres `attasek`), utána az implementáción (zöld). Minden task végén `npx tsc --noEmit`.

**Környezet:**
- A felhasználó TéT dev szervere fut a `http://localhost:3000`-en (`next dev`, HMR), ezen ellenőrzünk. **Nem szabad leállítani vagy újraindítani**, és saját dev szervert sem indítunk. Ha nem fut, szólj a controllernek.
- A `data/tet.db` a repóban van, és a dev szerver ezt használja; a gstack-belépés session-sort ír bele. **Soha ne commitold**: `git add` mindig konkrét fájlokkal, soha `-A`/`.`. A QA-session-t a 2. task végén a kijelentkezés törli.
- Seed admin: `admin@niu.hu`, jelszava a `.env.local` `SEED_ADMIN_PASSWORD`-je. Olvasd ki, de ne írd ki. A jelszó kitöltése után **tilos a `snapshot`** (kiírná a mező értékét).
- Commit üzenetek magyarul, `feat|docs(terkep-tooltip): …`, a végén üres sor után: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Reviewer subagent: csak olvasó git (tilos a checkout, a reset és a stash).

**gstack bejelentkezés** (ha a `$B url` a `/login`-ra mutat, vagy a pinek nem jelennek meg):

```bash
B=~/.claude/skills/gstack/browse/dist/browse
$B goto 'http://localhost:3000/login?next=%2Fterkep' >/dev/null && $B wait --networkidle >/dev/null
$B fill '#email' admin@niu.hu >/dev/null
$B fill '#password' "$(sed -n 's/^SEED_ADMIN_PASSWORD=//p' .env.local)" >/dev/null 2>&1
$B click 'button[type=submit]' >/dev/null
$B wait '[data-pinek] > g'; $B url
```

A `wait` „Selector matched multiple elements” üzenete itt sikert jelent: megvannak a pinek. A `url` értéke `http://localhost:3000/terkep`. A `wait --networkidle` a kitöltés előtt kell: hidratálás előtti kattintásnál a form natívan küldődik be, és a belépés elmarad.

**QA-scriptek** a controller scratchpadjében:

```
S=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/ff5a9b0c-7c4e-4840-a242-43c0a4876dfb/scratchpad
```

Futtatás: `$B eval "$S/tooltip-qa.js"`, illetve `$B eval "$S/kivonat-qa.js"`. Ha hiányoznak, hozd létre őket az alábbi tartalommal.

`$S/tooltip-qa.js` – a pineken végiglebegtetve leírja Németország, az USA, Írország és Ausztria tooltipjét, és a legbalabb, illetve a legjobbra eső pinét (`bentVan`: a tooltip a térkép-konténeren belül van):

```js
(async () => {
  const CELOK = ['Németország', 'Amerikai Egyesült Államok', 'Írország', 'Ausztria'];
  const varj = (ms) => new Promise((r) => setTimeout(r, ms));
  const pinek = [...document.querySelectorAll('[data-pinek] > g')];
  if (pinek.length === 0) return 'NINCS PIN – be vagy jelentkezve, és betöltött a térkép?';
  const hover = async (g) => {
    const r = g.getBoundingClientRect();
    g.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 }));
    await varj(40);
    return document.querySelector('[role=tooltip]');
  };
  const leir = (t) => {
    const wrap = t.parentElement.getBoundingClientRect();
    const tr = t.getBoundingClientRect();
    return {
      cim: t.querySelector('p')?.textContent,
      szelesseg: Math.round(tr.width),
      bentVan: tr.left >= wrap.left - 0.5 && tr.right <= wrap.right + 0.5,
      attasek: [...t.querySelectorAll('li')].map((li) => {
        const [sor, rt] = li.querySelectorAll('p');
        const lh = rt ? parseFloat(getComputedStyle(rt).lineHeight) : 0;
        return {
          felirat: sor ? sor.firstChild?.textContent : li.textContent,
          cimke: sor?.querySelector('span')?.textContent ?? null,
          reszterulet: rt ? { sorok: Math.round(rt.clientHeight / lh), vagott: rt.scrollHeight > rt.clientHeight + 1 } : null,
        };
      }),
      szoveg: t.innerText.replace(/\n/g, ' | '),
    };
  };
  const ki = {};
  for (const g of pinek) {
    const t = await hover(g);
    const cim = t?.querySelector('p')?.textContent;
    if (CELOK.includes(cim) && !ki[cim]) ki[cim] = leir(t);
  }
  // Szélek: a legbalabb és a legjobbra eső pin tooltipje se lógjon ki a térképből.
  const xek = pinek.map((g) => [g, g.getBoundingClientRect().x]).sort((a, b) => a[1] - b[1]);
  for (const [nev, g] of [['BAL', xek[0][0]], ['JOBB', xek[xek.length - 1][0]]]) {
    const t = await hover(g);
    ki[nev] = t ? { cim: t.querySelector('p')?.textContent, ...leir(t) } : null;
  }
  return JSON.stringify(ki, null, 1);
})()
```

`$S/kivonat-qa.js` – a jobb oldali profil-kivonat attasé-része (a `/terkep?o=<kód>` nyitja meg):

```js
(() => {
  // A jobb oldali profil-kivonat attasé-része (a /terkep?o=<kód> nyitja meg).
  const kartya = [...document.querySelectorAll('[data-slot=card-title]')]
    .find((e) => e.closest('[data-slot=card]')?.querySelector('[data-slot=card-description]'))
    ?.closest('[data-slot=card]');
  const d = kartya?.querySelector('[data-slot=card-description]');
  if (!d) return 'NINCS KIVONAT';
  return JSON.stringify({
    cim: kartya.querySelector('[data-slot=card-title]').textContent,
    sorok: [...d.children].map((c) => c.innerText),
  }, null, 1);
})()
```

A viewport legyen `1440x900` (`$B viewport 1440x900`), hogy a térkép mérete minden futásnál ugyanaz legyen.

**Fontos tények (ellenőrizve 2026-10-07, a mostani kódon):**
- A demó DB-ben több attasé két országban van. Németország: Kindert Judit (vezető, Berlin, 131 karakteres részterület), dr. Gurza László (München, „Bajorország”), Komma Krisztián (Stuttgart, 76 karakter). USA: dr. Nagy Gabriella (vezető, New York, 344 karakter), Mészáros Eleonóra (San Francisco, 183 karakter). A sorrend a `rendezAttasek` szerint a vezető után név szerinti, a „dr.” előtag a D-hez sorolja.
- A mostani tooltip a QA-scripttel: Németország `"attasek": []`, a szövegben „Kindert Judit · Berlin +2 attasé”; USA „dr. Nagy Gabriella · New York +1 attasé”; Írország „Balogh András Zoltán · regionálisan (London)”, szélessége 240 (a `max-w-60` korlát); Ausztria „Jávori Balázs · Bécs”. A legbalabb pin az USA-é, a legjobbra eső Japáné.
- A mostani kivonat (`?o=DE`) három sora: „Kindert Judit · Berlin · relációs vezető”, „dr. Gurza László · München”, „Komma Krisztián · Stuttgart” – részterület nélkül.
- A `TerkepTooltip` egyetlen használója a `VilagTerkep` (`{hover && <TerkepTooltip … />}` a `wrapRef` konténerben, amely `relative`; a térkép-kártya `overflow-hidden`).
- Az `attasekRovid` a tooltipen kívül az `OsszehasonlitasPanel` „Attasé” sorában is szerepel, ezért a `lib/attase-orszag.ts`-ben marad, változatlanul.
- A globális CSS (`app/globals.css`) nem stílusoz `ul`/`li`/`p` elemet. A `line-clamp-2` már használatban van (`TicketLista`).
- A részterület tartalmazhat sortörést: a `tisztitSzoveg` a `\n`-t megtartja. A tooltipben a `white-space: normal` szóközzé teszi, a panelen a `whitespace-pre-wrap` megtartja.
- `break-words`: a kódbázis mindenhol ezt használja (`AttaseLista`, `BlokkNezet`, `TicketBeszelgetes`). A Tailwind IntelliSense a 4.3-ban `wrap-break-word`-öt javasol; mindkettő `overflow-wrap: break-word`, a konzisztencia miatt marad a `break-words`.

---

## Fájlszerkezet

| Fájl | Művelet | Felelősség | Task |
| --- | --- | --- | --- |
| `app/(app)/terkep/components/TerkepTooltip.tsx` | módosít | attasé-lista (legfeljebb 4, „+N további attasé”), vezető-címke, 2 soros részterület, `TOOLTIP_SZELESSEG`, `w-max` | 1 |
| `app/(app)/terkep/components/VilagTerkep.tsx` | módosít | az `onHover` vízszintes korlátja a `TOOLTIP_SZELESSEG` felével | 1 |
| `app/(app)/terkep/components/ProfilKivonat.tsx` | módosít | a teljes részterület attasénként | 1 |
| `CLAUDE.md` | módosít | a Térkép bekezdés tooltip-leírása, a `/terkep` route `ProfilKivonat`-ja | 2 |

---

### Task 0: Branch

- [ ] **Step 1: Branch a main-ről**

```bash
git status --short   # csak a data/tet.db lehet módosult – más ne legyen
git checkout -b terkep-tooltip-attasek
```

---

### Task 1: Tooltip és panel

**Files:**
- Modify: `app/(app)/terkep/components/TerkepTooltip.tsx` (az egész fájl)
- Modify: `app/(app)/terkep/components/VilagTerkep.tsx:17` (import), `:224-230` (`onHover`)
- Modify: `app/(app)/terkep/components/ProfilKivonat.tsx:50-62` (`CardDescription`)

- [ ] **Step 1: A bukó ellenőrzés a mostani kódon**

Bejelentkezés (lásd fent), majd:

```bash
$B viewport 1440x900 >/dev/null
$B goto http://localhost:3000/terkep >/dev/null && $B wait '[data-pinek] > g'
$B eval "$S/tooltip-qa.js"
$B goto 'http://localhost:3000/terkep?o=US' >/dev/null && $B wait --networkidle >/dev/null
$B eval "$S/kivonat-qa.js"
```

Expected (bukik): minden ország `"attasek": []`, a németországi `szoveg`-ben „Kindert Judit · Berlin +2 attasé”. Az USA kivonata két sor részterület nélkül: „dr. Nagy Gabriella · New York · relációs vezető”, „Mészáros Eleonóra · San Francisco”.

- [ ] **Step 2: `TerkepTooltip.tsx`**

A teljes fájl:

```tsx
'use client';

import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { attaseFelirat } from '../../../../lib/attase-orszag';
import { ALLAPOT_CIMKE } from '../../../../lib/orszagprofil-szotar';
import { ertekEsHely, type Mutato, type Rangsor } from '../../../../lib/terkep-mutatok';

/** A tooltip legnagyobb szélessége (px). A `VilagTerkep` a kurzor x-ét ennek felével tartja a konténeren belül. */
export const TOOLTIP_SZELESSEG = 320;

/** Legfeljebb ennyi attasé látszik, a többi helyén „+N további attasé” (a tooltip nem görgethető). */
const ATTASE_MAX = 4;

/**
 * A lebegtetett poligon/pin: `o` null, ha az országnak nincs aktív attaséja és profilja; x/y a térkép-konténerhez képest,
 * `magassag` a konténer magassága (a lefelé fordításhoz).
 */
export interface HoverAllapot { nev: string; o: TerkepOrszag | null; x: number; y: number; magassag: number }

/** A mutató sora: számszerűnél érték + helyezés (ha a rangsorban van), kategorikusnál a kategória. */
function mutatoSor(o: TerkepOrszag, mutato: Mutato, rangsor: Rangsor | null): string | null {
  if (mutato.tipus === 'szam') {
    return `${mutato.cimke}: ${ertekEsHely(o, mutato, rangsor) ?? 'nincs adat'}`;
  }
  // Az állapot- és az iparág-sor úgyis ott van a tooltipben (az iparág mutató az első kiemelt iparágat írná ki mégegyszer).
  if (mutato.kulcs === 'allapot' || mutato.kulcs === 'iparag') return null;
  const k = mutato.kategoria(o);
  return k === null ? mutato.nincsCimke : (mutato.cimkek[k] ?? k);
}

/**
 * Az ország attaséi a lekérdezés sorrendjében (vezető, a többi székhelyes, a régiósak): „Név · Város”, több attasénál a
 * vezetőnél „relációs vezető” címkével, alatta a részterület legfeljebb 2 sorban – a teljes szöveg a kivonat-panelen.
 * Egy attasénál nincs címke: ott a vezetőség automatikus (mint a profil oldalán).
 */
function AttaseSorok({ o }: { o: TerkepOrszag }) {
  if (o.attasek.length === 0) return <p className="text-background/70">nincs aktív attasé</p>;
  const tobb = o.attasek.length > 1;
  const rejtett = o.attasek.length - ATTASE_MAX;
  return (
    <ul className="my-0.5 flex flex-col gap-1">
      {o.attasek.slice(0, ATTASE_MAX).map((a) => (
        <li key={a.userId}>
          <p>
            {attaseFelirat(a, o.kod)}
            {tobb && a.vezeto && (
              <span className="ml-1.5 rounded-sm bg-background/20 px-1 text-[10px] font-medium whitespace-nowrap">relációs vezető</span>
            )}
          </p>
          {a.reszterulet && <p className="line-clamp-2 text-background/60">{a.reszterulet}</p>}
        </li>
      ))}
      {rejtett > 0 && <li className="text-background/70">+{rejtett} további attasé</li>}
    </ul>
  );
}

export function TerkepTooltip({ hover, mutato, rangsor }: { hover: HoverAllapot; mutato: Mutato; rangsor: Rangsor | null }) {
  const { o } = hover;
  const sor = o ? mutatoSor(o, mutato, rangsor) : null;
  // A kártya `overflow-hidden`, ezért a tooltip arra az oldalra kerül, ahol több a hely: a kurzor
  // fölé, ha ott legalább annyi hely van, mint alatta, különben alá. A szélesség a tartalomhoz
  // igazodik (`w-max`, legfeljebb TOOLTIP_SZELESSEG); `w-max` nélkül a jobb szél közelében a
  // maradék helyre keskenyedne.
  const lent = hover.magassag - hover.y > hover.y;
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 w-max rounded-md bg-foreground px-2.5 py-2 text-[11px] leading-snug text-background shadow-lg"
      style={{
        maxWidth: TOOLTIP_SZELESSEG,
        left: hover.x,
        top: lent ? hover.y + 16 : hover.y - 12,
        transform: lent ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
      }}
    >
      <p className="mb-0.5 text-xs font-semibold">{hover.nev}</p>
      {o ? (
        <>
          <AttaseSorok o={o} />
          {sor && <p className="text-background/70">{sor}</p>}
          <p className="text-background/70">{ALLAPOT_CIMKE[o.allapot]}{o.ev ? ` · ${o.ev}` : ''}</p>
          {o.iparagak.length > 0 && <p className="text-background/70">Kiemelt: {o.iparagak.slice(0, 2).join(', ')}</p>}
        </>
      ) : (
        <p className="text-background/70">Nincs kihelyezett TéT attasé</p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: `VilagTerkep.tsx` – a vízszintes korlát a konstansból**

Az import (17. sor):

```tsx
import { TerkepTooltip, type HoverAllapot } from './TerkepTooltip';
```

helyett:

```tsx
import { TerkepTooltip, TOOLTIP_SZELESSEG, type HoverAllapot } from './TerkepTooltip';
```

Az `onHover`-ben ez a két sor:

```tsx
    // 120 = a tooltip fél szélessége (max-w-60 → 240 px), hogy ne lógjon ki a konténerből.
    const x = Math.min(Math.max(e.clientX - box.left, 120), box.width - 120);
```

helyett:

```tsx
    // A tooltip középre igazított (translate -50%): a legnagyobb szélessége felével beljebb tartva nem lóg ki a konténerből.
    const fel = TOOLTIP_SZELESSEG / 2;
    const x = Math.min(Math.max(e.clientX - box.left, fel), box.width - fel);
```

A `useCallback` függőséglistája marad `[]`: a `TOOLTIP_SZELESSEG` modulszintű konstans.

- [ ] **Step 4: `ProfilKivonat.tsx` – a teljes részterület**

A `CardDescription` blokk:

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
            </CardDescription>
```

helyett:

```tsx
            <CardDescription className="flex flex-col gap-1">
              {o.attasek.length === 0 ? (
                <span>nincs aktív attasé</span>
              ) : (
                o.attasek.map((at) => (
                  <span key={at.userId}>
                    {attaseFelirat(at, o.kod)}
                    {o.attasek.length > 1 && at.vezeto ? ' · relációs vezető' : ''}
                    {/* A teljes részterület (a tooltip csak 2 sort mutat); a beírt sortörések megmaradnak, mint a profil oldalán. */}
                    {at.reszterulet && (
                      <span className="block text-xs break-words whitespace-pre-wrap">{at.reszterulet}</span>
                    )}
                  </span>
                ))
              )}
            </CardDescription>
```

- [ ] **Step 5: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: hibátlan (nincs kimenet).

- [ ] **Step 6: Az ellenőrzés az új kódon**

```bash
$B goto http://localhost:3000/terkep >/dev/null && $B wait '[data-pinek] > g'
$B eval "$S/tooltip-qa.js"
$B goto 'http://localhost:3000/terkep?o=DE' >/dev/null && $B wait --networkidle >/dev/null && $B eval "$S/kivonat-qa.js"
$B goto 'http://localhost:3000/terkep?o=US' >/dev/null && $B wait --networkidle >/dev/null && $B eval "$S/kivonat-qa.js"
$B goto 'http://localhost:3000/terkep?o=AT' >/dev/null && $B wait --networkidle >/dev/null && $B eval "$S/kivonat-qa.js"
$B console --errors
```

Expected:
- **Németország:** `attasek` három elem, ebben a sorrendben:
  - `{"felirat": "Kindert Judit · Berlin", "cimke": "relációs vezető", "reszterulet": {"sorok": 2, …}}`;
  - `{"felirat": "dr. Gurza László · München", "cimke": null, "reszterulet": {"sorok": 1, "vagott": false}}`;
  - `{"felirat": "Komma Krisztián · Stuttgart", "cimke": null, "reszterulet": {"sorok": 2, "vagott": false}}`.

  Kindert Judit részterülete 2 sorban, és a betűtípustól függően `vagott: true` (a 131 karakter kb. 2,5 sor 320 px-en). A `szoveg`-ben nincs „+2 attasé”, a `szelesseg` 320, a `bentVan` true.
- **USA:** két elem:
  - `{"felirat": "dr. Nagy Gabriella · New York", "cimke": "relációs vezető", "reszterulet": {"sorok": 2, "vagott": true}}`;
  - `{"felirat": "Mészáros Eleonóra · San Francisco", "cimke": null, "reszterulet": {"sorok": 2, "vagott": true}}`.

  A `szelesseg` 320.
- **Írország:** `[{"felirat": "Balogh András Zoltán · regionálisan (London)", "cimke": null, "reszterulet": null}]`. A `szelesseg` 240 fölött, de legfeljebb 320: már nem tördelődik a 240-es korlátnál.
- **Ausztria:** `[{"felirat": "Jávori Balázs · Bécs", "cimke": null, "reszterulet": null}]`. Keskeny tooltip (kb. 120 px).
- **`BAL` (USA) és `JOBB` (Japán):** `bentVan: true`.
- **Kivonat, `?o=DE`:** `sorok` három eleme:
  - „Kindert Judit · Berlin · relációs vezető\nBerlin, Brandenburg, … Schleswig-Holstein”;
  - „dr. Gurza László · München\nBajorország”;
  - „Komma Krisztián · Stuttgart\nBaden-Württemberg, … Hessen”.

  A felsorolás a teljes szöveg, csonkolás nélkül.
- **Kivonat, `?o=US`:** két elem. dr. Nagy Gabriella listája „Alabama”-val kezdődik és „Wisconsin”-nal végződik, Mészáros Eleonóráé „Alaszka”-val kezdődik és „Wyoming”-gal végződik.
- **Kivonat, `?o=AT`:** `["Jávori Balázs · Bécs"]`.
- **Konzol:** `console --errors` → „(no console errors)”.

Ha a lap még a régi kódot mutatja (a HMR lemaradt), `$B reload`, majd újra.

- [ ] **Step 7: Képernyőkép (vizuális ellenőrzés)**

```bash
$B goto http://localhost:3000/terkep >/dev/null && $B wait '[data-pinek] > g'
$B js "(async () => { for (const g of document.querySelectorAll('[data-pinek] > g')) { const r = g.getBoundingClientRect(); g.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 })); await new Promise((x) => setTimeout(x, 40)); if (document.querySelector('[role=tooltip] p')?.textContent === 'Amerikai Egyesült Államok') return 'ok'; } return 'nincs'; })()"
$B screenshot --viewport "$S/tooltip-us.png"
```

Expected: `ok`. A képernyőképen az USA tooltipje: a két név, dr. Nagy Gabriella mellett a világos „relációs vezető” címke, alattuk halványan 2-2 sor állam „…”-tal. A tooltip nem takarja ki a térkép nagy részét, és nem lóg ki. Olvasd be a képet (Read), és nézd meg.

- [ ] **Step 8: Commit**

```bash
git add 'app/(app)/terkep/components/TerkepTooltip.tsx' 'app/(app)/terkep/components/VilagTerkep.tsx' 'app/(app)/terkep/components/ProfilKivonat.tsx'
git commit -m "$(printf 'feat(terkep-tooltip): minden attasé a tooltipben – relációs vezető címke, 2 soros részterület, legfeljebb 4 attasé; a teljes részterület a kivonat-panelen\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 2: Dokumentáció, build, záró ellenőrzés

**Files:**
- Modify: `CLAUDE.md` (a 62. sor `/terkep` route-leírása, a 78. sor Térkép bekezdése)

- [ ] **Step 1: `CLAUDE.md` – a `/terkep` route kivonat-panelje**

Ezt a részt:

```
a jobb panel `kod` → `ProfilKivonat` (mutató-sáv + ikonos „Összehasonlítás"/„Összehasonlításban" gomb)
```

cseréld erre:

```
a jobb panel `kod` → `ProfilKivonat` (az attasék attasénként a teljes részterülettel, mutató-sáv + ikonos „Összehasonlítás"/„Összehasonlításban" gomb)
```

(A záró idézőjelek itt egyenes `"` karakterek, mint a fájlban.)

- [ ] **Step 2: `CLAUDE.md` – a tooltip leírása (Térkép bekezdés)**

Ezt a mondatot:

```
Tooltip (`TerkepTooltip`): név, az attasék rövid sora (`attasekRovid`: az első attasé – a vezető, ha van – „név · város" (város nélkül csak a név), régiósnál „név · regionálisan (város)" (város nélkül a székhely országával); több attasénál „+N attasé" utótag (N a többiek száma); attasé nélkül `null`, amit a tooltip „nincs aktív attasé" szöveggel pótol), a mutató értéke + helyezés (`ertekEsHely`, a szűrő által kizárt országnál helyezés nélkül), állapot + év, első két kiemelt iparág; arra az oldalra kerül, ahol több a hely.
```

cseréld erre:

```
Tooltip (`TerkepTooltip`): név, az attasék listája a `TerkepOrszag.attasek` sorrendjében (vezető, a többi székhelyes, a régiósak; legfeljebb 4, a többi helyén „+N további attasé"): soronként `attaseFelirat` („név · város" (város nélkül csak a név), régiósnál „név · regionálisan (város)" (város nélkül a székhely országával)), több attasénál a vezetőnél „relációs vezető" címke, alatta a részterület legfeljebb 2 sorban (`line-clamp-2`; a teljes szöveg a `ProfilKivonat`-ban); attasé nélkül „nincs aktív attasé"; utána a mutató értéke + helyezés (`ertekEsHely`, a szűrő által kizárt országnál helyezés nélkül), állapot + év, első két kiemelt iparág. Szélessége a tartalomhoz igazodik (`w-max`), legfeljebb `TOOLTIP_SZELESSEG` (320 px, inline `maxWidth`); a `VilagTerkep` `onHover`-je a kurzor x-ét ennek felével tartja a konténeren belül; arra az oldalra kerül, ahol több a hely. Az `attasekRovid` (az első attasé + „+N attasé") már csak az összehasonlító tábla „Attasé" sorát adja.
```

- [ ] **Step 3: Típusellenőrzés és build**

```bash
npx tsc --noEmit
npm run build
```

Expected: a `tsc` hibátlan, a build `✓ Compiled successfully`, és a típusellenőrzés lefut. A `db:init` és a `drizzle-kit migrate` a meglévő, naprakész DB-n nem csinál semmit. Ha a build nem létező `app/...` modulra panaszkodik, az a dev szerver elavult `.next/dev/types/validator.ts`-e (lásd CLAUDE.md): szólj a controllernek, ne töröld.

- [ ] **Step 4: Záró ellenőrzés és kijelentkezés**

```bash
$B goto http://localhost:3000/terkep >/dev/null && $B wait '[data-pinek] > g'
$B eval "$S/tooltip-qa.js"      # mint az 1. task 6. lépésében
$B console --errors             # (no console errors)
$B js "(() => { const b = [...document.querySelectorAll('aside form button[type=submit]')].find((x) => x.textContent === 'Kijelentkezés'); if (!b) return 'nincs gomb'; b.click(); return 'ok'; })()"   # ok
$B wait --networkidle >/dev/null; $B url   # http://localhost:3000/login…
```

A kijelentkezés törli a QA-session sorát a `data/tet.db`-ből.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "$(printf 'docs(terkep-tooltip): CLAUDE.md – a tooltip attasé-listája, vezető-címke, 2 soros részterület, TOOLTIP_SZELESSEG; a teljes részterület a kivonatban\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
git status --short   # legfeljebb a data/tet.db (dev szerver írásai) – nem commitoljuk
```

- [ ] **Step 6: Lezárás**

A branch kész: `superpowers:finishing-a-development-branch`. A felhasználó korábban a lokális fast-forward merge-et választotta, nem PR-t.
