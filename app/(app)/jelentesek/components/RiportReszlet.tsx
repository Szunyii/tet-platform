import { PaperclipIcon } from 'lucide-react';
import Link from 'next/link';
import type { RiportDetail } from '../../../../db/queries/riport';
import type { RiportMinosites } from '../../../../db/queries/riport-minosites';
import { formatDatum, formatNaptariDatum } from '../../../../lib/datum';
import { orszagNev } from '../../../../lib/orszagok';
import { formatMeret, kategoriaByKulcs, RIPORT_MEZO_CIMKEK } from '../../../../lib/riport-szotar';
import { csatolmanyUrl } from '../../../../lib/routes';
import { cn } from '../../../../lib/utils';
import type { FormAction, MuveletAction } from '../../../../components/form/useMuveletForm';
import { KategoriaBadge } from '../../../../components/riport/KategoriaBadge';
import { Badge } from '../../../../components/ui/badge';
import { buttonVariants } from '../../../../components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { FokozatJelveny } from '../../monitoring/components/FokozatJelveny';
import { IntezkedesSzerkeszto } from './IntezkedesSzerkeszto';
import { MinositesSzerkeszto } from './MinositesSzerkeszto';
import { RiportTorles } from './RiportTorles';

export function RiportReszlet({
  riport,
  szerkeszthet,
  tevekenysegRogzites,
  torlesAction,
  intezkedesAction,
  kozpontiMinosites,
}: {
  riport: RiportDetail;
  szerkeszthet: boolean;
  /** A jelentésből indítható tevékenység linkje és a már rögzítettek száma; a page csak a szerzőnek adja. */
  tevekenysegRogzites?: { url: string; darab: number };
  torlesAction: MuveletAction;
  /** A „Megtett intézkedés” mentése; a page csak a központnak (admin) adja. */
  intezkedesAction?: FormAction;
  /**
   * A központi minősítés kártyája: a mostani minősítés (`null`: még nincs) és a mentése. Egyetlen prop, hogy az
   * attasénak ne is lehessen részlete: a page csak a központnak (admin) tölti be és adja át, egyébként a kártya
   * nem jelenik meg.
   */
  kozpontiMinosites?: { minosites: RiportMinosites | null; action: FormAction };
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
        {(szerkeszthet || tevekenysegRogzites) && (
          <div className="flex flex-wrap items-center gap-2">
            {szerkeszthet && (
              <>
                <Link
                  href={`/jelentesek/${riport.id}/szerkesztes`}
                  className={cn(buttonVariants({ variant: 'outline' }))}
                >
                  Szerkesztés
                </Link>
                <RiportTorles targy={riport.targy} action={torlesAction} />
              </>
            )}
            {tevekenysegRogzites && (
              <Link href={tevekenysegRogzites.url} className={cn(buttonVariants({ variant: 'outline' }))}>
                Tevékenység rögzítése
              </Link>
            )}
            {tevekenysegRogzites && tevekenysegRogzites.darab > 0 && (
              <span className="text-xs text-muted-foreground">Már rögzítve: {tevekenysegRogzites.darab} tevékenység</span>
            )}
          </div>
        )}
      </header>

      <section className="flex flex-col gap-1.5">
        <h3 className="text-sm font-medium">{RIPORT_MEZO_CIMKEK.leiras}</h3>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{riport.leiras}</p>
      </section>

      {riport.joGyakorlat && (
        <Card size="sm" className="border-l-4 border-l-emerald-500">
          <CardHeader>
            <CardTitle role="heading" aria-level={3}>
              {RIPORT_MEZO_CIMKEK.joGyakorlat}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">{riport.joGyakorlat}</CardContent>
        </Card>
      )}

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
              {RIPORT_MEZO_CIMKEK.esemeny}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div>
              {RIPORT_MEZO_CIMKEK.esemenyDatum}: <span className="font-medium">{formatNaptariDatum(riport.esemenyDatum)}</span>
            </div>
            <div>
              {RIPORT_MEZO_CIMKEK.esemenyHelyszin}: <span className="font-medium">{riport.esemenyHelyszin}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {riport.kapcsolodoFeladat && (
        <Card size="sm" className="border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle role="heading" aria-level={3}>
              {RIPORT_MEZO_CIMKEK.kapcsolodoFeladat}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">{riport.kapcsolodoFeladat}</CardContent>
        </Card>
      )}

      {/* A központ mindig látja (üresen is, a gombbal); az attasé csak akkor, ha van szöveg. */}
      {(riport.intezkedes || intezkedesAction) && (
        <Card size="sm" className="border-l-4 border-l-sky-500">
          <CardHeader>
            <CardTitle role="heading" aria-level={3}>
              Megtett intézkedés
            </CardTitle>
            {intezkedesAction && (
              <CardAction>
                <IntezkedesSzerkeszto
                  targy={riport.targy}
                  ertek={riport.intezkedes}
                  action={intezkedesAction}
                  valtozat="gomb"
                />
              </CardAction>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 text-sm">
            {riport.intezkedes ? (
              <>
                <p className="break-words whitespace-pre-wrap">{riport.intezkedes}</p>
                {riport.intezkedesSzerzoNev && riport.intezkedesIdopont && (
                  <p className="text-xs text-muted-foreground">
                    {riport.intezkedesSzerzoNev} · {formatDatum(riport.intezkedesIdopont)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Még nincs rögzített intézkedés.</p>
            )}
          </CardContent>
        </Card>
      )}

      {kozpontiMinosites && (
        <Card size="sm" className="border-l-4 border-l-violet-500">
          <CardHeader>
            <CardTitle role="heading" aria-level={3}>
              Központi minősítés
            </CardTitle>
            <CardAction>
              <MinositesSzerkeszto
                targy={riport.targy}
                fokozat={kozpontiMinosites.minosites?.fokozat ?? null}
                megjegyzes={kozpontiMinosites.minosites?.megjegyzes ?? null}
                action={kozpontiMinosites.action}
                valtozat="gomb"
              />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 text-sm">
            {kozpontiMinosites.minosites ? (
              <>
                <div>
                  <FokozatJelveny fokozat={kozpontiMinosites.minosites.fokozat} />
                </div>
                {kozpontiMinosites.minosites.megjegyzes && (
                  <p className="break-words whitespace-pre-wrap">{kozpontiMinosites.minosites.megjegyzes}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {kozpontiMinosites.minosites.szerzoNev} · {formatDatum(kozpontiMinosites.minosites.updatedAt)} · Az
                  attasé nem látja.
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">Még nincs minősítve. Az attasé a minősítést nem látja.</p>
            )}
          </CardContent>
        </Card>
      )}

      {riport.csatolmanyok.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Csatolmányok</h3>
          <ul className="flex flex-col gap-1.5 text-sm">
            {riport.csatolmanyok.map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <PaperclipIcon className="size-4 text-muted-foreground" aria-hidden />
                <a href={csatolmanyUrl(c.id)} className="underline underline-offset-2">
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
