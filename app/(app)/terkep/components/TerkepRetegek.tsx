'use client';

import { memo, useMemo, type PointerEvent as ReactPointerEvent } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { geoNev } from '../../../../lib/orszagok';
import { TERKEP_SZINEK } from '../../../../lib/terkep-mutatok';
import type { Poligon } from './useVilagAtlasz';
import { PIN_BELSO_R, PIN_R, proj, SRAFF_ID } from './vetulet';

export type HoverFn = (e: ReactPointerEvent<SVGElement>, nev: string, o: TerkepOrszag | null) => void;

export const TerkepRetegek = memo(function TerkepRetegek({
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
      {/* Külön réteg, hogy a zoom-kezelő csak ezt pásztázza a sugarak állításához. A data-pinek, data-pin és
          data-pin-belso attribútumokra a useTerkepZoom keres – vetulet.ts. */}
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
