'use client';

import { CimkeValaszto } from '../../../../../components/form/CimkeValaszto';
import { RovidMezo, SzovegMezo } from '../../../../../components/form/Mezo';
import { SzamMezo } from '../../../../../components/form/SzamMezo';
import {
  AGAZATOK, KFI_PRIORITASOK, MEZO_CIMKEK, ROVID_MAX, SZAM_MAX_HOSSZ, SZOVEG_MAX, type KfiRendszer,
} from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId, szamStr, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.kfiRendszer;
const B = 'kfiRendszer';

export function KfiRendszerMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<KfiRendszer>) {
  const [e, set] = useBlokkAllapot({ ...initial, gerd: szamStr(initial.gerd) });
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <SzovegMezo id={mezoId(B, 'teljesitmeny')} name="teljesitmeny" {...C.teljesitmeny} value={e.teljesitmeny} onChange={set('teljesitmeny')} max={SZOVEG_MAX} errors={errors} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SzamMezo id={mezoId(B, 'gerd')} name="gerd" {...C.gerd} value={e.gerd} onChange={set('gerd')} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="%" />
            <RovidMezo id={mezoId(B, 'strategia')} name="strategia" {...C.strategia} value={e.strategia} onChange={set('strategia')} max={ROVID_MAX} errors={errors} />
          </div>
          <CimkeValaszto id={mezoId(B, 'prioritasok')} name="prioritasok" {...C.prioritasok} items={KFI_PRIORITASOK} value={e.prioritasok} onChange={set('prioritasok')} errors={errors}
            egyeb={{ id: mezoId(B, 'prioritasEgyeb'), name: 'prioritasEgyeb', ...C.prioritasEgyeb, value: e.prioritasEgyeb, onChange: set('prioritasEgyeb'), max: ROVID_MAX }} />
          <CimkeValaszto id={mezoId(B, 'kiemeltIparagak')} name="kiemeltIparagak" {...C.kiemeltIparagak} items={AGAZATOK} value={e.kiemeltIparagak} onChange={set('kiemeltIparagak')} errors={errors}
            egyeb={{ id: mezoId(B, 'iparagEgyeb'), name: 'iparagEgyeb', ...C.iparagEgyeb, value: e.iparagEgyeb, onChange: set('iparagEgyeb'), max: ROVID_MAX }} />
          <SzovegMezo id={mezoId(B, 'erossegek')} name="erossegek" {...C.erossegek} value={e.erossegek} onChange={set('erossegek')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'kihivasok')} name="kihivasok" {...C.kihivasok} value={e.kihivasok} onChange={set('kihivasok')} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}
