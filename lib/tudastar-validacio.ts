/**
 * A tudástár-kártya szerkesztőjének szerver-oldali validátora. A hibakulcs a mező `id`-ja (a szerkesztőben
 * id = name, egy űrlap van az oldalon); a dinamikus sorok mezői `<lista>.<i>.<mezo>` (pl. `szakaszok.0.cim`).
 * A teljesen üres sor kimarad, a félig kitöltött sor hibát kap.
 */
import { mezo, type MezoHibak, type ParseResult } from './urlap';
import {
  CIM_MAX, EMAIL_MAX, FELIRAT_MAX, MEGJEGYZES_MAX, NEV_MAX, OSSZEFOGLALO_MAX, PROGRAM_LEIRAS_MAX, ROVIDITES_MAX,
  SOR_MAX, SZAKASZ_CIM_MAX, SZOVEG_MAX, TELEFON_MAX, URL_MAX, isKategoriaSlug,
  type HasznosLink, type KartyaAdat, type KartyaTipus, type KartyaTorzs, type ListaSor, type Program, type Szakasz,
} from './tudastar-szotar';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SEMA_RE = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Egy URL ellenőrzése és normalizálása: séma nélkül `https://` kerül elé; csak `http:`/`https:` séma, pontot
 * tartalmazó hosztnév és legfeljebb `URL_MAX` karakter fogadható el (a `javascript:` és társai így kiesnek).
 * Siker: a `new URL()` normalizált `href`-je; hiba: `null`.
 */
export function normalizalUrl(nyers: string): string | null {
  const s = SEMA_RE.test(nyers) ? nyers : `https://${nyers}`;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  if (!u.hostname.includes('.')) return null;
  return u.href.length <= URL_MAX ? u.href : null;
}

const URL_HIBA = 'Érvényes webcímet adj meg (pl. https://nkfih.gov.hu).';

/** A dinamikus sorok indexei a FormData-ban (`<lista>.<i>.<mezo>`), növekvő sorrendben. */
function sorIndexek(fd: FormData, lista: string): number[] {
  const re = new RegExp(`^${lista}\\.(0|[1-9]\\d*)\\.`);
  const halmaz = new Set<number>();
  for (const k of fd.keys()) {
    const m = re.exec(k);
    if (m) halmaz.add(Number(m[1]));
  }
  return [...halmaz].sort((a, b) => a - b);
}

interface SorMezo<T> {
  kulcs: keyof T & string;
  cimke: string;
  max: number;
  kotelezo?: boolean;
  url?: boolean;
}

/** Egy dinamikus lista sorai: a teljesen üres sor kimarad, a többit mezőnként ellenőrzi. */
function sorok<T extends { [K in keyof T]: string }>(
  fd: FormData,
  lista: keyof typeof SOR_MAX,
  mezok: readonly SorMezo<T>[],
  errors: MezoHibak,
): T[] {
  const eredmeny: T[] = [];
  for (const i of sorIndexek(fd, lista)) {
    const ertekek = mezok.map((m) => [m, mezo(fd, `${lista}.${i}.${m.kulcs}`)] as const);
    if (ertekek.every(([, v]) => v === '')) continue;
    const sor = {} as Record<string, string>;
    for (const [m, v] of ertekek) {
      const id = `${lista}.${i}.${m.kulcs}`;
      sor[m.kulcs] = v;
      if (m.kotelezo && !v) errors[id] = `${m.cimke} megadása kötelező.`;
      else if (v.length > m.max) errors[id] = `${m.cimke}: legfeljebb ${m.max} karakter.`;
      else if (m.url && v) {
        const url = normalizalUrl(v);
        if (url === null) errors[id] = URL_HIBA;
        else sor[m.kulcs] = url;
      }
    }
    eredmeny.push(sor as unknown as T);
  }
  if (eredmeny.length > SOR_MAX[lista]) errors.form = `Legfeljebb ${SOR_MAX[lista]} ${SOR_EGYSEG[lista]} adható meg.`;
  return eredmeny;
}

/** A darabszám-hiba szövegéhez. */
const SOR_EGYSEG: Record<keyof typeof SOR_MAX, string> = {
  szakaszok: 'szakasz', programok: 'program', linkek: 'link', sorok: 'listasor',
};

const SZAKASZ_MEZOK: readonly SorMezo<Szakasz>[] = [
  { kulcs: 'cim', cimke: 'Cím', max: SZAKASZ_CIM_MAX, kotelezo: true },
  { kulcs: 'szoveg', cimke: 'Szöveg', max: SZOVEG_MAX, kotelezo: true },
];
const PROGRAM_MEZOK: readonly SorMezo<Program>[] = [
  { kulcs: 'nev', cimke: 'Név', max: NEV_MAX, kotelezo: true },
  { kulcs: 'leiras', cimke: 'Leírás', max: PROGRAM_LEIRAS_MAX },
  { kulcs: 'url', cimke: 'Webcím', max: URL_MAX, url: true },
];
const LINK_MEZOK: readonly SorMezo<HasznosLink>[] = [
  { kulcs: 'felirat', cimke: 'Felirat', max: FELIRAT_MAX, kotelezo: true },
  { kulcs: 'url', cimke: 'Webcím', max: URL_MAX, kotelezo: true, url: true },
];
const LISTA_SOR_MEZOK: readonly SorMezo<ListaSor>[] = [
  { kulcs: 'nev', cimke: 'Név', max: NEV_MAX, kotelezo: true },
  { kulcs: 'megjegyzes', cimke: 'Megjegyzés', max: MEGJEGYZES_MAX },
  { kulcs: 'url', cimke: 'Webcím', max: URL_MAX, url: true },
];

/** Egy szöveges mező: kötelezőség és hossz; a hibát az `errors`-ba írja, az értéket mindig visszaadja. */
function szoveg(fd: FormData, kulcs: string, cimke: string, max: number, errors: MezoHibak, kotelezo = false): string {
  const v = mezo(fd, kulcs);
  if (kotelezo && !v) errors[kulcs] = `${cimke} megadása kötelező.`;
  else if (v.length > max) errors[kulcs] = `${cimke}: legfeljebb ${max} karakter.`;
  return v;
}

/** A szerkesztő űrlapja; a `tipus` a meglévő kártyáé (szerkesztés) vagy a rejtett mezőé (létrehozás). */
export function validalKartya(fd: FormData, tipus: KartyaTipus): ParseResult<KartyaAdat> {
  const errors: MezoHibak = {};
  const kategoria = mezo(fd, 'kategoria');
  if (!isKategoriaSlug(kategoria)) errors.kategoria = 'Válassz kategóriát.';
  const nev = szoveg(fd, 'nev', 'Név', NEV_MAX, errors, true);
  const rovidites = szoveg(fd, 'rovidites', 'Rövidítés', ROVIDITES_MAX, errors);
  const osszefoglalo = szoveg(fd, 'osszefoglalo', 'Összefoglaló', OSSZEFOGLALO_MAX, errors, true);
  const honlapNyers = mezo(fd, 'honlap');
  let honlap: string | null = null;
  if (honlapNyers) {
    honlap = normalizalUrl(honlapNyers);
    if (honlap === null) errors.honlap = URL_HIBA;
  }
  const linkek = sorok(fd, 'linkek', LINK_MEZOK, errors);

  let torzs: KartyaTorzs;
  if (tipus === 'intezmeny') {
    const email = szoveg(fd, 'email', 'E-mail', EMAIL_MAX, errors);
    if (email && !errors.email && !EMAIL_RE.test(email)) errors.email = 'Érvényes e-mail-címet adj meg.';
    torzs = {
      tipus,
      tartalom: {
        profil: szoveg(fd, 'profil', 'Profil', SZOVEG_MAX, errors),
        tevekenyseg: szoveg(fd, 'tevekenyseg', 'Tevékenység', SZOVEG_MAX, errors),
        kapcsolat: {
          email,
          telefon: szoveg(fd, 'telefon', 'Telefon', TELEFON_MAX, errors),
          cim: szoveg(fd, 'cim', 'Cím', CIM_MAX, errors),
        },
        szakaszok: sorok(fd, 'szakaszok', SZAKASZ_MEZOK, errors),
        programok: sorok(fd, 'programok', PROGRAM_MEZOK, errors),
        linkek,
      },
    };
  } else {
    torzs = { tipus, tartalom: { sorok: sorok(fd, 'sorok', LISTA_SOR_MEZOK, errors), linkek } };
  }
  if (Object.keys(errors).length > 0 || !isKategoriaSlug(kategoria)) return { ok: false, errors };
  return { ok: true, data: { kategoria, nev, rovidites: rovidites || null, osszefoglalo, honlap, ...torzs } };
}
