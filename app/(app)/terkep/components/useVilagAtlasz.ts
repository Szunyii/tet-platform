import { useEffect, useState } from 'react';
import type { Feature, Geometry } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';

export type OrszagFeature = Feature<Geometry, { name: string }>;

type Atlasz = Topology<{ countries: GeometryCollection<{ name: string }> }>;

// Modulszintű promise: a world-atlas chunk és a TopoJSON → GeoJSON átalakítás egyszer fut,
// minden hívó ugyanazt a tömböt kapja. Hiba után nullázzuk, hogy a következő mount újrapróbálja.
let atlaszPromise: Promise<OrszagFeature[]> | null = null;

function betolt(): Promise<OrszagFeature[]> {
  if (!atlaszPromise) {
    atlaszPromise = Promise.all([import('world-atlas/countries-110m.json'), import('topojson-client')])
      .then(([topo, tc]) => {
        const t = topo.default as unknown as Atlasz;
        return tc.feature(t, t.objects.countries).features;
      });
    atlaszPromise.catch(() => { atlaszPromise = null; });
  }
  return atlaszPromise;
}

/** A world-atlas 110m országpoligonjai; `feats` null, amíg töltődik, `hiba` true, ha a chunk nem jött be. */
export function useVilagAtlasz(): { feats: OrszagFeature[] | null; hiba: boolean } {
  const [feats, setFeats] = useState<OrszagFeature[] | null>(null);
  const [hiba, setHiba] = useState(false);
  useEffect(() => {
    let aktiv = true;
    betolt().then(
      (f) => { if (aktiv) setFeats(f); },
      () => { if (aktiv) setHiba(true); },
    );
    return () => { aktiv = false; };
  }, []);
  return { feats, hiba };
}
