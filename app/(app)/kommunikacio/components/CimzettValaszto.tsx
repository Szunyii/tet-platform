'use client';

import { useLayoutEffect, useRef } from 'react';
import { MezoHiba } from '../../../../components/form/MezoHiba';
import { Button } from '../../../../components/ui/button';
import { orszagNev } from '../../../../lib/orszagok';
import { regioCsoportok } from '../../../../lib/ticket-cimzettek';
import type { CimzettJelolt } from '../../../../lib/ticket-szotar';
import type { MezoHibak } from '../../../../lib/urlap';

/**
 * Az új ticket címzettjei: gyorsgombok („Mindenki”, régiónként, „Kijelölés törlése”) és bejelölős
 * lista. A gyorsgomb kapcsoló (`aria-pressed`): benyomott, ha a csoport minden tagja ki van jelölve;
 * benyomatlanul hozzáadja a tagokat a kijelöléshez, benyomva kiveszi őket – így két régió egymás
 * után összeadható. A jelölőnégyzetek (`name="cimzettId"`) mindig az aktuális jelöltlistából
 * épülnek: a revalidálás után eltűnt jelölt nem küldődik be, akkor sem, ha a kijelölésben maradt.
 * Az első jelölőnégyzet id-ja `cimzettId`: erre ugrik a fókusz a mezőhibánál (`useMuveletForm`).
 */
export function CimzettValaszto({
  jeloltek,
  kijelolt,
  onChange,
  errors,
}: {
  jeloltek: CimzettJelolt[];
  kijelolt: string[];
  onChange: (kijelolt: string[]) => void;
  errors: MezoHibak;
}) {
  const kijeloltSet = new Set(kijelolt);
  const csoportok = [{ kulcs: 'mind', cimke: 'Mindenki', idk: jeloltek.map((j) => j.id) }, ...regioCsoportok(jeloltek)];
  const darab = jeloltek.filter((j) => kijeloltSet.has(j.id)).length;
  const hiba = Boolean(errors.cimzettId);

  function kapcsol(idk: string[], mindBenne: boolean) {
    if (mindBenne) onChange(kijelolt.filter((id) => !idk.includes(id)));
    else onChange([...kijelolt, ...idk.filter((id) => !kijeloltSet.has(id))]);
  }

  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-1.5 text-sm font-medium">Címzettek</legend>
      <div className="flex flex-wrap gap-1.5">
        {csoportok.map((cs) => {
          const mindBenne = cs.idk.length > 0 && cs.idk.every((id) => kijeloltSet.has(id));
          return (
            <Button
              key={cs.kulcs}
              type="button"
              size="sm"
              variant={mindBenne ? 'default' : 'outline'}
              aria-pressed={mindBenne}
              onClick={() => kapcsol(cs.idk, mindBenne)}
            >
              {cs.cimke} ({cs.idk.length})
            </Button>
          );
        })}
        <Button type="button" size="sm" variant="ghost" disabled={darab === 0} onClick={() => onChange([])}>
          Kijelölés törlése
        </Button>
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {darab} kijelölve
      </p>
      <ul className="flex max-h-64 flex-col overflow-y-auto rounded-md border">
        {jeloltek.map((j, i) => (
          <li key={j.id} className="border-b last:border-b-0">
            <CimzettJelolo
              id={i === 0 ? 'cimzettId' : `cimzettId-${j.id}`}
              jelolt={j}
              bejelolve={kijeloltSet.has(j.id)}
              hiba={hiba}
              onChange={(be) => onChange(be ? [...kijelolt, j.id] : kijelolt.filter((id) => id !== j.id))}
            />
          </li>
        ))}
      </ul>
      <MezoHiba mezo="cimzettId" errors={errors} />
    </fieldset>
  );
}

/**
 * Egy jelölt sora natív checkbox-szal (a components/ui-ban nincs checkbox). A `defaultChecked`
 * render után a vezérelt értéket követi: a React 19 a `<form action>` után `form.reset()`-et hív, és
 * a jelölő különben a kezdőértékre ugrana vissza (ugyanez a minta, mint a `VezetoJelolo`-ban).
 */
function CimzettJelolo({
  id,
  jelolt,
  bejelolve,
  hiba,
  onChange,
}: {
  id: string;
  jelolt: CimzettJelolt;
  bejelolve: boolean;
  hiba: boolean;
  onChange: (bejelolve: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    if (ref.current && ref.current.defaultChecked !== bejelolve) ref.current.defaultChecked = bejelolve;
  });
  return (
    <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/40">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        name="cimzettId"
        value={jelolt.id}
        checked={bejelolve}
        onChange={(e) => onChange(e.target.checked)}
        aria-invalid={hiba || undefined}
        aria-describedby={hiba ? 'cimzettId-hiba' : undefined}
        className="size-4 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
      <span className="min-w-0 truncate">
        {jelolt.nev} <span className="text-muted-foreground">· {jelolt.varos || orszagNev(jelolt.orszag)}</span>
      </span>
    </label>
  );
}
