'use client';

import { X } from 'lucide-react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { Badge } from '../../../../components/ui/badge';
import { VS_MAX, VS_MIN } from './useTerkepAllapot';

/**
 * A panel tetején: az összehasonlítás-halmaz chipjei és egy állapotszöveg. Az összehasonlító tábla
 * magától megjelenik a térkép alatt, amint VS_MIN ország van a halmazban, ezért itt nincs gomb.
 */
export function OsszehasonlitasCsik({ orszagok, onKivesz }: {
  /** A halmaz rekordjai a hozzáadás sorrendjében. */
  orszagok: TerkepOrszag[];
  onKivesz: (kod: string) => void;
}) {
  const tele = orszagok.length >= VS_MAX;
  // A „+" gombok letiltva, ha tele; a letiltott gombon a title nem jelenik meg, ezért itt a felirat.
  const allapot = tele
    ? `Legfeljebb ${VS_MAX} ország`
    : orszagok.length < VS_MIN
      ? 'Válassz még egy országot'
      : 'A tábla a térkép alatt';
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border bg-muted/40 px-2.5 py-2 text-xs">
      <span className="text-muted-foreground">Összehasonlítás:</span>
      {orszagok.map((o) => (
        // h-6 + overflow-visible: a Badge alapból h-5 és overflow-hidden, ami levágná a gomb fókuszgyűrűjét.
        <Badge key={o.kod} variant="outline" className="h-6 gap-1 overflow-visible bg-background pr-1">
          {o.nev}
          <button
            type="button"
            className="rounded-full p-0.5 outline-none hover:bg-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label={`${o.nev} kivétele`}
            onClick={() => onKivesz(o.kod)}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <span className="ml-auto text-muted-foreground">{allapot}</span>
    </div>
  );
}
