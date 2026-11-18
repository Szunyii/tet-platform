import Link from 'next/link';
import type { EsemenySor } from '../../../../db/queries/tevekenyseg';
import { formatDatumIdo } from '../../../../lib/datum';
import { ESEMENY_CIMKE, szakaszCimke } from '../../../../lib/tevekenyseg-szotar';
import { KulsoLink } from '../../tudastar/components/KulsoLink';

/**
 * A központ legutóbbi megjegyzése a visszaküldött ügyhöz: a visszaküldésé vagy az igazolás visszavonásáé
 * (mindkettő „Visszaküldve” állapotba teszi az ügyet). Az események időrendben érkeznek.
 */
export function visszakuldesMegjegyzes(esemenyek: readonly EsemenySor[]): string | null {
  for (let i = esemenyek.length - 1; i >= 0; i--) {
    const e = esemenyek[i];
    if (e.tipus === 'visszakuldes' || e.tipus === 'igazolas_visszavonas') return e.szoveg;
  }
  return null;
}

/** Az ügy előzményei a legfrissebbtől visszafelé, a szerző nevének pillanatképével. */
export function EsemenyIdovonal({ esemenyek }: { esemenyek: readonly EsemenySor[] }) {
  return (
    <ol className="flex flex-col">
      {[...esemenyek].reverse().map((e) => (
        <li key={e.id} className="relative border-l border-input pb-4 pl-4 last:pb-0">
          <span aria-hidden="true" className="absolute top-1.5 -left-[4px] size-[7px] rounded-full bg-foreground/60" />
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
            <span className="font-medium">{ESEMENY_CIMKE[e.tipus]}</span>
            {e.szakasz && <span className="text-muted-foreground">{szakaszCimke(e.szakasz)}</span>}
            {e.visszavonva && <span className="text-xs font-medium text-destructive">Visszavonva</span>}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDatumIdo(e.createdAt)} · {e.szerzoNev} ({e.szerzoSzerep === 'admin' ? 'központ' : 'attasé'})
          </p>
          {e.szoveg && <p className="mt-1 text-sm break-words whitespace-pre-wrap">{e.szoveg}</p>}
          {e.link && (
            <p className="mt-1 text-sm break-all">
              <KulsoLink href={e.link} className="underline underline-offset-2">
                {e.link}
              </KulsoLink>
            </p>
          )}
          {e.riportId && e.riportTargy && (
            <p className="mt-1 text-sm">
              Kapcsolódó jelentés:{' '}
              <Link href={`/jelentesek/${encodeURIComponent(e.riportId)}`} className="underline underline-offset-2">
                {e.riportTargy}
              </Link>
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
