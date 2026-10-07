/**
 * Demó attasék (a NIÜ TéT-hálózat valós példái) a data/tet.db-be. Idempotens:
 * 1. a két régi tesztfiókot (teszt.attase@niu.hu, masodik.attase@niu.hu) törli, ha létezik –
 *    FK cascade: a riportjaik, a nekik címzett ticketek és az olvasás-jelöléseik is; az általuk
 *    írt országprofil-blokkok szerzője null lesz;
 * 2. a hiányzó attasékat létrehozza (közvetlen insert, mint a scripts/seed.ts: a Better Auth
 *    admin API admin sessiont kérne); a meglévőkhöz (e-mail szerint) nem nyúl, jelszavuk sem változik;
 * 3. mindegyik hozzárendelését beállítja a setAttaseOrszagok-kal (a kijelölt vezetők átveszik a
 *    vezetőséget, a többit a normalizálás adja).
 * Az e-mail címek helykitöltők (vezeteknev.keresztnev@niu.hu, ékezet és „dr.” nélkül). A jelszó a
 * DEMO_ATTASE_PASSWORD környezeti változóból jön (a .env.example dokumentálja).
 *
 * Futtatás: DEMO_ATTASE_PASSWORD=… NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-attasek.ts
 */
import { hashPassword } from 'better-auth/crypto';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../db';
import { account, user } from '../db/schema';
import { setAttaseOrszagok } from '../db/queries/attase-orszag';
import type { AttaseOrszag } from '../lib/attase-orszag';

interface DemoAttase {
  nev: string;
  email: string;
  szekhely: string;
  varos: string;
  reszterulet?: string;
  /** Kijelölt relációs vezető a székhely-országban (több attasés országnál). */
  vezeto?: boolean;
  regio?: string[];
}

const ATTASEK: DemoAttase[] = [
  {
    nev: 'Kindert Judit', email: 'kindert.judit@niu.hu', szekhely: 'DE', varos: 'Berlin', vezeto: true,
    reszterulet: 'Berlin, Brandenburg, Bremen, Hamburg, Niedersachsen, Mecklenburg-Vorpommern, Thüringen, Sachsen-Anhalt, Sachsen, Schleswig-Holstein',
  },
  {
    nev: 'Komma Krisztián', email: 'komma.krisztian@niu.hu', szekhely: 'DE', varos: 'Stuttgart',
    reszterulet: 'Baden-Württemberg, Észak-Rajna-Vesztfália, Rheinland-Pfalz, Saarland, Hessen',
  },
  { nev: 'dr. Gurza László', email: 'gurza.laszlo@niu.hu', szekhely: 'DE', varos: 'München', reszterulet: 'Bajorország' },
  { nev: 'Jávori Balázs', email: 'javori.balazs@niu.hu', szekhely: 'AT', varos: 'Bécs' },
  { nev: 'Balogh András Zoltán', email: 'balogh.andras@niu.hu', szekhely: 'GB', varos: 'London', regio: ['IE'] },
  { nev: 'Szántó Szilvia', email: 'szanto.szilvia@niu.hu', szekhely: 'FR', varos: 'Párizs', regio: ['DZ', 'MA', 'MR', 'TN'] },
  { nev: 'Hoffmann Mária', email: 'hoffmann.maria@niu.hu', szekhely: 'IL', varos: 'Tel-Aviv' },
  { nev: 'Márfi András', email: 'marfi.andras@niu.hu', szekhely: 'RU', varos: 'Moszkva' },
  { nev: 'Ferencz Csanád', email: 'ferencz.csanad@niu.hu', szekhely: 'JP', varos: 'Tokió' },
  { nev: 'Hosszú Hortenzia', email: 'hosszu.hortenzia@niu.hu', szekhely: 'KR', varos: 'Szöul', regio: ['KP'] },
  { nev: 'Siklós Lili', email: 'siklos.lili@niu.hu', szekhely: 'CN', varos: 'Peking' },
  {
    nev: 'dr. Nagy Gabriella', email: 'nagy.gabriella@niu.hu', szekhely: 'US', varos: 'New York', vezeto: true,
    regio: ['CA', 'PR', 'VI'],
    reszterulet: 'Alabama, Arkansas, District of Columbia, Florida, Georgia, Kentucky, Louisiana, Maryland, Mississippi, '
      + 'West Virginia, Észak-Karolina, Dél-Karolina, Ohio, Pennsylvania, Virginia, Connecticut, Delaware, Maine, '
      + 'New Hampshire, New Jersey, New York, Rhode Island, Vermont, Illinois, Indiana, Iowa, Michigan, Minnesota, '
      + 'Missouri, Tennessee, Wisconsin',
  },
  {
    nev: 'Mészáros Eleonóra', email: 'meszaros.eleonora@niu.hu', szekhely: 'US', varos: 'San Francisco',
    reszterulet: 'Alaszka, Arizona, Colorado, Dél-Dakota, Észak-Dakota, Guam, Hawaii, Idaho, Kalifornia, Kansas, '
      + 'Montana, Nebraska, Nevada, Oklahoma, Oregon, Texas, Új-Mexikó, Utah, Washington, Wyoming',
  },
  { nev: 'Morován Júlia', email: 'morovan.julia@niu.hu', szekhely: 'BR', varos: 'Sao Paulo', regio: ['GY', 'SR'] },
  { nev: 'Daczi Diána', email: 'daczi.diana@niu.hu', szekhely: 'IN', varos: 'Új-Delhi', regio: ['BD', 'MV', 'NP', 'LK'] },
];

const REGI_TESZTFIOKOK = ['teszt.attase@niu.hu', 'masodik.attase@niu.hu'];

async function main() {
  const jelszo = process.env.DEMO_ATTASE_PASSWORD;
  if (!jelszo || jelszo.length < 8) {
    console.error('Hiányzó vagy 8 karakternél rövidebb DEMO_ATTASE_PASSWORD (lásd .env.example).');
    process.exit(1);
  }

  const toroltek = db.delete(user).where(inArray(user.email, REGI_TESZTFIOKOK)).returning({ email: user.email }).all();
  for (const t of toroltek) console.log(`Tesztfiók törölve: ${t.email}`);

  for (const a of ATTASEK) {
    let userId = db.select({ id: user.id }).from(user).where(eq(user.email, a.email)).get()?.id;
    if (!userId) {
      const id = crypto.randomUUID();
      const passwordHash = await hashPassword(jelszo);
      const now = new Date();
      // A providerId 'credential' és accountId = userId a Better Auth email+jelszó konvenciója (mint a seed).
      db.transaction((tx) => {
        tx.insert(user)
          .values({ id, name: a.nev, email: a.email, emailVerified: true, role: 'attase', createdAt: now, updatedAt: now })
          .run();
        tx.insert(account)
          .values({
            id: crypto.randomUUID(), userId: id, accountId: id, providerId: 'credential', password: passwordHash,
            createdAt: now, updatedAt: now,
          })
          .run();
      });
      userId = id;
      console.log(`Létrehozva: ${a.nev} <${a.email}>`);
    }
    const sorok: AttaseOrszag[] = [
      { kod: a.szekhely, szekhely: true, vezeto: a.vezeto ?? false, varos: a.varos, reszterulet: a.reszterulet ?? null },
      ...(a.regio ?? []).map((kod) => ({ kod, szekhely: false, vezeto: false, varos: null, reszterulet: null })),
    ];
    setAttaseOrszagok(userId, sorok);
  }
  console.log(`Kész: ${ATTASEK.length} demó attasé hozzárendelése beállítva.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
