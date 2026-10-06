/**
 * Egyszeri, idempotens adat-átírás: az attase_orszag.orszag_kod, a riport.orszag és a
 * ticket.orszag szabadszöveges országneveit ISO-kódra cseréli a lib/orszagok.ts szótár
 * alapján. Ami már kód, azt kihagyja; a nem párosíthatót kilistázza és érintetlenül hagyja.
 * (A riport és a ticket updated_at-ja az $onUpdate miatt frissül – elfogadható.)
 * Futtatás: npx tsx scripts/orszag-kod-migracio.ts
 */
import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { attaseOrszag, riport, ticket } from '../db/schema';
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

for (const a of db
  .select({ userId: attaseOrszag.userId, kod: attaseOrszag.orszagKod, vezeto: attaseOrszag.vezeto })
  .from(attaseOrszag)
  .all()) {
  const kod = kodra(a.kod);
  if (kod === null) continue;
  if (!kod) {
    parositatlan.push(`attase_orszag ${a.userId}: "${a.kod}"`);
    continue;
  }
  // A 0006 a régi név „ál-országának” egyetlen sorát vezetővé tette; ha a cél-országnak már van
  // vezetője, ez a sor nem maradhat az (országonként legfeljebb egy – részleges egyedi index).
  const masikVezeto = db
    .select({ userId: attaseOrszag.userId })
    .from(attaseOrszag)
    .where(and(eq(attaseOrszag.orszagKod, kod), eq(attaseOrszag.vezeto, true)))
    .get();
  try {
    db.update(attaseOrszag)
      .set({ orszagKod: kod, ...(a.vezeto && masikVezeto ? { vezeto: false } : {}) })
      .where(and(eq(attaseOrszag.userId, a.userId), eq(attaseOrszag.orszagKod, a.kod)))
      .run();
    atirt++;
  } catch {
    // Ütközés (pl. a felhasználónak már van sora ezzel a kóddal): kézi rendezés kell.
    parositatlan.push(`attase_orszag ${a.userId}: "${a.kod}" → ${kod} (ütközés)`);
  }
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
for (const t of db.select({ id: ticket.id, orszag: ticket.orszag }).from(ticket).all()) {
  const kod = kodra(t.orszag);
  if (kod === null) continue;
  if (!kod) {
    parositatlan.push(`ticket ${t.id}: "${t.orszag}"`);
    continue;
  }
  db.update(ticket).set({ orszag: kod }).where(eq(ticket.id, t.id)).run();
  atirt++;
}
console.log(`Átírva: ${atirt} sor. Párosítatlan: ${parositatlan.length}`);
for (const p of parositatlan) console.log('  ' + p);
