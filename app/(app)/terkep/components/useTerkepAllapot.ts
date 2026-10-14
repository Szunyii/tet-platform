'use client';

import { useCallback, useMemo, useState } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { hazaiRekord, VS_SZINEK, vsHozzaadElem, type VsElem } from '../../../../lib/osszehasonlitas';
import { ALAP_MUTATO, mutatoByKulcs, type Mutato, type MutatoKulcs } from '../../../../lib/terkep-mutatok';

/** Legfeljebb ennyi ország lehet az összehasonlításban: ahány színe van (`VS_SZINEK`). */
export const VS_MAX = VS_SZINEK.length;

export interface TerkepAllapot {
  /** Egyes kijelölés (a kivonat országa). */
  kod: string | null;
  /**
   * Összehasonlítás-halmaz a hozzáadás sorrendjében, Magyarország nélkül (az mindig viszonyítási
   * alap). Csak tényleges változásnál új példány (a hívó memói erre épülnek); ne mutáld.
   */
  vs: readonly string[];
  /** Kód → az ország színe az összehasonlításban (`VS_SZINEK`); amíg az ország a halmazban van, nem változik. */
  vsSzinek: Readonly<Record<string, string>>;
  /** Magyarország rekordja, ha legfeljebb a nézett évig van profilja (`hazaiRekord`): az összehasonlítás viszonyítási alapja. */
  hazai: TerkepOrszag | null;
  /** Ennyi országtól látszik az összehasonlítás: 1, ha van magyar viszonyítási alap (`hazai`), különben 2. */
  vsMin: number;
  /** `vs.length >= VS_MAX` – a hozzáadás-gombok letiltásához. */
  vsTele: boolean;
  mutato: Mutato;
  /** Iparág-szűrő, '' = nincs. */
  iparag: string;
  kivalaszt: (kod: string) => void;
  bezar: () => void;
  setMutatoKulcs: (k: string) => void;
  setIparag: (i: string) => void;
  /** Hozzáadás a legkisebb szabad színnel; Magyarországra, a már benne lévőre és tele halmazra nem csinál semmit (`vsHozzaadElem`). */
  vsHozzaad: (kod: string) => void;
  /** Kivétel; a többi ország színe marad. Ha az ország nincs benne, nem csinál semmit. */
  vsKivesz: (kod: string) => void;
  /** Hozzáad, ha nincs benne (és van hely); kivesz, ha benne van – a „+"/pipa gombok művelete. Magyarországra nem csinál semmit. */
  vsValt: (kod: string) => void;
  vsTorol: () => void;
}

/**
 * A térkép-oldal kliens-állapota. A jobb panel a hívóban: `kod` → kivonat, különben rangsor; az
 * összehasonlítás a térkép alatt jelenik meg, ha `vs.length >= vsMin`. Évváltáskor (új `adatok`) a nem
 * létező kijelölés és halmaz-elemek render közben kikerülnek (a kieső ország színe felszabadul), a
 * `?o=` (kezdoKod) változására a kijelölés frissül, a többi állapot marad – ez a React „prop
 * változásra állapot igazítása" mintája, ezért a page NEM ad `key`-t a nézetnek. A visszaadott
 * objektum renderenként új (nem memoizálható).
 */
export function useTerkepAllapot(adatok: TerkepOrszag[], kezdoKod: string | null): TerkepAllapot {
  const letezik = (k: string) => adatok.some((o) => o.kod === k);
  const [kod, setKod] = useState<string | null>(() => (kezdoKod && letezik(kezdoKod) ? kezdoKod : null));
  // Az összehasonlítás-halmaz: az ország és a színe; kifelé a `vs` kódlista és a `vsSzinek` térkép.
  const [vsElemek, setVsElemek] = useState<readonly VsElem[]>([]);
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
  const vsElo = vsElemek.filter((e) => letezik(e.kod));
  if (vsElo.length !== vsElemek.length) setVsElemek(vsElo);

  const vs = useMemo(() => vsElemek.map((e) => e.kod), [vsElemek]);
  const vsSzinek = useMemo(
    () => Object.fromEntries(vsElemek.map((e) => [e.kod, VS_SZINEK[e.szin]])),
    [vsElemek],
  );

  const kivalaszt = useCallback((k: string) => setKod(k), []);
  const bezar = useCallback(() => setKod(null), []);
  const setMutatoKulcs = useCallback((k: string) => setMutatoKulcsState(mutatoByKulcs(k).kulcs), []);
  const vsHozzaad = useCallback((k: string) => setVsElemek((v) => vsHozzaadElem(v, k)), []);
  const vsKivesz = useCallback(
    (k: string) => setVsElemek((v) => (v.some((e) => e.kod === k) ? v.filter((e) => e.kod !== k) : v)),
    [],
  );
  const vsValt = useCallback(
    (k: string) => setVsElemek((v) => (v.some((e) => e.kod === k) ? v.filter((e) => e.kod !== k) : vsHozzaadElem(v, k))),
    [],
  );
  // Üres halmaznál ugyanaz a példány marad: a `vs` csak tényleges változásnál új.
  const vsTorol = useCallback(() => setVsElemek((v) => (v.length === 0 ? v : [])), []);

  const hazai = hazaiRekord(adatok);
  return {
    kod, vs, vsSzinek, hazai, vsMin: hazai ? 1 : 2, vsTele: vs.length >= VS_MAX,
    mutato: mutatoByKulcs(mutatoKulcs), iparag,
    kivalaszt, bezar, setMutatoKulcs, setIparag, vsHozzaad, vsKivesz, vsValt, vsTorol,
  };
}
