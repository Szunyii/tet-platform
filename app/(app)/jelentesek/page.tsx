import type { Metadata } from 'next';
import Link from 'next/link';
import { RiportSzurok } from './components/RiportSzurok';
import { RiportTabla } from './components/RiportTabla';
import { buttonVariants } from '../../../components/ui/button';
import { listRiportOrszagok, listRiportok, listRiportSzerzok } from '../../../db/queries/riport';
import { riportMinositesek } from '../../../db/queries/riport-minosites';
import { canIntezkedni } from '../../../lib/riport-jog';
import type { SearchParams } from '../../../lib/routes';
import { minositesFromSearchParams, szuroErtekek, szuroFromSearchParams } from '../../../lib/riport-szuro';
import { requireSession } from '../../../lib/session';
import { cn } from '../../../lib/utils';
import { mentIntezkedesAction, mentMinositesAction } from './actions';

export const metadata: Metadata = { title: 'Jelentések' };

export default async function RiportokPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await requireSession();
  const admin = session.role === 'admin';
  const sp = await searchParams;
  const szuro = szuroFromSearchParams(sp);
  const orszagok = admin ? listRiportOrszagok() : [];
  const szerzok = admin ? listRiportSzerzok() : [];
  if (admin) {
    // Elavult vagy kézzel írt érték: szűrő nélkül, hogy a legördülőben ne nyers kód vagy id álljon.
    if (szuro.orszag && !orszagok.includes(szuro.orszag)) delete szuro.orszag;
    if (szuro.szerzoId && !szerzok.some((s) => s.id === szuro.szerzoId)) delete szuro.szerzoId;
  } else {
    // Az attasé nem szűrhet országra és szerzőre: az URL-ből jövőt eldobjuk.
    delete szuro.orszag;
    delete szuro.szerzoId;
  }
  // A központi minősítés csak a központé (spec 7.): attasénál az URL-ből jövő `minosites` értéket teljesen eldobjuk
  // (nem szűkíti a listát, nem számít aktív szűrőnek, nem kerül a szűrőértékekbe), a minősítések pedig be sem
  // töltődnek, ezért a HTML-be és az RSC-adatba sem juthatnak.
  const minositheto = canIntezkedni(session);
  const minositesSzuro = minositheto ? minositesFromSearchParams(sp) : null;
  const ertekek = szuroErtekek(szuro, minositesSzuro);
  const vanSzuro = Object.values(ertekek).some(Boolean);
  // Attasé csak a sajátjait látja. A kényszerített szerző-szűrő csak a lekérdezésbe kerül, a
  // szűrőértékekbe nem, különben aktív szűrőnek látszana („Szűrők törlése”, üres-állapot szöveg).
  const lista = listRiportok(admin ? szuro : { ...szuro, szerzoId: session.userId });
  const minositesek = minositheto ? riportMinositesek(lista.map((r) => r.id)) : undefined;
  // A minősítés szűrője memóriában fut: a listRiportok nem lapoz és nem korlátoz, ezért nem maradhat ki sor.
  const sorok =
    minositesek && minositesSzuro !== null
      ? lista.filter((r) => {
          const fokozat = minositesek.get(r.id)?.fokozat;
          return minositesSzuro === 'nincs' ? fokozat === undefined : fokozat === minositesSzuro;
        })
      : lista;
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
        minositesek={minositesek}
        minositesAction={minositheto ? (id) => mentMinositesAction.bind(null, id) : undefined}
      />
    </div>
  );
}
