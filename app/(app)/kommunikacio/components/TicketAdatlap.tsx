import type { ReactNode } from 'react';
import type { MuveletState } from '../../../../components/form/useMuveletForm';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import type { TicketDetail } from '../../../../db/queries/ticket';
import { formatDatum, formatNaptariDatum } from '../../../../lib/datum';
import { cn } from '../../../../lib/utils';
import { PrioJelzes, StatuszBadge, TipusBadge } from './TicketJelzesek';
import { TicketStatuszGombok } from './TicketStatuszGombok';

function Sor({ cimke, children }: { cimke: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">{cimke}</dt>
      <dd className="mt-0.5 text-[13px]">{children}</dd>
    </div>
  );
}

export function TicketAdatlap({
  ticket,
  admin,
  ma,
  lezarAction,
  ujranyitAction,
}: {
  ticket: TicketDetail;
  admin: boolean;
  /** Mai nap YYYY-MM-DD (Europe/Budapest). */
  ma: string;
  lezarAction: () => Promise<MuveletState>;
  ujranyitAction: () => Promise<MuveletState>;
}) {
  const lejart = Boolean(ticket.hatarido && ticket.hatarido < ma && ticket.statusz !== 'lezart');
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-[13px]">Ticket adatlap</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <dl className="flex flex-col gap-3">
          <Sor cimke="Típus">
            <TipusBadge tipus={ticket.tipus} />
          </Sor>
          <Sor cimke="Prioritás">
            <PrioJelzes prio={ticket.prio} />
          </Sor>
          <Sor cimke="Státusz">
            <StatuszBadge statusz={ticket.statusz} />
          </Sor>
          <Sor cimke="Határidő">
            {ticket.hatarido ? (
              <span className={cn(lejart && 'text-destructive')}>
                {formatNaptariDatum(ticket.hatarido)}
                {lejart && ' (lejárt)'}
              </span>
            ) : (
              <span className="text-muted-foreground">nincs</span>
            )}
          </Sor>
          <Sor cimke="Érintett poszt">
            {ticket.orszag} · {ticket.cimzettNev}
          </Sor>
          <Sor cimke="Nyitotta">
            {ticket.nyitoNev ?? <span className="text-muted-foreground">törölt felhasználó</span>} ·{' '}
            {formatDatum(ticket.createdAt)}
          </Sor>
          {ticket.lezarvaAt && <Sor cimke="Lezárva">{formatDatum(ticket.lezarvaAt)}</Sor>}
        </dl>
        {admin && (
          <div className="mt-4">
            <TicketStatuszGombok
              lezart={ticket.statusz === 'lezart'}
              targy={ticket.targy}
              lezarAction={lezarAction}
              ujranyitAction={ujranyitAction}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
