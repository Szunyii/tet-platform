# Login, session és admin felhasználó-kezelés – tervezési spec

Dátum: 2026-09-07
Állapot: jóváhagyva

## Cél

A meglévő Better Auth infrastruktúrára valódi bejelentkezés, route-védelem és
egy admin felhasználó-kezelő kerül. Ez az előfeltétele a riportok specnek
(`2026-09-07-riportok-design.md`), amely a `requireSession()` helpert és a
`user.orszag` mezőt várja el.

## Döntések

| Kérdés | Döntés | Indok |
| --- | --- | --- |
| Fiókok létrehozása | Admin UI (`/felhasznalok`) a Better Auth admin plugin API-jával | A felhasználó kérte; seed csak az első admint hozza létre. |
| Admin UI műveletek | Létrehozás, lista, szerkesztés, jelszó-visszaállítás, tiltás/feloldás, törlés | Mind kész admin-plugin végpont. |
| Route-védelem | `proxy.ts` cookie-ellenőrzés + page/action szintű `requireSession()` | A Better Auth dokumentált mintája; a proxy csak gyors szűrő. |
| Ország a useren | `user.additionalFields.orszag` (string, opcionális) | Attasénál kötelező, adminnál üres; az admin UI kényszeríti ki. |
| Login UI | Külön oldal, AppShell nélkül, kliens `signIn.email` | Egyszerű, a Better Auth kliens ezt adja. |

## Hatókörön kívül

Elfelejtett jelszó e-mailben, önkiszolgáló profilszerkesztés, kétfaktoros
hitelesítés, impersonation, session-lista.

## Fájlok

| Fájl | Felelősség |
| --- | --- |
| `lib/auth.ts` | `user: { additionalFields: { orszag: { type: 'string', required: false, input: true } } }`. Utána `npm run auth:generate` és `npm run db:generate` (új migráció: `user.orszag`). |
| `db/schema/auth.ts` | Regenerált, `orszag` oszloppal. |
| `lib/session.ts` | `getSession()`, `requireSession()`, `requireAdmin()`. Lásd lent. |
| `proxy.ts` | Gyökérben. Cookie-alapú átirányítás. |
| `app/login/page.tsx` | Login oldal (AppShell nélkül). |
| `app/login/components/LoginForm.tsx` | `'use client'`, `signIn.email`. |
| `app/layout.tsx` | Session lekérés szerveren; AppShell csak bejelentkezve, propként kapja a usert. |
| `components/AppShell.tsx` | Dummy szerep-kapcsoló megszűnik; user propból; kijelentkezés; „Felhasználók” menü adminnak. |
| `app/felhasznalok/page.tsx` | `requireAdmin()`, lista. |
| `app/felhasznalok/actions.ts` | Server action-ök a Better Auth admin API-ra. |
| `app/felhasznalok/components/` | `FelhasznaloTabla.tsx`, `UjFelhasznaloDialog.tsx`, `SzerkesztesDialog.tsx`, `JelszoDialog.tsx`, `FelhasznaloMuveletek.tsx` (tiltás/feloldás/törlés `AlertDialog`-gal). |
| `lib/felhasznalo-validacio.ts` | Tiszta validátor az admin űrlapokhoz. |

## `lib/session.ts`

```ts
export type AppSession = {
  userId: string; name: string; email: string;
  role: 'admin' | 'attase'; orszag: string | null;
};
getSession(): Promise<AppSession | null>   // auth.api.getSession({ headers: await headers() })
requireSession(): Promise<AppSession>      // null → redirect('/login')
requireAdmin(): Promise<AppSession>        // role !== 'admin' → notFound()
```

A `role` hiánya (`null`) `attase`-ként értelmezendő. Tiltott (`banned`) usernek
a Better Auth nem ad sessiont, külön kezelés nem kell.

## `proxy.ts`

- Matcher: minden útvonal, kivéve `/login`, `/api/auth/*`, `/_next/*`,
  `favicon.ico`, `tet-world-map.js` és egyéb statikus fájlok.
- Nincs session cookie (`getSessionCookie(request)` a `better-auth/cookies`-ból)
  → `NextResponse.redirect('/login?next=<eredeti path>')`.
- `/login`-on van cookie → redirect `/terkep`.
- Nem ellenőrzi a session érvényességét, csak a cookie meglétét; a bíró a
  `requireSession()`.

## Login oldal

- Középre igazított shadcn `Card`: cím „TéT Platform”, alcím „Bejelentkezés”,
  email `Input`, jelszó `Input`, „Bejelentkezés” `Button`.
- Kliens: `signIn.email({ email, password })`. Siker → `router.push(next ?? '/terkep')`
  és `router.refresh()`. Hiba → egységes magyar üzenet: „Hibás e-mail cím vagy
  jelszó.” (nem különböztetünk); tiltott fiók → „A fiók le van tiltva.”
  (Better Auth `BANNED_USER` hibakód).
- A `next` paramétert csak `/`-rel kezdődő relatív útvonalként fogadja el.
- A `layout.tsx` a `/login` alatt nem rendereli az AppShellt: `getSession()`
  eredménye alapján dönt (nincs session → csak `children`).

## AppShell

- Prop: `user: AppSession`. A `useApp()` `role`-ja ebből jön, a `setRole`
  megszűnik; a `cycle` kapcsoló marad.
- Fejléc: név + szerepkör (admin: „NIÜ admin”, attasé: „TéT attasé · <ország>”),
  „Kijelentkezés” gomb → `signOut()` → `router.push('/login')`.
- `NAV`: `{ href: '/felhasznalok', label: 'Felhasználók', adminOnly: true }`,
  csak adminnak jelenik meg. `TITLES` bővítése.

## Admin felhasználó-kezelő (`/felhasznalok`)

- Lista: `auth.api.listUsers` (limit 200, név szerint) vagy közvetlen Drizzle
  `db/queries/felhasznalo.ts` `listFelhasznalok()` – ez utóbbi, mert az
  `orszag` mezőt és a rendezést egyszerűbben adja.
- Tábla oszlopai: név, email, szerepkör `Badge`, ország, állapot (Aktív /
  Tiltott), létrehozva, műveletek.
- Server action-ök (`app/felhasznalok/actions.ts`), mind `requireAdmin()` után,
  a Better Auth admin API-t hívják `headers: await headers()`-szel, hogy a
  jogosultság-ellenőrzés a pluginban is lefusson:
  - `createFelhasznaloAction`: név, email, jelszó (min 8), szerepkör, ország.
    Attasénál ország kötelező. `auth.api.createUser({ body: { name, email,
    password, role, data: { orszag } } })`.
  - `updateFelhasznaloAction`: név, ország, szerepkör. `auth.api.adminUpdateUser`
    (név, orszag) + `auth.api.setRole` ha változott.
  - `setJelszoAction`: `auth.api.setUserPassword`.
  - `banAction` / `unbanAction`: `auth.api.banUser` / `auth.api.unbanUser`.
  - `removeFelhasznaloAction`: `auth.api.removeUser`.
  - Az admin saját magát nem tilthatja, nem törölheti, saját szerepkörét nem
    veheti el: az action hibát ad („Saját fiókodon ez a művelet nem végezhető.”).
  - Minden action a végén `revalidatePath('/felhasznalok')`; visszatérés
    `{ errors?: Record<string, string> }` az `useActionState`-hez.
- Dialógusok: shadcn `Dialog` űrlapokkal, `AlertDialog` a tiltás/törlés
  megerősítéséhez, `sonner` toast sikernél.
- Validáció `lib/felhasznalo-validacio.ts`-ben: e-mail formátum, jelszó hossz,
  szerepkör az engedett halmazból, ország 1–100 karakter.

## Seed

`scripts/seed.ts` változatlan (első admin, `orszag` nélkül). A `.env.example`
nem változik.

## Hibakezelés

- Login: hálózati/ismeretlen hiba → „Bejelentkezés sikertelen, próbáld újra.”
- Action-ök: Better Auth hiba (`APIError`) → az üzenet magyarítva a gyakori
  kódokra (létező email: „Ezzel az e-mail címmel már van felhasználó.”), egyéb →
  „Művelet sikertelen.” és `console.error`.
- `/felhasznalok` nem adminnak: `notFound()`.

## Ellenőrzés

`npx tsc --noEmit`, `npm run build`, `npm run db:migrate`, `npm run db:seed`.
curl: `POST /api/auth/sign-in/email` jó és rossz jelszóval.
Manuális:

1. Kijelentkezve bármely oldal → `/login?next=...`; belépés után oda kerül vissza.
2. Rossz jelszó → hibaüzenet; jó → `/terkep`, fejlécben név és szerepkör.
3. Attasé: `/felhasznalok` → 404, a menüben nem látszik.
4. Admin: létrehoz attasét országgal; ország nélkül → mezőhiba. Az új attasé
   belép, a fejléc az országot mutatja.
5. Szerkesztés (ország módosítás), jelszó-visszaállítás → új jelszóval belép.
6. Tiltás → a tiltott nem tud belépni, listában „Tiltott”; feloldás után igen.
7. Törlés megerősítéssel; saját fiók tiltása/törlése → hiba.
8. Kijelentkezés → `/login`, a védett oldal újra átirányít.
