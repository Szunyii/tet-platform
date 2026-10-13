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

/**
 * A „Megtett intézkedés” írása: csak a központ (admin). Olvasni az láthatja, aki magát a
 * bejegyzést (canViewRiport) – az attasé a sajátjánál, csak olvasásra.
 */
export function canIntezkedni(session: AppSession): boolean {
  return session.role === 'admin';
}
