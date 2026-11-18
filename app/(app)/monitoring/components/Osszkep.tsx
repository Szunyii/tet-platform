import type { ElozmenySor } from '../../../../db/queries/ertekeles';
import { formatDatumIdo } from '../../../../lib/datum';
import type { Felev } from '../../../../lib/ertekeles-idoszak';
import { IdosorMatrix } from './IdosorMatrix';

function Cim({ children }: { children: string }) {
  return <h3 className="mb-1 text-[11px] font-semibold text-muted-foreground">{children}</h3>;
}

/**
 * A lezárt félév összképe: az összminősítés indoklása és a fejlesztési cél, mellette az idősor-mátrix. Az
 * összminősítés fokozata és a változás a fejlécben áll.
 */
export function Osszkep({
  osszIndoklas,
  fejlesztesiCel,
  ertekeloNev,
  minositveAt,
  elozmeny,
  felev,
}: {
  osszIndoklas: string | null;
  fejlesztesiCel: string | null;
  ertekeloNev: string | null;
  minositveAt: Date | null;
  elozmeny: readonly ElozmenySor[];
  felev: Felev;
}) {
  return (
    <div className="grid gap-3 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section className="min-w-0 rounded-xl border border-border bg-card p-3.5 text-[12.5px]">
        <Cim>Összminősítés indoklása</Cim>
        {osszIndoklas ? (
          <p className="mb-3 whitespace-pre-line wrap-anywhere">{osszIndoklas}</p>
        ) : (
          <p className="mb-3 text-muted-foreground">Nincs rögzített indoklás.</p>
        )}
        <Cim>Fejlesztési cél</Cim>
        {fejlesztesiCel ? (
          <p className="whitespace-pre-line wrap-anywhere">{fejlesztesiCel}</p>
        ) : (
          <p className="text-muted-foreground">Nincs fejlesztési cél megadva.</p>
        )}
        {ertekeloNev !== null && (
          <p className="mt-3 text-[11px] text-muted-foreground">
            Minősítette: {ertekeloNev}
            {minositveAt !== null && <>, {formatDatumIdo(minositveAt)}</>}
          </p>
        )}
      </section>
      <section className="min-w-0 rounded-xl border border-border bg-card p-3.5">
        <h3 className="mb-1 text-[11px] font-semibold text-muted-foreground">Félévek alakulása</h3>
        <p className="mb-2 text-[11px] text-muted-foreground">Az utolsó legfeljebb négy lezárt félév.</p>
        <IdosorMatrix elozmeny={elozmeny} felev={felev} />
      </section>
    </div>
  );
}
