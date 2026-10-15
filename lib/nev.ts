/**
 * Monogram egy névből: az első két szó kezdőbetűje nagybetűvel. A ponttal végződő szavak (titulus,
 * pl. „dr.”) kimaradnak: „dr. Gurza László” → „GL”. Üres (vagy csak titulusból álló) névre ''.
 */
export function monogram(nev: string): string {
  return nev
    .trim()
    .split(/\s+/)
    .filter((szo) => szo !== '' && !szo.endsWith('.'))
    .slice(0, 2)
    .map((szo) => szo.charAt(0))
    .join('')
    .toUpperCase();
}
