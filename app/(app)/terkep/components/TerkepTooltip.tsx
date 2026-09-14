'use client';

import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { ALLAPOT_CIMKE } from '../../../../lib/orszagprofil-szotar';
import { formatSzam } from '../../../../lib/szam';
import type { Mutato, Rangsor } from '../../../../lib/terkep-mutatok';

/** A lebegtetett poligon/pin: `o` null, ha poszt nélküli ország; x/y a térkép-konténerhez képest. */
export interface HoverAllapot { nev: string; o: TerkepOrszag | null; x: number; y: number }

/** Ennél kisebb y-nál nincs hely a kurzor fölött (a tooltip legfeljebb ~140 px magas): a kurzor alá kerül. */
const FLIP_Y = 150;

/** A mutató sora: számszerűnél érték + helyezés (ha a rangsorban van), kategorikusnál a kategória. */
function mutatoSor(o: TerkepOrszag, mutato: Mutato, rangsor: Rangsor | null): string | null {
  if (mutato.tipus === 'szam') {
    const v = mutato.ertek(o);
    if (v === null) return `${mutato.cimke}: nincs adat`;
    const sor = rangsor?.sorok.find((s) => s.o.kod === o.kod);
    return `${mutato.cimke}: ${formatSzam(v, mutato.utotag)}${sor && rangsor ? ` · ${sor.hely}./${rangsor.sorok.length}` : ''}`;
  }
  if (mutato.kulcs === 'allapot') return null; // az állapot-sor úgyis ott van
  const k = mutato.kategoria(o);
  return k === null ? mutato.nincsCimke : (mutato.cimkek[k] ?? k);
}

export function TerkepTooltip({ hover, mutato, rangsor }: { hover: HoverAllapot; mutato: Mutato; rangsor: Rangsor | null }) {
  const { o } = hover;
  const sor = o ? mutatoSor(o, mutato, rangsor) : null;
  // A kártya `overflow-hidden`, ezért a térkép tetejénél a kurzor fölé rajzolt tooltip levágódna: ott alá kerül.
  const lent = hover.y < FLIP_Y;
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 max-w-60 rounded-md bg-foreground px-2.5 py-2 text-[11px] leading-snug text-background shadow-lg"
      style={lent
        ? { left: hover.x, top: hover.y + 16, transform: 'translate(-50%, 0)' }
        : { left: hover.x, top: hover.y - 12, transform: 'translate(-50%, -100%)' }}
    >
      <p className="mb-0.5 text-xs font-semibold">{hover.nev}</p>
      {o ? (
        <>
          <p className="text-background/70">{o.attase ?? 'nincs aktív attasé'}{o.poszt?.fovaros ? ` · ${o.poszt.fovaros}` : ''}</p>
          {sor && <p className="text-background/70">{sor}</p>}
          <p className="text-background/70">{ALLAPOT_CIMKE[o.allapot]}{o.ev ? ` · ${o.ev}` : ''}</p>
          {o.iparagak.length > 0 && <p className="text-background/70">Kiemelt: {o.iparagak.slice(0, 2).join(', ')}</p>}
        </>
      ) : (
        <p className="text-background/70">Nincs kihelyezett TéT attasé</p>
      )}
    </div>
  );
}
