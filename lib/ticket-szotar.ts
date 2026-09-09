/**
 * A ticket (kommunikáció) szótárai. Framework-mentes konstansok: a form, a validáció,
 * a lekérdezések és a lista ugyanebből dolgozik. A kulcsok kerülnek a DB-be.
 */

export const TIPUSOK = {
  adatkeres: { nev: 'Adatkérés' },
  feladat: { nev: 'Feladatkiosztás' },
  riport_visszajelzes: { nev: 'Riport-visszajelzés' },
  egyeztetes: { nev: 'Egyeztetés' },
} as const;
export type TipusKulcs = keyof typeof TIPUSOK;
export const TIPUS_KULCSOK = Object.keys(TIPUSOK) as TipusKulcs[];

export const PRIORITASOK = {
  magas: { nev: 'Magas' },
  kozepes: { nev: 'Közepes' },
  alacsony: { nev: 'Alacsony' },
} as const;
export type PrioKulcs = keyof typeof PRIORITASOK;
export const PRIO_KULCSOK = Object.keys(PRIORITASOK) as PrioKulcs[];

export const STATUSZOK = {
  nyitott: { nev: 'Nyitott' },
  valaszra_var: { nev: 'Válaszra vár' }, // az attasé következik
  folyamatban: { nev: 'Folyamatban' }, // az attasé válaszolt, az NIÜ következik
  lezart: { nev: 'Lezárt' },
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

export function isTipusKulcs(v: string): v is TipusKulcs {
  return Object.prototype.hasOwnProperty.call(TIPUSOK, v);
}
export function isPrioKulcs(v: string): v is PrioKulcs {
  return Object.prototype.hasOwnProperty.call(PRIORITASOK, v);
}
export function isStatuszKulcs(v: string): v is StatuszKulcs {
  return Object.prototype.hasOwnProperty.call(STATUSZOK, v);
}

/** `?sz=` érték → szűrő; ismeretlen vagy hiányzó → `aktiv`. */
export function parseSzuro(v: unknown): TicketSzuro {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(SZUROK, v) ? (v as TicketSzuro) : 'aktiv';
}

/** Az üzenet szerzőjének szerepe (pillanatkép a DB-ben). */
export type UzenetSzerep = 'admin' | 'attase';
