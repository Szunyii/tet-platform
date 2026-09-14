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
  // Nincs key: évváltáskor (a page mountolva marad) a useTerkepAllapot render közben igazítja az
  // állapotot – a kijelölés és az összehasonlítás-halmaz nem létező elemei kikerülnek, a mutató és
  // a szűrő megmarad –, és a ?o= változását is a hook kezeli, ha ugyanezen a route-on belül
  // változna. Más route-ról (profil oldal, oldalsáv) érkezve a nézet amúgy is újramountol.
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
