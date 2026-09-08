// Központi útvonal-konstansok. A NAV táblázat (components/AppShell.tsx) a menüé,
// ez a kód által használt fix célpontoké.
export const HOME_ROUTE = '/terkep';
export const LOGIN_ROUTE = '/login';

// A ?next= hossza korlátozott, hogy a Location fejléc ne nőjön proxy-limit fölé.
export const NEXT_MAX_LENGTH = 512;

/** Login URL a cél útvonallal (?next=). Csak belső, abszolút útvonal mehet át: nem protokoll-relatív (//), nem backslash, nem túl hosszú. */
export function loginUtvonal(cel: string | null | undefined): string {
  if (!cel || !cel.startsWith('/') || cel.startsWith('//') || cel.startsWith('/\\')) return LOGIN_ROUTE;
  if (cel.length > NEXT_MAX_LENGTH) return LOGIN_ROUTE;
  return `${LOGIN_ROUTE}?next=${encodeURIComponent(cel)}`;
}
