/**
 * A munkaterv-oldalak évválasztása: a `?ev=` paraméter a fejléc ciklusától független. Framework-mentes.
 */
import { tervEvek } from './munkaterv-szotar';
import { EV_MIN } from './orszagprofil-szotar';

/** A megnyitható év: a múlt `EV_MIN`-ig, a jövő csak a következő évig; minden más érték a folyó év. */
export function tervEvParam(v: string | string[] | undefined, aktualisEv: number): number {
  if (typeof v !== 'string' || !/^\d{4}$/.test(v)) return aktualisEv;
  const ev = Number(v);
  return ev >= EV_MIN && ev <= aktualisEv + 1 ? ev : aktualisEv;
}

/**
 * Az évválasztó évei növekvő sorrendben: a múltbeli évek közül azok, amelyekhez terv tartozik, a folyó és a következő
 * év, valamint a megnyitott év, hogy terv nélküli múltbeli évnél is legyen aktív opció.
 */
export function tervEvOpciok(tervesEvek: readonly number[], ev: number, aktualisEv: number): number[] {
  const multbeliek = tervesEvek.filter((e) => e < aktualisEv);
  return [...new Set([...multbeliek, ...tervEvek(aktualisEv), ev])].sort((a, b) => a - b);
}

/** A munkaterv-oldal címe a megadott évre; `attaseId` nélkül a saját vagy az áttekintő oldal. */
export function munkatervUrl(ev: number, attaseId?: string): string {
  const alap = attaseId === undefined ? '/munkaterv' : `/munkaterv/${encodeURIComponent(attaseId)}`;
  return `${alap}?ev=${ev}`;
}
