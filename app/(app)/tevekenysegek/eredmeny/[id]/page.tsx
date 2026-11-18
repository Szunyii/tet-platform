import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { listSajatRiportok } from '../../../../../db/queries/riport';
import { getEredmeny } from '../../../../../db/queries/tevekenyseg';
import { requireSession } from '../../../../../lib/session';
import { canModosit, canViewBejegyzes } from '../../../../../lib/tevekenyseg-jog';
import { EredmenyAdatlap } from '../../components/EredmenyAdatlap';
import { UgyMuveletek } from '../../components/UgyMuveletek';

// Statikus cím: az ügy megnevezése jog-ellenőrzés nélkül nem kerülhet a metaadatokba.
export const metadata: Metadata = { title: 'Eredmény adatlapja' };

/** Ennyi saját jelentés választható az igazoláskéréshez, a legfrissebbtől. */
const RIPORT_OPCIO_LIMIT = 200;

export default async function EredmenyOldal({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const ugy = getEredmeny(id);
  // Idegen vagy nem létező ügy: 404, nem áruljuk el, hogy létezik.
  if (!ugy || !canViewBejegyzes(session, ugy)) notFound();

  return (
    <EredmenyAdatlap
      ugy={ugy}
      muveletek={
        canModosit(session, ugy) ? (
          <UgyMuveletek
            ugy={ugy}
            orszagok={session.orszagok.map((o) => o.kod)}
            riportOpciok={listSajatRiportok(session.userId, RIPORT_OPCIO_LIMIT).sorok.map((r) => ({ id: r.id, targy: r.targy }))}
          />
        ) : undefined
      }
    />
  );
}
