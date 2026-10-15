/**
 * A `/jelentesek` lista URL-szűrőinek tiszta fordítója: `searchParams` → `RiportFilter`,
 * és vissza a kliens szűrő-sávnak való nyers értékekre. Nincs React és nincs DB hívás.
 */
import { ervenyesNaptariDatum } from './datum';
import { isKategoriaKulcs, isKulcsszo, type KategoriaKulcs } from './riport-szotar';
import type { SearchParams } from './routes';

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

function egy(v: string | string[] | undefined): string {
  const s = Array.isArray(v) ? v[0] : v;
  return (s ?? '').trim();
}

/** URL szűrőparaméterek → RiportFilter. Ismeretlen/érvénytelen értéket eldob. */
export function szuroFromSearchParams(sp: SearchParams): RiportFilter {
  const f: RiportFilter = {};
  const kategoria = egy(sp.kategoria);
  if (isKategoriaKulcs(kategoria)) f.kategoria = kategoria;
  const kulcsszo = egy(sp.kulcsszo);
  if (isKulcsszo(kulcsszo)) f.kulcsszo = kulcsszo;
  // Az admin ország- és attasé-szűrője. A hívó (a page) az opciólistán (`listRiportOrszagok()`,
  // `listRiportSzerzok()`) nem szereplő értéket eldobja, az attasé nézetében pedig bármilyen
  // értéket (ott a lekérdezés a sajátjára szűr), ezért itt elég a formai tisztítás.
  const orszag = egy(sp.orszag);
  if (orszag) f.orszag = orszag.slice(0, 100);
  const attase = egy(sp.attase);
  if (attase) f.szerzoId = attase.slice(0, 100);
  const q = egy(sp.q);
  if (q) f.q = q.slice(0, 100);
  // Naptárilag is érvényes dátum kell: a `2026-02-31` egyébként egy másik napra
  // (`napKezdete` szerint március 3-ára) futó, néma szűrőt adna.
  const tol = egy(sp.tol);
  if (ervenyesNaptariDatum(tol)) f.datumTol = tol;
  const ig = egy(sp.ig);
  if (ervenyesNaptariDatum(ig)) f.datumIg = ig;
  return f;
}

/** Az aktív szűrők URL-értékei a kliens komponensnek (üres string = nincs). */
export interface SzuroErtekek {
  q: string;
  kategoria: string;
  kulcsszo: string;
  orszag: string;
  attase: string;
  tol: string;
  ig: string;
}

/**
 * Csak az URL-ből jövő szűrőt add át: a jogosultságból kényszerített szerző-szűrő (az attasé
 * saját bejegyzései) csak a `listRiportok` hívásba kerüljön, különben aktív szűrőnek látszana.
 */
export function szuroErtekek(f: RiportFilter): SzuroErtekek {
  return {
    q: f.q ?? '',
    kategoria: f.kategoria ?? '',
    kulcsszo: f.kulcsszo ?? '',
    orszag: f.orszag ?? '',
    attase: f.szerzoId ?? '',
    tol: f.datumTol ?? '',
    ig: f.datumIg ?? '',
  };
}
