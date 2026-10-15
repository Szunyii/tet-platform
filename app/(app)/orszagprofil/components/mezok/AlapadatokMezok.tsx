'use client';

import { CimkeValaszto } from '../../../../../components/form/CimkeValaszto';
import { RovidMezo } from '../../../../../components/form/Mezo';
import { SzamMezo } from '../../../../../components/form/SzamMezo';
import { AGAZATOK, MEZO_CIMKEK, ROVID_MAX, SZAM_MAX_HOSSZ, TAGSAGOK, type Alapadatok } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, szamStr, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.alapadatok;
const B = 'alapadatok';

export function AlapadatokMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<Alapadatok>) {
  const { mezo } = useBlokkAllapot(B, {
    ...initial,
    terulet: szamStr(initial.terulet),
    lakossag: szamStr(initial.lakossag), gdp: szamStr(initial.gdp), gdpEgyFore: szamStr(initial.gdpEgyFore),
    gdpNovekedes: szamStr(initial.gdpNovekedes), adatEv: szamStr(initial.adatEv),
  });
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <RovidMezo {...mezo('fovaros')} {...C.fovaros} max={ROVID_MAX} errors={errors} />
            <RovidMezo {...mezo('penznem')} {...C.penznem} max={ROVID_MAX} errors={errors} />
            <SzamMezo {...mezo('terulet')} {...C.terulet} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="km²" />
            <SzamMezo {...mezo('lakossag')} {...C.lakossag} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="fő" />
            <SzamMezo {...mezo('gdp')} {...C.gdp} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="mrd USD" />
            <SzamMezo {...mezo('gdpEgyFore')} {...C.gdpEgyFore} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="USD" />
            <SzamMezo {...mezo('gdpNovekedes')} {...C.gdpNovekedes} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="%" />
            <SzamMezo {...mezo('adatEv')} {...C.adatEv} errors={errors} maxHossz={SZAM_MAX_HOSSZ} />
            <div className="sm:col-span-2">
              <RovidMezo {...mezo('forras')} {...C.forras} max={ROVID_MAX} errors={errors} />
            </div>
          </div>
          <CimkeValaszto {...mezo('tagsagok')} {...C.tagsagok} items={TAGSAGOK} errors={errors}
            egyeb={{ ...mezo('tagsagEgyeb'), ...C.tagsagEgyeb, max: ROVID_MAX }} />
          <CimkeValaszto {...mezo('agazatok')} {...C.agazatok} items={AGAZATOK} errors={errors}
            egyeb={{ ...mezo('agazatEgyeb'), ...C.agazatEgyeb, max: ROVID_MAX }} />
        </>
      )}
    </BlokkForm>
  );
}
