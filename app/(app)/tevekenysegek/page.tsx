import type { Metadata } from 'next';
import { listOrszagAttasek } from '../../../db/queries/attase-orszag';
import { getRiport, listSajatRiportok } from '../../../db/queries/riport';
import {
  getEredmeny,
  getRiportElotoltes,
  listEredmenyek,
  listSajatAktivEredmenyek,
  listTevekenysegek,
} from '../../../db/queries/tevekenyseg';
import { szekhelyKod } from '../../../lib/attase-orszag';
import { aktualisEv, maiNaptariNap } from '../../../lib/datum';
import { orszagNev } from '../../../lib/orszagok';
import type { SearchParams } from '../../../lib/routes';
import { requireSession, type AppSession } from '../../../lib/session';
import { jelentesbolIndithato, tevekenysegSzuroFromSearchParams } from '../../../lib/tevekenyseg-szuro';
import { getValasztottEv } from '../../../lib/valasztott-ev';
import { AdminNezet } from './components/AdminNezet';
import { AttaseNezet } from './components/AttaseNezet';
import { EredmenyKartya } from './components/EredmenyKartya';
import { EredmenyTabla, tablanLatszik } from './components/EredmenyTabla';
import { visszakuldesMegjegyzes } from './components/EsemenyIdovonal';
import type { TevekenysegElotoltes, TevekenysegUrlapAdat } from './components/TevekenysegDialog';
import { TevekenysegTabla } from './components/TevekenysegTabla';

export const metadata: Metadata = { title: 'Tevékenységek és eredmények' };

/** Ennyi saját jelentés választható a kapcsolódó jelentés listájában, a legfrissebbtől. */
const RIPORT_OPCIO_LIMIT = 200;

/** Az állomáshely: a székhely városa, ennek hiányában a székhely országa. */
function allomashely(session: AppSession): string | null {
  const kod = szekhelyKod(session.orszagok);
  if (!kod) return null;
  return listOrszagAttasek(kod).find((a) => a.userId === session.userId)?.varos ?? orszagNev(kod);
}

/**
 * A jelentésből indított tevékenység kezdőértékei: csak saját, rendezvény vagy együttműködés kategóriájú
 * jelentésből. Ha a jelentés országa már nem az attaséé, az ország a székhely marad.
 */
function jelentesElotoltes(riportId: string | undefined, session: AppSession): TevekenysegElotoltes | null {
  if (!riportId) return null;
  const riport = getRiport(riportId);
  if (!riport || riport.szerzoId !== session.userId || !jelentesbolIndithato(riport.kategoria)) return null;
  const elotoltes = getRiportElotoltes(riportId, session.userId);
  if (!elotoltes) return null;
  const sajat = session.orszagok.some((o) => o.kod === elotoltes.orszagKod);
  return sajat ? elotoltes : { ...elotoltes, orszagKod: szekhelyKod(session.orszagok) ?? '' };
}

export default async function TevekenysegekPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await requireSession();
  const szuro = tevekenysegSzuroFromSearchParams(await searchParams);

  const ev = await getValasztottEv(aktualisEv());

  if (session.role === 'admin') return <AdminNezet szuro={szuro} ev={ev} />;

  const ful = szuro.ful === 'tevekenysegek' ? 'tevekenysegek' : 'eredmenyek';

  const eredmenyek = listEredmenyek({ attaseId: session.userId });
  const aktivak = eredmenyek.filter((u) => tablanLatszik(u, ev));
  const megszakadtak = eredmenyek.filter((u) => u.allapot === 'megszakadt');
  const tevekenysegek = listTevekenysegek({ attaseId: session.userId, ev, felev: szuro.felev ?? undefined });

  const adat: TevekenysegUrlapAdat = {
    orszagok: session.orszagok.map((o) => o.kod),
    eredmenyOpciok: listSajatAktivEredmenyek(session.userId),
    riportOpciok: listSajatRiportok(session.userId, RIPORT_OPCIO_LIMIT).sorok.map((r) => ({ id: r.id, targy: r.targy })),
    ma: maiNaptariNap(),
  };

  // A visszaküldött ügyek kártyáján a központ megjegyzése is látszik.
  const megjegyzesek = new Map(
    aktivak
      .filter((u) => u.igazolas === 'visszakuldott')
      .map((u) => [u.id, visszakuldesMegjegyzes(getEredmeny(u.id)?.esemenyek ?? [])] as const),
  );

  return (
    <AttaseNezet
      nev={session.name}
      allomashely={allomashely(session)}
      ev={ev}
      ful={ful}
      felev={szuro.felev}
      megszakadt={szuro.megszakadt}
      eredmenyDb={aktivak.length}
      megszakadtDb={megszakadtak.length}
      tevekenysegDb={tevekenysegek.length}
      adat={adat}
      ujNyitva={szuro.uj === 'tevekenyseg'}
      elotoltes={szuro.uj ? jelentesElotoltes(szuro.riport, session) : null}
    >
      {ful === 'tevekenysegek' ? (
        <TevekenysegTabla tevekenysegek={tevekenysegek} adat={adat} />
      ) : szuro.megszakadt ? (
        megszakadtak.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            Nincs megszakadt ügy.
          </p>
        ) : (
          <section aria-labelledby="megszakadt-cim" className="flex flex-col gap-2">
            <h3 id="megszakadt-cim" className="sr-only">
              Megszakadt ügyek
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {megszakadtak.map((u) => (
                <EredmenyKartya key={u.id} ugy={u} />
              ))}
            </div>
          </section>
        )
      ) : (
        <EredmenyTabla eredmenyek={aktivak} ev={ev} megjegyzesek={megjegyzesek} />
      )}
    </AttaseNezet>
  );
}
