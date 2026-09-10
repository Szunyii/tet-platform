/**
 * Tiszta validátorok az admin felhasználó-kezelő űrlapjaihoz (FormData → típusos input).
 * Nincs React, nincs DB. Minden hibát egy menetben gyűjtünk (egy üres űrlap az összes
 * mezőhibát visszaadja). A MezoHibak kulcsai a mezőnevek; a `form` kulcs a nem mezőhöz
 * kötött hibáké (a server action-ök használják). A szöveg-tisztítás (láthatatlan és
 * vezérlőkarakterek) a közös `lib/urlap.ts` `mezo()`-jából jön. Az e-mail trim + kisbetű
 * (a Better Auth is kisbetűsít); a jelszót szándékosan nem trimmeljük.
 * A poszt-adatok (főváros, terület, pénznem) csak attasénál értelmezettek, adminnál
 * hiba nélkül null-ok; a telefon és a kapcsolattartási e-mail mindkét szerepkörnél opcionális.
 */
import { mezo, type MezoHibak } from './urlap';

export const SZEREPKOROK = ['admin', 'attase'] as const;
export type Szerepkor = (typeof SZEREPKOROK)[number];

export const SZEREPKOR_CIMKE: Record<Szerepkor, string> = {
  admin: 'Admin (NIÜ)',
  attase: 'TéT attasé',
};

/** Mezőnév → hibaüzenet. A `form` kulcs az űrlap-szintű hibáé. A típus a közös `lib/urlap.ts`-ből jön. */
export type { MezoHibak };

/** A poszt országának adatai (csak attasénál) és az attasé elérhetőségei (mindkét szerepkörnél). */
export interface AttaseAdatok {
  orszag: string | null;
  fovaros: string | null;
  /** km², pozitív egész. */
  terulet: number | null;
  penznem: string | null;
  telefon: string | null;
  kapcsolatEmail: string | null;
}

export interface UjFelhasznaloInput extends AttaseAdatok {
  nev: string;
  email: string;
  jelszo: string;
  szerepkor: Szerepkor;
}

export interface SzerkesztesInput extends AttaseAdatok {
  nev: string;
  szerepkor: Szerepkor;
}

export type ParseResult<T> = { ok: true; data: T } | { ok: false; errors: MezoHibak };

// Közel a Better Auth (zod) e-mail szabályához: nincs vezető/záró/dupla pont a helyi
// részben, a domain végén legalább 2 betűs TLD. Ami itt átmegy, de a Better Auth elutasít
// (pl. ékezetes cím), azt a server action INVALID_EMAIL hibaként az email mezőre teszi.
const EMAIL_RE = /^(?!.*\.\.)[^\s@.](?:[^\s@]*[^\s@.])?@[^\s@]+\.[A-Za-z]{2,}$/;

/** Nyers érték trim nélkül: a jelszóban a szóköz is értékes karakter. */
function raw(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v : '';
}

function validNev(nev: string, errors: MezoHibak) {
  if (!nev) errors.nev = 'A név kötelező.';
  else if (nev.length > 100) errors.nev = 'A név legfeljebb 100 karakter.';
}

function validJelszo(jelszo: string, errors: MezoHibak) {
  if (jelszo.length < 8) errors.jelszo = 'A jelszó legalább 8 karakter.';
  else if (jelszo.length > 128) errors.jelszo = 'A jelszó legfeljebb 128 karakter.';
}

function validSzerepkor(raw: string, errors: MezoHibak): Szerepkor | null {
  if ((SZEREPKOROK as readonly string[]).includes(raw)) return raw as Szerepkor;
  errors.szerepkor = 'Válassz szerepkört.';
  return null;
}

/** Attasénál kötelező; adminnál (és érvénytelen szerepkörnél) eldobjuk, hiba nélkül. */
function validOrszag(raw: string, szerepkor: Szerepkor | null, errors: MezoHibak): string | null {
  if (szerepkor !== 'attase') return null;
  if (!raw) {
    errors.orszag = 'TéT attasénál az ország kötelező.';
    return null;
  }
  if (raw.length > 100) {
    errors.orszag = 'Az ország legfeljebb 100 karakter.';
    return null;
  }
  return raw;
}

export const TELEFON_MAX = 40;
/** RFC 5321 gyakorlati felső korlát; a főváros/pénznem/telefon mintájára a kapcsolat-e-mailt is határoljuk. */
export const EMAIL_MAX = 254;
// Legalább egy számjegyet követel, hogy pl. a '()' vagy '-' önmagában ne menjen át.
const TELEFON_RE = /^(?=.*\d)[0-9+\-/() ]+$/;
const TERULET_HIBA = 'A terület pozitív egész szám legyen (km²).';

// Ezreselválasztó: szóköz, NBSP, keskeny NBSP vagy pont, csak 3-as csoportok között
// ('377 975', '17.098.246'); a tizedes pont ('2.02') így hibát ad, nem torzul 202-vé.
const TERULET_RE = /^\d{1,9}$|^\d{1,3}(?:[   .]\d{3}){1,2}$/;

const POSZT_CIMKE = { fovaros: 'főváros', penznem: 'pénznem' } as const;

/** Opcionális, ≤100 karakteres poszt-szöveg (főváros, pénznem); csak attasénál értelmezett. */
function validPosztSzoveg(
  raw: string,
  szerepkor: Szerepkor | null,
  kulcs: keyof typeof POSZT_CIMKE,
  errors: MezoHibak,
): string | null {
  if (szerepkor !== 'attase' || !raw) return null;
  if (raw.length > 100) {
    errors[kulcs] = `A ${POSZT_CIMKE[kulcs]} legfeljebb 100 karakter.`;
    return null;
  }
  return raw;
}

/** Terület km²-ben: pozitív egész; szóköz/NBSP/pont ezreselválasztóként, csak 3-as csoportokban. */
function validTerulet(raw: string, szerepkor: Szerepkor | null, errors: MezoHibak): number | null {
  if (szerepkor !== 'attase' || !raw) return null;
  if (!TERULET_RE.test(raw)) {
    errors.terulet = TERULET_HIBA;
    return null;
  }
  const n = Number(raw.replace(/[   .]/g, ''));
  if (n < 1) {
    errors.terulet = TERULET_HIBA;
    return null;
  }
  return n;
}

/** Telefon: mindkét szerepkörnél opcionális; legalább egy számjegy kell, csak megengedett jelekkel. */
function validTelefon(raw: string, errors: MezoHibak): string | null {
  if (!raw) return null;
  if (raw.length > TELEFON_MAX) {
    errors.telefon = `A telefonszám legfeljebb ${TELEFON_MAX} karakter.`;
    return null;
  }
  if (!TELEFON_RE.test(raw)) {
    errors.telefon = 'A telefonszám csak számjegyet, szóközt és + - / ( ) jelet tartalmazhat.';
    return null;
  }
  return raw;
}

/** Kapcsolattartási e-mail (a bejelentkezési e-mailtől független), kisbetűsítve. */
function validKapcsolatEmail(raw: string, errors: MezoHibak): string | null {
  if (!raw) return null;
  if (raw.length > EMAIL_MAX) {
    errors.kapcsolatEmail = `Az e-mail cím legfeljebb ${EMAIL_MAX} karakter.`;
    return null;
  }
  if (!EMAIL_RE.test(raw)) {
    errors.kapcsolatEmail = 'Érvénytelen e-mail cím.';
    return null;
  }
  return raw;
}

/** Az AttaseAdatok mezői egy menetben; a poszt-adatok adminnál hiba nélkül null-ok. */
function parseAttaseAdatok(fd: FormData, szerepkor: Szerepkor | null, errors: MezoHibak): AttaseAdatok {
  return {
    orszag: validOrszag(mezo(fd, 'orszag'), szerepkor, errors),
    fovaros: validPosztSzoveg(mezo(fd, 'fovaros'), szerepkor, 'fovaros', errors),
    terulet: validTerulet(mezo(fd, 'terulet'), szerepkor, errors),
    penznem: validPosztSzoveg(mezo(fd, 'penznem'), szerepkor, 'penznem', errors),
    telefon: validTelefon(mezo(fd, 'telefon'), errors),
    kapcsolatEmail: validKapcsolatEmail(mezo(fd, 'kapcsolatEmail').toLowerCase(), errors),
  };
}

export function parseUjFelhasznalo(fd: FormData): ParseResult<UjFelhasznaloInput> {
  const errors: MezoHibak = {};
  const nev = mezo(fd, 'nev');
  const email = mezo(fd, 'email').toLowerCase();
  const jelszo = raw(fd, 'jelszo');
  validNev(nev, errors);
  if (!email) errors.email = 'Az e-mail cím kötelező.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Érvénytelen e-mail cím.';
  validJelszo(jelszo, errors);
  const szerepkor = validSzerepkor(mezo(fd, 'szerepkor'), errors);
  const adatok = parseAttaseAdatok(fd, szerepkor, errors);
  if (Object.keys(errors).length > 0 || !szerepkor) return { ok: false, errors };
  return { ok: true, data: { nev, email, jelszo, szerepkor, ...adatok } };
}

export function parseSzerkesztes(fd: FormData): ParseResult<SzerkesztesInput> {
  const errors: MezoHibak = {};
  const nev = mezo(fd, 'nev');
  validNev(nev, errors);
  const szerepkor = validSzerepkor(mezo(fd, 'szerepkor'), errors);
  const adatok = parseAttaseAdatok(fd, szerepkor, errors);
  if (Object.keys(errors).length > 0 || !szerepkor) return { ok: false, errors };
  return { ok: true, data: { nev, szerepkor, ...adatok } };
}

export function parseJelszo(fd: FormData): ParseResult<{ jelszo: string }> {
  const errors: MezoHibak = {};
  const jelszo = raw(fd, 'jelszo');
  validJelszo(jelszo, errors);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { jelszo } };
}
