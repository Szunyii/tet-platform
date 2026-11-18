/**
 * Az értékelési űrlapok (szempont, összminősítés, kihagyás) tiszta validátorai: FormData → típusos input.
 * Nincs React, nincs DB. A hibák kulcsa a mező neve (= a mező DOM id-ja, hogy a fókusz az első hibás mezőre
 * ugorhasson); a `form` kulcs az űrlap-szintű hibáé. A fokozatot mindig az admin adja: a validátor csak a
 * formát és a kötelezőséget ellenőrzi, értéket nem számol.
 */
import {
  INDOKLAS_MAX,
  isFokozat,
  isOsszFokozat,
  isSzempontKulcs,
  MEGFELEL,
  type Fokozat,
  type OsszFokozat,
  type SzempontKulcs,
} from './ertekeles-szotar';
import { mezo, type MezoHibak, type ParseResult } from './urlap';

export interface SzempontInput {
  szempont: SzempontKulcs;
  fokozat: Fokozat;
  /** `null`: nincs indoklás (csak „Megfelel” fokozatnál lehet). */
  indoklas: string | null;
  /** A szerkesztő megnyitásakori verzió (a minősítés `updatedAt`-ja ms-ban); `null`: új minősítés. */
  verzio: number | null;
}

export interface OsszInput {
  fokozat: OsszFokozat;
  indoklas: string;
  fejlesztesiCel: string | null;
  verzio: number | null;
}

const HIBAS_KERES: MezoHibak = { form: 'Hibás kérés.' };

/**
 * A `verzio` rejtett mező értéke: üres → `null` (még nincs mentett minősítés), pozitív egész → a verzió.
 * Minden más (szöveg, tizedes, negatív, nulla, vezető nullák) hibás kérés, `undefined`.
 */
function parseVerzio(fd: FormData): number | null | undefined {
  const raw = mezo(fd, 'verzio');
  if (!raw) return null;
  if (!/^[1-9]\d*$/.test(raw)) return undefined;
  const n = Number(raw);
  return Number.isSafeInteger(n) ? n : undefined;
}

/** Az indoklás hossz-ellenőrzése; a hibakulcs a mező neve. */
function hosszHiba(szoveg: string, cimke: string): string | null {
  return szoveg.length > INDOKLAS_MAX ? `${cimke} legfeljebb ${INDOKLAS_MAX} karakter lehet.` : null;
}

/** A fokozat mező értéke egyetlen számjegyként (az üres, a `1.0` vagy a szóközös érték nem fokozat). */
function parseFokozatSzam(fd: FormData): number | null {
  const raw = mezo(fd, 'fokozat');
  return /^[0-4]$/.test(raw) ? Number(raw) : null;
}

/**
 * Egy szempont minősítése. Az indoklás kötelező, kivéve a „Megfelel” fokozatot; a „Nem értékelhető” is
 * indoklást kér. A hiányzó vagy ismeretlen szempont és a hibás verzió nem felhasználói hiba, hanem hibás kérés.
 */
export function parseSzempontForm(fd: FormData): ParseResult<SzempontInput> {
  const szempont = mezo(fd, 'szempont');
  const verzio = parseVerzio(fd);
  if (!isSzempontKulcs(szempont) || verzio === undefined) return { ok: false, errors: { ...HIBAS_KERES } };

  const errors: MezoHibak = {};
  const fokozatSzam = parseFokozatSzam(fd);
  const fokozat = fokozatSzam !== null && isFokozat(fokozatSzam) ? fokozatSzam : null;
  if (fokozat === null) errors.fokozat = 'Válassz fokozatot.';

  const indoklas = mezo(fd, 'indoklas');
  const hossz = hosszHiba(indoklas, 'Az indoklás');
  if (hossz) errors.indoklas = hossz;
  else if (!indoklas && fokozat !== null && fokozat !== MEGFELEL) {
    errors.indoklas = 'Az indoklás kötelező ennél a fokozatnál.';
  }

  if (Object.keys(errors).length > 0 || fokozat === null) return { ok: false, errors };
  return { ok: true, data: { szempont, fokozat, indoklas: indoklas || null, verzio } };
}

/**
 * Az összminősítés (1–4). Az indoklás mindig kötelező, a fejlesztési cél a „Részben megfelel” és a
 * „Fejlesztendő” fokozatnál; egyébként opcionális. Hogy mind az öt szempont minősítve van-e, az action
 * ellenőrzi (a lekérdezés tudja), itt csak az űrlap formája számít.
 */
export function parseOsszForm(fd: FormData): ParseResult<OsszInput> {
  const verzio = parseVerzio(fd);
  if (verzio === undefined) return { ok: false, errors: { ...HIBAS_KERES } };

  const errors: MezoHibak = {};
  const fokozatSzam = parseFokozatSzam(fd);
  const fokozat = fokozatSzam !== null && isOsszFokozat(fokozatSzam) ? fokozatSzam : null;
  if (fokozat === null) errors.fokozat = 'Válassz fokozatot.';

  const indoklas = mezo(fd, 'indoklas');
  if (!indoklas) errors.indoklas = 'Az indoklás kötelező.';
  else {
    const hossz = hosszHiba(indoklas, 'Az indoklás');
    if (hossz) errors.indoklas = hossz;
  }

  const fejlesztesiCel = mezo(fd, 'fejlesztesiCel');
  const celHossz = hosszHiba(fejlesztesiCel, 'A fejlesztési cél');
  if (celHossz) errors.fejlesztesiCel = celHossz;
  else if (!fejlesztesiCel && fokozat !== null && fokozat <= 2) {
    errors.fejlesztesiCel = 'A fejlesztési cél kötelező ennél az összminősítésnél.';
  }

  if (Object.keys(errors).length > 0 || fokozat === null) return { ok: false, errors };
  return { ok: true, data: { fokozat, indoklas, fejlesztesiCel: fejlesztesiCel || null, verzio } };
}

/** Az attasé kihagyása a félévből: az indoklás kötelező. Az adat `ok` mezője a kihagyás oka. */
export function parseKihagyasForm(fd: FormData): ParseResult<{ ok: string }> {
  const oka = mezo(fd, 'kimaradasOka');
  if (!oka) return { ok: false, errors: { kimaradasOka: 'A kihagyás indoklása kötelező.' } };
  const hossz = hosszHiba(oka, 'A kihagyás indoklása');
  if (hossz) return { ok: false, errors: { kimaradasOka: hossz } };
  return { ok: true, data: { ok: oka } };
}
