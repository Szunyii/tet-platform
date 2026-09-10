import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RiportForm } from '../../../../../components/riport/RiportForm';
import { getRiport } from '../../../../../db/queries/riport';
import { orszagNev } from '../../../../../lib/orszagok';
import { canEditRiport } from '../../../../../lib/riport-jog';
import { requireSession } from '../../../../../lib/session';
import { updateRiportAction } from '../../actions';

export const metadata: Metadata = { title: 'Bejegyzés szerkesztése' };

export default async function RiportSzerkesztesOldal({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const riport = getRiport(id);
  if (!riport || !canEditRiport(session, riport)) notFound();
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Szerkesztés: <span className="font-medium text-foreground">{riport.targy}</span> · {orszagNev(riport.orszag)} ·{' '}
        {riport.szerzoNev}
      </p>
      <RiportForm mode="edit" initial={riport} action={updateRiportAction.bind(null, id)} />
    </div>
  );
}
