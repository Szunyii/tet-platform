import Link from 'next/link';
import { kartyaHorgony, kartyaUrl, tudastarUrl } from '../../../../lib/routes';
import { TUDASTAR_KATEGORIAK, type Kartya, type KategoriaSlug } from '../../../../lib/tudastar-szotar';
import { cn } from '../../../../lib/utils';
import { KeresoMezo } from './KeresoMezo';

/**
 * A jobb oldali kategória-menü (`lg` fölött, ragadós a fejléc alatt): kis keresőmező, a 9 rövid cím, az
 * aktív kategória alatt a kártyái. A kategória-oldalon a kártya-linkek horgonyok (`#k-<slug>`); a
 * részletoldalon oda visznek, ahol a kártya megjelenik (intézmény: saját oldala, lista: a horgonya), és
 * az aktuális intézmény ki van emelve.
 */
export function KategoriaMenu({
  aktivKategoria, kartyak, aktivSlug,
}: { aktivKategoria: KategoriaSlug; kartyak: readonly Kartya[]; aktivSlug?: string }) {
  return (
    <aside className="hidden flex-col gap-3 lg:sticky lg:top-[5.5rem] lg:flex lg:max-h-[calc(100dvh-7.5rem)] lg:overflow-y-auto">
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
                    'flex gap-2 rounded-md px-2 py-1.5 text-sm text-foreground no-underline hover:bg-muted hover:no-underline',
                    aktiv && 'bg-muted font-medium',
                  )}
                >
                  <span className="w-5 shrink-0 text-right text-muted-foreground tabular-nums">{k.szam}.</span>
                  {k.rovidCim}
                </Link>
                {aktiv && kartyak.length > 0 && (
                  <ul className="mt-0.5 mb-1 ml-7 flex flex-col border-l border-border">
                    {kartyak.map((c) => {
                      const sajat = c.slug === aktivSlug;
                      return (
                        <li key={c.id}>
                          <Link
                            href={aktivSlug ? kartyaUrl(c) : `#${kartyaHorgony(c.slug)}`}
                            aria-current={sajat ? 'page' : undefined}
                            title={c.nev}
                            className={cn(
                              'block truncate py-1 pl-3 text-[13px] text-muted-foreground no-underline hover:text-foreground hover:no-underline',
                              sajat && 'font-medium text-foreground',
                            )}
                          >
                            {c.rovidites ?? c.nev}
                          </Link>
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
    </aside>
  );
}
