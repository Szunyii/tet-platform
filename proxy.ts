import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';

// Gyors szűrő: csak a session cookie meglétét nézi, nem az érvényességét.
// A valódi ellenőrzés a page-ek/action-ök requireSession() hívása.
//
// A /login-t a matcher kizárja, és a proxy szándékosan NEM irányít el onnan cookie
// esetén: egy elavult cookie (tiltott/törölt user, lejárt session) RSC renderben nem
// törölhető, így a "cookie van → /terkep" szabály és a requireSession() /login
// redirectje végtelen hurkot adna. A bejelentkezett user /login-ról való
// elirányítását az app/login/page.tsx végzi a valódi session alapján.
//
// Nem GET kérést (server action POST) átengedünk: a 307 a POST-ot is a login oldalra
// irányítaná, ami hibát ad; az action saját requireSession()-je szabályosan redirectel.
// Ez azt is jelenti, hogy cookie nélkül is pufferelődik a body a proxyClientMaxBodySize-ig
// (50 MB), ezért éles környezetben a reverse proxyn is legyen client_max_body_size.
//
// A getSessionCookie() a Better Auth alapértelmezett cookie-nevét keresi
// (better-auth.session_token, HTTPS-en __Secure- prefixszel). Ha a lib/auth.ts
// advanced.cookiePrefix / advanced.cookies beállítást kapna, azt ide is át kell adni,
// különben minden kérés a loginra megy.

// A ?next= hossza korlátozott, hogy a Location fejléc ne nőjön proxy-limit fölé.
const NEXT_MAX_LENGTH = 512;

export function proxy(request: NextRequest) {
  if (request.method !== 'GET') return NextResponse.next();
  if (getSessionCookie(request)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const login = new URL('/login', request.url);
  const next = pathname + search;
  if (next.length <= NEXT_MAX_LENGTH) login.searchParams.set('next', next);
  return NextResponse.redirect(login);
}

export const config = {
  // Minden útvonal, kivéve: /login (és alútjai), /api/auth/*, /_next/*, és a
  // kiterjesztés alapján felismert statikus fájlok (public/, metadata route-ok).
  matcher: [
    '/((?!login(?:/|$)|api/auth(?:/|$)|_next/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|txt|xml|webmanifest)$).*)',
  ],
};
