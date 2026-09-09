import Link from 'next/link';
import { buttonVariants } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import type { TicketListItem } from '../../../../db/queries/ticket';
import { formatNaptariDatum } from '../../../../lib/datum';
import { PRIORITASOK, SZURO_KULCSOK, SZUROK, type TicketSzuro } from '../../../../lib/ticket-szotar';
import { cn } from '../../../../lib/utils';
import { prioSzegely, TipusBadge } from './TicketJelzesek';

/**
 * `/kommunikacio` URL a szűrővel (aktiv = alapértelmezett, nem kerül az URL-be) és a
 * kiválasztott tickettel. A `t`-t szándékosan megtartjuk akkor is, ha az adott ticket nem
 * felel meg az új szűrőnek: az oldal így nyitva tartja a beszélgetést, csak a sor nem
 * lesz kiemelve a listában.
 */
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
    <Card className="flex min-w-0 flex-col gap-0 py-0">
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
          {szuro === 'mind'
            ? 'Még nincs ticket.'
            : szuro === 'aktiv'
              ? 'Nincs aktív ticket.'
              : 'Nincs aktív, magas prioritású ticket.'}
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
                  className={cn(
                    'block px-3 py-2.5 outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                    aktiv && 'bg-primary/10 ring-1 ring-inset ring-primary/20',
                  )}
                >
                  <div className="flex items-center gap-2">
                    {t.olvasatlan && (
                      <>
                        <span aria-hidden className="size-2 shrink-0 rounded-full bg-primary" />
                        <span className="sr-only">Olvasatlan</span>
                      </>
                    )}
                    <TipusBadge tipus={t.tipus} />
                    {/* A prioritást a bal szegély színe mutatja; felolvasónak szöveg is kell. */}
                    <span className="sr-only">{PRIORITASOK[t.prio]} prioritás</span>
                    {t.hatarido && (
                      <span
                        className={cn(
                          'ml-auto whitespace-nowrap font-mono text-[11px]',
                          lejart ? 'text-destructive' : 'text-muted-foreground',
                        )}
                      >
                        <span className="sr-only">{lejart ? 'Lejárt határidő: ' : 'Határidő: '}</span>
                        {formatNaptariDatum(t.hatarido)}
                      </span>
                    )}
                  </div>
                  <p
                    className={cn('mt-1 line-clamp-2 text-[13px] leading-snug', t.olvasatlan ? 'font-semibold' : 'font-medium')}
                    title={t.targy}
                  >
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
