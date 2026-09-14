'use client';

import { geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo';
import { select } from 'd3-selection';
import 'd3-transition';
import { zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior, type ZoomTransform } from 'd3-zoom';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { Button } from '../../../../components/ui/button';
import { geoNev } from '../../../../lib/orszagok';
import {
  orszagSzin, REGIOK, szinSkala, TERKEP_SZINEK, type Csoport, type Mutato, type Rangsor, type Tartomany,
} from '../../../../lib/terkep-mutatok';
import { Jelmagyarazat } from './Jelmagyarazat';
import { RegioGombok } from './RegioGombok';
import { TerkepTooltip, type HoverAllapot } from './TerkepTooltip';
import { useVilagAtlasz } from './useVilagAtlasz';

// A térkép: React rendereli az SVG-t, a d3-geo csak a vetületet és a path-okat adja. A zoom
// (d3-zoom) közvetlenül a DOM-on állítja a <g> transformját, a pinek sugarát és a sraffozás
// csempéjének méretét – nem React-állapoton át, hogy görgetésenként ne renderelődjön újra ~180
// path. A poligonok és a pinek egy memo-komponensben (TerkepRetegek) vannak, hogy a tooltip
// (hover-állapot) frissülése se renderelje őket újra. A kontúrok `vector-effect: non-scaling-stroke`,
// hogy nagyításkor ne hízzanak. A jelmagyarázat a térkép ALATT van, normál folyásban (nem lebegő
// kártya): lebegve elnyelte a bal alsó sarok – Dél-Amerika – egérműveleteit.

const W = 960;
const H = 505;
const PIN_R = 5.5;
const PIN_BELSO_R = 1.8;
const ZOOM_MAX = 8;
const SRAFF_ID = 'terkep-sraff';
/** A betöltő/hiba helykitöltő ugyanolyan arányú, mint a kész SVG, így betöltéskor nem ugrik a layout. */
const ARANY = 'aspect-[960/505]';

const proj = geoNaturalEarth1().fitExtent([[6, 6], [W - 6, H - 6]], { type: 'Sphere' });
const path = geoPath(proj);
const GOMB_D = path({ type: 'Sphere' }) ?? '';
const RACS_D = path(geoGraticule10()) ?? '';

interface Poligon { nev: string; d: string }

type HoverFn = (e: ReactPointerEvent<SVGElement>, nev: string, o: TerkepOrszag | null) => void;

/**
 * A régió bbox-ának vetített befoglaló téglalapjára illesztett transzformáció. A `zoom.transform`
 * NEM alkalmazza a d3 constrain-jét és a scaleExtent-et, ezért a k ≥ 1 és a translateExtent
 * ([[0, 0], [W, H]]) korlátját itt tartjuk be – különben a nézet lelógna a térképről, és az első
 * húzásnál ugrana.
 */
function regioTranszform(bbox: [[number, number], [number, number]]): ZoomTransform {
  const [[ny, d], [k, e]] = bbox;
  const pontok: [number, number][] = [
    [ny, d], [k, d], [ny, e], [k, e], [(ny + k) / 2, d], [(ny + k) / 2, e], [ny, (d + e) / 2], [k, (d + e) / 2],
  ];
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const p of pontok) {
    const q = proj(p);
    if (!q) continue;
    x0 = Math.min(x0, q[0]);
    y0 = Math.min(y0, q[1]);
    x1 = Math.max(x1, q[0]);
    y1 = Math.max(y1, q[1]);
  }
  const kk = Math.min(ZOOM_MAX, Math.max(1, 0.9 / Math.max((x1 - x0) / W, (y1 - y0) / H)));
  const tx = Math.min(0, Math.max(W - kk * W, W / 2 - (kk * (x0 + x1)) / 2));
  const ty = Math.min(0, Math.max(H - kk * H, H / 2 - (kk * (y0 + y1)) / 2));
  return zoomIdentity.translate(tx, ty).scale(kk);
}

/** A pin-réteg köreinek sugarát a nagyítás reciprokával állítja, hogy a pin képernyőn állandó méretű maradjon. */
function pinSugar(pinek: SVGGElement, k: number) {
  pinek.querySelectorAll<SVGCircleElement>('circle[data-pin]').forEach((c) => c.setAttribute('r', String(PIN_R / k)));
  pinek.querySelectorAll<SVGCircleElement>('circle[data-pin-belso]').forEach((c) => c.setAttribute('r', String(PIN_BELSO_R / k)));
}

const TerkepRetegek = memo(function TerkepRetegek({
  poligonok, adatok, rekordGeo, szinek, kivalasztott, osszehasonlitas, onHover, onSelect,
}: {
  poligonok: Poligon[];
  adatok: TerkepOrszag[];
  rekordGeo: Map<string, TerkepOrszag>;
  /** kód → kitöltési szín; null = sraffozás (számszerű mutató érték nélkül). */
  szinek: Map<string, string | null>;
  kivalasztott: string | null;
  osszehasonlitas: readonly string[];
  onHover: HoverFn;
  onSelect: (kod: string) => void;
}) {
  // A kijelölt ország a végére kerül (a szomszéd kontúrja ne takarja), előtte az összehasonlítottak.
  const rendezett = useMemo(() => {
    const rang = (p: Poligon) => {
      const o = rekordGeo.get(p.nev);
      return !o ? 0 : o.kod === kivalasztott ? 2 : osszehasonlitas.includes(o.kod) ? 1 : 0;
    };
    return [...poligonok].sort((a, b) => rang(a) - rang(b));
  }, [poligonok, rekordGeo, kivalasztott, osszehasonlitas]);

  return (
    <>
      {rendezett.map((p) => {
        const o = rekordGeo.get(p.nev) ?? null;
        const szin = o ? szinek.get(o.kod) : undefined;
        const kijelolt = !!o && o.kod === kivalasztott;
        const vsben = !!o && !kijelolt && osszehasonlitas.includes(o.kod);
        return (
          <path
            key={p.nev}
            d={p.d}
            fill={!o ? TERKEP_SZINEK.szarazfold : szin === null ? `url(#${SRAFF_ID})` : szin}
            stroke={kijelolt || vsben ? TERKEP_SZINEK.kontur : TERKEP_SZINEK.hatar}
            strokeWidth={kijelolt ? 1.8 : vsben ? 1.2 : 0.5}
            vectorEffect="non-scaling-stroke"
            className={o ? 'cursor-pointer' : undefined}
            onPointerMove={(e) => onHover(e, o?.nev ?? geoNev(p.nev), o)}
            onClick={o ? () => onSelect(o.kod) : undefined}
          />
        );
      })}
      {/* Külön réteg, hogy a zoom-kezelő csak ezt pásztázza a sugarak állításához. */}
      <g data-pinek="">
        {adatok.map((o) => {
          const p = proj(o.lonlat);
          if (!p) return null;
          const kijelolt = o.kod === kivalasztott;
          return (
            <g
              key={o.kod}
              transform={`translate(${p[0]},${p[1]})`}
              className="cursor-pointer"
              onPointerMove={(e) => onHover(e, o.nev, o)}
              onClick={() => onSelect(o.kod)}
            >
              <circle
                data-pin=""
                r={PIN_R}
                fill={szinek.get(o.kod) ?? TERKEP_SZINEK.nincsAdat}
                stroke={kijelolt ? TERKEP_SZINEK.kontur : TERKEP_SZINEK.hatar}
                strokeWidth={kijelolt ? 2 : 1.4}
                vectorEffect="non-scaling-stroke"
              />
              <circle data-pin-belso="" r={PIN_BELSO_R} fill={TERKEP_SZINEK.hatar} />
            </g>
          );
        })}
      </g>
    </>
  );
});

export function VilagTerkep({
  adatok, mutato, iparag, kivalasztott, osszehasonlitas, tartomany, csoportok, rangsor, onSelect,
}: {
  adatok: TerkepOrszag[];
  mutato: Mutato;
  iparag: string;
  kivalasztott: string | null;
  osszehasonlitas: readonly string[];
  tartomany: Tartomany | null;
  csoportok: Csoport[];
  rangsor: Rangsor | null;
  onSelect: (kod: string) => void;
}) {
  const { feats, hiba } = useVilagAtlasz();
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const patternRef = useRef<SVGPatternElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const kRef = useRef(1);
  const [regio, setRegio] = useState<string | null>('vilag');
  const [hover, setHover] = useState<HoverAllapot | null>(null);

  const poligonok = useMemo<Poligon[] | null>(
    () => feats?.map((f) => ({ nev: f.properties.name, d: path(f) ?? '' })) ?? null,
    [feats],
  );
  const rekordGeo = useMemo(() => new Map(adatok.filter((o) => o.geo).map((o) => [o.geo, o] as const)), [adatok]);
  const szinek = useMemo(() => {
    const skala = tartomany && mutato.tipus === 'szam' ? szinSkala(mutato, tartomany) : null;
    return new Map(adatok.map((o) => [o.kod, orszagSzin(o, mutato, iparag, skala)] as const));
  }, [adatok, mutato, iparag, tartomany]);

  const pinReteg = () => gRef.current?.querySelector<SVGGElement>('[data-pinek]') ?? null;

  // d3-zoom az <svg>-n; a zoom-esemény a DOM-on dolgozik. Kézi zoom/mozgatás (sourceEvent van)
  // után egyik régió-gomb sem aktív. A clickDistance(4) miatt az apró egérmozgás nem nyeli el a kattintást.
  useEffect(() => {
    const svg = svgRef.current;
    const g = gRef.current;
    if (!svg || !g || !poligonok) return;
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, ZOOM_MAX])
      .translateExtent([[0, 0], [W, H]])
      .clickDistance(4)
      .on('zoom', (e: D3ZoomEvent<SVGSVGElement, unknown>) => {
        const { k } = e.transform;
        kRef.current = k;
        g.setAttribute('transform', e.transform.toString());
        const pinek = pinReteg();
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
  }, [poligonok]);

  // Új adatnál (évváltás) az újonnan mountolt pinek sugara igazodjon az aktuális nagyításhoz.
  useEffect(() => {
    const pinek = pinReteg();
    if (pinek) pinSugar(pinek, kRef.current);
  }, [adatok]);

  const onHover = useCallback<HoverFn>((e, nev, o) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return;
    // 120 = a tooltip fél szélessége (max-w-60 → 240 px), hogy ne lógjon ki a konténerből.
    const x = Math.min(Math.max(e.clientX - box.left, 120), box.width - 120);
    setHover({ nev, o, x, y: e.clientY - box.top, magassag: box.height });
  }, []);

  const nagyit = (f: number) => {
    const svg = svgRef.current;
    const z = zoomRef.current;
    if (!svg || !z) return;
    setRegio(null); // kézi nagyítás: a régió-keret már nem érvényes
    select(svg).transition().duration(300).call(z.scaleBy, f);
  };
  const regioValaszt = (kulcs: string) => {
    const r = REGIOK.find((x) => x.kulcs === kulcs);
    const svg = svgRef.current;
    const z = zoomRef.current;
    if (!r || !svg || !z) return;
    setRegio(kulcs);
    select(svg).transition().duration(400).call(z.transform, r.bbox ? regioTranszform(r.bbox) : zoomIdentity);
  };

  if (hiba) {
    return (
      <div className={`flex ${ARANY} items-center justify-center p-6 text-center text-sm text-muted-foreground`}>
        A térkép nem tölthető be.
      </div>
    );
  }
  if (!poligonok) {
    return (
      <div className={`flex ${ARANY} animate-pulse items-center justify-center text-sm text-muted-foreground`}>
        Térkép betöltése…
      </div>
    );
  }
  return (
    <div>
      <div ref={wrapRef} className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="TéT attasé posztok világtérképe"
          className="block h-auto w-full touch-none select-none"
          onPointerLeave={() => setHover(null)}
        >
          {/* Átlátszó háttér a gömbön kívüli sávnak is: itt is törli a tooltipet (a gyerekek eseményei felülírják). */}
          <rect width={W} height={H} fill="transparent" onPointerMove={() => setHover(null)} />
          <defs>
            <pattern ref={patternRef} id={SRAFF_ID} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" fill={TERKEP_SZINEK.szarazfold} />
              <rect width="2" height="6" fill={TERKEP_SZINEK.nincsAdat} />
            </pattern>
          </defs>
          <g ref={gRef}>
            {/* Az óceán-gömb pointermove-ja törli a tooltipet, ha a kurzor a szárazföldről a tengerre ér. */}
            <path d={GOMB_D} fill={TERKEP_SZINEK.ocean} stroke={TERKEP_SZINEK.gombKontur} strokeWidth={0.8} vectorEffect="non-scaling-stroke" onPointerMove={() => setHover(null)} />
            <path d={RACS_D} fill="none" stroke={TERKEP_SZINEK.racs} strokeWidth={0.5} vectorEffect="non-scaling-stroke" pointerEvents="none" />
            <TerkepRetegek
              poligonok={poligonok}
              adatok={adatok}
              rekordGeo={rekordGeo}
              szinek={szinek}
              kivalasztott={kivalasztott}
              osszehasonlitas={osszehasonlitas}
              onHover={onHover}
              onSelect={onSelect}
            />
          </g>
        </svg>
        <div className="absolute top-2.5 left-2.5">
          <RegioGombok aktiv={regio} onValaszt={regioValaszt} />
        </div>
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1">
          <Button type="button" variant="outline" size="icon-sm" aria-label="Nagyítás" onClick={() => nagyit(1.5)}><Plus /></Button>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Kicsinyítés" onClick={() => nagyit(1 / 1.5)}><Minus /></Button>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Alaphelyzet" onClick={() => regioValaszt('vilag')}><RotateCcw /></Button>
        </div>
        {hover && <TerkepTooltip hover={hover} mutato={mutato} rangsor={rangsor} />}
      </div>
      <Jelmagyarazat mutato={mutato} tartomany={tartomany} csoportok={csoportok} iparag={iparag} />
    </div>
  );
}
