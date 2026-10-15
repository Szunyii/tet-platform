'use client';

import { Minus, Plus, RotateCcw } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { Button } from '../../../../components/ui/button';
import {
  orszagSzin, szinSkala, TERKEP_SZINEK, type Csoport, type Mutato, type Rangsor, type Tartomany,
} from '../../../../lib/terkep-mutatok';
import { Jelmagyarazat } from './Jelmagyarazat';
import { RegioGombok } from './RegioGombok';
import { TerkepRetegek, type HoverFn } from './TerkepRetegek';
import { TerkepTooltip, type HoverAllapot } from './TerkepTooltip';
import { useTerkepZoom } from './useTerkepZoom';
import { useVilagAtlasz } from './useVilagAtlasz';
import { GOMB_D, H, RACS_D, SRAFF_ID, W } from './vetulet';

// A térkép: React rendereli az SVG-t, a d3-geo csak a vetületet és a path-okat adja. A zoom a
// `useTerkepZoom`-ban, a vetület a `vetulet.ts`-ben, a poligon- és pin-réteg a `TerkepRetegek`
// memo-komponensben van – a tooltip (hover-állapot) frissülése így nem rendereli újra őket. A kontúrok
// `vector-effect: non-scaling-stroke`, hogy nagyításkor ne hízzanak. A jelmagyarázat a térkép ALATT van,
// normál folyásban (nem lebegő kártya): lebegve elnyelte a bal alsó sarok – Dél-Amerika – egérműveleteit.

/** A betöltő/hiba helykitöltő ugyanolyan arányú, mint a kész SVG, így betöltéskor nem ugrik a layout. */
const ARANY = 'aspect-[960/505]';

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
  const { poligonok, hiba } = useVilagAtlasz();
  const { svgRef, gRef, patternRef, regio, nagyit, regioValaszt } = useTerkepZoom(poligonok !== null, adatok);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<HoverAllapot | null>(null);

  const rekordGeo = useMemo(() => new Map(adatok.filter((o) => o.geo).map((o) => [o.geo, o] as const)), [adatok]);
  const szinek = useMemo(() => {
    const skala = tartomany && mutato.tipus === 'szam' ? szinSkala(mutato, tartomany) : null;
    return new Map(adatok.map((o) => [o.kod, orszagSzin(o, mutato, iparag, skala)] as const));
  }, [adatok, mutato, iparag, tartomany]);

  const onHover = useCallback<HoverFn>((e, nev, o) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return;
    // A nyers kurzor-pozíció és a konténer mérete: a tooltip maga tartja magát a konténeren belül (TerkepTooltip).
    setHover({ nev, o, x: e.clientX - box.left, y: e.clientY - box.top, szelesseg: box.width, magassag: box.height });
  }, []);

  // A jelmagyarázat a betöltő/hiba állapotban is ott van, hogy a kártya magassága ne ugorjon a térkép beérkezésekor.
  const jelmagyarazat = <Jelmagyarazat mutato={mutato} tartomany={tartomany} csoportok={csoportok} iparag={iparag} />;

  if (hiba) {
    return (
      <div>
        <div className={`flex ${ARANY} items-center justify-center p-6 text-center text-sm text-muted-foreground`}>
          A térkép nem tölthető be.
        </div>
        {jelmagyarazat}
      </div>
    );
  }
  if (!poligonok) {
    return (
      <div>
        <div className={`flex ${ARANY} animate-pulse items-center justify-center text-sm text-muted-foreground`}>
          Térkép betöltése…
        </div>
        {jelmagyarazat}
      </div>
    );
  }
  return (
    <div>
      <div ref={wrapRef} className="relative">
        {/* role="img": a poligonok és pinek a segítő technológiának nem interaktívak – a billentyűzetes egyenértékes a RangsorPanel (minden ország gomb). */}
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
      {jelmagyarazat}
    </div>
  );
}
