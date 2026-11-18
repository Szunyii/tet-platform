import type { EredmenySor } from '../../../../db/queries/tevekenyseg';
import { oszlopSzakasz } from '../../../../lib/tevekenyseg-allapot';
import { SZAKASZOK } from '../../../../lib/tevekenyseg-szotar';
import { EredmenyKartya } from './EredmenyKartya';

/** A táblán az aktív ügyek látszanak; a megkötött megállapodás csak abban az évben, amelybe beszámított. */
export function tablanLatszik(u: EredmenySor, ev: number): boolean {
  if (u.allapot !== 'aktiv') return false;
  return oszlopSzakasz(u) !== 'megallapodas' || u.kertSzakasz !== null || u.megallapodasEv === ev;
}

/** Az ügyek szakaszonként, négy oszlopban. Szűk helyen az oszlopok egymás alá kerülnek. */
export function EredmenyTabla({
  eredmenyek,
  ev,
  megjegyzesek,
}: {
  eredmenyek: readonly EredmenySor[];
  /** A fejlécben választott év: a Megállapodás oszlop erre szűkül. */
  ev: number;
  /** A visszaküldött ügyek központi megjegyzése, ügy-azonosító szerint. */
  megjegyzesek: ReadonlyMap<string, string | null>;
}) {
  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-2 @4xl:grid-cols-4">
        {SZAKASZOK.map((sz) => {
          const kartyak = eredmenyek.filter((u) => tablanLatszik(u, ev) && oszlopSzakasz(u) === sz.kulcs);
          return (
            <section key={sz.kulcs} aria-labelledby={`oszlop-${sz.kulcs}`} className="min-w-0 rounded-md bg-foreground/5 p-2">
              <div className="flex items-baseline justify-between gap-2 px-0.5 pb-2">
                <h3 id={`oszlop-${sz.kulcs}`} className="text-[12.5px] font-semibold">
                  {sz.cimke}
                </h3>
                <span className="text-[12.5px] font-semibold">
                  {kartyak.length}
                  <span className="sr-only"> ügy</span>
                </span>
              </div>
              {sz.kulcs === 'megallapodas' && (
                <p className="px-0.5 pb-2 text-[11px] text-muted-foreground">Függő kérések és a {ev}. évbe számított megállapodások</p>
              )}
              {kartyak.length === 0 ? (
                <p className="px-0.5 pb-1 text-xs text-muted-foreground">Nincs ügy ebben a szakaszban.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {kartyak.map((u) => (
                    <EredmenyKartya key={u.id} ugy={u} megjegyzes={megjegyzesek.get(u.id)} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
