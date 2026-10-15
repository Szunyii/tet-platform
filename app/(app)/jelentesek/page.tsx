import type { Metadata } from 'next';
import Link from 'next/link';
import { RiportSzurok } from './components/RiportSzurok';
import { RiportTabla } from './components/RiportTabla';
import { buttonVariants } from '../../../components/ui/button';
import { listOrszagok, listRiportok, listSzerzok } from '../../../db/queries/riport';
import { canIntezkedni } from '../../../lib/riport-jog';
import { szuroErtekek, szuroFromSearchParams, type SearchParams } from '../../../lib/riport-szuro';
import { requireSession } from '../../../lib/session';
import { cn } from '../../../lib/utils';
import { mentIntezkedesAction } from './actions';

export const metadata: Metadata = { title: 'Jelentések' };

export default async function RiportokPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await requireSession();
  const admin = session.role === 'admin';
  const szuro = szuroFromSearchParams(await searchParams);
  const orszagok = admin ? listOrszagok() : [];
  const szerzok = admin ? listSzerzok() : [];
  if (admin) {
    // Elavult vagy kézzel írt érték: szűrő nélkül, hogy a legördülőben ne nyers kód vagy id álljon.
    if (szuro.orszag && !orszagok.includes(szuro.orszag)) delete szuro.orszag;
    if (szuro.szerzoId && !szerzok.some((s) => s.id === szuro.szerzoId)) delete szuro.szerzoId;
  } else {
    // Az attasé nem szűrhet országra és szerzőre: az URL-ből jövőt eldobjuk.
    delete szuro.orszag;
    delete szuro.szerzoId;
  }
  const ertekek = szuroErtekek(szuro);
  const vanSzuro = Object.values(ertekek).some(Boolean);
  // Attasé csak a sajátjait látja. A kényszerített szerző-szűrő csak a lekérdezésbe kerül, a
  // szűrőértékekbe nem, különben aktív szűrőnek látszana („Szűrők törlése”, üres-állapot szöveg).
  const sorok = listRiportok(admin ? szuro : { ...szuro, szerzoId: session.userId });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">{sorok.length} bejegyzés</p>
        <Link href="/uj-jelentes" className={cn('ml-auto', buttonVariants())}>
          Új bejegyzés
        </Link>
      </div>
      <RiportSzurok
        ertekek={ertekek}
        orszagok={orszagok}
        szerzok={szerzok}
        admin={admin}
      />
      <RiportTabla
        sorok={sorok}
        admin={admin}
        vanSzuro={vanSzuro}
        intezkedesAction={canIntezkedni(session) ? (id) => mentIntezkedesAction.bind(null, id) : undefined}
      />
    </div>
  );
}
