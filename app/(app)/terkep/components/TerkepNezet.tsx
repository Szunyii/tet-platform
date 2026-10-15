'use client';

import { useCallback, useMemo } from 'react';
import { useApp } from '../../../../components/app-shell/AppContext';
import { SzerkesztesGomb } from '../../../../components/orszagprofil/SzerkesztesGomb';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { elsoVezetettKod } from '../../../../lib/attase-orszag';
import { HAZAI_KOD } from '../../../../lib/orszagok';
import { canEditProfil } from '../../../../lib/orszagprofil-jog';
import {
  csoportok as szamolCsoportok, jeloltek, rangsor as szamolRangsor, szamlaloSzoveg, tartomany as szamolTartomany,
} from '../../../../lib/terkep-mutatok';
import { IparagSzuro } from './IparagSzuro';
import { MutatoValaszto } from './MutatoValaszto';
import { OsszehasonlitasPanel } from './OsszehasonlitasPanel';
import type { SzerkesztesGombFn } from './ProfilKivonat';
import { TerkepPanel } from './TerkepPanel';
import { useTerkepAllapot } from './useTerkepAllapot';
import { VilagTerkep } from './VilagTerkep';

export function TerkepNezet({
  adatok, ev, most, kezdoKod, valasztEvAction,
}: {
  adatok: TerkepOrszag[];
  /** A választott (nézett) év. */
  ev: number;
  /** Az aktuális év (a nem szerkeszthető évnézetből ide vált a SzerkesztesGomb). */
  most: number;
  kezdoKod: string | null;
  valasztEvAction: (formData: FormData) => Promise<void>;
}) {
  // A session a contextből: a jog-számítás (canEditProfil) és a „Saját országprofil" gomb is ebből dolgozik.
  // A gomb az első vezetett országra visz (a székhely előnyben); nem vezető attasénál nincs gomb.
  const { user } = useApp();
  const sajatKod = user.role === 'attase' ? elsoVezetettKod(user.orszagok) : null;
  const allapot = useTerkepAllapot(adatok, kezdoKod);
  const { mutato, iparag, vs } = allapot;

  // A rangsor/csoportok a szűrt halmazon, a tartomány (színskála) szándékosan a szűretlenen.
  const rangsor = useMemo(() => (mutato.tipus === 'szam' ? szamolRangsor(adatok, mutato, iparag) : null), [adatok, mutato, iparag]);
  const csoportok = useMemo(() => (mutato.tipus === 'kategoria' ? szamolCsoportok(adatok, mutato, iparag) : []), [adatok, mutato, iparag]);
  const tartomany = useMemo(() => (mutato.tipus === 'szam' ? szamolTartomany(adatok, mutato) : null), [adatok, mutato]);
  // Az összehasonlítás-halmaz rekordjai és a „+ Ország" jelöltjei; a `vs` csak tényleges változásnál új példány.
  const vsOrszagok = useMemo(
    () => vs.map((k) => adatok.find((o) => o.kod === k)).filter((o): o is TerkepOrszag => !!o),
    [adatok, vs],
  );
  // Magyarország mindig viszonyítási alap, ezért a „+ Ország" jelöltjei között sincs.
  const jeloltLista = useMemo(() => jeloltek(adatok, [...vs, HAZAI_KOD], mutato), [adatok, vs, mutato]);
  const szamlalo = szamlaloSzoveg(adatok, rangsor, iparag, ev);
  // A Szerkesztés-gomb jogát a nézett (ev) és az aktuális (most) évre számoljuk; egyszer kötjük meg, a
  // fejléc, a panel és a kivonat csak az országot és a feliratokat adja hozzá.
  const szerkesztesGomb = useCallback<SzerkesztesGombFn>(
    (kod, opciok) => (
      <SzerkesztesGomb
        kod={kod}
        most={most}
        szerkeszthetEv={canEditProfil(user, kod, ev, most)}
        szerkeszthetMost={canEditProfil(user, kod, most, most)}
        action={valasztEvAction}
        {...opciok}
      />
    ),
    [user, ev, most, valasztEvAction],
  );

  return (
    <div className="flex max-w-[1600px] flex-col gap-4">
      <div className="flex flex-wrap items-start gap-4">
        <Card className="min-w-0 flex-[1_1_560px] overflow-hidden">
          <CardHeader className="flex flex-wrap items-center gap-3">
            <MutatoValaszto mutato={mutato} onChange={allapot.setMutatoKulcs} />
            <IparagSzuro iparag={iparag} onChange={allapot.setIparag} />
            {/* A számláló szöveg a rangsor-panel alcíme (nem duplázzuk a fejlécben). */}
            {sajatKod && szerkesztesGomb(sajatKod, { felirat: 'Saját országprofil', className: 'ml-auto' })}
          </CardHeader>
          <CardContent className="p-0">
            <VilagTerkep
              adatok={adatok}
              mutato={mutato}
              iparag={iparag}
              kivalasztott={allapot.kod}
              osszehasonlitas={vs}
              tartomany={tartomany}
              csoportok={csoportok}
              rangsor={rangsor}
              onSelect={allapot.kivalaszt}
            />
          </CardContent>
        </Card>
        <div className="flex min-w-0 max-w-[420px] flex-[1_1_330px] flex-col gap-4">
          <TerkepPanel
            adatok={adatok}
            allapot={allapot}
            vsOrszagok={vsOrszagok}
            rangsor={rangsor}
            csoportok={csoportok}
            tartomany={tartomany}
            szamlalo={szamlalo}
            szerkesztesGomb={szerkesztesGomb}
          />
        </div>
      </div>
      {/* Az összehasonlítás a térkép alatt, teljes szélességben: a keskeny panelen nem férne el. Magyar
          profil mellett (viszonyítási alap) már 1 országtól látszik (`vsMin`). */}
      {vsOrszagok.length >= allapot.vsMin && (
        <OsszehasonlitasPanel
          orszagok={vsOrszagok}
          szinek={allapot.vsSzinek}
          hazai={allapot.hazai}
          jeloltek={jeloltLista}
          mutato={mutato}
          tele={allapot.vsTele}
          onKivalaszt={allapot.kivalaszt}
          onKivesz={allapot.vsKivesz}
          onHozzaad={allapot.vsHozzaad}
          onTorol={allapot.vsTorol}
        />
      )}
    </div>
  );
}
