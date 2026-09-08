import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';
import { loginUtvonal } from './lib/routes';

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

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const cel = pathname + search;
  // A page-ek requireSession()-je ebből tudja, hova térjen vissza a login után (?next=).
  // Minden matcher-elt kérésen felülírjuk, hogy a kliens ne tudja hamisítani; a matcher
  // által kizárt útvonalakon (statikus kiterjesztés, /login, /api/auth) nem fut a proxy,
  // ott a loginUtvonal() validációja a védelem.
  const reqHeaders = new Headers(request.headers);
  reqHeaders.set('x-pathname', cel);
  const next = NextResponse.next({ request: { headers: reqHeaders } });

  if (request.method !== 'GET') return next;
  if (getSessionCookie(request)) return next;

  return NextResponse.redirect(new URL(loginUtvonal(cel), request.url));
}

export const config = {
  // Minden útvonal, kivéve: /login (és alútjai), /api/auth/*, /_next/*, és a
  // kiterjesztés alapján felismert statikus fájlok (public/, metadata route-ok).
  matcher: [
    '/((?!login(?:/|$)|api/auth(?:/|$)|_next/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|txt|xml|webmanifest)$).*)',
  ],
};
