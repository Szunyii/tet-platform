# Országprofil: kérdőjeles magyarázat minden kitöltendő mezőnél – implementációs terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Az országprofil szerkesztőjének minden kitöltendő mezője mellett kérdőjeles gomb nyisson felugró magyarázatot (mit kell beírni + példa); a látható súgósorok a tooltipbe költözzenek.

**Architecture:** Új `SugoGomb` (Base UI Popover `openOnHover`-rel, a shadcn `popover` komponensre építve) és `CimkeSor` (a `Label` + gomb testvérként). A `Mezo`/`SzovegMezo`/`RovidMezo`/`SzamMezo`/`CimkeValaszto` új, opcionális `magyarazat`/`pelda` propot kap; a régi `sugo` string prop marad a többi űrlapnak. A szövegek a `MEZO_CIMKEK`-ben vannak (kötelező `magyarazat`, így a típus garantálja a teljességet), a rendezvénysorok mezőié a `REND_MEZO_CIMKEK`-ben; a hívóhelyeken `{...C.mezo}` szórás.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 7, shadcn/ui v4 (base-nova, Base UI Popover), lucide-react, tsx az eldobható scriptekhez.

**Spec:** `docs/superpowers/specs/2026-10-12-mezo-sugo-tooltip-design.md` (a szövegek forrása is).

**Végrehajtási megjegyzések** (a terv a végleges, működő kódot és parancsokat mutatja):

- **Task 1.** A minőségi review nyomán külön commitban (`751c2cf`) bekerült a felugró dialógus neve és leírása (`PopoverTitle` rejtve + `PopoverDescription`), a `memo`, a sormagasságot nem növelő `-my-[3px]`, a `break-words` és az `outline-hidden`; a záró review a `focus-visible:outline-hidden` alakra finomította (`6ed2dc1`): nagy kontrasztú módban a kérdőjel csak fókuszban kap körvonalat. A `SugoGomb` kódblokkja már ezt mutatja. A `popover.tsx`-ben a `PopoverPrimitive.Trigger` két sorban szerepel (típus és elem), nem egyben.
- **Task 2.** A review nyomán (`21e5219`) a szövegek pontosítása: az infrastruktúra/klaszter lehatárolása, az ágazat-mező félrevezető zárójele, a kiemelt iparágak sorrend-módosítási tippje, a Top 10 vállalat sorrendje, a Megjegyzés példája; a korlátok számai (`EV_MIN - 10`, `TOP_VALLALAT_MAX`, `RENDEZVENY_MAX`, `OSSZEGZES_MAX`) konstansból jönnek, hogy ne csússzanak el. A Step 3 kódblokkja a végleges szótár.
- **Task 3, QA.** A gstack `click` több találatnál hibázik, ezért a rendezvénysor-gomb szelektora az 1. sor mezőjéhez kötött; a teljes oldalas `screenshot` olvashatatlan, helyette `--viewport`; a shell zsh, ezért nincs `PIPESTATUS` (a build kimenete fájlba megy, az exit kódot külön echo adja). A hoverrel nyitott felugró kb. 500 ms utáni kattintásra bezárul: ez a Base UI „patient click”-je, megfigyelésként szerepel.
- **Záró review.** A `CLAUDE.md` „`sugo` prop hívói” mondata pontosítva (csak az `OrszagMezok` hívja a `Mezo`-t `sugo`-val, a burkolók `sugo`-ja hívó nélküli), és bekerült a patient click leírása.

**Ellenőrzés:** Nincs tesztkeretrendszer. A „teszt”: (1) a `MEZO_CIMKEK` kimerítő típusa (hiányzó `magyarazat` fordítási hiba), (2) eldobható script, amely a példa-értékeket a valódi validátoron futtatja (`scripts/_sugo-ellenorzes.ts`), (3) gstack böngészős QA a futó dev szerveren. Minden task végén `npx tsc --noEmit`.

**Környezet:**

- Ág: `mezo-sugo` (a spec a `main`-en van, az első lépés ebből ágaztat). A munka a fő munkakönyvtárban folyik, mert a dev szerver (`next dev`, HMR) ezt szolgálja ki; worktree-ben a QA nem látná a változást.
- A felhasználó TéT dev szervere fut a `http://localhost:3000`-en. **Nem szabad leállítani vagy újraindítani**, és saját dev szervert sem indítunk. Ha nem fut (`curl -sI -m 5 http://localhost:3000/login` nem ad `200`-at), szólj a controllernek.
- A `data/tet.db` a repóban van, és a dev szerver használja; a gstack-belépés session-sort ír bele. **Soha ne commitold**: `git add` mindig konkrét fájlokkal, soha `-A` vagy `.`.
- Seed admin: `admin@niu.hu`, jelszava a `.env.local` `SEED_ADMIN_PASSWORD`-je. Olvasd ki, de ne írd ki. A jelszó kitöltése után **tilos a `snapshot`** (kiírná a mező értékét).
- Az eldobható script (`scripts/_sugo-ellenorzes.ts`) nem kerül commitba; a 3. task törli. Típushelyesnek kell lennie, mert a `tsconfig.json` a `scripts/`-et is bevonja.
- A shell-változók a Bash-hívások között nem maradnak meg: minden kódblokk maga állítja be az `S`, `B` változót.
- Commit üzenetek magyarul, `feat|docs(mezo-sugo): …`, a végén üres sor után: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Reviewer subagent: csak olvasó git (tilos a checkout, a reset és a stash).

**Közös változók** (minden kódblokk elején ismételve, ahol kell):

```bash
S=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/ef6a87f5-9f1e-493e-b5b9-56105f03b762/scratchpad
B=~/.claude/skills/gstack/browse/dist/browse
```

**gstack bejelentkezés** (ha a `$B url` a `/login`-ra mutat):

```bash
B=~/.claude/skills/gstack/browse/dist/browse
$B goto 'http://localhost:3000/login?next=%2Forszagprofil%2FDE%2Fszerkesztes' >/dev/null && $B wait --networkidle >/dev/null
$B fill '#email' admin@niu.hu >/dev/null
$B fill '#password' "$(sed -n 's/^SEED_ADMIN_PASSWORD=//p' .env.local)" >/dev/null 2>&1
$B click 'button[type=submit]' >/dev/null
$B wait '#alapadatok\.fovaros' >/dev/null; $B url
```

A `wait --networkidle` a kitöltés előtt kell: hidratálás előtti kattintásnál a form natívan küldődik be, és a belépés elmarad. A `url` értéke `http://localhost:3000/orszagprofil/DE/szerkesztes`.

---

## Fájlok

| Fájl | Művelet | Mi változik | Task |
| --- | --- | --- | --- |
| `components/ui/popover.tsx` | új (shadcn CLI) | `Popover`, `PopoverTrigger`, `PopoverContent` | 1 |
| `components/form/SugoGomb.tsx` | új | kérdőjeles gomb + felugró (magyarázat, példa) | 1 |
| `components/form/CimkeSor.tsx` | új | `Label` + `SugoGomb` testvérként | 1 |
| `components/form/Mezo.tsx` | módosít | `magyarazat`/`pelda` prop a `Mezo`, `SzovegMezo`, `RovidMezo`-ban | 1 |
| `components/form/SzamMezo.tsx` | módosít | ugyanez | 1 |
| `components/form/CimkeValaszto.tsx` | módosít | ugyanez, az `egyeb` almezőre is | 1 |
| `lib/orszagprofil-szotar.ts` | módosít | `MezoCimke` (`magyarazat`, `pelda`), a `MEZO_CIMKEK` szövegei, `REND_MEZO_CIMKEK`; a végén a `sugo` törlése | 2, 3 |
| `scripts/_sugo-ellenorzes.ts` | új, **nem commitolt** | a példák ellenőrzése a validátoron | 2 |
| `app/(app)/orszagprofil/components/mezok/*Mezok.tsx` (8 fájl) | módosít | `{...C.mezo}` szórás, a látható súgó kikerül | 3 |
| `app/(app)/orszagprofil/components/RendezvenySorok.tsx` | módosít | `CimkeSor` a négy mezőnél, a placeholder törlése | 3 |
| `CLAUDE.md` | módosít | `MEZO_CIMKEK` leírása, új komponensek, figyelmeztetés | 3 |

---

### Task 1: Popover, `SugoGomb`, `CimkeSor` és a `Mezo`-komponensek új propjai

**Files:**
- Create: `components/ui/popover.tsx` (shadcn CLI)
- Create: `components/form/SugoGomb.tsx`
- Create: `components/form/CimkeSor.tsx`
- Modify: `components/form/Mezo.tsx`, `components/form/SzamMezo.tsx`, `components/form/CimkeValaszto.tsx`

Az új propok mind opcionálisak, ezért a task végén a teljes projekt változatlanul fordul, és a többi űrlap (riport, felhasználók) kinézete nem változik: `magyarazat` nélkül a `CimkeSor` pontosan a korábbi, puszta `Label`-t rendereli.

- [ ] **Step 1: Ág létrehozása**

```bash
git switch -c mezo-sugo && git status --short && git log --oneline -1
```

Várt: `Switched to a new branch 'mezo-sugo'`, üres `status` (vagy csak a `data/tet.db`-t jelző sor, ha a WAL checkpointolt: azt ne érintsd), a legfrissebb commit a terv `docs(mezo-sugo): …` commitja, alatta a spec (`afd5e86`).

- [ ] **Step 2: A shadcn popover hozzáadása**

```bash
npx shadcn@latest add popover -y
git status --short
```

Várt: egyetlen új fájl, `components/ui/popover.tsx`; `package.json` és más fájl nem módosul. Ha a CLI más fájlt is módosítana, állj meg és jelezd. Ellenőrzés: `grep -c "PopoverPrimitive.Trigger" components/ui/popover.tsx` → `2` (a `PopoverPrimitive.Trigger.Props` típus-hivatkozás és az elem sora).

- [ ] **Step 3: `SugoGomb` létrehozása**

`components/form/SugoGomb.tsx`:

```tsx
'use client';

import { memo } from 'react';
import { CircleQuestionMark } from 'lucide-react';
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from '../ui/popover';

/**
 * Kérdőjeles gomb a mező címkéje mellett: hoverre, koppintásra vagy Enter/Space-re felugró
 * magyarázat + példa. Valódi `<button type="button">`: nem küldi be az űrlapot, és a Tab-sorrendben
 * közvetlenül a mező előtt érhető el. Popover (nem Tooltip): hosszabb szöveg is elfér, és
 * érintőképernyőn is nyílik.
 *
 * A `pelda` `\n`-nel több soros is lehet (pl. a vállalatlista soronként jelenik meg).
 */
export const SugoGomb = memo(function SugoGomb({
  cimke, magyarazat, pelda,
}: { cimke: string; magyarazat: string; pelda?: string }) {
  return (
    <Popover>
      <PopoverTrigger
        type="button"
        openOnHover
        delay={150}
        closeDelay={100}
        aria-label={`Magyarázat: ${cimke}`}
        className="-my-[3px] inline-flex size-5 shrink-0 cursor-help items-center justify-center rounded-full text-muted-foreground focus-visible:outline-hidden transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <CircleQuestionMark aria-hidden className="size-4" />
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-80 max-w-[calc(100vw-2rem)]">
        <PopoverTitle className="sr-only">{cimke}</PopoverTitle>
        <PopoverDescription className="break-words text-popover-foreground">{magyarazat}</PopoverDescription>
        {pelda && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Példa</span>
            <p className="whitespace-pre-line break-words rounded-md bg-muted px-2 py-1.5 text-xs">{pelda}</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
});
```

- [ ] **Step 4: `CimkeSor` létrehozása**

`components/form/CimkeSor.tsx`:

```tsx
import { Label } from '../ui/label';
import { SugoGomb } from './SugoGomb';

/**
 * Mező-címke és (ha van `magyarazat`) a kérdőjeles `SugoGomb` egy sorban. A gomb a `Label`
 * TESTVÉRE, nem a gyereke: a `<label>`-ben a gombra kattintás a mezőre fókuszálna. Magyarázat
 * nélkül pontosan a puszta `Label` (a többi űrlap kinézete nem változik).
 *
 * Az `id` a címke elem id-ja (a `CimkeValaszto` beviteli mezejének `aria-labelledby`-ja erre mutat).
 */
export function CimkeSor({
  id, htmlFor, cimke, magyarazat, pelda, labelClassName,
}: {
  id?: string; htmlFor: string; cimke: string; magyarazat?: string; pelda?: string; labelClassName?: string;
}) {
  const label = <Label id={id} htmlFor={htmlFor} className={labelClassName}>{cimke}</Label>;
  if (!magyarazat) return label;
  return (
    <div className="flex items-center gap-1">
      {label}
      <SugoGomb cimke={cimke} magyarazat={magyarazat} pelda={pelda} />
    </div>
  );
}
```

- [ ] **Step 5: `Mezo.tsx` átírása**

A `components/form/Mezo.tsx` teljes új tartalma:

```tsx
'use client';

import type { ReactNode } from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { cn } from '../../lib/utils';
import type { MezoHibak } from '../../lib/urlap';
import { CimkeSor } from './CimkeSor';
import { leiroAttr, MezoHiba } from './MezoHiba';

/**
 * Címke (+ opcionális kérdőjeles magyarázat) + opcionális látható súgósor + mező + hibaüzenet; a
 * hiba kulcsa a mező id-ja. Konvenció az országprofil-űrlapokon: az `id` = `<blokk>.<mezo>`
 * (egyedi a több blokkos oldalon, erre fókuszál a useMuveletForm), a `name` = a puszta mezőnév
 * (ezt olvassa a validátor). Az országprofil `magyarazat`/`pelda` propot használ; a `sugo`
 * (mindig látható sor) a többi űrlapé.
 */
export function Mezo({
  id, cimke, sugo, magyarazat, pelda, errors, children, className,
}: {
  id: string; cimke: string; sugo?: string; magyarazat?: string; pelda?: string; errors: MezoHibak;
  children: ReactNode; className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <CimkeSor id={`${id}-label`} htmlFor={id} cimke={cimke} magyarazat={magyarazat} pelda={pelda} />
      {sugo && <p id={`${id}-sugo`} className="text-xs text-muted-foreground">{sugo}</p>}
      {children}
      <MezoHiba mezo={id} errors={errors} />
    </div>
  );
}

/** Többsoros szövegmező (vezérelt). */
export function SzovegMezo({
  id, name, cimke, sugo, magyarazat, pelda, value, onChange, max, errors, sorok = 4, placeholder,
}: {
  id: string; name: string; cimke: string; sugo?: string; magyarazat?: string; pelda?: string;
  value: string; onChange: (v: string) => void;
  max: number; errors: MezoHibak; sorok?: number; placeholder?: string;
}) {
  return (
    <Mezo id={id} cimke={cimke} sugo={sugo} magyarazat={magyarazat} pelda={pelda} errors={errors}>
      <Textarea id={id} name={name} rows={sorok} maxLength={max} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)} {...leiroAttr(errors, id, Boolean(sugo))} />
    </Mezo>
  );
}

/** Egysoros szövegmező (vezérelt). */
export function RovidMezo({
  id, name, cimke, sugo, magyarazat, pelda, value, onChange, max, errors, placeholder,
}: {
  id: string; name: string; cimke: string; sugo?: string; magyarazat?: string; pelda?: string;
  value: string; onChange: (v: string) => void;
  max: number; errors: MezoHibak; placeholder?: string;
}) {
  return (
    <Mezo id={id} cimke={cimke} sugo={sugo} magyarazat={magyarazat} pelda={pelda} errors={errors}>
      <Input id={id} name={name} maxLength={max} autoComplete="off" placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)} {...leiroAttr(errors, id, Boolean(sugo))} />
    </Mezo>
  );
}
```

A `leiroAttr(…, Boolean(sugo))` szándékosan marad: a magyarázat nem renderel `<id>-sugo` elemet, így az `aria-describedby` nem hivatkozhat nem létező id-ra.

- [ ] **Step 6: `SzamMezo.tsx` átírása**

A `components/form/SzamMezo.tsx` teljes új tartalma:

```tsx
'use client';

import { Input } from '../ui/input';
import type { MezoHibak } from '../../lib/urlap';
import { leiroAttr } from './MezoHiba';
import { Mezo } from './Mezo';

export function SzamMezo({
  id, name, cimke, sugo, magyarazat, pelda, value, onChange, errors, utotag, placeholder, maxHossz = 20,
}: {
  id: string; name: string; cimke: string; sugo?: string; magyarazat?: string; pelda?: string;
  value: string; onChange: (v: string) => void;
  errors: MezoHibak; utotag?: string; placeholder?: string;
  /** A nyers szöveg hossza (a domain adja, pl. `SZAM_MAX_HOSSZ`). */
  maxHossz?: number;
}) {
  return (
    <Mezo id={id} cimke={cimke} sugo={sugo} magyarazat={magyarazat} pelda={pelda} errors={errors}>
      <div className="flex items-center gap-2">
        <Input id={id} name={name} inputMode="decimal" maxLength={maxHossz} autoComplete="off" placeholder={placeholder}
          value={value} onChange={(e) => onChange(e.target.value)} className="max-w-48" {...leiroAttr(errors, id, Boolean(sugo))} />
        {utotag && <span className="text-sm text-muted-foreground">{utotag}</span>}
      </div>
    </Mezo>
  );
}
```

- [ ] **Step 7: `CimkeValaszto.tsx` átírása**

A `components/form/CimkeValaszto.tsx` teljes új tartalma:

```tsx
'use client';

import {
  Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty,
  ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor,
} from '../ui/combobox';
import { Input } from '../ui/input';
import { useState } from 'react';
import type { MezoHibak } from '../../lib/urlap';
import { CimkeSor } from './CimkeSor';
import { hibaAttr, leiroAttr, MezoHiba } from './MezoHiba';

/**
 * Többes választás fix listából (Combobox chips) + opcionális „egyéb" szabadszöveg. A
 * kiválasztott értékek egyenként rejtett inputban mennek (`name` többször) → a validátor
 * `fd.getAll(name)`-mel olvassa. A beviteli mező id-ja = `id` (ide fókuszál a hook).
 *
 * A `name`-et szándékosan NEM kapja meg maga a `<Combobox>` – a Base UI akkor saját rejtett
 * inputokat is renderelne, és az értékek duplán mennének be a submitba.
 */
export function CimkeValaszto<T extends string>({
  id, name, cimke, sugo, magyarazat, pelda, items, value, onChange, errors, egyeb,
}: {
  id: string; name: string; cimke: string; sugo?: string; magyarazat?: string; pelda?: string;
  items: readonly T[]; value: T[]; onChange: (v: T[]) => void; errors: MezoHibak;
  /** „Egyéb" mező: id/name + vezérelt érték; a `magyarazat`/`pelda` a kérdőjeles felugrót adja. */
  egyeb?: {
    id: string; name: string; cimke: string; magyarazat?: string; pelda?: string;
    value: string; onChange: (v: string) => void; max: number;
  };
}) {
  const anchor = useComboboxAnchor();
  const [nyitva, setNyitva] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <CimkeSor id={`${id}-label`} htmlFor={id} cimke={cimke} magyarazat={magyarazat} pelda={pelda} />
      {sugo && <p id={`${id}-sugo`} className="text-xs text-muted-foreground">{sugo}</p>}
      {value.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      <Combobox multiple items={items} value={value} onValueChange={(v) => onChange(v as T[])} onOpenChange={setNyitva}>
        <ComboboxChips ref={anchor} id={`${id}-doboz`} tabIndex={-1} className="cursor-text">
          <ComboboxValue>
            {(kivalasztott: T[]) => (
              <>
                {kivalasztott.map((k) => (
                  <ComboboxChip key={k} aria-label={k} aria-description="Backspace vagy Delete az eltávolításhoz" removeLabel={`${k} eltávolítása`}>
                    {k}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id={id}
                  placeholder={kivalasztott.length === 0 ? 'Válassz a listából…' : ''}
                  aria-labelledby={`${id}-label`}
                  {...leiroAttr(errors, id, Boolean(sugo))}
                  onKeyDown={(e) => { if (e.key === 'Escape' && !nyitva) e.preventBaseUIHandler(); }}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>Nincs ilyen elem.</ComboboxEmpty>
          <ComboboxList>{(k: T) => <ComboboxItem key={k} value={k}>{k}</ComboboxItem>}</ComboboxList>
        </ComboboxContent>
      </Combobox>
      <MezoHiba mezo={id} errors={errors} />
      {egyeb && (
        <div className="flex flex-col gap-1.5">
          <CimkeSor htmlFor={egyeb.id} cimke={egyeb.cimke} magyarazat={egyeb.magyarazat} pelda={egyeb.pelda}
            labelClassName="text-xs text-muted-foreground" />
          <Input id={egyeb.id} name={egyeb.name} maxLength={egyeb.max} autoComplete="off" value={egyeb.value}
            onChange={(e) => egyeb.onChange(e.target.value)} {...hibaAttr(errors, egyeb.id)} />
          <MezoHiba mezo={egyeb.id} errors={errors} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 8: Típusellenőrzés**

```bash
npx tsc --noEmit; echo "exit=$?"
```

Várt: kimenet nélkül, `exit=0`. (Ha a `.next/dev/types/validator.ts` nem létező route-ra panaszkodik, lásd a `CLAUDE.md` parancs-szakaszát: `rm .next/dev/types/validator.ts`, majd újra.)

- [ ] **Step 9: Commit**

```bash
git add components/ui/popover.tsx components/form/SugoGomb.tsx components/form/CimkeSor.tsx components/form/Mezo.tsx components/form/SzamMezo.tsx components/form/CimkeValaszto.tsx
git commit -m "$(cat <<'EOF'
feat(mezo-sugo): kérdőjeles felugró magyarázat komponens (SugoGomb, CimkeSor) és a Mezo-komponensek új propjai

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
EOF
)"
git status --short
```

---

### Task 2: A szövegek a szótárban és az ellenőrző script

**Files:**
- Modify: `lib/orszagprofil-szotar.ts` (a `MezoCimke` interfész és a `MEZO_CIMKEK`, a fájl vége)
- Create: `scripts/_sugo-ellenorzes.ts` (nem commitolt)

A `MezoCimke` ebben a taskban `magyarazat` (kötelező) + `pelda?` mezőt kap; a `sugo?` mező egyelőre `@deprecated`-ként marad, hogy a 8 mező-komponens (amelyek még a `C.x.sugo`-t olvassák) forduljon; a 3. task törli. A szövegek a spec táblái szerint, a régi `sugo` szövegek beolvadva.

- [ ] **Step 1: Az ellenőrző script megírása (előbb bukik)**

`scripts/_sugo-ellenorzes.ts`:

```ts
/**
 * Eldobható ellenőrzés (nem commitolandó): minden mezőnek van címkéje és magyarázata, és a
 * példa-értékek átmennek a valódi validátoron (hossz, szám-formátum, sorok száma).
 * Futtatás: npx tsx scripts/_sugo-ellenorzes.ts
 */
import { validalBlokk } from '../lib/orszagprofil-validacio';
import {
  BLOKK_KULCSOK, MEZO_CIMKEK, REND_MEZO_CIMKEK, type MezoCimke,
} from '../lib/orszagprofil-szotar';

const hibak: string[] = [];
let mezoDb = 0;
let peldaDb = 0;

function ellenoriz(hely: string, c: MezoCimke) {
  mezoDb++;
  if (!c.cimke.trim()) hibak.push(`${hely}: üres címke`);
  if (!c.magyarazat.trim()) hibak.push(`${hely}: üres magyarázat`);
}

for (const blokk of BLOKK_KULCSOK) {
  const fd = new FormData();
  const tabla = MEZO_CIMKEK[blokk] as Record<string, MezoCimke>;
  for (const [kulcs, c] of Object.entries(tabla)) {
    ellenoriz(`${blokk}.${kulcs}`, c);
    if (c.pelda === undefined) continue;
    peldaDb++;
    // A vagy két egyenértékű példát választ el (pl. pozitív és negatív szám): az elsőt próbáljuk.
    fd.set(kulcs, c.pelda.split(' vagy ')[0]);
  }
  if (blokk === 'rendezvenyek') {
    for (const [kulcs, c] of Object.entries(REND_MEZO_CIMKEK)) {
      ellenoriz(`rendezveny.${kulcs}`, c);
      if (c.pelda === undefined) continue;
      peldaDb++;
      fd.set(`rendezveny.0.${kulcs}`, c.pelda);
    }
  }
  const eredmeny = validalBlokk(blokk, fd, 2026);
  if (!eredmeny.ok) for (const [k, v] of Object.entries(eredmeny.errors)) hibak.push(`${blokk}.${k}: ${v}`);
}

if (hibak.length) {
  console.error(hibak.join('\n'));
  process.exit(1);
}
console.log(`Rendben: ${mezoDb} mező, ${peldaDb} példa átment a validátoron.`);
```

A `rendezvenyek.lista` mezőnek nincs `pelda`-ja, ezért a `fd.set('lista', …)` nem fut le.

- [ ] **Step 2: Futtatás: bukik**

```bash
npx tsx scripts/_sugo-ellenorzes.ts; echo "exit=$?"
```

Várt: hibával elbukik, mert a `REND_MEZO_CIMKEK` még nem létezik (pl. `does not provide an export named 'REND_MEZO_CIMKEK'` vagy `undefined`-ból jövő `TypeError`), `exit` nem `0`.

- [ ] **Step 3: A `MezoCimke` és a `MEZO_CIMKEK` cseréje**

A `lib/orszagprofil-szotar.ts`-ben a `/** Mezőcímkék és súgó: …` kommenttől a **fájl végéig** minden helyére (a `MezoCimke` interfész, a `MEZO_CIMKEK` és az új `REND_MEZO_CIMKEK`) ez kerül:

```ts
/**
 * Mezőcímkék és kérdőjeles magyarázat: az űrlap, az olvasó nézet és a validátor hibaüzenetei
 * ugyanebből a szótárból írnak (az olvasó nézet és a validátor csak a `cimke`-t). Kulcs = a mező
 * neve. A `magyarazat` kötelező: a `MEZO_CIMKEK` típusa mezőnév szerint kimerítő, ezért fordítási
 * hiba, ha egy mezőhöz nincs. A példák Dél-Koreáról szólnak
 * (`scripts/demo-orszagprofil/orszagok/kr.ts`), a szabályok a `lib/orszagprofil-validacio.ts`-éi.
 */
export interface MezoCimke {
  cimke: string;
  /** Mit kell a mezőbe írni (a validátor szabályaival egyezően). */
  magyarazat: string;
  /** Példa-érték; többsoros mezőnél `\n`-nel elválasztva. */
  pelda?: string;
  /** @deprecated A `magyarazat` váltja. */
  sugo?: string;
}
export const MEZO_CIMKEK: { [K in BlokkKulcs]: Record<keyof ProfilBlokkok[K], MezoCimke> } = {
  alapadatok: {
    fovaros: { cimke: 'Főváros', magyarazat: 'Az ország fővárosának neve magyarul.', pelda: 'Szöul' },
    terulet: {
      cimke: 'Terület (km²)',
      magyarazat: 'Az ország teljes területe négyzetkilométerben, egész számként. Az ezreseket szóközzel tagolhatod.',
      pelda: '100 460',
    },
    penznem: {
      cimke: 'Pénznem',
      magyarazat: 'A hivatalos pénznem magyar neve, utána zárójelben az ISO-kódja.',
      pelda: 'dél-koreai von (KRW)',
    },
    lakossag: {
      cimke: 'Lakosság (fő)',
      magyarazat: 'Az ország lakossága főben, az Adatév szerinti állapotban; egész szám, az ezreseket szóközzel tagolhatod.',
      pelda: '51 681 000',
    },
    gdp: {
      cimke: 'GDP (milliárd USD)',
      magyarazat: 'Az ország nominális (folyó áras) GDP-je milliárd amerikai dollárban az Adatévre; legfeljebb egy tizedesjeggyel, tizedesvesszővel. Az ezreseket szóközzel tagolhatod.',
      pelda: '1 858,6',
    },
    gdpEgyFore: {
      cimke: 'Egy főre jutó GDP (USD)',
      magyarazat: 'Az egy főre jutó nominális GDP amerikai dollárban az Adatévre; egész szám, az ezreseket szóközzel tagolhatod.',
      pelda: '35 962',
    },
    gdpNovekedes: {
      cimke: 'GDP-növekedés (%)',
      magyarazat: 'A reál-GDP éves növekedése az Adatévre, százalékban; legfeljebb egy tizedesjeggyel, tizedesvesszővel, csökkenésnél mínusz előjellel.',
      pelda: '0,9 vagy -1,2',
    },
    adatEv: {
      cimke: 'Adatév',
      magyarazat: `Az az év, amelyre a lakosság és a GDP-adatok vonatkoznak; ${EV_MIN - 10} és az aktuális év között.`,
      pelda: '2025',
    },
    forras: {
      cimke: 'Forrás',
      magyarazat: 'Az adatok forrása (pl. IMF, Világbank, nemzeti statisztikai hivatal), a kiadással vagy az időponttal. Több forrást vesszővel válassz el.',
      pelda: 'IMF World Economic Outlook (2025. október), Világbank',
    },
    tagsagok: {
      cimke: 'Nemzetközi szervezeti tagság',
      magyarazat: 'Válaszd ki a listából azokat a szervezeteket, amelyeknek az ország tagja. Ami nincs a listán, azt az „Egyéb tagság” mezőbe írd.',
    },
    tagsagEgyeb: {
      cimke: 'Egyéb tagság',
      magyarazat: 'A listán nem szereplő szervezeti tagságok, vesszővel elválasztva.',
      pelda: 'APEC, RCEP, IPEF',
    },
    agazatok: {
      cimke: 'Legfontosabb gazdasági ágazatok',
      magyarazat: 'Válaszd ki a listából az ország gazdaságában legnagyobb súlyú ágazatokat (a KFI-politika kiemelt iparágai külön, az 1. blokk „Kiemelt iparágak” mezőjébe kerülnek). Ami nincs a listán, azt az „Egyéb ágazat” mezőbe írd.',
    },
    agazatEgyeb: {
      cimke: 'Egyéb ágazat',
      magyarazat: 'A listán nem szereplő gazdasági ágazatok, vesszővel elválasztva.',
      pelda: 'Hajógyártás, acélipar',
    },
  },
  kfiRendszer: {
    teljesitmeny: {
      cimke: 'KFI-teljesítmény',
      magyarazat: 'Az ország KFI-pozíciója nemzetközi mutatók alapján: index, helyezés, az elmúlt évek iránya. Add meg a forrást és az évet.',
      pelda: 'Global Innovation Index 2025: 4. hely a 139 gazdaság közül (2024: 6.), régiójában az első. A K+F-ráfordítás 2024-ben a GDP 5,13%-a (OECD MSTI).',
    },
    gerd: {
      cimke: 'K+F ráfordítás a GDP %-ában',
      magyarazat: 'A bruttó hazai K+F-ráfordítás (GERD) a GDP százalékában, legfeljebb két tizedesjeggyel, tizedesvesszővel. Az érték évét a KFI-teljesítmény szövegében add meg.',
      pelda: '5,13',
    },
    strategia: {
      cimke: 'KFI stratégia',
      magyarazat: 'A hatályos nemzeti KFI- vagy tudomány- és technológiastratégia neve és időtávja, egy sorban; ha van, a fő célkitűzéssel.',
      pelda: '6. Tudomány- és Technológiai Alapterv (2026–2030): több mint 200 billió von állami K+F',
    },
    prioritasok: {
      cimke: 'Prioritások',
      magyarazat: 'Válaszd ki a listából az ország KFI-politikájának kiemelt témáit. Ami nincs a listán, azt az „Egyéb prioritás” mezőbe írd.',
    },
    prioritasEgyeb: {
      cimke: 'Egyéb prioritás',
      magyarazat: 'A listán nem szereplő KFI-prioritások, vesszővel elválasztva.',
      pelda: '6G-fejlesztés, bioökonómia',
    },
    kiemeltIparagak: {
      cimke: 'Kiemelt iparágak',
      magyarazat: 'Válaszd ki a listából azokat az iparágakat, amelyekre az ország a KFI-politikájában a leginkább épít. A sorrend számít: a térképen az első színe jelenik meg, ezért a legfontosabbal kezdd (a sorrend módosításához távolítsd el, majd válaszd ki újra az elemeket). Ami nincs a listán, azt az „Egyéb iparág” mezőbe írd.',
    },
    iparagEgyeb: {
      cimke: 'Egyéb iparág',
      magyarazat: 'A listán nem szereplő kiemelt iparágak, vesszővel elválasztva.',
      pelda: 'Fejlett robotika, atomenergia',
    },
    erossegek: {
      cimke: 'Erősségek',
      magyarazat: 'A KFI-rendszer legfontosabb erősségei, néhány mondatban vagy felsorolásban; lehetőleg számmal vagy helyezéssel alátámasztva.',
      pelda: 'Erős nagyvállalati K+F: a legnagyobb befektetők a Samsung Electronics, az SK hynix és a Hyundai Motor. A GII 2025 szerint Korea első a GDP-arányos vállalati K+F-ráfordításban.',
    },
    kihivasok: {
      cimke: 'Kihívások',
      magyarazat: 'A KFI-rendszer fő gyengeségei, szűk keresztmetszetei, kockázatai; lehetőleg számmal alátámasztva.',
      pelda: 'A K+F néhány nagy konglomerátumon belül összpontosul, a tudományos cikkeknek csak mintegy negyede készül nemzetközi társszerzőséggel.',
    },
  },
  intezmenyek: {
    iranyitoSzervek: {
      cimke: 'Irányító szervek',
      magyarazat: 'A KFI-politikát irányító és finanszírozó szervek: minisztériumok, ügynökségek, tanácsok. Szervenként egy sor: név (rövidítés) – feladata egy mondatban.',
      pelda: 'Tudományos és IKT Minisztérium (MSIT) – az állami K+F és a KFI-stratégia gazdája.\nNemzeti Kutatási Alapítvány (NRF) – a kutatási pályázatok fő finanszírozója.',
    },
    egyetemek: {
      cimke: 'Meghatározó egyetemek',
      magyarazat: 'A KFI szempontjából legfontosabb egyetemek, zárójelben a városukkal; ha releváns, a fő szakterülettel is.',
      pelda: 'KAIST (Tedzson), Szöuli Nemzeti Egyetem (Szöul), POSTECH (Pohang)',
    },
    kutatokozpontok: {
      cimke: 'Kutatóközpontok, intézetek',
      magyarazat: 'A meghatározó, nem egyetemi kutatóintézetek és kutatóhálózatok (állami vagy magán), a szakterületükkel.',
      pelda: 'Koreai Tudományos és Technológiai Intézet (KIST) – multidiszciplináris; ETRI – elektronika és távközlés; KRISS – metrológia',
    },
    infrastrukturak: {
      cimke: 'Kutatási infrastruktúrák',
      magyarazat: 'A nagy kutatási infrastruktúrák: kutatóreaktor, részecskegyorsító, röntgenlézer, fúziós berendezés, szuperszámítógép – név és hely. A tudományos és technológiai parkok a 3. blokk „Klaszterek, inkubátorok” mezőjébe kerülnek.',
      pelda: 'PAL-XFEL röntgenlézer (Pohang); KSTAR szupravezető tokamak (Tedzson); a KISTI nemzeti szuperszámítógépe (Tedzson)',
    },
  },
  vallalati: {
    kiemeltAgazatok: {
      cimke: 'Kiemelt ágazatok',
      magyarazat: 'Válaszd ki a listából azokat az ágazatokat, amelyekben az ország innovatív vállalatai a legerősebbek. Ami nincs a listán, azt az „Egyéb ágazat” mezőbe írd.',
    },
    agazatEgyeb: {
      cimke: 'Egyéb ágazat',
      magyarazat: 'A listán nem szereplő ágazatok, vesszővel elválasztva.',
      pelda: 'Hajógyártás, kijelzőgyártás',
    },
    topVallalatok: {
      cimke: 'Top 10 vállalat',
      magyarazat: `Az ország KFI szempontjából legfontosabb vállalatai, fontossági sorrendben (az országprofil oldalán számozott listaként jelenik meg). Soronként egy név, legfeljebb ${TOP_VALLALAT_MAX}.`,
      pelda: 'Samsung Electronics\nSK hynix\nHyundai Motor',
    },
    startupok: {
      cimke: 'Startupok, KKV-k',
      magyarazat: 'A startup- és KKV-ökoszisztéma jellemzői: ismert startupok, unikornisok, támogató programok, számok.',
      pelda: 'Ismert unikornisok: Toss, Kurly. A TIPS program 2026-ban 800 startupot támogat.',
    },
    klaszterek: {
      cimke: 'Klaszterek, inkubátorok',
      magyarazat: 'A meghatározó innovációs klaszterek, tudományos és technológiai parkok, inkubátorok és gyorsítóprogramok (akcelerátorok) – név, hely, szakterület.',
      pelda: 'Pangyo Techno Valley (IKT, játékipar, fintech); Songdo (biotechnológia); 19 Kreatív Gazdasági Innovációs Központ (CCEI) régiós inkubátorként.',
    },
    technologiatranszfer: {
      cimke: 'Technológiatranszfer',
      magyarazat: 'Hogyan jut el a kutatási eredmény a vállalatokhoz: transzferirodák, hasznosítási programok, spin-off-támogatás, vállalati kockázati tőke.',
      pelda: 'Egyetemi és intézeti technológiatranszfer-irodák (KAIST, ETRI, KIST); a KIAT technológiatranszfer-programjai.',
    },
  },
  programok: {
    palyazatok: {
      cimke: 'Pályázatok',
      magyarazat: 'Az országban elérhető fő KFI-pályázati programok: kiíró, a program neve és témája, valamint – ha ismert – a jellemző beadási időszak.',
      pelda: 'NRF alapkutatási pályázatok (egyéni, fiatal kutatói, csoportos sémák); IITP IKT K+F felhívások; KEIT ipari technológiai programok.',
    },
    tamogatasiProgramok: {
      cimke: 'Támogatási programok',
      magyarazat: 'Állami támogatási és ösztönző programok (startup-, inkubációs, mobilitási, tehetséggondozási): név, kezelő szerv, célcsoport.',
      pelda: 'TIPS (MSS) – technológiai startupok, magánbefektetői előszűréssel; Brain Pool (MSIT, NRF) – külföldi kutatók meghívása koreai egyetemekre és kutatóintézetekbe.',
    },
    finanszirozasiEszkozok: {
      cimke: 'Finanszírozási eszközök',
      magyarazat: 'A pályázaton kívüli finanszírozási eszközök: kockázati tőke, alapok alapja, hitelgarancia, kedvezményes hitel, adókedvezmény.',
      pelda: 'KVIC alapok alapja; KOTEC technológiaalapú hitelgaranciák; K+F-adójóváírás.',
    },
    nemzetkoziReszvetel: {
      cimke: 'Nemzetközi részvételi lehetőségek',
      magyarazat: 'Azok a nemzetközi programok, amelyekben az ország szervezetei – akár magyar partnerrel közösen – részt vehetnek: EU-s keretprogram, EUREKA, kétoldalú vagy regionális felhívások.',
      pelda: 'Közös konzorcium a Horizont Európa II. pillérében (Korea társult ország); EUREKA-projektek; kétoldalú NKFIH–NRF felhívások.',
    },
  },
  rendezvenyek: {
    lista: {
      cimke: 'Rendezvények',
      magyarazat: `Az országban rendszeresen megrendezett jelentősebb KFI-rendezvények. Legfeljebb ${RENDEZVENY_MAX} rendezvény, a rendezvény neve kötelező; a teljesen üres sor kimarad.`,
    },
  },
  kapcsolatok: {
    euMultilateralis: {
      cimke: 'EU és multilaterális kapcsolatok',
      magyarazat: 'Az ország kapcsolata az EU-val és többoldalú szervezetekkel, programokkal a KFI területén: társulás, partnerségek, tagság, vegyesbizottság.',
      pelda: 'Horizont Európa-társult ország (II. pillér) 2025-től; EU–Korea Digitális Partnerség (2022) és Zöld Partnerség (2023); az EUREKA teljes jogú tagja.',
    },
    partnerorszagok: {
      cimke: 'Partnerországok',
      magyarazat: 'Azok az országok, amelyekkel a fogadó ország KFI-együttműködése a legintenzívebb, az együttműködés jellegével.',
      pelda: 'USA (Technology Prosperity Deal, 2025), EU (Horizont Európa-társulás, digitális és zöld partnerség).',
    },
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
      cimke: 'Mobilitás',
      magyarazat: 'Ösztöndíjak, kutatócsere, hallgatói és kutatói mozgás a két ország között: program, létszám, év.',
      pelda: 'Stipendium Hungaricum: évi 100 hely, 2025/26-ban 63 ösztöndíjas; Global Korea Scholarship: 2026-ban 4 nagykövetségi hely.',
    },
  },
  magyarErtekeles: {
    osszegzes: {
      cimke: 'Összegzés',
      magyarazat: `Az ország KFI-profiljának és a magyar együttműködési lehetőségeknek a rövid összefoglalója, 2–4 mondatban, legfeljebb ${OSSZEGZES_MAX} karakterben. Ez jelenik meg a térképen, az ország kiválasztásakor megnyíló panelen.`,
      pelda: 'Dél-Korea a világ egyik legintenzívebb K+F-befektetője (2024: a GDP 5,13%-a), a GII 2025-ös rangsorában 4. A magyar–koreai TéT-kapcsolat az 1989-es egyezményre és a közös NKFIH–NRF felhívásokra épül; a legnagyobb potenciál az akkumulátor- és gyógyszerkutatásban van.',
    },
    egyuttmukodesiLehetosegek: {
      cimke: 'Együttműködési lehetőségek',
      magyarazat: 'Konkrét területek, ahol magyar kutatóhelyeknek és vállalatoknak együttműködési lehetőségük van, rövid indoklással.',
      pelda: 'Akkumulátor-technológia és -újrahasznosítás a magyarországi koreai gyártóbázisra építve; gyógyszer- és orvosbiológiai kutatás (a 2025-ös NKFIH–NRF projektek témái).',
    },
    joGyakorlatok: {
      cimke: 'Jó gyakorlatok, hazai adaptáció',
      magyarazat: 'Az országban bevált KFI-megoldások, amelyeket Magyarországon is érdemes lehet alkalmazni, a hazai adaptálás lehetőségével.',
      pelda: 'A TIPS modellje: a magánbefektetői szűrés megelőzi a közpénzt; a kiemelt technológiák elkülönített, ötéves K+F-kerete.',
    },
    diplomaciaiPrioritasok: {
      cimke: 'Diplomáciai prioritások',
      magyarazat: 'A magyar–fogadó országbeli KFI-kapcsolatok erősítéséhez javasolt következő lépések: tárgyalandó témák, kezdeményezések, intézményi teendők.',
      pelda: 'A TéT-vegyesbizottság kétévenkénti ülésezésének biztosítása; az NKFIH–NRF közös felhívások folytatása; közös Horizont Európa-konzorciumok szervezése.',
    },
  },
};

/** A rendezvénysorok mezői: nem a `MEZO_CIMKEK` kulcsai, mert a sor a `Rendezvenyek.lista` eleme. */
export const REND_MEZO_CIMKEK: Record<keyof Rendezveny, MezoCimke> = {
  nev: { cimke: 'Név', magyarazat: 'A rendezvény hivatalos neve. Kötelező: név nélkül a sor nem menthető (a teljesen üres sor kimarad).', pelda: 'BIO KOREA' },
  tipus: {
    cimke: 'Típus',
    magyarazat: 'Szakkiállítás, konferencia vagy egyéb fórum (pl. startup-fesztivál, kormányzati tudománydiplomáciai fórum).',
  },
  idopont: {
    cimke: 'Időpont',
    magyarazat: 'Mikor és hol tartják, szabadon megfogalmazva; visszatérő rendezvénynél a szokásos hónap.',
    pelda: 'április–május, Szöul (COEX)',
  },
  megjegyzes: {
    cimke: 'Megjegyzés',
    magyarazat: 'Rövid leírás: a rendezvény témája, szervezője, és ha ismert, a következő (vagy a legutóbbi) alkalom pontos dátuma.',
    pelda: 'Biotechnológia és gyógyszeripar, partnering; 2026: április 28–30.',
  },
};
```

- [ ] **Step 4: Ellenőrző script: zöld**

```bash
npx tsx scripts/_sugo-ellenorzes.ts; echo "exit=$?"
```

Várt: `Rendben: 50 mező, 43 példa átment a validátoron.`, `exit=0` (50 = 46 `MEZO_CIMKEK`-mező + 4 rendezvénymező; 43 = 40 + 3, mert a listás mezőknek és a rendezvény `Típus`-nak nincs példája). Hiba esetén a script kilistázza a mezőt és a validátor üzenetét: a példát kell javítani, a validátort nem.

- [ ] **Step 5: Típusellenőrzés**

```bash
npx tsc --noEmit; echo "exit=$?"
```

Várt: kimenet nélkül, `exit=0`. A mező-komponensek még a `C.x.sugo`-t olvassák (a `@deprecated` mező megvan, értéke `undefined`), ezért fordulnak.

- [ ] **Step 6: Commit**

```bash
git add lib/orszagprofil-szotar.ts
git commit -m "$(cat <<'EOF'
feat(mezo-sugo): magyarázat és példa minden országprofil-mezőhöz a szótárban

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
EOF
)"
git status --short
```

Várt: a `status`-ban csak a nem követett `scripts/_sugo-ellenorzes.ts` szerepel (ezt ne add hozzá).

---

### Task 3: Bekötés az országprofil szerkesztőbe, dokumentáció, QA

**Files:**
- Modify: `app/(app)/orszagprofil/components/mezok/AlapadatokMezok.tsx`, `KfiRendszerMezok.tsx`, `IntezmenyekMezok.tsx`, `VallalatiMezok.tsx`, `ProgramokMezok.tsx`, `RendezvenyekMezok.tsx`, `KapcsolatokMezok.tsx`, `MagyarErtekelesMezok.tsx`
- Modify: `app/(app)/orszagprofil/components/RendezvenySorok.tsx`
- Modify: `lib/orszagprofil-szotar.ts` (a `sugo` mező törlése)
- Modify: `CLAUDE.md`
- Delete: `scripts/_sugo-ellenorzes.ts`

A hívóhelyeken a `cimke={C.x.cimke} sugo={C.x.sugo}` helyett `{...C.x}`: a `MezoCimke` mezői (`cimke`, `magyarazat`, `pelda`) névre egyeznek a komponensek propjaival.

- [ ] **Step 1: `AlapadatokMezok.tsx`**

Teljes új tartalom:

```tsx
'use client';

import { CimkeValaszto } from '../../../../../components/form/CimkeValaszto';
import { RovidMezo } from '../../../../../components/form/Mezo';
import { SzamMezo } from '../../../../../components/form/SzamMezo';
import { AGAZATOK, MEZO_CIMKEK, ROVID_MAX, SZAM_MAX_HOSSZ, TAGSAGOK, type Alapadatok } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId, szamStr, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.alapadatok;
const B = 'alapadatok';

export function AlapadatokMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<Alapadatok>) {
  const [e, set] = useBlokkAllapot({
    ...initial,
    terulet: szamStr(initial.terulet),
    lakossag: szamStr(initial.lakossag), gdp: szamStr(initial.gdp), gdpEgyFore: szamStr(initial.gdpEgyFore),
    gdpNovekedes: szamStr(initial.gdpNovekedes), adatEv: szamStr(initial.adatEv),
  });
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <RovidMezo id={mezoId(B, 'fovaros')} name="fovaros" {...C.fovaros} value={e.fovaros} onChange={set('fovaros')} max={ROVID_MAX} errors={errors} />
            <RovidMezo id={mezoId(B, 'penznem')} name="penznem" {...C.penznem} value={e.penznem} onChange={set('penznem')} max={ROVID_MAX} errors={errors} />
            <SzamMezo id={mezoId(B, 'terulet')} name="terulet" {...C.terulet} value={e.terulet} onChange={set('terulet')} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="km²" />
            <SzamMezo id={mezoId(B, 'lakossag')} name="lakossag" {...C.lakossag} value={e.lakossag} onChange={set('lakossag')} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="fő" />
            <SzamMezo id={mezoId(B, 'gdp')} name="gdp" {...C.gdp} value={e.gdp} onChange={set('gdp')} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="mrd USD" />
            <SzamMezo id={mezoId(B, 'gdpEgyFore')} name="gdpEgyFore" {...C.gdpEgyFore} value={e.gdpEgyFore} onChange={set('gdpEgyFore')} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="USD" />
            <SzamMezo id={mezoId(B, 'gdpNovekedes')} name="gdpNovekedes" {...C.gdpNovekedes} value={e.gdpNovekedes} onChange={set('gdpNovekedes')} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="%" />
            <SzamMezo id={mezoId(B, 'adatEv')} name="adatEv" {...C.adatEv} value={e.adatEv} onChange={set('adatEv')} errors={errors} maxHossz={SZAM_MAX_HOSSZ} />
            <div className="sm:col-span-2">
              <RovidMezo id={mezoId(B, 'forras')} name="forras" {...C.forras} value={e.forras} onChange={set('forras')} max={ROVID_MAX} errors={errors} />
            </div>
          </div>
          <CimkeValaszto id={mezoId(B, 'tagsagok')} name="tagsagok" {...C.tagsagok} items={TAGSAGOK} value={e.tagsagok} onChange={set('tagsagok')} errors={errors}
            egyeb={{ id: mezoId(B, 'tagsagEgyeb'), name: 'tagsagEgyeb', ...C.tagsagEgyeb, value: e.tagsagEgyeb, onChange: set('tagsagEgyeb'), max: ROVID_MAX }} />
          <CimkeValaszto id={mezoId(B, 'agazatok')} name="agazatok" {...C.agazatok} items={AGAZATOK} value={e.agazatok} onChange={set('agazatok')} errors={errors}
            egyeb={{ id: mezoId(B, 'agazatEgyeb'), name: 'agazatEgyeb', ...C.agazatEgyeb, value: e.agazatEgyeb, onChange: set('agazatEgyeb'), max: ROVID_MAX }} />
        </>
      )}
    </BlokkForm>
  );
}
```

- [ ] **Step 2: `KfiRendszerMezok.tsx`**

Teljes új tartalom:

```tsx
'use client';

import { CimkeValaszto } from '../../../../../components/form/CimkeValaszto';
import { RovidMezo, SzovegMezo } from '../../../../../components/form/Mezo';
import { SzamMezo } from '../../../../../components/form/SzamMezo';
import {
  AGAZATOK, KFI_PRIORITASOK, MEZO_CIMKEK, ROVID_MAX, SZAM_MAX_HOSSZ, SZOVEG_MAX, type KfiRendszer,
} from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId, szamStr, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.kfiRendszer;
const B = 'kfiRendszer';

export function KfiRendszerMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<KfiRendszer>) {
  const [e, set] = useBlokkAllapot({ ...initial, gerd: szamStr(initial.gerd) });
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <SzovegMezo id={mezoId(B, 'teljesitmeny')} name="teljesitmeny" {...C.teljesitmeny} value={e.teljesitmeny} onChange={set('teljesitmeny')} max={SZOVEG_MAX} errors={errors} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SzamMezo id={mezoId(B, 'gerd')} name="gerd" {...C.gerd} value={e.gerd} onChange={set('gerd')} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="%" />
            <RovidMezo id={mezoId(B, 'strategia')} name="strategia" {...C.strategia} value={e.strategia} onChange={set('strategia')} max={ROVID_MAX} errors={errors} />
          </div>
          <CimkeValaszto id={mezoId(B, 'prioritasok')} name="prioritasok" {...C.prioritasok} items={KFI_PRIORITASOK} value={e.prioritasok} onChange={set('prioritasok')} errors={errors}
            egyeb={{ id: mezoId(B, 'prioritasEgyeb'), name: 'prioritasEgyeb', ...C.prioritasEgyeb, value: e.prioritasEgyeb, onChange: set('prioritasEgyeb'), max: ROVID_MAX }} />
          <CimkeValaszto id={mezoId(B, 'kiemeltIparagak')} name="kiemeltIparagak" {...C.kiemeltIparagak} items={AGAZATOK} value={e.kiemeltIparagak} onChange={set('kiemeltIparagak')} errors={errors}
            egyeb={{ id: mezoId(B, 'iparagEgyeb'), name: 'iparagEgyeb', ...C.iparagEgyeb, value: e.iparagEgyeb, onChange: set('iparagEgyeb'), max: ROVID_MAX }} />
          <SzovegMezo id={mezoId(B, 'erossegek')} name="erossegek" {...C.erossegek} value={e.erossegek} onChange={set('erossegek')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'kihivasok')} name="kihivasok" {...C.kihivasok} value={e.kihivasok} onChange={set('kihivasok')} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}
```

- [ ] **Step 3: `IntezmenyekMezok.tsx`**

Teljes új tartalom:

```tsx
'use client';

import { SzovegMezo } from '../../../../../components/form/Mezo';
import { MEZO_CIMKEK, SZOVEG_MAX, type Intezmenyek } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.intezmenyek;
const B = 'intezmenyek';

export function IntezmenyekMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<Intezmenyek>) {
  const [e, set] = useBlokkAllapot(initial);
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <SzovegMezo id={mezoId(B, 'iranyitoSzervek')} name="iranyitoSzervek" {...C.iranyitoSzervek} value={e.iranyitoSzervek} onChange={set('iranyitoSzervek')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'egyetemek')} name="egyetemek" {...C.egyetemek} value={e.egyetemek} onChange={set('egyetemek')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'kutatokozpontok')} name="kutatokozpontok" {...C.kutatokozpontok} value={e.kutatokozpontok} onChange={set('kutatokozpontok')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'infrastrukturak')} name="infrastrukturak" {...C.infrastrukturak} value={e.infrastrukturak} onChange={set('infrastrukturak')} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}
```

- [ ] **Step 4: `VallalatiMezok.tsx`**

Teljes új tartalom:

```tsx
'use client';

import { CimkeValaszto } from '../../../../../components/form/CimkeValaszto';
import { SzovegMezo } from '../../../../../components/form/Mezo';
import {
  AGAZATOK, MEZO_CIMKEK, ROVID_MAX, SZOVEG_MAX, TOP_VALLALAT_MAX, type Vallalati,
} from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.vallalati;
const B = 'vallalati';

export function VallalatiMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<Vallalati>) {
  // A top vállalatok soronként egy név: a textarea-ban '\n'-nel elválasztva, a validátor bontja.
  const [e, set] = useBlokkAllapot({ ...initial, topVallalatok: initial.topVallalatok.join('\n') });
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <CimkeValaszto id={mezoId(B, 'kiemeltAgazatok')} name="kiemeltAgazatok" {...C.kiemeltAgazatok} items={AGAZATOK} value={e.kiemeltAgazatok} onChange={set('kiemeltAgazatok')} errors={errors}
            egyeb={{ id: mezoId(B, 'agazatEgyeb'), name: 'agazatEgyeb', ...C.agazatEgyeb, value: e.agazatEgyeb, onChange: set('agazatEgyeb'), max: ROVID_MAX }} />
          <SzovegMezo id={mezoId(B, 'topVallalatok')} name="topVallalatok" {...C.topVallalatok} value={e.topVallalatok} onChange={set('topVallalatok')}
            max={ROVID_MAX * TOP_VALLALAT_MAX + TOP_VALLALAT_MAX} sorok={10} errors={errors} />
          <SzovegMezo id={mezoId(B, 'startupok')} name="startupok" {...C.startupok} value={e.startupok} onChange={set('startupok')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'klaszterek')} name="klaszterek" {...C.klaszterek} value={e.klaszterek} onChange={set('klaszterek')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'technologiatranszfer')} name="technologiatranszfer" {...C.technologiatranszfer} value={e.technologiatranszfer} onChange={set('technologiatranszfer')} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}
```

- [ ] **Step 5: `ProgramokMezok.tsx`**

Teljes új tartalom:

```tsx
'use client';

import { SzovegMezo } from '../../../../../components/form/Mezo';
import { MEZO_CIMKEK, SZOVEG_MAX, type Programok } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.programok;
const B = 'programok';

export function ProgramokMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<Programok>) {
  const [e, set] = useBlokkAllapot(initial);
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <SzovegMezo id={mezoId(B, 'palyazatok')} name="palyazatok" {...C.palyazatok} value={e.palyazatok} onChange={set('palyazatok')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'tamogatasiProgramok')} name="tamogatasiProgramok" {...C.tamogatasiProgramok} value={e.tamogatasiProgramok} onChange={set('tamogatasiProgramok')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'finanszirozasiEszkozok')} name="finanszirozasiEszkozok" {...C.finanszirozasiEszkozok} value={e.finanszirozasiEszkozok} onChange={set('finanszirozasiEszkozok')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'nemzetkoziReszvetel')} name="nemzetkoziReszvetel" {...C.nemzetkoziReszvetel} value={e.nemzetkoziReszvetel} onChange={set('nemzetkoziReszvetel')} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}
```

- [ ] **Step 6: `RendezvenyekMezok.tsx`**

Teljes új tartalom (a látható `lista.sugo` bekezdés helyett címkesor a kérdőjeles gombbal a sorok fölött; a `<label>` nem használható, mert nincs egyetlen társított mező):

```tsx
'use client';

import { SugoGomb } from '../../../../../components/form/SugoGomb';
import { MEZO_CIMKEK, type Rendezvenyek } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';
import { RendezvenySorok } from '../RendezvenySorok';

const B = 'rendezvenyek';
const L = MEZO_CIMKEK.rendezvenyek.lista;

export function RendezvenyekMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<Rendezvenyek>) {
  const [e, set] = useBlokkAllapot(initial);
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <div className="flex items-center gap-1 text-sm font-medium">
            <span>{L.cimke}</span>
            <SugoGomb cimke={L.cimke} magyarazat={L.magyarazat} pelda={L.pelda} />
          </div>
          <RendezvenySorok value={e.lista} onChange={set('lista')} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}
```

- [ ] **Step 7: `KapcsolatokMezok.tsx`**

Teljes új tartalom (a fájl eredeti, duplaidézőjeles, többsoros formázását megtartva):

```tsx
"use client";

import { RovidMezo, SzovegMezo } from "../../../../../components/form/Mezo";
import {
  MEZO_CIMKEK,
  ROVID_MAX,
  SZOVEG_MAX,
  type Kapcsolatok,
} from "../../../../../lib/orszagprofil-szotar";
import {
  BlokkForm,
  mezoId,
  useBlokkAllapot,
  type BlokkMezokProps,
} from "../BlokkForm";

const C = MEZO_CIMKEK.kapcsolatok;
const B = "kapcsolatok";

export function KapcsolatokMezok({
  kod,
  ev,
  initial,
  mentve,
  action,
}: BlokkMezokProps<Kapcsolatok>) {
  const [e, set] = useBlokkAllapot(initial);
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <SzovegMezo
            id={mezoId(B, "euMultilateralis")}
            name="euMultilateralis"
            {...C.euMultilateralis}
            value={e.euMultilateralis}
            onChange={set("euMultilateralis")}
            max={SZOVEG_MAX}
            errors={errors}
          />
          <SzovegMezo
            id={mezoId(B, "partnerorszagok")}
            name="partnerorszagok"
            {...C.partnerorszagok}
            value={e.partnerorszagok}
            onChange={set("partnerorszagok")}
            max={SZOVEG_MAX}
            errors={errors}
          />
          <RovidMezo
            id={mezoId(B, "egyezmeny")}
            name="egyezmeny"
            {...C.egyezmeny}
            value={e.egyezmeny}
            onChange={set("egyezmeny")}
            max={ROVID_MAX}
            errors={errors}
          />
          <SzovegMezo
            id={mezoId(B, "ketoldalu")}
            name="ketoldalu"
            {...C.ketoldalu}
            value={e.ketoldalu}
            onChange={set("ketoldalu")}
            max={SZOVEG_MAX}
            errors={errors}
          />
          <SzovegMezo
            id={mezoId(B, "mobilitas")}
            name="mobilitas"
            {...C.mobilitas}
            value={e.mobilitas}
            onChange={set("mobilitas")}
            max={SZOVEG_MAX}
            errors={errors}
          />
        </>
      )}
    </BlokkForm>
  );
}
```

- [ ] **Step 8: `MagyarErtekelesMezok.tsx`**

Teljes új tartalom:

```tsx
'use client';

import { SzovegMezo } from '../../../../../components/form/Mezo';
import { MEZO_CIMKEK, OSSZEGZES_MAX, SZOVEG_MAX, type MagyarErtekeles } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.magyarErtekeles;
const B = 'magyarErtekeles';

export function MagyarErtekelesMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<MagyarErtekeles>) {
  const [e, set] = useBlokkAllapot(initial);
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <SzovegMezo id={mezoId(B, 'osszegzes')} name="osszegzes" {...C.osszegzes} value={e.osszegzes} onChange={set('osszegzes')} max={OSSZEGZES_MAX} sorok={3} errors={errors} />
          <SzovegMezo id={mezoId(B, 'egyuttmukodesiLehetosegek')} name="egyuttmukodesiLehetosegek" {...C.egyuttmukodesiLehetosegek} value={e.egyuttmukodesiLehetosegek} onChange={set('egyuttmukodesiLehetosegek')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'joGyakorlatok')} name="joGyakorlatok" {...C.joGyakorlatok} value={e.joGyakorlatok} onChange={set('joGyakorlatok')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'diplomaciaiPrioritasok')} name="diplomaciaiPrioritasok" {...C.diplomaciaiPrioritasok} value={e.diplomaciaiPrioritasok} onChange={set('diplomaciaiPrioritasok')} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}
```

- [ ] **Step 9: `RendezvenySorok.tsx`**

Teljes új tartalom (`CimkeSor` a négy mezőnél, a szövegek a `REND_MEZO_CIMKEK`-ből; az Időpont `placeholder`-je megszűnik, a példa a tooltipben van):

```tsx
'use client';

import { CimkeSor } from '../../../../components/form/CimkeSor';
import { hibaAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import type { MezoHibak } from '../../../../lib/urlap';
import {
  REND_MEZO_CIMKEK, RENDEZVENY_MAX, RENDEZVENY_TIPUSOK, ROVID_MAX, rendezvenyTipus, type Rendezveny,
} from '../../../../lib/orszagprofil-szotar';

const URES: Rendezveny = { nev: '', tipus: RENDEZVENY_TIPUSOK[0].kulcs, idopont: '', megjegyzes: '' };
const R = REND_MEZO_CIMKEK;

/**
 * Hozzáadható/törölhető rendezvény-sorok; mezőnevek `rendezveny.<i>.<mezo>`, id-k
 * `rendezvenyek.rendezveny.<i>.<mezo>`. Törléskor a sorok indexe eltolódik és a mezőnevek
 * újraszámozódnak – a validátor indexenként olvas, ez rendben van. A mezők kérdőjeles
 * magyarázata a `REND_MEZO_CIMKEK`-ből jön.
 */
export function RendezvenySorok({
  value, onChange, errors,
}: { value: Rendezveny[]; onChange: (v: Rendezveny[]) => void; errors: MezoHibak }) {
  const set = (i: number, patch: Partial<Rendezveny>) => onChange(value.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const id = (i: number, m: keyof Rendezveny) => `rendezvenyek.rendezveny.${i}.${m}`;
  return (
    <div className="flex flex-col gap-4">
      {value.map((r, i) => (
        <fieldset key={i} className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-2">
          <legend className="px-1 text-xs text-muted-foreground">{i + 1}. rendezvény</legend>
          <div className="flex flex-col gap-1.5">
            <CimkeSor htmlFor={id(i, 'nev')} {...R.nev} />
            <Input id={id(i, 'nev')} name={`rendezveny.${i}.nev`} maxLength={ROVID_MAX} autoComplete="off" value={r.nev}
              onChange={(e) => set(i, { nev: e.target.value })} {...hibaAttr(errors, id(i, 'nev'))} />
            <MezoHiba mezo={id(i, 'nev')} errors={errors} />
          </div>
          <div className="flex flex-col gap-1.5">
            <CimkeSor htmlFor={id(i, 'tipus')} {...R.tipus} />
            <NativeSelect id={id(i, 'tipus')} name={`rendezveny.${i}.tipus`} value={r.tipus}
              onChange={(e) => set(i, { tipus: rendezvenyTipus(e.target.value) })}>
              {RENDEZVENY_TIPUSOK.map((t) => <option key={t.kulcs} value={t.kulcs}>{t.cimke}</option>)}
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5">
            <CimkeSor htmlFor={id(i, 'idopont')} {...R.idopont} />
            <Input id={id(i, 'idopont')} name={`rendezveny.${i}.idopont`} maxLength={ROVID_MAX} autoComplete="off"
              value={r.idopont}
              onChange={(e) => set(i, { idopont: e.target.value })} {...hibaAttr(errors, id(i, 'idopont'))} />
            <MezoHiba mezo={id(i, 'idopont')} errors={errors} />
          </div>
          <div className="flex flex-col gap-1.5">
            <CimkeSor htmlFor={id(i, 'megjegyzes')} {...R.megjegyzes} />
            <Input id={id(i, 'megjegyzes')} name={`rendezveny.${i}.megjegyzes`} maxLength={ROVID_MAX} autoComplete="off" value={r.megjegyzes}
              onChange={(e) => set(i, { megjegyzes: e.target.value })} {...hibaAttr(errors, id(i, 'megjegyzes'))} />
            <MezoHiba mezo={id(i, 'megjegyzes')} errors={errors} />
          </div>
          <div className="sm:col-span-2">
            <Button type="button" variant="outline" size="sm" aria-label={`${i + 1}. rendezvény törlése`}
              onClick={() => onChange(value.filter((_, j) => j !== i))}>
              Sor törlése
            </Button>
          </div>
        </fieldset>
      ))}
      <div>
        <Button type="button" variant="outline" size="sm" disabled={value.length >= RENDEZVENY_MAX} onClick={() => onChange([...value, URES])}>
          Rendezvény hozzáadása
        </Button>
        {value.length >= RENDEZVENY_MAX && <span className="ml-2 text-xs text-muted-foreground">Legfeljebb {RENDEZVENY_MAX} rendezvény.</span>}
      </div>
    </div>
  );
}
```

- [ ] **Step 10: A `sugo` mező törlése a szótárból**

A `lib/orszagprofil-szotar.ts` `MezoCimke` interfészéből töröld ezt a két sort:

```ts
  /** @deprecated A `magyarazat` váltja. */
  sugo?: string;
```

Ellenőrzés: nincs már hivatkozás a mezőre az országprofilban.

```bash
grep -rn "\.sugo" app/\(app\)/orszagprofil lib/orszagprofil-szotar.ts lib/orszagprofil-validacio.ts; echo "grep exit=$?"
```

Várt: nincs találat, `grep exit=1`. (A `components/form/*` és a `felhasznalok` `sugo` prop-ja szándékosan marad; azok nem a `MezoCimke.sugo`-t olvassák.)

- [ ] **Step 11: Típusellenőrzés, ellenőrző script, build**

```bash
npx tsc --noEmit; echo "tsc exit=$?"
npx tsx scripts/_sugo-ellenorzes.ts; echo "script exit=$?"
S=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/ef6a87f5-9f1e-493e-b5b9-56105f03b762/scratchpad
npm run build > "$S/build.log" 2>&1; echo "build exit=$?"; tail -15 "$S/build.log"
```

Várt: `tsc exit=0`; `Rendben: …` és `script exit=0`; a build végén a route-lista (`/orszagprofil/[kod]/szerkesztes` szerepel), `build exit=0`. A build percekig tarthat: a Bash-hívásnak adj legalább 600000 ms időtúllépést. (Ha a build a nem létező `app/...` modulra panaszkodik: `rm .next/dev/types/validator.ts`, majd újra; a dev szervert ne állítsd le.)

- [ ] **Step 12: `CLAUDE.md` frissítése**

Három szerkesztés a `CLAUDE.md`-ben (mindegyik régi szövege pontosan egyszer fordul elő; ellenőrizd `grep -c`-vel). A végleges szöveg a `git show a498be2 6ed2dc1 -- CLAUDE.md` kimenetében van; lényegük:

1. Az „Országprofil” bekezdésben a `MEZO_CIMKEK` leírása: a `cimke` + opcionális `sugo` helyett `cimke` + kötelező `magyarazat` + opcionális `pelda` (a kötelező `magyarazat` miatt fordítási hiba, ha egy mezőhöz nincs); az űrlap a címke mellett kérdőjeles felugróban mutatja (`components/form/SugoGomb`; a felugró `role="dialog"`, neve a címke, leírása a magyarázat), az olvasó nézet csak a `cimke`-t írja; a rendezvénysorok négy mezőjéé a `REND_MEZO_CIMKEK`.
2. A „Közös építőelemek `components/form/`” felsorolásban: `Mezo` (címke + opcionális kérdőjeles magyarázat + súgósor + hiba); `NativeSelect`, után `CimkeSor` (a `Label` + a kérdőjeles gomb egy sorban; `magyarazat` nélkül puszta `Label`), `SugoGomb` (Base UI Popover `openOnHover`-rel: hoverre, koppintásra, Enter/Space-re nyílik; valódi `type="button"`; a hoverrel nyitott felugrón a kb. 500 ms-on belüli kattintás rögzíti, egy későbbi bezárja – a Base UI „patient click”-je, nincs rá publikus kapcsoló; `memo`-zott).
3. Az „Amire figyelni kell” listában, a `CimkeValaszto` `name`-ről szóló pont után új pont (a `Mezo` régi `sugo` propjának hívója: csak az `OrszagMezok`):

   `- A kérdőjeles magyarázat gombja (`SugoGomb`) a `Label` **testvére**, nem a gyereke: a `<label>`-ben a rákattintás a mezőre fókuszálna (`CimkeSor`). Az országprofilban nincs mindig látható súgósor: a szöveg a `MEZO_CIMKEK` `magyarazat`/`pelda` mezőjében van, a hívóhelyen `{...C.mezo}` szórással jut a komponensekhez. A `Mezo` régi `sugo` string propja (látható sor, `<id>-sugo` id-val, az `aria-describedby` hivatkozik rá) a felhasználó-űrlapé (`OrszagMezok`) marad; a `SzovegMezo`/`RovidMezo`/`SzamMezo`/`CimkeValaszto` `sugo`-ja jelenleg hívó nélküli. Új országprofil-mezőnél a `MEZO_CIMKEK`-be kötelező `magyarazat` kell. A `magyarazat` szövegek a validátor szabályait írják le (számformátum, korlátok): a korlátokat a szótár konstansaiból veszik (`EV_MIN`, `TOP_VALLALAT_MAX`, `RENDEZVENY_MAX`, `OSSZEGZES_MAX`), a tizedes- és min/max szabályok viszont szövegesek, ezért a `lib/orszagprofil-validacio.ts` szabályváltozásakor a szöveget is frissíteni kell.`

- [ ] **Step 13: Böngészős QA – a QA-scriptek**

Hozd létre a két scriptet (ha hiányoznak). **Aszinkron QA-script kommentjébe ne kerüljön ASCII idézőjel**; ezek a scriptek szinkronok és nincs bennük komment.

`$S/sugo-statikus-qa.js`:

```js
(() => {
  const gombok = [...document.querySelectorAll('[data-slot="popover-trigger"]')];
  const sorok = [...document.querySelectorAll('fieldset')].filter((f) => f.querySelector('legend')).length;
  const fovaros = document.getElementById('alapadatok.fovaros');
  const fovarosGomb = document.querySelector('[aria-label="Magyarázat: Főváros"]');
  const idopont = document.querySelector('[name="rendezveny.0.idopont"]');
  return JSON.stringify({
    gombDb: gombok.length,
    varhatoGombDb: 46 + 4 * sorok,
    rendezvenySor: sorok,
    mindButton: gombok.every((g) => g.tagName === 'BUTTON' && g.getAttribute('type') === 'button'),
    mindFelirat: gombok.every((g) => (g.getAttribute('aria-label') || '').startsWith('Magyarázat: ')),
    labelbenNincs: gombok.every((g) => !g.closest('label')),
    latszoSugoSor: document.querySelectorAll('[id$="-sugo"]').length,
    gombElobbMintMezo: Boolean(fovarosGomb && fovaros && (fovarosGomb.compareDocumentPosition(fovaros) & Node.DOCUMENT_POSITION_FOLLOWING)),
    idopontPlaceholder: idopont ? idopont.getAttribute('placeholder') : 'nincs-sor',
  });
})()
```

`$S/sugo-popup-qa.js`:

```js
(() => {
  const p = document.querySelector('[data-slot="popover-content"][data-open]');
  const r = p ? p.getBoundingClientRect() : null;
  const combo = document.getElementById('alapadatok.tagsagok');
  const aktiv = document.activeElement;
  return JSON.stringify({
    nyitva: Boolean(p),
    szoveg: p ? p.textContent : null,
    bal: r ? Math.round(r.left) : null,
    jobb: r ? Math.round(r.right) : null,
    ablak: window.innerWidth,
    utvonal: location.pathname,
    fokusz: aktiv ? (aktiv.getAttribute('aria-label') || aktiv.id || aktiv.tagName) : null,
    comboNyitva: combo ? combo.getAttribute('aria-expanded') : null,
    toast: document.querySelectorAll('[data-sonner-toast]').length,
    dialogNev: p ? p.getAttribute('aria-labelledby') : null,
    dialogLeiras: p ? p.getAttribute('aria-describedby') : null,
  });
})()
```

- [ ] **Step 14: Böngészős QA – statikus ellenőrzés és interakciók**

Ha a `$B url` a `/login`-ra mutat, előbb a fenti gstack bejelentkezés.

```bash
S=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/ef6a87f5-9f1e-493e-b5b9-56105f03b762/scratchpad
B=~/.claude/skills/gstack/browse/dist/browse
$B goto 'http://localhost:3000/orszagprofil/DE/szerkesztes' >/dev/null; $B wait '#alapadatok\.fovaros' >/dev/null; $B wait --networkidle >/dev/null
echo '--- statikus'; $B eval "$S/sugo-statikus-qa.js"
echo '--- kattintás (Főváros)'
$B click '[aria-label="Magyarázat: Főváros"]' >/dev/null; $B wait '[data-slot="popover-content"][data-open]' >/dev/null
$B eval "$S/sugo-popup-qa.js"
$B press Escape >/dev/null; $B eval "$S/sugo-popup-qa.js"
echo '--- hover (Terület)'
$B hover '[aria-label="Magyarázat: Terület (km²)"]' >/dev/null; $B wait '[data-slot="popover-content"][data-open]' >/dev/null
$B eval "$S/sugo-popup-qa.js"
$B press Escape >/dev/null
echo '--- billentyűzet (Pénznem: fókusz + Enter)'
$B js "document.querySelector('[aria-label=\"Magyarázat: Pénznem\"]').focus()" >/dev/null
$B press Enter >/dev/null; $B wait '[data-slot="popover-content"][data-open]' >/dev/null
$B eval "$S/sugo-popup-qa.js"
$B press Escape >/dev/null
echo '--- CimkeValaszto (Nemzetközi szervezeti tagság)'
$B click '[aria-label="Magyarázat: Nemzetközi szervezeti tagság"]' >/dev/null; $B wait '[data-slot="popover-content"][data-open]' >/dev/null
$B eval "$S/sugo-popup-qa.js"
$B press Escape >/dev/null
echo '--- hover, majd kb. 1 s múlva kattintás (megfigyelés)'
$B hover '[aria-label="Magyarázat: Főváros"]' >/dev/null; $B wait '[data-slot="popover-content"][data-open]' >/dev/null
$B wait --networkidle >/dev/null
$B click '[aria-label="Magyarázat: Főváros"]' >/dev/null
$B eval "$S/sugo-popup-qa.js"
$B press Escape >/dev/null
echo '--- konzol'; $B console --errors
```

Várt:

- Statikus: `gombDb` egyenlő a `varhatoGombDb`-vel (46 + 4 × sorok száma); `mindButton: true`, `mindFelirat: true`, `labelbenNincs: true`, `latszoSugoSor: 0`, `gombElobbMintMezo: true`, `idopontPlaceholder` `null` (vagy `nincs-sor`, ha a DE profilban nincs rendezvény).
- Kattintás (Főváros): `nyitva: true`, a `szoveg` tartalmazza: `Az ország fővárosának neve magyarul.`, `Példa`, `Szöul`; `utvonal` `/orszagprofil/DE/szerkesztes` (nem ment el az űrlap), `toast: 0`, a `fokusz` **nem** `alapadatok.fovaros` (a gomb, nem a mező kapta a fókuszt). Escape után: `nyitva: false`.
- Hover (Terület): `nyitva: true`, a szövegben `100 460`.
- Billentyűzet (Pénznem): `nyitva: true`, a szövegben `dél-koreai von (KRW)`.
- CimkeValaszto: `nyitva: true`, a szövegben `Egyéb tagság`; `comboNyitva` `false` (a magyarázat gombja nem nyitotta a legördülőt).
- Minden nyitott állapotban a `dialogNev` és a `dialogLeiras` nem `null` (a felugró `role="dialog"`, neve a rejtett cím = a címke, leírása a magyarázat); a `szoveg` a címkével kezdődik (a `sr-only` cím), utána a magyarázat, „Példa”, a példa.
- Hover, majd kb. 1 s múlva kattintás: a felugró **bezárul** (Base UI „patient click”: a hoverrel nyitott felugrón a kb. 500 ms-on belüli kattintás rögzíti, a későbbi bezárja). Ez megfigyelés, nem hiba; hover nélküli kattintás megnyitja.
- `console --errors`: `(no console errors)`.

- [ ] **Step 15: Böngészős QA – keskeny ablak, rendezvénysor, vizuális ellenőrzés**

```bash
S=/private/tmp/claude-501/-Users-szunyoghdavid-Downloads-tet-platform-tet-platform-next/ef6a87f5-9f1e-493e-b5b9-56105f03b762/scratchpad
B=~/.claude/skills/gstack/browse/dist/browse
$B viewport 375x700 >/dev/null
$B goto 'http://localhost:3000/orszagprofil/DE/szerkesztes' >/dev/null; $B wait '#alapadatok\.fovaros' >/dev/null; $B wait --networkidle >/dev/null
echo '--- keskeny ablak (Összegzés)'
$B click '[aria-label="Magyarázat: Összegzés"]' >/dev/null; $B wait '[data-slot="popover-content"][data-open]' >/dev/null
$B eval "$S/sugo-popup-qa.js"
$B screenshot --viewport "$S/sugo-keskeny.png" >/dev/null
$B press Escape >/dev/null
$B viewport 1280x900 >/dev/null
echo '--- rendezvénysor (Időpont, 1. sor; a KR demó-profilban 7 rendezvény van)'
$B goto 'http://localhost:3000/orszagprofil/KR/szerkesztes' >/dev/null; $B wait '#alapadatok\.fovaros' >/dev/null; $B wait --networkidle >/dev/null
$B click 'div:has(> #rendezvenyek\.rendezveny\.0\.idopont) > div > [aria-label="Magyarázat: Időpont"]' >/dev/null; $B wait '[data-slot="popover-content"][data-open]' >/dev/null
$B eval "$S/sugo-popup-qa.js"
$B screenshot --viewport "$S/sugo-rendezveny.png" >/dev/null
$B press Escape >/dev/null
```

Várt: a keskeny ablaknál `bal >= 0` és `jobb <= ablak` (`375`): a felugró nem lóg ki; a rendezvénysornál a szövegben `április–május, Szöul (COEX)`. Nézd meg a két képernyőképet (`Read` az `$S/sugo-keskeny.png` és `$S/sugo-rendezveny.png` fájlokon): a kérdőjel a címke mellett, vízszintesen a szöveg vonalában, a felugró olvasható, a „Példa” halvány hátterű blokkban.

A gstack `click` több találatnál **hibázik** („Selector matched multiple elements”), ezért az Időpont-gomb szelektora az 1. sor mezőjéhez kötött (a `div:has(> #…) > div > …` forma). A teljes oldalas `screenshot` ehhez a hosszú űrlaphoz olvashatatlan, ezért `--viewport`. Ha a `wait` időtúllépne, a KR profilban nincs rendezvény: válassz másik, rendezvényes országot (pl. DE, AT).

- [ ] **Step 16: Takarítás és commit**

```bash
rm scripts/_sugo-ellenorzes.ts
git status --short
```

Várt: a módosított fájlok a Task 3 fájllistájából (8 `*Mezok.tsx`, `RendezvenySorok.tsx`, `lib/orszagprofil-szotar.ts`, `CLAUDE.md`); a `data/tet.db`-t jelző sor esetén azt NE add hozzá.

```bash
git add "app/(app)/orszagprofil/components/mezok/AlapadatokMezok.tsx" "app/(app)/orszagprofil/components/mezok/KfiRendszerMezok.tsx" "app/(app)/orszagprofil/components/mezok/IntezmenyekMezok.tsx" "app/(app)/orszagprofil/components/mezok/VallalatiMezok.tsx" "app/(app)/orszagprofil/components/mezok/ProgramokMezok.tsx" "app/(app)/orszagprofil/components/mezok/RendezvenyekMezok.tsx" "app/(app)/orszagprofil/components/mezok/KapcsolatokMezok.tsx" "app/(app)/orszagprofil/components/mezok/MagyarErtekelesMezok.tsx" "app/(app)/orszagprofil/components/RendezvenySorok.tsx" lib/orszagprofil-szotar.ts
git commit -m "$(cat <<'EOF'
feat(mezo-sugo): a kérdőjeles magyarázat bekötése az országprofil szerkesztőbe

A látható súgósorok a tooltipbe költöztek, a rendezvénysorok mezői is kapnak magyarázatot,
az Időpont placeholderje megszűnt.

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
EOF
)"
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
docs(mezo-sugo): CLAUDE.md – a kötelező magyarázat a MEZO_CIMKEK-ben, SugoGomb és CimkeSor

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
EOF
)"
git log --oneline -5; git status --short
```

---

## Önellenőrzés (a spec lefedettsége)

| Spec-követelmény | Hol |
| --- | --- |
| Kérdőjeles gomb minden kitöltendő mezőnél, hover + billentyű + koppintás | Task 1 (`SugoGomb`), Task 3 Step 14 |
| Magyarázat + példa, a szöveg a spec táblái szerint | Task 2 Step 3 |
| A látható súgósorok a tooltipbe kerülnek | Task 2 (szöveg beolvad), Task 3 Step 1–8, 10 |
| A `sugo` prop marad a többi űrlapnak | Task 1 Step 5–7 (`magyarazat` nélkül a `CimkeSor` puszta `Label`) |
| A rendezvénysorok mezői, a placeholder megszűnése | Task 2 `REND_MEZO_CIMKEK`, Task 3 Step 9 |
| Kötelező magyarázat (típus garantálja) | Task 2 `MezoCimke.magyarazat` |
| `aria-describedby` nem mutat nem létező elemre | Task 1 Step 5 megjegyzése, Task 3 Step 14 (`latszoSugoSor: 0`) |
| A gomb a `Label` testvére, nem küldi be az űrlapot | Task 1 Step 3–4, Task 3 Step 14 |
| Ellenőrzés: tsc, build, validátor-script, böngésző | Task 2 Step 4–5, Task 3 Step 11, 14, 15 |
| `CLAUDE.md` frissítése | Task 3 Step 12 |
