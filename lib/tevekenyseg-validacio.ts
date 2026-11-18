/**
 * A tevékenység- és eredmény-űrlapok tiszta validátorai: FormData → típusos input. Nincs React, nincs DB.
 * A hibák kulcsa a mező neve (= a mező DOM id-ja, hogy a fókusz az első hibás mezőre ugorhasson); a `form`
 * kulcs az űrlap-szintű hibáé. Hogy a beküldött jelentés- és eredmény-azonosító a beküldőé-e, a lekérdezés
 * ellenőrzi (itt csak a forma számít); az ország viszont itt: a hívó adja az attasé aktuális országait.
 */
import { ervenyesNaptariDatum } from './datum';
import {
  isHozzajarulas,
  isTevekenysegTipus,
  LINK_MAX,
  MAGYAR_SZEREPLO_MAX,
  MEGNEVEZES_MAX,
  PARTNER_MAX,
  SZOVEG_MAX,
  type Hozzajarulas,
  type TevekenysegTipus,
} from './tevekenyseg-szotar';
import { mezo, type MezoHibak, type ParseResult } from './urlap';

export interface TevekenysegInput {
  tipus: TevekenysegTipus;
  /** `YYYY-MM-DD`. */
  datum: string;
  orszagKod: string;
  megnevezes: string;
  partner: string;
  magyarSzereplo: string | null;
  leiras: string | null;
  riportId: string | null;
  eredmenyId: string | null;
}

export interface EredmenyInput {
  megnevezes: string;
  orszagKod: string;
  partner: string;
  magyarSzereplo: string | null;
  hozzajarulas: Hozzajarulas;
  leiras: string | null;
  kezdoSzakasz: 'lehetoseg' | 'kapcsolat';
}

export interface IgazolasKeresInput {
  indoklas: string;
  link: string | null;
  riportId: string | null;
  /** Az ügy megnyitáskori verziója (`updatedAt` ms-ban): elavult lapról nem lehet kérni. */
  verzio: number;
}

export interface MegjegyzesInput {
  megjegyzes: string;
  verzio: number;
}

const HIBAS_KERES: MezoHibak = { form: 'Hibás kérés.' };

/**
 * A `verzio` rejtett mező értéke: pozitív egész (vezető nulla nélkül). Minden más – üres, szöveg, tizedes,
 * negatív, nulla – hibás kérés, `null`.
 */
export function parseVerzio(fd: FormData): number | null {
  const raw = mezo(fd, 'verzio');
  if (!/^[1-9]\d*$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) ? n : null;
}

/** Kötelező, legfeljebb `max` karakteres szöveg; a hibát az `errors[kulcs]`-ba írja, az értéket visszaadja. */
function kotelezo(fd: FormData, kulcs: string, max: number, hianyHiba: string, hosszHiba: string, errors: MezoHibak): string {
  const v = mezo(fd, kulcs);
  if (!v) errors[kulcs] = hianyHiba;
  else if (v.length > max) errors[kulcs] = hosszHiba;
  return v;
}

/** Opcionális, legfeljebb `max` karakteres szöveg: üres → `null`. */
function opcionalis(fd: FormData, kulcs: string, max: number, hosszHiba: string, errors: MezoHibak): string | null {
  const v = mezo(fd, kulcs);
  if (v.length > max) errors[kulcs] = hosszHiba;
  return v || null;
}

/** A beküldött ország (`orszag` mező): az attasé aktuális országai közül kell lennie. */
function orszagKod(fd: FormData, orszagok: readonly string[], errors: MezoHibak): string {
  const kod = mezo(fd, 'orszag');
  if (!orszagok.includes(kod)) errors.orszag = 'Válassz a saját országaid közül.';
  return kod;
}

/** Egy kapcsolódó bejegyzés azonosítója (jelentés, eredmény): üres → `null`; a tulajdonost a lekérdezés nézi. */
function azonosito(fd: FormData, kulcs: string): string | null {
  return mezo(fd, kulcs) || null;
}

/**
 * Egy tevékenység. `ma` a mai naptári nap (`YYYY-MM-DD`, Europe/Budapest): a dátum nem lehet későbbi.
 * `orszagok` az attasé aktuális országainak kódjai. A magyar szereplő partnerközvetítésnél kötelező.
 */
export function parseTevekenysegForm(fd: FormData, ma: string, orszagok: readonly string[]): ParseResult<TevekenysegInput> {
  const errors: MezoHibak = {};

  const tipusRaw = mezo(fd, 'tipus');
  const tipus = isTevekenysegTipus(tipusRaw) ? tipusRaw : null;
  if (!tipus) errors.tipus = 'Válassz tevékenységtípust.';

  const datum = mezo(fd, 'datum');
  if (!ervenyesNaptariDatum(datum)) errors.datum = 'Adj meg érvényes dátumot.';
  else if (datum > ma) errors.datum = 'A dátum nem lehet jövőbeli.';

  const orszag = orszagKod(fd, orszagok, errors);
  const megnevezes = kotelezo(fd, 'megnevezes', MEGNEVEZES_MAX, 'A megnevezés kötelező.', `A megnevezés legfeljebb ${MEGNEVEZES_MAX} karakter lehet.`, errors);
  const partner = kotelezo(fd, 'partner', PARTNER_MAX, 'A partner megadása kötelező.', `A partner legfeljebb ${PARTNER_MAX} karakter lehet.`, errors);

  let magyarSzereplo: string | null;
  if (tipus === 'partnerkozvetites') {
    magyarSzereplo = kotelezo(
      fd, 'magyarSzereplo', MAGYAR_SZEREPLO_MAX,
      'Partnerközvetítésnél a magyar szereplő megadása kötelező.',
      `A magyar szereplő legfeljebb ${MAGYAR_SZEREPLO_MAX} karakter lehet.`, errors,
    );
  } else {
    magyarSzereplo = opcionalis(fd, 'magyarSzereplo', MAGYAR_SZEREPLO_MAX, `A magyar szereplő legfeljebb ${MAGYAR_SZEREPLO_MAX} karakter lehet.`, errors);
  }

  const leiras = opcionalis(fd, 'leiras', SZOVEG_MAX, `A leírás legfeljebb ${SZOVEG_MAX} karakter lehet.`, errors);

  if (Object.keys(errors).length > 0 || !tipus) return { ok: false, errors };
  return {
    ok: true,
    data: {
      tipus, datum, orszagKod: orszag, megnevezes, partner, magyarSzereplo, leiras,
      riportId: azonosito(fd, 'riportId'),
      eredmenyId: azonosito(fd, 'eredmenyId'),
    },
  };
}

/**
 * Egy eredmény (ügy) létrehozása. A kezdő szakasz csak Lehetőség vagy Kapcsolat lehet (üresen Lehetőség):
 * az együttműködés és a megállapodás csak igazolással érhető el.
 */
export function parseEredmenyForm(fd: FormData, orszagok: readonly string[]): ParseResult<EredmenyInput> {
  const errors: MezoHibak = {};

  const megnevezes = kotelezo(fd, 'megnevezes', MEGNEVEZES_MAX, 'A megnevezés kötelező.', `A megnevezés legfeljebb ${MEGNEVEZES_MAX} karakter lehet.`, errors);
  const orszag = orszagKod(fd, orszagok, errors);
  const partner = kotelezo(fd, 'partner', PARTNER_MAX, 'A partner megadása kötelező.', `A partner legfeljebb ${PARTNER_MAX} karakter lehet.`, errors);
  const magyarSzereplo = opcionalis(fd, 'magyarSzereplo', MAGYAR_SZEREPLO_MAX, `A magyar szereplő legfeljebb ${MAGYAR_SZEREPLO_MAX} karakter lehet.`, errors);

  const hozzajarulasRaw = mezo(fd, 'hozzajarulas');
  const hozzajarulas = isHozzajarulas(hozzajarulasRaw) ? hozzajarulasRaw : null;
  if (!hozzajarulas) errors.hozzajarulas = 'Válaszd ki a hozzájárulás módját.';

  const leiras = opcionalis(fd, 'leiras', SZOVEG_MAX, `A leírás legfeljebb ${SZOVEG_MAX} karakter lehet.`, errors);

  const kezdoRaw = mezo(fd, 'kezdoSzakasz') || 'lehetoseg';
  const kezdoSzakasz = kezdoRaw === 'lehetoseg' || kezdoRaw === 'kapcsolat' ? kezdoRaw : null;
  if (!kezdoSzakasz) errors.kezdoSzakasz = 'A kezdő szakasz csak Lehetőség vagy Kapcsolat lehet.';

  if (Object.keys(errors).length > 0 || !hozzajarulas || !kezdoSzakasz) return { ok: false, errors };
  return { ok: true, data: { megnevezes, orszagKod: orszag, partner, magyarSzereplo, hozzajarulas, leiras, kezdoSzakasz } };
}

/**
 * A link: csak `http` vagy `https` cím, a `new URL()` `href`-je kerül tárolásra. A séma nélküli vagy
 * értelmezhetetlen szöveg ugyanazt a hibát kapja, mint a más sémájú (pl. `javascript:`) cím.
 */
function normalizalLink(nyers: string): string | null {
  try {
    const url = new URL(nyers);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

/**
 * Az igazolás kérése (a következő szakaszba lépéshez): kötelező indoklás, opcionális link és saját jelentés
 * azonosítója, és az ügy megnyitáskori verziója. A hiányzó vagy hibás verzió hibás kérés, nem mezőhiba.
 */
export function parseIgazolasKeresForm(fd: FormData): ParseResult<IgazolasKeresInput> {
  const verzio = parseVerzio(fd);
  if (verzio === null) return { ok: false, errors: { ...HIBAS_KERES } };

  const errors: MezoHibak = {};
  const indoklas = kotelezo(fd, 'indoklas', SZOVEG_MAX, 'Az indoklás kötelező.', `Az indoklás legfeljebb ${SZOVEG_MAX} karakter lehet.`, errors);

  let link: string | null = null;
  const linkRaw = mezo(fd, 'link');
  if (linkRaw) {
    const hosszHiba = `A link legfeljebb ${LINK_MAX} karakter lehet.`;
    if (linkRaw.length > LINK_MAX) errors.link = hosszHiba;
    else {
      link = normalizalLink(linkRaw);
      if (link === null) errors.link = 'Csak http vagy https cím adható meg.';
      // A kódolt alak (ékezetek, szóközök) hosszabb lehet a beírtnál.
      else if (link.length > LINK_MAX) errors.link = hosszHiba;
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { indoklas, link, riportId: azonosito(fd, 'riportId'), verzio } };
}

/**
 * A kötelező megjegyzéssel járó döntések (visszaküldés, igazolás visszavonása, kifogásolás) közös űrlapja:
 * megjegyzés és az ügy megnyitáskori verziója. A hiányzó vagy hibás verzió hibás kérés, nem mezőhiba.
 */
export function parseMegjegyzesForm(fd: FormData): ParseResult<MegjegyzesInput> {
  const verzio = parseVerzio(fd);
  if (verzio === null) return { ok: false, errors: { ...HIBAS_KERES } };

  const errors: MezoHibak = {};
  const megjegyzes = kotelezo(fd, 'megjegyzes', SZOVEG_MAX, 'A megjegyzés kötelező.', `A megjegyzés legfeljebb ${SZOVEG_MAX} karakter lehet.`, errors);

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { megjegyzes, verzio } };
}
