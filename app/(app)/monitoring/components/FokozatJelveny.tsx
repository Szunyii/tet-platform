import { FOKOZAT_OSZTALY, fokozatNev, fokozatRovid, type Fokozat } from '../../../../lib/ertekeles-szotar';
import { cn } from '../../../../lib/utils';

/**
 * A fokozat színes jelvénye, a szín mellett mindig szöveggel. `rovid`: a hőtérkép cellája, a rövid felirattal
 * (a teljes név felolvasónak); enélkül a teljes nevet mutató címke.
 */
export function FokozatJelveny({ fokozat, rovid = false }: { fokozat: Fokozat; rovid?: boolean }) {
  if (rovid) {
    return (
      <span
        className={cn(
          'block rounded-[3px] px-0.5 py-[7px] text-center text-[11.5px] font-medium',
          FOKOZAT_OSZTALY[fokozat],
        )}
      >
        <span aria-hidden="true">{fokozatRovid(fokozat)}</span>
        <span className="sr-only">{fokozatNev(fokozat)}</span>
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-block rounded-[10px] px-[9px] py-[3px] text-[11.5px] font-semibold whitespace-nowrap',
        FOKOZAT_OSZTALY[fokozat],
      )}
    >
      {fokozatNev(fokozat)}
    </span>
  );
}
