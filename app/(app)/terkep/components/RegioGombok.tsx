'use client';

import { Button } from '../../../../components/ui/button';
import { REGIOK } from '../../../../lib/terkep-mutatok';

/** Régió-gyorsválasztó a térkép bal felső sarkában; az aktív gomb `aria-pressed`. */
export function RegioGombok({ aktiv, onValaszt }: { aktiv: string | null; onValaszt: (kulcs: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="Régió">
      {REGIOK.map((r) => (
        <Button
          key={r.kulcs}
          type="button"
          size="xs"
          variant={aktiv === r.kulcs ? 'default' : 'outline'}
          aria-pressed={aktiv === r.kulcs}
          onClick={() => onValaszt(r.kulcs)}
        >
          {r.cimke}
        </Button>
      ))}
    </div>
  );
}
