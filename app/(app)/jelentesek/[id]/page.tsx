import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RiportReszlet } from '../components/RiportReszlet';
import { getRiport } from '../../../../db/queries/riport';
import { canEditRiport, canIntezkedni, canViewRiport } from '../../../../lib/riport-jog';
import { requireSession } from '../../../../lib/session';
import { deleteRiportAction, mentIntezkedesAction } from '../actions';

export const metadata: Metadata = { title: 'Bejegyzés' };

export default async function RiportOldal({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const riport = getRiport(id);
  // Idegen vagy nem létező bejegyzés: 404, nem áruljuk el, hogy létezik.
  if (!riport || !canViewRiport(session, riport)) notFound();
  return (
    <RiportReszlet
      riport={riport}
      szerkeszthet={canEditRiport(session, riport)}
      torlesAction={deleteRiportAction.bind(null, id)}
      intezkedesAction={canIntezkedni(session) ? mentIntezkedesAction.bind(null, id) : undefined}
    />
  );
}
