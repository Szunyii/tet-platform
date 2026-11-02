import type { AppSession } from './session';

/** A tudástár kártyáit csak a központ (admin) szerkeszti; olvasni minden bejelentkezett felhasználó tud. */
export function canEditTudastar(session: AppSession): boolean {
  return session.role === 'admin';
}
