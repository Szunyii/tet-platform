/**
 * Demó attasék (a NIÜ TéT-hálózat valós példái) a data/tet.db-be. Idempotens. Minden írás előtt
 * ellenőrzi a listát és a jelszót (hiba esetén egyetlen hibalistával, írás nélkül lép ki), utána:
 * 1. a két régi tesztfiókot (teszt.attase@niu.hu, masodik.attase@niu.hu) törli, ha létezik –
 *    FK cascade: a riportjaik, a nekik címzett ticketek és az olvasás-jelöléseik is; az általuk
 *    írt országprofil-blokkok szerzője null lesz;
 * 2. a hiányzó attasékat létrehozza (közvetlen insert, mint a scripts/seed.ts: a Better Auth
 *    admin API admin sessiont kérne). Meglévő fióknál (e-mail szerint) a név és a jelszó nem
 *    változik, a hozzárendelés viszont a lista szerintire áll vissza. Ha a meglévő fiók nem
 *    attasé szerepkörű (pl. admin) vagy tiltott, a script figyelmeztet, és kihagyja: a
 *    hozzárendelését nem állítja be (az admin ott maradt sorait a normalizálás úgyis törli);
 * 3. mindegyik hozzárendelését beállítja a setAttaseOrszagok-kal (a kijelölt vezetők átveszik a
 *    vezetőséget, a többit a normalizálás adja).
 * Az e-mail címek kitalált domainre (demo.test) mutatnak: vezeteknev.keresztnev@demo.test, ékezet
 * és „dr.” nélkül. A jelszó a DEMO_ATTASE_PASSWORD környezeti változóból jön (a .env.example
 * dokumentálja).
 *
 * Futtatás: DEMO_ATTASE_PASSWORD=… NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-attasek.ts
 */
import { hashPassword } from 'better-auth/crypto';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../db';
import { account, user } from '../db/schema';
import { setAttaseOrszagok } from '../db/queries/attase-orszag';
import { REGIO_MAX, RESZTERULET_MAX, VAROS_MAX, type AttaseOrszag } from '../lib/attase-orszag';
import { tiltottE } from '../lib/felhasznalo-tiltas';
import { orszagByKod } from '../lib/orszagok';

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
    nev: 'Kindert Judit', email: 'kindert.judit@demo.test', szekhely: 'DE', varos: 'Berlin', vezeto: true,
    reszterulet: 'Berlin, Brandenburg, Bremen, Hamburg, Niedersachsen, Mecklenburg-Vorpommern, Thüringen, Sachsen-Anhalt, Sachsen, Schleswig-Holstein',
  },
  {
    nev: 'Komma Krisztián', email: 'komma.krisztian@demo.test', szekhely: 'DE', varos: 'Stuttgart',
    reszterulet: 'Baden-Württemberg, Észak-Rajna-Vesztfália, Rheinland-Pfalz, Saarland, Hessen',
  },
  { nev: 'dr. Gurza László', email: 'gurza.laszlo@demo.test', szekhely: 'DE', varos: 'München', reszterulet: 'Bajorország' },
  { nev: 'Jávori Balázs', email: 'javori.balazs@demo.test', szekhely: 'AT', varos: 'Bécs' },
  { nev: 'Balogh András Zoltán', email: 'balogh.andras@demo.test', szekhely: 'GB', varos: 'London', regio: ['IE'] },
  { nev: 'Szántó Szilvia', email: 'szanto.szilvia@demo.test', szekhely: 'FR', varos: 'Párizs', regio: ['DZ', 'MA', 'MR', 'TN'] },
  { nev: 'Hoffmann Mária', email: 'hoffmann.maria@demo.test', szekhely: 'IL', varos: 'Tel-Aviv' },
  { nev: 'Márfi András', email: 'marfi.andras@demo.test', szekhely: 'RU', varos: 'Moszkva' },
  { nev: 'Ferencz Csanád', email: 'ferencz.csanad@demo.test', szekhely: 'JP', varos: 'Tokió' },
  { nev: 'Hosszú Hortenzia', email: 'hosszu.hortenzia@demo.test', szekhely: 'KR', varos: 'Szöul', regio: ['KP'] },
  { nev: 'Siklós Lili', email: 'siklos.lili@demo.test', szekhely: 'CN', varos: 'Peking' },
  {
    nev: 'dr. Nagy Gabriella', email: 'nagy.gabriella@demo.test', szekhely: 'US', varos: 'New York', vezeto: true,
    regio: ['CA', 'PR', 'VI'],
    reszterulet: 'Alabama, Arkansas, District of Columbia, Florida, Georgia, Kentucky, Louisiana, Maryland, Mississippi, '
      + 'West Virginia, Észak-Karolina, Dél-Karolina, Ohio, Pennsylvania, Virginia, Connecticut, Delaware, Maine, '
      + 'New Hampshire, New Jersey, New York, Rhode Island, Vermont, Illinois, Indiana, Iowa, Michigan, Minnesota, '
      + 'Missouri, Tennessee, Wisconsin',
  },
  {
    nev: 'Mészáros Eleonóra', email: 'meszaros.eleonora@demo.test', szekhely: 'US', varos: 'San Francisco',
    reszterulet: 'Alaszka, Arizona, Colorado, Dél-Dakota, Észak-Dakota, Guam, Hawaii, Idaho, Kalifornia, Kansas, '
      + 'Montana, Nebraska, Nevada, Oklahoma, Oregon, Texas, Új-Mexikó, Utah, Washington, Wyoming',
  },
  { nev: 'Morován Júlia', email: 'morovan.julia@demo.test', szekhely: 'BR', varos: 'Sao Paulo', regio: ['GY', 'SR'] },
  { nev: 'Daczi Diána', email: 'daczi.diana@demo.test', szekhely: 'IN', varos: 'Új-Delhi', regio: ['BD', 'MV', 'NP', 'LK'] },
];

const REGI_TESZTFIOKOK = ['teszt.attase@niu.hu', 'masodik.attase@niu.hu'];

// A felület jelszó-szabálya (lib/felhasznalo-validacio.ts, validJelszo).
const JELSZO_MIN = 8;
const JELSZO_MAX = 128;

/**
 * Írás előtti ellenőrzés: a lista és a jelszó hibái egyben (üres = rendben). A jelszó értékét
 * sosem írja ki. Az e-mailek a hívó által már normalizáltak (trim + kisbetű).
 */
function ellenoriz(attasek: readonly DemoAttase[], jelszo: string): string[] {
  const hibak: string[] = [];
  if (jelszo.length < JELSZO_MIN || jelszo.length > JELSZO_MAX) {
    hibak.push(`DEMO_ATTASE_PASSWORD: hiányzik, vagy nem ${JELSZO_MIN}–${JELSZO_MAX} karakter hosszú (lásd .env.example).`);
  }
  const emailek = new Set<string>();
  // Székhely-ország → az első kijelölt vezető neve (országonként legfeljebb egy lehet).
  const vezetok = new Map<string, string>();
  for (const a of attasek) {
    const hiba = (uzenet: string) => hibak.push(`${a.nev} <${a.email}>: ${uzenet}`);
    if (emailek.has(a.email)) hiba('az e-mail cím már szerepel a listán.');
    emailek.add(a.email);
    if (!orszagByKod(a.szekhely)) hiba(`ismeretlen székhely-országkód: ${a.szekhely}.`);
    if (a.varos.length > VAROS_MAX) hiba(`a város ${a.varos.length} karakter, legfeljebb ${VAROS_MAX} lehet.`);
    if (a.reszterulet && a.reszterulet.length > RESZTERULET_MAX) {
      hiba(`a részterület ${a.reszterulet.length} karakter, legfeljebb ${RESZTERULET_MAX} lehet.`);
    }
    const regiok = a.regio ?? [];
    if (regiok.length > REGIO_MAX) hiba(`${regiok.length} régiós ország, legfeljebb ${REGIO_MAX} lehet.`);
    regiok.forEach((kod, i) => {
      if (!orszagByKod(kod)) hiba(`ismeretlen régiós országkód: ${kod}.`);
      if (kod === a.szekhely) hiba(`a székhely (${kod}) a régiók között is szerepel.`);
      else if (regiok.indexOf(kod) !== i) hiba(`a régió (${kod}) ismétlődik.`);
    });
    if (a.vezeto) {
      const elozo = vezetok.get(a.szekhely);
      if (elozo) hiba(`${a.szekhely}: már ${elozo} a kijelölt vezető, országonként legfeljebb egy lehet.`);
      else vezetok.set(a.szekhely, a.nev);
    }
  }
  return hibak;
}

async function main() {
  // A seed.ts mintájára trim + kisbetű (a literálok már azok, ez csak védelem).
  const attasek = ATTASEK.map((a) => ({ ...a, email: a.email.trim().toLowerCase() }));
  const jelszo = process.env.DEMO_ATTASE_PASSWORD ?? '';

  const hibak = ellenoriz(attasek, jelszo);
  if (hibak.length > 0) {
    console.error(`A demó attasék ellenőrzése sikertelen (${hibak.length} hiba), nem történt írás:`);
    for (const h of hibak) console.error(`  - ${h}`);
    process.exit(1);
  }

  // A törlés után nem kell külön normalizalVezetok(): minden setAttaseOrszagok hívás globálisan
  // (minden országra) normalizál, a törölt fiókok miatt vezető nélkül maradt országokat is.
  const toroltek = db.delete(user).where(inArray(user.email, REGI_TESZTFIOKOK)).returning({ email: user.email }).all();
  for (const t of toroltek) console.log(`Tesztfiók törölve: ${t.email}`);

  let beallitva = 0;
  let kihagyva = 0;
  for (const a of attasek) {
    const letezo = db
      .select({ id: user.id, role: user.role, banned: user.banned, banExpires: user.banExpires })
      .from(user)
      .where(eq(user.email, a.email))
      .get();
    let userId: string;
    if (letezo) {
      // Admin (vagy más nem-attasé) és tiltott fióknak nem állítunk hozzárendelést.
      const okok: string[] = [];
      if (letezo.role !== 'attase') {
        okok.push(letezo.role ? `a szerepköre „${letezo.role}”, nem attasé` : 'nincs szerepköre, nem attasé');
      }
      if (tiltottE(letezo)) okok.push('a fiók tiltott');
      if (okok.length > 0) {
        console.warn(`Figyelmeztetés: ${a.nev} <${a.email}> kihagyva, a hozzárendelése nincs beállítva – ${okok.join('; ')}.`);
        kihagyva++;
        continue;
      }
      userId = letezo.id;
    } else {
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
    beallitva++;
  }
  console.log(`Kész: ${beallitva} demó attasé hozzárendelése beállítva${kihagyva > 0 ? `, ${kihagyva} kihagyva` : ''}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
