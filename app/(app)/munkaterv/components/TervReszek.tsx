import type { ReactNode, Ref } from 'react';
import type { TervNezet } from '../../../../db/queries/munkaterv';
import { formatDatum } from '../../../../lib/datum';
import { CEL_ALLAPOTOK, TERV_STATUSZ_CIMKE, type CelAllapot, type TervStatusz } from '../../../../lib/munkaterv-szotar';
import { cn } from '../../../../lib/utils';

const JELVENY = 'inline-flex max-w-full items-center gap-1 rounded-[10px] px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap';

const STATUSZ_OSZTALY: Record<TervStatusz, string> = {
  piszkozat: 'bg-muted text-muted-foreground',
  jovahagyasra_var: 'bg-amber-100 text-amber-900',
  visszakuldott: 'bg-red-100 text-red-900',
  jovahagyott: 'bg-emerald-100 text-emerald-900',
};

/** A jel a szín mellett szöveg nélkül is megkülönbözteti az állapotokat. */
const STATUSZ_JEL: Record<TervStatusz, string> = {
  piszkozat: '–',
  jovahagyasra_var: '…',
  visszakuldott: '↩',
  jovahagyott: '✓',
};

const CEL_OSZTALY: Record<CelAllapot, string> = {
  folyamatban: 'bg-muted text-muted-foreground',
  teljesult: 'bg-emerald-100 text-emerald-900',
  reszben: 'bg-amber-100 text-amber-900',
  elmaradt: 'bg-red-100 text-red-900',
};

const CEL_JEL: Record<CelAllapot, string> = {
  folyamatban: '…',
  teljesult: '✓',
  reszben: '◐',
  elmaradt: '✕',
};

/** A terv állapota; `null`: az attasé még nem kezdte el a tervet. */
export function TervStatuszJelveny({ statusz }: { statusz: TervStatusz | null }) {
  if (statusz === null) return <span className={cn(JELVENY, 'border border-dashed border-input text-muted-foreground')}>Nincs terv</span>;
  return (
    <span className={cn(JELVENY, STATUSZ_OSZTALY[statusz])}>
      <span aria-hidden="true">{STATUSZ_JEL[statusz]}</span>
      {TERV_STATUSZ_CIMKE[statusz]}
    </span>
  );
}

export function CelAllapotJelveny({ allapot }: { allapot: CelAllapot }) {
  return (
    <span className={cn(JELVENY, CEL_OSZTALY[allapot])}>
      <span aria-hidden="true">{CEL_JEL[allapot]}</span>
      {CEL_ALLAPOTOK.find((a) => a.kulcs === allapot)?.cimke ?? allapot}
    </span>
  );
}

/** Az évtől függő hiány tájékoztató kártyája: a 404 az évváltás után is beragadna. */
export function Tajekoztato({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

/**
 * A széles táblázat saját görgetődoboza: billentyűzettel is fókuszálható, hogy nyilakkal görgethető legyen akkor is,
 * ha a sorokban nincs fókuszálható elem. A görgetést ez a doboz végzi, a shadcn `Table` saját konténere helyett.
 */
export function TablaDoboz({ cimke, ref, children }: { cimke: string; ref?: Ref<HTMLDivElement>; children: ReactNode }) {
  return (
    <div
      ref={ref}
      role="region"
      aria-label={cimke}
      tabIndex={0}
      className="relative overflow-x-auto rounded-lg border border-border bg-card outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&>[data-slot=table-container]]:overflow-visible"
    >
      {children}
    </div>
  );
}

function Kiemeles({ cim, tipus, children }: { cim: string; tipus: 'vissza' | 'figyelem'; children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2 text-[13px]',
        tipus === 'vissza' ? 'border-red-300 bg-red-50 text-red-950' : 'border-amber-300 bg-amber-50 text-amber-950',
      )}
    >
      <p className="font-semibold">{cim}</p>
      <p className="mt-0.5 wrap-anywhere whitespace-pre-line">{children}</p>
    </div>
  );
}

/** A központ megjegyzése és a nyitott módosítási kérés, kiemelve; mindkét szerepkör ugyanezt látja. */
export function TervUzenetek({ terv }: { terv: TervNezet }) {
  return (
    <>
      {terv.statusz === 'visszakuldott' && terv.megjegyzes && (
        <Kiemeles cim="A központ visszaküldte a tervet" tipus="vissza">
          {terv.megjegyzes}
        </Kiemeles>
      )}
      {terv.statusz === 'jovahagyott' && terv.megjegyzes && (
        <Kiemeles cim="A központ elutasította a módosítási kérést" tipus="figyelem">
          {terv.megjegyzes}
        </Kiemeles>
      )}
      {terv.modositasiKerelem && (
        <Kiemeles cim="Nyitott módosítási kérés" tipus="figyelem">
          {terv.modositasiKerelem}
        </Kiemeles>
      )}
    </>
  );
}

/** A terv fejléce: cím, alcím, állapot; a jóváhagyás adatai az alcím alatt. */
export function TervFejlec({
  cim,
  alcim,
  terv,
  jobbra,
}: {
  cim: string;
  alcim: string;
  terv: TervNezet | null;
  jobbra?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
      <div className="min-w-0">
        <h2
          id="terv-cim"
          tabIndex={-1}
          className="w-fit rounded-sm text-base leading-snug font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {cim}
        </h2>
        <p className="text-xs text-muted-foreground">{alcim}</p>
        {terv?.jovahagytaNev && terv.jovahagyvaAt && (
          <p className="text-xs text-muted-foreground">
            Jóváhagyta: {terv.jovahagytaNev}, {formatDatum(terv.jovahagyvaAt)}
          </p>
        )}
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {terv && <TervStatuszJelveny statusz={terv.statusz} />}
        {jobbra}
      </div>
    </div>
  );
}
