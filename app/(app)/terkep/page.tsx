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
  const session = await requireSession();
  const most = aktualisEv();
  const ev = await getValasztottEv(most);
  const o = (await searchParams).o;
  const kezdoKod = typeof o === 'string' && orszagByKod(o) ? o : null;
  // A key a ?o= és az év változásakor újramountolja a nézetet, hogy a kezdő kiválasztás
  // frissüljön (vissza/előre, oldalsáv) és a kiválasztás ne ragadjon be, ha a választott
  // ország eltűnik az évváltással az adatokból.
  return (
    <TerkepNezet
      key={`${kezdoKod ?? ''}:${ev}`}
      adatok={listTerkepAdat(ev)}
      ev={ev}
      most={most}
      sajatKod={session.orszag}
      admin={session.role === 'admin'}
      kezdoKod={kezdoKod}
      valasztEvAction={valasztEvAction}
    />
  );
}
