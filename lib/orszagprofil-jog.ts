import type { AppSession } from './session';
import { EV_MIN } from './orszagprofil-szotar';

/**
 * Olvasni bárki olvashat bármely profilt. Szerkeszteni: admin bármely országot EV_MIN és az
 * aktuális év között; attasé csak annak az országnak a profilját, amelynek relációs vezetője
 * (az országprofil felelőse – a session `orszagok` `vezeto` jelzője), és csak az aktuális évet.
 */
export function canEditProfil(
  session: Pick<AppSession, 'role' | 'orszagok'>,
  kod: string,
  ev: number,
  aktualisEv: number,
): boolean {
  if (!Number.isInteger(ev) || ev < EV_MIN || ev > aktualisEv) return false;
  if (session.role === 'admin') return true;
  return ev === aktualisEv && session.orszagok.some((o) => o.kod === kod && o.vezeto);
}
