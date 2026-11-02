/**
 * A tudástár-kártya szerkesztőjének szerver-oldali validátora. A hibakulcs a mező `id`-ja (a szerkesztőben
 * id = name, egy űrlap van az oldalon); a dinamikus sorok mezői `<lista>.<i>.<mezo>` (pl. `szakaszok.0.cim`).
 * A teljesen üres sor kimarad, a félig kitöltött sor hibát kap. A feliratok és a korlátok a szerkesztővel
 * közösek (lib/tudastar-szotar.ts `KARTYA_CIMKEK`, `SOR_MEZOK`).
 */
import { EMAIL_RE, mezo, nevelovel, type MezoHibak, type ParseResult } from './urlap';
import {
  CIM_MAX, EMAIL_MAX, KARTYA_CIMKEK, NEV_CIMKE, NEV_MAX, OSSZEFOGLALO_CIMKE, OSSZEFOGLALO_MAX, ROVIDITES_MAX,
  SOR_EGYSEG, SOR_MAX, SOR_MEZOK, SZOVEG_MAX, TELEFON_MAX, URL_MAX, isKategoriaSlug,
  type KartyaAdat, type KartyaTipus, type KartyaTorzs, type SorLista, type SorMezoSzabaly, type SorTipusok,
} from './tudastar-szotar';

const SEMA_RE = /^[a-z][a-z0-9+.-]*:/i;
// A hosztnév két, nem üres címkéje között pont áll (a „valami”, a „localhost” és a „localhost.” is kiesik).
const PONTOS_HOSZT_RE = /[^.]\.[^.]/;
const URL_HIBA = 'Érvényes webcímet adj meg (pl. https://nkfih.gov.hu).';

/**
 * Egy URL ellenőrzése és normalizálása: séma nélkül `https://` kerül elé; csak `http:`/`https:` séma,
 * felhasználónév/jelszó nélkül (a honlap-mezőbe tévedt `info@nkfih.gov.hu` és a megtévesztő
 * `https://nkfih.gov.hu@masik.hu` így kiesik), pontot tartalmazó hosztnévvel. Siker: a `new URL()`
 * normalizált `href`-je; hiba: `null`. A hosszkorlátot a hívó nézi.
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
  if (u.username || u.password) return null;
  if (!PONTOS_HOSZT_RE.test(u.hostname)) return null;
  return u.href;
}

/** Űrlap-szintű hiba; ha már van, hozzáfűzi (több lista is túllépheti a korlátját). */
function formHiba(errors: MezoHibak, uzenet: string): void {
  errors.form = errors.form ? `${errors.form} ${uzenet}` : uzenet;
}

/**
 * Szöveges érték ellenőrzése: kötelezőség és hossz; a hibát az `errors`-ba írja, az értéket visszaadja. Az
 * egysoros mezőben (`tobbsoros` nélkül) a sortörés szóköz lesz: a szerkesztő `<input>`-ja a következő mentéskor
 * szóköz nélkül dobná el, és a szavak egybefolynának.
 */
function szoveg(
  nyers: string, id: string, cimke: string, max: number, kotelezo: boolean, errors: MezoHibak, tobbsoros = false,
): string {
  const v = tobbsoros ? nyers : nyers.replace(/\s*\n\s*/g, ' ');
  if (kotelezo && !v) errors[id] = `${nevelovel(cimke)} kötelező.`;
  else if (v.length > max) errors[id] = `${nevelovel(cimke)} legfeljebb ${max} karakter.`;
  return v;
}

/** Webcím: üresen `''` (vagy hiba, ha kötelező); különben a normalizált URL, hibánál a beírt érték. */
function webcim(v: string, id: string, cimke: string, max: number, kotelezo: boolean, errors: MezoHibak): string {
  if (!v || v.length > max) return szoveg(v, id, cimke, max, kotelezo, errors);
  const url = normalizalUrl(v);
  if (url === null) errors[id] = URL_HIBA;
  else if (url.length > max) errors[id] = `${nevelovel(cimke)} kódolva (az ékezetes betűk és a szóközök kódolásával) hosszabb ${max} karakternél.`;
  else return url;
  return v;
}

// A sorindex legfeljebb 4 jegyű, vezető nulla nélkül (a `SOR_MAX` ennél jóval kisebb); a hosszabb indexű mezőt nem olvassuk.
const sorIndexRe = (lista: SorLista) => new RegExp(`^${lista}\\.(0|[1-9]\\d{0,3})\\.`);

/** A dinamikus sorok indexei a FormData-ban (`<lista>.<i>.<mezo>`), növekvő sorrendben. */
function sorIndexek(fd: FormData, lista: SorLista): number[] {
  const re = sorIndexRe(lista);
  const halmaz = new Set<number>();
  for (const k of fd.keys()) {
    const m = re.exec(k);
    if (m) halmaz.add(Number(m[1]));
  }
  return [...halmaz].sort((a, b) => a - b);
}

/**
 * Egy dinamikus lista sorai a `SOR_MEZOK` szabályaival: a teljesen üres sor kimarad, a többit mezőnként
 * ellenőrzi. Ha a beküldött sorok száma a korlát fölött van, egy sort sem olvas (a szerkesztő ennél többet
 * nem küld; a sok kulcsos kérés így sem lassítja a feldolgozást).
 */
function sorok<L extends SorLista>(fd: FormData, lista: L, errors: MezoHibak): SorTipusok[L][] {
  const indexek = sorIndexek(fd, lista);
  if (indexek.length > SOR_MAX[lista]) {
    formHiba(errors, `Legfeljebb ${SOR_MAX[lista]} ${SOR_EGYSEG[lista]} adható meg.`);
    return [];
  }
  const mezok = Object.entries(SOR_MEZOK[lista]) as [string, SorMezoSzabaly][];
  const eredmeny: SorTipusok[L][] = [];
  for (const i of indexek) {
    const ertekek = mezok.map(([kulcs, sz]) => ({ kulcs, sz, v: mezo(fd, `${lista}.${i}.${kulcs}`) }));
    if (ertekek.every((e) => e.v === '')) continue;
    const sor: Record<string, string> = {};
    for (const { kulcs, sz, v } of ertekek) {
      const id = `${lista}.${i}.${kulcs}`;
      sor[kulcs] = sz.url
        ? webcim(v, id, sz.cimke, sz.max, Boolean(sz.kotelezo), errors)
        : szoveg(v, id, sz.cimke, sz.max, Boolean(sz.kotelezo), errors, Boolean(sz.tobbsoros));
    }
    // A `SOR_MEZOK` a sortípus minden mezőjét kimerítően felsorolja, ezért a sor teljes.
    eredmeny.push(sor as unknown as SorTipusok[L]);
  }
  return eredmeny;
}

/** A szerkesztő űrlapja; a `tipus` a meglévő kártyáé (szerkesztés) vagy a rejtett mezőé (létrehozás). */
export function validalKartya(fd: FormData, tipus: KartyaTipus): ParseResult<KartyaAdat> {
  const errors: MezoHibak = {};
  const C = KARTYA_CIMKEK;
  const kategoria = mezo(fd, 'kategoria');
  if (!isKategoriaSlug(kategoria)) errors.kategoria = 'Válassz kategóriát.';
  const nev = szoveg(mezo(fd, 'nev'), 'nev', NEV_CIMKE[tipus], NEV_MAX, true, errors);
  const rovidites = szoveg(mezo(fd, 'rovidites'), 'rovidites', C.rovidites, ROVIDITES_MAX, false, errors);
  const osszefoglalo = szoveg(mezo(fd, 'osszefoglalo'), 'osszefoglalo', OSSZEFOGLALO_CIMKE[tipus], OSSZEFOGLALO_MAX, true, errors, true);
  const honlap = webcim(mezo(fd, 'honlap'), 'honlap', C.honlap, URL_MAX, false, errors);
  const linkek = sorok(fd, 'linkek', errors);

  let torzs: KartyaTorzs;
  if (tipus === 'intezmeny') {
    const email = szoveg(mezo(fd, 'email'), 'email', C.email, EMAIL_MAX, false, errors);
    if (email && !errors.email && !EMAIL_RE.test(email)) errors.email = 'Érvénytelen e-mail cím.';
    torzs = {
      tipus,
      tartalom: {
        profil: szoveg(mezo(fd, 'profil'), 'profil', C.profil, SZOVEG_MAX, false, errors, true),
        tevekenyseg: szoveg(mezo(fd, 'tevekenyseg'), 'tevekenyseg', C.tevekenyseg, SZOVEG_MAX, false, errors, true),
        kapcsolat: {
          email,
          telefon: szoveg(mezo(fd, 'telefon'), 'telefon', C.telefon, TELEFON_MAX, false, errors),
          cim: szoveg(mezo(fd, 'cim'), 'cim', C.cim, CIM_MAX, false, errors),
        },
        szakaszok: sorok(fd, 'szakaszok', errors),
        programok: sorok(fd, 'programok', errors),
        linkek,
      },
    };
  } else {
    torzs = { tipus, tartalom: { sorok: sorok(fd, 'sorok', errors), linkek } };
  }
  if (Object.keys(errors).length > 0 || !isKategoriaSlug(kategoria)) return { ok: false, errors };
  return { ok: true, data: { kategoria, nev, rovidites: rovidites || null, osszefoglalo, honlap: honlap || null, ...torzs } };
}
