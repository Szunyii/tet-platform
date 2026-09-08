import type { AppSession } from './session';

/** A jogosultsághoz csak a szerző kell; a lista- és részlet-típusok is tartalmazzák. */
export interface RiportJogAlany {
  szerzoId: string;
}

/** Admin mindent lát; attasé csak a sajátját. */
export function canViewRiport(session: AppSession, riport: RiportJogAlany): boolean {
  return session.role === 'admin' || riport.szerzoId === session.userId;
}

/** Szerkesztés és törlés: ugyanaz a szabály, mint a megtekintés. */
export function canEditRiport(session: AppSession, riport: RiportJogAlany): boolean {
  return canViewRiport(session, riport);
}
