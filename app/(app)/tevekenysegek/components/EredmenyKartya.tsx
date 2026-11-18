import Link from 'next/link';
import type { EredmenySor } from '../../../../db/queries/tevekenyseg';
import { szakaszCimke, UGY_ALLAPOT_CIMKE } from '../../../../lib/tevekenyseg-szotar';
import { IgazolasJelveny } from './IgazolasJelveny';

/**
 * Egy ügy kártyája a táblán: az egész kártya az adatlapra visz (a cím linkje feszül ki rá), húzás nincs.
 * `megjegyzes`: a központ visszaküldési megjegyzése.
 */
export function EredmenyKartya({ ugy, megjegyzes }: { ugy: EredmenySor; megjegyzes?: string | null }) {
  const megszakadt = ugy.allapot === 'megszakadt';
  return (
    <article className="relative flex min-w-0 flex-col gap-1.5 rounded-[5px] border border-border bg-card p-2.5 transition-colors focus-within:ring-3 focus-within:ring-ring/50 hover:border-ring">
      <h4 className="text-[13px] leading-snug font-semibold break-words">
        <Link
          href={`/tevekenysegek/eredmeny/${encodeURIComponent(ugy.id)}`}
          className="text-foreground no-underline outline-none after:absolute after:inset-0 hover:text-foreground hover:underline"
        >
          {ugy.megnevezes}
        </Link>
      </h4>
      <p className="text-xs break-words text-muted-foreground">
        {ugy.partner}
        {ugy.magyarSzereplo && ` · ${ugy.magyarSzereplo}`}
      </p>
      {megszakadt && <p className="text-xs text-muted-foreground">Utolsó szakasz: {szakaszCimke(ugy.szakasz)}</p>}
      <div className="flex flex-wrap items-center gap-1">
        {megszakadt ? (
          <span className="inline-flex rounded-[10px] bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
            {UGY_ALLAPOT_CIMKE.megszakadt}
          </span>
        ) : (
          <IgazolasJelveny igazolas={ugy.igazolas} />
        )}
        {ugy.kifogas && (
          <span className="inline-flex rounded-[10px] bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-900">
            <span aria-hidden="true" className="mr-1">
              !
            </span>
            Kifogásolva
          </span>
        )}
      </div>
      {megjegyzes && <p className="line-clamp-3 text-xs break-words">Központ megjegyzése: {megjegyzes}</p>}
      {ugy.kifogas && <p className="line-clamp-3 text-xs break-words">Kifogás: {ugy.kifogas}</p>}
    </article>
  );
}
