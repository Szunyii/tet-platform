import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

// Böngészőben használandó kliens. A baseURL alapból az aktuális origin,
// ezért lokálisan nem kell megadni.
export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export const { signIn, signOut, useSession } = authClient;
