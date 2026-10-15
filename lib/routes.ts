// Központi útvonal-konstansok. Az útvonaltábla (lib/navigacio.ts) a menüé és a fejlécé, ez a kód által
// használt fix célpontoké.
export const HOME_ROUTE = '/terkep';
export const LOGIN_ROUTE = '/login';

/** A csatolmány letöltési útvonala (app/api/jelentes/csatolmany/[id]). */
export function csatolmanyUrl(id: string): string {
  return `/api/jelentes/csatolmany/${id}`;
}

/** A page-ek `searchParams` propjának (feloldott) alakja. */
export type SearchParams = Record<string, string | string[] | undefined>;

// A ?next= hossza korlátozott, hogy a Location fejléc ne nőjön proxy-limit fölé.
export const NEXT_MAX_LENGTH = 512;

/** Login URL a cél útvonallal (?next=). Csak belső, abszolút útvonal mehet át: nem protokoll-relatív (//), nem backslash, nem túl hosszú. */
export function loginUtvonal(cel: string | null | undefined): string {
  if (!cel || !cel.startsWith('/') || cel.startsWith('//') || cel.startsWith('/\\')) return LOGIN_ROUTE;
  if (cel.length > NEXT_MAX_LENGTH) return LOGIN_ROUTE;
  return `${LOGIN_ROUTE}?next=${encodeURIComponent(cel)}`;
}

/**
 * A login utáni cél (?next=) ellenőrzése, a nyílt átirányítás ellen. A böngészővel azonos URL-parserrel
 * értelmezzük, mert a regex kijátszható (pl. "/<TAB>/evil.com" → "//evil.com"): csak akkor fogadjuk el, ha a
 * bázis-originre mutat, nem a /login maga (önhurok), nem API-útvonal (oda nem navigálunk), nem hosszabb
 * `NEXT_MAX_LENGTH`-nél (a Location fejléc ne nőjön proxy-limit fölé), és a normalizált útvonal nem
 * protokoll-relatív (`//`). A visszaadott útvonal normalizált (vezérlőkarakterek nélkül), így a Location
 * fejlécbe is biztonságos; minden más esetben `HOME_ROUTE`.
 */
export function biztonsagosNext(raw: string | string[] | undefined): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v) return HOME_ROUTE;
  let u: URL;
  try {
    u = new URL(v, 'http://n.invalid');
  } catch {
    return HOME_ROUTE;
  }
  if (u.origin !== 'http://n.invalid') return HOME_ROUTE;
  const path = u.pathname + u.search;
  // A pont-szegmensek normalizálása protokoll-relatív utat adhat ("/.//evil.com" → "//evil.com"): azt a böngésző külső címként követné.
  if (path.startsWith('//')) return HOME_ROUTE;
  if (path.length > NEXT_MAX_LENGTH) return HOME_ROUTE;
  if (path === LOGIN_ROUTE || path.startsWith(`${LOGIN_ROUTE}/`) || path.startsWith(`${LOGIN_ROUTE}?`)) return HOME_ROUTE;
  if (path === '/api' || path.startsWith('/api/')) return HOME_ROUTE;
  return path;
}
