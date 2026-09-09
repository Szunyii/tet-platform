import type { Metadata } from 'next';
import { Card } from '../../../components/ui/card';
import {
  getTicket,
  jelolOlvasottnak,
  listCimzettJeloltek,
  listTicketek,
  type TicketDetail,
} from '../../../db/queries/ticket';
import { maiNaptariNap } from '../../../lib/datum';
import { requireSession } from '../../../lib/session';
import { canViewTicket } from '../../../lib/ticket-jog';
import { parseSzuro } from '../../../lib/ticket-szotar';
import { closeTicketAction, reopenTicketAction, sendUzenetAction } from './actions';
import { TicketAdatlap } from './components/TicketAdatlap';
import { TicketBeszelgetes } from './components/TicketBeszelgetes';
import { TicketLista } from './components/TicketLista';
import { UjTicketDialog } from './components/UjTicketDialog';

export const metadata: Metadata = { title: 'Kommunikáció' };

type SearchParams = Record<string, string | string[] | undefined>;

export default async function KommunikacioPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await requireSession();
  const admin = session.role === 'admin';
  const sp = await searchParams;
  const szuro = parseSzuro(sp.sz);
  const tParam = typeof sp.t === 'string' ? sp.t : undefined;

  const lista = listTicketek(session, szuro);

  // Kiválasztott: a ?t=, ha létezik és látható; különben a lista első eleme. Idegen vagy
  // hiányzó id-nál nincs 404 (a lista URL-e nem érzékeny), egyszerűen az első elem jön.
  // A getTicket maga is szűr láthatóságra; a canViewTicket az explicit jogosultsági modell.
  let kivalasztott: TicketDetail | null = tParam ? getTicket(tParam, session) : null;
  if (kivalasztott && !canViewTicket(session, kivalasztott)) kivalasztott = null;
  if (!kivalasztott && lista[0]) kivalasztott = getTicket(lista[0].id, session);

  // Megtekintés = olvasott. Idempotens upsert, ezért a dev-módú dupla render sem gond;
  // a listában is olvasottnak mutatjuk, mert a lista a jelölés előtt készült.
  if (kivalasztott) {
    jelolOlvasottnak(kivalasztott.id, session.userId);
    kivalasztott = { ...kivalasztott, olvasatlan: false };
  }
  const kivalasztottId = kivalasztott?.id ?? null;
  const sorok = lista.map((t) => (t.id === kivalasztottId ? { ...t, olvasatlan: false } : t));

  const ma = maiNaptariNap();
  const jeloltek = admin ? listCimzettJeloltek() : [];

  return (
    <div className="grid max-w-[1500px] items-start gap-4 lg:grid-cols-[22rem_minmax(0,1fr)_17rem]">
      <TicketLista sorok={sorok} kivalasztottId={kivalasztottId} szuro={szuro} admin={admin} ma={ma} />

      {kivalasztott ? (
        <TicketBeszelgetes
          key={kivalasztott.id}
          ticket={kivalasztott}
          nezoSzerep={session.role}
          nezoNev={session.name}
          kuldesAction={sendUzenetAction.bind(null, kivalasztott.id)}
        />
      ) : (
        <Card className="p-6 text-sm text-muted-foreground">
          {admin ? 'Nincs kiválasztott ticket. Nyiss egyet a jobb oldali gombbal.' : 'Még nincs hozzád címzett ticket.'}
        </Card>
      )}

      <div className="flex flex-col gap-4">
        {kivalasztott && (
          <TicketAdatlap
            ticket={kivalasztott}
            admin={admin}
            ma={ma}
            lezarAction={closeTicketAction.bind(null, kivalasztott.id)}
            ujranyitAction={reopenTicketAction.bind(null, kivalasztott.id)}
          />
        )}
        {admin && <UjTicketDialog jeloltek={jeloltek} />}
      </div>
    </div>
  );
}
