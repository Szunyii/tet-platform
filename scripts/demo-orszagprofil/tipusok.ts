/**
 * A demó országprofilok közös típusai és segédjei (a scripts/demo-orszagprofil.ts futtató és az
 * orszagok/<kod>.ts adatfájlok). A blokkok értékei úgy vannak megadva, ahogy az űrlapon beírnák
 * őket (magyar számformátum, a listás mezőknél több érték), így a futtató ugyanazzal a
 * validátorral ellenőrzi őket, mint az űrlapot.
 */
import type { BlokkKulcs, RendezvenyTipus } from '../../lib/orszagprofil-szotar';

/** Egy blokk űrlap-értékei: mezőnév → string, a listás mezőknél string-lista. */
export type Urlap = Record<string, string | string[]>;

/** Egy ország demó-profilja. A meg nem adott blokk mentetlen marad (részleges profil). */
export interface DemoOrszag {
  kod: string;
  profil: Partial<Record<BlokkKulcs, Urlap>>;
}

/** Egy rendezvény-sor; a `megjegyzes` elhagyható. */
export interface DemoRendezveny {
  nev: string;
  tipus: RendezvenyTipus;
  idopont: string;
  megjegyzes?: string;
}

/** A rendezvény-sorokból a validátor `rendezveny.<i>.<mezo>` mezői. */
export function rendezvenyek(sorok: DemoRendezveny[]): Urlap {
  const u: Urlap = {};
  sorok.forEach((s, i) => {
    u[`rendezveny.${i}.nev`] = s.nev;
    u[`rendezveny.${i}.tipus`] = s.tipus;
    u[`rendezveny.${i}.idopont`] = s.idopont;
    u[`rendezveny.${i}.megjegyzes`] = s.megjegyzes ?? '';
  });
  return u;
}

/** Űrlap-értékek → FormData: a listás mezőknél több azonos nevű érték, ahogy a böngésző küldi. */
export function urlapFormData(u: Urlap): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(u)) {
    if (Array.isArray(v)) v.forEach((x) => fd.append(k, x));
    else fd.append(k, v);
  }
  return fd;
}
