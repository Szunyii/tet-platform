import 'server-only';
import { and, desc, eq, gte, inArray, lt, or, sql, type SQL } from 'drizzle-orm';
import { db } from '../index';
import { attaseOrszag, riport, riportCsatolmany, user } from '../schema';
import { kovetkezoNapKezdete, napKezdete } from '../../lib/datum';
import { orszagNev } from '../../lib/orszagok';
import type { KategoriaKulcs } from '../../lib/riport-szotar';
import type { RiportInput } from '../../lib/riport-validacio';

export interface RiportFilter {
  szerzoId?: string;
  kategoria?: KategoriaKulcs;
  kulcsszo?: string;
  orszag?: string;
  q?: string;
  /**
   * YYYY-MM-DD, a created_at budapesti naptári napjára (lib/datum.ts IDOZONA), a
   * megjelenítéssel (formatDatum) konzisztensen.
   */
  datumTol?: string;
  datumIg?: string;
}

export interface RiportListItem {
  id: string;
  szerzoId: string;
  szerzoNev: string;
  orszag: string;
  /**
   * A szerző állomáshelye: a székhely-sorának városa a JELENLEGI hozzárendelésből (nem
   * pillanatkép, mint az `orszag`). `null`, ha a szerzőnek nincs székhely-sora vagy városa.
   */
  varos: string | null;
  /** A központ „Megtett intézkedése” (a teljes szöveg), vagy `null`. */
  intezkedes: string | null;
  kategoria: KategoriaKulcs;
  targy: string;
  kulcsszavak: string[];
  esemenyDatum: string | null;
  csatolmanyDb: number;
  createdAt: Date;
}

export interface CsatolmanyMeta {
  id: string;
  fajlnev: string;
  mime: string;
  meret: number;
}

export interface RiportDetail extends RiportInput {
  id: string;
  szerzoId: string;
  szerzoNev: string;
  orszag: string;
  createdAt: Date;
  updatedAt: Date;
  /** A központ „Megtett intézkedése”: a három mező együtt `null` vagy együtt töltött. */
  intezkedes: string | null;
  intezkedesSzerzoNev: string | null;
  intezkedesIdopont: Date | null;
  csatolmanyok: CsatolmanyMeta[];
}

export interface CsatolmanyInput {
  fajlnev: string;
  mime: string;
  meret: number;
  tartalom: Buffer;
}

export type RiportCreate = RiportInput & { szerzoId: string; orszag: string };

const listOszlopok = {
  id: riport.id,
  szerzoId: riport.szerzoId,
  szerzoNev: user.name,
  orszag: riport.orszag,
  varos: attaseOrszag.varos,
  intezkedes: riport.intezkedes,
  kategoria: riport.kategoria,
  targy: riport.targy,
  kulcsszavak: riport.kulcsszavak,
  esemenyDatum: riport.esemenyDatum,
  csatolmanyDb: sql<number>`(select count(*) from ${riportCsatolmany} where ${riportCsatolmany.riportId} = ${riport.id})`,
  createdAt: riport.createdAt,
};

/** Lista blob nélkül, szerző nevével és csatolmány-darabszámmal, legújabb elöl. */
export function listRiportok(filter: RiportFilter = {}): RiportListItem[] {
  const felt: SQL[] = [];
  if (filter.szerzoId) felt.push(eq(riport.szerzoId, filter.szerzoId));
  if (filter.kategoria) felt.push(eq(riport.kategoria, filter.kategoria));
  if (filter.orszag) felt.push(eq(riport.orszag, filter.orszag));
  if (filter.kulcsszo) {
    felt.push(
      sql`exists (select 1 from json_each(${riport.kulcsszavak}) where json_each.value = ${filter.kulcsszo})`,
    );
  }
  if (filter.q) {
    // A `\` is escape-elendő a mintában, hiszen az `escape '\\'` karaktert ad meg elválasztónak.
    const minta = `%${filter.q.replace(/[\\%_]/g, (c) => '\\' + c)}%`;
    const qFelt = or(sql`${riport.targy} like ${minta} escape '\\'`, sql`${riport.leiras} like ${minta} escape '\\'`);
    if (qFelt) felt.push(qFelt);
  }
  if (filter.datumTol) {
    const d = napKezdete(filter.datumTol);
    if (!Number.isNaN(d.getTime())) felt.push(gte(riport.createdAt, d));
  }
  if (filter.datumIg) {
    const d = kovetkezoNapKezdete(filter.datumIg);
    if (!Number.isNaN(d.getTime())) felt.push(lt(riport.createdAt, d));
  }

  return db
    .select(listOszlopok)
    .from(riport)
    .innerJoin(user, eq(riport.szerzoId, user.id))
    // Felhasználónként legfeljebb egy székhely-sor van (részleges egyedi index), a join nem sokszoroz.
    .leftJoin(attaseOrszag, and(eq(attaseOrszag.userId, riport.szerzoId), eq(attaseOrszag.szekhely, true)))
    .where(felt.length ? and(...felt) : undefined)
    .orderBy(desc(riport.createdAt))
    .all()
    .map((r) => ({ ...r, kategoria: r.kategoria as KategoriaKulcs }));
}

export function getRiport(id: string): RiportDetail | null {
  const sor = db
    .select({
      id: riport.id,
      szerzoId: riport.szerzoId,
      szerzoNev: user.name,
      orszag: riport.orszag,
      kategoria: riport.kategoria,
      targy: riport.targy,
      leiras: riport.leiras,
      kulcsszavak: riport.kulcsszavak,
      esemenyDatum: riport.esemenyDatum,
      esemenyHelyszin: riport.esemenyHelyszin,
      joGyakorlat: riport.joGyakorlat,
      kapcsolodoFeladat: riport.kapcsolodoFeladat,
      createdAt: riport.createdAt,
      updatedAt: riport.updatedAt,
      intezkedes: riport.intezkedes,
      intezkedesSzerzoNev: riport.intezkedesSzerzoNev,
      intezkedesIdopont: riport.intezkedesIdopont,
    })
    .from(riport)
    .innerJoin(user, eq(riport.szerzoId, user.id))
    .where(eq(riport.id, id))
    .get();
  if (!sor) return null;
  const csatolmanyok = db
    .select({
      id: riportCsatolmany.id,
      fajlnev: riportCsatolmany.fajlnev,
      mime: riportCsatolmany.mime,
      meret: riportCsatolmany.meret,
    })
    .from(riportCsatolmany)
    .where(eq(riportCsatolmany.riportId, id))
    .orderBy(riportCsatolmany.createdAt)
    .all();
  return {
    ...sor,
    kategoria: sor.kategoria as KategoriaKulcs,
    kulcsszavak: sor.kulcsszavak as RiportDetail['kulcsszavak'],
    csatolmanyok,
  };
}

/** Tranzakcióban; visszaadja az új id-t. */
export function createRiport(input: RiportCreate, csatolmanyok: CsatolmanyInput[]): string {
  const id = crypto.randomUUID();
  db.transaction((tx) => {
    tx.insert(riport).values({ id, ...input }).run();
    for (const cs of csatolmanyok) {
      tx.insert(riportCsatolmany).values({ id: crypto.randomUUID(), riportId: id, ...cs }).run();
    }
  });
  return id;
}

/** A csatolmány-limitet (max 5 a végösszegre) a hívó ellenőrzi a validátorral. */
export function updateRiport(
  id: string,
  input: RiportInput,
  ujCsatolmanyok: CsatolmanyInput[],
  torlendoCsatolmanyIdk: string[],
): void {
  db.transaction((tx) => {
    tx.update(riport)
      .set({
        kategoria: input.kategoria,
        targy: input.targy,
        leiras: input.leiras,
        kulcsszavak: input.kulcsszavak,
        esemenyDatum: input.esemenyDatum,
        esemenyHelyszin: input.esemenyHelyszin,
        joGyakorlat: input.joGyakorlat,
        kapcsolodoFeladat: input.kapcsolodoFeladat,
      })
      .where(eq(riport.id, id))
      .run();
    if (torlendoCsatolmanyIdk.length > 0) {
      tx.delete(riportCsatolmany)
        .where(and(eq(riportCsatolmany.riportId, id), inArray(riportCsatolmany.id, torlendoCsatolmanyIdk)))
        .run();
    }
    for (const cs of ujCsatolmanyok) {
      tx.insert(riportCsatolmany).values({ id: crypto.randomUUID(), riportId: id, ...cs }).run();
    }
  });
}

/**
 * A központ „Megtett intézkedésének” beállítása, vagy (`szoveg === null`) törlése; a három
 * oszlop együtt változik. A bejegyzés `updatedAt`-ját NEM lépteti (a `$onUpdate` miatt
 * kifejezetten önmagára állítjuk): a „módosítva” dátum az attasé szövegére vonatkozik, az
 * intézkedésnek saját időpontja van. `false`, ha nincs ilyen bejegyzés.
 */
export function setIntezkedes(id: string, szoveg: string | null, szerzoNev: string): boolean {
  const eredmeny = db
    .update(riport)
    .set({
      intezkedes: szoveg,
      intezkedesSzerzoNev: szoveg === null ? null : szerzoNev,
      intezkedesIdopont: szoveg === null ? null : new Date(),
      updatedAt: sql`${riport.updatedAt}`,
    })
    .where(eq(riport.id, id))
    .run();
  return eredmeny.changes > 0;
}

export function deleteRiport(id: string): void {
  db.delete(riport).where(eq(riport.id, id)).run();
}

/** Letöltéshez, blobbal. */
export function getCsatolmany(id: string): (CsatolmanyMeta & { riportId: string; tartalom: Buffer }) | null {
  return (
    db
      .select({
        id: riportCsatolmany.id,
        riportId: riportCsatolmany.riportId,
        fajlnev: riportCsatolmany.fajlnev,
        mime: riportCsatolmany.mime,
        meret: riportCsatolmany.meret,
        tartalom: riportCsatolmany.tartalom,
      })
      .from(riportCsatolmany)
      .where(eq(riportCsatolmany.id, id))
      .get() ?? null
  );
}

/** Letöltés előtti jogosultság-ellenőrzéshez, blob nélkül. */
export function getCsatolmanyMeta(id: string): (CsatolmanyMeta & { riportId: string }) | null {
  return (
    db
      .select({
        id: riportCsatolmany.id,
        riportId: riportCsatolmany.riportId,
        fajlnev: riportCsatolmany.fajlnev,
        mime: riportCsatolmany.mime,
        meret: riportCsatolmany.meret,
      })
      .from(riportCsatolmany)
      .where(eq(riportCsatolmany.id, id))
      .get() ?? null
  );
}

/** Az admin ország-szűrőjéhez: a bejegyzésekben előforduló országkódok, magyar név szerint rendezve. */
export function listOrszagok(): string[] {
  return db
    .selectDistinct({ orszag: riport.orszag })
    .from(riport)
    .all()
    .map((r) => r.orszag)
    .sort((a, b) => orszagNev(a).localeCompare(orszagNev(b), 'hu'));
}
