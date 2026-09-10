/**
 * Egyszeri, idempotens adat-átírás: a user.orszag és a riport.orszag szabadszöveges
 * országneveit ISO-kódra cseréli a lib/orszagok.ts szótár alapján. Ami már kód, azt
 * kihagyja; a nem párosíthatót kilistázza és érintetlenül hagyja.
 * Futtatás: npx tsx scripts/orszag-kod-migracio.ts
 */
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { riport, user } from '../db/schema';
import { ORSZAGOK, ORSZAG_KOD_RE, orszagByKod } from '../lib/orszagok';

const ALIAS: Record<string, string> = {
  'dél-korea': 'KR',
  'dél korea': 'KR',
  'egyesült államok': 'US',
  'usa': 'US',
  'nagy-britannia': 'GB',
  'anglia': 'GB',
  'csehország': 'CZ',
  'észak-macedónia': 'MK',
};

function norm(s: string): string {
  return s.trim().replace(/\s+/g, ' ').toLocaleLowerCase('hu');
}
const NEV_INDEX = new Map(ORSZAGOK.map((o) => [norm(o.nev), o.kod]));

/** `null` = már érvényes kód (kihagyjuk), `undefined` = párosítatlan, string = az új kód. */
function kodra(ertek: string): string | null | undefined {
  if (ORSZAG_KOD_RE.test(ertek) && orszagByKod(ertek)) return null;
  const n = norm(ertek);
  return NEV_INDEX.get(n) ?? ALIAS[n];
}

let atirt = 0;
const parositatlan: string[] = [];

for (const u of db.select({ id: user.id, orszag: user.orszag }).from(user).all()) {
  if (!u.orszag) continue;
  const kod = kodra(u.orszag);
  if (kod === null) continue;
  if (!kod) {
    parositatlan.push(`user ${u.id}: "${u.orszag}"`);
    continue;
  }
  db.update(user).set({ orszag: kod }).where(eq(user.id, u.id)).run();
  atirt++;
}
for (const r of db.select({ id: riport.id, orszag: riport.orszag }).from(riport).all()) {
  const kod = kodra(r.orszag);
  if (kod === null) continue;
  if (!kod) {
    parositatlan.push(`riport ${r.id}: "${r.orszag}"`);
    continue;
  }
  db.update(riport).set({ orszag: kod }).where(eq(riport.id, r.id)).run();
  atirt++;
}
console.log(`Átírva: ${atirt} sor. Párosítatlan: ${parositatlan.length}`);
for (const p of parositatlan) console.log('  ' + p);
