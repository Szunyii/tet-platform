'use client';

import { X } from 'lucide-react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { Badge } from '../../../../components/ui/badge';
import { VS_MAX } from './useTerkepAllapot';

/**
 * A panel tetején: az összehasonlítás-halmaz chipjei az országok színével (a térkép mellett ez a
 * jelmagyarázat) és egy állapotszöveg. Az összehasonlítás magától megjelenik a térkép alatt, amint
 * `minimum` ország van a halmazban, ezért itt nincs gomb.
 */
export function OsszehasonlitasCsik({ orszagok, szinek, minimum, onKivesz }: {
  /** A halmaz rekordjai a hozzáadás sorrendjében. */
  orszagok: TerkepOrszag[];
  /** Kód → az ország színe az összehasonlításban. */
  szinek: Readonly<Record<string, string>>;
  /** Ennyi országtól látszik az összehasonlítás (`TerkepAllapot.vsMin`: magyar profil mellett 1, különben 2). */
  minimum: number;
  onKivesz: (kod: string) => void;
}) {
  const tele = orszagok.length >= VS_MAX;
  // A „+" gombok letiltva, ha tele; a letiltott gombon a title nem jelenik meg, ezért itt a felirat.
  const allapot = tele
    ? `Legfeljebb ${VS_MAX} ország`
    : orszagok.length < minimum
      ? 'Válassz még egy országot'
      : 'Az összehasonlítás a térkép alatt';
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border bg-muted/40 px-2.5 py-2 text-xs">
      <span className="text-muted-foreground">Összehasonlítás:</span>
      {orszagok.map((o) => (
        // h-6 + overflow-visible: a Badge alapból h-5 és overflow-hidden, ami levágná a gomb fókuszgyűrűjét.
        <Badge key={o.kod} variant="outline" className="h-6 gap-1 overflow-visible bg-background pr-1">
          {/* Inline style szándékosan: a szín az összehasonlítás palettájából jön (VS_SZINEK). */}
          <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: szinek[o.kod] }} />
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
