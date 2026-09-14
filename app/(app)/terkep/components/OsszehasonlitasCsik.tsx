'use client';

import { X } from 'lucide-react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

/** A panel tetején: az összehasonlítás-halmaz chipjei és az „Összehasonlítás (n)" gomb. */
export function OsszehasonlitasCsik({ orszagok, onKivesz, onOsszehasonlit }: {
  /** A halmaz rekordjai a hozzáadás sorrendjében. */
  orszagok: TerkepOrszag[];
  onKivesz: (kod: string) => void;
  onOsszehasonlit: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border bg-muted/40 px-2.5 py-2 text-xs">
      <span className="text-muted-foreground">Összehasonlítás:</span>
      {orszagok.map((o) => (
        <Badge key={o.kod} variant="secondary" className="gap-1 pr-1">
          {o.nev}
          <button
            type="button"
            className="rounded-full p-0.5 hover:bg-foreground/10"
            aria-label={`${o.nev} kivétele`}
            onClick={() => onKivesz(o.kod)}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      {orszagok.length >= 2 ? (
        <Button type="button" size="xs" className="ml-auto" onClick={onOsszehasonlit}>
          Összehasonlítás ({orszagok.length})
        </Button>
      ) : (
        <span className="ml-auto text-muted-foreground">Válassz még egy országot</span>
      )}
    </div>
  );
}
