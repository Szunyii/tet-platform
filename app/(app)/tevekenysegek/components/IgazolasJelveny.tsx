import { IGAZOLAS_CIMKE, type IgazolasAllapot } from '../../../../lib/tevekenyseg-szotar';
import { cn } from '../../../../lib/utils';

const OSZTALY: Record<IgazolasAllapot, string> = {
  nem_igenyel: 'bg-muted text-muted-foreground',
  igazolasra_var: 'bg-amber-100 text-amber-900',
  igazolt: 'bg-emerald-100 text-emerald-900',
  visszakuldott: 'bg-red-100 text-red-900',
};

/** A jel a szín mellett szöveg nélkül is megkülönbözteti az állapotokat. */
const JEL: Record<IgazolasAllapot, string> = {
  nem_igenyel: '–',
  igazolasra_var: '…',
  igazolt: '✓',
  visszakuldott: '↩',
};

/** Az ügy igazolási állapota: jel és felirat, a szín csak kiegészítés. */
export function IgazolasJelveny({ igazolas }: { igazolas: IgazolasAllapot }) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1 rounded-[10px] px-2 py-0.5 text-[11px] font-semibold',
        OSZTALY[igazolas],
      )}
    >
      <span aria-hidden="true">{JEL[igazolas]}</span>
      {IGAZOLAS_CIMKE[igazolas]}
    </span>
  );
}
