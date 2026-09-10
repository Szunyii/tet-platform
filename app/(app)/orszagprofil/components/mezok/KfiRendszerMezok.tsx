'use client';

import { CimkeValaszto } from '../../../../../components/form/CimkeValaszto';
import { RovidMezo, SzovegMezo } from '../../../../../components/form/Mezo';
import { SzamMezo } from '../../../../../components/form/SzamMezo';
import {
  IPARAGAK, KFI_PRIORITASOK, MEZO_CIMKEK, ROVID_MAX, SZOVEG_MAX, type KfiRendszer,
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
          <SzovegMezo id={mezoId(B, 'teljesitmeny')} name="teljesitmeny" cimke={C.teljesitmeny.cimke} sugo={C.teljesitmeny.sugo} value={e.teljesitmeny} onChange={set('teljesitmeny')} max={SZOVEG_MAX} errors={errors} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SzamMezo id={mezoId(B, 'gerd')} name="gerd" cimke={C.gerd.cimke} value={e.gerd} onChange={set('gerd')} errors={errors} utotag="%" />
            <RovidMezo id={mezoId(B, 'strategia')} name="strategia" cimke={C.strategia.cimke} sugo={C.strategia.sugo} value={e.strategia} onChange={set('strategia')} max={ROVID_MAX} errors={errors} />
          </div>
          <CimkeValaszto id={mezoId(B, 'prioritasok')} name="prioritasok" cimke={C.prioritasok.cimke} items={KFI_PRIORITASOK} value={e.prioritasok} onChange={set('prioritasok')} errors={errors}
            egyeb={{ id: mezoId(B, 'prioritasEgyeb'), name: 'prioritasEgyeb', cimke: C.prioritasEgyeb.cimke, value: e.prioritasEgyeb, onChange: set('prioritasEgyeb'), max: ROVID_MAX }} />
          <CimkeValaszto id={mezoId(B, 'kiemeltIparagak')} name="kiemeltIparagak" cimke={C.kiemeltIparagak.cimke} sugo={C.kiemeltIparagak.sugo} items={IPARAGAK} value={e.kiemeltIparagak} onChange={set('kiemeltIparagak')} errors={errors}
            egyeb={{ id: mezoId(B, 'iparagEgyeb'), name: 'iparagEgyeb', cimke: C.iparagEgyeb.cimke, value: e.iparagEgyeb, onChange: set('iparagEgyeb'), max: ROVID_MAX }} />
          <SzovegMezo id={mezoId(B, 'erossegek')} name="erossegek" cimke={C.erossegek.cimke} value={e.erossegek} onChange={set('erossegek')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'kihivasok')} name="kihivasok" cimke={C.kihivasok.cimke} value={e.kihivasok} onChange={set('kihivasok')} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}
