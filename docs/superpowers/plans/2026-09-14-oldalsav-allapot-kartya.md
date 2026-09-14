# Oldalsáv állapot-kártya és felhasználói blokk – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Az oldalsáv aljára a fejlécből átköltözik a felhasználói blokk + Kijelentkezés, fölé egy DB-ből számolt országprofil-állapot kártya kerül (attasé: saját ország; admin: darabszámok).

**Architecture:** Új Server Component `app/(app)/components/OldalsavAllapot.tsx` a layoutból renderelve, `oldalsavAlja` ReactNode propként átadva a kliens `AppShell`-nek. Az AppShell csak elhelyezi a slotot és áthelyezi a meglévő felhasználói blokkot; DB-logika nem kerül a kliens-komponensbe. Nincs új query, nincs séma-változás.

**Tech Stack:** Next.js 16 App Router (Server Component slot → Client Component prop), React 19, Drizzle/SQLite meglévő lekérdezések (`getUtolsoEv`, `listTerkepAdat`), inline style a sidebar palettájával.

Spec: `docs/superpowers/specs/2026-09-14-oldalsav-allapot-kartya-design.md`.

**Ellenőrzés:** Nincs tesztkeretrendszer. Minden task végén `npx tsc --noEmit`; a UI-t a gstack headless böngészővel (`B=~/.claude/skills/gstack/browse/dist/browse`, parancsok: `goto/fill/click/text/js/console --errors`). A felhasználó dev szervere fut a 3000-en: **nem szabad leállítani/újraindítani**, és a subagent nem indít sajátot. Seed admin `admin@niu.hu`, jelszó a `.env.local`-ból olvasva (ne írd ki); teszt attasé `masodik.attase@niu.hu` / `Masodik1234!` (országa JP). Commit üzenetek végén: `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. `git add` mindig konkrét fájlokkal; a `.env.example`-t és az `AGENTS.md`-t soha ne stage-eld. Reviewer subagentnek: git csak olvasásra, tilos a `checkout`/`reset`/`stash`.

---

## Fájlszerkezet

| Fájl | Művelet | Felelősség |
| --- | --- | --- |
| `app/(app)/components/OldalsavAllapot.tsx` | új | Server Component: a választott ciklus profil-állapota (attasé: saját ország + link; admin: számlálók + Térkép link), vagy `null`. |
| `components/AppShell.tsx` | módosít | `oldalsavAlja` prop; a felhasználói blokk + `LogoutForm` a fejlécből az oldalsáv aljára. |
| `app/(app)/layout.tsx` | módosít | `OldalsavAllapot` renderelése és átadása. |
| `CLAUDE.md`, `README.md` | módosít | UI shell bekezdés, AppShell sor. |

---

### Task 1: `OldalsavAllapot` Server Component

**Files:**
- Create: `app/(app)/components/OldalsavAllapot.tsx`

- [ ] **Step 1: A komponens megírása**

```tsx
import Link from 'next/link';
import { getUtolsoEv, listTerkepAdat } from '../../../db/queries/orszagprofil';
import { canEditProfil } from '../../../lib/orszagprofil-jog';
import { ALLAPOTOK, ALLAPOT_CIMKE, ALLAPOT_SZINEK, profilAllapot, type Allapot } from '../../../lib/orszagprofil-szotar';
import type { AppSession } from '../../../lib/session';

// Az oldalsáv alján megjelenő állapot-kártya. Server Component: a layout rendereli és
// ReactNode-ként adja az AppShell `oldalsavAlja` propjának, így a DB-lekérdezés nem kerül
// a kliens-komponensbe. A színek a térképpel közös szótárból jönnek (ALLAPOT_SZINEK), inline
// style-lal; az AllapotBadge szándékosan nincs újrahasználva, az világos háttérre van hangolva.
//
// Frissülés: a mentBlokkAction, a valasztEvAction és a felhasználó-műveletek
// revalidatePath('/', 'layout')-ot hívnak; kliens-oldali navigációnál a layout nem fut újra
// (ugyanaz az elfogadott késés, mint az olvasatlan-számlálónál).

const SZOVEG = '#8d97a5';
const CIM = '#c3cbd6';
const LINK = '#a3adbb';

function Potty({ allapot }: { allapot: Allapot }) {
  return (
    <span aria-hidden style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: ALLAPOT_SZINEK[allapot], flex: '0 0 8px',
    }} />
  );
}

function Keret({ cim, link, children }: { cim: string; link: { href: string; felirat: string }; children: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 18px', borderTop: '1px solid #232c39', fontSize: 11.5, color: SZOVEG, lineHeight: 1.6 }}>
      <div style={{ color: CIM, fontWeight: 600 }}>{cim}</div>
      <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>{children}</div>
      <Link href={link.href} style={{ display: 'inline-block', marginTop: 6, color: LINK, textDecoration: 'none', fontWeight: 500 }}>
        {link.felirat} →
      </Link>
    </div>
  );
}

export default function OldalsavAllapot({ session, ev, most }: { session: AppSession; ev: number; most: number }) {
  if (session.role === 'admin') {
    const szamok: Record<Allapot, number> = { friss: 0, elavult: 0, nincs: 0 };
    for (const o of listTerkepAdat(ev)) szamok[o.allapot] += 1;
    return (
      <Keret cim={`Országprofilok · ${ev}`} link={{ href: '/terkep', felirat: 'Térkép' }}>
        {ALLAPOTOK.map((a) => (
          <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Potty allapot={a} />
            <span>{ALLAPOT_CIMKE[a]}</span>
            <span style={{ marginLeft: 'auto', color: CIM, fontVariantNumeric: 'tabular-nums' }}>{szamok[a]}</span>
          </div>
        ))}
      </Keret>
    );
  }

  const kod = session.orszag;
  if (!kod) return null;
  const utolsoEv = getUtolsoEv(kod, ev);
  const allapot = profilAllapot(utolsoEv, ev);
  const link = canEditProfil(session, kod, ev, most)
    ? { href: `/orszagprofil/${kod}/szerkesztes`, felirat: 'Szerkesztés' }
    : { href: `/orszagprofil/${kod}`, felirat: 'Megnyitás' };
  return (
    <Keret cim={`Országprofil · ${ev}`} link={link}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Potty allapot={allapot} />
        <span>{ALLAPOT_CIMKE[allapot]}{allapot === 'elavult' && utolsoEv ? ` · ${utolsoEv}` : ''}</span>
      </div>
    </Keret>
  );
}
```

- [ ] **Step 2: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: nincs kimenet (0 hiba). Ha a `../../../db/queries/orszagprofil` import `server-only` hibát ad, az csak tsx-scriptből fordulhat elő, a Next buildben nem; a layout Server Componentből hívja.

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/components/OldalsavAllapot.tsx"
git commit -m "feat(shell): OldalsavAllapot kártya – országprofil állapota a választott ciklusra

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: AppShell – `oldalsavAlja` slot és a felhasználói blokk átköltöztetése

**Files:**
- Modify: `components/AppShell.tsx` (props blokk ~95–110; az `</nav>` utáni rész ~176–178; a `<header>` jobb oldala ~192–214)

- [ ] **Step 1: Új prop a szignatúrában**

A destrukturálásba az `evek,` után:

```tsx
  evek,
  oldalsavAlja,
  children,
```

A prop-típusba az `evek: number[];` után:

```tsx
  evek: number[];
  /** Az oldalsáv aljára szánt szerver-renderelt tartalom (OldalsavAllapot), a felhasználói blokk fölé. */
  oldalsavAlja?: ReactNode;
  children: ReactNode;
```

- [ ] **Step 2: Az oldalsáv alja – slot + felhasználói blokk**

A `</nav>` és az `</aside>` közé (jelenleg üres) ezt tedd:

```tsx
          </nav>
          <div style={{ marginTop: 'auto' }}>
            {oldalsavAlja}
            <div style={{ padding: '14px 18px', borderTop: '1px solid #232c39' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{
                  width: 29, height: 29, borderRadius: '50%', background: '#1b3a6b', color: '#fff', flex: '0 0 29px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600,
                }}>{ini(user.name)}</div>
                <div style={{ lineHeight: 1.25, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#e7ebf1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                  <div style={{ fontSize: 10.5, color: '#8d97a5' }}>{roleLabel}</div>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <LogoutForm action={logoutAction} />
              </div>
            </div>
          </div>
        </aside>
```

- [ ] **Step 3: A fejléc jobb oldalának szűkítése**

A `<header>` jobb oldali `div`-jéből (`marginLeft: 'auto'`) töröld a felhasználói `div`-et (avatar + név + roleLabel, a `borderLeft`-es blokk) és a `<LogoutForm action={logoutAction} />` sort. Maradjon:

```tsx
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: '#6b7684' }}>
                Ciklus
                <select className="input" value={optimistaEv} aria-busy={evValtasFut} onChange={(e) => valasztEv(e.target.value)}>
                  {evek.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </label>
            </div>
```

- [ ] **Step 4: LogoutForm a keskeny sávhoz**

A `LogoutForm` `<form>` style-ját egészítsd ki `flexWrap: 'wrap'`-pal, a gomb legyen teljes szélességű, a hibaüzenet a gomb fölé kerüljön (a hiba `span` marad az első gyerek):

```tsx
function LogoutForm({ action }: { action: LogoutAction }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
      {state.error && (
        <span role="alert" style={{ fontSize: 11, color: '#f2a6a0', flexBasis: '100%' }}>{state.error}</span>
      )}
      <button type="submit" className="btn" style={{ fontSize: 11.5, width: '100%' }} disabled={pending}>
        {pending ? 'Kijelentkezés…' : 'Kijelentkezés'}
      </button>
    </form>
  );
}
```

(A hiba színe a sötét háttéren világos-piros; a `.btn` globális osztály világos gombot ad, ez a sötét sávon is olvasható.)

- [ ] **Step 5: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: 0 hiba. Ellenőrizd, hogy a `borderLeft: '1px solid #dde1e7'` string már sehol nincs az AppShell-ben: `grep -n "borderLeft" components/AppShell.tsx` → üres.

- [ ] **Step 6: Commit**

```bash
git add components/AppShell.tsx
git commit -m "feat(shell): felhasználói blokk és kijelentkezés az oldalsáv aljára, oldalsavAlja slot

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Layout bekötés, build, böngészős ellenőrzés

**Files:**
- Modify: `app/(app)/layout.tsx`

- [ ] **Step 1: Import és renderelés a layoutban**

Import (a többi relatív import mellé):

```tsx
import OldalsavAllapot from './components/OldalsavAllapot';
```

Az `<AppShell ...>` hívásba az `evek={evek}` után:

```tsx
      evek={evek}
      oldalsavAlja={<OldalsavAllapot session={session} ev={ev} most={most} />}
    >
```

- [ ] **Step 2: Típusellenőrzés és build**

Run: `npx tsc --noEmit && npm run build`
Expected: 0 típushiba, a build zöld. Ha a build nem létező `app/...` modulra panaszkodik, `rm .next/dev/types/validator.ts` és újra.

- [ ] **Step 3: Böngészős ellenőrzés attaséval**

`B=~/.claude/skills/gstack/browse/dist/browse`, dev szerver a 3000-en:

1. `$B goto http://localhost:3000/login`, `$B fill` e-mail `masodik.attase@niu.hu`, jelszó `Masodik1234!`, `$B click` a bejelentkezés gombra.
2. `$B goto http://localhost:3000/terkep`, majd `$B text`.
   Expected: tartalmazza „Országprofil · 2026”, egy állapotfeliratot (JP 2026-ra van „kapcsolatok” blokk, tehát „Adott évi profil”), „Szerkesztés →”, és az oldalsávban a nevet + „TéT attasé · Japán”. A `header`-ben nincs név: `$B js "document.querySelector('header').innerText"` → csak cím, alcím és „Ciklus”.
3. `$B js "document.querySelector('aside a[href=\"/orszagprofil/JP/szerkesztes\"]')?.textContent"` → „Szerkesztés →”.
4. Ciklusváltás 2025-re: `$B js "const s=document.querySelector('header select'); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(s,'2025'); s.dispatchEvent(new Event('change',{bubbles:true}))"`, majd `$B text`.
   Expected: „Országprofil · 2025”, „Adott évi profil” (JP 2025 létezik), és `aside a[href="/orszagprofil/JP"]` szövege „Megnyitás →” (2025 nem szerkeszthető attasénak). Váltsd vissza 2026-ra ugyanígy.
5. `$B console --errors` → üres.
6. Kijelentkezés: `$B click` az oldalsáv „Kijelentkezés” gombjára → a `/login` jelenik meg.

- [ ] **Step 4: Böngészős ellenőrzés adminnal**

1. `$B goto http://localhost:3000/login`, bejelentkezés `admin@niu.hu`-val (jelszó a `.env.local`-ból).
2. `$B goto http://localhost:3000/terkep`, `$B text`.
   Expected: „Országprofilok · 2026”, három sor „Adott évi profil N”, „Elavult profil N”, „Nincs profil N”, „Térkép →”; a névblokk „NIÜ admin”.
3. Keresztellenőrzés: `$B js "JSON.stringify([...document.querySelectorAll('aside div')].map(d=>d.innerText).filter(t=>/profil \\d+$/.test(t)))"` – a számok összege egyezzen a térkép pinjeinek számával: `$B js "document.querySelector('tet-world-map')?.getAttribute('data') && JSON.parse(document.querySelector('tet-world-map').getAttribute('data')).orszagok.length"`.
4. `$B console --errors` → üres.

- [ ] **Step 5: Commit**

```bash
git add "app/(app)/layout.tsx"
git commit -m "feat(shell): OldalsavAllapot a layoutból az oldalsáv aljára

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Dokumentáció

**Files:**
- Modify: `CLAUDE.md` (a „**UI shell.**” bekezdés)
- Modify: `README.md:63`

- [ ] **Step 1: CLAUDE.md UI shell bekezdés**

A bekezdésben az „…és a fejléc ciklusválasztóját (`ev`: …; `evek`: …).” mondat után szúrd be:

```
Az oldalsáv alján a felhasználói blokk (monogram, név, szerep · ország) és a `LogoutForm` van (nem a fejlécben), fölötte az `oldalsavAlja` slot: a layout a `app/(app)/components/OldalsavAllapot.tsx` Server Componentet adja át (attasé: a saját ország állapota a választott évre `getUtolsoEv` + `profilAllapot`-ból, „Szerkesztés” link `canEditProfil` mellett, különben „Megnyitás”; admin: `listTerkepAdat(ev)` állapot szerinti darabszámai + „Térkép” link; ország nélküli attasénak `null`). A kártya inline style-lal, `ALLAPOT_SZINEK`-ből színez; az `AllapotBadge` világos háttérre készült, ezért nincs újrahasználva.
```

- [ ] **Step 2: README AppShell sora**

A 63. sort cseréld:

```
- `components/AppShell.tsx` – sidebar (menü, országprofil-állapot kártya, bejelentkezett felhasználó, kijelentkezés), fejléc (oldalcím, ciklusválasztó – a választott év `tet-ev` cookie-ban; a térkép, az országprofil és a szerkesztő is ezt az évet mutatja)
- `app/(app)/components/OldalsavAllapot.tsx` – az oldalsáv állapot-kártyája (attasé: saját ország, admin: darabszámok a választott ciklusra)
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "docs(shell): oldalsáv állapot-kártya és felhasználói blokk a CLAUDE.md-ben és README-ben

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

## Megvalósítási eltérések (a review-k után, végleges kód)

Lásd a spec „Eltérések a megvalósításban" szakaszát. Röviden: `aria-hidden` a link nyilán és az avataron; `overflowY: auto` az `<aside>`-on; `getUtolsoEv`/`listTerkepAdat` React `cache()`-ben (+ „ne mutáld" JSDoc); a layout kommentje az állapot-kártyát is említi; a CLAUDE.md `cache()` mondata a lekérdezés-lista után önálló mondat. A browser-ellenőrzés adminnal 2/0/0 (2026), attaséval JP „Adott évi profil" + Szerkesztés (2026) / Megnyitás (2025).
