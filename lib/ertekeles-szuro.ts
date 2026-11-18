/**
 * A `/monitoring` hálózati nézet URL-szűrőinek tiszta fordítója: `searchParams` → `ErtekelesSzuro`, és vissza
 * URL-re. Nincs React és nincs DB hívás. Az ismeretlen paraméterértéket eldobja, a kulcs ilyenkor hiányzik
 * (nem `undefined` értékkel szerepel). Az év a fejléc ciklusválasztójából jön, ezért nincs évszűrő.
 */
import { isFokozat, isSzempontKulcs, type Fokozat, type SzempontKulcs } from './ertekeles-szotar';
import { parseFelevSzam, type FelevSzam } from './ertekeles-idoszak';
import { ORSZAG_REGIOK, orszagByKod, type RegioKulcs } from './orszagok';
import type { SearchParams } from './routes';

export interface ErtekelesSzuro {
  /** `null`: nincs (érvényes) `?felev=`, a page az év alapértelmezett félévét veszi. */
  felev: FelevSzam | null;
  /** A székhely régiója. */
  regio?: RegioKulcs;
  /** Az attasé bármely lefedett országa (ISO-kód). */
  orszag?: string;
  attase?: string;
  szempont?: SzempontKulcs;
  /**
   * Szempontnál 0–4 (0 = nem értékelhető), szempont nélkül az összminősítés 1–4. A 0 csak szempont mellett
   * érvényes: összminősítésnek nincs „nem értékelhető” értéke.
   */
  minosites?: Fokozat;
}

function egy(v: string | string[] | undefined): string {
  const s = Array.isArray(v) ? v[0] : v;
  return (s ?? '').trim();
}

function isRegioKulcs(v: string): v is RegioKulcs {
  return ORSZAG_REGIOK.some((r) => r.kulcs === v);
}

/** Az attasé-szűrő értékének felső hossza: a formai tisztításhoz elég (a `szuroFromSearchParams` vágja). */
const ATTASE_MAX = 100;

/** URL szűrőparaméterek → `ErtekelesSzuro`. Ismeretlen vagy érvénytelen értéket eldob. */
export function szuroFromSearchParams(sp: SearchParams): ErtekelesSzuro {
  const szuro: ErtekelesSzuro = { felev: parseFelevSzam(egy(sp.felev)) };

  const regio = egy(sp.regio);
  if (isRegioKulcs(regio)) szuro.regio = regio;

  // Csak a szótárban ismert kód: a nyers érték a legördülőben nem szerepelhet.
  const orszag = egy(sp.orszag);
  if (orszagByKod(orszag)) szuro.orszag = orszag;

  // Az attasé-azonosítót itt csak formailag tisztítjuk; az oldal a hálózat attaséi között nem szereplő
  // értéket eldobja, különben a legördülőben nyers azonosító állna.
  const attase = egy(sp.attase);
  if (attase) szuro.attase = attase.slice(0, ATTASE_MAX);

  const szempont = egy(sp.szempont);
  if (isSzempontKulcs(szempont)) szuro.szempont = szempont;

  // Egyetlen számjegy: az üres szöveg, a `1.0`, a `+2` és a szóközös érték sem fokozat.
  const minosites = egy(sp.minosites);
  if (/^[0-4]$/.test(minosites)) {
    const fokozat = Number(minosites);
    if (isFokozat(fokozat) && (fokozat !== 0 || szuro.szempont !== undefined)) szuro.minosites = fokozat;
  }

  return szuro;
}

/**
 * A szűrő URL-je az `alap` útvonalon (alapértelmezés: a hálózati nézet). A `felev: null` és a nem megadott
 * szűrők kimaradnak; nincs szűrő → az `alap` maga. A `szuroFromSearchParams` párja.
 */
export function szuroUrl(szuro: ErtekelesSzuro, alap = '/monitoring'): string {
  const p = new URLSearchParams();
  if (szuro.felev !== null) p.set('felev', String(szuro.felev));
  if (szuro.regio !== undefined) p.set('regio', szuro.regio);
  if (szuro.orszag !== undefined) p.set('orszag', szuro.orszag);
  if (szuro.attase !== undefined) p.set('attase', szuro.attase);
  if (szuro.szempont !== undefined) p.set('szempont', szuro.szempont);
  if (szuro.minosites !== undefined) p.set('minosites', String(szuro.minosites));
  const q = p.toString();
  return q ? `${alap}?${q}` : alap;
}
