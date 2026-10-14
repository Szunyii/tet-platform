# Országprofil-szerkesztő: nem szerkeszthető év – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A szerkesztő oldalon a fejlécben választott, nem szerkeszthető (de olvasható) év ne 404-et adjon, hanem tájékoztató kártyát, így az évváltás után a visszaváltás is működjön.

**Architecture:** A szerkesztő page (`app/(app)/orszagprofil/[kod]/szerkesztes/page.tsx`) három ágra bomlik: szerkeszthető év → a mai 9 blokk; nem szerkeszthető, de az aktuális év igen → új `NemSzerkeszthetoEv` Server Component kártya; az aktuális év sem → `notFound()`. A kártya gombja a meglévő `SzerkesztesGomb` form-ága (`valasztEvAction`).

**Tech Stack:** Next.js 16 App Router (Server Components, server actions), React 19, TypeScript, shadcn/ui (`Card`, `buttonVariants`).

Spec: `docs/superpowers/specs/2026-10-14-szerkeszto-evvaltas-design.md`. Ág: `szerkeszto-evvaltas`.

**Tesztkeretrendszer nincs** (CLAUDE.md): az ellenőrzés `npx tsc --noEmit`, `npm run build`, és a 3. task böngészős QA-ja. A hibát a QA előtt a futó dev szerveren már reprodukáltuk (spec, „A hiba”), a 3. task ugyanazokat a lépéseket játssza le a javítás után.

## Fájlok

- Create: `app/(app)/orszagprofil/components/NemSzerkeszthetoEv.tsx` – a tájékoztató kártya (szöveg + „Vissza a szerkesztéshez (<most>)” + „A(z) <ev>. évi profil megtekintése”).
- Modify: `app/(app)/orszagprofil/[kod]/szerkesztes/page.tsx` – a három ág, doc-komment.
- Modify: `CLAUDE.md` – az Országprofil route-leírása és az „Amire figyelni kell” lista.
- Modify: `components/orszagprofil/SzerkesztesGomb.tsx` – a doc-komment felsorolja az új hívóhelyet (a `NemSzerkeszthetoEv` kártya; a review nyomán).

---

### Task 1: A `NemSzerkeszthetoEv` kártya és a szerkesztő page három ága

**Files:**
- Create: `app/(app)/orszagprofil/components/NemSzerkeszthetoEv.tsx`
- Modify: `app/(app)/orszagprofil/[kod]/szerkesztes/page.tsx` (az egész fájl, lásd lent)

- [ ] **Step 1: A kártya-komponens**

`app/(app)/orszagprofil/components/NemSzerkeszthetoEv.tsx` (Server Component, nincs `'use client'`; a `SzerkesztesGomb` szerver-kompatibilis, a kliens-részt a `KuldGomb` adja):

```tsx
import Link from 'next/link';
import { SzerkesztesGomb } from '../../../../components/orszagprofil/SzerkesztesGomb';
import { buttonVariants } from '../../../../components/ui/button';
import { Card, CardContent, CardFooter } from '../../../../components/ui/card';

/**
 * A szerkesztő ezt mutatja az űrlapok helyett, ha a fejlécben választott év nem szerkeszthető,
 * de az aktuális igen (relációs vezető attasé múltbeli évvel; a miértjét lásd a szerkesztő
 * page-en). A gomb a SzerkesztesGomb form-ága: a valasztEvAction az aktuális évre állítja a
 * ciklust és a szerkesztőre irányít.
 */
export function NemSzerkeszthetoEv({
  kod, ev, most, action,
}: {
  kod: string;
  /** A választott, nem szerkeszthető év. */
  ev: number;
  most: number;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <Card>
      <CardContent>
        <p>
          A(z) {ev}. évi profil csak megtekinthető; szerkeszteni a(z) {most}. évi profilt lehet.
        </p>
      </CardContent>
      <CardFooter className="flex-wrap gap-3">
        <SzerkesztesGomb
          kod={kod}
          most={most}
          szerkeszthetEv={false}
          szerkeszthetMost
          action={action}
          felirat="Vissza a szerkesztéshez"
        />
        <Link href={`/orszagprofil/${kod}`} className={buttonVariants({ variant: 'outline' })}>
          A(z) {ev}. évi profil megtekintése
        </Link>
      </CardFooter>
    </Card>
  );
}
```

A `SzerkesztesGomb` `szerkeszthetEv={false}` + `szerkeszthetMost` mellett a form-ágat rendereli: rejtett `ev=<most>` és `kod`, felirat „Vissza a szerkesztéshez (2026)”.

- [ ] **Step 2: A szerkesztő page**

`app/(app)/orszagprofil/[kod]/szerkesztes/page.tsx` teljes új tartalma (a változás: `valasztEvAction` és `NemSzerkeszthetoEv` import, a doc-komment, a `szerkeszthet` ág és a közös `fejlec`; a 9 blokk és a `key={ev}` változatlan):

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fragment } from 'react';
import { buttonVariants } from '../../../../../components/ui/button';
import { getProfil } from '../../../../../db/queries/orszagprofil';
import { aktualisEv, formatDatumIdo } from '../../../../../lib/datum';
import { orszagByKod } from '../../../../../lib/orszagok';
import { canEditProfil } from '../../../../../lib/orszagprofil-jog';
import { uresBlokk, type BlokkKulcs, type ProfilBlokkok } from '../../../../../lib/orszagprofil-szotar';
import { requireSession } from '../../../../../lib/session';
import { cn } from '../../../../../lib/utils';
import { getValasztottEv } from '../../../../../lib/valasztott-ev';
import { valasztEvAction } from '../../../actions';
import { mentBlokkAction } from '../../actions';
import { NemSzerkeszthetoEv } from '../../components/NemSzerkeszthetoEv';
import { AlapadatokMezok } from '../../components/mezok/AlapadatokMezok';
import { KfiRendszerMezok } from '../../components/mezok/KfiRendszerMezok';
import { IntezmenyekMezok } from '../../components/mezok/IntezmenyekMezok';
import { VallalatiMezok } from '../../components/mezok/VallalatiMezok';
import { ProgramokMezok } from '../../components/mezok/ProgramokMezok';
import { RendezvenyekMezok } from '../../components/mezok/RendezvenyekMezok';
import { NemzetkoziKapcsolatokMezok } from '../../components/mezok/NemzetkoziKapcsolatokMezok';
import { MagyarKapcsolatokMezok } from '../../components/mezok/MagyarKapcsolatokMezok';
import { MagyarErtekelesMezok } from '../../components/mezok/MagyarErtekelesMezok';

export const metadata: Metadata = { title: 'Országprofil szerkesztése' };

/**
 * Blokkonkénti szerkesztő. Az év a fejléc ciklusválasztójáé (tet-ev cookie). Admin: bármely
 * ország EV_MIN és az aktuális év között; attasé: csak az az ország, amelynek relációs vezetője,
 * és csak az aktuális év. Ha a választott év nem szerkeszthető, de az aktuális igen (attasé
 * múltbeli évvel – a fejléc ezt is felkínálja; január 1-je után is ide jut, ha a cookie még az
 * előző évet tartja), az űrlapok helyett a NemSzerkeszthetoEv kártya jelenik meg, nem 404:
 * a notFound() a Next 404-határán az útvonal változásáig beragadna, az évváltás pedig csak
 * cookie, így a visszaváltás után is 404 maradna. Ha az aktuális év sem szerkeszthető (nincs
 * jog az országhoz), 404 – ez a választott évtől független, ezért nem ragadhat be évváltáskor.
 */
export default async function SzerkesztesPage({ params }: { params: Promise<{ kod: string }> }) {
  const session = await requireSession();
  const { kod } = await params;
  const orszag = orszagByKod(kod);
  if (!orszag) notFound();
  const most = aktualisEv();
  const ev = await getValasztottEv(most);
  const szerkeszthet = canEditProfil(session, kod, ev, most);
  if (!szerkeszthet && !canEditProfil(session, kod, most, most)) notFound();

  const fejlec = (
    <div className="flex flex-wrap items-center gap-3">
      <h2 className="text-lg font-semibold">{orszag.nev} – profil szerkesztése</h2>
      <span className="text-sm text-muted-foreground">Év: {ev}</span>
      <Link href={`/orszagprofil/${kod}`} className={cn('ml-auto', buttonVariants({ variant: 'outline' }))}>
        Megtekintés
      </Link>
    </div>
  );

  if (!szerkeszthet) {
    return (
      <div className="flex max-w-4xl flex-col gap-4">
        {fejlec}
        <NemSzerkeszthetoEv kod={kod} ev={ev} most={most} action={valasztEvAction} />
      </div>
    );
  }

  const profil = getProfil(kod, ev);
  const mentve = profil ? formatDatumIdo(profil.updatedAt) : null;
  // A profil sor közös updatedAt-ja csak a ténylegesen mentett blokkoknál jelenik meg.
  const m = (k: BlokkKulcs) => (profil?.mentett.includes(k) ? mentve : null);
  const b: Partial<ProfilBlokkok> = profil?.blokkok ?? {};
  const kozos = { kod, ev, action: mentBlokkAction };

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      {fejlec}
      <p className="text-sm text-muted-foreground">
        Minden blokk külön menthető; a mentett blokkok azonnal megjelennek a térképen és a profil oldalon.
      </p>
      {/* key={ev}: az App Router a cookie-ból jövő évet nem veszi az állapot-kulcsba, így
          évváltásnál a 9 blokk kliens-állapota (a beírt, nem mentett értékek) különben
          átcsúszna a másik évre. */}
      <Fragment key={ev}>
        <AlapadatokMezok {...kozos} initial={b.alapadatok ?? uresBlokk('alapadatok')} mentve={m('alapadatok')} />
        <KfiRendszerMezok {...kozos} initial={b.kfiRendszer ?? uresBlokk('kfiRendszer')} mentve={m('kfiRendszer')} />
        <IntezmenyekMezok {...kozos} initial={b.intezmenyek ?? uresBlokk('intezmenyek')} mentve={m('intezmenyek')} />
        <VallalatiMezok {...kozos} initial={b.vallalati ?? uresBlokk('vallalati')} mentve={m('vallalati')} />
        <ProgramokMezok {...kozos} initial={b.programok ?? uresBlokk('programok')} mentve={m('programok')} />
        <RendezvenyekMezok {...kozos} initial={b.rendezvenyek ?? uresBlokk('rendezvenyek')} mentve={m('rendezvenyek')} />
        <NemzetkoziKapcsolatokMezok {...kozos} initial={b.nemzetkoziKapcsolatok ?? uresBlokk('nemzetkoziKapcsolatok')} mentve={m('nemzetkoziKapcsolatok')} />
        <MagyarKapcsolatokMezok {...kozos} initial={b.magyarKapcsolatok ?? uresBlokk('magyarKapcsolatok')} mentve={m('magyarKapcsolatok')} />
        <MagyarErtekelesMezok {...kozos} initial={b.magyarErtekeles ?? uresBlokk('magyarErtekeles')} mentve={m('magyarErtekeles')} />
      </Fragment>
    </div>
  );
}
```

Útvonalak: a page könyvtárából (`app/(app)/orszagprofil/[kod]/szerkesztes/`) a `'../../../actions'` az `app/(app)/actions.ts` (`valasztEvAction`, `logoutAction`), a `'../../actions'` az `app/(app)/orszagprofil/actions.ts` (`mentBlokkAction`). A profil olvasó nézete (`[kod]/page.tsx`) ugyanígy kapja a `valasztEvAction`-t (`'../../actions'` az ő mélységéből).

- [ ] **Step 3: Típusellenőrzés**

Run: `npx tsc --noEmit`
Expected: kimenet nélkül, 0-s kilépési kód. (Ha egy nem létező `app/...` modulra panaszkodik, az a futó dev szerver elavult `.next/dev/types/validator.ts`-e – CLAUDE.md; ilyenkor `rm .next/dev/types/validator.ts` és újra.)

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, a route-listában `ƒ /orszagprofil/[kod]/szerkesztes`, hiba nélkül. (A `db:init` és a `drizzle-kit migrate` a meglévő DB-n nem változtat: nincs új migráció.)

- [ ] **Step 5: Commit**

```bash
git add "app/(app)/orszagprofil/components/NemSzerkeszthetoEv.tsx" "app/(app)/orszagprofil/[kod]/szerkesztes/page.tsx"
git commit -m "fix(orszagprofil): a szerkesztőben a nem szerkeszthető év tájékoztató kártyát ad, nem beragadó 404-et"
```

(A commit-üzenet végére a `Co-Authored-By` sor a munkamenet szabálya szerint.)

---

### Task 2: CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` (Országprofil szakasz: a „Route-ok:” bekezdés és az utána következő „Amire figyelni kell:” lista első pontja)

- [ ] **Step 1: A szerkesztő route-leírása**

A „Route-ok:” bekezdésben ezt a szövegrészt:

```
az év a cookie-ból, nincs `EvValaszto`, csak „Év: 2026" szöveg; jog-hiba 404)
```

cseréld erre:

```
az év a cookie-ból, nincs `EvValaszto`, csak „Év: 2026" szöveg; ha a választott év nem szerkeszthető, de az aktuális igen – relációs vezető attasé múltbeli évvel –, az űrlapok helyett az `orszagprofil/components/NemSzerkeszthetoEv` kártya: „A(z) 2025. évi profil csak megtekinthető…”, „Vissza a szerkesztéshez (2026)” (`SzerkesztesGomb` form-ága) és az olvasó nézet linkje; ha az aktuális év sem, 404)
```

- [ ] **Step 2: „Amire figyelni kell”**

Az első pont végén ezt a mondatot:

```
A page-en viszont marad a 404.
```

cseréld erre:

```
A page-en a 404 csak a választott évtől független jog-hibára marad (lásd a következő pontot).
```

és közvetlenül utána, új pontként szúrd be:

```
- A választott évtől (cookie) függő `notFound()` beragad: a Next a 404-et kliens-oldali határon (`HTTPAccessFallbackErrorBoundary`) jeleníti meg, amely csak útvonal-változáskor áll vissza, az évváltás viszont cookie + revalidálás, az útvonal nem változik – a következő, már jogos render sem tünteti el, csak egy másik útvonalra lépés vagy a teljes újratöltés. Ezért a szerkesztő évfüggő jog-hibája tájékoztató kártya (`NemSzerkeszthetoEv`), nem 404; a választott évtől függő új ellenőrzés se `notFound()`-dal válaszoljon.
```

- [ ] **Step 3: Ellenőrzés**

Run: `grep -n "jog-hiba 404\|A page-en viszont marad a 404" CLAUDE.md`
Expected: nincs találat.
Run: `grep -c "NemSzerkeszthetoEv" CLAUDE.md`
Expected: `2`

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(orszagprofil): a szerkesztő nem szerkeszthető éve és a beragadó 404 a CLAUDE.md-ben"
```

---

### Task 3: Böngészős QA (a fő munkamenet végzi, nem subagent)

A felhasználó futó TéT dev szerverén (`localhost:3000`; előbb `lsof -a -p <pid> -d cwd`-vel ellenőrizve, hogy a TéT-é), gstack-kel (`~/.claude/skills/gstack/browse/dist/browse`). Jelszó soha nem kerül a kimenetbe; a `/login`-on `wait --networkidle` a kitöltés előtt.

- [ ] **Step 1: JP-attasé (`ferencz.csanad@demo.test`, jelszó: `.env.example` `DEMO_ATTASE_PASSWORD`)**
  - `/orszagprofil/JP/szerkesztes`, fejléc 2026 → a 9 blokk, `alapadatok.fovaros` = „Tokió”.
  - `select 'header select' 2025` → nincs „Az oldal nem található”; a kártya szövege „A(z) 2025. évi profil csak megtekinthető; szerkeszteni a(z) 2026. évi profilt lehet.”; „Év: 2025”.
  - `select 'header select' 2026` → a 9 blokk, „Tokió” (a beragadás megszűnt).
  - Újra 2025 → kártya → „Vissza a szerkesztéshez (2026)” gomb → a fejléc 2026, az URL a szerkesztő, a 9 blokk „Tokió”-val.
  - Fejléc 2025, majd `goto /orszagprofil/JP/szerkesztes` → kártya; „A(z) 2025. évi profil megtekintése” → `/orszagprofil/JP`, a 2025-ös adatlap.
  - A végén fejléc 2026, kijelentkezés.
- [ ] **Step 2: Nem vezető DE-attasé (`komma.krisztian@demo.test`)**
  - `/orszagprofil/DE/szerkesztes` 2026-ban → 404; fejléc 2025 → 404 marad (évtől független). Kijelentkezés.
- [ ] **Step 3: Admin (`.env.local` `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`)**
  - `/orszagprofil/DE/szerkesztes`: 2025 → üres űrlapok („Még nincs kitöltve”), 2026 → „Berlin”. Kijelentkezés.
- [ ] **Step 4: Tisztaság**
  - `sqlite3 -readonly data/tet.db "select count(*) from session;"` a QA előtti értékkel egyezik; `git status --short` üres (a DB-t nem commitoljuk).
