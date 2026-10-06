'use client';

import { useImperativeHandle, useLayoutEffect, useRef, type ComponentProps } from 'react';
import { cn } from '../../lib/utils';

/** A shadcn `Input` osztályai (components/ui/input.tsx) a file:/placeholder: részek nélkül. */
const NATIVE_SELECT_CLASS =
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 pr-8 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40';

/**
 * Natív <select> a shadcn Input megjelenésével; űrlapokban ott, ahol nem kell kereshető
 * lenyíló (a Base UI Select üres értéket nem tud választani).
 *
 * Vezérelt használatnál (`value`) az opciók `defaultSelected`-je a `value`-t követi. A React 19 a
 * <form action> után (hibánál is) form.reset()-et hív, ami a selectet a `defaultSelected`
 * opcióra állítja vissza, a vezérelt értéket pedig nem állítja helyre (az <input>-tal ellentétben
 * a `defaultSelected`-et csak `defaultValue`-ból állítja be). Enélkül hibás beküldés után a
 * választás elveszne: a select a szerver-renderelt kezdőértékre, kliensen renderelve az első
 * opcióra ugrana vissza. `defaultValue`-s (nem vezérelt) használatnál a React maga állítja be,
 * ott nincs teendő.
 */
export function NativeSelect({ className, ref, ...props }: ComponentProps<'select'>) {
  const select = useRef<HTMLSelectElement>(null);
  // A `ref` (React 19-ben sima prop) a belső ref mellett is működik.
  useImperativeHandle(ref, () => select.current as HTMLSelectElement, []);

  const { value } = props;
  // Deps nélkül, minden renderkor: a reset a commit mutációs fázisa végén fut, ez a layout effect
  // utána. Csak eltérésnél írunk a DOM-ba.
  useLayoutEffect(() => {
    const el = select.current;
    if (!el || value == null) return;
    const celok = typeof value === 'object' ? Array.from(value, String) : [String(value)];
    for (const o of el.options) {
      const kell = celok.includes(o.value);
      if (o.defaultSelected !== kell) o.defaultSelected = kell;
    }
  });

  return <select data-slot="native-select" {...props} ref={select} className={cn(NATIVE_SELECT_CLASS, className)} />;
}
