import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

// Böngészőben használandó kliens. A baseURL alapból az aktuális origin,
// ezért lokálisan nem kell megadni.
export const authClient = createAuthClient({
  plugins: [adminClient()],
});

// Kijelentkezés szándékosan nincs itt: az app/(app)/actions.ts logoutAction server action
// végzi (cookie törlés + teljes kliens-cache ürítés), a kliens signOut() erre nem alkalmas.
export const { signIn, useSession } = authClient;
