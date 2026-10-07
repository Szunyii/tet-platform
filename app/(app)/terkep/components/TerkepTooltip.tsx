'use client';

import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { attaseFelirat } from '../../../../lib/attase-orszag';
import { ALLAPOT_CIMKE } from '../../../../lib/orszagprofil-szotar';
import { ertekEsHely, type Mutato, type Rangsor } from '../../../../lib/terkep-mutatok';

/** A tooltip legnagyobb szélessége (px); ennél keskenyebb konténerben a konténer szélessége. */
const TOOLTIP_SZELESSEG = 320;

/** Legfeljebb ennyi attasé látszik, a többi helyén „+N további attasé” (a tooltip nem görgethető). */
const ATTASE_MAX = 4;

/**
 * A lebegtetett poligon/pin: `o` null, ha az országnak nincs aktív attaséja és profilja; x/y a kurzor a térkép-konténerhez
 * képest, `szelesseg`/`magassag` a konténer mérete (ezekkel marad a tooltip a konténeren belül).
 */
export interface HoverAllapot { nev: string; o: TerkepOrszag | null; x: number; y: number; szelesseg: number; magassag: number }

/** A mutató sora: számszerűnél érték + helyezés (ha a rangsorban van), kategorikusnál a kategória. */
function mutatoSor(o: TerkepOrszag, mutato: Mutato, rangsor: Rangsor | null): string | null {
  if (mutato.tipus === 'szam') {
    return `${mutato.cimke}: ${ertekEsHely(o, mutato, rangsor) ?? 'nincs adat'}`;
  }
  // Az állapot- és az iparág-sor úgyis ott van a tooltipben (az iparág mutató az első kiemelt iparágat írná ki mégegyszer).
  if (mutato.kulcs === 'allapot' || mutato.kulcs === 'iparag') return null;
  const k = mutato.kategoria(o);
  return k === null ? mutato.nincsCimke : (mutato.cimkek[k] ?? k);
}

/**
 * Az ország attaséi a lekérdezés sorrendjében (vezető, a többi székhelyes, a régiósak): „Név · Város”, több attasénál a
 * vezetőnél „relációs vezető” címkével, alatta a részterület legfeljebb 2 sorban – a teljes szöveg a kivonat-panelen.
 * Egy attasénál nincs címke: ott a vezetőség automatikus (mint a profil oldalán).
 */
function AttaseSorok({ o }: { o: TerkepOrszag }) {
  if (o.attasek.length === 0) return <p className="text-background/70">nincs aktív attasé</p>;
  const tobb = o.attasek.length > 1;
  const rejtett = o.attasek.length - ATTASE_MAX;
  return (
    <ul className="mt-0.5 mb-1 flex flex-col gap-1">
      {o.attasek.slice(0, ATTASE_MAX).map((a) => (
        <li key={a.userId}>
          <p>
            {attaseFelirat(a, o.kod)}
            {tobb && a.vezeto && (
              <>
                {' '}
                <span className="ml-1 rounded-sm bg-background/20 px-1 text-[10px] font-medium whitespace-nowrap">relációs vezető</span>
              </>
            )}
          </p>
          {a.reszterulet && <p className="line-clamp-2 text-background/60">{a.reszterulet}</p>}
        </li>
      ))}
      {rejtett > 0 && <li className="text-background/70">+{rejtett} további attasé</li>}
    </ul>
  );
}

export function TerkepTooltip({ hover, mutato, rangsor }: { hover: HoverAllapot; mutato: Mutato; rangsor: Rangsor | null }) {
  const { o, x, y, szelesseg, magassag } = hover;
  const sor = o ? mutatoSor(o, mutato, rangsor) : null;
  // A kártya `overflow-hidden`, ezért a tooltip a konténeren belül marad. Függőlegesen arra az oldalra kerül,
  // ahol több a hely (a kurzor fölé, ha ott legalább annyi hely van, mint alatta, különben alá), vízszintesen
  // a kurzor fölé középre; a clamp() mindkét tengelyen bent tartja. A translate %-a a tooltip saját méretére
  // vonatkozik, így a tényleges szélességgel és magassággal számol; ha a tooltip magasabb a konténernél, a
  // teteje igazodik. A szélesség a tartalomhoz igazodik (`w-max`), legfeljebb TOOLTIP_SZELESSEG, keskeny
  // konténerben annak szélessége; a `break-words` (öröklődik) a szóköz nélküli szöveget is tördeli.
  const lent = magassag - y > y;
  const tx = `clamp(${-x}px, -50%, calc(${szelesseg - x}px - 100%))`;
  const ty = `clamp(${-y}px, ${lent ? '16px' : 'calc(-100% - 12px)'}, calc(${magassag - y}px - 100%))`;
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 w-max rounded-md bg-foreground px-2.5 py-2 text-[11px] leading-snug break-words text-background shadow-lg"
      style={{ left: x, top: y, maxWidth: `min(${TOOLTIP_SZELESSEG}px, 100%)`, transform: `translate(${tx}, ${ty})` }}
    >
      <p className="mb-0.5 text-xs font-semibold">{hover.nev}</p>
      {o ? (
        <>
          <AttaseSorok o={o} />
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
