import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { admin } from 'better-auth/plugins';
import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements, userAc } from 'better-auth/plugins/admin/access';
import { db } from '../db';
import * as schema from '../db/schema';

// Szerepkörök a Better Auth admin pluginhoz. A roles map nélkül a plugin 'admin' | 'user'
// típust következtet, és az 'attase' nem fordulna le a createUser/setRole hívásokban.
// admin: teljes felhasználó-kezelés; attase: nincs felhasználó-kezelési jog.
const ac = createAccessControl(defaultStatements);
const roles = { admin: adminAc, attase: userAc };

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
      // A poszt országának adatai (csak attasénál) és az attasé elérhetőségei (mindkét
      // szerepkörnél). Ugyanaz az elv: input: false, az admin UI írja.
      fovaros: { type: 'string', required: false, input: false },
      terulet: { type: 'number', required: false, input: false },
      penznem: { type: 'string', required: false, input: false },
      telefon: { type: 'string', required: false, input: false },
      kapcsolatEmail: { type: 'string', required: false, input: false },
    },
  },
  plugins: [
    admin({
      ac,
      roles,
      defaultRole: 'attase',
      adminRoles: ['admin'],
    }),
    // A nextCookies-nak mindig az utolsó pluginnak kell lennie.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
