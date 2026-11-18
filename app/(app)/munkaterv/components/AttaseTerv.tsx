import type { ReactNode } from 'react';
import type { TervNezet } from '../../../../db/queries/munkaterv';
import { CEL_MAX, CEL_MIN, szerkeszthetoTerv } from '../../../../lib/munkaterv-szotar';
import { CelTabla, type CelTablaMod } from './CelTabla';
import { EvValaszto } from './EvValaszto';
import { AttaseTervMuveletek, TervKezdesGomb } from './TervMuveletek';
import { Tajekoztato, TervFejlec, TervUzenetek } from './TervReszek';

/** Az attasé terv nélküli nézetének oka: évfüggő hiány, ezért tájékoztató szöveg, nem 404. */
export type TervHiany = 'nincs_kozzeteve' | 'kezdheto' | 'mult';

function HianyKartya({ hiany, ev }: { hiany: TervHiany; ev: number }): ReactNode {
  if (hiany === 'nincs_kozzeteve') return <p>A központi célok még nem jelentek meg.</p>;
  if (hiany === 'mult') return <p>Erre az évre nem készült munkaterved.</p>;
  return (
    <>
      <p>A(z) {ev}. évi központi célok megjelentek. A rád vonatkozó célok automatikusan bekerülnek a tervedbe.</p>
      <TervKezdesGomb ev={ev} />
    </>
  );
}

function tablaMod(terv: TervNezet, tartalomNyitva: boolean): CelTablaMod {
  if (tartalomNyitva && szerkeszthetoTerv(terv.statusz)) return 'szerkeszt';
  return terv.statusz === 'jovahagyott' ? 'allapot' : 'olvas';
}

/** Az attasé `/munkaterv` nézete: a saját terve a megnyitott évre, vagy a hiány oka. */
export function AttaseTerv({
  terv,
  hiany,
  nev,
  varos,
  ev,
  evek,
  orszagok,
  tartalomNyitva,
}: {
  terv: TervNezet | null;
  hiany: TervHiany;
  nev: string;
  varos: string | null;
  ev: number;
  evek: readonly number[];
  orszagok: readonly string[];
  /** A folyó és a következő év terve szerkeszthető; a múltbelié már nem. */
  tartalomNyitva: boolean;
}) {
  const hely = [nev, varos].filter(Boolean).join(' · ');
  const alcim = terv ? `${hely} · ${terv.celok.length} cél (${CEL_MIN}–${CEL_MAX} lehet)` : hely;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <TervFejlec cim={`Éves munkaterv · ${ev}`} alcim={alcim} terv={terv} jobbra={<EvValaszto ev={ev} evek={evek} />} />
      {terv ? (
        <>
          <TervUzenetek terv={terv} />
          <CelTabla celok={terv.celok} mod={tablaMod(terv, tartalomNyitva)} terv={{ id: terv.id, verzio: terv.verzio }} orszagok={orszagok} />
          <AttaseTervMuveletek terv={terv} tartalomNyitva={tartalomNyitva} />
        </>
      ) : (
        <Tajekoztato>
          <HianyKartya hiany={hiany} ev={ev} />
        </Tajekoztato>
      )}
    </div>
  );
}
