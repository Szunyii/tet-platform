import 'server-only';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { auth } from './auth';

export type AppRole = 'admin' | 'attase';

export interface AppSession {
  userId: string;
  name: string;
  email: string;
  role: AppRole;
  orszag: string | null;
}

/**
 * Aktuális session a kérés cookie-jából, vagy null. Csak szerver oldalon hívható.
 * React.cache: egy kérésen belül (layout + page) egyszer fut le. Server action-ben
 * a cache átlátszó, minden hívás friss. A Better Auth session.cookieCache szándékosan
 * NINCS bekapcsolva: tiltás/törlés után azonnal érvénytelen legyen a session.
 */
export const getSession = cache(async (): Promise<AppSession | null> => {
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
});

/**
 * Page-ek és action-ök bejelentkezés-ellenőrzése. Hiány esetén /login.
 * A redirect() kivétellel működik: mindig await-eld, és soha ne hívd try/catch-en belül.
 */
export async function requireSession(): Promise<AppSession> {
  const session = await getSession();
  if (!session) redirect('/login');
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
