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
  // A key a ?o= változásakor (vissza/előre, oldalsáv) újramountolja a nézetet, hogy a kezdő
  // kiválasztás frissüljön. Az év szándékosan NINCS a key-ben: évváltáskor a kiválasztás, a
  // metrika-fül és az iparág-szűrő maradjon meg (a TerkepNezet igazítja, ha az ország eltűnik).
  return (
    <TerkepNezet
      key={kezdoKod ?? ''}
      adatok={listTerkepAdat(ev)}
      ev={ev}
      most={most}
      kezdoKod={kezdoKod}
      valasztEvAction={valasztEvAction}
    />
  );
}
