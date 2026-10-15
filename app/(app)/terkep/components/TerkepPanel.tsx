'use client';

import { useApp } from '../../../../components/app-shell/AppContext';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { canEditProfil } from '../../../../lib/orszagprofil-jog';
import type { Csoport, Rangsor, Tartomany } from '../../../../lib/terkep-mutatok';
import { OsszehasonlitasCsik } from './OsszehasonlitasCsik';
import { ProfilKivonat } from './ProfilKivonat';
import { RangsorPanel } from './RangsorPanel';
import type { TerkepAllapot } from './useTerkepAllapot';

/**
 * A térkép melletti panel: `kod` → kivonat, különben rangsor; fölötte az összehasonlítás-csík, ha a
 * halmaz nem üres. Az összehasonlítás nem itt, hanem a térkép alatt, teljes szélességben van
 * (TerkepNezet): a kártyák és a mátrixok a keskeny panelen nem férnének el.
 */
export function TerkepPanel({ adatok, allapot, vsOrszagok, rangsor, csoportok, tartomany, szamlalo, ev, most, valasztEvAction }: {
  adatok: TerkepOrszag[];
  allapot: TerkepAllapot;
  /** A halmaz rekordjai a hozzáadás sorrendjében (a TerkepNezet számolja, az összehasonlításnak is kell). */
  vsOrszagok: TerkepOrszag[];
  rangsor: Rangsor | null;
  csoportok: Csoport[];
  tartomany: Tartomany | null;
  szamlalo: string;
  ev: number;
  most: number;
  valasztEvAction: (formData: FormData) => Promise<void>;
}) {
  const { user } = useApp();
  const { kod, vs, vsTele, mutato } = allapot;
  const sel = kod ? adatok.find((o) => o.kod === kod) ?? null : null;

  return (
    <>
      {vsOrszagok.length > 0 && (
        <OsszehasonlitasCsik orszagok={vsOrszagok} szinek={allapot.vsSzinek} minimum={allapot.vsMin} onKivesz={allapot.vsKivesz} />
      )}
      {sel ? (
        <ProfilKivonat
          o={sel}
          szerkeszthetEv={canEditProfil(user, sel.kod, ev, most)}
          szerkeszthetMost={canEditProfil(user, sel.kod, most, most)}
          most={most}
          valasztEvAction={valasztEvAction}
          onClose={allapot.bezar}
          mutato={mutato}
          rangsor={rangsor}
          benneVs={vs.includes(sel.kod)}
          vsTele={vsTele}
          onVs={() => allapot.vsValt(sel.kod)}
          viszonyitasiAlap={allapot.hazai?.kod === sel.kod}
        />
      ) : (
        <RangsorPanel
          mutato={mutato}
          rangsor={rangsor}
          csoportok={csoportok}
          tartomany={tartomany}
          szamlalo={szamlalo}
          vs={vs}
          vsTele={vsTele}
          onKivalaszt={allapot.kivalaszt}
          onVsToggle={allapot.vsValt}
        />
      )}
    </>
  );
}
