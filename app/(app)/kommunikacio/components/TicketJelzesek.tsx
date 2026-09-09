import { Badge } from '../../../../components/ui/badge';
import { PRIORITASOK, STATUSZOK, TIPUSOK, type PrioKulcs, type StatuszKulcs, type TipusKulcs } from '../../../../lib/ticket-szotar';
import { cn } from '../../../../lib/utils';

// A színek itt, nem a szótárban (mint a riport KategoriaBadge-nél): a szótár framework-mentes marad.
const STATUSZ_SZIN: Record<StatuszKulcs, string> = {
  nyitott: 'bg-sky-100 text-sky-900',
  valaszra_var: 'bg-amber-100 text-amber-900',
  folyamatban: 'bg-emerald-100 text-emerald-900',
  lezart: 'bg-neutral-200 text-neutral-700',
};

export function StatuszBadge({ statusz }: { statusz: StatuszKulcs }) {
  return <Badge className={cn('border-transparent', STATUSZ_SZIN[statusz])}>{STATUSZOK[statusz]}</Badge>;
}

export function TipusBadge({ tipus }: { tipus: TipusKulcs }) {
  return <Badge variant="secondary">{TIPUSOK[tipus]}</Badge>;
}

const PRIO_SZOVEG: Record<PrioKulcs, string> = {
  magas: 'text-destructive font-medium',
  kozepes: 'text-amber-700',
  alacsony: 'text-muted-foreground',
};

/** Prioritás szövegként, színnel (adatlap). */
export function PrioJelzes({ prio }: { prio: PrioKulcs }) {
  return <span className={PRIO_SZOVEG[prio]}>{PRIORITASOK[prio]}</span>;
}

const PRIO_SZEGELY: Record<PrioKulcs, string> = {
  magas: 'border-l-destructive',
  kozepes: 'border-l-amber-500',
  alacsony: 'border-l-border',
};

/** A listaelem bal szegélyének színe prioritás szerint. */
export function prioSzegely(prio: PrioKulcs): string {
  return PRIO_SZEGELY[prio];
}

/** Monogram-kör az üzenetbuborékhoz. */
export function Monogram({ nev, sajat }: { nev: string; sajat: boolean }) {
  const reszek = nev.trim().split(/\s+/);
  const betuk = ((reszek[0]?.[0] ?? '') + (reszek[1]?.[0] ?? '')).toUpperCase() || '?';
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
        sajat ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
      )}
    >
      {betuk}
    </span>
  );
}
