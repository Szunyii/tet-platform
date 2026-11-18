import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { attaseIsmert, getAdatlap, megjelenitettFelev } from '../../../../db/queries/ertekeles';
import { aktualisEv, maiNaptariNap } from '../../../../lib/datum';
import { szuroFromSearchParams, szuroUrl } from '../../../../lib/ertekeles-szuro';
import type { SearchParams } from '../../../../lib/routes';
import { requireAdmin } from '../../../../lib/session';
import { getValasztottEv } from '../../../../lib/valasztott-ev';
import { kihagyAttaseAction, mentOsszAction, mentSzempontAction, visszaveszAttaseAction } from '../actions';
import { AdatlapFejlec } from '../components/AdatlapFejlec';
import { Munkalap } from '../components/Munkalap';
import { Osszkep } from '../components/Osszkep';
import { SzempontSorok } from '../components/SzempontSorok';

export const metadata: Metadata = { title: 'Monitoring és értékelés' };

function Tajekoztato({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

/** A kihagyás indoklása mondatvégi írásjel nélkül, hogy a felirat végére tett pont ne duplázódjon. */
function kimaradasFelirat(ok: string | null): string {
  const tiszta = ok?.trim().replace(/[.!?]+$/, '') ?? '';
  return tiszta === '' ? 'Ebben a félévben nem értékelt.' : `Ebben a félévben nem értékelt: ${tiszta}.`;
}

export default async function AdatlapOldal({
  params,
  searchParams,
}: {
  params: Promise<{ attaseId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
  const { attaseId } = await params;
  // Az ismeretlen attasé a választott évtől független hiba: 404. Az év- vagy félévfüggő hiány tájékoztató kártya.
  if (!attaseIsmert(attaseId)) notFound();
  const szuro = szuroFromSearchParams(await searchParams);
  const ev = await getValasztottEv(aktualisEv());
  const felev = megjelenitettFelev(ev, szuro.felev, maiNaptariNap());
  const adatlap = getAdatlap(attaseId, felev);
  // A visszalink a kapott szűrőket és a megjelenített félévet is viszi, mint a hálózati nézet linkje.
  const visszaUrl = szuroUrl({ ...szuro, felev: felev.felev });

  if (adatlap === null) {
    return (
      <div className="@container flex flex-col gap-3">
        <AdatlapFejlec attaseId={attaseId} felev={felev} szuro={szuro} sor={null} idoszak={null} />
        <Tajekoztato>
          <p>Ehhez a félévhez nincs értékelés.</p>
          <Link href={visszaUrl} className="mt-2 inline-block text-[12.5px]">
            <span aria-hidden="true">← </span>Hálózati nézet
          </Link>
        </Tajekoztato>
      </div>
    );
  }

  const { idoszak, sor } = adatlap;
  return (
    <div className="@container flex flex-col gap-3">
      <AdatlapFejlec attaseId={attaseId} felev={felev} szuro={szuro} visszaUrl={visszaUrl} sor={sor} idoszak={idoszak} />
      {idoszak.statusz === 'nyitott' ? (
        // A `key` kötelező: az App Router állapot-kulcsa nem tartalmazza a sütiből jövő évet, nélküle az
        // előző év piszkozata az új évhez kerülne.
        <Munkalap
          key={`${felev.ev}/${felev.felev}/${attaseId}`}
          sor={sor}
          osszIndoklas={adatlap.osszIndoklas}
          fejlesztesiCel={adatlap.fejlesztesiCel}
          osszVerzio={adatlap.osszVerzio}
          minositesek={adatlap.minositesek}
          mutatok={adatlap.mutatok}
          elozmeny={adatlap.elozmeny}
          letezoJelentesek={adatlap.letezoJelentesek}
          letezoTicketek={adatlap.letezoTicketek}
          letezoEredmenyek={adatlap.letezoEredmenyek}
          szempontAction={mentSzempontAction.bind(null, sor.ertekelesId)}
          osszAction={mentOsszAction.bind(null, sor.ertekelesId)}
          kihagyasAction={kihagyAttaseAction.bind(null, sor.ertekelesId)}
          visszavetelAction={visszaveszAttaseAction.bind(null, sor.ertekelesId)}
        />
      ) : sor.kimarad ? (
        <Tajekoztato>{kimaradasFelirat(sor.kimaradasOka)}</Tajekoztato>
      ) : (
        <>
          <Osszkep
            osszIndoklas={adatlap.osszIndoklas}
            fejlesztesiCel={adatlap.fejlesztesiCel}
            ertekeloNev={adatlap.ertekeloNev}
            minositveAt={adatlap.minositveAt}
            elozmeny={adatlap.elozmeny}
            felev={felev}
          />
          <SzempontSorok
            mutatok={adatlap.mutatok}
            minositesek={adatlap.minositesek}
            letezoJelentesek={adatlap.letezoJelentesek}
            letezoTicketek={adatlap.letezoTicketek}
            letezoEredmenyek={adatlap.letezoEredmenyek}
          />
        </>
      )}
    </div>
  );
}
