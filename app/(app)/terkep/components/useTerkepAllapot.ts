'use client';

import { useCallback, useState } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { ALAP_MUTATO, mutatoByKulcs, type Mutato, type MutatoKulcs } from '../../../../lib/terkep-mutatok';

/** Ennyi országtól látszik az összehasonlító tábla. */
export const VS_MIN = 2;
/** Legfeljebb ennyi ország lehet az összehasonlításban. */
export const VS_MAX = 4;

export interface TerkepAllapot {
  /** Egyes kijelölés (a kivonat országa). */
  kod: string | null;
  /** Összehasonlítás-halmaz a hozzáadás sorrendjében; ne mutáld. */
  vs: readonly string[];
  /** `vs.length >= VS_MAX` – a hozzáadás-gombok letiltásához. */
  vsTele: boolean;
  mutato: Mutato;
  /** Iparág-szűrő, '' = nincs. */
  iparag: string;
  kivalaszt: (kod: string) => void;
  bezar: () => void;
  setMutatoKulcs: (k: string) => void;
  setIparag: (i: string) => void;
  vsHozzaad: (kod: string) => void;
  vsKivesz: (kod: string) => void;
  /** Hozzáad, ha nincs benne (és van hely); kivesz, ha benne van – a „+"/pipa gombok művelete. */
  vsValt: (kod: string) => void;
  vsTorol: () => void;
}

/**
 * A térkép-oldal kliens-állapota. A jobb panel a hívóban: `kod` → kivonat, különben rangsor; az
 * összehasonlító tábla a térkép alatt jelenik meg, ha `vs.length >= VS_MIN`. Évváltáskor (új `adatok`) a nem
 * létező kijelölés és halmaz-elemek render közben kikerülnek, a `?o=` (kezdoKod) változására a
 * kijelölés frissül, a többi állapot marad – ez a React „prop változásra állapot igazítása" mintája,
 * ezért a page NEM ad `key`-t a nézetnek. A visszaadott objektum renderenként új (nem memoizálható).
 */
export function useTerkepAllapot(adatok: TerkepOrszag[], kezdoKod: string | null): TerkepAllapot {
  const letezik = (k: string) => adatok.some((o) => o.kod === k);
  const [kod, setKod] = useState<string | null>(() => (kezdoKod && letezik(kezdoKod) ? kezdoKod : null));
  const [vs, setVs] = useState<readonly string[]>([]);
  const [mutatoKulcs, setMutatoKulcsState] = useState<MutatoKulcs>(ALAP_MUTATO);
  const [iparag, setIparag] = useState('');

  // Új `?o=` ugyanezen a route-on belül: a kijelölés a kezdő kódra vált; ha a paraméter eltűnik
  // vagy olyan országra mutat, ami nincs az adatokban, a meglévő kijelölés szándékosan marad.
  // `ujKod`: ha ebben a passban épp a kezdő kódra váltunk, a lenti „nem létező kijelölés" őrző már
  // az új értéket nézze, ne a záródásban maradt régit (különben `setKod(null)` felülírná).
  const [elozoKezdo, setElozoKezdo] = useState(kezdoKod);
  let ujKod = kod;
  if (kezdoKod !== elozoKezdo) {
    setElozoKezdo(kezdoKod);
    if (kezdoKod && letezik(kezdoKod)) {
      setKod(kezdoKod);
      ujKod = kezdoKod;
    }
  }
  if (ujKod && !letezik(ujKod)) setKod(null);
  const vsElo = vs.filter(letezik);
  if (vsElo.length !== vs.length) setVs(vsElo);

  const kivalaszt = useCallback((k: string) => setKod(k), []);
  const bezar = useCallback(() => setKod(null), []);
  const setMutatoKulcs = useCallback((k: string) => setMutatoKulcsState(mutatoByKulcs(k).kulcs), []);
  const vsHozzaad = useCallback((k: string) => setVs((v) => (v.includes(k) || v.length >= VS_MAX ? v : [...v, k])), []);
  const vsKivesz = useCallback((k: string) => setVs((v) => v.filter((x) => x !== k)), []);
  const vsValt = useCallback(
    (k: string) => setVs((v) => (v.includes(k) ? v.filter((x) => x !== k) : v.length >= VS_MAX ? v : [...v, k])),
    [],
  );
  const vsTorol = useCallback(() => setVs([]), []);

  return {
    kod, vs, vsTele: vs.length >= VS_MAX, mutato: mutatoByKulcs(mutatoKulcs), iparag,
    kivalaszt, bezar, setMutatoKulcs, setIparag, vsHozzaad, vsKivesz, vsValt, vsTorol,
  };
}
