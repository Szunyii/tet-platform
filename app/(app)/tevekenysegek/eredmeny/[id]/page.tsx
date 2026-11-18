import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { listSajatRiportok } from '../../../../../db/queries/riport';
import { getEredmeny } from '../../../../../db/queries/tevekenyseg';
import { requireSession } from '../../../../../lib/session';
import { attaseMuveletek } from '../../../../../lib/tevekenyseg-allapot';
import { canIgazol, canModosit, canViewBejegyzes } from '../../../../../lib/tevekenyseg-jog';
import { AdminAdatlapMuveletek } from '../../components/AdminUgyMuveletek';
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

  const sajat = canModosit(session, ugy);
  const admin = canIgazol(session);
  // A kliensre csak az ügy sora megy, az előzmények és a tevékenységek nem.
  const { esemenyek: _esemenyek, tevekenysegek: _tevekenysegek, ...sor } = ugy;

  return (
    <EredmenyAdatlap
      ugy={ugy}
      admin={admin}
      kifogasModosithato={sajat && attaseMuveletek(ugy, ugy.torolheto).includes('modosit')}
      muveletek={
        admin ? (
          <AdminAdatlapMuveletek ugy={sor} />
        ) : sajat ? (
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
