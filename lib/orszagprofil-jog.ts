import type { AppSession } from './session';
import { EV_MIN } from './orszagprofil-szotar';

/**
 * Olvasni bárki olvashat bármely profilt. Szerkeszteni: admin bármely országot
 * EV_MIN és az aktuális év között; attasé csak a saját országát és csak az aktuális évet.
 */
export function canEditProfil(session: AppSession, kod: string, ev: number, aktualisEv: number): boolean {
  if (!Number.isInteger(ev) || ev < EV_MIN || ev > aktualisEv) return false;
  if (session.role === 'admin') return true;
  return session.orszag === kod && ev === aktualisEv;
}
