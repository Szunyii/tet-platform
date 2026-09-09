/**
 * Tiszta validátorok az admin felhasználó-kezelő űrlapjaihoz (FormData → típusos input).
 * Nincs React, nincs DB. Minden hibát egy menetben gyűjtünk (egy üres űrlap az összes
 * mezőhibát visszaadja). A MezoHibak kulcsai a mezőnevek; a `form` kulcs a nem mezőhöz
 * kötött hibáké (a server action-ök használják). A szöveg-tisztítás (láthatatlan és
 * vezérlőkarakterek) a közös `lib/urlap.ts` `mezo()`-jából jön. Az e-mail trim + kisbetű
 * (a Better Auth is kisbetűsít); a jelszót szándékosan nem trimmeljük.
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

export interface UjFelhasznaloInput {
  nev: string;
  email: string;
  jelszo: string;
  szerepkor: Szerepkor;
  orszag: string | null;
}

export interface SzerkesztesInput {
  nev: string;
  szerepkor: Szerepkor;
  orszag: string | null;
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
  const orszag = validOrszag(mezo(fd, 'orszag'), szerepkor, errors);
  if (Object.keys(errors).length > 0 || !szerepkor) return { ok: false, errors };
  return { ok: true, data: { nev, email, jelszo, szerepkor, orszag } };
}

export function parseSzerkesztes(fd: FormData): ParseResult<SzerkesztesInput> {
  const errors: MezoHibak = {};
  const nev = mezo(fd, 'nev');
  validNev(nev, errors);
  const szerepkor = validSzerepkor(mezo(fd, 'szerepkor'), errors);
  const orszag = validOrszag(mezo(fd, 'orszag'), szerepkor, errors);
  if (Object.keys(errors).length > 0 || !szerepkor) return { ok: false, errors };
  return { ok: true, data: { nev, szerepkor, orszag } };
}

export function parseJelszo(fd: FormData): ParseResult<{ jelszo: string }> {
  const errors: MezoHibak = {};
  const jelszo = raw(fd, 'jelszo');
  validJelszo(jelszo, errors);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { jelszo } };
}
