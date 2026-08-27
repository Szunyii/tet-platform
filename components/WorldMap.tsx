'use client';

import Script from 'next/script';
import { useEffect, useMemo, useRef } from 'react';
import { POSTS, type Post } from '../lib/data';
import { nyitottsag } from '../lib/score';

// A <tet-world-map> webkomponens (public/tet-world-map.js) d3-geo alapú;
// a d3 és topojson CDN-ről töltődik, a komponens megvárja őket.

export type MapMetric = 'focus' | 'risk' | 'open';

interface Props {
  metric: MapMetric;
  field: string;
  selected: string;
  onSelect: (p: Post) => void;
}

export default function WorldMap({ metric, field, selected, onSelect }: Props) {
  const ref = useRef<HTMLElement>(null);

  const dataJson = useMemo(
    () => JSON.stringify(POSTS.map((p) => ({
      ...p, kockazat: p.politika.kockazat, nyitottsag: nyitottsag(p), pin: true,
    }))),
    [],
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d && d.geo) {
        const post = POSTS.find((p) => p.geo === d.geo);
        if (post) onSelect(post);
      }
    };
    document.addEventListener('tet-country-select', handler);
    return () => document.removeEventListener('tet-country-select', handler);
  }, [onSelect]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute('data', dataJson);
    el.setAttribute('metric', metric);
    el.setAttribute('field', field);
    el.setAttribute('selected', selected);
  }, [dataJson, metric, field, selected]);

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
