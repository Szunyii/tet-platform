/**
 * A munkaterv-űrlapok tiszta validátorai: FormData → típusos input. Nincs React, nincs DB. A hibák kulcsa a mező
 * neve (= a mező DOM id-ja, hogy a fókusz az első hibás mezőre ugorhasson). Az ország mezője `orszag`, mint a
 * tevékenység-űrlapokon; a hívó adja az attasé aktuális országait.
 */
import { isSzempontKulcs, type SzempontKulcs } from './ertekeles-szotar';
import {
  isCelAllapot,
  isHatokor,
  MEGJEGYZES_MAX,
  MEGNEVEZES_MAX,
  MERCE_MAX,
  type CelAllapot,
  type Hatokor,
} from './munkaterv-szotar';
import { mezo, type MezoHibak, type ParseResult } from './urlap';

export interface CelInput {
  megnevezes: string;
  orszagKod: string;
  szempont: SzempontKulcs;
  merce: string;
}

export interface KozpontiCelInput {
  megnevezes: string;
  szempont: SzempontKulcs;
  merce: string;
  hatokor: Hatokor;
}

export interface CelAllapotInput {
  allapot: CelAllapot;
  megjegyzes: string | null;
}

/** Kötelező, legfeljebb `max` karakteres szöveg; a hibát az `errors[kulcs]`-ba írja, az értéket visszaadja. */
function kotelezo(fd: FormData, kulcs: string, max: number, hianyHiba: string, hosszHiba: string, errors: MezoHibak): string {
  const v = mezo(fd, kulcs);
  if (!v) errors[kulcs] = hianyHiba;
  else if (v.length > max) errors[kulcs] = hosszHiba;
  return v;
}

function megnevezesMezo(fd: FormData, errors: MezoHibak): string {
  return kotelezo(fd, 'megnevezes', MEGNEVEZES_MAX, 'A megnevezés kötelező.', `A megnevezés legfeljebb ${MEGNEVEZES_MAX} karakter lehet.`, errors);
}

function merceMezo(fd: FormData, errors: MezoHibak): string {
  return kotelezo(fd, 'merce', MERCE_MAX, 'A mérce megadása kötelező.', `A mérce legfeljebb ${MERCE_MAX} karakter lehet.`, errors);
}

function szempontMezo(fd: FormData, errors: MezoHibak): SzempontKulcs | null {
  const v = mezo(fd, 'szempont');
  if (isSzempontKulcs(v)) return v;
  errors.szempont = 'Válassz értékelési szempontot.';
  return null;
}

/** Egy cél a tervben. `orszagok` az attasé aktuális országainak kódjai. */
export function parseCelForm(fd: FormData, orszagok: readonly string[]): ParseResult<CelInput> {
  const errors: MezoHibak = {};
  const megnevezes = megnevezesMezo(fd, errors);
  const orszagKod = mezo(fd, 'orszag');
  if (!orszagok.includes(orszagKod)) errors.orszag = 'Válassz a saját országaid közül.';
  const szempont = szempontMezo(fd, errors);
  const merce = merceMezo(fd, errors);

  if (Object.keys(errors).length > 0 || !szempont) return { ok: false, errors };
  return { ok: true, data: { megnevezes, orszagKod, szempont, merce } };
}

/** Egy központi cél: a hatókör a teljes hálózat vagy egy régió. */
export function parseKozpontiCelForm(fd: FormData): ParseResult<KozpontiCelInput> {
  const errors: MezoHibak = {};
  const megnevezes = megnevezesMezo(fd, errors);
  const szempont = szempontMezo(fd, errors);
  const merce = merceMezo(fd, errors);
  const hatokorRaw = mezo(fd, 'hatokor');
  const hatokor = isHatokor(hatokorRaw) ? hatokorRaw : null;
  if (!hatokor) errors.hatokor = 'Válaszd ki a hatókört.';

  if (Object.keys(errors).length > 0 || !szempont || !hatokor) return { ok: false, errors };
  return { ok: true, data: { megnevezes, szempont, merce, hatokor } };
}

/** A cél állapota opcionális megjegyzéssel (üres → `null`). */
export function parseCelAllapotForm(fd: FormData): ParseResult<CelAllapotInput> {
  const errors: MezoHibak = {};
  const allapotRaw = mezo(fd, 'allapot');
  const allapot = isCelAllapot(allapotRaw) ? allapotRaw : null;
  if (!allapot) errors.allapot = 'Válassz állapotot.';
  const megjegyzes = mezo(fd, 'megjegyzes');
  if (megjegyzes.length > MEGJEGYZES_MAX) errors.megjegyzes = `A megjegyzés legfeljebb ${MEGJEGYZES_MAX} karakter lehet.`;

  if (Object.keys(errors).length > 0 || !allapot) return { ok: false, errors };
  return { ok: true, data: { allapot, megjegyzes: megjegyzes || null } };
}

/** A kötelező szöveggel járó tervdöntések (visszaküldés, módosítás kérése, elutasítása, visszanyitás) közös űrlapja. */
export function parseTervMegjegyzesForm(fd: FormData): ParseResult<{ megjegyzes: string }> {
  const errors: MezoHibak = {};
  const megjegyzes = kotelezo(fd, 'megjegyzes', MEGJEGYZES_MAX, 'A megjegyzés kötelező.', `A megjegyzés legfeljebb ${MEGJEGYZES_MAX} karakter lehet.`, errors);

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { megjegyzes } };
}
