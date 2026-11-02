import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { KuldGomb } from '../../../../components/form/KuldGomb';
import { buttonVariants } from '../../../../components/ui/button';
import { CardFooter } from '../../../../components/ui/card';
import { formatDatum } from '../../../../lib/datum';
import { kartyaSzerkesztoUrl } from '../../../../lib/routes';
import type { Kartya } from '../../../../lib/tudastar-szotar';
import { cn } from '../../../../lib/utils';

/** Az admin ↑/↓ műveletei (bind-olt `mozgatKartyaAction`); hiányzó irány = a lista szélén, letiltott gomb. */
export interface Mozgatas {
  fel?: () => Promise<void>;
  le?: () => Promise<void>;
}

/**
 * A kártyák közös lábléce: bal oldalt a hívó linkjei (Részletek, honlap), jobb oldalt a „Frissítve” dátum,
 * adminnál a Szerkesztés link és a ↑/↓ gombok (mindkettő külön `<form>`, a `KuldGomb` pendingjével).
 */
export function KartyaLablec({ kartya, mozgatas, children }: { kartya: Kartya; mozgatas?: Mozgatas; children?: ReactNode }) {
  return (
    <CardFooter className="flex-wrap gap-x-4 gap-y-2 text-xs">
      {children}
      <div className="ml-auto flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
        <span className="text-muted-foreground">Frissítve: {formatDatum(kartya.updatedAt)}</span>
        {mozgatas && (
          <div className="flex items-center gap-1">
            <Link href={kartyaSzerkesztoUrl(kartya)} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              Szerkesztés<span className="sr-only">: {kartya.nev}</span>
            </Link>
            <form action={mozgatas.fel}>
              <KuldGomb variant="ghost" size="icon-sm" disabled={!mozgatas.fel} aria-label={`Feljebb: ${kartya.nev}`}>
                <ArrowUpIcon aria-hidden />
              </KuldGomb>
            </form>
            <form action={mozgatas.le}>
              <KuldGomb variant="ghost" size="icon-sm" disabled={!mozgatas.le} aria-label={`Lejjebb: ${kartya.nev}`}>
                <ArrowDownIcon aria-hidden />
              </KuldGomb>
            </form>
          </div>
        )}
      </div>
    </CardFooter>
  );
}
