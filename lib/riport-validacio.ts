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
  INTEZKEDES_MAX,
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
import { mezo, type MezoHibak, type ParseResult } from './urlap';

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

export interface ElfogadottFajl {
  file: File;
  mime: string;
  /** Tisztított fájlnév (útvonal, vezérlő- és láthatatlan karakterek nélkül). */
  nev: string;
}

export type ParseRiportResult =
  | { ok: true; data: RiportInput; fajlok: ElfogadottFajl[]; torlendoCsatolmanyIdk: string[] }
  | { ok: false; errors: MezoHibak };

function opcionalis(fd: FormData, key: string, max: number, cimke: string, errors: MezoHibak): string | null {
  const v = mezo(fd, key);
  if (!v) return null;
  if (v.length > max) errors[key] = `${cimke} legfeljebb ${max} karakter.`;
  return v;
}

function parseKulcsszavak(raw: string, errors: MezoHibak): Kulcsszo[] {
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

/** Az üres file-input helykitöltő File-jának lehetséges nevei (lásd `valodiFajlok`). */
const HELYKITOLTO_NEVEK: ReadonlySet<string> = new Set(['', 'undefined', 'blob']);

/**
 * A böngésző üres file-inputnál helykitöltő File-t küld: üres névvel és 0 mérettel. A server
 * action kódolása után a neve a régebbi Reactben a `"undefined"` string, a React 19.2-ben a
 * névtelen blob alapneve, `"blob"`. Ezeket nem tekintjük fájlnak (a `CsatolmanyMezo` üres
 * listánál nevet sem ad a rejtett inputnak, így ott be sem kerül). Következmény: egy valódi,
 * pontosan `blob` nevű 0 bájtos fájl hiba helyett némán kimarad – a szerveren; a kliens-előellenőrzés ezt is jelzi – tartalma úgysincs. A más
 * nevű 0 bájtos fájlt a `parseFajlok` továbbra is elutasítja („Üres fájl”).
 */
function valodiFajlok(fd: FormData, key: string): File[] {
  return fd
    .getAll(key)
    .filter((v): v is File => v instanceof File && !(v.size === 0 && HELYKITOLTO_NEVEK.has(v.name)));
}

/** Hibaüzenetbe való, max. ~80 karakterre vágott fájlnév. */
function nevHibahoz(nev: string): string {
  return nev.length > 80 ? `${nev.slice(0, 80)}…` : nev;
}

/** A szerver-oldali típushiba vége: felsorolja az engedett típusokat (a kliens-előellenőrzésé nem). */
const ENGEDETT_TIPUSOK = ' Engedett: PDF, Word, Excel, PowerPoint, PNG, JPG.';

function darabHiba(meglevoDb: number, ujDb: number): string | null {
  const { maxDarab } = CSATOLMANY_LIMIT;
  return meglevoDb + ujDb > maxDarab ? `Legfeljebb ${maxDarab} csatolmány lehet egy bejegyzésen.` : null;
}

/**
 * Egy kiválasztott fájl a csatolmány-korlátokkal (üres, típus, méret): a `parseFajlok` és a
 * `csatolmanyElocheck` közös szabálya. A tisztított névvel dolgozik, hogy az előellenőrzés és a
 * szerver-oldali ellenőrzés (kiterjesztés, hibaüzenet) egybevágjon. `tipusUtotag` a típushiba vége.
 */
function ellenorizFajl(file: File, tipusUtotag: string): { ok: true; nev: string; mime: string } | { ok: false; hiba: string } {
  const nev = tisztitFajlnev(file.name);
  if (file.size === 0) return { ok: false, hiba: `Üres fájl: ${nevHibahoz(nev)}.` };
  const mime = mimeFromFajlnev(nev);
  if (!mime) return { ok: false, hiba: `Nem engedélyezett fájltípus: ${nevHibahoz(nev)}.${tipusUtotag}` };
  if (file.size > CSATOLMANY_LIMIT.maxMeret) {
    return { ok: false, hiba: `Túl nagy fájl: ${nevHibahoz(nev)} (max. ${formatMeret(CSATOLMANY_LIMIT.maxMeret)}).` };
  }
  return { ok: true, nev, mime };
}

function parseFajlok(fajlok: File[], meglevoDb: number, errors: MezoHibak): ElfogadottFajl[] {
  const tul = darabHiba(meglevoDb, fajlok.length);
  if (tul) {
    errors.csatolmany = tul;
    return [];
  }
  const elfogadott: ElfogadottFajl[] = [];
  for (const file of fajlok) {
    const e = ellenorizFajl(file, ENGEDETT_TIPUSOK);
    if (!e.ok) {
      errors.csatolmany = e.hiba;
      return [];
    }
    elfogadott.push({ file, mime: e.mime, nev: e.nev });
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
  const tul = darabHiba(meglevoDb, fajlok.length);
  if (tul) return tul;
  for (const f of fajlok) {
    const e = ellenorizFajl(f, '');
    if (!e.ok) return e.hiba;
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
  const errors: MezoHibak = {};

  const kategoriaRaw = mezo(fd, 'kategoria');
  const kategoria = isKategoriaKulcs(kategoriaRaw) ? kategoriaRaw : null;
  if (!kategoria) errors.kategoria = 'Válassz kategóriát.';

  const targy = mezo(fd, 'targy');
  if (!targy) errors.targy = 'A tárgy kötelező.';
  else if (targy.length > TARGY_MAX) errors.targy = `A tárgy legfeljebb ${TARGY_MAX} karakter.`;

  const leiras = mezo(fd, 'leiras');
  if (!leiras) errors.leiras = 'A vezetői összefoglaló kötelező.';
  else if (leiras.length > LEIRAS_MAX) errors.leiras = `A vezetői összefoglaló legfeljebb ${LEIRAS_MAX} karakter.`;

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

  const joGyakorlat = opcionalis(fd, 'joGyakorlat', SZOVEG_MAX, 'A fő üzenet, Mo. számára átvehető jó gyakorlat, javaslat', errors);
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

/**
 * A „Megtett intézkedés” dialógus validátora. Az üres (vagy csak térközből álló) szöveg a
 * törlést jelenti: `data: null`. A hibakulcs a mező DOM-id-ja (`intezkedes`). A hiányzó
 * (vagy fájl típusú) mező viszont nem „üres szöveg”, hanem hibás kérés: a törlés
 * visszavonhatatlan, ezért az ilyen kérés ne töröljön.
 */
export function parseIntezkedes(fd: FormData): ParseResult<string | null> {
  if (typeof fd.get('intezkedes') !== 'string') return { ok: false, errors: { form: 'Érvénytelen kérés.' } };
  const szoveg = mezo(fd, 'intezkedes');
  if (szoveg.length > INTEZKEDES_MAX) {
    return { ok: false, errors: { intezkedes: `A megtett intézkedés legfeljebb ${INTEZKEDES_MAX} karakter.` } };
  }
  return { ok: true, data: szoveg || null };
}
