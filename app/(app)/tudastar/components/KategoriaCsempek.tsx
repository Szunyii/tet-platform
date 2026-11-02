import Link from 'next/link';
import { tudastarUrl } from '../../../../lib/routes';
import { TUDASTAR_KATEGORIAK } from '../../../../lib/tudastar-szotar';
import { SzamJelveny } from './SzamJelveny';

/** A nyitólap: a 9 kategória csempéje (szám, cím, egysoros leírás, kártyaszám), mindegyik a kategória-oldalra visz. */
export function KategoriaCsempek({ darabok }: { darabok: ReadonlyMap<string, number> }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {TUDASTAR_KATEGORIAK.map((k) => (
        <li key={k.slug}>
          <Link
            href={tudastarUrl(k.slug)}
            className="flex h-full flex-col gap-1.5 rounded-xl bg-card p-4 text-card-foreground no-underline ring-1 ring-foreground/10 transition-shadow hover:no-underline hover:ring-foreground/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <SzamJelveny szam={k.szam} />
            <span className="text-[15px] leading-snug font-semibold">{k.cim}</span>
            <span className="text-sm text-muted-foreground">{k.leiras}</span>
            <span className="mt-auto pt-1 text-xs text-muted-foreground">{darabok.get(k.slug) ?? 0} kártya</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
