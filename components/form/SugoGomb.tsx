'use client';

import { CircleQuestionMark } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

/**
 * Kérdőjeles gomb a mező címkéje mellett: hoverre, koppintásra vagy Enter/Space-re felugró
 * magyarázat + példa. Valódi `<button type="button">`: nem küldi be az űrlapot, és a Tab-sorrendben
 * közvetlenül a mező előtt érhető el. Popover (nem Tooltip): hosszabb szöveg is elfér, és
 * érintőképernyőn is nyílik.
 *
 * A `pelda` `\n`-nel több soros is lehet (pl. a vállalatlista soronként jelenik meg).
 */
export function SugoGomb({
  cimke, magyarazat, pelda,
}: { cimke: string; magyarazat: string; pelda?: string }) {
  return (
    <Popover>
      <PopoverTrigger
        type="button"
        openOnHover
        delay={150}
        closeDelay={100}
        aria-label={`Magyarázat: ${cimke}`}
        className="inline-flex size-5 shrink-0 cursor-help items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <CircleQuestionMark aria-hidden className="size-4" />
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-80 max-w-[calc(100vw-2rem)]">
        <p>{magyarazat}</p>
        {pelda && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Példa</span>
            <p className="whitespace-pre-line rounded-md bg-muted px-2 py-1.5 text-xs">{pelda}</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
