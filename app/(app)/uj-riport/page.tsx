import type { Metadata } from 'next';
import { RiportForm } from '../../../components/riport/RiportForm';
import { requireSession } from '../../../lib/session';
import { createRiportAction } from './actions';

export const metadata: Metadata = { title: 'Új bejegyzés' };

export default async function UjRiportPage() {
  const session = await requireSession();
  if (!session.orszag) {
    if (session.role === 'admin') {
      return (
        <div className="max-w-3xl rounded-xl border border-border bg-card p-6 text-sm">
          <p className="font-medium">Adminként nem adhatsz be bejegyzést.</p>
          <p className="mt-1 text-muted-foreground">
            Bejegyzést TéT poszthoz rendelt attasé fiók adhat be. Adminként bejegyzés beadásához országot kell
            rendelni a fiókodhoz.
          </p>
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
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        A bejegyzés a(z) <span className="font-medium text-foreground">{session.orszag}</span> poszthoz kerül, a te
        neveddel.
      </p>
      <RiportForm mode="create" action={createRiportAction} />
    </div>
  );
}
