import Link from 'next/link';
import { kartyaUrl, tudastarUrl } from '../../../../lib/routes';
import type { Talalat } from '../../../../lib/tudastar-kereses';
import { TUDASTAR_KATEGORIAK } from '../../../../lib/tudastar-szotar';
import { SzamJelveny } from './SzamJelveny';

/** A nyitólap `?q=`-nál: a találatok kategóriánként csoportosítva, soronként a kártya és a találat helye. */
export function KeresesiTalalatok({ q, talalatok }: { q: string; talalatok: readonly Talalat[] }) {
  const csoportok = TUDASTAR_KATEGORIAK.map((k) => ({
    kategoria: k,
    sorok: talalatok.filter((t) => t.kartya.kategoria === k.slug),
  })).filter((c) => c.sorok.length > 0);
  return (
    <section aria-labelledby="tudastar-talalatok" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id="tudastar-talalatok" className="text-base font-semibold">
          {talalatok.length === 0 ? `Nincs találat erre: „${q}”.` : `${talalatok.length} találat erre: „${q}”`}
        </h2>
        <Link href={tudastarUrl()} className="text-sm">
          Keresés törlése
        </Link>
      </div>
      {csoportok.map(({ kategoria, sorok }) => (
        <div key={kategoria.slug} className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <SzamJelveny szam={kategoria.szam} />
            <Link href={tudastarUrl(kategoria.slug)} className="text-foreground">
              {kategoria.cim}
            </Link>
          </h3>
          <ul className="flex flex-col divide-y divide-border rounded-xl bg-card ring-1 ring-foreground/10">
            {sorok.map(({ kartya, hol, reszlet }) => (
              <li key={kartya.id} className="flex flex-col gap-0.5 px-4 py-2.5">
                <Link href={kartyaUrl(kartya)} className="font-medium">
                  {kartya.nev}
                  {kartya.rovidites && ` (${kartya.rovidites})`}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {hol && <span className="text-foreground">{hol}: </span>}
                  {reszlet}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
