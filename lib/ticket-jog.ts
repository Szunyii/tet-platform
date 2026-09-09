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

/**
 * Írni az tud, aki látja a ticketet, és csak amíg nincs lezárva. Nyitás/lezárás/
 * újranyitás admin-only: azt az action-ök requireAdmin()-ja kényszeríti ki, nem ez
 * a modul.
 */
export function canWriteTicket(
  session: Pick<AppSession, 'userId' | 'role'>,
  t: TicketJogAlany & { statusz: StatuszKulcs },
): boolean {
  return canViewTicket(session, t) && t.statusz !== 'lezart';
}
