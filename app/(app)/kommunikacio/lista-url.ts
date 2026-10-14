import type { TicketSzuro } from '../../../lib/ticket-szotar';

/**
 * `/kommunikacio` URL a szűrővel (aktiv = alapértelmezett, nem kerül az URL-be) és a
 * kiválasztott tickettel. A `t`-t szándékosan megtartjuk akkor is, ha az adott ticket nem
 * felel meg az új szűrőnek: az oldal így nyitva tartja a beszélgetést, csak a sor nem
 * lesz kiemelve a listában. A lista és az adatlap körlevél-része is ezt használja.
 */
export function listaUrl(szuro: TicketSzuro, t?: string): string {
  const p = new URLSearchParams();
  if (szuro !== 'aktiv') p.set('sz', szuro);
  if (t) p.set('t', t);
  const q = p.toString();
  return q ? `/kommunikacio?${q}` : '/kommunikacio';
}
