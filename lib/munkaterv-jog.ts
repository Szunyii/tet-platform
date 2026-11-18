import type { AppSession } from './session';

/** A saját tervét csak az attasé szerkeszti és küldi be; az admin nem szerkeszt helyette. */
export function canSzerkesztTerv(session: AppSession, attaseId: string): boolean {
  return session.role === 'attase' && session.userId === attaseId;
}

/** Központi cél, jóváhagyás, visszaküldés, visszanyitás és célállapot-felülírás: csak a központ (admin). */
export function canJovahagy(session: AppSession): boolean {
  return session.role === 'admin';
}

/** Admin minden tervet lát; attasé csak a sajátját. */
export function canNezTerv(session: AppSession, attaseId: string): boolean {
  return session.role === 'admin' || session.userId === attaseId;
}
