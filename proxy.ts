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
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const login = new URL('/login', request.url);
  login.searchParams.set('next', pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  // Minden útvonal, kivéve: /login, auth API, Next belső fájlok, statikus asset-ek.
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon\\.ico|tet-world-map\\.js).*)'],
};
