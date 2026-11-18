import type { MutatoKartya } from '../../../../lib/ertekeles-megjelenites';

/**
 * A szempont automatikus mutatói kártyákban. A hiányzó érték („–”) felolvasónak is mond valamit. A `korlat` a
 * mérés ismert korlátja (spec 5.4.), a kártyák alatt áll.
 */
export function MutatoRacs({ kartyak, korlat }: { kartyak: readonly MutatoKartya[]; korlat?: string | null }) {
  return (
    <>
      <dl className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-1.5">
        {kartyak.map((k) => (
          <div key={k.cimke} className="min-w-0 rounded bg-muted/60 px-2 py-1.5">
            <dt className="text-[11px] text-muted-foreground">{k.cimke}</dt>
            <dd>
              <span className="block text-[14px] leading-tight font-semibold wrap-anywhere">
                {k.ertek === '–' ? (
                  <>
                    <span aria-hidden="true">–</span>
                    <span className="sr-only">Nincs adat</span>
                  </>
                ) : (
                  k.ertek
                )}
              </span>
              <span className="block text-[11px] text-muted-foreground">{k.megjegyzes}</span>
            </dd>
          </div>
        ))}
      </dl>
      {korlat && <p className="mt-2 text-[11px] text-muted-foreground">{korlat}</p>}
    </>
  );
}
