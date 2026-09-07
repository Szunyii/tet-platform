'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '../../lib/auth';

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
  redirect('/login');
}
