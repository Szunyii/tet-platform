import 'server-only';
import { cache } from 'react';
import { and, desc, eq, lte, sql } from 'drizzle-orm';
import { db } from '../index';
import { orszagprofil, user } from '../schema';
import { orszagByKod } from '../../lib/orszagok';
import { huOsszevet } from '../../lib/rendezes';
import { listAttasekOrszagonkent } from './attase-orszag';
import type { OrszagAttase } from '../../lib/attase-orszag';
import {
  BLOKK_KULCSOK, normalizalBlokk, profilAllapot,
  type Agazat, type Alapadatok, type Allapot, type BlokkKulcs, type KfiPrioritas, type ProfilBlokkok,
} from '../../lib/orszagprofil-szotar';

export interface Profil {
  id: string;
  orszagKod: string;
  ev: number;
  szerzo: { id: string; nev: string } | null;
  updatedAt: Date;
  /** Csak a mentett blokkok, normalizálva. */
  blokkok: Partial<ProfilBlokkok>;
  mentett: BlokkKulcs[];
}

function sorbol(r: typeof orszagprofil.$inferSelect, szerzoNev: string | null): Profil {
  const blokkok: Partial<ProfilBlokkok> = {};
  const mentett: BlokkKulcs[] = [];
  // Korrelált generikus: a K köti össze az oszlopot és a blokk-típust, így nem kell cast.
  const tegye = <K extends BlokkKulcs>(k: K) => {
    blokkok[k] = normalizalBlokk(k, r[k]);
  };
  for (const k of BLOKK_KULCSOK) {
    if (r[k] != null) {
      tegye(k);
      mentett.push(k);
    }
  }
  return {
    id: r.id,
    orszagKod: r.orszagKod,
    ev: r.ev,
    szerzo: r.szerzoId && szerzoNev !== null ? { id: r.szerzoId, nev: szerzoNev } : null,
    updatedAt: r.updatedAt,
    blokkok,
    mentett,
  };
}

export function getProfil(kod: string, ev: number): Profil | null {
  const r = db
    .select({ p: orszagprofil, szerzoNev: user.name })
    .from(orszagprofil)
    .leftJoin(user, eq(user.id, orszagprofil.szerzoId))
    .where(and(eq(orszagprofil.orszagKod, kod), eq(orszagprofil.ev, ev)))
    .get();
  return r ? sorbol(r.p, r.szerzoNev ?? null) : null;
}

/**
 * Az ország legnagyobb profil-éve, amely nem nagyobb `ev`-nél (az évnézet állapot-jelvénye), vagy null.
 * React.cache: egy kérésen belül (layout + page) azonos argumentummal egyszer fut le.
 */
export const getUtolsoEv = cache((kod: string, ev: number): number | null => {
  const r = db
    .select({ ev: orszagprofil.ev })
    .from(orszagprofil)
    .where(and(eq(orszagprofil.orszagKod, kod), lte(orszagprofil.ev, ev)))
    .orderBy(desc(orszagprofil.ev))
    .limit(1)
    .get();
  return r?.ev ?? null;
});

/** Az összes ország profil-évei egyszer, csökkenő sorrendben (fejléc ciklusválasztó). */
export function listProfilEvek(): number[] {
  return db
    .selectDistinct({ ev: orszagprofil.ev })
    .from(orszagprofil)
    .orderBy(desc(orszagprofil.ev))
    .all()
    .map((r) => r.ev);
}

/** Az Alapadatokból ennyit használ a térkép kliens-oldala (kivonat, mutatók, tagság-mátrix); a többi mező nem kerül a payloadba. */
export type TerkepAlapadatok = Pick<
  Alapadatok,
  'fovaros' | 'terulet' | 'penznem' | 'lakossag' | 'gdp' | 'gdpEgyFore' | 'gdpNovekedes' | 'adatEv' | 'forras' | 'tagsagok'
>;

function terkepAlapadatok(a: Alapadatok): TerkepAlapadatok {
  const { fovaros, terulet, penznem, lakossag, gdp, gdpEgyFore, gdpNovekedes, adatEv, forras, tagsagok } = a;
  return { fovaros, terulet, penznem, lakossag, gdp, gdpEgyFore, gdpNovekedes, adatEv, forras, tagsagok };
}

// A mentett blokkok száma SQL-ben, a `BLOKK_KULCSOK`-ból (kimerítő): így a kilenc JSON-oszlopot nem kell beolvasni.
const MENTETT_DB = sql<number>`${sql.join(BLOKK_KULCSOK.map((k) => sql`(${orszagprofil[k]} is not null)`), sql` + `)}`;

export interface TerkepOrszag {
  kod: string;
  nev: string;
  geo: string;
  lonlat: [number, number];
  /** Az ország aktív attaséi (vezető elöl, utána a székhelyesek, végül a régiósak); üres, ha nincs. */
  attasek: OrszagAttase[];
  ev: number | null;
  allapot: Allapot;
  /** A KFI-blokk kiemelt iparágai a közös ágazatlistából; az első adja a térkép színét. */
  iparagak: Agazat[];
  /** K+F ráfordítás a GDP %-ában (KFI-blokk), ha a blokk mentett. */
  gerd: number | null;
  /** KFI-prioritások (KFI-blokk) az összehasonlítás listamátrixához; nem mentett blokknál üres. */
  prioritasok: KfiPrioritas[];
  osszegzes: string;
  alapadatok: TerkepAlapadatok | null;
  mentettDb: number;
  rendezvenyDb: number;
}

/**
 * A térkép és a panel adata a választott `ev` nézetében: minden ország, ahol aktív attasé van
 * (székhelyként vagy régiósan) vagy van profil, országonként a legnagyobb év ≤ ev profiljával.
 * Az `allapot` az `ev`-hez viszonyít: van profil az évre → friss, csak régebbi → elavult,
 * semmi → nincs (ev = aktuális évnél ez a korábbi viselkedés). Két lekérdezés + JS-összefésülés;
 * az orszagprofil tábla országok × évek méretű, csak a ≤ ev sorok és a térkép által használt
 * oszlopok jönnek.
 * React.cache: egy kérésen belül (layout + page) azonos argumentummal egyszer fut le, a hívók
 * ugyanazt a tömb-példányt kapják – ne mutáld.
 */
export const listTerkepAdat = cache((ev: number): TerkepOrszag[] => {
  const attasek = listAttasekOrszagonkent();

  // Országonként a legnagyobb, ev-nél nem nagyobb év sora. (Az év szerint csökkenő listából
  // az első előfordulás országonként; a max(ev)-es al-lekérdezéses join helyett, mert a
  // Drizzle az aliasolt sql-oszlopot a join-feltételben minősítés nélkül írja ki.)
  const sorok = db
    .select({
      orszagKod: orszagprofil.orszagKod,
      ev: orszagprofil.ev,
      alapadatok: orszagprofil.alapadatok,
      kfiRendszer: orszagprofil.kfiRendszer,
      rendezvenyek: orszagprofil.rendezvenyek,
      magyarErtekeles: orszagprofil.magyarErtekeles,
      mentettDb: MENTETT_DB,
    })
    .from(orszagprofil)
    .where(lte(orszagprofil.ev, ev))
    .orderBy(desc(orszagprofil.ev))
    .all();
  const profilKodhoz = new Map<string, (typeof sorok)[number]>();
  for (const p of sorok) if (!profilKodhoz.has(p.orszagKod)) profilKodhoz.set(p.orszagKod, p);

  const kodok = new Set<string>([...attasek.keys(), ...profilKodhoz.keys()]);

  const eredmeny: TerkepOrszag[] = [];
  for (const kod of kodok) {
    const o = orszagByKod(kod);
    if (!o) continue;
    const p = profilKodhoz.get(kod);
    // Csak a térkép által olvasott négy blokk normalizálódik.
    const alap = p?.alapadatok != null ? normalizalBlokk('alapadatok', p.alapadatok) : null;
    const kfi = p?.kfiRendszer != null ? normalizalBlokk('kfiRendszer', p.kfiRendszer) : null;
    const rend = p?.rendezvenyek != null ? normalizalBlokk('rendezvenyek', p.rendezvenyek) : null;
    const magyar = p?.magyarErtekeles != null ? normalizalBlokk('magyarErtekeles', p.magyarErtekeles) : null;
    eredmeny.push({
      kod, nev: o.nev, geo: o.geo, lonlat: o.lonlat,
      attasek: attasek.get(kod) ?? [],
      ev: p?.ev ?? null,
      allapot: profilAllapot(p?.ev ?? null, ev),
      iparagak: kfi?.kiemeltIparagak ?? [],
      gerd: kfi?.gerd ?? null,
      prioritasok: kfi?.prioritasok ?? [],
      osszegzes: magyar?.osszegzes ?? '',
      alapadatok: alap ? terkepAlapadatok(alap) : null,
      mentettDb: p?.mentettDb ?? 0,
      rendezvenyDb: rend?.lista.length ?? 0,
    });
  }
  return eredmeny.sort((x, y) => huOsszevet(x.nev, y.nev));
});

/**
 * Egy blokk mentése: a sor létrejön, ha nincs, majd csak az adott oszlop frissül (az
 * updated_at-ot a séma $onUpdate-je állítja). A `tartalom: ProfilBlokkok[K]` szignatúra köti
 * az érték típusát az oszlophoz – a Drizzle a számított `[blokk]` kulcsnál csak a nevet nézi.
 */
export function upsertBlokk<K extends BlokkKulcs>(
  kod: string,
  ev: number,
  blokk: K,
  tartalom: ProfilBlokkok[K],
  szerzoId: string,
): void {
  db.insert(orszagprofil)
    .values({ id: crypto.randomUUID(), orszagKod: kod, ev, szerzoId, [blokk]: tartalom })
    .onConflictDoUpdate({
      target: [orszagprofil.orszagKod, orszagprofil.ev],
      set: { [blokk]: tartalom, szerzoId },
    })
    .run();
}
