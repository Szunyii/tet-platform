import { asc } from 'drizzle-orm';
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

/** Minden felhasználó név szerint. Szinkron (better-sqlite3). */
export function listFelhasznalok(): FelhasznaloSor[] {
  return db
    .select({
      id: user.id,
      nev: user.name,
      email: user.email,
      role: user.role,
      orszag: user.orszag,
      banned: user.banned,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(asc(user.name))
    .all()
    .map((r) => ({
      id: r.id,
      nev: r.nev,
      email: r.email,
      szerepkor: r.role === 'admin' ? 'admin' : 'attase',
      orszag: r.orszag ?? null,
      tiltott: Boolean(r.banned),
      letrehozva: r.createdAt,
    }));
}
