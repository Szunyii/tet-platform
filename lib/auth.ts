import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins';
import { db } from '../db';
import * as schema from '../db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'sqlite', schema }),
  emailAndPassword: {
    enabled: true,
    // Belső rendszer: nincs nyilvános regisztráció. Felhasználót seed vagy admin hoz létre.
    disableSignUp: true,
  },
  user: {
    additionalFields: {
      // TéT attasé posztjának országa. Adminnál üres. Csak az admin API írhatja (input: false),
      // a felhasználó saját maga nem módosíthatja az /update-user végponton.
      orszag: { type: 'string', required: false, input: false },
    },
  },
  plugins: [
    admin({
      defaultRole: 'attase',
      adminRoles: ['admin'],
    }),
    // A nextCookies-nak mindig az utolsó pluginnak kell lennie.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
