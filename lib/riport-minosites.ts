/**
 * A jelentések központi minősítésének tiszta logikája (spec 7.): az admin jelentésenként egy fokozatot (1–4) adhat
 * opcionális megjegyzéssel. Nincs React és nincs DB. A fokozatot mindig az admin adja, kód nem számol belőle
 * semmit: a megoszlás csak megszámolja a megadott fokozatokat. Az attasé a minősítést nem kapja meg.
 */
import { INDOKLAS_MAX, isOsszFokozat, type OsszFokozat } from './ertekeles-szotar';
import { mezo, type ParseResult } from './urlap';

/** A jelentéslista „Minősítés” szűrőjének értéke: egy fokozat, vagy a „Nincs minősítve”. */
export type MinositesSzuro = OsszFokozat | 'nincs';

/** `fokozat: null`: a minősítés törlése, ekkor a megjegyzés is `null`. */
export interface RiportMinositesInput {
  fokozat: OsszFokozat | null;
  megjegyzes: string | null;
}

/** A fokozat mező értéke egyetlen számjegyként (a `0`, az `5`, a `3.0` vagy a `03` nem fokozat). */
function fokozatSzam(raw: string): OsszFokozat | null {
  if (!/^[1-4]$/.test(raw)) return null;
  const n = Number(raw);
  return isOsszFokozat(n) ? n : null;
}

/**
 * A minősítés űrlapja. Az üres fokozat a törlést jelenti (`fokozat: null`, a megjegyzés elveszik); a hiányzó vagy
 * fájl típusú fokozat-mező viszont nem „üres”, hanem hibás kérés, mert a törlés visszavonhatatlan. A hibakulcs a
 * mező neve (= a mező DOM id-ja).
 */
export function parseRiportMinositesForm(fd: FormData): ParseResult<RiportMinositesInput> {
  if (typeof fd.get('fokozat') !== 'string') return { ok: false, errors: { form: 'Hibás kérés.' } };
  const raw = mezo(fd, 'fokozat');
  if (raw === '') return { ok: true, data: { fokozat: null, megjegyzes: null } };

  const errors: Record<string, string> = {};
  const fokozat = fokozatSzam(raw);
  if (fokozat === null) errors.fokozat = 'Válassz érvényes fokozatot.';
  const megjegyzes = mezo(fd, 'megjegyzes');
  if (megjegyzes.length > INDOKLAS_MAX) errors.megjegyzes = `A megjegyzés legfeljebb ${INDOKLAS_MAX} karakter lehet.`;
  if (Object.keys(errors).length > 0 || fokozat === null) return { ok: false, errors };
  return { ok: true, data: { fokozat, megjegyzes: megjegyzes || null } };
}

/** Az URL `minosites` szűrőjének értéke; ismeretlen érték (pl. `0`, `5`, szöveg) `null`, a hívó eldobja. */
export function parseMinositesSzuro(v: string): MinositesSzuro | null {
  if (v === 'nincs') return 'nincs';
  return fokozatSzam(v);
}

/** A jelentések fokozatok szerinti megoszlása; a `null` a minősítetlen jelentés („nincs”). */
export function minositesMegoszlas(
  fokozatok: readonly (OsszFokozat | null)[],
): Record<OsszFokozat | 'nincs', number> {
  const megoszlas: Record<OsszFokozat | 'nincs', number> = { 4: 0, 3: 0, 2: 0, 1: 0, nincs: 0 };
  for (const f of fokozatok) megoszlas[f ?? 'nincs'] += 1;
  return megoszlas;
}
