import 'server-only';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { listAttaseOrszagok } from '../db/queries/attase-orszag';
import { auth } from './auth';
import { szekhelyKod, type SessionOrszag } from './attase-orszag';
import { loginUtvonal } from './routes';

export type AppRole = 'admin' | 'attase';

export interface AppSession {
  userId: string;
  name: string;
  email: string;
  role: AppRole;
  /** Az attasé országai (székhely elöl, utána magyar név szerint); adminnál üres. */
  orszagok: SessionOrszag[];
  /** Átmeneti: a székhely kódja a még át nem állt fogyasztóknak; a 12. task törli. */
  orszag: string | null;
}

/**
 * Aktuális session a kérés cookie-jából, vagy null. Csak szerver oldalon hívható.
 * React.cache: egy kérésen belül (layout + page) egyszer fut le. Server action-ben
 * a cache átlátszó, minden hívás friss. A Better Auth session.cookieCache szándékosan
 * NINCS bekapcsolva: tiltás/törlés után azonnal érvénytelen legyen a session. Az attasé
 * országai minden kérésnél a DB-ből jönnek, így egy admin-módosítás azonnal érvényes.
 */
export const getSession = cache(async (): Promise<AppSession | null> => {
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result) return null;
  const u = result.user;
  // A role hiánya (régi rekord) attasénak számít.
  const role: AppRole = u.role === 'admin' ? 'admin' : 'attase';
  const orszagok = role === 'attase' ? listAttaseOrszagok(u.id) : [];
  return { userId: u.id, name: u.name, email: u.email, role, orszagok, orszag: szekhelyKod(orszagok) };
});

/**
 * Page-ek és action-ök bejelentkezés-ellenőrzése. Hiány esetén /login, a cél útvonallal
 * (?next=), amit a proxy x-pathname fejlécként ad át (elavult cookie-val a proxy átenged,
 * de a session már nincs meg – így sem vész el a mélylink).
 * A redirect() kivétellel működik: mindig await-eld, és soha ne hívd try/catch-en belül.
 */
export async function requireSession(): Promise<AppSession> {
  const session = await getSession();
  if (!session) redirect(loginUtvonal((await headers()).get('x-pathname')));
  return session;
}

/**
 * Admin-only oldalak. Nem admin → 404, hogy ne áruljuk el az oldal létét.
 * A notFound() kivétellel működik: mindig await-eld, és soha ne hívd try/catch-en belül.
 */
export async function requireAdmin(): Promise<AppSession> {
  const session = await requireSession();
  if (session.role !== 'admin') notFound();
  return session;
}
