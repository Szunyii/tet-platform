'use client';

import { useEffect, useRef } from 'react';
import type { FormAction } from '../../../../components/form/useMuveletForm';
import { Card } from '../../../../components/ui/card';
import type { TicketDetail } from '../../../../db/queries/ticket';
import { formatDatum, formatDatumIdo } from '../../../../lib/datum';
import { orszagNev } from '../../../../lib/orszagok';
import type { UzenetSzerep } from '../../../../lib/ticket-szotar';
import { cn } from '../../../../lib/utils';
import { Monogram, StatuszBadge } from './TicketJelzesek';
import { UzenetUrlap } from './UzenetUrlap';

const SZEREP_CIMKE: Record<UzenetSzerep, string> = { admin: 'NIÜ', attase: 'TéT attasé' };

export function TicketBeszelgetes({
  ticket,
  nezoSzerep,
  nezoNev,
  kuldesAction,
}: {
  ticket: TicketDetail;
  nezoSzerep: UzenetSzerep;
  nezoNev: string;
  kuldesAction: FormAction;
}) {
  const lista = useRef<HTMLOListElement>(null);
  // Új üzenetnél (és ticketváltásnál) az üzenetlista aljára görgetünk – csak a listán belül,
  // az oldal görgetési pozícióját nem bántjuk.
  useEffect(() => {
    const el = lista.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [ticket.id, ticket.uzenetek.length]);

  const lezart = ticket.statusz === 'lezart';
  return (
    <Card className="flex min-w-0 flex-col gap-0 py-0">
      <header className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <StatuszBadge statusz={ticket.statusz} />
          <span className="text-xs text-muted-foreground">nyitva {formatDatum(ticket.createdAt)}</span>
        </div>
        <h2 className="mt-1.5 text-[15px] leading-snug font-semibold">{ticket.targy}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {orszagNev(ticket.orszag)} · {ticket.cimzettNev}
        </p>
      </header>
      {/* Görgethető régió: billentyűzettel is fókuszálható, hogy a nyilakkal olvasható legyen. */}
      <ol
        ref={lista}
        tabIndex={0}
        aria-label="Üzenetek"
        className="flex max-h-[46vh] flex-col gap-3 overflow-auto p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        {ticket.uzenetek.map((u) => {
          const sajat = u.szerzoSzerep === nezoSzerep;
          return (
            <li key={u.id} className={cn('flex gap-2.5', sajat && 'flex-row-reverse')}>
              <Monogram nev={u.szerzoNev} sajat={sajat} />
              <div
                className={cn(
                  'max-w-[76%] rounded-lg border px-3 py-2',
                  sajat ? 'border-primary/20 bg-primary/5' : 'border-border bg-card',
                )}
              >
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="text-xs font-semibold">{u.szerzoNev}</span>
                  <span className="text-[11px] text-muted-foreground">{SZEREP_CIMKE[u.szerzoSzerep]}</span>
                  <time
                    dateTime={u.createdAt.toISOString()}
                    className="ml-auto font-mono text-[11px] whitespace-nowrap text-muted-foreground"
                  >
                    {formatDatumIdo(u.createdAt)}
                  </time>
                </div>
                <p className="text-[13px] leading-relaxed break-words whitespace-pre-wrap">{u.szoveg}</p>
              </div>
            </li>
          );
        })}
      </ol>
      {lezart ? (
        <p className="border-t bg-muted/30 p-3 text-sm text-muted-foreground" role="status">
          {/* A formatDatum kimenete ponttal végződik („2026. 09. 09."), ezért dátum esetén nem teszünk ki még egyet. */}
          A ticket lezárva{ticket.lezarvaAt ? ` ${formatDatum(ticket.lezarvaAt)}` : '.'} Lezárt ticketbe nem lehet írni.
        </p>
      ) : (
        // A `key` a ticketváltáskor újra mountolja az űrlapot: a vázlat és az esetleges
        // hibaüzenet nem szivárog át a következő beszélgetésbe.
        <UzenetUrlap key={ticket.id} action={kuldesAction} kuldoNev={nezoNev} />
      )}
    </Card>
  );
}
