'use client';

import { useLayoutEffect, useRef } from 'react';
import { vezetoSugo, type VezetoHelyzet } from '../../../../lib/attase-orszag';

/**
 * Relációs vezető jelölő egy országhoz (natív checkbox: a components/ui-ban nincs checkbox).
 * Ha az országnak nincs más attaséja, bejelölt és letiltott – egyedüli attasé, automatikusan
 * vezető; a letiltott checkbox nem küldődik be, ezért ilyenkor rejtett mező viszi az `on`
 * értéket. A súgót a hívó helyezi el (`VezetoSugo`), hogy a régiós sorban a sor alá kerüljön.
 * A `defaultChecked` render után a vezérelt értéket követi: a React 19 a `<form action>` után
 * `form.reset()`-et hív, a vezérelt checkbox `defaultChecked`-je pedig a kezdőérték maradna –
 * hibás beküldés után a jelölő visszaugrana (ugyanez a `NativeSelect`-ben a `defaultSelected`-re).
 */
export function VezetoJelolo({
  id,
  name,
  cimke,
  bejelolve,
  onChange,
  helyzet,
}: {
  id: string;
  name: string;
  cimke: string;
  bejelolve: boolean;
  onChange: (bejelolve: boolean) => void;
  helyzet: VezetoHelyzet;
}) {
  const egyedul = helyzet.masok === 0;
  const checked = egyedul || bejelolve;
  const vanSugo = vezetoSugo(helyzet, bejelolve) !== null;
  const ref = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    if (ref.current && ref.current.defaultChecked !== checked) ref.current.defaultChecked = checked;
  });
  return (
    <label className="flex shrink-0 items-center gap-2 text-sm">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        name={egyedul ? undefined : name}
        checked={checked}
        disabled={egyedul}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={vanSugo ? `${id}-sugo` : undefined}
        className="size-4 accent-primary"
      />
      {cimke}
      {egyedul && <input type="hidden" name={name} value="on" />}
    </label>
  );
}

/** A jelölő súgója (`<id>-sugo`); semmit nem renderel, ha nincs mit mondani. */
export function VezetoSugo({ id, helyzet, bejelolve }: { id: string; helyzet: VezetoHelyzet; bejelolve: boolean }) {
  const sugo = vezetoSugo(helyzet, bejelolve);
  return sugo ? <p id={`${id}-sugo`} className="text-xs text-muted-foreground">{sugo}</p> : null;
}
