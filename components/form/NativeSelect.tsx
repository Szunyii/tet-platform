'use client';

import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

/** A shadcn `Input` osztályai (components/ui/input.tsx) a file:/placeholder: részek nélkül. */
const NATIVE_SELECT_CLASS =
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 pr-8 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40';

/**
 * Natív <select> a shadcn Input megjelenésével; űrlapokban ott, ahol nem kell kereshető
 * lenyíló (a Base UI Select üres értéket nem tud választani).
 */
export function NativeSelect({ className, ...props }: ComponentProps<'select'>) {
  return <select data-slot="native-select" {...props} className={cn(NATIVE_SELECT_CLASS, className)} />;
}
