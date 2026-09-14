# Ciklusválasztó valódi évekből – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A fejléc „Ciklus” választója a demó `CYCLES` lista helyett az adatbázis országprofil-éveiből és az aktuális évből választ; a választás kliens-oldali kontextus marad.

**Architecture:** Új `listProfilEvek()` lekérdezés a `db/queries/orszagprofil.ts`-ben (distinct `ev`, csökkenő). Az `app/(app)/layout.tsx` ezt az `aktualisEv()`-vel egyesíti, és `evek` + `aktualisEv` propként adja az `AppShell`-nek, ugyanúgy, mint az `olvasatlan`-t. Az `AppShell` `cycle: string` állapota `ev: number` lesz; egyetlen fogyasztója a monitoring oldal címe. A `mentBlokkAction` a layoutot is revalidálja.

**Tech Stack:** Next.js 16 App Router (Server Component layout, `revalidatePath`), React 19, TypeScript 7, drizzle-orm (`selectDistinct`) + better-sqlite3.

**Spec:** `docs/superpowers/specs/2026-09-14-ciklus-evvalaszto-design.md`.

**Ellenőrzés:** Nincs tesztkeretrendszer. Minden task végén `npx tsc --noEmit`; a lekérdezést eldobható tsx scripttel (`scripts/_x.ts`, utána törlendő, `NODE_OPTIONS="--conditions=react-server"` a `server-only` guard miatt); a UI-t a gstack headless böngészővel (`~/.claude/skills/gstack/browse/dist/browse goto/fill/click/text/js/snapshot -i/console --errors`). A felhasználó dev szervere fut a 3000-en: **nem szabad leállítani/újraindítani**, és a subagent nem indít sajátot. Seed admin `admin@niu.hu`, a jelszót a `.env.local`-ból olvasd, ne írd ki. Commit üzenetek végén: `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. `git add` mindig konkrét fájlokkal; a `.env.example`-t és az `AGENTS.md`-t soha ne stage-eld. Reviewer subagentnek: git csak olvasásra, tilos a `checkout`/`reset`/`stash`.

**Fontos tények (ellenőrizve a meglévő kódban):**
- `components/AppShell.tsx` már használja a „prop változásra állapot igazítása” mintát az `olvasatlan`-nál (render közbeni `setState`, ha a szerver-prop változott).
- A `cycle`-t egyedül `app/(app)/monitoring/page.tsx` olvassa (`const { cycle } = useApp()`), grep-pel ellenőrizve.
- `lib/data.ts` `CYCLES` és `DEFAULT_CYCLE` konstansait csak az `AppShell` importálja; a `DEADLINE` marad.
- Drizzle SQLite: `db.selectDistinct({ ev: orszagprofil.ev }).from(orszagprofil).orderBy(desc(orszagprofil.ev)).all()`.
- A helyi DB-ben QA-adat van: KR 2026, JP 2025, JP 2026 → a várt évlista `[2026, 2025]`.

---

### Task 1: Lekérdezés, layout, AppShell, monitoring

Egy taskban, mert a típusváltás (`cycle: string` → `ev: number`) csak együtt fordul.

**Files:**
- Modify: `db/queries/orszagprofil.ts` (a `listEvek` után)
- Modify: `app/(app)/layout.tsx`
- Modify: `components/AppShell.tsx`
- Modify: `app/(app)/monitoring/page.tsx:9,19`

- [x] **Step 1: Új lekérdezés**

`db/queries/orszagprofil.ts`, közvetlenül a `listEvek` függvény után:

```ts
/** Az összes ország profil-évei egyszer, csökkenő sorrendben (fejléc ciklusválasztó). */
export function listProfilEvek(): number[] {
  return db
    .selectDistinct({ ev: orszagprofil.ev })
    .from(orszagprofil)
    .orderBy(desc(orszagprofil.ev))
    .all()
    .map((r) => r.ev);
}
```

- [x] **Step 2: Lekérdezés ellenőrzése eldobható scripttel**

`scripts/_x.ts`:

```ts
import { listProfilEvek } from '../db/queries/orszagprofil';
console.log(JSON.stringify(listProfilEvek()));
```

Run: `NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_x.ts`
Expected: `[2026,2025]` (a helyi QA-adat szerint; ha más évek vannak a DB-ben, csökkenő, ismétlés nélküli lista).
Utána: `rm scripts/_x.ts`.

- [x] **Step 3: Layout**

`app/(app)/layout.tsx` teljes új tartalma:

```tsx
import AppShell from '../../components/AppShell';
import { listProfilEvek } from '../../db/queries/orszagprofil';
import { countOlvasatlan } from '../../db/queries/ticket';
import { aktualisEv } from '../../lib/datum';
import { requireSession } from '../../lib/session';
import { logoutAction } from './actions';

// Minden védett oldal ebben a route groupban van. A requireSession() itt egy helyen
// kényszeríti ki a bejelentkezést (elavult cookie esetén is: a proxy átengedi, ez
// viszont /login-ra irányít). A /login a gyökér layout alatt marad.
//
// Ez NEM helyettesíti az oldalankénti és action-önkénti ellenőrzést: kliens-oldali
// navigációnál a layout nem fut újra, a server action-ök pedig egyáltalán nem
// renderelnek layoutot. Minden szerver-oldali adatot olvasó page és minden action
// maga hívja a requireSession()/requireAdmin()-t.
//
// Az olvasatlan ticket-számláló és a ciklusválasztó évlistája ugyanezért kliens-oldali
// navigációnál késhet: a ticket- és a profil-mentő action-ök revalidatePath('/', 'layout')-tal
// frissítik.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const olvasatlan = countOlvasatlan(session);
  const most = aktualisEv();
  // A fejléc ciklusválasztója: a DB-ben létező profil-évek + az aktuális év, csökkenő sorrendben.
  const evek = [...new Set([most, ...listProfilEvek()])].sort((a, b) => b - a);
  return (
    <AppShell user={session} logoutAction={logoutAction} olvasatlan={olvasatlan} evek={evek} aktualisEv={most}>
      {children}
    </AppShell>
  );
}
```

- [x] **Step 4: AppShell – import, context-típus, propok, állapot**

`components/AppShell.tsx` módosítások:

Import sor (7. sor) cseréje:

```ts
import { DEADLINE } from '../lib/data';
```

`AppState` interfész:

```ts
interface AppState {
  user: AppSession;
  /** A fejlécben kiválasztott ciklus (év). Kliens-oldali kontextus, a monitoring cím és a sidebar sora mutatja. */
  ev: number;
  setEv: (ev: number) => void;
  /** Olvasatlan, nem lezárt ticketek száma – a Kommunikáció menüpont számlálója. */
  olvasatlan: number;
  /** A /kommunikacio oldal írja felül a saját, frissebb számával (OlvasatlanSzinkron). */
  setOlvasatlan: (n: number) => void;
}
```

A komponens szignatúrája és az állapot-blokk (a `const [cycle, setCycle] = useState(DEFAULT_CYCLE);` sor helyett):

```tsx
export default function AppShell({
  user,
  logoutAction,
  olvasatlan: szerverOlvasatlan,
  evek,
  aktualisEv,
  children,
}: {
  user: AppSession;
  logoutAction: LogoutAction;
  /** Olvasatlan, nem lezárt ticketek száma a layoutból – a menü-számláló kiindulópontja. */
  olvasatlan: number;
  /** A ciklusválasztó évei a layoutból: DB profil-évek + aktuális év, csökkenő, nem üres. */
  evek: number[];
  aktualisEv: number;
  children: ReactNode;
}) {
  const [ev, setEv] = useState(aktualisEv);
  // Ha a layout újrarenderelésekor a kiválasztott év már nincs a listában (pl. a DB-ből
  // eltűnt), az aktuális évre állunk – render közbeni igazítás, mint az olvasatlan-nál.
  if (!evek.includes(ev)) setEv(aktualisEv);
```

(A meglévő `olvasatlan`/`elozoSzerver` blokk változatlanul marad utána. A jelenlegi destrukturálás már `olvasatlan: szerverOlvasatlan`-t használ; csak az `evek`, `aktualisEv` propot add hozzá.)

Provider value:

```tsx
<AppContext.Provider value={{ user, ev, setEv, olvasatlan, setOlvasatlan }}>
```

Sidebar sora:

```tsx
<div style={{ color: '#c3cbd6', fontWeight: 600, fontSize: 11.5 }}>Aktív ciklus: {ev}</div>
```

Fejléc select:

```tsx
<label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: '#6b7684' }}>
  Ciklus
  <select className="input" value={ev} onChange={(e) => setEv(Number(e.target.value))}>
    {evek.map((e) => <option key={e} value={e}>{e}</option>)}
  </select>
</label>
```

- [x] **Step 5: Monitoring fogyasztó**

`app/(app)/monitoring/page.tsx`:

```tsx
const { ev } = useApp();
```

és

```tsx
<h3>Hálózati rangsor · {ev}</h3>
```

- [x] **Step 6: Típusellenőrzés és grep**

Run: `npx tsc --noEmit`
Expected: nincs hiba.

Run: `grep -rn "cycle\|CYCLES\|DEFAULT_CYCLE" app components --include='*.ts' --include='*.tsx'`
Expected: üres.

- [x] **Step 7: Böngészős ellenőrzés**

A gstack böngészővel (`B=~/.claude/skills/gstack/browse/dist/browse`), a dev szerver a 3000-en:

1. `$B goto http://localhost:3000/login`, `$B fill` e-mail `admin@niu.hu` és jelszó a `.env.local`-ból, `$B click` a bejelentkezés gombra.
2. `$B goto http://localhost:3000/monitoring`, majd `$B js "[...document.querySelectorAll('header select option')].map(o => o.value)"`
   Expected: `["2026","2025"]` (a helyi DB szerint), a select értéke `2026`.
3. `$B text` tartalmazza: „Hálózati rangsor · 2026” és „Aktív ciklus: 2026”.
4. `$B js "const s=document.querySelector('header select'); s.value='2025'; s.dispatchEvent(new Event('change',{bubbles:true}))"` – React vezérelt selectnél ha ez nem vált, használd: `$B js "const s=document.querySelector('header select'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(s,'2025'); s.dispatchEvent(new Event('change',{bubbles:true}))"`.
   Expected: `$B text` tartalmazza „Hálózati rangsor · 2025” és „Aktív ciklus: 2025”.
5. `$B console --errors`: üres.

- [x] **Step 8: Commit**

```bash
git add db/queries/orszagprofil.ts "app/(app)/layout.tsx" components/AppShell.tsx "app/(app)/monitoring/page.tsx"
git commit -m "feat(ciklus): fejléc ciklusválasztó az országprofil éveiből

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Layout revalidálás, demó-konstansok törlése, dokumentáció

**Files:**
- Modify: `app/(app)/orszagprofil/actions.ts:54-56`
- Modify: `lib/data.ts:226-227`
- Modify: `CLAUDE.md` (UI shell bekezdés)
- Modify: `README.md:63`

- [x] **Step 1: Layout revalidálás a profil-mentő actionben**

`app/(app)/orszagprofil/actions.ts`, a meglévő három `revalidatePath` hívás után, a `return { ok: true };` elé:

```ts
  // A fejléc ciklusválasztója (layout) a DB profil-éveiből épül: új év első mentése után
  // kliens-oldali navigációnál is frissüljön.
  revalidatePath('/', 'layout');
```

- [x] **Step 2: Demó-konstansok törlése**

`lib/data.ts`: töröld ezt a két sort:

```ts
export const CYCLES = ['2025 Q4', '2026 Q1', '2026 Q2', '2026 Q3'];
export const DEFAULT_CYCLE = '2026 Q2';
```

A `DEADLINE`, `SCORE_THRESHOLD`, `ME_ID` marad.

- [x] **Step 3: Típusellenőrzés és build**

Run: `npx tsc --noEmit`
Expected: nincs hiba.

Run: `npm run build`
Expected: sikeres build. (Ha nem létező `app/...` modulra panaszkodik, `rm .next/dev/types/validator.ts` és újra – lásd CLAUDE.md.)

- [x] **Step 4: CLAUDE.md**

Az **UI shell** bekezdésben ezt a mondatot:

```
az `app/(app)/layout.tsx` `requireSession()`-t hív és a `components/AppShell.tsx`-nek propként adja a usert (`user: AppSession`), a `logoutAction`-t és az olvasatlan ticketek számát (`olvasatlan`).
```

cseréld erre:

```
az `app/(app)/layout.tsx` `requireSession()`-t hív és a `components/AppShell.tsx`-nek propként adja a usert (`user: AppSession`), a `logoutAction`-t, az olvasatlan ticketek számát (`olvasatlan`) és a fejléc ciklusválasztójának évlistáját (`evek`: a `listProfilEvek()` distinct profil-évei + `aktualisEv`, csökkenő).
```

És ezt:

```
Az AppShell context-je (`useApp()`: `user`, `cycle`, `setCycle`, `olvasatlan`, `setOlvasatlan`) csak a provideren belül használható; a `cycle` váltó még kliens-oldali demó.
```

erre:

```
Az AppShell context-je (`useApp()`: `user`, `ev`, `setEv`, `olvasatlan`, `setOlvasatlan`) csak a provideren belül használható; a kiválasztott `ev` kliens-oldali kontextus (alapértéke az aktuális év, a listából kikerülő év az aktuálisra áll vissza), egyelőre csak a monitoring cím és a sidebar „Aktív ciklus" sora használja – a térkép és a profil oldalak évkezelése ettől független. A `mentBlokkAction` ezért a layoutot is revalidálja.
```

- [x] **Step 5: README**

`README.md` 63. sor:

```
- `components/AppShell.tsx` – sidebar, fejléc (bejelentkezett felhasználó, kijelentkezés), ciklusválasztó (React context, az évek a DB országprofil-éveiből + aktuális év)
```

- [x] **Step 6: Böngészős ellenőrzés a revalidálásra**

A gstack böngészővel, adminként bejelentkezve (mint a Task 1 Step 7):

1. `$B goto http://localhost:3000/orszagprofil/KR/szerkesztes?ev=2024` – admin bármely `EV_MIN` (2020)..aktuális évet szerkeszthet, a 2024-es KR profil még nem létezik a helyi DB-ben.
2. Az „Alapadatok” blokkban a `lakossag` mezőbe (id: `alapadatok.lakossag`) írj `51 700 000`-t (`$B fill`), és kattints az Alapadatok blokk Mentés gombjára (`$B snapshot -i` mutatja a gomb refjét).
3. `$B goto http://localhost:3000/monitoring`, majd `$B js "[...document.querySelectorAll('header select option')].map(o => o.value)"`
   Expected: a lista most tartalmazza az új évet is, csökkenő sorrendben (pl. `["2026","2025","2024"]`).
4. Takarítás: töröld a QA-sort, hogy a DB ne szemetelődjön:
   `NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_x.ts` a következő tartalommal, majd `rm scripts/_x.ts`:

```ts
import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { orszagprofil } from '../db/schema';
db.delete(orszagprofil).where(and(eq(orszagprofil.orszagKod, 'KR'), eq(orszagprofil.ev, 2024))).run();
console.log('törölve');
```

(Az évet cseréld arra, amit a 1. pontban használtál.)

- [x] **Step 7: Commit**

```bash
git add "app/(app)/orszagprofil/actions.ts" lib/data.ts CLAUDE.md README.md
git commit -m "chore(ciklus): layout revalidálás profil-mentéskor, demó CYCLES törlése, docs

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Megvalósítási eltérések (a review-k után, végleges kód)

- **AppShell render-közbeni igazítás** (`components/AppShell.tsx`): a terv `if (!evek.includes(ev)) setEv(aktualisEv);` sora `if (!evek.includes(ev) && ev !== aktualisEv) setEv(aktualisEv);` lett. A React render-fázisú `setState` megkerüli az azonos-érték bailoutot, ezért a tervbeli forma végtelen render-ciklusba futott volna, ha a hívó olyan `evek`-et adna, amiben nincs benne az aktuális év. A komment is pontosabb: nem prop-változás-figyelés (mint az `olvasatlan`-nál), hanem invariáns-fenntartás. A fejléc `evek.map((e) => …)` map-változója `y` lett, hogy ne olvasson eseményparaméternek.
- **`mentBlokkAction` revalidálás** (`app/(app)/orszagprofil/actions.ts`): a terv négy hívása (`/terkep`, a két profil-útvonal és `('/', 'layout')`) egyetlen `revalidatePath('/', 'layout')`-ra csökkent, mert a layout-tag minden route implicit tagjében szerepel, tehát a másik hármat lefedi (a ticket-actionök ugyanezt a mintát követik).
- **CLAUDE.md**: az Országprofil bekezdés lekérdezés-listája is megkapta a `listProfilEvek`-et, és az UI shell bekezdés az egyetlen layout-revalidálást írja le.
- A Task 1 review által nyitva hagyott, tudatosan nem javított pontok: az `aktualisEv` prop-név egybeesik a `lib/datum` függvénynévvel (az AppShell nem importálja); a fejléc `<select>` a régi `.input` osztályon maradt (az egész fejléc még inline-style, a `NativeSelect` külön feladat); `listEvek`/`listProfilEvek` névpár; a lekérdezés nem szűr `EV_MIN` alá (íráskor a `canEditProfil` kényszeríti a tartományt).
