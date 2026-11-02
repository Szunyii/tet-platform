import Link from 'next/link';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { kartyaHorgony, kartyaUrl } from '../../../../lib/routes';
import { TIPUS_CIMKE, type Kartya } from '../../../../lib/tudastar-szotar';
import { megjelenoHoszt } from '../../../../lib/tudastar-szoveg';
import { KartyaLablec, type Mozgatas } from './KartyaLablec';
import { KulsoLink, LinkLista, TetelLista } from './KulsoLink';

/**
 * Egy kártya a kategória-oldalon. Intézmény: összefoglaló, „Részletek →” és honlap. Lista: bevezető, a
 * sorok (név · megjegyzés · link) és a hasznos linkek; részletoldala nincs. Az `id` a menü és a keresési
 * találat horgonya; a `scroll-mt` a ragadós fejléc alá görget.
 */
export function TudastarKartya({ kartya, mozgatas }: { kartya: Kartya; mozgatas?: Mozgatas }) {
  return (
    <Card id={kartyaHorgony(kartya.slug)} className="scroll-mt-24">
      <CardHeader>
        <Badge variant="secondary" className="w-fit">
          {TIPUS_CIMKE[kartya.tipus]}
        </Badge>
        <CardTitle role="heading" aria-level={3}>
          {kartya.nev}
          {kartya.rovidites && <>{' '}<span className="ml-1 font-normal text-muted-foreground">{kartya.rovidites}</span></>}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm leading-relaxed">{kartya.osszefoglalo}</p>
        {kartya.tipus === 'lista' && (
          <>
            {kartya.tartalom.sorok.length > 0 && (
              <TetelLista sorok={kartya.tartalom.sorok.map((s) => ({ nev: s.nev, url: s.url, leiras: s.megjegyzes }))} />
            )}
            {kartya.tartalom.linkek.length > 0 && <LinkLista linkek={kartya.tartalom.linkek} />}
          </>
        )}
      </CardContent>
      <KartyaLablec kartya={kartya} mozgatas={mozgatas}>
        {kartya.tipus === 'intezmeny' && (
          <Link href={kartyaUrl(kartya)} className="font-medium">
            Részletek <span aria-hidden>→</span>
            <span className="sr-only">: {kartya.nev}</span>
          </Link>
        )}
        {kartya.honlap && <KulsoLink href={kartya.honlap}>{megjelenoHoszt(kartya.honlap)}</KulsoLink>}
      </KartyaLablec>
    </Card>
  );
}
