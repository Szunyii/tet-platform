import type { ElozmenySor } from '../../../../db/queries/ertekeles';
import { felevKulcs, felevOsszevet, type Felev } from '../../../../lib/ertekeles-idoszak';
import { SZEMPONTOK, type Fokozat } from '../../../../lib/ertekeles-szotar';
import { cn } from '../../../../lib/utils';
import { FokozatJelveny } from './FokozatJelveny';

const KIEMELT_FEJLEC = 'bg-[#e8eefa] text-[#1f4e9c]';

/** A félévben az attasé ki volt hagyva: nincs fokozat, és összminősítés sincs. */
function nemErtekeltE(f: ElozmenySor): boolean {
  return f.osszFokozat === null && Object.keys(f.fokozatok).length === 0;
}

function Cella({ fokozat }: { fokozat: Fokozat | undefined }) {
  if (fokozat === undefined) {
    return (
      <span className="text-[11.5px] text-muted-foreground">
        <span aria-hidden="true">–</span>
        <span className="sr-only">Nincs minősítve</span>
      </span>
    );
  }
  return <FokozatJelveny fokozat={fokozat} rovid />;
}

/**
 * Az attasé legutóbbi lezárt félévei szempontonként és összminősítésben, időrendben. A kihagyott félév egy
 * „Nem értékelt” cella, nem fokozat. A megtekintett félév oszlopa kiemelt.
 */
export function IdosorMatrix({ elozmeny, felev }: { elozmeny: readonly ElozmenySor[]; felev: Felev }) {
  if (elozmeny.length === 0) return null;
  const sorok = [...SZEMPONTOK.map((s) => ({ kulcs: s.kulcs, nev: s.rovid })), { kulcs: 'ossz' as const, nev: 'Összminősítés' }];
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-[17rem] border-separate border-spacing-0.5">
        <caption className="sr-only">Az attasé fokozatai az utolsó lezárt félévekben</caption>
        <thead>
          <tr>
            <th scope="col" className="p-[3px] text-left text-[11px] font-semibold text-muted-foreground">
              <span className="sr-only">Szempont</span>
            </th>
            {elozmeny.map((f) => {
              const aktualis = felevOsszevet(f.felev, felev) === 0;
              return (
                <th
                  key={felevKulcs(f.felev)}
                  scope="col"
                  className={cn(
                    'rounded-[3px] p-[3px] text-center text-[11px] font-semibold whitespace-nowrap text-muted-foreground',
                    aktualis && KIEMELT_FEJLEC,
                  )}
                >
                  {felevKulcs(f.felev)}
                  {aktualis && <span className="sr-only"> (megtekintett félév)</span>}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorok.map((sor, i) => (
            <tr key={sor.kulcs}>
              <th
                scope="row"
                className={cn(
                  'pr-2 text-left text-[12px] whitespace-nowrap',
                  sor.kulcs === 'ossz' ? 'font-semibold' : 'font-normal',
                )}
              >
                {sor.nev}
              </th>
              {elozmeny.map((f) => {
                const kulcs = felevKulcs(f.felev);
                if (nemErtekeltE(f)) {
                  // Egy összevont cella az oszlop egészén, hogy ne lehessen fokozatnak olvasni.
                  return i === 0 ? (
                    <td
                      key={kulcs}
                      rowSpan={sorok.length}
                      className="rounded-[3px] bg-muted px-1 text-center text-[11px] font-medium text-muted-foreground"
                    >
                      Nem értékelt
                    </td>
                  ) : null;
                }
                const fokozat = sor.kulcs === 'ossz' ? (f.osszFokozat ?? undefined) : f.fokozatok[sor.kulcs];
                return (
                  <td key={kulcs} className="p-0 text-center">
                    <Cella fokozat={fokozat} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
