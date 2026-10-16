import { ArrowUpRightIcon } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { SajatRiport } from '../../../../db/queries/riport';
import { formatDatum } from '../../../../lib/datum';
import { orszagNev } from '../../../../lib/orszagok';
import { KategoriaBadge } from '../../../../components/riport/KategoriaBadge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/card';

/** Ennyi legutóbbi bejegyzés fér el a panelen görgetés nélkül egy átlagos képernyőn. */
export const KORABBI_LIMIT = 8;

/** A linkek új lapon nyílnak: a félig kitöltött űrlap így nem vész el. A felolvasónak is jelezzük. */
function UjLapLink({
  href,
  title,
  className,
  children,
}: {
  href: string;
  title?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} target="_blank" rel="noopener" title={title} className={className}>
      {children}
      <span className="sr-only"> (új lapon nyílik)</span>
    </Link>
  );
}

/**
 * Az új bejegyzés oldal oldalpanelje: a beadó legutóbbi bejegyzései, hogy írás közben lássa, miről
 * jelentett már. Széles képernyőn a form mellett ragadós (a fejléc alatt), a lista a panelen belül
 * görget; keskenyebb képernyőn a form alatt áll. `tobbOrszag`-nál a bejegyzés országát is kiírja.
 */
export function KorabbiBejegyzesek({
  sorok,
  osszes,
  tobbOrszag,
}: {
  sorok: SajatRiport[];
  osszes: number;
  tobbOrszag: boolean;
}) {
  return (
    <Card size="sm" className="w-full max-w-3xl xl:sticky xl:top-[5.5rem] xl:max-h-[calc(100dvh-7.5rem)]">
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          Korábbi bejegyzéseid
        </CardTitle>
        <CardDescription>
          {osszes === 0
            ? 'Még nincs bejegyzésed. A beadott bejegyzések itt jelennek meg.'
            : sorok.length < osszes
              ? `A legutóbbi ${sorok.length}, összesen ${osszes}. A címek új lapon nyílnak.`
              : `Összesen ${osszes}. A címek új lapon nyílnak.`}
        </CardDescription>
      </CardHeader>
      {sorok.length > 0 && (
        // relative: az sr-only feliratok abszolút pozíciósak, a görgetődoboz így vágja le őket.
        // py-1: a doboz széléhez érő link fókuszkerete ne vágódjon le.
        <CardContent className="relative min-h-0 overflow-y-auto py-1">
          <ul className="flex flex-col divide-y divide-border">
            {sorok.map((r) => (
              <li key={r.id} className="py-2.5 first:pt-0 last:pb-0">
                <UjLapLink
                  href={`/jelentesek/${r.id}`}
                  title={r.targy}
                  className="line-clamp-2 font-medium break-words underline-offset-2 hover:underline"
                >
                  {r.targy}
                </UjLapLink>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <KategoriaBadge kulcs={r.kategoria} />
                  <span>{formatDatum(r.createdAt)}</span>
                  {tobbOrszag && <span>{orszagNev(r.orszag)}</span>}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      )}
      {osszes > 0 && (
        <CardFooter>
          <UjLapLink
            href="/jelentesek"
            className="inline-flex items-center gap-1 text-xs font-medium underline-offset-2 hover:underline"
          >
            Összes bejegyzésed
            <ArrowUpRightIcon className="size-3.5" aria-hidden />
          </UjLapLink>
        </CardFooter>
      )}
    </Card>
  );
}
