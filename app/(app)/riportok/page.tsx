import type { Metadata } from 'next';
import Link from 'next/link';
import { RiportSzurok } from '../../../components/riport/RiportSzurok';
import { RiportTabla } from '../../../components/riport/RiportTabla';
import { buttonVariants } from '../../../components/ui/button';
import { listOrszagok, listRiportok } from '../../../db/queries/riport';
import { szuroErtekek, szuroFromSearchParams, type SearchParams } from '../../../lib/riport-szuro';
import { requireSession } from '../../../lib/session';
import { cn } from '../../../lib/utils';

export const metadata: Metadata = { title: 'Riportok' };

export default async function RiportokPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await requireSession();
  const admin = session.role === 'admin';
  const szuro = szuroFromSearchParams(await searchParams);
  // Attasé csak a sajátjait látja: a szerző-szűrő kényszerítve, az ország-szűrő nem értelmezett.
  if (!admin) {
    szuro.szerzoId = session.userId;
    delete szuro.orszag;
  }
  const sorok = listRiportok(szuro);
  const ertekek = szuroErtekek(szuro);
  const vanSzuro = Object.values(ertekek).some(Boolean);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">{sorok.length} bejegyzés</p>
        <Link href="/uj-riport" className={cn('ml-auto', buttonVariants())}>
          Új bejegyzés
        </Link>
      </div>
      <RiportSzurok ertekek={ertekek} orszagok={admin ? listOrszagok() : []} admin={admin} />
      <RiportTabla sorok={sorok} admin={admin} vanSzuro={vanSzuro} />
    </div>
  );
}
