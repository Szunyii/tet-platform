import 'server-only';
import { db } from '../index';
import { user } from '../schema';
import type { Szerepkor } from '../../lib/felhasznalo-validacio';

export interface FelhasznaloSor {
  id: string;
  nev: string;
  email: string;
  szerepkor: Szerepkor;
  orszag: string | null;
  tiltott: boolean;
  letrehozva: Date;
}

/**
 * Minden felhasználó magyar név szerinti sorrendben. Szinkron (better-sqlite3).
 * A rendezés JS-ben (localeCompare 'hu'): a SQLite BINARY collation az ékezetes neveket
 * (Ács, Örkény, Ürmös) a lista végére tenné. Néhány tucat sorra ez elhanyagolható.
 */
export function listFelhasznalok(): FelhasznaloSor[] {
  const now = Date.now();
  return db
    .select({
      id: user.id,
      nev: user.name,
      email: user.email,
      role: user.role,
      orszag: user.orszag,
      banned: user.banned,
      banExpires: user.banExpires,
      createdAt: user.createdAt,
    })
    .from(user)
    .all()
    .map((r) => ({
      id: r.id,
      nev: r.nev,
      email: r.email,
      szerepkor: r.role === 'admin' ? ('admin' as const) : ('attase' as const),
      orszag: r.orszag ?? null,
      // A Better Auth a lejárt banExpires-t nem tekinti tiltásnak.
      tiltott: Boolean(r.banned) && (!r.banExpires || r.banExpires.getTime() > now),
      letrehozva: r.createdAt,
    }))
    .sort((a, b) => a.nev.localeCompare(b.nev, 'hu'));
}
