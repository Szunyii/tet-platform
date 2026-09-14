import type { Metadata } from 'next';
import { listTerkepAdat } from '../../../db/queries/orszagprofil';
import { aktualisEv } from '../../../lib/datum';
import { orszagByKod } from '../../../lib/orszagok';
import { requireSession } from '../../../lib/session';
import { getValasztottEv } from '../../../lib/valasztott-ev';
import { valasztEvAction } from '../actions';
import { TerkepNezet } from './components/TerkepNezet';

export const metadata: Metadata = { title: 'Országprofil' };

export default async function TerkepPage({
  searchParams,
}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireSession();
  const most = aktualisEv();
  const ev = await getValasztottEv(most);
  const o = (await searchParams).o;
  const kezdoKod = typeof o === 'string' && orszagByKod(o) ? o : null;
  // A ?o= változását (vissza/előre, oldalsáv, „Vissza a térképre") a useTerkepAllapot kezeli
  // render közben: a kijelölés frissül, a mutató, a szűrő és az összehasonlítás-halmaz megmarad.
  // Ezért nincs key – az évváltásnál is a hook igazítja az állapotot, ha az ország eltűnik.
  return (
    <TerkepNezet
      adatok={listTerkepAdat(ev)}
      ev={ev}
      most={most}
      kezdoKod={kezdoKod}
      valasztEvAction={valasztEvAction}
    />
  );
}
