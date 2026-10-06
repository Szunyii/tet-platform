/**
 * Tiszta validátorok az admin felhasználó-kezelő űrlapjaihoz (FormData → típusos input).
 * Nincs React, nincs DB. Minden hibát egy menetben gyűjtünk (egy üres űrlap az összes
 * mezőhibát visszaadja). A MezoHibak kulcsai a mezőnevek; a `form` kulcs a nem mezőhöz
 * kötött hibáké (a server action-ök használják). A szöveg-tisztítás (láthatatlan és
 * vezérlőkarakterek) a közös `lib/urlap.ts` `mezo()`-jából jön. Az e-mail trim + kisbetű
 * (a Better Auth is kisbetűsít); a jelszót szándékosan nem trimmeljük.
 * Az attasé országai (`lib/attase-orszag.ts`): kötelező székhely (`szekhely.orszag`,
 * `szekhely.varos`, `szekhely.reszterulet`, `szekhely.vezeto`) és opcionális régiós sorok
 * (`regio.<i>.orszag`, `regio.<i>.vezeto`); az ország a lib/orszagok.ts szótár ISO-kódja.
 * Adminnál az országok hiba nélkül üres listát adnak. A telefon és a kapcsolattartási e-mail
 * mindkét szerepkörnél opcionális.
 */
import { REGIO_MAX, RESZTERULET_MAX, VAROS_MAX, type AttaseOrszag } from './attase-orszag';
import { orszagByKod } from './orszagok';
import { mezo, type MezoHibak } from './urlap';

export const SZEREPKOROK = ['admin', 'attase'] as const;
export type Szerepkor = (typeof SZEREPKOROK)[number];

export const SZEREPKOR_CIMKE: Record<Szerepkor, string> = {
  admin: 'Admin (NIÜ)',
  attase: 'TéT attasé',
};

/** Mezőnév → hibaüzenet. A `form` kulcs az űrlap-szintű hibáé. A típus a közös `lib/urlap.ts`-ből jön. */
export type { MezoHibak };

/** Az elérhetőségek (mindkét szerepkörnél opcionálisak). */
export interface ElerhetosegAdatok {
  telefon: string | null;
  kapcsolatEmail: string | null;
}

export interface UjFelhasznaloInput extends ElerhetosegAdatok {
  nev: string;
  email: string;
  jelszo: string;
  szerepkor: Szerepkor;
  /** Attasénál a székhely és a régiós országok; adminnál üres. */
  orszagok: AttaseOrszag[];
}

export interface SzerkesztesInput extends ElerhetosegAdatok {
  nev: string;
  szerepkor: Szerepkor;
  orszagok: AttaseOrszag[];
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

export const TELEFON_MAX = 40;
/** RFC 5321 gyakorlati felső korlát; a telefon mintájára a kapcsolat-e-mailt is határoljuk. */
export const EMAIL_MAX = 254;
// Legalább egy számjegyet követel, hogy pl. a '()' vagy '-' önmagában ne menjen át.
const TELEFON_RE = /^(?=.*\d)[0-9+\-/() ]+$/;

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

function parseElerhetoseg(fd: FormData, errors: MezoHibak): ElerhetosegAdatok {
  return {
    telefon: validTelefon(mezo(fd, 'telefon'), errors),
    kapcsolatEmail: validKapcsolatEmail(mezo(fd, 'kapcsolatEmail').toLowerCase(), errors),
  };
}

const ORSZAG_LISTABOL = 'Válassz országot a listából.';

/**
 * Az attasé országai: a székhely kötelező (ország + opcionális város és részterület), a régiós
 * sorok közül az ország nélküli kimarad, a már szereplő ország hibás. Adminnál (és érvénytelen
 * szerepkörnél) üres lista, hiba nélkül. A bejelölt checkbox `on` értéket küld.
 */
function parseOrszagok(fd: FormData, szerepkor: Szerepkor | null, errors: MezoHibak): AttaseOrszag[] {
  if (szerepkor !== 'attase') return [];
  const sorok: AttaseOrszag[] = [];
  const kod = mezo(fd, 'szekhely.orszag');
  const varos = mezo(fd, 'szekhely.varos');
  const reszterulet = mezo(fd, 'szekhely.reszterulet');
  if (!kod) errors['szekhely.orszag'] = 'TéT attasénál a székhely országa kötelező.';
  else if (!orszagByKod(kod)) errors['szekhely.orszag'] = ORSZAG_LISTABOL;
  if (varos.length > VAROS_MAX) errors['szekhely.varos'] = `A város legfeljebb ${VAROS_MAX} karakter.`;
  if (reszterulet.length > RESZTERULET_MAX) {
    errors['szekhely.reszterulet'] = `A részterület legfeljebb ${RESZTERULET_MAX} karakter.`;
  }
  if (kod && orszagByKod(kod)) {
    sorok.push({
      kod,
      szekhely: true,
      vezeto: fd.get('szekhely.vezeto') === 'on',
      varos: varos || null,
      reszterulet: reszterulet || null,
    });
  }
  // A régiós sorok indexe folytonos (a dialógus a pozíció szerint nevez); a REGIO_MAX feletti rész hiba.
  for (let i = 0; fd.has(`regio.${i}.orszag`); i++) {
    if (i >= REGIO_MAX) {
      errors.form = `Legfeljebb ${REGIO_MAX} régiós ország adható meg.`;
      break;
    }
    const kulcs = `regio.${i}.orszag`;
    const k = mezo(fd, kulcs);
    if (!k) continue;
    if (!orszagByKod(k)) errors[kulcs] = ORSZAG_LISTABOL;
    else if (sorok.some((s) => s.kod === k)) errors[kulcs] = 'Ez az ország már szerepel.';
    else sorok.push({ kod: k, szekhely: false, vezeto: fd.get(`regio.${i}.vezeto`) === 'on', varos: null, reszterulet: null });
  }
  return sorok;
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
  const elerhetoseg = parseElerhetoseg(fd, errors);
  const orszagok = parseOrszagok(fd, szerepkor, errors);
  if (Object.keys(errors).length > 0 || !szerepkor) return { ok: false, errors };
  return { ok: true, data: { nev, email, jelszo, szerepkor, ...elerhetoseg, orszagok } };
}

export function parseSzerkesztes(fd: FormData): ParseResult<SzerkesztesInput> {
  const errors: MezoHibak = {};
  const nev = mezo(fd, 'nev');
  validNev(nev, errors);
  const szerepkor = validSzerepkor(mezo(fd, 'szerepkor'), errors);
  const elerhetoseg = parseElerhetoseg(fd, errors);
  const orszagok = parseOrszagok(fd, szerepkor, errors);
  if (Object.keys(errors).length > 0 || !szerepkor) return { ok: false, errors };
  return { ok: true, data: { nev, szerepkor, ...elerhetoseg, orszagok } };
}

export function parseJelszo(fd: FormData): ParseResult<{ jelszo: string }> {
  const errors: MezoHibak = {};
  const jelszo = raw(fd, 'jelszo');
  validJelszo(jelszo, errors);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { jelszo } };
}
