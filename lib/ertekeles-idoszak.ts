/**
 * Az értékelési félévek tiszta logikája (framework-mentes). Az 1. félév január 1. és június 30.,
 * a 2. július 1. és december 31. között tart, Europe/Budapest szerint. A naptári napok
 * `YYYY-MM-DD` stringek, amelyek ábécésorrendben is időrendben vannak: az összevetés string-alapú,
 * így a tárolt nap sosem csúszik el időzónával.
 */
import { kovetkezoNapKezdete, napKezdete } from './datum';

export type FelevSzam = 1 | 2;

export interface Felev {
  ev: number;
  felev: FelevSzam;
}

/** A félév azonosítója az URL-hez és a kulcsokhoz, pl. `2026/1`. */
export function felevKulcs(f: Felev): string {
  return `${f.ev}/${f.felev}`;
}

/** A félév felirata, pl. „2026 2. félév”. */
export function felevCimke(f: Felev): string {
  return `${f.ev} ${f.felev}. félév`;
}

/** A félév első és utolsó naptári napja (`YYYY-MM-DD`, zárt intervallum). */
export function felevNapok(f: Felev): { elsoNap: string; utolsoNap: string } {
  return f.felev === 1
    ? { elsoNap: `${f.ev}-01-01`, utolsoNap: `${f.ev}-06-30` }
    : { elsoNap: `${f.ev}-07-01`, utolsoNap: `${f.ev}-12-31` };
}

/**
 * A félév pillanatnyi határai (UTC instant): `kezdet` az első nap budapesti éjfele, `vegeKizaro`
 * az utolsó nap utáni nap budapesti éjfele – az időszak `kezdet <= t < vegeKizaro`.
 */
export function felevHatarok(f: Felev): { kezdet: Date; vegeKizaro: Date } {
  const { elsoNap, utolsoNap } = felevNapok(f);
  return { kezdet: napKezdete(elsoNap), vegeKizaro: kovetkezoNapKezdete(utolsoNap) };
}

/** A naptári napot (`YYYY-MM-DD`) tartalmazó félév. */
export function futoFelev(ma: string): Felev {
  const ev = Number(ma.slice(0, 4));
  const ho = Number(ma.slice(5, 7));
  return { ev, felev: ho <= 6 ? 1 : 2 };
}

export function elozoFelev(f: Felev): Felev {
  return f.felev === 2 ? { ev: f.ev, felev: 1 } : { ev: f.ev - 1, felev: 2 };
}

/** Időrendi összevetés (rendezéshez): negatív, ha `a` korábbi, mint `b`. */
export function felevOsszevet(a: Felev, b: Felev): number {
  return a.ev - b.ev || a.felev - b.felev;
}

/** A félév első napja már elérkezett (vagy elmúlt). */
export function felevMegkezdodott(f: Felev, ma: string): boolean {
  return ma >= felevNapok(f).elsoNap;
}

/** A félév utolsó napja már elmúlt: a félév vége utáni naptól igaz. */
export function felevBefejezodott(f: Felev, ma: string): boolean {
  return ma > felevNapok(f).utolsoNap;
}

/** Megnyitható a futó és a közvetlenül előtte lévő félév. */
export function megnyithato(f: Felev, ma: string): boolean {
  const futo = futoFelev(ma);
  return felevOsszevet(f, futo) === 0 || felevOsszevet(f, elozoFelev(futo)) === 0;
}

/**
 * Az évhez alapértelmezetten mutatott félév: a legnagyobb lezárt félév (`lezartak`: az év lezárt
 * félévszámai), ennek hiányában az év legutóbbi megkezdett féléve (a még meg nem kezdett évnél az 1.).
 */
export function alapFelev(ev: number, ma: string, lezartak: readonly FelevSzam[]): FelevSzam {
  if (lezartak.length > 0) return Math.max(...lezartak) as FelevSzam;
  return felevMegkezdodott({ ev, felev: 2 }, ma) ? 2 : 1;
}

/** Az URL `?felev=` értéke: csak az `1` és a `2` (szám vagy szöveg) érvényes, minden más `null`. */
export function parseFelevSzam(v: unknown): FelevSzam | null {
  if (v === 1 || v === '1') return 1;
  if (v === 2 || v === '2') return 2;
  return null;
}
