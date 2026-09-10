import { PaperclipIcon } from 'lucide-react';
import Link from 'next/link';
import type { RiportDetail } from '../../db/queries/riport';
import { formatDatum, formatNaptariDatum } from '../../lib/datum';
import { orszagNev } from '../../lib/orszagok';
import { formatMeret, kategoriaByKulcs } from '../../lib/riport-szotar';
import { cn } from '../../lib/utils';
import type { MuveletState } from '../form/useMuveletForm';
import { Badge } from '../ui/badge';
import { buttonVariants } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { KategoriaBadge } from './KategoriaBadge';
import { RiportTorles } from './RiportTorles';

export function RiportReszlet({
  riport,
  szerkeszthet,
  torlesAction,
}: {
  riport: RiportDetail;
  szerkeszthet: boolean;
  torlesAction: () => Promise<MuveletState>;
}) {
  const kat = kategoriaByKulcs(riport.kategoria);
  // A formázott dátum a mérvadó, mert azt írjuk ki: napon belüli mentés nem „módosítva”.
  const modositva = formatDatum(riport.updatedAt) !== formatDatum(riport.createdAt);
  return (
    <article className="flex max-w-3xl flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <KategoriaBadge kulcs={riport.kategoria} />
          <span className="text-xs text-muted-foreground">{kat.cimke}</span>
        </div>
        <h2 className="text-xl leading-snug font-semibold">{riport.targy}</h2>
        <p className="text-sm text-muted-foreground">
          {riport.szerzoNev} · {orszagNev(riport.orszag)} · beadva {formatDatum(riport.createdAt)}
          {modositva && ` · módosítva ${formatDatum(riport.updatedAt)}`}
        </p>
        {szerkeszthet && (
          <div className="flex gap-2">
            <Link
              href={`/riportok/${riport.id}/szerkesztes`}
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              Szerkesztés
            </Link>
            <RiportTorles targy={riport.targy} action={torlesAction} />
          </div>
        )}
      </header>

      <p className="text-sm leading-relaxed whitespace-pre-wrap">{riport.leiras}</p>

      {riport.kulcsszavak.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {riport.kulcsszavak.map((k) => (
            <Badge key={k} variant="secondary">
              {k}
            </Badge>
          ))}
        </div>
      )}

      {riport.esemenyDatum && (
        <Card size="sm">
          <CardHeader>
            <CardTitle role="heading" aria-level={3}>
              Rendezvény adatai
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div>
              Dátum: <span className="font-medium">{formatNaptariDatum(riport.esemenyDatum)}</span>
            </div>
            <div>
              Helyszín: <span className="font-medium">{riport.esemenyHelyszin}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {riport.joGyakorlat && (
        <Card size="sm" className="border-l-4 border-l-emerald-500">
          <CardHeader>
            <CardTitle role="heading" aria-level={3}>
              Magyarország számára átvehető jó gyakorlat
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">{riport.joGyakorlat}</CardContent>
        </Card>
      )}

      {riport.kapcsolodoFeladat && (
        <Card size="sm" className="border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle role="heading" aria-level={3}>
              Kapcsolódó feladat, kérés
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">{riport.kapcsolodoFeladat}</CardContent>
        </Card>
      )}

      {riport.csatolmanyok.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Csatolmányok</h3>
          <ul className="flex flex-col gap-1.5 text-sm">
            {riport.csatolmanyok.map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <PaperclipIcon className="size-4 text-muted-foreground" aria-hidden />
                <a href={`/api/riport/csatolmany/${c.id}`} className="underline underline-offset-2">
                  {c.fajlnev}
                </a>
                <span className="text-xs text-muted-foreground">{formatMeret(c.meret)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
