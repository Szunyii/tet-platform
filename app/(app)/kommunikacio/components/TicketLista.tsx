import Link from 'next/link';
import { buttonVariants } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import type { TicketListItem } from '../../../../db/queries/ticket';
import { formatNaptariDatum } from '../../../../lib/datum';
import { PRIORITASOK, SZURO_KULCSOK, SZUROK, type TicketSzuro } from '../../../../lib/ticket-szotar';
import { cn } from '../../../../lib/utils';
import { prioSzegely, TipusBadge } from './TicketJelzesek';

/** `/kommunikacio` URL a szűrővel (aktiv = alapértelmezett, nem kerül az URL-be) és a kiválasztott tickettel. */
function listaUrl(szuro: TicketSzuro, t?: string): string {
  const p = new URLSearchParams();
  if (szuro !== 'aktiv') p.set('sz', szuro);
  if (t) p.set('t', t);
  const q = p.toString();
  return q ? `/kommunikacio?${q}` : '/kommunikacio';
}

export function TicketLista({
  sorok,
  kivalasztottId,
  szuro,
  admin,
  ma,
}: {
  sorok: TicketListItem[];
  kivalasztottId: string | null;
  szuro: TicketSzuro;
  admin: boolean;
  /** Mai nap YYYY-MM-DD (Europe/Budapest), a lejárt határidő jelzéséhez. */
  ma: string;
}) {
  return (
    <Card className="flex min-w-0 flex-col gap-0 overflow-hidden py-0">
      <nav aria-label="Szűrő" className="flex flex-wrap gap-1.5 border-b p-3">
        {SZURO_KULCSOK.map((k) => (
          <Link
            key={k}
            href={listaUrl(k, kivalasztottId ?? undefined)}
            aria-current={k === szuro ? 'true' : undefined}
            className={buttonVariants({ variant: k === szuro ? 'default' : 'outline', size: 'sm' })}
          >
            {SZUROK[k]}
          </Link>
        ))}
      </nav>
      {sorok.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          {szuro === 'mind' ? 'Még nincs ticket.' : 'Nincs a szűrőnek megfelelő ticket.'}
        </p>
      ) : (
        <ul className="flex max-h-[68vh] flex-col overflow-auto">
          {sorok.map((t) => {
            const aktiv = t.id === kivalasztottId;
            // Naptári nap string-összehasonlítás (YYYY-MM-DD), nincs időzóna-csúszás.
            const lejart = Boolean(t.hatarido && t.hatarido < ma && t.statusz !== 'lezart');
            return (
              <li key={t.id} className={cn('border-b border-l-[3px] last:border-b-0', prioSzegely(t.prio))}>
                <Link
                  href={listaUrl(szuro, t.id)}
                  aria-current={aktiv ? 'page' : undefined}
                  className={cn('block px-3 py-2.5 hover:bg-muted/60', aktiv && 'bg-accent')}
                >
                  <div className="flex items-center gap-2">
                    {t.olvasatlan && (
                      <span className="size-2 shrink-0 rounded-full bg-primary" role="img" aria-label="Olvasatlan" />
                    )}
                    <TipusBadge tipus={t.tipus} />
                    {/* A prioritást a bal szegély színe mutatja; felolvasónak szöveg is kell. */}
                    <span className="sr-only">{PRIORITASOK[t.prio]} prioritás</span>
                    {t.hatarido && (
                      <span
                        className={cn('ml-auto font-mono text-[11px]', lejart ? 'text-destructive' : 'text-muted-foreground')}
                        title={lejart ? 'Lejárt határidő' : 'Határidő'}
                      >
                        {formatNaptariDatum(t.hatarido)}
                      </span>
                    )}
                  </div>
                  <p className={cn('mt-1 text-[13px] leading-snug', t.olvasatlan ? 'font-semibold' : 'font-medium')}>
                    {t.targy}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {admin && `${t.orszag} · ${t.cimzettNev} · `}
                    {t.uzenetSzam} üzenet
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
