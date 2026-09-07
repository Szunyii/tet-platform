import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from './auth';

export type AppRole = 'admin' | 'attase';

export interface AppSession {
  userId: string;
  name: string;
  email: string;
  role: AppRole;
  orszag: string | null;
}

/** Aktuális session a kérés cookie-jából, vagy null. Csak szerver oldalon hívható. */
export async function getSession(): Promise<AppSession | null> {
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result) return null;
  const u = result.user;
  return {
    userId: u.id,
    name: u.name,
    email: u.email,
    // A role hiánya (régi rekord) attasénak számít.
    role: u.role === 'admin' ? 'admin' : 'attase',
    orszag: u.orszag ?? null,
  };
}

/** Page-ek és action-ök bejelentkezés-ellenőrzése. Hiány esetén /login. */
export async function requireSession(): Promise<AppSession> {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

/** Admin-only oldalak. Nem admin → 404, hogy ne áruljuk el az oldal létét. */
export async function requireAdmin(): Promise<AppSession> {
  const session = await requireSession();
  if (session.role !== 'admin') notFound();
  return session;
}
