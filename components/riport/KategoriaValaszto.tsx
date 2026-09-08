'use client';

import {
  CalendarDaysIcon,
  CoinsIcon,
  FileTextIcon,
  HandshakeIcon,
  LandmarkIcon,
  NetworkIcon,
  type LucideIcon,
} from 'lucide-react';
import { useRef, type KeyboardEvent } from 'react';
import { cn } from '../../lib/utils';
import { KATEGORIAK, type KategoriaKulcs } from '../../lib/riport-szotar';

const IKONOK: Record<KategoriaKulcs, LucideIcon> = {
  szabalyozas: LandmarkIcon,
  finanszirozas: CoinsIcon,
  okoszisztema: NetworkIcon,
  rendezveny: CalendarDaysIcon,
  palyazat: FileTextIcon,
  egyuttmukodes: HandshakeIcon,
};

export function KategoriaValaszto({
  value,
  onChange,
  invalid = false,
}: {
  value: KategoriaKulcs | null;
  onChange: (k: KategoriaKulcs) => void;
  invalid?: boolean;
}) {
  const gombok = useRef<(HTMLButtonElement | null)[]>([]);

  // Rádiócsoport billentyűzet: nyilak léptetnek és választanak, a fókusz a választotton marad.
  function onKeyDown(e: KeyboardEvent, i: number) {
    const irany = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!irany) return;
    e.preventDefault();
    const j = (i + irany + KATEGORIAK.length) % KATEGORIAK.length;
    onChange(KATEGORIAK[j].kulcs);
    gombok.current[j]?.focus();
  }

  return (
    <div
      id="kategoria"
      role="radiogroup"
      aria-labelledby="kategoria-label"
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? 'kategoria-hiba' : undefined}
      tabIndex={-1}
      className="grid gap-2 outline-none sm:grid-cols-2 lg:grid-cols-3"
    >
      <input type="hidden" name="kategoria" value={value ?? ''} />
      {KATEGORIAK.map((k, i) => {
        const Ikon = IKONOK[k.kulcs];
        const on = value === k.kulcs;
        return (
          <button
            key={k.kulcs}
            ref={(el) => {
              gombok.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on || (value === null && i === 0) ? 0 : -1}
            onClick={() => onChange(k.kulcs)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-3 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
              on ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card hover:bg-muted/50',
              invalid && !on && 'border-destructive/40',
            )}
          >
            <span className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg', k.szin)}>
              <Ikon className="size-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium leading-snug">{k.cimke}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{k.leiras}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
