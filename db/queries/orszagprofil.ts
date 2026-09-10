import 'server-only';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../index';
import { orszagprofil, user } from '../schema';
import { formatDatum } from '../../lib/datum';
import { orszagByKod } from '../../lib/orszagok';
import {
  BLOKK_KULCSOK, normalizalBlokk, type Alapadatok, type Allapot, type BlokkKulcs, type Iparag, type ProfilBlokkok,
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
  for (const k of BLOKK_KULCSOK) {
    if (r[k] != null) {
      (blokkok as Record<BlokkKulcs, unknown>)[k] = normalizalBlokk(k, r[k]);
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

/** Az adott ország profil-évei, csökkenő sorrendben (évválasztó). */
export function listEvek(kod: string): number[] {
  return db
    .select({ ev: orszagprofil.ev })
    .from(orszagprofil)
    .where(eq(orszagprofil.orszagKod, kod))
    .orderBy(desc(orszagprofil.ev))
    .all()
    .map((r) => r.ev);
}

export interface TerkepOrszag {
  kod: string;
  nev: string;
  geo: string;
  lonlat: [number, number];
  attase: string | null;
  poszt: { fovaros: string | null; terulet: number | null; penznem: string | null } | null;
  ev: number | null;
  allapot: Allapot;
  iparagak: Iparag[];
  osszegzes: string;
  frissitve: string | null;
  alapadatok: Alapadatok | null;
  mentettDb: number;
  rendezvenyDb: number;
}

/**
 * A térkép és a panel adata: minden ország, ahol aktív attasé van vagy van profil, a
 * legfrissebb profiljával. Két lekérdezés + JS-összefésülés (néhány tucat sor).
 */
export function listTerkepAdat(aktualisEv: number): TerkepOrszag[] {
  const now = Date.now();
  const attasek = db
    .select({
      orszag: user.orszag, nev: user.name, fovaros: user.fovaros, terulet: user.terulet, penznem: user.penznem,
      banned: user.banned, banExpires: user.banExpires,
    })
    .from(user)
    .where(eq(user.role, 'attase'))
    .all()
    .filter((u) => u.orszag && !(Boolean(u.banned) && (!u.banExpires || u.banExpires.getTime() > now)));

  // Országonként a legnagyobb év sora. (Az év szerint csökkenő listából az első előfordulás
  // országonként; a max(ev)-es al-lekérdezéses join helyett, mert a Drizzle az aliasolt
  // sql-oszlopot a join-feltételben minősítés nélkül írja ki, és az SQLite-nak ambiguous.)
  const profilok: (typeof orszagprofil.$inferSelect)[] = [];
  const lattuk = new Set<string>();
  for (const p of db.select().from(orszagprofil).orderBy(desc(orszagprofil.ev)).all()) {
    if (lattuk.has(p.orszagKod)) continue;
    lattuk.add(p.orszagKod);
    profilok.push(p);
  }

  const kodok = new Set<string>();
  for (const a of attasek) if (a.orszag) kodok.add(a.orszag);
  for (const p of profilok) kodok.add(p.orszagKod);

  const eredmeny: TerkepOrszag[] = [];
  for (const kod of kodok) {
    const o = orszagByKod(kod);
    if (!o) continue;
    const a = attasek.find((x) => x.orszag === kod) ?? null;
    const p = profilok.find((x) => x.orszagKod === kod) ?? null;
    const prof = p ? sorbol(p, null) : null;
    eredmeny.push({
      kod, nev: o.nev, geo: o.geo, lonlat: o.lonlat,
      attase: a?.nev ?? null,
      poszt: a ? { fovaros: a.fovaros ?? null, terulet: a.terulet ?? null, penznem: a.penznem ?? null } : null,
      ev: prof?.ev ?? null,
      allapot: !prof ? 'nincs' : prof.ev === aktualisEv ? 'friss' : 'elavult',
      iparagak: prof?.blokkok.kfiRendszer?.kiemeltIparagak ?? [],
      osszegzes: prof?.blokkok.magyarErtekeles?.osszegzes ?? '',
      frissitve: prof ? formatDatum(prof.updatedAt) : null,
      alapadatok: prof?.blokkok.alapadatok ?? null,
      mentettDb: prof?.mentett.length ?? 0,
      rendezvenyDb: prof?.blokkok.rendezvenyek?.lista.length ?? 0,
    });
  }
  return eredmeny.sort((x, y) => x.nev.localeCompare(y.nev, 'hu'));
}

/** Egy blokk mentése: a sor létrejön, ha nincs, majd csak az adott oszlop frissül. */
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
      set: { [blokk]: tartalom, szerzoId, updatedAt: new Date() },
    })
    .run();
}
