import 'server-only';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { auth } from './auth';
import { LOGIN_ROUTE } from './routes';

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
 * Page-ek és action-ök bejelentkezés-ellenőrzése. Hiány esetén /login, a cél útvonallal
 * (?next=), amit a proxy x-pathname fejlécként ad át (elavult cookie-val a proxy átenged,
 * de a session már nincs meg – így sem vész el a mélylink).
 * A redirect() kivétellel működik: mindig await-eld, és soha ne hívd try/catch-en belül.
 */
export async function requireSession(): Promise<AppSession> {
  const session = await getSession();
  if (!session) {
    const cel = (await headers()).get('x-pathname');
    redirect(cel && cel.startsWith('/') ? `${LOGIN_ROUTE}?next=${encodeURIComponent(cel)}` : LOGIN_ROUTE);
  }
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
