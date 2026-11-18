import type { Metadata } from 'next';
import type { SelectOpcio } from '../../../components/form/CimkesSelect';
import { listHalozat, megjelenitettFelev, type IdoszakSor } from '../../../db/queries/ertekeles';
import { aktualisEv, maiNaptariNap } from '../../../lib/datum';
import { felevMegkezdodott, megnyithato, type Felev } from '../../../lib/ertekeles-idoszak';
import { osszesit, regionkent, szurSorok, type ErtekelesSor } from '../../../lib/ertekeles-osszesites';
import { szuroFromSearchParams, szuroUrl } from '../../../lib/ertekeles-szuro';
import { orszagNev, orszagRegio, ORSZAG_REGIOK } from '../../../lib/orszagok';
import { huOsszevet } from '../../../lib/rendezes';
import type { SearchParams } from '../../../lib/routes';
import { requireAdmin } from '../../../lib/session';
import { getValasztottEv } from '../../../lib/valasztott-ev';
import { AllapotSav } from './components/AllapotSav';
import { ErtekelesSzurok } from './components/ErtekelesSzurok';
import { FokozatJelmagyarazat } from './components/FokozatJelmagyarazat';
import { Hoterkep } from './components/Hoterkep';
import { OsszesitoKartyak } from './components/OsszesitoKartyak';

export const metadata: Metadata = { title: 'Monitoring és értékelés' };

/** A szűrők opciói a félév soraiból: csak az választható, ami a félévben előfordul. */
function szuroOpciok(sorok: readonly ErtekelesSor[]) {
  const regiok: SelectOpcio[] = ORSZAG_REGIOK.filter((r) => sorok.some((s) => orszagRegio(s.szekhelyKod) === r.kulcs)).map(
    (r) => ({ ertek: r.kulcs, cimke: r.cimke }),
  );
  const orszagok: SelectOpcio[] = [...new Set(sorok.flatMap((s) => s.orszagok.map((o) => o.kod)))]
    .map((kod) => ({ ertek: kod, cimke: orszagNev(kod) }))
    .sort((a, b) => huOsszevet(a.cimke, b.cimke));
  const attasek: SelectOpcio[] = sorok
    .map((s) => ({ ertek: s.attaseId, cimke: s.nev }))
    .sort((a, b) => huOsszevet(a.cimke, b.cimke));
  return { regiok, orszagok, attasek };
}

/** A tájékoztató szöveg, ha a félévnek nincs megjeleníthető sora. */
function uresSzoveg(f: Felev, idoszak: IdoszakSor | null, ma: string): string {
  if (idoszak !== null) return 'Ebben a félévben nincs értékelhető attasé.';
  if (megnyithato(f, ma)) {
    return 'Ez a félév még nincs megnyitva. A megnyitással létrejönnek az aktív attasék értékelési sorai.';
  }
  if (!felevMegkezdodott(f, ma)) return 'Ez a félév még nem kezdődött el, ezért nem nyitható meg.';
  return 'Ehhez a félévhez nem készült értékelés. Csak a futó és a közvetlenül előtte lévő félév nyitható meg.';
}

export default async function MonitoringPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const szuro = szuroFromSearchParams(await searchParams);
  const ma = maiNaptariNap();
  const ev = await getValasztottEv(aktualisEv());
  const felev: Felev = megjelenitettFelev(ev, szuro.felev, ma);
  const felevSzam = felev.felev;
  const { idoszak, sorok, torlendoAttasek, fuggoKeresDb } = listHalozat(felev);
  // A félév-művelet után is ez a félév látszik: `?felev=` nélkül az alapérték a lezárt félévekből adódik, és a
  // művelet megváltoztathatja. A tisztítás előtti szűrőből készül, mert a még meg nem nyitott félévnek nincsenek
  // opciói, és a megnyitás után a régió- vagy országszűrő újra érvényes.
  const felevUrl = szuroUrl({ ...szuro, felev: felevSzam });

  // Elavult vagy kézzel írt érték: szűrő nélkül, hogy a legördülőben ne nyers kód vagy azonosító álljon.
  const opciok = szuroOpciok(sorok);
  if (!opciok.regiok.some((o) => o.ertek === szuro.regio)) delete szuro.regio;
  if (!opciok.orszagok.some((o) => o.ertek === szuro.orszag)) delete szuro.orszag;
  if (!opciok.attasek.some((o) => o.ertek === szuro.attase)) delete szuro.attase;

  const szurt = szurSorok(sorok, szuro);

  return (
    <div className="@container flex flex-col gap-3">
      <AllapotSav
        felev={felev}
        idoszak={idoszak}
        sorok={sorok}
        torlendoAttasek={torlendoAttasek}
        fuggoKeresDb={fuggoKeresDb}
        ma={ma}
        felevUrl={felevUrl}
      />
      <ErtekelesSzurok szuro={szuro} felev={felevSzam} {...opciok} />
      {sorok.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          {uresSzoveg(felev, idoszak, ma)}
        </p>
      ) : (
        <>
          <p role="status" className="sr-only">
            {szurt.length} attasé felel meg a szűrőknek.
          </p>
          <OsszesitoKartyak osszesito={osszesit(szurt)} />
          <Hoterkep
            csoportok={regionkent(szurt)}
            szuro={szuro}
            felev={felevSzam}
            nyitott={idoszak?.statusz === 'nyitott'}
          />
          <FokozatJelmagyarazat />
        </>
      )}
    </div>
  );
}
