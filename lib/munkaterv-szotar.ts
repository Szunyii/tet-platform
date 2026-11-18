/**
 * Az éves munkaterv szótárai és tiszta szabályai. Framework-mentes: a validáció, a lekérdezések és a felületek
 * ugyanebből dolgoznak. A kulcsok kerülnek a DB-be; a feliratok a terv (spec) 6.1. pontjából valók.
 * A munkaterv fokozatot nem számol.
 */
import { ORSZAG_REGIOK, type RegioKulcs } from './orszagok';

export type CelAllapot = 'folyamatban' | 'teljesult' | 'reszben' | 'elmaradt';
export type TervStatusz = 'piszkozat' | 'jovahagyasra_var' | 'visszakuldott' | 'jovahagyott';
/** A központi cél hatóköre: a teljes hálózat vagy egy régió. */
export type Hatokor = 'halozat' | RegioKulcs;

export const CEL_ALLAPOTOK: readonly { kulcs: CelAllapot; cimke: string }[] = [
  { kulcs: 'folyamatban', cimke: 'Folyamatban' },
  { kulcs: 'teljesult', cimke: 'Teljesült' },
  { kulcs: 'reszben', cimke: 'Részben teljesült' },
  { kulcs: 'elmaradt', cimke: 'Elmaradt' },
];

export const TERV_STATUSZ_CIMKE: Record<TervStatusz, string> = {
  piszkozat: 'Nincs beküldve',
  jovahagyasra_var: 'Jóváhagyásra vár',
  visszakuldott: 'Visszaküldve',
  jovahagyott: 'Jóváhagyva',
};

/** Egy terv céljainak száma, a központi célokat is beleszámítva. */
export const CEL_MIN = 3;
export const CEL_MAX = 5;
/** Egy attasére vonatkozó központi célok száma: a hálózati és a székhelye régiójának céljai együtt. */
export const KOZPONTI_MIN = 1;
export const KOZPONTI_MAX = 2;

/** Szövegkorlátok (karakter). */
export const MEGNEVEZES_MAX = 200;
export const MERCE_MAX = 300;
export const MEGJEGYZES_MAX = 2000;

export function isCelAllapot(v: string): v is CelAllapot {
  return CEL_ALLAPOTOK.some((a) => a.kulcs === v);
}

export function isHatokor(v: string): v is Hatokor {
  return v === 'halozat' || ORSZAG_REGIOK.some((r) => r.kulcs === v);
}

/** Tervet a folyó és a következő évre lehet készíteni. */
export function tervEvek(aktualisEv: number): [number, number] {
  return [aktualisEv, aktualisEv + 1];
}

/** Az attasére vonatkozó központi célok: a hálózati célok és a székhelye régiójának céljai. */
export function vonatkozoCelok<T extends { hatokor: Hatokor }>(celok: readonly T[], regio: RegioKulcs | undefined): T[] {
  return celok.filter((c) => c.hatokor === 'halozat' || c.hatokor === regio);
}

/** Azok az attasék (nevük), akikre a megengedettnél több, illetve egyetlen központi cél sem vonatkozik. */
export function kozzetetelHibak<T extends { hatokor: Hatokor }>(
  celok: readonly T[],
  attasek: readonly { nev: string; regio: RegioKulcs | undefined }[],
): { tulSok: string[]; nincsCel: string[] } {
  const db = attasek.map((a) => ({ nev: a.nev, darab: vonatkozoCelok(celok, a.regio).length }));
  return {
    tulSok: db.filter((a) => a.darab > KOZPONTI_MAX).map((a) => a.nev),
    nincsCel: db.filter((a) => a.darab < KOZPONTI_MIN).map((a) => a.nev),
  };
}

/** A terv céljai a beküldés előtt és a visszaküldés után szerkeszthetők. */
export function szerkeszthetoTerv(s: TervStatusz): boolean {
  return s === 'piszkozat' || s === 'visszakuldott';
}
