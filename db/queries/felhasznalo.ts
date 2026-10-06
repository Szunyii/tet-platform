import 'server-only';
import { db } from '../index';
import { user } from '../schema';
import { listOrszagokFelhasznalonkent } from './attase-orszag';
import type { AttaseOrszag } from '../../lib/attase-orszag';
import type { ElerhetosegAdatok, Szerepkor } from '../../lib/felhasznalo-validacio';
import { tiltottE } from '../../lib/felhasznalo-tiltas';

export interface FelhasznaloSor extends ElerhetosegAdatok {
  id: string;
  nev: string;
  email: string;
  szerepkor: Szerepkor;
  /** Székhely elöl, utána a régiós országok magyar név szerint; adminnál üres. */
  orszagok: AttaseOrszag[];
  tiltott: boolean;
  letrehozva: Date;
}

/**
 * Minden felhasználó magyar név szerinti sorrendben, az országaival. Szinkron (better-sqlite3).
 * A rendezés JS-ben (localeCompare 'hu'): a SQLite BINARY collation az ékezetes neveket
 * (Ács, Örkény, Ürmös) a lista végére tenné. Néhány tucat sorra ez elhanyagolható.
 */
export function listFelhasznalok(): FelhasznaloSor[] {
  const now = Date.now();
  const orszagok = listOrszagokFelhasznalonkent();
  return db
    .select({
      id: user.id,
      nev: user.name,
      email: user.email,
      role: user.role,
      telefon: user.telefon,
      kapcsolatEmail: user.kapcsolatEmail,
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
      telefon: r.telefon ?? null,
      kapcsolatEmail: r.kapcsolatEmail ?? null,
      orszagok: orszagok.get(r.id) ?? [],
      tiltott: tiltottE(r, now),
      letrehozva: r.createdAt,
    }))
    .sort((a, b) => a.nev.localeCompare(b.nev, 'hu'));
}
