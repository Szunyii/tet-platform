/**
 * A riport űrlap tiszta validátora (FormData → típusos input + elfogadott fájlok).
 * Nincs React, nincs DB. Minden hibát egy menetben gyűjtünk; a kulcsok a mezőnevek
 * (= a mezők DOM id-ja, hogy a fókusz az első hibás mezőre ugorhasson), a `form` kulcs
 * az űrlap-szintű hibáé, a `csatolmany` a fájloké.
 */
import { ervenyesNaptariDatum } from './datum';
import {
  CSATOLMANY_LIMIT,
  formatMeret,
  HELYSZIN_MAX,
  isKategoriaKulcs,
  isKulcsszo,
  kategoriaByKulcs,
  KULCSSZO_MAX,
  KULCSSZO_RAW_MAX,
  LEIRAS_MAX,
  mimeFromFajlnev,
  SZOVEG_MAX,
  TARGY_MAX,
  tisztitFajlnev,
  type KategoriaKulcs,
  type Kulcsszo,
} from './riport-szotar';
import { mezo, type MezoHibak } from './urlap';

export interface RiportInput {
  kategoria: KategoriaKulcs;
  targy: string;
  leiras: string;
  kulcsszavak: Kulcsszo[];
  esemenyDatum: string | null;
  esemenyHelyszin: string | null;
  joGyakorlat: string | null;
  kapcsolodoFeladat: string | null;
}

/** Kompatibilitási alias: a hibatérkép-típus a közös `lib/urlap.ts`-ből jön. */
export type RiportErrors = MezoHibak;

export interface ElfogadottFajl {
  file: File;
  mime: string;
  /** Tisztított fájlnév (útvonal, vezérlő- és láthatatlan karakterek nélkül). */
  nev: string;
}

export type ParseRiportResult =
  | { ok: true; data: RiportInput; fajlok: ElfogadottFajl[]; torlendoCsatolmanyIdk: string[] }
  | { ok: false; errors: RiportErrors };

function opcionalis(fd: FormData, key: string, max: number, cimke: string, errors: RiportErrors): string | null {
  const v = mezo(fd, key);
  if (!v) return null;
  if (v.length > max) errors[key] = `${cimke} legfeljebb ${max} karakter.`;
  return v;
}

function parseKulcsszavak(raw: string, errors: RiportErrors): Kulcsszo[] {
  if (raw.length > KULCSSZO_RAW_MAX) {
    errors.kulcsszavak = 'Érvénytelen kulcsszó-lista.';
    return [];
  }
  let lista: unknown;
  try {
    lista = raw ? JSON.parse(raw) : [];
  } catch {
    errors.kulcsszavak = 'Érvénytelen kulcsszó-lista.';
    return [];
  }
  if (!Array.isArray(lista) || !lista.every((x) => typeof x === 'string')) {
    errors.kulcsszavak = 'Érvénytelen kulcsszó-lista.';
    return [];
  }
  const egyedi = [...new Set(lista as string[])];
  if (egyedi.length === 0) {
    errors.kulcsszavak = 'Legalább egy kulcsszó kötelező.';
    return [];
  }
  if (egyedi.length > KULCSSZO_MAX) {
    errors.kulcsszavak = `Legfeljebb ${KULCSSZO_MAX} kulcsszó adható meg.`;
    return [];
  }
  const ismeretlen = egyedi.filter((k) => !isKulcsszo(k));
  if (ismeretlen.length > 0) {
    errors.kulcsszavak = 'Csak a listából választható kulcsszó.';
    return [];
  }
  return egyedi as Kulcsszo[];
}

/**
 * A böngésző üres file-inputnál helykitöltő File-t küld: üres névvel és 0 mérettel (a React
 * server action kódolásában a neve a `"undefined"` string). Ezt nem tekintjük fájlnak. A
 * valódi, névvel rendelkező 0 bájtos fájlt a `parseFajlok` utasítja el külön hibaüzenettel.
 */
function valodiFajlok(fd: FormData, key: string): File[] {
  return fd
    .getAll(key)
    .filter((v): v is File => v instanceof File && !(v.size === 0 && (v.name === '' || v.name === 'undefined')));
}

/** Hibaüzenetbe való, max. ~80 karakterre vágott fájlnév. */
function nevHibahoz(nev: string): string {
  return nev.length > 80 ? `${nev.slice(0, 80)}…` : nev;
}

function parseFajlok(fajlok: File[], meglevoDb: number, errors: RiportErrors): ElfogadottFajl[] {
  const { maxDarab, maxMeret } = CSATOLMANY_LIMIT;
  if (meglevoDb + fajlok.length > maxDarab) {
    errors.csatolmany = `Legfeljebb ${maxDarab} csatolmány lehet egy bejegyzésen.`;
    return [];
  }
  const elfogadott: ElfogadottFajl[] = [];
  for (const file of fajlok) {
    const nev = tisztitFajlnev(file.name);
    if (file.size === 0) {
      errors.csatolmany = `Üres fájl: ${nevHibahoz(nev)}.`;
      return [];
    }
    const mime = mimeFromFajlnev(nev);
    if (!mime) {
      errors.csatolmany = `Nem engedélyezett fájltípus: ${nevHibahoz(nev)}. Engedett: PDF, Word, Excel, PowerPoint, PNG, JPG.`;
      return [];
    }
    if (file.size > maxMeret) {
      errors.csatolmany = `Túl nagy fájl: ${nevHibahoz(nev)} (max. ${formatMeret(maxMeret)}).`;
      return [];
    }
    elfogadott.push({ file, mime, nev });
  }
  return elfogadott;
}

/**
 * Kliens-oldali előellenőrzés a csatolmányokra: ugyanazokat a korlátokat nézi, mint a
 * `parseFajlok`, de a beküldés előtt, azonnali visszajelzéshez. A szerver-oldali
 * ellenőrzés ettől függetlenül lefut.
 *
 * @param fajlok a most kiválasztott (még be nem küldött) fájlok
 * @param meglevoDb a bejegyzésen megmaradó, korábban feltöltött csatolmányok száma
 */
export function csatolmanyElocheck(fajlok: File[], meglevoDb: number): string | null {
  const { maxDarab, maxMeret } = CSATOLMANY_LIMIT;
  if (meglevoDb + fajlok.length > maxDarab) return `Legfeljebb ${maxDarab} csatolmány lehet egy bejegyzésen.`;
  for (const f of fajlok) {
    // Ugyanazzal a tisztított névvel dolgozunk, mint a `parseFajlok`, hogy az előcheck és a
    // szerver-oldali ellenőrzés (kiterjesztés, hibaüzenet) egybevágjon.
    const nev = tisztitFajlnev(f.name);
    if (f.size === 0) return `Üres fájl: ${nevHibahoz(nev)}.`;
    if (!mimeFromFajlnev(nev)) return `Nem engedélyezett fájltípus: ${nevHibahoz(nev)}.`;
    if (f.size > maxMeret) return `Túl nagy fájl: ${nevHibahoz(nev)} (max. ${formatMeret(maxMeret)}).`;
  }
  return null;
}

/**
 * @param meglevoCsatolmanyIdk szerkesztésnél a már tárolt csatolmányok id-jai (a limitbe
 *   csak a ténylegesen létező, meg nem jelölt id-k számítanak bele); létrehozásnál üres lista.
 */
export function parseRiportForm(
  fd: FormData,
  meglevoCsatolmanyIdk: readonly string[] = [],
): ParseRiportResult {
  const errors: RiportErrors = {};

  const kategoriaRaw = mezo(fd, 'kategoria');
  const kategoria = isKategoriaKulcs(kategoriaRaw) ? kategoriaRaw : null;
  if (!kategoria) errors.kategoria = 'Válassz kategóriát.';

  const targy = mezo(fd, 'targy');
  if (!targy) errors.targy = 'A tárgy kötelező.';
  else if (targy.length > TARGY_MAX) errors.targy = `A tárgy legfeljebb ${TARGY_MAX} karakter.`;

  const leiras = mezo(fd, 'leiras');
  if (!leiras) errors.leiras = 'A leírás kötelező.';
  else if (leiras.length > LEIRAS_MAX) errors.leiras = `A leírás legfeljebb ${LEIRAS_MAX} karakter.`;

  const kulcsszavak = parseKulcsszavak(mezo(fd, 'kulcsszavak'), errors);

  let esemenyDatum: string | null = null;
  let esemenyHelyszin: string | null = null;
  if (kategoria && kategoriaByKulcs(kategoria).datumKotelezo) {
    const d = mezo(fd, 'esemenyDatum');
    if (!d) errors.esemenyDatum = 'Rendezvénynél a dátum kötelező.';
    else if (!ervenyesNaptariDatum(d)) errors.esemenyDatum = 'Érvénytelen dátum.';
    else esemenyDatum = d;
    const h = mezo(fd, 'esemenyHelyszin');
    if (!h) errors.esemenyHelyszin = 'Rendezvénynél a helyszín kötelező.';
    else if (h.length > HELYSZIN_MAX) errors.esemenyHelyszin = `A helyszín legfeljebb ${HELYSZIN_MAX} karakter.`;
    else esemenyHelyszin = h;
  }

  const joGyakorlat = opcionalis(fd, 'joGyakorlat', SZOVEG_MAX, 'A jó gyakorlat', errors);
  const kapcsolodoFeladat = opcionalis(fd, 'kapcsolodoFeladat', SZOVEG_MAX, 'A kapcsolódó feladat', errors);

  const meglevoSet = new Set(meglevoCsatolmanyIdk);
  const torlendoRaw = fd
    .getAll('torlendoCsatolmany')
    .filter((v): v is string => typeof v === 'string' && v.length > 0);
  const torlendoSet = new Set(torlendoRaw.filter((id) => meglevoSet.has(id)));
  const torlendoCsatolmanyIdk = [...torlendoSet];
  const megmarado = meglevoCsatolmanyIdk.length - torlendoSet.size;
  const fajlok = parseFajlok(valodiFajlok(fd, 'csatolmany'), megmarado, errors);

  if (Object.keys(errors).length > 0 || !kategoria) return { ok: false, errors };
  return {
    ok: true,
    data: { kategoria, targy, leiras, kulcsszavak, esemenyDatum, esemenyHelyszin, joGyakorlat, kapcsolodoFeladat },
    fajlok,
    torlendoCsatolmanyIdk,
  };
}
