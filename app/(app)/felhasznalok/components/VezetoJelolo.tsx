'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { vezetoSugo, type VezetoHelyzet } from '../../../../lib/attase-orszag';

/**
 * Relációs vezető jelölő egy országhoz (natív checkbox: a components/ui-ban nincs checkbox).
 * Ha az országnak nincs más attaséja, bejelölt és letiltott – egyedüli attasé, automatikusan
 * vezető; a letiltott checkbox nem küldődik be, ezért ilyenkor rejtett mező viszi az `on`
 * értéket. A súgót a hívó helyezi el (`VezetoSugo`), hogy a régiós sorban a sor alá kerüljön.
 * A `defaultChecked` render után a vezérelt értéket követi: a React 19 a `<form action>` után
 * `form.reset()`-et hív, a vezérelt checkbox `defaultChecked`-je pedig a kezdőérték maradna –
 * hibás beküldés után a jelölő visszaugrana (ugyanez a `NativeSelect`-ben a `defaultSelected`-re).
 * A `cimke` ReactNode: a régiós sorban a látható „Vezető” mellé képernyőolvasó-szöveg (az ország
 * neve) kerül, különben minden jelölő ugyanazt a nevet viselné. A natív checkbox fókuszgyűrűje a
 * globális `outline-ring/50` miatt alig látszik, ezért kifejezett kontúrt kap.
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
  cimke: ReactNode;
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
        className="size-4 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
