import Link from 'next/link';
import type { KorlevelTag } from '../../../../db/queries/ticket';
import { orszagNev } from '../../../../lib/orszagok';
import type { TicketSzuro } from '../../../../lib/ticket-szotar';
import { cn } from '../../../../lib/utils';
import { listaUrl } from '../lista-url';
import { StatuszBadge } from './TicketJelzesek';

/**
 * Az admin adatlapján: a körlevél ticketjei (címzettenként egy) a státuszukkal, mindegyik link a
 * saját ticketére a lista aktuális szűrőjével. Az aktuális ticket `aria-current="true"`-val
 * (a listában ugyanez a ticket már `aria-current="page"`).
 */
export function KorlevelTagok({ tagok, aktivId, szuro }: { tagok: KorlevelTag[]; aktivId: string; szuro: TicketSzuro }) {
  return (
    <section aria-labelledby="korlevel-cim" className="mt-4 flex flex-col gap-1.5">
      <h4 id="korlevel-cim" className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        Körlevél · {tagok.length} címzett
      </h4>
      <ul className="flex flex-col">
        {tagok.map((t) => {
          const aktiv = t.id === aktivId;
          return (
            <li key={t.id}>
              <Link
                href={listaUrl(szuro, t.id)}
                aria-current={aktiv ? 'true' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded px-1.5 py-1 text-[13px] text-foreground no-underline hover:bg-muted/40 hover:no-underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  aktiv && 'bg-primary/10',
                )}
              >
                <span className="min-w-0 flex-1 truncate">
                  {t.cimzettNev} · {orszagNev(t.orszag)}
                </span>
                <StatuszBadge statusz={t.statusz} />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
