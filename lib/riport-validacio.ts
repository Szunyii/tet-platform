/**
 * A riport űrlap tiszta validátora (FormData → típusos input + elfogadott fájlok).
 * Nincs React, nincs DB. Minden hibát egy menetben gyűjtünk; a kulcsok a mezőnevek
 * (= a mezők DOM id-ja, hogy a fókusz az első hibás mezőre ugorhasson), a `form` kulcs
 * az űrlap-szintű hibáé, a `csatolmany` a fájloké.
 */
import {
  CSATOLMANY_LIMIT,
  HELYSZIN_MAX,
  isKategoriaKulcs,
  isKulcsszo,
  kategoriaByKulcs,
  kiterjesztes,
  KULCSSZO_MAX,
  LEIRAS_MAX,
  SZOVEG_MAX,
  TARGY_MAX,
  type KategoriaKulcs,
  type Kulcsszo,
} from './riport-szotar';

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

export type RiportErrors = Record<string, string>;

export interface ElfogadottFajl {
  file: File;
  mime: string;
}

export type ParseRiportResult =
  | { ok: true; data: RiportInput; fajlok: ElfogadottFajl[]; torlendoCsatolmanyIdk: string[] }
  | { ok: false; errors: RiportErrors };

const DATUM_RE = /^\d{4}-\d{2}-\d{2}$/;
const LATHATATLAN_RE = /[​-‍﻿]/g;

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v.replace(LATHATATLAN_RE, '').trim() : '';
}

function opcionalis(fd: FormData, key: string, max: number, cimke: string, errors: RiportErrors): string | null {
  const v = str(fd, key);
  if (!v) return null;
  if (v.length > max) errors[key] = `${cimke} legfeljebb ${max} karakter.`;
  return v;
}

function parseKulcsszavak(raw: string, errors: RiportErrors): Kulcsszo[] {
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

/** A böngésző üres file-inputnál üres nevű, 0 bájtos File-t küld: azt nem tekintjük fájlnak. */
function valodiFajlok(fd: FormData, key: string): File[] {
  return fd.getAll(key).filter((v): v is File => v instanceof File && v.name !== '' && v.size > 0);
}

function parseFajlok(fajlok: File[], meglevoDb: number, errors: RiportErrors): ElfogadottFajl[] {
  const { maxDarab, maxMeret, tipusok } = CSATOLMANY_LIMIT;
  if (meglevoDb + fajlok.length > maxDarab) {
    errors.csatolmany = `Legfeljebb ${maxDarab} csatolmány lehet egy bejegyzésen.`;
    return [];
  }
  const elfogadott: ElfogadottFajl[] = [];
  for (const file of fajlok) {
    const mime = tipusok[kiterjesztes(file.name)];
    if (!mime) {
      errors.csatolmany = `Nem engedélyezett fájltípus: ${file.name}. Engedett: PDF, Word, Excel, PowerPoint, PNG, JPG.`;
      return [];
    }
    if (file.size > maxMeret) {
      errors.csatolmany = `Túl nagy fájl: ${file.name} (max. 8 MB).`;
      return [];
    }
    elfogadott.push({ file, mime });
  }
  return elfogadott;
}

/**
 * @param meglevoCsatolmanyDb szerkesztésnél a már tárolt csatolmányok száma (a törlésre
 *   jelöltek nélkül számít bele a limitbe); létrehozásnál 0.
 */
export function parseRiportForm(fd: FormData, meglevoCsatolmanyDb = 0): ParseRiportResult {
  const errors: RiportErrors = {};

  const kategoriaRaw = str(fd, 'kategoria');
  const kategoria = isKategoriaKulcs(kategoriaRaw) ? kategoriaRaw : null;
  if (!kategoria) errors.kategoria = 'Válassz kategóriát.';

  const targy = str(fd, 'targy');
  if (!targy) errors.targy = 'A tárgy kötelező.';
  else if (targy.length > TARGY_MAX) errors.targy = `A tárgy legfeljebb ${TARGY_MAX} karakter.`;

  const leiras = str(fd, 'leiras');
  if (!leiras) errors.leiras = 'A leírás kötelező.';
  else if (leiras.length > LEIRAS_MAX) errors.leiras = `A leírás legfeljebb ${LEIRAS_MAX} karakter.`;

  const kulcsszavak = parseKulcsszavak(str(fd, 'kulcsszavak'), errors);

  let esemenyDatum: string | null = null;
  let esemenyHelyszin: string | null = null;
  if (kategoria && kategoriaByKulcs(kategoria).datumKotelezo) {
    const d = str(fd, 'esemenyDatum');
    if (!d) errors.esemenyDatum = 'Rendezvénynél a dátum kötelező.';
    else if (!DATUM_RE.test(d) || Number.isNaN(Date.parse(d))) errors.esemenyDatum = 'Érvénytelen dátum.';
    else esemenyDatum = d;
    const h = str(fd, 'esemenyHelyszin');
    if (!h) errors.esemenyHelyszin = 'Rendezvénynél a helyszín kötelező.';
    else if (h.length > HELYSZIN_MAX) errors.esemenyHelyszin = `A helyszín legfeljebb ${HELYSZIN_MAX} karakter.`;
    else esemenyHelyszin = h;
  }

  const joGyakorlat = opcionalis(fd, 'joGyakorlat', SZOVEG_MAX, 'A jó gyakorlat', errors);
  const kapcsolodoFeladat = opcionalis(fd, 'kapcsolodoFeladat', SZOVEG_MAX, 'A kapcsolódó feladat', errors);

  const torlendoCsatolmanyIdk = fd
    .getAll('torlendoCsatolmany')
    .filter((v): v is string => typeof v === 'string' && v.length > 0);
  const megmarado = Math.max(0, meglevoCsatolmanyDb - torlendoCsatolmanyIdk.length);
  const fajlok = parseFajlok(valodiFajlok(fd, 'csatolmany'), megmarado, errors);

  if (Object.keys(errors).length > 0 || !kategoria) return { ok: false, errors };
  return {
    ok: true,
    data: { kategoria, targy, leiras, kulcsszavak, esemenyDatum, esemenyHelyszin, joGyakorlat, kapcsolodoFeladat },
    fajlok,
    torlendoCsatolmanyIdk,
  };
}
