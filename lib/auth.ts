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

// Az app publikus címe nem fix: ugyanaz a build fut lokálisan, az ideiglenes hosting
// domainen és később a végleges címen. Ezért a baseURL dinamikus: a Better Auth a kérés
// Host fejlécéből (proxy mögött x-forwarded-host/proto) állítja elő, de csak az itt
// felsorolt hosztokra – idegen Host fejléc esetén 403 INVALID_ORIGIN. A lista a
// BETTER_AUTH_ALLOWED_HOSTS env-ből jön (vesszővel elválasztva, wildcard megengedett,
// pl. `tet.niu.hu,*.hostingersite.com`), és a BETTER_AUTH_URL hosztja mindig benne van.
// A BETTER_AUTH_URL marad a fallback olyan hívásokhoz, ahol nincs kérés (pl. seed, CLI).
function engedelyezettHostok(): string[] {
  const hostok = (process.env.BETTER_AUTH_ALLOWED_HOSTS ?? '')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean);
  const alapUrl = process.env.BETTER_AUTH_URL;
  if (alapUrl) {
    try {
      hostok.push(new URL(alapUrl).host);
    } catch {
      // Hibás BETTER_AUTH_URL: a Better Auth maga is panaszkodni fog rá.
    }
  }
  return hostok.length > 0 ? hostok : ['localhost:3000'];
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'sqlite', schema }),
  baseURL: {
    allowedHosts: engedelyezettHostok(),
    fallback: process.env.BETTER_AUTH_URL,
    // auto: x-forwarded-proto (ha trustedProxyHeaders), különben a kérés URL-jének sémája.
    protocol: 'auto',
  },
  advanced: {
    // Reverse proxy (Hostinger, nginx) mögött a Node az x-forwarded-host/proto fejlécből
    // tudja a publikus hosztot és a HTTPS-t. Az allowedHosts lista korlátozza, mit fogadunk el.
    trustedProxyHeaders: true,
  },
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
