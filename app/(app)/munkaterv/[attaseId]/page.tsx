import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTerv, listTervesEvek, tervAttase } from '../../../../db/queries/munkaterv';
import { aktualisEv } from '../../../../lib/datum';
import { tervEvek } from '../../../../lib/munkaterv-szotar';
import { tervEvOpciok, tervEvParam } from '../../../../lib/munkaterv-szuro';
import type { SearchParams } from '../../../../lib/routes';
import { requireAdmin } from '../../../../lib/session';
import { TervReszlet } from '../components/TervReszlet';

export const metadata: Metadata = { title: 'Éves munkaterv' };

export default async function MunkatervReszletPage({
  params,
  searchParams,
}: {
  params: Promise<{ attaseId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  // Az attasé a saját tervét a /munkaterv oldalon látja: ez az útvonal neki 404.
  await requireAdmin();
  const { attaseId } = await params;
  // Az ismeretlen attasé az évtől független hiba: 404. Az évfüggő hiány tájékoztató kártya.
  const attase = tervAttase(attaseId);
  if (!attase) notFound();

  const most = aktualisEv();
  const ev = tervEvParam((await searchParams).ev, most);
  return (
    <TervReszlet
      key={ev}
      terv={getTerv(attaseId, ev)}
      attaseId={attaseId}
      nev={attase.nev}
      varos={attase.varos}
      ev={ev}
      evek={tervEvOpciok(listTervesEvek(attaseId), ev, most)}
      tartalomNyitva={tervEvek(most).includes(ev)}
    />
  );
}
