/**
 * Attasé–ország hozzárendelés: típusok, korlátok és tiszta segédek (nincs React, nincs DB).
 * Egy attasénak pontosan egy székhelye van (a poszt országa és városa, opcionális
 * részterülettel – pl. a lefedett tartományok listája), és regionálisan további országokat
 * fedhet le. Országonként legfeljebb egy relációs vezető van: ő az országprofil felelőse és –
 * az adminon kívül – egyedüli szerkesztője. A DB-szabályokat a db/queries/attase-orszag.ts
 * tartja (setAttaseOrszagok, normalizalVezetok).
 */
import { orszagNev } from './orszagok';

export const VAROS_MAX = 100;
export const RESZTERULET_MAX = 1000;
export const REGIO_MAX = 20;

/** Egy hozzárendelés (a validátor kimenete, a felhasználó-lista sora). A város és a részterület csak a székhelynél töltött. */
export interface AttaseOrszag {
  kod: string;
  szekhely: boolean;
  vezeto: boolean;
  varos: string | null;
  reszterulet: string | null;
}

/** A session hozzárendelései (jogosultság és megjelenítés). */
export type SessionOrszag = Pick<AttaseOrszag, 'kod' | 'szekhely' | 'vezeto'>;

/** Egy ország egy aktív attaséja (profil fejléc, térkép). Régiós, ha a székhelye másik ország. */
export interface OrszagAttase {
  userId: string;
  nev: string;
  vezeto: boolean;
  /** Az attasé székhely-országa; null csak hibás (székhely nélküli) adatnál. */
  szekhelyKod: string | null;
  /** A székhely (a poszt) városa. */
  varos: string | null;
  /** Az országon belüli részterület – csak ha ez az ország a székhelye. */
  reszterulet: string | null;
}

/** Székhely elöl, utána magyar országnév szerint. */
export function rendezOrszagok<T extends { kod: string; szekhely: boolean }>(lista: readonly T[]): T[] {
  return [...lista].sort(
    (a, b) => Number(b.szekhely) - Number(a.szekhely) || orszagNev(a.kod).localeCompare(orszagNev(b.kod), 'hu'),
  );
}

/** A székhely-ország kódja, vagy null. */
export function szekhelyKod(orszagok: readonly { kod: string; szekhely: boolean }[]): string | null {
  return orszagok.find((o) => o.szekhely)?.kod ?? null;
}

/** A „Saját országprofil” célja: a székhely, ha ott vezető, különben az első vezetett ország; null, ha egyiknek sem vezetője. */
export function elsoVezetettKod(orszagok: readonly SessionOrszag[]): string | null {
  return rendezOrszagok(orszagok).find((o) => o.vezeto)?.kod ?? null;
}

/** Régiósan fedi-e le az attasé az adott országot (a székhelye máshol van). */
export function regionalisE(a: Pick<OrszagAttase, 'szekhelyKod'>, kod: string): boolean {
  return a.szekhelyKod !== null && a.szekhelyKod !== kod;
}

/** Vezető elöl, utána akiknek ez a székhelye, végül a régiósak; csoporton belül név szerint. */
export function rendezAttasek(kod: string, lista: readonly OrszagAttase[]): OrszagAttase[] {
  const rang = (a: OrszagAttase) => (a.vezeto ? 0 : regionalisE(a, kod) ? 2 : 1);
  return [...lista].sort((a, b) => rang(a) - rang(b) || a.nev.localeCompare(b.nev, 'hu'));
}

/** „Név · Város”; régiósnál „Név · regionálisan (Város)” – város nélkül a székhely országa. */
export function attaseFelirat(a: OrszagAttase, kod: string): string {
  if (regionalisE(a, kod)) return `${a.nev} · regionálisan (${a.varos ?? orszagNev(a.szekhelyKod)})`;
  return a.varos ? `${a.nev} · ${a.varos}` : a.nev;
}

/** Egy sor az ország attaséiról: az első (a vezető, ha van) felirata, több attasénál „+N attasé”; üres listára null. */
export function attasekRovid(attasek: readonly OrszagAttase[], kod: string): string | null {
  const [elso, ...tobbi] = attasek;
  if (!elso) return null;
  return attaseFelirat(elso, kod) + (tobbi.length > 0 ? ` +${tobbi.length} attasé` : '');
}

/** A felhasználó-kezelő országonkénti attasé-listájának egy eleme (vezető-súgó, figyelmeztetés, ★). */
export interface OrszagTag {
  userId: string;
  nev: string;
  vezeto: boolean;
  tiltott: boolean;
}
/** Országkód → az országot lefedő felhasználók (tiltottakkal együtt). Sima objektum: kliens-propként is átadható. */
export type OrszagAttasek = Record<string, OrszagTag[]>;

/** A felhasználó-listából országonként a lefedő felhasználók. */
export function orszagonkent(
  felhasznalok: readonly {
    id: string;
    nev: string;
    tiltott: boolean;
    orszagok: readonly Pick<AttaseOrszag, 'kod' | 'vezeto'>[];
  }[],
): OrszagAttasek {
  const m: OrszagAttasek = {};
  for (const f of felhasznalok) {
    for (const o of f.orszagok) {
      if (!m[o.kod]) m[o.kod] = [];
      m[o.kod].push({ userId: f.id, nev: f.nev, vezeto: o.vezeto, tiltott: f.tiltott });
    }
  }
  return m;
}

/** Ország, amelynek van attaséja, de nincs aktív vezetője (nincs kijelölve, vagy a vezető tiltott). */
export interface HianyosOrszag {
  kod: string;
  /** A nem tiltott attasék száma. */
  aktivDb: number;
  vezetoTiltott: boolean;
}

/** A vezető nélküli országok magyar név szerint (a felhasználó-oldal figyelmeztetése). */
export function vezetoNelkuliOrszagok(m: OrszagAttasek): HianyosOrszag[] {
  const ki: HianyosOrszag[] = [];
  for (const [kod, tagok] of Object.entries(m)) {
    const vezeto = tagok.find((t) => t.vezeto);
    if (vezeto && !vezeto.tiltott) continue;
    ki.push({ kod, aktivDb: tagok.filter((t) => !t.tiltott).length, vezetoTiltott: Boolean(vezeto) });
  }
  return ki.sort((a, b) => orszagNev(a.kod).localeCompare(orszagNev(b.kod), 'hu'));
}

/** A dialógus vezető-jelölőjének helyzete egy országra, a szerkesztett felhasználón kívüli attasék alapján. */
export interface VezetoHelyzet {
  /** A többi attasé száma (tiltottakkal együtt); 0 = egyedüli, automatikusan vezető. */
  masok: number;
  /** A másik felhasználó, aki most vezető. */
  masikVezeto: { nev: string; tiltott: boolean } | null;
  /** A szerkesztett felhasználó most (a DB szerint) ennek az országnak a vezetője. */
  sajatVezeto: boolean;
}

/** `sajatId`: a szerkesztett felhasználó (új felhasználónál null). */
export function vezetoHelyzet(kod: string, sajatId: string | null, m: OrszagAttasek): VezetoHelyzet {
  const tagok = m[kod] ?? [];
  const masok = tagok.filter((t) => t.userId !== sajatId);
  const v = masok.find((t) => t.vezeto);
  return {
    masok: masok.length,
    masikVezeto: v ? { nev: v.nev, tiltott: v.tiltott } : null,
    sajatVezeto: tagok.some((t) => t.userId === sajatId && t.vezeto),
  };
}

/** Országválasztáskor a jelölő alapértéke: bejelölve, ha nincs másik vezető. */
export function alapVezeto(h: VezetoHelyzet): boolean {
  return h.masikVezeto === null;
}

/** A jelölő súgója; a nevet toldalék nélkül írja (nem kell magánhangzó-illeszkedést számolni). */
export function vezetoSugo(h: VezetoHelyzet, bejelolve: boolean): string | null {
  if (h.masok === 0) return 'Egyedüli attasé – automatikusan vezető.';
  if (h.masikVezeto) {
    const nev = h.masikVezeto.nev + (h.masikVezeto.tiltott ? ' (tiltott)' : '');
    return bejelolve ? `Mentéskor átveszi a vezetőséget (jelenleg: ${nev}).` : `Jelenlegi vezető: ${nev}.`;
  }
  if (h.sajatVezeto) return bejelolve ? null : 'Kikapcsolva nem marad vezető – jelölj ki mást.';
  return 'Nincs kijelölt vezető.';
}
