'use client';

import Script from 'next/script';
import { useEffect, useMemo, useRef } from 'react';
import type { TerkepOrszag } from '../db/queries/orszagprofil';
import { ALLAPOT_CIMKE, ALLAPOT_SZINEK, ALLAPOTOK, IPARAG_SZINEK } from '../lib/orszagprofil-szotar';

// A <tet-world-map> webkomponens (public/tet-world-map.js) d3-geo alapú; a d3 és a
// topojson CDN-ről töltődik, a komponens megvárja őket. Az adatot, a színtáblákat, az
// állapot-sorrendet és -címkéket egy JSON attribútumban kapja, így a JS fájlban nincs
// hardcode-olt színtábla vagy címke-lista.
// A TerkepOrszag csak típusként jön a server-only modulból (`import type`), a kliens
// bundle-ba DB-kód nem kerül.

export type MapMetric = 'iparag' | 'allapot';

interface Props {
  adatok: TerkepOrszag[];
  metric: MapMetric;
  iparag: string;
  selected: string;
  onSelect: (kod: string) => void;
}

export default function WorldMap({ adatok, metric, iparag, selected, onSelect }: Props) {
  const ref = useRef<HTMLElement>(null);

  const dataJson = useMemo(
    () => JSON.stringify({
      orszagok: adatok.map((o) => ({
        kod: o.kod, nev: o.nev, geo: o.geo, lonlat: o.lonlat, attase: o.attase,
        ev: o.ev, allapot: o.allapot, iparagak: o.iparagak,
      })),
      szinek: { iparag: IPARAG_SZINEK, allapot: ALLAPOT_SZINEK },
      allapotok: ALLAPOTOK,
      cimkek: { allapot: ALLAPOT_CIMKE },
    }),
    [adatok],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: Event) => {
      const d = (e as CustomEvent<{ kod?: string }>).detail;
      if (d?.kod) onSelect(d.kod);
    };
    el.addEventListener('tet-country-select', handler);
    return () => el.removeEventListener('tet-country-select', handler);
  }, [onSelect]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute('data', dataJson);
    el.setAttribute('metric', metric);
    el.setAttribute('iparag', iparag);
    el.setAttribute('selected', selected);
  }, [dataJson, metric, iparag, selected]);

  return (
    <>
      <Script src="https://unpkg.com/d3@7.9.0/dist/d3.min.js" strategy="afterInteractive" />
      <Script src="https://unpkg.com/topojson-client@3.1.0/dist/topojson-client.min.js" strategy="afterInteractive" />
      <Script src="/tet-world-map.js" strategy="afterInteractive" />
      {/* @ts-expect-error egyedi webkomponens elem */}
      <tet-world-map ref={ref} style={{ display: 'block', minHeight: 420 }} />
    </>
  );
}
