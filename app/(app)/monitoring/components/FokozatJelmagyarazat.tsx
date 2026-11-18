import { FOKOZAT_OSZTALY, FOKOZATOK } from '../../../../lib/ertekeles-szotar';
import { cn } from '../../../../lib/utils';

/** A fokozatok rövid felirata, színe és teljes neve; a „–” a még nem minősített cella jele. */
export function FokozatJelmagyarazat() {
  return (
    <ul aria-label="Jelmagyarázat" className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground">
      {FOKOZATOK.map((f) => (
        <li key={f.ertek} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn('shrink-0 rounded-[3px] px-1.5 py-0.5 font-medium whitespace-nowrap', FOKOZAT_OSZTALY[f.ertek])}
          >
            {f.rovid}
          </span>
          {f.nev}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="px-1 font-medium">–</span>
        Nincs minősítve
      </li>
    </ul>
  );
}
