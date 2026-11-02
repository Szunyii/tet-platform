import Link from 'next/link';
import type { ReactNode } from 'react';
import { buttonVariants } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { formatDatum } from '../../../../lib/datum';
import { kartyaSzerkesztoUrl } from '../../../../lib/routes';
import type { KartyaTipusu } from '../../../../lib/tudastar-szotar';
import { megjelenoHoszt } from '../../../../lib/tudastar-szoveg';
import { cn } from '../../../../lib/utils';
import { KulsoLink, LinkLista, TetelLista } from './KulsoLink';
import { Szoveg } from './Szoveg';

function Blokk({ cim, children }: { cim: string; children: ReactNode }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle role="heading" aria-level={3}>
          {cim}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** Kapcsolat-sor: címke + érték egy rácsban. */
function Adat({ cimke, children }: { cimke: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{cimke}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </>
  );
}

/**
 * Az intézmény részletoldala: összefoglaló, majd Profil és Kapcsolat, Tevékenység, a szabad szakaszok,
 * Programok, Hasznos linkek – az üres blokk nem jelenik meg.
 */
export function IntezmenyReszlet({ kartya, szerkeszthet }: { kartya: KartyaTipusu<'intezmeny'>; szerkeszthet: boolean }) {
  const t = kartya.tartalom;
  const { email, telefon, cim } = t.kapcsolat;
  const vanKapcsolat = Boolean(kartya.honlap || email || telefon || cim);
  return (
    <article className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start gap-3">
          <h2 className="text-xl leading-snug font-semibold">
            {kartya.nev}
            {kartya.rovidites && <>{' '}<span className="ml-1 text-base font-normal text-muted-foreground">{kartya.rovidites}</span></>}
          </h2>
          {szerkeszthet && (
            <Link href={kartyaSzerkesztoUrl(kartya)} className={cn('ml-auto', buttonVariants({ variant: 'outline' }))}>
              Szerkesztés
            </Link>
          )}
        </div>
        <p className="max-w-3xl text-sm leading-relaxed">{kartya.osszefoglalo}</p>
      </header>

      {(t.profil || vanKapcsolat) && (
        <div className={cn('grid items-start gap-4', t.profil && vanKapcsolat && 'xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]')}>
          {t.profil && (
            <Blokk cim="Profil">
              <Szoveg szoveg={t.profil} />
            </Blokk>
          )}
          {vanKapcsolat && (
            <Blokk cim="Kapcsolat">
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm">
                {kartya.honlap && (
                  <Adat cimke="Web">
                    <KulsoLink href={kartya.honlap}>{megjelenoHoszt(kartya.honlap)}</KulsoLink>
                  </Adat>
                )}
                {email && (
                  <Adat cimke="E-mail">
                    <a href={`mailto:${email}`}>{email}</a>
                  </Adat>
                )}
                {telefon && <Adat cimke="Telefon">{telefon}</Adat>}
                {cim && <Adat cimke="Cím">{cim}</Adat>}
              </dl>
            </Blokk>
          )}
        </div>
      )}
      {t.tevekenyseg && (
        <Blokk cim="Tevékenység">
          <Szoveg szoveg={t.tevekenyseg} />
        </Blokk>
      )}
      {t.szakaszok.map((sz, i) => (
        <Blokk key={i} cim={sz.cim}>
          <Szoveg szoveg={sz.szoveg} />
        </Blokk>
      ))}
      {t.programok.length > 0 && (
        <Blokk cim="Programok">
          <TetelLista sorok={t.programok} />
        </Blokk>
      )}
      {t.linkek.length > 0 && (
        <Blokk cim="Hasznos linkek">
          <LinkLista linkek={t.linkek} />
        </Blokk>
      )}
      <p className="text-xs text-muted-foreground">Frissítve: {formatDatum(kartya.updatedAt)}</p>
    </article>
  );
}
