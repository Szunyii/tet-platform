import Link from 'next/link';
import { kartyaHorgony, kartyaUrl, tudastarUrl } from '../../../../lib/routes';
import { TUDASTAR_KATEGORIAK, type Kartya, type KategoriaSlug } from '../../../../lib/tudastar-szotar';
import { cn } from '../../../../lib/utils';
import { KeresoMezo } from './KeresoMezo';

/**
 * A jobb oldali kategória-menü (`xl` fölött, ragadós a fejléc alatt): kis keresőmező, a 9 rövid cím, az
 * aktív kategória alatt a kártyái. A kategória-oldalon a kártya-linkek sima horgonyok (`<a href="#k-<slug>">`:
 * a natív ugrás a fókusz kiindulópontját is a kártyára teszi, a Next `Link` csak görget); a részletoldalon oda
 * visznek, ahol a kártya megjelenik (intézmény: saját oldala, lista: a horgonya), és az aktuális intézmény ki van
 * emelve. A menü a szürke lapon áll, ezért a kiemelés fehér háttér + belső keret (a `bg-muted` itt nem látszana); a
 * görgetődoboz 1-es párnája a fókuszgyűrűknek ad helyet (a görgető elem a szélén levágná őket).
 */
export function KategoriaMenu({
  aktivKategoria, kartyak, aktivSlug,
}: { aktivKategoria: KategoriaSlug; kartyak: readonly Kartya[]; aktivSlug?: string }) {
  return (
    <div className="hidden flex-col gap-3 xl:sticky xl:top-[5.5rem] xl:-m-1 xl:flex xl:max-h-[calc(100dvh-7.5rem)] xl:overflow-y-auto xl:p-1">
      <KeresoMezo id="tudastar-kereses-menu" kompakt />
      <nav aria-label="A tudástár kategóriái">
        <ol className="flex flex-col gap-0.5">
          {TUDASTAR_KATEGORIAK.map((k) => {
            const aktiv = k.slug === aktivKategoria;
            return (
              <li key={k.slug}>
                <Link
                  href={tudastarUrl(k.slug)}
                  aria-current={aktiv && !aktivSlug ? 'page' : undefined}
                  className={cn(
                    'flex gap-2 rounded-md px-2 py-1.5 text-sm text-foreground no-underline hover:bg-foreground/5 hover:no-underline',
                    aktiv && 'bg-background font-medium ring-1 ring-foreground/10 ring-inset hover:bg-background',
                  )}
                >
                  <span className="w-5 shrink-0 text-right text-muted-foreground tabular-nums">{k.szam}.</span>
                  {k.rovidCim}
                </Link>
                {aktiv && kartyak.length > 0 && (
                  <ul className="mt-0.5 mb-1 ml-7 flex flex-col border-l border-input">
                    {kartyak.map((c) => {
                      const sajat = c.slug === aktivSlug;
                      const osztaly = cn(
                        'block truncate py-1 pl-3 text-[13px] text-muted-foreground no-underline hover:text-foreground hover:no-underline',
                        sajat && 'font-medium text-foreground',
                      );
                      return (
                        <li key={c.id}>
                          {aktivSlug ? (
                            <Link href={kartyaUrl(c)} aria-current={sajat ? 'page' : undefined} title={c.nev} className={osztaly}>
                              {c.rovidites ?? c.nev}
                            </Link>
                          ) : (
                            <a href={`#${kartyaHorgony(c.slug)}`} title={c.nev} className={osztaly}>
                              {c.rovidites ?? c.nev}
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
