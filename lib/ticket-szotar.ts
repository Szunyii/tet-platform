/**
 * A ticket (kommunikáció) szótárai. Framework-mentes konstansok: a form, a validáció,
 * a lekérdezések és a lista ugyanebből dolgozik. A kulcsok kerülnek a DB-be.
 */

export const TIPUSOK = {
  adatkeres: 'Adatkérés',
  feladat: 'Feladatkiosztás',
  riport_visszajelzes: 'Riport-visszajelzés',
  egyeztetes: 'Egyeztetés',
} as const;
export type TipusKulcs = keyof typeof TIPUSOK;

export const PRIORITASOK = {
  magas: 'Magas',
  kozepes: 'Közepes',
  alacsony: 'Alacsony',
} as const;
export type PrioKulcs = keyof typeof PRIORITASOK;

export const STATUSZOK = {
  nyitott: 'Nyitott',
  valaszra_var: 'Válaszra vár', // az attasé következik
  folyamatban: 'Folyamatban', // az attasé válaszolt, az NIÜ következik
  lezart: 'Lezárt',
} as const;
export type StatuszKulcs = keyof typeof STATUSZOK;

/** A lista szűrője (?sz=). */
export const SZUROK = {
  aktiv: 'Aktív',
  magas: 'Magas prioritás',
  mind: 'Mind',
} as const;
export type TicketSzuro = keyof typeof SZUROK;
export const SZURO_KULCSOK = Object.keys(SZUROK) as TicketSzuro[];

export const TARGY_MAX = 200;
export const UZENET_MAX = 4000;

/** Az admin által választható címzett: nem tiltott attasé, akinek van országa. */
export interface CimzettJelolt {
  id: string;
  nev: string;
  orszag: string;
}

/**
 * Az üzenet szerzőjének szerepe: a DB-ben tárolt pillanatkép a küldés pillanatáról.
 * Tudatosan nem az élő auth-szerepből (`AppRole`, `lib/session.ts`) származik, hogy a
 * szótár framework- és DB-mentes maradjon, és hogy a szerep utólagos módosítása (pl.
 * admin → attasé) ne írja át a már elküldött üzenetek megjelenített szerzőjét.
 */
export type UzenetSzerep = 'admin' | 'attase';

/** Lejárt-e a határidő: naptári nap string-összehasonlítás (YYYY-MM-DD), lezárt ticketnél soha. */
export function lejartE(hatarido: string | null, statusz: StatuszKulcs, ma: string): boolean {
  return Boolean(hatarido && hatarido < ma && statusz !== 'lezart');
}

export function isTipusKulcs(v: string): v is TipusKulcs {
  return Object.prototype.hasOwnProperty.call(TIPUSOK, v);
}
export function isPrioKulcs(v: string): v is PrioKulcs {
  return Object.prototype.hasOwnProperty.call(PRIORITASOK, v);
}

/** `?sz=` érték → szűrő; ismeretlen, hiányzó vagy tömb (több `sz=`) → az első elem, egyébként `aktiv`. */
export function parseSzuro(v: string | string[] | undefined): TicketSzuro {
  const elso = Array.isArray(v) ? v[0] : v;
  return typeof elso === 'string' && Object.prototype.hasOwnProperty.call(SZUROK, elso) ? (elso as TicketSzuro) : 'aktiv';
}
