'use server';

import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '../../lib/auth';
import { aktualisEv } from '../../lib/datum';
import { orszagByKod } from '../../lib/orszagok';
import { LOGIN_ROUTE } from '../../lib/routes';
import { requireSession } from '../../lib/session';
import { mezo } from '../../lib/urlap';
import { ervenyesValasztottEv, EV_COOKIE, parseEv } from '../../lib/valasztott-ev';

export interface LogoutState {
  error?: string;
}

// Kijelentkezés server actionként (CLAUDE.md: mutáció → actions.ts). A nextCookies plugin
// itt tudja törölni a session cookie-t; a revalidatePath('/', 'layout') a teljes
// kliens-oldali router cache-t üríti, így a vissza gomb sem mutatja a korábbi session
// oldalait. A signOut session nélkül is sikeres, csak valódi hibánál (pl. DB) dob.
export async function logoutAction(_prev: LogoutState): Promise<LogoutState> {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (err) {
    console.error('[auth] kijelentkezés sikertelen:', err);
    return { error: 'Nem sikerült kijelentkezni. Próbáld újra.' };
  }
  revalidatePath('/', 'layout');
  redirect(LOGIN_ROUTE);
}

/**
 * A fejléc ciklusválasztója: a választott évet httpOnly cookie-ba írja, és a layoutot
 * revalidálja, így a térkép, a profil és a szerkesztő oldal az új évre renderelődik.
 * Érvénytelen év (nem négyjegyű, EV_MIN alatt vagy az aktuális év felett) → nem ír semmit.
 * Opcionális `kod` mezővel az ország szerkesztőjére irányít (a „Szerkesztés (2026)" gomb:
 * attasé múltbeli évnézetből egy lépésben az aktuális évre vált és szerkeszt).
 * A redirect() kivétellel működik: a try/catch-en kívül hívjuk.
 */
export async function valasztEvAction(formData: FormData): Promise<void> {
  await requireSession();
  const most = aktualisEv();
  const ev = parseEv(mezo(formData, 'ev'));
  if (!ervenyesValasztottEv(ev, most)) return;
  (await cookies()).set(EV_COOKIE, String(ev), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === 'production',
  });
  revalidatePath('/', 'layout');
  const kod = mezo(formData, 'kod');
  if (kod && orszagByKod(kod)) redirect(`/orszagprofil/${kod}/szerkesztes`);
}
