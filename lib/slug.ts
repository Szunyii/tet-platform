/**
 * URL-azonosító (slug) képzése: ékezet nélkül, kisbetűvel, a nem alfanumerikus szakaszok helyén egy
 * kötőjellel. A tudástár kártyáinak URL-je (`/tudastar/<kategoria>/<slug>`) használja.
 */

export const SLUG_MAX = 60;
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Az ékezetjelek (NFD után a kombinált jelek) elhagyása; az „ő”, „ű” kettős ékezete is. */
export function ekezetNelkul(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

/** Slug a szövegből; ha semmi nem marad (pl. csak írásjel), a `tartalek`. */
export function slugbol(s: string, tartalek = 'kartya'): string {
  const alap = ekezetNelkul(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const vagott = alap.slice(0, SLUG_MAX).replace(/-+$/, '');
  return vagott || tartalek;
}

/** Az első szabad slug: az `alap`, vagy `-2`, `-3`… utótaggal. A `foglalt` a már használt (és a tiltott) slugokra igaz. */
export function szabadSlug(alap: string, foglalt: (s: string) => boolean): string {
  if (!foglalt(alap)) return alap;
  for (let i = 2; ; i++) {
    const s = `${alap}-${i}`;
    if (!foglalt(s)) return s;
  }
}
