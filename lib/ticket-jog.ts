import type { AppSession } from './session';
import type { StatuszKulcs } from './ticket-szotar';

/** A jogosultsághoz a címzett (és íráshoz a státusz) kell; a lista- és részlet-típusok is tartalmazzák. */
export interface TicketJogAlany {
  cimzettId: string;
}

/** Admin mindent lát; attasé csak a hozzá címzettet. */
export function canViewTicket(session: Pick<AppSession, 'userId' | 'role'>, t: TicketJogAlany): boolean {
  return session.role === 'admin' || t.cimzettId === session.userId;
}

/** Írni az láthat és nem lezárt ticketbe lehet. */
export function canWriteTicket(
  session: Pick<AppSession, 'userId' | 'role'>,
  t: TicketJogAlany & { statusz: StatuszKulcs },
): boolean {
  return canViewTicket(session, t) && t.statusz !== 'lezart';
}
