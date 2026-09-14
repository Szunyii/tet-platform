import 'server-only';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { EV_MIN } from './orszagprofil-szotar';

// Next-függő szerver-oldali segéd (mint a lib/session.ts): a CLAUDE.md lib/ szabályának tudatos kivétele.

/** A fejlécben választott ciklus (év) cookie-ja. httpOnly: csak a szerver olvassa és írja (valasztEvAction). */
export const EV_COOKIE = 'tet-ev';

/** Érvényes-e a választott év: négyjegyű egész EV_MIN és `most` között. */
export function ervenyesValasztottEv(ev: number, most: number): boolean {
  return Number.isInteger(ev) && ev >= EV_MIN && ev <= most;
}

/**
 * A választott év a cookie-ból; hiányzó vagy érvénytelen érték esetén az aktuális év.
 * React.cache: egy kérésen belül (layout + page) egyszer olvas.
 */
export const getValasztottEv = cache(async (most: number): Promise<number> => {
  const raw = (await cookies()).get(EV_COOKIE)?.value;
  const ev = raw && /^\d{4}$/.test(raw) ? Number(raw) : NaN;
  return ervenyesValasztottEv(ev, most) ? ev : most;
});
