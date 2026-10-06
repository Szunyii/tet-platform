import 'server-only';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { db } from '../index';
import { attaseOrszag, user } from '../schema';
import { tiltottE } from '../../lib/felhasznalo-tiltas';
import {
  rendezAttasek, rendezOrszagok, type AttaseOrszag, type OrszagAttase, type SessionOrszag,
} from '../../lib/attase-orszag';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** A felhasználó hozzárendelései a sessionhöz: székhely elöl, utána magyar országnév szerint. */
export function listAttaseOrszagok(userId: string): SessionOrszag[] {
  return rendezOrszagok(
    db
      .select({ kod: attaseOrszag.orszagKod, szekhely: attaseOrszag.szekhely, vezeto: attaseOrszag.vezeto })
      .from(attaseOrszag)
      .where(eq(attaseOrszag.userId, userId))
      .all(),
  );
}

/** Minden hozzárendelés felhasználónként (a felhasználó-lista oszlopa és a dialógusok kezdőértéke). */
export function listOrszagokFelhasznalonkent(): Map<string, AttaseOrszag[]> {
  const m = new Map<string, AttaseOrszag[]>();
  for (const r of db.select().from(attaseOrszag).all()) {
    const lista = m.get(r.userId) ?? [];
    lista.push({ kod: r.orszagKod, szekhely: r.szekhely, vezeto: r.vezeto, varos: r.varos, reszterulet: r.reszterulet });
    m.set(r.userId, lista);
  }
  for (const [userId, lista] of m) m.set(userId, rendezOrszagok(lista));
  return m;
}

// Az attasé székhely-sora (város, részterület) a régiós országok felirataihoz.
const szekhelySor = alias(attaseOrszag, 'szekhely_sor');

/** Az aktív (nem tiltott) attasék országonként, `rendezAttasek` sorrendben; `kod` megadásával csak az az ország. */
function attasekOrszagonkent(kod?: string): Map<string, OrszagAttase[]> {
  const now = Date.now();
  const sorok = db
    .select({
      kod: attaseOrszag.orszagKod,
      userId: user.id,
      nev: user.name,
      vezeto: attaseOrszag.vezeto,
      role: user.role,
      banned: user.banned,
      banExpires: user.banExpires,
      szekhelyKod: szekhelySor.orszagKod,
      varos: szekhelySor.varos,
      reszterulet: szekhelySor.reszterulet,
    })
    .from(attaseOrszag)
    .innerJoin(user, eq(user.id, attaseOrszag.userId))
    .leftJoin(szekhelySor, and(eq(szekhelySor.userId, attaseOrszag.userId), eq(szekhelySor.szekhely, true)))
    .where(kod !== undefined ? eq(attaseOrszag.orszagKod, kod) : undefined)
    .all();
  const m = new Map<string, OrszagAttase[]>();
  for (const r of sorok) {
    // Az admin nem attasé: ha egy sikertelen második mentési lépés után sora maradt, az ne jelenjen meg attaséként.
    if (r.role === 'admin' || tiltottE(r, now)) continue;
    const lista = m.get(r.kod) ?? [];
    lista.push({
      userId: r.userId,
      nev: r.nev,
      vezeto: r.vezeto,
      szekhelyKod: r.szekhelyKod,
      varos: r.varos,
      // A részterület a székhely-országon belüli terület: régiós országnál nem értelmezett.
      reszterulet: r.szekhelyKod === r.kod ? r.reszterulet : null,
    });
    m.set(r.kod, lista);
  }
  for (const [k, lista] of m) m.set(k, rendezAttasek(k, lista));
  return m;
}

/** Az ország aktív attaséi a profil fejlécének (vezető elöl, utána a székhelyesek, végül a régiósak). */
export function listOrszagAttasek(kod: string): OrszagAttase[] {
  return attasekOrszagonkent(kod).get(kod) ?? [];
}

/** Minden ország aktív attaséi (a térkép adata). */
export function listAttasekOrszagonkent(): Map<string, OrszagAttase[]> {
  return attasekOrszagonkent();
}

/**
 * Egy felhasználó összes hozzárendelésének cseréje egy tranzakcióban: a régi sorok törlése, a
 * bejelölt vezetőségek átvétele (az adott országok többi vezető-jelölése lekerül), az új sorok
 * beszúrása, végül a normalizálás. Adminnak (és adminra váltáskor) üres listával hívandó.
 */
export function setAttaseOrszagok(userId: string, sorok: readonly AttaseOrszag[]): void {
  db.transaction((tx) => {
    tx.delete(attaseOrszag).where(eq(attaseOrszag.userId, userId)).run();
    const atvett = sorok.filter((s) => s.vezeto).map((s) => s.kod);
    if (atvett.length > 0) {
      tx.update(attaseOrszag).set({ vezeto: false }).where(inArray(attaseOrszag.orszagKod, atvett)).run();
    }
    if (sorok.length > 0) {
      tx.insert(attaseOrszag)
        .values(
          sorok.map((s) => ({
            userId,
            orszagKod: s.kod,
            szekhely: s.szekhely,
            vezeto: s.vezeto,
            // A város és a részterület csak a székhely-sornál értelmezett.
            varos: s.szekhely ? s.varos : null,
            reszterulet: s.szekhely ? s.reszterulet : null,
          })),
        )
        .run();
    }
    normalizal(tx);
  });
}

/**
 * Ahol egy országnak pontosan egy hozzárendelése van és nincs vezetője, az lesz a vezető
 * (egyszemélyes országban nem kell jelölni; a vezető távozásakor az egyedül maradó örököl).
 * Ha többen maradnak vezető nélkül, nem jelöl ki senkit – a felhasználó-kezelő figyelmeztet.
 * A felhasználó törlése után (FK cascade) a removeFelhasznaloAction hívja.
 */
export function normalizalVezetok(): void {
  db.transaction((tx) => normalizal(tx));
}

function normalizal(tx: Tx): void {
  const egyedul = tx
    .select({ kod: attaseOrszag.orszagKod })
    .from(attaseOrszag)
    .groupBy(attaseOrszag.orszagKod)
    .having(sql`count(*) = 1 and max(${attaseOrszag.vezeto}) = 0`);
  tx.update(attaseOrszag)
    .set({ vezeto: true })
    .where(and(eq(attaseOrszag.vezeto, false), inArray(attaseOrszag.orszagKod, egyedul)))
    .run();
}
