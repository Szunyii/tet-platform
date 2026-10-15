'use client';

import { select } from 'd3-selection';
import 'd3-transition';
import { zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior } from 'd3-zoom';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { REGIOK } from '../../../../lib/terkep-mutatok';
import {
  H, PIN_BELSO_R, PIN_BELSO_SEL, PIN_R, PIN_RETEG_SEL, PIN_SEL, regioTranszform, W, ZOOM_MAX,
} from './vetulet';

/** A pin-réteg (külön `<g data-pinek>`, hogy csak ezt kelljen pásztázni). */
function pinReteg(g: SVGGElement | null): SVGGElement | null {
  return g?.querySelector<SVGGElement>(PIN_RETEG_SEL) ?? null;
}

/** A pin-réteg köreinek sugarát a nagyítás reciprokával állítja, hogy a pin képernyőn állandó méretű maradjon. */
function pinSugar(pinek: SVGGElement, k: number) {
  pinek.querySelectorAll<SVGCircleElement>(PIN_SEL).forEach((c) => c.setAttribute('r', String(PIN_R / k)));
  pinek.querySelectorAll<SVGCircleElement>(PIN_BELSO_SEL).forEach((c) => c.setAttribute('r', String(PIN_BELSO_R / k)));
}

/**
 * A térkép nagyítása (d3-zoom az `<svg>`-n). A zoom-esemény közvetlenül a DOM-on dolgozik – a `<g>`
 * transformja, a pinek sugara és a sraffozás csempéje –, nem React-állapoton át, hogy görgetésenként ne
 * renderelődjön újra ~180 path. Kézi zoom/mozgatás (sourceEvent van) után egyik régió-gomb sem aktív. A
 * clickDistance(4) miatt az apró egérmozgás nem nyeli el a kattintást. `svgMountolva`: a poligonok
 * betöltődtek, az `<svg>` mountolva van; új `adatok`-nál (évváltás) az újonnan mountolt pinek sugara igazodik az aktuális
 * nagyításhoz. A `nagyit` és a `regioValaszt` stabil (useCallback), a memo-zott gombok nem renderelődnek újra.
 */
export function useTerkepZoom(svgMountolva: boolean, adatok: readonly TerkepOrszag[]) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const patternRef = useRef<SVGPatternElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const kRef = useRef(1);
  const [regio, setRegio] = useState<string | null>('vilag');

  useEffect(() => {
    const svg = svgRef.current;
    const g = gRef.current;
    if (!svgMountolva || !svg || !g) return;
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, ZOOM_MAX])
      .translateExtent([[0, 0], [W, H]])
      .clickDistance(4)
      .on('zoom', (e: D3ZoomEvent<SVGSVGElement, unknown>) => {
        const { k } = e.transform;
        kRef.current = k;
        g.setAttribute('transform', e.transform.toString());
        const pinek = pinReteg(g);
        if (pinek) pinSugar(pinek, k);
        // A sraffozás csempéje a nagyított <g> terében van: 1/k-val visszaskálázva képernyőn állandó marad.
        patternRef.current?.setAttribute('patternTransform', `rotate(45) scale(${1 / k})`);
        if (e.sourceEvent) setRegio(null);
      });
    select(svg).call(z);
    zoomRef.current = z;
    return () => {
      select(svg).on('.zoom', null);
      zoomRef.current = null;
    };
  }, [svgMountolva]);

  useEffect(() => {
    const pinek = pinReteg(gRef.current);
    if (pinek) pinSugar(pinek, kRef.current);
  }, [adatok]);

  const nagyit = useCallback((f: number) => {
    const svg = svgRef.current;
    const z = zoomRef.current;
    if (!svg || !z) return;
    setRegio(null); // kézi nagyítás: a régió-keret már nem érvényes
    select(svg).transition().duration(300).call(z.scaleBy, f);
  }, []);

  const regioValaszt = useCallback((kulcs: string) => {
    const r = REGIOK.find((x) => x.kulcs === kulcs);
    const svg = svgRef.current;
    const z = zoomRef.current;
    if (!r || !svg || !z) return;
    setRegio(kulcs);
    select(svg).transition().duration(400).call(z.transform, r.bbox ? regioTranszform(r.bbox) : zoomIdentity);
  }, []);

  return { svgRef, gRef, patternRef, regio, nagyit, regioValaszt };
}
