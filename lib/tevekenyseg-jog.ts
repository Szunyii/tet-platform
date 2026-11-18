import type { AppSession } from './session';

/** A jogosultsághoz csak a bejegyzés (tevékenység vagy eredmény) gazdája kell; a lista- és részlet-típusok is tartalmazzák. */
export interface BejegyzesJogAlany {
  attaseId: string;
}

/** Tevékenységet és eredményt csak az attasé rögzít; az admin nem rögzít az attasé helyett. */
export function canRogzit(session: AppSession): boolean {
  return session.role === 'attase';
}

/** Admin mindent lát; attasé csak a sajátját (idegen bejegyzésre az oldal 404-et ad). */
export function canViewBejegyzes(session: AppSession, b: BejegyzesJogAlany): boolean {
  return session.role === 'admin' || b.attaseId === session.userId;
}

/** Módosítás, törlés és az ügy attasé-műveletei: csak a bejegyzés gazdája, az admin nem. */
export function canModosit(session: AppSession, b: BejegyzesJogAlany): boolean {
  return session.role === 'attase' && b.attaseId === session.userId;
}

/** Igazolás, visszaküldés, visszavonás és kifogás: csak a központ (admin). */
export function canIgazol(session: AppSession): boolean {
  return session.role === 'admin';
}
