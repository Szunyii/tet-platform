import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RiportReszlet } from '../components/RiportReszlet';
import { getRiport } from '../../../../db/queries/riport';
import { countRiportTevekenyseg } from '../../../../db/queries/tevekenyseg';
import { canEditRiport, canIntezkedni, canViewRiport } from '../../../../lib/riport-jog';
import { requireSession } from '../../../../lib/session';
import { canRogzit } from '../../../../lib/tevekenyseg-jog';
import { jelentesbolIndithato, tevekenysegUrl } from '../../../../lib/tevekenyseg-szuro';
import { deleteRiportAction, mentIntezkedesAction } from '../actions';

export const metadata: Metadata = { title: 'Bejegyzés' };

export default async function RiportOldal({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const riport = getRiport(id);
  // Idegen vagy nem létező bejegyzés: 404, nem áruljuk el, hogy létezik.
  if (!riport || !canViewRiport(session, riport)) notFound();
  // Csak a szerző rögzíthet a saját jelentéséből, és csak a rendezvény és az együttműködés kategóriában.
  const rogzitheto = canRogzit(session) && riport.szerzoId === session.userId && jelentesbolIndithato(riport.kategoria);
  return (
    <RiportReszlet
      riport={riport}
      szerkeszthet={canEditRiport(session, riport)}
      tevekenysegRogzites={
        rogzitheto
          ? {
              url: tevekenysegUrl({ ful: 'tevekenysegek', uj: 'tevekenyseg', riport: riport.id }),
              darab: countRiportTevekenyseg(riport.id),
            }
          : undefined
      }
      torlesAction={deleteRiportAction.bind(null, id)}
      intezkedesAction={canIntezkedni(session) ? mentIntezkedesAction.bind(null, id) : undefined}
    />
  );
}
