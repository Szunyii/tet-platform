/**
 * A ticket űrlapok tiszta validátorai (FormData → típusos input). Nincs React, nincs DB.
 * A hibák kulcsa a mező neve (= a mező DOM id-ja, hogy a fókusz az első hibás mezőre
 * ugorhasson), a `form` kulcs az űrlap-szintű hibáé.
 */
import { ervenyesNaptariDatum } from './datum';
import {
  isPrioKulcs,
  isTipusKulcs,
  TARGY_MAX,
  UZENET_MAX,
  type CimzettJelolt,
  type PrioKulcs,
  type TipusKulcs,
} from './ticket-szotar';
import { mezo, type MezoHibak } from './urlap';

export interface UjTicketInput {
  cimzettId: string;
  orszag: string;
  tipus: TipusKulcs;
  prio: PrioKulcs;
  hatarido: string | null;
  targy: string;
  szoveg: string;
}

export type ParseUjTicketResult = { ok: true; data: UjTicketInput } | { ok: false; errors: MezoHibak };
export type ParseUzenetResult = { ok: true; szoveg: string } | { ok: false; errors: MezoHibak };

function parseSzoveg(fd: FormData, errors: MezoHibak): string {
  const szoveg = mezo(fd, 'szoveg');
  if (!szoveg) errors.szoveg = 'Az üzenet kötelező.';
  else if (szoveg.length > UZENET_MAX) errors.szoveg = `Az üzenet legfeljebb ${UZENET_MAX} karakter.`;
  return szoveg;
}

export function parseUjTicketForm(fd: FormData, jeloltek: readonly CimzettJelolt[]): ParseUjTicketResult {
  const errors: MezoHibak = {};

  const cimzettId = mezo(fd, 'cimzettId');
  const cimzett = jeloltek.find((j) => j.id === cimzettId);
  if (jeloltek.length === 0) {
    errors.form = 'Nincs címezhető attasé.';
  } else if (!cimzettId) {
    errors.cimzettId = 'Válassz címzettet.';
  } else if (!cimzett) {
    errors.cimzettId = 'A címzett nem választható (nem attasé, tiltott, vagy nincs országa).';
  }

  const tipusRaw = mezo(fd, 'tipus');
  const tipus = isTipusKulcs(tipusRaw) ? tipusRaw : null;
  if (!tipus) errors.tipus = 'Válassz típust.';

  const prioRaw = mezo(fd, 'prio');
  const prio = isPrioKulcs(prioRaw) ? prioRaw : null;
  if (!prio) errors.prio = 'Válassz prioritást.';

  const hataridoRaw = mezo(fd, 'hatarido');
  if (hataridoRaw && !ervenyesNaptariDatum(hataridoRaw)) errors.hatarido = 'Érvénytelen dátum.';

  const targy = mezo(fd, 'targy');
  if (!targy) errors.targy = 'A tárgy kötelező.';
  else if (targy.length > TARGY_MAX) errors.targy = `A tárgy legfeljebb ${TARGY_MAX} karakter.`;

  const szoveg = parseSzoveg(fd, errors);

  if (Object.keys(errors).length > 0 || !cimzett || !tipus || !prio) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    data: {
      cimzettId: cimzett.id,
      orszag: cimzett.orszag,
      tipus,
      prio,
      hatarido: hataridoRaw || null,
      targy,
      szoveg,
    },
  };
}

export function parseUzenetForm(fd: FormData): ParseUzenetResult {
  const errors: MezoHibak = {};
  const szoveg = parseSzoveg(fd, errors);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, szoveg };
}
