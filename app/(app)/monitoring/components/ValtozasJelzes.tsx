import type { Valtozas } from '../../../../lib/ertekeles-osszesites';
import { cn } from '../../../../lib/utils';

const VALTOZASOK: Record<Valtozas, { jel?: string; felirat: string; osztaly: string }> = {
  javult: { jel: '▲', felirat: 'javult', osztaly: 'text-[#0b6455]' },
  romlott: { jel: '▼', felirat: 'romlott', osztaly: 'text-[#a3211a]' },
  azonos: { jel: '=', felirat: 'azonos', osztaly: 'text-[#5a6472]' },
  uj: { felirat: 'új', osztaly: 'text-[#5a6472]' },
};

/** Az összminősítés változása az előző lezárt félévhez képest; összminősítés nélkül „–”. */
export function ValtozasJelzes({ valtozas }: { valtozas: Valtozas | null }) {
  if (valtozas === null) {
    return (
      <span className="text-[11.5px] text-muted-foreground">
        <span aria-hidden="true">–</span>
        <span className="sr-only">Nincs összminősítés</span>
      </span>
    );
  }
  const { jel, felirat, osztaly } = VALTOZASOK[valtozas];
  return (
    <span className={cn('text-[11.5px] font-medium whitespace-nowrap', osztaly)}>
      {jel && <span aria-hidden="true">{jel} </span>}
      {felirat}
    </span>
  );
}
