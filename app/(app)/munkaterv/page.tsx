import type { Metadata } from 'next';
import {
  getMunkatervEv,
  getTerv,
  listKozpontiCelok,
  listTervAttekintes,
  listTervesEvek,
  tervAttase,
} from '../../../db/queries/munkaterv';
import { aktualisEv } from '../../../lib/datum';
import { canJovahagy } from '../../../lib/munkaterv-jog';
import { tervEvek } from '../../../lib/munkaterv-szotar';
import { tervEvOpciok, tervEvParam } from '../../../lib/munkaterv-szuro';
import type { SearchParams } from '../../../lib/routes';
import { requireSession, type AppSession } from '../../../lib/session';
import { AttaseTerv, type TervHiany } from './components/AttaseTerv';
import { EvValaszto } from './components/EvValaszto';
import { KozpontiCelok } from './components/KozpontiCelok';
import { TervAttekintes } from './components/TervAttekintes';

export const metadata: Metadata = { title: 'Éves munkaterv' };

/** A központ nézete: a központi célok kezelése és az attasék terveinek áttekintése. */
function KozpontNezet({ ev, most }: { ev: number; most: number }) {
  const sorok = listTervAttekintes(ev);
  const jovahagyva = sorok.filter((s) => s.statusz === 'jovahagyott').length;
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h2 className="text-base leading-snug font-semibold wrap-anywhere">Munkatervek · {ev}</h2>
          <p className="text-xs text-muted-foreground">
            {sorok.length} attasé · {jovahagyva} jóváhagyva
          </p>
        </div>
        <div className="ml-auto max-w-full">
          <EvValaszto ev={ev} evek={tervEvOpciok(listTervesEvek(), ev, most)} />
        </div>
      </div>
      <div className="grid min-w-0 items-start gap-3 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <KozpontiCelok
          ev={ev}
          celok={listKozpontiCelok(ev)}
          kozzetetel={getMunkatervEv(ev)}
          tervezheto={tervEvek(most).includes(ev)}
        />
        <TervAttekintes sorok={sorok} ev={ev} />
      </div>
    </div>
  );
}

/** Az attasé nézete: a saját terve a megnyitott évre. */
function AttaseNezet({ session, ev, most }: { session: AppSession; ev: number; most: number }) {
  const terv = getTerv(session.userId, ev);
  const tartalomNyitva = tervEvek(most).includes(ev);
  const hiany: TervHiany = !tartalomNyitva ? 'mult' : getMunkatervEv(ev) ? 'kezdheto' : 'nincs_kozzeteve';
  return (
    <AttaseTerv
      terv={terv}
      hiany={hiany}
      nev={session.name}
      varos={tervAttase(session.userId)?.varos ?? null}
      ev={ev}
      evek={tervEvOpciok(listTervesEvek(session.userId), ev, most)}
      orszagok={session.orszagok.map((o) => o.kod)}
      tartalomNyitva={tartalomNyitva}
    />
  );
}

export default async function MunkatervPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await requireSession();
  const most = aktualisEv();
  const ev = tervEvParam((await searchParams).ev, most);

  // A `key` kötelező: az év az URL-ben él, nélküle az előző év kliens-állapota (hibaüzenet, nyitott ablak) megmaradna.
  return canJovahagy(session) ? <KozpontNezet key={ev} ev={ev} most={most} /> : <AttaseNezet key={ev} session={session} ev={ev} most={most} />;
}
