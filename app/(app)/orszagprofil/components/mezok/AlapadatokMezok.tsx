'use client';

import { CimkeValaszto } from '../../../../../components/form/CimkeValaszto';
import { RovidMezo } from '../../../../../components/form/Mezo';
import { SzamMezo } from '../../../../../components/form/SzamMezo';
import { GAZDASAGI_AGAZATOK, MEZO_CIMKEK, ROVID_MAX, SZAM_MAX_HOSSZ, TAGSAGOK, type Alapadatok } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId, szamStr, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.alapadatok;
const B = 'alapadatok';

export function AlapadatokMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<Alapadatok>) {
  const [e, set] = useBlokkAllapot({
    ...initial,
    lakossag: szamStr(initial.lakossag), gdp: szamStr(initial.gdp), gdpEgyFore: szamStr(initial.gdpEgyFore),
    gdpNovekedes: szamStr(initial.gdpNovekedes), adatEv: szamStr(initial.adatEv),
  });
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <SzamMezo id={mezoId(B, 'lakossag')} name="lakossag" cimke={C.lakossag.cimke} value={e.lakossag} onChange={set('lakossag')} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="fő" />
            <SzamMezo id={mezoId(B, 'gdp')} name="gdp" cimke={C.gdp.cimke} value={e.gdp} onChange={set('gdp')} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="mrd USD" />
            <SzamMezo id={mezoId(B, 'gdpEgyFore')} name="gdpEgyFore" cimke={C.gdpEgyFore.cimke} value={e.gdpEgyFore} onChange={set('gdpEgyFore')} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="USD" />
            <SzamMezo id={mezoId(B, 'gdpNovekedes')} name="gdpNovekedes" cimke={C.gdpNovekedes.cimke} value={e.gdpNovekedes} onChange={set('gdpNovekedes')} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="%" />
            <SzamMezo id={mezoId(B, 'adatEv')} name="adatEv" cimke={C.adatEv.cimke} sugo={C.adatEv.sugo} value={e.adatEv} onChange={set('adatEv')} errors={errors} maxHossz={SZAM_MAX_HOSSZ} />
            <RovidMezo id={mezoId(B, 'forras')} name="forras" cimke={C.forras.cimke} sugo={C.forras.sugo} value={e.forras} onChange={set('forras')} max={ROVID_MAX} errors={errors} />
          </div>
          <CimkeValaszto id={mezoId(B, 'tagsagok')} name="tagsagok" cimke={C.tagsagok.cimke} items={TAGSAGOK} value={e.tagsagok} onChange={set('tagsagok')} errors={errors}
            egyeb={{ id: mezoId(B, 'tagsagEgyeb'), name: 'tagsagEgyeb', cimke: C.tagsagEgyeb.cimke, value: e.tagsagEgyeb, onChange: set('tagsagEgyeb'), max: ROVID_MAX }} />
          <CimkeValaszto id={mezoId(B, 'agazatok')} name="agazatok" cimke={C.agazatok.cimke} items={GAZDASAGI_AGAZATOK} value={e.agazatok} onChange={set('agazatok')} errors={errors}
            egyeb={{ id: mezoId(B, 'agazatEgyeb'), name: 'agazatEgyeb', cimke: C.agazatEgyeb.cimke, value: e.agazatEgyeb, onChange: set('agazatEgyeb'), max: ROVID_MAX }} />
        </>
      )}
    </BlokkForm>
  );
}
