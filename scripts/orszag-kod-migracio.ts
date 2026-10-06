/**
 * Egyszeri, idempotens adat-átírás: az attase_orszag.orszag_kod, a riport.orszag és a
 * ticket.orszag szabadszöveges országneveit ISO-kódra cseréli a lib/orszagok.ts szótár
 * alapján. Ami már kód, azt kihagyja; a nem párosíthatót kilistázza és érintetlenül hagyja.
 * (A riport és a ticket updated_at-ja az $onUpdate miatt frissül – elfogadható.)
 *
 * Csak a 0006/0007 migráció után futtatható (előtte nincs attase_orszag tábla). Az
 * attase_orszag soraira a kimenet külön listázza az ütközőket (pl. a felhasználónak már van
 * sora a cél-kóddal; a sor érintetlen, kézi rendezés kell), és kiírja, ha egy átírt sor
 * vezető-jelölését le kellett venni, mert a cél-országnak már van vezetője. Csak a constraint-
 * hiba számít ütközésnek; bármilyen más hiba (SQLITE_BUSY, READONLY, …) megszakítja a futást.
 *
 * Nem hozza vissza a főváros/terület/pénznem régi értékét: ha egy attasé országa a 0006
 * idején még nem kód, hanem név volt, a 0006 (ami csak kódra párosított) az adatát nem
 * másolta az országprofil Alapadatok blokkjába, a 0007 pedig törölte a forrás-oszlopokat.
 * Futtatás: npx tsx scripts/orszag-kod-migracio.ts
 */
import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { attaseOrszag, riport, ticket, user } from '../db/schema';
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
const utkozes: string[] = [];

// `regi` a tárolt érték, `kod` az új.
const sorok = db
  .select({ userId: attaseOrszag.userId, email: user.email, regi: attaseOrszag.orszagKod, vezeto: attaseOrszag.vezeto })
  .from(attaseOrszag)
  .innerJoin(user, eq(user.id, attaseOrszag.userId))
  .all();
for (const a of sorok) {
  const kod = kodra(a.regi);
  if (kod === null) continue;
  const ki = `${a.email} (${a.userId})`;
  if (!kod) {
    parositatlan.push(`attase_orszag ${ki}: "${a.regi}"`);
    continue;
  }
  // A 0006 a régi név „ál-országának” egyetlen sorát vezetővé tette; ha a cél-országnak már van
  // vezetője, ez a sor nem maradhat az (országonként legfeljebb egy – részleges egyedi index).
  const masikVezeto = a.vezeto
    ? db
        .select({ userId: attaseOrszag.userId })
        .from(attaseOrszag)
        .where(and(eq(attaseOrszag.orszagKod, kod), eq(attaseOrszag.vezeto, true)))
        .get()
    : undefined;
  try {
    db.update(attaseOrszag)
      .set({ orszagKod: kod, vezeto: a.vezeto && !masikVezeto })
      .where(and(eq(attaseOrszag.userId, a.userId), eq(attaseOrszag.orszagKod, a.regi)))
      .run();
  } catch (err) {
    // Csak a constraint-hiba ütközés (pl. a felhasználónak már van sora ezzel a kóddal): kézi
    // rendezés kell. Minden más hiba (SQLITE_BUSY, READONLY, …) megszakítja a futást.
    if (!(err instanceof Error && 'code' in err && String(err.code).startsWith('SQLITE_CONSTRAINT'))) throw err;
    utkozes.push(`attase_orszag ${ki}: "${a.regi}" → ${kod} (ütközés: ${err.message})`);
    continue;
  }
  atirt++;
  if (masikVezeto) {
    console.log(`attase_orszag ${ki}: "${a.regi}" → ${kod} (vezető-jelölés levéve: az országnak már van vezetője)`);
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
console.log(`Átírva: ${atirt} sor. Párosítatlan: ${parositatlan.length}. Ütközés: ${utkozes.length}.`);
if (parositatlan.length > 0) {
  console.log('Párosítatlan (nincs ilyen ország a szótárban; a sor érintetlen):');
  for (const p of parositatlan) console.log('  ' + p);
}
if (utkozes.length > 0) {
  console.log('Ütközés (kézi rendezés kell; a sor érintetlen):');
  for (const u of utkozes) console.log('  ' + u);
}
