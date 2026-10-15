'use client';

import { useEffect, useState } from 'react';
import type { GeometryCollection, Topology } from 'topojson-specification';
import { path } from './vetulet';

/** Egy ország poligonja: a world-atlas neve (`properties.name`) és a kész SVG path. */
export interface Poligon { nev: string; d: string }

type Atlasz = Topology<{ countries: GeometryCollection<{ name: string }> }>;

// Modulszintű promise: a world-atlas chunk, a TopoJSON → GeoJSON átalakítás és a path-ok előállítása
// (a vetület rögzített) egyszer fut, minden hívó ugyanazt a tömböt kapja – a /terkep-re visszatérve sem
// számolódik újra. Hiba után nullázzuk, hogy a következő mount újrapróbálja.
let atlaszPromise: Promise<Poligon[]> | null = null;

function betolt(): Promise<Poligon[]> {
  if (!atlaszPromise) {
    atlaszPromise = Promise.all([import('world-atlas/countries-110m.json'), import('topojson-client')])
      .then(([topo, tc]) => {
        const t = topo.default as unknown as Atlasz;
        return tc.feature(t, t.objects.countries).features.map((f) => ({ nev: f.properties.name, d: path(f) ?? '' }));
      });
    atlaszPromise.catch(() => { atlaszPromise = null; });
  }
  return atlaszPromise;
}

/**
 * A world-atlas 110m országpoligonjai path-tal; `poligonok` null, amíg töltődik, `hiba` true, ha a chunk
 * nem jött be. A visszaadott tömb modulszinten megosztott (minden hívó ugyanazt kapja): ne mutáld.
 */
export function useVilagAtlasz(): { poligonok: Poligon[] | null; hiba: boolean } {
  const [poligonok, setPoligonok] = useState<Poligon[] | null>(null);
  const [hiba, setHiba] = useState(false);
  useEffect(() => {
    let aktiv = true;
    betolt().then(
      (p) => { if (aktiv) setPoligonok(p); },
      () => { if (aktiv) setHiba(true); },
    );
    return () => { aktiv = false; };
  }, []);
  return { poligonok, hiba };
}
