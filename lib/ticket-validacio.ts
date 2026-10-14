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

export interface UjTicketCimzett {
  id: string;
  /** A címzett székhely-országa (a ticket `orszag` pillanatképe). */
  orszag: string;
}

export interface UjTicketInput {
  /** Legalább egy címzett, ismétlés nélkül, a jelöltlista sorrendjében. */
  cimzettek: UjTicketCimzett[];
  tipus: TipusKulcs;
  prio: PrioKulcs;
  hatarido: string | null;
  targy: string;
  szoveg: string;
}

/**
 * Hibánál az `elavultCimzett` jelzi, hogy a beküldött címzettek között a jelöltlistán már nem
 * szereplő is volt (közben letiltották, vagy megszűnt a székhelye): az action ilyenkor a
 * layoutot is revalidálja, hogy a dialógus listája frissüljön.
 */
export type ParseUjTicketResult =
  | { ok: true; data: UjTicketInput }
  | { ok: false; errors: MezoHibak; elavultCimzett: boolean };
export type ParseUzenetResult = { ok: true; szoveg: string } | { ok: false; errors: MezoHibak };

// A `kulcs` a mező neve és a hiba kulcsa is: a válasz-űrlap és az új-ticket dialógus egy
// oldalon él, az id-k (és így a hibakulcsok) nem ütközhetnek – a válasz mezőneve `valasz`.
function parseSzoveg(fd: FormData, errors: MezoHibak, kulcs: 'szoveg' | 'valasz' = 'szoveg'): string {
  const szoveg = mezo(fd, kulcs);
  if (!szoveg) errors[kulcs] = 'Az üzenet kötelező.';
  else if (szoveg.length > UZENET_MAX) errors[kulcs] = `Az üzenet legfeljebb ${UZENET_MAX} karakter.`;
  return szoveg;
}

export function parseUjTicketForm(fd: FormData, jeloltek: readonly CimzettJelolt[]): ParseUjTicketResult {
  const errors: MezoHibak = {};

  // Bejelölős lista: minden kijelölt attasé egy `cimzettId` mező. Csak nem üres string, ismétlés nélkül.
  const kert = new Set(
    fd
      .getAll('cimzettId')
      .filter((v): v is string => typeof v === 'string')
      .map((v) => v.trim())
      .filter(Boolean),
  );
  const cimzettek = jeloltek.filter((j) => kert.has(j.id)).map((j) => ({ id: j.id, orszag: j.orszag }));
  const elavult = kert.size - cimzettek.length;
  if (jeloltek.length === 0) {
    errors.form = 'Nincs címezhető attasé.';
  } else if (kert.size === 0) {
    errors.cimzettId = 'Válassz legalább egy címzettet.';
  } else if (elavult > 0) {
    errors.cimzettId = `A kijelöltek közül ${elavult} címzett már nem választható (nem attasé, tiltott, vagy nincs székhelye). A lista frissült, ellenőrizd a kijelölést.`;
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

  if (Object.keys(errors).length > 0 || !tipus || !prio) {
    return { ok: false, errors, elavultCimzett: elavult > 0 };
  }
  return {
    ok: true,
    data: { cimzettek, tipus, prio, hatarido: hataridoRaw || null, targy, szoveg },
  };
}

export function parseUzenetForm(fd: FormData): ParseUzenetResult {
  const errors: MezoHibak = {};
  const szoveg = parseSzoveg(fd, errors, 'valasz');
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, szoveg };
}
