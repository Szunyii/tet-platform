import type { Metadata } from 'next';
import { RiportForm } from '../../../components/riport/RiportForm';
import { listSajatRiportok } from '../../../db/queries/riport';
import { orszagNev } from '../../../lib/orszagok';
import { requireSession } from '../../../lib/session';
import { createRiportAction } from './actions';
import { KORABBI_LIMIT, KorabbiBejegyzesek } from './components/KorabbiBejegyzesek';

export const metadata: Metadata = { title: 'Új bejegyzés' };

export default async function UjRiportPage() {
  const session = await requireSession();
  if (session.orszagok.length === 0) {
    if (session.role === 'admin') {
      return (
        <div className="max-w-3xl rounded-xl border border-border bg-card p-6 text-sm">
          <p className="font-medium">Adminként nem adhatsz be bejegyzést.</p>
          <p className="mt-1 text-muted-foreground">Bejegyzést TéT poszthoz rendelt attasé fiók adhat be.</p>
        </div>
      );
    }
    return (
      <div className="max-w-3xl rounded-xl border border-border bg-card p-6 text-sm">
        <p className="font-medium">A fiókodhoz nincs ország rendelve.</p>
        <p className="mt-1 text-muted-foreground">
          Bejegyzést csak TéT poszthoz rendelt fiókkal lehet beadni. Kérd az admint, hogy állítsa be az országot.
        </p>
      </div>
    );
  }
  // A választható országok a session sorrendjében (székhely elöl), magyar névvel.
  const orszagok = session.orszagok.map((o) => ({ kod: o.kod, nev: orszagNev(o.kod) }));
  const korabbi = listSajatRiportok(session.userId, KORABBI_LIMIT);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {orszagok.length === 1 ? (
          <>
            A bejegyzés a(z) <span className="font-medium text-foreground">{orszagok[0].nev}</span> poszthoz kerül, a te
            neveddel.
          </>
        ) : (
          'A bejegyzés a lent választott országhoz kerül, a te neveddel.'
        )}
      </p>
      {/* items-start: a panel nem nyúlik a form magasságára, így tud ragadni (sticky). */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,48rem)_minmax(15rem,18rem)]">
        <RiportForm mode="create" action={createRiportAction} orszagok={orszagok.length > 1 ? orszagok : undefined} />
        {/* Az ország akkor is kell, ha a beadó ma már egy országos, de a bejegyzései több országról szólnak. */}
        <KorabbiBejegyzesek
          sorok={korabbi.sorok}
          osszes={korabbi.osszes}
          tobbOrszag={orszagok.length > 1 || new Set(korabbi.sorok.map((r) => r.orszag)).size > 1}
        />
      </div>
    </div>
  );
}
