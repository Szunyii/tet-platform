import 'server-only';
import { and, desc, eq, gte, inArray, lte, or, sql } from 'drizzle-orm';
import { db } from '../index';
import { riport, riportCsatolmany, user } from '../schema';
import type { KategoriaKulcs } from '../../lib/riport-szotar';
import type { RiportInput } from '../../lib/riport-validacio';

export interface RiportFilter {
  szerzoId?: string;
  kategoria?: KategoriaKulcs;
  kulcsszo?: string;
  orszag?: string;
  q?: string;
  /** YYYY-MM-DD, a created_at napjára (a szerver időzónája szerint) */
  datumTol?: string;
  datumIg?: string;
}

export interface RiportListItem {
  id: string;
  szerzoId: string;
  szerzoNev: string;
  orszag: string;
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
  kategoria: riport.kategoria,
  targy: riport.targy,
  kulcsszavak: riport.kulcsszavak,
  esemenyDatum: riport.esemenyDatum,
  csatolmanyDb: sql<number>`(select count(*) from ${riportCsatolmany} where ${riportCsatolmany.riportId} = ${riport.id})`,
  createdAt: riport.createdAt,
};

/** Lista blob nélkül, szerző nevével és csatolmány-darabszámmal, legújabb elöl. */
export function listRiportok(filter: RiportFilter = {}): RiportListItem[] {
  const felt = [];
  if (filter.szerzoId) felt.push(eq(riport.szerzoId, filter.szerzoId));
  if (filter.kategoria) felt.push(eq(riport.kategoria, filter.kategoria));
  if (filter.orszag) felt.push(eq(riport.orszag, filter.orszag));
  if (filter.kulcsszo) {
    felt.push(
      sql`exists (select 1 from json_each(${riport.kulcsszavak}) where json_each.value = ${filter.kulcsszo})`,
    );
  }
  if (filter.q) {
    const minta = `%${filter.q.replace(/[%_]/g, (c) => '\\' + c)}%`;
    felt.push(or(sql`${riport.targy} like ${minta} escape '\\'`, sql`${riport.leiras} like ${minta} escape '\\'`)!);
  }
  if (filter.datumTol) felt.push(gte(riport.createdAt, new Date(`${filter.datumTol}T00:00:00`)));
  if (filter.datumIg) felt.push(lte(riport.createdAt, new Date(`${filter.datumIg}T23:59:59.999`)));

  return db
    .select(listOszlopok)
    .from(riport)
    .innerJoin(user, eq(riport.szerzoId, user.id))
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
    tx.update(riport).set(input).where(eq(riport.id, id)).run();
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

/** Az admin ország-szűrőjéhez: a bejegyzésekben előforduló országok, magyar sorrendben. */
export function listOrszagok(): string[] {
  return db
    .selectDistinct({ orszag: riport.orszag })
    .from(riport)
    .all()
    .map((r) => r.orszag)
    .sort((a, b) => a.localeCompare(b, 'hu'));
}
