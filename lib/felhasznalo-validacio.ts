export const SZEREPKOROK = ['admin', 'attase'] as const;
export type Szerepkor = (typeof SZEREPKOROK)[number];

export const SZEREPKOR_CIMKE: Record<Szerepkor, string> = {
  admin: 'Admin (NIÜ)',
  attase: 'TéT attasé',
};

export type MezoHibak = Record<string, string>;

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v.trim() : '';
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

/** Attasénál kötelező, adminnál eldobjuk. */
function validOrszag(raw: string, szerepkor: Szerepkor | null, errors: MezoHibak): string | null {
  if (szerepkor === 'admin') return null;
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
  const nev = str(fd, 'nev');
  const email = str(fd, 'email').toLowerCase();
  const jelszo = typeof fd.get('jelszo') === 'string' ? (fd.get('jelszo') as string) : '';
  validNev(nev, errors);
  if (!email) errors.email = 'Az e-mail cím kötelező.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Érvénytelen e-mail cím.';
  validJelszo(jelszo, errors);
  const szerepkor = validSzerepkor(str(fd, 'szerepkor'), errors);
  const orszag = validOrszag(str(fd, 'orszag'), szerepkor, errors);
  if (Object.keys(errors).length > 0 || !szerepkor) return { ok: false, errors };
  return { ok: true, data: { nev, email, jelszo, szerepkor, orszag } };
}

export function parseSzerkesztes(fd: FormData): ParseResult<SzerkesztesInput> {
  const errors: MezoHibak = {};
  const nev = str(fd, 'nev');
  validNev(nev, errors);
  const szerepkor = validSzerepkor(str(fd, 'szerepkor'), errors);
  const orszag = validOrszag(str(fd, 'orszag'), szerepkor, errors);
  if (Object.keys(errors).length > 0 || !szerepkor) return { ok: false, errors };
  return { ok: true, data: { nev, szerepkor, orszag } };
}

export function parseJelszo(fd: FormData): ParseResult<{ jelszo: string }> {
  const errors: MezoHibak = {};
  const jelszo = typeof fd.get('jelszo') === 'string' ? (fd.get('jelszo') as string) : '';
  validJelszo(jelszo, errors);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { jelszo } };
}
