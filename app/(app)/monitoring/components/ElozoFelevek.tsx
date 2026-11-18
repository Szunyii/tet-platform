import type { ElozmenySor } from '../../../../db/queries/ertekeles';
import { felevKulcs } from '../../../../lib/ertekeles-idoszak';
import type { MunkalapFul } from '../../../../lib/ertekeles-osszesites';
import { FokozatCella, nemErtekeltE } from './IdosorMatrix';

/**
 * A szempont vagy az összminősítés fokozatai az attasé korábbi lezárt féléveiben, időrendben. Az a félév,
 * amelyből az attasét kihagyták, „Nem értékelt” felirat, nem fokozat.
 */
export function ElozoFelevek({ elozmeny, ful }: { elozmeny: readonly ElozmenySor[]; ful: MunkalapFul }) {
  if (elozmeny.length === 0) return <p className="text-[12px] text-muted-foreground">Nincs korábbi lezárt félév.</p>;
  return (
    <dl className="flex flex-wrap gap-1">
      {elozmeny.map((f) => (
        <div key={felevKulcs(f.felev)} className="min-w-[3.25rem] flex-1 text-center">
          <dt className="mb-0.5 text-[11px] text-muted-foreground">{felevKulcs(f.felev)}</dt>
          <dd>
            {nemErtekeltE(f) ? (
              <span className="block rounded-[3px] bg-muted px-0.5 py-[7px] text-[11px] font-medium text-muted-foreground">
                Nem értékelt
              </span>
            ) : (
              <FokozatCella fokozat={ful === 'ossz' ? (f.osszFokozat ?? undefined) : f.fokozatok[ful]} />
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
