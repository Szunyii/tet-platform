import Link from 'next/link';
import type { KorlevelTag } from '../../../../db/queries/ticket';
import { orszagNev } from '../../../../lib/orszagok';
import { listaUrl, type TicketSzuro } from '../../../../lib/ticket-szotar';
import { cn } from '../../../../lib/utils';
import { StatuszBadge } from './TicketJelzesek';

/**
 * Az admin adatlapján: a körlevél ticketjei (címzettenként egy) a státuszukkal, mindegyik link a
 * saját ticketére a lista aktuális szűrőjével. Az aktuális ticket `aria-current="true"`-val
 * (a listában ugyanez a ticket már `aria-current="page"`). A sorok két sorosak (név, alatta az
 * ország), mert az oldalsó oszlop keskeny; a teljes szöveg a `title`-ben is megvan.
 */
export function KorlevelTagok({ tagok, aktivId, szuro }: { tagok: KorlevelTag[]; aktivId: string; szuro: TicketSzuro }) {
  return (
    <div className="mt-4 flex flex-col gap-1.5">
      <h4 className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        Körlevél · {tagok.length} címzett
      </h4>
      <ul className="-mx-1.5 flex flex-col">
        {tagok.map((t) => {
          const aktiv = t.id === aktivId;
          return (
            <li key={t.id}>
              <Link
                href={listaUrl(szuro, t.id)}
                aria-current={aktiv ? 'true' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded px-1.5 py-1 text-[13px] text-foreground no-underline outline-none hover:bg-muted/40 hover:no-underline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                  aktiv && 'bg-primary/10 ring-1 ring-inset ring-primary/20',
                )}
              >
                <span className="min-w-0 flex-1" title={`${t.cimzettNev} · ${orszagNev(t.orszag)}`}>
                  <span className="block truncate">{t.cimzettNev}</span>
                  <span className="sr-only">, </span>
                  <span className="block truncate text-xs text-muted-foreground">{orszagNev(t.orszag)}</span>
                </span>
                <span className="sr-only">, </span>
                <StatuszBadge statusz={t.statusz} />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
