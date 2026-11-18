import Link from 'next/link';
import type { ReactNode } from 'react';
import { Badge } from '../../../../components/ui/badge';
import type { IdoszakSor } from '../../../../db/queries/ertekeles';
import { rendezOrszagok } from '../../../../lib/attase-orszag';
import type { Felev } from '../../../../lib/ertekeles-idoszak';
import type { ErtekelesSor } from '../../../../lib/ertekeles-osszesites';
import type { ErtekelesSzuro } from '../../../../lib/ertekeles-szuro';
import { orszagNev } from '../../../../lib/orszagok';
import { FelevValaszto } from './FelevValaszto';
import { FokozatJelveny } from './FokozatJelveny';
import { ValtozasJelzes } from './ValtozasJelzes';

/** A poszt egy sorban: város, székhely-ország, a további országok és a relációs vezetőség (a pillanatképből). */
function posztFelirat(sor: ErtekelesSor): string {
  const orszagok = rendezOrszagok(sor.orszagok);
  const tovabbi = orszagok.filter((o) => !o.szekhely).map((o) => orszagNev(o.kod));
  const vezetett = orszagok.filter((o) => o.vezeto).map((o) => orszagNev(o.kod));
  const szekhely = orszagNev(sor.szekhelyKod);
  return [
    sor.varos,
    szekhely,
    tovabbi.length > 0 ? `további országok: ${tovabbi.join(', ')}` : null,
    vezetett.length === 0 ? null : vezetett.length === orszagok.length ? 'relációs vezető' : `relációs vezető: ${vezetett.join(', ')}`,
  ]
    .filter((r): r is string => Boolean(r))
    .join(' · ');
}

function Cimkezett({ cimke, children }: { cimke: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-[11px] text-muted-foreground">{cimke}</span>
      {children}
    </div>
  );
}

/**
 * Az adatlap fejléce mindkét állapotban: visszalink, az attasé neve és posztja, a félévválasztó, a félév
 * állapota, az összminősítés és a változás. Ha a félévre nincs értékelés (`sor` null), csak a félévválasztó
 * áll, hogy másik félévre lehessen váltani; a kihagyott attasénak nincs összminősítése. Az értékelt attasénál az
 * összminősítés és a változás mezője akkor is látszik („–”), ha még nincs összminősítés.
 */
export function AdatlapFejlec({
  attaseId,
  felev,
  szuro,
  visszaUrl,
  sor,
  idoszak,
}: {
  attaseId: string;
  felev: Felev;
  szuro: ErtekelesSzuro;
  /** A „Hálózati nézet” visszalink a megőrzött szűrőkkel; nélküle nincs link. */
  visszaUrl?: string;
  sor: ErtekelesSor | null;
  idoszak: IdoszakSor | null;
}) {
  const ertekelt = sor !== null && !sor.kimarad;
  return (
    <section aria-label="Az attasé adatai" className="flex flex-wrap items-end gap-x-4 gap-y-3 rounded-xl border border-border bg-card p-3.5">
      <div className="min-w-0">
        {visszaUrl !== undefined && (
          <Link href={visszaUrl} className="mb-1 inline-block rounded-sm text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span aria-hidden="true">← </span>Hálózati nézet
          </Link>
        )}
        <h2 className="text-[18px] leading-tight font-semibold wrap-anywhere">{sor === null ? 'Az attasé adatlapja' : sor.nev}</h2>
        {sor !== null && <p className="mt-0.5 text-[12px] text-muted-foreground">{posztFelirat(sor)}</p>}
      </div>
      <div className="ml-auto flex min-w-0 max-w-full flex-wrap items-end gap-x-4 gap-y-2.5">
        <FelevValaszto attaseId={attaseId} ev={felev.ev} felev={felev.felev} szuro={szuro} />
        {idoszak !== null && (
          <Cimkezett cimke="A félév állapota">
            <Badge variant={idoszak.statusz === 'nyitott' ? 'default' : 'secondary'} className="h-6 px-2.5 text-[11.5px]">
              {idoszak.statusz === 'nyitott' ? 'Nyitott' : 'Lezárva'}
            </Badge>
          </Cimkezett>
        )}
        {ertekelt && (
          <>
            <Cimkezett cimke="Összminősítés">
              {sor.osszFokozat === null ? (
                <span className="flex h-[22px] items-center text-[11.5px] text-muted-foreground">
                  <span aria-hidden="true">–</span>
                  <span className="sr-only">Még nincs összminősítés</span>
                </span>
              ) : (
                // Keskeny helyen tördelhető, hogy ne lógjon ki.
                <span className="[&>span]:whitespace-normal">
                  <FokozatJelveny fokozat={sor.osszFokozat} />
                </span>
              )}
            </Cimkezett>
            <Cimkezett cimke="Az előző lezárt félévhez képest">
              <span className="flex h-[22px] items-center">
                <ValtozasJelzes valtozas={sor.valtozas} />
              </span>
            </Cimkezett>
          </>
        )}
      </div>
    </section>
  );
}
