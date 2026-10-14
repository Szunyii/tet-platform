/**
 * Az új-ticket címzettválasztójának tiszta segédei: az attasék régiói és a régió-csoportok (a
 * „Mindenki” mellett ezekből lesznek a gyorsgombok). Egy attasé minden olyan régióba tartozik,
 * ahol a székhelye vagy bármelyik regionálisan lefedett országa van. Framework- és DB-mentes.
 */
import { ORSZAG_REGIOK, orszagRegio, type RegioKulcs } from './orszagok';
import type { CimzettJelolt } from './ticket-szotar';

/** Az attasé régiói ismétlés nélkül, az `ORSZAG_REGIOK` sorrendjében; ismeretlen országkód kimarad. */
export function jeloltRegioi(j: Pick<CimzettJelolt, 'orszagok'>): RegioKulcs[] {
  const benne = new Set(j.orszagok.map((kod) => orszagRegio(kod)));
  return ORSZAG_REGIOK.map((r) => r.kulcs).filter((k) => benne.has(k));
}

/** A régió attaséinak id-jai a jelöltlista sorrendjében. */
export function regioJeloltjei(jeloltek: readonly CimzettJelolt[], regio: RegioKulcs): string[] {
  return jeloltek.filter((j) => jeloltRegioi(j).includes(regio)).map((j) => j.id);
}

export interface RegioCsoport {
  kulcs: RegioKulcs;
  cimke: string;
  idk: string[];
}

/** A nem üres régiók csoportjai az `ORSZAG_REGIOK` sorrendjében (a gyorsgombokhoz). */
export function regioCsoportok(jeloltek: readonly CimzettJelolt[]): RegioCsoport[] {
  return ORSZAG_REGIOK.map((r) => ({ kulcs: r.kulcs, cimke: r.cimke, idk: regioJeloltjei(jeloltek, r.kulcs) })).filter(
    (cs) => cs.idk.length > 0,
  );
}
