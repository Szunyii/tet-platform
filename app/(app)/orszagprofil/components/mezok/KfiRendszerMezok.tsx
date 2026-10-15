'use client';

import { CimkeValaszto } from '../../../../../components/form/CimkeValaszto';
import { RovidMezo, SzovegMezo } from '../../../../../components/form/Mezo';
import { SzamMezo } from '../../../../../components/form/SzamMezo';
import {
  AGAZATOK, KFI_PRIORITASOK, MEZO_CIMKEK, ROVID_MAX, SZAM_MAX_HOSSZ, SZOVEG_MAX, type KfiRendszer,
} from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, szamStr, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.kfiRendszer;
const B = 'kfiRendszer';

export function KfiRendszerMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<KfiRendszer>) {
  const { mezo } = useBlokkAllapot(B, { ...initial, gerd: szamStr(initial.gerd) });
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <SzovegMezo {...mezo('teljesitmeny')} {...C.teljesitmeny} max={SZOVEG_MAX} errors={errors} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SzamMezo {...mezo('gerd')} {...C.gerd} errors={errors} maxHossz={SZAM_MAX_HOSSZ} utotag="%" />
            <RovidMezo {...mezo('strategia')} {...C.strategia} max={ROVID_MAX} errors={errors} />
          </div>
          <CimkeValaszto {...mezo('prioritasok')} {...C.prioritasok} items={KFI_PRIORITASOK} errors={errors}
            egyeb={{ ...mezo('prioritasEgyeb'), ...C.prioritasEgyeb, max: ROVID_MAX }} />
          <CimkeValaszto {...mezo('kiemeltIparagak')} {...C.kiemeltIparagak} items={AGAZATOK} errors={errors}
            egyeb={{ ...mezo('iparagEgyeb'), ...C.iparagEgyeb, max: ROVID_MAX }} />
          <SzovegMezo {...mezo('erossegek')} {...C.erossegek} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo {...mezo('kihivasok')} {...C.kihivasok} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}
