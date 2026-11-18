import Link from 'next/link';
import { munkatervUrl } from '../../../../lib/munkaterv-szuro';
import { cn } from '../../../../lib/utils';

/** Az évválasztó: linkek a `?ev=` paraméterrel, a fejléc ciklusától függetlenül. */
export function EvValaszto({ ev, evek, attaseId }: { ev: number; evek: readonly number[]; attaseId?: string }) {
  return (
    <nav aria-label="Év" className="flex flex-wrap gap-1.5">
      {evek.map((e) => (
        <Link
          key={e}
          href={munkatervUrl(e, attaseId)}
          aria-current={e === ev ? 'page' : undefined}
          className={cn(
            'rounded-md border px-2.5 py-1 text-xs no-underline hover:no-underline',
            e === ev ? 'border-foreground bg-foreground font-semibold text-background' : 'border-input bg-background text-foreground',
          )}
        >
          {e}
        </Link>
      ))}
    </nav>
  );
}
